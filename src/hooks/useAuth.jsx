import { useState, useEffect, createContext, useContext } from 'react'
import Cookies from 'js-cookie'
import { mockLogin } from '../utils/mockApi'
import { appConfig, securityConfig } from '../config/validation'

// Contexto de autenticação
const AuthContext = createContext()

/**
 * Hook personalizado para gerenciar autenticação
 * Fornece estado de autenticação, usuário logado e funções de login/logout
 */
export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth deve ser usado dentro de um AuthProvider')
  }
  return context
}

/**
 * Provider de autenticação
 * Gerencia o estado global de autenticação da aplicação
 */
export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [loading, setLoading] = useState(true)

  /**
   * Decodifica o token JWT (versão simplificada)
   * Em produção, use uma biblioteca como jwt-decode
   * @param {string} token - Token JWT
   * @returns {Object} Payload decodificado do token
   */
  const decodeToken = (token) => {
    try {
      const base64Url = token.split('.')[1]
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/')
      const jsonPayload = decodeURIComponent(
        atob(base64)
          .split('')
          .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
          .join('')
      )
      return JSON.parse(jsonPayload)
    } catch (error) {
      console.error('Erro ao decodificar token:', error)
      return null
    }
  }

  /**
   * Verifica se o token é válido
   * @param {Object} payload - Payload do token
   * @returns {boolean} True se o token for válido
   */
  const isTokenValid = (payload) => {
    if (!payload || !payload.exp) return false
    const currentTime = Date.now() / 1000
    return payload.exp > currentTime
  }

  /**
   * Inicializa a autenticação verificando o token armazenado
   */
  useEffect(() => {
    const initializeAuth = () => {
      try {
        const token = Cookies.get(securityConfig.cookies.name)
        
        if (token) {
          const payload = decodeToken(token)
          
          if (payload && isTokenValid(payload)) {
            setUser({
              id: payload.userId,
              email: payload.email,
              role: payload.role,
              name: payload.name
            })
            setIsAuthenticated(true)
          } else {
            // Token inválido ou expirado
            Cookies.remove(securityConfig.cookies.name)
          }
        }
      } catch (error) {
        console.error('Erro ao inicializar autenticação:', error)
        Cookies.remove(securityConfig.cookies.name)
      } finally {
        setLoading(false)
      }
    }

    initializeAuth()
  }, [])

  /**
   * Função de login
   * @param {string} email - Email do usuário
   * @param {string} password - Senha do usuário
   * @returns {Promise<Object>} Resultado do login
   */
  const login = async (email, password) => {
    try {
      setLoading(true)
      
      // Usa a API mock para demonstração
      // Em produção, substitua por chamadas reais para sua API
      const result = await mockLogin(email, password)

      if (result.success) {
        const { token, user } = result
        
        // Armazena o token em cookie seguro
        Cookies.set(securityConfig.cookies.name, token, {
          expires: appConfig.cookieExpiresDays,
          secure: securityConfig.cookies.secure,
          sameSite: securityConfig.cookies.sameSite,
          httpOnly: securityConfig.cookies.httpOnly
        })

        // Define o usuário e estado de autenticação
        setUser(user)
        setIsAuthenticated(true)

        return { success: true, user }
      } else {
        return { success: false, error: result.error }
      }
    } catch (error) {
      console.error('Erro no login:', error)
      return { success: false, error: 'Erro de conexão. Tente novamente.' }
    } finally {
      setLoading(false)
    }
  }

  /**
   * Função de logout
   * Remove o token e limpa o estado de autenticação
   */
  const logout = () => {
    Cookies.remove(securityConfig.cookies.name)
    setUser(null)
    setIsAuthenticated(false)
  }

  const value = {
    user,
    isAuthenticated,
    loading,
    login,
    logout
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}
