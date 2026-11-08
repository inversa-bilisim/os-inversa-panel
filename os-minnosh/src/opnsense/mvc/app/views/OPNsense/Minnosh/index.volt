{#
 # SPDX-License-Identifier: BSD-2-Clause
 # Copyright (C) 2026 Inversa Bilişim
 #
 # Single page UI. All rendering happens in /ui/js/minnosh/app.js, translations live in
 # /ui/js/minnosh/i18n/<lang>.js (add a file there + a script tag below to add a language).
 #}
<link rel="stylesheet" href="{{ cache_safe('/ui/css/minnosh/minnosh.css') }}">
<script src="{{ cache_safe('/ui/js/minnosh/i18n/tr.js') }}"></script>
<script src="{{ cache_safe('/ui/js/minnosh/i18n/en.js') }}"></script>
<script src="{{ cache_safe('/ui/js/minnosh/app.js') }}"></script>

<div id="minnosh-app" class="minnosh" data-langcode="{{ langcode|e }}">
    <div class="k-loading">Minnosh…</div>
</div>

<script>
    $(function () {
        MinnoshApp.start(document.getElementById('minnosh-app'));
    });
</script>
