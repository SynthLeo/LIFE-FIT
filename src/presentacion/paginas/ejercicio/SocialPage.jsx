import { useEffect, useState, useCallback, useRef } from 'react'
import api from '@/lib/api'
import { useAuth } from '@/context/AuthContext'
import {
  Trophy, Flame, Dumbbell, Search, TrendingUp, Medal,
  RefreshCw, Heart, ChevronUp, ChevronDown, Users,
  Zap, X, CheckCircle, AlertCircle, ChevronRight
} from 'lucide-react'

/* ─────────────────────────────────────────────
   STYLES — Athlete Core (consistente con CuestionarioPage)
───────────────────────────────────────────── */
const SP_CSS = `
  @import url('https://fonts.googleapis.com/css2?family=Barlow+Condensed:wght@400;600;700;800;900&family=DM+Sans:wght@300;400;500;600&family=Space+Mono:wght@400;700&display=swap');

  .sp-wrap {
    background: var(--color-background);
    min-height: 100vh;
    font-family: 'DM Sans', sans-serif;
    color: var(--color-foreground);
    padding: 32px 24px 80px;
    max-width: 900px;
    margin: 0 auto;
  }

  /* ── Animations ── */
  @keyframes sp-fade  { from { opacity:0; transform:translateY(14px); } to { opacity:1; transform:translateY(0); } }
  @keyframes sp-spin  { to { transform: rotate(360deg); } }
  @keyframes sp-pulse { 0%,100%{opacity:1} 50%{opacity:.4} }
  @keyframes sp-pop   { 0%{transform:scale(1)} 40%{transform:scale(1.3)} 100%{transform:scale(1)} }
  @keyframes sp-toast-in  { from{opacity:0;transform:translateX(20px)} to{opacity:1;transform:translateX(0)} }
  @keyframes sp-toast-out { from{opacity:1;transform:translateX(0)}  to{opacity:0;transform:translateX(20px)} }
  @keyframes sp-bar { from{width:0} to{width:var(--sp-bar-w)} }
  @keyframes sp-skeleton { 0%,100%{opacity:.06} 50%{opacity:.12} }

  .sp-fade { animation: sp-fade 380ms ease both; }
  .sp-fade-d1 { animation: sp-fade 380ms ease 60ms both; }
  .sp-fade-d2 { animation: sp-fade 380ms ease 120ms both; }
  .sp-fade-d3 { animation: sp-fade 380ms ease 180ms both; }

  /* ── Header ── */
  .sp-page-header { margin-bottom: 28px; }
  .sp-page-title {
    font-family: 'Barlow Condensed', sans-serif;
    font-size: 2.75rem;
    font-weight: 900;
    letter-spacing: 0.04em;
    text-transform: uppercase;
    line-height: 1;
    color: var(--color-foreground);
  }
  .sp-page-sub {
    font-size: 0.875rem;
    color: var(--color-muted-foreground);
    margin-top: 6px;
  }

  /* ── Stat cards ── */
  .sp-stats {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 10px;
    margin-bottom: 28px;
  }
  @media(max-width:560px){ .sp-stats{ grid-template-columns:1fr; } }
  .sp-stat {
    background: var(--color-card);
    border: 1px solid var(--border-subtle);
    border-left: 3px solid #C6FF00;
    padding: 18px 20px;
    position: relative;
    overflow: hidden;
  }
  .sp-stat::before {
    content:'';
    position:absolute;
    top:0;left:0;right:0;
    height:1px;
    background: linear-gradient(90deg,transparent,#C6FF00,transparent);
    opacity:.25;
  }
  .sp-stat-icon {
    width:36px;height:36px;
    background:rgba(198,255,0,0.08);
    border:1px solid rgba(198,255,0,0.18);
    display:flex;align-items:center;justify-content:center;
    margin-bottom:12px;
    color:#C6FF00;
  }
  .sp-stat-val {
    font-family:'Barlow Condensed',sans-serif;
    font-size:2.25rem;
    font-weight:900;
    line-height:1;
    color:var(--color-foreground);
    letter-spacing:0.02em;
  }
  .sp-stat-label {
    font-family:'Space Mono',monospace;
    font-size:0.52rem;
    letter-spacing:0.16em;
    text-transform:uppercase;
    color:var(--color-muted-foreground);
    margin-top:6px;
  }

  /* ── Tabs ── */
  .sp-tabs {
    display:flex;
    gap:0;
    margin-bottom:24px;
    border-bottom:1px solid var(--border-subtle);
  }
  .sp-tab {
    background:none;border:none;
    padding:11px 22px;
    font-family:'Barlow Condensed',sans-serif;
    font-size:0.9375rem;
    font-weight:700;
    letter-spacing:0.1em;
    text-transform:uppercase;
    color:var(--color-muted-foreground);
    cursor:pointer;
    border-bottom:2px solid transparent;
    transition:color 160ms,border-color 160ms;
    margin-bottom:-1px;
    display:flex;align-items:center;gap:8px;
  }
  .sp-tab:hover { color:var(--color-foreground); }
  .sp-tab.active { color:#C6FF00; border-bottom-color:#C6FF00; }
  .sp-tab-badge {
    background:rgba(198,255,0,0.1);
    color:#C6FF00;
    border:1px solid rgba(198,255,0,0.2);
    font-family:'Space Mono',monospace;
    font-size:0.5rem;
    letter-spacing:0.08em;
    padding:2px 6px;
  }

  /* ── Toolbar (search + filters) ── */
  .sp-toolbar {
    display:flex;gap:10px;flex-wrap:wrap;
    margin-bottom:16px;
    align-items:center;
  }
  .sp-search-wrap {
    position:relative;
    flex:1;
    min-width:180px;
  }
  .sp-search-icon {
    position:absolute;
    left:12px;top:50%;
    transform:translateY(-50%);
    color:var(--color-muted-foreground);
    width:15px;height:15px;
    pointer-events:none;
  }
  .sp-search {
    width:100%;
    background:var(--color-card);
    border:1px solid var(--border-subtle);
    color:var(--color-foreground);
    font-family:'DM Sans',sans-serif;
    font-size:0.875rem;
    padding:10px 12px 10px 36px;
    outline:none;
    transition:border-color 160ms;
  }
  .sp-search::placeholder { color:var(--color-muted-foreground); }
  .sp-search:focus { border-color:rgba(198,255,0,0.3); }

  .sp-filter-btn {
    background:var(--color-card);
    border:1px solid var(--border-subtle);
    color:var(--color-muted-foreground);
    font-family:'Space Mono',monospace;
    font-size:0.58rem;
    letter-spacing:0.1em;
    text-transform:uppercase;
    padding:9px 14px;
    cursor:pointer;
    transition:all 160ms;
    white-space:nowrap;
  }
  .sp-filter-btn:hover { color:var(--color-foreground); border-color:var(--border-medium); }
  .sp-filter-btn.active {
    background:rgba(198,255,0,0.08);
    border-color:rgba(198,255,0,0.3);
    color:#C6FF00;
  }

  /* ── Sort header ── */
  .sp-sort-row {
    display:grid;
    grid-template-columns: 40px 1fr 100px 100px 100px 80px;
    gap:0;
    padding:9px 16px;
    background:var(--surface-2);
    border:1px solid var(--border-subtle);
    border-bottom:none;
  }
  @media(max-width:600px){
    .sp-sort-row { grid-template-columns: 36px 1fr 80px 80px; }
    .sp-sort-volumen,.sp-sort-actions { display:none; }
  }
  .sp-sort-col {
    font-family:'Space Mono',monospace;
    font-size:0.5rem;
    letter-spacing:0.14em;
    text-transform:uppercase;
    color:var(--color-muted-foreground);
    display:flex;align-items:center;gap:4px;
    cursor:pointer;
    user-select:none;
    transition:color 160ms;
  }
  .sp-sort-col:hover { color:var(--color-foreground); }
  .sp-sort-col.active { color:#C6FF00; }
  .sp-sort-col.no-sort { cursor:default; }
  .sp-sort-col.no-sort:hover { color:var(--color-muted-foreground); }
  .sp-sort-right { justify-content:flex-end; }

  /* ── Leaderboard rows ── */
  .sp-lb-list {
    border:1px solid var(--border-subtle);
    overflow:hidden;
  }
  .sp-lb-row {
    display:grid;
    grid-template-columns: 40px 1fr 100px 100px 100px 80px;
    gap:0;
    padding:14px 16px;
    border-bottom:1px solid var(--border-subtle);
    transition:background 160ms;
    align-items:center;
  }
  .sp-lb-row:last-child { border-bottom:none; }
  .sp-lb-row:hover:not(.me) { background:var(--surface-2); }
  @media(max-width:600px){
    .sp-lb-row { grid-template-columns: 36px 1fr 80px 80px; }
    .sp-lb-col-vol,.sp-lb-col-act { display:none; }
  }
  .sp-lb-row.me {
    background:rgba(198,255,0,0.05);
    border-left:3px solid #C6FF00;
  }

  .sp-pos {
    font-family:'Space Mono',monospace;
    font-size:0.7rem;
    color:var(--color-muted-foreground);
    display:flex;align-items:center;justify-content:center;
  }
  .sp-medal-1 { color:#FFD700; }
  .sp-medal-2 { color:#C0C0C0; }
  .sp-medal-3 { color:#CD7F32; }

  .sp-user-cell { display:flex;align-items:center;gap:10px;min-width:0; }
  .sp-avatar {
    width:34px;height:34px;border-radius:50%;
    display:flex;align-items:center;justify-content:center;
    font-family:'Barlow Condensed',sans-serif;
    font-weight:800;font-size:0.9rem;
    flex-shrink:0;
    background:var(--surface-3);color:var(--color-muted-foreground);
  }
  .sp-avatar.me {
    background:#C6FF00;color:#080808;
  }
  .sp-username {
    font-size:0.875rem;font-weight:600;
    color:var(--color-foreground);white-space:nowrap;overflow:hidden;text-overflow:ellipsis;
  }
  .sp-lb-row.me .sp-username { color:#C6FF00; }
  .sp-you-tag {
    font-family:'Space Mono',monospace;
    font-size:0.5rem;letter-spacing:0.1em;
    color:var(--color-muted-foreground);margin-left:4px;
  }
  .sp-nivel-badge {
    font-family:'Space Mono',monospace;
    font-size:0.48rem;letter-spacing:0.12em;
    text-transform:uppercase;padding:2px 7px;
    display:inline-block;margin-top:3px;
  }
  .sp-nivel-p { background:rgba(34,197,94,0.08);color:#86efac;border:1px solid rgba(34,197,94,0.2); }
  .sp-nivel-i { background:rgba(245,158,11,0.08);color:#fcd34d;border:1px solid rgba(245,158,11,0.2); }
  .sp-nivel-a { background:rgba(239,68,68,0.08);color:#fca5a5;border:1px solid rgba(239,68,68,0.2); }

  .sp-lb-num {
    font-family:'Barlow Condensed',sans-serif;
    font-weight:700;font-size:1rem;
    color:var(--color-foreground);text-align:right;
  }
  .sp-lb-sub {
    font-family:'Space Mono',monospace;
    font-size:0.48rem;letter-spacing:0.1em;
    text-transform:uppercase;color:var(--color-muted-foreground);
  }

  .sp-challenge-btn {
    background:none;
    border:1px solid var(--border-medium);
    color:var(--color-muted-foreground);
    font-family:'Barlow Condensed',sans-serif;
    font-size:0.72rem;letter-spacing:0.1em;
    text-transform:uppercase;
    padding:6px 11px;cursor:pointer;
    transition:all 160ms;
    width:100%;
  }
  .sp-challenge-btn:hover:not(:disabled) {
    border-color:rgba(198,255,0,0.3);color:#C6FF00;
    background:rgba(198,255,0,0.05);
  }
  .sp-challenge-btn:disabled { opacity:.4;cursor:not-allowed; }

  /* ── Volume bar inside row ── */
  .sp-vol-bar-track {
    height:3px;background:var(--surface-2);
    margin-top:5px;overflow:hidden;
  }
  .sp-vol-bar-fill {
    height:100%;background:#C6FF00;opacity:.5;
    animation:sp-bar 600ms cubic-bezier(0.4,0,0.2,1) both;
  }

  /* ── Feed ── */
  .sp-feed-header {
    display:flex;justify-content:space-between;align-items:center;
    margin-bottom:14px;
  }
  .sp-feed-count {
    font-family:'Space Mono',monospace;
    font-size:0.56rem;letter-spacing:0.14em;
    text-transform:uppercase;color:var(--color-muted-foreground);
  }
  .sp-refresh-btn {
    background:none;border:1px solid var(--border-subtle);
    color:var(--color-muted-foreground);
    padding:7px 14px;cursor:pointer;
    display:flex;align-items:center;gap:6px;
    font-family:'Space Mono',monospace;font-size:0.52rem;
    letter-spacing:0.1em;text-transform:uppercase;
    transition:all 160ms;
  }
  .sp-refresh-btn:hover { color:var(--color-foreground);border-color:var(--border-medium); }
  .sp-refresh-btn.spinning svg { animation:sp-spin 0.7s linear infinite; }

  .sp-feed-list { display:flex;flex-direction:column;gap:8px; }

  .sp-feed-item {
    background:var(--color-card);
    border:1px solid var(--border-subtle);
    border-left:3px solid transparent;
    padding:16px 18px;
    transition:background 160ms,border-left-color 160ms;
  }
  .sp-feed-item:hover { background:var(--surface-2); }
  .sp-feed-item.me { border-left-color:#C6FF00; background:rgba(198,255,0,0.04); }

  .sp-feed-top { display:flex;align-items:flex-start;gap:12px; }
  .sp-feed-avatar {
    width:36px;height:36px;border-radius:50%;
    display:flex;align-items:center;justify-content:center;
    font-family:'Barlow Condensed',sans-serif;
    font-weight:800;font-size:0.9375rem;
    flex-shrink:0;
    background:var(--surface-3);color:var(--color-muted-foreground);
  }
  .sp-feed-avatar.me { background:#C6FF00;color:#080808; }

  .sp-feed-body { flex:1;min-width:0; }
  .sp-feed-name-row { display:flex;align-items:center;gap:8px;flex-wrap:wrap;margin-bottom:4px; }
  .sp-feed-name {
    font-size:0.875rem;font-weight:600;color:var(--color-foreground);
  }
  .sp-feed-item.me .sp-feed-name { color:#C6FF00; }

  .sp-feed-tipo {
    display:inline-flex;align-items:center;gap:4px;
    font-family:'Space Mono',monospace;font-size:0.48rem;
    letter-spacing:0.12em;text-transform:uppercase;
    padding:2px 7px;
  }
  .sp-tipo-sesion  { background:rgba(99,102,241,0.09);color:#a5b4fc;border:1px solid rgba(99,102,241,0.2); }
  .sp-tipo-racha   { background:rgba(251,146,60,0.09);color:#fdba74;border:1px solid rgba(251,146,60,0.2); }
  .sp-tipo-rutina  { background:rgba(59,130,246,0.09);color:#93c5fd;border:1px solid rgba(59,130,246,0.2); }
  .sp-tipo-logro   { background:rgba(234,179,8,0.09);color:#fde68a;border:1px solid rgba(234,179,8,0.2); }

  .sp-feed-text { font-size:0.8125rem;color:var(--color-muted-foreground);line-height:1.5; }
  .sp-feed-time { font-family:'Space Mono',monospace;font-size:0.5rem;letter-spacing:0.1em;color:var(--color-muted-foreground);margin-top:6px; }

  .sp-feed-actions { display:flex;align-items:center;gap:12px;margin-top:10px;padding-top:10px;border-top:1px solid var(--border-subtle); }
  .sp-like-btn {
    background:none;border:none;cursor:pointer;
    display:inline-flex;align-items:center;gap:5px;
    font-family:'Space Mono',monospace;font-size:0.52rem;
    letter-spacing:0.08em;
    color:var(--color-muted-foreground);
    transition:color 160ms;
    padding:0;
  }
  .sp-like-btn:hover { color:var(--color-foreground); }
  .sp-like-btn.liked { color:#ef4444; }
  .sp-like-btn.liked svg { animation:sp-pop 300ms ease; }
  .sp-like-count { min-width:14px; }

  /* ── Load more ── */
  .sp-load-more {
    width:100%;
    background:none;
    border:1px solid var(--border-subtle);
    color:var(--color-muted-foreground);
    font-family:'Barlow Condensed',sans-serif;
    font-size:0.875rem;font-weight:700;
    letter-spacing:0.12em;text-transform:uppercase;
    padding:13px;cursor:pointer;
    margin-top:12px;
    transition:all 160ms;
    display:flex;align-items:center;justify-content:center;gap:8px;
  }
  .sp-load-more:hover { color:var(--color-foreground);border-color:var(--border-medium); }

  /* ── Empty state ── */
  .sp-empty {
    padding:40px;text-align:center;
    font-family:'Space Mono',monospace;
    font-size:0.6rem;letter-spacing:0.14em;
    text-transform:uppercase;color:var(--color-muted-foreground);
  }

  /* ── Footer note ── */
  .sp-footnote {
    font-family:'Space Mono',monospace;
    font-size:0.52rem;letter-spacing:0.1em;
    text-transform:uppercase;color:var(--color-muted-foreground);
    text-align:center;margin-top:16px;
  }

  /* ── Skeleton ── */
  .sp-skel {
    background:var(--surface-2);
    animation:sp-skeleton 1.4s ease infinite;
  }
  .sp-skel-row {
    height:56px;margin-bottom:8px;
    background:var(--surface-1);
    animation:sp-skeleton 1.4s ease infinite;
  }

  /* ── Toast ── */
  .sp-toast-container {
    position:fixed;
    top:20px;right:20px;
    z-index:9999;
    display:flex;flex-direction:column;gap:8px;
    pointer-events:none;
  }
  .sp-toast {
    display:flex;align-items:center;gap:10px;
    padding:12px 16px;
    background:var(--color-card);
    border:1px solid var(--border-medium);
    font-family:'Space Mono',monospace;
    font-size:0.6rem;letter-spacing:0.1em;
    text-transform:uppercase;
    color:var(--color-foreground);
    animation:sp-toast-in 250ms ease both;
    max-width:320px;
    box-shadow:0 4px 20px rgba(0,0,0,0.5);
  }
  .sp-toast.success { border-color:rgba(198,255,0,0.25);color:#C6FF00; }
  .sp-toast.error   { border-color:rgba(239,68,68,0.25);color:#fca5a5; }
  .sp-toast.info    { border-color:rgba(99,102,241,0.25);color:#a5b4fc; }
  .sp-toast.hiding  { animation:sp-toast-out 250ms ease both; }

  /* ── Loading screen ── */
  .sp-loading {
    display:flex;align-items:center;justify-content:center;
    min-height:100vh;background:var(--color-background);flex-direction:column;gap:16px;
  }
  .sp-loading-ring {
    width:40px;height:40px;border:3px solid var(--surface-2);
    border-top-color:#C6FF00;border-radius:50%;
    animation:sp-spin 0.8s linear infinite;
  }
  .sp-loading-text {
    font-family:'Space Mono',monospace;font-size:0.56rem;
    letter-spacing:0.2em;text-transform:uppercase;color:var(--color-muted-foreground);
  }
`

