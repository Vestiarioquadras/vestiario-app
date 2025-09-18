// 🗑️ Script para limpar dados do Firestore
import { db } from '../config/firebaseConfig';
import { collection, getDocs, deleteDoc, doc, query, where } from 'firebase/firestore';
import { auth } from '../config/firebaseConfig';

// Função para verificar se o usuário está autenticado
const checkAuth = () => {
  if (!auth.currentUser) {
    throw new Error('❌ Usuário não está autenticado. Faça login primeiro!');
  }
  return auth.currentUser;
};

// Função para limpar esportes
export const clearSports = async () => {
  try {
    checkAuth(); // Verificar autenticação
    console.log('🗑️ Limpando esportes...');
    
    const sportsSnapshot = await getDocs(collection(db, 'sports'));
    const deletePromises = sportsSnapshot.docs.map(doc => deleteDoc(doc.ref));
    await Promise.all(deletePromises);
    
    console.log('✅ Esportes removidos com sucesso!');
  } catch (error) {
    console.error('❌ Erro ao limpar esportes:', error);
    throw error;
  }
};

// Função para limpar quadras do usuário logado
export const clearCourts = async () => {
  try {
    const user = checkAuth(); // Verificar autenticação
    console.log('🗑️ Limpando quadras do usuário:', user.uid);
    
    const courtsQuery = query(
      collection(db, 'courts'),
      where('ownerId', '==', user.uid)
    );
    const courtsSnapshot = await getDocs(courtsQuery);
    const deletePromises = courtsSnapshot.docs.map(doc => deleteDoc(doc.ref));
    await Promise.all(deletePromises);
    
    console.log('✅ Quadras removidas com sucesso!');
  } catch (error) {
    console.error('❌ Erro ao limpar quadras:', error);
    throw error;
  }
};

// Função para limpar reservas do usuário logado
export const clearBookings = async () => {
  try {
    const user = checkAuth(); // Verificar autenticação
    console.log('🗑️ Limpando reservas do usuário:', user.uid);
    
    const bookingsQuery = query(
      collection(db, 'bookings'),
      where('playerId', '==', user.uid)
    );
    const bookingsSnapshot = await getDocs(bookingsQuery);
    const deletePromises = bookingsSnapshot.docs.map(doc => deleteDoc(doc.ref));
    await Promise.all(deletePromises);
    
    console.log('✅ Reservas removidas com sucesso!');
  } catch (error) {
    console.error('❌ Erro ao limpar reservas:', error);
    throw error;
  }
};

// Função para limpar partidas do usuário logado
export const clearMatches = async () => {
  try {
    const user = checkAuth(); // Verificar autenticação
    console.log('🗑️ Limpando partidas do usuário:', user.uid);
    
    const matchesQuery = query(
      collection(db, 'matches'),
      where('playerId', '==', user.uid)
    );
    const matchesSnapshot = await getDocs(matchesQuery);
    const deletePromises = matchesSnapshot.docs.map(doc => deleteDoc(doc.ref));
    await Promise.all(deletePromises);
    
    console.log('✅ Partidas removidas com sucesso!');
  } catch (error) {
    console.error('❌ Erro ao limpar partidas:', error);
    throw error;
  }
};

// Função para limpar favoritos do usuário logado
export const clearFavorites = async () => {
  try {
    const user = checkAuth(); // Verificar autenticação
    console.log('🗑️ Limpando favoritos do usuário:', user.uid);
    
    const favoritesQuery = query(
      collection(db, 'favorites'),
      where('userId', '==', user.uid)
    );
    const favoritesSnapshot = await getDocs(favoritesQuery);
    const deletePromises = favoritesSnapshot.docs.map(doc => deleteDoc(doc.ref));
    await Promise.all(deletePromises);
    
    console.log('✅ Favoritos removidos com sucesso!');
  } catch (error) {
    console.error('❌ Erro ao limpar favoritos:', error);
    throw error;
  }
};

// Função para limpar horários bloqueados do usuário logado
export const clearBlockedSlots = async () => {
  try {
    const user = checkAuth(); // Verificar autenticação
    console.log('🗑️ Limpando horários bloqueados do usuário:', user.uid);
    
    // Primeiro buscar as quadras do usuário
    const courtsQuery = query(
      collection(db, 'courts'),
      where('ownerId', '==', user.uid)
    );
    const courtsSnapshot = await getDocs(courtsQuery);
    const courtIds = courtsSnapshot.docs.map(doc => doc.id);
    
    if (courtIds.length === 0) {
      console.log('⚠️ Nenhuma quadra encontrada para limpar horários bloqueados.');
      return;
    }
    
    // Buscar horários bloqueados para essas quadras
    const blockedQuery = query(
      collection(db, 'blockedSlots'),
      where('courtId', 'in', courtIds)
    );
    const blockedSnapshot = await getDocs(blockedQuery);
    const deletePromises = blockedSnapshot.docs.map(doc => deleteDoc(doc.ref));
    await Promise.all(deletePromises);
    
    console.log('✅ Horários bloqueados removidos com sucesso!');
  } catch (error) {
    console.error('❌ Erro ao limpar horários bloqueados:', error);
    throw error;
  }
};

// Função para limpar todos os dados do usuário
export const clearAllUserData = async () => {
  try {
    console.log('🗑️ Limpando todos os dados do usuário...');
    
    await clearCourts();
    await clearBookings();
    await clearMatches();
    await clearFavorites();
    await clearBlockedSlots();
    
    console.log('✅ Todos os dados do usuário foram removidos!');
  } catch (error) {
    console.error('❌ Erro ao limpar dados do usuário:', error);
    throw error;
  }
};

// Função para limpar todos os dados (incluindo esportes)
export const clearAllData = async () => {
  try {
    console.log('🗑️ Limpando todos os dados do Firestore...');
    
    await clearSports();
    await clearAllUserData();
    
    console.log('✅ Todos os dados foram removidos!');
    console.log('🎉 Firestore limpo com sucesso!');
  } catch (error) {
    console.error('❌ Erro ao limpar dados:', error);
    throw error;
  }
};

// Executar se chamado diretamente
if (typeof window !== 'undefined') {
  // No navegador, adicionar ao window para uso no console
  window.clearFirestoreData = {
    clearSports,
    clearCourts,
    clearBookings,
    clearMatches,
    clearFavorites,
    clearBlockedSlots,
    clearAllUserData,
    clearAllData
  };
  
  console.log('🗑️ Script de limpeza carregado!');
  console.log('📝 Comandos disponíveis:');
  console.log('  - window.clearFirestoreData.clearAllData() // Limpar tudo');
  console.log('  - window.clearFirestoreData.clearAllUserData() // Limpar apenas dados do usuário');
  console.log('  - window.clearFirestoreData.clearSports() // Limpar apenas esportes');
}

