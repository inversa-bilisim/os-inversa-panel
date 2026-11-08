/*
 * SPDX-License-Identifier: BSD-2-Clause
 * Copyright (C) 2026 Inversa Bilişim
 *
 * Country blocking via an OPNsense GeoIP alias. Country names come from the browser
 * (Intl.DisplayNames), so they follow the interface language without translation tables.
 */
(function () {
    'use strict';
    var h = window.MinnoshApp.h;
    var ICON = 'M12 2a10 10 0 1 0 0 20a10 10 0 1 0 0-20zM2 12h20M12 2a15 15 0 0 1 0 20M12 2a15 15 0 0 0 0 20';
    var CODES = ('AD AE AF AG AI AL AM AO AQ AR AS AT AU AW AX AZ BA BB BD BE BF BG BH BI BJ BL BM BN BO BQ BR BS BT BV BW BY BZ CA CC CD CF CG CH CI CK CL CM CN CO CR CU CV CW CX CY CZ ' +
        'DE DJ DK DM DO DZ EC EE EG EH ER ES ET FI FJ FK FM FO FR GA GB GD GE GF GG GH GI GL GM GN GP GQ GR GS GT GU GW GY HK HM HN HR HT HU ID IE IL IM IN IO IQ IR IS IT JE JM JO JP ' +
        'KE KG KH KI KM KN KP KR KW KY KZ LA LB LC LI LK LR LS LT LU LV LY MA MC MD ME MF MG MH MK ML MM MN MO MP MQ MR MS MT MU MV MW MX MY MZ NA NC NE NF NG NI NL NO NP NR NU NZ ' +
        'OM PA PE PF PG PH PK PL PM PN PR PS PT PW PY QA RE RO RS RU RW SA SB SC SD SE SG SH SI SJ SK SL SM SN SO SR SS ST SV SX SY SZ TC TD TF TG TH TJ TK TL TM TN TO TR TT TV TW TZ ' +
        'UA UG UM US UY UZ VA VC VE VG VI VN VU WF WS YE YT ZA ZM ZW').split(' ');

    var Q = { status: null, search: '', key: '' };

    function load() {
        return h.api('GET', '/api/minnosh/geo/status').then(function (data) { Q.status = data; });
    }

    function name(code) {
        try {
            return new Intl.DisplayNames([h.T().locale], { type: 'region' }).of(code) || code;
        } catch (e) {
            return code;
        }
    }

    window.MinnoshApp.register({
        key: 'geo',
        icon: ICON,
        label: function (T) { return T.tabGeo; },
        load: load,
        render: function () {
            var T = h.T(), g = h.S().draft.geo, st = Q.status || {};
            var html = '<div class="k-stack"><div><h1>' + h.esc(T.geoTitle) + '</h1><div class="muted" style="font-size:14px;margin-top:4px">' + h.esc(T.geoSub) + '</div></div>';
            /* honest state: "on" only means something once the country database is loaded */
            var stateText, stateCls = 'muted';
            if (!g.enabled) { stateText = T.off; }
            else if (!st.ready) { stateText = T.geoNotWorking; stateCls = 'k-warn-text'; }
            else { stateText = T.geoOn(g.countries.length) + ' · ' + T.geoAddresses(h.fmt(st.addresses)); }
            var keyState = st.database ? (st.maxmind ? (st.ready ? T.geoKeyOk : T.geoKeyPending) : T.geoDbOther) : T.geoDbMissing;

            html += '<section class="k-card tight">' +
                '<div class="k-setting"><div class="k-ibox big' + (g.enabled && st.ready ? ' on' : (g.enabled ? ' cut' : '')) + '">' + h.icon(ICON, 22) + '</div>' +
                '<div class="k-setting-text"><b style="font-size:16px">' + h.esc(T.geoEnable) + '</b><span class="' + stateCls + '">' + h.esc(stateText) + '</span></div>' +
                h.toggle(g.enabled, 'data-act="geo:enabled"', T.geoEnable) + '</div>' +
                /* one row: database key first (with where to get one), direction next to it */
                '<div class="k-geo-row">' +
                '<div class="k-field k-geo-key"><span>' + h.esc(T.geoDb) + '</span>' +
                (st.database && !st.maxmind ? '<span class="muted">' + h.esc(T.geoDbOther) + '</span>' :
                    /* plain text on purpose: password managers fill password fields with saved logins */
                    '<input type="text" class="mono" name="minnosh-maxmind-license" data-input="geo:key" value="' + h.esc(Q.key) + '" placeholder="' +
                    h.esc(st.maxmind ? T.geoKeyReplace : T.geoKeyPh) + '" autocomplete="off" autocorrect="off" autocapitalize="off" spellcheck="false" data-lpignore="true" data-1p-ignore="true" data-form-type="other">' +
                    '<span class="muted small">' + h.esc(keyState) + ' · <a href="https://www.maxmind.com/en/geolite2/signup" target="_blank" rel="noopener">' + h.esc(T.geoGetKey) + '</a></span>') +
                '</div>' +
                '<div class="k-field"><span>' + h.esc(T.geoDir) + '</span><div class="k-seg">' + [['in', T.dirIn], ['both', T.dirBoth]].map(function (o) {
                    return '<button type="button" class="' + (g.direction === o[0] ? 'on' : '') + '" data-act="geo:dir" data-v="' + o[0] + '">' + h.esc(o[1]) + '</button>';
                }).join('') + '</div><span class="muted small">' + h.esc(g.direction === 'both' ? T.dirBothDesc : T.dirInDesc) + '</span></div>' +
                '</div></section>';
            if (g.enabled && !st.ready) {
                html += '<div class="k-banner warn" style="margin:0">' + h.icon(h.ICONS.warn, 20) + '<span>' + h.esc(st.database ? T.geoWaitDb : T.geoNeedKey) + '</span></div>';
            }

            var q = Q.search.trim().toLocaleLowerCase(T.locale);
            var avail = CODES.filter(function (c) {
                return g.countries.indexOf(c) < 0 && (!q || (c + ' ' + name(c)).toLocaleLowerCase(T.locale).indexOf(q) >= 0);
            }).sort(function (a, b) { return name(a).localeCompare(name(b), T.locale); });
            html += '<div class="k-row"><section class="k-card k-grow"><div class="k-card-head"><h2>' + h.esc(T.geoBlocked) + '</h2><span class="muted">' + h.esc(T.geoCount(g.countries.length)) + '</span></div>' +
                '<div class="k-chips">' + g.countries.map(function (c) {
                    return '<span class="k-tag deny"><b class="mono small">' + c + '</b>&nbsp;' + h.esc(name(c)) +
                        '<button type="button" data-act="geo:del" data-v="' + c + '" aria-label="' + h.esc(T.removeAria(name(c))) + '">' + h.icon(h.ICONS.close, 14) + '</button></span>';
                }).join('') + '</div>' +
                '<label class="k-search" style="max-width:none">' + h.icon(h.ICONS.search) + '<input type="search" data-input="geo:search" value="' + h.esc(Q.search) + '" placeholder="' + h.esc(T.geoSearch) + '" aria-label="' + h.esc(T.geoSearch) + '"></label>' +
                '<div class="k-chips k-scroll">' + avail.slice(0, 80).map(function (c) {
                    return '<button type="button" class="k-chip" data-act="geo:add" data-v="' + c + '"><b class="mono small">' + c + '</b>' + h.esc(name(c)) + '</button>';
                }).join('') + '</div></section>' +
                '<section class="k-card k-side"><div class="muted">' + h.esc(T.geoStats) + '</div><div class="k-kpi-value">' + h.esc(h.fmt(st.blocked_packets || 0)) + '</div>' +
                '<div class="muted small">' + h.esc(T.geoStatsHint) + '</div></section></div>';
            return html + '</div>';
        },
        act: function (name, el) {
            var g = h.S().draft.geo, v = el.getAttribute('data-v');
            switch (name) {
                case 'enabled': g.enabled = !g.enabled; return 'main';
                case 'dir': g.direction = v; return 'main';
                case 'add': g.countries = g.countries.concat([v]); Q.search = ''; return 'main';
                case 'del': g.countries = g.countries.filter(function (c) { return c !== v; }); return 'main';
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
            if (g.direction !== b.direction) {
                var m = { 'in': T.dirIn, both: T.dirBoth };
                add(T.geoDir, m[b.direction], m[g.direction], function () { g.direction = b.direction; });
            }
            g.countries.forEach(function (c) {
                if (b.countries.indexOf(c) < 0) { add(T.geoBlocked, '', name(c), function () { g.countries = g.countries.filter(function (x) { return x !== c; }); }); }
            });
            b.countries.forEach(function (c) {
                if (g.countries.indexOf(c) < 0) { add(T.geoBlocked, name(c), '', function () { g.countries = g.countries.concat([c]); }); }
            });
            if (h.S().ui.geoLicense) {
                add(T.geoDb, '', T.geoKeySet, function () { h.S().ui.geoLicense = ''; Q.key = ''; });
            }
        }
    });
})();
