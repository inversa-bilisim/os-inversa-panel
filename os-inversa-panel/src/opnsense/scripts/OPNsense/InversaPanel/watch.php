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
 *    of a remote access connection coming in, a new device (waiting for approval or not), a restart
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

/* ---- devices never seen before on a protected network (where approval is on, "waiting" says it already) */
$protected = $mdl->getProtectedInterfaces();
$seen = array_flip($old['seen'] ?? []);
$learning = !isset($old['seen']);
foreach (Approval::hosts() as $host) {
    if (!in_array($host['key'], $protected) || isset($seen[$host['mac']])) {
        continue;
    }
    if (!$first && !$learning && !in_array($host['key'], $networks)) {
        Overview::event('device_new', ['mac' => $host['mac'], 'net' => $host['key']]);
    }
    $seen[$host['mac']] = true;
}
$new['seen'] = array_slice(array_keys($seen), -5000);

/*
 * health of the firewall itself: a disk that fills up, a processor that runs hot, an OPNsense update
 * that waits. Told once when it starts; the disk and the heat must fall well below the mark before
 * they are told again. The update is looked at twice an hour (nothing is fetched, see Overview::system).
 */
$health = $old['health'] ?? ['disk' => false, 'temp' => false, 'update' => false, 'checked' => 0];
$total = @disk_total_space('/');
$free = @disk_free_space('/');
if ($total > 0 && $free !== false) {
    $used = (int)round(($total - $free) / $total * 100);
    if (!$health['disk'] && $used >= 90) {
        $health['disk'] = true;
        if (!$first) {
            Overview::event('health_disk', ['v' => $used]);
        }
    } elseif ($health['disk'] && $used < 85) {
        $health['disk'] = false;
    }
}
$warmest = null;
$lines = [];
exec('/sbin/sysctl -a 2>/dev/null | /usr/bin/grep -E "^(dev\.cpu\.[0-9]+\.temperature|hw\.acpi\.thermal\.tz[0-9]+\.temperature):"', $lines);
foreach ($lines as $line) {
    if (preg_match('/: (-?\d+(?:\.\d+)?)C/', $line, $m)) {
        $warmest = max($warmest ?? -273, (float)$m[1]);
    }
}
if ($warmest !== null) {
    if (!$health['temp'] && $warmest >= 85) {
        $health['temp'] = true;
        if (!$first) {
            Overview::event('health_temp', ['v' => (int)round($warmest)]);
        }
    } elseif ($health['temp'] && $warmest < 75) {
        $health['temp'] = false;
    }
}
if ($now - (int)($health['checked'] ?? 0) >= 1800) {
    $health['checked'] = $now;
    $product = json_decode((string)$backend->configdRun('firmware product'), true) ?? [];
    $pending = false;
    foreach (['upgrade_sets', 'new_packages', 'reinstall_packages', 'upgrade_packages'] as $key) {
        $pending = $pending || !empty($product['product_check'][$key]);
    }
    if ($pending && !$health['update'] && !$first) {
        Overview::event('health_update', []);
    }
    $health['update'] = $pending;
}
$new['health'] = $health;

if (!is_dir(Overview::DIR)) {
    mkdir(Overview::DIR, 0755, true);
}
file_put_contents(Overview::WATCH . '.tmp', json_encode($new));
rename(Overview::WATCH . '.tmp', Overview::WATCH);
Overview::trimEvents();
