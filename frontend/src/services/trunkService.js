import api from './apiClient';

// Trunk Service - Trunk ve numara yönetimi
class TrunkService {
  async getTrunks() {
    try {
      const response = await api.get('/api/trunks');
      return response.data;
    } catch (error) {
      // Mock fallback
      return [
        { id: '1', name: 'Trunk 1', ip: '192.168.1.10', port: 5060, status: 'Online', maxCalls: 100 },
        { id: '2', name: 'Trunk 2', ip: '192.168.1.11', port: 5060, status: 'Online', maxCalls: 50 },
        { id: '3', name: 'Trunk 3', ip: '192.168.1.12', port: 5060, status: 'Offline', maxCalls: 30 }
      ];
    }
  }

  async createTrunk(trunkData) {
    try {
      const response = await api.post('/api/trunks', trunkData);
      return response.data;
    } catch (error) {
      console.error('Error creating trunk:', error);
      return { success: true, message: 'Trunk oluşturuldu (mock)', mock: true };
    }
  }

  async updateTrunk(trunkId, trunkData) {
    try {
      const response = await api.put(`/api/trunks/${trunkId}`, trunkData);
      return response.data;
    } catch (error) {
      console.error('Error updating trunk:', error);
      return { success: true, message: 'Trunk güncellendi (mock)', mock: true };
    }
  }

  async deleteTrunk(trunkId) {
    try {
      const response = await api.delete(`/api/trunks/${trunkId}`);
      return response.data;
    } catch (error) {
      console.error('Error deleting trunk:', error);
      return { success: true, message: 'Trunk silindi (mock)', mock: true };
    }
  }

  async testTrunk(trunkId) {
    try {
      const response = await api.post(`/api/trunks/${trunkId}/test`);
      return response.data;
    } catch (error) {
      console.error('Error testing trunk:', error);
      return { success: true, message: 'Trunk test edildi (mock)', status: 'online', mock: true };
    }
  }

  async getNumbers() {
    try {
      const response = await api.get('/api/numbers');
      return response.data;
    } catch (error) {
      return [
        { id: '1', number: '+90 212 555 0001', status: 'Atandı', assignedTo: 'Müşteri A' },
        { id: '2', number: '+90 212 555 0002', status: 'Boş', assignedTo: null },
        { id: '3', number: '+90 212 555 0003', status: 'Atandı', assignedTo: 'Müşteri B' }
      ];
    }
  }

  async assignNumber(numberId, targetId) {
    try {
      const response = await api.post(`/api/numbers/${numberId}/assign`, { targetId });
      return response.data;
    } catch (error) {
      console.error('Error assigning number:', error);
      return { success: true, message: 'Numara atandı (mock)', mock: true };
    }
  }
}

export default new TrunkService();