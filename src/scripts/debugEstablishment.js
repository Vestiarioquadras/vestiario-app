// 🔍 Script para debugar dados do estabelecimento
import { db } from '../config/firebaseConfig.js';
import { collection, getDocs, query, where, getDoc, doc, addDoc } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';

if (typeof window !== 'undefined') {
  window.debugEstablishment = {
    debugEstablishmentData: async () => {
      try {
        console.log('🔍 === DEBUG ESTABELECIMENTO ===');
        
        // Verificar se há usuário logado
        const auth = getAuth();
        const currentUser = auth.currentUser;
        if (!currentUser) {
          console.log('❌ Nenhum usuário logado');
          console.log('💡 Faça login primeiro e tente novamente');
          return;
        }
        
        console.log('👤 Usuário logado:', currentUser.uid, currentUser.email);
        
        // Buscar todas as quadras do usuário
        const courtsQuery = query(
          collection(db, 'courts'),
          where('ownerId', '==', currentUser.uid)
        );
        const courtsSnapshot = await getDocs(courtsQuery);
        const courts = courtsSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        
        console.log('🏟️ Quadras encontradas:', courts.length);
        courts.forEach((court, index) => {
          console.log(`  ${index + 1}. ${court.name} (${court.sport}) - R$ ${court.price}/hora`);
          console.log(`     ID: ${court.id}`);
          console.log(`     Owner: ${court.ownerId}`);
          console.log(`     Endereço: ${court.address || 'Não informado'}`);
          console.log(`     Telefone: ${court.phone || 'Não informado'}`);
          console.log(`     Email: ${court.email || 'Não informado'}`);
          console.log(`     Rating: ${court.rating || 'Não informado'}`);
          console.log('     ---');
        });
        
        // Verificar se há dados de estabelecimento separados
        const establishmentsQuery = query(
          collection(db, 'establishments'),
          where('ownerId', '==', currentUser.uid)
        );
        const establishmentsSnapshot = await getDocs(establishmentsQuery);
        const establishments = establishmentsSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        
        console.log('🏢 Estabelecimentos encontrados:', establishments.length);
        establishments.forEach((establishment, index) => {
          console.log(`  ${index + 1}. ${establishment.name}`);
          console.log(`     ID: ${establishment.id}`);
          console.log(`     Owner: ${establishment.ownerId}`);
          console.log(`     Endereço: ${establishment.address || 'Não informado'}`);
          console.log(`     Telefone: ${establishment.phone || 'Não informado'}`);
          console.log(`     Email: ${establishment.email || 'Não informado'}`);
          console.log(`     Rating: ${establishment.rating || 'Não informado'}`);
          console.log('     ---');
        });
        
        // Verificar se há dados de usuário
        const userDoc = await getDoc(doc(db, 'users', currentUser.uid));
        if (userDoc.exists()) {
          const userData = userDoc.data();
          console.log('👤 Dados do usuário:', userData);
        } else {
          console.log('❌ Documento do usuário não encontrado');
        }
        
        console.log('🔍 === FIM DEBUG ===');
        
      } catch (error) {
        console.error('❌ Erro ao debugar estabelecimento:', error);
      }
    },
    
    createEstablishment: async () => {
      try {
        console.log('🏢 === CRIAR ESTABELECIMENTO ===');
        
        const auth = getAuth();
        const currentUser = auth.currentUser;
        if (!currentUser) {
          console.log('❌ Nenhum usuário logado');
          console.log('💡 Faça login primeiro e tente novamente');
          return;
        }
        
        // Buscar quadras do usuário
        const courtsQuery = query(
          collection(db, 'courts'),
          where('ownerId', '==', currentUser.uid)
        );
        const courtsSnapshot = await getDocs(courtsQuery);
        const courts = courtsSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        
        if (courts.length === 0) {
          console.log('❌ Nenhuma quadra encontrada para criar estabelecimento');
          return;
        }
        
        // Criar estabelecimento baseado na primeira quadra
        const firstCourt = courts[0];
        const establishmentData = {
          ownerId: currentUser.uid,
          name: firstCourt.name || 'Meu Estabelecimento',
          address: firstCourt.address || 'Endereço não informado',
          phone: firstCourt.phone || '(11) 99999-9999',
          email: firstCourt.email || currentUser.email,
          rating: firstCourt.rating || 0,
          sports: [...new Set(courts.map(court => court.sport))],
          courtIds: courts.map(court => court.id),
          createdAt: new Date(),
          updatedAt: new Date()
        };
        
        const docRef = await addDoc(collection(db, 'establishments'), establishmentData);
        console.log('✅ Estabelecimento criado com ID:', docRef.id);
        console.log('📊 Dados:', establishmentData);
        
      } catch (error) {
        console.error('❌ Erro ao criar estabelecimento:', error);
      }
    }
  };
  
  console.log('🔍 Script de debug do estabelecimento carregado!');
  console.log('📝 Comandos disponíveis:');
  console.log('  - window.debugEstablishment.debugEstablishmentData() // Debug completo');
  console.log('  - window.debugEstablishment.createEstablishment() // Criar estabelecimento');
}
