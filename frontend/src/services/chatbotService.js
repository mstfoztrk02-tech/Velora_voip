import api from './apiClient';

// Chatbot Service
class ChatbotService {
  async getHistory(sessionId) {
    try {
      const response = await api.get(`/api/chatbot/history/${sessionId}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching chat history:', error);
      throw error;
    }
  }

  async sendMessage(sessionId, message) {
    try {
      const response = await api.post('/api/chatbot/chat', {
        session_id: sessionId,
        message: message
      });
      return response.data;
    } catch (error) {
      console.error('Error sending chat message:', error);
      throw error;
    }
  }

  async clearHistory(sessionId) {
    try {
      const response = await api.delete(`/api/chatbot/history/${sessionId}`);
      return response.data;
    } catch (error) {
      console.error('Error clearing chat history:', error);
      throw error;
    }
  }
}

export default new ChatbotService();
