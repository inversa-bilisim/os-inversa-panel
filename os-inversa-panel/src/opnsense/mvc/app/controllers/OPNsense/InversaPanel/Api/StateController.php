<?php

/*
 * SPDX-License-Identifier: BSD-2-Clause
 * Copyright (C) 2026 Inversa Bilişim
 */

namespace OPNsense\InversaPanel\Api;

use OPNsense\Base\ApiControllerBase;
use OPNsense\InversaPanel\Catalog;
use OPNsense\InversaPanel\Dhcp;
use OPNsense\InversaPanel\InversaPanel;
use OPNsense\InversaPanel\Rollback;

/**
 * Read the complete Inversa Panel configuration in the shape the single page UI uses.
 */
class StateController extends ApiControllerBase
{
    public function getAction()
    {
        $mdl = new InversaPanel();

        $devices = [];
        foreach ($mdl->devices->device->iterateItems() as $device) {
            $devices[(string)$device->mac] = [
                'name' => (string)$device->name,
                'type' => (string)$device->type,
                'blocked' => !$device->blocked->isEmpty(),
                'approved' => !$device->approved->isEmpty(),
            ];
        }

        $filtering = [];
        foreach (array_merge(array_keys(Catalog::CATEGORIES), ['safesearch', 'forcedns']) as $key) {
            $filtering[$key] = !$mdl->filtering->$key->isEmpty();
        }
        $filtering['apps'] = $mdl->filtering->apps->getValues();
        $filtering['allowlist'] = $mdl->filtering->allowlist->getValues();
        $filtering['denylist'] = $mdl->filtering->denylist->getValues();
        $filtering['response'] = (string)$mdl->filtering->response;

        $interfaces = [];
        foreach ($mdl->general->interfaces->getNodeData() as $key => $option) {
            /* protecting the uplink makes no sense, keep it out of the choices */
            if ($key === 'wan') {
                continue;
            }
            $interfaces[] =['key' => $key, 'name' => $option['value'], 'selected' => !empty($option['selected'])];
        }

        $apps = [];
        foreach ($mdl->filtering->apps->getNodeData() as $key => $option) {
            $apps[] = ['key' => $key, 'name' => $option['value']];
        }

        $schedules = [];
        foreach ($mdl->schedules->schedule->iterateItems() as $uuid => $node) {
            $schedules[] = [
                'uuid' => $uuid,
                'enabled' => !$node->enabled->isEmpty(),
                'name' => (string)$node->name,
                'devices' => $node->devices->getValues(),
                'days' => array_map('intval', $node->days->getValues()),
                'start' => (string)$node->start,
                'end' => (string)$node->end,
                'action' => (string)$node->action,
                'apps' => $node->apps->getValues(),
            ];
        }
        $access = [];
        foreach ($mdl->access->rule->iterateItems() as $node) {
            $access[(string)$node->from . '>' . (string)$node->to] = !$node->allow->isEmpty();
        }
        $kinds = [];
        $approval = [];
        foreach ($mdl->networks->network->iterateItems() as $node) {
            $kinds[(string)$node->interface] = (string)$node->kind;
            if (!$node->approval->isEmpty()) {
                $approval[(string)$node->interface] = true;
            }
        }

        $reservations = [];
        $dhcpNets = [];
        if (class_exists('\OPNsense\Dnsmasq\Dnsmasq')) {
            $dnsmasq = new \OPNsense\Dnsmasq\Dnsmasq();
            foreach (Dhcp::reservations($dnsmasq) as $mac => $r) {
                $reservations[$mac] = $r['ip'];
            }
            foreach (Dhcp::servedNetworks($dnsmasq) as $key => list($cidr, $gw, $from, $to)) {
                $dhcpNets[] = ['key' => $key, 'cidr' => $cidr, 'gateway' => $gw, 'from' => $from, 'to' => $to];
            }
        }

        return [
            'general' => [
                'enabled' => !$mdl->general->enabled->isEmpty(),
                'language' => (string)$mdl->general->language,
                'interfaces' => $mdl->getProtectedInterfaces(),
                'dnsstats' => !$mdl->general->dnsstats->isEmpty(),
                'welcomed' => !$mdl->general->welcomed->isEmpty(),
            ],
            'devices' => (object)$devices,
            /* fixed addresses (Dnsmasq hosts) and the networks they can be in */
            'reservations' => (object)$reservations,
            'filtering' => $filtering,
            'schedules' => $schedules,
            'access' => (object)$access,
            'kinds' => (object)$kinds,
            /* networks on which new devices wait for approval */
            'approval' => (object)$approval,
            'guest' => [
                'limit' => !$mdl->guest->limit->isEmpty(),
                'down' => (int)(string)$mdl->guest->down,
                'up' => (int)(string)$mdl->guest->up,
            ],
            'geo' => [
                'enabled' => !$mdl->geo->enabled->isEmpty(),
                'direction' => (string)$mdl->geo->direction,
                'countries' => $mdl->geo->countries->getValues(),
                'mode' => (string)$mdl->geo->mode,
                'allowed' => $mdl->geo->allowed->getValues(),
                'vpnexempt' => !$mdl->geo->vpnexempt->isEmpty(),
            ],
            'ips' => [
                'enabled' => !$mdl->ips->enabled->isEmpty(),
                'mode' => (string)$mdl->ips->mode,
                'groups' => $mdl->ips->groups->getValues(),
            ],
            'vpn' => [
                'mode' => (string)$mdl->vpn->mode,
                'endpoint' => (string)$mdl->vpn->endpoint,
            ],
            /* a change that waits for its confirmation (seconds left), see Rollback */
            'rollback' => Rollback::pending(),
            'options' => [
                'interfaces' => $interfaces,
                'apps' => $apps,
                'dhcp_networks' => $dhcpNets,
            ],
        ];
    }
}
