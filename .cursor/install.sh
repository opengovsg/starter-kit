#!/usr/bin/env bash
# Cloud Agent install phase: prepare durable, source-derived state for the
# Starter Kit monorepo. Runs after the repository is checked out. Must be
# idempotent and must terminate (no long-running processes here).
set -euo pipefail

cd "$(dirname "$0")/.."

# Use the Node version pinned by the repo (.nvmrc / package.json engines).
export NVM_DIR="${NVM_DIR:-$HOME/.nvm}"
# shellcheck disable=SC1091
[ -s "${NVM_DIR}/nvm.sh" ] && . "${NVM_DIR}/nvm.sh"
nvm use >/dev/null 2>&1 || nvm use 24.13.0 >/dev/null 2>&1 || true
corepack enable >/dev/null 2>&1 || true

echo "[install] node $(node -v) / pnpm $(corepack pnpm -v)"

# Create the local .env from the committed template on first run. SESSION_SECRET
# must be >= 32 chars (validated by apps/web/src/env.ts); generate a random one.
if [ ! -f .env ]; then
  echo "[install] Creating .env from .env.example"
  SECRET="$(node -e "console.log(require('crypto').randomUUID()+require('crypto').randomUUID())")"
  sed "s|SESSION_SECRET='please-generate-a-secret-and-put-it-here'|SESSION_SECRET='${SECRET}'|" \
    .env.example >.env
fi

echo "[install] Installing workspace dependencies"
corepack pnpm install --frozen-lockfile

# Generate the Prisma client + Kysely types. This is source-derived and needs
# no database connection, so it belongs in install (not start).
echo "[install] Generating Prisma client"
corepack pnpm -F @acme/db generate

echo "[install] Done"
