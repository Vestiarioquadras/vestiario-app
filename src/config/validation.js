/**
 * Configurações de validação e aplicação
 * Substitui o arquivo environment.js removido durante a limpeza
 */

export const validationConfig = {
  email: {
    pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  },
  password: {
    minLength: 6
  },
  name: {
    minLength: 2,
    pattern: /^[a-zA-ZÀ-ÿ\s]+$/
  }
}

export const appConfig = {
  cookieExpiresDays: 7
}

export const securityConfig = {
  cookies: {
    name: 'vestiario_token',
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    httpOnly: false // Deve ser false para cookies acessíveis via JavaScript
  }
}
