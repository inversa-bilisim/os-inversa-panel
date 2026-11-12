#!/usr/local/bin/python3

"""
    SPDX-License-Identifier: BSD-2-Clause
    Copyright (C) 2026 Inversa Bilişim

    Copies of the OPNsense configuration for the Backup page (the panel's settings are part of it).

    backup.py nightly   from cron: a copy when the configuration differs from the newest copy
    backup.py now       a copy right now

    The copies live in /var/db/inversapanel-backup, readable by root only: the configuration holds
    password hashes and VPN keys. The newest KEEP copies are kept.
"""

import glob
import hashlib
import json
import os
import shutil
import sys
import time

CONFIG = '/conf/config.xml'
STORE = '/var/db/inversapanel-backup'
KEEP = 7


def digest(path):
    with open(path, 'rb') as handle:
        return hashlib.sha256(handle.read()).hexdigest()


def copies():
    return sorted(glob.glob(STORE + '/config-????????-????.xml'))


def take(force):
    os.makedirs(STORE, mode=0o700, exist_ok=True)
    have = copies()
    if not force and have and digest(have[-1]) == digest(CONFIG):
        return {'status': 'same'}
    target = '%s/config-%s.xml' % (STORE, time.strftime('%Y%m%d-%H%M'))
    shutil.copyfile(CONFIG, target + '.tmp')
    os.chmod(target + '.tmp', 0o600)
    os.replace(target + '.tmp', target)
    for old in copies()[:-KEEP]:
        os.remove(old)
    return {'status': 'ok', 'name': os.path.basename(target)}


if __name__ == '__main__':
    try:
        print(json.dumps(take(len(sys.argv) > 1 and sys.argv[1] == 'now')))
    except OSError as error:
        print(json.dumps({'status': 'failed', 'message': str(error)[:200]}))
