import { Navigate } from 'react-router-dom'
import { useAuth } from '@/context/AuthContext'

/**
 * Protege rutas que requieren sesión.
 * Si needsOnboarding y la ruta no es /onboarding, redirige.
 */
export default function ProtectedRoute({ children, requireOnboarding = true }) {
  const { isAuthenticated, needsOnboarding } = useAuth()

  if (!isAuthenticated) return <Navigate to="/login" replace />
  if (needsOnboarding && requireOnboarding) return <Navigate to="/onboarding" replace />

  return children
}
