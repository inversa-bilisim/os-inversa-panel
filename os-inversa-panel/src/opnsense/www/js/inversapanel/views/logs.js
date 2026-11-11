/*
 * SPDX-License-Identifier: BSD-2-Clause
 * Copyright (C) 2026 Inversa Bilişim
 *
 * Logs: who tried to get in (attacks), which device went where (internet history, read from
 * Unbound's query log and off unless wanted), who logged in and what was changed.
 */
(function () {
    'use strict';
    var h = window.InversaPanelApp.h;
    var SEARCH = 'M11 4a7 7 0 1 0 0 14a7 7 0 1 0 0-14zM21 21l-4.3-4.3';
    var DOWNLOAD = 'M12 4v12M7 11l5 5 5-5M5 20h14';
    var PAGE = 100;
    var PORTS = { 21: 'FTP', 22: 'SSH', 23: 'Telnet', 25: 'SMTP', 53: 'DNS', 80: 'Web', 110: 'POP3', 123: 'NTP', 143: 'IMAP', 443: 'Web (HTTPS)', 445: 'SMB',
        1433: 'MSSQL', 1723: 'PPTP', 3306: 'MySQL', 3389: 'RDP', 5060: 'SIP', 5432: 'PostgreSQL', 5900: 'VNC', 8080: 'Web (8080)', 8443: 'Web (8443)', 51820: 'WireGuard' };
    var CODES = ('AD AE AF AG AI AL AM AO AR AT AU AZ BA BD BE BG BH BR BY CA CH CL CN CO CY CZ DE DK DZ EC EE EG ES FI FR GB GE GR HK HR HU ID IE IL IN IQ IR IS IT JO JP ' +
        'KE KG KP KR KW KZ LB LT LU LV LY MA MD MK MX MY NG NL NO NZ PA PE PH PK PL PT QA RO RS RU SA SC SE SG SI SK SY TH TN TR TW UA US UZ VN ZA').split(' ');

    var L = {
        attacks: { days: 7, kind: '', q: '', limit: PAGE, data: null, busy: false },
        history: { hours: 24, result: '', q: '', limit: PAGE, data: null, busy: false },
        events: { days: 7, type: '', q: '', limit: PAGE, data: null, busy: false },
        timer: null
    };

    function t() { return h.T(); }

    function country(code) {
        try {
            return new Intl.DisplayNames([t().locale], { type: 'region' }).of(code) || code;
        } catch (e) {
            return code;
        }
    }

    function hostByIp(ip) {
        return h.hosts().filter(function (x) { return x.ips.indexOf(ip) >= 0; })[0] || null;
    }

    /* the addresses of the devices whose name holds the search text */
    function ipsByName(q) {
        var out = [];
        if (q.length < 2) { return out; }
        h.hosts().forEach(function (x) {
            if (h.devName(x).toLocaleLowerCase(t().locale).indexOf(q) >= 0) { out = out.concat(x.ips); }
        });
        return out.slice(0, 50);
    }

    /* time of day today, the day as well before that */
    function when(ts) {
        var d = new Date(ts * 1000), now = new Date(), loc = t().locale;
        var clock = d.toLocaleTimeString(loc, { hour: '2-digit', minute: '2-digit', second: '2-digit' });
        return d.toDateString() === now.toDateString() ? clock : d.toLocaleDateString(loc, { day: 'numeric', month: 'short' }) + ' ' + clock;
    }

    function params(obj) {
        return Object.keys(obj).filter(function (k) { return obj[k] !== '' && obj[k] !== null && obj[k] !== undefined; })
            .map(function (k) { return encodeURIComponent(k) + '=' + encodeURIComponent(obj[k]); }).join('&');
    }

    function request(page, limit) {
        var s = L[page], q = s.q.trim().toLocaleLowerCase(t().locale), p;
        if (page === 'attacks') {
            p = { days: s.days, kind: s.kind, q: s.q.trim(), limit: limit };
            if (q) {
                p.q_dst = ipsByName(q).join(',');
                p.q_cc = CODES.filter(function (c) { return country(c).toLocaleLowerCase(t().locale).indexOf(q) >= 0; }).slice(0, 20).join(',');
                p.q_ports = Object.keys(PORTS).filter(function (k) { return PORTS[k].toLowerCase().indexOf(q) >= 0; }).join(',');
            }
        } else if (page === 'history') {
            p = { hours: s.hours, result: s.result, q: s.q.trim(), limit: limit, clients: q ? ipsByName(q).join(',') : '' };
        } else {
            p = { days: s.days, type: s.type, q: s.q.trim(), limit: limit };
        }
        return h.api('GET', '/api/inversapanel/logs/' + page + '?' + params(p));
    }

    function load(page) {
        var s = L[page];
        s.busy = true;
        return request(page, s.limit).then(function (data) { s.data = data; s.busy = false; }, function () { s.data = { error: true, rows: [], total: 0 }; s.busy = false; });
    }

    function reload(page, keepFocus) {
        load(page).then(function () { h.redraw(keepFocus ? 'main-keepfocus' : 'main'); });
    }

    /* ------------------------------------------------------------------ shared pieces */

    function chips(page, label, field, items) {
        var s = L[page];
        return '<div class="k-fgroup"><span class="k-flabel">' + h.esc(label) + '</span><div class="k-chips" role="group" aria-label="' + h.esc(label) + '">' + items.map(function (i) {
            var on = String(s[field]) === String(i[0]);
            return '<button type="button" class="k-chip' + (on ? ' on' : '') + '" data-act="' + page + ':set" data-f="' + field + '" data-v="' + h.esc(i[0]) + '" aria-pressed="' + on + '">' +
                h.esc(i[1]) + (i[2] !== undefined ? ' <span class="k-count">' + h.esc(i[2]) + '</span>' : '') + '</button>';
        }).join('') + '</div></div>';
    }

    function bar(page, placeholder, groups) {
        var s = L[page], T = t(), d = s.data || {};
        return '<div class="k-filterbar"><label class="k-search">' + h.icon(SEARCH, 16) +
            '<input type="search" data-input="' + page + ':q" value="' + h.esc(s.q) + '" placeholder="' + h.esc(placeholder) + '" aria-label="' + h.esc(placeholder) + '"></label>' + groups +
            '<div class="k-fsum"><span class="muted">' + h.esc(s.data ? T.lgCount(h.fmt(d.total || 0)) : '…') + '</span>' +
            '<button type="button" class="k-btn small" data-act="' + page + ':csv"' + (d.total ? '' : ' disabled') + '>' + h.icon(DOWNLOAD, 14) + h.esc(T.lgCsv) + '</button></div></div>';
    }

    function table(page, heads, rows, empty) {
        var s = L[page], T = t(), d = s.data || {};
        if (!s.data) { return '<div class="k-loading">…</div>'; }
        if (d.error) { return '<div class="k-banner err" style="margin:0">' + h.icon(h.ICONS.warn, 20) + '<span>' + h.esc(T.lgFailed) + '</span></div>'; }
        if (!rows.length) { return '<div class="k-card k-empty">' + h.esc(empty) + '</div>'; }
        return '<div class="k-table-box"><table class="k-table k-lg k-lg-' + page + '"><thead><tr>' + heads.map(function (x) { return '<th>' + h.esc(x) + '</th>'; }).join('') + '</tr></thead><tbody>' +
            rows.map(function (r) { return '<tr>' + r.map(function (c) { return '<td>' + c + '</td>'; }).join('') + '</tr>'; }).join('') + '</tbody></table>' +
            '<div class="k-lg-more"><span class="muted">' + h.esc(T.lgShown(h.fmt(rows.length), h.fmt(d.total))) + '</span>' +
            (d.total > rows.length ? '<button type="button" class="k-btn small" data-act="' + page + ':more"' + (s.busy ? ' disabled' : '') + '>' + h.esc(T.lgMore) + '</button>' : '') + '</div></div>';
    }

    function head(title, sub) {
        return '<div><h1>' + h.esc(title) + '</h1><div class="muted" style="font-size:14px;margin-top:4px">' + h.esc(sub) + '</div></div>';
    }

    function time(ts) { return '<span class="mono k-lg-time">' + h.esc(when(ts)) + '</span>'; }
    function sub(text, mono) { return text ? '<span class="k-lg-sub' + (mono ? ' mono' : '') + '">' + h.esc(text) + '</span>' : ''; }
    function pill(kind, text) { return '<span class="k-pill ' + kind + ' k-lg-pill">' + h.esc(text) + '</span>'; }

    function device(ip) {
        var host = hostByIp(ip);
        return host ? '<b>' + h.esc(h.devName(host)) + '</b>' + sub(host.network || ip) : '<span class="mono">' + h.esc(ip) + '</span>';
    }

    function download(name, text) {
        var blob = new Blob(['﻿' + text], { type: 'text/csv' });
        var a = document.createElement('a');
        a.href = URL.createObjectURL(blob);
        a.download = name + '.csv';
        document.body.appendChild(a);
        a.click();
        setTimeout(function () { URL.revokeObjectURL(a.href); a.remove(); }, 1000);
    }

    function csv(rows) {
        return rows.map(function (r) {
            return r.map(function (c) { return '"' + String(c === null || c === undefined ? '' : c).replace(/"/g, '""') + '"'; }).join(';');
        }).join('\r\n');
    }

    function iso(ts) { return new Date(ts * 1000).toISOString().replace('T', ' ').slice(0, 19) + ' UTC'; }

    /* what every page does the same way: filters, more, search */
    function commonAct(page, name, el) {
        var s = L[page], v = el.getAttribute('data-v');
        if (name === 'set') {
            var f = el.getAttribute('data-f');
            s[f] = (f === 'days' || f === 'hours') ? Number(v) : v;
            s.limit = PAGE;
            reload(page);
            return true;
        }
        if (name === 'more') { s.limit += PAGE; reload(page); return true; }
        return false;
    }

    function commonInput(page, name, el) {
        if (name !== 'q') { return; }
        L[page].q = el.value;
        L[page].limit = PAGE;
        clearTimeout(L.timer);
        L.timer = setTimeout(function () { reload(page, true); }, 450);
    }

    /* ------------------------------------------------------------------ attacks */

    function attackWhat(r) {
        var T = t();
        return ({ ips: T.lgIps, ips_out: T.lgIpsOut, geo: T.lgGeo, blocked: T.lgBlockedAddr, fw: T.lgFw })[r.kind] || r.kind;
    }

    function attackSource(r) {
        var T = t();
        return r.kind.indexOf('ips') === 0 ? T.tabIps : (r.kind === 'geo' ? T.lgSrcGeo : T.lgSrcFw);
    }

    function port(r) {
        return r.dport ? String(r.proto).toUpperCase() + ' ' + r.dport + (PORTS[r.dport] ? ' · ' + PORTS[r.dport] : '') : '';
    }

    function attackTarget(r, own) {
        var T = t();
        if (own.indexOf(r.dst) >= 0) { return h.esc(T.lgFirewall) + sub(port(r), true); }
        return device(r.dst) + (r.dport ? sub(port(r), true) : '');
    }

    function topCard(title, rows) {
        var max = rows.length ? rows[0][1] : 1;
        return '<section class="k-card k-lg-top"><h2>' + h.esc(title) + '</h2>' + (rows.length ? rows.map(function (r) {
            return '<div class="k-lg-toprow"><div><span>' + r[0] + '</span><span class="muted">' + h.esc(h.fmt(r[1])) + '</span></div>' +
                '<div class="k-bar"><div style="width:' + Math.max(4, Math.round(r[1] / max * 100)) + '%"></div></div></div>';
        }).join('') : '<div class="muted">—</div>') + '</section>';
    }

    function viewAttacks() {
        var T = t(), s = L.attacks, d = s.data || {}, own = d.self || [], blocked = d.blocked || [], kinds = d.kinds || {};
        var count = function (keys) { return keys.reduce(function (n, k) { return n + (kinds[k] ? kinds[k][0] : 0); }, 0); };
        var top = d.top || { src: [], cc: [], target: [] };
        var html = '<div class="k-stack">' + head(T.lgAttacksTitle, T.lgAttacksSub) +
            '<div class="k-lg-tops">' +
            topCard(T.lgTopSrc, top.src.map(function (r) { return ['<span class="mono">' + h.esc(r[0]) + '</span>' + (r[1] ? ' <b class="mono small">' + h.esc(r[1]) + '</b>' : ''), r[2]]; })) +
            topCard(T.lgTopCc, top.cc.map(function (r) { return [h.esc(country(r[0])), r[1]]; })) +
            topCard(T.lgTopTarget, top.target.map(function (r) {
                var host = hostByIp(r[0]), name = own.indexOf(r[0]) >= 0 ? T.lgFirewall : (host ? h.devName(host) : r[0]);
                return [h.esc(name) + (r[1] ? ' <span class="mono muted">' + h.esc(String(r[2]).toUpperCase() + ' ' + r[1] + (PORTS[r[1]] ? ' · ' + PORTS[r[1]] : '')) + '</span>' : ''), r[3]];
            })) + '</div>' +
            (blocked.length ? '<div class="k-lg-blocked"><span class="k-flabel">' + h.esc(T.lgBlockedList) + '</span><div class="k-chips k-small">' + blocked.map(function (ip) {
                return '<span class="k-tag deny"><span class="mono">' + h.esc(ip) + '</span><button type="button" data-act="attacks:unblock" data-v="' + h.esc(ip) + '" aria-label="' + h.esc(T.lgUnblock(ip)) + '" title="' + h.esc(T.lgUnblock(ip)) + '">' + h.icon(h.ICONS.close, 14) + '</button></span>';
            }).join('') + '</div></div>' : '') +
            bar('attacks', T.lgAttacksSearch,
                chips('attacks', T.lgPeriod, 'days', [[1, T.lgToday], [7, T.lgDays(7)], [30, T.lgDays(30)]]) +
                chips('attacks', T.lgSource, 'kind', [['', T.fAll, count(['ips', 'ips_out', 'geo', 'fw', 'blocked'])], ['ips', T.tabIps, count(['ips', 'ips_out'])],
                    ['geo', T.lgSrcGeo, count(['geo'])], ['fw', T.lgSrcFw, count(['fw', 'blocked'])]]));
        var rows = (d.rows || []).map(function (r) {
            var isBlocked = blocked.indexOf(r.src) >= 0;
            return [time(r.ts),
                '<span class="mono">' + h.esc(r.src) + '</span>' + (r.cc ? '<span class="k-lg-sub"><b class="mono small">' + h.esc(r.cc) + '</b> ' + h.esc(country(r.cc)) + '</span>' : ''),
                attackTarget(r, own),
                h.esc(attackWhat(r)) + sub(r.msg) + (r.n > 1 ? sub(T.lgTimes(h.fmt(r.n))) : ''),
                '<span class="k-badge">' + h.esc(attackSource(r)) + '</span>',
                r.blocked ? pill('ok', T.lgBlocked) : pill('warn', T.lgAlertOnly),
                isBlocked ? '<span class="muted small">' + h.esc(T.lgIsBlocked) + '</span>' :
                    '<button type="button" class="k-btn small" data-act="attacks:block" data-v="' + h.esc(r.src) + '"' + (s.busy ? ' disabled' : '') + '>' + h.esc(T.lgBlock) + '</button>'];
        });
        return html + table('attacks', [T.lgTime, T.lgWho, T.lgWhere, T.lgWhat, T.lgSource, T.lgResult, ''], rows, T.lgAttacksNone) + '</div>';
    }

    function blockAddress(ip, remove) {
        var s = L.attacks;
        s.busy = true;
        h.redraw('main');
        h.api('POST', '/api/inversapanel/logs/block', { ip: ip, remove: remove ? 1 : 0 }).then(function (res) {
            if (res && res.status === 'ok') { h.notice('ok', remove ? t().lgUnblocked(ip) : t().lgNowBlocked(ip)); }
            else { h.notice('err', (res && res.message) || t().applyFailed); }
            reload('attacks');
        }, function () { s.busy = false; h.notice('err', t().applyFailed); h.redraw('main'); });
    }

    /* ------------------------------------------------------------------ internet history */

    function listed(domain, key) {
        return (h.S().draft.filtering[key] || []).indexOf(domain) >= 0;
    }

    function viewHistory() {
        var T = t(), s = L.history, d = s.data || {}, st = d.settings || null, res = d.results || {};
        var html = '<div class="k-stack">' + head(T.lgHistoryTitle, T.lgHistorySub);
        if (!st) { return html + '<div class="k-loading">…</div></div>'; }
        var nets = (h.S().options.interfaces || []).filter(function (i) { return i.selected; });
        html += '<section class="k-card k-lg-set"><div class="k-lg-setrow">' + h.toggle(st.history, 'data-act="history:toggle"' + (s.busy ? ' disabled' : ''), T.lgHistoryKeep) +
            '<div class="k-lg-settext"><b>' + h.esc(T.lgHistoryKeep) + '</b><span class="muted">' + h.esc(T.lgHistoryKeepSub) + '</span></div>' +
            (st.history ? '<div class="k-fgroup"><span class="k-flabel">' + h.esc(T.lgNetworks) + '</span><div class="k-chips">' + nets.map(function (i) {
                var on = st.networks.indexOf(i.key) >= 0;
                return '<button type="button" class="k-chip' + (on ? ' on' : '') + '" data-act="history:net" data-v="' + h.esc(i.key) + '" aria-pressed="' + on + '"' + (s.busy ? ' disabled' : '') + '>' +
                    '<span class="k-dot" style="background:' + h.esc(i.color || '') + '"></span>' + h.esc(i.name) + '</button>';
            }).join('') + '</div></div>' : '') + '</div></section>';
        if (!st.dnsstats) {
            return html + '<div class="k-banner warn" style="margin:0">' + h.icon(h.ICONS.warn, 20) + '<span style="flex:1 1 auto">' + h.esc(T.lgNoStats) + '</span>' +
                '<button type="button" class="k-btn small" data-act="tab" data-v="settings">' + h.esc(T.tabSettings) + '</button></div></div>';
        }
        if (!st.history) { return html + '<div class="k-card k-empty">' + h.esc(T.lgHistoryOff) + '</div></div>'; }
        if (!st.networks.length) { return html + '<div class="k-card k-empty">' + h.esc(T.lgHistoryNoNet) + '</div></div>'; }
        html += bar('history', T.lgHistorySearch,
            chips('history', T.lgPeriod, 'hours', [[1, T.lgLastHour], [24, T.lgLast24], [168, T.lgDays(7)]]) +
            chips('history', T.lgResult, 'result', [['', T.fAll, h.fmt((res.pass || 0) + (res.block || 0))], ['pass', T.lgAllowed, h.fmt(res.pass || 0)], ['block', T.lgBlocked, h.fmt(res.block || 0)]]));
        var rows = (d.rows || []).map(function (r) {
            var key = r.blocked ? 'allowlist' : 'denylist';
            return [time(r.ts), device(r.client),
                '<span class="mono">' + h.esc(r.domain) + '</span>' + (r.n > 1 ? sub(T.lgTimes(h.fmt(r.n))) : ''),
                (r.blocked ? pill('warn', T.lgBlocked) + (r.list ? ' <span class="k-badge">' + h.esc(r.list === 'Custom' ? T.customList : r.list) + '</span>' : '') : pill('ok', T.lgAllowed)),
                listed(r.domain, key) ? '<span class="muted small">' + h.esc(T.lgInList) + '</span>' :
                    '<button type="button" class="k-btn small" data-act="history:' + (r.blocked ? 'allow' : 'deny') + '" data-v="' + h.esc(r.domain) + '">' + h.esc(r.blocked ? T.lgAllow : T.lgBlock) + '</button>'];
        });
        return html + table('history', [T.lgTime, T.colDevice, T.lgDomain, T.lgResult, ''], rows, T.lgHistoryNone) + '</div>';
    }

    function historySet(history, networks) {
        var s = L.history;
        s.busy = true;
        h.redraw('main');
        h.api('POST', '/api/inversapanel/logs/historyset', { history: history ? 1 : 0, networks: networks }).then(function () { reload('history'); },
            function () { s.busy = false; h.notice('err', t().applyFailed); h.redraw('main'); });
    }

    /* ------------------------------------------------------------------ logins and changes */

    var PANEL_PAGES = { service: 'tabSettings', vpn: 'tabVpn', network: 'tabNet', portforward: 'tabPf', geo: 'tabGeo', ips: 'tabIps', devices: 'tabDevices', logs: 'tabLogs' };

    /* [title, who / what, detail] */
    function eventRow(e) {
        var T = t(), o = T.ov, host, who = function () { return h.esc(e.user) + sub(e.ip, true); };
        switch (e.k) {
            case 'login_ok': return [T.lgLogin, who(), h.esc(T.lgLoginOk)];
            case 'login_fail': return [T.lgLoginTry, who(), pill('warn', T.lgLoginBad)];
            case 'config':
                var m = /^\/api\/inversapanel\/([a-z]+)\//.exec(e.page || '');
                return [T.lgConfig, who(), h.esc(m ? 'Inversa Panel · ' + (T[PANEL_PAGES[m[1]]] || m[1]) : 'OPNsense · ' + (e.page || ''))];
            case 'device_wait':
                host = h.hostByMac(e.mac);
                return [o.evWait, h.esc(host ? h.devName(host) : e.mac) + sub(host ? host.network : ''), '<span class="mono">' + h.esc(e.mac) + '</span>'];
            case 'peer_on': return [o.evPeer, h.esc(e.name) + sub(e.conn), ''];
            case 'vpn_up': return [o.evVpnUp, h.esc(e.name), ''];
            case 'vpn_down': return [o.evVpnDown, h.esc(e.name), ''];
            case 'wan_up': return [o.evWanUp, h.esc(T.lgSystem), ''];
            case 'wan_down': return [o.evWanDown, h.esc(T.lgSystem), ''];
            case 'sched_on': return [o.evSchedOn, h.esc(e.name), ''];
            case 'sched_off': return [o.evSchedOff, h.esc(e.name), ''];
            case 'lists': return [o.evLists, h.esc(T.lgSystem), ''];
            case 'boot': return [o.evBoot, h.esc(T.lgSystem), ''];
        }
        return [e.k, '', ''];
    }

    function viewEvents() {
        var T = t(), d = L.events.data || {};
        var rows = (d.rows || []).map(function (e) {
            var r = eventRow(e);
            return [time(e.t), '<b>' + h.esc(r[0]) + '</b>', r[1], r[2]];
        });
        return '<div class="k-stack">' + head(T.lgEventsTitle, T.lgEventsSub) +
            bar('events', T.lgEventsSearch,
                chips('events', T.lgPeriod, 'days', [[1, T.lgToday], [7, T.lgDays(7)], [30, T.lgDays(30)], [90, T.lgDays(90)]]) +
                chips('events', T.lgType, 'type', [['', T.fAll], ['vpn', T.tabVpn], ['login', T.lgTypeLogin], ['device', T.tabDevices], ['config', T.lgTypeConfig], ['system', T.lgSystem]])) +
            table('events', [T.lgTime, T.lgEvent, T.lgWhoWhat, T.lgDetail], rows, T.lgEventsNone) + '</div>';
    }

    /* ------------------------------------------------------------------ CSV */

    function exportCsv(page) {
        request(page, 5000).then(function (d) {
            var rows;
            if (page === 'attacks') {
                rows = [['time', 'source', 'country', 'target', 'port', 'protocol', 'kind', 'message', 'blocked', 'count']].concat((d.rows || []).map(function (r) {
                    return [iso(r.ts), r.src, r.cc, r.dst, r.dport || '', r.proto, r.kind, r.msg, r.blocked ? 'yes' : 'no', r.n];
                }));
            } else if (page === 'history') {
                rows = [['time', 'device', 'address', 'domain', 'result', 'list', 'count']].concat((d.rows || []).map(function (r) {
                    var host = hostByIp(r.client);
                    return [iso(r.ts), host ? h.devName(host) : '', r.client, r.domain, r.blocked ? 'blocked' : 'allowed', r.list, r.n];
                }));
            } else {
                rows = [['time', 'event', 'user', 'address', 'detail']].concat((d.rows || []).map(function (e) {
                    return [iso(e.t), e.k, e.user || e.name || e.mac || '', e.ip || '', e.page || e.conn || e.net || ''];
                }));
            }
            download('inversapanel-' + page, csv(rows));
        }, function () { h.notice('err', t().lgFailed); });
    }

    /* ------------------------------------------------------------------ pages */

    function register(page, label, render, act) {
        window.InversaPanelApp.register({
            key: page,
            label: label,
            load: function () { L[page].limit = PAGE; return load(page); },
            render: render,
            act: function (name, el) {
                if (commonAct(page, name, el)) { return null; }
                if (name === 'csv') { exportCsv(page); return null; }
                return act ? act(name, el.getAttribute('data-v')) : null;
            },
            input: function (name, el) { commonInput(page, name, el); return null; }
        });
    }

    register('attacks', function (T) { return T.lgAttacksTitle; }, viewAttacks, function (name, v) {
        if (name === 'block') { blockAddress(v, false); }
        if (name === 'unblock') { blockAddress(v, true); }
        return null;
    });

    register('history', function (T) { return T.lgHistoryTitle; }, viewHistory, function (name, v) {
        var st = (L.history.data || {}).settings, f = h.S().draft.filtering;
        if (name === 'toggle' && st) {
            /* switched on for the first time: every protected network, the person narrows it down */
            var all = (h.S().options.interfaces || []).filter(function (i) { return i.selected; }).map(function (i) { return i.key; });
            historySet(!st.history, st.networks.length ? st.networks : all);
        }
        if (name === 'net' && st) { historySet(true, h.toggleInList(st.networks, v)); }
        if (name === 'deny' || name === 'allow') {
            var key = name === 'allow' ? 'allowlist' : 'denylist', other = name === 'allow' ? 'denylist' : 'allowlist';
            if (f[key].indexOf(v) < 0) { f[key] = f[key].concat([v]); }
            f[other] = f[other].filter(function (x) { return x !== v; });
            /* a change like any other on the lists page: it waits for "Apply" */
            return 'full';
        }
        return null;
    });

    register('events', function (T) { return T.lgEventsTitle; }, viewEvents, null);
})();
