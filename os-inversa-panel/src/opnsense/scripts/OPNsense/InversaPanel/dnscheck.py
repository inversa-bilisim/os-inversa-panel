#!/usr/local/bin/python3

"""
    SPDX-License-Identifier: BSD-2-Clause
    Copyright (C) 2026 Inversa Bilişim

    Do these DNS servers answer? Asked before they are made the servers Unbound forwards to:
    a server that does not answer (wrong address, port 853 filtered by the provider, a name that
    does not match the certificate) would take name resolution down for the whole network.

    usage: dnscheck.py <address>[,<address>...] plain|dot [<name of the certificate>|-]
    output: {"<address>": {"ok": true, "ms": 12.3} | {"ok": false, "error": "..."}}
"""

import ipaddress
import re
import sys
import time
import ujson
import dns.message
import dns.query
import dns.rcode

TIMEOUT = 4


def ask(server, dot, name):
    query = dns.message.make_query('opnsense.org', 'A')
    start = time.time()
    try:
        if dot:
            reply = dns.query.tls(query, server, port=853, timeout=TIMEOUT, server_hostname=name)
        else:
            reply = dns.query.udp(query, server, timeout=TIMEOUT)
        if reply.rcode() != dns.rcode.NOERROR or not reply.answer:
            return {'ok': False, 'error': 'no answer (%s)' % dns.rcode.to_text(reply.rcode())}
        return {'ok': True, 'ms': round((time.time() - start) * 1000, 1)}
    except Exception as e:
        return {'ok': False, 'error': ('%s %s' % (type(e).__name__, e)).strip()[:200]}


if __name__ == '__main__':
    servers = sys.argv[1].split(',') if len(sys.argv) > 1 else []
    dot = len(sys.argv) > 2 and sys.argv[2] == 'dot'
    name = sys.argv[3] if len(sys.argv) > 3 and re.match(r'^[A-Za-z0-9.-]+\.[A-Za-z]{2,}$', sys.argv[3]) else None
    result = {}
    for server in servers[:8]:
        try:
            ipaddress.ip_address(server)
        except ValueError:
            result[server] = {'ok': False, 'error': 'not an address'}
            continue
        result[server] = ask(server, dot, name)
    print(ujson.dumps(result))
