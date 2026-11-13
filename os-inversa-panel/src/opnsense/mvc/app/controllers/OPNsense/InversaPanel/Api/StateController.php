<?php

/*
 * SPDX-License-Identifier: BSD-2-Clause
 * Copyright (C) 2026 Inversa Bilişim
 */

namespace OPNsense\InversaPanel\Api;

use OPNsense\Base\ApiControllerBase;
use OPNsense\InversaPanel\Catalog;
use OPNsense\InversaPanel\Dhcp;
use OPNsense\InversaPanel\Dns;
use OPNsense\InversaPanel\InversaPanel;
use OPNsense\InversaPanel\Rollback;
use OPNsense\InversaPanel\Scan;

/**
 * Read the complete Inversa Panel configuration in the shape the single page UI uses.
 */
class StateController extends ApiControllerBase
{
    public function getAction()
    {
        $mdl = new InversaPanel();
        if ($mdl->migrateNetworks()) {
            $mdl->serializeToConfig(false, true);
            \OPNsense\Core\Config::getInstance()->save();
        }

        $devices = [];
        foreach ($mdl->devices->device->iterateItems() as $device) {
            $devices[(string)$device->mac] = [
                'name' => (string)$device->name,
                'type' => (string)$device->type,
                'blocked' => !$device->blocked->isEmpty(),
                'approved' => !$device->approved->isEmpty(),
                /* approved for a while: until when (0: for good) */
                'until' => (int)(string)$device->approved_until,
                'rejected' => !$device->rejected->isEmpty(),
            ];
        }

        $filtering = [];
        foreach (array_merge(array_keys(Catalog::CATEGORIES), ['safesearch', 'forcedns']) as $key) {
            $filtering[$key] = !$mdl->filtering->$key->isEmpty();
        }
        $filtering['apps'] = $mdl->filtering->apps->getValues();
        $filtering['allowlist'] = $mdl->filtering->allowlist->getValues();
        $filtering['denylist'] = $mdl->filtering->denylist->getValues();
        $filtering['response'] = (string)$mdl->filtering->response;

        $interfaces = [];
        foreach ($mdl->general->interfaces->getNodeData() as $key => $option) {
            /* protecting the uplink makes no sense, keep it out of the choices */
            if ($key === 'wan') {
                continue;
            }
            $interfaces[] = ['key' => $key, 'name' => $option['value'], 'selected' => !empty($option['selected']), 'color' => $mdl->networkColor($key)];
        }

        $apps = [];
        foreach ($mdl->filtering->apps->getNodeData() as $key => $option) {
            $apps[] = ['key' => $key, 'name' => $option['value']];
        }

        $schedules = [];
        foreach ($mdl->schedules->schedule->iterateItems() as $uuid => $node) {
            $schedules[] = [
                'uuid' => $uuid,
                'enabled' => !$node->enabled->isEmpty(),
                'name' => (string)$node->name,
                'devices' => $node->devices->getValues(),
                'days' => array_map('intval', $node->days->getValues()),
                'start' => (string)$node->start,
                'end' => (string)$node->end,
                'action' => (string)$node->action,
                'apps' => $node->apps->getValues(),
            ];
        }
        $access = [];
        foreach ($mdl->access->rule->iterateItems() as $node) {
            $access[(string)$node->from . '>' . (string)$node->to] = !$node->allow->isEmpty();
        }
        $kinds = [];
        $approval = [];
        foreach ($mdl->networks->network->iterateItems() as $node) {
            $kinds[(string)$node->interface] = (string)$node->kind;
            if (!$node->approval->isEmpty()) {
                $approval[(string)$node->interface] = true;
            }
        }

        $reservations = [];
        $dhcpNets = [];
        if (class_exists('\OPNsense\Dnsmasq\Dnsmasq')) {
            $dnsmasq = new \OPNsense\Dnsmasq\Dnsmasq();
            foreach (Dhcp::reservations($dnsmasq) as $mac => $r) {
                $reservations[$mac] = $r['ip'];
            }
            foreach (Dhcp::servedNetworks($dnsmasq) as $key => list($cidr, $gw, $from, $to)) {
                $dhcpNets[] = ['key' => $key, 'cidr' => $cidr, 'gateway' => $gw, 'from' => $from, 'to' => $to];
            }
        }

        $unbound = new \OPNsense\Unbound\Unbound();

        return [
            'general' => [
                'enabled' => !$mdl->general->enabled->isEmpty(),
                'language' => (string)$mdl->general->language,
                'interfaces' => $mdl->getProtectedInterfaces(),
                'dnsstats' => !$mdl->general->dnsstats->isEmpty(),
                'welcomed' => !$mdl->general->welcomed->isEmpty(),
                /* the version whose "what is new" was seen */
                'news' => (string)$mdl->general->news,
                'idwatch' => (string)$mdl->general->idwatch,
            ],
            /* device identity watch: another lease script in dnsmasq (ours is then not set up), no dnsmasq drop-ins */
            'idwatch' => [
                'conflict' => \OPNsense\InversaPanel\Identity::conflict(),
                'possible' => is_dir(\OPNsense\InversaPanel\Identity::CONF_DIR),
            ],
            'version' => Catalog::VERSION,
            'devices' => (object)$devices,
            /* fixed addresses (Dnsmasq hosts) and the networks they can be in */
            'reservations' => (object)$reservations,
            'filtering' => $filtering,
            'schedules' => $schedules,
            'access' => (object)$access,
            'kinds' => (object)$kinds,
            /* networks on which new devices wait for approval */
            'approval' => (object)$approval,
            'guest' => [
                'limit' => !$mdl->guest->limit->isEmpty(),
                'down' => (int)(string)$mdl->guest->down,
                'up' => (int)(string)$mdl->guest->up,
            ],
            'geo' => [
                'enabled' => !$mdl->geo->enabled->isEmpty(),
                'direction' => (string)$mdl->geo->direction,
                'countries' => $mdl->geo->countries->getValues(),
                'mode' => (string)$mdl->geo->mode,
                'allowed' => $mdl->geo->allowed->getValues(),
                'vpnexempt' => !$mdl->geo->vpnexempt->isEmpty(),
            ],
            'ips' => [
                'enabled' => !$mdl->ips->enabled->isEmpty(),
                'mode' => (string)$mdl->ips->mode,
                'groups' => $mdl->ips->groups->getValues(),
            ],
            'vpn' => [
                'mode' => (string)$mdl->vpn->mode,
                'endpoint' => (string)$mdl->vpn->endpoint,
            ],
            /* servers the firewall asks, and the local names (Unbound host overrides) Inversa Panel manages */
            'dns' => [
                'upstream' => (string)$mdl->dns->upstream,
                'servers' => array_values(array_filter($mdl->dns->servers->getValues())),
                'dot' => !$mdl->dns->dot->isEmpty(),
                'tlsname' => (string)$mdl->dns->tlsname,
                'records' => Dns::records($unbound),
            ],
            /* a change that waits for its confirmation (seconds left), see Rollback */
            'rollback' => Rollback::pending(),
            'options' => [
                'interfaces' => $interfaces,
                'apps' => $apps,
                'dhcp_networks' => $dhcpNets,
                'dns_presets' => Catalog::DNS_PRESETS,
                /* address overrides made in OPNsense itself, and why the servers cannot be chosen here (if so) */
                'dns_foreign' => Dns::foreign($unbound),
                'dns_locked' => Dns::locked($unbound),
            ],
        ];
    }

