@echo off
title ANTON — Install Dependencies
color 0B

set "PROJECT_DIR=%~dp0"
set "BACKEND_DIR=%PROJECT_DIR%backend"
set "FRONTEND_DIR=%PROJECT_DIR%frontend"
set "VENV_DIR=%BACKEND_DIR%\venv"
set "VENV_PYTHON=%VENV_DIR%\Scripts\python.exe"

:: Prefer Python 3.10 if available, fall back to any python on PATH
set "PY310=C:\Users\%USERNAME%\AppData\Local\Programs\Python\Python310\python.exe"
if exist "%PY310%" (
    set "PYTHON=%PY310%"
) else (
    set "PYTHON=python"
)

echo.
echo  ============================================================
echo   ANTON — Dependency Installer
echo   This installs all Python packages and Node modules.
echo   First-time install takes ~3-5 minutes.
echo  ============================================================
echo.

:: ── Step 1: Create venv ───────────────────────────────────────────────────────
echo  [1/4] Creating Python virtual environment in backend\venv\ ...
if not exist "%VENV_PYTHON%" (
    "%PYTHON%" -m venv "%VENV_DIR%"
    if errorlevel 1 (
        echo.
        echo  [ERROR] Failed to create venv.
        echo          Make sure Python 3.10+ is installed and on your PATH.
        pause & exit /b 1
    )
    echo  [OK  ] Virtual environment created.
) else (
    echo  [SKIP] venv already exists.
)
echo.

:: ── Step 2: Install Python packages into venv ─────────────────────────────────
echo  [2/4] Installing Python packages into venv...
echo        ^(fastapi, uvicorn, textblob, groq, passlib, jose, etc.^)
echo.
"%VENV_PYTHON%" -m pip install --upgrade pip --quiet
"%VENV_PYTHON%" -m pip install -r "%BACKEND_DIR%\requirements.txt"
if errorlevel 1 (
    echo.
    echo  [ERROR] pip install failed. Check your requirements.txt.
    pause & exit /b 1
)
echo.
echo  [OK  ] Python packages installed.
echo.

:: ── Step 3: NLTK corpora ─────────────────────────────────────────────────────
echo  [3/4] Downloading NLTK language corpora...
echo        ^(brown, punkt, punkt_tab, averaged_perceptron_tagger^)
echo.
"%VENV_PYTHON%" "%BACKEND_DIR%\download_data.py"
if errorlevel 1 (
    echo  [WARN] NLTK download had issues. The app may still work.
)
echo  [OK  ] NLTK data ready.
echo.

:: ── Step 4: Node modules ─────────────────────────────────────────────────────
echo  [4/4] Installing Node.js frontend packages ^(npm install^)...
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
echo  [OK  ] Node modules installed.
echo.

:: ── Done ─────────────────────────────────────────────────────────────────────
echo  ============================================================
echo   ALL DONE! Everything is installed.
echo.
echo   Next step: make sure backend\.env exists.
echo   If not, copy backend\.env.example to backend\.env
echo   and fill in your GROQ_API_KEY.
echo.
echo   Then double-click Run_Project.bat to start the app.
echo  ============================================================
echo.
pause
