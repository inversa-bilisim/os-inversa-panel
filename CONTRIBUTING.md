# Contributing to Inversa Panel

Bug reports, test results and pull requests are welcome. Issues can be written in English or Turkish.

## What helps most right now

- **Results on real hardware.** Everything so far was tested on virtual machines. PPPoE on a real line, attack protection in blocking mode on physical network cards and VLANs, and IPsec against other vendors' firewalls are untested.
- **Translation review.** German, French, Spanish and Italian are machine translations. Corrections to `src/opnsense/www/js/inversapanel/i18n/<language>.js` are welcome, and so are new languages (see [Adding a language](docs/reference.md#adding-a-language)).
- **A feature people have asked for** around the approval of new devices: a page a waiting device is sent to where it can ask for access (a Telegram notification when a device is waiting exists since 1.2.0, in `scripts/OPNsense/InversaPanel/notify.py`). The approval logic is in `library/OPNsense/InversaPanel/Approval.php`, the firewall rule in `src/etc/inc/plugins.inc.d/inversapanel.inc`, the approved devices in the alias `inversapanel_approved`.

## Reporting a bug

Open an [issue](https://github.com/inversa-bilisim/os-inversa-panel/issues) with:

- what you did, what you expected and what happened;
- the summary from *Settings › About › Copy support information* (it holds versions and which features are on; no passwords, keys or device addresses);
- whether the firewall was configured before the panel was installed, and what *Settings › Existing settings* lists.

For a security problem, see [SECURITY.md](SECURITY.md); please do not open a public issue.

## How the panel is meant to behave

A change should keep these; they are why the panel can be installed on a working firewall.

1. **No configuration of its own for firewall state.** The panel writes into OPNsense's own models (aliases, Unbound, Dnsmasq, WireGuard, IPsec, intrusion detection, traffic shaper), so everything stays visible and editable on OPNsense's pages. Its own model holds only the choices made in the panel.
2. **Nothing is switched on unasked.** Installing the package and opening the page change nothing.
3. **Everything the panel adds is marked** (`Inversa Panel (managed)` and the names in `Catalog.php`), and it only changes or removes what carries its mark.
4. **What it does not understand is shown read-only**, never simplified or rewritten.
5. **Changes that can lock somebody out roll back** unless confirmed within 90 seconds (`Rollback.php`).
6. **Automatic firewall rules are not written to the configuration**; they come from the plugin hook and end with the package.

## Working on the code

You need an OPNsense 26.7 installation to test on; a virtual machine is enough. Do not develop against a firewall you depend on.

```sh
git clone https://github.com/inversa-bilisim/os-inversa-panel.git
cd os-inversa-panel
tools/deploy.sh root@<test firewall>     # copies the files, checks the PHP syntax, reloads
```

`tools/deploy.sh` needs SSH access as root with a key. `tools/remove.sh` takes the files away again, and `tools/build-pkg.sh`, run on the firewall or on FreeBSD, builds the package. Where things are is listed under [Folder layout](docs/reference.md#folder-layout); the test steps we go through are under [Checklist](docs/reference.md#checklist).

Things that are easy to miss:

- **No build step.** The page is plain JavaScript without a framework or bundler; PHP follows the style of OPNsense's own code.
- **A new page** is a file in `www/js/inversapanel/views/`, and needs a script tag in `views/OPNsense/InversaPanel/index.volt`, an entry in `IndexController::ASSETS` and a place in `MENU` in `app.js`.
- **Every text shown to the user** goes into `i18n/en.js` and `i18n/tr.js`. A text missing in another language is shown in English.
- **A field that is not a password** must not be `type="password"`: browsers fill in the firewall's root password.
- **Heavy jobs** (blocklist refresh, starting Suricata) check free memory and never run side by side; see the memory notes in the README before adding one.
- New files start with the SPDX header the others have.

## Pull requests

- One topic per pull request, with a description of what changes for the user.
- Say what you tested and on what (OPNsense version, virtual or real hardware), and what you could not test. "Not tested" is useful information; please do not leave it out.
- Update `docs/reference.md` when a page writes somewhere new or the API changes, and add a line to `CHANGELOG.md`.
- By contributing you agree that your contribution is licensed under the project's [BSD-2-Clause license](LICENSE).

Questions: open an issue, or write to yazilim@inversa.com.tr.
