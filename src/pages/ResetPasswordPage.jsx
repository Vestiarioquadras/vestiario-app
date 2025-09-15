import { useState } from 'react'
import {
  Card,
  Form,
  Input,
  Button,
  Typography,
  Alert,
  Avatar,
  Divider
} from 'antd'
import { LockOutlined, ArrowLeftOutlined } from '@ant-design/icons'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { validationConfig } from '../config/validation'
import { mockResetPassword } from '../utils/mockApi'

const { Title, Text, Link } = Typography

/**
 * Página de Redefinição de Senha do Vestiário App
 * Permite que usuários redefinam sua senha usando um token
 */
const ResetPasswordPage = () => {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const [form] = Form.useForm()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  
  const token = searchParams.get('token')

  /**
   * Validação de senha
   */
  const validatePassword = (_, value) => {
    if (!value) {
      return Promise.reject(new Error('Por favor, insira sua nova senha!'))
    }
    if (value.length < validationConfig.password.minLength) {
      return Promise.reject(new Error(`A senha deve ter pelo menos ${validationConfig.password.minLength} caracteres!`))
    }
    return Promise.resolve()
  }

  /**
   * Validação de confirmação de senha
   */
  const validateConfirmPassword = (_, value) => {
    if (!value) {
      return Promise.reject(new Error('Por favor, confirme sua nova senha!'))
    }
    if (value !== form.getFieldValue('password')) {
      return Promise.reject(new Error('As senhas não coincidem!'))
    }
    return Promise.resolve()
  }

  /**
   * Manipulador do envio do formulário
   */
  const handleResetPassword = async (values) => {
    try {
      setIsSubmitting(true)
      setError('')

      // Chama a função mock de redefinição de senha
      const result = await mockResetPassword(token, values.password)
      
      if (result.success) {
        setSuccess(true)
        
        // Redireciona para login após 3 segundos
        setTimeout(() => {
          navigate('/')
        }, 3000)
      } else {
        setError(result.error || 'Erro ao redefinir senha. Tente novamente.')
      }
      
    } catch (err) {
      console.error('Erro na redefinição:', err)
      setError('Erro ao redefinir senha. Tente novamente.')
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
            Senha Redefinida!
          </Title>
          <Text style={{ marginBottom: '24px', display: 'block' }}>
            Sua senha foi redefinida com sucesso. Você será redirecionado para a página de login.
          </Text>
          <Button 
            type="primary" 
            onClick={() => navigate('/')}
            icon={<ArrowLeftOutlined />}
          >
            Ir para Login
          </Button>
        </Card>
      </div>
    )
  }

  if (!token) {
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
              backgroundColor: '#ff4d4f',
              marginBottom: '16px'
            }}
          />
          <Title level={3} style={{ color: '#ff4d4f', marginBottom: '16px' }}>
            Link Inválido
          </Title>
          <Text style={{ marginBottom: '24px', display: 'block' }}>
            O link de recuperação é inválido ou expirou. Solicite um novo link.
          </Text>
          <Button 
            type="primary" 
            onClick={() => navigate('/forgot-password')}
          >
            Solicitar Novo Link
          </Button>
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
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      padding: '20px'
    }}>
      <Card
        style={{
          width: '100%',
          maxWidth: 400,
          boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)',
          borderRadius: '12px'
        }}
        styles={{ body: { padding: '40px 32px' } }}
      >
        {/* Logo e Título */}
        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          <Avatar
            size={64}
            icon={<SafetyOutlined />}
            style={{
              backgroundColor: '#1890ff',
              marginBottom: '16px'
            }}
          />
          <Title level={2} style={{ margin: 0, color: '#ff5e0e' }}>
            Redefinir Senha
          </Title>
          <Text type="secondary">
            Digite sua nova senha
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

        {/* Formulário de Redefinição */}
        <Form
          form={form}
          name="resetPassword"
          onFinish={handleResetPassword}
          layout="vertical"
          size="large"
        >
          <Form.Item
            name="password"
            label="Nova Senha"
            rules={[{ validator: validatePassword }]}
          >
            <Input.Password
              prefix={<LockOutlined />}
              placeholder="Digite sua nova senha"
            />
          </Form.Item>

          <Form.Item
            name="confirmPassword"
            label="Confirmar Nova Senha"
            rules={[{ validator: validateConfirmPassword }]}
          >
            <Input.Password
              prefix={<LockOutlined />}
              placeholder="Confirme sua nova senha"
            />
          </Form.Item>

          <Form.Item style={{ marginBottom: '16px' }}>
            <Button
              type="primary"
              htmlType="submit"
              block
              loading={isSubmitting}
              icon={!isSubmitting ? <LockOutlined /> : null}
              style={{ height: '48px' }}
            >
              {isSubmitting ? 'Redefinindo...' : 'Redefinir Senha'}
            </Button>
          </Form.Item>
        </Form>

        <Divider />

        {/* Links adicionais */}
        <div style={{ textAlign: 'center' }}>
          <Link onClick={() => navigate('/')}>
            <ArrowLeftOutlined /> Voltar ao Login
          </Link>
        </div>

        {/* Informações adicionais */}
        <div style={{ 
          marginTop: '24px', 
          padding: '16px', 
          background: '#f5f5f5', 
          borderRadius: '8px',
          fontSize: '12px'
        }}>
          <Text strong>Dicas para uma senha segura:</Text>
          <br />
          <Text>• Use pelo menos 6 caracteres</Text>
          <br />
          <Text>• Combine letras, números e símbolos</Text>
          <br />
          <Text>• Evite informações pessoais</Text>
        </div>
      </Card>
    </div>
  )
}

export default ResetPasswordPage


