/*
 * SPDX-License-Identifier: BSD-2-Clause
 * Copyright (C) 2026 Inversa Bilişim
 *
 * Network & Internet: internet connection (DHCP / PPPoE + VLAN / static), internal networks
 * (own port or VLAN), access between networks, ports. Three pages of the "Network & Internet"
 * menu entry ("net", "nets", "ports") that share one state; their actions all go by "net:...".
 *
 * Changes to the connection and networks are applied with their own button and protected by
 * the firewall-side rollback: unless confirmed within the countdown (the banner of app.js),
 * OPNsense restores the previous configuration by itself. That goes for everything in a network's
 * form (name, colour, address, DHCP, isolation, speed limit, approval of new devices). Single cells
 * of the access table are ordinary pending changes (header "Apply").
 */
(function () {
    'use strict';
    var h = window.InversaPanelApp.h;
    var ICON = 'M10 3h4v4h-4zM3 17h4v4H3zM17 17h4v4h-4zM12 7v5M5 17v-2a3 3 0 0 1 3-3h8a3 3 0 0 1 3 3v2';
    var GLOBE = 'M12 2a10 10 0 1 0 0 20a10 10 0 1 0 0-20zM2 12h20M12 2a15 15 0 0 1 0 20M12 2a15 15 0 0 0 0 20';
    var PULSE = 'M22 12h-4l-3 9L9 3l-3 9H2';
    var PLUS = 'M12 5v14M5 12h14';
    var N = { data: null, wan: null, form: null, busy: false, test: null, testing: false, error: null };

    function t() { return h.T(); }
    function draft() { return h.S().draft; }

    function netName(key) {
        if (key === 'wan') { return t().internet; }
        var list = (N.data && N.data.networks) || [];
        for (var i = 0; i < list.length; i++) {
            if (list[i].key === key) { return list[i].name; }
        }
        return key.toUpperCase();
    }

    function netByKey(key) {
        return ((N.data && N.data.networks) || []).filter(function (n) { return n.key === key; })[0] || null;
    }

    function colorOf(key) {
        var n = netByKey(key);
        return n ? n.color : '#16A34A';
    }

    function dot(color) {
        return '<span class="k-dot" style="background:' + color + '"></span>';
    }

    function load() {
        return h.api('GET', '/api/inversapanel/network/get').then(function (data) {
            N.data = data;
            var w = data.wan || {};
            N.wan = { type: w.type, port: w.port, vlan: w.vlan || '', useVlan: !!w.vlan, username: w.username || '', password: '', ip: w.ip || '', gateway: w.gateway || '', ipv6: w.ipv6 === 'off' ? 'off' : 'auto',
                mac: w.mac || '', mtu: w.mtu || '' };
            /* the connection is tested once by itself, so the state block is not empty */
            if (w.exists && !N.test && !N.testing) { runTest(); }
            N.wanOrig = JSON.stringify(N.wan);
            if (data.rollback && !h.countdown()) {
                h.startCountdown(data.rollback.remaining);
            }
        });
    }

    /* ------------------------------------------------------------------ apply (confirmed within the countdown or put back) */

    function netApply(payload) {
        N.busy = true;
        N.error = null;
        h.redraw('main');
        h.api('POST', '/api/inversapanel/network/apply', payload).then(function (res) {
            N.busy = false;
            if (res.status === 'confirm') {
                N.form = null;
                h.startCountdown(res.remaining || 90);
                return load().then(function () { return h.reloadState(); });
            }
            N.error = res.message || t().applyFailed;
        }).catch(function (err) {
            N.busy = false;
            N.error = (err && err.errorMessage) || t().applyFailed;
        }).then(function () { h.redraw('main'); });
    }

    function runTest() {
        N.testing = true;
        h.api('GET', '/api/inversapanel/network/test').then(function (r) { N.test = r; }, function () { N.test = { ok: false }; })
            .then(function () { N.testing = false; if (h.S().tab === 'net') { h.redraw('main'); } });
    }

    /* ------------------------------------------------------------------ rendering */

    function banners() {
        var html = '';
        if (N.error) {
            html += '<div class="k-banner err" style="margin:0">' + h.icon(h.ICONS.warn, 20) + '<span style="white-space:pre-line">' + h.esc(N.error) + '</span></div>';
        }
        return html;
    }

    function portChips(selected, act, exclude) {
        return '<div class="k-chips">' + N.data.ports.map(function (p) {
            var on = selected === p.device;
            return '<button type="button" class="k-chip' + (on ? ' on' : '') + '" data-act="net:' + act + '" data-v="' + h.esc(p.device) + '"' +
                (exclude && exclude(p) ? ' disabled' : '') + '>' + '<span class="k-dot' + (p.link ? ' ok' : '') + '"></span>' + h.esc(p.device) + '</button>';
        }).join('') + '</div>';
    }

    /* the connection as it is now: addresses, gateway, name servers, and whether it works */
    function wanState() {
        var T = t(), w = N.data.wan, live = w.live || {};
        var kv = function (label, value) {
            return '<div class="k-kv"><span class="muted">' + h.esc(label) + '</span><span class="mono">' + h.esc(value) + '</span></div>';
        };
        var html = '<section class="k-card k-wan-state"><div class="k-wan-head"><div class="k-ibox big ' + (w.address ? 'on' : 'cut') + '">' + h.icon(GLOBE, 22) + '</div>' +
            '<div><b>' + h.esc(w.address ? T.wanConnected : T.wanDown) + '</b><span class="muted">' + h.esc(T.wanVia[w.type] || w.type) + '</span></div></div><div>' +
            kv(T.wanPortShort, w.port + (w.vlan ? ' · VLAN ' + w.vlan : '') + ' · ' + (live.link ? T.wanLinkUp : T.linkDown)) +
            kv(T.wanIp, live.ipv4 || w.address || '—') +
            kv(T.chkGateway, live.gateway || '—') +
            (N.extip !== undefined ? kv(T.wanExt, N.extip === null ? '…' : (N.extip || T.wanExtFailed)) : '') +
            kv('DNS', (live.dns || []).join(', ') || '—') +
            (live.ipv6 ? kv('IPv6', live.ipv6) : '') + '</div>' +
            '<div class="k-wan-sub">' + h.esc(T.wanTestTitle) + '</div><div>' +
            [['gateway', T.chkGateway], ['internet', T.chkInternet], ['dns', T.chkDns]].map(function (c) {
                var r = (N.test || {})[c[0]] || {};
                return '<div class="k-wan-chk' + (N.test ? (r.ok ? ' ok' : ' bad') : '') + '">' + h.icon(!N.test ? PULSE : (r.ok ? h.ICONS.ok : h.ICONS.close), 14) +
                    '<span>' + h.esc(c[1]) + (c[0] === 'internet' && r.address ? ' (' + h.esc(r.address) + ')' : '') + '</span>' +
                    '<span class="mono muted">' + (!N.test ? '…' : (r.ok ? h.esc(String(r.ms)) + ' ms' : '—')) + '</span></div>';
            }).join('') + '</div>' +
            '<div class="k-wan-btns"><button type="button" class="k-btn" data-act="net:test"' + (N.testing ? ' disabled' : '') + '>' + h.icon(PULSE, 15) + h.esc(N.testing ? T.wanTesting : T.wanRetest) + '</button>' +
            '<button type="button" class="k-btn" data-act="net:extip"' + (N.extip === null ? ' disabled' : '') + '>' + h.esc(T.wanExtBtn) + '</button></div>' +
            '<div class="muted small">' + h.esc(T.wanExtNote) + '</div></section>';
        return html;
    }

    function viewWan() {
        var T = t(), w = N.data.wan, f = N.wan;
        if (!w.exists) {
            return '<div class="k-card k-empty">' + h.esc(T.wanMissing) + '</div>';
        }
        if (w.readonly) {
            return '<div class="k-banner info" style="margin:0">' + h.icon(h.ICONS.info, 20) + '<span>' +
                h.esc(w.reasons.indexOf('multiwan') >= 0 ? T.wanMulti : T.wanComplex) + '</span></div><div class="k-wan">' + wanState() + '</div>';
        }
        var changed = JSON.stringify(N.wan) !== N.wanOrig;
        var row = function (title, sub, control) {
            return '<div class="k-wan-row"><div class="k-wan-text"><b>' + h.esc(title) + '</b><span class="muted">' + h.esc(sub) + '</span></div>' + control + '</div>';
        };
        /* the kinds of connection one below the other, what the chosen one needs beside them, then how it is right now */
        var adv = N.wanAdv || f.mac || f.mtu;
        var html = '<div class="k-wan"><div class="k-wan-left"><section class="k-card k-wan-types"><h2>' + h.esc(T.wanType) + '</h2>' + ['pppoe', 'static', 'dhcp'].map(function (k) {
            var on = f.type === k;
            return '<button type="button" class="k-opt' + (on ? ' on' : '') + '" data-act="net:wantype" data-v="' + k + '" aria-pressed="' + on + '">' +
                '<b>' + h.esc(T.wt[k][0]) + '</b><span>' + h.esc(T.wt[k][1]) + '</span></button>';
        }).join('') + '</section>';
        html += adv ? '<section class="k-card k-wan-adv"><h2>' + h.esc(T.wanAdvTitle) + '</h2>' +
            '<label class="k-field"><span>' + h.esc(T.wanMac) + '</span><input type="text" class="mono" data-input="net:wan-mac" value="' + h.esc(f.mac) + '" placeholder="' + h.esc(T.wanAuto) + '" autocomplete="off" spellcheck="false">' +
            '<span class="muted small">' + h.esc(T.wanMacSub) + '</span></label>' +
            '<label class="k-field"><span>MTU</span><input type="text" inputmode="numeric" class="mono" style="width:100px" data-input="net:wan-mtu" value="' + h.esc(f.mtu) + '" placeholder="' + (f.type === 'pppoe' ? '1492' : '1500') + '">' +
            '<span class="muted small">' + h.esc(f.type === 'pppoe' ? T.wanMtuPppoe : T.wanMtuSub) + '</span></label></section>' :
            '<button type="button" class="k-link small k-wan-advlink" data-act="net:wanadv">' + h.esc(T.wanAdv) + '</button>';
        if (f.type === 'dhcp') {
            html += '<div class="k-banner warn" style="margin:0">' + h.icon(h.ICONS.warn, 20) + '<span>' + h.esc(T.dhcpWarn) + '</span></div>';
        }
        html += '</div><section class="k-card k-wan-settings"><h2>' + h.esc(T.wanSettings(T.wt[f.type] ? T.wt[f.type][0] : '')) + '</h2>';
        if (f.type === 'pppoe') {
            html += '<div class="k-wan-fields"><label class="k-field"><span>' + h.esc(T.pppUser) + '</span>' +
                '<input type="text" class="mono" data-input="net:wan-username" value="' + h.esc(f.username) + '" autocomplete="off"></label>' +
                '<label class="k-field"><span>' + h.esc(T.pppPass) + '</span>' +
                '<input type="password" class="mono" data-input="net:wan-password" value="' + h.esc(f.password) + '" placeholder="' + h.esc(N.data.wan.has_password ? T.pppKeep : '') + '" autocomplete="new-password"></label></div>' +
                '<div class="muted">' + h.esc(T.pppoeHint) + '</div>';
        }
        if (f.type === 'static') {
            html += '<div class="k-wan-fields"><label class="k-field"><span>' + h.esc(T.stIp) + '</span>' +
                '<input type="text" class="mono" data-input="net:wan-ip" value="' + h.esc(f.ip) + '" placeholder="85.105.42.17/29"></label>' +
                '<label class="k-field"><span>' + h.esc(T.stGw) + '</span>' +
                '<input type="text" class="mono" data-input="net:wan-gateway" value="' + h.esc(f.gateway) + '"></label></div>';
        }
        html += '<div>' +
            row(T.wanPort, T.wanPortSub, portChips(f.port, 'wanport')) +
            row(T.vlanReq, T.vlanReqSub, '<div class="k-wan-ctl">' + (f.useVlan ? '<input type="text" inputmode="numeric" class="mono" style="width:80px" data-input="net:wan-vlan" value="' + h.esc(f.vlan) + '" aria-label="' + h.esc(T.vlanId) + '">' : '') +
                h.toggle(f.useVlan, 'data-act="net:wanvlan"', T.vlanReq) + '</div>') +
            row('IPv6', T.ipv6Sub, '<div class="k-seg">' + [['auto', T.v6Auto], ['off', T.v6Off]].map(function (o) {
                return '<button type="button" class="' + (f.ipv6 === o[0] ? 'on' : '') + '" data-act="net:wanv6" data-v="' + o[0] + '">' + h.esc(o[1]) + '</button>';
            }).join('') + '</div>') +
            '</div>' +
            '<div class="k-wan-foot">' +
            '<span class="muted small">' + h.esc(T.netSafety) + '</span>' +
            '<button type="button" class="k-btn" data-act="net:wanreset"' + (changed ? '' : ' disabled') + '>' + h.esc(T.discard) + '</button>' +
            '<button type="button" class="k-btn primary" data-act="net:wanapply"' + (changed && !N.busy && !h.countdown() ? '' : ' disabled') + '>' + h.esc(N.busy ? T.applying : T.netApply) + '</button></div></section>';
        return html + wanState() + '</div>';
    }

    /* the range the firewall picks when none is given (Network::setDhcp) */
    function defaultRange(ip, bits) {
        var m = /^(\d{1,3})\.(\d{1,3})\.(\d{1,3})\.(\d{1,3})$/.exec(ip || '');
        bits = Number(bits) || 24;
        if (!m || bits < 8 || bits > 30 || m.slice(1).some(function (x) { return +x > 255; })) { return null; }
        var addr = ((+m[1] << 24) >>> 0) + (+m[2] << 16) + (+m[3] << 8) + (+m[4]);
        var size = Math.pow(2, 32 - bits), base = addr - (addr % size);
        function str(n) { return [n >>> 24, (n >>> 16) & 255, (n >>> 8) & 255, n & 255].join('.'); }
        return bits === 24 ? { from: str(base + 100), to: str(base + 199) } :
            { from: str(base + Math.min(100, Math.floor(size / 4))), to: str(base + size - Math.min(56, Math.floor(size / 8)) - 1) };
    }

    function parts(ip) {
        var m = /^(\d{1,3})\.(\d{1,3})\.(\d{1,3})\.(\d{1,3})$/.exec(ip || '');
        return m && !m.slice(1).some(function (x) { return +x > 255; }) ? m.slice(1) : null;
    }

    /* with a /24 the range keeps the network's first three numbers: only the last one is typed */
    function shortRange(f) {
        return Number(f.subnet) === 24 && !!parts(f.ip);
    }

    /* the range a switched on DHCP server starts with, and the one that follows a changed address */
    function fillRange(f) {
        var def = defaultRange(f.ip, f.subnet), p = parts(f.ip);
        if (!f.dhcp || !def) { return; }
        if (shortRange(f)) {
            var last = function (v, d) { var q = parts(v); return q ? q[3] : d; };
            f.from = p.slice(0, 3).join('.') + '.' + last(f.from, '100');
            f.to = p.slice(0, 3).join('.') + '.' + last(f.to, '199');
        } else {
            f.from = f.from || def.from;
            f.to = f.to || def.to;
        }
    }

    function online(key) {
        return h.hosts().filter(function (x) { return x.network_key === key && x.online; }).length;
    }

    function netCard(n) {
        var T = t(), editing = N.form && N.form.key === n.key;
        var range = !n.dhcp ? T.off : (Number(n.subnet) === 24 && parts(n.dhcp.to) ? n.dhcp.from + ' – ' + parts(n.dhcp.to)[3] : n.dhcp.from + ' – ' + n.dhcp.to);
        var kv = function (label, value, mono) {
            return '<div class="k-kv"><span class="muted">' + h.esc(label) + '</span><span' + (mono ? ' class="mono"' : '') + '>' + h.esc(value) + '</span></div>';
        };
        return '<section class="k-card k-net-card" style="border-top:4px solid ' + h.esc(n.color) + '">' +
            '<div class="k-setting" style="padding:0;border:none">' + dot(n.color) +
            '<div class="k-setting-text"><b style="font-size:16px">' + h.esc(n.name) + '</b><span class="muted">' + h.esc(n.key === 'lan' ? T.netMain + ' · ' : '') +
            '<button type="button" class="k-devlink" data-act="show-net" data-v="' + h.esc(n.key) + '" data-n="' + h.esc(n.name) + '" title="' + h.esc(T.fNetworkShow) + '">' + h.esc(T.netDevCount(online(n.key))) + '</button></span></div>' +
            (n.readonly ? '<span class="k-badge">' + h.esc(T.readonly) + '</span>' :
                '<button type="button" class="k-btn small" data-act="net:edit" data-v="' + n.key + '">' + h.esc(editing ? T.close : T.netEdit) + '</button>') + '</div>' +
            '<div>' +
            kv(T.netLink, n.mode === 'vlan' ? 'VLAN ' + n.vlan + ' · ' + n.port : n.port + ' · ' + T.untagged, true) +
            kv(T.netAddr, n.ip ? n.ip + '/' + n.subnet : '—', true) +
            kv('DHCP', range + (n.dhcp && n.dhcp.lease != null ? ' · ' + T.leaseShort(n.dhcp.lease) : ''), true) +
            (n.isolated ? kv(T.isoRow, n.reach.length ? T.isoWith(n.reach.map(netName).join(', ')) : T.isoAlone) : '') +
            (n.limit ? kv(T.limTitle, n.down + ' / ' + n.up + ' Mbit/s', true) : '') +
            (n.approval ? kv(T.apprCard, T.on) : '') +
            '</div></section>';
    }

    function opt(on, act, title, sub, extra, disabled) {
        return '<div class="k-nopt">' + h.toggle(on, 'data-act="net:' + act + '"' + (disabled ? ' disabled' : ''), title) +
            '<div class="k-nopt-text"><b>' + h.esc(title) + '</b><span class="muted small">' + h.esc(sub) + '</span></div>' + (extra || '') + '</div>';
    }

    function mini(label, name, value, width, placeholder) {
        return '<label class="k-nmini"><span>' + h.esc(label) + '</span><input type="text" class="mono" inputmode="decimal" autocomplete="off" style="width:' + width + 'px" ' +
            'data-input="net:f-' + name + '" value="' + h.esc(value) + '"' + (placeholder ? ' placeholder="' + h.esc(placeholder) + '"' : '') + '></label>';
    }

    /* the one form of a network: a new one (f.key empty) or an existing one */
    function netForm() {
        var T = t(), f = N.form, isNew = !f.key, n = isNew ? null : netByKey(f.key);
        if (!isNew && !n) { return ''; }
        var others = N.data.networks.filter(function (x) { return x.key !== f.key && !x.readonly; });
        var prot = isNew || (draft().general.interfaces || []).indexOf(f.key) >= 0;
        var p = parts(f.ip), prefix = p ? p.slice(0, 3).join('.') + '.' : '';

        var conn = isNew ?
            '<div class="k-seg">' + [['vlan', T.edVlanMode], ['port', T.edPortMode]].map(function (o) {
                return '<button type="button" class="' + (f.mode === o[0] ? 'on' : '') + '" data-act="net:f-mode" data-v="' + o[0] + '">' + h.esc(o[1]) + '</button>';
            }).join('') + '</div>' +
            (f.mode === 'vlan' ? mini(T.edVlanId, 'vlan', f.vlan, 72) : '') +
            '<span class="k-nsep"></span><span class="muted small">' + h.esc(T.edPort) + '</span>' +
            N.data.ports.map(function (x) {
                var on = f.port === x.device, off = f.mode === 'port' && (x.untagged || x.vlans.length);
                return '<button type="button" class="k-chip' + (on ? ' on' : '') + '" data-act="net:f-port" data-v="' + h.esc(x.device) + '"' + (off ? ' disabled' : '') + '>' +
                    '<span class="k-dot' + (x.link ? ' ok' : '') + '"></span>' + h.esc(x.device) + '</button>';
            }).join('') :
            '<span class="mono k-nro">' + h.esc(n.mode === 'vlan' ? 'VLAN ' + n.vlan + ' · ' + n.port : n.port + ' · ' + T.untagged) + '</span>' +
            '<span class="muted small">' + h.esc(T.edConnFixed) + '</span>';

        var dhcp = h.toggle(f.dhcp, 'data-act="net:f-dhcp"', T.edDhcp);
        if (f.dhcp) {
            var last = function (v) { var q = parts(v); return q ? q[3] : ''; };
            dhcp += '<span class="muted small">' + h.esc(T.edRange) + '</span>' + (shortRange(f) ?
                '<span class="k-nrange"><span class="mono muted">' + h.esc(prefix) + '</span><input type="text" class="mono" inputmode="numeric" style="width:52px" data-input="net:f-fromlast" value="' + h.esc(last(f.from)) + '" aria-label="' + h.esc(T.edDhcpFrom) + '">' +
                '<span class="muted">–</span><span class="mono muted">' + h.esc(prefix) + '</span><input type="text" class="mono" inputmode="numeric" style="width:52px" data-input="net:f-tolast" value="' + h.esc(last(f.to)) + '" aria-label="' + h.esc(T.edDhcpTo) + '"></span>' :
                '<span class="k-nrange"><input type="text" class="mono" style="width:136px" data-input="net:f-from" value="' + h.esc(f.from) + '" aria-label="' + h.esc(T.edDhcpFrom) + '"><span class="muted">–</span>' +
                '<input type="text" class="mono" style="width:136px" data-input="net:f-to" value="' + h.esc(f.to) + '" aria-label="' + h.esc(T.edDhcpTo) + '"></span>') +
                mini(T.edLease, 'lease', f.lease, 96, T.edLeaseDefault);
        } else {
            dhcp += '<span class="muted small">' + h.esc(T.edDhcpOff) + '</span>';
        }

        var ok = f.name && parts(f.ip) && (!isNew || f.port) && (!f.limit || (Number(f.down) >= 1 && Number(f.up) >= 1)) && !N.busy && !h.countdown();
        var changed = isNew || JSON.stringify(f) !== N.formOrig;
        return '<section class="k-card k-edit k-nform"><div class="k-card-head"><h2>' + h.esc(isNew ? T.netAdd : T.edTitle(n.name)) + '</h2><span class="muted small">' + h.esc(T.netSafety) + '</span></div>' +
            '<div class="k-ngrid">' +
            '<label class="k-nf"><span class="k-nl">' + h.esc(T.edName) + '</span><input type="text" maxlength="16" style="width:150px" autocomplete="off" data-input="net:f-name" value="' + h.esc(f.name) + '"></label>' +
            '<div class="k-nf"><span class="k-nl">' + h.esc(T.edColor) + '</span><div class="k-ncolors">' + (N.data.colors || []).map(function (c, i) {
                return '<button type="button" class="k-ncolor' + (f.color.toLowerCase() === c.toLowerCase() ? ' on' : '') + '" style="background:' + h.esc(c) + '" data-act="net:f-color" data-v="' + h.esc(c) + '" aria-pressed="' + (f.color === c) + '" aria-label="' + h.esc(T.edColorN(i + 1)) + '"></button>';
            }).join('') + '</div></div>' +
            '<div class="k-nf k-nwide"><span class="k-nl">' + h.esc(T.netLink) + '</span><div class="k-ninline">' + conn + '</div></div>' +
            '<label class="k-nf"><span class="k-nl">' + h.esc(T.edGw) + '</span><input type="text" class="mono" style="width:150px" inputmode="decimal" autocomplete="off" data-input="net:f-ip" value="' + h.esc(f.ip) + '"></label>' +
            '<div class="k-nf"><span class="k-nl">DHCP</span><div class="k-ninline">' + dhcp + '</div></div>' +
            '</div>' +
            '<div class="k-nopts">' +
            opt(f.isolated, 'f-iso', T.isoTitle, T.isoSub, f.isolated && others.length ? '<div class="k-ninline k-nsub"><span class="muted small">' + h.esc(T.isoReach) + '</span>' + others.map(function (x) {
                var on = f.reach.indexOf(x.key) >= 0;
                return '<button type="button" class="k-chip' + (on ? ' on' : '') + '" data-act="net:f-reach" data-v="' + x.key + '" aria-pressed="' + on + '">' + dot(x.color) + h.esc(x.name) + '</button>';
            }).join('') + '</div>' : '') +
            opt(f.limit, 'f-limit', T.limTitle, T.limSub, f.limit ? '<div class="k-ninline k-nsub">' + mini(T.limDown, 'down', f.down, 64) + mini(T.limUp, 'up', f.up, 64) + '<span class="muted small">Mbit/s</span></div>' : '') +
            opt(f.approval, 'f-appr', T.edApproval, prot || f.approval ? T.edApprovalShort : T.edApprovalNotProtected, '', !(prot || f.approval)) +
            '</div>' +
            (f.mode === 'vlan' ? '<div class="muted small">' + h.esc(T.vlanWifi(f.vlan || '…')) + '</div>' : '') +
            (f.key === 'lan' ? '<div class="k-banner warn" style="margin:0">' + h.icon(h.ICONS.warn, 20) + '<span>' + h.esc(T.lanChangeWarn) + '</span></div>' : '') +
            '<div class="k-nfoot">' +
            (isNew ? '' : (n.created ? '<button type="button" class="k-btn k-danger" data-act="net:delete" data-v="' + n.key + '"' + (N.busy || h.countdown() ? ' disabled' : '') + '>' + h.esc(T.edDelete) + '</button>' :
                '<span class="muted small" style="margin-right:auto">' + h.esc(T.notCreated) + '</span>')) +
            '<button type="button" class="k-btn" data-act="net:f-cancel">' + h.esc(T.discard) + '</button>' +
            '<button type="button" class="k-btn primary" data-act="net:f-save"' + (ok && changed ? '' : ' disabled') + '>' + h.esc(N.busy ? T.applying : (isNew ? T.netCreate : T.save)) + '</button></div></section>';
    }

    function openForm(n) {
        if (n) {
            var d = n.dhcp || {};
            N.form = { key: n.key, name: n.name, color: n.color, mode: n.mode, port: n.port, vlan: String(n.vlan || ''), ip: n.ip, subnet: n.subnet, dhcp: !!n.dhcp,
                from: d.from || '', to: d.to || '', lease: d.lease != null ? String(d.lease) : '',
                isolated: !!n.isolated, reach: (n.reach || []).slice(), limit: !!n.limit, down: String(n.down), up: String(n.up), approval: !!n.approval };
        } else {
            var used = [], taken = N.data.networks.map(function (x) { return x.color.toLowerCase(); });
            N.data.ports.forEach(function (x) { x.vlans.forEach(function (v) { used.push(Number(v.tag)); }); });
            var tag = 20;
            while (used.indexOf(tag) >= 0) { tag += 10; }
            var lanPort = (netByKey('lan') || {}).port || (N.data.ports[0] || {}).device;
            var free = (N.data.colors || []).filter(function (c) { return taken.indexOf(c.toLowerCase()) < 0; });
            N.form = { key: '', name: '', color: free[0] || (N.data.colors || ['#475569'])[0], mode: 'vlan', port: lanPort, vlan: String(tag), ip: '192.168.' + tag + '.1', subnet: 24, dhcp: true,
                from: '', to: '', lease: '', isolated: true, reach: [], limit: false, down: '20', up: '5', approval: false };
            fillRange(N.form);
        }
        N.formOrig = JSON.stringify(N.form);
    }

    function saveForm() {
        var f = N.form;
        var item = { name: f.name, color: f.color, ip: f.ip, dhcp: f.dhcp, dhcp_from: f.dhcp ? f.from : '', dhcp_to: f.dhcp ? f.to : '', lease: f.dhcp ? f.lease : '',
            isolated: f.isolated, reach: f.isolated ? f.reach : [], limit: f.limit, down: f.down, up: f.up, approval: f.approval };
        if (!f.key) {
            item.mode = f.mode; item.port = f.port; item.vlan = f.vlan;
            netApply({ add: [item] });
        } else {
            var upd = {};
            upd[f.key] = item;
            netApply({ update: upd });
        }
    }

    function matrix() {
        var T = t(), nets = N.data.networks.filter(function (n) { return !n.readonly; });
        if (nets.length < 1) { return ''; }
        var cols = nets.map(function (n) { return n.key; }).concat(['wan']);
        var acc = draft().access;
        return '<section class="k-card"><div><h2>' + h.esc(T.accTitle) + '</h2><div class="muted">' + h.esc(T.accSub) + '</div></div>' +
            '<div style="overflow-x:auto"><table class="k-matrix"><thead><tr><th class="muted small">' + h.esc(T.accFrom) + '</th>' +
            cols.map(function (c) { return '<th>' + dot(colorOf(c)) + h.esc(netName(c)) + '</th>'; }).join('') + '</tr></thead><tbody>' +
            nets.map(function (r) {
                return '<tr><th>' + dot(r.color) + h.esc(r.name) + '</th>' + cols.map(function (c) {
                    if (c === r.key) { return '<td><div class="k-cell self">—</div></td>'; }
                    var k = r.key + '>' + c, v = acc[k];
                    var state = v === true ? 'allow' : (v === false ? 'deny' : 'default');
                    return '<td><button type="button" class="k-cell ' + state + '" data-act="net:cell" data-v="' + h.esc(k) + '" aria-label="' + h.esc(r.name + ' → ' + netName(c) + ': ' + T.accState[state]) + '">' +
                        (state === 'allow' ? h.icon(h.ICONS.ok, 14) : (state === 'deny' ? h.icon(h.ICONS.close, 14) : '')) + h.esc(T.accState[state]) + '</button></td>';
                }).join('') + '</tr>';
            }).join('') + '</tbody></table></div><div class="muted small">' + h.esc(T.accLegend) + '</div></section>';
    }

    function viewNets() {
        var T = t();
        var html = '<div class="k-row stretch">' + N.data.networks.map(netCard).join('') +
            (N.form && !N.form.key ? '' : '<button type="button" class="k-card k-add-card" data-act="net:add-open">' + h.icon(PLUS, 22) + '<b>' + h.esc(T.netAdd) + '</b><span class="muted">' + h.esc(T.netAddSub) + '</span></button>') + '</div>';
        if (N.form) { html += netForm(); }
        return html + matrix();
    }

    function viewPorts() {
        var T = t();
        function role(p) {
            if (p.untagged === 'wan' || (N.data.wan.port === p.device && N.data.wan.exists)) { return T.portWan; }
            if (p.untagged) { return netName(p.untagged); }
            return p.vlans.length ? T.portTrunkOnly : T.portUnused;
        }
        return '<section class="k-card">' +
            '<div class="k-ports">' + N.data.ports.map(function (p) {
                return '<div class="k-port"><div class="k-port-top"><span class="mono">' + h.esc(p.device) + '</span><span class="k-dot' + (p.link ? ' ok' : '') + '"></span></div>' +
                    '<div class="k-jack' + (p.link ? ' up' : '') + '"></div><b>' + h.esc(role(p)) + '</b>' +
                    '<span>' + h.esc(p.vlans.length ? p.vlans.map(function (v) { return 'VLAN ' + v.tag + ' · ' + netName(v.key); }).join(', ') : (p.link ? p.media : T.linkDown)) + '</span>' +
                    '<span class="mono small">' + h.esc(p.mac) + '</span></div>';
            }).join('') + '</div></section>';
    }

    /* one of the three pages: its own heading, the shared banners, its content */
    function page(key, title, sub, body) {
        return {
            key: key,
            icon: ICON,
            label: title,
            load: load,
            render: function () {
                var T = t();
                var html = '<div class="k-stack"><div><h1>' + h.esc(title(T)) + '</h1><div class="muted" style="font-size:14px;margin-top:4px">' + h.esc(sub(T)) + '</div></div>';
                if (!N.data) {
                    return html + '<div class="k-loading">…</div></div>';
                }
                return html + banners() + body() + '</div>';
            }
        };
    }

    window.InversaPanelApp.register(page('nets', function (T) { return T.subNets; }, function (T) { return T.netsSub; }, viewNets));
    window.InversaPanelApp.register(page('ports', function (T) { return T.subPorts; }, function (T) { return T.portsSubRo; }, viewPorts));
    window.InversaPanelApp.register(Object.assign(page('net', function (T) { return T.subWan; }, function (T) { return T.wanSub; }, viewWan), {
        act: function (name, el) {
            var v = el.getAttribute('data-v'), f = N.wan;
            switch (name) {
                case 'test': runTest(); return 'main';
                case 'extip':
                    /* null: asked, no answer yet */
                    N.extip = null;
                    h.api('GET', '/api/inversapanel/network/extip').then(function (r) { N.extip = (r && r.ip) || ''; }, function () { N.extip = ''; })
                        .then(function () { h.redraw('main'); });
                    return 'main';
                case 'wanadv': N.wanAdv = true; return 'main';
                case 'wantype': f.type = v; return 'main';
                case 'wanport': f.port = v; return 'main';
                case 'wanvlan': f.useVlan = !f.useVlan; if (!f.useVlan) { f.vlan = ''; } return 'main';
                case 'wanv6': f.ipv6 = v; return 'main';
                case 'wanreset': load().then(function () { h.redraw('main'); }); return null;
                case 'wanapply':
                    netApply({ wan: { type: f.type, port: f.port, vlan: f.useVlan ? f.vlan : '', username: f.username, password: f.password, ip: f.ip, gateway: f.gateway, ipv6: f.ipv6, mac: f.mac, mtu: f.mtu } });
                    return null;
                case 'edit':
                    if (N.form && N.form.key === v) { N.form = null; } else { openForm(netByKey(v)); }
                    return 'main';
                case 'add-open': openForm(null); return 'main';
                case 'f-cancel': N.form = null; return 'main';
                case 'f-color': N.form.color = v; return 'main';
                case 'f-mode': N.form.mode = v; return 'main';
                case 'f-port': N.form.port = v; return 'main';
                case 'f-dhcp': N.form.dhcp = !N.form.dhcp; fillRange(N.form); return 'main';
                case 'f-iso': N.form.isolated = !N.form.isolated; return 'main';
                case 'f-reach': N.form.reach = h.toggleInList(N.form.reach, v); return 'main';
                case 'f-limit': N.form.limit = !N.form.limit; return 'main';
                case 'f-appr': N.form.approval = !N.form.approval; return 'main';
                case 'f-save': saveForm(); return null;
                case 'delete':
                    if (window.confirm(t().edDeleteConfirm(netName(v)))) { netApply({ 'delete': [v] }); }
                    return null;
                case 'cell':
                    /* default (OPNsense rules) -> allowed -> blocked -> default */
                    var acc = draft().access, cur = acc[v];
                    if (cur === undefined) { acc[v] = true; } else if (cur === true) { acc[v] = false; } else { delete acc[v]; }
                    return 'main';
            }
            return null;
        },
        input: function (name, el, type) {
            var f = N.wan, val = el.value;
            var map = { 'wan-username': [f, 'username'], 'wan-password': [f, 'password'], 'wan-ip': [f, 'ip'], 'wan-gateway': [f, 'gateway'], 'wan-vlan': [f, 'vlan'], 'wan-mac': [f, 'mac'], 'wan-mtu': [f, 'mtu'] };
            if (map[name]) {
                map[name][0][map[name][1]] = name === 'wan-vlan' || name === 'wan-mtu' ? val.replace(/[^0-9]/g, '').slice(0, 4) : (name === 'wan-mac' ? val.trim().toLowerCase().replace(/-/g, ':') : val.trim());
            } else if (name.indexOf('f-') === 0 && N.form) {
                var form = N.form, key = name.slice(2), p = parts(form.ip);
                if (key === 'name') {
                    form.name = val.toUpperCase().replace(/[^A-Z0-9_]/g, '').slice(0, 16);
                } else if (key === 'vlan') {
                    form.vlan = val.replace(/[^0-9]/g, '').slice(0, 4);
                } else if (key === 'ip') {
                    form.ip = val.trim();
                    /* the range moves along with the address */
                    if (type === 'change') { fillRange(form); }
                } else if ((key === 'fromlast' || key === 'tolast') && p) {
                    form[key === 'fromlast' ? 'from' : 'to'] = p.slice(0, 3).join('.') + '.' + val.replace(/[^0-9]/g, '').slice(0, 3);
                } else if (key === 'from' || key === 'to') {
                    form[key] = val.replace(/[^0-9.]/g, '');
                } else if (key === 'lease') {
                    form.lease = val.replace(/[^0-9.,]/g, '').replace(',', '.');
                } else if (key === 'down' || key === 'up') {
                    form[key] = val.replace(/[^0-9]/g, '').slice(0, 5);
                } else {
                    return null;
                }
            } else {
                return null;
            }
            /* re-render on leaving the field only, so typing is not interrupted */
            return type === 'change' ? 'main' : null;
        },
        changes: function (add, d, s) {
            var T = t();
            var keys = Object.keys(Object.assign({}, s.access, d.access));
            keys.forEach(function (k) {
                if (d.access[k] !== s.access[k]) {
                    var p = k.split('>');
                    var label = function (v) { return T.accState[v === true ? 'allow' : (v === false ? 'deny' : 'default')]; };
                    add(T.accTitle + ' · ' + netName(p[0]) + ' → ' + netName(p[1]), label(s.access[k]), label(d.access[k]), function () {
                        if (s.access[k] === undefined) { delete d.access[k]; } else { d.access[k] = s.access[k]; }
                    });
                }
            });
        }
    }));
})();
