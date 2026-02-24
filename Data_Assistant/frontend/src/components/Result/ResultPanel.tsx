import { useState } from 'react'
import { ChartConfig, ChartType } from '@/types'
import { BasicChart } from '@/components/Chart/BasicChart'
import { DataTable } from '@/components/Chart/DataTable'

interface ResultPanelProps {
  sql: string | null
  chartConfig: ChartConfig | null
  rawData: Record<string, unknown>[]
  chartType: ChartType
  onChartTypeChange: (type: ChartType) => void
}

type TabType = 'chart' | 'data'

const chartTypes: { type: ChartType; label: string }[] = [
  { type: 'bar', label: '柱状图' },
  { type: 'line', label: '折线图' },
  { type: 'pie', label: '饼图' },
  { type: 'scatter', label: '散点图' },
  { type: 'radar', label: '雷达图' },
]

export function ResultPanel({
  sql,
  chartConfig,
  rawData,
  chartType,
  onChartTypeChange,
}: ResultPanelProps) {
  const [activeTab, setActiveTab] = useState<TabType>('chart')

  const isEmpty = !chartConfig && rawData.length === 0

  return (
    <div className="flex flex-col h-full">
      {/* 头部：标题 + 图表/数据 Toggle */}
      <div className="px-6 py-3 border-b border-slate-200 bg-white flex-shrink-0">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-slate-800">数据可视化</h2>
          {!isEmpty && (
            <div className="flex gap-1 p-0.5 bg-slate-100 rounded-lg">
              <button
                onClick={() => setActiveTab('chart')}
                className={`px-3 py-1 text-sm font-medium rounded-md transition-all ${
                  activeTab === 'chart'
                    ? 'bg-white text-primary-600 shadow-sm'
                    : 'text-slate-500 hover:text-slate-700'
                }`}
              >
                图表
              </button>
              <button
                onClick={() => setActiveTab('data')}
                className={`px-3 py-1 text-sm font-medium rounded-md transition-all ${
                  activeTab === 'data'
                    ? 'bg-white text-primary-600 shadow-sm'
                    : 'text-slate-500 hover:text-slate-700'
                }`}
              >
                数据
              </button>
            </div>
          )}
        </div>
      </div>

      {/* 内容区域 */}
      <div className="flex-1 overflow-y-auto p-4">
        {isEmpty ? (
          <div className="flex items-center justify-center h-full">
            <div className="text-center text-slate-400">
              <div className="text-5xl mb-4">📊</div>
              <p className="text-lg font-medium">结果展示区</p>
              <p className="text-sm mt-2">查询数据后将在此展示图表和数据</p>
            </div>
          </div>
        ) : (
          <div className="space-y-3">
            {/* SQL 预览 */}
            {sql && (
              <div className="bg-slate-800 rounded-lg p-3 shadow-sm">
                <div className="flex items-center gap-2 text-slate-400 text-xs mb-1.5">
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
                  </svg>
                  <span className="font-mono">SQL 查询语句</span>
                </div>
                <pre className="text-xs font-mono text-green-400 whitespace-pre-wrap overflow-x-auto">{sql}</pre>
              </div>
            )}

            {/* 图表类型选择器 - 仅在图表标签页显示 */}
            {activeTab === 'chart' && chartConfig && (
              <>
                <div className="flex items-center justify-center gap-2 p-2 bg-slate-50 rounded-lg">
                  {chartTypes.map(({ type, label }) => (
                    <button
                      key={type}
                      type="button"
                      onClick={(e) => {
                        e.preventDefault()
                        onChartTypeChange(type)
                      }}
                      className={`
                        px-3 py-1.5 rounded-md text-sm font-medium transition-all cursor-pointer
                        ${chartType === type
                          ? 'bg-primary-600 text-white shadow-sm'
                          : 'bg-white text-slate-600 hover:bg-primary-50 hover:text-primary-600 border border-slate-200'}
                      `}
                    >
                      {label}
                    </button>
                  ))}
                </div>

                {/* 图表 */}
                <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm">
                  <BasicChart config={chartConfig} height={260} />
                </div>
              </>
            )}

            {/* 数据表格 */}
            {activeTab === 'data' && rawData.length > 0 && (
              <DataTable data={rawData} maxRows={15} />
            )}
          </div>
        )}
      </div>
    </div>
  )
}
