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
use OPNsense\Core\Config;
use OPNsense\InversaPanel\Approval;
use OPNsense\InversaPanel\Forgotten;
use OPNsense\InversaPanel\Identity;
use OPNsense\InversaPanel\InversaPanel;
use OPNsense\InversaPanel\Overview;
use OPNsense\InversaPanel\Vpn;

/**
 * New devices on the protected networks: "waiting" for the ones held back until somebody approves
 * them, "new" for the others (where approval is on, "waiting" says it already). Told once.
 * @return array [waiting MACs, seen MACs, number of events written]
 */
function watch_devices(InversaPanel $mdl, array $known, $seenBefore, $first)
{
    $told = 0;
    $networks = $mdl->getApprovalInterfaces();
    $approved = $mdl->getApprovedMacs();
    /* turned away: held back, but not news */
    $rejected = [];
    foreach ($mdl->devices->device->iterateItems() as $device) {
        if (!$device->rejected->isEmpty()) {
            $rejected[] = (string)$device->mac;
        }
    }
    $waiting = [];
    if (!empty($networks)) {
        foreach (Approval::hosts() as $host) {
            if (in_array($host['key'], $networks) && !in_array($host['mac'], $approved)) {
                if (!$first && !in_array($host['mac'], $known) && !in_array($host['mac'], $rejected)) {
                    Overview::event('device_wait', ['mac' => $host['mac'], 'net' => $host['key']]);
                    $told++;
                }
                $waiting[] = $host['mac'];
            }
        }
        /* announced once: a device that left and came back unapproved is not news */
        foreach ($known as $mac) {
            if (!in_array($mac, $approved) && !in_array($mac, $waiting)) {
                $waiting[] = $mac;
            }
        }
        $waiting = array_slice($waiting, -500);
    }

    $protected = $mdl->getProtectedInterfaces();
    $seen = array_flip($seenBefore ?? []);
    $learning = $seenBefore === null;
    foreach (Approval::hosts() as $host) {
        if (!in_array($host['key'], $protected) || isset($seen[$host['mac']])) {
            continue;
        }
        if (!$first && !$learning && !in_array($host['key'], $networks)) {
            Overview::event('device_new', ['mac' => $host['mac'], 'net' => $host['key']]);
            $told++;
        }
        $seen[$host['mac']] = true;
    }
    return [$waiting, array_slice(array_keys($seen), -5000), $told];
}

/**
 * devices deleted on the Devices page since the last look ($done): no longer known, so they are
 * told again when they come back
 * @return array [waiting MACs, seen MACs, time of the newest deletion handled]
 */
function drop_forgotten(array $waiting, $seen, $done)
{
    $latest = $done;
    foreach (Forgotten::all() as $mac => $when) {
        if ((int)$when > $done) {
            $waiting = array_values(array_diff($waiting, [$mac]));
            $seen = $seen === null ? null : array_values(array_diff($seen, [$mac]));
            $latest = max($latest, (int)$when);
        }
    }
    return [$waiting, $seen, $latest];
}

/* device identity watch (Identity.php): what dnsmasq noted since the last look; returns the number of changes told */
function watch_identity(InversaPanel $mdl)
{
    try {
        return Identity::process($mdl, Approval::hosts());
    } catch (\Exception $e) {
        syslog(LOG_ERR, 'inversapanel: identity watch: ' . $e->getMessage());
        return 0;
    }
}

/* a new device is told by Telegram right away, not with the next minute */
function tell_now($told)
{
    if ($told > 0) {
        exec('/usr/local/sbin/configctl -d inversapanel notify run > /dev/null 2>&1');
    }
}

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

/* ---- devices: held back until somebody approves them, or never seen before */
list($known, $seenBefore, $new['forgot']) = drop_forgotten($old['waiting'] ?? [], $old['seen'] ?? null, (int)($old['forgot'] ?? 0));
list($new['waiting'], $new['seen'], $told) = watch_devices($mdl, $known, $seenBefore, $first);

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
$told += watch_identity($mdl);
tell_now($told);

/*
 * The rest of the minute: look for new devices every 15 seconds, so that a device waiting for
 * approval is told within seconds of showing up. Settings are read again each time (somebody may
 * have just approved it); the next run takes over at the full minute.
 */
while (!$first && time() - $now < 40) {
    sleep(15);
    Config::getInstance()->forceReload();
    Approval::forget();
    $mdl = new InversaPanel();
    list($known, $seenBefore, $forgot) = drop_forgotten($new['waiting'], $new['seen'], $new['forgot']);
    list($waiting, $seen, $told) = watch_devices($mdl, $known, $seenBefore, false);
    if ($told > 0 || $waiting !== $new['waiting'] || $seen !== $new['seen'] || $forgot !== $new['forgot']) {
        $new['waiting'] = $waiting;
        $new['seen'] = $seen;
        $new['forgot'] = $forgot;
        file_put_contents(Overview::WATCH . '.tmp', json_encode($new));
        rename(Overview::WATCH . '.tmp', Overview::WATCH);
    }
    $told += watch_identity($mdl);
    tell_now($told);
}
