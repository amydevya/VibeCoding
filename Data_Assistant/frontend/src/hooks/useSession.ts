import { useCallback } from 'react'
import { useSessionStore } from '@/stores/sessionStore'
import { getSessions, createSession as createSessionApi, deleteSession as deleteSessionApi, updateSession as updateSessionApi } from '@/services/api'

export function useSession() {
  const {
    sessions,
    currentSessionId,
    isLoading,
    setSessions,
    addSession,
    updateSession: updateSessionInStore,
    removeSession,
    setCurrentSession,
    setLoading,
  } = useSessionStore()

  const loadSessions = useCallback(async () => {
    setLoading(true)
    try {
      const { data } = await getSessions()
      setSessions(Array.isArray(data) ? data : [])
    } finally {
      setLoading(false)
    }
  }, [setSessions, setLoading])

  const createSession = useCallback(async (title?: string) => {
    const { data: session } = await createSessionApi(title)
    addSession(session)
    setCurrentSession(session.id)
  }, [addSession, setCurrentSession])

  const updateSession = useCallback(
    async (id: string, title: string) => {
      const { data } = await updateSessionApi(id, title)
      updateSessionInStore(id, { title: data.title })
    },
    [updateSessionInStore]
  )

  const deleteSession = useCallback(
    async (id: string) => {
      await deleteSessionApi(id)
      removeSession(id)
    },
    [removeSession]
  )

  const selectSession = useCallback(
    (id: string) => {
      setCurrentSession(id)
    },
    [setCurrentSession]
  )

  return {
    sessions,
    currentSessionId,
    isLoading,
    loadSessions,
    createSession,
    updateSession,
    deleteSession,
    selectSession,
  }
}
