#!/bin/sh
#
# One-off: move a box that ran the plugin under its old name ("Minnosh", deploy.sh installation)
# to Inversa Panel without losing its settings. Run it once, then run tools/deploy.sh.
#
#   tools/migrate-from-minnosh.sh root@192.168.1.1
#
# What it does on the box:
#   - keeps a copy of the configuration (/conf/config.xml.before-inversapanel)
#   - renames what the plugin wrote into config.xml: the settings node (OPNsense/Minnosh ->
#     OPNsense/InversaPanel), the aliases (minnosh_* -> inversapanel_*), WireGuard names
#     (minnosh-* -> inversapanel-*) and the "Minnosh ..." descriptions it recognises its records by
#   - removes the files of the old installation and its runtime leftovers
# Nothing is reloaded here: deploy.sh installs the new files, then press "Apply" in Inversa Panel
# (or reboot) so aliases, firewall rules and DNS policies are rebuilt under the new names.

set -eu

TARGET="${1:?usage: $0 root@<opnsense-ip>}"

# root's login shell on OPNsense is csh: run the remote part explicitly with sh
ssh "${TARGET}" /bin/sh -s <<'REMOTE'
set -e
CONF=/conf/config.xml
KEEP=/conf/config.xml.before-inversapanel

if ! grep -qi 'minnosh' "${CONF}"; then
    echo "nothing to migrate in ${CONF}"
else
    [ -f "${KEEP}" ] || cp -p "${CONF}" "${KEEP}"
    sed -e 's|<Minnosh\([ >]\)|<InversaPanel\1|g' -e 's|</Minnosh>|</InversaPanel>|g' \
        -e 's|minnosh|inversapanel|g' -e 's|Minnosh|Inversa Panel|g' "${CONF}" > "${CONF}.migrate"
    if ! /usr/local/bin/xmllint --noout "${CONF}.migrate"; then
        rm -f "${CONF}.migrate"
        echo "the rewritten configuration is not valid XML, nothing changed"
        exit 1
    fi
    cat "${CONF}.migrate" > "${CONF}"
    rm -f "${CONF}.migrate" /tmp/config.cache
    echo "configuration migrated (copy of the old one: ${KEEP})"
fi

rm -rf /usr/local/opnsense/mvc/app/models/OPNsense/Minnosh \
       /usr/local/opnsense/mvc/app/controllers/OPNsense/Minnosh \
       /usr/local/opnsense/mvc/app/views/OPNsense/Minnosh \
       /usr/local/opnsense/mvc/app/library/OPNsense/Minnosh \
       /usr/local/opnsense/scripts/OPNsense/Minnosh \
       /usr/local/opnsense/www/js/minnosh \
       /usr/local/opnsense/www/css/minnosh \
       /usr/local/opnsense/www/img/minnosh \
       /usr/local/opnsense/service/conf/actions.d/actions_minnosh.conf \
       /usr/local/etc/inc/plugins.inc.d/minnosh.inc

# runtime leftovers: country data, state files, pf tables of the old aliases
if [ -f /usr/local/share/GeoIP/minnosh-dbip.json ]; then
    mv /usr/local/share/GeoIP/minnosh-dbip.json /usr/local/share/GeoIP/inversapanel-dbip.json
fi
rm -f /tmp/minnosh_* /var/run/minnosh_*
for table in $(/sbin/pfctl -sT 2>/dev/null | grep '^minnosh_' || true); do
    /sbin/pfctl -t "${table}" -T kill > /dev/null 2>&1 || true
done

rm -f /tmp/opnsense_menu_cache.xml /tmp/opnsense_acl_cache.json /var/lib/php/tmp/opnsense_menu_cache.xml /var/lib/php/tmp/opnsense_acl_cache.json
service configd restart > /dev/null
echo "old installation removed; now run tools/deploy.sh and press Apply in Inversa Panel"
REMOTE
