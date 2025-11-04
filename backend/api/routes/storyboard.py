from fastapi import APIRouter, HTTPException, UploadFile, File
from pydantic import BaseModel
from typing import Optional, List, Dict, Any
from services.zhipu_service import zhipu_service
from services.mcp_service import mcp_service
import uuid
import os

router = APIRouter()

class StoryboardGenerateRequest(BaseModel):
    script: str  # 剧本内容
    style: str = "cinematic"  # 分镜风格
    shots: int = 6  # 镜头数量
    scene_description: Optional[str] = None  # 场景描述

class StoryboardResponse(BaseModel):
    success: bool
    storyboard: Optional[List[Dict[str, Any]]] = None
    error: Optional[str] = None

class ReferenceAnalysisRequest(BaseModel):
    image_url: str  # 图片URL
    analysis_type: str = "composition"  # 分析类型：composition、lighting、color、style
    description: Optional[str] = None  # 额外描述

class ReferenceAnalysisResponse(BaseModel):
    success: bool
    analysis: Optional[Dict[str, Any]] = None
    error: Optional[str] = None

class VideoAnalysisRequest(BaseModel):
    video_url: Optional[str] = None  # 视频URL
    analysis_focus: str = "storyboard"  # 分析重点：storyboard、cinematography、editing
    description: Optional[str] = None  # 额外描述

class VideoAnalysisResponse(BaseModel):
    success: bool
    analysis: Optional[Dict[str, Any]] = None
    error: Optional[str] = None

@router.post("/generate", response_model=StoryboardResponse)
async def generate_storyboard(request: StoryboardGenerateRequest):
    """生成分镜脚本"""
    try:
        # 使用 GLM-4.6 生成文字转分镜
        system_prompt = f"""
        你是一个专业的分镜师，请根据以下剧本内容生成详细的分镜脚本：

        剧本内容：
        {request.script}

        分镜风格：{request.style}
        镜头数量：{request.shots}
        {f"场景描述：{request.scene_description}" if request.scene_description else ""}

        请为每个镜头生成包含以下信息的分镜：
        1. shot_number: 镜头编号
        2. shot_type: 景别（全景、中景、近景、特写等）
        3. angle: 角度（平视、俯视、仰视、斜角等）
        4. movement: 镜头运动（固定、推、拉、摇、移等）
        5. description: 画面描述
        6. action: 动作指示
        7. dialogue: 对话内容
        8. duration: 预计时长
        9. transition: 转场方式
        10. lighting: 光线要求
        11. color_tone: 色调要求
        12. composition: 构图说明
        13. mood: 氛围营造

        请确保每个镜头都有完整的信息，便于实际的影视制作。
        以JSON数组格式返回分镜数据。
        """

        messages = [
            {"role": "system", "content": system_prompt},
            {"role": "user", "content": "请为这段剧本生成分镜脚本。"}
        ]

        response = await zhipu_service.chat_completion(
            model="glm-4.6",
            messages=messages,
            max_tokens=4000
        )

        content = response["choices"][0]["message"]["content"]
        
        # 清理markdown代码块
        content = content.strip()
        if content.startswith("```json"):
            content = content[7:]
        if content.startswith("```"):
            content = content[3:]
        if content.endswith("```"):
            content = content[:-3]
        content = content.strip()

        # 尝试解析JSON
        try:
            import json
            storyboard_data = json.loads(content)
            
            print(f"[DEBUG] Parsed storyboard data type: {type(storyboard_data)}")
            print(f"[DEBUG] Storyboard data keys: {storyboard_data.keys() if isinstance(storyboard_data, dict) else 'is list'}")
            
            if not isinstance(storyboard_data, list):
                # 如果不是数组，尝试提取数组内容
                if isinstance(storyboard_data, dict) and 'storyboard' in storyboard_data:
                    storyboard_data = storyboard_data['storyboard']
                else:
                    # 可能是单个对象，包装成数组
                    storyboard_data = [storyboard_data]
            
            print(f"[DEBUG] Final storyboard count: {len(storyboard_data)}")
            
        except Exception as e:
            print(f"[ERROR] JSON parse failed: {str(e)}")
            print(f"[DEBUG] Content preview: {content[:500]}")
            # 如果JSON解析失败，返回原始内容
            storyboard_data = [
                {
                    "shot_number": 1,
                    "shot_type": "说明",
                    "angle": "-",
                    "movement": "-",
                    "description": "AI返回的内容无法解析为标准JSON格式，请查看原始内容",
                    "action": "-",
                    "dialogue": "-",
                    "duration": "-",
                    "transition": "-",
                    "lighting": "-",
                    "color_tone": "-",
                    "composition": "-",
                    "mood": "-",
                    "note": "JSON解析失败，请查看raw_content字段",
                    "raw_content": content
                }
            ]

        return StoryboardResponse(
            success=True,
            storyboard=storyboard_data
        )
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"分镜生成失败: {str(e)}"
        )

