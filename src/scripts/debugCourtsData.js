import { db } from '../config/firebaseConfig';
import { collection, getDocs, query, where } from 'firebase/firestore';
import { auth } from '../config/firebaseConfig';

// Função para verificar se o usuário está autenticado
const checkAuth = () => {
  if (!auth.currentUser) {
    throw new Error('❌ Usuário não está autenticado. Faça login primeiro!');
  }
  return auth.currentUser;
};

// Função para debug dos dados das quadras
export const debugCourtsData = async () => {
  try {
    const user = checkAuth();
    console.log('🔍 === DEBUG DOS DADOS DAS QUADRAS ===');
    console.log('👤 Usuário logado:', user.uid, user.email);
    
    // Buscar quadras do usuário
    const q = query(
      collection(db, 'courts'),
      where('ownerId', '==', user.uid)
    );
    const querySnapshot = await getDocs(q);
    
    console.log('📊 Total de quadras encontradas:', querySnapshot.docs.length);
    
    if (querySnapshot.docs.length === 0) {
      console.log('⚠️ Nenhuma quadra encontrada para este usuário');
      return;
    }
    
    // Analisar cada quadra
    querySnapshot.docs.forEach((doc, index) => {
      const courtData = doc.data();
      console.log(`\n🏟️ Quadra ${index + 1} (ID: ${doc.id}):`);
      console.log('  Nome:', courtData.name);
      console.log('  Esporte:', courtData.sport);
      console.log('  Endereço:', courtData.address);
      console.log('  Localização:', courtData.location);
      console.log('  Estado:', courtData.state);
      console.log('  Cidade:', courtData.city);
      console.log('  Telefone:', courtData.phone);
      console.log('  Email:', courtData.email);
      console.log('  Preço:', courtData.price);
      console.log('  Rating:', courtData.rating);
      console.log('  Disponível:', courtData.isAvailable);
      console.log('  Owner ID:', courtData.ownerId);
      console.log('  Nome do Estabelecimento:', courtData.establishmentName);
      
      // Verificar campos que podem estar undefined
      const undefinedFields = [];
      Object.keys(courtData).forEach(key => {
        if (courtData[key] === undefined) {
          undefinedFields.push(key);
        }
      });
      
      if (undefinedFields.length > 0) {
        console.log('  ⚠️ Campos undefined:', undefinedFields);
      }
    });
    
    // Verificar dados do estabelecimento
    console.log('\n🏢 === DADOS DO ESTABELECIMENTO ===');
    const firstCourt = querySnapshot.docs[0].data();
    console.log('Nome baseado no usuário:', `Estabelecimento ${user.displayName}`);
    console.log('Nome do estabelecimento da quadra:', firstCourt.establishmentName);
    console.log('Localização da primeira quadra:', firstCourt.location);
    console.log('Endereço da primeira quadra:', firstCourt.address);
    
  } catch (error) {
    console.error('❌ Erro no debug dos dados das quadras:', error);
  }
};

// Função para verificar todos os dados de uma quadra específica
export const debugSpecificCourt = async (courtId) => {
  try {
    const user = checkAuth();
    console.log('🔍 === DEBUG DE QUADRA ESPECÍFICA ===');
    console.log('👤 Usuário:', user.uid);
    console.log('🏟️ Court ID:', courtId);
    
    const q = query(
      collection(db, 'courts'),
      where('ownerId', '==', user.uid)
    );
    const querySnapshot = await getDocs(q);
    
    const court = querySnapshot.docs.find(doc => doc.id === courtId);
    
    if (!court) {
      console.log('❌ Quadra não encontrada');
      return;
    }
    
    const courtData = court.data();
    console.log('📋 Dados completos da quadra:');
    console.log(JSON.stringify(courtData, null, 2));
    
  } catch (error) {
    console.error('❌ Erro no debug da quadra específica:', error);
  }
};

// Adicionar ao objeto window para acesso no console
if (typeof window !== 'undefined') {
  window.debugCourtsData = {
    debugCourtsData,
    debugSpecificCourt,
  };
  console.log('🏟️ Script de debug das quadras carregado!');
  console.log('📝 Comandos disponíveis:');
  console.log('  - window.debugCourtsData.debugCourtsData() // Debug de todas as quadras');
  console.log('  - window.debugCourtsData.debugSpecificCourt("courtId") // Debug de quadra específica');
}
