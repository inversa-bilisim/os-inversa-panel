<?php

/*
 * SPDX-License-Identifier: BSD-2-Clause
 * Copyright (C) 2026 Inversa Bilişim
 */

namespace OPNsense\Minnosh;

use OPNsense\Core\Backend;
use OPNsense\Core\Config;
use OPNsense\Dnsmasq\Dnsmasq;
use OPNsense\Firewall\Util;
use OPNsense\Interfaces\Vlan;
use OPNsense\Routing\Gateways;

/**
 * Internet connection, internal networks and ports, read from and written to OPNsense's own
 * configuration. Writes follow core's setup wizard (OPNsense/Core/InitialSetup.php).
 *
 * Anything Minnosh cannot represent faithfully (multi-WAN, LAGG/bridge members, dynamic LAN
 * addressing...) is reported as read-only instead of being simplified.
 */
class Network
{
    private $backend;

    public function __construct()
    {
        $this->backend = new Backend();
    }

    private static function cfg()
    {
        return Config::getInstance()->object();
    }

    /**
     * vlanif => [parent, tag, uuid]
     */
    private static function vlans()
    {
        $result = [];
        foreach ((new Vlan())->vlan->iterateItems() as $uuid => $node) {
            $result[(string)$node->vlanif] = ['parent' => (string)$node->if, 'tag' => (string)$node->tag, 'uuid' => $uuid];
        }
        return $result;
    }

    private static function ppp($device)
    {
        $cfg = self::cfg();
        if (!isset($cfg->ppps)) {
            return null;
        }
        foreach ($cfg->ppps->ppp as $ppp) {
            if ((string)$ppp->if === $device) {
                return $ppp;
            }
        }
        return null;
    }

    /**
     * physical NICs with link state, from core's "interface list ifconfig"
     */
    public function ports()
    {
        $details = json_decode($this->backend->configdRun('interface list ifconfig'), true) ?? [];
        $result = [];
        foreach ($details as $dev => $info) {
            if (empty($info['is_physical'])) {
                continue;
            }
            $result[$dev] = [
                'device' => $dev,
                'mac' => $info['macaddr_hw'] ?? ($info['macaddr'] ?? ''),
                'link' => ($info['status'] ?? '') === 'active',
                'media' => $info['media'] ?? '',
            ];
        }
        ksort($result, SORT_NATURAL);
        return $result;
    }

    private static function dhcpRange($key)
    {
        foreach ((new Dnsmasq())->dhcp_ranges->iterateItems() as $node) {
            if ((string)$node->interface === $key && Util::isIpv4Address((string)$node->start_addr)) {
                return ['from' => (string)$node->start_addr, 'to' => (string)$node->end_addr];
            }
        }
        return null;
    }

