<?php

/*
 * SPDX-License-Identifier: BSD-2-Clause
 * Copyright (C) 2026 Inversa Bilişim
 */

namespace OPNsense\Minnosh\Api;

use OPNsense\Base\ApiControllerBase;
use OPNsense\Core\Backend;
use OPNsense\Core\Config;
use OPNsense\Minnosh\Minnosh;

/**
 * Devices seen on the protected networks, merged with what the user saved about them.
 */
class DevicesController extends ApiControllerBase
{
    /* a host seen by host discovery within this window counts as online */
    const ONLINE_WINDOW = 600;

    public function listAction()
    {
        $mdl = new Minnosh();

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

        $live = json_decode((new Backend())->configdRun('minnosh hosts'), true);
        $source = $live['source'] ?? null;
        $now = time();

        $result = [];
        foreach ($live['hosts'] ?? [] as $host) {
            if (!isset($ifmap[$host['interface']])) {
                continue;
            }
            $lastSeen = !empty($host['last_seen']) ? strtotime($host['last_seen']) : false;
            $online = $source !== 'discovery' || ($lastSeen !== false && $now - $lastSeen < self::ONLINE_WINDOW);
            $result[$host['mac']] = [
                'mac' => $host['mac'],
                'ips' => $host['ips'],
                'network' => $ifmap[$host['interface']]['name'],
                'vendor' => $host['vendor'] ?? '',
                'hostname' => $host['hostname'] ?? '',
                'first_seen' => $host['first_seen'] ?? '',
                'last_seen' => $host['last_seen'] ?? '',
                'online' => $online,
                'states' => $host['states'] ?? 0,
            ];
        }

        /* saved devices that are currently not visible are still listed (e.g. blocked tablet that is off) */
        foreach ($mdl->devices->device->iterateItems() as $device) {
            $mac = (string)$device->mac;
            if (!isset($result[$mac])) {
                $result[$mac] = [
                    'mac' => $mac, 'ips' => [], 'network' => '', 'vendor' => '', 'hostname' => '',
                    'first_seen' => '', 'last_seen' => '', 'online' => false, 'states' => 0,
                ];
            }
        }

        return ['source' => $source, 'devices' => array_values($result)];
    }
}
