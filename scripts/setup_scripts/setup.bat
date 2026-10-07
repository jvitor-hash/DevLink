@echo off
setlocal EnableExtensions

rem =====================================================================
rem  setup.bat - create .env files and run DB migrations
rem  Usage:  setup.bat home        (postgres / postgres)
rem          setup.bat elsewhere   (postgres / admin)
rem =====================================================================

rem --- Configuration (change PORT here, stays in sync everywhere) ---
set "PORT=3333"
set "FRONTEND_PORT=5173"
set "DB_HOST=localhost:5432"
set "DB_NAME=db_development"
set "DB_USER=postgres"

rem --- Argument validation ---
if "%~1"=="" goto :usage
if not "%~2"=="" goto :usage

if /i "%~1"=="home" (
    set "DB_PASSWORD=postgres"
) else if /i "%~1"=="elsewhere" (
    set "DB_PASSWORD=admin"
) else (
    goto :usage
)

rem --- Generate random 32-byte hex secret ---
rem cmd has no RNG, so we shell out to PowerShell and write to a temp
rem file (avoids escaping issues inside for /f).
set "TMPFILE=%TEMP%\setup_secret_%RANDOM%.tmp"
powershell -NoProfile -Command "$b = New-Object byte[] 32; $r = [System.Security.Cryptography.RandomNumberGenerator]::Create(); $r.GetBytes($b); $r.Dispose(); [System.IO.File]::WriteAllText('%TMPFILE%', [System.BitConverter]::ToString($b).Replace('-','').ToLower())"
if errorlevel 1 (
    echo ERROR: failed to generate random secret.
    exit /b 1
)
set /p SECRET=<"%TMPFILE%"
del "%TMPFILE%" >nul 2>&1

if not defined SECRET (
    echo ERROR: failed to read random secret.
    exit /b 1
)

rem --- Ensure folders exist ---
if not exist "API"      mkdir "API"
if not exist "FRONTEND" mkdir "FRONTEND"

rem --- API\.env ---
>"API\.env" (
    echo BETTER_AUTH_SECRET=%SECRET%
    echo BETTER_AUTH_URL="http://localhost:%PORT%"
    echo FRONT_END_URL="http://localhost:%FRONTEND_PORT%"
    echo DATABASE_URL="postgres://%DB_USER%:%DB_PASSWORD%@%DB_HOST%/%DB_NAME%"
    echo LOGGER_LEVEL="ERROR"
    echo PORT=%PORT%
)

rem --- FRONTEND\.env ---
>"FRONTEND\.env" echo API_URL="http://localhost:%PORT%"

echo Created API\.env and FRONTEND\.env [mode: %~1]

where bun >nul 2>&1
if errorlevel 1 (
    echo ERROR: bun was not found on PATH.
    exit /b 1
)

rem --- Run bun commands inside API\ ---
pushd "API"

echo Running "bun run db:generate" ...
bun run db:generate
if errorlevel 1 (
    echo ERROR: bun run db:generate failed.
    popd
    exit /b 1
)

echo Running "bun run db:migrate" ...
bun run db:migrate
if errorlevel 1 (
    echo ERROR: bun run db:migrate failed.
    popd
    exit /b 1
)

popd

echo Setup completed successfully.
exit /b 0

:usage
echo Usage: %~nx0 home^|elsewhere
echo.
echo   home        DATABASE_URL password: postgres
echo   elsewhere   DATABASE_URL password: admin
exit /b 1