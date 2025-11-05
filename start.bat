<<<<<<< HEAD
@echo off
chcp 65001 >nul
echo ========================================
echo    Story Universe Platform
echo ========================================
echo.

:: 检查Node.js
echo 检查 Node.js...
node --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ 未找到 Node.js，请先安装 Node.js 18.0.0 或更高版本
    echo 下载地址：https://nodejs.org/
    pause
    exit /b 1
)
echo ✅ Node.js 已安装

:: 检查Python
echo 检查 Python...
python --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ 未找到 Python，请先安装 Python 3.9 或更高版本
    echo 下载地址：https://www.python.org/downloads/
    pause
    exit /b 1
)
echo ✅ Python 已安装

echo.
echo ========================================
echo         选择启动方式
echo ========================================
echo 1. 仅启动前端 (Next.js)
echo 2. 仅启动后端 (FastAPI)
echo 3. 同时启动前端和后端 (推荐)
echo 4. 退出
echo.
set /p choice="请输入选择 (1-4): "

if "%choice%"=="1" goto frontend_only
if "%choice%"=="2" goto backend_only
if "%choice%"=="3" goto both
if "%choice%"=="4" goto end
echo 无效选择，请重新运行脚本
pause
goto end

:frontend_only
echo.
echo 启动前端服务...
cd /d "%~dp0frontend"
echo 前端服务地址：http://localhost:3000
npm run dev
goto end

:backend_only
echo.
echo 检查后端环境...
cd /d "%~dp0backend"

:: 检查虚拟环境
if not exist "venv" (
    echo 创建Python虚拟环境...
    python -m venv venv
    echo ✅ 虚拟环境创建完成
)

:: 激活虚拟环境
echo 激活虚拟环境...
call venv\Scripts\activate

:: 检查依赖
echo 检查Python依赖...
pip show fastapi >nul 2>&1
if %errorlevel% neq 0 (
    echo 安装Python依赖...
    pip install -r requirements.txt
    echo ✅ 依赖安装完成
)

:: 检查环境变量
if not exist ".env" (
    echo ⚠️  未找到 .env 文件
    echo 请在 backend 目录下创建 .env 文件并配置以下内容：
    echo ZHIPU_API_KEY=your_zhipu_api_key_here
    echo ZHIPU_MAX_API_KEY=your_zhipu_max_api_key_here
    echo DATABASE_URL=sqlite:///./story_universe.db
    echo SECRET_KEY=your_secret_key_here
    echo.
    set /p env_setup="是否现在配置环境变量？(y/n): "
    if /i "%env_setup%"=="y" (
        echo 请输入您的 Zhipu API Key:
        set /p zhipu_key=
        echo 请输入您的 Zhipu MAX API Key:
        set /p zhipu_max_key=

        (
            echo ZHIPU_API_KEY=%zhipu_key%
            echo ZHIPU_MAX_API_KEY=%zhipu_max_key%
            echo DATABASE_URL=sqlite:///./story_universe.db
            echo SECRET_KEY=your_secret_key_here
            echo ALGORITHM=HS256
            echo ACCESS_TOKEN_EXPIRE_MINUTES=30
        ) > .env
        echo ✅ .env 文件创建完成
    ) else (
        echo 请手动配置环境变量后重新运行
        pause
        goto end
    )
)

echo.
echo 启动后端服务...
echo 后端服务地址：http://localhost:8000
echo API文档地址：http://localhost:8000/docs
uvicorn main:app --reload --host 0.0.0.0 --port 8000
goto end

:both
echo.
echo 启动完整服务（前端 + 后端）...

:: 启动后端
start "后端服务" cmd /k "cd /d \"%~dp0backend\" && if not exist venv python -m venv venv && venv\Scripts\activate && pip show fastapi >nul 2>&1 || pip install -r requirements.txt && uvicorn main:app --reload --host 0.0.0.0 --port 8000"

:: 等待后端启动
echo 等待后端服务启动...
timeout /t 5 /nobreak

:: 启动前端
cd /d "%~dp0frontend"
echo 启动前端服务...
echo.
echo ========================================
echo         🎉 服务启动完成
echo ========================================
echo 前端应用：http://localhost:3000
echo 后端API：  http://localhost:8000
echo API文档： http://localhost:8000/docs
echo.
echo 按 Ctrl+C 停止服务
echo ========================================
npm run dev
goto end

