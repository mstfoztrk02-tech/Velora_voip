import axios from 'axios';

// Merkezi API Client - Tüm API çağrıları buradan geçer
const getBackendURL = () => {
  // 1. Environment variable varsa onu kullan
  if (process.env.REACT_APP_BACKEND_URL) {
    return process.env.REACT_APP_BACKEND_URL;
  }

  // 2. Browser ortamında ve production'daysa, aynı origin'i kullan
  if (typeof window !== 'undefined') {
    const origin = window.location.origin;
    // Localhost'ta geliştirme yapılıyorsa port 8000'i kullan
    if (origin.includes('localhost')) {
      return 'http://localhost:8000';
    }
    // Production'da aynı origin'i kullan (Vercel proxy veya aynı domain)
    return origin;
  }

  // 3. Fallback
  return 'http://localhost:8000';
};

const BACKEND_URL = getBackendURL();

const apiClient = axios.create({
  baseURL: BACKEND_URL,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Request Interceptor - Token ekleme
apiClient.interceptors.request.use(
  (config) => {
    // Auth token varsa header'a ekle
    const authUser = localStorage.getItem('auth_user');
    if (authUser) {
      try {
        const user = JSON.parse(authUser);
        if (user.token) {
          config.headers.Authorization = `Bearer ${user.token}`;
        }
      } catch (error) {
        console.error('Error parsing auth user:', error);
      }
    }
    
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response Interceptor - Error handling
apiClient.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    if (error.response) {
      // Server responded with error status
      const { status, data } = error.response;
      
      switch (status) {
        case 401:
          // Unauthorized - clear auth and redirect to login
          localStorage.removeItem('auth_user');
          if (window.location.pathname !== '/voip-crm') {
            window.location.href = '/voip-crm';
          }
          return Promise.reject({
            message: 'Oturum süreniz doldu. Lütfen tekrar giriş yapın.',
            status: 401
          });
          
        case 403:
          // Forbidden
          return Promise.reject({
            message: 'Bu işlem için yetkiniz yok.',
            status: 403
          });
          
        case 404:
          // Not Found
          return Promise.reject({
            message: data?.message || 'İstenen kaynak bulunamadı.',
            status: 404
          });
          
        case 500:
        case 502:
        case 503:
          // Server Error
          return Promise.reject({
            message: 'Sunucu hatası. Lütfen daha sonra tekrar deneyin.',
            status: status
          });
          
        default:
          return Promise.reject({
            message: data?.message || 'Bir hata oluştu.',
            status: status
          });
      }
    } else if (error.request) {
      // Request made but no response
      return Promise.reject({
        message: 'Sunucuya bağlanılamadı. İnternet bağlantınızı kontrol edin.',
        status: 0
      });
    } else {
      // Something else happened
      return Promise.reject({
        message: error.message || 'Beklenmeyen bir hata oluştu.',
        status: -1
      });
    }
  }
);

// Helper methods
const api = {
  get: (url, config) => apiClient.get(url, config),
  post: (url, data, config) => apiClient.post(url, data, config),
  put: (url, data, config) => apiClient.put(url, data, config),
  delete: (url, config) => apiClient.delete(url, config),
  patch: (url, data, config) => apiClient.patch(url, data, config)
};

export default api;
export { apiClient, BACKEND_URL };
