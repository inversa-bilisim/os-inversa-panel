#!/usr/local/bin/python3

"""
    SPDX-License-Identifier: BSD-2-Clause
    Copyright (C) 2026 Inversa Bilişim

    List hosts seen on the network for the Inversa Panel device page.

    Sources (all best effort, any of them may be missing):
      - OPNsense host discovery / arp+ndp via list_hosts.py (mac, ip, interface, vendor, first/last seen)
      - DHCP leases from dnsmasq and Kea (hostnames, the address a device holds right now)
      - pf state table (active connection count per address)

    A device deleted on the Devices page (FORGOTTEN: mac => epoch) is left out until it is seen again
    after that; it then counts as first seen at that moment.

    Host discovery remembers every address a device ever used. Only the current ones are reported, the
    address in use first: a device that moved to another address (new fixed IP, new lease) must not keep
    showing the old one.

    usage: hosts.py [<ifname>,<ifname>...]

    Devices on the given interfaces are asked whether they are still there (a unicast ARP request to every
    IPv4 address they are known by, at most once per PROBE_EVERY seconds). An idle device sends nothing by
    itself, so without asking it would look offline; and a device that left stays in the arp table for up
    to 20 minutes, so without asking it would look online. Nothing is sent when no interface is given.

    Output: {"hosts": [{mac, ips, interface, vendor, hostname, first_seen, last_seen, states, in_arp,
                        dhcp, probe, alive}], "source": ...}
      dhcp:  the address in use was handed out by DHCP (false: the device configured it itself)
      probe: the device is being asked, "alive" (epoch of its last answer, 0 = never) decides if it is online
"""

import ctypes
import fcntl
import os
import re
import select
import socket
import struct
import subprocess
import sys
import time
from datetime import datetime, timedelta, timezone
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


# asking devices if they are there
PROBE_STATE = '/var/run/inversapanel_hosts_probe.json'
PROBE_EVERY = 25                    # seconds between two rounds (the UI asks for the list every 30 seconds)
PROBE_FRESH = 120                   # an answer this recent means: this is the address in use
PROBE_KNOWN = timedelta(days=30)    # devices not seen for longer are left alone
PROBE_PER_HOST = 4
PROBE_LIMIT = 512
PROBE_WAITS = (0.4, 0.6)            # ask, wait, ask the silent ones again, wait (Wi-Fi power save answers late)

# FreeBSD bpf(4) on LP64
BIOCSETIF = 0x8020426c
BIOCIMMEDIATE = 0x80044270
BIOCGBLEN = 0x40044266
BIOCSETF = 0x80104267
BIOCSDIRECTION = 0x80044277
# ethertype arp, opcode reply -> pass, else drop
ARP_REPLY_FILTER = ((0x28, 0, 0, 12), (0x15, 0, 3, 0x0806), (0x28, 0, 0, 20), (0x15, 0, 1, 2), (0x06, 0, 0, 64), (0x06, 0, 0, 0))

# an IPv6 address not seen for this long after the device was last seen is history (privacy addresses rotate)
V6_KEEP = timedelta(hours=24)


def leases():
    """ (mac -> hostname, mac -> [(interface, ipv4 address)] of active leases) from whichever DHCP server is in use """
    names = {}
    addresses = {}
    now = time.time()
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
            if not mac:
                continue
            hostname = record.get('hostname') or ''
            if hostname and hostname != '*':
                names[mac] = hostname.rstrip('.')
            address = record.get('address') or ''
            try:
                expire = int(record.get('expire') or 0)
            except (TypeError, ValueError):
                expire = 0
            # expire 0 = infinite lease (dnsmasq), state 0 = in use (kea, absent for dnsmasq)
            if address and ':' not in address and not record.get('state') and (expire == 0 or expire > now):
                addresses.setdefault(mac, []).append((record.get('if') or '', address))
    return names, addresses


FORGOTTEN = '/var/db/inversapanel/forgotten.json'


def forgotten():
    try:
        with open(FORGOTTEN) as f:
            data = ujson.load(f)
        return {k.lower(): datetime.fromtimestamp(int(v), timezone.utc).replace(tzinfo=None) for k, v in data.items()} if isinstance(data, dict) else {}
    except (OSError, ValueError, TypeError):
        return {}


