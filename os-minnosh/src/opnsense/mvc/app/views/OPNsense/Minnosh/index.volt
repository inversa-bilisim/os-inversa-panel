{#
 # SPDX-License-Identifier: BSD-2-Clause
 # Copyright (C) 2026 Inversa Bilişim
 #
 # Single page UI. All rendering happens in /ui/js/minnosh/app.js, translations live in
 # /ui/js/minnosh/i18n/<lang>.js (add a file there + a script tag below to add a language,
 # and its path to IndexController::ASSETS so browsers pick up changes).
 #}
<link rel="stylesheet" href="/ui/css/minnosh/minnosh.css?v={{ minnosh_version }}">
<script src="/ui/js/minnosh/i18n/tr.js?v={{ minnosh_version }}"></script>
<script src="/ui/js/minnosh/i18n/en.js?v={{ minnosh_version }}"></script>
<script src="/ui/js/minnosh/app.js?v={{ minnosh_version }}"></script>
<script src="/ui/js/minnosh/views/net.js?v={{ minnosh_version }}"></script>
<script src="/ui/js/minnosh/views/sched.js?v={{ minnosh_version }}"></script>
<script src="/ui/js/minnosh/views/pf.js?v={{ minnosh_version }}"></script>
<script src="/ui/js/minnosh/views/vpn.js?v={{ minnosh_version }}"></script>
<script src="/ui/js/minnosh/views/guest.js?v={{ minnosh_version }}"></script>
<script src="/ui/js/minnosh/views/geo.js?v={{ minnosh_version }}"></script>
<!-- QR codes for VPN devices: the same library OPNsense's own WireGuard page uses -->
<script src="{{ cache_safe('/ui/js/qrcode.js') }}"></script>
<script src="{{ cache_safe('/ui/js/qrcode_UTF8.js') }}"></script>

<div id="minnosh-app" class="minnosh" data-langcode="{{ langcode|e }}">
    <div class="k-loading">Minnosh…</div>
</div>

<script>
    $(function () {
        MinnoshApp.start(document.getElementById('minnosh-app'));
    });
</script>
