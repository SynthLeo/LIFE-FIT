import { useState, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '@/lib/api'

/* ─────────────────────────────────────────────
   DATA — 12 preguntas psicológicas
───────────────────────────────────────────── */
const QUESTIONS = [
  {
    id: 'estres_general', category: 'ESTRÉS Y ANSIEDAD',
    title: '¿Con qué frecuencia te sientes estresado/a en tu vida diaria?',
    opts: [
      { val: 'nunca',      label: '😌 Casi nunca',            desc: 'Me siento tranquilo/a la mayor parte del tiempo' },
      { val: 'ocasional',  label: '🔄 Ocasionalmente',         desc: 'Estrés puntual en situaciones concretas' },
      { val: 'frecuente',  label: '⚠️ Frecuentemente',         desc: 'Varios días a la semana' },
      { val: 'constante',  label: '🔴 Casi todo el tiempo',    desc: 'Siento estrés prácticamente todos los días' },
    ],
  },
  {
    id: 'ansiedad', category: 'ESTRÉS Y ANSIEDAD',
    title: '¿Has experimentado síntomas de ansiedad (palpitaciones, tensión, preocupación excesiva)?',
    opts: [
      { val: 'nunca',       label: '✅ Nunca o casi nunca',           desc: 'No reconozco síntomas de ansiedad' },
      { val: 'leve',        label: '🔵 Síntomas leves ocasionales',   desc: 'Me pasa rara vez y puedo manejarlo' },
      { val: 'moderado',    label: '🟡 Con cierta frecuencia',        desc: 'Interfiere algo con mi vida diaria' },
      { val: 'intenso',     label: '🔴 Síntomas intensos frecuentes', desc: 'Afecta notablemente mi funcionamiento' },
    ],
  },
  {
    id: 'estado_animo', category: 'ESTADO DE ÁNIMO',
    title: '¿Cómo describirías tu estado de ánimo predominante en las últimas dos semanas?',
    opts: [
      { val: 'positivo',   label: '😊 Positivo y estable',     desc: 'Me siento bien emocionalmente' },
      { val: 'variable',   label: '😐 Variable o inestable',   desc: 'Cambios de humor frecuentes' },
      { val: 'bajo',       label: '😔 Bajo o triste',           desc: 'Me cuesta encontrar alegría o motivación' },
      { val: 'muy_bajo',   label: '😞 Muy bajo / Deprimido/a', desc: 'Tristeza persistente la mayor parte del tiempo' },
    ],
  },
  {
    id: 'sueno_psico', category: 'ESTADO DE ÁNIMO',
    title: '¿Tienes dificultades para dormir relacionadas con pensamientos o emociones?',
    opts: [
      { val: 'no',              label: '✅ No, duermo bien',              desc: 'Sin problemas para conciliar el sueño' },
      { val: 'ocasional',       label: '🔄 A veces me cuesta dormirme',   desc: 'Algunas noches con pensamientos activos' },
      { val: 'frecuente',       label: '⚠️ Con frecuencia',               desc: 'Varias noches a la semana me desvelo' },
      { val: 'casi_siempre',    label: '🔴 Casi todas las noches',        desc: 'El insomnio es un problema serio para mí' },
    ],
  },
  {
    id: 'relaciones', category: 'RELACIONES SOCIALES',
    title: '¿Cómo calificarías tus relaciones personales (amigos, familia, pareja)?',
    opts: [
      { val: 'muy_buenas',  label: '💚 Muy buenas y de apoyo',    desc: 'Cuento con personas en quien confiar' },
      { val: 'buenas',      label: '🔵 Buenas en general',        desc: 'Relaciones satisfactorias, con algunos conflictos' },
      { val: 'tensas',      label: '🟡 Con bastante tensión',     desc: 'Conflictos frecuentes o distanciamiento' },
      { val: 'aislado',     label: '🔴 Me siento aislado/a',      desc: 'Poca conexión o apoyo social' },
    ],
  },
  {
    id: 'rendimiento_academico', category: 'RENDIMIENTO Y VIDA DIARIA',
    title: '¿Tu bienestar emocional afecta tu rendimiento académico o laboral?',
    opts: [
      { val: 'no',           label: '✅ No, rindo bien',                   desc: 'Mis emociones no impactan mi desempeño' },
      { val: 'poco',         label: '🔵 Levemente',                        desc: 'A veces me cuesta concentrarme' },
      { val: 'moderado',     label: '🟡 Moderadamente',                   desc: 'Bajo rendimiento en periodos de estrés' },
      { val: 'mucho',        label: '🔴 Bastante',                         desc: 'Mi estado emocional afecta seriamente mi desempeño' },
    ],
  },
  {
    id: 'autocuidado', category: 'RENDIMIENTO Y VIDA DIARIA',
    title: '¿Practicas actividades de autocuidado o relajación regularmente?',
    opts: [
      { val: 'siempre',      label: '✅ Sí, regularmente',         desc: 'Meditación, ejercicio, pasatiempos, etc.' },
      { val: 'a_veces',      label: '🔄 A veces',                  desc: 'Cuando tengo tiempo o lo recuerdo' },
      { val: 'pocas',        label: '⚠️ Pocas veces',              desc: 'Casi no me doy tiempo para mí' },
      { val: 'nunca',        label: '❌ Nunca o casi nunca',        desc: 'No tengo hábitos de autocuidado' },
    ],
  },
  {
    id: 'autoestima', category: 'AUTOESTIMA Y AUTOCONCEPTO',
    title: '¿Cómo describirías tu autoestima en general?',
    opts: [
      { val: 'alta',          label: '💪 Alta y estable',             desc: 'Me siento bien conmigo mismo/a' },
      { val: 'moderada',      label: '🔵 Moderada',                   desc: 'Generalmente bien, con inseguridades puntuales' },
      { val: 'baja',          label: '🟡 Baja con frecuencia',        desc: 'Me cuesta valorarme positivamente' },
      { val: 'muy_baja',      label: '🔴 Muy baja',                   desc: 'Pensamientos negativos frecuentes sobre mí mismo/a' },
    ],
  },
  {
    id: 'apoyo_profesional', category: 'HISTORIAL DE APOYO',
    title: '¿Has buscado ayuda psicológica o emocional anteriormente?',
    opts: [
      { val: 'si_activo',     label: '✅ Sí, actualmente en proceso',   desc: 'Tengo seguimiento psicológico activo' },
      { val: 'si_pasado',     label: '📋 Sí, en el pasado',             desc: 'Recibí apoyo antes, ahora no' },
      { val: 'no_quiero',     label: '🌱 No, pero me interesa',         desc: 'Estoy considerando buscar apoyo' },
      { val: 'no',            label: '❌ No y no lo he considerado',    desc: 'No he buscado ni considerado ayuda' },
    ],
  },
  {
    id: 'consumo_sustancias', category: 'FACTORES DE RIESGO',
    title: '¿Usas alguna sustancia (alcohol, cafeína excesiva, otras) para manejar el estrés?',
    opts: [
      { val: 'no',             label: '✅ No, no lo hago',             desc: 'Manejo el estrés de otras formas' },
      { val: 'cafeina',        label: '☕ Solo cafeína en exceso',     desc: 'Muchos cafés/energéticas para rendir' },
      { val: 'alcohol',        label: '🍺 Alcohol ocasionalmente',     desc: 'Para relajarme o desconectar' },
      { val: 'varios',         label: '⚠️ Varias sustancias',          desc: 'Combino diferentes recursos' },
    ],
  },
  {
    id: 'pensamientos_neg', category: 'FACTORES DE RIESGO',
    title: '¿Con qué frecuencia tienes pensamientos negativos persistentes sobre ti mismo/a o el futuro?',
    opts: [
      { val: 'raramente',   label: '✅ Raramente',                    desc: 'Son pensamientos puntuales que manejo bien' },
      { val: 'ocasional',   label: '🔵 Ocasionalmente',               desc: 'Aparecen pero no dominan mi día' },
      { val: 'frecuente',   label: '🟡 Con bastante frecuencia',      desc: 'Afectan mi estado de ánimo regularmente' },
      { val: 'constante',   label: '🔴 Casi constantemente',          desc: 'Dominan mi forma de pensar la mayor parte del día' },
    ],
  },
  {
    id: 'metas_bienestar', category: 'OBJETIVOS DE BIENESTAR',
    title: '¿Qué aspecto de tu bienestar mental quieres trabajar más?',
    opts: [
      { val: 'estres',       label: '🧘 Manejo del estrés',         desc: 'Técnicas de relajación y regulación emocional' },
      { val: 'ansiedad',     label: '💆 Control de la ansiedad',    desc: 'Reducir preocupaciones y tensión' },
      { val: 'autoestima',   label: '💪 Fortalecer mi autoestima',  desc: 'Mejorar mi relación conmigo mismo/a' },
      { val: 'relaciones',   label: '🤝 Mejorar relaciones',        desc: 'Comunicación y vínculos más sanos' },
    ],
  },
]

/* ─────────────────────────────────────────────
   SCORING
───────────────────────────────────────────── */
function calcPsicoScore(ans) {
  const estres     = { nunca: 20, ocasional: 14, frecuente: 6, constante: 0 }
  const ansiedad   = { nunca: 20, leve: 14, moderado: 6, intenso: 0 }
  const animo      = { positivo: 20, variable: 12, bajo: 5, muy_bajo: 0 }
  const sueno      = { no: 15, ocasional: 10, frecuente: 4, casi_siempre: 0 }
  const autocuid   = { siempre: 15, a_veces: 10, pocas: 4, nunca: 0 }
  const autoest    = { alta: 10, moderada: 7, baja: 3, muy_baja: 0 }
  return (
    (estres[ans.estres_general] || 0) +
    (ansiedad[ans.ansiedad] || 0) +
    (animo[ans.estado_animo] || 0) +
    (sueno[ans.sueno_psico] || 0) +
    (autocuid[ans.autocuidado] || 0) +
    (autoest[ans.autoestima] || 0)
  )
}

function getNivelPsico(score) {
  return score < 25 ? 'critico' : score < 50 ? 'vulnerable' : score < 75 ? 'moderado' : 'resiliente'
}

function getRecursosPsico(ans) {
  const recursos = []
  const score = calcPsicoScore(ans)

  if (ans.estres_general === 'constante' || ans.estres_general === 'frecuente')
    recursos.push({ icon: '🧘', titulo: 'Técnicas de Respiración y Mindfulness', desc: 'Practica 5 min de respiración diafragmática al despertar. Reduce el cortisol y mejora la claridad mental.', badge: 'prioritario', badgeClass: 'high' })
  if (ans.ansiedad === 'intenso' || ans.ansiedad === 'moderado')
    recursos.push({ icon: '🧠', titulo: 'Terapia Cognitivo-Conductual', desc: 'El servicio de psicología ofrece sesiones de TCC. Es el enfoque con mayor evidencia para la ansiedad.', badge: 'recomendado', badgeClass: 'high' })
  if (ans.estado_animo === 'muy_bajo' || ans.estado_animo === 'bajo')
    recursos.push({ icon: '💬', titulo: 'Consulta Psicológica Urgente', desc: 'No estás solo/a. Solicita una cita esta semana. El estado de ánimo bajo persistente merece atención profesional.', badge: 'urgente', badgeClass: 'high' })
  if (ans.sueno_psico === 'casi_siempre' || ans.sueno_psico === 'frecuente')
    recursos.push({ icon: '😴', titulo: 'Higiene del Sueño', desc: 'Establece un ritual de sueño: misma hora, sin pantallas 1h antes, temperatura fresca. Mejora el estado de ánimo en 2 semanas.', badge: 'hábito', badgeClass: 'med' })
  if (ans.relaciones === 'aislado' || ans.relaciones === 'tensas')
    recursos.push({ icon: '🤝', titulo: 'Apoyo Social y Grupos', desc: 'El aislamiento amplifica el malestar. Explora grupos estudiantiles o actividades sociales en el campus.', badge: 'recomendado', badgeClass: 'med' })
  if (ans.autocuidado === 'nunca' || ans.autocuidado === 'pocas')
    recursos.push({ icon: '🌿', titulo: 'Plan de Autocuidado', desc: 'Dedica 20 minutos diarios a algo que disfrutes sin culpa. El autocuidado no es un lujo, es una necesidad.', badge: 'hábito', badgeClass: '' })
  if (ans.consumo_sustancias !== 'no')
    recursos.push({ icon: '⚠️', titulo: 'Alternativas al Manejo con Sustancias', desc: 'El ejercicio, la escritura o hablar con alguien son formas más saludables de gestionar el estrés.', badge: 'atencion', badgeClass: 'med' })
  if (recursos.length === 0)
    recursos.push({ icon: '🌟', titulo: 'Mantén tu Bienestar', desc: 'Tu perfil psicológico es sólido. Sigue con tus hábitos de autocuidado y conexiones sociales.', badge: 'excelente', badgeClass: 'high' })
  return recursos.slice(0, 4)
}

function getTipsPsico(ans) {
  const tips = []
  if (ans.pensamientos_neg === 'constante' || ans.pensamientos_neg === 'frecuente')
    tips.push({ icon: '📝', text: 'El diario emocional funciona: escribe 3 pensamientos negativos al día y cuestiona su veracidad. Reduce la rumiación en semanas.' })
  if (ans.rendimiento_academico === 'mucho' || ans.rendimiento_academico === 'moderado')
    tips.push({ icon: '📚', text: 'La técnica Pomodoro (25 min trabajo, 5 descanso) mejora el enfoque cuando el estrés interfiere con la concentración.' })
  if (ans.apoyo_profesional === 'no_quiero')
    tips.push({ icon: '🌱', text: 'Dar el primer paso es lo más difícil. Una sola consulta puede cambiar tu perspectiva. El servicio es gratuito y confidencial.' })
  if (ans.autoestima === 'muy_baja' || ans.autoestima === 'baja')
    tips.push({ icon: '💪', text: 'Empieza con micrologros: una tarea completada al día. La autoestima se construye con evidencia de que eres capaz.' })
  if (ans.metas_bienestar === 'estres')
    tips.push({ icon: '🧘', text: 'La app Insight Timer ofrece meditaciones guiadas gratuitas. Solo 10 minutos al día tienen efecto comprobado en el estrés.' })
  if (tips.length === 0)
    tips.push({ icon: '✨', text: 'Comparte tus estrategias de bienestar con quienes te rodean. El bienestar mental es colectivo.' })
  return tips.slice(0, 3)
}

/* ─────────────────────────────────────────────
   ESTILOS — color púrpura psicología #7C3AED
───────────────────────────────────────────── */
const COLOR = '#7C3AED'
const CSS = `
  @import url('https://fonts.googleapis.com/css2?family=Barlow+Condensed:wght@400;600;700;800;900&family=DM+Sans:wght@300;400;500;600&family=Space+Mono:wght@400;700&display=swap');

  .ps-wrap { background:var(--color-background); min-height:100vh; font-family:'DM Sans',sans-serif; color:var(--color-foreground); }

  .ps-header { background:var(--color-background); border-bottom:1px solid var(--border-subtle); height:62px; display:flex; align-items:center; padding:0 24px; gap:16px; position:sticky; top:0; z-index:100; }
  .ps-back { background:none; border:none; color:var(--color-muted-foreground); cursor:pointer; font-family:'DM Sans',sans-serif; font-size:0.875rem; display:flex; align-items:center; gap:6px; padding:6px 0; transition:color 160ms; flex-shrink:0; }
  .ps-back:hover { color:var(--color-foreground); }
  .ps-header-title { font-family:'Barlow Condensed',sans-serif; font-size:1.0625rem; font-weight:700; letter-spacing:0.12em; text-transform:uppercase; flex:1; text-align:center; color:var(--color-foreground); }
  .ps-counter { font-family:'Space Mono',monospace; font-size:0.6rem; letter-spacing:0.12em; text-transform:uppercase; color:var(--color-muted-foreground); min-width:44px; text-align:right; flex-shrink:0; }

  .ps-progress { background:var(--color-background); border-bottom:1px solid var(--border-subtle); padding:12px 24px; position:sticky; top:62px; z-index:99; }
  .ps-progress-meta { display:flex; justify-content:space-between; align-items:center; margin-bottom:8px; }
  .ps-cat-tag { font-family:'Space Mono',monospace; font-size:0.52rem; letter-spacing:0.18em; text-transform:uppercase; color:${COLOR}; background:rgba(124,58,237,0.07); border:1px solid rgba(124,58,237,0.22); padding:3px 9px; display:inline-block; }
  .ps-pct-label { font-family:'Space Mono',monospace; font-size:0.58rem; letter-spacing:0.1em; color:var(--color-muted-foreground); }
  .ps-track { height:2px; background:var(--surface-2); overflow:hidden; }
  .ps-fill { height:100%; background:${COLOR}; transition:width 400ms cubic-bezier(0.4,0,0.2,1); box-shadow:0 0 10px rgba(124,58,237,0.45); }

  .ps-main { max-width:600px; margin:0 auto; padding:36px 24px 120px; }

  @keyframes psIn  { from { opacity:0; transform:translateX(30px); } to { opacity:1; transform:translateX(0); } }
  @keyframes psOut { from { opacity:1; transform:translateX(0); }   to { opacity:0; transform:translateX(-30px); } }
  @keyframes psFade{ from { opacity:0; transform:translateY(18px); } to { opacity:1; transform:translateY(0); } }
  @keyframes psSpin{ to { transform:rotate(360deg); } }

  .ps-in   { animation:psIn  280ms cubic-bezier(0.16,1,0.3,1) forwards; }
  .ps-out  { animation:psOut 240ms ease forwards; }
  .ps-fade { animation:psFade 400ms ease both; }

  .ps-q-wrap { position:relative; }
  .ps-ghost-num { font-family:'Barlow Condensed',sans-serif; font-weight:900; font-size:7rem; line-height:1; color:rgba(255,255,255,0.03); position:absolute; top:-24px; right:-4px; letter-spacing:-0.04em; user-select:none; pointer-events:none; }
  .ps-q-title { font-family:'DM Sans',sans-serif; font-size:1.125rem; font-weight:500; line-height:1.55; color:var(--color-foreground); margin:0 0 26px; padding-right:40px; }

  .ps-opts { display:flex; flex-direction:column; gap:8px; }
  .ps-opt { display:flex; align-items:center; gap:14px; padding:15px 18px; background:var(--color-card); border:1px solid var(--border-subtle); border-left:3px solid transparent; cursor:pointer; transition:background 160ms,border-color 160ms; user-select:none; }
  .ps-opt:hover { background:var(--color-card); border-left-color:rgba(124,58,237,0.2); }
  .ps-opt.active { background:rgba(124,58,237,0.06); border-color:rgba(124,58,237,0.28); border-left-color:${COLOR}; }
  .ps-radio { width:19px; height:19px; border:2px solid var(--border-medium); border-radius:50%; flex-shrink:0; position:relative; transition:border-color 160ms,background 160ms; }
  .ps-opt.active .ps-radio { border-color:${COLOR}; background:${COLOR}; }
  .ps-opt.active .ps-radio::after { content:''; position:absolute; inset:4px; background:var(--color-background); border-radius:50%; }
  .ps-opt-label { font-size:0.9rem; font-weight:500; color:#e8e8e8; line-height:1.3; }
  .ps-opt.active .ps-opt-label { color:var(--color-foreground); }
  .ps-opt-desc { font-size:0.74rem; color:var(--color-muted-foreground); margin-top:2px; line-height:1.35; }
  .ps-opt.active .ps-opt-desc { color:var(--color-secondary-foreground); }

  .ps-error { font-family:'Space Mono',monospace; font-size:0.58rem; color:#ff5555; letter-spacing:0.08em; text-transform:uppercase; margin-top:14px; }

  .ps-nav { position:fixed; bottom:0; left:0; right:0; background:var(--color-background); border-top:1px solid var(--border-subtle); padding:16px 24px; z-index:100; }
  .ps-nav-inner { max-width:600px; margin:0 auto; display:flex; gap:12px; align-items:center; }

  .ps-btn-primary { background:${COLOR}; color:var(--color-foreground); border:none; padding:13px 26px; font-family:'Barlow Condensed',sans-serif; font-size:0.9375rem; font-weight:800; letter-spacing:0.12em; text-transform:uppercase; cursor:pointer; transition:background 160ms,box-shadow 160ms,transform 160ms; display:inline-flex; align-items:center; gap:8px; flex-shrink:0; }
  .ps-btn-primary:hover:not(:disabled) { background:#6d28d9; box-shadow:0 0 22px rgba(124,58,237,0.28); transform:translateY(-1px); }
  .ps-btn-primary:disabled { opacity:0.45; cursor:not-allowed; }
  .ps-btn-ghost { background:transparent; color:var(--color-muted-foreground); border:1px solid var(--border-medium); padding:13px 20px; font-family:'Barlow Condensed',sans-serif; font-size:0.875rem; font-weight:700; letter-spacing:0.1em; text-transform:uppercase; cursor:pointer; transition:color 160ms,border-color 160ms; flex-shrink:0; }
  .ps-btn-ghost:hover { color:var(--color-secondary-foreground); border-color:var(--border-medium); }
  .ps-spacer { flex:1; }

  .ps-results { max-width:600px; margin:0 auto; padding:32px 24px 120px; }
  .ps-hero { text-align:center; padding:36px 0 28px; position:relative; }
  .ps-score-label { font-family:'Space Mono',monospace; font-size:0.52rem; letter-spacing:0.22em; text-transform:uppercase; color:var(--color-muted-foreground); margin-top:18px; margin-bottom:8px; }
  .ps-hero-nivel { font-family:'Barlow Condensed',sans-serif; font-size:2.625rem; font-weight:900; letter-spacing:0.06em; text-transform:uppercase; color:var(--color-foreground); line-height:1; margin-bottom:8px; }
  .ps-hero-sub { font-size:0.8125rem; color:var(--color-muted-foreground); }
  .ps-nivel-icon { font-size:1.5rem; margin-bottom:6px; display:block; }

  .ps-metrics { display:grid; grid-template-columns:1fr 1fr; gap:8px; margin-bottom:28px; }
  .ps-metric { background:var(--color-card); border:1px solid var(--border-subtle); padding:20px 16px; text-align:center; position:relative; overflow:hidden; }
  .ps-metric::before { content:''; position:absolute; top:0; left:0; right:0; height:1px; background:linear-gradient(90deg,transparent,${COLOR},transparent); opacity:0.3; }
  .ps-metric-val { font-family:'Barlow Condensed',sans-serif; font-size:1.875rem; font-weight:800; letter-spacing:0.02em; line-height:1; color:var(--color-foreground); margin-bottom:6px; }
  .ps-metric-lbl { font-family:'Space Mono',monospace; font-size:0.52rem; letter-spacing:0.14em; text-transform:uppercase; color:var(--color-muted-foreground); }

  .ps-sec-title { font-family:'Space Mono',monospace; font-size:0.55rem; letter-spacing:0.22em; text-transform:uppercase; color:var(--color-muted-foreground); padding-bottom:10px; border-bottom:1px solid var(--border-subtle); margin-bottom:14px; margin-top:28px; }

  .ps-rec { background:var(--color-card); border:1px solid var(--border-subtle); border-left:3px solid ${COLOR}; padding:18px 20px; margin-bottom:8px; transition:background 160ms,transform 160ms; }
  .ps-rec:hover { background:var(--color-card); transform:translateX(2px); }
  .ps-rec-top { display:flex; align-items:center; gap:12px; margin-bottom:6px; }
  .ps-rec-icon { font-size:1.25rem; }
  .ps-rec-name { font-family:'Barlow Condensed',sans-serif; font-size:1.1875rem; font-weight:700; letter-spacing:0.06em; text-transform:uppercase; color:var(--color-foreground); flex:1; }
  .ps-rec-desc { font-size:0.8rem; color:#525252; line-height:1.5; }

  .ps-badge { font-family:'Space Mono',monospace; font-size:0.5rem; letter-spacing:0.12em; text-transform:uppercase; padding:3px 9px; flex-shrink:0; }
  .ps-badge-high { background:rgba(124,58,237,0.09); color:#c4b5fd; border:1px solid rgba(124,58,237,0.22); }
  .ps-badge-med  { background:rgba(245,158,11,0.09); color:#fcd34d; border:1px solid rgba(245,158,11,0.22); }
  .ps-badge-def  { background:var(--surface-1); color:var(--color-muted-foreground); border:1px solid var(--border-subtle); }

  .ps-tip { display:flex; align-items:flex-start; gap:12px; padding:12px 0; border-bottom:1px solid var(--border-subtle); }
  .ps-tip:last-child { border-bottom:none; }
  .ps-tip-icon { font-size:0.9375rem; flex-shrink:0; margin-top:1px; }
  .ps-tip-text { font-size:0.8rem; color:#525252; line-height:1.55; }

  .ps-cta { display:flex; flex-direction:column; gap:10px; margin-top:32px; }
  .ps-btn-primary.full { width:100%; justify-content:center; }
  .ps-btn-ghost.full   { width:100%; text-align:center; }

  .ps-spinner { width:15px; height:15px; border:2px solid var(--border-medium); border-top-color:var(--color-foreground); border-radius:50%; animation:psSpin 0.7s linear infinite; display:inline-block; }

  .ps-toast { position:fixed; bottom:92px; left:50%; transform:translateX(-50%) translateY(12px); background:var(--color-card); border:1px solid var(--border-medium); color:var(--color-foreground); padding:9px 20px; font-family:'Space Mono',monospace; font-size:0.6rem; letter-spacing:0.1em; text-transform:uppercase; opacity:0; transition:opacity 250ms,transform 250ms; pointer-events:none; white-space:nowrap; z-index:200; }
  .ps-toast.show { opacity:1; transform:translateX(-50%) translateY(0); }
  .ps-toast.success { border-color:rgba(124,58,237,0.25); color:${COLOR}; }
  .ps-toast.error   { border-color:rgba(255,70,70,0.25); color:#ff7070; }

  @keyframes psRing { from { stroke-dashoffset:440; } to { stroke-dashoffset:var(--ps-ring-offset); } }
  .ps-ring-fg { animation:psRing 1.2s cubic-bezier(0.4,0,0.2,1) 0.4s both; }
`

export default function CuestionarioPsicologia() {
  const navigate = useNavigate()
  const [current, setCurrent] = useState(0)
  const [answers, setAnswers] = useState({})
  const [error, setError] = useState('')
  const [exiting, setExiting] = useState(false)
  const [showResults, setShowResults] = useState(false)
  const [saving, setSaving] = useState(false)
  const [toast, setToast] = useState({ show: false, msg: '', type: 'error' })
  const slideRef = useRef(null)

  const q = QUESTIONS[current]
  const pct = Math.round(((current + 1) / QUESTIONS.length) * 100)

  const showToast = (msg, type = 'error') => {
    setToast({ show: true, msg, type })
    setTimeout(() => setToast(t => ({ ...t, show: false })), 4000)
  }

  function select(val) { setAnswers(a => ({ ...a, [q.id]: val })); setError('') }

  function nextQ() {
    if (!answers[q.id]) {
      setError('Selecciona una opción para continuar.')
      slideRef.current?.animate([
        { transform: 'translateX(0)' }, { transform: 'translateX(-8px)' },
        { transform: 'translateX(8px)' }, { transform: 'translateX(-4px)' },
        { transform: 'translateX(0)' },
      ], { duration: 300 })
      return
    }
    if (current < QUESTIONS.length - 1) {
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
    const score = calcPsicoScore(answers)
    const nivel = getNivelPsico(score)
    console.log('SCORE:', score, '| NIVEL:', JSON.stringify(nivel), '| TIPO:', typeof nivel)
    try {
      await api.post('/Cuestionario/GuardarPsicologico.php', { ...answers, psico_score: score, nivel_psicologico: nivel })
      showToast('Perfil psicológico guardado exitosamente.', 'success')
      setTimeout(() => navigate('/psicologia'), 1500)
    } catch (e) {
      showToast(e.response?.data?.error ?? 'Error al guardar el perfil.')
      setSaving(false)
    }
  }

  function reset() { setAnswers({}); setCurrent(0); setShowResults(false); setError(''); window.scrollTo({ top: 0, behavior: 'smooth' }) }

  /* ── RESULTS VIEW ── */
  if (showResults) {
    const score = calcPsicoScore(answers)
    const nivel = getNivelPsico(score)
    const recursos = getRecursosPsico(answers)
    const tips = getTipsPsico(answers)

    const icons  = { critico: '🆘', vulnerable: '⚠️', moderado: '🔵', resiliente: '🌟' }
    const labels = { critico: 'Atención Inmediata', vulnerable: 'Perfil Vulnerable', moderado: 'Bienestar Moderado', resiliente: 'Perfil Resiliente' }
    const animoLabel = { positivo: 'Positivo', variable: 'Variable', bajo: 'Bajo', muy_bajo: 'Muy bajo' }
    const autocuidLabel = { siempre: 'Excelente', a_veces: 'Moderado', pocas: 'Bajo', nunca: 'Sin hábito' }
    const badgeCls = { high: 'ps-badge-high', med: 'ps-badge-med', '': 'ps-badge-def' }

    const R = 68
    const C = 2 * Math.PI * R
    const dashOffset = C - (C * score / 100)

    return (
      <div className="ps-wrap">
        <style>{CSS}</style>
        <header className="ps-header">
          <button className="ps-back" onClick={reset}>← Volver</button>
          <div className="ps-header-title">Resultados Psicológicos</div>
          <div className="ps-counter">Análisis</div>
        </header>

        <div className="ps-results ps-fade">
          <div className="ps-hero">
            <svg width="170" height="170" viewBox="0 0 170 170">
              <circle cx="85" cy="85" r="80" fill="none" stroke="rgba(255,255,255,0.03)" strokeWidth="1" />
              <circle cx="85" cy="85" r={R} fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="8" />
              <circle cx="85" cy="85" r={R} fill="none" stroke={COLOR} strokeWidth="8" strokeLinecap="butt"
                strokeDasharray={C} strokeDashoffset={dashOffset} transform="rotate(-90 85 85)"
                className="ps-ring-fg" style={{ '--ps-ring-offset': dashOffset }} />
              <text x="85" y="78" textAnchor="middle" fill="#ffffff" fontFamily="'Barlow Condensed',sans-serif" fontWeight="900" fontSize="40" letterSpacing="-1">{score}</text>
              <text x="85" y="97" textAnchor="middle" fill="#444444" fontFamily="'Space Mono',monospace" fontSize="9" letterSpacing="2">/100</text>
            </svg>
            <div className="ps-score-label">Score de bienestar mental</div>
            <span className="ps-nivel-icon">{icons[nivel]}</span>
            <div className="ps-hero-nivel">{labels[nivel]}</div>
            <div className="ps-hero-sub">Basado en tus 12 respuestas</div>
          </div>

          <div className="ps-metrics">
            {[
              { val: `${score}/100`, lbl: 'Score mental' },
              { val: nivel === 'resiliente' ? 'Resiliente' : nivel === 'moderado' ? 'Moderado' : nivel === 'vulnerable' ? 'Vulnerable' : 'Crítico', lbl: 'Nivel de bienestar' },
              { val: animoLabel[answers.estado_animo] || '—', lbl: 'Estado de ánimo' },
              { val: autocuidLabel[answers.autocuidado] || '—', lbl: 'Autocuidado' },
            ].map((m, i) => (
              <div className="ps-metric" key={i}>
                <div className="ps-metric-val">{m.val}</div>
                <div className="ps-metric-lbl">{m.lbl}</div>
              </div>
            ))}
          </div>

          <div className="ps-sec-title">Recursos y recomendaciones</div>
          {recursos.map((r, i) => (
            <div className="ps-rec" key={i}>
              <div className="ps-rec-top">
                <span className="ps-rec-icon">{r.icon}</span>
                <span className="ps-rec-name">{r.titulo}</span>
                <span className={`ps-badge ${badgeCls[r.badgeClass]}`}>{r.badge}</span>
              </div>
              <p className="ps-rec-desc">{r.desc}</p>
            </div>
          ))}

          <div className="ps-sec-title">Consejos personalizados</div>
          <div>
            {tips.map((t, i) => (
              <div className="ps-tip" key={i}>
                <span className="ps-tip-icon">{t.icon}</span>
                <span className="ps-tip-text">{t.text}</span>
              </div>
            ))}
          </div>

          <div className="ps-cta">
            <button className="ps-btn-primary full" onClick={saveResults} disabled={saving}>
              {saving ? <><span className="ps-spinner" /> Guardando perfil...</> : 'Guardar perfil y ver módulo de psicología →'}
            </button>
            <button className="ps-btn-ghost full" onClick={reset} disabled={saving}>Volver a hacer el cuestionario</button>
          </div>
        </div>

        <div className={`ps-toast ${toast.show ? 'show' : ''} ${toast.type}`}>{toast.msg}</div>
      </div>
    )
  }

  /* ── QUESTIONNAIRE VIEW ── */
  return (
    <div className="ps-wrap">
      <style>{CSS}</style>
      <header className="ps-header">
        <button className="ps-back" onClick={() => navigate(-1)}>← Volver</button>
        <div className="ps-header-title">Cuestionario Psicológico</div>
        <div className="ps-counter">{current + 1} / {QUESTIONS.length}</div>
      </header>

      <div className="ps-progress">
        <div className="ps-progress-meta">
          <span className="ps-cat-tag">{q.category}</span>
          <span className="ps-pct-label">{pct}%</span>
        </div>
        <div className="ps-track"><div className="ps-fill" style={{ width: `${pct}%` }} /></div>
      </div>

      <main className="ps-main">
        <div key={current} ref={slideRef} className={`ps-q-wrap ${exiting ? 'ps-out' : 'ps-in'}`}>
          <div className="ps-ghost-num">{String(current + 1).padStart(2, '0')}</div>
          <h2 className="ps-q-title">{q.title}</h2>
          <div className="ps-opts">
            {q.opts.map(opt => {
              const sel = answers[q.id] === opt.val
              return (
                <div key={opt.val} className={`ps-opt${sel ? ' active' : ''}`} onClick={() => select(opt.val)}>
                  <div className="ps-radio" />
                  <div>
                    <div className="ps-opt-label">{opt.label}</div>
                    {opt.desc && <div className="ps-opt-desc">{opt.desc}</div>}
                  </div>
                </div>
              )
            })}
          </div>
          {error && <div className="ps-error">⚠ {error}</div>}
        </div>
      </main>

      <div className="ps-nav">
        <div className="ps-nav-inner">
          {current > 0
            ? <button className="ps-btn-ghost" onClick={prevQ}>← Atrás</button>
            : <div className="ps-spacer" />}
          <div className="ps-spacer" />
          <button className="ps-btn-primary" onClick={nextQ}>
            {current === QUESTIONS.length - 1 ? 'Ver resultados →' : 'Continuar →'}
          </button>
        </div>
      </div>

      <div className={`ps-toast ${toast.show ? 'show' : ''} ${toast.type}`}>{toast.msg}</div>
    </div>
  )
}
