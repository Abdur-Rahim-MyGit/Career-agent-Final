@echo off
title SMAART Career Server Setup
echo ========================================================
echo  SMAART Career Intelligence Platform - Full Setup
echo ========================================================

echo.
echo [Step 0] Checking environment file...
cd backend
if not exist .env (
    if exist .env.example (
        echo  .env not found! Copying from .env.example...
        copy .env.example .env
        echo.
        echo  *** IMPORTANT: Open backend\.env and fill in your ***
        echo  *** API keys and database passwords before running ***
        echo.
    ) else (
        echo  WARNING: No .env or .env.example found!
        echo  Ask your team lead for the .env file.
    )
) else (
    echo  .env file found. OK
)
cd ..

echo.
echo [Step 1/4] Checking prerequisites...
echo  - Node.js:
node --version 2>nul || (echo  ERROR: Node.js not installed! Download from https://nodejs.org && pause && exit)
echo  - Python:  
python --version 2>nul || (echo  WARNING: Python not installed. ML Service will not work.)
echo  - npm:
call npm --version 2>nul || (echo  ERROR: npm not found! && pause && exit)

echo.
echo [Step 2/4] Setting up Python Virtual Environment (ML Service)...
cd ml-service
if not exist .venv (
    echo  Creating virtual environment...
    python -m venv .venv 2>nul
)
if exist .venv\Scripts\activate (
    echo  Activating virtual environment and installing requirements...
    call .venv\Scripts\activate
    pip install -r requirements.txt --quiet
) else (
    echo  Skipping ML Service (Python venv not available)
)
cd ..

echo.
echo [Step 3/4] Installing Node.js Backend Dependencies...
cd backend
call npm install
echo  Running Prisma generate...
call npx prisma generate 2>nul
cd ..

echo.
echo [Step 4/4] Installing React Frontend Dependencies...
cd frontend
call npm install
cd ..

echo.
echo ========================================================
echo  Setup Complete!
echo ========================================================
echo.
echo  BEFORE YOU RUN:
echo  1. Make sure PostgreSQL is running on port 5432
echo  2. Make sure MongoDB is running on port 27017
echo  3. Edit backend\.env with your API keys (if not done)
echo.
echo  TO START: Double-click 'start_windows.bat'
echo    OR run manually:
echo      Terminal 1: cd backend  ^& npm run dev     (Port 5000)
echo      Terminal 2: cd frontend ^& npm run dev     (Port 5173)
echo      Terminal 3: cd ml-service ^& python app.py (Port 5001)
echo.
pause
