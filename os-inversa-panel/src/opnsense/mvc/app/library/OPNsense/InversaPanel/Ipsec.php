<?php

/*
 * SPDX-License-Identifier: BSD-2-Clause
 * Copyright (C) 2026 Inversa Bilişim
 */

namespace OPNsense\InversaPanel;

use OPNsense\Core\Backend;
use OPNsense\Core\Config;
use OPNsense\Firewall\Util;
use OPNsense\IPsec\IPsec as IPsecSettings;
use OPNsense\IPsec\Swanctl;

/**
 * IPsec site to site connections on top of OPNsense's own IPsec models (VPN > IPsec > Connections),
 * for the other side that is not a WireGuard device: nearly every firewall speaks IPsec.
 *
 * One Inversa Panel connection is one IKEv2 connection with a pre-shared key and one child per pair
 * of networks (the form other vendors agree with most easily). The encryption is fixed to a set
 * every common device offers (Ipsec::PROPOSAL); nothing of it is asked. Inversa Panel only manages
 * the connections its model refers to; others are reported read-only.
 */
class Ipsec
{
    /* IKE and ESP: AES-256, SHA-256, DH group 14 (2048 bit) */
    const PROPOSAL = 'aes256-sha256-modp2048';
    const PREFIX = 'inversapanel-';
    const HOST = '/^(?=.{1,253}$)(?:[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?\.)+[a-z]{2,63}$/i';
    const KEY = '/^[A-Za-z0-9._~!@#%^*+=:,-]{12,128}$/';

    private $backend;

    public function __construct()
    {
        $this->backend = new Backend();
    }

    public static function available()
    {
        return class_exists('\OPNsense\IPsec\Swanctl');
    }

    /* ------------------------------------------------------------------ helpers */

    private static function cidr($cidr)
    {
        list($addr, $bits) = explode('/', $cidr);
        $mask = (int)$bits == 0 ? 0 : (~0 << (32 - (int)$bits)) & 0xffffffff;
        return long2ip(ip2long($addr) & $mask) . '/' . (int)$bits;
    }

    private static function overlap($a, $b)
    {
        list($an, $ab) = explode('/', $a);
        list($bn, $bb) = explode('/', $b);
        $bits = min((int)$ab, (int)$bb);
        $mask = $bits == 0 ? 0 : (~0 << (32 - $bits)) & 0xffffffff;
        return (ip2long($an) & $mask) === (ip2long($bn) & $mask);
    }

    private static function slug($name)
    {
        $ascii = strtr((string)$name, [
            'ç' => 'c', 'ğ' => 'g', 'ı' => 'i', 'ö' => 'o', 'ş' => 's', 'ü' => 'u', 'â' => 'a', 'î' => 'i', 'û' => 'u',
            'Ç' => 'C', 'Ğ' => 'G', 'İ' => 'I', 'Ö' => 'O', 'Ş' => 'S', 'Ü' => 'U', 'ä' => 'a', 'Ä' => 'A', 'ß' => 'ss',
        ]);
        return trim(substr(preg_replace('/[^0-9a-zA-Z._\-]+/', '-', $ascii), 0, 40), '-') ?: 'site';
    }

    private static function host($value, $what)
    {
        $value = strtolower(trim((string)$value));
        if (!filter_var($value, FILTER_VALIDATE_IP, FILTER_FLAG_IPV4) && !preg_match(self::HOST, $value)) {
            throw new \InvalidArgumentException("$what: enter an IPv4 address or a host name");
        }
        return $value;
    }

