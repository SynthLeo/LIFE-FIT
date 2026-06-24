// infrastructure/api/psicologiaApi.js

import apiClient from './Api'

const BASE = '/modules/psicologia/index.php'
const IA   = '/ia/chat.php'

export const psicologiaApi = {

  // ── Citas ─────────────────────────────────────────────────
  getCitas: () =>
    apiClient.get(BASE, { params: { accion: 'citas' } }),

  agendarCita: (data) =>
    apiClient.post(`${BASE}?accion=cita`, data),

  cancelarCita: (idCita) =>
    apiClient.put(`${BASE}?accion=cancelar`, { id_cita: idCita }),

  // ── Estado de ánimo ───────────────────────────────────────
  getAnimos: (dias = 7) =>
    apiClient.get(BASE, { params: { accion: 'animos', dias } }),

  registrarAnimo: (data) =>
    apiClient.post(`${BASE}?accion=animo`, data),

  // ── Test PSS-10 ───────────────────────────────────────────
  getTests: () =>
    apiClient.get(BASE, { params: { accion: 'tests' } }),

  guardarTest: (respuestas) =>
    apiClient.post(`${BASE}?accion=test`, { respuestas }),

  // ── IA ────────────────────────────────────────────────────
  chat: (mensaje) =>
    apiClient.post(IA, { modulo: 'psicologia', mensaje }),

  limpiarChat: () =>
    apiClient.post('/ia/limpiar.php', { modulo: 'psicologia' }),
}
