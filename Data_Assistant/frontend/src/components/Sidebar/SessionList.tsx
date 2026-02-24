import { useState, useRef, useEffect } from 'react'
import { Session } from '@/types'
import { SessionItem } from './SessionItem'
import { NewSessionBtn } from './NewSessionBtn'
import { RenameSessionModal } from './RenameSessionModal'

interface SessionListProps {
  sessions: Session[]
  currentSessionId: string | null
  onSelectSession: (id: string) => void
  onUpdateSession: (id: string, title: string) => Promise<unknown>
  onDeleteSession: (id: string) => void
  onCreateSession: () => void
}

export function SessionList({
  sessions,
  currentSessionId,
  onSelectSession,
  onUpdateSession,
  onDeleteSession,
  onCreateSession,
}: SessionListProps) {
  const [contextMenu, setContextMenu] = useState<{ x: number; y: number; session: Session } | null>(null)
  const [renameTarget, setRenameTarget] = useState<Session | null>(null)
  const menuRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!contextMenu) return
    const close = () => setContextMenu(null)
    const t = setTimeout(close, 0)
    document.addEventListener('click', close)
    return () => {
      clearTimeout(t)
      document.removeEventListener('click', close)
    }
  }, [contextMenu])

  const handleContextMenu = (session: Session, e: React.MouseEvent) => {
    e.preventDefault()
    setContextMenu({ x: e.clientX, y: e.clientY, session })
  }

  const handleRenameClick = (session: Session) => {
    setRenameTarget(session)
    setContextMenu(null)
  }

  const handleRenameConfirm = async (newTitle: string) => {
    if (!renameTarget) return
    await onUpdateSession(renameTarget.id, newTitle)
    setRenameTarget(null)
  }

  return (
    <div className="flex flex-col h-full">
      {/* 头部 */}
      <div className="p-4 border-b border-slate-200">
        <h1 className="text-lg font-semibold text-slate-800">智能数据分析</h1>
        <p className="text-xs text-slate-500 mt-1">自然语言查询数据</p>
      </div>

      {/* 新建会话按钮 */}
      <div className="p-3">
        <NewSessionBtn onClick={onCreateSession} />
      </div>

      {/* 会话列表 */}
      <div className="flex-1 overflow-y-auto px-3 pb-3">
        {sessions.length === 0 ? (
          <div className="text-center text-slate-400 text-sm py-8">
            <div className="text-3xl mb-3">💬</div>
            <p>暂无会话</p>
            <p className="text-xs mt-1">点击上方按钮创建新会话</p>
          </div>
        ) : (
          <div className="space-y-1">
            {sessions.map((session) => (
              <SessionItem
                key={session.id}
                session={session}
                isActive={currentSessionId === session.id}
                onSelect={() => onSelectSession(session.id)}
                onRename={() => handleRenameClick(session)}
                onDelete={() => onDeleteSession(session.id)}
                onContextMenu={(e) => handleContextMenu(session, e)}
              />
            ))}
          </div>
        )}
      </div>

      {/* 右键菜单（悬停点击铅笔图标更直观） */}
      {contextMenu && (
        <div
          ref={menuRef}
          className="fixed z-50 min-w-[140px] py-1 bg-white border border-slate-200 rounded-lg shadow-lg"
          style={{ left: contextMenu.x, top: contextMenu.y }}
          onClick={(e) => e.stopPropagation()}
        >
          <button
            type="button"
            className="w-full px-4 py-2.5 text-left text-sm text-slate-700 hover:bg-slate-100 flex items-center gap-2"
            onClick={() => handleRenameClick(contextMenu.session)}
          >
            <svg className="w-4 h-4 text-slate-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
            </svg>
            重命名
          </button>
        </div>
      )}

      {/* 重命名弹窗 */}
      {renameTarget && (
        <RenameSessionModal
          session={renameTarget}
          onConfirm={handleRenameConfirm}
          onClose={() => setRenameTarget(null)}
        />
      )}
    </div>
  )
}
