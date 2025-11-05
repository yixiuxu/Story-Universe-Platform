@echo off
echo ========================================
echo   Starting Backend Server
echo ========================================
echo.

cd backend

echo Installing dependencies...
python -m pip install fastapi uvicorn sqlalchemy pydantic python-multipart python-jose passlib zhipuai python-dotenv httpx aiofiles pillow requests pydantic-settings --quiet

echo.
echo Starting server...
echo Backend URL: http://localhost:8000
echo API Docs: http://localhost:8000/docs
echo.

python -m uvicorn main:app --reload --host 0.0.0.0 --port 8000

pause
