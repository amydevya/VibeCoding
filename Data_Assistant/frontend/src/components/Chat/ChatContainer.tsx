import { Message } from '@/types'
import { MessageList } from './MessageList'
import { QueryInput } from './QueryInput'

interface ChatContainerProps {
  messages: Message[]
  isLoading: boolean
  error: string | null
  onSendMessage: (content: string) => void
  onDismissError?: () => void
  onMessageClick?: (message: Message) => void
}

export function ChatContainer({
  messages,
  isLoading,
  error,
  onSendMessage,
  onDismissError,
  onMessageClick,
}: ChatContainerProps) {
  return (
    <div className="flex flex-col h-full">
      {/* 头部 */}
      <div className="px-6 py-4 border-b border-slate-200 bg-white flex-shrink-0">
        <h2 className="text-lg font-semibold text-slate-800">问答区域</h2>
        <p className="text-sm text-slate-500">使用自然语言查询数据</p>
      </div>

      {/* 错误提示 */}
      {error && (
        <div className="mx-4 mt-3 flex items-center justify-between gap-3 rounded-lg bg-red-50 border border-red-200 px-4 py-2 text-sm text-red-800">
          <span>{error}</span>
          {onDismissError && (
            <button
              type="button"
              onClick={onDismissError}
              className="shrink-0 rounded p-1 hover:bg-red-100"
              aria-label="关闭"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          )}
        </div>
      )}

      {/* 消息列表 */}
      <MessageList messages={messages} isLoading={isLoading} onMessageClick={onMessageClick} />

      {/* 输入区域 */}
      <QueryInput onSend={onSendMessage} disabled={isLoading} />
    </div>
  )
}
