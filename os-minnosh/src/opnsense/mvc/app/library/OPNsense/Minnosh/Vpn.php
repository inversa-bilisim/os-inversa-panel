<?php

/*
 * SPDX-License-Identifier: BSD-2-Clause
 * Copyright (C) 2026 Inversa Bilişim
 */

namespace OPNsense\Minnosh;

use OPNsense\Core\Backend;
use OPNsense\Core\Config;
use OPNsense\Wireguard\Client;
use OPNsense\Wireguard\General;
use OPNsense\Wireguard\Server;

/**
 * Road-warrior WireGuard VPN on top of OPNsense's own WireGuard models.
 *
 * Minnosh owns exactly one instance, named "minnosh". Instances the user created
 * before are left alone and only reported, our instance picks a free port and a
 * tunnel network that does not overlap anything configured.
 */
class Vpn
{
    const INSTANCE = 'minnosh';
    const FIRST_PORT = 51820;

    private $backend;

    public function __construct()
    {
        $this->backend = new Backend();
    }

    /**
     * our instance node, or null
     */
    public static function instance(Server $servers)
    {
        foreach ($servers->servers->server->iterateItems() as $node) {
            if ((string)$node->name === self::INSTANCE) {
                return $node;
            }
        }
        return null;
    }

    /**
     * networks already in use (interfaces + other wireguard instances) as [network, prefix]
     */
    private static function usedNetworks(Server $servers)
    {
        $used = [];
        foreach (Config::getInstance()->object()->interfaces->children() as $node) {
            if (filter_var((string)$node->ipaddr, FILTER_VALIDATE_IP) && !empty((string)$node->subnet)) {
                $used[] = [(string)$node->ipaddr, (int)(string)$node->subnet];
            }
        }
        foreach ($servers->servers->server->iterateItems() as $node) {
            foreach (explode(',', (string)$node->tunneladdress) as $cidr) {
                if (strpos($cidr, '/') !== false && strpos($cidr, ':') === false) {
                    list($addr, $bits) = explode('/', $cidr);
                    $used[] = [$addr, (int)$bits];
                }
            }
        }
        return $used;
    }

    private static function overlaps($a, $abits, $b, $bbits)
    {
        $bits = min($abits, $bbits);
        $mask = $bits == 0 ? 0 : (~0 << (32 - $bits)) & 0xffffffff;
        return (ip2long($a) & $mask) === (ip2long($b) & $mask);
    }

    private static function pickTunnel(Server $servers)
    {
        $used = self::usedNetworks($servers);
        for ($third = 66; $third < 250; $third++) {
            $candidate = "10.66.{$third}.0";
            $free = true;
            foreach ($used as $net) {
                if (self::overlaps($candidate, 24, $net[0], $net[1])) {
                    $free = false;
                    break;
                }
            }
            if ($free) {
                return "10.66.{$third}.1/24";
            }
        }
        throw new \RuntimeException('no free tunnel network found');
    }

    private static function pickPort(Server $servers)
    {
        $taken = [];
        foreach ($servers->servers->server->iterateItems() as $node) {
            $taken[] = (int)(string)$node->port;
        }
        $port = self::FIRST_PORT;
        while (in_array($port, $taken)) {
            $port++;
        }
        return $port;
    }

    private function keypair()
    {
        $kp = json_decode($this->backend->configdRun('wireguard gen_keypair'), true);
        if (empty($kp['privkey']) || empty($kp['pubkey'])) {
            throw new \RuntimeException('could not generate a WireGuard key pair');
        }
        return $kp;
    }

    /**
     * current public IPv4 of the WAN interface (used when no endpoint name is configured)
     */
    public static function wanAddress()
    {
        /* legacy get_interface_ip() needs half of etc/inc loaded; ask configd for the device instead */
        $wan = Config::getInstance()->object()->interfaces->wan;
        if ($wan === null) {
            return '';
        }
        $device = (string)$wan->if;
        $details = json_decode((new Backend())->configdpRun('interface list ifconfig', [$device]), true) ?? [];
        foreach ($details[$device]['ipv4'] ?? [] as $addr) {
            if (!empty($addr['ipaddr'])) {
                return $addr['ipaddr'];
            }
        }
        return '';
    }

