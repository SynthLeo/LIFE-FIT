// infrastructure/api/clinicoApi.js

import apiClient from './Api'

const BASE = '/modules/clinico/index.php'
const IA   = '/ia/chat.php'

export const clinicoApi = {

  // ── Citas ─────────────────────────────────────────────────
  getCitas: () =>
    apiClient.get(BASE, { params: { accion: 'citas' } }),

  agendarCita: (data) =>
    apiClient.post(`${BASE}?accion=cita`, data),

  cancelarCita: (idCita) =>
    apiClient.put(`${BASE}?accion=cancelar`, { id_cita: idCita }),

  // ── Signos vitales ────────────────────────────────────────
  getSignos: (dias = 30) =>
    apiClient.get(BASE, { params: { accion: 'signos', dias } }),

  registrarSignos: (data) =>
    apiClient.post(`${BASE}?accion=signos`, data),

  // ── Síntomas ──────────────────────────────────────────────
  getEvaluaciones: () =>
    apiClient.get(BASE, { params: { accion: 'evaluaciones' } }),

  evaluarSintomas: (data) =>
    apiClient.post(`${BASE}?accion=sintomas`, data),

  // ── IA ────────────────────────────────────────────────────
  chat: (mensaje) =>
    apiClient.post(IA, { modulo: 'clinico', mensaje }),

  limpiarChat: () =>
    apiClient.post('/ia/limpiar.php', { modulo: 'clinico' }),
}
