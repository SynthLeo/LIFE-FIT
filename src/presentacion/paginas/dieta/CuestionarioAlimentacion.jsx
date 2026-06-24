import { useState, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '@/lib/api'

/* ─────────────────────────────────────────────
   DATA — 12 preguntas de alimentación
───────────────────────────────────────────── */
const QUESTIONS = [
  {
    id: 'objetivo', category: 'OBJETIVOS NUTRICIONALES',
    title: '¿Cuál es tu principal objetivo con tu alimentación?',
    opts: [
      { val: 'perder_peso',    label: '⚖️ Perder peso',                desc: 'Reducir grasa corporal de forma saludable' },
      { val: 'ganar_masa',     label: '💪 Ganar masa muscular',        desc: 'Aumentar músculo con soporte nutricional' },
      { val: 'mantener',       label: '⚡ Mantener mi peso actual',    desc: 'Equilibrio sin cambios drásticos' },
      { val: 'mejorar_salud',  label: '🌿 Mejorar salud general',      desc: 'Comer mejor sin metas de peso específicas' },
    ],
  },
  {
    id: 'frecuencia_comidas', category: 'HÁBITOS ALIMENTICIOS',
    title: '¿Cuántas veces comes al día normalmente?',
    opts: [
      { val: 'una_dos',   label: '⚠️ 1 a 2 veces',                    desc: 'Pocas comidas, posiblemente saltando tiempos' },
      { val: 'tres',      label: '✅ 3 veces (desayuno, comida, cena)', desc: 'Estructura clásica de comidas' },
      { val: 'cuatro',    label: '🍱 4 veces con colaciones',          desc: 'Incluyo snacks o meriendas' },
      { val: 'cinco_mas', label: '🥗 5 o más veces',                   desc: 'Alimentación fraccionada frecuente' },
    ],
  },
  {
    id: 'desayuno', category: 'HÁBITOS ALIMENTICIOS',
    title: '¿Qué tan seguido desayunas?',
    opts: [
      { val: 'siempre',      label: '✅ Siempre',             desc: 'El desayuno es parte fija de mi rutina' },
      { val: 'casi_siempre', label: '🔄 Casi siempre',        desc: 'Algunos días me lo salto' },
      { val: 'a_veces',      label: '⚠️ A veces',             desc: 'Depende del día' },
      { val: 'nunca',        label: '❌ Nunca o casi nunca',  desc: 'No desayuno habitualmente' },
    ],
  },
  {
    id: 'verduras_frutas', category: 'CALIDAD DE LA DIETA',
    title: '¿Con qué frecuencia consumes frutas y verduras?',
    opts: [
      { val: 'diario',     label: '🥦 Todos los días',         desc: 'Al menos 5 porciones diarias' },
      { val: 'frecuente',  label: '✅ La mayoría de los días', desc: '4-5 días a la semana' },
      { val: 'ocasional',  label: '🔄 Algunas veces',          desc: '1-3 días a la semana' },
      { val: 'casi_nunca', label: '❌ Pocas veces',            desc: 'Rara vez o nunca los incluyo' },
    ],
  },
  {
    id: 'proteina', category: 'CALIDAD DE LA DIETA',
    title: '¿Cuál es tu principal fuente de proteína?',
    opts: [
      { val: 'carnes',      label: '🥩 Carnes (pollo, res, cerdo)', desc: 'Proteína animal como base' },
      { val: 'pescado',     label: '🐟 Pescado y mariscos',         desc: 'Proteína marina frecuente' },
      { val: 'huevo_lacto', label: '🥚 Huevo y lácteos',            desc: 'Proteína ovo-láctea principalmente' },
      { val: 'vegetal',     label: '🌱 Leguminosas y plantas',      desc: 'Soy vegetariano/vegano' },
    ],
  },
  {
    id: 'ultra_procesados', category: 'CALIDAD DE LA DIETA',
    title: '¿Con qué frecuencia consumes alimentos ultraprocesados (comida rápida, frituras, refrescos)?',
    opts: [
      { val: 'casi_nunca', label: '✅ Casi nunca',            desc: 'Evito activamente estos alimentos' },
      { val: 'una_vez',    label: '🔵 1-2 veces por semana', desc: 'Consumo ocasional y controlado' },
      { val: 'frecuente',  label: '🟡 3-5 veces por semana', desc: 'Es parte regular de mi dieta' },
      { val: 'diario',     label: '🔴 Todos los días',        desc: 'Conforman gran parte de lo que como' },
    ],
  },
  {
    id: 'agua', category: 'HIDRATACIÓN',
    title: '¿Cuántos vasos de agua pura tomas al día?',
    opts: [
      { val: 'menos_4', label: '⚠️ Menos de 4 vasos',  desc: 'Hidratación muy insuficiente' },
      { val: '4_6',     label: '🔵 Entre 4 y 6 vasos', desc: 'Por debajo del mínimo recomendado' },
      { val: '6_8',     label: '✅ Entre 6 y 8 vasos', desc: 'Dentro del rango adecuado' },
      { val: 'mas_8',   label: '💧 Más de 8 vasos',    desc: 'Excelente hidratación' },
    ],
  },
  {
    id: 'alergias', category: 'RESTRICCIONES',
    title: '¿Tienes alguna restricción alimentaria o alergia?',
    opts: [
      { val: 'ninguna', label: '✅ No tengo restricciones',         desc: 'Puedo comer de todo' },
      { val: 'lactosa', label: '🥛 Intolerancia a la lactosa',      desc: 'Evito productos lácteos' },
      { val: 'gluten',  label: '🌾 Intolerancia al gluten',         desc: 'Celiaquía o sensibilidad' },
      { val: 'otras',   label: '⚠️ Otras alergias o restricciones', desc: 'Alergias a frutos secos, mariscos, etc.' },
    ],
  },
  {
    id: 'presupuesto', category: 'CONTEXTO PERSONAL',
    title: '¿Cómo describirías tu presupuesto para alimentación?',
    opts: [
      { val: 'muy_limitado', label: '💸 Muy limitado', desc: 'Menos de $50 MXN diarios para comida' },
      { val: 'limitado',     label: '💰 Limitado',      desc: 'Entre $50 y $100 MXN diarios' },
      { val: 'moderado',     label: '💵 Moderado',      desc: 'Entre $100 y $200 MXN diarios' },
      { val: 'amplio',       label: '🏦 Amplio',        desc: 'Más de $200 MXN diarios' },
    ],
  },
  {
    id: 'cocina', category: 'CONTEXTO PERSONAL',
    title: '¿Tienes acceso a cocina para preparar tus alimentos?',
    opts: [
      { val: 'completa',  label: '🍳 Sí, cocina completa',           desc: 'Puedo cocinar lo que quiera' },
      { val: 'limitada',  label: '🔥 Acceso limitado (microondas)',   desc: 'Solo recaliento o preparo cosas sencillas' },
      { val: 'cafeteria', label: '🏫 Dependo de cafetería',           desc: 'Como principalmente en la escuela o trabajo' },
      { val: 'no',        label: '❌ No tengo acceso',               desc: 'Compro comida preparada siempre' },
    ],
  },
  {
    id: 'actividad_fisica_alim', category: 'ESTILO DE VIDA',
    title: '¿Cuánto ejercicio físico realizas a la semana?',
    opts: [
      { val: 'sedentario', label: '🪑 Poco o nada',              desc: 'Vida sedentaria, sin ejercicio regular' },
      { val: 'leve',       label: '🚶 Actividad leve (1-2 días)', desc: 'Caminatas o ejercicio ocasional' },
      { val: 'moderado',   label: '🏃 Moderado (3-4 días)',       desc: 'Ejercicio regular de intensidad moderada' },
      { val: 'intenso',    label: '🏋️ Intenso (5+ días)',        desc: 'Entrenamiento fuerte y frecuente' },
    ],
  },
  {
    id: 'horario', category: 'ESTILO DE VIDA',
    title: '¿Cómo es tu horario diario en relación a tus comidas?',
    opts: [
      { val: 'regular',    label: '⏰ Horarios regulares',      desc: 'Como a horas más o menos fijas' },
      { val: 'irregular',  label: '🔄 Muy irregular',           desc: 'Mis comidas varían mucho día a día' },
      { val: 'nocturno',   label: '🌙 Principalmente nocturno', desc: 'Como más en la tarde/noche' },
      { val: 'sin_tiempo', label: '⚡ Sin tiempo',              desc: 'Me cuesta encontrar tiempo para comer bien' },
    ],
  },
]

/* ─────────────────────────────────────────────
   SCORING
───────────────────────────────────────────── */
function calcNutricionScore(ans) {
  const objetivo  = { perder_peso: 10, ganar_masa: 10, mantener: 10, mejorar_salud: 10 }
  const freq      = { una_dos: 3, tres: 15, cuatro: 20, cinco_mas: 18 }
  const desayuno  = { siempre: 15, casi_siempre: 10, a_veces: 5, nunca: 0 }
  const verduras  = { diario: 20, frecuente: 14, ocasional: 7, casi_nunca: 0 }
  const ultra     = { casi_nunca: 15, una_vez: 10, frecuente: 4, diario: 0 }
  const agua      = { menos_4: 0, '4_6': 5, '6_8': 10, mas_8: 15 }
  const actividad = { sedentario: 5, leve: 8, moderado: 12, intenso: 15 }
  return (
    (objetivo[ans.objetivo]                       || 0) +
    (freq[ans.frecuencia_comidas]                 || 0) +
    (desayuno[ans.desayuno]                       || 0) +
    (verduras[ans.verduras_frutas]                || 0) +
    (ultra[ans.ultra_procesados]                  || 0) +
    (agua[ans.agua]                               || 0) +
    (actividad[ans.actividad_fisica_alim]         || 0)
  )
}

function getNivelNutricion(score) {
  return score < 30 ? 'deficiente' : score < 55 ? 'mejorable' : score < 80 ? 'adecuado' : 'optimo'
}

/* ─────────────────────────────────────────────
   ESTILOS
───────────────────────────────────────────── */
const COLOR = '#16A34A'
const CSS = `
  @import url('https://fonts.googleapis.com/css2?family=Barlow+Condensed:wght@400;600;700;800;900&family=DM+Sans:wght@300;400;500;600&family=Space+Mono:wght@400;700&display=swap');

  .nu-wrap { background:var(--color-background); min-height:100vh; font-family:'DM Sans',sans-serif; color:var(--color-foreground); }

  .nu-header { background:var(--color-background); border-bottom:1px solid var(--border-subtle); height:62px; display:flex; align-items:center; padding:0 24px; gap:16px; position:sticky; top:0; z-index:100; }
  .nu-back { background:none; border:none; color:var(--color-muted-foreground); cursor:pointer; font-family:'DM Sans',sans-serif; font-size:0.875rem; display:flex; align-items:center; gap:6px; padding:6px 0; transition:color 160ms; flex-shrink:0; }
  .nu-back:hover { color:var(--color-foreground); }
  .nu-header-title { font-family:'Barlow Condensed',sans-serif; font-size:1.0625rem; font-weight:700; letter-spacing:0.12em; text-transform:uppercase; flex:1; text-align:center; color:var(--color-foreground); }
  .nu-counter { font-family:'Space Mono',monospace; font-size:0.6rem; letter-spacing:0.12em; text-transform:uppercase; color:var(--color-muted-foreground); min-width:44px; text-align:right; flex-shrink:0; }

  .nu-progress { background:var(--color-background); border-bottom:1px solid var(--border-subtle); padding:12px 24px; position:sticky; top:62px; z-index:99; }
  .nu-progress-meta { display:flex; justify-content:space-between; align-items:center; margin-bottom:8px; }
  .nu-cat-tag { font-family:'Space Mono',monospace; font-size:0.52rem; letter-spacing:0.18em; text-transform:uppercase; color:${COLOR}; background:rgba(22,163,74,0.07); border:1px solid rgba(22,163,74,0.22); padding:3px 9px; display:inline-block; }
  .nu-pct-label { font-family:'Space Mono',monospace; font-size:0.58rem; letter-spacing:0.1em; color:var(--color-muted-foreground); }
  .nu-track { height:2px; background:var(--surface-2); overflow:hidden; }
  .nu-fill { height:100%; background:${COLOR}; transition:width 400ms cubic-bezier(0.4,0,0.2,1); box-shadow:0 0 10px rgba(22,163,74,0.45); }

  .nu-main { max-width:600px; margin:0 auto; padding:36px 24px 120px; }

  @keyframes nuIn   { from { opacity:0; transform:translateX(30px); }  to { opacity:1; transform:translateX(0); } }
  @keyframes nuOut  { from { opacity:1; transform:translateX(0); }     to { opacity:0; transform:translateX(-30px); } }
  @keyframes nuFade { from { opacity:0; transform:translateY(18px); }  to { opacity:1; transform:translateY(0); } }
  @keyframes nuSpin { to { transform:rotate(360deg); } }
  @keyframes nuPulse { 0%,100% { opacity:1; } 50% { opacity:0.5; } }

  .nu-in   { animation:nuIn  280ms cubic-bezier(0.16,1,0.3,1) forwards; }
  .nu-out  { animation:nuOut 240ms ease forwards; }
  .nu-fade { animation:nuFade 400ms ease both; }

  .nu-q-wrap { position:relative; }
  .nu-ghost-num { font-family:'Barlow Condensed',sans-serif; font-weight:900; font-size:7rem; line-height:1; color:rgba(255,255,255,0.03); position:absolute; top:-24px; right:-4px; letter-spacing:-0.04em; user-select:none; pointer-events:none; }
  .nu-q-title { font-family:'DM Sans',sans-serif; font-size:1.125rem; font-weight:500; line-height:1.55; color:var(--color-foreground); margin:0 0 26px; padding-right:40px; }

  .nu-opts { display:flex; flex-direction:column; gap:8px; }
  .nu-opt { display:flex; align-items:center; gap:14px; padding:15px 18px; background:var(--color-card); border:1px solid var(--border-subtle); border-left:3px solid transparent; cursor:pointer; transition:background 160ms,border-color 160ms; user-select:none; }
  .nu-opt:hover { background:var(--color-card); border-left-color:rgba(22,163,74,0.2); }
  .nu-opt.active { background:rgba(22,163,74,0.06); border-color:rgba(22,163,74,0.28); border-left-color:${COLOR}; }
  .nu-radio { width:19px; height:19px; border:2px solid var(--border-medium); border-radius:50%; flex-shrink:0; position:relative; transition:border-color 160ms,background 160ms; }
  .nu-opt.active .nu-radio { border-color:${COLOR}; background:${COLOR}; }
  .nu-opt.active .nu-radio::after { content:''; position:absolute; inset:4px; background:var(--color-background); border-radius:50%; }
  .nu-opt-label { font-size:0.9rem; font-weight:500; color:#e8e8e8; line-height:1.3; }
  .nu-opt.active .nu-opt-label { color:var(--color-foreground); }
  .nu-opt-desc { font-size:0.74rem; color:var(--color-muted-foreground); margin-top:2px; line-height:1.35; }
  .nu-opt.active .nu-opt-desc { color:var(--color-secondary-foreground); }

  .nu-error { font-family:'Space Mono',monospace; font-size:0.58rem; color:#ff5555; letter-spacing:0.08em; text-transform:uppercase; margin-top:14px; }

  .nu-nav { position:fixed; bottom:0; left:0; right:0; background:var(--color-background); border-top:1px solid var(--border-subtle); padding:16px 24px; z-index:100; }
  .nu-nav-inner { max-width:600px; margin:0 auto; display:flex; gap:12px; align-items:center; }

  .nu-btn-primary { background:${COLOR}; color:var(--color-foreground); border:none; padding:13px 26px; font-family:'Barlow Condensed',sans-serif; font-size:0.9375rem; font-weight:800; letter-spacing:0.12em; text-transform:uppercase; cursor:pointer; transition:background 160ms,box-shadow 160ms,transform 160ms; display:inline-flex; align-items:center; gap:8px; flex-shrink:0; }
  .nu-btn-primary:hover:not(:disabled) { background:#15803d; box-shadow:0 0 22px rgba(22,163,74,0.28); transform:translateY(-1px); }
  .nu-btn-primary:disabled { opacity:0.45; cursor:not-allowed; }
  .nu-btn-ghost { background:transparent; color:var(--color-muted-foreground); border:1px solid var(--border-medium); padding:13px 20px; font-family:'Barlow Condensed',sans-serif; font-size:0.875rem; font-weight:700; letter-spacing:0.1em; text-transform:uppercase; cursor:pointer; transition:color 160ms,border-color 160ms; flex-shrink:0; }
  .nu-btn-ghost:hover { color:var(--color-secondary-foreground); border-color:var(--border-medium); }
  .nu-spacer { flex:1; }

  .nu-results { max-width:680px; margin:0 auto; padding:32px 24px 120px; }
  .nu-hero { text-align:center; padding:36px 0 28px; position:relative; }
  .nu-score-label { font-family:'Space Mono',monospace; font-size:0.52rem; letter-spacing:0.22em; text-transform:uppercase; color:var(--color-muted-foreground); margin-top:18px; margin-bottom:8px; }
  .nu-hero-nivel { font-family:'Barlow Condensed',sans-serif; font-size:2.625rem; font-weight:900; letter-spacing:0.06em; text-transform:uppercase; color:var(--color-foreground); line-height:1; margin-bottom:8px; }
  .nu-hero-sub { font-size:0.8125rem; color:var(--color-muted-foreground); }
  .nu-nivel-icon { font-size:1.5rem; margin-bottom:6px; display:block; }

  .nu-metrics { display:grid; grid-template-columns:1fr 1fr; gap:8px; margin-bottom:28px; }
  .nu-metric { background:var(--color-card); border:1px solid var(--border-subtle); padding:20px 16px; text-align:center; position:relative; overflow:hidden; }
  .nu-metric::before { content:''; position:absolute; top:0; left:0; right:0; height:1px; background:linear-gradient(90deg,transparent,${COLOR},transparent); opacity:0.3; }
  .nu-metric-val { font-family:'Barlow Condensed',sans-serif; font-size:1.875rem; font-weight:800; letter-spacing:0.02em; line-height:1; color:var(--color-foreground); margin-bottom:6px; }
  .nu-metric-lbl { font-family:'Space Mono',monospace; font-size:0.52rem; letter-spacing:0.14em; text-transform:uppercase; color:var(--color-muted-foreground); }

  .nu-sec-title { font-family:'Space Mono',monospace; font-size:0.55rem; letter-spacing:0.22em; text-transform:uppercase; color:var(--color-muted-foreground); padding-bottom:10px; border-bottom:1px solid var(--border-subtle); margin-bottom:14px; margin-top:28px; }

  .nu-dieta-container { background:#0d0d0d; border:1px solid rgba(22,163,74,0.15); padding:0; overflow:hidden; margin-bottom:8px; }
  .nu-dieta-generating { display:flex; align-items:center; justify-content:center; gap:14px; padding:40px 24px; }
  .nu-dieta-generating-text { font-family:'Space Mono',monospace; font-size:0.7rem; letter-spacing:0.12em; color:var(--color-muted-foreground); text-transform:uppercase; animation:nuPulse 2s ease infinite; }
  .nu-dieta-error { padding:24px; text-align:center; }
  .nu-dieta-error-text { font-size:0.85rem; color:#ff7070; }
  .nu-retry-btn { margin-top:12px; background:none; border:1px solid rgba(22,163,74,0.3); color:${COLOR}; font-family:'Space Mono',monospace; font-size:0.6rem; letter-spacing:0.1em; text-transform:uppercase; padding:8px 16px; cursor:pointer; transition:border-color 160ms; }
  .nu-retry-btn:hover { border-color:rgba(22,163,74,0.6); }
  .nu-dieta-header { background:rgba(22,163,74,0.06); border-bottom:1px solid rgba(22,163,74,0.12); padding:16px 20px; display:flex; align-items:center; gap:10px; }
  .nu-dieta-header-icon { font-size:1.1rem; }
  .nu-dieta-header-title { font-family:'Barlow Condensed',sans-serif; font-size:1rem; font-weight:700; letter-spacing:0.1em; text-transform:uppercase; color:${COLOR}; flex:1; }
  .nu-dieta-header-badge { font-family:'Space Mono',monospace; font-size:0.48rem; letter-spacing:0.1em; text-transform:uppercase; padding:3px 8px; background:rgba(22,163,74,0.1); color:${COLOR}; border:1px solid rgba(22,163,74,0.2); }
  .nu-dias { display:flex; flex-direction:column; }
  .nu-dia { border-bottom:1px solid var(--border-subtle); }
  .nu-dia:last-child { border-bottom:none; }
  .nu-dia-header { display:flex; align-items:center; gap:10px; padding:12px 20px; cursor:pointer; transition:background 160ms; user-select:none; }
  .nu-dia-header:hover { background:rgba(255,255,255,0.02); }
  .nu-dia-name { font-family:'Barlow Condensed',sans-serif; font-size:0.9rem; font-weight:700; letter-spacing:0.1em; text-transform:uppercase; color:#ccc; flex:1; }
  .nu-dia-arrow { font-size:0.65rem; color:var(--color-muted-foreground); transition:transform 200ms; }
  .nu-dia-arrow.open { transform:rotate(180deg); }
  .nu-dia-content { padding:0 20px 16px; display:none; }
  .nu-dia-content.open { display:block; }
  .nu-comida-row { display:flex; gap:10px; align-items:flex-start; padding:6px 0; border-bottom:1px solid rgba(255,255,255,0.03); }
  .nu-comida-row:last-child { border-bottom:none; }
  .nu-comida-tiempo { font-family:'Space Mono',monospace; font-size:0.5rem; letter-spacing:0.1em; text-transform:uppercase; color:var(--color-muted-foreground); min-width:64px; padding-top:2px; }
  .nu-comida-desc { font-size:0.82rem; color:var(--color-secondary-foreground); line-height:1.4; flex:1; }
  .nu-comida-kcal { font-family:'Space Mono',monospace; font-size:0.55rem; color:var(--color-muted-foreground); white-space:nowrap; padding-top:2px; }

  .nu-spinner-lg { width:28px; height:28px; border:2px solid rgba(22,163,74,0.15); border-top-color:${COLOR}; border-radius:50%; animation:nuSpin 0.9s linear infinite; }
  .nu-spinner { width:15px; height:15px; border:2px solid var(--border-medium); border-top-color:var(--color-foreground); border-radius:50%; animation:nuSpin 0.7s linear infinite; display:inline-block; }

  .nu-cta { display:flex; flex-direction:column; gap:10px; margin-top:32px; }
  .nu-btn-primary.full { width:100%; justify-content:center; }
  .nu-btn-ghost.full   { width:100%; text-align:center; }

  .nu-toast { position:fixed; bottom:92px; left:50%; transform:translateX(-50%) translateY(12px); background:var(--color-card); border:1px solid var(--border-medium); color:var(--color-foreground); padding:9px 20px; font-family:'Space Mono',monospace; font-size:0.6rem; letter-spacing:0.1em; text-transform:uppercase; opacity:0; transition:opacity 250ms,transform 250ms; pointer-events:none; white-space:nowrap; z-index:200; }
  .nu-toast.show { opacity:1; transform:translateX(-50%) translateY(0); }
  .nu-toast.success { border-color:rgba(22,163,74,0.25); color:${COLOR}; }
  .nu-toast.error   { border-color:rgba(255,70,70,0.25); color:#ff7070; }

  @keyframes nuRing { from { stroke-dashoffset:440; } to { stroke-dashoffset:var(--nu-ring-offset); } }
  .nu-ring-fg { animation:nuRing 1.2s cubic-bezier(0.4,0,0.2,1) 0.4s both; }
`

/* ─────────────────────────────────────────────
   COMPONENTE DÍA DE DIETA
───────────────────────────────────────────── */
function DietaSemanaDia({ dia, comidas, openDia, toggleDia }) {
  const isOpen = openDia === dia
  return (
    <div className="nu-dia">
      <div className="nu-dia-header" onClick={() => toggleDia(dia)}>
        <span className="nu-dia-name">{dia}</span>
        <span className={`nu-dia-arrow ${isOpen ? 'open' : ''}`}>▾</span>
      </div>
      <div className={`nu-dia-content ${isOpen ? 'open' : ''}`}>
        {comidas.map((c, i) => (
          <div key={i} className="nu-comida-row">
            <span className="nu-comida-tiempo">{c.tiempo}</span>
            <span className="nu-comida-desc">{c.descripcion}</span>
            {c.kcal && <span className="nu-comida-kcal">~{c.kcal} kcal</span>}
          </div>
        ))}
      </div>
    </div>
  )
}

/* ─────────────────────────────────────────────
   COMPONENTE DIETA SEMANAL (con IA)
   onDietaLista: callback para notificar al padre
   cuando el plan fue generado exitosamente
───────────────────────────────────────────── */
function DietaSemanal({ answers, onDietaLista }) {
  const [dieta,     setDieta]     = useState(null)
  const [generando, setGenerando] = useState(false)
  const [error,     setError]     = useState(null)
  const [openDia,   setOpenDia]   = useState('Lunes')
  const generadoRef = useRef(false)

  const toggleDia = (dia) => setOpenDia(d => d === dia ? null : dia)

  async function generarDieta() {
    if (generadoRef.current) return
    generadoRef.current = true
    setGenerando(true)
    setError(null)
    try {
      const prompt = buildPrompt(answers)
      const response = await fetch('http://localhost:11434/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: 'qwen2.5:3b',
          prompt,
          stream: false,
          format: 'json',
          options: { temperature: 0.4, num_predict: 5000 },
        }),
      })
      const data = await response.json()
      const clean = (data.response || '').replace(/```json|```/g, '').trim()
      const parsed = JSON.parse(clean)
      setDieta(parsed)
      onDietaLista?.(parsed)   // ← notifica al padre con el plan generado
    } catch (e) {
      generadoRef.current = false
      setError('No se pudo conectar con Ollama. Verifica que esté corriendo con: OLLAMA_ORIGINS=* ollama serve')
    } finally {
      setGenerando(false)
    }
  }

  function buildPrompt(ans) {
    const labels = {
      objetivo:   { perder_peso: 'perder peso', ganar_masa: 'ganar músculo', mantener: 'mantener peso', mejorar_salud: 'mejorar salud' },
      proteina:   { carnes: 'carnes', pescado: 'pescado y mariscos', huevo_lacto: 'huevo y lácteos', vegetal: 'dieta vegetariana/vegana' },
      alergias:   { ninguna: 'ninguna restricción', lactosa: 'sin lactosa', gluten: 'sin gluten', otras: 'otras restricciones' },
      presupuesto:{ muy_limitado: 'menos de $50 MXN/día', limitado: '$50-100 MXN/día', moderado: '$100-200 MXN/día', amplio: 'más de $200 MXN/día' },
      cocina:     { completa: 'cocina completa', limitada: 'solo microondas', cafeteria: 'cafetería universitaria', no: 'sin acceso a cocina' },
      actividad:  { sedentario: 'sedentario', leve: 'actividad leve', moderado: 'actividad moderada', intenso: 'actividad intensa' },
    }
    return `Eres un nutriólogo experto. Crea un plan de alimentación para toda la semana (lunes a domingo) personalizado para un estudiante universitario mexicano con las siguientes características:
- Objetivo: ${labels.objetivo[ans.objetivo] || ans.objetivo}
- Fuente de proteína principal: ${labels.proteina[ans.proteina] || ans.proteina}
- Restricciones: ${labels.alergias[ans.alergias] || ans.alergias}
- Presupuesto: ${labels.presupuesto[ans.presupuesto] || ans.presupuesto}
- Acceso a cocina: ${labels.cocina[ans.cocina] || ans.cocina}
- Nivel de actividad física: ${labels.actividad[ans.actividad_fisica_alim] || ans.actividad_fisica_alim}
- Frecuencia de comidas preferida: ${ans.frecuencia_comidas}

IMPORTANTE: genera los 7 días completos (lunes a domingo). Sé conciso: máximo 12 palabras por descripción de platillo. Responde SOLO con JSON válido sin texto adicional.
{
  "dias": [
    {
      "dia": "Lunes",
      "comidas": [
        { "tiempo": "Desayuno", "descripcion": "Avena con leche y plátano", "kcal": 320 },
        { "tiempo": "Comida",   "descripcion": "Arroz con pollo y verduras", "kcal": 550 },
        { "tiempo": "Cena",     "descripcion": "Frijoles con tortillas", "kcal": 380 }
      ]
    }
  ],
  "calorias_dia": 1800,
  "nota": "Una nota breve de 1 oración con consejo clave para este perfil."
}`
  }

  // Estado: aún no generado
  if (!dieta && !generando && !error) {
    return (
      <div className="nu-dieta-container">
        <div className="nu-dieta-generating" style={{ flexDirection: 'column', gap: 12 }}>
          <span style={{ fontSize: '2rem' }}>🥗</span>
          <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: '0.9rem', color: '#888', textAlign: 'center', marginBottom: 16 }}>
            Tu dieta personalizada para toda la semana está lista para generarse.
          </p>
          <button
            onClick={generarDieta}
            style={{ background: COLOR, color: '#fff', border: 'none', padding: '12px 24px', fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 800, fontSize: '0.9rem', letterSpacing: '0.12em', textTransform: 'uppercase', cursor: 'pointer' }}
          >
            🤖 Generar mi dieta semanal con IA →
          </button>
        </div>
      </div>
    )
  }

  // Estado: generando
  if (generando) {
    return (
      <div className="nu-dieta-container">
        <div className="nu-dieta-generating">
          <div className="nu-spinner-lg" />
          <span className="nu-dieta-generating-text">Nutriólogo IA creando tu plan semanal...</span>
        </div>
      </div>
    )
  }

  // Estado: error
  if (error) {
    return (
      <div className="nu-dieta-container">
        <div className="nu-dieta-error">
          <p className="nu-dieta-error-text">{error}</p>
          <button className="nu-retry-btn" onClick={() => { generadoRef.current = false; generarDieta() }}>
            Reintentar
          </button>
        </div>
      </div>
    )
  }

  // Estado: dieta lista
  return (
    <div className="nu-dieta-container">
      <div className="nu-dieta-header">
        <span className="nu-dieta-header-icon">🥗</span>
        <span className="nu-dieta-header-title">Plan alimentario semanal</span>
        <span className="nu-dieta-header-badge">~{dieta.calorias_dia} kcal/día</span>
      </div>
      {dieta.nota && (
        <div style={{ padding: '10px 20px', background: 'rgba(22,163,74,0.04)', borderBottom: '1px solid rgba(22,163,74,0.08)' }}>
          <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: '0.78rem', color: '#525252', lineHeight: 1.5 }}>
            💡 {dieta.nota}
          </p>
        </div>
      )}
      <div className="nu-dias">
        {dieta.dias.map(({ dia, comidas }) => (
          <DietaSemanaDia key={dia} dia={dia} comidas={comidas} openDia={openDia} toggleDia={toggleDia} />
        ))}
      </div>
    </div>
  )
}

