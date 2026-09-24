@echo off
setlocal enabledelayedexpansion

:: Store original directory
set "ORIGINAL_DIR=%CD%"

echo Starting test suite...
echo.

:: API Tests
if exist "API" (
    echo ========== API TESTS ==========
    echo.

    cd API

    echo [API] Running linting...
    call bun run lint
    if errorlevel 1 (
        echo [API] Linting - FAILED
        cd "%ORIGINAL_DIR%"
        exit /b 1
    )
    echo [API] Linting - PASSED
    echo.

    echo [API] Running type checking...
    call bun run type-check
    if errorlevel 1 (
        echo [API] Type checking - FAILED
        cd "%ORIGINAL_DIR%"
        exit /b 1
    )
    echo [API] Type checking - PASSED
    echo.

    echo [API] Running unit tests...
    call bun test
    if errorlevel 1 (
        echo [API] Unit tests - FAILED
        cd "%ORIGINAL_DIR%"
        exit /b 1
    )
    echo [API] Unit tests - PASSED
    echo.

    cd "%ORIGINAL_DIR%"
) else (
    echo WARNING: API directory not found
    echo.
)

:: FRONTEND Tests
if exist "FRONTEND" (
    echo ========== FRONTEND TESTS ==========
    echo.

    cd FRONTEND

    echo [FRONTEND] Running linting...
    call bun run lint
    if errorlevel 1 (
        echo [FRONTEND] Linting - FAILED
        cd "%ORIGINAL_DIR%"
        exit /b 1
    )
    echo [FRONTEND] Linting - PASSED
    echo.

    echo [FRONTEND] Running type checking...
    call bun run type-check
    if errorlevel 1 (
        echo [FRONTEND] Type checking - FAILED
        cd "%ORIGINAL_DIR%"
        exit /b 1
    )
    echo [FRONTEND] Type checking - PASSED
    echo.

    echo [FRONTEND] Running Cypress tests...
    call bun run cy:run
    if errorlevel 1 (
        echo [FRONTEND] Cypress tests - FAILED
        cd "%ORIGINAL_DIR%"
        exit /b 1
    )
    echo [FRONTEND] Cypress tests - PASSED
    echo.

    cd "%ORIGINAL_DIR%"
) else (
    echo WARNING: FRONTEND directory not found
    echo.
)

echo All tests passed successfully!
exit /b 0
