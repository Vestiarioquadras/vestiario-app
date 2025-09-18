// 🔄 Script para atualizar favoritos existentes com informações da quadra
import { db } from '../config/firebaseConfig';
import { collection, getDocs, updateDoc, doc, query, where } from 'firebase/firestore';
import { auth } from '../config/firebaseConfig';

// Função para atualizar favoritos existentes
export const updateExistingFavorites = async () => {
  try {
    const user = auth.currentUser;
    if (!user) {
      console.log('❌ Nenhum usuário logado');
      return;
    }

    console.log('🔄 Atualizando favoritos existentes...');

    // 1. Buscar todos os favoritos do usuário
    const favoritesQuery = query(
      collection(db, 'favorites'),
      where('userId', '==', user.uid)
    );
    const favoritesSnapshot = await getDocs(favoritesQuery);
    const favorites = favoritesSnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));

    console.log(`📋 Encontrados ${favorites.length} favoritos`);

    // 2. Buscar todas as quadras
    const courtsSnapshot = await getDocs(collection(db, 'courts'));
    const courts = courtsSnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));

    console.log(`🏟️ Encontradas ${courts.length} quadras`);

    // 3. Atualizar cada favorito com dados da quadra
    let updatedCount = 0;
    for (const favorite of favorites) {
      const court = courts.find(c => c.id === favorite.courtId);
      if (court) {
        await updateDoc(doc(db, 'favorites', favorite.id), {
          courtName: court.name,
          establishmentName: court.establishmentName || 'Estabelecimento Teste',
          sport: court.sport,
          price: court.price,
          isIndoor: court.isIndoor,
          rating: court.rating
        });
        updatedCount++;
        console.log(`✅ Favorito atualizado: ${court.name}`);
      } else {
        console.log(`⚠️ Quadra não encontrada para favorito: ${favorite.courtId}`);
      }
    }

    console.log(`🎉 ${updatedCount} favoritos atualizados com sucesso!`);
    console.log('📝 Recarregue a página para ver as mudanças');

  } catch (error) {
    console.error('❌ Erro ao atualizar favoritos:', error);
  }
};

// Executar se chamado diretamente
if (typeof window !== 'undefined') {
  window.updateExistingFavorites = updateExistingFavorites;
  
  console.log('🔄 Script de atualização de favoritos carregado!');
  console.log('📝 Comando disponível:');
  console.log('  - window.updateExistingFavorites() // Atualizar favoritos existentes');
}

