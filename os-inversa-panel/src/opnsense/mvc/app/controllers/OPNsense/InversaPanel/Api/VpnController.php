<?php

/*
 * SPDX-License-Identifier: BSD-2-Clause
 * Copyright (C) 2026 Inversa Bilişim
 */

namespace OPNsense\InversaPanel\Api;

use OPNsense\Base\ApiControllerBase;
use OPNsense\Base\UserException;
use OPNsense\InversaPanel\InversaPanel;
use OPNsense\InversaPanel\Ipsec;
use OPNsense\InversaPanel\Vpn;

/**
 * WireGuard VPN connections (remote access and site to site). All operations act immediately,
 * like in VPN > WireGuard; they are not part of the pending "Apply" set.
 */
class VpnController extends ApiControllerBase
{
    public function statusAction()
    {
        if (!class_exists('\OPNsense\Wireguard\Server')) {
            return ['available' => false];
        }
        $mdl = new InversaPanel();
        $status = array_merge(['available' => true, 'ipsec_available' => Ipsec::available(), 'ipsec_others' => []], (new Vpn())->status($mdl));
        if (Ipsec::available()) {
            list($list, $others) = (new Ipsec())->status($mdl);
            $status['connections'] = array_merge($status['connections'], $list);
            $status['ipsec_others'] = $others;
        }
        return $status;
    }

    /**
     * the engine a connection runs on: WireGuard, or IPsec for site to site with other vendors
     */
    private static function isIpsec(InversaPanel $mdl, $uuid)
    {
        $conn = $mdl->getNodeByReference('vpns.connection.' . (string)$uuid);
        return $conn !== null && (string)$conn->ipsec !== '';
    }

    private function guard($post = true)
    {
        if ($post && !$this->request->isPost()) {
            throw new UserException('POST required', 'Inversa Panel');
        }
        $this->throwReadOnly();
        $this->throwNotFullAdmin();
    }

    /**
     * run a change, apply WireGuard + firewall, report validation problems readably
     */
    private function change(callable $fn, $ipsec = false)
    {
        $vpn = $ipsec ? new Ipsec() : new Vpn();
        try {
            $result = $fn($vpn, new InversaPanel());
            $vpn->apply();
            return array_merge(['status' => 'ok'], is_array($result) ? $result : []);
        } catch (\InvalidArgumentException | \RuntimeException $e) {
            return ['status' => 'failed', 'message' => $e->getMessage()];
        }
    }

    public function createAction()
    {
        $this->guard();
        $req = $this->request->getPost();
        $ipsec = is_array($req) && ($req['type'] ?? '') === 'ipsec' && Ipsec::available();
        return $this->change(fn($vpn, $mdl) => ['uuid' => $vpn->create($mdl, is_array($req) ? $req : [])], $ipsec);
    }

    public function updateAction($uuid = null)
    {
        $this->guard();
        $req = $this->request->getPost();
        return $this->change(fn($vpn, $mdl) => $vpn->update($mdl, (string)$uuid, is_array($req) ? $req : []), self::isIpsec(new InversaPanel(), $uuid));
    }

    public function deleteAction($uuid = null)
    {
        $this->guard();
        return $this->change(function ($vpn, $mdl) use ($uuid) {
            if (!$vpn->delete($mdl, (string)$uuid)) {
                throw new \InvalidArgumentException('unknown VPN connection');
            }
        }, self::isIpsec(new InversaPanel(), $uuid));
    }

    /**
     * what to enter on the other side of an IPsec connection, incl. the shared key: full admins only
     */
    public function ipsecconfigAction($uuid = null)
    {
        $this->guard(false);
        $cfg = Ipsec::available() ? (new Ipsec())->config(new InversaPanel(), (string)$uuid) : null;
        return $cfg === null ? ['status' => 'failed'] : array_merge(['status' => 'ok'], $cfg);
    }

    public function peeraddAction($conn = null)
    {
        $this->guard();
        $name = trim((string)$this->request->getPost('name')) ?: 'device';
        return $this->change(fn($vpn, $mdl) => $vpn->addPeer($mdl, (string)$conn, $name));
    }

    /**
     * client configuration incl. private key (QR code / .conf): full admins only
     */
    public function peerconfigAction($conn = null, $peer = null)
    {
        $this->guard(false);
        $cfg = (new Vpn())->peerConfig(new InversaPanel(), (string)$conn, (string)$peer);
        if ($cfg === null) {
            return ['status' => 'failed'];
        }
        return array_merge(['status' => $cfg['config'] === null ? 'nokey' : 'ok'], $cfg);
    }

    public function peerrenewAction($conn = null, $peer = null)
    {
        $this->guard();
        return $this->change(fn($vpn, $mdl) => $vpn->renewPeerKey($mdl, (string)$conn, (string)$peer));
    }

    public function peertoggleAction($conn = null, $peer = null)
    {
        $this->guard();
        $on = !empty($this->request->getPost('enabled'));
        return $this->change(function ($vpn, $mdl) use ($conn, $peer, $on) {
            if (!$vpn->setPeerEnabled($mdl, (string)$conn, (string)$peer, $on)) {
                throw new \InvalidArgumentException('unknown VPN device');
            }
        });
    }

    public function peerdelAction($conn = null, $peer = null)
    {
        $this->guard();
        return $this->change(function ($vpn, $mdl) use ($conn, $peer) {
            if (!$vpn->removePeer($mdl, (string)$conn, (string)$peer)) {
                throw new \InvalidArgumentException('unknown VPN device');
            }
        });
    }
}