    /**
     * networks behind the other side: valid, and not one of ours or of another connection
     */
    private static function remoteNetworks(InversaPanel $mdl, array $list, $skip = null)
    {
        $out = [];
        foreach ($list as $cidr) {
            $cidr = trim((string)$cidr);
            if ($cidr === '') {
                continue;
            }
            if (!Util::isSubnet($cidr) || strpos($cidr, ':') !== false) {
                throw new \InvalidArgumentException("invalid network: $cidr (example: 192.168.50.0/24)");
            }
            $out[] = self::cidr($cidr);
        }
        $out = array_values(array_unique($out));
        if (empty($out)) {
            throw new \InvalidArgumentException('enter at least one network of the other side');
        }
        $taken = [];
        foreach (Config::getInstance()->object()->interfaces->children() as $key => $node) {
            if (filter_var((string)$node->ipaddr, FILTER_VALIDATE_IP, FILTER_FLAG_IPV4) && !empty((string)$node->subnet)) {
                $taken[self::cidr((string)$node->ipaddr . '/' . (string)$node->subnet)] = 'a network of this firewall';
            }
        }
        foreach ($mdl->vpns->connection->iterateItems() as $uuid => $conn) {
            if ($uuid !== $skip) {
                foreach ($conn->remote_networks->getValues() as $cidr) {
                    $taken[$cidr] = 'another VPN connection';
                }
            }
        }
        foreach ($out as $cidr) {
            foreach ($taken as $other => $owner) {
                if (strpos($other, ':') === false && self::overlap($cidr, $other)) {
                    throw new \InvalidArgumentException("$cidr overlaps $other, $owner; both sides need different networks");
                }
            }
        }
        return $out;
    }

    private static function localNetworks(array $keys)
    {
        $keys = array_values(array_filter($keys, fn($k) => preg_match('/^(lan|opt[0-9]+)$/', (string)$k) && Vpn::interfaceNetwork($k) !== null));
        if (empty($keys)) {
            throw new \InvalidArgumentException('choose at least one of your networks');
        }
        return $keys;
    }

    private static function key($value)
    {
        $value = trim((string)$value);
        if ($value === '') {
            return bin2hex(random_bytes(24));
        }
        if (!preg_match(self::KEY, $value)) {
            throw new \InvalidArgumentException('shared key: 12 to 128 letters, digits or . _ ~ ! @ # % ^ * + = : , -');
        }
        return $value;
    }

    /**
     * Inversa Panel connection entries with their IPsec connection: [conn uuid => [conn, connection]]
     */
    public static function connections(InversaPanel $mdl, Swanctl $swanctl)
    {
        $result = [];
        foreach ($mdl->vpns->connection->iterateItems() as $uuid => $conn) {
            $ref = (string)$conn->ipsec;
            $node = $ref !== '' ? $swanctl->getNodeByReference('Connections.Connection.' . $ref) : null;
            if ($node !== null) {
                $result[$uuid] = [$conn, $node];
            }
        }
        return $result;
    }

    /**
     * the local / remote / child / key entries that belong to a connection
     * @return array [section => [uuid => node]]
     */
    private static function parts(Swanctl $swanctl, $ref)
    {
        $parts = ['local' => [], 'remote' => [], 'child' => []];
        foreach (['local' => $swanctl->locals->local, 'remote' => $swanctl->remotes->remote, 'child' => $swanctl->children->child] as $kind => $list) {
            foreach ($list->iterateItems() as $uuid => $node) {
                if ((string)$node->connection === $ref) {
                    $parts[$kind][$uuid] = $node;
                }
            }
        }
        return $parts;
    }

    private static function sharedKey(IPsecSettings $settings, $ref, $create = false)
    {
        foreach ($settings->preSharedKeys->preSharedKey->iterateItems() as $uuid => $node) {
            if ((string)$node->description === self::PREFIX . $ref) {
                return [$uuid, $node];
            }
        }
        if (!$create) {
            return [null, null];
        }
        $node = $settings->preSharedKeys->preSharedKey->Add();
        $node->description->setValue(self::PREFIX . $ref);
        $node->keyType->setValue('PSK');
        return [$node->getAttributes()['uuid'], $node];
    }

