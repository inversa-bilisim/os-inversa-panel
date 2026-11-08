/*
 * SPDX-License-Identifier: BSD-2-Clause
 * Copyright (C) 2026 Inversa Bilişim
 *
 * VPN connections (WireGuard): any number of them, each on its own port and tunnel network.
 *  - remote access: devices with QR code / .conf (available any time), reachable internal
 *    networks chosen per connection, "all traffic" or "selected networks only"
 *  - site to site: one other gateway; chosen local networks <-> its networks; when Minnosh
 *    generated the other side's keys, its configuration is offered too
 * Everything acts immediately (like VPN > WireGuard); not part of the pending "Apply".
 */
(function () {
    'use strict';
    var h = window.MinnoshApp.h;
    var ICON = 'M5 11h14a1 1 0 0 1 1 1v8a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1v-8a1 1 0 0 1 1-1zM8 11V7a4 4 0 0 1 8 0v4';
    var LINK = 'M10 13a5 5 0 0 0 7.5.5l3-3a5 5 0 0 0-7-7l-1.7 1.7M14 11a5 5 0 0 0-7.5-.5l-3 3a5 5 0 0 0 7 7l1.7-1.7';
    var TRASH = 'M4 7h16M10 11v6M14 11v6M6 7l1 13a1 1 0 0 0 1 1h8a1 1 0 0 0 1-1l1-13M9 7V4h6v3';
    var DOWNLOAD = 'M12 3v12M7 10l5 5 5-5M4 20h16';
    var QR = 'M4 4h6v6H4zM14 4h6v6h-6zM4 14h6v6H4zM14 14h2v2h-2zM18 18h2v2h-2zM14 18h2';
    var COPY = 'M9 9h11v11H9zM5 15H4V4h11v1';
    var PLUS = 'M12 5v14M5 12h14';

    var V = { data: null, busy: false, error: null, form: null, edit: null, names: {}, qr: null };

    function T() { return h.T(); }

    function load() {
        return h.api('GET', '/api/minnosh/vpn/status').then(function (data) { V.data = data; });
    }

    function call(method, url, payload) {
        V.busy = true;
        V.error = null;
        h.redraw('main');
        return h.api(method, url, payload || {}).then(function (res) {
            if (res.status === 'failed') { V.error = res.message || T().applyFailed; }
            return load().then(function () { return res; });
        }, function (err) {
            V.error = (err && err.errorMessage) || T().applyFailed;
        }).then(function (res) {
            V.busy = false;
            h.redraw('main');
            return res;
        });
    }

    function label(c) {
        return c.name.replace(/^minnosh-?/, '') || (c.kind === 'site' ? T().vpnKindSite : T().vpnKindRemote);
    }

    function netName(key) {
        var n = (V.data.networks || []).filter(function (x) { return x.key === key; })[0];
        return n ? n.name : key.toUpperCase();
    }

    function ago(p) {
        var t = T();
        if (!p.enabled) { return t.vpnDisabled; }
        if (!p.handshake) { return t.vpnNever; }
        var age = V.data.now - p.handshake;
        return age < 180 ? t.vpnConnected : t.vpnLast(Math.round(age / 60));
    }

    function netChips(selected, act) {
        return '<div class="k-chips">' + (V.data.networks || []).map(function (n) {
            var on = selected.indexOf(n.key) >= 0;
            return '<button type="button" class="k-chip' + (on ? ' on' : '') + '" data-act="vpn:' + act + '" data-v="' + h.esc(n.key) + '" aria-pressed="' + on + '">' +
                h.esc(n.name) + ' <span class="muted mono small">' + h.esc(n.cidr) + '</span></button>';
        }).join('') + '</div>';
    }

    function copyBtn(text) {
        return '<button type="button" class="k-icon-btn" style="width:32px;height:32px;background:transparent" data-act="vpn:copy" data-v="' + h.esc(text) + '" aria-label="' + h.esc(T().copy) + '" title="' + h.esc(T().copy) + '">' + h.icon(COPY, 15) + '</button>';
    }

    function qrSvg(text) {
        /* OPNsense ships Kazuhiko Arase's qrcode.js (used by its own WireGuard peer generator) */
        if (typeof window.qrcode !== 'function') { return ''; }
        var code = window.qrcode(0, 'M');
        code.addData(text);
        code.make();
        return code.createSvgTag(4, 8);
    }

    function download(name, text) {
        var blob = new Blob([text], { type: 'text/plain' });
        var a = document.createElement('a');
        a.href = URL.createObjectURL(blob);
        a.download = String(name || 'minnosh').replace(/[^0-9A-Za-z._-]+/g, '-') + '.conf';
        document.body.appendChild(a);
        a.click();
        setTimeout(function () { URL.revokeObjectURL(a.href); a.remove(); }, 1000);
    }

    /* fetch a peer's configuration, then show it as QR (mode 'qr') or save it (mode 'file') */
    function withConfig(conn, peer, mode) {
        h.api('GET', '/api/minnosh/vpn/peerconfig/' + conn + '/' + peer).then(function (res) {
            if (res.status !== 'ok') { V.error = T().vpnNoKey; h.redraw('main'); return; }
            if (mode === 'file') { download(res.name, res.config); return; }
            V.qr = { name: res.name, config: res.config, site: !!res.site };
            h.redraw('main');
        }, function (err) { V.error = (err && err.errorMessage) || T().applyFailed; h.redraw('main'); });
    }

    /* ------------------------------------------------------------------ rendering */

    function formCard() {
        var t = T(), f = V.form;
        var html = '<section class="k-card k-edit"><div class="k-card-head"><h2>' + h.esc(t.vpnNew) + '</h2>' +
            '<button type="button" class="k-icon-btn" data-act="vpn:form-close" aria-label="' + h.esc(t.close) + '">' + h.icon(h.ICONS.close, 18) + '</button></div>' +
            '<div class="k-row">' + [['remote', t.vpnKindRemote, t.vpnKindRemoteDesc], ['site', t.vpnKindSite, t.vpnKindSiteDesc]].map(function (o) {
                return '<button type="button" class="k-opt' + (f.kind === o[0] ? ' on' : '') + '" data-act="vpn:form-kind" data-v="' + o[0] + '"><b>' + h.esc(o[1]) + '</b><span>' + h.esc(o[2]) + '</span></button>';
            }).join('') + '</div>' +
            '<div class="k-row"><label class="k-field" style="flex:1 1 240px"><span>' + h.esc(t.vpnName) + '</span><input type="text" maxlength="40" data-input="vpn:form-name" value="' + h.esc(f.name) + '"></label>' +
            '<label class="k-field"><span>' + h.esc(t.vpnPort) + '</span><input type="text" inputmode="numeric" class="mono" style="width:110px" data-input="vpn:form-port" value="' + h.esc(f.port) + '"></label></div>' +
            '<div class="k-field"><span>' + h.esc(f.kind === 'site' ? t.vpnSiteShare : t.vpnReach) + '</span>' + netChips(f.networks, 'form-net') + '</div>';
        if (f.kind === 'remote') {
            html += '<div class="k-field"><span>' + h.esc(t.vpnMode) + '</span><div class="k-row">' + [['split', t.modeSplit, t.modeSplitDesc], ['full', t.modeFull, t.modeFullDesc]].map(function (o) {
                return '<button type="button" class="k-opt' + (f.mode === o[0] ? ' on' : '') + '" data-act="vpn:form-mode" data-v="' + o[0] + '"><b>' + h.esc(o[1]) + '</b><span>' + h.esc(o[2]) + '</span></button>';
            }).join('') + '</div></div>' +
                '<label class="k-field"><span>' + h.esc(t.vpnEndpoint) + '</span><input type="text" class="mono" data-input="vpn:form-endpoint" value="' + h.esc(f.endpoint) + '" placeholder="' + h.esc(V.data.wan_address || 'ev.ornek-ddns.net') + '">' +
                '<span class="muted small">' + h.esc(t.vpnEndpointHint) + '</span></label>';
        } else {
            html += '<div class="k-row"><label class="k-field" style="flex:1 1 260px"><span>' + h.esc(t.vpnRemoteEndpoint) + '</span><input type="text" class="mono" data-input="vpn:form-remote_endpoint" value="' + h.esc(f.remote_endpoint) + '" placeholder="sube.ornek.com:51820"></label>' +
                '<label class="k-field" style="flex:1 1 260px"><span>' + h.esc(t.vpnRemoteNets) + '</span><input type="text" class="mono" data-input="vpn:form-remote_networks" value="' + h.esc(f.remote_networks) + '" placeholder="192.168.50.0/24, 10.20.0.0/16"></label></div>' +
                '<label class="k-field"><span>' + h.esc(t.vpnRemoteKey) + '</span><input type="text" class="mono" data-input="vpn:form-remote_pubkey" value="' + h.esc(f.remote_pubkey) + '" placeholder="' + h.esc(t.vpnRemoteKeyPh) + '" autocomplete="off" spellcheck="false">' +
                '<span class="muted small">' + h.esc(t.vpnRemoteKeyHint) + '</span></label>';
        }
        var ok = f.name.trim() && (f.kind === 'remote' || f.remote_networks.trim()) && f.networks.length;
        return html + '<div class="k-row" style="justify-content:flex-end"><button type="button" class="k-btn primary" data-act="vpn:form-create"' + (ok && !V.busy ? '' : ' disabled') + '>' + h.esc(V.busy ? t.applying : t.vpnCreate) + '</button></div></section>';
    }

    function editPanel(c) {
        var t = T(), e = V.edit;
        var html = '<div class="k-vpn-edit"><div class="k-field"><span>' + h.esc(c.kind === 'site' ? t.vpnSiteShare : t.vpnReach) + '</span>' + netChips(e.networks, 'edit-net') + '</div>';
        if (c.kind === 'remote') {
            html += '<div class="k-field"><span>' + h.esc(t.vpnMode) + '</span><div class="k-seg">' + [['split', t.modeSplit], ['full', t.modeFull]].map(function (o) {
                return '<button type="button" class="' + (e.mode === o[0] ? 'on' : '') + '" data-act="vpn:edit-mode" data-v="' + o[0] + '">' + h.esc(o[1]) + '</button>';
            }).join('') + '</div><span class="muted small">' + h.esc(t.vpnModeHint) + '</span></div>' +
                '<label class="k-field"><span>' + h.esc(t.vpnEndpoint) + '</span><input type="text" class="mono" data-input="vpn:edit-endpoint" value="' + h.esc(e.endpoint) + '" placeholder="' + h.esc(V.data.wan_address) + '"></label>';
        } else {
            html += '<div class="k-row"><label class="k-field" style="flex:1 1 260px"><span>' + h.esc(t.vpnRemoteEndpoint) + '</span><input type="text" class="mono" data-input="vpn:edit-remote_endpoint" value="' + h.esc(e.remote_endpoint) + '"></label>' +
                '<label class="k-field" style="flex:1 1 260px"><span>' + h.esc(t.vpnRemoteNets) + '</span><input type="text" class="mono" data-input="vpn:edit-remote_networks" value="' + h.esc(e.remote_networks) + '"></label></div>';
        }
        return html + '<div class="k-row" style="justify-content:flex-end"><button type="button" class="k-btn" data-act="vpn:edit-close">' + h.esc(t.discard) + '</button>' +
            '<button type="button" class="k-btn primary" data-act="vpn:edit-save" data-v="' + c.uuid + '"' + (V.busy || !e.networks.length ? ' disabled' : '') + '>' + h.esc(t.save) + '</button></div></div>';
    }

    function devices(c) {
        var t = T();
        var html = c.peers.length ? c.peers.map(function (p) {
            var live = p.enabled && p.handshake && V.data.now - p.handshake < 180;
            return '<div class="k-list-row"><span class="k-dot' + (live ? ' ok' : '') + '"></span><div class="k-grow-text"><b>' + h.esc(p.name) + '</b>' +
                '<div class="muted">' + h.esc(p.address + ' · ' + ago(p)) + '</div></div>' +
                (p.has_config
                    ? '<button type="button" class="k-btn small" data-act="vpn:qr" data-c="' + c.uuid + '" data-v="' + p.uuid + '">' + h.icon(QR, 15) + 'QR</button>' +
                      '<button type="button" class="k-btn small" data-act="vpn:file" data-c="' + c.uuid + '" data-v="' + p.uuid + '">' + h.icon(DOWNLOAD, 15) + '.conf</button>'
                    : '<button type="button" class="k-btn small" data-act="vpn:renew" data-c="' + c.uuid + '" data-v="' + p.uuid + '" title="' + h.esc(t.vpnRenewHint) + '"' + (V.busy ? ' disabled' : '') + '>' + h.esc(t.vpnRenew) + '</button>') +
                '<button type="button" class="k-icon-btn" style="background:transparent" data-act="vpn:peer-del" data-c="' + c.uuid + '" data-v="' + p.uuid + '"' + (V.busy ? ' disabled' : '') + ' aria-label="' + h.esc(t.vpnRemove(p.name)) + '">' + h.icon(TRASH, 18) + '</button>' +
                h.toggle(p.enabled, 'data-act="vpn:peer-toggle" data-c="' + c.uuid + '" data-v="' + p.uuid + '"' + (V.busy ? ' disabled' : ''), p.name) + '</div>';
        }).join('') : '<div class="muted">' + h.esc(t.vpnNoPeers) + '</div>';
        var name = V.names[c.uuid] || '';
        return html + '<div class="k-addrow"><input type="text" maxlength="40" data-input="vpn:peer-name" data-c="' + c.uuid + '" value="' + h.esc(name) + '" placeholder="' + h.esc(t.vpnAddPh) + '" aria-label="' + h.esc(t.vpnAddPh) + '">' +
            '<button type="button" class="k-btn primary" data-act="vpn:peer-add" data-c="' + c.uuid + '"' + (V.busy || !name.trim() ? ' disabled' : '') + '>' + h.icon(PLUS, 16) + h.esc(t.vpnAdd) + '</button></div>';
    }

    function siteInfo(c) {
        var t = T(), p = c.peers[0] || {};
        var live = p.enabled && p.handshake && V.data.now - p.handshake < 180;
        var html = '<div class="k-row">' +
            '<div class="k-info-box" style="flex:1 1 320px"><b>' + h.esc(t.vpnThisSide) + '</b>' +
            '<div class="k-kv"><span class="muted">' + h.esc(t.vpnPubKey) + '</span><span class="mono small">' + h.esc(c.pubkey) + copyBtn(c.pubkey) + '</span></div>' +
            '<div class="k-kv"><span class="muted">' + h.esc(t.vpnAddr) + '</span><span class="mono">' + h.esc(c.address) + copyBtn(c.address) + '</span></div>' +
            '<div class="k-kv"><span class="muted">' + h.esc(t.vpnTunnelIp) + '</span><span class="mono">' + h.esc(c.tunnel) + '</span></div>' +
            '<div class="k-kv"><span class="muted">' + h.esc(t.vpnSiteShare) + '</span><span>' + h.esc(c.networks.map(netName).join(', ') || '—') + '</span></div></div>' +
            '<div class="k-info-box" style="flex:1 1 320px"><b>' + h.esc(t.vpnOtherSide) + '</b>' +
            '<div class="k-kv"><span class="muted">' + h.esc(t.colSeen) + '</span><span><span class="k-dot' + (live ? ' ok' : '') + '"></span> ' + h.esc(ago(p)) + '</span></div>' +
            '<div class="k-kv"><span class="muted">' + h.esc(t.vpnRemoteEndpoint) + '</span><span class="mono">' + h.esc(p.endpoint || t.vpnWaitsForThem) + '</span></div>' +
            '<div class="k-kv"><span class="muted">' + h.esc(t.vpnRemoteNets) + '</span><span class="mono">' + h.esc(c.remote_networks.join(', ')) + '</span></div>' +
            '<div class="k-kv"><span class="muted">' + h.esc(t.vpnPubKey) + '</span><span class="mono small">' + h.esc(p.pubkey || '') + '</span></div></div></div>';
        if (p.has_config) {
            html += '<div class="k-row" style="align-items:center"><span class="muted">' + h.esc(t.vpnOtherConf) + '</span>' +
                '<button type="button" class="k-btn small" data-act="vpn:qr" data-c="' + c.uuid + '" data-v="' + p.uuid + '">' + h.icon(QR, 15) + 'QR</button>' +
                '<button type="button" class="k-btn small" data-act="vpn:file" data-c="' + c.uuid + '" data-v="' + p.uuid + '">' + h.icon(DOWNLOAD, 15) + '.conf</button></div>';
        }
        return html;
    }

    function connCard(c) {
        var t = T(), editing = V.edit && V.edit.uuid === c.uuid;
        var summary = c.kind === 'site'
            ? t.vpnKindSite + ' · ' + c.networks.map(netName).join(', ') + ' ⇄ ' + c.remote_networks.join(', ')
            : t.vpnKindRemote + ' · ' + (c.mode === 'full' ? t.modeFull : c.networks.map(netName).join(', ')) + ' · ' + t.vpnDevCount(c.peers.length);
        return '<section class="k-card' + (c.enabled ? '' : ' dim') + '"><div class="k-setting" style="padding:0;border:none;flex-wrap:wrap">' +
            '<div class="k-ibox big' + (c.enabled ? ' on' : '') + '">' + h.icon(c.kind === 'site' ? LINK : ICON, 22) + '</div>' +
            '<div class="k-setting-text"><b style="font-size:16px">' + h.esc(label(c)) + '</b><span class="muted">' + h.esc(summary) + '</span>' +
            '<span class="muted mono small">UDP ' + h.esc(c.port) + ' · ' + h.esc(c.tunnel) + '</span></div>' +
            '<button type="button" class="k-btn small" data-act="vpn:edit" data-v="' + c.uuid + '">' + h.esc(editing ? t.close : t.netEdit) + '</button>' +
            '<button type="button" class="k-icon-btn" style="background:transparent" data-act="vpn:del" data-v="' + c.uuid + '"' + (V.busy ? ' disabled' : '') + ' aria-label="' + h.esc(t.vpnDelete) + '">' + h.icon(TRASH, 18) + '</button>' +
            h.toggle(c.enabled, 'data-act="vpn:enable" data-v="' + c.uuid + '"' + (V.busy ? ' disabled' : ''), label(c)) + '</div>' +
            (editing ? editPanel(c) : '') +
            (c.kind === 'site' ? siteInfo(c) : devices(c)) + '</section>';
    }

    function qrDialog() {
        var t = T(), q = V.qr;
        return '<div class="k-modal" role="dialog" aria-modal="true" aria-label="' + h.esc(t.qrTitle(q.name)) + '"><div class="k-modal-card">' +
            '<div class="k-card-head"><h2>' + h.esc(t.qrTitle(q.name)) + '</h2>' +
            '<button type="button" class="k-icon-btn" data-act="vpn:qr-close" aria-label="' + h.esc(t.close) + '">' + h.icon(h.ICONS.close, 18) + '</button></div>' +
            '<div class="k-qr">' + qrSvg(q.config) + '</div>' +
            '<ol class="k-steps"><li>' + h.esc(t.qrStep1) + '</li><li>' + h.esc(t.qrStep2) + '</li><li>' + h.esc(t.qrStep3) + '</li></ol>' +
            '<button type="button" class="k-btn" data-act="vpn:qr-file">' + h.icon(DOWNLOAD, 16) + h.esc(t.qrDownload) + '</button>' +
            '<div class="muted small">' + h.esc(t.qrSecret) + '</div></div></div>';
    }

    window.MinnoshApp.register({
        key: 'vpn',
        icon: ICON,
        label: function (t) { return t.tabVpn; },
        load: load,
        render: function () {
            var t = T(), d = V.data;
            var html = '<div class="k-stack"><div class="k-row" style="justify-content:space-between;align-items:flex-end">' +
                '<div><h1>' + h.esc(t.vpnTitle) + '</h1><div class="muted" style="font-size:14px;margin-top:4px">' + h.esc(t.vpnSub) + '</div></div>' +
                (d && d.available && !V.form ? '<button type="button" class="k-btn primary" data-act="vpn:form-open">' + h.icon(PLUS, 18) + h.esc(t.vpnNew) + '</button>' : '') + '</div>';
            if (!d) { return html + '<div class="k-loading">…</div></div>'; }
            if (!d.available) { return html + '<div class="k-banner warn" style="margin:0">' + h.esc(t.vpnUnavailable) + '</div></div>'; }
            if (V.error) { html += '<div class="k-banner err" style="margin:0">' + h.icon(h.ICONS.warn, 20) + '<span style="white-space:pre-line">' + h.esc(V.error) + '</span></div>'; }
            if (V.form) { html += formCard(); }
            html += d.connections.length ? d.connections.map(connCard).join('') : (V.form ? '' : '<div class="k-card k-empty" style="border-style:dashed">' + h.esc(t.vpnNone) + '</div>');
            if (d.other_instances.length) {
                html += '<div class="muted small">' + h.esc(t.vpnOthers(d.other_instances.map(function (o) { return o.name + ' (UDP ' + o.port + ')'; }).join(', '))) + '</div>';
            }
            html += '<div class="k-banner info" style="margin:0">' + h.icon(h.ICONS.info, 20) + '<span>' + h.esc(t.vpnBehindModem) + '</span></div>';
            if (V.qr) { html += qrDialog(); }
            return html + '</div>';
        },
        act: function (name, el) {
            var v = el.getAttribute('data-v'), c = el.getAttribute('data-c'), f = V.form, e = V.edit, d = V.data;
            var conn = function (uuid) { return d.connections.filter(function (x) { return x.uuid === uuid; })[0]; };
            switch (name) {
                case 'form-open':
                    V.form = { kind: 'remote', name: '', port: String(d.next_port), networks: (d.networks[0] ? [d.networks[0].key] : []), mode: 'split',
                        endpoint: '', remote_endpoint: '', remote_networks: '', remote_pubkey: '' };
                    return 'main';
                case 'form-close': V.form = null; return 'main';
                case 'form-kind': f.kind = v; return 'main';
                case 'form-net': f.networks = h.toggleInList(f.networks, v); return 'main';
                case 'form-mode': f.mode = v; return 'main';
                case 'form-create':
                    call('POST', '/api/minnosh/vpn/create', {
                        kind: f.kind, name: f.name, port: f.port, networks: f.networks, mode: f.mode, endpoint: f.endpoint,
                        remote_endpoint: f.remote_endpoint, remote_pubkey: f.remote_pubkey,
                        remote_networks: f.remote_networks.split(/[\s,]+/).filter(Boolean)
                    }).then(function (res) { if (res && res.status === 'ok') { V.form = null; h.redraw('main'); } });
                    return null;
                case 'enable': call('POST', '/api/minnosh/vpn/update/' + v, { enabled: !conn(v).enabled }); return null;
                case 'del':
                    if (window.confirm(T().vpnDelConfirmConn(label(conn(v))))) { call('POST', '/api/minnosh/vpn/delete/' + v); }
                    return null;
                case 'edit':
                    var x = conn(v);
                    V.edit = V.edit && V.edit.uuid === v ? null : { uuid: v, networks: x.networks.slice(), mode: x.mode, endpoint: x.endpoint,
                        remote_endpoint: (x.peers[0] || {}).endpoint || '', remote_networks: x.remote_networks.join(', ') };
                    return 'main';
                case 'edit-close': V.edit = null; return 'main';
                case 'edit-net': e.networks = h.toggleInList(e.networks, v); return 'main';
                case 'edit-mode': e.mode = v; return 'main';
                case 'edit-save':
                    var payload = { networks: e.networks, mode: e.mode, endpoint: e.endpoint };
                    if (conn(v).kind === 'site') {
                        payload.remote_endpoint = e.remote_endpoint;
                        payload.remote_networks = e.remote_networks.split(/[\s,]+/).filter(Boolean);
                    }
                    call('POST', '/api/minnosh/vpn/update/' + v, payload).then(function (res) { if (res && res.status === 'ok') { V.edit = null; h.redraw('main'); } });
                    return null;
                case 'peer-add':
                    call('POST', '/api/minnosh/vpn/peeradd/' + c, { name: V.names[c] }).then(function (res) {
                        if (res && res.status === 'ok') { V.names[c] = ''; V.qr = { name: res.name, config: res.config }; h.redraw('main'); }
                    });
                    return null;
                case 'peer-toggle':
                    var peer = conn(c).peers.filter(function (p) { return p.uuid === v; })[0];
                    call('POST', '/api/minnosh/vpn/peertoggle/' + c + '/' + v, { enabled: !peer.enabled });
                    return null;
                case 'peer-del':
                    if (window.confirm(T().vpnDelConfirm)) { call('POST', '/api/minnosh/vpn/peerdel/' + c + '/' + v); }
                    return null;
                case 'renew':
                    if (window.confirm(T().vpnRenewConfirm)) {
                        call('POST', '/api/minnosh/vpn/peerrenew/' + c + '/' + v).then(function (res) {
                            if (res && res.status === 'ok') { V.qr = { name: res.name, config: res.config }; h.redraw('main'); }
                        });
                    }
                    return null;
                case 'qr': withConfig(c, v, 'qr'); return null;
                case 'file': withConfig(c, v, 'file'); return null;
                case 'qr-close': V.qr = null; return 'main';
                case 'qr-file': download(V.qr.name, V.qr.config); return null;
                case 'copy':
                    if (navigator.clipboard) { navigator.clipboard.writeText(v); }
                    return null;
            }
            return null;
        },
        input: function (name, el, type) {
            var val = el.value;
            if (name === 'peer-name') {
                var cid = el.getAttribute('data-c');
                V.names[cid] = val;
                var btn = el.parentNode.querySelector('button');
                if (btn) { btn.disabled = V.busy || !val.trim(); }
                return null;
            }
            if (name.indexOf('form-') === 0 && V.form) {
                V.form[name.slice(5)] = name === 'form-port' ? val.replace(/[^0-9]/g, '') : val;
                return type === 'change' ? 'main' : null;
            }
            if (name.indexOf('edit-') === 0 && V.edit) {
                V.edit[name.slice(5)] = val;
                return type === 'change' ? 'main' : null;
            }
            return null;
        }
    });
})();
