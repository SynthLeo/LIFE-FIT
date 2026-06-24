import { useState, useEffect, useRef, useCallback } from 'react'
import { createPortal } from 'react-dom'
import { useNavigate } from 'react-router-dom'
import api from '@/lib/api'
import { Card, CardHeader, CardTitle, CardContent, Button, Badge, Input, Label, Spinner, EmptyState } from '@/presentacion/componentes/ui'
import {
  Dumbbell, Play, Square, Plus, Check, ChevronDown, ChevronUp,
  Timer, RotateCcw, ListChecks, Shuffle, Flame, TrendingUp, X, Volume2, BarChart2
} from 'lucide-react'
import { cn } from '@/lib/utils'

// ── Timer de descanso ────────────────────────────────────────
function RestTimer({ seconds, onDone, onSkip }) {
  const [remaining, setRemaining] = useState(seconds)
  const [running, setRunning]     = useState(true)
  const intervalRef = useRef(null)

  useEffect(() => {
    if (!running) return
    intervalRef.current = setInterval(() => {
      setRemaining(r => {
        if (r <= 1) { clearInterval(intervalRef.current); onDone(); return 0 }
        return r - 1
      })
    }, 1000)
    return () => clearInterval(intervalRef.current)
  }, [running])

  const pct = ((seconds - remaining) / seconds) * 100
  const min = Math.floor(remaining / 60)
  const sec = remaining % 60

  return createPortal(
    <div style={{
      position: 'fixed', inset: 0, zIndex: 9999,
      background: 'rgba(0,0,0,0.85)',
      backdropFilter: 'blur(6px)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      padding: '24px',
    }}>
      <div className="w-full max-w-xs text-center animate-fade-up">
        <Card className="border-primary/30 py-8">
          <p className="text-sm text-muted-foreground mb-4 font-medium">⏱ Descanso</p>

          {/* Círculo de progreso */}
          <div className="relative w-36 h-36 mx-auto mb-4">
            <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
              <circle cx="50" cy="50" r="44" fill="none" stroke="hsl(var(--secondary))" strokeWidth="8" />
              <circle
                cx="50" cy="50" r="44" fill="none"
                stroke="hsl(var(--primary))" strokeWidth="8"
                strokeLinecap="round"
                strokeDasharray={`${2 * Math.PI * 44}`}
                strokeDashoffset={`${2 * Math.PI * 44 * (1 - pct / 100)}`}
                className="transition-all duration-1000"
              />
            </svg>
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-4xl font-bold tabular-nums" style={{ fontFamily: 'Bebas Neue, sans-serif' }}>
                {min > 0 ? `${min}:${String(sec).padStart(2, '0')}` : sec}
              </span>
            </div>
          </div>

          <p className="text-sm text-muted-foreground mb-6">Recupera antes de la siguiente serie</p>

          <div className="flex gap-2 justify-center">
            <Button variant="outline" size="sm" onClick={() => setRunning(r => !r)}>
              {running ? <Square className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
              {running ? 'Pausar' : 'Reanudar'}
            </Button>
            <Button size="sm" onClick={onSkip} className="gap-1">
              <ChevronDown className="w-3.5 h-3.5" /> Saltar
            </Button>
          </div>
        </Card>
      </div>
    </div>,
    document.body
  )
}

// ── Tarjeta de ejercicio activo ──────────────────────────────
function EjercicioCard({ ejercicio, idSesion, idRutina, seriesObj, onSerieGuardada }) {
  const [series, setSeries]       = useState([]) // series completadas
  const [form, setForm]           = useState({ reps: seriesObj?.reps_objetivo ?? 10, peso: seriesObj?.peso_sugerido ?? 0 })
  const [saving, setSaving]       = useState(false)
  const [expanded, setExpanded]   = useState(true)
  const [showTimer, setShowTimer] = useState(false)
  const [restSecs]                = useState(90)

  const totalVol = series.reduce((a, s) => a + s.volumen, 0)

  const guardarSerie = async () => {
    setSaving(true)
    try {
      const { data } = await api.post('/Entrenamiento/RegistrarSerie.php', {
        id_sesion:    idSesion,
        id_ejercicio: ejercicio.id_ejercicio,
        id_rutina:    idRutina ?? null,
        numero_serie: series.length + 1,
        repeticiones: Number(form.reps),
        peso_kg:      Number(form.peso),
      })
      const nuevaSerie = {
        num:     series.length + 1,
        reps:    Number(form.reps),
        peso:    Number(form.peso),
        volumen: data.volumen,
      }
      setSeries(prev => [...prev, nuevaSerie])
      onSerieGuardada(data.volumen)
      setShowTimer(true)
    } catch (e) {
      console.error(e)
    } finally {
      setSaving(false)
    }
  }

  return (
    <>
      {showTimer && (
        <RestTimer
          seconds={restSecs}
          onDone={() => setShowTimer(false)}
          onSkip={() => setShowTimer(false)}
        />
      )}

      <Card className={cn('transition-all', expanded ? 'border-primary/30' : '')}>
        {/* Header del ejercicio */}
        <button
          className="w-full flex items-center justify-between gap-3 text-left"
          onClick={() => setExpanded(e => !e)}
        >
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
              <Dumbbell className="w-4 h-4 text-primary" />
            </div>
            <div>
              <p className="font-semibold text-sm leading-tight">{ejercicio.nombre}</p>
              <div className="flex gap-1 mt-0.5 flex-wrap">
                <Badge variant="secondary" className="text-[10px] capitalize">{ejercicio.grupo_muscular}</Badge>
                {seriesObj && (
                  <Badge variant="secondary" className="text-[10px]">
                    {seriesObj.series_objetivo} × {seriesObj.reps_objetivo}
                  </Badge>
                )}
              </div>
            </div>
          </div>
          <div className="flex items-center gap-3 shrink-0">
            {series.length > 0 && (
              <div className="text-right">
                <p className="text-xs font-semibold text-primary">{series.length} series</p>
                <p className="text-[10px] text-muted-foreground">{totalVol.toFixed(1)} kg vol.</p>
              </div>
            )}
            {expanded ? <ChevronUp className="w-4 h-4 text-muted-foreground" /> : <ChevronDown className="w-4 h-4 text-muted-foreground" />}
          </div>
        </button>

        {expanded && (
          <div className="mt-4 space-y-4">
            {/* Series completadas */}
            {series.length > 0 && (
              <div className="bg-secondary rounded-lg overflow-hidden">
                <div className="grid grid-cols-4 text-[10px] text-muted-foreground px-3 py-1.5 border-b border-border font-medium">
                  <span>SERIE</span><span>REPS</span><span>PESO</span><span>VOL</span>
                </div>
                {series.map(s => (
                  <div key={s.num} className="grid grid-cols-4 text-sm px-3 py-2 border-b border-border/50 last:border-0">
                    <span className="font-semibold text-primary">#{s.num}</span>
                    <span>{s.reps}</span>
                    <span>{s.peso} kg</span>
                    <span className="text-muted-foreground">{s.volumen.toFixed(1)}</span>
                  </div>
                ))}
              </div>
            )}

            {/* Formulario nueva serie */}
            <div className="flex items-end gap-3">
              <div className="flex-1 space-y-1">
                <Label className="text-xs">Reps</Label>
                <Input
                  type="number" min="0"
                  value={form.reps}
                  onChange={e => setForm(f => ({ ...f, reps: e.target.value }))}
                  className="h-10 text-center text-lg font-bold"
                />
              </div>
              <div className="flex-1 space-y-1">
                <Label className="text-xs">Peso (kg)</Label>
                <Input
                  type="number" min="0" step="0.5"
                  value={form.peso}
                  onChange={e => setForm(f => ({ ...f, peso: e.target.value }))}
                  className="h-10 text-center text-lg font-bold"
                />
              </div>
              <Button
                onClick={guardarSerie}
                disabled={saving}
                className="h-10 gap-1.5 px-4"
              >
                {saving ? <Spinner className="w-4 h-4" /> : <Check className="w-4 h-4" />}
                Listo
              </Button>
            </div>

            {/* Progreso series */}
            {seriesObj && (
              <div className="flex gap-1">
                {Array.from({ length: seriesObj.series_objetivo }, (_, i) => (
                  <div
                    key={i}
                    className={cn(
                      'flex-1 h-1.5 rounded-full transition-all',
                      i < series.length ? 'bg-primary' : 'bg-secondary'
                    )}
                  />
                ))}
              </div>
            )}
          </div>
        )}
      </Card>
    </>
  )
}

// ── Modal selector de ejercicios ─────────────────────────────
function SelectorEjercicios({ onSelect, onClose, excluidos = [] }) {
  const [ejercicios, setEjercicios] = useState([])
  const [loading, setLoading]       = useState(true)
  const [q, setQ]                   = useState('')

  useEffect(() => {
    api.get('/Catalogo/ObtenerCatalogo.php')
      .then(r => setEjercicios(r.data.ejercicios ?? []))
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [])

  const filtrados = ejercicios.filter(e =>
    !excluidos.includes(e.id_ejercicio) &&
    e.nombre.toLowerCase().includes(q.toLowerCase())
  )

  return (
    <div className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm flex items-end sm:items-center justify-center p-4">
      <Card className="w-full max-w-md max-h-[80vh] flex flex-col border-primary/20">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-bold" style={{ fontFamily: 'Bebas Neue, sans-serif' }}>Agregar ejercicio</h3>
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground">
            <X className="w-4 h-4" />
          </button>
        </div>
        <Input
          placeholder="Buscar ejercicio…"
          value={q}
          onChange={e => setQ(e.target.value)}
          className="mb-3"
          autoFocus
        />
        <div className="overflow-y-auto flex-1 space-y-1 -mx-1 px-1">
          {loading ? (
            <div className="flex justify-center py-8"><Spinner /></div>
          ) : filtrados.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-8">Sin resultados</p>
          ) : filtrados.map(e => (
            <button
              key={e.id_ejercicio}
              onClick={() => { onSelect(e); onClose() }}
              className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-secondary transition-colors text-left"
            >
              <div className="w-8 h-8 rounded bg-secondary flex items-center justify-center shrink-0">
                <Dumbbell className="w-3.5 h-3.5 text-muted-foreground" />
              </div>
              <div>
                <p className="text-sm font-medium">{e.nombre}</p>
                <p className="text-xs text-muted-foreground capitalize">{e.grupo_muscular} · {e.nivel_dificultad}</p>
              </div>
            </button>
          ))}
        </div>
      </Card>
    </div>
  )
}

// ── Modal finalizar sesión ───────────────────────────────────
function FinalizarModal({ duracion, volumen, series, onFinalizar, onCancelar, saving, errorMsg }) {
  const [sensacion, setSensacion] = useState('')
  const [notas, setNotas]         = useState('')

  const opts = [
    { v: 'muy_mal', l: 'Muy mal',  e: '😫' },
    { v: 'mal',     l: 'Mal',      e: '😞' },
    { v: 'regular', l: 'Regular',  e: '😐' },
    { v: 'bien',    l: 'Bien',     e: '😊' },
    { v: 'muy_bien',l: 'Muy bien', e: '🔥' },
  ]

  const min = Math.floor(duracion / 60)
  const sec = duracion % 60

  return createPortal(
    <div style={{
      position: 'fixed', inset: 0, zIndex: 9999,
      background: 'rgba(0,0,0,0.85)',
      backdropFilter: 'blur(6px)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      padding: '24px',
    }}>
      <Card className="w-full max-w-sm border-primary/20 animate-fade-up">
        <h3 className="text-xl font-bold mb-1" style={{ fontFamily: 'Bebas Neue, sans-serif' }}>
          ¡Sesión completada! 🎉
        </h3>
        <p className="text-sm text-muted-foreground mb-4">Resumen de tu entrenamiento</p>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-3 mb-5">
          {[
            { label: 'Duración', value: `${min}:${String(sec).padStart(2, '0')}` },
            { label: 'Series',   value: series },
            { label: 'Volumen',  value: `${volumen.toFixed(0)} kg` },
          ].map(s => (
            <div key={s.label} className="bg-secondary rounded-lg p-3 text-center">
              <p className="text-lg font-bold" style={{ fontFamily: 'Bebas Neue, sans-serif' }}>{s.value}</p>
              <p className="text-[10px] text-muted-foreground">{s.label}</p>
            </div>
          ))}
        </div>

        {/* Sensación */}
        <Label className="text-xs mb-2 block">¿Cómo te sentiste?</Label>
        <div className="flex gap-1.5 mb-4">
          {opts.map(o => (
            <button
              key={o.v}
              onClick={() => setSensacion(o.v)}
              className={cn(
                'flex-1 flex flex-col items-center gap-0.5 py-2 rounded-lg border text-center transition-all',
                sensacion === o.v ? 'border-primary bg-primary/10' : 'border-border hover:bg-secondary'
              )}
            >
              <span className="text-lg">{o.e}</span>
              <span className="text-[9px] text-muted-foreground leading-tight">{o.l}</span>
            </button>
          ))}
        </div>

        <div className="space-y-1 mb-5">
          <Label className="text-xs">Notas (opcional)</Label>
          <textarea
            value={notas}
            onChange={e => setNotas(e.target.value)}
            placeholder="¿Algo que destacar de esta sesión?"
            rows={2}
            className="flex w-full rounded-lg border border-input bg-secondary px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring resize-none"
          />
        </div>

        {errorMsg && (
          <p className="text-sm text-destructive bg-destructive/10 border border-destructive/20 rounded-lg px-3 py-2 mb-3">
            {errorMsg}
          </p>
        )}

        <div className="flex gap-2">
          <Button variant="outline" onClick={onCancelar} className="flex-1">Seguir</Button>
          <Button onClick={() => onFinalizar(sensacion, notas)} disabled={saving} className="flex-1 gap-2">
            {saving ? <Spinner className="w-4 h-4" /> : <Check className="w-4 h-4" />}
            Guardar
          </Button>
        </div>
      </Card>
    </div>,
    document.body
  )
}
function ResumenSesion({ data, onNueva, onVerStats }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center gap-6 animate-fade-up">
      <div className="text-6xl">🏆</div>
      <div>
        <h2 className="text-3xl font-bold mb-2" style={{ fontFamily: 'Bebas Neue, sans-serif' }}>
          ¡Gran trabajo!
        </h2>
        <p className="text-muted-foreground">Sesión registrada correctamente</p>
      </div>
      <div className="grid grid-cols-3 gap-4 w-full max-w-sm">
        {[
          { label: 'Duración',    value: `${Math.floor(data.duracion / 60)}:${String(data.duracion % 60).padStart(2, '0')}`, icon: Timer },
          { label: 'Series',      value: data.total_series, icon: ListChecks },
          { label: 'Volumen',     value: `${data.volumen.toFixed(0)} kg`, icon: TrendingUp },
        ].map(({ label, value, icon: Icon }) => (
          <Card key={label} className="text-center py-4">
            <Icon className="w-5 h-5 text-primary mx-auto mb-1" />
            <p className="text-xl font-bold" style={{ fontFamily: 'Bebas Neue, sans-serif' }}>{value}</p>
            <p className="text-xs text-muted-foreground">{label}</p>
          </Card>
        ))}
      </div>
      <div className="flex flex-col gap-2 w-full max-w-sm">
        <Button onClick={onVerStats} variant="outline" className="w-full gap-2">
          <BarChart2 className="w-4 h-4" /> Ver mis estadísticas
        </Button>
        <Button onClick={onNueva} className="w-full gap-2">
          <Plus className="w-4 h-4" /> Nueva sesión
        </Button>
      </div>
    </div>
  )
}

