/*
 * SPDX-License-Identifier: BSD-2-Clause
 * Copyright (C) 2026 Inversa Bilişim
 *
 * German.
 */
window.InversaPanelI18n = window.InversaPanelI18n || {};
window.InversaPanelI18n.de = {
    langName: 'Deutsch',
    locale: 'de-DE',
    ov: {
        yesterday: 'gestern', now: 'jetzt', show: 'Anzeigen', none: 'Keine', connected: 'Verbunden', noConn: 'Nicht verbunden', noAnswer: 'keine Antwort', pct: function (n) { return n + ' %'; },
        minAgo: function (n) { return 'vor ' + n + ' Min.'; },
        durDH: function (d, h) { return d + (d === 1 ? ' Tag' : ' Tage') + (h ? ' ' + h + ' Std.' : ''); },
        durHM: function (h, m) { return h + ' Std.' + (m ? ' ' + m + ' Min.' : ''); },
        durM: function (m) { return m < 1 ? 'unter einer Minute' : m + ' Min.'; },
        todoTitle: function (n) { return n === 1 ? '1 Punkt braucht Ihre Aufmerksamkeit' : n + ' Punkte brauchen Ihre Aufmerksamkeit'; },
        todoOff: 'Inversa Panel ist aus; nichts ist geschützt', todoWan: 'Keine Internetverbindung',
        todoWait: function (n) { return n === 1 ? '1 neues Gerät wartet auf Freigabe' : n + ' neue Geräte warten auf Freigabe'; },
        todoVpn: function (name) { return 'VPN-Verbindung „' + name + '“ ist getrennt'; },
        todoIps: 'Angriffsschutz ist an, läuft aber nicht',
        wanUpShort: 'Internet verbunden', lastAlert: function (w) { return 'letzte Angriffswarnung ' + w; },
        chkInternet: 'Internet', chkGeo: 'Ländersperre', chkUpdate: 'Update',
        notRunning: 'Läuft nicht', ipsBlocking: 'Blockiert', ipsWatching: 'Warnt',
        geoAllow: function (n) { return n === 1 ? '1 Land erlaubt' : n + ' Länder erlaubt'; }, geoBlock: function (n) { return n === 1 ? '1 Land gesperrt' : n + ' Länder gesperrt'; },
        vpnUp: function (a, b) { return a + ' / ' + b + ' verbunden'; },
        updReady: function (v) { return v + ' verfügbar'; }, updPending: 'Update verfügbar', upToDate: 'Aktuell',
        waiting: function (n) { return n + (n === 1 ? ' wartet auf Freigabe' : ' warten auf Freigabe'); },
        kpiBlocked: 'Blockierte DNS-Anfragen · heute', noQueries: 'Heute noch keine Anfragen',
        kpiAlerts: 'Angriffswarnungen · heute', ipsOff: 'Angriffsschutz ist aus', noAlerts: 'Heute keine Warnungen',
        allBlocked: 'Alle blockiert', someBlocked: function (n) { return n + ' blockiert'; }, lastAt: function (w) { return 'zuletzt ' + w; },
        kpiSpeed: 'Geschwindigkeit jetzt', kpiUsage: 'Datenverbrauch · heute', since: function (w) { return 'seit ' + w; }, usageSoon: 'Aufzeichnung beginnt in unter einer Minute',
        gateway: 'Gateway', latency: 'Internet-Verzögerung', dnsTime: 'Namensauflösung', upSince: 'Verbunden seit',
        netsSub: 'Geräte · Mbit/s jetzt', isolated: 'isoliert', devs: function (n) { return n === 1 ? '1 Gerät' : n + ' Geräte'; },
        peers: function (a, b) { return a + ' / ' + b + ' Geräte verbunden'; }, vpnNone: 'Keine VPN-Verbindung eingerichtet.',
        blockedTitle: 'Blockierte Anfragen', blockedSub: 'Letzte 24 Stunden · pro Stunde', reqs: function (n) { return n === 1 ? '1 Anfrage' : n + ' Anfragen'; },
        evTitle: 'Letzte Ereignisse', evNone: 'Noch nichts aufgezeichnet.', times: function (n) { return n + ' Mal'; },
        evAttackBlocked: 'Angriff blockiert', evAttack: 'Angriffswarnung', evWait: 'Neues Gerät wartet auf Freigabe', evNew: 'Neues Gerät im Netzwerk', evPeer: 'VPN-Gerät verbunden',
        evVpnUp: 'VPN-Verbindung aufgebaut', evVpnDown: 'VPN-Verbindung getrennt', evWanUp: 'Internetverbindung ist wieder da', evWanDown: 'Internetverbindung unterbrochen',
        evSchedOn: 'Zeitplan gestartet', evSchedOff: 'Zeitplan beendet', evLists: 'Blocklisten aktualisiert', evBoot: 'Firewall neu gestartet', evDisk: 'Die Festplatte der Firewall läuft voll', evTemp: 'Die Firewall ist heiß gelaufen', evUpdate: 'Ein OPNsense-Update wartet',
        todoDisk: function (n) { return 'Die Festplatte der Firewall ist zu ' + n + ' % voll'; }, todoTemp: function (n) { return 'Die Firewall läuft heiß: ' + n + ' °C'; },
        sysTitle: 'System', upFor: function (s) { return 'Laufzeit ' + s; }, cpu: 'Prozessor', memory: 'Arbeitsspeicher', disk: 'Datenträger', temp: 'Temperatur',
        version: 'Version', cfgChanged: 'Letzte Konfigurationsänderung'
    },
    appSub: 'So einfach wie ein Modem, so stark wie OPNsense',
    tabLogs: 'Protokolle',
    lgCount: function (n) { return n === 1 ? '1 Eintrag' : n + ' Einträge'; }, lgCsv: 'CSV herunterladen', lgFailed: 'Die Einträge konnten nicht gelesen werden.', lgMore: 'Ältere Einträge',
    lgShown: function (n, all) { return n + ' von ' + all + ' Einträgen'; },
    lgTime: 'Zeit', lgWho: 'Wer', lgWhere: 'Wohin', lgWhat: 'Was ist passiert', lgSource: 'Quelle', lgResult: 'Ergebnis', lgPeriod: 'Zeitraum',
    lgToday: 'Letzte 24 Stunden', lgDays: function (n) { return n === 1 ? '1 Tag' : n + ' Tage'; }, lgTimes: function (n) { return n + ' Mal in dieser Stunde'; },
    lgAttacksTitle: 'Angriffe', lgAttacksSub: 'Versuche von außen auf Ihr Netzwerk: Warnungen des Angriffsschutzes, was die Länderregeln gestoppt haben und Verbindungen, die die Firewall abgelehnt hat. Aufbewahrung: 30 Tage.',
    lgAttacksSearch: 'Adresse, Land, Gerät oder Port suchen', lgAttacksNone: 'Keine Einträge in diesem Zeitraum.',
    lgTopSrc: 'Aktivste Adressen', lgTopCc: 'Länder', lgTopTarget: 'Häufigste Ziele',
    lgIps: 'Spur eines Angriffs', lgIpsOut: 'Ein Gerät wollte eine bekannte schädliche Adresse erreichen', lgGeo: 'Verbindungsversuch aus einem nicht zugelassenen Land',
    lgBlockedAddr: 'Verbindungsversuch von einer Adresse, die Sie blockiert haben', lgFw: 'Verbindungsversuch auf einen geschlossenen Port',
    lgSrcGeo: 'Länderregeln', lgSrcFw: 'Firewall', lgFirewall: 'Die Firewall',
    lgBlocked: 'Blockiert', lgAlertOnly: 'Nur Warnung', lgAllowed: 'Zugelassen', lgBlock: 'Blockieren', lgAllow: 'Zulassen', lgIsBlocked: 'Blockiert', lgInList: 'In der Liste',
    lgBlockedList: 'Blockierte Adressen', lgUnblock: function (ip) { return 'Sperre für ' + ip + ' aufheben'; },
    lgNowBlocked: function (ip) { return ip + ' ist blockiert.'; }, lgUnblocked: function (ip) { return ip + ' ist nicht mehr blockiert.'; },
    lgHistoryTitle: 'Internetverlauf', lgHistorySub: 'Welches Gerät welche Seite aufgerufen hat und was blockiert wurde. Sichtbar ist nur der Domainname, nie der Inhalt oder die vollständige Adresse einer Seite.',
    lgHistoryKeep: 'Internetverlauf anzeigen', lgHistoryKeepSub: 'Aus: Diese Seite zeigt von keinem Gerät die besuchten Seiten. Die Einträge stammen aus der DNS-Statistik von OPNsense; OPNsense bewahrt die letzten 7 Tage auf.',
    lgNetworks: 'Netzwerke', lgNoStats: 'Der Internetverlauf wird aus der DNS-Statistik gelesen, und die ist aus. Sie können sie unter Einstellungen einschalten.',
    lgHistoryOff: 'Der Internetverlauf ist aus.', lgHistoryNoNet: 'Wählen Sie mindestens ein Netzwerk, um dessen Verlauf zu sehen.', lgHistoryNone: 'Keine Einträge in diesem Zeitraum.',
    lgHistorySearch: 'Gerät oder Domain suchen', lgLastHour: 'Letzte Stunde', lgLast24: 'Letzte 24 Stunden', lgDomain: 'Domain',
    lgEventsTitle: 'Zugriffe und Änderungen', lgEventsSub: 'Wer sich verbunden hat, wer sich angemeldet hat, welche Einstellung geändert wurde. Aufbewahrung: 90 Tage.',
    lgEventsSearch: 'Person, Gerät oder Einstellung suchen', lgEventsNone: 'Keine Einträge in diesem Zeitraum.', lgEvent: 'Ereignis', lgWhoWhat: 'Wer / was', lgDetail: 'Detail', lgType: 'Art',
    lgTypeLogin: 'Panel-Anmeldung', lgTypeConfig: 'Einstellungsänderung', lgSystem: 'System',
    lgLogin: 'Anmeldung am Panel', lgLoginOk: 'Erfolgreich', lgLoginTry: 'Anmeldeversuch', lgLoginBad: 'Falsches Passwort', lgConfig: 'Einstellung geändert',
    pgRange: function (a, b, n) { return a + '–' + b + ' von ' + n; }, pgSize: 'Pro Seite', pgPrev: 'Vorherige Seite', pgNext: 'Nächste Seite', pgPages: 'Seiten', pgPage: function (n) { return 'Seite ' + n; },
    tabBackup: 'Sicherung', logout: 'Abmelden', tabNotify: 'Benachrichtigungen',
    tabScan: 'Vorhandene Einstellungen', scanOpen: 'Seite öffnen', scanAdopt: 'Übernehmen', welcomeScan: 'Vorhandene Einstellungen ansehen',
    tabAbout: 'Info', aboutSub: 'Die installierte Version, wer dahintersteht, an wen Sie sich wenden können und die Software, auf der das Panel aufbaut.',
    aboutVersion: 'Version', aboutRunsOn: 'Läuft auf', aboutLicense: 'Lizenz', aboutSource: 'Quellcode',
    aboutCompany: [
        'Inversa Panel ist ein Open-Source-Plugin von Inversa Bilişim, mit dem sich die am häufigsten genutzten Einstellungen von OPNsense auf einem einzigen Bildschirm verwalten lassen.',
        'Unser Ziel ist eine leistungsfähige Firewall, die auch Menschen ohne Netzwerk-Fachwissen leicht bedienen können. Geräte, Internetfilter, VPN, Angriffsschutz und Protokolle stehen auf einem übersichtlichen Bildschirm; für die alltägliche Arbeit müssen Sie sich nicht durch die Menüs von OPNsense suchen.',
        'Das Panel arbeitet mit den eigenen Einstellungen von OPNsense: Es liest, was vorhanden ist, und ändert nur, was Sie ändern. Sie können jederzeit zu den eigenen Seiten von OPNsense zurückkehren.',
        'Ihre Vorschläge und Fehlermeldungen helfen uns, das Panel besser zu machen; Sie erreichen uns unter den Adressen auf dieser Seite.'
    ],
    aboutWeb: 'Website', aboutMail: 'E-Mail', aboutIssues: 'Fehler und Wünsche', aboutIssuesLink: 'Auf GitHub melden',
    aboutSupport: 'Support-Informationen', aboutSupportSub: 'Senden Sie diese Zusammenfassung mit, wenn Sie um Hilfe bitten. Sie enthält keine Passwörter, Schlüssel oder Geräteadressen.',
    aboutCopy: 'Support-Informationen kopieren', aboutCopied: 'Kopiert',
    aboutBuiltOn: 'Aufgebaut auf', aboutBuiltOnSub: 'Inversa Panel führt zusammen, was diese Open-Source-Projekte bieten.',
    aboutOpnsense: 'Die Firewall selbst', aboutUnbound: 'DNS-Auflösung und -Blockierung', aboutSuricata: 'Angriffsschutz',
    aboutWireguard: 'VPN', aboutStrongswan: 'IPsec VPN', aboutDbip: 'Länderdaten · IP Geolocation by DB-IP',
    tabDash: 'Übersicht', tabDevices: 'Geräte', tabSecurity: 'Sicherheit', tabSettings: 'Einstellungen',
    subFilter: 'Kategorien und Apps', subLists: 'Zulassungs- / Sperrliste', subtabsAria: 'Seiten dieses Bereichs',
    protOn: 'Schutz an', protPartial: 'Schutz teilweise aus', protOff: 'Inversa Panel deaktiviert',
    protWhyTitle: 'Ausgeschaltete Schutzfunktionen:', protWhyOk: 'Werbeblocker und Schutz vor schädlichen Seiten sind an.',
    protWhyOff: 'Inversa Panel ist deaktiviert, daher ist kein Schutz aktiv.',
    protGoFilter: 'Klicken, um sie einzuschalten (Sicherheit).', protGoSettings: 'Klicken, um es einzuschalten (Einstellungen).',
    statusWhy: function (list) { return 'Aus: ' + list.join(', '); },
    pending: function (n) { return n === 1 ? '1 ungespeicherte Änderung' : n + ' ungespeicherte Änderungen'; },
    pendingHint: 'Änderungen werden auf die Firewall geschrieben, sobald Sie „Übernehmen“ drücken.',
    apply: 'Übernehmen', applying: 'Wird übernommen…', discard: 'Verwerfen',
    showChanges: 'Änderungen anzeigen', hideChanges: 'Ausblenden', changesTitle: 'Ungespeicherte Änderungen', undo: 'Zurücksetzen',
    applied: 'Änderungen übernommen. Die Firewall-Regeln wurden aktualisiert; die DNS-Blockierung wird im Hintergrund erneuert und wirkt innerhalb von 1-2 Minuten.',
    applyFailed: 'Die Änderungen konnten nicht übernommen werden:',
    validationFailed: 'Einige Werte sind ungültig:',
    loadFailed: 'Die Daten von Inversa Panel konnten nicht geladen werden. Bitte laden Sie die Seite neu.',
    welcomeTitle: 'Willkommen bei Inversa Panel',
    welcomeText: 'Ihre bestehende OPNsense-Konfiguration bleibt erhalten; Inversa Panel schaltet nichts ein, bevor Sie etwas ändern. Empfohlenen Schutz (Werbung und schädliche Seiten) einschalten?',
    welcomeYes: 'Empfohlenen Schutz einschalten', welcomeNo: 'Jetzt nicht',
    statusOk: 'Ihr Netzwerk ist geschützt', statusWarn: 'Einige Schutzfunktionen sind aus', statusOff: 'Inversa Panel ist deaktiviert',
    statusLine: function (online, total) {
        return (online === 1 ? '1 Gerät online' : online + ' Geräte online') + ' · ' + (total === 1 ? '1 Gerät bekannt' : total + ' Geräte bekannt');
    },
    dnsFilter: 'DNS-Filter', active: 'Aktiv', inactive: 'Aus',
    kpiOnline: 'Geräte online', kpiOnlineSub: function (n) { return n === 1 ? 'von 1 bekannten Gerät' : 'von ' + n + ' bekannten Geräten'; },
    kpiBlocked: 'Blockierte DNS-Anfragen', kpiBlockedSub: function (p) { return p + ' % aller Anfragen'; },
    kpiNoStats: 'Statistik aus',
    kpiDown: 'Download jetzt', kpiUp: 'Upload jetzt', kpiRateSub: 'Internetverbindung (WAN)',
    chartTitle: 'Internetverkehr', chartSub: function (m) { return 'Letzte ' + m + ' Minuten · WAN'; },
    legendDown: 'Download', legendUp: 'Upload', chartWaiting: 'Daten werden gesammelt…',
    topDevTitle: 'Aktivste Geräte', topDevSub: 'Offene Verbindungen', conns: function (n) { return n === 1 ? '1 Verbindung' : n + ' Verbindungen'; },
    topBlockedTitle: 'Am häufigsten blockierte Domains', noBlocked: 'Noch keine blockierten Anfragen.', customList: 'App / eigene Liste',
    statsOff: 'Die DNS-Statistik ist aus. Sie können sie unter Einstellungen einschalten.',
    quickTitle: 'Schnellschutz', quickSub: 'Mit einem Klick an / aus', editAll: 'Alle Sperreinstellungen', allDevices: 'Alle Geräte',
    on: 'An', off: 'Aus',
    devTitle: 'Geräte',
    devSub: 'Geräte, die in den geschützten Netzwerken gesehen wurden. Klicken Sie auf einen Gerätenamen, um das Gerät zu bearbeiten. Ein Gerät mit gesperrtem Internet erreicht die Firewall weiterhin (DNS, DHCP).',
    search: 'Name, Netzwerk, IP oder MAC suchen', fAll: 'Alle', fOnline: 'Online', fBlocked: 'Internet gesperrt', fWaiting: 'Wartet auf Freigabe',
    fShown: function (n, all) { return n === all ? (all === 1 ? '1 Gerät' : all + ' Geräte') : n + ' von ' + all + ' Geräten'; }, fReset: 'Filter löschen', fNetworkShow: 'Geräte in diesem Netzwerk anzeigen',
    sortHint: 'Zum Sortieren klicken',
    colDevice: 'Gerät', colNetwork: 'Netzwerk', colIp: 'IP-Adresse', colMac: 'MAC-Adresse', colSeen: 'Status', colConns: 'Verbindungen', colNet: 'Internet',
    online: 'Online', offline: 'Offline',
    justNow: 'gerade eben',
    agoMin: function (n) { return 'vor ' + n + ' Min.'; },
    agoHour: function (n) { return 'vor ' + n + ' Std.'; },
    agoDay: function (n) { return n === 1 ? 'vor 1 Tag' : 'vor ' + n + ' Tagen'; },
    netOn: 'An', netOff: 'Gesperrt', unnamed: 'Unbenanntes Gerät', unknownVendor: 'Unbekannter Hersteller',
    cutAria: function (n) { return 'Internet für ' + n + ' ein- / ausschalten'; },
    editAria: function (n) { return n + ' bearbeiten'; },
    noResult: 'Keine passenden Geräte.', noDevicesYet: 'Noch keine Geräte gesehen.', noActive: 'Im Moment hat kein Gerät offene Verbindungen.', close: 'Schließen',
    discoveryHint: 'Tipp: Für eine genauere Geräteliste aktivieren Sie die Host-Erkennung (Hostwatch) unter Schnittstellen › Nachbarn › Erkennungseinstellungen.',
    dName: 'Gerätename', dType: 'Gerätetyp', dVendor: 'Hersteller', dMac: 'MAC-Adresse', dNetwork: 'Netzwerk', dIps: 'IP-Adressen',
    dHostname: 'DHCP-Name', dFirst: 'Zuerst gesehen', dLast: 'Zuletzt gesehen',
    dFixedIp: 'Feste IP-Adresse', dFixedShort: 'fest', dIpAuto: 'Automatisch (DHCP)', dIpPin: 'Diese IP behalten', dIpClear: 'Zurück zu automatisch',
    dIpPinHint: 'Das Gerät bekommt immer seine aktuelle Adresse.',
    dIpHint: function (net, from, to) { return 'Netzwerk ' + net + ' · automatischer Bereich ' + from + ' – ' + to + '. Empfohlen wird eine feste Adresse außerhalb dieses Bereichs.'; },
    dIpInRange: function (from, to) { return 'Diese Adresse liegt im automatischen Bereich (' + from + ' – ' + to + '). Das funktioniert, aber eine Adresse außerhalb des Bereichs ist sauberer.'; },
    dIpAutoHint: 'Leer lassen, damit das Gerät seine Adresse automatisch per DHCP bekommt.',
    dIpInvalid: 'Geben Sie eine gültige IPv4-Adresse ein (z. B. 192.168.1.50).', dIpNoNet: 'Diese Adresse liegt in keinem Netzwerk, das per DHCP versorgt wird.',
    dManualShort: 'manuell',
    dIpManual: function (ip) { return 'Dieses Gerät hat seine Adresse selbst festgelegt (' + ip + '). Eine hier vergebene Adresse gilt erst, wenn das Gerät auf automatisch (DHCP) umgestellt wird.'; },
    dIpManualPool: function (from, to) { return 'Diese Adresse liegt im automatisch vergebenen Bereich (' + from + ' – ' + to + '): Dieselbe Adresse könnte an ein anderes Gerät vergeben werden. „Diese IP behalten“ reserviert sie für dieses Gerät.'; },
    dIpRenew: 'Nach dem Übernehmen bekommt das Gerät die neue Adresse bei der nächsten Verbindung (WLAN aus- und wieder einschalten genügt).',
    dNet: 'Internetzugang', dNetSub: 'Wenn aus, kann das Gerät das Internet nicht erreichen.',
    dApproval: 'Netzwerkfreigabe', dApprovalSub: 'In diesem Netzwerk müssen neue Geräte freigegeben werden. Wenn aus, kann das Gerät weder das Internet noch andere Netzwerke erreichen.',
    apprWaiting: 'Wartet auf Freigabe', apprApproved: 'Freigegeben', apprApprove: 'Freigeben',
    apprApproveAria: function (n) { return n + ' freigeben'; },
    apprPanel: 'Dieses Gerät wartet auf Freigabe: Es kann weder das Internet noch andere Netzwerke erreichen.',
    apprBanner: function (n) { return n === 1 ? '1 neues Gerät wartet auf Freigabe' : n + ' neue Geräte warten auf Freigabe'; },
    apprBannerSub: 'Bis zur Freigabe können sie weder das Internet noch andere Netzwerke erreichen. Geben Sie die Geräte frei, die Sie kennen, und drücken Sie dann „Übernehmen“.',
    apprShow: 'Geräte anzeigen',
    apprAuto: function (n) { return 'Die Freigabe neuer Geräte ist an: ' + (n === 1 ? 'Das eine bisher gesehene Gerät gilt' : 'Die ' + n + ' bisher gesehenen Geräte gelten') + ' als freigegeben. Geräte, die sich ab jetzt verbinden, warten auf Freigabe.'; },
    apprCard: 'Freigabe neuer Geräte',
    types: { phone: 'Telefon', tablet: 'Tablet', laptop: 'Computer', tv: 'TV', console: 'Spielkonsole', printer: 'Drucker', iot: 'Smart Home', server: 'Server / NAS', unknown: 'Sonstiges' },
    filtTitle: 'Kategorien und Apps',
    filtSub: 'Die Regeln gelten für jedes Gerät, das die Firewall als DNS-Server verwendet.',
    catTitle: 'Kategorien', appsTitle: 'Apps', appsSub: 'Die Domains der gewählten Apps (einschließlich Subdomains) werden per DNS blockiert.',
    blocked: 'Blockiert', allowed: 'Zugelassen',
    listsTitle: 'Zulassungsliste und Sperrliste', listsSub: 'Domains, die immer zugelassen oder immer blockiert sind, egal was die Kategorien sagen.',
    allowTitle: 'Zulassungsliste', allowDesc: 'Diese Domains sind immer zugelassen, auch wenn eine Kategorieliste sie enthält.',
    denyTitle: 'Sperrliste', denyDesc: 'Diese Domains und ihre Subdomains werden immer blockiert.',
    listEmpty: 'Noch keine Domains hinzugefügt.',
    add: 'Hinzufügen', removeAria: function (d) { return d + ' entfernen'; }, invalidDomain: 'Geben Sie eine gültige Domain ein (z. B. example.com).',
    warnDns: 'DNS-Erzwingung ist aus. Geräte können die Blockierung umgehen, indem sie einen anderen DNS-Server verwenden.',
    cats: {
        ads: ['Werbung und Tracker', 'Blockiert Werbung und Tracking-Code in Websites und Apps.', 'Quelle: hagezi Multi NORMAL'],
        malware: ['Schadsoftware und Phishing', 'Blockiert bekannte schädliche, betrügerische und Phishing-Seiten.', 'Quelle: hagezi Threat Intelligence Feeds'],
        adult: ['Inhalte für Erwachsene', 'Blockiert Websites für Erwachsene.', 'Quelle: OISD NSFW'],
        gambling: ['Glücksspiel', 'Blockiert Wett- und Glücksspielseiten.', 'Quelle: hagezi Gambling'],
        bypass: ['VPN, Proxy und verschlüsseltes DNS', 'Blockiert Dienste, mit denen sich die Blockierung umgehen lässt.', 'Quelle: hagezi DoH/VPN/TOR/Proxy'],
        safesearch: ['SafeSearch erzwingen', 'Schaltet den eingeschränkten Modus in Google, Bing und YouTube ein.', 'Unbound SafeSearch'],
        forcedns: ['DNS erzwingen', 'Leitet alle DNS-Anfragen der Geräte auf die Firewall um.', 'Automatische NAT-Regel']
    },
    tabNet: 'Netzwerk & Internet', tabSched: 'Zeitpläne', tabPf: 'Portweiterleitung', tabVpn: 'VPN', tabGeo: 'Länder',
    internet: 'Internet', readonly: 'Nur lesen', linkDown: 'Kein Kabel', colName: 'Name',
    days: ['Mo', 'Di', 'Mi', 'Do', 'Fr', 'Sa', 'So'],
    schTitle: 'Zeitpläne', schSub: 'Sperren Sie für gewählte Geräte an bestimmten Tagen und zu bestimmten Zeiten das Internet oder einzelne Apps. Wird jede Minute geprüft.',
    schNew: 'Neuer Zeitplan', schNewName: 'Neuer Zeitplan', schName: 'Name des Zeitplans', schDelete: 'Zeitplan löschen',
    schDevices: 'Geräte', schDays: 'Tage', schFrom: 'Beginn', schTo: 'Ende', schAction: 'Was soll passieren?',
    actCut: 'Internet sperren', actApps: 'Apps blockieren', schApps: 'Zu blockierende Apps', schWeek: 'Wochenansicht',
    schEmpty: 'Noch keine Zeitpläne.', schEvery: 'Jeden Tag', schWeekdays: 'Werktags', schWeekend: 'Wochenende', schNoDays: 'Keine Tage gewählt',
    schDevCount: function (n) { return n === 1 ? '1 Gerät' : n + ' Geräte'; },
    subWan: 'Internetverbindung', subNets: 'Lokale Netzwerke', subPorts: 'Physische Anschlüsse',
    wanSub: 'Wie sich die Firewall mit dem Internet verbindet. Bestehende OPNsense-Einstellungen werden gelesen; geändert wird nur, was Sie ändern.',
    netsSub: 'Ihre internen Netzwerke (Zuhause, IoT, Gäste, ...) und was sie erreichen dürfen. Bestehende OPNsense-Einstellungen werden gelesen; geändert wird nur, was Sie ändern.',
    wanMissing: 'Auf diesem System ist keine WAN-Schnittstelle eingerichtet.', wanConnected: 'Mit dem Internet verbunden', wanDown: 'Keine Internetadresse',
    wanVia: { dhcp: 'Über ein Modem (DHCP)', pppoe: 'Glasfaser / VDSL · PPPoE', 'static': 'Statische IP', other: 'Andere' },
    wanTest: 'Verbindung testen', wanTesting: 'Wird getestet…', chkGateway: 'Gateway', chkInternet: 'Internet', chkDns: 'Namensauflösung (DNS)',
    wanMulti: 'Dieses System hat mehr als eine Internetverbindung (Multi-WAN). Um Verwechslungen zu vermeiden, lassen sich die Verbindungseinstellungen nur in den OPNsense-Menüs ändern.',
    wanComplex: 'Ihre Internetverbindung nutzt einen Typ, den Inversa Panel nicht unterstützt; ändern Sie ihn in den OPNsense-Menüs.',
    wanPortShort: 'Anschluss', wanLinkUp: 'Kabel verbunden', wanIp: 'IP-Adresse', wanTestTitle: 'Verbindungstest', wanRetest: 'Erneut testen',
    wanExt: 'Externe IP', wanExtBtn: 'Externe IP anzeigen', wanExtFailed: 'konnte nicht ermittelt werden',
    wanExtNote: 'Die externe IP ermittelt die Firewall durch eine Anfrage bei Cloudflare (1.1.1.1), sobald die Schaltfläche gedrückt wird.',
    wanAdvTitle: 'Erweitert', wanAdv: 'Erweitert: MAC-Adresse, MTU', wanAuto: 'automatisch',
    wanMac: 'MAC-Adresse', wanMacSub: 'Wenn Ihr Anbieter den Anschluss an die MAC-Adresse des Modems gebunden hat, geben Sie diese Adresse ein. Leer: die eigene Adresse des Anschlusses.',
    wanMtuSub: 'Leer lassen, sofern Ihr Anbieter Ihnen keinen anderen Wert genannt hat.',
    wanMtuPppoe: 'Leer: 1492. Wenn manche Seiten nicht laden, versuchen Sie einen niedrigeren Wert (z. B. 1452).',
    wanType: 'Verbindungstyp', wanSettings: function (type) { return type + ' · Einstellungen'; },
    wt: {
        dhcp: ['Hinter einem Modem / Router', 'OPNsense bekommt seine Adresse automatisch vom Modem.'],
        pppoe: ['Glasfaser oder VDSL (PPPoE)', 'Modem im Bridge-Modus oder Glasfaser-Anschlussgerät (ONT); OPNsense übernimmt die Aufgabe des Modems.'],
        'static': ['Statische IP', 'Wenn Ihr Anbieter Ihnen eine feste IP-Adresse gegeben hat.']
    },
    pppUser: 'PPPoE-Benutzername', pppPass: 'PPPoE-Passwort', pppKeep: 'Zum Ändern eingeben',
    pppoeHint: 'Benutzername, Passwort und VLAN-Nummer erhalten Sie von Ihrem Internetanbieter.',
    stIp: 'IP-Adresse / Präfix', stGw: 'Gateway',
    dhcpWarn: 'Wenn das Modem ebenfalls routet, entsteht „doppeltes NAT“; Spiele und Portweiterleitungen können Probleme machen. Stellen Sie das Modem nach Möglichkeit in den Bridge-Modus.',
    wanPort: 'Internet-Anschluss', wanPortSub: 'Der Anschluss, in dem das Internetkabel steckt.',
    vlanReq: 'VLAN-Tag verwenden', vlanReqSub: 'Bei vielen Glasfaseranschlüssen kommt der Internetverkehr mit einer bestimmten VLAN-Nummer an.', vlanId: 'VLAN-Nummer',
    ipv6Sub: 'Wird automatisch bezogen, wenn Ihr Anbieter IPv6 anbietet.', v6Auto: 'Automatisch', v6Off: 'Aus',
    netSafety: 'Wenn Sie nach dem Übernehmen nicht innerhalb von 90 Sekunden bestätigen, werden die vorherigen Einstellungen automatisch wiederhergestellt.',
    netApply: 'Netzwerkeinstellungen übernehmen', netCreate: 'Netzwerk erstellen',
    netConfirmTitle: 'Die neuen Einstellungen sind aktiv und warten auf Ihre Bestätigung.', netConfirmText: 'Wenn diese Seite noch funktioniert, funktioniert Ihre Verbindung. Ohne Bestätigung werden die vorherigen Einstellungen automatisch wiederhergestellt.',
    netConfirmBtn: 'Funktioniert, beibehalten', netConfirmed: 'Die Einstellungen wurden dauerhaft gespeichert.',
    netReverted: 'Keine Bestätigung erhalten: Die vorherigen Einstellungen werden wiederhergestellt. Die Seite wird gleich neu geladen.',
    confirmFirst: 'Bestätigen Sie zuerst die wartende Änderung (oder warten Sie, bis sie zurückgenommen wurde), und drücken Sie dann erneut „Übernehmen“.',
    netKinds: { home: 'Zuhause / lokal', iot: 'IoT / Smart Home', guest: 'Gäste', camera: 'Kameras', server: 'Server' },
    netEdit: 'Bearbeiten', netLink: 'Verbindung', untagged: 'ohne Tag', netAddr: 'Adresse',
    edTitle: function (n) { return 'Netzwerk ' + n + ' bearbeiten'; }, edType: 'Netzwerktyp', edTypeHint: 'Netzwerktyp und Freigabe neuer Geräte werden mit „Übernehmen“ oben auf der Seite gespeichert.',
    edApproval: 'Neue Geräte warten auf Freigabe',
    edApprovalSub: 'Ein Gerät, das diesem Netzwerk zum ersten Mal beitritt, per WLAN oder Kabel, kann weder das Internet noch andere Netzwerke erreichen, bis Sie es auf dem Tab Geräte freigeben.',
    edApprovalNote: 'Wenn Sie dies einschalten, gelten die bisher gesehenen Geräte als freigegeben; nur Geräte, die sich später verbinden, müssen warten. Die Freigabe richtet sich nach der MAC-Adresse. Verkehr zwischen Geräten am selben Switch oder WLAN läuft nicht über die Firewall; um auch das zu unterbinden, aktivieren Sie an Ihrem Access Point die „Client-Isolation“.',
    edApprovalNotProtected: 'Dieses Netzwerk gehört nicht zu den Netzwerken, die Inversa Panel schützt. Fügen Sie es zuerst unter Einstellungen › Geschützte Netzwerke hinzu.',
    netMain: 'Hauptnetzwerk', netDevCount: function (n) { return n === 1 ? '1 Gerät verbunden' : n + ' Geräte verbunden'; },
    isoRow: 'Andere Netzwerke', isoAlone: 'Isoliert', isoWith: function (l) { return 'Isoliert · erreicht ' + l; },
    isoTitle: 'Von anderen Netzwerken isolieren', isoSub: 'Dieses Netzwerk kann nicht mit den anderen Netzwerken kommunizieren; das Internet bleibt offen.',
    isoReach: 'Netzwerke, die es weiterhin erreicht, in beide Richtungen:',
    limTitle: 'Geschwindigkeitslimit', limSub: 'Gesamte Internetgeschwindigkeit dieses Netzwerks.', limDown: 'Download', limUp: 'Upload',
    edColor: 'Farbe', edColorN: function (n) { return 'Farbe ' + n; },
    edPort: 'Anschluss:', edConnFixed: 'Wie ein Netzwerk angeschlossen ist, lässt sich nach dem Erstellen nicht mehr ändern.', edRange: 'Adressbereich',
    edApprovalShort: 'Ein Gerät, das sich zum ersten Mal verbindet, hat kein Internet, bis Sie es freigeben.',
    vlanWifi: function (tag) { return 'Für WLAN legen Sie an Ihrem Access Point einen eigenen Netzwerknamen (SSID) an und ordnen ihn der VLAN-Nummer dieses Netzwerks zu (' + tag + '). Ihr Switch und Ihr Access Point müssen VLANs unterstützen.'; },
    edGw: 'Gateway-Adresse', edDhcp: 'DHCP-Server', edDhcpSub: 'An: Geräte bekommen automatisch eine IP-Adresse.', edDhcpOff: 'Aus: Geräte brauchen eine manuell eingestellte IP-Adresse.',
    lanChangeWarn: 'Wenn Sie die Adresse des Netzwerks ändern, mit dem Sie verbunden sind, kann Ihre Verbindung abbrechen; ohne Bestätigung von der neuen Adresse aus wird die Änderung zurückgenommen.',
    edDelete: 'Netzwerk löschen', notCreated: 'Dieses Netzwerk wurde nicht von Inversa Panel erstellt; entfernen Sie es in den OPNsense-Menüs.',
    edDeleteConfirm: function (n) { return 'Netzwerk ' + n + ' löschen? Die Geräte darin werden getrennt.'; },
    netAdd: 'Netzwerk hinzufügen', netAddSub: 'Erstellen Sie ein eigenes Netzwerk für Smart-Home-Geräte, Gäste, Kameras oder Server.',
    edDhcpFrom: 'Bereichsanfang', edDhcpTo: 'Bereichsende', edLease: 'Lease (Stunden)', edLeaseDefault: 'Standard', edAuto: 'automatisch',
    edDhcpHint: 'Geräte bekommen automatisch Adressen aus diesem Bereich; für leere Felder gilt der grau angezeigte Wert. Feste Adressen vergeben Sie auf dem Tab Geräte.',
    leaseShort: function (h) { return h + ' Std.'; },
    edName: 'Netzwerkname', edConn: 'Verbindungstyp', edVlanMode: 'VLAN', edPortMode: 'Eigener Anschluss', edVlanId: 'VLAN-Nr.',
    edParentFor: 'Anschluss, der das VLAN führt:', edPortFor: 'Freier Anschluss für dieses Netzwerk:',
    vlanNote: 'VLANs brauchen einen Switch und einen Access Point, die sie unterstützen.',
    accTitle: 'Zugriff zwischen Netzwerken', accSub: 'Darf das Netzwerk in der Zeile eine Verbindung zum Netzwerk in der Spalte aufbauen? Klicken Sie auf eine Zelle, um das zu ändern.',
    accFrom: 'Von ↓  Nach →', accState: { allow: 'Zugelassen', deny: 'Blockiert', 'default': 'OPNsense' },
    accLegend: '„OPNsense“: Inversa Panel greift nicht ein, es gelten Ihre bestehenden Firewall-Regeln.',
    portsSubRo: 'Die Netzwerkanschlüsse der Firewall und wofür jeder verwendet wird. Den Internet-Anschluss wählen Sie unter „Internetverbindung“, den Anschluss eines Netzwerks beim Hinzufügen.',
    portWan: 'Internet (WAN)', portTrunkOnly: 'Nur VLANs', portUnused: 'Unbenutzt',
    pfTitle: 'Portweiterleitung', pfSub: 'Öffnen Sie den Zugriff aus dem Internet auf ein Gerät in Ihrem Netzwerk. Die nötige Firewall-Regel wird automatisch hinzugefügt und wirkt sofort.',
    pfRdp: 'Remotedesktop', pfCustom: 'Eigene', pfNew: 'Neue Portweiterleitung', pfTarget: 'Zielgerät oder IP', pfTargetPh: 'Gerätename oder IP', pfNamePh: 'Vom Port übernommen', pfTo: 'Ziel',
    pfListHint: 'Nicht in der Liste? Einfach weitertippen', pfCount: function (n) { return n === 1 ? '1 Weiterleitung' : n + ' Weiterleitungen'; },
    pfPorts: { '443': 'Web (HTTPS)', '80': 'Web (HTTP)', '22': 'SSH', '3389': 'Remotedesktop', '5900': 'VNC', '21': 'FTP', '25': 'E-Mail (SMTP)', '8080': 'Web (alternativ)', '8123': 'Home Assistant', '554': 'Kamera (RTSP)', '32400': 'Plex', '25565': 'Minecraft', '27015': 'Steam-Spieleserver', '3074': 'Xbox Live', '1194': 'OpenVPN', '51820': 'WireGuard' },
    pfExt: 'Externer Port', pfInt: 'Interner Port', pfTargetIp: 'Ziel-IP', pfProto: 'Protokoll', pfAdd: 'Portweiterleitung hinzufügen',
    pfImmediate: 'Portweiterleitungen wirken sofort (kein Übernehmen nötig).',
    pfRules: 'Portweiterleitungen', pfWanIs: function (ip) { return 'Ihre externe IP: ' + ip; }, pfEmpty: 'Noch keine Portweiterleitungen.',
    pfDelConfirm: 'Diese Portweiterleitung löschen?',
    upnpTitle: 'Automatische Portfreigabe (UPnP)', upnpDesc: 'Erlaubt Geräten wie Spielkonsolen, ihre Ports selbst zu öffnen; wird auf der Seite des Plugins os-upnp verwaltet.',
    upnpMissing: 'Plugin nicht installiert',
    vpnTitle: 'VPN-Verbindungen', vpnSub: 'Sicherer Fernzugriff auf Ihr Heim-/Büronetzwerk (WireGuard) und Verbindungen zwischen Standorten (WireGuard, oder IPsec mit Firewalls anderer Hersteller).',
    vpnUnavailable: 'WireGuard ist in dieser OPNsense-Version nicht verfügbar.',
    vpnNew: 'Neue VPN-Verbindung', vpnNone: 'Noch keine VPN-Verbindungen. Beginnen Sie mit „Neue VPN-Verbindung“.',
    vpnKindRemote: 'Fernzugriff', vpnKindRemoteDesc: 'Telefone und Laptops verbinden sich von außen. QR-Code und .conf-Datei pro Gerät.',
    vpnKindSite: 'Standort zu Standort', vpnKindSiteDesc: 'Dauerhafte Verbindung zu einer anderen Firewall/Filiale; die Netzwerke beider Seiten erreichen einander. WireGuard oder IPsec.',
    vpnName: 'Verbindungsname', vpnPort: 'UDP-Port', vpnCreate: 'Verbindung erstellen', vpnDelete: 'Verbindung löschen',
    vpnDelConfirmConn: function (n) { return 'Verbindung „' + n + '“ und alle ihre Geräte löschen?'; },
    vpnReach: 'Erreichbare interne Netzwerke', vpnSiteShare: 'Unsere Netzwerke, die für die Gegenseite freigegeben sind',
    vpnAddr: 'Verbindungsadresse', vpnEndpoint: 'Verbindungsname (optional)',
    vpnEndpointHint: 'Geben Sie bei wechselnder IP Ihren DynDNS-Namen ein. Wenn leer, wird die WAN-Adresse verwendet.',
    vpnMode: 'Welcher Verkehr soll durch das VPN laufen?', modeFull: 'Gesamter Verkehr', modeFullDesc: 'Der gesamte Internetverkehr des Geräts läuft hierüber; der Werbeblocker wirkt auch unterwegs.',
    modeSplit: 'Nur gewählte Netzwerke', modeSplitDesc: 'Nur der Verkehr zu den internen Netzwerken, die Sie wählen, läuft durch das VPN.',
    vpnModeHint: 'Laden Sie nach einem Wechsel des Modus die Konfiguration der Geräte (QR / .conf) erneut.',
    vpnTunnel: 'VPN-IP-Block', vpnTunnelHint: 'Geräte bekommen Adressen aus diesem Block (z. B. 10.70.0.0/24). Leer lassen, um einen freien zu wählen; er darf sich nicht mit internen Netzwerken oder anderen VPNs überschneiden.',
    vpnInternetOnly: 'Nur Internet', vpnInternetOnlyHint: 'Kein internes Netzwerk gewählt: Das Gerät geht nur ins Internet, mit der öffentlichen IP-Adresse dieses Standorts. Interne Netzwerke und die Firewall erreicht es nicht.',
    vpnFullEmptyHint: 'Wenn Sie kein internes Netzwerk wählen, bekommt das Gerät nur Internetzugang.',
    vpnReaddressed: 'Der VPN-IP-Block wurde geändert, und die Geräte haben neue Adressen bekommen. Laden Sie die Konfiguration der Geräte (QR / .conf) erneut.',
    vpnRemoteEndpoint: 'Adresse der Gegenseite', vpnRemoteNets: 'Netzwerke der Gegenseite',
    vpnRemoteKey: 'Öffentlicher Schlüssel der Gegenseite (optional)', vpnRemoteKeyPh: 'Leer lassen, dann erzeugt Inversa Panel ihn',
    vpnRemoteKeyHint: 'Wenn leer, werden Schlüssel für die Gegenseite erzeugt und eine fertige Konfiguration (QR / .conf) angeboten.',
    vpnThisSide: 'Diese Seite (auf der Gegenseite eintragen)', vpnOtherSide: 'Gegenseite', vpnPubKey: 'Öffentlicher Schlüssel', vpnTunnelIp: 'Tunneladresse',
    vpnWaitsForThem: 'Wird angezeigt, sobald sich die Gegenseite verbindet', vpnOtherConf: 'Fertige Konfiguration für die Gegenseite:',
    vpnDevCount: function (n) { return n === 1 ? '1 Gerät' : n + ' Geräte'; },
    vpnOthers: function (l) { return 'Es gibt weitere WireGuard-Einrichtungen, Inversa Panel lässt sie unangetastet: ' + l; },
    vpnBehindModem: 'Wenn OPNsense hinter einem Modem steht, leiten Sie am Modem den UDP-Port jeder Verbindung (bei IPsec UDP 500 und 4500) an OPNsense weiter.',
    vpnStepKind: 'Art', vpnStepSet: 'Einstellungen', vpnBack: 'Zurück',
    vpnAdvRemote: 'Erweitert: Port, IP-Block, Verbindungsadresse', vpnAdvSite: 'Erweitert: Port, IP-Block, Schlüssel der Gegenseite', vpnAdvIpsec: 'Erweitert: gemeinsamer Schlüssel, Adresse dieser Seite',
    vpnLiveCount: function (n) { return n + ' verbunden'; }, vpnNoLive: 'Kein Gerät verbunden',
    vpnTraffic: 'Datenverkehr', vpnOurNets: 'Unsere Netzwerke',
    wgSecret: 'Der QR-Code und die .conf-Datei enthalten den privaten Schlüssel der Gegenseite. Geben Sie sie nur über einen sicheren Kanal an den Administrator der Gegenseite weiter.',
    wgText: function (c) {
        return ['WireGuard-Verbindung: ' + c.name,
            'Diese Werte werden auf dem Gerät der GEGENSEITE eingetragen.', '',
            'Verbindungsadresse (Endpoint)          : ' + c.address,
            'Öffentlicher Schlüssel dieser Firewall : ' + c.pubkey,
            'Tunneladresse dieser Seite             : ' + c.tunnel,
            'Erlaubte Netzwerke (AllowedIPs)        : ' + [c.tunnel.split('/')[0] + '/32'].concat(c.networks).join(', '),
            'Netzwerke der Gegenseite               : ' + c.remote_networks.join(', '),
            'Öffentlicher Schlüssel der Gegenseite  : ' + (c.remote_pubkey || '—')].join('\n');
    },
    /* IPsec site to site */
    ipcProto: 'Protokoll',
    ipcProtoWg: 'Wenn die Gegenseite ebenfalls WireGuard spricht (OPNsense, pfSense, MikroTik, Linux).',
    ipcProtoIpsec: 'Wenn die Gegenseite eine Firewall eines anderen Herstellers ist (FortiGate, Sophos, Zyxel, Cisco, MikroTik…). IKEv2 mit gemeinsamem Schlüssel.',
    ipcKey: 'Gemeinsamer Schlüssel', ipcKeyPh: 'Leer lassen, Inversa Panel erzeugt einen', ipcKeyKeep: 'Zum Ändern eingeben',
    ipcKeyHint: 'Muss auf beiden Seiten gleich sein. Mindestens 12 Zeichen: Buchstaben, Ziffern und . _ ~ ! @ # % ^ * + = : , -',
    ipcOurs: 'Adresse dieser Seite (optional)',
    ipcOursHint: 'Die feste IP oder der Hostname, unter dem die Gegenseite diese Firewall erreicht. Leer: die WAN-Adresse. Dieser Wert ist zugleich die Identität dieser Seite.',
    ipcHint: 'Die Verschlüsselung ist fest vorgegeben (IKEv2, AES-256, SHA-256, DH-Gruppe 14). Sobald die Verbindung besteht, führt „Einstellungen für die Gegenseite“ alles auf, was auf dem anderen Gerät einzutragen ist.',
    ipcThisSide: 'Diese Seite', ipcId: 'Identität', ipcDown: 'Nicht verbunden',
    ipcSheetHint: 'Was auf dem anderen Gerät einzutragen ist (Adresse, Schlüssel, Identitäten, Verschlüsselung, Netzwerke):', ipcSheetBtn: 'Einstellungen für die Gegenseite',
    ipcSheet: 'Einstellungen für die Gegenseite', ipcDownload: 'Als Textdatei herunterladen',
    ipcSecret: 'Die Liste enthält den gemeinsamen Schlüssel. Geben Sie sie nur über einen sicheren Kanal an den Administrator der Gegenseite weiter.',
    ipcOthers: function (l) { return 'Es gibt weitere IPsec-Tunnel, Inversa Panel lässt sie unangetastet: ' + l; },
    ipcText: function (c) {
        return ['IPsec-Verbindung: ' + c.name.replace(/^inversapanel-?/, ''),
            'Diese Werte werden auf dem Gerät der GEGENSEITE eingetragen.', '',
            'Entferntes Gateway (Verbindungsadresse)     : ' + c.address,
            'IKE-Version                                 : IKEv2',
            'Authentifizierung                           : Pre-Shared Key (PSK)',
            'Pre-Shared Key                              : ' + c.psk,
            'Lokale ID (des anderen Geräts)              : ' + c.remote_id,
            'Entfernte ID (diese Firewall)               : ' + c.local_id,
            'Phase 1 (IKE)                               : AES-256, SHA-256, DH-Gruppe 14 (2048 Bit)',
            'Phase 2 (ESP)                               : AES-256, SHA-256, PFS-Gruppe 14',
            'Lokale Netzwerke (hinter dem anderen Gerät) : ' + c.remote_networks.join(', '),
            'Entfernte Netzwerke (dieser Seite)          : ' + c.networks.join(', '),
            'NAT-Traversal (NAT-T)                       : an / automatisch',
            'Dead Peer Detection (DPD)                   : an', '',
            'Bei mehreren Netzwerken legen Sie je Netzwerkpaar eine eigene Phase 2 an.',
            'Die Lebensdauern müssen nicht auf beiden Seiten gleich sein.'].join('\n');
    },
    vpnNoPeers: 'Noch keine Geräte hinzugefügt.', vpnAddPh: 'Gerätename, z. B. Mein Telefon', vpnAdd: 'Gerät hinzufügen',
    vpnRemove: function (n) { return n + ' löschen'; }, vpnDisabled: 'Deaktiviert', vpnNever: 'Nie verbunden', vpnConnected: 'Verbunden',
    vpnLast: function (m) { return m < 60 ? 'Zuletzt gesehen vor ' + m + ' Min.' : (m < 1440 ? 'Zuletzt gesehen vor ' + Math.round(m / 60) + ' Std.' : 'Zuletzt gesehen vor ' + (Math.round(m / 1440) === 1 ? '1 Tag' : Math.round(m / 1440) + ' Tagen')); },
    vpnDelConfirm: 'Dieses Gerät löschen? Es kann sich dann nicht mehr verbinden.',
    vpnRenew: 'Neuer Schlüssel', vpnRenewHint: 'Dieses Gerät wurde mit einer älteren Version hinzugefügt, daher wurde sein privater Schlüssel nicht aufbewahrt. Es wird ein neuer Schlüssel erzeugt.',
    vpnRenewConfirm: 'Einen neuen Schlüssel für dieses Gerät erzeugen? Die alte Konfiguration funktioniert dann nicht mehr; laden Sie die neue auf das Gerät.',
    vpnNoKey: 'Der private Schlüssel dieses Geräts ist nicht gespeichert; erneuern Sie ihn mit „Neuer Schlüssel“.',
    copy: 'Kopieren', save: 'Speichern',
    vpnAccCol: 'Zugriff', vpnAccAll: 'Die Netzwerke der Verbindung', vpnAccOnly: 'Nur', vpnAccOnlyThese: 'Nur diese Adressen', vpnAccEdit: 'Zugriff ändern',
    vpnAccOf: function (n) { return n + ' · was darf es erreichen?'; }, vpnAccRemove: function (x) { return x + ' entfernen'; },
    vpnAccCount: function (n) { return n + ' eingeschränkt'; },
    vpnAccAllDesc: function (nets) { return 'Dieses Gerät erreicht alles, was die Verbindung erreicht: ' + nets + '.'; },
    vpnAccIpPh: 'Gerät wählen oder Adresse eingeben, z. B. 10.0.0.20', vpnAccPortPh: 'Port (alle)', vpnAccAdd: 'Hinzufügen',
    vpnAccDns: 'Namensauflösung (DNS)', vpnAccDnsSub: 'An: Das Gerät kann Namen auflösen. Aus: Es verbindet sich nur über IP-Adressen.',
    vpnAccNote: 'Dieses Gerät erreicht nur die Adressen oben und über diese Verbindung kein Internet. Die Regel wird auf der Firewall durchgesetzt: Sie gilt auch, wenn die .conf-Datei auf dem Gerät geändert wird.',
    vpnAccBadIp: 'Geben Sie eine gültige IP-Adresse ein, z. B. 10.0.0.20.', vpnAccBadPort: 'Der Port muss zwischen 1 und 65535 liegen.', vpnAccNeedOne: 'Fügen Sie mindestens eine Adresse hinzu, die das Gerät erreichen darf.',
    vpnAddrEdit: 'Adresse ändern', vpnAddrOf: function (n) { return 'Adresse von ' + n; }, vpnAddrPh: 'IP (automatisch)',
    vpnAddrHint: function (net) { return 'Optional eine Adresse innerhalb von ' + net + '; wenn leer, wird die nächste freie Adresse verwendet.'; },
    vpnAddrChanged: 'Die Adresse wurde geändert. Die Konfiguration auf dem Gerät funktioniert nicht mehr; laden Sie diesen QR-Code oder die .conf-Datei erneut auf das Gerät.',
    vpnAddrChangedNoKey: 'Die Adresse wurde geändert. Passen Sie die Zeile „Address“ in der Konfiguration auf dem Gerät an.',
    qrTitle: function (n) { return n + ' einrichten'; },
    qrStep1: 'Installieren Sie die WireGuard-App auf dem Gerät.', qrStep2: 'Wählen Sie in der App „+“ › „Von QR-Code scannen“ (am Computer: aus Datei importieren).', qrStep3: 'Scannen Sie den Code oder importieren Sie die .conf-Datei, und verbinden Sie sich dann.',
    qrDownload: '.conf-Datei herunterladen', qrSecret: 'Code und Datei enthalten den privaten Schlüssel des Geräts. Geben Sie sie nicht weiter; Sie können sie hier jederzeit erneut abrufen.',
    geoTitle: 'Länder', geoSub: 'Blockieren Sie Verbindungen, die aus dem Internet hereinkommen, nach Land, oder lassen Sie nur die Länder herein, die Sie wählen.',
    geoEnable: 'Nach Land einschränken', geoOn: function (n) { return 'An · ' + n + (n === 1 ? ' Land' : ' Länder') + ' blockiert'; },
    geoOnAllow: function (n) { return 'An · nur Verbindungen aus ' + n + (n === 1 ? ' Land' : ' Ländern') + ' kommen herein'; },
    geoBlockEmpty: 'An, aber nichts wird blockiert, weil kein Land gewählt ist.',
    geoAllowEmpty: 'An, aber kein zugelassenes Land gewählt; nichts wird eingeschränkt, bis Sie eines wählen.',
    geoAllowNoData: 'An, aber für die gewählten Länder gibt es keine Adressdaten; nichts wird eingeschränkt.',
    geoMode: 'Wie soll es arbeiten?', geoModeBlock: 'Die gewählten Länder blockieren', geoModeAllow: 'Nur die gewählten Länder zulassen',
    geoModeBlockDesc: 'Verbindungen aus den gewählten Ländern werden blockiert.',
    geoModeAllowDesc: 'Ihr Netzwerk ist nur aus den gewählten Ländern erreichbar; der Weg hinaus ins Internet ist nicht betroffen.',
    geoVpn: 'VPN-Verbindungen sind ausgenommen', geoVpnSub: 'Ihre VPN-Verbindungen sind aus jedem Land erreichbar.',
    geoAllowed: 'Zugelassene Länder', geoAllowPick: 'Noch kein Land gewählt. Wählen Sie unten die Länder, die zugelassen werden sollen; bis dahin wird nichts eingeschränkt.',
    geoBlockPick: 'Noch kein Land gewählt. Wählen Sie unten die Länder, die blockiert werden sollen.',
    geoAllowSafety: 'Damit wird jedes Land ausgesperrt, das nicht in der Liste steht. Wenn Sie das Panel über das Internet verwalten, achten Sie darauf, dass das Land, in dem Sie sich befinden, in der Liste steht. Nach dem Übernehmen werden die vorherigen Einstellungen automatisch wiederhergestellt, wenn Sie nicht innerhalb von 90 Sekunden bestätigen.',
    geoDir: 'Welche Richtung?', dirIn: 'Nur eingehend', dirBoth: 'Ein- und ausgehend',
    dirInDesc: 'Empfohlen. Verbindungsversuche aus diesen Ländern in Ihr Netzwerk werden blockiert.',
    dirBothDesc: 'Auch der Zugriff auf Websites und Dienste, die in diesen Ländern betrieben werden, wird gesperrt.',
    geoDb: 'Länderdatenbank (GeoIP)', geoDbMaxmind: 'MaxMind GeoLite2 wird verwendet.', geoDbOther: 'In OPNsense ist eine andere GeoIP-Quelle eingerichtet und wird verwendet.',
    geoDbMissing: 'Nicht eingerichtet. Geben Sie Ihren kostenlosen MaxMind-Lizenzschlüssel ein.', geoKeyPh: 'MaxMind-Lizenzschlüssel', geoKeySet: 'Neuer Lizenzschlüssel',
    geoNeedKey: 'Die Ländersperre braucht eine GeoIP-Datenbank: Legen Sie bei MaxMind ein kostenloses GeoLite2-Konto an, erzeugen Sie unter „Manage License Keys“ einen Schlüssel, tragen Sie ihn oben ein und drücken Sie Übernehmen.',
    geoBlocked: 'Blockierte Länder', geoCount: function (n) { return n === 1 ? '1 Land' : n + ' Länder'; }, geoSearch: 'Länder suchen',
    geoStats: 'Blockierte Verbindungsversuche', geoStatsHint: 'Blockierte Pakete seit dem letzten Laden der Regeln.',
    cleanupTitle: 'Entfernen, was Inversa Panel hinzugefügt hat', cleanupText: 'Schaltet Inversa Panel aus und löscht die Aliase, DNS-Blockrichtlinien, Geschwindigkeitslimits und automatischen Firewall-Regeln, die es hinzugefügt hat. Ihre Portweiterleitungen, Netzwerke, VPN-Geräte und DNS-Einstellungen bleiben erhalten.', cleanupBtn: 'Entfernen', cleanupConfirm: 'Inversa Panel ausschalten und die von ihm hinzugefügten Einstellungen löschen?', cleanupDone: 'Die von Inversa Panel hinzugefügten Einstellungen wurden entfernt, und Inversa Panel ist aus.',
    geoNotWorking: 'An, aber noch wird nichts eingeschränkt, weil die Länderdatenbank nicht geladen ist.',
    geoAddresses: function (n) { return n + ' Adressbereiche geladen'; },
    geoKeyOk: 'MaxMind-Schlüssel gespeichert, Datenbank geladen', geoKeyPending: 'Schlüssel gespeichert, Datenbank wird heruntergeladen…',
    geoKeyReplace: 'Neuen Schlüssel eingeben, um ihn zu ersetzen', geoGetKey: 'Wie bekomme ich einen kostenlosen Schlüssel?',
    geoWaitDb: 'Die Datenbank wird heruntergeladen; die Sperre beginnt in wenigen Minuten. Wenn es lange dauert, prüfen Sie den Schlüssel.',
    geoDbipFree: 'kostenlos, ohne Anmeldung', geoDbipLoaded: function (m, n) { return 'Daten ' + m + ' · ' + n + ' Adressbereiche'; },
    geoDbipLater: 'wird heruntergeladen, sobald die Einschränkung eingeschaltet und übernommen wird; monatlich aktualisiert',
    geoUseMaxmind: 'Ich möchte meinen eigenen MaxMind-Schlüssel verwenden', geoDownloading: 'Länderdaten werden heruntergeladen; die Einschränkung beginnt innerhalb von 1-2 Minuten…',
    geoAfterApply: 'Wenn Sie Übernehmen drücken, werden die kostenlosen Länderdaten (DB-IP Lite) heruntergeladen, und die Einschränkung beginnt innerhalb von 1-2 Minuten.',
    /* DNS */
    tabDns: 'DNS',
    dnsTitle: 'DNS', dnsSub: 'Wie Namen aufgelöst werden: Namen, die in Ihr Netzwerk zeigen, und die DNS-Server, die die Firewall befragt.',
    dnsRecTitle: 'Lokale Namen',
    dnsRecSub: 'Lassen Sie einen Namen auf ein Gerät in Ihrem Netzwerk zeigen, z. B. öffnet nas.home.lan Ihren Dateiserver.',
    dnsName: 'Name', dnsIp: 'IP-Adresse, auf die er zeigt',
    dnsWild: 'Einschließlich Subdomains', dnsWildSub: 'Z. B. führen bei example.com auch www.example.com und mail.example.com zur selben Adresse.',
    dnsWildShort: 'mit Subdomains', dnsWildHint: function (n) { return n + ' und alle Namen darunter führen zu dieser Adresse.'; },
    dnsRecEmpty: 'Noch keine Namen.',
    dnsRecNote: 'Die Namen funktionieren auf Geräten, die die Firewall als DNS-Server verwenden (auf allen Geräten, wenn Sicherheit › Kategorien und Apps › „DNS erzwingen“ an ist). In OPNsense erscheinen sie auch unter Dienste › Unbound DNS › Überschreibungen.',
    dnsBadName: 'Geben Sie einen gültigen Namen ein (z. B. nas.home.lan).', dnsBadIp: 'Geben Sie eine gültige IP-Adresse ein (z. B. 192.168.1.20).',
    dnsTaken: function (n) { return 'Für ' + n + ' gibt es bereits einen Eintrag.'; },
    dnsForeignHint: 'Dieser Eintrag wurde auf der eigenen Seite von OPNsense angelegt und kann dort geändert werden.',
    dnsSrvTitle: 'DNS-Server', dnsSrvSub: 'Wen soll die Firewall nach Namen fragen, die sie nicht kennt?',
    dnsLockedSystem: '„System-Nameserver verwenden“ ist in OPNsense eingeschaltet (Dienste › Unbound DNS › Abfrageweiterleitung). Inversa Panel lässt das unangetastet; schalten Sie es dort aus, um die Server hier zu wählen.',
    dnsLockedForward: 'In OPNsense ist bereits eine DNS-Weiterleitung für alle Namen eingerichtet (Dienste › Unbound DNS › Abfrageweiterleitung / DNS über TLS). Inversa Panel lässt das unangetastet; entfernen Sie diese Einträge, um die Server hier zu wählen.',
    dnsModes: {
        auto: ['Automatisch', 'Wie in OPNsense eingestellt; standardmäßig löst es Namen selbst auf, beginnend bei den Root-Servern.'],
        cloudflare: ['Cloudflare', 'Schnell, ungefiltert.'],
        google: ['Google', 'Ungefiltert.'],
        quad9: ['Quad9', 'Blockiert bekannte schädliche Seiten zusätzlich selbst.'],
        adguard: ['AdGuard DNS', 'Blockiert Werbung und Tracker zusätzlich selbst.'],
        custom: ['Eigene Server', 'Sie geben die Adressen der Server ein, die verwendet werden sollen.']
    },
    dnsServers: 'Serveradressen', dnsServersHint: 'Trennen Sie IP-Adressen mit Kommas. Empfohlen werden mindestens zwei Server.',
    dnsDot: 'Verschlüsseltes DNS (DNS over TLS)', dnsDotSub: 'Anfragen werden verschlüsselt gesendet; Ihr Internetanbieter kann weder sehen, nach welchen Namen Sie fragen, noch die Antworten verändern.',
    dnsTlsName: 'Name im Zertifikat des Servers', dnsTlsNameSub: 'Der Server wird anhand dieses Namens überprüft (z. B. dns.quad9.net). Wenn leer, ist die Verbindung verschlüsselt, aber der Server wird nicht überprüft.',
    dnsSafety: 'Vor dem Übernehmen wird geprüft, ob die Server antworten. Nach dem Übernehmen werden die vorherigen Einstellungen automatisch wiederhergestellt, wenn Sie nicht innerhalb von 90 Sekunden bestätigen.',
    dnsUnreachable: 'Es wurde nichts geändert: Diese DNS-Server haben nicht geantwortet (prüfen Sie die Adresse und, bei eingeschaltetem verschlüsseltem DNS, den Zertifikatsnamen):',
    /* attack protection (Suricata) */
    tabIps: 'Angriffsschutz',
    ipsTitle: 'Angriffsschutz', ipsSub: 'Der Datenverkehr der Geräte in Ihrem Netzwerk wird auf bekannte Spuren von Angriffen und Schadsoftware geprüft (Suricata).',
    ipsEnable: 'Datenverkehr auf Angriffe prüfen',
    ipsAfterApply: 'Wenn Sie Übernehmen drücken, werden die Regeln heruntergeladen; die Prüfung beginnt innerhalb von 1-2 Minuten.',
    ipsPreparing: 'Regeln werden heruntergeladen und geladen…',
    ipsRunningDetect: 'Läuft, warnt nur', ipsRunningBlock: 'Läuft, blockiert',
    ipsMemory: function (n) { return n + ' MB Arbeitsspeicher'; },
    ipsRules: function (ago) { return 'Regeln aktualisiert ' + ago; },
    ipsStopped: 'An, aber die Prüfung läuft im Moment nicht.',
    ipsStart: 'Starten', ipsRetry: 'Erneut versuchen',
    ipsNoMem: function (free, need) { return 'Nicht gestartet: zu wenig freier Arbeitsspeicher (' + free + ' MB frei, ' + need + ' MB nötig). Geht der Arbeitsspeicher aus, bleibt die ganze Firewall stehen, daher wird der Schutz nicht gestartet.'; },
    ipsUnavailable: 'Die Komponente zur Einbruchserkennung wurde auf dieser OPNsense-Installation nicht gefunden.',
    ipsForeign: 'Die Einbruchserkennung ist in OPNsense bereits eingeschaltet und wurde außerhalb von Inversa Panel eingerichtet. Inversa Panel lässt diese Einstellungen unangetastet und zeigt unten nur die Warnungen. Um sie hier zu verwalten, schalten Sie zuerst in OPNsense Dienste › Einbruchserkennung aus.',
    ipsMode: 'Wenn eine Spur eines Angriffs gefunden wird', ipsDetect: 'Nur warnen', ipsBlock: 'Blockieren',
    ipsDetectDesc: 'Verdächtige Verbindungen werden aufgelistet, nichts wird getrennt. Empfohlen für den Anfang.',
    ipsBlockDesc: 'Verbindungen, die zu einer Spur eines Angriffs passen, werden getrennt; ein Fehlalarm kann auch eine harmlose Verbindung trennen.',
    ipsBlockNo: {
        none: 'Zum Blockieren wird ein geschütztes Netzwerk benötigt.',
        device: 'Blockieren ist mit dieser Netzwerkhardware nicht möglich (gebündelte Anschlüsse, Bridge oder virtuelle Schnittstelle). Nur der Warnmodus funktioniert.',
        offload: 'Zum Blockieren müssen die Hardware-Offloading-Optionen (CRC, TSO, LRO) unter Schnittstellen › Einstellungen ausgeschaltet sein.'
    },
    ipsWhere: 'Geprüfte Netzwerkkarte', ipsWhereHint: 'Hier wird der Datenverkehr der geschützten Netzwerke beobachtet.',
    ipsGroups: 'Wonach gesucht wird', ipsGroupsSub: 'Jede Gruppe erhöht den Speicherbedarf.',
    ipsG: {
        malware: ['Schadsoftware und Steuerserver', 'Ein infiziertes Gerät, das mit seinem Steuerserver spricht, Krypto-Mining, bekannte schädliche Zertifikate.'],
        attackers: ['Bekannte Angreiferadressen', 'Verbindungen mit Servern, die als Quelle von Angriffen oder als kompromittiert gelistet sind.'],
        exploits: ['Ausnutzung von Sicherheitslücken', 'Datenverkehr, der Schwachstellen von Browsern, Servern und Geräten auszunutzen versucht.'],
        phishing: ['Phishing', 'Gefälschte Seiten, die Passwörter und Kartendaten abgreifen sollen.'],
        scan: ['Scans und Überflutung', 'Portscans und Versuche, einen Dienst zu stören. Kann viele Warnungen erzeugen.']
    },
    ipsAlerts: 'Neueste Warnungen', ipsAlertsNone: 'Noch keine Warnungen.',
    ips24h: function (n, blocked) { return 'Letzte 24 Stunden: ' + n + (n === 1 ? ' Warnung, ' : ' Warnungen, ') + blocked + ' blockiert'; },
    ipsBlocked: 'Blockiert', ipsAlerted: 'Warnung',
    ipsNote: 'Die Einstellungen werden in die eigene Einbruchserkennung von OPNsense geschrieben (Dienste › Einbruchserkennung); die Regeln werden jede Nacht aktualisiert. Der Inhalt von verschlüsseltem Datenverkehr (HTTPS) ist nicht sichtbar: Geprüft wird, wohin eine Verbindung geht, sowie ihre unverschlüsselten Teile. Suricata braucht viel Arbeitsspeicher; empfohlen werden 8 GB RAM.',
    setTitle: 'Einstellungen',
    enabledLabel: 'Inversa Panel', enabledSub: 'Wenn aus, werden die von Inversa Panel hinzugefügten Firewall-Regeln entfernt.',
    langLabel: 'Sprache der Oberfläche', langSub: 'Automatisch verwendet die Systemsprache von OPNsense.', langAuto: 'Automatisch',
    ifLabel: 'Geschützte Netzwerke', ifSub: 'Geräteliste, Internetsperre und DNS-Erzwingung arbeiten auf diesen Schnittstellen.',
    respLabel: 'Antwort für blockierte Domains', respSub: '0.0.0.0 ist schneller; NXDOMAIN bedeutet „diese Domain gibt es nicht“.',
    statsLabel: 'DNS-Statistik', statsSub: 'Schaltet die Unbound-Statistik für die Zähler der Übersicht ein.',
    infoNote: 'Diese Einstellungen werden in die eigene Konfiguration von OPNsense geschrieben: der Alias „inversapanel_blocked“ (Firewall › Aliase) und die Blocklisten-Richtlinie „Inversa Panel (managed)“ (Dienste › Unbound DNS › Blocklisten). Dort sehen Sie dieselben Einstellungen.'
};

