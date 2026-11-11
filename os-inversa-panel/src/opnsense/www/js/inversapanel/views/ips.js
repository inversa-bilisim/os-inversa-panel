/*
 * SPDX-License-Identifier: BSD-2-Clause
 * Copyright (C) 2026 Inversa Bilişim
 *
 * Attack protection: Suricata (OPNsense's intrusion detection) on the protected networks.
 * One switch, "alert only" or "block", what kinds of attack to look for, and the latest alerts
 * with the name of the device they concern. An intrusion detection that was set up in OPNsense
 * itself is only shown here, never changed.
 */
(function () {
    'use strict';
    var h = window.InversaPanelApp.h;
    var ICON = 'M12 3l8 3v6c0 5-3.5 8-8 9-4.5-1-8-4-8-9V6zM12 8v5M12 16h.01';
    var GROUPS = ['malware', 'attackers', 'exploits', 'phishing', 'scan'];

    var Q = { status: null, timer: null };

    function load() {
        return h.api('GET', '/api/inversapanel/ips/status').then(function (data) {
            Q.status = data;
            /* keep the state and the alerts fresh while this tab is open (faster while rules are fetched) */
            if (Q.timer) { clearTimeout(Q.timer); }
            Q.timer = setTimeout(function () {
                Q.timer = null;
                if (h.S().tab === 'ips' && !document.hidden) {
                    load().then(function () { h.redraw('main-keepfocus'); }, function () {});
                }
            }, data && data.state === 'preparing' ? 8000 : 30000);
        });
    }

    /* which end of an alert is one of our devices */
    function hostByIp() {
        var map = {};
        h.hosts().forEach(function (x) { (x.ips || []).forEach(function (ip) { map[ip] = x; }); });
        return map;
    }

    /*
     * the same thing reported over and over is one line with a count; newest first
     * @return [{msg, blocked, device, local, remote, port, count, time}]
     */
    function grouped(alerts) {
        var hosts = hostByIp(), seen = {}, list = [];
        alerts.forEach(function (a) {
            var srcOurs = !!hosts[a.src], dstOurs = !!hosts[a.dst];
            var local = srcOurs ? a.src : (dstOurs ? a.dst : '');
            var remote = srcOurs ? a.dst : (dstOurs ? a.src : a.src + ' → ' + a.dst);
            var key = a.sid + '|' + local + '|' + remote + '|' + (a.blocked ? 1 : 0);
            if (seen[key]) { seen[key].count++; return; }
            seen[key] = {
                msg: a.msg, blocked: a.blocked, local: local, remote: remote, count: 1, time: a.time,
                device: local ? h.devName(hosts[local]) : '',
                /* the port on the far side says what was talked to (443, 25, ...) */
                port: srcOurs ? a.dport : (dstOurs ? a.sport : a.dport)
            };
            list.push(seen[key]);
        });
        return list;
    }

    function stateLine(T, d, saved, st) {
        if (!d.enabled) { return [T.off, 'muted', '']; }
        if (!saved.enabled) { return [T.ipsAfterApply, 'muted', '']; }
        if (st.state === 'preparing') { return [T.ipsPreparing, 'k-warn-text', '']; }
        if (st.state && st.state.indexOf('nomem') === 0) {
            var parts = st.state.split(' ');
            return [T.ipsNoMem(h.fmt(parts[1]), h.fmt(parts[2])), 'k-warn-text', 'retry'];
        }
        if (!st.running) { return [T.ipsStopped, 'k-warn-text', 'start']; }
        var text = (st.inline ? T.ipsRunningBlock : T.ipsRunningDetect) + ' · ' + T.ipsMemory(h.fmt(st.memory_mb));
        if (st.rules_updated) { text += ' · ' + T.ipsRules(h.ago(st.rules_updated)); }
        return [text, 'muted', ''];
    }

    window.InversaPanelApp.register({
        key: 'ips',
        icon: ICON,
        label: function (T) { return T.tabIps; },
        load: load,
        render: function () {
            var T = h.T(), d = h.S().draft.ips, saved = h.S().saved.ips, st = Q.status;
            var html = '<div class="k-stack"><div><h1>' + h.esc(T.ipsTitle) + '</h1><div class="muted" style="font-size:14px;margin-top:4px">' + h.esc(T.ipsSub) + '</div></div>';
            if (!st) { return html + '<div class="k-loading">…</div></div>'; }
            if (!st.available) {
                return html + '<div class="k-banner warn" style="margin:0">' + h.icon(h.ICONS.warn, 20) + '<span>' + h.esc(T.ipsUnavailable) + '</span></div></div>';
            }

            if (st.foreign) {
                /* set up in OPNsense itself: show, don't touch */
                html += '<div class="k-banner info" style="margin:0">' + h.icon(h.ICONS.info, 20) + '<span>' + h.esc(T.ipsForeign) + '</span></div>';
            } else {
                var line = stateLine(T, d, saved, st);
                var working = d.enabled && saved.enabled && st.running;
                /* what to do with a match; blocking is only offered where it can work */
                var canBlock = st.block && st.block.available;
                html += '<div class="k-row stretch"><section class="k-card k-half k-compact">' +
                    '<div class="k-setting"><div class="k-ibox' + (working ? ' on' : (d.enabled && saved.enabled ? ' cut' : '')) + '">' + h.icon(ICON, 20) + '</div>' +
                    '<div class="k-setting-text"><b>' + h.esc(T.ipsEnable) + '</b><span class="' + line[1] + '">' + h.esc(line[0]) + '</span></div>' +
                    (line[2] ? '<button type="button" class="k-btn small" data-act="ips:start"' + (Q.starting ? ' disabled' : '') + '>' + h.esc(line[2] === 'retry' ? T.ipsRetry : T.ipsStart) + '</button>' : '') +
                    h.toggle(d.enabled, 'data-act="ips:enabled"', T.ipsEnable) + '</div>' +
                    '<div class="k-setting wrap"><div class="k-setting-text"><b>' + h.esc(T.ipsMode) + '</b><span class="muted">' + h.esc(d.mode === 'block' ? T.ipsBlockDesc : T.ipsDetectDesc) + '</span>' +
                    (!canBlock ? '<span class="k-warn-text">' + h.esc(T.ipsBlockNo[(st.block || {}).reason || 'device'] || T.ipsBlockNo.device) + '</span>' : '') + '</div>' +
                    '<div class="k-seg">' + [['detect', T.ipsDetect], ['block', T.ipsBlock]].map(function (o) {
                        var off = o[0] === 'block' && !canBlock && d.mode !== 'block';
                        return '<button type="button" class="' + (d.mode === o[0] ? 'on' : '') + '" data-act="ips:mode" data-v="' + o[0] + '"' + (off ? ' disabled style="opacity:.45;cursor:not-allowed"' : '') + '>' + h.esc(o[1]) + '</button>';
                    }).join('') + '</div></div>' +
                    '<div class="k-setting wrap"><div class="k-setting-text"><b>' + h.esc(T.ipsWhere) + '</b><span class="muted">' + h.esc(T.ipsWhereHint) + '</span></div>' +
                    '<span class="mono">' + h.esc((st.devices || []).join(', ') || '—') + '</span></div></section>';

                html += '<section class="k-card k-half k-compact"><div class="k-card-head"><h2>' + h.esc(T.ipsGroups) + '</h2><span class="muted small">' + h.esc(T.ipsGroupsSub) + '</span></div><div>' +
                    GROUPS.map(function (g) {
                        var on = d.groups.indexOf(g) >= 0;
                        return '<div class="k-setting" title="' + h.esc(T.ipsG[g][1]) + '"><div class="k-setting-text"><b>' + h.esc(T.ipsG[g][0]) + '</b></div>' +
                            h.toggle(on, 'data-act="ips:group" data-v="' + g + '"', T.ipsG[g][0]) + '</div>';
                    }).join('') + '</div></section></div>';
            }

            /* alerts: also shown for an intrusion detection Inversa Panel does not manage */
            var showAlerts = st.foreign || saved.enabled || (st.alerts || []).length;
            if (showAlerts) {
                var day = Date.now() - 86400000;
                var recent = (st.alerts || []).filter(function (a) { return Date.parse(a.time) >= day; });
                var blocked = recent.filter(function (a) { return a.blocked; }).length;
                var rows = grouped(st.alerts || []).slice(0, 40);
                html += '<section class="k-card k-compact"><div class="k-card-head"><h2>' + h.esc(T.ipsAlerts) + '</h2><span class="muted small">' +
                    h.esc(T.ips24h(h.fmt(recent.length) + (st.more && recent.length === st.alerts.length ? '+' : ''), h.fmt(blocked))) + '</span></div>' +
                    (rows.length ? '<div>' + rows.map(function (r) {
                        return '<div class="k-alert"><span class="k-dot ' + (r.blocked ? 'ok' : 'warn') + '"></span>' +
                            '<b class="k-alert-dev">' + h.esc(r.device || r.remote) + '</b>' +
                            '<span class="muted mono small k-alert-addr">' + (r.device ? h.esc(r.local) + ' ⇄ ' + h.esc(r.remote) + (r.port ? ':' + r.port : '') : '') + '</span>' +
                            '<span class="k-alert-msg small" title="' + h.esc(r.msg) + '">' + h.esc(r.msg) + '</span>' +
                            '<span class="k-pill ' + (r.blocked ? 'ok' : 'warn') + '">' + h.esc(r.blocked ? T.ipsBlocked : T.ipsAlerted) + (r.count > 1 ? ' ×' + h.fmt(r.count) : '') + '</span>' +
                            '<span class="muted small k-alert-time">' + h.esc(h.ago(r.time)) + '</span></div>';
                    }).join('') + '</div>' : '<div class="muted" style="padding:8px 0">' + h.esc(T.ipsAlertsNone) + '</div>') +
                    '</section>';
            }
            if (!st.foreign) {
                html += '<div class="muted small">' + h.esc(T.ipsNote) + '</div>';
            }
            return html + '</div>';
        },
        act: function (name, el) {
            var d = h.S().draft.ips, v = el.getAttribute('data-v');
            switch (name) {
                case 'enabled': d.enabled = !d.enabled; return 'main';
                case 'mode':
                    if (v === 'block' && !(Q.status && Q.status.block && Q.status.block.available)) { return null; }
                    d.mode = v;
                    return 'main';
                case 'group':
                    d.groups = d.groups.indexOf(v) >= 0 ? d.groups.filter(function (g) { return g !== v; }) : d.groups.concat([v]);
                    return 'main';
                case 'start':
                    Q.starting = true;
                    h.api('POST', '/api/inversapanel/ips/start', {}).then(function () {
                        return new Promise(function (resolve) { setTimeout(resolve, 3000); });
                    }).then(load).catch(function () {}).then(function () { Q.starting = false; h.redraw('main'); });
                    return 'main';
            }
            return null;
        },
        changes: function (add, d, s) {
            var T = h.T(), a = d.ips, b = s.ips;
            if (!!a.enabled !== !!b.enabled) {
                add(T.ipsEnable, b.enabled ? T.on : T.off, a.enabled ? T.on : T.off, function () { a.enabled = b.enabled; });
            }
            if (a.mode !== b.mode) {
                var m = { detect: T.ipsDetect, block: T.ipsBlock };
                add(T.ipsMode, m[b.mode], m[a.mode], function () { a.mode = b.mode; });
            }
            GROUPS.forEach(function (g) {
                var now = a.groups.indexOf(g) >= 0, was = b.groups.indexOf(g) >= 0;
                if (now !== was) {
                    add(T.ipsGroups + ' · ' + T.ipsG[g][0], was ? T.on : T.off, now ? T.on : T.off, function () {
                        a.groups = was ? a.groups.concat([g]) : a.groups.filter(function (x) { return x !== g; });
                    });
                }
            });
        }
    });
})();
