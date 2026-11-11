<?php

/*
 * SPDX-License-Identifier: BSD-2-Clause
 * Copyright (C) 2026 Inversa Bilişim
 */

namespace OPNsense\InversaPanel;

use OPNsense\Core\Backend;
use OPNsense\Core\Config;

/**
 * Safety net for changes that can cut the administrator off (network settings, "only these
 * countries get in") or everybody (other DNS servers); OPNsense core has none. A copy of the configuration is taken before the
 * change; unless the user confirms within the timeout, a background job puts that copy back and
 * reloads all services.
 */
class Rollback
{
    const STATE = '/tmp/inversapanel_rollback.json';
    const TIMEOUT = 90;

    /**
     * take the backup, call before changing anything
     */
    public static function prepare()
    {
        return Config::getInstance()->backup();
    }

    /**
     * start the countdown for a backup taken with prepare()
     */
    public static function arm($backupFile)
    {
        $state = ['file' => $backupFile, 'deadline' => time() + self::TIMEOUT, 'token' => bin2hex(random_bytes(8))];
        file_put_contents(self::STATE, json_encode($state));
        chmod(self::STATE, 0600);
        (new Backend())->configdpRun('inversapanel rollback', [$state['token'], self::TIMEOUT], true);
        return $state;
    }

    public static function pending()
    {
        if (!is_file(self::STATE)) {
            return null;
        }
        $state = json_decode(file_get_contents(self::STATE), true);
        if (!is_array($state) || time() > (int)$state['deadline'] + 60) {
            /* the background job removes the file when the time is up; one that is still here was left behind */
            @unlink(self::STATE);
            return null;
        }
        return ['deadline' => $state['deadline'], 'remaining' => max(0, $state['deadline'] - time())];
    }

    /**
     * user confirmed everything still works: keep the new configuration
     */
    public static function confirm()
    {
        if (is_file(self::STATE)) {
            @unlink(self::STATE);
            return true;
        }
        return false;
    }
}
