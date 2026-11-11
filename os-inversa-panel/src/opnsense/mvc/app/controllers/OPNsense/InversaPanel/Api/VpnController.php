<?php

/*
 * SPDX-License-Identifier: BSD-2-Clause
 * Copyright (C) 2026 Inversa Bilişim
 */

namespace OPNsense\InversaPanel\Api;

use OPNsense\Base\ApiControllerBase;
use OPNsense\Base\UserException;
use OPNsense\InversaPanel\InversaPanel;
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
        return array_merge(['available' => true], (new Vpn())->status(new InversaPanel()));
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
    private function change(callable $fn)
    {
        $vpn = new Vpn();
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
        return $this->change(fn($vpn, $mdl) => ['uuid' => $vpn->create($mdl, is_array($req) ? $req : [])]);
    }

    public function updateAction($uuid = null)
    {
        $this->guard();
        $req = $this->request->getPost();
        return $this->change(fn($vpn, $mdl) => $vpn->update($mdl, (string)$uuid, is_array($req) ? $req : []));
    }

    public function deleteAction($uuid = null)
    {
        $this->guard();
        return $this->change(function ($vpn, $mdl) use ($uuid) {
            if (!$vpn->delete($mdl, (string)$uuid)) {
                throw new \InvalidArgumentException('unknown VPN connection');
            }
        });
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
