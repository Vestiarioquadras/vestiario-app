// 🏟️ Script para atualizar quadras com informações de estado
import { db } from '../config/firebaseConfig';
import { collection, getDocs, updateDoc, doc } from 'firebase/firestore';

// Função para atualizar quadras com estados
export const updateCourtsWithStates = async () => {
  try {
    console.log('🏟️ Atualizando quadras com informações de estado...');

    // Buscar todas as quadras
    const courtsSnapshot = await getDocs(collection(db, 'courts'));
    const courts = courtsSnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));

    console.log(`📋 Encontradas ${courts.length} quadras`);

    // Mapear endereços para estados (baseado em padrões comuns)
    const addressToState = {
      'são paulo': 'São Paulo',
      'sp': 'São Paulo',
      'rio de janeiro': 'Rio de Janeiro',
      'rj': 'Rio de Janeiro',
      'minas gerais': 'Minas Gerais',
      'mg': 'Minas Gerais',
      'bahia': 'Bahia',
      'ba': 'Bahia',
      'paraná': 'Paraná',
      'pr': 'Paraná',
      'rio grande do sul': 'Rio Grande do Sul',
      'rs': 'Rio Grande do Sul',
      'pernambuco': 'Pernambuco',
      'pe': 'Pernambuco',
      'ceará': 'Ceará',
      'ce': 'Ceará',
      'pará': 'Pará',
      'pa': 'Pará',
      'santa catarina': 'Santa Catarina',
      'sc': 'Santa Catarina',
      'goiás': 'Goiás',
      'go': 'Goiás',
      'maranhão': 'Maranhão',
      'ma': 'Maranhão',
      'paraíba': 'Paraíba',
      'pb': 'Paraíba',
      'espírito santo': 'Espírito Santo',
      'es': 'Espírito Santo',
      'piauí': 'Piauí',
      'pi': 'Piauí',
      'alagoas': 'Alagoas',
      'al': 'Alagoas',
      'tocantins': 'Tocantins',
      'to': 'Tocantins',
      'rio grande do norte': 'Rio Grande do Norte',
      'rn': 'Rio Grande do Norte',
      'acre': 'Acre',
      'ac': 'Acre',
      'amapá': 'Amapá',
      'ap': 'Amapá',
      'amazonas': 'Amazonas',
      'am': 'Amazonas',
      'mato grosso': 'Mato Grosso',
      'mt': 'Mato Grosso',
      'mato grosso do sul': 'Mato Grosso do Sul',
      'ms': 'Mato Grosso do Sul',
      'rondônia': 'Rondônia',
      'ro': 'Rondônia',
      'roraima': 'Roraima',
      'rr': 'Roraima',
      'sergipe': 'Sergipe',
      'se': 'Sergipe',
      'distrito federal': 'Distrito Federal',
      'df': 'Distrito Federal'
    };

    let updated = 0;
    for (const court of courts) {
      let state = null;
      let city = null;

      // Tentar extrair estado do endereço
      if (court.address) {
        const address = court.address.toLowerCase();
        
        // Procurar por estado no endereço
        for (const [key, value] of Object.entries(addressToState)) {
          if (address.includes(key)) {
            state = value;
            break;
          }
        }

        // Tentar extrair cidade (primeira parte antes da vírgula)
        const parts = court.address.split(',');
        if (parts.length > 0) {
          city = parts[0].trim();
        }
      }

      // Se não encontrou estado, usar padrão baseado no nome
      if (!state) {
        if (court.name && court.name.toLowerCase().includes('rj')) {
          state = 'Rio de Janeiro';
        } else if (court.name && court.name.toLowerCase().includes('sp')) {
          state = 'São Paulo';
        } else {
          state = 'São Paulo'; // Padrão
        }
      }

      // Atualizar quadra com estado e cidade
      await updateDoc(doc(db, 'courts', court.id), {
        state: state,
        city: city || 'Cidade não informada'
      });

      updated++;
      console.log(`✅ Quadra atualizada: ${court.name} - ${state}`);
    }

    console.log(`🎉 ${updated} quadras atualizadas com informações de estado!`);

  } catch (error) {
    console.error('❌ Erro ao atualizar quadras:', error);
  }
};

// Executar se chamado diretamente
if (typeof window !== 'undefined') {
  window.updateCourtsWithStates = updateCourtsWithStates;
  console.log('🏟️ Script de atualização de estados carregado!');
  console.log('📝 Comando: window.updateCourtsWithStates()');
}
