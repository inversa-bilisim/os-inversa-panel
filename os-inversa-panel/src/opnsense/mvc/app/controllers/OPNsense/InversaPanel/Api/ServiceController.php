<?php

/*
 * SPDX-License-Identifier: BSD-2-Clause
 * Copyright (C) 2026 Inversa Bilişim
 */

namespace OPNsense\InversaPanel\Api;

use OPNsense\Base\ApiControllerBase;
use OPNsense\Base\UserException;
use OPNsense\InversaPanel\Approval;
use OPNsense\InversaPanel\Catalog;
use OPNsense\InversaPanel\Dhcp;
use OPNsense\InversaPanel\Integration;
use OPNsense\InversaPanel\InversaPanel;
use OPNsense\InversaPanel\Ips;

/**
 * "Apply" button: store all pending UI changes at once and push them into OPNsense.
 */
class ServiceController extends ApiControllerBase
{
    const DEVICE_TYPES = ['phone', 'tablet', 'laptop', 'tv', 'console', 'printer', 'iot', 'server', 'unknown'];

    private static function flag($value)
    {
        return !empty($value) && $value !== 'false' ? '1' : '0';
    }

    private static function stringList($value)
    {
        if (!is_array($value)) {
            return [];
        }
        return array_values(array_unique(array_filter(array_map(
            fn($item) => strtolower(trim((string)$item)),
            $value
        ))));
    }

    /**
     * the welcome card was answered: remember it right away (whatever else is still pending)
     */
    public function welcomedAction()
    {
        if (!$this->request->isPost()) {
            return ['status' => 'failed'];
        }
        $this->throwReadOnly();
        $mdl = new InversaPanel();
        $mdl->general->welcomed->setValue('1');
        /* only this flag changes: don't let an unrelated validation problem block it */
        $mdl->serializeToConfig(false, true);
        \OPNsense\Core\Config::getInstance()->save();
        return ['status' => 'ok'];
    }

    /**
     * interface language is a UI preference: store it immediately, nothing to apply
     */
    public function languageAction()
    {
        if (!$this->request->isPost()) {
            return ['status' => 'failed'];
        }
        $this->throwReadOnly();
        $mdl = new InversaPanel();
        $mdl->general->language->setValue((string)$this->request->getPost('language'));
        $validations = [];
        foreach ($mdl->performValidation() as $msg) {
            $validations[$msg->getField()] = $msg->getMessage();
        }
        if (!empty($validations)) {
            return ['status' => 'failed', 'validations' => $validations];
        }
        $mdl->serializeToConfig();
        \OPNsense\Core\Config::getInstance()->save();
        return ['status' => 'ok'];
    }

