import { useEffect, useRef } from 'react';
import { Sparkles, ArrowDown } from 'lucide-react';
import { useChatStore } from '../store/chatStore';
import { MessageItem } from './MessageItem';

export function MessageList() {
  const { messages, isLoading, streamingMessage } = useChatStore();
  const bottomRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, streamingMessage]);

  if (messages.length === 0 && !isLoading) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-8 bg-gradient-to-b from-white to-slate-50/50">
        <div className="text-center max-w-md">
          <div className="inline-flex p-4 bg-gradient-to-br from-slate-100 to-slate-200 rounded-2xl mb-5">
            <Sparkles className="w-8 h-8 text-slate-400" />
          </div>
          <h2 className="text-xl font-semibold text-slate-700 mb-2">开始对话</h2>
          <p className="text-slate-500 leading-relaxed">
            在下方输入你的问题，开启与 AI 助手的对话
          </p>
          <div className="mt-6 flex items-center justify-center gap-2 text-slate-400">
            <ArrowDown className="w-4 h-4 animate-bounce" />
            <span className="text-sm">在下方输入消息</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div ref={containerRef} className="flex-1 overflow-y-auto bg-slate-50/30">
      <div className="max-w-3xl mx-auto py-4">
        {messages.map((message) => (
          <MessageItem key={message.id} message={message} />
        ))}
        
        {isLoading && streamingMessage && (
          <MessageItem
            message={{
              id: 'streaming',
              conversationId: '',
              role: 'assistant',
              content: '',
              reasoningContent: null,
              createdAt: new Date().toISOString(),
            }}
            isStreaming={true}
            streamingContent={streamingMessage}
          />
        )}
        
        <div ref={bottomRef} className="h-4" />
      </div>
    </div>
  );
}
