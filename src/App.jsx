import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider, useAuth } from '@/context/AuthContext'
import { ThemeProvider } from '@/context/ThemeContext'
import ProtectedRoute from '@/presentacion/componentes/ProtectedRoute'
import AppLayout from '@/presentacion/componentes/layout/AppLayout'

import LoginPage              from '@/presentacion/paginas/ejercicio/LoginPage'
import RegistroPage           from '@/presentacion/paginas/ejercicio/RegistroPage'
import OnboardingPage         from '@/presentacion/paginas/ejercicio/OnboardingPage'
import CuestionarioPage       from '@/presentacion/paginas/ejercicio/CuestionarioPage'
import DashboardPage          from '@/presentacion/paginas/ejercicio/DashboardPage'
import CatalogoPage           from '@/presentacion/paginas/ejercicio/CatalogoPage'
import RutinasPage            from '@/presentacion/paginas/ejercicio/RutinasPage'
import EntrenamientoPage      from '@/presentacion/paginas/ejercicio/EntrenamientoPage'
import EstadisticasPage       from '@/presentacion/paginas/ejercicio/EstadisticasPage'
import SocialPage             from '@/presentacion/paginas/ejercicio/SocialPage'
import Clinico                from '@/presentacion/paginas/clinico/Clinico'
import Dieta                  from '@/presentacion/paginas/dieta/Dieta'
import Psicologia             from '@/presentacion/paginas/psicologia/Psicologia'

import CuestionarioClinico      from '@/presentacion/paginas/clinico/CuestionarioClinico'
import CuestionarioPsicologia   from '@/presentacion/paginas/psicologia/CuestionarioPsicologia'
import CuestionarioAlimentacion from '@/presentacion/paginas/dieta/CuestionarioAlimentacion'

function AuthRedirect() {
  const { isAuthenticated, needsOnboarding } = useAuth()
  if (!isAuthenticated)  return <Navigate to="/login"      replace />
  if (needsOnboarding)   return <Navigate to="/onboarding" replace />
  return <Navigate to="/dashboard" replace />
}

function AppRoutes() {
  return (
    <Routes>
      {/* Públicas */}
      <Route path="/login"    element={<LoginPage />} />
      <Route path="/registro" element={<RegistroPage />} />

      {/* Onboarding */}
      <Route path="/onboarding" element={
        <ProtectedRoute requireOnboarding={false}><OnboardingPage /></ProtectedRoute>
      } />

      {/* Cuestionarios */}
      <Route path="/cuestionario" element={
        <ProtectedRoute><CuestionarioPage /></ProtectedRoute>
      } />
      <Route path="/cuestionario-clinico" element={
        <ProtectedRoute><CuestionarioClinico /></ProtectedRoute>
      } />
      <Route path="/cuestionario-psicologia" element={
        <ProtectedRoute><CuestionarioPsicologia /></ProtectedRoute>
      } />
      <Route path="/cuestionario-alimentacion" element={
        <ProtectedRoute><CuestionarioAlimentacion /></ProtectedRoute>
      } />

      {/* App principal */}
      <Route path="/dashboard" element={
        <ProtectedRoute><AppLayout><DashboardPage /></AppLayout></ProtectedRoute>
      } />
      <Route path="/catalogo" element={
        <ProtectedRoute><AppLayout><CatalogoPage /></AppLayout></ProtectedRoute>
      } />
      <Route path="/rutinas" element={
        <ProtectedRoute><AppLayout><RutinasPage /></AppLayout></ProtectedRoute>
      } />
      <Route path="/entrena" element={
        <ProtectedRoute><AppLayout><EntrenamientoPage /></AppLayout></ProtectedRoute>
      } />
      <Route path="/estadisticas" element={
        <ProtectedRoute><AppLayout><EstadisticasPage /></AppLayout></ProtectedRoute>
      } />
      <Route path="/social" element={
        <ProtectedRoute><AppLayout><SocialPage /></AppLayout></ProtectedRoute>
      } />
      <Route path="/clinico" element={
        <ProtectedRoute><AppLayout><Clinico /></AppLayout></ProtectedRoute>
      } />
      <Route path="/dieta" element={
        <ProtectedRoute><AppLayout><Dieta /></AppLayout></ProtectedRoute>
      } />
      <Route path="/psicologia" element={
        <ProtectedRoute><AppLayout><Psicologia /></AppLayout></ProtectedRoute>
      } />

      <Route path="*" element={<AuthRedirect />} />
    </Routes>
  )
}

export default function App() {
  return (
    <BrowserRouter>
      <ThemeProvider>
        <AuthProvider>
          <AppRoutes />
        </AuthProvider>
      </ThemeProvider>
    </BrowserRouter>
  )
}