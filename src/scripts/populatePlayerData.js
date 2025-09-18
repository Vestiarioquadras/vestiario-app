// 🎮 Script para popular dados do jogador
import { db } from '../config/firebaseConfig';
import { collection, addDoc, serverTimestamp, getDocs } from 'firebase/firestore';
import { auth } from '../config/firebaseConfig';

// Função para verificar se o usuário está autenticado
const checkAuth = () => {
  if (!auth.currentUser) {
    throw new Error('❌ Usuário não está autenticado. Faça login primeiro!');
  }
  return auth.currentUser;
};

// Função para popular reservas do jogador
export const populatePlayerBookings = async () => {
  try {
    const user = checkAuth();
    console.log('📅 Populando reservas do jogador...');
    
    // Buscar quadras disponíveis
    const courtsSnapshot = await getDocs(collection(db, 'courts'));
    const courts = courtsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    
    if (courts.length === 0) {
      console.log('⚠️ Nenhuma quadra encontrada. Execute populateCourts() primeiro.');
      return;
    }
    
    const court = courts[0]; // Usar a primeira quadra
    
    // Criar algumas reservas de teste para o jogador
    const bookingsData = [
      {
        courtId: court.id,
        courtName: court.name,
        playerId: user.uid,
        playerName: user.displayName || 'Jogador Teste',
        date: new Date().toISOString().split('T')[0], // Hoje
        time: '10:00',
        status: 'confirmed',
        sport: court.sport,
        price: court.price,
        totalPrice: court.price,
        createdAt: serverTimestamp()
      },
      {
        courtId: court.id,
        courtName: court.name,
        playerId: user.uid,
        playerName: user.displayName || 'Jogador Teste',
        date: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString().split('T')[0], // Amanhã
        time: '14:00',
        status: 'pending',
        sport: court.sport,
        price: court.price,
        totalPrice: court.price,
        createdAt: serverTimestamp()
      },
      {
        courtId: court.id,
        courtName: court.name,
        playerId: user.uid,
        playerName: user.displayName || 'Jogador Teste',
        date: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // Depois de amanhã
        time: '16:00',
        status: 'confirmed',
        sport: court.sport,
        price: court.price,
        totalPrice: court.price,
        createdAt: serverTimestamp()
      }
    ];
    
    for (const booking of bookingsData) {
      await addDoc(collection(db, 'bookings'), booking);
    }
    
    console.log('✅ Reservas do jogador criadas com sucesso!');
  } catch (error) {
    console.error('❌ Erro ao popular reservas do jogador:', error);
    throw error;
  }
};

// Função para popular partidas do jogador
export const populatePlayerMatches = async () => {
  try {
    const user = checkAuth();
    console.log('🏆 Populando partidas do jogador...');
    
    const matchesData = [
      {
        playerId: user.uid,
        date: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 7 dias atrás
        opponent: 'Time Alpha',
        score: '3-2',
        result: 'win',
        sport: 'futebol',
        courtName: 'Quadra Central',
        createdAt: serverTimestamp()
      },
      {
        playerId: user.uid,
        date: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 14 dias atrás
        opponent: 'Time Beta',
        score: '1-4',
        result: 'loss',
        sport: 'futebol',
        courtName: 'Quadra Lateral',
        createdAt: serverTimestamp()
      },
      {
        playerId: user.uid,
        date: new Date(Date.now() - 21 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 21 dias atrás
        opponent: 'Time Gamma',
        score: '2-1',
        result: 'win',
        sport: 'futebol',
        courtName: 'Quadra Principal',
        createdAt: serverTimestamp()
      },
      {
        playerId: user.uid,
        date: new Date(Date.now() - 28 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 28 dias atrás
        opponent: 'Time Delta',
        score: '0-3',
        result: 'loss',
        sport: 'futebol',
        courtName: 'Quadra Norte',
        createdAt: serverTimestamp()
      },
      {
        playerId: user.uid,
        date: new Date(Date.now() - 35 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 35 dias atrás
        opponent: 'Time Epsilon',
        score: '4-1',
        result: 'win',
        sport: 'futebol',
        courtName: 'Quadra Sul',
        createdAt: serverTimestamp()
      }
    ];
    
    for (const match of matchesData) {
      await addDoc(collection(db, 'matches'), match);
    }
    
    console.log('✅ Partidas do jogador criadas com sucesso!');
  } catch (error) {
    console.error('❌ Erro ao popular partidas do jogador:', error);
    throw error;
  }
};

// Função para popular favoritos do jogador
export const populatePlayerFavorites = async () => {
  try {
    const user = checkAuth();
    console.log('❤️ Populando favoritos do jogador...');
    
    // Buscar quadras disponíveis
    const courtsSnapshot = await getDocs(collection(db, 'courts'));
    const courts = courtsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    
    if (courts.length === 0) {
      console.log('⚠️ Nenhuma quadra encontrada. Execute populateCourts() primeiro.');
      return;
    }
    
    // Adicionar algumas quadras aos favoritos
    const favoritesData = courts.slice(0, 2).map(court => ({
      userId: user.uid,
      courtId: court.id,
      createdAt: serverTimestamp()
    }));
    
    for (const favorite of favoritesData) {
      await addDoc(collection(db, 'favorites'), favorite);
    }
    
    console.log('✅ Favoritos do jogador criados com sucesso!');
  } catch (error) {
    console.error('❌ Erro ao popular favoritos do jogador:', error);
    throw error;
  }
};

// Função para popular todos os dados do jogador
export const populateAllPlayerData = async () => {
  try {
    console.log('🎮 Iniciando população de dados do jogador...');
    
    await populatePlayerBookings();
    await populatePlayerMatches();
    await populatePlayerFavorites();
    
    console.log('🎉 Dados do jogador populados com sucesso!');
    console.log('🎮 Agora você pode testar todas as funcionalidades do jogador!');
  } catch (error) {
    console.error('❌ Erro ao popular dados do jogador:', error);
    throw error;
  }
};

// Executar se chamado diretamente
if (typeof window !== 'undefined') {
  // No navegador, adicionar ao window para uso no console
  window.populatePlayerData = {
    populatePlayerBookings,
    populatePlayerMatches,
    populatePlayerFavorites,
    populateAllPlayerData
  };
  
  console.log('🎮 Script de dados do jogador carregado!');
  console.log('📝 Comandos disponíveis:');
  console.log('  - window.populatePlayerData.populateAllPlayerData() // Popular todos os dados do jogador');
  console.log('  - window.populatePlayerData.populatePlayerBookings() // Popular apenas reservas');
  console.log('  - window.populatePlayerData.populatePlayerMatches() // Popular apenas partidas');
  console.log('  - window.populatePlayerData.populatePlayerFavorites() // Popular apenas favoritos');
}
