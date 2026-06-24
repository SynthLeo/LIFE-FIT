// presentation/presentacion/paginas/dieta/Dieta.jsx

import { useState, useEffect }                          from 'react'
import { useNavigate }                                   from 'react-router-dom'
import * as Tabs                                         from '@radix-ui/react-tabs'
import * as Dialog                                       from '@radix-ui/react-dialog'
import { useIA }                                         from '../../../aplicacion/ia/IA'
import { useIMC, useRegistroDiario, useCitasNutricion } from '../../../aplicacion/alimetacion/Alimentacion'
import { ResultadoIMC, RegistroDiario }                 from '../../../modulos/dieta/Alimentacion'
import { ChatIA }                                        from '../../componentes/Chat'
import api                                               from '@/lib/api'

const COLOR = '#16A34A'

/* ─────────────────────────────────────────────
   BARRA IMC
───────────────────────────────────────────── */
function BarraIMC({ pct }) {
  return (
    <div className="mt-3">
      <div className="flex h-3 rounded-full overflow-hidden mb-1">
        {['#60a5fa', '#22c55e', '#eab308', '#f97316', '#ef4444'].map((c, i) => (
          <div key={i} className="flex-1" style={{ background: c }} />
        ))}
      </div>
      <div className="relative h-4">
        <div
          className="absolute w-0.5 h-4 rounded bg-white transition-all duration-700"
          style={{ left: `${pct}%`, transform: 'translateX(-50%)' }}
        />
      </div>
      <div className="flex justify-between text-[10px] text-muted-foreground mt-0.5">
        <span>&lt;18.5</span><span>18.5</span><span>25</span><span>30</span><span>35+</span>
      </div>
    </div>
  )
}

/* ─────────────────────────────────────────────
   MODAL CITA NUTRICIÓN
───────────────────────────────────────────── */
function ModalCitaNutricion({ open, onClose, agendar }) {
  const hoy  = new Date().toISOString().split('T')[0]
  const [form,      setForm]      = useState({ motivo: 'control_peso', fecha: '', hora: '09:00', notas_usuario: '' })
  const [guardando, setGuardando] = useState(false)
  const [folio,     setFolio]     = useState(null)
  const set = (k, v) => setForm(f => ({ ...f, [k]: v }))

  const handleSubmit = async () => {
    if (!form.fecha) return
    setGuardando(true)
    try { const r = await agendar(form); setFolio(r.folio) }
    catch (e) { alert(e.message) }
    finally { setGuardando(false) }
  }

  return (
    <Dialog.Root open={open} onOpenChange={onClose}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50" />
        <Dialog.Content className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-50 w-full max-w-md bg-card border border-border rounded-2xl p-6 shadow-2xl">
          <Dialog.Title className="text-lg font-bold text-foreground mb-4">Asesoría Nutricional</Dialog.Title>
          {folio ? (
            <div className="text-center py-6">
              <div className="text-4xl mb-3">✅</div>
              <p className="text-white font-semibold mb-1">¡Cita agendada!</p>
              <code className="text-green-400 text-lg font-mono bg-green-500/10 px-4 py-2 rounded-lg">{folio}</code>
              <button onClick={onClose} className="mt-4 block mx-auto px-4 py-2 rounded-xl text-sm font-semibold text-foreground" style={{ background: COLOR }}>Cerrar</button>
            </div>
          ) : (
            <div className="space-y-3">
              <div>
                <label className="text-xs text-muted-foreground mb-1 block">Motivo de consulta</label>
                <select value={form.motivo} onChange={e => set('motivo', e.target.value)}
                  className="w-full bg-secondary border border-border rounded-xl px-3 py-2 text-sm text-foreground focus:outline-none">
                  <option value="control_peso">Control de peso</option>
                  <option value="alimentacion_deportiva">Alimentación deportiva</option>
                  <option value="condicion_medica">Condición médica especial</option>
                  <option value="vegetariano_vegano">Vegetariano / Vegano</option>
                  <option value="presupuesto">Presupuesto limitado</option>
                  <option value="otro">Otro</option>
                </select>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-muted-foreground mb-1 block">Fecha</label>
                  <input type="date" min={hoy} value={form.fecha} onChange={e => set('fecha', e.target.value)}
                    className="w-full bg-secondary border border-border rounded-xl px-3 py-2 text-sm text-foreground focus:outline-none" />
                </div>
                <div>
                  <label className="text-xs text-muted-foreground mb-1 block">Hora</label>
                  <select value={form.hora} onChange={e => set('hora', e.target.value)}
                    className="w-full bg-secondary border border-border rounded-xl px-3 py-2 text-sm text-foreground focus:outline-none">
                    {['09:00', '10:00', '11:00', '12:00', '14:00', '15:00'].map(h => <option key={h}>{h}</option>)}
                  </select>
                </div>
              </div>
              <div className="flex gap-2 pt-1">
                <button onClick={onClose} className="flex-1 py-2 rounded-xl text-sm text-muted-foreground border border-border">Cancelar</button>
                <button onClick={handleSubmit} disabled={guardando || !form.fecha}
                  className="flex-1 py-2 rounded-xl text-sm font-semibold text-foreground disabled:opacity-40"
                  style={{ background: COLOR }}>
                  {guardando ? 'Agendando…' : 'Agendar →'}
                </button>
              </div>
            </div>
          )}
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  )
}

