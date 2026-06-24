import { useEffect, useState, useCallback } from 'react'
import api from '@/lib/api'
import {
  Card, CardHeader, CardTitle, CardContent,
  Button, Badge, Input, Label, Select, Spinner
} from '@/presentacion/componentes/ui'
import {
  X, Plus, Trash2, ChevronLeft, ChevronRight,
  Dumbbell, Search, Check, Edit2
} from 'lucide-react'

const DIAS = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo']

// ── Helpers ────────────────────────────────────────────────────────────────
const grupoColor = {
  pecho:    'bg-red-500/15 text-red-400 border-red-500/30',
  espalda:  'bg-blue-500/15 text-blue-400 border-blue-500/30',
  piernas:  'bg-green-500/15 text-green-400 border-green-500/30',
  hombros:  'bg-yellow-500/15 text-yellow-400 border-yellow-500/30',
  brazos:   'bg-purple-500/15 text-purple-400 border-purple-500/30',
  core:     'bg-orange-500/15 text-orange-400 border-orange-500/30',
  cardio:   'bg-cyan-500/15 text-cyan-400 border-cyan-500/30',
}
const getGrupoClass = (g = '') =>
  grupoColor[g.toLowerCase()] ?? 'bg-secondary text-secondary-foreground border-border'

// ── Componente principal ───────────────────────────────────────────────────
export default function GestorDiasRutina({ rutinaId, rutinaNombre, onClose }) {
  const [rutina,     setRutina]     = useState(null)
  const [porDia,     setPorDia]     = useState({})   // { '1': [...], '2': [...] }
  const [loading,    setLoading]    = useState(true)
  const [diaActivo,  setDiaActivo]  = useState(1)
  const [showPicker, setShowPicker] = useState(false)
  const [editEj,     setEditEj]     = useState(null) // ejercicio en edición inline

  // ── Cargar datos ──────────────────────────────────────────────────────────
  const load = useCallback(async () => {
    setLoading(true)
    try {
      const { data } = await api.get('/Rutinas/RutinaEjercicios.php', {
        params: { id_rutina: rutinaId }
      })
      setRutina(data.rutina)
      setPorDia(data.por_dia ?? {})
    } catch (e) { console.error(e) }
    finally { setLoading(false) }
  }, [rutinaId])

  useEffect(() => { load() }, [load])

  // ── Eliminar ejercicio de un día ──────────────────────────────────────────
  const removeEjercicio = async (id) => {
    try {
      await api.delete('/Rutinas/RutinaEjercicios.php', { data: { id } })
      setPorDia(prev => {
        const next = { ...prev }
        Object.keys(next).forEach(d => {
          next[d] = next[d].filter(e => e.id !== id)
          if (!next[d].length) delete next[d]
        })
        return next
      })
    } catch (e) { console.error(e) }
  }

  // ── Guardar edición inline (series/reps/peso) ─────────────────────────────
  const saveEdit = async () => {
    if (!editEj) return
    try {
      await api.put('/Rutinas/RutinaEjercicios.php', {
        id:               editEj.id,
        series_objetivo:  Number(editEj.series_objetivo),
        reps_objetivo:    Number(editEj.reps_objetivo),
        peso_sugerido:    Number(editEj.peso_sugerido),
      })
      setPorDia(prev => {
        const next = { ...prev }
        Object.keys(next).forEach(d => {
          next[d] = next[d].map(e => e.id === editEj.id ? { ...e, ...editEj } : e)
        })
        return next
      })
      setEditEj(null)
    } catch (e) { console.error(e) }
  }

  // ── Agregar ejercicio (callback desde EjercicioPicker) ────────────────────
  const handleAddEjercicio = (nuevo) => {
    setPorDia(prev => ({
      ...prev,
      [String(nuevo.dia_semana)]: [...(prev[String(nuevo.dia_semana)] ?? []), nuevo]
    }))
    setShowPicker(false)
  }

  const diasActivos = rutina ? Array.from({ length: rutina.dias_semana }, (_, i) => i + 1) : []
  const ejerciciosHoy = porDia[String(diaActivo)] ?? []

  if (loading) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm">
        <Spinner className="w-10 h-10" />
      </div>
    )
  }

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-background overflow-hidden">
      {/* ── Header ── */}
      <div className="flex items-center gap-3 px-5 py-4 border-b border-border shrink-0">
        <button
          onClick={onClose}
          className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>
        <div className="flex-1 min-w-0">
          <h1 className="text-xl font-bold truncate" style={{ fontFamily: 'Syne, sans-serif' }}>
            {rutina?.nombre ?? rutinaNombre}
          </h1>
          <p className="text-xs text-muted-foreground">{rutina?.dias_semana} días · Gestiona los ejercicios por día</p>
        </div>
        <Button onClick={() => setShowPicker(true)} size="sm" className="gap-1.5 shrink-0">
          <Plus className="w-3.5 h-3.5" /> Agregar
        </Button>
      </div>

      {/* ── Selector de días ── */}
      <div className="flex gap-2 px-5 py-3 border-b border-border overflow-x-auto shrink-0 scrollbar-none">
        {diasActivos.map(d => {
          const count = (porDia[String(d)] ?? []).length
          const activo = d === diaActivo
          return (
            <button
              key={d}
              onClick={() => setDiaActivo(d)}
              className={`flex flex-col items-center px-4 py-2.5 rounded-xl border transition-all shrink-0 min-w-[72px] ${
                activo
                  ? 'bg-primary text-primary-foreground border-primary glow'
                  : 'bg-card border-border text-muted-foreground hover:border-primary/40 hover:text-foreground'
              }`}
            >
              <span className="text-[10px] font-medium uppercase tracking-wide">{DIAS[d - 1].slice(0, 3)}</span>
              <span className="text-base font-bold leading-tight" style={{ fontFamily: 'Syne, sans-serif' }}>D{d}</span>
              {count > 0 && (
                <span className={`text-[10px] mt-0.5 ${activo ? 'text-primary-foreground/70' : 'text-primary'}`}>
                  {count} ej.
                </span>
              )}
            </button>
          )
        })}
      </div>

      {/* ── Lista de ejercicios del día activo ── */}
      <div className="flex-1 overflow-y-auto px-5 py-4 space-y-3">
        <div className="flex items-center justify-between mb-1">
          <h2 className="text-base font-bold" style={{ fontFamily: 'Syne, sans-serif' }}>
            {DIAS[diaActivo - 1]}
          </h2>
          <span className="text-xs text-muted-foreground">{ejerciciosHoy.length} ejercicio{ejerciciosHoy.length !== 1 ? 's' : ''}</span>
        </div>

        {ejerciciosHoy.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 gap-3 text-center">
            <Dumbbell className="w-10 h-10 text-muted-foreground/30" />
            <p className="text-sm text-muted-foreground">Sin ejercicios para el {DIAS[diaActivo - 1]}</p>
            <Button size="sm" variant="outline" onClick={() => setShowPicker(true)} className="gap-1.5">
              <Plus className="w-3.5 h-3.5" /> Agregar ejercicio
            </Button>
          </div>
        ) : (
          ejerciciosHoy.map(ej => (
            <EjercicioRow
              key={ej.id}
              ej={ej}
              editando={editEj?.id === ej.id}
              editEj={editEj}
              setEditEj={setEditEj}
              onSave={saveEdit}
              onDelete={() => removeEjercicio(ej.id)}
            />
          ))
        )}
      </div>

      {/* ── Modal picker ── */}
      {showPicker && (
        <EjercicioPicker
          rutinaId={rutinaId}
          diaActivo={diaActivo}
          diasActivos={diasActivos}
          ejerciciosEnDia={porDia}
          onAdd={handleAddEjercicio}
          onClose={() => setShowPicker(false)}
        />
      )}
    </div>
  )
}

