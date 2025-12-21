// Package Service
// API'ye hazır yapı - şimdilik mock

const PACKAGES = {
  silver: {
    id: 'silver',
    name: 'Silver',
    color: 'gray',
    price: 'Fiyat bilgisi için yetkili AI\'dan bilgi alın.',
    features: [
      'Gerçek zamanlı çağrı ekranları',
      'Temel CRM (müşteri/lead, notlar)',
      'Çağrı kayıtları görüntüleme',
      'Ses kaydı dinleme'
    ],
    permissions: ['view_live_calls', 'view_crm', 'view_cdr', 'listen_recordings']
  },
  gold: {
    id: 'gold',
    name: 'Gold',
    color: 'yellow',
    price: 'Fiyat bilgisi için yetkili AI\'dan bilgi alın.',
    features: [
      'Silver özellikleri +',
      'Otomatik arama modülü',
      'Kampanya oluşturma',
      'Arama başlat / durdur / duraklat',
      'Temel TTS seçimi (ElevenLabs)'
    ],
    permissions: [
      'view_live_calls', 'view_crm', 'view_cdr', 'listen_recordings',
      'auto_dialer', 'campaigns', 'basic_tts'
    ]
  },
  platin: {
    id: 'platin',
    name: 'Platin',
    color: 'purple',
    price: 'Fiyat bilgisi için yetkili AI\'dan bilgi alın.',
    features: [
      'Gold özellikleri +',
      'Spam çağrı tespiti',
      'Trunk bağlama (SIP)',
      'Bayi ekle / çıkar',
      'Tarife belirleme',
      'Numara atama',
      'SMS modülü',
      'ElevenLabs TTS + Text to Speech',
      'VIP kontrol özellikleri'
    ],
    permissions: [
      'view_live_calls', 'view_crm', 'view_cdr', 'listen_recordings',
      'auto_dialer', 'campaigns', 'basic_tts',
      'spam_detection', 'trunk_management', 'dealer_management',
      'tariff_management', 'number_assignment', 'sms_module', 'advanced_tts', 'vip_controls'
    ]
  }
};

const PACKAGE_STATUS = {
  PENDING: 'Beklemede',
  ACTIVE: 'Aktif',
  INACTIVE: 'Pasif',
  SUSPENDED: 'Askıda'
};

class PackageService {
  constructor() {
    this.apiEndpoint = process.env.REACT_APP_PACKAGE_API || '/api/packages';
  }

  getPackages() {
    return PACKAGES;
  }

  getPackage(packageId) {
    return PACKAGES[packageId];
  }

  async selectPackage(userId, packageId) {
    // DEMO: Mock package selection
    await this.simulateNetworkDelay(300);
    
    const userPackage = {
      userId,
      packageId,
      status: 'Beklemede',
      approvedByAdmin: false,
      paymentReceived: false,
      selectedAt: Date.now()
    };
    
    localStorage.setItem(`package_${userId}`, JSON.stringify(userPackage));
    return userPackage;
  }

  getUserPackage(userId) {
    const packageData = localStorage.getItem(`package_${userId}`);
    return packageData ? JSON.parse(packageData) : null;
  }

  hasPermission(userId, permission) {
    // CRITICAL: SUPER_ADMIN bypass - check from authService
    const authUser = localStorage.getItem('auth_user');
    if (authUser) {
      const user = JSON.parse(authUser);
      // SUPER_ADMIN hiçbir feature gating veya paket kilidine TAKILMAZ
      if (user.type === 'admin' || user.type === 'super_admin' || user.permissions?.includes('*')) {
        return true;
      }
    }
    
    const userPackage = this.getUserPackage(userId);
    
    if (!userPackage) return false;
    
    // Demo override: if isDemoOverride is true, grant all permissions
    if (userPackage.isDemoOverride) {
      const pkg = PACKAGES[userPackage.packageId];
      return pkg?.permissions?.includes(permission) || false;
    }
    
    if (userPackage.status !== 'Aktif') return false;
    if (!userPackage.approvedByAdmin) return false;
    
    const pkg = PACKAGES[userPackage.packageId];
    return pkg?.permissions?.includes(permission) || false;
  }

  async approvePackage(userId, approved = true) {
    // DEMO: Admin approval
    await this.simulateNetworkDelay(200);
    
    const userPackage = this.getUserPackage(userId);
    if (userPackage) {
      userPackage.approvedByAdmin = approved;
      userPackage.status = approved ? 'Aktif' : 'Beklemede';
      localStorage.setItem(`package_${userId}`, JSON.stringify(userPackage));
    }
    return userPackage;
  }

  async demoActivateAllPackages(userId) {
    // DEMO ONLY: Instantly activate all permissions for demo purposes
    await this.simulateNetworkDelay(100);
    
    const userPackage = this.getUserPackage(userId);
    if (userPackage) {
      userPackage.approvedByAdmin = true;
      userPackage.status = 'Aktif';
      userPackage.paymentReceived = true;
      userPackage.isDemoOverride = true;
      localStorage.setItem(`package_${userId}`, JSON.stringify(userPackage));
    }
    return userPackage;
  }

  async markPaymentReceived(userId) {
    // Admin marks payment as received
    await this.simulateNetworkDelay(200);
    
    const userPackage = this.getUserPackage(userId);
    if (userPackage) {
      userPackage.paymentReceived = true;
      localStorage.setItem(`package_${userId}`, JSON.stringify(userPackage));
    }
    return userPackage;
  }

  async markPaymentReceived(userId) {
    await this.simulateNetworkDelay(200);
    
    const userPackage = this.getUserPackage(userId);
    if (userPackage) {
      userPackage.paymentReceived = true;
      localStorage.setItem(`package_${userId}`, JSON.stringify(userPackage));
    }
    return userPackage;
  }

  async togglePlatinAccess(userId, enabled) {
    await this.simulateNetworkDelay(200);
    
    const userPackage = this.getUserPackage(userId);
    if (userPackage && userPackage.packageId === 'platin') {
      userPackage.platinEnabled = enabled;
      localStorage.setItem(`package_${userId}`, JSON.stringify(userPackage));
    }
    return userPackage;
  }

  simulateNetworkDelay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

export default new PackageService();
export { PACKAGES, PACKAGE_STATUS };
