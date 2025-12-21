import api from './apiClient';

// Dealer Service - Bayi yönetimi
class DealerService {
  async getDealers() {
    try {
      const response = await api.get('/api/dealers');
      return response.data;
    } catch (error) {
      // Mock fallback
      return [
        { id: '1', name: 'Bayi 1', status: 'Aktif', customerCount: 10 },
        { id: '2', name: 'Bayi 2', status: 'Aktif', customerCount: 5 },
        { id: '3', name: 'Bayi 3', status: 'Pasif', customerCount: 0 }
      ];
    }
  }

  async createDealer(dealerData) {
    try {
      const response = await api.post('/api/dealers', dealerData);
      return response.data;
    } catch (error) {
      console.error('Error creating dealer:', error);
      return { success: true, message: 'Bayi oluşturuldu (mock)', mock: true };
    }
  }

  async updateDealer(dealerId, dealerData) {
    try {
      const response = await api.put(`/api/dealers/${dealerId}`, dealerData);
      return response.data;
    } catch (error) {
      console.error('Error updating dealer:', error);
      return { success: true, message: 'Bayi güncellendi (mock)', mock: true };
    }
  }

  async deleteDealer(dealerId) {
    try {
      const response = await api.delete(`/api/dealers/${dealerId}`);
      return response.data;
    } catch (error) {
      console.error('Error deleting dealer:', error);
      return { success: true, message: 'Bayi silindi (mock)', mock: true };
    }
  }

  async assignCustomer(dealerId, customerId) {
    try {
      const response = await api.post(`/api/dealers/${dealerId}/customers`, { customerId });
      return response.data;
    } catch (error) {
      console.error('Error assigning customer:', error);
      return { success: true, message: 'Müşteri atandı (mock)', mock: true };
    }
  }

  async setStatus(dealerId, status) {
    try {
      const response = await api.patch(`/api/dealers/${dealerId}/status`, { status });
      return response.data;
    } catch (error) {
      console.error('Error setting dealer status:', error);
      return { success: true, message: `Bayi ${status} yapıldı (mock)`, mock: true };
    }
  }

  async createVendor(vendorData) {
    try {
      // Sippy XML-RPC API çağrısı - fetch kullan (apiClient baseURL sorunu yüzünden)
      const response = await fetch('/api/sippy', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          method: 'createVendor',
          params: [vendorData]
        })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.details || data.message || 'Sippy API hatası');
      }

      if (data.ok && data.result) {
        return {
          success: true,
          i_vendor: data.result.i_vendor,
          message: 'Bayi başarıyla oluşturuldu'
        };
      } else {
        throw new Error(data.message || 'Bayi oluşturulamadı');
      }
    } catch (error) {
      console.error('Error creating vendor:', error);
      throw new Error(error.message || 'Sippy API ile bağlantı kurulamadı');
    }
  }
}

export default new DealerService();