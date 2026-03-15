@echo off
setlocal enabledelayedexpansion
title Yatri.e - Smart Tourism Safety Platform
color 0B

echo.
echo  ==============================================================
echo     YATRI.E - SMART TOURISM SAFETY PLATFORM
echo     Full Stack Launcher
echo  ==============================================================
echo.
echo   Services:
echo     1. Python Safety Backend   (port 5000) - Dashboard + APIs
echo     2. Next.js API Server      (port 3000) - Middleware
echo     3. Expo Mobile App         (QR Code)   - Tourist App
echo.
echo  ==============================================================
echo.

cd /d "%~dp0"

:: ============================================================
:: STEP 1: Verify dependencies
:: ============================================================
echo  [1/6] Checking dependencies...

python --version >nul 2>&1
if %errorlevel% neq 0 (
    color 0C
    echo  [ERROR] Python not found! Install from https://python.org
    pause
    exit /b 1
)

node --version >nul 2>&1
if %errorlevel% neq 0 (
    color 0C
    echo  [ERROR] Node.js not found! Install from https://nodejs.org
    pause
    exit /b 1
)

echo         Python .... OK
echo         Node.js ... OK
echo.

:: ============================================================
:: STEP 2: Install Python dependencies
:: ============================================================
echo  [2/6] Installing Python dependencies...
pip install flask groq overpy requests opencv-contrib-python --quiet >nul 2>&1
echo         Done.
echo.

:: ============================================================
:: STEP 3: Install Node dependencies (if needed)
:: ============================================================
echo  [3/6] Checking Node dependencies...

if not exist "%~dp0nextjs-api\node_modules" (
    echo         Installing Next.js API dependencies...
    start /wait cmd /c "cd /d "%~dp0nextjs-api" && npm install --silent 2>nul"
) else (
    echo         Next.js API ... OK
)

if not exist "%~dp0expo-app\node_modules" (
    echo         Installing Expo App dependencies...
    start /wait cmd /c "cd /d "%~dp0expo-app" && npm install --silent 2>nul"
) else (
    echo         Expo App ...... OK
)
echo.

:: ============================================================
:: STEP 4: Kill existing processes on ports 3000 and 5000
:: ============================================================
echo  [4/6] Freeing ports 3000 and 5000...

for /f "tokens=5" %%a in ('netstat -aon ^| findstr :5000 ^| findstr LISTENING 2^>nul') do (
    taskkill /PID %%a /F >nul 2>nul
)
for /f "tokens=5" %%a in ('netstat -aon ^| findstr :3000 ^| findstr LISTENING 2^>nul') do (
    taskkill /PID %%a /F >nul 2>nul
)
echo         Ports cleared.
echo.

:: ============================================================
:: STEP 5: Launch all 3 services in separate windows
:: ============================================================
echo  [5/6] Launching services...

:: --- Load API Keys from .env file ---
if exist "%~dp0.env" (
    for /f "usebackq tokens=1,* delims==" %%A in ("%~dp0.env") do (
        set "%%A=%%B"
    )
    echo         Loaded API keys from .env
) else (
    echo         [WARNING] No .env file found! Create one with: GROQ_API_KEY=your-key
)

:: --- Python Safety Backend (port 5000) ---
echo         Starting Python Safety Backend (port 5000)...
start "Yatri.e - Python Backend" cmd /k "set GROQ_API_KEY=%GROQ_API_KEY% && cd /d "%~dp0backend" && color 0D && echo. && echo  =========================================== && echo   YATRI.E - PYTHON SAFETY BACKEND && echo   Demo UI:    http://localhost:5000 && echo   Dashboard:  http://localhost:5000/authority && echo  =========================================== && echo. && python -u dashboard_server.py"

:: Wait for backend to boot
timeout /t 4 /nobreak >nul

:: --- Next.js API Server (port 3000) ---
echo         Starting Next.js API Server (port 3000)...
start "Yatri.e - Next.js API" cmd /k "cd /d "%~dp0nextjs-api" && color 0E && echo. && echo  =========================================== && echo   YATRI.E - NEXT.JS API SERVER && echo   URL: http://localhost:3000 && echo  =========================================== && echo. && npm run dev"

:: Wait for API to boot
timeout /t 4 /nobreak >nul

:: --- Expo Mobile App (QR Code) ---
echo         Starting Expo Mobile App (QR Code)...
start "Yatri.e - Expo App" cmd /k "cd /d "%~dp0expo-app" && color 0A && echo. && echo  =========================================== && echo   YATRI.E - EXPO MOBILE APP && echo   Scan the QR code below with Expo Go && echo  =========================================== && echo. && npx expo start --tunnel"

echo         All services starting...
echo.

:: ============================================================
:: STEP 6: Open browser
:: ============================================================
echo  [6/6] Opening browser...
timeout /t 3 /nobreak >nul
start http://localhost:5000
timeout /t 1 /nobreak >nul
start http://localhost:5000/authority

echo.
echo  ==============================================================
echo   ALL SERVICES LAUNCHED SUCCESSFULLY!
echo  ==============================================================
echo.
echo   Demo UI (Tourist):     http://localhost:5000
echo   Authority Dashboard:   http://localhost:5000/authority
echo   Next.js API:           http://localhost:3000
echo   Expo Mobile App:       Check "Yatri.e - Expo App" window
echo                          for QR code (scan with Expo Go)
echo.
echo   3 windows opened. Close them individually to stop services.
echo  ==============================================================
echo.
pause
