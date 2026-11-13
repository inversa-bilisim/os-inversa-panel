<?php

/*
 * SPDX-License-Identifier: BSD-2-Clause
 * Copyright (C) 2026 Inversa Bilişim
 */

namespace OPNsense\InversaPanel\Api;

use OPNsense\Base\ApiControllerBase;
use OPNsense\Core\Backend;
use OPNsense\Core\Config;
use OPNsense\InversaPanel\Approval;
use OPNsense\InversaPanel\Dhcp;
use OPNsense\InversaPanel\Forgotten;
use OPNsense\InversaPanel\Identity;
use OPNsense\InversaPanel\InversaPanel;
use OPNsense\InversaPanel\Pause;
use OPNsense\InversaPanel\Rollback;

/**
 * Devices seen on the protected networks, merged with what the user saved about them.
 */
class DevicesController extends ApiControllerBase
{
    /* a host seen by host discovery within this window counts as online */
    const ONLINE_WINDOW = 600;
    /* a host that is asked if it is there (see hosts.py) counts as online this long after its last sign of life */
    const PROBE_WINDOW = 120;
    /* an approval for a while ends within 30 days; longer is "for good" */
    const LONGEST_APPROVAL = 30 * 86400;

    public function listAction()
    {
        $mdl = new InversaPanel();

        /* OS device name (igb1, vlan0.20, ...) => interface key/description, protected networks only */
        $protected = $mdl->getProtectedInterfaces();
        $ifmap = [];
        foreach (Config::getInstance()->object()->interfaces->children() as $key => $node) {
            if (in_array($key, $protected) && !empty((string)$node->if)) {
                $ifmap[(string)$node->if] = [
                    'key' => $key,
                    'name' => !empty((string)$node->descr) ? (string)$node->descr : strtoupper($key),
                ];
            }
        }

        /* devices on the protected networks are asked if they are there, nothing is sent anywhere else */
        $live = json_decode((new Backend())->configdpRun('inversapanel hosts', [empty($ifmap) ? '-' : implode(',', array_keys($ifmap))]), true);
        $source = $live['source'] ?? null;
        $now = time();

        $paused = Pause::all();
        $result = [];
        foreach ($live['hosts'] ?? [] as $host) {
            if (!isset($ifmap[$host['interface']])) {
                continue;
            }
            $lastSeen = !empty($host['last_seen']) ? strtotime($host['last_seen']) : false;
            if (!empty($host['probe'])) {
                /* it answers when asked, or was just heard: the arp table and open states outlive a device that left */
                $online = $now - (int)($host['alive'] ?? 0) < self::PROBE_WINDOW ||
                    ($lastSeen !== false && $now - $lastSeen < self::PROBE_WINDOW);
            } else {
                /* host discovery only refreshes last_seen on new activity, an idle but present host is still online */
                $online = $source !== 'discovery' || !empty($host['in_arp']) || !empty($host['states']) ||
                    ($lastSeen !== false && $now - $lastSeen < self::ONLINE_WINDOW);
            }
            $result[$host['mac']] = [
                'mac' => $host['mac'],
                'ips' => $host['ips'],
                'network' => $ifmap[$host['interface']]['name'],
                'network_key' => $ifmap[$host['interface']]['key'],
                'vendor' => $host['vendor'] ?? '',
                'hostname' => $host['hostname'] ?? '',
                'first_seen' => $host['first_seen'] ?? '',
                'last_seen' => $host['last_seen'] ?? '',
                'online' => $online,
                'states' => $host['states'] ?? 0,
                /* false: the address in use did not come from DHCP, the device set it itself */
                'dhcp' => !empty($host['dhcp']),
            ];
        }

        /* saved devices that are currently not visible are still listed (e.g. blocked tablet that is off) */
        foreach ($mdl->devices->device->iterateItems() as $device) {
            $mac = (string)$device->mac;
            if (!isset($result[$mac])) {
                $result[$mac] = [
                    'mac' => $mac, 'ips' => [], 'network' => '', 'network_key' => '', 'vendor' => '', 'hostname' => '',
                    'first_seen' => '', 'last_seen' => '', 'online' => false, 'states' => 0, 'dhcp' => false,
                ];
            }
        }

        /* cut off for a while: until when (0: not); what the identity watch knows about it */
        $ids = Identity::summary();
        foreach ($result as $mac => $row) {
            $result[$mac]['paused'] = (int)($paused[$mac] ?? 0);
            $result[$mac]['identity'] = $ids[$mac] ?? null;
        }

        return ['source' => $source, 'devices' => array_values($result)];
    }

