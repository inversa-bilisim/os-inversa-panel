/*
 * SPDX-License-Identifier: BSD-2-Clause
 * Copyright (C) 2026 Inversa Bilişim
 *
 * Countries, via an OPNsense GeoIP alias: block the chosen countries, or let only the chosen
 * countries in (each mode keeps its own list). Country names come from the browser
 * (Intl.DisplayNames), so they follow the interface language without translation tables.
 */
(function () {
    'use strict';
    var h = window.InversaPanelApp.h;
    var ICON = 'M12 2a10 10 0 1 0 0 20a10 10 0 1 0 0-20zM2 12h20M12 2a15 15 0 0 1 0 20M12 2a15 15 0 0 0 0 20';
    var CODES = ('AD AE AF AG AI AL AM AO AQ AR AS AT AU AW AX AZ BA BB BD BE BF BG BH BI BJ BL BM BN BO BQ BR BS BT BV BW BY BZ CA CC CD CF CG CH CI CK CL CM CN CO CR CU CV CW CX CY CZ ' +
        'DE DJ DK DM DO DZ EC EE EG EH ER ES ET FI FJ FK FM FO FR GA GB GD GE GF GG GH GI GL GM GN GP GQ GR GS GT GU GW GY HK HM HN HR HT HU ID IE IL IM IN IO IQ IR IS IT JE JM JO JP ' +
        'KE KG KH KI KM KN KP KR KW KY KZ LA LB LC LI LK LR LS LT LU LV LY MA MC MD ME MF MG MH MK ML MM MN MO MP MQ MR MS MT MU MV MW MX MY MZ NA NC NE NF NG NI NL NO NP NR NU NZ ' +
        'OM PA PE PF PG PH PK PL PM PN PR PS PT PW PY QA RE RO RS RU RW SA SB SC SD SE SG SH SI SJ SK SL SM SN SO SR SS ST SV SX SY SZ TC TD TF TG TH TJ TK TL TM TN TO TR TT TV TW TZ ' +
        'UA UG UM US UY UZ VA VC VE VG VI VN VU WF WS YE YT ZA ZM ZW').split(' ');

    var Q = { status: null, search: '', key: '' };

    function load() {
        return h.api('GET', '/api/inversapanel/geo/status').then(function (data) { Q.status = data; });
    }

    /* plain text on purpose: password managers fill password fields with saved logins */
    function keyInput(placeholder) {
        return '<input type="text" class="mono" name="inversapanel-maxmind-license" data-input="geo:key" value="' + h.esc(Q.key) + '" placeholder="' + h.esc(placeholder) + '"' +
            ' autocomplete="off" autocorrect="off" autocapitalize="off" spellcheck="false" data-lpignore="true" data-1p-ignore="true" data-form-type="other">';
    }

    function name(code) {
        try {
            return new Intl.DisplayNames([h.T().locale], { type: 'region' }).of(code) || code;
        } catch (e) {
            return code;
        }
    }

    /* the list the chosen mode works with */
    function listKey(g) {
        return g.mode === 'allow' ? 'allowed' : 'countries';
    }

    window.InversaPanelApp.register({
        key: 'geo',
        icon: ICON,
        label: function (T) { return T.tabGeo; },
        load: load,
        render: function () {
            var T = h.T(), g = h.S().draft.geo, sv = h.S().saved.geo, st = Q.status || {};
            var allow = g.mode === 'allow', key = listKey(g), list = g[key] || [];
            var html = '<div class="k-stack"><div><h1>' + h.esc(T.geoTitle) + '</h1><div class="muted" style="font-size:14px;margin-top:4px">' + h.esc(T.geoSub) + '</div></div>';
            /* honest state: "on" only means something once there are countries and the country database is loaded */
            var stateText, stateCls = 'muted', working = false;
            if (!g.enabled) { stateText = T.off; }
            else if (!list.length) { stateText = allow ? T.geoAllowEmpty : T.geoBlockEmpty; stateCls = 'k-warn-text'; }
            else if (!st.ready) { stateText = sv.enabled ? T.geoDownloading : T.geoNotWorking; stateCls = 'k-warn-text'; }
            else if (allow && sv.enabled && sv.mode === 'allow' && (sv.allowed || []).length && !st.allow_data) { stateText = T.geoAllowNoData; stateCls = 'k-warn-text'; }
            else { working = true; stateText = (allow ? T.geoOnAllow(list.length) : T.geoOn(list.length)) + ' · ' + T.geoAddresses(h.fmt(st.addresses)); }
            if (g.enabled && !st.ready && sv.enabled && !Q.poll) {
                /* data is being fetched in the background: look again shortly */
                Q.poll = setTimeout(function () { Q.poll = null; load().then(function () { h.redraw('main'); }); }, 15000);
            }

            var dbText, dbControl = '';
            if (st.source === 'maxmind') {
                dbText = st.ready ? T.geoKeyOk : T.geoKeyPending;
                dbControl = keyInput(T.geoKeyReplace);
            } else if (st.source === 'other') {
                dbText = T.geoDbOther;
            } else {
                dbText = 'DB-IP Lite · ' + T.geoDbipFree + ' · ' + (st.ready ? T.geoDbipLoaded(st.month || '', h.fmt(st.addresses)) : T.geoDbipLater);
                dbControl = Q.showKey ? keyInput(T.geoKeyPh) + '<span class="muted small"><a href="https://www.maxmind.com/en/geolite2/signup" target="_blank" rel="noopener">' + h.esc(T.geoGetKey) + '</a></span>'
                    : '<button type="button" class="k-link small" style="min-height:32px" data-act="geo:showkey">' + h.esc(T.geoUseMaxmind) + '</button>';
            }
            function seg(act, current, options) {
                return '<div class="k-seg">' + options.map(function (o) {
                    return '<button type="button" class="' + (current === o[0] ? 'on' : '') + '" data-act="geo:' + act + '" data-v="' + o[0] + '" aria-pressed="' + (current === o[0]) + '">' + h.esc(o[1]) + '</button>';
                }).join('') + '</div>';
            }
            function row(title, sub, control) {
                return '<div class="k-setting wrap"><div class="k-setting-text"><b>' + h.esc(title) + '</b><span class="muted">' + sub + '</span></div>' + control + '</div>';
            }

            /* what was refused is shown while the restriction is on (the counter is the rule's own) */
            var counter = sv.enabled ? '<section class="k-card k-side k-compact k-geo-count"><div class="muted">' + h.esc(T.geoStats) + '</div>' +
                '<div class="k-kpi-value">' + h.esc(h.fmt(st.blocked_packets || 0)) + '</div><div class="muted small">' + h.esc(T.geoStatsHint) + '</div></section>' : '';
            html += '<div class="k-row stretch"><section class="k-card k-grow k-compact">' +
                '<div class="k-setting"><div class="k-ibox' + (working ? ' on' : (g.enabled ? ' cut' : '')) + '">' + h.icon(ICON, 20) + '</div>' +
                '<div class="k-setting-text"><b>' + h.esc(T.geoEnable) + '</b><span class="' + stateCls + '">' + h.esc(stateText) + '</span></div>' +
                h.toggle(g.enabled, 'data-act="geo:enabled"', T.geoEnable) + '</div>' +
                row(T.geoMode, h.esc(allow ? T.geoModeAllowDesc : T.geoModeBlockDesc), seg('mode', allow ? 'allow' : 'block', [['block', T.geoModeBlock], ['allow', T.geoModeAllow]])) +
                /* letting only some countries in is about what comes in; going out stays open */
                (allow ? '' : row(T.geoDir, h.esc(g.direction === 'both' ? T.dirBothDesc : T.dirInDesc), seg('dir', g.direction, [['in', T.dirIn], ['both', T.dirBoth]]))) +
                row(T.geoVpn, h.esc(T.geoVpnSub), h.toggle(!!g.vpnexempt, 'data-act="geo:vpnexempt"', T.geoVpn)) +
                '<div class="k-geo-db"><span class="muted small"><b>' + h.esc(T.geoDb) + ':</b> ' + h.esc(dbText) + (st.source === 'maxmind' || st.source === 'other' ? '' :
                    ' · <a href="https://db-ip.com" target="_blank" rel="noopener">IP Geolocation by DB-IP</a>') + '</span>' +
                (dbControl ? '<span class="k-geo-key">' + dbControl + '</span>' : '') + '</div>' +
                '</section>' + counter + '</div>';
            if (g.enabled && allow) {
                html += '<div class="muted small">' + h.esc(T.geoAllowSafety) + '</div>';
            }
            if (g.enabled && !st.ready && !sv.enabled) {
                html += '<div class="muted small">' + h.esc(T.geoAfterApply) + '</div>';
            }

            var q = Q.search.trim().toLocaleLowerCase(T.locale);
            var avail = CODES.filter(function (c) {
                return list.indexOf(c) < 0 && (!q || (c + ' ' + name(c)).toLocaleLowerCase(T.locale).indexOf(q) >= 0);
            }).sort(function (a, b) { return name(a).localeCompare(name(b), T.locale); });
            html += '<section class="k-card k-compact"><div class="k-geo-head"><h2>' + h.esc(allow ? T.geoAllowed : T.geoBlocked) + '</h2><span class="muted small">' + h.esc(T.geoCount(list.length)) + '</span>' +
                '<label class="k-search">' + h.icon(h.ICONS.search, 16) + '<input type="search" data-input="geo:search" value="' + h.esc(Q.search) + '" placeholder="' + h.esc(T.geoSearch) + '" aria-label="' + h.esc(T.geoSearch) + '"></label></div>' +
                (list.length ? '<div class="k-chips k-small">' + list.map(function (c) {
                    return '<span class="k-tag ' + (allow ? 'allow' : 'deny') + '"><b class="mono small">' + c + '</b>&nbsp;' + h.esc(name(c)) +
                        '<button type="button" data-act="geo:del" data-v="' + c + '" aria-label="' + h.esc(T.removeAria(name(c))) + '">' + h.icon(h.ICONS.close, 14) + '</button></span>';
                }).join('') + '</div>' : '<div class="muted">' + h.esc(allow ? T.geoAllowPick : T.geoBlockPick) + '</div>') +
                '<div class="k-chips k-small k-scroll">' + avail.map(function (c) {
                    return '<button type="button" class="k-chip" data-act="geo:add" data-v="' + c + '"><b class="mono small">' + c + '</b>' + h.esc(name(c)) + '</button>';
                }).join('') + '</div></section>';
            return html + '</div>';
        },
        act: function (name, el) {
            var g = h.S().draft.geo, v = el.getAttribute('data-v'), key = listKey(g);
            switch (name) {
                case 'enabled': g.enabled = !g.enabled; return 'main';
                case 'showkey': Q.showKey = true; return 'main';
                case 'mode': g.mode = v === 'allow' ? 'allow' : 'block'; Q.search = ''; return 'main';
                case 'vpnexempt': g.vpnexempt = !g.vpnexempt; return 'main';
                case 'dir': g.direction = v; return 'main';
                case 'add': g[key] = (g[key] || []).concat([v]); Q.search = ''; return 'main';
                case 'del': g[key] = (g[key] || []).filter(function (c) { return c !== v; }); return 'main';
            }
            return null;
        },
        input: function (name, el, type) {
            if (name === 'search') {
                Q.search = el.value;
                return type === 'change' ? null : 'main-keepfocus';
            }
            if (name === 'key') {
                Q.key = el.value.trim();
                /* only what looks like a MaxMind key is offered for Apply (server checks again) */
                if (Q.key && !/^([A-Za-z0-9]{16}|[A-Za-z0-9_]{16,60}_mmk)$/.test(Q.key)) {
                    h.S().ui.geoLicense = '';
                    return 'pending';
                }
                /* sent with the next Apply, never stored in the browser */
                h.S().ui.geoLicense = Q.key;
                return 'pending';
            }
            return null;
        },
        changes: function (add, d, s) {
            var T = h.T(), g = d.geo, b = s.geo;
            if (!!g.enabled !== !!b.enabled) {
                add(T.geoEnable, b.enabled ? T.on : T.off, g.enabled ? T.on : T.off, function () { g.enabled = b.enabled; });
            }
            if (g.mode !== b.mode) {
                var modes = { block: T.geoModeBlock, allow: T.geoModeAllow };
                add(T.geoMode, modes[b.mode], modes[g.mode], function () { g.mode = b.mode; });
            }
            if (g.direction !== b.direction) {
                var m = { 'in': T.dirIn, both: T.dirBoth };
                add(T.geoDir, m[b.direction], m[g.direction], function () { g.direction = b.direction; });
            }
            if (!!g.vpnexempt !== !!b.vpnexempt) {
                add(T.geoVpn, b.vpnexempt ? T.on : T.off, g.vpnexempt ? T.on : T.off, function () { g.vpnexempt = b.vpnexempt; });
            }
            [['countries', T.geoBlocked], ['allowed', T.geoAllowed]].forEach(function (l) {
                var k = l[0], now = g[k] || [], before = b[k] || [];
                now.forEach(function (c) {
                    if (before.indexOf(c) < 0) { add(l[1], '', name(c), function () { g[k] = g[k].filter(function (x) { return x !== c; }); }); }
                });
                before.forEach(function (c) {
                    if (now.indexOf(c) < 0) { add(l[1], name(c), '', function () { g[k] = (g[k] || []).concat([c]); }); }
                });
            });
            if (h.S().ui.geoLicense) {
                add(T.geoDb, '', T.geoKeySet, function () { h.S().ui.geoLicense = ''; Q.key = ''; });
            }
        }
    });
})();
