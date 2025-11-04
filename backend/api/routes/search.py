from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import List, Dict, Any, Optional
from services.mcp_service import mcp_service
from services.zhipu_service import zhipu_service

router = APIRouter()

class MaterialSearchRequest(BaseModel):
    query: str  # 搜索关键词
    type: str  # 素材类型：image、text、video
    limit: int = 10  # 返回结果数量
    category: Optional[str] = None  # 搜索分类

class MaterialSearchResponse(BaseModel):
    success: bool
    results: List[Dict[str, Any]] = []
    total: int = 0
    error: str = None

class HotTopicsRequest(BaseModel):
    category: Optional[str] = None  # 话题分类
    limit: int = 20  # 返回结果数量

class HotTopicsResponse(BaseModel):
    success: bool
    topics: List[Dict[str, Any]] = []
    error: str = None

class InspirationRequest(BaseModel):
    genre: Optional[str] = None  # 创作类型
    theme: Optional[str] = None  # 主题
    style: Optional[str] = None  # 风格
    keywords: Optional[List[str]] = None  # 关键词

class InspirationResponse(BaseModel):
    success: bool
    inspirations: List[Dict[str, Any]] = []
    error: str = None

class EnhancedSearchRequest(BaseModel):
    query: str  # 搜索关键词
    context: Optional[str] = None  # 上下文信息
    search_type: str = "general"  # 搜索类型：general, academic, creative, technical
    limit: int = 15  # 返回结果数量

class EnhancedSearchResponse(BaseModel):
    success: bool
    results: List[Dict[str, Any]] = []
    summary: Optional[str] = None
    related_topics: List[str] = []
    error: str = None

@router.post("/materials", response_model=MaterialSearchResponse)
async def search_materials(request: MaterialSearchRequest):
    """搜索创作素材"""
    try:
        results = await mcp_service.search_materials(
            query=request.query,
            material_type=request.type,
            limit=request.limit
        )

        return MaterialSearchResponse(
            success=True,
            results=results,
            total=len(results)
        )
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"素材搜索失败: {str(e)}"
        )

@router.post("/enhanced-search", response_model=EnhancedSearchResponse)
async def enhanced_search(request: EnhancedSearchRequest):
    """增强搜索功能"""
    try:
        # 直接使用GLM-4-Air联网搜索
        search_result = await zhipu_service.web_search(
            query=request.query,
            max_results=request.limit
        )

        if search_result and "choices" in search_result:
            content = search_result["choices"][0]["message"]["content"]
            
            return EnhancedSearchResponse(
                success=True,
                results=[{
                    "title": request.query,
                    "url": "",
                    "description": content,
                    "source": "web_search"
                }],
                summary=content[:500] if len(content) > 500 else content,
                related_topics=[request.query]
            )
        else:
            return EnhancedSearchResponse(
                success=True,
                results=[],
                summary="搜索未找到相关结果",
                related_topics=[]
            )

    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"增强搜索失败: {str(e)}"
        )

@router.post("/hot-topics", response_model=HotTopicsResponse)
async def get_hot_topics(request: HotTopicsRequest):
    """获取热点话题"""
    try:
        category_queries = {
            "social": "最新社会热点话题",
            "technology": "科技前沿热点趋势",
            "culture": "文化热点流行趋势",
            "entertainment": "娱乐热点影视音乐",
            "business": "商业热点经济趋势",
            "global": "国际热点全球大事"
        }

        search_query = category_queries.get(request.category or "social", "最新热点话题")

        # 使用GLM-4-Air + web_search工具
        search_result = await zhipu_service.web_search(
            query=search_query,
            max_results=min(request.limit, 10)
        )

        # 直接从搜索结果中提取内容
        if search_result and "choices" in search_result:
            content = search_result["choices"][0]["message"]["content"]

            # 解析搜索结果为结构化数据
            import json
            topics_data = [
                {
                    "title": f"{request.category or '社会'}领域热点",
                    "heat": "高热度",
                    "description": content,
                    "keywords": [search_query],
                    "trend": "📈 上升",
                    "creative_value": "基于实时搜索的热点话题",
                    "full_content": content
                }
            ]

            return HotTopicsResponse(
                success=True,
                topics=topics_data
            )
        else:
            # MCP搜索失败，使用降级方案：直接生成热点话题
            fallback_prompt = f"""
            请基于你的知识，生成{request.category or '社会'}领域的当前热点话题列表。
            
            请提供{request.limit}个热点话题，每个包含：
            - title: 话题标题
            - heat: 热度（高/中/低）
            - description: 简短描述
            - keywords: 相关关键词数组
            - trend: 趋势（上升/稳定/下降）
            - creative_value: 创作价值说明
            
            请以JSON数组格式返回。
            """
            
            messages = [{"role": "user", "content": fallback_prompt}]
            response = await zhipu_service.chat_completion(
                model="glm-4-flash",
                messages=messages,
                max_tokens=2000,
                temperature=0.8
            )
            
            content = response["choices"][0]["message"]["content"]
            try:
                import json
                topics_data = json.loads(content)
                if not isinstance(topics_data, list):
                    topics_data = [topics_data]
            except:
                topics_data = []
            
            return HotTopicsResponse(
                success=True,
                topics=topics_data
            )

    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"热点话题获取失败: {str(e)}"
        )

