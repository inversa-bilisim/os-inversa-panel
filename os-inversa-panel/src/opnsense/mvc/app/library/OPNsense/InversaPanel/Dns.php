<?php

/*
 * SPDX-License-Identifier: BSD-2-Clause
 * Copyright (C) 2026 Inversa Bilişim
 */

namespace OPNsense\InversaPanel;

use OPNsense\Core\Backend;
use OPNsense\Unbound\Unbound;

/**
 * DNS page: local names (a name answered with an address of the internal network) and the servers
 * the firewall asks. Both live in OPNsense's own Unbound model, as host overrides and as forward /
 * DNS over TLS entries, described Catalog::DNS_TAG so Inversa Panel only touches what it created.
 */
class Dns
{
    const NAME = '/^(?=.{1,253}$)(?:[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?\.)*[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?$/';
    const MAX_RECORDS = 200;

    /**
     * a name as typed ("*.Example.com.", "example.com") => "example.com"
     */
    public static function cleanName($name)
    {
        return preg_replace('/^\*\./', '', rtrim(strtolower(trim((string)$name)), '.'));
    }

    /**
     * the name an address override answers for, and whether it covers the names below it too
     * @return array [name, wildcard]
     */
    private static function overrideName($host)
    {
        $hostname = (string)$host->hostname;
        $domain = strtolower((string)$host->domain);
        if ($hostname === '*') {
            return [$domain, true];
        }
        return [$hostname === '' ? $domain : strtolower($hostname) . '.' . $domain, false];
    }

    private static function isAddress($host)
    {
        return in_array((string)$host->rr, ['A', 'AAAA']);
    }

    /**
     * the local names Inversa Panel manages
     * @return array [[name, ip, wildcard]]
     */
    public static function records(Unbound $unbound)
    {
        $result = [];
        foreach ($unbound->hosts->host->iterateItems() as $host) {
            if ((string)$host->description === Catalog::DNS_TAG && self::isAddress($host)) {
                list($name, $wildcard) = self::overrideName($host);
                $result[] = ['name' => $name, 'ip' => (string)$host->server, 'wildcard' => $wildcard];
            }
        }
        usort($result, fn($a, $b) => strcmp($a['name'], $b['name']));
        return $result;
    }

    /**
     * address overrides made in OPNsense itself (Services > Unbound DNS > Overrides): shown, never changed
     */
    public static function foreign(Unbound $unbound)
    {
        $result = [];
        foreach ($unbound->hosts->host->iterateItems() as $host) {
            if ((string)$host->description !== Catalog::DNS_TAG && self::isAddress($host) && !$host->enabled->isEmpty()) {
                list($name, $wildcard) = self::overrideName($host);
                $result[] = ['name' => $name, 'ip' => (string)$host->server, 'wildcard' => $wildcard];
            }
        }
        usort($result, fn($a, $b) => strcmp($a['name'], $b['name']));
        return $result;
    }

    /**
     * @param mixed $records what the page sent: [[name, ip, wildcard]]
     * @return string|null what is wrong with them
     */
    public static function validateRecords($records, Unbound $unbound)
    {
        if (!is_array($records) || count($records) > self::MAX_RECORDS) {
            return 'too many local names';
        }
        $taken = [];
        foreach (self::foreign($unbound) as $item) {
            $taken[$item['name']] = 'is already answered by an override made in OPNsense (Services > Unbound DNS > Overrides)';
        }
        foreach ($records as $record) {
            $name = is_array($record) ? self::cleanName($record['name'] ?? '') : '';
            $ip = is_array($record) ? trim((string)($record['ip'] ?? '')) : '';
            if (!preg_match(self::NAME, $name)) {
                return sprintf('"%s" is not a valid name', $name);
            }
            if (!filter_var($ip, FILTER_VALIDATE_IP)) {
                return sprintf('"%s" is not a valid IP address (%s)', $ip, $name);
            }
            if (isset($taken[$name])) {
                return sprintf('"%s" %s', $name, $taken[$name]);
            }
            $taken[$name] = 'is listed twice';
        }
        return null;
    }

