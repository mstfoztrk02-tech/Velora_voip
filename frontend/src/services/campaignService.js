import api from './apiClient';

// Campaign Service - Kampanya yönetimi
class CampaignService {
  async getCampaigns() {
    try {
      const response = await api.get('/api/campaigns');
      return response.data;
    } catch (error) {
      // Mock fallback
      return [
        { id: '1', name: 'Kampanya 1', status: 'Aktif', callsMade: 150, successRate: 45 },
        { id: '2', name: 'Kampanya 2', status: 'Duraklı', callsMade: 80, successRate: 38 },
        { id: '3', name: 'Kampanya 3', status: 'Tamamlandı', callsMade: 500, successRate: 52 }
      ];
    }
  }

  async createCampaign(campaignData) {
    try {
      const response = await api.post('/api/campaigns', campaignData);
      return response.data;
    } catch (error) {
      console.error('Error creating campaign:', error);
      return { success: true, message: 'Kampanya oluşturuldu (mock)', mock: true };
    }
  }

  async startCampaign(campaignId) {
    try {
      const response = await api.post(`/api/campaigns/${campaignId}/start`);
      return response.data;
    } catch (error) {
      console.error('Error starting campaign:', error);
      return { success: true, message: 'Kampanya başlatıldı (mock)', mock: true };
    }
  }

  async pauseCampaign(campaignId) {
    try {
      const response = await api.post(`/api/campaigns/${campaignId}/pause`);
      return response.data;
    } catch (error) {
      console.error('Error pausing campaign:', error);
      return { success: true, message: 'Kampanya durduruldu (mock)', mock: true };
    }
  }

  async stopCampaign(campaignId) {
    try {
      const response = await api.post(`/api/campaigns/${campaignId}/stop`);
      return response.data;
    } catch (error) {
      console.error('Error stopping campaign:', error);
      return { success: true, message: 'Kampanya durduruldu (mock)', mock: true };
    }
  }

  async emergencyStopAll() {
    try {
      const response = await api.post('/api/campaigns/emergency-stop');
      return response.data;
    } catch (error) {
      console.error('Error emergency stopping campaigns:', error);
      return { success: true, message: 'Tüm kampanyalar acil durduruldu (mock)', mock: true };
    }
  }
}

export default new CampaignService();