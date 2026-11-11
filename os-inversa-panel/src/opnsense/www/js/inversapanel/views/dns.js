/*
 * SPDX-License-Identifier: BSD-2-Clause
 * Copyright (C) 2026 Inversa Bilişim
 *
 * DNS: local names (a name answered with an address of the internal network) and the servers
 * the firewall asks. Both are pending changes; the local names become Unbound host overrides,
 * the servers Unbound forward / DNS over TLS entries.
 */
(function () {
    'use strict';
    var h = window.InversaPanelApp.h;
    var ICON = 'M12 2a10 10 0 1 0 0 20a10 10 0 1 0 0-20zM2 12h20M12 2a15 15 0 0 1 0 20M12 2a15 15 0 0 0 0 20';
    var TRASH = 'M4 7h16M10 11v6M14 11v6M6 7l1 13a1 1 0 0 0 1 1h8a1 1 0 0 0 1-1l1-13M9 7V4h6v3';
    var ARROW = 'M5 12h14M13 6l6 6-6 6';
    var MODES = ['auto', 'cloudflare', 'google', 'quad9', 'custom'];
    var NAME_RE = /^(?=.{1,253}$)(?:[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?\.)*[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?$/;
    var IP4_RE = /^(25[0-5]|2[0-4]\d|1?\d?\d)(\.(25[0-5]|2[0-4]\d|1?\d?\d)){3}$/;

    var D = { form: null, name: '', ip: '', wildcard: false, error: null };

    function dns() { return h.S().draft.dns; }

    function isIp(v) {
        return IP4_RE.test(v) || (v.indexOf(':') >= 0 && /^[0-9a-f:.]{2,45}$/i.test(v));
    }

    /* a name as typed ("*.Example.com.", "https://example.com/x") => "example.com" */
    function cleanName(v) {
        return String(v || '').trim().toLowerCase().replace(/^[a-z]+:\/\//, '').replace(/[\/:].*$/, '').replace(/^\*\./, '').replace(/\.$/, '');
    }

    function deviceFor(ip) {
        var hosts = h.hosts();
        for (var i = 0; i < hosts.length; i++) {
            if (hosts[i].ips.indexOf(ip) >= 0) { return h.devName(hosts[i]); }
        }
        return '';
    }

    function presetServers(mode) {
        var p = (h.S().options.dns_presets || {})[mode];
        return p ? p.servers : [];
    }

    function addRecord() {
        var T = h.T(), d = dns(), name = cleanName(D.name), ip = D.ip.trim();
        var taken = d.records.concat(h.S().options.dns_foreign || []).some(function (r) { return r.name === name; });
        if (!NAME_RE.test(name)) { D.error = T.dnsBadName; }
        else if (!isIp(ip)) { D.error = T.dnsBadIp; }
        else if (taken) { D.error = T.dnsTaken(name); }
        else {
            d.records = d.records.concat([{ name: name, ip: ip, wildcard: !!D.wildcard }]);
            D.name = ''; D.ip = ''; D.wildcard = false; D.error = null;
        }
    }

    function recordRow(r, own) {
        var T = h.T(), dev = deviceFor(r.ip);
        return '<div class="k-list-row"><div class="k-grow-text"><span class="mono" style="font-weight:600">' + h.esc((r.wildcard ? '*.' : '') + r.name) + '</span>' +
            (r.wildcard ? ' <span class="k-badge" title="' + h.esc(T.dnsWildHint(r.name)) + '">' + h.esc(T.dnsWildShort) + '</span>' : '') + '</div>' +
            '<span class="k-dns-to">' + h.icon(ARROW, 16) + '<span class="mono">' + h.esc(r.ip) + '</span>' + (dev ? '<span class="muted">' + h.esc(dev) + '</span>' : '') + '</span>' +
            (own ? '<button type="button" class="k-icon-btn" style="background:transparent" data-act="dns:del" data-v="' + h.esc(r.name) + '" aria-label="' + h.esc(T.removeAria(r.name)) + '">' + h.icon(TRASH, 18) + '</button>' :
                '<span class="k-badge" title="' + h.esc(T.dnsForeignHint) + '">' + h.esc(T.readonly) + '</span>') + '</div>';
    }

    function viewRecords() {
        var T = h.T(), d = dns(), foreign = h.S().options.dns_foreign || [];
        var targets = h.hosts().filter(function (x) { return x.ips.length && x.ips[0].indexOf(':') < 0; });
        var html = '<section class="k-card"><div><h2>' + h.esc(T.dnsRecTitle) + '</h2><div class="muted">' + h.esc(T.dnsRecSub) + '</div></div>' +
            '<div class="k-dns-form">' +
            '<label class="k-field k-dns-name"><span>' + h.esc(T.dnsName) + '</span><input type="text" class="mono" data-input="dns:name" value="' + h.esc(D.name) + '" placeholder="nas.ev.lan" autocomplete="off" autocapitalize="off" spellcheck="false"></label>' +
            '<label class="k-field k-dns-ip"><span>' + h.esc(T.dnsIp) + '</span><input type="text" class="mono" data-input="dns:ip" value="' + h.esc(D.ip) + '" placeholder="192.168.1.20" list="k-dns-devices" autocomplete="off">' +
            '<datalist id="k-dns-devices">' + targets.map(function (x) { return '<option value="' + h.esc(x.ips[0]) + '">' + h.esc(h.devName(x)) + '</option>'; }).join('') + '</datalist></label>' +
            '<div class="k-dns-wild">' + h.toggle(D.wildcard, 'data-act="dns:wild"', T.dnsWild) +
            '<div><b>' + h.esc(T.dnsWild) + '</b><div class="muted">' + h.esc(T.dnsWildSub) + '</div></div></div>' +
            '<button type="button" class="k-btn primary" data-act="dns:add">' + h.esc(T.add) + '</button></div>' +
            (D.error ? '<div class="k-warn-text">' + h.esc(D.error) + '</div>' : '');
        html += d.records.length || foreign.length ?
            '<div>' + d.records.map(function (r) { return recordRow(r, true); }).join('') + foreign.map(function (r) { return recordRow(r, false); }).join('') + '</div>' :
            '<div class="muted">' + h.esc(T.dnsRecEmpty) + '</div>';
        return html + '<div class="muted small">' + h.esc(T.dnsRecNote) + '</div></section>';
    }

    function viewServers() {
        var T = h.T(), d = dns(), locked = h.S().options.dns_locked;
        var html = '<section class="k-card"><div><h2>' + h.esc(T.dnsSrvTitle) + '</h2><div class="muted">' + h.esc(T.dnsSrvSub) + '</div></div>';
        if (locked) {
            return html + '<div class="k-banner info" style="margin:0">' + h.icon(h.ICONS.info, 20) + '<span>' + h.esc(locked === 'system' ? T.dnsLockedSystem : T.dnsLockedForward) + '</span></div></section>';
        }
        html += '<div class="k-dns-modes">' + MODES.map(function (m) {
            var on = d.upstream === m, addr = presetServers(m).join(' · ');
            return '<button type="button" class="k-opt' + (on ? ' on' : '') + '" data-act="dns:mode" data-v="' + m + '" aria-pressed="' + on + '">' +
                '<b>' + h.esc(T.dnsModes[m][0]) + '</b><span>' + h.esc(T.dnsModes[m][1]) + '</span>' + (addr ? '<span class="mono small">' + h.esc(addr) + '</span>' : '') + '</button>';
        }).join('') + '</div>';
        if (d.upstream === 'custom') {
            html += '<label class="k-field" style="max-width:560px"><span>' + h.esc(T.dnsServers) + '</span>' +
                '<input type="text" class="mono" data-input="dns:servers" value="' + h.esc((d.servers || []).join(', ')) + '" placeholder="9.9.9.9, 149.112.112.112" autocomplete="off">' +
                '<span class="muted small" style="font-weight:400">' + h.esc(T.dnsServersHint) + '</span></label>';
        }
        if (d.upstream !== 'auto') {
            html += '<div><div class="k-setting wrap"><div class="k-setting-text"><b>' + h.esc(T.dnsDot) + '</b><span class="muted">' + h.esc(T.dnsDotSub) + '</span></div>' +
                h.toggle(!!d.dot, 'data-act="dns:dot"', T.dnsDot) + '</div>' +
                (d.upstream === 'custom' && d.dot ? '<div class="k-setting wrap"><div class="k-setting-text"><b>' + h.esc(T.dnsTlsName) + '</b><span class="muted">' + h.esc(T.dnsTlsNameSub) + '</span></div>' +
                    '<input type="text" class="mono" style="width:260px;max-width:100%" data-input="dns:tlsname" value="' + h.esc(d.tlsname || '') + '" placeholder="dns.example.net" autocomplete="off"></div>' : '') +
                '</div><div class="muted small">' + h.esc(T.dnsSafety) + '</div>';
        }
        return html + '</section>';
    }

    window.InversaPanelApp.register({
        key: 'dns',
        icon: ICON,
        label: function (T) { return T.tabDns; },
        render: function () {
            var T = h.T();
            return '<div class="k-stack k-narrow"><div><h1>' + h.esc(T.dnsTitle) + '</h1><div class="muted" style="font-size:14px;margin-top:4px">' + h.esc(T.dnsSub) + '</div></div>' +
                viewRecords() + viewServers() + '</div>';
        },
        act: function (name, el) {
            var d = dns(), v = el.getAttribute('data-v');
            switch (name) {
                case 'wild': D.wildcard = !D.wildcard; return 'main';
                case 'add': addRecord(); return 'main';
                case 'del': d.records = d.records.filter(function (r) { return r.name !== v; }); return 'main';
                case 'mode': if (MODES.indexOf(v) >= 0) { d.upstream = v; } return 'main';
                case 'dot': d.dot = !d.dot; return 'main';
            }
            return null;
        },
        input: function (name, el, type) {
            var d = dns();
            if (name === 'name') { D.name = el.value; return null; }
            if (name === 'ip') { D.ip = el.value; return null; }
            if (name === 'servers') {
                d.servers = el.value.split(/[\s,;]+/).map(function (x) { return x.trim().toLowerCase(); }).filter(function (x, i, all) { return isIp(x) && all.indexOf(x) === i; });
                return type === 'change' ? 'main' : 'pending';
            }
            if (name === 'tlsname') {
                d.tlsname = el.value.trim().toLowerCase();
                return 'pending';
            }
            return null;
        },
        /* Enter in the form adds the name */
        enter: function (name) {
            if (name === 'name' || name === 'ip') { addRecord(); return 'main'; }
            return null;
        },
        changes: function (add, d, s) {
            var T = h.T(), now = d.dns, was = s.dns;
            function show(r) { return (r.wildcard ? '*.' : '') + r.name + ' → ' + r.ip; }
            function same(a, b) { return a.name === b.name && a.ip === b.ip && !!a.wildcard === !!b.wildcard; }
            now.records.forEach(function (r) {
                if (!was.records.some(function (x) { return same(x, r); })) {
                    add(T.dnsRecTitle, '', show(r), function () { now.records = now.records.filter(function (x) { return x !== r; }); });
                }
            });
            was.records.forEach(function (r) {
                if (!now.records.some(function (x) { return same(x, r); })) {
                    add(T.dnsRecTitle, show(r), '', function () {
                        now.records = now.records.filter(function (x) { return x.name !== r.name; }).concat([h.clone(r)]);
                    });
                }
            });
            if (now.upstream !== was.upstream) {
                add(T.dnsSrvTitle, T.dnsModes[was.upstream][0], T.dnsModes[now.upstream][0], function () { now.upstream = was.upstream; });
            }
            if (now.upstream === 'custom' && (now.servers || []).join(',') !== (was.servers || []).join(',')) {
                add(T.dnsServers, (was.servers || []).join(', ') || '—', (now.servers || []).join(', ') || '—', function () { now.servers = (was.servers || []).slice(); });
            }
            if (now.upstream !== 'auto' && !!now.dot !== !!was.dot) {
                add(T.dnsDot, was.dot ? T.on : T.off, now.dot ? T.on : T.off, function () { now.dot = was.dot; });
            }
            if (now.upstream === 'custom' && now.dot && (now.tlsname || '') !== (was.tlsname || '')) {
                add(T.dnsTlsName, was.tlsname || '—', now.tlsname || '—', function () { now.tlsname = was.tlsname; });
            }
        }
    });
})();
