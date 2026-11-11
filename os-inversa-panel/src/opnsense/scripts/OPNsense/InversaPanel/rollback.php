#!/usr/local/bin/php
<?php

/*
 * SPDX-License-Identifier: BSD-2-Clause
 * Copyright (C) 2026 Inversa Bilişim
 *
 * Background half of OPNsense\InversaPanel\Rollback: wait, and when the change was not confirmed
 * (state file still present with our token) restore the backup taken before it.
 *
 * usage: rollback.php <token> <seconds>
 */

require_once('config.inc');

use OPNsense\Core\Config;

$state_file = '/tmp/inversapanel_rollback.json';
$token = $argv[1] ?? '';
$wait = max(10, min(600, (int)($argv[2] ?? 90)));

sleep($wait);

if (!is_file($state_file)) {
    exit(0); /* confirmed */
}
$state = json_decode(file_get_contents($state_file), true);
if (!is_array($state) || ($state['token'] ?? '') !== $token) {
    exit(0); /* a newer change owns the countdown now */
}
@unlink($state_file);

$file = $state['file'] ?? '';
if (!is_file($file) || strpos(realpath($file), '/conf/backup/') !== 0) {
    syslog(LOG_ERR, 'inversapanel: rollback backup missing, nothing restored');
    exit(1);
}
syslog(LOG_WARNING, 'inversapanel: network change not confirmed, restoring ' . basename($file));
$cfg = Config::getInstance();
$cfg->restoreBackup($file);
$cfg->save();
passthru('/usr/local/sbin/configctl service reload all');
