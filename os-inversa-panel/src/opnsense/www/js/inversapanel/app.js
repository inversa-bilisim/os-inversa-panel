/*
 * SPDX-License-Identifier: BSD-2-Clause
 * Copyright (C) 2026 Inversa Bilişim
 *
 * Inversa Panel single page UI.
 *
 * - Configuration is loaded once into `saved`; every click edits `draft`.
 * - The pending bar shows the difference; "Apply" posts the draft in one request,
 *   "Discard" copies `saved` back. Nothing reaches the firewall before "Apply".
 * - All text coming from the network (host names, vendors, domains) goes through esc().
 */
(function () {
    'use strict';

    var ICONS = {
        shield: 'M12 3l8 3v6c0 5-3.5 8-8 9-4.5-1-8-4-8-9V6z',
        check: 'M9 12l2 2 4-4',
        list: 'M8 6h12M8 12h12M8 18h12M4 6h.01M4 12h.01M4 18h.01',
        alert: 'M12 8v4M12 15.5h.01',
        dash: 'M3.3 19a9 9 0 1 1 17.4 0M12 14l4-4',
        devices: 'M3 4h12a1 1 0 0 1 1 1v9a1 1 0 0 1-1 1H3a1 1 0 0 1-1-1V5a1 1 0 0 1 1-1zM6 19h6M18 8h3a1 1 0 0 1 1 1v10a1 1 0 0 1-1 1h-3a1 1 0 0 1-1-1V9a1 1 0 0 1 1-1z',
        sliders: 'M4 6h9M17 6h3M4 12h3M11 12h9M4 18h11M19 18h1M15 4v4M9 10v4M17 16v4',
        search: 'M11 4a7 7 0 1 0 0 14a7 7 0 1 0 0-14zM21 21l-4.3-4.3',
        pencil: 'M4 20h4L19 9l-4-4L4 16zM14 6l4 4',
        close: 'M6 6l12 12M18 6L6 18',
        info: 'M12 2a10 10 0 1 0 0 20a10 10 0 1 0 0-20zM12 16v-5M12 8h.01',
        warn: 'M10.3 3.9L1.8 18a2 2 0 0 0 1.7 3h17a2 2 0 0 0 1.7-3L13.7 3.9a2 2 0 0 0-3.4 0zM12 9v4M12 17h.01',
        ok: 'M20 6L9 17l-5-5',
        globe: 'M12 2a10 10 0 1 0 0 20a10 10 0 1 0 0-20zM2 12h20M12 2a15 15 0 0 1 0 20M12 2a15 15 0 0 0 0 20',
        net: 'M10 3h4v4h-4zM3 17h4v4H3zM17 17h4v4h-4zM12 7v5M5 17v-2a3 3 0 0 1 3-3h8a3 3 0 0 1 3 3v2',
        lock: 'M5 11h14a1 1 0 0 1 1 1v8a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1v-8a1 1 0 0 1 1-1zM8 11V7a4 4 0 0 1 8 0v4',
        chevron: 'M6 9l6 6 6-6',
        ads: 'M3 11l15-6v14L3 13zM7 12.5V18a2 2 0 0 0 4 0v-4',
        malware: 'M8 9a4 4 0 0 1 8 0v5a4 4 0 0 1-8 0zM12 9v9M3 13h5M16 13h5M4 7l4 3M20 7l-4 3M4 19l4-3M20 19l-4-3',
        adult: 'M3 3l18 18M10.6 6.1A9.7 9.7 0 0 1 12 6c6 0 10 6 10 6a17 17 0 0 1-3.2 3.8M6.6 6.6C3.8 8.4 2 12 2 12s4 6 10 6a9.4 9.4 0 0 0 4.4-1.1M9.9 9.9a3 3 0 0 0 4.2 4.2',
        gambling: 'M5 3h14a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2zM8 8h.01M16 8h.01M12 12h.01M8 16h.01M16 16h.01',
        bypass: 'M2 12h4M18 12h4M6 6h12v12H6zM10 10l4 4M14 10l-4 4',
        safesearch: 'M11 4a7 7 0 1 0 0 14a7 7 0 1 0 0-14zM21 21l-4.3-4.3',
        forcedns: 'M12 2a10 10 0 1 0 0 20a10 10 0 1 0 0-20zM2 12h20M12 2a15 15 0 0 1 0 20M12 2a15 15 0 0 0 0 20',
        phone: 'M8 2h8a2 2 0 0 1 2 2v16a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2zM11 18h2',
        tablet: 'M6 2h12a2 2 0 0 1 2 2v16a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2zM11 18h2',
        laptop: 'M5 5h14a1 1 0 0 1 1 1v10H4V6a1 1 0 0 1 1-1zM2 19h20',
        tv: 'M4 5h16a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V7a2 2 0 0 1 2-2zM8 21h8',
        console: 'M6 8h12a4 4 0 0 1 4 4v1a4 4 0 0 1-7 2.6H9A4 4 0 0 1 2 13v-1a4 4 0 0 1 4-4zM7 10.5v3M5.5 12h3M15 12h.01M18 13h.01',
        printer: 'M6 9V3h12v6M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2M6 14h12v7H6z',
        iot: 'M9 2v6M15 2v6M6 8h12v3a6 6 0 0 1-12 0zM12 17v5',
        server: 'M4 3h16a1 1 0 0 1 1 1v6a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1zM4 13h16a1 1 0 0 1 1 1v6a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1v-6a1 1 0 0 1 1-1zM7 7h.01M7 17h.01',
        unknown: 'M12 2a10 10 0 1 0 0 20a10 10 0 1 0 0-20zM9.1 9a3 3 0 0 1 5.8 1c0 2-3 3-3 3M12 17h.01'
    };
    var CATS = ['ads', 'malware', 'adult', 'gambling', 'bypass', 'safesearch', 'forcedns'];
    var QUICK = ['ads', 'malware', 'adult', 'forcedns'];
    var TYPES = ['phone', 'tablet', 'laptop', 'tv', 'console', 'printer', 'iot', 'server', 'unknown'];
    /*
     * The menu: each entry opens one or more pages; with more than one, the pages show as sub tabs
     * below the menu. A page is one of the core ones in this file or a view from views/*.js (see
     * register()); pages whose view is not loaded are left out. S.tab always holds a page.
     * Every page has its own address (#geo, #sched, ...), a menu entry's key opens its first page.
     */
    var MENU = [
        ['dash', ['dash']],
        ['net', ['net', 'nets', 'ports', 'dns', 'pf']],
        ['vpn', ['vpn']],
        ['devices', ['devices', 'sched']],
        ['security', ['filter', 'ips', 'geo', 'lists']],
        ['logs', ['attacks', 'history', 'events']],
        ['settings', ['settings', 'notify', 'backup', 'scan', 'about']]
    ];
    /* addresses of menu entries that no longer exist */
    var MOVED = { remote: 'vpn', guest: 'nets' };
    var CORE_PAGES = ['dash', 'devices', 'filter', 'lists', 'settings'];
    var VIEWS = {};
    var TRAFFIC_MS = 5000;
    var HISTORY = 120; /* samples, 10 minutes at 5s */
    var DOMAIN_RE = /^(?:[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?\.)+[a-z]{2,63}$/i;

    var root = null;
    var S = null;

    /* ------------------------------------------------------------------ helpers */

    function esc(value) {
        return String(value === undefined || value === null ? '' : value)
            .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;').replace(/'/g, '&#39;');
    }

    function clone(obj) {
        return JSON.parse(JSON.stringify(obj));
    }

    function sortedJson(list) {
        return JSON.stringify((list || []).slice().sort());
    }

    function icon(path, size) {
        var s = size || 18;
        return '<svg width="' + s + '" height="' + s + '" viewBox="0 0 24 24" fill="none" stroke="currentColor" ' +
            'stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="' + path + '"></path></svg>';
    }

    function toggle(on, attrs, label, extraClass) {
        return '<button type="button" class="k-switch' + (on ? ' on' : '') + (extraClass ? ' ' + extraClass : '') + '" ' +
            'aria-pressed="' + (on ? 'true' : 'false') + '" aria-label="' + esc(label) + '" ' + attrs + '>' +
            '<span class="k-track"><span class="k-knob"></span></span></button>';
    }

    function api(method, url, payload) {
        return new Promise(function (resolve, reject) {
            var call = method === 'POST' ? ajaxCall : ajaxGet;
            call(url, payload || {}, function (data, status) {
                if (status === 'success' && data && typeof data === 'object' && !data.errorMessage) {
                    resolve(data);
                } else {
                    reject(data || {});
                }
            });
        });
    }

    /* language of the OPNsense GUI itself, used for "automatic" */
    /*
     * A language file that misses a text (added later, not translated yet) shows the English one
     * instead of failing: every language is filled up from English once, at the start.
     */
    function fillLanguages() {
        var all = window.InversaPanelI18n, en = all.en;
        var fill = function (target, source) {
            Object.keys(source).forEach(function (key) {
                var value = source[key];
                if (target[key] === undefined) {
                    target[key] = value;
                } else if (value && typeof value === 'object' && !Array.isArray(value) && target[key] && typeof target[key] === 'object') {
                    fill(target[key], value);
                }
            });
        };
        Object.keys(all).forEach(function (code) { if (code !== 'en') { fill(all[code], en); } });
    }

    function autoLang() {
        var code = String(root.getAttribute('data-langcode') || 'en').slice(0, 2).toLowerCase();
        return window.InversaPanelI18n[code] ? code : 'en';
    }

    function lang() {
        var pref = S && S.draft ? S.draft.general.language : 'auto';
        if (pref === 'auto') {
            return autoLang();
        }
        return window.InversaPanelI18n[pref] ? pref : 'en';
    }

    function T() {
        return window.InversaPanelI18n[lang()];
    }

    function fmt(n, digits) {
        var d = digits || 0;
        return Number(n || 0).toLocaleString(T().locale, { minimumFractionDigits: d, maximumFractionDigits: d });
    }

    function ago(ts) {
        var t = T();
        var time = ts ? Date.parse(ts) : NaN;
        if (isNaN(time)) {
            return '';
        }
        var sec = Math.max(0, (Date.now() - time) / 1000);
        if (sec < 90) { return t.justNow; }
        if (sec < 3600) { return t.agoMin(Math.round(sec / 60)); }
        if (sec < 86400) { return t.agoHour(Math.round(sec / 3600)); }
        return t.agoDay(Math.round(sec / 86400));
    }

    var PAGE_SIZES = [25, 50, 100];

    /*
     * A long list is shown a page at a time: which rows these are, the pages around the open one,
     * how many rows a page holds. Nothing when everything fits the smallest page.
     * act: the action a button sends (data-v = page, counted from 0); act + 'size' for the page size.
     */
    function pager(total, page, size, act) {
        var t = T(), pages = Math.max(1, Math.ceil(total / size));
        if (total <= PAGE_SIZES[0]) { return ''; }
        page = Math.max(0, Math.min(page, pages - 1));
        var btn = function (i, label, opts) {
            return '<button type="button" class="k-pg' + (opts.on ? ' on' : '') + '" data-act="' + act + '" data-v="' + i + '"' + (opts.off ? ' disabled' : '') +
                (opts.aria ? ' aria-label="' + esc(opts.aria) + '" title="' + esc(opts.aria) + '"' : '') + (opts.on ? ' aria-current="page"' : '') + '>' + label + '</button>';
        };
        var nums = [], last = -1;
        for (var i = 0; i < pages; i++) {
            if (i === 0 || i === pages - 1 || Math.abs(i - page) <= 1) {
                if (last >= 0 && i - last > 1) { nums.push('<span class="k-pg-gap">…</span>'); }
                nums.push(btn(i, fmt(i + 1), { on: i === page, aria: t.pgPage(fmt(i + 1)) }));
                last = i;
            }
        }
        return '<div class="k-pager"><span class="muted">' + esc(t.pgRange(fmt(page * size + 1), fmt(Math.min(total, (page + 1) * size)), fmt(total))) + '</span>' +
            '<div class="k-pager-nav" role="navigation" aria-label="' + esc(t.pgPages) + '">' +
            btn(page - 1, '‹', { off: page === 0, aria: t.pgPrev }) + nums.join('') + btn(page + 1, '›', { off: page >= pages - 1, aria: t.pgNext }) + '</div>' +
            '<div class="k-fgroup"><span class="k-flabel">' + esc(t.pgSize) + '</span><div class="k-seg">' + PAGE_SIZES.map(function (n) {
                return '<button type="button" class="' + (n === size ? 'on' : '') + '" data-act="' + act + 'size" data-v="' + n + '">' + n + '</button>';
            }).join('') + '</div></div></div>';
    }

    /* the pages of a menu entry that exist here */
    function pagesOf(group) {
        for (var i = 0; i < MENU.length; i++) {
            if (MENU[i][0] === group) {
                return MENU[i][1].filter(function (key) { return CORE_PAGES.indexOf(key) >= 0 || !!VIEWS[key]; });
            }
        }
        return [];
    }

    /* the menu entry a page belongs to */
    function groupOf(page) {
        for (var i = 0; i < MENU.length; i++) {
            if (MENU[i][1].indexOf(page) >= 0) { return MENU[i][0]; }
        }
        return 'dash';
    }

    /* the page for an address: a page's own key, or a menu entry's key (its first page) */
    function pageFor(key) {
        key = MOVED[key] || key;
        if (pagesOf(groupOf(key)).indexOf(key) >= 0) { return key; }
        return pagesOf(key)[0] || 'dash';
    }

    function inputFocused() {
        var el = document.activeElement;
        return el && root.contains(el) && el.tagName === 'INPUT';
    }

    /* ------------------------------------------------------------------ device helpers */

    function devCfg(mac, source) {
        var devices = (source || S.draft).devices;
        return devices[mac] || { name: '', type: 'unknown', blocked: false, approved: false };
    }

    function setDev(mac, patch) {
        S.draft.devices[mac] = Object.assign({}, devCfg(mac), patch);
    }

    function devName(host) {
        var cfg = devCfg(host.mac);
        return cfg.name || host.hostname || T().unnamed;
    }

    /*
     * Approval of new devices: on a network that asks for it, a device that is not approved
     * reaches nothing but the firewall. Whether a network asks for it is taken from the saved
     * (enforced) state: switching it on approves the devices already there on "Apply", so they
     * must not show up as waiting while the switch is only a pending change.
     */
    function approvalOn(key) {
        return !!key && !!(S.saved.approval || {})[key];
    }

    function waiting(host, source) {
        return approvalOn(host.network_key) && !devCfg(host.mac, source).approved;
    }

    function waitingCount(source) {
        return S.hosts.filter(function (h) { return waiting(h, source); }).length;
    }

    function hostByMac(mac) {
        for (var i = 0; i < S.hosts.length; i++) {
            if (S.hosts[i].mac === mac) { return S.hosts[i]; }
        }
        return null;
    }

    /* ------------------------------------------------------------------ pending changes */

    function changedDevices() {
        var result = {};
        var macs = Object.keys(Object.assign({}, S.saved.devices, S.draft.devices));
        macs.forEach(function (mac) {
            var a = devCfg(mac, S.draft), b = devCfg(mac, S.saved);
            if (a.name !== b.name || a.type !== b.type || !!a.blocked !== !!b.blocked || !!a.approved !== !!b.approved) {
                result[mac] = a;
            }
        });
        return result;
    }

    /* fixed addresses: mac => ip, '' = back to automatic */
    function changedReservations() {
        var result = {}, d = S.draft.reservations || {}, s = S.saved.reservations || {};
        Object.keys(Object.assign({}, s, d)).forEach(function (mac) {
            if ((d[mac] || '') !== (s[mac] || '')) { result[mac] = d[mac] || ''; }
        });
        return result;
    }

    function ipToInt(ip) {
        var m = /^(\d{1,3})\.(\d{1,3})\.(\d{1,3})\.(\d{1,3})$/.exec(ip || '');
        if (!m || m.slice(1).some(function (x) { return +x > 255; })) { return null; }
        return ((+m[1] << 24) >>> 0) + (+m[2] << 16) + (+m[3] << 8) + (+m[4]);
    }

    /* the DHCP network an address belongs to, or null */
    function dhcpNetOf(ip) {
        var n = ipToInt(ip);
        if (n === null) { return null; }
        return (S.options.dhcp_networks || []).filter(function (net) {
            var p = net.cidr.split('/'), bits = +p[1], mask = bits === 0 ? 0 : (~0 << (32 - bits)) >>> 0;
            return ((n & mask) >>> 0) === ((ipToInt(p[0]) & mask) >>> 0);
        })[0] || null;
    }

    function diffList(before, after, callback) {
        before = before || [];
        after = after || [];
        after.forEach(function (v) { if (before.indexOf(v) < 0) { callback(v, true); } });
        before.forEach(function (v) { if (after.indexOf(v) < 0) { callback(v, false); } });
    }

    /*
     * Everything that differs between draft and saved, in words, each with its own revert
     * (the "Show changes" list, like OpenWrt's). Its length is the pending count.
     * Language is saved immediately (setLanguage), so it never appears here.
     */
    function changeList() {
        var t = T(), d = S.draft, s = S.saved, out = [];
        function onOff(v) { return v ? t.on : t.off; }
        function add(what, from, to, revert) { out.push({ what: what, from: from, to: to, revert: revert }); }
        var ifName = {}, appName = {};
        (S.options.interfaces || []).forEach(function (i) { ifName[i.key] = i.name; });
        (S.options.apps || []).forEach(function (a) { appName[a.key] = a.name; });

        [['enabled', t.enabledLabel], ['dnsstats', t.statsLabel]].forEach(function (g) {
            if (!!d.general[g[0]] !== !!s.general[g[0]]) {
                add(g[1], onOff(s.general[g[0]]), onOff(d.general[g[0]]), function () { S.draft.general[g[0]] = s.general[g[0]]; });
            }
        });
        diffList(s.general.interfaces, d.general.interfaces, function (key, added) {
            add(t.ifLabel, added ? '' : (ifName[key] || key), added ? (ifName[key] || key) : '', function () {
                S.draft.general.interfaces = toggleInList(S.draft.general.interfaces, key);
            });
        });
        CATS.forEach(function (k) {
            if (!!d.filtering[k] !== !!s.filtering[k]) {
                add(t.cats[k][0], onOff(s.filtering[k]), onOff(d.filtering[k]), function () { S.draft.filtering[k] = s.filtering[k]; });
            }
        });
        diffList(s.filtering.apps, d.filtering.apps, function (key, added) {
            add(appName[key] || key, added ? t.allowed : t.blocked, added ? t.blocked : t.allowed, function () {
                S.draft.filtering.apps = toggleInList(S.draft.filtering.apps, key);
            });
        });
        [['allowlist', t.allowTitle], ['denylist', t.denyTitle]].forEach(function (l) {
            diffList(s.filtering[l[0]], d.filtering[l[0]], function (domain, added) {
                add(l[1], added ? '' : domain, added ? domain : '', function () {
                    S.draft.filtering[l[0]] = toggleInList(S.draft.filtering[l[0]], domain);
                });
            });
        });
        if (d.filtering.response !== s.filtering.response) {
            var resp = { zero: '0.0.0.0', nxdomain: 'NXDOMAIN' };
            add(t.respLabel, resp[s.filtering.response], resp[d.filtering.response], function () { S.draft.filtering.response = s.filtering.response; });
        }
        Object.keys(changedDevices()).forEach(function (mac) {
            var a = devCfg(mac, d), b = devCfg(mac, s), host = hostByMac(mac);
            var label = b.name || a.name || (host && host.hostname) || mac;
            if (a.name !== b.name) {
                add(label + ' · ' + t.dName, b.name || '—', a.name || '—', function () { setDev(mac, { name: b.name }); });
            }
            if (a.type !== b.type) {
                add(label + ' · ' + t.dType, t.types[b.type], t.types[a.type], function () { setDev(mac, { type: b.type }); });
            }
            if (!!a.blocked !== !!b.blocked) {
                add(label + ' · ' + t.dNet, b.blocked ? t.netOff : t.netOn, a.blocked ? t.netOff : t.netOn, function () { setDev(mac, { blocked: !!b.blocked }); });
            }
            if (!!a.approved !== !!b.approved) {
                add(label + ' · ' + t.dApproval, b.approved ? t.apprApproved : t.apprWaiting, a.approved ? t.apprApproved : t.apprWaiting, function () { setDev(mac, { approved: !!b.approved }); });
            }
        });
        Object.keys(changedReservations()).forEach(function (mac) {
            var host = hostByMac(mac), cfg = devCfg(mac, d);
            var label = cfg.name || (host && host.hostname) || mac;
            var before = (s.reservations || {})[mac] || '', after = (d.reservations || {})[mac] || '';
            add(label + ' · ' + t.dFixedIp, before || t.dIpAuto, after || t.dIpAuto, function () { S.draft.reservations[mac] = before; });
        });
        /* views add their own pending changes (schedules, access, countries, dns) */
        Object.keys(VIEWS).forEach(function (key) {
            if (VIEWS[key].changes) {
                VIEWS[key].changes(add, d, s);
            }
        });
        return out;
    }

    function pendingCount() {
        return changeList().length;
    }

    /* ------------------------------------------------------------------ data loading */

    function loadState() {
        return api('GET', '/api/inversapanel/state/get').then(function (data) {
            data.devices = Array.isArray(data.devices) ? {} : (data.devices || {});
            S.saved = {
                general: data.general, filtering: data.filtering, devices: data.devices,
                schedules: data.schedules || [],
                access: Array.isArray(data.access) ? {} : (data.access || {}),
                approval: Array.isArray(data.approval) ? {} : (data.approval || {}),
                geo: data.geo || {}, vpn: data.vpn || {},
                ips: data.ips || { enabled: false, mode: 'detect', groups: [] },
                dns: data.dns || { upstream: 'auto', servers: [], dot: false, tlsname: '', records: [] },
                reservations: Array.isArray(data.reservations) ? {} : (data.reservations || {})
            };
            S.draft = clone(S.saved);
            S.options = data.options;
            /* a change is waiting for its confirmation (this page was reloaded, or somebody else made it) */
            if (data.rollback && !S.ui.countdown) {
                startCountdown(data.rollback.remaining);
            }
        });
    }

    /* ------------------------------------------------------------------ confirm or put back */

    /*
     * Changes that can cut the administrator off (network settings, "only these countries get in") are
     * put back by the firewall itself unless confirmed in time. While that runs a banner with the
     * countdown shows on every page: S.ui.countdown = { left, expired, timer }.
     */
    function startCountdown(seconds) {
        stopCountdown();
        var c = S.ui.countdown = { left: Number(seconds) || 90, expired: false };
        c.timer = setInterval(function () {
            c.left -= 1;
            var el = document.getElementById('k-confirm-left');
            if (el) { el.textContent = String(Math.max(0, c.left)); }
            if (c.left <= 0) {
                clearInterval(c.timer);
                c.expired = true;
                renderConfirm();
                /* the firewall restores the old settings: read them once it had time to do so */
                setTimeout(function () {
                    stopCountdown();
                    loadState().then(function () {
                        return VIEWS[S.tab] && VIEWS[S.tab].load ? VIEWS[S.tab].load() : null;
                    }).then(render, render);
                }, 20000);
            }
        }, 1000);
        renderConfirm();
    }

    function stopCountdown() {
        if (S.ui.countdown && S.ui.countdown.timer) { clearInterval(S.ui.countdown.timer); }
        S.ui.countdown = null;
    }

    function confirmChange() {
        api('POST', '/api/inversapanel/network/confirm', {}).then(function () {
            stopCountdown();
            S.ui.notice = { type: 'ok', text: T().netConfirmed, list: [] };
            render();
        }, function () {});
    }

    function renderConfirm() {
        var slot = document.getElementById('k-confirm'), t = T(), c = S.ui.countdown;
        if (!slot) { return; }
        slot.innerHTML = !c ? '' : (c.expired ?
            '<div class="k-banner warn">' + icon(ICONS.warn, 20) + '<span>' + esc(t.netReverted) + '</span></div>' :
            '<div class="k-banner info k-countdown">' + icon(ICONS.info, 20) +
            '<div style="flex:1 1 auto"><b>' + esc(t.netConfirmTitle) + '</b><div>' + esc(t.netConfirmText) + '</div></div>' +
            '<button type="button" class="k-btn primary" data-act="confirm"><span>' + esc(t.netConfirmBtn) + ' (<span id="k-confirm-left">' + c.left + '</span>)</span></button></div>');
    }

    function loadHosts() {
        return api('GET', '/api/inversapanel/devices/list').then(function (data) {
            S.hosts = data.devices || [];
            S.source = data.source;
            S.hostsLoaded = true;
            /* the number on the Devices tab follows the devices waiting for approval */
            var n = S.draft ? waitingCount() : 0;
            if (n !== S.ui.waitShown && document.getElementById('k-tabs')) { renderTabs(); }
        });
    }

    function loadDns() {
        return api('GET', '/api/inversapanel/dashboard/dns').then(function (data) {
            S.dns = data;
        });
    }

    function sampleTraffic() {
        return api('GET', '/api/inversapanel/dashboard/traffic').then(function (data) {
            var down = 0, up = 0;
            (data.wan || []).forEach(function (key) {
                var row = (data.interfaces || {})[key];
                if (row) {
                    down += Number(row.inbytes || 0);
                    up += Number(row.outbytes || 0);
                }
            });
            var sample = { time: Number(data.time), down: down, up: up, ifaces: data.interfaces || {} };
            var prev = S.traffic.last;
            S.traffic.last = sample;
            if (prev && sample.time > prev.time && sample.down >= prev.down && sample.up >= prev.up) {
                var dt = sample.time - prev.time;
                var rate = {
                    down: (sample.down - prev.down) * 8 / dt / 1e6,
                    up: (sample.up - prev.up) * 8 / dt / 1e6
                };
                S.traffic.rate = rate;
                /* per network: what the firewall sends into it is what its devices download */
                S.traffic.nets = {};
                Object.keys(sample.ifaces).forEach(function (key) {
                    var now = sample.ifaces[key], was = prev.ifaces[key];
                    if (was && Number(now.inbytes) >= Number(was.inbytes) && Number(now.outbytes) >= Number(was.outbytes)) {
                        S.traffic.nets[key] = {
                            down: (Number(now.outbytes) - Number(was.outbytes)) * 8 / dt / 1e6,
                            up: (Number(now.inbytes) - Number(was.inbytes)) * 8 / dt / 1e6
                        };
                    }
                });
                S.traffic.hist.push(rate);
                if (S.traffic.hist.length > HISTORY) {
                    S.traffic.hist.shift();
                }
            }
        });
    }

    function refreshView() {
        if (inputFocused()) {
            return;
        }
        if (S.tab === 'dash' || S.tab === 'devices') {
            renderMain();
            renderHeader();
        }
    }

    /* ------------------------------------------------------------------ rendering: frame */

    function render() {
        root.innerHTML =
            '<div id="k-header"></div>' +
            '<nav class="k-tabs" id="k-tabs" aria-label="Inversa Panel"></nav>' +
            '<div id="k-subtabs"></div>' +
            '<div id="k-confirm"></div>' +
            '<div id="k-main"></div>';
        renderHeader();
        renderTabs();
        renderSubtabs();
        renderConfirm();
        renderBanners();
        renderMain();
        syncMenu();
    }

    /* language dropdown, shared by header and settings; a UI preference that is saved at once */
    function langSelect() {
        var t = T(), pref = S.draft.general.language;
        var autoName = window.InversaPanelI18n[autoLang()].langName;
        var options = [['auto', t.langAuto + ' (' + autoName + ')']].concat(Object.keys(window.InversaPanelI18n).map(function (code) {
            return [code, window.InversaPanelI18n[code].langName];
        }));
        return '<label class="k-lang">' + icon(ICONS.globe, 16) +
            '<select data-input="lang" aria-label="' + esc(t.langLabel) + '">' + options.map(function (o) {
                return '<option value="' + esc(o[0]) + '"' + (o[0] === pref ? ' selected' : '') + '>' + esc(o[1]) + '</option>';
            }).join('') + '</select>' + icon(ICONS.chevron, 14) + '</label>';
    }

    function setLanguage(code) {
        var previous = S.saved.general.language;
        S.draft.general.language = code;
        S.saved.general.language = code;
        render();
        api('POST', '/api/inversapanel/service/language', { language: code }).catch(function (err) {
            S.draft.general.language = previous;
            S.saved.general.language = previous;
            S.ui.notice = { type: 'err', text: T().applyFailed, list: [err && err.errorMessage ? err.errorMessage : ''] };
            render();
        });
    }

    function protectionLevel(source) {
        var f = source.filtering;
        if (!source.general.enabled) { return 'off'; }
        return f.ads && f.malware ? 'ok' : 'warn';
    }

    /* the basic protections that are off, by name (why the header does not say "protection on") */
    function protectionGaps(source) {
        var t = T();
        return ['ads', 'malware'].filter(function (k) { return !source.filtering[k]; }).map(function (k) { return t.cats[k][0]; });
    }

    /* the header pill: says why on hover / keyboard focus, a click goes where it can be changed */
    function protectionPill() {
        var t = T(), level = protectionLevel(S.saved), gaps = protectionGaps(S.saved);
        var pill = level === 'ok' ? ['ok', t.protOn] : (level === 'warn' ? ['warn', t.protPartial] : ['warn', t.protOff]);
        var why = level === 'ok' ? '<span>' + esc(t.protWhyOk) + '</span>' :
            (level === 'off' ? '<span>' + esc(t.protWhyOff) + '</span>' :
                '<b>' + esc(t.protWhyTitle) + '</b><ul>' + gaps.map(function (g) { return '<li>' + esc(g) + '</li>'; }).join('') + '</ul>') +
            '<span class="k-tip-go">' + esc(level === 'off' ? t.protGoSettings : t.protGoFilter) + '</span>';
        return '<button type="button" class="k-pill k-tip ' + pill[0] + '" data-act="tab" data-v="' + (level === 'off' ? 'settings' : 'filter') + '" aria-describedby="k-prot-why">' +
            '<span class="k-dot ' + pill[0] + '"></span>' + esc(pill[1]) +
            '<span class="k-tip-box" id="k-prot-why" role="tooltip">' + why + '</span></button>';
    }

    function renderHeader() {
        var t = T();
        document.getElementById('k-header').innerHTML =
            '<div class="k-header">' +
            '<button type="button" class="k-brand" data-act="tab" data-v="about" title="' + esc(t.tabAbout) + '"><div class="k-logo" aria-hidden="true"></div>' +
            '<div><div class="k-title">Inversa Panel</div><div class="muted">' + esc(t.appSub) + '</div></div></button>' +
            /* pending changes live inside the header so they never push the page down */
            '<div id="k-pending" class="k-pending-slot"></div>' +
            '<div class="k-head-right">' +
            protectionPill() +
            langSelect() +
            '</div></div>';
        renderPending();
    }

    function renderTabs() {
        var t = T();
        var labels = {
            dash: [t.tabDash, ICONS.dash], devices: [t.tabDevices, ICONS.devices], net: [t.tabNet, ICONS.net],
            security: [t.tabSecurity, ICONS.shield], logs: [t.tabLogs, ICONS.list], vpn: [t.tabVpn, ICONS.lock], settings: [t.tabSettings, ICONS.sliders]
        };
        var wait = waitingCount(), current = groupOf(S.tab);
        S.ui.waitShown = wait;
        var html = MENU.filter(function (m) { return pagesOf(m[0]).length; }).map(function (m) {
            var key = m[0], on = current === key;
            return '<button type="button" class="k-tab' + (on ? ' on' : '') + '" data-act="tab" data-v="' + key + '"' +
                (on ? ' aria-current="page"' : '') + '>' + icon(labels[key][1]) + '<span class="k-lbl" data-t="' + esc(labels[key][0]) + '">' + esc(labels[key][0]) + '</span>' +
                (key === 'devices' && wait ? '<span class="k-count warn" title="' + esc(t.apprBanner(wait)) + '">' + wait + '</span>' : '') + '</button>';
        }).join('');
        document.getElementById('k-tabs').innerHTML = html;
    }

    /* the pages of the open menu entry, when it has more than one */
    function renderSubtabs() {
        var t = T(), pages = pagesOf(groupOf(S.tab));
        var core = { devices: t.tabDevices, filter: t.subFilter, lists: t.subLists, settings: t.tabSettings };
        document.getElementById('k-subtabs').innerHTML = pages.length < 2 ? '' :
            '<div class="k-subtabs" role="group" aria-label="' + esc(t.subtabsAria) + '">' + pages.map(function (key) {
                var on = S.tab === key, label = esc(VIEWS[key] ? VIEWS[key].label(t) : core[key]);
                return '<button type="button" class="k-chip' + (on ? ' on' : '') + '" data-act="tab" data-v="' + key + '"' +
                    (on ? ' aria-current="page"' : '') + '><span class="k-lbl" data-t="' + label + '">' + label + '</span></button>';
            }).join('') + '</div>';
    }

    function renderBanners() {
        renderPending();
    }

    /*
     * One slot in the header shows, in order of priority: pending changes (with Discard/Apply),
     * or the result of the last apply. Success fades out by itself, errors stay until closed.
     */
    function renderPending() {
        var slot = document.getElementById('k-pending');
        if (!slot) { return; }
        var t = T(), changes = changeList(), n = changes.length, nt = S.ui.notice;
        S.ui.changeCache = changes;
        if (n === 0) {
            S.ui.showChanges = false;
        }
        if (n > 0 || S.ui.applying) {
            var busy = S.ui.applying ? ' disabled' : '';
            var panel = '';
            if (S.ui.showChanges) {
                panel = '<div class="k-changes" role="region" aria-label="' + esc(t.changesTitle) + '">' +
                    '<div class="k-changes-head">' + esc(t.changesTitle) + '</div><ul>' +
                    changes.map(function (c, i) {
                        var diff;
                        if (c.from === '') {
                            diff = '<span class="add">+ ' + esc(c.to) + '</span>';
                        } else if (c.to === '') {
                            diff = '<span class="del">− ' + esc(c.from) + '</span>';
                        } else {
                            diff = '<span class="from">' + esc(c.from) + '</span> → <span class="to">' + esc(c.to) + '</span>';
                        }
                        return '<li><div class="k-ch-text"><div class="k-ch-what">' + esc(c.what) + '</div><div class="k-ch-diff">' + diff + '</div></div>' +
                            '<button type="button" class="k-btn small" data-act="revert" data-i="' + i + '"' + busy + '>' + esc(t.undo) + '</button></li>';
                    }).join('') + '</ul></div>';
            }
            slot.innerHTML = '<div class="k-pending-wrap"><div class="k-pending-inline" role="status">' + icon(ICONS.info, 18) +
                '<div class="k-pending-text"><b>' + esc(t.pending(n)) + '</b><span>' + esc(t.pendingHint) + '</span></div>' +
                '<button type="button" class="k-btn small ghost" data-act="changes" aria-expanded="' + (S.ui.showChanges ? 'true' : 'false') + '">' +
                esc(S.ui.showChanges ? t.hideChanges : t.showChanges) + '</button>' +
                '<button type="button" class="k-btn small" data-act="discard"' + busy + '>' + esc(t.discard) + '</button>' +
                '<button type="button" class="k-btn small primary" data-act="apply"' + busy + '>' +
                esc(S.ui.applying ? t.applying : t.apply) + '</button></div>' + panel + '</div>';
            return;
        }
        if (!nt) {
            slot.innerHTML = '';
            return;
        }
        var list = nt.list && nt.list.length ? '<ul>' + nt.list.map(function (m) { return '<li>' + esc(m) + '</li>'; }).join('') + '</ul>' : '';
        slot.innerHTML = '<div class="k-pending-inline ' + nt.type + '" role="status">' + icon(nt.type === 'ok' ? ICONS.ok : ICONS.warn, 18) +
            '<div class="k-note" style="flex:1 1 auto">' + esc(nt.text) + list + '</div>' +
            (nt.type === 'ok' && !list ? '' : '<button type="button" class="k-icon-btn" data-act="dismiss" aria-label="' + esc(t.close) + '">' + icon(ICONS.close, 16) + '</button>') +
            '</div>';
        /* a good message without a list goes by itself; so does any message that says for how long it stays (ms) */
        if (((nt.type === 'ok' && !list) || nt.ms) && !nt.timer) {
            /* fade, then drop the message */
            nt.timer = setTimeout(function () {
                var box = slot.querySelector('.k-pending-inline');
                if (box) { box.classList.add('fade'); }
                setTimeout(function () {
                    if (S.ui.notice === nt) {
                        S.ui.notice = null;
                        renderPending();
                    }
                }, 650);
            }, nt.ms || 6000);
        }
    }

    function renderMain() {
        var html = '';
        if (VIEWS[S.tab]) { html = VIEWS[S.tab].render(); }
        else if (S.tab === 'devices') { html = viewDevices(); }
        else if (S.tab === 'filter') { html = viewFilter(); }
        else if (S.tab === 'lists') { html = viewLists(); }
        else if (S.tab === 'settings') { html = viewSettings(); }
        else { html = viewDash(); }
        document.getElementById('k-main').innerHTML = html;
    }

    /* ------------------------------------------------------------------ view: overview */

    function loadOverview() {
        return api('GET', '/api/inversapanel/dashboard/overview').then(function (data) { S.ov = data; });
    }

    /* how long the gateway, the internet and DNS take to answer */
    function loadNetTest() {
        return api('GET', '/api/inversapanel/network/test').then(function (data) { S.ovTest = data; });
    }

    function clock(ts) {
        return new Date(ts * 1000).toLocaleTimeString(T().locale, { hour: '2-digit', minute: '2-digit' });
    }

    /* a moment: the time today, "yesterday 23:15", otherwise the day as well */
    function when(ts) {
        var mid = S.ov ? S.ov.midnight : 0;
        if (ts >= mid) { return clock(ts); }
        if (ts >= mid - 86400) { return T().ov.yesterday + ' ' + clock(ts); }
        return new Date(ts * 1000).toLocaleDateString(T().locale, { day: 'numeric', month: 'short' }) + ' ' + clock(ts);
    }

    function span(sec) {
        var o = T().ov, s = Math.max(0, sec), d = Math.floor(s / 86400), hr = Math.floor(s % 86400 / 3600), m = Math.floor(s % 3600 / 60);
        return d ? o.durDH(d, hr) : (hr ? o.durHM(hr, m) : o.durM(m));
    }

    /* [number, unit] */
    function bytes(n) {
        var units = ['B', 'KB', 'MB', 'GB', 'TB'], i = 0, v = Number(n || 0);
        while (v >= 1024 && i < units.length - 1) { v /= 1024; i++; }
        return [fmt(v, i >= 2 && v < 100 ? 1 : 0), units[i]];
    }

    function hostByIp(ip) {
        for (var i = 0; i < S.hosts.length; i++) {
            if (S.hosts[i].ips.indexOf(ip) >= 0) { return S.hosts[i]; }
        }
        return null;
    }

    /* what needs somebody's attention: [text, action, value] */
    function attention() {
        var t = T(), o = t.ov, ov = S.ov || {}, list = [], level = protectionLevel(S.saved), n = waitingCount();
        if (level === 'off') { list.push([o.todoOff, 'tab', 'settings']); }
        if (level === 'warn') { list.push([t.statusWhy(protectionGaps(S.saved)), 'tab', 'filter']); }
        if (ov.wan && ov.wan.exists && !ov.wan.address) { list.push([o.todoWan, 'tab', 'net']); }
        if (n) { list.push([o.todoWait(n), 'show-waiting', '']); }
        (ov.vpn || []).forEach(function (c) {
            if (c.enabled && c.kind === 'site' && !c.connected) { list.push([o.todoVpn(c.name), 'tab', 'vpn']); }
        });
        if (ov.ips && ov.ips.available && ov.ips.enabled && !ov.ips.running) { list.push([o.todoIps, 'tab', 'ips']); }
        /* the firewall itself: a disk that fills up, a processor that runs hot */
        var sys = ov.system || {};
        if (sys.disk && sys.disk.total && sys.disk.used / sys.disk.total >= 0.9) { list.push([o.todoDisk(Math.round(sys.disk.used / sys.disk.total * 100)), '', '']); }
        if (typeof sys.temperature === 'number' && sys.temperature >= 85) { list.push([o.todoTemp(Math.round(sys.temperature)), '', '']); }
        return list;
    }

    /* a line of "what happened": [dot, title, detail] */
    function eventText(e) {
        var o = T().ov, host;
        switch (e.k) {
            case 'attack':
                host = hostByIp(e.dst);
                return ['warn', e.blocked ? o.evAttackBlocked : o.evAttack,
                    e.src + ' → ' + (host ? devName(host) : e.dst) + ' · ' + e.msg + (e.n > 1 ? ' · ' + o.times(e.n) : '')];
            case 'device_wait':
                host = hostByMac(e.mac);
                return ['warn', o.evWait, (host ? devName(host) : e.mac) + (host && host.network ? ' · ' + host.network : '')];
            case 'device_new':
                host = hostByMac(e.mac);
                return ['', o.evNew, (host ? devName(host) : e.mac) + (host && host.network ? ' · ' + host.network : '')];
            case 'peer_on': return ['ok', o.evPeer, e.name + ' · ' + e.conn];
            case 'vpn_up': return ['ok', o.evVpnUp, e.name];
            case 'vpn_down': return ['warn', o.evVpnDown, e.name];
            case 'wan_up': return ['ok', o.evWanUp, ''];
            case 'wan_down': return ['warn', o.evWanDown, ''];
            case 'sched_on': return ['', o.evSchedOn, e.name];
            case 'sched_off': return ['', o.evSchedOff, e.name];
            case 'lists': return ['', o.evLists, ''];
            case 'boot': return ['', o.evBoot, ''];
            case 'health_disk': return ['warn', o.evDisk, '%' + e.v];
            case 'health_temp': return ['warn', o.evTemp, e.v + ' °C'];
            case 'health_update': return ['', o.evUpdate, ''];
        }
        return null;
    }

    function chartSvg(hist) {
        var max = 5;
        hist.forEach(function (r) { max = Math.max(max, r.down, r.up); });
        max = Math.ceil(max * 1.15);
        var w = 600, h = 190, step = w / Math.max(1, HISTORY - 1), offset = (HISTORY - hist.length) * step;
        function points(key) {
            return hist.map(function (r, i) {
                return (offset + i * step).toFixed(1) + ',' + (h - r[key] / max * (h - 10)).toFixed(1);
            }).join(' ');
        }
        var down = points('down');
        var area = hist.length ? offset.toFixed(1) + ',' + h + ' ' + down + ' ' + w + ',' + h : '';
        return {
            max: max,
            svg: '<svg viewBox="0 0 600 200" preserveAspectRatio="none" role="img" aria-label="' + esc(T().chartTitle) + '">' +
                '<line x1="0" y1="15" x2="600" y2="15" stroke="#EEF1F4" vector-effect="non-scaling-stroke"></line>' +
                '<line x1="0" y1="102" x2="600" y2="102" stroke="#EEF1F4" vector-effect="non-scaling-stroke"></line>' +
                '<line x1="0" y1="190" x2="600" y2="190" stroke="#D5DAE1" vector-effect="non-scaling-stroke"></line>' +
                (area ? '<polygon points="' + area + '" fill="#1F4FC7" fill-opacity="0.10"></polygon>' : '') +
                '<polyline points="' + down + '" fill="none" stroke="#1F4FC7" stroke-width="2" vector-effect="non-scaling-stroke" stroke-linejoin="round"></polyline>' +
                '<polyline points="' + points('up') + '" fill="none" stroke="#D9822B" stroke-width="2" vector-effect="non-scaling-stroke" stroke-linejoin="round"></polyline>' +
                '</svg>'
        };
    }

    /* devices held back until approved: shown on the overview and above the device list */
    function waitingBanner() {
        var t = T(), n = waitingCount();
        if (!n) { return ''; }
        return '<div class="k-banner warn k-wait" style="margin:0">' + icon(ICONS.warn, 20) +
            '<div style="flex:1 1 auto"><b>' + esc(t.apprBanner(n)) + '</b><div>' + esc(t.apprBannerSub) + '</div></div>' +
            (S.tab === 'devices' && S.ui.filter === 'waiting' ? '' :
                '<button type="button" class="k-btn small" data-act="show-waiting">' + esc(t.apprShow) + '</button>') + '</div>';
    }

    function viewDash() {
        var t = T(), o = t.ov, level = protectionLevel(S.saved), ov = S.ov || {}, test = S.ovTest || null, sys = ov.system || null;
        var online = S.hosts.filter(function (h) { return h.online; }).length;
        var dns = S.dns || {};
        var rate = S.traffic.rate;

        /* the page redraws with every traffic sample: ask for the rest when it has grown old */
        if (!document.hidden && Date.now() - (S.ovAsked || 0) > 30000) {
            S.ovAsked = Date.now();
            loadOverview().then(refreshView, function () {});
        }
        if (!document.hidden && Date.now() - (S.ovTestAsked || 0) > 60000) {
            S.ovTestAsked = Date.now();
            loadNetTest().then(refreshView, function () {});
        }

        var statusTitle = level === 'ok' ? t.statusOk : (level === 'warn' ? t.statusWarn : t.statusOff);
        var dnsActive = S.saved.general.enabled && (
            CATS.slice(0, 5).some(function (k) { return S.saved.filtering[k]; }) ||
            (S.saved.filtering.apps || []).length > 0 ||
            (S.saved.filtering.denylist || []).length > 0
        );
        var link = function (label, tab) {
            return '<button type="button" class="k-link small" data-act="tab" data-v="' + tab + '">' + esc(label) + ' →</button>';
        };
        var kv = function (k, v, mono) {
            return '<div class="k-kv"><span class="muted">' + esc(k) + '</span><span' + (mono ? ' class="mono"' : '') + '>' + v + '</span></div>';
        };

        var html = '<div class="k-stack k-ov">';
        if (!S.draft.general.welcomed) {
            /* first run, possibly on a long-configured firewall: nothing is switched on unasked */
            html += '<section class="k-card k-welcome"><div class="k-setting" style="padding:0;border:none;flex-wrap:wrap">' +
                '<div class="k-ibox big on">' + icon(ICONS.shield + ICONS.check, 24) + '</div>' +
                '<div class="k-setting-text"><b style="font-size:16px">' + esc(t.welcomeTitle) + '</b>' +
                '<span class="muted" style="font-size:14px">' + esc(t.welcomeText) + '</span></div>' +
                '<div class="k-btns"><button type="button" class="k-btn" data-act="tab" data-v="scan">' + esc(t.welcomeScan) + '</button>' +
                '<button type="button" class="k-btn" data-act="welcome-no">' + esc(t.welcomeNo) + '</button>' +
                '<button type="button" class="k-btn primary" data-act="welcome-yes">' + esc(t.welcomeYes) + '</button></div>' +
                '</div></section>';
        }

        /* ---- status: what it is like, what waits for somebody, every protection in a word, the quick switches */
        var wanUp = !!(ov.wan && ov.wan.address), ips = ov.ips || null, geo = S.saved.geo || {};
        var vpns = (ov.vpn || []).filter(function (c) { return c.enabled; });
        var vpnUp = vpns.filter(function (c) { return c.kind !== 'site' || c.connected; }).length;
        var todo = attention();
        var line = [t.statusLine(online, S.hosts.length)];
        if (ov.wan) { line.push(wanUp ? o.wanUpShort : o.noConn); }
        if (ips && ips.last) { line.push(o.lastAlert(when(ips.last))); }
        var chips = [
            [o.chkInternet, !ov.wan ? '…' : (wanUp ? o.connected + (test && test.internet && test.internet.ok ? ' · ' + fmt(test.internet.ms) + ' ms' : '') : o.noConn),
                !ov.wan ? '' : (wanUp ? 'ok' : 'warn'), 'net'],
            [t.dnsFilter, dnsActive ? t.active : t.inactive, dnsActive ? 'ok' : '', 'filter'],
            [t.tabIps, !ips ? '…' : (!ips.available || !ips.enabled ? t.off : (!ips.running ? o.notRunning : (ips.inline ? o.ipsBlocking : o.ipsWatching))),
                !ips || !ips.available || !ips.enabled ? '' : (ips.running ? 'ok' : 'warn'), 'ips'],
            [o.chkGeo, !geo.enabled ? t.off : (geo.mode === 'allow' ? o.geoAllow((geo.allowed || []).length) : o.geoBlock((geo.countries || []).length)),
                geo.enabled ? 'ok' : '', 'geo'],
            [t.tabVpn, !S.ov ? '…' : (vpns.length ? o.vpnUp(vpnUp, vpns.length) : o.none), !vpns.length ? '' : (vpnUp < vpns.length ? 'warn' : 'ok'), 'vpn']
        ];
        html += '<section class="k-card k-ov-status"><div class="k-ov-top">' +
            '<div class="k-status-main"><div class="k-badge-big ' + (level === 'ok' ? 'ok' : 'warn') + '">' +
            icon(ICONS.shield + (level === 'ok' ? ICONS.check : ICONS.alert), 28) + '</div>' +
            '<div><h1>' + esc(statusTitle) + '</h1><div class="muted" style="font-size:14px">' + esc(line.join(' · ')) + '</div></div></div>' +
            (todo.length ? '<div class="k-ov-todo"><b>' + esc(o.todoTitle(todo.length)) + '</b>' + todo.map(function (x) {
                /* without a page of its own to go to (the firewall's disk, its heat): said, not linked */
                if (!x[1]) { return '<div class="k-ov-todo-row">' + icon(ICONS.warn, 16) + '<span>' + esc(x[0]) + '</span></div>'; }
                return '<button type="button" class="k-ov-todo-row" data-act="' + x[1] + '" data-v="' + x[2] + '">' + icon(ICONS.warn, 16) +
                    '<span>' + esc(x[0]) + '</span><span class="k-ov-go">' + esc(o.show) + ' →</span></button>';
            }).join('') + '</div>' : '') + '</div>' +
            '<div class="k-ov-checks">' + chips.map(function (c) {
                return '<button type="button" class="k-info k-ov-chk" data-act="tab" data-v="' + c[3] + '"><span class="k-dot ' + c[2] + '"></span>' +
                    '<span>' + esc(c[0]) + '</span><b>' + esc(c[1]) + '</b></button>';
            }).join('') +
            '<a class="k-info k-ov-chk" href="/ui/core/firmware#status"><span class="k-dot ' + (sys && sys.update ? 'warn' : (sys ? 'ok' : '')) + '"></span>' +
            '<span>' + esc(o.chkUpdate) + '</span><b>' + esc(!sys ? '…' : (sys.update ? (sys.latest ? o.updReady(sys.latest) : o.updPending) : o.upToDate)) + '</b></a></div>' +
            '<div class="k-ov-quick"><span class="k-ov-quick-t">' + esc(t.quickTitle) + '</span>' + QUICK.map(function (k) {
                return '<span class="k-ov-q">' + toggle(!!S.draft.filtering[k], 'data-act="cat" data-v="' + k + '"', t.cats[k][0]) + esc(t.cats[k][0]) + '</span>';
            }).join('') + '<span class="k-ov-quick-all">' + link(t.editAll, 'filter') + '</span></div></section>';

        /* ---- numbers */
        var hours = ov.dns_hours || null, blockedToday = 0, totalToday = 0;
        (hours || []).forEach(function (hr) {
            if (hr[0] >= ov.midnight) { blockedToday += hr[1]; totalToday += hr[2]; }
        });
        var wait = waitingCount(), usage = ov.usage || null;
        var used = usage ? bytes(usage['in'] + usage.out) : null;
        var kpis = [
            [t.kpiOnline, fmt(online), '', t.kpiOnlineSub(S.hosts.length) + (wait ? ' · ' + o.waiting(wait) : '')],
            [o.kpiBlocked, hours ? fmt(blockedToday) : '—', '',
                hours ? (totalToday ? t.kpiBlockedSub(fmt(blockedToday / totalToday * 100, 1)) : o.noQueries) : (S.ov ? t.kpiNoStats : '…')],
            [o.kpiAlerts, ips && ips.available && ips.enabled ? fmt(ips.today) + (ips.more ? '+' : '') : '—', '',
                !ips ? '…' : (!ips.available || !ips.enabled ? o.ipsOff :
                    (ips.today ? (ips.blocked === ips.today ? o.allBlocked : o.someBlocked(ips.blocked)) + ' · ' + o.lastAt(when(ips.last)) : o.noAlerts))]
        ];
        html += '<div class="k-kpis">' + kpis.map(function (k) {
            return '<div class="k-kpi"><div class="k-kpi-label">' + esc(k[0]) + '</div>' +
                '<div class="k-kpi-value">' + esc(k[1]) + (k[2] ? '<span class="k-kpi-unit">' + esc(k[2]) + '</span>' : '') + '</div>' +
                '<div class="muted">' + esc(k[3]) + '</div></div>';
        }).join('') +
            '<div class="k-kpi"><div class="k-kpi-label">' + esc(o.kpiSpeed) + '</div><div class="k-kpi-value k-ov-two">' +
            '<span>↓ ' + esc(rate ? fmt(rate.down, 1) : '—') + '</span><span>↑ ' + esc(rate ? fmt(rate.up, 1) : '—') + '</span>' +
            '<span class="k-kpi-unit">Mbit/s</span></div><div class="muted">' + esc(t.kpiRateSub) + '</div></div>' +
            '<div class="k-kpi"><div class="k-kpi-label">' + esc(o.kpiUsage) + '</div><div class="k-kpi-value">' + esc(used ? used[0] : '—') +
            (used ? '<span class="k-kpi-unit">' + used[1] + '</span>' : '') + '</div><div class="muted">' +
            esc(usage ? '↓ ' + bytes(usage['in']).join(' ') + ' · ↑ ' + bytes(usage.out).join(' ') + (usage.from > ov.midnight + 120 ? ' · ' + o.since(clock(usage.from)) : '') :
                (S.ov ? o.usageSoon : '…')) + '</div></div></div>';

        /* ---- traffic, and the internet connection beside it */
        var chart = chartSvg(S.traffic.hist);
        html += '<div class="k-row stretch">' +
            '<section class="k-card k-grow"><div class="k-card-head"><div><h2>' + esc(t.chartTitle) + '</h2>' +
            '<div class="muted">' + esc(t.chartSub(Math.round(HISTORY * TRAFFIC_MS / 60000))) + '</div></div>' +
            '<div class="k-legend"><span><i style="background:#1F4FC7"></i>' + esc(t.legendDown) + '</span>' +
            '<span><i style="background:#D9822B"></i>' + esc(t.legendUp) + '</span></div></div>' +
            '<div class="k-chart">' + chart.svg +
            '<div class="k-axis" style="top:4px">' + esc(fmt(chart.max)) + ' Mbit/s</div>' +
            '<div class="k-axis" style="top:92px">' + esc(fmt(chart.max / 2)) + ' Mbit/s</div>' +
            (S.traffic.hist.length < 2 ? '<div class="k-axis" style="top:150px;left:40%">' + esc(t.chartWaiting) + '</div>' : '') +
            '</div><div class="k-axis-row"><span>' + esc(o.minAgo(10)) + '</span><span>' + esc(o.minAgo(5)) + '</span><span>' + esc(o.now) + '</span></div></section>';
        var ms = function (r) { return r && r.ok ? fmt(r.ms, r.ms < 10 ? 1 : 0) + ' ms' : (test ? o.noAnswer : '…'); };
        html += '<section class="k-card k-side k-ov-wan">' + (ov.wan && !ov.wan.exists ? '<div class="muted">' + esc(t.wanMissing) + '</div>' :
            '<div class="k-wan-head"><div class="k-ibox big ' + (!ov.wan || wanUp ? 'on' : 'cut') + '">' + icon(ICONS.globe, 22) + '</div>' +
            '<div><b>' + esc(!ov.wan ? '…' : (wanUp ? t.wanConnected : t.wanDown)) + '</b><span class="muted">' +
            esc(ov.wan ? (t.wanVia[ov.wan.type] || ov.wan.type) + ' · ' + ov.wan.device : '') + '</span></div></div><div>' +
            kv(t.wanIp, esc(wanUp ? ov.wan.address : '—'), true) +
            kv(o.gateway, esc(ov.wan && ov.wan.gateway ? ov.wan.gateway + (test && test.gateway && test.gateway.ok ? ' · ' + ms(test.gateway) : '') : '—'), true) +
            kv(o.latency, esc(ms(test && test.internet)), true) +
            kv(o.dnsTime, esc(ms(test && test.dns)), true) +
            kv(o.upSince, esc(wanUp && ov.wan.since ? span(ov.now - ov.wan.since) : '—')) + '</div>') +
            link(t.subWan, 'net') + '</section></div>';

        /* ---- local networks, busiest devices, VPN */
        var nets = ov.networks || [], ifr = S.traffic.nets || {};
        html += '<div class="k-ov-grid"><section class="k-card k-ov-tight"><div class="k-card-head"><h2>' + esc(t.subNets) + '</h2>' +
            '<span class="muted">' + esc(o.netsSub) + '</span></div><div>' +
            (nets.length ? nets.map(function (n) {
                var count = S.hosts.filter(function (h) { return h.online && h.network_key === n.key; }).length, r = ifr[n.key];
                return '<div class="k-list-row"><span class="k-ov-col" style="background:' + esc(n.color) + '"></span>' +
                    '<div class="k-ov-grow"><b>' + esc(n.name) + '</b><span class="muted mono">' + esc(n.cidr || '') + (n.isolated ? ' · ' + esc(o.isolated) : '') + '</span></div>' +
                    '<button type="button" class="k-badge k-devlink" data-act="show-net" data-v="' + esc(n.key) + '" data-n="' + esc(n.name) + '" title="' + esc(t.fNetworkShow) + '">' + esc(o.devs(count)) + '</button>' +
                    '<span class="k-ov-rate"><span>↓ ' + esc(r ? fmt(r.down, 1) : '—') + '</span><span>↑ ' + esc(r ? fmt(r.up, 1) : '—') + '</span></span></div>';
            }).join('') : '<div class="muted">' + esc(S.ov ? o.none : '…') + '</div>') + '</div>' + link(t.subNets, 'nets') + '</section>';

        var top = S.hosts.filter(function (h) { return h.states > 0; })
            .sort(function (a, b) { return b.states - a.states; }).slice(0, 5);
        var topMax = top.length ? top[0].states : 1;
        html += '<section class="k-card k-ov-tight"><div class="k-card-head"><h2>' + esc(t.topDevTitle) + '</h2>' +
            '<span class="muted">' + esc(t.topDevSub) + '</span></div>' +
            (top.length ? top.map(function (h) {
                return '<div class="k-ov-top-row"><div><span class="k-grow-text"><b>' + esc(devName(h)) + '</b>' +
                    (h.network ? ' <span class="muted">· ' + esc(h.network) + '</span>' : '') + '</span>' +
                    '<span>' + esc(t.conns(h.states)) + '</span></div>' +
                    '<div class="k-bar"><div style="width:' + Math.max(3, Math.round(h.states / topMax * 100)) + '%"></div></div></div>';
            }).join('') : '<div class="muted">' + esc(!S.hostsLoaded ? '…' : (S.hosts.length ? t.noActive : t.noDevicesYet)) + '</div>') +
            link(t.allDevices, 'devices') + '</section>';

        html += '<section class="k-card k-ov-tight"><div class="k-card-head"><h2>' + esc(t.tabVpn) + '</h2>' +
            '<span class="muted">' + esc(vpns.length ? o.vpnUp(vpnUp, vpns.length) : '') + '</span></div><div>' +
            ((ov.vpn || []).length ? ov.vpn.map(function (c) {
                var up = c.enabled && (c.kind !== 'site' || c.connected);
                var state = !c.enabled ? t.vpnDisabled : (c.kind !== 'site' ? o.peers(c.online.length, c.peers) :
                    (c.connected ? t.vpnConnected + (c.up_for ? ' · ' + span(c.up_for) : '') : o.noConn));
                return '<div class="k-list-row"><span class="k-dot ' + (!c.enabled ? '' : (up ? 'ok' : 'warn')) + '"></span>' +
                    '<div class="k-ov-grow"><b>' + esc(c.name) + '</b><span class="muted">' +
                    esc((c.kind === 'site' ? t.vpnKindSite : t.vpnKindRemote) + ' · ' + (c.type === 'ipsec' ? 'IPsec' : 'WireGuard')) + '</span></div>' +
                    '<span class="' + (c.enabled && !up ? 'k-warn-text' : 'muted') + '">' + esc(state) + '</span></div>';
            }).join('') : '<div class="muted">' + esc(S.ov ? o.vpnNone : '…') + '</div>') + '</div>' + link(t.tabVpn, 'vpn') + '</section></div>';

        /* ---- blocked requests, what happened, the system */
        var blockedRows;
        if (!dns.enabled) {
            blockedRows = '<div class="muted">' + esc(t.statsOff) + '</div>';
        } else if (!dns.top_blocked || !dns.top_blocked.length) {
            blockedRows = '<div class="muted">' + esc(t.noBlocked) + '</div>';
        } else {
            blockedRows = dns.top_blocked.slice(0, 4).map(function (b) {
                return '<div class="k-list-row"><span class="k-grow-text mono">' + esc(b.domain) + '</span>' +
                    '<span class="k-badge k-ov-list">' + esc(b.custom ? t.customList : b.list) + '</span>' +
                    '<span class="k-ov-num">' + esc(fmt(b.total)) + '</span></div>';
            }).join('');
        }
        var hmax = 1;
        (hours || []).forEach(function (hr) { hmax = Math.max(hmax, hr[1]); });
        html += '<div class="k-ov-grid"><section class="k-card k-ov-tight"><div class="k-card-head"><h2>' + esc(o.blockedTitle) + '</h2>' +
            '<span class="muted">' + esc(o.blockedSub) + '</span></div>' +
            (hours && hours.length ? '<div class="k-ov-bars-wrap"><span class="k-ov-bars-max">' + esc(fmt(hmax)) + '</span>' +
                '<div class="k-ov-bars" role="img" aria-label="' + esc(o.blockedTitle) + '">' + hours.map(function (hr) {
                    return '<i style="height:' + (hr[1] ? Math.max(3, Math.round(hr[1] / hmax * 100)) : 0) + '%" title="' + esc(when(hr[0]) + ' · ' + o.reqs(fmt(hr[1]))) + '"></i>';
                }).join('') + '</div></div><div class="k-axis-row"><span>' + esc(when(hours[0][0])) + '</span><span>' + esc(o.now) + '</span></div>' : '') +
            '<div>' + blockedRows + '</div></section>';

        var events = (ov.events || []).map(function (e) { var x = eventText(e); return x ? [e.t].concat(x) : null; })
            .filter(function (x) { return x; }).slice(0, 6);
        html += '<section class="k-card k-ov-tight"><div class="k-card-head"><h2>' + esc(o.evTitle) + '</h2></div><div>' +
            (events.length ? events.map(function (e) {
                return '<div class="k-ov-ev"><span class="muted mono">' + esc(when(e[0])) + '</span><span class="k-dot ' + e[1] + '"></span>' +
                    '<div><b>' + esc(e[2]) + '</b>' + (e[3] ? '<span class="muted" title="' + esc(e[3]) + '">' + esc(e[3]) + '</span>' : '') + '</div></div>';
            }).join('') : '<div class="muted">' + esc(S.ov ? o.evNone : '…') + '</div>') + '</div></section>';

        var meter = function (name, pct, value) {
            return '<div class="k-ov-meter"><div><span>' + esc(name) + '</span><span class="muted">' + esc(value) + '</span></div>' +
                '<div class="k-bar"><div style="width:' + Math.min(100, Math.max(0, Math.round(pct))) + '%' + (pct >= 90 ? ';background:var(--k-warn)' : '') + '"></div></div></div>';
        };
        var part = function (x) { return bytes(x.used).join(' ') + ' / ' + bytes(x.total).join(' '); };
        html += '<section class="k-card k-ov-tight"><div class="k-card-head"><h2>' + esc(o.sysTitle) + '</h2>' +
            '<span class="muted">' + esc(sys && sys.boot ? o.upFor(span(ov.now - sys.boot)) : '') + '</span></div>' +
            (sys ? (sys.cpu !== null ? meter(o.cpu, sys.cpu, o.pct(sys.cpu)) : '') +
                (sys.memory ? meter(o.memory, sys.memory.used / sys.memory.total * 100, part(sys.memory)) : '') +
                (sys.disk ? meter(o.disk, sys.disk.used / sys.disk.total * 100, part(sys.disk)) : '') +
                (sys.temperature !== null ? meter(o.temp, sys.temperature, fmt(sys.temperature) + ' °C') : '') +
                '<div>' + kv(o.version, esc(sys.product + ' ' + sys.version)) +
                kv(o.chkUpdate, sys.update ? '<a class="k-pill warn k-ov-pill" href="/ui/core/firmware#status">' + esc(sys.latest ? o.updReady(sys.latest) : o.updPending) + '</a>' : esc(o.upToDate)) +
                (sys.config_changed ? kv(o.cfgChanged, esc(when(sys.config_changed))) : '') + '</div>' :
                '<div class="muted">…</div>') + '</section></div>';

        return html + '</div>';
    }

    /* ------------------------------------------------------------------ view: devices */

    function filteredHosts() {
        var q = S.ui.search.trim().toLowerCase();
        return S.hosts.filter(function (h) {
            var cfg = devCfg(h.mac);
            if (S.ui.net && h.network_key !== S.ui.net.key) { return false; }
            if (S.ui.filter === 'online' && !h.online) { return false; }
            if (S.ui.filter === 'blocked' && !cfg.blocked) { return false; }
            if (S.ui.filter === 'waiting' && !waiting(h)) { return false; }
            if (!q) { return true; }
            return (devName(h) + ' ' + (h.network || '') + ' ' + h.ips.join(' ') + ' ' + h.mac + ' ' + h.vendor + ' ' + h.hostname).toLowerCase().indexOf(q) >= 0;
        }).sort(function (a, b) {
            var byName = devName(a).localeCompare(devName(b), T().locale), sort = S.ui.sort;
            if (sort && SORTS[sort.col]) {
                return sort.dir * SORTS[sort.col](a, b) || byName;
            }
            return (waiting(b) - waiting(a)) || (b.online - a.online) || byName;
        });
    }

    /* the address the device uses, if that is an IPv4 address */
    function hostIp4(h) {
        return h.ips && h.ips[0] && ipToInt(h.ips[0]) !== null ? h.ips[0] : '';
    }

    /*
     * column sorting: what a first click on the heading gives (a second click reverses, a third goes back
     * to the usual order). Devices without a value always come after the ones that have one.
     */
    var SORTS = {
        name: function (a, b) { return devName(a).localeCompare(devName(b), T().locale); },
        /* by network, inside a network by address */
        network: function (a, b) {
            if (!a.network || !b.network) { return a.network ? -1 : (b.network ? 1 : 0); }
            return a.network.localeCompare(b.network, T().locale) || SORTS.ip(a, b);
        },
        ip: function (a, b) {
            var x = hostIp4(a), y = hostIp4(b);
            if (!x || !y) { return x ? -1 : (y ? 1 : (a.ips[0] || '~').localeCompare(b.ips[0] || '~')); }
            return ipToInt(x) - ipToInt(y);
        },
        mac: function (a, b) { return a.mac.localeCompare(b.mac); },
        /* online first, then whoever was here last */
        seen: function (a, b) {
            return (b.online - a.online) || ((Date.parse(b.last_seen) || 0) - (Date.parse(a.last_seen) || 0));
        },
        conns: function (a, b) { return (b.states || 0) - (a.states || 0); },
        /* the ones that cannot get out first: waiting for approval, internet cut, open */
        net: function (a, b) {
            var rank = function (h) { return waiting(h) ? 0 : (devCfg(h.mac).blocked ? 1 : 2); };
            return rank(a) - rank(b);
        }
    };
    /* which way the values run after the first click, for the arrow: 1 = small to large */
    var SORT_RUNS = { name: 1, network: 1, ip: 1, mac: 1, seen: -1, conns: -1, net: 1 };

    function sortHead(col, label) {
        var t = T(), sort = S.ui.sort, on = sort && sort.col === col, up = on && sort.dir * SORT_RUNS[col] > 0;
        return '<th' + (on ? ' aria-sort="' + (up ? 'ascending' : 'descending') + '"' : '') + '>' +
            '<button type="button" class="k-th' + (on ? ' on' : '') + '" data-act="sort" data-v="' + col + '" title="' + esc(t.sortHint) + '">' +
            esc(label) + '<span class="k-th-arrow" aria-hidden="true">' + (on ? (up ? '▲' : '▼') : '') + '</span></button></th>';
    }

    /* the device is there, on a network where we hand out addresses, with an address we did not hand out */
    function selfAddressed(h) {
        var ip = hostIp4(h);
        return !!(h.online && h.dhcp === false && ip && dhcpNetOf(ip));
    }

    /* the network a device is on: its name, with the network's colour */
    function networkBadge(h) {
        if (!h.network) { return '<span class="muted">—</span>'; }
        var net = (S.options.interfaces || []).filter(function (i) { return i.key === h.network_key; })[0];
        return '<span class="k-netbadge"><span class="k-dot" style="background:' + esc(net && net.color ? net.color : '#5B6573') + '"></span>' +
            esc(h.network) + '</span>';
    }

    /* the devices on the open page; a changed filter, search or order starts at the first page again */
    function devicePage() {
        var rows = filteredHosts(), ui = S.ui;
        var sig = [ui.filter, ui.net ? ui.net.key : '', ui.search, ui.sort ? ui.sort.col + ui.sort.dir : ''].join('|');
        if (sig !== ui.pageSig) { ui.pageSig = sig; ui.page = 0; }
        ui.size = ui.size || 50;
        ui.page = Math.max(0, Math.min(ui.page || 0, Math.ceil(rows.length / ui.size) - 1));
        return { total: rows.length, rows: rows.slice(ui.page * ui.size, (ui.page + 1) * ui.size) };
    }

    function devicePager() {
        return pager(devicePage().total, S.ui.page, S.ui.size, 'devpage');
    }

    /* cut off for a while (Devices page): until when, 0 when not or when the time is up */
    function pausedUntil(h) {
        return h && h.paused && h.paused * 1000 > Date.now() ? h.paused : 0;
    }

    function clock(ts) {
        var d = new Date(ts * 1000), two = function (n) { return (n < 10 ? '0' : '') + n; };
        return two(d.getHours()) + ':' + two(d.getMinutes());
    }

    function pauseDevice(mac, payload, resume) {
        payload.mac = mac;
        api('POST', '/api/inversapanel/devices/' + (resume ? 'resume' : 'pause'), payload).then(function (res) {
            if (!res || res.status !== 'ok') { throw res; }
            return loadHosts();
        }).then(function () { redraw('main'); }, function () {
            S.ui.notice = { type: 'err', text: T().applyFailed, list: [] };
            renderPending();
        });
    }

    function deviceRows() {
        var t = T(), rows = devicePage().rows;
        if (!rows.length) {
            return '<tr><td colspan="7" class="k-empty" style="text-align:center">' +
                esc(S.hosts.length ? t.noResult : (S.hostsLoaded ? t.noDevicesYet : '…')) + '</td></tr>';
        }
        return rows.map(function (h) {
            var cfg = devCfg(h.mac), cut = !!cfg.blocked, name = devName(h), wait = waiting(h), paused = cut ? 0 : pausedUntil(h);
            var status = h.online ? t.online : (ago(h.last_seen) || t.offline);
            /* a fixed address the device did not pick up yet is shown as such, not as a label on the old address */
            var fixed = (S.saved.reservations || {})[h.mac] || '', moving = fixed && hostIp4(h) && h.ips[0] !== fixed;
            return '<tr class="' + (S.ui.sel === h.mac ? 'sel' : (cut || wait ? 'cut' : '')) + '">' +
                '<td><div class="k-dev"><div class="k-ibox ' + (cut || wait ? 'cut' : 'on') + '">' + icon(ICONS[cfg.type] || ICONS.unknown, 20) + '</div>' +
                '<button type="button" class="k-dev-name" data-act="sel" data-mac="' + esc(h.mac) + '" aria-label="' + esc(t.editAria(name)) + '">' +
                '<span style="min-width:0"><b>' + esc(name) + '</b><span class="muted">' + esc(h.vendor || t.unknownVendor) + '</span></span>' +
                '<span style="color:#5B6573;flex:none">' + icon(ICONS.pencil, 15) + '</span></button></div></td>' +
                '<td>' + networkBadge(h) + '</td>' +
                '<td class="mono">' + esc(h.ips[0] || '—') + (h.ips.length > 1 ? ' <span class="muted">+' + (h.ips.length - 1) + '</span>' : '') +
                    (fixed ? ' <span class="k-badge" title="' + esc(moving ? t.dIpRenew : t.dFixedIp + ': ' + fixed) + '">' + esc(moving ? t.dFixedShort + ' → ' + fixed : t.dFixedShort) + '</span>' : '') +
                    (selfAddressed(h) ? ' <span class="k-badge" title="' + esc(t.dIpManual(h.ips[0])) + '">' + esc(t.dManualShort) + '</span>' : '') + '</td>' +
                '<td class="mono" style="color:#36404D">' + esc(h.mac) + '</td>' +
                '<td><span style="display:inline-flex;align-items:center;gap:6px;font-size:13px;color:#36404D">' +
                '<span class="k-dot ' + (h.online ? 'ok' : '') + '"></span>' + esc(status) + '</span></td>' +
                '<td style="font-variant-numeric:tabular-nums">' + esc(fmt(h.states)) + '</td>' +
                (wait ?
                    '<td><div class="k-net"><span class="k-net-label cut">' + esc(t.apprWaiting) + '</span>' +
                    '<button type="button" class="k-btn small primary" data-act="approve" data-mac="' + esc(h.mac) + '" aria-label="' + esc(t.apprApproveAria(name)) + '">' + esc(t.apprApprove) + '</button></div></td>' :
                    '<td><div class="k-net"><span class="k-net-label' + (cut || paused ? ' cut' : '') + '">' + esc(cut ? t.netOff : (paused ? t.pauseUntil(clock(paused)) : t.netOn)) + '</span>' +
                    toggle(!cut, 'data-act="cut" data-mac="' + esc(h.mac) + '"', t.cutAria(name), cut ? 'cut' : '') + '</div>' +
                    /* on a network that asks for approval: the permission to be on it, next to the internet switch */
                    (approvalOn(h.network_key) ? '<div class="k-net k-net-appr"><span class="k-net-label">' + esc(t.dApprovalShort) + '</span>' +
                        toggle(!!cfg.approved, 'data-act="approval" data-mac="' + esc(h.mac) + '"', t.apprToggleAria(name)) + '</div>' : '') + '</td>') +
                '</tr>';
        }).join('');
    }

    function fixedIpField(h) {
        var t = T(), mac = h.mac;
        var val = (S.draft.reservations || {})[mac] || '', saved = (S.saved.reservations || {})[mac] || '';
        var current = (h.ips || []).filter(function (ip) { return ipToInt(ip) !== null; })[0] || '';
        var net = dhcpNetOf(val || current), hint, self = selfAddressed(h), own = self ? dhcpNetOf(current) : null;
        /* nothing we set reaches a device that does not ask DHCP: say so, and warn when its address may be handed to someone else */
        var note = !self ? '' : '<span class="k-note">' + esc(t.dIpManual(current)) + '</span>' +
            (saved !== current && ipToInt(current) >= ipToInt(own.from) && ipToInt(current) <= ipToInt(own.to) ?
                '<span class="k-note warn">' + esc(t.dIpManualPool(own.from, own.to)) + '</span>' : '');
        if (val && ipToInt(val) === null) {
            hint = '<span class="k-warn-text">' + esc(t.dIpInvalid) + '</span>';
        } else if (val && !dhcpNetOf(val)) {
            hint = '<span class="k-warn-text">' + esc(t.dIpNoNet) + '</span>';
        } else if (val && net && ipToInt(val) >= ipToInt(net.from) && ipToInt(val) <= ipToInt(net.to)) {
            hint = '<span class="muted small">' + esc(t.dIpInRange(net.from, net.to)) + '</span>';
        } else if (net) {
            hint = '<span class="muted small">' + esc(t.dIpHint(net.cidr, net.from, net.to)) + '</span>';
        } else {
            hint = '<span class="muted small">' + esc(t.dIpAutoHint) + '</span>';
        }
        return '<label class="k-field"><span>' + esc(t.dFixedIp) + '</span>' + note +
            '<div style="display:flex;gap:8px"><input type="text" class="mono" style="flex:1 1 auto;min-width:0" inputmode="decimal" autocomplete="off" data-input="devip" data-mac="' + esc(mac) + '" value="' + esc(val) + '" placeholder="' + esc(t.dIpAuto) + '">' +
            (!val && current && dhcpNetOf(current) ? '<button type="button" class="k-btn small" data-act="fixip" data-mac="' + esc(mac) + '" data-v="' + esc(current) + '" title="' + esc(t.dIpPinHint) + '">' + esc(t.dIpPin) + '</button>' : '') +
            (val ? '<button type="button" class="k-btn small" data-act="fixip" data-mac="' + esc(mac) + '" data-v="">' + esc(t.dIpClear) + '</button>' : '') + '</div>' +
            hint + (!self && (val !== saved || (val && current && val !== current)) ? '<span class="muted small">' + esc(t.dIpRenew) + '</span>' : '') + '</label>';
    }

    function devicePanel() {
        var t = T(), h = hostByMac(S.ui.sel);
        if (!h) { return ''; }
        var cfg = devCfg(h.mac), cut = !!cfg.blocked, name = devName(h), wait = waiting(h);
        var info = [
            [t.dMac, h.mac],
            [t.dVendor, h.vendor || t.unknownVendor],
            [t.dHostname, h.hostname || '—'],
            [t.dNetwork, h.network || '—'],
            [t.dIps, h.ips.length ? h.ips.join(', ') : '—'],
            [t.dFirst, ago(h.first_seen) || '—'],
            [t.dLast, h.online ? t.online : (ago(h.last_seen) || '—')]
        ];
        return '<aside class="k-card k-side" aria-label="' + esc(name) + '" style="gap:18px">' +
            '<div style="display:flex;align-items:center;gap:12px"><div class="k-ibox big ' + (cut || wait ? 'cut' : 'on') + '">' + icon(ICONS[cfg.type] || ICONS.unknown, 24) + '</div>' +
            '<div style="flex:1 1 auto;min-width:0"><div style="font-weight:600;font-size:16px">' + esc(name) + '</div>' +
            '<div class="muted">' + esc(h.ips[0] || h.mac) + '</div></div>' +
            '<button type="button" class="k-icon-btn" data-act="sel" data-mac="" aria-label="' + esc(t.close) + '">' + icon(ICONS.close, 18) + '</button></div>' +
            (wait ? '<div class="k-banner warn" style="margin:0;align-items:center;flex-wrap:wrap">' + icon(ICONS.warn, 20) + '<span style="flex:1 1 180px">' + esc(t.apprPanel) + '</span>' +
                '<button type="button" class="k-btn small primary" data-act="approve" data-mac="' + esc(h.mac) + '">' + esc(t.apprApprove) + '</button></div>' : '') +
            '<label class="k-field"><span>' + esc(t.dName) + '</span>' +
            '<input type="text" maxlength="64" data-input="devname" data-mac="' + esc(h.mac) + '" value="' + esc(cfg.name) + '" placeholder="' + esc(h.hostname || t.unnamed) + '"></label>' +
            fixedIpField(h) +
            '<div class="k-field"><span>' + esc(t.dType) + '</span><div class="k-types">' +
            TYPES.map(function (type) {
                var on = cfg.type === type;
                return '<button type="button" class="k-type' + (on ? ' on' : '') + '" data-act="type" data-v="' + type + '" aria-pressed="' + on + '" ' +
                    'aria-label="' + esc(t.types[type]) + '" title="' + esc(t.types[type]) + '">' + icon(ICONS[type], 20) + '</button>';
            }).join('') + '</div><span class="muted">' + esc(t.types[cfg.type] || '') + '</span></div>' +
            '<div>' + info.map(function (kv) {
                return '<div class="k-kv"><span class="muted">' + esc(kv[0]) + '</span><span>' + esc(kv[1]) + '</span></div>';
            }).join('') + '</div>' +
            '<div class="k-setting" style="padding:0"><div class="k-setting-text"><b>' + esc(t.dNet) + '</b><span class="muted">' + esc(t.dNetSub) + '</span></div>' +
            toggle(!cut, 'data-act="cut" data-mac="' + esc(h.mac) + '"', t.dNet, cut ? 'cut' : '') + '</div>' +
            /* for a while, right away, back by itself; not for a device that is cut anyway or still waits */
            (cut || wait ? '' : '<div class="k-field"><span>' + esc(t.pauseTitle) + '</span>' +
                (pausedUntil(h) ?
                    '<div class="k-banner warn" style="margin:0;align-items:center;flex-wrap:wrap">' + icon(ICONS.warn, 20) + '<span style="flex:1 1 140px">' + esc(t.pauseUntilLong(clock(pausedUntil(h)))) + '</span>' +
                    '<button type="button" class="k-btn small primary" data-act="resume" data-mac="' + esc(h.mac) + '">' + esc(t.pauseResume) + '</button></div>' :
                    '<div class="k-types">' + [['30', t.pause30], ['60', t.pause60], ['120', t.pause120], ['morning', t.pauseMorning]].map(function (o) {
                        return '<button type="button" class="k-btn small" data-act="pause" data-mac="' + esc(h.mac) + '" data-v="' + o[0] + '">' + esc(o[1]) + '</button>';
                    }).join('') + '</div>') +
                '<span class="muted small" style="font-weight:400">' + esc(t.pauseSub) + '</span></div>') +
            /* a device that is off can be asked to switch on, if it listens for that (Wake-on-LAN) */
            (h.online ? '' : '<div class="k-setting" style="padding:0"><div class="k-setting-text"><b>' + esc(t.wakeTitle) + '</b><span class="muted">' + esc(t.wakeSub) + '</span></div>' +
                '<button type="button" class="k-btn small" data-act="wake" data-mac="' + esc(h.mac) + '">' + esc(t.wakeBtn) + '</button></div>') +
            /* only where it means something: the device's network asks for approval */
            (approvalOn(h.network_key) ? '<div class="k-setting" style="padding:0"><div class="k-setting-text"><b>' + esc(t.dApproval) + '</b><span class="muted">' + esc(t.dApprovalSub) + '</span></div>' +
                toggle(!!cfg.approved, 'data-act="approval" data-mac="' + esc(h.mac) + '"', t.dApproval) + '</div>' : '') +
            '</aside>';
    }

    function viewDevices() {
        var t = T();
        /* a network chosen on another page narrows the list; the numbers on the filters follow it */
        var net = S.ui.net, pool = S.hosts.filter(function (h) { return !net || h.network_key === net.key; });
        var counts = {
            all: pool.length,
            online: pool.filter(function (h) { return h.online; }).length,
            blocked: pool.filter(function (h) { return devCfg(h.mac).blocked; }).length,
            waiting: pool.filter(function (h) { return waiting(h); }).length
        };
        /* the networks to choose from: the main one first, then by name */
        var nets = (S.options.interfaces || []).filter(function (i) { return i.selected || S.hosts.some(function (h) { return h.network_key === i.key; }); })
            .sort(function (a, b) { return (b.key === 'lan') - (a.key === 'lan') || a.name.localeCompare(b.name, t.locale); });
        if (net && !nets.some(function (i) { return i.key === net.key; })) { S.ui.net = net = null; pool = S.hosts; }
        var shown = filteredHosts().length;
        var anyApproval = Object.keys(S.saved.approval || {}).some(function (k) { return S.saved.approval[k]; });
        if (S.ui.filter === 'waiting' && !anyApproval) { S.ui.filter = 'all'; }
        var filters = [['all', t.fAll], ['online', t.fOnline], ['blocked', t.fBlocked]].concat(anyApproval ? [['waiting', t.fWaiting]] : []).map(function (f) {
            var on = S.ui.filter === f[0];
            return '<button type="button" class="k-chip' + (on ? ' on' : '') + '" data-act="filter" data-v="' + f[0] + '" aria-pressed="' + on + '">' +
                esc(f[1]) + ' <span class="k-count">' + counts[f[0]] + '</span></button>';
        }).join('');
        return '<div class="k-stack">' +
            '<div><h1>' + esc(t.devTitle) + '</h1><div class="muted" style="font-size:14px;margin-top:4px">' + esc(t.devSub) + '</div></div>' +
            waitingBanner() +
            (S.hostsLoaded && S.source !== 'discovery' ? '<div class="k-banner info" style="margin:0">' + icon(ICONS.info, 20) + '<span>' + esc(t.discoveryHint) + '</span></div>' : '') +
            '<div class="k-filterbar"><label class="k-search">' + icon(ICONS.search) +
            '<input type="search" data-input="search" value="' + esc(S.ui.search) + '" placeholder="' + esc(t.search) + '" aria-label="' + esc(t.search) + '"></label>' +
            (nets.length > 1 ? '<div class="k-fgroup"><span class="k-flabel">' + esc(t.colNetwork) + '</span><div class="k-chips" role="group" aria-label="' + esc(t.colNetwork) + '">' +
                '<button type="button" class="k-chip' + (net ? '' : ' on') + '" data-act="netfilter" data-v="" aria-pressed="' + !net + '">' + esc(t.fAll) + '</button>' +
                nets.map(function (i) {
                    var on = !!net && net.key === i.key;
                    return '<button type="button" class="k-chip' + (on ? ' on' : '') + '" data-act="netfilter" data-v="' + esc(i.key) + '" data-n="' + esc(i.name) + '" aria-pressed="' + on + '">' +
                        '<span class="k-dot" style="background:' + esc(i.color || '') + '"></span>' + esc(i.name) +
                        ' <span class="k-count">' + S.hosts.filter(function (h) { return h.network_key === i.key; }).length + '</span></button>';
                }).join('') + '</div></div>' : '') +
            '<div class="k-fgroup"><span class="k-flabel">' + esc(t.colSeen) + '</span><div class="k-chips" role="group" aria-label="' + esc(t.colSeen) + '">' + filters + '</div></div>' +
            '<div class="k-fsum"><span class="muted">' + esc(t.fShown(shown, S.hosts.length)) + '</span>' +
            (net || S.ui.filter !== 'all' || S.ui.search ? '<button type="button" class="k-link small" data-act="filter-reset">' + esc(t.fReset) + '</button>' : '') + '</div></div>' +
            '<div class="k-row"><div class="k-table-box k-grow"><table class="k-table"><thead><tr>' +
            sortHead('name', t.colDevice) + sortHead('network', t.colNetwork) + sortHead('ip', t.colIp) + sortHead('mac', t.colMac) +
            sortHead('seen', t.colSeen) + sortHead('conns', t.colConns) + sortHead('net', t.colNet) +
            '</tr></thead><tbody id="k-devrows">' + deviceRows() + '</tbody></table><div id="k-devpager">' + devicePager() + '</div></div>' +
            devicePanel() + '</div></div>';
    }

    /* ------------------------------------------------------------------ view: blocking */

    function viewFilter() {
        var t = T(), f = S.draft.filtering;
        var html = '<div class="k-stack">' +
            '<div><h1>' + esc(t.filtTitle) + '</h1><div class="muted" style="font-size:14px;margin-top:4px">' + esc(t.filtSub) + '</div></div>';
        if (!f.forcedns) {
            html += '<div class="k-banner warn" style="margin:0">' + icon(ICONS.warn, 20) + '<span>' + esc(t.warnDns) + '</span></div>';
        }
        html += '<div class="k-row"><section class="k-card k-half" style="gap:0"><h2 style="margin-bottom:8px">' + esc(t.catTitle) + '</h2>' +
            CATS.map(function (k) {
                var on = !!f[k];
                return '<div class="k-setting"><div class="k-ibox' + (on ? ' on' : '') + '">' + icon(ICONS[k], 20) + '</div>' +
                    '<div class="k-setting-text"><b>' + esc(t.cats[k][0]) + '</b><div class="muted">' + esc(t.cats[k][1]) + '</div>' +
                    '<div class="small" style="color:#6B7482;margin-top:2px">' + esc(t.cats[k][2]) + '</div></div>' +
                    toggle(on, 'data-act="cat" data-v="' + k + '"', t.cats[k][0]) + '</div>';
            }).join('') + '</section>';

        html += '<section class="k-card k-half"><div><h2>' + esc(t.appsTitle) + '</h2><div class="muted">' + esc(t.appsSub) + '</div></div>' +
            '<div class="k-apps">' + (S.options.apps || []).map(function (app) {
                var on = (f.apps || []).indexOf(app.key) >= 0;
                return '<button type="button" class="k-app' + (on ? ' on' : '') + '" data-act="app" data-v="' + esc(app.key) + '" aria-pressed="' + on + '">' +
                    '<span class="k-mono">' + esc(String(app.name).charAt(0)) + '</span>' +
                    '<span class="k-app-text"><b>' + esc(app.name) + '</b><span>' + esc(on ? t.blocked : t.allowed) + '</span></span></button>';
            }).join('') + '</div></section></div>';

        return html + '</div>';
    }

    /* allow list and block list: domains that are never / always blocked */
    function viewLists() {
        var t = T(), f = S.draft.filtering;
        return '<div class="k-stack">' +
            '<div><h1>' + esc(t.listsTitle) + '</h1><div class="muted" style="font-size:14px;margin-top:4px">' + esc(t.listsSub) + '</div></div>' +
            '<div class="k-row stretch">' +
            [['allowlist', 'allow', t.allowTitle, t.allowDesc], ['denylist', 'deny', t.denyTitle, t.denyDesc]].map(function (l) {
                var err = S.ui.listError[l[1]];
                return '<section class="k-card k-half" style="gap:10px">' +
                    '<div><h2>' + esc(l[2]) + '</h2><div class="muted">' + esc(l[3]) + '</div></div>' +
                    '<div class="k-addrow"><input type="text" class="mono" data-input="domain" data-list="' + l[1] + '" ' +
                    'value="' + esc(S.ui[l[1] + 'Input']) + '" placeholder="ornek.com" aria-label="' + esc(l[2]) + '">' +
                    '<button type="button" class="k-btn soft" data-act="list-add" data-list="' + l[1] + '">' + esc(t.add) + '</button></div>' +
                    (err ? '<div class="small" style="color:#9A3B0A;font-weight:500">' + esc(err) + '</div>' : '') +
                    ((f[l[0]] || []).length ? '<div class="k-chips">' + f[l[0]].map(function (domain) {
                        return '<span class="k-tag ' + l[1] + ' mono"><span>' + esc(domain) + '</span>' +
                            '<button type="button" data-act="list-del" data-list="' + l[1] + '" data-v="' + esc(domain) + '" ' +
                            'aria-label="' + esc(t.removeAria(domain)) + '">' + icon(ICONS.close, 14) + '</button></span>';
                    }).join('') + '</div>' : '<div class="muted">' + esc(t.listEmpty) + '</div>') + '</section>';
            }).join('') + '</div></div>';
    }

    /* ------------------------------------------------------------------ view: settings */

    function viewSettings() {
        var t = T(), g = S.draft.general;
        var html = '<div class="k-stack"><h1>' + esc(t.setTitle) + '</h1><section class="k-card tight">';

        html += '<div class="k-setting wrap"><div class="k-setting-text"><b>' + esc(t.enabledLabel) + '</b><span class="muted">' + esc(t.enabledSub) + '</span></div>' +
            toggle(g.enabled, 'data-act="general" data-v="enabled"', t.enabledLabel) + '</div>';

        html += '<div class="k-setting wrap"><div class="k-setting-text"><b>' + esc(t.langLabel) + '</b><span class="muted">' + esc(t.langSub) + '</span></div>' +
            langSelect() + '</div>';

        html += '<div class="k-setting wrap"><div class="k-setting-text"><b>' + esc(t.ifLabel) + '</b><span class="muted">' + esc(t.ifSub) + '</span></div>' +
            '<div class="k-chips">' + (S.options.interfaces || []).map(function (i) {
                var on = (g.interfaces || []).indexOf(i.key) >= 0;
                return '<button type="button" class="k-chip' + (on ? ' on' : '') + '" data-act="iface" data-v="' + esc(i.key) + '" aria-pressed="' + on + '">' + esc(i.name) + '</button>';
            }).join('') + '</div></div>';

        html += '<div class="k-setting wrap"><div class="k-setting-text"><b>' + esc(t.respLabel) + '</b><span class="muted">' + esc(t.respSub) + '</span></div>' +
            '<div class="k-seg" role="group" aria-label="' + esc(t.respLabel) + '">' + [['zero', '0.0.0.0'], ['nxdomain', 'NXDOMAIN']].map(function (o) {
                var on = S.draft.filtering.response === o[0];
                return '<button type="button" class="' + (on ? 'on' : '') + '" data-act="resp" data-v="' + o[0] + '" aria-pressed="' + on + '">' + esc(o[1]) + '</button>';
            }).join('') + '</div></div>';

        html += '<div class="k-setting wrap"><div class="k-setting-text"><b>' + esc(t.statsLabel) + '</b><span class="muted">' + esc(t.statsSub) + '</span></div>' +
            toggle(g.dnsstats, 'data-act="general" data-v="dnsstats"', t.statsLabel) + '</div>';

        html += '</section><div class="k-banner info" style="margin:0">' + icon(ICONS.info, 20) + '<span>' + esc(t.infoNote) + '</span></div>';
        html += '<section class="k-card tight"><div class="k-setting wrap"><div class="k-setting-text"><b>' + esc(t.cleanupTitle) + '</b>' +
            '<span class="muted">' + esc(t.cleanupText) + '</span></div>' +
            '<button type="button" class="k-btn" style="color:#9A3B0A;border-color:#F2C99B" data-act="cleanup">' + esc(t.cleanupBtn) + '</button></div></section></div>';
        return html;
    }

    /* ------------------------------------------------------------------ actions */

    function toggleInList(list, value) {
        var out = (list || []).slice(), idx = out.indexOf(value);
        if (idx >= 0) { out.splice(idx, 1); } else { out.push(value); }
        return out;
    }

    function addDomain(which) {
        var t = T(), key = which === 'allow' ? 'allowlist' : 'denylist';
        var value = String(S.ui[which + 'Input'] || '').trim().toLowerCase()
            .replace(/^[a-z]+:\/\//, '').replace(/[\/:].*$/, '').replace(/^\*\./, '');
        if (!DOMAIN_RE.test(value)) {
            S.ui.listError[which] = t.invalidDomain;
        } else {
            S.ui.listError[which] = null;
            if (S.draft.filtering[key].indexOf(value) < 0) {
                S.draft.filtering[key] = S.draft.filtering[key].concat([value]);
            }
            S.ui[which + 'Input'] = '';
        }
        renderBanners();
        renderMain();
        var input = root.querySelector('input[data-list="' + which + '"]');
        if (input) { input.focus(); }
    }

    function apply() {
        var t = T();
        if (S.ui.countdown) {
            /* putting the waiting change back would take this one along */
            S.ui.notice = { type: 'err', text: t.confirmFirst, list: [] };
            renderPending();
            return;
        }
        S.ui.applying = true;
        S.ui.notice = null;
        renderBanners();
        api('POST', '/api/inversapanel/service/apply', {
            general: S.draft.general,
            filtering: S.draft.filtering,
            devices: changedDevices(),
            reservations: changedReservations(),
            schedules: S.draft.schedules,
            access: S.draft.access,
            approval: S.draft.approval,
            geo: S.draft.geo,
            ips: S.draft.ips,
            vpn: S.draft.vpn,
            dns: S.draft.dns,
            geo_license: S.ui.geoLicense || ''
        }).then(function (res) {
            if (res.status === 'ok') {
                S.ui.geoLicense = '';
                S.ui.notice = { type: 'ok', text: t.applied, list: (res.messages || []).concat(res.auto_approved ? [t.apprAuto(res.auto_approved)] : []) };
                if (res.confirm) {
                    /* this change can cut you off: the firewall puts it back unless confirmed */
                    startCountdown(res.confirm);
                }
                return loadState().then(loadHosts).then(loadDns);
            }
            if (res.pending_confirm) {
                S.ui.notice = { type: 'err', text: t.confirmFirst, list: [] };
                return;
            }
            if (res.dns_unreachable) {
                /* the chosen DNS servers were asked before anything was changed, and did not answer */
                S.ui.notice = { type: 'err', text: t.dnsUnreachable, list: res.dns_unreachable };
                return;
            }
            var list = Object.keys(res.validations || {}).map(function (k) { return k + ': ' + res.validations[k]; });
            S.ui.notice = { type: 'err', text: t.validationFailed, list: list };
        }).catch(function (err) {
            S.ui.notice = { type: 'err', text: t.applyFailed, list: [err && err.errorMessage ? err.errorMessage : String(err && err.statusText || '')] };
        }).then(function () {
            S.ui.applying = false;
            render();
        });
    }

    /* switch to a tab and fetch what it shows (the caller redraws) */
    function openTab(tab) {
        S.tab = pageFor(tab);
        S.ui.sel = null;
        if (S.tab === 'devices') { loadHosts().then(refreshView, function () {}); }
        if (VIEWS[S.tab] && VIEWS[S.tab].load) {
            VIEWS[S.tab].load().then(function () { if (!inputFocused()) { renderMain(); } }, function () {});
        }
    }

    /*
     * OPNsense's side menu has the same entries as our menu (/ui/inversapanel#devices, ...). The server cannot
     * see the part after "#", so it marks all of them as the current page: mark the one that is open.
     */
    function syncMenu() {
        if (!document.querySelectorAll) { return; }
        var links = document.querySelectorAll('#mainmenu a[href^="/ui/inversapanel#"]');
        var t = T();
        var names = { dash: t.tabDash, net: t.tabNet, vpn: t.tabVpn, devices: t.tabDevices, security: t.tabSecurity, logs: t.tabLogs, settings: t.tabSettings };
        for (var i = 0; i < links.length; i++) {
            var on = groupOf(pageFor(links[i].getAttribute('href').split('#')[1])) === groupOf(S.tab);
            links[i].classList.toggle('active', on);
            /* the names come from Menu.xml in one language: show them in the panel's */
            var name = names[links[i].getAttribute('href').split('#')[1]];
            var cell = links[i].querySelector('div[style*="table-cell"]');
            if (name && cell && cell.textContent !== name) { cell.textContent = name; }
        }
    }

    function onClick(event) {
        var el = event.target.closest('[data-act]');
        if (!el || !root.contains(el) || el.disabled) {
            return;
        }
        var act = el.getAttribute('data-act'), v = el.getAttribute('data-v'), mac = el.getAttribute('data-mac');
        var full = false;
        switch (act) {
            case 'tab':
                openTab(v);
                if (history.replaceState) { history.replaceState(null, '', '#' + S.tab); }
                full = true;
                break;
            case 'cat':
                S.draft.filtering[v] = !S.draft.filtering[v];
                break;
            case 'app':
                S.draft.filtering.apps = toggleInList(S.draft.filtering.apps, v);
                break;
            case 'list-add':
                addDomain(el.getAttribute('data-list'));
                return;
            case 'list-del':
                var key = el.getAttribute('data-list') === 'allow' ? 'allowlist' : 'denylist';
                S.draft.filtering[key] = S.draft.filtering[key].filter(function (d) { return d !== v; });
                break;
            case 'cut':
                setDev(mac, { blocked: !devCfg(mac).blocked });
                break;
            case 'approve':
                setDev(mac, { approved: true });
                break;
            case 'pause':
                pauseDevice(mac, v === 'morning' ? { until: 'morning' } : { minutes: v }, false);
                return;
            case 'resume':
                pauseDevice(mac, {}, true);
                return;
            case 'wake':
                api('POST', '/api/inversapanel/devices/wake', { mac: mac }).then(function (res) {
                    S.ui.notice = res && res.status === 'ok' ? { type: 'ok', text: T().wakeSent, list: [] } : { type: 'err', text: T().wakeFailed, list: [], ms: 10000 };
                    renderPending();
                }, function () { S.ui.notice = { type: 'err', text: T().wakeFailed, list: [], ms: 10000 }; renderPending(); });
                return;
            case 'approval':
                setDev(mac, { approved: !devCfg(mac).approved });
                break;
            case 'show-net':
                /* from a network's "n devices connected": the devices of that network that are there now */
                S.ui.net = { key: v, name: el.getAttribute('data-n') || v.toUpperCase() };
                S.ui.filter = 'online';
                S.ui.search = '';
                S.ui.sel = null;
                S.tab = 'devices';
                if (history.replaceState) { history.replaceState(null, '', '#devices'); }
                loadHosts().then(refreshView, function () {});
                full = true;
                break;
            case 'netfilter':
                S.ui.net = v ? { key: v, name: el.getAttribute('data-n') || v.toUpperCase() } : null;
                S.ui.sel = null;
                break;
            case 'filter-reset':
                S.ui.net = null;
                S.ui.filter = 'all';
                S.ui.search = '';
                break;
            case 'show-waiting':
                S.ui.filter = 'waiting';
                S.ui.net = null;
                S.ui.sel = null;
                if (S.tab !== 'devices') {
                    S.tab = 'devices';
                    if (history.replaceState) { history.replaceState(null, '', '#devices'); }
                    loadHosts().then(refreshView, function () {});
                }
                full = true;
                break;
            case 'sel':
                S.ui.sel = mac && S.ui.sel !== mac ? mac : null;
                break;
            case 'type':
                if (S.ui.sel) { setDev(S.ui.sel, { type: v }); }
                break;
            case 'filter':
                S.ui.filter = v;
                break;
            case 'devpage':
                S.ui.page = Number(v);
                break;
            case 'devpagesize':
                S.ui.size = Number(v);
                S.ui.page = 0;
                break;
            case 'sort':
                var sort = S.ui.sort;
                S.ui.sort = !sort || sort.col !== v ? { col: v, dir: 1 } : (sort.dir === 1 ? { col: v, dir: -1 } : null);
                break;
            case 'general':
                S.draft.general[v] = !S.draft.general[v];
                break;
            case 'iface':
                S.draft.general.interfaces = toggleInList(S.draft.general.interfaces, v);
                break;
            case 'resp':
                S.draft.filtering.response = v;
                break;
            case 'discard':
                S.draft = clone(S.saved);
                S.ui.notice = null;
                S.ui.showChanges = false;
                full = true;
                break;
            case 'changes':
                S.ui.showChanges = !S.ui.showChanges;
                renderPending();
                return;
            case 'revert':
                var change = (S.ui.changeCache || [])[Number(el.getAttribute('data-i'))];
                if (change) { change.revert(); }
                break;
            case 'apply':
                S.ui.showChanges = false;
                apply();
                return;
            case 'dismiss':
                S.ui.notice = null;
                break;
            case 'confirm':
                confirmChange();
                return;
            case 'cleanup':
                if (window.confirm(T().cleanupConfirm)) {
                    api('POST', '/api/inversapanel/service/cleanup', {}).then(function () {
                        S.ui.notice = { type: 'ok', text: T().cleanupDone, list: [] };
                        return loadState().then(render);
                    }, function (err) {
                        S.ui.notice = { type: 'err', text: T().applyFailed, list: [err && err.errorMessage ? err.errorMessage : ''] };
                        render();
                    });
                }
                return;
            case 'welcome-yes':
                /* only prepares the changes: the user still sees them and presses Apply */
                S.draft.filtering.ads = true;
                S.draft.filtering.malware = true;
                saveWelcomed();
                break;
            case 'fixip':
                S.draft.reservations[el.getAttribute('data-mac')] = el.getAttribute('data-v') || '';
                break;
            case 'welcome-no':
                saveWelcomed();
                break;
            default:
                /* "view:action" belongs to a registered view; it says what to redraw */
                var parts = act.split(':');
                if (parts.length === 2 && VIEWS[parts[0]] && VIEWS[parts[0]].act) {
                    redraw(VIEWS[parts[0]].act(parts[1], el, event));
                }
                return;
        }
        if (full) {
            render();
        } else {
            renderHeader();
            renderBanners();
            renderMain();
            if (waitingCount() !== S.ui.waitShown) { renderTabs(); }
        }
    }

    /* what = 'full' | 'main' | 'pending' | nothing */
    function redraw(what) {
        if (what === 'full') {
            render();
        } else if (what === 'main') {
            renderHeader();
            renderMain();
            if (waitingCount() !== S.ui.waitShown) { renderTabs(); }
        } else if (what === 'pending') {
            renderPending();
        } else if (what === 'main-keepfocus') {
            /* live filtering while typing: redraw, then put the cursor back where it was */
            var el = document.activeElement, kind = el && el.getAttribute && el.getAttribute('data-input');
            var pos = el && typeof el.selectionStart === 'number' ? el.selectionStart : null;
            renderMain();
            renderPending();
            var again = kind ? root.querySelector('[data-input="' + kind + '"]') : null;
            if (again) {
                again.focus();
                if (pos !== null && again.setSelectionRange) { again.setSelectionRange(pos, pos); }
            }
        }
    }

    function viewInput(kind, el, type) {
        var parts = kind.split(':');
        if (parts.length === 2 && VIEWS[parts[0]] && VIEWS[parts[0]].input) {
            redraw(VIEWS[parts[0]].input(parts[1], el, type));
            return true;
        }
        return false;
    }

    function onInput(event) {
        var el = event.target, kind = el.getAttribute && el.getAttribute('data-input');
        if (!kind || viewInput(kind, el, 'input')) {
            return;
        }
        if (kind === 'search') {
            S.ui.search = el.value;
            document.getElementById('k-devrows').innerHTML = deviceRows();
            if (document.getElementById('k-devpager')) { document.getElementById('k-devpager').innerHTML = devicePager(); }
        } else if (kind === 'devname') {
            setDev(el.getAttribute('data-mac'), { name: el.value.replace(/[\x00-\x1f<>"]/g, '') });
            renderBanners();
        } else if (kind === 'devip') {
            S.draft.reservations[el.getAttribute('data-mac')] = el.value.replace(/[^0-9.]/g, '');
            renderBanners();
        } else if (kind === 'domain') {
            S.ui[el.getAttribute('data-list') + 'Input'] = el.value;
        }
    }

    function onKey(event) {
        var el = event.target;
        if (event.key === 'Escape' && S.ui.showChanges) {
            S.ui.showChanges = false;
            renderPending();
            return;
        }
        var kind = el.getAttribute && el.getAttribute('data-input');
        if (event.key === 'Enter' && kind === 'domain') {
            event.preventDefault();
            addDomain(el.getAttribute('data-list'));
        } else if (event.key === 'Enter' && kind && kind.indexOf(':') > 0) {
            /* a view's form: Enter does what its button does */
            var parts = kind.split(':');
            if (VIEWS[parts[0]] && VIEWS[parts[0]].enter) {
                var what = VIEWS[parts[0]].enter(parts[1], el);
                if (what) { event.preventDefault(); redraw(what); }
            }
        }
    }

    function onChange(event) {
        var kind = event.target.getAttribute && event.target.getAttribute('data-input');
        if (kind && kind.indexOf(':') > 0) {
            viewInput(kind, event.target, 'change');
            return;
        }
        if (kind === 'lang') {
            setLanguage(event.target.value);
        } else if (kind === 'devname' || kind === 'devip') {
            /* refresh the table / hints once the field is left */
            renderMain();
        }
    }

    /* ------------------------------------------------------------------ start */

    function start(element) {
        root = element;
        fillLanguages();
        var hashTab = String(window.location.hash || '').replace('#', '');
        S = {
            tab: pageFor(hashTab),
            saved: null, draft: null, options: null,
            hosts: [], source: null, hostsLoaded: false,
            traffic: { last: null, rate: null, hist: [] },
            dns: null,
            ui: { filter: 'all', sort: null, search: '', sel: null, allowInput: '', denyInput: '', applying: false, notice: null, showChanges: false, changeCache: [], listError: { allow: null, deny: null } }
        };

        loadState().then(function () {
            render();
            root.addEventListener('click', onClick);
            root.addEventListener('input', onInput);
            root.addEventListener('keydown', onKey);
            root.addEventListener('change', onChange);

            loadHosts().then(refreshView, function () {});
            loadDns().then(refreshView, function () {});
            if (VIEWS[S.tab] && VIEWS[S.tab].load) {
                VIEWS[S.tab].load().then(function () { if (!inputFocused()) { renderMain(); } }, function () {});
            }
            sampleTraffic().then(function () {}, function () {});

            setInterval(function () { sampleTraffic().then(function () { if (S.tab === 'dash') { refreshView(); } }, function () {}); }, TRAFFIC_MS);
            /* the list makes the firewall ask the devices if they are there: only while somebody is looking */
            setInterval(function () { if (!document.hidden) { loadHosts().then(refreshView, function () {}); } }, 30000);
            /* a side menu entry of OPNsense for another tab only changes the part after "#" */
            if (window.addEventListener) {
                window.addEventListener('hashchange', function () {
                    var tab = String(window.location.hash || '').replace('#', ''), page = pageFor(tab);
                    /* unknown addresses are ignored; a menu entry that is open already keeps the page it shows */
                    if ((page !== 'dash' || tab === 'dash') && page !== S.tab && groupOf(S.tab) !== tab) {
                        openTab(tab);
                        render();
                    }
                });
            }
            if (document.addEventListener) {
                document.addEventListener('visibilitychange', function () {
                    if (!document.hidden) { loadHosts().then(refreshView, function () {}); }
                });
            }
            setInterval(function () { loadDns().then(function () { if (S.tab === 'dash') { refreshView(); } }, function () {}); }, 60000);
        }, function () {
            root.innerHTML = '<div class="k-banner err">' + esc(window.InversaPanelI18n[lang() || 'en'].loadFailed) + '</div>';
        });
    }

    /*
     * Extension point for views/*.js. A view is a page:
     *   { key, icon, label(t), render(), load()?, act(name, el)?, input(name, el, type)?, enter(name, el)?, changes(add, draft, saved)? }
     * act/input return what to redraw: 'full' | 'main' | 'pending'. Where a page shows is decided by MENU.
     */
    /* the welcome card is answered once, stored immediately (not part of the pending changes) */
    function saveWelcomed() {
        S.draft.general.welcomed = true;
        S.saved.general.welcomed = true;
        api('POST', '/api/inversapanel/service/welcomed', {}).then(function (res) {
            if (!res || res.status !== 'ok') { throw res; }
        }).catch(function (err) {
            S.ui.notice = { type: 'err', text: T().applyFailed, list: [err && err.errorMessage ? err.errorMessage : ''] };
            renderPending();
        });
    }

    function register(view) {
        VIEWS[view.key] = view;
    }

    var helpers = {
        esc: esc, icon: icon, toggle: toggle, api: api, fmt: fmt, ago: ago, clone: clone,
        toggleInList: toggleInList, pager: pager, devName: devName, hostByMac: hostByMac, ICONS: ICONS,
        T: function () { return T(); },
        S: function () { return S; },
        redraw: redraw,
        notice: function (type, text, list, ms) { S.ui.notice = { type: type, text: text, list: list || [], ms: ms || 0 }; renderPending(); },
        hosts: function () { return S.hosts; },
        /* confirm-or-put-back countdown: the running one (or null), start one */
        countdown: function () { return S.ui.countdown; },
        startCountdown: startCountdown,
        loadHosts: loadHosts,
        reloadState: function () { return loadState().then(render); }
    };

    window.InversaPanelApp = { start: start, register: register, h: helpers };
})();
