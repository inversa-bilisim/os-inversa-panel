<?php

/*
 * SPDX-License-Identifier: BSD-2-Clause
 * Copyright (C) 2026 Inversa Bilişim
 */

namespace OPNsense\InversaPanel\Api;

use OPNsense\Base\ApiControllerBase;
use OPNsense\Base\UserException;
use OPNsense\Core\Backend;
use OPNsense\Core\Config;
use OPNsense\InversaPanel\InversaPanel;
use OPNsense\InversaPanel\Vpn;
use OPNsense\Unbound\Unbound;

/**
 * The logs pages: attacks, internet history, logins and changes (scripts/.../logs.py does the reading).
 */
class LogsController extends ApiControllerBase
{
    private function query(array $request)
    {
        foreach (['q', 'kind', 'result', 'type'] as $key) {
            $request[$key] = mb_substr((string)$this->request->get($key), 0, 100);
        }
        foreach (['days', 'hours', 'limit', 'offset'] as $key) {
            if ($this->request->get($key) !== null) {
                $request[$key] = (int)$this->request->get($key);
            }
        }
        /* what the page knows by name (a device, a country, a service) arrives as addresses / codes / ports */
        foreach (['clients', 'q_dst', 'q_cc', 'q_ports'] as $key) {
            $list = array_filter(explode(',', (string)$this->request->get($key)), fn($v) => preg_match('/^[0-9A-Za-z.:]{1,45}$/', $v));
            $request[$key] = array_slice(array_values($list), 0, 50);
        }
        $request['q_ports'] = array_map('intval', $request['q_ports']);
        $answer = json_decode((string)(new Backend())->configdpRun('inversapanel logs', [base64_encode(json_encode($request))]), true);
        return is_array($answer) ? $answer : ['error' => 'no answer'];
    }

    private static function settings(InversaPanel $mdl)
    {
        return [
            'history' => !$mdl->logs->history->isEmpty(),
            'networks' => array_values(array_intersect($mdl->logs->networks->getValues(), $mdl->getProtectedInterfaces())),
            /* OPNsense's DNS statistics are what the history is read from */
            'dnsstats' => !(new Unbound())->general->stats->isEmpty(),
            'blocked' => array_values(array_filter($mdl->logs->blocked->getValues())),
        ];
    }

    public function attacksAction()
    {
        $mdl = new InversaPanel();
        return array_merge($this->query(['what' => 'attacks']), ['blocked' => self::settings($mdl)['blocked']]);
    }

    public function historyAction()
    {
        $settings = self::settings(new InversaPanel());
        if (!$settings['history'] || !$settings['dnsstats']) {
            return ['settings' => $settings, 'rows' => [], 'total' => 0];
        }
        $networks = [];
        foreach ($settings['networks'] as $key) {
            $cidr = Vpn::interfaceNetwork($key);
            if ($cidr !== null) {
                $networks[] = $cidr;
            }
        }
        return array_merge($this->query(['what' => 'history', 'networks' => $networks]), ['settings' => $settings]);
    }

    public function eventsAction()
    {
        return $this->query(['what' => 'events']);
    }

    private function guard()
    {
        if (!$this->request->isPost()) {
            throw new UserException('POST required', 'Inversa Panel');
        }
        $this->throwReadOnly();
    }

    /**
     * whether the internet history is shown at all, and for which networks
     */
    public function historysetAction()
    {
        $this->guard();
        $mdl = new InversaPanel();
        $networks = $this->request->getPost('networks');
        $networks = array_intersect(is_array($networks) ? $networks : [], $mdl->getProtectedInterfaces());
        $mdl->logs->history->setValue(empty($this->request->getPost('history')) ? '0' : '1');
        $mdl->logs->networks->setValue(implode(',', $networks));
        $mdl->serializeToConfig(false, true);
        Config::getInstance()->save();
        return ['status' => 'ok', 'settings' => self::settings($mdl)];
    }

    /**
     * refuse (or no longer refuse) an address from the internet
     */
    public function blockAction()
    {
        $this->guard();
        $mdl = new InversaPanel();
        $ip = trim((string)$this->request->getPost('ip'));
        if (!filter_var($ip, FILTER_VALIDATE_IP)) {
            return ['status' => 'failed', 'message' => 'invalid address'];
        }
        $list = array_values(array_filter($mdl->logs->blocked->getValues()));
        if (empty($this->request->getPost('remove'))) {
            /* never the address this request comes from */
            if ($ip === $this->request->getClientAddress()) {
                return ['status' => 'failed', 'message' => 'this is the address you are connected from'];
            }
            if (!in_array($ip, $list)) {
                $list[] = $ip;
            }
            if (count($list) > 500) {
                return ['status' => 'failed', 'message' => 'at most 500 blocked addresses'];
            }
        } else {
            $list = array_values(array_diff($list, [$ip]));
        }
        $mdl->logs->blocked->setValue(implode(',', $list));
        $mdl->serializeToConfig(false, true);
        Config::getInstance()->save();
        $backend = new Backend();
        $backend->configdRun('filter reload');
        if (empty($this->request->getPost('remove'))) {
            $backend->configdpRun('inversapanel killstates', [$ip]);
        }
        return ['status' => 'ok', 'blocked' => $list];
    }
}
