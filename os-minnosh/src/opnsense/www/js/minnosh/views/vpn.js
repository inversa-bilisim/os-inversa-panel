/*
 * SPDX-License-Identifier: BSD-2-Clause
 * Copyright (C) 2026 Inversa Bilişim
 *
 * Remote access with WireGuard. Switching the VPN and adding/removing devices act immediately;
 * a new device's configuration (with its private key) is shown once, as QR code and file.
 * Mode and connection address are pending changes ("Apply").
 */
(function () {
    'use strict';
    var h = window.MinnoshApp.h;
    var ICON = 'M5 11h14a1 1 0 0 1 1 1v8a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1v-8a1 1 0 0 1 1-1zM8 11V7a4 4 0 0 1 8 0v4';
    var TRASH = 'M4 7h16M10 11v6M14 11v6M6 7l1 13a1 1 0 0 0 1 1h8a1 1 0 0 0 1-1l1-13M9 7V4h6v3';
    var DOWNLOAD = 'M12 3v12M7 10l5 5 5-5M4 20h16';

    var V = { data: null, busy: false, error: null, name: '', created: null };

    function load() {
        return h.api('GET', '/api/minnosh/vpn/status').then(function (data) { V.data = data; });
    }

    function call(url, payload) {
        V.busy = true;
        V.error = null;
        h.redraw('main');
        return h.api('POST', url, payload || {}).then(function (res) {
            if (res.status !== 'ok') { V.error = res.message || h.T().applyFailed; }
            return load().then(function () { return res; });
        }, function (err) {
            V.error = (err && err.errorMessage) || h.T().applyFailed;
        }).then(function (res) {
            V.busy = false;
            h.redraw('main');
            return res;
        });
    }

    function qr(text) {
        /* OPNsense ships Kazuhiko Arase's qrcode.js (used by its own WireGuard peer generator) */
        if (typeof window.qrcode !== 'function') { return ''; }
        var code = window.qrcode(0, 'M');
        code.addData(text);
        code.make();
        return code.createSvgTag(4, 8);
    }

    function lastSeen(p) {
        var T = h.T();
        if (!p.enabled) { return T.vpnDisabled; }
        if (!p.handshake) { return T.vpnNever; }
        var age = V.data.now - p.handshake;
        return age < 180 ? T.vpnConnected : T.vpnLast(Math.round(age / 60));
    }

    window.MinnoshApp.register({
        key: 'vpn',
        icon: ICON,
        label: function (T) { return T.tabVpn; },
        load: load,
        render: function () {
            var T = h.T(), d = V.data, pref = h.S().draft.vpn;
            var html = '<div class="k-stack"><div><h1>' + h.esc(T.vpnTitle) + '</h1><div class="muted" style="font-size:14px;margin-top:4px">' + h.esc(T.vpnSub) + '</div></div>';
            if (!d) { return html + '<div class="k-loading">…</div></div>'; }
            if (!d.available) { return html + '<div class="k-banner warn" style="margin:0">' + h.esc(T.vpnUnavailable) + '</div></div>'; }
            if (V.error) { html += '<div class="k-banner err" style="margin:0">' + h.icon(h.ICONS.warn, 20) + '<span>' + h.esc(V.error) + '</span></div>'; }

            html += '<div class="k-row"><div class="k-grow k-stack">';
            html += '<section class="k-card"><div class="k-setting" style="padding:0;border:none">' +
                '<div class="k-ibox big' + (d.enabled ? ' on' : '') + '">' + h.icon(ICON, 22) + '</div>' +
                '<div class="k-setting-text"><b style="font-size:16px">' + h.esc(T.vpnServer) + '</b><span class="muted">' + h.esc(d.enabled ? T.vpnOn : T.vpnOff) + '</span></div>' +
                h.toggle(d.enabled, 'data-act="vpn:enable"' + (V.busy ? ' disabled' : ''), T.vpnServer) + '</div>';
            if (d.enabled) {
                var endpoint = (pref.endpoint || d.wan_address || '?') + ':' + d.port;
                html += '<div class="k-row">' + [[T.vpnAddr, endpoint], [T.vpnNet, d.tunnel]].map(function (kv) {
                    return '<div class="k-info" style="flex:1 1 200px;flex-direction:column;align-items:flex-start"><span class="muted small">' + h.esc(kv[0]) + '</span><b class="mono">' + h.esc(kv[1]) + '</b></div>';
                }).join('') + '</div>' +
                    '<label class="k-field"><span>' + h.esc(T.vpnEndpoint) + '</span><input type="text" class="mono" data-input="vpn:endpoint" value="' + h.esc(pref.endpoint || '') + '" placeholder="' + h.esc(d.wan_address || 'ev.ornek-ddns.net') + '">' +
                    '<span class="muted">' + h.esc(T.vpnEndpointHint) + '</span></label>' +
                    '<div class="k-field"><span>' + h.esc(T.vpnMode) + '</span><div class="k-row">' + [['full', T.modeFull, T.modeFullDesc], ['split', T.modeSplit, T.modeSplitDesc]].map(function (o) {
                        return '<button type="button" class="k-opt' + (pref.mode === o[0] ? ' on' : '') + '" data-act="vpn:mode" data-v="' + o[0] + '"><b>' + h.esc(o[1]) + '</b><span>' + h.esc(o[2]) + '</span></button>';
                    }).join('') + '</div><span class="muted">' + h.esc(T.vpnModeHint) + '</span></div>';
            }
            if (d.other_instances.length) {
                html += '<div class="muted small">' + h.esc(T.vpnOthers(d.other_instances.map(function (o) { return o.name + ' (' + o.port + ')'; }).join(', '))) + '</div>';
            }
            html += '</section>';

            if (d.enabled) {
                html += '<section class="k-card"><h2>' + h.esc(T.vpnPeers) + '</h2>' + (d.peers.length ? d.peers.map(function (p) {
                    var live = p.enabled && p.handshake && d.now - p.handshake < 180;
                    return '<div class="k-list-row"><span class="k-dot' + (live ? ' ok' : '') + '"></span><div class="k-grow-text"><b>' + h.esc(p.name) + '</b>' +
                        '<div class="muted">' + h.esc(p.address + ' · ' + lastSeen(p)) + '</div></div>' +
                        '<button type="button" class="k-icon-btn" style="background:transparent" data-act="vpn:del" data-v="' + p.uuid + '"' + (V.busy ? ' disabled' : '') + ' aria-label="' + h.esc(T.vpnRemove(p.name)) + '">' + h.icon(TRASH, 18) + '</button>' +
                        h.toggle(p.enabled, 'data-act="vpn:peer" data-v="' + p.uuid + '"' + (V.busy ? ' disabled' : ''), p.name) + '</div>';
                }).join('') : '<div class="muted">' + h.esc(T.vpnNoPeers) + '</div>') +
                    '<div class="k-addrow"><input type="text" maxlength="40" data-input="vpn:name" value="' + h.esc(V.name) + '" placeholder="' + h.esc(T.vpnAddPh) + '" aria-label="' + h.esc(T.vpnAddPh) + '">' +
                    '<button type="button" class="k-btn primary" data-act="vpn:add"' + (V.busy || !V.name.trim() ? ' disabled' : '') + '>' + h.esc(T.vpnAdd) + '</button></div></section>';
            }
            html += '</div>';

            if (V.created) {
                html += '<aside class="k-card k-side" style="gap:16px"><div class="k-card-head"><h2>' + h.esc(T.qrTitle(V.created.name)) + '</h2>' +
                    '<button type="button" class="k-icon-btn" data-act="vpn:closeqr" aria-label="' + h.esc(T.close) + '">' + h.icon(h.ICONS.close, 18) + '</button></div>' +
                    '<div class="k-qr">' + qr(V.created.config) + '</div>' +
                    '<ol class="k-steps"><li>' + h.esc(T.qrStep1) + '</li><li>' + h.esc(T.qrStep2) + '</li><li>' + h.esc(T.qrStep3) + '</li></ol>' +
                    '<button type="button" class="k-btn" data-act="vpn:download">' + h.icon(DOWNLOAD, 16) + h.esc(T.qrDownload) + '</button>' +
                    '<div class="k-banner warn" style="margin:0">' + h.esc(T.qrOnce) + '</div></aside>';
            }
            return html + '</div></div>';
        },
        act: function (name, el) {
            var v = el.getAttribute('data-v'), pref = h.S().draft.vpn;
            switch (name) {
                case 'enable': call('/api/minnosh/vpn/enable', { enabled: !V.data.enabled }); return null;
                case 'mode': pref.mode = v; return 'main';
                case 'add':
                    call('/api/minnosh/vpn/add', { name: V.name.trim() }).then(function (res) {
                        if (res && res.status === 'ok') { V.created = { name: res.name, config: res.config }; V.name = ''; h.redraw('main'); }
                    });
                    return null;
                case 'peer':
                    var peer = V.data.peers.filter(function (p) { return p.uuid === v; })[0];
                    call('/api/minnosh/vpn/toggle/' + v, { enabled: !peer.enabled });
                    return null;
                case 'del':
                    if (window.confirm(h.T().vpnDelConfirm)) { call('/api/minnosh/vpn/del/' + v); }
                    return null;
                case 'closeqr': V.created = null; return 'main';
                case 'download':
                    var blob = new Blob([V.created.config], { type: 'text/plain' });
                    var a = document.createElement('a');
                    a.href = URL.createObjectURL(blob);
                    a.download = (V.created.name || 'minnosh') + '.conf';
                    document.body.appendChild(a);
                    a.click();
                    setTimeout(function () { URL.revokeObjectURL(a.href); a.remove(); }, 1000);
                    return null;
            }
            return null;
        },
        input: function (name, el, type) {
            if (name === 'name') {
                V.name = el.value;
                var btn = el.parentNode.querySelector('button');
                if (btn) { btn.disabled = V.busy || !V.name.trim(); }
                return null;
            }
            if (name === 'endpoint') {
                h.S().draft.vpn.endpoint = el.value.trim();
                return type === 'change' ? 'main' : 'pending';
            }
            return null;
        },
        changes: function (add, d, s) {
            var T = h.T();
            if (d.vpn.mode !== s.vpn.mode) {
                var m = { full: T.modeFull, split: T.modeSplit };
                add(T.tabVpn + ' · ' + T.vpnMode, m[s.vpn.mode], m[d.vpn.mode], function () { d.vpn.mode = s.vpn.mode; });
            }
            if ((d.vpn.endpoint || '') !== (s.vpn.endpoint || '')) {
                add(T.tabVpn + ' · ' + T.vpnEndpoint, s.vpn.endpoint || '—', d.vpn.endpoint || '—', function () { d.vpn.endpoint = s.vpn.endpoint; });
            }
        }
    });
})();
