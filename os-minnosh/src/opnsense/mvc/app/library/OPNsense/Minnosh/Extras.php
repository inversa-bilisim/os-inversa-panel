<?php

/*
 * SPDX-License-Identifier: BSD-2-Clause
 * Copyright (C) 2026 Inversa Bilişim
 */

namespace OPNsense\Minnosh;

use OPNsense\Core\Backend;
use OPNsense\Core\Config;
use OPNsense\Firewall\Alias;
use OPNsense\TrafficShaper\TrafficShaper;

/**
 * Country blocking (GeoIP alias) and the guest speed limit (traffic shaper), both written
 * to OPNsense's own models and tagged so Minnosh only touches what it created.
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
        $node->description->setValue('Minnosh: blocked countries (managed by Minnosh)');
        return $node;
    }

    public static function geoStatus()
    {
        $aliases = new Alias();
        $url = (string)$aliases->geoip->url;
        $stats = json_decode((new Backend())->configdRun('filter geoip stats'), true);
        $rules = json_decode((new Backend())->configdRun('filter rule stats'), true) ?? [];
        /* counters of the incoming block rule registered by minnosh_firewall_geo() */
        $blocked = (int)($rules[md5('minnosh-geo-in')]['packets'] ?? 0);
        return [
            'database' => $url !== '',
            'maxmind' => strpos($url, 'download.maxmind.com') !== false,
            'stats' => is_array($stats) ? $stats : null,
            'blocked_packets' => $blocked,
        ];
    }

    /**
     * keep the alias in line with the Minnosh geo settings; a license key sets the database URL,
     * but only when none is configured yet (or it is ours already)
     * @return array [Alias model, bool url_changed]
     */
    public static function syncGeo(Minnosh $mdl, $licenseKey = '', ?Alias $aliases = null)
    {
        $aliases = $aliases ?? new Alias();
        $urlChanged = false;
        $current = (string)$aliases->geoip->url;
        if ($licenseKey !== '' && ($current === '' || strpos($current, 'download.maxmind.com') !== false)) {
            if (!preg_match('/^[A-Za-z0-9_]{6,64}$/', $licenseKey)) {
                throw new \InvalidArgumentException('invalid MaxMind license key');
            }
            $aliases->geoip->url->setValue(sprintf(Catalog::MAXMIND_URL, $licenseKey));
            $urlChanged = true;
        }
        $countries = $mdl->geo->countries->getValues();
        $on = !$mdl->geo->enabled->isEmpty() && !empty($countries);
        $node = self::geoAlias($aliases, $on);
        if ($node !== null) {
            $node->enabled->setValue($on ? '1' : '0');
            $node->content->setValue(implode("\n", $countries));
        }
        return [$aliases, $urlChanged];
    }

    /* ------------------------------------------------------------------ guest speed limit */

    /**
     * pipes + rules limiting every guest network (shared download/upload limit per network)
     */
    public static function syncShaper(Minnosh $mdl)
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
        if (!$mdl->guest->limit->isEmpty()) {
            $ifs = Config::getInstance()->object()->interfaces;
            foreach ($mdl->networks->network->iterateItems() as $net) {
                $key = (string)$net->interface;
                if ((string)$net->kind !== 'guest' || $ifs->$key === null || !filter_var((string)$ifs->$key->ipaddr, FILTER_VALIDATE_IP)) {
                    continue;
                }
                $bits = (int)(string)$ifs->$key->subnet;
                $mask = (~0 << (32 - $bits)) & 0xffffffff;
                $cidr = long2ip(ip2long((string)$ifs->$key->ipaddr) & $mask) . '/' . $bits;
                $pipes = [];
                foreach (['down' => (string)$mdl->guest->down, 'up' => (string)$mdl->guest->up] as $dir => $mbit) {
                    $pipe = $shaper->pipes->pipe->Add();
                    $pipe->setNodes([
                        'number' => (string)$shaper->newPipeNumber(), 'enabled' => '1', 'bandwidth' => $mbit,
                        'bandwidthMetric' => 'Mbit', 'mask' => 'none',
                        'description' => Catalog::SHAPER_PREFIX . " {$key} {$dir}",
                    ]);
                    $pipes[$dir] = $pipe->getAttributes()['uuid'];
                }
                /* traffic leaving the firewall towards guests is their download */
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
