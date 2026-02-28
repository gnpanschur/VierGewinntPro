@echo off
echo =======================================================
echo          Starte Vier Gewinnt Pro (Lokal)
echo =======================================================
echo.
echo 1. Starte das Backend (Node Server auf Port 3001)...
start "Backend (Server)" cmd /c "node server.js"

echo.
echo 2. Starte das Frontend (Vite Dev Server)...
start "Frontend (App)" cmd /c "npm run dev"

echo.
echo =======================================================
echo Beide Server werden gestartet!
echo Das Spiel sollte sich in wenigen Sekunden in deinem 
echo Standard-Browser (http://localhost:5173) oeffnen.
echo =======================================================
echo.
pause
