import React, { useState, useEffect } from 'react'
import {
  Modal,
  Form,
  Input,
  Button,
  Space,
  Typography,
  Divider,
  Card,
  Row,
  Col,
  notification,
  Spin
} from 'antd'
import {
  CreditCardOutlined,
  SafetyOutlined,
  CheckCircleOutlined,
  DollarOutlined
} from '@ant-design/icons'

const { Title, Text } = Typography

/**
 * Componente de formulário de pagamento
 * Simula integração com Stripe para processamento de pagamentos
 */
const PaymentForm = ({ 
  visible, 
  onCancel, 
  onSuccess, 
  bookingData, 
  totalAmount 
}) => {
  const [form] = Form.useForm()
  const [loading, setLoading] = useState(false)
  const [paymentStep, setPaymentStep] = useState('form') // 'form', 'processing', 'success'

  // Reset form when modal opens/closes
  useEffect(() => {
    if (visible) {
      form.resetFields()
      setPaymentStep('form')
    }
  }, [visible, form])

  /**
   * Processa o pagamento
   */
  const handlePayment = async (values) => {
    setLoading(true)
    setPaymentStep('processing')

    try {
      // Simula processamento de pagamento com Stripe
      await new Promise(resolve => setTimeout(resolve, 3000))

      // Simula validação de cartão
      const cardNumber = values.cardNumber.replace(/\s/g, '')
      if (cardNumber.length !== 16) {
        throw new Error('Número do cartão inválido')
      }

      // Simula processamento bem-sucedido
      const paymentResult = {
        id: `pi_${Date.now()}`,
        amount: totalAmount * 100, // Stripe usa centavos
        currency: 'brl',
        status: 'succeeded',
        paymentMethod: {
          card: {
            brand: 'visa',
            last4: cardNumber.slice(-4)
          }
        },
        created: new Date().toISOString(),
        receipt_url: `https://pay.stripe.com/receipts/${Date.now()}`
      }

      setPaymentStep('success')
      
      notification.success({
        message: 'Pagamento realizado com sucesso!',
        description: `Reserva confirmada para ${bookingData.courtName}`,
        placement: 'topRight',
        duration: 5
      })

      // Chama callback de sucesso após 2 segundos
      setTimeout(() => {
        onSuccess(paymentResult)
        handleClose()
      }, 2000)

    } catch (error) {
      setPaymentStep('form')
      notification.error({
        message: 'Erro no pagamento',
        description: error.message || 'Tente novamente',
        placement: 'topRight'
      })
    } finally {
      setLoading(false)
    }
  }

  /**
   * Fecha o modal
   */
  const handleClose = () => {
    form.resetFields()
    setPaymentStep('form')
    onCancel()
  }

  /**
   * Formata número do cartão
   */
  const formatCardNumber = (value) => {
    const v = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '')
    const matches = v.match(/\d{4,16}/g)
    const match = matches && matches[0] || ''
    const parts = []
    for (let i = 0, len = match.length; i < len; i += 4) {
      parts.push(match.substring(i, i + 4))
    }
    if (parts.length) {
      return parts.join(' ')
    } else {
      return v
    }
  }

  /**
   * Renderiza o formulário de pagamento
   */
  const renderPaymentForm = () => (
    <div>
      {/* Resumo da Reserva */}
      <Card style={{ marginBottom: '24px', background: '#f6ffed' }}>
        <Title level={4} style={{ color: '#52c41a', margin: 0 }}>
          📋 Resumo da Reserva
        </Title>
        <Divider style={{ margin: '12px 0' }} />
        <Row gutter={[16, 8]}>
          <Col span={12}>
            <Text strong>Quadra:</Text>
            <br />
            <Text>{bookingData?.courtName}</Text>
          </Col>
          <Col span={12}>
            <Text strong>Estabelecimento:</Text>
            <br />
            <Text>{bookingData?.establishmentName}</Text>
          </Col>
          <Col span={12}>
            <Text strong>Data/Hora:</Text>
            <br />
            <Text>
              {bookingData?.startTime && new Date(bookingData.startTime).toLocaleDateString('pt-BR')}
              <br />
              {bookingData?.startTime && new Date(bookingData.startTime).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })} - 
              {bookingData?.endTime && new Date(bookingData.endTime).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
            </Text>
          </Col>
          <Col span={12}>
            <Text strong>Esporte:</Text>
            <br />
            <Text>{bookingData?.sport}</Text>
          </Col>
          {bookingData?.hourlyRate && bookingData?.duration && (
            <>
              <Col span={12}>
                <Text strong>Duração:</Text>
                <br />
                <Text>{bookingData.duration} horas</Text>
              </Col>
              <Col span={12}>
                <Text strong>Preço por hora:</Text>
                <br />
                <Text>R$ {bookingData.hourlyRate}</Text>
              </Col>
            </>
          )}
        </Row>
        <Divider style={{ margin: '12px 0' }} />
        {bookingData?.hourlyRate && bookingData?.duration && (
          <div style={{ 
            padding: '8px 12px', 
            backgroundColor: '#f0f9ff', 
            borderRadius: '6px',
            border: '1px solid #bae6fd',
            marginBottom: '12px'
          }}>
            <Text type="secondary" style={{ fontSize: '12px' }}>
              💰 <strong>Cálculo:</strong> R$ {bookingData.hourlyRate} × {bookingData.duration} horas = R$ {Number(totalAmount || 0).toFixed(2)}
            </Text>
          </div>
        )}
        <div style={{ textAlign: 'right' }}>
          <Title level={3} style={{ margin: 0, color: '#52c41a' }}>
            <DollarOutlined /> R$ {Number(totalAmount || 0).toFixed(2)}
          </Title>
        </div>
      </Card>

      {/* Formulário de Pagamento */}
      <Form
        form={form}
        layout="vertical"
        onFinish={handlePayment}
        requiredMark={false}
      >
        <Title level={4}>
          <CreditCardOutlined /> Dados do Cartão
        </Title>

        <Form.Item
          name="cardNumber"
          label="Número do Cartão"
          rules={[
            { required: true, message: 'Digite o número do cartão!' },
            { min: 19, message: 'Número do cartão inválido!' }
          ]}
        >
          <Input
            placeholder="1234 5678 9012 3456"
            maxLength={19}
            onChange={(e) => {
              const formatted = formatCardNumber(e.target.value)
              form.setFieldsValue({ cardNumber: formatted })
            }}
            prefix={<CreditCardOutlined />}
          />
        </Form.Item>

        <Row gutter={16}>
          <Col span={12}>
            <Form.Item
              name="expiryDate"
              label="Validade"
              rules={[
                { required: true, message: 'Digite a validade!' },
                { pattern: /^(0[1-9]|1[0-2])\/\d{2}$/, message: 'Formato: MM/AA' }
              ]}
            >
              <Input
                placeholder="MM/AA"
                maxLength={5}
                onChange={(e) => {
                  let value = e.target.value.replace(/\D/g, '')
                  if (value.length >= 2) {
                    value = value.substring(0, 2) + '/' + value.substring(2, 4)
                  }
                  form.setFieldsValue({ expiryDate: value })
                }}
              />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item
              name="cvv"
              label="CVV"
              rules={[
                { required: true, message: 'Digite o CVV!' },
                { min: 3, max: 4, message: 'CVV inválido!' }
              ]}
            >
              <Input
                placeholder="123"
                maxLength={4}
                type="password"
              />
            </Form.Item>
          </Col>
        </Row>

        <Form.Item
          name="cardholderName"
          label="Nome no Cartão"
          rules={[
            { required: true, message: 'Digite o nome no cartão!' },
            { min: 2, message: 'Nome muito curto!' }
          ]}
        >
          <Input
            placeholder="Nome como aparece no cartão"
            style={{ textTransform: 'uppercase' }}
          />
        </Form.Item>

        <Form.Item
          name="email"
          label="Email para Recebimento"
          rules={[
            { required: true, message: 'Digite o email!' },
            { type: 'email', message: 'Email inválido!' }
          ]}
        >
          <Input
            placeholder="seu@email.com"
            type="email"
          />
        </Form.Item>

        {/* Informações de Segurança */}
        <Card size="small" style={{ background: '#f0f8ff', marginBottom: '24px' }}>
          <div style={{ display: 'flex', alignItems: 'center' }}>
            <SafetyOutlined style={{ color: '#1890ff', marginRight: '8px' }} />
            <Text type="secondary" style={{ fontSize: '12px' }}>
              Seus dados são protegidos com criptografia SSL. Não armazenamos informações do cartão.
            </Text>
          </div>
        </Card>

        {/* Botão de Teste Rápido */}
        <Card size="small" style={{ background: '#fff7e6', marginBottom: '24px', border: '1px solid #ffd591' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div>
              <Text strong style={{ color: '#d46b08', fontSize: '12px' }}>
                🧪 Modo de Teste
              </Text>
              <br />
              <Text type="secondary" style={{ fontSize: '11px' }}>
                Use dados de teste para simular pagamento
              </Text>
            </div>
            <Button 
              size="small" 
              type="link"
              onClick={() => {
                form.setFieldsValue({
                  cardNumber: '1234 5678 9012 3456',
                  expiryDate: '12/25',
                  cvv: '123',
                  cardholderName: 'JOÃO SILVA',
                  email: 'joao@teste.com'
                })
              }}
              style={{ color: '#d46b08' }}
            >
              Preencher Dados de Teste
            </Button>
          </div>
        </Card>

        <Form.Item style={{ marginBottom: 0, textAlign: 'right' }}>
          <Space>
            <Button onClick={handleClose}>
              Cancelar
            </Button>
            <Button 
              type="primary" 
              htmlType="submit"
              loading={loading}
              size="large"
              style={{ minWidth: '120px' }}
            >
              <CreditCardOutlined /> Pagar R$ {Number(totalAmount || 0).toFixed(2)}
            </Button>
          </Space>
        </Form.Item>
      </Form>
    </div>
  )

  /**
   * Renderiza tela de processamento
   */
  const renderProcessing = () => (
    <div style={{ textAlign: 'center', padding: '40px' }}>
      <Spin size="large" />
      <Title level={3} style={{ marginTop: '24px', color: '#1890ff' }}>
        Processando Pagamento...
      </Title>
      <Text type="secondary">
        Por favor, aguarde enquanto processamos seu pagamento.
        <br />
        Não feche esta janela.
      </Text>
    </div>
  )

  /**
   * Renderiza tela de sucesso
   */
  const renderSuccess = () => (
    <div style={{ textAlign: 'center', padding: '40px' }}>
      <CheckCircleOutlined style={{ fontSize: '64px', color: '#52c41a' }} />
      <Title level={3} style={{ marginTop: '24px', color: '#52c41a' }}>
        Pagamento Realizado!
      </Title>
      <Text type="secondary">
        Sua reserva foi confirmada com sucesso.
        <br />
        Você receberá um email de confirmação em breve.
      </Text>
    </div>
  )

  return (
    <Modal
      title={
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <CreditCardOutlined style={{ marginRight: '8px', color: '#1890ff' }} />
          <span>Pagamento Seguro</span>
        </div>
      }
      open={visible}
      onCancel={handleClose}
      footer={null}
      width={600}
      closable={paymentStep === 'form'}
      maskClosable={false}
    >
      {paymentStep === 'form' && renderPaymentForm()}
      {paymentStep === 'processing' && renderProcessing()}
      {paymentStep === 'success' && renderSuccess()}
    </Modal>
  )
}

export default PaymentForm