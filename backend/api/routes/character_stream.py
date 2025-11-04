from fastapi import APIRouter
from fastapi.responses import StreamingResponse
from pydantic import BaseModel
from typing import Optional
from services.zhipu_service import zhipu_service

router = APIRouter()

class CharacterStreamRequest(BaseModel):
    type: str
    setting: str
    name: Optional[str] = None
    description: Optional[str] = None

@router.post("/stream")
async def generate_character_stream(request: CharacterStreamRequest):
    """流式生成角色"""
    async def generate():
        async for chunk in zhipu_service.generate_character_stream(
            character_type=request.type,
            setting=request.setting,
            name=request.name,
            description=request.description
        ):
            yield chunk
    
    return StreamingResponse(generate(), media_type="text/plain")
