#!/usr/bin/env bash
# Bring up the local infrastructure the Starter Kit expects (PostgreSQL + Redis)
# on the ports declared in docker-compose.yml / .env.example, without Docker.
#
# This script is idempotent: it initialises data directories on first run and
# is safe to invoke on every boot. It waits until each service is accepting
# connections before returning so callers can rely on the services being ready.
set -euo pipefail

PG_BIN="/usr/lib/postgresql/16/bin"
STATE_DIR="${HOME}/.local/share/starter-kit"
PGDATA="${STATE_DIR}/pgdata"
PGLOG="${STATE_DIR}/postgres.log"
REDIS_DIR="${STATE_DIR}/redis"
REDIS_LOG="${STATE_DIR}/redis.log"

PG_PORT=54321
PG_USER=root
PG_PASSWORD=root
PG_DB=app

REDIS_PORT=63791

mkdir -p "${STATE_DIR}" "${REDIS_DIR}"

# ---------------------------------------------------------------------------
# Docker daemon (best-effort)
#
# The app itself runs against the native PostgreSQL/Redis started below, but the
# `apps/web` Vitest suite uses testcontainers, which needs a Docker daemon. This
# VM has no systemd, so start dockerd manually with the fuse-overlayfs storage
# driver. Failure here is non-fatal: the app and native services still work.
# ---------------------------------------------------------------------------
if command -v dockerd >/dev/null 2>&1; then
  if ! sudo docker info >/dev/null 2>&1; then
    echo "[services] Starting Docker daemon (for testcontainers)"
    sudo mkdir -p /etc/docker
    echo '{"storage-driver":"fuse-overlayfs"}' | sudo tee /etc/docker/daemon.json >/dev/null
    sudo bash -c 'nohup dockerd >/var/log/dockerd.log 2>&1 &'
    for _ in $(seq 1 30); do
      if sudo docker info >/dev/null 2>&1; then break; fi
      sleep 1
    done
  fi
  # Let the non-root dev user reach the daemon without sudo.
  if [ -S /var/run/docker.sock ]; then
    sudo chmod 666 /var/run/docker.sock || true
  fi
  if sudo docker info >/dev/null 2>&1; then
    echo "[services] Docker daemon is ready"
  else
    echo "[services] WARN: Docker daemon not available; testcontainers tests will be skipped"
  fi
fi

# ---------------------------------------------------------------------------
# PostgreSQL
# ---------------------------------------------------------------------------
if [ ! -s "${PGDATA}/PG_VERSION" ]; then
  echo "[services] Initialising PostgreSQL data directory at ${PGDATA}"
  install -d -m 700 "${PGDATA}"
  PWFILE="$(mktemp)"
  printf '%s' "${PG_PASSWORD}" >"${PWFILE}"
  "${PG_BIN}/initdb" \
    --username="${PG_USER}" \
    --pwfile="${PWFILE}" \
    --auth-local=trust \
    --auth-host=md5 \
    --encoding=UTF8 \
    -D "${PGDATA}" >/dev/null
  rm -f "${PWFILE}"
fi

if ! "${PG_BIN}/pg_ctl" -D "${PGDATA}" status >/dev/null 2>&1; then
  echo "[services] Starting PostgreSQL on port ${PG_PORT}"
  "${PG_BIN}/pg_ctl" -D "${PGDATA}" -l "${PGLOG}" \
    -o "-p ${PG_PORT} -c listen_addresses=localhost -c unix_socket_directories=${STATE_DIR}" \
    -w start
else
  echo "[services] PostgreSQL already running"
fi

# Wait until PostgreSQL is ready to accept connections.
for _ in $(seq 1 30); do
  if "${PG_BIN}/pg_isready" -h localhost -p "${PG_PORT}" -U "${PG_USER}" >/dev/null 2>&1; then
    break
  fi
  sleep 1
done

# Ensure the application database exists (initdb only created the role's own db).
# Use PGPASSWORD so non-interactive md5 auth over TCP does not block on a prompt.
export PGPASSWORD="${PG_PASSWORD}"
if ! "${PG_BIN}/psql" -h localhost -p "${PG_PORT}" -U "${PG_USER}" -d postgres \
  -tAc "SELECT 1 FROM pg_database WHERE datname='${PG_DB}'" | grep -q 1; then
  echo "[services] Creating database '${PG_DB}'"
  "${PG_BIN}/createdb" -h localhost -p "${PG_PORT}" -U "${PG_USER}" "${PG_DB}"
fi

# ---------------------------------------------------------------------------
# Redis
# ---------------------------------------------------------------------------
if ! redis-cli -p "${REDIS_PORT}" ping >/dev/null 2>&1; then
  echo "[services] Starting Redis on port ${REDIS_PORT}"
  redis-server \
    --port "${REDIS_PORT}" \
    --daemonize yes \
    --dir "${REDIS_DIR}" \
    --logfile "${REDIS_LOG}" \
    --save "" \
    --appendonly no
  for _ in $(seq 1 30); do
    if redis-cli -p "${REDIS_PORT}" ping >/dev/null 2>&1; then
      break
    fi
    sleep 1
  done
else
  echo "[services] Redis already running"
fi

echo "[services] PostgreSQL and Redis are ready"
