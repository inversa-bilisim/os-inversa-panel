<?php

/*
 * SPDX-License-Identifier: BSD-2-Clause
 * Copyright (C) 2026 Inversa Bilişim
 */

/**
 * Automatic firewall rules generated from Minnosh settings.
 *
 * Rules are registered before user rules (floating user rules start at priority 200000),
 * so "internet cut" cannot be overruled by a broad pass rule on the interface.
 */
function minnosh_firewall(\OPNsense\Firewall\Plugin $fw)
{
    $mdl = new \OPNsense\Minnosh\Minnosh();
    if ($mdl->general->enabled->isEmpty()) {
        return;
    }

    $protected = $mdl->getProtectedInterfaces();
    $blocked = $mdl->getBlockedMacs();
    $forcedns = !$mdl->filtering->forcedns->isEmpty();

    foreach ($fw->getInterfaceMapping() as $intf => $intfinfo) {
        if (!in_array($intf, $protected)) {
            continue;
        }

        if (!empty($blocked)) {
            /* devices in the MAC alias may still talk to the firewall itself (DNS, DHCP, GUI) */
            $fw->registerFilterRule(
                100000,
                [
                    'type' => 'block',
                    'interface' => $intf,
                    'direction' => 'in',
                    'ipprotocol' => 'inet46',
                    'quick' => true,
                    'from' => '<' . \OPNsense\Minnosh\Catalog::BLOCKED_ALIAS . '>',
                    'to' => '(self)',
                    'to_not' => true,
                    'descr' => 'Minnosh: internet access cut for device',
                    '#ref' => 'ui/minnosh#devices',
                ]
            );
        }

        if ($forcedns) {
            /* redirect plain DNS that is not aimed at us to the local resolver */
            $fw->registerForwardRule(
                500,
                [
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
                ]
            );
        }
    }
}
