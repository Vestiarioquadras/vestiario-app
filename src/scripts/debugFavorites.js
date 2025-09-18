// 🔍 Script para debugar funcionalidade de favoritos
import { db } from '../config/firebaseConfig.js';
import { collection, getDocs, query, where, addDoc, deleteDoc, doc, writeBatch } from 'firebase/firestore';
import { auth } from '../config/firebaseConfig';

// Função para verificar se o usuário está autenticado
const checkAuth = () => {
  if (!auth.currentUser) {
    throw new Error('❌ Usuário não está autenticado. Faça login primeiro!');
  }
  return auth.currentUser;
};

// Função para testar adicionar favorito
export const testAddFavorite = async (courtId) => {
  try {
    const user = checkAuth();
    console.log('❤️ Testando adicionar favorito...');
    console.log('👤 Usuário:', user.uid, user.email);
    console.log('🏟️ Court ID:', courtId);
    
    const favoriteData = {
      userId: user.uid,
      courtId: courtId,
      createdAt: new Date()
    };
    
    const docRef = await addDoc(collection(db, 'favorites'), favoriteData);
    console.log('✅ Favorito adicionado com sucesso! ID:', docRef.id);
    
    return docRef.id;
  } catch (error) {
    console.error('❌ Erro ao adicionar favorito:', error);
    throw error;
  }
};

// Função para testar remover favorito
export const testRemoveFavorite = async (courtId) => {
  try {
    const user = checkAuth();
    console.log('🗑️ Testando remover favorito...');
    console.log('👤 Usuário:', user.uid, user.email);
    console.log('🏟️ Court ID:', courtId);
    
    const q = query(
      collection(db, 'favorites'), 
      where('userId', '==', user.uid),
      where('courtId', '==', courtId)
    );
    const querySnapshot = await getDocs(q);
    
    if (querySnapshot.empty) {
      console.log('⚠️ Nenhum favorito encontrado para remover');
      return;
    }
    
    const batch = writeBatch(db);
    querySnapshot.docs.forEach(doc => {
      batch.delete(doc.ref);
    });
    await batch.commit();
    
    console.log('✅ Favorito removido com sucesso!');
  } catch (error) {
    console.error('❌ Erro ao remover favorito:', error);
    throw error;
  }
};

// Função para listar favoritos do usuário
export const listFavorites = async () => {
  try {
    const user = checkAuth();
    console.log('📋 Listando favoritos do usuário...');
    console.log('👤 Usuário:', user.uid, user.email);
    
    const q = query(
      collection(db, 'favorites'), 
      where('userId', '==', user.uid)
    );
    const querySnapshot = await getDocs(q);
    
    const favorites = querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
    
    console.log('❤️ Favoritos encontrados:', favorites.length);
    favorites.forEach((favorite, index) => {
      console.log(`  ${index + 1}. Court ID: ${favorite.courtId} (ID: ${favorite.id})`);
    });
    
    return favorites;
  } catch (error) {
    console.error('❌ Erro ao listar favoritos:', error);
    throw error;
  }
};

// Função para testar funcionalidade completa
export const testFavoritesComplete = async () => {
  try {
    console.log('🧪 === TESTE COMPLETO DE FAVORITOS ===');
    
    // 1. Listar favoritos atuais
    console.log('1️⃣ Listando favoritos atuais...');
    const currentFavorites = await listFavorites();
    
    // 2. Buscar uma quadra para testar
    console.log('2️⃣ Buscando quadras disponíveis...');
    const courtsSnapshot = await getDocs(collection(db, 'courts'));
    const courts = courtsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    
    if (courts.length === 0) {
      console.log('⚠️ Nenhuma quadra encontrada para testar');
      return;
    }
    
    const testCourt = courts[0];
    console.log('🏟️ Quadra de teste:', testCourt.name, '(ID:', testCourt.id, ')');
    
    // 3. Adicionar favorito
    console.log('3️⃣ Adicionando favorito...');
    const favoriteId = await testAddFavorite(testCourt.id);
    
    // 4. Listar favoritos novamente
    console.log('4️⃣ Listando favoritos após adicionar...');
    await listFavorites();
    
    // 5. Remover favorito
    console.log('5️⃣ Removendo favorito...');
    await testRemoveFavorite(testCourt.id);
    
    // 6. Listar favoritos final
    console.log('6️⃣ Listando favoritos após remover...');
    await listFavorites();
    
    console.log('🎉 Teste completo de favoritos concluído!');
    
  } catch (error) {
    console.error('❌ Erro no teste completo:', error);
    throw error;
  }
};

// Executar se chamado diretamente
if (typeof window !== 'undefined') {
  // No navegador, adicionar ao window para uso no console
  window.debugFavorites = {
    testAddFavorite,
    testRemoveFavorite,
    listFavorites,
    testFavoritesComplete
  };
  
  console.log('❤️ Script de debug de favoritos carregado!');
  console.log('📝 Comandos disponíveis:');
  console.log('  - window.debugFavorites.testFavoritesComplete() // Teste completo');
  console.log('  - window.debugFavorites.listFavorites() // Listar favoritos');
  console.log('  - window.debugFavorites.testAddFavorite("courtId") // Adicionar favorito');
  console.log('  - window.debugFavorites.testRemoveFavorite("courtId") // Remover favorito');
}
