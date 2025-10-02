// 🔍 Script para testar se as quadras têm fotos
import { db } from './src/config/firebaseConfig.js';
import { collection, getDocs } from 'firebase/firestore';

const testCourtImages = async () => {
  try {
    console.log('🔍 === TESTANDO FOTOS DAS QUADRAS ===');
    
    // Buscar todas as quadras
    const courtsSnapshot = await getDocs(collection(db, 'courts'));
    const courts = courtsSnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
    
    console.log(`📊 Total de quadras: ${courts.length}`);
    
    if (courts.length === 0) {
      console.log('⚠️ Nenhuma quadra encontrada no banco de dados');
      return;
    }
    
    // Analisar fotos de cada quadra
    courts.forEach((court, index) => {
      console.log(`\n🏟️ Quadra ${index + 1}: ${court.name}`);
      console.log(`  ID: ${court.id}`);
      console.log(`  Dono: ${court.ownerId || 'Não informado'}`);
      
      if (court.images) {
        console.log(`  📸 Fotos: ${court.images.length} encontrada(s)`);
        court.images.forEach((image, imgIndex) => {
          if (typeof image === 'string') {
            console.log(`    ${imgIndex + 1}. ${image}`);
          } else if (image && image.url) {
            console.log(`    ${imgIndex + 1}. ${image.url} (Nome: ${image.name || 'Sem nome'})`);
          } else {
            console.log(`    ${imgIndex + 1}. Formato inválido:`, image);
          }
        });
      } else {
        console.log('  📸 Fotos: Nenhuma foto encontrada');
      }
    });
    
  } catch (error) {
    console.error('❌ Erro ao testar fotos das quadras:', error);
  }
};

// Executar teste
testCourtImages();
