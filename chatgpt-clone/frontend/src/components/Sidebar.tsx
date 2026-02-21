import { Plus, MessageSquare, Trash2, Brain, PanelLeftClose, Sparkles, X } from 'lucide-react';
import { useChatStore } from '../store/chatStore';

interface SidebarProps {
  collapsed: boolean;
  onToggle: () => void;
}

export function Sidebar({ collapsed, onToggle }: SidebarProps) {
  const {
    conversations,
    currentConversationId,
    setCurrentConversation,
    createConversation,
    deleteConversation,
  } = useChatStore();

  const handleConversationClick = (id: string) => {
    setCurrentConversation(id);
    if (window.innerWidth < 768) {
      onToggle();
    }
  };

  return (
    <>
      {/* Mobile overlay */}
      {!collapsed && (
        <div
          className="fixed inset-0 bg-black/50 z-40 md:hidden"
          onClick={onToggle}
        />
      )}

      {/* Sidebar */}
      <div
        className={`fixed md:relative z-50 h-screen bg-slate-900 text-white flex flex-col transition-all duration-300 ease-in-out ${
          collapsed 
            ? 'w-0 -translate-x-full md:translate-x-0 opacity-0 overflow-hidden' 
            : 'w-72 translate-x-0 opacity-100'
        }`}
      >
        {/* Header */}
        <div className="p-4 border-b border-slate-700/50">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <div className="p-1.5 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg">
                <Sparkles className="w-4 h-4 text-white" />
              </div>
              <span className="font-semibold text-sm tracking-tight">DeepSeek Chat</span>
            </div>
            <button
              onClick={onToggle}
              className="p-1.5 hover:bg-slate-700/50 rounded-lg transition-colors"
              title="收起侧边栏"
            >
              <X className="w-4 h-4 text-slate-400 md:hidden" />
              <PanelLeftClose className="w-4 h-4 text-slate-400 hidden md:block" />
            </button>
          </div>
          <button
            onClick={createConversation}
            className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-slate-700/50 hover:bg-slate-700 border border-slate-600/50 rounded-xl transition-all duration-200 group"
          >
            <Plus className="w-4 h-4 text-slate-300 group-hover:text-white transition-colors" />
            <span className="text-sm font-medium text-slate-200 group-hover:text-white transition-colors">新建对话</span>
          </button>
        </div>

        {/* Conversation List */}
        <div className="flex-1 overflow-y-auto p-3 space-y-1">
          {conversations.length === 0 ? (
            <div className="text-center mt-12 px-4">
              <div className="inline-flex p-4 bg-slate-800/50 rounded-2xl mb-4">
                <MessageSquare className="w-8 h-8 text-slate-500" />
              </div>
              <p className="text-sm text-slate-400 font-medium">暂无对话</p>
              <p className="text-xs text-slate-500 mt-1.5 leading-relaxed">
                点击上方按钮<br />开始你的第一次对话
              </p>
            </div>
          ) : (
            <>
              <div className="px-2 py-1.5">
                <span className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider">历史对话</span>
              </div>
              {conversations.map((conversation) => (
                <div
                  key={conversation.id}
                  className={`group flex items-center gap-3 px-3 py-2.5 rounded-xl cursor-pointer transition-all duration-200 ${
                    currentConversationId === conversation.id
                      ? 'bg-slate-700/70 shadow-sm'
                      : 'hover:bg-slate-800/50'
                  }`}
                  onClick={() => handleConversationClick(conversation.id)}
                >
                  <div className={`p-1.5 rounded-lg ${
                    conversation.thinkingEnabled 
                      ? 'bg-purple-500/20' 
                      : 'bg-slate-700/50'
                  }`}>
                    {conversation.thinkingEnabled ? (
                      <Brain className="w-3.5 h-3.5 text-purple-400" />
                    ) : (
                      <MessageSquare className="w-3.5 h-3.5 text-slate-400" />
                    )}
                  </div>
                  <span className="flex-1 truncate text-sm text-slate-200 font-medium">
                    {conversation.title}
                  </span>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      deleteConversation(conversation.id);
                    }}
                    className="opacity-0 group-hover:opacity-100 p-1.5 hover:bg-slate-600/50 rounded-lg transition-all duration-200"
                  >
                    <Trash2 className="w-3.5 h-3.5 text-slate-500 hover:text-red-400 transition-colors" />
                  </button>
                </div>
              ))}
            </>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-700/50">
          <div className="flex items-center justify-center gap-2 text-[11px] text-slate-500">
            <span>Powered by DeepSeek</span>
            <span className="text-slate-600">•</span>
            <span>v1.0</span>
          </div>
        </div>
      </div>
    </>
  );
}
