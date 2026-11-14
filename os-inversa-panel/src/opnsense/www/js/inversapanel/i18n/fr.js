/*
 * SPDX-License-Identifier: BSD-2-Clause
 * Copyright (C) 2026 Inversa Bilişim
 *
 * French.
 */
window.InversaPanelI18n = window.InversaPanelI18n || {};
window.InversaPanelI18n.fr = {
    langName: 'Français',
    locale: 'fr-FR',
    ov: {
        yesterday: 'hier', now: 'maintenant', show: 'Afficher', none: 'Aucun', connected: 'Connecté', noConn: 'Non connecté', noAnswer: 'pas de réponse', pct: function (n) { return n + ' %'; },
        minAgo: function (n) { return 'il y a ' + n + ' min'; },
        durDH: function (d, h) { return d + (d > 1 ? ' jours' : ' jour') + (h ? ' ' + h + ' h' : ''); },
        durHM: function (h, m) { return h + ' h' + (m ? ' ' + m + ' min' : ''); },
        durM: function (m) { return m < 1 ? 'moins d’une minute' : m + ' min'; },
        todoTitle: function (n) { return n > 1 ? n + ' points demandent votre attention' : n + ' point demande votre attention'; },
        todoOff: 'Inversa Panel est désactivé ; rien n’est protégé', todoWan: 'Pas de connexion Internet',
        todoWait: function (n) { return n > 1 ? n + ' nouveaux appareils attendent votre approbation' : n + ' nouvel appareil attend votre approbation'; },
        todoVpn: function (name) { return 'La connexion VPN « ' + name + ' » est coupée'; },
        todoIps: 'La protection contre les attaques est activée mais ne fonctionne pas',
        wanUpShort: 'Internet connecté', lastAlert: function (w) { return 'dernière alerte d’attaque ' + w; },
        chkInternet: 'Internet', chkGeo: 'Blocage par pays', chkUpdate: 'Mise à jour',
        notRunning: 'À l’arrêt', ipsBlocking: 'Blocage', ipsWatching: 'Alerte',
        geoAllow: function (n) { return n === 1 ? '1 pays autorisé' : n + ' pays autorisés'; }, geoBlock: function (n) { return n === 1 ? '1 pays bloqué' : n + ' pays bloqués'; },
        vpnUp: function (a, b) { return a + ' / ' + b + ' en ligne'; },
        updReady: function (v) { return v + ' disponible'; }, updPending: 'Mise à jour disponible', upToDate: 'À jour',
        waiting: function (n) { return n + ' en attente d’approbation'; },
        kpiBlocked: 'Requêtes DNS bloquées · aujourd’hui', noQueries: 'Aucune requête aujourd’hui pour l’instant',
        kpiAlerts: 'Alertes d’attaque · aujourd’hui', ipsOff: 'La protection contre les attaques est désactivée', noAlerts: 'Aucune alerte aujourd’hui',
        allBlocked: 'Toutes bloquées', someBlocked: function (n) { return n + (n > 1 ? ' bloquées' : ' bloquée'); }, lastAt: function (w) { return 'dernière ' + w; },
        kpiSpeed: 'Débit actuel', kpiUsage: 'Données utilisées · aujourd’hui', since: function (w) { return 'depuis ' + w; }, usageSoon: 'L’enregistrement commence dans la minute',
        gateway: 'Passerelle', latency: 'Latence Internet', dnsTime: 'Résolution de nom', upSince: 'Connecté depuis',
        netsSub: 'Appareils · Mbit/s actuels', isolated: 'isolé', devs: function (n) { return n + (n > 1 ? ' appareils' : ' appareil'); },
        peers: function (a, b) { return a + ' / ' + b + (b > 1 ? ' appareils connectés' : ' appareil connecté'); }, vpnNone: 'Aucune connexion VPN configurée.',
        blockedTitle: 'Requêtes bloquées', blockedSub: 'Dernières 24 heures · par heure', reqs: function (n) { return n + (n > 1 ? ' requêtes' : ' requête'); },
        evTitle: 'Événements récents', evNone: 'Rien d’enregistré pour l’instant.', times: function (n) { return n + ' fois'; },
        evAttackBlocked: 'Attaque bloquée', evAttack: 'Alerte d’attaque', evWait: 'Nouvel appareil en attente d’approbation', evNew: 'Nouvel appareil sur le réseau', evPeer: 'Appareil VPN connecté',
        evVpnUp: 'Connexion VPN établie', evVpnDown: 'Connexion VPN perdue', evWanUp: 'Connexion Internet rétablie', evWanDown: 'Connexion Internet perdue',
        evSchedOn: 'Horaire démarré', evSchedOff: 'Horaire terminé', evLists: 'Listes de blocage mises à jour', evBoot: 'Pare-feu redémarré', evDisk: 'Le disque du pare-feu se remplit', evTemp: 'Le pare-feu chauffe', evUpdate: 'Une mise à jour d’OPNsense attend',
        todoDisk: function (n) { return 'Le disque du pare-feu est plein à ' + n + ' %'; }, todoTemp: function (n) { return 'Le pare-feu chauffe : ' + n + ' °C'; },
        sysTitle: 'Système', upFor: function (s) { return 'démarré il y a ' + s; }, cpu: 'Processeur', memory: 'Mémoire', disk: 'Disque', temp: 'Température',
        version: 'Version', cfgChanged: 'Dernière modification de la configuration'
    },
    appSub: 'Aussi simple qu’un modem, aussi puissant qu’OPNsense',
    tabLogs: 'Journaux',
    lgCount: function (n) { return n + (n > 1 ? ' entrées' : ' entrée'); }, lgCsv: 'Télécharger en CSV', lgFailed: 'Impossible de lire les entrées.', lgMore: 'Entrées plus anciennes',
    lgShown: function (n, all) { return n + ' sur ' + all + (all > 1 ? ' entrées' : ' entrée'); },
    lgTime: 'Heure', lgWho: 'Qui', lgWhere: 'Vers où', lgWhat: 'Ce qui s’est passé', lgSource: 'Source', lgResult: 'Résultat', lgPeriod: 'Période',
    lgToday: 'Dernières 24 heures', lgDays: function (n) { return n + (n > 1 ? ' jours' : ' jour'); }, lgTimes: function (n) { return n + ' fois dans l’heure'; },
    lgAttacksTitle: 'Attaques', lgAttacksSub: 'Tentatives venues de l’extérieur contre votre réseau : alertes de la protection contre les attaques, ce que les règles par pays ont arrêté et les connexions refusées par le pare-feu. Conservé 30 jours.',
    lgAttacksSearch: 'Rechercher une adresse, un pays, un appareil ou un port', lgAttacksNone: 'Aucune entrée sur cette période.',
    lgTopSrc: 'Adresses les plus actives', lgTopCc: 'Pays', lgTopTarget: 'Les plus visés',
    lgIps: 'Trace d’une attaque', lgIpsOut: 'Un appareil a tenté de joindre une adresse connue comme dangereuse', lgGeo: 'Tentative de connexion depuis un pays non autorisé',
    lgBlockedAddr: 'Tentative de connexion depuis une adresse que vous avez bloquée', lgFw: 'Tentative de connexion vers un port fermé',
    lgSrcGeo: 'Règles par pays', lgSrcFw: 'Pare-feu', lgFirewall: 'Le pare-feu',
    lgBlocked: 'Bloqué', lgAlertOnly: 'Alerte seule', lgAllowed: 'Autorisé', lgBlock: 'Bloquer', lgAllow: 'Autoriser', lgIsBlocked: 'Bloquée', lgInList: 'Dans la liste',
    lgBlockedList: 'Adresses bloquées', lgUnblock: function (ip) { return 'Débloquer ' + ip; },
    lgNowBlocked: function (ip) { return ip + ' est bloquée.'; }, lgUnblocked: function (ip) { return ip + ' n’est plus bloquée.'; },
    lgHistoryTitle: 'Historique Internet', lgHistorySub: 'Quel appareil a visité quel site, et ce qui a été bloqué. Seul le nom de domaine est visible, jamais le contenu ni l’adresse complète d’une page.',
    lgHistoryKeep: 'Afficher l’historique Internet', lgHistoryKeepSub: 'Désactivé : cette page n’affiche les sites d’aucun appareil. Les entrées sont lues dans les statistiques DNS d’OPNsense ; OPNsense conserve les 7 derniers jours.',
    lgNetworks: 'Réseaux', lgNoStats: 'L’historique Internet est lu dans les statistiques DNS, qui sont désactivées. Vous pouvez les activer dans Paramètres.',
    lgHistoryOff: 'L’historique Internet est désactivé.', lgHistoryNoNet: 'Choisissez au moins un réseau pour voir son historique.', lgHistoryNone: 'Aucune entrée sur cette période.',
    lgHistorySearch: 'Rechercher un appareil ou un domaine', lgLastHour: 'Dernière heure', lgLast24: 'Dernières 24 heures', lgDomain: 'Domaine',
    lgEventsTitle: 'Accès et modifications', lgEventsSub: 'Qui s’est connecté, qui a ouvert une session, quel paramètre a changé. Conservé 90 jours.',
    lgEventsSearch: 'Rechercher une personne, un appareil ou un paramètre', lgEventsNone: 'Aucune entrée sur cette période.', lgEvent: 'Événement', lgWhoWhat: 'Qui / quoi', lgDetail: 'Détail', lgType: 'Type',
    lgTypeLogin: 'Connexion au panneau', lgTypeConfig: 'Modification de paramètre', lgSystem: 'Système',
    lgLogin: 'Connexion au panneau', lgLoginOk: 'Réussie', lgLoginTry: 'Tentative de connexion', lgLoginBad: 'Mot de passe incorrect', lgConfig: 'Paramètre modifié',
    pgRange: function (a, b, n) { return a + '–' + b + ' sur ' + n; }, pgSize: 'Par page', pgPrev: 'Page précédente', pgNext: 'Page suivante', pgPages: 'Pages', pgPage: function (n) { return 'Page ' + n; },
    tabBackup: 'Sauvegarde', logout: 'Déconnexion', tabNotify: 'Notifications',
    tabScan: 'Réglages existants', scanOpen: 'Ouvrir la page', scanAdopt: 'Reprendre', welcomeScan: 'Examiner les réglages existants',
    tabAbout: 'À propos', aboutSub: 'La version installée, qui la développe, à qui s’adresser et les logiciels sur lesquels le panneau repose.',
    aboutVersion: 'Version', aboutRunsOn: 'Fonctionne sur', aboutLicense: 'Licence', aboutSource: 'Code source',
    aboutCompany: [
        'Inversa Panel est un plugin open source d’Inversa Bilişim qui permet de gérer depuis un seul écran les réglages les plus utilisés d’OPNsense.',
        'Notre objectif : un pare-feu puissant que l’on peut utiliser facilement sans être spécialiste des réseaux. Les appareils, le filtre Internet, le VPN, la protection contre les attaques et les journaux sont réunis sur un seul écran simple, sans avoir à parcourir les menus d’OPNsense pour les tâches de tous les jours.',
        'Le panneau travaille avec les réglages d’OPNsense : il lit ce qui existe et ne modifie que ce que vous changez. Vous pouvez revenir aux pages d’OPNsense à tout moment.',
        'Vos suggestions et vos rapports de bogue nous aident à améliorer le panneau ; vous pouvez nous joindre aux adresses indiquées sur cette page.'
    ],
    aboutWeb: 'Site web', aboutMail: 'E-mail', aboutIssues: 'Bogues et demandes', aboutIssuesLink: 'Signaler sur GitHub',
    aboutSupport: 'Informations d’assistance', aboutSupportSub: 'Envoyez ce résumé lorsque vous demandez de l’aide. Il ne contient ni mot de passe, ni clé, ni adresse d’appareil.',
    aboutCopy: 'Copier les informations d’assistance', aboutCopied: 'Copié',
    aboutBuiltOn: 'Repose sur', aboutBuiltOnSub: 'Inversa Panel réunit ce qu’offrent ces projets open source.',
    aboutOpnsense: 'Le pare-feu lui-même', aboutUnbound: 'Résolution et blocage DNS', aboutSuricata: 'Protection contre les attaques',
    aboutWireguard: 'VPN', aboutStrongswan: 'VPN IPsec', aboutDbip: 'Données par pays · IP Geolocation by DB-IP',
    tabDash: 'Vue d’ensemble', tabDevices: 'Appareils', tabSecurity: 'Sécurité', tabSettings: 'Paramètres',
    subFilter: 'Catégories et applications', subLists: 'Liste d’autorisation / de blocage', subtabsAria: 'Pages de cette section',
    protOn: 'Protection activée', protPartial: 'Protection en partie désactivée', protOff: 'Inversa Panel désactivé',
    protWhyTitle: 'Protections désactivées :', protWhyOk: 'Le blocage des publicités et des sites malveillants est activé.',
    protWhyOff: 'Inversa Panel est désactivé, aucune protection n’est donc appliquée.',
    protGoFilter: 'Cliquez pour les activer (Sécurité).', protGoSettings: 'Cliquez pour l’activer (Paramètres).',
    statusWhy: function (list) { return 'Désactivé : ' + list.join(', '); },
    pending: function (n) { return n > 1 ? n + ' modifications non enregistrées' : n + ' modification non enregistrée'; },
    pendingHint: 'Les modifications sont écrites sur le pare-feu lorsque vous appuyez sur « Appliquer ».',
    apply: 'Appliquer', applying: 'Application…', discard: 'Abandonner',
    showChanges: 'Voir les modifications', hideChanges: 'Masquer', changesTitle: 'Modifications non enregistrées', undo: 'Rétablir',
    applied: 'Modifications appliquées. Les règles du pare-feu ont été mises à jour ; le blocage DNS s’actualise en arrière-plan et prend effet d’ici 1 à 2 minutes.',
    applyFailed: 'Les modifications n’ont pas pu être appliquées :',
    validationFailed: 'Certaines valeurs ne sont pas valides :',
    loadFailed: 'Impossible de charger les données d’Inversa Panel. Veuillez recharger la page.',
    welcomeTitle: 'Bienvenue dans Inversa Panel',
    welcomeText: 'Votre configuration OPNsense actuelle est conservée ; Inversa Panel n’active rien tant que vous ne changez rien. Activer la protection recommandée (publicités et sites malveillants) ?',
    welcomeYes: 'Activer la protection recommandée', welcomeNo: 'Pas maintenant',
    statusOk: 'Votre réseau est protégé', statusWarn: 'Certaines protections sont désactivées', statusOff: 'Inversa Panel est désactivé',
    statusLine: function (online, total) {
        return (online > 1 ? online + ' appareils en ligne' : online + ' appareil en ligne') + ' · ' + (total > 1 ? total + ' appareils connus' : total + ' appareil connu');
    },
    dnsFilter: 'Filtre DNS', active: 'Actif', inactive: 'Désactivé',
    kpiOnline: 'Appareils en ligne', kpiOnlineSub: function (n) { return n > 1 ? 'sur ' + n + ' appareils connus' : 'sur ' + n + ' appareil connu'; },
    kpiBlocked: 'Requêtes DNS bloquées', kpiBlockedSub: function (p) { return p + ' % de toutes les requêtes'; },
    kpiNoStats: 'Statistiques désactivées',
    kpiDown: 'Réception actuelle', kpiUp: 'Envoi actuel', kpiRateSub: 'Connexion Internet (WAN)',
    chartTitle: 'Trafic Internet', chartSub: function (m) { return m + ' dernières minutes · WAN'; },
    legendDown: 'Réception', legendUp: 'Envoi', chartWaiting: 'Collecte des données…',
    topDevTitle: 'Appareils les plus actifs', topDevSub: 'Connexions ouvertes', conns: function (n) { return n + (n > 1 ? ' connexions' : ' connexion'); },
    topBlockedTitle: 'Domaines les plus bloqués', noBlocked: 'Aucune requête bloquée pour l’instant.', customList: 'Application / liste personnalisée',
    statsOff: 'Les statistiques DNS sont désactivées. Vous pouvez les activer dans Paramètres.',
    quickTitle: 'Protection rapide', quickSub: 'Activer / désactiver en un clic', editAll: 'Tous les réglages de blocage', allDevices: 'Tous les appareils',
    on: 'Activé', off: 'Désactivé',
    devTitle: 'Appareils',
    devSub: 'Appareils vus sur les réseaux protégés. Cliquez sur le nom d’un appareil pour le modifier. Un appareil dont Internet est coupé peut toujours joindre le pare-feu (DNS, DHCP).',
    search: 'Rechercher un nom, un réseau, une IP ou une MAC', fAll: 'Tous', fOnline: 'En ligne', fBlocked: 'Internet coupé', fWaiting: 'En attente d’approbation',
    fShown: function (n, all) { return n === all ? all + (all > 1 ? ' appareils' : ' appareil') : n + ' sur ' + all + (all > 1 ? ' appareils' : ' appareil'); }, fReset: 'Effacer les filtres', fNetworkShow: 'Afficher les appareils de ce réseau',
    sortHint: 'Cliquez pour trier',
    colDevice: 'Appareil', colNetwork: 'Réseau', colIp: 'Adresse IP', colMac: 'Adresse MAC', colSeen: 'État', colConns: 'Connexions', colNet: 'Internet',
    online: 'En ligne', offline: 'Hors ligne',
    justNow: 'à l’instant',
    agoMin: function (n) { return 'il y a ' + n + ' min'; },
    agoHour: function (n) { return 'il y a ' + n + ' h'; },
    agoDay: function (n) { return 'il y a ' + n + (n > 1 ? ' jours' : ' jour'); },
    netOn: 'Activé', netOff: 'Coupé', unnamed: 'Appareil sans nom', unknownVendor: 'Fabricant inconnu',
    cutAria: function (n) { return 'Activer / couper Internet pour ' + n; },
    editAria: function (n) { return 'Modifier ' + n; },
    noResult: 'Aucun appareil correspondant.', noDevicesYet: 'Aucun appareil vu pour l’instant.', noActive: 'Aucun appareil n’a de connexion ouverte en ce moment.', close: 'Fermer',
    discoveryHint: 'Astuce : pour une liste d’appareils plus précise, activez la découverte d’hôtes (Hostwatch) dans Interfaces › Neighbors › Discovery Settings.',
    dName: 'Nom de l’appareil', dType: 'Type d’appareil', dVendor: 'Fabricant', dMac: 'Adresse MAC', dNetwork: 'Réseau', dIps: 'Adresses IP',
    dHostname: 'Nom DHCP', dFirst: 'Vu pour la première fois', dLast: 'Vu pour la dernière fois',
    dFixedIp: 'Adresse IP fixe', dFixedShort: 'fixe', dIpAuto: 'Automatique (DHCP)', dIpPin: 'Garder cette IP', dIpClear: 'Revenir à l’automatique',
    dIpPinHint: 'L’appareil reçoit toujours son adresse actuelle.',
    dIpHint: function (net, from, to) { return 'Réseau ' + net + ' · plage automatique ' + from + ' – ' + to + '. Il est recommandé de choisir une adresse fixe en dehors de cette plage.'; },
    dIpInRange: function (from, to) { return 'Cette adresse se trouve dans la plage automatique (' + from + ' – ' + to + '). Cela fonctionne, mais une adresse hors de la plage est plus propre.'; },
    dIpAutoHint: 'Laissez vide pour que l’appareil obtienne automatiquement son adresse par DHCP.',
    dIpInvalid: 'Saisissez une adresse IPv4 valide (p. ex. 192.168.1.50).', dIpNoNet: 'Cette adresse ne se trouve dans aucun réseau desservi par DHCP.',
    dManualShort: 'manuelle',
    dIpManual: function (ip) { return 'Cet appareil a défini lui-même son adresse (' + ip + '). Une adresse indiquée ici prend effet une fois l’appareil passé en automatique (DHCP).'; },
    dIpManualPool: function (from, to) { return 'Cette adresse se trouve dans la plage attribuée automatiquement (' + from + ' – ' + to + ') : la même adresse peut être donnée à un autre appareil. « Garder cette IP » la réserve à cet appareil.'; },
    dIpRenew: 'Après l’application, l’appareil reçoit la nouvelle adresse à sa prochaine connexion (il suffit de couper puis de réactiver le Wi-Fi).',
    dNet: 'Accès Internet', dNetSub: 'Désactivé : l’appareil ne peut pas accéder à Internet.',
    dApproval: 'Approbation sur le réseau', dApprovalSub: 'Ce réseau demande l’approbation des nouveaux appareils. Désactivé : l’appareil ne peut joindre ni Internet ni les autres réseaux.',
    apprWaiting: 'En attente d’approbation', apprApproved: 'Approuvé', apprApprove: 'Approuver',
    apprApproveAria: function (n) { return 'Approuver ' + n; },
    apprPanel: 'Cet appareil attend votre approbation : il ne peut joindre ni Internet ni les autres réseaux.',
    apprBanner: function (n) { return n + (n > 1 ? ' nouveaux appareils attendent' : ' nouvel appareil attend') + ' votre approbation'; },
    apprBannerSub: 'Tant qu’ils ne sont pas approuvés, ils ne peuvent joindre ni Internet ni les autres réseaux. Approuvez les appareils que vous connaissez, puis appuyez sur « Appliquer ».',
    apprShow: 'Afficher les appareils',
    apprAuto: function (n) { return 'L’approbation des nouveaux appareils est activée : ' + (n > 1 ? 'les ' + n + ' appareils vus jusqu’ici sont considérés comme approuvés' : 'l’appareil vu jusqu’ici est considéré comme approuvé') + '. Les appareils qui se connectent désormais attendent votre approbation.'; },
    apprCard: 'Approbation des nouveaux appareils',
    types: { phone: 'Téléphone', tablet: 'Tablette', laptop: 'Ordinateur', tv: 'TV', console: 'Console de jeux', printer: 'Imprimante', iot: 'Maison connectée', server: 'Serveur / NAS', unknown: 'Autre' },
    filtTitle: 'Catégories et applications',
    filtSub: 'Les règles s’appliquent à tout appareil qui utilise le pare-feu comme serveur DNS.',
    catTitle: 'Catégories', appsTitle: 'Applications', appsSub: 'Les domaines des applications choisies (sous-domaines compris) sont bloqués par DNS.',
    blocked: 'Bloqué', allowed: 'Autorisé',
    listsTitle: 'Liste d’autorisation et liste de blocage', listsSub: 'Domaines toujours autorisés ou toujours bloqués, quoi que disent les catégories.',
    allowTitle: 'Liste d’autorisation', allowDesc: 'Ces domaines sont toujours autorisés, même si une liste de catégorie les contient.',
    denyTitle: 'Liste de blocage', denyDesc: 'Ces domaines et leurs sous-domaines sont toujours bloqués.',
    listEmpty: 'Aucun domaine ajouté pour l’instant.',
    add: 'Ajouter', removeAria: function (d) { return 'Retirer ' + d; }, invalidDomain: 'Saisissez un domaine valide (p. ex. example.com).',
    warnDns: 'Le DNS imposé est désactivé. Les appareils peuvent contourner le blocage en utilisant un autre serveur DNS.',
    cats: {
        ads: ['Publicités et traqueurs', 'Bloque les publicités et le code de pistage dans les sites web et les applications.', 'Source : hagezi Multi NORMAL'],
        malware: ['Logiciels malveillants et hameçonnage', 'Bloque les sites connus comme malveillants, frauduleux ou d’hameçonnage.', 'Source : hagezi Threat Intelligence Feeds'],
        adult: ['Contenu pour adultes', 'Bloque les sites web pour adultes.', 'Source : OISD NSFW'],
        gambling: ['Jeux d’argent', 'Bloque les sites de paris et de jeux d’argent.', 'Source : hagezi Gambling'],
        bypass: ['VPN, proxy et DNS chiffré', 'Bloque les services utilisés pour contourner le blocage.', 'Source : hagezi DoH/VPN/TOR/Proxy'],
        safesearch: ['Imposer SafeSearch', 'Active le mode restreint dans Google, Bing et YouTube.', 'Unbound SafeSearch'],
        forcedns: ['Imposer le DNS', 'Redirige vers le pare-feu toutes les requêtes DNS des appareils.', 'Règle NAT automatique']
    },
    tabNet: 'Réseau et Internet', tabSched: 'Horaires', tabPf: 'Redirection de port', tabVpn: 'VPN', tabGeo: 'Pays',
    internet: 'Internet', readonly: 'Lecture seule', linkDown: 'Pas de câble', colName: 'Nom',
    days: ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'],
    schTitle: 'Horaires', schSub: 'Coupez Internet ou bloquez des applications pour les appareils choisis, certains jours et à certaines heures. Vérifié chaque minute.',
    schNew: 'Nouvel horaire', schNewName: 'Nouvel horaire', schName: 'Nom de l’horaire', schDelete: 'Supprimer l’horaire',
    schDevices: 'Appareils', schDays: 'Jours', schFrom: 'Début', schTo: 'Fin', schAction: 'Que doit-il se passer ?',
    actCut: 'Couper Internet', actApps: 'Bloquer des applications', schApps: 'Applications à bloquer', schWeek: 'Vue de la semaine',
    schEmpty: 'Aucun horaire pour l’instant.', schEvery: 'Tous les jours', schWeekdays: 'En semaine', schWeekend: 'Week-end', schNoDays: 'Aucun jour choisi',
    schDevCount: function (n) { return n + (n > 1 ? ' appareils' : ' appareil'); },
    subWan: 'Connexion Internet', subNets: 'Réseaux locaux', subPorts: 'Ports physiques',
    wanSub: 'Comment le pare-feu se connecte à Internet. Les réglages OPNsense existants sont lus ; seul ce que vous changez est modifié.',
    netsSub: 'Vos réseaux internes (maison, IoT, invités, ...) et ce qu’ils peuvent joindre. Les réglages OPNsense existants sont lus ; seul ce que vous changez est modifié.',
    wanMissing: 'Aucune interface WAN n’est configurée sur ce système.', wanConnected: 'Connecté à Internet', wanDown: 'Pas d’adresse Internet',
    wanVia: { dhcp: 'Via un modem (DHCP)', pppoe: 'Fibre / VDSL · PPPoE', 'static': 'IP fixe', other: 'Autre' },
    wanTest: 'Tester la connexion', wanTesting: 'Test en cours…', chkGateway: 'Passerelle', chkInternet: 'Internet', chkDns: 'Résolution de noms (DNS)',
    wanMulti: 'Ce système a plusieurs connexions Internet (multi-WAN). Pour éviter toute confusion, les réglages de connexion ne peuvent être modifiés que dans les menus d’OPNsense.',
    wanComplex: 'Votre connexion Internet utilise un type qu’Inversa Panel ne prend pas en charge ; modifiez-la dans les menus d’OPNsense.',
    wanPortShort: 'Port', wanLinkUp: 'câble branché', wanIp: 'Adresse IP', wanTestTitle: 'Test de connexion', wanRetest: 'Tester à nouveau',
    wanExt: 'IP externe', wanExtBtn: 'Afficher l’IP externe', wanExtFailed: 'introuvable',
    wanExtNote: 'L’IP externe est obtenue par le pare-feu en interrogeant Cloudflare (1.1.1.1), lorsque vous appuyez sur le bouton.',
    wanAdvTitle: 'Avancé', wanAdv: 'Avancé : adresse MAC, MTU', wanAuto: 'automatique',
    wanMac: 'Adresse MAC', wanMacSub: 'Si votre fournisseur a lié la ligne à l’adresse MAC du modem, saisissez cette adresse. Vide : l’adresse propre du port.',
    wanMtuSub: 'Laissez vide, sauf si votre fournisseur vous a indiqué une autre valeur.',
    wanMtuPppoe: 'Vide : 1492. Si certains sites ne s’ouvrent pas, essayez une valeur plus basse (p. ex. 1452).',
    wanType: 'Type de connexion', wanSettings: function (type) { return type + ' · réglages'; },
    wt: {
        dhcp: ['Derrière un modem / routeur', 'OPNsense obtient automatiquement son adresse du modem.'],
        pppoe: ['Fibre ou VDSL (PPPoE)', 'Modem en mode pont ou terminal fibre (ONT) ; OPNsense fait le travail du modem.'],
        'static': ['IP fixe', 'Si votre fournisseur vous a attribué une adresse IP fixe.']
    },
    pppUser: 'Identifiant PPPoE', pppPass: 'Mot de passe PPPoE', pppKeep: 'Saisir pour modifier',
    pppoeHint: 'Demandez l’identifiant, le mot de passe et le numéro de VLAN à votre fournisseur d’accès Internet.',
    stIp: 'Adresse IP / préfixe', stGw: 'Passerelle',
    dhcpWarn: 'Si le modem fait aussi routeur, vous obtenez un « double NAT » ; les jeux et la redirection de port peuvent poser problème. Si possible, mettez le modem en mode pont.',
    wanPort: 'Port Internet', wanPortSub: 'Le port sur lequel le câble Internet est branché.',
    vlanReq: 'Utiliser une étiquette VLAN', vlanReqSub: 'Sur beaucoup de lignes fibre, le trafic Internet arrive avec un numéro de VLAN précis.', vlanId: 'Numéro de VLAN',
    ipv6Sub: 'Obtenu automatiquement si votre fournisseur propose IPv6.', v6Auto: 'Automatique', v6Off: 'Désactivé',
    netSafety: 'Sans confirmation de votre part dans les 90 secondes après l’application, les réglages précédents sont rétablis automatiquement.',
    netApply: 'Appliquer les réglages réseau', netCreate: 'Créer le réseau',
    netConfirmTitle: 'Les nouveaux réglages sont actifs et attendent votre confirmation.', netConfirmText: 'Si cette page fonctionne encore, votre connexion fonctionne. Sans confirmation, les réglages précédents sont rétablis automatiquement.',
    netConfirmBtn: 'Ça fonctionne, conserver', netConfirmed: 'Les réglages ont été rendus définitifs.',
    netReverted: 'Aucune confirmation reçue : les réglages précédents sont en cours de rétablissement. La page va se recharger dans un instant.',
    confirmFirst: 'Confirmez d’abord la modification en attente (ou attendez qu’elle soit annulée), puis appuyez à nouveau sur « Appliquer ».',
    netKinds: { home: 'Maison / local', iot: 'IoT / maison connectée', guest: 'Invités', camera: 'Caméras', server: 'Serveurs' },
    netEdit: 'Modifier', netLink: 'Connexion', untagged: 'sans étiquette', netAddr: 'Adresse',
    edTitle: function (n) { return 'Modifier le réseau ' + n; }, edType: 'Type de réseau', edTypeHint: 'Le type de réseau et l’approbation des nouveaux appareils sont enregistrés avec « Appliquer » en haut de la page.',
    edApproval: 'Les nouveaux appareils attendent une approbation',
    edApprovalSub: 'Un appareil qui rejoint ce réseau pour la première fois, en Wi-Fi ou par câble, ne peut joindre ni Internet ni les autres réseaux tant que vous ne l’avez pas approuvé dans l’onglet Appareils.',
    edApprovalNote: 'Lorsque vous activez cette option, les appareils vus jusqu’ici sont considérés comme approuvés ; seuls les appareils qui se connectent ensuite doivent attendre. L’approbation se fait par adresse MAC. Le trafic entre appareils d’un même commutateur ou d’un même Wi-Fi ne passe pas par le pare-feu ; pour l’empêcher aussi, activez l’« isolation des clients » sur votre point d’accès.',
    edApprovalNotProtected: 'Ce réseau ne fait pas partie des réseaux protégés par Inversa Panel. Ajoutez-le d’abord dans Paramètres › Réseaux protégés.',
    netMain: 'Réseau principal', netDevCount: function (n) { return n > 1 ? n + ' appareils connectés' : n + ' appareil connecté'; },
    isoRow: 'Autres réseaux', isoAlone: 'Isolé', isoWith: function (l) { return 'Isolé · communique avec ' + l; },
    isoTitle: 'Isoler des autres réseaux', isoSub: 'Ce réseau ne peut pas communiquer avec les autres réseaux ; Internet reste accessible.',
    isoReach: 'Réseaux qu’il joint quand même, dans les deux sens :',
    limTitle: 'Limite de débit', limSub: 'Débit Internet total de ce réseau.', limDown: 'Réception', limUp: 'Envoi',
    edColor: 'Couleur', edColorN: function (n) { return 'Couleur ' + n; },
    edPort: 'Port :', edConnFixed: 'Le mode de raccordement d’un réseau ne peut plus être modifié après sa création.', edRange: 'Plage d’adresses',
    edApprovalShort: 'Un appareil qui se connecte pour la première fois n’a pas Internet tant que vous ne l’avez pas approuvé.',
    vlanWifi: function (tag) { return 'Pour le Wi-Fi, créez un nom de réseau (SSID) distinct sur votre point d’accès et associez-le au numéro de VLAN de ce réseau (' + tag + '). Votre commutateur et votre point d’accès doivent prendre en charge les VLAN.'; },
    edGw: 'Adresse de la passerelle', edDhcp: 'Serveur DHCP', edDhcpSub: 'Activé : les appareils reçoivent automatiquement une adresse IP.', edDhcpOff: 'Désactivé : les appareils ont besoin d’une adresse IP réglée à la main.',
    lanChangeWarn: 'Modifier l’adresse du réseau auquel vous êtes connecté peut couper votre connexion ; sans confirmation depuis la nouvelle adresse, la modification est annulée.',
    edDelete: 'Supprimer le réseau', notCreated: 'Ce réseau n’a pas été créé par Inversa Panel ; supprimez-le dans les menus d’OPNsense.',
    edDeleteConfirm: function (n) { return 'Supprimer le réseau ' + n + ' ? Les appareils qui s’y trouvent seront déconnectés.'; },
    netAdd: 'Ajouter un réseau', netAddSub: 'Créez un réseau séparé pour les objets connectés, les invités, les caméras ou les serveurs.',
    edDhcpFrom: 'Début de plage', edDhcpTo: 'Fin de plage', edLease: 'Bail (heures)', edLeaseDefault: 'par défaut', edAuto: 'automatique',
    edDhcpHint: 'Les appareils reçoivent automatiquement une adresse de cette plage ; les champs laissés vides utilisent la valeur affichée en gris. Attribuez les adresses fixes dans l’onglet Appareils.',
    leaseShort: function (h) { return h + ' h'; },
    edName: 'Nom du réseau', edConn: 'Type de raccordement', edVlanMode: 'VLAN', edPortMode: 'Port dédié', edVlanId: 'N° de VLAN',
    edParentFor: 'Port qui transporte le VLAN :', edPortFor: 'Port libre utilisé par ce réseau :',
    vlanNote: 'Les VLAN nécessitent un commutateur et un point d’accès qui les prennent en charge.',
    accTitle: 'Accès entre réseaux', accSub: 'Le réseau de la ligne peut-il ouvrir une connexion vers celui de la colonne ? Cliquez sur une case pour la modifier.',
    accFrom: 'De ↓  Vers →', accState: { allow: 'Autorisé', deny: 'Bloqué', 'default': 'OPNsense' },
    accLegend: '« OPNsense » : Inversa Panel n’intervient pas, vos règles de pare-feu existantes s’appliquent.',
    portsSubRo: 'Les ports réseau du pare-feu et l’usage de chacun. Choisissez le port Internet dans « Connexion Internet » et le port d’un réseau au moment de l’ajouter.',
    portWan: 'Internet (WAN)', portTrunkOnly: 'VLAN uniquement', portUnused: 'Inutilisé',
    pfTitle: 'Redirection de port', pfSub: 'Ouvrez un accès depuis Internet vers un appareil de votre réseau. La règle de pare-feu nécessaire est ajoutée automatiquement et fonctionne aussitôt.',
    pfRdp: 'Bureau à distance', pfCustom: 'Personnalisé', pfNew: 'Nouvelle redirection', pfTarget: 'Appareil ou IP cible', pfTargetPh: 'Nom de l’appareil ou IP', pfNamePh: 'D’après le port', pfTo: 'Cible',
    pfListHint: 'Absent de la liste ? Continuez à saisir', pfCount: function (n) { return n + (n > 1 ? ' redirections' : ' redirection'); },
    pfPorts: { '443': 'Web (HTTPS)', '80': 'Web (HTTP)', '22': 'SSH', '3389': 'Bureau à distance', '5900': 'VNC', '21': 'FTP', '25': 'Courrier (SMTP)', '8080': 'Web (alternatif)', '8123': 'Home Assistant', '554': 'Caméra (RTSP)', '32400': 'Plex', '25565': 'Minecraft', '27015': 'Serveur de jeu Steam', '3074': 'Xbox Live', '1194': 'OpenVPN', '51820': 'WireGuard' },
    pfExt: 'Port externe', pfInt: 'Port interne', pfTargetIp: 'IP cible', pfProto: 'Protocole', pfAdd: 'Ajouter la redirection',
    pfImmediate: 'Les redirections de port prennent effet immédiatement (inutile d’appliquer).',
    pfRules: 'Redirections de port', pfWanIs: function (ip) { return 'Votre IP externe : ' + ip; }, pfEmpty: 'Aucune redirection de port pour l’instant.',
    pfDelConfirm: 'Supprimer cette redirection de port ?',
    upnpTitle: 'Ouverture automatique des ports (UPnP)', upnpDesc: 'Permet à des appareils comme les consoles de jeux d’ouvrir eux-mêmes leurs ports ; se gère sur la page du plugin os-upnp.',
    upnpMissing: 'Plugin non installé',
    vpnTitle: 'Connexions VPN', vpnSub: 'Accès distant sécurisé au réseau de votre domicile ou bureau (WireGuard) et liaisons entre sites (WireGuard, ou IPsec avec les pare-feu d’autres marques).',
    vpnUnavailable: 'WireGuard n’est pas disponible sur cette version d’OPNsense.',
    vpnNew: 'Nouvelle connexion VPN', vpnNone: 'Aucune connexion VPN pour l’instant. Commencez par « Nouvelle connexion VPN ».',
    vpnKindRemote: 'Accès distant', vpnKindRemoteDesc: 'Téléphones et ordinateurs portables se connectent de l’extérieur. Code QR et fichier .conf pour chaque appareil.',
    vpnKindSite: 'Site à site', vpnKindSiteDesc: 'Liaison permanente avec un autre pare-feu ou un autre site ; les réseaux des deux côtés se joignent. WireGuard ou IPsec.',
    vpnName: 'Nom de la connexion', vpnPort: 'Port UDP', vpnCreate: 'Créer la connexion', vpnDelete: 'Supprimer la connexion',
    vpnDelConfirmConn: function (n) { return 'Supprimer la connexion « ' + n + ' » et tous ses appareils ?'; },
    vpnReach: 'Réseaux internes accessibles', vpnSiteShare: 'Nos réseaux partagés avec l’autre côté',
    vpnAddr: 'Adresse de connexion', vpnEndpoint: 'Nom de connexion (facultatif)',
    vpnEndpointHint: 'Saisissez votre nom DynDNS si votre IP change. Si le champ est vide, l’adresse WAN est utilisée.',
    vpnMode: 'Quel trafic doit passer par le VPN ?', modeFull: 'Tout le trafic', modeFullDesc: 'Tout l’Internet de l’appareil passe par ici ; le blocage des publicités s’applique aussi en déplacement.',
    modeSplit: 'Réseaux choisis uniquement', modeSplitDesc: 'Seul le trafic vers les réseaux internes que vous choisissez passe par le VPN.',
    vpnModeHint: 'Après avoir changé de mode, chargez à nouveau la configuration des appareils (QR / .conf).',
    vpnTunnel: 'Bloc IP du VPN', vpnTunnelHint: 'Les appareils reçoivent une adresse de ce bloc (p. ex. 10.70.0.0/24). Laissez vide pour en prendre un libre ; il ne doit pas chevaucher les réseaux internes ni d’autres VPN.',
    vpnInternetOnly: 'Internet uniquement', vpnInternetOnlyHint: 'Aucun réseau interne choisi : l’appareil accède seulement à Internet, avec l’adresse IP publique de ce site. Il ne peut joindre ni les réseaux internes ni le pare-feu.',
    vpnFullEmptyHint: 'Si vous ne choisissez aucun réseau interne, l’appareil n’obtient que l’accès Internet.',
    vpnReaddressed: 'Le bloc IP du VPN a changé et les appareils ont reçu de nouvelles adresses. Chargez à nouveau la configuration des appareils (QR / .conf).',
    vpnRemoteEndpoint: 'Adresse de l’autre côté', vpnRemoteNets: 'Réseaux de l’autre côté',
    vpnRemoteKey: 'Clé publique de l’autre côté (facultatif)', vpnRemoteKeyPh: 'Laissez vide pour qu’Inversa Panel la génère',
    vpnRemoteKeyHint: 'Si le champ est vide, des clés sont générées pour l’autre côté et une configuration prête à l’emploi (QR / .conf) est proposée.',
    vpnThisSide: 'Ce côté (à saisir de l’autre côté)', vpnOtherSide: 'Autre côté', vpnPubKey: 'Clé publique', vpnTunnelIp: 'Adresse du tunnel',
    vpnWaitsForThem: 'Affiché une fois l’autre côté connecté', vpnOtherConf: 'Configuration prête pour l’autre côté :',
    vpnDevCount: function (n) { return n + (n > 1 ? ' appareils' : ' appareil'); },
    vpnOthers: function (l) { return 'D’autres configurations WireGuard existent, Inversa Panel n’y touche pas : ' + l; },
    vpnBehindModem: 'Si OPNsense est derrière un modem, redirigez sur le modem le port UDP de chaque connexion (pour IPsec, UDP 500 et 4500) vers OPNsense.',
    vpnStepKind: 'Type', vpnStepSet: 'Réglages', vpnBack: 'Retour',
    vpnAdvRemote: 'Avancé : port, bloc IP, adresse de connexion', vpnAdvSite: 'Avancé : port, bloc IP, clé de l’autre côté', vpnAdvIpsec: 'Avancé : clé partagée, adresse de ce côté',
    vpnLiveCount: function (n) { return n + (n > 1 ? ' connectés' : ' connecté'); }, vpnNoLive: 'Aucun appareil connecté',
    vpnTraffic: 'Trafic', vpnOurNets: 'Nos réseaux',
    wgSecret: 'Le code QR et le fichier .conf contiennent la clé privée de l’autre côté. Ne les transmettez qu’à l’administrateur de l’autre côté, par un canal sûr.',
    wgText: function (c) {
        return ['Connexion WireGuard : ' + c.name,
            'Ces valeurs sont à saisir sur l’appareil de L’AUTRE CÔTÉ.', '',
            'Adresse de connexion (Endpoint)     : ' + c.address,
            'Clé publique de ce pare-feu         : ' + c.pubkey,
            'Adresse du tunnel de ce côté        : ' + c.tunnel,
            'Réseaux autorisés (AllowedIPs)      : ' + [c.tunnel.split('/')[0] + '/32'].concat(c.networks).join(', '),
            'Réseaux de l’autre côté             : ' + c.remote_networks.join(', '),
            'Clé publique de l’autre côté        : ' + (c.remote_pubkey || '—')].join('\n');
    },
    /* IPsec site to site */
    ipcProto: 'Protocole',
    ipcProtoWg: 'Lorsque l’autre côté utilise aussi WireGuard (OPNsense, pfSense, MikroTik, Linux).',
    ipcProtoIpsec: 'Lorsque l’autre côté est un pare-feu d’une autre marque (FortiGate, Sophos, Zyxel, Cisco, MikroTik…). IKEv2 avec clé partagée.',
    ipcKey: 'Clé partagée', ipcKeyPh: 'Laissez vide, Inversa Panel en crée une', ipcKeyKeep: 'Saisir pour la modifier',
    ipcKeyHint: 'Doit être identique des deux côtés. Au moins 12 caractères : lettres, chiffres et . _ ~ ! @ # % ^ * + = : , -',
    ipcOurs: 'Adresse de ce côté (facultatif)',
    ipcOursHint: 'L’IP fixe ou le nom d’hôte par lequel l’autre côté joint ce pare-feu. Vide : l’adresse WAN. Cette valeur sert aussi d’identité à ce côté.',
    ipcHint: 'Le chiffrement est fixe (IKEv2, AES-256, SHA-256, groupe DH 14). Une fois la connexion créée, « Réglages pour l’autre côté » liste tout ce qu’il faut saisir sur l’autre appareil.',
    ipcThisSide: 'Ce côté', ipcId: 'Identité', ipcDown: 'Non connecté',
    ipcSheetHint: 'À saisir sur l’autre appareil (adresse, clé, identités, chiffrement, réseaux) :', ipcSheetBtn: 'Réglages pour l’autre côté',
    ipcSheet: 'Réglages à saisir de l’autre côté', ipcDownload: 'Télécharger en fichier texte',
    ipcSecret: 'La liste contient la clé partagée. Ne la transmettez qu’à l’administrateur de l’autre côté, par un canal sûr.',
    ipcOthers: function (l) { return 'Il existe aussi d’autres tunnels IPsec, Inversa Panel n’y touche pas : ' + l; },
    ipcText: function (c) {
        return ['Connexion IPsec : ' + c.name.replace(/^inversapanel-?/, ''),
            'Ces valeurs sont à saisir sur l’appareil de L’AUTRE CÔTÉ.', '',
            'Passerelle distante (adresse de connexion) : ' + c.address,
            'Version IKE                                : IKEv2',
            'Authentification                           : Clé prépartagée (PSK)',
            'Clé prépartagée                            : ' + c.psk,
            'ID local (de cet appareil-là)              : ' + c.remote_id,
            'ID distant (ce pare-feu)                   : ' + c.local_id,
            'Phase 1 (IKE)                              : AES-256, SHA-256, groupe DH 14 (2048 bits)',
            'Phase 2 (ESP)                              : AES-256, SHA-256, groupe PFS 14',
            'Réseaux locaux (derrière cet appareil-là)  : ' + c.remote_networks.join(', '),
            'Réseaux distants (de ce côté-ci)           : ' + c.networks.join(', '),
            'Traversée NAT (NAT-T)                      : activée / automatique',
            'Détection de pair inactif (DPD)            : activée', '',
            'Avec plusieurs réseaux, définissez une phase 2 par paire de réseaux.',
            'Les durées de vie n’ont pas besoin d’être identiques des deux côtés.'].join('\n');
    },
    vpnNoPeers: 'Aucun appareil ajouté pour l’instant.', vpnAddPh: 'Nom de l’appareil, p. ex. Mon téléphone', vpnAdd: 'Ajouter un appareil',
    vpnRemove: function (n) { return 'Supprimer ' + n; }, vpnDisabled: 'Désactivé', vpnNever: 'Jamais connecté', vpnConnected: 'Connecté',
    vpnLast: function (m) { return m < 60 ? 'Vu il y a ' + m + ' min' : (m < 1440 ? 'Vu il y a ' + Math.round(m / 60) + ' h' : 'Vu il y a ' + Math.round(m / 1440) + (Math.round(m / 1440) > 1 ? ' jours' : ' jour')); },
    vpnDelConfirm: 'Supprimer cet appareil ? Il ne pourra plus se connecter.',
    vpnRenew: 'Nouvelle clé', vpnRenewHint: 'Cet appareil a été ajouté par une version plus ancienne, sa clé privée n’a donc pas été conservée. Une nouvelle clé sera générée.',
    vpnRenewConfirm: 'Générer une nouvelle clé pour cet appareil ? L’ancienne configuration cesse de fonctionner ; chargez la nouvelle sur l’appareil.',
    vpnNoKey: 'La clé privée de cet appareil n’est pas enregistrée ; renouvelez-la avec « Nouvelle clé ».',
    copy: 'Copier', save: 'Enregistrer',
    vpnAccCol: 'Accès', vpnAccAll: 'Les réseaux de la connexion', vpnAccOnly: 'Seulement', vpnAccOnlyThese: 'Seulement ces adresses', vpnAccEdit: 'Modifier l’accès',
    vpnAccOf: function (n) { return n + ' · que peut-il joindre ?'; }, vpnAccRemove: function (x) { return 'Retirer ' + x; },
    vpnAccCount: function (n) { return n + (n > 1 ? ' limités' : ' limité'); },
    vpnAccAllDesc: function (nets) { return 'Cet appareil joint tout ce que la connexion permet de joindre : ' + nets + '.'; },
    vpnAccIpPh: 'Choisissez un appareil ou saisissez une adresse, p. ex. 10.0.0.20', vpnAccPortPh: 'Port (tous)', vpnAccAdd: 'Ajouter',
    vpnAccDns: 'Résolution de noms (DNS)', vpnAccDnsSub: 'Activé : l’appareil peut résoudre les noms. Désactivé : il se connecte uniquement par adresse IP.',
    vpnAccNote: 'Cet appareil ne joint que les adresses ci-dessus, et n’a pas Internet par cette connexion. La règle est appliquée sur le pare-feu : elle tient même si le fichier .conf de l’appareil est modifié.',
    vpnAccBadIp: 'Saisissez une adresse IP valide, p. ex. 10.0.0.20.', vpnAccBadPort: 'Le port doit être compris entre 1 et 65535.', vpnAccNeedOne: 'Ajoutez au moins une adresse que l’appareil peut joindre.',
    vpnAddrEdit: 'Modifier l’adresse', vpnAddrOf: function (n) { return 'Adresse de ' + n; }, vpnAddrPh: 'IP (automatique)',
    vpnAddrHint: function (net) { return 'Facultatif : une adresse dans ' + net + ' ; si le champ est vide, la prochaine adresse libre est utilisée.'; },
    vpnAddrChanged: 'L’adresse a changé. La configuration de l’appareil ne fonctionne plus ; chargez à nouveau ce code QR ou ce fichier .conf sur l’appareil.',
    vpnAddrChangedNoKey: 'L’adresse a changé. Mettez à jour la ligne « Address » de la configuration sur l’appareil.',
    qrTitle: function (n) { return 'Configurer ' + n; },
    qrStep1: 'Installez l’application WireGuard sur l’appareil.', qrStep2: 'Dans l’application, choisissez « + » › « Scanner un code QR » (sur un ordinateur : importer depuis un fichier).', qrStep3: 'Scannez le code ou importez le fichier .conf, puis connectez-vous.',
    qrDownload: 'Télécharger le fichier .conf', qrSecret: 'Le code et le fichier contiennent la clé privée de l’appareil. Ne les partagez pas ; vous pouvez les retrouver ici à tout moment.',
    geoTitle: 'Pays', geoSub: 'Bloquez par pays les connexions qui arrivent d’Internet, ou ne laissez entrer que les pays de votre choix.',
    geoEnable: 'Restreindre par pays', geoOn: function (n) { return 'Activé · ' + n + (n > 1 ? ' pays bloqués' : ' pays bloqué'); },
    geoOnAllow: function (n) { return 'Activé · seules les connexions venant de ' + n + ' pays sont admises'; },
    geoBlockEmpty: 'Activé, mais rien n’est bloqué car aucun pays n’est choisi.',
    geoAllowEmpty: 'Activé, mais aucun pays autorisé n’est choisi ; rien n’est restreint tant que vous n’en choisissez pas.',
    geoAllowNoData: 'Activé, mais il n’existe pas de données d’adresses pour les pays choisis ; rien n’est restreint.',
    geoMode: 'Comment cela doit-il fonctionner ?', geoModeBlock: 'Bloquer les pays que je choisis', geoModeAllow: 'N’autoriser que les pays que je choisis',
    geoModeBlockDesc: 'Les connexions venant des pays choisis sont bloquées.',
    geoModeAllowDesc: 'Votre réseau n’est joignable que depuis les pays choisis ; les sorties vers Internet ne sont pas concernées.',
    geoVpn: 'Les connexions VPN sont exemptées', geoVpnSub: 'Vos connexions VPN sont joignables depuis n’importe quel pays.',
    geoAllowed: 'Pays autorisés', geoAllowPick: 'Aucun pays choisi pour l’instant. Choisissez ci-dessous les pays à autoriser ; rien n’est restreint d’ici là.',
    geoBlockPick: 'Aucun pays choisi pour l’instant. Choisissez ci-dessous les pays à bloquer.',
    geoAllowSafety: 'Ce réglage exclut tous les pays absents de la liste. Si vous gérez le panneau par Internet, vérifiez que le pays où vous vous trouvez y figure. Après l’application, les réglages précédents sont rétablis automatiquement sans confirmation de votre part dans les 90 secondes.',
    geoDir: 'Dans quel sens ?', dirIn: 'Entrant uniquement', dirBoth: 'Entrant et sortant',
    dirInDesc: 'Recommandé. Les tentatives de connexion depuis ces pays vers votre réseau sont bloquées.',
    dirBothDesc: 'L’accès aux sites web et aux services hébergés dans ces pays est également coupé.',
    geoDb: 'Base de données des pays (GeoIP)', geoDbMaxmind: 'MaxMind GeoLite2 est utilisé.', geoDbOther: 'Une autre source GeoIP est configurée dans OPNsense et utilisée.',
    geoDbMissing: 'Non configuré. Saisissez votre clé de licence MaxMind gratuite.', geoKeyPh: 'Clé de licence MaxMind', geoKeySet: 'Nouvelle clé de licence',
    geoNeedKey: 'Le blocage par pays nécessite une base de données GeoIP : créez un compte GeoLite2 gratuit chez MaxMind, générez une clé dans « Manage License Keys », saisissez-la ci-dessus et appuyez sur Appliquer.',
    geoBlocked: 'Pays bloqués', geoCount: function (n) { return n + ' pays'; }, geoSearch: 'Rechercher un pays',
    geoStats: 'Tentatives de connexion bloquées', geoStatsHint: 'Paquets bloqués depuis le dernier chargement des règles.',
    cleanupTitle: 'Retirer ce qu’Inversa Panel a ajouté', cleanupText: 'Désactive Inversa Panel et supprime les alias, les politiques de blocage DNS, les limites de débit et les règles de pare-feu automatiques qu’il a ajoutés. Vos redirections de port, vos réseaux, vos appareils VPN et vos réglages DNS sont conservés.', cleanupBtn: 'Retirer', cleanupConfirm: 'Désactiver Inversa Panel et supprimer les réglages qu’il a ajoutés ?', cleanupDone: 'Les réglages ajoutés par Inversa Panel ont été supprimés et Inversa Panel est désactivé.',
    geoNotWorking: 'Activé, mais rien n’est encore restreint car la base de données des pays n’est pas chargée.',
    geoAddresses: function (n) { return n + (n > 1 ? ' plages d’adresses chargées' : ' plage d’adresses chargée'); },
    geoKeyOk: 'Clé MaxMind enregistrée, base de données chargée', geoKeyPending: 'Clé enregistrée, téléchargement de la base de données…',
    geoKeyReplace: 'Saisissez une nouvelle clé pour la remplacer', geoGetKey: 'Comment obtenir une clé gratuite ?',
    geoWaitDb: 'La base de données est en cours de téléchargement ; le blocage commence d’ici quelques minutes. Si cela dure, vérifiez la clé.',
    geoDbipFree: 'gratuit, sans inscription', geoDbipLoaded: function (m, n) { return 'Données ' + m + ' · ' + n + (n > 1 ? ' plages d’adresses' : ' plage d’adresses'); },
    geoDbipLater: 'téléchargées lorsque la restriction est activée et appliquée, actualisées chaque mois',
    geoUseMaxmind: 'Je veux utiliser ma propre clé MaxMind', geoDownloading: 'Téléchargement des données par pays ; la restriction commence d’ici 1 à 2 minutes…',
    geoAfterApply: 'Lorsque vous appuyez sur Appliquer, les données gratuites par pays (DB-IP Lite) sont téléchargées et la restriction commence d’ici 1 à 2 minutes.',
    /* DNS */
    tabDns: 'DNS',
    dnsTitle: 'DNS', dnsSub: 'Comment les noms sont résolus : les noms qui pointent vers votre réseau, et les serveurs DNS que le pare-feu interroge.',
    dnsRecTitle: 'Noms locaux',
    dnsRecSub: 'Faites pointer un nom vers un appareil de votre réseau, p. ex. nas.home.lan ouvre votre serveur de fichiers.',
    dnsName: 'Nom', dnsIp: 'Adresse IP visée',
    dnsWild: 'Sous-domaines compris', dnsWildSub: 'P. ex. avec example.com, www.example.com et mail.example.com mènent à la même adresse.',
    dnsWildShort: 'avec sous-domaines', dnsWildHint: function (n) { return n + ' et tous les noms situés en dessous mènent à cette adresse.'; },
    dnsRecEmpty: 'Aucun nom pour l’instant.',
    dnsRecNote: 'Les noms fonctionnent sur les appareils qui utilisent le pare-feu comme serveur DNS (sur tous les appareils lorsque Sécurité › Catégories et applications › « Imposer le DNS » est activé). Ils apparaissent aussi dans Services › Unbound DNS › Overrides dans OPNsense.',
    dnsBadName: 'Saisissez un nom valide (p. ex. nas.home.lan).', dnsBadIp: 'Saisissez une adresse IP valide (p. ex. 192.168.1.20).',
    dnsTaken: function (n) { return 'Il existe déjà une entrée pour ' + n + '.'; },
    dnsForeignHint: 'Cette entrée a été créée sur la page d’OPNsense et peut y être modifiée.',
    dnsSrvTitle: 'Serveurs DNS', dnsSrvSub: 'À qui le pare-feu doit-il demander les noms qu’il ne connaît pas ?',
    dnsLockedSystem: '« Use system nameservers » est activé dans OPNsense (Services › Unbound DNS › Query Forwarding). Inversa Panel n’y touche pas ; désactivez-le là-bas pour choisir les serveurs ici.',
    dnsLockedForward: 'Une redirection DNS pour tous les noms est déjà configurée dans OPNsense (Services › Unbound DNS › Query Forwarding / DNS over TLS). Inversa Panel n’y touche pas ; supprimez ces entrées pour choisir les serveurs ici.',
    dnsModes: {
        auto: ['Automatique', 'Selon le réglage d’OPNsense ; par défaut, il résout lui-même les noms en partant des serveurs racine.'],
        cloudflare: ['Cloudflare', 'Rapide, sans filtrage.'],
        google: ['Google', 'Sans filtrage.'],
        quad9: ['Quad9', 'Bloque aussi lui-même les sites connus comme malveillants.'],
        adguard: ['AdGuard DNS', 'Bloque aussi lui-même les publicités et les traqueurs.'],
        custom: ['Serveurs personnalisés', 'Vous saisissez les adresses des serveurs à utiliser.']
    },
    dnsServers: 'Adresses des serveurs', dnsServersHint: 'Séparez les adresses IP par des virgules. Au moins deux serveurs sont recommandés.',
    dnsDot: 'DNS chiffré (DNS over TLS)', dnsDotSub: 'Les requêtes sont envoyées chiffrées ; votre fournisseur d’accès ne peut ni voir les noms que vous demandez ni modifier les réponses.',
    dnsTlsName: 'Nom figurant sur le certificat du serveur', dnsTlsNameSub: 'Le serveur est vérifié par ce nom (p. ex. dns.quad9.net). Si le champ est vide, la connexion est chiffrée mais le serveur n’est pas vérifié.',
    dnsSafety: 'Avant l’application, on vérifie que les serveurs répondent. Après l’application, les réglages précédents sont rétablis automatiquement sans confirmation de votre part dans les 90 secondes.',
    dnsUnreachable: 'Rien n’a été modifié : ces serveurs DNS n’ont pas répondu (vérifiez l’adresse, ainsi que le nom du certificat si le DNS chiffré est activé) :',
    /* attack protection (Suricata) */
    tabIps: 'Anti-intrusion',
    ipsTitle: 'Protection contre les attaques', ipsSub: 'Le trafic des appareils de votre réseau est comparé aux traces connues d’attaques et de logiciels malveillants (Suricata).',
    ipsEnable: 'Inspecter le trafic pour détecter les attaques',
    ipsAfterApply: 'Lorsque vous appuyez sur Appliquer, les règles sont téléchargées ; l’inspection commence d’ici 1 à 2 minutes.',
    ipsPreparing: 'Téléchargement et chargement des règles…',
    ipsRunningDetect: 'En marche, alerte seule', ipsRunningBlock: 'En marche, blocage',
    ipsMemory: function (n) { return n + ' Mo de mémoire'; },
    ipsRules: function (ago) { return 'règles mises à jour ' + ago; },
    ipsStopped: 'Activé, mais l’inspection ne fonctionne pas en ce moment.',
    ipsStart: 'Démarrer', ipsRetry: 'Réessayer',
    ipsNoMem: function (free, need) { return 'Non démarré : mémoire libre insuffisante (' + free + ' Mo libres, ' + need + ' Mo nécessaires). Un manque de mémoire arrête tout le pare-feu, la protection n’est donc pas démarrée.'; },
    ipsUnavailable: 'Le composant de détection d’intrusion est introuvable sur cette installation OPNsense.',
    ipsForeign: 'La détection d’intrusion est déjà activée dans OPNsense et a été configurée en dehors d’Inversa Panel. Inversa Panel ne touche pas à ces réglages et affiche seulement les alertes ci-dessous. Pour la gérer ici, désactivez d’abord Services › Intrusion Detection dans OPNsense.',
    ipsMode: 'Lorsqu’une trace d’attaque est trouvée', ipsDetect: 'Alerter seulement', ipsBlock: 'Bloquer',
    ipsDetectDesc: 'Les connexions suspectes sont listées, rien n’est coupé. Il est recommandé de commencer ainsi.',
    ipsBlockDesc: 'Les connexions correspondant à une trace d’attaque sont coupées ; une fausse alerte peut aussi couper une connexion inoffensive.',
    ipsBlockNo: {
        none: 'Le blocage nécessite un réseau protégé.',
        device: 'Le blocage ne peut pas être utilisé avec ce matériel réseau (ports agrégés, pont ou interface virtuelle). Seul le mode alerte fonctionne.',
        offload: 'Le blocage nécessite de désactiver les options de délestage matériel (CRC, TSO, LRO) dans Interfaces › Settings.'
    },
    ipsWhere: 'Carte réseau inspectée', ipsWhereHint: 'Le trafic des réseaux protégés est surveillé ici.',
    ipsGroups: 'Que rechercher', ipsGroupsSub: 'Chaque groupe augmente la mémoire utilisée.',
    ipsG: {
        malware: ['Logiciels malveillants et serveurs de commande', 'Un appareil infecté qui communique avec son serveur de contrôle, minage de cryptomonnaie, certificats connus comme malveillants.'],
        attackers: ['Adresses d’attaquants connues', 'Connexions avec des serveurs répertoriés comme sources d’attaques ou comme compromis.'],
        exploits: ['Exploitation de failles', 'Trafic qui tente d’utiliser les faiblesses des navigateurs, des serveurs et des appareils.'],
        phishing: ['Hameçonnage', 'Fausses pages créées pour récupérer des mots de passe et des données de carte bancaire.'],
        scan: ['Balayages et saturations', 'Balayages de ports et tentatives de perturber un service. Peut produire beaucoup d’alertes.']
    },
    ipsAlerts: 'Dernières alertes', ipsAlertsNone: 'Aucune alerte pour l’instant.',
    ips24h: function (n, blocked) { return 'Dernières 24 heures : ' + n + (n > 1 ? ' alertes' : ' alerte') + ', ' + blocked + (blocked > 1 ? ' bloquées' : ' bloquée'); },
    ipsBlocked: 'Bloqué', ipsAlerted: 'Alerte',
    ipsNote: 'Les réglages sont écrits dans la détection d’intrusion d’OPNsense (Services › Intrusion Detection) ; les règles sont mises à jour chaque nuit. Le contenu du trafic chiffré (HTTPS) n’est pas visible : on examine la destination d’une connexion et ses parties non chiffrées. Suricata utilise beaucoup de mémoire ; 8 Go de RAM sont recommandés.',
    setTitle: 'Paramètres',
    enabledLabel: 'Inversa Panel', enabledSub: 'Désactivé : les règles de pare-feu ajoutées par Inversa Panel sont retirées.',
    langLabel: 'Langue de l’interface', langSub: 'Automatique reprend la langue du système OPNsense.', langAuto: 'Automatique',
    ifLabel: 'Réseaux protégés', ifSub: 'La liste des appareils, la coupure d’Internet et le DNS imposé fonctionnent sur ces interfaces.',
    respLabel: 'Réponse pour les domaines bloqués', respSub: '0.0.0.0 est plus rapide ; NXDOMAIN répond « ce domaine n’existe pas ».',
    statsLabel: 'Statistiques DNS', statsSub: 'Active les statistiques Unbound pour les compteurs de la vue d’ensemble.',
    infoNote: 'Ces réglages sont écrits dans la configuration d’OPNsense : l’alias « inversapanel_blocked » (Firewall › Aliases) et la politique de liste de blocage « Inversa Panel (managed) » (Services › Unbound DNS › Blocklists). Vous pouvez y retrouver les mêmes réglages.'
};

