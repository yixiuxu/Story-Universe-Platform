<<<<<<< HEAD
@echo off
setlocal enabledelayedexpansion

echo ========================================
echo    Story Universe Platform
echo ========================================
echo.

:: Check Node.js
echo Checking Node.js...
node --version >nul 2>&1
if %errorlevel% neq 0 (
    echo [ERROR] Node.js not found. Please install Node.js 18.0.0 or higher
    echo Download: https://nodejs.org/
    pause
    exit /b 1
)
echo [OK] Node.js installed

:: Check Python
echo Checking Python...
python --version >nul 2>&1
if %errorlevel% neq 0 (
    echo [ERROR] Python not found. Please install Python 3.9 or higher
    echo Download: https://www.python.org/downloads/
    pause
    exit /b 1
)
echo [OK] Python installed

echo.
echo ========================================
echo         Choose startup mode
echo ========================================
echo 1. Start frontend only (Next.js)
echo 2. Start backend only (FastAPI)
echo 3. Start both frontend and backend (Recommended)
echo 4. Exit
echo.
set /p choice="Please enter choice (1-4): "

if "%choice%"=="1" goto frontend_only
if "%choice%"=="2" goto backend_only
if "%choice%"=="3" goto both
if "%choice%"=="4" goto end
echo Invalid choice, please run the script again
pause
goto end

:frontend_only
echo.
echo Starting frontend service...
cd /d "%~dp0frontend"
echo Frontend URL: http://localhost:3000
npm run dev
goto end

:backend_only
echo.
echo Checking backend environment...
cd /d "%~dp0backend"

:: Check virtual environment
if not exist "venv" (
    echo Creating Python virtual environment...
    python -m venv venv
    echo [OK] Virtual environment created
)

:: Activate virtual environment
echo Activating virtual environment...
call venv\Scripts\activate

:: Check dependencies
echo Checking Python dependencies...
pip show fastapi >nul 2>&1
if %errorlevel% neq 0 (
    echo Installing Python dependencies...
    pip install -r requirements.txt
    echo [OK] Dependencies installed
)

:: Check environment variables
if not exist ".env" (
    echo [WARNING] .env file not found
    echo Please create .env file in backend directory with:
    echo ZHIPU_API_KEY=your_zhipu_api_key_here
    echo ZHIPU_MAX_API_KEY=your_zhipu_max_api_key_here
    echo DATABASE_URL=sqlite:///./story_universe.db
    echo SECRET_KEY=your_secret_key_here
    echo.
    set /p env_setup="Configure environment variables now? (y/n): "
    if /i "%env_setup%"=="y" (
        echo Enter your Zhipu API Key:
        set /p zhipu_key=
        echo Enter your Zhipu MAX API Key:
        set /p zhipu_max_key=

        (
            echo ZHIPU_API_KEY=%zhipu_key%
            echo ZHIPU_MAX_API_KEY=%zhipu_max_key%
            echo DATABASE_URL=sqlite:///./story_universe.db
            echo SECRET_KEY=your_secret_key_here
            echo ALGORITHM=HS256
            echo ACCESS_TOKEN_EXPIRE_MINUTES=30
        ) > .env
        echo [OK] .env file created
    ) else (
        echo Please configure environment variables manually and run again
        pause
        goto end
    )
)

echo.
echo Starting backend service...
echo Backend URL: http://localhost:8000
echo API Docs: http://localhost:8000/docs
uvicorn main:app --reload --host 0.0.0.0 --port 8000
goto end

:both
echo.
echo Starting full service (frontend + backend)...

:: Start backend
start "Backend Service" cmd /k "cd /d \"%~dp0backend\" && if not exist venv python -m venv venv && venv\Scripts\activate && pip show fastapi >nul 2>&1 || pip install -r requirements.txt && uvicorn main:app --reload --host 0.0.0.0 --port 8000"

:: Wait for backend to start
echo Waiting for backend service to start...
timeout /t 5 /nobreak

:: Start frontend
cd /d "%~dp0frontend"
echo Starting frontend service...
echo.
echo ========================================
echo         Services Started
echo ========================================
echo Frontend: http://localhost:3000
echo Backend:  http://localhost:8000
echo API Docs: http://localhost:8000/docs
echo.
echo Press Ctrl+C to stop services
echo ========================================
npm run dev
goto end

:end
echo.
echo Script execution completed
=======
@echo off
setlocal enabledelayedexpansion

