@echo off

:: Re-trigger DEAD/FAILED outbox events. Run from the repo root.

setlocal

set DRY_RUN_FLAG=
if "%1"=="--dry-run" set DRY_RUN_FLAG=--dry-run

cd /d "%~dp0..\.."

echo Re-triggering stalled outbox events...
bun run scripts/maintenance_scripts/retrigger-dead-events.ts %DRY_RUN_FLAG%
