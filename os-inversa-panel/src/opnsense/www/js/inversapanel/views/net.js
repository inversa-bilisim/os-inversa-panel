/*
 * SPDX-License-Identifier: BSD-2-Clause
 * Copyright (C) 2026 Inversa Bilişim
 *
 * Network & Internet: internet connection (DHCP / PPPoE + VLAN / static), internal networks
 * (own port or VLAN), access between networks, ports. Three pages of the "Network & Internet"
 * menu entry ("net", "nets", "ports") that share one state; their actions all go by "net:...".
 *
 * Changes to the connection and networks are applied with their own button and protected by
 * the firewall-side rollback: unless confirmed within the countdown, OPNsense restores the
 * previous configuration by itself. The access matrix, network kinds and "new devices wait for
 * approval" are ordinary pending changes (header "Apply").
 */
(function () {
    'use strict';
    var h = window.InversaPanelApp.h;
    var ICON = 'M10 3h4v4h-4zM3 17h4v4H3zM17 17h4v4h-4zM12 7v5M5 17v-2a3 3 0 0 1 3-3h8a3 3 0 0 1 3 3v2';
    var GLOBE = 'M12 2a10 10 0 1 0 0 20a10 10 0 1 0 0-20zM2 12h20M12 2a15 15 0 0 1 0 20M12 2a15 15 0 0 0 0 20';
    var PULSE = 'M22 12h-4l-3 9L9 3l-3 9H2';
    var PLUS = 'M12 5v14M5 12h14';
    var KIND_COLOR = h.KIND_COLOR;
    var KINDS = ['home', 'iot', 'guest', 'camera', 'server'];

    var N = { data: null, wan: null, add: null, edit: null, busy: false, countdown: null, test: null, testing: false, error: null };

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

    function kindOf(key) {
        return draft().kinds[key] || (N.data && N.data.networks.filter(function (n) { return n.key === key; }).map(function (n) { return n.kind; })[0]) || 'home';
    }

    function dot(color) {
        return '<span class="k-dot" style="background:' + color + '"></span>';
    }

    function load() {
        return h.api('GET', '/api/inversapanel/network/get').then(function (data) {
            N.data = data;
            var w = data.wan || {};
            N.wan = { type: w.type, port: w.port, vlan: w.vlan || '', useVlan: !!w.vlan, username: w.username || '', password: '', ip: w.ip || '', gateway: w.gateway || '', ipv6: w.ipv6 === 'off' ? 'off' : 'auto' };
            N.wanOrig = JSON.stringify(N.wan);
            if (data.rollback && !N.countdown) {
                startCountdown(data.rollback.remaining);
            }
        });
    }

    /* ------------------------------------------------------------------ apply + rollback countdown */

    function startCountdown(seconds) {
        stopCountdown();
        N.countdown = { left: seconds, expired: false };
        N.countdown.timer = setInterval(function () {
            N.countdown.left -= 1;
            var el = document.getElementById('k-net-left');
            if (el) { el.textContent = String(Math.max(0, N.countdown.left)); }
            if (N.countdown.left <= 0) {
                clearInterval(N.countdown.timer);
                N.countdown.expired = true;
                h.redraw('main');
                /* the firewall restored the old settings: reload once it had time to do so */
                setTimeout(function () { stopCountdown(); load().then(function () { h.reloadState(); }, function () {}); }, 20000);
            }
        }, 1000);
    }

    function stopCountdown() {
        if (N.countdown && N.countdown.timer) { clearInterval(N.countdown.timer); }
        N.countdown = null;
    }

    function netApply(payload) {
        N.busy = true;
        N.error = null;
        h.redraw('main');
        h.api('POST', '/api/inversapanel/network/apply', payload).then(function (res) {
            N.busy = false;
            if (res.status === 'confirm') {
                N.add = null;
                N.edit = null;
                startCountdown(res.remaining || 90);
                return load().then(function () { return h.reloadState(); });
            }
            N.error = res.message || t().applyFailed;
        }).catch(function (err) {
            N.busy = false;
            N.error = (err && err.errorMessage) || t().applyFailed;
        }).then(function () { h.redraw('main'); });
    }

    function confirm() {
        h.api('POST', '/api/inversapanel/network/confirm', {}).then(function () {
            stopCountdown();
            h.notice('ok', t().netConfirmed);
            h.redraw('main');
        });
    }

    /* ------------------------------------------------------------------ rendering */

    function banners() {
        var T = t(), html = '';
        if (N.countdown) {
            html += N.countdown.expired
                ? '<div class="k-banner warn" style="margin:0">' + h.icon(h.ICONS.warn, 20) + '<span>' + h.esc(T.netReverted) + '</span></div>'
                : '<div class="k-banner info k-countdown" style="margin:0">' + h.icon(h.ICONS.info, 20) +
                  '<div style="flex:1 1 auto"><b>' + h.esc(T.netConfirmTitle) + '</b><div>' + h.esc(T.netConfirmText) + '</div></div>' +
                  '<button type="button" class="k-btn primary" data-act="net:confirm">' + h.esc(T.netConfirmBtn) + ' (<span id="k-net-left">' + N.countdown.left + '</span>)</button></div>';
        }
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

    function viewWan() {
        var T = t(), w = N.data.wan, f = N.wan;
        if (!w.exists) {
            return '<div class="k-card k-empty">' + h.esc(T.wanMissing) + '</div>';
        }
        var html = '<div class="k-stack k-narrow"><section class="k-card"><div class="k-setting" style="padding:0;border:none;flex-wrap:wrap">' +
            '<div class="k-ibox big ' + (w.address ? 'on' : 'cut') + '">' + h.icon(GLOBE, 24) + '</div>' +
            '<div class="k-setting-text"><b style="font-size:16px">' + h.esc(w.address ? T.wanConnected : T.wanDown) + '</b>' +
            '<span class="muted">' + h.esc(T.wanVia[w.type] || w.type) + ' · ' + h.esc(w.port) + (w.vlan ? ' · VLAN ' + h.esc(w.vlan) : '') + (w.address ? ' · ' + h.esc(w.address) : '') + '</span></div>' +
            '<button type="button" class="k-btn" data-act="net:test"' + (N.testing ? ' disabled' : '') + '>' + h.icon(PULSE, 16) + h.esc(N.testing ? T.wanTesting : T.wanTest) + '</button></div>';
        if (N.test) {
            html += '<div class="k-banner ' + (N.test.ok ? 'ok' : 'warn') + '" style="margin:0;flex-direction:column;align-items:stretch">' +
                [['gateway', T.chkGateway], ['internet', T.chkInternet], ['dns', T.chkDns]].map(function (c) {
                    var r = N.test[c[0]] || {};
                    return '<div style="display:flex;gap:8px;align-items:center">' + h.icon(r.ok ? h.ICONS.ok : h.ICONS.close, 16) +
                        '<span style="flex:1 1 auto">' + h.esc(c[1]) + (r.address ? ' (' + h.esc(r.address) + ')' : '') + '</span>' +
                        '<span class="mono">' + (r.ok ? h.esc(String(r.ms)) + ' ms' : '—') + '</span></div>';
                }).join('') + '</div>';
        }
        html += '</section>';

        if (w.readonly) {
            return html + '<div class="k-banner info" style="margin:0">' + h.icon(h.ICONS.info, 20) + '<span>' +
                h.esc(w.reasons.indexOf('multiwan') >= 0 ? T.wanMulti : T.wanComplex) + '</span></div></div>';
        }

        /* connection types one below the other on the left, what the chosen one needs on the right */
        html += '<div class="k-wan"><section class="k-card k-wan-types"><h2>' + h.esc(T.wanType) + '</h2>' + ['dhcp', 'pppoe', 'static'].map(function (k) {
            var on = f.type === k;
            return '<button type="button" class="k-opt' + (on ? ' on' : '') + '" data-act="net:wantype" data-v="' + k + '" aria-pressed="' + on + '">' +
                '<b>' + h.esc(T.wt[k][0]) + '</b><span>' + h.esc(T.wt[k][1]) + '</span></button>';
        }).join('') + '</section>';
        html += '<section class="k-card k-wan-settings"><h2>' + h.esc(T.wanSettings(T.wt[f.type] ? T.wt[f.type][0] : '')) + '</h2>';
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
        if (f.type === 'dhcp') {
            html += '<div class="k-banner warn" style="margin:0">' + h.icon(h.ICONS.warn, 20) + '<span>' + h.esc(T.dhcpWarn) + '</span></div>';
        }
        html += '<div>' +
            '<div class="k-setting wrap"><div class="k-setting-text"><b>' + h.esc(T.wanPort) + '</b><span class="muted">' + h.esc(T.wanPortSub) + '</span></div>' +
            portChips(f.port, 'wanport') + '</div>' +
            '<div class="k-setting wrap"><div class="k-setting-text"><b>' + h.esc(T.vlanReq) + '</b><span class="muted">' + h.esc(T.vlanReqSub) + '</span></div>' +
            '<div class="k-row" style="align-items:center;gap:8px">' + (f.useVlan ? '<input type="text" inputmode="numeric" class="mono" style="width:90px" data-input="net:wan-vlan" value="' + h.esc(f.vlan) + '" aria-label="' + h.esc(T.vlanId) + '">' : '') +
            h.toggle(f.useVlan, 'data-act="net:wanvlan"', T.vlanReq) + '</div></div>' +
            '<div class="k-setting wrap"><div class="k-setting-text"><b>IPv6</b><span class="muted">' + h.esc(T.ipv6Sub) + '</span></div>' +
            '<div class="k-seg">' + [['auto', T.v6Auto], ['off', T.v6Off]].map(function (o) {
                return '<button type="button" class="' + (f.ipv6 === o[0] ? 'on' : '') + '" data-act="net:wanv6" data-v="' + o[0] + '">' + h.esc(o[1]) + '</button>';
            }).join('') + '</div></div></div></section></div>';

        var changed = JSON.stringify(N.wan) !== N.wanOrig;
        html += '<div class="k-row" style="justify-content:flex-end;align-items:center"><span class="muted">' + h.esc(T.netSafety) + '</span>' +
            '<button type="button" class="k-btn" data-act="net:wanreset"' + (changed ? '' : ' disabled') + '>' + h.esc(T.discard) + '</button>' +
            '<button type="button" class="k-btn primary" data-act="net:wanapply"' + (changed && !N.busy && !N.countdown ? '' : ' disabled') + '>' + h.esc(N.busy ? T.applying : T.netApply) + '</button></div>';
        return html + '</div>';
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

    /*
     * DHCP server of a network, for the edit ('edit') and the new network ('add') form alike:
     * the switch sits right at its label, the range and lease time follow in the same box.
     * o = { ip, dhcp, from, to, lease }
     */
    function dhcpBlock(o, pfx, bits) {
        var T = t(), def = defaultRange(o.ip, bits) || { from: T.edAuto, to: T.edAuto };
        function field(label, key, placeholder, width) {
            return '<label class="k-field"><span>' + h.esc(label) + '</span><input type="text" class="mono" style="width:' + width + 'px" inputmode="decimal" autocomplete="off" ' +
                'data-input="net:' + pfx + '-' + key + '" value="' + h.esc(o[key]) + '" placeholder="' + h.esc(placeholder) + '"></label>';
        }
        return '<div class="k-dhcp' + (o.dhcp ? ' on' : '') + '"><div class="k-dhcp-main">' +
            '<div class="k-dhcp-head">' + h.toggle(o.dhcp, 'data-act="net:' + pfx + '-dhcp"', T.edDhcp) +
            '<div><b>' + h.esc(T.edDhcp) + '</b><div class="muted">' + h.esc(o.dhcp ? T.edDhcpSub : T.edDhcpOff) + '</div></div></div>' +
            (o.dhcp ? '<div class="k-dhcp-fields">' + field(T.edDhcpFrom, 'from', def.from, 160) + field(T.edDhcpTo, 'to', def.to, 160) + field(T.edLease, 'lease', T.edLeaseDefault, 130) + '</div>' : '') +
            '</div>' + (o.dhcp ? '<div class="muted small">' + h.esc(T.edDhcpHint) + '</div>' : '') + '</div>';
    }

    /* gateway address and DHCP side by side, both only as wide as their content */
    function addrRow(o, pfx, bits) {
        return '<div class="k-row k-addr"><label class="k-field"><span>' + h.esc(t().edGw) + '</span>' +
            '<input type="text" class="mono" style="width:200px" inputmode="decimal" autocomplete="off" data-input="net:' + pfx + '-ip" value="' + h.esc(o.ip) + '"></label>' +
            dhcpBlock(o, pfx, bits) + '</div>';
    }

    function approvalOn(key) {
        return !!(draft().approval || {})[key];
    }

    function netCard(n) {
        var T = t(), kind = kindOf(n.key), editing = N.edit && N.edit.key === n.key;
        var html = '<section class="k-card k-net-card" style="border-top:4px solid ' + KIND_COLOR[kind] + '">' +
            '<div class="k-setting" style="padding:0;border:none">' + dot(KIND_COLOR[kind]) +
            '<div class="k-setting-text"><b style="font-size:16px">' + h.esc(n.name) + '</b><span class="muted">' + h.esc(T.netKinds[kind]) + '</span></div>' +
            (n.readonly ? '<span class="k-badge">' + h.esc(T.readonly) + '</span>' :
                '<button type="button" class="k-btn small" data-act="net:edit" data-v="' + n.key + '">' + h.esc(editing ? T.close : T.netEdit) + '</button>') + '</div>' +
            '<div>' +
            '<div class="k-kv"><span class="muted">' + h.esc(T.netLink) + '</span><span class="mono">' + h.esc(n.mode === 'vlan' ? 'VLAN ' + n.vlan + ' · ' + n.port : n.port + ' · ' + T.untagged) + '</span></div>' +
            '<div class="k-kv"><span class="muted">' + h.esc(T.netAddr) + '</span><span class="mono">' + h.esc(n.ip ? n.ip + '/' + n.subnet : '—') + '</span></div>' +
            '<div class="k-kv"><span class="muted">DHCP</span><span class="mono">' + h.esc(n.dhcp ? n.dhcp.from + ' – ' + n.dhcp.to + (n.dhcp.lease != null ? ' · ' + T.leaseShort(n.dhcp.lease) : '') : T.off) + '</span></div>' +
            (approvalOn(n.key) ? '<div class="k-kv"><span class="muted">' + h.esc(T.apprCard) + '</span><span>' + h.esc(T.on) + '</span></div>' : '') +
            '</div></section>';
        return html;
    }

    function editPanel() {
        var T = t(), e = N.edit, n = N.data.networks.filter(function (x) { return x.key === e.key; })[0];
        if (!n) { return ''; }
        var kind = kindOf(n.key);
        var d0 = n.dhcp || {};
        var changed = e.ip !== n.ip || e.dhcp !== !!n.dhcp ||
            (e.dhcp && (e.from !== (d0.from || '') || e.to !== (d0.to || '') || e.lease !== (d0.lease == null ? '' : String(d0.lease))));
        var prot = (draft().general.interfaces || []).indexOf(n.key) >= 0, appr = approvalOn(n.key);
        return '<section class="k-card k-edit"><h2>' + h.esc(T.edTitle(n.name)) + '</h2>' +
            '<div class="k-field"><span>' + h.esc(T.edType) + '</span><div class="k-chips">' + KINDS.map(function (k) {
                return '<button type="button" class="k-chip' + (kind === k ? ' on' : '') + '" data-act="net:kind" data-v="' + k + '">' + dot(KIND_COLOR[k]) + h.esc(T.netKinds[k]) + '</button>';
            }).join('') + '</div></div>' +
            /* new devices wait for approval: a pending change like the type, enforced by a firewall rule */
            '<div class="k-dhcp' + (appr ? ' on' : '') + '" style="align-self:flex-start"><div class="k-dhcp-head">' +
            h.toggle(appr, 'data-act="net:approval"' + (prot || appr ? '' : ' disabled'), T.edApproval) +
            '<div><b>' + h.esc(T.edApproval) + '</b><div class="muted">' + h.esc(prot || appr ? T.edApprovalSub : T.edApprovalNotProtected) + '</div></div></div>' +
            (appr ? '<div class="muted small">' + h.esc(T.edApprovalNote) + '</div>' : '') + '</div>' +
            '<span class="muted">' + h.esc(T.edTypeHint) + '</span>' +
            '<div class="k-sep"></div>' +
            addrRow(e, 'edit', n.subnet) +
            (n.key === 'lan' ? '<div class="k-banner warn" style="margin:0">' + h.icon(h.ICONS.warn, 20) + '<span>' + h.esc(T.lanChangeWarn) + '</span></div>' : '') +
            '<div class="k-row" style="justify-content:space-between;align-items:center">' +
            (n.created ? '<button type="button" class="k-btn" style="color:#9A3B0A;border-color:#F2C99B" data-act="net:delete" data-v="' + n.key + '"' + (N.busy || N.countdown ? ' disabled' : '') + '>' + h.esc(T.edDelete) + '</button>' : '<span class="muted">' + h.esc(T.notCreated) + '</span>') +
            '<button type="button" class="k-btn primary" data-act="net:editapply"' + (changed && !N.busy && !N.countdown ? '' : ' disabled') + '>' + h.esc(N.busy ? T.applying : T.netApply) + '</button></div></section>';
    }

    function addPanel() {
        var T = t(), a = N.add;
        return '<section class="k-card k-edit"><h2>' + h.esc(T.netAdd) + '</h2>' +
            '<div class="k-row"><label class="k-field"><span>' + h.esc(T.edName) + '</span><input type="text" maxlength="16" data-input="net:add-name" value="' + h.esc(a.name) + '"></label>' +
            '<div class="k-field"><span>' + h.esc(T.edType) + '</span><div class="k-chips">' + KINDS.map(function (k) {
                return '<button type="button" class="k-chip' + (a.kind === k ? ' on' : '') + '" data-act="net:add-kind" data-v="' + k + '">' + dot(KIND_COLOR[k]) + h.esc(T.netKinds[k]) + '</button>';
            }).join('') + '</div></div></div>' +
            '<div class="k-field"><span>' + h.esc(T.edConn) + '</span><div class="k-row" style="align-items:center"><div class="k-seg">' +
            [['vlan', T.edVlanMode], ['port', T.edPortMode]].map(function (o) {
                return '<button type="button" class="' + (a.mode === o[0] ? 'on' : '') + '" data-act="net:add-mode" data-v="' + o[0] + '">' + h.esc(o[1]) + '</button>';
            }).join('') + '</div>' +
            (a.mode === 'vlan' ? '<label class="k-row" style="align-items:center;gap:8px"><span>' + h.esc(T.edVlanId) + '</span><input type="text" inputmode="numeric" class="mono" style="width:90px" data-input="net:add-vlan" value="' + h.esc(a.vlan) + '"></label>' : '') +
            '</div><span class="muted">' + h.esc(a.mode === 'vlan' ? T.edParentFor : T.edPortFor) + '</span>' +
            portChips(a.port, 'add-port', function (p) { return a.mode === 'port' && (p.untagged || p.vlans.length); }) +
            (a.mode === 'vlan' ? '<span class="muted">' + h.esc(T.vlanNote) + '</span>' : '') + '</div>' +
            addrRow(a, 'add', 24) +
            '<div class="k-row" style="justify-content:flex-end;align-items:center"><span class="muted">' + h.esc(T.netSafety) + '</span>' +
            '<button type="button" class="k-btn" data-act="net:add-cancel">' + h.esc(T.discard) + '</button>' +
            '<button type="button" class="k-btn primary" data-act="net:add-apply"' + (!N.busy && !N.countdown && a.port && a.ip ? '' : ' disabled') + '>' + h.esc(N.busy ? T.applying : T.netCreate) + '</button></div></section>';
    }

    function matrix() {
        var T = t(), nets = N.data.networks.filter(function (n) { return !n.readonly; });
        if (nets.length < 1) { return ''; }
        var cols = nets.map(function (n) { return n.key; }).concat(['wan']);
        var acc = draft().access;
        return '<section class="k-card"><div><h2>' + h.esc(T.accTitle) + '</h2><div class="muted">' + h.esc(T.accSub) + '</div></div>' +
            '<div style="overflow-x:auto"><table class="k-matrix"><thead><tr><th class="muted small">' + h.esc(T.accFrom) + '</th>' +
            cols.map(function (c) { return '<th>' + (c === 'wan' ? dot('#16A34A') : dot(KIND_COLOR[kindOf(c)])) + h.esc(netName(c)) + '</th>'; }).join('') + '</tr></thead><tbody>' +
            nets.map(function (r) {
                return '<tr><th>' + dot(KIND_COLOR[kindOf(r.key)]) + h.esc(r.name) + '</th>' + cols.map(function (c) {
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
            (N.add ? '' : '<button type="button" class="k-card k-add-card" data-act="net:add-open">' + h.icon(PLUS, 22) + '<b>' + h.esc(T.netAdd) + '</b><span class="muted">' + h.esc(T.netAddSub) + '</span></button>') + '</div>';
        if (N.edit) { html += editPanel(); }
        if (N.add) { html += addPanel(); }
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
                case 'confirm': confirm(); return null;
                case 'test':
                    N.testing = true;
                    h.api('GET', '/api/inversapanel/network/test').then(function (r) { N.test = r; }, function () { N.test = { ok: false }; })
                        .then(function () { N.testing = false; h.redraw('main'); });
                    return 'main';
                case 'wantype': f.type = v; return 'main';
                case 'wanport': f.port = v; return 'main';
                case 'wanvlan': f.useVlan = !f.useVlan; if (!f.useVlan) { f.vlan = ''; } return 'main';
                case 'wanv6': f.ipv6 = v; return 'main';
                case 'wanreset': load().then(function () { h.redraw('main'); }); return null;
                case 'wanapply':
                    netApply({ wan: { type: f.type, port: f.port, vlan: f.useVlan ? f.vlan : '', username: f.username, password: f.password, ip: f.ip, gateway: f.gateway, ipv6: f.ipv6 } });
                    return null;
                case 'edit':
                    var n = N.data.networks.filter(function (x) { return x.key === v; })[0];
                    N.edit = N.edit && N.edit.key === v ? null : { key: v, ip: n.ip, dhcp: !!n.dhcp,
                        from: n.dhcp ? n.dhcp.from : '', to: n.dhcp ? n.dhcp.to : '', lease: n.dhcp && n.dhcp.lease != null ? String(n.dhcp.lease) : '' };
                    N.add = null;
                    return 'main';
                case 'edit-dhcp': N.edit.dhcp = !N.edit.dhcp; return 'main';
                case 'approval':
                    draft().approval = draft().approval || {};
                    draft().approval[N.edit.key] = !approvalOn(N.edit.key);
                    return 'main';
                case 'kind': draft().kinds[N.edit.key] = v; return 'main';
                case 'editapply':
                    var upd = {};
                    upd[N.edit.key] = { ip: N.edit.ip, dhcp: N.edit.dhcp, dhcp_from: N.edit.from, dhcp_to: N.edit.to, lease: N.edit.lease };
                    netApply({ update: upd });
                    return null;
                case 'delete':
                    if (window.confirm(t().edDeleteConfirm(netName(v)))) { netApply({ 'delete': [v] }); }
                    return null;
                case 'add-open':
                    var used = [];
                    N.data.ports.forEach(function (p) { p.vlans.forEach(function (x) { used.push(Number(x.tag)); }); });
                    var tag = 20;
                    while (used.indexOf(tag) >= 0) { tag += 10; }
                    var lanPort = (N.data.networks.filter(function (x) { return x.key === 'lan'; })[0] || {}).port || (N.data.ports[0] || {}).device;
                    N.add = { name: 'IOT', kind: 'iot', mode: 'vlan', port: lanPort, vlan: String(tag), ip: '192.168.' + tag + '.1', dhcp: true, from: '', to: '', lease: '' };
                    N.edit = null;
                    return 'main';
                case 'add-kind':
                    N.add.kind = v;
                    N.add.name = ({ home: 'HOME', iot: 'IOT', guest: 'GUEST', camera: 'CAMERA', server: 'SERVER' })[v];
                    return 'main';
                case 'add-mode': N.add.mode = v; return 'main';
                case 'add-port': N.add.port = v; return 'main';
                case 'add-dhcp': N.add.dhcp = !N.add.dhcp; return 'main';
                case 'add-cancel': N.add = null; return 'main';
                case 'add-apply':
                    var a = N.add;
                    netApply({ add: [{ name: a.name, kind: a.kind, mode: a.mode, port: a.port, vlan: a.vlan, ip: a.ip,
                        dhcp: a.dhcp, dhcp_from: a.dhcp ? a.from : '', dhcp_to: a.dhcp ? a.to : '', lease: a.dhcp ? a.lease : '' }] });
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
            var map = { 'wan-username': [f, 'username'], 'wan-password': [f, 'password'], 'wan-ip': [f, 'ip'], 'wan-gateway': [f, 'gateway'], 'wan-vlan': [f, 'vlan'] };
            if (map[name]) {
                map[name][0][map[name][1]] = name === 'wan-vlan' ? val.replace(/[^0-9]/g, '').slice(0, 4) : val.trim();
            } else if (name === 'edit-ip' && N.edit) {
                N.edit.ip = val.trim();
            } else if (/^(edit|add)-(from|to|lease)$/.test(name) && N[name.split('-')[0]]) {
                var form = N[name.split('-')[0]], key = name.split('-')[1];
                form[key] = key === 'lease' ? val.replace(/[^0-9.,]/g, '').replace(',', '.') : val.replace(/[^0-9.]/g, '');
            } else if (name === 'add-name' && N.add) {
                N.add.name = val.toUpperCase().replace(/[^A-Z0-9_]/g, '');
            } else if (name === 'add-vlan' && N.add) {
                N.add.vlan = val.replace(/[^0-9]/g, '').slice(0, 4);
            } else if (name === 'add-ip' && N.add) {
                N.add.ip = val.trim();
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
            Object.keys(Object.assign({}, s.approval, d.approval)).forEach(function (k) {
                var before = !!(s.approval || {})[k], after = !!(d.approval || {})[k];
                if (before !== after) {
                    add(netName(k) + ' · ' + T.edApproval, before ? T.on : T.off, after ? T.on : T.off, function () { d.approval[k] = before; });
                }
            });
            Object.keys(d.kinds).forEach(function (k) {
                var before = s.kinds[k] || 'home';
                if (d.kinds[k] !== before) {
                    add(netName(k) + ' · ' + T.edType, T.netKinds[before], T.netKinds[d.kinds[k]], function () {
                        if (s.kinds[k] === undefined) { delete d.kinds[k]; } else { d.kinds[k] = s.kinds[k]; }
                    });
                }
            });
        }
    }));
})();
