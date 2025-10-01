// 🔥 Serviços Firestore para o Projeto Vestiário
import { 
  collection, 
  doc, 
  getDocs, 
  getDoc, 
  addDoc, 
  setDoc,
  updateDoc, 
  deleteDoc, 
  query, 
  where, 
  orderBy, 
  limit,
  serverTimestamp,
  onSnapshot,
  writeBatch
} from 'firebase/firestore';
import { db } from '../config/firebaseConfig';

// 🏟️ SERVIÇOS DE QUADRAS
export const courtsService = {
  // Buscar todas as quadras
  async getAllCourts(sport = null, location = null) {
    try {
      console.log('🔍 Buscando quadras com filtros:', { sport, location });
      
      // Buscar todas as quadras primeiro
      const querySnapshot = await getDocs(collection(db, 'courts'));
      let courts = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      
      console.log(`📋 Total de quadras encontradas: ${courts.length}`);
      
      // Aplicar filtros localmente
      if (sport) {
        courts = courts.filter(court => 
          court.sport && court.sport.toLowerCase().includes(sport.toLowerCase())
        );
        console.log(`🏆 Após filtro de esporte (${sport}): ${courts.length} quadras`);
      }
      
      if (location) {
        courts = courts.filter(court => {
          const searchLocation = location.toLowerCase();
          return (
            (court.address && court.address.toLowerCase().includes(searchLocation)) ||
            (court.location && court.location.toLowerCase().includes(searchLocation)) ||
            (court.establishmentName && court.establishmentName.toLowerCase().includes(searchLocation)) ||
            (court.state && court.state.toLowerCase().includes(searchLocation)) ||
            (court.city && court.city.toLowerCase().includes(searchLocation))
          );
        });
        console.log(`📍 Após filtro de localização (${location}): ${courts.length} quadras`);
      }
      
      // Ordenar localmente por data de criação
      return courts.sort((a, b) => {
        const dateA = a.createdAt?.toDate ? a.createdAt.toDate() : new Date(a.createdAt || 0);
        const dateB = b.createdAt?.toDate ? b.createdAt.toDate() : new Date(b.createdAt || 0);
        return dateB - dateA; // Ordem decrescente
      });
    } catch (error) {
      console.error('❌ Erro ao buscar quadras:', error);
      throw error;
    }
  },

  // Buscar quadras por dono
  async getCourtsByOwner(ownerId) {
    try {
      const q = query(
        collection(db, 'courts'),
        where('ownerId', '==', ownerId)
      );
      const querySnapshot = await getDocs(q);
      const courts = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      
      // Ordenar localmente por data de criação
      return courts.sort((a, b) => {
        const dateA = a.createdAt?.toDate ? a.createdAt.toDate() : new Date(a.createdAt || 0);
        const dateB = b.createdAt?.toDate ? b.createdAt.toDate() : new Date(b.createdAt || 0);
        return dateB - dateA; // Ordem decrescente
      });
    } catch (error) {
      console.error('❌ Erro ao buscar quadras do dono:', error);
      throw error;
    }
  },

  // Criar nova quadra
  async createCourt(courtData) {
    try {
      const docRef = await addDoc(collection(db, 'courts'), {
        ...courtData,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      });
      console.log('✅ Quadra criada com sucesso:', docRef.id);
      return { id: docRef.id, ...courtData };
    } catch (error) {
      console.error('❌ Erro ao criar quadra:', error);
      throw error;
    }
  },

  // Atualizar quadra
  async updateCourt(courtId, updateData) {
    try {
      console.log('🔄 Iniciando atualização da quadra:', courtId);
      console.log('📋 Dados para atualização:', updateData);
      
      const courtRef = doc(db, 'courts', courtId);
      
      const finalUpdateData = {
        ...updateData,
        updatedAt: serverTimestamp()
      };
      
      console.log('📝 Dados finais para salvar:', finalUpdateData);
      
      await updateDoc(courtRef, finalUpdateData);
      
      console.log('✅ Quadra atualizada com sucesso:', courtId);
      console.log('📊 Dados salvos:', finalUpdateData);
      
      return { id: courtId, ...updateData };
    } catch (error) {
      console.error('❌ Erro ao atualizar quadra:', error);
      console.error('🔍 Detalhes do erro:', {
        name: error.name,
        message: error.message,
        code: error.code,
        courtId: courtId,
        updateData: updateData
      });
      throw error;
    }
  },

  // Deletar quadra
  async deleteCourt(courtId) {
    try {
      await deleteDoc(doc(db, 'courts', courtId));
      console.log('✅ Quadra deletada com sucesso:', courtId);
      return true;
    } catch (error) {
      console.error('❌ Erro ao deletar quadra:', error);
      throw error;
    }
  }
};

