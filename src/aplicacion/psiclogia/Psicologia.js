// application/psicologia/hooks/usePsicologia.js

import { useState, useCallback } from 'react'
import { psicologiaApi }         from '../../infraestructura/api/Psicologia'
import { CitaPsicologia, RegistroAnimo, TestEstres } from '../../modulos/psicologico/Psicologia'

// ── Citas ─────────────────────────────────────────────────────
export function useCitasPsicologia() {
  const [citas,     setCitas]     = useState([])
  const [cargando,  setCargando]  = useState(false)
  const [error,     setError]     = useState(null)

  const cargar = useCallback(async () => {
    setCargando(true); setError(null)
    try {
      const res = await psicologiaApi.getCitas()
      setCitas((res.data ?? []).map(c => new CitaPsicologia(c)))
    } catch (e) { setError(e.message) }
    finally { setCargando(false) }
  }, [])

  const agendar = useCallback(async (datos) => {
    const res = await psicologiaApi.agendarCita(datos)
    await cargar()
    return res.data
  }, [cargar])

  const cancelar = useCallback(async (idCita) => {
    await psicologiaApi.cancelarCita(idCita)
    await cargar()
  }, [cargar])

  return { citas, cargando, error, cargar, agendar, cancelar }
}

// ── Estado de ánimo ───────────────────────────────────────────
export function useAnimos(dias = 7) {
  const [animos,    setAnimos]    = useState([])
  const [cargando,  setCargando]  = useState(false)
  const [error,     setError]     = useState(null)

  const cargar = useCallback(async () => {
    setCargando(true); setError(null)
    try {
      const res = await psicologiaApi.getAnimos(dias)
      setAnimos((res.data ?? []).map(a => new RegistroAnimo(a)))
    } catch (e) { setError(e.message) }
    finally { setCargando(false) }
  }, [dias])

  const registrar = useCallback(async (datos) => {
    const res = await psicologiaApi.registrarAnimo(datos)
    await cargar()
    return res.data
  }, [cargar])

  return { animos, cargando, error, cargar, registrar }
}

// ── Test PSS-10 ───────────────────────────────────────────────
export function useTestEstres() {
  const [tests,       setTests]     = useState([])
  const [cargando,    setCargando]  = useState(false)
  const [guardando,   setGuardando] = useState(false)
  const [resultado,   setResultado] = useState(null)
  const [error,       setError]     = useState(null)

  const cargar = useCallback(async () => {
    setCargando(true)
    try {
      const res = await psicologiaApi.getTests()
      setTests(res.data ?? [])
    } catch (e) { setError(e.message) }
    finally { setCargando(false) }
  }, [])

  const guardar = useCallback(async (respuestas) => {
    setGuardando(true); setError(null)
    try {
      const res = await psicologiaApi.guardarTest(respuestas)
      const info = TestEstres.nivel(res.data.puntaje_total)
      setResultado({ ...res.data, ...info })
      await cargar()
      return res.data
    } catch (e) { setError(e.message); throw e }
    finally { setGuardando(false) }
  }, [cargar])

  return { tests, cargando, guardando, resultado, error, cargar, guardar }
}
