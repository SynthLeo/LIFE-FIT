import { cn } from '@/lib/utils'

/* ── Card ─────────────────────────────────────────────── */
export function Card({ className, children, ...props }) {
  return (
    <div
      className={cn(
        'bg-card border border-border rounded-2xl p-5 relative overflow-hidden',
        'transition-all duration-200',
        className
      )}
      {...props}
    >
      {children}
    </div>
  )
}
export function CardHeader({ className, children }) {
  return <div className={cn('mb-4', className)}>{children}</div>
}
export function CardTitle({ className, children }) {
  return (
    <h3
      className={cn('text-lg font-bold tracking-wide uppercase', className)}
      style={{ fontFamily: 'Bebas Neue, Inter, sans-serif', letterSpacing: '0.05em' }}
    >
      {children}
    </h3>
  )
}
export function CardContent({ className, children }) {
  return <div className={cn('', className)}>{children}</div>
}

/* ── Button ───────────────────────────────────────────── */
const btnVariants = {
  default:     'bg-primary text-primary-foreground hover:bg-primary/90 glow font-bold tracking-wide',
  secondary:   'bg-secondary text-secondary-foreground hover:bg-secondary/80 border border-border',
  ghost:       'hover:bg-secondary hover:text-foreground text-muted-foreground',
  destructive: 'bg-destructive text-destructive-foreground hover:bg-destructive/90',
  outline:     'border border-border hover:border-primary/40 hover:bg-secondary text-foreground',
  fire:        'grad-fire text-white glow-fire font-bold tracking-wide',
}
const btnSizes = {
  default: 'h-10 px-5 py-2 text-sm',
  sm:      'h-7 px-3 text-xs',
  lg:      'h-12 px-7 text-base',
  icon:    'h-10 w-10',
}

export function Button({ variant = 'default', size = 'default', className, disabled, children, ...props }) {
  return (
    <button
      className={cn(
        'inline-flex items-center justify-center gap-2 rounded-xl font-medium transition-all duration-150',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
        'disabled:opacity-50 disabled:pointer-events-none',
        'active:scale-[0.97]',
        btnVariants[variant],
        btnSizes[size],
        className
      )}
      disabled={disabled}
      {...props}
    >
      {children}
    </button>
  )
}

/* ── Badge ────────────────────────────────────────────── */
const badgeVariants = {
  default:   'bg-primary/15 text-primary border-primary/30',
  secondary: 'bg-secondary text-secondary-foreground border-border',
  success:   'bg-emerald-500/15 text-emerald-400 border-emerald-500/30',
  warning:   'bg-amber-500/15 text-amber-400 border-amber-500/30',
  danger:    'bg-red-500/15 text-red-400 border-red-500/30',
}
export function Badge({ variant = 'default', className, children }) {
  return (
    <span
      className={cn(
        'inline-flex items-center px-2.5 py-0.5 rounded-lg text-xs font-semibold border uppercase tracking-wider',
        badgeVariants[variant],
        className
      )}
    >
      {children}
    </span>
  )
}

/* ── Input ────────────────────────────────────────────── */
export function Input({ className, ...props }) {
  return (
    <input
      className={cn(
        'flex h-11 w-full rounded-xl border border-input bg-secondary px-4 py-2',
        'text-sm text-foreground placeholder:text-muted-foreground',
        'focus:outline-none focus:ring-2 focus:ring-ring focus:border-primary/50',
        'transition-all duration-150 disabled:opacity-50',
        className
      )}
      {...props}
    />
  )
}

/* ── Label ────────────────────────────────────────────── */
export function Label({ className, children, ...props }) {
  return (
    <label
      className={cn('text-xs font-semibold text-muted-foreground uppercase tracking-wider', className)}
      {...props}
    >
      {children}
    </label>
  )
}

/* ── Spinner ──────────────────────────────────────────── */
export function Spinner({ className }) {
  return (
    <div className={cn('w-5 h-5 border-2 border-primary/30 border-t-primary rounded-full animate-spin', className)} />
  )
}

/* ── Stat Card ────────────────────────────────────────── */
export function StatCard({ label, value, sub, icon: Icon, className, accent = false }) {
  return (
    <Card
      className={cn(
        'group cursor-default',
        accent && 'border-primary/30 glow-sm',
        className
      )}
    >
      {/* Top strip accent */}
      <div className={cn(
        'absolute top-0 left-0 right-0 h-0.5 rounded-t-2xl transition-all duration-300',
        accent ? 'grad-primary opacity-100' : 'grad-primary opacity-0 group-hover:opacity-100'
      )} />

      <div className="flex items-start gap-3">
        {Icon && (
          <div className={cn(
            'w-10 h-10 rounded-xl flex items-center justify-center shrink-0 transition-all duration-200',
            accent ? 'grad-primary' : 'bg-primary/10 group-hover:bg-primary/20'
          )}>
            <Icon className={cn('w-5 h-5', accent ? 'text-primary-foreground' : 'text-primary')} />
          </div>
        )}
        <div className="flex-1 min-w-0">
          <p
            className="text-2xl font-black leading-none mb-1 animate-count-up"
            style={{ fontFamily: 'Bebas Neue, Inter, sans-serif', letterSpacing: '0.02em' }}
          >
            {value}
          </p>
          <p className="text-xs text-muted-foreground uppercase tracking-wider font-medium">{label}</p>
          {sub && <p className="text-xs text-muted-foreground mt-0.5">{sub}</p>}
        </div>
      </div>
    </Card>
  )
}

/* ── Progress Bar ─────────────────────────────────────── */
export function ProgressBar({ value = 0, max = 100, className, label }) {
  const pct = Math.min(100, Math.round((value / max) * 100))
  return (
    <div className={cn('space-y-1', className)}>
      {label && (
        <div className="flex items-center justify-between">
          <span className="text-xs text-muted-foreground uppercase tracking-wider">{label}</span>
          <span className="text-xs font-bold text-primary">{pct}%</span>
        </div>
      )}
      <div className="h-1.5 bg-secondary rounded-full overflow-hidden">
        <div
          className="h-full grad-primary rounded-full transition-all duration-700 ease-out"
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  )
}

/* ── Empty State ──────────────────────────────────────── */
export function EmptyState({ icon: Icon, title, description, action }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center gap-4">
      {Icon && (
        <div className="w-16 h-16 rounded-2xl bg-secondary flex items-center justify-center">
          <Icon className="w-8 h-8 text-muted-foreground/40" />
        </div>
      )}
      <div>
        <h3 className="font-bold text-foreground mb-1" style={{ fontFamily: 'Bebas Neue, sans-serif', fontSize: '1.25rem', letterSpacing: '0.05em' }}>{title}</h3>
        {description && <p className="text-sm text-muted-foreground max-w-xs">{description}</p>}
      </div>
      {action}
    </div>
  )
}

/* ── Select ───────────────────────────────────────────── */
export function Select({ className, children, ...props }) {
  return (
    <select
      className={cn(
        'flex h-11 w-full rounded-xl border border-input bg-secondary px-4 py-2',
        'text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring',
        'disabled:opacity-50',
        className
      )}
      {...props}
    >
      {children}
    </select>
  )
}

/* ── Divider ──────────────────────────────────────────── */
export function Divider({ label, className }) {
  return (
    <div className={cn('flex items-center gap-3', className)}>
      <div className="flex-1 h-px bg-border" />
      {label && <span className="text-xs text-muted-foreground uppercase tracking-widest">{label}</span>}
      <div className="flex-1 h-px bg-border" />
    </div>
  )
}
