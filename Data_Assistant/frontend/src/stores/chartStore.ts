import { create } from 'zustand'
import { ChartConfig, ChartType } from '@/types'

interface ChartState {
  chartConfig: ChartConfig | null
  /** 来自后端/消息的原始图表配置，用于切换回同类型时恢复一致样式 */
  sourceChartConfig: ChartConfig | null
  rawData: Record<string, unknown>[]
  chartType: ChartType

  // Actions
  setChartConfig: (config: ChartConfig | null) => void
  setSourceChartConfig: (config: ChartConfig | null) => void
  setRawData: (data: Record<string, unknown>[]) => void
  setChartType: (type: ChartType) => void
  clearChart: () => void
}

export const useChartStore = create<ChartState>((set) => ({
  chartConfig: null,
  sourceChartConfig: null,
  rawData: [],
  chartType: 'bar',

  setChartConfig: (config) => set({ chartConfig: config }),
  setSourceChartConfig: (config) => set({ sourceChartConfig: config }),
  setRawData: (data) => set({ rawData: data }),
  setChartType: (type) => set({ chartType: type }),
  clearChart: () => set({ chartConfig: null, sourceChartConfig: null, rawData: [], chartType: 'bar' }),
}))
