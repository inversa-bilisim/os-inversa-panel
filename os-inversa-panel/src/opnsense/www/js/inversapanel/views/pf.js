/*
 * SPDX-License-Identifier: BSD-2-Clause
 * Copyright (C) 2026 Inversa Bilişim
 *
 * Port forwarding on top of OPNsense's NAT port forward rules. Adding, switching and deleting
 * act immediately (like in Firewall > NAT); complex existing rules are listed read-only.
 * The outer port suggests the ports people forward most and fills in name, inner port and protocol.
 */
(function () {
    'use strict';
    var h = window.InversaPanelApp.h;
    var ICON = 'M4 7h11M11 3l4 4-4 4M20 17H9M13 13l-4 4 4 4';
    var TRASH = 'M4 7h16M10 11v6M14 11v6M6 7l1 13a1 1 0 0 0 1 1h8a1 1 0 0 0 1-1l1-13M9 7V4h6v3';
    /* ports people forward most; their names come from the language file (pfPorts), the rest from here */
    var KNOWN = [['443', 'tcp'], ['80', 'tcp'], ['22', 'tcp'], ['3389', 'tcp'], ['5900', 'tcp'], ['21', 'tcp'], ['25', 'tcp'], ['8080', 'tcp'], ['8123', 'tcp'],
        ['554', 'tcp'], ['32400', 'tcp'], ['25565', 'tcp'], ['27015', 'tcp/udp'], ['3074', 'tcp/udp'], ['1194', 'udp'], ['51820', 'udp']];

    var P = { data: null, form: { name: '', autoName: '', protocol: 'tcp', port: '', target_port: '', target: '' }, open: false, busy: false, error: null };

    /* the known ports that start with what was typed */
    function suggestions() {
        var typed = P.form.port, names = h.T().pfPorts;
        return KNOWN.filter(function (k) { return k[0].indexOf(typed) === 0; }).map(function (k) { return { port: k[0], proto: k[1], name: names[k[0]] || k[0] }; });
    }

    /* a known port brings its name, the same inner port and its protocol, unless those were typed by hand */
    function applyKnown() {
        var f = P.form, hit = KNOWN.filter(function (k) { return k[0] === f.port; })[0];
        if (!hit) { return; }
        var name = h.T().pfPorts[hit[0]] || '';
        if (!f.name || f.name === f.autoName) { f.name = name; f.autoName = name; }
        if (!f.target_port || f.target_port === f.autoPort) { f.target_port = hit[0]; f.autoPort = hit[0]; }
        f.protocol = hit[1];
    }

    function load() {
        return h.api('GET', '/api/inversapanel/portforward/list').then(function (data) { P.data = data; });
    }

    function deviceFor(ip) {
        var hosts = h.hosts();
        for (var i = 0; i < hosts.length; i++) {
            if (hosts[i].ips.indexOf(ip) >= 0) { return h.devName(hosts[i]); }
        }
        return '';
    }

    function call(url, payload) {
        P.busy = true;
        P.error = null;
        h.redraw('main');
        return h.api('POST', url, payload || {}).then(function (res) {
            if (res.status !== 'ok') { P.error = res.message || h.T().applyFailed; }
            return load();
        }, function (err) {
            P.error = (err && err.errorMessage) || h.T().applyFailed;
        }).then(function () {
            P.busy = false;
            h.redraw('main');
        });
    }

    window.InversaPanelApp.register({
        key: 'pf',
        icon: ICON,
        label: function (T) { return T.tabPf; },
        load: load,
        render: function () {
            var T = h.T(), f = P.form;
            var html = '<div class="k-stack"><div><h1>' + h.esc(T.pfTitle) + '</h1><div class="muted" style="font-size:14px;margin-top:4px">' + h.esc(T.pfSub) + '</div></div>';
            if (!P.data) { return html + '<div class="k-loading">…</div></div>'; }
            if (P.error) { html += '<div class="k-banner err" style="margin:0">' + h.icon(h.ICONS.warn, 20) + '<span>' + h.esc(P.error) + '</span></div>'; }

            var targets = h.hosts().filter(function (x) { return x.ips.length && x.ips[0].indexOf(':') < 0; });
            var list = P.open ? suggestions() : [], dev = deviceFor(f.target);
            html += '<section class="k-card k-nform"><div class="k-card-head"><h2>' + h.esc(T.pfNew) + '</h2><span class="muted small">' + h.esc(T.pfWanIs(P.data.wan_address || '—')) + '</span></div>' +
                '<div class="k-pfline">' +
                '<div class="k-nf k-combo"><span class="k-nl">' + h.esc(T.pfExt) + '</span><input type="text" inputmode="numeric" class="mono" style="width:92px" autocomplete="off" data-input="pf:port" data-act="pf:open" value="' + h.esc(f.port) + '" aria-label="' + h.esc(T.pfExt) + '">' +
                (list.length ? '<div class="k-combo-list" role="listbox">' + list.map(function (o) {
                    return '<button type="button" class="k-combo-item" role="option" data-act="pf:pick" data-v="' + o.port + '"><span class="mono">' + o.port + '</span><span>' + h.esc(o.name) + '</span></button>';
                }).join('') + '<div class="k-combo-hint">' + h.esc(T.pfListHint) + '</div></div>' : '') + '</div>' +
                '<span class="k-pfarrow" aria-hidden="true">→</span>' +
                '<label class="k-nf k-pfgrow"><span class="k-nl">' + h.esc(T.pfTarget) + (dev ? ' · <span style="font-weight:400">' + h.esc(dev) + '</span>' : '') + '</span>' +
                '<input type="text" class="mono" list="k-pf-devices" autocomplete="off" data-input="pf:target" value="' + h.esc(f.target) + '" placeholder="' + h.esc(T.pfTargetPh) + '">' +
                '<datalist id="k-pf-devices">' + targets.map(function (x) { return '<option value="' + h.esc(x.ips[0]) + '">' + h.esc(h.devName(x)) + '</option>'; }).join('') + '</datalist></label>' +
                '<label class="k-nf"><span class="k-nl">' + h.esc(T.pfInt) + '</span><input type="text" inputmode="numeric" class="mono" style="width:92px" data-input="pf:target_port" value="' + h.esc(f.target_port) + '" placeholder="' + h.esc(f.port) + '"></label>' +
                '<div class="k-nf"><span class="k-nl">' + h.esc(T.pfProto) + '</span><div class="k-seg">' + [['tcp', 'TCP'], ['udp', 'UDP'], ['tcp/udp', 'TCP+UDP']].map(function (o) {
                    return '<button type="button" class="' + (f.protocol === o[0] ? 'on' : '') + '" data-act="pf:proto" data-v="' + o[0] + '">' + o[1] + '</button>';
                }).join('') + '</div></div>' +
                '<label class="k-nf k-pfgrow"><span class="k-nl">' + h.esc(T.colName) + '</span><input type="text" maxlength="64" data-input="pf:name" value="' + h.esc(f.name) + '" placeholder="' + h.esc(T.pfNamePh) + '"></label>' +
                '<button type="button" class="k-btn primary" data-act="pf:add"' + (P.busy || !f.target || !f.port ? ' disabled' : '') + '>' + h.esc(T.add) + '</button></div></section>';

            html += '<section class="k-card k-nform"><div class="k-card-head"><h2>' + h.esc(T.pfRules) + '</h2><span class="muted small">' + h.esc(T.pfCount(P.data.rules.length)) + '</span></div>';
            if (!P.data.rules.length) {
                html += '<div class="muted">' + h.esc(T.pfEmpty) + '</div>';
            } else {
                html += '<div style="overflow-x:auto"><table class="k-pftable"><thead><tr><th>' + h.esc(T.colName) + '</th><th>' + h.esc(T.pfExt) + '</th><th>' + h.esc(T.pfTo) + '</th><th>' + h.esc(T.colDevice) + '</th><th></th></tr></thead><tbody>' +
                    P.data.rules.map(function (r) {
                        return '<tr class="' + (r.enabled ? '' : 'dim') + '"><td><b>' + h.esc(r.name || '—') + '</b></td>' +
                            '<td class="mono">' + h.esc(r.protocol.toUpperCase().replace('/', '+') + ' ' + (r.port || '*')) + '</td>' +
                            '<td class="mono">→ ' + h.esc(r.target + ':' + r.target_port) + '</td><td>' + h.esc(deviceFor(r.target) || '—') + '</td>' +
                            '<td><span class="k-pfacts">' + (r.simple ? '<button type="button" class="k-icon-btn" data-act="pf:del" data-v="' + r.uuid + '" aria-label="' + h.esc(T.removeAria(r.name)) + '"' + (P.busy ? ' disabled' : '') + '>' + h.icon(TRASH, 16) + '</button>' :
                                '<span class="k-badge">' + h.esc(T.readonly) + '</span>') +
                            h.toggle(r.enabled, 'data-act="pf:toggle" data-v="' + r.uuid + '"' + (P.busy ? ' disabled' : ''), r.name) + '</span></td></tr>';
                    }).join('') + '</tbody></table></div>';
            }
            html += '<div class="k-pffoot"><span class="muted small"><b>' + h.esc(T.upnpTitle) + ':</b> ' + h.esc(T.upnpDesc) + '</span>' +
                '<span class="k-badge">' + h.esc(!P.data.upnp.installed ? T.upnpMissing : (P.data.upnp.enabled ? T.on : T.off)) + '</span></div></section>';
            return html + '</div>';
        },
        act: function (name, el) {
            var v = el.getAttribute('data-v'), f = P.form;
            switch (name) {
                case 'open': P.open = true; return 'main-keepfocus';
                case 'pick':
                    f.port = v;
                    P.open = false;
                    applyKnown();
                    return 'main';
                case 'proto': f.protocol = v; return 'main';
                case 'add':
                    P.open = false;
                    call('/api/inversapanel/portforward/add', { name: f.name || 'Port ' + f.port, protocol: f.protocol, port: f.port, target: f.target, target_port: f.target_port || f.port });
                    return null;
                case 'toggle':
                    var rule = P.data.rules.filter(function (r) { return r.uuid === v; })[0];
                    call('/api/inversapanel/portforward/toggle/' + v, { enabled: !rule.enabled });
                    return null;
                case 'del':
                    if (window.confirm(h.T().pfDelConfirm)) { call('/api/inversapanel/portforward/del/' + v); }
                    return null;
            }
            return null;
        },
        input: function (name, el, type) {
            if (['name', 'port', 'target_port', 'target'].indexOf(name) < 0) { return null; }
            P.form[name] = name === 'port' || name === 'target_port' ? el.value.replace(/[^0-9]/g, '').slice(0, 5) : el.value.trim();
            if (name === 'port') {
                /* the list narrows while typing; a port it knows fills in the rest */
                if (type === 'change') { return null; }
                P.open = true;
                applyKnown();
                return 'main-keepfocus';
            }
            P.open = false;
            return type === 'change' ? 'main' : null;
        }
    });
})();
