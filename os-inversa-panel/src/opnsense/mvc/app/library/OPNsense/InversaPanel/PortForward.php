<?php

/*
 * SPDX-License-Identifier: BSD-2-Clause
 * Copyright (C) 2026 Inversa Bilişim
 */

namespace OPNsense\InversaPanel;

use OPNsense\Core\Backend;
use OPNsense\Core\Config;
use OPNsense\Firewall\DNat;
use OPNsense\Firewall\Util;

/**
 * Port forwards on top of OPNsense's own destination NAT rules (Firewall > NAT > Port Forward).
 * Simple rules (one WAN port to one device port) are editable here, everything else is listed
 * read-only so it is never simplified by accident.
 */
class PortForward
{
    private static function simple($node)
    {
        $interfaces = array_filter(explode(',', (string)$node->interface));
        $dst = (string)$node->destination->network;
        return $interfaces === ['wan'] &&
            in_array((string)$node->protocol, ['tcp', 'udp', 'tcp/udp']) &&
            in_array($dst, ['wanip', '(self)', 'any', '']) &&
            in_array((string)$node->source->network, ['any', '']) &&
            ctype_digit((string)$node->destination->port) &&
            Util::isIpv4Address((string)$node->target) &&
            ((string)$node->{'local-port'} === '' || ctype_digit((string)$node->{'local-port'})) &&
            $node->nordr->isEmpty();
    }

    public function listRules()
    {
        $result = [];
        foreach ((new DNat())->rule->iterateItems() as $uuid => $node) {
            $port = (string)$node->destination->port;
            $result[] = [
                'uuid' => $uuid,
                'name' => (string)$node->descr,
                'enabled' => $node->disabled->isEmpty(),
                'protocol' => (string)$node->protocol,
                'port' => $port,
                'target' => (string)$node->target,
                'target_port' => (string)$node->{'local-port'} ?: $port,
                'simple' => self::simple($node),
            ];
        }
        return $result;
    }

    public function add(array $req)
    {
        $proto = (string)($req['protocol'] ?? 'tcp');
        $port = (string)($req['port'] ?? '');
        $tport = (string)($req['target_port'] ?? $port);
        $target = (string)($req['target'] ?? '');
        foreach ([$port, $tport] as $p) {
            if (!ctype_digit($p) || (int)$p < 1 || (int)$p > 65535) {
                throw new \InvalidArgumentException('invalid port');
            }
        }
        if (!in_array($proto, ['tcp', 'udp', 'tcp/udp']) || !Util::isIpv4Address($target)) {
            throw new \InvalidArgumentException('invalid protocol or target');
        }
        $mdl = new DNat();
        $seq = 0;
        foreach ($mdl->rule->iterateItems() as $node) {
            $seq = max($seq, (int)(string)$node->sequence);
        }
        $node = $mdl->rule->Add();
        $node->setNodes([
            'sequence' => (string)min(999999, $seq + 1),
            'interface' => 'wan',
            'ipprotocol' => 'inet',
            'protocol' => $proto,
            'source' => ['network' => 'any'],
            'destination' => ['network' => 'wanip', 'port' => $port],
            'target' => $target,
            'local-port' => $tport,
            /* let core add the matching pass rule */
            'pass' => 'rule',
            'descr' => mb_substr(trim((string)($req['name'] ?? '')) ?: "Inversa Panel {$port}", 0, 255),
        ]);
        $this->save($mdl);
        return $node->getAttributes()['uuid'];
    }

    public function setEnabled($uuid, $on)
    {
        $mdl = new DNat();
        $node = $mdl->getNodeByReference('rule.' . $uuid);
        if ($node === null) {
            return false;
        }
        $node->disabled->setValue($on ? '0' : '1');
        $this->save($mdl);
        return true;
    }

    public function delete($uuid)
    {
        $mdl = new DNat();
        if ($mdl->getNodeByReference('rule.' . $uuid) === null || !self::simple($mdl->getNodeByReference('rule.' . $uuid))) {
            /* complex rules are only deleted in OPNsense itself */
            return false;
        }
        $mdl->rule->del($uuid);
        $this->save($mdl);
        return true;
    }

    private function save(DNat $mdl)
    {
        $messages = [];
        foreach ($mdl->performValidation() as $msg) {
            $messages[] = $msg->getField() . ': ' . $msg->getMessage();
        }
        if (!empty($messages)) {
            throw new \InvalidArgumentException(implode("\n", $messages));
        }
        $mdl->serializeToConfig();
        Config::getInstance()->save();
        (new Backend())->configdRun('filter reload skip_alias');
    }

    /**
     * UPnP (os-upnp plugin, legacy settings): only reported, configured in its own page
     */
    public static function upnp()
    {
        $installed = is_file('/usr/local/etc/inc/plugins.inc.d/miniupnpd.inc');
        $cfg = Config::getInstance()->toArray();
        $enabled = $installed && isset($cfg['installedpackages']['miniupnpd']['config'][0]['enable']);
        return ['installed' => $installed, 'enabled' => $enabled];
    }
}