/* texts added after 1.1.0 */
(function (t) {
    t.ntSub = 'Meldet Ihnen per Telegram, wenn im Netzwerk etwas passiert. Die Firewall sendet nur Nachrichten; Befehle aus Telegram nimmt sie nicht an.';
    t.ntEnable = 'Benachrichtigungen per Telegram';
    t.ntEnableSub = 'Ereignisse werden jede Minute gesammelt und in einer Nachricht gesendet.';
    t.ntToken = 'Bot-Token';
    t.ntTokenHint = 'Das Token, das Sie von BotFather bekommen haben. Nach dem Speichern wird es auf dieser Seite nicht mehr angezeigt; geben Sie ein neues ein, um es zu ändern.';
    t.ntTokenKept = function (end) { return 'Gespeichert (…' + end + ') · Geben Sie ein neues ein, um es zu ändern'; };
    t.ntChat = 'Chat';
    t.ntChatHint = 'Die Nummer des Chats, an den die Nachrichten gehen. Nachdem Sie dem Bot in Telegram eine Nachricht geschrieben haben, wählen Sie mit „Chat suchen“ den Chat aus.';
    t.ntFind = 'Chat suchen';
    t.ntNoChats = 'Niemand hat dem Bot geschrieben. Öffnen Sie Ihren Bot in Telegram und schreiben Sie eine Nachricht (für eine Gruppe fügen Sie den Bot der Gruppe hinzu), und versuchen Sie es dann erneut.';
    t.ntWhat = 'Was gemeldet wird';
    t.ntKinds = {
        devices: [
            'Neue Geräte',
            'Ein Gerät, das zum ersten Mal gesehen wird, oder eines, das auf Freigabe wartet. Handys, die ihre Adresse zufällig ändern, zählen jedes Mal als neu.'
        ],
        attacks: [
            'Angriffswarnungen',
            'Warnungen des Angriffsschutzes, einmal pro Minute als Zusammenfassung. Angriffsversuche aus dem Internet, die die Firewall ohnehin abweist, werden nicht gemeldet.'
        ],
        vpn: [
            'VPN-Verbindungen',
            'Geräte, die sich von unterwegs verbinden, sowie eine Standort-zu-Standort-Verbindung, die auf- oder abgebaut wird.'
        ],
        internet: [
            'Internetverbindung',
            'Die Verbindung bricht ab und kommt zurück, und die Firewall startet neu. Meldungen über einen Ausfall kommen, sobald die Verbindung wieder da ist.'
        ],
        logins: [
            'Fehlgeschlagene Anmeldungen',
            'Ein Versuch, sich mit falschem Passwort an der Oberfläche der Firewall anzumelden.'
        ],
        health: [
            'Zustand der Firewall',
            'Wenn die Festplatte fast voll ist, der Prozessor heiß läuft oder ein OPNsense-Update wartet.'
        ],
        updates: [
            'Neue Version',
            'GitHub wird einmal täglich abgefragt; Sie erfahren, wenn eine neue Version von Inversa Panel erschienen ist. Die Installation bleibt Ihnen überlassen, unter Einstellungen › Updates.'
        ]
    };
    t.ntSave = 'Speichern';
    t.ntTest = 'Speichern und Testnachricht senden';
    t.ntSaved = 'Benachrichtigungseinstellungen gespeichert.';
    t.ntTestSent = 'Testnachricht gesendet; sehen Sie in Telegram nach.';
    t.ntFailed = 'Das hat nicht funktioniert';
    t.ntLoadFailed = 'Die Benachrichtigungseinstellungen konnten nicht gelesen werden.';
    t.ntError = function (n, text) { return n + (n === 1 ? ' Benachrichtigung konnte' : ' Benachrichtigungen konnten') + ' nicht gesendet werden und ' + (n === 1 ? 'wartet' : 'warten') + ': ' + text; };
    t.ntHowTitle = 'So richten Sie es ein';
    t.ntHow = [
        'In Telegram öffnen Sie einen Chat mit @BotFather, senden /newbot und geben Ihrem Bot einen Namen.',
        'Fügen Sie das Token ein, das BotFather Ihnen gibt (es sieht aus wie 123456789:AAH…), unter „Bot-Token“.',
        'Öffnen Sie Ihren neuen Bot in Telegram und drücken Sie „Start“, oder schreiben Sie ihm eine Nachricht. Für Benachrichtigungen an eine Gruppe fügen Sie den Bot der Gruppe hinzu und schreiben dort eine Nachricht.',
        'Drücken Sie „Chat suchen“ und wählen Sie den Chat aus, der angezeigt wird.',
        'Drücken Sie „Speichern und Testnachricht senden“.'
    ];
    t.ntPrivacy = 'Solange Benachrichtigungen an sind, verbindet sich die Firewall mit api.telegram.org. Die Nachrichten enthalten Gerätenamen sowie MAC- und IP-Adressen; diese laufen über die Server von Telegram. Das Bot-Token wird in der OPNsense-Konfiguration gespeichert und damit auch in deren Sicherungen.';
    t.scanSub = 'Was in OPNsense auf dieser Firewall vor dem Panel eingerichtet war und wie das Panel damit arbeitet. Diese Seite liest nur.';
    t.scanOpenOpn = 'In OPNsense öffnen';
    t.scanAdopted = function (n) { return n + (n === 1 ? ' lokaler Name wird' : ' lokale Namen werden') + ' jetzt auf der DNS-Seite verwaltet.'; };
    t.scanNone = 'Vor dem Panel war nichts eingerichtet, was dessen Funktionen betrifft.';
    t.scanFailed = 'Die vorhandenen Einstellungen konnten nicht gelesen werden.';
    t.scanFoot = 'OPNsense-Einstellungen, die hier nicht mitgezählt werden (Aliase, Zertifikate, Benutzer, andere Plugins), bleiben unverändert; das Panel fasst sie nicht an.';
    t.scanGroups = {
        warn: [
            'Können Probleme verursachen',
            'Einstellungen, die dieselbe Aufgabe wie eine Funktion des Panels erfüllen oder sie beeinflussen. Lesen Sie diese, bevor Sie diese Funktion einschalten.'
        ],
        ok: [
            'Vom Panel so übernommen',
            'Werden auf den Seiten des Panels angezeigt und können dort geändert werden.'
        ],
        stays: [
            'Bleiben auf den OPNsense-Seiten',
            'Funktionieren weiter; das Panel ändert sie nicht.'
        ]
    };
    t.scanFindings = {
        networks: [
            'Lokale Netzwerke',
            'Zu finden unter Netzwerk & Internet › Lokale Netzwerke; Schutz, Trennung und Geschwindigkeitslimit werden dort eingestellt.'
        ],
        networks_locked: [
            'Netzwerke, die das Panel nicht bearbeitet',
            'Netzwerke auf zusammengefassten Anschlüssen (LAGG) oder Brücken sowie Netzwerke ohne feste Adresse werden nur angezeigt. Ändern Sie sie auf den Schnittstellen-Seiten von OPNsense.'
        ],
        multiwan: [
            'Mehr als eine Internetverbindung',
            'Das Panel verwaltet eine einzige Verbindung (WAN). Die Seite Internetverbindung ist nur lesbar; Gateways und Ausfallsicherung bleiben unter System › Gateways. Die Regeln des Panels für eingehende Verbindungen (VPN, Länder, Portweiterleitung) gelten nur für WAN; eine zweite Leitung ist davon nicht erfasst.'
        ],
        wan_type: [
            'Eine Internetverbindung, die das Panel nicht einrichtet',
            'Die Seite Internetverbindung ist nur lesbar. Ändern Sie sie unter Schnittstellen › WAN.'
        ],
        reservations: [
            'Feste Adressen (Dnsmasq)',
            'Werden auf der Seite Geräte als feste Adresse des Geräts angezeigt.'
        ],
        dhcp_other: [
            'Ein anderer DHCP-Server vergibt die Adressen',
            'Das Panel schreibt feste Adressen und DHCP-Bereiche in Dnsmasq. Solange ISC DHCP oder Kea läuft, haben diese Einstellungen keine Wirkung; bei zwei DHCP-Servern im selben Netzwerk können Geräte widersprüchliche Adressen bekommen. Verwalten Sie feste Adressen auf der Seite dieses Servers oder wechseln Sie zuerst zu Dnsmasq.'
        ],
        forwards: [
            'Portweiterleitungen',
            'Weiterleitungen eines Ports von WAN zu einem Gerät stehen auf der Seite Portweiterleitung und lassen sich dort ausschalten oder löschen.'
        ],
        forwards_complex: [
            'Portweiterleitungen, die das Panel nicht bearbeitet',
            'Weiterleitungen mit Aliasen, Portbereichen, anderen Schnittstellen oder eingeschränkter Quelle werden nur angezeigt, damit sie nie aus Versehen vereinfacht werden. Ändern Sie sie unter Firewall › NAT.'
        ],
        dns_names: [
            'Lokale Namen',
            'Auf der DNS-Seite nur lesbar. „Verwalten übernehmen“ macht sie dort bearbeitbar; sie bleiben Unbound-Überschreibungen, und ihre Beschreibung wird „Inversa Panel (managed)“. Ein zweiter Eintrag für denselben Namen bleibt, wo er ist.'
        ],
        unbound_off: [
            'Unbound-DNS ist ausgeschaltet',
            'Sperren nach Kategorie und App, sichere Suche, lokale Namen und der Internetverlauf funktionieren über Unbound. Solange ein anderer Dienst (Dnsmasq, AdGuard Home, Pi-hole) die DNS-Anfragen der Netzwerke beantwortet, tun diese Funktionen nichts, auch wenn sie eingeschaltet sind.'
        ],
        blocklists: [
            'In OPNsense eingerichtete Blocklisten',
            'Sie bleiben neben der Liste des Panels aktiv. Ein Name, den sie sperren, kann gesperrt bleiben, auch wenn das Panel ihn erlaubt; die Kategorie-Schalter des Panels schalten sie nicht aus. Dienste › Unbound DNS › Blocklisten.'
        ],
        dns_servers: [
            'DNS-Server werden in OPNsense gewählt',
            'Die Weiterleitung von Anfragen oder DNS over TLS ist unter Dienste › Unbound DNS eingerichtet. Zwei dieser Einstellungen würden Unbound stören, daher ist die Wahl der DNS-Server im Panel deaktiviert; entfernen Sie dort zuerst die Einstellung, um im Panel zu wählen.'
        ],
        rules: [
            'In OPNsense erstellte Firewall-Regeln',
            'Sie bleiben aktiv und werden im Panel nicht angezeigt. Die Regeln des Panels werden vor Ihren ausgewertet: Ein Gerät, das das Panel sperrt, bleibt gesperrt, auch wenn eine Ihrer Regeln es erlaubt; was das Panel öffnet (ein VPN-Port, eine erlaubte Zelle der Zugriffstabelle), ist offen, auch wenn eine Ihrer Regeln es sperrt. Wo das Panel keine Regel hat, entscheiden Ihre.'
        ],
        nat: [
            'Ausgehende NAT- und 1:1-NAT-Regeln',
            'Sie bleiben unverändert und werden im Panel nicht angezeigt. Bei ausgehendem NAT im manuellen Modus erreicht ein im Panel hinzugefügtes Netzwerk das Internet erst, wenn Sie selbst dafür eine ausgehende NAT-Regel hinzufügen.'
        ],
        wireguard: [
            'In OPNsense erstellte WireGuard-Verbindungen',
            'Sie laufen weiter; das Panel ändert sie nicht. Jede im Panel hinzugefügte Verbindung bekommt eine eigene Instanz und einen freien Port. Die Geräte und Regeln der bestehenden bleiben unter VPN › WireGuard.'
        ],
        ipsec: [
            'In OPNsense erstellte IPsec-Tunnel',
            'Werden auf der VPN-Seite mit Namen aufgeführt; dort nicht bearbeitbar.'
        ],
        openvpn: [
            'OpenVPN',
            'Das Panel hat keine OpenVPN-Seite. Die Verbindungen laufen weiter, und ihre Regeln sind Ihre. Netzwerke dahinter gehören nicht zur Zugriffstabelle und nicht zur Trennung.'
        ],
        ids: [
            'Angriffserkennung läuft bereits',
            'Suricata war schon vor dem Panel eingeschaltet. Die Seite Angriffsschutz zeigt ihren Zustand und ihre Warnungen und lässt Regelsätze und Schnittstellen unangetastet. Damit das Panel sie verwalten kann, schalten Sie sie unter Dienste › Intrusion Detection aus und im Panel wieder ein; das Panel wählt dann seine eigenen Regelgruppen.'
        ],
        zenarmor: [
            'Zenarmor ist installiert',
            'Zenarmor und der Angriffsschutz im Blockiermodus nutzen die Netzwerkkarte auf dieselbe Weise (netmap); betreiben Sie beide nicht auf derselben Schnittstelle. Verwenden Sie den Angriffsschutz im Modus „Nur Warnung“ oder wählen Sie eines von beiden. Das Sperren nach App und Kategorie wird in beiden Systemen getrennt angewendet.'
        ],
        shaper: [
            'Traffic-Shaper-Regeln in OPNsense',
            'Sie bleiben unverändert. Ein Geschwindigkeitslimit für ein Netzwerk fügt die eigenen Regeln des Panels hinzu; bei zwei Regeln für denselben Verkehr gewinnt die erste passende, daher wirkt ein Limit unter Umständen nicht wie erwartet.'
        ],
        ha: [
            'Hochverfügbarkeit (CARP / Konfigurationssynchronisation)',
            'Das Panel wurde nicht in einem Hochverfügbarkeits-Aufbau getestet. Seine automatischen Regeln gibt es nur auf einer Firewall, auf der das Paket installiert ist: Installieren Sie es auf beiden. Die Aufzeichnungen des Panels (Datenverbrauch, Ereignisse) werden nicht synchronisiert.'
        ]
    };
    t.newsTitle = function (v) { return 'Was ist neu in Inversa Panel ' + v; };
    t.newsSub = 'Das Panel wurde aktualisiert. Die Neuerungen in Kürze:';
    t.newsOk = 'Verstanden';
    t.newsGo = 'Anzeigen';
    t.newsHeading = 'Was ist neu';
    t.news = {
        '1.6.0': [
            [
                'Einrichtungsassistent: Netzwerke, Schutz, Freigabe neuer Geräte und Benachrichtigungen Schritt für Schritt einrichten.',
                'wizard'
            ],
            [
                'Seite Updates: Inversa Panel und OPNsense an einer Stelle prüfen und aktualisieren.',
                'updates'
            ],
            [
                'Unser neuer Slogan: so einfach wie ein Router, so leistungsfähig wie OPNsense.',
                ''
            ]
        ],
        '1.5.0': [
            [
                'Auf dem Handy freigeben: Auf einem Handy öffnet sich das Panel mit einer kurzen Ansicht, die nur die Geräte zeigt, die auf Freigabe warten.',
                'devices'
            ],
            [
                'Vorübergehend erlauben: eine Stunde, einen Tag, eine Woche, bis Mitternacht oder bis zu einer Uhrzeit Ihrer Wahl.',
                'devices'
            ],
            [
                'Ein wartendes Gerät abweisen und Geräte löschen.',
                'devices'
            ],
            [
                'Ein neues Gerät wird jetzt innerhalb von Sekunden gemeldet.',
                'notify'
            ]
        ]
    };
    t.tabUpdates = 'Updates';
    t.ugSub = 'Updates von Inversa Panel und von OPNsense. Es wird nichts abgefragt, bis Sie eine Schaltfläche drücken.';
    t.ugPanelSub = 'Versionen auf GitHub';
    t.ugFwSub = 'Die eigene Software der Firewall';
    t.ugInstalled = 'Installierte Version';
    t.ugLastCheck = 'Zuletzt geprüft';
    t.ugWaitOther = 'Sie können es installieren, sobald das OPNsense-Update fertig ist.';
    t.ugFwNotChecked = 'Noch nicht geprüft.';
    t.ugFwCurrent = 'OPNsense ist aktuell.';
    t.ugFwChecking = 'Suche nach Updates…';
    t.ugFwRunning = 'OPNsense wird aktualisiert. Das kann einige Minuten dauern; Sie können die Seite schließen, das Update läuft weiter.';
    t.ugFwRestarting = 'Die Firewall startet neu. Das Internet ist für einige Minuten weg; diese Seite lädt von selbst neu, sobald sie wieder da ist.';
    t.ugFwUpdated = 'OPNsense wurde aktualisiert und ist aktuell.';
    t.ugFwFailed = 'Das OPNsense-Update konnte nicht geprüft oder gestartet werden.';
    t.ugFwNoAccess = 'Die Update-Informationen von OPNsense konnten nicht gelesen werden. Dieser Benutzer darf vielleicht keine Updates einspielen.';
    t.ugFwNew = function (n) { return n === 1 ? '1 Update ist verfügbar.' : n + ' Updates sind verfügbar.'; };
    t.ugFwNewLong = function (v, n, size) { return (v ? 'OPNsense ' + v + ' ist bereit: ' : '') + n + (n === 1 ? ' Paket' : ' Pakete') + (size ? ', ' + size + ' zum Herunterladen' : '') + '.'; };
    t.ugFwReboot = 'Die Firewall startet neu, wenn dieses Update fertig ist; das Internet ist für einige Minuten weg.';
    t.ugShowList = function (n) { return 'Die ' + n + ' Pakete anzeigen'; };
    t.ugHideList = 'Liste ausblenden';
    t.ugFwUpdate = 'Aktualisieren';
    t.ugFwUpdateReboot = 'Aktualisieren und neu starten';
    t.ugFwConfirm = function (v, n, reboot) { return 'OPNsense' + (v ? ' auf ' + v : '') + ' aktualisieren? ' + n + (n === 1 ? ' Paket wird geändert.' : ' Pakete werden geändert.') + (reboot ? ' Die Firewall startet danach neu, und das Internet ist für einige Minuten weg.' : ''); };
    t.ugFwMajor = function (v) { return 'Neue Hauptversion: OPNsense ' + v + '. Führen Sie das Hauptupgrade auf der Update-Seite von OPNsense durch.'; };
    t.ugFwPage = 'Update-Seite von OPNsense';
    t.upCheck = 'Auf Update prüfen';
    t.upChecking = 'Wird geprüft…';
    t.upCurrent = function (v) { return 'Aktuell: ' + v + ' ist die neueste Version.'; };
    t.upNew = function (v) { return 'Eine neue Version ist verfügbar: ' + v; };
    t.upInstall = function (v) { return 'Auf ' + v + ' aktualisieren'; };
    t.upBackupNote = 'Zuerst werden die Konfiguration von OPNsense und die Aufzeichnungen des Panels gesichert; nach der Installation werden die Einstellungen geprüft, und was fehlt, wird aus der Sicherung wiederhergestellt.';
    t.upConfirm = function (v) { return 'Inversa Panel ' + v + ' wird von GitHub heruntergeladen und installiert. Fortfahren?'; };
    t.upRunning = function (v) { return 'Aktualisierung auf ' + v + '.'; };
    t.upSteps = {
        check: 'Version wird geprüft…',
        backup: 'Einstellungen werden gesichert…',
        download: 'Paket wird heruntergeladen…',
        verify: 'Prüfsumme wird verglichen…',
        install: 'Wird installiert…',
        aftercheck: 'Einstellungen werden geprüft…',
        done: ''
    };
    t.upDone = function (a, b) { return 'Aktualisiert von ' + a + ' auf ' + b + '.'; };
    t.upAllThere = 'Einstellungen und Aufzeichnungen wurden geprüft: alles vorhanden.';
    t.upRestored = {
        settings: 'Einstellungen des Panels fehlten; die Konfiguration wurde aus der Sicherung wiederhergestellt.',
        records: 'Fehlende Aufzeichnungsdateien wurden aus der Sicherung wiederhergestellt.'
    };
    t.upProblems = {
        version: 'Die installierte Version ist nicht die erwartete.',
        settings: 'Einige Einstellungen des Panels haben sich geändert; die Sicherung wurde nicht zurückgespielt, weil die Konfiguration inzwischen auch anderswo geändert wurde. Sicherung: /var/db/inversapanel-update/backup/config.xml',
        config_unreadable: 'Die Konfiguration konnte nicht gelesen werden; die Einstellungen wurden nicht geprüft.',
        code: 'Der Code der neuen Version konnte nicht geladen werden.',
        check: 'Die Prüfung nach der Installation wurde nicht abgeschlossen.'
    };
    t.upFailed = 'Die Aktualisierung hat nicht stattgefunden; die installierte Version ist unverändert.';
    t.upErrors = {
        unreachable: 'GitHub ist nicht erreichbar.',
        nopackage: 'Das Panel wurde nicht als Paket installiert; es kann von hier aus nicht aktualisiert werden.',
        norelease: 'Das Paket der neuesten Version wurde nicht gefunden.',
        nonewer: 'Es gibt keine neuere Version.',
        backup: 'Die Sicherung konnte nicht erstellt werden.',
        download: 'Das Paket konnte nicht heruntergeladen werden.',
        checksum: 'Die Prüfsumme des heruntergeladenen Pakets stimmt nicht; es wurde nicht installiert.',
        install: 'Das Paket konnte nicht installiert werden.',
        stale: 'Die Aktualisierung ist auf halbem Weg stehen geblieben.'
    };
    t.bkSub = 'Eine Sicherung der OPNsense-Konfiguration; die Einstellungen des Panels sind darin enthalten.';
    t.bkGetTitle = 'Sicherung erstellen';
    t.bkGetSub = 'Lädt die Konfiguration, so wie sie jetzt ist, auf Ihren Computer.';
    t.bkDownload = 'Sicherung herunterladen';
    t.bkDownloadShort = 'Herunterladen';
    t.bkSecret = 'Die Datei enthält Passwort-Hashes und VPN-Schlüssel; bewahren Sie sie an einem Ort auf, dem Sie vertrauen.';
    t.bkPutTitle = 'Aus einer Sicherung wiederherstellen';
    t.bkPutSub = 'Spielt eine zuvor heruntergeladene Sicherungsdatei zurück.';
    t.bkUpload = 'Datei wählen und wiederherstellen';
    t.bkRestartNote = 'Das Wiederherstellen startet die Firewall neu; das Internet ist 1–2 Minuten weg. Änderungen, die nach der Sicherung gemacht wurden, gehen verloren.';
    t.bkCopies = 'Kopien auf der Firewall';
    t.bkCopiesSub = 'Jede Nacht um 03:15 Uhr wird eine Kopie erstellt, wenn sich die Konfiguration geändert hat; die letzten 7 Kopien bleiben erhalten.';
    t.bkNow = 'Jetzt eine Kopie erstellen';
    t.bkNone = 'Noch keine Kopien; die erste wird heute Nacht erstellt.';
    t.bkRestore = 'Wiederherstellen';
    t.bkConfirmCopy = function (n) { return 'Die Kopie von ' + n + ' wird zurückgespielt und die Firewall startet neu. Das Internet ist 1–2 Minuten weg; Änderungen, die danach gemacht wurden, gehen verloren. Fortfahren?'; };
    t.bkConfirmFile = function (n) { return 'Die Datei ' + n + ' wird zurückgespielt und die Firewall startet neu. Das Internet ist 1–2 Minuten weg; die Einstellungen in der Datei ersetzen die jetzigen. Fortfahren?'; };
    t.bkRestarting = 'Die Konfiguration wurde zurückgespielt; die Firewall startet neu. Diese Seite lädt von selbst neu, sobald sie wieder da ist (1–2 Minuten).';
    t.bkErrors = {
        notconfig: 'Diese Datei ist keine OPNsense-Konfiguration.',
        incomplete: 'Die Konfigurationsdatei wirkt unvollständig; sie wurde nicht zurückgespielt.',
        restore: 'Die Konfiguration konnte nicht zurückgespielt werden; die jetzigen Einstellungen sind unverändert.',
        notfound: 'Die Kopie wurde nicht gefunden.'
    };
    t.aboutNotInstalled = 'nicht installiert';
    t.wakeTitle = 'Aufwecken';
    t.wakeSub = 'Bittet ein ausgeschaltetes Gerät, sich einzuschalten (Wake-on-LAN); das Gerät muss das eingeschaltet haben.';
    t.wakeBtn = 'Aufwecken';
    t.wakeSent = 'Die Aufwecken-Anfrage wurde gesendet; das Gerät schaltet sich bald ein, wenn es das unterstützt.';
    t.wakeFailed = 'Die Aufwecken-Anfrage konnte nicht gesendet werden.';
    t.landLabel = 'Inversa Panel nach der Anmeldung öffnen';
    t.landSub = 'Nur für Ihren Benutzer; ist es aus, öffnet sich nach der Anmeldung die eigene Seite von OPNsense.';
    t.landOther = function (p) { return 'Für Ihren Benutzer ist in OPNsense eine andere Seite eingestellt: ' + p + '. Wenn Sie dies einschalten, wird sie ersetzt.'; };
    t.pauseTitle = 'Kurz pausieren';
    t.pause30 = '30 Minuten';
    t.pause60 = '1 Stunde';
    t.pause120 = '2 Stunden';
    t.pauseMorning = 'Bis 07:00 Uhr';
    t.pauseResume = 'Fortsetzen';
    t.pauseUntil = function (c) { return 'Pausiert bis ' + c; };
    t.pauseUntilLong = function (c) { return 'Der Internetzugang ist pausiert bis ' + c + '.'; };
    t.pauseSub = 'Wirkt sofort; das Internet kommt von selbst zurück, wenn die Zeit abgelaufen ist.';
    t.apprAllowed = 'Erlaubt';
    t.apprRevoke = 'Die Erlaubnis entziehen, in diesem Netzwerk zu sein';
    t.apprToggleAria = function (n) { return 'Erlaubnis von ' + n + ', im Netzwerk zu sein'; };
    t.apprRejected = 'Abgewiesen';
    t.apprReject = 'Abweisen';
    t.apprRejectedPanel = 'Sie haben dieses Gerät abgewiesen: Es kann weder das Internet noch andere Netzwerke erreichen, und Sie werden nicht erneut darüber benachrichtigt.';
    t.apprFor = 'Vorübergehend erlauben';
    t.allow1h = '1 Stunde';
    t.allow1d = '1 Tag';
    t.allow1w = '1 Woche';
    t.allowForever = 'Dauerhaft';
    t.apprNow = 'Vorübergehend erlauben und Abweisen wirken sofort. „Freigeben“ gilt dauerhaft und wird mit „Übernehmen“ gespeichert.';
    t.apprUntil = function (w) { return 'Erlaubt bis ' + w; };
    t.apprUntilLong = function (w) { return 'Vorübergehend erlaubt, bis ' + w + '. Danach wartet das Gerät wieder auf Freigabe.'; };
    t.qTitle = function (n) { return n === 1 ? '1 Gerät möchte dem Netzwerk beitreten' : n + ' Geräte möchten dem Netzwerk beitreten'; };
    t.qHint = 'Bis Sie sie erlauben, erreichen sie weder das Internet noch andere Netzwerke.';
    t.qAllow = 'Erlauben';
    t.qNone = 'Kein Gerät wartet mehr.';
    t.qFull = 'Das vollständige Panel öffnen';
    t.qAllowed = function (n, w) { return w ? n + ' ist erlaubt bis ' + w + '.' : n + ' ist dauerhaft erlaubt.'; };
    t.qRejected = function (n) { return n + ' wurde abgewiesen; Sie werden über dieses Gerät nicht erneut benachrichtigt.'; };
    t.qPending = 'Eine Netzwerkänderung wartet auf ihre Bestätigung. Bestätigen Sie sie zuerst oder warten Sie, bis sie zurückgenommen wurde.';
    t.forgetTitle = 'Gerät löschen';
    t.forgetBtn = 'Löschen';
    t.forgetSub = 'Sein Name, seine Freigabe, seine feste IP und sein Platz in Zeitplänen werden entfernt. Wenn es zurückkommt, ist es ein neues Gerät; in einem Netzwerk, das fragt, wartet es erneut auf Freigabe.';
    t.forgetConfirm = function (n) { return 'Gerät ' + n + ' löschen? Sein Name, seine Freigabe, seine feste IP und sein Platz in Zeitplänen werden entfernt. Ist das Gerät jetzt im Netzwerk, erscheint es als neues Gerät wieder.'; };
    t.forgetDone = function (n) { return n + ' wurde gelöscht.'; };
    t.allowMidnight = 'Bis Mitternacht';
    t.allowPick = 'Ende wählen…';
    t.allowPickLabel = 'Erlaubt bis';
    t.allowPickCancel = 'Abbrechen';
    t.allowPickSub = 'Höchstens 30 Tage im Voraus. Für länger wählen Sie „Dauerhaft“.';
    t.allowPickBad = 'Das Ende muss nach jetzt liegen und höchstens 30 Tage entfernt sein.';
    t.allowMidnightShort = 'Mitternacht';
    t.allowPickShort = 'Zeit wählen…';
    t.qFullShort = 'Ganzes Panel';
    t.wiz = {
        start: [
            'Willkommen bei Inversa Panel',
            'Wir richten die Grundlagen in wenigen Schritten ein. Jeder Schritt lässt sich später unter Einstellungen ändern.'
        ],
        nets: [
            'Zu schützende Netzwerke',
            'Sperrregeln, der DNS-Filter und die Freigabe neuer Geräte gelten nur für die Netzwerke, die Sie wählen.'
        ],
        protect: [
            'Schutz',
            'Wählen Sie, was die Firewall über DNS sperren soll.'
        ],
        devices: [
            'Neue Geräte',
            'In welchen Netzwerken soll ein neues Gerät warten, bis Sie es hereinlassen?'
        ],
        notify: [
            'Benachrichtigungen',
            'Optional: Lassen Sie sich per Telegram melden, wenn ein neues Gerät auftaucht oder ein Angriff abgewehrt wird. Diese Einstellungen werden mit „Speichern“ unten sofort gespeichert; wenn Sie sie nicht wollen, drücken Sie Weiter.'
        ],
        done: [
            'Zusammenfassung',
            'Ihre Auswahl steht unten. „Übernehmen und abschließen“ wendet sie auf einmal an.'
        ]
    };
    t.wizKicker = 'Einrichtungsassistent';
    t.wizShort = {
        start: 'Start',
        nets: 'Netzwerke',
        protect: 'Schutz',
        devices: 'Neue Geräte',
        notify: 'Benachrichtigungen',
        done: 'Zusammenfassung'
    };
    t.wizNextTo = function (n) { return 'Weiter: ' + n + ' →'; };
    t.wizStep = function (n, m) { return 'Schritt ' + n + ' von ' + m; };
    t.wizClose = 'Assistent schließen';
    t.wizBack = 'Zurück';
    t.wizNext = 'Weiter';
    t.wizFinish = 'Übernehmen und abschließen';
    t.wizSafe = 'Vor dem letzten Schritt ändert sich nichts an der Firewall. Nur die Sprache, die Seite nach der Anmeldung und die Benachrichtigungen werden gespeichert, sobald Sie sie ändern.';
    t.wizNoNet = 'Wählen Sie mindestens ein Netzwerk.';
    t.wizScan = 'Wenn Sie zuvor in OPNsense etwas eingerichtet haben, können Sie sehen, wie das Panel es versteht.';
    t.wizRecommended = 'Empfohlen';
    t.wizIps = 'Der Angriffsschutz (Suricata) braucht mehr Arbeitsspeicher; Sie können ihn später unter Sicherheit › Angriffsschutz einschalten.';
    t.wizApprSub = 'Wenn an, erreicht ein neues Gerät weder das Internet noch andere Netzwerke, bis Sie es hereinlassen.';
    t.wizApprNote = 'Die Geräte in diesen Netzwerken gelten jetzt als freigegeben, damit niemand abgeschnitten wird. Um neue Geräte von Ihrem Handy aus hereinzulassen, nutzen Sie die Telegram-Benachrichtigungen, das VPN und „Inversa Panel nach der Anmeldung öffnen“.';
    t.wizNone = 'Keine';
    t.wizDoneNote = 'Nach dem Übernehmen können Sie alles auf den Seiten im Menü ändern. Der Assistent lässt sich in den Einstellungen erneut starten.';
    t.wizStart = 'Einrichtungsassistent starten';
    t.wizAgain = 'Einrichtungsassistent';
    t.wizAgainSub = 'Netzwerke, Schutz, Freigabe neuer Geräte und Benachrichtigungen noch einmal Schritt für Schritt einrichten.';
    t.wizAgainBtn = 'Assistent starten';
    t.wanSpeedBtn = 'Geschwindigkeitstest';
    t.wanSpeeding = 'Wird gemessen… (15 s)';
    t.wanUp = 'Upload';
    t.wanPing = 'Latenz';
    t.wanSpeedFailed = 'Die Geschwindigkeit konnte nicht gemessen werden.';
    t.wanSpeedLimited = function (m) { return 'Der Messserver lehnt Tests ab, die kurz hintereinander gemacht werden. Versuchen Sie es in etwa ' + m + ' Minuten erneut.'; };
    t.pfTargetHint = 'Wählen Sie aus der Liste oder geben Sie eine IP-Adresse ein.';
})(window.InversaPanelI18n.de);