    /**
     * IPv4 networks of the protected interfaces, for "home networks only" clients
     */
    public static function homeNetworks(Minnosh $mdl)
    {
        $result = [];
        $ifs = Config::getInstance()->object()->interfaces;
        foreach ($mdl->getProtectedInterfaces() as $key) {
            $node = $ifs->$key;
            if ($node !== null && filter_var((string)$node->ipaddr, FILTER_VALIDATE_IP)) {
                $bits = (int)(string)$node->subnet;
                $mask = $bits == 0 ? 0 : (~0 << (32 - $bits)) & 0xffffffff;
                $result[] = long2ip(ip2long((string)$node->ipaddr) & $mask) . '/' . $bits;
            }
        }
        return $result;
    }

    /**
     * full state for the UI
     */
    public function status(Minnosh $mdl)
    {
        $general = new General();
        $servers = new Server();
        $clients = new Client();
        $own = self::instance($servers);

        $handshakes = [];
        $show = json_decode($this->backend->configdRun('wireguard show'), true);
        foreach ($show['records'] ?? [] as $rec) {
            if (($rec['type'] ?? '') === 'peer') {
                $handshakes[$rec['public-key']] = $rec;
            }
        }

        $peers = [];
        if ($own !== null) {
            $linked = array_filter(explode(',', (string)$own->peers));
            foreach ($clients->clients->client->iterateItems() as $uuid => $node) {
                if (!in_array($uuid, $linked)) {
                    continue;
                }
                $hs = $handshakes[(string)$node->pubkey] ?? [];
                $peers[] = [
                    'uuid' => $uuid,
                    'name' => (string)$node->name,
                    'address' => (string)$node->tunneladdress,
                    'enabled' => !$node->enabled->isEmpty(),
                    'handshake' => $hs['latest-handshake'] ?? 0,
                    'rx' => $hs['transfer-rx'] ?? 0,
                    'tx' => $hs['transfer-tx'] ?? 0,
                ];
            }
        }

        $others = [];
        foreach ($servers->servers->server->iterateItems() as $node) {
            if ((string)$node->name !== self::INSTANCE) {
                $others[] = ['name' => (string)$node->name, 'port' => (string)$node->port];
            }
        }

        $endpoint = (string)$mdl->vpn->endpoint;
        return [
            'enabled' => $own !== null && !$own->enabled->isEmpty() && !$general->enabled->isEmpty(),
            'exists' => $own !== null,
            'port' => $own !== null ? (string)$own->port : (string)self::pickPort($servers),
            'tunnel' => $own !== null ? (string)$own->tunneladdress : '',
            'endpoint' => $endpoint,
            'wan_address' => self::wanAddress(),
            'mode' => (string)$mdl->vpn->mode,
            'peers' => $peers,
            'other_instances' => $others,
            'now' => time(),
        ];
    }

    /**
     * switch our instance on/off, creating it on first use
     * @return bool true when something changed
     */
    public function setEnabled($on)
    {
        $general = new General();
        $servers = new Server();
        $own = self::instance($servers);
        if (!$on && $own === null) {
            return false;
        }
        if ($own === null) {
            $kp = $this->keypair();
            $tunnel = self::pickTunnel($servers);
            $own = $servers->servers->server->Add();
            $own->setNodes([
                'enabled' => '1',
                'name' => self::INSTANCE,
                'pubkey' => $kp['pubkey'],
                'privkey' => $kp['privkey'],
                'port' => (string)self::pickPort($servers),
                'tunneladdress' => $tunnel,
                'peer_dns' => explode('/', $tunnel)[0],
            ]);
        }
        $own->enabled->setValue($on ? '1' : '0');
        if ($on) {
            /* the global WireGuard switch; never turned off by us, other instances may need it */
            $general->enabled->setValue('1');
        }
        $general->serializeToConfig();
        $servers->serializeToConfig();
        Config::getInstance()->save();
        return true;
    }

