import { useEffect, useState } from 'react'
import { useAuth } from '@/context/AuthContext'
import {
  Card, CardHeader, CardTitle, CardContent,
  StatCard, Spinner, Badge, ProgressBar
} from '@/presentacion/componentes/ui'
import {
  Flame, Dumbbell, Clock, TrendingUp,
  ChevronRight, Calendar, Zap, Target,
  Play, BarChart2, BookOpen, ClipboardList
} from 'lucide-react'
import { Link } from 'react-router-dom'
import api from '@/lib/api'

const GREET = () => {
  const h = new Date().getHours()
  if (h < 12) return '¡Buenos días'
  if (h < 19) return '¡Buenas tardes'
  return '¡Buenas noches'
}

export default function DashboardPage() {
  const { user } = useAuth()
  const [data, setData]       = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError]     = useState('')

  useEffect(() => {
    api.get('/PanelControl/ObtenerPanel.php')
      .then(r => setData(r.data))
      .catch(e => setError(e.response?.data?.error ?? 'Error al cargar panel.'))
      .finally(() => setLoading(false))
  }, [])

  if (loading) return (
    <div className="flex items-center justify-center h-full min-h-screen">
      <div className="flex flex-col items-center gap-3">
        <div className="w-12 h-12 rounded-2xl grad-primary flex items-center justify-center animate-pulse-glow">
          <Zap className="w-6 h-6 text-primary-foreground" />
        </div>
        <p className="text-xs text-muted-foreground uppercase tracking-widest">Cargando...</p>
      </div>
    </div>
  )

  if (error) return (
    <div className="p-6 text-destructive">{error}</div>
  )

  const { stats, ultima_sesion, usuario } = data ?? {}

  const nivelColor = {
    principiante: 'success',
    intermedio:   'warning',
    avanzado:     'danger',
  }[usuario?.nivel_entrenamiento] ?? 'secondary'

  const nombre = usuario?.nombre?.split(' ')[0] ?? user?.nombre ?? 'Atleta'

  return (
    <div className="p-5 md:p-7 max-w-5xl mx-auto space-y-7 animate-fade-up">

      {/* ── Header hero ─────────────────────────────── */}
      <div className="relative rounded-2xl overflow-hidden border border-border">
        {/* Fondo */}
        <div className="absolute inset-0 bg-card diagonal-lines" />
        <div
          className="absolute inset-0 pointer-events-none"
          style={{ background: 'radial-gradient(ellipse at 80% 50%, hsl(158 100% 45% / 0.08) 0%, transparent 70%)' }}
        />

        <div className="relative p-6 md:p-8 flex items-start justify-between gap-4">
          <div className="space-y-1">
            <p className="text-xs text-muted-foreground uppercase tracking-widest font-medium">
              {new Date().toLocaleDateString('es-MX', { weekday: 'long', day: 'numeric', month: 'long' })}
            </p>
            <h1
              className="text-4xl md:text-5xl font-black leading-[1.0]"
              style={{ fontFamily: 'Bebas Neue, sans-serif', letterSpacing: '0.04em' }}
            >
              {GREET()},<br />
              <span className="text-primary">{nombre}!</span>
            </h1>
            <p className="text-sm text-muted-foreground pt-1">
              {stats?.racha > 0
                ? `🔥 Llevas ${stats.racha} días en racha. ¡No pares!`
                : 'Aquí está tu resumen de hoy.'}
            </p>
          </div>

          <div className="flex items-start gap-2 shrink-0">
            <Badge variant={nivelColor} className="capitalize">
              {usuario?.nivel_entrenamiento ?? '—'}
            </Badge>
          </div>
        </div>

        {/* CTA entrenar */}
        <div className="relative px-6 md:px-8 pb-6 md:pb-8">
          <Link to="/entrena">
            <button className="flex items-center gap-2.5 bg-primary text-primary-foreground px-6 py-3 rounded-xl font-bold text-sm glow hover:bg-primary/90 transition-all duration-150 active:scale-[0.97]">
              <Play className="w-4 h-4 fill-current" />
              Iniciar entrenamiento
            </button>
          </Link>
        </div>
      </div>

      {/* ── KPI grid ─────────────────────────────────── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="animate-fade-up delay-100">
          <StatCard
            label="Sesiones"
            value={stats?.sesiones ?? 0}
            icon={Dumbbell}
          />
        </div>
        <div className="animate-fade-up delay-200">
          <StatCard
            label="Minutos activo"
            value={`${stats?.minutos ?? 0}'`}
            icon={Clock}
          />
        </div>
        <div className="animate-fade-up delay-300">
          <StatCard
            label="Volumen total"
            value={`${stats?.volumen ?? 0}kg`}
            icon={TrendingUp}
          />
        </div>
        <div className="animate-fade-up delay-400">
          <StatCard
            label="Racha actual"
            value={`${stats?.racha ?? 0}`}
            icon={Flame}
            accent={stats?.racha > 0}
          />
        </div>
      </div>

      {/* ── Última sesión + progreso ──────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">

        {/* Última sesión */}
        {ultima_sesion ? (
          <Card className="hover:border-primary/20 transition-all duration-200">
            <CardHeader>
              <CardTitle>Última sesión</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center shrink-0">
                    <Dumbbell className="w-6 h-6 text-primary" />
                  </div>
                  <div>
                    <p className="font-bold">{ultima_sesion.ejercicio ?? 'Sesión de entrenamiento'}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <Calendar className="w-3 h-3 text-muted-foreground" />
                      <p className="text-xs text-muted-foreground">{ultima_sesion.fecha}</p>
                      {ultima_sesion.duracion_minutos > 0 && (
                        <span className="text-xs text-muted-foreground">· {ultima_sesion.duracion_minutos} min</span>
                      )}
                    </div>
                  </div>
                </div>
                <Link
                  to="/entrena"
                  className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center text-primary hover:bg-primary/20 transition-colors"
                >
                  <ChevronRight className="w-4 h-4" />
                </Link>
              </div>
            </CardContent>
          </Card>
        ) : (
          <Card className="border-dashed animate-border-pulse">
            <CardContent>
              <div className="flex items-center justify-between py-2">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-secondary flex items-center justify-center">
                    <Dumbbell className="w-6 h-6 text-muted-foreground" />
                  </div>
                  <div>
                    <p className="font-bold">Sin sesiones aún</p>
                    <p className="text-sm text-muted-foreground">¡Empieza tu primera sesión hoy!</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Objetivo semanal */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="w-4 h-4 text-primary" />
              Objetivo semanal
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <ProgressBar
              label="Sesiones (3/5)"
              value={stats?.sesiones_semana ?? 3}
              max={5}
            />
            <ProgressBar
              label="Minutos (120/200)"
              value={stats?.minutos_semana ?? 120}
              max={200}
            />
            <ProgressBar
              label="Racha personal"
              value={stats?.racha ?? 0}
              max={30}
            />
          </CardContent>
        </Card>
      </div>

      {/* ── Módulos de salud ─────────────────────────── */}
      <div>
        <h2
          className="text-sm font-bold uppercase tracking-widest text-muted-foreground mb-3"
          style={{ fontFamily: 'Bebas Neue, sans-serif', letterSpacing: '0.1em' }}
        >
          Módulos de Salud Integral
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {[
            {
              to: '/clinico', icon: '🩺', label: 'Clínico',
              color: '#0ea5e9', desc: 'Signos vitales, síntomas y consultas',
            },
            {
              to: '/dieta', icon: '🥗', label: 'Nutrición',
              color: '#22c55e', desc: 'Plan semanal IA y registro diario',
            },
            {
              to: '/psicologia', icon: '🧠', label: 'Psicología',
              color: '#a78bfa', desc: 'Bienestar emocional y apoyo',
            },
          ].map(({ to, icon, label, color, desc }) => (
            <Link key={to} to={to} className="group">
              <div
                className="relative bg-card border border-border rounded-2xl p-4 hover:scale-[1.02] transition-all duration-200 active:scale-[0.97] overflow-hidden"
                style={{ borderColor: `${color}20` }}
              >
                <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-200" style={{ background: `radial-gradient(ellipse at top left, ${color}10, transparent 70%)` }} />
                <div className="relative flex items-start gap-3">
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center text-xl shrink-0" style={{ background: `${color}15` }}>
                    {icon}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-sm" style={{ color }}>{label}</p>
                    <p className="text-xs text-muted-foreground mt-0.5 leading-relaxed">{desc}</p>
                  </div>
                  <ChevronRight className="w-4 h-4 shrink-0 mt-1 opacity-30 group-hover:opacity-70 transition-opacity" style={{ color }} />
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>

      {/* ── Quick links ──────────────────────────────── */}
      <div>
        <h2
          className="text-sm font-bold uppercase tracking-widest text-muted-foreground mb-3"
          style={{ fontFamily: 'Bebas Neue, sans-serif', letterSpacing: '0.1em' }}
        >
          Accesos Rápidos
        </h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            { to: '/catalogo',     icon: BookOpen,      label: 'Catálogo',      sub: 'Ejercicios',   color: 'from-emerald-500/10' },
            { to: '/rutinas',      icon: ClipboardList, label: 'Rutinas',       sub: 'Mis planes',   color: 'from-blue-500/10'    },
            { to: '/estadisticas', icon: BarChart2,     label: 'Estadísticas',  sub: 'Mi progreso',  color: 'from-purple-500/10'  },
            { to: '/cuestionario', icon: Target,        label: 'Perfil',        sub: 'Re-evaluar',   color: 'from-amber-500/10'   },
          ].map(({ to, icon: Icon, label, sub, color }) => (
            <Link key={to} to={to} className="group">
              <div className={`
                relative bg-card border border-border rounded-2xl p-4
                hover:border-primary/30 transition-all duration-200
                overflow-hidden cursor-pointer
                active:scale-[0.97]
              `}>
                {/* Fondo degradado sutil */}
                <div className={`absolute inset-0 bg-gradient-to-br ${color} to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-200`} />

                <div className="relative">
                  <div className="w-9 h-9 rounded-xl bg-secondary group-hover:bg-primary/10 flex items-center justify-center mb-3 transition-colors duration-200">
                    <Icon className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors" />
                  </div>
                  <p className="text-sm font-bold text-foreground">{label}</p>
                  <p className="text-xs text-muted-foreground">{sub}</p>
                </div>

                <ChevronRight className="absolute right-3 bottom-3 w-3.5 h-3.5 text-muted-foreground/30 group-hover:text-primary/50 transition-colors" />
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  )
}
