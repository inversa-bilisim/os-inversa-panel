<?php

/*
 * SPDX-License-Identifier: BSD-2-Clause
 * Copyright (C) 2026 Inversa Bilişim
 */

namespace OPNsense\InversaPanel;

use OPNsense\Core\Backend;
use OPNsense\Core\Config;

/**
 * Attack protection: Suricata, through OPNsense's own intrusion detection model.
 *
 * Suricata listens on the protected (internal) networks, not on the internet side: alerts then
 * name the device that caused them, and only traffic the firewall let through is looked at.
 *
 * Inversa Panel only manages an intrusion detection it switched on itself. One that was already
 * running is shown (state, alerts) but never changed.
 */
class Ips
{
    /* written by ips.sh while it works ("preparing") or when it could not start Suricata ("nomem ...") */
    const STATE = '/var/run/inversapanel_ips.state';
    const RULES = '/usr/local/etc/suricata/installed_rules.yaml';

    /* inline (netmap) mode needs a real network card: none of these */
    const NO_INLINE = '/^(lagg|bridge|pppoe|ppp|wg|wireguard|ovpn|openvpn|tun|tap|gif|gre|ipsec|enc|lo|vxlan|zt|tailscale)/';

    public static function available()
    {
        return class_exists('\OPNsense\IDS\IDS');
    }

    /**
     * where Suricata has to listen to see the protected networks: a VLAN is seen on its parent
     * device (listening on both would report everything twice, and inline mode needs the parent)
     * @return array keys (as OPNsense's IDS interface selection knows them), devices, vlan, inline
     */
    public static function capture(InversaPanel $mdl)
    {
        $cfg = Config::getInstance()->object();
        $parents = [];
        if (!empty($cfg->vlans)) {
            foreach ($cfg->vlans->children() as $vlan) {
                if ((string)$vlan->vlanif !== '' && (string)$vlan->if !== '') {
                    $parents[(string)$vlan->vlanif] = (string)$vlan->if;
                }
            }
        }
        $keyOf = [];
        foreach ($cfg->interfaces->children() as $key => $node) {
            if ((string)$node->if !== '' && !isset($keyOf[(string)$node->if])) {
                $keyOf[(string)$node->if] = $key;
            }
        }
        $result = ['keys' => [], 'devices' => [], 'vlan' => false, 'inline' => true];
        foreach ($mdl->getProtectedInterfaces() as $key) {
            $device = $cfg->interfaces->$key !== null ? (string)$cfg->interfaces->$key->if : '';
            if ($device === '') {
                continue;
            }
            for ($hop = 0; $hop < 3 && isset($parents[$device]); $hop++) {
                $device = $parents[$device];
                $result['vlan'] = true;
            }
            if (in_array($device, $result['devices'])) {
                continue;
            }
            $result['devices'][] = $device;
            /* a parent without an assignment of its own is offered under its device name */
            $result['keys'][] = $keyOf[$device] ?? $device;
            if (preg_match(self::NO_INLINE, $device)) {
                $result['inline'] = false;
            }
        }
        return $result;
    }

    private static function hyperscan()
    {
        $boot = (string)@file_get_contents('/var/run/dmesg.boot');
        return strpos($boot, 'SSSE3') !== false;
    }

    /**
     * can traffic be blocked (inline mode) with this setup?
     * @return array available, reason ('' | none | device | offload)
     */
    public static function blockSupport(array $capture)
    {
        if (empty($capture['devices'])) {
            return ['available' => false, 'reason' => 'none'];
        }
        if (!$capture['inline']) {
            return ['available' => false, 'reason' => 'device'];
        }
        if (class_exists('\OPNsense\Interfaces\Settings')) {
            /* inline mode breaks traffic when the network card still does part of the work itself */
            $settings = new \OPNsense\Interfaces\Settings();
            foreach (['disablechecksumoffloading', 'disablesegmentationoffloading', 'disablelargereceiveoffloading'] as $field) {
                if ($settings->$field->isEmpty()) {
                    return ['available' => false, 'reason' => 'offload'];
                }
            }
        }
        return ['available' => true, 'reason' => ''];
    }

    /**
     * intrusion detection is on, but not because of Inversa Panel: hands off
     */
    public static function foreign(InversaPanel $mdl, $ids = null)
    {
        if (!self::available()) {
            return false;
        }
        $ids = $ids ?? new \OPNsense\IDS\IDS();
        return !$ids->general->enabled->isEmpty() && $mdl->ips->enabled->isEmpty();
    }

