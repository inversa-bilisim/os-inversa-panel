# Changelog

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
