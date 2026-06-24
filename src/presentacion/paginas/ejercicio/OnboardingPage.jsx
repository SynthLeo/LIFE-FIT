import { useState, useRef, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '@/context/AuthContext'
import api from '@/lib/api'

/* ══════════════════════════════════════════════════════════
   MÓDULOS Y PREGUNTAS — 4 módulos × 12 preguntas = 48 pasos
   Más 1 paso de biometría al inicio = 49 pasos total
══════════════════════════════════════════════════════════ */

const MODULES = [
  { key: 'bio',        icon: '📋', label: 'PERFIL',      color: '#00e5ff' },
  { key: 'ejercicio',  icon: '⚡', label: 'EJERCICIO',   color: '#00e5ff' },
  { key: 'clinico',    icon: '🩺', label: 'CLÍNICO',     color: '#0ea5e9' },
  { key: 'nutricion',  icon: '🥗', label: 'NUTRICIÓN',   color: '#22c55e' },
  { key: 'psicologia', icon: '🧠', label: 'PSICOLOGÍA',  color: '#a78bfa' },
]

// ── Biometría (1 paso especial) ─────────────────────────
const BIO_STEP = { module: 'bio', type: 'bio' }

// ── Ejercicio (12 preguntas) ────────────────────────────
const Q_EJERCICIO = [
  { id:'minutos_semana', cat:'HÁBITOS GENERALES', title:'¿Cuántos minutos de actividad física realizas a la semana?',
    opts:[{val:'menos_75',label:'Menos de 75 min',desc:'Actividad muy baja o esporádica'},{val:'75_150',label:'75 – 150 min',desc:'Por debajo del mínimo recomendado'},{val:'150_300',label:'150 – 300 min',desc:'Nivel recomendado por la OMS'},{val:'mas_300',label:'Más de 300 min',desc:'Alto volumen de entrenamiento'}]},
  { id:'frecuencia_semana', cat:'HÁBITOS GENERALES', title:'¿Con qué frecuencia haces ejercicio a la semana?',
    opts:[{val:'nunca',label:'Nunca',desc:'No tengo rutina activa'},{val:'1_2',label:'1 a 2 veces',desc:'Actividad ocasional'},{val:'3_4',label:'3 a 4 veces',desc:'Frecuencia habitual recomendada'},{val:'5_mas',label:'5 veces o más',desc:'Alta frecuencia de entrenamiento'}]},
  { id:'tipo_actividad', cat:'TIPO DE ACTIVIDAD', title:'¿Qué tipo de actividad física practicas con mayor frecuencia?',
    opts:[{val:'aerobico',label:'🏃 Aeróbico',desc:'Correr, nadar, ciclismo, HIIT'},{val:'fuerza',label:'🏋️ Fuerza',desc:'Pesas, máquinas, calistenia'},{val:'flexibilidad',label:'🧘 Flexibilidad',desc:'Yoga, pilates, estiramientos'},{val:'ninguna',label:'⚪ Sin actividad',desc:'Quiero empezar desde cero'}]},
  { id:'lugar_ejercicio', cat:'TIPO DE ACTIVIDAD', title:'¿Dónde realizas principalmente tu actividad física?',
    opts:[{val:'casa',label:'🏠 En casa',desc:'Con o sin equipamiento en el hogar'},{val:'gimnasio',label:'🏋️ Gimnasio',desc:'Acceso a instalaciones completas'},{val:'exterior',label:'🌳 Al aire libre',desc:'Parques, calles, pistas'},{val:'ninguno',label:'⚪ Sin actividad',desc:''}]},
  { id:'motivacion', cat:'MOTIVACIÓN Y METAS', title:'¿Cuál es tu principal motivo para hacer actividad física?',
    opts:[{val:'salud',label:'❤️ Salud y bienestar',desc:'Mantenerme sano y con energía'},{val:'estetica',label:'✨ Estética / peso',desc:'Cambio físico visible'},{val:'rendimiento',label:'🏆 Rendimiento',desc:'Mejorar marcas o competir'},{val:'medico',label:'🩺 Recomendación médica',desc:'Por prescripción o condición de salud'}]},
  { id:'barrera', cat:'MOTIVACIÓN Y METAS', title:'¿Cuál es la razón principal por la que no haces más ejercicio?',
    opts:[{val:'tiempo',label:'⏰ Falta de tiempo',desc:'Agenda apretada'},{val:'motivacion',label:'😴 Falta de motivación',desc:'No me animo o lo dejo para después'},{val:'salud',label:'🤕 Problemas de salud',desc:'Limitaciones físicas actuales'},{val:'instalaciones',label:'🏟️ Sin instalaciones',desc:'No tengo gimnasio o espacio adecuado'}]},
  { id:'condicion_fisica', cat:'BIENESTAR Y SALUD', title:'¿Cómo describes tu nivel de condición física actual?',
    opts:[{val:'muy_buena',label:'🟢 Muy buena',desc:'Me canso poco, rendimiento alto'},{val:'buena',label:'🔵 Buena',desc:'Aguanto bien el ejercicio moderado'},{val:'regular',label:'🟡 Regular',desc:'Me canso con cierta facilidad'},{val:'mala',label:'🔴 Mala',desc:'El ejercicio se me hace muy difícil'}]},
  { id:'horas_sedentario', cat:'BIENESTAR Y SALUD', title:'¿Cuántas horas al día permaneces sentado o sin moverte?',
    opts:[{val:'menos_4',label:'Menos de 4 hrs',desc:'Poco tiempo sedentario'},{val:'4_6',label:'4 – 6 hrs',desc:'Nivel moderado de sedentarismo'},{val:'6_8',label:'6 – 8 hrs',desc:'Alto tiempo sentado'},{val:'mas_8',label:'Más de 8 hrs',desc:'Sedentarismo severo'}]},
  { id:'calentamiento', cat:'TÉCNICA Y HÁBITOS', title:'¿Realizas calentamiento antes de ejercitarte?',
    opts:[{val:'siempre',label:'✅ Siempre',desc:'Parte fija de mi rutina'},{val:'a_veces',label:'🔄 A veces',desc:'Cuando recuerdo o tengo tiempo'},{val:'casi_nunca',label:'⚠️ Casi nunca',desc:'Suelo saltármelo'},{val:'no_entreno',label:'No entreno aún',desc:'Voy a empezar'}]},
  { id:'nivel_entrenamiento', cat:'EXPERIENCIA', title:'¿Cuál es tu nivel de experiencia en entrenamiento?',
    opts:[{val:'principiante',label:'🟢 Principiante',desc:'Menos de 6 meses de experiencia'},{val:'intermedio',label:'🟡 Intermedio',desc:'6 meses a 2 años entrenando'},{val:'avanzado',label:'🔴 Avanzado',desc:'Más de 2 años de entrenamiento'}]},
  { id:'equipo', cat:'EXPERIENCIA', title:'¿Con qué equipamiento cuentas para entrenar?',
    opts:[{val:'gimnasio_completo',label:'🏋️ Gimnasio completo',desc:'Máquinas, pesas y barras'},{val:'mancuernas',label:'💪 Mancuernas',desc:'Solo mancuernas en casa'},{val:'peso_corporal',label:'🤸 Peso corporal',desc:'Sin equipamiento extra'},{val:'bandas',label:'🪢 Bandas elásticas',desc:'Bandas de resistencia'}]},
  { id:'objetivo_ejercicio', cat:'OBJETIVO', title:'¿Cuál es tu meta principal de entrenamiento?',
    opts:[{val:'fuerza',label:'⚡ Ganar fuerza',desc:'Aumentar marcas personales'},{val:'masa_muscular',label:'🔥 Masa muscular',desc:'Hipertrofia y volumen'},{val:'perdida_grasa',label:'💧 Perder grasa',desc:'Definición y pérdida de peso'},{val:'resistencia',label:'🏃 Resistencia',desc:'Rendimiento cardiovascular'}]},
].map(q => ({ ...q, module: 'ejercicio' }))

// ── Clínico (12 preguntas) ──────────────────────────────
const Q_CLINICO = [
  { id:'visitas_medico', cat:'HISTORIAL MÉDICO', title:'¿Con qué frecuencia visitas al médico para chequeos preventivos?',
    opts:[{val:'nunca',label:'❌ Nunca',desc:'No tengo chequeos regulares'},{val:'rara_vez',label:'🔄 Rara vez',desc:'Solo cuando estoy muy enfermo/a'},{val:'anual',label:'📅 Una vez al año',desc:'Chequeo anual de rutina'},{val:'frecuente',label:'✅ Más de una vez al año',desc:'Seguimiento activo de mi salud'}]},
  { id:'condicion_cronica', cat:'HISTORIAL MÉDICO', title:'¿Tienes alguna condición médica crónica diagnosticada?',
    opts:[{val:'ninguna',label:'✅ No tengo ninguna',desc:'Sin diagnósticos crónicos'},{val:'controlada',label:'⚠️ Sí, controlada',desc:'Con medicación o tratamiento activo'},{val:'sin_control',label:'🔴 Sí, sin control',desc:'Necesito seguimiento médico'},{val:'prefiero_no',label:'🔒 Prefiero no responder',desc:''}]},
  { id:'medicamentos', cat:'HISTORIAL MÉDICO', title:'¿Tomas medicamentos de forma regular?',
    opts:[{val:'ninguno',label:'✅ Ninguno',desc:'No tomo medicamentos regularmente'},{val:'vitaminas',label:'💊 Solo vitaminas/suplementos',desc:'Sin medicamentos de prescripción'},{val:'prescripcion',label:'💉 Prescripción médica',desc:'Con receta médica'},{val:'varios',label:'🧪 Varios medicamentos',desc:'Tratamiento múltiple'}]},
  { id:'presion_arterial', cat:'SIGNOS VITALES', title:'¿Conoces tu presión arterial actual?',
    opts:[{val:'normal',label:'🟢 Normal',desc:'Por debajo de 120/80 mmHg'},{val:'alta',label:'🔴 Alta (hipertensión)',desc:'Diagnosticada o sospecha'},{val:'baja',label:'🔵 Baja (hipotensión)',desc:'Hipotensión frecuente'},{val:'no_se',label:'❓ No lo sé',desc:'No me la he medido recientemente'}]},
  { id:'sueno', cat:'HÁBITOS DE SALUD', title:'¿Cuántas horas duermes en promedio por noche?',
    opts:[{val:'menos_5',label:'😴 Menos de 5 horas',desc:'Privación severa de sueño'},{val:'5_6',label:'😐 5 – 6 horas',desc:'Por debajo del mínimo recomendado'},{val:'7_8',label:'✅ 7 – 8 horas',desc:'Rango óptimo recomendado'},{val:'mas_9',label:'🛌 Más de 9 horas',desc:'Puede indicar fatiga o somnolencia'}]},
  { id:'tabaco', cat:'HÁBITOS DE SALUD', title:'¿Fumas o consumes tabaco en alguna forma?',
    opts:[{val:'nunca',label:'✅ Nunca he fumado',desc:'Sin exposición a tabaco'},{val:'exfumador',label:'🚭 Ex fumador/a',desc:'Lo dejé hace más de 6 meses'},{val:'ocasional',label:'⚠️ Ocasionalmente',desc:'Menos de 5 cigarrillos por semana'},{val:'regular',label:'🚬 Regularmente',desc:'Consumo diario'}]},
  { id:'alcohol', cat:'HÁBITOS DE SALUD', title:'¿Con qué frecuencia consumes alcohol?',
    opts:[{val:'nunca',label:'✅ No consumo',desc:'Abstinencia total'},{val:'social',label:'🥂 Ocasionalmente',desc:'Menos de 2 veces por semana'},{val:'frecuente',label:'⚠️ Varias veces/semana',desc:'Consumo moderado a frecuente'},{val:'diario',label:'🔴 Diariamente',desc:'Consumo diario'}]},
  { id:'sintomas_frecuentes', cat:'SÍNTOMAS ACTUALES', title:'¿Experimentas alguno de estos síntomas con frecuencia?',
    opts:[{val:'ninguno',label:'✅ Ninguno',desc:'Me siento bien en general'},{val:'fatiga',label:'😴 Fatiga / Cansancio',desc:'Agotamiento sin causa clara'},{val:'dolor',label:'🤕 Dolor frecuente',desc:'Cabeza, espalda, articulaciones'},{val:'digestivo',label:'🍽️ Molestias digestivas',desc:'Gastritis, colitis, acidez'}]},
  { id:'vacunas', cat:'PREVENCIÓN', title:'¿Tienes tu esquema de vacunación al día?',
    opts:[{val:'completo',label:'✅ Sí, completo',desc:'Todas las vacunas básicas aplicadas'},{val:'incompleto',label:'⚠️ Creo que incompleto',desc:'Me faltan algunas vacunas'},{val:'no_se',label:'❓ No lo sé',desc:'No tengo registro de mis vacunas'},{val:'no',label:'❌ No están al día',desc:'Sin vacunas recientes'}]},
  { id:'estres_fisico', cat:'BIENESTAR GENERAL', title:'¿Cómo calificarías tu estado de salud general actualmente?',
    opts:[{val:'excelente',label:'🟢 Excelente',desc:'Me siento muy bien físicamente'},{val:'bueno',label:'🔵 Bueno',desc:'Algunos malestares menores'},{val:'regular',label:'🟡 Regular',desc:'Tengo molestias frecuentes'},{val:'malo',label:'🔴 Malo',desc:'Problemas de salud constantes'}]},
  { id:'hidratacion_cl', cat:'HÁBITOS DE SALUD', title:'¿Cuántos vasos de agua bebes al día aproximadamente?',
    opts:[{val:'menos_4',label:'⚠️ Menos de 4 vasos',desc:'Hidratación muy baja'},{val:'4_6',label:'🔵 4 – 6 vasos',desc:'Por debajo del mínimo recomendado'},{val:'6_8',label:'✅ 6 – 8 vasos',desc:'Cerca del nivel recomendado'},{val:'mas_8',label:'💧 Más de 8 vasos',desc:'Excelente hidratación'}]},
  { id:'urgencias', cat:'SERVICIOS MÉDICOS', title:'¿Has acudido a urgencias o al médico por enfermedad en los últimos 6 meses?',
    opts:[{val:'no',label:'✅ No, ninguna vez',desc:'Sin visitas de urgencia recientes'},{val:'una',label:'📋 Una vez',desc:'Una visita por alguna molestia'},{val:'dos_tres',label:'⚠️ Dos o tres veces',desc:'Varias visitas recientes'},{val:'mas_tres',label:'🔴 Más de tres veces',desc:'Seguimiento médico frecuente'}]},
].map(q => ({ ...q, module: 'clinico' }))

// ── Nutrición (12 preguntas) ────────────────────────────
const Q_NUTRICION = [
  { id:'objetivo', cat:'OBJETIVOS NUTRICIONALES', title:'¿Cuál es tu principal objetivo con tu alimentación?',
    opts:[{val:'perder_peso',label:'⚖️ Perder peso',desc:'Reducir grasa corporal'},{val:'ganar_masa',label:'💪 Ganar masa muscular',desc:'Aumentar músculo con soporte nutricional'},{val:'mantener',label:'⚡ Mantener peso',desc:'Equilibrio sin cambios drásticos'},{val:'mejorar_salud',label:'🌿 Mejorar salud general',desc:'Comer mejor sin metas específicas de peso'}]},
  { id:'frecuencia_comidas', cat:'HÁBITOS ALIMENTICIOS', title:'¿Cuántas veces comes al día normalmente?',
    opts:[{val:'una_dos',label:'⚠️ 1 a 2 veces',desc:'Pocas comidas'},{val:'tres',label:'✅ 3 veces',desc:'Desayuno, comida y cena'},{val:'cuatro',label:'🍱 4 veces con colaciones',desc:'Incluyo snacks o meriendas'},{val:'cinco_mas',label:'🥗 5 o más veces',desc:'Alimentación fraccionada frecuente'}]},
  { id:'desayuno', cat:'HÁBITOS ALIMENTICIOS', title:'¿Qué tan seguido desayunas?',
    opts:[{val:'siempre',label:'✅ Siempre',desc:'El desayuno es parte fija de mi rutina'},{val:'casi_siempre',label:'🔄 Casi siempre',desc:'Algunos días me lo salto'},{val:'a_veces',label:'⚠️ A veces',desc:'Depende del día'},{val:'nunca',label:'❌ Nunca o casi nunca',desc:'No desayuno habitualmente'}]},
  { id:'verduras_frutas', cat:'CALIDAD DE LA DIETA', title:'¿Con qué frecuencia consumes frutas y verduras?',
    opts:[{val:'diario',label:'🥦 Todos los días',desc:'Al menos 5 porciones diarias'},{val:'frecuente',label:'✅ La mayoría de los días',desc:'4-5 días a la semana'},{val:'ocasional',label:'🔄 Algunas veces',desc:'1-3 días a la semana'},{val:'casi_nunca',label:'❌ Pocas veces',desc:'Rara vez o nunca los incluyo'}]},
  { id:'proteina', cat:'CALIDAD DE LA DIETA', title:'¿Cuál es tu principal fuente de proteína?',
    opts:[{val:'carnes',label:'🥩 Carnes (pollo, res, cerdo)',desc:'Proteína animal como base'},{val:'pescado',label:'🐟 Pescado y mariscos',desc:'Proteína marina frecuente'},{val:'huevo_lacto',label:'🥚 Huevo y lácteos',desc:'Proteína ovo-láctea'},{val:'vegetal',label:'🌱 Leguminosas y plantas',desc:'Vegetariano/vegano'}]},
  { id:'ultra_procesados', cat:'CALIDAD DE LA DIETA', title:'¿Con qué frecuencia consumes alimentos ultraprocesados (comida rápida, frituras, refrescos)?',
    opts:[{val:'casi_nunca',label:'✅ Casi nunca',desc:'Evito activamente estos alimentos'},{val:'una_vez',label:'🔵 1-2 veces/semana',desc:'Consumo ocasional y controlado'},{val:'frecuente',label:'🟡 3-5 veces/semana',desc:'Parte regular de mi dieta'},{val:'diario',label:'🔴 Todos los días',desc:'Conforman gran parte de lo que como'}]},
  { id:'agua', cat:'HIDRATACIÓN', title:'¿Cuántos vasos de agua pura tomas al día?',
    opts:[{val:'menos_4',label:'⚠️ Menos de 4 vasos',desc:'Hidratación muy insuficiente'},{val:'4_6',label:'🔵 4 – 6 vasos',desc:'Por debajo del mínimo recomendado'},{val:'6_8',label:'✅ 6 – 8 vasos',desc:'Dentro del rango adecuado'},{val:'mas_8',label:'💧 Más de 8 vasos',desc:'Excelente hidratación'}]},
  { id:'alergias', cat:'RESTRICCIONES', title:'¿Tienes alguna restricción alimentaria o alergia?',
    opts:[{val:'ninguna',label:'✅ Sin restricciones',desc:'Puedo comer de todo'},{val:'lactosa',label:'🥛 Intolerancia a lactosa',desc:'Evito productos lácteos'},{val:'gluten',label:'🌾 Intolerancia al gluten',desc:'Celiaquía o sensibilidad'},{val:'otras',label:'⚠️ Otras alergias',desc:'Alergias a frutos secos, mariscos, etc.'}]},
  { id:'presupuesto', cat:'CONTEXTO PERSONAL', title:'¿Cómo describirías tu presupuesto para alimentación?',
    opts:[{val:'muy_limitado',label:'💸 Muy limitado',desc:'Menos de $50 MXN diarios'},{val:'limitado',label:'💰 Limitado',desc:'$50 – $100 MXN diarios'},{val:'moderado',label:'💵 Moderado',desc:'$100 – $200 MXN diarios'},{val:'amplio',label:'🏦 Amplio',desc:'Más de $200 MXN diarios'}]},
  { id:'cocina', cat:'CONTEXTO PERSONAL', title:'¿Tienes acceso a cocina para preparar tus alimentos?',
    opts:[{val:'completa',label:'🍳 Cocina completa',desc:'Puedo cocinar lo que quiera'},{val:'limitada',label:'🔥 Acceso limitado',desc:'Solo microondas o cosas sencillas'},{val:'cafeteria',label:'🏫 Dependo de cafetería',desc:'Como principalmente en la escuela'},{val:'no',label:'❌ Sin acceso',desc:'Compro comida preparada siempre'}]},
  { id:'actividad_fisica_alim', cat:'ESTILO DE VIDA', title:'¿Cuánto ejercicio físico realizas a la semana?',
    opts:[{val:'sedentario',label:'🪑 Poco o nada',desc:'Vida sedentaria, sin ejercicio regular'},{val:'leve',label:'🚶 Actividad leve (1-2 días)',desc:'Caminatas o ejercicio ocasional'},{val:'moderado',label:'🏃 Moderado (3-4 días)',desc:'Ejercicio regular de intensidad moderada'},{val:'intenso',label:'🏋️ Intenso (5+ días)',desc:'Entrenamiento fuerte y frecuente'}]},
  { id:'horario', cat:'ESTILO DE VIDA', title:'¿Cómo es tu horario diario en relación a tus comidas?',
    opts:[{val:'regular',label:'⏰ Horarios regulares',desc:'Como a horas más o menos fijas'},{val:'irregular',label:'🔄 Muy irregular',desc:'Mis comidas varían mucho día a día'},{val:'nocturno',label:'🌙 Principalmente nocturno',desc:'Como más en la tarde/noche'},{val:'sin_tiempo',label:'⚡ Sin tiempo',desc:'Me cuesta encontrar tiempo para comer bien'}]},
].map(q => ({ ...q, module: 'nutricion' }))

// ── Psicología (12 preguntas) ───────────────────────────
const Q_PSICOLOGIA = [
  { id:'estres_general', cat:'ESTRÉS Y ANSIEDAD', title:'¿Con qué frecuencia te sientes estresado/a en tu vida diaria?',
    opts:[{val:'nunca',label:'😌 Casi nunca',desc:'Me siento tranquilo/a la mayor parte del tiempo'},{val:'ocasional',label:'🔄 Ocasionalmente',desc:'Estrés puntual en situaciones concretas'},{val:'frecuente',label:'⚠️ Frecuentemente',desc:'Varios días a la semana'},{val:'constante',label:'🔴 Casi todo el tiempo',desc:'Siento estrés prácticamente todos los días'}]},
  { id:'ansiedad', cat:'ESTRÉS Y ANSIEDAD', title:'¿Has experimentado síntomas de ansiedad (palpitaciones, tensión, preocupación excesiva)?',
    opts:[{val:'nunca',label:'✅ Nunca o casi nunca',desc:'No reconozco síntomas de ansiedad'},{val:'leve',label:'🔵 Síntomas leves ocasionales',desc:'Me pasa rara vez y puedo manejarlo'},{val:'moderado',label:'🟡 Con cierta frecuencia',desc:'Interfiere algo con mi vida diaria'},{val:'intenso',label:'🔴 Síntomas intensos frecuentes',desc:'Afecta notablemente mi funcionamiento'}]},
  { id:'estado_animo', cat:'ESTADO DE ÁNIMO', title:'¿Cómo describirías tu estado de ánimo predominante en las últimas dos semanas?',
    opts:[{val:'positivo',label:'😊 Positivo y estable',desc:'Me siento bien emocionalmente'},{val:'variable',label:'😐 Variable o inestable',desc:'Cambios de humor frecuentes'},{val:'bajo',label:'😔 Bajo o triste',desc:'Me cuesta encontrar alegría o motivación'},{val:'muy_bajo',label:'😞 Muy bajo / Deprimido/a',desc:'Tristeza persistente la mayor parte del tiempo'}]},
  { id:'sueno_psico', cat:'ESTADO DE ÁNIMO', title:'¿Tienes dificultades para dormir relacionadas con pensamientos o emociones?',
    opts:[{val:'no',label:'✅ No, duermo bien',desc:'Sin problemas para conciliar el sueño'},{val:'ocasional',label:'🔄 A veces me cuesta dormirme',desc:'Algunas noches con pensamientos activos'},{val:'frecuente',label:'⚠️ Con frecuencia',desc:'Varias noches a la semana me desvelo'},{val:'casi_siempre',label:'🔴 Casi todas las noches',desc:'El insomnio es un problema serio para mí'}]},
  { id:'relaciones', cat:'RELACIONES SOCIALES', title:'¿Cómo calificarías tus relaciones personales (amigos, familia, pareja)?',
    opts:[{val:'muy_buenas',label:'💚 Muy buenas y de apoyo',desc:'Cuento con personas en quien confiar'},{val:'buenas',label:'🔵 Buenas en general',desc:'Relaciones satisfactorias con algunos conflictos'},{val:'tensas',label:'🟡 Con bastante tensión',desc:'Conflictos frecuentes o distanciamiento'},{val:'aislado',label:'🔴 Me siento aislado/a',desc:'Poca conexión o apoyo social'}]},
  { id:'rendimiento_academico', cat:'RENDIMIENTO Y VIDA DIARIA', title:'¿Tu bienestar emocional afecta tu rendimiento académico o laboral?',
    opts:[{val:'no',label:'✅ No, rindo bien',desc:'Mis emociones no impactan mi desempeño'},{val:'poco',label:'🔵 Levemente',desc:'A veces me cuesta concentrarme'},{val:'moderado',label:'🟡 Moderadamente',desc:'Bajo rendimiento en periodos de estrés'},{val:'mucho',label:'🔴 Bastante',desc:'Mi estado emocional afecta seriamente mi desempeño'}]},
  { id:'autocuidado', cat:'RENDIMIENTO Y VIDA DIARIA', title:'¿Practicas actividades de autocuidado o relajación regularmente?',
    opts:[{val:'siempre',label:'✅ Sí, regularmente',desc:'Meditación, ejercicio, pasatiempos, etc.'},{val:'a_veces',label:'🔄 A veces',desc:'Cuando tengo tiempo o lo recuerdo'},{val:'pocas',label:'⚠️ Pocas veces',desc:'Casi no me doy tiempo para mí'},{val:'nunca',label:'❌ Nunca o casi nunca',desc:'No tengo hábitos de autocuidado'}]},
  { id:'autoestima', cat:'AUTOESTIMA Y AUTOCONCEPTO', title:'¿Cómo describirías tu autoestima en general?',
    opts:[{val:'alta',label:'💪 Alta y estable',desc:'Me siento bien conmigo mismo/a'},{val:'moderada',label:'🔵 Moderada',desc:'Generalmente bien, con inseguridades puntuales'},{val:'baja',label:'🟡 Baja con frecuencia',desc:'Me cuesta valorarme positivamente'},{val:'muy_baja',label:'🔴 Muy baja',desc:'Pensamientos negativos frecuentes sobre mí mismo/a'}]},
  { id:'apoyo_profesional', cat:'HISTORIAL DE APOYO', title:'¿Has buscado ayuda psicológica o emocional anteriormente?',
    opts:[{val:'si_activo',label:'✅ Sí, actualmente en proceso',desc:'Tengo seguimiento psicológico activo'},{val:'si_pasado',label:'📋 Sí, en el pasado',desc:'Recibí apoyo antes, ahora no'},{val:'no_quiero',label:'🌱 No, pero me interesa',desc:'Estoy considerando buscar apoyo'},{val:'no',label:'❌ No lo he considerado',desc:'No he buscado ni considerado ayuda'}]},
  { id:'consumo_sustancias', cat:'FACTORES DE RIESGO', title:'¿Usas alguna sustancia (alcohol, cafeína excesiva, otras) para manejar el estrés?',
    opts:[{val:'no',label:'✅ No, no lo hago',desc:'Manejo el estrés de otras formas'},{val:'cafeina',label:'☕ Solo cafeína en exceso',desc:'Muchos cafés/energéticas para rendir'},{val:'alcohol',label:'🍺 Alcohol ocasionalmente',desc:'Para relajarme o desconectar'},{val:'varios',label:'⚠️ Varias sustancias',desc:'Combino diferentes recursos'}]},
  { id:'pensamientos_neg', cat:'FACTORES DE RIESGO', title:'¿Con qué frecuencia tienes pensamientos negativos persistentes sobre ti mismo/a o el futuro?',
    opts:[{val:'raramente',label:'✅ Raramente',desc:'Son pensamientos puntuales que manejo bien'},{val:'ocasional',label:'🔵 Ocasionalmente',desc:'Aparecen pero no dominan mi día'},{val:'frecuente',label:'🟡 Con bastante frecuencia',desc:'Afectan mi estado de ánimo regularmente'},{val:'constante',label:'🔴 Casi constantemente',desc:'Dominan mi forma de pensar la mayor parte del día'}]},
  { id:'metas_bienestar', cat:'OBJETIVOS DE BIENESTAR', title:'¿Qué aspecto de tu bienestar mental quieres trabajar más?',
    opts:[{val:'estres',label:'🧘 Manejo del estrés',desc:'Técnicas de relajación y regulación emocional'},{val:'ansiedad',label:'💆 Control de la ansiedad',desc:'Reducir preocupaciones y tensión'},{val:'autoestima',label:'💪 Fortalecer mi autoestima',desc:'Mejorar mi relación conmigo mismo/a'},{val:'relaciones',label:'🤝 Mejorar relaciones',desc:'Comunicación y vínculos más sanos'}]},
].map(q => ({ ...q, module: 'psicologia' }))

// ── Secuencia total de pasos ─────────────────────────────
const ALL_STEPS = [
  BIO_STEP,
  ...Q_EJERCICIO,
  ...Q_CLINICO,
  ...Q_NUTRICION,
  ...Q_PSICOLOGIA,
]
const TOTAL = ALL_STEPS.length

/* ══════════════════════════════════════════════════════════
   SCORING
══════════════════════════════════════════════════════════ */
function calcFitnessScore(a) {
  const c = { muy_buena:30, buena:20, regular:10, mala:0 }
  const m = { mas_300:40, '150_300':30, '75_150':15, menos_75:0 }
  const n = { avanzado:30, intermedio:20, principiante:10 }
  return (c[a.condicion_fisica]??10) + (m[a.minutos_semana]??10) + (n[a.nivel_entrenamiento]??10)
}
function calcSaludScore(a) {
  const vis = { nunca:0, rara_vez:5, anual:15, frecuente:20 }
  const tab = { nunca:15, exfumador:10, ocasional:5, regular:0 }
  const alc = { nunca:15, social:10, frecuente:4, diario:0 }
  const sue = { menos_5:0, '5_6':5, '7_8':20, mas_9:10 }
  return (vis[a.visitas_medico]??5) + (tab[a.tabaco]??5) + (alc[a.alcohol]??5) + (sue[a.sueno]??5)
}
function calcNutricionScore(a) {
  const ver = { diario:20, frecuente:14, ocasional:7, casi_nunca:0 }
  const ult = { casi_nunca:15, una_vez:10, frecuente:4, diario:0 }
  const agu = { menos_4:0, '4_6':5, '6_8':10, mas_8:15 }
  const des = { siempre:15, casi_siempre:10, a_veces:5, nunca:0 }
  return (ver[a.verduras_frutas]??7) + (ult[a.ultra_procesados]??7) + (agu[a.agua]??7) + (des[a.desayuno]??7)
}
function calcPsicoScore(a) {
  const est = { nunca:25, ocasional:18, frecuente:8, constante:0 }
  const ani = { positivo:25, variable:15, bajo:7, muy_bajo:0 }
  const rel = { muy_buenas:25, buenas:18, tensas:8, aislado:0 }
  return (est[a.estres_general]??10) + (ani[a.estado_animo]??10) + (rel[a.relaciones]??10)
}
function calcIMC(peso, altura) {
  if (!peso || !altura || altura < 100) return null
  const imc = peso / Math.pow(altura / 100, 2)
  if (imc < 18.5) return { value: imc.toFixed(1), label:'Bajo peso',   color:'#60a5fa' }
  if (imc < 25)   return { value: imc.toFixed(1), label:'Normal',      color:'#22c55e' }
  if (imc < 30)   return { value: imc.toFixed(1), label:'Sobrepeso',   color:'#eab308' }
  return               { value: imc.toFixed(1), label:'Obesidad',    color:'#ef4444' }
}

/* ══════════════════════════════════════════════════════════
   ESTILOS INLINE
══════════════════════════════════════════════════════════ */
const S = {
  root: { position:'fixed', inset:0, background:'var(--color-background)', display:'flex', flexDirection:'column', zIndex:9000, overflow:'hidden', fontFamily:'Inter, system-ui, sans-serif' },
  topBar: { padding:'12px 24px 8px', display:'flex', justifyContent:'space-between', alignItems:'center', fontSize:'0.6rem', fontFamily:'monospace', letterSpacing:'0.15em', textTransform:'uppercase', color:'#3d4451', flexShrink:0 },
  progressWrap: { margin:'0 24px', height:2, background:'var(--border-subtle)', borderRadius:2, flexShrink:0 },
  moduleRow: { display:'flex', gap:0, borderBottom:'1px solid rgba(255,255,255,0.05)', flexShrink:0 },
  slide: { flex:1, overflow:'hidden', position:'relative', display:'flex', alignItems:'center', justifyContent:'center' },
  content: { position:'absolute', inset:0, display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', padding:'24px', overflowY:'auto' },
  navBar: { padding:'16px 24px 28px', display:'flex', justifyContent:'space-between', alignItems:'center', gap:12, borderTop:'1px solid rgba(255,255,255,0.05)', flexShrink:0 },
  btnPrimary: { background:'linear-gradient(135deg,#00e5ff,#00b4cc)', color:'#000', border:'none', borderRadius:12, padding:'13px 28px', fontWeight:700, fontSize:'0.875rem', cursor:'pointer', letterSpacing:'0.02em' },
  btnGhost: { background:'transparent', color:'var(--color-muted-foreground)', border:'1px solid rgba(255,255,255,0.08)', borderRadius:12, padding:'13px 20px', fontWeight:600, fontSize:'0.875rem', cursor:'pointer' },
  optCard: (sel, color) => ({ display:'flex', alignItems:'center', gap:14, padding:'14px 16px', border:`1px solid ${sel ? color : 'var(--border-subtle)'}`, background: sel ? `${color}12` : 'rgba(255,255,255,0.03)', borderRadius:14, cursor:'pointer', transition:'all 160ms', marginBottom:10, width:'100%', maxWidth:560, textAlign:'left' }),
  radio: (sel, color) => ({ width:20, height:20, borderRadius:'50%', border:`2px solid ${sel ? color : '#333'}`, background: sel ? color : 'transparent', flexShrink:0, transition:'all 160ms', display:'flex', alignItems:'center', justifyContent:'center' }),
  optLabel: { fontWeight:600, fontSize:'0.9rem', color:'var(--color-foreground)' },
  optDesc: { fontSize:'0.78rem', color:'var(--color-muted-foreground)', marginTop:2 },
  qTitle: { fontSize:'1.6rem', fontWeight:800, color:'var(--color-foreground)', lineHeight:1.35, maxWidth:560, textAlign:'center', marginBottom:28 },
  catTag: (color) => ({ fontSize:'0.55rem', fontFamily:'monospace', letterSpacing:'0.18em', textTransform:'uppercase', color, background:`${color}15`, border:`1px solid ${color}30`, padding:'3px 10px', borderRadius:4, marginBottom:14, display:'inline-block' }),
  bioInput: { background:'var(--surface-2)', border:'1px solid rgba(255,255,255,0.1)', borderRadius:12, padding:'14px 18px', color:'var(--color-foreground)', fontSize:'1rem', fontFamily:'Inter, sans-serif', width:'100%', outline:'none' },
}

/* ══════════════════════════════════════════════════════════
   COMPONENTE MÓDULO TAB
══════════════════════════════════════════════════════════ */
function ModuleTab({ mod, active, pct }) {
  return (
    <div style={{ flex:1, padding:'8px 4px 6px', display:'flex', flexDirection:'column', alignItems:'center', gap:3, opacity: active ? 1 : 0.35, transition:'opacity 300ms' }}>
      <div style={{ fontSize:'0.75rem' }}>{mod.icon}</div>
      <div style={{ fontSize:'0.45rem', fontFamily:'monospace', letterSpacing:'0.12em', color: active ? mod.color : '#3d4451', textTransform:'uppercase', fontWeight:700 }}>{mod.label}</div>
      <div style={{ width:'100%', height:2, background:'var(--border-subtle)', borderRadius:2, overflow:'hidden' }}>
        <div style={{ height:'100%', background: mod.color, width:`${pct}%`, transition:'width 400ms', boxShadow:`0 0 8px ${mod.color}` }} />
      </div>
    </div>
  )
}

/* ══════════════════════════════════════════════════════════
   DIAGNÓSTICO IA — usa Claude Sonnet
══════════════════════════════════════════════════════════ */
function DiagnosticoIA({ data, bio, onContinue }) {
  const [diag, setDiag]       = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError]     = useState(null)

  const fitScore  = calcFitnessScore(data)
  const salScore  = calcSaludScore(data)
  const nutrScore = calcNutricionScore(data)
  const psiScore  = calcPsicoScore(data)

  async function generar() {
    setLoading(true); setError(null)
    const prompt = `Eres un asistente de salud universitario. Analiza el perfil de salud integral del usuario y responde ÚNICAMENTE con JSON válido, sin markdown, sin texto extra.

Estructura exacta del JSON:
{
  "resumen": "2-3 oraciones motivadoras de diagnóstico general",
  "modulos": {
    "ejercicio":  { "nivel": "Principiante|Intermedio|Avanzado", "observacion": "1-2 oraciones", "recomendacion": "consejo concreto accionable" },
    "clinico":    { "nivel": "Óptimo|Bueno|Atención requerida",  "observacion": "1-2 oraciones", "recomendacion": "consejo concreto accionable" },
    "nutricion":  { "nivel": "Excelente|Adecuada|Mejorable",     "observacion": "1-2 oraciones", "recomendacion": "consejo concreto accionable" },
    "psicologia": { "nivel": "Estable|Moderado|Requiere apoyo",  "observacion": "1-2 oraciones", "recomendacion": "consejo concreto accionable" }
  },
  "prioridad": "ejercicio|clinico|nutricion|psicologia",
  "frase_motivadora": "frase corta e inspiradora para el estudiante"
}

Perfil del usuario:
- Biometría: Sexo=${bio.sexo}, Peso=${bio.peso}kg, Altura=${bio.altura}cm, IMC=${calcIMC(bio.peso,bio.altura)?.value ?? 'N/A'} (${calcIMC(bio.peso,bio.altura)?.label ?? ''})
- Scores calculados: Ejercicio=${fitScore}/100, Salud clínica=${salScore}/55, Nutrición=${nutrScore}/50, Psicología=${psiScore}/75
- Respuestas completas: ${JSON.stringify(data)}`

    const res = await fetch('http://localhost:11434/api/generate', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    model: 'qwen2.5:3b',
    stream: false,
    prompt: prompt,           // ← solo prompt
    format: 'json',
    options: { temperature: 0.4, num_predict: 2048 },
  }),
})
const result = await res.json()
const text = result.response ?? ''           // ← no result.content
setDiag(JSON.parse(text.replace(/```json|```/g, '').trim()))
  }

  useEffect(() => { generar() }, [])

  const MOD_META = {
    ejercicio:  { color:'#00e5ff', icon:'⚡', label:'Ejercicio'  },
    clinico:    { color:'#0ea5e9', icon:'🩺', label:'Clínico'    },
    nutricion:  { color:'#22c55e', icon:'🥗', label:'Nutrición'  },
    psicologia: { color:'#a78bfa', icon:'🧠', label:'Psicología' },
  }
  const imc = calcIMC(bio.peso, bio.altura)

  return (
    <div style={{ position:'fixed', inset:0, background:'var(--color-background)', zIndex:9999, overflowY:'auto', fontFamily:'Inter, system-ui, sans-serif' }}>
      <div style={{ maxWidth:560, margin:'0 auto', padding:'48px 24px 80px' }}>
        <div style={{ fontSize:'0.55rem', fontFamily:'monospace', letterSpacing:'0.18em', color:'#00e5ff', textTransform:'uppercase', marginBottom:10 }}>DIAGNÓSTICO INTEGRAL</div>
        <h2 style={{ fontSize:'2rem', fontWeight:800, color:'var(--color-foreground)', marginBottom:6, letterSpacing:'-0.02em' }}>Tu perfil de salud</h2>
        <p style={{ color:'#444', fontSize:'0.82rem', marginBottom:32 }}>Análisis personalizado de tus 4 módulos · Generado por IA</p>

        {/* Biometría rápida */}
        {imc && (
          <div style={{ background:'var(--surface-1)', border:'1px solid rgba(255,255,255,0.07)', borderRadius:16, padding:'16px 20px', marginBottom:24, display:'flex', gap:24, flexWrap:'wrap' }}>
            <div style={{ textAlign:'center' }}><div style={{ fontSize:'1.4rem', fontWeight:800, color: imc.color }}>{imc.value}</div><div style={{ fontSize:'0.65rem', color:'var(--color-muted-foreground)', textTransform:'uppercase', letterSpacing:'0.1em' }}>IMC · {imc.label}</div></div>
            <div style={{ textAlign:'center' }}><div style={{ fontSize:'1.4rem', fontWeight:800, color:'var(--color-foreground)' }}>{bio.peso}kg</div><div style={{ fontSize:'0.65rem', color:'var(--color-muted-foreground)', textTransform:'uppercase', letterSpacing:'0.1em' }}>Peso</div></div>
            <div style={{ textAlign:'center' }}><div style={{ fontSize:'1.4rem', fontWeight:800, color:'var(--color-foreground)' }}>{bio.altura}cm</div><div style={{ fontSize:'0.65rem', color:'var(--color-muted-foreground)', textTransform:'uppercase', letterSpacing:'0.1em' }}>Altura</div></div>
          </div>
        )}

        {loading && (
          <div style={{ textAlign:'center', padding:'64px 0' }}>
            <div style={{ width:40, height:40, border:'2px solid rgba(255,255,255,0.08)', borderTopColor:'#00e5ff', borderRadius:'50%', animation:'spin 700ms linear infinite', margin:'0 auto 16px' }} />
            <div style={{ fontSize:'0.6rem', fontFamily:'monospace', letterSpacing:'0.15em', color:'#444', textTransform:'uppercase' }}>Analizando perfil con IA...</div>
          </div>
        )}

        {error && (
          <div style={{ background:'rgba(239,68,68,0.07)', border:'1px solid rgba(239,68,68,0.2)', borderRadius:14, padding:'16px 20px', marginBottom:20, color:'#ef4444', fontSize:'0.82rem' }}>
            {error}
          </div>
        )}

        {diag && (
          <>
            <div style={{ background:'linear-gradient(135deg, rgba(0,229,255,0.07), rgba(0,180,204,0.03))', border:'1px solid rgba(0,229,255,0.15)', borderRadius:16, padding:'20px 24px', marginBottom:24 }}>
              <p style={{ color:'#c8e6f0', fontSize:'0.95rem', lineHeight:1.6, margin:0 }}>{diag.resumen}</p>
              <p style={{ color:'#00e5ff', fontSize:'0.95rem', fontWeight:700, marginTop:14, marginBottom:0 }}>"{diag.frase_motivadora}"</p>
            </div>

            <div style={{ display:'grid', gap:14, marginBottom:28 }}>
              {Object.entries(diag.modulos).map(([key, mod]) => {
                const m = MOD_META[key]
                return (
                  <div key={key} style={{ background:'var(--surface-1)', border:`1px solid ${m.color}25`, borderRadius:16, padding:'16px 20px' }}>
                    <div style={{ display:'flex', alignItems:'center', gap:10, marginBottom:10 }}>
                      <span style={{ fontSize:'1.1rem' }}>{m.icon}</span>
                      <span style={{ fontWeight:700, color: m.color, fontSize:'0.8rem', textTransform:'uppercase', letterSpacing:'0.1em' }}>{m.label}</span>
                      <span style={{ marginLeft:'auto', background:`${m.color}18`, color: m.color, border:`1px solid ${m.color}35`, borderRadius:6, fontSize:'0.65rem', fontWeight:700, padding:'2px 8px', textTransform:'uppercase', letterSpacing:'0.08em' }}>{mod.nivel}</span>
                    </div>
                    <p style={{ color:'var(--color-secondary-foreground)', fontSize:'0.83rem', lineHeight:1.5, margin:'0 0 8px' }}>{mod.observacion}</p>
                    <p style={{ color:'#ccc', fontSize:'0.83rem', lineHeight:1.5, margin:0 }}>💡 {mod.recomendacion}</p>
                  </div>
                )
              })}
            </div>
          </>
        )}

        <button
          onClick={onContinue}
          style={{ ...S.btnPrimary, width:'100%', fontSize:'1rem', padding:'16px', borderRadius:14 }}
        >
          Ir al Dashboard →
        </button>
      </div>
      <style>{`@keyframes spin { to { transform: rotate(360deg) } }`}</style>
    </div>
  )
}

