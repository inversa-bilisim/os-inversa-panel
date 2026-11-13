#!/usr/local/bin/python3

"""
    SPDX-License-Identifier: BSD-2-Clause
    Copyright (C) 2026 Inversa Bilişim

    Notifications by Telegram. Runs every minute (inversapanel_cron) and tells the chosen chat what
    happened since the last run: a new device, an attack alert, a VPN connection, the internet
    connection coming back, a failed login. One message per run at most, whatever happened.
    watch.php also starts a run as soon as it notes a new device, so that one is told within seconds.

    Only sends: the firewall never takes commands from Telegram.

        notify.py          what happened since the last run
        notify.py test     send a test message, print {"ok": ..., "error": ...}
        notify.py chats    who wrote to the bot lately, to find the chat id: {"ok": ..., "chats": [...]}
"""

import fcntl
import hashlib
import json
import os
import sqlite3
import ssl
import subprocess
import sys
import time
import urllib.error
import urllib.request
import xml.etree.ElementTree as ET

DIR = '/var/db/inversapanel'
EVENTS = DIR + '/events.log'
DB = DIR + '/logs.db'
STATE = DIR + '/notify_state.json'
CONFIG = '/conf/config.xml'
# only tests point this somewhere else
API = os.environ.get('INVERSAPANEL_TELEGRAM_API', 'https://api.telegram.org')
RECENT = 900        # events older than this are not news any more
KEEP_QUEUE = 6 * 3600
MAX_QUEUE = 40
UPDATE_EVERY = 86400  # the look for a newer release, when it is switched on
MAX_TEXT = 3500     # Telegram takes 4096 characters

TEXT = {
    'en': {
        'device_wait': 'New device is waiting for approval: {dev} ({net})',
        'device_new': 'New device on the network: {dev} ({net})',
        'peer_on': 'VPN device connected: {name} ({conn})',
        'vpn_up': 'VPN connection is up: {name}',
        'vpn_down': 'VPN connection lost: {name}',
        'wan_up': 'Internet connection is back',
        'wan_down': 'Internet connection lost',
        'boot': 'Firewall restarted',
        'login_fail': 'Failed login to the firewall: user {user} from {ip}',
        'attacks': '{n} attack alerts, {blocked} blocked',
        'attacks_one': '1 attack alert{state}',
        'blocked': ', blocked',
        'times': '×{n}',
        'more': '… and {n} more',
        'test': 'Test message: notifications from Inversa Panel reach this chat.',
        'health_disk': 'The firewall’s disk is {v}% full',
        'health_temp': 'The firewall runs hot: {v} °C',
        'health_update': 'An OPNsense update is waiting (System › Firmware)',
        'update': 'Inversa Panel {new} is out (installed: {old}). Update: Settings › About',
    },
    'tr': {
        'device_wait': 'Yeni cihaz onay bekliyor: {dev} ({net})',
        'device_new': 'Ağa yeni bir cihaz girdi: {dev} ({net})',
        'peer_on': 'VPN cihazı bağlandı: {name} ({conn})',
        'vpn_up': 'VPN bağlantısı kuruldu: {name}',
        'vpn_down': 'VPN bağlantısı koptu: {name}',
        'wan_up': 'İnternet bağlantısı geri geldi',
        'wan_down': 'İnternet bağlantısı koptu',
        'boot': 'Güvenlik duvarı yeniden başladı',
        'login_fail': 'Güvenlik duvarına hatalı giriş denemesi: {user} kullanıcısı, {ip} adresinden',
        'attacks': '{n} saldırı uyarısı, {blocked} tanesi engellendi',
        'attacks_one': '1 saldırı uyarısı{state}',
        'blocked': ', engellendi',
        'times': '×{n}',
        'more': '… ve {n} tane daha',
        'test': 'Deneme mesajı: Inversa Panel bildirimleri bu sohbete ulaşıyor.',
        'health_disk': 'Güvenlik duvarının diski %{v} dolu',
        'health_temp': 'Güvenlik duvarı çok ısındı: {v} °C',
        'health_update': 'Bekleyen bir OPNsense güncellemesi var (Sistem › Yazılım)',
        'update': 'Inversa Panel {new} yayımlandı (kurulu sürüm: {old}). Güncelleme: Ayarlar › Hakkımızda',
    },
}

