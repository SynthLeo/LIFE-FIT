import { useState, useEffect, useRef } from 'react'
import api from '@/lib/api'

const COLOR = '#7C3AED'
const COLOR_LIGHT = 'rgba(124,58,237,0.08)'
const COLOR_BORDER = 'rgba(124,58,237,0.25)'

/* ─────────────────────────────────────────────
   BIBLIOTECA DE TÉCNICAS
───────────────────────────────────────────── */
const TECNICAS = [
  {
    id: 'respiracion_478',
    categoria: 'ansiedad',
    titulo: 'Respiración 4-7-8',
    descripcion: 'Técnica de respiración que activa el sistema nervioso parasimpático para reducir ansiedad en minutos.',
    duracion: '5 min',
    dificultad: 'Fácil',
    evidencia: 'Alta',
    icono: '🌬️',
    pasos: [
      'Siéntate con la espalda recta y cierra los ojos.',
      'Inhala por la nariz contando mentalmente hasta 4.',
      'Mantén el aire contando hasta 7.',
      'Exhala lentamente por la boca contando hasta 8.',
      'Repite el ciclo 4 veces.',
    ],
    timerSegundos: 300,
    tags: ['ansiedad', 'estrés', 'sueño'],
  },
  {
    id: 'grounding_54321',
    categoria: 'ansiedad',
    titulo: 'Grounding 5-4-3-2-1',
    descripcion: 'Técnica sensorial para salir de pensamientos ansiosos y anclar tu atención al presente.',
    duracion: '3 min',
    dificultad: 'Fácil',
    evidencia: 'Alta',
    icono: '🌱',
    pasos: [
      'Nombra 5 cosas que puedes VER a tu alrededor.',
      'Nombra 4 cosas que puedes TOCAR y tócalas.',
      'Nombra 3 cosas que puedes ESCUCHAR ahora mismo.',
      'Nombra 2 cosas que puedes OLER.',
      'Nombra 1 cosa que puedes SABOREAR.',
    ],
    timerSegundos: 180,
    tags: ['ansiedad', 'pánico', 'disociación'],
  },
  {
    id: 'diario_gratitud',
    categoria: 'animo',
    titulo: 'Diario de gratitud',
    descripcion: 'Anotar 3 cosas positivas del día entrena al cerebro para detectar lo bueno, reduciendo la rumiación.',
    duracion: '5 min',
    dificultad: 'Fácil',
    evidencia: 'Alta',
    icono: '📓',
    pasos: [
      'Abre tu cuaderno o notas del celular.',
      'Escribe 3 cosas específicas que agradeces hoy (sin repetir del día anterior).',
      'Para cada una, escribe por qué te importa.',
      'Hazlo a la misma hora todos los días, preferiblemente por la noche.',
    ],
    timerSegundos: 300,
    tags: ['ánimo bajo', 'depresión', 'gratitud'],
  },
  {
    id: 'activacion_conductual',
    categoria: 'animo',
    titulo: 'Activación conductual',
    descripcion: 'Programar una actividad pequeña y placentera cuando el ánimo está bajo. El movimiento precede a la motivación.',
    duracion: '20 min',
    dificultad: 'Media',
    evidencia: 'Muy alta',
    icono: '🚶',
    pasos: [
      'Elige una actividad que antes disfrutabas aunque ahora no tengas ganas.',
      'Ponla en tu agenda con hora exacta (ej. "caminar 15 min a las 6pm").',
      'Hazla aunque no tengas ganas. El ánimo mejora DESPUÉS de actuar, no antes.',
      'Al terminar, anota cómo te sentiste antes y después.',
    ],
    timerSegundos: null,
    tags: ['ánimo bajo', 'apatía', 'depresión'],
  },
  {
    id: 'body_scan',
    categoria: 'estres',
    titulo: 'Body scan mindfulness',
    descripcion: 'Exploración corporal guiada que libera tensión acumulada y desarrolla conciencia plena del cuerpo.',
    duracion: '10 min',
    dificultad: 'Media',
    evidencia: 'Alta',
    icono: '🧘',
    pasos: [
      'Acuéstate o siéntate cómodamente. Cierra los ojos.',
      'Lleva la atención a los pies. Nota cualquier sensación sin juzgar.',
      'Sube lentamente: pantorrillas, rodillas, muslos, abdomen.',
      'Continúa por pecho, hombros, brazos, manos.',
      'Termina en cuello, mandíbula, ojos, coronilla.',
      'Si la mente se va, regresa suavemente a la zona del cuerpo.',
    ],
    timerSegundos: 600,
    tags: ['estrés', 'tensión', 'insomnio'],
  },
  {
    id: 'pomodoro_estudio',
    categoria: 'concentracion',
    titulo: 'Pomodoro para ansiedad académica',
    descripcion: 'Bloques de trabajo cortos que reducen la procrastinación causada por ansiedad ante tareas grandes.',
    duracion: '25+5 min',
    dificultad: 'Fácil',
    evidencia: 'Alta',
    icono: '⏱️',
    pasos: [
      'Elige UNA sola tarea. Escríbela en papel.',
      'Pon un temporizador a 25 minutos.',
      'Trabaja SOLO en esa tarea. Si aparece otra idea, anótala y sigue.',
      'Al sonar el timer, descansa 5 minutos sin pantallas.',
      'Después de 4 pomodoros, toma un descanso largo de 20-30 min.',
    ],
    timerSegundos: 1500,
    tags: ['concentración', 'procrastinación', 'estrés académico'],
  },
  {
    id: 'reencuadre_cognitivo',
    categoria: 'autoestima',
    titulo: 'Reencuadre cognitivo',
    descripcion: 'Técnica de TCC para identificar y cuestionar pensamientos automáticos negativos.',
    duracion: '10 min',
    dificultad: 'Media',
    evidencia: 'Muy alta',
    icono: '🔄',
    pasos: [
      'Anota el pensamiento negativo exacto (ej. "soy un fracaso").',
      'Pregúntate: ¿qué evidencia tengo a FAVOR de este pensamiento?',
      'Ahora: ¿qué evidencia tengo EN CONTRA?',
      'Escribe una versión más equilibrada y realista del pensamiento.',
      'Léela en voz alta 3 veces.',
    ],
    timerSegundos: 600,
    tags: ['autoestima', 'pensamientos negativos', 'ansiedad'],
  },
  {
    id: 'carta_compasion',
    categoria: 'autoestima',
    titulo: 'Carta de autocompasión',
    descripcion: 'Escribirte como lo harías a un amigo cercano activa la autocompasión y reduce la autocrítica destructiva.',
    duracion: '15 min',
    dificultad: 'Media',
    evidencia: 'Alta',
    icono: '💌',
    pasos: [
      'Piensa en algo que te haga sentir mal o avergonzado/a de ti mismo/a.',
      'Imagina que un amigo cercano y compasivo conoce esta situación.',
      'Escribe una carta desde ese amigo hacia ti: sin juicios, con comprensión.',
      'Incluye que el sufrimiento es parte de la experiencia humana, no solo tuya.',
      'Lee la carta lentamente. Deja que las palabras lleguen.',
    ],
    timerSegundos: 900,
    tags: ['autoestima', 'autocrítica', 'vergüenza'],
  },
  {
    id: 'higiene_sueno',
    categoria: 'sueno',
    titulo: 'Ritual de desconexión nocturna',
    descripcion: 'Rutina de 30 minutos antes de dormir que prepara el sistema nervioso para un sueño reparador.',
    duracion: '30 min',
    dificultad: 'Fácil',
    evidencia: 'Alta',
    icono: '🌙',
    pasos: [
      '21:30 — Activa el modo noche en todos los dispositivos.',
      '22:00 — Apaga pantallas completamente. Lee un libro físico o escucha música tranquila.',
      '22:15 — Date un baño tibio o lava tu cara con agua fría.',
      '22:20 — Escribe 3 preocupaciones del día y "ciérralas" mentalmente en papel.',
      '22:30 — Oscuridad total, temperatura fresca, sin celular en la habitación.',
    ],
    timerSegundos: null,
    tags: ['sueño', 'insomnio', 'estrés'],
  },
]

