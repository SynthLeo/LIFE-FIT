// domain/psicologia/entities/Cita.js
export class CitaPsicologia {
  constructor({ id_cita, tipo_apoyo, fecha, hora, modalidad, estado, folio, notas_usuario }) {
    this.id         = id_cita
    this.tipoApoyo  = tipo_apoyo
    this.fecha      = fecha
    this.hora       = hora
    this.modalidad  = modalidad
    this.estado     = estado
    this.folio      = folio
    this.notas      = notas_usuario
  }

  get estaActiva()    { return ['pendiente', 'confirmada'].includes(this.estado) }
  get fechaFormateada() {
    return new Date(this.fecha + 'T00:00').toLocaleDateString('es-MX', {
      weekday: 'long', day: 'numeric', month: 'long'
    })
  }
}

// domain/psicologia/entities/RegistroAnimo.js
export class RegistroAnimo {
  static EMOJIS = {
    muy_mal:   { emoji: '😔', label: 'Muy mal',   color: '#ef4444' },
    mal:       { emoji: '😟', label: 'Mal',        color: '#f97316' },
    regular:   { emoji: '😐', label: 'Regular',    color: '#eab308' },
    bien:      { emoji: '🙂', label: 'Bien',       color: '#22c55e' },
    muy_bien:  { emoji: '😄', label: 'Muy bien',   color: '#10b981' },
  }

  constructor({ id_registro, estado_animo, emoji, nota_libre, factores, fecha, hora }) {
    this.id          = id_registro
    this.estado      = estado_animo
    this.emoji       = emoji
    this.nota        = nota_libre
    this.factores    = factores ?? []
    this.fecha       = fecha
    this.hora        = hora
  }

  get info() { return RegistroAnimo.EMOJIS[this.estado] ?? RegistroAnimo.EMOJIS.regular }
}

// domain/psicologia/entities/TestEstres.js
export class TestEstres {
  static PREGUNTAS = [
    'En el último mes, ¿con qué frecuencia te has sentido molesto/a por algo inesperado?',
    '¿Has sentido que no podías controlar cosas importantes en tu vida?',
    '¿Te has sentido nervioso/a o estresado/a?',
    '¿Has manejado con éxito los pequeños problemas irritantes de la vida?',
    '¿Has sentido que afrontabas efectivamente los cambios importantes?',
    '¿Has sentido confianza en tu capacidad para manejar tus problemas?',
    '¿Has podido controlar las irritaciones en tu vida?',
    '¿Has sentido que tenías todo bajo control?',
    '¿Te has enfadado por cosas fuera de tu control?',
    '¿Has sentido que las dificultades se acumulaban tanto que no podías superarlas?',
  ]
  static POSITIVOS = [3, 4, 5, 6, 7] // índices que se invierten

  static calcularPuntaje(respuestas) {
    return respuestas.reduce((total, v, i) =>
      total + (this.POSITIVOS.includes(i) ? 4 - v : v), 0)
  }

  static nivel(puntaje) {
    if (puntaje <= 13) return { nivel: 'bajo',     color: '#22c55e', label: 'Bajo' }
    if (puntaje <= 26) return { nivel: 'moderado', color: '#eab308', label: 'Moderado' }
    return               { nivel: 'alto',     color: '#ef4444', label: 'Alto' }
  }
}