    /**
     * one child per pair of networks: other vendors rarely accept several networks in one
     */
    private static function setChildren(Swanctl $swanctl, $ref, array $localKeys, array $remoteNets)
    {
        foreach (array_keys(self::parts($swanctl, $ref)['child']) as $uuid) {
            $swanctl->children->child->del($uuid);
        }
        foreach ($localKeys as $key) {
            foreach ($remoteNets as $remote) {
                $child = $swanctl->children->child->Add();
                $child->setNodes([
                    'enabled' => '1',
                    'connection' => $ref,
                    'esp_proposals' => self::PROPOSAL,
                    'mode' => 'tunnel',
                    'policies' => '1',
                    /* bring it up ourselves and again whenever it went away */
                    'start_action' => 'start',
                    'close_action' => 'start',
                    'dpd_action' => 'start',
                    'local_ts' => Vpn::interfaceNetwork($key),
                    'remote_ts' => $remote,
                    'description' => "$key - $remote",
                ]);
            }
        }
    }

    /* ------------------------------------------------------------------ read */

    /**
     * @return array [connections (same shape as the WireGuard ones where it applies), other tunnels]
     */
    public function status(InversaPanel $mdl)
    {
        $swanctl = new Swanctl();
        $live = json_decode((string)$this->backend->configdRun('ipsec list status'), true);
        $live = is_array($live) ? $live : [];
        $enabled = isset(Config::getInstance()->object()->ipsec->enable);
        $wan = Vpn::wanAddress();

        $list = [];
        $owned = [];
        foreach (self::connections($mdl, $swanctl) as $cuuid => list($conn, $node)) {
            $ref = $node->getAttributes()['uuid'];
            $owned[] = $ref;
            $parts = self::parts($swanctl, $ref);
            $local = reset($parts['local']);
            $remote = reset($parts['remote']);
            $since = 0;
            foreach ($live[$ref]['sas'] ?? [] as $sa) {
                if (($sa['state'] ?? '') === 'ESTABLISHED' && !empty($sa['child-sas'])) {
                    $since = max($since, (int)($sa['established'] ?? 0)) ?: 1;
                }
            }
            $list[] = [
                'uuid' => $cuuid,
                'type' => 'ipsec',
                'kind' => 'site',
                'name' => (string)$node->description,
                'enabled' => !$node->enabled->isEmpty() && $enabled,
                'networks' => $conn->networks->getValues(),
                'remote_networks' => $conn->remote_networks->getValues(),
                'remote_endpoint' => (string)$node->remote_addrs,
                'endpoint' => (string)$conn->endpoint,
                'address' => (string)$conn->endpoint ?: $wan,
                'local_id' => $local ? (string)$local->id : '',
                'remote_id' => $remote ? (string)$remote->id : '',
                /* seconds the tunnel has been up, 0 = not connected */
                'connected' => $since,
                'peers' => [],
            ];
        }

        $others = [];
        foreach ($swanctl->Connections->Connection->iterateItems() as $uuid => $node) {
            if (!in_array($uuid, $owned)) {
                $others[] = (string)$node->description ?: (string)$node->remote_addrs;
            }
        }
        foreach (Config::getInstance()->object()->ipsec->phase1 ?? [] as $ph1) {
            $others[] = (string)$ph1->descr ?: (string)$ph1->{'remote-gateway'};
        }
        return [$list, $others];
    }

    /**
     * what has to be entered on the other side, including the shared key (full administrators only)
     */
    public function config(InversaPanel $mdl, $uuid)
    {
        $swanctl = new Swanctl();
        $all = self::connections($mdl, $swanctl);
        if (!isset($all[$uuid])) {
            return null;
        }
        list($conn, $node) = $all[$uuid];
        $ref = $node->getAttributes()['uuid'];
        $parts = self::parts($swanctl, $ref);
        list(, $psk) = self::sharedKey(new IPsecSettings(), $ref);
        $local = [];
        foreach ($conn->networks->getValues() as $key) {
            if (Vpn::interfaceNetwork($key) !== null) {
                $local[] = Vpn::interfaceNetwork($key);
            }
        }
        return [
            'name' => (string)$node->description,
            'address' => (string)$conn->endpoint ?: Vpn::wanAddress(),
            'remote_endpoint' => (string)$node->remote_addrs,
            'local_id' => (string)(reset($parts['local'])->id ?? ''),
            'remote_id' => (string)(reset($parts['remote'])->id ?? ''),
            'psk' => $psk !== null ? (string)$psk->Key : '',
            'networks' => $local,
            'remote_networks' => $conn->remote_networks->getValues(),
        ];
    }

