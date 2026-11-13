# Changelog

## 1.6.1 (2026-11-13)

- German, French, Spanish and Italian: the 178 texts added since 1.1.0 (notifications, existing settings, backup, updates, the setup wizard, approval from the phone, what is new, ...) are translated, so nothing shows in English any more in these languages. They are machine translations like the rest of these four languages; corrections are welcome.

## 1.6.0 (2026-11-13)

- **Settings › Updates**, a new page for both updates. Inversa Panel: check and install, as before on the About page (About now links there). OPNsense: check runs OPNsense's own check and shows the new version, the packages that change, the download size and whether a restart follows; **Update** starts OPNsense's own update, shows its log, and after a restart the page waits until the firewall answers again and loads itself. A major upgrade is only told; it stays on OPNsense's own page. The "update ready" spots on the overview open this page.
- **What is new**: after the panel was updated, the overview shows the news of the new version once ("Got it" closes it for every browser); Settings › Updates lists the news of the last versions. Fresh installations do not get the card.
- **Setup wizard** on first start, in six steps: language and the page after logging in, the networks to protect, the protections (recommended ones proposed), approval of new devices per network, Telegram notifications (the notifications page itself), and a summary. The choices are applied in one go at the end, with the usual "Apply"; nothing changes on the firewall before that. It can be closed at any time and run again from Settings › Setup wizard. The welcome card on the overview now starts it.
- New tagline under the logo: "As simple as a modem, as powerful as OPNsense" (in all six languages).

## 1.5.0 (2026-11-13)

- Devices: a device waiting for approval can be **allowed for 1 hour, 1 day, 1 week, until midnight or until a time chosen on a calendar** (at most 30 days ahead). It takes effect right away (no "Apply"); when the time is up the device waits again, and the notification about a waiting device is sent again. The list shows until when a device is allowed.
- Devices: **Turn away** a waiting device. It stays held back as before, is no longer counted as waiting and is not announced again. Approving it later works as usual.
- **Phone screen**: opened on a phone while devices wait for approval, the panel shows only those devices, each with these choices, "For good" and "Turn away"; "Open the full panel" goes on to the panel. Together with "Open Inversa Panel after logging in" and a VPN connection, a notification about a new device can be answered from a phone in a few taps.
- Devices: **Delete device**. Its name, approval, fixed IP, place in schedules and a pause are removed and it drops out of the list. A device that comes back afterwards is a new device: it is told again and, on a network that asks, waits for approval again.
- Notifications: a new device is told within seconds instead of one to three minutes: new devices are looked for every 15 seconds and the message goes out right away.

## 1.4.1 (2026-11-12)

- Settings: **Open Inversa Panel after logging in**, off by default. It applies to the user who switches it on (OPNsense's own "Landing page" of that user) and takes effect at the next login. A page the user chose in OPNsense is replaced only when the switch is turned on.
- The protection status and the language moved from the header to the end of the menu row, where the language box is lower; a **Log out** link stands beside them.
- Removing the package clears that setting for the users who had it, so that nobody lands on a page that is gone.

## 1.4.0 (2026-11-12)

- Devices: **Pause for a while**. A device can be cut off for 30 minutes, an hour, two hours or until 07:00; it takes effect right away and the internet comes back by itself. "Resume" ends it earlier. The list shows until when a device is paused.
- Devices: on a network that asks for approval of new devices, the permission to be on the network is the second half of the network badge in the list: "Allowed" (click to remove it) or "Approve" for a device that waits.
- Devices: **Wake up** for a device that is off (Wake-on-LAN); the device must have that enabled.
- Internet connection: **Speed test**. Download, upload and latency, measured from the firewall itself against Cloudflare's speed test servers when the button is pressed. Cloudflare refuses tests made in a row for a while (about an hour after three tests on a fast line); the page then says how long to wait.
- Health of the firewall: a disk that is 90% full, a processor at 85 °C or more and an OPNsense update that waits are events (overview, logs); the first two also show under "needs attention". Settings › Notifications has a switch for them, on by default.
- Nothing on the page moves down any more when a message appears: the header keeps room for "unsaved changes", and "devices are waiting for approval" stands beside the pages of Devices instead of above the list. The text of the unsaved-changes box no longer runs under its buttons.
- Settings › Backup, a new page: download the OPNsense configuration (the panel's settings are part of it), put a backup back from a file, and the copies the firewall takes every night at 03:15 when the configuration changed (the last 7 are kept; each can be downloaded or put back).
- Putting a configuration back restarts the firewall; the page says so, asks first and loads again when the firewall is back.
- The texts are in Turkish and English; in the other languages they show in English for now.

## 1.3.3 (2026-11-12)

- Settings › About: the e-mail address is a link in the same type as the other rows; the list of the software the panel is built on takes less room.

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
