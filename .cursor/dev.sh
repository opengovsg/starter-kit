#!/usr/bin/env bash
# Long-running Next.js dev server (Turborepo watch mode). Runs as a Cloud Agent
# terminal so its logs stay visible. Uses stream output rather than the Turbo
# TUI so logs render cleanly in a non-attached terminal.
set -euo pipefail

cd "$(dirname "$0")/.."

export NVM_DIR="${NVM_DIR:-$HOME/.nvm}"
# shellcheck disable=SC1091
[ -s "${NVM_DIR}/nvm.sh" ] && . "${NVM_DIR}/nvm.sh"
nvm use >/dev/null 2>&1 || nvm use 24.13.0 >/dev/null 2>&1 || true
corepack enable >/dev/null 2>&1 || true

export TURBO_UI=false
exec corepack pnpm dev
