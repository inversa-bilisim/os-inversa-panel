<?php

/*
 * SPDX-License-Identifier: BSD-2-Clause
 * Copyright (C) 2026 Inversa Bilişim
 */

namespace OPNsense\Minnosh\Api;

use OPNsense\Base\ApiControllerBase;
use OPNsense\Base\UserException;
use OPNsense\Minnosh\Catalog;
use OPNsense\Minnosh\Integration;
use OPNsense\Minnosh\Minnosh;

/**
 * "Apply" button: store all pending UI changes at once and push them into OPNsense.
 */
class ServiceController extends ApiControllerBase
{
    const DEVICE_TYPES = ['phone', 'tablet', 'laptop', 'tv', 'console', 'printer', 'iot', 'server', 'unknown'];

    private static function flag($value)
    {
        return !empty($value) && $value !== 'false' ? '1' : '0';
    }

    private static function stringList($value)
    {
        if (!is_array($value)) {
            return [];
        }
        return array_values(array_unique(array_filter(array_map(
            fn($item) => strtolower(trim((string)$item)),
            $value
        ))));
    }

    public function applyAction()
    {
        if (!$this->request->isPost()) {
            return ['status' => 'failed'];
        }
        /* Minnosh writes firewall aliases, rules and DNS policy: same level as editing those directly */
        $this->throwReadOnly();
        $this->throwNotFullAdmin();

        $mdl = new Minnosh();

        $general = $this->request->getPost('general');
        if (is_array($general)) {
            if (isset($general['enabled'])) {
                $mdl->general->enabled->setValue(self::flag($general['enabled']));
            }
            if (isset($general['language'])) {
                $mdl->general->language->setValue((string)$general['language']);
            }
            if (isset($general['interfaces'])) {
                $mdl->general->interfaces->setValue(implode(',', self::stringList($general['interfaces'])));
            }
            if (isset($general['dnsstats'])) {
                $mdl->general->dnsstats->setValue(self::flag($general['dnsstats']));
            }
        }

        $filtering = $this->request->getPost('filtering');
        if (is_array($filtering)) {
            foreach (array_merge(array_keys(Catalog::CATEGORIES), ['safesearch', 'forcedns']) as $key) {
                if (isset($filtering[$key])) {
                    $mdl->filtering->$key->setValue(self::flag($filtering[$key]));
                }
            }
            if (isset($filtering['apps'])) {
                $mdl->filtering->apps->setValue(implode(',', self::stringList($filtering['apps'])));
            }
            foreach (['allowlist', 'denylist'] as $key) {
                if (isset($filtering[$key])) {
                    $mdl->filtering->$key->setValue(implode(',', self::stringList($filtering[$key])));
                }
            }
            if (isset($filtering['response'])) {
                $mdl->filtering->response->setValue((string)$filtering['response']);
            }
        }

        $devices = $this->request->getPost('devices');
        if (is_array($devices)) {
            foreach ($devices as $mac => $props) {
                $mac = strtolower((string)$mac);
                if (!preg_match('/^([0-9a-f]{2}:){5}[0-9a-f]{2}$/', $mac) || !is_array($props)) {
                    continue;
                }
                $node = $mdl->getDeviceByMac($mac);
                if ($node === null) {
                    $node = $mdl->devices->device->Add();
                    $node->mac->setValue($mac);
                }
                if (isset($props['name'])) {
                    $node->name->setValue(trim((string)$props['name']));
                }
                if (isset($props['type']) && in_array($props['type'], self::DEVICE_TYPES)) {
                    $node->type->setValue($props['type']);
                }
                if (isset($props['blocked'])) {
                    $node->blocked->setValue(self::flag($props['blocked']));
                }
            }
        }

        $validations = [];
        foreach ($mdl->performValidation() as $msg) {
            $validations[$msg->getField()] = $msg->getMessage();
        }
        if (!empty($validations)) {
            return ['status' => 'failed', 'validations' => $validations];
        }

        try {
            return (new Integration($mdl))->apply();
        } catch (\Exception $e) {
            throw new UserException($e->getMessage(), 'Minnosh');
        }
    }
}
