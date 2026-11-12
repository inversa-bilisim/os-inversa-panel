# Changelog

## 1.3.2 (2026-11-12)

- Settings › About: what the update check and the update say ("up to date", "updated", an error) shows at the top of the page and goes after ten seconds. A new version stays in the card with its notes and its button; so does a warning about something that was put back or could not be checked.
- The left block of the About page is narrower.

## 1.3.1 (2026-11-12)

- Settings › About, rearranged: on the left the version with the update check beside it, web site, e-mail, licence, source code and where to report; one button copies the support information and shows what was copied. On the right who makes the panel and what it is built on.
- The software the panel is built on is listed with the installed versions (OPNsense, Unbound, Suricata, WireGuard, strongSwan; the month of the DB-IP country data).

## 1.3.0 (2026-11-12)

- Settings › About: **Check for an update** asks GitHub for the latest release, only when the button is pressed. A newer version is shown with its release notes and can be installed with one more button.
- Before the installation the OPNsense configuration and the panel's records are copied to `/var/db/inversapanel-update/backup`. The checksum of the downloaded package is compared with the one GitHub publishes; a package that does not match is not installed.
- After the installation the page says what was checked: the installed version, every setting of the panel that was there before, the panel's records, and that the new code loads. What is missing is put back from the backup.
- Settings › Notifications: a new switch, **New version**, off by default. When it is on, GitHub is asked once a day and a new version is announced by Telegram, once per version; installing it stays with you.
- Versions up to 1.2.0 have no such button: update them once more with the install command.
- The texts are in Turkish and English; in the other languages they show in English for now.

## 1.2.0 (2026-11-12)

- Settings › Notifications: a Telegram bot tells a chat what happened: a new device, attack alerts, VPN connections, the internet connection going down and coming back, failed logins. Events are collected once a minute and sent as one message; a message that could not be sent is kept and sent later. The firewall only sends, it takes no commands from Telegram.
- A device seen for the first time on a protected network is recorded as an event (overview, logs), also on networks without approval of new devices.
- While notifications are on, the firewall connects to `api.telegram.org`.
- The texts of the Notifications page are in Turkish and English; in the other languages they show in English for now.
- Port forwarding: the outer and the inner port are side by side and the inner port follows the outer one, selected when you get to it. The list of known ports and a new list of the devices on the network work with the arrow keys and Enter, and close on Escape or a click elsewhere; an address that is not in the list can be typed. Moving through the form with Tab no longer loses the cursor.
- Existing settings: the firewall rules made in OPNsense are listed one by one (interface, action, description), with a link to OPNsense's own page.
- Internet connection: the Advanced card can be closed again.

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
