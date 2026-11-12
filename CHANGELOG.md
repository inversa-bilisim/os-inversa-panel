# Changelog

## 1.2.0 (2026-11-12)

- Settings › Notifications: a Telegram bot tells a chat what happened: a new device, attack alerts, VPN connections, the internet connection going down and coming back, failed logins. Events are collected once a minute and sent as one message; a message that could not be sent is kept and sent later. The firewall only sends, it takes no commands from Telegram.
- A device seen for the first time on a protected network is recorded as an event (overview, logs), also on networks without approval of new devices.
- While notifications are on, the firewall connects to `api.telegram.org`.
- The texts of the Notifications page are in Turkish and English; in the other languages they show in English for now.

## 1.1.1 (2026-11-12)

- The panel's entries in OPNsense's side menu follow the language chosen in the panel; they were always in Turkish. On OPNsense's other pages they show in English.
- Installing, updating and removing the package clear the menu cache where OPNsense 26.7 keeps it.

## 1.1.0 (2026-11-12)

For firewalls that were configured before the panel was installed.

- Settings › Existing settings: lists what was set up in OPNsense before the panel, in three groups: what can cause problems with a feature of the panel, what the panel uses as it is, and what stays on OPNsense's own pages. Each finding says what it means and links to the page concerned. The page only reads.
- Local names made in OPNsense (Unbound overrides) can be taken over, so that they are edited on the panel's DNS page.
- The welcome card links to the page.
- The texts of this page are in Turkish and English; in German, French, Spanish and Italian the explanations show in English for now.

A fresh OPNsense installation is still what we recommend.

## 1.0.0 (2026-11-12)

First release, as a package for OPNsense 26.7.

- Overview: what needs attention, every protection at a glance, networks, VPN, events and system.
- Network & Internet: internet connection (DHCP, PPPoE, static), local networks and VLANs with colour, isolation and speed limit, physical ports, DNS servers and local names, port forwarding. Network changes roll back by themselves after 90 seconds unless confirmed.
- VPN: WireGuard for remote access and site to site, with a QR code and a configuration file per device; IPsec site to site for gateways of other vendors.
- Devices: every device on the network, internet access on or off with one click, fixed addresses, schedules.
- Security: blocking by category and app through DNS, allow and block lists, countries (block, or allow only the chosen ones), attack protection with Suricata.
- Logs: attacks, internet history, access and changes.
- Languages: Turkish, English, German, French, Spanish and Italian.

Install:

```sh
pkg add https://github.com/inversa-bilisim/os-inversa-panel/releases/latest/download/os-inversa-panel.pkg
```
