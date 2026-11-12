<?php

/*
 * SPDX-License-Identifier: BSD-2-Clause
 * Copyright (C) 2026 Inversa Bilişim
 */

namespace OPNsense\InversaPanel;

use OPNsense\Core\Config;
use OPNsense\Unbound\Unbound;

/**
 * What a firewall that was configured before Inversa Panel came holds, in the panel's terms:
 * what the panel works with as it is ("ok"), what stays on OPNsense's own pages ("stays") and
 * what can get in the way of a feature ("warn"). Only reads; the page explains each finding.
 */
class Scan
{
    /* at most this many names per finding, the count says the rest */
    const NAMES = 8;
    /* at most this many lines where a finding is listed one by one */
    const LINES = 60;

    /**
     * one firewall rule in a line: where, what it does, what it is called (or from where to where)
     */
    private static function ruleLine($interface, $action, $descr, $source, $destination, $enabled)
    {
        $where = $interface !== '' ? strtoupper(str_replace(',', ', ', $interface)) : '*';
        $what = $descr !== '' ? $descr : ($source !== '' || $destination !== '' ? ($source ?: '*') . ' → ' . ($destination ?: '*') : '—');
        return $where . ' · ' . $action . ' · ' . $what . ($enabled ? '' : ' (off)');
    }

    private static function finding($id, $level, array $names, $page = '', $count = null)
    {
        $names = array_values(array_unique(array_filter(array_map('strval', $names), 'strlen')));
        return [
            'id' => $id,
            'level' => $level,
            'count' => $count ?? count($names),
            'names' => array_slice($names, 0, self::NAMES),
            'page' => $page,
        ];
    }

    /**
     * one check; a part of OPNsense that is missing or differs must not hide the other findings
     */
    private static function attempt(array &$out, callable $check)
    {
        try {
            foreach ($check() as $finding) {
                if ($finding !== null) {
                    $out[] = $finding;
                }
            }
        } catch (\Throwable $e) {
            syslog(LOG_NOTICE, 'inversapanel scan: ' . $e->getMessage());
        }
    }

    private static function describe($node, array $fields)
    {
        foreach ($fields as $field) {
            if ((string)$node->$field !== '') {
                return (string)$node->$field;
            }
        }
        return '';
    }

