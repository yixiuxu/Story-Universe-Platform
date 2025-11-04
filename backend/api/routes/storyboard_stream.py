from fastapi import APIRouter
from fastapi.responses import StreamingResponse
from pydantic import BaseModel
from typing import Optional
from services.zhipu_service import zhipu_service

router = APIRouter()

class StoryboardStreamRequest(BaseModel):
    script: str
    style: str = "cinematic"
    shots: int = 6
    scene_description: Optional[str] = None

@router.post("/stream")
async def generate_storyboard_stream(request: StoryboardStreamRequest):
    """流式分镜生成"""
    async def generate():
        async for chunk in zhipu_service.generate_storyboard_stream(
            script=request.script,
            style=request.style,
            shots=request.shots
        ):
            yield chunk
    
    return StreamingResponse(generate(), media_type="text/plain")
