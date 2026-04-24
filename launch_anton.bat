@echo off
title ANTON — Intelligence Engine Launcher
color 0A

:: ============================================================
::  %~dp0 resolves to the directory this .bat file lives in,
::  no matter where you run it from. This makes it portable.
:: ============================================================
set "PROJECT_DIR=%~dp0"
set "BACKEND_DIR=%PROJECT_DIR%backend"
set "FRONTEND_DIR=%PROJECT_DIR%frontend"

echo.
echo  ============================================================
echo   ^|  ANTON — Intelligence Engine                          ^|
echo   ^|  Starting all services...                             ^|
echo  ============================================================
echo.

:: --- Validate folders exist ---
if not exist "%BACKEND_DIR%" (
    echo  [ERROR] Backend folder not found at: %BACKEND_DIR%
    pause & exit /b 1
)
if not exist "%FRONTEND_DIR%" (
    echo  [ERROR] Frontend folder not found at: %FRONTEND_DIR%
    pause & exit /b 1
)

:: --- Check for .env file ---
if not exist "%BACKEND_DIR%\.env" (
    echo  [WARN] No .env file found. Copying from .env.example...
    copy "%BACKEND_DIR%\.env.example" "%BACKEND_DIR%\.env" >nul
    echo  [WARN] Please edit backend\.env and add your GROQ_API_KEY.
    start notepad "%BACKEND_DIR%\.env"
    pause & exit /b 1
)

:: --- Check if uvicorn is available ---
python -m uvicorn --version >nul 2>&1
if errorlevel 1 (
    echo  [SETUP] Installing Python dependencies ^(first-time setup, ~1-2 min^)...
    python -m pip install -r "%BACKEND_DIR%\requirements.txt" --quiet
    python "%BACKEND_DIR%\download_data.py"
)

:: --- Launch Backend in a new window using system python ---
echo  [1/3] Starting FastAPI Backend on http://localhost:8000 ...
start "ANTON Backend" cmd /k "cd /d "%BACKEND_DIR%" && python -m uvicorn app.main:app --reload --host 0.0.0.0 --port 8000"

:: --- Wait for backend to spin up ---
echo  [2/3] Waiting for backend to initialise (6s)...
timeout /t 6 /nobreak >nul

:: --- Launch Frontend in a new window ---
echo  [3/3] Starting React Frontend on http://localhost:5173 ...
start "ANTON Frontend" cmd /k "cd /d "%FRONTEND_DIR%" && npm run dev"

:: --- Wait for frontend dev server to start ---
echo  [    ] Waiting for frontend to compile (5s)...
timeout /t 5 /nobreak >nul

:: --- Open browser ---
echo  [OK ] Opening browser...
start "" "http://localhost:5173"

echo.
echo  ============================================================
echo   Anton is now running!
echo   Frontend : http://localhost:5173
echo   Backend  : http://localhost:8000
echo   API Docs : http://localhost:8000/docs
echo   Close the two terminal windows to stop all services.
echo  ============================================================
echo.
