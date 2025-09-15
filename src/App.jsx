import { Routes, Route, Navigate } from 'react-router-dom'
import { ConfigProvider } from 'antd'
import { vestiarioTheme } from './theme/vestiarioTheme'
import LoginPage from './pages/LoginPage'
import RegisterPage from './pages/RegisterPage'
import ForgotPasswordPage from './pages/ForgotPasswordPage'
import ResetPasswordPage from './pages/ResetPasswordPage'
import PlayerDashboard from './pages/PlayerDashboard'
import CourtOwnerDashboard from './pages/CourtOwnerDashboard'
import ProtectedRoute from './components/ProtectedRoute'
import ErrorBoundary from './components/ErrorBoundary'
import PWAInstallPrompt from './components/PWAInstallPrompt'

function App() {
  return (
    <ConfigProvider theme={vestiarioTheme}>
      <ErrorBoundary>
        <Routes>
          {/* Rotas públicas */}
          <Route path="/" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/forgot-password" element={<ForgotPasswordPage />} />
          <Route path="/reset-password" element={<ResetPasswordPage />} />

          {/* Rotas protegidas */}
          <Route
            path="/dashboard/player"
            element={
              <ProtectedRoute allowedRoles={['player']}>
                <PlayerDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/dashboard/owner"
            element={
              <ProtectedRoute allowedRoles={['court_owner']}>
                <CourtOwnerDashboard />
              </ProtectedRoute>
            }
          />

          {/* Redirecionamento padrão */}
          <Route path="/dashboard" element={<Navigate to="/" replace />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
        
        {/* PWA Install Prompt */}
        <PWAInstallPrompt />
      </ErrorBoundary>
    </ConfigProvider>
  )
}

export default App