echo ========================================
echo    Story Universe Platform
echo ========================================
echo.

:: Check Node.js
echo Checking Node.js...
node --version >nul 2>&1
if %errorlevel% neq 0 (
    echo [ERROR] Node.js not found. Please install Node.js 18.0.0 or higher
    echo Download: https://nodejs.org/
    pause
    exit /b 1
)
echo [OK] Node.js installed

:: Check Python
echo Checking Python...
python --version >nul 2>&1
if %errorlevel% neq 0 (
    echo [ERROR] Python not found. Please install Python 3.9 or higher
    echo Download: https://www.python.org/downloads/
    pause
    exit /b 1
)
echo [OK] Python installed

echo.
echo ========================================
echo         Choose startup mode
echo ========================================
echo 1. Start frontend only (Next.js)
echo 2. Start backend only (FastAPI)
echo 3. Start both frontend and backend (Recommended)
echo 4. Exit
echo.
set /p choice="Please enter choice (1-4): "

if "%choice%"=="1" goto frontend_only
if "%choice%"=="2" goto backend_only
if "%choice%"=="3" goto both
if "%choice%"=="4" goto end
echo Invalid choice, please run the script again
pause
goto end

:frontend_only
echo.
echo Starting frontend service...
cd /d "%~dp0frontend"
echo Frontend URL: http://localhost:3000
npm run dev
goto end

:backend_only
echo.
echo Checking backend environment...
cd /d "%~dp0backend"

:: Check virtual environment
if not exist "venv" (
    echo Creating Python virtual environment...
    python -m venv venv
    echo [OK] Virtual environment created
)

:: Activate virtual environment
echo Activating virtual environment...
call venv\Scripts\activate

:: Check dependencies
echo Checking Python dependencies...
pip show fastapi >nul 2>&1
if %errorlevel% neq 0 (
    echo Installing Python dependencies...
    pip install -r requirements.txt
    echo [OK] Dependencies installed
)

:: Check environment variables
if not exist ".env" (
    echo [WARNING] .env file not found
    echo Please create .env file in backend directory with:
    echo ZHIPU_API_KEY=your_zhipu_api_key_here
    echo ZHIPU_MAX_API_KEY=your_zhipu_max_api_key_here
    echo DATABASE_URL=sqlite:///./story_universe.db
    echo SECRET_KEY=your_secret_key_here
    echo.
    set /p env_setup="Configure environment variables now? (y/n): "
    if /i "%env_setup%"=="y" (
        echo Enter your Zhipu API Key:
        set /p zhipu_key=
        echo Enter your Zhipu MAX API Key:
        set /p zhipu_max_key=

        (
            echo ZHIPU_API_KEY=%zhipu_key%
            echo ZHIPU_MAX_API_KEY=%zhipu_max_key%
            echo DATABASE_URL=sqlite:///./story_universe.db
            echo SECRET_KEY=your_secret_key_here
            echo ALGORITHM=HS256
            echo ACCESS_TOKEN_EXPIRE_MINUTES=30
        ) > .env
        echo [OK] .env file created
    ) else (
        echo Please configure environment variables manually and run again
        pause
        goto end
    )
)

echo.
echo Starting backend service...
echo Backend URL: http://localhost:8000
echo API Docs: http://localhost:8000/docs
uvicorn main:app --reload --host 0.0.0.0 --port 8000
goto end

:both
echo.
echo Starting full service (frontend + backend)...

:: Start backend
start "Backend Service" cmd /k "cd /d \"%~dp0backend\" && if not exist venv python -m venv venv && venv\Scripts\activate && pip show fastapi >nul 2>&1 || pip install -r requirements.txt && uvicorn main:app --reload --host 0.0.0.0 --port 8000"

:: Wait for backend to start
echo Waiting for backend service to start...
timeout /t 5 /nobreak

:: Start frontend
cd /d "%~dp0frontend"
echo Starting frontend service...
echo.
echo ========================================
echo         Services Started
echo ========================================
echo Frontend: http://localhost:3000
echo Backend:  http://localhost:8000
echo API Docs: http://localhost:8000/docs
echo.
echo Press Ctrl+C to stop services
echo ========================================
npm run dev
goto end

:end
echo.
echo Script execution completed
>>>>>>> 743abfcb1f6ad0001fb61075ffe141e4ebdc8661
pause