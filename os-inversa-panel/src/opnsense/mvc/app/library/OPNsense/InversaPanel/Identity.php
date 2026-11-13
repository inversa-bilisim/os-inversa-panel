<?php

/*
 * SPDX-License-Identifier: BSD-2-Clause
 * Copyright (C) 2026 Inversa Bilişim
 */

namespace OPNsense\InversaPanel;

use OPNsense\Core\Backend;

/**
 * Device identity watch: a MAC address can be copied, the way a device asks for an address mostly
 * is not. When a device takes or renews a DHCP lease, dnsmasq runs scripts/.../dhcpseen.sh, which
 * notes the name it gives and its DHCP fingerprint (the options it asks for, its vendor class) in
 * SPOOL. watch.php hands the lines to process() every 15 seconds; what is known about each device
 * is kept in FILE. A different fingerprint, two fingerprints within an hour, a new name or an
 * approved device that suddenly sets its address itself is told (event "id_change"), and with
 * general.idwatch = "hold" the device's approval is taken back so that it waits again.
 *
 * It tells, it does not prevent: a copy of the same kind of device (an iPhone of an iPhone) can
 * look the same. Only dnsmasq is watched (the DHCP server of OPNsense 26.7 by default).
 */
class Identity
{
    const FILE = '/var/db/inversapanel/identity.json';
    const SPOOL = '/var/db/inversapanel/dhcpseen.tsv';
    /* the drop-in directory OPNsense's dnsmasq reads (its README invites plugins to put files there) */
    const CONF_DIR = '/usr/local/etc/dnsmasq.conf.d';
    const CONF = self::CONF_DIR . '/inversapanel.conf';
    const SCRIPT = '/usr/local/opnsense/scripts/OPNsense/InversaPanel/dhcpseen.sh';
    /* two fingerprints of one MAC within this time: two devices at once */
    const BOTH = 3600;
    /* the same change is told at most this often */
    const QUIET = 3600;

    public static function mode(InversaPanel $mdl)
    {
        $mode = (string)$mdl->general->idwatch;
        return in_array($mode, ['tell', 'hold']) ? $mode : 'off';
    }

    /**
     * another lease script is set up in dnsmasq: dnsmasq takes one only, ours is then not written
     * @return string|null the file that has it
     */
    public static function conflict()
    {
        $files = array_merge(['/usr/local/etc/dnsmasq.conf'], glob(self::CONF_DIR . '/*.conf') ?: []);
        foreach ($files as $file) {
            if ($file === self::CONF || !is_file($file)) {
                continue;
            }
            if (preg_match('/^\s*dhcp-script\s*=/m', (string)@file_get_contents($file))) {
                return $file;
            }
        }
        return null;
    }

    /**
     * our drop-in for dnsmasq follows the setting
     * @return bool changed (dnsmasq must be restarted)
     */
    public static function syncConf(InversaPanel $mdl)
    {
        $want = self::mode($mdl) !== 'off' && is_dir(self::CONF_DIR) && self::conflict() === null;
        $text = "# Inversa Panel: device identity watch (Settings), written and removed by the panel\n" .
            'dhcp-script=' . self::SCRIPT . "\nscript-on-renewal\n";
        $has = is_file(self::CONF) ? (string)file_get_contents(self::CONF) : null;
        if ($want && $has !== $text) {
            file_put_contents(self::CONF, $text);
            return true;
        }
        if (!$want && $has !== null) {
            @unlink(self::CONF);
            return true;
        }
        return false;
    }

    public static function all()
    {
        $data = is_file(self::FILE) ? json_decode((string)file_get_contents(self::FILE), true) : [];
        return is_array($data) ? $data : [];
    }

    private static function save(array $data)
    {
        @mkdir(dirname(self::FILE), 0750, true);
        file_put_contents(self::FILE . '.tmp', json_encode($data));
        rename(self::FILE . '.tmp', self::FILE);
    }

    /**
     * what kind of device a fingerprint belongs to, roughly: apple | windows | android | linux | other
     */
    public static function kind($opts, $vendor)
    {
        $vendor = strtolower((string)$vendor);
        $list = array_filter(explode(',', (string)$opts), 'strlen');
        if (strpos($vendor, 'msft') === 0) {
            return 'windows';
        }
        if (strpos($vendor, 'android') === 0) {
            return 'android';
        }
        if (in_array('108', $list) || in_array('114', $list) || (in_array('252', $list) && in_array('95', $list))) {
            return 'apple';
        }
        if (in_array('249', $list) || in_array('252', $list)) {
            return 'windows';
        }
        if (strpos($vendor, 'udhcp') === 0 || strpos($vendor, 'dhcpcd') === 0 || in_array('121', $list) || in_array('119', $list)) {
            return 'linux';
        }
        return 'other';
    }

    /**
     * the lines dnsmasq's script wrote since the last look, oldest first:
     * [[time, mac, ip, name, vendor, options], ...]
     */
    private static function take()
    {
        if (!is_file(self::SPOOL)) {
            return [];
        }
        $work = self::SPOOL . '.work';
        if (!@rename(self::SPOOL, $work)) {
            return [];
        }
        $rows = [];
        foreach (explode("\n", (string)file_get_contents($work)) as $line) {
            $f = explode("\t", $line);
            if (count($f) >= 6 && preg_match('/^([0-9a-f]{2}:){5}[0-9a-f]{2}$/', strtolower($f[1]))) {
                $rows[] = [(int)$f[0], strtolower($f[1]), $f[2], mb_substr($f[3], 0, 64), mb_substr($f[4], 0, 64), mb_substr($f[5], 0, 200)];
            }
        }
        @unlink($work);
        return array_slice($rows, -2000);
    }

