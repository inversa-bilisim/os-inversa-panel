<?php

/*
 * SPDX-License-Identifier: BSD-2-Clause
 * Copyright (C) 2026 Inversa Bilişim
 */

namespace OPNsense\InversaPanel\Api;

use OPNsense\Base\ApiControllerBase;
use OPNsense\Core\Backend;

/**
 * Update from the releases on GitHub, only when asked on the About page. The work is done by
 * scripts/OPNsense/InversaPanel/update.py: it backs up, downloads, compares the checksum, installs
 * and checks that the settings and the records are still there.
 */
class UpdateController extends ApiControllerBase
{
    const STATUS = '/var/db/inversapanel-update/status.json';
    /* an update that says "running" for longer than this has died */
    const STALE = 900;

    /**
     * asks GitHub for the latest release
     */
    public function checkAction()
    {
        if (!$this->request->isPost()) {
            return ['status' => 'failed'];
        }
        $answer = json_decode((string)(new Backend())->configdpRun('inversapanel update', ['check']), true);
        if (!is_array($answer)) {
            return ['status' => 'failed', 'error' => 'unreachable'];
        }
        return ['status' => 'ok'] + $answer;
    }

    /**
     * starts the update in the background; the page follows it with statusAction
     */
    public function installAction()
    {
        if (!$this->request->isPost()) {
            return ['status' => 'failed'];
        }
        $this->throwReadOnly();
        (new Backend())->configdRun('inversapanel updateinstall');
        return ['status' => 'ok'];
    }

    /**
     * how the running or the last update went
     */
    public function statusAction()
    {
        $status = is_file(self::STATUS) ? json_decode((string)file_get_contents(self::STATUS), true) : null;
        if (!is_array($status)) {
            return ['state' => 'none'];
        }
        if (($status['state'] ?? '') === 'running' && time() - (int)($status['started'] ?? 0) > self::STALE) {
            $status['state'] = 'failed';
            $status['error'] = 'stale';
        }
        return $status;
    }
}
