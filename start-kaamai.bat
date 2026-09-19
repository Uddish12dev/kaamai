@echo off
title KaamAI All-In-One Launcher
echo ===================================================
echo   Starting KaamAI (AI OS for Street Vendors)
echo ===================================================

cd /d "%~dp0kaamai-main\kaamai-main"

echo [1/3] Starting Express Backend (Port 3002)...
start "KaamAI Backend (3002)" cmd /k "npm run backend"

echo [2/3] Starting Python ML Forecasting Service (Port 5001)...
start "KaamAI ML Service (5001)" cmd /k "npm run ml:serve"

echo [3/3] Starting Vite Frontend (Port 5173)...
start "KaamAI Frontend (5173)" cmd /k "npm run dev"

echo.
echo Waiting 3 seconds for services to initialize...
timeout /t 3 /nobreak >nul

echo Opening KaamAI in your browser...
start http://localhost:5173

echo.
echo KaamAI is running!
echo Access the app at: http://localhost:5173
echo ===================================================
