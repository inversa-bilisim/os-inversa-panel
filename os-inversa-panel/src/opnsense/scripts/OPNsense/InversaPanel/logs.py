#!/usr/local/bin/python3

"""
    SPDX-License-Identifier: BSD-2-Clause
    Copyright (C) 2026 Inversa Bilişim

    The records behind the "Logs" pages.

    logs.py collect
        Runs every minute. Reads what was added since the last run to
          - the firewall log: connections from the internet that were refused (by the country
            rules, the list of blocked addresses or because nothing lets them in)
          - Suricata's eve.json: attack alerts
          - the audit log: logins to the web interface, good and bad
          - /conf/backup: who changed the configuration, from which page
        Attacks go into a small SQLite file (one line per source, target and hour, with a count,
        kept 30 days), logins and changes into the event log of the overview (kept 90 days).

    logs.py query <base64 of a JSON request>
        {"what": "attacks" | "history" | "events", ...} -> JSON on stdout.
        The internet history is not kept here: it is read from the query log of Unbound
        (OPNsense keeps the last 7 days when its DNS statistics are on).
"""

import base64
import bisect
import calendar
import glob
import hashlib
import ipaddress
import json
import os
import re
import sqlite3
import subprocess
import sys
import time
import xml.etree.ElementTree as ET
from array import array

DIR = '/var/db/inversapanel'
DB = DIR + '/logs.db'
STATE = DIR + '/logs_state.json'
EVENTS = DIR + '/events.log'
GEO_INDEX = DIR + '/geo.idx'
GEO_ALIAS = '/usr/local/share/GeoIP/alias'
FILTER_LOG = '/var/log/filter/latest.log'
AUDIT_LOG = '/var/log/audit/latest.log'
EVE_LOG = '/var/log/suricata/eve.json'
BACKUPS = '/conf/backup'
UNBOUND_DB = '/var/unbound/data/unbound.duckdb'
KEEP_ATTACKS = 30 * 86400
KEEP_EVENTS = 90 * 86400
MAX_ATTACK_ROWS = 400000
# a first run does not work through more than this of an existing log
FIRST_RUN_TAIL = 4 * 1024 * 1024


def label(name):
    """ the label our firewall rules carry (plugins.inc.d/inversapanel.inc: inversapanel_label) """
    return hashlib.md5(('inversapanel-' + name).encode()).hexdigest()


LABEL_KIND = {label('geo-in'): 'geo', label('blockip'): 'blocked'}


def load_state():
    try:
        with open(STATE) as f:
            return json.load(f)
    except (OSError, ValueError):
        return None


def save_state(state):
    with open(STATE + '.tmp', 'w') as f:
        json.dump(state, f)
    os.rename(STATE + '.tmp', STATE)


def new_lines(path, state, key, first):
    """ lines added to a log since the last run; logs are replaced by a new file once a day """
    try:
        real = os.path.realpath(path)
        size = os.path.getsize(real)
    except OSError:
        return
    was = state.get(key) or {}
    jobs = []
    if was.get('file') and was['file'] != real and os.path.isfile(was['file']):
        jobs.append((was['file'], was.get('pos', 0)))
        pos = 0
    elif was.get('file') == real and was.get('pos', 0) <= size:
        pos = was['pos']
    else:
        pos = max(0, size - FIRST_RUN_TAIL) if first else 0
    jobs.append((real, pos))
    for name, start in jobs:
        try:
            with open(name, 'rb') as f:
                f.seek(start)
                if start and name == real and first:
                    f.readline()
                while True:
                    line = f.readline()
                    if not line or not line.endswith(b'\n'):
                        break
                    start += len(line)
                    yield line.decode('utf-8', 'replace').rstrip('\n')
        except OSError:
            continue
        if name == real:
            state[key] = {'file': real, 'pos': start}


