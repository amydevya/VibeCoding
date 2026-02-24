"""
会话 API 路由
"""

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import List, Optional

from app.db.session_store import session_store, Session, Message


router = APIRouter(prefix="/api/sessions", tags=["Sessions"])


class SessionCreate(BaseModel):
    title: Optional[str] = "新会话"


class SessionUpdate(BaseModel):
    title: str


class SessionResponse(BaseModel):
    id: str
    title: str
    created_at: str
    updated_at: str


class MessageResponse(BaseModel):
    id: str
    session_id: str
    role: str
    content: str
    sql: Optional[str]
    data: Optional[list]
    chart: Optional[dict]
    created_at: str


@router.on_event("startup")
async def startup():
    """初始化数据库表"""
    await session_store.initialize()


@router.post("", response_model=SessionResponse)
async def create_session(body: SessionCreate = None):
    """创建新会话"""
    if body is None:
        body = SessionCreate()
    session = await session_store.create_session(body.title)
    return session


@router.get("", response_model=List[SessionResponse])
async def list_sessions(limit: int = 50):
    """获取会话列表"""
    sessions = await session_store.list_sessions(limit)
    return sessions


@router.get("/{session_id}", response_model=SessionResponse)
async def get_session(session_id: str):
    """获取会话详情"""
    session = await session_store.get_session(session_id)
    if not session:
        raise HTTPException(status_code=404, detail="Session not found")
    return session


@router.put("/{session_id}", response_model=SessionResponse)
async def update_session(session_id: str, body: SessionUpdate):
    """更新会话"""
    session = await session_store.get_session(session_id)
    if not session:
        raise HTTPException(status_code=404, detail="Session not found")
    
    await session_store.update_session(session_id, body.title)
    return await session_store.get_session(session_id)


@router.delete("/{session_id}")
async def delete_session(session_id: str):
    """删除会话"""
    await session_store.delete_session(session_id)
    return {"success": True}


@router.get("/{session_id}/messages", response_model=List[MessageResponse])
async def get_session_messages(session_id: str, limit: int = 100):
    """获取会话消息"""
    messages = await session_store.get_messages(session_id, limit)
    return messages
