<?php

/*
 * SPDX-License-Identifier: BSD-2-Clause
 * Copyright (C) 2026 Inversa Bilişim
 */

/**
 * Automatic firewall rules generated from Minnosh settings.
 *
 * Nothing here is written to config.xml: rules exist only while the plugin is installed.
 * They are registered before user rules (floating user rules start at priority 200000),
 * so an explicit Minnosh decision (cut a device, block a network) is not overruled by
 * a broad pass rule. Labels are stable so their counters can be read back.
 */
function minnosh_label($id)
{
    return md5('minnosh-' . $id);
}

function minnosh_firewall(\OPNsense\Firewall\Plugin $fw)
{
    $mdl = new \OPNsense\Minnosh\Minnosh();
    if ($mdl->general->enabled->isEmpty()) {
        return;
    }

    $protected = $mdl->getProtectedInterfaces();
    $mapping = iterator_to_array($fw->getInterfaceMapping());
    $blocked = $mdl->getBlockedMacs();
    $forcedns = !$mdl->filtering->forcedns->isEmpty();
    $approval = $mdl->getApprovalInterfaces();

    /* filled every minute by the schedule job, keeps its contents over filter reloads */
    $fw->registerTable('minnosh_sched', true);

    foreach ($protected as $intf) {
        if (!isset($mapping[$intf])) {
            continue;
        }
        $cut = [
            'type' => 'block',
            'interface' => $intf,
            'direction' => 'in',
            'ipprotocol' => 'inet46',
            'quick' => true,
            'to' => '(self)',
            'to_not' => true,
            '#ref' => 'ui/minnosh#devices',
        ];
        if (!empty($blocked)) {
            /* devices in the MAC alias may still talk to the firewall itself (DNS, DHCP, GUI) */
            $fw->registerFilterRule(100000, array_merge($cut, [
                'from' => '<' . \OPNsense\Minnosh\Catalog::BLOCKED_ALIAS . '>',
                'descr' => 'Minnosh: internet access cut for device',
                'label' => minnosh_label('cut-' . $intf),
            ]));
        }
        if (in_array($intf, $approval)) {
            /*
             * new devices wait for approval: whoever is not in the alias of approved devices gets
             * no further than the firewall itself (DHCP, DNS, the GUI to approve one's own device)
             */
            $fw->registerFilterRule(100000, array_merge($cut, [
                'from' => '<' . \OPNsense\Minnosh\Catalog::APPROVED_ALIAS . '>',
                'from_not' => true,
                'descr' => 'Minnosh: device waits for approval',
                'label' => minnosh_label('approval-' . $intf),
            ]));
        }
        $fw->registerFilterRule(100000, array_merge($cut, [
            'from' => '<minnosh_sched>',
            'descr' => 'Minnosh: internet access cut by schedule',
            'label' => minnosh_label('sched-' . $intf),
        ]));

        if ($forcedns) {
            /* redirect plain DNS that is not aimed at us to the local resolver */
            $fw->registerForwardRule(500, [
                'interface' => $intf,
                'ipprotocol' => 'inet',
                'protocol' => 'tcp/udp',
                'to' => '(self)',
                'to_not' => true,
                'to_port' => '53',
                'target' => '127.0.0.1',
                'local-port' => '53',
                /* "rdr pass": no separate filter rule needed (note: a literal true would loosely equal 'rule') */
                'pass' => 'pass',
                'descr' => 'Minnosh: enforce local DNS',
            ]);
        }
    }

    minnosh_firewall_access($fw, $mdl, $mapping);
    minnosh_firewall_geo($fw, $mdl, $mapping, $protected);
    minnosh_firewall_vpn($fw, $mdl, $mapping);
}

/**
 * Access between networks. Only pairs the user explicitly set exist in the model; everything
 * else keeps following the regular OPNsense rules ("unmanaged").
 */