    /**
     * what this firewall held before the panel: see Scan
     */
    public function scanAction()
    {
        return ['findings' => Scan::report(new InversaPanel())];
    }

    /**
     * for the About page: this version, and what it runs on
     */
    public function aboutAction()
    {
        $product = json_decode((string)(new \OPNsense\Core\Backend())->configdRun('firmware product'), true) ?? [];
        return [
            'version' => Catalog::VERSION,
            'product' => (string)($product['product_name'] ?? 'OPNsense'),
            'product_version' => (string)($product['product_version'] ?? ''),
            'parts' => $this->partVersions((string)($product['product_version'] ?? '')),
        ];
    }

    /**
     * the installed versions of what the panel is built on; '' where it is not installed
     */
    private function partVersions($opnsense)
    {
        $parts = ['OPNsense' => $opnsense, 'Unbound' => '', 'Suricata' => '', 'WireGuard' => '', 'strongSwan' => '', 'DB-IP' => ''];
        $names = ['unbound' => 'Unbound', 'suricata' => 'Suricata', 'strongswan' => 'strongSwan'];
        $lines = [];
        exec('/usr/sbin/pkg query "%n %v" ' . implode(' ', array_keys($names)) . ' 2>/dev/null', $lines);
        foreach ($lines as $line) {
            $pair = explode(' ', trim($line), 2);
            if (count($pair) === 2 && isset($names[$pair[0]])) {
                $parts[$names[$pair[0]]] = $pair[1];
            }
        }
        /* WireGuard is part of the system: its tools say the version */
        $out = [];
        exec('/usr/bin/wg --version 2>/dev/null', $out);
        if (preg_match('/v([0-9][0-9.]*)/', (string)($out[0] ?? ''), $match)) {
            $parts['WireGuard'] = $match[1];
        }
        /* the country data is a database: the month it is of */
        $stats = @json_decode((string)@file_get_contents('/usr/local/share/GeoIP/inversapanel-dbip.json'), true);
        if (is_array($stats) && preg_match('/^[0-9]{4}-[0-9]{2}$/', (string)($stats['month'] ?? ''))) {
            $parts['DB-IP'] = $stats['month'];
        }
        return $parts;
    }
}
