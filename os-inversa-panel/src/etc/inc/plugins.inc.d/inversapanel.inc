<?php

/*
 * SPDX-License-Identifier: BSD-2-Clause
 * Copyright (C) 2026 Inversa Bilişim
 */

/**
 * Automatic firewall rules generated from Inversa Panel settings.
 *
 * Nothing here is written to config.xml: rules exist only while the plugin is installed.
 * They are registered before user rules (floating user rules start at priority 200000),
 * so an explicit Inversa Panel decision (cut a device, block a network) is not overruled by
 * a broad pass rule. Labels are stable so their counters can be read back.
 */
function inversapanel_label($id)
{
    return md5('inversapanel-' . $id);
}

function inversapanel_firewall(\OPNsense\Firewall\Plugin $fw)
{
    $mdl = new \OPNsense\InversaPanel\InversaPanel();
    if ($mdl->general->enabled->isEmpty()) {
        return;
    }

    $protected = $mdl->getProtectedInterfaces();
    $mapping = iterator_to_array($fw->getInterfaceMapping());
    $blocked = $mdl->getBlockedMacs();
    $forcedns = !$mdl->filtering->forcedns->isEmpty();
    $approval = $mdl->getApprovalInterfaces();

    /* filled every minute by the schedule job, keeps its contents over filter reloads */
    $fw->registerTable('inversapanel_sched', true);

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
            '#ref' => 'ui/inversapanel#devices',
        ];
        if (!empty($blocked)) {
            /* devices in the MAC alias may still talk to the firewall itself (DNS, DHCP, GUI) */
            $fw->registerFilterRule(100000, array_merge($cut, [
                'from' => '<' . \OPNsense\InversaPanel\Catalog::BLOCKED_ALIAS . '>',
                'descr' => 'Inversa Panel: internet access cut for device',
                'label' => inversapanel_label('cut-' . $intf),
            ]));
        }
        if (in_array($intf, $approval)) {
            /*
             * new devices wait for approval: whoever is not in the alias of approved devices gets
             * no further than the firewall itself (DHCP, DNS, the GUI to approve one's own device)
             */
            $fw->registerFilterRule(100000, array_merge($cut, [
                'from' => '<' . \OPNsense\InversaPanel\Catalog::APPROVED_ALIAS . '>',
                'from_not' => true,
                'descr' => 'Inversa Panel: device waits for approval',
                'label' => inversapanel_label('approval-' . $intf),
            ]));
        }
        $fw->registerFilterRule(100000, array_merge($cut, [
            'from' => '<inversapanel_sched>',
            'descr' => 'Inversa Panel: internet access cut by schedule',
            'label' => inversapanel_label('sched-' . $intf),
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
                'descr' => 'Inversa Panel: enforce local DNS',
            ]);
        }
    }

    /* addresses somebody chose to refuse on the attacks page; logged, so further tries show up there */
    $refused = array_values(array_filter($mdl->logs->blocked->getValues(), fn($ip) => filter_var($ip, FILTER_VALIDATE_IP)));
    if (!empty($refused) && isset($mapping['wan'])) {
        foreach ([['inet', FILTER_FLAG_IPV4], ['inet6', FILTER_FLAG_IPV6]] as list($family, $flag)) {
            $list = array_filter($refused, fn($ip) => filter_var($ip, FILTER_VALIDATE_IP, $flag));
            if (!empty($list)) {
                $fw->registerFilterRule(100000, [
                    'type' => 'block', 'interface' => 'wan', 'direction' => 'in', 'ipprotocol' => $family, 'quick' => true,
                    'log' => true, 'from' => implode(',', $list),
                    'descr' => 'Inversa Panel: blocked addresses', 'label' => inversapanel_label('blockip'),
                    '#ref' => 'ui/inversapanel#attacks',
                ]);
            }
        }
    }

    inversapanel_firewall_access($fw, $mdl, $mapping);
    inversapanel_firewall_geo($fw, $mdl, $mapping, $protected);
    inversapanel_firewall_vpn($fw, $mdl, $mapping);
    inversapanel_firewall_ipsec($fw, $mdl, $mapping);
}

