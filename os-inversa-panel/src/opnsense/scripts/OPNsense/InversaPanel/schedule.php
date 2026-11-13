#!/usr/local/bin/php
<?php

/*
 * SPDX-License-Identifier: BSD-2-Clause
 * Copyright (C) 2026 Inversa Bilişim
 *
 * Runs every minute (inversapanel_cron) and right after "Apply":
 *  - "cut internet" schedules: current IPs of their devices go into pf table <inversapanel_sched>
 *    (blocked by a rule from inversapanel_firewall), existing states of newly cut devices are killed
 *  - devices paused for a while on the Devices page are cut the same way until their time is up
 *  - devices approved for a while lose the approval when their time is up (Approval::expire)
 *  - "block apps" schedules: one Unbound blocklist policy per schedule, limited to the devices'
 *    addresses, enabled only while the schedule is active; rewritten only when that changes
 */

require_once('config.inc');

use OPNsense\Core\Backend;
use OPNsense\Core\Config;
use OPNsense\InversaPanel\Approval;
use OPNsense\InversaPanel\Catalog;
use OPNsense\InversaPanel\InversaPanel;
use OPNsense\InversaPanel\Overview;
use OPNsense\InversaPanel\Pause;
use OPNsense\Unbound\Unbound;

$state_file = '/var/run/inversapanel_schedule.json';
$previous = is_file($state_file) ? (json_decode(file_get_contents($state_file), true) ?: []) : [];

$tz = (string)Config::getInstance()->object()->system->timezone;
date_default_timezone_set($tz !== '' ? $tz : 'UTC');
$minute = (int)date('G') * 60 + (int)date('i');
$today = (int)date('N');
$yesterday = $today === 1 ? 7 : $today - 1;

function to_minutes($hhmm)
{
    list($h, $m) = array_map('intval', explode(':', $hhmm));
    return $h * 60 + $m;
}

/* mac => [ip, ...] from host discovery / arp */
$hosts = [];
$listing = json_decode(shell_exec('/usr/local/opnsense/scripts/interfaces/list_hosts.py -n 2>/dev/null'), true);
foreach ($listing['rows'] ?? [] as $row) {
    if (count($row) >= 3 && filter_var($row[2], FILTER_VALIDATE_IP)) {
        $hosts[strtolower($row[1])][] = $row[2];
    }
}

$mdl = new InversaPanel();
try {
    Approval::expire($mdl);
} catch (\Exception $e) {
    syslog(LOG_ERR, 'inversapanel: schedule could not end approvals: ' . $e->getMessage());
}
$enabled = !$mdl->general->enabled->isEmpty();
$cut_ips = [];
$app_policies = [];
$running = [];
foreach ($mdl->schedules->schedule->iterateItems() as $uuid => $sched) {
    if (!$enabled || $sched->enabled->isEmpty()) {
        $active = false;
    } else {
        $days = array_map('intval', $sched->days->getValues());
        $start = to_minutes((string)$sched->start);
        $end = to_minutes((string)$sched->end);
        if ($start < $end) {
            $active = in_array($today, $days) && $minute >= $start && $minute < $end;
        } else {
            /* overnight window, e.g. 23:00-07:00 belongs to the day it starts */
            $active = (in_array($today, $days) && $minute >= $start) || (in_array($yesterday, $days) && $minute < $end);
        }
    }
    if ($active) {
        $running[$uuid] = (string)$sched->name;
    }
    $ips = [];
    foreach ($sched->devices->getValues() as $mac) {
        $ips = array_merge($ips, $hosts[strtolower($mac)] ?? []);
    }
    if ((string)$sched->action === 'cut') {
        if ($active) {
            $cut_ips = array_merge($cut_ips, $ips);
        }
    } else {
        $domains = [];
        foreach ($sched->apps->getValues() as $app) {
            $domains = array_merge($domains, Catalog::APPS[$app] ?? []);
        }
        sort($ips);
        $app_policies[$uuid] = [
            'enabled' => $active && !empty($ips) && !empty($domains),
            'source_nets' => array_values(array_unique(array_map(fn($ip) => strpos($ip, ':') !== false ? "$ip/128" : "$ip/32", $ips))),
            'wildcards' => array_values(array_unique($domains)),
            'name' => (string)$sched->name,
        ];
    }
}

