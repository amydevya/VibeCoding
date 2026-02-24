import { useSessionStore } from '@/stores/sessionStore'

export function Sidebar() {
  const { sessions, currentSessionId, setCurrentSession } = useSessionStore()

  return (
    <div className="flex flex-col h-full">
      {/* 头部 */}
      <div className="p-4 border-b border-slate-200">
        <h1 className="text-lg font-semibold text-slate-800">智能数据分析</h1>
      </div>
      
      {/* 新建会话按钮 */}
      <div className="p-3">
        <button className="w-full px-4 py-2 text-sm font-medium text-white bg-primary-600 rounded-lg hover:bg-primary-700 transition-colors">
          + 新建会话
        </button>
      </div>
      
      {/* 会话列表 */}
      <div className="flex-1 overflow-y-auto p-3">
        <div className="space-y-1">
          {sessions.length === 0 ? (
            <div className="text-center text-slate-400 text-sm py-8">
              暂无会话，点击上方按钮创建
            </div>
          ) : (
            sessions.map((session) => (
              <div
                key={session.id}
                onClick={() => setCurrentSession(session.id)}
                className={`
                  px-3 py-2 rounded-lg cursor-pointer transition-colors
                  ${currentSessionId === session.id 
                    ? 'bg-primary-50 text-primary-700' 
                    : 'hover:bg-slate-100 text-slate-600'}
                `}
              >
                <div className="text-sm font-medium truncate">{session.title}</div>
                <div className="text-xs text-slate-400 mt-1">
                  {new Date(session.updated_at).toLocaleDateString()}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  )
}