// 🏆 SERVIÇOS DE ESPORTES
export const sportsService = {
  // Buscar todos os esportes
  async getAllSports() {
    try {
      const querySnapshot = await getDocs(collection(db, 'sports'));
      const sports = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      
      // Remover duplicatas baseado no nome
      const uniqueSports = sports.filter((sport, index, self) => 
        index === self.findIndex(s => s.name === sport.name)
      );
      
      return uniqueSports;
    } catch (error) {
      console.error('❌ Erro ao buscar esportes:', error);
      // Retornar esportes padrão se não houver dados
      return [
        { id: 'futebol', name: 'Futebol', icon: '⚽' },
        { id: 'basquete', name: 'Basquete', icon: '🏀' },
        { id: 'tenis', name: 'Tênis', icon: '🎾' },
        { id: 'padel', name: 'Padel', icon: '🏓' },
        { id: 'volei', name: 'Vôlei', icon: '🏐' },
        { id: 'futsal', name: 'Futsal', icon: '⚽' },
        { id: 'beach-tennis', name: 'Beach Tennis', icon: '🏖️' },
        { id: 'futvolei', name: 'Futvôlei', icon: '⚽🏐' },
        { id: 'volei-areia', name: 'Vôlei de Areia', icon: '🏖️🏐' },
        { id: 'poliesportiva', name: 'Quadra Poliesportiva', icon: '🏟️' }
      ];
    }
  }
};

