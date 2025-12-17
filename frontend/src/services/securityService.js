import api from './apiClient';

// Security Service - Güvenlik ayarları
class SecurityService {
  async getIPWhitelist() {
    try {
      const response = await api.get('/api/security/ip-whitelist');
      return response.data;
    } catch (error) {
      return [
        { id: '1', ip: '192.168.1.100', description: 'Office', addedBy: 'Admin', addedAt: '2025-01-01' },
        { id: '2', ip: '10.0.0.50', description: 'VPN', addedBy: 'Admin', addedAt: '2025-01-05' }
      ];
    }
  }

  async addToWhitelist(ipData) {
    try {
      const response = await api.post('/api/security/ip-whitelist', ipData);
      return response.data;
    } catch (error) {
      console.error('Error adding to whitelist:', error);
      return { success: true, message: 'IP whitelist\'e eklendi (mock)', mock: true };
    }
  }

  async removeFromWhitelist(ipId) {
    try {
      const response = await api.delete(`/api/security/ip-whitelist/${ipId}`);
      return response.data;
    } catch (error) {
      console.error('Error removing from whitelist:', error);
      return { success: true, message: 'IP whitelist\'ten kaldırıldı (mock)', mock: true };
    }
  }

  async getIPBlacklist() {
    try {
      const response = await api.get('/api/security/ip-blacklist');
      return response.data;
    } catch (error) {
      return [
        { id: '1', ip: '123.45.67.89', reason: 'Spam', blockedBy: 'System', blockedAt: '2025-01-10' }
      ];
    }
  }

  async addToBlacklist(ipData) {
    try {
      const response = await api.post('/api/security/ip-blacklist', ipData);
      return response.data;
    } catch (error) {
      console.error('Error adding to blacklist:', error);
      return { success: true, message: 'IP blacklist\'e eklendi (mock)', mock: true };
    }
  }

  async getActiveSessions() {
    try {
      const response = await api.get('/api/security/sessions');
      return response.data;
    } catch (error) {
      return [
        { id: '1', userId: 'user1', username: 'Admin', ip: '192.168.1.100', lastActivity: '2 dk önce' },
        { id: '2', userId: 'user2', username: 'Bayi1', ip: '10.0.0.25', lastActivity: '5 dk önce' }
      ];
    }
  }

  async logoutSession(sessionId) {
    try {
      const response = await api.delete(`/api/security/sessions/${sessionId}`);
      return response.data;
    } catch (error) {
      console.error('Error logging out session:', error);
      return { success: true, message: 'Oturum kapatıldı (mock)', mock: true };
    }
  }

  async logoutAllSessions() {
    try {
      const response = await api.post('/api/security/sessions/logout-all');
      return response.data;
    } catch (error) {
      console.error('Error logging out all sessions:', error);
      return { success: true, message: 'Tüm oturumlar kapatıldı (mock)', mock: true };
    }
  }
}

export default new SecurityService();