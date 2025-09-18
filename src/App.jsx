import { Routes, Route, Navigate, useNavigate } from 'react-router-dom'
import { ConfigProvider, Spin } from 'antd'
import { useEffect } from 'react'
import { vestiarioTheme } from './theme/vestiarioTheme'
import { AuthProvider, useAuth } from './hooks/useAuth'
import LoginPage from './pages/LoginPage'
import RegisterPage from './pages/RegisterPage'
import ForgotPasswordPage from './pages/ForgotPasswordPage'
import ResetPasswordPage from './pages/ResetPasswordPage'
import PlayerDashboard from './pages/PlayerDashboard'
import CourtOwnerDashboard from './pages/CourtOwnerDashboard'
import ProtectedRoute from './components/ProtectedRoute'
import ErrorBoundary from './components/ErrorBoundary'
import PWAInstallPrompt from './components/PWAInstallPrompt'

// Componente interno que usa o contexto de autenticação
function AppContent() {
  const { loading, isAuthenticated, role } = useAuth();
  const navigate = useNavigate();

  // Redirecionar automaticamente quando o usuário fizer login
  useEffect(() => {
    if (!loading && isAuthenticated && role) {
      if (role === 'player') {
        navigate('/dashboard/player', { replace: true });
      } else if (role === 'owner' || role === 'court_owner') {
        navigate('/dashboard/owner', { replace: true });
      }
    }
  }, [loading, isAuthenticated, role, navigate]);

  // Mostrar loading enquanto verifica autenticação
  if (loading) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '100vh',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
      }}>
        <Spin size="large" />
      </div>
    );
  }

  return (
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
          <ProtectedRoute allowedRoles={['owner', 'court_owner']}>
            <CourtOwnerDashboard />
          </ProtectedRoute>
        }
      />

      {/* Redirecionamento inteligente baseado na role */}
      <Route 
        path="/dashboard" 
        element={
          isAuthenticated ? (
            role === 'player' ? (
              <Navigate to="/dashboard/player" replace />
            ) : (role === 'owner' || role === 'court_owner') ? (
              <Navigate to="/dashboard/owner" replace />
            ) : (
              <Navigate to="/" replace />
            )
          ) : (
            <Navigate to="/" replace />
          )
        } 
      />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

function App() {
  return (
    <ConfigProvider theme={vestiarioTheme}>
      <ErrorBoundary>
        <AuthProvider>
          <AppContent />
          
          {/* PWA Install Prompt */}
          <PWAInstallPrompt />
        </AuthProvider>
      </ErrorBoundary>
    </ConfigProvider>
  )
}

export default App
