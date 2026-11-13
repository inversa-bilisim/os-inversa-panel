<?php

/*
 * SPDX-License-Identifier: BSD-2-Clause
 * Copyright (C) 2026 Inversa Bilişim
 */

namespace OPNsense\InversaPanel;

use OPNsense\Core\Backend;
use OPNsense\Core\Config;
use OPNsense\Firewall\Alias;
use OPNsense\Unbound\Unbound;

/**
 * Translates Inversa Panel's simple settings into OPNsense's own configuration
 * (firewall alias + Unbound blocklist policy) and applies them.
 *
 * Inversa Panel never keeps a parallel copy of firewall/DNS state: everything it changes
 * is visible (and editable) in the regular OPNsense pages.
 */
class Integration
{
    private $inversapanel;
    private $messages = [];

    public function __construct(InversaPanel $inversapanel)
    {
        $this->inversapanel = $inversapanel;
    }

    public function getMessages()
    {
        return $this->messages;
    }

    /**
     * create/update ($macs array) or remove ($macs null) a MAC alias
     */
    private static function macAlias(Alias $aliasMdl, $name, $descr, $macs)
    {
        $node = null;
        $found = null;
        foreach ($aliasMdl->aliases->alias->iterateItems() as $uuid => $alias) {
            if ((string)$alias->name === $name) {
                $node = $alias;
                $found = $uuid;
                break;
            }
        }
        if ($macs === null) {
            if ($found !== null) {
                $aliasMdl->aliases->alias->del($found);
            }
            return;
        }
        if ($node === null) {
            $node = $aliasMdl->aliases->alias->Add();
            $node->name->setValue($name);
            $node->type->setValue('mac');
            $node->description->setValue($descr);
        }
        $node->enabled->setValue('1');
        $node->content->setValue(implode("\n", $macs));
    }

    /**
     * keep the MAC aliases in sync: "inversapanel_blocked" (devices cut off) and, only while a network
     * asks for approval of new devices, "inversapanel_approved"
     * @return Alias model with pending changes
     */
    public function syncAlias(?Alias $aliasMdl = null)
    {
        $aliasMdl = $aliasMdl ?? new Alias();
        self::macAlias(
            $aliasMdl,
            Catalog::BLOCKED_ALIAS,
            'Inversa Panel: devices without internet access (managed by Inversa Panel)',
            $this->inversapanel->getBlockedMacs()
        );
        self::macAlias(
            $aliasMdl,
            Catalog::APPROVED_ALIAS,
            'Inversa Panel: approved devices on networks where new devices wait for approval (managed by Inversa Panel)',
            empty($this->inversapanel->getApprovalInterfaces()) ? null : $this->inversapanel->getApprovedMacs()
        );
        return $aliasMdl;
    }

    /* what the DNS blocklists are built from; when it stays the same there is nothing to refresh */
    private static function dnsSignature(Unbound $unbound)
    {
        $policy = null;
        foreach ($unbound->dnsbl->blocklist->iterateItems() as $item) {
            if ((string)$item->description === Catalog::DNSBL_POLICY) {
                $policy = [];
                foreach (['enabled', 'type', 'wildcards', 'allowlists', 'nxdomain'] as $field) {
                    $policy[] = (string)$item->$field;
                }
                break;
            }
        }
        return md5(json_encode([$policy, (string)$unbound->general->safesearch, (string)$unbound->general->stats]));
    }

    /**
     * keep the Inversa Panel blocklist policy and related general Unbound switches in sync
     * @return array [Unbound model, bool restart_required, bool changed]
     */
    public function syncUnbound()
    {
        $unbound = new Unbound();
        $before = self::dnsSignature($unbound);
        $filtering = $this->inversapanel->filtering;

        $policy = null;
        foreach ($unbound->dnsbl->blocklist->iterateItems() as $item) {
            if ((string)$item->description === Catalog::DNSBL_POLICY) {
                $policy = $item;
                break;
            }
        }
        if ($policy === null) {
            $policy = $unbound->dnsbl->blocklist->Add();
            $policy->description->setValue(Catalog::DNSBL_POLICY);
        }

        /* category switches => predefined list keys known by this OPNsense version */
        $available = array_keys($policy->type->getNodeData());
        $types = [];
        foreach (Catalog::CATEGORIES as $category => $keys) {
            if ($filtering->$category->isEmpty()) {
                continue;
            }
            foreach ($keys as $key) {
                if (in_array($key, $available)) {
                    $types[] = $key;
                } else {
                    $this->messages[] = sprintf('Unbound blocklist "%s" is not available on this OPNsense version', $key);
                }
            }
        }

        /* apps + "always block" => wildcard domains */
        $wildcards = [];
        foreach ($filtering->apps->getValues() as $app) {
            if (isset(Catalog::APPS[$app])) {
                $wildcards = array_merge($wildcards, Catalog::APPS[$app]);
            }
        }
        $wildcards = array_merge($wildcards, $filtering->denylist->getValues());
        $wildcards = array_values(array_unique(array_map('strtolower', $wildcards)));

        $allow = array_map([Catalog::class, 'allowPattern'], $filtering->allowlist->getValues());

        $active = !empty($types) || !empty($wildcards);
        $policy->enabled->setValue($active ? '1' : '0');
        $policy->type->setValue(implode(',', $types));
        $policy->wildcards->setValue(implode(',', $wildcards));
        $policy->allowlists->setValue(implode(',', $allow));
        $policy->nxdomain->setValue((string)$filtering->response === 'nxdomain' ? '1' : '0');

        /* global Unbound switches; only flip stats on, never silently turn the user's statistics off */
        $restart = false;
        $safesearch = $filtering->safesearch->isEmpty() ? '0' : '1';
        if ((string)$unbound->general->safesearch !== $safesearch) {
            $unbound->general->safesearch->setValue($safesearch);
            $restart = true;
        }
        if (!$this->inversapanel->general->dnsstats->isEmpty() && $unbound->general->stats->isEmpty()) {
            $unbound->general->stats->setValue('1');
            $restart = true;
        }
        if ($unbound->general->enabled->isEmpty()) {
            $this->messages[] = 'Unbound DNS is disabled, DNS based blocking will not work until it is enabled';
        }

        return [$unbound, $restart, self::dnsSignature($unbound) !== $before];
    }

