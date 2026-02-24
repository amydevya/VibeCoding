"""
聊天查询 API 路由
支持 SSE 流式响应
"""

import logging
from fastapi import APIRouter, HTTPException
from fastapi.responses import StreamingResponse, JSONResponse
from pydantic import BaseModel
from typing import Optional
import json

from app.core.agent import DataAnalysisAgent
from app.db.session_store import session_store

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/api/chat", tags=["Chat"])

# 创建 Agent 实例
agent = DataAnalysisAgent()

# 用于错误响应的 CORS 头，与 main.py 中 CORS 配置一致
CORS_HEADERS = {
    "Access-Control-Allow-Origin": "http://localhost:5173",
    "Access-Control-Allow-Credentials": "true",
    "Access-Control-Allow-Methods": "*",
    "Access-Control-Allow-Headers": "*",
}


class ChatQueryRequest(BaseModel):
    session_id: str
    question: str


@router.post("/query")
async def chat_query(body: ChatQueryRequest):
    """
    处理聊天查询（SSE 流式响应）
    
    返回 SSE 格式的流式数据：
    - type: status / sql / data / chart / answer / error / done
    - content: 对应类型的数据
    """
    try:
        session = await session_store.get_session(body.session_id)
    except Exception as e:
        logger.exception("get_session failed: %s", e)
        return JSONResponse(
            status_code=500,
            content={"detail": str(e), "type": "SessionError"},
            headers=CORS_HEADERS,
        )
    if not session:
        raise HTTPException(status_code=404, detail="Session not found")

    async def event_generator():
        """SSE 事件生成器"""
        try:
            # 添加用户消息
            await session_store.add_message(
                session_id=body.session_id,
                role="user",
                content=body.question
            )
            
            # 收集结果
            sql_result = None
            data_result = None
            chart_result = None
            answer_result = ""
            
            # 流式处理查询
            async for event in agent.stream_process_query(body.question, body.session_id):
                event_type = event.get("type")
                content = event.get("content")
                
                # 发送 SSE 事件
                yield f"data: {json.dumps({'type': event_type, 'content': content}, ensure_ascii=False)}\n\n"
                
                # 收集结果
                if event_type == "sql":
                    sql_result = content
                elif event_type == "data":
                    data_result = content
                elif event_type == "chart":
                    chart_result = content
                elif event_type == "answer":
                    answer_result = content
            
            # 添加助手消息
            await session_store.add_message(
                session_id=body.session_id,
                role="assistant",
                content=answer_result,
                sql=sql_result,
                data=data_result,
                chart=chart_result
            )
            
        except Exception as e:
            yield f"data: {json.dumps({'type': 'error', 'content': str(e)}, ensure_ascii=False)}\n\n"
    
    return StreamingResponse(
        event_generator(),
        media_type="text/event-stream",
        headers={
            "Cache-Control": "no-cache",
            "Connection": "keep-alive",
        }
    )


@router.post("/query/sync")
async def chat_query_sync(body: ChatQueryRequest):
    """
    处理聊天查询（同步响应）
    """
    # 验证会话存在
    session = await session_store.get_session(body.session_id)
    if not session:
        raise HTTPException(status_code=404, detail="Session not found")
    
    try:
        # 添加用户消息
        await session_store.add_message(
            session_id=body.session_id,
            role="user",
            content=body.question
        )
        
        # 处理查询
        result = await agent.process_query(body.question, body.session_id)
        
        # 添加助手消息
        await session_store.add_message(
            session_id=body.session_id,
            role="assistant",
            content=result.answer,
            sql=result.sql,
            data=result.data,
            chart=result.chart_config
        )
        
        return {
            "success": True,
            "sql": result.sql,
            "data": result.data,
            "chart": result.chart_config,
            "answer": result.answer
        }
        
    except Exception as e:
        return {
            "success": False,
            "error": str(e)
        }
