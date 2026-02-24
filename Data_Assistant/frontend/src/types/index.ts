// 会话（与后端 SessionResponse 一致，snake_case）
export interface Session {
  id: string
  title: string
  created_at: string
  updated_at: string
}

// 消息（与后端 MessageResponse 一致，snake_case）
export interface Message {
  id: string
  session_id: string
  role: 'user' | 'assistant'
  content: string
  sql?: string | null
  data?: Record<string, unknown>[] | null
  chart?: ChartConfig | null
  created_at: string
}

/** 后端返回的消息（chart 为 BackendChartResponse） */
export type MessageFromApi = Omit<Message, 'chart'> & {
  chart?: BackendChartResponse | null
}

// 图表配置类型
export type ChartType = 'bar' | 'line' | 'pie' | 'scatter' | 'radar'

export const ChartTypeLabel: Record<ChartType, string> = {
  bar: '柱状图',
  line: '折线图',
  pie: '饼图',
  scatter: '散点图',
  radar: '雷达图',
}

export interface ChartConfig {
  type: ChartType
  option: Record<string, unknown>
}

// API 响应类型
export interface ApiResponse<T> {
  success: boolean
  data?: T
  error?: string
}

// 聊天查询请求（与后端 ChatQueryRequest 一致）
export interface ChatQueryRequest {
  session_id: string
  question: string
}

// 后端返回的图表推荐格式
export interface BackendChartResponse {
  chart_type: string
  echarts_option: Record<string, unknown>
  summary?: string
}

// 同步聊天查询响应（与后端 /api/chat/query/sync 一致）
export interface ChatQuerySyncResponse {
  success: boolean
  sql?: string
  data?: Record<string, unknown>[]
  chart?: BackendChartResponse
  answer?: string
  error?: string
}

// SSE 流式响应（与后端 event 类型一致）
export type SSEEventType =
  | 'status'
  | 'reason'
  | 'sql'
  | 'data'
  | 'chart'
  | 'answer_chunk'
  | 'answer'
  | 'error'
  | 'done'

export interface SSEMessage {
  type: SSEEventType
  content: string | Record<string, unknown>[] | BackendChartResponse | null
  count?: number
}
