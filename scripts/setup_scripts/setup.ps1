# setup.ps1 — create .env files and run DB migrations
# Usage: .\setup.ps1 home   |   .\setup.ps1 elsewhere

param(
    [Parameter(Mandatory = $true, Position = 0)]
    [ValidateSet('home', 'elsewhere')]
    [string]$Mode
)

 $ErrorActionPreference = 'Stop'

# --- Configuration (change $Port here, stays in sync everywhere) ---
 $Port         = 3333
 $FrontendPort = 5173
 $DbHost       = 'localhost:5432'
 $DbName       = 'db_development'
 $DbUser       = 'postgres'
 $DbPassword   = if ($Mode -eq 'home') { 'postgres' } else { 'admin' }

# --- Generate 32 random bytes as 64 hex chars ---
 $bytes = New-Object byte[] 32
 $rng   = [System.Security.Cryptography.RandomNumberGenerator]::Create()
try { $rng.GetBytes($bytes) } finally { $rng.Dispose() }
 $Secret = -join ($bytes | ForEach-Object { $_.ToString('x2') })

# --- Create folders ---
New-Item -ItemType Directory -Force -Path 'API', 'FRONTEND' | Out-Null

# --- API/.env ---
 $apiEnv = @"
BETTER_AUTH_SECRET=$Secret
BETTER_AUTH_URL="http://localhost:$Port"
FRONT_END_URL="http://localhost:$FrontendPort"
DATABASE_URL="postgres://${DbUser}:${DbPassword}@${DbHost}/${DbName}"
LOGGER_LEVEL="ERROR"
PORT=$Port
"@
Set-Content -Path 'API/.env' -Value $apiEnv -Encoding ascii

# --- FRONTEND/.env ---
 $frontendEnv = @"
API_URL="http://localhost:$Port"
"@
Set-Content -Path 'FRONTEND/.env' -Value $frontendEnv -Encoding ascii

Write-Host "Created API/.env and FRONTEND/.env (mode: $Mode)"

if (-not (Get-Command bun -ErrorAction SilentlyContinue)) {
    throw "bun was not found on PATH."
}

# --- Run bun commands in API/ ---
Push-Location API
try {
    Write-Host "Running: bun run db:generate"
    bun run db:generate
    if ($LASTEXITCODE -ne 0) { throw "bun run db:generate failed (exit code $LASTEXITCODE)" }

    Write-Host "Running: bun run db:migrate"
    bun run db:migrate
    if ($LASTEXITCODE -ne 0) { throw "bun run db:migrate failed (exit code $LASTEXITCODE)" }
}
finally {
    Pop-Location
}

Write-Host "Setup completed successfully."