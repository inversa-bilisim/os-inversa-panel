/*
 * SPDX-License-Identifier: BSD-2-Clause
 * Copyright (C) 2026 Inversa Bilişim
 *
 * Notifications: a Telegram bot tells a chat what happened (a new device, an attack alert, ...).
 * Stored right away with "Save", not part of the pending changes. The bot token is write-only:
 * the page only knows whether one is stored and how it ends.
 */
(function () {
    'use strict';
    var h = window.InversaPanelApp.h;
    var KINDS = ['devices', 'attacks', 'vpn', 'internet', 'logins'];
    var N = { data: null, form: null, chats: null, busy: '', failed: false };

    function load() {
        return h.api('GET', '/api/inversapanel/notify/get').then(function (data) {
            N.data = data;
            N.failed = false;
            if (!N.form) {
                N.form = { enabled: !!data.enabled, token: '', chat: data.chat || '' };
                KINDS.forEach(function (k) { N.form[k] = !!data[k]; });
            }
        }, function () { N.failed = true; });
    }

    function save() {
        var f = N.form, payload = { enabled: f.enabled ? '1' : '0', token: f.token.trim(), chat: f.chat.trim() };
        KINDS.forEach(function (k) { payload[k] = f[k] ? '1' : '0'; });
        return h.api('POST', '/api/inversapanel/notify/set', payload).then(function (res) {
            if (!res || res.status !== 'ok') { throw res; }
            f.token = '';
            return load();
        });
    }

    function problem(err) {
        var T = h.T(), list = [];
        if (err && err.validations) { Object.keys(err.validations).forEach(function (k) { list.push(err.validations[k]); }); }
        if (err && err.error) { list.push(err.error); }
        h.notice('err', T.ntFailed, list);
    }

    function run(name, work) {
        if (N.busy) { return 'main'; }
        N.busy = name;
        work().catch(problem).then(function () { N.busy = ''; h.redraw('main'); });
        return 'main';
    }

    window.InversaPanelApp.register({
        key: 'notify',
        label: function (T) { return T.tabNotify; },
        load: load,
        render: function () {
            var T = h.T(), d = N.data, f = N.form;
            var html = '<div class="k-stack"><div><h1>' + h.esc(T.tabNotify) + '</h1><div class="muted" style="font-size:14px;margin-top:4px">' + h.esc(T.ntSub) + '</div></div>';
            if (!d || !f) {
                return html + '<section class="k-card"><span class="' + (N.failed ? 'k-note warn' : 'muted') + '">' + (N.failed ? h.esc(T.ntLoadFailed) : '…') + '</span></section></div>';
            }
            var busy = N.busy ? ' disabled' : '';
            html += '<div class="k-row stretch"><section class="k-card" style="flex:3 1 460px">' +
                '<div class="k-setting" style="padding-top:0"><div class="k-setting-text"><b>' + h.esc(T.ntEnable) + '</b><span class="muted">' + h.esc(T.ntEnableSub) + '</span></div>' +
                h.toggle(f.enabled, 'data-act="notify:enabled"', T.ntEnable) + '</div>';
            if (d.error) {
                html += '<span class="k-note warn">' + h.esc(T.ntError(d.error.waiting, d.error.text)) + '</span>';
            }
            html += '<label class="k-field"><span>' + h.esc(T.ntToken) + '</span>' +
                '<input type="text" class="mono" data-input="notify:token" value="' + h.esc(f.token) + '" autocomplete="off" spellcheck="false" placeholder="' +
                h.esc(d.has_token ? T.ntTokenKept(d.token_end) : '123456789:AAH…') + '">' +
                '<span class="muted small" style="font-weight:400">' + h.esc(T.ntTokenHint) + '</span></label>' +
                '<label class="k-field"><span>' + h.esc(T.ntChat) + '</span>' +
                '<div style="display:flex;gap:8px;flex-wrap:wrap"><input type="text" class="mono" style="flex:1 1 200px;min-width:0" data-input="notify:chat" value="' + h.esc(f.chat) +
                '" autocomplete="off" spellcheck="false" placeholder="123456789">' +
                '<button type="button" class="k-btn" data-act="notify:find"' + busy + '>' + h.esc(N.busy === 'find' ? '…' : T.ntFind) + '</button></div>' +
                '<span class="muted small" style="font-weight:400">' + h.esc(T.ntChatHint) + '</span></label>';
            if (N.chats) {
                html += N.chats.length ? '<div class="k-chips">' + N.chats.map(function (c) {
                    return '<button type="button" class="k-chip' + (String(c.id) === f.chat ? ' on' : '') + '" data-act="notify:pick" data-v="' + h.esc(c.id) + '">' +
                        h.esc(c.name || c.id) + ' <span class="k-count">' + h.esc(c.id) + '</span></button>';
                }).join('') + '</div>' : '<span class="k-note">' + h.esc(T.ntNoChats) + '</span>';
            }
            html += '<div><div class="muted small" style="margin-bottom:2px">' + h.esc(T.ntWhat) + '</div>' + KINDS.map(function (k) {
                return '<div class="k-setting"><div class="k-setting-text"><b>' + h.esc(T.ntKinds[k][0]) + '</b><span class="muted">' + h.esc(T.ntKinds[k][1]) + '</span></div>' +
                    h.toggle(f[k], 'data-act="notify:kind" data-v="' + k + '"', T.ntKinds[k][0]) + '</div>';
            }).join('') + '</div>' +
                '<div class="k-btns"><button type="button" class="k-btn primary" data-act="notify:save"' + busy + '>' + h.esc(N.busy === 'save' ? '…' : T.ntSave) + '</button>' +
                '<button type="button" class="k-btn" data-act="notify:test"' + busy + '>' + h.esc(N.busy === 'test' ? '…' : T.ntTest) + '</button></div></section>' +
                '<section class="k-card" style="flex:2 1 320px"><div class="k-card-head"><h2>' + h.esc(T.ntHowTitle) + '</h2></div><ol class="k-steps">' +
                T.ntHow.map(function (step) { return '<li>' + h.esc(step) + '</li>'; }).join('') + '</ol>' +
                '<div class="muted small">' + h.esc(T.ntPrivacy) + '</div></section></div>';
            return html + '</div>';
        },
        input: function (name, el) {
            if (!N.form) { return null; }
            if (name === 'token') { N.form.token = el.value; }
            if (name === 'chat') { N.form.chat = el.value; }
            return null;
        },
        act: function (name, el) {
            var f = N.form, T = h.T();
            if (!f) { return null; }
            if (name === 'enabled') { f.enabled = !f.enabled; return 'main'; }
            if (name === 'kind') { f[el.getAttribute('data-v')] = !f[el.getAttribute('data-v')]; return 'main'; }
            if (name === 'pick') { f.chat = el.getAttribute('data-v'); return 'main'; }
            if (name === 'save') {
                return run('save', function () { return save().then(function () { h.notice('ok', T.ntSaved); }); });
            }
            if (name === 'test') {
                return run('test', function () {
                    return save().then(function () { return h.api('POST', '/api/inversapanel/notify/test', {}); }).then(function (res) {
                        if (!res || res.status !== 'ok') { throw res; }
                        h.notice('ok', T.ntTestSent);
                    });
                });
            }
            if (name === 'find') {
                return run('find', function () {
                    /* the bot is asked with the stored token: store one that was just typed first */
                    var first = f.token.trim() ? save() : Promise.resolve();
                    return first.then(function () { return h.api('POST', '/api/inversapanel/notify/chats', {}); }).then(function (res) {
                        if (!res || res.status !== 'ok') { throw res; }
                        N.chats = res.chats || [];
                        if (N.chats.length === 1 && !f.chat) { f.chat = String(N.chats[0].id); }
                    });
                });
            }
            return null;
        }
    });
})();
