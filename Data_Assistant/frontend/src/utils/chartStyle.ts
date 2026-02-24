/**
 * 统一图表样式：标题、坐标轴标签、图例等在各类型间保持一致
 */

export const CHART_STYLE = {
  /** 标题：居中、统一字号与颜色 */
  title: {
    left: 'center' as const,
    textStyle: { fontSize: 14, color: '#475569' },
  },
  /** 坐标轴标签（caption）统一字号 */
  axisLabelFontSize: 12,
  /** 图例标签字号 */
  legendFontSize: 12,
}

const DEFAULT_TITLE_TEXT = '数据可视化'

function getTitleText(option: Record<string, unknown>, override?: string): string {
  if (override) return override
  const t = option?.title
  if (t && typeof t === 'object' && 'text' in t && typeof (t as { text?: string }).text === 'string') {
    return (t as { text: string }).text
  }
  return DEFAULT_TITLE_TEXT
}

/** 规范化单个坐标轴，统一 axisLabel.fontSize */
function normalizeAxis(axis: unknown): Record<string, unknown> {
  if (!axis || typeof axis !== 'object') return {}
  const a = { ...(axis as Record<string, unknown>) }
  if (!a.axisLabel || typeof a.axisLabel !== 'object') {
    a.axisLabel = { fontSize: CHART_STYLE.axisLabelFontSize }
  } else {
    const al = { ...(a.axisLabel as Record<string, unknown>) }
    al.fontSize = CHART_STYLE.axisLabelFontSize
    a.axisLabel = al
  }
  return a
}

/**
 * 对任意 ECharts option 应用统一样式：标题居中+字号，坐标轴标签字号一致
 */
export function normalizeChartOption(
  option: Record<string, unknown>,
  titleText?: string
): Record<string, unknown> {
  const text = getTitleText(option, titleText)
  const result: Record<string, unknown> = {
    ...option,
    title: {
      ...(typeof option.title === 'object' && option.title ? (option.title as Record<string, unknown>) : {}),
      text,
      left: CHART_STYLE.title.left,
      textStyle: { ...CHART_STYLE.title.textStyle },
    },
  }

  // 统一 xAxis 标签字号（支持 object 或 array）
  if (result.xAxis !== undefined) {
    if (Array.isArray(result.xAxis)) {
      result.xAxis = (result.xAxis as unknown[]).map((item) => normalizeAxis(item))
    } else {
      result.xAxis = normalizeAxis(result.xAxis)
    }
  }
  if (result.yAxis !== undefined) {
    if (Array.isArray(result.yAxis)) {
      result.yAxis = (result.yAxis as unknown[]).map((item) => normalizeAxis(item))
    } else {
      result.yAxis = normalizeAxis(result.yAxis)
    }
  }

  // 图例字号
  if (result.legend && typeof result.legend === 'object') {
    const leg = { ...(result.legend as Record<string, unknown>) }
    if (!leg.textStyle) leg.textStyle = {}
    ;(leg.textStyle as Record<string, unknown>).fontSize = CHART_STYLE.legendFontSize
    result.legend = leg
  }

  return result
}
