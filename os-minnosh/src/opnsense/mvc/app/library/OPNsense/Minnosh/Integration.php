<?php

/*
 * SPDX-License-Identifier: BSD-2-Clause
 * Copyright (C) 2026 Inversa Bilişim
 */

namespace OPNsense\Minnosh;

use OPNsense\Core\Backend;
use OPNsense\Core\Config;
use OPNsense\Firewall\Alias;
use OPNsense\Unbound\Unbound;

/**
 * Translates Minnosh's simple settings into OPNsense's own configuration
 * (firewall alias + Unbound blocklist policy) and applies them.
 *
 * Minnosh never keeps a parallel copy of firewall/DNS state: everything it changes
 * is visible (and editable) in the regular OPNsense pages.
 */
class Integration
{
    private $minnosh;
    private $messages = [];

    public function __construct(Minnosh $minnosh)
    {
        $this->minnosh = $minnosh;
    }

    public function getMessages()
    {
        return $this->messages;
    }

    /**
     * keep alias "minnosh_blocked" (type MAC) in sync with blocked devices
     * @return Alias model with pending changes
     */
    public function syncAlias(?Alias $aliasMdl = null)
    {
        $aliasMdl = $aliasMdl ?? new Alias();
        $node = null;
        foreach ($aliasMdl->aliases->alias->iterateItems() as $alias) {
            if ((string)$alias->name === Catalog::BLOCKED_ALIAS) {
                $node = $alias;
                break;
            }
        }
        if ($node === null) {
            $node = $aliasMdl->aliases->alias->Add();
            $node->name->setValue(Catalog::BLOCKED_ALIAS);
            $node->type->setValue('mac');
            $node->description->setValue('Minnosh: devices without internet access (managed by Minnosh)');
        }
        $node->enabled->setValue('1');
        $node->content->setValue(implode("\n", $this->minnosh->getBlockedMacs()));
        return $aliasMdl;
    }

    /**
     * keep the Minnosh blocklist policy and related general Unbound switches in sync
     * @return array [Unbound model, bool restart_required]
     */
    public function syncUnbound()
    {
        $unbound = new Unbound();
        $filtering = $this->minnosh->filtering;

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
        if (!$this->minnosh->general->dnsstats->isEmpty() && $unbound->general->stats->isEmpty()) {
            $unbound->general->stats->setValue('1');
            $restart = true;
        }
        if ($unbound->general->enabled->isEmpty()) {
            $this->messages[] = 'Unbound DNS is disabled, DNS based blocking will not work until it is enabled';
        }

        return [$unbound, $restart];
    }

    /**
     * write all models and apply runtime changes
     * @return array status
     */
    public function apply(array $options = [])
    {
        /* both aliases (blocked devices, countries) live in one Alias model: use one instance */
        $aliasMdl = $this->syncAlias();
        list($aliasMdl, $geoUrlChanged) = Extras::syncGeo($this->minnosh, (string)($options['geo_license'] ?? ''), $aliasMdl);
        list($unbound, $restartUnbound) = $this->syncUnbound();
        $shaper = Extras::syncShaper($this->minnosh);

        $this->minnosh->serializeToConfig();
        $aliasMdl->serializeToConfig();
        $unbound->serializeToConfig();
        $shaper->serializeToConfig(false, true);
        Config::getInstance()->save();

        $backend = new Backend();
        Extras::applyShaper();
        if ($geoUrlChanged) {
            $backend->configdRun('template reload OPNsense/Filter');
            $backend->configdRun('filter update geoip', true);
        }
        /* firewall: regenerate ruleset (our plugin hook adds the rules) and repopulate alias tables */
        $backend->configdRun('filter reload skip_alias');
        $backend->configdRun('template reload OPNsense/Filter');
        $backend->configdRun('filter refresh_aliases');
        /* drop existing connections of blocked devices, otherwise they keep working until timeout */
        $backend->configdRun('minnosh killstates');
        /* schedules take effect now instead of at the next minute */
        $backend->configdRun('minnosh schedule');

        /* dns: render config, restart only when global switches changed, refresh lists in background */
        $backend->configdRun('template reload OPNsense/Unbound/*');
        if ($restartUnbound) {
            $backend->configdRun('unbound restart');
        }
        /* same as "unbound dnsbl" + cache flush, so newly blocked domains stop resolving immediately */
        $backend->configdRun('minnosh dnsbl', true);

        return ['status' => 'ok', 'messages' => $this->messages];
    }
}
