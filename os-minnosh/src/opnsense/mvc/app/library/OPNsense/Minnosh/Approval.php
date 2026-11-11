<?php

/*
 * SPDX-License-Identifier: BSD-2-Clause
 * Copyright (C) 2026 Inversa Bilişim
 */

namespace OPNsense\Minnosh;

use OPNsense\Core\Backend;
use OPNsense\Core\Config;

/**
 * Approval of new devices. On a network with "approval" on, a device that is not approved yet
 * reaches nothing but the firewall itself (DHCP, DNS, this GUI): no internet, no other network.
 * The rule lives in plugins.inc.d/minnosh.inc, approved devices in the MAC alias
 * "minnosh_approved" (Integration::syncAlias).
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
            $live = json_decode((string)(new Backend())->configdpRun('minnosh hosts', ['-']), true);
            foreach ($live['hosts'] ?? [] as $host) {
                if (isset($ifmap[$host['interface']])) {
                    self::$hosts[] = ['mac' => strtolower($host['mac']), 'ips' => $host['ips'], 'key' => $ifmap[$host['interface']]];
                }
            }
        }
        return self::$hosts;
    }

    /**
     * addresses held back right now: on a network with approval, device not approved
     */
    public static function heldIps(Minnosh $mdl)
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
     * Approval was just switched on for $networks: every device seen there so far counts as
     * approved, so switching it on never cuts off the devices already in use (including the
     * one this request comes from). Only devices that show up later have to wait.
     * @return int number of devices approved
     */
    public static function approveExisting(Minnosh $mdl, array $networks)
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
