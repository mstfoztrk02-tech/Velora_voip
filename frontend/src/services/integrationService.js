// Integration Service - API adapters
// Tüm dış sistemler için hazır yapı

class IntegrationService {
  constructor() {
    this.config = {
      dellV100: {
        endpoint: process.env.REACT_APP_DELL_V100_API || '',
        apiKey: '',
        enabled: false
      },
      sippySoft: {
        endpoint: process.env.REACT_APP_SIPPY_API || '',
        username: '',
        password: '',
        enabled: false
      },
      issabel: {
        endpoint: process.env.REACT_APP_ISSABEL_API || '',
        apiKey: '',
        enabled: false
      },
      elevenLabs: {
        endpoint: 'https://api.elevenlabs.io/v1',
        apiKey: process.env.REACT_APP_ELEVENLABS_KEY || '',
        enabled: false
      },
      smsGateway: {
        endpoint: process.env.REACT_APP_SMS_API || '',
        apiKey: '',
        enabled: false
      },
      spamDetection: {
        endpoint: process.env.REACT_APP_SPAM_API || '',
        apiKey: '',
        enabled: false
      }
    };
  }

  // Dell V100 AI Machine
  async getDellV100Status() {
    if (!this.config.dellV100.enabled) {
      return { status: 'mock', message: 'Dell V100 bağlantısı mock modda' };
    }
    // Real API call will go here
    return { status: 'offline' };
  }

  // SippySoft Integration
  async getSippyActiveCalls() {
    if (!this.config.sippySoft.enabled) {
      return this.mockActiveCalls();
    }
    // Real API: GET /sippy/active-calls
    return [];
  }

  async getSippyCDR(filters) {
    if (!this.config.sippySoft.enabled) {
      return this.mockCDR();
    }
    // Real API: GET /sippy/cdr
    return [];
  }

  // Issabel Integration
  async getIssabelQueue() {
    if (!this.config.issabel.enabled) {
      return { waiting: 0, active: 0 };
    }
    // Real API: GET /issabel/queue
    return {};
  }

  // ElevenLabs TTS
  async synthesizeSpeech(text, voiceId = 'default') {
    if (!this.config.elevenLabs.enabled) {
      return { audio_url: 'mock://audio.mp3', message: 'ElevenLabs mock' };
    }
    // Real API: POST /v1/text-to-speech/{voice_id}
    return {};
  }

  async getVoices() {
    if (!this.config.elevenLabs.enabled) {
      return [
        { id: 'voice1', name: 'Rachel - Profesyonel Kadın' },
        { id: 'voice2', name: 'Josh - Samimi Erkek' },
        { id: 'voice3', name: 'Bella - Genç Kadın' }
      ];
    }
    // Real API: GET /v1/voices
    return [];
  }

  // SMS Module
  async sendSMS(to, message) {
    if (!this.config.smsGateway.enabled) {
      return { success: true, message: 'SMS mock gönderildi', mock: true };
    }
    // Real API: POST /sms/send
    return {};
  }

  // Spam Detection
  async checkSpam(phoneNumber) {
    if (!this.config.spamDetection.enabled) {
      const random = Math.random();
      return {
        isSpam: random > 0.7,
        confidence: Math.round(random * 100),
        mock: true
      };
    }
    // Real API: POST /spam/check
    return {};
  }

  // Mock data generators
  mockActiveCalls() {
    return [
      {
        id: 'call_1',
        caller: '+90 532 123 4567',
        callee: '+90 212 555 0001',
        duration: Math.floor(Math.random() * 300),
        status: 'active',
        timestamp: new Date().toISOString()
      },
      {
        id: 'call_2',
        caller: '+90 533 234 5678',
        callee: '+90 312 555 0002',
        duration: Math.floor(Math.random() * 200),
        status: 'ringing',
        timestamp: new Date().toISOString()
      }
    ];
  }

  mockCDR() {
    return Array.from({ length: 20 }, (_, i) => ({
      id: `cdr_${i}`,
      caller: `+90 5${Math.floor(Math.random() * 90) + 10} ${Math.floor(Math.random() * 900) + 100} ${Math.floor(Math.random() * 9000) + 1000}`,
      callee: `+90 ${Math.floor(Math.random() * 300) + 200} 555 ${String(Math.floor(Math.random() * 10000)).padStart(4, '0')}`,
      duration: Math.floor(Math.random() * 600),
      timestamp: new Date(Date.now() - Math.random() * 86400000).toISOString(),
      recording_url: 'mock://recording.wav'
    }));
  }

  // Configuration
  configure(service, config) {
    if (this.config[service]) {
      this.config[service] = { ...this.config[service], ...config };
      localStorage.setItem('integration_config', JSON.stringify(this.config));
    }
  }

  getConfig(service) {
    return this.config[service];
  }

  getAllConfig() {
    return {
      sippySoft: this.getConfig('sippySoft') || { endpoint: '', username: '', password: '', enabled: false },
      issabel: this.getConfig('issabel') || { endpoint: '', apiKey: '', enabled: false },
      elevenLabs: this.getConfig('elevenLabs') || { endpoint: 'https://api.elevenlabs.io/v1', apiKey: '', enabled: false },
      dellV100: this.getConfig('dellV100') || { endpoint: '', apiKey: '', enabled: false }
    };
  }
}

export default new IntegrationService();
