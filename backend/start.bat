@echo off
title Smart Tourism Safety Platform
color 0B

echo.
echo  ============================================================
echo     SMART TOURISM SAFETY PLATFORM
echo  ============================================================
echo.
echo   Predictive AI Risk Modeling, Geo-Fencing, Blockchain
echo   Incident Logging, Behavior Detection, Authority Dashboard
echo.
echo  ============================================================
echo.

:: Check Python
python --version >nul 2>&1
if %errorlevel% neq 0 (
    color 0C
    echo  [ERROR] Python not found. Install from python.org
    pause
    exit /b 1
)

:: Set working directory
cd /d "%~dp0"

:: Install dependencies silently
echo  [1/3] Installing dependencies...
pip install overpy google-generativeai flask --quiet >nul 2>&1
echo        Done.
echo.

:: Seed demo data info
echo  [2/3] Starting server...
echo.

:: Open browser automatically after 2 seconds
echo  [3/3] Opening browser in 3 seconds...
timeout /t 3 /nobreak >nul
start http://localhost:5000

:: Start Flask server
echo.
echo  ============================================================
echo   SERVER RUNNING
echo  ============================================================
echo.
echo   Demo UI:          http://localhost:5000
echo   Authority Panel:  http://localhost:5000/authority
echo.
echo   Press Ctrl+C to stop the server.
echo  ============================================================
echo.

python -u dashboard_server.py

pause
