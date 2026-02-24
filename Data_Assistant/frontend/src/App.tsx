import { useEffect, useState } from 'react'
import { MainLayout } from '@/components/Layout/MainLayout'
import { SessionList } from '@/components/Sidebar'
import { ChatContainer } from '@/components/Chat'
import { ResultPanel } from '@/components/Result'
import { useSession, useChat, useChart } from '@/hooks'
import { useChartStore } from '@/stores/chartStore'
import { Message } from '@/types'

function App() {
  const {
    sessions,
    currentSessionId,
    createSession,
    updateSession,
    deleteSession,
    selectSession,
    loadSessions,
  } = useSession()

  const { messages, isLoading, error, sendMessage, loadMessages, clearError } = useChat()
  const { chartConfig, rawData, chartType, changeChartType, setChartConfig, setRawData } = useChart()

  // 当前选中的消息（用于右侧显示）
  const [selectedMessage, setSelectedMessage] = useState<Message | null>(null)

  // 从选中的消息或最新的助手消息中获取 SQL/数据
  const displayMessage = selectedMessage || [...messages].reverse().find(m => m.role === 'assistant')
  const currentSql = displayMessage?.sql || null

  useEffect(() => {
    loadSessions()
  }, [loadSessions])

  useEffect(() => {
    if (currentSessionId) {
      loadMessages(currentSessionId)
      setSelectedMessage(null) // 切换会话时清空选中
    }
  }, [currentSessionId, loadMessages])

  // 当有新消息时，清空选中，显示最新结果
  useEffect(() => {
    if (messages.length > 0) {
      const lastMsg = messages[messages.length - 1]
      if (lastMsg.role === 'assistant') {
        setSelectedMessage(null)
      }
    }
  }, [messages])

  const handleSendMessage = (content: string) => {
    sendMessage(content)
  }

  const handleMessageClick = (message: Message) => {
    if (message.role === 'assistant' && (message.sql || message.data || message.chart)) {
      setSelectedMessage(message)
      // 更新数据
      if (message.data && message.data.length > 0) {
        setRawData(message.data)
      }
      // 更新图表，同时同步图表类型与源配置（用于切换类型后恢复一致样式）
      if (message.chart) {
        setChartConfig(message.chart)
        useChartStore.getState().setSourceChartConfig(message.chart)
        if (message.chart.type) {
          useChartStore.getState().setChartType(message.chart.type)
        }
      } else {
        useChartStore.getState().setSourceChartConfig(null)
      }
    }
  }

  return (
    <MainLayout
      sidebar={
        <SessionList
          sessions={sessions}
          currentSessionId={currentSessionId}
          onCreateSession={createSession}
          onUpdateSession={updateSession}
          onDeleteSession={deleteSession}
          onSelectSession={selectSession}
        />
      }
      chat={
        <ChatContainer
          messages={messages}
          isLoading={isLoading}
          error={error}
          onSendMessage={handleSendMessage}
          onDismissError={clearError}
          onMessageClick={handleMessageClick}
        />
      }
      chart={
        <ResultPanel
          sql={currentSql}
          chartConfig={chartConfig}
          rawData={rawData}
          chartType={chartType}
          onChartTypeChange={changeChartType}
        />
      }
    />
  )
}

export default App
