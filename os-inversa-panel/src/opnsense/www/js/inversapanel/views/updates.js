/*
 * SPDX-License-Identifier: BSD-2-Clause
 * Copyright (C) 2026 Inversa Bilişim
 *
 * Updates: Inversa Panel itself (GitHub releases, scripts/.../update.py) and OPNsense (its own
 * firmware API, called with the rights of whoever is logged in). Nothing is looked up before a
 * button is pressed. A major OPNsense upgrade is only told: it belongs on OPNsense's own page.
 */
(function () {
    'use strict';
    var h = window.InversaPanelApp.h;
    var FW_PAGE = '/ui/core/firmware';
    /* how long a message about updates stays at the top */
    var SHOW = 10000;

    /* ------------------------------------------------------------------ Inversa Panel */

    var A = { version: null };
    /* what GitHub said (check), how the running or last update goes (status) */
    var U = { check: null, checking: false, status: null, timer: null, wasRunning: false, asked: null, checked: null };

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

    function note(kind, text) { return '<div class="k-note ' + kind + '">' + h.esc(text) + '</div>'; }

    function panelCard(T) {
        var s = U.status || {}, c = U.check, busy = fwBusy();
        var html = '<section class="k-card k-ug"><div class="k-ug-head"><div class="k-logo k-ug-logo" aria-hidden="true"></div>' +
            '<div><h2>Inversa Panel</h2><div class="muted">' + h.esc(T.ugPanelSub) + '</div></div></div>' +
            '<div class="k-kv"><span class="muted">' + h.esc(T.ugInstalled) + '</span><span><b>' + h.esc(A.version || '…') + '</b></span></div>';
        if (s.state === 'running') {
            return html + note('info', T.upRunning(s.to || '…') + ' ' + (T.upSteps[s.step] || '')) + '</section>';
        }
        /* what was put back or could not be: stays until the next update; the rest is said at the top and goes */
        if (s.state === 'done' && ((s.restored || []).length || (s.problems || []).length)) {
            html += note((s.problems || []).length ? 'warn' : 'ok', doneText(T, s));
        }
        if (U.checked) {
            html += '<div class="k-kv"><span class="muted">' + h.esc(T.ugLastCheck) + '</span><span>' + h.esc(U.checked.toLocaleString(T.locale)) + '</span></div>';
        }
        /* the answer of the last check stays here, as on the OPNsense card */
        if (c && c.error) {
            html += note('warn', T.upErrors[c.error] || c.error);
        } else if (c && !c.newer) {
            html += note('ok', T.upCurrent(c.installed || A.version || ''));
        }
        if (c && c.newer) {
            html += '<div class="k-up-new"><b>' + h.esc(T.upNew(c.latest)) + '</b>' +
                (c.notes ? '<pre class="k-about-pre k-up-notes">' + h.esc(c.notes) + '</pre>' : '') +
                '<span class="muted small">' + h.esc(T.upBackupNote) + '</span></div>';
        }
        html += '<div class="k-btns">' +
            '<button type="button" class="k-btn" data-act="updates:check"' + (U.checking ? ' disabled' : '') + '>' + h.esc(U.checking ? T.upChecking : T.upCheck) + '</button>' +
            (c && c.newer ? '<button type="button" class="k-btn primary" data-act="updates:install"' + (busy ? ' disabled' : '') + '>' + h.esc(T.upInstall(c.latest)) + '</button>' : '') +
            '</div>' + (c && c.newer && busy ? '<span class="muted small">' + h.esc(T.ugWaitOther) + '</span>' : '');
        /* what is new in the last versions up to the installed one, newest first */
        var cmp = function (a, b) {
            var x = String(a).split('.').map(Number), y = String(b).split('.').map(Number);
            for (var i = 0; i < 3; i++) { if ((x[i] || 0) !== (y[i] || 0)) { return (y[i] || 0) - (x[i] || 0); } }
            return 0;
        };
        var versions = Object.keys(T.news || {}).filter(function (v) { return !A.version || cmp(v, A.version) >= 0; }).sort(cmp).slice(0, 3);
        if (versions.length) {
            html += '<div class="k-news-old"><b>' + h.esc(T.newsHeading) + '</b>' + versions.map(function (v) {
                return '<div><div class="muted small" style="font-weight:600;margin-top:8px">' + h.esc(v) + '</div><ul class="k-news-list">' + h.newsItems(v) + '</ul></div>';
            }).join('') + '</div>';
        }
        return html + '</section>';
    }

    /* ------------------------------------------------------------------ OPNsense */

    /*
     * st: the answer of OPNsense's firmware status; job: 'check' | 'update' while one runs (also one that
     * was started elsewhere: 'busy'); log: its output so far; restarting: the firewall went down to restart
     */
    var O = { st: null, failed: false, job: null, log: '', timer: null, restarting: false, list: false, since: 0 };

    function fw(method, what) {
        return h.api(method, '/api/core/firmware/' + what, {});
    }

    function fwBusy() { return !!O.job || O.restarting; }

    function loadFw() {
        return fw('GET', 'status').then(function (data) { O.st = data || {}; O.failed = false; }, function () { O.failed = true; })
            .then(function () { return O.job ? null : fw('GET', 'running'); })
            .then(function (r) {
                /* started on OPNsense's own page, or before this page was loaded */
                if (r && r.status === 'busy' && !O.job) { O.job = 'busy'; watch(); }
            }, function () {});
    }

    /* how the running job goes, every two seconds; a firewall that stops answering during an update restarts */
    function watch() {
        if (O.timer) { return; }
        O.timer = setInterval(function () {
            fw('GET', 'upgradestatus').then(function (r) {
                /* right after starting, the log may still be the one of the job before */
                if (Date.now() - O.since < 5000) { return; }
                O.log = (r && r.log) || O.log;
                if (r && r.status === 'reboot') { stop(); restart(); } else if (r && r.status === 'done') { stop(); finished(); }
                h.redraw('main');
            }, function () {
                if (O.job === 'update' || O.job === 'busy') { stop(); restart(); h.redraw('main'); }
            });
        }, 2000);
    }

    function stop() {
        if (O.timer) { clearInterval(O.timer); O.timer = null; }
    }

    function finished() {
        var job = O.job;
        O.job = null;
        /* the answer shows in the card itself */
        O.done = job === 'update' || job === 'busy';
        loadFw().then(function () { h.redraw('main'); });
    }

    /*
     * The firewall restarts: ask now and then whether its web server answers, then load the page again.
     * Any answer counts (after a restart the login is gone and the API refuses); only no answer at all
     * means it is down. If it was never seen down, the page loads again after ten minutes anyway.
     */
    function restart() {
        O.restarting = true;
        O.job = null;
        h.waitForRestart();
    }

    /* the packages a minor update brings */
    function pending(st) {
        return st.status === 'update' ? Object.keys(st.all_packages || {}).map(function (k) { return st.all_packages[k]; }) : [];
    }

    function fwCard(T) {
        var st = O.st || {}, product = st.product || {}, list = pending(st), reboot = st.status_reboot === '1' || st.needs_reboot === '1';
        var html = '<section class="k-card k-ug"><div class="k-ug-head"><div class="k-ug-opn" aria-hidden="true">OPN</div>' +
            '<div><h2>OPNsense</h2><div class="muted">' + h.esc(T.ugFwSub) + '</div></div></div>' +
            '<div><div class="k-kv"><span class="muted">' + h.esc(T.ugInstalled) + '</span><span><b>' + h.esc(product.product_version || (O.failed ? '—' : '…')) + '</b></span></div>' +
            (st.last_check ? '<div class="k-kv"><span class="muted">' + h.esc(T.ugLastCheck) + '</span><span>' + h.esc(st.last_check) + '</span></div>' : '') + '</div>';
        if (O.failed) {
            return html + note('warn', T.ugFwNoAccess) + fwLink(T) + '</section>';
        }
        if (O.restarting) {
            return html + note('info', T.ugFwRestarting) + '</section>';
        }
        if (O.job) {
            var lines = (O.log || '').split('\n').filter(function (l) { return l.trim() && l.indexOf('***') !== 0; }).slice(-12).join('\n');
            return html + note('info', O.job === 'check' ? T.ugFwChecking : T.ugFwRunning) +
                (lines ? '<pre class="k-about-pre k-ug-log">' + h.esc(lines) + '</pre>' : '') + '</section>';
        }
        if (st.status === 'error') {
            html += note('warn', st.status_msg || T.ugFwFailed);
        } else if (list.length) {
            html += '<div class="k-up-new"><b>' + h.esc(T.ugFwNewLong(product.product_latest || '', list.length, st.download_size || '')) + '</b>' +
                (reboot ? '<span class="k-note warn">' + h.esc(T.ugFwReboot) + '</span>' : '') +
                '<button type="button" class="k-link small" data-act="updates:list" aria-expanded="' + O.list + '">' + h.esc(O.list ? T.ugHideList : T.ugShowList(list.length)) + '</button>' +
                (O.list ? '<div class="k-ug-list">' + list.map(function (p) {
                    return '<div class="k-list-row"><span class="mono">' + h.esc(p.name) + '</span><span class="muted mono">' +
                        h.esc(p.old && p.new ? p.old + ' → ' + p.new : (p.new || p.old || '')) + '</span></div>';
                }).join('') + '</div>' : '') + '</div>';
        } else if (st.last_check) {
            html += note('ok', O.done ? T.ugFwUpdated : T.ugFwCurrent);
        } else {
            html += '<span class="muted">' + h.esc(T.ugFwNotChecked) + '</span>';
        }
        /* a new major release: OPNsense's own page leads through it */
        if (st.upgrade_major_version) {
            html += note('info', T.ugFwMajor(st.upgrade_major_version));
        }
        var other = U.status && U.status.state === 'running';
        html += '<div class="k-btns"><button type="button" class="k-btn" data-act="updates:fwcheck"' + (other ? ' disabled' : '') + '>' + h.esc(T.upCheck) + '</button>' +
            (list.length ? '<button type="button" class="k-btn primary" data-act="updates:fwupdate"' + (other ? ' disabled' : '') + '>' +
                h.esc(reboot ? T.ugFwUpdateReboot : T.ugFwUpdate) + '</button>' : '') + '</div>' + fwLink(T) + '</section>';
        return html;
    }

    function fwLink(T) {
        return '<a class="k-link small" href="' + FW_PAGE + '">' + h.esc(T.ugFwPage) + ' →</a>';
    }

    /* ------------------------------------------------------------------ page */

    function load() {
        return h.api('GET', '/api/inversapanel/state/about').then(function (data) { A.version = (data || {}).version || null; }, function () {})
            .then(function () { return poll(); })
            .then(function () {
                /* the page was reloaded by an update of the panel that went through: say how it went */
                if (flag(false) && U.status && U.status.state === 'done') {
                    h.notice((U.status.problems || []).length ? 'err' : 'ok', doneText(h.T(), U.status), [], SHOW);
                }
                return loadFw();
            });
    }

    window.InversaPanelApp.register({
        key: 'updates',
        label: function (T) { return T.tabUpdates; },
        load: load,
        render: function () {
            var T = h.T();
            return '<div class="k-stack"><div><h1>' + h.esc(T.tabUpdates) + '</h1><div class="muted" style="font-size:14px;margin-top:4px">' + h.esc(T.ugSub) + '</div></div>' +
                '<div class="k-row stretch">' + panelCard(T) + fwCard(T) + '</div></div>';
        },
        act: function (name) {
            var T = h.T();
            if (name === 'check' && !U.checking) {
                U.checking = true;
                h.api('POST', '/api/inversapanel/update/check', {}).then(function (res) {
                    U.check = res && res.status === 'ok' ? res : { error: (res && res.error) || 'unreachable' };
                }, function () { U.check = { error: 'unreachable' }; }).then(function () {
                    U.checking = false;
                    U.checked = new Date();
                    h.redraw('main');
                });
                return 'main';
            }
            if (name === 'install' && U.check && U.check.newer && !fwBusy() && window.confirm(T.upConfirm(U.check.latest))) {
                U.asked = { at: Date.now(), before: (U.status && U.status.started) || 0 };
                U.status = { state: 'running', step: 'check', to: U.check.latest };
                U.wasRunning = true;
                U.check = null;
                h.api('POST', '/api/inversapanel/update/install', {}).then(function () { return poll(); }, function () { return poll(); })
                    .then(function () { h.redraw('main'); });
                return 'main';
            }
            if (name === 'list') {
                O.list = !O.list;
                return 'main';
            }
            if (name === 'fwcheck' && !fwBusy()) {
                O.job = 'check';
                O.log = '';
                O.since = Date.now();
                fw('POST', 'check').then(function (r) {
                    if (!r || r.status !== 'ok') { throw r; }
                    watch();
                }).catch(function () {
                    O.job = null;
                    h.notice('err', T.ugFwFailed, [], SHOW);
                    h.redraw('main');
                });
                return 'main';
            }
            if (name === 'fwupdate' && !fwBusy()) {
                var st = O.st || {}, reboot = st.status_reboot === '1' || st.needs_reboot === '1';
                if (!window.confirm(T.ugFwConfirm((st.product || {}).product_latest || '', pending(st).length, reboot))) { return null; }
                O.job = 'update';
                O.log = '';
                O.since = Date.now();
                O.list = false;
                fw('POST', 'update').then(function (r) {
                    if (!r || r.status !== 'ok') { throw r; }
                    watch();
                }).catch(function () {
                    O.job = null;
                    h.notice('err', T.ugFwFailed, [], SHOW);
                    h.redraw('main');
                });
                return 'main';
            }
            return null;
        }
    });
})();
