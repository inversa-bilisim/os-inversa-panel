#!/usr/local/bin/python3

"""
    SPDX-License-Identifier: BSD-2-Clause
    Copyright (C) 2026 Inversa Bilişim

    List hosts seen on the network for the Minnosh device page.

    Sources (all best effort, any of them may be missing):
      - OPNsense host discovery / arp+ndp via list_hosts.py (mac, ip, interface, vendor, first/last seen)
      - DHCP leases from dnsmasq and Kea (hostnames)
      - pf state table (active connection count per address)

    Output: {"hosts": [{mac, ips, interface, vendor, hostname, first_seen, last_seen, states}], "source": ...}
"""

import os
import re
import subprocess
import ujson

STATE_ADDR = re.compile(r'(\d{1,3}(?:\.\d{1,3}){3}):\d+|([0-9a-fA-F:]*:[0-9a-fA-F:]+)\[\d+\]')

LIST_HOSTS = '/usr/local/opnsense/scripts/interfaces/list_hosts.py'
DNSMASQ_LEASES = '/usr/local/opnsense/scripts/dnsmasq/get_dnsmasq_leases.py'
KEA_LEASES = '/usr/local/opnsense/scripts/kea/get_kea_leases.py'


def run_json(cmd):
    try:
        sp = subprocess.run(cmd, capture_output=True, text=True, timeout=20)
        return ujson.loads(sp.stdout)
    except (ValueError, OSError, subprocess.SubprocessError):
        return None


def lease_hostnames():
    """ mac -> hostname from whichever DHCP server is in use """
    result = {}
    for script in (DNSMASQ_LEASES, KEA_LEASES):
        if not os.path.isfile(script):
            continue
        payload = run_json([script])
        if not isinstance(payload, dict):
            continue
        for record in payload.get('records', payload.get('rows', [])):
            if not isinstance(record, dict):
                continue
            mac = (record.get('hwaddr') or record.get('mac') or '').lower()
            hostname = record.get('hostname') or ''
            if mac and hostname and hostname != '*':
                result[mac] = hostname.rstrip('.')
    return result


def state_counts():
    """ address -> number of pf states (cheap indicator of activity) """
    counts = {}
    try:
        sp = subprocess.run(['/sbin/pfctl', '-ss'], capture_output=True, text=True, timeout=20)
    except (OSError, subprocess.SubprocessError):
        return counts
    for line in sp.stdout.split('\n'):
        # e.g. "all tcp 192.168.1.20:51234 -> 1.1.1.1:443  ESTABLISHED:ESTABLISHED"
        #      "all tcp 85.1.2.3:4321 (192.168.1.20:51234) -> 1.1.1.1:443 ..." (nat)
        #      "all udp fe80::1[546] <- fe80::2[547] ..." (ipv6)
        seen = set()
        for v4, v6 in STATE_ADDR.findall(line):
            seen.add(v4 or v6)
        for addr in seen:
            counts[addr] = counts.get(addr, 0) + 1
    return counts


def own_macs():
    """ MAC addresses of the firewall's own interfaces, these are not "devices" """
    result = set()
    try:
        sp = subprocess.run(['/sbin/ifconfig'], capture_output=True, text=True, timeout=20)
    except (OSError, subprocess.SubprocessError):
        return result
    for line in sp.stdout.split('\n'):
        parts = line.split()
        if len(parts) > 1 and parts[0] == 'ether':
            result.add(parts[1].lower())
    return result


if __name__ == '__main__':
    hosts = {}
    skip = own_macs()
    payload = run_json([LIST_HOSTS, '-v', '-n']) if os.path.isfile(LIST_HOSTS) else None
    source = payload.get('source') if isinstance(payload, dict) else None
    for row in (payload or {}).get('rows', []):
        # [ifname, ether, ip_address, vendor, first_seen, last_seen]
        if len(row) < 3 or not row[1]:
            continue
        mac = row[1].lower()
        if mac in skip:
            continue
        host = hosts.setdefault(mac, {
            'mac': mac,
            'ips': [],
            'interface': row[0],
            'vendor': row[3] if len(row) > 3 else '',
            'first_seen': row[4] if len(row) > 4 else '',
            'last_seen': row[5] if len(row) > 5 else '',
            'hostname': '',
            'states': 0
        })
        if row[2] not in host['ips']:
            host['ips'].append(row[2])

    names = lease_hostnames()
    states = state_counts()
    for mac, host in hosts.items():
        host['hostname'] = names.get(mac, '')
        host['states'] = sum(states.get(ip, 0) for ip in host['ips'])
        # ipv4 first, it is what people recognise
        host['ips'].sort(key=lambda ip: (':' in ip, ip))

    print(ujson.dumps({'source': source, 'hosts': list(hosts.values())}))
