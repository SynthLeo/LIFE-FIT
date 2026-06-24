import { useState, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '@/lib/api'
import '../../styles/CuestionarioMinimal.css'

/* ─────────────────────────────────────────────
   DATA — 12 preguntas
───────────────────────────────────────────── */
const QUESTIONS = [
  {
    id: 'minutos_semana', category: 'HÁBITOS GENERALES',
    title: '¿Cuántos minutos de actividad física realizas a la semana?',
    opts: [
      { val:'menos_75',  label:'Menos de 75 minutos',     desc:'Actividad muy baja o esporádica' },
      { val:'75_150',    label:'Entre 75 y 150 minutos',  desc:'Por debajo del mínimo recomendado' },
      { val:'150_300',   label:'Entre 150 y 300 minutos', desc:'Nivel recomendado por la OMS' },
      { val:'mas_300',   label:'Más de 300 minutos',      desc:'Alto volumen de entrenamiento' },
    ],
  },
  {
    id: 'frecuencia_semana', category: 'HÁBITOS GENERALES',
    title: '¿Con qué frecuencia haces ejercicio a la semana?',
    opts: [
      { val:'nunca', label:'Nunca',          desc:'No tengo rutina activa' },
      { val:'1_2',   label:'1 a 2 veces',    desc:'Actividad ocasional' },
      { val:'3_4',   label:'3 a 4 veces',    desc:'Frecuencia habitual recomendada' },
      { val:'5_mas', label:'5 veces o más',  desc:'Alta frecuencia de entrenamiento' },
    ],
  },
  {
    id: 'tipo_actividad', category: 'TIPO DE ACTIVIDAD',
    title: '¿Qué tipo de actividad física practicas con mayor frecuencia?',
    opts: [
      { val:'aerobico',     label:'🏃 Aeróbico',                  desc:'Correr, nadar, ciclismo, HIIT' },
      { val:'fuerza',       label:'🏋️ Fuerza',                   desc:'Pesas, máquinas, calistenia' },
      { val:'flexibilidad', label:'🧘 Flexibilidad / Movilidad',  desc:'Yoga, pilates, estiramientos' },
      { val:'ninguna',      label:'⚪ No realizo actividad física', desc:'Quiero empezar desde cero' },
    ],
  },
  {
    id: 'lugar_ejercicio', category: 'TIPO DE ACTIVIDAD',
    title: '¿Dónde realizas principalmente tu actividad física?',
    opts: [
      { val:'casa',     label:'🏠 En casa',              desc:'Con o sin equipamiento en el hogar' },
      { val:'gimnasio', label:'🏋️ En un gimnasio',      desc:'Acceso a instalaciones completas' },
      { val:'exterior', label:'🌳 Al aire libre',         desc:'Parques, calles, pistas' },
      { val:'ninguno',  label:'⚪ No realizo actividad física', desc:'' },
    ],
  },
  {
    id: 'motivacion', category: 'MOTIVACIÓN Y METAS',
    title: '¿Cuál es tu principal motivo para hacer actividad física?',
    opts: [
      { val:'salud',       label:'❤️ Salud y bienestar general', desc:'Mantenerme sano y con energía' },
      { val:'estetica',    label:'✨ Estética o control de peso', desc:'Cambio físico visible' },
      { val:'rendimiento', label:'🏆 Rendimiento deportivo',      desc:'Mejorar marcas o competir' },
      { val:'medico',      label:'🩺 Recomendación médica',       desc:'Por prescripción o condición de salud' },
    ],
  },
  {
    id: 'barrera', category: 'MOTIVACIÓN Y METAS',
    title: '¿Cuál es la principal razón por la que no haces más ejercicio?',
    opts: [
      { val:'tiempo',        label:'⏰ Falta de tiempo',              desc:'Agenda apretada o trabajo intenso' },
      { val:'motivacion',    label:'😴 Falta de motivación',          desc:'No me animo o lo dejo para después' },
      { val:'salud',         label:'🤕 Problemas de salud o lesiones', desc:'Limitaciones físicas actuales' },
      { val:'instalaciones', label:'🏟️ Sin acceso a instalaciones',   desc:'No tengo gimnasio o espacio adecuado' },
    ],
  },
  {
    id: 'condicion_fisica', category: 'BIENESTAR Y SALUD',
    title: '¿Cómo describes tu nivel de condición física actual?',
    opts: [
      { val:'muy_buena', label:'🟢 Muy buena', desc:'Me canso poco, rendimiento alto' },
      { val:'buena',     label:'🔵 Buena',     desc:'Aguanto bien el ejercicio moderado' },
      { val:'regular',   label:'🟡 Regular',   desc:'Me canso con cierta facilidad' },
      { val:'mala',      label:'🔴 Mala',      desc:'El ejercicio se me hace muy difícil' },
    ],
  },
  {
    id: 'horas_sedentario', category: 'BIENESTAR Y SALUD',
    title: '¿Cuántas horas al día permaneces sentado o inactivo?',
    opts: [
      { val:'menos_4', label:'Menos de 4 horas', desc:'Estilo de vida activo' },
      { val:'4_6',     label:'Entre 4 y 6 horas', desc:'Sedentarismo moderado' },
      { val:'6_8',     label:'Entre 6 y 8 horas', desc:'Trabajo de oficina típico' },
      { val:'mas_8',   label:'Más de 8 horas',    desc:'Sedentarismo alto' },
    ],
  },
  {
    id: 'condicion_salud', category: 'BIENESTAR Y SALUD',
    title: '¿Tienes alguna condición de salud que limite tu actividad física?',
    opts: [
      { val:'ninguna',       label:'✅ No, ninguna',                              desc:'Puedo entrenar sin restricciones' },
      { val:'moderada',      label:'⚠️ Sí, pero puedo hacer ejercicio moderado', desc:'Con ciertas precauciones' },
      { val:'limitante',     label:'🚫 Sí, limita bastante mi actividad',        desc:'Requiero rutinas adaptadas' },
      { val:'prefiero_no',   label:'🔒 Prefiero no responder', desc:'' },
    ],
  },
  {
    id: 'nutricion', category: 'NUTRICIÓN E HIDRATACIÓN',
    title: '¿Cómo calificarías tu alimentación en relación con tu actividad física?',
    opts: [
      { val:'muy_equilibrada',    label:'🥗 Muy equilibrada y adaptada', desc:'Como según mi esfuerzo y objetivos' },
      { val:'bastante_equilibrada', label:'🥦 Bastante equilibrada',      desc:'Cuido mi dieta en general' },
      { val:'poco_equilibrada',   label:'🍔 Poco equilibrada',           desc:'No sigo ningún plan alimenticio' },
      { val:'no_considero',       label:'❓ No lo considero al ejercitarme', desc:'' },
    ],
  },
  {
    id: 'calentamiento', category: 'ORIENTACIÓN Y SEGUIMIENTO',
    title: '¿Realizas calentamiento y enfriamiento en tus sesiones?',
    opts: [
      { val:'siempre',     label:'✅ Siempre',      desc:'Parte integral de mi rutina' },
      { val:'a_veces',     label:'🔄 A veces',       desc:'Cuando tengo tiempo' },
      { val:'casi_nunca',  label:'⏩ Casi nunca',    desc:'Suelo saltarlos' },
      { val:'nunca',       label:'❌ Nunca',          desc:'No los incluyo' },
    ],
  },
  {
    id: 'entorno_social', category: 'ENTORNO SOCIAL',
    title: '¿Tu entorno (amigos, familia) influye en tu práctica de ejercicio?',
    opts: [
      { val:'motivan',     label:'💪 Sí, me motivan a ejercitarme', desc:'Tengo apoyo activo' },
      { val:'acompañan',   label:'🤝 A veces me acompañan',         desc:'Entreno ocasionalmente en grupo' },
      { val:'indiferente', label:'😐 Es indiferente para mí',        desc:'Prefiero entrenar solo/a' },
      { val:'sin_apoyo',   label:'😔 No tengo apoyo de mi entorno',  desc:'' },
    ],
  },
]

/* ─────────────────────────────────────────────
   SCORING / RUTINAS / TIPS
───────────────────────────────────────────── */
function calcFitnessScore(ans) {
  const min  = { menos_75:0, '75_150':8, '150_300':20, mas_300:25 }
  const freq = { nunca:0, '1_2':5, '3_4':15, '5_mas':20 }
  const cond = { mala:0, regular:7, buena:14, muy_buena:20 }
  const sed  = { mas_8:0, '6_8':5, '4_6':10, menos_4:15 }
  const nut  = { no_considero:0, poco_equilibrada:3, bastante_equilibrada:7, muy_equilibrada:10 }
  const cal  = { nunca:0, casi_nunca:3, a_veces:7, siempre:10 }
  return (min[ans.minutos_semana]||0) + (freq[ans.frecuencia_semana]||0) + (cond[ans.condicion_fisica]||0)
       + (sed[ans.horas_sedentario]||0) + (nut[ans.nutricion]||0) + (cal[ans.calentamiento]||0)
}

function getNivel(score) {
  return score < 30 ? 'principiante' : score < 65 ? 'intermedio' : 'avanzado'
}

function getRutinas(ans) {
  const score = calcFitnessScore(ans)
  const nivel = getNivel(score)
  const rutinas = []
  if (ans.condicion_salud === 'limitante') {
    return [{ icon:'🩺', name:'Rutina de Bajo Impacto', desc:'Ejercicios suaves adaptados. Consulta con tu médico antes de iniciar.', badge:'baja intensidad', badgeClass:'' }]
  }
  const nivelBadge = (n) => n === 'avanzado' ? 'high' : n === 'intermedio' ? 'med' : ''
  if (ans.tipo_actividad === 'aerobico' || ans.motivacion === 'rendimiento') {
    const names = { principiante:'Cardio Base 3x Semana', intermedio:'Endurance Circuit v2', avanzado:'HIIT Performance Protocol' }
    rutinas.push({ icon:'🏃', name:names[nivel], desc:'Mejora tu capacidad cardiovascular y resistencia.', badge:nivel, badgeClass:nivelBadge(nivel) })
  }
  if (ans.tipo_actividad === 'fuerza' || ans.motivacion === 'estetica' || ans.motivacion === 'salud') {
    if (ans.lugar_ejercicio === 'casa' || ans.lugar_ejercicio === 'ninguno') {
      const names = { principiante:'Calistenia Inicial', intermedio:'Home Strength Builder', avanzado:'Calistenia Avanzada' }
      rutinas.push({ icon:'🤸', name:names[nivel], desc:'Entrenamiento de fuerza con peso corporal, sin equipamiento.', badge:nivel, badgeClass:nivelBadge(nivel) })
    } else if (ans.lugar_ejercicio === 'gimnasio') {
      const names = { principiante:'Full Body Gym (3x)', intermedio:'Hypertrophy Protocol', avanzado:'Power & Strength Elite' }
      rutinas.push({ icon:'🏋️', name:names[nivel], desc:'Rutina de gimnasio completa con máquinas y pesas libres.', badge:nivel, badgeClass:nivelBadge(nivel) })
    } else {
      rutinas.push({ icon:'🌳', name:'Outdoor Functional Training', desc:'Ejercicios funcionales al aire libre combinando fuerza y cardio.', badge:nivel, badgeClass:nivelBadge(nivel) })
    }
  }
  if (ans.tipo_actividad === 'flexibilidad') {
    rutinas.push({ icon:'🧘', name:'Movilidad & Flexibilidad', desc:'Secuencias de yoga y pilates para mejorar rango de movimiento.', badge:'todos los niveles', badgeClass:'' })
  }
  if (ans.tipo_actividad === 'ninguna' || ans.frecuencia_semana === 'nunca') {
    rutinas.push({ icon:'🚶', name:'Programa de Inicio Activo', desc:'Comienza con 20 min diarios de caminata y ejercicios básicos.', badge:'principiante', badgeClass:'' })
  }
  if (ans.horas_sedentario === 'mas_8' || ans.horas_sedentario === '6_8') {
    rutinas.push({ icon:'💺', name:'Rutina Anti-Sedentarismo', desc:'Microrutinas de 5 min cada hora para activar tu cuerpo durante el día.', badge:'complementaria', badgeClass:'' })
  }
  if (rutinas.length === 0) {
    rutinas.push({ icon:'✨', name:'Rutina General de Bienestar', desc:'Combina fuerza, cardio y flexibilidad adaptado a tu perfil.', badge:nivel, badgeClass:nivelBadge(nivel) })
  }
  return rutinas
}

function getTips(ans) {
  const tips = []
  const score = calcFitnessScore(ans)
  if (ans.calentamiento === 'casi_nunca' || ans.calentamiento === 'nunca')
    tips.push({ icon:'🔥', text:'Incluye 5-10 min de calentamiento antes de cada sesión para reducir el riesgo de lesiones.' })
  if (ans.horas_sedentario === 'mas_8')
    tips.push({ icon:'⏰', text:'Levántate y muévete 5 min cada hora. El sedentarismo prolongado impacta tu salud aunque hagas ejercicio.' })
  if (ans.nutricion === 'poco_equilibrada' || ans.nutricion === 'no_considero')
    tips.push({ icon:'🥗', text:'Alinear tu alimentación con tu entrenamiento acelera tus resultados. Considera consultar a un nutriólogo.' })
  if (ans.barrera === 'tiempo')
    tips.push({ icon:'⚡', text:'Sesiones de 20-30 min son suficientes si son de calidad. Prueba rutinas HIIT o Full Body compactas.' })
  if (ans.barrera === 'motivacion')
    tips.push({ icon:'🎯', text:'Establece metas pequeñas y medibles cada semana. El progreso visible es el mejor motivador.' })
  if (ans.entorno_social === 'sin_apoyo' || ans.entorno_social === 'indiferente')
    tips.push({ icon:'🤝', text:'Busca comunidades fitness online o un compañero de entrenamiento. El apoyo social aumenta la adherencia.' })
  if (ans.condicion_salud === 'moderada' || ans.condicion_salud === 'limitante')
    tips.push({ icon:'🩺', text:'Consulta a tu médico antes de modificar tu rutina. Existen programas de ejercicio adaptado muy efectivos.' })
  if (score < 30)
    tips.push({ icon:'🌱', text:'Empieza gradualmente. 3 días/semana de 20-30 min es un punto de partida excelente y sostenible.' })
  if (tips.length === 0)
    tips.push({ icon:'📈', text:'Tu perfil es sólido. Considera periodizar tu entrenamiento para seguir progresando sin estancarte.' })
  return tips.slice(0, 4)
}

/* ─────────────────────────────────────────────
   STYLES
───────────────────────────────────────────── */


/* ─────────────────────────────────────────────
   HELPERS
───────────────────────────────────────────── */
function SectionTitle({ children }) {
  return <div className="cq-sec-title">{children}</div>
}

/* ─────────────────────────────────────────────
   COMPONENT
───────────────────────────────────────────── */
export default function CuestionarioPage() {
  const navigate = useNavigate()
  const [current, setCurrent]   = useState(0)
  const [answers, setAnswers]   = useState({})
  const [error, setError]       = useState('')
  const [exiting, setExiting]   = useState(false)
  const [showResults, setShowResults] = useState(false)
  const [saving, setSaving]     = useState(false)
  const [savingStep, setSavingStep] = useState('')   // '' | 'perfil' | 'rutina' | 'listo'
  const [toast, setToast]       = useState({ show:false, msg:'', type:'error' })
  const slideRef = useRef(null)

  const q   = QUESTIONS[current]
  const pct = Math.round(((current + 1) / 12) * 100)

  const showToast = (msg, type = 'error') => {
    setToast({ show:true, msg, type })
    setTimeout(() => setToast(t => ({ ...t, show:false })), 4000)
  }

  function select(val) {
    setAnswers(a => ({ ...a, [q.id]: val }))
    setError('')
  }

  function nextQ() {
    if (!answers[q.id]) {
      setError('Selecciona una opción para continuar.')
      if (slideRef.current) {
        slideRef.current.animate([
          { transform:'translateX(0)' }, { transform:'translateX(-8px)' },
          { transform:'translateX(8px)' }, { transform:'translateX(-4px)' },
          { transform:'translateX(0)' },
        ], { duration: 300 })
      }
      return
    }
    if (current < 11) {
      setExiting(true)
      setTimeout(() => { setCurrent(c => c + 1); setExiting(false); setError('') }, 260)
    } else {
      setShowResults(true)
    }
  }

  function prevQ() {
    if (current > 0) {
      setExiting(true)
      setTimeout(() => { setCurrent(c => c - 1); setExiting(false); setError('') }, 260)
    }
  }

  async function saveResults() {
    setSaving(true)
    const score = calcFitnessScore(answers)
    const nivel = getNivel(score)
    try {
      // Paso 1 — guardar respuestas del cuestionario
      setSavingStep('perfil')
      await api.post('/Cuestionario/Guardar.php', { ...answers, fitness_score: score, nivel_recomendado: nivel })

      // Paso 2 — generar rutina con IA usando el perfil recién guardado
      setSavingStep('rutina')
      await api.post('/IA/GenerarRutina.php', {})

      // Listo — navegar
      setSavingStep('listo')
      showToast('¡Rutina generada! Redirigiendo...', 'success')
      setTimeout(() => navigate('/rutinas'), 1400)
    } catch (e) {
      // Si falla la IA pero el perfil se guardó, dejamos ir igual
      if (savingStep === 'rutina') {
        showToast('Perfil guardado. Puedes generar tu rutina desde la sección Rutinas.', 'success')
        setTimeout(() => navigate('/rutinas'), 2000)
      } else {
        showToast(e.response?.data?.error ?? 'Error al guardar el perfil.')
        setSaving(false)
        setSavingStep('')
      }
    }
  }

  function reset() {
    setAnswers({})
    setCurrent(0)
    setShowResults(false)
    setError('')
    window.scrollTo({ top:0, behavior:'smooth' })
  }

  /* ────────────────────────────────
     RESULTS VIEW
  ──────────────────────────────── */
  if (showResults) {
    const score   = calcFitnessScore(answers)
    const nivel   = getNivel(score)
    const rutinas = getRutinas(answers)
    const tips    = getTips(answers)

    const icons  = { principiante:'🌱', intermedio:'⚡', avanzado:'🔥' }
    const labels = { principiante:'Perfil Principiante', intermedio:'Perfil Intermedio', avanzado:'Perfil Avanzado' }
    const sedLabel = { menos_4:'Activo', '4_6':'Moderado', '6_8':'Sedentario', mas_8:'Muy sedentario' }
    const nutLabel = { muy_equilibrada:'Excelente', bastante_equilibrada:'Buena', poco_equilibrada:'Mejorable', no_considero:'Sin plan' }
    const badgeCls = { high:'cq-badge-high', med:'cq-badge-med', '':'cq-badge-def' }

    // SVG ring
    const R = 68
    const C = 2 * Math.PI * R  // ≈ 427.3
    const dashOffset = C - (C * score / 100)

    return (
      <div className="cq-wrap">
        <style>{CQ_CSS}</style>

        <header className="cq-header">
          <button className="cq-back" onClick={reset}>← Volver</button>
          <div className="cq-header-title">Resultados</div>
          <div className="cq-counter">Análisis</div>
        </header>

        <div className="cq-results cq-fade">

          {/* ── Score Hero ── */}
          <div className="cq-hero">
            <svg width="170" height="170" viewBox="0 0 170 170">
              {/* Outer decorative ring */}
              <circle cx="85" cy="85" r="80" fill="none" stroke="rgba(255,255,255,0.03)" strokeWidth="1" />
              {/* Track */}
              <circle cx="85" cy="85" r={R} fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="9" />
              {/* Fill */}
              <circle
                cx="85" cy="85" r={R}
                fill="none"
                stroke="#a8ff57"
                strokeWidth="9"
                strokeLinecap="round"
                strokeDasharray={C}
                strokeDashoffset={dashOffset}
                transform="rotate(-90 85 85)"
                className="cq-ring-fg"
                style={{ '--cq-ring-offset': dashOffset }}
              />
              {/* Score text */}
              <text x="85" y="80" textAnchor="middle"
                fill="#ffffff"
                fontFamily="'Sora', sans-serif"
                fontWeight="700"
                fontSize="38"
                letterSpacing="-2">
                {score}
              </text>
              <text x="85" y="97" textAnchor="middle"
                fill="#3d3d4d"
                fontFamily="'Outfit', sans-serif"
                fontWeight="600"
                fontSize="10"
                letterSpacing="1">
                /100
              </text>
            </svg>

            <div className="cq-score-ring-label">Score de condición física</div>
            <span className="cq-nivel-icon">{icons[nivel]}</span>
            <div className="cq-hero-nivel">{labels[nivel]}</div>
            <div className="cq-hero-sub">Basado en tus 12 respuestas</div>
          </div>

          {/* ── Metrics ── */}
          <div className="cq-metrics">
            {[
              { val:`${score}/100`,  lbl:'Score fitness' },
              { val:nivel.charAt(0).toUpperCase()+nivel.slice(1), lbl:'Nivel recomendado' },
              { val:sedLabel[answers.horas_sedentario]||'—', lbl:'Sedentarismo' },
              { val:nutLabel[answers.nutricion]||'—', lbl:'Nutrición' },
            ].map((m, i) => (
              <div className="cq-metric" key={i}>
                <div className="cq-metric-val">{m.val}</div>
                <div className="cq-metric-lbl">{m.lbl}</div>
              </div>
            ))}
          </div>

          {/* ── Rutinas ── */}
          <SectionTitle>Rutinas recomendadas</SectionTitle>
          {rutinas.map((r, i) => (
            <div className="cq-routine" key={i}>
              <div className="cq-routine-top">
                <span className="cq-routine-icon">{r.icon}</span>
                <span className="cq-routine-name">{r.name}</span>
                <span className={`cq-badge ${badgeCls[r.badgeClass]}`}>{r.badge}</span>
              </div>
              <p className="cq-routine-desc">{r.desc}</p>
            </div>
          ))}

          {/* ── Tips ── */}
          <SectionTitle>Consejos personalizados</SectionTitle>
          <div>
            {tips.map((t, i) => (
              <div className="cq-tip" key={i}>
                <span className="cq-tip-icon">{t.icon}</span>
                <span className="cq-tip-text">{t.text}</span>
              </div>
            ))}
          </div>

          {/* ── CTA ── */}
          <div className="cq-cta">
            <button
              className="cq-btn-primary full"
              onClick={saveResults}
              disabled={saving}
            >
              {saving ? (
                <>
                  <span className="cq-spinner" />
                  {savingStep === 'perfil'  && 'Guardando perfil...'}
                  {savingStep === 'rutina'  && 'Generando tu rutina con IA...'}
                  {savingStep === 'listo'   && '¡Listo! Redirigiendo...'}
                  {savingStep === ''        && 'Procesando...'}
                </>
              ) : (
                'Guardar perfil y generar mi rutina →'
              )}
            </button>
            <button className="cq-btn-ghost full" onClick={reset} disabled={saving}>
              Volver a hacer el cuestionario
            </button>
          </div>
        </div>

        <div className={`cq-toast ${toast.show ? 'show' : ''} ${toast.type}`}>{toast.msg}</div>
      </div>
    )
  }

  /* ────────────────────────────────
     QUESTIONNAIRE VIEW
  ──────────────────────────────── */
  return (
    <div className="cq-wrap">
      

      {/* ── Header ── */}
      <header className="cq-header">
        <button className="cq-back" onClick={() => navigate(-1)}>← Volver</button>
        <div className="cq-header-title">Cuestionario</div>
        <div className="cq-counter">{current + 1} / 12</div>
      </header>

      {/* ── Progress ── */}
      <div className="cq-progress">
        <div className="cq-progress-meta">
          <span className="cq-cat-tag">{q.category}</span>
          <span className="cq-pct-label">{pct}%</span>
        </div>
        <div className="cq-track">
          <div className="cq-fill" style={{ width:`${pct}%` }} />
        </div>
      </div>

      {/* ── Content ── */}
      <main className="cq-main">
        <div
          key={current}
          ref={slideRef}
          className={`cq-q-wrap ${exiting ? 'cq-out' : 'cq-in'}`}
        >
          {/* Ghost number */}
          <div className="cq-q-ghost-num">{String(current + 1).padStart(2, '0')}</div>

          {/* Title */}
          <h2 className="cq-q-title">{q.title}</h2>

          {/* Options */}
          <div className="cq-opts">
            {q.opts.map(opt => {
              const sel = answers[q.id] === opt.val
              return (
                <div
                  key={opt.val}
                  className={`cq-opt${sel ? ' active' : ''}`}
                  onClick={() => select(opt.val)}
                >
                  <div className="cq-radio" />
                  <div>
                    <div className="cq-opt-label">{opt.label}</div>
                    {opt.desc && <div className="cq-opt-desc">{opt.desc}</div>}
                  </div>
                </div>
              )
            })}
          </div>

          {error && <div className="cq-error">⚠ {error}</div>}
        </div>
      </main>

      {/* ── Navigation ── */}
      <div className="cq-nav">
        <div className="cq-nav-inner">
          {current > 0
            ? <button className="cq-btn-ghost" onClick={prevQ}>← Atrás</button>
            : <div className="cq-spacer" />
          }
          <div className="cq-spacer" />
          <button className="cq-btn-primary" onClick={nextQ}>
            {current === 11 ? 'Ver resultados →' : 'Continuar →'}
          </button>
        </div>
      </div>

      <div className={`cq-toast ${toast.show ? 'show' : ''} ${toast.type}`}>{toast.msg}</div>
    </div>
  )
}