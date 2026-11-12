# Security

Inversa Panel runs on a firewall and its backend scripts run as root, so we take problems in it seriously.

## Reporting a problem

Write to **yazilim@inversa.com.tr** instead of opening a public issue. English or Turkish. Please include the version (*Settings › About*), what an attacker needs (access to the local network, a login, nothing) and how to reproduce it.

We fix security problems in the latest release only; the installation command in the README always installs it.

## What to know before installing

- The package contains PHP, JavaScript, Python and shell scripts; nothing is compiled. It is built from the tagged source by the workflow in `.github/workflows/package.yml`.
- The panel is not in OPNsense's official plugin repository and has not been reviewed by a third party.
- It contacts these outside addresses, each for a feature: `1.1.1.1/cdn-cgi/trace` (shows the public address of the internet connection), `speed.cloudflare.com` (the speed test, only when its button is pressed), `download.db-ip.com` (country database, when country blocking is on) `download.maxmind.com` (only with your own key) and `api.telegram.org` (only while Telegram notifications are switched on; the messages hold device names, MAC and IP addresses, and the firewall takes no commands from Telegram). `api.github.com` and `github.com` are contacted only when you press "Check for an update" or the update button on the About page; the panel does not look for updates by itself, unless you switch on "New version" under Settings › Notifications: then `api.github.com` is asked once a day and a new version is announced by Telegram, never installed. Blocklists and Suricata rules are fetched by OPNsense itself. Nothing is sent to Inversa.
- The update button installs the package of the latest release from GitHub as root. The package is not signed: its checksum is compared with the one GitHub publishes for the release, which catches a broken download, not a taken-over account. That is the same trust as the install command in the README.
- The Backup page downloads the whole OPNsense configuration, which holds password hashes and VPN keys; whoever may open the panel may download it. The nightly copies are kept in `/var/db/inversapanel-backup`, readable by root only, and stay there when the package is removed.
- Access to the page and its API follows OPNsense's own users and privileges.
