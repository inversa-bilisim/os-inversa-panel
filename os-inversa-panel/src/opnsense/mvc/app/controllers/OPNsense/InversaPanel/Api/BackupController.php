<?php

/*
 * SPDX-License-Identifier: BSD-2-Clause
 * Copyright (C) 2026 Inversa Bilişim
 */

namespace OPNsense\InversaPanel\Api;

use OPNsense\Base\ApiControllerBase;
use OPNsense\Core\Backend;
use OPNsense\Core\Config;

/**
 * Backup page: download the OPNsense configuration (the panel's settings are part of it), the
 * copies taken every night by scripts/OPNsense/InversaPanel/backup.py, and putting one back.
 * Putting a configuration back restarts the firewall: that is the one way everything runs from it.
 */
class BackupController extends ApiControllerBase
{
    const STORE = '/var/db/inversapanel-backup';
    const NAME = '/^config-[0-9]{8}-[0-9]{4}\.xml$/';
    /* a configuration is some hundred kilobytes; this is far above any real one */
    const LARGEST = 20971520;

    private function copy($name)
    {
        $file = self::STORE . '/' . $name;
        return preg_match(self::NAME, (string)$name) && is_file($file) ? $file : null;
    }

    /**
     * @return string|null why the file is not an OPNsense configuration
     */
    private function problem($file)
    {
        $xml = @simplexml_load_file($file);
        if ($xml === false || $xml->getName() !== 'opnsense') {
            return 'notconfig';
        }
        if (!isset($xml->system) || !isset($xml->interfaces)) {
            return 'incomplete';
        }
        return null;
    }

    private function putBack($file)
    {
        $problem = $this->problem($file);
        if ($problem !== null) {
            return ['status' => 'failed', 'message' => $problem];
        }
        $cnf = Config::getInstance();
        if (!$cnf->restoreBackup($file)) {
            return ['status' => 'failed', 'message' => 'restore'];
        }
        $cnf->save();
        /* everything runs from the configuration that was put back only after a restart */
        (new Backend())->configdRun('system reboot', true);
        return ['status' => 'ok'];
    }

    public function listAction()
    {
        $items = [];
        foreach (array_reverse(glob(self::STORE . '/config-*.xml') ?: []) as $file) {
            if (preg_match(self::NAME, basename($file))) {
                $items[] = ['name' => basename($file), 'time' => filemtime($file), 'size' => filesize($file)];
            }
        }
        return ['copies' => $items, 'changed' => filemtime('/conf/config.xml')];
    }

    /**
     * a copy right now
     */
    public function nowAction()
    {
        if (!$this->request->isPost()) {
            return ['status' => 'failed'];
        }
        $this->throwReadOnly();
        $answer = json_decode((string)(new Backend())->configdpRun('inversapanel backup', ['now']), true);
        return ['status' => ($answer['status'] ?? '') === 'ok' ? 'ok' : 'failed'];
    }

    /**
     * the configuration as it is now, or one of the copies
     */
    public function downloadAction($name = null)
    {
        $file = $name === null ? '/conf/config.xml' : $this->copy($name);
        if ($file === null) {
            $this->response->setStatusCode(404, 'Not Found');
            return;
        }
        $cfg = Config::getInstance()->object();
        $host = preg_replace('/[^A-Za-z0-9.-]/', '', (string)$cfg->system->hostname . '.' . (string)$cfg->system->domain);
        $stamp = $name === null ? date('Ymd-Hi') : substr($name, 7, 13);
        $this->response->setContentType('application/octet-stream');
        $this->response->setRawHeader('Content-Disposition: attachment; filename=config-' . $host . '-' . $stamp . '.xml');
        $this->response->setRawHeader('Content-length: ' . filesize($file));
        $this->response->setRawHeader('Pragma: no-cache');
        $this->response->setRawHeader('Expires: 0');
        $this->response->setContent(fopen($file, 'r'), true);
    }

    /**
     * puts one of the copies back and restarts the firewall
     */
    public function restoreAction($name = null)
    {
        if (!$this->request->isPost()) {
            return ['status' => 'failed'];
        }
        $this->throwReadOnly();
        $file = $this->copy($name);
        return $file === null ? ['status' => 'failed', 'message' => 'notfound'] : $this->putBack($file);
    }

    /**
     * puts a configuration file from the user's computer back and restarts the firewall
     */
    public function uploadAction()
    {
        if (!$this->request->isPost()) {
            return ['status' => 'failed'];
        }
        $this->throwReadOnly();
        $content = (string)$this->request->getPost('content');
        if ($content === '' || strlen($content) > self::LARGEST) {
            return ['status' => 'failed', 'message' => 'notconfig'];
        }
        $tmp = tempnam('/tmp', 'inversapanel');
        chmod($tmp, 0600);
        file_put_contents($tmp, $content);
        try {
            return $this->putBack($tmp);
        } finally {
            @unlink($tmp);
        }
    }
}