/* texts added after 1.1.0 */
(function (t) {
    t.ntSub = 'Vous prévient par Telegram lorsqu’un événement se produit sur le réseau. Le pare-feu envoie seulement des messages ; il ne reçoit aucune commande de Telegram.';
    t.ntEnable = 'Notifications Telegram';
    t.ntEnableSub = 'Les événements sont recueillis chaque minute et envoyés dans un seul message.';
    t.ntToken = 'Jeton du bot';
    t.ntTokenHint = 'Le jeton donné par BotFather. Une fois enregistré, il n’est plus affiché sur cette page ; saisissez-en un nouveau pour le modifier.';
    t.ntTokenKept = function (end) { return 'Enregistré (…' + end + ') · saisissez-en un nouveau pour le modifier'; };
    t.ntChat = 'Discussion';
    t.ntChatHint = 'Le numéro de la discussion où vont les messages. Après avoir écrit un message au bot dans Telegram, « Trouver la discussion » vous permet de la choisir.';
    t.ntFind = 'Trouver la discussion';
    t.ntNoChats = 'Personne n’a écrit au bot. Ouvrez votre bot dans Telegram et écrivez-lui un message (pour un groupe, ajoutez le bot au groupe), puis réessayez.';
    t.ntWhat = 'Ce qu’il faut signaler';
    t.ntKinds = {
        devices: [
            'Nouveaux appareils',
            'Un appareil vu pour la première fois, ou un appareil qui attend votre approbation. Les téléphones qui changent d’adresse au hasard comptent comme nouveaux à chaque fois.'
        ],
        attacks: [
            'Alertes d’attaque',
            'Alertes de la protection contre les attaques, sous forme de résumé chaque minute. Les tentatives venues d’Internet que le pare-feu rejette de toute façon ne sont pas signalées.'
        ],
        vpn: [
            'Connexions VPN',
            'Appareils qui se connectent à distance, et liaison entre sites qui s’établit ou se coupe.'
        ],
        internet: [
            'Connexion Internet',
            'La connexion qui se coupe puis revient, le redémarrage du pare-feu. L’information d’une coupure arrive lorsque la connexion est rétablie.'
        ],
        logins: [
            'Échecs de connexion',
            'Une tentative de connexion à l’interface du pare-feu avec un mauvais mot de passe.'
        ],
        health: [
            'État du pare-feu',
            'Lorsque le disque est presque plein, que le processeur chauffe ou qu’une mise à jour d’OPNsense attend.'
        ],
        updates: [
            'Nouvelle version',
            'GitHub est interrogé une fois par jour ; vous êtes prévenu lorsqu’une nouvelle version d’Inversa Panel est disponible. Son installation reste à votre charge, dans Paramètres › Mises à jour.'
        ]
    };
    t.ntSave = 'Enregistrer';
    t.ntTest = 'Enregistrer et envoyer un message test';
    t.ntSaved = 'Paramètres de notification enregistrés.';
    t.ntTestSent = 'Message test envoyé ; regardez dans Telegram.';
    t.ntFailed = 'Cela n’a pas fonctionné';
    t.ntLoadFailed = 'Les paramètres de notification n’ont pas pu être lus.';
    t.ntError = function (n, text) { return n + (n === 1 ? ' notification' : ' notifications') + (n === 1 ? ' n’a pas pu être envoyée et attend' : ' n’ont pas pu être envoyées et attendent') + ' : ' + text; };
    t.ntHowTitle = 'Comment le configurer';
    t.ntHow = [
        'Dans Telegram, ouvrez une discussion avec @BotFather, envoyez /newbot et donnez un nom à votre bot.',
        'Collez le jeton donné par BotFather (il ressemble à 123456789:AAH…) dans « Jeton du bot ».',
        'Ouvrez votre nouveau bot dans Telegram et appuyez sur « Démarrer », ou écrivez-lui un message. Pour des notifications dans un groupe, ajoutez le bot au groupe et écrivez-y un message.',
        'Appuyez sur « Trouver la discussion » et choisissez celle qui s’affiche.',
        'Appuyez sur « Enregistrer et envoyer un message test ».'
    ];
    t.ntPrivacy = 'Tant que les notifications sont activées, le pare-feu se connecte à api.telegram.org. Les messages contiennent des noms d’appareils et des adresses MAC et IP ; ils passent par les serveurs de Telegram. Le jeton du bot est enregistré dans la configuration d’OPNsense, et donc dans ses sauvegardes.';
    t.scanSub = 'Ce qui était configuré dans OPNsense sur ce pare-feu avant le panneau, et la façon dont le panneau s’en sert. Cette page ne fait que lire.';
    t.scanOpenOpn = 'Ouvrir dans OPNsense';
    t.scanAdopted = function (n) { return n + (n === 1 ? ' nom local est' : ' noms locaux sont') + ' désormais gérés sur la page DNS.'; };
    t.scanNone = 'Rien n’était configuré avant le panneau qui concerne ses fonctionnalités.';
    t.scanFailed = 'Les réglages existants n’ont pas pu être lus.';
    t.scanFoot = 'Les réglages d’OPNsense non comptés ici (alias, certificats, utilisateurs, autres extensions) restent tels quels ; le panneau n’y touche pas.';
    t.scanGroups = {
        warn: [
            'Peut poser des problèmes',
            'Réglages qui font le même travail qu’une fonctionnalité du panneau ou qui l’affectent. Lisez-les avant d’activer cette fonctionnalité.'
        ],
        ok: [
            'Utilisés tels quels par le panneau',
            'Affichés sur les pages du panneau et modifiables là-bas.'
        ],
        stays: [
            'Restent sur les pages d’OPNsense',
            'Continuent de fonctionner ; le panneau ne les modifie pas.'
        ]
    };
    t.scanFindings = {
        networks: [
            'Réseaux locaux',
            'Listés sous Réseau et Internet › Réseaux locaux ; la protection, l’isolation et la limite de débit s’y règlent.'
        ],
        networks_locked: [
            'Réseaux que le panneau ne modifie pas',
            'Les réseaux sur des ports agrégés (LAGG) ou des ponts, et les réseaux sans adresse fixe, sont affichés en lecture seule. Modifiez-les sur les pages Interfaces d’OPNsense.'
        ],
        multiwan: [
            'Plus d’une connexion Internet',
            'Le panneau gère une seule connexion (WAN). La page Connexion Internet est en lecture seule ; les passerelles et le basculement restent sous Système › Passerelles. Les règles du panneau pour les connexions entrantes (VPN, pays, redirection de port) ne s’appliquent qu’au WAN ; une seconde ligne n’est pas couverte.'
        ],
        wan_type: [
            'Une connexion Internet d’un type que le panneau ne configure pas',
            'La page Connexion Internet est en lecture seule. Modifiez-la sous Interfaces › WAN.'
        ],
        reservations: [
            'Adresses fixes (Dnsmasq)',
            'Affichées sur la page Appareils comme adresse fixe de l’appareil.'
        ],
        dhcp_other: [
            'Un autre serveur DHCP attribue les adresses',
            'Le panneau écrit les adresses fixes et les plages DHCP dans Dnsmasq. Tant que ISC DHCP ou Kea tourne, ces réglages n’ont aucun effet ; avec deux serveurs DHCP sur un même réseau, des appareils peuvent recevoir des adresses en conflit. Gérez les adresses fixes sur la page de ce serveur, ou passez d’abord à Dnsmasq.'
        ],
        forwards: [
            'Redirections de port',
            'Les redirections d’un port du WAN vers un appareil sont listées sur la page Redirection de port, où elles peuvent être désactivées ou supprimées.'
        ],
        forwards_complex: [
            'Redirections de port que le panneau ne modifie pas',
            'Les redirections avec des alias, des plages de ports, d’autres interfaces ou une source restreinte sont listées en lecture seule, pour ne jamais être simplifiées par erreur. Modifiez-les sous Firewall › NAT.'
        ],
        dns_names: [
            'Noms locaux',
            'Listés en lecture seule sur la page DNS. « Reprendre » les rend modifiables là-bas ; ils restent des overrides Unbound et leur description devient « Inversa Panel (managed) ». Un second enregistrement pour le même nom reste à sa place.'
        ],
        unbound_off: [
            'Unbound DNS est désactivé',
            'Le blocage par catégorie et application, la recherche sécurisée, les noms locaux et l’historique Internet passent par Unbound. Tant qu’un autre service (Dnsmasq, AdGuard Home, Pi-hole) répond aux requêtes DNS des réseaux, ces fonctionnalités ne font rien, même activées.'
        ],
        blocklists: [
            'Listes de blocage configurées dans OPNsense',
            'Elles continuent de fonctionner à côté de la liste du panneau. Un nom qu’elles bloquent peut rester bloqué même si le panneau l’autorise ; les interrupteurs de catégories du panneau ne les désactivent pas. Services › Unbound DNS › Blocklists.'
        ],
        dns_servers: [
            'Les serveurs DNS sont choisis dans OPNsense',
            'La redirection des requêtes ou le DNS sur TLS est configuré sous Services › Unbound DNS. Deux réglages casseraient Unbound ; le choix des serveurs DNS du panneau est donc désactivé. Supprimez d’abord ce réglage là-bas pour choisir dans le panneau.'
        ],
        rules: [
            'Règles de pare-feu créées dans OPNsense',
            'Elles continuent de fonctionner et ne sont pas affichées dans le panneau. Les règles propres au panneau sont évaluées avant les vôtres : un appareil bloqué par le panneau reste bloqué même si une de vos règles l’autorise, et ce que le panneau ouvre (un port VPN, une case autorisée de la table d’accès) reste ouvert même si une de vos règles le bloque. Là où le panneau n’a pas de règle, ce sont les vôtres qui décident.'
        ],
        nat: [
            'Règles NAT sortant et NAT 1:1',
            'Elles restent telles quelles et ne sont pas affichées dans le panneau. Avec le NAT sortant en mode manuel, un réseau ajouté dans le panneau ne peut pas atteindre Internet tant que vous n’ajoutez pas vous-même une règle NAT sortant pour lui.'
        ],
        wireguard: [
            'Connexions WireGuard créées dans OPNsense',
            'Elles continuent de fonctionner ; le panneau ne les modifie pas. Chaque connexion ajoutée dans le panneau reçoit sa propre instance et un port libre. Les appareils et règles des connexions existantes restent sous VPN › WireGuard.'
        ],
        ipsec: [
            'Tunnels IPsec créés dans OPNsense',
            'Listés par leur nom sur la page VPN ; ils ne sont pas modifiables là-bas.'
        ],
        openvpn: [
            'OpenVPN',
            'Le panneau n’a pas de page OpenVPN. Les connexions continuent de fonctionner et leurs règles sont les vôtres. Les réseaux derrière elles ne font pas partie de la table d’accès ni de l’isolation.'
        ],
        ids: [
            'La détection d’intrusion est déjà active',
            'Suricata était activé avant le panneau. La page Protection contre les attaques affiche son état et ses alertes, et ne touche ni aux jeux de règles ni aux interfaces. Pour que le panneau le gère, désactivez-le sous Services › Intrusion Detection puis réactivez-le dans le panneau ; le panneau choisit alors ses propres groupes de règles.'
        ],
        zenarmor: [
            'Zenarmor est installé',
            'Zenarmor et la protection contre les attaques en mode blocage utilisent la carte réseau de la même façon (netmap) ; ne les faites pas tourner ensemble sur la même interface. Utilisez la protection contre les attaques en mode « Alerte seule », ou choisissez l’un des deux. Le blocage par application et par catégorie s’applique aussi aux deux endroits, séparément.'
        ],
        shaper: [
            'Règles de limitation de trafic créées dans OPNsense',
            'Elles restent telles quelles. Une limite de débit pour un réseau ajoute les règles propres au panneau ; pour deux règles qui visent le même trafic, c’est la première qui s’applique, si bien qu’une limite peut ne pas agir comme prévu.'
        ],
        ha: [
            'Haute disponibilité (CARP / synchronisation de configuration)',
            'Le panneau n’a pas été testé dans une configuration à haute disponibilité. Ses règles automatiques n’existent que sur un pare-feu où l’extension est installée : installez-la sur les deux. Les données du panneau (consommation de données, événements) ne sont pas synchronisées.'
        ]
    };
    t.newsTitle = function (v) { return 'Nouveautés d’Inversa Panel ' + v; };
    t.newsSub = 'Le panneau a été mis à jour. Les nouveautés en bref :';
    t.newsOk = 'Compris';
    t.newsGo = 'Afficher';
    t.newsHeading = 'Nouveautés';
    t.news = {
        '1.6.0': [
            ['Assistant de configuration : réglez pas à pas les réseaux, les protections, l’approbation des nouveaux appareils et les notifications.', 'wizard'],
            ['Page Mises à jour : vérifiez et mettez à jour Inversa Panel et OPNsense au même endroit.', 'updates'],
            ['Notre nouvelle accroche : aussi simple qu’un modem, aussi puissant qu’OPNsense.', '']
        ],
        '1.5.0': [
            ['Approuver depuis votre téléphone : sur un téléphone, le panneau s’ouvre sur un écran court qui ne montre que les appareils en attente d’approbation.', 'devices'],
            ['Autoriser pour un moment : une heure, un jour, une semaine, jusqu’à minuit ou jusqu’à une heure choisie.', 'devices'],
            ['Refuser un appareil en attente, et supprimer des appareils.', 'devices'],
            ['Un nouvel appareil est désormais signalé en quelques secondes.', 'notify']
        ]
    };
    t.tabUpdates = 'Mises à jour';
    t.ugSub = 'Mises à jour d’Inversa Panel et d’OPNsense. Rien n’est recherché tant que vous n’appuyez pas sur un bouton.';
    t.ugPanelSub = 'Versions publiées sur GitHub';
    t.ugFwSub = 'Le logiciel du pare-feu lui-même';
    t.ugInstalled = 'Version installée';
    t.ugLastCheck = 'Dernière vérification';
    t.ugWaitOther = 'Vous pourrez l’installer une fois la mise à jour d’OPNsense terminée.';
    t.ugFwNotChecked = 'Pas encore vérifié.';
    t.ugFwCurrent = 'OPNsense est à jour.';
    t.ugFwChecking = 'Recherche de mises à jour…';
    t.ugFwRunning = 'OPNsense est en cours de mise à jour. Cela peut prendre quelques minutes ; vous pouvez fermer la page, la mise à jour continue.';
    t.ugFwRestarting = 'Le pare-feu redémarre. Internet est coupé pendant quelques minutes ; cette page se recharge d’elle-même lorsqu’il est de retour.';
    t.ugFwUpdated = 'OPNsense a été mis à jour et est à jour.';
    t.ugFwFailed = 'La mise à jour d’OPNsense n’a pas pu être vérifiée ni lancée.';
    t.ugFwNoAccess = 'Les informations de mise à jour d’OPNsense n’ont pas pu être lues. Cet utilisateur n’est peut-être pas autorisé à effectuer des mises à jour.';
    t.ugFwNew = function (n) { return n === 1 ? '1 mise à jour est disponible.' : n + ' mises à jour sont disponibles.'; };
    t.ugFwNewLong = function (v, n, size) { return (v ? 'OPNsense ' + v + ' est prêt : ' : '') + n + (n === 1 ? ' paquet' : ' paquets') + (size ? ', ' + size + ' à télécharger' : '') + '.'; };
    t.ugFwReboot = 'Le pare-feu redémarre une fois cette mise à jour terminée ; Internet est coupé pendant quelques minutes.';
    t.ugShowList = function (n) { return 'Afficher les ' + n + ' paquets'; };
    t.ugHideList = 'Masquer la liste';
    t.ugFwUpdate = 'Mettre à jour';
    t.ugFwUpdateReboot = 'Mettre à jour et redémarrer';
    t.ugFwConfirm = function (v, n, reboot) { return 'Mettre à jour OPNsense' + (v ? ' vers ' + v : '') + ' ? ' + n + (n === 1 ? ' paquet change.' : ' paquets changent.') + (reboot ? ' Le pare-feu redémarre à la fin et Internet est coupé pendant quelques minutes.' : ''); };
    t.ugFwMajor = function (v) { return 'Nouvelle version majeure : OPNsense ' + v + '. Effectuez la mise à niveau majeure sur la page de mise à jour d’OPNsense.'; };
    t.ugFwPage = 'Page de mise à jour d’OPNsense';
    t.upCheck = 'Rechercher une mise à jour';
    t.upChecking = 'Recherche…';
    t.upCurrent = function (v) { return 'À jour : ' + v + ' est la dernière version.'; };
    t.upNew = function (v) { return 'Une nouvelle version est disponible : ' + v; };
    t.upInstall = function (v) { return 'Mettre à jour vers ' + v; };
    t.upBackupNote = 'D’abord, la configuration d’OPNsense et les données du panneau sont sauvegardées ; après l’installation, les réglages sont vérifiés, et ce qui manque est rétabli depuis la sauvegarde.';
    t.upConfirm = function (v) { return 'Inversa Panel ' + v + ' va être téléchargé depuis GitHub et installé. Continuer ?'; };
    t.upRunning = function (v) { return 'Mise à jour vers ' + v + '.'; };
    t.upSteps = {
        check: 'Recherche de la version…',
        backup: 'Sauvegarde des réglages…',
        download: 'Téléchargement du paquet…',
        verify: 'Vérification de la somme de contrôle…',
        install: 'Installation…',
        aftercheck: 'Vérification des réglages…',
        done: ''
    };
    t.upDone = function (a, b) { return 'Mis à jour de ' + a + ' à ' + b + '.'; };
    t.upAllThere = 'Les réglages et les données ont été vérifiés : tout est là.';
    t.upRestored = {
        settings: 'Des réglages du panneau manquaient ; la configuration a été rétablie depuis la sauvegarde.',
        records: 'Des fichiers de données manquants ont été rétablis depuis la sauvegarde.'
    };
    t.upProblems = {
        version: 'La version installée n’est pas celle attendue.',
        settings: 'Certains réglages du panneau ont changé ; la sauvegarde n’a pas été rétablie, car la configuration a aussi été modifiée ailleurs entre-temps. Sauvegarde : /var/db/inversapanel-update/backup/config.xml',
        config_unreadable: 'La configuration n’a pas pu être lue ; les réglages n’ont pas été vérifiés.',
        code: 'Le code de la nouvelle version n’a pas pu se charger.',
        check: 'La vérification après l’installation ne s’est pas terminée.'
    };
    t.upFailed = 'La mise à jour n’a pas eu lieu ; la version installée est restée telle quelle.';
    t.upErrors = {
        unreachable: 'GitHub est injoignable.',
        nopackage: 'Le panneau n’a pas été installé comme paquet ; il ne peut pas être mis à jour d’ici.',
        norelease: 'Le paquet de la dernière version est introuvable.',
        nonewer: 'Il n’existe pas de version plus récente.',
        backup: 'La sauvegarde n’a pas pu être faite.',
        download: 'Le paquet n’a pas pu être téléchargé.',
        checksum: 'La somme de contrôle du paquet téléchargé ne correspond pas ; il n’a pas été installé.',
        install: 'Le paquet n’a pas pu être installé.',
        stale: 'La mise à jour s’est arrêtée à mi-parcours.'
    };
    t.bkSub = 'Une sauvegarde de la configuration d’OPNsense ; les réglages du panneau en font partie.';
    t.bkGetTitle = 'Faire une sauvegarde';
    t.bkGetSub = 'Télécharge la configuration telle qu’elle est maintenant sur votre ordinateur.';
    t.bkDownload = 'Télécharger la sauvegarde';
    t.bkDownloadShort = 'Télécharger';
    t.bkSecret = 'Le fichier contient des empreintes de mots de passe et des clés VPN ; gardez-le dans un endroit de confiance.';
    t.bkPutTitle = 'Restaurer une sauvegarde';
    t.bkPutSub = 'Rétablit un fichier de sauvegarde téléchargé plus tôt.';
    t.bkUpload = 'Choisir un fichier et restaurer';
    t.bkRestartNote = 'La restauration redémarre le pare-feu ; Internet est coupé pendant 1 à 2 minutes. Les modifications faites après la sauvegarde sont perdues.';
    t.bkCopies = 'Copies sur le pare-feu';
    t.bkCopiesSub = 'Une copie est faite chaque nuit à 03:15 lorsque la configuration a changé ; les 7 dernières copies sont conservées.';
    t.bkNow = 'Faire une copie maintenant';
    t.bkNone = 'Aucune copie pour l’instant ; la première sera faite ce soir.';
    t.bkRestore = 'Restaurer';
    t.bkConfirmCopy = function (n) { return 'La copie de ' + n + ' va être rétablie et le pare-feu va redémarrer. Internet est coupé pendant 1 à 2 minutes ; les modifications faites après cette heure sont perdues. Continuer ?'; };
    t.bkConfirmFile = function (n) { return 'Le fichier ' + n + ' va être rétabli et le pare-feu va redémarrer. Internet est coupé pendant 1 à 2 minutes ; les réglages du fichier remplacent les réglages actuels. Continuer ?'; };
    t.bkRestarting = 'La configuration a été rétablie ; le pare-feu redémarre. Cette page se recharge d’elle-même à son retour (1 à 2 minutes).';
    t.bkErrors = {
        notconfig: 'Ce fichier n’est pas une configuration OPNsense.',
        incomplete: 'Le fichier de configuration semble incomplet ; il n’a pas été rétabli.',
        restore: 'La configuration n’a pas pu être rétablie ; les réglages actuels sont restés tels quels.',
        notfound: 'La copie est introuvable.'
    };
    t.aboutNotInstalled = 'non installé';
    t.wakeTitle = 'Réveiller';
    t.wakeSub = 'Demande à un appareil éteint de s’allumer (Wake-on-LAN) ; l’appareil doit l’avoir activé.';
    t.wakeBtn = 'Réveiller';
    t.wakeSent = 'La demande de réveil a été envoyée ; l’appareil s’allume bientôt s’il le permet.';
    t.wakeFailed = 'La demande de réveil n’a pas pu être envoyée.';
    t.landLabel = 'Ouvrir Inversa Panel après la connexion';
    t.landSub = 'Pour votre seul utilisateur ; désactivé, la connexion ouvre la page d’OPNsense.';
    t.landOther = function (p) { return 'Une autre page est définie pour votre utilisateur dans OPNsense : ' + p + '. Activer ceci la remplace.'; };
    t.pauseTitle = 'Pause pendant un moment';
    t.pause30 = '30 minutes';
    t.pause60 = '1 heure';
    t.pause120 = '2 heures';
    t.pauseMorning = 'Jusqu’à 07:00';
    t.pauseResume = 'Reprendre';
    t.pauseUntil = function (c) { return 'Pause jusqu’à ' + c; };
    t.pauseUntilLong = function (c) { return 'L’accès à Internet est en pause jusqu’à ' + c + '.'; };
    t.pauseSub = 'Prend effet immédiatement ; Internet revient tout seul à la fin de la pause.';
    t.apprAllowed = 'Autorisé';
    t.apprRevoke = 'Retirer l’autorisation d’être sur ce réseau';
    t.apprToggleAria = function (n) { return 'Autorisation de ' + n + ' d’être sur le réseau'; };
    t.apprRejected = 'Refusé';
    t.apprReject = 'Refuser';
    t.apprRejectedPanel = 'Vous avez refusé cet appareil : il ne peut joindre ni Internet ni les autres réseaux, et vous ne serez plus prévenu à son sujet.';
    t.apprFor = 'Autoriser pour un moment';
    t.allow1h = '1 heure';
    t.allow1d = '1 jour';
    t.allow1w = '1 semaine';
    t.allowForever = 'Définitivement';
    t.apprNow = 'Autoriser pour un moment et refuser prennent effet tout de suite. « Approuver » est définitif et s’enregistre avec « Appliquer ».';
    t.apprUntil = function (w) { return 'Autorisé jusqu’à ' + w; };
    t.apprUntilLong = function (w) { return 'Autorisé pour un moment, jusqu’à ' + w + '. Ensuite, l’appareil attend de nouveau votre approbation.'; };
    t.qTitle = function (n) { return n === 1 ? '1 appareil veut rejoindre le réseau' : n + ' appareils veulent rejoindre le réseau'; };
    t.qHint = 'Tant que vous ne les autorisez pas, ils n’atteignent ni Internet ni les autres réseaux.';
    t.qAllow = 'Autoriser';
    t.qNone = 'Plus aucun appareil n’attend.';
    t.qFull = 'Ouvrir le panneau complet';
    t.qAllowed = function (n, w) { return w ? n + ' est autorisé jusqu’à ' + w + '.' : n + ' est autorisé définitivement.'; };
    t.qRejected = function (n) { return n + ' a été refusé ; vous ne serez plus prévenu au sujet de cet appareil.'; };
    t.qPending = 'Une modification du réseau attend sa confirmation. Confirmez-la d’abord, ou attendez qu’elle soit annulée.';
    t.forgetTitle = 'Supprimer l’appareil';
    t.forgetBtn = 'Supprimer';
    t.forgetSub = 'Son nom, son approbation, son adresse fixe et sa place dans les horaires sont supprimés. S’il revient, c’est un nouvel appareil ; sur un réseau qui le demande, il attend de nouveau votre approbation.';
    t.forgetConfirm = function (n) { return 'Supprimer ' + n + ' ? Son nom, son approbation, son adresse fixe et sa place dans les horaires sont supprimés. Si l’appareil est sur le réseau maintenant, il réapparaît comme nouvel appareil.'; };
    t.forgetDone = function (n) { return n + ' a été supprimé.'; };
    t.allowMidnight = 'Jusqu’à minuit';
    t.allowPick = 'Choisir la fin…';
    t.allowPickLabel = 'Autorisé jusqu’à';
    t.allowPickCancel = 'Annuler';
    t.allowPickSub = '30 jours au maximum. Pour plus longtemps, choisissez « Définitivement ».';
    t.allowPickBad = 'La fin doit être postérieure à maintenant et au plus 30 jours plus tard.';
    t.allowMidnightShort = 'Minuit';
    t.allowPickShort = 'Choisir l’heure…';
    t.qFullShort = 'Panneau complet';
    t.wiz = {
        start: [
            'Bienvenue dans Inversa Panel',
            'Configurons l’essentiel en quelques étapes. Chaque étape peut être modifiée plus tard dans Paramètres.'
        ],
        nets: [
            'Réseaux à protéger',
            'Les règles de blocage, le filtre DNS et l’approbation des nouveaux appareils ne s’appliquent qu’aux réseaux que vous choisissez.'
        ],
        protect: [
            'Protections',
            'Choisissez ce que le pare-feu bloque par DNS.'
        ],
        devices: [
            'Nouveaux appareils',
            'Sur quels réseaux un nouvel appareil doit-il attendre que vous le laissiez entrer ?'
        ],
        notify: [
            'Notifications',
            'Facultatif : soyez prévenu par Telegram lorsqu’un nouvel appareil apparaît ou qu’une attaque est bloquée. Ces réglages sont enregistrés tout de suite avec « Enregistrer » ci-dessous ; si vous n’en voulez pas, appuyez sur « Suivant ».'
        ],
        done: [
            'Récapitulatif',
            'Vos choix sont ci-dessous. « Appliquer et terminer » les applique d’un coup.'
        ]
    };
    t.wizKicker = 'Assistant de configuration';
    t.wizShort = {
        start: 'Démarrer',
        nets: 'Réseaux',
        protect: 'Protections',
        devices: 'Nouveaux appareils',
        notify: 'Notifications',
        done: 'Récapitulatif'
    };
    t.wizNextTo = function (n) { return 'Suivant : ' + n + ' →'; };
    t.wizStep = function (n, m) { return 'Étape ' + n + ' sur ' + m; };
    t.wizClose = 'Fermer l’assistant';
    t.wizBack = 'Retour';
    t.wizNext = 'Suivant';
    t.wizFinish = 'Appliquer et terminer';
    t.wizSafe = 'Rien ne change sur le pare-feu avant la dernière étape. Seuls la langue, la page d’ouverture après la connexion et les notifications sont enregistrés dès que vous les modifiez.';
    t.wizNoNet = 'Choisissez au moins un réseau.';
    t.wizScan = 'Si vous avez déjà configuré des choses dans OPNsense, vous pouvez voir comment le panneau les comprend.';
    t.wizRecommended = 'Recommandé';
    t.wizIps = 'La protection contre les attaques (Suricata) demande plus de mémoire ; vous pouvez l’activer plus tard dans Sécurité › Protection contre les attaques.';
    t.wizApprSub = 'Lorsqu’elle est activée, un nouvel appareil n’atteint ni Internet ni les autres réseaux tant que vous ne l’avez pas laissé entrer.';
    t.wizApprNote = 'Les appareils de ces réseaux comptent désormais comme approuvés, pour que personne ne soit coupé. Pour laisser entrer de nouveaux appareils depuis votre téléphone, utilisez les notifications Telegram, le VPN et « Ouvrir Inversa Panel après la connexion ».';
    t.wizNone = 'Aucun';
    t.wizDoneNote = 'Après l’application, vous pouvez tout modifier sur les pages du menu. L’assistant peut être relancé depuis Paramètres.';
    t.wizStart = 'Lancer l’assistant de configuration';
    t.wizAgain = 'Assistant de configuration';
    t.wizAgainSub = 'Reconfigurez pas à pas les réseaux, les protections, l’approbation des nouveaux appareils et les notifications.';
    t.wizAgainBtn = 'Lancer l’assistant';
    t.wanSpeedBtn = 'Test de débit';
    t.wanSpeeding = 'Mesure en cours… (15 s)';
    t.wanUp = 'Envoi';
    t.wanPing = 'Latence';
    t.wanSpeedFailed = 'Le débit n’a pas pu être mesuré.';
    t.wanSpeedLimited = function (m) { return 'Le serveur de mesure refuse les tests enchaînés pendant un moment. Réessayez dans environ ' + m + ' minutes.'; };
    t.pfTargetHint = 'Choisissez dans la liste ou saisissez une adresse IP.';
})(window.InversaPanelI18n.fr);

