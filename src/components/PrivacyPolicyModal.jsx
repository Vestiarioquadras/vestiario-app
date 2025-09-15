import { Modal, Typography, Button, Divider } from 'antd'
import { CloseOutlined } from '@ant-design/icons'

const { Title, Paragraph, Text } = Typography

/**
 * Modal de Política de Privacidade
 * Exibe a política de privacidade em um modal elegante
 */
const PrivacyPolicyModal = ({ open, onCancel }) => {
  return (
    <Modal
      title={
        <div style={{ textAlign: 'center', color: '#ff5e0d' }}>
          🔒 Política de Privacidade
        </div>
      }
      open={open}
      onCancel={onCancel}
      footer={[
        <Button key="close" type="primary" onClick={onCancel} icon={<CloseOutlined />}>
          Fechar
        </Button>
      ]}
      width={800}
      style={{ top: 20 }}
      bodyStyle={{ maxHeight: '70vh', overflowY: 'auto' }}
    >
      <div style={{ padding: '0 10px' }}>
        <div style={{ 
          background: '#fff3e0', 
          padding: '15px', 
          borderRadius: '6px',
          marginBottom: '20px',
          borderLeft: '4px solid #ff5e0d'
        }}>
          <Text strong>Última atualização:</Text> 15 de setembro de 2024
        </div>

        <Title level={4}>1. Informações que Coletamos</Title>
        <Paragraph>
          O Vestiário coleta informações que você nos fornece diretamente, incluindo:
        </Paragraph>
        <ul>
          <li>Nome completo e dados de contato</li>
          <li>Endereço de e-mail</li>
          <li>Informações de perfil (tipo de usuário, preferências esportivas)</li>
          <li>Dados de reservas e transações</li>
        </ul>

        <Title level={4}>2. Como Usamos suas Informações</Title>
        <Paragraph>
          Utilizamos suas informações para:
        </Paragraph>
        <ul>
          <li>Fornecer e melhorar nossos serviços</li>
          <li>Processar reservas e pagamentos</li>
          <li>Comunicar sobre atualizações e promoções</li>
          <li>Garantir a segurança da plataforma</li>
        </ul>

        <Title level={4}>3. Compartilhamento de Informações</Title>
        <Paragraph>
          Não vendemos, alugamos ou compartilhamos suas informações pessoais com terceiros, exceto:
        </Paragraph>
        <ul>
          <li>Com seu consentimento explícito</li>
          <li>Para cumprir obrigações legais</li>
          <li>Com prestadores de serviços confiáveis (processamento de pagamentos)</li>
        </ul>

        <Title level={4}>4. Segurança dos Dados</Title>
        <Paragraph>
          Implementamos medidas de segurança técnicas e organizacionais para proteger suas informações contra acesso não autorizado, alteração, divulgação ou destruição.
        </Paragraph>

        <Title level={4}>5. Seus Direitos</Title>
        <Paragraph>
          Você tem o direito de:
        </Paragraph>
        <ul>
          <li>Acessar suas informações pessoais</li>
          <li>Corrigir dados incorretos</li>
          <li>Solicitar a exclusão de seus dados</li>
          <li>Retirar seu consentimento a qualquer momento</li>
        </ul>

        <Title level={4}>6. Cookies e Tecnologias Similares</Title>
        <Paragraph>
          Utilizamos cookies para melhorar sua experiência, lembrar suas preferências e analisar o uso da plataforma.
        </Paragraph>

        <Title level={4}>7. Alterações nesta Política</Title>
        <Paragraph>
          Podemos atualizar esta política periodicamente. Notificaremos sobre mudanças significativas através do nosso site ou por e-mail.
        </Paragraph>

        <Divider />

        <Title level={4}>8. Contato</Title>
        <Paragraph>
          Para dúvidas sobre esta política de privacidade, entre em contato conosco:
        </Paragraph>
        <ul>
          <li>E-mail: privacidade@vestiario.com</li>
          <li>Telefone: (11) 99999-9999</li>
        </ul>
      </div>
    </Modal>
  )
}

export default PrivacyPolicyModal
