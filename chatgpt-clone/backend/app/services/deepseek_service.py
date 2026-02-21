from typing import AsyncGenerator, Optional, List, Dict, Any
from openai import AsyncOpenAI
from app.config import get_settings

settings = get_settings()


class DeepSeekService:
    def __init__(self):
        self.client = AsyncOpenAI(
            api_key=settings.deepseek_api_key,
            base_url=settings.deepseek_base_url
        )
        self.model = settings.default_model

    async def stream_chat(
        self,
        messages: List[Dict[str, Any]],
        thinking_enabled: bool = False
    ) -> AsyncGenerator[Dict[str, Any], None]:
        """
        DeepSeek 统一流式调用接口
        
        Args:
            messages: 消息历史列表
            thinking_enabled: 是否开启思考模式
            
        Yields:
            dict: 流式响应数据
                - {"type": "reasoning", "content": "..."} 思考过程
                - {"type": "content", "content": "..."} 最终回答
                - {"type": "done"} 完成标记
                - {"type": "error", "message": "..."} 错误信息
        """
        try:
            extra_body = {}
            if thinking_enabled:
                extra_body["thinking"] = {"type": "enabled"}

            response = await self.client.chat.completions.create(
                model=self.model,
                messages=messages,
                stream=True,
                extra_body=extra_body if extra_body else None
            )

            async for chunk in response:
                if not chunk.choices:
                    continue
                    
                delta = chunk.choices[0].delta
                finish_reason = chunk.choices[0].finish_reason

                # 思考过程（思维链）
                if hasattr(delta, 'reasoning_content') and delta.reasoning_content:
                    yield {"type": "reasoning", "content": delta.reasoning_content}
                
                # 最终答案
                if hasattr(delta, 'content') and delta.content:
                    yield {"type": "content", "content": delta.content}

                # 完成标记
                if finish_reason == "stop":
                    yield {"type": "done"}

        except Exception as e:
            yield {"type": "error", "message": str(e)}


_deepseek_service: Optional[DeepSeekService] = None


def get_deepseek_service() -> DeepSeekService:
    global _deepseek_service
    if _deepseek_service is None:
        _deepseek_service = DeepSeekService()
    return _deepseek_service
