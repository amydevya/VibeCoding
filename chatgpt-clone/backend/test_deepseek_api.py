"""
DeepSeek API 测试脚本
用于测试 deepseek-chat 模型的流式输出和思考模式
"""

from openai import OpenAI
import json

# API 配置
DEEPSEEK_API_KEY = "sk-b7aba3392d3b49e18c8ae56797a59007"
DEEPSEEK_BASE_URL = "https://api.deepseek.com"

client = OpenAI(api_key=DEEPSEEK_API_KEY, base_url=DEEPSEEK_BASE_URL)


def test_stream_with_thinking():
    """测试 deepseek-chat 模型的流式输出 + 思考模式"""
    print("=" * 60)
    print("测试 1: deepseek-chat + thinking 参数开启思考模式")
    print("=" * 60)
    
    messages = [{"role": "user", "content": "9.11 and 9.8, which is greater?"}]
    
    print(f"\n请求参数:")
    print(f"  model: deepseek-chat")
    print(f"  messages: {messages}")
    print(f"  stream: True")
    print(f"  extra_body: {{'thinking': {{'type': 'enabled'}}}}")
    
    response = client.chat.completions.create(
        model="deepseek-chat",
        messages=messages,
        stream=True,
        extra_body={"thinking": {"type": "enabled"}}
    )
    
    reasoning_content = ""
    content = ""
    chunk_count = 0
    
    print(f"\n流式响应 chunks:")
    print("-" * 40)
    
    for chunk in response:
        chunk_count += 1
        delta = chunk.choices[0].delta
        
        # 打印前几个 chunk 的详细结构
        if chunk_count <= 5:
            print(f"\nChunk {chunk_count}:")
            print(f"  chunk.id: {chunk.id}")
            print(f"  chunk.model: {chunk.model}")
            print(f"  chunk.choices[0].index: {chunk.choices[0].index}")
            print(f"  chunk.choices[0].delta: {delta}")
            print(f"  chunk.choices[0].finish_reason: {chunk.choices[0].finish_reason}")
            
            # 检查 delta 的所有属性
            print(f"  delta 属性:")
            print(f"    - role: {getattr(delta, 'role', None)}")
            print(f"    - content: {getattr(delta, 'content', None)}")
            print(f"    - reasoning_content: {getattr(delta, 'reasoning_content', None)}")
        
        # 收集内容
        if hasattr(delta, 'reasoning_content') and delta.reasoning_content:
            reasoning_content += delta.reasoning_content
        if hasattr(delta, 'content') and delta.content:
            content += delta.content
    
    print(f"\n" + "-" * 40)
    print(f"总共收到 {chunk_count} 个 chunks")
    
    print(f"\n思考过程 (reasoning_content):")
    print("-" * 40)
    print(reasoning_content[:500] + "..." if len(reasoning_content) > 500 else reasoning_content)
    print(f"\n[总长度: {len(reasoning_content)} 字符]")
    
    print(f"\n最终回答 (content):")
    print("-" * 40)
    print(content)
    print(f"\n[总长度: {len(content)} 字符]")
    
    return reasoning_content, content


def test_stream_without_thinking():
    """测试 deepseek-chat 模型的流式输出 (不开启思考模式)"""
    print("\n" + "=" * 60)
    print("测试 2: deepseek-chat 普通模式 (不开启思考)")
    print("=" * 60)
    
    messages = [{"role": "user", "content": "9.11 and 9.8, which is greater?"}]
    
    print(f"\n请求参数:")
    print(f"  model: deepseek-chat")
    print(f"  messages: {messages}")
    print(f"  stream: True")
    print(f"  (无 extra_body)")
    
    response = client.chat.completions.create(
        model="deepseek-chat",
        messages=messages,
        stream=True
    )
    
    content = ""
    chunk_count = 0
    
    print(f"\n流式响应 chunks:")
    print("-" * 40)
    
    for chunk in response:
        chunk_count += 1
        delta = chunk.choices[0].delta
        
        # 打印前几个 chunk 的详细结构
        if chunk_count <= 3:
            print(f"\nChunk {chunk_count}:")
            print(f"  delta.role: {getattr(delta, 'role', None)}")
            print(f"  delta.content: {getattr(delta, 'content', None)}")
            print(f"  delta.reasoning_content: {getattr(delta, 'reasoning_content', None)}")
        
        if hasattr(delta, 'content') and delta.content:
            content += delta.content
    
    print(f"\n" + "-" * 40)
    print(f"总共收到 {chunk_count} 个 chunks")
    
    print(f"\n回答 (content):")
    print("-" * 40)
    print(content)
    
    return content


