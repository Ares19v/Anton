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
echo  ============================================================
echo.

:: --- Check for .env file ---
if not exist "%BACKEND_DIR%\.env" (
    echo  [WARN] No .env file found in backend\.
    echo         Copying from .env.example — please fill in GROQ_API_KEY.
    copy "%BACKEND_DIR%\.env.example" "%BACKEND_DIR%\.env" >nul
    start notepad "%BACKEND_DIR%\.env"
    echo  Edit the file that just opened, save it, then re-run this launcher.
    pause & exit /b 1
)

:: --- Check if Python deps are installed (uvicorn is a good proxy) ---
python -m uvicorn --version >nul 2>&1
if errorlevel 1 (
    echo  [SETUP] Python packages not found.
    echo         Running install.bat first...
    echo.
    call "%PROJECT_DIR%install.bat"
)

:: --- Check if node_modules exist ---
if not exist "%FRONTEND_DIR%\node_modules" (
    echo  [SETUP] Node modules not found.
    echo         Running npm install...
    cd /d "%FRONTEND_DIR%"
    npm install
    cd /d "%PROJECT_DIR%"
)

:: --- Launch Backend ---
echo  [1/3] Starting FastAPI Backend on http://localhost:8000 ...
start "ANTON Backend" cmd /k "cd /d "%BACKEND_DIR%" && python -m uvicorn app.main:app --reload --host 0.0.0.0 --port 8000"

echo  [2/3] Waiting for backend to initialise (6s)...
timeout /t 6 /nobreak >nul

:: --- Launch Frontend ---
echo  [3/3] Starting React Frontend on http://localhost:5173 ...
start "ANTON Frontend" cmd /k "cd /d "%FRONTEND_DIR%" && npm run dev"

echo  [    ] Waiting for frontend to compile (5s)...
timeout /t 5 /nobreak >nul

:: --- Open browser ---
echo  [OK ] Opening browser at http://localhost:5173 ...
start "" "http://localhost:5173"

echo.
echo  ============================================================
echo   Anton is running!
echo   Frontend : http://localhost:5173
echo   Backend  : http://localhost:8000
echo   API Docs : http://localhost:8000/docs
echo   Close the two terminal windows to stop.
echo  ============================================================
echo.
