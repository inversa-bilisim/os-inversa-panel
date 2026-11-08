<?php

/*
 * SPDX-License-Identifier: BSD-2-Clause
 * Copyright (C) 2026 Inversa Bilişim
 */

namespace OPNsense\Minnosh\Api;

use OPNsense\Base\ApiControllerBase;
use OPNsense\Base\UserException;
use OPNsense\Core\Backend;
use OPNsense\Core\Config;
use OPNsense\Interfaces\Vlan;
use OPNsense\Minnosh\Minnosh;
use OPNsense\Minnosh\Network;
use OPNsense\Minnosh\Rollback;

/**
 * Internet connection, networks and ports. Every change is protected by Rollback:
 * it is reverted automatically unless confirmed (POST confirm) in time.
 */
class NetworkController extends ApiControllerBase
{
    public function getAction()
    {
        $state = (new Network())->state(new Minnosh());
        $state['rollback'] = Rollback::pending();
        return $state;
    }

    public function testAction()
    {
        return json_decode((new Backend())->configdRun('minnosh nettest'), true) ?? ['ok' => false];
    }

    public function confirmAction()
    {
        if (!$this->request->isPost()) {
            return ['status' => 'failed'];
        }
        $this->throwReadOnly();
        return ['status' => Rollback::confirm() ? 'confirmed' : 'nothing'];
    }

    public function applyAction()
    {
        if (!$this->request->isPost()) {
            return ['status' => 'failed'];
        }
        $this->throwReadOnly();
        $this->throwNotFullAdmin();
        if (Rollback::pending() !== null) {
            return ['status' => 'failed', 'message' => 'confirm or wait for the previous network change first'];
        }

        $wan = $this->request->getPost('wan');
        $add = $this->request->getPost('add');
        $update = $this->request->getPost('update');
        $delete = $this->request->getPost('delete');

        $backup = Rollback::prepare();
        $net = new Network();
        $mdl = new Minnosh();
        $vlans = new Vlan();
        $keys = [];
        try {
            if (is_array($wan)) {
                $keys = array_merge($keys, $net->setWan($wan, $vlans));
            }
            foreach (is_array($add) ? $add : [] as $item) {
                if (!is_array($item)) {
                    continue;
                }
                $key = $net->addNetwork($item, $vlans);
                $keys[] = $key;
                $node = $mdl->networks->network->Add();
                $node->interface->setValue($key);
                $node->kind->setValue((string)($item['kind'] ?? 'home'));
                $node->created->setValue('1');
                $mdl->general->interfaces->setValue(implode(',', array_unique(array_merge($mdl->getProtectedInterfaces(), [$key]))));
                /*
                 * safe defaults: a new network reaches the internet but no other network; home
                 * networks may reach new IoT/camera/server networks (to use those devices)
                 */
                $kind = (string)($item['kind'] ?? 'home');
                $kinds = [];
                foreach ($mdl->networks->network->iterateItems() as $n) {
                    $kinds[(string)$n->interface] = (string)$n->kind;
                }
                foreach ($mdl->getProtectedInterfaces() as $other) {
                    if ($other === $key) {
                        continue;
                    }
                    $otherHome = ($kinds[$other] ?? 'home') === 'home';
                    foreach ([[$key, $other, false], [$other, $key, $otherHome && in_array($kind, ['iot', 'camera', 'server'])]] as $pair) {
                        $rule = $mdl->access->rule->Add();
                        $rule->from->setValue($pair[0]);
                        $rule->to->setValue($pair[1]);
                        $rule->allow->setValue($pair[2] ? '1' : '0');
                    }
                }
                $rule = $mdl->access->rule->Add();
                $rule->from->setValue($key);
                $rule->to->setValue('wan');
                $rule->allow->setValue('1');
            }
            foreach (is_array($update) ? $update : [] as $key => $item) {
                if (is_array($item) && preg_match('/^(lan|opt[0-9]+)$/', (string)$key)) {
                    $net->updateNetwork((string)$key, $item);
                    $keys[] = (string)$key;
                }
            }
            foreach (is_array($delete) ? $delete : [] as $key) {
                $key = (string)$key;
                $owned = false;
                foreach ($mdl->networks->network->iterateItems() as $uuid => $node) {
                    if ((string)$node->interface === $key && !$node->created->isEmpty()) {
                        $owned = true;
                        $mdl->networks->network->del($uuid);
                    }
                }
                if (!$owned) {
                    throw new \InvalidArgumentException("$key was not created by Minnosh and can only be removed in OPNsense");
                }
                foreach ($mdl->access->rule->iterateItems() as $uuid => $node) {
                    if ((string)$node->from === $key || (string)$node->to === $key) {
                        $mdl->access->rule->del($uuid);
                    }
                }
                $mdl->general->interfaces->setValue(implode(',', array_diff($mdl->getProtectedInterfaces(), [$key])));
                $net->deleteNetwork($key, $vlans);
            }

            $messages = [];
            foreach ($vlans->performValidation() as $msg) {
                $messages[] = $msg->getField() . ': ' . $msg->getMessage();
            }
            if (!empty($messages)) {
                throw new \InvalidArgumentException(implode("\n", $messages));
            }
            $vlans->serializeToConfig();
            /*
             * Minnosh's own values here are set by this code, not by the user; its interface field
             * caches the interface list from before this request (a new optN would look invalid)
             */
            $mdl->serializeToConfig(false, true);
            Config::getInstance()->save();
        } catch (\Exception $e) {
            /* nothing applied yet: just drop the in-memory changes */
            Config::getInstance()->forceReload();
            throw new UserException($e->getMessage(), 'Minnosh');
        }

        $net->apply($keys);
        $state = Rollback::arm($backup);
        return ['status' => 'confirm', 'remaining' => $state['deadline'] - time()];
    }
}
