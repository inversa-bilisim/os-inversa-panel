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
 * WireGuard: OPNsense does not open the listen port nor NAT unassigned instances itself.
 */
function minnosh_firewall_vpn(\OPNsense\Firewall\Plugin $fw, $mdl, $mapping)
{
    if (!class_exists('\OPNsense\Wireguard\Server') || !isset($mapping['wan'])) {
        return;
    }
    $general = new \OPNsense\Wireguard\General();
    $own = \OPNsense\Minnosh\Vpn::instance(new \OPNsense\Wireguard\Server());
    if ($general->enabled->isEmpty() || $own === null || $own->enabled->isEmpty()) {
        return;
    }
    $tunnel = explode(',', (string)$own->tunneladdress)[0];
    list($addr, $bits) = explode('/', $tunnel);
    $mask = (~0 << (32 - (int)$bits)) & 0xffffffff;
    $network = long2ip(ip2long($addr) & $mask) . '/' . $bits;

    $fw->registerFilterRule(100000, [
        'type' => 'pass',
        'interface' => 'wan',
        'direction' => 'in',
        'ipprotocol' => 'inet',
        'protocol' => 'udp',
        'quick' => true,
        'to' => '(self)',
        'to_port' => (string)$own->port,
        'descr' => 'Minnosh: WireGuard VPN',
        'label' => minnosh_label('vpn-wan'),
        '#ref' => 'ui/minnosh#vpn',
    ]);
    if (isset($mapping['wireguard'])) {
        $fw->registerFilterRule(100000, [
            'type' => 'pass',
            'interface' => 'wireguard',
            'direction' => 'in',
            'ipprotocol' => 'inet',
            'quick' => true,
            'from' => $network,
            'descr' => 'Minnosh: traffic from VPN devices',
            'label' => minnosh_label('vpn-in'),
            '#ref' => 'ui/minnosh#vpn',
        ]);
    }
    $fw->registerSourceNatRule(200, [
        'interface' => 'wan',
        'ipprotocol' => 'inet',
        'source' => ['network' => $network],
        'destination' => ['any' => true],
        'descr' => 'Minnosh: VPN devices to internet',
    ]);
}

/**
 * Schedules are evaluated every minute (OPNsense's own schedules only every 15 minutes).
 */
function minnosh_cron()
{
    return [['autocron' => ['/usr/local/sbin/configctl -d minnosh schedule', '*']]];
}
