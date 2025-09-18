import { Navigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'

/**
 * Componente para proteger rotas baseado no papel do usuário (RBAC)
 * Integrado com Firebase Auth e Firestore
 * @param {Object} props - Propriedades do componente
 * @param {Array} props.allowedRoles - Array de papéis permitidos para acessar a rota
 * @param {React.ReactNode} props.children - Componentes filhos a serem renderizados
 * @returns {React.ReactNode} Componente protegido ou redirecionamento
 */
const ProtectedRoute = ({ allowedRoles, children }) => {
  const { user, role, isAuthenticated, loading } = useAuth()

  // Mostrar loading enquanto verifica autenticação
  if (loading) {
    return null; // O loading é mostrado no App.jsx
  }

  // Se não estiver autenticado, redireciona para login
  if (!isAuthenticated || !user) {
    return <Navigate to="/" replace />
  }

  // Se o usuário não tiver um papel válido, redireciona para login
  if (!role) {
    return <Navigate to="/" replace />
  }

  // Se o papel do usuário não estiver na lista de papéis permitidos
  if (!allowedRoles.includes(role)) {
    // Redireciona para o dashboard apropriado baseado no papel
    if (role === 'player') {
      return <Navigate to="/dashboard/player" replace />
    } else if (role === 'owner' || role === 'court_owner') {
      return <Navigate to="/dashboard/owner" replace />
    }
    return <Navigate to="/" replace />
  }

  // Se tudo estiver correto, renderiza os componentes filhos
  return children
}

export default ProtectedRoute