def syslog_time(line):
    """ <134>1 2026-11-11T21:26:38+00:00 host ... """
    m = re.match(r'<\d+>1 (\d{4}-\d\d-\d\dT\d\d:\d\d:\d\d)(?:\.\d+)?([+-]\d\d:\d\d|Z)? ', line)
    if not m:
        return None
    try:
        stamp = time.strptime(m.group(1), '%Y-%m-%dT%H:%M:%S')
        offset = 0
        if m.group(2) and m.group(2) != 'Z':
            sign = 1 if m.group(2)[0] == '+' else -1
            offset = sign * (int(m.group(2)[1:3]) * 3600 + int(m.group(2)[4:6]) * 60)
        return calendar.timegm(stamp) - offset
    except ValueError:
        return None


# ---------------------------------------------------------------------------- countries

class Countries:
    """
    which country an IPv4 address belongs to, from the country lists OPNsense downloads. The lists
    are turned into one sorted file of numbers once (when they change); reading that takes milliseconds
    """

    def __init__(self):
        self.starts = array('I')
        self.ends = array('I')
        self.codes = b''
        self.loaded = False
        self.seen = {}

    @staticmethod
    def _number(text):
        a, b, c, d = text.split('.')
        return (int(a) << 24) | (int(b) << 16) | (int(c) << 8) | int(d)

    def _build(self):
        rows = []
        for path in glob.glob(GEO_ALIAS + '/*-IPv4'):
            code = os.path.basename(path)[:2].encode()
            try:
                with open(path) as f:
                    for line in f:
                        try:
                            net, _, bits = line.strip().partition('/')
                            start = self._number(net)
                            rows.append((start, start | ((1 << (32 - int(bits or 32))) - 1), code))
                        except ValueError:
                            continue
            except OSError:
                continue
        rows.sort()
        with open(GEO_INDEX + '.tmp', 'wb') as f:
            f.write(len(rows).to_bytes(4, 'little'))
            array('I', [r[0] for r in rows]).tofile(f)
            array('I', [r[1] for r in rows]).tofile(f)
            f.write(b''.join(r[2] for r in rows))
        os.rename(GEO_INDEX + '.tmp', GEO_INDEX)

    def load(self):
        self.loaded = True
        try:
            newest = max((os.path.getmtime(p) for p in glob.glob(GEO_ALIAS + '/*-IPv4')), default=0)
            if not newest:
                return
            if not os.path.isfile(GEO_INDEX) or os.path.getmtime(GEO_INDEX) < newest:
                self._build()
            with open(GEO_INDEX, 'rb') as f:
                count = int.from_bytes(f.read(4), 'little')
                self.starts.fromfile(f, count)
                self.ends.fromfile(f, count)
                self.codes = f.read(count * 2)
        except (OSError, ValueError, EOFError):
            self.starts, self.ends, self.codes = array('I'), array('I'), b''

    def code(self, address):
        if address in self.seen:
            return self.seen[address]
        result = ''
        try:
            ip = ipaddress.ip_address(address)
            if ip.version == 4 and ip.is_global:
                if not self.loaded:
                    self.load()
                value = int(ip)
                i = bisect.bisect_right(self.starts, value) - 1
                if i >= 0 and self.ends[i] >= value:
                    result = self.codes[i * 2:i * 2 + 2].decode()
        except ValueError:
            pass
        self.seen[address] = result
        return result


# ---------------------------------------------------------------------------- collect

def database():
    db = sqlite3.connect(DB, timeout=20)
    db.execute('''CREATE TABLE IF NOT EXISTS attacks (
        bucket INTEGER, kind TEXT, src TEXT, cc TEXT, dst TEXT, dport INTEGER, proto TEXT, msg TEXT,
        blocked INTEGER, n INTEGER, ts INTEGER,
        PRIMARY KEY (bucket, kind, src, dst, dport, proto, msg))''')
    db.execute('CREATE INDEX IF NOT EXISTS attacks_ts ON attacks (ts)')
    return db


def wan_devices():
    """ devices of the interfaces the internet comes in on (as in Overview::wanKeys) """
    devices = set()
    try:
        root = ET.parse('/conf/config.xml').getroot()
        interfaces = root.find('interfaces')
        for node in (interfaces if interfaces is not None else []):
            if node.tag == 'wan' or (node.findtext('gateway') or node.findtext('gatewayv6')):
                if node.findtext('if'):
                    devices.add(node.findtext('if'))
    except (OSError, ET.ParseError):
        pass
    return devices


