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
    var SITE = 'https://inversa.com.tr';
    var MAIL = 'yazilim@inversa.com.tr';
    var PARTS = [
        ['OPNsense', 'https://opnsense.org', 'aboutOpnsense'],
        ['Unbound', 'https://nlnetlabs.nl/projects/unbound/', 'aboutUnbound'],
        ['Suricata', 'https://suricata.io', 'aboutSuricata'],
        ['WireGuard', 'https://www.wireguard.com', 'aboutWireguard'],
        ['strongSwan', 'https://www.strongswan.org', 'aboutStrongswan'],
        ['DB-IP', 'https://db-ip.com', 'aboutDbip']
    ];

    var A = { data: null, copied: false, open: false };
    /* update: what GitHub said (check), how the running or last update goes (status) */
    var U = { check: null, checking: false, status: null, timer: null, wasRunning: false, asked: null };

    function load() {
        return h.api('GET', '/api/inversapanel/state/about').then(function (data) { A.data = data; }, function () { A.data = {}; })
            .then(function () { return poll(); })
            .then(function () {
                /* the page was reloaded by an update that went through: say how it went */
                if (flag(false) && U.status && U.status.state === 'done') {
                    h.notice((U.status.problems || []).length ? 'err' : 'ok', doneText(h.T(), U.status), [], SHOW);
                }
            });
    }

    /* while an update runs the page asks how it goes; the firewall's web server may not answer for a moment */
    function poll() {
        return h.api('GET', '/api/inversapanel/update/status').then(function (status) {
            status = status || { state: 'none' };
            /* just asked for: until the update that was started shows up, the old answer does not count */
            if (U.asked) {
                var fresh = status.state !== 'none' && (status.started || 0) !== U.asked.before;
                if (!fresh && Date.now() - U.asked.at < 30000) { return; }
                U.asked = null;
            }
            U.status = status;
            if (status.state === 'running') { U.wasRunning = true; }
            /* the update went through while this page was open: load the new version of the page */
            if (status.state === 'done' && U.wasRunning) {
                U.wasRunning = false;
                flag(true);
                setTimeout(function () { window.location.reload(); }, 1500);
            }
            if (status.state === 'failed' && U.wasRunning) {
                U.wasRunning = false;
                h.notice('err', h.T().upFailed + ' ' + (h.T().upErrors[status.error] || status.error || '') + (status.detail ? ' (' + status.detail + ')' : ''), [], SHOW);
            }
        }, function () { /* asked again on the next round */ }).then(function () {
            var busy = !!U.asked || (U.status && U.status.state === 'running');
            if (busy && !U.timer) { U.timer = setInterval(function () { poll().then(function () { h.redraw('main'); }); }, 2000); }
            if (!busy && U.timer) { clearInterval(U.timer); U.timer = null; }
        });
    }

    /* how long a message about updates stays at the top */
    var SHOW = 10000;

    function doneText(T, s) {
        var lines = [T.upDone(s.from, s.to)];
        (s.restored || []).forEach(function (k) { lines.push(T.upRestored[k] || k); });
        (s.problems || []).forEach(function (k) { lines.push(T.upProblems[k] || k); });
        if (!(s.restored || []).length && !(s.problems || []).length) { lines.push(T.upAllThere); }
        return lines.join(' ');
    }

    function flag(set) {
        try {
            if (set) { window.sessionStorage.setItem('inversapanelUpdated', '1'); return true; }
            var was = window.sessionStorage.getItem('inversapanelUpdated') === '1';
            window.sessionStorage.removeItem('inversapanelUpdated');
            return was;
        } catch (e) { return false; }
    }

    function updateBox(T) {
        var s = U.status || {}, c = U.check, html = '';
        var note = function (kind, text) { return '<div class="k-note ' + kind + '">' + h.esc(text) + '</div>'; };
        if (s.state === 'running') {
            return '<div class="k-up">' + note('info', T.upRunning(s.to || '…') + ' ' + (T.upSteps[s.step] || '')) + '</div>';
        }
        /* what was put back or could not be: stays until the next update; the rest is said at the top and goes */
        if (s.state === 'done' && ((s.restored || []).length || (s.problems || []).length)) {
            html += note((s.problems || []).length ? 'warn' : 'ok', doneText(T, s));
        }
        if (c && c.newer) {
            html += '<div class="k-up-new"><b>' + h.esc(T.upNew(c.latest)) + '</b>' +
                (c.notes ? '<pre class="k-about-pre k-up-notes">' + h.esc(c.notes) + '</pre>' : '') +
                '<span class="muted small">' + h.esc(T.upBackupNote) + '</span></div>';
        }
        if (c && c.newer) {
            html += '<div class="k-btns"><button type="button" class="k-btn primary" data-act="about:install">' + h.esc(T.upInstall(c.latest)) + '</button></div>';
        }
        return html ? '<div class="k-up">' + html + '</div>' : '';
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
            var parts = d.parts || {};
            return '<div class="k-stack"><div><h1>' + h.esc(T.tabAbout) + '</h1><div class="muted" style="font-size:14px;margin-top:4px">' + h.esc(T.aboutSub) + '</div></div>' +
                /* left: the product, its version and update, where to turn to, the support summary; right: who makes it, what it is built on */
                '<div class="k-about"><div class="k-about-left">' +
                '<section class="k-card k-about-main"><div class="k-about-brand"><div class="k-logo k-about-logo" aria-hidden="true"></div>' +
                '<div><div class="k-about-name">Inversa Panel</div><div class="muted">' + h.esc(T.appSub) + '</div></div></div>' +
                '<div><div class="k-kv k-about-ver"><span class="muted">' + h.esc(T.aboutVersion) + '</span><span><b>' + h.esc(d.version || '…') + '</b>' +
                (U.status && U.status.state === 'running' ? '' : '<button type="button" class="k-btn" data-act="about:check"' + (U.checking ? ' disabled' : '') + '>' + h.esc(U.checking ? T.upChecking : T.upCheck) + '</button>') + '</span></div>' +
                updateBox(T) +
                kv(T.aboutWeb, link(SITE, 'inversa.com.tr')) +
                kv(T.aboutMail, '<span class="mono">' + h.esc(MAIL) + '</span>') +
                kv(T.aboutLicense, link(REPO + '/blob/main/LICENSE', 'BSD-2-Clause')) +
                kv(T.aboutSource, link(REPO, 'github.com/inversa-bilisim/os-inversa-panel')) +
                kv(T.aboutIssues, link(REPO + '/issues', T.aboutIssuesLink)) + '</div>' +
                /* one button: copies the summary and shows what was copied */
                '<div class="k-about-support"><button type="button" class="k-btn" data-act="about:copy" aria-expanded="' + A.open + '">' + h.icon(A.copied ? h.ICONS.ok : COPY, 16) + h.esc(A.copied ? T.aboutCopied : T.aboutCopy) + '</button>' +
                '<span class="muted small">' + h.esc(T.aboutSupportSub) + '</span></div>' +
                (A.open ? '<pre class="k-about-pre">' + h.esc(supportText()) + '</pre>' : '') +
                '<div class="muted small">© 2026 Inversa Bilişim</div></section></div>' +

                '<div class="k-about-left"><section class="k-card"><div class="k-about-co"><h2>Inversa Bilişim</h2>' +
                T.aboutCompany.map(function (p) { return '<p>' + h.esc(p) + '</p>'; }).join('') + '</div></section>' +
                '<section class="k-card k-about-parts"><h2>' + h.esc(T.aboutBuiltOn) + '</h2><div class="muted" style="font-size:14px">' + h.esc(T.aboutBuiltOnSub) + '</div><div>' +
                PARTS.map(function (p) {
                    var ver = A.data ? (parts[p[0]] || T.aboutNotInstalled) : '…';
                    return '<div class="k-list-row"><span class="k-about-part">' + link(p[1], p[0]) + '</span><span class="mono k-about-partver' + (parts[p[0]] ? '' : ' muted') + '">' + h.esc(ver) + '</span><span class="muted">' + h.esc(T[p[2]]) + '</span></div>';
                }).join('') + '</div></section></div>' + '</div></div>';
        },
        act: function (name) {
            if (name === 'copy') {
                /* opens and copies; pressed again, it closes */
                A.open = !A.open;
                if (A.open) { copy(supportText()); }
                return 'main';
            }
            if (name === 'check' && !U.checking) {
                U.checking = true;
                h.api('POST', '/api/inversapanel/update/check', {}).then(function (res) {
                    U.check = res && res.status === 'ok' ? res : { error: (res && res.error) || 'unreachable' };
                }, function () { U.check = { error: 'unreachable' }; }).then(function () {
                    var T = h.T(), c = U.check;
                    U.checking = false;
                    /* said at the top, gone after ten seconds; a new version also stays in the card with its button */
                    if (c.error) { h.notice('err', T.upErrors[c.error] || c.error, [], SHOW); U.check = null; } else if (c.newer) { h.notice('ok', T.upNew(c.latest), [], SHOW); } else { h.notice('ok', T.upCurrent(c.installed), [], SHOW); U.check = null; }
                    h.redraw('main');
                });
                return 'main';
            }
            if (name === 'install' && U.check && U.check.newer && window.confirm(h.T().upConfirm(U.check.latest))) {
                U.asked = { at: Date.now(), before: (U.status && U.status.started) || 0 };
                U.status = { state: 'running', step: 'check', to: U.check.latest };
                U.wasRunning = true;
                U.check = null;
                h.api('POST', '/api/inversapanel/update/install', {}).then(function () { return poll(); }, function () { return poll(); })
                    .then(function () { h.redraw('main'); });
                return 'main';
            }
            return null;
        }
    });
})();
