// 🏟️ Script para testar quadras
import { db } from '../config/firebaseConfig';
import { collection, getDocs, query, where } from 'firebase/firestore';
import { auth } from '../config/firebaseConfig';

// Função para verificar se o usuário está autenticado
const checkAuth = () => {
  if (!auth.currentUser) {
    throw new Error('❌ Usuário não está autenticado. Faça login primeiro!');
  }
  return auth.currentUser;
};

// Função para testar quadras
export const testCourts = async () => {
  try {
    const user = checkAuth();
    console.log('🏟️ === TESTANDO QUADRAS ===');
    console.log('👤 Usuário:', user.uid, user.email);
    
    // Buscar quadras do usuário
    const courtsQuery = query(
      collection(db, 'courts'),
      where('ownerId', '==', user.uid)
    );
    const courtsSnapshot = await getDocs(courtsQuery);
    const courts = courtsSnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
    
    console.log('📊 Quadras encontradas:', courts.length);
    courts.forEach((court, index) => {
      console.log(`  ${index + 1}. ${court.name} (${court.sport}) - ID: ${court.id}`);
    });
    
    // Verificar se as quadras têm todos os campos necessários
    courts.forEach(court => {
      const requiredFields = ['name', 'sport', 'ownerId', 'price'];
      const missingFields = requiredFields.filter(field => !court[field]);
      
      if (missingFields.length > 0) {
        console.warn(`⚠️ Quadra ${court.name} está faltando campos:`, missingFields);
      } else {
        console.log(`✅ Quadra ${court.name} está completa`);
      }
    });
    
    console.log('🏟️ === FIM TESTE QUADRAS ===');
    
    return courts;
    
  } catch (error) {
    console.error('❌ Erro ao testar quadras:', error);
    throw error;
  }
};

// Função para criar uma quadra de teste
export const createTestCourt = async () => {
  try {
    const user = checkAuth();
    console.log('🏟️ Criando quadra de teste...');
    
    const testCourt = {
      name: 'Quadra de Teste',
      sport: 'futebol',
      location: 'São Paulo, SP',
      address: 'Rua de Teste, 123',
      price: 100.00,
      description: 'Quadra de teste para verificar funcionalidade',
      amenities: ['Vestiário', 'Estacionamento'],
      ownerId: user.uid,
      ownerName: user.displayName || 'Proprietário',
      phone: '(11) 99999-9999',
      email: user.email,
      images: ['https://via.placeholder.com/400x300?text=Quadra+de+Teste'],
      rating: 0,
      totalReviews: 0
    };
    
    const { addDoc, serverTimestamp } = await import('firebase/firestore');
    const docRef = await addDoc(collection(db, 'courts'), {
      ...testCourt,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    });
    
    console.log('✅ Quadra de teste criada com ID:', docRef.id);
    return docRef.id;
    
  } catch (error) {
    console.error('❌ Erro ao criar quadra de teste:', error);
    throw error;
  }
};

// Executar se chamado diretamente
if (typeof window !== 'undefined') {
  // No navegador, adicionar ao window para uso no console
  window.testCourts = {
    testCourts,
    createTestCourt
  };
  
  console.log('🏟️ Script de teste de quadras carregado!');
  console.log('📝 Comandos disponíveis:');
  console.log('  - window.testCourts.testCourts() // Testar quadras existentes');
  console.log('  - window.testCourts.createTestCourt() // Criar quadra de teste');
}

