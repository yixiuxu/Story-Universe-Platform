from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import Optional, Dict, Any, List
from services.zhipu_service import zhipu_service
from services.mcp_service import mcp_service

router = APIRouter()

class CharacterGenerateRequest(BaseModel):
    name: Optional[str] = None  # 角色姓名
    type: str  # 角色类型：主角、配角、反派等
    setting: str  # 故事背景
    description: Optional[str] = None  # 额外描述
    age: Optional[str] = None  # 年龄段
    gender: Optional[str] = None  # 性别
    personality: Optional[str] = None  # 性格特征

class CharacterResponse(BaseModel):
    success: bool
    character: Optional[Dict[str, Any]] = None
    background_materials: Optional[List[Dict[str, Any]]] = None
    error: Optional[str] = None

class CharacterImageRequest(BaseModel):
    character_name: str  # 角色姓名
    appearance: str  # 外貌描述
    style: str = "anime"  # 立绘风格
    pose: Optional[str] = None  # 姿势描述

class CharacterImageResponse(BaseModel):
    success: bool
    image_url: Optional[str] = None
    prompt_used: Optional[str] = None
    error: Optional[str] = None

@router.post("/generate", response_model=CharacterResponse)
async def generate_character(request: CharacterGenerateRequest):
    """生成角色设定"""
    try:
        # 直接使用 GLM-4.6 生成角色，不依赖MCP
        background_materials = []

        system_prompt = f"""
        你是一个专业的角色设计师，请根据以下信息创建一个完整的角色设定：

        角色姓名：{request.name or '待定'}
        角色类型：{request.type}
        故事背景：{request.setting}
        年龄段：{request.age or '不限'}
        性别：{request.gender or '不限'}
        性格特征：{request.personality or '待定'}
        额外描述：{request.description or '无'}

        请生成详细的角色设定，包括以下字段：
        1. basic_info（基本信息）:
           - name: 姓名
           - age: 年龄
           - gender: 性别
           - occupation: 职业
           - nationality: 国籍

        2. appearance（外貌特征）:
           - height: 身高
           - build: 体型
           - hair_color: 发色
           - eye_color: 眼睛颜色
           - clothing_style: 服装风格
           - special_features: 特殊特征

        3. personality（性格特点）:
           - traits: 主要性格特征
           - strengths: 优点
           - weaknesses: 缺点
           - habits: 习惯
           - fears: 恐惧

        4. background（背景故事）:
           - childhood: 童年经历
           - education: 教育背景
           - family: 家庭情况
           - major_events: 重要经历

        5. skills_abilities（技能能力）:
           - professional_skills: 专业技能
           - special_talents: 特殊才能
           - combat_abilities: 战斗能力（如适用）
           - languages: 掌握语言

        6. relationships（人际关系）:
           - family_relations: 家庭关系
           - friendships: 友谊关系
           - romantic_interests: 恋爱对象
           - rivals_rivals: 对手或敌人

        7. goals_motivations（目标动机）:
           - short_term_goals: 短期目标
           - long_term_goals: 长期目标
           - motivations: 内在动机
           - fears: 恐惧和担忧

        8. dialogue_style（对话风格）:
           - speaking_manner: 说话方式
           - vocabulary: 词汇特点
           - catchphrase: 标志性台词
           - communication_style: 沟通风格

        请以JSON格式返回，确保所有字段都有内容，便于后续使用。
        """

        messages = [
            {"role": "system", "content": system_prompt},
            {"role": "user", "content": f"请为我创建一个{request.type}角色。"}
        ]

        response = await zhipu_service.chat_completion(
            model="glm-4.6",
            messages=messages,
            max_tokens=3000,
            thinking={"type": "disabled"}
        )

        message = response.get("choices", [{}])[0].get("message", {})
        content = message.get("content", "") or message.get("reasoning_content", "")
        
        # 清理markdown代码块
        content = content.strip()
        if content.startswith("```json"):
            content = content[7:]
        if content.startswith("```"):
            content = content[3:]
        if content.endswith("```"):
            content = content[:-3]
        content = content.strip()

        try:
            import json
            character_data = json.loads(content)
            print(f"[DEBUG] Character parsed successfully")
        except Exception as e:
            print(f"[ERROR] JSON parse failed: {str(e)}")
            print(f"[DEBUG] Content: {content[:500]}")
            character_data = {
                "raw_content": content,
                "basic_info": {"name": request.name or "未命名角色"},
                "appearance": {"description": "详细外貌见原文内容"},
                "personality": {"description": "详细性格见原文内容"},
                "background": {"description": "详细背景见原文内容"}
            }

        return CharacterResponse(
            success=True,
            character=character_data,
            background_materials=background_materials
        )
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"角色生成失败: {str(e)}"
        )

@router.post("/image", response_model=CharacterImageResponse)
async def generate_character_image(request: CharacterImageRequest):
    """生成角色立绘"""
    try:
        # 构建图像生成提示词
        prompt_parts = [
            f"角色立绘：{request.character_name}",
            f"外貌特征：{request.appearance}",
        ]

        if request.pose:
            prompt_parts.append(f"姿势：{request.pose}")

        style_mapping = {
            "anime": "日式动漫风格",
            "realistic": "写实风格",
            "chinese": "古风风格",
            "fantasy": "奇幻风格",
            "scifi": "科幻风格",
            "game": "游戏角色风格"
        }

        style_desc = style_mapping.get(request.style, "动漫风格")
        prompt_parts.append(f"艺术风格：{style_desc}")

        # 添加细节描述
        prompt_parts.extend([
            "高质量立绘",
            "完整的角色形象",
            "清晰的细节",
            "适合作为角色设定图"
        ])

        final_prompt = ", ".join(prompt_parts)

        # 调用 CogView-4 API 生成图像
        image_url = await zhipu_service.generate_image(
            prompt=final_prompt,
            style=style_desc,
            size="1024x1024"
        )

        return CharacterImageResponse(
            success=True,
            image_url=image_url,
            prompt_used=final_prompt
        )
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"角色立绘生成失败: {str(e)}"
        )

@router.get("/types")
async def get_character_types():
    """获取角色类型列表"""
    return {
        "types": [
            {"id": "protagonist", "name": "主角", "description": "故事的主要角色"},
            {"id": "antagonist", "name": "反派", "description": "与主角对立的角色"},
            {"id": "supporting", "name": "配角", "description": "辅助主要情节的角色"},
            {"id": "mentor", "name": "导师", "description": "指导主角的角色"},
            {"id": "love_interest", "name": "恋爱对象", "description": "主角的爱慕对象"},
            {"id": "comic_relief", "name": "搞笑角色", "description": "带来幽默元素的角色"},
            {"id": "catalyst", "name": "催化剂角色", "description": "推动情节发展的角色"},
            {"id": "narrator", "name": "叙述者", "description": "讲述故事的角色"}
        ]
    }

@router.get("/traits")
async def get_character_traits():
    """获取角色特征库"""
    return {
        "personality_traits": [
            "勇敢", "胆小", "乐观", "悲观", "聪明", "愚钝", "善良", "邪恶",
            "诚实", "狡猾", "慷慨", "自私", "耐心", "急躁", "自信", "自卑"
        ],
        "physical_traits": [
            "高大", "矮小", "强壮", "瘦弱", "英俊", "丑陋", "优雅", "笨拙"
        ],
        "background_traits": [
            "贵族出身", "平民家庭", "孤儿", "富有", "贫穷", "受过良好教育", "自学成才"
        ]
    }