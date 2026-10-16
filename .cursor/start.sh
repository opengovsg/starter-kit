#!/usr/bin/env bash
# Cloud Agent start phase: per-boot reconciliation. Brings up PostgreSQL and
# Redis and syncs the Prisma schema to the database. Idempotent and returns
# once the environment is ready (the dev server itself runs as a terminal).
set -euo pipefail

cd "$(dirname "$0")/.."

export NVM_DIR="${NVM_DIR:-$HOME/.nvm}"
# shellcheck disable=SC1091
[ -s "${NVM_DIR}/nvm.sh" ] && . "${NVM_DIR}/nvm.sh"
nvm use >/dev/null 2>&1 || nvm use 24.13.0 >/dev/null 2>&1 || true
corepack enable >/dev/null 2>&1 || true

# Start PostgreSQL + Redis on the ports the app expects (see .env.example).
bash .cursor/services.sh

# Apply the Prisma schema to the database. `prisma db push` is idempotent and
# fast; running it on boot guarantees the schema exists even on a fresh volume.
# Invoke the package script directly rather than `pnpm db:push`, whose Turbo task
# is flagged interactive (TUI) and cannot run in a non-interactive boot shell.
echo "[start] Syncing Prisma schema to database"
corepack pnpm --filter @acme/db push

echo "[start] Environment ready"
