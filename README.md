# Story Universe Platform - 故事宇宙创作平台

一个基于智谱AI大模型的一站式AI创作平台，集成小说创作、角色生成、剧本转换、分镜助手和素材搜索功能。

## 🌟 项目特色

- **🤖 AI驱动创作**：基于GLM-4.6、GLM-4.6 MAX等大模型
- **📚 多功能集成**：小说、角色、剧本、分镜、搜索一站式服务
- **🎨 智能视觉理解**：支持图片/视频分析和内容理解
- **🔍 联网搜索**：实时获取创作灵感和参考资料
- **🎯 MCP工具集成**：扩展的AI工具能力
- **💎 紫色主题UI**：现代化的用户界面设计，支持深色/浅色主题
- **📱 完美响应式**：适配移动端和桌面端的流畅体验
- **✨ 流畅动画**：基于Framer Motion的专业级动画效果

## 🚀 快速开始

### 前置要求

- **Node.js** >= 18.0.0
- **Python** >= 3.9
- **pnpm** 或 **npm** 或 **yarn**
- **Git**

### 1. 克隆项目

```bash
git clone <repository-url>
cd story-universe-platform
```

### 2. 后端配置

#### 2.1 创建Python虚拟环境
```bash
cd backend

# 使用venv创建虚拟环境
python -m venv venv

# Windows激活虚拟环境
.\venv\Scripts\activate

# macOS/Linux激活虚拟环境
source venv/bin/activate
```

#### 2.2 安装Python依赖
```bash
pip install -r requirements.txt
```

#### 2.3 配置环境变量
创建 `.env` 文件在 `backend` 目录下：

```env
# Zhipu AI API密钥
ZHIPU_API_KEY=your_zhipu_api_key_here
ZHIPU_MAX_API_KEY=your_zhipu_max_api_key_here

# 数据库配置
DATABASE_URL=sqlite:///./story_universe.db

# 其他配置
SECRET_KEY=your_secret_key_here
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30
```

#### 2.4 启动后端服务
```bash
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

### 3. 前端配置

#### 3.1 安装依赖
```bash
cd ../frontend

# 使用pnpm（推荐）
pnpm install

# 或使用npm
npm install

# 或使用yarn
yarn install
```

#### 3.2 配置环境变量（可选）
创建 `.env.local` 文件在 `frontend` 目录下：

```env
NEXT_PUBLIC_API_URL=http://localhost:8000
```

#### 3.3 启动前端服务
```bash
# 使用pnpm
pnpm dev

# 或使用npm
npm run dev

# 或使用yarn
yarn dev
```

### 4. 访问应用

- **前端应用**: http://localhost:3000
- **后端API**: http://localhost:8000
- **API文档**: http://localhost:8000/docs

## 🚀 快速启动（推荐）

### Windows 用户

#### 方法一：使用批处理文件（推荐）
```bash
# 双击运行（推荐，最简单）
quick-start.bat

# 或者使用PowerShell脚本
start.ps1
```

#### 方法二：命令行启动
```cmd
# 1. 启动后端
cd backend
python -m venv venv
venv\Scripts\activate
pip install -r requirements.txt
uvicorn main:app --reload --host 0.0.0.0 --port 8000

