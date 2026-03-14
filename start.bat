@echo off
title Yatri.e - Smart Tourism Safety Platform
color 0B

echo.
echo  ╔══════════════════════════════════════════════════╗
echo  ║     ✦  Yatri.e - Smart Tourism Safety          ║
echo  ║        Starting all services...                 ║
echo  ╚══════════════════════════════════════════════════╝
echo.

:: Navigate to backend folder
cd /d "%~dp0backend"

:: Install dependencies if needed
echo [1/3] Checking dependencies...
pip install flask groq overpy requests --quiet 2>nul
echo       Done.
echo.

:: Kill any existing process on port 5000
echo [2/3] Freeing port 5000...
for /f "tokens=5" %%a in ('netstat -aon ^| findstr :5000 ^| findstr LISTENING') do (
    taskkill /PID %%a /F >nul 2>nul
)
echo       Done.
echo.

:: Start the server
echo [3/3] Starting Safety Backend...
echo.
echo  ══════════════════════════════════════════════════
echo   Demo UI:        http://localhost:5000
echo   Dashboard:      http://localhost:5000/authority
echo  ══════════════════════════════════════════════════
echo.
echo   Press Ctrl+C to stop the server.
echo.

:: Open browser after 2 seconds
start /b cmd /c "timeout /t 2 /nobreak >nul & start http://localhost:5000"

:: Run the server (blocks here until Ctrl+C)
python dashboard_server.py

pause
