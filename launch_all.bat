@echo off
setlocal enabledelayedexpansion
title Smart Tourism Safety Platform - Full Launch
color 0B

echo.
echo  ============================================================
echo     SMART TOURISM SAFETY PLATFORM - FULL LAUNCH
echo  ============================================================
echo.
echo   Starting ALL 3 services in parallel:
echo     1. Next.js API Server     (port 3000)
echo     2. Python Safety Backend  (port 5000)
echo     3. Expo Mobile App        (QR code)
echo.
echo  ============================================================
echo.

cd /d "%~dp0"

:: ---- Check dependencies ----
echo  [1/4] Checking dependencies...
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
echo         Python OK, Node.js OK
echo.

:: ---- Install Python dependencies ----
echo  [2/4] Installing Python dependencies...
pip install overpy google-generativeai flask --quiet >nul 2>&1
echo         Done.
echo.

:: ---- Launch Next.js API (port 3000) ----
echo  [3/4] Starting Next.js API Server (port 3000)...
start "SafetyPlatform - Next.js API" cmd /k "cd /d "%~dp0nextjs-api" && color 0E && echo. && echo  === NEXT.JS API SERVER === && echo  Port: 3000 && echo. && npm run dev"

:: Wait for API to boot
timeout /t 3 /nobreak >nul

:: ---- Launch Python Safety Backend (port 5000) ----
echo         Starting Python Safety Backend (port 5000)...
start "SafetyPlatform - Python Backend" cmd /k "cd /d "%~dp0backend" && color 0D && echo. && echo  === PYTHON SAFETY BACKEND === && echo  Demo UI: http://localhost:5000 && echo  Dashboard: http://localhost:5000/authority && echo. && python -u dashboard_server.py"

:: Wait for backend to boot
timeout /t 3 /nobreak >nul

:: ---- Launch Expo App ----
echo         Starting Expo Mobile App...
start "SafetyPlatform - Expo App" cmd /k "cd /d "%~dp0expo-app" && color 0A && echo. && echo  === EXPO MOBILE APP === && echo  Scan QR code with Expo Go && echo. && npx expo start --tunnel"

echo.
echo  [4/4] Opening browser...
timeout /t 2 /nobreak >nul
start http://localhost:5000

echo.
echo  ============================================================
echo   ALL SERVICES LAUNCHED!
echo  ============================================================
echo.
echo   Next.js API:       http://localhost:3000
echo   Safety Demo UI:    http://localhost:5000
echo   Authority Panel:   http://localhost:5000/authority
echo   Expo Mobile:       Check Expo window for QR code
echo.
echo   3 windows opened - close them to stop services.
echo  ============================================================
echo.
pause