def is_unicast(address):
    try:
        ip = ipaddress.ip_address(address)
    except ValueError:
        return False
    return not (ip.is_multicast or ip.is_unspecified or address == '255.255.255.255' or address.endswith('.255'))


def is_public(address):
    try:
        return ipaddress.ip_address(address).is_global
    except ValueError:
        return False


def add_attack(pending, ts, kind, src, dst, dport, proto, msg, blocked):
    key = (ts - ts % 3600, kind, src, dst, int(dport or 0), proto, msg)
    row = pending.get(key)
    if row is None:
        pending[key] = [1 if blocked else 0, 1, ts]
    else:
        row[1] += 1
        row[2] = max(row[2], ts)
        row[0] = row[0] or (1 if blocked else 0)


def collect_filter(state, first, pending):
    wan = wan_devices()
    for line in new_lines(FILTER_LOG, state, 'filter', first):
        at = line.find('] ')
        if at < 0 or ',block,in,' not in line:
            continue
        f = line[at + 2:].split(',')
        # rulenr,subrule,anchor,label,interface,reason,action,dir,ipversion,...
        if len(f) < 20 or f[4] not in wan or f[6] != 'block' or f[7] != 'in':
            continue
        try:
            if f[8] == '4':
                proto, src, dst, rest = f[16], f[18], f[19], f[20:]
            elif f[8] == '6':
                proto, src, dst, rest = f[12], f[15], f[16], f[17:]
            else:
                continue
        except IndexError:
            continue
        if proto not in ('tcp', 'udp') or len(rest) < 2 or not is_unicast(dst):
            continue
        ts = syslog_time(line)
        if ts is None or not rest[1].isdigit():
            continue
        add_attack(pending, ts, LABEL_KIND.get(f[3], 'fw'), src, dst, rest[1], proto, '', True)


def collect_alerts(state, first, pending):
    for line in new_lines(EVE_LOG, state, 'eve', first):
        if '"event_type":"alert"' not in line:
            continue
        try:
            row = json.loads(line)
            stamp = row['timestamp']
            ts = calendar.timegm(time.strptime(stamp[:19], '%Y-%m-%dT%H:%M:%S'))
            zone = re.search(r'([+-])(\d\d):?(\d\d)$', stamp)
            if zone:
                ts -= (1 if zone.group(1) == '+' else -1) * (int(zone.group(2)) * 3600 + int(zone.group(3)) * 60)
            alert = row['alert']
        except (ValueError, KeyError):
            continue
        src, dst = row.get('src_ip', ''), row.get('dest_ip', '')
        # the stranger is the one who is not at home here; "out" = one of our devices went to them
        kind = 'ips'
        if is_public(dst) and not is_public(src):
            src, dst, kind = dst, src, 'ips_out'
        # the ports of an alert say little (often the answer of a connection): the alert's text does
        add_attack(pending, ts, kind, src, dst, 0, str(row.get('proto', '')).lower(),
                   str(alert.get('signature', ''))[:200], alert.get('action') == 'blocked')


def write_event(kind, ts, **data):
    row = {'t': int(ts), 'k': kind}
    row.update(data)
    with open(EVENTS, 'a') as f:
        f.write(json.dumps(row, ensure_ascii=False) + '\n')


def collect_logins(state, first):
    ok = re.compile(r'user (\S+) authenticated successfully for WebGui .* at (\S+)\s*$')
    bad = re.compile(r'user (\S+) could not authenticate for WebGui.* at (\S+)\s*$')
    for line in new_lines(AUDIT_LOG, state, 'audit', first):
        if 'WebGui' not in line:
            continue
        ts = syslog_time(line)
        if ts is None:
            continue
        m = ok.search(line)
        if m:
            write_event('login_ok', ts, user=m.group(1), ip=m.group(2))
            continue
        m = bad.search(line)
        if m:
            write_event('login_fail', ts, user=m.group(1), ip=m.group(2))


