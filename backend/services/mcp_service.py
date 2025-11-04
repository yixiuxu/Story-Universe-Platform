"""
MCP Service - 集成智谱AI的MCP工具
支持：图像理解、视频理解、联网搜索
"""
import httpx
import json
from typing import Dict, Any, List, Optional
from utils.config import settings

class MCPService:
    def __init__(self):
        self.max_api_key = settings.zhipu_max_api_key
        self.base_url = settings.zhipu_base_url
        
    async def call_with_mcp(
        self,
        messages: List[Dict[str, Any]],
        tools: List[Dict[str, Any]],
        model: str = "glm-4-plus",
        max_tokens: int = 2000,
        temperature: float = 0.7
    ) -> Dict[str, Any]:
        """使用MCP工具调用GLM-4.6 MAX"""
        headers = {
            "Authorization": f"Bearer {self.max_api_key}",
            "Content-Type": "application/json"
        }
        
        payload = {
            "model": model,
            "messages": messages,
            "tools": tools,
            "max_tokens": max_tokens,
            "temperature": temperature
        }
        
        async with httpx.AsyncClient(timeout=120.0) as client:
            response = await client.post(
                f"{self.base_url}chat/completions",
                headers=headers,
                json=payload
            )
            response.raise_for_status()
            return response.json()
    
    async def web_search(self, query: str) -> Dict[str, Any]:
        """联网搜索 - 使用web_search_prime MCP"""
        messages = [
            {
                "role": "user",
                "content": f"请搜索：{query}"
            }
        ]
        
        tools = [
            {
                "type": "web_search",
                "web_search": {
                    "enable": True,
                    "search_query": query
                }
            }
        ]
        
        return await self.call_with_mcp(messages, tools)
    
    async def analyze_image_url(self, image_url: str, prompt: str = "请详细描述这张图片") -> str:
        """图像理解 - 使用GLM-4V"""
        headers = {
            "Authorization": f"Bearer {self.max_api_key}",
            "Content-Type": "application/json"
        }
        
        payload = {
            "model": "glm-4v-plus",
            "messages": [
                {
                    "role": "user",
                    "content": [
                        {"type": "text", "text": prompt},
                        {"type": "image_url", "image_url": {"url": image_url}}
                    ]
                }
            ],
            "max_tokens": 1000
        }
        
        async with httpx.AsyncClient(timeout=60.0) as client:
            response = await client.post(
                f"{self.base_url}chat/completions",
                headers=headers,
                json=payload
            )
            response.raise_for_status()
            result = response.json()
            return result["choices"][0]["message"]["content"]
    
    async def analyze_video_url(self, video_url: str, prompt: str = "请分析这个视频") -> str:
        """视频理解 - 使用GLM-4V"""
        headers = {
            "Authorization": f"Bearer {self.max_api_key}",
            "Content-Type": "application/json"
        }
        
        payload = {
            "model": "glm-4v-plus",
            "messages": [
                {
                    "role": "user",
                    "content": [
                        {"type": "text", "text": prompt},
                        {"type": "video_url", "video_url": {"url": video_url}}
                    ]
                }
            ],
            "max_tokens": 2000
        }
        
        async with httpx.AsyncClient(timeout=120.0) as client:
            response = await client.post(
                f"{self.base_url}chat/completions",
                headers=headers,
                json=payload
            )
            response.raise_for_status()
            result = response.json()
            return result["choices"][0]["message"]["content"]
    
    async def enhanced_search(
        self,
        query: str,
        search_type: str = "general",
        limit: int = 10
    ) -> Dict[str, Any]:
        """增强搜索 - 结合联网搜索和AI分析"""
        # 使用web_search工具
        search_result = await self.web_search(query)
        
        # 提取搜索结果
        content = search_result["choices"][0]["message"]["content"]
        
        return {
            "query": query,
            "type": search_type,
            "results": content,
            "source": "web_search_mcp"
        }
    
    async def get_hot_topics(self, category: str = "technology", limit: int = 5) -> List[Dict[str, Any]]:
        """获取热点话题"""
        query = f"最新{category}热点话题"
        result = await self.web_search(query)
        
        content = result["choices"][0]["message"]["content"]
        
        return {
            "category": category,
            "topics": content,
            "source": "web_search_mcp"
        }
    
    async def get_inspiration(
        self,
        genre: str,
        theme: str,
        keywords: List[str] = None
    ) -> Dict[str, Any]:
        """获取创作灵感"""
        keywords_str = "、".join(keywords) if keywords else ""
        query = f"{genre}类型 {theme}主题 {keywords_str} 创作灵感和参考"
        
        result = await self.web_search(query)
        content = result["choices"][0]["message"]["content"]
        
        return {
            "genre": genre,
            "theme": theme,
            "keywords": keywords,
            "inspiration": content,
            "source": "web_search_mcp"
        }

    async def search_materials(self, query: str, material_type: str, limit: int = 10) -> List[Dict[str, Any]]:
        """搜索创作素材"""
        search_query = f"{query} {material_type} 素材 参考"
        result = await self.web_search(search_query)
        
        content = result["choices"][0]["message"]["content"]
        
        return [{
            "title": query,
            "type": material_type,
            "description": content[:200],
            "full_content": content,
            "source": "web_search_mcp"
        }]
    
    async def call_mcp_tool(self, tool_name: str, params: Dict[str, Any]) -> Dict[str, Any]:
        """调用MCP工具"""
        if tool_name == "web_search":
            query = params.get("search_query", "")
            result = await self.web_search(query)
            return {
                "success": True,
                "result": {
                    "content": result["choices"][0]["message"]["content"]
                }
            }
        return {"success": False, "error": "Unknown tool"}
    
    async def analyze_reference_image(self, image_url: str, analysis_type: str) -> Dict[str, Any]:
        """分析参考图片"""
        prompts = {
            "composition": "请分析这张图片的构图、布局和视觉元素",
            "style": "请分析这张图片的艺术风格、色彩和表现手法",
            "character": "请分析这张图片中的角色设计、服装和特征",
            "scene": "请分析这张图片的场景设计、环境和氛围"
        }
        
        prompt = prompts.get(analysis_type, prompts["composition"])
        content = await self.analyze_image_url(image_url, prompt)
        
        return {
            "analysis_type": analysis_type,
            "content": content,
            "image_url": image_url
        }
    
    async def generate_visual_reference(self, description: str, style: str) -> Dict[str, Any]:
        """生成视觉参考"""
        # 使用搜索找到相关参考
        query = f"{description} {style} 视觉参考 设计"
        result = await self.web_search(query)
        
        content = result["choices"][0]["message"]["content"]
        
        return {
            "description": description,
            "style": style,
            "references": content,
            "source": "web_search_mcp"
        }

# 全局实例
mcp_service = MCPService()
