import { useEffect, useState } from 'react'
import api from '@/lib/api'
import {
  Card, CardHeader, CardTitle, CardContent,
  Button, Badge, Input, Label, Select, Spinner, EmptyState
} from '@/presentacion/componentes/ui'
import {
  Plus, Trash2, Edit2, ToggleLeft, ToggleRight,
  ListChecks, X, Check, CalendarDays, Sparkles, ChevronRight, Zap
} from 'lucide-react'
import GestorDiasRutina from './GestorDiasRutina'

const OBJETIVOS = ['fuerza', 'resistencia', 'perdida_peso', 'volumen', 'flexibilidad']
const NIVELES   = ['principiante', 'intermedio', 'avanzado']

const OBJ_ICONS = {
  fuerza: '💪', resistencia: '🏃', perdida_peso: '🔥', volumen: '📈', flexibilidad: '🧘'
}
const NIVEL_COLOR = {
  principiante: 'success', intermedio: 'warning', avanzado: 'danger'
}

export default function RutinasPage() {
  const [rutinas,      setRutinas]      = useState([])
  const [loading,      setLoading]      = useState(true)
  const [showForm,     setShowForm]     = useState(false)
  const [editId,       setEditId]       = useState(null)
  const [saving,       setSaving]       = useState(false)
  const [generandoIA,  setGenerandoIA]  = useState(false)
  const [gestorRutina, setGestorRutina] = useState(null)

  const [form, setForm] = useState({
    nombre: '', descripcion: '', objetivo: 'fuerza', nivel: 'principiante', dias_semana: 3
  })

  const load = async () => {
    setLoading(true)
    try {
      const { data } = await api.get('/Rutinas/Rutinas.php')
      setRutinas(data.rutinas ?? [])
    } catch (e) { console.error(e) }
    finally { setLoading(false) }
  }

  useEffect(() => { load() }, [])

  const openCreate = () => {
    setForm({ nombre: '', descripcion: '', objetivo: 'fuerza', nivel: 'principiante', dias_semana: 3 })
    setEditId(null)
    setShowForm(true)
  }

  const openEdit = (r) => {
    setForm({ nombre: r.nombre, descripcion: r.descripcion ?? '', objetivo: r.objetivo, nivel: r.nivel, dias_semana: r.dias_semana })
    setEditId(r.id_rutina)
    setShowForm(true)
  }

  const save = async (e) => {
    e.preventDefault()
    setSaving(true)
    try {
      if (editId) {
        await api.put('/Rutinas/Rutinas.php', { ...form, id_rutina: editId })
      } else {
        await api.post('/Rutinas/Rutinas.php', form)
      }
      setShowForm(false)
      load()
    } catch (err) {
      alert(err.response?.data?.error ?? 'Error al guardar.')
    } finally {
      setSaving(false)
    }
  }

  const generarConIA = async () => {
    if (generandoIA) return
    setGenerandoIA(true)
    try {
      const { data } = await api.post('/IA/GenerarRutina.php', {})
      setRutinas(prev => [data.rutina, ...prev])
      setGestorRutina({ id_rutina: data.rutina.id_rutina, nombre: data.rutina.nombre })
    } catch (err) {
      alert(err.response?.data?.error ?? 'Error al generar la rutina.')
    } finally {
      setGenerandoIA(false)
    }
  }

  const toggle = async (r) => {
    try {
      await api.put('/Rutinas/Rutinas.php', { id_rutina: r.id_rutina, accion: 'toggle' })
      setRutinas(prev => prev.map(x => x.id_rutina === r.id_rutina ? { ...x, activa: !x.activa } : x))
    } catch (e) { console.error(e) }
  }

  const remove = async (r) => {
    if (!confirm(`¿Eliminar "${r.nombre}"?`)) return
    try {
      await api.delete('/Rutinas/Rutinas.php', { data: { id_rutina: r.id_rutina } })
      setRutinas(prev => prev.filter(x => x.id_rutina !== r.id_rutina))
    } catch (e) { console.error(e) }
  }

  const h = (e) => setForm(f => ({ ...f, [e.target.name]: e.target.value }))

  if (gestorRutina) {
    return (
      <GestorDiasRutina
        rutinaId={gestorRutina.id_rutina}
        rutinaNombre={gestorRutina.nombre}
        onClose={() => setGestorRutina(null)}
      />
    )
  }

  return (
    <div className="p-5 md:p-7 max-w-5xl mx-auto animate-fade-up space-y-6">

      {/* ── Header ── */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1
            className="text-4xl font-black"
            style={{ fontFamily: 'Bebas Neue, sans-serif', letterSpacing: '0.04em' }}
          >
            MIS RUTINAS
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            {rutinas.length} rutina{rutinas.length !== 1 ? 's' : ''} guardada{rutinas.length !== 1 ? 's' : ''}
          </p>
        </div>
        <div className="flex gap-2 shrink-0">
          <Button
            onClick={generarConIA}
            disabled={generandoIA}
            variant="outline"
            className="gap-2 border-primary/30 hover:border-primary text-primary"
          >
            {generandoIA
              ? <><Spinner className="w-3.5 h-3.5" /> Generando…</>
              : <><Sparkles className="w-3.5 h-3.5" /> IA</>
            }
          </Button>
          <Button onClick={openCreate} className="gap-2">
            <Plus className="w-4 h-4" /> Nueva
          </Button>
        </div>
      </div>

      {/* Banner generando IA */}
      {generandoIA && (
        <div className="flex items-center gap-3 px-5 py-4 rounded-2xl border border-primary/20 bg-primary/5 animate-fade-up">
          <div className="w-9 h-9 rounded-xl grad-primary flex items-center justify-center shrink-0 animate-pulse-glow">
            <Zap className="w-4 h-4 text-primary-foreground" />
          </div>
          <div>
            <p className="text-sm font-bold text-primary">Generando tu rutina con IA…</p>
            <p className="text-xs text-muted-foreground">Analizando tu perfil. Puede tardar hasta 1 minuto.</p>
          </div>
        </div>
      )}

      {/* ── Formulario inline ── */}
      {showForm && (
        <Card className="border-primary/30 animate-fade-up">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>{editId ? 'Editar rutina' : 'Nueva rutina'}</CardTitle>
              <button
                onClick={() => setShowForm(false)}
                className="text-muted-foreground hover:text-foreground p-1 rounded-lg hover:bg-secondary transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </CardHeader>
          <CardContent>
            <form onSubmit={save} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Nombre *</Label>
                  <Input name="nombre" value={form.nombre} onChange={h} required placeholder="Ej. Full Body 3x" />
                </div>
                <div className="space-y-2">
                  <Label>Días por semana</Label>
                  <Select name="dias_semana" value={form.dias_semana} onChange={h}>
                    {[1,2,3,4,5,6,7].map(d => <option key={d} value={d}>{d} día{d > 1 ? 's' : ''}</option>)}
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Objetivo *</Label>
                  <Select name="objetivo" value={form.objetivo} onChange={h}>
                    {OBJETIVOS.map(o => (
                      <option key={o} value={o}>{OBJ_ICONS[o]} {o.replace('_', ' ')}</option>
                    ))}
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Nivel *</Label>
                  <Select name="nivel" value={form.nivel} onChange={h}>
                    {NIVELES.map(n => <option key={n} value={n} className="capitalize">{n}</option>)}
                  </Select>
                </div>
              </div>
              <div className="space-y-2">
                <Label>Descripción</Label>
                <textarea
                  name="descripcion" value={form.descripcion} onChange={h}
                  placeholder="Describe brevemente el enfoque de la rutina…"
                  rows={2}
                  className="flex w-full rounded-xl border border-input bg-secondary px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring resize-none"
                />
              </div>
              <div className="flex gap-2 justify-end">
                <Button type="button" variant="outline" onClick={() => setShowForm(false)}>Cancelar</Button>
                <Button type="submit" disabled={saving} className="gap-2">
                  {saving ? <Spinner className="w-4 h-4" /> : <Check className="w-4 h-4" />}
                  {editId ? 'Guardar cambios' : 'Crear rutina'}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {/* ── Lista de rutinas ── */}
      {loading ? (
        <div className="flex justify-center py-24">
          <div className="flex flex-col items-center gap-3">
            <div className="w-12 h-12 rounded-2xl grad-primary flex items-center justify-center animate-pulse-glow">
              <Zap className="w-6 h-6 text-primary-foreground" />
            </div>
            <p className="text-xs text-muted-foreground uppercase tracking-widest">Cargando…</p>
          </div>
        </div>
      ) : rutinas.length === 0 ? (
        <EmptyState
          icon={ListChecks}
          title="Sin rutinas aún"
          description="Crea tu primera rutina manualmente o deja que la IA la genere según tu perfil."
          action={
            <div className="flex gap-3 justify-center flex-wrap">
              <Button onClick={generarConIA} disabled={generandoIA} variant="outline" className="gap-2 border-primary/30 text-primary">
                <Sparkles className="w-4 h-4" /> Generar con IA
              </Button>
              <Button onClick={openCreate} className="gap-2">
                <Plus className="w-4 h-4" /> Crear manual
              </Button>
            </div>
          }
        />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {rutinas.map(r => (
            <RutinaCard
              key={r.id_rutina}
              rutina={r}
              onEdit={() => openEdit(r)}
              onToggle={() => toggle(r)}
              onDelete={() => remove(r)}
              onVerDias={() => setGestorRutina({ id_rutina: r.id_rutina, nombre: r.nombre })}
            />
          ))}
        </div>
      )}
    </div>
  )
}

function RutinaCard({ rutina: r, onEdit, onToggle, onDelete, onVerDias }) {
  return (
    <Card className={`group relative transition-all duration-200 ${
      r.activa
        ? 'border-primary/20 hover:border-primary/40'
        : 'opacity-60 hover:opacity-80'
    }`}>
      {/* Tira top de color si activa */}
      {r.activa && (
        <div className="absolute top-0 left-0 right-0 h-0.5 grad-primary rounded-t-2xl" />
      )}

      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3 min-w-0">
          <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-xl shrink-0 ${
            r.activa ? 'bg-primary/10' : 'bg-secondary'
          }`}>
            {OBJ_ICONS[r.objetivo] ?? '🏋️'}
          </div>
          <div className="min-w-0">
            <h3 className="font-bold text-sm leading-tight truncate">{r.nombre}</h3>
            <div className="flex flex-wrap gap-1 mt-1.5">
              <Badge variant={NIVEL_COLOR[r.nivel] ?? 'secondary'} className="capitalize">
                {r.nivel}
              </Badge>
              <Badge variant="secondary" className="capitalize">
                {r.objetivo.replace('_', ' ')}
              </Badge>
              <Badge variant="secondary">
                {r.dias_semana}d/sem
              </Badge>
            </div>
          </div>
        </div>

        <button
          onClick={onToggle}
          className={`shrink-0 transition-all duration-150 mt-0.5 ${
            r.activa ? 'text-primary' : 'text-muted-foreground'
          }`}
        >
          {r.activa
            ? <ToggleRight className="w-7 h-7" />
            : <ToggleLeft className="w-7 h-7" />
          }
        </button>
      </div>

      {r.descripcion && (
        <p className="text-xs text-muted-foreground mt-3 leading-relaxed">{r.descripcion}</p>
      )}

      <div className="flex items-center justify-between mt-4 pt-3 border-t border-border">
        <span className="text-xs text-muted-foreground">
          {r.ejercicios?.length ?? 0} ejercicio{(r.ejercicios?.length ?? 0) !== 1 ? 's' : ''}
          {r.sesiones_completadas > 0 && ` · ${r.sesiones_completadas} sesión${r.sesiones_completadas !== 1 ? 'es' : ''}`}
        </span>
        <div className="flex items-center gap-1">
          <button
            onClick={onVerDias}
            title="Ver días y ejercicios"
            className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs text-muted-foreground hover:text-primary hover:bg-primary/10 transition-all duration-150 font-medium"
          >
            <CalendarDays className="w-3.5 h-3.5" />
            <span>Ver días</span>
          </button>
          <button
            onClick={onEdit}
            className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors"
          >
            <Edit2 className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={onDelete}
            className="p-1.5 rounded-lg text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </Card>
  )
}
