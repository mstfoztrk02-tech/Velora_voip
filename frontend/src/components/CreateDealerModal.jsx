import React, { useState } from 'react';
import { X, Building2, CreditCard, Phone, Settings, Brain, Shield } from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { useToast } from '../hooks/use-toast';

const CreateDealerModal = ({ isOpen, onClose, tariffs, onSuccess }) => {
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    // Basic Info
    name: '',
    email: '',
    phone: '',
    
    // Tarife & Billing
    tariff: '',
    billing_increment: 'per_minute', // per_second, per_minute
    currency: 'TRY',
    auto_number_assignment: true,
    number_prefix: '+90',
    
    // Trunk Settings
    trunk_ip: '',
    trunk_port: '5060',
    trunk_codec: 'G.711',
    trunk_protocol: 'UDP',
    trunk_max_calls: '50',
    trunk_auth_username: '',
    trunk_auth_password: '',
    nat_traversal: true,
    
    // AI Features
    ai_noise_filter: true,
    ai_spam_detection: true,
    ai_speech_to_text: false,
    ai_sentiment_analysis: false,
    
    // Limits
    call_limit_daily: '1000',
    call_limit_monthly: '30000',
    balance_limit: '10000',
    credit_limit: '5000',
    
    // Permissions
    can_create_customers: true,
    can_view_reports: true,
    can_manage_users: true,
    can_access_api: false,
    can_export_cdr: true
  });

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validation
    if (!formData.name || !formData.email || !formData.phone) {
      toast({
        title: "Hata",
        description: "Lütfen zorunlu alanları doldurun.",
        variant: "destructive"
      });
      return;
    }

    try {
      // Here you would make the API call
      toast({
        title: "Başarılı",
        description: `${formData.name} başarıyla oluşturuldu.`
      });
      onSuccess();
      onClose();
    } catch (error) {
      toast({
        title: "Hata",
        description: "Bayi oluşturulurken bir hata oluştu.",
        variant: "destructive"
      });
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-2xl max-w-5xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex justify-between items-center p-6 border-b sticky top-0 bg-white z-10">
          <div className="flex items-center gap-3">
            <div className="bg-blue-100 p-3 rounded-lg">
              <Building2 className="text-blue-600" size={24} />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Yeni Bayi Oluştur</h2>
              <p className="text-sm text-gray-600">Tüm detayları dikkatlice doldurun</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X size={24} />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6">
          <Tabs defaultValue="basic" className="w-full">
            <TabsList className="grid w-full grid-cols-5">
              <TabsTrigger value="basic">Temel Bilgiler</TabsTrigger>
              <TabsTrigger value="billing">Tarife & Ödeme</TabsTrigger>
              <TabsTrigger value="trunk">Trunk Ayarları</TabsTrigger>
              <TabsTrigger value="ai">AI Özellikleri</TabsTrigger>
              <TabsTrigger value="limits">Limitler & Yetkiler</TabsTrigger>
            </TabsList>

            {/* Basic Info */}
            <TabsContent value="basic" className="space-y-4 mt-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Bayi Adı *</Label>
                  <Input
                    placeholder="Örn: İstanbul Telekom A.Ş."
                    value={formData.name}
                    onChange={(e) => handleChange('name', e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label>E-posta Adresi *</Label>
                  <Input
                    type="email"
                    placeholder="info@bayi.com"
                    value={formData.email}
                    onChange={(e) => handleChange('email', e.target.value)}
                    required
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label>Telefon *</Label>
                <Input
                  placeholder="+90 XXX XXX XX XX"
                  value={formData.phone}
                  onChange={(e) => handleChange('phone', e.target.value)}
                  required
                />
              </div>
            </TabsContent>

            {/* Billing & Tariff */}
            <TabsContent value="billing" className="space-y-4 mt-4">
              <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                <div className="flex items-center gap-2 mb-3">
                  <CreditCard className="text-blue-600" size={20} />
                  <h3 className="font-semibold text-blue-900">Tarife ve Faturalandırma</h3>
                </div>
                
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Tarife Seçimi</Label>
                      <select 
                        className="w-full border rounded-md p-2"
                        value={formData.tariff}
                        onChange={(e) => handleChange('tariff', e.target.value)}
                      >
                        <option value="">Tarife Seçin</option>
                        {tariffs.map(t => (
                          <option key={t.id} value={t.id}>
                            {t.name} (₺{t.price_per_minute}/dk)
                          </option>
                        ))}
                      </select>
                    </div>
                    <div className="space-y-2">
                      <Label>Faturalandırma Aralığı</Label>
                      <select 
                        className="w-full border rounded-md p-2"
                        value={formData.billing_increment}
                        onChange={(e) => handleChange('billing_increment', e.target.value)}
                      >
                        <option value="per_second">Saniye Bazlı</option>
                        <option value="per_minute">Dakika Bazlı</option>
                        <option value="per_6_seconds">6 Saniye Bazlı</option>
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Para Birimi</Label>
                      <select 
                        className="w-full border rounded-md p-2"
                        value={formData.currency}
                        onChange={(e) => handleChange('currency', e.target.value)}
                      >
                        <option value="TRY">TRY - Türk Lirası</option>
                        <option value="USD">USD - Amerikan Doları</option>
                        <option value="EUR">EUR - Euro</option>
                      </select>
                    </div>
                    <div className="space-y-2">
                      <Label>Numara Prefix</Label>
                      <Input
                        placeholder="+90"
                        value={formData.number_prefix}
                        onChange={(e) => handleChange('number_prefix', e.target.value)}
                      />
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      id="auto_number"
                      checked={formData.auto_number_assignment}
                      onChange={(e) => handleChange('auto_number_assignment', e.target.checked)}
                    />
                    <Label htmlFor="auto_number" className="cursor-pointer">
                      Otomatik Numara Atama
                    </Label>
                  </div>
                </div>
              </div>
            </TabsContent>

            {/* Trunk Settings */}
            <TabsContent value="trunk" className="space-y-4 mt-4">
              <div className="bg-purple-50 p-4 rounded-lg border border-purple-200">
                <div className="flex items-center gap-2 mb-3">
                  <Settings className="text-purple-600" size={20} />
                  <h3 className="font-semibold text-purple-900">SIP Trunk Konfigürasyonu</h3>
                </div>
                
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>IP Adresi</Label>
                      <Input
                        placeholder="192.168.1.1"
                        value={formData.trunk_ip}
                        onChange={(e) => handleChange('trunk_ip', e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Port</Label>
                      <Input
                        placeholder="5060"
                        value={formData.trunk_port}
                        onChange={(e) => handleChange('trunk_port', e.target.value)}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <Label>Codec</Label>
                      <select 
                        className="w-full border rounded-md p-2"
                        value={formData.trunk_codec}
                        onChange={(e) => handleChange('trunk_codec', e.target.value)}
                      >
                        <option value="G.711">G.711 (64kbps)</option>
                        <option value="G.729">G.729 (8kbps)</option>
                        <option value="Opus">Opus (6-510kbps)</option>
                        <option value="G.722">G.722 (64kbps HD)</option>
                      </select>
                    </div>
                    <div className="space-y-2">
                      <Label>Protokol</Label>
                      <select 
                        className="w-full border rounded-md p-2"
                        value={formData.trunk_protocol}
                        onChange={(e) => handleChange('trunk_protocol', e.target.value)}
                      >
                        <option value="UDP">UDP</option>
                        <option value="TCP">TCP</option>
                        <option value="TLS">TLS (Güvenli)</option>
                      </select>
                    </div>
                    <div className="space-y-2">
                      <Label>Max Eşzamanlı Çağrı</Label>
                      <Input
                        type="number"
                        placeholder="50"
                        value={formData.trunk_max_calls}
                        onChange={(e) => handleChange('trunk_max_calls', e.target.value)}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Auth Username</Label>
                      <Input
                        placeholder="trunk_username"
                        value={formData.trunk_auth_username}
                        onChange={(e) => handleChange('trunk_auth_username', e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Auth Password</Label>
                      <Input
                        type="password"
                        placeholder="••••••••"
                        value={formData.trunk_auth_password}
                        onChange={(e) => handleChange('trunk_auth_password', e.target.value)}
                      />
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      id="nat"
                      checked={formData.nat_traversal}
                      onChange={(e) => handleChange('nat_traversal', e.target.checked)}
                    />
                    <Label htmlFor="nat" className="cursor-pointer">
                      NAT Traversal (STUN/TURN)
                    </Label>
                  </div>
                </div>
              </div>
            </TabsContent>

            {/* AI Features */}
            <TabsContent value="ai" className="space-y-4 mt-4">
              <div className="bg-gradient-to-br from-purple-50 to-blue-50 p-4 rounded-lg border border-purple-200">
                <div className="flex items-center gap-2 mb-3">
                  <Brain className="text-purple-600" size={20} />
                  <h3 className="font-semibold text-purple-900">Yapay Zeka Özellikleri</h3>
                </div>
                
                <div className="space-y-3">
                  <div className="bg-white p-4 rounded-lg border border-gray-200">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <input
                          type="checkbox"
                          id="ai_noise"
                          checked={formData.ai_noise_filter}
                          onChange={(e) => handleChange('ai_noise_filter', e.target.checked)}
                          className="w-5 h-5"
                        />
                        <div>
                          <Label htmlFor="ai_noise" className="cursor-pointer font-semibold">
                            🎙️ AI Gürültü Filtreleme
                          </Label>
                          <p className="text-xs text-gray-600">Arka plan gürültüsünü otomatik temizle</p>
                        </div>
                      </div>
                      <span className="text-xs bg-green-100 text-green-800 px-3 py-1 rounded-full">
                        Önerilen
                      </span>
                    </div>
                  </div>

                  <div className="bg-white p-4 rounded-lg border border-gray-200">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <input
                          type="checkbox"
                          id="ai_spam"
                          checked={formData.ai_spam_detection}
                          onChange={(e) => handleChange('ai_spam_detection', e.target.checked)}
                          className="w-5 h-5"
                        />
                        <div>
                          <Label htmlFor="ai_spam" className="cursor-pointer font-semibold">
                            🚫 AI Spam Tespiti
                          </Label>
                          <p className="text-xs text-gray-600">Otomatik spam ve dolandırıcılık tespiti</p>
                        </div>
                      </div>
                      <span className="text-xs bg-green-100 text-green-800 px-3 py-1 rounded-full">
                        Önerilen
                      </span>
                    </div>
                  </div>

                  <div className="bg-white p-4 rounded-lg border border-gray-200">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <input
                          type="checkbox"
                          id="ai_stt"
                          checked={formData.ai_speech_to_text}
                          onChange={(e) => handleChange('ai_speech_to_text', e.target.checked)}
                          className="w-5 h-5"
                        />
                        <div>
                          <Label htmlFor="ai_stt" className="cursor-pointer font-semibold">
                            📝 Speech-to-Text (STT)
                          </Label>
                          <p className="text-xs text-gray-600">Konuşmaları otomatik metne dönüştür</p>
                        </div>
                      </div>
                      <span className="text-xs bg-blue-100 text-blue-800 px-3 py-1 rounded-full">
                        Premium
                      </span>
                    </div>
                  </div>

                  <div className="bg-white p-4 rounded-lg border border-gray-200">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <input
                          type="checkbox"
                          id="ai_sentiment"
                          checked={formData.ai_sentiment_analysis}
                          onChange={(e) => handleChange('ai_sentiment_analysis', e.target.checked)}
                          className="w-5 h-5"
                        />
                        <div>
                          <Label htmlFor="ai_sentiment" className="cursor-pointer font-semibold">
                            😊 Duygu Analizi
                          </Label>
                          <p className="text-xs text-gray-600">Müşteri memnuniyeti ve duygu durumu analizi</p>
                        </div>
                      </div>
                      <span className="text-xs bg-blue-100 text-blue-800 px-3 py-1 rounded-full">
                        Premium
                      </span>
                    </div>
                  </div>
                </div>

                <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                  <p className="text-xs text-yellow-800">
                    ⚠️ Premium AI özellikleri ek ücretlendirmeye tabidir.
                  </p>
                </div>
              </div>
            </TabsContent>

            {/* Limits & Permissions */}
            <TabsContent value="limits" className="space-y-4 mt-4">
              <div className="bg-orange-50 p-4 rounded-lg border border-orange-200">
                <div className="flex items-center gap-2 mb-3">
                  <Shield className="text-orange-600" size={20} />
                  <h3 className="font-semibold text-orange-900">Limitler ve Yetkiler</h3>
                </div>
                
                <div className="space-y-4">
                  <div>
                    <h4 className="font-semibold text-sm mb-2">Çağrı Limitleri</h4>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>Günlük Çağrı Limiti</Label>
                        <Input
                          type="number"
                          placeholder="1000"
                          value={formData.call_limit_daily}
                          onChange={(e) => handleChange('call_limit_daily', e.target.value)}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Aylık Çağrı Limiti</Label>
                        <Input
                          type="number"
                          placeholder="30000"
                          value={formData.call_limit_monthly}
                          onChange={(e) => handleChange('call_limit_monthly', e.target.value)}
                        />
                      </div>
                    </div>
                  </div>

                  <div>
                    <h4 className="font-semibold text-sm mb-2">Finansal Limitler</h4>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>Bakiye Limiti ({formData.currency})</Label>
                        <Input
                          type="number"
                          placeholder="10000"
                          value={formData.balance_limit}
                          onChange={(e) => handleChange('balance_limit', e.target.value)}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Kredi Limiti ({formData.currency})</Label>
                        <Input
                          type="number"
                          placeholder="5000"
                          value={formData.credit_limit}
                          onChange={(e) => handleChange('credit_limit', e.target.value)}
                        />
                      </div>
                    </div>
                  </div>

                  <div>
                    <h4 className="font-semibold text-sm mb-2">Yetkiler</h4>
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          id="perm_customers"
                          checked={formData.can_create_customers}
                          onChange={(e) => handleChange('can_create_customers', e.target.checked)}
                        />
                        <Label htmlFor="perm_customers" className="cursor-pointer">
                          Müşteri Oluşturabilir
                        </Label>
                      </div>
                      <div className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          id="perm_reports"
                          checked={formData.can_view_reports}
                          onChange={(e) => handleChange('can_view_reports', e.target.checked)}
                        />
                        <Label htmlFor="perm_reports" className="cursor-pointer">
                          Raporları Görüntüleyebilir
                        </Label>
                      </div>
                      <div className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          id="perm_users"
                          checked={formData.can_manage_users}
                          onChange={(e) => handleChange('can_manage_users', e.target.checked)}
                        />
                        <Label htmlFor="perm_users" className="cursor-pointer">
                          Kullanıcı Yönetimi Yapabilir
                        </Label>
                      </div>
                      <div className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          id="perm_api"
                          checked={formData.can_access_api}
                          onChange={(e) => handleChange('can_access_api', e.target.checked)}
                        />
                        <Label htmlFor="perm_api" className="cursor-pointer">
                          API Erişimi
                        </Label>
                      </div>
                      <div className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          id="perm_cdr"
                          checked={formData.can_export_cdr}
                          onChange={(e) => handleChange('can_export_cdr', e.target.checked)}
                        />
                        <Label htmlFor="perm_cdr" className="cursor-pointer">
                          CDR Dışa Aktarabilir
                        </Label>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </TabsContent>
          </Tabs>

          {/* Footer Actions */}
          <div className="flex justify-end gap-3 mt-6 pt-6 border-t">
            <Button type="button" variant="outline" onClick={onClose}>
              İptal
            </Button>
            <Button type="submit" className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 px-8">
              Bayi Oluştur
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateDealerModal;
