<<<<<<< HEAD
#!/bin/bash

echo "========================================"
echo "   Story Universe Platform 启动脚本"
echo "========================================"
echo

# 颜色定义
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# 检查Node.js
echo -e "${BLUE}检查 Node.js...${NC}"
if ! command -v node &> /dev/null; then
    echo -e "${RED}❌ 未找到 Node.js，请先安装 Node.js 18.0.0 或更高版本${NC}"
    echo "下载地址：https://nodejs.org/"
    exit 1
fi
echo -e "${GREEN}✅ Node.js 已安装: $(node --version)${NC}"

# 检查Python
echo -e "${BLUE}检查 Python...${NC}"
if ! command -v python3 &> /dev/null && ! command -v python &> /dev/null; then
    echo -e "${RED}❌ 未找到 Python，请先安装 Python 3.9 或更高版本${NC}"
    echo "下载地址：https://www.python.org/downloads/"
    exit 1
fi
PYTHON_CMD=$(command -v python3 || command -v python)
echo -e "${GREEN}✅ Python 已安装: $($PYTHON_CMD --version)${NC}"

echo
echo "========================================"
echo "         选择启动方式"
echo "========================================"
echo "1. 仅启动前端 (Next.js)"
echo "2. 仅启动后端 (FastAPI)"
echo "3. 同时启动前端和后端 (推荐)"
echo "4. 退出"
echo

read -p "请输入选择 (1-4): " choice

case $choice in
    1)
        echo -e "${BLUE}启动前端服务...${NC}"
        cd "$(dirname "$0")/frontend"
        echo -e "${GREEN}前端服务地址：http://localhost:3000${NC}"
        npm run dev
        ;;
    2)
        echo -e "${BLUE}检查后端环境...${NC}"
        cd "$(dirname "$0")/backend"

        # 检查虚拟环境
        if [ ! -d "venv" ]; then
            echo -e "${YELLOW}创建Python虚拟环境...${NC}"
            $PYTHON_CMD -m venv venv
            echo -e "${GREEN}✅ 虚拟环境创建完成${NC}"
        fi

        # 激活虚拟环境
        echo -e "${BLUE}激活虚拟环境...${NC}"
        source venv/bin/activate

        # 检查依赖
        echo -e "${BLUE}检查Python依赖...${NC}"
        if ! pip show fastapi &> /dev/null; then
            echo -e "${YELLOW}安装Python依赖...${NC}"
            pip install -r requirements.txt
            echo -e "${GREEN}✅ 依赖安装完成${NC}"
        fi

        # 检查环境变量
        if [ ! -f ".env" ]; then
            echo -e "${YELLOW}⚠️  未找到 .env 文件${NC}"
            echo "请在 backend 目录下创建 .env 文件并配置以下内容："
            echo "ZHIPU_API_KEY=your_zhipu_api_key_here"
            echo "ZHIPU_MAX_API_KEY=your_zhipu_max_api_key_here"
            echo "DATABASE_URL=sqlite:///./story_universe.db"
            echo "SECRET_KEY=your_secret_key_here"
            echo
            read -p "是否现在配置环境变量？(y/n): " env_setup
            if [[ $env_setup =~ ^[Yy]$ ]]; then
                read -p "请输入您的 Zhipu API Key: " zhipu_key
                read -p "请输入您的 Zhipu MAX API Key: " zhipu_max_key

                cat > .env << EOF
