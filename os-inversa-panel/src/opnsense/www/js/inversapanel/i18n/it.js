/*
 * SPDX-License-Identifier: BSD-2-Clause
 * Copyright (C) 2026 Inversa Bilişim
 *
 * Italian.
 */
window.InversaPanelI18n = window.InversaPanelI18n || {};
window.InversaPanelI18n.it = {
    langName: 'Italiano',
    locale: 'it-IT',
    ov: {
        yesterday: 'ieri', now: 'ora', show: 'Mostra', none: 'Nessuno', connected: 'Connesso', noConn: 'Non connesso', noAnswer: 'nessuna risposta', pct: function (n) { return n + '%'; },
        minAgo: function (n) { return n + ' min fa'; },
        durDH: function (d, h) { return d + (d === 1 ? ' giorno' : ' giorni') + (h ? ' ' + h + ' h' : ''); },
        durHM: function (h, m) { return h + ' h' + (m ? ' ' + m + ' min' : ''); },
        durM: function (m) { return m < 1 ? 'meno di un minuto' : m + ' min'; },
        todoTitle: function (n) { return n === 1 ? '1 cosa richiede attenzione' : n + ' cose richiedono attenzione'; },
        todoOff: 'Inversa Panel è disattivato; nulla è protetto', todoWan: 'Nessuna connessione a Internet',
        todoWait: function (n) { return n === 1 ? '1 nuovo dispositivo in attesa di approvazione' : n + ' nuovi dispositivi in attesa di approvazione'; },
        todoVpn: function (name) { return 'La connessione VPN «' + name + '» non è attiva'; },
        todoIps: 'La protezione dagli attacchi è attiva ma non è in esecuzione',
        wanUpShort: 'Internet connesso', lastAlert: function (w) { return 'ultimo avviso di attacco ' + w; },
        chkInternet: 'Internet', chkGeo: 'Blocco per paese', chkUpdate: 'Aggiornamento',
        notRunning: 'Non in esecuzione', ipsBlocking: 'Blocca', ipsWatching: 'Avvisa',
        geoAllow: function (n) { return n === 1 ? '1 paese consentito' : n + ' paesi consentiti'; }, geoBlock: function (n) { return n === 1 ? '1 paese bloccato' : n + ' paesi bloccati'; },
        vpnUp: function (a, b) { return a + ' / ' + b + ' attive'; },
        updReady: function (v) { return v + ' disponibile'; }, updPending: 'Aggiornamento disponibile', upToDate: 'Aggiornato',
        waiting: function (n) { return n + ' in attesa di approvazione'; },
        kpiBlocked: 'Richieste DNS bloccate · oggi', noQueries: 'Ancora nessuna richiesta oggi',
        kpiAlerts: 'Avvisi di attacco · oggi', ipsOff: 'La protezione dagli attacchi è disattivata', noAlerts: 'Nessun avviso oggi',
        allBlocked: 'Tutti bloccati', someBlocked: function (n) { return n === 1 ? '1 bloccato' : n + ' bloccati'; }, lastAt: function (w) { return 'ultimo ' + w; },
        kpiSpeed: 'Velocità attuale', kpiUsage: 'Dati usati · oggi', since: function (w) { return 'dalle ' + w; }, usageSoon: 'La registrazione inizia entro un minuto',
        gateway: 'Gateway', latency: 'Ritardo Internet', dnsTime: 'Ricerca dei nomi', upSince: 'Connesso da',
        netsSub: 'Dispositivi · Mbit/s attuali', isolated: 'isolata', devs: function (n) { return n === 1 ? '1 dispositivo' : n + ' dispositivi'; },
        peers: function (a, b) { return a + ' / ' + b + ' dispositivi connessi'; }, vpnNone: 'Nessuna connessione VPN configurata.',
        blockedTitle: 'Richieste bloccate', blockedSub: 'Ultime 24 ore · per ora', reqs: function (n) { return n === 1 ? '1 richiesta' : n + ' richieste'; },
        evTitle: 'Eventi recenti', evNone: 'Ancora nessun evento registrato.', times: function (n) { return n === 1 ? '1 volta' : n + ' volte'; },
        evAttackBlocked: 'Attacco bloccato', evAttack: 'Avviso di attacco', evWait: 'Nuovo dispositivo in attesa di approvazione', evNew: 'Nuovo dispositivo in rete', evPeer: 'Dispositivo VPN connesso',
        evVpnUp: 'Connessione VPN attiva', evVpnDown: 'Connessione VPN persa', evWanUp: 'La connessione a Internet è tornata', evWanDown: 'Connessione a Internet persa',
        evSchedOn: 'Pianificazione iniziata', evSchedOff: 'Pianificazione terminata', evLists: 'Liste di blocco aggiornate', evBoot: 'Firewall riavviato', evDisk: 'Il disco del firewall si sta riempiendo', evTemp: 'Il firewall si surriscalda', evUpdate: 'Un aggiornamento di OPNsense è in attesa',
        todoDisk: function (n) { return 'Il disco del firewall è pieno al ' + n + ' %'; }, todoTemp: function (n) { return 'Il firewall si surriscalda: ' + n + ' °C'; },
        sysTitle: 'Sistema', upFor: function (s) { return 'attivo da ' + s; }, cpu: 'Processore', memory: 'Memoria', disk: 'Disco', temp: 'Temperatura',
        version: 'Versione', cfgChanged: 'Ultima modifica alla configurazione'
    },
    appSub: 'Semplice come un modem, potente come OPNsense',
    tabLogs: 'Registri',
    lgCount: function (n) { return n === 1 ? '1 voce' : n + ' voci'; }, lgCsv: 'Scarica CSV', lgFailed: 'Impossibile leggere i registri.', lgMore: 'Voci precedenti',
    lgShown: function (n, all) { return n + ' di ' + all + ' voci'; },
    lgTime: 'Ora', lgWho: 'Chi', lgWhere: 'Verso dove', lgWhat: 'Cosa è successo', lgSource: 'Origine', lgResult: 'Esito', lgPeriod: 'Periodo',
    lgToday: 'Ultime 24 ore', lgDays: function (n) { return n === 1 ? '1 giorno' : n + ' giorni'; }, lgTimes: function (n) { return n === 1 ? '1 volta in quest’ora' : n + ' volte in quest’ora'; },
    lgAttacksTitle: 'Attacchi', lgAttacksSub: 'Tentativi dall’esterno verso la rete: avvisi della protezione dagli attacchi, ciò che le regole per paese hanno fermato e le connessioni rifiutate dal firewall. Conservati per 30 giorni.',
    lgAttacksSearch: 'Cerca indirizzo, paese, dispositivo o porta', lgAttacksNone: 'Nessuna voce in questo periodo.',
    lgTopSrc: 'Indirizzi più attivi', lgTopCc: 'Paesi', lgTopTarget: 'Più presi di mira',
    lgIps: 'Traccia di un attacco', lgIpsOut: 'Un dispositivo ha provato a raggiungere un indirizzo noto come dannoso', lgGeo: 'Tentativo di connessione da un paese non consentito',
    lgBlockedAddr: 'Tentativo di connessione da un indirizzo bloccato', lgFw: 'Tentativo di connessione a una porta chiusa',
    lgSrcGeo: 'Regole per paese', lgSrcFw: 'Firewall', lgFirewall: 'Il firewall',
    lgBlocked: 'Bloccato', lgAlertOnly: 'Solo avviso', lgAllowed: 'Consentito', lgBlock: 'Blocca', lgAllow: 'Consenti', lgIsBlocked: 'Bloccato', lgInList: 'Nell’elenco',
    lgBlockedList: 'Indirizzi bloccati', lgUnblock: function (ip) { return 'Sblocca ' + ip; },
    lgNowBlocked: function (ip) { return ip + ' è bloccato.'; }, lgUnblocked: function (ip) { return ip + ' non è più bloccato.'; },
    lgHistoryTitle: 'Cronologia Internet', lgHistorySub: 'Quale dispositivo ha visitato quale sito e cosa è stato bloccato. Si vede solo il nome di dominio, mai il contenuto o l’indirizzo completo di una pagina.',
    lgHistoryKeep: 'Mostra la cronologia Internet', lgHistoryKeepSub: 'Disattivato: questa pagina non mostra i siti di nessun dispositivo. I dati vengono letti dalle statistiche DNS di OPNsense; OPNsense conserva gli ultimi 7 giorni.',
    lgNetworks: 'Reti', lgNoStats: 'La cronologia Internet viene letta dalle statistiche DNS, che sono disattivate. Si possono attivare in Impostazioni.',
    lgHistoryOff: 'La cronologia Internet è disattivata.', lgHistoryNoNet: 'Scegliere almeno una rete per vederne la cronologia.', lgHistoryNone: 'Nessuna voce in questo periodo.',
    lgHistorySearch: 'Cerca dispositivo o dominio', lgLastHour: 'Ultima ora', lgLast24: 'Ultime 24 ore', lgDomain: 'Dominio',
    lgEventsTitle: 'Accessi e modifiche', lgEventsSub: 'Chi si è connesso, chi ha effettuato l’accesso, quale impostazione è cambiata. Conservati per 90 giorni.',
    lgEventsSearch: 'Cerca persona, dispositivo o impostazione', lgEventsNone: 'Nessuna voce in questo periodo.', lgEvent: 'Evento', lgWhoWhat: 'Chi / cosa', lgDetail: 'Dettaglio', lgType: 'Tipo',
    lgTypeLogin: 'Accesso al pannello', lgTypeConfig: 'Modifica impostazioni', lgSystem: 'Sistema',
    lgLogin: 'Accesso al pannello', lgLoginOk: 'Riuscito', lgLoginTry: 'Tentativo di accesso', lgLoginBad: 'Password errata', lgConfig: 'Impostazione modificata',
    pgRange: function (a, b, n) { return a + '–' + b + ' di ' + n; }, pgSize: 'Per pagina', pgPrev: 'Pagina precedente', pgNext: 'Pagina successiva', pgPages: 'Pagine', pgPage: function (n) { return 'Pagina ' + n; },
    tabBackup: 'Backup', logout: 'Esci', tabNotify: 'Notifiche',
    tabScan: 'Impostazioni esistenti', scanOpen: 'Apri la pagina', scanAdopt: 'Prendi in carico', welcomeScan: 'Esamina le impostazioni esistenti',
    tabAbout: 'Informazioni', aboutSub: 'La versione installata, chi lo sviluppa, a chi rivolgersi e il software su cui si basa il pannello.',
    aboutVersion: 'Versione', aboutRunsOn: 'In esecuzione su', aboutLicense: 'Licenza', aboutSource: 'Codice sorgente',
    aboutCompany: [
        'Inversa Panel è un plugin open source di Inversa Bilişim per gestire da un’unica schermata le impostazioni più usate di OPNsense.',
        'Il nostro obiettivo è un firewall potente che anche chi non è specialista di reti possa usare con facilità. Dispositivi, filtro Internet, VPN, protezione dagli attacchi e registri sono riuniti in un’unica schermata semplice, senza doversi orientare tra i menu di OPNsense per le operazioni di tutti i giorni.',
        'Il pannello lavora con le impostazioni di OPNsense: legge ciò che c’è e aggiorna solo ciò che viene modificato. Si può tornare alle pagine di OPNsense in qualsiasi momento.',
        'Suggerimenti e segnalazioni di errori ci aiutano a migliorare il pannello; è possibile contattarci agli indirizzi in questa pagina.'
    ],
    aboutWeb: 'Sito web', aboutMail: 'E-mail', aboutIssues: 'Errori e richieste', aboutIssuesLink: 'Segnala su GitHub',
    aboutSupport: 'Informazioni per l’assistenza', aboutSupportSub: 'Inviare questo riepilogo quando si chiede aiuto. Non contiene password, chiavi o indirizzi dei dispositivi.',
    aboutCopy: 'Copia informazioni per l’assistenza', aboutCopied: 'Copiato',
    aboutBuiltOn: 'Basato su', aboutBuiltOnSub: 'Inversa Panel riunisce ciò che offrono questi progetti open source.',
    aboutOpnsense: 'Il firewall vero e proprio', aboutUnbound: 'Risoluzione e blocco DNS', aboutSuricata: 'Protezione dagli attacchi',
    aboutWireguard: 'VPN', aboutStrongswan: 'VPN IPsec', aboutDbip: 'Dati sui paesi · IP Geolocation by DB-IP',
    tabDash: 'Panoramica', tabDevices: 'Dispositivi', tabSecurity: 'Sicurezza', tabSettings: 'Impostazioni',
    subFilter: 'Categorie e app', subLists: 'Elenco consentiti / bloccati', subtabsAria: 'Pagine di questa sezione',
    protOn: 'Protezione attiva', protPartial: 'Protezione in parte disattivata', protOff: 'Inversa Panel disattivato',
    protWhyTitle: 'Protezioni disattivate:', protWhyOk: 'Il blocco della pubblicità e dei siti dannosi è attivo.',
    protWhyOff: 'Inversa Panel è disattivato, quindi non viene applicata alcuna protezione.',
    protGoFilter: 'Fare clic per attivarle (Sicurezza).', protGoSettings: 'Fare clic per attivarlo (Impostazioni).',
    statusWhy: function (list) { return 'Disattivato: ' + list.join(', '); },
    pending: function (n) { return n === 1 ? '1 modifica non salvata' : n + ' modifiche non salvate'; },
    pendingHint: 'Le modifiche vengono scritte sul firewall premendo «Applica».',
    apply: 'Applica', applying: 'Applicazione…', discard: 'Annulla',
    showChanges: 'Mostra modifiche', hideChanges: 'Nascondi', changesTitle: 'Modifiche non salvate', undo: 'Ripristina',
    applied: 'Modifiche applicate. Le regole del firewall sono state aggiornate; il blocco DNS si aggiorna in background e sarà attivo entro 1-2 minuti.',
    applyFailed: 'Impossibile applicare le modifiche:',
    validationFailed: 'Alcuni valori non sono validi:',
    loadFailed: 'Impossibile caricare i dati di Inversa Panel. Ricaricare la pagina.',
    welcomeTitle: 'Benvenuti in Inversa Panel',
    welcomeText: 'La configurazione OPNsense esistente viene mantenuta; Inversa Panel non attiva nulla finché non si cambia qualcosa. Attivare la protezione consigliata (pubblicità e siti dannosi)?',
    welcomeYes: 'Attiva la protezione consigliata', welcomeNo: 'Non ora',
    statusOk: 'La rete è protetta', statusWarn: 'Alcune protezioni sono disattivate', statusOff: 'Inversa Panel è disattivato',
    statusLine: function (online, total) {
        return (online === 1 ? '1 dispositivo online' : online + ' dispositivi online') + ' · ' + (total === 1 ? '1 dispositivo noto' : total + ' dispositivi noti');
    },
    dnsFilter: 'Filtro DNS', active: 'Attivo', inactive: 'Disattivato',
    kpiOnline: 'Dispositivi online', kpiOnlineSub: function (n) { return n === 1 ? 'su 1 dispositivo noto' : 'su ' + n + ' dispositivi noti'; },
    kpiBlocked: 'Richieste DNS bloccate', kpiBlockedSub: function (p) { return p + '% di tutte le richieste'; },
    kpiNoStats: 'Statistiche disattivate',
    kpiDown: 'Download attuale', kpiUp: 'Upload attuale', kpiRateSub: 'Connessione Internet (WAN)',
    chartTitle: 'Traffico Internet', chartSub: function (m) { return m === 1 ? 'Ultimo minuto · WAN' : 'Ultimi ' + m + ' minuti · WAN'; },
    legendDown: 'Download', legendUp: 'Upload', chartWaiting: 'Raccolta dei dati…',
    topDevTitle: 'Dispositivi più attivi', topDevSub: 'Connessioni aperte', conns: function (n) { return n === 1 ? '1 connessione' : n + ' connessioni'; },
    topBlockedTitle: 'Domini più bloccati', noBlocked: 'Ancora nessuna richiesta bloccata.', customList: 'App / elenco personalizzato',
    statsOff: 'Le statistiche DNS sono disattivate. Si possono attivare in Impostazioni.',
    quickTitle: 'Protezione rapida', quickSub: 'Attiva / disattiva con un clic', editAll: 'Tutte le impostazioni di blocco', allDevices: 'Tutti i dispositivi',
    on: 'Attivo', off: 'Disattivato',
    devTitle: 'Dispositivi',
    devSub: 'Dispositivi visti sulle reti protette. Fare clic sul nome di un dispositivo per modificarlo. Un dispositivo con Internet sospeso può comunque raggiungere il firewall (DNS, DHCP).',
    search: 'Cerca nome, rete, IP o MAC', fAll: 'Tutti', fOnline: 'Online', fBlocked: 'Internet sospeso', fWaiting: 'In attesa di approvazione',
    fShown: function (n, all) { return n === all ? (all === 1 ? '1 dispositivo' : all + ' dispositivi') : n + ' di ' + all + ' dispositivi'; }, fReset: 'Azzera filtri', fNetworkShow: 'Mostra i dispositivi di questa rete',
    sortHint: 'Fare clic per ordinare',
    colDevice: 'Dispositivo', colNetwork: 'Rete', colIp: 'Indirizzo IP', colMac: 'Indirizzo MAC', colSeen: 'Stato', colConns: 'Connessioni', colNet: 'Internet',
    online: 'Online', offline: 'Offline',
    justNow: 'proprio ora',
    agoMin: function (n) { return n + ' min fa'; },
    agoHour: function (n) { return n + ' h fa'; },
    agoDay: function (n) { return n === 1 ? '1 giorno fa' : n + ' giorni fa'; },
    netOn: 'Attivo', netOff: 'Sospeso', unnamed: 'Dispositivo senza nome', unknownVendor: 'Produttore sconosciuto',
    cutAria: function (n) { return 'Attiva / sospendi Internet per ' + n; },
    editAria: function (n) { return 'Modifica ' + n; },
    noResult: 'Nessun dispositivo corrispondente.', noDevicesYet: 'Ancora nessun dispositivo visto.', noActive: 'Nessun dispositivo ha connessioni aperte in questo momento.', close: 'Chiudi',
    discoveryHint: 'Suggerimento: per un elenco dei dispositivi più preciso, attivare il rilevamento degli host (Hostwatch) in Interfacce › Vicini › Impostazioni di rilevamento.',
    dName: 'Nome dispositivo', dType: 'Tipo di dispositivo', dVendor: 'Produttore', dMac: 'Indirizzo MAC', dNetwork: 'Rete', dIps: 'Indirizzi IP',
    dHostname: 'Nome DHCP', dFirst: 'Visto la prima volta', dLast: 'Visto l’ultima volta',
    dFixedIp: 'Indirizzo IP fisso', dFixedShort: 'fisso', dIpAuto: 'Automatico (DHCP)', dIpPin: 'Mantieni questo IP', dIpClear: 'Torna ad automatico',
    dIpPinHint: 'Il dispositivo riceve sempre l’indirizzo attuale.',
    dIpHint: function (net, from, to) { return 'Rete ' + net + ' · intervallo automatico ' + from + ' – ' + to + '. Si consiglia di scegliere un indirizzo fisso fuori da questo intervallo.'; },
    dIpInRange: function (from, to) { return 'Questo indirizzo è dentro l’intervallo automatico (' + from + ' – ' + to + '). Funziona, ma un indirizzo fuori dall’intervallo è più ordinato.'; },
    dIpAutoHint: 'Lasciare vuoto perché il dispositivo riceva l’indirizzo automaticamente dal DHCP.',
    dIpInvalid: 'Inserire un indirizzo IPv4 valido (es. 192.168.1.50).', dIpNoNet: 'Questo indirizzo non appartiene a nessuna rete servita dal DHCP.',
    dManualShort: 'manuale',
    dIpManual: function (ip) { return 'Questo dispositivo ha impostato da solo il proprio indirizzo (' + ip + '). Un indirizzo indicato qui avrà effetto quando il dispositivo verrà impostato su automatico (DHCP).'; },
    dIpManualPool: function (from, to) { return 'Questo indirizzo è dentro l’intervallo assegnato automaticamente (' + from + ' – ' + to + '): lo stesso indirizzo potrebbe essere dato a un altro dispositivo. «Mantieni questo IP» lo riserva a questo dispositivo.'; },
    dIpRenew: 'Dopo l’applicazione, il dispositivo riceve il nuovo indirizzo alla connessione successiva (basta spegnere e riaccendere il Wi-Fi).',
    dNet: 'Accesso a Internet', dNetSub: 'Se disattivato, il dispositivo non può raggiungere Internet.',
    dApproval: 'Approvazione di rete', dApprovalSub: 'Questa rete richiede l’approvazione dei nuovi dispositivi. Se disattivata, il dispositivo non può raggiungere Internet né le altre reti.',
    apprWaiting: 'In attesa di approvazione', apprApproved: 'Approvato', apprApprove: 'Approva',
    apprApproveAria: function (n) { return 'Approva ' + n; },
    apprPanel: 'Questo dispositivo è in attesa di approvazione: non può raggiungere Internet né le altre reti.',
    apprBanner: function (n) { return n + (n === 1 ? ' nuovo dispositivo è' : ' nuovi dispositivi sono') + ' in attesa di approvazione'; },
    apprBannerSub: 'Finché non vengono approvati non possono raggiungere Internet né le altre reti. Approvare i dispositivi conosciuti, poi premere «Applica».',
    apprShow: 'Mostra dispositivi',
    apprAuto: function (n) { return 'L’approvazione dei nuovi dispositivi è attiva: ' + (n === 1 ? 'il dispositivo visto finora risulta approvato' : 'i ' + n + ' dispositivi visti finora risultano approvati') + '. I dispositivi che si collegano da ora in poi attendono l’approvazione.'; },
    apprCard: 'Approvazione nuovi dispositivi',
    types: { phone: 'Telefono', tablet: 'Tablet', laptop: 'Computer', tv: 'TV', console: 'Console di gioco', printer: 'Stampante', iot: 'Casa intelligente', server: 'Server / NAS', unknown: 'Altro' },
    filtTitle: 'Categorie e app',
    filtSub: 'Le regole valgono per ogni dispositivo che usa il firewall come server DNS.',
    catTitle: 'Categorie', appsTitle: 'App', appsSub: 'I domini delle app selezionate (sottodomini inclusi) vengono bloccati tramite DNS.',
    blocked: 'Bloccato', allowed: 'Consentito',
    listsTitle: 'Elenco consentiti ed elenco bloccati', listsSub: 'Domini sempre consentiti o sempre bloccati, qualunque cosa dicano le categorie.',
    allowTitle: 'Elenco consentiti', allowDesc: 'Questi domini sono sempre consentiti, anche se compaiono in un elenco di categoria.',
    denyTitle: 'Elenco bloccati', denyDesc: 'Questi domini e i loro sottodomini sono sempre bloccati.',
    listEmpty: 'Ancora nessun dominio aggiunto.',
    add: 'Aggiungi', removeAria: function (d) { return 'Rimuovi ' + d; }, invalidDomain: 'Inserire un dominio valido (es. example.com).',
    warnDns: '«Forza DNS» è disattivato. I dispositivi possono aggirare il blocco usando un altro server DNS.',
    cats: {
        ads: ['Pubblicità e tracciamento', 'Blocca la pubblicità e il codice di tracciamento in siti web e app.', 'Fonte: hagezi Multi NORMAL'],
        malware: ['Malware e phishing', 'Blocca i siti noti come dannosi, di truffa e di phishing.', 'Fonte: hagezi Threat Intelligence Feeds'],
        adult: ['Contenuti per adulti', 'Blocca i siti web per adulti.', 'Fonte: OISD NSFW'],
        gambling: ['Gioco d’azzardo', 'Blocca i siti di scommesse e gioco d’azzardo.', 'Fonte: hagezi Gambling'],
        bypass: ['VPN, proxy e DNS cifrato', 'Blocca i servizi usati per aggirare il blocco.', 'Fonte: hagezi DoH/VPN/TOR/Proxy'],
        safesearch: ['Forza SafeSearch', 'Attiva la modalità con restrizioni su Google, Bing e YouTube.', 'Unbound SafeSearch'],
        forcedns: ['Forza DNS', 'Reindirizza al firewall tutte le richieste DNS dei dispositivi.', 'Regola NAT automatica']
    },
    tabNet: 'Rete e Internet', tabSched: 'Pianificazioni', tabPf: 'Inoltro porte', tabVpn: 'VPN', tabGeo: 'Paesi',
    internet: 'Internet', readonly: 'Sola lettura', linkDown: 'Cavo assente', colName: 'Nome',
    days: ['Lun', 'Mar', 'Mer', 'Gio', 'Ven', 'Sab', 'Dom'],
    schTitle: 'Pianificazioni', schSub: 'Sospende Internet o blocca app per i dispositivi scelti in determinati giorni e orari. Controllo ogni minuto.',
    schNew: 'Nuova pianificazione', schNewName: 'Nuova pianificazione', schName: 'Nome della pianificazione', schDelete: 'Elimina pianificazione',
    schDevices: 'Dispositivi', schDays: 'Giorni', schFrom: 'Inizio', schTo: 'Fine', schAction: 'Cosa deve succedere?',
    actCut: 'Sospendi Internet', actApps: 'Blocca app', schApps: 'App da bloccare', schWeek: 'Vista settimanale',
    schEmpty: 'Ancora nessuna pianificazione.', schEvery: 'Ogni giorno', schWeekdays: 'Giorni feriali', schWeekend: 'Fine settimana', schNoDays: 'Nessun giorno selezionato',
    schDevCount: function (n) { return n === 1 ? '1 dispositivo' : n + ' dispositivi'; },
    subWan: 'Connessione Internet', subNets: 'Reti locali', subPorts: 'Porte fisiche',
    wanSub: 'Come il firewall si collega a Internet. Le impostazioni OPNsense esistenti vengono lette; si aggiorna solo ciò che viene modificato.',
    netsSub: 'Le reti interne (casa, IoT, ospiti, ...) e ciò che possono raggiungere. Le impostazioni OPNsense esistenti vengono lette; si aggiorna solo ciò che viene modificato.',
    wanMissing: 'Su questo sistema non è configurata alcuna interfaccia WAN.', wanConnected: 'Connesso a Internet', wanDown: 'Nessun indirizzo Internet',
    wanVia: { dhcp: 'Tramite un modem (DHCP)', pppoe: 'Fibra / VDSL · PPPoE', 'static': 'IP statico', other: 'Altro' },
    wanTest: 'Verifica connessione', wanTesting: 'Verifica…', chkGateway: 'Gateway', chkInternet: 'Internet', chkDns: 'Risoluzione dei nomi (DNS)',
    wanMulti: 'Questo sistema ha più di una connessione Internet (multi-WAN). Per evitare confusione, le impostazioni di connessione si possono cambiare solo nei menu di OPNsense.',
    wanComplex: 'La connessione Internet usa un tipo che Inversa Panel non supporta; modificarla nei menu di OPNsense.',
    wanPortShort: 'Porta', wanLinkUp: 'cavo collegato', wanIp: 'Indirizzo IP', wanTestTitle: 'Verifica della connessione', wanRetest: 'Ripeti verifica',
    wanExt: 'IP esterno', wanExtBtn: 'Mostra IP esterno', wanExtFailed: 'non trovato',
    wanExtNote: 'L’IP esterno viene ricavato dal firewall con una richiesta a Cloudflare (1.1.1.1), quando si preme il pulsante.',
    wanAdvTitle: 'Avanzate', wanAdv: 'Avanzate: indirizzo MAC, MTU', wanAuto: 'automatico',
    wanMac: 'Indirizzo MAC', wanMacSub: 'Se il provider ha legato la linea all’indirizzo MAC del modem, inserire quell’indirizzo. Vuoto: l’indirizzo proprio della porta.',
    wanMtuSub: 'Lasciare vuoto, a meno che il provider non abbia indicato un altro valore.',
    wanMtuPppoe: 'Vuoto: 1492. Se alcuni siti non si aprono, provare un valore più basso (es. 1452).',
    wanType: 'Tipo di connessione', wanSettings: function (type) { return type + ' · impostazioni'; },
    wt: {
        dhcp: ['Dietro un modem / router', 'OPNsense riceve automaticamente l’indirizzo dal modem.'],
        pppoe: ['Fibra o VDSL (PPPoE)', 'Modem in modalità bridge o terminale fibra (ONT); OPNsense fa il lavoro del modem.'],
        'static': ['IP statico', 'Se il provider ha assegnato un indirizzo IP fisso.']
    },
    pppUser: 'Nome utente PPPoE', pppPass: 'Password PPPoE', pppKeep: 'Digitare per cambiare',
    pppoeHint: 'Nome utente, password e numero VLAN si ottengono dal provider Internet.',
    stIp: 'Indirizzo IP / prefisso', stGw: 'Gateway',
    dhcpWarn: 'Se anche il modem fa da router si ha un «doppio NAT»; giochi e inoltro porte possono dare problemi. Se possibile, mettere il modem in modalità bridge.',
    wanPort: 'Porta Internet', wanPortSub: 'La porta a cui è collegato il cavo Internet.',
    vlanReq: 'Usa tag VLAN', vlanReqSub: 'Su molte linee in fibra il traffico Internet arriva con un numero VLAN specifico.', vlanId: 'Numero VLAN',
    ipv6Sub: 'Ottenuto automaticamente se il provider offre IPv6.', v6Auto: 'Automatico', v6Off: 'Disattivato',
    netSafety: 'Senza conferma entro 90 secondi dall’applicazione, le impostazioni precedenti vengono ripristinate automaticamente.',
    netApply: 'Applica impostazioni di rete', netCreate: 'Crea rete',
    netConfirmTitle: 'Le nuove impostazioni sono attive e attendono conferma.', netConfirmText: 'Se questa pagina funziona ancora, la connessione funziona. Senza conferma le impostazioni precedenti vengono ripristinate automaticamente.',
    netConfirmBtn: 'Funziona, mantieni', netConfirmed: 'Le impostazioni sono state rese permanenti.',
    netReverted: 'Nessuna conferma ricevuta: le impostazioni precedenti vengono ripristinate. La pagina si ricaricherà a breve.',
    confirmFirst: 'Confermare prima la modifica in attesa (o attendere che venga annullata), poi premere di nuovo «Applica».',
    netKinds: { home: 'Casa / locale', iot: 'IoT / casa intelligente', guest: 'Ospiti', camera: 'Telecamere', server: 'Server' },
    netEdit: 'Modifica', netLink: 'Collegamento', untagged: 'senza tag', netAddr: 'Indirizzo',
    edTitle: function (n) { return 'Modifica rete ' + n; }, edType: 'Tipo di rete', edTypeHint: 'Il tipo di rete e l’approvazione dei nuovi dispositivi si salvano con «Applica» in cima alla pagina.',
    edApproval: 'I nuovi dispositivi attendono l’approvazione',
    edApprovalSub: 'Un dispositivo che entra in questa rete per la prima volta, via Wi-Fi o cavo, non può raggiungere Internet né le altre reti finché non viene approvato nella scheda Dispositivi.',
    edApprovalNote: 'Attivando questa opzione, i dispositivi visti finora risultano approvati; solo quelli che si collegano in seguito devono attendere. L’approvazione si basa sull’indirizzo MAC. Il traffico tra dispositivi sullo stesso switch o Wi-Fi non passa dal firewall; per fermare anche quello, attivare l’«isolamento dei client» sull’access point.',
    edApprovalNotProtected: 'Questa rete non è tra quelle protette da Inversa Panel. Aggiungerla prima in Impostazioni › Reti protette.',
    netMain: 'Rete principale', netDevCount: function (n) { return n === 1 ? '1 dispositivo connesso' : n + ' dispositivi connessi'; },
    isoRow: 'Altre reti', isoAlone: 'Isolata', isoWith: function (l) { return 'Isolata · comunica con ' + l; },
    isoTitle: 'Isola dalle altre reti', isoSub: 'Questa rete non può comunicare con le altre reti; Internet resta disponibile.',
    isoReach: 'Reti che raggiunge comunque, in entrambe le direzioni:',
    limTitle: 'Limite di velocità', limSub: 'Velocità Internet totale di questa rete.', limDown: 'Download', limUp: 'Upload',
    edColor: 'Colore', edColorN: function (n) { return 'Colore ' + n; },
    edPort: 'Porta:', edConnFixed: 'Il modo in cui una rete è collegata non si può cambiare dopo la creazione.', edRange: 'Intervallo di indirizzi',
    edApprovalShort: 'Un dispositivo che si collega per la prima volta non ha Internet finché non viene approvato.',
    vlanWifi: function (tag) { return 'Per il Wi-Fi, creare sull’access point un nome di rete (SSID) separato e associarlo al numero VLAN di questa rete (' + tag + '). Switch e access point devono supportare le VLAN.'; },
    edGw: 'Indirizzo del gateway', edDhcp: 'Server DHCP', edDhcpSub: 'Attivo: i dispositivi ricevono automaticamente un indirizzo IP.', edDhcpOff: 'Disattivato: i dispositivi richiedono un indirizzo IP impostato a mano.',
    lanChangeWarn: 'Cambiare l’indirizzo della rete a cui si è collegati può interrompere la connessione; senza conferma dal nuovo indirizzo la modifica viene annullata.',
    edDelete: 'Elimina rete', notCreated: 'Questa rete non è stata creata da Inversa Panel; rimuoverla nei menu di OPNsense.',
    edDeleteConfirm: function (n) { return 'Eliminare la rete ' + n + '? I dispositivi collegati verranno disconnessi.'; },
    netAdd: 'Aggiungi rete', netAddSub: 'Crea una rete separata per dispositivi di casa intelligente, ospiti, telecamere o server.',
    edDhcpFrom: 'Inizio intervallo', edDhcpTo: 'Fine intervallo', edLease: 'Lease (ore)', edLeaseDefault: 'predefinito', edAuto: 'automatico',
    edDhcpHint: 'I dispositivi ricevono indirizzi automatici da questo intervallo; i campi lasciati vuoti usano il valore mostrato in grigio. Gli indirizzi fissi si assegnano nella scheda Dispositivi.',
    leaseShort: function (h) { return h + ' h'; },
    edName: 'Nome della rete', edConn: 'Tipo di collegamento', edVlanMode: 'VLAN', edPortMode: 'Porta dedicata', edVlanId: 'N. VLAN',
    edParentFor: 'Porta che trasporta la VLAN:', edPortFor: 'Porta libera usata da questa rete:',
    vlanNote: 'Le VLAN richiedono switch e access point che le supportino.',
    accTitle: 'Accesso tra le reti', accSub: 'La rete nella riga può avviare una connessione verso la colonna? Fare clic su una cella per cambiarla.',
    accFrom: 'Da ↓  A →', accState: { allow: 'Consentito', deny: 'Bloccato', 'default': 'OPNsense' },
    accLegend: '«OPNsense»: Inversa Panel non interviene, valgono le regole del firewall esistenti.',
    portsSubRo: 'Le porte di rete del firewall e a cosa serve ciascuna. La porta Internet si sceglie in «Connessione Internet», quella di una rete quando la si aggiunge.',
    portWan: 'Internet (WAN)', portTrunkOnly: 'Solo VLAN', portUnused: 'Non usata',
    pfTitle: 'Inoltro porte', pfSub: 'Apre l’accesso da Internet a un dispositivo della rete. La regola del firewall necessaria viene aggiunta automaticamente e funziona subito.',
    pfRdp: 'Desktop remoto', pfCustom: 'Personalizzato', pfNew: 'Nuovo inoltro porta', pfTarget: 'Dispositivo o IP di destinazione', pfTargetPh: 'Nome dispositivo o IP', pfNamePh: 'Dalla porta', pfTo: 'Destinazione',
    pfListHint: 'Non è nell’elenco? Continuare a digitare', pfCount: function (n) { return n === 1 ? '1 inoltro' : n + ' inoltri'; },
    pfPorts: { '443': 'Web (HTTPS)', '80': 'Web (HTTP)', '22': 'SSH', '3389': 'Desktop remoto', '5900': 'VNC', '21': 'FTP', '25': 'Posta (SMTP)', '8080': 'Web (alternativa)', '8123': 'Home Assistant', '554': 'Telecamera (RTSP)', '32400': 'Plex', '25565': 'Minecraft', '27015': 'Server di gioco Steam', '3074': 'Xbox Live', '1194': 'OpenVPN', '51820': 'WireGuard' },
    pfExt: 'Porta esterna', pfInt: 'Porta interna', pfTargetIp: 'IP di destinazione', pfProto: 'Protocollo', pfAdd: 'Aggiungi inoltro porta',
    pfImmediate: 'Gli inoltri delle porte hanno effetto subito (non serve Applica).',
    pfRules: 'Inoltri delle porte', pfWanIs: function (ip) { return 'IP esterno: ' + ip; }, pfEmpty: 'Ancora nessun inoltro porta.',
    pfDelConfirm: 'Eliminare questo inoltro porta?',
    upnpTitle: 'Apertura automatica delle porte (UPnP)', upnpDesc: 'Permette a dispositivi come le console di gioco di aprire da soli le proprie porte; si gestisce nella pagina del plugin os-upnp.',
    upnpMissing: 'Plugin non installato',
    vpnTitle: 'Connessioni VPN', vpnSub: 'Accesso remoto sicuro alla rete di casa/ufficio (WireGuard) e collegamenti tra sedi (WireGuard, oppure IPsec con firewall di altri produttori).',
    vpnUnavailable: 'WireGuard non è disponibile in questa versione di OPNsense.',
    vpnNew: 'Nuova connessione VPN', vpnNone: 'Ancora nessuna connessione VPN. Iniziare con «Nuova connessione VPN».',
    vpnKindRemote: 'Accesso remoto', vpnKindRemoteDesc: 'Telefoni e portatili si collegano dall’esterno. Codice QR e file .conf per ogni dispositivo.',
    vpnKindSite: 'Da sede a sede', vpnKindSiteDesc: 'Collegamento permanente con un altro firewall/sede; le reti dei due lati si raggiungono a vicenda. WireGuard o IPsec.',
    vpnName: 'Nome della connessione', vpnPort: 'Porta UDP', vpnCreate: 'Crea connessione', vpnDelete: 'Elimina connessione',
    vpnDelConfirmConn: function (n) { return 'Eliminare la connessione «' + n + '» e tutti i suoi dispositivi?'; },
    vpnReach: 'Reti interne che può raggiungere', vpnSiteShare: 'Le nostre reti condivise con l’altro lato',
    vpnAddr: 'Indirizzo di connessione', vpnEndpoint: 'Nome di connessione (facoltativo)',
    vpnEndpointHint: 'Con un IP che cambia, inserire il nome DynDNS. Se vuoto, viene usato l’indirizzo WAN.',
    vpnMode: 'Quale traffico deve passare dalla VPN?', modeFull: 'Tutto il traffico', modeFullDesc: 'Tutto il traffico Internet del dispositivo passa da qui; il blocco della pubblicità vale anche fuori casa.',
    modeSplit: 'Solo le reti selezionate', modeSplitDesc: 'Passa dalla VPN solo il traffico verso le reti interne scelte.',
    vpnModeHint: 'Dopo aver cambiato la modalità, caricare di nuovo la configurazione dei dispositivi (QR / .conf).',
    vpnTunnel: 'Blocco IP della VPN', vpnTunnelHint: 'I dispositivi ricevono indirizzi da questo blocco (es. 10.70.0.0/24). Lasciare vuoto per sceglierne uno libero; non deve sovrapporsi alle reti interne o ad altre VPN.',
    vpnInternetOnly: 'Solo Internet', vpnInternetOnlyHint: 'Nessuna rete interna selezionata: il dispositivo va solo su Internet, usando l’indirizzo IP pubblico di questa sede. Non può raggiungere le reti interne né il firewall.',
    vpnFullEmptyHint: 'Se non si seleziona alcuna rete interna, il dispositivo ottiene solo l’accesso a Internet.',
    vpnReaddressed: 'Il blocco IP della VPN è cambiato e i dispositivi hanno ricevuto nuovi indirizzi. Caricare di nuovo la configurazione dei dispositivi (QR / .conf).',
    vpnRemoteEndpoint: 'Indirizzo dell’altro lato', vpnRemoteNets: 'Reti dell’altro lato',
    vpnRemoteKey: 'Chiave pubblica dell’altro lato (facoltativa)', vpnRemoteKeyPh: 'Lasciare vuoto perché la generi Inversa Panel',
    vpnRemoteKeyHint: 'Se lasciato vuoto, le chiavi dell’altro lato vengono generate e viene offerta una configurazione pronta (QR / .conf).',
    vpnThisSide: 'Questo lato (da inserire sull’altro lato)', vpnOtherSide: 'Altro lato', vpnPubKey: 'Chiave pubblica', vpnTunnelIp: 'Indirizzo del tunnel',
    vpnWaitsForThem: 'Visibile quando l’altro lato si collega', vpnOtherConf: 'Configurazione pronta per l’altro lato:',
    vpnDevCount: function (n) { return n === 1 ? '1 dispositivo' : n + ' dispositivi'; },
    vpnOthers: function (l) { return 'Esistono altre configurazioni WireGuard, Inversa Panel non le tocca: ' + l; },
    vpnBehindModem: 'Se OPNsense è dietro un modem, inoltrare sul modem verso OPNsense la porta UDP di ogni connessione (per IPsec UDP 500 e 4500).',
    vpnStepKind: 'Tipo', vpnStepSet: 'Impostazioni', vpnBack: 'Indietro',
    vpnAdvRemote: 'Avanzate: porta, blocco IP, indirizzo a cui collegarsi', vpnAdvSite: 'Avanzate: porta, blocco IP, chiave dell’altro lato', vpnAdvIpsec: 'Avanzate: chiave condivisa, indirizzo di questo lato',
    vpnLiveCount: function (n) { return n === 1 ? '1 connesso' : n + ' connessi'; }, vpnNoLive: 'Nessun dispositivo connesso',
    vpnTraffic: 'Traffico', vpnOurNets: 'Le nostre reti',
    wgSecret: 'Il codice QR e il file .conf contengono la chiave privata dell’altro lato. Consegnarli solo all’amministratore dell’altro lato, tramite un canale sicuro.',
    wgText: function (c) {
        return ['Connessione WireGuard: ' + c.name,
            'Questi valori vanno inseriti sul dispositivo dell’ALTRO LATO.', '',
            'Indirizzo a cui collegarsi (Endpoint) : ' + c.address,
            'Chiave pubblica di questo firewall    : ' + c.pubkey,
            'Indirizzo del tunnel di questo lato   : ' + c.tunnel,
            'Reti consentite (AllowedIPs)          : ' + [c.tunnel.split('/')[0] + '/32'].concat(c.networks).join(', '),
            'Reti dell’altro lato                  : ' + c.remote_networks.join(', '),
            'Chiave pubblica dell’altro lato       : ' + (c.remote_pubkey || '—')].join('\n');
    },
    /* IPsec site to site */
    ipcProto: 'Protocollo',
    ipcProtoWg: 'Quando anche l’altro lato usa WireGuard (OPNsense, pfSense, MikroTik, Linux).',
    ipcProtoIpsec: 'Quando l’altro lato è un firewall di un altro produttore (FortiGate, Sophos, Zyxel, Cisco, MikroTik…). IKEv2 con chiave condivisa.',
    ipcKey: 'Chiave condivisa', ipcKeyPh: 'Lasciare vuoto, la crea Inversa Panel', ipcKeyKeep: 'Digitare per cambiarla',
    ipcKeyHint: 'Deve essere uguale sui due lati. Almeno 12 caratteri: lettere, cifre e . _ ~ ! @ # % ^ * + = : , -',
    ipcOurs: 'Indirizzo di questo lato (facoltativo)',
    ipcOursHint: 'L’IP fisso o il nome host con cui l’altro lato raggiunge questo firewall. Vuoto: l’indirizzo WAN. Questo valore è anche l’identità di questo lato.',
    ipcHint: 'La cifratura è fissa (IKEv2, AES-256, SHA-256, gruppo DH 14). Una volta creata la connessione, «Impostazioni per l’altro lato» elenca tutto ciò che va inserito sull’altro dispositivo.',
    ipcThisSide: 'Questo lato', ipcId: 'Identità', ipcDown: 'Non connesso',
    ipcSheetHint: 'Cosa inserire sull’altro dispositivo (indirizzo, chiave, identità, cifratura, reti):', ipcSheetBtn: 'Impostazioni per l’altro lato',
    ipcSheet: 'Impostazioni da inserire sull’altro lato', ipcDownload: 'Scarica come file di testo',
    ipcSecret: 'L’elenco contiene la chiave condivisa. Consegnarlo solo all’amministratore dell’altro lato, tramite un canale sicuro.',
    ipcOthers: function (l) { return 'Esistono anche altri tunnel IPsec, Inversa Panel non li tocca: ' + l; },
    ipcText: function (c) {
        return ['Connessione IPsec: ' + c.name.replace(/^inversapanel-?/, ''),
            'Questi valori vanno inseriti sul dispositivo dell’ALTRO LATO.', '',
            'Gateway remoto (indirizzo a cui collegarsi) : ' + c.address,
            'Versione IKE                                : IKEv2',
            'Autenticazione                              : Chiave precondivisa (PSK)',
            'Chiave precondivisa                         : ' + c.psk,
            'ID locale (di quel dispositivo)             : ' + c.remote_id,
            'ID remoto (questo firewall)                 : ' + c.local_id,
            'Fase 1 (IKE)                                : AES-256, SHA-256, gruppo DH 14 (2048 bit)',
            'Fase 2 (ESP)                                : AES-256, SHA-256, gruppo PFS 14',
            'Reti locali (dietro quel dispositivo)       : ' + c.remote_networks.join(', '),
            'Reti remote (di questo lato)                : ' + c.networks.join(', '),
            'NAT traversal (NAT-T)                       : attivo / automatico',
            'Dead peer detection (DPD)                   : attivo', '',
            'Con più reti, definire una fase 2 per ogni coppia di reti.',
            'Le durate non devono essere uguali sui due lati.'].join('\n');
    },
    vpnNoPeers: 'Ancora nessun dispositivo aggiunto.', vpnAddPh: 'Nome dispositivo, es. Il mio telefono', vpnAdd: 'Aggiungi dispositivo',
    vpnRemove: function (n) { return 'Elimina ' + n; }, vpnDisabled: 'Disattivato', vpnNever: 'Mai connesso', vpnConnected: 'Connesso',
    vpnLast: function (m) {
        var h = Math.round(m / 60), d = Math.round(m / 1440);
        return m < 60 ? 'Visto l’ultima volta ' + m + ' min fa' : (m < 1440 ? 'Visto l’ultima volta ' + h + ' h fa' : 'Visto l’ultima volta ' + d + (d === 1 ? ' giorno fa' : ' giorni fa'));
    },
    vpnDelConfirm: 'Eliminare questo dispositivo? Non potrà più collegarsi.',
    vpnRenew: 'Nuova chiave', vpnRenewHint: 'Questo dispositivo è stato aggiunto con una versione precedente, quindi la sua chiave privata non è stata conservata. Verrà generata una nuova chiave.',
    vpnRenewConfirm: 'Generare una nuova chiave per questo dispositivo? La vecchia configurazione smette di funzionare; caricare quella nuova sul dispositivo.',
    vpnNoKey: 'La chiave privata di questo dispositivo non è salvata; rinnovarla con «Nuova chiave».',
    copy: 'Copia', save: 'Salva',
    vpnAccCol: 'Accesso', vpnAccAll: 'Le reti della connessione', vpnAccOnly: 'Solo', vpnAccOnlyThese: 'Solo questi indirizzi', vpnAccEdit: 'Modifica accesso',
    vpnAccOf: function (n) { return n + ' · cosa può raggiungere?'; }, vpnAccRemove: function (x) { return 'Rimuovi ' + x; },
    vpnAccCount: function (n) { return n === 1 ? '1 limitato' : n + ' limitati'; },
    vpnAccAllDesc: function (nets) { return 'Questo dispositivo raggiunge tutto ciò che raggiunge la connessione: ' + nets + '.'; },
    vpnAccIpPh: 'Scegliere un dispositivo o digitare un indirizzo, es. 10.0.0.20', vpnAccPortPh: 'Porta (tutte)', vpnAccAdd: 'Aggiungi',
    vpnAccDns: 'Ricerca dei nomi (DNS)', vpnAccDnsSub: 'Attivo: il dispositivo può cercare i nomi. Disattivato: si collega solo tramite indirizzo IP.',
    vpnAccNote: 'Questo dispositivo raggiunge solo gli indirizzi qui sopra e non ha Internet tramite questa connessione. La regola è applicata sul firewall: vale anche se il file .conf sul dispositivo viene modificato.',
    vpnAccBadIp: 'Inserire un indirizzo IP valido, es. 10.0.0.20.', vpnAccBadPort: 'La porta deve essere compresa tra 1 e 65535.', vpnAccNeedOne: 'Aggiungere almeno un indirizzo che il dispositivo può raggiungere.',
    vpnAddrEdit: 'Modifica indirizzo', vpnAddrOf: function (n) { return 'Indirizzo di ' + n; }, vpnAddrPh: 'IP (automatico)',
    vpnAddrHint: function (net) { return 'Facoltativo: un indirizzo all’interno di ' + net + '; se vuoto, viene usato il primo indirizzo libero.'; },
    vpnAddrChanged: 'L’indirizzo è cambiato. La configurazione sul dispositivo non funziona più; caricare di nuovo sul dispositivo questo codice QR o file .conf.',
    vpnAddrChangedNoKey: 'L’indirizzo è cambiato. Aggiornare la riga «Address» della configurazione sul dispositivo.',
    qrTitle: function (n) { return 'Configura ' + n; },
    qrStep1: 'Installare l’app WireGuard sul dispositivo.', qrStep2: 'Nell’app scegliere «+» › «Scansiona da codice QR» (su computer: importa da file).', qrStep3: 'Scansionare il codice o importare il file .conf, poi collegarsi.',
    qrDownload: 'Scarica file .conf', qrSecret: 'Il codice e il file contengono la chiave privata del dispositivo. Non condividerli; si possono ottenere di nuovo qui in qualsiasi momento.',
    geoTitle: 'Paesi', geoSub: 'Blocca per paese le connessioni in arrivo da Internet, oppure lascia entrare solo i paesi scelti.',
    geoEnable: 'Limita per paese', geoOn: function (n) { return 'Attivo · ' + n + (n === 1 ? ' paese bloccato' : ' paesi bloccati'); },
    geoOnAllow: function (n) { return 'Attivo · entrano solo le connessioni da ' + n + (n === 1 ? ' paese' : ' paesi'); },
    geoBlockEmpty: 'Attivo, ma nulla è bloccato perché non è stato scelto alcun paese.',
    geoAllowEmpty: 'Attivo, ma non è stato scelto alcun paese consentito; nulla viene limitato finché non se ne sceglie uno.',
    geoAllowNoData: 'Attivo, ma non ci sono dati sugli indirizzi per i paesi scelti; nulla viene limitato.',
    geoMode: 'Come deve funzionare?', geoModeBlock: 'Blocca i paesi scelti', geoModeAllow: 'Consenti solo i paesi scelti',
    geoModeBlockDesc: 'Le connessioni dai paesi scelti vengono bloccate.',
    geoModeAllowDesc: 'La rete è raggiungibile solo dai paesi scelti; l’uscita verso Internet non è interessata.',
    geoVpn: 'Le connessioni VPN sono escluse', geoVpnSub: 'Le connessioni VPN sono raggiungibili da qualsiasi paese.',
    geoAllowed: 'Paesi consentiti', geoAllowPick: 'Ancora nessun paese scelto. Scegliere qui sotto i paesi da consentire; fino ad allora nulla viene limitato.',
    geoBlockPick: 'Ancora nessun paese scelto. Scegliere qui sotto i paesi da bloccare.',
    geoAllowSafety: 'Questa opzione esclude tutti i paesi che non sono nell’elenco. Se il pannello viene gestito via Internet, assicurarsi che il paese in cui ci si trova sia nell’elenco. Dopo l’applicazione, senza conferma entro 90 secondi le impostazioni precedenti vengono ripristinate automaticamente.',
    geoDir: 'In quale direzione?', dirIn: 'Solo in entrata', dirBoth: 'Entrata e uscita',
    dirInDesc: 'Consigliato. I tentativi di connessione da questi paesi verso la rete vengono bloccati.',
    dirBothDesc: 'Viene bloccato anche l’accesso a siti web e servizi ospitati in questi paesi.',
    geoDb: 'Database dei paesi (GeoIP)', geoDbMaxmind: 'In uso: MaxMind GeoLite2.', geoDbOther: 'In OPNsense è configurata e in uso un’altra fonte GeoIP.',
    geoDbMissing: 'Non configurato. Inserire la chiave di licenza MaxMind gratuita.', geoKeyPh: 'Chiave di licenza MaxMind', geoKeySet: 'Nuova chiave di licenza',
    geoNeedKey: 'Il blocco per paese richiede un database GeoIP: creare un account GeoLite2 gratuito su MaxMind, generare una chiave in «Manage License Keys», inserirla qui sopra e premere Applica.',
    geoBlocked: 'Paesi bloccati', geoCount: function (n) { return n === 1 ? '1 paese' : n + ' paesi'; }, geoSearch: 'Cerca paesi',
    geoStats: 'Tentativi di connessione bloccati', geoStatsHint: 'Pacchetti bloccati dall’ultimo caricamento delle regole.',
    cleanupTitle: 'Rimuovi ciò che Inversa Panel ha aggiunto', cleanupText: 'Disattiva Inversa Panel ed elimina gli alias, i criteri di blocco DNS, i limiti di velocità e le regole automatiche del firewall che ha aggiunto. Inoltri delle porte, reti, dispositivi VPN e impostazioni DNS restano.', cleanupBtn: 'Rimuovi', cleanupConfirm: 'Disattivare Inversa Panel ed eliminare le impostazioni che ha aggiunto?', cleanupDone: 'Le impostazioni aggiunte da Inversa Panel sono state rimosse e Inversa Panel è disattivato.',
    geoNotWorking: 'Attivo, ma nulla viene ancora limitato perché il database dei paesi non è caricato.',
    geoAddresses: function (n) { return n === 1 ? '1 intervallo di indirizzi caricato' : n + ' intervalli di indirizzi caricati'; },
    geoKeyOk: 'Chiave MaxMind salvata, database caricato', geoKeyPending: 'Chiave salvata, download del database…',
    geoKeyReplace: 'Digitare una nuova chiave per sostituirla', geoGetKey: 'Come ottenere una chiave gratuita?',
    geoWaitDb: 'Il database è in download; il blocco inizia entro pochi minuti. Se richiede molto tempo, controllare la chiave.',
    geoDbipFree: 'gratuito, senza registrazione', geoDbipLoaded: function (m, n) { return 'dati ' + m + ' · ' + n + ' intervalli di indirizzi'; },
    geoDbipLater: 'scaricati quando la limitazione viene attivata e applicata, aggiornati ogni mese',
    geoUseMaxmind: 'Voglio usare la mia chiave MaxMind', geoDownloading: 'Download dei dati sui paesi; la limitazione inizia entro 1-2 minuti…',
    geoAfterApply: 'Premendo Applica, i dati gratuiti sui paesi (DB-IP Lite) vengono scaricati e la limitazione inizia entro 1-2 minuti.',
    /* DNS */
    tabDns: 'DNS',
    dnsTitle: 'DNS', dnsSub: 'Come vengono risolti i nomi: i nomi che puntano all’interno della rete e i server DNS interrogati dal firewall.',
    dnsRecTitle: 'Nomi locali',
    dnsRecSub: 'Associa un nome a un dispositivo della rete, es. nas.home.lan apre il file server.',
    dnsName: 'Nome', dnsIp: 'Indirizzo IP a cui punta',
    dnsWild: 'Sottodomini inclusi', dnsWildSub: 'Es. con example.com, anche www.example.com e mail.example.com vanno allo stesso indirizzo.',
    dnsWildShort: 'con sottodomini', dnsWildHint: function (n) { return n + ' e tutti i nomi sottostanti puntano a questo indirizzo.'; },
    dnsRecEmpty: 'Ancora nessun nome.',
    dnsRecNote: 'I nomi funzionano sui dispositivi che usano il firewall come server DNS (su tutti i dispositivi quando Sicurezza › Categorie e app › «Forza DNS» è attivo). Compaiono anche in Servizi › Unbound DNS › Sovrascritture in OPNsense.',
    dnsBadName: 'Inserire un nome valido (es. nas.home.lan).', dnsBadIp: 'Inserire un indirizzo IP valido (es. 192.168.1.20).',
    dnsTaken: function (n) { return 'Esiste già una voce per ' + n + '.'; },
    dnsForeignHint: 'Questa voce è stata creata nella pagina di OPNsense e si può modificare lì.',
    dnsSrvTitle: 'Server DNS', dnsSrvSub: 'A chi deve chiedere il firewall i nomi che non conosce?',
    dnsLockedSystem: 'In OPNsense è attivo «Usa i server dei nomi di sistema» (Servizi › Unbound DNS › Inoltro delle query). Inversa Panel non lo tocca; disattivarlo lì per scegliere i server qui.',
    dnsLockedForward: 'In OPNsense è già configurato l’inoltro DNS per tutti i nomi (Servizi › Unbound DNS › Inoltro delle query / DNS over TLS). Inversa Panel non lo tocca; rimuovere quelle voci per scegliere i server qui.',
    dnsModes: {
        auto: ['Automatico', 'Come impostato in OPNsense; per impostazione predefinita risolve i nomi da solo, partendo dai server radice.'],
        cloudflare: ['Cloudflare', 'Veloce, senza filtri.'],
        google: ['Google', 'Senza filtri.'],
        quad9: ['Quad9', 'Blocca anche da solo i siti noti come dannosi.'],
        adguard: ['AdGuard DNS', 'Blocca anche da solo pubblicità e tracciamento.'],
        custom: ['Server propri', 'Si inseriscono gli indirizzi dei server da usare.']
    },
    dnsServers: 'Indirizzi dei server', dnsServersHint: 'Separare gli indirizzi IP con virgole. Si consigliano almeno due server.',
    dnsDot: 'DNS cifrato (DNS over TLS)', dnsDotSub: 'Le richieste vengono inviate cifrate; il provider Internet non può vedere quali nomi vengono richiesti né modificare le risposte.',
    dnsTlsName: 'Nome sul certificato del server', dnsTlsNameSub: 'Il server viene verificato con questo nome (es. dns.quad9.net). Se vuoto, la connessione è cifrata ma il server non viene verificato.',
    dnsSafety: 'Prima dell’applicazione si verifica che i server rispondano. Dopo l’applicazione, senza conferma entro 90 secondi le impostazioni precedenti vengono ripristinate automaticamente.',
    dnsUnreachable: 'Nulla è stato modificato: questi server DNS non hanno risposto (controllare l’indirizzo e, se il DNS cifrato è attivo, il nome del certificato):',
    /* attack protection (Suricata) */
    tabIps: 'Protezione attacchi',
    ipsTitle: 'Protezione dagli attacchi', ipsSub: 'Il traffico dei dispositivi della rete viene confrontato con tracce note di attacchi e malware (Suricata).',
    ipsEnable: 'Ispeziona il traffico alla ricerca di attacchi',
    ipsAfterApply: 'Premendo Applica vengono scaricate le regole; l’ispezione inizia entro 1-2 minuti.',
    ipsPreparing: 'Download e caricamento delle regole…',
    ipsRunningDetect: 'In esecuzione, solo avvisi', ipsRunningBlock: 'In esecuzione, con blocco',
    ipsMemory: function (n) { return n + ' MB di memoria'; },
    ipsRules: function (ago) { return 'regole aggiornate ' + ago; },
    ipsStopped: 'Attivo, ma l’ispezione non è in esecuzione in questo momento.',
    ipsStart: 'Avvia', ipsRetry: 'Riprova',
    ipsNoMem: function (free, need) { return 'Non avviata: memoria libera insufficiente (' + free + ' MB liberi, ' + need + ' MB necessari). L’esaurimento della memoria blocca l’intero firewall, quindi non viene avviata.'; },
    ipsUnavailable: 'Il componente di rilevamento delle intrusioni non è stato trovato in questa installazione di OPNsense.',
    ipsForeign: 'Il rilevamento delle intrusioni è già attivo in OPNsense ed è stato configurato fuori da Inversa Panel. Inversa Panel non tocca quelle impostazioni e mostra solo gli avvisi qui sotto. Per gestirlo da qui, disattivare prima Servizi › Rilevamento intrusioni in OPNsense.',
    ipsMode: 'Quando viene trovata la traccia di un attacco', ipsDetect: 'Solo avviso', ipsBlock: 'Blocca',
    ipsDetectDesc: 'Le connessioni sospette vengono elencate, nulla viene interrotto. Si consiglia di iniziare così.',
    ipsBlockDesc: 'Le connessioni che corrispondono alla traccia di un attacco vengono interrotte; un falso allarme può interrompere anche una connessione innocua.',
    ipsBlockNo: {
        none: 'Il blocco richiede una rete protetta.',
        device: 'Il blocco non si può usare con questo hardware di rete (porte aggregate, bridge o interfaccia virtuale). Funziona solo la modalità di avviso.',
        offload: 'Il blocco richiede che le opzioni di offloading hardware (CRC, TSO, LRO) siano disattivate in Interfacce › Impostazioni.'
    },
    ipsWhere: 'Scheda di rete ispezionata', ipsWhereHint: 'Qui viene osservato il traffico delle reti protette.',
    ipsGroups: 'Cosa cercare', ipsGroupsSub: 'Ogni gruppo aumenta la memoria usata.',
    ipsG: {
        malware: ['Malware e server di comando', 'Un dispositivo infetto che comunica con il proprio server di controllo, mining di criptovalute, certificati noti come dannosi.'],
        attackers: ['Indirizzi di aggressori noti', 'Connessioni con server segnalati come fonti di attacchi o come compromessi.'],
        exploits: ['Sfruttamento di vulnerabilità', 'Traffico che cerca di sfruttare i punti deboli di browser, server e dispositivi.'],
        phishing: ['Phishing', 'Pagine false create per raccogliere password e dati delle carte.'],
        scan: ['Scansioni e flood', 'Scansioni delle porte e tentativi di mettere fuori uso un servizio. Può produrre molti avvisi.']
    },
    ipsAlerts: 'Ultimi avvisi', ipsAlertsNone: 'Ancora nessun avviso.',
    ips24h: function (n, blocked) { return 'Ultime 24 ore: ' + n + (n === 1 ? ' avviso, ' : ' avvisi, ') + blocked + (blocked === 1 ? ' bloccato' : ' bloccati'); },
    ipsBlocked: 'Bloccato', ipsAlerted: 'Avviso',
    ipsNote: 'Le impostazioni vengono scritte nel rilevamento delle intrusioni di OPNsense (Servizi › Rilevamento intrusioni); le regole si aggiornano ogni notte. Il contenuto del traffico cifrato (HTTPS) non è visibile: si esaminano la destinazione di una connessione e le sue parti non cifrate. Suricata usa molta memoria; si consigliano 8 GB di RAM.',
    setTitle: 'Impostazioni',
    enabledLabel: 'Inversa Panel', enabledSub: 'Se disattivato, le regole del firewall aggiunte da Inversa Panel vengono rimosse.',
    langLabel: 'Lingua dell’interfaccia', langSub: 'Automatico usa la lingua di sistema di OPNsense.', langAuto: 'Automatico',
    ifLabel: 'Reti protette', ifSub: 'L’elenco dei dispositivi, la sospensione di Internet e «Forza DNS» funzionano su queste interfacce.',
    respLabel: 'Risposta per i domini bloccati', respSub: '0.0.0.0 è più veloce; NXDOMAIN dice «dominio inesistente».',
    statsLabel: 'Statistiche DNS', statsSub: 'Attiva le statistiche di Unbound per i contatori della panoramica.',
    infoNote: 'Queste impostazioni vengono scritte nella configurazione di OPNsense: l’alias «inversapanel_blocked» (Firewall › Alias) e il criterio di blocco «Inversa Panel (managed)» (Servizi › Unbound DNS › Liste di blocco). Le stesse impostazioni sono visibili lì.'
};

