import { ChartConfig } from '@/types'
import ReactECharts from 'echarts-for-react'

interface AdvancedChartProps {
  config: ChartConfig
  height?: number | string
}

export function AdvancedChart({ config, height = 350 }: AdvancedChartProps) {
  const getDefaultOption = () => {
    const baseOption = {
      tooltip: {
        trigger: 'item' as const,
        backgroundColor: 'rgba(50,50,50,0.9)',
        borderColor: '#333',
        textStyle: { color: '#fff' },
      },
      ...config.option,
    }

    return baseOption
  }

  return (
    <div className="w-full">
      <ReactECharts
        option={getDefaultOption()}
        style={{ height: typeof height === 'number' ? `${height}px` : height }}
        opts={{ renderer: 'canvas' }}
      />
    </div>
  )
}
