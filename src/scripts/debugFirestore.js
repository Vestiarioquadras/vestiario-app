// 🔍 Script de Debug para verificar dados do Firestore
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

// Função para debug geral
export const debugAllData = async () => {
  try {
    const user = checkAuth();
    console.log('🔍 === DEBUG FIREBASE ===');
    console.log('👤 Usuário logado:', {
      uid: user.uid,
      email: user.email,
      displayName: user.displayName
    });
    
    // Verificar esportes
    console.log('🏆 Verificando esportes...');
    const sportsSnapshot = await getDocs(collection(db, 'sports'));
    const sports = sportsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    console.log('Esportes encontrados:', sports.length, sports);
    
    // Verificar quadras do usuário
    console.log('🏟️ Verificando quadras do usuário...');
    const courtsQuery = query(
      collection(db, 'courts'),
      where('ownerId', '==', user.uid)
    );
    const courtsSnapshot = await getDocs(courtsQuery);
    const courts = courtsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    console.log('Quadras do usuário:', courts.length, courts);
    
    // Verificar reservas do usuário
    console.log('📅 Verificando reservas do usuário...');
    const bookingsQuery = query(
      collection(db, 'bookings'),
      where('playerId', '==', user.uid)
    );
    const bookingsSnapshot = await getDocs(bookingsQuery);
    const bookings = bookingsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    console.log('Reservas do usuário:', bookings.length, bookings);
    
    // Verificar reservas do dono
    console.log('📅 Verificando reservas do dono...');
    const ownerBookingsQuery = query(
      collection(db, 'bookings'),
      where('courtOwnerId', '==', user.uid)
    );
    const ownerBookingsSnapshot = await getDocs(ownerBookingsQuery);
    const ownerBookings = ownerBookingsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    console.log('Reservas do dono:', ownerBookings.length, ownerBookings);
    
    // Verificar partidas
    console.log('🏆 Verificando partidas...');
    const matchesQuery = query(
      collection(db, 'matches'),
      where('playerId', '==', user.uid)
    );
    const matchesSnapshot = await getDocs(matchesQuery);
    const matches = matchesSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    console.log('Partidas do usuário:', matches.length, matches);
    
    // Verificar favoritos
    console.log('❤️ Verificando favoritos...');
    const favoritesQuery = query(
      collection(db, 'favorites'),
      where('userId', '==', user.uid)
    );
    const favoritesSnapshot = await getDocs(favoritesQuery);
    const favorites = favoritesSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    console.log('Favoritos do usuário:', favorites.length, favorites);
    
    console.log('🔍 === FIM DEBUG ===');
    
    return {
      user: { uid: user.uid, email: user.email, displayName: user.displayName },
      sports: sports,
      courts: courts,
      bookings: bookings,
      ownerBookings: ownerBookings,
      matches: matches,
      favorites: favorites
    };
    
  } catch (error) {
    console.error('❌ Erro no debug:', error);
    throw error;
  }
};

// Função para testar serviços específicos
export const testServices = async () => {
  try {
    const user = checkAuth();
    console.log('🧪 === TESTANDO SERVIÇOS ===');
    
    // Importar serviços
    const { sportsService, courtsService, bookingsService, favoritesService, matchHistoryService } = await import('../services/firestoreService');
    
    console.log('🏆 Testando sportsService.getAllSports()...');
    const sports = await sportsService.getAllSports();
    console.log('Resultado:', sports);
    
    console.log('🏟️ Testando courtsService.getCourtsByOwner()...');
    const courts = await courtsService.getCourtsByOwner(user.uid);
    console.log('Resultado:', courts);
    
    console.log('📅 Testando bookingsService.getUserBookings()...');
    const bookings = await bookingsService.getUserBookings(user.uid);
    console.log('Resultado:', bookings);
    
    console.log('❤️ Testando favoritesService.getFavoriteCourts()...');
    const favorites = await favoritesService.getFavoriteCourts(user.uid);
    console.log('Resultado:', favorites);
    
    console.log('🏆 Testando matchHistoryService.getMatchHistory()...');
    const matches = await matchHistoryService.getMatchHistory(user.uid);
    console.log('Resultado:', matches);
    
    console.log('🧪 === FIM TESTE SERVIÇOS ===');
    
  } catch (error) {
    console.error('❌ Erro ao testar serviços:', error);
    throw error;
  }
};

// Executar se chamado diretamente
if (typeof window !== 'undefined') {
  // No navegador, adicionar ao window para uso no console
  window.debugFirestore = {
    debugAllData,
    testServices
  };
  
  console.log('🔍 Script de debug carregado!');
  console.log('📝 Comandos disponíveis:');
  console.log('  - window.debugFirestore.debugAllData() // Debug completo');
  console.log('  - window.debugFirestore.testServices() // Testar serviços');
}