function minnosh_firewall_access(\OPNsense\Firewall\Plugin $fw, $mdl, $mapping)
{
    $internet = [];
    foreach ($mdl->access->rule->iterateItems() as $rule) {
        $from = (string)$rule->from;
        $to = (string)$rule->to;
        if (!isset($mapping[$from]) || ($to !== 'wan' && !isset($mapping[$to]))) {
            continue;
        }
        $allow = !$rule->allow->isEmpty();
        if ($to === 'wan') {
            /* internet decisions go last, after all network-to-network decisions */
            $internet[$from] = $allow;
            continue;
        }
        $fw->registerFilterRule(110000, [
            'type' => $allow ? 'pass' : 'block',
            'interface' => $from,
            'direction' => 'in',
            'ipprotocol' => 'inet',
            'quick' => true,
            'from' => $from,
            'to' => $to,
            'descr' => sprintf('Minnosh: %s %s to %s', $allow ? 'allow' : 'block', $from, $to),
            'label' => minnosh_label("access-{$from}-{$to}"),
            '#ref' => 'ui/minnosh#net',
        ]);
    }
    foreach ($internet as $from => $allow) {
        $fw->registerFilterRule(120000, [
            'type' => $allow ? 'pass' : 'block',
            'interface' => $from,
            'direction' => 'in',
            'ipprotocol' => 'inet',
            'quick' => true,
            'from' => $from,
            'to' => '(self)',
            'to_not' => true,
            'descr' => sprintf('Minnosh: %s %s to internet', $allow ? 'allow' : 'block', $from),
            'label' => minnosh_label("access-{$from}-wan"),
            '#ref' => 'ui/minnosh#net',
        ]);
    }
}

/**
 * Country blocking via the minnosh_geo GeoIP alias (kept up to date by OPNsense's alias job).
 */
function minnosh_firewall_geo(\OPNsense\Firewall\Plugin $fw, $mdl, $mapping, $protected)
{
    if ($mdl->geo->enabled->isEmpty() || empty($mdl->geo->countries->getValues()) || !isset($mapping['wan'])) {
        return;
    }
    $fw->registerFilterRule(100000, [
        'type' => 'block',
        'interface' => 'wan',
        'direction' => 'in',
        'ipprotocol' => 'inet46',
        'quick' => true,
        'from' => '<' . \OPNsense\Minnosh\Catalog::GEO_ALIAS . '>',
        'descr' => 'Minnosh: block countries (incoming)',
        'label' => minnosh_label('geo-in'),
        '#ref' => 'ui/minnosh#geo',
    ]);
    if ((string)$mdl->geo->direction === 'both') {
        foreach ($protected as $intf) {
            if (isset($mapping[$intf])) {
                $fw->registerFilterRule(100000, [
                    'type' => 'block',
                    'interface' => $intf,
                    'direction' => 'in',
                    'ipprotocol' => 'inet46',
                    'quick' => true,
                    'to' => '<' . \OPNsense\Minnosh\Catalog::GEO_ALIAS . '>',
                    'descr' => 'Minnosh: block countries (outgoing)',
                    'label' => minnosh_label('geo-out-' . $intf),
                    '#ref' => 'ui/minnosh#geo',
                ]);
            }
        }
    }
}

/**
 * WireGuard connections. OPNsense neither opens the listen port nor NATs unassigned instances,
 * and traffic arriving on the "wireguard" interface group is denied unless a rule passes it.
 *  - remote access: devices reach only the networks chosen for the connection (+ the firewall's
 *    DNS); "all traffic" additionally reaches the internet (NATed), never unchosen networks
 *  - site to site:  remote networks <-> chosen local networks, both directions, no NAT
 */
