import httpx
import json
import asyncio
from typing import Dict, Any, List, Optional
from utils.config import settings

class ZhipuAIService:
    def __init__(self):
        self.api_keys = [
            settings.zhipu_api_key,
            settings.zhipu_api_key_backup
        ]
        self.current_key_index = 0
        self.api_key = self.api_keys[0]
        self.max_api_key = settings.zhipu_max_api_key
        self.base_url = settings.zhipu_base_url
        self.headers = {
            "Authorization": f"Bearer {self.api_key}",
            "Content-Type": "application/json"
        }
        self.max_headers = {
            "Authorization": f"Bearer {self.max_api_key}",
            "Content-Type": "application/json"
        }
    
    def switch_api_key(self):
        """切换到下一个API密钥"""
        self.current_key_index = (self.current_key_index + 1) % len(self.api_keys)
        self.api_key = self.api_keys[self.current_key_index]
        self.headers["Authorization"] = f"Bearer {self.api_key}"
        print(f"[INFO] Switched to API key #{self.current_key_index + 1}")

    async def chat_completion(
        self,
        model: str = "glm-4.6",
        messages: List[Dict[str, str]] = None,
        temperature: float = 0.7,
        max_tokens: int = 2000,
        use_max_key: bool = False,
        max_retries: int = 3,
        stream: bool = False,
        **kwargs
    ) -> Dict[str, Any]:
        """通用聊天对话接口
        
        密钥使用策略：
        - 普通GLM-4.6密钥：文本生成（小说、角色、剧本、分镜）
        - MAX密钥：图像/视频理解、联网搜索、MCP工具
        """
        if messages is None:
            messages = []

        payload = {
            "model": model,
            "messages": messages,
            "temperature": temperature,
            "max_tokens": max_tokens,
            "stream": stream,
            **kwargs
        }

        headers = self.max_headers if use_max_key else self.headers

        for attempt in range(max_retries):
            try:
                async with httpx.AsyncClient(timeout=180.0) as client:
                    response = await client.post(
                        f"{self.base_url}chat/completions",
                        headers=headers,
                        json=payload
                    )
                    response.raise_for_status()
                    
                    if stream:
                        return response  # 返回响应对象用于流式处理
                    return response.json()
            except httpx.HTTPStatusError as e:
                if e.response.status_code == 429:  # Rate limit
                    if attempt < max_retries - 1:
                        wait_time = (2 ** attempt) * 5  # 5, 10, 20秒
                        print(f"⚠️ 速率限制，等待 {wait_time} 秒后重试...")
                        await asyncio.sleep(wait_time)
                        continue
                raise

    async def generate_novel_stream(
        self,
        genre: str,
        theme: str,
        length: str = "medium",
        style: str = "modern",
        prompt: Optional[str] = None
    ):
        """小说生成 - 流式输出"""
        length_tokens = {
            "short": 800,
            "medium": 1500,
            "long": 2500
        }
        max_tokens = length_tokens.get(length, 1500)
        
        system_prompt = f"""
        你是一个专业的故事创作者，请根据以下要求创作一个{genre}类型的故事：

        主题：{theme}
        长度：{length}
        风格：{style}

        要求：
        1. 故事结构完整，有起承转合
        2. 人物性格鲜明，对话自然
        3. 情节发展合理，有冲突和解决
        4. 语言生动，有画面感
        5. 符合{style}风格特点

        {f'额外要求：{prompt}' if prompt else ''}

        请直接输出故事内容，不要包含标题或解释。
        """

        messages = [
            {"role": "system", "content": system_prompt},
            {"role": "user", "content": f"请创作一个关于{theme}的{genre}故事。"}
        ]

        async with httpx.AsyncClient(timeout=180.0) as client:
            async with client.stream(
                "POST",
                f"{self.base_url}chat/completions",
                headers=self.headers,
                json={
                    "model": "glm-4.6",
                    "messages": messages,
                    "max_tokens": max_tokens,
                    "temperature": 0.8,
                    "stream": True
                }
            ) as response:
                async for line in response.aiter_lines():
                    if line.startswith("data: "):
                        data = line[6:]
                        if data == "[DONE]":
                            break
                        try:
                            chunk = json.loads(data)
                            delta = chunk.get("choices", [{}])[0].get("delta", {})
                            content = delta.get("content", "")
                            if content:
                                yield content
                        except:
                            continue

    async def generate_character_stream(
        self,
        character_type: str,
        setting: str,
        name: Optional[str] = None,
        description: Optional[str] = None
    ):
        """角色生成 - 流式输出"""
        system_prompt = f"""
        你是一个专业的角色设计师，请根据以下要求创建一个角色：

        角色类型：{character_type}
        故事背景：{setting}
        {f'角色姓名：{name}' if name else ''}
        {f'额外描述：{description}' if description else ''}

        请生成详细的角色设定，包括：
        1. 基本信息（姓名、年龄、性别、职业）
        2. 外貌特征（身高、体型、发色、眼睛颜色、服装风格、特殊特征）
        3. 性格特点
        4. 背景故事
        5. 能力/技能
        6. 目标/动机
        7. 人际关系
        8. 标志性台词

        请以JSON格式返回，包含以上所有字段。
        """

        messages = [
            {"role": "system", "content": system_prompt},
            {"role": "user", "content": f"请创建一个{character_type}角色。"}
        ]

        async with httpx.AsyncClient(timeout=180.0) as client:
            async with client.stream(
                "POST",
                f"{self.base_url}chat/completions",
                headers=self.headers,
                json={
                    "model": "glm-4.6",
                    "messages": messages,
                    "max_tokens": 3000,
                    "temperature": 0.7,
                    "stream": True
                }
            ) as response:
                async for line in response.aiter_lines():
                    if line.startswith("data: "):
                        data = line[6:]
                        if data == "[DONE]":
                            break
                        try:
                            chunk = json.loads(data)
                            delta = chunk.get("choices", [{}])[0].get("delta", {})
                            content = delta.get("content", "")
                            if content:
                                yield content
                        except:
                            continue

    async def convert_to_script(
        self,
        content: str,
        script_format: str = "standard",
        characters: Optional[List[str]] = None
    ) -> str:
        """剧本转换"""
        system_prompt = f"""
        你是一个专业的编剧，请将以下小说内容转换为{script_format}格式的剧本：

        转换要求：
        1. 使用标准剧本格式（场景标题、动作描述、角色名称、对话）
        2. 识别并标注角色
        3. 提取关键场景和对话
        4. 添加必要的舞台指示
        5. 保持故事节奏和戏剧张力

        {f'主要角色：{", ".join(characters)}' if characters else ''}

        请直接输出剧本内容，使用标准的剧本格式。
        """

        messages = [
            {"role": "system", "content": system_prompt},
            {"role": "user", "content": content}
        ]

        response = await self.chat_completion(
            model="glm-4.6",
            messages=messages,
            max_tokens=2000,
            temperature=0.7,
            use_max_key=False,
            thinking={"type": "disabled"}
        )

        message = response.get("choices", [{}])[0].get("message", {})
        return message.get("content", "") or message.get("reasoning_content", "")

    async def generate_image(
        self,
        prompt: str,
        size: str = "1024x1024",
        max_retries: int = 3
    ) -> str:
        """图像生成（CogView-4）- 使用普通密钥"""
        payload = {
            "model": "cogview-4-250304",
            "prompt": prompt,
            "size": size
        }
        
        print(f"[DEBUG] Generating image with model: cogView-4-250304")
        print(f"[DEBUG] Prompt: {payload['prompt'][:100]}...")
        print(f"[DEBUG] Size: {size}")

        last_error = None
        
        for key_attempt in range(len(self.api_keys)):
            for attempt in range(max_retries):
                try:
                    async with httpx.AsyncClient(timeout=180.0) as client:
                        response = await client.post(
                            f"{self.base_url}images/generations",
                            headers=self.headers,
                            json=payload
                        )
                        
                        print(f"[DEBUG] Response status: {response.status_code}")
                        
                        response.raise_for_status()
                        result = response.json()
                        
                        print(f"[DEBUG] Image generated successfully")
                        print(f"[DEBUG] Response keys: {result.keys()}")
                        
                        return result["data"][0]["url"]
                except httpx.HTTPStatusError as e:
                    last_error = e
                    error_detail = ""
                    try:
                        error_detail = e.response.json()
                        print(f"[ERROR] API Error Response: {error_detail}")
                    except:
                        error_detail = e.response.text
                        print(f"[ERROR] API Error Text: {error_detail}")
                    
                    if e.response.status_code == 429:
                        if attempt < max_retries - 1:
                            wait_time = (2 ** attempt) * 10
                            print(f"[WARN] Rate limit (429) on key #{self.current_key_index + 1}, waiting {wait_time}s...")
                            await asyncio.sleep(wait_time)
                            continue
                        else:
                            if key_attempt < len(self.api_keys) - 1:
                                print(f"[INFO] Key #{self.current_key_index + 1} exhausted, switching to next key...")
                                self.switch_api_key()
                                break
                            else:
                                print(f"[ERROR] All API keys exhausted")
                                raise Exception("图像生成配额已用完。CogView-4需要单独的图像生成配额（0.06元/次）。请检查：1) 账户余额是否充足 2) 是否有CogView-4的使用权限 3) 并发限制（V0用户5个并发）")
                    elif e.response.status_code == 400:
                        raise Exception(f"请求参数错误（400）：{error_detail}。请检查prompt是否符合要求。")
                    elif e.response.status_code == 401:
                        raise Exception(f"API密钥无效（401）：{error_detail}。请检查ZHIPU_API_KEY配置。")
                    elif e.response.status_code == 403:
                        raise Exception(f"无权限访问（403）：{error_detail}。该API密钥可能没有CogView-4的使用权限。")
                    else:
                        print(f"[ERROR] HTTP {e.response.status_code}: {error_detail}")
                        raise Exception(f"图像生成失败（HTTP {e.response.status_code}）：{error_detail}")
                except Exception as e:
                    if "图像生成" in str(e):
                        raise  # 重新抛出已格式化的错误
                    print(f"[ERROR] Unexpected error: {str(e)}")
                    raise Exception(f"图像生成失败：{str(e)}")
        
        raise Exception("图像生成失败：所有尝试均失败")

    async def generate_video(
        self,
        image_urls: List[str],
        prompt: str = "让画面动起来",
        quality: str = "quality",
        size: str = "1920x1080",
        fps: int = 30,
        max_retries: int = 2
    ) -> str:
        """视频生成（CogVideoX-3）- 首尾帧生成视频"""
        payload = {
            "model": "cogvideox-3",
            "image_url": image_urls,
            "prompt": prompt,
            "quality": quality,
            "with_audio": False,
            "size": size,
            "fps": fps
        }
        
        print(f"[DEBUG] Video generation: {len(image_urls)} frames, {size}, {fps}fps")

        for attempt in range(max_retries):
            try:
                async with httpx.AsyncClient(timeout=600.0) as client:
                    response = await client.post(
                        f"{self.base_url}videos/generations",
                        headers=self.headers,
                        json=payload
                    )
                    response.raise_for_status()
                    result = response.json()
                    
                    task_id = result.get("id")
                    print(f"[INFO] Task created: {task_id}")
                    
                    max_polls = 120
                    for poll in range(max_polls):
                        await asyncio.sleep(3)
                        
                        try:
                            status_response = await client.get(
                                f"{self.base_url}async-result/{task_id}",
                                headers=self.headers
                            )
                            status_response.raise_for_status()
                            status_result = status_response.json()
                            
                            task_status = status_result.get("task_status")
                            
                            if task_status == "SUCCESS":
                                video_result = status_result.get("video_result", [])
                                if video_result and len(video_result) > 0:
                                    video_url = video_result[0].get("url")
                                    print(f"[SUCCESS] Video: {video_url}")
                                    return video_url
                                raise Exception("视频URL未返回")
                            elif task_status == "FAILED":
                                error_msg = status_result.get("error", {}).get("message", "Unknown")
                                raise Exception(f"生成失败: {error_msg}")
                            elif poll % 10 == 0:
                                print(f"[INFO] Processing... {poll*3}s")
                        except httpx.HTTPStatusError:
                            if poll < max_polls - 1:
                                continue
                            raise
                    
                    raise Exception("超时(6分钟)")
                    
            except httpx.HTTPStatusError as e:
                error_detail = ""
                try:
                    error_detail = e.response.json()
                except:
                    error_detail = e.response.text
                
                if e.response.status_code == 429:
                    if attempt < max_retries - 1:
                        wait_time = 60
                        print(f"[WARN] 并发限制，等待{wait_time}秒...")
                        await asyncio.sleep(wait_time)
                        continue
                    raise Exception("并发限制或配额不足。请稍后重试或检查配额。")
                elif e.response.status_code == 400:
                    raise Exception(f"参数错误: {error_detail}")
                elif e.response.status_code == 401:
                    raise Exception(f"密钥无效: {error_detail}")
                else:
                    raise Exception(f"HTTP {e.response.status_code}: {error_detail}")
            except Exception as e:
                if "视频生成" in str(e):
                    raise
                raise Exception(f"视频生成失败: {str(e)}")

    async def analyze_image(
        self,
        image_url: str,
        prompt: str = "请详细描述这张图片的内容"
    ) -> str:
        """图像分析（GLM-4.5V）"""
        import base64
        import os
        
        # 如果是本地文件路径，转换为base64
        if image_url.startswith("http://localhost") or image_url.startswith("http://127.0.0.1"):
            # 提取文件路径
            file_path = image_url.replace("http://localhost:8000/", "").replace("http://127.0.0.1:8000/", "")
            
            if os.path.exists(file_path):
                with open(file_path, "rb") as f:
                    image_data = base64.b64encode(f.read()).decode('utf-8')
                    # 获取文件扩展名
                    ext = os.path.splitext(file_path)[1].lower()
                    mime_type = {
                        '.jpg': 'image/jpeg',
                        '.jpeg': 'image/jpeg',
                        '.png': 'image/png',
                        '.gif': 'image/gif',
                        '.webp': 'image/webp'
                    }.get(ext, 'image/jpeg')
                    image_url = f"data:{mime_type};base64,{image_data}"
            else:
                raise Exception(f"图片文件不存在: {file_path}")
        
        messages = [
            {
                "role": "user",
                "content": [
                    {"type": "image_url", "image_url": {"url": image_url}},
                    {"type": "text", "text": prompt}
                ]
            }
        ]

        payload = {
            "model": "glm-4.5v",
            "messages": messages,
            "max_tokens": 2000
        }

        try:
            async with httpx.AsyncClient(timeout=120.0) as client:
                response = await client.post(
                    f"{self.base_url}chat/completions",
                    headers=self.headers,
                    json=payload
                )
                response.raise_for_status()
                result = response.json()
                return result["choices"][0]["message"]["content"]
        except httpx.HTTPStatusError as e:
            error_detail = e.response.text
            print(f"[ERROR] Image analysis: {error_detail}")
            raise Exception(f"图片分析失败: {error_detail}")
        except Exception as e:
            print(f"[ERROR] {str(e)}")
            raise Exception(f"图片分析失败: {str(e)}")

    async def analyze_video(
        self,
        video_url: str,
        prompt: str = "请详细分析这个视频的内容"
    ) -> str:
        """视频分析（GLM-4.5V）"""
        import base64
        import os
        
        # 如果是本地文件路径，转换为base64
        if video_url.startswith("http://localhost") or video_url.startswith("http://127.0.0.1"):
            # 提取文件路径
            file_path = video_url.replace("http://localhost:8000/", "").replace("http://127.0.0.1:8000/", "")
            
            if os.path.exists(file_path):
                with open(file_path, "rb") as f:
                    video_data = base64.b64encode(f.read()).decode('utf-8')
                    # 获取文件扩展名
                    ext = os.path.splitext(file_path)[1].lower()
                    mime_type = {
                        '.mp4': 'video/mp4',
                        '.mov': 'video/quicktime',
                        '.avi': 'video/x-msvideo',
                        '.mkv': 'video/x-matroska',
                        '.webm': 'video/webm'
                    }.get(ext, 'video/mp4')
                    video_url = f"data:{mime_type};base64,{video_data}"
            else:
                raise Exception(f"视频文件不存在: {file_path}")
        
        messages = [
            {
                "role": "user",
                "content": [
                    {"type": "video_url", "video_url": {"url": video_url}},
                    {"type": "text", "text": prompt}
                ]
            }
        ]

        payload = {
            "model": "glm-4.5v",
            "messages": messages,
            "max_tokens": 3000
        }

        try:
            async with httpx.AsyncClient(timeout=180.0) as client:
                response = await client.post(
                    f"{self.base_url}chat/completions",
                    headers=self.headers,
                    json=payload
                )
                response.raise_for_status()
                result = response.json()
                return result["choices"][0]["message"]["content"]
        except httpx.HTTPStatusError as e:
            error_detail = e.response.text
            print(f"[ERROR] Video analysis: {error_detail}")
            raise Exception(f"视频分析失败: {error_detail}")
        except Exception as e:
            print(f"[ERROR] {str(e)}")
            raise Exception(f"视频分析失败: {str(e)}")

    async def web_search(
        self,
        query: str,
        max_results: int = 10,
        max_retries: int = 3
    ) -> Dict[str, Any]:
        """联网搜索（使用GLM-4-Air + web_search工具）"""
        payload = {
            "model": "glm-4-air",
            "messages": [
                {
                    "role": "user",
                    "content": f"请搜索关于'{query}'的最新信息，并提供详细的搜索结果。"
                }
            ],
            "tools": [
                {
                    "type": "web_search",
                    "web_search": {
                        "enable": True,
                        "search_query": query,
                        "search_result": True
                    }
                }
            ],
            "max_tokens": 3000
        }

        for attempt in range(max_retries):
            try:
                async with httpx.AsyncClient(timeout=180.0) as client:
                    response = await client.post(
                        f"{self.base_url}chat/completions",
                        headers=self.headers,
                        json=payload
                    )
                    response.raise_for_status()
                    return response.json()
            except httpx.HTTPStatusError as e:
                if e.response.status_code == 429:
                    if attempt < max_retries - 1:
                        wait_time = (2 ** attempt) * 3
                        print(f"[WARN] Rate limit, waiting {wait_time}s...")
                        await asyncio.sleep(wait_time)
                        continue
                print(f"[ERROR] Web search failed: {str(e)}")
                raise
            except Exception as e:
                print(f"[ERROR] Web search error: {str(e)}")
                raise

    async def generate_storyboard(
        self,
        script: str,
        style: str = "cinematic",
        shots: int = 6
    ) -> List[Dict[str, Any]]:
        """分镜生成 - 确保生成完整的镜头数量"""
        system_prompt = f"""
        你是一个专业的分镜师，请根据以下剧本生成{shots}个完整的分镜脚本：

        风格：{style}
        镜头数量：必须生成{shots}个镜头

        请为每个镜头生成：
        1. shot_number: 镜头编号（1到{shots}）
        2. shot_type: 景别（全景、中景、近景、特写等）
        3. angle: 角度（平视、俯视、仰视等）
        4. description: 画面描述
        5. action: 动作指示
        6. dialogue: 对话/字幕
        7. transition: 转场方式
        8. duration: 时长

        重要：必须返回完整的{shots}个镜头，以JSON数组格式返回。
        示例格式：[{{"shot_number": 1, "shot_type": "中景", ...}}, {{"shot_number": 2, ...}}]
        """

        messages = [
            {"role": "system", "content": system_prompt},
            {"role": "user", "content": f"剧本内容：{script}\n\n请生成{shots}个完整的分镜。"}
        ]

        response = await self.chat_completion(
            model="glm-4.6",
            messages=messages,
            max_tokens=4000,  # 增加到4000确保能生成完整的镜头
            temperature=0.7,
            use_max_key=False,
            thinking={"type": "disabled"}
        )

        message = response.get("choices", [{}])[0].get("message", {})
        content = message.get("content", "") or message.get("reasoning_content", "")
        
        try:
            result = json.loads(content)
            if isinstance(result, list):
                return result
            elif isinstance(result, dict) and 'storyboard' in result:
                return result['storyboard']
            else:
                return [result]
        except json.JSONDecodeError:
            return [{"error": "无法解析分镜结果", "raw_content": content}]

# 创建全局实例
zhipu_service = ZhipuAIService()