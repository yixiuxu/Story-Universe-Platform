from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import Optional, List
from services.zhipu_service import zhipu_service

router = APIRouter()

class ScriptConvertRequest(BaseModel):
    content: str  # 原始文本内容
    format: str = "standard"  # 剧本格式：standard、cinema、tv、theater
    characters: Optional[List[str]] = None  # 主要角色列表

class ScriptResponse(BaseModel):
    success: bool
    script: Optional[str] = None
    error: Optional[str] = None

@router.post("/convert", response_model=ScriptResponse)
async def convert_to_script(request: ScriptConvertRequest):
    """将文本转换为剧本格式"""
    try:
        script_content = await zhipu_service.convert_to_script(
            content=request.content,
            script_format=request.format,
            characters=request.characters
        )

        return ScriptResponse(
            success=True,
            script=script_content
        )
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"剧本转换失败: {str(e)}"
        )

@router.get("/formats")
async def get_script_formats():
    """获取剧本格式列表"""
    return {
        "formats": [
            {
                "id": "standard",
                "name": "标准剧本",
                "description": "通用剧本格式，适用于大多数情况"
            },
            {
                "id": "cinema",
                "name": "电影剧本",
                "description": "专门用于电影制作的剧本格式"
            },
            {
                "id": "tv",
                "name": "电视剧剧本",
                "description": "适用于电视剧分集的剧本格式"
            },
            {
                "id": "theater",
                "name": "话剧剧本",
                "description": "适用于舞台表演的剧本格式"
            },
            {
                "id": "radio",
                "name": "广播剧本",
                "description": "适用于广播剧的剧本格式"
            }
        ]
    }

@router.get("/structure")
async def get_script_structure():
    """获取剧本结构说明"""
    return {
        "elements": [
            {
                "name": "场景标题",
                "description": "描述场景时间、地点的标题",
                "example": "内景. 咖啡厅 - 白天"
            },
            {
                "name": "动作描述",
                "description": "描述角色动作和场景的文本",
                "example": "约翰走进咖啡厅，环顾四周。"
            },
            {
                "name": "角色名称",
                "description": "说话角色的名字",
                "example": "约翰"
            },
            {
                "name": "对话",
                "description": "角色说话的内容",
                "example": "你好，很高兴见到你。"
            },
            {
                "name": "括号注释",
                "description": "描述说话方式的注释",
                "example": "(讽刺地)"
            },
            {
                "name": "转场",
                "description": "场景之间的转场说明",
                "example": "淡出："
            }
        ]
    }