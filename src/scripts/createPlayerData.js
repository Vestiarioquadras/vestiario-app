// 🎮 Script simples para criar dados do jogador
import { db } from '../config/firebaseConfig';
import { collection, addDoc, serverTimestamp, getDocs, query, where } from 'firebase/firestore';
import { auth } from '../config/firebaseConfig';

// Função para criar dados de teste para o jogador logado
export const createPlayerTestData = async () => {
  try {
    const user = auth.currentUser;
    if (!user) {
      console.log('❌ Nenhum usuário logado');
      return;
    }

    console.log('🎮 Criando dados de teste para jogador:', user.email);

    // 1. Buscar quadras disponíveis
    const courtsSnapshot = await getDocs(collection(db, 'courts'));
    const courts = courtsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    
    if (courts.length === 0) {
      console.log('⚠️ Nenhuma quadra encontrada. Crie quadras primeiro.');
      return;
    }

    const court = courts[0]; // Usar a primeira quadra

    // 2. Criar reservas de teste
    const bookingsData = [
      {
        courtId: court.id,
        courtName: court.name,
        establishmentName: court.establishmentName || 'Estabelecimento Teste',
        playerId: user.uid,
        playerName: user.displayName || 'Jogador Teste',
        date: new Date().toISOString().split('T')[0], // Hoje
        time: '14:00',
        status: 'confirmed',
        sport: court.sport,
        price: court.price || 100,
        totalPrice: court.price || 100,
        createdAt: serverTimestamp()
      },
      {
        courtId: court.id,
        courtName: court.name,
        establishmentName: court.establishmentName || 'Estabelecimento Teste',
        playerId: user.uid,
        playerName: user.displayName || 'Jogador Teste',
        date: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString().split('T')[0], // Amanhã
        time: '16:00',
        status: 'pending',
        sport: court.sport,
        price: court.price || 100,
        totalPrice: court.price || 100,
        createdAt: serverTimestamp()
      }
    ];

    // Salvar reservas
    for (const booking of bookingsData) {
      await addDoc(collection(db, 'bookings'), booking);
      console.log('✅ Reserva criada:', booking.date, booking.time);
    }

    // 3. Criar partidas de teste
    const matchesData = [
      {
        playerId: user.uid,
        playerName: user.displayName || 'Jogador Teste',
        opponentName: 'Time Adversário 1',
        courtName: court.name,
        sport: court.sport,
        date: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 7 dias atrás
        time: '15:00',
        playerScore: 3,
        opponentScore: 1,
        result: 'win',
        createdAt: serverTimestamp()
      },
      {
        playerId: user.uid,
        playerName: user.displayName || 'Jogador Teste',
        opponentName: 'Time Adversário 2',
        courtName: court.name,
        sport: court.sport,
        date: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 14 dias atrás
        time: '18:00',
        playerScore: 1,
        opponentScore: 2,
        result: 'loss',
        createdAt: serverTimestamp()
      }
    ];

    // Salvar partidas
    for (const match of matchesData) {
      await addDoc(collection(db, 'matches'), match);
      console.log('✅ Partida criada:', match.date, match.result);
    }

    // 4. Criar favoritos
    const favoriteData = {
      userId: user.uid,
      courtId: court.id,
      courtName: court.name,
      createdAt: serverTimestamp()
    };

    await addDoc(collection(db, 'favorites'), favoriteData);
    console.log('✅ Favorito criado:', court.name);

    console.log('🎉 Dados de teste criados com sucesso!');
    console.log('📝 Recarregue a página para ver os dados');

  } catch (error) {
    console.error('❌ Erro ao criar dados de teste:', error);
  }
};

// Executar se chamado diretamente
if (typeof window !== 'undefined') {
  window.createPlayerTestData = createPlayerTestData;
  
  console.log('🎮 Script de criação de dados do jogador carregado!');
  console.log('📝 Comando disponível:');
  console.log('  - window.createPlayerTestData() // Criar dados de teste para o jogador logado');
}
