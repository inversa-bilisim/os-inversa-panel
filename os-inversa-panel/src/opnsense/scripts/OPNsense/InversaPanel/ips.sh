#!/bin/sh
#
# SPDX-License-Identifier: BSD-2-Clause
# Copyright (C) 2026 Inversa Bilişim
#
# Background half of OPNsense\InversaPanel\Ips: bring Suricata in line with the configuration
# that was just written (template reload OPNsense/IDS has already run).
#
#  - intrusion detection enabled: fetch the selected rulesets, build the rule file, (re)start
#  - disabled: stop
#
# Suricata is only started when enough memory is free. Running out of memory takes the whole
# firewall down (the kernel starts killing everything), a protection that is off does not.
#
# One run at a time; a request arriving meanwhile makes the running one go around once more.
# The start never overlaps a DNS blocklist refresh (dnsbl.sh): both take ${HEAVY}.

LOCK=/tmp/inversapanel_ips.lock
AGAIN=/tmp/inversapanel_ips.again
HEAVY=/tmp/inversapanel_heavy.lock
STATE=/var/run/inversapanel_ips.state
PROMISC=/var/run/inversapanel_ips.promisc
YAML=/usr/local/etc/suricata/suricata.yaml
RC=/usr/local/etc/rc.d/suricata
# Measured with the rulesets Inversa Panel selects (about 41,000 rules): 450 MB with the Hyperscan
# pattern matcher, 3.5 GB with OPNsense's default one. Plus room for the nightly rule reload,
# which builds the new rules next to the old ones.
if grep -q '^mpm-algo: *hs' ${YAML} 2>/dev/null; then
    NEED_MB=1000
else
    NEED_MB=4500
fi

free_mb() {
    pages=0
    for name in v_free_count v_inactive_count v_laundry_count; do
        pages=$((pages + $(/sbin/sysctl -n vm.stats.vm.${name})))
    done
    echo $((pages * $(/sbin/sysctl -n hw.pagesize) / 1048576))
}

# Blocking mode on VLANs puts the network card into promiscuous mode and Suricata leaves it
# that way when it stops: remember the cards that were not promiscuous before, put them back after.
stop_suricata() {
    ${RC} onestop > /dev/null 2>&1
    if [ -f ${PROMISC} ]; then
        for dev in $(cat ${PROMISC}); do
            /sbin/ifconfig "${dev}" -promisc 2> /dev/null
        done
        rm -f ${PROMISC}
    fi
}

note_promisc() {
    grep -q '^suricata_netmap="YES"' /etc/rc.conf.d/suricata 2>/dev/null || return
    grep -q 'disable-promisc: no' ${YAML} 2>/dev/null || return
    for dev in $(awk '/^ - interface: /{print $3}' ${YAML} | grep -v -e '^default$' -e '\^$'); do
        /sbin/ifconfig "${dev}" 2>/dev/null | head -1 | grep -q PPROMISC || echo "${dev}" >> ${PROMISC}
    done
}

if [ "${1}" = "work" ]; then
    /usr/local/opnsense/scripts/suricata/rule-updater.py
    /usr/local/opnsense/scripts/suricata/installRules.py
    # stop first: what the running one holds counts as free for the new one
    stop_suricata
    FREE=$(free_mb)
    if [ "${FREE}" -lt "${NEED_MB}" ]; then
        echo "nomem ${FREE} ${NEED_MB}" > ${STATE}
        /usr/bin/logger -t inversapanel "attack protection not started: ${FREE} MB memory free, ${NEED_MB} MB needed"
        exit 1
    fi
    note_promisc
    ${RC} start > /dev/null 2>&1
    # loading the rules is where the memory goes: hold the lock until that has settled
    sleep 20
    rm -f ${STATE}
    exit 0
fi

if [ "${1}" != "locked" ]; then
    touch ${AGAIN}
    exec /usr/bin/lockf -s -t 0 ${LOCK} /bin/sh "${0}" locked
fi

while [ -f ${AGAIN} ]; do
    rm -f ${AGAIN}
    if grep -q '^suricata_enable="YES"' /etc/rc.conf.d/suricata 2>/dev/null; then
        echo "preparing" > ${STATE}
        # wait for the other heavy job (at most 15 minutes, then go ahead anyway)
        /usr/bin/lockf -k -t 900 ${HEAVY} /bin/sh "${0}" work
        [ $? -eq 75 ] && /bin/sh "${0}" work
    else
        stop_suricata
        rm -f ${STATE}
    fi
done
