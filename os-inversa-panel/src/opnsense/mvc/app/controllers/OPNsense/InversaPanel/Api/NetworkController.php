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
use OPNsense\Interfaces\Vlan;
use OPNsense\InversaPanel\Approval;
use OPNsense\InversaPanel\Extras;
use OPNsense\InversaPanel\Integration;
use OPNsense\InversaPanel\InversaPanel;
use OPNsense\InversaPanel\Network;
use OPNsense\InversaPanel\Rollback;

/**
 * Internet connection, networks and ports. Every change is protected by Rollback:
 * it is reverted automatically unless confirmed (POST confirm) in time.
 */
class NetworkController extends ApiControllerBase
{
    /**
     * what Inversa Panel itself keeps about a network: colour, isolation, speed limit, approval of new devices
     * @param array $item the form of the network; only what it contains is changed
     * @param array $internal keys of the internal networks
     */
    private static function networkSettings(InversaPanel $mdl, $key, array $item, array $internal)
    {
        $flag = fn($value) => !empty($value) && $value !== 'false';
        $node = $mdl->networkNode($key, true);
        if (isset($item['color'])) {
            if (!preg_match('/^#[0-9A-Fa-f]{6}$/', (string)$item['color'])) {
                throw new \InvalidArgumentException('invalid colour');
            }
            $node->color->setValue((string)$item['color']);
        }
        if (isset($item['limit'])) {
            $node->limit->setValue($flag($item['limit']) ? '1' : '0');
            foreach (['down', 'up'] as $dir) {
                $mbit = (int)($item[$dir] ?? 0);
                if ($flag($item['limit']) && ($mbit < 1 || $mbit > 10000)) {
                    throw new \InvalidArgumentException('speed limit: 1 to 10000 Mbit/s');
                }
                if ($mbit >= 1 && $mbit <= 10000) {
                    $node->$dir->setValue((string)$mbit);
                }
            }
        }
        if (isset($item['approval'])) {
            $node->approval->setValue($flag($item['approval']) ? '1' : '0');
        }
        if (isset($item['isolated'])) {
            $reach = array_values(array_intersect(is_array($item['reach'] ?? null) ? $item['reach'] : [], $internal));
            $mdl->setIsolation($key, $flag($item['isolated']), $reach, $internal);
        }
    }

    public function getAction()
    {
        $state = (new Network())->state(new InversaPanel());
        $state['rollback'] = Rollback::pending();
        return $state;
    }

    public function testAction()
    {
        return json_decode((new Backend())->configdRun('inversapanel nettest'), true) ?? ['ok' => false];
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
        $mdl = new InversaPanel();
        $vlans = new Vlan();
        $keys = [];
        /* the internal networks there are, for "isolated from the others" */
        $internal = array_column($net->state($mdl)['networks'], 'key');
        $approvalBefore = $mdl->getApprovalInterfaces();
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
                $node = $mdl->networkNode($key, true);
                $node->created->setValue('1');
                $mdl->general->interfaces->setValue(implode(',', array_unique(array_merge($mdl->getProtectedInterfaces(), [$key]))));
                /* a new network is kept apart from the others unless said otherwise; it always reaches the internet */
                $item['isolated'] = $item['isolated'] ?? true;
                self::networkSettings($mdl, $key, $item, $internal);
                $mdl->setAccess($key, 'wan', true);
                $internal[] = $key;
            }
            foreach (is_array($update) ? $update : [] as $key => $item) {
                if (is_array($item) && preg_match('/^(lan|opt[0-9]+)$/', (string)$key)) {
                    $net->updateNetwork((string)$key, $item);
                    self::networkSettings($mdl, (string)$key, $item, $internal);
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
                    throw new \InvalidArgumentException("$key was not created by Inversa Panel and can only be removed in OPNsense");
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
            /* networks that just started to ask for approval: the devices already there keep working */
            Approval::approveExisting($mdl, array_diff($mdl->getApprovalInterfaces(), $approvalBefore));
            /* what follows from the settings of a network: the alias of approved devices, the speed limits */
            (new Integration($mdl))->syncAlias()->serializeToConfig();
            Extras::syncShaper($mdl)->serializeToConfig(false, true);
            /*
             * Inversa Panel's own values here are set by this code, not by the user; its interface field
             * caches the interface list from before this request (a new optN would look invalid)
             */
            $mdl->serializeToConfig(false, true);
            Config::getInstance()->save();
        } catch (\Exception $e) {
            /* nothing applied yet: just drop the in-memory changes */
            Config::getInstance()->forceReload();
            throw new UserException($e->getMessage(), 'Inversa Panel');
        }

        $net->apply($keys);
        Extras::applyShaper();
        $state = Rollback::arm($backup);
        return ['status' => 'confirm', 'remaining' => $state['deadline'] - time()];
    }
}