    /* ------------------------------------------------------------------ change */

    /**
     * req: name, networks[], remote_endpoint, remote_networks[], endpoint? (our address as the other side
     *      reaches it; also our identity), psk? (generated when empty)
     */
    public function create(InversaPanel $mdl, array $req)
    {
        $swanctl = new Swanctl();
        $settings = new IPsecSettings();
        $remoteHost = self::host($req['remote_endpoint'] ?? '', 'address of the other side');
        $endpoint = trim((string)($req['endpoint'] ?? ''));
        $ours = $endpoint !== '' ? self::host($endpoint, 'address of this side') : Vpn::wanAddress();
        if ($ours === '') {
            throw new \InvalidArgumentException('address of this side: could not be found, enter it');
        }
        $localKeys = self::localNetworks((array)($req['networks'] ?? []));
        $remoteNets = self::remoteNetworks($mdl, (array)($req['remote_networks'] ?? []));
        $key = self::key($req['psk'] ?? '');

        $node = $swanctl->Connections->Connection->Add();
        $ref = $node->getAttributes()['uuid'];
        $node->setNodes([
            'enabled' => '1',
            'proposals' => self::PROPOSAL,
            'version' => '2',
            'remote_addrs' => $remoteHost,
            /* notice a dead other side within a minute or so */
            'dpd_delay' => '30',
            'description' => self::PREFIX . self::slug($req['name'] ?? ''),
        ]);
        $local = $swanctl->locals->local->Add();
        $local->setNodes(['enabled' => '1', 'connection' => $ref, 'round' => '0', 'auth' => 'psk', 'id' => $ours]);
        $remote = $swanctl->remotes->remote->Add();
        $remote->setNodes(['enabled' => '1', 'connection' => $ref, 'round' => '0', 'auth' => 'psk', 'id' => $remoteHost]);
        self::setChildren($swanctl, $ref, $localKeys, $remoteNets);

        list(, $psk) = self::sharedKey($settings, $ref, true);
        $psk->ident->setValue($ours);
        $psk->remote_ident->setValue($remoteHost);
        $psk->Key->setValue($key);

        $conn = $mdl->vpns->connection->Add();
        $conn->ipsec->setValue($ref);
        $conn->kind->setValue('site');
        $conn->networks->setValue(implode(',', $localKeys));
        $conn->remote_networks->setValue(implode(',', $remoteNets));
        $conn->endpoint->setValue($endpoint);

        $this->save($swanctl, $settings, $mdl, true);
        return $conn->getAttributes()['uuid'];
    }