    /**
     * Remove what Inversa Panel added behind the scenes (aliases, DNS policies, shaper objects, attack protection) and switch
     * Inversa Panel off, which also removes its automatic firewall rules. Port forwards, networks and VPN
     * devices are things the user explicitly created and still uses: they stay.
     */
    public function cleanupAction()
    {
        if (!$this->request->isPost()) {
            return ['status' => 'failed'];
        }
        $this->throwReadOnly();
        $this->throwNotFullAdmin();

        $mdl = new InversaPanel();
        $mdl->general->enabled->setValue('0');
        $aliases = new \OPNsense\Firewall\Alias();
        foreach (iterator_to_array($aliases->aliases->alias->iterateItems()) as $uuid => $node) {
            if (in_array((string)$node->name, [Catalog::BLOCKED_ALIAS, Catalog::APPROVED_ALIAS, Catalog::GEO_ALIAS])) {
                $aliases->aliases->alias->del($uuid);
            }
        }
        $unbound = new \OPNsense\Unbound\Unbound();
        foreach (iterator_to_array($unbound->dnsbl->blocklist->iterateItems()) as $uuid => $node) {
            $descr = (string)$node->description;
            if ($descr === Catalog::DNSBL_POLICY || strpos($descr, Catalog::SCHED_POLICY_PREFIX) === 0) {
                $unbound->dnsbl->blocklist->del($uuid);
            }
        }
        $shaper = new \OPNsense\TrafficShaper\TrafficShaper();
        foreach (['rules' => 'rule', 'pipes' => 'pipe'] as $section => $item) {
            foreach (iterator_to_array($shaper->$section->$item->iterateItems()) as $uuid => $node) {
                if (strpos((string)$node->description, Catalog::SHAPER_PREFIX) === 0) {
                    $shaper->$section->$item->del($uuid);
                }
            }
        }
        /* attack protection: Suricata off and the "drop" policy gone, if Inversa Panel had switched it on */
        $ipsWasOn = !$mdl->ips->enabled->isEmpty();
        $mdl->ips->enabled->setValue('0');
        $ips = Ips::sync($mdl, $ipsWasOn);
        $mdl->serializeToConfig(false, true);
        $aliases->serializeToConfig(false, true);
        $unbound->serializeToConfig(false, true);
        $shaper->serializeToConfig(false, true);
        if ($ips !== null) {
            $ips['ids']->serializeToConfig(false, true);
        }
        \OPNsense\Core\Config::getInstance()->save();

        $backend = new \OPNsense\Core\Backend();
        $backend->configdRun('filter reload');
        exec('/sbin/pfctl -t inversapanel_sched -T flush > /dev/null 2>&1');
        \OPNsense\InversaPanel\Extras::applyShaper();
        $backend->configdRun('template reload OPNsense/Unbound/*');
        $backend->configdRun('inversapanel dnsbl', true);
        if ($ips !== null) {
            Ips::reconfigure();
        }
        return ['status' => 'ok'];
    }

