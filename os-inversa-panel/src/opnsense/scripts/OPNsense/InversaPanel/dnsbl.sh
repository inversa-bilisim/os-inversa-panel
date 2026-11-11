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
#
# Only one refresh may run at a time: a single run holds the parsed lists in memory
# (about a gigabyte with the larger lists), overlapping runs exhausted a 4 GB firewall.
# A request arriving while a run is busy is remembered and handled by that run once more.

LOCK=/tmp/inversapanel_dnsbl.lock
AGAIN=/tmp/inversapanel_dnsbl.again
UNBOUNDCTL="/usr/local/sbin/unbound-control -c /var/unbound/unbound.conf"

if [ "${1}" != "locked" ]; then
    touch ${AGAIN}
    # -t 0: do not wait; when another run holds the lock it will see ${AGAIN} and repeat
    exec /usr/bin/lockf -s -t 0 ${LOCK} /bin/sh "${0}" locked
fi

# the whole cycle repeats when a request came in meanwhile (also during the wait below)
while [ -f ${AGAIN} ]; do
    rm -f ${AGAIN}
    /usr/local/opnsense/scripts/unbound/blocklists.py update
    if [ -f /var/unbound/data/dnsbl_format_warning ]; then
        /usr/local/sbin/pluginctl -c unbound_start
    fi

    # let every worker pass its 60 second reload window, then poke them with uncached names
    sleep 65
    for i in 1 2 3 4 5 6 7 8 9 10 11 12; do
        timeout 30 /usr/bin/drill @127.0.0.1 "inversapanel-reload-${i}-$$.invalid" > /dev/null 2>&1 &
    done
    wait

    ${UNBOUNDCTL} flush_zone . > /dev/null 2>&1 || true
done
