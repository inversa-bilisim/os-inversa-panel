<?php

/*
 * SPDX-License-Identifier: BSD-2-Clause
 * Copyright (C) 2026 Inversa Bilişim
 */

namespace OPNsense\InversaPanel\Api;

use OPNsense\Base\ApiControllerBase;
use OPNsense\Core\Backend;
use OPNsense\Core\Config;
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
        $traffic = json_decode((new Backend())->configdRun('interface show traffic'), true) ?? [];
        $wan = [];
        foreach (Config::getInstance()->object()->interfaces->children() as $key => $node) {
            /* interfaces with an upstream gateway are what people call "the internet" */
            if (!empty((string)$node->gateway) || !empty((string)$node->gatewayv6) || $key === 'wan') {
                $wan[] = $key;
            }
        }
        /* the one-shot variant returns raw counters ("bytes received"), the stream variant inbytes/outbytes */
        $interfaces = [];
        foreach ($traffic['interfaces'] ?? $traffic as $key => $row) {
            if (!is_array($row)) {
                continue;
            }
            $interfaces[$key] = [
                'inbytes' => $row['inbytes'] ?? $row['bytes received'] ?? 0,
                'outbytes' => $row['outbytes'] ?? $row['bytes transmitted'] ?? 0,
            ];
        }
        return ['time' => $traffic['time'] ?? microtime(true), 'interfaces' => $interfaces, 'wan' => $wan];
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
}
