#!/bin/sh

# SPDX-License-Identifier: BSD-2-Clause
# Copyright (C) 2026 Inversa Bilişim
#
# Wake-on-LAN: sends the "magic packet" for a device on each of the given ports.
#   wake.sh <port,port,...> <mac>

MAC=$(echo "$2" | /usr/bin/grep -E '^([0-9a-f]{2}:){5}[0-9a-f]{2}$') || exit 1
SENT=0
for PORT in $(echo "$1" | /usr/bin/tr ',' ' '); do
    case "${PORT}" in
        *[!A-Za-z0-9_.]*) continue ;;
    esac
    /usr/sbin/wake "${PORT}" "${MAC}" > /dev/null 2>&1 && SENT=$((SENT + 1))
done
echo "${SENT}"
