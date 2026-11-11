<?php

/*
 * SPDX-License-Identifier: BSD-2-Clause
 * Copyright (C) 2026 Inversa Bilişim
 */

namespace OPNsense\InversaPanel;

class IndexController extends \OPNsense\Base\IndexController
{
    /* static files of the single page UI, relative to the web root */
    const ASSETS = [
        '/css/inversapanel/inversapanel.css',
        '/js/inversapanel/app.js',
        '/js/inversapanel/i18n/tr.js',
        '/js/inversapanel/i18n/en.js',
        '/js/inversapanel/views/net.js',
        '/js/inversapanel/views/sched.js',
        '/js/inversapanel/views/pf.js',
        '/js/inversapanel/views/vpn.js',
        '/js/inversapanel/views/dns.js',
        '/js/inversapanel/views/geo.js',
        '/js/inversapanel/views/ips.js',
        '/js/inversapanel/views/logs.js',
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
        $this->view->inversapanel_version = substr(md5($stamp), 0, 12);
        $this->view->pick('OPNsense/InversaPanel/index');
    }
}
