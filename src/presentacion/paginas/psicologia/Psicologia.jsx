import { useState, useEffect }        from 'react'
import { useNavigate }                 from 'react-router-dom'
import * as Tabs                       from '@radix-ui/react-tabs'
import * as Dialog                     from '@radix-ui/react-dialog'
import { useIA }                       from '../../../aplicacion/ia/IA'
import { useCitasPsicologia, useAnimos, useTestEstres }
                                       from '../../../aplicacion/psiclogia/Psicologia'
import { RegistroAnimo, TestEstres }   from '../../../modulos/psicologico/Psicologia'
import { ChatIA }                      from '../../componentes/Chat'
import api from '@/lib/api'  
import HerramientasBienestar from './HerramientasBienestar'

const COLOR  = '#7C3AED'
const FAQS = [
  { q: '¿Las consultas son confidenciales?',    a: 'Sí. Todo lo que compartas está protegido por el secreto profesional. Solo se rompe ante riesgo grave para ti o terceros.' },
  { q: '¿Tiene algún costo el servicio?',       a: 'No. El servicio es completamente gratuito para todos los estudiantes activos con credencial vigente.' },
  { q: '¿Cuántas sesiones puedo tener?',        a: 'Generalmente comenzamos con evaluación y 4-8 sesiones de seguimiento. En casos especiales se puede extender o derivar.' },
  { q: '¿Qué hago si estoy en crisis ahora?',   a: 'Llama al 800-290-0024 (24/7) o acude a la Coordinación de Psicología sin cita. Tu bienestar es la prioridad.' },
]

function TarjetaAnimo({ registro }) {
  const { emoji, color } = registro.info
  return (
    <div className="flex items-center gap-3 p-3 rounded-xl bg-secondary/50 border border-border">
      <span className="text-2xl">{emoji}</span>
      <div className="flex-1 min-w-0">
        <p className="text-sm text-foreground font-medium">{registro.info.label}</p>
        {registro.nota && <p className="text-xs text-muted-foreground truncate">{registro.nota}</p>}
      </div>
      <span className="text-[10px] text-muted-foreground flex-shrink-0">{registro.fecha}</span>
    </div>
  )
}

function AccordionFAQ({ faq }) {
  const [abierto, setAbierto] = useState(false)
  return (
    <div className="border border-border rounded-xl overflow-hidden">
      <button
        onClick={() => setAbierto(!abierto)}
        className="w-full flex justify-between items-center px-4 py-3 text-left text-sm font-medium text-foreground hover:bg-secondary/50 transition-colors"
      >
        {faq.q}
        <span className={`text-muted-foreground transition-transform duration-200 ${abierto ? 'rotate-180' : ''}`}>▾</span>
      </button>
      {abierto && (
        <div className="px-4 pb-3 text-sm text-muted-foreground border-t border-border/50 pt-3">
          {faq.a}
        </div>
      )}
    </div>
  )
}

