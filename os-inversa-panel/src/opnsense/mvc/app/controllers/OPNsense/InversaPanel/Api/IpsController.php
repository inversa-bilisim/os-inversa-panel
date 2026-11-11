<?php

/*
 * SPDX-License-Identifier: BSD-2-Clause
 * Copyright (C) 2026 Inversa Bilişim
 */

namespace OPNsense\InversaPanel\Api;

use OPNsense\Base\ApiControllerBase;
use OPNsense\InversaPanel\InversaPanel;
use OPNsense\InversaPanel\Ips;

class IpsController extends ApiControllerBase
{
    /**
     * state of Suricata, whether blocking is possible here, latest alerts
     */
    public function statusAction()
    {
        return Ips::status(new InversaPanel());
    }

    /**
     * attack protection is on but Suricata is not running (not enough memory before, crashed):
     * try again with the configuration as it is
     */
    public function startAction()
    {
        if (!$this->request->isPost()) {
            return ['status' => 'failed'];
        }
        $this->throwReadOnly();
        $mdl = new InversaPanel();
        if (!Ips::available() || $mdl->ips->enabled->isEmpty()) {
            return ['status' => 'failed'];
        }
        Ips::reconfigure();
        return ['status' => 'ok'];
    }
}
