"""
NL2SQL 组件测试
测试内容：
1. 获取数据库 Schema
2. 构造 Text2SQL Prompt
3. 测试普通模式生成 SQL
4. 测试函数调用模式生成 SQL
5. 测试流式输出 SQL
"""

import os
import httpx
import json
import sqlite3
from typing import AsyncGenerator

# 配置：从环境变量读取，避免提交敏感信息
DASHSCOPE_API_KEY = os.environ.get("DASHSCOPE_API_KEY", "").strip()
MODEL_NAME = "qwen3-max"
BASE_URL = "https://dashscope.aliyuncs.com/compatible-mode/v1"


def setup_test_database():
    """创建测试数据库和表"""
    conn = sqlite3.connect(":memory:")
    cursor = conn.cursor()
    
    # 创建销售表
    cursor.execute("""
        CREATE TABLE sales (
            id INTEGER PRIMARY KEY,
            product_name TEXT NOT NULL,
            amount REAL NOT NULL,
            quantity INTEGER NOT NULL,
            sale_date TEXT NOT NULL,
            region TEXT NOT NULL
        )
    """)
    
    # 插入测试数据
    test_data = [
        (1, "iPhone 15", 7999.0, 50, "2024-01-15", "华东"),
        (2, "MacBook Pro", 14999.0, 20, "2024-01-16", "华北"),
        (3, "iPad Air", 4799.0, 80, "2024-01-17", "华南"),
        (4, "AirPods Pro", 1899.0, 150, "2024-01-18", "华东"),
        (5, "Apple Watch", 2999.0, 60, "2024-01-19", "西南"),
        (6, "iPhone 15", 7999.0, 45, "2024-02-01", "华北"),
        (7, "MacBook Pro", 14999.0, 15, "2024-02-05", "华东"),
        (8, "iPad Air", 4799.0, 70, "2024-02-10", "华南"),
    ]
    cursor.executemany("INSERT INTO sales VALUES (?, ?, ?, ?, ?, ?)", test_data)
    conn.commit()
    
    return conn


def get_database_schema(conn: sqlite3.Connection) -> str:
    """获取数据库 Schema"""
    cursor = conn.cursor()
    
    # 获取所有表
    cursor.execute("SELECT name FROM sqlite_master WHERE type='table'")
    tables = cursor.fetchall()
    
    schema_info = []
    for (table_name,) in tables:
        # 获取表结构
        cursor.execute(f"PRAGMA table_info({table_name})")
        columns = cursor.fetchall()
        
        col_info = []
        for col in columns:
            col_info.append(f"  - {col[1]} ({col[2]})")
        
        schema_info.append(f"表: {table_name}\n" + "\n".join(col_info))
        
        # 获取示例数据
        cursor.execute(f"SELECT * FROM {table_name} LIMIT 2")
        rows = cursor.fetchall()
        if rows:
            sample = json.dumps([dict(zip([c[1] for c in columns], row)) for row in rows], ensure_ascii=False)
            schema_info.append(f"示例数据:\n  {sample}")
    
    return "\n\n".join(schema_info)


def test_text2sql_basic():
    """测试 1: 基础 Text2SQL"""
    print("\n" + "="*60)
    print("【测试 1】基础 Text2SQL - 普通模式")
    print("="*60)
    
    # 设置数据库
    conn = setup_test_database()
    schema = get_database_schema(conn)
    
    print("\n数据库 Schema:")
    print("-" * 40)
    print(schema)
    
    # 构造 Prompt
    system_prompt = """你是一个专业的 SQL 查询专家。根据用户的自然语言问题和数据库结构，生成准确的 SQL 查询语句。

规则：
1. 只返回 SQL 语句，不要解释
2. 使用 SQLite 语法
3. SQL 语句用 ```sql 和 ``` 包裹"""

    user_question = "查询 2024 年 1 月的总销售额"
    
    print(f"\n用户问题: {user_question}")
    
    url = f"{BASE_URL}/chat/completions"
    headers = {
        "Authorization": f"Bearer {DASHSCOPE_API_KEY}",
        "Content-Type": "application/json",
    }
    
    payload = {
        "model": MODEL_NAME,
        "messages": [
            {"role": "system", "content": system_prompt},
            {"role": "user", "content": f"""数据库结构:
{schema}

用户问题: {user_question}

请生成 SQL 查询语句:"""}
        ]
    }
    
    response = httpx.post(url, headers=headers, json=payload, timeout=60)
    result = response.json()
    
    print("\n响应:")
    print(json.dumps(result, indent=2, ensure_ascii=False))
    
    if "choices" in result:
        content = result["choices"][0]["message"]["content"]
        print("\n生成的内容:")
        print(content)
        
        # 执行 SQL 测试
        if "SELECT" in content.upper():
            try:
                import re
                sql_match = re.search(r'```sql\s*(.*?)\s*```', content, re.DOTALL | re.IGNORECASE)
                if sql_match:
                    sql = sql_match.group(1)
                    print(f"\n执行的 SQL: {sql}")
                    cursor = conn.cursor()
                    cursor.execute(sql)
                    rows = cursor.fetchall()
                    print(f"查询结果: {rows}")
            except Exception as e:
                print(f"SQL 执行错误: {e}")
    
    conn.close()
    return result