// 📅 SERVIÇOS DE RESERVAS
export const bookingsService = {
  // Buscar reservas do usuário
  async getUserBookings(userId) {
    try {
      const q = query(
        collection(db, 'bookings'), 
        where('playerId', '==', userId)
      );
      const querySnapshot = await getDocs(q);
      const bookings = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      
      // Debug: Log dos dados brutos do Firebase
      console.log('🔍 Debug - Dados brutos do Firebase (getUserBookings):', bookings);
      bookings.forEach((booking, index) => {
        console.log(`  Reserva ${index + 1}:`, {
          id: booking.id,
          date: booking.date,
          time: booking.time,
          endTime: booking.endTime,
          courtName: booking.courtName,
          status: booking.status
        });
      });
      
      // Ordenar localmente por data e hora
      return bookings.sort((a, b) => {
        const dateA = new Date(a.date + ' ' + a.time);
        const dateB = new Date(b.date + ' ' + b.time);
        return dateB - dateA; // Ordem decrescente
      });
    } catch (error) {
      console.error('❌ Erro ao buscar reservas do usuário:', error);
      throw error;
    }
  },

  // Buscar reservas do dono
  async getOwnerBookings(ownerId) {
    try {
      // Primeiro buscar as quadras do dono
      const courtsQuery = query(
        collection(db, 'courts'),
        where('ownerId', '==', ownerId)
      );
      const courtsSnapshot = await getDocs(courtsQuery);
      const courtIds = courtsSnapshot.docs.map(doc => doc.id);
      
      if (courtIds.length === 0) {
        return [];
      }
      
      // Buscar reservas para essas quadras
      const bookingsQuery = query(
        collection(db, 'bookings'),
        where('courtId', 'in', courtIds)
      );
      const bookingsSnapshot = await getDocs(bookingsQuery);
      const bookings = bookingsSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      
      // Debug: Log dos dados brutos do Firebase
      console.log('🔍 Debug - Dados brutos do Firebase (getOwnerBookings):', bookings);
      bookings.forEach((booking, index) => {
        console.log(`  Reserva ${index + 1}:`, {
          id: booking.id,
          date: booking.date,
          time: booking.time,
          endTime: booking.endTime,
          courtName: booking.courtName,
          status: booking.status
        });
      });
      
      // Ordenar localmente por data e hora
      return bookings.sort((a, b) => {
        const dateA = new Date(a.date + ' ' + a.time);
        const dateB = new Date(b.date + ' ' + b.time);
        return dateB - dateA; // Ordem decrescente
      });
    } catch (error) {
      console.error('❌ Erro ao buscar reservas do dono:', error);
      throw error;
    }
  },

  // Criar nova reserva
  async createBooking(bookingData) {
    try {
      // Debug: Log dos dados que estão sendo salvos
      console.log('🔍 Debug - Dados sendo salvos no Firebase:', bookingData);
      console.log('  date:', bookingData.date);
      console.log('  time:', bookingData.time);
      console.log('  endTime:', bookingData.endTime);
      console.log('  courtName:', bookingData.courtName);
      
      const docRef = await addDoc(collection(db, 'bookings'), {
        ...bookingData,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      });
      console.log('✅ Reserva criada com sucesso:', docRef.id);
      
      // Se a reserva foi auto-confirmada, notificar o dono
      if (bookingData.status === 'confirmed') {
        await this.notifyOwnerAboutNewBooking({ id: docRef.id, ...bookingData });
      }
      
      return { id: docRef.id, ...bookingData };
    } catch (error) {
      console.error('❌ Erro ao criar reserva:', error);
      throw error;
    }
  },

  // Notificar dono sobre nova reserva confirmada
  async notifyOwnerAboutNewBooking(bookingData) {
    try {
      console.log('📧 Notificando dono sobre nova reserva:', bookingData);
      
      // Buscar dados do dono da quadra
      const courtDoc = await getDoc(doc(db, 'courts', bookingData.courtId));
      if (!courtDoc.exists()) {
        console.warn('⚠️ Quadra não encontrada para notificação');
        return;
      }
      
      const courtData = courtDoc.data();
      const ownerId = courtData.ownerId;
      
      if (!ownerId) {
        console.warn('⚠️ Dono da quadra não encontrado');
        return;
      }
      
      // Criar notificação para o dono
      await addDoc(collection(db, 'notifications'), {
        ownerId: ownerId,
        type: 'new_booking',
        title: 'Nova Reserva Confirmada! 🎉',
        message: `${bookingData.playerName} reservou ${bookingData.courtName} para ${bookingData.date} às ${bookingData.time}`,
        bookingId: bookingData.id,
        courtId: bookingData.courtId,
        playerName: bookingData.playerName,
        date: bookingData.date,
        time: bookingData.time,
        totalPrice: bookingData.totalPrice,
        isRead: false,
        createdAt: serverTimestamp()
      });
      
      console.log('✅ Notificação enviada para o dono:', ownerId);
      
    } catch (error) {
      console.error('❌ Erro ao notificar dono:', error);
      // Não falhar a criação da reserva por causa da notificação
    }
  },

  // Atualizar status da reserva
  async updateBookingStatus(bookingId, status) {
    try {
      const bookingRef = doc(db, 'bookings', bookingId);
      await updateDoc(bookingRef, {
        status,
        updatedAt: serverTimestamp()
      });
      console.log('✅ Status da reserva atualizado:', bookingId, status);
      return true;
    } catch (error) {
      console.error('❌ Erro ao atualizar status da reserva:', error);
      throw error;
    }
  },

  // Confirmar reserva
  async confirmBooking(bookingId) {
    try {
      console.log('🔍 Debug - Confirmando reserva:', bookingId);
      const result = await this.updateBookingStatus(bookingId, 'confirmed');
      console.log('✅ Reserva confirmada com sucesso:', bookingId);
      return result;
    } catch (error) {
      console.error('❌ Erro ao confirmar reserva:', error);
      throw error;
    }
  },

  // Cancelar reserva
  async cancelBooking(bookingId) {
    try {
      const bookingRef = doc(db, 'bookings', bookingId);
      await updateDoc(bookingRef, {
        status: 'cancelled',
        updatedAt: serverTimestamp()
      });
      console.log('✅ Reserva cancelada:', bookingId);
      return true;
    } catch (error) {
      console.error('❌ Erro ao cancelar reserva:', error);
      throw error;
    }
  }
};

