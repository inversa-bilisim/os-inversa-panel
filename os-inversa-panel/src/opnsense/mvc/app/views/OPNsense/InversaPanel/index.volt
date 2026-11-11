{#
 # SPDX-License-Identifier: BSD-2-Clause
 # Copyright (C) 2026 Inversa Bilişim
 #
 # Single page UI. All rendering happens in /ui/js/inversapanel/app.js, translations live in
 # /ui/js/inversapanel/i18n/<lang>.js (add a file there + a script tag below to add a language,
 # and its path to IndexController::ASSETS so browsers pick up changes).
 #}
<link rel="stylesheet" href="/ui/css/inversapanel/inversapanel.css?v={{ inversapanel_version }}">
<script src="/ui/js/inversapanel/i18n/tr.js?v={{ inversapanel_version }}"></script>
<script src="/ui/js/inversapanel/i18n/en.js?v={{ inversapanel_version }}"></script>
<script src="/ui/js/inversapanel/app.js?v={{ inversapanel_version }}"></script>
<script src="/ui/js/inversapanel/views/net.js?v={{ inversapanel_version }}"></script>
<script src="/ui/js/inversapanel/views/sched.js?v={{ inversapanel_version }}"></script>
<script src="/ui/js/inversapanel/views/pf.js?v={{ inversapanel_version }}"></script>
<script src="/ui/js/inversapanel/views/vpn.js?v={{ inversapanel_version }}"></script>
<script src="/ui/js/inversapanel/views/guest.js?v={{ inversapanel_version }}"></script>
<script src="/ui/js/inversapanel/views/geo.js?v={{ inversapanel_version }}"></script>
<!-- QR codes for VPN devices: the same library OPNsense's own WireGuard page uses -->
<script src="{{ cache_safe('/ui/js/qrcode.js') }}"></script>
<script src="{{ cache_safe('/ui/js/qrcode_UTF8.js') }}"></script>

<div id="inversapanel-app" class="inversapanel" data-langcode="{{ langcode|e }}">
    <div class="k-loading">Inversa Panel…</div>
</div>

<script>
    $(function () {
        InversaPanelApp.start(document.getElementById('inversapanel-app'));
    });
</script>