def test_multi_turn_conversation():
    """测试多轮对话"""
    print("\n" + "=" * 60)
    print("测试 3: 多轮对话 + 思考模式")
    print("=" * 60)
    
    # Turn 1
    messages = [{"role": "user", "content": "What is 2+2?"}]
    
    print(f"\nTurn 1 - 用户: {messages[0]['content']}")
    
    response = client.chat.completions.create(
        model="deepseek-chat",
        messages=messages,
        stream=True,
        extra_body={"thinking": {"type": "enabled"}}
    )
    
    reasoning_content_1 = ""
    content_1 = ""
    
    for chunk in response:
        delta = chunk.choices[0].delta
        if hasattr(delta, 'reasoning_content') and delta.reasoning_content:
            reasoning_content_1 += delta.reasoning_content
        if hasattr(delta, 'content') and delta.content:
            content_1 += delta.content
    
    print(f"Turn 1 - AI 思考: {reasoning_content_1[:100]}..." if len(reasoning_content_1) > 100 else f"Turn 1 - AI 思考: {reasoning_content_1}")
    print(f"Turn 1 - AI 回答: {content_1}")
    
    # Turn 2 - 注意：多轮对话时，assistant 消息只包含 content，不包含 reasoning_content
    messages.append({"role": "assistant", "content": content_1})
    messages.append({"role": "user", "content": "Now multiply that by 3"})
    
    print(f"\nTurn 2 - 用户: {messages[-1]['content']}")
    print(f"消息历史: {json.dumps(messages, ensure_ascii=False, indent=2)}")
    
    response = client.chat.completions.create(
        model="deepseek-chat",
        messages=messages,
        stream=True,
        extra_body={"thinking": {"type": "enabled"}}
    )
    
    reasoning_content_2 = ""
    content_2 = ""
    
    for chunk in response:
        delta = chunk.choices[0].delta
        if hasattr(delta, 'reasoning_content') and delta.reasoning_content:
            reasoning_content_2 += delta.reasoning_content
        if hasattr(delta, 'content') and delta.content:
            content_2 += delta.content
    
    print(f"Turn 2 - AI 思考: {reasoning_content_2[:100]}..." if len(reasoning_content_2) > 100 else f"Turn 2 - AI 思考: {reasoning_content_2}")
    print(f"Turn 2 - AI 回答: {content_2}")


def test_chunk_structure():
    """详细分析单个 chunk 的数据结构"""
    print("\n" + "=" * 60)
    print("测试 4: 详细分析 chunk 数据结构")
    print("=" * 60)
    
    messages = [{"role": "user", "content": "Say hello"}]
    
    response = client.chat.completions.create(
        model="deepseek-chat",
        messages=messages,
        stream=True,
        extra_body={"thinking": {"type": "enabled"}}
    )
    
    first_reasoning_chunk = None
    first_content_chunk = None
    last_chunk = None
    
    for chunk in response:
        delta = chunk.choices[0].delta
        
        if first_reasoning_chunk is None and hasattr(delta, 'reasoning_content') and delta.reasoning_content:
            first_reasoning_chunk = chunk
        
        if first_content_chunk is None and hasattr(delta, 'content') and delta.content:
            first_content_chunk = chunk
        
        last_chunk = chunk
    
    print("\n第一个包含 reasoning_content 的 chunk:")
    print("-" * 40)
    if first_reasoning_chunk:
        print(f"  id: {first_reasoning_chunk.id}")
        print(f"  model: {first_reasoning_chunk.model}")
        print(f"  created: {first_reasoning_chunk.created}")
        print(f"  object: {first_reasoning_chunk.object}")
        print(f"  choices[0].index: {first_reasoning_chunk.choices[0].index}")
        print(f"  choices[0].delta.role: {getattr(first_reasoning_chunk.choices[0].delta, 'role', None)}")
        print(f"  choices[0].delta.content: {getattr(first_reasoning_chunk.choices[0].delta, 'content', None)}")
        print(f"  choices[0].delta.reasoning_content: {getattr(first_reasoning_chunk.choices[0].delta, 'reasoning_content', None)}")
        print(f"  choices[0].finish_reason: {first_reasoning_chunk.choices[0].finish_reason}")
    else:
        print("  (无)")
    
    print("\n第一个包含 content 的 chunk:")
    print("-" * 40)
    if first_content_chunk:
        print(f"  id: {first_content_chunk.id}")
        print(f"  choices[0].delta.role: {getattr(first_content_chunk.choices[0].delta, 'role', None)}")
        print(f"  choices[0].delta.content: {getattr(first_content_chunk.choices[0].delta, 'content', None)}")
        print(f"  choices[0].delta.reasoning_content: {getattr(first_content_chunk.choices[0].delta, 'reasoning_content', None)}")
        print(f"  choices[0].finish_reason: {first_content_chunk.choices[0].finish_reason}")
    else:
        print("  (无)")
    
    print("\n最后一个 chunk (finish_reason):")
    print("-" * 40)
    if last_chunk:
        print(f"  id: {last_chunk.id}")
        print(f"  choices[0].delta.content: {getattr(last_chunk.choices[0].delta, 'content', None)}")
        print(f"  choices[0].delta.reasoning_content: {getattr(last_chunk.choices[0].delta, 'reasoning_content', None)}")
        print(f"  choices[0].finish_reason: {last_chunk.choices[0].finish_reason}")


if __name__ == "__main__":
    print("DeepSeek API 测试")
    print("使用模型: deepseek-chat")
    print("API Base URL:", DEEPSEEK_BASE_URL)
    print()
    
    try:
        # 测试 1: 流式输出 + 思考模式
        test_stream_with_thinking()
        
        # 测试 2: 流式输出 (无思考模式)
        test_stream_without_thinking()
        
        # 测试 3: 多轮对话
        test_multi_turn_conversation()
        
        # 测试 4: chunk 结构分析
        test_chunk_structure()
        
        print("\n" + "=" * 60)
        print("所有测试完成!")
        print("=" * 60)
        
    except Exception as e:
        print(f"\n错误: {e}")
        import traceback
        traceback.print_exc()
