// application/alimentacion/hooks/useAlimentacion.js

import { useState, useCallback } from 'react'
import { alimentacionApi }        from '../../infraestructura/api/Dieta'
import { ResultadoIMC, RegistroDiario, CitaNutricion } from '../../modulos/dieta/Alimentacion'

// ── IMC / TMB ─────────────────────────────────────────────────
export function useIMC() {
  const [resultado,  setResultado]  = useState(null)
  const [cargando,   setCargando]   = useState(false)
  const [error,      setError]      = useState(null)

  const calcular = useCallback(async () => {
    setCargando(true); setError(null)
    try {
      const res = await alimentacionApi.getIMC()
      setResultado(new ResultadoIMC(res.data))
    } catch (e) { setError(e.message) }
    finally { setCargando(false) }
  }, [])

  return { resultado, cargando, error, calcular }
}

// ── Registro diario ───────────────────────────────────────────
export function useRegistroDiario() {
  const [registros,  setRegistros]  = useState([])
  const [cargando,   setCargando]   = useState(false)
  const [guardando,  setGuardando]  = useState(false)
  const [error,      setError]      = useState(null)

  const cargar = useCallback(async (dias = 7) => {
    setCargando(true); setError(null)
    try {
      const res = await alimentacionApi.getRegistros(dias)
      setRegistros((res.data ?? []).map(r => new RegistroDiario(r)))
    } catch (e) { setError(e.message) }
    finally { setCargando(false) }
  }, [])

  const guardar = useCallback(async (datos) => {
    setGuardando(true); setError(null)
    try {
      const res = await alimentacionApi.guardarRegistro(datos)
      await cargar()
      return res.data
    } catch (e) { setError(e.message); throw e }
    finally { setGuardando(false) }
  }, [cargar])

  return { registros, cargando, guardando, error, cargar, guardar }
}

// ── Citas ─────────────────────────────────────────────────────
export function useCitasNutricion() {
  const [citas,    setCitas]    = useState([])
  const [cargando, setCargando] = useState(false)
  const [error,    setError]    = useState(null)

  const cargar = useCallback(async () => {
    setCargando(true); setError(null)
    try {
      const res = await alimentacionApi.getCitas()
      setCitas((res.data ?? []).map(c => new CitaNutricion(c)))
    } catch (e) { setError(e.message) }
    finally { setCargando(false) }
  }, [])

  const agendar = useCallback(async (datos) => {
    const res = await alimentacionApi.agendarCita(datos)
    await cargar()
    return res.data
  }, [cargar])

  const cancelar = useCallback(async (idCita) => {
    await alimentacionApi.cancelarCita(idCita)
    await cargar()
  }, [cargar])

  return { citas, cargando, error, cargar, agendar, cancelar }
}