// ❤️ SERVIÇOS DE FAVORITOS
export const favoritesService = {
  // Buscar quadras favoritas
  async getFavoriteCourts(userId) {
    try {
      const q = query(
        collection(db, 'favorites'), 
        where('userId', '==', userId)
      );
      const querySnapshot = await getDocs(q);
      
      // Retornar dados dos favoritos com informações da quadra
      const favorites = [];
      for (const favoriteDoc of querySnapshot.docs) {
        const favoriteData = favoriteDoc.data();
        
        // Sempre buscar dados da quadra para garantir que todos os campos estejam preenchidos
        const courtDoc = await getDoc(doc(db, 'courts', favoriteData.courtId));
        if (courtDoc.exists()) {
          const courtData = courtDoc.data();
          favorites.push({
            id: favoriteDoc.id,
            courtId: favoriteData.courtId,
            userId: favoriteData.userId,
            createdAt: favoriteData.createdAt,
            courtName: courtData.name,
            establishmentName: courtData.establishmentName || 'Estabelecimento Teste',
            sport: courtData.sport,
            price: courtData.price,
            isIndoor: courtData.isIndoor,
            rating: courtData.rating
          });
        }
      }
      
      return favorites;
    } catch (error) {
      console.error('❌ Erro ao buscar quadras favoritas:', error);
      throw error;
    }
  },

  // Adicionar aos favoritos
  async addFavoriteCourt(userId, courtId, courtData = null) {
    try {
      const favoriteData = {
        userId,
        courtId,
        createdAt: serverTimestamp()
      };

      // Se dados da quadra foram fornecidos, adicionar ao favorito
      if (courtData) {
        if (courtData.courtName) favoriteData.courtName = courtData.courtName;
        if (courtData.establishmentName) favoriteData.establishmentName = courtData.establishmentName;
        if (courtData.sport) favoriteData.sport = courtData.sport;
        if (courtData.price !== undefined) favoriteData.price = courtData.price;
        if (courtData.isIndoor !== undefined) favoriteData.isIndoor = courtData.isIndoor;
        if (courtData.rating !== undefined) favoriteData.rating = courtData.rating;
      }

      await addDoc(collection(db, 'favorites'), favoriteData);
      console.log('✅ Quadra adicionada aos favoritos:', courtId);
      return true;
    } catch (error) {
      console.error('❌ Erro ao adicionar aos favoritos:', error);
      throw error;
    }
  },

  // Remover dos favoritos
  async removeFavoriteCourt(userId, courtId) {
    try {
      const q = query(
        collection(db, 'favorites'), 
        where('userId', '==', userId),
        where('courtId', '==', courtId)
      );
      const querySnapshot = await getDocs(q);
      
      const batch = writeBatch(db);
      querySnapshot.docs.forEach(doc => {
        batch.delete(doc.ref);
      });
      await batch.commit();
      
      console.log('✅ Quadra removida dos favoritos:', courtId);
      return true;
    } catch (error) {
      console.error('❌ Erro ao remover dos favoritos:', error);
      throw error;
    }
  }
};

// 🏆 SERVIÇOS DE HISTÓRICO DE PARTIDAS
export const matchHistoryService = {
  // Buscar histórico de partidas
  async getMatchHistory(userId) {
    try {
      const q = query(
        collection(db, 'matches'), 
        where('playerId', '==', userId)
      );
      const querySnapshot = await getDocs(q);
      const matches = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      
      // Ordenar localmente por data e limitar a 10
      return matches
        .sort((a, b) => new Date(b.date) - new Date(a.date))
        .slice(0, 10);
    } catch (error) {
      console.error('❌ Erro ao buscar histórico de partidas:', error);
      throw error;
    }
  },

  // Criar nova partida
  async createMatch(matchData) {
    try {
      const docRef = await addDoc(collection(db, 'matches'), {
        ...matchData,
        createdAt: serverTimestamp()
      });
      console.log('✅ Partida criada com sucesso:', docRef.id);
      return { id: docRef.id, ...matchData };
    } catch (error) {
      console.error('❌ Erro ao criar partida:', error);
      throw error;
    }
  }
};

