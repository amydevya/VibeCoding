"""
Qwen3 API 测试脚本
测试内容：
1. 基础对话
2. 流式输出
3. 函数调用（Tool Calling）
"""

import os
import httpx
import json

# 配置：从环境变量读取，避免提交敏感信息
DASHSCOPE_API_KEY = os.environ.get("DASHSCOPE_API_KEY", "").strip()
MODEL_NAME = "qwen3-max"
BASE_URL = "https://dashscope.aliyuncs.com/compatible-mode/v1"


def test_basic_chat():
    """测试基础对话"""
    print("\n" + "="*60)
    print("【测试 1】基础对话")
    print("="*60)
    
    url = f"{BASE_URL}/chat/completions"
    headers = {
        "Authorization": f"Bearer {DASHSCOPE_API_KEY}",
        "Content-Type": "application/json",
    }
    
    payload = {
        "model": MODEL_NAME,
        "messages": [
            {"role": "user", "content": "你好，请用一句话介绍你自己"}
        ]
    }
    
    response = httpx.post(url, headers=headers, json=payload, timeout=60)
    
    print(f"\n状态码: {response.status_code}")
    result = response.json()
    
    print("\n完整响应:")
    print(json.dumps(result, indent=2, ensure_ascii=False))
    
    if "choices" in result:
        print("\n提取的内容:")
        print(result["choices"][0]["message"]["content"])
    
    return result


def test_stream_chat():
    """测试流式输出"""
    print("\n" + "="*60)
    print("【测试 2】流式输出")
    print("="*60)
    
    url = f"{BASE_URL}/chat/completions"
    headers = {
        "Authorization": f"Bearer {DASHSCOPE_API_KEY}",
        "Content-Type": "application/json",
    }
    
    payload = {
        "model": MODEL_NAME,
        "messages": [
            {"role": "user", "content": "请写一首关于春天的五言绝句"}
        ],
        "stream": True
    }
    
    print("\n流式响应内容:")
    print("-" * 40)
    
    full_content = ""
    chunk_count = 0
    
    with httpx.stream("POST", url, headers=headers, json=payload, timeout=60) as response:
        print(f"状态码: {response.status_code}")
        print()
        
        for line in response.iter_lines():
            if not line:
                continue
            
            if line.startswith("data:"):
                data_str = line[5:].strip()
                if data_str == "[DONE]":
                    print("\n[流结束]")
                    break
                
                try:
                    chunk = json.loads(data_str)
                    chunk_count += 1
                    
                    # 打印第一个 chunk 的完整结构
                    if chunk_count == 1:
                        print("\n第一个 chunk 完整结构:")
                        print(json.dumps(chunk, indent=2, ensure_ascii=False))
                        print("\n后续内容流:")
                    
                    # 提取内容
                    if "choices" in chunk and len(chunk["choices"]) > 0:
                        delta = chunk["choices"][0].get("delta", {})
                        content = delta.get("content", "")
                        if content:
                            print(content, end="", flush=True)
                            full_content += content
                            
                except json.JSONDecodeError as e:
                    print(f"\nJSON 解析错误: {e}")
    
    print("\n" + "-" * 40)
    print(f"\n完整内容: {full_content}")
    print(f"总共收到 {chunk_count} 个 chunk")


def test_function_call():
    """测试函数调用（Tool Calling）"""
    print("\n" + "="*60)
    print("【测试 3】函数调用 (Tool Calling)")
    print("="*60)
    
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
                "name": "query_sales_data",
                "description": "查询销售数据",
                "parameters": {
                    "type": "object",
                    "properties": {
                        "time_range": {
                            "type": "string",
                            "description": "时间范围，如：上月、本月、最近一周"
                        },
                        "product": {
                            "type": "string",
                            "description": "产品名称，可选"
                        }
                    },
                    "required": ["time_range"]
                }
            }
        },
        {
            "type": "function",
            "function": {
                "name": "get_weather",
                "description": "获取指定城市的天气信息",
                "parameters": {
                    "type": "object",
                    "properties": {
                        "city": {
                            "type": "string",
                            "description": "城市名称"
                        }
                    },
                    "required": ["city"]
                }
            }
        }
    ]
    
    payload = {
        "model": MODEL_NAME,
        "messages": [
            {"role": "user", "content": "请帮我查询上月的销售数据"}
        ],
        "tools": tools,
        "tool_choice": "auto"
    }
    
    print("\n请求 payload:")
    print(json.dumps(payload, indent=2, ensure_ascii=False))
    
    response = httpx.post(url, headers=headers, json=payload, timeout=60)
    
    print(f"\n状态码: {response.status_code}")
    result = response.json()
    
    print("\n完整响应:")
    print(json.dumps(result, indent=2, ensure_ascii=False))
    
    # 分析 tool_calls
    if "choices" in result and len(result["choices"]) > 0:
        message = result["choices"][0].get("message", {})
        tool_calls = message.get("tool_calls", [])
        
        if tool_calls:
            print("\n" + "-" * 40)
            print("解析的 Tool Calls:")
            for i, tc in enumerate(tool_calls):
                print(f"\nTool Call #{i+1}:")
                print(f"  ID: {tc.get('id')}")
                print(f"  Type: {tc.get('type')}")
                function = tc.get("function", {})
                print(f"  Function Name: {function.get('name')}")
                print(f"  Function Arguments: {function.get('arguments')}")
        else:
            print("\n未检测到 tool_calls，消息内容:")
            print(message.get("content"))
    
    return result


