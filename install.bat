@echo off
title ANTON — Install Dependencies
color 0B

set "PROJECT_DIR=%~dp0"
set "BACKEND_DIR=%PROJECT_DIR%backend"
set "FRONTEND_DIR=%PROJECT_DIR%frontend"

echo.
echo  ============================================================
echo   ANTON — Dependency Installer
echo   This will install all Python packages and Node modules.
echo   First-time install takes ~3-5 minutes.
echo  ============================================================
echo.

:: ── Step 1: Python packages ──────────────────────────────────────────────────
echo  [1/3] Installing Python packages from requirements.txt...
echo        ^(fastapi, uvicorn, textblob, groq, passlib, jose, etc.^)
echo.
python -m pip install -r "%BACKEND_DIR%\requirements.txt"
if errorlevel 1 (
    echo.
    echo  [ERROR] Python package installation failed.
    echo          Make sure Python 3.10+ is installed and on your PATH.
    pause & exit /b 1
)
echo.
echo  [OK ] Python packages installed.
echo.

:: ── Step 2: NLTK corpora ─────────────────────────────────────────────────────
echo  [2/3] Downloading NLTK language corpora...
echo        ^(brown, punkt, punkt_tab, averaged_perceptron_tagger^)
echo.
python "%BACKEND_DIR%\download_data.py"
if errorlevel 1 (
    echo  [WARN] NLTK download had issues. The app may still work.
)
echo  [OK ] NLTK data ready.
echo.

:: ── Step 3: Node modules ─────────────────────────────────────────────────────
echo  [3/3] Installing Node.js frontend packages (npm install)...
echo        ^(react, vite, tailwind, recharts, axios, lucide, etc.^)
echo.
cd /d "%FRONTEND_DIR%"
npm install
if errorlevel 1 (
    echo.
    echo  [ERROR] npm install failed.
    echo          Make sure Node.js 18+ is installed and on your PATH.
    pause & exit /b 1
)
cd /d "%PROJECT_DIR%"
echo.
echo  [OK ] Node modules installed.
echo.

:: ── Done ─────────────────────────────────────────────────────────────────────
echo  ============================================================
echo   ALL DONE! Everything is installed.
echo.
echo   Next step: make sure backend\.env exists.
echo   If not, copy backend\.env.example to backend\.env
echo   and fill in your GROQ_API_KEY.
echo.
echo   Then double-click launch_anton.bat to start the app.
echo  ============================================================
echo.
pause
