<?php

/*
 * SPDX-License-Identifier: BSD-2-Clause
 * Copyright (C) 2026 Inversa Bilişim
 */

namespace OPNsense\Minnosh;

/**
 * Static knowledge Minnosh maps its simple switches onto.
 */
class Catalog
{
    /* name of the firewall alias holding blocked devices (MAC type) */
    const BLOCKED_ALIAS = 'minnosh_blocked';

    /* description used to recognise the Unbound blocklist policy Minnosh manages */
    const DNSBL_POLICY = 'Minnosh (managed)';

    /**
     * Minnosh category => Unbound DNSBL type keys (see OPNsense/Unbound/Unbound.xml dnsbl.blocklist.type).
     * Keys missing on the running OPNsense version are skipped at sync time.
     */
    const CATEGORIES = [
        'ads' => ['hgz002'],        /* Hagezi Multi NORMAL */
        'malware' => ['hgz011'],    /* Hagezi Threat Intelligence Feeds */
        'adult' => ['oisd2'],       /* OISD NSFW */
        'gambling' => ['hgz019'],   /* Hagezi Gambling */
        'bypass' => ['hgz014'],     /* Hagezi DoH/VPN/TOR/Proxy bypass */
    ];

    /**
     * App => domains blocked including all subdomains (Unbound "wildcards").
     * Keep this list conservative: never add shared infrastructure (e.g. googleapis.com) as a whole.
     */
    const APPS = [
        'tiktok' => ['tiktok.com', 'tiktokv.com', 'tiktokv.us', 'tiktokcdn.com', 'tiktokcdn-us.com', 'byteoversea.com', 'ibytedtos.com', 'musical.ly'],
        'instagram' => ['instagram.com', 'cdninstagram.com', 'ig.me'],
        'facebook' => ['facebook.com', 'facebook.net', 'fbcdn.net', 'fb.com', 'fb.me', 'fbsbx.com', 'messenger.com'],
        'x' => ['twitter.com', 'x.com', 'twimg.com', 't.co'],
        'youtube' => ['youtube.com', 'youtu.be', 'ytimg.com', 'googlevideo.com', 'youtube-nocookie.com', 'youtubei.googleapis.com'],
        'netflix' => ['netflix.com', 'netflix.net', 'nflxvideo.net', 'nflximg.net', 'nflxext.com', 'nflxso.net'],
        'twitch' => ['twitch.tv', 'ttvnw.net', 'jtvnw.net', 'twitchcdn.net', 'twitchsvc.net'],
        'discord' => ['discord.com', 'discord.gg', 'discordapp.com', 'discordapp.net', 'discord.media', 'discordcdn.com'],
        'roblox' => ['roblox.com', 'rbxcdn.com', 'rbx.com', 'robloxlabs.com'],
        'steam' => ['steampowered.com', 'steamcommunity.com', 'steamstatic.com', 'steamcontent.com', 'steamserver.net', 'steam-chat.com'],
        'whatsapp' => ['whatsapp.com', 'whatsapp.net', 'wa.me'],
        'telegram' => ['telegram.org', 'telegram.me', 't.me', 'telesco.pe', 'tdesktop.com'],
    ];

    /**
     * Turn a plain domain into the regex Unbound expects in its allowlist (domain + subdomains).
     * @param string $domain validated domain name
     * @return string
     */
    public static function allowPattern($domain)
    {
        return '(.*\.)?' . preg_quote(strtolower($domain), '/') . '$';
    }
}
