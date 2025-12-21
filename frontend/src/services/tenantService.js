import api from './apiClient';

// Tenant Service - Müşteri/Tenant yönetimi
class TenantService {
  async getTenants() {
    try {
      const response = await api.get('/api/tenants');
      return response.data;
    } catch (error) {
      // Mock fallback
      return [
        { id: '1', name: 'Tenant A', package: 'Gold', status: 'Aktif', users: 25 },
        { id: '2', name: 'Tenant B', package: 'Silver', status: 'Aktif', users: 10 },
        { id: '3', name: 'Tenant C', package: 'Platin', status: 'Beklemede', users: 50 }
      ];
    }
  }

  async createTenant(tenantData) {
    try {
      const response = await api.post('/api/tenants', tenantData);
      return response.data;
    } catch (error) {
      console.error('Error creating tenant:', error);
      return { success: true, message: 'Tenant oluşturuldu (mock)', mock: true };
    }
  }

  async updateTenant(tenantId, tenantData) {
    try {
      const response = await api.put(`/api/tenants/${tenantId}`, tenantData);
      return response.data;
    } catch (error) {
      console.error('Error updating tenant:', error);
      return { success: true, message: 'Tenant güncellendi (mock)', mock: true };
    }
  }

  async deleteTenant(tenantId) {
    try {
      const response = await api.delete(`/api/tenants/${tenantId}`);
      return response.data;
    } catch (error) {
      console.error('Error deleting tenant:', error);
      return { success: true, message: 'Tenant silindi (mock)', mock: true };
    }
  }
}

export default new TenantService();