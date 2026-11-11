/*
 * SPDX-License-Identifier: BSD-2-Clause
 * Copyright (C) 2026 Inversa Bilişim
 *
 * Port forwarding on top of OPNsense's NAT port forward rules. Adding, switching and deleting
 * act immediately (like in Firewall > NAT); complex existing rules are listed read-only.
 */
(function () {
    'use strict';
    var h = window.InversaPanelApp.h;
    var ICON = 'M4 7h11M11 3l4 4-4 4M20 17H9M13 13l-4 4 4 4';
    var TRASH = 'M4 7h16M10 11v6M14 11v6M6 7l1 13a1 1 0 0 0 1 1h8a1 1 0 0 0 1-1l1-13M9 7V4h6v3';
    var PRESETS = [['web', 'Web (HTTPS)', 'tcp', '443'], ['rdp', null, 'tcp', '3389'], ['mc', 'Minecraft', 'tcp', '25565'],
        ['plex', 'Plex', 'tcp', '32400'], ['ssh', 'SSH', 'tcp', '22'], ['custom', null, 'tcp', '']];

    var P = { data: null, form: { preset: 'web', name: 'Web (HTTPS)', protocol: 'tcp', port: '443', target_port: '443', target: '' }, busy: false, error: null };

    function load() {
        return h.api('GET', '/api/inversapanel/portforward/list').then(function (data) { P.data = data; });
    }

    function presetLabel(p) {
        var T = h.T();
        return p[1] || (p[0] === 'rdp' ? T.pfRdp : T.pfCustom);
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
            html += '<section class="k-card"><h2>' + h.esc(T.pfNew) + '</h2>' +
                '<div class="k-field"><span>' + h.esc(T.pfService) + '</span><div class="k-chips">' + PRESETS.map(function (p) {
                    return '<button type="button" class="k-chip' + (f.preset === p[0] ? ' on' : '') + '" data-act="pf:preset" data-v="' + p[0] + '">' + h.esc(presetLabel(p)) + '</button>';
                }).join('') + '</div></div>' +
                '<div class="k-field"><span>' + h.esc(T.pfTarget) + '</span><div class="k-chips">' + (targets.length ? targets.map(function (x) {
                    var ip = x.ips[0];
                    return '<button type="button" class="k-chip' + (f.target === ip ? ' on' : '') + '" data-act="pf:target" data-v="' + h.esc(ip) + '">' + h.esc(h.devName(x)) + ' <span class="muted mono">' + h.esc(ip) + '</span></button>';
                }).join('') : '<span class="muted">' + h.esc(T.noDevicesYet) + '</span>') + '</div></div>' +
                '<div class="k-row" style="align-items:flex-end">' +
                '<label class="k-field"><span>' + h.esc(T.colName) + '</span><input type="text" maxlength="64" data-input="pf:name" value="' + h.esc(f.name) + '"></label>' +
                '<label class="k-field"><span>' + h.esc(T.pfExt) + '</span><input type="text" inputmode="numeric" class="mono" style="width:110px" data-input="pf:port" value="' + h.esc(f.port) + '"></label>' +
                '<label class="k-field"><span>' + h.esc(T.pfInt) + '</span><input type="text" inputmode="numeric" class="mono" style="width:110px" data-input="pf:target_port" value="' + h.esc(f.target_port) + '"></label>' +
                '<label class="k-field"><span>' + h.esc(T.pfTargetIp) + '</span><input type="text" class="mono" style="width:150px" data-input="pf:target" value="' + h.esc(f.target) + '"></label>' +
                '<div class="k-field"><span>' + h.esc(T.pfProto) + '</span><div class="k-seg">' + [['tcp', 'TCP'], ['udp', 'UDP'], ['tcp/udp', 'TCP+UDP']].map(function (o) {
                    return '<button type="button" class="' + (f.protocol === o[0] ? 'on' : '') + '" data-act="pf:proto" data-v="' + o[0] + '">' + o[1] + '</button>';
                }).join('') + '</div></div></div>' +
                '<div class="k-row" style="justify-content:space-between;align-items:center"><span class="k-info mono">' +
                h.esc(T.internet + ' · ' + (P.data.wan_address || 'WAN') + ':' + (f.port || '?') + ' → ' + (deviceFor(f.target) || f.target || '?') + ':' + (f.target_port || '?')) + '</span>' +
                '<button type="button" class="k-btn primary" data-act="pf:add"' + (P.busy || !f.target || !f.port ? ' disabled' : '') + '>' + h.esc(T.pfAdd) + '</button></div>' +
                '<div class="muted small">' + h.esc(T.pfImmediate) + '</div></section>';

            html += '<section class="k-card"><div class="k-card-head"><h2>' + h.esc(T.pfRules) + '</h2><span class="muted">' + h.esc(T.pfWanIs(P.data.wan_address || '—')) + '</span></div>';
            if (!P.data.rules.length) {
                html += '<div class="muted">' + h.esc(T.pfEmpty) + '</div>';
            } else {
                html += P.data.rules.map(function (r) {
                    return '<div class="k-list-row' + (r.enabled ? '' : ' dim') + '"><div class="k-grow-text"><b>' + h.esc(r.name || '—') + '</b>' +
                        '<div class="muted mono">' + h.esc(r.protocol.toUpperCase() + ' ' + (r.port || '*') + ' → ' + (deviceFor(r.target) ? deviceFor(r.target) + ' · ' : '') + r.target + ':' + r.target_port) + '</div></div>' +
                        (r.simple ? '<button type="button" class="k-icon-btn" style="background:transparent" data-act="pf:del" data-v="' + r.uuid + '" aria-label="' + h.esc(T.removeAria(r.name)) + '"' + (P.busy ? ' disabled' : '') + '>' + h.icon(TRASH, 18) + '</button>' :
                            '<span class="k-badge">' + h.esc(T.readonly) + '</span>') +
                        h.toggle(r.enabled, 'data-act="pf:toggle" data-v="' + r.uuid + '"' + (P.busy ? ' disabled' : ''), r.name) + '</div>';
                }).join('');
            }
            html += '</section>';

            html += '<section class="k-card tight"><div class="k-setting"><div class="k-ibox">' + h.icon('M6 8h12a4 4 0 0 1 4 4v1a4 4 0 0 1-7 2.6H9A4 4 0 0 1 2 13v-1a4 4 0 0 1 4-4z', 20) + '</div>' +
                '<div class="k-setting-text"><b>' + h.esc(T.upnpTitle) + '</b><span class="muted">' + h.esc(T.upnpDesc) + '</span></div>' +
                '<span class="k-badge">' + h.esc(!P.data.upnp.installed ? T.upnpMissing : (P.data.upnp.enabled ? T.on : T.off)) + '</span></div></section>';
            return html + '</div>';
        },
        act: function (name, el) {
            var v = el.getAttribute('data-v'), f = P.form;
            switch (name) {
                case 'preset':
                    PRESETS.forEach(function (p) {
                        if (p[0] === v) { f.preset = v; f.name = p[0] === 'custom' ? '' : presetLabel(p); f.protocol = p[2]; f.port = p[3]; f.target_port = p[3]; }
                    });
                    return 'main';
                case 'target': f.target = v; return 'main';
                case 'proto': f.protocol = v; return 'main';
                case 'add':
                    call('/api/inversapanel/portforward/add', { name: f.name, protocol: f.protocol, port: f.port, target: f.target, target_port: f.target_port || f.port });
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
            P.form[name] = name === 'port' || name === 'target_port' ? el.value.replace(/[^0-9]/g, '') : el.value.trim();
            return type === 'change' ? 'main' : null;
        }
    });
})();