function minnosh_firewall_vpn(\OPNsense\Firewall\Plugin $fw, $mdl, $mapping)
{
    if (!class_exists('\OPNsense\Wireguard\Server') || !isset($mapping['wan'])) {
        return;
    }
    if ((new \OPNsense\Wireguard\General())->enabled->isEmpty()) {
        return;
    }
    $servers = new \OPNsense\Wireguard\Server();
    \OPNsense\Minnosh\Vpn::migrate($mdl, $servers);
    $internal = [];
    foreach ($mdl->getProtectedInterfaces() as $key) {
        if (isset($mapping[$key])) {
            $internal[] = $key;
        }
    }
    /* every internal network (also ones Minnosh doesn't protect): "all traffic" must not leak into them */
    $allInternal = [];
    foreach (array_keys($mapping) as $key) {
        if (preg_match('/^(lan|opt[0-9]+)$/', $key) && $key !== 'wan' && \OPNsense\Minnosh\Vpn::interfaceNetwork($key) !== null
            && empty($mapping[$key]['gateway'])) {
            $allInternal[] = $key;
        }
    }
    foreach (\OPNsense\Minnosh\Vpn::connections($mdl, $servers) as $cuuid => list($conn, $server)) {
        if ($server->enabled->isEmpty()) {
            continue;
        }
        $id = substr($cuuid, 0, 8);
        $name = (string)$server->name;
        list($addr, $bits) = explode('/', explode(',', (string)$server->tunneladdress)[0]);
        $mask = (~0 << (32 - (int)$bits)) & 0xffffffff;
        $tunnel = long2ip(ip2long($addr) & $mask) . '/' . (int)$bits;
        $chosen = array_values(array_intersect($conn->networks->getValues(), $internal));
        $base = ['interface' => 'wireguard', 'direction' => 'in', 'ipprotocol' => 'inet', 'quick' => true, '#ref' => 'ui/minnosh#vpn'];

        $fw->registerFilterRule(100000, [
            'type' => 'pass', 'interface' => 'wan', 'direction' => 'in', 'ipprotocol' => 'inet', 'protocol' => 'udp',
            'quick' => true, 'to' => '(self)', 'to_port' => (string)$server->port,
            'descr' => "Minnosh: VPN {$name}", 'label' => minnosh_label("vpn-wan-{$id}"), '#ref' => 'ui/minnosh#vpn',
        ]);
        if (!isset($mapping['wireguard'])) {
            continue;
        }

        if ((string)$conn->kind === 'site') {
            $remote = $conn->remote_networks->getValues();
            if (empty($remote) || empty($chosen)) {
                continue;
            }
            foreach ($chosen as $key) {
                $fw->registerFilterRule(105000, array_merge($base, [
                    'type' => 'pass', 'from' => implode(',', $remote), 'to' => $key,
                    'descr' => "Minnosh: VPN {$name} remote to {$key}", 'label' => minnosh_label("vpn-site-in-{$id}-{$key}"),
                ]));
                $fw->registerFilterRule(105000, [
                    'type' => 'pass', 'interface' => $key, 'direction' => 'in', 'ipprotocol' => 'inet', 'quick' => true,
                    'from' => $key, 'to' => implode(',', $remote),
                    'descr' => "Minnosh: VPN {$name} {$key} to remote", 'label' => minnosh_label("vpn-site-out-{$id}-{$key}"),
                    '#ref' => 'ui/minnosh#vpn',
                ]);
            }
            continue;
        }

        /* remote access */
        $fw->registerFilterRule(105000, array_merge($base, [
            'type' => 'pass', 'protocol' => 'tcp/udp', 'from' => $tunnel, 'to' => '(self)', 'to_port' => '53',
            'descr' => "Minnosh: VPN {$name} DNS", 'label' => minnosh_label("vpn-dns-{$id}"),
        ]));
        foreach ($chosen as $key) {
            $fw->registerFilterRule(105000, array_merge($base, [
                'type' => 'pass', 'from' => $tunnel, 'to' => $key,
                'descr' => "Minnosh: VPN {$name} to {$key}", 'label' => minnosh_label("vpn-net-{$id}-{$key}"),
            ]));
        }
        if ((string)$conn->mode === 'full') {
            if (empty($chosen)) {
                /* internet only: not even the firewall itself (except DNS above) */
                $fw->registerFilterRule(105000, array_merge($base, [
                    'type' => 'block', 'from' => $tunnel, 'to' => '(self)',
                    'descr' => "Minnosh: VPN {$name} not to firewall", 'label' => minnosh_label("vpn-deny-{$id}-self"),
                ]));
            }
            foreach (array_diff($allInternal, $chosen) as $key) {
                $fw->registerFilterRule(105000, array_merge($base, [
                    'type' => 'block', 'from' => $tunnel, 'to' => $key,
                    'descr' => "Minnosh: VPN {$name} not to {$key}", 'label' => minnosh_label("vpn-deny-{$id}-{$key}"),
                ]));
            }
            $fw->registerFilterRule(106000, array_merge($base, [
                'type' => 'pass', 'from' => $tunnel,
                'descr' => "Minnosh: VPN {$name} to internet", 'label' => minnosh_label("vpn-inet-{$id}"),
            ]));
            $fw->registerSourceNatRule(200, [
                'interface' => 'wan', 'ipprotocol' => 'inet', 'source' => ['network' => $tunnel],
                'destination' => ['any' => true], 'descr' => "Minnosh: VPN {$name} to internet",
            ]);
        }
    }
}

/**
 * Schedules are evaluated every minute (OPNsense's own schedules only every 15 minutes).
 */
function minnosh_cron()
{
    return [
        ['autocron' => ['/usr/local/sbin/configctl -d minnosh schedule', '*']],
        /* free country database refresh (only acts when country blocking is on and no other source is set) */
        ['autocron' => ['/usr/local/sbin/configctl -d minnosh geoip normal', '40', '4']],
    ];
}
