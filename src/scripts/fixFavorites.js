// 🔧 Script simples para corrigir favoritos
import { db } from '../config/firebaseConfig';
import { collection, getDocs, updateDoc, doc, query, where } from 'firebase/firestore';
import { auth } from '../config/firebaseConfig';

// Função para corrigir favoritos
export const fixFavorites = async () => {
  try {
    const user = auth.currentUser;
    if (!user) {
      console.log('❌ Nenhum usuário logado');
      return;
    }

    console.log('🔧 Corrigindo favoritos...');

    // 1. Buscar favoritos do usuário
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

    // 2. Buscar quadras
    const courtsSnapshot = await getDocs(collection(db, 'courts'));
    const courts = courtsSnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));

    // 3. Atualizar cada favorito
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
        console.log(`✅ Favorito corrigido: ${court.name}`);
      }
    }

    console.log('🎉 Favoritos corrigidos! Recarregue a página.');

  } catch (error) {
    console.error('❌ Erro:', error);
  }
};

// Executar se chamado diretamente
if (typeof window !== 'undefined') {
  window.fixFavorites = fixFavorites;
  console.log('🔧 Script de correção carregado!');
  console.log('📝 Comando: window.fixFavorites()');
}

