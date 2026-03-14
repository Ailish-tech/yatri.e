@echo off
setlocal enabledelayedexpansion
title Smart Tourism Safety Platform - Demo
color 0A

echo ============================================================
echo     SMART TOURISM SAFETY PLATFORM - DEMO LAUNCHER
echo ============================================================
echo.

:: ---- Check Python ----
python --version >nul 2>&1
if %errorlevel% neq 0 (
    color 0C
    echo [ERROR] Python is not installed or not in PATH.
    echo         Download from: https://www.python.org/downloads/
    pause
    exit /b 1
)

:: ---- Set working directory ----
cd /d "%~dp0"

:: ---- Gemini API Key ----
if "%GEMINI_API_KEY%"=="" (
    echo [!] Gemini API key not detected.
    echo.
    set /p GEMINI_API_KEY="Paste your Gemini API key (from aistudio.google.com/apikey): "
    echo.
    if "!GEMINI_API_KEY!"=="" (
        echo [WARNING] No key entered. AI features will not work.
        echo.
    ) else (
        echo [OK] Gemini API key set.
        echo.
    )
)

:: ---- Install dependencies ----
echo [Setup] Installing dependencies...
pip install overpy google-generativeai flask --quiet >nul 2>&1
echo         Done.
echo.

:: ---- Menu ----
:MENU
echo ============================================================
echo   Choose what to demo:
echo ============================================================
echo.
echo   --- Core Features ---
echo   1. POI Search Demo         (find hospitals, police, cafes)
echo   2. AI Tourist Guide        (chat, safety, crowd estimates)
echo.
echo   --- Safety Features ---
echo   3. Geo-Fence Check         (danger zone detection)
echo   4. Risk Score Calculator   (0-100 dynamic scoring)
echo   5. Behavior Monitor        (route deviation, inactivity)
echo.
echo   --- Authority Tools ---
echo   6. Blockchain Logger       (tamper-proof incident logs)
echo   7. Launch Web Dashboard    (heat map + incident feed)
echo.
echo   --- QA ---
echo   8. Run QA Test Suite       (17 tests - senior tester)
echo   9. Run ALL Demos
echo   0. Exit
echo.
set /p choice="Enter your choice (0-9): "

if "%choice%"=="1" goto POI_DEMO
if "%choice%"=="2" goto AI_DEMO
if "%choice%"=="3" goto GEOFENCE_DEMO
if "%choice%"=="4" goto RISK_DEMO
if "%choice%"=="5" goto BEHAVIOR_DEMO
if "%choice%"=="6" goto BLOCKCHAIN_DEMO
if "%choice%"=="7" goto DASHBOARD
if "%choice%"=="8" goto QA_TEST
if "%choice%"=="9" goto RUN_ALL
if "%choice%"=="0" goto END

echo [!] Invalid choice. Try again.
echo.
goto MENU

:: ---- POI Search Demo ----
:POI_DEMO
echo.
echo ============================================================
echo   POI Search Demo (OpenStreetMap - FREE)
echo ============================================================
echo.
python -u location_service.py
echo.
pause
goto MENU

:: ---- AI Tourist Guide ----
:AI_DEMO
echo.
echo ============================================================
echo   AI Tourist Guide (Google Gemini - FREE)
echo ============================================================
echo.
if "!GEMINI_API_KEY!"=="" (
    echo [ERROR] Gemini API key not set. Restart and enter your key.
    pause
    goto MENU
)
python -u virtual_guide.py
echo.
pause
goto MENU

:: ---- Geo-Fence Demo ----
:GEOFENCE_DEMO
echo.
echo ============================================================
echo   Geo-Fencing Engine Demo
echo ============================================================
echo.
python -u geofence_engine.py
echo.
pause
goto MENU

:: ---- Risk Score Demo ----
:RISK_DEMO
echo.
echo ============================================================
echo   Dynamic Risk Score Calculator
echo ============================================================
echo.
python -u risk_scoring.py
echo.
pause
goto MENU

:: ---- Behavior Monitor Demo ----
:BEHAVIOR_DEMO
echo.
echo ============================================================
echo   Abnormal Behavior Monitor
echo ============================================================
echo.
python -u behavior_monitor.py
echo.
pause
goto MENU

:: ---- Blockchain Demo ----
:BLOCKCHAIN_DEMO
echo.
echo ============================================================
echo   Blockchain Incident Logger
echo ============================================================
echo.
python -u blockchain_logger.py
echo.
pause
goto MENU

:: ---- Authority Dashboard ----
:DASHBOARD
echo.
echo ============================================================
echo   Launching Authority Dashboard
echo   Open your browser at: http://localhost:5000
echo ============================================================
echo.
start http://localhost:5000
python -u dashboard_server.py
echo.
pause
goto MENU

:: ---- QA Test Suite ----
:QA_TEST
echo.
echo ============================================================
echo   QA Test Suite (17 tests)
echo ============================================================
echo   Note: Takes ~2 minutes due to API delays.
echo.
python -u test_qa.py
echo.
pause
goto MENU

:: ---- Run Everything ----
:RUN_ALL
echo.
echo ============================================================
echo   Running ALL module demos
echo ============================================================
echo.
echo --- [1/6] POI Search ---
python -u location_service.py
echo.
echo --- [2/6] AI Tourist Guide ---
if "!GEMINI_API_KEY!"=="" (
    echo [SKIPPED] No Gemini API key.
) else (
    python -u virtual_guide.py
)
echo.
echo --- [3/6] Geo-Fencing ---
python -u geofence_engine.py
echo.
echo --- [4/6] Risk Scoring ---
python -u risk_scoring.py
echo.
echo --- [5/6] Behavior Monitor ---
python -u behavior_monitor.py
echo.
echo --- [6/6] Blockchain Logger ---
python -u blockchain_logger.py
echo.
echo ============================================================
echo   ALL DEMOS COMPLETE! Launch dashboard? (option 7)
echo ============================================================
pause
goto MENU

:END
echo.
echo Goodbye!
exit /b 0
