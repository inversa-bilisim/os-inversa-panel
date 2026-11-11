#!/bin/sh
#
# Remove a deploy.sh installation from a test box (development helper).
#
#   tools/remove.sh root@192.168.1.1
#
# Note: the firewall alias "inversapanel_blocked" and the Unbound blocklist policy
# "Inversa Panel (managed)" stay in config.xml; delete them in the OPNsense GUI if wanted.
# Turn Inversa Panel off in its settings and press Apply first, so its firewall rules disappear.

set -eu

TARGET="${1:?usage: $0 root@<opnsense-ip>}"

# root's login shell on OPNsense is csh: run the remote part explicitly with sh
ssh "${TARGET}" /bin/sh -s <<'REMOTE'
set -e
rm -rf /usr/local/opnsense/mvc/app/models/OPNsense/InversaPanel \
       /usr/local/opnsense/mvc/app/controllers/OPNsense/InversaPanel \
       /usr/local/opnsense/mvc/app/views/OPNsense/InversaPanel \
       /usr/local/opnsense/mvc/app/library/OPNsense/InversaPanel \
       /usr/local/opnsense/scripts/OPNsense/InversaPanel \
       /usr/local/opnsense/www/js/inversapanel \
       /usr/local/opnsense/www/css/inversapanel \
       /usr/local/opnsense/www/img/inversapanel \
       /usr/local/opnsense/service/conf/actions.d/actions_inversapanel.conf \
       /usr/local/etc/inc/plugins.inc.d/inversapanel.inc \
       /var/db/inversapanel
rm -f /tmp/opnsense_menu_cache.xml /tmp/opnsense_acl_cache.json
service configd restart > /dev/null
configctl filter reload > /dev/null
echo "removed"
REMOTE