/* ─────────────────────────────────────────────
   MOCK DATA
───────────────────────────────────────────── */
function leaderboardMock(nombre = 'Tú', racha = 0, sesiones = 0) {
  const usuarios = [
    { nombre:'Carlos M.',  racha:28, sesiones:54, volumen:12400, nivel:'avanzado'     },
    { nombre:'Ana L.',     racha:21, sesiones:47, volumen:9800,  nivel:'intermedio'   },
    { nombre:'Jorge R.',   racha:18, sesiones:39, volumen:8700,  nivel:'intermedio'   },
    { nombre,              racha,    sesiones,    volumen:5200,  nivel:'principiante', eres_tu:true },
    { nombre:'Sofía V.',   racha:12, sesiones:28, volumen:6100,  nivel:'intermedio'   },
    { nombre:'Miguel A.',  racha:9,  sesiones:22, volumen:4300,  nivel:'principiante' },
    { nombre:'Laura G.',   racha:7,  sesiones:19, volumen:3900,  nivel:'principiante' },
    { nombre:'Pedro C.',   racha:5,  sesiones:14, volumen:2800,  nivel:'principiante' },
  ]
  return usuarios
    .sort((a, b) => b.sesiones - a.sesiones || b.racha - a.racha)
    .map((u, i) => ({ ...u, posicion: i + 1 }))
}