    private static function nextAddress(Server $servers, Client $clients, $own)
    {
        list($serverIp, $bits) = explode('/', explode(',', (string)$own->tunneladdress)[0]);
        $taken = [$serverIp];
        foreach ($clients->clients->client->iterateItems() as $node) {
            foreach (explode(',', (string)$node->tunneladdress) as $cidr) {
                $taken[] = explode('/', $cidr)[0];
            }
        }
        $mask = (~0 << (32 - (int)$bits)) & 0xffffffff;
        $base = ip2long($serverIp) & $mask;
        $size = 1 << (32 - (int)$bits);
        for ($i = 2; $i < $size - 1; $i++) {
            $ip = long2ip($base + $i);
            if (!in_array($ip, $taken)) {
                return $ip . '/32';
            }
        }
        throw new \RuntimeException('VPN network is full');
    }

    /**
     * add a device; the private key only lives in the returned client config (shown once as QR)
     */
    public function addPeer(Minnosh $mdl, $name)
    {
        $servers = new Server();
        $clients = new Client();
        $own = self::instance($servers);
        if ($own === null) {
            throw new \RuntimeException('VPN is not enabled');
        }
        $kp = $this->keypair();
        $psk = trim($this->backend->configdRun('wireguard gen_psk'));
        $address = self::nextAddress($servers, $clients, $own);

        $node = $clients->clients->client->Add();
        $uuid = $node->getAttributes()['uuid'];
        $node->setNodes([
            'enabled' => '1',
            'name' => $name,
            'pubkey' => $kp['pubkey'],
            'psk' => $psk,
            'tunneladdress' => $address,
            'keepalive' => '25',
        ]);
        $own->peers->setValue(implode(',', array_filter(array_merge(explode(',', (string)$own->peers), [$uuid]))));

        /*
         * same order as core's ClientController: the server's relation field does not know the
         * new peer yet, so it is written without validation and the peer itself is validated
         */
        $servers->serializeToConfig(false, true);
        $clients->serializeToConfig();
        Config::getInstance()->save();

        $endpoint = (string)$mdl->vpn->endpoint ?: self::wanAddress();
        $allowed = (string)$mdl->vpn->mode === 'split'
            ? implode(', ', array_merge([(string)explode(',', (string)$own->tunneladdress)[0]], self::homeNetworks($mdl)))
            : '0.0.0.0/0, ::/0';
        $config = "[Interface]\n" .
            "PrivateKey = {$kp['privkey']}\n" .
            "Address = {$address}\n" .
            'DNS = ' . explode('/', (string)$own->tunneladdress)[0] . "\n\n" .
            "[Peer]\n" .
            "PublicKey = {$own->pubkey}\n" .
            "PresharedKey = {$psk}\n" .
            "Endpoint = {$endpoint}:{$own->port}\n" .
            "AllowedIPs = {$allowed}\n" .
            "PersistentKeepalive = 25\n";
        return ['uuid' => $uuid, 'name' => $name, 'config' => $config];
    }

    public function removePeer($uuid)
    {
        $servers = new Server();
        $clients = new Client();
        $own = self::instance($servers);
        if ($own === null) {
            return false;
        }
        $linked = array_filter(explode(',', (string)$own->peers));
        if (!in_array($uuid, $linked)) {
            /* only peers of our own instance can be removed from here */
            return false;
        }
        $own->peers->setValue(implode(',', array_diff($linked, [$uuid])));
        $clients->clients->client->del($uuid);
        $servers->serializeToConfig(false, true);
        $clients->serializeToConfig();
        Config::getInstance()->save();
        return true;
    }

    public function setPeerEnabled($uuid, $on)
    {
        $servers = new Server();
        $clients = new Client();
        $own = self::instance($servers);
        if ($own === null || !in_array($uuid, explode(',', (string)$own->peers))) {
            return false;
        }
        $node = $clients->getNodeByReference('clients.client.' . $uuid);
        if ($node === null) {
            return false;
        }
        $node->enabled->setValue($on ? '1' : '0');
        $clients->serializeToConfig();
        Config::getInstance()->save();
        return true;
    }

    /**
     * render and (re)start wireguard, then refresh firewall rules (our hook opens the port)
     */
    public function apply()
    {
        $this->backend->configdRun('interface invoke registration');
        $this->backend->configdRun('template reload OPNsense/Wireguard');
        $this->backend->configdRun('wireguard configure');
        $this->backend->configdRun('filter reload');
    }
}