    /**
     * everything the "Network & Internet" tab shows
     */
    public function state(Minnosh $mdl)
    {
        $cfg = self::cfg();
        $vlans = self::vlans();
        $ports = $this->ports();
        $kinds = [];
        foreach ($mdl->networks->network->iterateItems() as $node) {
            $kinds[(string)$node->interface] = ['kind' => (string)$node->kind, 'created' => !$node->created->isEmpty()];
        }

        /* --- WAN --- */
        $wan = ['exists' => isset($cfg->interfaces->wan), 'readonly' => false, 'reasons' => []];
        if ($wan['exists']) {
            $node = $cfg->interfaces->wan;
            $device = (string)$node->if;
            $type = (string)$node->ipaddr;
            $wan['device'] = $device;
            $wan['type'] = in_array($type, ['dhcp', 'pppoe']) ? $type : (filter_var($type, FILTER_VALIDATE_IP) ? 'static' : 'other');
            $wan['ipv6'] = (string)$node->ipaddrv6 === 'dhcp6' ? 'auto' : ((string)$node->ipaddrv6 === '' ? 'off' : 'other');
            $wan['port'] = $device;
            $wan['vlan'] = '';
            if ($wan['type'] === 'pppoe') {
                $ppp = self::ppp($device);
                $parent = $ppp !== null ? explode(',', (string)$ppp->ports)[0] : '';
                $wan['username'] = $ppp !== null ? (string)$ppp->username : '';
                $wan['has_password'] = $ppp !== null && !empty((string)$ppp->password);
                $wan['port'] = $parent;
                if (isset($vlans[$parent])) {
                    $wan['port'] = $vlans[$parent]['parent'];
                    $wan['vlan'] = $vlans[$parent]['tag'];
                }
            } elseif (isset($vlans[$device])) {
                $wan['port'] = $vlans[$device]['parent'];
                $wan['vlan'] = $vlans[$device]['tag'];
            }
            if ($wan['type'] === 'static') {
                $wan['ip'] = $type . '/' . (string)$node->subnet;
                $wan['gateway'] = '';
                foreach ((new Gateways())->gateway_item->iterateItems() as $gw) {
                    if ((string)$gw->interface === 'wan' && (string)$gw->ipprotocol === 'inet') {
                        $wan['gateway'] = (string)$gw->gateway;
                    }
                }
            }
            if ($wan['type'] === 'other' || $wan['ipv6'] === 'other') {
                $wan['readonly'] = true;
                $wan['reasons'][] = 'type';
            }
            /* a second interface with an upstream gateway means multi-WAN: hands off */
            foreach ($cfg->interfaces->children() as $key => $other) {
                if ($key !== 'wan' && (!empty((string)$other->gateway) || in_array((string)$other->ipaddr, ['dhcp', 'pppoe']))) {
                    $wan['readonly'] = true;
                    $wan['reasons'][] = 'multiwan';
                    break;
                }
            }
            $wan['address'] = Vpn::wanAddress();
        }

        /* --- internal networks --- */
        $networks = [];
        foreach ($cfg->interfaces->children() as $key => $node) {
            if ($key === 'wan' || !preg_match('/^(lan|opt[0-9]+)$/', $key) || !empty((string)$node->virtual) || (string)$node->type === 'group') {
                continue;
            }
            $device = (string)$node->if;
            $ip = (string)$node->ipaddr;
            if (!filter_var($ip, FILTER_VALIDATE_IP, FILTER_FLAG_IPV4) && $ip !== '') {
                /* dhcp/pppoe on a non-WAN interface is an uplink, not a home network */
                continue;
            }
            if (strpos($device, 'wg') === 0 || strpos($device, 'ovpn') === 0 || strpos($device, 'lo') === 0) {
                continue;
            }
            $physical = isset($vlans[$device]) ? $vlans[$device]['parent'] : $device;
            $entry = [
                'key' => $key,
                'name' => !empty((string)$node->descr) ? (string)$node->descr : strtoupper($key),
                'enabled' => !empty((string)$node->enable),
                'device' => $device,
                'mode' => isset($vlans[$device]) ? 'vlan' : 'port',
                'port' => isset($vlans[$device]) ? $vlans[$device]['parent'] : $device,
                'vlan' => isset($vlans[$device]) ? $vlans[$device]['tag'] : '',
                'ip' => $ip,
                'subnet' => (string)$node->subnet,
                'dhcp' => self::dhcpRange($key),
                'kind' => $kinds[$key]['kind'] ?? ($key === 'lan' ? 'home' : 'home'),
                'created' => $kinds[$key]['created'] ?? false,
                /* LAGG/bridge members, dynamic addressing etc. are shown but edited in OPNsense itself */
                'readonly' => !isset($ports[$physical]) || $ip === '',
            ];
            $networks[] = $entry;
        }

        /* --- port roles --- */
        $roles = [];
        foreach ($cfg->interfaces->children() as $key => $node) {
            $device = (string)$node->if;
            $ppp = (string)$node->ipaddr === 'pppoe' ? self::ppp($device) : null;
            if ($ppp !== null) {
                $device = explode(',', (string)$ppp->ports)[0];
            }
            if (isset($vlans[$device])) {
                $roles[$vlans[$device]['parent']]['vlans'][] = ['key' => $key, 'tag' => $vlans[$device]['tag']];
            } elseif (isset($ports[$device])) {
                $roles[$device]['untagged'] = $key;
            }
        }
        foreach ($ports as $dev => &$port) {
            $port['untagged'] = $roles[$dev]['untagged'] ?? null;
            $port['vlans'] = $roles[$dev]['vlans'] ?? [];
        }

        return ['wan' => $wan, 'networks' => $networks, 'ports' => array_values($ports)];
    }

    /* ------------------------------------------------------------------ writes */

    /**
     * find or create a VLAN device on $parent with $tag, returns its vlanif
     */
    private static function ensureVlan(Vlan $vlans, $parent, $tag, $descr)
    {
        $max = 0;
        foreach ($vlans->vlan->iterateItems() as $node) {
            if ((string)$node->if === $parent && (string)$node->tag === (string)$tag) {
                return (string)$node->vlanif;
            }
            if (preg_match('/^vlan0(\d+)$/', (string)$node->vlanif, $m)) {
                $max = max($max, (int)$m[1]);
            }
        }
        $node = $vlans->vlan->Add();
        $node->if = $parent;
        $node->tag = (string)$tag;
        $node->vlanif = 'vlan0' . ($max + 1);
        $node->descr = $descr;
        return (string)$node->vlanif;
    }