const CATEGORIAS = [
  { id: 'todas', label: 'Todas', icono: '✨' },
  { id: 'ansiedad', label: 'Ansiedad', icono: '💆' },
  { id: 'animo', label: 'Estado de ánimo', icono: '😊' },
  { id: 'estres', label: 'Estrés', icono: '🧘' },
  { id: 'concentracion', label: 'Concentración', icono: '🎯' },
  { id: 'autoestima', label: 'Autoestima', icono: '💪' },
  { id: 'sueno', label: 'Sueño', icono: '🌙' },
]

/* ─────────────────────────────────────────────
   PLAN SEMANAL — basado en perfil psicológico
───────────────────────────────────────────── */
function generarPlanSemanal(perfil) {
  const DIAS = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo']

  // Prioridades basadas en el perfil
  const tecnicasPrioritarias = []

  if (perfil?.estres_general === 'constante' || perfil?.estres_general === 'frecuente') {
    tecnicasPrioritarias.push('respiracion_478', 'body_scan')
  }
  if (perfil?.ansiedad === 'intenso' || perfil?.ansiedad === 'moderado') {
    tecnicasPrioritarias.push('respiracion_478', 'grounding_54321')
  }
  if (perfil?.estado_animo === 'muy_bajo' || perfil?.estado_animo === 'bajo') {
    tecnicasPrioritarias.push('diario_gratitud', 'activacion_conductual')
  }
  if (perfil?.autoestima === 'muy_baja' || perfil?.autoestima === 'baja') {
    tecnicasPrioritarias.push('reencuadre_cognitivo', 'carta_compasion')
  }
  if (perfil?.sueno_psico === 'casi_siempre' || perfil?.sueno_psico === 'frecuente') {
    tecnicasPrioritarias.push('higiene_sueno', 'respiracion_478')
  }
  if (perfil?.rendimiento_academico === 'mucho' || perfil?.rendimiento_academico === 'moderado') {
    tecnicasPrioritarias.push('pomodoro_estudio', 'respiracion_478')
  }

  // Si no hay perfil o no hay prioridades, plan por defecto
  const pool = tecnicasPrioritarias.length > 0
    ? [...new Set(tecnicasPrioritarias)]
    : ['respiracion_478', 'diario_gratitud', 'body_scan', 'grounding_54321', 'pomodoro_estudio']

  const plan = DIAS.map((dia, i) => {
    const tecnicaId = pool[i % pool.length]
    const tecnica = TECNICAS.find(t => t.id === tecnicaId) || TECNICAS[i % TECNICAS.length]
    return {
      dia,
      tecnica,
      completado: false,
    }
  })

  return plan
}

