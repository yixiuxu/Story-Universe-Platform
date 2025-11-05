@echo off
echo ========================================
echo   Starting Frontend Server
echo ========================================
echo.

cd frontend

set PATH=C:\Program Files\nodejs;%PATH%

echo Checking npm...
npm --version

echo.
echo Starting development server...
echo Frontend URL: http://localhost:3000
echo.

npm run dev

pause
