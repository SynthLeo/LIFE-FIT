// application/clinico/hooks/useClinco.js

import { useState, useCallback } from 'react'
import { clinicoApi }             from '../../infraestructura/api/Clinico'
import { CitaClinica, SignosVitales } from '../../modulos/clinico/Clinico'

// ── Citas ─────────────────────────────────────────────────────
export function useCitasClinco() {
  const [citas,    setCitas]    = useState([])
  const [cargando, setCargando] = useState(false)
  const [error,    setError]    = useState(null)

  const cargar = useCallback(async () => {
    setCargando(true); setError(null)
    try {
      const res = await clinicoApi.getCitas()
      setCitas((res.data ?? []).map(c => new CitaClinica(c)))
    } catch (e) { setError(e.message) }
    finally { setCargando(false) }
  }, [])

  const agendar = useCallback(async (datos) => {
    const res = await clinicoApi.agendarCita(datos)
    await cargar()
    return res.data
  }, [cargar])

  const cancelar = useCallback(async (idCita) => {
    await clinicoApi.cancelarCita(idCita)
    await cargar()
  }, [cargar])

  return { citas, cargando, error, cargar, agendar, cancelar }
}

// ── Signos vitales ────────────────────────────────────────────
export function useSignosVitales() {
  const [historial,  setHistorial]  = useState([])
  const [cargando,   setCargando]   = useState(false)
  const [registrando,setRegistrando]= useState(false)
  const [ultimo,     setUltimo]     = useState(null)
  const [error,      setError]      = useState(null)

  const cargar = useCallback(async (dias = 30) => {
    setCargando(true); setError(null)
    try {
      const res = await clinicoApi.getSignos(dias)
      const mapped = (res.data ?? []).map(s => new SignosVitales(s))
      setHistorial(mapped)
      if (mapped.length > 0) setUltimo(mapped[0])
    } catch (e) { setError(e.message) }
    finally { setCargando(false) }
  }, [])

  const registrar = useCallback(async (datos) => {
    setRegistrando(true); setError(null)
    try {
      const res = await clinicoApi.registrarSignos(datos)
      await cargar()
      return res.data
    } catch (e) { setError(e.message); throw e }
    finally { setRegistrando(false) }
  }, [cargar])

  return { historial, ultimo, cargando, registrando, error, cargar, registrar }
}

// ── Síntomas ──────────────────────────────────────────────────
export function useSintomas() {
  const [evaluaciones, setEvaluaciones] = useState([])
  const [evaluando,    setEvaluando]    = useState(false)
  const [resultado,    setResultado]    = useState(null)
  const [error,        setError]        = useState(null)

  const cargar = useCallback(async () => {
    try {
      const res = await clinicoApi.getEvaluaciones()
      setEvaluaciones(res.data ?? [])
    } catch (e) { setError(e.message) }
  }, [])

  const evaluar = useCallback(async (datos) => {
    setEvaluando(true); setError(null); setResultado(null)
    try {
      const res = await clinicoApi.evaluarSintomas(datos)
      setResultado(res.data)
      await cargar()
      return res.data
    } catch (e) { setError(e.message); throw e }
    finally { setEvaluando(false) }
  }, [cargar])

  return { evaluaciones, evaluando, resultado, error, cargar, evaluar }
}
