import { useState, useEffect, useRef, useCallback } from 'react'

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:8080/api/v1'

export function useNotifications(user, token) {
  const [notifications, setNotifications] = useState([])
  const [unreadCount,   setUnreadCount]   = useState(0)
  const [loading,       setLoading]       = useState(false)
  const ctrlRef    = useRef(null) // AbortController de la conexión SSE activa
  const retryTimer = useRef(null)

  // ── Conectar SSE ──────────────────────────────────────────────────
  const connect = useCallback(() => {
    if (!user || !token) return

    // Cancelar conexión previa si la hubiera
    ctrlRef.current?.abort()
    const ctrl = new AbortController()
    ctrlRef.current = ctrl

    setLoading(true)

    // Usamos fetch + ReadableStream en lugar de EventSource nativo
    // para poder enviar el JWT en el header Authorization
    fetch(`${API_BASE}/notifications/stream`, {
      headers: { Authorization: `Bearer ${token}` },
      signal:  ctrl.signal,
    })
      .then(res => {
        if (!res.ok) throw new Error(`SSE error ${res.status}`)
        setLoading(false)

        const reader  = res.body.getReader()
        const decoder = new TextDecoder()
        let buffer    = ''

        const pump = () =>
          reader.read().then(({ done, value }) => {
            if (done) return

            buffer += decoder.decode(value, { stream: true })

            // Los eventos SSE están separados por \n\n
            const parts = buffer.split('\n\n')
            buffer = parts.pop() // el último puede estar incompleto

            for (const chunk of parts) {
              if (!chunk.trim()) continue        // línea vacía
              if (chunk.startsWith(': ')) continue // heartbeat — ignorar

              let eventType = 'message'
              let dataLine  = ''

              for (const line of chunk.split('\n')) {
                if (line.startsWith('event:')) eventType = line.slice(6).trim()
                if (line.startsWith('data:'))  dataLine  = line.slice(5).trim()
              }

              if (!dataLine) continue

              try {
                const parsed = JSON.parse(dataLine)

                if (eventType === 'sync') {
                  // Estado completo al conectarse — pobla la lista directamente
                  setNotifications(parsed.notifications ?? [])
                  setUnreadCount(parsed.unread_count ?? 0)

                } else if (eventType === 'notification') {
                  // Nueva notificación en tiempo real
                  setNotifications(prev => {
                    if (prev.some(n => n.id === parsed.id)) return prev // dedup
                    return [parsed, ...prev]
                  })
                  if (parsed.status === 'UNREAD') {
                    setUnreadCount(prev => prev + 1)
                  }
                }
              } catch { /* JSON malformado — ignorar */ }
            }

            pump() // seguir leyendo
          })

        pump()
      })
      .catch(err => {
        if (err.name === 'AbortError') return // desconexión intencional — no reconectar
        setLoading(false)
        // Red caída, servidor reiniciando, etc. — reconectar en 5s
        retryTimer.current = setTimeout(connect, 5_000)
      })
  }, [user, token])

  // ── Ciclo de vida ─────────────────────────────────────────────────
  useEffect(() => {
    if (!user || !token) {
      ctrlRef.current?.abort()
      ctrlRef.current = null
      clearTimeout(retryTimer.current)
      setNotifications([])
      setUnreadCount(0)
      return
    }

    connect()

    return () => {
      ctrlRef.current?.abort()
      ctrlRef.current = null
      clearTimeout(retryTimer.current)
    }
  }, [user, token]) // eslint-disable-line react-hooks/exhaustive-deps

  // ── Marcar una como leída (optimista) ────────────────────────────
  const markRead = useCallback(async (notifId) => {
    if (!token) return
    setNotifications(prev =>
      prev.map(n => n.id === notifId ? { ...n, status: 'READ' } : n)
    )
    setUnreadCount(prev => Math.max(0, prev - 1))
    try {
      await fetch(`${API_BASE}/notifications/${notifId}/read`, {
        method:  'PATCH',
        headers: { Authorization: `Bearer ${token}` },
      })
    } catch { /* la próxima reconexión sincronizará desde el evento sync */ }
  }, [token])

  // ── Marcar todas como leídas (optimista) ─────────────────────────
  const markAllRead = useCallback(async () => {
    if (!token) return
    setNotifications(prev => prev.map(n => ({ ...n, status: 'READ' })))
    setUnreadCount(0)
    try {
      await fetch(`${API_BASE}/notifications/read-all`, {
        method:  'PATCH',
        headers: { Authorization: `Bearer ${token}` },
      })
    } catch { }
  }, [token])

  return { notifications, unreadCount, loading, markRead, markAllRead }
}