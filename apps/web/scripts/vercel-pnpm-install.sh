#!/usr/bin/env bash
set -euo pipefail

repo_root="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
cd "${repo_root}"

source apps/web/scripts/vercel-pnpm-env.sh
pnpm install --frozen-lockfile
