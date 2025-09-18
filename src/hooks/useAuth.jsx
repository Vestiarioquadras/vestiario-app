// 🔐 Hook de Autenticação para o Projeto Vestiário
import { useState, useEffect, useContext, createContext } from 'react';
import { onAuthStateChange, handleLogout } from '../services/authService';

// Criar Context para compartilhar estado de autenticação
const AuthContext = createContext();

// Hook para usar o contexto de autenticação
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth deve ser usado dentro de AuthProvider');
  }
  return context;
};

// Provider do contexto de autenticação
export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [role, setRole] = useState(null);
  const [userData, setUserData] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Configurar listener de estado de autenticação
    const unsubscribe = onAuthStateChange((authData) => {
      setUser(authData.user);
      setRole(authData.role);
      setUserData(authData.userData);
      setIsAuthenticated(authData.isAuthenticated);
      setLoading(false);
    });

    // Cleanup do listener
    return () => unsubscribe();
  }, []);

  // Função para verificar se usuário tem role específica
  const hasRole = (requiredRole) => {
    return role === requiredRole;
  };

  // Função para verificar se usuário é jogador
  const isPlayer = () => {
    return role === 'player';
  };

  // Função para verificar se usuário é dono
  const isOwner = () => {
    return role === 'owner' || role === 'court_owner';
  };

  // Função para verificar se usuário é admin
  const isAdmin = () => {
    return role === 'admin';
  };

  // Função para obter dados do usuário
  const getUserInfo = () => {
    return {
      uid: user?.uid,
      email: user?.email,
      name: user?.displayName || userData?.name,
      role: role,
      ...userData
    };
  };

  // Função para logout
  const logout = async () => {
    try {
      await handleLogout();
      console.log('✅ Logout realizado com sucesso');
    } catch (error) {
      console.error('❌ Erro no logout:', error);
    }
  };

  const value = {
    user,
    role,
    userData,
    isAuthenticated,
    loading,
    hasRole,
    isPlayer,
    isOwner,
    isAdmin,
    getUserInfo,
    logout
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

// Hook personalizado para gerenciar estado de autenticação
export const useAuthState = () => {
  const [authState, setAuthState] = useState({
    user: null,
    role: null,
    userData: null,
    isAuthenticated: false,
    loading: true
  });

  useEffect(() => {
    const unsubscribe = onAuthStateChange((authData) => {
      setAuthState({
        user: authData.user,
        role: authData.role,
        userData: authData.userData,
        isAuthenticated: authData.isAuthenticated,
        loading: false
      });
    });

    return () => unsubscribe();
  }, []);

  return authState;
};