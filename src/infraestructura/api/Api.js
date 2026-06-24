// src/infraestructura/api/Api.js
// Cliente Axios para los módulos nuevos — usa el mismo JWT que lib/api.js

import axios from 'axios'

const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  headers: { 'Content-Type': 'application/json' },
  timeout: 15_000,
})

// ── Request: adjuntar JWT igual que lib/api.js ────────────────
apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('jwt_token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`

    // Extraer id_usuario del payload JWT para endpoints que lo necesiten
    // en query params (GET) o body (POST/PUT)
    try {
      const payload = JSON.parse(atob(token.split('.')[1]))
      const idUsuario = payload.id_usuario ?? payload.sub ?? null
      if (idUsuario) {
        if (config.method === 'get') {
          config.params = { ...config.params, id_usuario: idUsuario }
        } else {
          // Solo añadir si no viene ya en el body
          if (config.data && typeof config.data === 'object') {
            config.data = { id_usuario: idUsuario, ...config.data }
          }
        }
      }
    } catch (_) {
      // Token malformado — el backend responderá 401
    }
  }
  return config
})

// ── Response: manejo global de errores ───────────────────────
apiClient.interceptors.response.use(
  (res) => res.data,   // Igual que lib/api.js devuelve res, aquí devolvemos res.data
  (err) => {
    if (err.response?.status === 401) {
      localStorage.removeItem('jwt_token')
      window.location.href = '/login'
    }
    const msg = err.response?.data?.error ?? 'Error de conexión con el servidor.'
    return Promise.reject(new Error(msg))
  }
)

export default apiClient
