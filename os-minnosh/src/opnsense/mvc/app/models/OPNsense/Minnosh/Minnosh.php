<?php

/*
 * SPDX-License-Identifier: BSD-2-Clause
 * Copyright (C) 2026 Inversa Bilişim
 */

namespace OPNsense\Minnosh;

use OPNsense\Base\BaseModel;

class Minnosh extends BaseModel
{
    /**
     * find a device node by MAC address
     * @param string $mac lowercase MAC address
     * @return \OPNsense\Base\FieldTypes\ArrayField|null
     */
    public function getDeviceByMac($mac)
    {
        foreach ($this->devices->device->iterateItems() as $device) {
            if ((string)$device->mac === $mac) {
                return $device;
            }
        }
        return null;
    }

    /**
     * MAC addresses of devices whose internet access is cut
     * @return array
     */
    public function getBlockedMacs()
    {
        $result = [];
        foreach ($this->devices->device->iterateItems() as $device) {
            if (!$device->blocked->isEmpty()) {
                $result[] = (string)$device->mac;
            }
        }
        return $result;
    }

    /**
     * protected interface keys (lan, opt1, ...)
     * @return array
     */
    public function getProtectedInterfaces()
    {
        return array_values(array_filter(explode(',', (string)$this->general->interfaces)));
    }
}
