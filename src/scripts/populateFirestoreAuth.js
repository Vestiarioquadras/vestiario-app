// 🔥 Script para popular o Firestore com dados iniciais (requer autenticação)
import { db } from '../config/firebaseConfig';
import { collection, addDoc, serverTimestamp, getDocs, query, where } from 'firebase/firestore';
import { auth } from '../config/firebaseConfig';

// Dados iniciais para esportes
const initialSports = [
  { id: 'futebol', name: 'Futebol', icon: '⚽', description: 'Esporte mais popular do mundo' },
  { id: 'basquete', name: 'Basquete', icon: '🏀', description: 'Esporte de quadra com cesta' },
  { id: 'tenis', name: 'Tênis', icon: '🎾', description: 'Esporte de raquete individual ou duplas' },
  { id: 'padel', name: 'Padel', icon: '🏓', description: 'Esporte de raquete em quadra fechada' },
  { id: 'volei', name: 'Vôlei', icon: '🏐', description: 'Esporte de quadra com rede' },
  { id: 'futsal', name: 'Futsal', icon: '⚽', description: 'Futebol de salão' },
  { id: 'handebol', name: 'Handebol', icon: '🤾', description: 'Esporte de quadra com as mãos' },
  { id: 'badminton', name: 'Badminton', icon: '🏸', description: 'Esporte de raquete com peteca' }
];

// Função para verificar se o usuário está autenticado
const checkAuth = () => {
  if (!auth.currentUser) {
    throw new Error('❌ Usuário não está autenticado. Faça login primeiro!');
  }
  return auth.currentUser;
};

// Função para popular esportes
export const populateSports = async () => {
  try {
    checkAuth(); // Verificar autenticação
    console.log('🏆 Populando esportes...');
    
    for (const sport of initialSports) {
      await addDoc(collection(db, 'sports'), {
        ...sport,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      });
    }
    
    console.log('✅ Esportes populados com sucesso!');
  } catch (error) {
    console.error('❌ Erro ao popular esportes:', error);
    throw error;
  }
};

// Função para popular quadras (apenas para o usuário logado)
export const populateCourts = async () => {
  try {
    const user = checkAuth(); // Verificar autenticação
    console.log('🏟️ Populando quadras...');
    
    const initialCourts = [
      {
        name: 'Quadra São Paulo',
        sport: 'futebol',
        location: 'São Paulo, SP',
        address: 'Rua das Flores, 123 - Vila Madalena',
        price: 80.00,
        description: 'Quadra de futebol society com gramado sintético',
        amenities: ['Vestiário', 'Estacionamento', 'Lanchonete'],
        ownerId: user.uid, // ID do usuário logado
        ownerName: user.displayName || 'Proprietário',
        phone: '(11) 3333-4444',
        email: user.email,
        images: ['https://via.placeholder.com/400x300?text=Quadra+São+Paulo'],
        availability: {
          monday: { start: '06:00', end: '23:00' },
          tuesday: { start: '06:00', end: '23:00' },
          wednesday: { start: '06:00', end: '23:00' },
          thursday: { start: '06:00', end: '23:00' },
          friday: { start: '06:00', end: '23:00' },
          saturday: { start: '06:00', end: '23:00' },
          sunday: { start: '06:00', end: '23:00' }
        },
        rating: 4.5,
        totalReviews: 23
      },
      {
        name: 'Sports Center RJ',
        sport: 'basquete',
        location: 'Rio de Janeiro, RJ',
        address: 'Av. Copacabana, 456 - Copacabana',
        price: 60.00,
        description: 'Quadra de basquete coberta com piso profissional',
        amenities: ['Vestiário', 'Estacionamento', 'Ar condicionado'],
        ownerId: user.uid, // ID do usuário logado
        ownerName: user.displayName || 'Proprietário',
        phone: '(11) 3333-4444',
        email: user.email,
        images: ['https://via.placeholder.com/400x300?text=Sports+Center+RJ'],
        availability: {
          monday: { start: '07:00', end: '22:00' },
          tuesday: { start: '07:00', end: '22:00' },
          wednesday: { start: '07:00', end: '22:00' },
          thursday: { start: '07:00', end: '22:00' },
          friday: { start: '07:00', end: '22:00' },
          saturday: { start: '08:00', end: '20:00' },
          sunday: { start: '08:00', end: '20:00' }
        },
        rating: 4.8,
        totalReviews: 15
      }
    ];
    
    for (const court of initialCourts) {
      await addDoc(collection(db, 'courts'), {
        ...court,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      });
    }
    
    console.log('✅ Quadras populadas com sucesso!');
  } catch (error) {
    console.error('❌ Erro ao popular quadras:', error);
    throw error;
  }
};

// Função para popular reservas de teste
export const populateBookings = async () => {
  try {
    const user = checkAuth();
    console.log('📅 Populando reservas de teste...');
    
    // Buscar quadras do usuário
    const courtsSnapshot = await getDocs(query(
      collection(db, 'courts'),
      where('ownerId', '==', user.uid)
    ));
    
    if (courtsSnapshot.empty) {
      console.log('⚠️ Nenhuma quadra encontrada. Execute populateCourts() primeiro.');
      return;
    }
    
    const courts = courtsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    const court = courts[0]; // Usar a primeira quadra
    
    // Criar algumas reservas de teste
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
      }
    ];
    
    for (const booking of bookingsData) {
      await addDoc(collection(db, 'bookings'), booking);
    }
    
    console.log('✅ Reservas de teste criadas com sucesso!');
  } catch (error) {
    console.error('❌ Erro ao popular reservas:', error);
    throw error;
  }
};

// Função para popular partidas de teste
export const populateMatches = async () => {
  try {
    const user = checkAuth();
    console.log('🏆 Populando partidas de teste...');
    
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
      }
    ];
    
    for (const match of matchesData) {
      await addDoc(collection(db, 'matches'), match);
    }
    
    console.log('✅ Partidas de teste criadas com sucesso!');
  } catch (error) {
    console.error('❌ Erro ao popular partidas:', error);
    throw error;
  }
};

// Função para popular todos os dados
export const populateAllData = async () => {
  try {
    console.log('🚀 Iniciando população do Firestore...');
    
    await populateSports();
    await populateCourts();
    await populateBookings();
    await populateMatches();
    
    console.log('🎉 Firestore populado com sucesso!');
  } catch (error) {
    console.error('❌ Erro ao popular Firestore:', error);
    throw error;
  }
};

// Executar se chamado diretamente
if (typeof window !== 'undefined') {
  // No navegador, adicionar ao window para uso no console
  window.populateFirestoreAuth = {
    populateSports,
    populateCourts,
    populateAllData
  };
  
  console.log('🔥 Script de população do Firestore (com autenticação) carregado!');
  console.log('💡 Use: window.populateFirestoreAuth.populateAllData() para popular todos os dados');
  console.log('⚠️  Certifique-se de estar logado antes de executar!');
}
