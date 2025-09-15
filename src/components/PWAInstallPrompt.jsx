import { useState, useEffect } from 'react'
import { Button, Card, Space, Typography, Modal } from 'antd'
import { DownloadOutlined, CloseOutlined, MobileOutlined, DesktopOutlined } from '@ant-design/icons'

const { Title, Text, Paragraph } = Typography

/**
 * Componente para prompt de instalação PWA
 * Exibe um modal elegante para instalar o app
 */
const PWAInstallPrompt = () => {
  const [deferredPrompt, setDeferredPrompt] = useState(null)
  const [showInstallPrompt, setShowInstallPrompt] = useState(false)
  const [isInstalled, setIsInstalled] = useState(false)

  useEffect(() => {
    // Verifica se o app já foi instalado
    const checkIfInstalled = () => {
      // Verifica se está rodando como PWA
      const isStandalone = window.matchMedia('(display-mode: standalone)').matches
      const isInApp = window.navigator.standalone === true
      
      if (isStandalone || isInApp) {
        setIsInstalled(true)
        return
      }

      // Verifica se já foi instalado anteriormente
      const installed = localStorage.getItem('pwa-installed')
      if (installed === 'true') {
        setIsInstalled(true)
      }
    }

    checkIfInstalled()

    // Escuta o evento beforeinstallprompt
    const handleBeforeInstallPrompt = (e) => {
      e.preventDefault()
      setDeferredPrompt(e)
      
      // Mostra o prompt após um delay para não ser intrusivo
      setTimeout(() => {
        if (!isInstalled) {
          setShowInstallPrompt(true)
        }
      }, 3000) // 3 segundos após carregar
    }

    // Para localhost, mostra um prompt informativo
    const isLocalhost = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
    if (isLocalhost && !isInstalled) {
      setTimeout(() => {
        setShowInstallPrompt(true)
      }, 5000) // 5 segundos para localhost
    }

    // Escuta quando o app é instalado
    const handleAppInstalled = () => {
      console.log('PWA foi instalado!')
      setIsInstalled(true)
      setShowInstallPrompt(false)
      localStorage.setItem('pwa-installed', 'true')
    }

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt)
    window.addEventListener('appinstalled', handleAppInstalled)

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt)
      window.removeEventListener('appinstalled', handleAppInstalled)
    }
  }, [isInstalled])

  const handleInstall = async () => {
    if (!deferredPrompt) return

    try {
      // Mostra o prompt de instalação
      deferredPrompt.prompt()
      
      // Aguarda a resposta do usuário
      const { outcome } = await deferredPrompt.userChoice
      
      if (outcome === 'accepted') {
        console.log('Usuário aceitou a instalação')
        setIsInstalled(true)
        setShowInstallPrompt(false)
        localStorage.setItem('pwa-installed', 'true')
      } else {
        console.log('Usuário rejeitou a instalação')
      }
      
      setDeferredPrompt(null)
    } catch (error) {
      console.error('Erro ao instalar PWA:', error)
    }
  }

  const handleDismiss = () => {
    setShowInstallPrompt(false)
    // Não mostra novamente por 7 dias
    const dismissUntil = new Date()
    dismissUntil.setDate(dismissUntil.getDate() + 7)
    localStorage.setItem('pwa-install-dismissed', dismissUntil.toISOString())
  }

  const handleLater = () => {
    setShowInstallPrompt(false)
    // Mostra novamente em 1 dia
    const showAgain = new Date()
    showAgain.setDate(showAgain.getDate() + 1)
    localStorage.setItem('pwa-install-later', showAgain.toISOString())
  }

  // Não mostra se já foi instalado ou se foi dispensado recentemente
  if (isInstalled || !showInstallPrompt || !deferredPrompt) {
    return null
  }

  return (
    <Modal
      open={showInstallPrompt}
      onCancel={handleDismiss}
      footer={null}
      centered
      width={400}
      closable={false}
      maskClosable={false}
    >
      <div style={{ textAlign: 'center', padding: '20px 0' }}>
        <div style={{ 
          fontSize: '48px', 
          marginBottom: '16px',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center'
        }}>
          <img 
            src="/icons/icon-192x192.png" 
            alt="Vestiário" 
            style={{ 
              width: '64px', 
              height: '64px',
              borderRadius: '12px',
              boxShadow: '0 4px 12px rgba(0,0,0,0.15)'
            }} 
          />
        </div>
        
        <Title level={3} style={{ marginBottom: '8px' }}>
          {window.location.hostname === 'localhost' ? 'PWA Vestiário' : 'Instalar Vestiário'}
        </Title>
        
        <Paragraph style={{ marginBottom: '24px', color: '#666' }}>
          {window.location.hostname === 'localhost' 
            ? 'Você está testando o PWA no localhost. Em produção (HTTPS), este app pode ser instalado como um aplicativo nativo!'
            : 'Instale o Vestiário no seu dispositivo para ter acesso rápido e funcionalidade offline!'
          }
        </Paragraph>

        <div style={{ 
          background: '#f5f5f5', 
          padding: '16px', 
          borderRadius: '8px', 
          marginBottom: '24px',
          textAlign: 'left'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', marginBottom: '8px' }}>
            <MobileOutlined style={{ marginRight: '8px', color: '#1890ff' }} />
            <Text strong>Acesso rápido</Text>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', marginBottom: '8px' }}>
            <DesktopOutlined style={{ marginRight: '8px', color: '#52c41a' }} />
            <Text strong>Funciona offline</Text>
          </div>
          <div style={{ display: 'flex', alignItems: 'center' }}>
            <DownloadOutlined style={{ marginRight: '8px', color: '#faad14' }} />
            <Text strong>Notificações push</Text>
          </div>
        </div>

        <Space size="middle" style={{ width: '100%', justifyContent: 'center' }}>
          <Button 
            type="primary" 
            icon={<DownloadOutlined />}
            onClick={handleInstall}
            size="large"
            style={{
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              border: 'none',
              fontWeight: 'bold'
            }}
          >
            Instalar Agora
          </Button>
          
          <Button 
            onClick={handleLater}
            size="large"
          >
            Lembrar Depois
          </Button>
        </Space>

        <div style={{ marginTop: '16px' }}>
          <Button 
            type="link" 
            icon={<CloseOutlined />}
            onClick={handleDismiss}
            style={{ color: '#999' }}
          >
            Não, obrigado
          </Button>
        </div>
      </div>
    </Modal>
  )
}

export default PWAInstallPrompt
