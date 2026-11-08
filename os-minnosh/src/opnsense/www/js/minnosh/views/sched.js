/*
 * SPDX-License-Identifier: BSD-2-Clause
 * Copyright (C) 2026 Inversa Bilişim
 *
 * Schedules: cut the internet or block apps for chosen devices on certain days and hours.
 * Part of the pending changes (saved with "Apply"); evaluated every minute on the firewall.
 */
(function () {
    'use strict';
    var h = window.MinnoshApp.h;
    var CLOCK = 'M12 2a10 10 0 1 0 0 20a10 10 0 1 0 0-20zM12 6v6l4 2';
    var TRASH = 'M4 7h16M10 11v6M14 11v6M6 7l1 13a1 1 0 0 0 1 1h8a1 1 0 0 0 1-1l1-13M9 7V4h6v3';
    var PLUS = 'M12 5v14M5 12h14';

    function draft() { return h.S().draft; }
    function saved() { return h.S().saved; }

    function minutes(hhmm) {
        var p = String(hhmm || '0:0').split(':');
        return Number(p[0]) * 60 + Number(p[1] || 0);
    }

    function appName(key) {
        var apps = h.S().options.apps || [];
        for (var i = 0; i < apps.length; i++) {
            if (apps[i].key === key) { return apps[i].name; }
        }
        return key;
    }

    function deviceLabel(mac) {
        var host = h.hostByMac(mac);
        if (host) { return h.devName(host); }
        var cfg = draft().devices[mac];
        return (cfg && cfg.name) || mac;
    }

    function summary(s) {
        var t = h.T(), days = (s.days || []).slice().sort();
        var dtxt;
        if (days.length === 7) { dtxt = t.schEvery; }
        else if (days.join() === '1,2,3,4,5') { dtxt = t.schWeekdays; }
        else if (days.join() === '6,7') { dtxt = t.schWeekend; }
        else if (!days.length) { dtxt = t.schNoDays; }
        else { dtxt = days.map(function (d) { return t.days[d - 1]; }).join(', '); }
        var act = s.action === 'cut' ? t.actCut : t.actApps + (s.apps.length ? ' (' + s.apps.map(appName).join(', ') + ')' : '');
        return dtxt + ' · ' + s.start + '–' + s.end + ' · ' + act + ' · ' + t.schDevCount(s.devices.length);
    }

    function week(s) {
        var segs = [[], [], [], [], [], [], []], a = minutes(s.start), b = minutes(s.end);
        (s.days || []).forEach(function (d) {
            var i = d - 1;
            if (a < b) { segs[i].push([a, b]); }
            else if (a > b) { segs[i].push([a, 1440]); segs[(i + 1) % 7].push([0, b]); }
        });
        var color = !s.enabled ? '#AEB6C1' : (s.action === 'cut' ? '#C2410C' : '#1F4FC7');
        return '<div class="k-week">' + h.T().days.map(function (label, i) {
            return '<div class="k-week-row"><span>' + h.esc(label) + '</span><div class="k-week-bar">' + segs[i].map(function (sg) {
                return '<i style="left:' + (sg[0] / 14.4).toFixed(2) + '%;width:' + ((sg[1] - sg[0]) / 14.4).toFixed(2) + '%;background:' + color + '"></i>';
            }).join('') + '</div></div>';
        }).join('') + '<div class="k-week-axis"><span>00</span><span>06</span><span>12</span><span>18</span><span>24</span></div></div>';
    }

    function chip(on, act, i, value, label, warn) {
        return '<button type="button" class="k-chip' + (on ? ' on' : '') + (warn && on ? ' warn' : '') + '" data-act="sched:' + act + '" data-i="' + i + '" data-v="' + h.esc(value) + '" aria-pressed="' + on + '">' + h.esc(label) + '</button>';
    }

    function card(s, i) {
        var t = h.T();
        var known = {};
        h.hosts().forEach(function (host) { known[host.mac] = h.devName(host); });
        Object.keys(draft().devices).forEach(function (mac) { if (!known[mac]) { known[mac] = deviceLabel(mac); } });
        s.devices.forEach(function (mac) { if (!known[mac]) { known[mac] = deviceLabel(mac); } });
        var devices = Object.keys(known).sort(function (a, b) { return known[a].localeCompare(known[b]); });

        var html = '<section class="k-card' + (s.enabled ? '' : ' dim') + '">' +
            '<div class="k-sched-head"><div class="k-ibox' + (s.enabled ? (s.action === 'cut' ? ' cut' : ' on') : '') + '">' + h.icon(CLOCK, 20) + '</div>' +
            '<div style="flex:1 1 240px;min-width:0"><input type="text" class="k-title-input" maxlength="64" data-input="sched:name" data-i="' + i + '" value="' + h.esc(s.name) + '" aria-label="' + h.esc(t.schName) + '">' +
            '<div class="muted">' + h.esc(summary(s)) + '</div></div>' +
            '<button type="button" class="k-icon-btn" style="background:transparent" data-act="sched:del" data-i="' + i + '" aria-label="' + h.esc(t.schDelete) + '">' + h.icon(TRASH, 18) + '</button>' +
            h.toggle(s.enabled, 'data-act="sched:enabled" data-i="' + i + '"', s.name) + '</div>';

        html += '<div class="k-row" style="gap:24px"><div class="k-grow" style="display:flex;flex-direction:column;gap:16px">';
        html += '<div class="k-field"><span>' + h.esc(t.schDevices) + '</span><div class="k-chips">' +
            (devices.length ? devices.map(function (mac) { return chip(s.devices.indexOf(mac) >= 0, 'dev', i, mac, known[mac]); }).join('') : '<span class="muted">' + h.esc(t.noDevicesYet) + '</span>') + '</div></div>';
        html += '<div class="k-field"><span>' + h.esc(t.schDays) + '</span><div class="k-chips">' +
            t.days.map(function (label, d) { return chip(s.days.indexOf(d + 1) >= 0, 'day', i, String(d + 1), label); }).join('') + '</div></div>';
        html += '<div class="k-row" style="align-items:flex-end">' +
            '<label class="k-field"><span>' + h.esc(t.schFrom) + '</span><input type="time" data-input="sched:start" data-i="' + i + '" value="' + h.esc(s.start) + '"></label>' +
            '<label class="k-field"><span>' + h.esc(t.schTo) + '</span><input type="time" data-input="sched:end" data-i="' + i + '" value="' + h.esc(s.end) + '"></label>' +
            '<div class="k-field"><span>' + h.esc(t.schAction) + '</span><div class="k-seg">' +
            [['cut', t.actCut], ['apps', t.actApps]].map(function (o) {
                return '<button type="button" class="' + (s.action === o[0] ? 'on' : '') + '" data-act="sched:action" data-i="' + i + '" data-v="' + o[0] + '">' + h.esc(o[1]) + '</button>';
            }).join('') + '</div></div></div>';
        if (s.action === 'apps') {
            html += '<div class="k-field"><span>' + h.esc(t.schApps) + '</span><div class="k-chips">' +
                (h.S().options.apps || []).map(function (a) { return chip(s.apps.indexOf(a.key) >= 0, 'app', i, a.key, a.name, true); }).join('') + '</div></div>';
        }
        html += '</div><div class="k-side k-field"><span>' + h.esc(t.schWeek) + '</span>' + week(s) + '</div></div></section>';
        return html;
    }

    /* order of picked devices/apps/days is not a change */
    function norm(s) {
        return JSON.stringify([s.enabled, s.name, s.devices.slice().sort(), s.days.slice().sort(), s.start, s.end, s.action, s.apps.slice().sort()]);
    }

    function find(list, uuid) {
        for (var i = 0; i < list.length; i++) {
            if (list[i].uuid && list[i].uuid === uuid) { return list[i]; }
        }
        return null;
    }

    window.MinnoshApp.register({
        key: 'sched',
        icon: CLOCK,
        label: function (t) { return t.tabSched; },
        render: function () {
            var t = h.T(), list = draft().schedules;
            return '<div class="k-stack"><div class="k-row" style="justify-content:space-between;align-items:flex-end">' +
                '<div><h1>' + h.esc(t.schTitle) + '</h1><div class="muted" style="font-size:14px;margin-top:4px">' + h.esc(t.schSub) + '</div></div>' +
                '<button type="button" class="k-btn primary" data-act="sched:add">' + h.icon(PLUS, 18) + h.esc(t.schNew) + '</button></div>' +
                (list.length ? list.map(card).join('') : '<div class="k-card k-empty" style="border-style:dashed">' + h.esc(t.schEmpty) + '</div>') +
                '</div>';
        },
        act: function (name, el) {
            var list = draft().schedules, i = Number(el.getAttribute('data-i')), v = el.getAttribute('data-v'), s = list[i];
            switch (name) {
                case 'add':
                    list.push({ uuid: '', enabled: true, name: h.T().schNewName, devices: [], days: [1, 2, 3, 4, 5], start: '21:00', end: '07:00', action: 'cut', apps: [] });
                    return 'main';
                case 'del': list.splice(i, 1); return 'main';
                case 'enabled': s.enabled = !s.enabled; return 'main';
                case 'dev': s.devices = h.toggleInList(s.devices, v); return 'main';
                case 'day': s.days = h.toggleInList(s.days, Number(v)).sort(); return 'main';
                case 'app': s.apps = h.toggleInList(s.apps, v); return 'main';
                case 'action': s.action = v; return 'main';
            }
            return null;
        },
        input: function (name, el, type) {
            var s = draft().schedules[Number(el.getAttribute('data-i'))];
            if (!s) { return null; }
            if (name === 'name') {
                s.name = el.value.replace(/[\x00-\x1f<>"]/g, '');
                return type === 'change' ? 'main' : 'pending';
            }
            if ((name === 'start' || name === 'end') && /^\d{2}:\d{2}$/.test(el.value)) {
                s[name] = el.value;
                return type === 'change' ? 'main' : 'pending';
            }
            return null;
        },
        changes: function (add, d, sv) {
            var t = h.T();
            d.schedules.forEach(function (s, i) {
                var before = s.uuid ? find(sv.schedules, s.uuid) : null;
                if (!before) {
                    add(t.schTitle, '', s.name, function () { d.schedules.splice(d.schedules.indexOf(s), 1); });
                } else if (norm(before) !== norm(s)) {
                    add(t.schTitle + ' · ' + s.name, summary(before), summary(s), function () { d.schedules[d.schedules.indexOf(s)] = h.clone(before); });
                }
            });
            sv.schedules.forEach(function (s) {
                if (!find(d.schedules, s.uuid)) {
                    add(t.schTitle, s.name, '', function () { d.schedules.push(h.clone(s)); });
                }
            });
        }
    });
})();
