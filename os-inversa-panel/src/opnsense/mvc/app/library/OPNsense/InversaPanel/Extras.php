<?php

/*
 * SPDX-License-Identifier: BSD-2-Clause
 * Copyright (C) 2026 Inversa Bilişim
 */

namespace OPNsense\InversaPanel;

use OPNsense\Core\Backend;
use OPNsense\Core\Config;
use OPNsense\Firewall\Alias;
use OPNsense\Firewall\Util;
use OPNsense\TrafficShaper\TrafficShaper;

/**
 * Country rules (GeoIP alias) and the speed limit of networks (traffic shaper), both written
 * to OPNsense's own models and tagged so Inversa Panel only touches what it created.
 */
class Extras
{
    /* ------------------------------------------------------------------ GeoIP */

    private static function geoAlias(Alias $aliases, $create)
    {
        foreach ($aliases->aliases->alias->iterateItems() as $node) {
            if ((string)$node->name === Catalog::GEO_ALIAS) {
                return $node;
            }
        }
        if (!$create) {
            return null;
        }
        $node = $aliases->aliases->alias->Add();
        $node->name->setValue(Catalog::GEO_ALIAS);
        $node->type->setValue('geoip');
        $node->proto->setValue('IPv4,IPv6');
        return $node;
    }

    /**
     * "allow only" mode: the alias of everything that may get in, the chosen countries plus the
     * addresses that belong to no country (Catalog::GEO_LOCAL). Removed again when the mode is off.
     */
    private static function geoAllowAlias(Alias $aliases, $on)
    {
        $found = null;
        $node = null;
        foreach ($aliases->aliases->alias->iterateItems() as $uuid => $item) {
            if ((string)$item->name === Catalog::GEO_ALLOW_ALIAS) {
                $found = $uuid;
                $node = $item;
                break;
            }
        }
        if (!$on) {
            if ($found !== null) {
                $aliases->aliases->alias->del($found);
            }
            return;
        }
        $node = $node ?? $aliases->aliases->alias->Add();
        $node->name->setValue(Catalog::GEO_ALLOW_ALIAS);
        $node->type->setValue('network');
        $node->enabled->setValue('1');
        $node->description->setValue('Inversa Panel: allowed countries and local addresses (managed by Inversa Panel)');
        $node->content->setValue(implode("\n", array_merge([Catalog::GEO_ALIAS], Catalog::GEO_LOCAL)));
        /* the nested alias may be new in this very model: let the validation look here, not in the stored config */
        Util::attachAliasObject($aliases);
    }

    /**
     * country data is on disk for at least one of these countries (the files GeoIP aliases are filled from)
     */
    public static function geoDataFor(array $countries)
    {
        foreach ($countries as $cc) {
            if (preg_match('/^[A-Z]{2}$/', $cc) && @filesize('/usr/local/share/GeoIP/alias/' . $cc . '-IPv4') > 0) {
                return true;
            }
        }
        return false;
    }

    public static function geoStatus()
    {
        $aliases = new Alias();
        $url = (string)$aliases->geoip->url;
        $stats = json_decode((new Backend())->configdRun('filter geoip stats'), true);
        $rules = json_decode((new Backend())->configdRun('filter rule stats'), true) ?? [];
        /* counters of the incoming block rule registered by inversapanel_firewall_geo() */
        $blocked = (int)($rules[md5('inversapanel-geo-in')]['packets'] ?? 0);
        $mdl = new InversaPanel();
        $allowed = $mdl->geo->allowed->getValues();
        /* without a source in OPNsense, Inversa Panel installs the free DB-IP Lite data itself */
        $dbip = null;
        if ($url === '' && is_file('/usr/local/share/GeoIP/inversapanel-dbip.json')) {
            $dbip = json_decode(file_get_contents('/usr/local/share/GeoIP/inversapanel-dbip.json'), true);
        }
        $count = $url === '' ? (int)($dbip['address_count'] ?? 0) : (is_array($stats) ? (int)($stats['address_count'] ?? 0) : 0);
        return [
            'source' => $url === '' ? 'dbip' : (strpos($url, 'download.maxmind.com') !== false ? 'maxmind' : 'other'),
            'database' => $url !== '' || $dbip !== null,
            'maxmind' => strpos($url, 'download.maxmind.com') !== false,
            /* only once addresses are loaded the alias blocks anything */
            'ready' => $count > 0,
            'addresses' => $count,
            'updated' => $url === '' ? ($dbip['timestamp'] ?? null) : (is_array($stats) ? ($stats['timestamp'] ?? null) : null),
            'month' => $dbip['month'] ?? null,
            'blocked_packets' => $blocked,
            /* "allow only" is not enforced before there is data for a country it lets in */
            'allow_data' => self::geoDataFor($allowed),
        ];
    }

