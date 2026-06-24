// domain/alimentacion/entities/index.js

// ── IMC ──────────────────────────────────────────────────────
export class ResultadoIMC {
  static CATEGORIAS = {
    bajo_peso:   { label: 'Bajo peso',    color: '#60a5fa', rango: '< 18.5' },
    normal:      { label: 'Normal',       color: '#22c55e', rango: '18.5 – 24.9' },
    sobrepeso:   { label: 'Sobrepeso',    color: '#eab308', rango: '25 – 29.9' },
    obesidad_I:  { label: 'Obesidad I',   color: '#f97316', rango: '30 – 34.9' },
    obesidad_II: { label: 'Obesidad II',  color: '#ef4444', rango: '35 – 39.9' },
    obesidad_III:{ label: 'Obesidad III', color: '#dc2626', rango: '≥ 40' },
  }

  constructor(raw) {
    this.peso        = raw.peso_kg
    this.altura      = raw.altura_cm
    this.edad        = raw.edad
    this.imc         = raw.imc
    this.categoria   = raw.categoria
    this.tmb         = raw.tmb
    this.getSedentario  = raw.get_sedentario
    this.getLigero      = raw.get_ligero
    this.getModerado    = raw.get_moderado
    this.getActivo      = raw.get_activo
    this.getMuyActivo   = raw.get_muy_activo
  }

  get info()     { return ResultadoIMC.CATEGORIAS[this.categoria] ?? ResultadoIMC.CATEGORIAS.normal }
  get pctBarra() { return Math.min(Math.max(((this.imc - 14) / (40 - 14)) * 100, 2), 98) }
}

// ── Registro Diario ───────────────────────────────────────────
export class RegistroDiario {
  static TIEMPOS = ['desayuno', 'comida', 'cena', 'snacks']
  static OPCIONES = {
    desayuno: ['🍳 Huevos','🥣 Cereal','🍞 Pan integral','🍌 Fruta','🥛 Lácteos','☕ Café','❌ No desayuné'],
    comida:   ['🍗 Proteína','🫘 Leguminosas','🍚 Arroz/pasta','🥦 Verduras','🌮 Comida rápida','🥗 Ensalada'],
    cena:     ['🍲 Sopa','🥚 Huevo','🫔 Quesadillas','🥗 Ensalada','❌ No cené'],
    snacks:   ['🍎 Fruta','🥜 Nueces','🍫 Dulce','🧃 Jugo','💧 Solo agua'],
  }

  constructor(raw = {}) {
    this.desayuno           = raw.desayuno     ? JSON.parse(raw.desayuno)   : []
    this.comida             = raw.comida       ? JSON.parse(raw.comida)     : []
    this.cena               = raw.cena         ? JSON.parse(raw.cena)       : []
    this.snacks             = raw.snacks       ? JSON.parse(raw.snacks)     : []
    this.aguaVasos          = raw.agua_vasos   ?? 0
    this.caloriasEstimadas  = raw.calorias_estimadas ?? null
    this.fecha              = raw.fecha        ?? null
  }

  get estadoAgua() {
    if (this.aguaVasos >= 8) return { msg: '✅ Hidratación excelente', color: '#22c55e' }
    if (this.aguaVasos >= 6) return { msg: '💧 Casi ahí, toma 1-2 vasos más', color: '#eab308' }
    return { msg: '⚠️ Necesitas hidratarte más', color: '#ef4444' }
  }
}

// ── Cita Nutrición ────────────────────────────────────────────
export class CitaNutricion {
  constructor({ id_cita, motivo, fecha, hora, estado, folio }) {
    this.id     = id_cita
    this.motivo = motivo
    this.fecha  = fecha
    this.hora   = hora
    this.estado = estado
    this.folio  = folio
  }
  get estaActiva() { return ['pendiente', 'confirmada'].includes(this.estado) }
}
