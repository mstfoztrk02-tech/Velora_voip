import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Crown, ArrowLeft, Shield, Users, Settings, Database, Zap, 
  Lock, AlertTriangle, Activity, FileText, Key, Webhook, Mail,
  Globe, Clock, MessageSquare, Ban, TrendingUp, Building2, Phone
} from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import authService from '../services/authService';
import { useToast } from '../hooks/use-toast';

const SuperAdminPanel = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState('overview');

  // Redirect if not super admin
  React.useEffect(() => {
    if (!authService.isSuperAdmin()) {
      toast({
        title: "Yetkisiz Erişim",
        description: "Bu sayfaya sadece SUPER_ADMIN erişebilir.",
        variant: "destructive"
      });
      navigate('/voip-crm');
    }
  }, [navigate, toast]);

  const adminModules = [
    {
      id: 'livecalls',
      title: 'Canlı Çağrılar (NOC)',
      icon: Phone,
      color: 'blue',
      description: 'Tüm bayi/bireysel/kurumsal çağrıları anlık izleme',
      features: ['Canlı çağrı listesi', 'Çağrı sonlandırma', 'SippySoft/Issabel', 'Anlık izleme']
    },
    {
      id: 'tenant',
      title: 'Müşteriler',
      icon: Users,
      color: 'cyan',
      description: 'Tenant yönetimi, paket ve bayi atama',
      features: ['Tenant listesi', 'Yeni müşteri oluştur', 'Paket ata', 'Bayi ata']
    },
    {
      id: 'dealer',
      title: 'Bayi Yönetimi',
      icon: Building2,
      color: 'purple',
      description: 'Bayi ekleme, müşteri atama',
      features: ['Bayi oluştur/sil', 'Müşteri atama', 'Aktif/Pasif', 'Bayi raporları']
    },
    {
      id: 'package',
      title: 'Paket & Onay Merkezi',
      icon: TrendingUp,
      color: 'green',
      description: 'Paket onayı, ödeme takibi',
      features: ['Paket onayları', 'Ödeme durumu', 'Aktif/Pasif/Askıda', 'Paket yönetimi']
    },
    {
      id: 'integration',
      title: 'Entegrasyonlar',
      icon: Key,
      color: 'indigo',
      description: 'API entegrasyonları',
      features: ['SippySoft', 'Issabel', 'ElevenLabs', 'Dell V100 AI']
    },
    {
      id: 'trunk',
      title: 'Trunk & Numara',
      icon: Database,
      color: 'orange',
      description: 'Trunk yönetimi, numara atama',
      features: ['Trunk yapılandırma', 'Numara havuzu', 'Test', 'Atama']
    },
    {
      id: 'spam',
      title: 'Spam / Fraud Yönetimi',
      icon: Ban,
      color: 'pink',
      description: 'Blok listesi, whitelist',
      features: ['Blocklist', 'Whitelist', 'Eşik ayarları', 'Kural yönetimi']
    },
    {
      id: 'system',
      title: 'Sistem Ayarları',
      icon: Settings,
      color: 'gray',
      description: 'SMTP, codec, acil işlemler',
      features: ['SMTP', 'Codec', 'Timezone', 'Acil İşlemler']
    },
    {
      id: 'reporting',
      title: 'Raporlama & Audit Log',
      icon: FileText,
      color: 'teal',
      description: 'Audit log, raporlar',
      features: ['Audit loglar', 'Kullanıcı aktiviteleri', 'CSV export', 'Filtrele']
    }
  ];

  const getColorClasses = (color) => {
    const colors = {
      blue: { bg: 'bg-blue-50', border: 'border-blue-200', text: 'text-blue-600', icon: 'text-blue-500' },
      green: { bg: 'bg-green-50', border: 'border-green-200', text: 'text-green-600', icon: 'text-green-500' },
      purple: { bg: 'bg-purple-50', border: 'border-purple-200', text: 'text-purple-600', icon: 'text-purple-500' },
      orange: { bg: 'bg-orange-50', border: 'border-orange-200', text: 'text-orange-600', icon: 'text-orange-500' },
      red: { bg: 'bg-red-50', border: 'border-red-200', text: 'text-red-600', icon: 'text-red-500' },
      yellow: { bg: 'bg-yellow-50', border: 'border-yellow-200', text: 'text-yellow-600', icon: 'text-yellow-500' },
      pink: { bg: 'bg-pink-50', border: 'border-pink-200', text: 'text-pink-600', icon: 'text-pink-500' },
      indigo: { bg: 'bg-indigo-50', border: 'border-indigo-200', text: 'text-indigo-600', icon: 'text-indigo-500' },
      gray: { bg: 'bg-gray-50', border: 'border-gray-200', text: 'text-gray-600', icon: 'text-gray-500' },
      teal: { bg: 'bg-teal-50', border: 'border-teal-200', text: 'text-teal-600', icon: 'text-teal-500' }
    };
    return colors[color] || colors.blue;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-pink-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-600 to-pink-600 shadow-lg">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button 
                variant="ghost" 
                onClick={() => navigate('/voip-crm')}
                className="text-white hover:bg-white/20"
              >
                <ArrowLeft className="mr-2" size={20} />
                CRM'e Dön
              </Button>
              <div className="flex items-center gap-3">
                <Crown className="text-yellow-300 animate-pulse" size={40} />
                <div>
                  <h1 className="text-3xl font-bold text-white">
                    SUPER ADMIN Panel
                  </h1>
                  <p className="text-purple-100 text-sm">Site Sahibi - Tam Yetki Yönetimi</p>
                </div>
              </div>
            </div>
            <div className="text-white text-right">
              <p className="text-sm opacity-90">Hoş geldiniz</p>
              <p className="font-semibold">{authService.getCurrentUser()?.phone || authService.getCurrentUser()?.username}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Warning Banner */}
      <div className="bg-yellow-50 border-b border-yellow-200">
        <div className="container mx-auto px-4 py-3">
          <div className="flex items-center gap-2 text-yellow-800">
            <AlertTriangle size={20} />
            <span className="text-sm font-medium">
              Bu panel tüm sistem yetkilerine sahiptir. Yapılan değişiklikler tüm kullanıcıları etkiler.
            </span>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <Card className="bg-gradient-to-br from-blue-500 to-blue-600 text-white">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-blue-100 text-sm">Toplam Tenant</p>
                  <p className="text-3xl font-bold">127</p>
                </div>
                <Users className="opacity-50" size={40} />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-green-500 to-green-600 text-white">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-green-100 text-sm">Aktif Paket</p>
                  <p className="text-3xl font-bold">89</p>
                </div>
                <Activity className="opacity-50" size={40} />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-orange-500 to-orange-600 text-white">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-orange-100 text-sm">Bekleyen Onay</p>
                  <p className="text-3xl font-bold">12</p>
                </div>
                <Clock className="opacity-50" size={40} />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-red-500 to-red-600 text-white">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-red-100 text-sm">Güvenlik Uyarısı</p>
                  <p className="text-3xl font-bold">3</p>
                </div>
                <Shield className="opacity-50" size={40} />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Admin Modules */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Settings className="text-purple-600" size={24} />
              Yönetim Modülleri
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {adminModules.map(module => {
                const Icon = module.icon;
                const colors = getColorClasses(module.color);
                
                const moduleRoutes = {
                  livecalls: '/admin/live-calls',
                  tenant: '/admin/tenants',
                  dealer: '/admin/dealers',
                  package: '/admin/approval-center',
                  integration: '/admin/integrations',
                  trunk: '/admin/trunks',
                  spam: '/admin/fraud',
                  system: '/admin/settings',
                  reporting: '/admin/reporting'
                };
                
                return (
                  <Card 
                    key={module.id} 
                    className={`${colors.bg} border-2 ${colors.border} hover:shadow-lg transition-all cursor-pointer`}
                    onClick={() => {
                      if (moduleRoutes[module.id]) {
                        navigate(moduleRoutes[module.id]);
                      } else {
                        toast({
                          title: "Yapım Aşamasında",
                          description: `${module.title} modülü yakında eklenecek.`
                        });
                      }
                    }}
                  >
                    <CardContent className="pt-6">
                      <div className="flex items-start gap-3 mb-3">
                        <div className={`${colors.bg} p-2 rounded-lg`}>
                          <Icon className={colors.icon} size={24} />
                        </div>
                        <div className="flex-1">
                          <h3 className={`font-bold ${colors.text}`}>{module.title}</h3>
                          <p className="text-xs text-gray-600 mt-1">{module.description}</p>
                        </div>
                      </div>
                      <ul className="space-y-1 mt-4">
                        {module.features.slice(0, 3).map((feature, idx) => (
                          <li key={idx} className="text-xs text-gray-700 flex items-center gap-1">
                            <span className={`w-1 h-1 rounded-full ${colors.icon} bg-current`}></span>
                            {feature}
                          </li>
                        ))}
                      </ul>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <Card className="mt-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Zap className="text-yellow-600" size={24} />
              Hızlı İşlemler
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <Button 
                onClick={() => navigate('/admin/approval-center')}
                className="bg-purple-600 hover:bg-purple-700"
              >
                <Shield className="mr-2" size={18} />
                Paket Onay Merkezi
              </Button>
              
              <Button 
                variant="outline"
                onClick={() => {
                  toast({
                    title: "Geliştirme Aşamasında",
                    description: "Bu özellik yakında eklenecek."
                  });
                }}
              >
                <Lock className="mr-2" size={18} />
                Güvenlik Ayarları
              </Button>
              
              <Button 
                variant="outline"
                onClick={() => {
                  toast({
                    title: "Geliştirme Aşamasında",
                    description: "Bu özellik yakında eklenecek."
                  });
                }}
              >
                <FileText className="mr-2" size={18} />
                Audit Loglar
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Info Box */}
        <div className="mt-6 bg-gradient-to-r from-purple-100 to-pink-100 border-2 border-purple-300 rounded-lg p-6">
          <div className="flex items-start gap-3">
            <Crown className="text-purple-600 flex-shrink-0" size={32} />
            <div>
              <h3 className="font-bold text-purple-900 mb-2">SUPER_ADMIN Yetki Kuralları</h3>
              <ul className="space-y-1 text-sm text-purple-800">
                <li>✅ Hiçbir feature gating veya paket kilidine takılmaz</li>
                <li>✅ Silver/Gold/Platin ayrımından bağımsız tüm modüllere erişir</li>
                <li>✅ Tüm müşterilere/tenant'lara sınırsız erişim</li>
                <li>✅ Sistem düzeyinde tüm ayarları yönetebilir</li>
                <li>⚠️ Bayi rolü: sadece kendi müşterilerini görebilir</li>
                <li>⚠️ Müşteri rolü: sadece kendi verisini ve paketine göre modüllere erişir</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SuperAdminPanel;