def collect_changes(state, first):
    """ every saved configuration is kept as /conf/backup/config-<time>.xml with who and from where """
    last = float(state.get('config', 0))
    newest = last
    names = []
    for path in glob.glob(BACKUPS + '/config-*.xml'):
        m = re.search(r'config-(\d+(?:\.\d+)?)\.xml$', path)
        if m and float(m.group(1)) > last:
            names.append((float(m.group(1)), path))
    for stamp, path in sorted(names):
        newest = max(newest, stamp)
        if first:
            continue
        try:
            with open(path, 'rb') as f:
                f.seek(max(0, os.path.getsize(path) - 65536))
                tail = f.read().decode('utf-8', 'replace')
        except OSError:
            continue
        m = re.search(r'<revision>(.*?)</revision>', tail, re.S)
        if not m:
            continue
        user = re.search(r'<username>(.*?)</username>', m.group(1), re.S)
        descr = re.search(r'<description>(.*?)</description>', m.group(1), re.S)
        user = user.group(1).strip() if user else ''
        descr = descr.group(1).strip() if descr else ''
        # our own minutely jobs and a restore are no news; a person has a name and an address
        if '@' not in user:
            continue
        name, _, address = user.partition('@')
        write_event('config', stamp, user=name, ip=address, page=re.sub(r' made changes$', '', descr)[:200])
    state['config'] = newest


def trim_events(state, now):
    if now - state.get('events_trim', 0) < 86400:
        return
    state['events_trim'] = now
    try:
        with open(EVENTS) as f:
            lines = f.readlines()
    except OSError:
        return
    keep = []
    for line in lines:
        try:
            if json.loads(line).get('t', 0) >= now - KEEP_EVENTS:
                keep.append(line)
        except ValueError:
            continue
    if len(keep) != len(lines):
        with open(EVENTS + '.tmp', 'w') as f:
            f.writelines(keep[-50000:])
        os.rename(EVENTS + '.tmp', EVENTS)


def collect():
    os.makedirs(DIR, mode=0o755, exist_ok=True)
    state = load_state()
    first = state is None
    state = state or {}
    now = int(time.time())
    pending = {}
    collect_filter(state, first, pending)
    collect_alerts(state, first, pending)
    collect_logins(state, first)
    collect_changes(state, first)
    db = database()
    if pending:
        countries = Countries()
        rows = [(k[0], k[1], k[2], countries.code(k[2]), k[3], k[4], k[5], k[6], v[0], v[1], v[2]) for k, v in pending.items()]
        db.executemany('''INSERT INTO attacks (bucket, kind, src, cc, dst, dport, proto, msg, blocked, n, ts)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            ON CONFLICT (bucket, kind, src, dst, dport, proto, msg)
            DO UPDATE SET n = n + excluded.n, ts = max(ts, excluded.ts), blocked = max(blocked, excluded.blocked)''', rows)
    if now - state.get('attacks_trim', 0) > 3600:
        state['attacks_trim'] = now
        db.execute('DELETE FROM attacks WHERE ts < ?', (now - KEEP_ATTACKS,))
        total = db.execute('SELECT count(*) FROM attacks').fetchone()[0]
        if total > MAX_ATTACK_ROWS:
            db.execute('DELETE FROM attacks WHERE rowid IN (SELECT rowid FROM attacks ORDER BY ts LIMIT ?)', (total - MAX_ATTACK_ROWS,))
    db.commit()
    db.close()
    trim_events(state, now)
    save_state(state)


# ---------------------------------------------------------------------------- query

def own_addresses():
    """ the firewall's own addresses, so the page can say "the firewall" instead of a number """
    try:
        out = subprocess.run(['/sbin/ifconfig'], capture_output=True, text=True).stdout
    except OSError:
        return []
    return sorted(set(re.findall(r'^\s+inet6? ([0-9a-f.:]+)', out, re.M)) - {'127.0.0.1', '::1'})


def like(text):
    return '%' + text.replace('\\', '\\\\').replace('%', '\\%').replace('_', '\\_') + '%'