    /**
     * looks at what dnsmasq noted and at the devices seen now
     * @param array $hosts Approval::hosts() with 'dhcp' (the address in use came from DHCP)
     * @return int number of changes told (events written)
     */
    public static function process(InversaPanel $mdl, array $hosts)
    {
        $mode = self::mode($mdl);
        $rows = self::take();
        if ($mode === 'off') {
            return 0;
        }
        $now = time();
        $data = self::all();
        $approved = $mdl->getApprovedMacs();
        $nets = [];
        foreach ($hosts as $host) {
            $nets[$host['mac']] = $host['key'];
        }
        $changed = false;
        $tell = [];
        foreach ($rows as list($ts, $mac, $ip, $name, $vendor, $opts)) {
            if ($opts === '' && $vendor === '') {
                continue;
            }
            $fp = $opts . '|' . $vendor;
            $known = $data[$mac] ?? null;
            if ($known === null) {
                /* first time: learn */
                $data[$mac] = ['fp' => $fp, 'kind' => self::kind($opts, $vendor), 'name' => $name, 'first' => $ts, 'last' => $ts, 'dhcp' => true];
                $changed = true;
                continue;
            }
            $why = null;
            if ($fp !== $known['fp']) {
                /* the known one came back while another one was seen lately: two devices with one address */
                $why = !empty($known['other']) && $known['other']['fp'] !== $fp && $ts - (int)$known['other']['at'] < self::BOTH ? 'both' : 'fp';
                $data[$mac]['other'] = ['fp' => $fp, 'kind' => self::kind($opts, $vendor), 'name' => $name, 'at' => $ts];
            } elseif (!empty($known['other']) && $ts - (int)$known['other']['at'] < self::BOTH) {
                $why = 'both';
            } elseif ($name !== '' && $known['name'] !== '' && $name !== $known['name']) {
                $why = 'name';
                $data[$mac]['other'] = ['fp' => $fp, 'kind' => $known['kind'], 'name' => $name, 'at' => $ts];
            }
            $data[$mac]['last'] = $ts;
            $data[$mac]['dhcp'] = true;
            /* what "this is mine" accepts: the identity seen last */
            $data[$mac]['seen'] = ['fp' => $fp, 'kind' => self::kind($opts, $vendor), 'name' => $name];
            $changed = true;
            if ($why !== null) {
                $tell[$mac] = $why;
            }
        }
        /* an approved device that got its address by DHCP so far and now sets it itself */
        foreach ($hosts as $host) {
            $mac = $host['mac'];
            if (isset($data[$mac]) && !empty($data[$mac]['dhcp']) && isset($host['dhcp']) && $host['dhcp'] === false &&
                !empty($host['ips']) && in_array($mac, $approved) && !isset($tell[$mac])) {
                $tell[$mac] = 'manual';
                $data[$mac]['dhcp'] = false;
                $changed = true;
            }
        }
        $held = [];
        $told = 0;
        foreach ($tell as $mac => $why) {
            if ($now - (int)($data[$mac]['told'] ?? 0) < self::QUIET && ($data[$mac]['why'] ?? '') === $why) {
                continue;
            }
            $data[$mac]['told'] = $now;
            $data[$mac]['why'] = $why;
            $data[$mac]['alert'] = $now;
            $hold = $mode === 'hold' && $why !== 'name' && in_array($mac, $approved);
            Overview::event('id_change', ['mac' => $mac, 'net' => $nets[$mac] ?? '', 'why' => $why, 'held' => $hold ? 1 : 0]);
            $told++;
            if ($hold) {
                $held[] = $mac;
            }
            $changed = true;
        }
        if ($changed) {
            self::save($data);
        }
        if (!empty($held)) {
            foreach ($held as $mac) {
                $node = $mdl->getDeviceByMac($mac);
                if ($node !== null) {
                    $node->approved->setValue('0');
                    $node->approved_until->setValue('');
                }
            }
            Approval::store($mdl, $held);
        }
        return $told;
    }

    /**
     * "this is mine": the identity seen last becomes the known one, the alert goes
     */
    public static function accept($mac)
    {
        $data = self::all();
        if (!isset($data[$mac])) {
            return false;
        }
        $o = $data[$mac]['seen'] ?? null;
        if (!empty($o)) {
            $data[$mac]['fp'] = $o['fp'];
            $data[$mac]['kind'] = $o['kind'];
            if ($o['name'] !== '') {
                $data[$mac]['name'] = $o['name'];
            }
        }
        unset($data[$mac]['other'], $data[$mac]['alert'], $data[$mac]['why'], $data[$mac]['told']);
        $data[$mac]['dhcp'] = true;
        self::save($data);
        return true;
    }

    /* a deleted device: what was known about it goes */
    public static function forget($mac)
    {
        $data = self::all();
        if (isset($data[$mac])) {
            unset($data[$mac]);
            self::save($data);
        }
    }

    /**
     * for the device list: mac => [kind, name, first, alert, why, other kind, other name]
     */
    public static function summary()
    {
        $out = [];
        foreach (self::all() as $mac => $d) {
            $out[$mac] = [
                'kind' => $d['kind'] ?? 'other', 'name' => $d['name'] ?? '', 'first' => (int)($d['first'] ?? 0),
                'alert' => (int)($d['alert'] ?? 0), 'why' => $d['why'] ?? '',
                'other_kind' => $d['other']['kind'] ?? '', 'other_name' => $d['other']['name'] ?? '',
            ];
        }
        return $out;
    }

    /* the setting changed in "Apply": dnsmasq reads its files again */
    public static function restartDnsmasq()
    {
        (new Backend())->configdRun('dnsmasq restart');
    }
}