    /**
     * cuts a device off for a while, right away (not part of "Apply"); it comes back by itself
     */
    public function pauseAction()
    {
        if (!$this->request->isPost()) {
            return ['status' => 'failed'];
        }
        $this->throwReadOnly();
        $mac = strtolower((string)$this->request->getPost('mac'));
        if (!preg_match('/^([0-9a-f]{2}:){5}[0-9a-f]{2}$/', $mac)) {
            return ['status' => 'failed', 'message' => 'mac'];
        }
        if ((string)$this->request->getPost('until') === 'morning') {
            /* seven in the morning by the firewall's clock: today if that is still to come */
            $tz = (string)Config::getInstance()->object()->system->timezone;
            $when = new \DateTime('today 07:00', new \DateTimeZone($tz !== '' ? $tz : 'UTC'));
            if ($when->getTimestamp() <= time()) {
                $when->modify('+1 day');
            }
            $until = $when->getTimestamp();
        } else {
            $minutes = (int)$this->request->getPost('minutes');
            if ($minutes < 1 || $minutes > 1440) {
                return ['status' => 'failed', 'message' => 'minutes'];
            }
            $until = time() + $minutes * 60;
        }
        $until = Pause::set($mac, $until);
        (new Backend())->configdRun('inversapanel schedule');
        return ['status' => 'ok', 'paused' => $until];
    }

    /**
     * a device waiting for approval: let it in (hours = 1, 24, 168 or 0 for good; or until = "midnight"
     * or a unix time, at most LONGEST_APPROVAL ahead) or turn it away; right away, not part of "Apply" (see Approval::decide)
     */
    public function decideAction()
    {
        if (!$this->request->isPost()) {
            return ['status' => 'failed'];
        }
        /* letting a device onto the network is the same level as "Apply" */
        $this->throwReadOnly();
        $this->throwNotFullAdmin();
        $mac = strtolower((string)$this->request->getPost('mac'));
        if (!preg_match('/^([0-9a-f]{2}:){5}[0-9a-f]{2}$/', $mac)) {
            return ['status' => 'failed', 'message' => 'mac'];
        }
        $decision = (string)$this->request->getPost('decision');
        $hours = (int)$this->request->getPost('hours');
        if (!in_array($decision, ['allow', 'reject']) || !in_array($hours, [0, 1, 24, 168])) {
            return ['status' => 'failed', 'message' => 'decision'];
        }
        $until = $hours > 0 ? time() + $hours * 3600 : 0;
        $asked = (string)$this->request->getPost('until');
        if ($asked === 'midnight') {
            /* the coming midnight by the firewall's clock */
            $tz = (string)Config::getInstance()->object()->system->timezone;
            $until = (new \DateTime('tomorrow 00:00', new \DateTimeZone($tz !== '' ? $tz : 'UTC')))->getTimestamp();
        } elseif ($asked !== '') {
            $until = (int)$asked;
            if ($until < time() + 60 || $until > time() + self::LONGEST_APPROVAL + 300) {
                return ['status' => 'failed', 'message' => 'until'];
            }
        }
        /* a change waiting for its confirmation would take this one along when it is put back */
        if (Rollback::pending() !== null) {
            return ['status' => 'failed', 'pending_confirm' => true];
        }
        $until = Approval::decide(new InversaPanel(), $mac, $decision === 'allow', $until);
        return ['status' => 'ok', 'until' => $until];
    }

