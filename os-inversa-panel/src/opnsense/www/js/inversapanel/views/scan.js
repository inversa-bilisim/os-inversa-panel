/*
 * SPDX-License-Identifier: BSD-2-Clause
 * Copyright (C) 2026 Inversa Bilişim
 *
 * Existing settings: what this firewall held before the panel, in three groups: what can get in
 * the way of a feature, what the panel works with as it is, what stays on OPNsense's own pages.
 * Only reads; the one thing it can do is take over the local DNS names made in OPNsense.
 */
(function () {
    'use strict';
    var h = window.InversaPanelApp.h;
    var GROUPS = ['warn', 'ok', 'stays'];
    var C = { findings: null, failed: false, busy: false };

    function load() {
        return h.api('GET', '/api/inversapanel/state/scan').then(function (data) {
            C.findings = (data && data.findings) || [];
            C.failed = false;
        }, function () { C.findings = []; C.failed = true; });
    }

    function row(f, T) {
        var text = (T.scanFindings || {})[f.id] || [f.id, ''];
        var names = (f.names || []).map(h.esc).join(', ');
        if (names && f.count > f.names.length) { names += ' … (+' + (f.count - f.names.length) + ')'; }
        var buttons = '';
        if (f.id === 'dns_names') {
            buttons += '<button type="button" class="k-btn" data-act="scan:adopt"' + (C.busy ? ' disabled' : '') + '>' + h.esc(T.scanAdopt) + '</button>';
        }
        if (f.page) {
            buttons += '<button type="button" class="k-btn" data-act="tab" data-v="' + h.esc(f.page) + '">' + h.esc(T.scanOpen) + '</button>';
        }
        return '<div class="k-setting k-scan-row"><div class="k-setting-text"><b>' + h.esc(text[0]) +
            (f.count > 1 || names ? ' <span class="k-count">' + h.esc(f.count) + '</span>' : '') + '</b>' +
            (names ? '<span class="mono small k-scan-names">' + names + '</span>' : '') +
            '<span class="muted">' + h.esc(text[1]) + '</span></div>' +
            (buttons ? '<div class="k-btns">' + buttons + '</div>' : '') + '</div>';
    }

    window.InversaPanelApp.register({
        key: 'scan',
        label: function (T) { return T.tabScan; },
        load: load,
        render: function () {
            var T = h.T(), list = C.findings;
            var html = '<div class="k-stack"><div><h1>' + h.esc(T.tabScan) + '</h1><div class="muted" style="font-size:14px;margin-top:4px">' + h.esc(T.scanSub) + '</div></div>';
            if (list === null) {
                return html + '<section class="k-card"><span class="muted">…</span></section></div>';
            }
            if (C.failed) {
                return html + '<section class="k-card"><span class="k-note warn">' + h.esc(T.scanFailed) + '</span></section></div>';
            }
            if (!list.length) {
                return html + '<section class="k-card"><span class="muted">' + h.esc(T.scanNone) + '</span></section></div>';
            }
            GROUPS.forEach(function (level) {
                var rows = list.filter(function (f) { return f.level === level; });
                if (!rows.length) { return; }
                html += '<section class="k-card k-scan ' + level + '"><div class="k-card-head"><h2>' + h.esc(T.scanGroups[level][0]) + '</h2></div>' +
                    '<div class="muted small">' + h.esc(T.scanGroups[level][1]) + '</div>' +
                    '<div>' + rows.map(function (f) { return row(f, T); }).join('') + '</div></section>';
            });
            return html + '<div class="muted small">' + h.esc(T.scanFoot) + '</div></div>';
        },
        act: function (name) {
            if (name === 'adopt' && !C.busy) {
                C.busy = true;
                h.api('POST', '/api/inversapanel/service/adoptdns', {}).then(function (res) {
                    if (!res || res.status !== 'ok') { throw res; }
                    h.notice('ok', h.T().scanAdopted(res.count));
                    return h.reloadState();
                }).catch(function () {
                    h.notice('err', h.T().applyFailed);
                }).then(function () { C.busy = false; return load(); }).then(function () { h.redraw('main'); });
                return 'main';
            }
            return null;
        }
    });
})();