    /**
     * write all models and apply runtime changes
     * @return array status
     */
    public function apply(array $options = [])
    {
        /* both aliases (blocked devices, countries) live in one Alias model: use one instance */
        $aliasMdl = $this->syncAlias();
        list($aliasMdl, $geoUrlChanged) = Extras::syncGeo($this->inversapanel, (string)($options['geo_license'] ?? ''), $aliasMdl);
        list($unbound, $restartUnbound, $dnsChanged) = $this->syncUnbound();
        /* DNS page: local names (when the page sent them) and the servers Unbound asks; both need a restart */
        if (is_array($options['dns_records'] ?? null) && Dns::setRecords($unbound, $options['dns_records'])) {
            $restartUnbound = true;
        }
        if (Dns::syncServers($this->inversapanel, $unbound)) {
            $restartUnbound = true;
        }
        $shaper = Extras::syncShaper($this->inversapanel);
        /* throws before anything is saved when the settings cannot work here */
        $ips = Ips::sync($this->inversapanel, !empty($options['ips_was_on']));

        $this->inversapanel->serializeToConfig();
        $aliasMdl->serializeToConfig();
        $unbound->serializeToConfig();
        $shaper->serializeToConfig(false, true);
        if ($ips !== null) {
            if ($ips['cron'] !== null) {
                $ips['cron']->serializeToConfig();
            }
            /* validated in Ips::sync(); the model in memory does not know a cron job created just now */
            $ips['ids']->serializeToConfig(false, true);
        }
        Config::getInstance()->save();

        $backend = new Backend();
        /* device identity watch: dnsmasq's lease script is set up or removed (a restart takes a second) */
        if (Identity::syncConf($this->inversapanel)) {
            $backend->configdRun('dnsmasq restart');
        }
        if (Identity::mode($this->inversapanel) !== 'off' && Identity::conflict() !== null) {
            $this->messages[] = 'Device identity watch: another lease script is set up in dnsmasq (' . Identity::conflict() . '); the panel left it as it is and does not watch.';
        }
        Extras::applyShaper();
        if ($geoUrlChanged) {
            /* a source set in OPNsense (MaxMind key): fetched in the background, the rules are loaded again after it */
            $backend->configdRun('template reload OPNsense/Filter');
            $backend->configdRun('inversapanel geoupdate', true);
        } elseif (!$this->inversapanel->geo->enabled->isEmpty() && (string)$aliasMdl->geoip->url === '') {
            /* no source configured in OPNsense: free DB-IP data (fetched once, then monthly) */
            $backend->configdpRun('inversapanel geoip', ['normal'], true);
        }
        /* firewall: regenerate ruleset (our plugin hook adds the rules) and repopulate alias tables */
        $backend->configdRun('filter reload skip_alias');
        $backend->configdRun('template reload OPNsense/Filter');
        $backend->configdRun('filter refresh_aliases');
        /*
         * drop existing connections of blocked devices and of devices that just lost their
         * approval ($options['kill']), otherwise they keep working until timeout
         */
        $kill = array_filter((array)($options['kill'] ?? []), fn($ip) => filter_var($ip, FILTER_VALIDATE_IP));
        $backend->configdpRun('inversapanel killstates', [empty($kill) ? '-' : implode(',', $kill)]);
        /* schedules take effect now instead of at the next minute */
        $backend->configdRun('inversapanel schedule');

        /*
         * dns: render config, restart only when global switches changed, refresh lists in background.
         * Only when the DNS blocking settings changed (or the lists were never built): a refresh
         * takes about a gigabyte of memory for a while, too much to spend on every "Apply".
         */
        $refreshLists = $dnsChanged || !is_file('/var/unbound/data/dnsbl.json');
        if ($refreshLists || $restartUnbound) {
            $backend->configdRun('template reload OPNsense/Unbound/*');
            if ($restartUnbound) {
                $backend->configdRun('unbound restart');
            }
            if ($refreshLists) {
                /* same as "unbound dnsbl" + cache flush, so newly blocked domains stop resolving immediately */
                $backend->configdRun('inversapanel dnsbl', true);
            }
        }

        /* Suricata: only touched when something it depends on changed (a restart interrupts inspection) */
        if ($ips !== null && $ips['changed']) {
            Ips::reconfigure($ips['cron'] !== null);
        }

        return ['status' => 'ok', 'messages' => $this->messages];
    }
}
