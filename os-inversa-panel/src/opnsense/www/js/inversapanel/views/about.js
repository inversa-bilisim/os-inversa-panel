/*
 * SPDX-License-Identifier: BSD-2-Clause
 * Copyright (C) 2026 Inversa Bilişim
 *
 * About: which version runs here, who makes it, where to turn to, and what it is built on.
 * "Copy support information" gives a summary without anything secret to paste into a message.
 */
(function () {
    'use strict';
    var h = window.InversaPanelApp.h;
    var COPY = 'M9 9h10a1 1 0 0 1 1 1v10a1 1 0 0 1-1 1H9a1 1 0 0 1-1-1V10a1 1 0 0 1 1-1zM5 15H4a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1h10a1 1 0 0 1 1 1v1';
    var REPO = 'https://github.com/inversa-bilisim/os-inversa-panel';
    var MAIL = 'yazilim@inversa.com.tr';
    var PARTS = [
        ['OPNsense', 'https://opnsense.org', 'aboutOpnsense'],
        ['Unbound', 'https://nlnetlabs.nl/projects/unbound/', 'aboutUnbound'],
        ['Suricata', 'https://suricata.io', 'aboutSuricata'],
        ['WireGuard', 'https://www.wireguard.com', 'aboutWireguard'],
        ['strongSwan', 'https://www.strongswan.org', 'aboutStrongswan'],
        ['DB-IP', 'https://db-ip.com', 'aboutDbip']
    ];

    var A = { data: null, copied: false };

    function load() {
        return h.api('GET', '/api/inversapanel/state/about').then(function (data) { A.data = data; }, function () { A.data = {}; });
    }

    /* what somebody helping needs to know; no addresses of devices, keys or passwords */
    function supportText() {
        var s = h.S().saved, d = A.data || {}, f = s.filtering || {};
        var onOff = function (v) { return v ? 'on' : 'off'; };
        return [
            'Inversa Panel ' + (d.version || '?'),
            (d.product || 'OPNsense') + ' ' + (d.product_version || '?'),
            'Panel: ' + onOff(s.general.enabled) + ', language: ' + s.general.language,
            'Protected networks: ' + (s.general.interfaces || []).length,
            'Filtering: ' + ['ads', 'malware', 'adult', 'gambling', 'bypass', 'safesearch', 'forcedns'].filter(function (k) { return f[k]; }).join(', ') +
                ' | apps: ' + (f.apps || []).length + ' | allow list: ' + (f.allowlist || []).length + ' | block list: ' + (f.denylist || []).length,
            'Attack protection: ' + onOff(s.ips && s.ips.enabled) + (s.ips && s.ips.enabled ? ' (' + s.ips.mode + ')' : ''),
            'Countries: ' + onOff(s.geo && s.geo.enabled) + (s.geo && s.geo.enabled ? ' (' + s.geo.mode + ')' : ''),
            'DNS servers: ' + ((s.dns || {}).upstream || 'auto') + ((s.dns || {}).dot ? ' + DoT' : ''),
            'Devices known: ' + h.hosts().length + ', schedules: ' + (s.schedules || []).length,
            'Browser: ' + (typeof navigator !== 'undefined' ? navigator.userAgent : '')
        ].join('\n');
    }

    function copy(text) {
        var done = function () { A.copied = true; h.redraw('main'); setTimeout(function () { A.copied = false; h.redraw('main'); }, 2500); };
        var fallback = function () {
            var area = document.createElement('textarea');
            area.value = text;
            document.body.appendChild(area);
            area.select();
            try { document.execCommand('copy'); done(); } catch (e) { /* the text stays visible on the page */ }
            area.remove();
        };
        if (typeof navigator !== 'undefined' && navigator.clipboard && navigator.clipboard.writeText) { navigator.clipboard.writeText(text).then(done, fallback); } else { fallback(); }
    }

    window.InversaPanelApp.register({
        key: 'about',
        label: function (T) { return T.tabAbout; },
        load: load,
        render: function () {
            var T = h.T(), d = A.data || {};
            var link = function (url, text) { return '<a href="' + h.esc(url) + '" target="_blank" rel="noopener">' + h.esc(text) + '</a>'; };
            var kv = function (k, v) { return '<div class="k-kv"><span class="muted">' + h.esc(k) + '</span><span>' + v + '</span></div>'; };
            return '<div class="k-stack"><div><h1>' + h.esc(T.tabAbout) + '</h1><div class="muted" style="font-size:14px;margin-top:4px">' + h.esc(T.aboutSub) + '</div></div>' +
                '<div class="k-about">' +
                '<section class="k-card k-about-main"><div class="k-about-brand"><div class="k-logo k-about-logo" aria-hidden="true"></div>' +
                '<div><div class="k-about-name">Inversa Panel</div><div class="muted">' + h.esc(T.appSub) + '</div></div></div>' +
                '<div>' + kv(T.aboutVersion, '<b>' + h.esc(d.version || '…') + '</b>') +
                kv(T.aboutRunsOn, h.esc(A.data ? (d.product || 'OPNsense') + ' ' + (d.product_version || '') : '…')) +
                kv(T.aboutLicense, link(REPO + '/blob/main/LICENSE', 'BSD-2-Clause')) +
                kv(T.aboutSource, link(REPO, 'github.com/inversa-bilisim/os-inversa-panel')) + '</div>' +
                '<div class="muted small">© 2026 Inversa Bilişim</div></section>' +

                '<section class="k-card"><h2>Inversa Bilişim</h2><div class="muted" style="font-size:14px">' + h.esc(T.aboutCompany) + '</div>' +
                '<div>' + kv(T.aboutMail, '<span class="mono">' + h.esc(MAIL) + '</span>') +
                kv(T.aboutIssues, link(REPO + '/issues', T.aboutIssuesLink)) + '</div>' +
                '<div class="k-about-support"><div><b>' + h.esc(T.aboutSupport) + '</b><span class="muted">' + h.esc(T.aboutSupportSub) + '</span></div>' +
                '<button type="button" class="k-btn" data-act="about:copy">' + h.icon(A.copied ? h.ICONS.ok : COPY, 16) + h.esc(A.copied ? T.aboutCopied : T.aboutCopy) + '</button></div>' +
                '<pre class="k-about-pre">' + h.esc(supportText()) + '</pre></section>' +

                '<section class="k-card k-about-parts"><h2>' + h.esc(T.aboutBuiltOn) + '</h2><div class="muted" style="font-size:14px">' + h.esc(T.aboutBuiltOnSub) + '</div><div>' +
                PARTS.map(function (p) {
                    return '<div class="k-list-row"><span class="k-about-part">' + link(p[1], p[0]) + '</span><span class="muted">' + h.esc(T[p[2]]) + '</span></div>';
                }).join('') + '</div></section></div></div>';
        },
        act: function (name) {
            if (name === 'copy') { copy(supportText()); }
            return null;
        }
    });
})();
