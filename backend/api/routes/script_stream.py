from fastapi import APIRouter
from fastapi.responses import StreamingResponse
from pydantic import BaseModel
from typing import Optional, List
from services.zhipu_service import zhipu_service

router = APIRouter()

class ScriptStreamRequest(BaseModel):
    content: str
    script_format: str = "standard"
    characters: Optional[List[str]] = None

@router.post("/stream")
async def convert_script_stream(request: ScriptStreamRequest):
    """流式剧本转换"""
    async def generate():
        async for chunk in zhipu_service.convert_to_script_stream(
            content=request.content,
            script_format=request.script_format,
            characters=request.characters
        ):
            yield chunk
    
    return StreamingResponse(generate(), media_type="text/plain")
