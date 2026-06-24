import { useEffect, useState, useCallback } from 'react'
import api from '@/lib/api'
import { Card, Button, Badge, Input, Select, Spinner, EmptyState } from '@/presentacion/componentes/ui'
import { Search, Heart, Dumbbell, Filter, X } from 'lucide-react'
import { cn } from '@/lib/utils'

const nivelColor = { principiante: 'success', intermedio: 'warning', avanzado: 'danger' }

/* ── Placeholder visual por grupo muscular ──────────────────── */
const GRUPO_CONFIG = {
  pecho:    { emoji: '🫁', color: 'from-rose-500/20 to-red-500/10',    label: 'Pecho' },
  espalda:  { emoji: '🔙', color: 'from-blue-500/20 to-indigo-500/10', label: 'Espalda' },
  piernas:  { emoji: '🦵', color: 'from-orange-500/20 to-amber-500/10',label: 'Piernas' },
  hombros:  { emoji: '💪', color: 'from-violet-500/20 to-purple-500/10',label: 'Hombros' },
  biceps:   { emoji: '💪', color: 'from-green-500/20 to-emerald-500/10',label: 'Bíceps' },
  triceps:  { emoji: '💪', color: 'from-teal-500/20 to-cyan-500/10',   label: 'Tríceps' },
  brazos:   { emoji: '💪', color: 'from-cyan-500/20 to-sky-500/10',    label: 'Brazos' },
  core:     { emoji: '⚡', color: 'from-yellow-500/20 to-lime-500/10', label: 'Core' },
  abdomen:  { emoji: '⚡', color: 'from-yellow-500/20 to-lime-500/10', label: 'Abdomen' },
  gluteos:  { emoji: '🍑', color: 'from-pink-500/20 to-rose-500/10',   label: 'Glúteos' },
  cardio:   { emoji: '❤️', color: 'from-red-500/20 to-orange-500/10',  label: 'Cardio' },
}

function getGrupoConfig(grupo) {
  const key = grupo?.toLowerCase().replace(/[áéíóúü]/g, c =>
    ({ á:'a',é:'e',í:'i',ó:'o',ú:'u',ü:'u' }[c] ?? c)
  )
  return GRUPO_CONFIG[key] ?? { emoji: '🏋️', color: 'from-secondary to-secondary/50', label: grupo }
}

export default function CatalogoPage() {
  const [ejercicios, setEjercicios] = useState([])
  const [grupos, setGrupos]         = useState([])
  const [total, setTotal]           = useState(0)
  const [loading, setLoading]       = useState(true)
  const [filters, setFilters]       = useState({ q: '', grupo: '', nivel: '', favoritos: false })
  const [toggling, setToggling]     = useState(null)
  const [imgErrors, setImgErrors]   = useState({})   // ids con imagen rota

  const loadData = useCallback(async () => {
    setLoading(true)
    try {
      const params = { limit: 100 }
      if (filters.q)         params.q        = filters.q
      if (filters.grupo)     params.grupo     = filters.grupo
      if (filters.nivel)     params.nivel     = filters.nivel
      if (filters.favoritos) params.favoritos = 1

      const { data } = await api.get('/Catalogo/ObtenerCatalogo.php', { params })
      setEjercicios(data.ejercicios ?? [])
      setTotal(data.total ?? (data.ejercicios ?? []).length)

      // Normalizar grupos: eliminar duplicados por capitalización
      const rawGrupos = data.grupos ?? []
      const seen = new Set()
      const normGrupos = rawGrupos.filter(g => {
        const k = g.toLowerCase()
        if (seen.has(k)) return false
        seen.add(k)
        return true
      })
      setGrupos(normGrupos)
    } catch (e) {
      console.error(e)
    } finally {
      setLoading(false)
    }
  }, [filters])

  useEffect(() => {
    const t = setTimeout(loadData, filters.q ? 400 : 0)
    return () => clearTimeout(t)
  }, [loadData])

  const toggleFav = async (ej) => {
    setToggling(ej.id_ejercicio)
    try {
      if (ej.es_favorito) {
        await api.delete('/Catalogo/Favoritos.php', { data: { ejercicio_id: ej.id_ejercicio } })
      } else {
        await api.post('/Catalogo/Favoritos.php', { ejercicio_id: ej.id_ejercicio })
      }
      setEjercicios(prev => prev.map(e =>
        e.id_ejercicio === ej.id_ejercicio ? { ...e, es_favorito: !e.es_favorito } : e
      ))
    } catch (e) {
      console.error(e)
    } finally {
      setToggling(null)
    }
  }

  const handleImgError = (id) => setImgErrors(prev => ({ ...prev, [id]: true }))

  const clearFilters = () => setFilters({ q: '', grupo: '', nivel: '', favoritos: false })
  const hasFilters   = filters.q || filters.grupo || filters.nivel || filters.favoritos

  return (
    <div className="p-6 max-w-6xl mx-auto animate-fade-up">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold" style={{ fontFamily: 'Bebas Neue, sans-serif' }}>Catálogo</h1>
          <p className="text-muted-foreground text-sm mt-1">
            {loading ? 'Cargando…' : `${ejercicios.length}${total > ejercicios.length ? ` de ${total}` : ''} ejercicios`}
          </p>
        </div>
      </div>

      {/* Filtros */}
      <div className="flex flex-wrap gap-3 mb-6">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Buscar ejercicio…"
            value={filters.q}
            onChange={e => setFilters(f => ({ ...f, q: e.target.value }))}
            className="pl-9"
          />
        </div>

        <Select value={filters.grupo} onChange={e => setFilters(f => ({ ...f, grupo: e.target.value }))} className="w-44">
          <option value="">Todos los grupos</option>
          {grupos.map(g => {
            const cfg = getGrupoConfig(g)
            return <option key={g} value={g}>{cfg.emoji} {cfg.label || g}</option>
          })}
        </Select>

        <Select value={filters.nivel} onChange={e => setFilters(f => ({ ...f, nivel: e.target.value }))} className="w-36">
          <option value="">Todos los niveles</option>
          <option value="principiante">🟢 Principiante</option>
          <option value="intermedio">🟡 Intermedio</option>
          <option value="avanzado">🔴 Avanzado</option>
        </Select>

        <Button
          variant={filters.favoritos ? 'default' : 'outline'}
          onClick={() => setFilters(f => ({ ...f, favoritos: !f.favoritos }))}
          className="gap-2"
        >
          <Heart className={cn('w-4 h-4', filters.favoritos && 'fill-current')} />
          Favoritos
        </Button>

        {hasFilters && (
          <Button variant="ghost" onClick={clearFilters} className="gap-1 text-muted-foreground">
            <X className="w-3.5 h-3.5" /> Limpiar
          </Button>
        )}
      </div>

      {/* Grid */}
      {loading ? (
        <div className="flex justify-center py-24"><Spinner className="w-8 h-8" /></div>
      ) : ejercicios.length === 0 ? (
        <EmptyState
          icon={Dumbbell}
          title="Sin resultados"
          description="Intenta ajustar los filtros."
          action={<Button variant="outline" onClick={clearFilters}>Ver todos</Button>}
        />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {ejercicios.map(ej => (
            <ExerciseCard
              key={ej.id_ejercicio}
              ej={ej}
              imgError={!!imgErrors[ej.id_ejercicio]}
              onImgError={() => handleImgError(ej.id_ejercicio)}
              onToggleFav={toggleFav}
              loadingFav={toggling === ej.id_ejercicio}
            />
          ))}
        </div>
      )}
    </div>
  )
}