    /**
     * WAN: dhcp | static | pppoe (optionally over a VLAN tag), ipv6 auto/off, port.
     * @return array list of interface keys that need a reconfigure
     */
    public function setWan(array $wan, Vlan $vlans)
    {
        $cfg = self::cfg();
        if (!isset($cfg->interfaces->wan)) {
            $cfg->interfaces->addChild('wan');
        }
        $node = $cfg->interfaces->wan;
        $gateways = new Gateways();
        $type = $wan['type'] ?? 'dhcp';
        $port = (string)($wan['port'] ?? '');
        if (!isset($this->ports()[$port])) {
            throw new \InvalidArgumentException('unknown WAN port');
        }
        $tag = (string)($wan['vlan'] ?? '');
        if ($tag !== '' && (!ctype_digit($tag) || (int)$tag < 1 || (int)$tag > 4094)) {
            throw new \InvalidArgumentException('invalid VLAN tag');
        }
        $lower = $tag !== '' ? self::ensureVlan($vlans, $port, $tag, 'Minnosh: internet VLAN') : $port;

        /* drop previous static IPv4 gateways of wan, as the setup wizard does */
        foreach ($gateways->gateway_item->iterateItems() as $uuid => $gw) {
            if ((string)$gw->interface === 'wan' && (string)$gw->ipprotocol === 'inet') {
                $gateways->gateway_item->del($uuid);
            }
        }
        $node->enable = '1';
        if ($type === 'pppoe') {
            if (!isset($cfg->ppps)) {
                $cfg->addChild('ppps');
            }
            $ppp = self::ppp((string)$node->if);
            if ($ppp === null) {
                $max = 0;
                foreach ($cfg->ppps->ppp as $item) {
                    $max = max($max, (int)(string)$item->ptpid);
                }
                $ppp = $cfg->ppps->addChild('ppp');
                $ppp->addChild('ptpid', (string)($max + 1));
                $ppp->addChild('if', 'pppoe' . ($max + 1));
            }
            $ppp->type = 'pppoe';
            $ppp->ports = $lower;
            $ppp->username = (string)($wan['username'] ?? '');
            if (isset($wan['password']) && $wan['password'] !== '') {
                $ppp->password = base64_encode((string)$wan['password']);
            }
            $node->if = (string)$ppp->if;
            $node->ipaddr = 'pppoe';
            $node->subnet = '';
        } else {
            $node->if = $lower;
            if ($type === 'static') {
                $parts = explode('/', (string)($wan['ip'] ?? ''));
                if (count($parts) != 2 || !Util::isIpv4Address($parts[0]) || !ctype_digit($parts[1])) {
                    throw new \InvalidArgumentException('invalid static address');
                }
                $node->ipaddr = $parts[0];
                $node->subnet = $parts[1];
                if (!empty($wan['gateway'])) {
                    $gateways->createOrUpdateGateway([
                        'interface' => 'wan', 'gateway' => (string)$wan['gateway'], 'name' => 'WAN_GW', 'weight' => '1',
                        'monitor_disable' => '1', 'descr' => 'WAN Gateway', 'defaultgw' => '1',
                    ]);
                }
            } else {
                $node->ipaddr = 'dhcp';
                $node->subnet = '';
            }
        }
        $node->ipaddrv6 = ($wan['ipv6'] ?? 'auto') === 'auto' ? 'dhcp6' : '';
        $gateways->serializeToConfig(false, true);
        return ['wan'];
    }

    /**
     * add a network: own port or VLAN, /24 with gateway address, optional DHCP range
     * @return string new interface key
     */
    public function addNetwork(array $net, Vlan $vlans)
    {
        $cfg = self::cfg();
        $port = (string)($net['port'] ?? '');
        if (!isset($this->ports()[$port])) {
            throw new \InvalidArgumentException('unknown port');
        }
        $device = $port;
        if (($net['mode'] ?? 'vlan') === 'vlan') {
            $tag = (string)($net['vlan'] ?? '');
            if (!ctype_digit($tag) || (int)$tag < 1 || (int)$tag > 4094) {
                throw new \InvalidArgumentException('invalid VLAN tag');
            }
            $device = self::ensureVlan($vlans, $port, $tag, 'Minnosh: ' . ($net['name'] ?? ''));
        } else {
            foreach ($cfg->interfaces->children() as $key => $node) {
                if ((string)$node->if === $port) {
                    throw new \InvalidArgumentException('port already in use by ' . $key);
                }
            }
        }
        $ip = (string)($net['ip'] ?? '');
        if (!Util::isIpv4Address($ip)) {
            throw new \InvalidArgumentException('invalid address');
        }
        $n = 1;
        while (isset($cfg->interfaces->{'opt' . $n})) {
            $n++;
        }
        $key = 'opt' . $n;
        $node = $cfg->interfaces->addChild($key);
        $node->addChild('if', $device);
        $node->addChild('descr', preg_replace('/[^A-Za-z0-9_]/', '', strtoupper((string)($net['name'] ?? $key))) ?: strtoupper($key));
        $node->addChild('enable', '1');
        $node->addChild('ipaddr', $ip);
        $node->addChild('subnet', '24');
        if (!empty($net['dhcp'])) {
            $this->setDhcp($key, $ip . '/24', true);
        }
        return $key;
    }

