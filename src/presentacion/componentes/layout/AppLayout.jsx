import { NavLink, useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '@/context/AuthContext'
import {
  LayoutDashboard, Dumbbell, BookOpen, BarChart2,
  Users, ListChecks, LogOut, Zap,
  ClipboardList, Brain, Salad, Stethoscope, ChevronRight
} from 'lucide-react'
import { cn } from '@/lib/utils'
import ThemeToggle from '@/presentacion/componentes/ThemeToggle'

const navGroups = [
  {
    label: 'Entrenamiento',
    items: [
      { to: '/dashboard',    label: 'Panel',        icon: LayoutDashboard },
      { to: '/catalogo',     label: 'Catálogo',     icon: BookOpen        },
      { to: '/rutinas',      label: 'Rutinas',      icon: ListChecks      },
      { to: '/entrena',      label: 'Entrenar',     icon: Dumbbell        },
      { to: '/estadisticas', label: 'Estadísticas', icon: BarChart2       },
      { to: '/social',       label: 'Social',       icon: Users           },
      { to: '/cuestionario', label: 'Cuestionario', icon: ClipboardList   },
    ],
  },
  {
    label: 'Salud Integral',
    items: [
      { to: '/clinico',    label: 'Clínico',   icon: Stethoscope },
      { to: '/dieta',      label: 'Nutrición', icon: Salad       },
      { to: '/psicologia', label: 'Psicología',icon: Brain       },
    ],
  },
]

const mobileNav = [
  { to: '/dashboard',  icon: LayoutDashboard, label: 'Panel'   },
  { to: '/entrena',    icon: Dumbbell,        label: 'Entrena' },
  { to: '/rutinas',    icon: ListChecks,      label: 'Rutinas' },
  { to: '/dieta',      icon: Salad,           label: 'Dieta'   },
  { to: '/psicologia', icon: Brain,           label: 'Mente'   },
]

export default function AppLayout({ children }) {
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  const handleLogout = () => { logout(); navigate('/login') }

  const initials = user?.nombre
    ?.split(' ')
    .map(n => n[0])
    .slice(0, 2)
    .join('')
    .toUpperCase() ?? 'LF'

  return (
    <div className="flex h-screen overflow-hidden bg-background">

      {/* ── Sidebar desktop ───────────────────────────── */}
      <aside className="hidden md:flex flex-col w-64 border-r border-border shrink-0 relative">
        <div className="absolute inset-0 diagonal-lines pointer-events-none" />
        <div className="absolute inset-0 bg-card/95 pointer-events-none" />

        {/* Logo */}
        <div className="relative flex items-center gap-3 px-6 py-5 border-b border-border">
          <div className="w-9 h-9 rounded-xl grad-primary flex items-center justify-center glow-sm shrink-0">
            <Zap className="w-5 h-5 text-primary-foreground" strokeWidth={2.5} />
          </div>
          <div className="flex-1">
            <span
              className="text-xl font-black tracking-widest text-foreground"
              style={{ fontFamily: 'Bebas Neue, sans-serif', letterSpacing: '0.12em' }}
            >
              LIFE FIT
            </span>
            <p className="text-[10px] text-muted-foreground uppercase tracking-widest -mt-0.5">Pro</p>
          </div>
          {/* ── Toggle tema en sidebar ── */}
          <ThemeToggle />
        </div>

        {/* Nav groups */}
        <nav className="relative flex-1 px-3 py-4 overflow-y-auto space-y-5">
          {navGroups.map(group => (
            <div key={group.label}>
              <p className="text-[10px] font-bold text-muted-foreground/50 uppercase tracking-[0.18em] px-3 mb-2">
                {group.label}
              </p>
              <div className="space-y-0.5">
                {group.items.map(({ to, label, icon: Icon }) => (
                  <NavLink
                    key={to}
                    to={to}
                    className={({ isActive }) => cn(
                      'flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition-all duration-150 group relative',
                      isActive
                        ? 'bg-primary/10 text-primary font-semibold border border-primary/20'
                        : 'text-muted-foreground hover:text-foreground hover:bg-secondary/80'
                    )}
                  >
                    {({ isActive }) => (
                      <>
                        {isActive && (
                          <div className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-5 grad-primary rounded-r-full" />
                        )}
                        <div className={cn(
                          'w-7 h-7 rounded-lg flex items-center justify-center shrink-0 transition-all duration-150',
                          isActive ? 'grad-primary' : 'bg-secondary group-hover:bg-primary/10'
                        )}>
                          <Icon className={cn(
                            'w-3.5 h-3.5 transition-colors',
                            isActive ? 'text-primary-foreground' : 'text-muted-foreground group-hover:text-primary'
                          )} />
                        </div>
                        <span className="flex-1">{label}</span>
                        {isActive && <ChevronRight className="w-3.5 h-3.5 opacity-50" />}
                      </>
                    )}
                  </NavLink>
                ))}
              </div>
            </div>
          ))}
        </nav>

        {/* User footer */}
        <div className="relative px-3 pb-4 border-t border-border pt-3 space-y-1">
          <div className="flex items-center gap-3 px-3 py-2.5 rounded-xl bg-secondary/50">
            <div className="w-8 h-8 rounded-xl grad-primary flex items-center justify-center text-primary-foreground font-bold text-xs shrink-0">
              {initials}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold truncate">{user?.nombre ?? 'Usuario'}</p>
              <div className="flex items-center gap-1.5">
                <div className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
                <p className="text-[10px] text-muted-foreground uppercase tracking-wider">Activo</p>
              </div>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-all duration-150"
          >
            <LogOut className="w-4 h-4" />
            Cerrar sesión
          </button>
        </div>
      </aside>

      {/* ── Mobile top bar ────────────────────────────── */}
      <div className="md:hidden fixed top-0 left-0 right-0 z-50 bg-card/90 backdrop-blur-lg border-b border-border px-4 h-14 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-lg grad-primary flex items-center justify-center">
            <Zap className="w-3.5 h-3.5 text-primary-foreground" strokeWidth={2.5} />
          </div>
          <span
            className="font-black tracking-widest"
            style={{ fontFamily: 'Bebas Neue, sans-serif', fontSize: '1rem', letterSpacing: '0.12em' }}
          >
            LIFE FIT
          </span>
        </div>

        {/* ── Toggle tema en mobile + avatar ── */}
        <div className="flex items-center gap-2.5">
          <ThemeToggle />
          <div className="w-7 h-7 rounded-lg grad-primary flex items-center justify-center text-primary-foreground font-bold text-[10px]">
            {initials}
          </div>
        </div>
      </div>

      {/* ── Main content ──────────────────────────────── */}
      <main className="flex-1 overflow-y-auto md:pt-0 pt-14 pb-20 md:pb-0">
        {children}
      </main>

      {/* ── Mobile bottom nav ─────────────────────────── */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-card/90 backdrop-blur-lg border-t border-border z-50">
        <div className="grid grid-cols-5 h-16">
          {mobileNav.map(({ to, icon: Icon, label }) => (
            <NavLink
              key={to}
              to={to}
              className={({ isActive }) => cn(
                'flex flex-col items-center justify-center gap-1 transition-all duration-150',
                isActive ? 'text-primary' : 'text-muted-foreground'
              )}
            >
              {({ isActive }) => (
                <>
                  <div className={cn(
                    'w-9 h-6 rounded-lg flex items-center justify-center transition-all duration-150',
                    isActive ? 'grad-primary' : ''
                  )}>
                    <Icon className={cn('w-4 h-4', isActive ? 'text-primary-foreground' : '')} />
                  </div>
                  <span className="text-[9px] uppercase tracking-wider font-semibold">{label}</span>
                </>
              )}
            </NavLink>
          ))}
        </div>
      </nav>
    </div>
  )
}