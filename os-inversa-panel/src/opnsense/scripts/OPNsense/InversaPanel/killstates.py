#!/usr/local/bin/python3

"""
    SPDX-License-Identifier: BSD-2-Clause
    Copyright (C) 2026 Inversa Bilişim

    Kill existing pf states of every address in the inversapanel_blocked table, so a device
    whose internet access was just cut cannot keep using already established connections.
    Further addresses (devices that just lost their approval) may be given as one
    comma separated argument.
"""

import ipaddress
import subprocess
import sys

TABLE = 'inversapanel_blocked'

if __name__ == '__main__':
    sp = subprocess.run(['/sbin/pfctl', '-t', TABLE, '-T', 'show'], capture_output=True, text=True)
    addresses = set(sp.stdout.split('\n'))
    for arg in sys.argv[1:]:
        addresses.update(arg.split(','))
    for address in sorted(x.strip() for x in addresses):
        if not address:
            continue
        try:
            ipaddress.ip_address(address)
        except ValueError:
            continue
        # states originating from the device, and states towards it
        subprocess.run(['/sbin/pfctl', '-k', address], capture_output=True)
        subprocess.run(['/sbin/pfctl', '-k', '0.0.0.0/0' if '.' in address else '::/0', '-k', address],
                       capture_output=True)
