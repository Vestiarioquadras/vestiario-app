import { useState } from 'react'
import {
  Card,
  Form,
  Input,
  Button,
  Typography,
  Space,
  Alert,
  Avatar,
  Divider
} from 'antd'
import { MailOutlined, ArrowLeftOutlined, SafetyOutlined } from '@ant-design/icons'
import { useNavigate } from 'react-router-dom'
import { validationConfig } from '../config/validation'
import { mockForgotPassword } from '../utils/mockApi'

const { Title, Text, Link } = Typography

/**
 * Página de Recuperação de Senha do Vestiário App
 * Permite que usuários solicitem redefinição de senha
 */
const ForgotPasswordPage = () => {
  const navigate = useNavigate()
  const [form] = Form.useForm()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)

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
   * Manipulador do envio do formulário
   */
  const handleForgotPassword = async (values) => {
    try {
      setIsSubmitting(true)
      setError('')

      // Chama a função mock de recuperação de senha
      const result = await mockForgotPassword(values.email)
      
      if (result.success) {
        setSuccess(true)
      } else {
        setError(result.error || 'Erro ao enviar email de recuperação. Tente novamente.')
      }
      
    } catch (err) {
      console.error('Erro na recuperação:', err)
      setError('Erro ao enviar email de recuperação. Tente novamente.')
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
            icon={<MailOutlined />}
            style={{
              backgroundColor: '#52c41a',
              marginBottom: '16px'
            }}
          />
          <Title level={3} style={{ color: '#52c41a', marginBottom: '16px' }}>
            Email Enviado!
          </Title>
          <Text style={{ marginBottom: '24px', display: 'block' }}>
            Enviamos um link de recuperação para seu email. 
            Verifique sua caixa de entrada e siga as instruções.
          </Text>
          <div style={{ marginBottom: '16px' }}>
            <Text type="secondary" style={{ fontSize: '12px' }}>
              Para teste, você pode usar este link:
            </Text>
            <br />
            <Link onClick={() => navigate('/reset-password?token=valid-token')}>
              🔗 Link de Redefinição (Teste)
            </Link>
          </div>
          <Button 
            type="primary" 
            onClick={() => navigate('/')}
            icon={<ArrowLeftOutlined />}
          >
            Voltar ao Login
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
            Recuperar Senha
          </Title>
          <Text type="secondary">
            Digite seu email para receber um link de recuperação
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

        {/* Formulário de Recuperação */}
        <Form
          form={form}
          name="forgotPassword"
          onFinish={handleForgotPassword}
          layout="vertical"
          size="large"
        >
          <Form.Item
            name="email"
            label="Email"
            rules={[{ validator: validateEmail }]}
          >
            <Input
              prefix={<MailOutlined />}
              placeholder="Digite seu email cadastrado"
              type="email"
            />
          </Form.Item>

          <Form.Item style={{ marginBottom: '16px' }}>
            <Button
              type="primary"
              htmlType="submit"
              block
              loading={isSubmitting}
              icon={!isSubmitting ? <MailOutlined /> : null}
              style={{ height: '48px' }}
            >
              {isSubmitting ? 'Enviando...' : 'Enviar Link de Recuperação'}
            </Button>
          </Form.Item>
        </Form>

        <Divider />

        {/* Links adicionais */}
        <div style={{ textAlign: 'center' }}>
          <Space direction="vertical" size="small">
            <Link onClick={() => navigate('/')}>
              <ArrowLeftOutlined /> Voltar ao Login
            </Link>
            <Text type="secondary" style={{ fontSize: '12px' }}>
              Lembrou da senha?{' '}
              <Link onClick={() => navigate('/')}>
                Faça login aqui
              </Link>
            </Text>
          </Space>
        </div>

        {/* Informações adicionais */}
        <div style={{ 
          marginTop: '24px', 
          padding: '16px', 
          background: '#f5f5f5', 
          borderRadius: '8px',
          fontSize: '12px'
        }}>
          <Text strong>Dicas:</Text>
          <br />
          <Text>• Verifique sua caixa de spam</Text>
          <br />
          <Text>• O link expira em 24 horas</Text>
          <br />
          <Text>• Entre em contato se não receber o email</Text>
        </div>
      </Card>
    </div>
  )
}

export default ForgotPasswordPage
