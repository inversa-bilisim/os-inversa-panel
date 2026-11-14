/*
 * SPDX-License-Identifier: BSD-2-Clause
 * Copyright (C) 2026 Inversa Bilişim
 *
 * Spanish.
 */
window.InversaPanelI18n = window.InversaPanelI18n || {};
window.InversaPanelI18n.es = {
    langName: 'Español',
    locale: 'es-ES',
    ov: {
        yesterday: 'ayer', now: 'ahora', show: 'Mostrar', none: 'Ninguno', connected: 'Conectado', noConn: 'Sin conexión', noAnswer: 'sin respuesta', pct: function (n) { return n + ' %'; },
        minAgo: function (n) { return 'hace ' + n + ' min'; },
        durDH: function (d, h) { return d + (d === 1 ? ' día' : ' días') + (h ? ' ' + h + ' h' : ''); },
        durHM: function (h, m) { return h + ' h' + (m ? ' ' + m + ' min' : ''); },
        durM: function (m) { return m < 1 ? 'menos de un minuto' : m + ' min'; },
        todoTitle: function (n) { return n === 1 ? '1 asunto requiere su atención' : n + ' asuntos requieren su atención'; },
        todoOff: 'Inversa Panel está desactivado; no hay nada protegido', todoWan: 'Sin conexión a internet',
        todoWait: function (n) { return n === 1 ? '1 dispositivo nuevo espera aprobación' : n + ' dispositivos nuevos esperan aprobación'; },
        todoVpn: function (name) { return 'La conexión VPN «' + name + '» está caída'; },
        todoIps: 'La protección contra ataques está activada, pero no funciona',
        wanUpShort: 'internet conectado', lastAlert: function (w) { return 'última alerta de ataque: ' + w; },
        chkInternet: 'Internet', chkGeo: 'Bloqueo por países', chkUpdate: 'Actualización',
        notRunning: 'Detenido', ipsBlocking: 'Bloqueando', ipsWatching: 'Avisando',
        geoAllow: function (n) { return n === 1 ? '1 país permitido' : n + ' países permitidos'; }, geoBlock: function (n) { return n === 1 ? '1 país bloqueado' : n + ' países bloqueados'; },
        vpnUp: function (a, b) { return a + ' / ' + b + ' conectadas'; },
        updReady: function (v) { return v + ' disponible'; }, updPending: 'Actualización disponible', upToDate: 'Al día',
        waiting: function (n) { return n === 1 ? '1 pendiente de aprobación' : n + ' pendientes de aprobación'; },
        kpiBlocked: 'Solicitudes DNS bloqueadas · hoy', noQueries: 'Hoy aún no hay solicitudes',
        kpiAlerts: 'Alertas de ataque · hoy', ipsOff: 'La protección contra ataques está desactivada', noAlerts: 'Hoy no hay alertas',
        allBlocked: 'Todas bloqueadas', someBlocked: function (n) { return n === 1 ? '1 bloqueada' : n + ' bloqueadas'; }, lastAt: function (w) { return 'última: ' + w; },
        kpiSpeed: 'Velocidad ahora', kpiUsage: 'Datos usados · hoy', since: function (w) { return 'desde ' + w; }, usageSoon: 'El registro empieza en menos de un minuto',
        gateway: 'Puerta de enlace', latency: 'Retardo de internet', dnsTime: 'Consulta de nombres', upSince: 'Conectado desde hace',
        netsSub: 'Dispositivos · Mbit/s ahora', isolated: 'aislada', devs: function (n) { return n === 1 ? '1 dispositivo' : n + ' dispositivos'; },
        peers: function (a, b) { return a + ' / ' + b + ' dispositivos conectados'; }, vpnNone: 'No hay ninguna conexión VPN configurada.',
        blockedTitle: 'Solicitudes bloqueadas', blockedSub: 'Últimas 24 horas · por hora', reqs: function (n) { return n === 1 ? '1 solicitud' : n + ' solicitudes'; },
        evTitle: 'Eventos recientes', evNone: 'Aún no hay nada registrado.', times: function (n) { return n === 1 ? '1 vez' : n + ' veces'; },
        evAttackBlocked: 'Ataque bloqueado', evAttack: 'Alerta de ataque', evWait: 'Dispositivo nuevo a la espera de aprobación', evNew: 'Nuevo dispositivo en la red', evPeer: 'Dispositivo VPN conectado',
        evVpnUp: 'Conexión VPN establecida', evVpnDown: 'Conexión VPN perdida', evWanUp: 'La conexión a internet ha vuelto', evWanDown: 'Conexión a internet perdida',
        evSchedOn: 'Horario iniciado', evSchedOff: 'Horario finalizado', evLists: 'Listas de bloqueo actualizadas', evBoot: 'Cortafuegos reiniciado', evDisk: 'El disco del cortafuegos se está llenando', evTemp: 'El cortafuegos se calienta', evUpdate: 'Hay una actualización de OPNsense pendiente',
        todoDisk: function (n) { return 'El disco del cortafuegos está al ' + n + ' %'; }, todoTemp: function (n) { return 'El cortafuegos se calienta: ' + n + ' °C'; },
        sysTitle: 'Sistema', upFor: function (s) { return 'en marcha desde hace ' + s; }, cpu: 'Procesador', memory: 'Memoria', disk: 'Disco', temp: 'Temperatura',
        version: 'Versión', cfgChanged: 'Último cambio de configuración'
    },
    appSub: 'Tan sencillo como un módem, tan potente como OPNsense',
    tabLogs: 'Registros',
    lgCount: function (n) { return n === 1 ? '1 registro' : n + ' registros'; }, lgCsv: 'Descargar CSV', lgFailed: 'No se han podido leer los registros.', lgMore: 'Registros anteriores',
    lgShown: function (n, all) { return n + ' de ' + all + ' registros'; },
    lgTime: 'Hora', lgWho: 'Quién', lgWhere: 'Adónde', lgWhat: 'Qué ha pasado', lgSource: 'Origen', lgResult: 'Resultado', lgPeriod: 'Periodo',
    lgToday: 'Últimas 24 horas', lgDays: function (n) { return n === 1 ? '1 día' : n + ' días'; }, lgTimes: function (n) { return n === 1 ? '1 vez en esta hora' : n + ' veces en esta hora'; },
    lgAttacksTitle: 'Ataques', lgAttacksSub: 'Intentos contra su red desde el exterior: alertas de la protección contra ataques, lo que han detenido las reglas por países y las conexiones que el cortafuegos ha rechazado. Se conservan 30 días.',
    lgAttacksSearch: 'Buscar dirección, país, dispositivo o puerto', lgAttacksNone: 'No hay registros en este periodo.',
    lgTopSrc: 'Direcciones más activas', lgTopCc: 'Países', lgTopTarget: 'Más atacados',
    lgIps: 'Rastro de un ataque', lgIpsOut: 'Un dispositivo ha intentado llegar a una dirección maliciosa conocida', lgGeo: 'Intento de conexión desde un país no permitido',
    lgBlockedAddr: 'Intento de conexión desde una dirección que usted ha bloqueado', lgFw: 'Intento de conexión a un puerto cerrado',
    lgSrcGeo: 'Reglas por países', lgSrcFw: 'Cortafuegos', lgFirewall: 'El cortafuegos',
    lgBlocked: 'Bloqueado', lgAlertOnly: 'Solo aviso', lgAllowed: 'Permitido', lgBlock: 'Bloquear', lgAllow: 'Permitir', lgIsBlocked: 'Bloqueada', lgInList: 'En la lista',
    lgBlockedList: 'Direcciones bloqueadas', lgUnblock: function (ip) { return 'Desbloquear ' + ip; },
    lgNowBlocked: function (ip) { return ip + ' está bloqueada.'; }, lgUnblocked: function (ip) { return ip + ' ya no está bloqueada.'; },
    lgHistoryTitle: 'Historial de internet', lgHistorySub: 'Qué dispositivo ha visitado qué sitio y qué se ha bloqueado. Solo se ve el nombre de dominio, nunca el contenido ni la dirección completa de una página.',
    lgHistoryKeep: 'Mostrar el historial de internet', lgHistoryKeepSub: 'Desactivado: esta página no muestra los sitios de ningún dispositivo. Los registros se leen de las estadísticas DNS de OPNsense; OPNsense conserva los últimos 7 días.',
    lgNetworks: 'Redes', lgNoStats: 'El historial de internet se lee de las estadísticas DNS, que están desactivadas. Puede activarlas en Ajustes.',
    lgHistoryOff: 'El historial de internet está desactivado.', lgHistoryNoNet: 'Elija al menos una red para ver su historial.', lgHistoryNone: 'No hay registros en este periodo.',
    lgHistorySearch: 'Buscar dispositivo o dominio', lgLastHour: 'Última hora', lgLast24: 'Últimas 24 horas', lgDomain: 'Dominio',
    lgEventsTitle: 'Accesos y cambios', lgEventsSub: 'Quién se ha conectado, quién ha iniciado sesión y qué ajuste ha cambiado. Se conservan 90 días.',
    lgEventsSearch: 'Buscar persona, dispositivo o ajuste', lgEventsNone: 'No hay registros en este periodo.', lgEvent: 'Evento', lgWhoWhat: 'Quién / qué', lgDetail: 'Detalle', lgType: 'Tipo',
    lgTypeLogin: 'Acceso al panel', lgTypeConfig: 'Cambio de ajustes', lgSystem: 'Sistema',
    lgLogin: 'Inicio de sesión en el panel', lgLoginOk: 'Correcto', lgLoginTry: 'Intento de acceso', lgLoginBad: 'Contraseña incorrecta', lgConfig: 'Ajuste cambiado',
    pgRange: function (a, b, n) { return a + '–' + b + ' de ' + n; }, pgSize: 'Por página', pgPrev: 'Página anterior', pgNext: 'Página siguiente', pgPages: 'Páginas', pgPage: function (n) { return 'Página ' + n; },
    tabBackup: 'Copia de seguridad', logout: 'Cerrar sesión', tabNotify: 'Notificaciones',
    tabScan: 'Ajustes existentes', scanOpen: 'Abrir la página', scanAdopt: 'Asumir', welcomeScan: 'Revisar los ajustes existentes',
    tabAbout: 'Acerca de', aboutSub: 'La versión instalada, quién lo desarrolla, adónde dirigirse y el software en el que se basa el panel.',
    aboutVersion: 'Versión', aboutRunsOn: 'Funciona sobre', aboutLicense: 'Licencia', aboutSource: 'Código fuente',
    aboutCompany: [
        'Inversa Panel es un complemento de código abierto de Inversa Bilişim para gestionar desde una sola pantalla los ajustes más usados de OPNsense.',
        'Nuestro objetivo es un cortafuegos potente que puedan usar con facilidad personas que no son especialistas en redes. Los dispositivos, el filtro de internet, la VPN, la protección contra ataques y los registros se reúnen en una pantalla sencilla, sin tener que orientarse por los menús de OPNsense para las tareas de cada día.',
        'El panel trabaja con los ajustes propios de OPNsense: lee lo que hay y solo actualiza lo que usted cambia. Puede volver a las páginas de OPNsense en cualquier momento.',
        'Sus sugerencias y avisos de errores nos ayudan a mejorar el panel; puede escribirnos a las direcciones de esta página.'
    ],
    aboutWeb: 'Sitio web', aboutMail: 'Correo', aboutIssues: 'Errores y peticiones', aboutIssuesLink: 'Informar en GitHub',
    aboutSupport: 'Información de soporte', aboutSupportSub: 'Envíe este resumen cuando pida ayuda. No contiene contraseñas, claves ni direcciones de dispositivos.',
    aboutCopy: 'Copiar información de soporte', aboutCopied: 'Copiado',
    aboutBuiltOn: 'Basado en', aboutBuiltOnSub: 'Inversa Panel reúne lo que ofrecen estos proyectos de código abierto.',
    aboutOpnsense: 'El cortafuegos en sí', aboutUnbound: 'Resolución y bloqueo DNS', aboutSuricata: 'Protección contra ataques',
    aboutWireguard: 'VPN', aboutStrongswan: 'VPN IPsec', aboutDbip: 'Datos de países · IP Geolocation by DB-IP',
    tabDash: 'Resumen', tabDevices: 'Dispositivos', tabSecurity: 'Seguridad', tabSettings: 'Ajustes',
    subFilter: 'Categorías y aplicaciones', subLists: 'Lista de permitidos / bloqueados', subtabsAria: 'Páginas de esta sección',
    protOn: 'Protección activada', protPartial: 'Protección parcial', protOff: 'Inversa Panel desactivado',
    protWhyTitle: 'Protecciones desactivadas:', protWhyOk: 'El bloqueo de anuncios y de sitios maliciosos está activado.',
    protWhyOff: 'Inversa Panel está desactivado, así que no se aplica ninguna protección.',
    protGoFilter: 'Haga clic para activarlas (Seguridad).', protGoSettings: 'Haga clic para activarlo (Ajustes).',
    statusWhy: function (list) { return 'Desactivado: ' + list.join(', '); },
    pending: function (n) { return n === 1 ? '1 cambio sin guardar' : n + ' cambios sin guardar'; },
    pendingHint: 'Los cambios se escriben en el cortafuegos al pulsar «Aplicar».',
    apply: 'Aplicar', applying: 'Aplicando…', discard: 'Descartar',
    showChanges: 'Ver cambios', hideChanges: 'Ocultar', changesTitle: 'Cambios sin guardar', undo: 'Deshacer',
    applied: 'Cambios aplicados. Las reglas del cortafuegos se han actualizado; el bloqueo DNS se está renovando en segundo plano y tendrá efecto en 1-2 minutos.',
    applyFailed: 'No se han podido aplicar los cambios:',
    validationFailed: 'Algunos valores no son válidos:',
    loadFailed: 'No se han podido cargar los datos de Inversa Panel. Vuelva a cargar la página.',
    welcomeTitle: 'Bienvenido a Inversa Panel',
    welcomeText: 'Su configuración actual de OPNsense se conserva; Inversa Panel no activa nada hasta que usted lo cambie. ¿Activar la protección recomendada (anuncios y sitios maliciosos)?',
    welcomeYes: 'Activar la recomendada', welcomeNo: 'Ahora no',
    statusOk: 'Su red está protegida', statusWarn: 'Algunas protecciones están desactivadas', statusOff: 'Inversa Panel está desactivado',
    statusLine: function (online, total) {
        return (online === 1 ? '1 dispositivo en línea' : online + ' dispositivos en línea') + ' · ' + (total === 1 ? '1 dispositivo conocido' : total + ' dispositivos conocidos');
    },
    dnsFilter: 'Filtro DNS', active: 'Activo', inactive: 'Inactivo',
    kpiOnline: 'Dispositivos en línea', kpiOnlineSub: function (n) { return n === 1 ? 'de 1 dispositivo conocido' : 'de ' + n + ' dispositivos conocidos'; },
    kpiBlocked: 'Solicitudes DNS bloqueadas', kpiBlockedSub: function (p) { return p + ' % de todas las solicitudes'; },
    kpiNoStats: 'Estadísticas desactivadas',
    kpiDown: 'Descarga ahora', kpiUp: 'Subida ahora', kpiRateSub: 'Conexión a internet (WAN)',
    chartTitle: 'Tráfico de internet', chartSub: function (m) { return m === 1 ? 'Último minuto · WAN' : 'Últimos ' + m + ' minutos · WAN'; },
    legendDown: 'Descarga', legendUp: 'Subida', chartWaiting: 'Recogiendo datos…',
    topDevTitle: 'Dispositivos más activos', topDevSub: 'Conexiones abiertas', conns: function (n) { return n === 1 ? '1 conexión' : n + ' conexiones'; },
    topBlockedTitle: 'Dominios más bloqueados', noBlocked: 'Aún no hay solicitudes bloqueadas.', customList: 'Aplicación / lista propia',
    statsOff: 'Las estadísticas DNS están desactivadas. Puede activarlas en Ajustes.',
    quickTitle: 'Protección rápida', quickSub: 'Activar o desactivar con un clic', editAll: 'Todos los ajustes de bloqueo', allDevices: 'Todos los dispositivos',
    on: 'Activo', off: 'Inactivo',
    devTitle: 'Dispositivos',
    devSub: 'Dispositivos vistos en las redes protegidas. Haga clic en el nombre de un dispositivo para editarlo. Un dispositivo con internet cortado sigue llegando al cortafuegos (DNS, DHCP).',
    search: 'Buscar nombre, red, IP o MAC', fAll: 'Todos', fOnline: 'En línea', fBlocked: 'Internet cortado', fWaiting: 'Pendientes de aprobación',
    fShown: function (n, all) { return n === all ? (all === 1 ? '1 dispositivo' : all + ' dispositivos') : n + ' de ' + all + ' dispositivos'; }, fReset: 'Quitar filtros', fNetworkShow: 'Mostrar los dispositivos de esta red',
    sortHint: 'Haga clic para ordenar',
    colDevice: 'Dispositivo', colNetwork: 'Red', colIp: 'Dirección IP', colMac: 'Dirección MAC', colSeen: 'Estado', colConns: 'Conexiones', colNet: 'Internet',
    online: 'En línea', offline: 'Sin conexión',
    justNow: 'ahora mismo',
    agoMin: function (n) { return 'hace ' + n + ' min'; },
    agoHour: function (n) { return 'hace ' + n + ' h'; },
    agoDay: function (n) { return n === 1 ? 'hace 1 día' : 'hace ' + n + ' días'; },
    netOn: 'Activo', netOff: 'Cortado', unnamed: 'Dispositivo sin nombre', unknownVendor: 'Fabricante desconocido',
    cutAria: function (n) { return 'Activar o cortar internet para ' + n; },
    editAria: function (n) { return 'Editar ' + n; },
    noResult: 'Ningún dispositivo coincide.', noDevicesYet: 'Aún no se ha visto ningún dispositivo.', noActive: 'Ningún dispositivo tiene conexiones abiertas ahora mismo.', close: 'Cerrar',
    discoveryHint: 'Consejo: para una lista de dispositivos más precisa, active la detección de equipos (Hostwatch) en Interfaces › Neighbors › Discovery Settings.',
    dName: 'Nombre del dispositivo', dType: 'Tipo de dispositivo', dVendor: 'Fabricante', dMac: 'Dirección MAC', dNetwork: 'Red', dIps: 'Direcciones IP',
    dHostname: 'Nombre DHCP', dFirst: 'Visto por primera vez', dLast: 'Visto por última vez',
    dFixedIp: 'Dirección IP fija', dFixedShort: 'fija', dIpAuto: 'Automática (DHCP)', dIpPin: 'Mantener esta IP', dIpClear: 'Volver a automática',
    dIpPinHint: 'El dispositivo recibe siempre su dirección actual.',
    dIpHint: function (net, from, to) { return 'Red ' + net + ' · rango automático ' + from + ' – ' + to + '. Se recomienda elegir una dirección fija fuera de ese rango.'; },
    dIpInRange: function (from, to) { return 'Esta dirección está dentro del rango automático (' + from + ' – ' + to + '). Funciona, pero es más ordenado usar una dirección fuera del rango.'; },
    dIpAutoHint: 'Déjelo vacío para que el dispositivo obtenga su dirección por DHCP automáticamente.',
    dIpInvalid: 'Introduzca una dirección IPv4 válida (p. ej. 192.168.1.50).', dIpNoNet: 'Esta dirección no está dentro de ninguna red atendida por DHCP.',
    dManualShort: 'manual',
    dIpManual: function (ip) { return 'Este dispositivo ha fijado su dirección por sí mismo (' + ip + '). La dirección indicada aquí tendrá efecto cuando el dispositivo se ponga en automático (DHCP).'; },
    dIpManualPool: function (from, to) { return 'Esta dirección está dentro del rango de asignación automática (' + from + ' – ' + to + '): la misma dirección podría darse a otro dispositivo. «Mantener esta IP» la reserva para este dispositivo.'; },
    dIpRenew: 'Después de aplicar, el dispositivo recibe la nueva dirección la próxima vez que se conecte (basta con apagar y encender el Wi-Fi).',
    dNet: 'Acceso a internet', dNetSub: 'Si está desactivado, el dispositivo no puede acceder a internet.',
    dApproval: 'Aprobación en la red', dApprovalSub: 'Esta red pide aprobación para los dispositivos nuevos. Si está desactivada, el dispositivo no puede acceder a internet ni a otras redes.',
    apprWaiting: 'Pendiente de aprobación', apprApproved: 'Aprobado', apprApprove: 'Aprobar',
    apprApproveAria: function (n) { return 'Aprobar ' + n; },
    apprPanel: 'Este dispositivo está pendiente de aprobación: no puede acceder a internet ni a otras redes.',
    apprBanner: function (n) { return n === 1 ? '1 dispositivo nuevo espera aprobación' : n + ' dispositivos nuevos esperan aprobación'; },
    apprBannerSub: 'Hasta que se aprueben no pueden acceder a internet ni a otras redes. Apruebe los dispositivos que conozca y pulse «Aplicar».',
    apprShow: 'Ver dispositivos',
    apprAuto: function (n) { return 'La aprobación de dispositivos nuevos está activada: ' + (n === 1 ? 'el dispositivo visto hasta ahora cuenta como aprobado' : 'los ' + n + ' dispositivos vistos hasta ahora cuentan como aprobados') + '. Los dispositivos que se conecten a partir de ahora esperarán aprobación.'; },
    apprCard: 'Aprobación de dispositivos nuevos',
    types: { phone: 'Teléfono', tablet: 'Tableta', laptop: 'Ordenador', tv: 'Televisor', console: 'Videoconsola', printer: 'Impresora', iot: 'Hogar inteligente', server: 'Servidor / NAS', unknown: 'Otro' },
    filtTitle: 'Categorías y aplicaciones',
    filtSub: 'Las reglas se aplican a todos los dispositivos que usan el cortafuegos como servidor DNS.',
    catTitle: 'Categorías', appsTitle: 'Aplicaciones', appsSub: 'Los dominios de las aplicaciones seleccionadas (incluidos los subdominios) se bloquean mediante DNS.',
    blocked: 'Bloqueado', allowed: 'Permitido',
    listsTitle: 'Lista de permitidos y lista de bloqueados', listsSub: 'Dominios que siempre se permiten o siempre se bloquean, digan lo que digan las categorías.',
    allowTitle: 'Lista de permitidos', allowDesc: 'Estos dominios se permiten siempre, aunque figuren en una lista de categorías.',
    denyTitle: 'Lista de bloqueados', denyDesc: 'Estos dominios y sus subdominios se bloquean siempre.',
    listEmpty: 'Aún no se ha añadido ningún dominio.',
    add: 'Añadir', removeAria: function (d) { return 'Quitar ' + d; }, invalidDomain: 'Introduzca un dominio válido (p. ej. example.com).',
    warnDns: 'El forzado de DNS está desactivado. Los dispositivos pueden saltarse el bloqueo usando otro servidor DNS.',
    cats: {
        ads: ['Anuncios y rastreadores', 'Bloquea los anuncios y el código de rastreo de sitios web y aplicaciones.', 'Fuente: hagezi Multi NORMAL'],
        malware: ['Malware y phishing', 'Bloquea sitios conocidos por ser maliciosos, fraudulentos o de phishing.', 'Fuente: hagezi Threat Intelligence Feeds'],
        adult: ['Contenido para adultos', 'Bloquea los sitios web para adultos.', 'Fuente: OISD NSFW'],
        gambling: ['Juegos de azar', 'Bloquea los sitios de apuestas y juegos de azar.', 'Fuente: hagezi Gambling'],
        bypass: ['VPN, proxy y DNS cifrado', 'Bloquea los servicios que se usan para saltarse el bloqueo.', 'Fuente: hagezi DoH/VPN/TOR/Proxy'],
        safesearch: ['Forzar SafeSearch', 'Activa el modo restringido en Google, Bing y YouTube.', 'Unbound SafeSearch'],
        forcedns: ['Forzar DNS', 'Redirige al cortafuegos todas las consultas DNS de los dispositivos.', 'Regla NAT automática']
    },
    tabNet: 'Red e Internet', tabSched: 'Horarios', tabPf: 'Redirección de puertos', tabVpn: 'VPN', tabGeo: 'Países',
    internet: 'Internet', readonly: 'Solo lectura', linkDown: 'Sin cable', colName: 'Nombre',
    days: ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'],
    schTitle: 'Horarios', schSub: 'Corte internet o bloquee aplicaciones a los dispositivos elegidos en ciertos días y horas. Se comprueba cada minuto.',
    schNew: 'Nuevo horario', schNewName: 'Nuevo horario', schName: 'Nombre del horario', schDelete: 'Eliminar horario',
    schDevices: 'Dispositivos', schDays: 'Días', schFrom: 'Inicio', schTo: 'Fin', schAction: '¿Qué debe ocurrir?',
    actCut: 'Cortar internet', actApps: 'Bloquear aplicaciones', schApps: 'Aplicaciones a bloquear', schWeek: 'Vista semanal',
    schEmpty: 'Aún no hay horarios.', schEvery: 'Todos los días', schWeekdays: 'Días laborables', schWeekend: 'Fin de semana', schNoDays: 'Ningún día seleccionado',
    schDevCount: function (n) { return n === 1 ? '1 dispositivo' : n + ' dispositivos'; },
    subWan: 'Conexión a internet', subNets: 'Redes locales', subPorts: 'Puertos físicos',
    wanSub: 'Cómo se conecta el cortafuegos a internet. Se leen los ajustes existentes de OPNsense; solo se actualiza lo que usted cambia.',
    netsSub: 'Sus redes internas (casa, IoT, invitados...) y adónde pueden llegar. Se leen los ajustes existentes de OPNsense; solo se actualiza lo que usted cambia.',
    wanMissing: 'No hay ninguna interfaz WAN configurada en este sistema.', wanConnected: 'Conectado a internet', wanDown: 'Sin dirección de internet',
    wanVia: { dhcp: 'A través de un módem (DHCP)', pppoe: 'Fibra / VDSL · PPPoE', 'static': 'IP estática', other: 'Otro' },
    wanTest: 'Probar conexión', wanTesting: 'Probando…', chkGateway: 'Puerta de enlace', chkInternet: 'Internet', chkDns: 'Resolución de nombres (DNS)',
    wanMulti: 'Este sistema tiene más de una conexión a internet (multi-WAN). Para evitar confusiones, los ajustes de conexión solo pueden cambiarse en los menús de OPNsense.',
    wanComplex: 'Su conexión a internet es de un tipo que Inversa Panel no admite; cámbiela en los menús de OPNsense.',
    wanPortShort: 'Puerto', wanLinkUp: 'cable conectado', wanIp: 'Dirección IP', wanTestTitle: 'Prueba de conexión', wanRetest: 'Probar de nuevo',
    wanExt: 'IP externa', wanExtBtn: 'Mostrar IP externa', wanExtFailed: 'no se ha podido averiguar',
    wanExtNote: 'La IP externa se averigua cuando se pulsa el botón: el cortafuegos se la pregunta a Cloudflare (1.1.1.1).',
    wanAdvTitle: 'Avanzado', wanAdv: 'Avanzado: dirección MAC, MTU', wanAuto: 'automático',
    wanMac: 'Dirección MAC', wanMacSub: 'Si su proveedor ha ligado la línea a la dirección MAC del módem, introduzca esa dirección. Vacío: la dirección propia del puerto.',
    wanMtuSub: 'Déjelo vacío salvo que su proveedor le haya indicado otro valor.',
    wanMtuPppoe: 'Vacío: 1492. Si algunos sitios no se abren, pruebe un valor más bajo (p. ej. 1452).',
    wanType: 'Tipo de conexión', wanSettings: function (type) { return type + ' · ajustes'; },
    wt: {
        dhcp: ['Detrás de un módem / router', 'OPNsense obtiene su dirección del módem automáticamente.'],
        pppoe: ['Fibra o VDSL (PPPoE)', 'Módem en modo puente o terminal de fibra (ONT); OPNsense hace el trabajo del módem.'],
        'static': ['IP estática', 'Si su proveedor le ha dado una dirección IP fija.']
    },
    pppUser: 'Usuario PPPoE', pppPass: 'Contraseña PPPoE', pppKeep: 'Escriba para cambiarla',
    pppoeHint: 'Pida a su proveedor de internet el usuario, la contraseña y el número de VLAN.',
    stIp: 'Dirección IP / prefijo', stGw: 'Puerta de enlace',
    dhcpWarn: 'Si el módem también hace de router, tendrá «doble NAT»; los juegos y la redirección de puertos pueden dar problemas. Si es posible, ponga el módem en modo puente.',
    wanPort: 'Puerto de internet', wanPortSub: 'El puerto al que está conectado el cable de internet.',
    vlanReq: 'Usar etiqueta VLAN', vlanReqSub: 'En muchas líneas de fibra el tráfico de internet llega con un número de VLAN concreto.', vlanId: 'Número de VLAN',
    ipv6Sub: 'Se obtiene automáticamente si su proveedor ofrece IPv6.', v6Auto: 'Automático', v6Off: 'Desactivado',
    netSafety: 'Si no confirma en los 90 segundos siguientes a aplicar, se restauran automáticamente los ajustes anteriores.',
    netApply: 'Aplicar ajustes de red', netCreate: 'Crear red',
    netConfirmTitle: 'Los nuevos ajustes están activos y esperan su confirmación.', netConfirmText: 'Si esta página sigue funcionando, su conexión funciona. Sin confirmación se restauran automáticamente los ajustes anteriores.',
    netConfirmBtn: 'Funciona, mantener', netConfirmed: 'Los ajustes han quedado guardados de forma permanente.',
    netReverted: 'No se ha recibido confirmación: se están restaurando los ajustes anteriores. La página se recargará en breve.',
    confirmFirst: 'Confirme primero el cambio que está en espera (o espere a que se deshaga) y después pulse «Aplicar» de nuevo.',
    netKinds: { home: 'Casa / local', iot: 'IoT / hogar inteligente', guest: 'Invitados', camera: 'Cámaras', server: 'Servidores' },
    netEdit: 'Editar', netLink: 'Conexión', untagged: 'sin etiqueta', netAddr: 'Dirección',
    edTitle: function (n) { return 'Editar la red ' + n; }, edType: 'Tipo de red', edTypeHint: 'El tipo de red y la aprobación de dispositivos nuevos se guardan con «Aplicar», en la parte superior de la página.',
    edApproval: 'Los dispositivos nuevos esperan aprobación',
    edApprovalSub: 'Un dispositivo que entra por primera vez en esta red, por Wi-Fi o por cable, no puede acceder a internet ni a otras redes hasta que usted lo apruebe en la pestaña Dispositivos.',
    edApprovalNote: 'Al activarlo, los dispositivos vistos hasta ahora cuentan como aprobados; solo tienen que esperar los que se conecten después. La aprobación se hace por dirección MAC. El tráfico entre dispositivos del mismo switch o Wi-Fi no pasa por el cortafuegos; para impedirlo también, active el «aislamiento de clientes» en su punto de acceso.',
    edApprovalNotProtected: 'Esta red no es una de las redes que protege Inversa Panel. Añádala primero en Ajustes › Redes protegidas.',
    netMain: 'Red principal', netDevCount: function (n) { return n === 1 ? '1 dispositivo conectado' : n + ' dispositivos conectados'; },
    isoRow: 'Otras redes', isoAlone: 'Aislada', isoWith: function (l) { return 'Aislada · se comunica con ' + l; },
    isoTitle: 'Aislar de las demás redes', isoSub: 'Esta red no puede comunicarse con las demás redes; internet sigue abierto.',
    isoReach: 'Redes con las que sigue comunicándose, en ambos sentidos:',
    limTitle: 'Límite de velocidad', limSub: 'Velocidad total de internet de esta red.', limDown: 'Descarga', limUp: 'Subida',
    edColor: 'Color', edColorN: function (n) { return 'Color ' + n; },
    edPort: 'Puerto:', edConnFixed: 'La forma de conexión de una red no puede cambiarse después de crearla.', edRange: 'Rango de direcciones',
    edApprovalShort: 'Un dispositivo que se conecta por primera vez no tiene internet hasta que usted lo aprueba.',
    vlanWifi: function (tag) { return 'Para el Wi-Fi, cree un nombre de red (SSID) aparte en su punto de acceso y asócielo al número de VLAN de esta red (' + tag + '). Su switch y su punto de acceso deben admitir VLAN.'; },
    edGw: 'Dirección de la puerta de enlace', edDhcp: 'Servidor DHCP', edDhcpSub: 'Activado: los dispositivos reciben una dirección IP automáticamente.', edDhcpOff: 'Desactivado: los dispositivos necesitan una dirección IP puesta a mano.',
    lanChangeWarn: 'Cambiar la dirección de la red a la que está conectado puede cortar su conexión; si no se confirma desde la nueva dirección, el cambio se deshace.',
    edDelete: 'Eliminar red', notCreated: 'Esta red no la ha creado Inversa Panel; elimínela en los menús de OPNsense.',
    edDeleteConfirm: function (n) { return '¿Eliminar la red ' + n + '? Sus dispositivos se desconectarán.'; },
    netAdd: 'Añadir red', netAddSub: 'Cree una red aparte para dispositivos del hogar inteligente, invitados, cámaras o servidores.',
    edDhcpFrom: 'Inicio del rango', edDhcpTo: 'Fin del rango', edLease: 'Concesión (horas)', edLeaseDefault: 'por defecto', edAuto: 'automático',
    edDhcpHint: 'Los dispositivos reciben direcciones automáticas de este rango; los campos vacíos usan el valor que aparece en gris. Asigne las direcciones fijas en la pestaña Dispositivos.',
    leaseShort: function (h) { return h + ' h'; },
    edName: 'Nombre de la red', edConn: 'Tipo de conexión', edVlanMode: 'VLAN', edPortMode: 'Puerto propio', edVlanId: 'N.º de VLAN',
    edParentFor: 'Puerto que lleva la VLAN:', edPortFor: 'Puerto libre que usará esta red:',
    vlanNote: 'Las VLAN necesitan un switch y un punto de acceso que las admitan.',
    accTitle: 'Acceso entre redes', accSub: '¿Puede la red de la fila iniciar una conexión hacia la de la columna? Haga clic en una celda para cambiarlo.',
    accFrom: 'Desde ↓  Hacia →', accState: { allow: 'Permitido', deny: 'Bloqueado', 'default': 'OPNsense' },
    accLegend: '«OPNsense»: Inversa Panel no interviene; se aplican sus reglas de cortafuegos existentes.',
    portsSubRo: 'Los puertos de red del cortafuegos y para qué se usa cada uno. Elija el puerto de internet en «Conexión a internet» y el puerto de una red al añadirla.',
    portWan: 'Internet (WAN)', portTrunkOnly: 'Solo VLAN', portUnused: 'Sin usar',
    pfTitle: 'Redirección de puertos', pfSub: 'Abra el acceso desde internet a un dispositivo de su red. La regla de cortafuegos necesaria se añade automáticamente y funciona al instante.',
    pfRdp: 'Escritorio remoto', pfCustom: 'Personalizado', pfNew: 'Nueva redirección', pfTarget: 'Dispositivo o IP de destino', pfTargetPh: 'Nombre del dispositivo o IP', pfNamePh: 'Según el puerto', pfTo: 'Destino',
    pfListHint: '¿No está en la lista? Siga escribiendo', pfCount: function (n) { return n === 1 ? '1 redirección' : n + ' redirecciones'; },
    pfPorts: { '443': 'Web (HTTPS)', '80': 'Web (HTTP)', '22': 'SSH', '3389': 'Escritorio remoto', '5900': 'VNC', '21': 'FTP', '25': 'Correo (SMTP)', '8080': 'Web (alternativo)', '8123': 'Home Assistant', '554': 'Cámara (RTSP)', '32400': 'Plex', '25565': 'Minecraft', '27015': 'Servidor de juegos Steam', '3074': 'Xbox Live', '1194': 'OpenVPN', '51820': 'WireGuard' },
    pfExt: 'Puerto externo', pfInt: 'Puerto interno', pfTargetIp: 'IP de destino', pfProto: 'Protocolo', pfAdd: 'Añadir redirección',
    pfImmediate: 'Las redirecciones de puertos tienen efecto de inmediato (no hace falta Aplicar).',
    pfRules: 'Redirecciones de puertos', pfWanIs: function (ip) { return 'Su IP externa: ' + ip; }, pfEmpty: 'Aún no hay redirecciones de puertos.',
    pfDelConfirm: '¿Eliminar esta redirección de puertos?',
    upnpTitle: 'Apertura automática de puertos (UPnP)', upnpDesc: 'Permite que dispositivos como las videoconsolas abran sus propios puertos; se gestiona en la página del complemento os-upnp.',
    upnpMissing: 'Complemento no instalado',
    vpnTitle: 'Conexiones VPN', vpnSub: 'Acceso remoto seguro a la red de su casa u oficina (WireGuard) y enlaces entre sedes (WireGuard, o IPsec con cortafuegos de otros fabricantes).',
    vpnUnavailable: 'WireGuard no está disponible en esta versión de OPNsense.',
    vpnNew: 'Nueva conexión VPN', vpnNone: 'Aún no hay conexiones VPN. Empiece con «Nueva conexión VPN».',
    vpnKindRemote: 'Acceso remoto', vpnKindRemoteDesc: 'Teléfonos y portátiles se conectan desde fuera. Código QR y archivo .conf para cada dispositivo.',
    vpnKindSite: 'Entre sedes', vpnKindSiteDesc: 'Enlace permanente con otro cortafuegos o sede; las redes de ambos lados se ven entre sí. WireGuard o IPsec.',
    vpnName: 'Nombre de la conexión', vpnPort: 'Puerto UDP', vpnCreate: 'Crear conexión', vpnDelete: 'Eliminar conexión',
    vpnDelConfirmConn: function (n) { return '¿Eliminar la conexión «' + n + '» y todos sus dispositivos?'; },
    vpnReach: 'Redes internas a las que puede llegar', vpnSiteShare: 'Nuestras redes compartidas con el otro lado',
    vpnAddr: 'Dirección de conexión', vpnEndpoint: 'Nombre de conexión (opcional)',
    vpnEndpointHint: 'Si su IP cambia, introduzca su nombre DynDNS. Si se deja vacío, se usa la dirección WAN.',
    vpnMode: '¿Qué tráfico debe pasar por la VPN?', modeFull: 'Todo el tráfico', modeFullDesc: 'Todo el internet del dispositivo pasa por aquí; el bloqueo de anuncios también se aplica fuera de casa.',
    modeSplit: 'Solo las redes seleccionadas', modeSplitDesc: 'Solo pasa por la VPN el tráfico hacia las redes internas que usted elija.',
    vpnModeHint: 'Después de cambiar el modo, vuelva a cargar la configuración (QR / .conf) en los dispositivos.',
    vpnTunnel: 'Bloque de IP de la VPN', vpnTunnelHint: 'Los dispositivos reciben direcciones de este bloque (p. ej. 10.70.0.0/24). Déjelo vacío para elegir uno libre; no debe solaparse con las redes internas ni con otras VPN.',
    vpnInternetOnly: 'Solo internet', vpnInternetOnlyHint: 'No hay ninguna red interna seleccionada: el dispositivo solo sale a internet, con la dirección IP pública de este sitio. No puede llegar a las redes internas ni al cortafuegos.',
    vpnFullEmptyHint: 'Si no selecciona ninguna red interna, el dispositivo solo tendrá acceso a internet.',
    vpnReaddressed: 'El bloque de IP de la VPN ha cambiado y los dispositivos tienen direcciones nuevas. Vuelva a cargar la configuración (QR / .conf) en los dispositivos.',
    vpnRemoteEndpoint: 'Dirección del otro lado', vpnRemoteNets: 'Redes del otro lado',
    vpnRemoteKey: 'Clave pública del otro lado (opcional)', vpnRemoteKeyPh: 'Déjelo vacío para que la genere Inversa Panel',
    vpnRemoteKeyHint: 'Si se deja vacío, se generan claves para el otro lado y se ofrece una configuración lista (QR / .conf).',
    vpnThisSide: 'Este lado (introduzca estos datos en el otro lado)', vpnOtherSide: 'Otro lado', vpnPubKey: 'Clave pública', vpnTunnelIp: 'Dirección de túnel',
    vpnWaitsForThem: 'Se muestra cuando el otro lado se conecta', vpnOtherConf: 'Configuración lista para el otro lado:',
    vpnDevCount: function (n) { return n === 1 ? '1 dispositivo' : n + ' dispositivos'; },
    vpnOthers: function (l) { return 'Existen otras configuraciones de WireGuard; Inversa Panel no las toca: ' + l; },
    vpnBehindModem: 'Si OPNsense está detrás de un módem, redirija en el módem hacia OPNsense el puerto UDP de cada conexión (para IPsec, UDP 500 y 4500).',
    vpnStepKind: 'Tipo', vpnStepSet: 'Ajustes', vpnBack: 'Atrás',
    vpnAdvRemote: 'Avanzado: puerto, bloque de IP, dirección de conexión', vpnAdvSite: 'Avanzado: puerto, bloque de IP, clave del otro lado', vpnAdvIpsec: 'Avanzado: clave compartida, dirección de este lado',
    vpnLiveCount: function (n) { return n === 1 ? '1 conectado' : n + ' conectados'; }, vpnNoLive: 'Ningún dispositivo conectado',
    vpnTraffic: 'Tráfico', vpnOurNets: 'Nuestras redes',
    wgSecret: 'El código QR y el archivo .conf contienen la clave privada del otro lado. Entréguelos solo al administrador del otro lado y por un canal seguro.',
    wgText: function (c) {
        return ['Conexión WireGuard: ' + c.name,
            'Estos valores se introducen en el dispositivo del OTRO LADO.', '',
            'Dirección de conexión (Endpoint)  : ' + c.address,
            'Clave pública de este cortafuegos : ' + c.pubkey,
            'Dirección de túnel de este lado   : ' + c.tunnel,
            'Redes permitidas (AllowedIPs)     : ' + [c.tunnel.split('/')[0] + '/32'].concat(c.networks).join(', '),
            'Redes del otro lado               : ' + c.remote_networks.join(', '),
            'Clave pública del otro lado       : ' + (c.remote_pubkey || '—')].join('\n');
    },
    /* IPsec site to site */
    ipcProto: 'Protocolo',
    ipcProtoWg: 'Cuando el otro lado también usa WireGuard (OPNsense, pfSense, MikroTik, Linux).',
    ipcProtoIpsec: 'Cuando el otro lado es un cortafuegos de otro fabricante (FortiGate, Sophos, Zyxel, Cisco, MikroTik…). IKEv2 con clave compartida.',
    ipcKey: 'Clave compartida', ipcKeyPh: 'Déjelo vacío e Inversa Panel creará una', ipcKeyKeep: 'Escriba para cambiarla',
    ipcKeyHint: 'Debe ser la misma en ambos lados. Al menos 12 caracteres: letras, cifras y . _ ~ ! @ # % ^ * + = : , -',
    ipcOurs: 'Dirección de este lado (opcional)',
    ipcOursHint: 'La IP fija o el nombre de equipo con el que el otro lado llega a este cortafuegos. Vacío: la dirección WAN. Este valor es también la identidad de este lado.',
    ipcHint: 'El cifrado es fijo (IKEv2, AES-256, SHA-256, grupo DH 14). Una vez creada la conexión, «Ajustes para el otro lado» enumera todo lo que hay que introducir en el otro dispositivo.',
    ipcThisSide: 'Este lado', ipcId: 'Identidad', ipcDown: 'Sin conexión',
    ipcSheetHint: 'Lo que hay que introducir en el otro dispositivo (dirección, clave, identidades, cifrado, redes):', ipcSheetBtn: 'Ajustes para el otro lado',
    ipcSheet: 'Ajustes que introducir en el otro lado', ipcDownload: 'Descargar como archivo de texto',
    ipcSecret: 'La lista contiene la clave compartida. Entréguela solo al administrador del otro lado y por un canal seguro.',
    ipcOthers: function (l) { return 'También hay otros túneles IPsec; Inversa Panel no los toca: ' + l; },
    ipcText: function (c) {
        return ['Conexión IPsec: ' + c.name.replace(/^inversapanel-?/, ''),
            'Estos valores se introducen en el dispositivo del OTRO LADO.', '',
            'Puerta de enlace remota (dirección de conexión) : ' + c.address,
            'Versión de IKE                                  : IKEv2',
            'Autenticación                                   : Clave precompartida (PSK)',
            'Clave precompartida                             : ' + c.psk,
            'ID local (de ese dispositivo)                   : ' + c.remote_id,
            'ID remoto (este cortafuegos)                    : ' + c.local_id,
            'Fase 1 (IKE)                                    : AES-256, SHA-256, grupo DH 14 (2048 bits)',
            'Fase 2 (ESP)                                    : AES-256, SHA-256, grupo PFS 14',
            'Redes locales (detrás de ese dispositivo)       : ' + c.remote_networks.join(', '),
            'Redes remotas (de este lado)                    : ' + c.networks.join(', '),
            'NAT traversal (NAT-T)                           : activado / automático',
            'Detección de par inactivo (DPD)                 : activada', '',
            'Con varias redes, defina una fase 2 por cada par de redes.',
            'Los tiempos de vida no tienen que ser iguales en ambos lados.'].join('\n');
    },
    vpnNoPeers: 'Aún no se ha añadido ningún dispositivo.', vpnAddPh: 'Nombre del dispositivo, p. ej. Mi teléfono', vpnAdd: 'Añadir dispositivo',
    vpnRemove: function (n) { return 'Eliminar ' + n; }, vpnDisabled: 'Desactivado', vpnNever: 'Nunca se ha conectado', vpnConnected: 'Conectado',
    vpnLast: function (m) {
        var d = Math.round(m / 1440);
        return m < 60 ? 'Visto por última vez hace ' + m + ' min' : (m < 1440 ? 'Visto por última vez hace ' + Math.round(m / 60) + ' h' : 'Visto por última vez hace ' + d + (d === 1 ? ' día' : ' días'));
    },
    vpnDelConfirm: '¿Eliminar este dispositivo? Ya no podrá conectarse.',
    vpnRenew: 'Nueva clave', vpnRenewHint: 'Este dispositivo se añadió con una versión anterior, por lo que su clave privada no se guardó. Se generará una clave nueva.',
    vpnRenewConfirm: '¿Generar una clave nueva para este dispositivo? La configuración antigua dejará de funcionar; cargue la nueva en el dispositivo.',
    vpnNoKey: 'La clave privada de este dispositivo no está guardada; renuévela con «Nueva clave».',
    copy: 'Copiar', save: 'Guardar',
    vpnAccCol: 'Acceso', vpnAccAll: 'Las redes de la conexión', vpnAccOnly: 'Solo', vpnAccOnlyThese: 'Solo estas direcciones', vpnAccEdit: 'Cambiar acceso',
    vpnAccOf: function (n) { return n + ' · ¿adónde puede llegar?'; }, vpnAccRemove: function (x) { return 'Quitar ' + x; },
    vpnAccCount: function (n) { return n === 1 ? '1 limitado' : n + ' limitados'; },
    vpnAccAllDesc: function (nets) { return 'Este dispositivo llega a todo lo que alcanza la conexión: ' + nets + '.'; },
    vpnAccIpPh: 'Elija un dispositivo o escriba una dirección, p. ej. 10.0.0.20', vpnAccPortPh: 'Puerto (todos)', vpnAccAdd: 'Añadir',
    vpnAccDns: 'Consulta de nombres (DNS)', vpnAccDnsSub: 'Activado: el dispositivo puede consultar nombres. Desactivado: solo se conecta por dirección IP.',
    vpnAccNote: 'Este dispositivo no llega a nada más que a las direcciones de arriba, y no tiene internet a través de esta conexión. La regla se aplica en el cortafuegos: se mantiene aunque se modifique el archivo .conf del dispositivo.',
    vpnAccBadIp: 'Introduzca una dirección IP válida, p. ej. 10.0.0.20.', vpnAccBadPort: 'El puerto debe estar entre 1 y 65535.', vpnAccNeedOne: 'Añada al menos una dirección a la que pueda llegar el dispositivo.',
    vpnAddrEdit: 'Cambiar dirección', vpnAddrOf: function (n) { return 'Dirección de ' + n; }, vpnAddrPh: 'IP (automática)',
    vpnAddrHint: function (net) { return 'Opcionalmente, una dirección dentro de ' + net + '; si se deja vacío, se usa la siguiente dirección libre.'; },
    vpnAddrChanged: 'La dirección ha cambiado. La configuración del dispositivo ya no funciona; vuelva a cargar en él este código QR o archivo .conf.',
    vpnAddrChangedNoKey: 'La dirección ha cambiado. Actualice la línea «Address» de la configuración del dispositivo.',
    qrTitle: function (n) { return 'Configurar ' + n; },
    qrStep1: 'Instale la aplicación WireGuard en el dispositivo.', qrStep2: 'En la aplicación elija «+» › «Escanear desde código QR» (en un ordenador: importar desde archivo).', qrStep3: 'Escanee el código o importe el archivo .conf y conéctese.',
    qrDownload: 'Descargar archivo .conf', qrSecret: 'El código y el archivo contienen la clave privada del dispositivo. No los comparta; puede obtenerlos aquí de nuevo cuando quiera.',
    geoTitle: 'Países', geoSub: 'Bloquee por país las conexiones que entran desde internet, o deje entrar solo a los países que usted elija.',
    geoEnable: 'Restringir por país', geoOn: function (n) { return 'Activado · ' + (n === 1 ? '1 país bloqueado' : n + ' países bloqueados'); },
    geoOnAllow: function (n) { return 'Activado · solo entran conexiones de ' + n + (n === 1 ? ' país' : ' países'); },
    geoBlockEmpty: 'Activado, pero no se bloquea nada porque no hay ningún país elegido.',
    geoAllowEmpty: 'Activado, pero no hay ningún país permitido elegido; no se restringe nada hasta que elija uno.',
    geoAllowNoData: 'Activado, pero no hay datos de direcciones para los países elegidos; no se restringe nada.',
    geoMode: '¿Cómo debe funcionar?', geoModeBlock: 'Bloquear los países que yo elija', geoModeAllow: 'Permitir solo los países que yo elija',
    geoModeBlockDesc: 'Se bloquean las conexiones procedentes de los países elegidos.',
    geoModeAllowDesc: 'Solo se puede llegar a su red desde los países elegidos; la salida a internet no se ve afectada.',
    geoVpn: 'Las conexiones VPN quedan exentas', geoVpnSub: 'Se puede llegar a sus conexiones VPN desde cualquier país.',
    geoAllowed: 'Países permitidos', geoAllowPick: 'Aún no hay ningún país elegido. Elija abajo los países que quiere permitir; hasta entonces no se restringe nada.',
    geoBlockPick: 'Aún no hay ningún país elegido. Elija abajo los países que quiere bloquear.',
    geoAllowSafety: 'Esto deja fuera a todos los países que no estén en la lista. Si gestiona el panel a través de internet, asegúrese de que el país en el que se encuentra esté en la lista. Después de aplicar, se restauran automáticamente los ajustes anteriores si no confirma en 90 segundos.',
    geoDir: '¿En qué sentido?', dirIn: 'Solo entrada', dirBoth: 'Entrada y salida',
    dirInDesc: 'Recomendado. Se bloquean los intentos de conexión desde estos países hacia su red.',
    dirBothDesc: 'También se corta el acceso a los sitios web y servicios alojados en estos países.',
    geoDb: 'Base de datos de países (GeoIP)', geoDbMaxmind: 'Se usa MaxMind GeoLite2.', geoDbOther: 'En OPNsense hay configurada otra fuente GeoIP y es la que se usa.',
    geoDbMissing: 'Sin configurar. Introduzca su clave de licencia gratuita de MaxMind.', geoKeyPh: 'Clave de licencia de MaxMind', geoKeySet: 'Nueva clave de licencia',
    geoNeedKey: 'El bloqueo por países necesita una base de datos GeoIP: cree una cuenta gratuita de GeoLite2 en MaxMind, genere una clave en «Manage License Keys», introdúzcala arriba y pulse Aplicar.',
    geoBlocked: 'Países bloqueados', geoCount: function (n) { return n === 1 ? '1 país' : n + ' países'; }, geoSearch: 'Buscar países',
    geoStats: 'Intentos de conexión bloqueados', geoStatsHint: 'Paquetes bloqueados desde la última carga de las reglas.',
    cleanupTitle: 'Quitar lo que ha añadido Inversa Panel', cleanupText: 'Desactiva Inversa Panel y elimina los alias, las políticas de bloqueo DNS, los límites de velocidad y las reglas automáticas de cortafuegos que ha añadido. Sus redirecciones de puertos, redes, dispositivos VPN y ajustes DNS se conservan.', cleanupBtn: 'Quitar', cleanupConfirm: '¿Desactivar Inversa Panel y eliminar los ajustes que ha añadido?', cleanupDone: 'Se han eliminado los ajustes que añadió Inversa Panel e Inversa Panel está desactivado.',
    geoNotWorking: 'Activado, pero aún no se restringe nada porque la base de datos de países no está cargada.',
    geoAddresses: function (n) { return n === 1 ? '1 rango de direcciones cargado' : n + ' rangos de direcciones cargados'; },
    geoKeyOk: 'Clave de MaxMind guardada, base de datos cargada', geoKeyPending: 'Clave guardada, descargando la base de datos…',
    geoKeyReplace: 'Escriba una clave nueva para sustituirla', geoGetKey: '¿Cómo conseguir una clave gratuita?',
    geoWaitDb: 'La base de datos se está descargando; el bloqueo empezará en unos minutos. Si tarda mucho, compruebe la clave.',
    geoDbipFree: 'gratuito, sin registro', geoDbipLoaded: function (m, n) { return 'datos de ' + m + ' · ' + n + ' rangos de direcciones'; },
    geoDbipLater: 'se descarga al activar y aplicar la restricción; se renueva cada mes',
    geoUseMaxmind: 'Quiero usar mi propia clave de MaxMind', geoDownloading: 'Descargando los datos de países; la restricción empezará en 1-2 minutos…',
    geoAfterApply: 'Al pulsar Aplicar se descargan los datos gratuitos de países (DB-IP Lite) y la restricción empieza en 1-2 minutos.',
    /* DNS */
    tabDns: 'DNS',
    dnsTitle: 'DNS', dnsSub: 'Cómo se resuelven los nombres: los nombres que apuntan a su red y los servidores DNS a los que pregunta el cortafuegos.',
    dnsRecTitle: 'Nombres locales',
    dnsRecSub: 'Haga que un nombre apunte a un dispositivo de su red; p. ej. nas.home.lan abre su servidor de archivos.',
    dnsName: 'Nombre', dnsIp: 'Dirección IP a la que apunta',
    dnsWild: 'Incluir subdominios', dnsWildSub: 'P. ej. con example.com, www.example.com y mail.example.com van a la misma dirección.',
    dnsWildShort: 'con subdominios', dnsWildHint: function (n) { return n + ' y todos los nombres por debajo van a esta dirección.'; },
    dnsRecEmpty: 'Aún no hay nombres.',
    dnsRecNote: 'Los nombres funcionan en los dispositivos que usan el cortafuegos como servidor DNS (en todos los dispositivos si está activado Seguridad › Categorías y aplicaciones › «Forzar DNS»). También aparecen en OPNsense, en Services › Unbound DNS › Overrides.',
    dnsBadName: 'Introduzca un nombre válido (p. ej. nas.home.lan).', dnsBadIp: 'Introduzca una dirección IP válida (p. ej. 192.168.1.20).',
    dnsTaken: function (n) { return 'Ya existe una entrada para ' + n + '.'; },
    dnsForeignHint: 'Esta entrada se creó en la página propia de OPNsense y puede cambiarse allí.',
    dnsSrvTitle: 'Servidores DNS', dnsSrvSub: '¿A quién debe preguntar el cortafuegos por los nombres que no conoce?',
    dnsLockedSystem: '«Use system nameservers» está activado en OPNsense (Services › Unbound DNS › Query Forwarding). Inversa Panel no lo toca; desactívelo allí para elegir los servidores aquí.',
    dnsLockedForward: 'El reenvío DNS para todos los nombres ya está configurado en OPNsense (Services › Unbound DNS › Query Forwarding / DNS over TLS). Inversa Panel no lo toca; elimine esas entradas para elegir los servidores aquí.',
    dnsModes: {
        auto: ['Automático', 'Como esté configurado en OPNsense; por defecto resuelve los nombres por sí mismo, empezando por los servidores raíz.'],
        cloudflare: ['Cloudflare', 'Rápido, sin filtro.'],
        google: ['Google', 'Sin filtro.'],
        quad9: ['Quad9', 'Además bloquea por su cuenta los sitios maliciosos conocidos.'],
        adguard: ['AdGuard DNS', 'Además bloquea por su cuenta anuncios y rastreadores.'],
        custom: ['Servidores propios', 'Usted introduce las direcciones de los servidores que se usarán.']
    },
    dnsServers: 'Direcciones de los servidores', dnsServersHint: 'Separe las direcciones IP con comas. Se recomiendan al menos dos servidores.',
    dnsDot: 'DNS cifrado (DNS over TLS)', dnsDotSub: 'Las consultas se envían cifradas; su proveedor de internet no puede ver qué nombres consulta ni cambiar las respuestas.',
    dnsTlsName: 'Nombre del certificado del servidor', dnsTlsNameSub: 'El servidor se verifica con este nombre (p. ej. dns.quad9.net). Si se deja vacío, la conexión se cifra pero el servidor no se verifica.',
    dnsSafety: 'Antes de aplicar se comprueba que los servidores responden. Después de aplicar, se restauran automáticamente los ajustes anteriores si no confirma en 90 segundos.',
    dnsUnreachable: 'No se ha cambiado nada: estos servidores DNS no han respondido (compruebe la dirección y, si el DNS cifrado está activado, el nombre del certificado):',
    /* attack protection (Suricata) */
    tabIps: 'Antiintrusión',
    ipsTitle: 'Protección contra ataques', ipsSub: 'El tráfico de los dispositivos de su red se compara con rastros conocidos de ataques y malware (Suricata).',
    ipsEnable: 'Inspeccionar el tráfico en busca de ataques',
    ipsAfterApply: 'Al pulsar Aplicar se descargan las reglas; la inspección empieza en 1-2 minutos.',
    ipsPreparing: 'Descargando y cargando las reglas…',
    ipsRunningDetect: 'En marcha, solo avisa', ipsRunningBlock: 'En marcha, bloquea',
    ipsMemory: function (n) { return n + ' MB de memoria'; },
    ipsRules: function (ago) { return 'reglas actualizadas ' + ago; },
    ipsStopped: 'Activado, pero la inspección no está en marcha ahora mismo.',
    ipsStart: 'Iniciar', ipsRetry: 'Reintentar',
    ipsNoMem: function (free, need) { return 'No se ha iniciado: no hay suficiente memoria libre (' + free + ' MB libres, ' + need + ' MB necesarios). Quedarse sin memoria detiene todo el cortafuegos, por eso no se inicia.'; },
    ipsUnavailable: 'No se ha encontrado el componente de detección de intrusiones en esta instalación de OPNsense.',
    ipsForeign: 'La detección de intrusiones ya está activada en OPNsense y se configuró fuera de Inversa Panel. Inversa Panel no toca esos ajustes y solo muestra las alertas de abajo. Para gestionarla aquí, desactive primero Services › Intrusion Detection en OPNsense.',
    ipsMode: 'Cuando se encuentra el rastro de un ataque', ipsDetect: 'Solo avisar', ipsBlock: 'Bloquear',
    ipsDetectDesc: 'Las conexiones sospechosas se anotan en la lista y no se corta nada. Se recomienda empezar así.',
    ipsBlockDesc: 'Se cortan las conexiones que coinciden con el rastro de un ataque; una falsa alarma también puede cortar una conexión inofensiva.',
    ipsBlockNo: {
        none: 'El bloqueo necesita una red protegida.',
        device: 'El bloqueo no puede usarse con este hardware de red (puertos agregados, puente o interfaz virtual). Solo funciona el modo de aviso.',
        offload: 'El bloqueo necesita que las opciones de descarga por hardware (CRC, TSO, LRO) estén desactivadas en Interfaces › Settings.'
    },
    ipsWhere: 'Tarjeta de red inspeccionada', ipsWhereHint: 'Aquí se vigila el tráfico de las redes protegidas.',
    ipsGroups: 'Qué buscar', ipsGroupsSub: 'Cada grupo aumenta la memoria usada.',
    ipsG: {
        malware: ['Malware y servidores de control', 'Un dispositivo infectado que habla con su servidor de control, minería de criptomonedas, certificados maliciosos conocidos.'],
        attackers: ['Direcciones de atacantes conocidos', 'Conexiones con servidores que figuran como origen de ataques o como comprometidos.'],
        exploits: ['Explotación de vulnerabilidades', 'Tráfico que intenta aprovechar puntos débiles de navegadores, servidores y dispositivos.'],
        phishing: ['Phishing', 'Páginas falsas creadas para obtener contraseñas y datos de tarjetas.'],
        scan: ['Escaneos e inundaciones', 'Escaneos de puertos e intentos de interrumpir un servicio. Puede generar muchas alertas.']
    },
    ipsAlerts: 'Últimas alertas', ipsAlertsNone: 'Aún no hay alertas.',
    ips24h: function (n, blocked) { return 'Últimas 24 horas: ' + (n === 1 ? '1 alerta' : n + ' alertas') + ', ' + (blocked === 1 ? '1 bloqueada' : blocked + ' bloqueadas'); },
    ipsBlocked: 'Bloqueado', ipsAlerted: 'Aviso',
    ipsNote: 'Los ajustes se escriben en la detección de intrusiones propia de OPNsense (Services › Intrusion Detection); las reglas se actualizan cada noche. El contenido del tráfico cifrado (HTTPS) no se ve: se examina adónde va una conexión y sus partes sin cifrar. Suricata usa mucha memoria; se recomiendan 8 GB de RAM.',
    setTitle: 'Ajustes',
    enabledLabel: 'Inversa Panel', enabledSub: 'Si está desactivado, se eliminan las reglas de cortafuegos añadidas por Inversa Panel.',
    langLabel: 'Idioma de la interfaz', langSub: 'Automático usa el idioma del sistema OPNsense.', langAuto: 'Automático',
    ifLabel: 'Redes protegidas', ifSub: 'La lista de dispositivos, el corte de internet y el forzado de DNS funcionan en estas interfaces.',
    respLabel: 'Respuesta para dominios bloqueados', respSub: '0.0.0.0 es más rápido; NXDOMAIN indica «el dominio no existe».',
    statsLabel: 'Estadísticas DNS', statsSub: 'Activa las estadísticas de Unbound para los contadores del resumen.',
    infoNote: 'Estos ajustes se escriben en la configuración propia de OPNsense: el alias «inversapanel_blocked» (Firewall › Aliases) y la política de lista de bloqueo «Inversa Panel (managed)» (Services › Unbound DNS › Blocklists). Puede ver allí los mismos ajustes.'
};