ZHIPU_API_KEY=$zhipu_key
ZHIPU_MAX_API_KEY=$zhipu_max_key
DATABASE_URL=sqlite:///./story_universe.db
SECRET_KEY=your_secret_key_here
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30
EOF
                echo -e "${GREEN}✅ .env 文件创建完成${NC}"
            else
                echo "请手动配置环境变量后重新运行"
                exit 1
            fi
        fi

        echo
        echo -e "${BLUE}启动后端服务...${NC}"
        echo -e "${GREEN}后端服务地址：http://localhost:8000${NC}"
        echo -e "${GREEN}API文档地址：http://localhost:8000/docs${NC}"
        uvicorn main:app --reload --host 0.0.0.0 --port 8000
        ;;
    3)
        echo -e "${BLUE}启动完整服务（前端 + 后端）...${NC}"

        # 获取脚本目录
        SCRIPT_DIR="$(dirname "$0")"

        # 启动后端（后台运行）
        cd "$SCRIPT_DIR/backend"

        # 检查并设置虚拟环境
        if [ ! -d "venv" ]; then
            $PYTHON_CMD -m venv venv
        fi

        source venv/bin/activate

        if ! pip show fastapi &> /dev/null; then
            pip install -r requirements.txt
        fi

        # 启动后端服务
        echo -e "${BLUE}启动后端服务...${NC}"
        uvicorn main:app --reload --host 0.0.0.0 --port 8000 &
        BACKEND_PID=$!

        # 等待后端启动
        echo -e "${YELLOW}等待后端服务启动...${NC}"
        sleep 5

        # 启动前端
        cd "$SCRIPT_DIR/frontend"
        echo -e "${BLUE}启动前端服务...${NC}"
        echo
        echo "========================================"
        echo "         🎉 服务启动完成"
        echo "========================================"
        echo -e "${GREEN}前端应用：http://localhost:3000${NC}"
        echo -e "${GREEN}后端API：  http://localhost:8000${NC}"
        echo -e "${GREEN}API文档： http://localhost:8000/docs${NC}"
        echo
        echo "按 Ctrl+C 停止服务"
        echo "========================================"

        # 启动前端
        npm run dev
        FRONTEND_PID=$!

        # 清理函数
        cleanup() {
            echo -e "${YELLOW}正在停止服务...${NC}"
            if [ ! -z "$BACKEND_PID" ]; then
                kill $BACKEND_PID 2>/dev/null
            fi
            if [ ! -z "$FRONTEND_PID" ]; then
                kill $FRONTEND_PID 2>/dev/null
            fi
            echo -e "${GREEN}服务已停止${NC}"
            exit 0
        }

        # 捕获中断信号
        trap cleanup SIGINT SIGTERM

        # 等待
        wait
        ;;
    4)
        echo "退出脚本"
        exit 0
        ;;
    *)
        echo -e "${RED}无效选择，请重新运行脚本${NC}"
        exit 1
        ;;
=======
#!/bin/bash

echo "========================================"
echo "   Story Universe Platform 启动脚本"
echo "========================================"
echo

# 颜色定义
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# 检查Node.js
echo -e "${BLUE}检查 Node.js...${NC}"
if ! command -v node &> /dev/null; then
    echo -e "${RED}❌ 未找到 Node.js，请先安装 Node.js 18.0.0 或更高版本${NC}"
    echo "下载地址：https://nodejs.org/"
    exit 1
fi
echo -e "${GREEN}✅ Node.js 已安装: $(node --version)${NC}"

# 检查Python
echo -e "${BLUE}检查 Python...${NC}"
if ! command -v python3 &> /dev/null && ! command -v python &> /dev/null; then
    echo -e "${RED}❌ 未找到 Python，请先安装 Python 3.9 或更高版本${NC}"
    echo "下载地址：https://www.python.org/downloads/"
    exit 1
fi
PYTHON_CMD=$(command -v python3 || command -v python)
echo -e "${GREEN}✅ Python 已安装: $($PYTHON_CMD --version)${NC}"

echo
echo "========================================"
echo "         选择启动方式"
echo "========================================"
echo "1. 仅启动前端 (Next.js)"
echo "2. 仅启动后端 (FastAPI)"
echo "3. 同时启动前端和后端 (推荐)"
echo "4. 退出"
echo

read -p "请输入选择 (1-4): " choice

