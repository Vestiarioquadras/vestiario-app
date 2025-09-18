// 🔧 Script para atualizar regras do Firestore
// Este script fornece instruções para atualizar as regras manualmente

export const updateFirestoreRules = () => {
  console.log('🔧 === ATUALIZAR REGRAS DO FIRESTORE ===');
  console.log('');
  console.log('📋 INSTRUÇÕES:');
  console.log('');
  console.log('1. Acesse o Firebase Console:');
  console.log('   https://console.firebase.google.com/project/vestiario-app');
  console.log('');
  console.log('2. Vá para Firestore Database > Regras');
  console.log('');
  console.log('3. Substitua o conteúdo atual pelas regras de desenvolvimento:');
  console.log('');
  console.log('   rules_version = \'2\';');
  console.log('   service cloud.firestore {');
  console.log('     match /databases/{database}/documents {');
  console.log('       // 🔓 Regras de desenvolvimento - mais permissivas');
  console.log('       // ⚠️ NÃO usar em produção!');
  console.log('       ');
  console.log('       // Permitir leitura e escrita para usuários autenticados');
  console.log('       match /{document=**} {');
  console.log('         allow read, write: if request.auth != null;');
  console.log('       }');
  console.log('     }');
  console.log('   }');
  console.log('');
  console.log('4. Clique em "Publicar"');
  console.log('');
  console.log('5. Aguarde alguns segundos para as regras serem aplicadas');
  console.log('');
  console.log('6. Recarregue a página da aplicação');
  console.log('');
  console.log('✅ Após isso, todas as funcionalidades devem funcionar!');
  console.log('');
  console.log('🔧 === FIM INSTRUÇÕES ===');
};

// Executar se chamado diretamente
if (typeof window !== 'undefined') {
  // No navegador, adicionar ao window para uso no console
  window.updateFirestoreRules = {
    updateFirestoreRules
  };
  
  console.log('🔧 Script de atualização de regras carregado!');
  console.log('📝 Comando disponível:');
  console.log('  - window.updateFirestoreRules.updateFirestoreRules() // Ver instruções');
}

