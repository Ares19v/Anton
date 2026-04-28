@echo off
title ANTON — Uninstall Dependencies
color 0C

set "PROJECT_DIR=%~dp0"
set "BACKEND_DIR=%PROJECT_DIR%backend"
set "FRONTEND_DIR=%PROJECT_DIR%frontend"

echo.
echo  ============================================================
echo   ANTON — Dependency Uninstaller
echo.
echo   This will remove:
echo     - All Python packages listed in requirements.txt
echo     - NLTK language corpora (brown, punkt, etc.)
echo     - frontend\node_modules\   ^(heaviest folder, ~200-400 MB^)
echo     - backend\venv\            ^(unused Linux venv^)
echo.
echo   Your code, .env, and database are NEVER touched.
echo   Re-install anytime by running install.bat.
echo  ============================================================
echo.

:: ── Confirmation prompt ───────────────────────────────────────────────────────
set /p CONFIRM="  Type YES to proceed, anything else to cancel: "
if /i not "%CONFIRM%"=="YES" (
    echo  Cancelled. Nothing was changed.
    pause & exit /b 0
)
echo.

:: ── Step 1: Uninstall Python packages ────────────────────────────────────────
echo  [1/4] Uninstalling Python packages...
python -m pip uninstall -r "%BACKEND_DIR%\requirements.txt" -y >nul 2>&1
echo  [OK ] Python packages removed.
echo.

:: ── Step 2: Remove NLTK corpora ──────────────────────────────────────────────
echo  [2/4] Removing NLTK corpora...
set "NLTK_DIR=%USERPROFILE%\nltk_data"
if exist "%NLTK_DIR%\corpora\brown"                     rmdir /s /q "%NLTK_DIR%\corpora\brown"
if exist "%NLTK_DIR%\tokenizers\punkt"                  rmdir /s /q "%NLTK_DIR%\tokenizers\punkt"
if exist "%NLTK_DIR%\tokenizers\punkt_tab"              rmdir /s /q "%NLTK_DIR%\tokenizers\punkt_tab"
if exist "%NLTK_DIR%\taggers\averaged_perceptron_tagger" rmdir /s /q "%NLTK_DIR%\taggers\averaged_perceptron_tagger"
echo  [OK ] NLTK corpora removed.
echo.

:: ── Step 3: Delete node_modules ──────────────────────────────────────────────
echo  [3/4] Deleting frontend\node_modules\ ...
echo        ^(This is the heaviest folder — up to 400 MB^)
if exist "%FRONTEND_DIR%\node_modules" (
    rmdir /s /q "%FRONTEND_DIR%\node_modules"
    echo  [OK ] node_modules deleted.
) else (
    echo  [SKIP] node_modules not found ^(already clean^).
)
echo.

:: ── Step 4: Delete backend venv ─────────────────────────────────────────────
echo  [4/4] Deleting backend\venv\ ^(Python virtual environment — ~200 MB^)...
if exist "%BACKEND_DIR%\venv" (
    rmdir /s /q "%BACKEND_DIR%\venv"
    echo  [OK ] venv deleted.
) else (
    echo  [SKIP] venv not found ^(already clean^).
)
echo.

:: ── Done ─────────────────────────────────────────────────────────────────────
echo  ============================================================
echo   Cleanup complete! Your laptop is lighter now.
echo.
echo   To restore everything: run install.bat
echo   To start Anton:        run Run_Project.bat
echo   ^(Run_Project.bat will auto-install if packages are missing^)
echo  ============================================================
echo.
pause
