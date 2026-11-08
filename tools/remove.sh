#!/bin/sh
#
# Remove a deploy.sh installation from a test box (development helper).
#
#   tools/remove.sh root@192.168.1.1
#
# Note: the firewall alias "minnosh_blocked" and the Unbound blocklist policy
# "Minnosh (managed)" stay in config.xml; delete them in the OPNsense GUI if wanted.
# Turn Minnosh off in its settings and press Apply first, so its firewall rules disappear.

set -eu

TARGET="${1:?usage: $0 root@<opnsense-ip>}"

ssh "${TARGET}" '
set -e
rm -rf /usr/local/opnsense/mvc/app/models/OPNsense/Minnosh \
       /usr/local/opnsense/mvc/app/controllers/OPNsense/Minnosh \
       /usr/local/opnsense/mvc/app/views/OPNsense/Minnosh \
       /usr/local/opnsense/mvc/app/library/OPNsense/Minnosh \
       /usr/local/opnsense/scripts/OPNsense/Minnosh \
       /usr/local/opnsense/www/js/minnosh \
       /usr/local/opnsense/www/css/minnosh \
       /usr/local/opnsense/service/conf/actions.d/actions_minnosh.conf \
       /usr/local/etc/inc/plugins.inc.d/minnosh.inc
rm -f /tmp/opnsense_menu_cache.xml /tmp/opnsense_acl_cache.json
service configd restart > /dev/null
configctl filter reload > /dev/null
echo "removed"
'