# 2. 新开终端启动前端
cd frontend
npm install
npm run dev
```

### macOS/Linux 用户
```bash
# 运行启动脚本
./start.sh
```

### 环境检查
```bash
# 检查项目环境配置
node check-setup.js
```

启动脚本会自动：
- ✅ 检查 Node.js 和 Python 环境
- ✅ 安装项目依赖
- ✅ 配置虚拟环境
- ✅ 启动前端和后端服务

### 📝 启动脚本说明

- `quick-start.bat` - Windows批处理文件，最简单直接
- `start.ps1` - Windows PowerShell脚本，功能更完整
- `start.sh` - Unix/Linux shell脚本
- `check-setup.js` - 环境检查工具

## 📋 功能模块

### 📖 小说创作 (Novel Generation)
- 智能小说内容生成
- 多种文体和风格支持
- 可定制的长度和主题
- 结构化故事输出

### 👥 角色生成 (Character Generation)
- 完整的角色设定创建
- 外貌、性格、背景故事
- JSON格式结构化输出
- 可导入导出角色数据

### 🎬 剧本转换 (Script Conversion)
- 小说内容转剧本格式
- 多种剧本模板支持
- 场景分割和对话提取
- 标准化剧本格式

### 📸 分镜助手 (Storyboard Assistant)
- 智能分镜脚本生成
- 镜头语言专业建议
- 视觉元素描述
- CogView-4图像生成

### 🔎 素材搜索 (Material Search)
- 联网搜索创作素材
- 图片/视频内容分析
- 分类素材库
- 参考资料整理

## 🛠 技术栈

### 前端
- **框架**: Next.js 14 + React 18
- **样式**: Tailwind CSS + Shadcn/UI
- **状态管理**: React Hooks
- **HTTP客户端**: Axios
- **组件库**: Radix UI

### 后端
- **框架**: Python + FastAPI
- **数据库**: SQLite
- **API文档**: 自动生成OpenAPI/Swagger
- **异步支持**: AsyncIO

### AI模型
- **GLM-4.6**: 主要的文本生成模型 (200万token)
- **GLM-4.5V**: 视觉理解模型 (600万token)
- **GLM-4.5-Air**: 轻量级推理模型 (1000万token)
- **GLM-4.6 MAX**: 图像视频理解、联网搜索 (100次搜索)
- **CogView-4**: 图像生成模型 (20次生成)

### 集成工具
- **MCP协议**: 扩展AI工具能力
- **图片理解**: zai-mcp-server
- **视频理解**: 视频内容分析
- **联网搜索**: web-search-prime
- **长文本增强**: context7

## 🚀 快速开始

### 环境要求
- Node.js 18+
- Python 3.8+
- 智谱AI API密钥

### 安装步骤

1. **克隆项目**
```bash
git clone https://github.com/your-username/story-universe-platform.git
cd story-universe-platform
```

2. **后端配置**
```bash
cd backend
pip install -r requirements.txt
```

3. **配置环境变量**
```bash
# 复制环境变量模板
cp .env.example .env

# 编辑.env文件，配置API密钥
ZHIPU_API_KEY=your_glm_4_6_key
ZHIPU_MAX_API_KEY=your_glm_4_6_max_key
```

4. **启动后端服务**
```bash
python main.py
```

5. **前端配置**
```bash
cd ../frontend
npm install
```

6. **配置前端环境变量**
```bash
# 编辑.env.local文件
NEXT_PUBLIC_API_URL=http://localhost:8000
```

7. **启动前端服务**
```bash
npm run dev
```

### 访问地址
- 前端界面: http://localhost:3000
- 后端API: http://localhost:8000
- API文档: http://localhost:8000/docs

## 📖 API文档

### 小说创作
```http
POST /api/novel/generate
{
  "genre": "科幻",
  "theme": "人工智能",
  "length": "medium",
  "style": "modern"
}
```

### 角色生成
```http
POST /api/character/generate
{
  "type": "主角",
  "setting": "未来城市",
  "name": "可选角色名"
}
```

### 剧本转换
```http
POST /api/script/convert
{
  "content": "小说文本内容",
  "format": "standard",
  "characters": ["角色1", "角色2"]
}
```

### 分镜生成
```http
POST /api/storyboard/generate
{
  "script": "剧本内容",
  "style": "cinematic",
  "shots": 6
}
```

### 素材搜索
```http
POST /api/search/materials
{
  "query": "古代建筑",
  "type": "image",
  "limit": 10
}
```

## 🔧 配置说明

### API密钥配置
项目需要两个智谱AI API密钥：

1. **GLM-4.6 通用密钥** (200万token资源包)
   - 用于基础文本生成任务
   - 支持GLM-4.6、GLM-4.5V、GLM-4.5-Air模型

2. **GLM-4.6 MAX 密钥** (支持高级功能)
   - 图像和视频理解
   - 联网搜索功能
   - MCP工具集成

### 环境变量详细说明

```bash
# 基本配置
APP_NAME=Story Universe
DEBUG=True

