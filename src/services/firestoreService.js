// 🔥 Serviços Firestore para o Projeto Vestiário
import { 
  collection, 
  doc, 
  getDocs, 
  getDoc, 
  addDoc, 
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
      const courtRef = doc(db, 'courts', courtId);
      await updateDoc(courtRef, {
        ...updateData,
        updatedAt: serverTimestamp()
      });
      console.log('✅ Quadra atualizada com sucesso:', courtId);
      return { id: courtId, ...updateData };
    } catch (error) {
      console.error('❌ Erro ao atualizar quadra:', error);
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
        { id: 'volei', name: 'Vôlei', icon: '🏐' }
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
        status: 'pending',
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      });
      console.log('✅ Reserva criada com sucesso:', docRef.id);
      return { id: docRef.id, ...bookingData };
    } catch (error) {
      console.error('❌ Erro ao criar reserva:', error);
      throw error;
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
      return courts.map(court => {
        const courtData = court.data ? court.data() : court;
        const courtId = court.id;
        
        // Filtrar reservas e bloqueios para esta quadra
        const courtBookings = bookings.filter(b => b.courtId === courtId);
        const courtBlockedSlots = blockedSlots.filter(b => b.courtId === courtId);
        
        // Gerar slots de horário
        const timeSlots = [];
        const startHour = 8;
        const endHour = 22;
        
        for (let hour = startHour; hour < endHour; hour++) {
          const time = `${hour.toString().padStart(2, '0')}:00`;
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
        
        return {
          id: courtId,
          courtId,
          courtName: courtData.name,
          timeSlots
        };
      });
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
