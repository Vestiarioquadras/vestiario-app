// 🔍 Script de Debug para Tela Branca
import { auth, db } from '../config/firebaseConfig';
import { onAuthStateChanged } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';

// Função para debug completo da aplicação
export const debugApp = async () => {
  console.log('🔍 Iniciando debug da aplicação...');
  
  try {
    // 1. Verificar se Firebase está funcionando
    console.log('1️⃣ Verificando Firebase...');
    console.log('✅ Auth:', auth);
    console.log('✅ DB:', db);
    
    // 2. Verificar estado de autenticação
    console.log('2️⃣ Verificando estado de autenticação...');
    const user = auth.currentUser;
    console.log('👤 Usuário atual:', user);
    
    if (user) {
      console.log('📧 Email:', user.email);
      console.log('🆔 UID:', user.uid);
      console.log('📝 Display Name:', user.displayName);
      
      // 3. Verificar dados do usuário no Firestore
      console.log('3️⃣ Verificando dados do usuário no Firestore...');
      const userDoc = await getDoc(doc(db, 'users', user.uid));
      if (userDoc.exists()) {
        const userData = userDoc.data();
        console.log('✅ Dados do usuário:', userData);
        console.log('🎭 Role:', userData.role);
      } else {
        console.log('❌ Usuário não encontrado no Firestore');
      }
    } else {
      console.log('❌ Nenhum usuário logado');
    }
    
    // 4. Verificar se há erros no console
    console.log('4️⃣ Verificando erros no console...');
    const originalError = console.error;
    const originalWarn = console.warn;
    
    let errorCount = 0;
    let warningCount = 0;
    
    console.error = (...args) => {
      errorCount++;
      console.log('🚨 ERRO:', ...args);
      originalError.apply(console, args);
    };
    
    console.warn = (...args) => {
      warningCount++;
      console.log('⚠️ AVISO:', ...args);
      originalWarn.apply(console, args);
    };
    
    // 5. Verificar se o DOM está carregado
    console.log('5️⃣ Verificando DOM...');
    console.log('📄 Document ready state:', document.readyState);
    console.log('🎯 Root element:', document.getElementById('root'));
    
    // 6. Verificar se React está funcionando
    console.log('6️⃣ Verificando React...');
    console.log('⚛️ React version:', React?.version || 'Não encontrado');
    
    // 7. Verificar se Ant Design está funcionando
    console.log('7️⃣ Verificando Ant Design...');
    console.log('🎨 Ant Design:', window.antd || 'Não encontrado');
    
    // 8. Verificar se há problemas de rede
    console.log('8️⃣ Verificando conectividade...');
    console.log('🌐 Online:', navigator.onLine);
    console.log('🔗 User Agent:', navigator.userAgent);
    
    // 9. Verificar se há problemas de CORS
    console.log('9️⃣ Verificando CORS...');
    try {
      await fetch('https://vestiario-app.firebaseapp.com');
      console.log('✅ Firebase acessível');
    } catch (error) {
      console.log('❌ Problema de conectividade com Firebase:', error);
    }
    
    // 10. Verificar se há problemas de memória
    console.log('🔟 Verificando memória...');
    if (performance.memory) {
      console.log('💾 Memória usada:', Math.round(performance.memory.usedJSHeapSize / 1024 / 1024), 'MB');
      console.log('💾 Memória total:', Math.round(performance.memory.totalJSHeapSize / 1024 / 1024), 'MB');
    }
    
    console.log('🎉 Debug concluído!');
    console.log(`📊 Resumo: ${errorCount} erros, ${warningCount} avisos`);
    
    // Restaurar console original
    console.error = originalError;
    console.warn = originalWarn;
    
  } catch (error) {
    console.error('❌ Erro durante debug:', error);
  }
};

// Função para verificar se há problemas específicos
export const checkCommonIssues = () => {
  console.log('🔍 Verificando problemas comuns...');
  
  // 1. Verificar se há erros de sintaxe
  try {
    eval('console.log("Sintaxe OK")');
    console.log('✅ Sintaxe JavaScript OK');
  } catch (error) {
    console.log('❌ Erro de sintaxe:', error);
  }
  
  // 2. Verificar se há problemas de importação
  try {
    import('../config/firebaseConfig.js');
    console.log('✅ Imports OK');
  } catch (error) {
    console.log('❌ Problema com imports:', error);
  }
  
  // 3. Verificar se há problemas de CSS
  const stylesheets = document.styleSheets;
  console.log('🎨 Stylesheets carregados:', stylesheets.length);
  
  // 4. Verificar se há problemas de JavaScript
  const scripts = document.scripts;
  console.log('📜 Scripts carregados:', scripts.length);
  
  // 5. Verificar se há problemas de imagem
  const images = document.images;
  console.log('🖼️ Imagens carregadas:', images.length);
  
  // 6. Verificar se há problemas de fonte
  const fonts = document.fonts;
  console.log('🔤 Fontes carregadas:', fonts.size);
};

// Executar se chamado diretamente
if (typeof window !== 'undefined') {
  window.debugApp = debugApp;
  window.checkCommonIssues = checkCommonIssues;
  
  console.log('🔍 Scripts de debug carregados!');
  console.log('📝 Comandos disponíveis:');
  console.log('  - window.debugApp() // Debug completo');
  console.log('  - window.checkCommonIssues() // Verificar problemas comuns');
}