/* ─────────────────────────────────────────────
   TIMER COMPONENT
───────────────────────────────────────────── */
function Timer({ segundos, onClose }) {
  const [restantes, setRestantes] = useState(segundos)
  const [corriendo, setCorriendo] = useState(false)
  const intervalRef = useRef(null)

  useEffect(() => {
    if (corriendo && restantes > 0) {
      intervalRef.current = setInterval(() => {
        setRestantes(s => {
          if (s <= 1) { setCorriendo(false); clearInterval(intervalRef.current); return 0 }
          return s - 1
        })
      }, 1000)
    }
    return () => clearInterval(intervalRef.current)
  }, [corriendo])

  const mins = String(Math.floor(restantes / 60)).padStart(2, '0')
  const secs = String(restantes % 60).padStart(2, '0')
  const pct = ((segundos - restantes) / segundos) * 100

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-card border border-border rounded-2xl p-8 w-full max-w-sm text-center">
        <p className="text-xs tracking-widest text-muted-foreground uppercase mb-6">Temporizador</p>
        <div className="relative w-36 h-36 mx-auto mb-6">
          <svg className="w-full h-full -rotate-90" viewBox="0 0 144 144">
            <circle cx="72" cy="72" r="64" fill="none" stroke="var(--border-subtle)" strokeWidth="8" />
            <circle cx="72" cy="72" r="64" fill="none" stroke={COLOR} strokeWidth="8"
              strokeDasharray={`${2 * Math.PI * 64}`}
              strokeDashoffset={`${2 * Math.PI * 64 * (1 - pct / 100)}`}
              strokeLinecap="round"
              style={{ transition: 'stroke-dashoffset 1s linear' }}
            />
          </svg>
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-3xl font-mono font-bold text-foreground">{mins}:{secs}</span>
          </div>
        </div>
        <div className="flex gap-3 justify-center">
          <button
            onClick={() => setCorriendo(c => !c)}
            className="px-6 py-2.5 rounded-xl text-sm font-semibold text-foreground"
            style={{ background: COLOR }}
          >
            {corriendo ? '⏸ Pausar' : restantes === 0 ? '✓ Listo' : '▶ Iniciar'}
          </button>
          <button
            onClick={() => { setRestantes(segundos); setCorriendo(false) }}
            className="px-4 py-2.5 rounded-xl text-sm border border-border text-muted-foreground hover:border-border transition-colors"
          >
            ↺
          </button>
          <button
            onClick={onClose}
            className="px-4 py-2.5 rounded-xl text-sm border border-border text-muted-foreground hover:border-border transition-colors"
          >
            ✕
          </button>
        </div>
      </div>
    </div>
  )
}