function feedMock(nombre = 'Tú') {
  const hoy = new Date()
  const hace = (h) => {
    if (h < 1)  return 'Hace unos minutos'
    if (h < 24) return `Hace ${h}h`
    const d = Math.floor(h / 24)
    return `Hace ${d} día${d !== 1 ? 's' : ''}`
  }
  return [
    { id:1, usuario:'Carlos M.',  avatar:'C', tipo:'sesion',  texto:'completó sesión de espalda · 18 series · 4 200 kg',           hace:hace(1)  },
    { id:2, usuario:'Ana L.',     avatar:'A', tipo:'racha',   texto:'alcanzó 21 días de racha 🔥',                                  hace:hace(2)  },
    { id:3, usuario:nombre,       avatar:nombre[0]?.toUpperCase()||'T', tipo:'sesion', texto:'completó sesión de piernas · 12 series · 2 800 kg', hace:hace(3), eres_tu:true },
    { id:4, usuario:'Jorge R.',   avatar:'J', tipo:'rutina',  texto:'creó rutina con IA: "Fuerza Total 3 días"',                    hace:hace(5)  },
    { id:5, usuario:'Carlos M.',  avatar:'C', tipo:'logro',   texto:'superó 10 000 kg de volumen total acumulado 💪',               hace:hace(8)  },
    { id:6, usuario:'Sofía V.',   avatar:'S', tipo:'sesion',  texto:'completó sesión de hombros · 9 series · 1 400 kg',             hace:hace(22) },
    { id:7, usuario:'Ana L.',     avatar:'A', tipo:'sesion',  texto:'completó sesión de pecho · 14 series · 3 100 kg',              hace:hace(26) },
    { id:8, usuario:'Miguel A.',  avatar:'M', tipo:'racha',   texto:'alcanzó 9 días de racha consecutivos',                         hace:hace(30) },
    { id:9, usuario:'Laura G.',   avatar:'L', tipo:'rutina',  texto:'inició "Cardio Base 3x Semana" recomendada por IA',            hace:hace(48) },
  ]
}

