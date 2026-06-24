// application/ia/hooks/useIA.js
// Hook compartido — cada módulo lo instancia con su propio `modulo`

import { useState, useCallback, useRef } from 'react'
import apiClient from '../../infraestructura/api/Api'

export function useIA(modulo) {
  const [mensajes,  setMensajes]  = useState([])
  const [cargando,  setCargando]  = useState(false)
  const [esCrisis,  setEsCrisis]  = useState(false)
  const [error,     setError]     = useState(null)
  const bottomRef = useRef(null)

  const enviar = useCallback(async (texto) => {
    if (!texto.trim() || cargando) return

    // Agregar mensaje del usuario optimísticamente
    const msgUsuario = { rol: 'user', contenido: texto, ts: Date.now() }
    setMensajes(prev => [...prev, msgUsuario])
    setCargando(true)
    setError(null)

    try {
      const res = await apiClient.post('/ia/chat.php', { modulo, mensaje: texto })
      const { respuesta, es_crisis } = res.data ?? res

      setMensajes(prev => [...prev, {
        rol: 'assistant', contenido: respuesta, ts: Date.now(), esCrisis: es_crisis
      }])

      if (es_crisis) setEsCrisis(true)
    } catch (e) {
      setError(e.message)
      setMensajes(prev => [...prev, {
        rol: 'assistant',
        contenido: '⚠️ No pude conectarme con el asistente. Intenta de nuevo.',
        ts: Date.now(),
        esError: true,
      }])
    } finally {
      setCargando(false)
      // Scroll al último mensaje
      setTimeout(() => bottomRef.current?.scrollIntoView({ behavior: 'smooth' }), 80)
    }
  }, [modulo, cargando])

  const limpiar = useCallback(async () => {
    try {
      await apiClient.post('/ia/limpiar.php', { modulo })
    } catch (_) { /* no crítico */ }
    setMensajes([])
    setEsCrisis(false)
    setError(null)
  }, [modulo])

  return { mensajes, cargando, esCrisis, error, enviar, limpiar, bottomRef }
}
