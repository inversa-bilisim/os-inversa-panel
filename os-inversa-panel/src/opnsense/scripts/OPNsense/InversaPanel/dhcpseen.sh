#!/bin/sh
#
# SPDX-License-Identifier: BSD-2-Clause
# Copyright (C) 2026 Inversa Bilişim
#
# dnsmasq lease script (Settings › Device identity watch, see library Identity.php): notes how a
# device asked for an address. Only one line is written, dnsmasq is never held up; watch.php reads
# the lines every 15 seconds. Arguments: add|old|del <mac> <ip> [<hostname>]
#
case "$1" in add|old) ;; *) exit 0 ;; esac
[ -n "${DNSMASQ_REQUESTED_OPTIONS}${DNSMASQ_VENDOR_CLASS}" ] || exit 0
DIR=/var/db/inversapanel
[ -d "${DIR}" ] || exit 0
# a spool that is not read (watch stopped) stays small
[ "$(stat -f %z "${DIR}/dhcpseen.tsv" 2>/dev/null || echo 0)" -lt 1048576 ] || exit 0
clean() { printf '%s' "$1" | tr -d '\t\r\n' | cut -c1-200; }
printf '%s\t%s\t%s\t%s\t%s\t%s\n' "$(date +%s)" "$(clean "$2")" "$(clean "$3")" "$(clean "${DNSMASQ_SUPPLIED_HOSTNAME}")" \
    "$(clean "${DNSMASQ_VENDOR_CLASS}")" "$(clean "${DNSMASQ_REQUESTED_OPTIONS}")" >> "${DIR}/dhcpseen.tsv"
exit 0
