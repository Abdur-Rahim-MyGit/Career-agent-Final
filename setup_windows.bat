@echo off
title SMAART Career Server Setup
echo ========================================================
echo Installing all dependencies for SMAART Career Platform
echo ========================================================

echo.
echo [1/3] Setting up Python Virtual Environment (ML Service)...
cd ml-service
if not exist .venv (
    echo Creating virtual environment...
    python -m venv .venv
)
echo Activating virtual environment and installing requirements...
call .venv\Scripts\activate
pip install -r requirements.txt
cd ..

echo.
echo [2/3] Installing Node.js Backend Dependencies...
cd backend
call npm install
cd ..

echo.
echo [3/3] Installing React Frontend Dependencies...
cd frontend
call npm install
cd ..

echo.
echo ========================================================
echo Setup Complete! 
echo ========================================================
echo You can now double-click 'start_windows.bat' to launch the application.
echo.
pause
