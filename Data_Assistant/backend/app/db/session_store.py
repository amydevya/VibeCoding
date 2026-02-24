"""
会话管理模块
支持会话 CRUD、对话历史存储
"""

import json
import uuid
from datetime import datetime
from typing import List, Dict, Any, Optional
from dataclasses import dataclass, asdict

from app.db.sqlite_manager import SQLiteManager


@dataclass
class Session:
    """会话"""
    id: str
    title: str
    created_at: str
    updated_at: str


@dataclass
class Message:
    """消息"""
    id: str
    session_id: str
    role: str
    content: str
    sql: Optional[str]
    data: Optional[List[Dict[str, Any]]]
    chart: Optional[Dict[str, Any]]
    created_at: str


class SessionStore:
    """会话存储"""
    
    def __init__(self, db: Optional[SQLiteManager] = None):
        self.db = db or SQLiteManager()
    
    async def initialize(self):
        """初始化表结构"""
        # 创建会话表
        await self.db.create_table("sessions", {
            "id": "TEXT PRIMARY KEY",
            "title": "TEXT NOT NULL",
            "created_at": "TEXT NOT NULL",
            "updated_at": "TEXT NOT NULL"
        })
        
        # 创建消息表
        await self.db.create_table("messages", {
            "id": "TEXT PRIMARY KEY",
            "session_id": "TEXT NOT NULL",
            "role": "TEXT NOT NULL",
            "content": "TEXT NOT NULL",
            "sql": "TEXT",
            "data": "TEXT",
            "chart": "TEXT",
            "created_at": "TEXT NOT NULL"
        })
    
    async def create_session(self, title: str = "新会话") -> Session:
        """创建新会话"""
        now = datetime.now().isoformat()
        session = Session(
            id=str(uuid.uuid4()),
            title=title,
            created_at=now,
            updated_at=now
        )
        
        await self.db.execute_update(
            "INSERT INTO sessions (id, title, created_at, updated_at) VALUES (?, ?, ?, ?)",
            (session.id, session.title, session.created_at, session.updated_at)
        )
        
        return session
    
    async def get_session(self, session_id: str) -> Optional[Session]:
        """获取会话"""
        async with self.db.get_connection() as conn:
            cursor = await conn.execute(
                "SELECT * FROM sessions WHERE id = ?",
                (session_id,)
            )
            row = await cursor.fetchone()
            if row:
                return Session(
                    id=row["id"],
                    title=row["title"],
                    created_at=row["created_at"],
                    updated_at=row["updated_at"]
                )
        return None
    
    async def list_sessions(self, limit: int = 50) -> List[Session]:
        """获取会话列表"""
        async with self.db.get_connection() as conn:
            cursor = await conn.execute(
                "SELECT * FROM sessions ORDER BY updated_at DESC LIMIT ?",
                (limit,)
            )
            rows = await cursor.fetchall()
            return [
                Session(
                    id=row["id"],
                    title=row["title"],
                    created_at=row["created_at"],
                    updated_at=row["updated_at"]
                )
                for row in rows
            ]
    
    async def update_session(self, session_id: str, title: str) -> bool:
        """更新会话标题"""
        now = datetime.now().isoformat()
        await self.db.execute_update(
            "UPDATE sessions SET title = ?, updated_at = ? WHERE id = ?",
            (title, now, session_id)
        )
        return True
    
    async def delete_session(self, session_id: str) -> bool:
        """删除会话及其消息"""
        await self.db.execute_update(
            "DELETE FROM messages WHERE session_id = ?",
            (session_id,)
        )
        await self.db.execute_update(
            "DELETE FROM sessions WHERE id = ?",
            (session_id,)
        )
        return True
    
    async def add_message(
        self,
        session_id: str,
        role: str,
        content: str,
        sql: Optional[str] = None,
        data: Optional[List[Dict]] = None,
        chart: Optional[Dict] = None,
    ) -> Message:
        """添加消息"""
        now = datetime.now().isoformat()
        message = Message(
            id=str(uuid.uuid4()),
            session_id=session_id,
            role=role,
            content=content,
            sql=sql,
            data=data,
            chart=chart,
            created_at=now
        )
        
        await self.db.execute_update(
            """INSERT INTO messages (id, session_id, role, content, sql, data, chart, created_at)
               VALUES (?, ?, ?, ?, ?, ?, ?, ?)""",
            (
                message.id,
                message.session_id,
                message.role,
                message.content,
                message.sql,
                json.dumps(data) if data else None,
                json.dumps(chart) if chart else None,
                message.created_at
            )
        )
        
        # 更新会话时间
        await self.db.execute_update(
            "UPDATE sessions SET updated_at = ? WHERE id = ?",
            (now, session_id)
        )
        
        return message
    
    async def get_messages(self, session_id: str, limit: int = 100) -> List[Message]:
        """获取会话消息"""
        async with self.db.get_connection() as conn:
            cursor = await conn.execute(
                "SELECT * FROM messages WHERE session_id = ? ORDER BY created_at ASC LIMIT ?",
                (session_id, limit)
            )
            rows = await cursor.fetchall()
            return [
                Message(
                    id=row["id"],
                    session_id=row["session_id"],
                    role=row["role"],
                    content=row["content"],
                    sql=row["sql"],
                    data=json.loads(row["data"]) if row["data"] else None,
                    chart=json.loads(row["chart"]) if row["chart"] else None,
                    created_at=row["created_at"]
                )
                for row in rows
            ]
    
    async def get_message_history(self, session_id: str) -> List[Dict[str, Any]]:
        """获取用于 LLM 的消息历史"""
        messages = await self.get_messages(session_id)
        history = []
        
        for msg in messages:
            if msg.role == "user":
                history.append({"role": "user", "content": msg.content})
            elif msg.role == "assistant":
                history.append({"role": "assistant", "content": msg.content})
        
        return history


# 创建全局实例
session_store = SessionStore()
