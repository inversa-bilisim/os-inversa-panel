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
use OPNsense\InversaPanel\Ips;
use OPNsense\InversaPanel\Network;
use OPNsense\InversaPanel\Overview;
use OPNsense\InversaPanel\Vpn;
use OPNsense\Unbound\Unbound;

/**
 * Numbers for the overview page. Reuses the same backend actions as the core
 * Reporting pages, so Inversa Panel only needs its own ACL to show them.
 */
class DashboardController extends ApiControllerBase
{
    /**
     * interface byte counters, the browser derives rates from two samples
     */
    public function trafficAction()
    {
        $interfaces = Overview::counters(new Backend(), $time);
        return ['time' => $time, 'interfaces' => $interfaces, 'wan' => Overview::wanKeys()];
    }

    /**
     * DNS query totals and most blocked domains
     */
    public function dnsAction()
    {
        $unbound = new Unbound();
        if ($unbound->general->stats->isEmpty()) {
            return ['enabled' => false];
        }
        $totals = json_decode((new Backend())->configdpRun('unbound qstats totals', [10]), true);
        if (!is_array($totals)) {
            return ['enabled' => true, 'available' => false];
        }
        $types = $unbound->dnsbl->blocklist->getTemplateNode()->type->getNodeData();
        $blocked = [];
        foreach ($totals['top_blocked'] ?? [] as $domain => $props) {
            $blocked[] = [
                'domain' => rtrim($domain, '.'),
                'total' => $props['total'],
                /* app and custom domains are reported by Unbound as "Custom" */
                'custom' => $props['blocklist'] === 'Custom',
                'list' => $types[$props['blocklist']]['value'] ?? $props['blocklist'],
            ];
        }
        return [
            'enabled' => true,
            'available' => true,
            'total' => $totals['total'] ?? 0,
            'blocked' => $totals['blocked']['total'] ?? 0,
            'blocked_pcnt' => $totals['blocked']['pcnt'] ?? 0,
            'start_time' => $totals['start_time'] ?? null,
            'top_blocked' => $blocked,
        ];
    }

    /**
     * everything else on the overview page in one answer (asked for every half minute)
     */
    public function overviewAction()
    {
        Overview::timezone();
        $backend = new Backend();
        $mdl = new InversaPanel();
        $watch = Overview::watchState();
        $midnight = strtotime('today');

        $net = (new Network())->state($mdl);
        $wan = ['exists' => !empty($net['wan']['exists'])];
        if ($wan['exists']) {
            $wan += [
                'type' => $net['wan']['type'],
                'device' => $net['wan']['device'],
                'address' => $net['wan']['address'] ?? '',
                'gateway' => $net['wan']['live']['gateway'] ?? '',
                'link' => !empty($net['wan']['live']['link']),
                /* since when the minutely job has seen it connected without a gap */
                'since' => (int)($watch['wan_since'] ?? 0),
            ];
        }
        $networks = [];
        foreach ($net['networks'] as $row) {
            if (!empty($row['enabled'])) {
                $networks[] = [
                    'key' => $row['key'],
                    'name' => $row['name'],
                    'color' => $row['color'],
                    'cidr' => Vpn::interfaceNetwork($row['key']),
                    'isolated' => !empty($row['isolated']),
                ];
            }
        }

        /* attack protection: today's alerts, and the latest ones for "what happened" */
        $ips = ['available' => false];
        $events = Overview::events(30);
        try {
            $status = Ips::status($mdl);
            if (!empty($status['available'])) {
                $ips = [
                    'available' => true,
                    'enabled' => $status['ids_enabled'],
                    'running' => $status['running'],
                    'inline' => $status['inline'],
                    'today' => 0,
                    'blocked' => 0,
                    'last' => 0,
                    'more' => $status['more'],
                ];
                $seen = [];
                foreach ($status['alerts'] as $alert) {
                    $time = strtotime($alert['time']);
                    if (!$time) {
                        continue;
                    }
                    if ($time >= $midnight) {
                        $ips['today']++;
                        $ips['blocked'] += $alert['blocked'] ? 1 : 0;
                    }
                    $ips['last'] = max($ips['last'], $time);
                    /* the same attacker with the same alert is one line, with a count */
                    $key = $alert['src'] . '|' . $alert['sid'] . '|' . date('Y-m-d', $time);
                    if (isset($seen[$key])) {
                        $events[$seen[$key]]['n']++;
                        $events[$seen[$key]]['t'] = max($events[$seen[$key]]['t'], $time);
                    } elseif (count($seen) < 20) {
                        $seen[$key] = count($events);
                        $events[] = ['t' => $time, 'k' => 'attack', 'src' => $alert['src'], 'dst' => $alert['dst'],
                            'msg' => $alert['msg'], 'blocked' => $alert['blocked'], 'n' => 1];
                    }
                }
            }
        } catch (\Throwable $e) {
            syslog(LOG_WARNING, 'inversapanel: attack protection state for the overview: ' . $e->getMessage());
        }
        usort($events, fn($a, $b) => $b['t'] <=> $a['t']);

        $usage = null;
        if (isset($watch['usage']) && $watch['usage']['day'] === date('Y-m-d')) {
            $usage = ['in' => $watch['usage']['in'], 'out' => $watch['usage']['out'], 'from' => $watch['usage']['from']];
        }

        return [
            'now' => time(),
            'midnight' => $midnight,
            'wan' => $wan,
            'networks' => $networks,
            'vpn' => Overview::vpn($mdl),
            'ips' => $ips,
            'usage' => $usage,
            'events' => array_slice($events, 0, 12),
            'dns_hours' => (new Unbound())->general->stats->isEmpty() ? null : Overview::dnsHours($backend),
            'system' => Overview::system($backend, $watch),
        ];
    }
}