function ExerciseCard({ ej, imgError, onImgError, onToggleFav, loadingFav }) {
  const cfg = getGrupoConfig(ej.grupo_muscular)
  const showPlaceholder = !ej.imagen_url || imgError

  return (
    <Card className="group hover:border-primary/30 transition-all duration-200 flex flex-col gap-3 p-0 overflow-hidden">
      {/* Imagen / Placeholder */}
      <div className="relative w-full h-36 overflow-hidden">
        {showPlaceholder ? (
          /* Placeholder con gradiente + emoji por grupo */
          <div className={cn(
            'w-full h-full flex flex-col items-center justify-center gap-2',
            'bg-gradient-to-br', cfg.color
          )}>
            <span className="text-4xl select-none" role="img" aria-label={cfg.label}>
              {cfg.emoji}
            </span>
            <span className="text-[10px] font-medium text-muted-foreground uppercase tracking-widest">
              {cfg.label}
            </span>
          </div>
        ) : (
          <img
            src={ej.imagen_url}
            alt={ej.nombre}
            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
            onError={onImgError}
          />
        )}

        {/* Botón favorito */}
        <button
          onClick={() => onToggleFav(ej)}
          disabled={loadingFav}
          className={cn(
            'absolute top-2 right-2 w-7 h-7 rounded-full flex items-center justify-center transition-all',
            ej.es_favorito
              ? 'bg-red-500/20 text-red-400 hover:bg-red-500/30'
              : 'bg-black/40 text-white/60 hover:text-red-400 hover:bg-black/60'
          )}
        >
          {loadingFav
            ? <Spinner className="w-3 h-3 border-white/50 border-t-white" />
            : <Heart className={cn('w-3.5 h-3.5', ej.es_favorito && 'fill-current')} />
          }
        </button>

        {/* Badge incompatible */}
        {!ej.compatible && (
          <span className="absolute bottom-2 left-2 bg-yellow-500/90 text-black text-[10px] font-bold px-1.5 py-0.5 rounded">
            Equipo requerido
          </span>
        )}
      </div>

      {/* Info */}
      <div className="flex-1 px-4 pb-4">
        <h3 className="font-semibold text-sm leading-tight mb-2">{ej.nombre}</h3>
        {ej.descripcion && (
          <p className="text-xs text-muted-foreground mb-2 line-clamp-2">{ej.descripcion}</p>
        )}
        <div className="flex flex-wrap gap-1">
          <Badge variant={nivelColor[ej.nivel_dificultad] ?? 'secondary'} className="capitalize text-[10px]">
            {ej.nivel_dificultad}
          </Badge>
          <Badge variant="secondary" className="text-[10px]">
            {cfg.emoji} {cfg.label || ej.grupo_muscular}
          </Badge>
        </div>
      </div>
    </Card>
  )
}