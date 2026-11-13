<?php

/*
 * SPDX-License-Identifier: BSD-2-Clause
 * Copyright (C) 2026 Inversa Bilişim
 */

namespace OPNsense\InversaPanel;

/**
 * Devices deleted on the Devices page: MAC => the time it was deleted. OPNsense's host discovery
 * keeps every device it ever saw, so scripts/.../hosts.py leaves out what was last seen before
 * that time; a device that shows up again afterwards is a new device (watch.php tells it again).
 */
class Forgotten
{
    const FILE = '/var/db/inversapanel/forgotten.json';
    /* entries this old are dropped: by then host discovery forgot the device itself */
    const KEEP = 180 * 86400;

    public static function all()
    {
        $list = is_file(self::FILE) ? json_decode((string)file_get_contents(self::FILE), true) : [];
        return is_array($list) ? $list : [];
    }

    public static function add($mac)
    {
        $now = time();
        $list = array_filter(self::all(), fn($when) => $now - (int)$when < self::KEEP);
        $list[strtolower($mac)] = $now;
        @mkdir(dirname(self::FILE), 0750, true);
        file_put_contents(self::FILE . '.tmp', json_encode($list));
        rename(self::FILE . '.tmp', self::FILE);
    }
}