// ── Página principal ─────────────────────────────────────────
export default function EntrenamientoPage() {
  const navigate = useNavigate()
  const [fase, setFase]             = useState('inicio')   // inicio | activa | resumen
  const [rutinas, setRutinas]       = useState([])
  const [loadingRutinas, setLoadingRutinas] = useState(true)
  const [idSesion, setIdSesion]     = useState(null)
  const [idRutina, setIdRutina]     = useState(null)
  const [ejercicios, setEjercicios] = useState([])  // ejercicios en la sesión actual
  const [volTotal, setVolTotal]     = useState(0)
  const [seriesTotal, setSeriesTotal] = useState(0)
  const [iniciado, setIniciado]     = useState(null) // Date
  const [showSelector, setShowSelector] = useState(false)
  const [showFinalizar, setShowFinalizar] = useState(false)
  const [savingFinal, setSavingFinal]    = useState(false)
  const [errorFinal, setErrorFinal]      = useState('')
  const [resumen, setResumen]            = useState(null)
  const [elapsed, setElapsed]            = useState(0)
  const timerRef = useRef(null)

  // Timer de sesión
  useEffect(() => {
    if (fase !== 'activa') return
    timerRef.current = setInterval(() => setElapsed(e => e + 1), 1000)
    return () => clearInterval(timerRef.current)
  }, [fase])

  const cargarRutinas = useCallback(() => {
    setLoadingRutinas(true)
    api.get('/Rutinas/Rutinas.php')
      .then(r => setRutinas(r.data.rutinas ?? []))
      .catch(console.error)
      .finally(() => setLoadingRutinas(false))
  }, [])

  useEffect(() => { cargarRutinas() }, [cargarRutinas])

  const iniciarConRutina = async (rutina) => {
    try {
      const { data } = await api.post('/Entrenamiento/IniciarSesion.php', { id_rutina: rutina.id_rutina })
      setIdSesion(data.id_sesion)
      setIdRutina(rutina.id_rutina)
      // Mapear ejercicios con info de series objetivo
      setEjercicios(data.ejercicios.map(e => ({
        ...e,
        seriesObj: { series_objetivo: e.series_objetivo, reps_objetivo: e.reps_objetivo, peso_sugerido: e.peso_sugerido }
      })))
      setIniciado(new Date())
      setFase('activa')
    } catch (e) { console.error(e) }
  }

  const iniciarLibre = async () => {
    try {
      const { data } = await api.post('/Entrenamiento/IniciarSesion.php', {})
      setIdSesion(data.id_sesion)
      setIdRutina(null)
      setEjercicios([])
      setIniciado(new Date())
      setFase('activa')
    } catch (e) { console.error(e) }
  }

  const agregarEjercicio = (ej) => {
    if (ejercicios.some(e => e.id_ejercicio === ej.id_ejercicio)) return
    setEjercicios(prev => [...prev, { ...ej, seriesObj: null }])
  }

  const onSerieGuardada = useCallback((volumen) => {
    setVolTotal(v => v + volumen)
    setSeriesTotal(s => s + 1)
  }, [])

  const finalizar = async (sensacion, notas) => {
    setSavingFinal(true)
    setErrorFinal('')
    try {
      const { data } = await api.put('/Entrenamiento/FinalizarSesion.php', {
        id_sesion:        idSesion,
        duracion_minutos: Math.floor(elapsed / 60),
        sensacion,
        notas,
      })
      setResumen({ ...data, duracion: elapsed })
      setShowFinalizar(false)
      setFase('resumen')
    } catch (e) {
      setErrorFinal(e.response?.data?.error ?? 'Error al guardar la sesión. Intenta de nuevo.')
    }
    finally { setSavingFinal(false) }
  }

  const nuevaSesion = () => {
    setFase('inicio')
    setIdSesion(null); setIdRutina(null)
    setEjercicios([]); setVolTotal(0); setSeriesTotal(0)
    setElapsed(0); setResumen(null)
    cargarRutinas()   // recargar por si hay rutinas nuevas
  }

  const elapsedStr = `${Math.floor(elapsed / 60)}:${String(elapsed % 60).padStart(2, '0')}`

  // ── FASE: INICIO ─────────────────────────────────────────────
  if (fase === 'inicio') {
    return (
      <div className="p-6 max-w-3xl mx-auto animate-fade-up">
        <div className="mb-8">
          <h1 className="text-3xl font-bold" style={{ fontFamily: 'Bebas Neue, sans-serif' }}>Entrenar</h1>
          <p className="text-muted-foreground text-sm mt-1">¿Cómo quieres entrenar hoy?</p>
        </div>

        <div className="grid sm:grid-cols-2 gap-4 mb-8">
          {/* Sesión libre */}
          <Card
            className="cursor-pointer hover:border-primary/40 transition-all group"
            onClick={iniciarLibre}
          >
            <div className="flex flex-col gap-3">
              <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                <Shuffle className="w-6 h-6 text-primary" />
              </div>
              <div>
                <h3 className="font-bold" style={{ fontFamily: 'Bebas Neue, sans-serif' }}>Sesión libre</h3>
                <p className="text-sm text-muted-foreground mt-0.5">
                  Elige ejercicios sobre la marcha sin seguir una rutina.
                </p>
              </div>
              <Button variant="outline" className="w-full mt-1 gap-2">
                <Play className="w-4 h-4" /> Empezar libre
              </Button>
            </div>
          </Card>

          {/* Con rutina */}
          <Card className="border-primary/20">
            <div className="flex flex-col gap-3">
              <div className="w-12 h-12 rounded-xl grad-primary flex items-center justify-center">
                <ListChecks className="w-6 h-6 text-black" />
              </div>
              <div>
                <h3 className="font-bold" style={{ fontFamily: 'Bebas Neue, sans-serif' }}>Seguir rutina</h3>
                <p className="text-sm text-muted-foreground mt-0.5">
                  Usa una de tus rutinas guardadas con ejercicios predefinidos.
                </p>
              </div>
            </div>
          </Card>
        </div>

        {/* Lista de rutinas */}
        <div>
          <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-3">
            Tus rutinas
          </h2>
          {loadingRutinas ? (
            <div className="flex justify-center py-8"><Spinner /></div>
          ) : rutinas.length === 0 ? (
            <EmptyState
              icon={ListChecks}
              title="Sin rutinas"
              description="Crea una rutina en la sección Rutinas para usarla aquí."
            />
          ) : (
            <div className="space-y-2">
              {rutinas.map(r => (
                <Card
                  key={r.id_rutina}
                  className={cn('cursor-pointer hover:border-primary/40 transition-all', r.activa && 'border-primary/20')}
                  onClick={() => iniciarConRutina(r)}
                >
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">
                        {{ fuerza: '💪', resistencia: '🏃', perdida_peso: '🔥', volumen: '📈', flexibilidad: '🧘' }[r.objetivo] ?? '🏋️'}
                      </span>
                      <div>
                        <p className="font-semibold text-sm">{r.nombre}</p>
                        <div className="flex gap-1 mt-0.5 flex-wrap">
                          <Badge variant="secondary" className="text-[10px] capitalize">{r.nivel}</Badge>
                          <Badge variant="secondary" className="text-[10px]">{r.dias_semana}d/sem</Badge>
                          <Badge variant="secondary" className="text-[10px]">{r.ejercicios?.length ?? 0} ejercicios</Badge>
                        </div>
                      </div>
                    </div>
                    <Button size="sm" className="gap-1 shrink-0">
                      <Play className="w-3.5 h-3.5" /> Iniciar
                    </Button>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>
    )
  }

  // ── FASE: RESUMEN ────────────────────────────────────────────
  if (fase === 'resumen') {
    return (
      <div className="p-6 max-w-xl mx-auto">
        <ResumenSesion data={resumen} onNueva={nuevaSesion} onVerStats={() => navigate('/estadisticas')} />
      </div>
    )
  }

  // ── FASE: ACTIVA ─────────────────────────────────────────────
  return (
    <div className="p-4 max-w-2xl mx-auto animate-fade-up pb-32">
      {showSelector && (
        <SelectorEjercicios
          onSelect={agregarEjercicio}
          onClose={() => setShowSelector(false)}
          excluidos={ejercicios.map(e => e.id_ejercicio)}
        />
      )}
      {showFinalizar && (
        <FinalizarModal
          duracion={elapsed}
          volumen={volTotal}
          series={seriesTotal}
          onFinalizar={finalizar}
          onCancelar={() => { setShowFinalizar(false); setErrorFinal('') }}
          saving={savingFinal}
          errorMsg={errorFinal}
        />
      )}

      {/* Barra top de sesión */}
      <div className="sticky top-0 z-40 bg-background/80 backdrop-blur-sm border-b border-border mb-4 -mx-4 px-4 py-3 flex items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1.5">
            <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
            <span className="text-sm font-mono font-semibold tabular-nums">{elapsedStr}</span>
          </div>
          <div className="flex items-center gap-3 text-sm text-muted-foreground">
            <span><span className="font-semibold text-foreground">{seriesTotal}</span> series</span>
            <span><span className="font-semibold text-foreground">{volTotal.toFixed(0)}</span> kg</span>
          </div>
        </div>
        <Button size="sm" variant="destructive" onClick={() => setShowFinalizar(true)} className="gap-1.5">
          <Square className="w-3.5 h-3.5" /> Finalizar
        </Button>
      </div>

      {/* Ejercicios vacíos */}
      {ejercicios.length === 0 && (
        <EmptyState
          icon={Dumbbell}
          title="Sin ejercicios"
          description="Agrega ejercicios para empezar a registrar series."
          action={
            <Button onClick={() => setShowSelector(true)} className="gap-2">
              <Plus className="w-4 h-4" /> Agregar ejercicio
            </Button>
          }
        />
      )}

      {/* Lista de ejercicios */}
      <div className="space-y-3">
        {ejercicios.map(ej => (
          <EjercicioCard
            key={ej.id_ejercicio}
            ejercicio={ej}
            idSesion={idSesion}
            idRutina={idRutina}
            seriesObj={ej.seriesObj}
            onSerieGuardada={onSerieGuardada}
          />
        ))}
      </div>

      {/* Botón agregar ejercicio */}
      <button
        onClick={() => setShowSelector(true)}
        className="mt-4 w-full flex items-center justify-center gap-2 py-3 rounded-xl border-2 border-dashed border-border hover:border-primary/40 text-muted-foreground hover:text-foreground transition-all text-sm font-medium"
      >
        <Plus className="w-4 h-4" /> Agregar ejercicio
      </button>
    </div>
  )
}