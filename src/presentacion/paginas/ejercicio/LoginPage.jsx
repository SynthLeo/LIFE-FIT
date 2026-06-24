import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '@/context/AuthContext'
import { Button, Input, Label, Spinner } from '@/presentacion/componentes/ui'
import { Zap, Eye, EyeOff, ArrowRight } from 'lucide-react'

export default function LoginPage() {
  const { login } = useAuth()
  const navigate  = useNavigate()

  const [form, setForm]       = useState({ email: '', password: '' })
  const [error, setError]     = useState('')
  const [loading, setLoading] = useState(false)
  const [showPw, setShowPw]   = useState(false)

  const handle = (e) => setForm(f => ({ ...f, [e.target.name]: e.target.value }))

  const submit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const user = await login(form.email, form.password)
      navigate(user.onboarding_completo ? '/dashboard' : '/onboarding', { replace: true })
    } catch (err) {
      setError(err.response?.data?.error ?? 'Error al iniciar sesión.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex bg-background">

      {/* ── Panel izquierdo visual ─── */}
      <div className="hidden lg:flex flex-col justify-between w-[48%] relative overflow-hidden p-12">
        {/* Fondo oscuro con degradado */}
        <div className="absolute inset-0 bg-card" />
        <div className="absolute inset-0 diagonal-lines" />

        {/* Glow decorativo */}
        <div
          className="absolute -top-40 -left-40 w-[500px] h-[500px] rounded-full pointer-events-none"
          style={{ background: 'radial-gradient(circle, hsl(158 100% 45% / 0.12) 0%, transparent 70%)' }}
        />
        <div
          className="absolute -bottom-40 -right-20 w-[400px] h-[400px] rounded-full pointer-events-none"
          style={{ background: 'radial-gradient(circle, hsl(158 100% 45% / 0.07) 0%, transparent 70%)' }}
        />

        {/* Logo */}
        <div className="relative flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl grad-primary flex items-center justify-center glow-sm">
            <Zap className="w-5 h-5 text-primary-foreground" strokeWidth={2.5} />
          </div>
          <span
            className="text-2xl font-black tracking-widest"
            style={{ fontFamily: 'Bebas Neue, sans-serif', letterSpacing: '0.12em' }}
          >
            LIFE FIT
          </span>
        </div>

        {/* Cita central */}
        <div className="relative space-y-6">
          {/* Número decorativo */}
          <div
            className="text-[120px] font-black leading-none select-none pointer-events-none"
            style={{
              fontFamily: 'Bebas Neue, sans-serif',
              color: 'transparent',
              WebkitTextStroke: '1px hsl(158 100% 45% / 0.15)',
            }}
          >
            LF
          </div>

          <div className="space-y-3 -mt-8">
            <p
              className="text-5xl font-black leading-[1.0] text-foreground"
              style={{ fontFamily: 'Bebas Neue, sans-serif', letterSpacing: '0.04em' }}
            >
              TRANSFORMA<br />
              <span className="text-primary">TU CUERPO</span>
            </p>
            <p className="text-muted-foreground text-base max-w-xs leading-relaxed">
              Rutinas inteligentes, seguimiento real y un plan que se adapta a ti.
            </p>
          </div>

          {/* Stats decorativas */}
          <div className="grid grid-cols-3 gap-4 pt-2">
            {[
              { val: '500+', label: 'Ejercicios' },
              { val: '98%', label: 'Adherencia' },
              { val: '4.9★', label: 'Valoración' },
            ].map(({ val, label }) => (
              <div key={label} className="bg-secondary/50 border border-border rounded-xl p-3 text-center">
                <p
                  className="text-xl font-black text-primary"
                  style={{ fontFamily: 'Bebas Neue, sans-serif', letterSpacing: '0.04em' }}
                >
                  {val}
                </p>
                <p className="text-[10px] text-muted-foreground uppercase tracking-wider">{label}</p>
              </div>
            ))}
          </div>
        </div>

        <p className="relative text-xs text-muted-foreground/40">© 2025 Life Fit. Todos los derechos reservados.</p>
      </div>

      {/* ── Panel derecho — formulario ─── */}
      <div className="flex-1 flex items-center justify-center p-6 relative">
        {/* Glow muy sutil */}
        <div
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 rounded-full pointer-events-none"
          style={{ background: 'radial-gradient(circle, hsl(158 100% 45% / 0.04) 0%, transparent 70%)' }}
        />

        <div className="w-full max-w-sm animate-fade-up relative">

          {/* Logo mobile */}
          <div className="flex items-center gap-2.5 mb-10 lg:hidden">
            <div className="w-9 h-9 rounded-xl grad-primary flex items-center justify-center">
              <Zap className="w-4.5 h-4.5 text-primary-foreground" strokeWidth={2.5} />
            </div>
            <span
              className="text-xl font-black tracking-widest"
              style={{ fontFamily: 'Bebas Neue, sans-serif', letterSpacing: '0.12em' }}
            >
              LIFE FIT
            </span>
          </div>

          {/* Encabezado */}
          <div className="mb-8">
            <h1
              className="text-4xl font-black mb-2 text-foreground"
              style={{ fontFamily: 'Bebas Neue, sans-serif', letterSpacing: '0.04em' }}
            >
              BIENVENIDO
            </h1>
            <p className="text-sm text-muted-foreground">Ingresa para continuar tu progreso.</p>
          </div>

          {/* Formulario */}
          <form onSubmit={submit} className="space-y-5">
            <div className="space-y-2">
              <Label htmlFor="email">Correo electrónico</Label>
              <Input
                id="email" name="email" type="email"
                placeholder="tu@correo.com"
                value={form.email} onChange={handle}
                required autoComplete="email"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Contraseña</Label>
              <div className="relative">
                <Input
                  id="password" name="password"
                  type={showPw ? 'text' : 'password'}
                  placeholder="••••••••"
                  value={form.password} onChange={handle}
                  required autoComplete="current-password"
                  className="pr-11"
                />
                <button
                  type="button"
                  onClick={() => setShowPw(v => !v)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                >
                  {showPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {error && (
              <div className="flex items-start gap-2.5 text-sm text-destructive bg-destructive/10 border border-destructive/20 rounded-xl px-4 py-3">
                <span className="shrink-0 mt-0.5">⚠</span>
                <p>{error}</p>
              </div>
            )}

            <Button type="submit" className="w-full" size="lg" disabled={loading}>
              {loading
                ? <Spinner className="w-4 h-4" />
                : <>Iniciar sesión <ArrowRight className="w-4 h-4" /></>
              }
            </Button>
          </form>

          {/* Divisor */}
          <div className="flex items-center gap-3 my-6">
            <div className="flex-1 h-px bg-border" />
            <span className="text-xs text-muted-foreground">o</span>
            <div className="flex-1 h-px bg-border" />
          </div>

          <p className="text-center text-sm text-muted-foreground">
            ¿No tienes cuenta?{' '}
            <Link to="/registro" className="text-primary font-semibold hover:underline underline-offset-2">
              Regístrate gratis
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
