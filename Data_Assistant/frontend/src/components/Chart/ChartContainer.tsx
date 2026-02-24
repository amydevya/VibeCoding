import { ChartConfig, ChartType, ChartTypeLabel } from '@/types'
import { BasicChart } from './BasicChart'
import { DataTable } from './DataTable'
import { ChartTypeSelector } from './ChartTypeSelector'

interface ChartContainerProps {
  chartConfig: ChartConfig | null
  rawData: Record<string, unknown>[]
  chartType: ChartType
  onChartTypeChange: (type: ChartType) => void
}

export function ChartContainer({ 
  chartConfig, 
  rawData, 
  chartType,
  onChartTypeChange 
}: ChartContainerProps) {
  const isEmpty = !chartConfig && rawData.length === 0

  return (
    <div className="flex flex-col h-full">
      {/* 头部 */}
      <div className="px-6 py-4 border-b border-slate-200 bg-white flex-shrink-0">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold text-slate-800">可视化图表</h2>
            <p className="text-sm text-primary-600 font-medium">
              {isEmpty ? '数据可视化展示' : `当前: ${ChartTypeLabel[chartType]}`}
            </p>
          </div>
          {!isEmpty && (
            <ChartTypeSelector currentType={chartType} onChange={onChartTypeChange} />
          )}
        </div>
      </div>

      {/* 内容区域 */}
      <div className="flex-1 overflow-y-auto p-6">
        {isEmpty ? (
          <div className="flex items-center justify-center h-full">
            <div className="text-center text-slate-400">
              <div className="text-5xl mb-4">📊</div>
              <p className="text-lg font-medium">图表区域</p>
              <p className="text-sm mt-2">查询数据后将在此展示图表</p>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            {/* 图表 */}
            {chartConfig && (
              <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm">
                <BasicChart config={chartConfig} height={280} />
              </div>
            )}

            {/* 数据表格 */}
            {rawData.length > 0 && (
              <DataTable data={rawData} maxRows={10} />
            )}
          </div>
        )}
      </div>
    </div>
  )
}