# which switch of the settings lets a kind of event through
SWITCH = {
    'device_wait': 'devices', 'device_new': 'devices',
    'peer_on': 'vpn', 'vpn_up': 'vpn', 'vpn_down': 'vpn',
    'wan_up': 'internet', 'wan_down': 'internet', 'boot': 'internet',
    'login_fail': 'logins',
    'health_disk': 'health', 'health_temp': 'health', 'health_update': 'health',
}


def settings():
    """what the page stored, plus the names needed to word a message"""
    out = {'enabled': False, 'token': '', 'chat': '', 'lang': 'en', 'host': 'OPNsense', 'names': {}, 'nets': {},
           'devices': True, 'attacks': True, 'vpn': False, 'internet': True, 'logins': True, 'health': True, 'updates': False}
    try:
        root = ET.parse(CONFIG).getroot()
    except (OSError, ET.ParseError):
        return out
    panel = root.find('OPNsense/InversaPanel')
    if panel is None:
        return out
    node = panel.find('notify')
    if node is not None:
        for key in ('enabled', 'devices', 'attacks', 'vpn', 'internet', 'logins', 'health', 'updates'):
            value = node.findtext(key)
            if value is not None and value != '':
                out[key] = value == '1'
        out['token'] = (node.findtext('token') or '').strip()
        out['chat'] = (node.findtext('chat') or '').strip()
    lang = panel.findtext('general/language') or 'auto'
    if lang == 'auto':
        lang = (root.findtext('system/language') or 'en')[:2]
    out['lang'] = lang if lang in TEXT else 'en'
    out['host'] = root.findtext('system/hostname') or 'OPNsense'
    for device in panel.findall('devices/device'):
        if device.findtext('name'):
            out['names'][(device.findtext('mac') or '').lower()] = device.findtext('name')
    interfaces = root.find('interfaces')
    for node in (interfaces if interfaces is not None else []):
        out['nets'][node.tag] = node.findtext('descr') or node.tag.upper()
    return out


def call(cfg, method, payload=None):
    """ask Telegram; (answer, None) or (None, what went wrong), never with the token in it"""
    url = '%s/bot%s/%s' % (API, cfg['token'], method)
    data = json.dumps(payload).encode() if payload is not None else None
    req = urllib.request.Request(url, data=data, headers={'Content-Type': 'application/json', 'User-Agent': 'OPNsense-InversaPanel'})
    try:
        context = ssl.create_default_context() if url.startswith('https') else None
        with urllib.request.urlopen(req, timeout=10, context=context) as resp:
            answer = json.loads(resp.read().decode())
    except urllib.error.HTTPError as e:
        try:
            answer = json.loads(e.read().decode())
        except (ValueError, OSError):
            return None, 'HTTP %d' % e.code
    except (urllib.error.URLError, OSError, ValueError) as e:
        return None, str(getattr(e, 'reason', e)).replace(cfg['token'], '…')
    if not isinstance(answer, dict) or not answer.get('ok'):
        return None, str((answer or {}).get('description', 'unexpected answer')) if isinstance(answer, dict) else 'unexpected answer'
    return answer.get('result'), None


def send(cfg, text):
    _, error = call(cfg, 'sendMessage', {'chat_id': cfg['chat'], 'text': text[:4000], 'disable_web_page_preview': True})
    return error


def load_state():
    try:
        with open(STATE) as f:
            state = json.load(f)
            return state if isinstance(state, dict) else None
    except (OSError, ValueError):
        return None


