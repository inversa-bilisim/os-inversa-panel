/*
 * SPDX-License-Identifier: BSD-2-Clause
 * Copyright (C) 2026 Inversa Bilişim
 *
 * Minnosh single page UI.
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
    var TABS = ['dash', 'devices', 'filter', 'settings'];
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
    function autoLang() {
        var code = String(root.getAttribute('data-langcode') || 'en').slice(0, 2).toLowerCase();
        return window.MinnoshI18n[code] ? code : 'en';
    }

    function lang() {
        var pref = S && S.draft ? S.draft.general.language : 'auto';
        if (pref === 'auto') {
            return autoLang();
        }
        return window.MinnoshI18n[pref] ? pref : 'en';
    }

    function T() {
        return window.MinnoshI18n[lang()];
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

    function inputFocused() {
        var el = document.activeElement;
        return el && root.contains(el) && el.tagName === 'INPUT';
    }

    /* ------------------------------------------------------------------ device helpers */

    function devCfg(mac, source) {
        var devices = (source || S.draft).devices;
        return devices[mac] || { name: '', type: 'unknown', blocked: false };
    }

    function setDev(mac, patch) {
        S.draft.devices[mac] = Object.assign({}, devCfg(mac), patch);
    }

    function devName(host) {
        var cfg = devCfg(host.mac);
        return cfg.name || host.hostname || T().unnamed;
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
            if (a.name !== b.name || a.type !== b.type || !!a.blocked !== !!b.blocked) {
                result[mac] = a;
            }
        });
        return result;
    }

    function pendingCount() {
        var d = S.draft, s = S.saved, n = 0;
        /* language is saved immediately (setLanguage), it is never a pending change */
        ['enabled', 'dnsstats'].forEach(function (k) { if (d.general[k] !== s.general[k]) { n++; } });
        if (sortedJson(d.general.interfaces) !== sortedJson(s.general.interfaces)) { n++; }
        CATS.forEach(function (k) { if (d.filtering[k] !== s.filtering[k]) { n++; } });
        ['apps', 'allowlist', 'denylist'].forEach(function (k) {
            if (sortedJson(d.filtering[k]) !== sortedJson(s.filtering[k])) { n++; }
        });
        if (d.filtering.response !== s.filtering.response) { n++; }
        return n + Object.keys(changedDevices()).length;
    }

    /* ------------------------------------------------------------------ data loading */

    function loadState() {
        return api('GET', '/api/minnosh/state/get').then(function (data) {
            data.devices = Array.isArray(data.devices) ? {} : (data.devices || {});
            S.saved = { general: data.general, filtering: data.filtering, devices: data.devices };
            S.draft = clone(S.saved);
            S.options = data.options;
        });
    }

    function loadHosts() {
        return api('GET', '/api/minnosh/devices/list').then(function (data) {
            S.hosts = data.devices || [];
            S.source = data.source;
            S.hostsLoaded = true;
        });
    }

    function loadDns() {
        return api('GET', '/api/minnosh/dashboard/dns').then(function (data) {
            S.dns = data;
        });
    }

    function sampleTraffic() {
        return api('GET', '/api/minnosh/dashboard/traffic').then(function (data) {
            var down = 0, up = 0;
            (data.wan || []).forEach(function (key) {
                var row = (data.interfaces || {})[key];
                if (row) {
                    down += Number(row.inbytes || 0);
                    up += Number(row.outbytes || 0);
                }
            });
            var sample = { time: Number(data.time), down: down, up: up };
            var prev = S.traffic.last;
            S.traffic.last = sample;
            if (prev && sample.time > prev.time && sample.down >= prev.down && sample.up >= prev.up) {
                var dt = sample.time - prev.time;
                var rate = {
                    down: (sample.down - prev.down) * 8 / dt / 1e6,
                    up: (sample.up - prev.up) * 8 / dt / 1e6
                };
                S.traffic.rate = rate;
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
            '<nav class="k-tabs" id="k-tabs" aria-label="Minnosh"></nav>' +
            '<div id="k-main"></div>';
        renderHeader();
        renderTabs();
        renderBanners();
        renderMain();
    }

    /* language dropdown, shared by header and settings; a UI preference that is saved at once */
    function langSelect() {
        var t = T(), pref = S.draft.general.language;
        var autoName = window.MinnoshI18n[autoLang()].langName;
        var options = [['auto', t.langAuto + ' (' + autoName + ')']].concat(Object.keys(window.MinnoshI18n).map(function (code) {
            return [code, window.MinnoshI18n[code].langName];
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
        api('POST', '/api/minnosh/service/language', { language: code }).catch(function (err) {
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

    function renderHeader() {
        var t = T(), level = protectionLevel(S.saved);
        var pill = level === 'ok' ? ['ok', t.protOn] : (level === 'warn' ? ['warn', t.protPartial] : ['warn', t.protOff]);
        document.getElementById('k-header').innerHTML =
            '<div class="k-header">' +
            '<div class="k-brand"><div class="k-logo">' + icon(ICONS.shield + 'M9 12l2 2 4-4', 24) + '</div>' +
            '<div><div class="k-title">Minnosh</div><div class="muted">' + esc(t.appSub) + '</div></div></div>' +
            /* pending changes live inside the header so they never push the page down */
            '<div id="k-pending" class="k-pending-slot"></div>' +
            '<div class="k-head-right">' +
            '<span class="k-pill ' + pill[0] + '"><span class="k-dot ' + pill[0] + '"></span>' + esc(pill[1]) + '</span>' +
            langSelect() +
            '</div></div>';
        renderPending();
    }

    function renderTabs() {
        var t = T();
        var labels = { dash: [t.tabDash, ICONS.dash], devices: [t.tabDevices, ICONS.devices], filter: [t.tabFilter, ICONS.shield], settings: [t.tabSettings, ICONS.sliders] };
        var html = TABS.map(function (key) {
            var on = S.tab === key;
            return '<button type="button" class="k-tab' + (on ? ' on' : '') + '" data-act="tab" data-v="' + key + '"' +
                (on ? ' aria-current="page"' : '') + '>' + icon(labels[key][1]) + '<span>' + esc(labels[key][0]) + '</span></button>';
        }).join('');
        html += '<span class="k-tab-sep"></span>';
        html += t.soonTabs.map(function (label) {
            return '<button type="button" class="k-tab" disabled><span>' + esc(label) + '</span><span class="k-soon">' + esc(t.soon) + '</span></button>';
        }).join('');
        document.getElementById('k-tabs').innerHTML = html;
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
        var t = T(), n = pendingCount(), nt = S.ui.notice;
        if (n > 0 || S.ui.applying) {
            slot.innerHTML = '<div class="k-pending-inline" role="status" title="' + esc(t.pendingHint) + '">' + icon(ICONS.info, 18) +
                '<div class="k-pending-text"><b>' + esc(t.pending(n)) + '</b><span>' + esc(t.pendingHint) + '</span></div>' +
                '<button type="button" class="k-btn small" data-act="discard"' + (S.ui.applying ? ' disabled' : '') + '>' + esc(t.discard) + '</button>' +
                '<button type="button" class="k-btn small primary" data-act="apply"' + (S.ui.applying ? ' disabled' : '') + '>' +
                esc(S.ui.applying ? t.applying : t.apply) + '</button></div>';
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
        if (nt.type === 'ok' && !list && !nt.timer) {
            /* fade, then drop the message */
            nt.timer = setTimeout(function () {
                var box = slot.querySelector('.k-pending-inline.ok');
                if (box) { box.classList.add('fade'); }
                setTimeout(function () {
                    if (S.ui.notice === nt) {
                        S.ui.notice = null;
                        renderPending();
                    }
                }, 650);
            }, 6000);
        }
    }

    function renderMain() {
        var html = '';
        if (S.tab === 'devices') { html = viewDevices(); }
        else if (S.tab === 'filter') { html = viewFilter(); }
        else if (S.tab === 'settings') { html = viewSettings(); }
        else { html = viewDash(); }
        document.getElementById('k-main').innerHTML = html;
    }

    /* ------------------------------------------------------------------ view: overview */

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

    function viewDash() {
        var t = T(), level = protectionLevel(S.saved);
        var online = S.hosts.filter(function (h) { return h.online; }).length;
        var dns = S.dns || {};
        var rate = S.traffic.rate;

        var statusTitle = level === 'ok' ? t.statusOk : (level === 'warn' ? t.statusWarn : t.statusOff);
        var dnsActive = S.saved.general.enabled && (
            CATS.slice(0, 5).some(function (k) { return S.saved.filtering[k]; }) ||
            (S.saved.filtering.apps || []).length > 0 ||
            (S.saved.filtering.denylist || []).length > 0
        );

        var html = '<div class="k-stack">';
        html += '<section class="k-card k-status">' +
            '<div class="k-status-main"><div class="k-badge-big ' + (level === 'ok' ? 'ok' : 'warn') + '">' +
            icon(ICONS.shield + (level === 'ok' ? ICONS.check : ICONS.alert), 28) + '</div>' +
            '<div><h1>' + esc(statusTitle) + '</h1><div class="muted" style="font-size:14px">' + esc(t.statusLine(online, S.hosts.length)) + '</div></div></div>' +
            '<div class="k-chips"><span class="k-info"><span class="k-dot ' + (dnsActive ? 'ok' : '') + '"></span>' +
            esc(t.dnsFilter) + ': ' + esc(dnsActive ? t.active : t.inactive) + '</span></div>' +
            '</section>';

        var blockedValue = dns.enabled && dns.available ? fmt(dns.blocked) : '—';
        var blockedSub = dns.enabled && dns.available ? t.kpiBlockedSub(fmt(dns.blocked_pcnt, 1)) : t.kpiNoStats;
        var kpis = [
            [t.kpiOnline, fmt(online), '', t.kpiOnlineSub(S.hosts.length)],
            [t.kpiBlocked, blockedValue, '', blockedSub],
            [t.kpiDown, rate ? fmt(rate.down, 1) : '—', 'Mbit/s', t.kpiRateSub],
            [t.kpiUp, rate ? fmt(rate.up, 1) : '—', 'Mbit/s', t.kpiRateSub]
        ];
        html += '<div class="k-kpis">' + kpis.map(function (k) {
            return '<div class="k-kpi"><div class="k-kpi-label">' + esc(k[0]) + '</div>' +
                '<div class="k-kpi-value">' + esc(k[1]) + (k[2] ? '<span class="k-kpi-unit">' + esc(k[2]) + '</span>' : '') + '</div>' +
                '<div class="muted">' + esc(k[3]) + '</div></div>';
        }).join('') + '</div>';

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
            '</div></section>';

        var top = S.hosts.filter(function (h) { return h.states > 0; })
            .sort(function (a, b) { return b.states - a.states; }).slice(0, 5);
        var topMax = top.length ? top[0].states : 1;
        html += '<section class="k-card k-side"><div class="k-card-head"><h2>' + esc(t.topDevTitle) + '</h2>' +
            '<span class="muted">' + esc(t.topDevSub) + '</span></div>' +
            (top.length ? top.map(function (h) {
                return '<div style="display:flex;flex-direction:column;gap:6px"><div style="display:flex;justify-content:space-between;gap:8px">' +
                    '<span class="k-grow-text" style="font-weight:500">' + esc(devName(h)) + '</span>' +
                    '<span style="flex:none;color:#36404D">' + esc(t.conns(h.states)) + '</span></div>' +
                    '<div class="k-bar"><div style="width:' + Math.max(3, Math.round(h.states / topMax * 100)) + '%"></div></div></div>';
            }).join('') : '<div class="muted">' + esc(!S.hostsLoaded ? '…' : (S.hosts.length ? t.noActive : t.noDevicesYet)) + '</div>') +
            '<button type="button" class="k-link" data-act="tab" data-v="devices">' + esc(t.allDevices) + ' →</button>' +
            '</section></div>';

        var blockedRows;
        if (!dns.enabled) {
            blockedRows = '<div class="muted">' + esc(t.statsOff) + '</div>';
        } else if (!dns.top_blocked || !dns.top_blocked.length) {
            blockedRows = '<div class="muted">' + esc(t.noBlocked) + '</div>';
        } else {
            blockedRows = dns.top_blocked.slice(0, 6).map(function (b) {
                return '<div class="k-list-row"><span class="k-grow-text mono">' + esc(b.domain) + '</span>' +
                    '<span class="k-badge">' + esc(b.custom ? t.customList : b.list) + '</span>' +
                    '<span style="width:56px;text-align:right;font-weight:600;flex:none">' + esc(fmt(b.total)) + '</span></div>';
            }).join('');
        }
        html += '<div class="k-row stretch">' +
            '<section class="k-card k-half"><div class="k-card-head"><h2>' + esc(t.topBlockedTitle) + '</h2></div><div>' + blockedRows + '</div></section>' +
            '<section class="k-card k-half" style="gap:4px"><div class="k-card-head"><h2>' + esc(t.quickTitle) + '</h2>' +
            '<span class="muted">' + esc(t.quickSub) + '</span></div>' +
            QUICK.map(function (k) {
                var on = !!S.draft.filtering[k];
                return '<div class="k-setting" style="padding:6px 0"><div class="k-setting-text"><b style="font-weight:500">' + esc(t.cats[k][0]) + '</b>' +
                    '<span class="muted">' + esc(on ? t.on : t.off) + '</span></div>' +
                    toggle(on, 'data-act="cat" data-v="' + k + '"', t.cats[k][0]) + '</div>';
            }).join('') +
            '<button type="button" class="k-link" data-act="tab" data-v="filter">' + esc(t.editAll) + ' →</button>' +
            '</section></div>';

        return html + '</div>';
    }

    /* ------------------------------------------------------------------ view: devices */

    function filteredHosts() {
        var q = S.ui.search.trim().toLowerCase();
        return S.hosts.filter(function (h) {
            var cfg = devCfg(h.mac);
            if (S.ui.filter === 'online' && !h.online) { return false; }
            if (S.ui.filter === 'blocked' && !cfg.blocked) { return false; }
            if (!q) { return true; }
            return (devName(h) + ' ' + h.ips.join(' ') + ' ' + h.mac + ' ' + h.vendor + ' ' + h.hostname).toLowerCase().indexOf(q) >= 0;
        }).sort(function (a, b) {
            return (b.online - a.online) || devName(a).localeCompare(devName(b), T().locale);
        });
    }

    function deviceRows() {
        var t = T(), rows = filteredHosts();
        if (!rows.length) {
            return '<tr><td colspan="6" class="k-empty" style="text-align:center">' +
                esc(S.hosts.length ? t.noResult : (S.hostsLoaded ? t.noDevicesYet : '…')) + '</td></tr>';
        }
        return rows.map(function (h) {
            var cfg = devCfg(h.mac), cut = !!cfg.blocked, name = devName(h);
            var status = h.online ? t.online : (ago(h.last_seen) || t.offline);
            return '<tr class="' + (S.ui.sel === h.mac ? 'sel' : (cut ? 'cut' : '')) + '">' +
                '<td><div class="k-dev"><div class="k-ibox ' + (cut ? 'cut' : 'on') + '">' + icon(ICONS[cfg.type] || ICONS.unknown, 20) + '</div>' +
                '<button type="button" class="k-dev-name" data-act="sel" data-mac="' + esc(h.mac) + '" aria-label="' + esc(t.editAria(name)) + '">' +
                '<span style="min-width:0"><b>' + esc(name) + '</b><span class="muted">' + esc(h.vendor || t.unknownVendor) + '</span></span>' +
                '<span style="color:#5B6573;flex:none">' + icon(ICONS.pencil, 15) + '</span></button></div></td>' +
                '<td class="mono">' + esc(h.ips[0] || '—') + (h.ips.length > 1 ? ' <span class="muted">+' + (h.ips.length - 1) + '</span>' : '') + '</td>' +
                '<td class="mono" style="color:#36404D">' + esc(h.mac) + '</td>' +
                '<td><span style="display:inline-flex;align-items:center;gap:6px;font-size:13px;color:#36404D">' +
                '<span class="k-dot ' + (h.online ? 'ok' : '') + '"></span>' + esc(status) + '</span></td>' +
                '<td style="font-variant-numeric:tabular-nums">' + esc(fmt(h.states)) + '</td>' +
                '<td><div class="k-net"><span class="k-net-label' + (cut ? ' cut' : '') + '">' + esc(cut ? t.netOff : t.netOn) + '</span>' +
                toggle(!cut, 'data-act="cut" data-mac="' + esc(h.mac) + '"', t.cutAria(name), cut ? 'cut' : '') + '</div></td>' +
                '</tr>';
        }).join('');
    }

    function devicePanel() {
        var t = T(), h = hostByMac(S.ui.sel);
        if (!h) { return ''; }
        var cfg = devCfg(h.mac), cut = !!cfg.blocked, name = devName(h);
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
            '<div style="display:flex;align-items:center;gap:12px"><div class="k-ibox big ' + (cut ? 'cut' : 'on') + '">' + icon(ICONS[cfg.type] || ICONS.unknown, 24) + '</div>' +
            '<div style="flex:1 1 auto;min-width:0"><div style="font-weight:600;font-size:16px">' + esc(name) + '</div>' +
            '<div class="muted">' + esc(h.ips[0] || h.mac) + '</div></div>' +
            '<button type="button" class="k-icon-btn" data-act="sel" data-mac="" aria-label="' + esc(t.close) + '">' + icon(ICONS.close, 18) + '</button></div>' +
            '<label class="k-field"><span>' + esc(t.dName) + '</span>' +
            '<input type="text" maxlength="64" data-input="devname" data-mac="' + esc(h.mac) + '" value="' + esc(cfg.name) + '" placeholder="' + esc(h.hostname || t.unnamed) + '"></label>' +
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
            '</aside>';
    }

    function viewDevices() {
        var t = T();
        var counts = {
            all: S.hosts.length,
            online: S.hosts.filter(function (h) { return h.online; }).length,
            blocked: S.hosts.filter(function (h) { return devCfg(h.mac).blocked; }).length
        };
        var filters = [['all', t.fAll], ['online', t.fOnline], ['blocked', t.fBlocked]].map(function (f) {
            var on = S.ui.filter === f[0];
            return '<button type="button" class="k-chip' + (on ? ' on' : '') + '" data-act="filter" data-v="' + f[0] + '" aria-pressed="' + on + '">' +
                esc(f[1]) + ' <span class="k-count">' + counts[f[0]] + '</span></button>';
        }).join('');
        return '<div class="k-stack">' +
            '<div><h1>' + esc(t.devTitle) + '</h1><div class="muted" style="font-size:14px;margin-top:4px">' + esc(t.devSub) + '</div></div>' +
            (S.hostsLoaded && S.source !== 'discovery' ? '<div class="k-banner info" style="margin:0">' + icon(ICONS.info, 20) + '<span>' + esc(t.discoveryHint) + '</span></div>' : '') +
            '<div class="k-toolbar"><label class="k-search">' + icon(ICONS.search) +
            '<input type="search" data-input="search" value="' + esc(S.ui.search) + '" placeholder="' + esc(t.search) + '" aria-label="' + esc(t.search) + '"></label>' +
            '<div class="k-chips" role="group" aria-label="' + esc(t.devTitle) + '">' + filters + '</div></div>' +
            '<div class="k-row"><div class="k-table-box k-grow"><table class="k-table"><thead><tr>' +
            '<th>' + esc(t.colDevice) + '</th><th>' + esc(t.colIp) + '</th><th>' + esc(t.colMac) + '</th>' +
            '<th>' + esc(t.colSeen) + '</th><th>' + esc(t.colConns) + '</th><th>' + esc(t.colNet) + '</th>' +
            '</tr></thead><tbody id="k-devrows">' + deviceRows() + '</tbody></table></div>' +
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

        html += '<section class="k-card"><h2>' + esc(t.listsTitle) + '</h2><div class="k-row" style="gap:24px">' +
            [['allowlist', 'allow', t.allowTitle, t.allowDesc], ['denylist', 'deny', t.denyTitle, t.denyDesc]].map(function (l) {
                var err = S.ui.listError[l[1]];
                return '<div class="k-half" style="display:flex;flex-direction:column;gap:10px">' +
                    '<div style="font-weight:600">' + esc(l[2]) + '</div><div class="muted">' + esc(l[3]) + '</div>' +
                    '<div class="k-addrow"><input type="text" class="mono" data-input="domain" data-list="' + l[1] + '" ' +
                    'value="' + esc(S.ui[l[1] + 'Input']) + '" placeholder="ornek.com" aria-label="' + esc(l[2]) + '">' +
                    '<button type="button" class="k-btn soft" data-act="list-add" data-list="' + l[1] + '">' + esc(t.add) + '</button></div>' +
                    (err ? '<div class="small" style="color:#9A3B0A;font-weight:500">' + esc(err) + '</div>' : '') +
                    '<div class="k-chips">' + (f[l[0]] || []).map(function (domain) {
                        return '<span class="k-tag ' + l[1] + ' mono"><span>' + esc(domain) + '</span>' +
                            '<button type="button" data-act="list-del" data-list="' + l[1] + '" data-v="' + esc(domain) + '" ' +
                            'aria-label="' + esc(t.removeAria(domain)) + '">' + icon(ICONS.close, 14) + '</button></span>';
                    }).join('') + '</div></div>';
            }).join('') + '</div></section>';
        return html + '</div>';
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

        html += '</section><div class="k-banner info" style="margin:0">' + icon(ICONS.info, 20) + '<span>' + esc(t.infoNote) + '</span></div></div>';
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
        S.ui.applying = true;
        S.ui.notice = null;
        renderBanners();
        api('POST', '/api/minnosh/service/apply', {
            general: S.draft.general,
            filtering: S.draft.filtering,
            devices: changedDevices()
        }).then(function (res) {
            if (res.status === 'ok') {
                S.ui.notice = { type: 'ok', text: t.applied, list: res.messages || [] };
                return loadState().then(loadHosts).then(loadDns);
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

    function onClick(event) {
        var el = event.target.closest('[data-act]');
        if (!el || !root.contains(el) || el.disabled) {
            return;
        }
        var act = el.getAttribute('data-act'), v = el.getAttribute('data-v'), mac = el.getAttribute('data-mac');
        var full = false;
        switch (act) {
            case 'tab':
                S.tab = TABS.indexOf(v) >= 0 ? v : 'dash';
                S.ui.sel = null;
                if (history.replaceState) { history.replaceState(null, '', '#' + S.tab); }
                full = true;
                if (S.tab === 'devices') { loadHosts().then(refreshView, function () {}); }
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
            case 'sel':
                S.ui.sel = mac && S.ui.sel !== mac ? mac : null;
                break;
            case 'type':
                if (S.ui.sel) { setDev(S.ui.sel, { type: v }); }
                break;
            case 'filter':
                S.ui.filter = v;
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
                full = true;
                break;
            case 'apply':
                apply();
                return;
            case 'dismiss':
                S.ui.notice = null;
                break;
            default:
                return;
        }
        if (full) {
            render();
        } else {
            renderHeader();
            renderBanners();
            renderMain();
        }
    }

    function onInput(event) {
        var el = event.target, kind = el.getAttribute && el.getAttribute('data-input');
        if (!kind) {
            return;
        }
        if (kind === 'search') {
            S.ui.search = el.value;
            document.getElementById('k-devrows').innerHTML = deviceRows();
        } else if (kind === 'devname') {
            setDev(el.getAttribute('data-mac'), { name: el.value.replace(/[\x00-\x1f<>"]/g, '') });
            renderBanners();
        } else if (kind === 'domain') {
            S.ui[el.getAttribute('data-list') + 'Input'] = el.value;
        }
    }

    function onKey(event) {
        var el = event.target;
        if (event.key === 'Enter' && el.getAttribute && el.getAttribute('data-input') === 'domain') {
            event.preventDefault();
            addDomain(el.getAttribute('data-list'));
        }
    }

    function onChange(event) {
        var kind = event.target.getAttribute && event.target.getAttribute('data-input');
        if (kind === 'lang') {
            setLanguage(event.target.value);
        } else if (kind === 'devname') {
            /* a renamed device: refresh the table once the field is left */
            renderMain();
        }
    }

    /* ------------------------------------------------------------------ start */

    function start(element) {
        root = element;
        var hashTab = String(window.location.hash || '').replace('#', '');
        S = {
            tab: TABS.indexOf(hashTab) >= 0 ? hashTab : 'dash',
            saved: null, draft: null, options: null,
            hosts: [], source: null, hostsLoaded: false,
            traffic: { last: null, rate: null, hist: [] },
            dns: null,
            ui: { filter: 'all', search: '', sel: null, allowInput: '', denyInput: '', applying: false, notice: null, listError: { allow: null, deny: null } }
        };

        loadState().then(function () {
            render();
            root.addEventListener('click', onClick);
            root.addEventListener('input', onInput);
            root.addEventListener('keydown', onKey);
            root.addEventListener('change', onChange);

            loadHosts().then(refreshView, function () {});
            loadDns().then(refreshView, function () {});
            sampleTraffic().then(function () {}, function () {});

            setInterval(function () { sampleTraffic().then(function () { if (S.tab === 'dash') { refreshView(); } }, function () {}); }, TRAFFIC_MS);
            setInterval(function () { loadHosts().then(refreshView, function () {}); }, 30000);
            setInterval(function () { loadDns().then(function () { if (S.tab === 'dash') { refreshView(); } }, function () {}); }, 60000);
        }, function () {
            root.innerHTML = '<div class="k-banner err">' + esc(window.MinnoshI18n[lang() || 'en'].loadFailed) + '</div>';
        });
    }

    window.MinnoshApp = { start: start };
})();