// 📊 SERVIÇOS DE ESTATÍSTICAS
export const statsService = {
  // Buscar estatísticas do dono
  async getOwnerStats(ownerId) {
    try {
      // Primeiro buscar as quadras do dono
      const courtsQuery = query(
        collection(db, 'courts'),
        where('ownerId', '==', ownerId)
      );
      const courtsSnapshot = await getDocs(courtsQuery);
      const courtIds = courtsSnapshot.docs.map(doc => doc.id);
      
      if (courtIds.length === 0) {
        return {
          totalCourts: 0,
          totalBookings: 0,
          confirmedBookings: 0,
          pendingBookings: 0,
          cancelledBookings: 0,
          totalRevenue: 0,
          averageBookingValue: 0,
          todayBookings: 0,
          monthlyRevenue: 0,
          occupancyRate: 0
        };
      }
      
      // Buscar reservas para essas quadras
      const bookingsQuery = query(
        collection(db, 'bookings'),
        where('courtId', 'in', courtIds)
      );
      const bookingsSnapshot = await getDocs(bookingsQuery);
      const bookings = bookingsSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      
      // Calcular estatísticas
      const totalCourts = courtIds.length;
      const totalBookings = bookings.length;
      const confirmedBookings = bookings.filter(b => b.status === 'confirmed').length;
      const pendingBookings = bookings.filter(b => b.status === 'pending').length;
      const cancelledBookings = bookings.filter(b => b.status === 'cancelled').length;
      
      const totalRevenue = bookings
        .filter(b => b.status === 'confirmed')
        .reduce((sum, b) => sum + (b.price || 0), 0);
      
      // Reservas de hoje
      const today = new Date().toISOString().split('T')[0];
      const todayBookings = bookings.filter(b => b.date === today).length;
      
      // Receita do mês atual
      const currentMonth = new Date().getMonth();
      const currentYear = new Date().getFullYear();
      const monthlyRevenue = bookings
        .filter(b => {
          if (!b.date) return false;
          const bookingDate = new Date(b.date);
          return bookingDate.getMonth() === currentMonth && 
                 bookingDate.getFullYear() === currentYear &&
                 b.status === 'confirmed';
        })
        .reduce((sum, b) => sum + (b.price || 0), 0);
      
      // Taxa de ocupação (simplificada)
      const occupancyRate = totalCourts > 0 ? Math.round((confirmedBookings / (totalCourts * 30)) * 100) : 0;
      
      return {
        totalCourts,
        totalBookings,
        confirmedBookings,
        pendingBookings,
        cancelledBookings,
        totalRevenue,
        averageBookingValue: confirmedBookings > 0 ? Math.round(totalRevenue / confirmedBookings) : 0,
        todayBookings,
        monthlyRevenue,
        occupancyRate: Math.min(occupancyRate, 100) // Máximo 100%
      };
    } catch (error) {
      console.error('❌ Erro ao buscar estatísticas do dono:', error);
      throw error;
    }
  }
};

// 📅 SERVIÇOS DE AGENDA
export const scheduleService = {
  // Buscar dados da agenda
  async getScheduleData(date, courtId = null) {
    try {
      // Buscar reservas para a data específica
      const bookingsQuery = query(
        collection(db, 'bookings'),
        where('date', '==', date)
      );
      const bookingsSnapshot = await getDocs(bookingsQuery);
      const bookings = bookingsSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));

      // Buscar horários bloqueados para a data
      const blockedQuery = query(
        collection(db, 'blockedSlots'),
        where('date', '==', date)
      );
      const blockedSnapshot = await getDocs(blockedQuery);
      const blockedSlots = blockedSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));

      // Buscar quadras (todas ou específica)
      let courtsQuery;
      if (courtId) {
        const courtDoc = await getDoc(doc(db, 'courts', courtId));
        if (courtDoc.exists()) {
          courtsQuery = [courtDoc];
        } else {
          return [];
        }
      } else {
        courtsQuery = await getDocs(collection(db, 'courts'));
      }

      const courts = Array.isArray(courtsQuery) ? courtsQuery : courtsQuery.docs;
      
      // Gerar dados da agenda para cada quadra
      const agendaData = [];
      
      for (const court of courts) {
        const courtData = court.data ? court.data() : court;
        const courtId = court.id;
        
        // Filtrar reservas e bloqueios para esta quadra
        const courtBookings = bookings.filter(b => b.courtId === courtId);
        const courtBlockedSlots = blockedSlots.filter(b => b.courtId === courtId);
        
        // 🔄 Buscar horários de funcionamento configurados
        let scheduleSlots = [];
        try {
          scheduleSlots = await courtScheduleService.generateAvailableSlots(courtId, date);
        } catch (error) {
          console.log('⚠️ Usando horários padrão para quadra:', courtId);
          // Fallback para horários padrão se não houver configuração
          scheduleSlots = [];
          for (let hour = 8; hour < 22; hour++) {
            scheduleSlots.push({
              time: `${hour.toString().padStart(2, '0')}:00`,
              status: 'available',
              courtId,
              date
            });
          }
        }
        
        // Gerar slots de horário baseado nos horários de funcionamento
        const timeSlots = [];
        
        for (const scheduleSlot of scheduleSlots) {
          const time = scheduleSlot.time;
          const booking = courtBookings.find(b => b.time === time);
          const blocked = courtBlockedSlots.find(b => b.time === time);
          
          if (booking) {
            timeSlots.push({
              time,
              status: 'booked',
              clientName: booking.playerName || 'Cliente',
              bookingId: booking.id
            });
          } else if (blocked) {
            timeSlots.push({
              time,
              status: 'blocked',
              reason: blocked.reason || 'Horário bloqueado',
              slotId: blocked.id
            });
          } else {
            timeSlots.push({
              time,
              status: 'available'
            });
          }
        }
        
        agendaData.push({
          id: courtId,
          courtId,
          courtName: courtData.name,
          timeSlots
        });
      }
      
      return agendaData;
    } catch (error) {
      console.error('❌ Erro ao buscar dados da agenda:', error);
      throw error;
    }
  },

  // Bloquear horário
  async blockTimeSlot(courtId, date, time, reason = 'Horário bloqueado') {
    try {
      const docRef = await addDoc(collection(db, 'blockedSlots'), {
        courtId,
        date,
        time,
        reason,
        createdAt: serverTimestamp()
      });
      console.log('✅ Horário bloqueado com sucesso:', docRef.id);
      return { id: docRef.id, courtId, date, time, reason };
    } catch (error) {
      console.error('❌ Erro ao bloquear horário:', error);
      throw error;
    }
  }
};

