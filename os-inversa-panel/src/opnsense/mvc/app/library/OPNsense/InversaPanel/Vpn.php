<?php

/*
 * SPDX-License-Identifier: BSD-2-Clause
 * Copyright (C) 2026 Inversa Bilişim
 */

namespace OPNsense\InversaPanel;

use OPNsense\Core\Backend;
use OPNsense\Core\Config;
use OPNsense\Firewall\Util;
use OPNsense\Wireguard\Client;
use OPNsense\Wireguard\General;
use OPNsense\Wireguard\Server;

/**
 * WireGuard VPN connections on top of OPNsense's own WireGuard models (IPsec site to site: see Ipsec).
 *
 * Every Inversa Panel connection is one WireGuard instance (own port, own tunnel network):
 *  - remote: road warrior, devices get a QR code; reachable internal networks are chosen,
 *    either "all traffic" through home or only those networks
 *  - site:   site to site with one other gateway; chosen local networks <-> remote networks
 * Inversa Panel only manages instances referenced from its model; others are reported read-only
 * and their ports and tunnel networks are avoided.
 */
class Vpn
{
    /* name of the single 0.2 instance, adopted as a remote access connection */
    const LEGACY = 'inversapanel';
    const FIRST_PORT = 51820;

    private $backend;

    public function __construct()
    {
        $this->backend = new Backend();
    }

    /* ------------------------------------------------------------------ helpers */

    private static function cidrNetwork($cidr)
    {
        list($addr, $bits) = explode('/', $cidr);
        $mask = (int)$bits == 0 ? 0 : (~0 << (32 - (int)$bits)) & 0xffffffff;
        return long2ip(ip2long($addr) & $mask) . '/' . (int)$bits;
    }

    private static function overlaps($a, $abits, $b, $bbits)
    {
        $bits = min($abits, $bbits);
        $mask = $bits == 0 ? 0 : (~0 << (32 - $bits)) & 0xffffffff;
        return (ip2long($a) & $mask) === (ip2long($b) & $mask);
    }

    /**
     * IPv4 network (cidr) of an interface key, or null
     */
    public static function interfaceNetwork($key)
    {
        $node = Config::getInstance()->object()->interfaces->$key;
        if ($node === null || !filter_var((string)$node->ipaddr, FILTER_VALIDATE_IP, FILTER_FLAG_IPV4)) {
            return null;
        }
        return self::cidrNetwork((string)$node->ipaddr . '/' . (string)$node->subnet);
    }

    private static function usedNetworks(Server $servers, $skipServer = null)
    {
        $used = [];
        foreach (Config::getInstance()->object()->interfaces->children() as $node) {
            if (filter_var((string)$node->ipaddr, FILTER_VALIDATE_IP, FILTER_FLAG_IPV4) && !empty((string)$node->subnet)) {
                $used[] = [(string)$node->ipaddr, (int)(string)$node->subnet];
            }
        }
        foreach ($servers->servers->server->iterateItems() as $uuid => $node) {
            if ($uuid === $skipServer) {
                continue;
            }
            foreach (explode(',', (string)$node->tunneladdress) as $cidr) {
                if (strpos($cidr, '/') !== false && strpos($cidr, ':') === false) {
                    list($addr, $bits) = explode('/', $cidr);
                    $used[] = [$addr, (int)$bits];
                }
            }
        }
        return $used;
    }

    /**
     * free tunnel: 10.66.x.1/24 for remote access, 10.99.x.1/30 for site to site
     */
    private static function pickTunnel(Server $servers, $kind)
    {
        $used = self::usedNetworks($servers);
        for ($third = ($kind === 'site' ? 0 : 66); $third < 250; $third++) {
            $base = $kind === 'site' ? "10.99.{$third}.0" : "10.66.{$third}.0";
            $bits = $kind === 'site' ? 30 : 24;
            $free = true;
            foreach ($used as $net) {
                if (self::overlaps($base, $bits, $net[0], $net[1])) {
                    $free = false;
                    break;
                }
            }
            if ($free) {
                return long2ip(ip2long($base) + 1) . '/' . $bits;
            }
        }
        throw new \RuntimeException('no free tunnel network found');
    }