def test_text2sql_function_call():
    """测试 2: 函数调用模式 Text2SQL"""
    print("\n" + "="*60)
    print("【测试 2】Text2SQL - 函数调用模式")
    print("="*60)
    
    conn = setup_test_database()
    schema = get_database_schema(conn)
    
    url = f"{BASE_URL}/chat/completions"
    headers = {
        "Authorization": f"Bearer {DASHSCOPE_API_KEY}",
        "Content-Type": "application/json",
    }
    
    # 定义工具
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
                            "description": "为什么选择这个 SQL 的原因"
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
3. 提供 SQL 和查询原因"""

    user_question = "统计每个产品的销售总额，按销售额降序排列"
    
    payload = {
        "model": MODEL_NAME,
        "messages": [
            {"role": "system", "content": system_prompt},
            {"role": "user", "content": user_question}
        ],
        "tools": tools,
        "tool_choice": "auto"
    }
    
    print(f"\n用户问题: {user_question}")
    print("\n请求 Payload (Tools):")
    print(json.dumps({"tools": tools}, indent=2, ensure_ascii=False))
    
    response = httpx.post(url, headers=headers, json=payload, timeout=60)
    result = response.json()
    
    print("\n完整响应:")
    print(json.dumps(result, indent=2, ensure_ascii=False))
    
    # 解析 tool_calls
    if "choices" in result:
        message = result["choices"][0].get("message", {})
        tool_calls = message.get("tool_calls", [])
        
        if tool_calls:
            print("\n" + "-" * 40)
            print("解析的 Tool Calls:")
            for tc in tool_calls:
                func = tc.get("function", {})
                print(f"\nFunction: {func.get('name')}")
                print(f"Arguments: {func.get('arguments')}")
                
                # 解析参数
                args = json.loads(func.get("arguments", "{}"))
                sql = args.get("sql", "")
                print(f"\n提取的 SQL: {sql}")
                
                # 执行 SQL
                if sql:
                    try:
                        cursor = conn.cursor()
                        cursor.execute(sql)
                        rows = cursor.fetchall()
                        print(f"查询结果: {rows}")
                    except Exception as e:
                        print(f"SQL 执行错误: {e}")
    
    conn.close()
    return result


def test_text2sql_stream():
    """测试 3: 流式输出 Text2SQL"""
    print("\n" + "="*60)
    print("【测试 3】Text2SQL - 流式输出")
    print("="*60)
    
    conn = setup_test_database()
    schema = get_database_schema(conn)
    
    url = f"{BASE_URL}/chat/completions"
    headers = {
        "Authorization": f"Bearer {DASHSCOPE_API_KEY}",
        "Content-Type": "application/json",
    }
    
    system_prompt = f"""你是一个 SQL 专家。根据用户问题生成 SQL 查询。

数据库结构:
{schema}

