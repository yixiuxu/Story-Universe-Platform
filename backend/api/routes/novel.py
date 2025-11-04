from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import Optional, List, Dict, Any
from services.zhipu_service import zhipu_service
from services.mcp_service import mcp_service

router = APIRouter()

class NovelGenerateRequest(BaseModel):
    genre: str  # 小说类型：科幻、言情、悬疑等
    theme: str  # 主题
    length: str = "medium"  # 长度：short、medium、long
    style: str = "modern"  # 风格：modern、classical、fantasy等
    prompt: Optional[str] = None  # 额外提示

class NovelResponse(BaseModel):
    success: bool
    content: Optional[str] = None
    error: Optional[str] = None

class OutlineRequest(BaseModel):
    genre: str  # 题材
    style: str  # 风格
    keywords: List[str]  # 关键词
    target_length: str = "medium"  # 目标长度

class OutlineResponse(BaseModel):
    success: bool
    outline: Optional[Dict[str, Any]] = None
    background_materials: Optional[List[Dict[str, Any]]] = None
    error: Optional[str] = None

class ChapterContinueRequest(BaseModel):
    previous_content: str  # 前文内容
    continuation_direction: Optional[str] = None  # 续写方向提示
    target_length: int = 1000  # 目标字数

class ChapterContinueResponse(BaseModel):
    success: bool
    continued_content: Optional[str] = None
    error: Optional[str] = None

class StyleAdjustRequest(BaseModel):
    content: str  # 原始内容
    target_style: str  # 目标风格
    style_description: Optional[str] = None  # 风格描述

class StyleAdjustResponse(BaseModel):
    success: bool
    adjusted_content: Optional[str] = None
    error: Optional[str] = None

@router.post("/generate", response_model=NovelResponse)
async def generate_novel(request: NovelGenerateRequest):
    """生成小说内容"""
    try:
        print(f"[DEBUG] Generating novel: genre={request.genre}, theme={request.theme}, length={request.length}")
        
        content = await zhipu_service.generate_novel(
            genre=request.genre,
            theme=request.theme,
            length=request.length,
            style=request.style,
            prompt=request.prompt
        )
        
        print(f"[DEBUG] Generated content length: {len(content) if content else 0}")
        print(f"[DEBUG] Content preview: {content[:100] if content else 'EMPTY'}")

        return NovelResponse(
            success=True,
            content=content if content else "生成失败：返回内容为空"
        )
    except Exception as e:
        print(f"[ERROR] Novel generation failed: {str(e)}")
        import traceback
        traceback.print_exc()
        raise HTTPException(
            status_code=500,
            detail=f"小说生成失败: {str(e)}"
        )

@router.get("/genres")
async def get_novel_genres():
    """获取小说类型列表"""
    return {
        "genres": [
            {"id": "scifi", "name": "科幻", "description": "基于科学技术幻想的小说"},
            {"id": "romance", "name": "言情", "description": "以爱情为主题的小说"},
            {"id": "mystery", "name": "悬疑", "description": "充满悬念和推理的小说"},
            {"id": "fantasy", "name": "奇幻", "description": "包含魔法和超自然元素的小说"},
            {"id": "historical", "name": "历史", "description": "以历史为背景的小说"},
            {"id": "contemporary", "name": "现实", "description": "反映现实生活的小说"},
            {"id": "thriller", "name": "惊悚", "description": "刺激紧张的小说"},
            {"id": "literary", "name": "文学", "description": "注重文学价值的小说"}
        ]
    }

@router.post("/outline", response_model=OutlineResponse)
async def generate_outline(request: OutlineRequest):
    """生成故事大纲"""
    try:
        # 直接使用 GLM-4.6 生成大纲，不依赖MCP
        background_materials = []

        system_prompt = f"""
        你是一个专业的故事大纲设计师，请根据以下信息生成一个详细的{request.genre}故事大纲：

        题材：{request.genre}
        风格：{request.style}
        关键词：{', '.join(request.keywords)}
        目标长度：{request.target_length}

        请生成包含以下结构的大纲：
        1. 故事梗概（200字以内）
        2. 主要人物设定（每个主要角色的背景、性格、目标）
        3. 世界观设定（如果适用）
        4. 故事结构（三幕式或五幕式）
        5. 章节大纲（建议至少10个章节）
        6. 主要冲突和转折点
        7. 主题思想和象征元素

        请以JSON格式返回，确保结构清晰，便于后续创作使用。
        """

        messages = [
            {"role": "system", "content": system_prompt},
            {"role": "user", "content": f"请为我创作一个{request.genre}故事大纲。"}
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

        # 尝试解析JSON
        try:
            import json
            outline_data = json.loads(content)
            print(f"[DEBUG] Outline parsed successfully")
        except Exception as e:
            print(f"[ERROR] Outline JSON parse failed: {str(e)}")
            print(f"[DEBUG] Content: {content[:500]}")
            outline_data = {"raw_content": content}

        return OutlineResponse(
            success=True,
            outline=outline_data,
            background_materials=background_materials
        )
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"大纲生成失败: {str(e)}"
        )

