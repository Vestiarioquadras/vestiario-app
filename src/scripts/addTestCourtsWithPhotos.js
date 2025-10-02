// 🏟️ Script para adicionar quadra com múltiplas fotos para teste
import { db } from './src/config/firebaseConfig.js';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';

const addCourtWithMultiplePhotos = async () => {
  try {
    console.log('🏟️ Adicionando quadra com múltiplas fotos...');
    
    const courtWithPhotos = {
      name: 'Arena Multi-Sport Premium',
      sport: 'futebol',
      sports: ['futebol', 'basquete', 'vôlei'], // Multi-esportes
      location: 'São Paulo, SP',
      address: 'Av. Paulista, 1000 - Bela Vista',
      price: 120.00,
      description: 'Arena premium com quadras profissionais e infraestrutura completa',
      amenities: ['Vestiário Premium', 'Estacionamento Coberto', 'Lanchonete', 'Ar Condicionado', 'Som Ambiente'],
      ownerId: 'test-owner-123', // ID de teste
      ownerName: 'João Silva',
      phone: '(11) 99999-8888',
      email: 'joao@arenasport.com',
      establishmentName: 'Arena Multi-Sport Premium',
      isIndoor: true,
      capacity: 22,
      rating: 4.9,
      totalReviews: 156,
      isAvailable: true,
      
      // 📸 MÚLTIPLAS FOTOS DE TESTE
      images: [
        'https://images.unsplash.com/photo-1551698618-1dfe5d97d256?w=400&h=300&fit=crop',
        'https://images.unsplash.com/photo-1574629810360-7efbbe195018?w=400&h=300&fit=crop',
        'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=400&h=300&fit=crop',
        'https://images.unsplash.com/photo-1577223625816-7546f13df25d?w=400&h=300&fit=crop',
        'https://images.unsplash.com/photo-1486286701208-1d58e9338013?w=400&h=300&fit=crop'
      ],
      
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    };
    
    const docRef = await addDoc(collection(db, 'courts'), courtWithPhotos);
    console.log('✅ Quadra com múltiplas fotos adicionada! ID:', docRef.id);
    
    // Adicionar outra quadra com apenas 1 foto
    const courtWithOnePhoto = {
      name: 'Quadra Simples',
      sport: 'tênis',
      sports: ['tênis'],
      location: 'Rio de Janeiro, RJ',
      address: 'Rua das Palmeiras, 456 - Copacabana',
      price: 80.00,
      description: 'Quadra de tênis ao ar livre',
      amenities: ['Vestiário', 'Estacionamento'],
      ownerId: 'test-owner-456',
      ownerName: 'Maria Santos',
      phone: '(21) 88888-7777',
      email: 'maria@quadratennis.com',
      establishmentName: 'Tennis Club Copacabana',
      isIndoor: false,
      capacity: 4,
      rating: 4.2,
      totalReviews: 45,
      isAvailable: true,
      
      // 📸 UMA FOTO APENAS
      images: [
        'https://images.unsplash.com/photo-1554068865-24cecd4e34b8?w=400&h=300&fit=crop'
      ],
      
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    };
    
    const docRef2 = await addDoc(collection(db, 'courts'), courtWithOnePhoto);
    console.log('✅ Quadra com uma foto adicionada! ID:', docRef2.id);
    
    // Adicionar quadra SEM fotos
    const courtWithoutPhotos = {
      name: 'Quadra Sem Fotos',
      sport: 'futsal',
      sports: ['futsal'],
      location: 'Belo Horizonte, MG',
      address: 'Rua dos Esportes, 789 - Centro',
      price: 60.00,
      description: 'Quadra de futsal coberta',
      amenities: ['Vestiário'],
      ownerId: 'test-owner-789',
      ownerName: 'Carlos Oliveira',
      phone: '(31) 77777-6666',
      email: 'carlos@futsal.com',
      establishmentName: 'Futsal Center BH',
      isIndoor: true,
      capacity: 12,
      rating: 3.8,
      totalReviews: 23,
      isAvailable: true,
      
      // 📸 SEM FOTOS (para testar fallback)
      images: [],
      
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    };
    
    const docRef3 = await addDoc(collection(db, 'courts'), courtWithoutPhotos);
    console.log('✅ Quadra sem fotos adicionada! ID:', docRef3.id);
    
    console.log('🎉 Todas as quadras de teste foram adicionadas com sucesso!');
    
  } catch (error) {
    console.error('❌ Erro ao adicionar quadras de teste:', error);
  }
};

// Executar apenas se chamado diretamente
if (import.meta.url === `file://${process.argv[1]}`) {
  addCourtWithMultiplePhotos();
}