def save_state(state):
    os.makedirs(DIR, mode=0o755, exist_ok=True)
    with open(STATE + '.tmp', 'w') as f:
        json.dump(state, f)
    os.replace(STATE + '.tmp', STATE)


def hostnames():
    """mac => name the device gave itself, only asked for when a device is to be named"""
    try:
        import subprocess
        out = subprocess.run(['/usr/local/sbin/configctl', 'inversapanel', 'hosts', '-'], capture_output=True, text=True, timeout=30).stdout
        return {h.get('mac', ''): h.get('hostname', '') for h in json.loads(out).get('hosts', [])}
    except Exception:  # pylint: disable=broad-except
        return {}


def word(cfg, row, names):
    """an event of events.log as a line of text, or None when it is not one to tell"""
    kind = row.get('k')
    if kind not in SWITCH or not cfg[SWITCH[kind]]:
        return None
    t = TEXT[cfg['lang']]
    data = {k: str(v) for k, v in row.items()}
    if kind in ('device_wait', 'device_new'):
        mac = data.get('mac', '')
        if names.get('loaded') is None:
            names['loaded'] = hostnames()
        name = cfg['names'].get(mac) or names['loaded'].get(mac) or ''
        data['dev'] = '%s · %s' % (name, mac) if name else mac
        data['net'] = cfg['nets'].get(data.get('net', ''), data.get('net', ''))
    try:
        return t[kind].format(**data)
    except KeyError:
        return None


def new_events(cfg, state, first, now):
    """lines of events.log not seen before: [(time, text)]"""
    out = []
    sent = state.setdefault('sent', {})
    try:
        with open(EVENTS, 'rb') as f:
            f.seek(0, os.SEEK_END)
            f.seek(max(0, f.tell() - 65536))
            lines = f.read().decode('utf-8', 'replace').split('\n')
    except OSError:
        lines = []
    names = {}
    for line in lines:
        try:
            row = json.loads(line)
        except ValueError:
            continue
        if not isinstance(row, dict) or 't' not in row or 'k' not in row or now - int(row['t']) > RECENT:
            continue
        mark = hashlib.sha1(line.encode()).hexdigest()[:16]
        if mark in sent:
            continue
        sent[mark] = int(row['t'])
        if first or not cfg['enabled']:
            continue
        text = word(cfg, row, names)
        if text:
            out.append((int(row['t']), text))
    for mark in [m for m, ts in sent.items() if now - ts > RECENT + 300]:
        del sent[mark]
    return out


def new_attacks(cfg, state, first, now):
    """attack alerts (Suricata) recorded since the last run, as one line: [(time, text)]"""
    try:
        db = sqlite3.connect('file:%s?mode=ro' % DB, uri=True, timeout=10)
        rows = db.execute('''SELECT rowid, src, cc, dst, msg, blocked, n FROM attacks
            WHERE rowid > ? AND kind IN ('ips', 'ips_out') ORDER BY n DESC''', (int(state.get('rowid', 0)),)).fetchall()
        top = db.execute('SELECT max(rowid) FROM attacks').fetchone()[0] or 0
        db.close()
    except sqlite3.Error:
        return []
    state['rowid'] = top
    if first or not cfg['enabled'] or not cfg['attacks'] or not rows:
        return []
    t = TEXT[cfg['lang']]
    total = sum(r[6] for r in rows)
    blocked = sum(r[6] for r in rows if r[5])
    if total == 1:
        head = t['attacks_one'].format(state=t['blocked'] if blocked else '')
    else:
        head = t['attacks'].format(n=total, blocked=blocked)
    lines = [head]
    for row in rows[:3]:
        lines.append('   %s%s → %s · %s%s' % (
            row[1], ' (%s)' % row[2] if row[2] else '', row[3], row[4], ' ' + t['times'].format(n=row[6]) if row[6] > 1 else ''))
    if len(rows) > 3:
        lines.append('   ' + t['more'].format(n=len(rows) - 3))
    return [(now, '\n'.join(lines))]


