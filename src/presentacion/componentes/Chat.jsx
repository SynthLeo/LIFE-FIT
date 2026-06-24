// presentation/components/chat/ChatIA.jsx
// Componente reutilizable — recibe el hook useIA ya instanciado

import { useState, useRef, useEffect } from 'react'
import * as Dialog from '@radix-ui/react-dialog'

// Formatea markdown básico del modelo
function formatearTexto(texto) {
  return texto
    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*(.*?)\*/g,     '<em>$1</em>')
    .replace(/`(.*?)`/g,       '<code class="bg-white/10 px-1 rounded text-xs">$1</code>')
    .replace(/\n/g,            '<br/>')
}

// Burbuja individual de mensaje
function Burbuja({ msg, color }) {
  const esIA = msg.rol === 'assistant'
  return (
    <div className={`flex gap-2 ${esIA ? 'justify-start' : 'justify-end'} mb-3`}>
      {esIA && (
        <div
          className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 mt-1"
          style={{ background: color + '22', border: `1px solid ${color}44`, color }}
        >
          IA
        </div>
      )}
      <div
        className={`max-w-[82%] px-3 py-2 rounded-2xl text-sm leading-relaxed ${
          esIA
            ? 'bg-white/5 border border-white/10 text-gray-200 rounded-tl-sm'
            : 'text-white rounded-tr-sm'
        } ${msg.esCrisis ? 'border-red-500/50 bg-red-500/10' : ''}`}
        style={!esIA ? { background: color + 'cc' } : {}}
        dangerouslySetInnerHTML={{ __html: formatearTexto(msg.contenido) }}
      />
    </div>
  )
}

// Indicador de escritura
function Typing({ color }) {
  return (
    <div className="flex gap-2 justify-start mb-3">
      <div
        className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0"
        style={{ background: color + '22', border: `1px solid ${color}44`, color }}
      >IA</div>
      <div className="bg-white/5 border border-white/10 px-4 py-3 rounded-2xl rounded-tl-sm">
        <div className="flex gap-1 items-center">
          {[0,1,2].map(i => (
            <span
              key={i}
              className="w-1.5 h-1.5 rounded-full bg-gray-400 animate-bounce"
              style={{ animationDelay: `${i * 0.15}s` }}
            />
          ))}
        </div>
      </div>
    </div>
  )
}

// Banner de crisis
function BannerCrisis({ modulo }) {
  const msgs = {
    psicologia:   'Si estás en crisis, llama ahora: 800-290-0024 (24/7)',
    clinico:      'Si es una emergencia médica, llama al 911 inmediatamente.',
    ejercicio:    'Si sientes dolor agudo, detén el ejercicio y busca atención médica.',
    alimentacion: 'Si tienes una condición médica seria, consulta a un profesional.',
  }
  return (
    <div className="mx-3 mb-2 px-3 py-2 rounded-lg bg-red-500/10 border border-red-500/30 text-red-400 text-xs flex gap-2 items-start">
      <span>🚨</span>
      <span>{msgs[modulo]}</span>
    </div>
  )
}

// Disclaimer siempre visible
function Disclaimer() {
  return (
    <div className="px-3 py-2 bg-amber-500/5 border-t border-amber-500/10 text-amber-500/70 text-[10px] text-center">
      ⚠️ El asistente proporciona orientación educativa, no diagnósticos ni prescripciones.
    </div>
  )
}

// ── Componente principal ──────────────────────────────────────
export function ChatIA({ ia, color, modulo, nombre, icono, sugerencias = [] }) {
  const [input, setInput] = useState('')
  const inputRef = useRef(null)

  useEffect(() => {
    if (!ia.cargando) inputRef.current?.focus()
  }, [ia.cargando])

  const handleEnviar = () => {
    if (!input.trim()) return
    ia.enviar(input.trim())
    setInput('')
  }

  const handleKey = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleEnviar() }
  }

  return (
    <div
      className="flex flex-col h-full rounded-2xl overflow-hidden border"
      style={{ borderColor: color + '22', background: '#0d0d14' }}
    >
      {/* Header */}
      <div
        className="flex items-center justify-between px-4 py-3 border-b"
        style={{ borderColor: color + '22', background: color + '0a' }}
      >
        <div className="flex items-center gap-2">
          <span className="text-lg">{icono}</span>
          <div>
            <div className="text-sm font-semibold text-white">{nombre}</div>
            <div className="text-[10px] text-gray-500">Asistente IA · Qwen 2.5</div>
          </div>
        </div>
        <button
          onClick={ia.limpiar}
          className="text-[10px] text-gray-500 hover:text-gray-300 px-2 py-1 rounded border border-white/10 hover:border-white/20 transition-colors"
        >
          Nuevo chat
        </button>
      </div>

      {/* Mensajes */}
      <div className="flex-1 overflow-y-auto p-3 space-y-1 min-h-0">
        {ia.mensajes.length === 0 && (
          <div className="flex flex-col items-center justify-center h-full gap-3 text-center">
            <div
              className="w-12 h-12 rounded-2xl flex items-center justify-center text-2xl"
              style={{ background: color + '15', border: `1px solid ${color}30` }}
            >
              {icono}
            </div>
            <div>
              <p className="text-sm text-gray-300 font-medium">¿En qué puedo ayudarte?</p>
              <p className="text-xs text-gray-600 mt-1">Tengo conocimiento especializado en {modulo}</p>
            </div>
            {/* Sugerencias rápidas */}
            {sugerencias.length > 0 && (
              <div className="flex flex-wrap gap-2 justify-center mt-2">
                {sugerencias.map((s, i) => (
                  <button
                    key={i}
                    onClick={() => { setInput(s); inputRef.current?.focus() }}
                    className="text-[11px] px-3 py-1.5 rounded-full border text-gray-400 hover:text-white transition-colors"
                    style={{ borderColor: color + '30', background: color + '08' }}
                  >
                    {s}
                  </button>
                ))}
              </div>
            )}
          </div>
        )}

        {ia.mensajes.map((msg, i) => (
          <Burbuja key={i} msg={msg} color={color} />
        ))}

        {ia.cargando && <Typing color={color} />}
        {ia.esCrisis && <BannerCrisis modulo={modulo} />}

        <div ref={ia.bottomRef} />
      </div>

      <Disclaimer />

      {/* Input */}
      <div className="p-3 border-t border-white/5">
        <div className="flex gap-2">
          <textarea
            ref={inputRef}
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={handleKey}
            placeholder="Escribe tu pregunta..."
            rows={1}
            disabled={ia.cargando}
            className="flex-1 bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-sm text-white placeholder-gray-600 resize-none focus:outline-none focus:border-white/25 disabled:opacity-40 transition-colors"
            style={{ maxHeight: '100px' }}
            onInput={e => {
              e.target.style.height = 'auto'
              e.target.style.height = e.target.scrollHeight + 'px'
            }}
          />
          <button
            onClick={handleEnviar}
            disabled={!input.trim() || ia.cargando}
            className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 self-end disabled:opacity-30 transition-all hover:scale-105 active:scale-95"
            style={{ background: color }}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="white">
              <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z"/>
            </svg>
          </button>
        </div>
        {ia.error && (
          <p className="text-red-400 text-[10px] mt-1">{ia.error}</p>
        )}
      </div>
    </div>
  )
}
