<?php

/*
 * SPDX-License-Identifier: BSD-2-Clause
 * Copyright (C) 2026 Inversa Bilişim
 */

namespace OPNsense\InversaPanel\Api;

use OPNsense\Base\ApiControllerBase;
use OPNsense\Core\Backend;
use OPNsense\Core\Config;
use OPNsense\InversaPanel\InversaPanel;

/**
 * Notifications by Telegram: the settings are stored right away (not part of "Apply"), the sending
 * is done by scripts/OPNsense/InversaPanel/notify.py. The bot token never leaves the firewall again:
 * the page only learns whether there is one and how it ends.
 */
class NotifyController extends ApiControllerBase
{
    const KINDS = ['devices', 'attacks', 'vpn', 'internet', 'logins', 'updates'];

    public function getAction()
    {
        $node = (new InversaPanel())->notify;
        $token = (string)$node->token;
        $result = [
            'enabled' => !$node->enabled->isEmpty(),
            'has_token' => $token !== '',
            'token_end' => $token !== '' ? substr($token, -4) : '',
            'chat' => (string)$node->chat,
            'error' => null,
        ];
        foreach (self::KINDS as $kind) {
            $result[$kind] = !$node->$kind->isEmpty();
        }
        /* the last message that could not be sent, if it is still waiting */
        $state = json_decode((string)@file_get_contents('/var/db/inversapanel/notify_state.json'), true);
        if (is_array($state) && !empty($state['error']) && !empty($state['queue'])) {
            $result['error'] = ['t' => (int)$state['error']['t'], 'text' => (string)$state['error']['text'], 'waiting' => count($state['queue'])];
        }
        return $result;
    }

    public function setAction()
    {
        if (!$this->request->isPost()) {
            return ['status' => 'failed'];
        }
        $this->throwReadOnly();
        $mdl = new InversaPanel();
        $node = $mdl->notify;
        $token = trim((string)$this->request->getPost('token'));
        /* an empty token keeps the stored one: the page never has it to send back */
        if ($token !== '') {
            $node->token->setValue($token);
        }
        $node->chat->setValue(trim((string)$this->request->getPost('chat')));
        $node->enabled->setValue($this->request->getPost('enabled') === '1' ? '1' : '0');
        foreach (self::KINDS as $kind) {
            $node->$kind->setValue($this->request->getPost($kind) === '1' ? '1' : '0');
        }
        if (!$node->enabled->isEmpty() && ((string)$node->token === '' || (string)$node->chat === '')) {
            return ['status' => 'failed', 'validations' => ['notify' => 'A bot token and a chat are needed to switch notifications on.']];
        }
        $validations = [];
        foreach ($mdl->performValidation() as $msg) {
            if (strpos($msg->getField(), 'notify.') === 0) {
                $validations[$msg->getField()] = $msg->getMessage();
            }
        }
        if (!empty($validations)) {
            return ['status' => 'failed', 'validations' => $validations];
        }
        /* only this section changes: an unrelated problem elsewhere must not block it */
        $mdl->serializeToConfig(false, true);
        Config::getInstance()->save();
        return ['status' => 'ok'];
    }

    /**
     * send a test message with the stored settings
     */
    public function testAction()
    {
        if (!$this->request->isPost()) {
            return ['status' => 'failed'];
        }
        $this->throwReadOnly();
        $answer = json_decode((string)(new Backend())->configdpRun('inversapanel notify', ['test']), true);
        return ['status' => !empty($answer['ok']) ? 'ok' : 'failed', 'error' => (string)($answer['error'] ?? 'no answer')];
    }

    /**
     * who wrote to the bot lately: the way to find the number of a chat
     */
    public function chatsAction()
    {
        if (!$this->request->isPost()) {
            return ['status' => 'failed'];
        }
        $this->throwReadOnly();
        $answer = json_decode((string)(new Backend())->configdpRun('inversapanel notify', ['chats']), true);
        return [
            'status' => !empty($answer['ok']) ? 'ok' : 'failed',
            'error' => (string)($answer['error'] ?? 'no answer'),
            'chats' => is_array($answer['chats'] ?? null) ? $answer['chats'] : [],
        ];
    }
}
