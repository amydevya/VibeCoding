import { useCallback } from 'react'
import { useChatStore } from '@/stores/chatStore'
import { useSessionStore } from '@/stores/sessionStore'
import { useChartStore } from '@/stores/chartStore'
import {
  getSessionMessages,
  sendChatQueryStream,
  backendChartToConfig,
  updateSession as updateSessionApi,
} from '@/services/api'
import type { BackendChartResponse, Message } from '@/types'

export function useChat() {
  const currentSessionId = useSessionStore((s) => s.currentSessionId)
  const {
    messages,
    isLoading,
    sqlPreview,
    error,
    addMessage,
    clearMessages,
    setLoading,
    setSqlPreview,
    setError,
    setMessages,
  } = useChatStore()
  const setChartConfig = useChartStore((s) => s.setChartConfig)
  const setRawData = useChartStore((s) => s.setRawData)
  const setChartType = useChartStore((s) => s.setChartType)
  const setSourceChartConfig = useChartStore((s) => s.setSourceChartConfig)

  const loadMessages = useCallback(
    async (sessionId: string) => {
      try {
        const { data } = await getSessionMessages(sessionId)
        const list = Array.isArray(data) ? data : []
        const mapped: Message[] = list.map((m) => ({
          ...m,
          chart: m.chart ? backendChartToConfig(m.chart) : null,
        }))
        setMessages(mapped)
      } catch {
        setMessages([])
      }
    },
    [setMessages]
  )

  const sendMessage = useCallback(
    async (content: string) => {
      if (!content.trim()) return
      if (!currentSessionId) {
        setError('请先选择或创建会话')
        return
      }

      const userMessage: Message = {
        id: `user-${Date.now()}`,
        session_id: currentSessionId,
        role: 'user',
        content: content.trim(),
        created_at: new Date().toISOString(),
      }
      addMessage(userMessage)
      setLoading(true)
      setSqlPreview(null)
      setError(null)

      // 若当前会话仍是默认标题，用首条问题自动总结为标题
      const session = useSessionStore.getState().sessions.find((s) => s.id === currentSessionId)
      if (session?.title === '新会话') {
        const summary = content.trim().length > 20 ? content.trim().slice(0, 20) + '…' : content.trim()
        updateSessionApi(currentSessionId, summary).then(({ data }) => {
          useSessionStore.getState().updateSession(currentSessionId, { title: data.title })
        }).catch(() => {})
      }

      let sqlResult: string | null = null
      let dataResult: Record<string, unknown>[] = []
      let chartResult: BackendChartResponse | null = null

      try {
        await sendChatQueryStream(
          currentSessionId,
          content.trim(),
          (event) => {
            const { type, content: c } = event
            if (type === 'sql' && typeof c === 'string') {
              sqlResult = c
              setSqlPreview(c)
            } else if (type === 'data' && Array.isArray(c)) {
              dataResult = c
              setRawData(c)
            } else if (type === 'chart' && c && typeof c === 'object' && 'echarts_option' in c) {
              chartResult = c as BackendChartResponse
              const config = backendChartToConfig(chartResult)
              setChartConfig(config)
              setSourceChartConfig(config)
              // 同步图表类型
              if (config?.type) {
                setChartType(config.type)
              }
            } else if (type === 'answer' && typeof c === 'string') {
              const assistantMessage: Message = {
                id: `assistant-${Date.now()}`,
                session_id: currentSessionId,
                role: 'assistant',
                content: c,
                sql: sqlResult ?? undefined,
                data: dataResult.length ? dataResult : undefined,
                chart: chartResult ? backendChartToConfig(chartResult) : undefined,
                created_at: new Date().toISOString(),
              }
              addMessage(assistantMessage)
              setLoading(false)
            } else if (type === 'error' && typeof c === 'string') {
              setError(c)
              setLoading(false)
            } else if (type === 'done') {
              setLoading(false)
            }
          }
        )
      } catch (err) {
        setError(err instanceof Error ? err.message : '查询失败，请重试')
      } finally {
        setLoading(false)
      }
    },
    [
      currentSessionId,
      addMessage,
      setLoading,
      setSqlPreview,
      setError,
      setRawData,
      setChartConfig,
      setChartType,
    ]
  )

  const clearError = useCallback(() => setError(null), [setError])

  return {
    messages,
    isLoading,
    sqlPreview,
    error,
    sendMessage,
    clearMessages,
    loadMessages,
    clearError,
  }
}
