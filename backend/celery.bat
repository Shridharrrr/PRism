@echo off
REM Windows batch script to start Celery worker with solo pool
echo Starting Celery worker with solo pool for Windows...
echo.

REM Check if virtual environment is activated
if not defined VIRTUAL_ENV (
    echo Error: Virtual environment is not activated!
    echo Please run: venv\Scripts\activate
    pause
    exit /b 1
)

REM Start Celery worker with solo pool (Windows compatible)
celery.exe -A celery_app worker --pool=solo --loglevel=info

pause