@router.post("/continue", response_model=ChapterContinueResponse)
async def continue_chapter(request: ChapterContinueRequest):
    """章节续写"""
    try:
        # 使用 context7 MCP 进行长文本增强处理
        context_enhanced_content = await enhance_long_text_context(request.previous_content)

        system_prompt = f"""
        你是一个专业小说家，请根据已有内容续写故事。

        前文内容：
        {context_enhanced_content}

        续写要求：
        {f"方向提示：{request.continuation_direction}" if request.continuation_direction else "请自然延续故事情节"}
        目标字数：约{request.target_length}字
        保持与前文一致的文风和人物性格
        情节发展要合理，保持故事的连贯性
        适当增加细节描写和心理活动

        请直接输出续写内容，不要添加任何说明或标题。
        """

        messages = [
            {"role": "system", "content": system_prompt},
            {"role": "user", "content": "请续写下一章节。"}
        ]

        response = await zhipu_service.chat_completion(
            model="glm-4.6",
            messages=messages,
            max_tokens=2000,
            thinking={"type": "disabled"}
        )

        message = response.get("choices", [{}])[0].get("message", {})
        continued_content = message.get("content", "") or message.get("reasoning_content", "")

        return ChapterContinueResponse(
            success=True,
            continued_content=continued_content
        )
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"章节续写失败: {str(e)}"
        )

@router.post("/rewrite", response_model=StyleAdjustResponse)
async def adjust_style(request: StyleAdjustRequest):
    """风格调整"""
    try:
        system_prompt = f"""
        你是一个专业文学编辑，请将以下文本调整为{request.target_style}风格。

        {f"风格要求：{request.style_description}" if request.style_description else f"目标风格：{request.target_style}"}

        调整要求：
        1. 保持原意不变，只改变表达方式
        2. 调整语言风格和表达习惯
        3. 保持人物性格和情节发展的一致性
        4. 确保调整后的文本流畅自然
        5. 适当增加该风格特色的表现手法

        原文内容：
        {request.content}

        请直接输出调整后的文本，不要添加任何说明。
        """

        messages = [
            {"role": "system", "content": system_prompt},
            {"role": "user", "content": "请调整文本风格。"}
        ]

        response = await zhipu_service.chat_completion(
            model="glm-4.6",
            messages=messages,
            max_tokens=2000,
            thinking={"type": "disabled"}
        )

        message = response.get("choices", [{}])[0].get("message", {})
        adjusted_content = message.get("content", "") or message.get("reasoning_content", "")

        return StyleAdjustResponse(
            success=True,
            adjusted_content=adjusted_content
        )
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"风格调整失败: {str(e)}"
        )

async def enhance_long_text_context(content: str) -> str:
    """使用context7增强长文本理解"""
    try:
        # 模拟context7功能，实际应调用真实的context7 MCP服务
        # 这里简化为内容摘要，保持主要情节线索
        if len(content) > 2000:
            # 提取前500字和后500字，中间用省略号连接
            summary = content[:500] + "\n\n[前文概要：此处省略中间内容，主要情节发展...]\n\n" + content[-500:]
            return summary
        return content
    except:
        return content

@router.get("/styles")
async def get_novel_styles():
    """获取小说风格列表"""
    return {
        "styles": [
            {"id": "modern", "name": "现代主义", "description": "现代文学风格"},
            {"id": "classical", "name": "古典主义", "description": "传统文学风格"},
            {"id": "minimalist", "name": "极简主义", "description": "简洁明了的风格"},
            {"id": "poetic", "name": "诗意化", "description": "充满诗意的表达"},
            {"id": "journalistic", "name": "新闻体", "description": "客观写实的风格"},
            {"id": "stream_of_consciousness", "name": "意识流", "description": "内心独白为主"},
            {"id": "magical_realism", "name": "魔幻现实主义", "description": "现实与幻想结合"}
        ]
    }