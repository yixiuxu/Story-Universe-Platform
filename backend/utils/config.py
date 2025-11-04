from pydantic_settings import BaseSettings
from typing import Optional

class Settings(BaseSettings):
    # 基本配置
    app_name: str = "Story Universe"
    debug: bool = True

    # 智谱AI配置 - 普通GLM-4.6（优先使用有配额的密钥）
    zhipu_api_key: str = "a072f636608a4435bf47c9ad4ff384e1.mHR3HwS2ShsxM1oa"  # 主密钥（有配额）
    zhipu_base_url: str = "https://open.bigmodel.cn/api/paas/v4/"
    
    # 备用API密钥（用于轮换）
    zhipu_api_key_backup: str = "1a8daac8efc9495485f8694c5edfa3a4.9kb4gTmEyrWXztY4"  # 备用密钥

    # GLM-4.6 MAX API配置 - 支持图像视频理解、联网搜索、MCP
    zhipu_max_api_key: str = "e654b552ae8b47079555e9e290c98ba7.U3MuFwGafFCriCGN"

    # 资源包配置
    glm_4_6_tokens: int = 2000000  # 200万token GLM-4.6
    glm_4_5v_tokens: int = 6000000  # 600万token GLM-4.5V
    glm_4_5_air_tokens: int = 10000000  # 1000万token GLM-4.5-Air
    search_count: int = 100  # 100次搜索
    image_generate_count: int = 20  # 20次图片生成

    # 数据库配置
    database_url: str = "sqlite:///./story_universe.db"

    # JWT配置
    secret_key: str = "your-secret-key-here"
    algorithm: str = "HS256"
    access_token_expire_minutes: int = 30

    # MCP配置
    mcp_server_url: str = "http://localhost:8001"

    # 文件上传配置
    max_file_size: int = 10 * 1024 * 1024  # 10MB
    upload_dir: str = "uploads"

    class Config:
        env_file = ".env"

settings = Settings()