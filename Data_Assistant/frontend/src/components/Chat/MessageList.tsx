import { Message } from '@/types'
import { MessageItem } from './MessageItem'

interface MessageListProps {
  messages: Message[]
  isLoading?: boolean
  onMessageClick?: (message: Message) => void
}

export function MessageList({ messages, isLoading, onMessageClick }: MessageListProps) {
  if (messages.length === 0 && !isLoading) {
    return (
      <div className="flex-1 flex items-center justify-center p-6">
        <div className="text-center text-slate-400">
          <div className="text-5xl mb-4">💬</div>
          <p className="text-lg font-medium">开始对话</p>
          <p className="text-sm mt-2">使用自然语言查询您的数据</p>
          <div className="mt-4 text-xs text-slate-400">
            <p>例如：</p>
            <ul className="mt-2 space-y-1">
              <li>"查询上月销售额"</li>
              <li>"统计用户增长趋势"</li>
              <li>"分析产品库存情况"</li>
            </ul>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="flex-1 overflow-y-auto p-6">
      {messages.map((message) => (
        <MessageItem key={message.id} message={message} onClick={onMessageClick} />
      ))}
      {isLoading && (
        <div className="flex items-start gap-3 mb-4">
          <div className="w-8 h-8 rounded-full bg-slate-200 text-slate-600 flex items-center justify-center">
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17.93c-3.95-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.39z" />
            </svg>
          </div>
          <div className="bg-white border border-slate-200 px-4 py-3 rounded-2xl rounded-tl-md shadow-sm">
            <div className="flex items-center gap-2">
              <div className="flex gap-1">
                <span className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                <span className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                <span className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
              </div>
              <span className="text-sm text-slate-500">思考中...</span>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
