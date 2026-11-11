#!/usr/local/bin/python3

"""
    SPDX-License-Identifier: BSD-2-Clause
    Copyright (C) 2026 Inversa Bilişim

    Quick connectivity check for the "Test connection" button and the network change
    confirmation: default gateway, an internet address, and DNS through the local resolver.
"""

import re
import subprocess
import time
import ujson


def ping(host):
    start = time.time()
    sp = subprocess.run(['/sbin/ping', '-c', '1', '-t', '3', host], capture_output=True, text=True)
    match = re.search(r'time=([0-9.]+) ms', sp.stdout)
    return {'ok': sp.returncode == 0, 'ms': float(match.group(1)) if match else round((time.time() - start) * 1000, 1)}


def gateway():
    sp = subprocess.run(['/sbin/route', '-n', 'get', 'default'], capture_output=True, text=True)
    match = re.search(r'gateway:\s+(\S+)', sp.stdout)
    return match.group(1) if match else None


def dns():
    start = time.time()
    sp = subprocess.run(['/usr/bin/drill', '@127.0.0.1', 'opnsense.org'], capture_output=True, text=True, timeout=10)
    ok = sp.returncode == 0 and 'NOERROR' in sp.stdout and 'ANSWER SECTION' in sp.stdout
    return {'ok': ok, 'ms': round((time.time() - start) * 1000, 1)}


if __name__ == '__main__':
    gw = gateway()
    result = {
        'gateway': dict(ping(gw), address=gw) if gw else {'ok': False, 'address': None},
        'internet': dict(ping('1.1.1.1'), address='1.1.1.1'),
        'dns': dns(),
    }
    result['ok'] = all(item['ok'] for item in (result['gateway'], result['internet'], result['dns']))
    print(ujson.dumps(result))
