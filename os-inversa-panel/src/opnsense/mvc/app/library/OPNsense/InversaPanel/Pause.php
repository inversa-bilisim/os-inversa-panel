<?php

/*
 * SPDX-License-Identifier: BSD-2-Clause
 * Copyright (C) 2026 Inversa Bilişim
 */

namespace OPNsense\InversaPanel;

/**
 * Devices cut off for a while from the Devices page ("pause"): MAC => the time it ends.
 * Not part of the configuration: a pause is for now and ends by itself. scripts/.../schedule.php
 * puts the addresses of paused devices into the same pf table the "cut internet" schedules use.
 */
class Pause
{
    const FILE = '/var/db/inversapanel/pause.json';
    /* a pause is for hours, not for days */
    const LONGEST = 86400;

    /**
     * @return array MAC => unix time the pause ends, only the ones still running
     */
    public static function all()
    {
        $list = is_file(self::FILE) ? json_decode((string)file_get_contents(self::FILE), true) : [];
        $now = time();
        return array_filter(is_array($list) ? $list : [], fn($until) => (int)$until > $now);
    }

    private static function write(array $list)
    {
        if (empty($list)) {
            @unlink(self::FILE);
            return;
        }
        @mkdir(dirname(self::FILE), 0750, true);
        file_put_contents(self::FILE . '.tmp', json_encode($list));
        rename(self::FILE . '.tmp', self::FILE);
    }

    public static function set($mac, $until)
    {
        $list = self::all();
        $list[strtolower($mac)] = min((int)$until, time() + self::LONGEST);
        self::write($list);
        return $list[strtolower($mac)];
    }

    public static function clear($mac)
    {
        $list = self::all();
        unset($list[strtolower($mac)]);
        self::write($list);
    }

    /**
     * drops the pauses that ended; what is left
     */
    public static function tidy()
    {
        $list = self::all();
        if (is_file(self::FILE)) {
            self::write($list);
        }
        return $list;
    }
}
