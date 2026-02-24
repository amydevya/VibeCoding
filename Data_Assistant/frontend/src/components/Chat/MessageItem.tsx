import { Message } from '@/types'

interface MessageItemProps {
  message: Message
  onClick?: (message: Message) => void
}

export function MessageItem({ message, onClick }: MessageItemProps) {
  const isUser = message.role === 'user'
  const hasData = !isUser && (message.sql || message.data || message.chart)

  return (
    <div className={`flex ${isUser ? 'justify-end' : 'justify-start'} mb-4`}>
      <div className={`flex items-start gap-3 max-w-[85%] ${isUser ? 'flex-row-reverse' : ''}`}>
        {/* 头像 */}
        <div
          className={`
            w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0
            ${isUser ? 'bg-primary-600 text-white' : 'bg-slate-200 text-slate-600'}
          `}
        >
          {isUser ? (
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
            </svg>
          ) : (
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17.93c-3.95-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.39z" />
            </svg>
          )}
        </div>

        {/* 消息内容 */}
        <div
          onClick={() => hasData && onClick?.(message)}
          className={`
            px-4 py-3 rounded-2xl
            ${isUser 
              ? 'bg-primary-600 text-white rounded-tr-md' 
              : 'bg-white border border-slate-200 text-slate-700 rounded-tl-md shadow-sm'}
            ${hasData ? 'cursor-pointer hover:shadow-md hover:border-primary-300 transition-all' : ''}
          `}
        >
          <p className="text-sm leading-relaxed whitespace-pre-wrap">{message.content}</p>
          {hasData && (
            <div className="mt-2 pt-2 border-t border-slate-100 text-xs text-slate-400 flex items-center gap-2">
              <span>点击查看详细数据</span>
              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
