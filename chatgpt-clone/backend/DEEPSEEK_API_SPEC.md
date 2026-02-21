# DeepSeek API 接口规范文档

基于实际测试结果整理，用于前后端接口对接。

## 1. API 配置

```python
DEEPSEEK_API_KEY = "sk-xxx"
DEEPSEEK_BASE_URL = "https://api.deepseek.com"
```

## 2. 请求参数

### 2.1 思考模式 (Thinking Mode)

```python
from openai import OpenAI

client = OpenAI(api_key=DEEPSEEK_API_KEY, base_url=DEEPSEEK_BASE_URL)

response = client.chat.completions.create(
    model="deepseek-chat",
    messages=[{"role": "user", "content": "..."}],
    stream=True,
    extra_body={"thinking": {"type": "enabled"}}  # 开启思考模式
)
```

### 2.2 普通模式 (非思考模式)

```python
response = client.chat.completions.create(
    model="deepseek-chat",
    messages=[{"role": "user", "content": "..."}],
    stream=True
    # 不传 extra_body 即为普通模式
)
```

## 3. 流式响应 Chunk 结构

### 3.1 Chunk 对象属性

| 字段 | 类型 | 说明 |
|-----|------|------|
| `id` | string | 请求唯一标识，同一请求的所有 chunk 共享相同 id |
| `model` | string | 返回 `deepseek-reasoner`（即使请求的是 `deepseek-chat` + thinking）|
| `object` | string | 固定为 `chat.completion.chunk` |
| `created` | int | Unix 时间戳 |
| `choices` | array | 选择数组，通常只有一个元素 |

### 3.2 Choice 对象属性

| 字段 | 类型 | 说明 |
|-----|------|------|
| `index` | int | 选择索引，通常为 0 |
| `delta` | object | 增量内容对象 |
| `finish_reason` | string \| null | 结束原因：`null`（进行中）或 `stop`（完成）|

### 3.3 Delta 对象属性 (关键!)

| 字段 | 类型 | 说明 |
|-----|------|------|
| `role` | string \| null | 第一个 chunk 为 `assistant`，后续为 `null` |
| `content` | string \| null | 最终回答内容（思考结束后才出现）|
| `reasoning_content` | string \| null | **思考过程内容**（仅思考模式有此字段）|
| `function_call` | null | 函数调用（本项目不使用）|
| `tool_calls` | null | 工具调用（本项目不使用）|

## 4. 流式输出顺序

### 4.1 思考模式输出顺序

```
[Chunk 1] role="assistant", reasoning_content="", content=None
[Chunk 2] role=None, reasoning_content="思考", content=None
[Chunk 3] role=None, reasoning_content="过程", content=None
...
[Chunk N] role=None, reasoning_content="结束", content=None
[Chunk N+1] role=None, reasoning_content=None, content="最终"
[Chunk N+2] role=None, reasoning_content=None, content="回答"
...
[Last Chunk] finish_reason="stop"
```

**关键发现：**
- 先输出所有 `reasoning_content`（思考过程）
- 然后输出 `content`（最终回答）
- 两者不会同时出现在同一个 chunk 中

### 4.2 普通模式输出顺序

```
[Chunk 1] role="assistant", content="", reasoning_content=None
[Chunk 2] role=None, content="回答", reasoning_content=None
[Chunk 3] role=None, content="内容", reasoning_content=None
...
[Last Chunk] finish_reason="stop"
```

**关键发现：**
- `reasoning_content` 始终为 `None`
- 直接输出 `content`

## 5. 多轮对话格式

```python
messages = [
    {"role": "user", "content": "第一个问题"},
    {"role": "assistant", "content": "第一个回答"},  # 只包含 content，不包含 reasoning_content
    {"role": "user", "content": "第二个问题"}
]
```

**重要：** `assistant` 消息只包含 `content`，不要包含 `reasoning_content`。

## 6. 前端对接建议

### 6.1 SSE 数据格式设计

建议后端将 DeepSeek 的流式响应转换为以下 SSE 格式：

```typescript
// SSE 事件类型
type SSEEventType = 'reasoning' | 'content' | 'done' | 'error';

// reasoning 事件 - 思考过程
data: {"type": "reasoning", "content": "思考内容片段"}

// content 事件 - 最终回答
data: {"type": "content", "content": "回答内容片段"}

// done 事件 - 完成
data: {"type": "done"}

// error 事件 - 错误
data: {"type": "error", "message": "错误信息"}
```

### 6.2 前端处理逻辑

```typescript
interface StreamChunk {
  type: 'reasoning' | 'content' | 'done' | 'error';
  content?: string;
  message?: string;
}

// 状态
let reasoningContent = '';
let content = '';
let isReasoning = true;

// 处理 SSE 事件
eventSource.onmessage = (event) => {
  const chunk: StreamChunk = JSON.parse(event.data);
  
  switch (chunk.type) {
    case 'reasoning':
      reasoningContent += chunk.content;
      // 更新 UI 显示思考过程
      break;
    case 'content':
      isReasoning = false;
      content += chunk.content;
      // 更新 UI 显示最终回答
      break;
    case 'done':
      // 完成，保存消息
      break;
    case 'error':
      // 显示错误
      break;
  }
};
```

## 7. 测试数据示例

### 7.1 思考模式响应

**问题：** "9.11 and 9.8, which is greater?"

**思考过程 (reasoning_content):**
```
We are asked: "9.11 and 9.8, which is greater?" This is a comparison of two decimal numbers: 9.11 and 9.8. We need to determine which is greater.

To compare decimals, we can align the decimal points and compare digit by digit from left to right. Both numbers have the same whole number part: 9. So we compare the tenths digit. For 9.11, the tenths digit is 1. For 9.8, the tenths digit is 8. Since 8 > 1, we can conclude that 9.8 > 9.11.
```

**最终回答 (content):**
```
9.8 is greater than 9.11 because when comparing decimals, 9.8 (or 9.80) has a larger tenths digit (8) than 9.11 (which has a tenths digit of 1).
```

### 7.2 统计数据

| 模式 | 问题 | Chunk 数量 | reasoning_content 长度 | content 长度 |
|-----|------|-----------|----------------------|-------------|
| 思考模式 | "9.11 and 9.8, which is greater?" | 244 | 592 字符 | 144 字符 |
| 普通模式 | "9.11 and 9.8, which is greater?" | 149 | 0 | 较长（含格式）|

## 8. 注意事项

1. **model 字段返回值**：即使请求时使用 `model="deepseek-chat"` + `extra_body={"thinking": {"type": "enabled"}}`，返回的 chunk 中 `model` 字段值为 `deepseek-reasoner`

2. **空字符串处理**：第一个 chunk 的 `reasoning_content` 可能是空字符串 `""`，需要判断 `if chunk.reasoning_content`

3. **None 值处理**：普通模式下 `reasoning_content` 为 `None`，需要使用 `hasattr()` 或 `getattr()` 安全访问

4. **finish_reason**：最后一个 chunk 的 `finish_reason` 为 `"stop"`，可用于判断流式输出结束
