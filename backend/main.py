from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from api.routes import novel, character, script, storyboard, search, novel_stream, character_stream, script_stream, storyboard_stream
from utils.config import settings
import os

app = FastAPI(
    title="Story Universe API",
    description="故事创作平台后端API",
    version="1.0.0"
)

# 挂载静态文件目录
os.makedirs("uploads", exist_ok=True)
app.mount("/uploads", StaticFiles(directory="uploads"), name="uploads")

# 配置CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "http://localhost:3001", 
        "http://localhost:3002",
        "http://127.0.0.1:3000",
        "http://127.0.0.1:3001",
        "http://127.0.0.1:3002"
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# 注册路由
app.include_router(novel.router, prefix="/api/novel", tags=["novel"])
app.include_router(novel_stream.router, prefix="/api/novel", tags=["novel-stream"])
app.include_router(character.router, prefix="/api/character", tags=["character"])
app.include_router(character_stream.router, prefix="/api/character", tags=["character-stream"])
app.include_router(script.router, prefix="/api/script", tags=["script"])
app.include_router(script_stream.router, prefix="/api/script", tags=["script-stream"])
app.include_router(storyboard.router, prefix="/api/storyboard", tags=["storyboard"])
app.include_router(storyboard_stream.router, prefix="/api/storyboard", tags=["storyboard-stream"])
app.include_router(search.router, prefix="/api/search", tags=["search"])

@app.get("/")
async def root():
    return {"message": "Story Universe API is running"}

@app.get("/health")
async def health_check():
    return {"status": "healthy"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(
        "main:app",
        host="0.0.0.0",
        port=8000,
        reload=True,
        timeout_keep_alive=300,  # 5分钟超时
        limit_max_requests=1000,
        limit_concurrency=100
    )