# 智谱AI配置
<<<<<<< HEAD
ZHIPU_API_KEY=1a8daac8efc9495485f8694c5edfa3a4.9kb4gTmEyrWXztY4
ZHIPU_MAX_API_KEY=e654b552ae8b47079555e9e290c98ba7.U3MuFwGafFCriCGN
ZHIPU_BASE_URL=https://open.bigmodel.cn/api/paas/v4/
=======
ZHIPU_API_KEY=your_zhipu_api_key_here
ZHIPU_MAX_API_KEY=your_zhipu_api_key_here
ZHIPU_BASE_URL=your_zhipu_max_api_key_here
>>>>>>> 743abfcb1f6ad0001fb61075ffe141e4ebdc8661

# 资源包配置
GLM_4_6_TOKENS=2000000
GLM_4_5V_TOKENS=6000000
GLM_4_5_AIR_TOKENS=10000000
SEARCH_COUNT=100
IMAGE_GENERATE_COUNT=20

# 数据库配置
DATABASE_URL=sqlite:///./story_universe.db

# 服务器配置
HOST=0.0.0.0
PORT=8000
```

## 🎨 UI设计

### 设计主题
- **主色调**: 紫色 (#6366f1)
- **辅助色**: 渐变紫色系
- **设计风格**: 现代简约、卡片式布局

### 组件库
- 基于Shadcn/UI组件系统
- 响应式设计
- 暗色/亮色主题支持
- 无障碍访问支持

## 🏗 项目结构

```
story-universe-platform/
├── frontend/                 # 前端项目
│   ├── app/                 # Next.js页面路由
│   │   ├── novel/           # 小说创作页面
│   │   ├── character/       # 角色生成页面
│   │   ├── script/          # 剧本转换页面
│   │   ├── storyboard/      # 分镜助手页面
│   │   └── search/          # 素材搜索页面
│   ├── components/          # React组件
│   │   └── ui/             # UI基础组件
│   ├── lib/                # 工具函数
│   └── public/             # 静态资源
├── backend/                # 后端项目
│   ├── api/                # API路由
│   │   └── routes/         # 各模块路由
│   ├── services/           # 业务逻辑服务
│   │   ├── zhipu_service.py    # 智谱AI服务
│   │   └── mcp_service.py      # MCP工具服务
│   ├── models/             # 数据模型
│   ├── utils/              # 工具函数
│   └── main.py             # 应用入口
└── README.md               # 项目文档
```

## 🤝 贡献指南

1. Fork 项目
2. 创建功能分支 (`git checkout -b feature/AmazingFeature`)
3. 提交更改 (`git commit -m 'Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 开启 Pull Request

## 📄 许可证

本项目采用 MIT 许可证 - 查看 [LICENSE](LICENSE) 文件了解详情

## 🆘 故障排除

### 常见问题

1. **API密钥错误**
   - 检查环境变量配置
   - 确认API密钥有效性和权限

2. **前端连接后端失败**
   - 检查后端服务是否启动
   - 确认API地址配置正确

3. **模型调用超时**
   - 检查网络连接
   - 调整超时时间配置

4. **资源包用量耗尽**
   - 检查智谱AI控制台资源使用情况
   - 考虑升级或重新购买资源包

### 技术支持

- 📧 邮箱: support@story-universe.com
- 💬 QQ群: 123456789
- 📱 微信群: 扫描二维码加入
- 📧 邮箱: 19550570767@163.com

## 🎯 路线图

### v1.0 (当前版本)
- ✅ 基础功能实现
- ✅ 智谱AI集成
- ✅ MCP工具支持

### v1.1 (计划中)
- 🔄 用户系统
- 🔄 作品管理
- 🔄 协作功能

### v2.0 (未来)
- 📋 移动端应用
- 📋 多语言支持
- 📋 插件系统

## 🙏 致谢

- 感谢智谱AI提供的强大AI能力
- 感谢开源社区的贡献
- 感谢所有测试用户的反馈

---

**Story Universe Platform** - 让AI助力创意创作 ✨
**Story Universe Platform** - 让AI助力创意创作 ✨