def parse_ts(value):
    try:
        return datetime.strptime(value, '%Y-%m-%dT%H:%M:%SZ')
    except (TypeError, ValueError):
        return None


def lease_ips(host, leased):
    return [addr for ifname, addr in leased if ifname in ('', host['interface'])]


def current_ips(host, leased, in_arp, answered=None):
    """
        addresses the device uses now, the one to show first.
        IPv4: just answered on it > on the wire now (arp) > active DHCP lease > most recently seen; further
        IPv4 addresses only count while they are in the arp table, anything else is an address the device
        had before.
        IPv6: most recently seen first, without the ones that were not seen for a long time.
    """
    seen = host['seen']
    leases4 = lease_ips(host, leased)
    v4 = [ip for ip in seen if ':' not in ip]
    # the lease is newer than what host discovery saw
    v4 += [ip for ip in leases4 if ip not in v4]
    if answered and answered not in v4:
        v4.append(answered)
    v4.sort(key=lambda ip: (ip == answered, ip in in_arp, ip in leases4, seen.get(ip, '')), reverse=True)
    v4 = v4[:1] + [ip for ip in v4[1:] if ip in in_arp]

    v6 = sorted([ip for ip in seen if ':' in ip], key=lambda ip: seen[ip], reverse=True)
    newest = parse_ts(host['last_seen'])
    if newest is not None:
        v6 = [ip for ip in v6 if parse_ts(seen[ip]) is None or newest - parse_ts(seen[ip]) <= V6_KEEP]
    return v4 + v6


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


def arp_present():
    """ addresses with a complete entry in the arp table right now (host discovery may report an old last_seen) """
    result = set()
    payload = run_json(['/usr/sbin/arp', '-an', '--libxo', 'json'])
    try:
        for row in payload['arp']['arp-cache']:
            if row.get('mac-address') and row.get('ip-address'):
                result.add(row['ip-address'])
    except (KeyError, TypeError):
        pass
    return result


def interfaces():
    """ the firewall's own interfaces: name -> {mac, inet: [(address, netmask)] as integers} """
    result = {}
    current = None
    try:
        sp = subprocess.run(['/sbin/ifconfig'], capture_output=True, text=True, timeout=20)
    except (OSError, subprocess.SubprocessError):
        return result
    for line in sp.stdout.split('\n'):
        parts = line.split()
        if line and not line[0].isspace() and parts and parts[0].endswith(':'):
            current = result.setdefault(parts[0][:-1], {'mac': '', 'inet': []})
        elif current is None or len(parts) < 2:
            continue
        elif parts[0] == 'ether':
            current['mac'] = parts[1].lower()
        elif parts[0] == 'inet' and len(parts) > 3 and parts[2] == 'netmask':
            try:
                current['inet'].append((ip_int(parts[1]), int(parts[3], 16)))
            except (ValueError, OSError):
                pass
    return result


def ip_int(address):
    return struct.unpack('!I', socket.inet_aton(address))[0]


def mac_bytes(mac):
    return bytes(int(part, 16) for part in mac.split(':'))


def bpf_open(ifname):
    """ a bpf descriptor on the interface that only sees incoming arp replies: (fd, read buffer size) """
    fd = os.open('/dev/bpf', os.O_RDWR)
    try:
        fcntl.ioctl(fd, BIOCSETIF, struct.pack('16s16x', ifname.encode()))
        fcntl.ioctl(fd, BIOCIMMEDIATE, struct.pack('I', 1))
        fcntl.ioctl(fd, BIOCSDIRECTION, struct.pack('I', 0))
        program = ctypes.create_string_buffer(b''.join(struct.pack('HBBI', *insn) for insn in ARP_REPLY_FILTER))
        fcntl.ioctl(fd, BIOCSETF, struct.pack('@IP', len(ARP_REPLY_FILTER), ctypes.addressof(program)))
        size = struct.unpack('I', fcntl.ioctl(fd, BIOCGBLEN, struct.pack('I', 0)))[0]
    except (OSError, ValueError):
        os.close(fd)
        raise
    return fd, size


