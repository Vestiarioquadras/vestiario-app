/**
 * Tema personalizado do Vestiário App
 * Baseado na identidade visual da marca com cor laranja #ff5e0e
 */

// Breakpoints responsivos
export const breakpoints = {
  xs: '480px',
  sm: '576px',
  md: '768px',
  lg: '992px',
  xl: '1200px',
  xxl: '1600px'
}

// Configurações responsivas
export const responsiveConfig = {
  // Espaçamentos responsivos
  spacing: {
    xs: { padding: 8, margin: 8 },
    sm: { padding: 12, margin: 12 },
    md: { padding: 16, margin: 16 },
    lg: { padding: 24, margin: 24 },
    xl: { padding: 32, margin: 32 }
  },
  
  // Tamanhos de fonte responsivos
  fontSize: {
    xs: { base: 12, lg: 14, xl: 16 },
    sm: { base: 14, lg: 16, xl: 18 },
    md: { base: 16, lg: 18, xl: 20 },
    lg: { base: 18, lg: 20, xl: 24 },
    xl: { base: 20, lg: 24, xl: 28 }
  },
  
  // Layout responsivo
  layout: {
    container: {
      xs: { maxWidth: '100%', padding: '8px' },
      sm: { maxWidth: '540px', padding: '12px' },
      md: { maxWidth: '720px', padding: '16px' },
      lg: { maxWidth: '960px', padding: '20px' },
      xl: { maxWidth: '1140px', padding: '24px' },
      xxl: { maxWidth: '1320px', padding: '32px' }
    }
  }
}

export const vestiarioTheme = {
  token: {
    // Cores principais com primária verde #B1EC32 e visual minimalista
    colorPrimary: '#B1EC32',
    colorSuccess: '#16a34a',
    colorWarning: '#f59e0b',
    colorError: '#ef4444',
    colorInfo: '#3b82f6',
    
    // Cores de fundo (foco em branco e tons sutis)
    colorBgContainer: '#ffffff',
    colorBgElevated: '#ffffff',
    colorBgLayout: '#ffffff',
    colorBgMask: 'rgba(0, 0, 0, 0.45)',
    
    // Cores de texto com alto contraste no branco
    colorText: '#111827',
    colorTextSecondary: '#6b7280',
    colorTextTertiary: '#9ca3af',
    colorTextQuaternary: '#d1d5db',
    
    // Bordas mais discretas
    colorBorder: '#e5e7eb',
    colorBorderSecondary: '#f3f4f6',
    
    // Raio de borda
    borderRadius: 12,
    borderRadiusLG: 16,
    borderRadiusSM: 8,
    borderRadiusXS: 6,
    
    // Sombras suaves para minimalismo
    boxShadow: '0 1px 2px rgba(0,0,0,0.04)',
    boxShadowSecondary: '0 2px 6px rgba(0,0,0,0.06)',
    boxShadowTertiary: '0 8px 16px rgba(0,0,0,0.08)',
    
    // Fontes melhoradas
    fontFamily: '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
    fontSize: 14,
    fontSizeLG: 16,
    fontSizeSM: 12,
    fontSizeXL: 18,
    fontSizeHeading1: 32,
    fontSizeHeading2: 24,
    fontSizeHeading3: 20,
    fontSizeHeading4: 16,
    fontSizeHeading5: 14,
    
    // Espaçamentos melhorados
    padding: 16,
    paddingLG: 24,
    paddingSM: 12,
    paddingXS: 8,
    paddingXXS: 4,
    margin: 16,
    marginLG: 24,
    marginSM: 12,
    marginXS: 8,
    marginXXS: 4,
    
    // Alturas
    controlHeight: 44,
    controlHeightLG: 52,
    controlHeightSM: 36,
    controlHeightXS: 28,
    
    // Line heights
    lineHeight: 1.5,
    lineHeightLG: 1.6,
    lineHeightSM: 1.4,
    
    // Motion
    motionDurationFast: '0.1s',
    motionDurationMid: '0.2s',
    motionDurationSlow: '0.3s',
    motionEaseInOut: 'cubic-bezier(0.645, 0.045, 0.355, 1)',
    motionEaseOut: 'cubic-bezier(0.215, 0.61, 0.355, 1)',
    motionEaseIn: 'cubic-bezier(0.55, 0.055, 0.675, 0.19)',
  },
  
  components: {
    // Configurações específicas para componentes
    Button: {
      borderRadius: 12,
      fontWeight: 600,
      boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)',
      controlHeight: 44,
      controlHeightLG: 52,
      controlHeightSM: 36,
      paddingInline: 24,
      paddingInlineLG: 32,
      paddingInlineSM: 16,
    },
    Card: {
      borderRadius: 16,
      boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
      paddingLG: 24,
      padding: 20,
      paddingSM: 16,
    },
    Input: {
      borderRadius: 12,
      controlHeight: 44,
      controlHeightLG: 52,
      controlHeightSM: 36,
      paddingInline: 16,
      paddingBlock: 12,
    },
    Select: {
      borderRadius: 12,
      controlHeight: 44,
      controlHeightLG: 52,
      controlHeightSM: 36,
    },
    DatePicker: {
      borderRadius: 12,
      controlHeight: 44,
      controlHeightLG: 52,
      controlHeightSM: 36,
    },
    Modal: {
      borderRadius: 16,
      paddingLG: 24,
      padding: 20,
      paddingSM: 16,
    },
    Table: {
      borderRadius: 12,
      headerBg: '#fafbfc',
      headerColor: '#374151',
      headerSortActiveBg: '#f3f4f6',
      rowHoverBg: '#f8fafc',
    },
    Form: {
      labelColor: '#374151',
      labelFontSize: 14,
      labelFontWeight: 600,
      labelHeight: 20,
      itemMarginBottom: 20,
    },
    Typography: {
      titleMarginBottom: '0.5em',
      titleMarginTop: '1.2em',
      colorText: '#1f2937',
      colorTextSecondary: '#6b7280',
      colorTextTertiary: '#9ca3af',
    },
    Tag: {
      borderRadius: 8,
      fontSize: 12,
      lineHeight: 1.4,
    },
    Drawer: {
      borderRadius: 16,
    },
    Notification: {
      borderRadius: 12,
    },
    Message: {
      borderRadius: 12,
    },
  },
}

