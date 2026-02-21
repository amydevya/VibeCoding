import { useState, useRef, useEffect } from 'react';
import { Send, Loader2 } from 'lucide-react';
import { useChatStore } from '../store/chatStore';
import { ThinkingToggle } from './ThinkingToggle';

export function ChatInput() {
  const [input, setInput] = useState('');
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const { sendMessage, isLoading, thinkingEnabled, setThinkingEnabled } = useChatStore();

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 200)}px`;
    }
  }, [input]);

  const handleSubmit = async () => {
    if (!input.trim() || isLoading) return;
    
    const message = input;
    setInput('');
    await sendMessage(message);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  return (
    <div className="border-t border-slate-200 bg-white p-4 shadow-lg shadow-slate-200/50">
      <div className="max-w-3xl mx-auto">
        {/* Input Container */}
        <div className="bg-slate-50 rounded-2xl border border-slate-200 p-3 focus-within:border-blue-300 focus-within:ring-4 focus-within:ring-blue-50 transition-all">
          {/* Textarea */}
          <textarea
            ref={textareaRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="输入消息，按 Enter 发送..."
            className="w-full px-2 py-1 bg-transparent resize-none focus:outline-none text-slate-700 placeholder:text-slate-400 min-h-[24px] max-h-[200px] text-[15px] leading-relaxed"
            rows={1}
            disabled={isLoading}
          />
          
          {/* Bottom Bar */}
          <div className="flex items-center justify-between mt-2 pt-2 border-t border-slate-200/80">
            {/* Thinking Toggle */}
            <ThinkingToggle enabled={thinkingEnabled} onChange={setThinkingEnabled} />
            
            {/* Send Button */}
            <button
              onClick={handleSubmit}
              disabled={!input.trim() || isLoading}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl font-medium text-sm transition-all duration-200 ${
                input.trim() && !isLoading
                  ? 'bg-slate-900 hover:bg-slate-800 text-white shadow-sm'
                  : 'bg-slate-200 text-slate-400 cursor-not-allowed'
              }`}
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>思考中</span>
                </>
              ) : (
                <>
                  <Send className="w-4 h-4" />
                  <span>发送</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Tips */}
        <div className="mt-3 text-xs text-slate-400 text-center">
          <span className="inline-flex items-center gap-1.5">
            <kbd className="px-1.5 py-0.5 bg-slate-100 rounded text-[10px] font-medium text-slate-500">Enter</kbd>
            <span>发送</span>
            <span className="text-slate-300 mx-1">•</span>
            <kbd className="px-1.5 py-0.5 bg-slate-100 rounded text-[10px] font-medium text-slate-500">Shift + Enter</kbd>
            <span>换行</span>
          </span>
        </div>
      </div>
    </div>
  );
}