def bpf_frames(data):
    """ the frames in what one read() returned: each is a struct bpf_hdr followed by the (word aligned) frame """
    pos = 0
    while pos + 26 <= len(data):
        caplen, _, hdrlen = struct.unpack_from('IIH', data, pos + 16)
        if hdrlen == 0:
            break
        yield data[pos + hdrlen:pos + hdrlen + caplen]
        pos += (hdrlen + caplen + 7) & ~7


def arp_probe(targets, ifaces):
    """
        targets: {ifname: set((ip, mac))}. Ask every address, directly at the hardware address it is known
        by (no broadcast: nobody else is disturbed), and listen for the answers.
        returns (asked, answered): the (ip, mac) pairs a request went out for / an answer came back from
    """
    asked = set()
    answered = set()
    listeners = {}
    try:
        for ifname, pairs in targets.items():
            info = ifaces.get(ifname)
            if not info or not info['mac'] or not info['inet']:
                continue
            requests = {}
            for ip, mac in pairs:
                try:
                    target = ip_int(ip)
                    # our address in the same network is the one that asks
                    source = [addr for addr, mask in info['inet'] if addr & mask == target & mask and addr != target]
                    if source:
                        requests[(ip, mac)] = mac_bytes(mac) + mac_bytes(info['mac']) + b'\x08\x06' + struct.pack(
                            '!HHBBH', 1, 0x0800, 6, 4, 1
                        ) + mac_bytes(info['mac']) + struct.pack('!I', source[0]) + bytes(6) + struct.pack('!I', target)
                except (ValueError, OSError):
                    continue
            if not requests:
                continue
            try:
                fd, size = bpf_open(ifname)
            except (OSError, ValueError):
                continue
            listeners[fd] = (size, requests)

        for wait in PROBE_WAITS:
            for fd, (size, requests) in listeners.items():
                for pair, frame in requests.items():
                    try:
                        os.write(fd, frame)
                        asked.add(pair)
                    except OSError:
                        pass
            deadline = time.monotonic() + wait
            while any(requests for _, requests in listeners.values()):
                left = deadline - time.monotonic()
                if left <= 0:
                    break
                for fd in select.select(list(listeners), [], [], left)[0]:
                    size, requests = listeners[fd]
                    for frame in bpf_frames(os.read(fd, size)):
                        if len(frame) < 42:
                            continue
                        pair = (socket.inet_ntoa(frame[28:32]), ':'.join('%02x' % octet for octet in frame[22:28]))
                        # an answer from another hardware address: the address belongs to someone else now
                        if pair in requests:
                            answered.add(pair)
                            # it is there: no need to wait for its other (older) addresses
                            for other in [key for key in requests if key[1] == pair[1]]:
                                del requests[other]
            if not any(requests for _, requests in listeners.values()):
                break
    except (OSError, ValueError):
        pass
    finally:
        for fd in listeners:
            os.close(fd)
    return asked, answered


def probe_hosts(hosts, leased, probe_ifs, ifaces):
    """
        who is there: mac -> {ts: epoch of the last answer, ip: the address that answered} for the devices
        that are being asked, a new round when the last one is older than PROBE_EVERY.
    """
    now = int(time.time())
    try:
        with open(PROBE_STATE) as handle:
            state = ujson.load(handle)
        if not isinstance(state.get('hosts'), dict):
            raise ValueError
    except (OSError, ValueError, AttributeError):
        state = {'run': 0, 'hosts': {}}

    if not 0 <= now - int(state.get('run') or 0) < PROBE_EVERY:
        targets = {}
        count = 0
        newest = datetime.now(timezone.utc).replace(tzinfo=None) - PROBE_KNOWN
        for mac, host in hosts.items():
            when = parse_ts(host['last_seen'])
            if host['interface'] not in probe_ifs or (when is not None and when < newest):
                continue
            # the address that answered last time, the lease, then what was seen most recently
            last = (state['hosts'].get(mac) or {}).get('ip')
            ips = ([last] if last else []) + lease_ips(host, leased.get(mac, []))
            ips += sorted([ip for ip in host['seen'] if ':' not in ip], key=lambda ip: host['seen'][ip], reverse=True)
            for ip in list(dict.fromkeys(ips))[:PROBE_PER_HOST]:
                if count < PROBE_LIMIT:
                    targets.setdefault(host['interface'], set()).add((ip, mac))
                    count += 1
        asked, answered = arp_probe(targets, ifaces)
        known = {}
        for mac in set(mac for _, mac in asked):
            # keep the last answer of a device that is silent now: it tells when it was last there
            known[mac] = state['hosts'].get(mac) if isinstance(state['hosts'].get(mac), dict) else {'ts': 0, 'ip': ''}
        for ip, mac in answered:
            if known[mac].get('ts') != now or ip in lease_ips(hosts[mac], leased.get(mac, [])):
                known[mac] = {'ts': now, 'ip': ip}
        state = {'run': now, 'hosts': known}
        try:
            with open(PROBE_STATE + '.tmp', 'w') as handle:
                ujson.dump(state, handle)
            os.replace(PROBE_STATE + '.tmp', PROBE_STATE)
        except OSError:
            pass
    return state['hosts']


