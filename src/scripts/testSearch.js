// 🔍 Script para testar a busca de quadras
import { db } from '../config/firebaseConfig';
import { collection, getDocs } from 'firebase/firestore';
import { auth } from '../config/firebaseConfig';

// Função para testar busca
export const testSearch = async () => {
  try {
    console.log('🔍 Testando busca de quadras...');

    // Buscar todas as quadras
    const courtsSnapshot = await getDocs(collection(db, 'courts'));
    const courts = courtsSnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));

    console.log(`📋 Total de quadras: ${courts.length}`);
    
    if (courts.length > 0) {
      console.log('🏟️ Primeira quadra:', courts[0]);
      
      // Testar filtros
      const basqueteCourts = courts.filter(court => 
        court.sport && court.sport.toLowerCase().includes('basquete')
      );
      console.log(`🏀 Quadras de basquete: ${basqueteCourts.length}`);
      
      const futebolCourts = courts.filter(court => 
        court.sport && court.sport.toLowerCase().includes('futebol')
      );
      console.log(`⚽ Quadras de futebol: ${futebolCourts.length}`);
      
      // Testar localização
      const rjCourts = courts.filter(court => 
        (court.address && court.address.toLowerCase().includes('rj')) ||
        (court.location && court.location.toLowerCase().includes('rj')) ||
        (court.establishmentName && court.establishmentName.toLowerCase().includes('rj'))
      );
      console.log(`📍 Quadras no RJ: ${rjCourts.length}`);
      
    } else {
      console.log('❌ Nenhuma quadra encontrada');
    }

  } catch (error) {
    console.error('❌ Erro no teste:', error);
  }
};

// Executar se chamado diretamente
if (typeof window !== 'undefined') {
  window.testSearch = testSearch;
  console.log('🔍 Script de teste de busca carregado!');
  console.log('📝 Comando: window.testSearch()');
}

