import { useState } from 'react';
import { Brain, ChevronRight, Loader2 } from 'lucide-react';

interface ThinkingBlockProps {
  content: string;
  isStreaming?: boolean;
}

export function ThinkingBlock({ content, isStreaming }: ThinkingBlockProps) {
  const [isExpanded, setIsExpanded] = useState(true);

  if (!content) return null;

  return (
    <div className="bg-gradient-to-r from-purple-50 to-violet-50 border border-purple-200/60 rounded-xl mb-4 overflow-hidden shadow-sm">
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full flex items-center gap-2.5 px-4 py-3 text-sm hover:bg-purple-100/50 transition-colors"
      >
        <div className="p-1.5 bg-purple-100 rounded-lg">
          <Brain className="w-3.5 h-3.5 text-purple-600" />
        </div>
        <span className="font-semibold text-purple-700">思考过程</span>
        {isStreaming && (
          <span className="flex items-center gap-1.5 text-xs text-purple-500">
            <Loader2 className="w-3 h-3 animate-spin" />
            <span>思考中...</span>
          </span>
        )}
        <ChevronRight
          className={`w-4 h-4 ml-auto text-purple-400 transition-transform duration-200 ${
            isExpanded ? 'rotate-90' : ''
          }`}
        />
      </button>
      <div className={`overflow-hidden transition-all duration-300 ${isExpanded ? 'max-h-[500px] opacity-100' : 'max-h-0 opacity-0'}`}>
        <div className="px-4 pb-4 text-sm text-purple-700/80 whitespace-pre-wrap leading-relaxed border-t border-purple-100/80">
          <div className="pt-3 font-mono text-[13px]">{content}</div>
        </div>
      </div>
    </div>
  );
}
