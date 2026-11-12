#!/usr/local/bin/python3

"""
    SPDX-License-Identifier: BSD-2-Clause
    Copyright (C) 2026 Inversa Bilişim

    Free country database for GeoIP aliases without any sign-up: DB-IP "IP to Country Lite"
    (CC BY 4.0, https://db-ip.com), updated monthly.

    OPNsense keeps GeoIP data as per-country CIDR files in /usr/local/share/GeoIP/alias
    (<CC>-IPv4 / <CC>-IPv6) and fills GeoIP alias tables from them. Its own downloader only
    reads MaxMind zips or ipinfo CSVs and, without a configured URL, leaves those files alone.
    So when no source is configured in OPNsense, this script writes the same files from DB-IP.
    A configured source (MaxMind, ipinfo, Deciso mirror) always wins: nothing is written then.

    usage: geoip_dbip.py [--force]
"""

import csv
import datetime
import fcntl
import gzip
import ipaddress
import os
import shutil
import subprocess
import sys
import syslog
import tempfile
import time
import ujson
import urllib.request
from configparser import ConfigParser

TARGET = '/usr/local/share/GeoIP/alias'
STATS = '/usr/local/share/GeoIP/inversapanel-dbip.json'
UPDATER_CONF = '/usr/local/etc/filter_geoip.conf'
LOCK = '/tmp/inversapanel_geoip.lock'
URL = 'https://download.db-ip.com/free/dbip-country-lite-%s.csv.gz'
MAX_AGE = 7 * 86400


def opnsense_source_configured():
    if os.path.exists(UPDATER_CONF):
        cnf = ConfigParser()
        cnf.read(UPDATER_CONF)
        if cnf.has_option('settings', 'url') and cnf.get('settings', 'url').strip():
            return True
    return False


def inversapanel_geo_enabled():
    """ only fetch data when Inversa Panel country blocking is switched on """
    try:
        import xml.etree.ElementTree as ET
        node = ET.parse('/conf/config.xml').getroot().find('./OPNsense/InversaPanel/geo/enabled')
        return node is not None and (node.text or '').strip() == '1'
    except Exception:
        return False


def download(tmpdir):
    """ this month's file, or last month's early in the month """
    today = datetime.date.today()
    last_month = (today.replace(day=1) - datetime.timedelta(days=1))
    for month in (today.strftime('%Y-%m'), last_month.strftime('%Y-%m')):
        target = os.path.join(tmpdir, 'dbip.csv.gz')
        try:
            req = urllib.request.Request(URL % month, headers={'User-Agent': 'OPNsense-InversaPanel'})
            with urllib.request.urlopen(req, timeout=120) as resp, open(target, 'wb') as out:
                shutil.copyfileobj(resp, out)
            return target, month
        except Exception as e:
            syslog.syslog(syslog.LOG_NOTICE, 'inversapanel: db-ip %s not available (%s)' % (month, e))
    return None, None


def convert(src, outdir):
    handles = {}
    count = 0
    with gzip.open(src, 'rt') as f:
        for row in csv.reader(f):
            if len(row) < 3 or len(row[2]) != 2 or not row[2].isalpha() or row[2] == 'ZZ':
                continue
            try:
                first, last = ipaddress.ip_address(row[0]), ipaddress.ip_address(row[1])
            except ValueError:
                continue
            key = '%s-%s' % (row[2].upper(), 'IPv6' if first.version == 6 else 'IPv4')
            if key not in handles:
                handles[key] = open(os.path.join(outdir, key), 'w')
            for net in ipaddress.summarize_address_range(first, last):
                handles[key].write('%s\n' % net)
                count += 1
    for h in handles.values():
        h.close()
    return count, len(handles)


if __name__ == '__main__':
    force = '--force' in sys.argv
    lock = open(LOCK, 'w')
    try:
        fcntl.flock(lock, fcntl.LOCK_EX | fcntl.LOCK_NB)
    except OSError:
        sys.exit(0)  # another update is running

    if opnsense_source_configured() or not inversapanel_geo_enabled():
        sys.exit(0)
    if not force and os.path.exists(STATS) and time.time() - os.path.getmtime(STATS) < MAX_AGE:
        sys.exit(0)

    os.makedirs(TARGET, exist_ok=True)
    with tempfile.TemporaryDirectory(dir=os.path.dirname(TARGET)) as tmpdir:
        src, month = download(tmpdir)
        if src is None:
            sys.exit(1)
        outdir = os.path.join(tmpdir, 'alias')
        os.makedirs(outdir)
        count, files = convert(src, outdir)
        if count < 10000:
            syslog.syslog(syslog.LOG_ERR, 'inversapanel: db-ip data looks incomplete (%d networks), kept old data' % count)
            sys.exit(1)
        # replace country files one by one (same filesystem: rename is atomic)
        for name in os.listdir(outdir):
            os.replace(os.path.join(outdir, name), os.path.join(TARGET, name))

    with open(STATS, 'w') as f:
        f.write(ujson.dumps({
            'source': 'db-ip', 'month': month, 'address_count': count, 'file_count': files,
            'timestamp': datetime.datetime.now().isoformat(timespec='seconds')
        }))
    syslog.syslog(syslog.LOG_NOTICE, 'inversapanel: db-ip country data %s installed (%d networks)' % (month, count))
    # new data: fill the alias tables from it and (re)load the rules; "allow only these countries" is
    # not enforced before there is data for a country it lets in
    subprocess.run(['/usr/local/sbin/configctl', 'filter', 'reload'], capture_output=True)
