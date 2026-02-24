import { ChartType } from '@/types'

interface ChartTypeSelectorProps {
  currentType: ChartType
  onChange: (type: ChartType) => void
}

const chartTypes: { type: ChartType; icon: string; label: string }[] = [
  { type: 'bar', icon: '📊', label: '柱状图' },
  { type: 'line', icon: '📈', label: '折线图' },
  { type: 'pie', icon: '🥧', label: '饼图' },
  { type: 'scatter', icon: '⚬', label: '散点图' },
  { type: 'radar', icon: '🕸️', label: '雷达图' },
]

export function ChartTypeSelector({ currentType, onChange }: ChartTypeSelectorProps) {
  return (
    <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-lg">
      {chartTypes.map(({ type, icon, label }) => (
        <button
          key={type}
          type="button"
          onClick={(e) => {
            e.preventDefault()
            onChange(type)
          }}
          title={label}
          className={`
            flex items-center justify-center w-8 h-8 rounded-md text-sm transition-all cursor-pointer
            ${currentType === type
              ? 'bg-white text-primary-600 shadow-sm'
              : 'text-slate-500 hover:text-slate-700 hover:bg-white/50'}
          `}
        >
          {icon}
        </button>
      ))}
    </div>
  )
}