def test_stream_function_call():
    """测试流式函数调用"""
    print("\n" + "="*60)
    print("【测试 4】流式函数调用")
    print("="*60)
    
    url = f"{BASE_URL}/chat/completions"
    headers = {
        "Authorization": f"Bearer {DASHSCOPE_API_KEY}",
        "Content-Type": "application/json",
    }
    
    tools = [
        {
            "type": "function",
            "function": {
                "name": "query_sales_data",
                "description": "查询销售数据",
                "parameters": {
                    "type": "object",
                    "properties": {
                        "time_range": {
                            "type": "string",
                            "description": "时间范围"
                        }
                    },
                    "required": ["time_range"]
                }
            }
        }
    ]
    
    payload = {
        "model": MODEL_NAME,
        "messages": [
            {"role": "user", "content": "查询上周的销售总额"}
        ],
        "tools": tools,
        "stream": True
    }
    
    print("\n流式 Tool Call 响应:")
    print("-" * 40)
    
    tool_calls_data = {}
    
    with httpx.stream("POST", url, headers=headers, json=payload, timeout=60) as response:
        print(f"状态码: {response.status_code}\n")
        
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
                        
                        # 处理 tool_calls
                        if "tool_calls" in delta:
                            for tc in delta["tool_calls"]:
                                idx = tc.get("index", 0)
                                if idx not in tool_calls_data:
                                    tool_calls_data[idx] = {
                                        "id": tc.get("id", ""),
                                        "type": tc.get("type", ""),
                                        "function": {"name": "", "arguments": ""}
                                    }
                                
                                if "id" in tc:
                                    tool_calls_data[idx]["id"] = tc["id"]
                                if "type" in tc:
                                    tool_calls_data[idx]["type"] = tc["type"]
                                if "function" in tc:
                                    func = tc["function"]
                                    if "name" in func:
                                        tool_calls_data[idx]["function"]["name"] = func["name"]
                                    if "arguments" in func:
                                        tool_calls_data[idx]["function"]["arguments"] += func["arguments"]
                        
                        # 打印内容
                        if "content" in delta and delta["content"]:
                            print(f"[Content] {delta['content']}")
                            
                except json.JSONDecodeError:
                    pass
    
    print("\n" + "-" * 40)
    print("\n合并后的 Tool Calls:")
    for idx, tc in tool_calls_data.items():
        print(f"\nTool Call #{idx}:")
        print(f"  ID: {tc['id']}")
        print(f"  Type: {tc['type']}")
        print(f"  Function Name: {tc['function']['name']}")
        print(f"  Function Arguments: {tc['function']['arguments']}")


if __name__ == "__main__":
    if not DASHSCOPE_API_KEY:
        print("请设置环境变量 DASHSCOPE_API_KEY 后再运行测试（例如：export DASHSCOPE_API_KEY=your_key）")
        exit(0)
    print("\n" + "="*60)
    print("Qwen3 API 测试")
    print(f"模型: {MODEL_NAME}")
    print("="*60)
    
    try:
        # 测试 1: 基础对话
        test_basic_chat()
        
        # 测试 2: 流式输出
        test_stream_chat()
        
        # 测试 3: 函数调用
        test_function_call()
        
        # 测试 4: 流式函数调用
        test_stream_function_call()
        
    except Exception as e:
        print(f"\n错误: {e}")
        import traceback
        traceback.print_exc()
    
    print("\n" + "="*60)
    print("测试完成")
    print("="*60)
