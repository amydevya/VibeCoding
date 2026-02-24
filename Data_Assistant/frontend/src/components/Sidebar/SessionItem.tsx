import { Session } from '@/types'

interface SessionItemProps {
  session: Session
  isActive: boolean
  onSelect: () => void
  onRename: () => void
  onDelete: () => void
  onContextMenu?: (e: React.MouseEvent) => void
}

export function SessionItem({ session, isActive, onSelect, onRename, onDelete, onContextMenu }: SessionItemProps) {
  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr)
    const now = new Date()
    const diffMs = now.getTime() - date.getTime()
    const diffMins = Math.floor(diffMs / 60000)
    const diffHours = Math.floor(diffMs / 3600000)
    const diffDays = Math.floor(diffMs / 86400000)

    if (diffMins < 1) return '刚刚'
    if (diffMins < 60) return `${diffMins}分钟前`
    if (diffHours < 24) return `${diffHours}小时前`
    if (diffDays < 7) return `${diffDays}天前`
    return date.toLocaleDateString('zh-CN')
  }

  return (
    <div
      onClick={onSelect}
      onContextMenu={onContextMenu}
      className={`
        group relative px-3 py-2.5 rounded-lg cursor-pointer transition-all duration-200
        ${isActive 
          ? 'bg-primary-50 border border-primary-200' 
          : 'hover:bg-slate-100 border border-transparent'}
      `}
    >
      <div className="flex items-center gap-2">
        <div className={`
          w-2 h-2 rounded-full flex-shrink-0
          ${isActive ? 'bg-primary-500' : 'bg-slate-300'}
        `} />
        <div className="flex-1 min-w-0">
          <div className={`
            text-sm font-medium truncate
            ${isActive ? 'text-primary-700' : 'text-slate-700'}
          `}>
            {session.title}
          </div>
          <div className="text-xs text-slate-400 mt-0.5">
            {formatDate(session.updated_at)}
          </div>
        </div>
      </div>
      
      {/* 悬停时显示：重命名、删除 */}
      <div className="absolute right-1 top-1/2 -translate-y-1/2 flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation()
            onRename()
          }}
          className="p-1.5 rounded hover:bg-slate-200 text-slate-500 hover:text-slate-700"
          title="重命名"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
          </svg>
        </button>
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation()
            onDelete()
          }}
          className="p-1.5 rounded hover:bg-red-100 text-slate-400 hover:text-red-500"
          title="删除"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
    </div>
  )
}