function ModalCita({ open, onClose, agendar }) {
  const [form, setForm] = useState({
    tipo_apoyo: 'estres_academico', fecha: '', hora: '09:00', modalidad: 'presencial', notas_usuario: ''
  })
  const [guardando, setGuardando] = useState(false)
  const [folio,     setFolio]     = useState(null)

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }))
  const hoy = new Date().toISOString().split('T')[0]

  const handleSubmit = async () => {
    if (!form.fecha) return
    setGuardando(true)
    try {
      const res = await agendar(form)
      setFolio(res.folio)
    } catch (e) { alert(e.message) }
    finally { setGuardando(false) }
  }

  return (
    <Dialog.Root open={open} onOpenChange={onClose}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50" />
        <Dialog.Content className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-50 w-full max-w-md bg-card border border-border rounded-2xl p-6 shadow-2xl">
          <Dialog.Title className="text-lg font-bold text-foreground mb-4">
            Solicitar Consulta Psicológica
          </Dialog.Title>

          {folio ? (
            <div className="text-center py-6">
              <div className="text-4xl mb-3">✅</div>
              <p className="text-white font-semibold mb-1">¡Cita agendada!</p>
              <p className="text-muted-foreground text-sm mb-3">Tu folio de confirmación:</p>
              <code className="text-purple-400 text-lg font-mono bg-purple-500/10 px-4 py-2 rounded-lg">{folio}</code>
              <p className="text-muted-foreground text-xs mt-4">Se envió confirmación a tu correo institucional.</p>
              <button onClick={onClose} className="mt-4 px-4 py-2 rounded-xl text-sm font-semibold text-foreground" style={{ background: COLOR }}>
                Cerrar
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              <div>
                <label className="text-xs text-muted-foreground mb-1 block">Tipo de apoyo</label>
                <select value={form.tipo_apoyo} onChange={e => set('tipo_apoyo', e.target.value)}
                  className="w-full bg-secondary border border-border rounded-xl px-3 py-2 text-sm text-foreground focus:outline-none focus:border-purple-500/50">
                  <option value="estres_academico">Estrés académico</option>
                  <option value="ansiedad">Ansiedad</option>
                  <option value="depresion">Depresión</option>
                  <option value="relaciones">Problemas de relaciones</option>
                  <option value="crisis">Crisis emocional</option>
                  <option value="duelo">Duelo</option>
                  <option value="otro">Otro</option>
                </select>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-muted-foreground mb-1 block">Fecha</label>
                  <input type="date" min={hoy} value={form.fecha} onChange={e => set('fecha', e.target.value)}
                    className="w-full bg-secondary border border-border rounded-xl px-3 py-2 text-sm text-foreground focus:outline-none focus:border-purple-500/50" />
                </div>
                <div>
                  <label className="text-xs text-muted-foreground mb-1 block">Hora</label>
                  <select value={form.hora} onChange={e => set('hora', e.target.value)}
                    className="w-full bg-secondary border border-border rounded-xl px-3 py-2 text-sm text-foreground focus:outline-none">
                    {['08:00','09:00','10:00','11:00','13:00','15:00','16:00'].map(h =>
                      <option key={h}>{h}</option>)}
                  </select>
                </div>
              </div>
              <div>
                <label className="text-xs text-muted-foreground mb-1 block">Modalidad</label>
                <div className="flex gap-2">
                  {['presencial','videollamada'].map(m => (
                    <button key={m} onClick={() => set('modalidad', m)}
                      className={`flex-1 py-2 rounded-xl text-sm font-medium border transition-colors ${
                        form.modalidad === m
                          ? 'border-purple-500/50 text-purple-400 bg-purple-500/10'
                          : 'border-border text-muted-foreground hover:border-border'
                      }`}>
                      {m === 'presencial' ? '🏫 Presencial' : '💻 Videollamada'}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="text-xs text-muted-foreground mb-1 block">Notas (opcional, confidencial)</label>
                <textarea value={form.notas_usuario} onChange={e => set('notas_usuario', e.target.value)}
                  rows={2} placeholder="¿Hay algo más que quieras compartir?"
                  className="w-full bg-secondary border border-border rounded-xl px-3 py-2 text-sm text-foreground resize-none focus:outline-none focus:border-purple-500/50" />
              </div>
              <div className="flex gap-2 pt-1">
                <button onClick={onClose} className="flex-1 py-2 rounded-xl text-sm text-muted-foreground border border-border hover:border-border transition-colors">Cancelar</button>
                <button onClick={handleSubmit} disabled={guardando || !form.fecha}
                  className="flex-1 py-2 rounded-xl text-sm font-semibold text-foreground disabled:opacity-40 transition-opacity"
                  style={{ background: COLOR }}>
                  {guardando ? 'Agendando…' : 'Agendar cita →'}
                </button>
              </div>
            </div>
          )}
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  )
}

export default function PsicologiaPage() {
  const navigate = useNavigate()
  const ia       = useIA('psicologia')
  const citas    = useCitasPsicologia()
  const animos   = useAnimos(7)
  const test     = useTestEstres()

  const [modalCita,    setModalCita]    = useState(false)
  const [respPSS,      setRespPSS]      = useState(Array(10).fill(null))
  const [animoSel,     setAnimoSel]     = useState(null)
  const [notaAnimo,    setNotaAnimo]    = useState('')
  const [guardandoA,   setGuardandoA]   = useState(false)
  const [perfilPsico,  setPerfilPsico]  = useState(undefined)

 useEffect(() => {
  citas.cargar(); animos.cargar(); test.cargar()
  api.get('/Cuestionario/ObtenerPerfilPsicologico.php')
    .then(r => setPerfilPsico(r.data.perfil ?? null))
    .catch(() => setPerfilPsico(null))
}, [])

  const handlePSS = (i, v) => setRespPSS(prev => { const n=[...prev]; n[i]=v; return n })
  const completoPSS = respPSS.every(v => v !== null)

  const handleGuardarTest = async () => {
    if (!completoPSS) return
    await test.guardar(respPSS)
    setRespPSS(Array(10).fill(null))
  }

  const handleRegistrarAnimo = async () => {
    if (!animoSel) return
    setGuardandoA(true)
    try {
      await animos.registrar({ estado_animo: animoSel, nota_libre: notaAnimo, emoji: RegistroAnimo.EMOJIS[animoSel]?.emoji })
      setAnimoSel(null); setNotaAnimo('')
    } finally { setGuardandoA(false) }
  }

  const sugerenciasIA = [
    '¿Cómo manejo el estrés de los exámenes?',
    'Técnica de respiración para la ansiedad',
    'No puedo concentrarme en clase',
    '¿Cómo mejorar mi sueño?',
  ]

  return (
    <div className="min-h-screen bg-background text-foreground p-6">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-2 text-xs font-semibold tracking-widest mb-2" style={{ color: COLOR }}>
          <span className="w-2 h-2 rounded-full" style={{ background: COLOR }}></span>
          MÓDULO 02
        </div>
        <h1 className="text-4xl font-black tracking-tight mb-2">
          Psicología y <span style={{ color: COLOR }}>Bienestar Mental</span>
        </h1>
        <p className="text-muted-foreground max-w-xl">
          Apoyo emocional, recursos de salud mental y herramientas para manejar el estrés académico y personal.
        </p>

        {/* ── BOTONES DE ACCIÓN ── */}
        <div className="flex flex-wrap gap-3 mt-4">
          <button
            onClick={() => setModalCita(true)}
            className="px-5 py-2.5 rounded-xl text-sm font-semibold text-foreground transition-transform hover:scale-105"
            style={{ background: COLOR }}
          >
            + Solicitar consulta
          </button>

          {/* NUEVO: Cuestionario psicológico */}
          <button
            onClick={() => navigate('/cuestionario-psicologia')}
            className="px-5 py-2.5 rounded-xl text-sm font-semibold border transition-all hover:scale-105"
            style={{ borderColor: 'rgba(124,58,237,0.35)', color: COLOR, background: 'rgba(124,58,237,0.06)' }}
          >
            🧠 {perfilPsico ? 'Actualizar perfil' : 'Cuestionario de bienestar'}
          </button>
        </div>

        {/* ── BANNER PERFIL PSICOLÓGICO ── */}
        {perfilPsico && (
          <div className="mt-5 p-4 bg-secondary/50 border border-purple-500/15 rounded-2xl">
            <div className="flex items-center gap-3 flex-wrap">
              <div className="flex items-center gap-2">
                <span className="text-lg">🧠</span>
                <div>
                  <p className="text-xs font-semibold text-foreground">Perfil psicológico activo</p>
                  <p className="text-[10px] text-muted-foreground">
                    Score: {perfilPsico.psico_score}/75 ·{' '}
                    <span style={{ color: perfilPsico.nivel_psicologico === 'estable' ? '#22c55e' : perfilPsico.nivel_psicologico === 'moderado' ? '#eab308' : '#ef4444' }}>
                      {perfilPsico.nivel_psicologico?.replace('_',' ')}
                    </span>
                  </p>
                </div>
              </div>
              <div className="flex gap-4 flex-wrap ml-auto text-[10px] text-muted-foreground">
                {perfilPsico.metas_bienestar && <span>🎯 Meta: <span className="text-secondary-foreground">{perfilPsico.metas_bienestar?.replace('_',' ')}</span></span>}
                {perfilPsico.estres_general && <span>😤 Estrés: <span className="text-secondary-foreground">{perfilPsico.estres_general}</span></span>}
              </div>
            </div>
          </div>
        )}
        {perfilPsico === null && (
          <div className="mt-4 p-4 bg-secondary/30 border border-border rounded-2xl flex items-center gap-3">
            <span className="text-2xl">🧠</span>
            <div>
              <p className="text-sm text-muted-foreground">No tienes perfil psicológico aún.</p>
              <p className="text-xs text-muted-foreground">Completa el cuestionario para personalizar el seguimiento emocional.</p>
            </div>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Columna principal */}
        <div className="xl:col-span-2 space-y-6">
          <Tabs.Root defaultValue="animo">
            <Tabs.List className="flex gap-1 p-1 bg-secondary/50 rounded-xl mb-4 w-fit">
              {[
  ['animo',        '😊 Estado de Ánimo'],
  ['test',         '🧠 Test de Estrés'],
  ['herramientas', '🛠 Herramientas'],
  ['citas',        '📅 Mis Citas'],
  ['faq',          '❓ FAQ'],
].map(([val, label]) => (
  <Tabs.Trigger key={val} value={val}
    className="px-3 py-1.5 rounded-lg text-xs font-medium text-muted-foreground data-[state=active]:text-foreground data-[state=active]:bg-secondary transition-all">
    {label}
  </Tabs.Trigger>
))}

            </Tabs.List>

            {/* Tab: Estado de ánimo */}
            <Tabs.Content value="animo">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-secondary/50 border border-border rounded-2xl p-5">
                  <h3 className="font-semibold text-sm mb-3">¿Cómo te sientes hoy?</h3>
                  <div className="flex gap-2 flex-wrap mb-4">
                    {Object.entries(RegistroAnimo.EMOJIS).map(([key, val]) => (
                      <button key={key} onClick={() => setAnimoSel(key)}
                        className={`w-10 h-10 rounded-xl text-xl flex items-center justify-center border-2 transition-all ${
                          animoSel === key ? 'scale-110' : 'border-transparent opacity-60 hover:opacity-100'
                        }`}
                        style={animoSel === key ? { borderColor: val.color, background: val.color + '20' } : {}}>
                        {val.emoji}
                      </button>
                    ))}
                  </div>
                  {animoSel && (
                    <>
                      <textarea value={notaAnimo} onChange={e => setNotaAnimo(e.target.value)}
                        rows={2} placeholder="¿Qué ha influido en tu ánimo hoy? (opcional)"
                        className="w-full bg-secondary border border-border rounded-xl px-3 py-2 text-sm text-foreground resize-none focus:outline-none focus:border-purple-500/30 mb-3" />
                      <button onClick={handleRegistrarAnimo} disabled={guardandoA}
                        className="w-full py-2 rounded-xl text-sm font-semibold text-foreground disabled:opacity-40"
                        style={{ background: COLOR }}>
                        {guardandoA ? 'Guardando…' : 'Registrar ánimo'}
                      </button>
                    </>
                  )}
                </div>
                <div className="bg-secondary/50 border border-border rounded-2xl p-5">
                  <h3 className="font-semibold text-sm mb-3">Últimos 7 días</h3>
                  {animos.cargando ? (
                    <p className="text-muted-foreground text-sm">Cargando…</p>
                  ) : animos.animos.length === 0 ? (
                    <p className="text-muted-foreground text-sm">Aún no hay registros.</p>
                  ) : (
                    <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
                      {animos.animos.map(a => <TarjetaAnimo key={a.id} registro={a} />)}
                    </div>
                  )}
                </div>
              </div>
            </Tabs.Content>

            {/* Tab: Test PSS-10 */}
            <Tabs.Content value="test">
              <div className="bg-secondary/50 border border-border rounded-2xl p-5">
                {test.resultado ? (
                  <div className="text-center py-4">
                    <div className="text-5xl font-black mb-2" style={{ color: test.resultado.color }}>
                      {test.resultado.puntaje_total}/40
                    </div>
                    <p className="text-lg font-semibold text-foreground mb-1">
                      Nivel de estrés: <span style={{ color: test.resultado.color }}>{test.resultado.label}</span>
                    </p>
                    <p className="text-sm text-muted-foreground max-w-xs mx-auto">
                      {test.resultado.nivel === 'bajo'
                        ? '¡Bien! Mantén tus hábitos actuales de manejo del estrés.'
                        : test.resultado.nivel === 'moderado'
                        ? 'Es un nivel normal para universitarios. Considera técnicas de relajación y organización.'
                        : 'Te recomendamos solicitar una cita con nuestro servicio de psicología. No estás solo/a.'}
                    </p>
                    <button
                      className="mt-4 px-4 py-2 rounded-xl text-sm border border-border text-muted-foreground hover:border-border transition-colors"
                      onClick={() => {}}>
                      Hacer test de nuevo
                    </button>
                  </div>
                ) : (
                  <>
                    <p className="text-sm text-muted-foreground mb-4">
                      Responde cómo te has sentido en el <strong className="text-foreground">último mes</strong>
                      &nbsp;(0 = Nunca · 4 = Muy seguido)
                    </p>
                    <div className="space-y-4">
                      {TestEstres.PREGUNTAS.map((q, i) => (
                        <div key={i}>
                          <p className="text-sm text-secondary-foreground mb-2">{i+1}. {q}</p>
                          <div className="flex gap-2">
                            {[0,1,2,3,4].map(v => (
                              <button key={v} onClick={() => handlePSS(i, v)}
                                className={`flex-1 py-1.5 rounded-lg text-sm font-medium border transition-all ${
                                  respPSS[i] === v
                                    ? 'text-white border-purple-500/60 bg-purple-500/20'
                                    : 'text-muted-foreground border-border hover:border-border hover:text-muted-foreground'
                                }`}>
                                {v}
                              </button>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                    <button onClick={handleGuardarTest}
                      disabled={!completoPSS || test.guardando}
                      className="mt-6 w-full py-2.5 rounded-xl text-sm font-semibold text-foreground disabled:opacity-30 transition-opacity"
                      style={{ background: COLOR }}>
                      {test.guardando ? 'Calculando…' : 'Ver mi resultado →'}
                    </button>
                  </>
                )}
              </div>
            </Tabs.Content>
<Tabs.Content value="herramientas">
  <HerramientasBienestar perfilPsico={perfilPsico} />
</Tabs.Content>
            {/* Tab: Citas */}
            <Tabs.Content value="citas">
              <div className="space-y-3">
                {citas.cargando ? <p className="text-muted-foreground text-sm">Cargando citas…</p>
                : citas.citas.length === 0 ? (
                  <div className="text-center py-10 text-muted-foreground">
                    <p className="text-3xl mb-2">📅</p>
                    <p className="text-sm">No tienes citas agendadas.</p>
                    <button onClick={() => setModalCita(true)} className="mt-3 text-xs px-4 py-2 rounded-xl font-semibold text-foreground" style={{ background: COLOR }}>
                      Agendar ahora
                    </button>
                  </div>
                ) : citas.citas.map(c => (
                  <div key={c.id} className="flex items-center justify-between p-4 bg-secondary/50 border border-border rounded-xl">
                    <div>
                      <p className="text-sm font-semibold text-foreground">{c.tipoApoyo.replace('_',' ')}</p>
                      <p className="text-xs text-muted-foreground">{c.fechaFormateada} · {c.hora} · {c.modalidad}</p>
                      <code className="text-[10px] text-purple-400">{c.folio}</code>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className={`text-xs px-2 py-0.5 rounded-full ${c.estado === 'confirmada' ? 'bg-green-500/15 text-green-400' : 'bg-yellow-500/15 text-yellow-400'}`}>
                        {c.estado}
                      </span>
                      {c.estaActiva && (
                        <button onClick={() => citas.cancelar(c.id)}
                          className="text-[10px] text-muted-foreground hover:text-red-400 transition-colors">
                          Cancelar
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </Tabs.Content>

            {/* Tab: FAQ */}
            <Tabs.Content value="faq">
              <div className="space-y-2">
                {FAQS.map((f, i) => <AccordionFAQ key={i} faq={f} />)}
              </div>
            </Tabs.Content>
          </Tabs.Root>
        </div>

        {/* Chat IA */}
        <div className="h-[600px]">
          <ChatIA
            ia={ia} color={COLOR} modulo="psicologia"
            nombre="VITAMENTE — Psicólogo IA"
            icono="🧠"
            sugerencias={sugerenciasIA}
          />
        </div>
      </div>

      <ModalCita open={modalCita} onClose={() => setModalCita(false)} agendar={citas.agendar} />
    </div>
  )
}
