import { createContext, useContext, useState, useCallback } from 'react'
import api from '@/lib/api'

const AuthContext = createContext(null)

function parseToken(token) {
  try {
    const payload = JSON.parse(atob(token.split('.')[1]))
    return payload
  } catch {
    return null
  }
}

export function AuthProvider({ children }) {
  const [token, setToken] = useState(() => localStorage.getItem('jwt_token'))
  const [user, setUser] = useState(() => {
    const t = localStorage.getItem('jwt_token')
    return t ? parseToken(t) : null
  })

  const login = useCallback(async (email, password) => {
    const { data } = await api.post('/Auth/Login.php', { email, password })
    localStorage.setItem('jwt_token', data.token)
    const payload = parseToken(data.token)
    setToken(data.token)
    setUser(payload)
    return payload
  }, [])

  const register = useCallback(async (nombre, email, password, password2) => {
    const { data } = await api.post('/Auth/Registro.php', { nombre, email, password, password2 })
    localStorage.setItem('jwt_token', data.token)
    const payload = parseToken(data.token)
    setToken(data.token)
    setUser(payload)
    return payload
  }, [])

  const logout = useCallback(() => {
    localStorage.removeItem('jwt_token')
    setToken(null)
    setUser(null)
  }, [])

  // Actualiza onboarding_completo localmente después del cuestionario
  const completeOnboarding = useCallback(() => {
    setUser(prev => prev ? { ...prev, onboarding_completo: 1 } : prev)
  }, [])

  const isAuthenticated = !!token
  const needsOnboarding = isAuthenticated && user?.onboarding_completo === 0

  return (
    <AuthContext.Provider value={{
      user, token, isAuthenticated, needsOnboarding,
      login, register, logout, completeOnboarding,
    }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be inside AuthProvider')
  return ctx
}
