<?php

/*
 * SPDX-License-Identifier: BSD-2-Clause
 * Copyright (C) 2026 Inversa Bilişim
 */

namespace OPNsense\Minnosh;

use OPNsense\Core\Backend;
use OPNsense\Core\Config;

/**
 * Safety net for network changes (OPNsense core has none): a copy of the configuration is
 * taken before the change; unless the user confirms within the timeout, a background job
 * puts that copy back and reloads all services.
 */
class Rollback
{
    const STATE = '/tmp/minnosh_rollback.json';
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
        (new Backend())->configdpRun('minnosh rollback', [$state['token'], self::TIMEOUT], true);
        return $state;
    }

    public static function pending()
    {
        if (!is_file(self::STATE)) {
            return null;
        }
        $state = json_decode(file_get_contents(self::STATE), true);
        return is_array($state) ? ['deadline' => $state['deadline'], 'remaining' => max(0, $state['deadline'] - time())] : null;
    }

    /**
     * user confirmed the network still works: keep the new configuration
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
