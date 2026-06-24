// domain/clinico/entities/index.js

// ── Cita Clínica ─────────────────────────────────────────────
export class CitaClinica {
  constructor({ id_cita, tipo_consulta, fecha, hora, estado, folio, notas_usuario }) {
    this.id           = id_cita
    this.tipoConsulta = tipo_consulta
    this.fecha        = fecha
    this.hora         = hora
    this.estado       = estado
    this.folio        = folio
    this.notas        = notas_usuario
  }

  get estaActiva() { return ['pendiente', 'confirmada'].includes(this.estado) }
  get fechaFormateada() {
    return new Date(this.fecha + 'T00:00').toLocaleDateString('es-MX', {
      weekday: 'long', day: 'numeric', month: 'long'
    })
  }
}

// ── Signos Vitales ────────────────────────────────────────────
export class SignosVitales {
  static SEMAFORO = {
    verde:      { color: '#22c55e', bg: 'bg-green-500/10',  border: 'border-green-500/30',  label: '🟢 Normal' },
    amarillo:   { color: '#eab308', bg: 'bg-yellow-500/10', border: 'border-yellow-500/30', label: '🟡 Precaución' },
    rojo:       { color: '#ef4444', bg: 'bg-red-500/10',    border: 'border-red-500/30',    label: '🔴 Atención' },
    emergencia: { color: '#dc2626', bg: 'bg-red-700/20',    border: 'border-red-700/50',    label: '🚨 Urgencia' },
  }

  constructor(raw) {
    this.temperatura        = raw.temperatura_c
    this.frecuenciaCardiaca = raw.frecuencia_cardiaca
    this.presionSistolica   = raw.presion_sistolica
    this.presionDiastolica  = raw.presion_diastolica
    this.saturacionO2       = raw.saturacion_o2
    this.interpretacion     = raw.interpretacion
      ? (typeof raw.interpretacion === 'string'
          ? JSON.parse(raw.interpretacion)
          : raw.interpretacion)
      : {}
    this.fecha = raw.fecha
    this.hora  = raw.hora
  }

  get nivelMaximo() {
    const orden = ['verde', 'amarillo', 'rojo', 'emergencia']
    const niveles = Object.values(this.interpretacion).map(i => i.nivel)
    return niveles.reduce((max, n) =>
      orden.indexOf(n) > orden.indexOf(max) ? n : max, 'verde')
  }
}

// ── Evaluación de Síntomas ────────────────────────────────────
export class EvaluacionSintomas {
  static SINTOMAS_DISPONIBLES = [
    { id: 'fiebre',         label: '🤒 Fiebre',                  alerta: false },
    { id: 'tos',            label: '🤧 Tos seca',                 alerta: false },
    { id: 'garganta',       label: '😮‍💨 Dolor de garganta',        alerta: false },
    { id: 'cabeza',         label: '🤕 Dolor de cabeza',          alerta: false },
    { id: 'nauseas',        label: '🤢 Náuseas / vómito',         alerta: false },
    { id: 'fatiga',         label: '😴 Fatiga extrema',           alerta: false },
    { id: 'muscular',       label: '💪 Dolor muscular',           alerta: false },
    { id: 'respiracion',    label: '🫁 Dificultad respiratoria',  alerta: true  },
    { id: 'mareo',          label: '🩸 Mareos / desmayo',         alerta: true  },
    { id: 'pecho',          label: '💔 Dolor en el pecho',        alerta: true  },
  ]

  static URGENCIAS = {
    verde:      { emoji: '🟢', label: 'Puedes manejarlo en casa',        color: '#22c55e' },
    amarillo:   { emoji: '🟡', label: 'Agenda cita esta semana',         color: '#eab308' },
    rojo:       { emoji: '🔴', label: 'Acude al médico HOY',             color: '#ef4444' },
    emergencia: { emoji: '🚨', label: 'Ve a urgencias AHORA — llama 911', color: '#dc2626' },
  }
}