/**
 * the priority at which VPN listen ports are opened on WAN: right where the country rules are (same
 * priority, registered after them), so a country rule decides first; "VPN connections are exempt"
 * opens them before it
 */
function inversapanel_vpn_listen_prio($mdl)
{
    return !$mdl->geo->enabled->isEmpty() && !$mdl->geo->vpnexempt->isEmpty() ? 99000 : 100000;
}

/**
 * is this IPv4 address inside the network the device itself is in (no gateway in between)?
 */
function inversapanel_directly_connected($device, $ip)
{
    if (!preg_match('/^[a-z0-9_.]+$/i', (string)$device) || !filter_var($ip, FILTER_VALIDATE_IP, FILTER_FLAG_IPV4)) {
        return false;
    }
    $out = [];
    exec('/sbin/ifconfig ' . escapeshellarg($device) . ' inet 2>/dev/null', $out);
    foreach ($out as $line) {
        if (preg_match('/inet (\S+) netmask (0x[0-9a-f]{8})/', $line, $m)) {
            $mask = hexdec($m[2]);
            if ((ip2long($m[1]) & $mask) === (ip2long($ip) & $mask)) {
                return true;
            }
        }
    }
    return false;
}

/**
 * IPsec site to site connections (OPNsense adds no rules for connections of this kind):
 *  - IKE, NAT traversal and ESP from the other side reach the firewall
 *  - what arrives through the tunnel (interface "enc0") reaches the chosen local networks,
 *    and those reach the networks of the other side
 */
function inversapanel_firewall_ipsec(\OPNsense\Firewall\Plugin $fw, $mdl, $mapping)
{
    if (!\OPNsense\InversaPanel\Ipsec::available() || !isset($mapping['wan'])) {
        return;
    }
    $prio = inversapanel_vpn_listen_prio($mdl);
    foreach (\OPNsense\InversaPanel\Ipsec::connections($mdl, new \OPNsense\IPsec\Swanctl()) as $cuuid => list($conn, $node)) {
        if ($node->enabled->isEmpty()) {
            continue;
        }
        $id = substr($cuuid, 0, 8);
        $name = (string)$node->description;
        $host = (string)$node->remote_addrs;
        /* a name may point somewhere else tomorrow: only an address is used to narrow the rule */
        $from = filter_var($host, FILTER_VALIDATE_IP) ? ['from' => $host] : [];
        if (!empty($from) && inversapanel_directly_connected($mapping['wan']['if'] ?? '', $host)) {
            /* the other side sits in the WAN network itself: answers go straight to it, not to the gateway */
            $from['disablereplyto'] = true;
        }
        $wan = ['type' => 'pass', 'interface' => 'wan', 'direction' => 'in', 'ipprotocol' => 'inet', 'quick' => true,
            'to' => '(self)', 'descr' => "Inversa Panel: VPN {$name} (IPsec)", '#ref' => 'ui/inversapanel#vpn'];
        $fw->registerFilterRule($prio, array_merge($wan, $from, ['protocol' => 'udp', 'to_port' => '500', 'label' => inversapanel_label("ipsec-ike-{$id}")]));
        $fw->registerFilterRule($prio, array_merge($wan, $from, ['protocol' => 'udp', 'to_port' => '4500', 'label' => inversapanel_label("ipsec-natt-{$id}")]));
        $fw->registerFilterRule($prio, array_merge($wan, $from, ['protocol' => 'esp', 'label' => inversapanel_label("ipsec-esp-{$id}")]));

        $remote = $conn->remote_networks->getValues();
        if (empty($remote)) {
            continue;
        }
        foreach ($conn->networks->getValues() as $key) {
            if (!isset($mapping[$key])) {
                continue;
            }
            if (isset($mapping['enc0'])) {
                $fw->registerFilterRule(105000, [
                    'type' => 'pass', 'interface' => 'enc0', 'direction' => 'in', 'ipprotocol' => 'inet', 'quick' => true,
                    'from' => implode(',', $remote), 'to' => $key,
                    'descr' => "Inversa Panel: VPN {$name} remote to {$key}", 'label' => inversapanel_label("ipsec-in-{$id}-{$key}"),
                    '#ref' => 'ui/inversapanel#vpn',
                ]);
            }
            $fw->registerFilterRule(105000, [
                'type' => 'pass', 'interface' => $key, 'direction' => 'in', 'ipprotocol' => 'inet', 'quick' => true,
                'from' => $key, 'to' => implode(',', $remote),
                'descr' => "Inversa Panel: VPN {$name} {$key} to remote", 'label' => inversapanel_label("ipsec-out-{$id}-{$key}"),
                '#ref' => 'ui/inversapanel#vpn',
            ]);
        }
    }
}

