#!/bin/sh
#
# Copy the plugin sources onto a (test) OPNsense box and reload what is needed.
#
#   tools/deploy.sh root@192.168.1.1
#
# src/opnsense/* -> /usr/local/opnsense/*, src/etc/* -> /usr/local/etc/*
# PHP files are syntax checked on the box (php is available there).

set -eu

TARGET="${1:?usage: $0 root@<opnsense-ip>}"
SRC="$(cd "$(dirname "$0")/../os-inversa-panel/src" && pwd)"

echo ">> copying files to ${TARGET}"
tar -C "${SRC}" -cf - . | ssh "${TARGET}" 'tar -C /usr/local -xf -'

echo ">> checking and reloading on ${TARGET}"
# root's login shell on OPNsense is csh: run the remote part explicitly with sh
ssh "${TARGET}" /bin/sh -s <<'REMOTE'
set -e
chmod 0755 /usr/local/opnsense/scripts/OPNsense/InversaPanel/*.py /usr/local/opnsense/scripts/OPNsense/InversaPanel/*.sh /usr/local/opnsense/scripts/OPNsense/InversaPanel/*.php
for f in $(find /usr/local/opnsense/mvc/app -path "*InversaPanel*" -name "*.php") /usr/local/opnsense/scripts/OPNsense/InversaPanel/*.php /usr/local/etc/inc/plugins.inc.d/inversapanel.inc; do
    php -l "$f" > /dev/null || { echo "syntax error in $f"; exit 1; }
done
# menu / ACL caches are rebuilt on next page load
rm -f /tmp/opnsense_menu_cache.xml /tmp/opnsense_acl_cache.json
# configd must re-read actions_inversapanel.conf
service configd restart > /dev/null
# pick up inversapanel_cron() (schedules run every minute)
configctl cron restart > /dev/null
echo "ok: open https://<firewall>/ui/inversapanel"
REMOTE