@router.post("/analyze", response_model=ReferenceAnalysisResponse)
async def analyze_reference(request: ReferenceAnalysisRequest):
    """分析参考图片"""
    try:
        # 使用 zai-mcp-server MCP 分析图片
        analysis_types = {
            "composition": """请详细分析这张图片的构图要素，包括：
            - 构图方式（三分法、黄金分割、对称等）
            - 视觉焦点和引导线
            - 前景、中景、背景的安排
            - 元素的空间关系
            - 构图的平衡感和张力""",

            "lighting": """请详细分析这张图片的光影效果，包括：
            - 光源类型和方向
            - 光线强度和质量
            - 阴影的运用
            - 高光和暗部的对比
            - 光线营造的氛围""",

            "color": """请详细分析这张图片的色彩运用，包括：
            - 主色调和配色方案
            - 色彩对比和和谐
            - 色温倾向
            - 色彩的情感表达
            - 色彩对整体氛围的影响""",

            "style": """请详细分析这张图片的艺术风格，包括：
            - 整体风格特征
            - 表现技法和手法
            - 艺术流派的借鉴
            - 时代和地域特征
            - 创作意图和表达"""
        }

        prompt = analysis_types.get(request.analysis_type, "请全面分析这张图片的视觉特征")
        if request.description:
            prompt += f"\n\n特别关注：{request.description}"

        # 使用MAX密钥的图像理解功能
        analysis_text = await zhipu_service.analyze_image(
            image_url=request.image_url,
            prompt=prompt
        )

        return ReferenceAnalysisResponse(
            success=True,
            analysis={"content": analysis_text, "type": request.analysis_type}
        )
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"图片分析失败: {str(e)}"
        )

@router.post("/analyze-video", response_model=VideoAnalysisResponse)
async def analyze_video(request: VideoAnalysisRequest):
    """分析视频分镜"""
    try:
        # 使用 zai-mcp-server MCP 分析视频
        if not request.video_url:
            raise ValueError("视频URL不能为空")

        analysis_focuses = {
            "storyboard": """请详细分析这个视频的分镜技巧，包括：
            - 镜头的运用和变化
            - 景别的转换规律
            - 构图和画面设计
            - 视觉叙事技巧
            - 可以学习的分镜手法""",

            "cinematography": """请详细分析这个视频的摄影技巧，包括：
            - 运镜方式和技巧
            - 光影的运用
            - 色彩设计
            - 画面构图
            - 摄影风格特色""",

            "editing": """请详细分析这个视频的剪辑技巧，包括：
            - 剪辑节奏和韵律
            - 转场方式
            - 时间处理
            - 叙事结构
            - 剪辑风格特点"""
        }

        prompt = analysis_focuses.get(request.analysis_focus, "请全面分析这个视频的制作技巧")
        if request.description:
            prompt += f"\n\n特别关注：{request.description}"

        # 使用MAX密钥的视频理解功能
        analysis_text = await zhipu_service.analyze_video(
            video_url=request.video_url,
            prompt=prompt
        )

        return VideoAnalysisResponse(
            success=True,
            analysis={"content": analysis_text, "focus": request.analysis_focus}
        )
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"视频分析失败: {str(e)}"
        )

@router.post("/upload-image")
async def upload_image(file: UploadFile = File(...)):
    """上传图片文件"""
    try:
        # 创建上传目录
        upload_dir = "uploads/storyboard"
        os.makedirs(upload_dir, exist_ok=True)

        # 生成唯一文件名
        file_extension = os.path.splitext(file.filename)[1]
        unique_filename = f"{uuid.uuid4()}{file_extension}"
        file_path = os.path.join(upload_dir, unique_filename)

        # 保存文件
        with open(file_path, "wb") as buffer:
            content = await file.read()
            buffer.write(content)

        # 返回完整URL
        file_url = f"http://localhost:8000/uploads/storyboard/{unique_filename}"

        return {
            "success": True,
            "file_url": file_url,
            "filename": unique_filename
        }
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"文件上传失败: {str(e)}"
        )

