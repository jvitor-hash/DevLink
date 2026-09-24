# Set error action preference
$ErrorActionPreference = "Stop"

# Function to print colored messages
function Write-ColorOutput {
    param(
        [string]$Message,
        [string]$Color = "White"
    )
    Write-Host $Message -ForegroundColor $Color
}

# Function to run command in directory
function Invoke-InDirectory {
    param(
        [string]$Directory,
        [string]$Command,
        [string]$Description
    )

    Write-ColorOutput "`n📁 [$Directory] $Description" "Yellow"

    Push-Location $Directory

    try {
        Invoke-Expression $Command

        if ($LASTEXITCODE -ne 0) {
            throw "Command failed with exit code $LASTEXITCODE"
        }

        Write-ColorOutput "✅ [$Directory] $Description - PASSED" "Green"
    }
    catch {
        Write-ColorOutput "❌ [$Directory] $Description - FAILED" "Red"
        Pop-Location
        exit 1
    }
    finally {
        Pop-Location
    }
}

# Store original directory
$OriginalDir = Get-Location

Write-ColorOutput "🚀 Starting test suite..." "Green"

# API Tests
if (Test-Path "API") {
    Write-ColorOutput "`n========== API TESTS ==========" "Yellow"

    Invoke-InDirectory -Directory "API" -Command "bun run lint" -Description "Linting"
    Invoke-InDirectory -Directory "API" -Command "bun run type-check" -Description "Type checking"
    Invoke-InDirectory -Directory "API" -Command "bun test" -Description "Unit tests"
}
else {
    Write-ColorOutput "⚠️  API directory not found" "Yellow"
}

# FRONTEND Tests
if (Test-Path "FRONTEND") {
    Write-ColorOutput "`n========== FRONTEND TESTS ==========" "Yellow"

    Invoke-InDirectory -Directory "FRONTEND" -Command "bun run lint" -Description "Linting"
    Invoke-InDirectory -Directory "FRONTEND" -Command "bun run type-check" -Description "Type checking"
    Invoke-InDirectory -Directory "FRONTEND" -Command "bun run cy:run" -Description "Cypress tests"
}
else {
    Write-ColorOutput "⚠️  FRONTEND directory not found" "Yellow"
}

Write-ColorOutput "`n🎉 All tests passed successfully!" "Green"

# Return to original directory
Set-Location $OriginalDir
