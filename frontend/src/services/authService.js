// Authentication Service
// API'ye hazır yapı - şimdilik mock

const DEMO_CODES = {
  bireysel: '123456',
  kurumsal: '654321',
  admin: '999999'
};

// Role definitions
const ROLES = {
  SUPER_ADMIN: 'super_admin',
  BAYI: 'bayi',
  MUSTERI: 'musteri',
  BIREYSEL: 'bireysel',
  KURUMSAL: 'kurumsal'
};

// SUPER_ADMIN yetki matrisi
const SUPER_ADMIN_PERMISSIONS = {
  // Müşteri/Tenant Yönetimi
  tenant_full_access: true,
  view_all_tenants: true,
  manage_all_tenants: true,
  
  // Paket ve Ödeme Yönetimi
  package_management: true,
  payment_management: true,
  approval_management: true,
  set_package_status: true, // aktif/pasif/askıda
  
  // Bayi Yönetimi
  dealer_full_management: true,
  dealer_create: true,
  dealer_delete: true,
  dealer_assign_customers: true,
  
  // Trunk ve Numara Yönetimi
  trunk_full_management: true,
  trunk_create: true,
  trunk_edit: true,
  trunk_delete: true,
  trunk_assign: true,
  number_management: true,
  number_assign: true,
  
  // Güvenlik Ayarları
  security_settings: true,
  ip_whitelist_management: true,
  ip_blacklist_management: true,
  force_logout_all_sessions: true,
  
  // Kampanya Yönetimi
  campaign_emergency_stop: true,
  campaign_global_control: true,
  
  // Spam/Fraud Yönetimi
  spam_management: true,
  fraud_detection: true,
  blocked_conversations: true,
  blocklist_management: true,
  
  // Entegrasyon Ayarları
  integration_full_management: true,
  api_key_management: true,
  api_secret_management: true,
  endpoint_management: true,
  webhook_management: true,
  
  // Sistem Ayarları
  system_settings: true,
  smtp_settings: true,
  codec_settings: true,
  timezone_settings: true,
  
  // Raporlama ve Audit
  reporting_full_access: true,
  audit_log_access: true,
  audit_log_export: true,
  
  // Tüm CRM Özellikleri
  view_live_calls: true,
  view_crm: true,
  view_cdr: true,
  listen_recordings: true,
  auto_dialer: true,
  campaigns: true,
  basic_tts: true,
  spam_detection: true,
  dealer_management: true,
  tariff_management: true,
  sms_module: true,
  advanced_tts: true,
  vip_controls: true
};

// Bayi yetkileri (sadece kendi müşterileri)
const BAYI_PERMISSIONS = {
  view_own_customers: true,
  manage_own_customers: true,
  view_own_calls: true,
  view_own_cdr: true,
  listen_own_recordings: true,
  basic_crm: true,
  // TAKILMAZ: trunk, sistem, entegrasyon ayarları
  trunk_management: false,
  system_settings: false,
  integration_management: false
};

// Müşteri yetkileri (sadece kendi verisi + paket bazlı)
const MUSTERI_PERMISSIONS = {
  view_own_data: true,
  view_own_calls: true,
  view_own_cdr: true,
  listen_own_recordings: true,
  // Paket bazlı ek yetkiler packageService'den gelecek
};

class AuthService {
  constructor() {
    this.apiEndpoint = process.env.REACT_APP_AUTH_API || '/api/auth';
    this.maxAttempts = 3;
    this.lockoutDuration = 300000; // 5 minutes
  }

