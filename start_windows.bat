@echo off
title SMAART Career Server Setup
echo ========================================================
echo Starting SMAART Career Intelligence Platform...
echo ========================================================

echo [1/3] Starting ML Service (Port 5001)...
start "ML Service" cmd /k "cd ml-service && (if exist .venv\Scripts\activate call .venv\Scripts\activate) && python app.py"

echo [2/3] Starting Backend (Port 5000)...
start "Backend API" cmd /k "cd backend && npm run dev"

echo [3/3] Starting Frontend (React/Vite)...
start "Frontend UI" cmd /k "cd frontend && npm run dev"

echo.
echo All services are launching in separate windows!
echo Keep those windows open to keep the servers running.
echo.
echo The frontend should automatically open in your browser shortly (usually http://localhost:5173 or http://localhost:5176).
echo.
pause
