// 🔍 Script para verificar TODOS os dados do Firestore
import { db } from '../config/firebaseConfig';
import { collection, getDocs } from 'firebase/firestore';

// Função para verificar todos os dados
export const checkAllFirestoreData = async () => {
  try {
    console.log('🔍 === VERIFICANDO TODOS OS DADOS DO FIRESTORE ===');
    
    // Verificar esportes
    console.log('🏆 Verificando TODOS os esportes...');
    const sportsSnapshot = await getDocs(collection(db, 'sports'));
    const allSports = sportsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    console.log('Total de esportes:', allSports.length);
    allSports.forEach(sport => console.log('  -', sport.name, '(ID:', sport.id, ')'));
    
    // Verificar TODAS as quadras
    console.log('🏟️ Verificando TODAS as quadras...');
    const allCourtsSnapshot = await getDocs(collection(db, 'courts'));
    const allCourts = allCourtsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    console.log('Total de quadras:', allCourts.length);
    allCourts.forEach(court => console.log('  -', court.name, '(Dono:', court.ownerId, ')'));
    
    // Verificar TODAS as reservas
    console.log('📅 Verificando TODAS as reservas...');
    const allBookingsSnapshot = await getDocs(collection(db, 'bookings'));
    const allBookings = allBookingsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    console.log('Total de reservas:', allBookings.length);
    allBookings.forEach(booking => console.log('  - Reserva', booking.id, '(Jogador:', booking.playerId, ', Quadra:', booking.courtId, ')'));
    
    // Verificar TODAS as partidas
    console.log('🏆 Verificando TODAS as partidas...');
    const allMatchesSnapshot = await getDocs(collection(db, 'matches'));
    const allMatches = allMatchesSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    console.log('Total de partidas:', allMatches.length);
    allMatches.forEach(match => console.log('  - Partida', match.id, '(Jogador:', match.playerId, ', Data:', match.date, ')'));
    
    // Verificar TODOS os favoritos
    console.log('❤️ Verificando TODOS os favoritos...');
    const allFavoritesSnapshot = await getDocs(collection(db, 'favorites'));
    const allFavorites = allFavoritesSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    console.log('Total de favoritos:', allFavorites.length);
    allFavorites.forEach(favorite => console.log('  - Favorito', favorite.id, '(Usuário:', favorite.userId, ', Quadra:', favorite.courtId, ')'));
    
    // Verificar TODOS os usuários
    console.log('👥 Verificando TODOS os usuários...');
    const allUsersSnapshot = await getDocs(collection(db, 'users'));
    const allUsers = allUsersSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    console.log('Total de usuários:', allUsers.length);
    allUsers.forEach(user => console.log('  - Usuário:', user.email, '(Role:', user.role, ', UID:', user.uid, ')'));
    
    console.log('🔍 === RESUMO ===');
    console.log('📊 Estatísticas:');
    console.log('  - Esportes:', allSports.length);
    console.log('  - Quadras:', allCourts.length);
    console.log('  - Reservas:', allBookings.length);
    console.log('  - Partidas:', allMatches.length);
    console.log('  - Favoritos:', allFavorites.length);
    console.log('  - Usuários:', allUsers.length);
    
    // Verificar se há dados para o usuário atual
    const currentUser = allUsers.find(u => u.email === 'jogador@vestiario.com');
    if (currentUser) {
      console.log('👤 Usuário atual encontrado:', currentUser);
      console.log('🔍 Verificando dados específicos do usuário atual...');
      
      const userCourts = allCourts.filter(c => c.ownerId === currentUser.uid);
      const userBookings = allBookings.filter(b => b.playerId === currentUser.uid);
      const userMatches = allMatches.filter(m => m.playerId === currentUser.uid);
      const userFavorites = allFavorites.filter(f => f.userId === currentUser.uid);
      
      console.log('  - Quadras do usuário:', userCourts.length);
      console.log('  - Reservas do usuário:', userBookings.length);
      console.log('  - Partidas do usuário:', userMatches.length);
      console.log('  - Favoritos do usuário:', userFavorites.length);
    }
    
    console.log('🔍 === FIM VERIFICAÇÃO ===');
    
    return {
      sports: allSports,
      courts: allCourts,
      bookings: allBookings,
      matches: allMatches,
      favorites: allFavorites,
      users: allUsers
    };
    
  } catch (error) {
    console.error('❌ Erro ao verificar dados:', error);
    throw error;
  }
};

// Executar se chamado diretamente
if (typeof window !== 'undefined') {
  // No navegador, adicionar ao window para uso no console
  window.checkAllFirestoreData = {
    checkAllFirestoreData
  };
  
  console.log('🔍 Script de verificação completa carregado!');
  console.log('📝 Comando disponível:');
  console.log('  - window.checkAllFirestoreData.checkAllFirestoreData() // Verificar todos os dados');
}

