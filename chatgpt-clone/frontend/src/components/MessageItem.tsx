import { User, Sparkles } from 'lucide-react';
import type { Message } from '../types';
import { ThinkingBlock } from './ThinkingBlock';
import { MarkdownRenderer } from './MarkdownRenderer';

interface MessageItemProps {
  message: Message;
  isStreaming?: boolean;
  streamingContent?: {
    content: string;
    reasoningContent: string;
  };
}

export function MessageItem({ message, isStreaming, streamingContent }: MessageItemProps) {
  const isUser = message.role === 'user';
  const content = isStreaming ? streamingContent?.content || '' : message.content;
  const reasoningContent = isStreaming
    ? streamingContent?.reasoningContent || ''
    : message.reasoningContent;

  return (
    <div className={`px-4 py-5 ${isUser ? 'bg-white' : 'bg-slate-50/80'}`}>
      <div className="max-w-3xl mx-auto flex gap-4">
        {/* Avatar */}
        <div
          className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 shadow-sm ${
            isUser 
              ? 'bg-gradient-to-br from-blue-500 to-blue-600' 
              : 'bg-gradient-to-br from-emerald-500 to-teal-600'
          }`}
        >
          {isUser ? (
            <User className="w-5 h-5 text-white" />
          ) : (
            <Sparkles className="w-5 h-5 text-white" />
          )}
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0 pt-0.5">
          <div className="font-semibold text-sm text-slate-700 mb-2">
            {isUser ? '你' : 'DeepSeek'}
          </div>

          {/* Thinking Block (for assistant messages) */}
          {!isUser && reasoningContent && (
            <ThinkingBlock
              content={reasoningContent}
              isStreaming={isStreaming && !content}
            />
          )}

          {/* Message Content */}
          {isUser ? (
            // User messages: plain text
            <div className="text-slate-700 whitespace-pre-wrap leading-7 text-[15px]">
              {content}
            </div>
          ) : (
            // Assistant messages: Markdown rendered
            <>
              {content ? (
                <MarkdownRenderer content={content} isStreaming={isStreaming} />
              ) : (
                isStreaming && !reasoningContent && (
                  <span className="inline-flex items-center gap-1 text-slate-400">
                    <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                    <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                    <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                  </span>
                )
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
