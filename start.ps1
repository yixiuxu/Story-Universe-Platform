<<<<<<< HEAD
# Story Universe Platform PowerShell启动脚本

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "   Story Universe Platform" -ForegroundColor Yellow
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# 检查Node.js
Write-Host "检查 Node.js..." -ForegroundColor Gray
try {
    $nodeVersion = node --version
    Write-Host "✓ Node.js 已安装: $nodeVersion" -ForegroundColor Green
} catch {
    Write-Host "✗ 未找到 Node.js，请从 https://nodejs.org/ 安装" -ForegroundColor Red
    Read-Host "按回车键退出"
    exit
}

# 检查Python
Write-Host "检查 Python..." -ForegroundColor Gray
try {
    $pythonVersion = python --version
    Write-Host "✓ Python 已安装: $pythonVersion" -ForegroundColor Green
} catch {
    Write-Host "✗ 未找到 Python，请从 https://www.python.org/ 安装" -ForegroundColor Red
    Read-Host "按回车键退出"
    exit
}

Write-Host ""
Write-Host "选择启动方式:" -ForegroundColor Yellow
Write-Host "1. 仅启动前端" -ForegroundColor White
Write-Host "2. 仅启动后端" -ForegroundColor White
Write-Host "3. 同时启动前后端(推荐)" -ForegroundColor White
Write-Host "4. 退出" -ForegroundColor White
Write-Host ""

$choice = Read-Host "请输入选择 (1-4)"

