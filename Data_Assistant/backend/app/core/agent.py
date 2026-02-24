"""
数据分析 Agent
集成 LLM + 数据库 + 图表推荐
"""

import json
from typing import AsyncGenerator, Dict, Any, List, Optional
from dataclasses import dataclass

from app.core.llm import Qwen3LLM, ToolCall
from app.db.sqlite_manager import SQLiteManager


@dataclass
class QueryResult:
    """查询结果"""
    sql: str
    data: List[Dict[str, Any]]
    chart_config: Optional[Dict[str, Any]]
    answer: str


class DataAnalysisAgent:
    """数据分析 Agent"""
    
    def __init__(
        self,
        llm: Optional[Qwen3LLM] = None,
        db: Optional[SQLiteManager] = None,
    ):
        self.llm = llm or Qwen3LLM()
        self.db = db or SQLiteManager()
    
    async def process_query(
        self,
        question: str,
        session_id: Optional[str] = None,
        use_tool: bool = True,
    ) -> QueryResult:
        """
        处理用户查询
        
        Args:
            question: 用户问题
            session_id: 会话 ID
            use_tool: 是否使用函数调用模式
        
        Returns:
            查询结果
        """
        # 1. 获取数据库 Schema
        schema = await self.db.get_schema()
        
        # 2. 生成 SQL
        if use_tool:
            tool_call = await self.llm.generate_sql_with_tool(question, schema)
            sql = tool_call.function_arguments.get("sql", "")
        else:
            sql = await self.llm.generate_sql(question, schema)
        
        # 3. 执行 SQL
        try:
            data = await self.db.execute_query(sql)
        except Exception as e:
            # SQL 执行失败，返回错误信息
            return QueryResult(
                sql=sql,
                data=[],
                chart_config=None,
                answer=f"SQL 执行失败: {str(e)}"
            )
        
        # 4. 推荐图表
        chart_config = None
        if data:
            try:
                chart_config = await self.llm.recommend_chart(data, question, sql)
            except Exception as e:
                print(f"Chart recommendation failed: {e}")
        
        # 5. 生成回答
        answer_parts = []
        async for chunk in self.llm.generate_answer(question, sql, data):
            answer_parts.append(chunk)
        answer = "".join(answer_parts)
        
        return QueryResult(
            sql=sql,
            data=data,
            chart_config=chart_config,
            answer=answer
        )
    
    async def stream_process_query(
        self,
        question: str,
        session_id: Optional[str] = None,
    ) -> AsyncGenerator[Dict[str, Any], None]:
        """
        流式处理用户查询
        
        Yields:
            SSE 格式的事件
        """
        # 1. 获取 Schema
        schema = await self.db.get_schema()
        
        # 2. 生成 SQL (使用函数调用)
        yield {"type": "status", "content": "正在分析问题..."}
        
        try:
            tool_call = await self.llm.generate_sql_with_tool(question, schema)
            sql = tool_call.function_arguments.get("sql", "")
            reason = tool_call.function_arguments.get("reason", "")
            
            yield {"type": "sql", "content": sql}
            if reason:
                yield {"type": "reason", "content": reason}
        
        except Exception as e:
            yield {"type": "error", "content": f"SQL 生成失败: {str(e)}"}
            return
        
        # 3. 执行 SQL
        yield {"type": "status", "content": "正在查询数据..."}
        
        try:
            data = await self.db.execute_query(sql)
            yield {"type": "data", "content": data, "count": len(data)}
        except Exception as e:
            yield {"type": "error", "content": f"SQL 执行失败: {str(e)}"}
            return
        
        # 4. 推荐图表
        if data:
            yield {"type": "status", "content": "正在分析图表..."}
            try:
                chart_config = await self.llm.recommend_chart(data, question, sql)
                yield {"type": "chart", "content": chart_config}
            except Exception as e:
                print(f"Chart recommendation failed: {e}")
        
        # 5. 流式生成回答
        yield {"type": "status", "content": "正在生成回答..."}
        
        answer_parts = []
        async for chunk in self.llm.generate_answer(question, sql, data):
            answer_parts.append(chunk)
            yield {"type": "answer_chunk", "content": chunk}
        
        yield {"type": "answer", "content": "".join(answer_parts)}
        yield {"type": "done", "content": None}


# 创建全局实例
agent = DataAnalysisAgent()
