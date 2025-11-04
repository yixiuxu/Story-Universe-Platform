from fastapi import APIRouter
from fastapi.responses import StreamingResponse
from pydantic import BaseModel
from typing import Optional
from services.zhipu_service import zhipu_service

router = APIRouter()

class NovelStreamRequest(BaseModel):
    genre: str
    theme: str
    length: str = "medium"
    style: str = "modern"
    prompt: Optional[str] = None

@router.post("/stream")
async def generate_novel_stream(request: NovelStreamRequest):
    """流式生成小说"""
    async def generate():
        async for chunk in zhipu_service.generate_novel_stream(
            genre=request.genre,
            theme=request.theme,
            length=request.length,
            style=request.style,
            prompt=request.prompt
        ):
            yield chunk
    
    return StreamingResponse(generate(), media_type="text/plain")