    /**
     * change: enabled, networks, remote_endpoint, remote_networks, endpoint, psk
     */
    public function update(InversaPanel $mdl, $uuid, array $req)
    {
        $swanctl = new Swanctl();
        $settings = new IPsecSettings();
        $all = self::connections($mdl, $swanctl);
        if (!isset($all[$uuid])) {
            throw new \InvalidArgumentException('unknown VPN connection');
        }
        list($conn, $node) = $all[$uuid];
        $ref = $node->getAttributes()['uuid'];
        $parts = self::parts($swanctl, $ref);
        list(, $psk) = self::sharedKey($settings, $ref, true);

        if (isset($req['enabled'])) {
            $node->enabled->setValue(!empty($req['enabled']) && $req['enabled'] !== 'false' ? '1' : '0');
        }
        if (isset($req['remote_endpoint'])) {
            $host = self::host($req['remote_endpoint'], 'address of the other side');
            $node->remote_addrs->setValue($host);
            foreach ($parts['remote'] as $remote) {
                $remote->id->setValue($host);
            }
            $psk->remote_ident->setValue($host);
        }
        if (isset($req['endpoint'])) {
            $endpoint = trim((string)$req['endpoint']);
            $ours = $endpoint !== '' ? self::host($endpoint, 'address of this side') : Vpn::wanAddress();
            if ($ours === '') {
                throw new \InvalidArgumentException('address of this side: could not be found, enter it');
            }
            $conn->endpoint->setValue($endpoint);
            foreach ($parts['local'] as $local) {
                $local->id->setValue($ours);
            }
            $psk->ident->setValue($ours);
        }
        if (!empty($req['psk'])) {
            $psk->Key->setValue(self::key($req['psk']));
        }
        if (isset($req['networks']) || isset($req['remote_networks'])) {
            $localKeys = isset($req['networks']) ? self::localNetworks((array)$req['networks']) : $conn->networks->getValues();
            $remoteNets = isset($req['remote_networks']) ? self::remoteNetworks($mdl, (array)$req['remote_networks'], $uuid) : $conn->remote_networks->getValues();
            $conn->networks->setValue(implode(',', $localKeys));
            $conn->remote_networks->setValue(implode(',', $remoteNets));
            self::setChildren($swanctl, $ref, $localKeys, $remoteNets);
        }
        $this->save($swanctl, $settings, $mdl, false);
        return [];
    }

    public function delete(InversaPanel $mdl, $uuid)
    {
        $swanctl = new Swanctl();
        $settings = new IPsecSettings();
        $all = self::connections($mdl, $swanctl);
        if (!isset($all[$uuid])) {
            return false;
        }
        $ref = $all[$uuid][1]->getAttributes()['uuid'];
        $parts = self::parts($swanctl, $ref);
        foreach (array_keys($parts['child']) as $id) {
            $swanctl->children->child->del($id);
        }
        foreach (array_keys($parts['local']) as $id) {
            $swanctl->locals->local->del($id);
        }
        foreach (array_keys($parts['remote']) as $id) {
            $swanctl->remotes->remote->del($id);
        }
        $swanctl->Connections->Connection->del($ref);
        list($keyUuid) = self::sharedKey($settings, $ref);
        if ($keyUuid !== null) {
            $settings->preSharedKeys->preSharedKey->del($keyUuid);
        }
        $mdl->vpns->connection->del($uuid);
        $this->save($swanctl, $settings, $mdl, false);
        return true;
    }

    /* ------------------------------------------------------------------ persist + apply */

    /**
     * The entries of a connection refer to a connection that is new in the same request, which the
     * model's relation fields do not know yet (they read the stored configuration): the connection
     * model is written without its validation; what goes in was checked above. The key is validated.
     */
    private function save(Swanctl $swanctl, IPsecSettings $settings, InversaPanel $mdl, $enable)
    {
        $messages = [];
        foreach ($settings->performValidation() as $msg) {
            $messages[] = $msg->getField() . ': ' . $msg->getMessage();
        }
        if (!empty($messages)) {
            Config::getInstance()->forceReload();
            throw new \InvalidArgumentException(implode("\n", $messages));
        }
        $swanctl->serializeToConfig(false, true);
        $settings->serializeToConfig();
        $mdl->serializeToConfig(false, true);
        if ($enable) {
            /* IPsec as a whole (VPN > IPsec > Connections > "Enable IPsec"); never switched off from here */
            $config = Config::getInstance()->object();
            if (!isset($config->ipsec)) {
                $config->addChild('ipsec');
            }
            $config->ipsec->enable = true;
        }
        Config::getInstance()->save();
    }

    /**
     * the same steps as "Apply" under VPN > IPsec, then the firewall rules (our hook adds them)
     */
    public function apply()
    {
        $this->backend->configdRun('interface invoke registration');
        $this->backend->configdRun('template reload OPNsense/IPsec');
        $this->backend->configdRun('ipsec reload');
        $this->backend->configdRun('filter reload');
    }
}
