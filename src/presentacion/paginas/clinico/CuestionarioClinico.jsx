import { useState, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '@/lib/api'

/* ─────────────────────────────────────────────
   DATA — 12 preguntas clínicas
───────────────────────────────────────────── */
const QUESTIONS = [
  {
    id: 'visitas_medico', category: 'HISTORIAL MÉDICO',
    title: '¿Con qué frecuencia visitas al médico para chequeos preventivos?',
    opts: [
      { val: 'nunca',      label: '❌ Nunca',               desc: 'No tengo chequeos regulares' },
      { val: 'rara_vez',   label: '🔄 Rara vez',             desc: 'Solo cuando estoy muy enfermo/a' },
      { val: 'anual',      label: '📅 Una vez al año',        desc: 'Chequeo anual de rutina' },
      { val: 'frecuente',  label: '✅ Más de una vez al año', desc: 'Seguimiento activo de mi salud' },
    ],
  },
  {
    id: 'condicion_cronica', category: 'HISTORIAL MÉDICO',
    title: '¿Tienes alguna condición médica crónica diagnosticada?',
    opts: [
      { val: 'ninguna',         label: '✅ No tengo ninguna',               desc: 'Sin diagnósticos crónicos' },
      { val: 'controlada',      label: '⚠️ Sí, pero está bien controlada', desc: 'Con medicación o tratamiento activo' },
      { val: 'sin_control',     label: '🔴 Sí, sin control adecuado',        desc: 'Necesito seguimiento médico' },
      { val: 'prefiero_no',     label: '🔒 Prefiero no responder',            desc: '' },
    ],
  },
  {
    id: 'medicamentos', category: 'HISTORIAL MÉDICO',
    title: '¿Tomas medicamentos de forma regular?',
    opts: [
      { val: 'ninguno',        label: '✅ Ninguno',                          desc: 'No tomo medicamentos regularmente' },
      { val: 'vitaminas',      label: '💊 Solo vitaminas o suplementos',    desc: 'Sin medicamentos de prescripción' },
      { val: 'prescripcion',   label: '💉 Medicamentos de prescripción',    desc: 'Con receta médica' },
      { val: 'varios',         label: '🧪 Varios medicamentos',              desc: 'Tratamiento múltiple' },
    ],
  },
  {
    id: 'presion_arterial', category: 'SIGNOS VITALES',
    title: '¿Conoces tu presión arterial actual?',
    opts: [
      { val: 'normal',      label: '🟢 Sí, está en rango normal',       desc: 'Por debajo de 120/80 mmHg' },
      { val: 'alta',        label: '🔴 Sí, tengo presión alta',          desc: 'Hipertensión diagnosticada o sospecha' },
      { val: 'baja',        label: '🔵 Sí, tengo presión baja',          desc: 'Hipotensión frecuente' },
      { val: 'no_se',       label: '❓ No lo sé',                         desc: 'No me la he medido recientemente' },
    ],
  },
  {
    id: 'sueno', category: 'HÁBITOS DE SALUD',
    title: '¿Cuántas horas duermes en promedio por noche?',
    opts: [
      { val: 'menos_5',  label: '😴 Menos de 5 horas',    desc: 'Privación severa de sueño' },
      { val: '5_6',      label: '😐 Entre 5 y 6 horas',   desc: 'Por debajo del mínimo recomendado' },
      { val: '7_8',      label: '✅ Entre 7 y 8 horas',   desc: 'Rango óptimo recomendado' },
      { val: 'mas_9',    label: '🛌 Más de 9 horas',       desc: 'Puede indicar fatiga o somnolencia excesiva' },
    ],
  },
  {
    id: 'tabaco', category: 'HÁBITOS DE SALUD',
    title: '¿Fumas o consumes tabaco en alguna de sus formas?',
    opts: [
      { val: 'nunca',       label: '✅ Nunca he fumado',          desc: 'Sin exposición a tabaco' },
      { val: 'exfumador',   label: '🚭 Ex fumador/a',              desc: 'Lo dejé hace más de 6 meses' },
      { val: 'ocasional',   label: '⚠️ Ocasionalmente',            desc: 'Menos de 5 cigarrillos por semana' },
      { val: 'regular',     label: '🚬 Regularmente',              desc: 'Consumo diario' },
    ],
  },
  {
    id: 'alcohol', category: 'HÁBITOS DE SALUD',
    title: '¿Con qué frecuencia consumes alcohol?',
    opts: [
      { val: 'nunca',       label: '✅ No consumo',               desc: 'Abstinencia total' },
      { val: 'social',      label: '🥂 Ocasionalmente / Social',   desc: 'Menos de 2 veces por semana' },
      { val: 'frecuente',   label: '⚠️ Varias veces por semana',  desc: 'Consumo moderado a frecuente' },
      { val: 'diario',      label: '🔴 Diariamente',               desc: 'Consumo diario' },
    ],
  },
  {
    id: 'sintomas_frecuentes', category: 'SÍNTOMAS ACTUALES',
    title: '¿Experimentas alguno de estos síntomas con frecuencia?',
    opts: [
      { val: 'ninguno',    label: '✅ Ninguno de estos',        desc: 'Me siento bien en general' },
      { val: 'fatiga',     label: '😴 Fatiga / Cansancio',      desc: 'Agotamiento sin causa clara' },
      { val: 'dolor',      label: '🤕 Dolor frecuente',          desc: 'Cabeza, espalda, articulaciones' },
      { val: 'digestivo',  label: '🍽️ Molestias digestivas',   desc: 'Gastritis, colitis, acidez' },
    ],
  },
  {
    id: 'vacunas', category: 'PREVENCIÓN',
    title: '¿Tienes tu esquema de vacunación al día?',
    opts: [
      { val: 'completo',    label: '✅ Sí, completo',               desc: 'Todas las vacunas básicas aplicadas' },
      { val: 'incompleto',  label: '⚠️ Creo que está incompleto', desc: 'Me faltan algunas vacunas' },
      { val: 'no_se',       label: '❓ No lo sé',                   desc: 'No tengo registro de mis vacunas' },
      { val: 'no',          label: '❌ No, no están al día',        desc: 'Sin vacunas recientes' },
    ],
  },
  {
    id: 'estres_fisico', category: 'BIENESTAR GENERAL',
    title: '¿Cómo calificarías tu estado de salud general actualmente?',
    opts: [
      { val: 'excelente', label: '🟢 Excelente',  desc: 'Me siento muy bien físicamente' },
      { val: 'bueno',     label: '🔵 Bueno',       desc: 'Algunos malestares menores' },
      { val: 'regular',   label: '🟡 Regular',     desc: 'Tengo molestias frecuentes' },
      { val: 'malo',      label: '🔴 Malo',         desc: 'Problemas de salud constantes' },
    ],
  },
  {
    id: 'hidratacion', category: 'HÁBITOS DE SALUD',
    title: '¿Cuántos vasos de agua bebes al día aproximadamente?',
    opts: [
      { val: 'menos_4',  label: '⚠️ Menos de 4 vasos',   desc: 'Hidratación muy baja' },
      { val: '4_6',      label: '🔵 Entre 4 y 6 vasos',  desc: 'Por debajo del mínimo recomendado' },
      { val: '6_8',      label: '✅ Entre 6 y 8 vasos',  desc: 'Cerca del nivel recomendado' },
      { val: 'mas_8',    label: '💧 Más de 8 vasos',     desc: 'Excelente hidratación' },
    ],
  },
  {
    id: 'urgencias', category: 'SERVICIOS MÉDICOS',
    title: '¿Has acudido a urgencias o servicio de salud en los últimos 6 meses?',
    opts: [
      { val: 'no',          label: '✅ No, ninguna vez',           desc: 'Sin visitas de urgencia recientes' },
      { val: 'una',         label: '📋 Una vez',                   desc: 'Una visita por alguna molestia' },
      { val: 'dos_tres',    label: '⚠️ Dos o tres veces',          desc: 'Varias visitas recientes' },
      { val: 'mas_tres',    label: '🔴 Más de tres veces',          desc: 'Seguimiento médico frecuente' },
    ],
  },
]

/* ─────────────────────────────────────────────
   SCORING
───────────────────────────────────────────── */
function calcSaludScore(ans) {
  const visitas  = { nunca: 0, rara_vez: 5, anual: 15, frecuente: 20 }
  const cronica  = { ninguna: 20, controlada: 12, sin_control: 3, prefiero_no: 8 }
  const sueno    = { menos_5: 0, '5_6': 5, '7_8': 20, mas_9: 10 }
  const tabaco   = { nunca: 15, exfumador: 10, ocasional: 5, regular: 0 }
  const alcohol  = { nunca: 15, social: 10, frecuente: 4, diario: 0 }
  const hidrat   = { menos_4: 0, '4_6': 5, '6_8': 12, mas_8: 15 }
  const general  = { malo: 0, regular: 5, bueno: 10, excelente: 15 }
  return (
    (visitas[ans.visitas_medico] || 0) +
    (cronica[ans.condicion_cronica] || 0) +
    (sueno[ans.sueno] || 0) +
    (tabaco[ans.tabaco] || 0) +
    (alcohol[ans.alcohol] || 0) +
    (hidrat[ans.hidratacion] || 0) +
    (general[ans.estres_fisico] || 0)
  )
}

function getNivelSalud(score) {
  Math.round((raw / 120) * 100)
}

function getRecomendaciones(ans) {
  const recs = []
  if (ans.visitas_medico === 'nunca' || ans.visitas_medico === 'rara_vez')
    recs.push({ icon: '🏥', titulo: 'Chequeo Médico General', desc: 'Agenda una consulta preventiva este mes. Detectar a tiempo ahorra problemas futuros.', badge: 'prioritario', badgeClass: 'high' })
  if (ans.condicion_cronica === 'sin_control')
    recs.push({ icon: '💊', titulo: 'Control de Condición Crónica', desc: 'Tu condición necesita seguimiento. Agenda con el servicio clínico esta semana.', badge: 'urgente', badgeClass: 'high' })
  if (ans.sueno === 'menos_5' || ans.sueno === '5_6')
    recs.push({ icon: '😴', titulo: 'Higiene del Sueño', desc: 'Duerme entre 7-8 horas. Establece horarios regulares y evita pantallas antes de dormir.', badge: 'importante', badgeClass: 'med' })
  if (ans.tabaco === 'regular' || ans.tabaco === 'ocasional')
    recs.push({ icon: '🚭', titulo: 'Programa Antitabaco', desc: 'El servicio médico ofrece apoyo para dejar de fumar. Solicita información en tu próxima visita.', badge: 'recomendado', badgeClass: 'med' })
  if (ans.alcohol === 'frecuente' || ans.alcohol === 'diario')
    recs.push({ icon: '🍺', titulo: 'Reducción de Consumo de Alcohol', desc: 'Considera reducir tu consumo. El equipo clínico puede orientarte sin juicios.', badge: 'recomendado', badgeClass: 'med' })
  if (ans.hidratacion === 'menos_4' || ans.hidratacion === '4_6')
    recs.push({ icon: '💧', titulo: 'Mejora tu Hidratación', desc: 'Consume al menos 8 vasos de agua al día. Una botella de 1L que llevas al día puede ayudarte.', badge: 'hábito', badgeClass: '' })
  if (ans.vacunas === 'incompleto' || ans.vacunas === 'no' || ans.vacunas === 'no_se')
    recs.push({ icon: '💉', titulo: 'Actualiza tu Vacunación', desc: 'El servicio médico ofrece vacunas gratuitas. Pasa a revisar tu cartilla de vacunación.', badge: 'preventivo', badgeClass: '' })
  if (ans.sintomas_frecuentes !== 'ninguno')
    recs.push({ icon: '🩺', titulo: 'Evaluación de Síntomas', desc: 'Los síntomas frecuentes merecen atención. Usa el módulo de evaluación de síntomas en esta app.', badge: 'seguimiento', badgeClass: '' })
  if (recs.length === 0)
    recs.push({ icon: '⭐', titulo: 'Mantén tus Hábitos', desc: 'Tu perfil de salud es sólido. Sigue con tus chequeos preventivos y hábitos saludables.', badge: 'excelente', badgeClass: 'high' })
  return recs.slice(0, 4)
}

function getTipsClinico(ans) {
  const tips = []
  const score = calcSaludScore(ans)
  if (ans.presion_arterial === 'alta')
    tips.push({ icon: '🩸', text: 'La hipertensión silenciosa puede dañar órganos sin síntomas. Toma tu medicación y reduce el sodio.' })
  if (ans.presion_arterial === 'no_se')
    tips.push({ icon: '📏', text: 'Mide tu presión arterial en la próxima visita al módulo clínico. Es rápido y gratuito.' })
  if (ans.urgencias === 'dos_tres' || ans.urgencias === 'mas_tres')
    tips.push({ icon: '🏥', text: 'Las visitas frecuentes a urgencias pueden prevenirse con citas programadas. Agenda seguimiento.' })
  if (ans.medicamentos === 'varios')
    tips.push({ icon: '💊', text: 'Con múltiples medicamentos, es importante revisión farmacológica periódica para evitar interacciones.' })
  if (score >= 85)
    tips.push({ icon: '🌟', text: 'Tu salud general es excelente. Comparte tus buenos hábitos con tu entorno.' })
  if (tips.length === 0)
    tips.push({ icon: '📋', text: 'Guarda un registro de tus signos vitales mensualmente. Detectar cambios a tiempo es clave.' })
  return tips.slice(0, 3)
}

/* ─────────────────────────────────────────────
   ESTILOS — misma paleta que CuestionarioPage
   pero con color azul clínico #0284C7
───────────────────────────────────────────── */
const COLOR = '#0284C7'
const CSS = `
  @import url('https://fonts.googleapis.com/css2?family=Barlow+Condensed:wght@400;600;700;800;900&family=DM+Sans:wght@300;400;500;600&family=Space+Mono:wght@400;700&display=swap');

  .cl-wrap { background:var(--color-background); min-height:100vh; font-family:'DM Sans',sans-serif; color:var(--color-foreground); }

  .cl-header { background:var(--color-background); border-bottom:1px solid var(--border-subtle); height:62px; display:flex; align-items:center; padding:0 24px; gap:16px; position:sticky; top:0; z-index:100; }
  .cl-back { background:none; border:none; color:var(--color-muted-foreground); cursor:pointer; font-family:'DM Sans',sans-serif; font-size:0.875rem; display:flex; align-items:center; gap:6px; padding:6px 0; transition:color 160ms; flex-shrink:0; }
  .cl-back:hover { color:var(--color-foreground); }
  .cl-header-title { font-family:'Barlow Condensed',sans-serif; font-size:1.0625rem; font-weight:700; letter-spacing:0.12em; text-transform:uppercase; flex:1; text-align:center; color:var(--color-foreground); }
  .cl-counter { font-family:'Space Mono',monospace; font-size:0.6rem; letter-spacing:0.12em; text-transform:uppercase; color:var(--color-muted-foreground); min-width:44px; text-align:right; flex-shrink:0; }

  .cl-progress { background:var(--color-background); border-bottom:1px solid var(--border-subtle); padding:12px 24px; position:sticky; top:62px; z-index:99; }
  .cl-progress-meta { display:flex; justify-content:space-between; align-items:center; margin-bottom:8px; }
  .cl-cat-tag { font-family:'Space Mono',monospace; font-size:0.52rem; letter-spacing:0.18em; text-transform:uppercase; color:${COLOR}; background:rgba(2,132,199,0.07); border:1px solid rgba(2,132,199,0.22); padding:3px 9px; display:inline-block; }
  .cl-pct-label { font-family:'Space Mono',monospace; font-size:0.58rem; letter-spacing:0.1em; color:var(--color-muted-foreground); }
  .cl-track { height:2px; background:var(--surface-2); overflow:hidden; }
  .cl-fill { height:100%; background:${COLOR}; transition:width 400ms cubic-bezier(0.4,0,0.2,1); box-shadow:0 0 10px rgba(2,132,199,0.45); }

  .cl-main { max-width:600px; margin:0 auto; padding:36px 24px 120px; }

  @keyframes clIn  { from { opacity:0; transform:translateX(30px); } to { opacity:1; transform:translateX(0); } }
  @keyframes clOut { from { opacity:1; transform:translateX(0); }   to { opacity:0; transform:translateX(-30px); } }
  @keyframes clFade{ from { opacity:0; transform:translateY(18px); } to { opacity:1; transform:translateY(0); } }
  @keyframes clSpin{ to { transform:rotate(360deg); } }

  .cl-in   { animation:clIn  280ms cubic-bezier(0.16,1,0.3,1) forwards; }
  .cl-out  { animation:clOut 240ms ease forwards; }
  .cl-fade { animation:clFade 400ms ease both; }

  .cl-q-wrap { position:relative; }
  .cl-ghost-num { font-family:'Barlow Condensed',sans-serif; font-weight:900; font-size:7rem; line-height:1; color:rgba(255,255,255,0.03); position:absolute; top:-24px; right:-4px; letter-spacing:-0.04em; user-select:none; pointer-events:none; }
  .cl-q-title { font-family:'DM Sans',sans-serif; font-size:1.125rem; font-weight:500; line-height:1.55; color:var(--color-foreground); margin:0 0 26px; padding-right:40px; }

  .cl-opts { display:flex; flex-direction:column; gap:8px; }
  .cl-opt { display:flex; align-items:center; gap:14px; padding:15px 18px; background:var(--color-card); border:1px solid var(--border-subtle); border-left:3px solid transparent; cursor:pointer; transition:background 160ms,border-color 160ms; user-select:none; }
  .cl-opt:hover { background:var(--color-card); border-left-color:rgba(2,132,199,0.2); }
  .cl-opt.active { background:rgba(2,132,199,0.06); border-color:rgba(2,132,199,0.28); border-left-color:${COLOR}; }
  .cl-radio { width:19px; height:19px; border:2px solid var(--border-medium); border-radius:50%; flex-shrink:0; position:relative; transition:border-color 160ms,background 160ms; }
  .cl-opt.active .cl-radio { border-color:${COLOR}; background:${COLOR}; }
  .cl-opt.active .cl-radio::after { content:''; position:absolute; inset:4px; background:var(--color-background); border-radius:50%; }
  .cl-opt-label { font-size:0.9rem; font-weight:500; color:#e8e8e8; line-height:1.3; }
  .cl-opt.active .cl-opt-label { color:var(--color-foreground); }
  .cl-opt-desc { font-size:0.74rem; color:var(--color-muted-foreground); margin-top:2px; line-height:1.35; }
  .cl-opt.active .cl-opt-desc { color:var(--color-secondary-foreground); }

  .cl-error { font-family:'Space Mono',monospace; font-size:0.58rem; color:#ff5555; letter-spacing:0.08em; text-transform:uppercase; margin-top:14px; }

  .cl-nav { position:fixed; bottom:0; left:0; right:0; background:var(--color-background); border-top:1px solid var(--border-subtle); padding:16px 24px; z-index:100; }
  .cl-nav-inner { max-width:600px; margin:0 auto; display:flex; gap:12px; align-items:center; }

  .cl-btn-primary { background:${COLOR}; color:var(--color-foreground); border:none; padding:13px 26px; font-family:'Barlow Condensed',sans-serif; font-size:0.9375rem; font-weight:800; letter-spacing:0.12em; text-transform:uppercase; cursor:pointer; transition:background 160ms,box-shadow 160ms,transform 160ms; display:inline-flex; align-items:center; gap:8px; flex-shrink:0; }
  .cl-btn-primary:hover:not(:disabled) { background:#0369a1; box-shadow:0 0 22px rgba(2,132,199,0.28); transform:translateY(-1px); }
  .cl-btn-primary:disabled { opacity:0.45; cursor:not-allowed; }
  .cl-btn-ghost { background:transparent; color:var(--color-muted-foreground); border:1px solid var(--border-medium); padding:13px 20px; font-family:'Barlow Condensed',sans-serif; font-size:0.875rem; font-weight:700; letter-spacing:0.1em; text-transform:uppercase; cursor:pointer; transition:color 160ms,border-color 160ms; flex-shrink:0; }
  .cl-btn-ghost:hover { color:var(--color-secondary-foreground); border-color:var(--border-medium); }
  .cl-spacer { flex:1; }

  /* Results */
  .cl-results { max-width:600px; margin:0 auto; padding:32px 24px 120px; }
  .cl-hero { text-align:center; padding:36px 0 28px; position:relative; }
  .cl-score-label { font-family:'Space Mono',monospace; font-size:0.52rem; letter-spacing:0.22em; text-transform:uppercase; color:var(--color-muted-foreground); margin-top:18px; margin-bottom:8px; }
  .cl-hero-nivel { font-family:'Barlow Condensed',sans-serif; font-size:2.625rem; font-weight:900; letter-spacing:0.06em; text-transform:uppercase; color:var(--color-foreground); line-height:1; margin-bottom:8px; }
  .cl-hero-sub { font-size:0.8125rem; color:var(--color-muted-foreground); }
  .cl-nivel-icon { font-size:1.5rem; margin-bottom:6px; display:block; }

  .cl-metrics { display:grid; grid-template-columns:1fr 1fr; gap:8px; margin-bottom:28px; }
  .cl-metric { background:var(--color-card); border:1px solid var(--border-subtle); padding:20px 16px; text-align:center; position:relative; overflow:hidden; }
  .cl-metric::before { content:''; position:absolute; top:0; left:0; right:0; height:1px; background:linear-gradient(90deg,transparent,${COLOR},transparent); opacity:0.3; }
  .cl-metric-val { font-family:'Barlow Condensed',sans-serif; font-size:1.875rem; font-weight:800; letter-spacing:0.02em; line-height:1; color:var(--color-foreground); margin-bottom:6px; }
  .cl-metric-lbl { font-family:'Space Mono',monospace; font-size:0.52rem; letter-spacing:0.14em; text-transform:uppercase; color:var(--color-muted-foreground); }

  .cl-sec-title { font-family:'Space Mono',monospace; font-size:0.55rem; letter-spacing:0.22em; text-transform:uppercase; color:var(--color-muted-foreground); padding-bottom:10px; border-bottom:1px solid var(--border-subtle); margin-bottom:14px; margin-top:28px; }

  .cl-rec { background:var(--color-card); border:1px solid var(--border-subtle); border-left:3px solid ${COLOR}; padding:18px 20px; margin-bottom:8px; transition:background 160ms,transform 160ms; }
  .cl-rec:hover { background:var(--color-card); transform:translateX(2px); }
  .cl-rec-top { display:flex; align-items:center; gap:12px; margin-bottom:6px; }
  .cl-rec-icon { font-size:1.25rem; }
  .cl-rec-name { font-family:'Barlow Condensed',sans-serif; font-size:1.1875rem; font-weight:700; letter-spacing:0.06em; text-transform:uppercase; color:var(--color-foreground); flex:1; }
  .cl-rec-desc { font-size:0.8rem; color:#525252; line-height:1.5; }

  .cl-badge { font-family:'Space Mono',monospace; font-size:0.5rem; letter-spacing:0.12em; text-transform:uppercase; padding:3px 9px; flex-shrink:0; }
  .cl-badge-high { background:rgba(2,132,199,0.09); color:#7dd3fc; border:1px solid rgba(2,132,199,0.22); }
  .cl-badge-med  { background:rgba(245,158,11,0.09); color:#fcd34d; border:1px solid rgba(245,158,11,0.22); }
  .cl-badge-def  { background:var(--surface-1); color:var(--color-muted-foreground); border:1px solid var(--border-subtle); }

  .cl-tip { display:flex; align-items:flex-start; gap:12px; padding:12px 0; border-bottom:1px solid var(--border-subtle); }
  .cl-tip:last-child { border-bottom:none; }
  .cl-tip-icon { font-size:0.9375rem; flex-shrink:0; margin-top:1px; }
  .cl-tip-text { font-size:0.8rem; color:#525252; line-height:1.55; }

  .cl-cta { display:flex; flex-direction:column; gap:10px; margin-top:32px; }
  .cl-btn-primary.full { width:100%; justify-content:center; }
  .cl-btn-ghost.full   { width:100%; text-align:center; }

  .cl-spinner { width:15px; height:15px; border:2px solid var(--border-medium); border-top-color:var(--color-foreground); border-radius:50%; animation:clSpin 0.7s linear infinite; display:inline-block; }

  .cl-toast { position:fixed; bottom:92px; left:50%; transform:translateX(-50%) translateY(12px); background:var(--color-card); border:1px solid var(--border-medium); color:var(--color-foreground); padding:9px 20px; font-family:'Space Mono',monospace; font-size:0.6rem; letter-spacing:0.1em; text-transform:uppercase; opacity:0; transition:opacity 250ms,transform 250ms; pointer-events:none; white-space:nowrap; z-index:200; }
  .cl-toast.show { opacity:1; transform:translateX(-50%) translateY(0); }
  .cl-toast.success { border-color:rgba(2,132,199,0.25); color:${COLOR}; }
  .cl-toast.error   { border-color:rgba(255,70,70,0.25); color:#ff7070; }

  @keyframes clRing { from { stroke-dashoffset:440; } to { stroke-dashoffset:var(--cl-ring-offset); } }
  .cl-ring-fg { animation:clRing 1.2s cubic-bezier(0.4,0,0.2,1) 0.4s both; }
`

export default function CuestionarioClinico() {
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
    const score = calcSaludScore(answers)
    const nivel = getNivelSalud(score)
    try {
      await api.post('/Cuestionario/GuardarClinico.php', { ...answers, salud_score: score, nivel_salud: nivel })
      showToast('Perfil clínico guardado exitosamente.', 'success')
      setTimeout(() => navigate('/clinico'), 1500)
    } catch (e) {
      showToast(e.response?.data?.error ?? 'Error al guardar el perfil.')
      setSaving(false)
    }
  }

  function reset() { setAnswers({}); setCurrent(0); setShowResults(false); setError(''); window.scrollTo({ top: 0, behavior: 'smooth' }) }

  /* ── RESULTS VIEW ── */
  if (showResults) {
    const score = calcSaludScore(answers)
    const nivel = getNivelSalud(score)
    const recs = getRecomendaciones(answers)
    const tips = getTipsClinico(answers)

    const icons  = { critico: '🚨', moderado: '⚠️', bueno: '🔵', optimo: '🌟' }
    const labels = { critico: 'Atención Prioritaria', moderado: 'Salud Moderada', bueno: 'Buen Estado', optimo: 'Salud Óptima' }
    const suenoLabel = { menos_5: 'Crítico', '5_6': 'Insuficiente', '7_8': 'Óptimo', mas_9: 'Excesivo' }
    const hidratLabel = { menos_4: 'Baja', '4_6': 'Baja', '6_8': 'Adecuada', mas_8: 'Óptima' }
    const badgeCls = { high: 'cl-badge-high', med: 'cl-badge-med', '': 'cl-badge-def' }

    const R = 68
    const C = 2 * Math.PI * R
    const dashOffset = C - (C * score / 100)

    return (
      <div className="cl-wrap">
        <style>{CSS}</style>
        <header className="cl-header">
          <button className="cl-back" onClick={reset}>← Volver</button>
          <div className="cl-header-title">Resultados Clínicos</div>
          <div className="cl-counter">Análisis</div>
        </header>

        <div className="cl-results cl-fade">
          <div className="cl-hero">
            <svg width="170" height="170" viewBox="0 0 170 170">
              <circle cx="85" cy="85" r="80" fill="none" stroke="rgba(255,255,255,0.03)" strokeWidth="1" />
              <circle cx="85" cy="85" r={R} fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="8" />
              <circle cx="85" cy="85" r={R} fill="none" stroke={COLOR} strokeWidth="8" strokeLinecap="butt"
                strokeDasharray={C} strokeDashoffset={dashOffset} transform="rotate(-90 85 85)"
                className="cl-ring-fg" style={{ '--cl-ring-offset': dashOffset }} />
              <text x="85" y="78" textAnchor="middle" fill="#ffffff" fontFamily="'Barlow Condensed',sans-serif" fontWeight="900" fontSize="40" letterSpacing="-1">{score}</text>
              <text x="85" y="97" textAnchor="middle" fill="#444444" fontFamily="'Space Mono',monospace" fontSize="9" letterSpacing="2">/100</text>
            </svg>
            <div className="cl-score-label">Score de salud clínica</div>
            <span className="cl-nivel-icon">{icons[nivel]}</span>
            <div className="cl-hero-nivel">{labels[nivel]}</div>
            <div className="cl-hero-sub">Basado en tus 12 respuestas</div>
          </div>

          <div className="cl-metrics">
            {[
              { val: `${score}/100`, lbl: 'Score de salud' },
              { val: nivel === 'optimo' ? 'Óptimo' : nivel === 'bueno' ? 'Bueno' : nivel === 'moderado' ? 'Moderado' : 'Crítico', lbl: 'Estado general' },
              { val: suenoLabel[answers.sueno] || '—', lbl: 'Calidad de sueño' },
              { val: hidratLabel[answers.hidratacion] || '—', lbl: 'Hidratación' },
            ].map((m, i) => (
              <div className="cl-metric" key={i}>
                <div className="cl-metric-val">{m.val}</div>
                <div className="cl-metric-lbl">{m.lbl}</div>
              </div>
            ))}
          </div>

          <div className="cl-sec-title">Recomendaciones clínicas</div>
          {recs.map((r, i) => (
            <div className="cl-rec" key={i}>
              <div className="cl-rec-top">
                <span className="cl-rec-icon">{r.icon}</span>
                <span className="cl-rec-name">{r.titulo}</span>
                <span className={`cl-badge ${badgeCls[r.badgeClass]}`}>{r.badge}</span>
              </div>
              <p className="cl-rec-desc">{r.desc}</p>
            </div>
          ))}

          <div className="cl-sec-title">Consejos personalizados</div>
          <div>
            {tips.map((t, i) => (
              <div className="cl-tip" key={i}>
                <span className="cl-tip-icon">{t.icon}</span>
                <span className="cl-tip-text">{t.text}</span>
              </div>
            ))}
          </div>

          <div className="cl-cta">
            <button className="cl-btn-primary full" onClick={saveResults} disabled={saving}>
              {saving ? <><span className="cl-spinner" /> Guardando perfil...</> : 'Guardar perfil y ver módulo clínico →'}
            </button>
            <button className="cl-btn-ghost full" onClick={reset} disabled={saving}>Volver a hacer el cuestionario</button>
          </div>
        </div>

        <div className={`cl-toast ${toast.show ? 'show' : ''} ${toast.type}`}>{toast.msg}</div>
      </div>
    )
  }

  /* ── QUESTIONNAIRE VIEW ── */
  return (
    <div className="cl-wrap">
      <style>{CSS}</style>
      <header className="cl-header">
        <button className="cl-back" onClick={() => navigate(-1)}>← Volver</button>
        <div className="cl-header-title">Cuestionario Clínico</div>
        <div className="cl-counter">{current + 1} / {QUESTIONS.length}</div>
      </header>

      <div className="cl-progress">
        <div className="cl-progress-meta">
          <span className="cl-cat-tag">{q.category}</span>
          <span className="cl-pct-label">{pct}%</span>
        </div>
        <div className="cl-track"><div className="cl-fill" style={{ width: `${pct}%` }} /></div>
      </div>

      <main className="cl-main">
        <div key={current} ref={slideRef} className={`cl-q-wrap ${exiting ? 'cl-out' : 'cl-in'}`}>
          <div className="cl-ghost-num">{String(current + 1).padStart(2, '0')}</div>
          <h2 className="cl-q-title">{q.title}</h2>
          <div className="cl-opts">
            {q.opts.map(opt => {
              const sel = answers[q.id] === opt.val
              return (
                <div key={opt.val} className={`cl-opt${sel ? ' active' : ''}`} onClick={() => select(opt.val)}>
                  <div className="cl-radio" />
                  <div>
                    <div className="cl-opt-label">{opt.label}</div>
                    {opt.desc && <div className="cl-opt-desc">{opt.desc}</div>}
                  </div>
                </div>
              )
            })}
          </div>
          {error && <div className="cl-error">⚠ {error}</div>}
        </div>
      </main>

      <div className="cl-nav">
        <div className="cl-nav-inner">
          {current > 0
            ? <button className="cl-btn-ghost" onClick={prevQ}>← Atrás</button>
            : <div className="cl-spacer" />}
          <div className="cl-spacer" />
          <button className="cl-btn-primary" onClick={nextQ}>
            {current === QUESTIONS.length - 1 ? 'Ver resultados →' : 'Continuar →'}
          </button>
        </div>
      </div>

      <div className={`cl-toast ${toast.show ? 'show' : ''} ${toast.type}`}>{toast.msg}</div>
    </div>
  )
}
