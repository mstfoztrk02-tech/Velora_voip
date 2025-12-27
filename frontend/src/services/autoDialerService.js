import api from './apiClient';

// Auto Dialer Service
class AutoDialerService {
  // Get auto dialer status
  async getStatus(customerId) {
    try {
      const response = await api.get(`/api/voip-crm/auto-dialer/status/${customerId}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching auto dialer status:', error);
      throw error;
    }
  }

  // Get all numbers
  async getNumbers(customerId) {
    try {
      const response = await api.get('/api/voip-crm/auto-dialer/numbers', {
        params: { customer_id: customerId }
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching auto dialer numbers:', error);
      throw error;
    }
  }

  // Add single number
  async addNumber(customerId, phoneNumber) {
    try {
      const response = await api.post('/api/voip-crm/auto-dialer/numbers', {
        customer_id: customerId,
        phone_number: phoneNumber
      });
      return response.data;
    } catch (error) {
      console.error('Error adding number:', error);
      throw error;
    }
  }

  // Add multiple numbers
  async addNumbersBulk(customerId, phoneNumbers) {
    try {
      const response = await api.post('/api/voip-crm/auto-dialer/numbers/bulk', {
        customer_id: customerId,
        phone_numbers: phoneNumbers
      });
      return response.data;
    } catch (error) {
      console.error('Error adding numbers in bulk:', error);
      throw error;
    }
  }

  // Update number status
  async updateNumber(numberId, status, callResult = null) {
    try {
      const data = { status };
      if (callResult) {
        data.call_result = callResult;
      }
      const response = await api.put(`/api/voip-crm/auto-dialer/numbers/${numberId}`, data);
      return response.data;
    } catch (error) {
      console.error('Error updating number:', error);
      throw error;
    }
  }

  // Delete single number
  async deleteNumber(numberId) {
    try {
      const response = await api.delete(`/api/voip-crm/auto-dialer/numbers/${numberId}`);
      return response.data;
    } catch (error) {
      console.error('Error deleting number:', error);
      throw error;
    }
  }

  // Delete all numbers for customer
  async deleteAllNumbers(customerId) {
    try {
      const response = await api.delete(`/api/voip-crm/auto-dialer/numbers/bulk/${customerId}`);
      return response.data;
    } catch (error) {
      console.error('Error deleting all numbers:', error);
      throw error;
    }
  }

  // Start auto dialer
  async start(customerId, concurrentCalls) {
    try {
      const response = await api.post('/api/voip-crm/auto-dialer/start', {
        customer_id: customerId,
        concurrent_calls: concurrentCalls
      });
      return response.data;
    } catch (error) {
      console.error('Error starting auto dialer:', error);
      throw error;
    }
  }

  // Stop auto dialer
  async stop(customerId) {
    try {
      const response = await api.post('/api/voip-crm/auto-dialer/stop', {
        customer_id: customerId
      });
      return response.data;
    } catch (error) {
      console.error('Error stopping auto dialer:', error);
      throw error;
    }
  }

  // Call with ElevenLabs
  async callWithElevenLabs(agentId, agentPhoneNumberId, toNumber) {
    try {
      const response = await api.post('/api/elevenlabs/outbound-call', {
        agentId,
        agentPhoneNumberId,
        toNumber
      });
      return response.data;
    } catch (error) {
      console.error('Error calling with ElevenLabs:', error);
      throw error;
    }
  }
}

export default new AutoDialerService();