/* texts added after 1.1.0 */
(function (t) {
    t.ntSub = 'Le avisa por Telegram cuando pasa algo en la red. El cortafuegos solo envía mensajes; no acepta órdenes desde Telegram.';
    t.ntEnable = 'Notificaciones de Telegram';
    t.ntEnableSub = 'Los eventos se recogen cada minuto y se envían en un solo mensaje.';
    t.ntToken = 'Token del bot';
    t.ntTokenHint = 'El token que le dio BotFather. Una vez guardado, no vuelve a mostrarse en esta página; escriba uno nuevo para cambiarlo.';
    t.ntTokenKept = function (end) { return 'Guardado (…' + end + ') · escriba uno nuevo para cambiarlo'; };
    t.ntChat = 'Chat';
    t.ntChatHint = 'El número del chat al que se envían los mensajes. Después de escribir un mensaje al bot en Telegram, «Buscar el chat» le permite elegirlo.';
    t.ntFind = 'Buscar el chat';
    t.ntNoChats = 'Nadie ha escrito al bot. Abra su bot en Telegram y escriba un mensaje (en un grupo, añada el bot al grupo) y vuelva a intentarlo.';
    t.ntWhat = 'Qué avisar';
    t.ntKinds = {
        devices: [
            'Dispositivos nuevos',
            'Un dispositivo visto por primera vez, o que espera aprobación. Los teléfonos que cambian su dirección al azar cuentan como nuevos cada vez.'
        ],
        attacks: [
            'Alertas de ataque',
            'Alertas de la protección contra ataques, en un resumen una vez por minuto. No se avisa de los intentos desde internet que el cortafuegos rechaza de todos modos.'
        ],
        vpn: [
            'Conexiones VPN',
            'Dispositivos que se conectan a distancia, y una conexión entre sedes que se establece o se cae.'
        ],
        internet: [
            'Conexión a internet',
            'La conexión que se cae y vuelve, o el cortafuegos que se reinicia. El aviso de una caída llega cuando la conexión vuelve.'
        ],
        logins: [
            'Accesos fallidos',
            'Un intento de entrar en la interfaz del cortafuegos con una contraseña incorrecta.'
        ],
        health: [
            'Estado del cortafuegos',
            'Cuando el disco está casi lleno, el procesador se calienta mucho o hay una actualización de OPNsense pendiente.'
        ],
        updates: [
            'Nueva versión',
            'GitHub se consulta una vez al día; se le avisa cuando sale una nueva versión de Inversa Panel. Instalarla depende de usted, en Ajustes › Actualizaciones.'
        ]
    };
    t.ntSave = 'Guardar';
    t.ntTest = 'Guardar y enviar un mensaje de prueba';
    t.ntSaved = 'Ajustes de notificaciones guardados.';
    t.ntTestSent = 'Mensaje de prueba enviado; mírelo en Telegram.';
    t.ntFailed = 'No ha funcionado';
    t.ntLoadFailed = 'No se han podido leer los ajustes de notificaciones.';
    t.ntError = function (n, text) { return n + (n === 1 ? ' notificación no se ha podido enviar y está en espera: ' : ' notificaciones no se han podido enviar y están en espera: ') + text; };
    t.ntHowTitle = 'Cómo configurarlo';
    t.ntHow = [
        'En Telegram, abra un chat con @BotFather, envíe /newbot y dé un nombre a su bot.',
        'Pegue el token que le da BotFather (tiene este aspecto: 123456789:AAH…) en «Token del bot».',
        'Abra su nuevo bot en Telegram y pulse «Iniciar», o escríbale un mensaje. Para avisos en un grupo, añada el bot al grupo y escriba un mensaje allí.',
        'Pulse «Buscar el chat» y elija el chat que aparece.',
        'Pulse «Guardar y enviar un mensaje de prueba».'
    ];
    t.ntPrivacy = 'Mientras las notificaciones están activadas, el cortafuegos se conecta a api.telegram.org. Los mensajes incluyen nombres de dispositivos y direcciones MAC e IP, que pasan por los servidores de Telegram. El token del bot se guarda en la configuración de OPNsense, y por tanto también en sus copias de seguridad.';
    t.scanSub = 'Lo que había configurado en OPNsense en este cortafuegos antes del panel, y cómo lo trata el panel. Esta página solo lee.';
    t.scanOpenOpn = 'Abrir en OPNsense';
    t.scanAdopted = function (n) { return n + (n === 1 ? ' nombre local pasa' : ' nombres locales pasan') + ' a gestionarse en la página DNS.'; };
    t.scanNone = 'No había nada configurado antes del panel que afecte a sus funciones.';
    t.scanFailed = 'No se han podido leer los ajustes existentes.';
    t.scanFoot = 'Los ajustes de OPNsense que no se cuentan aquí (alias, certificados, usuarios, otros complementos) siguen igual; el panel no los toca.';
    t.scanGroups = {
        warn: [
            'Pueden causar problemas',
            'Ajustes que hacen la misma función que una función del panel o que le afectan. Léalos antes de activar esa función.'
        ],
        ok: [
            'Los usa el panel tal como están',
            'Se muestran en las páginas del panel y pueden cambiarse allí.'
        ],
        stays: [
            'Siguen en las páginas de OPNsense',
            'Siguen funcionando; el panel no los cambia.'
        ]
    };
    t.scanFindings = {
        networks: [
            'Redes locales',
            'Aparecen en Red e Internet › Redes locales; la protección, el aislamiento y el límite de velocidad se configuran allí.'
        ],
        networks_locked: [
            'Redes que el panel no edita',
            'Las redes en puertos agregados (LAGG) o puentes, y las redes sin dirección fija, se muestran en solo lectura. Cámbielas en las páginas de Interfaces de OPNsense.'
        ],
        multiwan: [
            'Más de una conexión a internet',
            'El panel gestiona una sola conexión (WAN). La página Conexión a internet es de solo lectura; las pasarelas y la conmutación por fallo siguen en System › Gateways. Las reglas del panel para conexiones entrantes (VPN, países, redirección de puertos) se aplican solo a la WAN; una segunda conexión no está cubierta.'
        ],
        wan_type: [
            'Una conexión a internet de un tipo que el panel no configura',
            'La página Conexión a internet es de solo lectura. Cámbiela en Interfaces › WAN.'
        ],
        reservations: [
            'Direcciones fijas (Dnsmasq)',
            'Se muestran en la página Dispositivos como la dirección fija del dispositivo.'
        ],
        dhcp_other: [
            'Otro servidor DHCP asigna las direcciones',
            'El panel escribe las direcciones fijas y los rangos DHCP en Dnsmasq. Mientras funcione ISC DHCP o Kea, estos ajustes no tienen efecto; con dos servidores DHCP en la misma red, los dispositivos pueden recibir direcciones contradictorias. Gestione las direcciones fijas en la página de ese servidor, o pase antes a Dnsmasq.'
        ],
        forwards: [
            'Redirecciones de puertos',
            'Las redirecciones de un puerto de la WAN a un dispositivo aparecen en la página Redirección de puertos, donde se pueden desactivar o eliminar.'
        ],
        forwards_complex: [
            'Redirecciones que el panel no edita',
            'Las redirecciones con alias, rangos de puertos, otras interfaces u origen restringido aparecen en solo lectura, para que nunca se simplifiquen por error. Cámbielas en Firewall › NAT.'
        ],
        dns_names: [
            'Nombres locales',
            'Aparecen en solo lectura en la página DNS. «Asumir» permite editarlos allí; siguen siendo reemplazos de Unbound y su descripción pasa a ser «Inversa Panel (managed)». Un segundo registro para el mismo nombre se queda donde está.'
        ],
        unbound_off: [
            'El DNS Unbound está desactivado',
            'El bloqueo por categoría y aplicación, la búsqueda segura, los nombres locales y el historial de internet funcionan a través de Unbound. Mientras otro servicio (Dnsmasq, AdGuard Home, Pi-hole) responde a las consultas DNS de las redes, estas funciones no hacen nada, aunque estén activadas.'
        ],
        blocklists: [
            'Listas de bloqueo configuradas en OPNsense',
            'Siguen funcionando junto a la lista del panel. Un nombre que ellas bloquean puede seguir bloqueado aunque el panel lo permita; los interruptores de categoría del panel no las desactivan. Services › Unbound DNS › Blocklists.'
        ],
        dns_servers: [
            'Los servidores DNS se eligen en OPNsense',
            'El reenvío de consultas o el DNS sobre TLS se configuran en Services › Unbound DNS. Dos ajustes romperían Unbound, así que la elección de servidores DNS del panel está desactivada; elimine antes ese ajuste allí para elegir en el panel.'
        ],
        rules: [
            'Reglas de cortafuegos creadas en OPNsense',
            'Siguen funcionando y no se muestran en el panel. Las reglas propias del panel se evalúan antes que las suyas: un dispositivo que el panel bloquea sigue bloqueado aunque una regla suya lo permita, y lo que abre el panel (un puerto de VPN, una celda permitida de la tabla de acceso) está abierto aunque una regla suya lo bloquee. Donde el panel no tiene regla, deciden las suyas.'
        ],
        nat: [
            'Reglas NAT de salida y NAT 1:1',
            'Se quedan como están y no se muestran en el panel. Con el NAT de salida en modo manual, una red añadida en el panel no puede llegar a internet hasta que usted añada para ella una regla NAT de salida.'
        ],
        wireguard: [
            'Conexiones WireGuard creadas en OPNsense',
            'Siguen funcionando; el panel no las cambia. Cada conexión añadida en el panel tiene su propia instancia y un puerto libre. Los dispositivos y las reglas de las existentes siguen en VPN › WireGuard.'
        ],
        ipsec: [
            'Túneles IPsec creados en OPNsense',
            'Aparecen por su nombre en la página VPN; no se pueden editar allí.'
        ],
        openvpn: [
            'OpenVPN',
            'El panel no tiene página de OpenVPN. Las conexiones siguen funcionando y sus reglas son suyas. Las redes detrás de ellas no forman parte de la tabla de acceso ni del aislamiento.'
        ],
        ids: [
            'La detección de intrusiones ya está en marcha',
            'Suricata estaba activado antes que el panel. La página Protección contra ataques muestra su estado y sus alertas, y no toca los conjuntos de reglas ni las interfaces. Para que lo gestione el panel, desactívelo en Services › Intrusion Detection y después actívelo en el panel; el panel elegirá entonces sus propios grupos de reglas.'
        ],
        zenarmor: [
            'Zenarmor está instalado',
            'Zenarmor y la protección contra ataques en modo de bloqueo usan la tarjeta de red de la misma forma (netmap); no los ejecute los dos en la misma interfaz. Use la protección contra ataques en modo «solo aviso», o elija uno de los dos. El bloqueo por aplicación y categoría también se aplica en ambos sitios, por separado.'
        ],
        shaper: [
            'Reglas de control de tráfico creadas en OPNsense',
            'Se quedan como están. Un límite de velocidad para una red añade las reglas del panel; de dos reglas que coinciden con el mismo tráfico gana la primera, así que un límite puede no actuar como se espera.'
        ],
        ha: [
            'Alta disponibilidad (CARP / sincronización de configuración)',
            'El panel no se probó en una configuración de alta disponibilidad. Sus reglas automáticas existen solo en un cortafuegos donde está instalado el paquete: instálelo en los dos. Los registros del panel (consumo de datos, eventos) no se sincronizan.'
        ]
    };
    t.newsTitle = function (v) { return 'Novedades de Inversa Panel ' + v; };
    t.newsSub = 'El panel se ha actualizado. Estas son las novedades, en breve:';
    t.newsOk = 'Entendido';
    t.newsGo = 'Ver';
    t.newsHeading = 'Novedades';
    t.news = {
        '1.6.0': [
            ['Asistente de configuración: configure redes, protecciones, aprobación de dispositivos nuevos y notificaciones paso a paso.', 'wizard'],
            ['Página de actualizaciones: compruebe e instale Inversa Panel y OPNsense desde un solo sitio.', 'updates'],
            ['Nuestro nuevo lema: tan sencillo como un módem, tan potente como OPNsense.', '']
        ],
        '1.5.0': [
            ['Apruebe desde su teléfono: en un teléfono el panel se abre en una pantalla corta con solo los dispositivos que esperan aprobación.', 'devices'],
            ['Permitir un tiempo: una hora, un día, una semana, hasta medianoche o hasta una hora que elija.', 'devices'],
            ['Rechazar un dispositivo en espera, y eliminar dispositivos.', 'devices'],
            ['Un dispositivo nuevo se avisa ahora en segundos.', 'notify']
        ]
    };
    t.tabUpdates = 'Actualizaciones';
    t.ugSub = 'Actualizaciones de Inversa Panel y de OPNsense. No se busca nada hasta que pulse un botón.';
    t.ugPanelSub = 'Versiones publicadas en GitHub';
    t.ugFwSub = 'El software propio del cortafuegos';
    t.ugInstalled = 'Versión instalada';
    t.ugLastCheck = 'Última comprobación';
    t.ugWaitOther = 'Puede instalarla cuando termine la actualización de OPNsense.';
    t.ugFwNotChecked = 'Aún no se ha comprobado.';
    t.ugFwCurrent = 'OPNsense está al día.';
    t.ugFwChecking = 'Buscando actualizaciones…';
    t.ugFwRunning = 'Se está actualizando OPNsense. Puede tardar unos minutos; puede cerrar la página, la actualización sigue.';
    t.ugFwRestarting = 'El cortafuegos se está reiniciando. Internet se corta unos minutos; esta página se vuelve a cargar sola cuando esté disponible de nuevo.';
    t.ugFwUpdated = 'OPNsense se ha actualizado y está al día.';
    t.ugFwFailed = 'No se ha podido comprobar ni iniciar la actualización de OPNsense.';
    t.ugFwNoAccess = 'No se ha podido leer la información de actualización de OPNsense. Es posible que este usuario no tenga permiso para actualizar.';
    t.ugFwNew = function (n) { return n === 1 ? '1 actualización disponible.' : n + ' actualizaciones disponibles.'; };
    t.ugFwNewLong = function (v, n, size) { return (v ? 'OPNsense ' + v + ' está listo: ' : '') + n + (n === 1 ? ' paquete' : ' paquetes') + (size ? ', ' + size + ' para descargar' : '') + '.'; };
    t.ugFwReboot = 'El cortafuegos se reinicia al terminar esta actualización; internet se corta unos minutos.';
    t.ugShowList = function (n) { return 'Ver los ' + n + ' paquetes'; };
    t.ugHideList = 'Ocultar la lista';
    t.ugFwUpdate = 'Actualizar';
    t.ugFwUpdateReboot = 'Actualizar y reiniciar';
    t.ugFwConfirm = function (v, n, reboot) { return '¿Actualizar OPNsense' + (v ? ' a ' + v : '') + '? ' + n + (n === 1 ? ' paquete cambia.' : ' paquetes cambian.') + (reboot ? ' El cortafuegos se reinicia al terminar y internet se corta unos minutos.' : ''); };
    t.ugFwMajor = function (v) { return 'Nueva versión principal: OPNsense ' + v + '. Haga la actualización de versión principal en la página de actualizaciones de OPNsense.'; };
    t.ugFwPage = 'Página de actualizaciones de OPNsense';
    t.upCheck = 'Buscar actualización';
    t.upChecking = 'Buscando…';
    t.upCurrent = function (v) { return 'Al día: ' + v + ' es la última versión.'; };
    t.upNew = function (v) { return 'Hay una nueva versión disponible: ' + v; };
    t.upInstall = function (v) { return 'Actualizar a ' + v; };
    t.upBackupNote = 'Primero se hace una copia de seguridad de la configuración de OPNsense y de los registros del panel; tras la instalación se comprueban los ajustes, y lo que falte se restaura desde la copia.';
    t.upConfirm = function (v) { return 'Inversa Panel ' + v + ' se descargará de GitHub y se instalará. ¿Continuar?'; };
    t.upRunning = function (v) { return 'Actualizando a ' + v + '.'; };
    t.upSteps = {
        check: 'Buscando la versión…',
        backup: 'Haciendo copia de los ajustes…',
        download: 'Descargando el paquete…',
        verify: 'Comprobando la suma de control…',
        install: 'Instalando…',
        aftercheck: 'Comprobando los ajustes…',
        done: ''
    };
    t.upDone = function (a, b) { return 'Actualizado de ' + a + ' a ' + b + '.'; };
    t.upAllThere = 'Se han comprobado los ajustes y los registros: está todo.';
    t.upRestored = {
        settings: 'Faltaban ajustes del panel; la configuración se restauró desde la copia.',
        records: 'Se restauraron desde la copia los archivos de registros que faltaban.'
    };
    t.upProblems = {
        version: 'La versión instalada no es la esperada.',
        settings: 'Algunos ajustes del panel han cambiado; la copia no se restauró porque, mientras tanto, la configuración también se cambió en otro sitio. Copia: /var/db/inversapanel-update/backup/config.xml',
        config_unreadable: 'No se ha podido leer la configuración; no se han comprobado los ajustes.',
        code: 'El código de la nueva versión no se ha cargado.',
        check: 'La comprobación posterior a la instalación no ha terminado.'
    };
    t.upFailed = 'La actualización no se ha hecho; la versión instalada sigue como estaba.';
    t.upErrors = {
        unreachable: 'No se ha podido conectar con GitHub.',
        nopackage: 'El panel no se instaló como paquete; no se puede actualizar desde aquí.',
        norelease: 'No se ha encontrado el paquete de la última versión.',
        nonewer: 'No hay una versión más reciente.',
        backup: 'No se ha podido hacer la copia de seguridad.',
        download: 'No se ha podido descargar el paquete.',
        checksum: 'La suma de control del paquete descargado no coincide; no se ha instalado.',
        install: 'No se ha podido instalar el paquete.',
        stale: 'La actualización se detuvo a medias.'
    };
    t.bkSub = 'Una copia de seguridad de la configuración de OPNsense; los ajustes del panel forman parte de ella.';
    t.bkGetTitle = 'Hacer una copia de seguridad';
    t.bkGetSub = 'Descarga la configuración tal como está ahora a su ordenador.';
    t.bkDownload = 'Descargar la copia';
    t.bkDownloadShort = 'Descargar';
    t.bkSecret = 'El archivo contiene hashes de contraseñas y claves de VPN; guárdelo en un lugar de confianza.';
    t.bkPutTitle = 'Restaurar desde una copia';
    t.bkPutSub = 'Vuelve a poner un archivo de copia que descargó antes.';
    t.bkUpload = 'Elegir un archivo y restaurar';
    t.bkRestartNote = 'Restaurar reinicia el cortafuegos; internet se corta 1–2 minutos. Los cambios hechos después de la copia se pierden.';
    t.bkCopies = 'Copias en el cortafuegos';
    t.bkCopiesSub = 'Se hace una copia cada noche a las 03:15 cuando ha cambiado la configuración; se guardan las últimas 7 copias.';
    t.bkNow = 'Hacer una copia ahora';
    t.bkNone = 'Aún no hay copias; la primera se hará esta noche.';
    t.bkRestore = 'Restaurar';
    t.bkConfirmCopy = function (n) { return 'La copia de ' + n + ' se volverá a poner y el cortafuegos se reiniciará. Internet se corta 1–2 minutos; los cambios hechos después de esa hora se pierden. ¿Continuar?'; };
    t.bkConfirmFile = function (n) { return 'El archivo ' + n + ' se volverá a poner y el cortafuegos se reiniciará. Internet se corta 1–2 minutos; los ajustes del archivo sustituyen a los actuales. ¿Continuar?'; };
    t.bkRestarting = 'La configuración se ha vuelto a poner; el cortafuegos se está reiniciando. Esta página se vuelve a cargar sola cuando esté disponible (1–2 minutos).';
    t.bkErrors = {
        notconfig: 'Este archivo no es una configuración de OPNsense.',
        incomplete: 'El archivo de configuración parece incompleto; no se ha restaurado.',
        restore: 'No se ha podido restaurar la configuración; los ajustes actuales siguen como estaban.',
        notfound: 'No se ha encontrado la copia.'
    };
    t.aboutNotInstalled = 'no instalado';
    t.wakeTitle = 'Encender a distancia';
    t.wakeSub = 'Pide a un dispositivo apagado que se encienda (Wake-on-LAN); el dispositivo debe tenerlo activado.';
    t.wakeBtn = 'Encender';
    t.wakeSent = 'La petición de encendido se ha enviado; el dispositivo se enciende en breve si lo admite.';
    t.wakeFailed = 'No se ha podido enviar la petición de encendido.';
    t.landLabel = 'Abrir Inversa Panel al iniciar sesión';
    t.landSub = 'Solo para su usuario; si está desactivado, al iniciar sesión se abre la página propia de OPNsense.';
    t.landOther = function (p) { return 'Hay otra página configurada para su usuario en OPNsense: ' + p + '. Al activar esto, se sustituye.'; };
    t.pauseTitle = 'Pausar un rato';
    t.pause30 = '30 minutos';
    t.pause60 = '1 hora';
    t.pause120 = '2 horas';
    t.pauseMorning = 'Hasta las 07:00';
    t.pauseResume = 'Reanudar';
    t.pauseUntil = function (c) { return 'Pausado hasta ' + c; };
    t.pauseUntilLong = function (c) { return 'El acceso a internet está pausado hasta ' + c + '.'; };
    t.pauseSub = 'Se aplica al momento; internet vuelve solo cuando se cumple el tiempo.';
    t.apprAllowed = 'Permitido';
    t.apprRevoke = 'Quitar el permiso para estar en esta red';
    t.apprToggleAria = function (n) { return 'Permiso de ' + n + ' para estar en la red'; };
    t.apprRejected = 'Rechazado';
    t.apprReject = 'Rechazar';
    t.apprRejectedPanel = 'Ha rechazado este dispositivo: no puede llegar a internet ni a otras redes, y no se le volverá a avisar de él.';
    t.apprFor = 'Permitir un tiempo';
    t.allow1h = '1 hora';
    t.allow1d = '1 día';
    t.allow1w = '1 semana';
    t.allowForever = 'Para siempre';
    t.apprNow = 'Permitir un tiempo y rechazar se aplican al momento. «Aprobar» es para siempre y se guarda con «Aplicar».';
    t.apprUntil = function (w) { return 'Permitido hasta ' + w; };
    t.apprUntilLong = function (w) { return 'Permitido un tiempo, hasta ' + w + '. Después, el dispositivo vuelve a esperar aprobación.'; };
    t.qTitle = function (n) { return n === 1 ? '1 dispositivo quiere entrar en la red' : n + ' dispositivos quieren entrar en la red'; };
    t.qHint = 'Hasta que los permita, no llegan ni a internet ni a otras redes.';
    t.qAllow = 'Permitir';
    t.qNone = 'Ya no hay ningún dispositivo en espera.';
    t.qFull = 'Abrir el panel completo';
    t.qAllowed = function (n, w) { return w ? n + ' está permitido hasta ' + w + '.' : n + ' está permitido para siempre.'; };
    t.qRejected = function (n) { return n + ' ha sido rechazado; no se le volverá a avisar de este dispositivo.'; };
    t.qPending = 'Un cambio de red espera su confirmación. Confírmelo primero, o espere a que se deshaga.';
    t.forgetTitle = 'Eliminar dispositivo';
    t.forgetBtn = 'Eliminar';
    t.forgetSub = 'Se eliminan su nombre, su aprobación, su IP fija y su lugar en los horarios. Si vuelve, es un dispositivo nuevo; en una red que lo pida, vuelve a esperar aprobación.';
    t.forgetConfirm = function (n) { return '¿Eliminar ' + n + '? Se eliminan su nombre, su aprobación, su IP fija y su lugar en los horarios. Si el dispositivo está ahora en la red, vuelve a aparecer como dispositivo nuevo.'; };
    t.forgetDone = function (n) { return n + ' se ha eliminado.'; };
    t.allowMidnight = 'Hasta medianoche';
    t.allowPick = 'Elija el fin…';
    t.allowPickLabel = 'Permitido hasta';
    t.allowPickCancel = 'Cancelar';
    t.allowPickSub = '30 días como máximo. Para más tiempo, elija «Para siempre».';
    t.allowPickBad = 'El fin debe ser posterior a ahora y estar como máximo a 30 días.';
    t.allowMidnightShort = 'Medianoche';
    t.allowPickShort = 'Elegir hora…';
    t.qFullShort = 'Panel completo';
    t.wiz = {
        start: [
            'Bienvenido a Inversa Panel',
            'Vamos a configurar lo básico en unos pasos. Cada paso se puede cambiar más tarde en Ajustes.'
        ],
        nets: [
            'Redes que proteger',
            'Las reglas de bloqueo, el filtro DNS y la aprobación de dispositivos nuevos se aplican solo a las redes que elija.'
        ],
        protect: [
            'Protecciones',
            'Elija lo que el cortafuegos bloquea a través del DNS.'
        ],
        devices: [
            'Dispositivos nuevos',
            '¿En qué redes debe esperar un dispositivo nuevo hasta que usted lo deje entrar?'
        ],
        notify: [
            'Notificaciones',
            'Opcional: que Telegram le avise cuando aparece un dispositivo nuevo o se bloquea un ataque. Estos ajustes se guardan en el momento con «Guardar» de abajo; si no los quiere, pulse Siguiente.'
        ],
        done: [
            'Resumen',
            'Sus elecciones están abajo. «Aplicar y terminar» las aplica todas de una vez.'
        ]
    };
    t.wizKicker = 'Asistente de configuración';
    t.wizShort = {
        start: 'Inicio',
        nets: 'Redes',
        protect: 'Protecciones',
        devices: 'Dispositivos nuevos',
        notify: 'Notificaciones',
        done: 'Resumen'
    };
    t.wizNextTo = function (n) { return 'Siguiente: ' + n + ' →'; };
    t.wizStep = function (n, m) { return 'Paso ' + n + ' de ' + m; };
    t.wizClose = 'Cerrar el asistente';
    t.wizBack = 'Atrás';
    t.wizNext = 'Siguiente';
    t.wizFinish = 'Aplicar y terminar';
    t.wizSafe = 'Nada cambia en el cortafuegos antes del último paso. Solo el idioma, la página al iniciar sesión y las notificaciones se guardan en cuanto los cambia.';
    t.wizNoNet = 'Elija al menos una red.';
    t.wizScan = 'Si antes configuró cosas en OPNsense, puede ver cómo las entiende el panel.';
    t.wizRecommended = 'Recomendado';
    t.wizIps = 'La protección contra ataques (Suricata) necesita más memoria; puede activarla más tarde en Seguridad › Protección contra ataques.';
    t.wizApprSub = 'Si está activado, un dispositivo nuevo no llega ni a internet ni a otras redes hasta que usted lo deje entrar.';
    t.wizApprNote = 'Los dispositivos de estas redes ya cuentan como aprobados, así que nadie se queda sin conexión. Para dejar entrar dispositivos nuevos desde su teléfono, use las notificaciones de Telegram, la VPN y «Abrir Inversa Panel al iniciar sesión».';
    t.wizNone = 'Ninguna';
    t.wizDoneNote = 'Después de aplicar, puede cambiar todo en las páginas del menú. El asistente se puede volver a ejecutar desde Ajustes.';
    t.wizStart = 'Iniciar el asistente de configuración';
    t.wizAgain = 'Asistente de configuración';
    t.wizAgainSub = 'Configure de nuevo redes, protecciones, aprobación de dispositivos nuevos y notificaciones, paso a paso.';
    t.wizAgainBtn = 'Ejecutar el asistente';
    t.wanSpeedBtn = 'Prueba de velocidad';
    t.wanSpeeding = 'Midiendo… (15 s)';
    t.wanUp = 'Subida';
    t.wanPing = 'Latencia';
    t.wanSpeedFailed = 'No se ha podido medir la velocidad.';
    t.wanSpeedLimited = function (m) { return 'El servidor de medición no admite pruebas seguidas durante un rato. Inténtelo de nuevo dentro de unos ' + m + ' minutos.'; };
    t.pfTargetHint = 'Elija de la lista o escriba una dirección IP.';
})(window.InversaPanelI18n.es);

