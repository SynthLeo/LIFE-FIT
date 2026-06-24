import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '@/context/AuthContext'
import { Button, Input, Label, Spinner } from '@/presentacion/componentes/ui'
import { Zap, Eye, EyeOff, ArrowRight, CheckCircle2 } from 'lucide-react'

export default function RegistroPage() {
  const { register } = useAuth()
  const navigate = useNavigate()

  const [form, setForm]       = useState({ nombre: '', email: '', password: '', password2: '' })
  const [error, setError]     = useState('')
  const [loading, setLoading] = useState(false)
  const [showPw, setShowPw]   = useState(false)

  const handle = (e) => setForm(f => ({ ...f, [e.target.name]: e.target.value }))

  const submit = async (e) => {
    e.preventDefault()
    setError('')
    if (form.password !== form.password2) { setError('Las contraseñas no coinciden.'); return }
    setLoading(true)
    try {
      await register(form.nombre, form.email, form.password, form.password2)
      navigate('/onboarding', { replace: true })
    } catch (err) {
      setError(err.response?.data?.error ?? 'Error al registrarse.')
    } finally {
      setLoading(false)
    }
  }

  const strength = (() => {
    const p = form.password
    if (!p) return 0
    let s = 0
    if (p.length >= 8) s++
    if (/[A-Z]/.test(p)) s++
    if (/[0-9]/.test(p)) s++
    if (/[^A-Za-z0-9]/.test(p)) s++
    return s
  })()

  const strengthColors = ['bg-muted', 'bg-red-500', 'bg-yellow-500', 'bg-blue-500', 'bg-primary']
  const strengthLabels = ['', 'Débil', 'Regular', 'Buena', 'Fuerte']

  return (
    <div className="min-h-screen flex bg-background">

      {/* ── Panel izquierdo visual ─── */}
      <div className="hidden lg:flex flex-col justify-between w-[48%] relative overflow-hidden p-12">
        <div className="absolute inset-0 bg-card" />
        <div className="absolute inset-0 diagonal-lines" />
        <div
          className="absolute -top-40 -right-20 w-[500px] h-[500px] rounded-full pointer-events-none"
          style={{ background: 'radial-gradient(circle, hsl(158 100% 45% / 0.10) 0%, transparent 70%)' }}
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

        {/* Contenido central */}
        <div className="relative space-y-8">
          <div>
            <p
              className="text-5xl font-black leading-[1.0] text-foreground mb-3"
              style={{ fontFamily: 'Bebas Neue, sans-serif', letterSpacing: '0.04em' }}
            >
              EMPIEZA<br />
              <span className="text-primary">HOY MISMO</span>
            </p>
            <p className="text-muted-foreground text-base leading-relaxed max-w-xs">
              Únete a miles de personas que ya transformaron su cuerpo y mente con Life Fit.
            </p>
          </div>

          {/* Beneficios */}
          <div className="space-y-3">
            {[
              'Rutinas personalizadas con IA',
              'Seguimiento clínico y nutricional',
              'Estadísticas de progreso en tiempo real',
              '100% gratis para empezar',
            ].map((item) => (
              <div key={item} className="flex items-center gap-3">
                <div className="w-5 h-5 rounded-full grad-primary flex items-center justify-center shrink-0">
                  <CheckCircle2 className="w-3 h-3 text-primary-foreground" />
                </div>
                <p className="text-sm text-muted-foreground">{item}</p>
              </div>
            ))}
          </div>
        </div>

        <p className="relative text-xs text-muted-foreground/40">© 2025 Life Fit. Todos los derechos reservados.</p>
      </div>

      {/* ── Panel derecho — formulario ─── */}
      <div className="flex-1 flex items-center justify-center p-6 relative overflow-y-auto">
        <div
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 rounded-full pointer-events-none"
          style={{ background: 'radial-gradient(circle, hsl(158 100% 45% / 0.04) 0%, transparent 70%)' }}
        />

        <div className="w-full max-w-sm animate-fade-up relative py-8">

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

          <div className="mb-8">
            <h1
              className="text-4xl font-black mb-2 text-foreground"
              style={{ fontFamily: 'Bebas Neue, sans-serif', letterSpacing: '0.04em' }}
            >
              CREA TU CUENTA
            </h1>
            <p className="text-sm text-muted-foreground">Gratis. Sin trampa. Sin tarjeta.</p>
          </div>

          <form onSubmit={submit} className="space-y-4">
            <div className="space-y-2">
              <Label>Nombre completo</Label>
              <Input name="nombre" placeholder="Tu nombre" value={form.nombre} onChange={handle} required />
            </div>

            <div className="space-y-2">
              <Label>Correo electrónico</Label>
              <Input name="email" type="email" placeholder="tu@correo.com" value={form.email} onChange={handle} required />
            </div>

            <div className="space-y-2">
              <Label>Contraseña</Label>
              <div className="relative">
                <Input
                  name="password" type={showPw ? 'text' : 'password'}
                  placeholder="Mínimo 8 caracteres"
                  value={form.password} onChange={handle}
                  required className="pr-11"
                />
                <button
                  type="button" onClick={() => setShowPw(v => !v)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                >
                  {showPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {/* Barra de fortaleza */}
              {form.password && (
                <div className="space-y-1.5">
                  <div className="flex gap-1">
                    {[1, 2, 3, 4].map(i => (
                      <div
                        key={i}
                        className={`h-1 flex-1 rounded-full transition-all duration-300 ${i <= strength ? strengthColors[strength] : 'bg-muted'}`}
                      />
                    ))}
                  </div>
                  <p className="text-[10px] text-muted-foreground uppercase tracking-wider">
                    Fortaleza: <span className="text-foreground font-semibold">{strengthLabels[strength]}</span>
                  </p>
                </div>
              )}
            </div>

            <div className="space-y-2">
              <Label>Confirmar contraseña</Label>
              <Input
                name="password2" type={showPw ? 'text' : 'password'}
                placeholder="Repite tu contraseña"
                value={form.password2} onChange={handle} required
              />
              {form.password2 && form.password !== form.password2 && (
                <p className="text-[11px] text-destructive">Las contraseñas no coinciden</p>
              )}
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
                : <>Crear mi cuenta <ArrowRight className="w-4 h-4" /></>
              }
            </Button>
          </form>

          <div className="flex items-center gap-3 my-6">
            <div className="flex-1 h-px bg-border" />
            <span className="text-xs text-muted-foreground">o</span>
            <div className="flex-1 h-px bg-border" />
          </div>

          <p className="text-center text-sm text-muted-foreground">
            ¿Ya tienes cuenta?{' '}
            <Link to="/login" className="text-primary font-semibold hover:underline underline-offset-2">
              Inicia sesión
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
