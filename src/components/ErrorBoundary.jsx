import React from 'react'
import { Result, Button, Card, Typography, Space } from 'antd'
import { ReloadOutlined, HomeOutlined, BugOutlined } from '@ant-design/icons'

const { Title, Text, Paragraph } = Typography

/**
 * ErrorBoundary para capturar erros do React
 * Exibe uma tela amigável quando ocorre um erro inesperado
 */
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props)
    this.state = { 
      hasError: false, 
      error: null, 
      errorInfo: null 
    }
  }

  static getDerivedStateFromError(error) {
    // Atualiza o state para exibir a UI de erro
    return { hasError: true }
  }

  componentDidCatch(error, errorInfo) {
    // Log do erro para monitoramento
    console.error('ErrorBoundary capturou um erro:', error, errorInfo)
    
    this.setState({
      error: error,
      errorInfo: errorInfo
    })

    // Aqui você pode enviar o erro para um serviço de monitoramento
    // como Sentry, LogRocket, etc.
    this.logErrorToService(error, errorInfo)
  }

  logErrorToService(error, errorInfo) {
    // Simulação de envio para serviço de monitoramento
    const errorData = {
      message: error.message,
      stack: error.stack,
      componentStack: errorInfo.componentStack,
      timestamp: new Date().toISOString(),
      userAgent: navigator.userAgent,
      url: window.location.href
    }

    // Em produção, envie para seu serviço de monitoramento
    console.log('Erro enviado para serviço de monitoramento:', errorData)
  }

  handleReload() {
    // Recarrega a página
    window.location.reload()
  }

  handleGoHome() {
    // Redireciona para a página inicial
    window.location.href = '/'
  }

  handleReportBug() {
    // Abre modal ou redireciona para página de reporte de bugs
    const errorDetails = {
      error: this.state.error?.message,
      stack: this.state.error?.stack,
      componentStack: this.state.errorInfo?.componentStack,
      timestamp: new Date().toISOString()
    }

    // Em produção, você pode abrir um modal ou redirecionar para uma página de suporte
    console.log('Detalhes do erro para reporte:', errorDetails)
    
    // Simulação de abertura de modal de reporte
    alert('Funcionalidade de reporte de bugs será implementada em breve!')
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          padding: '20px'
        }}>
          <Card style={{ 
            maxWidth: '600px', 
            width: '100%',
            textAlign: 'center',
            boxShadow: '0 8px 32px rgba(0,0,0,0.1)'
          }}>
            <Result
              status="error"
              icon={<BugOutlined style={{ fontSize: '64px', color: '#ff4d4f' }} />}
              title={
                <Title level={2} style={{ color: '#ff4d4f' }}>
                  Ops! Algo deu errado
                </Title>
              }
              subTitle={
                <div>
                  <Paragraph style={{ fontSize: '16px', marginBottom: '16px' }}>
                    Encontramos um erro inesperado. Nossa equipe foi notificada e está trabalhando para resolver o problema.
                  </Paragraph>
                  <Text type="secondary" style={{ fontSize: '14px' }}>
                    Se o problema persistir, entre em contato conosco.
                  </Text>
                </div>
              }
              extra={
                <Space direction="vertical" size="middle" style={{ width: '100%' }}>
                  <Space size="middle">
                    <Button 
                      type="primary" 
                      icon={<ReloadOutlined />}
                      onClick={this.handleReload}
                      size="large"
                    >
                      Recarregar Página
                    </Button>
                    <Button 
                      icon={<HomeOutlined />}
                      onClick={this.handleGoHome}
                      size="large"
                    >
                      Ir para Início
                    </Button>
                  </Space>
                  
                  <Button 
                    type="link" 
                    icon={<BugOutlined />}
                    onClick={this.handleReportBug}
                    style={{ color: '#1890ff' }}
                  >
                    Reportar Problema
                  </Button>
                </Space>
              }
            />

            {/* Detalhes do erro em desenvolvimento */}
            {process.env.NODE_ENV === 'development' && this.state.error && (
              <Card 
                size="small" 
                style={{ 
                  marginTop: '24px', 
                  textAlign: 'left',
                  background: '#f5f5f5'
                }}
                title="Detalhes do Erro (Desenvolvimento)"
              >
                <div style={{ fontSize: '12px', fontFamily: 'monospace' }}>
                  <div style={{ marginBottom: '8px' }}>
                    <strong>Erro:</strong> {this.state.error.message}
                  </div>
                  <div style={{ marginBottom: '8px' }}>
                    <strong>Stack:</strong>
                    <pre style={{ 
                      background: '#fff', 
                      padding: '8px', 
                      borderRadius: '4px',
                      overflow: 'auto',
                      maxHeight: '200px'
                    }}>
                      {this.state.error.stack}
                    </pre>
                  </div>
                  {this.state.errorInfo && (
                    <div>
                      <strong>Component Stack:</strong>
                      <pre style={{ 
                        background: '#fff', 
                        padding: '8px', 
                        borderRadius: '4px',
                        overflow: 'auto',
                        maxHeight: '200px'
                      }}>
                        {this.state.errorInfo.componentStack}
                      </pre>
                    </div>
                  )}
                </div>
              </Card>
            )}
          </Card>
        </div>
      )
    }

    return this.props.children
  }
}

export default ErrorBoundary