/* texts added after 1.1.0 */
(function (t) {
    t.ntSub = 'Avvisa con Telegram quando succede qualcosa in rete. Il firewall invia solo messaggi; non riceve comandi da Telegram.';
    t.ntEnable = 'Notifiche Telegram';
    t.ntEnableSub = 'Gli eventi vengono raccolti una volta al minuto e inviati in un unico messaggio.';
    t.ntToken = 'Token del bot';
    t.ntTokenHint = 'Il token fornito da BotFather. Una volta salvato non viene più mostrato in questa pagina; per cambiarlo, digitarne uno nuovo.';
    t.ntTokenKept = function (end) { return 'Salvato (…' + end + ') · digitare un nuovo token per cambiarlo'; };
    t.ntChat = 'Chat';
    t.ntChatHint = 'Il numero della chat a cui vanno i messaggi. Dopo aver scritto un messaggio al bot in Telegram, «Trova la chat» permette di sceglierla.';
    t.ntFind = 'Trova la chat';
    t.ntNoChats = 'Nessuno ha scritto al bot. Aprire il bot in Telegram e scrivere un messaggio (per un gruppo, aggiungere il bot al gruppo), poi riprovare.';
    t.ntWhat = 'Cosa segnalare';
    t.ntKinds = {
        devices: ['Nuovi dispositivi', 'Un dispositivo visto per la prima volta, o in attesa di approvazione. I telefoni che cambiano indirizzo in modo casuale risultano ogni volta come nuovi.'],
        attacks: ['Avvisi di attacco', 'Avvisi della protezione dagli attacchi, come riepilogo una volta al minuto. I tentativi dall’esterno che il firewall rifiuta comunque non vengono segnalati.'],
        vpn: ['Connessioni VPN', 'Dispositivi che si collegano da remoto, e una connessione da sede a sede che si attiva o si interrompe.'],
        internet: ['Connessione Internet', 'La connessione che cade e torna, il riavvio del firewall. La notizia di un’interruzione arriva quando la connessione è tornata.'],
        logins: ['Accessi non riusciti', 'Un tentativo di accedere all’interfaccia del firewall con una password errata.'],
        health: ['Stato del firewall', 'Quando il disco sta per riempirsi, il processore si surriscalda o è in attesa un aggiornamento di OPNsense.'],
        updates: ['Nuova versione', 'GitHub viene interrogato una volta al giorno; si viene avvisati quando è disponibile una nuova versione di Inversa Panel. L’installazione va avviata a mano in Impostazioni › Aggiornamenti.']
    };
    t.ntSave = 'Salva';
    t.ntTest = 'Salva e invia un messaggio di prova';
    t.ntSaved = 'Impostazioni di notifica salvate.';
    t.ntTestSent = 'Messaggio di prova inviato; controllare Telegram.';
    t.ntFailed = 'Operazione non riuscita';
    t.ntLoadFailed = 'Impossibile leggere le impostazioni di notifica.';
    t.ntError = function (n, text) { return n + (n === 1 ? ' notifica non inviata' : ' notifiche non inviate') + (n === 1 ? ' è in attesa: ' : ' sono in attesa: ') + text; };
    t.ntHowTitle = 'Come configurarlo';
    t.ntHow = [
        'In Telegram, aprire una chat con @BotFather, inviare /newbot e dare un nome al bot.',
        'Incollare il token fornito da BotFather (ha questo aspetto: 123456789:AAH…) in «Token del bot».',
        'Aprire il nuovo bot in Telegram e premere «Avvia», oppure scrivergli un messaggio. Per le notifiche a un gruppo, aggiungere il bot al gruppo e scrivere un messaggio lì.',
        'Premere «Trova la chat» e scegliere la chat che compare.',
        'Premere «Salva e invia un messaggio di prova».'
    ];
    t.ntPrivacy = 'Finché le notifiche sono attive, il firewall si collega a api.telegram.org. I messaggi contengono nomi dei dispositivi, indirizzi MAC e IP; passano dai server di Telegram. Il token del bot è salvato nella configurazione di OPNsense, e quindi nei suoi backup.';
    t.scanSub = 'Ciò che era configurato in OPNsense su questo firewall prima del pannello, e come il pannello lavora con esso. Questa pagina legge soltanto.';
    t.scanOpenOpn = 'Apri in OPNsense';
    t.scanAdopted = function (n) { return n + (n === 1 ? ' nome locale è' : ' nomi locali sono') + ' ora gestiti nella pagina DNS.'; };
    t.scanNone = 'Nulla era configurato prima del pannello che riguardi le sue funzioni.';
    t.scanFailed = 'Impossibile leggere le impostazioni esistenti.';
    t.scanFoot = 'Le impostazioni di OPNsense non contate qui (alias, certificati, utenti, altri plugin) restano invariate; il pannello non le tocca.';
    t.scanGroups = {
        warn: ['Possono causare problemi', 'Impostazioni che svolgono lo stesso compito di una funzione del pannello o ne influenzano il funzionamento. Leggerle prima di attivare quella funzione.'],
        ok: ['Usate dal pannello così come sono', 'Mostrate nelle pagine del pannello e modificabili lì.'],
        stays: ['Restano nelle pagine di OPNsense', 'Continuano a funzionare; il pannello non le modifica.']
    };
    t.scanFindings = {
        networks: ['Reti locali', 'Elencate in Rete e Internet › Reti locali; protezione, isolamento e limite di velocità si impostano lì.'],
        networks_locked: ['Reti che il pannello non modifica', 'Reti su porte aggregate (LAGG) o bridge, e reti senza indirizzo fisso, sono mostrate in sola lettura. Modificarle nelle pagine Interfacce di OPNsense.'],
        multiwan: ['Più di una connessione Internet', 'Il pannello gestisce una sola connessione (WAN). La pagina Connessione Internet è in sola lettura; gateway e failover restano in Sistema › Gateway. Le regole del pannello per le connessioni in entrata (VPN, paesi, inoltro porte) valgono solo per la WAN; una seconda linea non è coperta.'],
        wan_type: ['Una connessione Internet di un tipo che il pannello non configura', 'La pagina Connessione Internet è in sola lettura. Modificarla in Interfacce › WAN.'],
        reservations: ['Indirizzi fissi (Dnsmasq)', 'Mostrati nella pagina Dispositivi come indirizzo fisso del dispositivo.'],
        dhcp_other: ['Un altro server DHCP assegna gli indirizzi', 'Il pannello scrive indirizzi fissi e intervalli DHCP in Dnsmasq. Mentre è in esecuzione ISC DHCP o Kea, queste impostazioni non hanno effetto; con due server DHCP sulla stessa rete, i dispositivi possono ricevere indirizzi in conflitto. Gestire gli indirizzi fissi nella pagina di quel server, oppure passare prima a Dnsmasq.'],
        forwards: ['Inoltri di porte', 'Gli inoltri di una porta su WAN verso un dispositivo sono elencati nella pagina Inoltro porte, e lì possono essere disattivati o eliminati.'],
        forwards_complex: ['Inoltri di porte che il pannello non modifica', 'Gli inoltri con alias, intervalli di porte, altre interfacce o una sorgente limitata sono in sola lettura, così non vengono semplificati per errore. Modificarli in Firewall › NAT.'],
        dns_names: ['Nomi locali', 'Elencati in sola lettura nella pagina DNS. «Prendi in carico» li rende modificabili lì; restano sovrascritture di Unbound e la loro descrizione diventa «Inversa Panel (gestito)». Un secondo record per lo stesso nome resta dov’è.'],
        unbound_off: ['Unbound DNS è disattivato', 'Blocco per categoria e app, ricerca sicura, nomi locali e cronologia Internet funzionano tramite Unbound. Mentre un altro servizio (Dnsmasq, AdGuard Home, Pi-hole) risponde alle richieste DNS delle reti, queste funzioni non fanno nulla anche se attivate.'],
        blocklists: ['Liste di blocco configurate in OPNsense', 'Continuano a funzionare accanto a quella del pannello. Un nome da loro bloccato può restare bloccato anche se il pannello lo consente; gli interruttori per categoria del pannello non le disattivano. Servizi › Unbound DNS › Liste di blocco.'],
        dns_servers: ['I server DNS si scelgono in OPNsense', 'L’inoltro delle richieste o il DNS over TLS si configurano in Servizi › Unbound DNS. Due impostazioni farebbero smettere di funzionare Unbound, quindi la scelta dei server DNS nel pannello è disattivata; rimuovere prima l’impostazione lì per scegliere dal pannello.'],
        rules: ['Regole del firewall create in OPNsense', 'Continuano a funzionare e non sono mostrate nel pannello. Le regole del pannello vengono valutate prima delle altre: un dispositivo bloccato dal pannello resta bloccato anche se una regola di OPNsense lo consente, e ciò che il pannello apre (una porta VPN, una cella consentita della tabella di accesso) è aperto anche se una regola di OPNsense lo blocca. Dove il pannello non ha una regola, decidono quelle create in OPNsense.'],
        nat: ['Regole NAT in uscita e NAT 1:1', 'Restano come sono e non sono mostrate nel pannello. Con NAT in uscita in modalità manuale, una rete aggiunta nel pannello non può raggiungere Internet finché non si aggiunge per essa una regola NAT in uscita.'],
        wireguard: ['Connessioni WireGuard create in OPNsense', 'Continuano a funzionare; il pannello non le modifica. Ogni connessione aggiunta nel pannello ha una propria istanza e una porta libera. I dispositivi e le regole di quelle esistenti restano in VPN › WireGuard.'],
        ipsec: ['Tunnel IPsec creati in OPNsense', 'Elencati per nome nella pagina VPN; non modificabili lì.'],
        openvpn: ['OpenVPN', 'Il pannello non ha una pagina OpenVPN. Le connessioni continuano a funzionare e le loro regole sono quelle configurate in OPNsense. Le reti dietro di esse non fanno parte della tabella di accesso né dell’isolamento.'],
        ids: ['Il rilevamento delle intrusioni è già attivo', 'Suricata era stato attivato prima del pannello. La pagina Protezione attacchi mostra stato e avvisi e non modifica set di regole né interfacce. Per farlo gestire dal pannello, disattivarlo in Servizi › Rilevamento intrusioni e riattivarlo nel pannello; il pannello seleziona poi i propri gruppi di regole.'],
        zenarmor: ['Zenarmor è installato', 'Zenarmor e la protezione dagli attacchi in modalità di blocco usano la scheda di rete nello stesso modo (netmap); non eseguire entrambi sulla stessa interfaccia. Usare la protezione dagli attacchi in modalità «solo avviso», oppure scegliere uno dei due. Anche il blocco per app e categoria è applicato separatamente in entrambi.'],
        shaper: ['Regole di controllo del traffico create in OPNsense', 'Restano come sono. Un limite di velocità per una rete aggiunge le regole del pannello; tra due regole che corrispondono allo stesso traffico vince la prima, quindi un limite potrebbe non agire come previsto.'],
        ha: ['Alta disponibilità (CARP / sincronizzazione della configurazione)', 'Il pannello non è stato provato in una configurazione ad alta disponibilità. Le sue regole automatiche esistono solo sul firewall dove il pacchetto è installato: installarlo su entrambi. I dati del pannello (consumo dati, eventi) non sono sincronizzati.']
    };
    t.newsTitle = function (v) { return 'Novità in Inversa Panel ' + v; };
    t.newsSub = 'Il pannello è stato aggiornato. Le novità in breve:';
    t.newsOk = 'Ho capito';
    t.newsGo = 'Mostra';
    t.newsHeading = 'Novità';
    t.news = {
        '1.6.0': [
            ['Procedura guidata di configurazione: reti, protezioni, approvazione dei nuovi dispositivi e notifiche, passo dopo passo.', 'wizard'],
            ['Pagina Aggiornamenti: controllare e aggiornare Inversa Panel e OPNsense in un solo posto.', 'updates'],
            ['Il nostro nuovo slogan: semplice come un modem, potente come OPNsense.', '']
        ],
        '1.5.0': [
            ['Approvare dal telefono: su un telefono il pannello si apre su uno schermo ridotto, con solo i dispositivi in attesa di approvazione.', 'devices'],
            ['Consentire per un po’: un’ora, un giorno, una settimana, fino a mezzanotte o fino a un orario scelto.', 'devices'],
            ['Respingere un dispositivo in attesa, ed eliminare dispositivi.', 'devices'],
            ['Un nuovo dispositivo ora viene segnalato in pochi secondi.', 'notify']
        ]
    };
    t.tabUpdates = 'Aggiornamenti';
    t.ugSub = 'Aggiornamenti di Inversa Panel e di OPNsense. Non viene cercato nulla finché non si preme un pulsante.';
    t.ugPanelSub = 'Versioni pubblicate su GitHub';
    t.ugFwSub = 'Il software del firewall';
    t.ugInstalled = 'Versione installata';
    t.ugLastCheck = 'Ultimo controllo';
    t.ugWaitOther = 'Si può installare quando l’aggiornamento di OPNsense è terminato.';
    t.ugFwNotChecked = 'Non ancora controllato.';
    t.ugFwCurrent = 'OPNsense è aggiornato.';
    t.ugFwChecking = 'Ricerca di aggiornamenti…';
    t.ugFwRunning = 'OPNsense è in aggiornamento. Può richiedere alcuni minuti; si può chiudere la pagina, l’aggiornamento prosegue.';
    t.ugFwRestarting = 'Il firewall si sta riavviando. Internet è giù per alcuni minuti; questa pagina si ricarica da sola quando torna disponibile.';
    t.ugFwUpdated = 'OPNsense è stato aggiornato e ora è alla versione più recente.';
    t.ugFwFailed = 'Impossibile controllare o avviare l’aggiornamento di OPNsense.';
    t.ugFwNoAccess = 'Impossibile leggere le informazioni di aggiornamento di OPNsense. Questo utente potrebbe non avere il permesso di aggiornare.';
    t.ugFwNew = function (n) { return n === 1 ? '1 aggiornamento è disponibile.' : n + ' aggiornamenti sono disponibili.'; };
    t.ugFwNewLong = function (v, n, size) { return (v ? 'OPNsense ' + v + ' è pronto: ' : '') + n + (n === 1 ? ' pacchetto' : ' pacchetti') + (size ? ', ' + size + ' da scaricare' : '') + '.'; };
    t.ugFwReboot = 'Il firewall si riavvia al termine di questo aggiornamento; Internet resta giù per alcuni minuti.';
    t.ugShowList = function (n) { return 'Mostra l’elenco dei pacchetti (' + n + ')'; };
    t.ugHideList = 'Nascondi l’elenco';
    t.ugFwUpdate = 'Aggiorna';
    t.ugFwUpdateReboot = 'Aggiorna e riavvia';
    t.ugFwConfirm = function (v, n, reboot) { return 'Aggiornare OPNsense' + (v ? ' alla versione ' + v : '') + '? ' + n + (n === 1 ? ' pacchetto cambia.' : ' pacchetti cambiano.') + (reboot ? ' Il firewall si riavvia al termine e Internet resta giù per alcuni minuti.' : ''); };
    t.ugFwMajor = function (v) { return 'Nuova versione principale: OPNsense ' + v + '. Eseguire l’aggiornamento alla nuova versione nella pagina di aggiornamento di OPNsense.'; };
    t.ugFwPage = 'Pagina di aggiornamento di OPNsense';
    t.upCheck = 'Controlla se c’è un aggiornamento';
    t.upChecking = 'Ricerca in corso…';
    t.upCurrent = function (v) { return 'Aggiornato: ' + v + ' è l’ultima versione.'; };
    t.upNew = function (v) { return 'È disponibile una nuova versione: ' + v; };
    t.upInstall = function (v) { return 'Aggiorna a ' + v; };
    t.upBackupNote = 'Prima vengono salvate la configurazione di OPNsense e i dati del pannello; dopo l’installazione le impostazioni vengono controllate e ciò che manca viene ripristinato dal backup.';
    t.upConfirm = function (v) { return 'Inversa Panel ' + v + ' verrà scaricato da GitHub e installato. Continuare?'; };
    t.upRunning = function (v) { return 'Aggiornamento a ' + v + ' in corso.'; };
    t.upSteps = {
        check: 'Ricerca della versione…',
        backup: 'Salvataggio delle impostazioni…',
        download: 'Download del pacchetto…',
        verify: 'Confronto della somma di controllo…',
        install: 'Installazione…',
        aftercheck: 'Controllo delle impostazioni…',
        done: ''
    };
    t.upDone = function (a, b) { return 'Aggiornato da ' + a + ' a ' + b + '.'; };
    t.upAllThere = 'Impostazioni e dati controllati: era tutto presente.';
    t.upRestored = {
        settings: 'Mancavano le impostazioni del pannello; la configurazione è stata ripristinata dal backup.',
        records: 'I file dei dati mancanti sono stati ripristinati dal backup.'
    };
    t.upProblems = {
        version: 'La versione installata non è quella prevista.',
        settings: 'Alcune impostazioni del pannello sono cambiate; il backup non è stato ripristinato perché nel frattempo la configurazione è stata modificata anche altrove. Backup: /var/db/inversapanel-update/backup/config.xml',
        config_unreadable: 'Impossibile leggere la configurazione; le impostazioni non sono state controllate.',
        code: 'Il codice della nuova versione non si è caricato.',
        check: 'Il controllo dopo l’installazione non è terminato.'
    };
    t.upFailed = 'L’aggiornamento non è avvenuto; la versione installata è rimasta com’era.';
    t.upErrors = {
        unreachable: 'Impossibile raggiungere GitHub.',
        nopackage: 'Il pannello non è stato installato come pacchetto; non può essere aggiornato da qui.',
        norelease: 'Il pacchetto dell’ultima versione non è stato trovato.',
        nonewer: 'Non c’è una versione più recente.',
        backup: 'Impossibile creare il backup.',
        download: 'Impossibile scaricare il pacchetto.',
        checksum: 'La somma di controllo del pacchetto scaricato non corrisponde; il pacchetto non è stato installato.',
        install: 'Impossibile installare il pacchetto.',
        stale: 'L’aggiornamento si è fermato a metà.'
    };
    t.bkSub = 'Un backup della configurazione di OPNsense; le impostazioni del pannello ne fanno parte.';
    t.bkGetTitle = 'Crea un backup';
    t.bkGetSub = 'Scarica la configurazione così com’è ora sul computer.';
    t.bkDownload = 'Scarica il backup';
    t.bkDownloadShort = 'Scarica';
    t.bkSecret = 'Il file contiene hash delle password e chiavi VPN; conservarlo in un posto di fiducia.';
    t.bkPutTitle = 'Ripristina da un backup';
    t.bkPutSub = 'Ripristina un file di backup scaricato in precedenza.';
    t.bkUpload = 'Scegli un file e ripristina';
    t.bkRestartNote = 'Il ripristino riavvia il firewall; Internet è giù per 1–2 minuti. Le modifiche fatte dopo il backup vanno perse.';
    t.bkCopies = 'Copie sul firewall';
    t.bkCopiesSub = 'Una copia viene salvata ogni notte alle 03:15 quando la configurazione è cambiata; vengono conservate le ultime 7 copie.';
    t.bkNow = 'Crea subito una copia';
    t.bkNone = 'Nessuna copia per ora; la prima sarà creata stanotte.';
    t.bkRestore = 'Ripristina';
    t.bkConfirmCopy = function (n) { return 'La copia del ' + n + ' verrà ripristinata e il firewall si riavvierà. Internet sarà giù per 1–2 minuti; le modifiche fatte dopo quel momento vanno perse. Continuare?'; };
    t.bkConfirmFile = function (n) { return 'Il file ' + n + ' verrà ripristinato e il firewall si riavvierà. Internet sarà giù per 1–2 minuti; le impostazioni del file sostituiscono quelle attuali. Continuare?'; };
    t.bkRestarting = 'La configurazione è stata ripristinata; il firewall si sta riavviando. Questa pagina si ricarica da sola quando torna disponibile (1–2 minuti).';
    t.bkErrors = {
        notconfig: 'Questo file non è una configurazione di OPNsense.',
        incomplete: 'Il file di configurazione sembra incompleto; non è stato ripristinato.',
        restore: 'Impossibile ripristinare la configurazione; le impostazioni attuali sono rimaste come prima.',
        notfound: 'La copia non è stata trovata.'
    };
    t.aboutNotInstalled = 'non installato';
    t.wakeTitle = 'Accensione remota';
    t.wakeSub = 'Chiede a un dispositivo spento di accendersi (Wake-on-LAN); il dispositivo deve averlo attivato.';
    t.wakeBtn = 'Accendi';
    t.wakeSent = 'La richiesta di accensione è stata inviata; il dispositivo si accende a breve, se lo supporta.';
    t.wakeFailed = 'Impossibile inviare la richiesta di accensione.';
    t.landLabel = 'Apri Inversa Panel dopo l’accesso';
    t.landSub = 'Solo per il proprio utente; se disattivato, l’accesso apre la pagina di OPNsense.';
    t.landOther = function (p) { return 'Per il proprio utente in OPNsense è impostata un’altra pagina: ' + p + '. Attivando questa opzione, viene sostituita.'; };
    t.pauseTitle = 'Sospendi per un po’';
    t.pause30 = '30 minuti';
    t.pause60 = '1 ora';
    t.pause120 = '2 ore';
    t.pauseMorning = 'Fino alle 07:00';
    t.pauseResume = 'Riprendi';
    t.pauseUntil = function (c) { return 'Sospeso fino a ' + c; };
    t.pauseUntilLong = function (c) { return 'L’accesso a Internet è sospeso fino a ' + c + '.'; };
    t.pauseSub = 'Ha effetto subito; Internet torna da solo allo scadere del tempo.';
    t.apprAllowed = 'Consentito';
    t.apprRevoke = 'Togli il permesso di stare su questa rete';
    t.apprToggleAria = function (n) { return 'Permesso di ' + n + ' di stare sulla rete'; };
    t.apprRejected = 'Respinto';
    t.apprReject = 'Respingi';
    t.apprRejectedPanel = 'Questo dispositivo è stato respinto: non può raggiungere Internet né altre reti, e non viene più segnalato.';
    t.apprFor = 'Consenti per un po’';
    t.allow1h = '1 ora';
    t.allow1d = '1 giorno';
    t.allow1w = '1 settimana';
    t.allowForever = 'Per sempre';
    t.apprNow = 'Consentire per un po’ e respingere hanno effetto subito. «Approva» è definitivo e viene salvato con «Applica».';
    t.apprUntil = function (w) { return 'Consentito fino a ' + w; };
    t.apprUntilLong = function (w) { return 'Consentito per un po’, fino a ' + w + '. Poi il dispositivo torna in attesa di approvazione.'; };
    t.qTitle = function (n) { return n === 1 ? '1 dispositivo vuole entrare nella rete' : n + ' dispositivi vogliono entrare nella rete'; };
    t.qHint = 'Finché non vengono consentiti, non raggiungono né Internet né altre reti.';
    t.qAllow = 'Consenti';
    t.qNone = 'Nessun dispositivo è più in attesa.';
    t.qFull = 'Apri il pannello completo';
    t.qAllowed = function (n, w) { return w ? n + ' è consentito fino a ' + w + '.' : n + ' è consentito per sempre.'; };
    t.qRejected = function (n) { return n + ' è stato respinto; questo dispositivo non verrà più segnalato.'; };
    t.qPending = 'Una modifica di rete attende la conferma. Confermarla prima, oppure attendere che venga ripristinata.';
    t.forgetTitle = 'Elimina dispositivo';
    t.forgetBtn = 'Elimina';
    t.forgetSub = 'Vengono rimossi nome, approvazione, IP fisso e posto nelle pianificazioni. Se torna, è un nuovo dispositivo; su una rete che lo richiede, attende di nuovo l’approvazione.';
    t.forgetConfirm = function (n) { return 'Eliminare ' + n + '? Vengono rimossi nome, approvazione, IP fisso e posto nelle pianificazioni. Se il dispositivo è in rete ora, ricompare come nuovo dispositivo.'; };
    t.forgetDone = function (n) { return n + ' è stato eliminato.'; };
    t.allowMidnight = 'Fino a mezzanotte';
    t.allowPick = 'Scegli la fine…';
    t.allowPickLabel = 'Consentito fino a';
    t.allowPickCancel = 'Annulla';
    t.allowPickSub = 'Al massimo 30 giorni in avanti. Per un periodo più lungo, scegliere «Per sempre».';
    t.allowPickBad = 'La fine deve essere successiva ad adesso e al massimo a 30 giorni in avanti.';
    t.allowMidnightShort = 'Mezzanotte';
    t.allowPickShort = 'Scegli l’ora…';
    t.qFullShort = 'Pannello completo';
    t.wiz = {
        start: ['Benvenuti in Inversa Panel', 'Configuriamo le basi in pochi passaggi. Ogni passaggio si può cambiare in seguito in Impostazioni.'],
        nets: ['Reti da proteggere', 'Regole di blocco, filtro DNS e approvazione dei nuovi dispositivi valgono solo per le reti scelte.'],
        protect: ['Protezioni', 'Scegliere che cosa blocca il firewall tramite DNS.'],
        devices: ['Nuovi dispositivi', 'Su quali reti un nuovo dispositivo deve attendere finché non viene fatto entrare?'],
        notify: ['Notifiche', 'Facoltativo: essere avvisati su Telegram quando compare un nuovo dispositivo o viene bloccato un attacco. Queste impostazioni vengono salvate subito con «Salva» qui sotto; se non si desidera, premere Avanti.'],
        done: ['Riepilogo', 'Le scelte sono qui sotto. «Applica e termina» le applica in un colpo solo.']
    };
    t.wizKicker = 'Procedura guidata di configurazione';
    t.wizShort = {
        start: 'Inizio',
        nets: 'Reti',
        protect: 'Protezioni',
        devices: 'Nuovi dispositivi',
        notify: 'Notifiche',
        done: 'Riepilogo'
    };
    t.wizNextTo = function (n) { return 'Avanti: ' + n + ' →'; };
    t.wizStep = function (n, m) { return 'Passaggio ' + n + ' di ' + m; };
    t.wizClose = 'Chiudi la procedura guidata';
    t.wizBack = 'Indietro';
    t.wizNext = 'Avanti';
    t.wizFinish = 'Applica e termina';
    t.wizSafe = 'Non cambia nulla sul firewall prima dell’ultimo passaggio. Solo la lingua, la pagina dopo l’accesso e le notifiche vengono salvate appena si modificano.';
    t.wizNoNet = 'Scegliere almeno una rete.';
    t.wizScan = 'Se prima si è configurato qualcosa in OPNsense, si può vedere come il pannello lo interpreta.';
    t.wizRecommended = 'Consigliato';
    t.wizIps = 'La protezione dagli attacchi (Suricata) richiede più memoria; si può attivare in seguito in Sicurezza › Protezione attacchi.';
    t.wizApprSub = 'Se attivo, un nuovo dispositivo non raggiunge né Internet né altre reti finché non viene fatto entrare.';
    t.wizApprNote = 'I dispositivi su queste reti ora risultano approvati, così nessuno viene escluso. Per far entrare nuovi dispositivi dal telefono, usare le notifiche Telegram, la VPN e «Apri Inversa Panel dopo l’accesso».';
    t.wizNone = 'Nessuna';
    t.wizDoneNote = 'Dopo l’applicazione si può cambiare tutto nelle pagine del menu. La procedura guidata può essere rieseguita da Impostazioni.';
    t.wizStart = 'Avvia la procedura guidata di configurazione';
    t.wizAgain = 'Procedura guidata di configurazione';
    t.wizAgainSub = 'Configurare di nuovo reti, protezioni, approvazione dei nuovi dispositivi e notifiche, passo dopo passo.';
    t.wizAgainBtn = 'Avvia la procedura guidata';
    t.wanSpeedBtn = 'Test di velocità';
    t.wanSpeeding = 'Misurazione… (15 s)';
    t.wanUp = 'Upload';
    t.wanPing = 'Latenza';
    t.wanSpeedFailed = 'Impossibile misurare la velocità.';
    t.wanSpeedLimited = function (m) { return 'Il server di misura rifiuta test ripetuti di seguito per un po’. Riprovare tra circa ' + m + ' minuti.'; };
    t.pfTargetHint = 'Scegliere dall’elenco o digitare un indirizzo IP.';
})(window.InversaPanelI18n.it);

