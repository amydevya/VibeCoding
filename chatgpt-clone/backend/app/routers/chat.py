import json
from datetime import datetime
from fastapi import APIRouter, Depends, HTTPException
from fastapi.responses import StreamingResponse
from pydantic import BaseModel
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.database import get_db
from app.models import Conversation, Message
from app.services.deepseek_service import get_deepseek_service

router = APIRouter(prefix="/api", tags=["chat"])


class ChatRequest(BaseModel):
    conversation_id: str
    message: str
    thinking_enabled: bool = False


@router.post("/chat")
async def chat(
    request: ChatRequest,
    db: AsyncSession = Depends(get_db)
):
    """
    发送消息并流式返回 AI 响应
    
    SSE 事件格式:
    - data: {"type": "reasoning", "content": "..."} - 思考过程
    - data: {"type": "content", "content": "..."} - 最终回答
    - data: {"type": "done"} - 完成
    - data: {"type": "error", "message": "..."} - 错误
    """
    # 获取会话
    result = await db.execute(
        select(Conversation)
        .options(selectinload(Conversation.messages))
        .where(Conversation.id == request.conversation_id)
    )
    conversation = result.scalar_one_or_none()
    
    if not conversation:
        raise HTTPException(status_code=404, detail="Conversation not found")
    
    # 保存用户消息
    user_message = Message(
        conversation_id=conversation.id,
        role="user",
        content=request.message
    )
    db.add(user_message)
    
    # 更新会话时间
    conversation.updated_at = datetime.utcnow()
    
    # 如果是第一条消息，使用消息内容作为会话标题
    if len(conversation.messages) == 0:
        title = request.message[:50] + ("..." if len(request.message) > 50 else "")
        conversation.title = title
    
    await db.commit()
    await db.refresh(user_message)
    
    # 构建消息历史
    messages = []
    for msg in conversation.messages:
        messages.append({
            "role": msg.role,
            "content": msg.content
        })
    messages.append({
        "role": "user",
        "content": request.message
    })
    
    # 使用会话设置或请求设置的思考模式
    thinking_enabled = request.thinking_enabled or conversation.thinking_enabled

    async def generate():
        deepseek_service = get_deepseek_service()
        reasoning_content = ""
        content = ""
        
        async for chunk in deepseek_service.stream_chat(messages, thinking_enabled):
            # 收集内容用于保存
            if chunk["type"] == "reasoning":
                reasoning_content += chunk.get("content", "")
            elif chunk["type"] == "content":
                content += chunk.get("content", "")
            
            # 发送 SSE 事件
            yield f"data: {json.dumps(chunk, ensure_ascii=False)}\n\n"
        
        # 流式输出完成后保存 assistant 消息
        if content:
            assistant_message = Message(
                conversation_id=conversation.id,
                role="assistant",
                content=content,
                reasoning_content=reasoning_content if reasoning_content else None
            )
            db.add(assistant_message)
            await db.commit()

    return StreamingResponse(
        generate(),
        media_type="text/event-stream",
        headers={
            "Cache-Control": "no-cache",
            "Connection": "keep-alive",
            "X-Accel-Buffering": "no"
        }
    )