/* device identity watch (1.7.0) */
(function (t) {
    t.ov.evId = 'Identité de l’appareil modifiée';
    t.ov.evIdHeld = 'Identité de l’appareil modifiée, autorisation retirée';
    t.idwLabel = 'Surveillance de l’identité des appareils';
    t.idwSub = 'Une adresse MAC peut être copiée, la façon dont un appareil demande son adresse IP le plus souvent non. Vous êtes prévenu quand un appareil autorisé ressemble à un autre type d’appareil, quand deux appareils utilisent la même adresse en même temps, ou quand il fixe soudain lui-même son adresse IP. Une copie devient visible, mais n’est pas empêchée : la copie d’un appareil du même type (iPhone d’un iPhone) peut passer inaperçue. Fonctionne uniquement avec le serveur DHCP dnsmasq d’OPNsense.';
    t.idwModes = { off: 'Désactivée', tell: 'Me prévenir', hold: 'Retirer l’autorisation' };
    t.idwConflict = function (f) { return 'Un autre script de bail est déjà configuré dans dnsmasq (' + f + '). dnsmasq n’en accepte qu’un, le panneau le laisse donc tel quel et la surveillance ne fonctionne pas.'; };
    t.idwNoDnsmasq = 'Cet OPNsense n’a pas de dossier pour les extensions de dnsmasq ; la surveillance ne fonctionne pas.';
    t.idwKinds = { apple: 'Appareil Apple', windows: 'Windows', android: 'Android', linux: 'Linux', other: 'Type inconnu' };
    t.idwKnown = 'Identité connue';
    t.idwBadge = 'Identité modifiée';
    t.idwWhy = { fp: 'Il a demandé son adresse IP comme un autre type d’appareil.', both: 'Deux appareils différents utilisent cette adresse MAC.', name: 'Il a donné un autre nom.', manual: 'Il a fixé lui-même son adresse IP au lieu de la demander.' };
    t.idwSeen = function (k, n) { return 'Vu en dernier : ' + k + (n ? ' · ' + n : '') + '.'; };
    t.idwWhen = function (a) { return '(' + a + ')'; };
    t.idwAccept = 'C’est le mien, accepter';
    t.idwAccepted = 'La nouvelle identité est acceptée pour cet appareil.';
    t.qIdTitle = function (n) { return n === 1 ? 'L’identité d’1 appareil a changé' : 'L’identité de ' + n + ' appareils a changé'; };
    t.qIdHint = 'Son adresse MAC a peut-être été copiée. Acceptez-le s’il est à vous, sinon refusez-le.';
    t.news['1.7.0'] = [['Surveillance de l’identité des appareils : un appareil à l’adresse MAC copiée est repéré ; vous êtes prévenu ou son autorisation est retirée (Paramètres, désactivée par défaut).', 'settings']];
})(window.InversaPanelI18n.fr);