    /**
     * change address / DHCP of an existing network
     */
    public function updateNetwork($key, array $net)
    {
        $node = self::cfg()->interfaces->$key;
        if ($node === null || !isset($net['ip'])) {
            return;
        }
        $ip = (string)$net['ip'];
        if (!Util::isIpv4Address($ip)) {
            throw new \InvalidArgumentException('invalid address');
        }
        $node->ipaddr = $ip;
        $subnet = (string)$node->subnet ?: '24';
        $this->setDhcp($key, $ip . '/' . $subnet, !empty($net['dhcp']));
    }

    /**
     * (re)create the IPv4 DHCP range of $key the way the setup wizard does
     */
    private function setDhcp($key, $cidr, $enabled)
    {
        $dnsmasq = new Dnsmasq();
        foreach ($dnsmasq->dhcp_ranges->iterateItems() as $uuid => $node) {
            if ($node->interface->isEqual($key) && Util::isIpv4Address($node->start_addr->getValue())) {
                $dnsmasq->dhcp_ranges->del($uuid);
            }
        }
        if ($enabled) {
            list($ip, $bits) = explode('/', $cidr);
            $mask = (~0 << (32 - (int)$bits)) & 0xffffffff;
            $base = ip2long($ip) & $mask;
            $size = 1 << (32 - (int)$bits);
            if (!$dnsmasq->interface->isEmpty() && !in_array($key, explode(',', (string)$dnsmasq->interface))) {
                $dnsmasq->interface = (string)$dnsmasq->interface . ',' . $key;
            }
            $dnsmasq->enable = '1';
            $range = $dnsmasq->dhcp_ranges->Add();
            $range->interface = $key;
            if ((int)$bits === 24) {
                /* same range people know from the LAN */
                $range->start_addr = long2ip($base + 100);
                $range->end_addr = long2ip($base + 199);
            } else {
                $range->start_addr = long2ip($base + min(100, (int)($size / 4)));
                $range->end_addr = long2ip($base + $size - min(56, (int)($size / 8)) - 1);
            }
            $range->description = 'Minnosh';
        }
        $dnsmasq->serializeToConfig(false, true);
    }

    /**
     * remove a network Minnosh created (interface, its VLAN device and DHCP range)
     */
    public function deleteNetwork($key, Vlan $vlans)
    {
        $cfg = self::cfg();
        $node = $cfg->interfaces->$key;
        if ($node === null) {
            return;
        }
        $device = (string)$node->if;
        $this->setDhcp($key, '', false);
        $dnsmasq = new Dnsmasq();
        if (!$dnsmasq->interface->isEmpty()) {
            $dnsmasq->interface = implode(',', array_diff(explode(',', (string)$dnsmasq->interface), [$key]));
            $dnsmasq->serializeToConfig(false, true);
        }
        unset($cfg->interfaces->$key);
        foreach ($vlans->vlan->iterateItems() as $uuid => $vlan) {
            if ((string)$vlan->vlanif === $device) {
                $vlans->vlan->del($uuid);
                file_put_contents('/tmp/.vlans.removed', $device . "\n", FILE_APPEND);
            }
        }
    }

    /**
     * runtime: devices, interfaces, routing, dhcp/dns, firewall
     */
    public function apply(array $keys)
    {
        $this->backend->configdRun('interface vlan configure');
        $this->backend->configdRun('interface invoke registration');
        foreach (array_unique($keys) as $key) {
            $this->backend->configdRun('interface reconfigure ' . escapeshellarg($key));
        }
        $this->backend->configdRun('interface routes configure');
        $this->backend->configdRun('dnsmasq restart');
        $this->backend->configdRun('unbound restart');
        $this->backend->configdRun('filter reload');
    }
}
