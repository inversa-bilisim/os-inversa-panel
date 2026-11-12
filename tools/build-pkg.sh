#!/bin/sh
#
# Build the package. Run on FreeBSD or on an OPNsense box, from a checkout of this repository:
#
#   tools/build-pkg.sh [commit hash]
#
# The package ends up in dist/. The build files (Mk, Scripts, Templates, Keywords) come from
# opnsense/plugins; nothing is compiled, the package holds the files under os-inversa-panel/src.

set -eu

BRANCH="${PLUGINS_BRANCH:-stable/26.7}"
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
HASH="${1:-$(git -C "${ROOT}" rev-parse --short=9 HEAD 2> /dev/null || echo unknown)}"
WORK="$(mktemp -d -t inversapanel-build)"
trap 'rm -rf "${WORK}"' EXIT

echo ">> fetching the build files of opnsense/plugins (${BRANCH})"
fetch -q -o "${WORK}/plugins.tar.gz" "https://github.com/opnsense/plugins/archive/refs/heads/${BRANCH}.tar.gz"
mkdir -p "${WORK}/plugins/security"
tar -C "${WORK}/plugins" --strip-components 1 -xf "${WORK}/plugins.tar.gz" \
    '*/Mk' '*/Scripts' '*/Templates' '*/Keywords'

cp -Rp "${ROOT}/os-inversa-panel" "${WORK}/plugins/security/inversa-panel"
find "${WORK}/plugins/security/inversa-panel" -name __pycache__ -type d -prune -exec rm -rf {} +
chmod 0755 "${WORK}/plugins/security/inversa-panel/src/opnsense/scripts/OPNsense/InversaPanel/"*

echo ">> building"
make -C "${WORK}/plugins/security/inversa-panel" PLUGIN_HASH="${HASH}" package

mkdir -p "${ROOT}/dist"
cp "${WORK}/plugins/security/inversa-panel/work/pkg/"*.pkg "${ROOT}/dist/"
echo ">> done:"
ls -l "${ROOT}/dist/"*.pkg
