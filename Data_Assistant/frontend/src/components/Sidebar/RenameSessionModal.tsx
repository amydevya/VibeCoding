import { useState, useEffect, useRef } from 'react'
import { Session } from '@/types'

interface RenameSessionModalProps {
  session: Session
  onConfirm: (newTitle: string) => void | Promise<unknown>
  onClose: () => void
}

export function RenameSessionModal({ session, onConfirm, onClose }: RenameSessionModalProps) {
  const [value, setValue] = useState(session.title)
  const [submitting, setSubmitting] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    setValue(session.title)
    inputRef.current?.focus()
  }, [session.id, session.title])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const title = value.trim()
    if (!title) return
    setSubmitting(true)
    try {
      await onConfirm(title)
      onClose()
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30" onClick={onClose}>
      <div
        className="bg-white rounded-lg shadow-xl p-4 w-[90%] max-w-md border border-slate-200"
        onClick={(e) => e.stopPropagation()}
      >
        <h3 className="text-sm font-medium text-slate-800 mb-3">重命名会话</h3>
        <form onSubmit={handleSubmit}>
          <input
            ref={inputRef}
            type="text"
            value={value}
            onChange={(e) => setValue(e.target.value)}
            className="w-full px-3 py-2 border border-slate-200 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            placeholder="会话标题"
          />
          <div className="flex justify-end gap-2 mt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-3 py-1.5 text-sm text-slate-600 hover:bg-slate-100 rounded-md"
            >
              取消
            </button>
            <button
              type="submit"
              disabled={!value.trim() || submitting}
              className="px-3 py-1.5 text-sm bg-primary-500 text-white rounded-md hover:bg-primary-600 disabled:opacity-50 disabled:pointer-events-none"
            >
              {submitting ? '保存中…' : '保存'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
