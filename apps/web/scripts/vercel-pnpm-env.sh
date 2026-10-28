#!/usr/bin/env bash
set -euo pipefail

export PNPM_HOME="${HOME}/.local/share/pnpm"

if [[ ! -x "${PNPM_HOME}/bin/pnpm" ]]; then
  curl -fsSL https://get.pnpm.io/install.sh | env PNPM_VERSION=12.0.0 SHELL=bash sh -
fi

# Vercel prepends a broken npm-package placeholder at
# $PNPM_HOME/.tools/pnpm/<version>/bin/pnpm. Prefer the standalone binary.
export PATH="${PNPM_HOME}/bin:$(
  echo "${PATH}" | tr ':' '\n' | grep -v '/\.tools/pnpm/' | paste -sd:
)"

if ! pnpm --version >/dev/null 2>&1; then
  echo "pnpm bootstrap failed (pnpm at $(command -v pnpm || echo missing))" >&2
  exit 1
fi
