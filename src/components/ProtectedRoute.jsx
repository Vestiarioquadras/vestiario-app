import { Navigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'

/**
 * Componente para proteger rotas baseado no papel do usuário (RBAC)
 * @param {Object} props - Propriedades do componente
 * @param {Array} props.allowedRoles - Array de papéis permitidos para acessar a rota
 * @param {React.ReactNode} props.children - Componentes filhos a serem renderizados
 * @returns {React.ReactNode} Componente protegido ou redirecionamento
 */
const ProtectedRoute = ({ allowedRoles, children }) => {
  const { user, isAuthenticated } = useAuth()

  // Se não estiver autenticado, redireciona para login
  if (!isAuthenticated) {
    return <Navigate to="/" replace />
  }

  // Se o usuário não tiver um papel válido, redireciona para login
  if (!user || !user.role) {
    return <Navigate to="/" replace />
  }

  // Se o papel do usuário não estiver na lista de papéis permitidos
  if (!allowedRoles.includes(user.role)) {
    // Redireciona para o dashboard apropriado baseado no papel
    if (user.role === 'player') {
      return <Navigate to="/dashboard/player" replace />
    } else if (user.role === 'court_owner') {
      return <Navigate to="/dashboard/owner" replace />
    }
    return <Navigate to="/" replace />
  }

  // Se tudo estiver correto, renderiza os componentes filhos
  return children
}

export default ProtectedRoute