@router.post("/inspiration", response_model=InspirationResponse)
async def get_inspiration(request: InspirationRequest):
    """获取灵感推荐"""
    try:
        # 直接使用GLM-4.6生成灵感
        inspiration_prompt = f"""
        你是一个创意顾问，请为用户提供创作灵感推荐：

        创作类型：{request.genre or '不限'}
        主题：{request.theme or '不限'}
        风格：{request.style or '不限'}
        关键词：{', '.join(request.keywords) if request.keywords else '无'}

        请提供3-5个创作灵感，每个包含：
        - title: 灵感标题
        - description: 详细描述
        - scenarios: 适用场景数组
        - applications: 应用建议数组
        - resources: 参考资料数组
        - techniques: 创作技巧数组

        请以JSON数组格式返回。
        """

        messages = [{"role": "user", "content": inspiration_prompt}]

        response = await zhipu_service.chat_completion(
            model="glm-4.6",
            messages=messages,
            max_tokens=3000
        )

        content = response["choices"][0]["message"]["content"]
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
            inspirations_data = json.loads(content)
            if not isinstance(inspirations_data, list):
                inspirations_data = [inspirations_data]
        except:
            inspirations_data = [{
                "title": "创作灵感",
                "description": content[:500] if content else "请尝试修改搜索条件",
                "scenarios": ["小说创作"],
                "applications": ["直接应用"],
                "resources": [],
                "techniques": []
            }]

        return InspirationResponse(
            success=True,
            inspirations=inspirations_data
        )

    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"灵感推荐获取失败: {str(e)}"
        )

class ImageAnalysisRequest(BaseModel):
    image_url: str  # 图片URL
    analysis_type: str = "composition"  # 分析类型：composition、style、character、scene

@router.post("/analyze-image", response_model=Dict[str, Any])
async def analyze_reference_image(request: ImageAnalysisRequest):
    """分析参考图片"""
    try:
        result = await mcp_service.analyze_reference_image(
            image_url=request.image_url,
            analysis_type=request.analysis_type
        )

        return {
            "success": True,
            "result": result
        }
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"图片分析失败: {str(e)}"
        )

class VisualReferenceRequest(BaseModel):
    description: str  # 描述
    style: str = "realistic"  # 风格

@router.post("/generate-reference", response_model=Dict[str, Any])
async def generate_visual_reference(request: VisualReferenceRequest):
    """生成视觉参考"""
    try:
        result = await mcp_service.generate_visual_reference(
            description=request.description,
            style=request.style
        )

        return {
            "success": True,
            "result": result
        }
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"视觉参考生成失败: {str(e)}"
        )

@router.get("/search-categories")
async def get_search_categories():
    """获取搜索分类"""
    return {
        "categories": [
            {
                "id": "character",
                "name": "角色素材",
                "description": "人物设计、服装、表情等",
                "tags": ["人物设计", "服装", "表情", "姿势", "肖像"]
            },
            {
                "id": "environment",
                "name": "环境素材",
                "description": "场景、背景、建筑等",
                "tags": ["场景", "背景", "建筑", "自然", "城市"]
            },
            {
                "id": "props",
                "name": "道具素材",
                "description": "各种物品和道具",
                "tags": ["道具", "武器", "工具", "家具", "装饰"]
            },
            {
                "id": "effects",
                "name": "特效素材",
                "description": "视觉特效和特效元素",
                "tags": ["特效", "光影", "粒子", "爆炸", "魔法"]
            },
            {
                "id": "reference",
                "name": "参考资料",
                "description": "创作相关的文字资料",
                "tags": ["历史", "科学", "文化", "艺术", "技术"]
            }
        ]
    }

@router.get("/popular-searches")
async def get_popular_searches():
    """获取热门搜索词"""
    return {
        "popular_searches": [
            "古代建筑", "科幻城市", "森林场景", "角色设计", "服装设计",
            "武器设计", "动物参考", "车辆设计", "自然风光", "室内设计",
            "表情参考", "动作姿势", "光影效果", "色彩搭配", "构图技巧"
        ]
    }