@router.post("/upload-video")
async def upload_video(file: UploadFile = File(...)):
    """上传视频文件"""
    try:
        # 检查文件类型
        allowed_extensions = ['.mp4', '.mov', '.avi', '.mkv', '.webm']
        file_extension = os.path.splitext(file.filename)[1].lower()

        if file_extension not in allowed_extensions:
            raise ValueError(f"不支持的文件格式。支持的格式: {', '.join(allowed_extensions)}")

        # 创建上传目录
        upload_dir = "uploads/storyboard/videos"
        os.makedirs(upload_dir, exist_ok=True)

        # 生成唯一文件名
        unique_filename = f"{uuid.uuid4()}{file_extension}"
        file_path = os.path.join(upload_dir, unique_filename)

        # 分块保存文件，适合大文件
        print(f"[INFO] Starting video upload: {file.filename}")
        with open(file_path, "wb") as buffer:
            chunk_size = 1024 * 1024  # 1MB chunks
            while True:
                chunk = await file.read(chunk_size)
                if not chunk:
                    break
                buffer.write(chunk)
        
        print(f"[INFO] Video uploaded successfully: {unique_filename}")

        # 返回完整URL
        file_url = f"http://localhost:8000/uploads/storyboard/videos/{unique_filename}"

        return {
            "success": True,
            "file_url": file_url,
            "filename": file.filename
        }
    except Exception as e:
        print(f"[ERROR] Video upload failed: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail=f"视频上传失败: {str(e)}"
        )

@router.post("/generate-images")
async def generate_storyboard_images(request: Dict[str, Any]):
    """批量生成分镜图片（3张）"""
    try:
        shots = request.get("shots", [])
        if len(shots) < 3:
            raise ValueError("至少需要3个分镜描述")
        
        # 生成前3个分镜的图片
        images = []
        for i, shot in enumerate(shots[:3]):
            prompt = f"{shot.get('description', '')} {shot.get('composition', '')} {shot.get('mood', '')}"
            image_url = await zhipu_service.generate_image(
                prompt=prompt,
                size="1024x1024"
            )
            images.append({
                "shot_number": shot.get("shot_number", i+1),
                "image_url": image_url,
                "prompt": prompt
            })
        
        return {
            "success": True,
            "images": images
        }
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"批量图像生成失败: {str(e)}"
        )

@router.post("/generate-video")
async def generate_storyboard_video(request: Dict[str, Any]):
    """根据分镜图片生成视频"""
    try:
        images = request.get("images", [])
        if len(images) < 2:
            raise ValueError("至少需要2张图片生成视频")
        
        # 使用首尾帧生成视频
        first_image = images[0]
        last_image = images[-1]
        prompt = request.get("prompt", "让画面动起来，展现分镜内容")
        
        video_url = await zhipu_service.generate_video(
            image_urls=[first_image, last_image],
            prompt=prompt
        )
        
        return {
            "success": True,
            "video_url": video_url,
            "first_frame": first_image,
            "last_frame": last_image
        }
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"视频生成失败: {str(e)}"
        )

@router.get("/styles")
async def get_storyboard_styles():
    """获取分镜风格列表"""
    return {
        "styles": [
            {
                "id": "cinematic",
                "name": "电影感",
                "description": "电影级别的画面构图和光影效果"
            },
            {
                "id": "anime",
                "name": "动画风格",
                "description": "日式动画的视觉风格"
            },
            {
                "id": "comic",
                "name": "漫画风格",
                "description": "漫画书的视觉表现风格"
            },
            {
                "id": "realistic",
                "name": "写实风格",
                "description": "高度写实的画面风格"
            },
            {
                "id": "watercolor",
                "name": "水彩风格",
                "description": "柔和的水彩画面效果"
            },
            {
                "id": "sketch",
                "name": "素描风格",
                "description": "手绘素描的表现方式"
            }
        ]
    }

@router.get("/shot-types")
async def get_shot_types():
    """获取镜头类型说明"""
    return {
        "shot_types": [
            {
                "id": "extreme_wide",
                "name": "大远景",
                "description": "展示广阔环境的全景镜头"
            },
            {
                "id": "wide",
                "name": "远景",
                "description": "展示完整场景的镜头"
            },
            {
                "id": "medium",
                "name": "中景",
                "description": "展示人物腰部以上的镜头"
            },
            {
                "id": "close_up",
                "name": "近景",
                "description": "展示人物面部表情的镜头"
            },
            {
                "id": "extreme_close_up",
                "name": "特写",
                "description": "展示细节的极近距离镜头"
            }
        ],
        "angles": [
            {
                "id": "eye_level",
                "name": "平视",
                "description": "与视线平行的拍摄角度"
            },
            {
                "id": "high_angle",
                "name": "俯视",
                "description": "从上往下的拍摄角度"
            },
            {
                "id": "low_angle",
                "name": "仰视",
                "description": "从下往上的拍摄角度"
            },
            {
                "id": "dutch_angle",
                "name": "倾斜角",
                "description": "倾斜构图的拍摄角度"
            }
        ]
    }