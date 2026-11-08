<?php

/*
 * SPDX-License-Identifier: BSD-2-Clause
 * Copyright (C) 2026 Inversa Bilişim
 */

namespace OPNsense\Minnosh\Api;

use OPNsense\Base\ApiControllerBase;
use OPNsense\Minnosh\Catalog;
use OPNsense\Minnosh\Minnosh;

/**
 * Read the complete Minnosh configuration in the shape the single page UI uses.
 */
class StateController extends ApiControllerBase
{
    public function getAction()
    {
        $mdl = new Minnosh();

        $devices = [];
        foreach ($mdl->devices->device->iterateItems() as $device) {
            $devices[(string)$device->mac] = [
                'name' => (string)$device->name,
                'type' => (string)$device->type,
                'blocked' => !$device->blocked->isEmpty(),
            ];
        }

        $filtering = [];
        foreach (array_merge(array_keys(Catalog::CATEGORIES), ['safesearch', 'forcedns']) as $key) {
            $filtering[$key] = !$mdl->filtering->$key->isEmpty();
        }
        $filtering['apps'] = $mdl->filtering->apps->getValues();
        $filtering['allowlist'] = $mdl->filtering->allowlist->getValues();
        $filtering['denylist'] = $mdl->filtering->denylist->getValues();
        $filtering['response'] = (string)$mdl->filtering->response;

        $interfaces = [];
        foreach ($mdl->general->interfaces->getNodeData() as $key => $option) {
            $interfaces[] = ['key' => $key, 'name' => $option['value'], 'selected' => !empty($option['selected'])];
        }

        $apps = [];
        foreach ($mdl->filtering->apps->getNodeData() as $key => $option) {
            $apps[] = ['key' => $key, 'name' => $option['value']];
        }

        return [
            'general' => [
                'enabled' => !$mdl->general->enabled->isEmpty(),
                'language' => (string)$mdl->general->language,
                'interfaces' => $mdl->getProtectedInterfaces(),
                'dnsstats' => !$mdl->general->dnsstats->isEmpty(),
            ],
            'devices' => (object)$devices,
            'filtering' => $filtering,
            'options' => [
                'interfaces' => $interfaces,
                'apps' => $apps,
            ],
        ];
    }
}
