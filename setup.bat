@echo off
setlocal enabledelayedexpansion
title Smart Tourism Safety Platform
color 0B

echo.
echo  ============================================================
echo     SMART TOURISM SAFETY PLATFORM
echo  ============================================================
echo.
echo   Starting all services automatically...
echo.

cd /d "%~dp0"

:: ---- Quick dependency check ----
python --version >nul 2>&1
if %errorlevel% neq 0 (
    color 0C
    echo  [ERROR] Python not found. Install from python.org
    pause
    exit /b 1
)
node --version >nul 2>&1
if %errorlevel% neq 0 (
    color 0C
    echo  [ERROR] Node.js not found. Install from nodejs.org
    pause
    exit /b 1
)

:: ---- Install Python deps silently ----
echo  [1/4] Installing dependencies...
pip install overpy google-generativeai flask --quiet >nul 2>&1
echo         Done.

:: ---- Start Next.js API (port 3000) ----
echo  [2/4] Starting Next.js API...
start "Next.js API - Port 3000" /min cmd /k "cd /d "%~dp0nextjs-api" && npm run dev"
timeout /t 3 /nobreak >nul

:: ---- Start Python Backend (port 5000) ----
echo  [3/4] Starting Safety Backend...
start "Python Backend - Port 5000" /min cmd /k "cd /d "%~dp0backend" && python -u dashboard_server.py"
timeout /t 3 /nobreak >nul

:: ---- Start Expo App ----
echo  [4/4] Starting Expo App...
start "Expo Mobile App" cmd /k "cd /d "%~dp0expo-app" && npx expo start --tunnel"

:: ---- Open browser ----
timeout /t 2 /nobreak >nul
start http://localhost:5000

echo.
echo  ============================================================
echo   ALL RUNNING!
echo  ============================================================
echo.
echo   Demo UI:          http://localhost:5000
echo   Authority Panel:  http://localhost:5000/authority
echo   Next.js API:      http://localhost:3000
echo   Expo:             Check Expo window for QR code
echo.
echo   Close this window when done.
echo  ============================================================
echo.
pause
