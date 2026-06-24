// infrastructure/api/alimentacionApi.js

import apiClient from './Api'

const BASE = '/modules/alimentacion/index.php'
const IA   = '/ia/chat.php'

export const alimentacionApi = {

  // ── Citas ─────────────────────────────────────────────────
  getCitas: () =>
    apiClient.get(BASE, { params: { accion: 'citas' } }),

  agendarCita: (data) =>
    apiClient.post(`${BASE}?accion=cita`, data),

  cancelarCita: (idCita) =>
    apiClient.put(`${BASE}?accion=cancelar`, { id_cita: idCita }),

  // ── IMC / TMB ─────────────────────────────────────────────
  getIMC: () =>
    apiClient.get(BASE, { params: { accion: 'imc' } }),

  // ── Registros diarios ─────────────────────────────────────
  getRegistros: (dias = 7) =>
    apiClient.get(BASE, { params: { accion: 'registros', dias } }),

  guardarRegistro: (data) =>
    apiClient.post(`${BASE}?accion=registro`, data),

  // ── Planes ────────────────────────────────────────────────
  getPlanes: () =>
    apiClient.get(BASE, { params: { accion: 'planes' } }),

  guardarPlan: (data) =>
    apiClient.post(`${BASE}?accion=plan`, data),

  // ── IA ────────────────────────────────────────────────────
  chat: (mensaje) =>
    apiClient.post(IA, { modulo: 'alimentacion', mensaje }),

  limpiarChat: () =>
    apiClient.post('/ia/limpiar.php', { modulo: 'alimentacion' }),
}
