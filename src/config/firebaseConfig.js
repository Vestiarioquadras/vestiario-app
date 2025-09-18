// 🔥 Configuração Firebase para o Projeto Vestiário
// Substitua os valores abaixo pelas suas chaves do Firebase Console

import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';
import { getAnalytics } from 'firebase/analytics';

// ✅ Configuração Firebase do Projeto Vestiário
// Chaves obtidas do Firebase Console
const firebaseConfig = {
  apiKey: "AIzaSyAVm8oXvmvihuJKHvTzRHaOv_EEpOi88cQ",
  authDomain: "vestiario-app.firebaseapp.com",
  projectId: "vestiario-app",
  storageBucket: "vestiario-app.firebasestorage.app",
  messagingSenderId: "949094762365",
  appId: "1:949094762365:web:830aea7789187cd202ee14",
  measurementId: "G-DXKBHNE0EM"
};

// Inicializar Firebase
const app = initializeApp(firebaseConfig);

// Inicializar serviços Firebase
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);
export const analytics = getAnalytics(app);

// Exportar app para uso em outros lugares
export default app;

// ✅ CONFIGURAÇÃO CONCLUÍDA!
// Projeto: Vestiario App
// Firebase Console: https://console.firebase.google.com/project/vestiario-app
// 
// Serviços configurados:
// ✅ Authentication (Email/Password)
// ✅ Firestore Database
// ✅ Storage
// ✅ Analytics
// 
// Próximos passos:
// 1. Configurar regras de segurança no Firestore
// 2. Testar autenticação
// 3. Testar CRUD de dados