    private static function policy($ids)
    {
        foreach ($ids->policies->policy->iterateItems() as $uuid => $node) {
            if ((string)$node->description === Catalog::IPS_POLICY) {
                return [$uuid, $node];
            }
        }
        return [null, null];
    }

    /* everything a running Suricata depends on; when it stays the same there is nothing to restart */
    private static function signature($ids)
    {
        $files = [];
        foreach ($ids->files->file->iterateItems() as $node) {
            if (!$node->enabled->isEmpty()) {
                $files[] = (string)$node->filename;
            }
        }
        sort($files);
        list(, $policy) = self::policy($ids);
        return md5(json_encode([
            (string)$ids->general->enabled, (string)$ids->general->mode, (string)$ids->general->interfaces,
            (string)$ids->general->promisc, (string)$ids->general->MPMAlgo, $files,
            $policy === null ? null : [(string)$policy->enabled, (string)$policy->rulesets, (string)$policy->new_action],
        ]));
    }

    /**
     * bring OPNsense's intrusion detection in line with the Inversa Panel settings (nothing is saved here)
     * @param bool $wasOn attack protection was on before this change (so switching it off is ours to do)
     * @return array|null [ids => model, cron => model or null, changed => bool]; null when there is nothing to manage
     * @throws \Exception when the settings cannot work on this firewall
     */
    public static function sync(InversaPanel $mdl, $wasOn)
    {
        $on = !$mdl->ips->enabled->isEmpty();
        if (!self::available() || (!$on && !$wasOn)) {
            return null;
        }
        $ids = new \OPNsense\IDS\IDS();
        $before = self::signature($ids);
        $block = $on && (string)$mdl->ips->mode === 'block';
        $capture = self::capture($mdl);
        if ($on && empty($capture['keys'])) {
            throw new \Exception('Attack protection needs at least one protected network');
        }
        if ($block && !self::blockSupport($capture)['available']) {
            throw new \Exception('Blocking mode is not possible with this network hardware or its settings');
        }

        /* rulesets of the chosen groups on, the rest of our catalog off; other rulesets are not ours */
        $listing = json_decode((string)(new Backend())->configdRun('ids list installablerulesets'), true);
        $installable = is_array($listing) && !empty($listing['items']) ? $listing['items'] : null;
        $existing = [];
        foreach ($ids->files->file->iterateItems() as $node) {
            $existing[(string)$node->filename] = $node;
        }
        $groups = $mdl->ips->groups->getValues();
        $rulesets = [];
        foreach (Catalog::IPS_GROUPS as $group => $files) {
            foreach ($files as $file) {
                $want = $on && in_array($group, $groups) && ($installable === null || isset($installable[$file]));
                if (!isset($existing[$file])) {
                    if (!$want) {
                        continue;
                    }
                    $existing[$file] = $ids->files->file->Add();
                    $existing[$file]->filename->setValue($file);
                }
                $existing[$file]->enabled->setValue($want ? '1' : '0');
                if ($want) {
                    $rulesets[] = $existing[$file]->getAttributes()['uuid'];
                }
            }
        }
        if ($on && empty($rulesets)) {
            throw new \Exception('Attack protection needs at least one kind of attack to look for');
        }

        /* blocking = one policy turning "alert" into "drop" for exactly our rulesets */
        list($puuid, $policy) = self::policy($ids);
        if ($block) {
            if ($policy === null) {
                $policy = $ids->policies->policy->Add();
                $policy->description->setValue(Catalog::IPS_POLICY);
            }
            $policy->enabled->setValue('1');
            $policy->prio->setValue('0');
            $policy->action->setValue('alert');
            $policy->rulesets->setValue(implode(',', $rulesets));
            $policy->new_action->setValue('drop');
        } elseif ($puuid !== null) {
            $ids->policies->policy->del($puuid);
        }

        $ids->general->enabled->setValue($on ? '1' : '0');
        if ($on) {
            $ids->general->mode->setValue($block ? 'netmap' : 'pcap');
            $ids->general->interfaces->setValue(implode(',', $capture['keys']));
            /* inline mode only sees VLAN traffic on the parent device in promiscuous mode */
            $ids->general->promisc->setValue($block && $capture['vlan'] ? '1' : '0');
            /*
             * OPNsense's default pattern matcher (Aho-Corasick) took 3.5 GB for the rulesets selected
             * here, Hyperscan a fraction of that. It needs a processor with SSSE3 (any from the last
             * 15 years); a choice made in OPNsense is left alone.
             */
            if ($ids->general->MPMAlgo->isEmpty() && self::hyperscan()) {
                $ids->general->MPMAlgo->setValue('hs');
            }
        }
        $problems = [];
        foreach ($ids->performValidation() as $msg) {
            /*
             * the policy's ruleset list is checked against the rulesets enabled in the stored
             * configuration, not against the ones switched on a few lines above
             */
            if (preg_match('/^policies\.policy\.[^.]+\.rulesets$/', $msg->getField())) {
                continue;
            }
            $problems[$msg->getField()] = $msg->getField() . ': ' . $msg->getMessage();
        }
        if (!empty($problems)) {
            throw new \Exception('Intrusion detection settings were not accepted (' . implode('; ', $problems) . ')');
        }

        /* daily rule updates: the job OPNsense itself creates for this, switched on */
        $cron = null;
        if ($on && class_exists('\OPNsense\Cron\Cron')) {
            $jobs = new \OPNsense\Cron\Cron();
            $uuid = (string)$ids->general->UpdateCron;
            $job = $uuid !== '' ? $jobs->getNodeByReference('jobs.job.' . $uuid) : null;
            if ($job === null) {
                $uuid = $jobs->newDailyJob('IDS', 'ids update', 'ids rule updates', '*', '1');
                $job = $jobs->getNodeByReference('jobs.job.' . $uuid);
                /* at night, and not on the full hour when other jobs start */
                $job->hours->setValue('3');
                $job->minutes->setValue((string)random_int(10, 50));
                $ids->general->UpdateCron->setValue($uuid);
                $cron = $jobs;
            } elseif ($job->enabled->isEmpty()) {
                $job->enabled->setValue('1');
                $cron = $jobs;
            }
        }

        return ['ids' => $ids, 'cron' => $cron, 'changed' => self::signature($ids) !== $before || $cron !== null];
    }

