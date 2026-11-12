# Security

Inversa Panel runs on a firewall and its backend scripts run as root, so we take problems in it seriously.

## Reporting a problem

Write to **yazilim@inversa.com.tr** instead of opening a public issue. English or Turkish. Please include the version (*Settings › About*), what an attacker needs (access to the local network, a login, nothing) and how to reproduce it.

We fix security problems in the latest release only; the installation command in the README always installs it.

## What to know before installing

- The package contains PHP, JavaScript, Python and shell scripts; nothing is compiled. It is built from the tagged source by the workflow in `.github/workflows/package.yml`.
- The panel is not in OPNsense's official plugin repository and has not been reviewed by a third party.
- It contacts these outside addresses, each for a feature: `1.1.1.1/cdn-cgi/trace` (shows the public address of the internet connection), `download.db-ip.com` (country database, when country blocking is on) `download.maxmind.com` (only with your own key) and `api.telegram.org` (only while Telegram notifications are switched on; the messages hold device names, MAC and IP addresses, and the firewall takes no commands from Telegram). Blocklists and Suricata rules are fetched by OPNsense itself. Nothing is sent to Inversa.
- Access to the page and its API follows OPNsense's own users and privileges.
