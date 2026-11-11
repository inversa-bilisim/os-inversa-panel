#!/usr/local/bin/python3

"""
    SPDX-License-Identifier: BSD-2-Clause
    Copyright (C) 2026 Inversa Bilişim

    The address the internet sees this firewall under. Behind a modem that is not the address of
    the WAN port, and only something outside can tell: Cloudflare's trace page (the same 1.1.1.1
    the connection test pings). Only run when the button on the page is pressed.

    output: {"ip": "203.0.113.7"} or {"ip": ""}
"""

import ipaddress
import ssl
import ujson
import urllib.request

ip = ''
try:
    req = urllib.request.Request('https://1.1.1.1/cdn-cgi/trace', headers={'User-Agent': 'OPNsense-InversaPanel'})
    with urllib.request.urlopen(req, timeout=6, context=ssl.create_default_context()) as resp:
        for line in resp.read(4096).decode('ascii', 'replace').splitlines():
            if line.startswith('ip='):
                ip = str(ipaddress.ip_address(line[3:].strip()))
except Exception:
    ip = ''
print(ujson.dumps({'ip': ip}))