/* ─────────────────────────────────────────────
   PÁGINA PRINCIPAL
───────────────────────────────────────────── */
export default function CuestionarioAlimentacion() {
  const navigate = useNavigate()
  const [current,       setCurrent]       = useState(0)
  const [answers,       setAnswers]       = useState({})
  const [error,         setError]         = useState('')
  const [exiting,       setExiting]       = useState(false)
  const [showResults,   setShowResults]   = useState(false)
  const [saving,        setSaving]        = useState(false)
  const [dietaGenerada, setDietaGenerada] = useState(null)  // ← plan generado por IA
  const [toast,         setToast]         = useState({ show: false, msg: '', type: 'error' })
  const slideRef = useRef(null)

  const q   = QUESTIONS[current]
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
    const score = calcNutricionScore(answers)
    const nivel = getNivelNutricion(score)
    try {
      await api.post('/Cuestionario/GuardarAlimentacion.php', {
        ...answers,
        nutricion_score: score,
        nivel_nutricion: nivel,
        plan_semanal:    dietaGenerada ?? null,   // ← incluye el plan si fue generado
      })
      showToast('Perfil nutricional guardado exitosamente.', 'success')
      setTimeout(() => navigate('/dieta'), 1500)
    } catch (e) {
      showToast(e.response?.data?.error ?? 'Error al guardar el perfil.')
      setSaving(false)
    }
  }

  function reset() {
    setAnswers({})
    setCurrent(0)
    setShowResults(false)
    setError('')
    setDietaGenerada(null)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  /* ── RESULTS VIEW ── */
  if (showResults) {
    const score = calcNutricionScore(answers)
    const nivel = getNivelNutricion(score)

    const icons      = { deficiente: '🚨', mejorable: '⚠️', adecuado: '🔵', optimo: '🌟' }
    const labels     = { deficiente: 'Dieta Deficiente', mejorable: 'Hay Margen de Mejora', adecuado: 'Alimentación Adecuada', optimo: 'Nutrición Óptima' }
    const verdLabel  = { diario: 'Excelente', frecuente: 'Buena', ocasional: 'Mejorable', casi_nunca: 'Insuficiente' }
    const ultraLabel = { casi_nunca: 'Muy bajo', una_vez: 'Controlado', frecuente: 'Moderado', diario: 'Alto' }

    const R         = 68
    const C         = 2 * Math.PI * R
    const dashOffset = C - (C * score / 100)

    return (
      <div className="nu-wrap">
        <style>{CSS}</style>
        <header className="nu-header">
          <button className="nu-back" onClick={reset}>← Volver</button>
          <div className="nu-header-title">Perfil Nutricional</div>
          <div className="nu-counter">Análisis</div>
        </header>

        <div className="nu-results nu-fade">
          <div className="nu-hero">
            <svg width="170" height="170" viewBox="0 0 170 170">
              <circle cx="85" cy="85" r="80" fill="none" stroke="rgba(255,255,255,0.03)" strokeWidth="1" />
              <circle cx="85" cy="85" r={R} fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="8" />
              <circle cx="85" cy="85" r={R} fill="none" stroke={COLOR} strokeWidth="8" strokeLinecap="butt"
                strokeDasharray={C} strokeDashoffset={dashOffset} transform="rotate(-90 85 85)"
                className="nu-ring-fg" style={{ '--nu-ring-offset': dashOffset }} />
              <text x="85" y="78" textAnchor="middle" fill="#ffffff" fontFamily="'Barlow Condensed',sans-serif" fontWeight="900" fontSize="40" letterSpacing="-1">{score}</text>
              <text x="85" y="97" textAnchor="middle" fill="#444444" fontFamily="'Space Mono',monospace" fontSize="9" letterSpacing="2">/100</text>
            </svg>
            <div className="nu-score-label">Score nutricional</div>
            <span className="nu-nivel-icon">{icons[nivel]}</span>
            <div className="nu-hero-nivel">{labels[nivel]}</div>
            <div className="nu-hero-sub">Basado en tus 12 respuestas</div>
          </div>

          <div className="nu-metrics">
            {[
              { val: `${score}/100`, lbl: 'Score nutricional' },
              { val: nivel === 'optimo' ? 'Óptimo' : nivel === 'adecuado' ? 'Adecuado' : nivel === 'mejorable' ? 'Mejorable' : 'Deficiente', lbl: 'Calidad de dieta' },
              { val: verdLabel[answers.verduras_frutas] || '—',  lbl: 'Consumo de verduras' },
              { val: ultraLabel[answers.ultra_procesados] || '—', lbl: 'Ultraprocesados' },
            ].map((m, i) => (
              <div className="nu-metric" key={i}>
                <div className="nu-metric-val">{m.val}</div>
                <div className="nu-metric-lbl">{m.lbl}</div>
              </div>
            ))}
          </div>

          {/* DIETA SEMANAL */}
          <div className="nu-sec-title">Tu dieta semanal personalizada — IA</div>
          <DietaSemanal answers={answers} onDietaLista={setDietaGenerada} />

          <div className="nu-cta">
            <button className="nu-btn-primary full" onClick={saveResults} disabled={saving}>
              {saving
                ? <><span className="nu-spinner" /> Guardando perfil...</>
                : 'Guardar perfil y ver módulo de alimentación →'}
            </button>
            <button className="nu-btn-ghost full" onClick={reset} disabled={saving}>
              Volver a hacer el cuestionario
            </button>
          </div>
        </div>

        <div className={`nu-toast ${toast.show ? 'show' : ''} ${toast.type}`}>{toast.msg}</div>
      </div>
    )
  }

  /* ── QUESTIONNAIRE VIEW ── */
  return (
    <div className="nu-wrap">
      <style>{CSS}</style>
      <header className="nu-header">
        <button className="nu-back" onClick={() => navigate(-1)}>← Volver</button>
        <div className="nu-header-title">Cuestionario Nutricional</div>
        <div className="nu-counter">{current + 1} / {QUESTIONS.length}</div>
      </header>

      <div className="nu-progress">
        <div className="nu-progress-meta">
          <span className="nu-cat-tag">{q.category}</span>
          <span className="nu-pct-label">{pct}%</span>
        </div>
        <div className="nu-track"><div className="nu-fill" style={{ width: `${pct}%` }} /></div>
      </div>

      <main className="nu-main">
        <div key={current} ref={slideRef} className={`nu-q-wrap ${exiting ? 'nu-out' : 'nu-in'}`}>
          <div className="nu-ghost-num">{String(current + 1).padStart(2, '0')}</div>
          <h2 className="nu-q-title">{q.title}</h2>
          <div className="nu-opts">
            {q.opts.map(opt => {
              const sel = answers[q.id] === opt.val
              return (
                <div key={opt.val} className={`nu-opt${sel ? ' active' : ''}`} onClick={() => select(opt.val)}>
                  <div className="nu-radio" />
                  <div>
                    <div className="nu-opt-label">{opt.label}</div>
                    {opt.desc && <div className="nu-opt-desc">{opt.desc}</div>}
                  </div>
                </div>
              )
            })}
          </div>
          {error && <div className="nu-error">⚠ {error}</div>}
        </div>
      </main>

      <div className="nu-nav">
        <div className="nu-nav-inner">
          {current > 0
            ? <button className="nu-btn-ghost" onClick={prevQ}>← Atrás</button>
            : <div className="nu-spacer" />}
          <div className="nu-spacer" />
          <button className="nu-btn-primary" onClick={nextQ}>
            {current === QUESTIONS.length - 1 ? 'Ver resultados →' : 'Continuar →'}
          </button>
        </div>
      </div>

      <div className={`nu-toast ${toast.show ? 'show' : ''} ${toast.type}`}>{toast.msg}</div>
    </div>
  )
}