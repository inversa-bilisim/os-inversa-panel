<?php

/*
 * SPDX-License-Identifier: BSD-2-Clause
 * Copyright (C) 2026 Inversa Bilişim
 */

namespace OPNsense\Minnosh\Api;

use OPNsense\Base\ApiControllerBase;
use OPNsense\Minnosh\Extras;

class GeoController extends ApiControllerBase
{
    /**
     * whether a GeoIP database is configured (MaxMind or other) and blocked packet counter
     */
    public function statusAction()
    {
        return Extras::geoStatus();
    }
}
