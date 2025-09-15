import { Image } from 'antd'
import { vestiarioStyles } from '../theme/vestiarioTheme'

/**
 * Componente de logo do Vestiário
 * Reutilizável em diferentes tamanhos e contextos
 */
const Logo = ({ 
  size = 'medium', 
  showText = true, 
  style = {},
  className = '',
  onClick = null 
}) => {
  // Define tamanhos padrão
  const sizeConfig = {
    small: { width: 100, height: 50 },
    medium: { width: 150, height: 75 },
    large: { width: 200, height: 100 },
    xlarge: { width: 250, height: 125 }
  }

  const logoStyle = {
    ...sizeConfig[size],
    cursor: onClick ? 'pointer' : 'default',
    ...vestiarioStyles.logo,
    ...style
  }

  return (
    <Image
      src="/logo_e_nome_sem_fundo.png"
      alt="Vestiário - Plataforma Multi-Esportes"
      style={logoStyle}
      className={className}
      onClick={onClick}
      preview={false}
    />
  )
}

export default Logo
