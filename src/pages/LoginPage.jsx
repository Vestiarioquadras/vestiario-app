import { useState, useEffect } from 'react'
import {
  Card,
  Form,
  Input,
  Button,
  Typography,
  Checkbox,
  notification,
  Avatar,
  Alert,
  Divider,
  Space,
  Tooltip,
  Badge,
  Row,
  Col
} from 'antd'
import { 
  SafetyOutlined, 
  UserOutlined, 
  LockOutlined, 
  EyeInvisibleOutlined, 
  EyeTwoTone, 
  InfoCircleOutlined 
} from '@ant-design/icons'
import { useAuth } from '../hooks/useAuth'
import { useNavigate } from 'react-router-dom'
import { validationConfig } from '../config/validation'
import { handleLogin as firebaseLogin } from '../services/authService'
import PrivacyPolicyModal from '../components/PrivacyPolicyModal'
import Logo from '../components/Logo'
import useResponsive from '../hooks/useResponsive'

const { Title, Text, Link } = Typography

/**
 * Página de Login do Vestiário App
 * Implementa autenticação com validação, feedback visual e conformidade LGPD
 */
const LoginPage = () => {
  const { isAuthenticated, role, loading } = useAuth()
  const navigate = useNavigate()
  const { isMobile, isTablet, isDesktop, getConfig } = useResponsive()
  const [form] = Form.useForm()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [rememberMe, setRememberMe] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [loginAttempts, setLoginAttempts] = useState(0)
  const [isBlocked, setIsBlocked] = useState(false)
  const [privacyModalOpen, setPrivacyModalOpen] = useState(false)

  /**
   * Validação de email usando regex
   */
  const validateEmail = (_, value) => {
    if (!value) {
      return Promise.reject(new Error('Por favor, insira seu email!'))
    }
    if (!validationConfig.email.pattern.test(value)) {
      return Promise.reject(new Error('Por favor, insira um email válido!'))
    }
    return Promise.resolve()
  }

  /**
   * Validação de senha
   */
  const validatePassword = (_, value) => {
    if (!value) {
      return Promise.reject(new Error('Por favor, insira sua senha!'))
    }
    if (value.length < validationConfig.password.minLength) {
      return Promise.reject(new Error(`A senha deve ter pelo menos ${validationConfig.password.minLength} caracteres!`))
    }
    return Promise.resolve()
  }

  /**
   * Validação do consentimento LGPD
   */
  const validateLGPD = (_, value) => {
    if (!value) {
      return Promise.reject(new Error('Você deve concordar com a Política de Privacidade!'))
    }
    return Promise.resolve()
  }

  /**
   * Verifica se o usuário está bloqueado
   */
  useEffect(() => {
    const attempts = localStorage.getItem('loginAttempts')
    const lastAttempt = localStorage.getItem('lastLoginAttempt')
    
    if (attempts && lastAttempt) {
      const attemptsCount = parseInt(attempts)
      const timeDiff = Date.now() - parseInt(lastAttempt)
      
      if (attemptsCount >= 5 && timeDiff < 15 * 60 * 1000) { // 15 minutos
        setIsBlocked(true)
        setError('Muitas tentativas de login. Tente novamente em 15 minutos.')
      } else if (timeDiff >= 15 * 60 * 1000) {
        // Reset após 15 minutos
        localStorage.removeItem('loginAttempts')
        localStorage.removeItem('lastLoginAttempt')
      }
    }
  }, [])

  /**
   * Manipulador do envio do formulário
   * Implementa validação, autenticação e tratamento de erros
   */
  const handleLoginSubmit = async (values) => {
    try {
      if (isBlocked) {
        setError('Conta temporariamente bloqueada. Tente novamente mais tarde.')
        return
      }

      setIsSubmitting(true)
      setError('')

      // Simula delay de rede para feedback visual
      await new Promise(resolve => setTimeout(resolve, 1000))

      // Chama a função de login do Firebase
      const result = await firebaseLogin(values.email, values.password)
      
      if (result.success) {
        // Reset tentativas de login
        localStorage.removeItem('loginAttempts')
        localStorage.removeItem('lastLoginAttempt')
        
        // Salvar "lembrar de mim"
        if (rememberMe) {
          localStorage.setItem('rememberedEmail', values.email)
        }
        
        // Notificação de sucesso
        notification.success({
          message: 'Login realizado com sucesso!',
          description: `Bem-vindo, ${result.userData?.name || result.user.email}!`,
          placement: 'topRight',
          duration: 3
        })
        
        // O redirecionamento será feito automaticamente pelo App.jsx
        // quando o estado de autenticação for atualizado
      } else {
        // Incrementar tentativas de login
        const newAttempts = loginAttempts + 1
        setLoginAttempts(newAttempts)
        localStorage.setItem('loginAttempts', newAttempts.toString())
        localStorage.setItem('lastLoginAttempt', Date.now().toString())
        
        if (newAttempts >= 5) {
          setIsBlocked(true)
          setError('Muitas tentativas de login. Conta bloqueada por 15 minutos.')
        } else {
          setError(result.error || 'Credenciais inválidas. Verifique seu email e senha.')
        }
      }
      
    } catch (err) {
      console.error('Erro no login:', err)
      setError('Erro ao fazer login. Tente novamente.')
    } finally {
      setIsSubmitting(false)
    }
  }

  // Configurações responsivas melhoradas
  const containerStyle = {
    minHeight: '100vh',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    padding: isMobile ? '16px' : isTablet ? '20px' : '24px',
    position: 'relative',
    overflow: 'hidden'
  }

  // Efeito de partículas no fundo
  const backgroundStyle = {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: `
      radial-gradient(circle at 20% 80%, rgba(255, 94, 14, 0.1) 0%, transparent 50%),
      radial-gradient(circle at 80% 20%, rgba(255, 94, 14, 0.1) 0%, transparent 50%),
      radial-gradient(circle at 40% 40%, rgba(255, 94, 14, 0.05) 0%, transparent 50%)
    `,
    zIndex: 1
  }

  const cardStyle = {
    width: '100%',
    maxWidth: isMobile ? '100%' : isTablet ? '450px' : '500px',
    boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
    borderRadius: '20px',
    border: '1px solid rgba(255, 255, 255, 0.1)',
    backdropFilter: 'blur(10px)',
    background: 'rgba(255, 255, 255, 0.95)',
    position: 'relative',
    zIndex: 2
  }

  const cardBodyStyle = {
    padding: isMobile ? '32px 24px' : isTablet ? '40px 32px' : '48px 40px'
  }

  return (
    <div style={containerStyle}>
      {/* Efeito de fundo */}
      <div style={backgroundStyle} />
      
      <Card
        style={cardStyle}
        styles={{ body: cardBodyStyle }}
      >
        {/* Logo e Título */}
        <div style={{ 
          textAlign: 'center', 
          marginBottom: isMobile ? '24px' : '32px' 
        }}>
          <Logo 
            size={isMobile ? "small" : "medium"} 
            style={{ marginBottom: isMobile ? '12px' : '16px' }}
          />
          <Title 
            level={isMobile ? 3 : 2} 
            style={{ 
              margin: 0, 
              color: '#ff5e0e',
              fontWeight: 'bold',
              fontSize: isMobile ? '20px' : isTablet ? '24px' : '28px'
            }}
          >
            Vestiário App
          </Title>
          <Text 
            type="secondary"
            style={{ 
              fontSize: isMobile ? '14px' : '16px' 
            }}
          >
            Faça login para acessar sua conta
          </Text>
        </div>

        {/* Mensagem de erro */}
        {error && (
          <Alert
            message={error}
            type="error"
            showIcon
            style={{ marginBottom: '24px' }}
          />
        )}

        {/* Formulário de Login */}
        <Form
          form={form}
          name="login"
          onFinish={handleLoginSubmit}
          layout="vertical"
          size="large"
        >
          <Form.Item
            name="email"
            label="Email"
            rules={[{ validator: validateEmail }]}
          >
            <Input
              prefix={<UserOutlined />}
              placeholder="Digite seu email"
              autoComplete="email"
            />
          </Form.Item>

          <Form.Item
            name="password"
            label="Senha"
            rules={[{ validator: validatePassword }]}
          >
            <Input.Password
              prefix={<LockOutlined />}
              placeholder="Digite sua senha"
              autoComplete="current-password"
              iconRender={(visible) => (visible ? <EyeTwoTone /> : <EyeInvisibleOutlined />)}
              visibilityToggle={{
                visible: showPassword,
                onVisibleChange: setShowPassword
              }}
            />
          </Form.Item>

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <Checkbox 
              checked={rememberMe}
              onChange={(e) => setRememberMe(e.target.checked)}
            >
              Lembrar de mim
            </Checkbox>
            <Link onClick={() => navigate('/forgot-password')}>
              Esqueci minha senha
            </Link>
          </div>

          <Form.Item
            name="lgpdConsent"
            valuePropName="checked"
            rules={[{ validator: validateLGPD }]}
          >
            <Checkbox>
              Eu concordo com a{' '}
              <Link 
                onClick={() => setPrivacyModalOpen(true)}
                style={{ color: '#ff5e0e' }}
              >
                Política de Privacidade
              </Link>
            </Checkbox>
          </Form.Item>

          <Form.Item style={{ marginBottom: '20px' }}>
            <Button
              type="primary"
              htmlType="submit"
              block
              loading={isSubmitting || loading}
              disabled={isBlocked}
              icon={!isSubmitting && !loading ? <UserOutlined /> : null}
              style={{ 
                height: '52px',
                fontSize: '16px',
                fontWeight: '600',
                background: 'linear-gradient(135deg, #ff5e0e 0%, #ff8c42 100%)',
                border: 'none',
                borderRadius: '12px',
                boxShadow: '0 4px 12px rgba(255, 94, 14, 0.3)',
                transition: 'all 0.2s cubic-bezier(0.645, 0.045, 0.355, 1)'
              }}
              onMouseEnter={(e) => {
                e.target.style.transform = 'translateY(-2px)'
                e.target.style.boxShadow = '0 6px 16px rgba(255, 94, 14, 0.4)'
              }}
              onMouseLeave={(e) => {
                e.target.style.transform = 'translateY(0)'
                e.target.style.boxShadow = '0 4px 12px rgba(255, 94, 14, 0.3)'
              }}
            >
              {isSubmitting ? 'Entrando...' : isBlocked ? 'Conta Bloqueada' : 'Entrar'}
            </Button>
          </Form.Item>
        </Form>

        <Divider />

        {/* Links adicionais */}
        <div style={{ textAlign: 'center' }}>
          <Space direction="vertical" size="small">
            <Link onClick={() => navigate('/forgot-password')}>
              Esqueci minha senha
            </Link>
            <Text type="secondary" style={{ fontSize: '12px' }}>
              Não tem uma conta?{' '}
              <Link onClick={() => navigate('/register')}>
                Cadastre-se aqui
              </Link>
            </Text>
          </Space>
        </div>

        {/* Informações de teste */}
        <div style={{ 
          marginTop: '32px', 
          padding: '20px', 
          background: 'linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%)', 
          borderRadius: '16px',
          border: '1px solid #e2e8f0',
          boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', marginBottom: '16px' }}>
            <InfoCircleOutlined style={{ color: '#ff5e0e', marginRight: '8px', fontSize: '16px' }} />
            <Text strong style={{ color: '#ff5e0e', fontSize: '14px' }}>Credenciais de Teste</Text>
          </div>
          
          <Space direction="vertical" size="small" style={{ width: '100%' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div>
                <Badge color="blue" text="Jogador" />
                <Text code style={{ marginLeft: '8px' }}>jogador@vestiario.com</Text>
              </div>
              <Tooltip title="Clique para preencher automaticamente">
                <Button 
                  size="small" 
                  type="link"
                  style={{
                    color: '#ff5e0e',
                    fontWeight: '500',
                    padding: '4px 8px',
                    borderRadius: '6px',
                    transition: 'all 0.2s ease'
                  }}
                  onClick={() => {
                    form.setFieldsValue({
                      email: 'jogador@vestiario.com',
                      password: '123456'
                    })
                  }}
                >
                  Usar
                </Button>
              </Tooltip>
            </div>
            
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div>
                <Badge color="green" text="Dono de Quadra" />
                <Text code style={{ marginLeft: '8px' }}>dono@vestiario.com</Text>
              </div>
              <Tooltip title="Clique para preencher automaticamente">
                <Button 
                  size="small" 
                  type="link"
                  style={{
                    color: '#ff5e0e',
                    fontWeight: '500',
                    padding: '4px 8px',
                    borderRadius: '6px',
                    transition: 'all 0.2s ease'
                  }}
                  onClick={() => {
                    form.setFieldsValue({
                      email: 'dono@vestiario.com',
                      password: '123456'
                    })
                  }}
                >
                  Usar
                </Button>
              </Tooltip>
            </div>
          </Space>
          
          <div style={{ marginTop: '8px', fontSize: '11px', color: '#666' }}>
            <Text type="secondary">Senha para ambos: 123456</Text>
          </div>
        </div>
      </Card>

      {/* Modal da Política de Privacidade */}
      <PrivacyPolicyModal 
        open={privacyModalOpen}
        onCancel={() => setPrivacyModalOpen(false)}
      />
    </div>
  )
}

export default LoginPage