    /**
     * make the managed host overrides equal to $records (validated with validateRecords())
     * @return bool something changed
     */
    public static function setRecords(Unbound $unbound, array $records)
    {
        $want = [];
        foreach ($records as $record) {
            $want[self::cleanName($record['name'])] = [trim((string)$record['ip']), !empty($record['wildcard']) && $record['wildcard'] !== 'false'];
        }
        $changed = false;
        foreach (iterator_to_array($unbound->hosts->host->iterateItems()) as $uuid => $host) {
            if ((string)$host->description !== Catalog::DNS_TAG || !self::isAddress($host)) {
                continue;
            }
            list($name, $wildcard) = self::overrideName($host);
            if (isset($want[$name]) && $want[$name] === [(string)$host->server, $wildcard] && !$host->enabled->isEmpty()) {
                unset($want[$name]);
            } else {
                $unbound->hosts->host->del($uuid);
                $changed = true;
            }
        }
        foreach ($want as $name => list($ip, $wildcard)) {
            $labels = explode('.', $name);
            $host = $unbound->hosts->host->Add();
            if ($wildcard) {
                /* Unbound "redirect" zone: the name itself and everything below it */
                $host->hostname->setValue('*');
                $host->domain->setValue($name);
            } elseif (count($labels) > 1) {
                $host->hostname->setValue(array_shift($labels));
                $host->domain->setValue(implode('.', $labels));
            } else {
                $host->hostname->setValue('');
                $host->domain->setValue($name);
            }
            $host->enabled->setValue('1');
            $host->rr->setValue(strpos($ip, ':') !== false ? 'AAAA' : 'A');
            $host->server->setValue($ip);
            /* the address keeps the name it has (DHCP, another override): no reverse entry */
            $host->addptr->setValue('0');
            $host->description->setValue(Catalog::DNS_TAG);
            $changed = true;
        }
        return $changed;
    }

    /**
     * Why the DNS servers cannot be chosen here: forwarding for all names is set up in OPNsense
     * itself, a second one would make Unbound's configuration invalid.
     * @return string|null "system" (use system nameservers) | "forward" (own forward / DNS over TLS entries)
     */
    public static function locked(Unbound $unbound)
    {
        if (!$unbound->forwarding->enabled->isEmpty()) {
            return 'system';
        }
        foreach ($unbound->dots->dot->iterateItems() as $dot) {
            if ((string)$dot->description !== Catalog::DNS_TAG && !$dot->enabled->isEmpty() && in_array((string)$dot->domain, ['', '.'])) {
                return 'forward';
            }
        }
        return null;
    }

    /**
     * the servers the settings ask for
     * @return array [[addresses], name of their certificate, DNS over TLS]; no addresses = "auto"
     */
    public static function servers(InversaPanel $mdl)
    {
        $mode = (string)$mdl->dns->upstream;
        $dot = !$mdl->dns->dot->isEmpty();
        if (isset(Catalog::DNS_PRESETS[$mode])) {
            return [Catalog::DNS_PRESETS[$mode]['servers'], Catalog::DNS_PRESETS[$mode]['tls'], $dot];
        }
        if ($mode === 'custom') {
            return [array_values(array_filter($mdl->dns->servers->getValues())), (string)$mdl->dns->tlsname, $dot];
        }
        return [[], '', false];
    }

    /**
     * one string for "which servers, how": differs when the choice changed
     */
    public static function signature(InversaPanel $mdl)
    {
        list($servers, $tls, $dot) = self::servers($mdl);
        return empty($servers) ? '' : implode(',', $servers) . '|' . ($dot ? 'dot|' . $tls : 'plain');
    }

    /**
     * make the managed forward / DNS over TLS entries equal to the settings
     * @return bool something changed
     */
    public static function syncServers(InversaPanel $mdl, Unbound $unbound)
    {
        list($servers, $tls, $dot) = self::servers($mdl);
        if (self::locked($unbound) !== null) {
            /* set up in OPNsense in the meantime: step aside */
            $servers = [];
        }
        $want = [];
        foreach ($servers as $server) {
            $want[] = [$dot ? 'dot' : 'forward', $server, $dot ? '853' : '', $dot ? $tls : ''];
        }
        $own = [];
        $have = [];
        foreach ($unbound->dots->dot->iterateItems() as $uuid => $node) {
            if ((string)$node->description === Catalog::DNS_TAG) {
                $own[] = $uuid;
                $have[] = [(string)$node->type, (string)$node->server, (string)$node->port, (string)$node->verify];
            }
        }
        if ($have === $want) {
            return false;
        }
        foreach ($own as $uuid) {
            $unbound->dots->dot->del($uuid);
        }
        foreach ($want as list($type, $server, $port, $verify)) {
            $node = $unbound->dots->dot->Add();
            $node->enabled->setValue('1');
            $node->type->setValue($type);
            $node->server->setValue($server);
            $node->port->setValue($port);
            $node->verify->setValue($verify);
            $node->description->setValue(Catalog::DNS_TAG);
        }
        return true;
    }

    /**
     * ask each of the servers a question, the way Unbound would
     * @return array [address => bool answered]
     */
    public static function check(InversaPanel $mdl)
    {
        list($servers, $tls, $dot) = self::servers($mdl);
        if (empty($servers)) {
            return [];
        }
        $out = (new Backend())->configdpRun('inversapanel dnscheck', [implode(',', $servers), $dot ? 'dot' : 'plain', $tls !== '' ? $tls : '-']);
        $result = json_decode((string)$out, true);
        $answers = [];
        foreach ($servers as $server) {
            $answers[$server] = is_array($result) && !empty($result[$server]['ok']);
        }
        return $answers;
    }
}