switch ($choice) {
    "1" {
        Write-Host "启动前端服务..." -ForegroundColor Blue
        Set-Location frontend
        Write-Host "前端地址: http://localhost:3000" -ForegroundColor Green
        npm run dev
    }
    "2" {
        Write-Host "启动后端服务..." -ForegroundColor Blue
        Set-Location backend

        # 检查虚拟环境
        if (-not (Test-Path "venv")) {
            Write-Host "创建Python虚拟环境..." -ForegroundColor Yellow
            python -m venv venv
        }

        # 激活虚拟环境
        Write-Host "激活虚拟环境..." -ForegroundColor Yellow
        & venv\Scripts\Activate.ps1

        # 检查依赖
        try {
            pip show fastapi | Out-Null
            Write-Host "依赖已安装" -ForegroundColor Green
        } catch {
            Write-Host "安装Python依赖..." -ForegroundColor Yellow
            pip install -r requirements.txt
        }

        # 检查环境变量
        if (-not (Test-Path ".env")) {
            Write-Host "⚠️ 未找到 .env 文件" -ForegroundColor Yellow
            Write-Host "请在 backend 目录创建 .env 文件并配置 Zhipu API 密钥" -ForegroundColor Yellow
            $configure = Read-Host "是否现在配置？(y/n)"
            if ($configure -eq "y") {
                $apiKey = Read-Host "请输入 Zhipu API Key"
                $maxKey = Read-Host "请输入 Zhipu MAX API Key"

                @"
ZHIPU_API_KEY=$apiKey
ZHIPU_MAX_API_KEY=$maxKey
DATABASE_URL=sqlite:///./story_universe.db
SECRET_KEY=your_secret_key_here
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30
"@ | Out-File -FilePath ".env" -Encoding UTF8
                Write-Host "✓ .env 文件创建完成" -ForegroundColor Green
            }
        }

        Write-Host "后端地址: http://localhost:8000" -ForegroundColor Green
        Write-Host "API文档: http://localhost:8000/docs" -ForegroundColor Green
        uvicorn main:app --reload --host 0.0.0.0 --port 8000
    }
    "3" {
        Write-Host "启动完整服务..." -ForegroundColor Blue

        # 启动后端
        $backendJob = Start-Job -ScriptBlock {
            Set-Location $using:PWD\backend
            if (-not (Test-Path "venv")) {
                python -m venv venv
            }
            & venv\Scripts\Activate.ps1
            try {
                pip show fastapi | Out-Null
            } catch {
                pip install -r requirements.txt
            }
            uvicorn main:app --reload --host 0.0.0.0 --port 8000
        }

        Write-Host "等待后端启动..." -ForegroundColor Yellow
        Start-Sleep -Seconds 5

        # 启动前端
        Set-Location frontend
        Write-Host ""
        Write-Host "========================================" -ForegroundColor Cyan
        Write-Host "      🎉 服务启动完成" -ForegroundColor Green
        Write-Host "========================================" -ForegroundColor Cyan
        Write-Host "前端应用: http://localhost:3000" -ForegroundColor White
        Write-Host "后端API:  http://localhost:8000" -ForegroundColor White
        Write-Host "API文档: http://localhost:8000/docs" -ForegroundColor White
        Write-Host "按 Ctrl+C 停止服务" -ForegroundColor Yellow
        Write-Host "========================================" -ForegroundColor Cyan
        Write-Host ""

        npm run dev

        # 清理后台任务
        Stop-Job $backendJob
        Remove-Job $backendJob
    }
    "4" {
        Write-Host "退出" -ForegroundColor Gray
        exit
    }
    default {
        Write-Host "无效选择" -ForegroundColor Red
    }
=======
# Story Universe Platform PowerShell启动脚本

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "   Story Universe Platform" -ForegroundColor Yellow
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# 检查Node.js
Write-Host "检查 Node.js..." -ForegroundColor Gray
try {
    $nodeVersion = node --version
    Write-Host "✓ Node.js 已安装: $nodeVersion" -ForegroundColor Green
} catch {
    Write-Host "✗ 未找到 Node.js，请从 https://nodejs.org/ 安装" -ForegroundColor Red
    Read-Host "按回车键退出"
    exit
}

# 检查Python
Write-Host "检查 Python..." -ForegroundColor Gray
try {
    $pythonVersion = python --version
    Write-Host "✓ Python 已安装: $pythonVersion" -ForegroundColor Green
} catch {
    Write-Host "✗ 未找到 Python，请从 https://www.python.org/ 安装" -ForegroundColor Red
    Read-Host "按回车键退出"
    exit
}

Write-Host ""
Write-Host "选择启动方式:" -ForegroundColor Yellow
Write-Host "1. 仅启动前端" -ForegroundColor White
Write-Host "2. 仅启动后端" -ForegroundColor White
Write-Host "3. 同时启动前后端(推荐)" -ForegroundColor White
Write-Host "4. 退出" -ForegroundColor White
Write-Host ""

$choice = Read-Host "请输入选择 (1-4)"

switch ($choice) {
    "1" {
        Write-Host "启动前端服务..." -ForegroundColor Blue
        Set-Location frontend
        Write-Host "前端地址: http://localhost:3000" -ForegroundColor Green
        npm run dev
    }
    "2" {
        Write-Host "启动后端服务..." -ForegroundColor Blue
        Set-Location backend

        # 检查虚拟环境
        if (-not (Test-Path "venv")) {
            Write-Host "创建Python虚拟环境..." -ForegroundColor Yellow
            python -m venv venv
        }

        # 激活虚拟环境
        Write-Host "激活虚拟环境..." -ForegroundColor Yellow
        & venv\Scripts\Activate.ps1

        # 检查依赖
        try {
            pip show fastapi | Out-Null
            Write-Host "依赖已安装" -ForegroundColor Green
        } catch {
            Write-Host "安装Python依赖..." -ForegroundColor Yellow
            pip install -r requirements.txt
        }

        # 检查环境变量
        if (-not (Test-Path ".env")) {
            Write-Host "⚠️ 未找到 .env 文件" -ForegroundColor Yellow
            Write-Host "请在 backend 目录创建 .env 文件并配置 Zhipu API 密钥" -ForegroundColor Yellow
            $configure = Read-Host "是否现在配置？(y/n)"
            if ($configure -eq "y") {
                $apiKey = Read-Host "请输入 Zhipu API Key"
                $maxKey = Read-Host "请输入 Zhipu MAX API Key"

                @"
ZHIPU_API_KEY=$apiKey
ZHIPU_MAX_API_KEY=$maxKey
DATABASE_URL=sqlite:///./story_universe.db
SECRET_KEY=your_secret_key_here
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30
"@ | Out-File -FilePath ".env" -Encoding UTF8
                Write-Host "✓ .env 文件创建完成" -ForegroundColor Green
            }
        }

        Write-Host "后端地址: http://localhost:8000" -ForegroundColor Green
        Write-Host "API文档: http://localhost:8000/docs" -ForegroundColor Green
        uvicorn main:app --reload --host 0.0.0.0 --port 8000
    }
    "3" {
        Write-Host "启动完整服务..." -ForegroundColor Blue

        # 启动后端
        $backendJob = Start-Job -ScriptBlock {
            Set-Location $using:PWD\backend
            if (-not (Test-Path "venv")) {
                python -m venv venv
            }
            & venv\Scripts\Activate.ps1
            try {
                pip show fastapi | Out-Null
            } catch {
                pip install -r requirements.txt
            }
            uvicorn main:app --reload --host 0.0.0.0 --port 8000
        }

        Write-Host "等待后端启动..." -ForegroundColor Yellow
        Start-Sleep -Seconds 5

        # 启动前端
        Set-Location frontend
        Write-Host ""
        Write-Host "========================================" -ForegroundColor Cyan
        Write-Host "      🎉 服务启动完成" -ForegroundColor Green
        Write-Host "========================================" -ForegroundColor Cyan
        Write-Host "前端应用: http://localhost:3000" -ForegroundColor White
        Write-Host "后端API:  http://localhost:8000" -ForegroundColor White
        Write-Host "API文档: http://localhost:8000/docs" -ForegroundColor White
        Write-Host "按 Ctrl+C 停止服务" -ForegroundColor Yellow
        Write-Host "========================================" -ForegroundColor Cyan
        Write-Host ""

        npm run dev

        # 清理后台任务
        Stop-Job $backendJob
        Remove-Job $backendJob
    }
    "4" {
        Write-Host "退出" -ForegroundColor Gray
        exit
    }
    default {
        Write-Host "无效选择" -ForegroundColor Red
    }
>>>>>>> 743abfcb1f6ad0001fb61075ffe141e4ebdc8661
}