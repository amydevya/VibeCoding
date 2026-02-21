from datetime import datetime
from typing import Optional, List
from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from sqlalchemy import select, delete
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.database import get_db
from app.models import Conversation, Message

router = APIRouter(prefix="/api/conversations", tags=["conversations"])


class CreateConversationRequest(BaseModel):
    title: Optional[str] = "新对话"
    thinking_enabled: bool = False


class UpdateTitleRequest(BaseModel):
    title: str


class ConversationResponse(BaseModel):
    id: str
    title: str
    thinkingEnabled: bool
    createdAt: str
    updatedAt: str

    class Config:
        from_attributes = True


class MessageResponse(BaseModel):
    id: str
    conversationId: str
    role: str
    content: str
    reasoningContent: Optional[str] = None
    createdAt: str

    class Config:
        from_attributes = True


class ConversationDetailResponse(BaseModel):
    conversation: ConversationResponse
    messages: List[MessageResponse]


@router.get("", response_model=List[ConversationResponse])
async def get_conversations(db: AsyncSession = Depends(get_db)):
    """获取所有会话列表"""
    result = await db.execute(
        select(Conversation).order_by(Conversation.updated_at.desc())
    )
    conversations = result.scalars().all()
    return [conv.to_dict() for conv in conversations]


@router.post("", response_model=ConversationResponse)
async def create_conversation(
    request: CreateConversationRequest,
    db: AsyncSession = Depends(get_db)
):
    """创建新会话"""
    conversation = Conversation(
        title=request.title,
        thinking_enabled=request.thinking_enabled
    )
    db.add(conversation)
    await db.commit()
    await db.refresh(conversation)
    return conversation.to_dict()


@router.get("/{conversation_id}", response_model=ConversationDetailResponse)
async def get_conversation(
    conversation_id: str,
    db: AsyncSession = Depends(get_db)
):
    """获取会话详情及消息"""
    result = await db.execute(
        select(Conversation)
        .options(selectinload(Conversation.messages))
        .where(Conversation.id == conversation_id)
    )
    conversation = result.scalar_one_or_none()
    
    if not conversation:
        raise HTTPException(status_code=404, detail="Conversation not found")
    
    return {
        "conversation": conversation.to_dict(),
        "messages": [msg.to_dict() for msg in conversation.messages]
    }


@router.delete("/{conversation_id}")
async def delete_conversation(
    conversation_id: str,
    db: AsyncSession = Depends(get_db)
):
    """删除会话"""
    result = await db.execute(
        select(Conversation).where(Conversation.id == conversation_id)
    )
    conversation = result.scalar_one_or_none()
    
    if not conversation:
        raise HTTPException(status_code=404, detail="Conversation not found")
    
    await db.delete(conversation)
    await db.commit()
    
    return {"success": True, "id": conversation_id}


@router.patch("/{conversation_id}/title", response_model=ConversationResponse)
async def update_conversation_title(
    conversation_id: str,
    request: UpdateTitleRequest,
    db: AsyncSession = Depends(get_db)
):
    """更新会话标题"""
    result = await db.execute(
        select(Conversation).where(Conversation.id == conversation_id)
    )
    conversation = result.scalar_one_or_none()
    
    if not conversation:
        raise HTTPException(status_code=404, detail="Conversation not found")
    
    conversation.title = request.title
    conversation.updated_at = datetime.utcnow()
    await db.commit()
    await db.refresh(conversation)
    
    return conversation.to_dict()


@router.patch("/{conversation_id}/thinking", response_model=ConversationResponse)
async def update_thinking_enabled(
    conversation_id: str,
    thinking_enabled: bool,
    db: AsyncSession = Depends(get_db)
):
    """更新会话的思考模式开关"""
    result = await db.execute(
        select(Conversation).where(Conversation.id == conversation_id)
    )
    conversation = result.scalar_one_or_none()
    
    if not conversation:
        raise HTTPException(status_code=404, detail="Conversation not found")
    
    conversation.thinking_enabled = thinking_enabled
    conversation.updated_at = datetime.utcnow()
    await db.commit()
    await db.refresh(conversation)
    
    return conversation.to_dict()