// ⏰ SERVIÇOS DE HORÁRIOS DE FUNCIONAMENTO
export const courtScheduleService = {
  // Definir horários de funcionamento de uma quadra
  async setCourtSchedule(courtId, scheduleData) {
    try {
      console.log('⏰ Definindo horários de funcionamento:', { courtId, scheduleData });
      
      const scheduleRef = doc(db, 'courtSchedules', courtId);
      await setDoc(scheduleRef, {
        courtId,
        ...scheduleData,
        updatedAt: serverTimestamp()
      });
      
      console.log('✅ Horários de funcionamento definidos com sucesso');
      return { success: true };
    } catch (error) {
      console.error('❌ Erro ao definir horários:', error);
      throw error;
    }
  },

  // Buscar horários de funcionamento de uma quadra
  async getCourtSchedule(courtId) {
    try {
      const scheduleRef = doc(db, 'courtSchedules', courtId);
      const scheduleDoc = await getDoc(scheduleRef);
      
      if (scheduleDoc.exists()) {
        return { id: scheduleDoc.id, ...scheduleDoc.data() };
      } else {
        // Retornar horários padrão se não existir
        return {
          id: courtId,
          isOpen24h: false,
          weekdays: {
            monday: { isOpen: true, openTime: '08:00', closeTime: '22:00' },
            tuesday: { isOpen: true, openTime: '08:00', closeTime: '22:00' },
            wednesday: { isOpen: true, openTime: '08:00', closeTime: '22:00' },
            thursday: { isOpen: true, openTime: '08:00', closeTime: '22:00' },
            friday: { isOpen: true, openTime: '08:00', closeTime: '22:00' },
            saturday: { isOpen: true, openTime: '08:00', closeTime: '22:00' },
            sunday: { isOpen: true, openTime: '08:00', closeTime: '22:00' }
          },
          specialDays: [],
          timeSlotDuration: 60, // minutos
          isDefault: true
        };
      }
    } catch (error) {
      console.error('❌ Erro ao buscar horários:', error);
      throw error;
    }
  },

  // Verificar se a quadra está aberta em um horário específico
  async isCourtOpen(courtId, date, time) {
    try {
      const schedule = await this.getCourtSchedule(courtId);
      const dayOfWeek = new Date(date).toLocaleDateString('en-US', { weekday: 'lowercase' });
      const daySchedule = schedule.weekdays[dayOfWeek];
      
      if (!daySchedule || !daySchedule.isOpen) {
        return false;
      }
      
      const requestedTime = time.split(':').map(Number);
      const openTime = daySchedule.openTime.split(':').map(Number);
      const closeTime = daySchedule.closeTime.split(':').map(Number);
      
      const requestedMinutes = requestedTime[0] * 60 + requestedTime[1];
      const openMinutes = openTime[0] * 60 + openTime[1];
      const closeMinutes = closeTime[0] * 60 + closeTime[1];
      
      return requestedMinutes >= openMinutes && requestedMinutes < closeMinutes;
    } catch (error) {
      console.error('❌ Erro ao verificar horário de funcionamento:', error);
      return false;
    }
  },

  // Gerar slots de horário disponíveis baseado no funcionamento
  async generateAvailableSlots(courtId, date) {
    try {
      console.log('⏰ Gerando slots para:', { courtId, date });
      const schedule = await this.getCourtSchedule(courtId);
      console.log('⏰ Horários configurados:', schedule.weekdays);
      
      // Corrigir interpretação de data - forçar fuso horário local
      const [year, month, day] = date.split('-');
      const dateObj = new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
      const dayOfWeek = dateObj.toLocaleDateString('en-US', { weekday: 'long' }).toLowerCase();
      console.log('⏰ Data original:', date);
      console.log('⏰ Data corrigida:', dateObj);
      console.log('⏰ Dia da semana (en-US):', dayOfWeek);
      console.log('⏰ Dia da semana (pt-BR):', dateObj.toLocaleDateString('pt-BR', { weekday: 'long' }));
      
      const daySchedule = schedule.weekdays[dayOfWeek];
      console.log('⏰ Horário do dia:', daySchedule);
      
      if (!daySchedule || !daySchedule.isOpen) {
        return [];
      }
      
      const slots = [];
      const openTime = daySchedule.openTime.split(':').map(Number);
      const closeTime = daySchedule.closeTime.split(':').map(Number);
      const slotDuration = schedule.timeSlotDuration || 60;
      
      console.log('⏰ Horários de funcionamento:', { 
        openTime: daySchedule.openTime, 
        closeTime: daySchedule.closeTime,
        slotDuration 
      });
      
      const openMinutes = openTime[0] * 60 + openTime[1];
      const closeMinutes = closeTime[0] * 60 + closeTime[1];
      
      for (let minutes = openMinutes; minutes < closeMinutes; minutes += slotDuration) {
        const hour = Math.floor(minutes / 60);
        const minute = minutes % 60;
        const timeString = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
        
        slots.push({
          time: timeString,
          status: 'available',
          courtId,
          date
        });
      }
      
      console.log('⏰ Slots gerados:', slots);
      return slots;
    } catch (error) {
      console.error('❌ Erro ao gerar slots disponíveis:', error);
      return [];
    }
  }
};

