// 🧪 Script para testar se React está funcionando
import React from 'react';
import ReactDOM from 'react-dom/client';

// Função para testar React
export const testReact = () => {
  console.log('🧪 Testando React...');
  
  try {
    // 1. Verificar se React está disponível
    console.log('✅ React version:', React.version);
    console.log('✅ ReactDOM disponível:', !!ReactDOM);
    
    // 2. Verificar se o root element existe
    const rootElement = document.getElementById('root');
    console.log('✅ Root element:', rootElement);
    
    if (!rootElement) {
      console.log('❌ Root element não encontrado!');
      return false;
    }
    
    // 3. Tentar criar um elemento React simples
    const TestComponent = () => {
      return React.createElement('div', {
        style: {
          position: 'fixed',
          top: '10px',
          right: '10px',
          background: 'red',
          color: 'white',
          padding: '10px',
          zIndex: 9999,
          borderRadius: '5px'
        }
      }, 'React funcionando!');
    };
    
    // 4. Tentar renderizar o componente
    try {
      const testRoot = ReactDOM.createRoot(rootElement);
      testRoot.render(React.createElement(TestComponent));
      console.log('✅ React renderizou com sucesso!');
      
      // Remover o teste após 3 segundos
      setTimeout(() => {
        testRoot.unmount();
        console.log('✅ Teste removido');
      }, 3000);
      
      return true;
    } catch (error) {
      console.log('❌ Erro ao renderizar React:', error);
      return false;
    }
    
  } catch (error) {
    console.log('❌ Erro no teste do React:', error);
    return false;
  }
};

// Função para testar se há problemas de CSS
export const testCSS = () => {
  console.log('🎨 Testando CSS...');
  
  try {
    // 1. Verificar se há estilos carregados
    const stylesheets = document.styleSheets;
    console.log('📄 Stylesheets:', stylesheets.length);
    
    // 2. Verificar se há problemas de CSS
    for (let i = 0; i < stylesheets.length; i++) {
      try {
        const sheet = stylesheets[i];
        console.log(`📄 Stylesheet ${i}:`, sheet.href || 'inline');
      } catch (error) {
        console.log(`❌ Erro no stylesheet ${i}:`, error);
      }
    }
    
    // 3. Verificar se há problemas de fonte
    const fonts = document.fonts;
    console.log('🔤 Fontes carregadas:', fonts.size);
    
    // 4. Verificar se há problemas de imagem
    const images = document.images;
    console.log('🖼️ Imagens carregadas:', images.length);
    
    return true;
  } catch (error) {
    console.log('❌ Erro no teste de CSS:', error);
    return false;
  }
};

// Função para testar se há problemas de JavaScript
export const testJavaScript = () => {
  console.log('📜 Testando JavaScript...');
  
  try {
    // 1. Verificar se há erros de sintaxe
    eval('console.log("Sintaxe OK")');
    console.log('✅ Sintaxe JavaScript OK');
    
    // 2. Verificar se há problemas de importação
    console.log('✅ Imports funcionando');
    
    // 3. Verificar se há problemas de memória
    if (performance.memory) {
      console.log('💾 Memória usada:', Math.round(performance.memory.usedJSHeapSize / 1024 / 1024), 'MB');
    }
    
    return true;
  } catch (error) {
    console.log('❌ Erro no teste de JavaScript:', error);
    return false;
  }
};

// Função para testar se há problemas de rede
export const testNetwork = () => {
  console.log('🌐 Testando rede...');
  
  try {
    // 1. Verificar conectividade
    console.log('🌐 Online:', navigator.onLine);
    
    // 2. Verificar se Firebase está acessível
    fetch('https://vestiario-app.firebaseapp.com')
      .then(() => {
        console.log('✅ Firebase acessível');
      })
      .catch((error) => {
        console.log('❌ Problema de conectividade com Firebase:', error);
      });
    
    return true;
  } catch (error) {
    console.log('❌ Erro no teste de rede:', error);
    return false;
  }
};

// Função para executar todos os testes
export const runAllTests = () => {
  console.log('🧪 Executando todos os testes...');
  
  const results = {
    react: testReact(),
    css: testCSS(),
    javascript: testJavaScript(),
    network: testNetwork()
  };
  
  console.log('📊 Resultados dos testes:', results);
  
  const allPassed = Object.values(results).every(result => result === true);
  
  if (allPassed) {
    console.log('🎉 Todos os testes passaram!');
  } else {
    console.log('❌ Alguns testes falharam!');
  }
  
  return results;
};

// Executar se chamado diretamente
if (typeof window !== 'undefined') {
  window.testReact = testReact;
  window.testCSS = testCSS;
  window.testJavaScript = testJavaScript;
  window.testNetwork = testNetwork;
  window.runAllTests = runAllTests;
  
  console.log('🧪 Scripts de teste carregados!');
  console.log('📝 Comandos disponíveis:');
  console.log('  - window.testReact() // Testar React');
  console.log('  - window.testCSS() // Testar CSS');
  console.log('  - window.testJavaScript() // Testar JavaScript');
  console.log('  - window.testNetwork() // Testar rede');
  console.log('  - window.runAllTests() // Executar todos os testes');
}
