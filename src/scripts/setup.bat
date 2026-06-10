@echo off
setlocal enabledelayedexpansion

REM IMPI Project Setup Script (Windows)
REM This script ensures pnpm is installed and sets up the development environment

echo.
echo 🚀 IMPI Project Setup
echo ====================
echo.

REM Check if Node.js is installed
node --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ Node.js is not installed!
    echo ℹ️  Please install Node.js 18+ from https://nodejs.org/
    pause
    exit /b 1
)

for /f "tokens=*" %%i in ('node --version') do set NODE_VERSION=%%i
echo ✅ Node.js found: %NODE_VERSION%

REM Check Node.js version (basic check)
set "VERSION_NUM=%NODE_VERSION:v=%"
for /f "tokens=1 delims=." %%a in ("%VERSION_NUM%") do set MAJOR_VERSION=%%a
if %MAJOR_VERSION% lss 20 (
    echo ⚠️  Node.js 20+ recommended. Current: %NODE_VERSION%
    echo ℹ️  Latest LTS: v22.19.0
) else if %MAJOR_VERSION% lss 22 (
    echo ℹ️  Consider upgrading to Node.js v22.19.0 LTS
)

echo.
echo ℹ️  Checking pnpm installation...

REM Run our Node.js script to check/install pnpm
node scripts\ensure-pnpm.js
if %errorlevel% neq 0 (
    echo ❌ Failed to setup pnpm
    pause
    exit /b 1
)

echo.
echo ℹ️  Installing dependencies...

pnpm install
if %errorlevel% neq 0 (
    echo ❌ Failed to install dependencies
    pause
    exit /b 1
)

echo ✅ Dependencies installed successfully!

echo.
set /p BUILD_CHOICE="🔨 Would you like to build and test the project now? (y/N) "
if /i "%BUILD_CHOICE%"=="y" (
    echo.
    echo ℹ️  Building project...
    pnpm run build
    if %errorlevel% neq 0 (
        echo ⚠️  Build failed - check the output above
    ) else (
        echo ✅ Project built successfully!
    )

    echo.
    echo ℹ️  Running tests...
    pnpm run test
    if %errorlevel% neq 0 (
        echo ⚠️  Some tests failed - check the output above
    ) else (
        echo ✅ All tests passed!
    )
)

echo.
echo ✅ Setup complete! 🎉
echo.
echo ℹ️  Available commands:
echo   pnpm run build     # Build all packages
echo   pnpm run test      # Run all tests
echo   pnpm run clean     # Clean build outputs
echo   pnpm run dev       # Build and test
echo   pnpm run lint      # Lint code
echo.
echo ℹ️  Happy coding! 💻
echo.
pause