/* device identity watch (1.7.0) */
(function (t) {
    t.ov.evId = 'La identidad del dispositivo cambió';
    t.ov.evIdHeld = 'La identidad del dispositivo cambió, permiso retirado';
    t.idwLabel = 'Vigilancia de la identidad de los dispositivos';
    t.idwSub = 'Una dirección MAC se puede copiar; la forma en que un dispositivo pide su dirección IP casi nunca. Se le avisa cuando un dispositivo aprobado parece otro tipo de dispositivo, cuando dos dispositivos usan la misma dirección a la vez o cuando de repente fija su IP él mismo. Hace visible una copia, pero no la impide: la copia de un dispositivo del mismo tipo (iPhone de un iPhone) puede pasar inadvertida. Solo funciona con el servidor DHCP dnsmasq de OPNsense.';
    t.idwModes = { off: 'Desactivada', tell: 'Avisarme', hold: 'Retirar el permiso' };
    t.idwConflict = function (f) { return 'Ya hay otro script de concesiones configurado en dnsmasq (' + f + '). dnsmasq solo admite uno, así que el panel lo deja como está y la vigilancia no funciona.'; };
    t.idwNoDnsmasq = 'Este OPNsense no tiene carpeta para extensiones de dnsmasq; la vigilancia no funciona.';
    t.idwKinds = { apple: 'Dispositivo Apple', windows: 'Windows', android: 'Android', linux: 'Linux', other: 'Tipo desconocido' };
    t.idwKnown = 'Identidad conocida';
    t.idwBadge = 'Identidad cambiada';
    t.idwWhy = { fp: 'Pidió su dirección IP como otro tipo de dispositivo.', both: 'Dos dispositivos distintos usan esta dirección MAC.', name: 'Dio otro nombre.', manual: 'Fijó su dirección IP él mismo en lugar de pedirla.' };
    t.idwSeen = function (k, n) { return 'Visto por última vez: ' + k + (n ? ' · ' + n : '') + '.'; };
    t.idwWhen = function (a) { return '(' + a + ')'; };
    t.idwAccept = 'Es mío, aceptar';
    t.idwAccepted = 'La nueva identidad se aceptó para este dispositivo.';
    t.qIdTitle = function (n) { return n === 1 ? 'Cambió la identidad de 1 dispositivo' : 'Cambió la identidad de ' + n + ' dispositivos'; };
    t.qIdHint = 'Puede que su dirección MAC se haya copiado. Acéptelo si es suyo; si no, recházelo.';
    t.news['1.7.0'] = [['Vigilancia de la identidad de los dispositivos: se detecta un dispositivo con una dirección MAC copiada; se le avisa o se retira su permiso (Ajustes, desactivada por defecto).', 'settings']];
})(window.InversaPanelI18n.es);
