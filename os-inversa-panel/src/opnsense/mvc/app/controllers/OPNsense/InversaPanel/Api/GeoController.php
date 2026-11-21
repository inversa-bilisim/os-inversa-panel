<?php

/*
 * SPDX-License-Identifier: BSD-2-Clause
 * Copyright (C) 2026 Inversa Bilişim
 */

namespace OPNsense\InversaPanel\Api;

use OPNsense\Base\ApiControllerBase;
use OPNsense\Core\Backend;
use OPNsense\InversaPanel\Extras;

class GeoController extends ApiControllerBase
{
    /**
     * whether a GeoIP database is configured (MaxMind or other) and blocked packet counter
     */
    public function statusAction()
    {
        return Extras::geoStatus();
    }

    /**
     * fetch the free country data now, in the background (also before the restriction is switched on);
     * the status says when it is there, or why it did not come
     */
    public function downloadAction()
    {
        if (!$this->request->isPost()) {
            return ['status' => 'failed'];
        }
        $this->throwReadOnly();
        (new Backend())->configdpRun('inversapanel geoip', ['--force'], true);
        return ['status' => 'ok'];
    }
}
