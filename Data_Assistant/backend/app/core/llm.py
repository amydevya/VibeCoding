"""
Qwen3 LLM 封装模块
支持基础对话、流式输出、函数调用
"""

import httpx
import json
from typing import AsyncGenerator, Optional, List, Dict, Any
from dataclasses import dataclass

from app.config import settings


@dataclass
class ChatMessage:
    """聊天消息"""
    role: str  # system, user, assistant, tool
    content: str
    tool_calls: Optional[List[Dict]] = None
    tool_call_id: Optional[str] = None


@dataclass
class ToolCall:
    """函数调用"""
    id: str
    type: str
    function_name: str
    function_arguments: Dict[str, Any]


class Qwen3LLM:
    """Qwen3 LLM 封装类"""
    
    BASE_URL = "https://dashscope.aliyuncs.com/compatible-mode/v1"
    
    def __init__(
        self,
        api_key: Optional[str] = None,
        model: str = "qwen3-max",
        temperature: float = 0.7,
    ):
        self.api_key = api_key or settings.dashscope_api_key
        self.model = model
        self.temperature = temperature
        self.headers = {
            "Authorization": f"Bearer {self.api_key}",
            "Content-Type": "application/json",
        }
    
    async def chat(
        self,
        messages: List[Dict[str, Any]],
        tools: Optional[List[Dict]] = None,
        tool_choice: str = "auto",
    ) -> Dict[str, Any]:
        """
        基础对话（非流式）
        
        Args:
            messages: 消息列表
            tools: 工具定义列表
            tool_choice: 工具选择策略
        
        Returns:
            完整响应
        """
        url = f"{self.BASE_URL}/chat/completions"
        
        payload = {
            "model": self.model,
            "messages": messages,
            "temperature": self.temperature,
        }
        
        if tools:
            payload["tools"] = tools
            payload["tool_choice"] = tool_choice
        
        async with httpx.AsyncClient(timeout=60, trust_env=False) as client:
            response = await client.post(url, headers=self.headers, json=payload)
            response.raise_for_status()
            return response.json()
    
    async def stream_chat(
        self,
        messages: List[Dict[str, Any]],
        tools: Optional[List[Dict]] = None,
        tool_choice: str = "auto",
    ) -> AsyncGenerator[Dict[str, Any], None]:
        """
        流式对话
        
        Yields:
            每个 chunk 的增量内容
        """
        url = f"{self.BASE_URL}/chat/completions"
        
        payload = {
            "model": self.model,
            "messages": messages,
            "temperature": self.temperature,
            "stream": True,
        }
        
        if tools:
            payload["tools"] = tools
            payload["tool_choice"] = tool_choice
        
        async with httpx.AsyncClient(timeout=60, trust_env=False) as client:
            async with client.stream("POST", url, headers=self.headers, json=payload) as response:
                response.raise_for_status()
                
                async for line in response.aiter_lines():
                    if not line:
                        continue
                    
                    if line.startswith("data:"):
                        data_str = line[5:].strip()
                        if data_str == "[DONE]":
                            break
                        
                        try:
                            chunk = json.loads(data_str)
                            yield chunk
                        except json.JSONDecodeError:
                            continue
    
    async def generate_sql(
        self,
        question: str,
        schema: str,
        stream: bool = False,
    ) -> str:
        """
        生成 SQL 查询（普通模式）
        
        Args:
            question: 用户问题
            schema: 数据库 Schema
            stream: 是否流式输出
        
        Returns:
            SQL 语句
        """
        system_prompt = f"""你是一个专业的 SQL 查询专家。根据用户的自然语言问题和数据库结构，生成准确的 SQL 查询语句。

数据库结构:
{schema}

规则:
1. 只返回 SQL 语句，不要解释
2. 使用 SQLite 语法
3. SQL 语句用 ```sql 和 ``` 包裹"""

        messages = [
            {"role": "system", "content": system_prompt},
            {"role": "user", "content": question}
        ]
        
        if stream:
            full_content = ""
            async for chunk in self.stream_chat(messages):
                if "choices" in chunk and len(chunk["choices"]) > 0:
                    delta = chunk["choices"][0].get("delta", {})
                    content = delta.get("content", "")
                    if content:
                        full_content += content
            return self._extract_sql(full_content)
        else:
            result = await self.chat(messages)
            content = result["choices"][0]["message"]["content"]
            return self._extract_sql(content)
    
    async def generate_sql_with_tool(
        self,
        question: str,
        schema: str,
    ) -> ToolCall:
        """
        生成 SQL 查询（函数调用模式）
        
        Args:
            question: 用户问题
            schema: 数据库 Schema
        
        Returns:
            ToolCall 对象
        """
        tools = [
            {
                "type": "function",
                "function": {
                    "name": "execute_sql",
                    "description": "执行 SQL 查询并返回结果",
                    "parameters": {
                        "type": "object",
                        "properties": {
                            "sql": {
                                "type": "string",
                                "description": "要执行的 SQL 查询语句"
                            },
                            "reason": {
                                "type": "string",
                                "description": "生成该 SQL 的原因"
                            }
                        },
                        "required": ["sql"]
                    }
                }
            }
        ]
        
        system_prompt = f"""你是一个数据分析专家。根据用户问题，生成 SQL 查询来获取数据。

数据库结构:
{schema}

规则:
1. 使用 SQLite 语法
2. 调用 execute_sql 函数执行查询
3. SQL 必须符合数据库结构"""

        messages = [
            {"role": "system", "content": system_prompt},
            {"role": "user", "content": question}
        ]
        
        result = await self.chat(messages, tools=tools)
        message = result["choices"][0]["message"]
        
        if "tool_calls" in message and message["tool_calls"]:
            tc = message["tool_calls"][0]
            return ToolCall(
                id=tc["id"],
                type=tc["type"],
                function_name=tc["function"]["name"],
                function_arguments=json.loads(tc["function"]["arguments"])
            )
        
        raise ValueError("No tool_calls in response")
    
    async def recommend_chart(
        self,
        data: List[Dict[str, Any]],
        question: str,
        sql: str,
    ) -> Dict[str, Any]:
        """
        推荐图表类型并生成 ECharts 配置
        
        Args:
            data: 查询结果数据
            question: 用户原始问题
            sql: 执行的 SQL
        
        Returns:
            图表配置
        """
        system_prompt = """你是一个数据可视化专家。根据查询数据和用户问题，推荐最合适的图表类型并生成 ECharts 配置。

支持的图表类型:
- bar: 柱状图（适合分类比较）
- line: 折线图（适合趋势分析）
- pie: 饼图（适合占比分析）
- scatter: 散点图（适合相关性分析）
- radar: 雷达图（适合多维度对比）

返回格式（JSON）:
{
    "chart_type": "bar|line|pie|scatter|radar",
    "echarts_option": { ... ECharts 配置 ... },
    "summary": "数据摘要说明"
}"""

        data_preview = data[:10] if len(data) > 10 else data
        
        user_message = f"""用户问题: {question}
执行的 SQL: {sql}
查询结果数据（前10条）: {json.dumps(data_preview, ensure_ascii=False)}

请分析数据并推荐最合适的图表类型，生成 ECharts 配置。"""

        messages = [
            {"role": "system", "content": system_prompt},
            {"role": "user", "content": user_message}
        ]
        
        result = await self.chat(messages)
        content = result["choices"][0]["message"]["content"]
        
        # 提取 JSON
        return self._extract_json(content)
    
    async def generate_answer(
        self,
        question: str,
        sql: str,
        data: List[Dict[str, Any]],
    ) -> AsyncGenerator[str, None]:
        """
        生成自然语言回答（流式）
        
        Args:
            question: 用户问题
            sql: 执行的 SQL
            data: 查询结果
        
        Yields:
            增量回答内容
        """
        system_prompt = """你是一个数据分析助手。根据用户问题和查询结果，用自然语言回答用户的问题。

规则:
1. 回答要简洁明了
2. 包含关键数据
3. 提供数据洞察"""

        data_preview = data[:5] if len(data) > 5 else data
        
        user_message = f"""用户问题: {question}
执行的 SQL: {sql}
查询结果: {json.dumps(data_preview, ensure_ascii=False)}
总记录数: {len(data)}

请用自然语言回答用户的问题。"""

        messages = [
            {"role": "system", "content": system_prompt},
            {"role": "user", "content": user_message}
        ]
        
        async for chunk in self.stream_chat(messages):
            if "choices" in chunk and len(chunk["choices"]) > 0:
                delta = chunk["choices"][0].get("delta", {})
                content = delta.get("content", "")
                if content:
                    yield content
    
    def _extract_sql(self, content: str) -> str:
        """从内容中提取 SQL"""
        import re
        sql_match = re.search(r'```sql\s*(.*?)\s*```', content, re.DOTALL | re.IGNORECASE)
        if sql_match:
            return sql_match.group(1).strip()
        
        # 尝试直接提取 SELECT 语句
        sql_match = re.search(r'(SELECT\s+.+\s+FROM\s+.+)', content, re.DOTALL | re.IGNORECASE)
        if sql_match:
            return sql_match.group(1).strip()
        
        return content.strip()
    
    def _extract_json(self, content: str) -> Dict[str, Any]:
        """从内容中提取 JSON"""
        import re
        json_match = re.search(r'```json\s*(.*?)\s*```', content, re.DOTALL | re.IGNORECASE)
        if json_match:
            return json.loads(json_match.group(1))
        
        # 尝试直接解析
        try:
            return json.loads(content)
        except:
            pass
        
        # 尝试提取 { } 之间的内容
        json_match = re.search(r'\{.*\}', content, re.DOTALL)
        if json_match:
            return json.loads(json_match.group(0))
        
        raise ValueError("Cannot extract JSON from content")


# 创建全局实例
llm = Qwen3LLM()
