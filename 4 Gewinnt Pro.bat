@echo off
title Vier Gewinnt Pro Launcher
cd /d "%~dp0"
cls

echo ==========================================
echo        VIER GEWINNT PRO LAUNCHER
echo ==========================================
echo.

REM Check if node_modules exists
if not exist node_modules (
    echo [INFO] Node_modules nicht gefunden. Installiere Abhaengigkeiten...
    call npm install
)

REM Build the project to ensure latest changes are served
echo [INFO] Baue Anwendung (Vite Build)...
call npm run build

echo.
echo [INFO] Starte Server auf Port 3001...
echo [INFO] Browser oeffnet sich in 3 Sekunden...
echo.
echo [HINWEIS] Lasse dieses Fenster offen, solange du spielen moechtest.
echo [HINWEIS] Zum Beenden: Einfach dieses Fenster schliessen (oder STRG+C).
echo.

REM Open browser in parallel after 3 seconds
start "" /B cmd /c "timeout /t 3 >nul & start http://localhost:3001"

REM Start the Node.js server
node server.js
