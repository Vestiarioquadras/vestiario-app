// 🧪 Script de Teste Firebase
// Execute este script para testar a conexão com Firebase

import { initializeApp } from 'firebase/app';
import { getAuth, connectAuthEmulator } from 'firebase/auth';
import { getFirestore, connectFirestoreEmulator } from 'firebase/firestore';

// Configuração de teste (substitua pelas suas chaves)
const firebaseConfig = {
  apiKey: "SUA_API_KEY_AQUI",
  authDomain: "seu-projeto.firebaseapp.com",
  projectId: "seu-projeto-id",
  storageBucket: "seu-projeto.appspot.com",
  messagingSenderId: "123456789",
  appId: "1:123456789:web:abcdef123456"
};

console.log('🔥 Testando conexão com Firebase...');

try {
  // Inicializar Firebase
  const app = initializeApp(firebaseConfig);
  console.log('✅ Firebase inicializado com sucesso!');

  // Testar Auth
  const auth = getAuth(app);
  console.log('✅ Firebase Auth configurado!');

  // Testar Firestore
  const db = getFirestore(app);
  console.log('✅ Firestore configurado!');

  console.log('🎉 Todos os serviços Firebase estão funcionando!');
  
} catch (error) {
  console.error('❌ Erro ao configurar Firebase:', error);
  console.log('📋 Verifique se:');
  console.log('   1. As chaves estão corretas');
  console.log('   2. O projeto está ativo no Firebase Console');
  console.log('   3. Authentication e Firestore estão habilitados');
}