// ── Fila de ejercicio ──────────────────────────────────────────────────────
function EjercicioRow({ ej, editando, editEj, setEditEj, onSave, onDelete }) {
  return (
    <Card className={`transition-all ${editando ? 'border-primary/50' : ''}`}>
      <div className="flex items-start gap-3">
        {/* Número de orden */}
        <div className="w-7 h-7 rounded-lg bg-secondary flex items-center justify-center shrink-0 mt-0.5">
          <span className="text-xs font-bold text-muted-foreground">{ej.orden}</span>
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <div>
              <p className="font-semibold text-sm leading-tight">{ej.nombre}</p>
              <span className={`inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-medium border mt-1 ${getGrupoClass(ej.grupo_muscular)}`}>
                {ej.grupo_muscular}
              </span>
            </div>
            <div className="flex gap-1 shrink-0">
              {!editando ? (
                <>
                  <button
                    onClick={() => setEditEj({ ...ej })}
                    className="p-1.5 rounded text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={onDelete}
                    className="p-1.5 rounded text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </>
              ) : (
                <>
                  <button onClick={onSave} className="p-1.5 rounded text-primary hover:bg-primary/10 transition-colors">
                    <Check className="w-3.5 h-3.5" />
                  </button>
                  <button onClick={() => setEditEj(null)} className="p-1.5 rounded text-muted-foreground hover:bg-secondary transition-colors">
                    <X className="w-3.5 h-3.5" />
                  </button>
                </>
              )}
            </div>
          </div>

          {/* Series / Reps / Peso */}
          {!editando ? (
            <div className="flex gap-3 mt-2">
              <Pill label="Series" value={ej.series_objetivo} />
              <Pill label="Reps"   value={ej.reps_objetivo} />
              {ej.peso_sugerido > 0 && <Pill label="Peso" value={`${ej.peso_sugerido} kg`} />}
            </div>
          ) : (
            <div className="grid grid-cols-3 gap-2 mt-2">
              <MiniInput label="Series" value={editEj.series_objetivo} onChange={v => setEditEj(p => ({ ...p, series_objetivo: v }))} />
              <MiniInput label="Reps"   value={editEj.reps_objetivo}   onChange={v => setEditEj(p => ({ ...p, reps_objetivo: v }))} />
              <MiniInput label="Peso kg" value={editEj.peso_sugerido}  onChange={v => setEditEj(p => ({ ...p, peso_sugerido: v }))} />
            </div>
          )}
        </div>
      </div>
    </Card>
  )
}