// Cores específicas para gradientes e backgrounds
export const vestiarioColors = {
  primary: {
    50: '#f6ffda',
    100: '#e9ffb0',
    200: '#dcff8a',
    300: '#cfff63',
    400: '#c3fa4b',
    500: '#B1EC32',
    600: '#98d31a',
    700: '#7eb512',
    800: '#5f8e0e',
    900: '#476b0b',
  },
  success: {
    50: '#ecfdf5',
    100: '#d1fae5',
    200: '#a7f3d0',
    300: '#6ee7b7',
    400: '#34d399',
    500: '#10b981',
    600: '#059669',
    700: '#047857',
    800: '#065f46',
    900: '#064e3b',
  },
  warning: {
    50: '#fffbeb',
    100: '#fef3c7',
    200: '#fde68a',
    300: '#fcd34d',
    400: '#fbbf24',
    500: '#f59e0b',
    600: '#d97706',
    700: '#b45309',
    800: '#92400e',
    900: '#78350f',
  },
  error: {
    50: '#fef2f2',
    100: '#fee2e2',
    200: '#fecaca',
    300: '#fca5a5',
    400: '#f87171',
    500: '#ef4444',
    600: '#dc2626',
    700: '#b91c1c',
    800: '#991b1b',
    900: '#7f1d1d',
  },
}

// Gradientes personalizados
export const vestiarioGradients = {
  primary: 'linear-gradient(135deg, #B1EC32 0%, #98d31a 100%)',
  primaryHover: 'linear-gradient(135deg, #98d31a 0%, #7eb512 100%)',
  secondary: 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)',
  success: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
  warning: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
  error: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
}

// Estilos personalizados para componentes específicos
export const vestiarioStyles = {
  logo: {
    filter: 'drop-shadow(0 4px 8px rgba(0,0,0,0.1))',
    transition: 'all 0.3s cubic-bezier(0.645, 0.045, 0.355, 1)',
  },
  card: {
    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
    borderRadius: 16,
    border: '1px solid #e5e7eb',
    transition: 'all 0.2s cubic-bezier(0.645, 0.045, 0.355, 1)',
  },
  button: {
    borderRadius: 12,
    fontWeight: 600,
    boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)',
    transition: 'all 0.2s cubic-bezier(0.645, 0.045, 0.355, 1)',
  },
  input: {
    borderRadius: 12,
    border: '1px solid #e5e7eb',
    transition: 'all 0.2s cubic-bezier(0.645, 0.045, 0.355, 1)',
  },
  glass: {
    background: 'rgba(255, 255, 255, 0.95)',
    backdropFilter: 'blur(10px)',
    border: '1px solid rgba(255, 255, 255, 0.2)',
  },
  shadow: {
    light: '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)',
    medium: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
    large: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
    xlarge: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
  },
}

// Utilitários de layout
export const layoutUtils = {
  container: {
    maxWidth: '1200px',
    margin: '0 auto',
    padding: '0 16px',
    '@media (min-width: 768px)': {
      padding: '0 24px',
    },
    '@media (min-width: 1024px)': {
      padding: '0 32px',
    },
  },
  section: {
    padding: '48px 0',
    '@media (min-width: 768px)': {
      padding: '64px 0',
    },
    '@media (min-width: 1024px)': {
      padding: '80px 0',
    },
  },
  grid: {
    display: 'grid',
    gap: '24px',
    '@media (min-width: 768px)': {
      gap: '32px',
    },
  },
}

// Animações personalizadas
export const animations = {
  fadeIn: {
    from: { opacity: 0, transform: 'translateY(20px)' },
    to: { opacity: 1, transform: 'translateY(0)' },
  },
  slideIn: {
    from: { transform: 'translateX(-100%)' },
    to: { transform: 'translateX(0)' },
  },
  scaleIn: {
    from: { transform: 'scale(0.95)', opacity: 0 },
    to: { transform: 'scale(1)', opacity: 1 },
  },
  bounce: {
    '0%, 20%, 53%, 80%, 100%': { transform: 'translate3d(0,0,0)' },
    '40%, 43%': { transform: 'translate3d(0, -8px, 0)' },
    '70%': { transform: 'translate3d(0, -4px, 0)' },
    '90%': { transform: 'translate3d(0, -2px, 0)' },
  },
}