    /**
     * schedules, access matrix, network kinds, guest limit, country blocking, attack protection,
     * vpn preferences
     * @param bool $ipsForeign intrusion detection runs without Inversa Panel: its settings stay untouched
     */
    private function applyExtended(InversaPanel $mdl, $ipsForeign = false)
    {
        $schedules = $this->request->getPost('schedules');
        if (is_array($schedules)) {
            $keep = [];
            foreach ($schedules as $item) {
                if (!is_array($item)) {
                    continue;
                }
                $uuid = (string)($item['uuid'] ?? '');
                $node = $uuid !== '' ? $mdl->getNodeByReference('schedules.schedule.' . $uuid) : null;
                if ($node === null) {
                    $node = $mdl->schedules->schedule->Add();
                    $uuid = $node->getAttributes()['uuid'];
                }
                $keep[] = $uuid;
                $node->enabled->setValue(self::flag($item['enabled'] ?? true));
                $node->name->setValue(trim((string)($item['name'] ?? '')));
                $node->devices->setValue(implode(',', self::stringList($item['devices'] ?? [])));
                $node->days->setValue(implode(',', array_filter(array_map('intval', (array)($item['days'] ?? [])))));
                $node->start->setValue((string)($item['start'] ?? ''));
                $node->end->setValue((string)($item['end'] ?? ''));
                $node->action->setValue((string)($item['action'] ?? 'cut'));
                $node->apps->setValue(implode(',', self::stringList($item['apps'] ?? [])));
            }
            foreach (array_keys(iterator_to_array($mdl->schedules->schedule->iterateItems())) as $uuid) {
                if (!in_array($uuid, $keep)) {
                    $mdl->schedules->schedule->del($uuid);
                }
            }
        }

        $access = $this->request->getPost('access');
        if (is_array($access)) {
            foreach (array_keys(iterator_to_array($mdl->access->rule->iterateItems())) as $uuid) {
                $mdl->access->rule->del($uuid);
            }
            foreach ($access as $pair => $allow) {
                $parts = explode('>', (string)$pair);
                if (count($parts) === 2) {
                    $node = $mdl->access->rule->Add();
                    $node->from->setValue($parts[0]);
                    $node->to->setValue($parts[1]);
                    $node->allow->setValue(self::flag($allow));
                }
            }
        }

        $kinds = $this->request->getPost('kinds');
        if (is_array($kinds)) {
            foreach ($kinds as $key => $kind) {
                $found = null;
                foreach ($mdl->networks->network->iterateItems() as $node) {
                    if ((string)$node->interface === (string)$key) {
                        $found = $node;
                    }
                }
                if ($found === null) {
                    $found = $mdl->networks->network->Add();
                    $found->interface->setValue((string)$key);
                }
                $found->kind->setValue((string)$kind);
            }
        }

        /* approval of new devices per network: key => on/off, networks not mentioned stay as they are */
        $approval = $this->request->getPost('approval');
        if (is_array($approval)) {
            foreach ($approval as $key => $on) {
                $found = null;
                foreach ($mdl->networks->network->iterateItems() as $node) {
                    if ((string)$node->interface === (string)$key) {
                        $found = $node;
                    }
                }
                if ($found === null) {
                    if (self::flag($on) === '0') {
                        continue;
                    }
                    $found = $mdl->networks->network->Add();
                    $found->interface->setValue((string)$key);
                }
                $found->approval->setValue(self::flag($on));
            }
        }

        foreach (['guest' => ['limit' => 'flag', 'down' => 'int', 'up' => 'int'],
                  'geo' => ['enabled' => 'flag', 'direction' => 'str'],
                  'ips' => ['enabled' => 'flag', 'mode' => 'str'],
                  'vpn' => ['mode' => 'str', 'endpoint' => 'str']] as $section => $fields) {
            $data = $this->request->getPost($section);
            if (!is_array($data) || ($section === 'ips' && $ipsForeign)) {
                continue;
            }
            foreach ($fields as $field => $kind) {
                if (array_key_exists($field, $data)) {
                    $value = $kind === 'flag' ? self::flag($data[$field]) : ($kind === 'int' ? (string)(int)$data[$field] : trim((string)$data[$field]));
                    $mdl->$section->$field->setValue($value);
                }
            }
            if ($section === 'geo' && isset($data['countries'])) {
                $mdl->geo->countries->setValue(implode(',', array_map('strtoupper', self::stringList($data['countries']))));
            }
            if ($section === 'ips' && isset($data['groups'])) {
                $mdl->ips->groups->setValue(implode(',', self::stringList($data['groups'])));
            }
        }

        $general = $this->request->getPost('general');
        if (is_array($general) && isset($general['welcomed'])) {
            $mdl->general->welcomed->setValue(self::flag($general['welcomed']));
        }
    }

