// API Functions
const API = {
    async request(endpoint, options = {}) {
        try {
            const url = `${CONFIG.BACKEND_URL}${CONFIG.API_PREFIX}${endpoint}`;
            const response = await fetch(url, {
                headers: {
                    'Content-Type': 'application/json',
                    ...options.headers
                },
                ...options
            });
            
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            return await response.json();
        } catch (error) {
            console.error('API Error:', error);
            throw error;
        }
    },
    
    // Chatbot
    async sendChatMessage(message, sessionId) {
        return this.request('/chatbot/chat', {
            method: 'POST',
            body: JSON.stringify({ message, session_id: sessionId })
        });
    },
    
    // VoIP CRM
    async getStatistics() {
        return this.request('/voip-crm/statistics');
    },
    
    async getDealers() {
        return this.request('/voip-crm/dealers');
    },
    
    async getCustomers() {
        return this.request('/voip-crm/customers');
    },
    
    async getUsers() {
        return this.request('/voip-crm/users');
    },
    
    async getActiveCalls() {
        return this.request('/voip-crm/active-calls');
    },
    
    async getCallRecords() {
        return this.request('/voip-crm/call-records');
    },
    
    async terminateCall(callId) {
        return this.request(`/voip-crm/active-calls/${callId}`, {
            method: 'DELETE'
        });
    }
};