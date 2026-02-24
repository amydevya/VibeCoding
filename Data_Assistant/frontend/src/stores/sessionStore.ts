import { create } from 'zustand'
import { Session } from '@/types'

interface SessionState {
  sessions: Session[]
  currentSessionId: string | null
  isLoading: boolean
  
  // Actions
  setSessions: (sessions: Session[]) => void
  addSession: (session: Session) => void
  updateSession: (id: string, patch: Partial<Pick<Session, 'title'>>) => void
  removeSession: (id: string) => void
  setCurrentSession: (id: string | null) => void
  setLoading: (loading: boolean) => void
}

export const useSessionStore = create<SessionState>((set) => ({
  sessions: [],
  currentSessionId: null,
  isLoading: false,
  
  setSessions: (sessions) => set({ sessions }),
  addSession: (session) => set((state) => ({
    sessions: [session, ...state.sessions]
  })),
  updateSession: (id, patch) => set((state) => ({
    sessions: state.sessions.map((s) =>
      s.id === id ? { ...s, ...patch } : s
    ),
  })),
  removeSession: (id) => set((state) => ({
    sessions: state.sessions.filter((s) => s.id !== id),
    currentSessionId: state.currentSessionId === id ? null : state.currentSessionId
  })),
  setCurrentSession: (id) => set({ currentSessionId: id }),
  setLoading: (loading) => set({ isLoading: loading }),
}))