/* ─────────────────────────────────────────────
   HELPERS
───────────────────────────────────────────── */
const TIPO_META = {
  sesion: { label:'Sesión',  cls:'sp-tipo-sesion',  Icon: Dumbbell   },
  racha:  { label:'Racha',   cls:'sp-tipo-racha',   Icon: Flame       },
  rutina: { label:'Rutina',  cls:'sp-tipo-rutina',  Icon: TrendingUp  },
  logro:  { label:'Logro',   cls:'sp-tipo-logro',   Icon: Trophy      },
}
const NIVEL_CLS = {
  principiante: 'sp-nivel-p',
  intermedio:   'sp-nivel-i',
  avanzado:     'sp-nivel-a',
}

function PosIcon({ pos }) {
  if (pos === 1) return <Trophy style={{ width:16,height:16 }} className="sp-medal-1" />
  if (pos === 2) return <Trophy style={{ width:16,height:16 }} className="sp-medal-2" />
  if (pos === 3) return <Trophy style={{ width:16,height:16 }} className="sp-medal-3" />
  return <span style={{ fontFamily:"'Space Mono',monospace", fontSize:'0.65rem', color:'var(--color-muted-foreground)' }}>{pos}</span>
}

function SortIcon({ col, sortBy, sortDir }) {
  if (sortBy !== col) return <ChevronUp style={{ width:10,height:10,opacity:.3 }} />
  return sortDir === 'desc'
    ? <ChevronDown style={{ width:10,height:10 }} />
    : <ChevronUp   style={{ width:10,height:10 }} />
}

