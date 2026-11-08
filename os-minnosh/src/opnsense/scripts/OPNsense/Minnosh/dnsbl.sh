#!/bin/sh
#
# SPDX-License-Identifier: BSD-2-Clause
# Copyright (C) 2026 Inversa Bilişim
#
# Refresh Unbound blocklists exactly like "configctl unbound dnsbl" does, then make sure
# the new list is active before dropping cached answers.
#
# Why the waiting: Unbound answers cached names without asking the dnsbl module, and the
# module re-reads /var/unbound/data/dnsbl.json at most once a minute per worker thread.
# Flushing right away would let a not-yet-reloaded worker cache a newly blocked name again.

UNBOUNDCTL="/usr/local/sbin/unbound-control -c /var/unbound/unbound.conf"

/usr/local/opnsense/scripts/unbound/blocklists.py update
if [ -f /var/unbound/data/dnsbl_format_warning ]; then
    /usr/local/sbin/pluginctl -c unbound_start
fi

# let every worker pass its 60 second reload window, then poke them with uncached names
sleep 65
for i in 1 2 3 4 5 6 7 8 9 10 11 12; do
    timeout 30 /usr/bin/drill @127.0.0.1 "minnosh-reload-${i}-$$.invalid" > /dev/null 2>&1 &
done
wait

${UNBOUNDCTL} flush_zone . > /dev/null 2>&1 || true
