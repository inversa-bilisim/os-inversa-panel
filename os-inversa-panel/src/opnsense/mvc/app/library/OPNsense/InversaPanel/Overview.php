<?php

/*
 * SPDX-License-Identifier: BSD-2-Clause
 * Copyright (C) 2026 Inversa Bilişim
 */

namespace OPNsense\InversaPanel;

use OPNsense\Core\Backend;
use OPNsense\Core\Config;

/**
 * What the overview page shows beyond the live counters: the state of the VPN connections,
 * the system itself, and what Inversa Panel writes down for it. OPNsense keeps neither a
 * day's data usage nor a list of "what happened", so watch.php (every minute) records both
 * below /var/db/inversapanel; other scripts add their own lines with event().
 */
class Overview
{
    public const DIR = '/var/db/inversapanel';
    public const EVENTS = self::DIR . '/events.log';
    public const WATCH = self::DIR . '/watch.json';
    /* lines kept in the event log */
    private const KEEP = 50000;
    /* a WireGuard peer counts as connected this long after its last handshake */
    public const HANDSHAKE = 180;

    /**
     * the firewall's own time zone (cron scripts and the web interface may run without it)
     */
    public static function timezone()
    {
        $tz = (string)Config::getInstance()->object()->system->timezone;
        date_default_timezone_set($tz !== '' ? $tz : 'UTC');
    }

    /**
     * interfaces with an upstream gateway are what people call "the internet"
     */
    public static function wanKeys()
    {
        $wan = [];
        foreach (Config::getInstance()->object()->interfaces->children() as $key => $node) {
            if (!empty((string)$node->gateway) || !empty((string)$node->gatewayv6) || $key === 'wan') {
                $wan[] = $key;
            }
        }
        return $wan;
    }

    /**
     * byte counters per interface key: [key => [inbytes, outbytes]]
     */
    public static function counters(Backend $backend, &$time = null)
    {
        $traffic = json_decode((string)$backend->configdRun('interface show traffic'), true) ?? [];
        $time = $traffic['time'] ?? microtime(true);
        $interfaces = [];
        /* the one-shot variant returns raw counters ("bytes received"), the stream variant inbytes/outbytes */
        foreach ($traffic['interfaces'] ?? $traffic as $key => $row) {
            if (is_array($row)) {
                $interfaces[$key] = [
                    'inbytes' => $row['inbytes'] ?? $row['bytes received'] ?? 0,
                    'outbytes' => $row['outbytes'] ?? $row['bytes transmitted'] ?? 0,
                ];
            }
        }
        return $interfaces;
    }

    /* ------------------------------------------------------------------ events */