/* device identity watch (1.7.0) */
(function (t) {
    t.ov.evId = 'Identità del dispositivo cambiata';
    t.ov.evIdHeld = 'Identità del dispositivo cambiata, approvazione revocata';
    t.idwLabel = 'Controllo dell’identità dei dispositivi';
    t.idwSub = 'Un indirizzo MAC si può copiare, il modo in cui un dispositivo chiede il proprio indirizzo IP quasi mai. Riceve un avviso quando un dispositivo approvato sembra un altro tipo di dispositivo, quando due dispositivi usano lo stesso indirizzo contemporaneamente o quando all’improvviso imposta da solo il proprio IP. Rende visibile una copia, ma non la impedisce: la copia di un dispositivo dello stesso tipo (iPhone di un iPhone) può passare inosservata. Funziona solo con il server DHCP dnsmasq di OPNsense.';
    t.idwModes = { off: 'Disattivato', tell: 'Avvisami', hold: 'Revoca l’approvazione' };
    t.idwConflict = function (f) { return 'In dnsmasq è già configurato un altro script dei lease (' + f + '). dnsmasq ne accetta uno solo, quindi il pannello lo lascia com’è e il controllo non funziona.'; };
    t.idwNoDnsmasq = 'Questo OPNsense non ha una cartella per le estensioni di dnsmasq; il controllo non funziona.';
    t.idwKinds = { apple: 'Dispositivo Apple', windows: 'Windows', android: 'Android', linux: 'Linux', other: 'Tipo sconosciuto' };
    t.idwKnown = 'Identità nota';
    t.idwBadge = 'Identità cambiata';
    t.idwWhy = { fp: 'Ha chiesto il proprio indirizzo IP come un altro tipo di dispositivo.', both: 'Due dispositivi diversi usano questo indirizzo MAC.', name: 'Ha indicato un altro nome.', manual: 'Ha impostato da solo il proprio indirizzo IP invece di chiederlo.' };
    t.idwSeen = function (k, n) { return 'Visto per ultimo: ' + k + (n ? ' · ' + n : '') + '.'; };
    t.idwWhen = function (a) { return '(' + a + ')'; };
    t.idwAccept = 'È mio, accetta';
    t.idwAccepted = 'La nuova identità è stata accettata per questo dispositivo.';
    t.qIdTitle = function (n) { return n === 1 ? 'L’identità di 1 dispositivo è cambiata' : 'L’identità di ' + n + ' dispositivi è cambiata'; };
    t.qIdHint = 'Il suo indirizzo MAC potrebbe essere stato copiato. Accettalo se è tuo, altrimenti respingilo.';
    t.news['1.7.0'] = [['Controllo dell’identità dei dispositivi: un dispositivo con indirizzo MAC copiato viene notato; ricevi un avviso o la sua approvazione viene revocata (Impostazioni, disattivato per impostazione predefinita).', 'settings']];
})(window.InversaPanelI18n.it);