    /**
     * user chosen tunnel network ("10.70.0.0/24" or "10.70.0.1/24") -> "first host/bits" for the server;
     * must be private, big enough and not overlap any interface or other VPN
     */
    private static function parseTunnel(Server $servers, $value, $kind, $skipServer = null)
    {
        $value = trim((string)$value);
        if (!preg_match('/^(\d{1,3}(?:\.\d{1,3}){3})\/(\d{1,2})$/', $value, $m) || !filter_var($m[1], FILTER_VALIDATE_IP, FILTER_FLAG_IPV4)) {
            throw new \InvalidArgumentException("invalid IP block: $value (example: 10.70.0.0/24)");
        }
        $bits = (int)$m[2];
        if ($kind === 'site' ? ($bits < 24 || $bits > 30) : ($bits < 16 || $bits > 29)) {
            throw new \InvalidArgumentException($kind === 'site' ? 'IP block size must be between /24 and /30' : 'IP block size must be between /16 and /29');
        }
        if (filter_var($m[1], FILTER_VALIDATE_IP, FILTER_FLAG_NO_PRIV_RANGE) !== false) {
            throw new \InvalidArgumentException("use a private IP block (10.x, 172.16-31.x or 192.168.x): $value");
        }
        $net = explode('/', self::cidrNetwork($value))[0];
        foreach (self::usedNetworks($servers, $skipServer) as $used) {
            if (self::overlaps($net, $bits, $used[0], $used[1])) {
                throw new \InvalidArgumentException("IP block $net/$bits overlaps a network in use (" . self::cidrNetwork($used[0] . '/' . $used[1]) . ')');
            }
        }
        return long2ip(ip2long($net) + 1) . '/' . $bits;
    }

    private static function takenPorts(Server $servers)
    {
        $taken = [];
        foreach ($servers->servers->server->iterateItems() as $node) {
            $taken[] = (int)(string)$node->port;
        }
        return $taken;
    }

