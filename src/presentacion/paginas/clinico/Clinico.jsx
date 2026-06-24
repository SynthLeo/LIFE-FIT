// presentation/presentacion/paginas/clinico/Clinico.jsx

import { useState, useEffect }                        from 'react'
import { useNavigate }                                from 'react-router-dom'
import * as Tabs                                       from '@radix-ui/react-tabs'
import * as Dialog                                     from '@radix-ui/react-dialog'
import { useIA }                                       from '../../../aplicacion/ia/IA'
import { useCitasClinco, useSignosVitales, useSintomas } from '../../../aplicacion/clinico/Clinico'
import { EvaluacionSintomas, SignosVitales }            from '../../../modulos/clinico/Clinico'
import { ChatIA }                                      from '../../componentes/Chat'
import api from '@/lib/api'

const COLOR = '#0284C7'

function BadgeSemaforo({ nivel }) {
  const s = SignosVitales.SEMAFORO[nivel] ?? SignosVitales.SEMAFORO.verde
  return (
    <span className={`text-xs px-2 py-0.5 rounded-full border ${s.bg} ${s.border}`}
      style={{ color: s.color }}>
      {s.label}
    </span>
  )
}


function ModalCitaClinica({ open, onClose, agendar }) {
  const hoy = new Date().toISOString().split('T')[0]
  const [form, setForm] = useState({ tipo_consulta: 'general', fecha: '', hora: '09:00', notas_usuario: '' })
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
          <Dialog.Title className="text-lg font-bold text-foreground mb-4">Agendar Consulta Médica</Dialog.Title>
          {folio ? (
            <div className="text-center py-6">
              <div className="text-4xl mb-3">✅</div>
              <p className="text-white font-semibold mb-1">¡Consulta agendada!</p>
              <code className="text-sky-400 text-lg font-mono bg-sky-500/10 px-4 py-2 rounded-lg">{folio}</code>
              <p className="text-muted-foreground text-xs mt-3">Trae tu credencial universitaria.</p>
              <button onClick={onClose} className="mt-4 px-4 py-2 rounded-xl text-sm font-semibold text-foreground" style={{ background: COLOR }}>Cerrar</button>
            </div>
          ) : (
            <div className="space-y-3">
              <div>
                <label className="text-xs text-muted-foreground mb-1 block">Tipo de consulta</label>
                <select value={form.tipo_consulta} onChange={e => set('tipo_consulta', e.target.value)}
                  className="w-full bg-secondary border border-border rounded-xl px-3 py-2 text-sm text-foreground focus:outline-none">
                  <option value="general">Consulta general</option>
                  <option value="justificante">Justificante médico</option>
                  <option value="vacunacion">Vacunación</option>
                  <option value="laboratorio">Análisis clínicos</option>
                  <option value="seguimiento">Seguimiento</option>
                  <option value="urgencia_menor">Urgencia menor</option>
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
                    {['08:00','09:00','10:00','11:00','12:00','13:00','14:00','15:00','16:00'].map(h => <option key={h}>{h}</option>)}
                  </select>
                </div>
              </div>
              <div>
                <label className="text-xs text-muted-foreground mb-1 block">Notas (opcional)</label>
                <textarea value={form.notas_usuario} onChange={e => set('notas_usuario', e.target.value)}
                  rows={2} placeholder="Describe brevemente tu motivo..."
                  className="w-full bg-secondary border border-border rounded-xl px-3 py-2 text-sm text-foreground resize-none focus:outline-none" />
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

export default function ClinicoPage() {
  const navigate = useNavigate()
  const ia      = useIA('clinico')
  const citas   = useCitasClinco()
  const signos  = useSignosVitales()
  const sints   = useSintomas()

  const [modalCita,      setModalCita]      = useState(false)
  const [sintomasSel,    setSintomasSel]    = useState([])
  const [dias,           setDias]           = useState('Hoy (menos de 24h)')
  const [formSignos,     setFormSignos]     = useState({ temperatura_c:'', frecuencia_cardiaca:'', presion_sistolica:'', presion_diastolica:'', saturacion_o2:'' })
  const [perfilClinico,  setPerfilClinico]  = useState(undefined)

  // ✅ Correcto — usa el api ya importado arriba
useEffect(() => {
  citas.cargar(); signos.cargar(); sints.cargar()
  api.get('/Cuestionario/ObtenerPerfilClinico.php')
    .then(r => setPerfilClinico(r.data.perfil ?? null))
    .catch(() => setPerfilClinico(null))
}, [])

  const toggleSintoma = (id) => setSintomasSel(p => p.includes(id) ? p.filter(x=>x!==id) : [...p,id])
  const setS = (k,v) => setFormSignos(f => ({...f,[k]:v}))

  const handleEvaluar = async () => {
    if (sintomasSel.length === 0) return
    await sints.evaluar({ sintomas: sintomasSel, dias_duracion: dias })
  }

  const handleSignos = async () => {
    const datos = Object.fromEntries(Object.entries(formSignos).filter(([,v]) => v !== ''))
    if (Object.keys(datos).length === 0) return
    await signos.registrar(datos)
    setFormSignos({ temperatura_c:'', frecuencia_cardiaca:'', presion_sistolica:'', presion_diastolica:'', saturacion_o2:'' })
  }

  const sugerenciasIA = [
    '¿Cuándo debo ir a urgencias vs. cita normal?',
    'Me duele la cabeza hace 3 días',
    '¿Qué vacunas debo tener al día?',
    'Tengo fiebre de 38°C, ¿qué hago?',
  ]

  const urgInfo = sints.resultado
    ? EvaluacionSintomas.URGENCIAS[sints.resultado.nivel_urgencia]
    : null

  return (
    <div className="min-h-screen bg-background text-foreground p-6">
      <div className="mb-8">
        <div className="flex items-center gap-2 text-xs font-semibold tracking-widest mb-2" style={{ color: COLOR }}>
          <span className="w-2 h-2 rounded-full" style={{ background: COLOR }}></span>
          MÓDULO 04
        </div>
        <h1 className="text-4xl font-black tracking-tight mb-2">
          Atención <span style={{ color: COLOR }}>Clínica</span>
        </h1>
        <p className="text-muted-foreground max-w-xl">Consultas médicas, signos vitales, evaluación de síntomas y más.</p>

        {/* ── BOTONES DE ACCIÓN ── */}
        <div className="flex flex-wrap gap-3 mt-4">
          <button
            onClick={() => setModalCita(true)}
            className="px-5 py-2.5 rounded-xl text-sm font-semibold text-foreground transition-transform hover:scale-105"
            style={{ background: COLOR }}
          >
            + Agendar consulta
          </button>

          {/* NUEVO: Cuestionario de salud */}
          <button
            onClick={() => navigate('/cuestionario-clinico')}
            className="px-5 py-2.5 rounded-xl text-sm font-semibold border transition-all hover:scale-105"
            style={{ borderColor: 'rgba(2,132,199,0.35)', color: COLOR, background: 'rgba(2,132,199,0.06)' }}
          >
            📋 {perfilClinico ? 'Actualizar perfil' : 'Cuestionario de salud'}
          </button>
        </div>

        {/* ── BANNER PERFIL CLÍNICO ── */}
        {perfilClinico && (
          <div className="mt-5 p-4 bg-secondary/50 border border-sky-500/15 rounded-2xl">
            <div className="flex items-center gap-3 flex-wrap">
              <div className="flex items-center gap-2">
                <span className="text-lg">🩺</span>
                <div>
                  <p className="text-xs font-semibold text-foreground">Perfil clínico activo</p>
                  <p className="text-[10px] text-muted-foreground">Score: {perfilClinico.salud_score}/55 · {perfilClinico.nivel_salud?.replace('_',' ')}</p>
                </div>
              </div>
              <div className="flex gap-4 flex-wrap ml-auto text-[10px] text-muted-foreground">
                {perfilClinico.sueno && <span>💤 Sueño: <span className="text-secondary-foreground">{perfilClinico.sueno?.replace('_',' ')} hrs</span></span>}
                {perfilClinico.presion_arterial && <span>🩸 Presión: <span className="text-secondary-foreground">{perfilClinico.presion_arterial}</span></span>}
                {perfilClinico.tabaco && perfilClinico.tabaco !== 'nunca' && <span>🚬 Tabaco: <span className="text-yellow-400">{perfilClinico.tabaco}</span></span>}
                {perfilClinico.alcohol && perfilClinico.alcohol !== 'nunca' && <span>🍺 Alcohol: <span className="text-yellow-400">{perfilClinico.alcohol}</span></span>}
              </div>
            </div>
          </div>
        )}
        {perfilClinico === null && (
          <div className="mt-4 p-4 bg-secondary/30 border border-border rounded-2xl flex items-center gap-3">
            <span className="text-2xl">📋</span>
            <div>
              <p className="text-sm text-muted-foreground">No tienes perfil clínico aún.</p>
              <p className="text-xs text-muted-foreground">Completa el cuestionario para que el módulo tenga contexto de tu salud.</p>
            </div>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <div className="xl:col-span-2 space-y-6">
          <Tabs.Root defaultValue="sintomas">
            <Tabs.List className="flex gap-1 p-1 bg-secondary/50 rounded-xl mb-4 w-fit">
              {[['sintomas','🤒 Síntomas'],['signos','📈 Signos Vitales'],['citas','📅 Mis Citas']].map(([v,l]) => (
                <Tabs.Trigger key={v} value={v}
                  className="px-3 py-1.5 rounded-lg text-xs font-medium text-muted-foreground data-[state=active]:text-foreground data-[state=active]:bg-secondary transition-all">
                  {l}
                </Tabs.Trigger>
              ))}
            </Tabs.List>

            {/* Síntomas */}
            <Tabs.Content value="sintomas">
              <div className="bg-secondary/50 border border-border rounded-2xl p-5">
                <h3 className="font-semibold text-sm mb-1">Autoevaluación de Síntomas</h3>
                <p className="text-xs text-muted-foreground mb-4">Selecciona los síntomas que presentas actualmente:</p>
                <div className="flex flex-wrap gap-2 mb-4">
                  {EvaluacionSintomas.SINTOMAS_DISPONIBLES.map(s => (
                    <button key={s.id} onClick={() => toggleSintoma(s.id)}
                      className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-all ${
                        sintomasSel.includes(s.id)
                          ? 'text-white border-sky-500/60 bg-sky-500/15'
                          : s.alerta
                          ? 'border-red-500/30 text-red-400/70 hover:border-red-500/50'
                          : 'border-border text-muted-foreground hover:border-border hover:text-secondary-foreground'
                      }`}>
                      {s.label}
                    </button>
                  ))}
                </div>
                <div className="mb-4">
                  <label className="text-xs text-muted-foreground mb-1 block">¿Desde cuándo?</label>
                  <select value={dias} onChange={e => setDias(e.target.value)}
                    className="bg-secondary border border-border rounded-xl px-3 py-2 text-sm text-foreground focus:outline-none">
                    {['Hoy (menos de 24h)','1-3 días','4-7 días','Más de una semana'].map(d => <option key={d}>{d}</option>)}
                  </select>
                </div>
                <button onClick={handleEvaluar}
                  disabled={sintomasSel.length === 0 || sints.evaluando}
                  className="px-5 py-2.5 rounded-xl text-sm font-semibold text-foreground disabled:opacity-30 transition-opacity"
                  style={{ background: COLOR }}>
                  {sints.evaluando ? 'Evaluando…' : 'Evaluar síntomas →'}
                </button>

                {sints.resultado && urgInfo && (
                  <div className="mt-4 p-4 rounded-xl border" style={{
                    background: urgInfo.color + '10',
                    borderColor: urgInfo.color + '30'
                  }}>
                    <p className="text-sm font-bold mb-1" style={{ color: urgInfo.color }}>
                      {urgInfo.emoji} {urgInfo.label}
                    </p>
                    <p className="text-sm text-secondary-foreground">{sints.resultado.orientacion}</p>
                  </div>
                )}
              </div>
            </Tabs.Content>

            {/* Signos Vitales */}
            <Tabs.Content value="signos">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-secondary/50 border border-border rounded-2xl p-5">
                  <h3 className="font-semibold text-sm mb-4">Registrar Signos Vitales</h3>
                  <div className="space-y-3">
                    {[
                      ['temperatura_c',      '🌡️ Temperatura (°C)',         '36.5', 'number', '0.1'],
                      ['frecuencia_cardiaca','❤️ Frec. cardíaca (bpm)',      '75',   'number', '1'  ],
                      ['presion_sistolica',  '🩸 Presión sistólica (mmHg)', '120',  'number', '1'  ],
                      ['presion_diastolica', '🩸 Presión diastólica (mmHg)','80',   'number', '1'  ],
                      ['saturacion_o2',      '💨 Saturación O₂ (%)',        '98',   'number', '1'  ],
                    ].map(([key, label, placeholder, type, step]) => (
                      <div key={key}>
                        <label className="text-xs text-muted-foreground mb-1 block">{label}</label>
                        <input type={type} step={step} placeholder={placeholder} value={formSignos[key]}
                          onChange={e => setS(key, e.target.value)}
                          className="w-full bg-secondary border border-border rounded-xl px-3 py-2 text-sm text-foreground focus:outline-none focus:border-sky-500/30" />
                      </div>
                    ))}
                  </div>
                  <button onClick={handleSignos} disabled={signos.registrando}
                    className="mt-4 w-full py-2.5 rounded-xl text-sm font-semibold text-foreground disabled:opacity-40"
                    style={{ background: COLOR }}>
                    {signos.registrando ? 'Registrando…' : 'Analizar signos →'}
                  </button>
                </div>

                <div className="bg-secondary/50 border border-border rounded-2xl p-5">
                  <h3 className="font-semibold text-sm mb-4">Último Registro</h3>
                  {signos.ultimo ? (
                    <div className="space-y-3">
                      {Object.entries(signos.ultimo.interpretacion).map(([key, val]) => (
                        <div key={key} className="flex items-start justify-between gap-2">
                          <span className="text-xs text-muted-foreground capitalize">{key.replace('_',' ')}</span>
                          <div className="text-right">
                            <BadgeSemaforo nivel={val.nivel} />
                            <p className="text-[10px] text-muted-foreground mt-0.5">{val.msg}</p>
                          </div>
                        </div>
                      ))}
                      <p className="text-[10px] text-muted-foreground pt-2 border-t border-border/50">
                        {signos.ultimo.fecha} · {signos.ultimo.hora}
                      </p>
                    </div>
                  ) : (
                    <p className="text-muted-foreground text-sm">Aún no hay registros.</p>
                  )}
                </div>
              </div>
            </Tabs.Content>

            {/* Citas */}
            <Tabs.Content value="citas">
              <div className="space-y-3">
                {citas.cargando ? <p className="text-muted-foreground text-sm">Cargando…</p>
                : citas.citas.length === 0 ? (
                  <div className="text-center py-10 text-muted-foreground">
                    <p className="text-3xl mb-2">🏥</p>
                    <p className="text-sm">No tienes consultas agendadas.</p>
                    <button onClick={() => setModalCita(true)} className="mt-3 text-xs px-4 py-2 rounded-xl font-semibold text-foreground" style={{ background: COLOR }}>
                      Agendar ahora
                    </button>
                  </div>
                ) : citas.citas.map(c => (
                  <div key={c.id} className="flex items-center justify-between p-4 bg-secondary/50 border border-border rounded-xl">
                    <div>
                      <p className="text-sm font-semibold text-foreground capitalize">{c.tipoConsulta.replace('_',' ')}</p>
                      <p className="text-xs text-muted-foreground">{c.fechaFormateada} · {c.hora}</p>
                      <code className="text-[10px] text-sky-400">{c.folio}</code>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className={`text-xs px-2 py-0.5 rounded-full ${c.estado==='confirmada'?'bg-green-500/15 text-green-400':'bg-yellow-500/15 text-yellow-400'}`}>{c.estado}</span>
                      {c.estaActiva && (
                        <button onClick={() => citas.cancelar(c.id)} className="text-[10px] text-muted-foreground hover:text-red-400 transition-colors">Cancelar</button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </Tabs.Content>
          </Tabs.Root>
        </div>

        {/* Chat IA */}
        <div className="h-[600px]">
          <ChatIA ia={ia} color={COLOR} modulo="clinico" nombre="VITAMEDIC — Asistente Clínico" icono="🏥" sugerencias={sugerenciasIA} />
        </div>
      </div>

      <ModalCitaClinica open={modalCita} onClose={() => setModalCita(false)} agendar={citas.agendar} />
    </div>
  )
}
