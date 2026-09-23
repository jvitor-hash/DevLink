#!/usr/bin/env bash
# setup.sh — create .env files and run DB migrations
# Usage: ./setup.sh <home|elsewhere>

set -euo pipefail

# --- Configuration (change PORT here, stays in sync everywhere) ---
PORT=3333
FRONTEND_PORT=5173
DB_HOST="localhost:5432"
DB_NAME="db_development"
DB_USER="postgres"

# --- Argument validation ---
if [[ $# -ne 1 ]]; then
    echo "Usage: $0 <home|elsewhere>" >&2
    exit 1
fi

case "$1" in
    home)      DB_PASSWORD="postgres" ;;
    elsewhere) DB_PASSWORD="admin" ;;
    *) echo "Error: argument must be 'home' or 'elsewhere' (got '$1')" >&2; exit 1 ;;
esac

# --- Generate 32-byte hex secret (openssl, /dev/urandom fallback) ---
if command -v openssl >/dev/null 2>&1; then
    SECRET="$(openssl rand -hex 32)"
else
    SECRET="$(od -An -N32 -tx1 /dev/urandom | tr -d ' \n')"
fi

# --- Create folders ---
mkdir -p API FRONTEND

# --- API/.env ---
cat > API/.env <<EOF
BETTER_AUTH_SECRET=${SECRET}
BETTER_AUTH_URL="http://localhost:${PORT}"
FRONT_END_URL="http://localhost:${FRONTEND_PORT}"
DATABASE_URL="postgres://${DB_USER}:${DB_PASSWORD}@${DB_HOST}/${DB_NAME}"
LOGGER_LEVEL="ERROR"
PORT=${PORT}
EOF

# --- FRONTEND/.env ---
cat > FRONTEND/.env <<EOF
API_URL="http://localhost:${PORT}"
EOF

echo "Created API/.env and FRONTEND/.env (mode: $1)"

# --- Run bun commands in API/ ---
cd API

echo "Running: bun run db:generate"
if ! bun run db:generate; then
    echo "ERROR: bun run db:generate failed" >&2
    exit 1
fi

echo "Running: bun run db:migrate"
if ! bun run db:migrate; then
    echo "ERROR: bun run db:migrate failed" >&2
    exit 1
fi

echo "Setup completed successfully."