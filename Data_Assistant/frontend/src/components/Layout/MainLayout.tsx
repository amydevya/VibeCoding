import { ReactNode, useState, useCallback, useEffect } from 'react'

interface MainLayoutProps {
  sidebar: ReactNode
  chat: ReactNode
  chart: ReactNode
}

export function MainLayout({ sidebar, chat, chart }: MainLayoutProps) {
  const [rightPanelWidth, setRightPanelWidth] = useState(420)
  const [isResizing, setIsResizing] = useState(false)

  const minWidth = 350
  const maxWidth = 700

  const handleMouseDown = useCallback(() => {
    setIsResizing(true)
  }, [])

  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (!isResizing) return
    const newWidth = window.innerWidth - e.clientX
    setRightPanelWidth(Math.min(maxWidth, Math.max(minWidth, newWidth)))
  }, [isResizing])

  const handleMouseUp = useCallback(() => {
    setIsResizing(false)
  }, [])

  useEffect(() => {
    if (isResizing) {
      document.addEventListener('mousemove', handleMouseMove)
      document.addEventListener('mouseup', handleMouseUp)
      document.body.style.cursor = 'col-resize'
      document.body.style.userSelect = 'none'
    } else {
      document.removeEventListener('mousemove', handleMouseMove)
      document.removeEventListener('mouseup', handleMouseUp)
      document.body.style.cursor = ''
      document.body.style.userSelect = ''
    }
    return () => {
      document.removeEventListener('mousemove', handleMouseMove)
      document.removeEventListener('mouseup', handleMouseUp)
    }
  }, [isResizing, handleMouseMove, handleMouseUp])

  return (
    <div className="flex h-screen w-full bg-slate-50 overflow-hidden">
      {/* 左侧边栏 - 会话管理 */}
      <aside className="w-72 flex-shrink-0 border-r border-slate-200 bg-white shadow-sm">
        {sidebar}
      </aside>

      {/* 中间区域 - 问答区域 */}
      <main className="flex-1 flex flex-col min-w-0 border-r border-slate-200 bg-slate-50">
        {chat}
      </main>

      {/* 右侧区域 - 可视化图表（可调整宽度） */}
      <aside
        className="flex-shrink-0 bg-white shadow-sm relative"
        style={{ width: rightPanelWidth }}
      >
        {chart}
        
        {/* 拖拽调整宽度的手柄 */}
        <div
          onMouseDown={handleMouseDown}
          className={`
            absolute left-0 top-0 bottom-0 w-1 cursor-col-resize
            hover:bg-primary-400 transition-colors z-10
            ${isResizing ? 'bg-primary-500' : 'bg-transparent'}
          `}
          title="拖拽调整宽度"
        />
      </aside>
    </div>
  )
}