def query_attacks(req):
    if not os.path.isfile(DB):
        return {'rows': [], 'total': 0, 'kinds': {}, 'top': {'src': [], 'cc': [], 'target': []}, 'self': own_addresses()}
    db = database()
    since = int(time.time()) - max(1, min(30, int(req.get('days', 7)))) * 86400
    where, args = ['ts >= ?'], [since]
    q = str(req.get('q', '')).strip()
    if q:
        clause = "(src LIKE ? ESCAPE '\\' OR dst LIKE ? ESCAPE '\\' OR msg LIKE ? ESCAPE '\\' OR cc = ? OR CAST(dport AS TEXT) = ?"
        args += [like(q), like(q), like(q), q.upper(), q]
        # names the page knows (a device, a country) arrive as addresses / codes
        for column, key in (('dst', 'q_dst'), ('cc', 'q_cc'), ('dport', 'q_ports')):
            values = [v for v in req.get(key, []) if isinstance(v, (str, int))][:50]
            if values:
                clause += ' OR %s IN (%s)' % (column, ','.join('?' * len(values)))
                args += values
        where.append(clause + ')')
    base_where, base_args = ' AND '.join(where), list(args)
    kinds = {k: [rows, n] for k, rows, n in db.execute('SELECT kind, count(*), sum(n) FROM attacks WHERE ' + base_where + ' GROUP BY kind', base_args)}
    kind = req.get('kind', '')
    groups = {'ips': ('ips', 'ips_out'), 'geo': ('geo',), 'fw': ('fw', 'blocked')}
    if kind in groups:
        where.append('kind IN (%s)' % ','.join('?' * len(groups[kind])))
        args += list(groups[kind])
    sql_where = ' AND '.join(where)
    limit = max(1, min(5000, int(req.get('limit', 100))))
    offset = max(0, int(req.get('offset', 0)))
    cols = ['ts', 'kind', 'src', 'cc', 'dst', 'dport', 'proto', 'msg', 'blocked', 'n']
    rows = [dict(zip(cols, r)) for r in db.execute(
        'SELECT %s FROM attacks WHERE %s ORDER BY ts DESC LIMIT ? OFFSET ?' % (','.join(cols), sql_where), args + [limit, offset])]
    total = db.execute('SELECT count(*), sum(n) FROM attacks WHERE ' + sql_where, args).fetchone()
    top = {
        'src': [list(r) for r in db.execute('SELECT src, cc, sum(n) FROM attacks WHERE %s GROUP BY src ORDER BY 3 DESC LIMIT 4' % sql_where, args)],
        'cc': [list(r) for r in db.execute("SELECT cc, sum(n) FROM attacks WHERE %s AND cc != '' GROUP BY cc ORDER BY 2 DESC LIMIT 4" % sql_where, args)],
        'target': [list(r) for r in db.execute('SELECT dst, dport, proto, sum(n) FROM attacks WHERE %s GROUP BY dst, dport, proto ORDER BY 4 DESC LIMIT 4' % sql_where, args)],
    }
    db.close()
    return {'rows': rows, 'total': total[0], 'tries': total[1] or 0, 'kinds': kinds, 'top': top, 'self': own_addresses()}


