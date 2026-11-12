#!/usr/local/bin/python3

"""
    SPDX-License-Identifier: BSD-2-Clause
    Copyright (C) 2026 Inversa Bilişim

    Update from the releases on GitHub, only when asked on the About page.

    update.py check     what is installed, what the latest release is (JSON)
    update.py install   back up, download, compare the checksum, install, check, put back what is missing
    update.py status    how the running or the last update went (JSON)

    Before the package is touched, the OPNsense configuration and the panel's records are copied to
    /var/db/inversapanel-update/backup. After the installation the version, the panel's settings (every
    value that was there must still be there) and its records are checked; what is missing is put back.
"""

import hashlib
import json
import os
import shutil
import subprocess
import sys
import time
import urllib.request
import xml.etree.ElementTree as ET

PACKAGE = 'os-inversa-panel'
API = os.environ.get('INVERSAPANEL_UPDATE_API', 'https://api.github.com/repos/inversa-bilisim/os-inversa-panel/releases/latest')
CONFIG = '/conf/config.xml'
DATA = '/var/db/inversapanel'
WORK = '/var/db/inversapanel-update'
BACKUP = WORK + '/backup'
STATUS = WORK + '/status.json'
# an update that says "running" for longer than this has died
STALE = 900


def version_key(text):
    return [int(part) if part.isdigit() else 0 for part in text.lstrip('v').replace('_', '.').replace(',', '.').split('.')]


def installed():
    try:
        out = subprocess.run(['/usr/sbin/pkg', 'query', '%v', PACKAGE], capture_output=True, text=True, timeout=60)
        return out.stdout.strip() if out.returncode == 0 else ''
    except (OSError, subprocess.SubprocessError):
        return ''


def fetch(url, timeout=20):
    request = urllib.request.Request(url, headers={'User-Agent': PACKAGE, 'Accept': 'application/vnd.github+json'})
    return urllib.request.urlopen(request, timeout=timeout)


def latest():
    """the latest release: version, notes, where its package is and what its checksum must be"""
    with fetch(API) as response:
        release = json.loads(response.read().decode('utf-8'))
    version = str(release.get('tag_name', '')).lstrip('v')
    found = {'version': version, 'notes': str(release.get('body') or '')[:6000], 'url': '', 'sha256': ''}
    for asset in release.get('assets') or []:
        if asset.get('name') == '%s-%s.pkg' % (PACKAGE, version):
            found['url'] = str(asset.get('browser_download_url') or '')
            digest = str(asset.get('digest') or '')
            found['sha256'] = digest[7:].lower() if digest.startswith('sha256:') else ''
    return found


def check():
    answer = {'installed': installed(), 'latest': '', 'newer': False, 'notes': '', 'error': ''}
    try:
        release = latest()
        answer['latest'] = release['version']
        answer['notes'] = release['notes']
        if not answer['installed']:
            # the files were copied by hand (tools/deploy.sh): there is no package to update
            answer['error'] = 'nopackage'
        elif not release['version'] or not release['url']:
            answer['error'] = 'norelease'
        else:
            answer['newer'] = version_key(release['version']) > version_key(answer['installed'])
    except Exception as error:  # pylint: disable=broad-except
        answer['error'] = 'unreachable'
        answer['detail'] = str(error)[:200]
    return answer


def read_status():
    try:
        with open(STATUS) as handle:
            status = json.load(handle)
    except (OSError, ValueError):
        return {'state': 'none'}
    if status.get('state') == 'running' and time.time() - status.get('started', 0) > STALE:
        status['state'] = 'failed'
        status['error'] = 'stale'
    return status


def write_status(status):
    os.makedirs(WORK, exist_ok=True)
    with open(STATUS + '.tmp', 'w') as handle:
        json.dump(status, handle)
    os.replace(STATUS + '.tmp', STATUS)


def settings(path):
    """every value of the panel's own settings: {where it is: what it holds}"""
    found = {}
    try:
        node = ET.parse(path).getroot().find('./OPNsense/InversaPanel')
    except (OSError, ET.ParseError):
        return None
    if node is None:
        return found

    def walk(element, where):
        children = list(element)
        if not children:
            found[where] = (element.text or '').strip()
        seen = {}
        for child in children:
            # rows of a list are told apart by their uuid, other repeated tags by their order
            mark = child.get('uuid')
            if mark is None:
                seen[child.tag] = seen.get(child.tag, 0) + 1
                mark = str(seen[child.tag])
            walk(child, '%s/%s[%s]' % (where, child.tag, mark))

    walk(node, '')
    return found


def other_parts(path):
    """the configuration without the panel's own section, to see whether anything else changed meanwhile"""
    try:
        root = ET.parse(path).getroot()
    except (OSError, ET.ParseError):
        return None
    parent = root.find('./OPNsense')
    node = parent.find('./InversaPanel') if parent is not None else None
    if node is not None:
        parent.remove(node)
    for tag in ('revision',):
        for found in root.findall('./' + tag):
            root.remove(found)
    return hashlib.sha256(ET.tostring(root)).hexdigest()