def new_version(cfg, state, now):
    """once a day, only when switched on: is there a newer release on GitHub; each version is told once"""
    if not cfg['enabled'] or not cfg['updates'] or now - state.get('update_checked', 0) < UPDATE_EVERY:
        return []
    state['update_checked'] = now
    try:
        out = subprocess.run([os.path.join(os.path.dirname(os.path.abspath(__file__)), 'update.py'), 'check'],
                             capture_output=True, text=True, timeout=60)
        answer = json.loads(out.stdout)
    except (OSError, ValueError, subprocess.SubprocessError):
        return []
    if answer.get('error') == 'unreachable':
        # asked again in an hour, not tomorrow
        state['update_checked'] = now - UPDATE_EVERY + 3600
    if not answer.get('newer') or answer.get('latest') == state.get('update_told'):
        return []
    state['update_told'] = answer['latest']
    return [(now, TEXT[cfg['lang']]['update'].format(new=answer['latest'], old=answer.get('installed', '?')))]


def run():
    cfg = settings()
    now = int(time.time())
    state = load_state()
    first = state is None
    state = state or {}
    ready = cfg['enabled'] and cfg['token'] and cfg['chat']
    cfg['enabled'] = bool(ready)
    queue = [item for item in state.get('queue', []) if now - item[0] < KEEP_QUEUE] if ready else []
    queue += new_events(cfg, state, first, now)
    queue += new_attacks(cfg, state, first, now)
    queue += new_version(cfg, state, now)
    queue = sorted(queue, key=lambda item: item[0])[-MAX_QUEUE:]
    if ready and queue:
        text = 'Inversa Panel · %s\n' % cfg['host']
        for when, line in queue:
            entry = '\n%s  %s' % (time.strftime('%H:%M', time.localtime(when)), line)
            if len(text) + len(entry) > MAX_TEXT:
                text += '\n' + TEXT[cfg['lang']]['more'].format(n=len(queue) - text.count('\n') + 1)
                break
            text += entry
        error = send(cfg, text)
        if error is None:
            queue = []
            state.pop('error', None)
        else:
            # kept for the next run: this is how "internet connection lost" still arrives
            state['error'] = {'t': now, 'text': error}
    state['queue'] = queue
    save_state(state)


def main():
    mode = sys.argv[1] if len(sys.argv) > 1 else ''
    if mode == 'test':
        cfg = settings()
        if not cfg['token'] or not cfg['chat']:
            print(json.dumps({'ok': False, 'error': 'no bot token or chat'}))
            return
        error = send(cfg, 'Inversa Panel · %s\n\n%s' % (cfg['host'], TEXT[cfg['lang']]['test']))
        print(json.dumps({'ok': error is None, 'error': error or ''}))
    elif mode == 'chats':
        cfg = settings()
        if not cfg['token']:
            print(json.dumps({'ok': False, 'error': 'no bot token', 'chats': []}))
            return
        result, error = call(cfg, 'getUpdates', {'limit': 50, 'timeout': 0})
        chats = {}
        for update in result or []:
            for key in ('message', 'channel_post', 'my_chat_member'):
                chat = (update.get(key) or {}).get('chat')
                if chat and 'id' in chat:
                    name = chat.get('title') or ' '.join(filter(None, [chat.get('first_name'), chat.get('last_name')])) or chat.get('username') or ''
                    chats[str(chat['id'])] = {'id': str(chat['id']), 'name': name, 'type': chat.get('type', '')}
        print(json.dumps({'ok': error is None, 'error': error or '', 'chats': list(chats.values())}))
    else:
        # the minute job and watch.php may start a run at the same moment: one after the other,
        # so the second one sees what the first one sent
        with open(STATE + '.lock', 'w') as lock:
            fcntl.flock(lock, fcntl.LOCK_EX)
            run()


if __name__ == '__main__':
    main()