    public function applyAction()
    {
        if (!$this->request->isPost()) {
            return ['status' => 'failed'];
        }
        /* Inversa Panel writes firewall aliases, rules and DNS policy: same level as editing those directly */
        $this->throwReadOnly();
        $this->throwNotFullAdmin();

        $mdl = new InversaPanel();
        /* approval of new devices: what was held back before this change, to see who is newly held back */
        $approvalBefore = $mdl->getApprovalInterfaces();
        $heldBefore = Approval::heldIps($mdl);
        /* attack protection: only an intrusion detection Inversa Panel switched on is ours to change */
        $ipsWasOn = !$mdl->ips->enabled->isEmpty();
        $ipsForeign = Ips::foreign($mdl);

        $general = $this->request->getPost('general');
        if (is_array($general)) {
            if (isset($general['enabled'])) {
                $mdl->general->enabled->setValue(self::flag($general['enabled']));
            }
            if (isset($general['language'])) {
                $mdl->general->language->setValue((string)$general['language']);
            }
            if (isset($general['interfaces'])) {
                $mdl->general->interfaces->setValue(implode(',', self::stringList($general['interfaces'])));
            }
            if (isset($general['dnsstats'])) {
                $mdl->general->dnsstats->setValue(self::flag($general['dnsstats']));
            }
        }

        $filtering = $this->request->getPost('filtering');
        if (is_array($filtering)) {
            foreach (array_merge(array_keys(Catalog::CATEGORIES), ['safesearch', 'forcedns']) as $key) {
                if (isset($filtering[$key])) {
                    $mdl->filtering->$key->setValue(self::flag($filtering[$key]));
                }
            }
            if (isset($filtering['apps'])) {
                $mdl->filtering->apps->setValue(implode(',', self::stringList($filtering['apps'])));
            }
            foreach (['allowlist', 'denylist'] as $key) {
                if (isset($filtering[$key])) {
                    $mdl->filtering->$key->setValue(implode(',', self::stringList($filtering[$key])));
                }
            }
            if (isset($filtering['response'])) {
                $mdl->filtering->response->setValue((string)$filtering['response']);
            }
        }

        $devices = $this->request->getPost('devices');
        if (is_array($devices)) {
            foreach ($devices as $mac => $props) {
                $mac = strtolower((string)$mac);
                if (!preg_match('/^([0-9a-f]{2}:){5}[0-9a-f]{2}$/', $mac) || !is_array($props)) {
                    continue;
                }
                $node = $mdl->getDeviceByMac($mac);
                if ($node === null) {
                    $node = $mdl->devices->device->Add();
                    $node->mac->setValue($mac);
                }
                if (isset($props['name'])) {
                    $node->name->setValue(trim((string)$props['name']));
                }
                if (isset($props['type']) && in_array($props['type'], self::DEVICE_TYPES)) {
                    $node->type->setValue($props['type']);
                }
                if (isset($props['blocked'])) {
                    $node->blocked->setValue(self::flag($props['blocked']));
                }
                if (isset($props['approved'])) {
                    $node->approved->setValue(self::flag($props['approved']));
                }
            }
        }

        $this->applyExtended($mdl, $ipsForeign);
        /* networks that just started to ask for approval: the devices already there keep working */
        $autoApproved = Approval::approveExisting($mdl, array_diff($mdl->getApprovalInterfaces(), $approvalBefore));

        $validations = [];
        foreach ($mdl->performValidation() as $msg) {
            $validations[$msg->getField()] = $msg->getMessage();
        }
        if (!empty($validations)) {
            return ['status' => 'failed', 'validations' => $validations];
        }

        /* fixed addresses: mac => ip ('' = remove), stored as Dnsmasq hosts */
        $reservations = $this->request->getPost('reservations');
        $dhcpChanged = false;
        if (is_array($reservations) && !empty($reservations) && class_exists('\OPNsense\Dnsmasq\Dnsmasq')) {
            $dnsmasq = new \OPNsense\Dnsmasq\Dnsmasq();
            try {
                foreach ($reservations as $mac => $ip) {
                    $node = $mdl->getDeviceByMac(strtolower((string)$mac));
                    $name = $node !== null ? (string)$node->name : '';
                    $dhcpChanged = Dhcp::set($dnsmasq, (string)$mac, (string)$ip, $name) || $dhcpChanged;
                }
            } catch (\InvalidArgumentException $e) {
                return ['status' => 'failed', 'validations' => ['reservations' => $e->getMessage()]];
            }
            $problems = Dhcp::store($dnsmasq);
            if (!empty($problems)) {
                return ['status' => 'failed', 'validations' => ['reservations' => implode(' ', $problems)]];
            }
        }

        try {
            $result = (new Integration($mdl))->apply([
                'geo_license' => trim((string)$this->request->getPost('geo_license')),
                'kill' => array_diff(Approval::heldIps($mdl), $heldBefore),
                'ips_was_on' => $ipsWasOn,
            ]);
            $result['auto_approved'] = $autoApproved;
        } catch (\Exception $e) {
            throw new UserException($e->getMessage(), 'Inversa Panel');
        }
        if ($dhcpChanged) {
            (new \OPNsense\Core\Backend())->configdRun('dnsmasq restart');
        }
        return $result;
    }
}
