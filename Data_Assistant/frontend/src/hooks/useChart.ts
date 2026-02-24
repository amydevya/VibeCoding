import { useCallback } from 'react'
import { useChartStore } from '@/stores/chartStore'
import { ChartConfig, ChartType } from '@/types'
import { CHART_STYLE, normalizeChartOption } from '@/utils/chartStyle'

const DEFAULT_TITLE = '数据可视化'

// 根据图表类型和原始数据生成 ECharts 配置（应用与后端一致的统一样式）
function generateChartOptionFromData(type: ChartType, data: Record<string, unknown>[]): Record<string, unknown> {
  if (!data || data.length === 0) return {}

  const keys = Object.keys(data[0])
  const categoryKey = keys[0]
  const valueKey = keys[1] || keys[0]
  const categories = data.map(d => String(d[categoryKey] ?? ''))
  const values = data.map(d => Number(d[valueKey]) || 0)
  const maxValue = Math.max(...values) * 1.2 || 100
  const title = { text: DEFAULT_TITLE, ...CHART_STYLE.title }

  let option: Record<string, unknown>
  switch (type) {
    case 'bar':
      option = {
        title,
        tooltip: { trigger: 'axis' as const },
        grid: { left: '3%', right: '4%', bottom: '10%', containLabel: true },
        xAxis: { type: 'category' as const, data: categories },
        yAxis: { type: 'value' as const },
        series: [{ name: valueKey, type: 'bar' as const, data: values, itemStyle: { color: '#0ea5e9' } }],
      }
      break
    case 'line':
      option = {
        title,
        tooltip: { trigger: 'axis' as const },
        grid: { left: '3%', right: '4%', bottom: '10%', containLabel: true },
        xAxis: { type: 'category' as const, data: categories },
        yAxis: { type: 'value' as const },
        series: [{ name: valueKey, type: 'line' as const, data: values, smooth: true, itemStyle: { color: '#0ea5e9' } }],
      }
      break
    case 'pie':
      option = {
        title,
        tooltip: { trigger: 'item' as const, formatter: '{b}: {c} ({d}%)' },
        series: [{
          name: valueKey,
          type: 'pie' as const,
          radius: ['40%', '70%'],
          center: ['50%', '55%'],
          data: data.map((d, i) => ({
            name: String(d[categoryKey] ?? ''),
            value: Number(d[valueKey]) || 0,
            itemStyle: { color: ['#0ea5e9', '#22c55e', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899'][i % 6] }
          })),
          label: { formatter: '{b}\n{d}%', fontSize: CHART_STYLE.axisLabelFontSize },
        }],
      }
      break
    case 'scatter':
      option = {
        title,
        tooltip: { trigger: 'item' as const },
        grid: { left: '3%', right: '4%', bottom: '10%', containLabel: true },
        xAxis: { type: 'category' as const, data: categories },
        yAxis: { type: 'value' as const },
        series: [{ name: valueKey, type: 'scatter' as const, data: values.map((v, i) => [i, v]), symbolSize: 15, itemStyle: { color: '#0ea5e9' } }],
      }
      break
    case 'radar':
      option = {
        title,
        tooltip: {},
        radar: {
          indicator: categories.map(c => ({ name: c, max: maxValue })),
          center: ['50%', '55%'],
          radius: '60%',
        },
        series: [{
          name: valueKey,
          type: 'radar' as const,
          data: [{ value: values, name: valueKey, areaStyle: { opacity: 0.3, color: '#0ea5e9' }, itemStyle: { color: '#0ea5e9' } }],
        }],
      }
      break
    default:
      return {}
  }
  return normalizeChartOption(option)
}

export function useChart() {
  const { 
    chartConfig, 
    sourceChartConfig,
    rawData, 
    chartType,
    setChartConfig, 
    setRawData, 
    setChartType,
    clearChart 
  } = useChartStore()

  const updateChart = useCallback(
    (config: ChartConfig | null, data: Record<string, unknown>[]) => {
      setChartConfig(config)
      setRawData(data)
    },
    [setChartConfig, setRawData]
  )

  const changeChartType = useCallback(
    (type: ChartType) => {
      if (rawData.length === 0) return
      // 若存在来自后端的同类型配置，直接恢复以保持样式一致
      if (sourceChartConfig?.type === type) {
        setChartType(type)
        setChartConfig(sourceChartConfig)
        return
      }
      // 从当前配置中提取标题
      const currentTitle = chartConfig?.option?.title as { text?: string } | undefined
      const titleText = currentTitle?.text || '数据可视化'
      const newOption = generateChartOptionFromData(type, rawData)
      if (newOption.title && typeof newOption.title === 'object') {
        (newOption.title as Record<string, unknown>).text = titleText
      }
      setChartType(type)
      setChartConfig({ type, option: newOption })
    },
    [rawData, chartConfig, sourceChartConfig, setChartType, setChartConfig]
  )

  const loadMockChart = useCallback(() => {
    const mockData = [
      { week: '第一周', sales: 28000 },
      { week: '第二周', sales: 35000 },
      { week: '第三周', sales: 32000 },
      { week: '第四周', sales: 30000 },
    ]
    const option = generateChartOptionFromData('bar', mockData)
    setChartConfig({ type: 'bar', option })
    setRawData(mockData)
    setChartType('bar')
  }, [setChartConfig, setRawData, setChartType])

  return {
    chartConfig,
    rawData,
    chartType,
    updateChart,
    changeChartType,
    clearChart,
    loadMockChart,
    setChartConfig,
    setRawData,
  }
}
