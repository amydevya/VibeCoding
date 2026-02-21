import { useChatStore } from '../store/chatStore';
import { MessageList } from './MessageList';
import { ChatInput } from './ChatInput';
import { PanelLeft, Sparkles, Zap, Brain, MessageCircle } from 'lucide-react';

interface ChatWindowProps {
  sidebarCollapsed: boolean;
  onToggleSidebar: () => void;
}

export function ChatWindow({ sidebarCollapsed, onToggleSidebar }: ChatWindowProps) {
  const { currentConversationId, conversations, createConversation } = useChatStore();

  const currentConversation = conversations.find(
    (c) => c.id === currentConversationId
  );

  if (!currentConversationId) {
    return (
      <div className="flex-1 flex flex-col bg-gradient-to-b from-white to-slate-50">
        {/* Header */}
        <div className="h-14 border-b border-slate-200/80 flex items-center px-4 bg-white/80 backdrop-blur-sm">
          {sidebarCollapsed && (
            <button
              onClick={onToggleSidebar}
              className="p-2 hover:bg-slate-100 rounded-lg transition-colors mr-2"
              title="展开侧边栏"
            >
              <PanelLeft className="w-5 h-5 text-slate-500" />
            </button>
          )}
        </div>

        {/* Welcome Screen */}
        <div className="flex-1 flex flex-col items-center justify-center p-8">
          <div className="max-w-2xl w-full text-center">
            {/* Logo */}
            <div className="inline-flex p-4 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl shadow-lg shadow-blue-500/25 mb-6">
              <Sparkles className="w-10 h-10 text-white" />
            </div>

            <h1 className="text-3xl font-bold text-slate-800 mb-3">
              欢迎使用 DeepSeek Chat
            </h1>
            <p className="text-slate-500 text-lg mb-10 max-w-md mx-auto leading-relaxed">
              基于 DeepSeek 大模型的智能对话助手，支持深度思考模式
            </p>

            {/* Feature Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-10">
              <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow">
                <div className="inline-flex p-2.5 bg-blue-50 rounded-xl mb-3">
                  <Zap className="w-5 h-5 text-blue-500" />
                </div>
                <h3 className="font-semibold text-slate-700 mb-1.5">快速响应</h3>
                <p className="text-sm text-slate-500 leading-relaxed">
                  流式输出，实时显示 AI 的回复内容
                </p>
              </div>

              <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow">
                <div className="inline-flex p-2.5 bg-purple-50 rounded-xl mb-3">
                  <Brain className="w-5 h-5 text-purple-500" />
                </div>
                <h3 className="font-semibold text-slate-700 mb-1.5">深度思考</h3>
                <p className="text-sm text-slate-500 leading-relaxed">
                  开启思考模式，查看 AI 的推理过程
                </p>
              </div>

              <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow">
                <div className="inline-flex p-2.5 bg-green-50 rounded-xl mb-3">
                  <MessageCircle className="w-5 h-5 text-green-500" />
                </div>
                <h3 className="font-semibold text-slate-700 mb-1.5">多轮对话</h3>
                <p className="text-sm text-slate-500 leading-relaxed">
                  支持上下文记忆，连续对话更自然
                </p>
              </div>
            </div>

            {/* CTA Button */}
            <button
              onClick={createConversation}
              className="inline-flex items-center gap-2 px-6 py-3 bg-slate-900 hover:bg-slate-800 text-white rounded-xl font-medium transition-colors shadow-lg shadow-slate-900/20"
            >
              <Sparkles className="w-4 h-4" />
              <span>开始新对话</span>
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col bg-white">
      {/* Header */}
      <div className="h-14 border-b border-slate-200/80 flex items-center px-4 bg-white/80 backdrop-blur-sm sticky top-0 z-10">
        {sidebarCollapsed && (
          <button
            onClick={onToggleSidebar}
            className="p-2 hover:bg-slate-100 rounded-lg transition-colors mr-2"
            title="展开侧边栏"
          >
            <PanelLeft className="w-5 h-5 text-slate-500" />
          </button>
        )}
        <div className="flex items-center gap-2">
          {currentConversation?.thinkingEnabled && (
            <div className="p-1 bg-purple-100 rounded-md">
              <Brain className="w-3.5 h-3.5 text-purple-600" />
            </div>
          )}
          <h1 className="font-semibold text-slate-800 truncate">
            {currentConversation?.title || '对话'}
          </h1>
        </div>
      </div>

      {/* Messages */}
      <MessageList />

      {/* Input */}
      <ChatInput />
    </div>
  );
}