:end
echo.
echo 脚本执行完成
=======
@echo off
chcp 65001 >nul
echo ========================================
echo    Story Universe Platform
echo ========================================
echo.

:: 检查Node.js
echo 检查 Node.js...
node --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ 未找到 Node.js，请先安装 Node.js 18.0.0 或更高版本
    echo 下载地址：https://nodejs.org/
    pause
    exit /b 1
)
echo ✅ Node.js 已安装

:: 检查Python
echo 检查 Python...
python --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ 未找到 Python，请先安装 Python 3.9 或更高版本
    echo 下载地址：https://www.python.org/downloads/
    pause
    exit /b 1
)
echo ✅ Python 已安装

echo.
echo ========================================
echo         选择启动方式
echo ========================================
echo 1. 仅启动前端 (Next.js)
echo 2. 仅启动后端 (FastAPI)
echo 3. 同时启动前端和后端 (推荐)
echo 4. 退出
echo.
set /p choice="请输入选择 (1-4): "

if "%choice%"=="1" goto frontend_only
if "%choice%"=="2" goto backend_only
if "%choice%"=="3" goto both
if "%choice%"=="4" goto end
echo 无效选择，请重新运行脚本
pause
goto end

:frontend_only
echo.
echo 启动前端服务...
cd /d "%~dp0frontend"
echo 前端服务地址：http://localhost:3000
npm run dev
goto end

:backend_only
echo.
echo 检查后端环境...
cd /d "%~dp0backend"

:: 检查虚拟环境
if not exist "venv" (
    echo 创建Python虚拟环境...
    python -m venv venv
    echo ✅ 虚拟环境创建完成
)

:: 激活虚拟环境
echo 激活虚拟环境...
call venv\Scripts\activate

:: 检查依赖
echo 检查Python依赖...
pip show fastapi >nul 2>&1
if %errorlevel% neq 0 (
    echo 安装Python依赖...
    pip install -r requirements.txt
    echo ✅ 依赖安装完成
)

:: 检查环境变量
if not exist ".env" (
    echo ⚠️  未找到 .env 文件
    echo 请在 backend 目录下创建 .env 文件并配置以下内容：
    echo ZHIPU_API_KEY=your_zhipu_api_key_here
    echo ZHIPU_MAX_API_KEY=your_zhipu_max_api_key_here
    echo DATABASE_URL=sqlite:///./story_universe.db
    echo SECRET_KEY=your_secret_key_here
    echo.
    set /p env_setup="是否现在配置环境变量？(y/n): "
    if /i "%env_setup%"=="y" (
        echo 请输入您的 Zhipu API Key:
        set /p zhipu_key=
        echo 请输入您的 Zhipu MAX API Key:
        set /p zhipu_max_key=

        (
            echo ZHIPU_API_KEY=%zhipu_key%
            echo ZHIPU_MAX_API_KEY=%zhipu_max_key%
            echo DATABASE_URL=sqlite:///./story_universe.db
            echo SECRET_KEY=your_secret_key_here
            echo ALGORITHM=HS256
            echo ACCESS_TOKEN_EXPIRE_MINUTES=30
        ) > .env
        echo ✅ .env 文件创建完成
    ) else (
        echo 请手动配置环境变量后重新运行
        pause
        goto end
    )
)

echo.
echo 启动后端服务...
echo 后端服务地址：http://localhost:8000
echo API文档地址：http://localhost:8000/docs
uvicorn main:app --reload --host 0.0.0.0 --port 8000
goto end

:both
echo.
echo 启动完整服务（前端 + 后端）...

:: 启动后端
start "后端服务" cmd /k "cd /d \"%~dp0backend\" && if not exist venv python -m venv venv && venv\Scripts\activate && pip show fastapi >nul 2>&1 || pip install -r requirements.txt && uvicorn main:app --reload --host 0.0.0.0 --port 8000"

:: 等待后端启动
echo 等待后端服务启动...
timeout /t 5 /nobreak

:: 启动前端
cd /d "%~dp0frontend"
echo 启动前端服务...
echo.
echo ========================================
echo         🎉 服务启动完成
echo ========================================
echo 前端应用：http://localhost:3000
echo 后端API：  http://localhost:8000
echo API文档： http://localhost:8000/docs
echo.
echo 按 Ctrl+C 停止服务
echo ========================================
npm run dev
goto end

:end
echo.
echo 脚本执行完成
>>>>>>> 743abfcb1f6ad0001fb61075ffe141e4ebdc8661
pause