/* device identity watch (1.7.0) */
(function (t) {
    t.ov.evId = 'Geräteidentität geändert';
    t.ov.evIdHeld = 'Geräteidentität geändert, Freigabe zurückgenommen';
    t.idwLabel = 'Geräteidentität überwachen';
    t.idwSub = 'Eine MAC-Adresse lässt sich kopieren, die Art, wie ein Gerät seine IP-Adresse anfragt, meist nicht. Sie werden benachrichtigt, wenn ein freigegebenes Gerät wie ein anderer Gerätetyp auftritt, wenn zwei Geräte gleichzeitig eine Adresse nutzen oder wenn es seine IP-Adresse plötzlich selbst setzt. Das macht eine Kopie sichtbar, verhindert sie aber nicht: Die Kopie eines gleichartigen Geräts (iPhone von iPhone) kann unbemerkt bleiben. Funktioniert nur mit dem dnsmasq-DHCP-Server von OPNsense.';
    t.idwModes = { off: 'Aus', tell: 'Benachrichtigen', hold: 'Freigabe zurücknehmen' };
    t.idwConflict = function (f) { return 'In dnsmasq ist bereits ein anderes Lease-Skript eingerichtet (' + f + '). dnsmasq erlaubt nur eines, daher lässt das Panel es unverändert und die Überwachung arbeitet nicht.'; };
    t.idwNoDnsmasq = 'Dieses OPNsense hat keinen Ordner für dnsmasq-Erweiterungen; die Überwachung arbeitet nicht.';
    t.idwKinds = { apple: 'Apple-Gerät', windows: 'Windows', android: 'Android', linux: 'Linux', other: 'Unbekannter Typ' };
    t.idwKnown = 'Bekannte Identität';
    t.idwBadge = 'Identität geändert';
    t.idwWhy = { fp: 'Es hat seine IP-Adresse wie ein anderer Gerätetyp angefragt.', both: 'Zwei verschiedene Geräte nutzen diese MAC-Adresse.', name: 'Es hat einen anderen Namen angegeben.', manual: 'Es hat seine IP-Adresse selbst gesetzt, statt sie anzufragen.' };
    t.idwSeen = function (k, n) { return 'Zuletzt gesehen: ' + k + (n ? ' · ' + n : '') + '.'; };
    t.idwWhen = function (a) { return '(' + a + ')'; };
    t.idwAccept = 'Das ist meins, übernehmen';
    t.idwAccepted = 'Die neue Identität wurde für dieses Gerät übernommen.';
    t.qIdTitle = function (n) { return n === 1 ? 'Die Identität von 1 Gerät hat sich geändert' : 'Die Identität von ' + n + ' Geräten hat sich geändert'; };
    t.qIdHint = 'Die MAC-Adresse wurde vielleicht kopiert. Übernehmen Sie es, wenn es Ihres ist, sonst weisen Sie es ab.';
    t.news['1.7.0'] = [['Überwachung der Geräteidentität: Ein Gerät mit kopierter MAC-Adresse fällt auf; Sie werden benachrichtigt oder die Freigabe wird zurückgenommen (Einstellungen, standardmäßig aus).', 'settings']];
})(window.InversaPanelI18n.de);
