import { useState } from 'react'
import {
  Card,
  Form,
  Input,
  Button,
  Typography,
  Checkbox,
  Select,
  Row,
  Col,
  Avatar,
  Alert,
  Divider,
  Tooltip,
  Progress
} from 'antd'
import { 
  InfoCircleOutlined, 
  UserOutlined, 
  MailOutlined, 
  PhoneOutlined, 
  LockOutlined 
} from '@ant-design/icons'
import { useNavigate } from 'react-router-dom'
import { validationConfig } from '../config/validation'
import { mockRegister } from '../utils/mockApi'
import Logo from '../components/Logo'
import { vestiarioGradients, vestiarioStyles } from '../theme/vestiarioTheme'
import PrivacyPolicyModal from '../components/PrivacyPolicyModal'

const { Title, Text, Link } = Typography
const { Option } = Select

/**
 * Página de Cadastro do Vestiário App
 * Permite que novos usuários se cadastrem no sistema
 */
const RegisterPage = () => {
  const navigate = useNavigate()
  const [form] = Form.useForm()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  const [currentStep, setCurrentStep] = useState(0)
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
   * Calcula a força da senha
   */
  const calculatePasswordStrength = (password) => {
    let strength = 0
    if (password.length >= 6) strength += 20
    if (password.length >= 8) strength += 20
    if (/[a-z]/.test(password)) strength += 20
    if (/[A-Z]/.test(password)) strength += 20
    if (/[0-9]/.test(password)) strength += 10
    if (/[^A-Za-z0-9]/.test(password)) strength += 10
    return strength
  }


  /**
   * Validação de senha
   */
  const validatePassword = (_, value) => {
    if (!value) {
      return Promise.reject(new Error('Por favor, insira sua senha!'))
    }
    
    // Remove espaços em branco
    const cleanValue = value.trim()
    if (cleanValue !== value) {
      return Promise.reject(new Error('A senha não pode conter espaços em branco!'))
    }
    
    if (value.length < validationConfig.password.minLength) {
      return Promise.reject(new Error(`A senha deve ter pelo menos ${validationConfig.password.minLength} caracteres!`))
    }
    
    // Verifica caracteres problemáticos
    if (/[\s\t\n\r]/.test(value)) {
      return Promise.reject(new Error('A senha não pode conter espaços ou quebras de linha!'))
    }
    
    return Promise.resolve()
  }


  /**
   * Validação do nome
   */
  const validateName = (_, value) => {
    if (!value) {
      return Promise.reject(new Error('Por favor, insira seu nome!'))
    }
    if (value.length < validationConfig.name.minLength) {
      return Promise.reject(new Error(`O nome deve ter pelo menos ${validationConfig.name.minLength} caracteres!`))
    }
    if (!validationConfig.name.pattern.test(value)) {
      return Promise.reject(new Error('O nome deve conter apenas letras e espaços!'))
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
   * Manipulador do envio do formulário
   */
  const handleRegister = async (values) => {
    try {
      setIsSubmitting(true)
      setError('')
      setSuccess(false)

      // Simula delay de rede
      await new Promise(resolve => setTimeout(resolve, 1500))

      // Chama a função mock de registro
      const result = await mockRegister(values)
      
      if (result.success) {
        setSuccess(true)
        
        // Notificação de sucesso
        notification.success({
          message: 'Conta criada com sucesso!',
          description: `Bem-vindo ao Vestiário, ${result.user.name}!`,
          placement: 'topRight',
          duration: 4
        })
        
        // Redireciona para login após 2 segundos
        setTimeout(() => {
          navigate('/')
        }, 2000)
      } else {
        setError(result.error || 'Erro ao realizar cadastro. Tente novamente.')
        
        // Notificação de erro
        notification.error({
          message: 'Erro no cadastro',
          description: result.error || 'Erro ao realizar cadastro. Tente novamente.',
          placement: 'topRight',
          duration: 5
        })
      }
      
    } catch (err) {
      console.error('Erro no cadastro:', err)
      setError('Erro ao realizar cadastro. Tente novamente.')
      
      notification.error({
        message: 'Erro no cadastro',
        description: 'Erro ao realizar cadastro. Tente novamente.',
        placement: 'topRight',
        duration: 5
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  if (success) {
    return (
      <div style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        padding: '20px'
      }}>
        <Card
          style={{
            width: '100%',
            maxWidth: 400,
            boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)',
            borderRadius: '12px',
            textAlign: 'center'
          }}
          styles={{ body: { padding: '40px 32px' } }}
        >
          <Avatar
            size={64}
            icon={<SafetyOutlined />}
            style={{
              backgroundColor: '#52c41a',
              marginBottom: '16px'
            }}
          />
          <Title level={3} style={{ color: '#52c41a', marginBottom: '16px' }}>
            Cadastro Realizado!
          </Title>
          <Text>
            Seu cadastro foi realizado com sucesso. Você será redirecionado para a página de login.
          </Text>
        </Card>
      </div>
    )
  }

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: vestiarioGradients.primary,
      padding: '20px'
    }}>
      <Card
        style={{
          width: '100%',
          maxWidth: 500,
          ...vestiarioStyles.card,
          background: 'rgba(255, 255, 255, 0.95)',
          backdropFilter: 'blur(10px)',
        }}
        styles={{ body: { padding: '40px 32px' } }}
      >
        {/* Logo e Título */}
        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          <Logo 
            size="large" 
            style={{ 
              marginBottom: '20px',
              ...vestiarioStyles.logo
            }} 
          />
          <Title level={3} style={{ 
            color: '#ff5e0e', 
            marginBottom: '8px',
            fontWeight: 600
          }}>
            Crie sua conta
          </Title>
          <Text type="secondary" style={{ fontSize: '16px' }}>
            Junte-se à comunidade esportiva
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

        {/* Formulário de Cadastro */}
        <Form
          form={form}
          name="register"
          onFinish={handleRegister}
          layout="vertical"
          size="large"
        >
          <Row gutter={16}>
            <Col span={24}>
              <Form.Item
                name="name"
                label="Nome Completo"
                rules={[{ validator: validateName }]}
              >
                <Input
                  prefix={<UserOutlined />}
                  placeholder="Digite seu nome completo"
                />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="email"
                label="Email"
                rules={[{ validator: validateEmail }]}
              >
                <Input
                  prefix={<MailOutlined />}
                  placeholder="Digite seu email"
                  type="email"
                />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="phone"
                label="Telefone"
                rules={[{ required: true, message: 'Por favor, insira seu telefone!' }]}
              >
                <Input
                  prefix={<PhoneOutlined />}
                  placeholder="(11) 99999-9999"
                />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={12}>
          <Form.Item
            name="role"
            label={
              <span>
                Tipo de Usuário
                <Tooltip title="Escolha se você é um jogador que quer reservar quadras ou um dono de estabelecimento">
                  <InfoCircleOutlined style={{ marginLeft: '4px', color: '#ff5e0e' }} />
                </Tooltip>
              </span>
            }
            rules={[{ required: true, message: 'Por favor, selecione o tipo de usuário!' }]}
          >
            <Select placeholder="Selecione seu tipo">
              <Option value="player">🏃‍♂️ Jogador</Option>
              <Option value="court_owner">🏢 Dono de Quadra/Estabelecimento</Option>
            </Select>
          </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="team"
                label="Equipe (se jogador)"
                dependencies={['role']}
              >
                <Select placeholder="Selecione sua equipe" disabled={form.getFieldValue('role') !== 'player'}>
                  <Option value="flamengo">Flamengo</Option>
                  <Option value="corinthians">Corinthians</Option>
                  <Option value="palmeiras">Palmeiras</Option>
                  <Option value="santos">Santos</Option>
                  <Option value="outra">Outra</Option>
                </Select>
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={12}>
          <Form.Item
            name="password"
            label="Senha"
            rules={[{ validator: validatePassword }]}
          >
            <Input.Password
              prefix={<LockOutlined />}
              placeholder="Digite sua senha"
              autoComplete="new-password"
            />
          </Form.Item>
          
          <Form.Item
            dependencies={['password']}
            style={{ marginTop: '-16px', marginBottom: '16px' }}
          >
            {({ getFieldValue }) => {
              const password = getFieldValue('password') || ''
              const strength = calculatePasswordStrength(password)
              
              if (strength > 0) {
                return (
                  <div style={{ marginTop: '8px' }}>
                    <Progress
                      percent={strength}
                      size="small"
                      status={strength < 40 ? 'exception' : strength < 70 ? 'active' : 'success'}
                      format={(percent) => {
                        if (percent < 40) return 'Fraca'
                        if (percent < 70) return 'Média'
                        return 'Forte'
                      }}
                    />
                  </div>
                )
              }
              return null
            }}
          </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="confirmPassword"
                label="Confirmar Senha"
                dependencies={['password']}
                rules={[
                  { required: true, message: 'Por favor, confirme sua senha!' },
                  ({ getFieldValue }) => ({
                    validator(_, value) {
                      if (!value || getFieldValue('password') === value) {
                        return Promise.resolve()
                      }
                      return Promise.reject(new Error('As senhas não coincidem!'))
                    },
                  }),
                ]}
              >
                <Input.Password
                  prefix={<LockOutlined />}
                  placeholder="Confirme sua senha"
                  autoComplete="new-password"
                />
              </Form.Item>
            </Col>
          </Row>

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

          <Form.Item style={{ marginBottom: '16px' }}>
            <Button
              type="primary"
              htmlType="submit"
              block
              loading={isSubmitting}
              icon={!isSubmitting ? <UserOutlined /> : null}
              style={{ 
                height: '48px',
                fontSize: '16px',
                fontWeight: '600',
                background: vestiarioGradients.primary,
                border: 'none',
                boxShadow: '0 4px 12px rgba(255, 94, 13, 0.3)',
                ...vestiarioStyles.button
              }}
            >
              {isSubmitting ? 'Cadastrando...' : 'Cadastrar'}
            </Button>
          </Form.Item>
        </Form>

        <Divider />

        {/* Links adicionais */}
        <div style={{ textAlign: 'center' }}>
          <Text type="secondary">
            Já tem uma conta?{' '}
            <Link onClick={() => navigate('/')}>
              Faça login aqui
            </Link>
          </Text>
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

export default RegisterPage