/* ─────────────────────────────────────────────
   MODAL DE TÉCNICA
───────────────────────────────────────────── */
function ModalTecnica({ tecnica, onClose }) {
  const [timer, setTimer] = useState(false)
  const [pasoActivo, setPasoActivo] = useState(0)

  if (!tecnica) return null

  return (
    <>
      <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-40 flex items-end sm:items-center justify-center p-0 sm:p-4">
        <div className="bg-[#0f0f15] border border-border rounded-t-3xl sm:rounded-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
          {/* Header */}
          <div className="sticky top-0 bg-[#0f0f15]/95 backdrop-blur-sm border-b border-border p-5 flex items-start justify-between">
            <div className="flex items-center gap-3">
              <span className="text-2xl">{tecnica.icono}</span>
              <div>
                <h3 className="font-bold text-foreground text-base">{tecnica.titulo}</h3>
                <div className="flex gap-2 mt-1">
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-white/6 text-muted-foreground">{tecnica.duracion}</span>
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-white/6 text-muted-foreground">{tecnica.dificultad}</span>
                  <span className="text-[10px] px-2 py-0.5 rounded-full text-purple-300" style={{ background: 'rgba(124,58,237,0.12)', border: '1px solid rgba(124,58,237,0.2)' }}>
                    Evidencia {tecnica.evidencia}
                  </span>
                </div>
              </div>
            </div>
            <button onClick={onClose} className="text-muted-foreground hover:text-white transition-colors ml-2 flex-shrink-0">✕</button>
          </div>

          <div className="p-5 space-y-5">
            <p className="text-sm text-muted-foreground leading-relaxed">{tecnica.descripcion}</p>

            {/* Pasos interactivos */}
            <div>
              <p className="text-xs tracking-widest text-muted-foreground uppercase mb-3">Pasos</p>
              <div className="space-y-2">
                {tecnica.pasos.map((paso, i) => (
                  <div
                    key={i}
                    onClick={() => setPasoActivo(i)}
                    className={`flex gap-3 p-3 rounded-xl cursor-pointer transition-all ${
                      pasoActivo === i
                        ? 'border'
                        : 'border border-transparent hover:bg-secondary/50'
                    }`}
                    style={pasoActivo === i ? { background: COLOR_LIGHT, borderColor: COLOR_BORDER } : {}}
                  >
                    <div className={`w-6 h-6 rounded-full flex-shrink-0 flex items-center justify-center text-xs font-bold transition-all ${
                      pasoActivo === i ? 'text-white' : 'bg-white/6 text-muted-foreground'
                    }`} style={pasoActivo === i ? { background: COLOR } : {}}>
                      {i + 1}
                    </div>
                    <p className={`text-sm leading-relaxed transition-colors ${pasoActivo === i ? 'text-white' : 'text-muted-foreground'}`}>
                      {paso}
                    </p>
                  </div>
                ))}
              </div>
              <div className="flex gap-2 mt-3">
                {pasoActivo > 0 && (
                  <button onClick={() => setPasoActivo(p => p - 1)} className="flex-1 py-2 rounded-xl text-xs border border-border text-muted-foreground hover:border-border transition-colors">
                    ← Anterior
                  </button>
                )}
                {pasoActivo < tecnica.pasos.length - 1 && (
                  <button onClick={() => setPasoActivo(p => p + 1)} className="flex-1 py-2 rounded-xl text-xs text-foreground font-semibold transition-colors" style={{ background: COLOR }}>
                    Siguiente paso →
                  </button>
                )}
                {pasoActivo === tecnica.pasos.length - 1 && (
                  <div className="flex-1 py-2 rounded-xl text-xs text-center" style={{ background: 'rgba(34,197,94,0.1)', color: '#4ade80', border: '1px solid rgba(34,197,94,0.2)' }}>
                    ✓ ¡Completado!
                  </div>
                )}
              </div>
            </div>

            {/* Tags */}
            <div className="flex flex-wrap gap-2">
              {tecnica.tags.map(tag => (
                <span key={tag} className="text-[10px] px-2.5 py-1 rounded-full text-muted-foreground border border-border">
                  #{tag}
                </span>
              ))}
            </div>

            {/* CTA */}
            {tecnica.timerSegundos && (
              <button
                onClick={() => setTimer(true)}
                className="w-full py-3 rounded-xl text-sm font-semibold text-foreground flex items-center justify-center gap-2 transition-all hover:opacity-90"
                style={{ background: COLOR }}
              >
                ⏱ Iniciar temporizador · {Math.floor(tecnica.timerSegundos / 60)} min
              </button>
            )}
          </div>
        </div>
      </div>

      {timer && <Timer segundos={tecnica.timerSegundos} onClose={() => setTimer(false)} />}
    </>
  )
}