/**
 * Access between networks. Only pairs the user explicitly set exist in the model; everything
 * else keeps following the regular OPNsense rules ("unmanaged").
 */
function inversapanel_firewall_access(\OPNsense\Firewall\Plugin $fw, $mdl, $mapping)
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
            'descr' => sprintf('Inversa Panel: %s %s to %s', $allow ? 'allow' : 'block', $from, $to),
            'label' => inversapanel_label("access-{$from}-{$to}"),
            '#ref' => 'ui/inversapanel#nets',
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
            'descr' => sprintf('Inversa Panel: %s %s to internet', $allow ? 'allow' : 'block', $from),
            'label' => inversapanel_label("access-{$from}-wan"),
            '#ref' => 'ui/inversapanel#nets',
        ]);
    }
}

/**
 * Countries, via the inversapanel_geo GeoIP alias (kept up to date by OPNsense's alias job).
 *  - block:      what comes from the chosen countries is refused (optionally also what goes there)
 *  - allow only: what comes in from anywhere but the chosen countries is refused. Incoming only;
 *                connections started from inside are answered through their state, so the
 *                internal networks keep reaching the whole internet.
 */
function inversapanel_firewall_geo(\OPNsense\Firewall\Plugin $fw, $mdl, $mapping, $protected)
{
    if ($mdl->geo->enabled->isEmpty() || !isset($mapping['wan'])) {
        return;
    }
    if ((string)$mdl->geo->mode === 'allow') {
        $allowed = $mdl->geo->allowed->getValues();
        /*
         * Without country data the table of allowed addresses holds the local ranges only and this rule
         * would shut the whole internet out. Until the data is there (first download, a country that
         * has none) nothing is restricted; the page says so.
         */
        if (empty($allowed) || !\OPNsense\InversaPanel\Extras::geoDataFor($allowed)) {
            return;
        }
        $fw->registerFilterRule(100000, [
            'type' => 'block',
            'interface' => 'wan',
            'direction' => 'in',
            'ipprotocol' => 'inet46',
            'quick' => true,
            'from' => '<' . \OPNsense\InversaPanel\Catalog::GEO_ALLOW_ALIAS . '>',
            'from_not' => true,
            /* logged for the attacks page */
            'log' => true,
            'descr' => 'Inversa Panel: only the allowed countries get in',
            'label' => inversapanel_label('geo-in'),
            '#ref' => 'ui/inversapanel#geo',
        ]);
        return;
    }
    if (empty($mdl->geo->countries->getValues())) {
        return;
    }
    $fw->registerFilterRule(100000, [
        'type' => 'block',
        'interface' => 'wan',
        'direction' => 'in',
        'ipprotocol' => 'inet46',
        'quick' => true,
        'from' => '<' . \OPNsense\InversaPanel\Catalog::GEO_ALIAS . '>',
        'log' => true,
        'descr' => 'Inversa Panel: block countries (incoming)',
        'label' => inversapanel_label('geo-in'),
        '#ref' => 'ui/inversapanel#geo',
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
                    'to' => '<' . \OPNsense\InversaPanel\Catalog::GEO_ALIAS . '>',
                    'descr' => 'Inversa Panel: block countries (outgoing)',
                    'label' => inversapanel_label('geo-out-' . $intf),
                    '#ref' => 'ui/inversapanel#geo',
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
function inversapanel_firewall_vpn(\OPNsense\Firewall\Plugin $fw, $mdl, $mapping)
{
    if (!class_exists('\OPNsense\Wireguard\Server') || !isset($mapping['wan'])) {
        return;
    }
    if ((new \OPNsense\Wireguard\General())->enabled->isEmpty()) {
        return;
    }
    $servers = new \OPNsense\Wireguard\Server();
    \OPNsense\InversaPanel\Vpn::migrate($mdl, $servers);
    $clients = new \OPNsense\Wireguard\Client();
    $access = \OPNsense\InversaPanel\Vpn::accessMap($mdl);
    $listenPrio = inversapanel_vpn_listen_prio($mdl);
    $internal = [];
    foreach ($mdl->getProtectedInterfaces() as $key) {
        if (isset($mapping[$key])) {
            $internal[] = $key;
        }
    }
    /* every internal network (also ones Inversa Panel doesn't protect): "all traffic" must not leak into them */
    $allInternal = [];
    foreach (array_keys($mapping) as $key) {
        if (preg_match('/^(lan|opt[0-9]+)$/', $key) && $key !== 'wan' && \OPNsense\InversaPanel\Vpn::interfaceNetwork($key) !== null
            && empty($mapping[$key]['gateway'])) {
            $allInternal[] = $key;
        }
    }
    foreach (\OPNsense\InversaPanel\Vpn::connections($mdl, $servers) as $cuuid => list($conn, $server)) {
        if ($server->enabled->isEmpty()) {
            continue;
        }
        $id = substr($cuuid, 0, 8);
        $name = (string)$server->name;
        list($addr, $bits) = explode('/', explode(',', (string)$server->tunneladdress)[0]);
        $mask = (~0 << (32 - (int)$bits)) & 0xffffffff;
        $tunnel = long2ip(ip2long($addr) & $mask) . '/' . (int)$bits;
        $chosen = array_values(array_intersect($conn->networks->getValues(), $internal));
        $base = ['interface' => 'wireguard', 'direction' => 'in', 'ipprotocol' => 'inet', 'quick' => true, '#ref' => 'ui/inversapanel#vpn'];

        $fw->registerFilterRule($listenPrio, [
            'type' => 'pass', 'interface' => 'wan', 'direction' => 'in', 'ipprotocol' => 'inet', 'protocol' => 'udp',
            'quick' => true, 'to' => '(self)', 'to_port' => (string)$server->port,
            'descr' => "Inversa Panel: VPN {$name}", 'label' => inversapanel_label("vpn-wan-{$id}"), '#ref' => 'ui/inversapanel#vpn',
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
                    'descr' => "Inversa Panel: VPN {$name} remote to {$key}", 'label' => inversapanel_label("vpn-site-in-{$id}-{$key}"),
                ]));
                $fw->registerFilterRule(105000, [
                    'type' => 'pass', 'interface' => $key, 'direction' => 'in', 'ipprotocol' => 'inet', 'quick' => true,
                    'from' => $key, 'to' => implode(',', $remote),
                    'descr' => "Inversa Panel: VPN {$name} {$key} to remote", 'label' => inversapanel_label("vpn-site-out-{$id}-{$key}"),
                    '#ref' => 'ui/inversapanel#vpn',
                ]);
            }
            continue;
        }

        /* remote access */
        /*
         * devices limited to certain addresses come first: their tunnel address may reach those
         * (and the firewall's DNS when allowed), then nothing else. WireGuard accepts a device's
         * packets only from its own tunnel address, so the device cannot pose as another one.
         */
        $linked = array_filter(explode(',', (string)$server->peers));
        foreach ($clients->clients->client->iterateItems() as $puuid => $peer) {
            if (!isset($access[$puuid]) || !in_array($puuid, $linked) || $peer->enabled->isEmpty()) {
                continue;
            }
            $ip = explode('/', explode(',', (string)$peer->tunneladdress)[0])[0];
            if (!filter_var($ip, FILTER_VALIDATE_IP, FILTER_FLAG_IPV4)) {
                continue;
            }
            $pid = substr($puuid, 0, 8);
            $pname = (string)$peer->name;
            if ($access[$puuid]['dns']) {
                $fw->registerFilterRule(105000, array_merge($base, [
                    'type' => 'pass', 'protocol' => 'tcp/udp', 'from' => $ip, 'to' => '(self)', 'to_port' => '53',
                    'descr' => "Inversa Panel: VPN {$name} {$pname} DNS", 'label' => inversapanel_label("vpn-peer-{$pid}-dns"),
                ]));
            }
            foreach ($access[$puuid]['targets'] as $i => $target) {
                list($tip, $tport) = array_pad(explode(':', $target), 2, '');
                /* an address in a network the connection no longer reaches stays closed */
                if (!\OPNsense\InversaPanel\Vpn::inNetworks($tip, $chosen)) {
                    continue;
                }
                $rule = ['type' => 'pass', 'from' => $ip, 'to' => $tip,
                    'descr' => "Inversa Panel: VPN {$name} {$pname} to {$target}", 'label' => inversapanel_label("vpn-peer-{$pid}-{$i}")];
                if ($tport !== '') {
                    $rule['protocol'] = 'tcp/udp';
                    $rule['to_port'] = $tport;
                }
                $fw->registerFilterRule(105000, array_merge($base, $rule));
            }
            $fw->registerFilterRule(105000, array_merge($base, [
                'type' => 'block', 'from' => $ip,
                'descr' => "Inversa Panel: VPN {$name} {$pname} nothing else", 'label' => inversapanel_label("vpn-peer-{$pid}-deny"),
            ]));
        }
        $fw->registerFilterRule(105000, array_merge($base, [
            'type' => 'pass', 'protocol' => 'tcp/udp', 'from' => $tunnel, 'to' => '(self)', 'to_port' => '53',
            'descr' => "Inversa Panel: VPN {$name} DNS", 'label' => inversapanel_label("vpn-dns-{$id}"),
        ]));
        foreach ($chosen as $key) {
            $fw->registerFilterRule(105000, array_merge($base, [
                'type' => 'pass', 'from' => $tunnel, 'to' => $key,
                'descr' => "Inversa Panel: VPN {$name} to {$key}", 'label' => inversapanel_label("vpn-net-{$id}-{$key}"),
            ]));
        }
        if ((string)$conn->mode === 'full') {
            if (empty($chosen)) {
                /* internet only: not even the firewall itself (except DNS above) */
                $fw->registerFilterRule(105000, array_merge($base, [
                    'type' => 'block', 'from' => $tunnel, 'to' => '(self)',
                    'descr' => "Inversa Panel: VPN {$name} not to firewall", 'label' => inversapanel_label("vpn-deny-{$id}-self"),
                ]));
            }
            foreach (array_diff($allInternal, $chosen) as $key) {
                $fw->registerFilterRule(105000, array_merge($base, [
                    'type' => 'block', 'from' => $tunnel, 'to' => $key,
                    'descr' => "Inversa Panel: VPN {$name} not to {$key}", 'label' => inversapanel_label("vpn-deny-{$id}-{$key}"),
                ]));
            }
            $fw->registerFilterRule(106000, array_merge($base, [
                'type' => 'pass', 'from' => $tunnel,
                'descr' => "Inversa Panel: VPN {$name} to internet", 'label' => inversapanel_label("vpn-inet-{$id}"),
            ]));
            $fw->registerSourceNatRule(200, [
                'interface' => 'wan', 'ipprotocol' => 'inet', 'source' => ['network' => $tunnel],
                'destination' => ['any' => true], 'descr' => "Inversa Panel: VPN {$name} to internet",
            ]);
        }
    }
}

/**
 * Schedules are evaluated every minute (OPNsense's own schedules only every 15 minutes).
 */
function inversapanel_cron()
{
    return [
        ['autocron' => ['/usr/local/sbin/configctl -d inversapanel schedule', '*']],
        /* data usage and events for the overview page */
        ['autocron' => ['/usr/local/sbin/configctl -d inversapanel watch', '*']],
        /* attacks, logins and configuration changes for the logs pages */
        ['autocron' => ['/usr/local/sbin/configctl -d inversapanel logcollect', '*']],
        /* tell by Telegram what happened (does nothing unless notifications are set up) */
        ['autocron' => ['/usr/local/sbin/configctl -d inversapanel notify run', '*']],
        /* a copy of the configuration for the Backup page, when it changed since the last one */
        ['autocron' => ['/usr/local/sbin/configctl -d inversapanel backup nightly', '15', '3']],
        /* free country database refresh (only acts when country blocking is on and no other source is set) */
        ['autocron' => ['/usr/local/sbin/configctl -d inversapanel geoip normal', '40', '4']],
    ];
}
