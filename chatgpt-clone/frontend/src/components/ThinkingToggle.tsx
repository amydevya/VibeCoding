import { Brain } from 'lucide-react';

interface ThinkingToggleProps {
  enabled: boolean;
  onChange: (enabled: boolean) => void;
}

export function ThinkingToggle({ enabled, onChange }: ThinkingToggleProps) {
  return (
    <button
      onClick={() => onChange(!enabled)}
      className={`group flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium transition-all duration-200 ${
        enabled
          ? 'bg-purple-100 text-purple-700 hover:bg-purple-150'
          : 'bg-slate-100 text-slate-500 hover:bg-slate-200 hover:text-slate-600'
      }`}
    >
      <div className={`relative flex items-center justify-center w-4 h-4 ${enabled ? 'text-purple-500' : 'text-slate-400'}`}>
        <Brain className="w-4 h-4" />
        {enabled && (
          <span className="absolute -top-0.5 -right-0.5 w-1.5 h-1.5 bg-purple-500 rounded-full" />
        )}
      </div>
      <span>深度思考</span>
      <span className={`text-[10px] px-1.5 py-0.5 rounded ${
        enabled ? 'bg-purple-200/60 text-purple-600' : 'bg-slate-200/60 text-slate-400'
      }`}>
        {enabled ? '开' : '关'}
      </span>
    </button>
  );
}
