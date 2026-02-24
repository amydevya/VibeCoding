import { useChatStore } from '@/stores/chatStore'
import { useState } from 'react'

export function ChatArea() {
  const { messages, isLoading, sqlPreview, addMessage } = useChatStore()
  const [input, setInput] = useState('')

  const handleSend = () => {
    if (!input.trim()) return
    
    // 添加用户消息
    addMessage({
      id: Date.now().toString(),
      session_id: 'temp',
      role: 'user',
      content: input,
      created_at: new Date().toISOString(),
    })
    
    setInput('')
  }

  return (
    <div className="flex flex-col h-full">
      {/* 头部 */}
      <div className="px-6 py-4 border-b border-slate-200 bg-white">
        <h2 className="text-lg font-semibold text-slate-800">问答区域</h2>
        <p className="text-sm text-slate-500">使用自然语言查询数据</p>
      </div>
      
      {/* 消息列表 */}
      <div className="flex-1 overflow-y-auto p-6 space-y-4">
        {messages.length === 0 ? (
          <div className="text-center text-slate-400 py-12">
            <div className="text-4xl mb-4">💬</div>
            <p>开始对话，输入您的数据查询需求</p>
            <p className="text-sm mt-2">例如：查询上月销售额</p>
          </div>
        ) : (
          messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`
                  max-w-[80%] px-4 py-2 rounded-lg
                  ${msg.role === 'user' 
                    ? 'bg-primary-600 text-white' 
                    : 'bg-white border border-slate-200 text-slate-700'}
                `}
              >
                {msg.content}
              </div>
            </div>
          ))
        )}
        
        {/* SQL 预览 */}
        {sqlPreview && (
          <div className="bg-slate-800 rounded-lg p-4 text-sm font-mono text-green-400">
            <div className="text-slate-400 text-xs mb-2">SQL 查询</div>
            <pre className="whitespace-pre-wrap">{sqlPreview}</pre>
          </div>
        )}
        
        {isLoading && (
          <div className="flex justify-start">
            <div className="bg-white border border-slate-200 px-4 py-2 rounded-lg">
              <span className="animate-pulse">思考中...</span>
            </div>
          </div>
        )}
      </div>
      
      {/* 输入区域 */}
      <div className="p-4 border-t border-slate-200 bg-white">
        <div className="flex gap-3">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            placeholder="输入您的查询..."
            className="flex-1 px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
          />
          <button
            onClick={handleSend}
            disabled={isLoading || !input.trim()}
            className="px-6 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            发送
          </button>
        </div>
      </div>
    </div>
  )
}