def query_history(req):
    sys.path.insert(0, '/usr/local/opnsense/site-python')
    try:
        from duckdb_helper import DbConnection
    except ImportError:
        return {'available': False, 'rows': [], 'total': 0}
    if not os.path.isfile(UNBOUND_DB):
        return {'available': False, 'rows': [], 'total': 0}
    since = int(time.time()) - max(1, min(168, int(req.get('hours', 24)))) * 3600
    where = ["time >= ?", "client NOT IN ('127.0.0.1', '::1')", "action IN (0, 1)", "domain NOT LIKE '%.invalid.'", "domain NOT LIKE '%.arpa.'"]
    args = [since]
    # only the networks the history is kept for (IPv4: the address as a number between the ends)
    nets = []
    number = "(CAST(split_part(client, '.', 1) AS BIGINT) * 16777216 + CAST(split_part(client, '.', 2) AS BIGINT) * 65536 + " \
             "CAST(split_part(client, '.', 3) AS BIGINT) * 256 + CAST(split_part(client, '.', 4) AS BIGINT))"
    for cidr in req.get('networks', []):
        try:
            net = ipaddress.ip_network(str(cidr), strict=False)
        except ValueError:
            continue
        if net.version == 4:
            nets.append('(%s BETWEEN %d AND %d)' % (number, int(net.network_address), int(net.broadcast_address)))
    if not nets:
        return {'available': True, 'rows': [], 'total': 0, 'results': {}}
    where.append("family = 'ip4' AND (" + ' OR '.join(nets) + ')')
    q = str(req.get('q', '')).strip().lower()
    clients = [str(c) for c in req.get('clients', []) if re.match(r'^[0-9a-f.:]+$', str(c))][:50]
    if q:
        clause = "(domain LIKE ? ESCAPE '\\' OR client LIKE ? ESCAPE '\\'"
        args += [like(q), like(q)]
        if clients:
            clause += ' OR client IN (%s)' % ','.join('?' * len(clients))
            args += clients
        where.append(clause + ')')
    elif clients:
        where.append('client IN (%s)' % ','.join('?' * len(clients)))
        args += clients
    base_where, base_args = ' AND '.join(where), list(args)
    result = req.get('result', '')
    if result in ('pass', 'block'):
        where.append('action = %d' % (1 if result == 'block' else 0))
    limit = max(1, min(5000, int(req.get('limit', 100))))
    offset = max(0, int(req.get('offset', 0)))
    grouped = 'SELECT max(time) AS ts, client, domain, action, max(blocklist) AS list, count(*) AS n FROM query WHERE %s ' \
              'GROUP BY time - time %% 3600, client, domain, action'
    with DbConnection(UNBOUND_DB, read_only=True) as db:
        if db is None or db.connection is None:
            return {'available': False, 'rows': [], 'total': 0}
        con = db.connection
        sql = grouped % ' AND '.join(where)
        rows = con.execute(sql + ' ORDER BY ts DESC, domain LIMIT ? OFFSET ?', args + [limit, offset]).fetchall()
        total = con.execute('SELECT count(*) FROM (' + sql + ')', args).fetchone()[0]
        results = dict(con.execute('SELECT action, count(*) FROM (' + (grouped % base_where) + ') GROUP BY action', base_args).fetchall())
    return {
        'available': True,
        'rows': [{'ts': r[0], 'client': r[1], 'domain': r[2].rstrip('.'), 'blocked': r[3] == 1, 'list': r[4] or '', 'n': r[5]} for r in rows],
        'total': total,
        'results': {'pass': results.get(0, 0), 'block': results.get(1, 0)},
    }


EVENT_TYPES = {
    'vpn': ('vpn_up', 'vpn_down', 'peer_on'),
    'login': ('login_ok', 'login_fail'),
    'device': ('device_wait', 'device_new'),
    'config': ('config',),
    'system': ('wan_up', 'wan_down', 'sched_on', 'sched_off', 'lists', 'boot', 'health_disk', 'health_temp', 'health_update'),
}


def query_events(req):
    since = int(time.time()) - max(1, min(90, int(req.get('days', 7)))) * 86400
    wanted = EVENT_TYPES.get(req.get('type', ''))
    q = str(req.get('q', '')).strip().lower()
    rows = []
    try:
        with open(EVENTS) as f:
            for line in f:
                try:
                    row = json.loads(line)
                except ValueError:
                    continue
                if not isinstance(row, dict) or row.get('t', 0) < since or (wanted and row.get('k') not in wanted):
                    continue
                if q and q not in ' '.join(str(v) for v in row.values()).lower():
                    continue
                rows.append(row)
    except OSError:
        pass
    rows.sort(key=lambda r: r.get('t', 0), reverse=True)
    limit = max(1, min(5000, int(req.get('limit', 100))))
    offset = max(0, int(req.get('offset', 0)))
    return {'rows': rows[offset:offset + limit], 'total': len(rows)}


if __name__ == '__main__':
    if len(sys.argv) > 1 and sys.argv[1] == 'collect':
        collect()
    elif len(sys.argv) > 2 and sys.argv[1] == 'query':
        try:
            request = json.loads(base64.b64decode(sys.argv[2]).decode())
            what = {'attacks': query_attacks, 'history': query_history, 'events': query_events}[request.get('what')]
            print(json.dumps(what(request)))
        except Exception as error:  # the page shows "could not be read" rather than a trace
            print(json.dumps({'error': str(error)}))
    else:
        print('usage: logs.py collect | query <base64 json>')
