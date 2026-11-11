<?php

/*
 * SPDX-License-Identifier: BSD-2-Clause
 * Copyright (C) 2026 Inversa Bilişim
 */

namespace OPNsense\InversaPanel\Api;

use OPNsense\Base\ApiControllerBase;
use OPNsense\Core\Backend;
use OPNsense\Core\Config;
use OPNsense\InversaPanel\InversaPanel;

/**
 * Devices seen on the protected networks, merged with what the user saved about them.
 */
class DevicesController extends ApiControllerBase
{
    /* a host seen by host discovery within this window counts as online */
    const ONLINE_WINDOW = 600;
    /* a host that is asked if it is there (see hosts.py) counts as online this long after its last sign of life */
    const PROBE_WINDOW = 120;

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

        return ['source' => $source, 'devices' => array_values($result)];
    }
}
