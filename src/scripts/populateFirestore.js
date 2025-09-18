// 🔥 Script para popular o Firestore com dados iniciais
import { db } from '../config/firebaseConfig';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';

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

// Dados iniciais para quadras (exemplo)
const initialCourts = [
  {
    name: 'Quadra São Paulo',
    sport: 'futebol',
    location: 'São Paulo, SP',
    address: 'Rua das Flores, 123 - Vila Madalena',
    price: 80.00,
    description: 'Quadra de futebol society com gramado sintético',
    amenities: ['Vestiário', 'Estacionamento', 'Lanchonete'],
    ownerId: 'Fy5RBjg88MNfqvE6SfrUGZ9bb2o2', // ID do usuário dono
    ownerName: 'Maria Santos',
    phone: '(11) 3333-4444',
    email: 'dono@vestiario.com',
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
    ownerId: 'Fy5RBjg88MNfqvE6SfrUGZ9bb2o2', // ID do usuário dono
    ownerName: 'Maria Santos',
    phone: '(11) 3333-4444',
    email: 'dono@vestiario.com',
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

// Função para popular esportes
export const populateSports = async () => {
  try {
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
  }
};

// Função para popular quadras
export const populateCourts = async () => {
  try {
    console.log('🏟️ Populando quadras...');
    
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
  }
};

// Função para popular todos os dados
export const populateAllData = async () => {
  try {
    console.log('🚀 Iniciando população do Firestore...');
    
    await populateSports();
    await populateCourts();
    
    console.log('🎉 Firestore populado com sucesso!');
  } catch (error) {
    console.error('❌ Erro ao popular Firestore:', error);
  }
};

// Executar se chamado diretamente
if (typeof window !== 'undefined') {
  // No navegador, adicionar ao window para uso no console
  window.populateFirestore = {
    populateSports,
    populateCourts,
    populateAllData
  };
  
  console.log('🔥 Script de população do Firestore carregado!');
  console.log('💡 Use: window.populateFirestore.populateAllData() para popular todos os dados');
}