/* ─────────────────────────────────────────────
   COMPONENTE PRINCIPAL
───────────────────────────────────────────── */
export default function HerramientasBienestar({ perfilPsico }) {
  const [vista, setVista] = useState('biblioteca') // 'biblioteca' | 'plan'
  const [categoriaActiva, setCategoriaActiva] = useState('todas')
  const [tecnicaModal, setTecnicaModal] = useState(null)
  const [plan, setPlan] = useState(null)
  const [completados, setCompletados] = useState({}) // { 'Lunes': true, ... }
  const [cargandoPlan, setCargandoPlan] = useState(false)

  useEffect(() => {
    if (vista === 'plan' && !plan) {
      setCargandoPlan(true)
      // Intentar cargar progreso guardado del servidor
      api.get('/Bienestar/ObtenerPlanSemanal.php')
        .then(r => {
          setCompletados(r.data.completados ?? {})
        })
        .catch(() => {})
        .finally(() => {
          setPlan(generarPlanSemanal(perfilPsico))
          setCargandoPlan(false)
        })
    }
  }, [vista, perfilPsico])

  const toggleCompletado = async (dia) => {
    const nuevo = { ...completados, [dia]: !completados[dia] }
    setCompletados(nuevo)
    try {
      await api.post('/Bienestar/GuardarPlanSemanal.php', { completados: nuevo })
    } catch { /* silencioso */ }
  }

  const tecnicasFiltradas = categoriaActiva === 'todas'
    ? TECNICAS
    : TECNICAS.filter(t => t.categoria === categoriaActiva)

  const diasCompletados = plan ? Object.values(completados).filter(Boolean).length : 0

  return (
    <div className="space-y-4">
      {/* ── Selector de vista ── */}
      <div className="flex gap-1 p-1 bg-secondary/50 rounded-xl w-fit">
        {[
          { id: 'biblioteca', label: '📚 Biblioteca de técnicas' },
          { id: 'plan', label: '📅 Plan semanal' },
        ].map(({ id, label }) => (
          <button
            key={id}
            onClick={() => setVista(id)}
            className={`px-4 py-2 rounded-lg text-xs font-medium transition-all ${
              vista === id ? 'text-white bg-secondary' : 'text-muted-foreground hover:text-secondary-foreground'
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {/* ══════════════════════════════════════════
          VISTA: BIBLIOTECA
      ══════════════════════════════════════════ */}
      {vista === 'biblioteca' && (
        <div className="space-y-4">
          {/* Categorías */}
          <div className="flex gap-2 flex-wrap">
            {CATEGORIAS.map(cat => (
              <button
                key={cat.id}
                onClick={() => setCategoriaActiva(cat.id)}
                className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-all ${
                  categoriaActiva === cat.id
                    ? 'text-white border-purple-500/50'
                    : 'border-border text-muted-foreground hover:border-border hover:text-secondary-foreground'
                }`}
                style={categoriaActiva === cat.id ? { background: COLOR_LIGHT, borderColor: COLOR_BORDER } : {}}
              >
                {cat.icono} {cat.label}
              </button>
            ))}
          </div>

          {/* Grid de técnicas */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {tecnicasFiltradas.map(tecnica => (
              <button
                key={tecnica.id}
                onClick={() => setTecnicaModal(tecnica)}
                className="text-left p-4 bg-secondary/50 border border-border rounded-2xl hover:bg-secondary hover:border-border transition-all group"
              >
                <div className="flex items-start gap-3">
                  <span className="text-2xl flex-shrink-0">{tecnica.icono}</span>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2 mb-1">
                      <p className="text-sm font-semibold text-foreground group-hover:text-purple-200 transition-colors leading-tight">
                        {tecnica.titulo}
                      </p>
                      <span className="text-[10px] text-muted-foreground flex-shrink-0">{tecnica.duracion}</span>
                    </div>
                    <p className="text-xs text-muted-foreground leading-relaxed line-clamp-2">{tecnica.descripcion}</p>
                    <div className="flex gap-1.5 mt-2 flex-wrap">
                      {tecnica.tags.slice(0, 2).map(tag => (
                        <span key={tag} className="text-[9px] px-2 py-0.5 rounded-full text-muted-foreground bg-white/4 border border-border">
                          #{tag}
                        </span>
                      ))}
                      {tecnica.timerSegundos && (
                        <span className="text-[9px] px-2 py-0.5 rounded-full text-purple-400 bg-purple-500/10 border border-purple-500/20">
                          ⏱ Timer incluido
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </button>
            ))}
          </div>

          {tecnicasFiltradas.length === 0 && (
            <div className="text-center py-10 text-muted-foreground">
              <p className="text-2xl mb-2">🔍</p>
              <p className="text-sm">No hay técnicas en esta categoría aún.</p>
            </div>
          )}
        </div>
      )}

      {/* ══════════════════════════════════════════
          VISTA: PLAN SEMANAL
      ══════════════════════════════════════════ */}
      {vista === 'plan' && (
        <div className="space-y-4">
          {/* Banner de contexto */}
          <div className="p-4 rounded-2xl border" style={{ background: COLOR_LIGHT, borderColor: COLOR_BORDER }}>
            <div className="flex items-start gap-3">
              <span className="text-lg">🎯</span>
              <div className="flex-1">
                <p className="text-sm font-semibold text-foreground mb-0.5">
                  {perfilPsico
                    ? `Plan personalizado · Meta: ${perfilPsico.metas_bienestar?.replace('_', ' ')}`
                    : 'Plan de bienestar semanal'}
                </p>
                <p className="text-xs text-muted-foreground">
                  {perfilPsico
                    ? 'Generado a partir de tu perfil psicológico. Una micro-práctica por día.'
                    : 'Completa el cuestionario de bienestar para un plan personalizado.'}
                </p>
              </div>
              {plan && (
                <div className="flex-shrink-0 text-right">
                  <p className="text-lg font-bold text-foreground">{diasCompletados}/7</p>
                  <p className="text-[10px] text-muted-foreground">días</p>
                </div>
              )}
            </div>
            {plan && (
              <div className="mt-3 h-1.5 bg-white/6 rounded-full overflow-hidden">
                <div
                  className="h-full rounded-full transition-all duration-500"
                  style={{ width: `${(diasCompletados / 7) * 100}%`, background: COLOR }}
                />
              </div>
            )}
          </div>

          {/* Plan */}
          {cargandoPlan ? (
            <div className="text-center py-8 text-muted-foreground">
              <p className="text-sm">Generando tu plan...</p>
            </div>
          ) : plan ? (
            <div className="space-y-2">
              {plan.map(({ dia, tecnica }) => {
                const hecho = completados[dia] || false
                return (
                  <div
                    key={dia}
                    className={`flex items-center gap-4 p-4 rounded-2xl border transition-all ${
                      hecho
                        ? 'border-green-500/20 bg-green-500/5'
                        : 'border-border bg-secondary/50 hover:bg-white/4'
                    }`}
                  >
                    {/* Checkbox */}
                    <button
                      onClick={() => toggleCompletado(dia)}
                      className={`w-6 h-6 rounded-full border-2 flex-shrink-0 flex items-center justify-center transition-all ${
                        hecho
                          ? 'border-green-500 bg-green-500'
                          : 'border-border hover:border-border/500'
                      }`}
                    >
                      {hecho && <span className="text-white text-xs font-bold">✓</span>}
                    </button>

                    {/* Contenido */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="text-[10px] text-muted-foreground uppercase tracking-widest w-16 flex-shrink-0">{dia}</p>
                        <p className={`text-sm font-medium leading-tight transition-colors ${hecho ? 'text-muted-foreground line-through' : 'text-white'}`}>
                          {tecnica.icono} {tecnica.titulo}
                        </p>
                      </div>
                      <p className="text-xs text-muted-foreground mt-0.5 pl-[4.5rem] leading-relaxed line-clamp-1">
                        {tecnica.descripcion}
                      </p>
                    </div>

                    {/* Botón ver técnica */}
                    <button
                      onClick={() => setTecnicaModal(tecnica)}
                      className="flex-shrink-0 text-xs px-3 py-1.5 rounded-lg border border-border text-muted-foreground hover:border-border hover:text-secondary-foreground transition-all"
                    >
                      Ver →
                    </button>
                  </div>
                )
              })}

              {diasCompletados === 7 && (
                <div className="text-center py-6 rounded-2xl border border-green-500/20 bg-green-500/5 mt-2">
                  <p className="text-2xl mb-2">🎉</p>
                  <p className="text-sm font-semibold text-green-400">¡Completaste tu plan semanal!</p>
                  <p className="text-xs text-muted-foreground mt-1">El próximo lunes se reinicia automáticamente.</p>
                </div>
              )}
            </div>
          ) : null}
        </div>
      )}

      {/* Modal de técnica */}
      {tecnicaModal && (
        <ModalTecnica
          tecnica={tecnicaModal}
          onClose={() => setTecnicaModal(null)}
        />
      )}
    </div>
  )
}