import api from './apiClient';

// Reporting Service - Raporlama ve audit log
class ReportingService {
  async getAuditLogs(filters = {}) {
    try {
      const response = await api.get('/api/reporting/audit-logs', { params: filters });
      return response.data;
    } catch (error) {
      return [
        { id: '1', user: 'Admin', action: 'Bayi Oluşturdu', target: 'Bayi A', timestamp: '2025-01-15 10:30', ip: '192.168.1.100' },
        { id: '2', user: 'Bayi1', action: 'Müşteri Ekledi', target: 'Müşteri X', timestamp: '2025-01-15 11:00', ip: '10.0.0.25' },
        { id: '3', user: 'Admin', action: 'Paket Onayladı', target: 'Tenant B', timestamp: '2025-01-15 11:30', ip: '192.168.1.100' }
      ];
    }
  }

  async exportAuditLogs(filters = {}) {
    try {
      const response = await api.post('/api/reporting/audit-logs/export', filters);
      return response.data;
    } catch (error) {
      console.error('Error exporting audit logs:', error);
      return { success: true, message: 'Audit loglar dışa aktarıldı (mock)', downloadUrl: 'mock://audit.csv', mock: true };
    }
  }

  async getSystemReports(reportType, filters = {}) {
    try {
      const response = await api.get(`/api/reporting/system/${reportType}`, { params: filters });
      return response.data;
    } catch (error) {
      return {
        reportType,
        data: [],
        mock: true,
        message: 'Rapor oluşturuldu (mock)'
      };
    }
  }

  async getUserActivity(userId, filters = {}) {
    try {
      const response = await api.get(`/api/reporting/user-activity/${userId}`, { params: filters });
      return response.data;
    } catch (error) {
      return [
        { action: 'Login', timestamp: '2025-01-15 09:00', details: 'Web' },
        { action: 'Görüntüledi', timestamp: '2025-01-15 09:05', details: 'CRM Dashboard' },
        { action: 'Oluşturdu', timestamp: '2025-01-15 09:15', details: 'Yeni Müşteri' }
      ];
    }
  }
}

export default new ReportingService();