case $choice in
    1)
        echo -e "${BLUE}启动前端服务...${NC}"
        cd "$(dirname "$0")/frontend"
        echo -e "${GREEN}前端服务地址：http://localhost:3000${NC}"
        npm run dev
        ;;
    2)
        echo -e "${BLUE}检查后端环境...${NC}"
        cd "$(dirname "$0")/backend"

        # 检查虚拟环境
        if [ ! -d "venv" ]; then
            echo -e "${YELLOW}创建Python虚拟环境...${NC}"
            $PYTHON_CMD -m venv venv
            echo -e "${GREEN}✅ 虚拟环境创建完成${NC}"
        fi

        # 激活虚拟环境
        echo -e "${BLUE}激活虚拟环境...${NC}"
        source venv/bin/activate

        # 检查依赖
        echo -e "${BLUE}检查Python依赖...${NC}"
        if ! pip show fastapi &> /dev/null; then
            echo -e "${YELLOW}安装Python依赖...${NC}"
            pip install -r requirements.txt
            echo -e "${GREEN}✅ 依赖安装完成${NC}"
        fi

        # 检查环境变量
        if [ ! -f ".env" ]; then
            echo -e "${YELLOW}⚠️  未找到 .env 文件${NC}"
            echo "请在 backend 目录下创建 .env 文件并配置以下内容："
            echo "ZHIPU_API_KEY=your_zhipu_api_key_here"
            echo "ZHIPU_MAX_API_KEY=your_zhipu_max_api_key_here"
            echo "DATABASE_URL=sqlite:///./story_universe.db"
            echo "SECRET_KEY=your_secret_key_here"
            echo
            read -p "是否现在配置环境变量？(y/n): " env_setup
            if [[ $env_setup =~ ^[Yy]$ ]]; then
                read -p "请输入您的 Zhipu API Key: " zhipu_key
                read -p "请输入您的 Zhipu MAX API Key: " zhipu_max_key

                cat > .env << EOF
ZHIPU_API_KEY=$zhipu_key
ZHIPU_MAX_API_KEY=$zhipu_max_key
DATABASE_URL=sqlite:///./story_universe.db
SECRET_KEY=your_secret_key_here
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30
EOF
                echo -e "${GREEN}✅ .env 文件创建完成${NC}"
            else
                echo "请手动配置环境变量后重新运行"
                exit 1
            fi
        fi

        echo
        echo -e "${BLUE}启动后端服务...${NC}"
        echo -e "${GREEN}后端服务地址：http://localhost:8000${NC}"
        echo -e "${GREEN}API文档地址：http://localhost:8000/docs${NC}"
        uvicorn main:app --reload --host 0.0.0.0 --port 8000
        ;;
    3)
        echo -e "${BLUE}启动完整服务（前端 + 后端）...${NC}"

        # 获取脚本目录
        SCRIPT_DIR="$(dirname "$0")"

        # 启动后端（后台运行）
        cd "$SCRIPT_DIR/backend"

        # 检查并设置虚拟环境
        if [ ! -d "venv" ]; then
            $PYTHON_CMD -m venv venv
        fi

        source venv/bin/activate

        if ! pip show fastapi &> /dev/null; then
            pip install -r requirements.txt
        fi

        # 启动后端服务
        echo -e "${BLUE}启动后端服务...${NC}"
        uvicorn main:app --reload --host 0.0.0.0 --port 8000 &
        BACKEND_PID=$!

        # 等待后端启动
        echo -e "${YELLOW}等待后端服务启动...${NC}"
        sleep 5

        # 启动前端
        cd "$SCRIPT_DIR/frontend"
        echo -e "${BLUE}启动前端服务...${NC}"
        echo
        echo "========================================"
        echo "         🎉 服务启动完成"
        echo "========================================"
        echo -e "${GREEN}前端应用：http://localhost:3000${NC}"
        echo -e "${GREEN}后端API：  http://localhost:8000${NC}"
        echo -e "${GREEN}API文档： http://localhost:8000/docs${NC}"
        echo
        echo "按 Ctrl+C 停止服务"
        echo "========================================"

        # 启动前端
        npm run dev
        FRONTEND_PID=$!

        # 清理函数
        cleanup() {
            echo -e "${YELLOW}正在停止服务...${NC}"
            if [ ! -z "$BACKEND_PID" ]; then
                kill $BACKEND_PID 2>/dev/null
            fi
            if [ ! -z "$FRONTEND_PID" ]; then
                kill $FRONTEND_PID 2>/dev/null
            fi
            echo -e "${GREEN}服务已停止${NC}"
            exit 0
        }

        # 捕获中断信号
        trap cleanup SIGINT SIGTERM

        # 等待
        wait
        ;;
    4)
        echo "退出脚本"
        exit 0
        ;;
    *)
        echo -e "${RED}无效选择，请重新运行脚本${NC}"
        exit 1
        ;;
>>>>>>> 743abfcb1f6ad0001fb61075ffe141e4ebdc8661
esac