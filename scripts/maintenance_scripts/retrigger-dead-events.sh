#!/bin/bash

# Re-trigger DEAD/FAILED outbox events. Run from the repo root.

set -e

DRY_RUN_FLAG=""
if [ "$1" = "--dry-run" ]; then
    DRY_RUN_FLAG="--dry-run"
fi

cd "$(dirname "$0")/../.." || exit 1

echo "Re-triggering stalled outbox events..."
bun run scripts/maintenance_scripts/retrigger-dead-events.ts $DRY_RUN_FLAG