    /**
     * keep the alias in line with the Inversa Panel geo settings; a license key sets the database URL,
     * but only when none is configured yet (or it is ours already)
     * @return array [Alias model, bool url_changed]
     */
    public static function syncGeo(InversaPanel $mdl, $licenseKey = '', ?Alias $aliases = null)
    {
        $aliases = $aliases ?? new Alias();
        $urlChanged = false;
        $current = (string)$aliases->geoip->url;
        if ($licenseKey !== '' && ($current === '' || strpos($current, 'download.maxmind.com') !== false)) {
            /*
             * MaxMind keys: legacy 16 alphanumerics, current ones end in "_mmk". Being strict here
             * keeps anything else (e.g. a password a browser filled in) out of a download URL.
             */
            if (!preg_match('/^([A-Za-z0-9]{16}|[A-Za-z0-9_]{16,60}_mmk)$/', $licenseKey)) {
                throw new \InvalidArgumentException('This does not look like a MaxMind license key');
            }
            $aliases->geoip->url->setValue(sprintf(Catalog::MAXMIND_URL, $licenseKey));
            $urlChanged = true;
        }
        $allow = (string)$mdl->geo->mode === 'allow';
        $countries = $allow ? $mdl->geo->allowed->getValues() : $mdl->geo->countries->getValues();
        $on = !$mdl->geo->enabled->isEmpty() && !empty($countries);
        $node = self::geoAlias($aliases, $on);
        if ($node !== null) {
            $node->enabled->setValue($on ? '1' : '0');
            $node->content->setValue(implode("\n", $countries));
            $node->description->setValue(sprintf('Inversa Panel: %s countries (managed by Inversa Panel)', $allow ? 'allowed' : 'blocked'));
        }
        self::geoAllowAlias($aliases, $on && $allow);
        return [$aliases, $urlChanged];
    }

    /* ------------------------------------------------------------------ speed limit of a network */

    /**
     * pipes + rules for every network that has a speed limit (download / upload of the whole network)
     */
    public static function syncShaper(InversaPanel $mdl)
    {
        $shaper = new TrafficShaper();
        /* remove what we created before, then recreate from the current settings */
        foreach ($shaper->rules->rule->iterateItems() as $uuid => $node) {
            if (strpos((string)$node->description, Catalog::SHAPER_PREFIX) === 0) {
                $shaper->rules->rule->del($uuid);
            }
        }
        foreach ($shaper->pipes->pipe->iterateItems() as $uuid => $node) {
            if (strpos((string)$node->description, Catalog::SHAPER_PREFIX) === 0) {
                $shaper->pipes->pipe->del($uuid);
            }
        }
        {
            $ifs = Config::getInstance()->object()->interfaces;
            foreach ($mdl->networks->network->iterateItems() as $net) {
                $key = (string)$net->interface;
                if ($net->limit->isEmpty() || $ifs->$key === null || !filter_var((string)$ifs->$key->ipaddr, FILTER_VALIDATE_IP)) {
                    continue;
                }
                $bits = (int)(string)$ifs->$key->subnet;
                $mask = (~0 << (32 - $bits)) & 0xffffffff;
                $cidr = long2ip(ip2long((string)$ifs->$key->ipaddr) & $mask) . '/' . $bits;
                $pipes = [];
                foreach (['down' => (string)$net->down, 'up' => (string)$net->up] as $dir => $mbit) {
                    $pipe = $shaper->pipes->pipe->Add();
                    $pipe->setNodes([
                        'number' => (string)$shaper->newPipeNumber(), 'enabled' => '1', 'bandwidth' => $mbit,
                        'bandwidthMetric' => 'Mbit', 'mask' => 'none',
                        'description' => Catalog::SHAPER_PREFIX . " {$key} {$dir}",
                    ]);
                    $pipes[$dir] = $pipe->getAttributes()['uuid'];
                }
                /* traffic leaving the firewall towards the network is its download */
                $shaper->rules->rule->Add()->setNodes([
                    'enabled' => '1', 'sequence' => '1', 'interface' => $key, 'proto' => 'ip', 'direction' => 'out',
                    'source' => 'any', 'destination' => $cidr, 'target' => $pipes['down'],
                    'description' => Catalog::SHAPER_PREFIX . " {$key} download",
                ]);
                $shaper->rules->rule->Add()->setNodes([
                    'enabled' => '1', 'sequence' => '2', 'interface' => $key, 'proto' => 'ip', 'direction' => 'in',
                    'source' => $cidr, 'destination' => 'any', 'target' => $pipes['up'],
                    'description' => Catalog::SHAPER_PREFIX . " {$key} upload",
                ]);
            }
        }
        return $shaper;
    }

    public static function applyShaper()
    {
        $backend = new Backend();
        $backend->configdRun('template reload OPNsense/Shaper');
        $backend->configdRun('template reload OPNsense/IPFW');
        $backend->configdRun('shaper reload');
        $backend->configdRun('ipfw reload');
    }
}
