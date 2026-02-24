import { create } from 'zustand'
import { Message } from '@/types'

interface ChatState {
  messages: Message[]
  isLoading: boolean
  sqlPreview: string | null
  error: string | null
  
  // Actions
  setMessages: (messages: Message[]) => void
  addMessage: (message: Message) => void
  clearMessages: () => void
  setLoading: (loading: boolean) => void
  setSqlPreview: (sql: string | null) => void
  setError: (error: string | null) => void
}

export const useChatStore = create<ChatState>((set) => ({
  messages: [],
  isLoading: false,
  sqlPreview: null,
  error: null,
  
  setMessages: (messages) => set({ messages }),
  addMessage: (message) => set((state) => ({
    messages: [...state.messages, message]
  })),
  clearMessages: () => set({ messages: [], sqlPreview: null, error: null }),
  setLoading: (loading) => set({ isLoading: loading }),
  setSqlPreview: (sql) => set({ sqlPreview: sql }),
  setError: (error) => set({ error }),
}))