// 🎯 SERVIÇOS DE DISPONIBILIDADE INTELIGENTE
export const availabilityService = {
  // Verificar disponibilidade de horário para jogadores
  async getAvailableTimeSlots(courtId, date) {
    try {
      console.log('🔍 Verificando disponibilidade para jogadores:', { courtId, date });
      
      // 1. Primeiro, verificar se a quadra está aberta neste horário
      const scheduleSlots = await courtScheduleService.generateAvailableSlots(courtId, date);
      
      if (scheduleSlots.length === 0) {
        console.log('❌ Quadra não está aberta nesta data');
        return [];
      }
      
      // 2. Buscar reservas para a data e quadra
      const bookingsQuery = query(
        collection(db, 'bookings'),
        where('courtId', '==', courtId),
        where('date', '==', date)
      );
      const bookingsSnapshot = await getDocs(bookingsQuery);
      const bookings = bookingsSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));

      // 3. Buscar horários bloqueados para a data e quadra
      const blockedQuery = query(
        collection(db, 'blockedSlots'),
        where('courtId', '==', courtId),
        where('date', '==', date)
      );
      const blockedSnapshot = await getDocs(blockedQuery);
      const blockedSlots = blockedSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));

      // 4. Filtrar slots baseado em reservas e bloqueios
      const availableSlots = scheduleSlots.filter(slot => {
        const isBooked = bookings.some(booking => booking.time === slot.time);
        const isBlocked = blockedSlots.some(blocked => blocked.time === slot.time);
        
        return !isBooked && !isBlocked;
      });
      
      console.log(`✅ Encontrados ${availableSlots.length} horários disponíveis para jogadores`);
      return availableSlots;
      
    } catch (error) {
      console.error('❌ Erro ao verificar disponibilidade:', error);
      throw error;
    }
  },

  // Verificar se um horário específico está disponível
  async isTimeSlotAvailable(courtId, date, time) {
    try {
      console.log('🔍 Verificando disponibilidade específica:', { courtId, date, time });
      
      // Verificar reservas
      const bookingsQuery = query(
        collection(db, 'bookings'),
        where('courtId', '==', courtId),
        where('date', '==', date),
        where('time', '==', time)
      );
      const bookingsSnapshot = await getDocs(bookingsQuery);
      
      // Verificar bloqueios
      const blockedQuery = query(
        collection(db, 'blockedSlots'),
        where('courtId', '==', courtId),
        where('date', '==', date),
        where('time', '==', time)
      );
      const blockedSnapshot = await getDocs(blockedQuery);
      
      const isAvailable = bookingsSnapshot.empty && blockedSnapshot.empty;
      
      console.log(`✅ Horário ${time} está ${isAvailable ? 'disponível' : 'indisponível'}`);
      return isAvailable;
      
    } catch (error) {
      console.error('❌ Erro ao verificar disponibilidade específica:', error);
      throw error;
    }
  },

  // Buscar quadras com horários disponíveis para uma data
  async getCourtsWithAvailability(date, sport = null, location = null) {
    try {
      console.log('🔍 Buscando quadras com disponibilidade:', { date, sport, location });
      
      // Buscar todas as quadras
      const courtsQuery = query(collection(db, 'courts'));
      const courtsSnapshot = await getDocs(courtsQuery);
      let courts = courtsSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      
      // Aplicar filtros
      if (sport) {
        courts = courts.filter(court => {
          // Verificar se o esporte está na lista de esportes da quadra
          const courtSports = court.sports || [court.sport];
          return courtSports.some(courtSport => 
            courtSport.toLowerCase().includes(sport.toLowerCase())
          );
        });
      }
      
      if (location) {
        courts = courts.filter(court => {
          const searchLocation = location.toLowerCase();
          return (
            (court.address && court.address.toLowerCase().includes(searchLocation)) ||
            (court.location && court.location.toLowerCase().includes(searchLocation)) ||
            (court.establishmentName && court.establishmentName.toLowerCase().includes(searchLocation))
          );
        });
      }
      
      // Verificar disponibilidade para cada quadra
      const courtsWithAvailability = [];
      
      for (const court of courts) {
        const availableSlots = await this.getAvailableTimeSlots(court.id, date);
        
        if (availableSlots.length > 0) {
          courtsWithAvailability.push({
            ...court,
            availableSlots,
            totalAvailableSlots: availableSlots.length
          });
        }
      }
      
      console.log(`✅ Encontradas ${courtsWithAvailability.length} quadras com disponibilidade`);
      return courtsWithAvailability;
      
    } catch (error) {
      console.error('❌ Erro ao buscar quadras com disponibilidade:', error);
      throw error;
    }
  }
};

