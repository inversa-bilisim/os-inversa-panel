<?php

/*
 * SPDX-License-Identifier: BSD-2-Clause
 * Copyright (C) 2026 Inversa Bilişim
 */

namespace OPNsense\InversaPanel;

/**
 * Static knowledge Inversa Panel maps its simple switches onto.
 */
class Catalog
{
    /* name of the firewall alias holding blocked devices (MAC type) */
    const BLOCKED_ALIAS = 'inversapanel_blocked';

    /* firewall alias holding approved devices (MAC type); exists only while a network asks for approval */
    const APPROVED_ALIAS = 'inversapanel_approved';

    /* description used to recognise the Unbound blocklist policy Inversa Panel manages */
    const DNSBL_POLICY = 'Inversa Panel (managed)';

    /* per-schedule app blocking policies: description prefix + schedule name */
    const SCHED_POLICY_PREFIX = 'Inversa Panel schedule: ';

    /* GeoIP alias with the chosen countries (the blocked ones, or the allowed ones in "allow only" mode) */
    const GEO_ALIAS = 'inversapanel_geo';

    /*
     * "allow only" mode: everything that may get in, the countries above plus GEO_LOCAL.
     * Exists only while that mode is on.
     */
    const GEO_ALLOW_ALIAS = 'inversapanel_geo_allow';

    /*
     * Addresses that belong to no country and must not be shut out by "allow only these countries":
     * private networks (a modem in front of the firewall), carrier NAT, link-local (IPv6 neighbour
     * discovery, DHCPv6), multicast.
     */
    const GEO_LOCAL = [
        '10.0.0.0/8', '172.16.0.0/12', '192.168.0.0/16', '100.64.0.0/10', '169.254.0.0/16', '224.0.0.0/4',
        'fc00::/7', 'fe80::/10', 'ff00::/8',
    ];

    /* traffic shaper objects for the guest speed limit carry this description prefix */
    const SHAPER_PREFIX = 'Inversa Panel guest';

    /* MaxMind GeoLite2 country database, the format OPNsense's GeoIP aliases read */
    const MAXMIND_URL = 'https://download.maxmind.com/app/geoip_download?edition_id=GeoLite2-Country-CSV&license_key=%s&suffix=zip';

    /**
     * Inversa Panel category => Unbound DNSBL type keys (see OPNsense/Unbound/Unbound.xml dnsbl.blocklist.type).
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

    /* description used to recognise the intrusion detection policy Inversa Panel manages (drop instead of alert) */
    const IPS_POLICY = 'Inversa Panel (managed)';

    /**
     * Attack protection group => Suricata rulesets (file names as listed under
     * Services > Intrusion Detection > Download). Names unknown to the running OPNsense version
     * are skipped at sync time. Kept to rulesets that say "this is hostile" rather than
     * "this is unusual": every extra ruleset costs memory and brings false alarms.
     */
    const IPS_GROUPS = [
        'malware' => [
            'abuse.ch.feodotracker.rules', 'abuse.ch.sslblacklist.rules', 'botcc.rules', 'botcc.portgrouped.rules',
            'emerging-malware.rules', 'emerging-mobile_malware.rules', 'emerging-coinminer.rules',
            'emerging-worm.rules', 'emerging-ja3.rules',
        ],
        'attackers' => ['compromised.rules', 'drop.rules', 'dshield.rules', 'ciarmy.rules'],
        'exploits' => [
            'emerging-exploit.rules', 'emerging-exploit_kit.rules', 'emerging-shellcode.rules',
            'emerging-attack_response.rules', 'emerging-web_client.rules', 'emerging-web_server.rules',
            'emerging-sql.rules', 'emerging-current_events.rules',
        ],
        'phishing' => ['emerging-phishing.rules'],
        'scan' => ['emerging-scan.rules', 'emerging-dos.rules'],
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
