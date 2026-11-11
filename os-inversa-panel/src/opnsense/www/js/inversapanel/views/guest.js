/*
 * SPDX-License-Identifier: BSD-2-Clause
 * Copyright (C) 2026 Inversa Bilişim
 *
 * Guest network: any network of kind "guest" (created under Network & Internet). This page
 * isolates it (access matrix) and limits its speed (traffic shaper); both are pending changes.
 */
(function () {
    'use strict';
    var h = window.InversaPanelApp.h;
    var ICON = 'M9 11a4 4 0 1 0 0-8a4 4 0 1 0 0 8zM2 21v-1a6 6 0 0 1 12 0v1M16 3.1a4 4 0 0 1 0 7.8M22 21v-1a6 6 0 0 0-4-5.7';

    var G = { nets: null };

    function load() {
        return h.api('GET', '/api/inversapanel/network/get').then(function (data) { G.nets = data.networks; });
    }

    function guestNets() {
        var kinds = h.S().draft.kinds;
        return (G.nets || []).filter(function (n) { return (kinds[n.key] || n.kind) === 'guest'; });
    }

    function isolated(key) {
        var acc = h.S().draft.access, ok = true;
        (G.nets || []).forEach(function (n) {
            if (n.key !== key && (acc[key + '>' + n.key] !== false || acc[n.key + '>' + key] !== false)) { ok = false; }
        });
        return ok;
    }

    window.InversaPanelApp.register({
        key: 'guest',
        icon: ICON,
        label: function (T) { return T.tabGuest; },
        load: load,
        render: function () {
            var T = h.T(), g = h.S().draft.guest;
            var html = '<div class="k-stack"><div><h1>' + h.esc(T.gTitle) + '</h1><div class="muted" style="font-size:14px;margin-top:4px">' + h.esc(T.gSub) + '</div></div>';
            if (!G.nets) { return html + '<div class="k-loading">…</div></div>'; }
            var nets = guestNets();
            if (!nets.length) {
                return html + '<section class="k-card"><div class="k-setting" style="padding:0;border:none;flex-wrap:wrap"><div class="k-ibox big">' + h.icon(ICON, 22) + '</div>' +
                    '<div class="k-setting-text"><b style="font-size:16px">' + h.esc(T.gNone) + '</b><span class="muted">' + h.esc(T.gNoneText) + '</span></div>' +
                    '<button type="button" class="k-btn primary" data-act="tab" data-v="net">' + h.esc(T.gCreate) + '</button></div></section></div>';
            }
            html += nets.map(function (n) {
                var guests = h.hosts().filter(function (x) { return x.network === n.name && x.online; });
                var iso = isolated(n.key);
                return '<section class="k-card"><div class="k-setting" style="padding:0;border:none;flex-wrap:wrap"><div class="k-ibox big on">' + h.icon(ICON, 22) + '</div>' +
                    '<div class="k-setting-text"><b style="font-size:16px">' + h.esc(n.name) + '</b><span class="muted mono">' +
                    h.esc((n.mode === 'vlan' ? 'VLAN ' + n.vlan + ' · ' : '') + n.ip + '/' + n.subnet + ' · ' + T.gGuestCount(guests.length)) + '</span></div></div>' +
                    '<div class="k-setting"><div class="k-setting-text"><b>' + h.esc(T.gIsolate) + '</b><span class="muted">' + h.esc(T.gIsolateSub) + '</span></div>' +
                    (iso ? '<span class="k-pill ok">' + h.icon(h.ICONS.ok, 14) + h.esc(T.gIsolated) + '</span>' :
                        '<button type="button" class="k-btn" data-act="guest:isolate" data-v="' + n.key + '">' + h.esc(T.gIsolateBtn) + '</button>') + '</div>' +
                    (guests.length ? '<div>' + guests.map(function (x) {
                        return '<div class="k-list-row"><span class="k-dot ok"></span><span class="k-grow-text">' + h.esc(h.devName(x)) + '</span><span class="mono muted">' + h.esc(x.ips[0] || '') + '</span></div>';
                    }).join('') + '</div>' : '') + '</section>';
            }).join('');
            html += '<section class="k-card"><div class="k-setting" style="padding:0;border:none"><div class="k-setting-text"><b>' + h.esc(T.gLimit) + '</b><span class="muted">' + h.esc(T.gLimitSub) + '</span></div>' +
                h.toggle(g.limit, 'data-act="guest:limit"', T.gLimit) + '</div>' +
                (g.limit ? '<div class="k-row">' + [['down', T.gDown, 1000], ['up', T.gUp, 1000]].map(function (o) {
                    return '<label class="k-field k-half"><span>' + h.esc(o[1]) + ' · <b>' + g[o[0]] + ' Mbit/s</b></span>' +
                        '<input type="range" min="1" max="' + o[2] + '" value="' + g[o[0]] + '" data-input="guest:' + o[0] + '"></label>';
                }).join('') + '</div>' : '') + '</section>';
            return html + '<div class="k-banner info" style="margin:0">' + h.icon(h.ICONS.info, 20) + '<span>' + h.esc(T.gWifi) + '</span></div></div>';
        },
        act: function (name, el) {
            var g = h.S().draft.guest, v = el.getAttribute('data-v');
            if (name === 'limit') { g.limit = !g.limit; return 'main'; }
            if (name === 'isolate') {
                var acc = h.S().draft.access;
                (G.nets || []).forEach(function (n) {
                    if (n.key !== v) { acc[v + '>' + n.key] = false; acc[n.key + '>' + v] = false; }
                });
                acc[v + '>wan'] = true;
                return 'main';
            }
            return null;
        },
        input: function (name, el, type) {
            if (name !== 'down' && name !== 'up') { return null; }
            h.S().draft.guest[name] = Number(el.value);
            var label = el.parentNode.querySelector('b');
            if (label) { label.textContent = el.value + ' Mbit/s'; }
            return type === 'change' ? 'main' : 'pending';
        },
        changes: function (add, d, s) {
            var T = h.T();
            if (!!d.guest.limit !== !!s.guest.limit) {
                add(T.gLimit, s.guest.limit ? T.on : T.off, d.guest.limit ? T.on : T.off, function () { d.guest.limit = s.guest.limit; });
            }
            ['down', 'up'].forEach(function (k) {
                if (d.guest.limit && Number(d.guest[k]) !== Number(s.guest[k])) {
                    add(T.gLimit + ' · ' + (k === 'down' ? T.gDown : T.gUp), s.guest[k] + ' Mbit/s', d.guest[k] + ' Mbit/s', function () { d.guest[k] = s.guest[k]; });
                }
            });
        }
    });
})();
