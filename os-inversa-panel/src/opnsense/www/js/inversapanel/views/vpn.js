/*
 * SPDX-License-Identifier: BSD-2-Clause
 * Copyright (C) 2026 Inversa Bilişim
 *
 * VPN connections: any number of them. WireGuard ones each on their own port and tunnel network:
 *  - remote access: devices with QR code / .conf (available any time), reachable internal
 *    networks chosen per connection, "all traffic" or "selected networks only"
 *  - site to site: one other gateway; chosen local networks <-> its networks; when Inversa Panel
 *    generated the other side's keys, its configuration is offered too
 * IPsec (IKEv2, shared key) for site to site with a gateway that is not a WireGuard device: chosen
 * local networks <-> its networks, and the list of what to enter on the other side.
 * Everything acts immediately (like VPN > WireGuard); not part of the pending "Apply".
 */
(function () {
    'use strict';
    var h = window.InversaPanelApp.h;
    var ICON = 'M5 11h14a1 1 0 0 1 1 1v8a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1v-8a1 1 0 0 1 1-1zM8 11V7a4 4 0 0 1 8 0v4';
    var LINK = 'M10 13a5 5 0 0 0 7.5.5l3-3a5 5 0 0 0-7-7l-1.7 1.7M14 11a5 5 0 0 0-7.5-.5l-3 3a5 5 0 0 0 7 7l1.7-1.7';
    var TRASH = 'M4 7h16M10 11v6M14 11v6M6 7l1 13a1 1 0 0 0 1 1h8a1 1 0 0 0 1-1l1-13M9 7V4h6v3';
    var DOWNLOAD = 'M12 3v12M7 10l5 5 5-5M4 20h16';
    var QR = 'M4 4h6v6H4zM14 4h6v6h-6zM4 14h6v6H4zM14 14h2v2h-2zM18 18h2v2h-2zM14 18h2';
    var COPY = 'M9 9h11v11H9zM5 15H4V4h11v1';
    var PLUS = 'M12 5v14M5 12h14';
    var CHEV = 'M6 9l6 6 6-6';

    var V = { data: null, busy: false, error: null, form: null, edit: null, names: {}, qr: null, sheet: null, open: null };

    function T() { return h.T(); }

    function load() {
        return h.api('GET', '/api/inversapanel/vpn/status').then(function (data) { V.data = data; });
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
        return c.name.replace(/^inversapanel-?/, '') || (c.kind === 'site' ? T().vpnKindSite : T().vpnKindRemote);
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

    function download(name, text, ext) {
        var blob = new Blob([text], { type: 'text/plain' });
        var a = document.createElement('a');
        a.href = URL.createObjectURL(blob);
        a.download = String(name || 'inversapanel').replace(/[^0-9A-Za-z._-]+/g, '-') + (ext || '.conf');
        document.body.appendChild(a);
        a.click();
        setTimeout(function () { URL.revokeObjectURL(a.href); a.remove(); }, 1000);
    }

    /* fetch a peer's configuration, then show it as QR (mode 'qr') or save it (mode 'file') */
    function withConfig(conn, peer, mode) {
        h.api('GET', '/api/inversapanel/vpn/peerconfig/' + conn + '/' + peer).then(function (res) {
            if (res.status !== 'ok') { V.error = T().vpnNoKey; h.redraw('main'); return; }
            if (mode === 'file') { download(res.name, res.config); return; }
            V.qr = { name: res.name, config: res.config, site: !!res.site };
            h.redraw('main');
        }, function (err) { V.error = (err && err.errorMessage) || T().applyFailed; h.redraw('main'); });
    }

    /* ------------------------------------------------------------------ rendering */

    function modeSeg(mode, act) {
        var t = T();
        return '<div class="k-field" style="flex:none"><span>' + h.esc(t.vpnMode) + '</span><div class="k-seg">' + [['split', t.modeSplit], ['full', t.modeFull]].map(function (o) {
            return '<button type="button" class="' + (mode === o[0] ? 'on' : '') + '" data-act="vpn:' + act + '" data-v="' + o[0] + '">' + h.esc(o[1]) + '</button>';
        }).join('') + '</div></div>';
    }

    function modeHint(mode, networks) {
        var t = T();
        if (mode === 'full' && !networks.length) { return '<div class="k-banner info" style="margin:0">' + h.icon(h.ICONS.info, 18) + '<span>' + h.esc(t.vpnInternetOnlyHint) + '</span></div>'; }
        return '<div class="muted small">' + h.esc(mode === 'full' ? t.modeFullDesc + ' ' + t.vpnFullEmptyHint : t.modeSplitDesc) + '</div>';
    }

    function tunnelField(value, ph, act) {
        var t = T();
        return '<label class="k-field" style="flex:0 0 170px"><span>' + h.esc(t.vpnTunnel) + '</span><input type="text" class="mono" data-input="vpn:' + act + '" value="' + h.esc(value) + '" placeholder="' + h.esc(ph) + '" title="' + h.esc(t.vpnTunnelHint) + '" autocomplete="off" spellcheck="false"></label>';
    }

    function valid(kind, mode, networks, remoteNets) {
        return kind === 'site' ? networks.length && remoteNets.trim() : (networks.length || mode === 'full');
    }

    function isIpsec(x) {
        return x.kind === 'site' && x.type === 'ipsec';
    }

    /* what to enter on the other side of an IPsec connection, as text to read, copy or save */
    function showSheet(uuid) {
        h.api('GET', '/api/inversapanel/vpn/ipsecconfig/' + uuid).then(function (res) {
            if (res.status !== 'ok') { V.error = T().applyFailed; h.redraw('main'); return; }
            V.sheet = { name: res.name.replace(/^inversapanel-?/, ''), text: T().ipcText(res) };
            h.redraw('main');
        }, function (err) { V.error = (err && err.errorMessage) || T().applyFailed; h.redraw('main'); });
    }

    /* the same for a WireGuard site to site connection, from what the status already holds */
    function showWgSheet(c) {
        var p = c.peers[0] || {};
        var nets = (V.data.networks || []).filter(function (n) { return c.networks.indexOf(n.key) >= 0; }).map(function (n) { return n.cidr; });
        V.sheet = { name: label(c), text: T().wgText({ name: label(c), pubkey: c.pubkey, address: c.address, tunnel: c.tunnel, networks: nets, remote_networks: c.remote_networks, remote_pubkey: p.pubkey || '' }),
            conn: p.has_config ? c.uuid : null, peer: p.has_config ? p.uuid : null };
    }

    function sheetDialog() {
        var t = T(), s = V.sheet;
        return '<div class="k-modal" role="dialog" aria-modal="true" aria-label="' + h.esc(t.ipcSheet) + '"><div class="k-modal-card" style="max-width:560px">' +
            '<div class="k-card-head"><h2>' + h.esc(t.ipcSheet) + '</h2>' +
            '<button type="button" class="k-icon-btn" data-act="vpn:sheet-close" aria-label="' + h.esc(t.close) + '">' + h.icon(h.ICONS.close, 18) + '</button></div>' +
            '<pre class="k-sheet">' + h.esc(s.text) + '</pre>' +
            '<div class="k-btns"><button type="button" class="k-btn" data-act="vpn:copy" data-v="' + h.esc(s.text) + '">' + h.icon(COPY, 16) + h.esc(t.copy) + '</button>' +
            '<button type="button" class="k-btn" data-act="vpn:sheet-file">' + h.icon(DOWNLOAD, 16) + h.esc(t.ipcDownload) + '</button>' +
            (s.peer ? '<button type="button" class="k-btn" data-act="vpn:qr" data-c="' + s.conn + '" data-v="' + s.peer + '">' + h.icon(QR, 16) + 'QR</button>' +
                '<button type="button" class="k-btn" data-act="vpn:file" data-c="' + s.conn + '" data-v="' + s.peer + '">' + h.icon(DOWNLOAD, 16) + '.conf</button>' : '') + '</div>' +
            '<div class="muted small">' + h.esc(s.peer ? t.wgSecret : t.ipcSecret) + '</div></div></div>';
    }

    /* site to site over IPsec: the form fields that replace port, tunnel block and public key */
    function ipsecFields(f, pfx, btn) {
        var t = T();
        return '<div class="k-row" style="align-items:flex-end"><label class="k-field" style="flex:1 1 240px"><span>' + h.esc(t.vpnRemoteEndpoint) + '</span><input type="text" class="mono" data-input="vpn:' + pfx + '-remote_endpoint" value="' + h.esc(f.remote_endpoint) + '" placeholder="203.0.113.10" autocomplete="off" spellcheck="false"></label>' +
            '<label class="k-field" style="flex:1 1 240px"><span>' + h.esc(t.vpnRemoteNets) + '</span><input type="text" class="mono" data-input="vpn:' + pfx + '-remote_networks" value="' + h.esc(f.remote_networks) + '" placeholder="192.168.50.0/24"></label></div>' +
            '<div class="k-row" style="align-items:flex-end"><label class="k-field" style="flex:1 1 240px"><span>' + h.esc(t.ipcKey) + '</span><input type="text" class="mono" data-input="vpn:' + pfx + '-psk" value="' + h.esc(f.psk || '') + '" placeholder="' + h.esc(pfx === 'form' ? t.ipcKeyPh : t.ipcKeyKeep) + '" title="' + h.esc(t.ipcKeyHint) + '" autocomplete="off" spellcheck="false"></label>' +
            '<label class="k-field" style="flex:1 1 240px"><span>' + h.esc(t.ipcOurs) + '</span><input type="text" class="mono" data-input="vpn:' + pfx + '-endpoint" value="' + h.esc(f.endpoint) + '" placeholder="' + h.esc(V.data.wan_address || '') + '" title="' + h.esc(t.ipcOursHint) + '" autocomplete="off" spellcheck="false"></label>' + btn + '</div>' +
            '<div class="muted small">' + h.esc(t.ipcHint) + '</div>';
    }

    function field(label, name, value, placeholder, grow, hint) {
        return '<label class="k-nf' + (grow ? ' k-pfgrow' : '') + '"><span class="k-nl">' + h.esc(label) + '</span><input type="text"' + (name === 'name' ? ' maxlength="40"' : ' class="mono"') +
            ' data-input="vpn:form-' + name + '" value="' + h.esc(value) + '" placeholder="' + h.esc(placeholder || '') + '"' + (hint ? ' title="' + h.esc(hint) + '"' : '') +
            (grow ? '' : ' style="width:150px"') + ' autocomplete="off" spellcheck="false"></label>';
    }

    /* a new connection in two steps: what kind, then only what that kind needs; the rest under "Advanced" */
    function formCard() {
        var t = T(), f = V.form, d = V.data;
        var kinds = [['remote', 'wireguard', t.vpnKindRemote, t.vpnKindRemoteDesc], ['site', 'wireguard', t.vpnKindSite + ' · WireGuard', t.ipcProtoWg]]
            .concat(d.ipsec_available ? [['site', 'ipsec', t.vpnKindSite + ' · IPsec', t.ipcProtoIpsec]] : []);
        var head = function (title, step) {
            return '<div class="k-card-head"><h2>' + h.esc(title) + '</h2><span class="k-vsteps">' + (step === 1 ? '<b>1 ' + h.esc(t.vpnStepKind) + '</b> › 2 ' + h.esc(t.vpnStepSet) : '1 ' + h.esc(t.vpnStepKind) + ' › <b>2 ' + h.esc(t.vpnStepSet) + '</b>') +
                '</span><button type="button" class="k-icon-btn" style="width:34px;height:34px" data-act="vpn:form-close" aria-label="' + h.esc(t.close) + '">' + h.icon(h.ICONS.close, 16) + '</button></div>';
        };
        if (f.step === 1) {
            return '<section class="k-card k-nform k-edit">' + head(t.vpnNew, 1) + '<div class="k-row">' + kinds.map(function (k) {
                return '<button type="button" class="k-opt" style="min-height:0" data-act="vpn:form-pick" data-v="' + k[0] + '" data-t="' + k[1] + '"><b>' + h.esc(k[2]) + '</b><span>' + h.esc(k[3]) + '</span></button>';
            }).join('') + '</div></section>';
        }
        var ipsec = isIpsec(f), site = f.kind === 'site';
        var title = site ? t.vpnKindSite + ' · ' + (ipsec ? 'IPsec' : 'WireGuard') : t.vpnKindRemote;
        var ok = f.name.trim() && valid(f.kind, f.mode, f.networks, f.remote_networks) && (!ipsec || f.remote_endpoint.trim()) && !V.busy;
        var html = '<section class="k-card k-nform k-edit">' + head(title, 2) +
            '<div class="k-pfline">' + field(t.vpnName, 'name', f.name, '', true) +
            (site ? field(t.vpnRemoteEndpoint, 'remote_endpoint', f.remote_endpoint, ipsec ? '203.0.113.10' : 'sube.ornek.com:51820', true) +
                field(t.vpnRemoteNets, 'remote_networks', f.remote_networks, '192.168.50.0/24', true) : '') + '</div>' +
            '<div class="k-row" style="align-items:flex-start;gap:12px 32px"><div class="k-nf"><span class="k-nl">' + h.esc(site ? t.vpnSiteShare : t.vpnReach) + '</span>' + netChips(f.networks, 'form-net') + '</div>' +
            (site ? '' : modeSeg(f.mode, 'form-mode')) + '</div>' +
            (site ? '' : modeHint(f.mode, f.networks));
        if (f.adv) {
            html += '<div class="k-pfline">' + (ipsec ?
                field(t.ipcKey, 'psk', f.psk, t.ipcKeyPh, true, t.ipcKeyHint) + field(t.ipcOurs, 'endpoint', f.endpoint, d.wan_address || '', true, t.ipcOursHint) :
                field(t.vpnPort, 'port', f.port, '', false) + field(t.vpnTunnel, 'tunnel', f.tunnel, d.next_tunnel ? d.next_tunnel[f.kind] : '', false, t.vpnTunnelHint) +
                (site ? field(t.vpnRemoteKey, 'remote_pubkey', f.remote_pubkey, t.vpnRemoteKeyPh, true, t.vpnRemoteKeyHint) :
                    field(t.vpnEndpoint, 'endpoint', f.endpoint, d.wan_address || 'ev.ornek-ddns.net', true, t.vpnEndpointHint))) + '</div>';
        }
        return html + '<div class="k-nfoot"><button type="button" class="k-link k-vadv" data-act="vpn:form-adv" aria-expanded="' + !!f.adv + '">' +
            '<span class="k-vchev' + (f.adv ? ' open' : '') + '">' + h.icon(CHEV, 14) + '</span>' + h.esc(ipsec ? t.vpnAdvIpsec : (site ? t.vpnAdvSite : t.vpnAdvRemote)) + '</button>' +
            '<button type="button" class="k-btn" data-act="vpn:form-back">' + h.esc(t.vpnBack) + '</button>' +
            '<button type="button" class="k-btn primary" data-act="vpn:form-create"' + (ok ? '' : ' disabled') + '>' + h.esc(V.busy ? t.applying : t.vpnCreate) + '</button></div></section>';
    }

    function editPanel(c) {
        var t = T(), e = V.edit;
        var btns = '<div class="k-btns" style="margin-left:auto;display:flex;gap:8px"><button type="button" class="k-btn" data-act="vpn:edit-close">' + h.esc(t.discard) + '</button>' +
            '<button type="button" class="k-btn primary" data-act="vpn:edit-save" data-v="' + c.uuid + '"' + (V.busy || !valid(c.kind, e.mode, e.networks, c.kind === 'site' ? e.remote_networks : '') || (isIpsec(c) && !e.remote_endpoint.trim()) ? ' disabled' : '') + '>' + h.esc(t.save) + '</button></div>';
        var html = '<div class="k-vedit"><div class="k-row" style="align-items:flex-start;gap:12px 32px"><div class="k-nf"><span class="k-nl">' + h.esc(c.kind === 'site' ? t.vpnSiteShare : t.vpnReach) + '</span>' + netChips(e.networks, 'edit-net') + '</div>' +
            (c.kind === 'remote' ? modeSeg(e.mode, 'edit-mode') : '') + '</div>';
        if (isIpsec(c)) {
            return html + ipsecFields(e, 'edit', btns) + '</div>';
        }
        if (c.kind === 'remote') {
            html += modeHint(e.mode, e.networks) +
                '<div class="k-row" style="align-items:flex-end"><label class="k-field" style="flex:0 1 320px"><span>' + h.esc(t.vpnEndpoint) + '</span><input type="text" class="mono" data-input="vpn:edit-endpoint" value="' + h.esc(e.endpoint) + '" placeholder="' + h.esc(V.data.wan_address) + '"></label>' +
                tunnelField(e.tunnel, c.tunnel_net, 'edit-tunnel') + btns + '</div>';
        } else {
            html += '<div class="k-row" style="align-items:flex-end"><label class="k-field" style="flex:1 1 220px"><span>' + h.esc(t.vpnRemoteEndpoint) + '</span><input type="text" class="mono" data-input="vpn:edit-remote_endpoint" value="' + h.esc(e.remote_endpoint) + '"></label>' +
                '<label class="k-field" style="flex:1 1 220px"><span>' + h.esc(t.vpnRemoteNets) + '</span><input type="text" class="mono" data-input="vpn:edit-remote_networks" value="' + h.esc(e.remote_networks) + '"></label>' +
                tunnelField(e.tunnel, c.tunnel_net, 'edit-tunnel') + btns + '</div>';
        }
        return html + '<div class="muted small">' + h.esc(t.vpnModeHint) + '</div></div>';
    }

    function live(p) {
        return !!(p.enabled && p.handshake && V.data.now - p.handshake < 180);
    }

    /* whether the other end is there: [text, connected] */
    function state(c) {
        var t = T();
        if (!c.enabled) { return [t.vpnDisabled, false]; }
        if (isIpsec(c)) { return c.connected > 0 ? [t.vpnConnected, true] : [t.ipcDown, false]; }
        if (c.kind === 'site') { return live(c.peers[0] || {}) ? [t.vpnConnected, true] : [t.ipcDown, false]; }
        var n = c.peers.filter(live).length;
        return n ? [t.vpnLiveCount(n), true] : [t.vpnNoLive, false];
    }

    function meta(pairs, buttons) {
        return '<div class="k-vmeta">' + pairs.map(function (kv) {
            return '<span><span class="muted">' + h.esc(kv[0]) + '</span> <b' + (kv[2] ? ' class="mono"' : '') + '>' + h.esc(kv[1]) + '</b></span>';
        }).join('') + '<span class="k-vbtns">' + buttons + '</span></div>';
    }

    function bodyButtons(c, extra) {
        var t = T();
        return (extra || '') + '<button type="button" class="k-btn small" data-act="vpn:edit" data-v="' + c.uuid + '">' + h.esc(t.netEdit) + '</button>' +
            '<button type="button" class="k-btn small k-danger" style="margin:0" data-act="vpn:del" data-v="' + c.uuid + '"' + (V.busy ? ' disabled' : '') + '>' + h.esc(t.vpnDelete) + '</button>';
    }

    function devices(c) {
        var t = T(), name = V.names[c.uuid] || '';
        return (c.peers.length ? '<div style="overflow-x:auto"><table class="k-pftable"><thead><tr><th>' + h.esc(t.colDevice) + '</th><th>' + h.esc(t.netAddr) + '</th><th>' + h.esc(t.colSeen) + '</th><th></th></tr></thead><tbody>' +
            c.peers.map(function (p) {
                return '<tr class="' + (p.enabled ? '' : 'dim') + '"><td><b>' + h.esc(p.name) + '</b></td><td class="mono">' + h.esc(p.address.replace(/\/32$/, '')) + '</td>' +
                    '<td><span class="k-dot' + (live(p) ? ' ok' : '') + '"></span> ' + h.esc(ago(p)) + '</td><td><span class="k-pfacts">' +
                    (p.has_config
                        ? '<button type="button" class="k-btn small" data-act="vpn:qr" data-c="' + c.uuid + '" data-v="' + p.uuid + '">' + h.icon(QR, 14) + 'QR</button>' +
                          '<button type="button" class="k-btn small" data-act="vpn:file" data-c="' + c.uuid + '" data-v="' + p.uuid + '">' + h.icon(DOWNLOAD, 14) + '.conf</button>'
                        : '<button type="button" class="k-btn small" data-act="vpn:renew" data-c="' + c.uuid + '" data-v="' + p.uuid + '" title="' + h.esc(t.vpnRenewHint) + '"' + (V.busy ? ' disabled' : '') + '>' + h.esc(t.vpnRenew) + '</button>') +
                    '<button type="button" class="k-icon-btn" data-act="vpn:peer-del" data-c="' + c.uuid + '" data-v="' + p.uuid + '"' + (V.busy ? ' disabled' : '') + ' aria-label="' + h.esc(t.vpnRemove(p.name)) + '">' + h.icon(TRASH, 16) + '</button>' +
                    h.toggle(p.enabled, 'data-act="vpn:peer-toggle" data-c="' + c.uuid + '" data-v="' + p.uuid + '"' + (V.busy ? ' disabled' : ''), p.name) + '</span></td></tr>';
            }).join('') + '</tbody></table></div>' : '<div class="muted">' + h.esc(t.vpnNoPeers) + '</div>') +
            '<div class="k-addrow" style="max-width:480px"><input type="text" maxlength="40" data-input="vpn:peer-name" data-c="' + c.uuid + '" value="' + h.esc(name) + '" placeholder="' + h.esc(t.vpnAddPh) + '" aria-label="' + h.esc(t.vpnAddPh) + '">' +
            '<button type="button" class="k-btn primary" data-act="vpn:peer-add" data-c="' + c.uuid + '"' + (V.busy || !name.trim() ? ' disabled' : '') + '>' + h.icon(PLUS, 16) + h.esc(t.vpnAdd) + '</button></div>';
    }

    /* what shows below an opened connection */
    function body(c) {
        var t = T(), nets = c.networks.map(netName).join(', ') || '—';
        if (V.edit && V.edit.uuid === c.uuid) { return editPanel(c); }
        if (c.kind === 'remote') {
            return meta([[t.vpnReach, c.mode === 'full' && !c.networks.length ? t.vpnInternetOnly : nets], [t.vpnTraffic, c.mode === 'full' ? t.modeFull : t.modeSplit], [t.vpnAddr, c.address, true]], bodyButtons(c)) + devices(c);
        }
        var sheet = '<button type="button" class="k-btn small" data-act="' + (isIpsec(c) ? 'vpn:sheet' : 'vpn:wgsheet') + '" data-v="' + c.uuid + '">' + h.esc(t.ipcSheetBtn) + '</button>';
        var other = isIpsec(c) ? c.remote_endpoint : ((c.peers[0] || {}).endpoint || t.vpnWaitsForThem);
        return meta([[t.vpnOurNets, nets], [t.vpnRemoteNets, c.remote_networks.join(', '), true], [t.vpnRemoteEndpoint, other, true]], bodyButtons(c, sheet));
    }

    /* a connection: one line, opened by a click on it */
    function connRow(c) {
        var t = T(), open = V.open === c.uuid, st = state(c);
        var reach = c.mode === 'full' && !c.networks.length ? t.vpnInternetOnly : (c.mode === 'full' ? t.modeFull + ' · ' : '') + c.networks.map(netName).join(', ');
        var summary = c.kind === 'site' ? c.networks.map(netName).join(', ') + ' ⇄ ' + c.remote_networks.join(', ') : reach + ' · ' + t.vpnDevCount(c.peers.length);
        return '<div class="k-vitem' + (open ? ' open' : '') + (c.enabled ? '' : ' dim') + '"><div class="k-vrow">' +
            '<button type="button" class="k-vhead" data-act="vpn:open" data-v="' + c.uuid + '" aria-expanded="' + open + '">' +
            '<span class="k-vchev' + (open ? ' open' : '') + '">' + h.icon(CHEV, 16) + '</span>' +
            '<span class="k-ibox' + (c.enabled ? ' on' : '') + '">' + h.icon(c.kind === 'site' ? LINK : ICON, 18) + '</span>' +
            '<span class="k-vname"><b>' + h.esc(label(c)) + '</b>' + (c.kind === 'site' ? '<span class="k-badge">' + (isIpsec(c) ? 'IPsec' : 'WireGuard') + '</span>' : '') + '</span>' +
            '<span class="k-vsum muted">' + h.esc(summary) + '</span>' +
            '<span class="k-vstate"><span class="k-dot' + (st[1] ? ' ok' : '') + '"></span>' + h.esc(st[0]) + '</span></button>' +
            h.toggle(c.enabled, 'data-act="vpn:enable" data-v="' + c.uuid + '"' + (V.busy ? ' disabled' : ''), label(c)) + '</div>' +
            (open ? '<div class="k-vbody">' + body(c) + '</div>' : '') + '</div>';
    }

    function group(title, list) {
        return list.length ? '<div class="k-vgroup"><h2>' + h.esc(title) + '</h2>' + list.map(connRow).join('') + '</div>' : '';
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

    window.InversaPanelApp.register({
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
            /* a single connection needs no click to show what it holds */
            if (d.connections.length === 1 && V.open === null) { V.open = d.connections[0].uuid; }
            html += group(t.vpnKindRemote, d.connections.filter(function (c) { return c.kind !== 'site'; })) +
                group(t.vpnKindSite, d.connections.filter(function (c) { return c.kind === 'site'; }));
            if (!d.connections.length && !V.form) { html += '<div class="k-card k-empty" style="border-style:dashed">' + h.esc(t.vpnNone) + '</div>'; }
            var notes = [];
            if ((d.ipsec_others || []).length) { notes.push(t.ipcOthers(d.ipsec_others.join(', '))); }
            if (d.other_instances.length) { notes.push(t.vpnOthers(d.other_instances.map(function (o) { return o.name + ' (UDP ' + o.port + ')'; }).join(', '))); }
            notes.push(t.vpnBehindModem);
            html += notes.map(function (n) { return '<div class="muted small">' + h.esc(n) + '</div>'; }).join('');
            if (V.qr) { html += qrDialog(); }
            if (V.sheet) { html += sheetDialog(); }
            return html + '</div>';
        },
        act: function (name, el) {
            var v = el.getAttribute('data-v'), c = el.getAttribute('data-c'), f = V.form, e = V.edit, d = V.data;
            var conn = function (uuid) { return d.connections.filter(function (x) { return x.uuid === uuid; })[0]; };
            switch (name) {
                case 'form-open':
                    V.form = { step: 1, adv: false, kind: 'remote', type: 'wireguard', psk: '', name: '', port: String(d.next_port), networks: (d.networks[0] ? [d.networks[0].key] : []), mode: 'split', tunnel: '',
                        endpoint: '', remote_endpoint: '', remote_networks: '', remote_pubkey: '' };
                    return 'main';
                case 'form-close': V.form = null; return 'main';
                case 'form-pick':
                    f.kind = v === 'site' ? 'site' : 'remote';
                    f.type = el.getAttribute('data-t') === 'ipsec' ? 'ipsec' : 'wireguard';
                    f.step = 2;
                    return 'main';
                case 'form-back': f.step = 1; return 'main';
                case 'form-adv': f.adv = !f.adv; return 'main';
                case 'open':
                    V.open = V.open === v ? '' : v;
                    V.edit = null;
                    return 'main';
                case 'wgsheet': showWgSheet(conn(v)); return 'main';
                case 'sheet': showSheet(v); return null;
                case 'sheet-close': V.sheet = null; return 'main';
                case 'sheet-file': download('ipsec-' + V.sheet.name, V.sheet.text, '.txt'); return null;
                case 'form-net': f.networks = h.toggleInList(f.networks, v); return 'main';
                case 'form-mode': f.mode = v; return 'main';
                case 'form-create':
                    call('POST', '/api/inversapanel/vpn/create', {
                        kind: f.kind, type: isIpsec(f) ? 'ipsec' : 'wireguard', psk: f.psk, name: f.name, port: f.port, tunnel: f.tunnel, networks: f.networks, mode: f.mode, endpoint: f.endpoint,
                        remote_endpoint: f.remote_endpoint, remote_pubkey: f.remote_pubkey,
                        remote_networks: f.remote_networks.split(/[\s,]+/).filter(Boolean)
                    }).then(function (res) { if (res && res.status === 'ok') { V.form = null; V.open = res.uuid || V.open; h.redraw('main'); } });
                    return null;
                case 'enable': call('POST', '/api/inversapanel/vpn/update/' + v, { enabled: !conn(v).enabled }); return null;
                case 'del':
                    if (window.confirm(T().vpnDelConfirmConn(label(conn(v))))) { call('POST', '/api/inversapanel/vpn/delete/' + v); }
                    return null;
                case 'edit':
                    var x = conn(v);
                    V.open = v;
                    V.edit = V.edit && V.edit.uuid === v ? null : { uuid: v, networks: x.networks.slice(), mode: x.mode, endpoint: x.endpoint, tunnel: x.tunnel_net, psk: '',
                        remote_endpoint: isIpsec(x) ? x.remote_endpoint : (x.peers[0] || {}).endpoint || '', remote_networks: x.remote_networks.join(', ') };
                    return 'main';
                case 'edit-close': V.edit = null; return 'main';
                case 'edit-net': e.networks = h.toggleInList(e.networks, v); return 'main';
                case 'edit-mode': e.mode = v; return 'main';
                case 'edit-save':
                    var payload = { networks: e.networks, mode: e.mode, endpoint: e.endpoint, tunnel: e.tunnel };
                    if (isIpsec(conn(v))) {
                        /* an empty key keeps the one in use */
                        payload = { networks: e.networks, endpoint: e.endpoint, psk: e.psk };
                    }
                    if (conn(v).kind === 'site') {
                        payload.remote_endpoint = e.remote_endpoint;
                        payload.remote_networks = e.remote_networks.split(/[\s,]+/).filter(Boolean);
                    }
                    call('POST', '/api/inversapanel/vpn/update/' + v, payload).then(function (res) {
                        if (res && res.status === 'ok') { V.edit = null; h.redraw('main'); if (res.readdressed) { h.notice('ok', T().vpnReaddressed); } }
                    });
                    return null;
                case 'peer-add':
                    call('POST', '/api/inversapanel/vpn/peeradd/' + c, { name: V.names[c] }).then(function (res) {
                        if (res && res.status === 'ok') { V.names[c] = ''; V.qr = { name: res.name, config: res.config }; h.redraw('main'); }
                    });
                    return null;
                case 'peer-toggle':
                    var peer = conn(c).peers.filter(function (p) { return p.uuid === v; })[0];
                    call('POST', '/api/inversapanel/vpn/peertoggle/' + c + '/' + v, { enabled: !peer.enabled });
                    return null;
                case 'peer-del':
                    if (window.confirm(T().vpnDelConfirm)) { call('POST', '/api/inversapanel/vpn/peerdel/' + c + '/' + v); }
                    return null;
                case 'renew':
                    if (window.confirm(T().vpnRenewConfirm)) {
                        call('POST', '/api/inversapanel/vpn/peerrenew/' + c + '/' + v).then(function (res) {
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
