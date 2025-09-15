/**
 * Tema personalizado do Vestiário App
 * Baseado na identidade visual da marca com cor laranja #ff5e0e
 */

export const vestiarioTheme = {
  token: {
    // Cores principais baseadas na logo laranja #ff5e0e
    colorPrimary: '#ff5e0e', // Laranja principal da logo
    colorSuccess: '#10b981', // Verde para sucesso
    colorWarning: '#f59e0b', // Amarelo para avisos
    colorError: '#ef4444', // Vermelho para erros
    colorInfo: '#3b82f6', // Azul para informações
    
    // Cores de fundo
    colorBgContainer: '#ffffff',
    colorBgElevated: '#f9fafb',
    colorBgLayout: '#f3f4f6',
    
    // Cores de texto
    colorText: '#111827',
    colorTextSecondary: '#6b7280',
    colorTextTertiary: '#9ca3af',
    
    // Bordas
    colorBorder: '#e5e7eb',
    colorBorderSecondary: '#f3f4f6',
    
    // Raio de borda
    borderRadius: 8,
    borderRadiusLG: 12,
    borderRadiusSM: 6,
    
    // Sombras
    boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)',
    boxShadowSecondary: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
    boxShadowTertiary: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
    
    // Fontes
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
    fontSize: 14,
    fontSizeLG: 16,
    fontSizeSM: 12,
    
    // Espaçamentos
    padding: 16,
    paddingLG: 24,
    paddingSM: 12,
    margin: 16,
    marginLG: 24,
    marginSM: 12,
    
    // Alturas
    controlHeight: 40,
    controlHeightLG: 48,
    controlHeightSM: 32,
  },
  
  components: {
    // Configurações específicas para componentes
    Button: {
      borderRadius: 8,
      fontWeight: 500,
      boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)',
    },
    Card: {
      borderRadius: 12,
      boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
    },
    Input: {
      borderRadius: 8,
      controlHeight: 40,
    },
    Select: {
      borderRadius: 8,
      controlHeight: 40,
    },
    DatePicker: {
      borderRadius: 8,
      controlHeight: 40,
    },
    Modal: {
      borderRadius: 12,
    },
    Table: {
      borderRadius: 8,
    },
    Form: {
      labelColor: '#374151',
      labelFontSize: 14,
      labelFontWeight: 500,
    },
    Typography: {
      titleMarginBottom: '0.5em',
      titleMarginTop: '1.2em',
    },
  },
}

// Cores específicas para gradientes e backgrounds
export const vestiarioColors = {
  primary: {
    50: '#fff7ed',
    100: '#ffedd5',
    200: '#fed7aa',
    300: '#fdba74',
    400: '#fb923c',
    500: '#ff5e0e', // Cor principal da logo
    600: '#ea580c',
    700: '#c2410c',
    800: '#9a3412',
    900: '#7c2d12',
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
  primary: 'linear-gradient(135deg, #ff5e0e 0%, #ff8c42 100%)',
  primaryHover: 'linear-gradient(135deg, #ea580c 0%, #ff7c32 100%)',
  secondary: 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)',
  success: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
  warning: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
  error: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
}

// Estilos personalizados para componentes específicos
export const vestiarioStyles = {
  logo: {
    filter: 'drop-shadow(0 4px 8px rgba(0,0,0,0.1))',
    transition: 'all 0.3s ease',
  },
  card: {
    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
    borderRadius: 12,
    border: '1px solid #e2e8f0',
  },
  button: {
    borderRadius: 8,
    fontWeight: 500,
    boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)',
    transition: 'all 0.2s ease',
  },
  input: {
    borderRadius: 8,
    border: '1px solid #e2e8f0',
    transition: 'all 0.2s ease',
  },
}