  async verifyCode(phone, code, type = 'bireysel') {
    // DEMO: Rate limiting simulation
    const attemptKey = `auth_attempts_${phone}`;
    const lockoutKey = `auth_lockout_${phone}`;
    
    const attempts = parseInt(localStorage.getItem(attemptKey) || '0');
    const lockoutUntil = parseInt(localStorage.getItem(lockoutKey) || '0');
    
    if (Date.now() < lockoutUntil) {
      const remainingSeconds = Math.ceil((lockoutUntil - Date.now()) / 1000);
      throw new Error(`Çok fazla başarısız deneme. ${remainingSeconds} saniye sonra tekrar deneyin.`);
    }
    
    // DEMO: Mock verification
    await this.simulateNetworkDelay(500);
    
    const correctCode = DEMO_CODES[type] || DEMO_CODES.bireysel;
    
    if (code === correctCode) {
      // Success - clear attempts
      localStorage.removeItem(attemptKey);
      localStorage.removeItem(lockoutKey);
      
      // CRM login always creates role="user" (not admin/super_admin)
      const userData = {
        phone,
        type,
        role: 'user', // Always user role from CRM
        verified: true,
        loginTime: Date.now(),
        demo: true,
        permissions: this.getPermissions(type)
      };
      
      localStorage.setItem('auth_user', JSON.stringify(userData));
      return { success: true, user: userData };
    } else {
      // Failed attempt
      const newAttempts = attempts + 1;
      localStorage.setItem(attemptKey, newAttempts.toString());
      
      if (newAttempts >= this.maxAttempts) {
        localStorage.setItem(lockoutKey, (Date.now() + this.lockoutDuration).toString());
        throw new Error(`Çok fazla başarısız deneme. 5 dakika boyunca giriş yapılamaz.`);
      }
      
      throw new Error(`Yanlış kod. ${this.maxAttempts - newAttempts} deneme hakkınız kaldı.`);
    }
  }

  async verifyCorporateCode(companyName, username, code) {
    // DEMO: Corporate verification
    await this.simulateNetworkDelay(600);
    
    if (code === DEMO_CODES.kurumsal) {
      // CRM login always creates role="user" (not admin/super_admin)
      const userData = {
        companyName,
        username,
        type: 'kurumsal',
        role: 'user', // Always user role from CRM
        verified: true,
        loginTime: Date.now(),
        demo: true,
        permissions: this.getPermissions('kurumsal')
      };
      
      localStorage.setItem('auth_user', JSON.stringify(userData));
      return { success: true, user: userData };
    } else {
      throw new Error('Yanlış doğrulama kodu.');
    }
  }

  getPermissions(type) {
    const permissions = {
      bireysel: ['view_calls', 'listen_recordings', 'view_crm'],
      kurumsal: ['view_calls', 'listen_recordings', 'view_crm', 'manage_users', 'view_reports'],
      admin: ['*'], // SUPER_ADMIN - All permissions
      super_admin: ['*'], // Alias
      bayi: Object.keys(BAYI_PERMISSIONS).filter(k => BAYI_PERMISSIONS[k]),
      musteri: Object.keys(MUSTERI_PERMISSIONS).filter(k => MUSTERI_PERMISSIONS[k])
    };
    return permissions[type] || permissions.bireysel;
  }
  
  isSuperAdmin() {
    const user = this.getCurrentUser();
    return user?.type === 'admin' || user?.type === 'super_admin' || user?.permissions?.includes('*');
  }
  
  hasPermission(permission) {
    const user = this.getCurrentUser();
    if (!user) return false;
    
    // SUPER_ADMIN hiçbir kısıtlamaya takılmaz
    if (this.isSuperAdmin()) return true;
    
    return user.permissions?.includes(permission) || false;
  }
  
  getUserRole() {
    const user = this.getCurrentUser();
    if (!user) return null;
    
    if (user.type === 'admin' || user.type === 'super_admin') return ROLES.SUPER_ADMIN;
    if (user.type === 'bayi') return ROLES.BAYI;
    if (user.type === 'musteri') return ROLES.MUSTERI;
    if (user.type === 'kurumsal') return ROLES.KURUMSAL;
    return ROLES.BIREYSEL;
  }

  getCurrentUser() {
    const userData = localStorage.getItem('auth_user');
    return userData ? JSON.parse(userData) : null;
  }

  logout() {
    localStorage.removeItem('auth_user');
  }

  isAdmin() {
    const user = this.getCurrentUser();
    return user?.permissions?.includes('*');
  }

  simulateNetworkDelay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  // API endpoint configuration for future
  setApiEndpoint(endpoint) {
    this.apiEndpoint = endpoint;
  }
}

export default new AuthService();
export { DEMO_CODES, ROLES, SUPER_ADMIN_PERMISSIONS, BAYI_PERMISSIONS, MUSTERI_PERMISSIONS };