/* ══════════════════════════════════════════════════════════
   MAIN COMPONENT
══════════════════════════════════════════════════════════ */
export default function OnboardingPage() {
  const { completeOnboarding } = useAuth()
  const navigate = useNavigate()

  const [step, setStep]     = useState(0)
  const [answers, setAnswers] = useState({})
  const [bio, setBio]       = useState({ sexo:'', peso:'', altura:'' })
  const [error, setError]   = useState('')
  const [exiting, setExiting] = useState(false)
  const [saving, setSaving] = useState(false)
  const [saveStep, setSaveStep] = useState('')
  const [showDiag, setShowDiag] = useState(false)
  const [toast, setToast]   = useState({ show:false, msg:'', type:'error' })
  const slideRef = useRef(null)

  const currentStep = ALL_STEPS[step]
  const isBio = currentStep.type === 'bio'
  const modKey = currentStep.module
  const mod = MODULES.find(m => m.key === modKey)
  const pct = Math.round(((step + 1) / TOTAL) * 100)

  // Progreso por módulo
  const modProgress = MODULES.map(m => {
    const modSteps = ALL_STEPS.filter(s => s.module === m.key)
    const done = ALL_STEPS.slice(0, step + 1).filter(s => s.module === m.key).length
    return { ...m, pct: modSteps.length ? Math.round((done / modSteps.length) * 100) : 0 }
  })

  const showToast = (msg, type = 'error') => {
    setToast({ show:true, msg, type })
    setTimeout(() => setToast(t => ({ ...t, show:false })), 4000)
  }

  function canAdvance() {
    if (isBio) return bio.sexo && bio.peso && bio.altura
    return !!answers[currentStep.id]
  }

  function next() {
    if (!canAdvance()) {
      setError(isBio ? 'Completa todos los campos para continuar.' : 'Selecciona una opción para continuar.')
      if (slideRef.current) {
        slideRef.current.animate([
          { transform:'translateX(0)' }, { transform:'translateX(-8px)' },
          { transform:'translateX(8px)' }, { transform:'translateX(-4px)' },
          { transform:'translateX(0)' }
        ], { duration:300 })
      }
      return
    }
    if (step < TOTAL - 1) {
      setExiting(true)
      setTimeout(() => { setStep(s => s + 1); setExiting(false); setError('') }, 240)
    } else {
      submitAll()
    }
  }

  function prev() {
    if (step > 0) {
      setExiting(true)
      setTimeout(() => { setStep(s => s - 1); setExiting(false); setError('') }, 240)
    }
  }

  /* ── Submit: guarda en los 4 endpoints y genera rutina + dieta ── */
  async function submitAll() {
    setSaving(true)

    const fitScore  = calcFitnessScore(answers)
    const salScore  = calcSaludScore(answers)
    const nutrScore = calcNutricionScore(answers)
    const psiScore  = calcPsicoScore(answers)
    const imc       = calcIMC(parseFloat(bio.peso), parseFloat(bio.altura))

    const nivelEjercicio = fitScore <= 25 ? 'principiante' : fitScore <= 55 ? 'intermedio' : 'avanzado'
    const nivelSalud = salScore < 15 ? 'critico' : salScore < 25 ? 'moderado' : salScore < 38 ? 'bueno' : 'optimo'
    const nivelNutricion = nutrScore <  20 ? 'deficiente'  : nutrScore <  35 ? 'mejorable' : nutrScore < 45 ? 'adecuado' : 'optimo'
   const nivelPsico = psiScore < 30 ? 'critico' : psiScore < 45 ? 'vulnerable' : psiScore < 62 ? 'moderado' : 'resiliente'

    try {
      // 1. Cuestionario ejercicio + biometría
      setSaveStep('ejercicio')
      await api.post('/Cuestionario/Guardar.php', {
        ...answers,
        sexo:              bio.sexo,
        peso:              parseFloat(bio.peso),
        altura:            parseFloat(bio.altura),
        imc:               imc?.value,
        fitness_score:     fitScore,
        nivel_recomendado: nivelEjercicio,
        // mapeos compat.
        frecuencia_semana: answers.frecuencia_semana || '1_2',
        lugar_ejercicio:   answers.lugar_ejercicio   || 'casa',
        condicion_salud:   answers.condicion_cronica || 'ninguna',
        nutricion:         answers.frecuencia_comidas ? 'bastante_equilibrada' : 'regular',
        calentamiento:     answers.calentamiento     || 'a_veces',
        entorno_social:    'indiferente',
        horas_sedentario:  answers.horas_sedentario  || '4_6',
      })

      // 2. Cuestionario clínico
      setSaveStep('clinico')
      await api.post('/Cuestionario/GuardarClinico.php', {
        visitas_medico:     answers.visitas_medico,
        condicion_cronica:  answers.condicion_cronica,
        medicamentos:       answers.medicamentos,
        presion_arterial:   answers.presion_arterial,
        sueno:              answers.sueno,
        tabaco:             answers.tabaco,
        alcohol:            answers.alcohol,
        sintomas_frecuentes:answers.sintomas_frecuentes,
        vacunas:            answers.vacunas,
        estres_fisico:      answers.estres_fisico,
        hidratacion:        answers.hidratacion_cl,
        urgencias:          answers.urgencias,
        salud_score:        salScore,
        nivel_salud:        nivelSalud,
      })

      // 3. Cuestionario nutrición + generar dieta
      setSaveStep('nutricion')
      await api.post('/Cuestionario/GuardarAlimentacion.php', {
        objetivo:           answers.objetivo,
        frecuencia_comidas: answers.frecuencia_comidas,
        desayuno:           answers.desayuno,
        verduras_frutas:    answers.verduras_frutas,
        proteina:           answers.proteina,
        ultra_procesados:   answers.ultra_procesados,
        agua:               answers.agua,
        alergias:           answers.alergias,
        presupuesto:        answers.presupuesto,
        cocina:             answers.cocina,
        actividad_fisica_alim: answers.actividad_fisica_alim,
        horario:            answers.horario,
        nutricion_score:    nutrScore,
        nivel_nutricion:    nivelNutricion,
      })

      // 4. Cuestionario psicología
      setSaveStep('psicologia')
      await api.post('/Cuestionario/GuardarPsicologico.php', {
        estres_general:       answers.estres_general,
        ansiedad:             answers.ansiedad,
        estado_animo:         answers.estado_animo,
        sueno_psico:          answers.sueno_psico,
        relaciones:           answers.relaciones,
        rendimiento_academico:answers.rendimiento_academico,
        autocuidado:          answers.autocuidado,
        autoestima:           answers.autoestima,
        apoyo_profesional:    answers.apoyo_profesional,
        consumo_sustancias:   answers.consumo_sustancias,
        pensamientos_neg:     answers.pensamientos_neg,
        metas_bienestar:      answers.metas_bienestar,
        psico_score:          psiScore,
        nivel_psicologico:    nivelPsico,
      })
      try {
  await api.post('/Bienestar/GuardarPlanSemanal.php', {
    completados: {} // vacío, solo crea el registro de la semana
  })
} catch (_) { /* no bloquear si falla */ }

      // 5. Generar rutina de ejercicio con IA
      setSaveStep('rutina')
      await api.post('/IA/GenerarRutina.php', {}).catch(() => {})

      
      setSaveStep('dieta')
      try {
        const dietaLabels = {
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

Responde SOLO con JSON válido sin texto adicional:
{"dias":[{"dia":"Lunes","comidas":[{"tiempo":"Desayuno","descripcion":"Avena con plátano y miel","kcal":320},{"tiempo":"Comida","descripcion":"Arroz rojo con pollo y ensalada","kcal":550},{"tiempo":"Cena","descripcion":"Frijoles de olla con tortillas","kcal":380}]},{"dia":"Martes","comidas":[{"tiempo":"Desayuno","descripcion":"Huevos revueltos con frijoles","kcal":350},...]}],"calorias_dia":1800,"nota":"Consejo breve."}`

        const dietaRes = await fetch('http://localhost:11434/api/generate', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    model: 'qwen2.5:3b',
    stream: false,
    prompt: dietaPrompt,      // ← solo prompt, sin messages
    format: 'json',
    options: { temperature: 0.4, num_predict: 2048 },
  }),
})
const dietaData = await dietaRes.json()
const dietaText = dietaData.response ?? ''   // ← Ollama devuelve .response
const dietaPlan = JSON.parse(dietaText.replace(/```json|```/g, '').trim())

        // Guardar plan generado en el perfil nutricional
        await api.post('/Cuestionario/GuardarAlimentacion.php', {
          objetivo:           answers.objetivo,
          frecuencia_comidas: answers.frecuencia_comidas,
          desayuno:           answers.desayuno,
          verduras_frutas:    answers.verduras_frutas,
          proteina:           answers.proteina,
          ultra_procesados:   answers.ultra_procesados,
          agua:               answers.agua,
          alergias:           answers.alergias,
          presupuesto:        answers.presupuesto,
          cocina:             answers.cocina,
          actividad_fisica_alim: answers.actividad_fisica_alim,
          horario:            answers.horario,
          nutricion_score:    nutrScore,
          nivel_nutricion:    nivelNutricion,
          plan_semanal:       dietaPlan,
        }).catch(() => {})
      } catch(_) { /* si falla la dieta IA, el perfil nutricional ya fue guardado en el paso 3 */ }

      // Mostrar diagnóstico
      setSaving(false)
      setShowDiag(true)
    } catch(e) {
      showToast(e.response?.data?.error ?? 'Error al guardar el perfil. Intenta de nuevo.')
      setSaving(false)
      setSaveStep('')
    }
  }

  function handleDiagContinue() {
    completeOnboarding()
    navigate('/dashboard', { replace:true })
  }

  /* ── Render diagnóstico ── */
  if (showDiag) return <DiagnosticoIA data={answers} bio={bio} onContinue={handleDiagContinue} />

  /* ── Render paso biometría ── */
  const imc = calcIMC(parseFloat(bio.peso), parseFloat(bio.altura))

  return (
    <div style={S.root}>
      <style>{`
        @keyframes spin { to { transform:rotate(360deg) } }
        @keyframes slideIn { from { opacity:0; transform:translateY(18px) } to { opacity:1; transform:translateY(0) } }
        @keyframes slideOut { from { opacity:1; transform:translateY(0) } to { opacity:0; transform:translateY(-14px) } }
        ::-webkit-scrollbar { width:3px }
        ::-webkit-scrollbar-thumb { background:#222; border-radius:4px }
      `}</style>

      {/* Top bar */}
      <div style={S.topBar}>
        <span>PASO {step + 1} / {TOTAL}</span>
        <span style={{ color: mod?.color ?? '#00e5ff' }}>{mod?.icon} {mod?.label}</span>
        <span style={{ color: mod?.color ?? '#00e5ff' }}>{pct}%</span>
      </div>

      {/* Progress bar global */}
      <div style={S.progressWrap}>
        <div style={{ height:'100%', background:'linear-gradient(90deg,#00e5ff,#00b4cc)', width:`${pct}%`, transition:'width 400ms cubic-bezier(.4,0,.2,1)', boxShadow:'0 0 8px #00e5ff66', borderRadius:2 }} />
      </div>

      {/* Module tabs */}
      <div style={S.moduleRow}>
        {modProgress.map(m => (
          <ModuleTab key={m.key} mod={m} active={m.key === modKey} pct={m.pct} />
        ))}
      </div>

      {/* Slide content */}
      <div style={S.slide}>
        <div
          ref={slideRef}
          key={step}
          style={{ ...S.content, animation: exiting ? 'slideOut 240ms ease forwards' : 'slideIn 260ms cubic-bezier(0.16,1,0.3,1) forwards' }}
        >
          {isBio ? (
            /* ── Paso biometría ── */
            <div style={{ width:'100%', maxWidth:480 }}>
              <div style={S.catTag('#00e5ff')}>PERFIL INICIAL</div>
              <div style={{ ...S.qTitle, textAlign:'left' }}>Cuéntanos un poco sobre ti</div>
              <div style={{ display:'flex', flexDirection:'column', gap:16 }}>
                {/* Sexo */}
                <div>
                  <div style={{ fontSize:'0.72rem', color:'var(--color-muted-foreground)', letterSpacing:'0.1em', textTransform:'uppercase', marginBottom:8 }}>Sexo biológico</div>
                  <div style={{ display:'flex', gap:10 }}>
                    {[{val:'masculino',label:'♂ Masculino'},{val:'femenino',label:'♀ Femenino'},{val:'otro',label:'◯ Otro'}].map(s => (
                      <button
                        key={s.val}
                        onClick={() => setBio(b => ({...b, sexo:s.val}))}
                        style={{ flex:1, padding:'12px', border:`1px solid ${bio.sexo===s.val ? '#00e5ff' : 'var(--border-medium)'}`, background: bio.sexo===s.val ? 'rgba(0,229,255,0.1)' : 'rgba(255,255,255,0.03)', color: bio.sexo===s.val ? '#00e5ff' : '#888', borderRadius:12, cursor:'pointer', fontWeight:600, fontSize:'0.85rem', transition:'all 160ms' }}
                      >{s.label}</button>
                    ))}
                  </div>
                </div>
                {/* Peso */}
                <div>
                  <div style={{ fontSize:'0.72rem', color:'var(--color-muted-foreground)', letterSpacing:'0.1em', textTransform:'uppercase', marginBottom:8 }}>Peso (kg)</div>
                  <input type="number" min="30" max="250" placeholder="Ej: 70" value={bio.peso} onChange={e => setBio(b => ({...b, peso:e.target.value}))} style={S.bioInput} />
                </div>
                {/* Altura */}
                <div>
                  <div style={{ fontSize:'0.72rem', color:'var(--color-muted-foreground)', letterSpacing:'0.1em', textTransform:'uppercase', marginBottom:8 }}>Altura (cm)</div>
                  <input type="number" min="100" max="250" placeholder="Ej: 170" value={bio.altura} onChange={e => setBio(b => ({...b, altura:e.target.value}))} style={S.bioInput} />
                </div>
                {/* IMC preview */}
                {imc && (
                  <div style={{ background:`${imc.color}12`, border:`1px solid ${imc.color}30`, borderRadius:12, padding:'12px 16px', display:'flex', alignItems:'center', gap:12 }}>
                    <div style={{ fontSize:'1.6rem', fontWeight:800, color:imc.color }}>{imc.value}</div>
                    <div>
                      <div style={{ fontWeight:700, color:imc.color, fontSize:'0.85rem' }}>{imc.label}</div>
                      <div style={{ color:'var(--color-muted-foreground)', fontSize:'0.75rem' }}>Índice de Masa Corporal</div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          ) : (
            /* ── Paso pregunta ── */
            <div style={{ width:'100%', maxWidth:560 }}>
              <div style={{ textAlign:'center' }}>
                <div style={S.catTag(mod?.color ?? '#00e5ff')}>{currentStep.cat}</div>
                <div style={S.qTitle}>{currentStep.title}</div>
              </div>
              <div style={{ display:'flex', flexDirection:'column', alignItems:'center' }}>
                {currentStep.opts.map(opt => {
                  const sel = answers[currentStep.id] === opt.val
                  return (
                    <div
                      key={opt.val}
                      onClick={() => { setAnswers(a => ({...a, [currentStep.id]: opt.val})); setError('') }}
                      style={S.optCard(sel, mod?.color ?? '#00e5ff')}
                    >
                      <div style={S.radio(sel, mod?.color ?? '#00e5ff')}>
                        {sel && <div style={{ width:8, height:8, background:'var(--color-background)', borderRadius:'50%' }} />}
                      </div>
                      <div>
                        <div style={S.optLabel}>{opt.label}</div>
                        {opt.desc && <div style={S.optDesc}>{opt.desc}</div>}
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          )}

          {error && (
            <div style={{ fontFamily:'monospace', fontSize:'0.58rem', color:'#ef4444', marginTop:12, letterSpacing:'0.05em' }}>{error}</div>
          )}
        </div>
      </div>

      {/* Nav */}
      <div style={S.navBar}>
        {step > 0
          ? <button style={S.btnGhost} onClick={prev}>← Atrás</button>
          : <div />
        }
        <button style={{ ...S.btnPrimary, minWidth:140 }} onClick={next} disabled={saving}>
          {step === TOTAL - 1 ? 'Generar diagnóstico ✨' : 'Continuar →'}
        </button>
      </div>

      {/* Toast */}
      {toast.show && (
        <div style={{ position:'fixed', left:'50%', transform:'translateX(-50%)', bottom:90, background: toast.type==='error' ? 'rgba(239,68,68,0.9)' : 'rgba(34,197,94,0.9)', color:'#fff', padding:'10px 20px', borderRadius:10, fontSize:'0.82rem', fontWeight:600, zIndex:9999, whiteSpace:'nowrap' }}>
          {toast.msg}
        </div>
      )}

      {/* Saving overlay */}
      {saving && (
        <div style={{ position:'fixed', inset:0, background:'var(--color-background)', zIndex:9999, display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', gap:20 }}>
          <div style={{ width:44, height:44, border:'2px solid rgba(255,255,255,0.08)', borderTopColor:'#00e5ff', borderRadius:'50%', animation:'spin 700ms linear infinite' }} />
          <div style={{ textAlign:'center' }}>
            <div style={{ fontFamily:'monospace', fontSize:'0.6rem', letterSpacing:'0.15em', color:'#00e5ff', textTransform:'uppercase', marginBottom:6 }}>
              {saveStep === 'ejercicio'  && '⚡ Guardando perfil de ejercicio...'}
              {saveStep === 'clinico'    && '🩺 Guardando perfil clínico...'}
              {saveStep === 'nutricion'  && '🥗 Guardando perfil nutricional...'}
              {saveStep === 'psicologia' && '🧠 Guardando perfil psicológico...'}
              {saveStep === 'rutina'     && '⚡ Generando tu rutina de entrenamiento...'}
              {saveStep === 'dieta'      && '🥗 Generando tu plan de alimentación...'}
            </div>
            <div style={{ fontFamily:'monospace', fontSize:'0.5rem', color:'var(--border-medium)', letterSpacing:'0.1em', textTransform:'uppercase' }}>Creando tu perfil de salud integral</div>
          </div>
          {/* Steps indicator */}
          <div style={{ display:'flex', gap:8 }}>
            {['ejercicio','clinico','nutricion','psicologia','rutina','dieta'].map(s => (
              <div key={s} style={{ width:6, height:6, borderRadius:'50%', background: ['ejercicio','clinico','nutricion','psicologia','rutina','dieta'].indexOf(s) <= ['ejercicio','clinico','nutricion','psicologia','rutina','dieta'].indexOf(saveStep) ? '#00e5ff' : '#222', transition:'background 300ms', boxShadow: s===saveStep ? '0 0 8px #00e5ff' : 'none' }} />
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