    /**
     * add a line to "what happened": a kind plus what the page needs to word it
     */
    public static function event($kind, array $data = [], $time = null)
    {
        if (!is_dir(self::DIR)) {
            @mkdir(self::DIR, 0755, true);
        }
        $line = json_encode(['t' => $time ?? time(), 'k' => $kind] + $data, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
        @file_put_contents(self::EVENTS, $line . "\n", FILE_APPEND | LOCK_EX);
    }

    /**
     * newest first; logins and configuration changes are left to the logs page
     */
    public static function events($limit = 30)
    {
        $result = [];
        if (is_file(self::EVENTS)) {
            /* the file may hold 90 days: only its end is of interest here */
            $handle = @fopen(self::EVENTS, 'r');
            if ($handle) {
                fseek($handle, max(0, filesize(self::EVENTS) - 65536));
                $lines = explode("\n", (string)stream_get_contents($handle));
                fclose($handle);
                foreach (array_reverse($lines) as $line) {
                    $row = json_decode($line, true);
                    if (is_array($row) && isset($row['t'], $row['k']) && !in_array($row['k'], ['login_ok', 'login_fail', 'config'])) {
                        $result[] = $row;
                        if (count($result) >= $limit) {
                            break;
                        }
                    }
                }
            }
        }
        return $result;
    }

    /**
     * keep the log short (called once a minute)
     */
    public static function trimEvents()
    {
        $lines = is_file(self::EVENTS) ? (@file(self::EVENTS, FILE_IGNORE_NEW_LINES | FILE_SKIP_EMPTY_LINES) ?: []) : [];
        if (count($lines) > self::KEEP * 2) {
            @file_put_contents(self::EVENTS, implode("\n", array_slice($lines, -self::KEEP)) . "\n", LOCK_EX);
        }
    }

    public static function watchState()
    {
        $state = is_file(self::WATCH) ? json_decode((string)@file_get_contents(self::WATCH), true) : null;
        return is_array($state) ? $state : null;
    }

    /* ------------------------------------------------------------------ VPN */

    /**
     * the connections Inversa Panel manages, reduced to "is the other end there"
     */
    public static function vpn(InversaPanel $mdl)
    {
        $result = [];
        try {
            if (class_exists('\OPNsense\Wireguard\Server')) {
                $status = (new Vpn())->status($mdl);
                foreach ($status['connections'] as $conn) {
                    $online = [];
                    $total = 0;
                    foreach ($conn['peers'] as $peer) {
                        if (!$peer['enabled']) {
                            continue;
                        }
                        $total++;
                        if ($peer['handshake'] && $status['now'] - $peer['handshake'] < self::HANDSHAKE) {
                            $online[] = $peer['name'];
                        }
                    }
                    $result[] = [
                        'id' => $conn['uuid'],
                        'name' => $conn['name'],
                        'kind' => $conn['kind'],
                        'type' => 'wireguard',
                        'enabled' => $conn['enabled'],
                        'peers' => $total,
                        'online' => $online,
                        'connected' => !empty($online),
                    ];
                }
            }
            if (Ipsec::available()) {
                list($list,) = (new Ipsec())->status($mdl);
                foreach ($list as $conn) {
                    $result[] = [
                        'id' => $conn['uuid'],
                        'name' => $conn['name'],
                        'kind' => 'site',
                        'type' => 'ipsec',
                        'enabled' => $conn['enabled'],
                        'peers' => 0,
                        'online' => [],
                        'connected' => $conn['connected'] > 0,
                        /* seconds the tunnel has been up */
                        'up_for' => $conn['connected'] > 1 ? $conn['connected'] : null,
                    ];
                }
            }
        } catch (\Throwable $e) {
            syslog(LOG_WARNING, 'inversapanel: VPN state for the overview: ' . $e->getMessage());
        }
        return $result;
    }

    /* ------------------------------------------------------------------ system */

    private static function sysctl(array $names)
    {
        $values = [];
        foreach ($names as $name) {
            $out = shell_exec('/sbin/sysctl -n ' . escapeshellarg($name) . ' 2>/dev/null');
            $values[$name] = $out === null ? '' : trim($out);
        }
        return $values;
    }

    /**
     * ticks per CPU state since boot: user, nice, system, interrupt, idle
     */
    public static function cpuTicks()
    {
        $ticks = array_map('intval', preg_split('/\s+/', self::sysctl(['kern.cp_time'])['kern.cp_time']));
        return count($ticks) === 5 ? $ticks : null;
    }

    public static function bootTime()
    {
        return preg_match('/sec = (\d+)/', self::sysctl(['kern.boottime'])['kern.boottime'], $m) ? (int)$m[1] : 0;
    }

    public static function system(Backend $backend, ?array $watch)
    {
        $result = ['boot' => self::bootTime()];

        /* processor: share of busy ticks since the sample of the minutely job */
        $now = self::cpuTicks();
        $then = $watch['cpu'] ?? null;
        $result['cpu'] = null;
        if ($now !== null && is_array($then) && count($then) === 5) {
            $all = array_sum($now) - array_sum($then);
            $idle = $now[4] - $then[4];
            if ($all > 0 && $idle >= 0 && $idle <= $all) {
                $result['cpu'] = round(($all - $idle) / $all * 100);
            }
        }

        /* memory the way OPNsense's own dashboard counts it */
        $mem = self::sysctl(['hw.physmem', 'vm.stats.vm.v_page_count', 'vm.stats.vm.v_inactive_count',
            'vm.stats.vm.v_cache_count', 'vm.stats.vm.v_laundry_count', 'vm.stats.vm.v_free_count']);
        $pages = (int)$mem['vm.stats.vm.v_page_count'];
        $result['memory'] = null;
        if ($pages > 0) {
            $unused = (int)$mem['vm.stats.vm.v_inactive_count'] + (int)$mem['vm.stats.vm.v_cache_count'] +
                (int)$mem['vm.stats.vm.v_laundry_count'] + (int)$mem['vm.stats.vm.v_free_count'];
            $total = (int)$mem['hw.physmem'];
            $result['memory'] = ['total' => $total, 'used' => (int)round(($pages - $unused) / $pages * $total)];
        }

        $result['disk'] = null;
        $disk = json_decode((string)$backend->configdRun('system diag disk'), true);
        foreach ($disk['devices'] ?? [] as $dev) {
            if (($dev['mountpoint'] ?? '') === '/') {
                $result['disk'] = ['total' => (int)$dev['total_bytes'], 'used' => (int)$dev['used_bytes']];
            }
        }

        /* the warmest sensor; virtual machines and some boards have none */
        $result['temperature'] = null;
        $sensors = array_filter(array_map('trim', explode("\n", (string)$backend->configdRun('system sensors'))), function ($name) {
            return preg_match('/^[a-z0-9_.%-]+$/i', $name);
        });
        foreach (self::sysctl(array_slice($sensors, 0, 32)) as $value) {
            if (preg_match('/^(-?\d+(?:\.\d+)?)C?$/', $value, $m)) {
                $result['temperature'] = max($result['temperature'] ?? -273, (float)$m[1]);
            }
        }

        /* version and whether the last check found something newer (no check is started here) */
        $product = json_decode((string)$backend->configdRun('firmware product'), true) ?? [];
        $version = (string)($product['product_version'] ?? '');
        $current = preg_split('/[p_-]/', $version)[0];
        $latest = (string)($product['product_latest'] ?? '');
        $check = $product['product_check'] ?? [];
        $pending = false;
        foreach (['upgrade_sets', 'downgrade_packages', 'new_packages', 'reinstall_packages', 'remove_packages', 'upgrade_packages'] as $key) {
            $pending = $pending || !empty($check[$key]);
        }
        $newer = strpos((string)($product['product_id'] ?? ''), '-devel') === false && $latest !== '' && $latest !== $current;
        $result['product'] = (string)($product['product_name'] ?? 'OPNsense');
        $result['version'] = $version;
        $result['update'] = $newer || $pending;
        $result['latest'] = $newer ? $latest : '';

        $revision = Config::getInstance()->object()->revision;
        $result['config_changed'] = !empty($revision->time) ? (int)$revision->time : 0;
        return $result;
    }

    /* ------------------------------------------------------------------ DNS */

    /**
     * blocked and total DNS queries per hour, the last 24 hours: [[hour start, blocked, total], ...]
     */
    public static function dnsHours(Backend $backend)
    {
        $rolling = json_decode((string)$backend->configdpRun('unbound qstats rolling', [600, 24]), true);
        if (!is_array($rolling)) {
            return null;
        }
        $hours = [];
        foreach ($rolling as $start => $row) {
            $hour = (int)(floor((float)$start / 3600) * 3600);
            $hours[$hour] = $hours[$hour] ?? [$hour, 0, 0];
            $hours[$hour][1] += (int)($row['blocked'] ?? 0);
            $hours[$hour][2] += (int)($row['total'] ?? 0);
        }
        ksort($hours);
        return array_slice(array_values($hours), -24);
    }
}