    /**
     * after the configuration was saved: write Suricata's files, then fetch rules and (re)start
     * or stop it in the background (ips.sh)
     */
    public static function reconfigure($cronChanged = false)
    {
        $backend = new Backend();
        if ($cronChanged) {
            $backend->configdRun('template reload OPNsense/Cron');
            $backend->configdRun('cron restart');
        }
        $backend->configdRun('template reload OPNsense/IDS');
        $backend->configdRun('inversapanel ips', true);
    }

    /**
     * state of the service and the latest alerts
     */
    public static function status(InversaPanel $mdl)
    {
        if (!self::available()) {
            return ['available' => false];
        }
        $ids = new \OPNsense\IDS\IDS();
        $backend = new Backend();
        $capture = self::capture($mdl);

        $memory = 0;
        $pid = (int)@file_get_contents('/var/run/suricata.pid');
        if ($pid > 0) {
            $memory = (int)round((int)shell_exec('/bin/ps -o rss= -p ' . $pid . ' 2>/dev/null') / 1024);
        }
        $state = is_file(self::STATE) ? trim((string)file_get_contents(self::STATE)) : '';

        $alerts = [];
        $data = json_decode((string)$backend->configdpRun('ids query alerts', [200, 0, '', '']), true);
        foreach ($data['rows'] ?? [] as $row) {
            $time = strtotime((string)($row['timestamp'] ?? ''));
            $alerts[] = [
                'time' => $time ? date('c', $time) : '',
                'src' => (string)($row['src_ip'] ?? ''),
                'sport' => (int)($row['src_port'] ?? 0),
                'dst' => (string)($row['dest_ip'] ?? ''),
                'dport' => (int)($row['dest_port'] ?? 0),
                'proto' => (string)($row['proto'] ?? ''),
                'msg' => (string)($row['alert'] ?? ''),
                'sid' => (int)($row['alert_sid'] ?? 0),
                'blocked' => ($row['alert_action'] ?? '') === 'blocked',
            ];
        }

        return [
            'available' => true,
            'foreign' => self::foreign($mdl, $ids),
            'ids_enabled' => !$ids->general->enabled->isEmpty(),
            'inline' => (string)$ids->general->mode !== 'pcap',
            /* the pid file outlives a crash: only a process that still has memory counts */
            'running' => $memory > 0,
            'memory_mb' => $memory,
            /* '' | preparing | nomem <free MB> <needed MB> */
            'state' => $state,
            'devices' => $capture['devices'],
            'block' => self::blockSupport($capture),
            'rules_updated' => is_file(self::RULES) ? date('c', filemtime(self::RULES)) : null,
            'alerts' => $alerts,
            'more' => count($alerts) >= 200,
        ];
    }
}
