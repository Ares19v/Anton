@echo off
echo [1/3] Removing old Linux-style venv...
rmdir /s /q "c:\Users\Devansh Tyagi\Desktop\Projects\Anton\backend\venv"

echo [2/3] Creating fresh Windows venv using system Python...
python -m venv "c:\Users\Devansh Tyagi\Desktop\Projects\Anton\backend\venv"
if errorlevel 1 (
    echo ERROR: Could not create venv. Is Python on PATH?
    pause & exit /b 1
)

echo [3/3] Installing requirements using system python -m pip into the venv...
python -m pip install --target "c:\Users\Devansh Tyagi\Desktop\Projects\Anton\backend\venv\Lib\site-packages" -r "c:\Users\Devansh Tyagi\Desktop\Projects\Anton\backend\requirements.txt"
if errorlevel 1 (
    echo WARNING: Some packages may have failed.
)

echo.
echo Downloading NLTK corpora...
python -c "import sys; sys.path.insert(0, r'c:\Users\Devansh Tyagi\Desktop\Projects\Anton\backend\venv\Lib\site-packages'); import nltk; [nltk.download(d, quiet=True) for d in ['brown','punkt','punkt_tab','averaged_perceptron_tagger']]"

echo.
echo ============================================================
echo  DONE! Now run launch_anton.bat to start Anton.
echo ============================================================
pause