/* ─────────────────────────────────────────────
   TOAST SYSTEM
───────────────────────────────────────────── */
function useToast() {
  const [toasts, setToasts] = useState([])
  const add = useCallback((msg, type = 'info', duration = 3200) => {
    const id = Date.now()
    setToasts(t => [...t, { id, msg, type }])
    setTimeout(() => {
      setToasts(t => t.map(x => x.id === id ? { ...x, hiding: true } : x))
      setTimeout(() => setToasts(t => t.filter(x => x.id !== id)), 280)
    }, duration)
  }, [])
  return { toasts, add }
}

function ToastContainer({ toasts }) {
  return (
    <div className="sp-toast-container">
      {toasts.map(t => (
        <div key={t.id} className={`sp-toast ${t.type} ${t.hiding ? 'hiding' : ''}`}>
          {t.type === 'success' && <CheckCircle style={{ width:13,height:13,flexShrink:0 }} />}
          {t.type === 'error'   && <AlertCircle style={{ width:13,height:13,flexShrink:0 }} />}
          {t.msg}
        </div>
      ))}
    </div>
  )
}

/* ─────────────────────────────────────────────
   COMPONENT
───────────────────────────────────────────── */
export default function SocialPage() {
  const { user } = useAuth()
  const { toasts, add: addToast } = useToast()

  /* ── Remote state ── */
  const [stats,      setStats]     = useState(null)
  const [loading,    setLoading]   = useState(true)
  const [lbRemote,   setLbRemote]  = useState(null)   // null = usar mock
  const [feedRemote, setFeedRemote] = useState(null)  // null = usar mock

  /* ── UI state ── */
  const [tab,           setTab]           = useState('leaderboard')
  const [busqueda,      setBusqueda]      = useState('')
  const [sortBy,        setSortBy]        = useState('sesiones')  // sesiones | racha | volumen
  const [sortDir,       setSortDir]       = useState('desc')
  const [nivelFilter,   setNivelFilter]   = useState('todos')
  const [challenged,    setChallenged]    = useState({})          // nombre -> bool
  const [likes,         setLikes]         = useState({})          // id -> { liked, count }
  const [feedVisible,   setFeedVisible]   = useState(5)
  const [refreshing,    setRefreshing]    = useState(false)

  /* ── Auto-refresh cada 60 s ── */
  const refreshTimerRef = useRef(null)

  /* ── Fetch stats ── */
  useEffect(() => {
    api.get('/PanelControl/ObtenerPanel.php')
      .then(r => setStats(r.data?.stats ?? {}))
      .catch(() => setStats({}))
      .finally(() => setLoading(false))
  }, [])

  /* ── Intentar endpoint de leaderboard real ── */
  useEffect(() => {
    api.get('/Social/Leaderboard.php')
      .then(r => { if (r.data?.leaderboard) setLbRemote(r.data.leaderboard) })
      .catch(() => {}) // silencioso, se usa mock
  }, [])

  /* ── Intentar endpoint de feed real ── */
  const fetchFeed = useCallback(() => {
    api.get('/Social/Feed.php')
      .then(r => { if (r.data?.feed) setFeedRemote(r.data.feed) })
      .catch(() => {})
  }, [])

  useEffect(() => {
    fetchFeed()
    refreshTimerRef.current = setInterval(fetchFeed, 60_000)
    return () => clearInterval(refreshTimerRef.current)
  }, [fetchFeed])

  /* ── Datos finales ── */
  const nombre   = user?.nombre ?? 'Tú'
  const rawLb    = lbRemote    ?? leaderboardMock(nombre, stats?.racha ?? 0, stats?.sesiones ?? 0)
  const rawFeed  = feedRemote  ?? feedMock(nombre)

  /* ── Inicializar likes con conteos base ── */
  useEffect(() => {
    setLikes(prev => {
      const init = {}
      rawFeed.forEach(item => {
        if (!prev[item.id]) init[item.id] = { liked:false, count: Math.floor(Math.random() * 8) }
        else init[item.id] = prev[item.id]
      })
      return { ...init, ...prev }
    })
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [rawFeed.length])

  /* ── Leaderboard: filtrar + ordenar ── */
  const maxVol = Math.max(...rawLb.map(u => u.volumen))
  const filteredLb = rawLb
    .filter(u => nivelFilter === 'todos' || u.nivel === nivelFilter)
    .filter(u => !busqueda || u.nombre.toLowerCase().includes(busqueda.toLowerCase()))
    .sort((a, b) => {
      const dir = sortDir === 'desc' ? -1 : 1
      return dir * ((a[sortBy] ?? 0) - (b[sortBy] ?? 0))
    })
    .map((u, i) => ({ ...u, posicion: i + 1 }))

  const miPosicion = rawLb.find(u => u.eres_tu)?.posicion ?? '–'

  /* ── Handlers ── */
  function toggleSort(col) {
    if (sortBy === col) setSortDir(d => d === 'desc' ? 'asc' : 'desc')
    else { setSortBy(col); setSortDir('desc') }
  }

  function toggleLike(id) {
    setLikes(prev => {
      const cur = prev[id] ?? { liked:false, count:0 }
      return { ...prev, [id]: { liked:!cur.liked, count: cur.liked ? cur.count-1 : cur.count+1 } }
    })
  }

  async function handleChallenge(u) {
    if (u.eres_tu || challenged[u.nombre]) return
    setChallenged(c => ({ ...c, [u.nombre]: true }))
    try {
      await api.post('/Social/Retar.php', { objetivo: u.nombre })
      addToast(`Reto enviado a ${u.nombre}`, 'success')
    } catch {
      // endpoint no existe aún → simulamos
      addToast(`Reto enviado a ${u.nombre} 🥊`, 'success')
    }
  }

  async function handleRefresh() {
    setRefreshing(true)
    fetchFeed()
    await new Promise(r => setTimeout(r, 900))
    setRefreshing(false)
    addToast('Feed actualizado', 'success')
  }

  /* ── Loading screen ── */
  if (loading) return (
    <div className="sp-loading">
      <style>{SP_CSS}</style>
      <div className="sp-loading-ring" />
      <div className="sp-loading-text">Cargando comunidad…</div>
    </div>
  )

  const visibleFeed = rawFeed.slice(0, feedVisible)

  return (
    <div className="sp-wrap">
      <style>{SP_CSS}</style>
      <ToastContainer toasts={toasts} />

      {/* ── Page header ── */}
      <div className="sp-page-header sp-fade">
        <h1 className="sp-page-title">Comunidad</h1>
        <p className="sp-page-sub">Compara tu progreso y sigue la actividad de tu comunidad.</p>
      </div>

      {/* ── Stats cards ── */}
      <div className="sp-stats">
        {[
          { label:'Tu posición',  value:`#${miPosicion}`,          icon:Trophy,   sub:'ranking semanal'      },
          { label:'Tu racha',     value:`${stats?.racha ?? 0}`,     icon:Flame,    sub:'días consecutivos 🔥' },
          { label:'Sesiones',     value:`${stats?.sesiones ?? 0}`,  icon:Dumbbell, sub:'completadas en total' },
        ].map(({ label, value, icon: Icon, sub }, i) => (
          <div className={`sp-stat sp-fade-d${i}`} key={label}>
            <div className="sp-stat-icon"><Icon style={{ width:17,height:17 }} /></div>
            <div className="sp-stat-val">{value}</div>
            <div className="sp-stat-label">{label} · {sub}</div>
          </div>
        ))}
      </div>

      {/* ── Tabs ── */}
      <div className="sp-tabs">
        {[
          { id:'leaderboard', label:'Ranking',   badge: rawLb.length },
          { id:'feed',        label:'Actividad', badge: rawFeed.length },
        ].map(t => (
          <button
            key={t.id}
            className={`sp-tab ${tab === t.id ? 'active' : ''}`}
            onClick={() => setTab(t.id)}
          >
            {t.label}
            <span className="sp-tab-badge">{t.badge}</span>
          </button>
        ))}
      </div>

      {/* ──────────────────────────────────────
          LEADERBOARD
      ────────────────────────────────────── */}
      {tab === 'leaderboard' && (
        <div className="sp-fade">

          {/* Toolbar */}
          <div className="sp-toolbar">
            {/* Search */}
            <div className="sp-search-wrap">
              <Search className="sp-search-icon" />
              <input
                className="sp-search"
                placeholder="Buscar usuario…"
                value={busqueda}
                onChange={e => setBusqueda(e.target.value)}
              />
            </div>

            {/* Nivel filter */}
            {['todos','principiante','intermedio','avanzado'].map(n => (
              <button
                key={n}
                className={`sp-filter-btn ${nivelFilter === n ? 'active' : ''}`}
                onClick={() => setNivelFilter(n)}
              >
                {n === 'todos' ? 'Todos' : n.slice(0,4) + '.'}
              </button>
            ))}
          </div>

          {/* Sort header */}
          <div className="sp-sort-row">
            <div className="sp-sort-col no-sort">#</div>
            <div className="sp-sort-col no-sort">Usuario</div>
            <div
              className={`sp-sort-col sp-sort-right ${sortBy==='sesiones'?'active':''}`}
              onClick={() => toggleSort('sesiones')}
            >
              <SortIcon col="sesiones" sortBy={sortBy} sortDir={sortDir} />
              Sesiones
            </div>
            <div
              className={`sp-sort-col sp-sort-right ${sortBy==='racha'?'active':''}`}
              onClick={() => toggleSort('racha')}
            >
              <SortIcon col="racha" sortBy={sortBy} sortDir={sortDir} />
              Racha
            </div>
            <div
              className={`sp-sort-col sp-sort-right sp-sort-volumen ${sortBy==='volumen'?'active':''}`}
              onClick={() => toggleSort('volumen')}
            >
              <SortIcon col="volumen" sortBy={sortBy} sortDir={sortDir} />
              Volumen
            </div>
            <div className="sp-sort-col sp-sort-actions no-sort" />
          </div>

          {/* Rows */}
          <div className="sp-lb-list">
            {filteredLb.length === 0 ? (
              <div className="sp-empty">Sin resultados para "{busqueda}"</div>
            ) : filteredLb.map(u => (
              <div key={u.posicion} className={`sp-lb-row ${u.eres_tu ? 'me' : ''}`}>

                {/* Posición */}
                <div className="sp-pos"><PosIcon pos={u.posicion} /></div>

                {/* Usuario */}
                <div className="sp-user-cell">
                  <div className={`sp-avatar ${u.eres_tu ? 'me' : ''}`}>
                    {u.nombre[0].toUpperCase()}
                  </div>
                  <div>
                    <div className="sp-username">
                      {u.nombre}
                      {u.eres_tu && <span className="sp-you-tag">(tú)</span>}
                    </div>
                    <span className={`sp-nivel-badge ${NIVEL_CLS[u.nivel]}`}>{u.nivel}</span>
                  </div>
                </div>

                {/* Sesiones */}
                <div style={{ textAlign:'right' }}>
                  <div className="sp-lb-num">{u.sesiones}</div>
                  <div className="sp-lb-sub">sesiones</div>
                </div>

                {/* Racha */}
                <div style={{ textAlign:'right' }}>
                  <div className="sp-lb-num">{u.racha} 🔥</div>
                  <div className="sp-lb-sub">días</div>
                </div>

                {/* Volumen */}
                <div className="sp-lb-col-vol" style={{ textAlign:'right' }}>
                  <div className="sp-lb-num">{(u.volumen / 1000).toFixed(1)} t</div>
                  <div className="sp-vol-bar-track">
                    <div
                      className="sp-vol-bar-fill"
                      style={{ '--sp-bar-w': `${(u.volumen / maxVol) * 100}%`, width:`${(u.volumen / maxVol) * 100}%` }}
                    />
                  </div>
                </div>

                {/* Acción */}
                <div className="sp-lb-col-act">
                  {!u.eres_tu && (
                    <button
                      className="sp-challenge-btn"
                      onClick={() => handleChallenge(u)}
                      disabled={!!challenged[u.nombre]}
                    >
                      {challenged[u.nombre] ? '✓ Retado' : 'Retar'}
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>

          <p className="sp-footnote">
            Ordenado por {sortBy} · {nivelFilter !== 'todos' ? `nivel: ${nivelFilter} · ` : ''}
            actualizado diariamente
          </p>
        </div>
      )}

      {/* ──────────────────────────────────────
          FEED
      ────────────────────────────────────── */}
      {tab === 'feed' && (
        <div className="sp-fade">

          {/* Feed header */}
          <div className="sp-feed-header">
            <span className="sp-feed-count">{rawFeed.length} actividades recientes</span>
            <button
              className={`sp-refresh-btn ${refreshing ? 'spinning' : ''}`}
              onClick={handleRefresh}
              disabled={refreshing}
            >
              <RefreshCw style={{ width:11,height:11 }} />
              {refreshing ? 'Actualizando…' : 'Actualizar'}
            </button>
          </div>

          {/* Feed items */}
          <div className="sp-feed-list">
            {visibleFeed.map(item => {
              const meta   = TIPO_META[item.tipo] || TIPO_META.sesion
              const likeState = likes[item.id] ?? { liked:false, count:0 }
              return (
                <div key={item.id} className={`sp-feed-item ${item.eres_tu ? 'me' : ''}`}>
                  <div className="sp-feed-top">
                    <div className={`sp-feed-avatar ${item.eres_tu ? 'me' : ''}`}>
                      {item.avatar}
                    </div>
                    <div className="sp-feed-body">
                      <div className="sp-feed-name-row">
                        <span className="sp-feed-name">{item.usuario}</span>
                        <span className={`sp-feed-tipo ${meta.cls}`}>
                          <meta.Icon style={{ width:9,height:9 }} />
                          {meta.label}
                        </span>
                      </div>
                      <p className="sp-feed-text">{item.texto}</p>
                      <p className="sp-feed-time">{item.hace}</p>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="sp-feed-actions">
                    <button
                      className={`sp-like-btn ${likeState.liked ? 'liked' : ''}`}
                      onClick={() => toggleLike(item.id)}
                    >
                      <Heart style={{ width:12,height:12 }} />
                      <span className="sp-like-count">{likeState.count}</span>
                    </button>
                  </div>
                </div>
              )
            })}
          </div>

          {/* Load more */}
          {feedVisible < rawFeed.length && (
            <button
              className="sp-load-more"
              onClick={() => setFeedVisible(v => v + 4)}
            >
              Ver más actividad
              <ChevronRight style={{ width:14,height:14 }} />
            </button>
          )}

          <p className="sp-footnote">
            Actividad de tu comunidad · próximamente podrás seguir a otros usuarios
          </p>
        </div>
      )}
    </div>
  )
}