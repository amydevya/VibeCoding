interface NewSessionBtnProps {
  onClick: () => void
}

export function NewSessionBtn({ onClick }: NewSessionBtnProps) {
  return (
    <button
      onClick={() => onClick()}
      className="w-full flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-medium text-white bg-primary-600 rounded-lg hover:bg-primary-700 active:bg-primary-800 transition-all duration-200 shadow-sm hover:shadow-md"
    >
      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
      </svg>
      新建会话
    </button>
  )
}
