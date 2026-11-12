/*
 * SPDX-License-Identifier: BSD-2-Clause
 * Copyright (C) 2026 Inversa Bilişim
 *
 * Backup: download the OPNsense configuration (the panel's settings are part of it), put one
 * back from a file, and the copies the firewall takes every night. Putting a configuration back
 * restarts the firewall; the page waits for it and loads again.
 */
(function () {
    'use strict';
    var h = window.InversaPanelApp.h;
    var DOWN = 'M12 4v11M7 11l5 5 5-5M5 20h14';
    var UP = 'M12 20V9M7 13l5-5 5 5M5 4h14';
    var B = { data: null, busy: false, restarting: false, error: null };

    function load() {
        return h.api('GET', '/api/inversapanel/backup/list').then(function (data) { B.data = data; }, function () { B.data = { copies: [] }; });
    }

    function when(ts) {
        var d = new Date(ts * 1000), two = function (n) { return (n < 10 ? '0' : '') + n; };
        return two(d.getDate()) + '.' + two(d.getMonth() + 1) + '.' + d.getFullYear() + ' ' + two(d.getHours()) + ':' + two(d.getMinutes());
    }

    /* the firewall restarts: ask now and then whether it is back, then load the page again */
    function waitForRestart() {
        B.restarting = true;
        h.redraw('main');
        var gone = false, asked = 0;
        var timer = setInterval(function () {
            asked++;
            h.api('GET', '/api/inversapanel/backup/list').then(function () {
                /* it still answers in the first seconds, before it goes down */
                if (gone || asked > 40) { clearInterval(timer); window.location.reload(); }
            }, function () { gone = true; });
        }, 5000);
    }

    function restore(url, payload) {
        B.busy = true;
        B.error = null;
        h.redraw('main');
        h.api('POST', url, payload || {}).then(function (res) {
            B.busy = false;
            if (res && res.status === 'ok') { waitForRestart(); return; }
            B.error = (h.T().bkErrors[(res && res.message) || ''] || h.T().applyFailed);
            h.redraw('main');
        }, function () {
            B.busy = false;
            B.error = h.T().applyFailed;
            h.redraw('main');
        });
    }

    /* a file from this computer: chosen, asked about, sent */
    function pickFile() {
        var T = h.T(), input = document.createElement('input');
        input.type = 'file';
        input.accept = '.xml,text/xml,application/xml';
        input.onchange = function () {
            var file = input.files && input.files[0];
            if (!file) { return; }
            if (file.size > 20 * 1024 * 1024) { B.error = T.bkErrors.notconfig; h.redraw('main'); return; }
            var reader = new FileReader();
            reader.onload = function () {
                if (window.confirm(T.bkConfirmFile(file.name))) { restore('/api/inversapanel/backup/upload', { content: String(reader.result) }); }
            };
            reader.readAsText(file);
        };
        input.click();
    }

    window.InversaPanelApp.register({
        key: 'backup',
        label: function (T) { return T.tabBackup; },
        load: load,
        render: function () {
            var T = h.T(), d = B.data;
            var html = '<div class="k-stack"><div><h1>' + h.esc(T.tabBackup) + '</h1><div class="muted" style="font-size:14px;margin-top:4px">' + h.esc(T.bkSub) + '</div></div>';
            if (B.restarting) {
                return html + '<div class="k-banner info" style="margin:0">' + h.icon(h.ICONS.info, 20) + '<span>' + h.esc(T.bkRestarting) + '</span></div></div>';
            }
            if (!d) { return html + '<div class="k-loading">…</div></div>'; }
            if (B.error) { html += '<div class="k-banner err" style="margin:0">' + h.icon(h.ICONS.warn, 20) + '<span>' + h.esc(B.error) + '</span></div>'; }
            var off = B.busy ? ' disabled' : '';

            html += '<div class="k-bk"><section class="k-card"><h2>' + h.esc(T.bkGetTitle) + '</h2><div class="muted" style="font-size:14px">' + h.esc(T.bkGetSub) + '</div>' +
                '<div><a class="k-btn primary" href="/api/inversapanel/backup/download">' + h.icon(DOWN, 16) + h.esc(T.bkDownload) + '</a></div>' +
                '<span class="k-note warn">' + h.esc(T.bkSecret) + '</span></section>' +
                '<section class="k-card"><h2>' + h.esc(T.bkPutTitle) + '</h2><div class="muted" style="font-size:14px">' + h.esc(T.bkPutSub) + '</div>' +
                '<div><button type="button" class="k-btn" data-act="backup:file"' + off + '>' + h.icon(UP, 16) + h.esc(T.bkUpload) + '</button></div>' +
                '<span class="k-note warn">' + h.esc(T.bkRestartNote) + '</span></section></div>';

            html += '<section class="k-card"><div class="k-card-head"><h2>' + h.esc(T.bkCopies) + '</h2>' +
                '<button type="button" class="k-btn small" data-act="backup:now"' + off + '>' + h.esc(T.bkNow) + '</button></div>' +
                '<div class="muted" style="font-size:14px">' + h.esc(T.bkCopiesSub) + '</div>';
            if (!d.copies.length) {
                html += '<div class="muted">' + h.esc(T.bkNone) + '</div>';
            } else {
                html += '<div>' + d.copies.map(function (c) {
                    return '<div class="k-list-row"><span style="flex:1 1 auto"><b>' + h.esc(when(c.time)) + '</b> <span class="muted small">' + h.esc(Math.max(1, Math.round(c.size / 1024)) + ' KB') + '</span></span>' +
                        '<a class="k-btn small" href="/api/inversapanel/backup/download/' + h.esc(c.name) + '">' + h.esc(T.bkDownloadShort) + '</a>' +
                        '<button type="button" class="k-btn small" data-act="backup:restore" data-v="' + h.esc(c.name) + '" data-n="' + h.esc(when(c.time)) + '"' + off + '>' + h.esc(T.bkRestore) + '</button></div>';
                }).join('') + '</div>';
            }
            return html + '</section></div>';
        },
        act: function (name, el) {
            var T = h.T(), v = el.getAttribute('data-v');
            if (B.busy) { return null; }
            if (name === 'file') { pickFile(); }
            if (name === 'restore' && window.confirm(T.bkConfirmCopy(el.getAttribute('data-n')))) {
                restore('/api/inversapanel/backup/restore/' + v);
            }
            if (name === 'now') {
                B.busy = true;
                h.api('POST', '/api/inversapanel/backup/now', {}).then(function (res) {
                    if (!res || res.status !== 'ok') { B.error = T.applyFailed; }
                }, function () { B.error = T.applyFailed; }).then(function () { B.busy = false; return load(); }).then(function () { h.redraw('main'); });
                return 'main';
            }
            return null;
        }
    });
})();
