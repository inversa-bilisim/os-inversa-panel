# Inversa Panel: reference

English · [Türkçe](reference.tr.md)

This document is the detail behind the summary in the [README](../README.md): what each page does and where it writes in OPNsense, folder layout and API, test steps, known limits.

## Pages and where they write in OPNsense

The top menu has seven sections (Overview, Network & Internet, VPN, Devices, Security, Logs, Settings); sections with more than one page show their pages as sub tabs. The same sections are in OPNsense's side menu (**Inversa**).

| Section › page | What it does | Where it writes in OPNsense |
|---|---|---|
| Overview | Protection status and things that need attention, a one-line status for each protection, quick protection switches; devices online, DNS requests blocked today and attack alerts, WAN speed and chart, data used today; internet connection, local networks, most active devices, VPN connections, recent events, system status; a welcome card on first start | Read-only; once a minute it takes notes under `/var/db/inversapanel` for the daily data usage and the events |
| Network & Internet › Internet connection | Three columns: connection type (PPPoE / static IP / behind a modem), the settings of the chosen type (VLAN tag, IPv6, port; **Advanced**: MAC address, MTU) and the **current connection status** (port, IP, gateway, DNS, IPv6, a connection test that runs by itself, the external IP on request) | Interfaces (including `spoofmac`, `mtu`), VLANs, PPPoE, gateway (the same method as the OPNsense setup wizard) |
| Network & Internet › Local networks | Network cards (colour, number of connected devices, isolation, speed limit) and a single network form: name, colour, connection (VLAN or own port), address, DHCP (only the last part is typed for the range), **Isolate from other networks** (the networks it still talks to in both directions are selected), **speed limit per network**, **"New devices wait for approval"**. Everything in the form is applied with a single "Save", with rollback protection. Below it a three-state table of access between networks (for one-way fine tuning) | Interfaces (name = interface description), VLANs, dnsmasq DHCP ranges; access rules as automatic rules; speed limit as Traffic Shaper `Inversa Panel guest …`; colour and isolation in the `OPNsense/InversaPanel` model |
| Network & Internet › Physical ports | What the network ports are used for (view only) | Read-only |
| Network & Internet › DNS | **Local names**: pointing a domain name at an address on the internal network (e.g. `nas.ev.lan` → `192.168.1.20`), optionally together with its subdomains; records created in OPNsense are listed read-only. **DNS servers**: automatic (OPNsense's own setting), Cloudflare, Google, Quad9, AdGuard DNS or own addresses; optionally encrypted DNS (DNS over TLS). The servers are tried before they are applied; a choice that does not answer is not applied | Unbound host overrides and query forwarding / DNS over TLS records, with the description `Inversa Panel (managed)`; the choice in the `OPNsense/InversaPanel` model |
| Network & Internet › Port forwarding | A new forward in a single row: the external port box suggests common ports and fills in the name, internal port and protocol; the target is chosen by device name or by IP. The forwards are shown as a table: on/off, delete; UPnP status | Firewall › NAT › Port Forward rules (the allow rule is automatic) |
| VPN | **Site to site with IPsec** (with firewalls of other vendors: IKEv2, shared key, AES-256 / SHA-256 / DH group 14; selected local networks ⇄ remote networks, connection status and the full list of values to enter on the other device) and several WireGuard connections, each on its own UDP port: **remote access** (a tunnel address that can be chosen per device; **access per device**: the connection's networks or only certain addresses/ports, enforced on the firewall and valid even if the `.conf` on the device is changed; QR code + `.conf` per device, which can be retrieved again at any time; all traffic / selected internal networks only; if no internal network is selected, **internet only**: the device only goes out with this site's internet IP and cannot reach the internal networks or the firewall) and **site to site** (selected local networks ⇄ remote networks; if the other side has no key, Inversa Panel generates one and gives a ready configuration). The internal networks each connection can reach and the VPN IP block (e.g. 10.70.0.0/24, checked for overlap; when it changes the devices are renumbered) are chosen separately. | IPsec: one connection (`inversapanel-…`) under VPN › IPsec › Connections + one child per pair of networks + a pre-shared key; UDP 500/4500 and ESP allowed on WAN, selected networks allowed from the tunnel (enc0). WireGuard: one instance per connection (`inversapanel-…`) + peers; WAN allow rule, allow to the selected networks (in full mode a block to the other internal networks), NAT as automatic rules |
| Devices › Devices | Device list (with a column for **which network** each device is on; sortable and searchable by network), giving a name/type, cutting the internet with one click, fixed IP (DHCP reservation); **new device approval**: on networks that ask for approval the waiting devices are at the top of the list, with an "Approve" button | `inversapanel_blocked` MAC alias + automatic block rule; fixed IPs as Dnsmasq › Hosts entries; approved devices in the `inversapanel_approved` MAC alias (it exists only while a network asks for approval) |
| Devices › Schedules | Cutting a device's internet or blocking apps in a day/hour range; evaluated every minute | pf table `inversapanel_sched`, one Unbound policy per schedule `Inversa Panel schedule: …` |
| Security › Categories and apps | Categories, 12 apps, safe search, DNS enforcement | Unbound policy `Inversa Panel (managed)`, automatic rdr rule |
| Security › Allow / block list | Domains that are always allowed and always blocked | The same Unbound policy (allow list / wildcard domains) |
| Security › Countries | Two modes: **block the chosen countries** (incoming only / in and out) or **allow only the chosen countries** (e.g. only Türkiye and Azerbaijan; restricts incoming connections only, going out from inside is not affected). Each mode keeps its own list of countries. The **VPN connections are exempt** option (off by default), the number of blocked attempts. Country data is taken from **DB-IP Lite** (CC BY 4.0) without registration and refreshed once a month; those who want to can use their own MaxMind key | GeoIP alias `inversapanel_geo` + automatic rule; in allow mode also `inversapanel_geo_allow` (the chosen countries + private/local address ranges that belong to no country); if no source is configured in OPNsense the country files are written under `/usr/local/share/GeoIP/alias` |
| Logs | **Attacks**: attack protection alerts, what the country restriction stopped and connections the firewall refused, in one list (source address and country, target, result; the addresses / countries / targets with the most attempts; blocking an address from its row), 30 days. **Internet history**: domains visited and blocked per device; off by default, chosen per network, read from Unbound's query log (OPNsense keeps the last 7 days). **Access and changes**: VPN connections, logins to the panel and failed attempts, new devices, setting changes (who, from where, from which page), 90 days. Search, period/kind filters and CSV on every page | Once a minute it reads from the firewall, Suricata and audit logs and writes under `/var/db/inversapanel`; adds the log option to the country rule; a block rule on WAN for blocked addresses |
| Settings › Notifications | Telegram notifications: bot token, chat ("Find the chat" lists who wrote to the bot), what to tell (new devices, attack alerts, VPN connections, internet connection, failed logins, a new version of the panel: off by default, asks GitHub once a day), test message. Events are collected once a minute and sent as one message; a message that could not be sent waits up to 6 hours. Only sends, takes no commands | `notify` section of the `OPNsense/InversaPanel` model (stored with "Save", not with "Apply"); state in `/var/db/inversapanel/notify_state.json` |
| Settings › Existing settings | What was set up in OPNsense before the panel, in three groups: what can cause problems (another DHCP server, blocklists set up in OPNsense, Unbound switched off, intrusion detection that already runs, Zenarmor, traffic shaper rules, multi-WAN, CARP), what the panel uses as it is (networks, fixed addresses, simple port forwards, local names) and what stays on OPNsense's pages (firewall rules, NAT, WireGuard / IPsec / OpenVPN connections, complex port forwards). Each finding says what it means. **Take over**: local names made in OPNsense become editable on the DNS page | Only reads. "Take over" sets the description of the Unbound host overrides to `Inversa Panel (managed)` |
| Settings › About | The installed version and the OPNsense version, licence and source code, Inversa Bilişim contact details, a "support information" summary that holds no passwords/keys (can be copied), the open source software the panel is built on. **Check for an update** asks GitHub for the latest release when pressed; a newer one can be installed from the page | Read-only, except the update: it copies the configuration and the panel's records to `/var/db/inversapanel-update/backup`, installs the package with `pkg add`, checks version, settings and records and puts back what is missing |
| Security › Attack protection | Checks the traffic on the protected networks with Suricata against known traces of attacks and malware: **alert only** or **block**; five groups (malware and command servers, known attacker addresses, exploits of vulnerabilities, phishing, scans); the latest alerts are listed with the device name | OPNsense's Intrusion Detection settings (Services › Intrusion Detection): the selected rulesets, the `Inversa Panel (managed)` policy for blocking, a nightly rule update job |
| Settings | Language, protected networks, answer for blocked domains, DNS statistics, **Remove what Inversa Panel added** | `OPNsense/InversaPanel` model |

**How it works**
- Settings are first kept in a draft; they are counted in the bar in the header, can be seen one by one and reverted with **Show changes**, and are written in one go with **Apply**.
- Port forwarding and adding/deleting a VPN device take effect immediately (as in OPNsense).
- **Network changes** (WAN, adding/deleting a network, address) are applied with their own button and have **rollback protection**: a backup of the configuration is taken before the change; unless it is confirmed with "It works, keep it" within 90 seconds, OPNsense restores the old configuration by itself.
- The same protection also applies to two risky changes written with **Apply**: tightening the "allow only the chosen countries" restriction (switching it on, removing a country from the list, switching off the VPN exemption) and changing the DNS servers. The confirmation bar is visible whichever page you are on; no new "Apply" is accepted while a confirmation is pending. On a restore, everything written with that "Apply" is rolled back.

## Folder layout

```
os-inversa-panel/                       same layout as a plugin folder in the opnsense/plugins repository
  Makefile, pkg-descr
  src/etc/inc/plugins.inc.d/inversapanel.inc        automatic firewall rules (inversapanel_firewall)
  src/opnsense/mvc/app/models/OPNsense/InversaPanel model (InversaPanel.xml), menu, ACL
  src/opnsense/mvc/app/library/OPNsense/InversaPanel Catalog, Integration (Apply), Network, Rollback, PortForward, Vpn (WireGuard), Ipsec (site to site), Ips (Suricata), Dns (local names, DNS servers), Overview (overview, events), Scan (existing settings), Approval (new devices), Extras (GeoIP, speed limit)
  src/opnsense/mvc/app/controllers/OPNsense/InversaPanel  page + API (state, devices, dashboard, service, network, portforward, vpn, geo, ips, logs)
  src/opnsense/mvc/app/views/OPNsense/InversaPanel  index.volt
  src/opnsense/www/js/inversapanel/app.js           core: state, draft, list of changes, menu and sub pages, confirmation countdown
  src/opnsense/www/js/inversapanel/views/*.js       the net (Internet connection, Local networks, Physical ports), sched, pf, vpn, geo, ips, dns, logs (Logs), notify (Notifications), scan (Existing settings), about (About) pages
  src/opnsense/www/js/inversapanel/i18n/{tr,en,de,fr,es,it}.js  language files
  src/opnsense/www/css/inversapanel/inversapanel.css
  src/opnsense/scripts/OPNsense/InversaPanel        hosts.py, killstates.py, dnsbl.sh, ips.sh, schedule.php, watch.php, logs.py and notify.py (every minute), update.py (update from GitHub, on request), rollback.php, nettest.py, dnscheck.py, geoip_dbip.py
  src/opnsense/service/conf/actions.d/actions_inversapanel.conf
tools/deploy.sh, tools/remove.sh             copy to / remove from the test device
```

### API

| Endpoint | Description |
|---|---|
| `GET /api/inversapanel/state/get` | All Inversa Panel settings and options |
| `GET /api/inversapanel/devices/list` | Devices seen and registered devices |
| `GET /api/inversapanel/dashboard/traffic` | WAN byte counters (the speed is calculated in the browser) |
| `GET /api/inversapanel/dashboard/dns` | DNS totals, most blocked domains |
| `GET /api/inversapanel/dashboard/overview` | The rest of the overview: internet connection, networks, VPN status, attack alerts, daily usage, events, system |
| `POST /api/inversapanel/update/check`, `POST …/install`, `GET …/status` | Update from the GitHub releases: what is installed and what is the latest, start the update in the background, how it goes or went |
| `GET /api/inversapanel/notify/get`, `POST …/set`, `POST …/test`, `POST …/chats` | Telegram notifications: settings (the bot token is never returned), test message, chats that wrote to the bot |
| `GET /api/inversapanel/state/scan`, `POST /api/inversapanel/service/adoptdns` | Existing settings: what was set up in OPNsense before the panel (read only); take over the local names made in OPNsense |
| `GET /api/inversapanel/state/about` | The installed version and the OPNsense version it runs on |
| `POST /api/inversapanel/service/apply` | Save and apply the draft (requires full administrator rights). If the response contains `confirm`, the change must be confirmed with `network/confirm` within that many seconds, otherwise it is rolled back |
| `POST /api/inversapanel/service/language` | Save the interface language immediately |
| `POST /api/inversapanel/service/cleanup` | Remove what Inversa Panel added, switch Inversa Panel off |
| `GET /api/inversapanel/network/get`, `POST …/apply`, `POST …/confirm`, `GET …/test`, `GET …/extip` | Network status, change with rollback protection, confirmation, connection test |
| `GET /api/inversapanel/portforward/list`, `POST …/add`, `…/toggle/{uuid}`, `…/del/{uuid}` | Port forwarding |
| `GET /api/inversapanel/vpn/status`, `POST …/create`, `…/update/{uuid}`, `…/delete/{uuid}`, `…/peeradd/{conn}`, `GET …/peerconfig/{conn}/{peer}`, `POST …/peerrenew/{conn}/{peer}`, `…/peertoggle/{conn}/{peer}`, `…/peerdel/{conn}/{peer}`, `…/peeraddress/{conn}/{peer}`, `…/peeraccess/{conn}/{peer}`, `GET …/ipsecconfig/{conn}` | WireGuard VPN connections and devices (including address and access per device); the settings of an IPsec connection to enter on the other side (including the shared key) |
| `GET /api/inversapanel/geo/status` | GeoIP database status, whether there is data for the allowed countries, number of blocked attempts |
| `GET /api/inversapanel/ips/status`, `POST …/start` | Suricata status, memory usage, whether blocking is possible on this hardware, latest alerts; restart if it is not running |
| `GET /api/inversapanel/logs/attacks`, `…/history`, `…/events` (with `limit`, `offset`, `q`, period and kind parameters), `POST …/historyset`, `POST …/block` | Logs: attacks, internet history, access and changes; the internet history setting; blocking / unblocking an address |

## Testing on Proxmox

1. Install an OPNsense 26.7 virtual machine on Proxmox. It needs at least two network cards: WAN and LAN.
2. Connect a test client (virtual machine or container) to the LAN side.
3. In OPNsense, enable SSH under **System › Settings › Administration** and permit root login with a key.
4. Recommended: enable host discovery (Hostwatch) under **Interfaces › Neighbors › Discovery Settings**. If it is off, the device list is taken from the ARP table.
5. Install from here:
   ```sh
   tools/deploy.sh root@<opnsense-ip>
   ```
6. Open `https://<opnsense-ip>/ui/inversapanel` in the browser (**Inversa › Overview** in the menu).

### Checklist
- [ ] The test client shows on the Devices tab.
- [ ] Cut internet + Apply: the client cannot reach the internet but can reach OPNsense (DNS, interface). Under **Firewall › Aliases**, `inversapanel_blocked` contains the client's MAC address.
- [ ] Ads category + Apply: under **Services › Unbound DNS › Blocklists** there is an `Inversa Panel (managed)` policy; `ad.ae.doubleclick.net` returns 0.0.0.0. (To avoid breakage, the hagezi NORMAL list does not block `doubleclick.net` itself.)
- [ ] TikTok + Apply: `tiktok.com` is blocked. For domains that were queried before, the block takes effect within **1-2 minutes** (Unbound's blocking module re-reads the list once a minute; the DNS cache is flushed afterwards).
- [ ] Enforce DNS + Apply: even if the client runs `dig @8.8.8.8 tiktok.com`, the answer comes from OPNsense (0.0.0.0).
- [ ] Overview: the WAN speed and chart update every few seconds; the number of blocked requests goes up.
- [ ] Switching the language TR/EN changes all texts.
- [ ] Network & Internet › DNS: `nas.ev.lan` → the client's IP + Apply: on the client `getent hosts nas.ev.lan` returns that address. For `ornek.test` added with "Including subdomains", `www.ornek.test` goes to the same address too.
- [ ] Quad9 as DNS server + encrypted DNS + Apply: the confirmation bar appears; `unbound-control -c /var/unbound/unbound.conf list_forwards` shows the two Quad9 addresses. Without confirmation the list is empty after 90 seconds (automatic).
- [ ] VPN › New VPN connection › Site to site › IPsec: after entering the remote address and remote network and creating it, there is an `inversapanel-…` connection under **VPN › IPsec › Connections**; once the "Settings for the other side" list is entered on the other device the status becomes "Connected" and the two networks can ping each other (`swanctl --list-sas`).
- [ ] Security › Countries: "Allow only the countries I choose" + TR + Apply: `pfctl -sr | grep geo_allow` shows the rule; `pfctl -t inversapanel_geo_allow -T test 8.8.8.8` does not match, an address in Türkiye and `192.168.1.1` match; the client can still open foreign sites.

### Troubleshooting
- The page does not open or the menu does not show: `rm -f /tmp/opnsense_menu_cache.xml /tmp/opnsense_acl_cache.json /var/lib/php/tmp/opnsense_menu_cache.xml /var/lib/php/tmp/opnsense_acl_cache.json`
- API errors: **System › Log Files › Web GUI**, `/var/log/configd/latest.log`
- Generated rules: `pfctl -sr | grep -i inversapanel` and `grep -i inversapanel /tmp/rules.debug` (pfctl shows the DNS port as "domain")
- On OPNsense root's shell is `csh`; when running `sh` commands over SSH use `ssh root@firewall /bin/sh -s <<'EOF' ... EOF`.
- If the test network's WAN is inside the home network (e.g. 192.168.1.0/24), **disable reply-to** on the management rule; otherwise replies go back through the modem and SSH/GUI connections drop.

## Known limits and what was not tested (1.0)

- **IPsec site to site:** IKEv2, shared key and IPv4 only; the cipher suite is fixed (AES-256, SHA-256, DH 14) and cannot be changed from the interface. Each pair of networks is a separate child. The identity of this side is the "Address of this side" field (if empty, the WAN address at the time of creation), the identity of the other side is the address entered for it; if the other device sends a different value as its own identity, these values have to be set there. There is no transit between branches (branch A reaching branch B through the main site). IPsec tunnels set up by hand in OPNsense are only listed by name. Tried between two OPNsense 26.7.8 installations (tunnel established, traffic passed in both directions, disable/enable/delete); **not tried with devices of other vendors (FortiGate, MikroTik, Sophos, Zyxel…)**. A setup behind a modem (NAT) was not tried either.
- **Network types are gone (in earlier versions: Home, IoT, Guest, Cameras, Servers).** Every network has a colour; the old type is converted to a colour, the shared speed limit of the guest networks becomes the own limit of those networks, and a network that was closed off from all networks counts as "isolated". This migration is done once, the first time the panel is opened. Isolation is two-way (mutual access with the selected network); a one-way rule is given in the access table. A new network is created isolated. The speed limit is for the network as a whole, not per device.
- **The external IP** is only asked for when the button is pressed: the firewall connects to `https://1.1.1.1/cdn-cgi/trace` (Cloudflare). Changing the **MAC address** was not tested (it would have changed the address of the test box); setting and clearing the MTU was tried. IPv6 over PPPoE and showing the PPPoE connection time are missing/not tried.
- **Not tested with a real device:** PPPoE (there is no PPPoE server in the test environment), the WireGuard handshake (with a phone), UPnP. Configuration generation, the interface and the rules were verified.
- Port assignments are display-only for now; the internet port is chosen in the WAN settings, a network's port when adding the network. Changing the port of an existing network is done in the OPNsense menus.
- App blocking is DNS based; the "VPN, proxy and encrypted DNS" category and "Enforce DNS" should be switched on together.
- Refreshing the blocklists is heavy work (~1 GB of memory with large lists, on top of Unbound's own usage; see [Memory requirements](../README.md#memory)); Inversa Panel runs only one at a time, new requests are queued.
- The blocklists are only refreshed when the DNS blocking settings change; pressing "Apply" for another setting does not start a refresh.
- **Attack protection:** Suricata listens on the protected (internal) networks, not on the internet side: the alerts show which device triggered them, and only traffic that passes through the firewall is inspected. The content of encrypted (HTTPS) traffic is not seen. Blocking mode is OPNsense's netmap (IPS) mode: it is not offered on aggregated ports (LAGG), bridges and virtual interfaces, or while hardware offloading (CRC, TSO, LRO) is on. Alerting and blocking were tried on an untagged LAN with a virtual network card (vtnet); **blocking was not tested on traffic over a VLAN or on real network cards**. If Suricata is restarted while blocking is on (a setting change), the inspected network card drops for a short time.
- If another GeoIP source (MaxMind, ipinfo) is configured in OPNsense, that one is used for the country data; Inversa Panel writes the DB-IP data only when no source is configured.
- **"Allow only the chosen countries"** only restricts connections coming in from the internet (port forwarding, VPN, management from outside). Until the country data has been downloaded, and while there is no address data for any allowed country, the restriction is **not applied** (otherwise the whole internet would be shut out); the page says so. Private network ranges (10/8, 172.16/12, 192.168/16), carrier-grade NAT (100.64/10), link-local and multicast addresses are always allowed. The rule and table contents, the rollback of an unconfirmed change and going out from inside were tested; **a connection attempt from a real foreign address was not tested** (table membership was verified with `pfctl -T test`). The counter of blocked attempts comes from a cache of up to 5 minutes on the OPNsense side.
- Changing the **DNS server** and adding/deleting a local name record restart Unbound (about 2 seconds on the test installation, without losing queries). Local records only work on devices that use the firewall as their DNS server. If the certificate name is left empty for encrypted DNS with an own server, Unbound does not verify the server's identity. The preset providers are added with their IPv4 addresses only.
- The "Connections" column is the current number of pf states, not the amount of traffic.
- **New device approval** is enforced on the firewall: an unapproved device cannot reach the internet or other networks, it only reaches the firewall itself (DHCP, DNS, management interface). Direct access between devices on the same switch or the same Wi-Fi does not pass through the firewall and therefore cannot be blocked (that needs client isolation on the access point or 802.1X). Approval goes by MAC address (a MAC can be spoofed); the addresses are refreshed once a minute by OPNsense's MAC alias mechanism, so when an approved device gets a new IP its access opens within one minute at the latest. When approval is first switched on, the devices seen up to that moment count as approved.

## Adding a language

1. Copy the file `www/js/inversapanel/i18n/en.js` (e.g. to `de.js`). Change it to `window.InversaPanelI18n.de = {...}` and translate the texts.
2. Add a `<script>` line to `index.volt`, and the path of the file to the `ASSETS` list in `IndexController.php`.
3. Add `<de>Deutsch</de>` to the `language` options in `InversaPanel.xml`.

A text that is missing in a language file is shown in English.

## Building as a package

Run `tools/build-pkg.sh` on FreeBSD or on an OPNsense box, from a checkout of this repository; the package ends up in `dist/`. The script fetches the build files of `opnsense/plugins` and runs `make package`. Every push builds the package on GitHub as well, and a tag `v<version>` publishes it as a release (`.github/workflows/package.yml`).