输出格式：
1. 首先输出思考过程
2. 然后用 ```sql 和 ``` 包裹 SQL 语句
3. 最后解释查询逻辑"""

    user_question = "查询华东地区销售最好的前3个产品"
    
    payload = {
        "model": MODEL_NAME,
        "messages": [
            {"role": "system", "content": system_prompt},
            {"role": "user", "content": user_question}
        ],
        "stream": True
    }
    
    print(f"\n用户问题: {user_question}")
    print("\n流式响应:")
    print("-" * 40)
    
    full_content = ""
    
    with httpx.stream("POST", url, headers=headers, json=payload, timeout=60) as response:
        for line in response.iter_lines():
            if not line:
                continue
            
            if line.startswith("data:"):
                data_str = line[5:].strip()
                if data_str == "[DONE]":
                    break
                
                try:
                    chunk = json.loads(data_str)
                    if "choices" in chunk and len(chunk["choices"]) > 0:
                        delta = chunk["choices"][0].get("delta", {})
                        content = delta.get("content", "")
                        if content:
                            print(content, end="", flush=True)
                            full_content += content
                except json.JSONDecodeError:
                    pass
    
    print("\n" + "-" * 40)
    print(f"\n完整内容:\n{full_content}")
    
    conn.close()
    return full_content


def test_text2sql_multi_turn():
    """测试 4: 多轮对话 Text2SQL"""
    print("\n" + "="*60)
    print("【测试 4】多轮对话 Text2SQL")
    print("="*60)
    
    conn = setup_test_database()
    schema = get_database_schema(conn)
    
    url = f"{BASE_URL}/chat/completions"
    headers = {
        "Authorization": f"Bearer {DASHSCOPE_API_KEY}",
        "Content-Type": "application/json",
    }
    
    # 定义工具
    tools = [
        {
            "type": "function",
            "function": {
                "name": "execute_sql",
                "description": "执行 SQL 查询",
                "parameters": {
                    "type": "object",
                    "properties": {
                        "sql": {
                            "type": "string",
                            "description": "SQL 查询语句"
                        }
                    },
                    "required": ["sql"]
                }
            }
        },
        {
            "type": "function",
            "function": {
                "name": "get_schema",
                "description": "获取数据库结构信息",
                "parameters": {
                    "type": "object",
                    "properties": {},
                    "required": []
                }
            }
        }
    ]
    
    system_prompt = f"""你是一个数据分析助手。

数据库结构:
{schema}

根据用户问题，执行相应的 SQL 查询并分析结果。"""

    # 第一轮对话
    messages = [
        {"role": "system", "content": system_prompt},
        {"role": "user", "content": "查询总销售额"}
    ]
    
    print("\n第一轮: 查询总销售额")
    print("-" * 40)
    
    payload = {
        "model": MODEL_NAME,
        "messages": messages,
        "tools": tools,
        "tool_choice": "auto"
    }
    
    response = httpx.post(url, headers=headers, json=payload, timeout=60)
    result = response.json()
    
    print("响应:")
    print(json.dumps(result, indent=2, ensure_ascii=False))
    
    # 模拟返回工具结果
    if "choices" in result:
        message = result["choices"][0].get("message", {})
        tool_calls = message.get("tool_calls", [])
        
        if tool_calls:
            messages.append(message)
            
            for tc in tool_calls:
                func = tc.get("function", {})
                args = json.loads(func.get("arguments", "{}"))
                sql = args.get("sql", "")
                
                # 执行 SQL
                if sql:
                    cursor = conn.cursor()
                    cursor.execute(sql)
                    rows = cursor.fetchall()
                    result_text = json.dumps(rows, ensure_ascii=False)
                    
                    # 添加工具结果
                    messages.append({
                        "role": "tool",
                        "tool_call_id": tc.get("id"),
                        "content": result_text
                    })
                    
                    print(f"\nSQL 执行结果: {result_text}")
    
    # 第二轮对话
    print("\n" + "-" * 40)
    print("第二轮: 按地区分组统计")
    
    messages.append({"role": "user", "content": "按地区分组，统计每个地区的销售额"})
    
    payload["messages"] = messages
    
    response = httpx.post(url, headers=headers, json=payload, timeout=60)
    result = response.json()
    
    print("响应:")
    print(json.dumps(result, indent=2, ensure_ascii=False))
    
    conn.close()
    return result


if __name__ == "__main__":
    if not DASHSCOPE_API_KEY:
        print("请设置环境变量 DASHSCOPE_API_KEY 后再运行测试（例如：export DASHSCOPE_API_KEY=your_key）")
        exit(0)
    print("\n" + "="*60)
    print("NL2SQL 组件测试")
    print(f"模型: {MODEL_NAME}")
    print("="*60)
    
    try:
        # 测试 1: 基础 Text2SQL
        test_text2sql_basic()
        
        # 测试 2: 函数调用模式
        test_text2sql_function_call()
        
        # 测试 3: 流式输出
        test_text2sql_stream()
        
        # 测试 4: 多轮对话
        test_text2sql_multi_turn()
        
    except Exception as e:
        print(f"\n错误: {e}")
        import traceback
        traceback.print_exc()
    
    print("\n" + "="*60)
    print("测试完成")
    print("="*60)
