import axios from 'axios'
import type {
  BackendChartResponse,
  ChartConfig,
  ChartType,
  MessageFromApi,
  Session,
  SSEMessage,
} from '@/types'
import { normalizeChartOption } from '@/utils/chartStyle'

/** 后端图表格式 → 前端 ChartConfig（应用统一样式：标题居中、字号一致） */
export function backendChartToConfig(backend: BackendChartResponse): ChartConfig {
  const rawOption = (backend.echarts_option ?? {}) as Record<string, unknown>
  return {
    type: (backend.chart_type as ChartType) || 'bar',
    option: normalizeChartOption(rawOption),
  }
}

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:8000'

export const api = axios.create({
  baseURL: API_BASE,
  headers: {
    'Content-Type': 'application/json',
  },
})

// 健康检查
export const healthCheck = () => api.get('/health')

// 会话相关
export const getSessions = () => api.get<Session[]>('/api/sessions')
export const createSession = (title?: string) =>
  api.post<Session>('/api/sessions', title != null ? { title } : {})
export const deleteSession = (id: string) => api.delete(`/api/sessions/${id}`)
export const getSession = (id: string) => api.get(`/api/sessions/${id}`)
export const updateSession = (id: string, title: string) =>
  api.put<Session>(`/api/sessions/${id}`, { title })

// 消息列表（后端返回 chart 为 BackendChartResponse）
export const getSessionMessages = (sessionId: string) =>
  api.get<MessageFromApi[]>(`/api/sessions/${sessionId}/messages`)

// 聊天相关
export const sendChatQuery = (sessionId: string, question: string) =>
  api.post('/api/chat/query', { session_id: sessionId, question })

/** SSE 流式查询：解析 data 行并回调 onEvent */
export async function sendChatQueryStream(
  sessionId: string,
  question: string,
  onEvent: (event: SSEMessage) => void
): Promise<void> {
  const res = await fetch(`${API_BASE}/api/chat/query`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ session_id: sessionId, question }),
  })
  if (!res.ok) {
    const text = await res.text()
    throw new Error(text || `HTTP ${res.status}`)
  }
  const reader = res.body?.getReader()
  if (!reader) throw new Error('No response body')
  const decoder = new TextDecoder()
  let buffer = ''
  try {
    while (true) {
      const { done, value } = await reader.read()
      if (done) break
      buffer += decoder.decode(value, { stream: true })
      const lines = buffer.split('\n')
      buffer = lines.pop() ?? ''
      for (const line of lines) {
        if (line.startsWith('data: ')) {
          const json = line.slice(6)
          if (json === '[DONE]' || json === '') continue
          try {
            const event = JSON.parse(json) as SSEMessage
            onEvent(event)
          } catch {
            // ignore parse errors for non-JSON lines
          }
        }
      }
    }
  } finally {
    reader.releaseLock()
  }
}