    /**
     * deletes a device: what was saved about it (name, type, internet cut, approval), its fixed
     * address, its place in schedules, a pause. Right away, not part of "Apply". It drops out of the
     * list; if it shows up again it is a new device (on a network that asks, it waits for approval).
     */
    public function forgetAction()
    {
        if (!$this->request->isPost()) {
            return ['status' => 'failed'];
        }
        /* it can take away an approval: same level as "Apply" */
        $this->throwReadOnly();
        $this->throwNotFullAdmin();
        $mac = strtolower((string)$this->request->getPost('mac'));
        if (!preg_match('/^([0-9a-f]{2}:){5}[0-9a-f]{2}$/', $mac)) {
            return ['status' => 'failed', 'message' => 'mac'];
        }
        if (Rollback::pending() !== null) {
            return ['status' => 'failed', 'pending_confirm' => true];
        }
        $mdl = new InversaPanel();
        $wasApproved = in_array($mac, $mdl->getApprovedMacs());
        foreach ($mdl->devices->device->iterateItems() as $uuid => $device) {
            if ((string)$device->mac === $mac) {
                $mdl->devices->device->del($uuid);
            }
        }
        foreach ($mdl->schedules->schedule->iterateItems() as $sched) {
            $list = $sched->devices->getValues();
            if (in_array($mac, array_map('strtolower', $list))) {
                $sched->devices->setValue(implode(',', array_filter($list, fn($m) => strtolower($m) !== $mac)));
            }
        }
        $dhcpChanged = false;
        if (class_exists('\OPNsense\Dnsmasq\Dnsmasq')) {
            $dnsmasq = new \OPNsense\Dnsmasq\Dnsmasq();
            if (Dhcp::set($dnsmasq, $mac, '')) {
                $problems = Dhcp::store($dnsmasq);
                if (!empty($problems)) {
                    return ['status' => 'failed', 'message' => implode(' ', $problems)];
                }
                $dhcpChanged = true;
            }
        }
        Pause::clear($mac);
        Identity::forget($mac);
        /* writes the devices and both MAC aliases, ends the open connections when it was let in before */
        Approval::store($mdl, $wasApproved ? [$mac] : []);
        /* after that: the device's addresses are looked up there, the list leaves it out from now on */
        Forgotten::add($mac);
        $backend = new Backend();
        if ($dhcpChanged) {
            $backend->configdRun('dnsmasq restart');
        }
        $backend->configdRun('inversapanel schedule');
        return ['status' => 'ok'];
    }

    /**
     * after an identity alert: "this is mine", the identity seen last becomes the known one
     */
    public function idacceptAction()
    {
        if (!$this->request->isPost()) {
            return ['status' => 'failed'];
        }
        $this->throwReadOnly();
        $mac = strtolower((string)$this->request->getPost('mac'));
        if (!preg_match('/^([0-9a-f]{2}:){5}[0-9a-f]{2}$/', $mac)) {
            return ['status' => 'failed', 'message' => 'mac'];
        }
        return ['status' => Identity::accept($mac) ? 'ok' : 'failed'];
    }

    /**
     * Wake-on-LAN: the "magic packet" for a device, on every protected network
     */
    public function wakeAction()
    {
        if (!$this->request->isPost()) {
            return ['status' => 'failed'];
        }
        $mac = strtolower((string)$this->request->getPost('mac'));
        if (!preg_match('/^([0-9a-f]{2}:){5}[0-9a-f]{2}$/', $mac)) {
            return ['status' => 'failed', 'message' => 'mac'];
        }
        $ports = [];
        $protected = (new InversaPanel())->getProtectedInterfaces();
        foreach (Config::getInstance()->object()->interfaces->children() as $key => $node) {
            if (in_array($key, $protected) && !empty((string)$node->if)) {
                $ports[] = (string)$node->if;
            }
        }
        if (empty($ports)) {
            return ['status' => 'failed', 'message' => 'nonet'];
        }
        $sent = (int)trim((string)(new Backend())->configdpRun('inversapanel wake', [implode(',', $ports), $mac]));
        return ['status' => $sent > 0 ? 'ok' : 'failed'];
    }

    public function resumeAction()
    {
        if (!$this->request->isPost()) {
            return ['status' => 'failed'];
        }
        $this->throwReadOnly();
        $mac = strtolower((string)$this->request->getPost('mac'));
        if (!preg_match('/^([0-9a-f]{2}:){5}[0-9a-f]{2}$/', $mac)) {
            return ['status' => 'failed', 'message' => 'mac'];
        }
        Pause::clear($mac);
        (new Backend())->configdRun('inversapanel schedule');
        return ['status' => 'ok'];
    }
}
