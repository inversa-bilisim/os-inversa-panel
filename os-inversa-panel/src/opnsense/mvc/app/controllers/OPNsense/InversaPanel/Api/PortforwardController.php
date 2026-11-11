<?php

/*
 * SPDX-License-Identifier: BSD-2-Clause
 * Copyright (C) 2026 Inversa Bilişim
 */

namespace OPNsense\InversaPanel\Api;

use OPNsense\Base\ApiControllerBase;
use OPNsense\Base\UserException;
use OPNsense\InversaPanel\PortForward;
use OPNsense\InversaPanel\Vpn;

/**
 * Port forwards act immediately (like adding a rule in Firewall > NAT), they are not part
 * of the pending "Apply" set.
 */
class PortforwardController extends ApiControllerBase
{
    public function listAction()
    {
        return [
            'rules' => (new PortForward())->listRules(),
            'upnp' => PortForward::upnp(),
            'wan_address' => Vpn::wanAddress(),
        ];
    }

    private function guard()
    {
        if (!$this->request->isPost()) {
            throw new UserException('POST required', 'Inversa Panel');
        }
        $this->throwReadOnly();
        $this->throwNotFullAdmin();
    }

    public function addAction()
    {
        $this->guard();
        try {
            return ['status' => 'ok', 'uuid' => (new PortForward())->add($this->request->getPost())];
        } catch (\InvalidArgumentException $e) {
            return ['status' => 'failed', 'message' => $e->getMessage()];
        }
    }

    public function toggleAction($uuid = null)
    {
        $this->guard();
        $ok = (new PortForward())->setEnabled((string)$uuid, !empty($this->request->getPost('enabled')));
        return ['status' => $ok ? 'ok' : 'failed'];
    }

    public function delAction($uuid = null)
    {
        $this->guard();
        return ['status' => (new PortForward())->delete((string)$uuid) ? 'ok' : 'failed'];
    }
}