def backup():
    shutil.rmtree(BACKUP, ignore_errors=True)
    os.makedirs(BACKUP, mode=0o700)
    shutil.copy2(CONFIG, BACKUP + '/config.xml')
    if os.path.isdir(DATA):
        shutil.copytree(DATA, BACKUP + '/data')


def verify(target):
    """what is not as it was; what could be put back is put back"""
    problems = []
    restored = []

    if installed() != target:
        problems.append('version')

    before = settings(BACKUP + '/config.xml')
    after = settings(CONFIG)
    if before is None or after is None:
        problems.append('config_unreadable')
    else:
        lost = [where for where, value in before.items() if after.get(where) != value]
        if lost:
            # the copy goes back only when nothing else in the configuration changed in between
            if other_parts(BACKUP + '/config.xml') == other_parts(CONFIG):
                shutil.copy2(BACKUP + '/config.xml', CONFIG)
                for stale in ('/tmp/opnsense_menu_cache.xml', '/tmp/opnsense_acl_cache.json',
                              '/var/lib/php/tmp/opnsense_menu_cache.xml', '/var/lib/php/tmp/opnsense_acl_cache.json'):
                    if os.path.exists(stale):
                        os.remove(stale)
                restored.append('settings')
            else:
                problems.append('settings')

    if os.path.isdir(BACKUP + '/data'):
        missing = [name for name in os.listdir(BACKUP + '/data') if not os.path.exists(os.path.join(DATA, name))]
        if missing:
            os.makedirs(DATA, exist_ok=True)
            for name in missing:
                source = os.path.join(BACKUP + '/data', name)
                if os.path.isdir(source):
                    shutil.copytree(source, os.path.join(DATA, name))
                else:
                    shutil.copy2(source, os.path.join(DATA, name))
            restored.append('records')

    # the new code loads and says the version it is
    try:
        probe = subprocess.run(
            ['/usr/local/bin/php', '-r',
             'require_once "/usr/local/opnsense/mvc/script/load_phalcon.php";'
             'new \\OPNsense\\InversaPanel\\InversaPanel(); echo \\OPNsense\\InversaPanel\\Catalog::VERSION;'],
            capture_output=True, text=True, timeout=120)
        if probe.returncode != 0 or probe.stdout.strip() != target:
            problems.append('code')
    except (OSError, subprocess.SubprocessError):
        problems.append('code')

    if restored:
        subprocess.run(['/usr/local/sbin/configctl', 'filter', 'reload'], capture_output=True, timeout=300, check=False)
    return problems, restored


def install():
    status = read_status()
    if status.get('state') == 'running':
        return status
    status = {'state': 'running', 'step': 'check', 'started': int(time.time()), 'from': installed(), 'to': '',
              'problems': [], 'restored': [], 'error': ''}
    write_status(status)

    def step(name):
        status['step'] = name
        write_status(status)

    def fail(reason, detail=''):
        status.update({'state': 'failed', 'error': reason, 'detail': str(detail)[:300], 'finished': int(time.time())})
        write_status(status)
        return status

    try:
        release = latest()
    except Exception as error:  # pylint: disable=broad-except
        return fail('unreachable', error)
    status['to'] = release['version']
    if not status['from']:
        return fail('nopackage')
    if not release['url'] or version_key(release['version']) <= version_key(status['from']):
        return fail('nonewer')

    try:
        step('backup')
        backup()
    except OSError as error:
        return fail('backup', error)

    target = '%s/%s-%s.pkg' % (WORK, PACKAGE, release['version'])
    try:
        step('download')
        digest = hashlib.sha256()
        with fetch(release['url'], 60) as response, open(target, 'wb') as handle:
            while True:
                block = response.read(65536)
                if not block:
                    break
                digest.update(block)
                handle.write(block)
    except Exception as error:  # pylint: disable=broad-except
        return fail('download', error)

    step('verify')
    if not release['sha256'] or digest.hexdigest() != release['sha256']:
        os.remove(target)
        return fail('checksum')

    step('install')
    try:
        result = subprocess.run(['/usr/sbin/pkg', 'add', target], capture_output=True, text=True, timeout=600)
    except (OSError, subprocess.SubprocessError) as error:
        return fail('install', error)
    if result.returncode != 0:
        return fail('install', (result.stderr or result.stdout)[-300:])
    os.remove(target)

    step('aftercheck')
    try:
        status['problems'], status['restored'] = verify(release['version'])
    except Exception as error:  # pylint: disable=broad-except
        status['problems'] = ['check']
        status['detail'] = str(error)[:300]
    status.update({'state': 'done', 'step': 'done', 'finished': int(time.time())})
    write_status(status)
    return status


if __name__ == '__main__':
    MODE = sys.argv[1] if len(sys.argv) > 1 else 'status'
    if MODE == 'check':
        print(json.dumps(check()))
    elif MODE == 'install':
        print(json.dumps(install()))
    else:
        print(json.dumps(read_status()))