/* ─────────────────────────────────────────────
   PLAN SEMANAL IA — sección en /dieta
───────────────────────────────────────────── */
const NIVEL_META = {
  deficiente: { icon: '🚨', label: 'Dieta deficiente',      color: '#ef4444' },
  mejorable:  { icon: '⚠️',  label: 'Hay margen de mejora', color: '#eab308' },
  adecuado:   { icon: '🔵', label: 'Alimentación adecuada', color: '#60a5fa' },
  optimo:     { icon: '🌟', label: 'Nutrición óptima',       color: COLOR     },
}

function PlanSemanalIA({ perfil, navigate, onPlanGenerado }) {
  const [openDia, setOpenDia] = useState(null)
  const [generando, setGenerando] = useState(false)
  const [planLocal, setPlanLocal] = useState(null)
  const plan  = planLocal || perfil?.plan_semanal
  const nivel = NIVEL_META[perfil?.nivel_nutricion] ?? NIVEL_META.mejorable

  async function regenerarPlan() {
    if (generando) return
    setGenerando(true)
    try {
      const labels = {
        objetivo:    { perder_peso:'perder peso', ganar_masa:'ganar músculo', mantener:'mantener peso', mejorar_salud:'mejorar salud' },
        proteina:    { carnes:'carnes', pescado:'pescado y mariscos', huevo_lacto:'huevo y lácteos', vegetal:'dieta vegetariana/vegana' },
        alergias:    { ninguna:'ninguna restricción', lactosa:'sin lactosa', gluten:'sin gluten', otras:'otras restricciones' },
        presupuesto: { muy_limitado:'menos de $50 MXN/día', limitado:'$50-100 MXN/día', moderado:'$100-200 MXN/día', amplio:'más de $200 MXN/día' },
        cocina:      { completa:'cocina completa', limitada:'solo microondas', cafeteria:'cafetería universitaria', no:'sin acceso a cocina' },
        actividad:   { sedentario:'sedentario', leve:'actividad leve', moderado:'actividad moderada', intenso:'actividad intensa' },
      }
      const dietaPrompt = `Eres un nutriólogo experto. Crea un plan de alimentación VARIADO para toda la semana (lunes a domingo) para un estudiante universitario mexicano.

PERFIL:
- Objetivo: ${dietaLabels.objetivo[answers.objetivo] || answers.objetivo}
- Proteína principal: ${dietaLabels.proteina[answers.proteina] || answers.proteina}
- Restricciones: ${dietaLabels.alergias[answers.alergias] || answers.alergias}
- Presupuesto: ${dietaLabels.presupuesto[answers.presupuesto] || answers.presupuesto}
- Acceso a cocina: ${dietaLabels.cocina[answers.cocina] || answers.cocina}
- Actividad física: ${dietaLabels.actividad[answers.actividad_fisica_alim] || answers.actividad_fisica_alim}

REGLAS IMPORTANTES:
- Cada día debe tener platillos DIFERENTES, no repitas el mismo desayuno o comida dos días seguidos
- Usa ingredientes mexicanos accesibles: tortillas, frijoles, arroz, nopales, calabaza, chayote, jitomate
- Lunes y martes: comidas ligeras
- Miércoles y jueves: comidas con más proteína
- Viernes: algo especial o diferente
- Sábado y domingo: platillos más elaborados o de fin de semana
- Máximo 12 palabras por descripción de platillo
- NUNCA repitas el mismo platillo en la cena dos días seguidos
- Cenas variadas: sopa, quesadillas, enfrijoladas, chilaquiles, ensalada con proteína, sándwich, tacos, crema de verduras

Responde SOLO con JSON válido sin texto adicional:
{"dias":[{"dia":"Lunes","comidas":[{"tiempo":"Desayuno","descripcion":"Avena con plátano y miel","kcal":320},{"tiempo":"Comida","descripcion":"Arroz rojo con pollo y ensalada","kcal":550},{"tiempo":"Cena","descripcion":"Frijoles de olla con tortillas","kcal":380}]},{"dia":"Martes","comidas":[{"tiempo":"Desayuno","descripcion":"Huevos revueltos con frijoles","kcal":350},...]}],"calorias_dia":1800,"nota":"Consejo breve."}`

      const res = await fetch('http://localhost:11434/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ model: 'qwen2.5:3b', prompt: prompt, stream: false, format: 'json', options: { temperature: 0.7, num_predict: 4000 } }),
      })
      const data = await res.json()
      const text = data.content?.map(b => b.text || '').join('') ?? ''
      const parsed = JSON.parse(text.replace(/```json|```/g,'').trim())
      setPlanLocal(parsed)
      onPlanGenerado?.(parsed)
      // Guardar el plan generado en el backend
      import('@/lib/api').then(({ default: api }) => {
        api.post('/Cuestionario/GuardarAlimentacion.php', { ...perfil, plan_semanal: parsed }).catch(() => {})
      })
    } catch(e) {
      alert('No se pudo generar el plan. Intenta de nuevo.')
    } finally {
      setGenerando(false)
    }
  }

  // Sin perfil → invitar a hacer el cuestionario
  if (!perfil) {
    return (
      <div className="mb-6 p-6 bg-secondary/50 border border-border rounded-2xl text-center">
        <p className="text-3xl mb-3">🥗</p>
        <p className="text-sm text-muted-foreground mb-1">Aún no tienes un perfil nutricional.</p>
        <p className="text-xs text-muted-foreground mb-4">Completa el cuestionario para que la IA genere tu dieta semanal personalizada.</p>
        <button
          onClick={() => navigate('/cuestionario-alimentacion')}
          className="px-5 py-2.5 rounded-xl text-sm font-semibold text-foreground"
          style={{ background: COLOR }}
        >
          🤖 Hacer cuestionario + Dieta IA
        </button>
      </div>
    )
  }

  // Perfil guardado pero sin plan → regenerar directamente
  if (!plan) {
    return (
      <div className="mb-6 p-5 bg-secondary/50 border border-border rounded-2xl">
        <div className="flex items-center gap-3 mb-3">
          <span className="text-xl">{nivel.icon}</span>
          <div>
            <p className="text-sm font-semibold text-foreground">{nivel.label}</p>
            <p className="text-xs text-muted-foreground">Score nutricional: {perfil.nutricion_score}/100</p>
          </div>
          <span className="ml-auto text-xs px-3 py-1 rounded-full font-semibold"
            style={{ background: nivel.color + '20', color: nivel.color }}>
            {perfil.nivel_nutricion}
          </span>
        </div>
        <p className="text-xs text-muted-foreground mb-3">
          Tu perfil nutricional está listo. Genera tu plan semanal personalizado con IA.
        </p>
        <div className="flex gap-2 flex-wrap">
          <button
            onClick={regenerarPlan}
            disabled={generando}
            className="text-sm px-5 py-2.5 rounded-xl font-semibold text-foreground disabled:opacity-50 flex items-center gap-2"
            style={{ background: COLOR }}
          >
            {generando ? (
              <><span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin inline-block" /> Generando plan...</>
            ) : '🤖 Generar mi dieta semanal con IA'}
          </button>
          <button
            onClick={() => navigate('/cuestionario-alimentacion')}
            className="text-xs px-4 py-2 rounded-xl font-semibold border transition-all"
            style={{ borderColor: 'rgba(22,163,74,0.35)', color: COLOR, background: 'rgba(22,163,74,0.06)' }}
          >
            ✏️ Actualizar perfil
          </button>
        </div>
      </div>
    )
  }

  // Plan completo — mostrar acordeón
  return (
    <div className="mb-6 rounded-2xl overflow-hidden border border-border bg-secondary/50">
      {/* Cabecera del plan */}
      <div className="flex items-center gap-3 px-5 py-4 border-b border-border"
        style={{ background: 'rgba(22,163,74,0.05)' }}>
        <span className="text-xl">🥗</span>
        <div className="flex-1">
          <p className="text-sm font-semibold" style={{ color: COLOR }}>Plan alimentario semanal — IA</p>
          <p className="text-xs text-muted-foreground">
            {nivel.icon} {nivel.label} · Score {perfil.nutricion_score}/100
            {plan.calorias_dia ? ` · ~${plan.calorias_dia} kcal/día` : ''}
          </p>
        </div>
        <button
          onClick={() => navigate('/cuestionario-alimentacion')}
          className="text-[10px] px-3 py-1.5 rounded-lg border transition-all flex-shrink-0"
          style={{ borderColor: 'rgba(22,163,74,0.3)', color: COLOR, background: 'rgba(22,163,74,0.06)' }}
        >
          🔄 Actualizar
        </button>
      </div>

      {/* Nota del nutriólogo IA */}
      {plan.nota && (
        <div className="px-5 py-3 border-b border-border/50" style={{ background: 'rgba(22,163,74,0.03)' }}>
          <p className="text-xs text-muted-foreground leading-relaxed">💡 {plan.nota}</p>
        </div>
      )}

      {/* Acordeón de días */}
      {(plan.dias ?? []).map(({ dia, comidas }) => {
        const isOpen = openDia === dia
        return (
          <div key={dia} className="border-b border-border/50 last:border-0">
            <button
              onClick={() => setOpenDia(isOpen ? null : dia)}
              className="w-full flex items-center gap-3 px-5 py-3 text-left hover:bg-secondary/50 transition-colors"
            >
              <span className="text-xs font-bold tracking-widest uppercase text-secondary-foreground flex-1">{dia}</span>
              <span className="text-xs text-muted-foreground mr-2">{comidas.length} comidas</span>
              <span className="text-muted-foreground text-xs transition-transform duration-200"
                style={{ transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)' }}>▾</span>
            </button>
            {isOpen && (
              <div className="px-5 pb-4 space-y-2">
                {comidas.map((c, i) => (
                  <div key={i} className="flex gap-3 items-start py-1.5 border-b border-border/50 last:border-0">
                    <span className="text-[10px] font-mono text-muted-foreground min-w-[64px] pt-0.5 uppercase tracking-wide">
                      {c.tiempo}
                    </span>
                    <span className="text-xs text-muted-foreground flex-1 leading-relaxed">{c.descripcion}</span>
                    {c.kcal && (
                      <span className="text-[10px] font-mono text-muted-foreground whitespace-nowrap pt-0.5">
                        ~{c.kcal} kcal
                      </span>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )
      })}
    </div>
  )
}

/* ─────────────────────────────────────────────
   PÁGINA PRINCIPAL
───────────────────────────────────────────── */
export default function AlimentacionPage() {
  const navigate = useNavigate()
  const ia       = useIA('alimentacion')
  const imc      = useIMC()
  const registro = useRegistroDiario()
  const citas    = useCitasNutricion()

  const [modalCita,      setModalCita]      = useState(false)
  const [tabComida,      setTabComida]      = useState('desayuno')
  const [seleccionados,  setSeleccionados]  = useState({ desayuno: [], comida: [], cena: [], snacks: [] })
  const [agua,           setAgua]           = useState(0)
  const [guardandoR,     setGuardandoR]     = useState(false)
  const [msgR,           setMsgR]           = useState(null)
  const [perfilNutricion, setPerfilNutricion] = useState(undefined)  // undefined = cargando

  // Cargar datos al montar
  useEffect(() => {
    imc.calcular()
    citas.cargar()
    registro.cargar()

    // Cargar perfil nutricional + plan semanal
    api.get('/Cuestionario/ObtenerPerfilAlimentacion.php')
      .then(r => setPerfilNutricion(r.data.perfil ?? null))
      .catch(() => setPerfilNutricion(null))
  }, [])

  const toggleChip = (tiempo, item) => {
    setSeleccionados(prev => ({
      ...prev,
      [tiempo]: prev[tiempo].includes(item)
        ? prev[tiempo].filter(x => x !== item)
        : [...prev[tiempo], item],
    }))
  }

  const handleGuardarRegistro = async () => {
    setGuardandoR(true); setMsgR(null)
    try {
      await registro.guardar({ ...seleccionados, agua_vasos: agua })
      setMsgR('✅ Registro guardado correctamente.')
      setSeleccionados({ desayuno: [], comida: [], cena: [], snacks: [] })
      setAgua(0)
    } catch (e) { setMsgR('❌ ' + e.message) }
    finally { setGuardandoR(false) }
  }

  const sugerenciasIA = [
    '¿Qué desayuno rápido y nutritivo puedo hacer?',
    'Tengo $50 para comer hoy, ¿qué compro?',
    '¿Cuánta proteína necesito si entreno?',
    'Soy vegetariano, ¿cómo obtengo hierro?',
  ]

  const imcData = imc.resultado

  return (
    <div className="min-h-screen bg-background text-foreground p-6">

      {/* ── HEADER ── */}
      <div className="mb-8">
        <div className="flex items-center gap-2 text-xs font-semibold tracking-widest mb-2" style={{ color: COLOR }}>
          <span className="w-2 h-2 rounded-full" style={{ background: COLOR }} />
          MÓDULO 03
        </div>
        <h1 className="text-4xl font-black tracking-tight mb-2">
          Alimentación <span style={{ color: COLOR }}>Saludable</span>
        </h1>
        <p className="text-muted-foreground max-w-xl">
          Orientación nutricional, seguimiento diario y asesoría personalizada.
        </p>
        <div className="flex flex-wrap gap-3 mt-4">
          <button
            onClick={() => setModalCita(true)}
            className="px-5 py-2.5 rounded-xl text-sm font-semibold text-foreground transition-transform hover:scale-105"
            style={{ background: COLOR }}
          >
            + Agendar asesoría
          </button>
          <button
            onClick={() => navigate('/cuestionario-alimentacion')}
            className="px-5 py-2.5 rounded-xl text-sm font-semibold border transition-all hover:scale-105"
            style={{ borderColor: 'rgba(22,163,74,0.35)', color: COLOR, background: 'rgba(22,163,74,0.06)' }}
          >
            🥗 Cuestionario + Dieta IA
          </button>
        </div>
      </div>

      {/* ── IMC BANNER ── */}
      {imcData && (
        <div className="mb-6 p-5 bg-secondary/50 border border-border rounded-2xl">
          <div className="flex flex-wrap gap-6 items-center">
            <div>
              <p className="text-xs text-muted-foreground mb-0.5">Tu IMC</p>
              <p className="text-3xl font-black" style={{ color: imcData.info.color }}>{imcData.imc}</p>
              <p className="text-sm font-medium" style={{ color: imcData.info.color }}>{imcData.info.label}</p>
            </div>
            <div className="flex-1 min-w-[200px]">
              <BarraIMC pct={imcData.pctBarra} />
            </div>
            <div className="grid grid-cols-2 gap-x-8 gap-y-1 text-xs">
              <span className="text-muted-foreground">Sedentario</span> <span className="text-foreground">{imcData.getSedentario} kcal</span>
              <span className="text-muted-foreground">Moderado</span>   <span className="text-foreground">{imcData.getModerado} kcal</span>
              <span className="text-muted-foreground">Activo</span>     <span className="text-foreground">{imcData.getActivo} kcal</span>
              <span className="text-muted-foreground">TMB base</span>   <span className="text-foreground">{imcData.tmb} kcal</span>
            </div>
          </div>
        </div>
      )}

      {/* ── PLAN SEMANAL IA ── */}
      {perfilNutricion === undefined ? (
        // Cargando
        <div className="mb-6 p-5 bg-secondary/50 border border-border rounded-2xl flex items-center gap-3">
          <div className="w-4 h-4 border-2 rounded-full animate-spin"
            style={{ borderColor: 'rgba(22,163,74,0.2)', borderTopColor: COLOR }} />
          <p className="text-xs text-muted-foreground">Cargando tu plan nutricional...</p>
        </div>
      ) : (
        <PlanSemanalIA perfil={perfilNutricion} navigate={navigate} onPlanGenerado={plan => setPerfilNutricion(p => ({...p, plan_semanal: plan}))} />
      )}

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <div className="xl:col-span-2 space-y-6">
          <Tabs.Root defaultValue="registro">
            <Tabs.List className="flex gap-1 p-1 bg-secondary/50 rounded-xl mb-4 w-fit">
              {[
                ['registro',  '🍽️ Registro Diario'],
                ['historial', '📊 Historial'],
                ['citas',     '📅 Mis Citas'],
              ].map(([v, l]) => (
                <Tabs.Trigger key={v} value={v}
                  className="px-3 py-1.5 rounded-lg text-xs font-medium text-muted-foreground data-[state=active]:text-foreground data-[state=active]:bg-secondary transition-all">
                  {l}
                </Tabs.Trigger>
              ))}
            </Tabs.List>

            {/* ── TAB: Registro Diario ── */}
            <Tabs.Content value="registro">
              <div className="bg-secondary/50 border border-border rounded-2xl p-5">
                <div className="flex gap-1 mb-4">
                  {RegistroDiario.TIEMPOS.map(t => (
                    <button key={t} onClick={() => setTabComida(t)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-medium capitalize transition-all ${
                        tabComida === t ? 'text-white bg-secondary' : 'text-muted-foreground hover:text-secondary-foreground'
                      }`}>
                      {t}
                    </button>
                  ))}
                </div>

                <div className="flex flex-wrap gap-2 mb-5">
                  {(RegistroDiario.OPCIONES[tabComida] ?? []).map(item => (
                    <button key={item} onClick={() => toggleChip(tabComida, item)}
                      className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-all ${
                        seleccionados[tabComida].includes(item)
                          ? 'text-white border-green-500/50 bg-green-500/15'
                          : 'border-border text-muted-foreground hover:border-border hover:text-secondary-foreground'
                      }`}>
                      {item}
                    </button>
                  ))}
                </div>

                {/* Agua */}
                <div className="flex items-center gap-4 mb-4 p-3 bg-secondary/50 rounded-xl">
                  <span className="text-2xl">💧</span>
                  <div className="flex-1">
                    <p className="text-xs text-muted-foreground mb-1">
                      Vasos de agua hoy: <strong className="text-foreground">{agua}</strong>
                    </p>
                    <div className="flex gap-1">
                      {[0,1,2,3,4,5,6,7,8].map(v => (
                        <button key={v} onClick={() => setAgua(v)}
                          className={`w-7 h-7 rounded-lg text-xs font-medium border transition-all ${
                            agua >= v && v > 0
                              ? 'border-sky-500/50 bg-sky-500/20 text-sky-400'
                              : 'border-border text-muted-foreground hover:border-border'
                          }`}>
                          {v}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                <button onClick={handleGuardarRegistro} disabled={guardandoR}
                  className="px-5 py-2.5 rounded-xl text-sm font-semibold text-foreground disabled:opacity-40"
                  style={{ background: COLOR }}>
                  {guardandoR ? 'Guardando…' : 'Guardar registro 💾'}
                </button>
                {msgR && <p className="mt-2 text-xs text-muted-foreground">{msgR}</p>}
              </div>
            </Tabs.Content>

            {/* ── TAB: Historial ── */}
            <Tabs.Content value="historial">
              <div className="space-y-3">
                {registro.cargando
                  ? <p className="text-muted-foreground text-sm">Cargando…</p>
                  : registro.registros.length === 0
                  ? (
                    <div className="text-center py-10 text-muted-foreground">
                      <p className="text-3xl mb-2">🥗</p>
                      <p className="text-sm">Aún no hay registros esta semana.</p>
                    </div>
                  ) : registro.registros.map((r, i) => (
                    <div key={i} className="p-4 bg-secondary/50 border border-border rounded-xl">
                      <div className="flex justify-between items-start mb-2">
                        <p className="text-sm font-semibold text-foreground">{r.fecha}</p>
                        <span className="text-xs px-2 py-0.5 rounded-full"
                          style={{ background: r.estadoAgua.color + '15', color: r.estadoAgua.color }}>
                          {r.estadoAgua.msg}
                        </span>
                      </div>
                      <div className="grid grid-cols-2 gap-x-4 text-xs text-muted-foreground">
                        {r.desayuno.length > 0 && <p><span className="text-muted-foreground">Desayuno:</span> {r.desayuno.join(', ')}</p>}
                        {r.comida.length   > 0 && <p><span className="text-muted-foreground">Comida:</span> {r.comida.join(', ')}</p>}
                        {r.cena.length     > 0 && <p><span className="text-muted-foreground">Cena:</span> {r.cena.join(', ')}</p>}
                        {r.snacks.length   > 0 && <p><span className="text-muted-foreground">Snacks:</span> {r.snacks.join(', ')}</p>}
                      </div>
                    </div>
                  ))
                }
              </div>
            </Tabs.Content>

            {/* ── TAB: Citas ── */}
            <Tabs.Content value="citas">
              <div className="space-y-3">
                {citas.cargando
                  ? <p className="text-muted-foreground text-sm">Cargando…</p>
                  : citas.citas.length === 0
                  ? (
                    <div className="text-center py-10 text-muted-foreground">
                      <p className="text-3xl mb-2">🥗</p>
                      <p className="text-sm">No tienes citas nutricionales.</p>
                      <button onClick={() => setModalCita(true)}
                        className="mt-3 text-xs px-4 py-2 rounded-xl font-semibold text-foreground"
                        style={{ background: COLOR }}>
                        Agendar ahora
                      </button>
                    </div>
                  ) : citas.citas.map(c => (
                    <div key={c.id} className="flex items-center justify-between p-4 bg-secondary/50 border border-border rounded-xl">
                      <div>
                        <p className="text-sm font-semibold text-foreground capitalize">{c.motivo.replace('_', ' ')}</p>
                        <p className="text-xs text-muted-foreground">{c.fecha} · {c.hora}</p>
                        <code className="text-[10px] text-green-400">{c.folio}</code>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className={`text-xs px-2 py-0.5 rounded-full ${
                          c.estado === 'confirmada' ? 'bg-green-500/15 text-green-400' : 'bg-yellow-500/15 text-yellow-400'
                        }`}>{c.estado}</span>
                        {c.estaActiva && (
                          <button onClick={() => citas.cancelar(c.id)}
                            className="text-[10px] text-muted-foreground hover:text-red-400 transition-colors">
                            Cancelar
                          </button>
                        )}
                      </div>
                    </div>
                  ))
                }
              </div>
            </Tabs.Content>
          </Tabs.Root>
        </div>

        {/* ── Chat IA ── */}
        <div className="h-[600px]">
          <ChatIA
            ia={ia}
            color={COLOR}
            modulo="alimentacion"
            nombre="VITANUTRE — Nutriólogo IA"
            icono="🥗"
            sugerencias={sugerenciasIA}
          />
        </div>
      </div>

      <ModalCitaNutricion open={modalCita} onClose={() => setModalCita(false)} agendar={citas.agendar} />
    </div>
  )
}