/* ---- devices paused for a while: cut until their time is up */
foreach (Pause::tidy() as $mac => $until) {
    if ($enabled) {
        $cut_ips = array_merge($cut_ips, $hosts[strtolower($mac)] ?? []);
    }
}

/* ---- cut internet: pf table, kill states of devices that were not cut a minute ago */
$cut_ips = array_values(array_unique($cut_ips));
sort($cut_ips);
$tmp = tempnam('/tmp', 'inversapanel');
file_put_contents($tmp, implode("\n", $cut_ips) . "\n");
exec('/sbin/pfctl -t inversapanel_sched -T replace -f ' . escapeshellarg($tmp) . ' 2>/dev/null');
unlink($tmp);
foreach (array_diff($cut_ips, $previous['cut'] ?? []) as $ip) {
    exec('/sbin/pfctl -k ' . escapeshellarg($ip) . ' > /dev/null 2>&1');
    exec('/sbin/pfctl -k ' . (strpos($ip, ':') !== false ? '::/0' : '0.0.0.0/0') . ' -k ' . escapeshellarg($ip) . ' > /dev/null 2>&1');
}

/* ---- block apps: rewrite Unbound policies only when their desired state changed */
$signature = md5(json_encode($app_policies));
$apps_changed = $signature !== ($previous['apps'] ?? '');
/*
 * remember the new state first: even if writing the policies fails below, the heavy blocklist
 * refresh must not be retriggered every minute
 */
file_put_contents($state_file, json_encode(['cut' => $cut_ips, 'apps' => $signature, 'running' => $running, 'time' => time()]));
/* for "what happened" on the overview page (not after a restart, when nothing is known about before) */
if (isset($previous['running'])) {
    foreach (array_diff_key($running, $previous['running']) as $name) {
        Overview::event('sched_on', ['name' => $name]);
    }
    foreach (array_diff_key($previous['running'], $running) as $name) {
        Overview::event('sched_off', ['name' => $name]);
    }
}
if ($apps_changed) {
  try {
    $unbound = new Unbound();
    $existing = [];
    foreach ($unbound->dnsbl->blocklist->iterateItems() as $puuid => $policy) {
        if (strpos((string)$policy->description, Catalog::SCHED_POLICY_PREFIX) === 0) {
            /* "Inversa Panel schedule: <name> #<schedule uuid>" */
            $existing[substr(strrchr((string)$policy->description, '#'), 1)] = $puuid;
        }
    }
    /*
     * The state file lives in /var/run and is gone after a reboot, so the first run after boot
     * always lands here. Compare with what the configuration already holds: saving and refreshing
     * the blocklists for nothing would compete for memory with Unbound, which loads its lists
     * at that very moment (on a 4 GB firewall the kernel then killed Unbound).
     */
    $dirty = false;
    foreach ($existing as $suuid => $puuid) {
        if (!isset($app_policies[$suuid])) {
            $unbound->dnsbl->blocklist->del($puuid);
            $dirty = true;
        }
    }
    foreach ($app_policies as $suuid => $want) {
        $policy = isset($existing[$suuid]) ? $unbound->getNodeByReference('dnsbl.blocklist.' . $existing[$suuid]) : null;
        if ($policy === null) {
            $policy = $unbound->dnsbl->blocklist->Add();
            $dirty = true;
        }
        $values = [
            'description' => mb_substr(Catalog::SCHED_POLICY_PREFIX . $want['name'], 0, 200) . ' #' . $suuid,
            /* a policy without source networks would apply to everyone: keep it off instead */
            'enabled' => $want['enabled'] ? '1' : '0',
            'source_nets' => implode(',', $want['source_nets']),
            'wildcards' => implode(',', $want['wildcards']),
            'type' => '',
        ];
        foreach ($values as $field => $value) {
            if ((string)$policy->$field !== $value) {
                $policy->$field->setValue($value);
                $dirty = true;
            }
        }
    }
    if ($dirty) {
        $unbound->serializeToConfig(false, true);
        Config::getInstance()->save();
        $backend = new Backend();
        $backend->configdRun('template reload OPNsense/Unbound/*');
        /* serialized by dnsbl.sh: never more than one blocklist refresh at a time */
        $backend->configdRun('inversapanel dnsbl', true);
    }
  } catch (\Exception $e) {
    syslog(LOG_ERR, 'inversapanel: schedule could not update DNS policies: ' . $e->getMessage());
  }
}