if __name__ == '__main__':
    hosts = {}
    ifaces = interfaces()
    # MAC addresses of the firewall's own interfaces, these are not "devices"
    skip = set(info['mac'] for info in ifaces.values() if info['mac'])
    probe_ifs = set(name for name in (sys.argv[1].split(',') if len(sys.argv) > 1 else []) if name in ifaces)
    payload = run_json([LIST_HOSTS, '-v', '-n']) if os.path.isfile(LIST_HOSTS) else None
    source = payload.get('source') if isinstance(payload, dict) else None
    for row in (payload or {}).get('rows', []):
        # [ifname, ether, ip_address, vendor, first_seen, last_seen], one row per address
        if len(row) < 3 or not row[1] or not row[2]:
            continue
        mac = row[1].lower()
        if mac in skip:
            continue
        first_seen = (row[4] if len(row) > 4 else '') or ''
        last_seen = (row[5] if len(row) > 5 else '') or ''
        host = hosts.setdefault(mac, {
            'mac': mac,
            'ips': [],
            'interface': row[0],
            'vendor': row[3] if len(row) > 3 else '',
            'first_seen': first_seen,
            'last_seen': last_seen,
            'hostname': '',
            'states': 0,
            'seen': {}
        })
        host['seen'][row[2]] = max(host['seen'].get(row[2], ''), last_seen)
        # the device as a whole: first seen with its oldest address, last seen (and where) with its newest
        if first_seen and (not host['first_seen'] or first_seen < host['first_seen']):
            host['first_seen'] = first_seen
        if last_seen > host['last_seen']:
            host['last_seen'] = last_seen
            host['interface'] = row[0]

    names, leased = leases()
    states = state_counts()
    in_arp = arp_present()
    probed = probe_hosts(hosts, leased, probe_ifs, ifaces) if probe_ifs else {}
    now = time.time()
    for mac, host in hosts.items():
        answer = probed.get(mac) if host['interface'] in probe_ifs else None
        host['probe'] = answer is not None
        host['alive'] = int(answer.get('ts') or 0) if answer else 0
        if host['alive']:
            # the device said so itself, host discovery may not have noticed (yet)
            host['last_seen'] = max(host['last_seen'], time.strftime('%Y-%m-%dT%H:%M:%SZ', time.gmtime(host['alive'])))
        host['hostname'] = names.get(mac, '')
        host['ips'] = current_ips(
            host, leased.get(mac, []), in_arp, answer.get('ip') if answer and now - host['alive'] < PROBE_FRESH else None
        )
        host['dhcp'] = bool(host['ips']) and host['ips'][0] in lease_ips(host, leased.get(mac, []))
        del host['seen']
        host['states'] = sum(states.get(ip, 0) for ip in host['ips'])
        host['in_arp'] = any(ip in in_arp for ip in host['ips'])

    gone = forgotten()
    for mac, when in gone.items():
        host = hosts.get(mac)
        if host is None:
            continue
        seen = parse_ts(host['last_seen'])
        if seen is None or seen <= when:
            del hosts[mac]
        else:
            # back after it was deleted: a new device from that moment on
            first = parse_ts(host['first_seen'])
            if first is None or first < when:
                host['first_seen'] = when.strftime('%Y-%m-%dT%H:%M:%SZ')

    print(ujson.dumps({'source': source, 'hosts': list(hosts.values())}))
