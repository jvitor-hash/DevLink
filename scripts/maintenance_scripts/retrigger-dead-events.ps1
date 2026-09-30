# Re-trigger DEAD/FAILED outbox events. Run from the repo root.

$DryRunFlag = ""
if ($args -contains "--dry-run") {
    $DryRunFlag = "--dry-run"
}

Set-Location (Join-Path $PSScriptRoot "..\..")

Write-Host "Re-triggering stalled outbox events..."
bun run scripts/maintenance_scripts/retrigger-dead-events.ts $DryRunFlag
