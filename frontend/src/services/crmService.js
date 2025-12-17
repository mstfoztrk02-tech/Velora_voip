import api from './apiClient';

// CRM Service - Tüm CRM operasyonları
class CRMService {
  // Statistics
  async getStatistics() {
    try {
      const response = await api.get('/api/voip-crm/statistics');
      return response.data;
    } catch (error) {
      console.error('Error fetching statistics:', error);
      throw error;
    }
  }

  // Dealers
  async getDealers() {
    try {
      const response = await api.get('/api/voip-crm/dealers');
      return response.data;
    } catch (error) {
      console.error('Error fetching dealers:', error);
      throw error;
    }
  }

  async createDealer(dealerData) {
    try {
      const response = await api.post('/api/voip-crm/dealers', dealerData);
      return response.data;
    } catch (error) {
      console.error('Error creating dealer:', error);
      throw error;
    }
  }

  async updateDealer(dealerId, dealerData) {
    try {
      const response = await api.put(`/api/voip-crm/dealers/${dealerId}`, dealerData);
      return response.data;
    } catch (error) {
      console.error('Error updating dealer:', error);
      throw error;
    }
  }

  async deleteDealer(dealerId) {
    try {
      const response = await api.delete(`/api/voip-crm/dealers/${dealerId}`);
      return response.data;
    } catch (error) {
      console.error('Error deleting dealer:', error);
      throw error;
    }
  }

  // Customers
  async getCustomers() {
    try {
      const response = await api.get('/api/voip-crm/customers');
      return response.data;
    } catch (error) {
      console.error('Error fetching customers:', error);
      throw error;
    }
  }

  async createCustomer(customerData) {
    try {
      const response = await api.post('/api/voip-crm/customers', customerData);
      return response.data;
    } catch (error) {
      console.error('Error creating customer:', error);
      throw error;
    }
  }

  async updateCustomer(customerId, customerData) {
    try {
      const response = await api.put(`/api/voip-crm/customers/${customerId}`, customerData);
      return response.data;
    } catch (error) {
      console.error('Error updating customer:', error);
      throw error;
    }
  }

  async deleteCustomer(customerId) {
    try {
      const response = await api.delete(`/api/voip-crm/customers/${customerId}`);
      return response.data;
    } catch (error) {
      console.error('Error deleting customer:', error);
      throw error;
    }
  }

  // Users
  async getUsers() {
    try {
      const response = await api.get('/api/voip-crm/users');
      return response.data;
    } catch (error) {
      console.error('Error fetching users:', error);
      throw error;
    }
  }

  async createUser(userData) {
    try {
      const response = await api.post('/api/voip-crm/users', userData);
      return response.data;
    } catch (error) {
      console.error('Error creating user:', error);
      throw error;
    }
  }

  // Call Records (CDR)
  async getCallRecords(filters = {}) {
    try {
      const response = await api.get('/api/voip-crm/call-records', { params: filters });
      return response.data;
    } catch (error) {
      console.error('Error fetching call records:', error);
      throw error;
    }
  }

  // Active Calls
  async getActiveCalls() {
    try {
      const response = await api.get('/api/voip-crm/active-calls');
      return response.data;
    } catch (error) {
      console.error('Error fetching active calls:', error);
      throw error;
    }
  }

  async terminateCall(callId) {
    try {
      const response = await api.delete(`/api/voip-crm/active-calls/${callId}`);
      return response.data;
    } catch (error) {
      console.error('Error terminating call:', error);
      throw error;
    }
  }

  // Tariffs
  async getTariffs() {
    try {
      const response = await api.get('/api/voip-crm/tariffs');
      return response.data;
    } catch (error) {
      console.error('Error fetching tariffs:', error);
      throw error;
    }
  }

  async createTariff(tariffData) {
    try {
      const response = await api.post('/api/voip-crm/tariffs', tariffData);
      return response.data;
    } catch (error) {
      console.error('Error creating tariff:', error);
      throw error;
    }
  }

  // Batch load all data
  async loadAllData() {
    try {
      const [stats, dealers, customers, users, callRecords, activeCalls, tariffs] = await Promise.all([
        this.getStatistics(),
        this.getDealers(),
        this.getCustomers(),
        this.getUsers(),
        this.getCallRecords(),
        this.getActiveCalls(),
        this.getTariffs()
      ]);

      return {
        stats,
        dealers,
        customers,
        users,
        callRecords,
        activeCalls,
        tariffs
      };
    } catch (error) {
      console.error('Error loading all CRM data:', error);
      throw error;
    }
  }
}

export default new CRMService();