// 🔔 SERVIÇOS DE NOTIFICAÇÕES
export const notificationsService = {
  // Buscar notificações do dono
  async getOwnerNotifications(ownerId) {
    try {
      console.log('🔔 Buscando notificações para dono:', ownerId);
      
      const q = query(
        collection(db, 'notifications'),
        where('ownerId', '==', ownerId)
      );
      const querySnapshot = await getDocs(q);
      const notifications = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      
      // Ordenar por data de criação (mais recente primeiro)
      notifications.sort((a, b) => {
        const dateA = a.createdAt?.toDate?.() || new Date(a.createdAt || 0);
        const dateB = b.createdAt?.toDate?.() || new Date(b.createdAt || 0);
        return dateB - dateA;
      });
      
      console.log(`✅ Encontradas ${notifications.length} notificações`);
      return notifications;
      
    } catch (error) {
      console.error('❌ Erro ao buscar notificações:', error);
      throw error;
    }
  },

  // Marcar notificação como lida
  async markAsRead(notificationId) {
    try {
      await updateDoc(doc(db, 'notifications', notificationId), {
        isRead: true,
        readAt: serverTimestamp()
      });
      console.log('✅ Notificação marcada como lida:', notificationId);
    } catch (error) {
      console.error('❌ Erro ao marcar notificação como lida:', error);
      throw error;
    }
  },

  // Marcar todas as notificações como lidas
  async markAllAsRead(ownerId) {
    try {
      const q = query(
        collection(db, 'notifications'),
        where('ownerId', '==', ownerId),
        where('isRead', '==', false)
      );
      const querySnapshot = await getDocs(q);
      
      const batch = writeBatch(db);
      querySnapshot.docs.forEach(doc => {
        batch.update(doc.ref, {
          isRead: true,
          readAt: serverTimestamp()
        });
      });
      
      await batch.commit();
      console.log('✅ Todas as notificações marcadas como lidas');
    } catch (error) {
      console.error('❌ Erro ao marcar todas as notificações como lidas:', error);
      throw error;
    }
  }
};