    private static function pickPort(Server $servers)
    {
        $taken = self::takenPorts($servers);
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

    private static function slug($name)
    {
        /* WireGuard names are ASCII; OPNsense's PHP has no iconv, so transliterate common letters */
        $ascii = strtr((string)$name, [
            'ç' => 'c', 'ğ' => 'g', 'ı' => 'i', 'ö' => 'o', 'ş' => 's', 'ü' => 'u', 'â' => 'a', 'î' => 'i', 'û' => 'u',
            'Ç' => 'C', 'Ğ' => 'G', 'İ' => 'I', 'Ö' => 'O', 'Ş' => 'S', 'Ü' => 'U', 'ä' => 'a', 'Ä' => 'A', 'ß' => 'ss',
        ]);
        return trim(substr(preg_replace('/[^0-9a-zA-Z._\-]+/', '-', $ascii), 0, 40), '-') ?: 'vpn';
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
     * Inversa Panel connection entries with their WireGuard instance: [conn uuid => [conn, server]]
     */
    public static function connections(InversaPanel $mdl, Server $servers)
    {
        $result = [];
        foreach ($mdl->vpns->connection->iterateItems() as $uuid => $conn) {
            /* connections without an instance are IPsec ones (see Ipsec) */
            $server = (string)$conn->server !== '' ? $servers->getNodeByReference('servers.server.' . (string)$conn->server) : null;
            if ($server !== null) {
                $result[$uuid] = [$conn, $server];
            }
        }
        return $result;
    }

    /**
     * 0.2 had a single instance named "inversapanel": turn it into a remote access connection
     * @return bool true when the model changed (caller saves)
     */
    public static function migrate(InversaPanel $mdl, Server $servers)
    {
        $referenced = [];
        foreach ($mdl->vpns->connection->iterateItems() as $conn) {
            $referenced[] = (string)$conn->server;
        }
        foreach ($servers->servers->server->iterateItems() as $uuid => $node) {
            if ((string)$node->name === self::LEGACY && !in_array($uuid, $referenced)) {
                $conn = $mdl->vpns->connection->Add();
                $conn->server->setValue($uuid);
                $conn->kind->setValue('remote');
                $conn->networks->setValue(implode(',', $mdl->getProtectedInterfaces()));
                $conn->mode->setValue((string)$mdl->vpn->mode === 'split' ? 'split' : 'full');
                $conn->endpoint->setValue((string)$mdl->vpn->endpoint);
                return true;
            }
        }
        return false;
    }

    /* ------------------------------------------------------------------ read */

    public function status(InversaPanel $mdl)
    {
        $servers = new Server();
        $clients = new Client();
        if (self::migrate($mdl, $servers)) {
            $mdl->serializeToConfig(false, true);
            Config::getInstance()->save();
        }
        $general = new General();

        $handshakes = [];
        $show = json_decode($this->backend->configdRun('wireguard show'), true);
        foreach ($show['records'] ?? [] as $rec) {
            if (($rec['type'] ?? '') === 'peer') {
                $handshakes[$rec['public-key']] = $rec;
            }
        }

        $wan = self::wanAddress();
        $list = [];
        $owned = [];
        foreach (self::connections($mdl, $servers) as $cuuid => list($conn, $server)) {
            $owned[] = $server->getAttributes()['uuid'];
            $linked = array_filter(explode(',', (string)$server->peers));
            $peers = [];
            foreach ($clients->clients->client->iterateItems() as $puuid => $peer) {
                if (!in_array($puuid, $linked)) {
                    continue;
                }
                $hs = $handshakes[(string)$peer->pubkey] ?? [];
                $peers[] = [
                    'uuid' => $puuid,
                    'name' => (string)$peer->name,
                    'address' => (string)$peer->tunneladdress,
                    'endpoint' => (string)$peer->serveraddress . ((string)$peer->serverport !== '' ? ':' . (string)$peer->serverport : ''),
                    'pubkey' => (string)$peer->pubkey,
                    'enabled' => !$peer->enabled->isEmpty(),
                    /* QR / file can be produced again only when the private key was kept */
                    'has_config' => (string)$peer->privkey !== '',
                    'handshake' => $hs['latest-handshake'] ?? 0,
                    'rx' => $hs['transfer-rx'] ?? 0,
                    'tx' => $hs['transfer-tx'] ?? 0,
                ];
            }
            $tunnel = explode(',', (string)$server->tunneladdress)[0];
            $list[] = [
                'uuid' => $cuuid,
                'name' => (string)$server->name,
                'kind' => (string)$conn->kind,
                'enabled' => !$server->enabled->isEmpty() && !$general->enabled->isEmpty(),
                'port' => (string)$server->port,
                'tunnel' => $tunnel,
                'tunnel_net' => self::cidrNetwork($tunnel),
                'pubkey' => (string)$server->pubkey,
                'networks' => $conn->networks->getValues(),
                'mode' => (string)$conn->mode,
                'endpoint' => (string)$conn->endpoint,
                'address' => ((string)$conn->endpoint ?: $wan) . ':' . (string)$server->port,
                'remote_networks' => $conn->remote_networks->getValues(),
                'peers' => $peers,
            ];
        }

        $others = [];
        foreach ($servers->servers->server->iterateItems() as $uuid => $node) {
            if (!in_array($uuid, $owned)) {
                $others[] = ['name' => (string)$node->name, 'port' => (string)$node->port, 'tunnel' => (string)$node->tunneladdress];
            }
        }

        $networks = [];
        foreach ($mdl->getProtectedInterfaces() as $key) {
            $cidr = self::interfaceNetwork($key);
            $node = Config::getInstance()->object()->interfaces->$key;
            if ($cidr !== null) {
                $networks[] = ['key' => $key, 'name' => !empty((string)$node->descr) ? (string)$node->descr : strtoupper($key), 'cidr' => $cidr];
            }
        }

        return [
            'connections' => $list,
            'other_instances' => $others,
            'networks' => $networks,
            'wan_address' => $wan,
            'next_port' => self::pickPort($servers),
            'next_tunnel' => ['remote' => self::cidrNetwork(self::pickTunnel($servers, 'remote')), 'site' => self::cidrNetwork(self::pickTunnel($servers, 'site'))],
            'now' => time(),
        ];
    }

    /* ------------------------------------------------------------------ connections */

    private static function validNetworks(array $keys)
    {
        return array_values(array_filter($keys, fn($k) => preg_match('/^(lan|opt[0-9]+)$/', $k) && self::interfaceNetwork($k) !== null));
    }

    private static function validCidrs(array $list)
    {
        $out = [];
        foreach ($list as $cidr) {
            $cidr = trim((string)$cidr);
            if (Util::isSubnet($cidr) && strpos($cidr, ':') === false) {
                $out[] = self::cidrNetwork($cidr);
            } elseif ($cidr !== '') {
                throw new \InvalidArgumentException("invalid network: $cidr");
            }
        }
        return array_values(array_unique($out));
    }

    /**
     * create a connection
     * req: name, kind (remote|site), port?, networks[], mode (remote), endpoint (remote),
     *      site: remote_endpoint (host[:port]), remote_pubkey, remote_networks[], tunnel?, remote_tunnel?, psk?
     */
    public function create(InversaPanel $mdl, array $req)
    {
        $kind = ($req['kind'] ?? 'remote') === 'site' ? 'site' : 'remote';
        $servers = new Server();
        $clients = new Client();
        $general = new General();

        $port = (int)($req['port'] ?? 0);
        if ($port === 0) {
            $port = self::pickPort($servers);
        } elseif ($port < 1 || $port > 65535 || in_array($port, self::takenPorts($servers))) {
            throw new \InvalidArgumentException('port is invalid or already used by another VPN');
        }
        $tunnel = trim((string)($req['tunnel'] ?? ''));
        if ($tunnel === '') {
            $tunnel = self::pickTunnel($servers, $kind);
        } else {
            $tunnel = self::parseTunnel($servers, $tunnel, $kind);
        }
        $networks = self::validNetworks((array)($req['networks'] ?? []));

        $kp = $this->keypair();
        $server = $servers->servers->server->Add();
        $suuid = $server->getAttributes()['uuid'];
        $server->setNodes([
            'enabled' => '1',
            'name' => 'inversapanel-' . self::slug($req['name'] ?? $kind),
            'pubkey' => $kp['pubkey'],
            'privkey' => $kp['privkey'],
            'port' => (string)$port,
            'tunneladdress' => $tunnel,
        ]);
        if ($kind === 'remote') {
            $server->peer_dns->setValue(explode('/', $tunnel)[0]);
        } else {
            $remoteNets = self::validCidrs((array)($req['remote_networks'] ?? []));
            $pubkey = trim((string)($req['remote_pubkey'] ?? ''));
            $remotePriv = '';
            if ($pubkey === '') {
                /* the other side is a plain WireGuard device: generate its keys, offer its config */
                $rkp = $this->keypair();
                $pubkey = $rkp['pubkey'];
                $remotePriv = $rkp['privkey'];
            } elseif (!preg_match('/^[A-Za-z0-9+\/]{42,43}=$/', $pubkey)) {
                throw new \InvalidArgumentException('invalid public key of the other side');
            }
            list($host, $rport) = array_pad(explode(':', trim((string)($req['remote_endpoint'] ?? '')), 2), 2, '');
            $remoteTunnel = trim((string)($req['remote_tunnel'] ?? ''));
            if ($remoteTunnel === '') {
                /* the other address of the /30 */
                list($addr) = explode('/', $tunnel);
                $remoteTunnel = long2ip(ip2long($addr) + 1);
            }
            $peer = $clients->clients->client->Add();
            $puuid = $peer->getAttributes()['uuid'];
            $peer->setNodes([
                'enabled' => '1',
                'name' => 'inversapanel-' . self::slug($req['name'] ?? 'site') . '-peer',
                'pubkey' => $pubkey,
                'psk' => trim((string)($req['psk'] ?? '')),
                /* AllowedIPs on our side: the other tunnel end plus the networks behind it */
                'tunneladdress' => implode(',', array_merge([explode('/', $remoteTunnel)[0] . '/32'], $remoteNets)),
                'serveraddress' => $host,
                'serverport' => $host !== '' ? ($rport !== '' ? $rport : (string)self::FIRST_PORT) : '',
                'keepalive' => '25',
                'privkey' => $remotePriv,
            ]);
            $server->peers->setValue($puuid);
        }
        $general->enabled->setValue('1');

        $conn = $mdl->vpns->connection->Add();
        $conn->server->setValue($suuid);
        $conn->kind->setValue($kind);
        $conn->networks->setValue(implode(',', $networks));
        $conn->mode->setValue(($req['mode'] ?? 'split') === 'full' ? 'full' : 'split');
        $conn->endpoint->setValue(trim((string)($req['endpoint'] ?? '')));
        if ($kind === 'site') {
            $conn->remote_networks->setValue(implode(',', $remoteNets));
        }

        $this->save([$general, $servers], [$clients], $mdl);
        return $conn->getAttributes()['uuid'];
    }

    /**
     * change a connection: enabled, networks, mode, endpoint; site: remote settings
     */
    public function update(InversaPanel $mdl, $uuid, array $req)
    {
        $servers = new Server();
        $clients = new Client();
        $all = self::connections($mdl, $servers);
        if (!isset($all[$uuid])) {
            throw new \InvalidArgumentException('unknown VPN connection');
        }
        list($conn, $server) = $all[$uuid];
        if (isset($req['enabled'])) {
            $server->enabled->setValue(!empty($req['enabled']) && $req['enabled'] !== 'false' ? '1' : '0');
        }
        if (isset($req['networks'])) {
            $conn->networks->setValue(implode(',', self::validNetworks((array)$req['networks'])));
        }
        if (isset($req['mode'])) {
            $conn->mode->setValue($req['mode'] === 'full' ? 'full' : 'split');
        }
        if (isset($req['endpoint'])) {
            $conn->endpoint->setValue(trim((string)$req['endpoint']));
        }
        $result = [];
        $peerUuids = array_values(array_filter(explode(',', (string)$server->peers)));
        if (!empty($req['tunnel'])) {
            $old = explode(',', (string)$server->tunneladdress)[0];
            $new = self::parseTunnel($servers, $req['tunnel'], (string)$conn->kind, $server->getAttributes()['uuid']);
            if (self::cidrNetwork($new) !== self::cidrNetwork($old)) {
                list($ip, $bits) = explode('/', $new);
                if ((string)$conn->kind === 'remote' && count($peerUuids) > (1 << (32 - (int)$bits)) - 3) {
                    throw new \InvalidArgumentException('IP block too small for the devices of this connection');
                }
                $server->tunneladdress->setValue($new);
                if ((string)$conn->kind === 'remote') {
                    $server->peer_dns->setValue($ip);
                }
                /* renumber the devices / the other gateway into the new block */
                $next = ip2long($ip) + 1;
                foreach ($peerUuids as $puuid) {
                    $p = $clients->getNodeByReference('clients.client.' . $puuid);
                    if ($p === null) {
                        continue;
                    }
                    $rest = array_slice(explode(',', (string)$p->tunneladdress), 1);
                    $p->tunneladdress->setValue(implode(',', array_merge([long2ip($next++) . '/32'], $rest)));
                }
                $result['readdressed'] = true;
            }
        }
        if ((string)$conn->kind === 'site') {
            $peer = $clients->getNodeByReference('clients.client.' . explode(',', (string)$server->peers)[0]);
            if (isset($req['remote_networks'])) {
                $remoteNets = self::validCidrs((array)$req['remote_networks']);
                $conn->remote_networks->setValue(implode(',', $remoteNets));
                if ($peer !== null) {
                    $tunnelIp = explode(',', (string)$peer->tunneladdress)[0];
                    $peer->tunneladdress->setValue(implode(',', array_merge([$tunnelIp], $remoteNets)));
                }
            }
            if ($peer !== null && isset($req['remote_endpoint'])) {
                list($host, $rport) = array_pad(explode(':', trim((string)$req['remote_endpoint']), 2), 2, '');
                $peer->serveraddress->setValue($host);
                $peer->serverport->setValue($host !== '' ? ($rport !== '' ? $rport : (string)self::FIRST_PORT) : '');
            }
            if ($peer !== null && !empty($req['remote_pubkey'])) {
                if (!preg_match('/^[A-Za-z0-9+\/]{42,43}=$/', trim($req['remote_pubkey']))) {
                    throw new \InvalidArgumentException('invalid public key of the other side');
                }
                $peer->pubkey->setValue(trim($req['remote_pubkey']));
            }
        }
        $this->save([$servers], [$clients], $mdl);
        return $result;
    }

    /**
     * delete a connection with the WireGuard instance and its peers
     */
    public function delete(InversaPanel $mdl, $uuid)
    {
        $servers = new Server();
        $clients = new Client();
        $all = self::connections($mdl, $servers);
        if (!isset($all[$uuid])) {
            return false;
        }
        list(, $server) = $all[$uuid];
        foreach (array_filter(explode(',', (string)$server->peers)) as $puuid) {
            $clients->clients->client->del($puuid);
        }
        $servers->servers->server->del($server->getAttributes()['uuid']);
        $mdl->vpns->connection->del($uuid);
        $this->save([$servers], [$clients], $mdl);
        return true;
    }

    /* ------------------------------------------------------------------ remote access devices */

    private static function nextAddress(Client $clients, $server)
    {
        list($serverIp, $bits) = explode('/', explode(',', (string)$server->tunneladdress)[0]);
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
     * WireGuard configuration for the device / other side behind a peer, or null when its private
     * key was not kept (peers added by Inversa Panel 0.2 or outside Inversa Panel)
     */
    private static function buildConfig($conn, $server, $peer)
    {
        $priv = (string)$peer->privkey;
        if ($priv === '') {
            return null;
        }
        $tunnel = explode(',', (string)$server->tunneladdress)[0];
        $endpoint = ((string)$conn->endpoint ?: self::wanAddress()) . ':' . (string)$server->port;
        $local = [];
        foreach ($conn->networks->getValues() as $key) {
            $cidr = self::interfaceNetwork($key);
            if ($cidr !== null) {
                $local[] = $cidr;
            }
        }
        $addrs = explode(',', (string)$peer->tunneladdress);
        if ((string)$conn->kind === 'site') {
            /* the other gateway: its tunnel address, our tunnel end + shared networks as AllowedIPs */
            $address = explode('/', $addrs[0])[0] . '/' . explode('/', $tunnel)[1];
            $allowed = implode(', ', array_merge([explode('/', $tunnel)[0] . '/32'], $local));
            /* we connect to the other side's port, so it has to listen there */
            $dns = (string)$peer->serverport !== '' ? 'ListenPort = ' . (string)$peer->serverport . "\n" : '';
        } else {
            $address = $addrs[0];
            $allowed = (string)$conn->mode === 'full' ? '0.0.0.0/0, ::/0' : implode(', ', array_merge([self::cidrNetwork($tunnel)], $local));
            $dns = 'DNS = ' . explode('/', $tunnel)[0] . "\n";
        }
        return "[Interface]\n" .
            "PrivateKey = {$priv}\n" .
            "Address = {$address}\n" .
            $dns . "\n" .
            "[Peer]\n" .
            "PublicKey = {$server->pubkey}\n" .
            ((string)$peer->psk !== '' ? "PresharedKey = {$peer->psk}\n" : '') .
            "Endpoint = {$endpoint}\n" .
            "AllowedIPs = {$allowed}\n" .
            "PersistentKeepalive = 25\n";
    }

    private static function peerContext(InversaPanel $mdl, Server $servers, Client $clients, $connUuid, $peerUuid)
    {
        $all = self::connections($mdl, $servers);
        if (!isset($all[$connUuid])) {
            return null;
        }
        list($conn, $server) = $all[$connUuid];
        if (!in_array($peerUuid, explode(',', (string)$server->peers))) {
            return null;
        }
        $peer = $clients->getNodeByReference('clients.client.' . $peerUuid);
        return $peer === null ? null : [$conn, $server, $peer];
    }

    /**
     * configuration (for QR code / .conf download) of a device or the other side of a site link
     */
    public function peerConfig(InversaPanel $mdl, $connUuid, $peerUuid)
    {
        $ctx = self::peerContext($mdl, new Server(), new Client(), $connUuid, $peerUuid);
        if ($ctx === null) {
            return null;
        }
        return ['name' => (string)$ctx[2]->name, 'config' => self::buildConfig($ctx[0], $ctx[1], $ctx[2])];
    }

    /**
     * new key pair for a peer whose private key was not kept (the device has to scan again)
     */
    public function renewPeerKey(InversaPanel $mdl, $connUuid, $peerUuid)
    {
        $servers = new Server();
        $clients = new Client();
        $ctx = self::peerContext($mdl, $servers, $clients, $connUuid, $peerUuid);
        if ($ctx === null) {
            throw new \RuntimeException('unknown VPN device');
        }
        list($conn, $server, $peer) = $ctx;
        $kp = $this->keypair();
        $peer->pubkey->setValue($kp['pubkey']);
        $peer->privkey->setValue($kp['privkey']);
        if ((string)$conn->kind === 'remote') {
            $peer->psk->setValue(trim($this->backend->configdRun('wireguard gen_psk')));
        }
        $this->save([], [$clients], null);
        return ['name' => (string)$peer->name, 'config' => self::buildConfig($conn, $server, $peer)];
    }

    /**
     * add a device to a remote access connection; its private key is kept in the WireGuard
     * peer (privkey, as OPNsense's own peer generator can do) so the QR code / file can be
     * shown again later
     */
    public function addPeer(InversaPanel $mdl, $connUuid, $name)
    {
        $servers = new Server();
        $clients = new Client();
        $all = self::connections($mdl, $servers);
        if (!isset($all[$connUuid]) || (string)$all[$connUuid][0]->kind !== 'remote') {
            throw new \RuntimeException('unknown remote access connection');
        }
        list($conn, $server) = $all[$connUuid];
        $kp = $this->keypair();
        $psk = trim($this->backend->configdRun('wireguard gen_psk'));
        $address = self::nextAddress($clients, $server);

        $node = $clients->clients->client->Add();
        $uuid = $node->getAttributes()['uuid'];
        $node->setNodes([
            'enabled' => '1', 'name' => self::slug($name), 'pubkey' => $kp['pubkey'], 'psk' => $psk,
            'tunneladdress' => $address, 'keepalive' => '25', 'privkey' => $kp['privkey'],
        ]);
        $server->peers->setValue(implode(',', array_filter(array_merge(explode(',', (string)$server->peers), [$uuid]))));
        $this->save([$servers], [$clients], null);
        return ['uuid' => $uuid, 'name' => (string)$node->name, 'config' => self::buildConfig($conn, $server, $node)];
    }

    private static function ownedPeer(InversaPanel $mdl, Server $servers, $connUuid, $peerUuid)
    {
        $all = self::connections($mdl, $servers);
        if (!isset($all[$connUuid])) {
            return null;
        }
        $server = $all[$connUuid][1];
        return in_array($peerUuid, explode(',', (string)$server->peers)) ? $server : null;
    }

    public function removePeer(InversaPanel $mdl, $connUuid, $peerUuid)
    {
        $servers = new Server();
        $clients = new Client();
        $server = self::ownedPeer($mdl, $servers, $connUuid, $peerUuid);
        if ($server === null) {
            return false;
        }
        $server->peers->setValue(implode(',', array_diff(explode(',', (string)$server->peers), [$peerUuid])));
        $clients->clients->client->del($peerUuid);
        $this->save([$servers], [$clients], null);
        return true;
    }

    public function setPeerEnabled(InversaPanel $mdl, $connUuid, $peerUuid, $on)
    {
        $servers = new Server();
        $clients = new Client();
        if (self::ownedPeer($mdl, $servers, $connUuid, $peerUuid) === null) {
            return false;
        }
        $clients->getNodeByReference('clients.client.' . $peerUuid)->enabled->setValue($on ? '1' : '0');
        $this->save([], [$clients], null);
        return true;
    }

    /* ------------------------------------------------------------------ persist + apply */

    /**
     * same order as core's ClientController: the server's peer relation does not know new peers
     * yet, so servers are written without validation and the peers themselves are validated
     */
    private function save(array $unvalidated, array $validated, ?InversaPanel $mdl)
    {
        foreach ($unvalidated as $m) {
            $m->serializeToConfig(false, true);
        }
        foreach ($validated as $m) {
            $messages = [];
            foreach ($m->performValidation() as $msg) {
                $messages[] = $msg->getField() . ': ' . $msg->getMessage();
            }
            if (!empty($messages)) {
                Config::getInstance()->forceReload();
                throw new \InvalidArgumentException(implode("\n", $messages));
            }
            $m->serializeToConfig();
        }
        if ($mdl !== null) {
            $mdl->serializeToConfig(false, true);
        }
        Config::getInstance()->save();
    }

    /**
     * render and (re)start wireguard, then refresh firewall rules (our hook adds them)
     */
    public function apply()
    {
        $this->backend->configdRun('interface invoke registration');
        $this->backend->configdRun('template reload OPNsense/Wireguard');
        $this->backend->configdRun('wireguard configure');
        $this->backend->configdRun('filter reload');
    }
}
