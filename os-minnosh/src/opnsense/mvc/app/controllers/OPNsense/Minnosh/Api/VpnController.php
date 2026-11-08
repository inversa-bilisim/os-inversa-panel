<?php

/*
 * SPDX-License-Identifier: BSD-2-Clause
 * Copyright (C) 2026 Inversa Bilişim
 */

namespace OPNsense\Minnosh\Api;

use OPNsense\Base\ApiControllerBase;
use OPNsense\Base\UserException;
use OPNsense\Minnosh\Minnosh;
use OPNsense\Minnosh\Vpn;

/**
 * WireGuard road-warrior VPN. Switching it on/off and adding/removing devices act
 * immediately: a new device's private key only exists in the response (shown once as QR).
 */
class VpnController extends ApiControllerBase
{
    public function statusAction()
    {
        if (!class_exists('\OPNsense\Wireguard\Server')) {
            return ['available' => false];
        }
        return array_merge(['available' => true], (new Vpn())->status(new Minnosh()));
    }

    private function guard()
    {
        if (!$this->request->isPost()) {
            throw new UserException('POST required', 'Minnosh');
        }
        $this->throwReadOnly();
        $this->throwNotFullAdmin();
    }

    public function enableAction()
    {
        $this->guard();
        $vpn = new Vpn();
        try {
            if ($vpn->setEnabled(!empty($this->request->getPost('enabled')))) {
                $vpn->apply();
            }
        } catch (\RuntimeException $e) {
            return ['status' => 'failed', 'message' => $e->getMessage()];
        }
        return ['status' => 'ok'];
    }

    public function addAction()
    {
        $this->guard();
        $name = trim((string)$this->request->getPost('name'));
        if (!preg_match('/^[0-9a-zA-Z._\-]{1,64}$/', $name)) {
            /* WireGuard peer names are restricted; keep what we can */
            $name = substr(preg_replace('/[^0-9a-zA-Z._\-]+/', '-', iconv('UTF-8', 'ASCII//TRANSLIT', $name) ?: 'device'), 0, 64) ?: 'device';
        }
        $vpn = new Vpn();
        try {
            $peer = $vpn->addPeer(new Minnosh(), $name);
            $vpn->apply();
            return array_merge(['status' => 'ok'], $peer);
        } catch (\RuntimeException $e) {
            return ['status' => 'failed', 'message' => $e->getMessage()];
        }
    }

    public function toggleAction($uuid = null)
    {
        $this->guard();
        $vpn = new Vpn();
        if (!$vpn->setPeerEnabled((string)$uuid, !empty($this->request->getPost('enabled')))) {
            return ['status' => 'failed'];
        }
        $vpn->apply();
        return ['status' => 'ok'];
    }

    public function delAction($uuid = null)
    {
        $this->guard();
        $vpn = new Vpn();
        if (!$vpn->removePeer((string)$uuid)) {
            return ['status' => 'failed'];
        }
        $vpn->apply();
        return ['status' => 'ok'];
    }
}
