<?php

/*
 * SPDX-License-Identifier: BSD-2-Clause
 * Copyright (C) 2026 Inversa Bilişim
 */

namespace OPNsense\InversaPanel;

use OPNsense\Base\BaseModel;

class InversaPanel extends BaseModel
{
    /* colours a network can have; the first is the default of the main network (LAN) */
    const COLORS = ['#1F4FC7', '#0F766E', '#7C3AED', '#B45309', '#475569', '#BE185D', '#15803D', '#0E7490'];

    /* the colours the kinds of network had (up to 0.3) */
    const KIND_COLORS = ['home' => '#1F4FC7', 'iot' => '#0F766E', 'guest' => '#7C3AED', 'camera' => '#B45309', 'server' => '#475569'];

    /**
     * what Inversa Panel stores about a network
     * @param string $key interface key (lan, opt1, ...)
     * @param bool $create add the entry when there is none
     */
    public function networkNode($key, $create = false)
    {
        foreach ($this->networks->network->iterateItems() as $node) {
            if ((string)$node->interface === $key) {
                return $node;
            }
        }
        if (!$create) {
            return null;
        }
        $node = $this->networks->network->Add();
        $node->interface->setValue($key);
        return $node;
    }

    /**
     * colour of a network: the chosen one, otherwise one that stays the same for that network
     */
    public function networkColor($key)
    {
        $node = $this->networkNode($key);
        if ($node !== null && (string)$node->color !== '') {
            return (string)$node->color;
        }
        if ($key === 'lan') {
            return self::COLORS[0];
        }
        return self::COLORS[1 + ((int)preg_replace('/\D/', '', $key) % (count(self::COLORS) - 1))];
    }

    /**
     * access decisions between networks: ["from>to" => bool]
     */
    public function accessMap()
    {
        $map = [];
        foreach ($this->access->rule->iterateItems() as $rule) {
            $map[(string)$rule->from . '>' . (string)$rule->to] = !$rule->allow->isEmpty();
        }
        return $map;
    }

    /**
     * set (true / false) or drop (null: OPNsense's own rules decide) one access decision
     */
    public function setAccess($from, $to, $allow)
    {
        foreach ($this->access->rule->iterateItems() as $uuid => $rule) {
            if ((string)$rule->from === $from && (string)$rule->to === $to) {
                $this->access->rule->del($uuid);
            }
        }
        if ($allow !== null) {
            $rule = $this->access->rule->Add();
            $rule->from->setValue($from);
            $rule->to->setValue($to);
            $rule->allow->setValue($allow ? '1' : '0');
        }
    }

    /**
     * the networks an isolated network still talks to: allowed in both directions
     */
    public function reachOf($key, array $others)
    {
        $map = $this->accessMap();
        return array_values(array_filter($others, fn($o) => $o !== $key && !empty($map["$key>$o"]) && !empty($map["$o>$key"])));
    }

    /**
     * Isolate a network, or end its isolation.
     *  - isolated: it talks to the networks in $reach (both directions) and to no other; internet stays open
     *  - isolation ended: its decisions go back to OPNsense's own rules, except towards networks that
     *    are isolated themselves and did not choose it
     *  - was not isolated and is not: nothing is touched
     * @param array $others keys of all other internal networks
     */
    public function setIsolation($key, $isolated, array $reach, array $others)
    {
        $own = $this->networkNode($key, true);
        $was = !$own->isolated->isEmpty();
        $own->isolated->setValue($isolated ? '1' : '0');
        if (!$isolated && !$was) {
            /* nothing to end: decisions made by hand in the access table stay as they are */
            return;
        }
        if (!$isolated) {
            $this->setAccess($key, 'wan', null);
        }
        foreach ($others as $other) {
            if ($other === $key) {
                continue;
            }
            $node = $this->networkNode($other);
            $otherIsolated = $node !== null && !$node->isolated->isEmpty();
            if ($isolated) {
                $allow = in_array($other, $reach);
            } elseif ($otherIsolated) {
                $allow = in_array($key, $this->reachOf($other, $others));
            } else {
                $allow = null;
            }
            $this->setAccess($key, $other, $allow);
            $this->setAccess($other, $key, $allow);
        }
        if ($isolated) {
            $this->setAccess($key, 'wan', true);
        }
    }

    /**
     * Settings of earlier versions: the kind of a network becomes its colour, the one speed limit
     * of all guest networks becomes the limit of each of them, and a network that was shut off
     * from all others counts as isolated.
     * @return bool something changed (the caller saves)
     */
    public function migrateNetworks()
    {
        $changed = false;
        $guestLimit = !$this->guest->limit->isEmpty();
        $keys = [];
        foreach ($this->networks->network->iterateItems() as $node) {
            $keys[] = (string)$node->interface;
        }
        $map = $this->accessMap();
        foreach ($this->networks->network->iterateItems() as $node) {
            $key = (string)$node->interface;
            if ((string)$node->color === '') {
                $node->color->setValue(self::KIND_COLORS[(string)$node->kind] ?? $this->networkColor($key));
                $shut = count($keys) > 1;
                foreach ($keys as $other) {
                    if ($other !== $key && (($map["$key>$other"] ?? true) !== false || ($map["$other>$key"] ?? true) !== false)) {
                        $shut = false;
                    }
                }
                if ($shut) {
                    $node->isolated->setValue('1');
                }
                $changed = true;
            }
            if ($guestLimit && (string)$node->kind === 'guest') {
                $node->limit->setValue('1');
                $node->down->setValue((string)$this->guest->down);
                $node->up->setValue((string)$this->guest->up);
                $changed = true;
            }
        }
        if ($guestLimit) {
            $this->guest->limit->setValue('0');
            $changed = true;
        }
        return $changed;
    }

    /**
     * find a device node by MAC address
     * @param string $mac lowercase MAC address
     * @return \OPNsense\Base\FieldTypes\ArrayField|null
     */
    public function getDeviceByMac($mac)
    {
        foreach ($this->devices->device->iterateItems() as $device) {
            if ((string)$device->mac === $mac) {
                return $device;
            }
        }
        return null;
    }

    /**
     * MAC addresses of devices whose internet access is cut
     * @return array
     */
    public function getBlockedMacs()
    {
        $result = [];
        foreach ($this->devices->device->iterateItems() as $device) {
            if (!$device->blocked->isEmpty()) {
                $result[] = (string)$device->mac;
            }
        }
        return $result;
    }

    /**
     * MAC addresses of approved devices
     * @return array
     */
    public function getApprovedMacs()
    {
        $result = [];
        foreach ($this->devices->device->iterateItems() as $device) {
            if (!$device->approved->isEmpty()) {
                $result[] = (string)$device->mac;
            }
        }
        return $result;
    }

    /**
     * protected networks on which new devices wait for approval
     * @return array interface keys
     */
    public function getApprovalInterfaces()
    {
        $protected = $this->getProtectedInterfaces();
        $result = [];
        foreach ($this->networks->network->iterateItems() as $node) {
            if (!$node->approval->isEmpty() && in_array((string)$node->interface, $protected)) {
                $result[] = (string)$node->interface;
            }
        }
        return array_values(array_unique($result));
    }

    /**
     * protected interface keys (lan, opt1, ...)
     * @return array
     */
    public function getProtectedInterfaces()
    {
        return array_values(array_filter(explode(',', (string)$this->general->interfaces)));
    }
}
