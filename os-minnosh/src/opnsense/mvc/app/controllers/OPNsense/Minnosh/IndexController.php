<?php

/*
 * SPDX-License-Identifier: BSD-2-Clause
 * Copyright (C) 2026 Inversa Bilişim
 */

namespace OPNsense\Minnosh;

class IndexController extends \OPNsense\Base\IndexController
{
    /* static files of the single page UI, relative to the web root */
    const ASSETS = [
        '/css/minnosh/minnosh.css',
        '/js/minnosh/app.js',
        '/js/minnosh/i18n/tr.js',
        '/js/minnosh/i18n/en.js',
        '/js/minnosh/views/net.js',
        '/js/minnosh/views/sched.js',
        '/js/minnosh/views/pf.js',
        '/js/minnosh/views/vpn.js',
        '/js/minnosh/views/guest.js',
        '/js/minnosh/views/geo.js',
    ];

    public function indexAction()
    {
        /*
         * core's cache_safe() versions URLs by the mtime of www/index.php only, so browsers
         * would keep old copies of our files after an update; version by our own files instead.
         */
        $stamp = '';
        foreach (self::ASSETS as $asset) {
            $stamp .= @filemtime('/usr/local/opnsense/www' . $asset);
        }
        $this->view->minnosh_version = substr(md5($stamp), 0, 12);
        $this->view->pick('OPNsense/Minnosh/index');
    }
}
