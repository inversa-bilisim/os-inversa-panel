<?php

/*
 * SPDX-License-Identifier: BSD-2-Clause
 * Copyright (C) 2026 Inversa Bilişim
 */

namespace OPNsense\InversaPanel;

use OPNsense\Core\Backend;
use OPNsense\Core\Config;

/**
 * Approval of new devices. On a network with "approval" on, a device that is not approved yet
 * reaches nothing but the firewall itself (DHCP, DNS, this GUI): no internet, no other network.
 * The rule lives in plugins.inc.d/inversapanel.inc, approved devices in the MAC alias
 * "inversapanel_approved" (Integration::syncAlias).
 *
 * Limits, also told to the user: approval goes by MAC address, and traffic between two devices
 * on the same switch / access point never passes the firewall.
 */
class Approval
{
    private static $hosts = null;

    /**
     * hosts seen on the network right now: [[mac, ips, key], ...], key = interface key
     */
    public static function hosts()
    {
        if (self::$hosts === null) {
            $ifmap = [];
            foreach (Config::getInstance()->object()->interfaces->children() as $key => $node) {
                if (!empty((string)$node->if)) {
                    $ifmap[(string)$node->if] = $key;
                }
            }
            self::$hosts = [];
            /* "-": only read what is known, do not ask the devices */
            $live = json_decode((string)(new Backend())->configdpRun('inversapanel hosts', ['-']), true);
            foreach ($live['hosts'] ?? [] as $host) {
                if (isset($ifmap[$host['interface']])) {
                    self::$hosts[] = ['mac' => strtolower($host['mac']), 'ips' => $host['ips'], 'key' => $ifmap[$host['interface']]];
                }
            }
        }
        return self::$hosts;
    }

    /* the next hosts() asks again (watch.php looks several times a minute) */
    public static function forget()
    {
        self::$hosts = null;
    }

    /**
     * addresses held back right now: on a network with approval, device not approved
     */
    public static function heldIps(InversaPanel $mdl)
    {
        $networks = $mdl->getApprovalInterfaces();
        if (empty($networks)) {
            return [];
        }
        $approved = $mdl->getApprovedMacs();
        $ips = [];
        foreach (self::hosts() as $host) {
            if (in_array($host['key'], $networks) && !in_array($host['mac'], $approved)) {
                $ips = array_merge($ips, $host['ips']);
            }
        }
        return array_values(array_unique($ips));
    }

    /**
     * A decision about one device, effective at once (not part of "Apply"), like a pause:
     * allow it until $until (unix time, 0: for good), or turn it away. A device turned away stays held back
     * exactly as before; it is only no longer counted or announced as waiting.
     * @return int unix time the permission ends, 0 when it does not
     */
    public static function decide(InversaPanel $mdl, $mac, $allow, $until = 0)
    {
        $node = $mdl->getDeviceByMac($mac);
        if ($node === null) {
            $node = $mdl->devices->device->Add();
            $node->mac->setValue($mac);
        }
        $wasApproved = in_array($mac, $mdl->getApprovedMacs());
        $until = $allow ? (int)$until : 0;
        $node->approved->setValue($allow ? '1' : '0');
        $node->approved_until->setValue($until > 0 ? (string)$until : '');
        $node->rejected->setValue($allow ? '0' : '1');
        self::store($mdl, $wasApproved && !$allow ? [$mac] : []);
        return $until;
    }

    /**
     * Ends the approvals whose time is up: the device waits again, and is announced again
     * (scripts/.../watch.php). Runs every minute from schedule.php.
     * @return array MAC addresses that lost their permission
     */
    public static function expire(InversaPanel $mdl)
    {
        $now = time();
        $ended = [];
        foreach ($mdl->devices->device->iterateItems() as $node) {
            $until = (int)(string)$node->approved_until;
            if ($until > 0 && $until <= $now) {
                $node->approved_until->setValue('');
                if (!$node->approved->isEmpty()) {
                    $node->approved->setValue('0');
                    $ended[] = (string)$node->mac;
                }
            }
        }
        if (!empty($ended)) {
            self::store($mdl, $ended);
        }
        return $ended;
    }

    /**
     * writes the devices and the alias of approved devices, refreshes the alias table; the open
     * connections of $cut (MAC addresses) end, otherwise they would keep working until timeout
     */
    public static function store(InversaPanel $mdl, array $cut)
    {
        $aliasMdl = (new Integration($mdl))->syncAlias();
        $mdl->serializeToConfig(false, true);
        $aliasMdl->serializeToConfig(false, true);
        Config::getInstance()->save();
        $backend = new Backend();
        /* the alias tables are filled from the generated alias list, not from config.xml */
        $backend->configdRun('template reload OPNsense/Filter');
        $backend->configdRun('filter refresh_aliases');
        $ips = [];
        foreach (self::hosts() as $host) {
            if (in_array($host['mac'], $cut)) {
                $ips = array_merge($ips, $host['ips']);
            }
        }
        $ips = array_filter($ips, fn($ip) => filter_var($ip, FILTER_VALIDATE_IP));
        if (!empty($ips)) {
            $backend->configdpRun('inversapanel killstates', [implode(',', $ips)]);
        }
    }

    /**
     * Approval was just switched on for $networks: every device seen there so far counts as
     * approved, so switching it on never cuts off the devices already in use (including the
     * one this request comes from). Only devices that show up later have to wait.
     * @return int number of devices approved
     */
    public static function approveExisting(InversaPanel $mdl, array $networks)
    {
        $count = 0;
        if (empty($networks)) {
            return $count;
        }
        foreach (self::hosts() as $host) {
            if (!in_array($host['key'], $networks) || !preg_match('/^([0-9a-f]{2}:){5}[0-9a-f]{2}$/', $host['mac'])) {
                continue;
            }
            $node = $mdl->getDeviceByMac($host['mac']);
            if ($node === null) {
                $node = $mdl->devices->device->Add();
                $node->mac->setValue($host['mac']);
            }
            if ($node->approved->isEmpty()) {
                $node->approved->setValue('1');
                $count++;
            }
        }
        return $count;
    }
}
