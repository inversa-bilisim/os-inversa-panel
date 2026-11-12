#!/usr/local/bin/python3

"""
    SPDX-License-Identifier: BSD-2-Clause
    Copyright (C) 2026 Inversa Bilişim

    How fast the internet connection is, measured from the firewall itself against Cloudflare's
    speed test servers (speed.cloudflare.com). Only run when the button on the page is pressed;
    it moves a few hundred megabytes on a fast line. Cloudflare refuses for a while when asked
    too often (HTTP 429); that is told with the minutes to wait.

    output: {"ok": true, "down": 93.4, "up": 18.2, "ping": 12.1}   (Mbit/s, Mbit/s, ms)
            {"ok": false, "error": "limited", "wait": 58}
"""

import http.client
import json
import ssl
import threading
import time

HOST = 'speed.cloudflare.com'
HEADERS = {'User-Agent': 'OPNsense-InversaPanel'}
SECONDS = 5      # per direction
LIMITED = {}     # set when the service says "too many requests": {'wait': minutes}
STREAMS = 4
CHUNK = 65536


def connection():
    return http.client.HTTPSConnection(HOST, timeout=10, context=ssl.create_default_context())


def latency():
    """the quickest of a few small requests on one connection, in ms"""
    best = None
    conn = connection()
    try:
        for _ in range(4):
            start = time.monotonic()
            conn.request('GET', '/__down?bytes=0', headers=HEADERS)
            conn.getresponse().read()
            took = (time.monotonic() - start) * 1000
            best = took if best is None else min(best, took)
    finally:
        conn.close()
    return best


def measure(worker):
    """several streams for SECONDS; Mbit/s over the time they ran"""
    counter = [0] * STREAMS
    deadline = time.monotonic() + SECONDS
    threads = [threading.Thread(target=worker, args=(counter, i, deadline), daemon=True) for i in range(STREAMS)]
    start = time.monotonic()
    for thread in threads:
        thread.start()
    for thread in threads:
        thread.join(SECONDS + 15)
    return sum(counter) * 8 / max(time.monotonic() - start, 0.001) / 1e6


def download(counter, index, deadline):
    while time.monotonic() < deadline:
        conn = connection()
        try:
            conn.request('GET', '/__down?bytes=25000000', headers=HEADERS)
            response = conn.getresponse()
            if response.status == 429:
                try:
                    LIMITED['wait'] = max(1, int(response.getheader('Retry-After') or 0) // 60 + 1)
                except ValueError:
                    LIMITED['wait'] = 60
                return
            if response.status != 200:
                return
            while time.monotonic() < deadline:
                block = response.read(CHUNK)
                if not block:
                    break
                counter[index] += len(block)
        except (OSError, http.client.HTTPException):
            return
        finally:
            conn.close()


def upload(counter, index, deadline):
    block = b'0' * CHUNK
    size = 25000000
    while time.monotonic() < deadline:
        conn = connection()
        try:
            conn.putrequest('POST', '/__up')
            conn.putheader('User-Agent', HEADERS['User-Agent'])
            conn.putheader('Content-Type', 'application/octet-stream')
            conn.putheader('Content-Length', str(size))
            conn.endheaders()
            sent = 0
            while sent < size and time.monotonic() < deadline:
                step = min(CHUNK, size - sent)
                conn.send(block[:step])
                sent += step
                counter[index] += step
            if sent >= size:
                conn.getresponse().read()
        except (OSError, http.client.HTTPException):
            return
        finally:
            conn.close()


if __name__ == '__main__':
    result = {'ok': False, 'down': 0, 'up': 0, 'ping': 0}
    try:
        result['ping'] = round(latency(), 1)
        result['down'] = round(measure(download), 1)
        if LIMITED:
            result.update({'error': 'limited', 'wait': LIMITED['wait']})
        else:
            result['up'] = round(measure(upload), 1)
            result['ok'] = result['down'] > 0
    except Exception as error:  # pylint: disable=broad-except
        result['error'] = str(error)[:200]
    print(json.dumps(result))
