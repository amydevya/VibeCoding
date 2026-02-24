import { ChartConfig } from '@/types'
import ReactECharts from 'echarts-for-react'

interface BasicChartProps {
  config: ChartConfig
  height?: number | string
}

export function BasicChart({ config, height = 300 }: BasicChartProps) {
  return (
    <div className="w-full">
      <ReactECharts
        option={config.option}
        style={{ height: typeof height === 'number' ? `${height}px` : height }}
        opts={{ renderer: 'svg' }}
        notMerge={true}
      />
    </div>
  )
}
