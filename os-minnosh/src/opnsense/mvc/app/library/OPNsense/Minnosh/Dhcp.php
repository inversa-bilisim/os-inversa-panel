<?php

/*
 * SPDX-License-Identifier: BSD-2-Clause
 * Copyright (C) 2026 Inversa Bilişim
 */

namespace OPNsense\Minnosh;

use OPNsense\Core\Config;
use OPNsense\Dnsmasq\Dnsmasq;
use OPNsense\Firewall\Util;

/**
 * Fixed addresses ("static DHCP leases") per device, stored as Dnsmasq hosts (Services >
 * Dnsmasq DNS & DHCP > Hosts), so they show up and stay editable in OPNsense as well.
 */
class Dhcp
{
    /**
     * mac => [ip, uuid, ours] for every Dnsmasq host with a hardware address and an IPv4 address
     */
    public static function reservations(?Dnsmasq $dnsmasq = null)
    {
        $dnsmasq = $dnsmasq ?? new Dnsmasq();
        $out = [];
        foreach ($dnsmasq->hosts->iterateItems() as $uuid => $host) {
            $ip = '';
            foreach (explode(',', (string)$host->ip) as $candidate) {
                if (Util::isIpv4Address($candidate)) {
                    $ip = $candidate;
                    break;
                }
            }
            if ($ip === '') {
                continue;
            }
            foreach (explode(',', strtolower((string)$host->hwaddr)) as $mac) {
                if (preg_match('/^([0-9a-f]{2}:){5}[0-9a-f]{2}$/', $mac)) {
                    $out[$mac] = ['ip' => $ip, 'uuid' => $uuid, 'ours' => strpos((string)$host->descr, 'Minnosh') === 0];
                }
            }
        }
        return $out;
    }

    /**
     * networks Dnsmasq hands out addresses on: key => [cidr, gateway ip, range from, range to]
     */
    public static function servedNetworks(?Dnsmasq $dnsmasq = null)
    {
        $dnsmasq = $dnsmasq ?? new Dnsmasq();
        $out = [];
        foreach ($dnsmasq->dhcp_ranges->iterateItems() as $range) {
            $key = (string)$range->interface;
            if (!Util::isIpv4Address((string)$range->start_addr) || $key === '') {
                continue;
            }
            $node = Config::getInstance()->object()->interfaces->$key;
            if ($node === null || !Util::isIpv4Address((string)$node->ipaddr)) {
                continue;
            }
            $out[$key] = [Vpn::interfaceNetwork($key), (string)$node->ipaddr, (string)$range->start_addr, (string)$range->end_addr];
        }
        return $out;
    }

    private static function inCidr($ip, $cidr)
    {
        list($net, $bits) = explode('/', $cidr);
        $mask = (int)$bits === 0 ? 0 : (~0 << (32 - (int)$bits)) & 0xffffffff;
        return (ip2long($ip) & $mask) === (ip2long($net) & $mask);
    }

    /**
     * set ($ip non-empty) or remove ($ip empty) the fixed address of a device
     * @return bool something changed
     */
    public static function set(Dnsmasq $dnsmasq, $mac, $ip, $name = '')
    {
        $mac = strtolower(trim((string)$mac));
        $ip = trim((string)$ip);
        if (!preg_match('/^([0-9a-f]{2}:){5}[0-9a-f]{2}$/', $mac)) {
            throw new \InvalidArgumentException("invalid MAC address: $mac");
        }
        $current = self::reservations($dnsmasq);
        $existing = $current[$mac] ?? null;

        if ($ip === '') {
            if ($existing === null) {
                return false;
            }
            $host = $dnsmasq->getNodeByReference('hosts.' . $existing['uuid']);
            $macs = array_values(array_diff(explode(',', strtolower((string)$host->hwaddr)), [$mac]));
            if (empty($macs)) {
                $dnsmasq->hosts->del($existing['uuid']);
            } else {
                /* the entry is shared with other hardware addresses: only drop this one */
                $host->hwaddr = implode(',', $macs);
            }
            return true;
        }

        if (!Util::isIpv4Address($ip)) {
            throw new \InvalidArgumentException("invalid IP address: $ip");
        }
        $fits = null;
        foreach (self::servedNetworks($dnsmasq) as $key => list($cidr, $gateway)) {
            if ($cidr !== null && self::inCidr($ip, $cidr)) {
                $fits = $key;
                list($net, $bits) = explode('/', $cidr);
                $last = long2ip(ip2long($net) + (1 << (32 - (int)$bits)) - 1);
                if ($ip === $gateway || $ip === $net || $ip === $last) {
                    throw new \InvalidArgumentException("$ip cannot be given to a device (gateway, network or broadcast address)");
                }
            }
        }
        if ($fits === null) {
            throw new \InvalidArgumentException("$ip is not inside a network with DHCP");
        }
        foreach ($current as $otherMac => $other) {
            if ($otherMac !== $mac && $other['ip'] === $ip) {
                throw new \InvalidArgumentException("$ip is already reserved for $otherMac");
            }
        }
        if ($existing !== null && $existing['ip'] === $ip) {
            return false;
        }

        $hostname = strtolower(trim(preg_replace('/[^A-Za-z0-9-]+/', '-', strtr((string)$name, [
            'ç' => 'c', 'Ç' => 'c', 'ğ' => 'g', 'Ğ' => 'g', 'ı' => 'i', 'İ' => 'i', 'ö' => 'o', 'Ö' => 'o',
            'ş' => 's', 'Ş' => 's', 'ü' => 'u', 'Ü' => 'u',
        ])), '-'));
        if ($existing !== null) {
            $host = $dnsmasq->getNodeByReference('hosts.' . $existing['uuid']);
            $ips = array_values(array_filter(explode(',', (string)$host->ip), fn($a) => !Util::isIpv4Address($a)));
            array_unshift($ips, $ip);
            $host->ip = implode(',', $ips);
        } else {
            $host = $dnsmasq->hosts->Add();
            $host->hwaddr = $mac;
            $host->ip = $ip;
            if ($hostname !== '' && strlen($hostname) <= 63) {
                $host->host = $hostname;
            }
            $host->descr = 'Minnosh';
        }
        return true;
    }

    /**
     * validate and put into the in-memory config (the caller saves); returns problems, empty = ok
     */
    public static function store(Dnsmasq $dnsmasq)
    {
        $messages = [];
        foreach ($dnsmasq->performValidation() as $msg) {
            if (strpos($msg->getField(), 'hosts.') !== false) {
                $messages[] = $msg->getMessage();
            }
        }
        if (!empty($messages)) {
            return array_values(array_unique($messages));
        }
        $dnsmasq->serializeToConfig(false, true);
        return [];
    }
}