function Pill({ label, value }) {
  return (
    <div className="flex items-center gap-1">
      <span className="text-[10px] text-muted-foreground uppercase tracking-wide">{label}</span>
      <span className="text-xs font-bold text-primary">{value}</span>
    </div>
  )
}

function MiniInput({ label, value, onChange }) {
  return (
    <div className="space-y-0.5">
      <label className="text-[10px] text-muted-foreground uppercase tracking-wide">{label}</label>
      <input
        type="number" min={0} value={value}
        onChange={e => onChange(e.target.value)}
        className="w-full h-7 rounded-md border border-input bg-secondary px-2 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-ring"
      />
    </div>
  )
}

// ── Picker de ejercicios ───────────────────────────────────────────────────
function EjercicioPicker({ rutinaId, diaActivo, diasActivos, ejerciciosEnDia, onAdd, onClose }) {
  const [ejercicios, setEjercicios] = useState([])
  const [grupos,     setGrupos]     = useState([])
  const [loading,    setLoading]    = useState(true)
  const [busqueda,   setBusqueda]   = useState('')
  const [grupoFiltro,setGrupoFiltro]= useState('')
  const [diaSelect,  setDiaSelect]  = useState(diaActivo)
  const [adding,     setAdding]     = useState(null) // id del ejercicio que se está agregando

  useEffect(() => {
    const fetch = async () => {
      setLoading(true)
      try {
        const params = {}
        if (busqueda)    params.q     = busqueda
        if (grupoFiltro) params.grupo = grupoFiltro
        const { data } = await api.get('/Catalogo/ObtenerCatalogo.php', { params })
        setEjercicios(data.ejercicios ?? [])
        setGrupos(data.grupos ?? [])
      } catch (e) { console.error(e) }
      finally { setLoading(false) }
    }
    const t = setTimeout(fetch, 300)
    return () => clearTimeout(t)
  }, [busqueda, grupoFiltro])

  // IDs ya asignados al día seleccionado
  const asignadosEnDia = new Set(
    (ejerciciosEnDia[String(diaSelect)] ?? []).map(e => e.id_ejercicio)
  )

  const agregar = async (ej) => {
    setAdding(ej.id_ejercicio)
    try {
      const { data } = await api.post('/Rutinas/RutinaEjercicios.php', {
        id_rutina:     rutinaId,
        id_ejercicio:  ej.id_ejercicio,
        dia_semana:    diaSelect,
        series_objetivo: 3,
        reps_objetivo:   10,
        peso_sugerido:   0,
      })
      onAdd(data.ejercicio)
    } catch (err) {
      alert(err.response?.data?.error ?? 'Error al agregar.')
    } finally {
      setAdding(null)
    }
  }

  return (
    <div className="fixed inset-0 z-60 flex flex-col bg-background animate-fade-up">
      {/* Header */}
      <div className="flex items-center gap-3 px-5 py-4 border-b border-border shrink-0">
        <button onClick={onClose} className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors">
          <X className="w-5 h-5" />
        </button>
        <h2 className="text-lg font-bold flex-1" style={{ fontFamily: 'Syne, sans-serif' }}>
          Agregar ejercicio
        </h2>
      </div>

      {/* Filtros */}
      <div className="px-5 py-3 space-y-2 border-b border-border shrink-0">
        {/* Día destino */}
        <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none">
          {diasActivos.map(d => (
            <button
              key={d}
              onClick={() => setDiaSelect(d)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all shrink-0 ${
                d === diaSelect
                  ? 'bg-primary text-primary-foreground border-primary'
                  : 'bg-card border-border text-muted-foreground hover:border-primary/40'
              }`}
            >
              {DIAS[d - 1]}
            </button>
          ))}
        </div>

        <div className="flex gap-2">
          {/* Búsqueda */}
          <div className="relative flex-1">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
            <input
              value={busqueda}
              onChange={e => setBusqueda(e.target.value)}
              placeholder="Buscar ejercicio…"
              className="w-full h-9 pl-8 pr-3 rounded-lg border border-input bg-secondary text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
            />
          </div>

          {/* Filtro grupo */}
          <select
            value={grupoFiltro}
            onChange={e => setGrupoFiltro(e.target.value)}
            className="h-9 px-2 rounded-lg border border-input bg-secondary text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
          >
            <option value="">Todos</option>
            {grupos.map(g => <option key={g} value={g}>{g}</option>)}
          </select>
        </div>
      </div>

      {/* Lista */}
      <div className="flex-1 overflow-y-auto px-5 py-3 space-y-2">
        {loading ? (
          <div className="flex justify-center py-16"><Spinner className="w-8 h-8" /></div>
        ) : ejercicios.length === 0 ? (
          <div className="flex flex-col items-center py-16 gap-2 text-center">
            <Dumbbell className="w-10 h-10 text-muted-foreground/30" />
            <p className="text-sm text-muted-foreground">No se encontraron ejercicios</p>
          </div>
        ) : (
          ejercicios.map(ej => {
            const yaAsignado = asignadosEnDia.has(ej.id_ejercicio)
            const cargando   = adding === ej.id_ejercicio
            return (
              <div
                key={ej.id_ejercicio}
                className={`flex items-center gap-3 p-3 rounded-xl border transition-all ${
                  yaAsignado ? 'border-primary/30 bg-primary/5 opacity-60' : 'border-border bg-card hover:border-primary/30'
                }`}
              >
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-sm leading-tight truncate">{ej.nombre}</p>
                  <div className="flex items-center gap-2 mt-1">
                    <span className={`inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-medium border ${getGrupoClass(ej.grupo_muscular)}`}>
                      {ej.grupo_muscular}
                    </span>
                    <span className="text-[10px] text-muted-foreground capitalize">{ej.nivel_dificultad}</span>
                  </div>
                </div>

                <button
                  onClick={() => !yaAsignado && !cargando && agregar(ej)}
                  disabled={yaAsignado || cargando}
                  className={`w-8 h-8 rounded-lg flex items-center justify-center transition-all shrink-0 ${
                    yaAsignado
                      ? 'bg-primary/20 text-primary cursor-default'
                      : 'bg-primary text-primary-foreground hover:bg-primary/90 glow'
                  }`}
                >
                  {cargando   ? <Spinner className="w-4 h-4" /> :
                   yaAsignado ? <Check className="w-4 h-4" /> :
                                <Plus className="w-4 h-4" />}
                </button>
              </div>
            )
          })
        )}
      </div>
    </div>
  )
}