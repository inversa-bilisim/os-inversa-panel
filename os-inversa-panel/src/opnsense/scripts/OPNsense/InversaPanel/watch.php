#!/usr/local/bin/php
<?php

/*
 * SPDX-License-Identifier: BSD-2-Clause
 * Copyright (C) 2026 Inversa Bilişim
 *
 * Runs every minute (inversapanel_cron) and writes down what the overview page shows but
 * OPNsense does not keep:
 *  - how much went over the internet connection today
 *  - what happened: internet connection lost / back, a VPN connection made or lost, a device
 *    of a remote access connection coming in, a new device waiting for approval, a restart
 * Nothing is changed on the firewall; the first run only remembers how things are.
 */

require_once('config.inc');

use OPNsense\Core\Backend;
use OPNsense\InversaPanel\Approval;
use OPNsense\InversaPanel\InversaPanel;
use OPNsense\InversaPanel\Overview;
use OPNsense\InversaPanel\Vpn;

Overview::timezone();
$backend = new Backend();
$mdl = new InversaPanel();
$now = time();
$old = Overview::watchState();
$first = $old === null;
$old = $old ?? [];
$new = [];

/* ---- restart */
$new['boot'] = Overview::bootTime();
if (!$first && !empty($old['boot']) && $new['boot'] - $old['boot'] > 30) {
    Overview::event('boot', [], $new['boot']);
}

/* ---- processor ticks, the overview compares against them */
$new['cpu'] = Overview::cpuTicks();

/* ---- data used today on the internet connection(s) */
$counters = Overview::counters($backend);
$totals = ['in' => 0, 'out' => 0];
foreach (Overview::wanKeys() as $key) {
    $totals['in'] += (int)($counters[$key]['inbytes'] ?? 0);
    $totals['out'] += (int)($counters[$key]['outbytes'] ?? 0);
}
$day = date('Y-m-d');
$usage = $old['usage'] ?? ['day' => $day, 'in' => 0, 'out' => 0, 'from' => $now];
if ($usage['day'] !== $day) {
    $usage = ['day' => $day, 'in' => 0, 'out' => 0, 'from' => strtotime('today')];
}
if (isset($old['counters'])) {
    foreach (['in', 'out'] as $dir) {
        $delta = $totals[$dir] - (int)$old['counters'][$dir];
        /* counters start again after a restart or when the interface is created anew */
        $usage[$dir] += $delta >= 0 ? $delta : $totals[$dir];
    }
}
$new['usage'] = $usage;
$new['counters'] = $totals;

/* ---- internet connection */
$up = Vpn::wanAddress() !== '';
$new['wan_up'] = $up;
$new['wan_since'] = $up ? (!empty($old['wan_since']) ? $old['wan_since'] : $now) : 0;
if (!$first && isset($old['wan_up']) && $old['wan_up'] !== $up) {
    Overview::event($up ? 'wan_up' : 'wan_down');
}

/* ---- VPN */
$new['vpn'] = [];
foreach (Overview::vpn($mdl) as $conn) {
    $was = $old['vpn'][$conn['id']] ?? null;
    $entry = ['on' => $conn['connected'], 'peers' => $was['peers'] ?? []];
    if ($conn['kind'] === 'site') {
        if ($was !== null && $conn['enabled'] && $was['on'] !== $conn['connected']) {
            Overview::event($conn['connected'] ? 'vpn_up' : 'vpn_down', ['name' => $conn['name']]);
        }
    } else {
        foreach ($conn['online'] as $peer) {
            /* a phone that was quiet for a few minutes did not "connect" again */
            if ($was !== null && $now - (int)($entry['peers'][$peer] ?? 0) > 900) {
                Overview::event('peer_on', ['name' => $peer, 'conn' => $conn['name']]);
            }
            $entry['peers'][$peer] = $now;
        }
        $entry['peers'] = array_filter($entry['peers'], fn($seen) => $now - $seen < 86400);
    }
    $new['vpn'][$conn['id']] = $entry;
}

/* ---- devices held back until somebody approves them */
$networks = $mdl->getApprovalInterfaces();
$approved = $mdl->getApprovedMacs();
$known = $old['waiting'] ?? [];
$new['waiting'] = [];
if (!empty($networks)) {
    foreach (Approval::hosts() as $host) {
        if (in_array($host['key'], $networks) && !in_array($host['mac'], $approved)) {
            if (!$first && !in_array($host['mac'], $known)) {
                Overview::event('device_wait', ['mac' => $host['mac'], 'net' => $host['key']]);
            }
            $new['waiting'][] = $host['mac'];
        }
    }
    /* announced once: a device that left and came back unapproved is not news */
    foreach ($known as $mac) {
        if (!in_array($mac, $approved) && !in_array($mac, $new['waiting'])) {
            $new['waiting'][] = $mac;
        }
    }
    $new['waiting'] = array_slice($new['waiting'], -500);
}

if (!is_dir(Overview::DIR)) {
    mkdir(Overview::DIR, 0755, true);
}
file_put_contents(Overview::WATCH . '.tmp', json_encode($new));
rename(Overview::WATCH . '.tmp', Overview::WATCH);
Overview::trimEvents();