    public static function report(InversaPanel $mdl)
    {
        $cfg = Config::getInstance()->object();
        $out = [];

        /* --- internet connection and networks --- */
        self::attempt($out, function () use ($mdl) {
            $state = (new Network())->state($mdl);
            $usable = [];
            $locked = [];
            foreach ($state['networks'] as $net) {
                if ($net['readonly']) {
                    $locked[] = $net['name'];
                } else {
                    $usable[] = $net['name'] . ($net['ip'] !== '' ? ' (' . $net['ip'] . '/' . $net['subnet'] . ')' : '');
                }
            }
            $wan = $state['wan'];
            return [
                !empty($usable) ? self::finding('networks', 'ok', $usable, 'nets') : null,
                !empty($locked) ? self::finding('networks_locked', 'stays', $locked, 'nets') : null,
                !empty($wan['exists']) && in_array('multiwan', $wan['reasons']) ? self::finding('multiwan', 'warn', [], 'net', 1) : null,
                !empty($wan['exists']) && in_array('type', $wan['reasons']) ? self::finding('wan_type', 'stays', [], 'net', 1) : null,
            ];
        });

        /* --- fixed addresses, and who hands addresses out --- */
        self::attempt($out, function () use ($cfg) {
            $names = [];
            foreach (Dhcp::reservations() as $mac => $item) {
                if (!$item['ours']) {
                    $names[] = $item['ip'];
                }
            }
            $other = [];
            if (isset($cfg->dhcpd)) {
                foreach ($cfg->dhcpd->children() as $key => $node) {
                    if (isset($node->enable)) {
                        $other[] = 'ISC DHCP: ' . strtoupper($key);
                    }
                }
            }
            if (isset($cfg->OPNsense->Kea->dhcp4->general) && (string)$cfg->OPNsense->Kea->dhcp4->general->enabled === '1') {
                $other[] = 'Kea DHCP';
            }
            return [
                !empty($names) ? self::finding('reservations', 'ok', $names, 'devices') : null,
                !empty($other) ? self::finding('dhcp_other', 'warn', $other, 'devices') : null,
            ];
        });

        /* --- port forwards --- */
        self::attempt($out, function () {
            $simple = [];
            $complex = [];
            foreach ((new PortForward())->listRules() as $rule) {
                $name = $rule['name'] !== '' ? $rule['name'] : $rule['port'] . ' → ' . $rule['target'];
                if ($rule['simple']) {
                    $simple[] = $name;
                } else {
                    $complex[] = $name;
                }
            }
            return [
                !empty($simple) ? self::finding('forwards', 'ok', $simple, 'pf', count($simple)) : null,
                !empty($complex) ? self::finding('forwards_complex', 'stays', $complex, 'pf', count($complex)) : null,
            ];
        });

        /* --- DNS --- */
        self::attempt($out, function () use ($cfg) {
            $unbound = new Unbound();
            $names = array_map(fn($item) => $item['name'], Dns::foreign($unbound));
            $lists = [];
            foreach ($unbound->dnsbl->blocklist->iterateItems() as $item) {
                $descr = (string)$item->description;
                if ($descr !== Catalog::DNSBL_POLICY && strpos($descr, Catalog::SCHED_POLICY_PREFIX) !== 0 && !$item->enabled->isEmpty()) {
                    $lists[] = $descr !== '' ? $descr : '—';
                }
            }
            $other = [];
            if (isset($cfg->dnsmasq->enable) && in_array((string)$cfg->dnsmasq->port, ['', '53'])) {
                $other[] = 'Dnsmasq DNS';
            }
            $locked = Dns::locked($unbound);
            return [
                !empty($names) ? self::finding('dns_names', 'ok', $names, 'dns', count($names)) : null,
                $unbound->general->enabled->isEmpty() ? self::finding('unbound_off', 'warn', $other, 'filter', 1) : null,
                !empty($lists) ? self::finding('blocklists', 'warn', $lists, 'filter', count($lists)) : null,
                $locked !== null ? self::finding('dns_servers', 'stays', [], 'dns', 1) : null,
            ];
        });

        /* --- firewall rules and NAT made in OPNsense --- */
        self::attempt($out, function () use ($cfg) {
            $rules = 0;
            $lines = [];
            foreach ($cfg->filter->rule ?? [] as $rule) {
                $rules++;
                $lines[] = self::ruleLine((string)($rule->interface ?? ''), (string)($rule->type ?? 'pass'), (string)($rule->descr ?? ''), '', '', !isset($rule->disabled));
            }
            $nat = 0;
            if (class_exists('\OPNsense\Firewall\Filter')) {
                $filter = new \OPNsense\Firewall\Filter();
                foreach ($filter->rules->rule->iterateItems() as $rule) {
                    $rules++;
                    $lines[] = self::ruleLine(
                        (string)$rule->interface,
                        (string)$rule->action,
                        (string)$rule->description,
                        (string)$rule->source_net,
                        (string)$rule->destination_net,
                        !$rule->enabled->isEmpty()
                    );
                }
                foreach (['snatrules', 'onetoone', 'npt'] as $section) {
                    $nat += iterator_count($filter->$section->rule->iterateItems());
                }
            }
            foreach (['outbound', 'onetoone', 'npt'] as $section) {
                $nat += isset($cfg->nat->$section->rule) ? count($cfg->nat->$section->rule) : 0;
            }
            if (isset($cfg->nat->onetoone) && $cfg->nat->onetoone->count() > 0 && !isset($cfg->nat->onetoone->rule)) {
                $nat += count($cfg->nat->onetoone);
            }
            $mode = isset($cfg->nat->outbound->mode) ? (string)$cfg->nat->outbound->mode : 'automatic';
            $found = $rules > 0 ? self::finding('rules', 'stays', [], '', $rules) : null;
            if ($found !== null) {
                $found['lines'] = array_slice($lines, 0, self::LINES);
                $found['link'] = '/ui/firewall/filter';
            }
            $foundNat = $nat > 0 || !in_array($mode, ['automatic', '']) ? self::finding('nat', 'stays', [], '', max($nat, 1)) : null;
            if ($foundNat !== null) {
                $foundNat['link'] = '/ui/firewall/source_nat';
            }
            return [$found, $foundNat];
        });

        /* --- VPN --- */
        self::attempt($out, function () use ($mdl) {
            $owned = [];
            foreach ($mdl->vpns->connection->iterateItems() as $conn) {
                $owned[] = (string)$conn->server;
            }
            $names = [];
            foreach ((new \OPNsense\Wireguard\Server())->servers->server->iterateItems() as $uuid => $node) {
                if (!in_array($uuid, $owned)) {
                    $names[] = (string)$node->name;
                }
            }
            return [!empty($names) ? self::finding('wireguard', 'stays', $names, 'vpn', count($names)) : null];
        });
        self::attempt($out, function () use ($mdl) {
            if (!Ipsec::available()) {
                return [];
            }
            list(, $others) = (new Ipsec())->status($mdl);
            return [!empty($others) ? self::finding('ipsec', 'stays', $others, 'vpn', count($others)) : null];
        });
        self::attempt($out, function () use ($cfg) {
            $names = [];
            if (class_exists('\OPNsense\OpenVPN\OpenVPN')) {
                foreach ((new \OPNsense\OpenVPN\OpenVPN())->Instances->Instance->iterateItems() as $node) {
                    $names[] = self::describe($node, ['description']) ?: 'OpenVPN';
                }
            }
            foreach (['openvpn-server', 'openvpn-client'] as $kind) {
                foreach ($cfg->openvpn->$kind ?? [] as $node) {
                    $names[] = self::describe($node, ['description']) ?: 'OpenVPN';
                }
            }
            return [!empty($names) ? self::finding('openvpn', 'stays', $names, '', count($names)) : null];
        });

        /* --- attack protection, speed limits, other things that share the same ground --- */
        self::attempt($out, function () use ($mdl) {
            return [Ips::foreign($mdl) ? self::finding('ids', 'warn', [], 'ips', 1) : null];
        });
        self::attempt($out, function () {
            $found = array_filter(['/usr/local/zenarmor', '/usr/local/sensei'], 'is_dir');
            return [!empty($found) ? self::finding('zenarmor', 'warn', [], 'ips', 1) : null];
        });
        self::attempt($out, function () {
            $names = [];
            foreach ((new \OPNsense\TrafficShaper\TrafficShaper())->rules->rule->iterateItems() as $node) {
                if (strpos((string)$node->description, Catalog::SHAPER_PREFIX) !== 0) {
                    $names[] = self::describe($node, ['description']) ?: '—';
                }
            }
            return [!empty($names) ? self::finding('shaper', 'warn', $names, 'nets', count($names)) : null];
        });
        self::attempt($out, function () use ($cfg) {
            $names = [];
            foreach ($cfg->virtualip->vip ?? [] as $vip) {
                if ((string)$vip->mode === 'carp') {
                    $names[] = (string)$vip->subnet;
                }
            }
            $sync = isset($cfg->hasync->synchronizetoip) && (string)$cfg->hasync->synchronizetoip !== '';
            return [!empty($names) || $sync ? self::finding('ha', 'warn', $names, '', max(count($names), 1)) : null];
        });

        return $out;
    }

    /**
     * local names made in OPNsense become names the panel manages (they are edited on its DNS page from then on)
     * @return int how many
     */
    public static function adoptDnsNames()
    {
        $unbound = new Unbound();
        $count = 0;
        $taken = [];
        foreach (Dns::records($unbound) as $record) {
            $taken[$record['name']] = true;
        }
        foreach ($unbound->hosts->host->iterateItems() as $host) {
            if ((string)$host->description === Catalog::DNS_TAG || $host->enabled->isEmpty() || !in_array((string)$host->rr, ['A', 'AAAA'])) {
                continue;
            }
            $hostname = (string)$host->hostname;
            $domain = strtolower((string)$host->domain);
            $name = $hostname === '*' || $hostname === '' ? $domain : strtolower($hostname) . '.' . $domain;
            /* the panel keeps one address per name: a second record of a name stays where it is */
            if (isset($taken[$name])) {
                continue;
            }
            $taken[$name] = true;
            $host->description->setValue(Catalog::DNS_TAG);
            $count++;
        }
        if ($count > 0) {
            $unbound->serializeToConfig(false, true);
            Config::getInstance()->save();
        }
        return $count;
    }
}
