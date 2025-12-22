import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Users, Phone, Clock, ArrowLeft, Plus, Play, Pause, Volume2, VolumeX,
  ChevronDown, ChevronRight, Settings, TrendingUp, AlertTriangle, Brain,
  PhoneOff, User, Building2, RefreshCw, FileText, Trash2, Shield, CheckCircle,
  XCircle, Zap, Crown, Sparkles, Loader2
} from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { useToast } from '../hooks/use-toast';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '../components/ui/dialog';
import CreateDealerModal from '../components/CreateDealerModal';
import VoIPLogin from '../components/VoIPLogin';
import authService, { ROLES } from '../services/authService';
import packageService, { PACKAGES } from '../services/packageService';
import integrationService from '../services/integrationService';
import crmService from '../services/crmService';
import autoDialerService from '../services/autoDialerService';

const VoIPCRMAdvanced = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  
  // Auth state
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [showPackageSelection, setShowPackageSelection] = useState(false);
  const [userPackage, setUserPackage] = useState(null);
  const [showAdminPanel, setShowAdminPanel] = useState(false);
  const [stats, setStats] = useState({
    total_dealers: 0,
    total_customers: 0,
    total_users: 0,
    active_calls: 0,
    total_call_duration_minutes: 0,
    total_calls: 0
  });
  const [dealers, setDealers] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [users, setUsers] = useState([]);
  const [callRecords, setCallRecords] = useState([]);
  const [activeCalls, setActiveCalls] = useState([]);
  const [tariffs, setTariffs] = useState([]);
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [selectedCallRecord, setSelectedCallRecord] = useState(null);
  const [expandedDealers, setExpandedDealers] = useState(new Set());
  const [expandedCustomers, setExpandedCustomers] = useState(new Set());
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [showCreateDealer, setShowCreateDealer] = useState(false);
  const [showCreateCustomer, setShowCreateCustomer] = useState(false);
  const [showCreateUser, setShowCreateUser] = useState(false);
  const [selectedDealerForCustomer, setSelectedDealerForCustomer] = useState(null);
  const [selectedCustomerForUser, setSelectedCustomerForUser] = useState(null);
  const [aiCallLoading, setAiCallLoading] = useState(false);
  const [showAIModal, setShowAIModal] = useState(false);
  const [phoneNumber, setPhoneNumber] = useState('');

  // Auto Dialer States
  const [autoDialerNumbers, setAutoDialerNumbers] = useState([]);
  const [autoDialerStatus, setAutoDialerStatus] = useState(null);
  const [selectedCallCount, setSelectedCallCount] = useState(1);
  const [showAddNumberModal, setShowAddNumberModal] = useState(false);
  const [newPhoneNumber, setNewPhoneNumber] = useState('');
  const [isAutoDialerRunning, setIsAutoDialerRunning] = useState(false);

  const ALLOWED_NUMBER = '5338864656'; // İzin verilen numara (sadece rakamlar)

  useEffect(() => {
    // Check authentication
    const user = authService.getCurrentUser();
    if (user) {
      setIsAuthenticated(true);
      setCurrentUser(user);
      
      // Check package
      const pkg = packageService.getUserPackage(user.phone || user.username);
      setUserPackage(pkg);
      
      if (!pkg) {
        setShowPackageSelection(true);
      } else {
        loadData();
        const interval = setInterval(() => {
          loadActiveCalls();
          loadLiveCalls();
        }, 3000);
        return () => clearInterval(interval);
      }
    }
  }, [isAuthenticated]);
  
  const loadLiveCalls = async () => {
    try {
      const calls = await integrationService.getSippyActiveCalls();
      setActiveCalls(calls);
    } catch (error) {
      console.error('Error loading live calls:', error);
    }
  };

  const loadData = async () => {
    try {
      const data = await crmService.loadAllData();
      
      setStats(data.stats);
      setDealers(data.dealers);
      setCustomers(data.customers);
      setUsers(data.users);
      setCallRecords(data.callRecords);
      setActiveCalls(data.activeCalls);
      setTariffs(data.tariffs);
    } catch (error) {
      console.error('Error loading data:', error);
      toast({
        title: "Hata",
        description: error.message || "Veriler yüklenirken bir hata oluştu.",
        variant: "destructive"
      });
    }
  };

  const loadActiveCalls = async () => {
    try {
      const calls = await crmService.getActiveCalls();
      setActiveCalls(calls);
    } catch (error) {
      console.error('Error loading active calls:', error);
    }
  };

  const toggleDealer = (dealerId) => {
    const newExpanded = new Set(expandedDealers);
    if (newExpanded.has(dealerId)) {
      newExpanded.delete(dealerId);
    } else {
      newExpanded.add(dealerId);
    }
    setExpandedDealers(newExpanded);
  };

  const toggleCustomer = (customerId) => {
    const newExpanded = new Set(expandedCustomers);
    if (newExpanded.has(customerId)) {
      newExpanded.delete(customerId);
    } else {
      newExpanded.add(customerId);
    }
    setExpandedCustomers(newExpanded);
  };

  const getCustomersByDealer = (dealerId) => {
    return customers.filter(c => c.dealer_id === dealerId);
  };

  const getUsersByCustomer = (customerId) => {
    return users.filter(u => u.customer_id === customerId);
  };

  const terminateCall = async (callId) => {
    try {
      await crmService.terminateCall(callId);
      toast({
        title: "Başarılı",
        description: "Çağrı sonlandırıldı."
      });
      loadActiveCalls();
    } catch (error) {
      toast({
        title: "Hata",
        description: error.message || "Çağrı sonlandırılırken bir hata oluştu.",
        variant: "destructive"
      });
    }
  };

  const formatDuration = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };
  
  const handleLoginSuccess = (user) => {
    setCurrentUser(user);
    setIsAuthenticated(true);
  };
  
  const handleLogout = () => {
    authService.logout();
    setIsAuthenticated(false);
    setCurrentUser(null);
    setUserPackage(null);
    navigate('/');
  };
  
  const handlePackageSelect = async (packageId) => {
    try {
      const result = await packageService.selectPackage(
        currentUser.phone || currentUser.username,
        packageId
      );
      setUserPackage(result);
      setShowPackageSelection(false);
      
      toast({
        title: "Paket Seçildi",
        description: "Paketiniz onay için bekliyor. Admin onayından sonra aktif olacak."
      });
    } catch (error) {
      toast({
        title: "Hata",
        description: error.message,
        variant: "destructive"
      });
    }
  };
  
  const handleDemoAdminActivation = async () => {
    try {
      const result = await packageService.demoActivateAllPackages(
        currentUser.phone || currentUser.username
      );
      setUserPackage(result);

      toast({
        title: "✅ Demo Onayı Aktif",
        description: "Tüm paket özellikleri demo için aktif edildi!"
      });

      loadData();
    } catch (error) {
      toast({
        title: "Hata",
        description: error.message,
        variant: "destructive"
      });
    }
  };

  // Auto Dialer Functions
  const loadAutoDialerStatus = async () => {
    try {
      const customerId = currentUser?.phone || 'demo-customer';
      const data = await autoDialerService.getStatus(customerId);
      setAutoDialerStatus(data);
      const numbers = await autoDialerService.getNumbers(customerId);
      setAutoDialerNumbers(numbers);
      if (data.session && data.session.status === 'running') {
        setIsAutoDialerRunning(true);
      } else {
        setIsAutoDialerRunning(false);
      }
    } catch (error) {
      console.error('Error loading auto dialer status:', error);
    }
  };

  const loadAutoDialerNumbers = async () => {
    try {
      const customerId = currentUser?.phone || 'demo-customer';
      const data = await autoDialerService.getNumbers(customerId);
      return data;
    } catch (error) {
      console.error('Error loading auto dialer numbers:', error);
      return [];
    }
  };

  const handleAddNumber = async () => {
    if (!newPhoneNumber.trim()) {
      toast({
        title: "Hata",
        description: "Lütfen geçerli bir numara girin.",
        variant: "destructive"
      });
      return;
    }

    try {
      const customerId = currentUser?.phone || 'demo-customer';
      await autoDialerService.addNumber(customerId, newPhoneNumber.trim());

      toast({
        title: "Başarılı",
        description: "Numara başarıyla eklendi."
      });
      setNewPhoneNumber('');
      setShowAddNumberModal(false);
      await loadAutoDialerStatus();
    } catch (error) {
      toast({
        title: "Hata",
        description: error.message || "Numara eklenirken bir hata oluştu.",
        variant: "destructive"
      });
    }
  };

  const handleExcelUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    // Excel dosyasını okumak için FileReader kullanıyoruz
    const reader = new FileReader();
    reader.onload = async (e) => {
      try {
        const text = e.target.result;
        // CSV formatında okuyoruz (Excel'i CSV olarak kaydetmeli veya xlsx kütüphanesi kullanmalı)
        const lines = text.split('\n');
        const phoneNumbers = lines
          .map(line => line.trim())
          .filter(line => line && /^\+?\d+$/.test(line)); // Sadece numara içeren satırlar

        if (phoneNumbers.length === 0) {
          toast({
            title: "Hata",
            description: "Excel dosyasında geçerli numara bulunamadı.",
            variant: "destructive"
          });
          return;
        }

        const customerId = currentUser?.phone || 'demo-customer';
        const data = await autoDialerService.addNumbersBulk(customerId, phoneNumbers);

        toast({
          title: "Başarılı",
          description: data.message || `${phoneNumbers.length} numara başarıyla eklendi.`
        });
        await loadAutoDialerStatus();
      } catch (error) {
        toast({
          title: "Hata",
          description: error.message || "Excel dosyası işlenirken bir hata oluştu.",
          variant: "destructive"
        });
      }
    };
    reader.readAsText(file);
  };

  const handleStartAutoDialer = async () => {
    if (autoDialerStatus?.total_numbers === 0) {
      toast({
        title: "Hata",
        description: "Önce numara eklemelisiniz.",
        variant: "destructive"
      });
      return;
    }

    try {
      const customerId = currentUser?.phone || 'demo-customer';
      const data = await autoDialerService.start(customerId, selectedCallCount);

      toast({
        title: "Başarılı",
        description: data.message || "Otomatik arama başlatıldı."
      });
      setIsAutoDialerRunning(true);

      // ElevenLabs ile aramaları başlat
      await startCallingWithElevenLabs();
      await loadAutoDialerStatus();
    } catch (error) {
      toast({
        title: "Hata",
        description: error.message || "Otomatik arama başlatılırken bir hata oluştu.",
        variant: "destructive"
      });
    }
  };

  const handleStopAutoDialer = async () => {
    try {
      const customerId = currentUser?.phone || 'demo-customer';
      await autoDialerService.stop(customerId);

      toast({
        title: "Başarılı",
        description: "Otomatik arama durduruldu."
      });
      setIsAutoDialerRunning(false);
      await loadAutoDialerStatus();
    } catch (error) {
      toast({
        title: "Hata",
        description: error.message || "Otomatik arama durdurulurken bir hata oluştu.",
        variant: "destructive"
      });
    }
  };

  const startCallingWithElevenLabs = async () => {
    try {
      const customerId = currentUser?.phone || 'demo-customer';
      const numbers = await loadAutoDialerNumbers();
      const pendingNumbers = numbers.filter(n => n.status === 'pending');

      // Seçilen arama sayısı kadar numara al
      const numbersToCall = pendingNumbers.slice(0, selectedCallCount);

      for (const number of numbersToCall) {
        try {
          // ElevenLabs API'sine arama isteği gönder
          await autoDialerService.callWithElevenLabs(
            'agent_4101kd09w180fd9s1m3vh1evhwnr',
            'phnum_7501kd0f6gnce1ps75fwthtkmvyh',
            number.phone_number
          );

          // Numara durumunu güncelle
          await autoDialerService.updateNumber(number.id, 'calling');
        } catch (error) {
          console.error(`Error calling ${number.phone_number}:`, error);
        }
      }
    } catch (error) {
      console.error('Error starting calls with ElevenLabs:', error);
    }
  };

  useEffect(() => {
    if (isAuthenticated && userPackage) {
      loadAutoDialerStatus();
      const interval = setInterval(loadAutoDialerStatus, 5000);
      return () => clearInterval(interval);
    }
  }, [isAuthenticated, userPackage]);

  const handleAICall = () => {
    setShowAIModal(true);
    setPhoneNumber('');
  };

  const handleStartCall = async () => {
    // Telefon numarasını temizle (sadece rakamlar)
    const cleanNumber = phoneNumber.replace(/\s+/g, '').replace(/\D/g, '');


    setAiCallLoading(true);

    // İzin verilen numara girildiğinde asıl aranacak numara
    const targetNumber =  cleanNumber;

    try {
      const response = await fetch('api/elevenlabs/outbound-call', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          agentId: 'agent_4101kd09w180fd9s1m3vh1evhwnr',
          agentPhoneNumberId: 'phnum_7501kd0f6gnce1ps75fwthtkmvyh',
          toNumber: `+90${targetNumber}`
        })
      });

      const data = await response.json();

      if (response.ok && data.success) {
        toast({
          title: "✅ AI Arama Başlatıldı",
          description: `Aranan Numara: +90 ${targetNumber}\nConversation ID: ${data.data.conversationId || 'N/A'}`,
          duration: 5000
        });
        setShowAIModal(false);
        setPhoneNumber('');
      } else {
        toast({
          title: "❌ Arama Başlatılamadı",
          description: data.error || data.message || 'Bilinmeyen bir hata oluştu',
          variant: "destructive",
          duration: 5000
        });
      }
    } catch (error) {
      console.error('AI call error:', error);
      toast({
        title: "❌ Bağlantı Hatası",
        description: 'API ile bağlantı kurulamadı. Lütfen konsolu kontrol edin.',
        variant: "destructive",
        duration: 5000
      });
    } finally {
      setAiCallLoading(false);
    }
  };

  const hasPermission = (permission) => {
    // SUPER_ADMIN bypass - hiçbir kısıtlamaya takılmaz
    if (authService.isSuperAdmin()) return true;
    
    if (!currentUser || !userPackage) return false;
    return packageService.hasPermission(
      currentUser.phone || currentUser.username,
      permission
    );
  };
  
  const FeatureGate = ({ permission, children, fallback }) => {
    if (hasPermission(permission)) {
      return children;
    }
    return fallback || (
      <div className="text-center p-8 bg-gray-50 rounded-lg border-2 border-dashed">
        <Shield className="mx-auto mb-3 text-gray-400" size={48} />
        <p className="text-gray-600 font-medium">Bu özellik için yetkiniz yok</p>
        <p className="text-sm text-gray-500 mt-1">Paket yükseltme veya admin onayı gerekli</p>
      </div>
    );
  };

  // Login screen
  if (!isAuthenticated) {
    return <VoIPLogin onLoginSuccess={handleLoginSuccess} />;
  }
  
  // Package selection screen
  if (showPackageSelection) {
    return (
      <div className="min-h-screen bg-gray-50 p-8">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold mb-4">Paket Seçimi</h1>
            <p className="text-gray-600">Size uygun paketi seçin ve hemen başlayın</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {Object.values(PACKAGES).map(pkg => (
              <Card key={pkg.id} className={`relative hover:shadow-2xl transition-all ${pkg.id === 'platin' ? 'ring-2 ring-purple-500' : ''}`}>
                {pkg.id === 'platin' && (
                  <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                    <span className="bg-gradient-to-r from-purple-500 to-pink-500 text-white px-4 py-1 rounded-full text-sm font-bold flex items-center gap-1">
                      <Crown size={14} />
                      VIP
                    </span>
                  </div>
                )}
                <CardHeader className="text-center">
                  <CardTitle className={`text-3xl text-${pkg.color}-600`}>{pkg.name}</CardTitle>
                  <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                    <p className="text-sm text-gray-600 italic">{pkg.price}</p>
                  </div>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2 mb-6">
                    {pkg.features.map((feature, idx) => (
                      <li key={idx} className="flex items-start gap-2 text-sm">
                        <CheckCircle className="text-green-500 flex-shrink-0 mt-0.5" size={16} />
                        <span>{feature}</span>
                      </li>
                    ))}
                  </ul>
                  <Button
                    onClick={() => handlePackageSelect(pkg.id)}
                    className={`w-full ${pkg.id === 'platin' ? 'bg-gradient-to-r from-purple-500 to-pink-500' : ''}`}
                  >
                    {pkg.name} Seç
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
          
          <div className="mt-8 text-center">
            <p className="text-sm text-gray-500">
              Paket seçimi sonrası admin onayı gereklidir. Onay sonrası paketiniz aktif olacaktır.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button variant="ghost" onClick={() => navigate('/')}>
                <ArrowLeft className="mr-2" size={20} />
                Ana Sayfa
              </Button>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-blue-800 bg-clip-text text-transparent">
                Velora AI VoIP CRM
              </h1>
              {currentUser?.demo && (
                <span className="bg-yellow-100 text-yellow-800 px-3 py-1 rounded-full text-xs font-semibold">
                  DEMO
                </span>
              )}
            </div>
            <div className="flex gap-2 items-center">
              {/* Package Status */}
              {userPackage && (
                <div className={`px-4 py-2 rounded-lg text-sm font-medium ${
                  userPackage.status === 'Aktif' ? 'bg-green-100 text-green-800' :
                  userPackage.status === 'Beklemede' ? 'bg-yellow-100 text-yellow-800' :
                  'bg-gray-100 text-gray-800'
                }`}>
                  {PACKAGES[userPackage.packageId]?.name} - {userPackage.status}
                </div>
              )}
              
              {/* Demo Admin Activation Button - Only show in demo mode if package is not yet approved */}
              {currentUser?.demo && userPackage && !userPackage.isDemoOverride && !authService.isSuperAdmin() && (
                <Button 
                  onClick={handleDemoAdminActivation}
                  className="bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white font-semibold"
                >
                  <CheckCircle className="mr-2" size={18} />
                  Demo İçin Tüm Paketleri Aktif Et
                </Button>
              )}
              
              <FeatureGate permission="dealer_management">
                <Button onClick={() => setShowCreateDealer(true)} className="bg-blue-600 hover:bg-blue-700">
                  <Plus className="mr-2" size={18} />
                  Bayi Oluştur
                </Button>
              </FeatureGate>
              
              <Button onClick={loadData} variant="outline">
                <RefreshCw className="mr-2" size={18} />
                Yenile
              </Button>
              
              <Button onClick={handleLogout} variant="outline">
                Çıkış
              </Button>
            </div>
          </div>
        </div>
      </div>
      
      {/* Package Warning - Only show if not demo override and not SUPER_ADMIN */}
      {!authService.isSuperAdmin() && userPackage && !userPackage.approvedByAdmin && !userPackage.isDemoOverride && (
        <div className="bg-yellow-50 border-b border-yellow-200">
          <div className="container mx-auto px-4 py-3">
            <div className="flex items-center gap-2 text-yellow-800">
              <AlertTriangle size={20} />
              <span className="font-medium">
                Paketiniz admin onayı bekliyor. Bazı özellikler kısıtlı olabilir.
              </span>
            </div>
          </div>
        </div>
      )}
      
      <div className="container mx-auto px-4 py-6">
        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-6 gap-4 mb-6">
          <Card className="hover:shadow-lg transition-shadow">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Toplam Bayi</p>
                  <p className="text-3xl font-bold text-gray-900">{stats.total_dealers}</p>
                </div>
                <div className="bg-blue-100 p-3 rounded-full">
                  <Building2 className="text-blue-600" size={24} />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Toplam Müşteri</p>
                  <p className="text-3xl font-bold text-gray-900">{stats.total_customers}</p>
                </div>
                <div className="bg-green-100 p-3 rounded-full">
                  <Users className="text-green-600" size={24} />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Toplam Kullanıcı</p>
                  <p className="text-3xl font-bold text-gray-900">{stats.total_users}</p>
                </div>
                <div className="bg-purple-100 p-3 rounded-full">
                  <User className="text-purple-600" size={24} />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Aktif Çağrı</p>
                  <p className="text-3xl font-bold text-green-600">{stats.active_calls}</p>
                </div>
                <div className="bg-green-100 p-3 rounded-full animate-pulse">
                  <Phone className="text-green-600" size={24} />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Toplam Süre</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {Math.round(stats.total_call_duration_minutes)}m
                  </p>
                </div>
                <div className="bg-orange-100 p-3 rounded-full">
                  <Clock className="text-orange-600" size={24} />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Toplam Çağrı</p>
                  <p className="text-3xl font-bold text-gray-900">{stats.total_calls}</p>
                </div>
                <div className="bg-indigo-100 p-3 rounded-full">
                  <TrendingUp className="text-indigo-600" size={24} />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Auto Dialer Module */}
        <Card className="mb-6 border-purple-500 border-2">
          <CardHeader className="bg-gradient-to-r from-purple-50 to-pink-50">
            <CardTitle className="flex items-center text-purple-700">
              <Phone className="mr-2" size={20} />
              Otomatik Arama Modülü
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Left Side - Controls */}
              <div className="space-y-4">
                <div>
                  <Label className="text-sm font-semibold mb-2 block">Arama Adedi</Label>
                  <select
                    value={selectedCallCount}
                    onChange={(e) => setSelectedCallCount(Number(e.target.value))}
                    className="w-full p-2 border rounded-md focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    disabled={isAutoDialerRunning}
                  >
                    <option value={1}>1 Arama</option>
                    <option value={2}>2 Arama</option>
                    <option value={3}>3 Arama</option>
                    <option value={5}>5 Arama</option>
                    <option value={10}>10 Arama</option>
                    <option value={20}>20 Arama</option>
                    <option value={50}>50 Arama</option>
                    <option value={100}>100 Arama</option>
                    <option value={200}>200 Arama</option>
                    <option value={500}>500 Arama</option>
                    <option value={1000}>1000 Arama</option>
                  </select>
                </div>

                <div className="flex gap-2">
                  <Button
                    onClick={handleStartAutoDialer}
                    disabled={isAutoDialerRunning || autoDialerStatus?.total_numbers === 0}
                    className="flex-1 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white"
                  >
                    <Play className="mr-2" size={16} />
                    Otomatik Arama Başlat
                  </Button>
                  <Button
                    onClick={handleStopAutoDialer}
                    disabled={!isAutoDialerRunning}
                    variant="destructive"
                    className="flex-1"
                  >
                    <Pause className="mr-2" size={16} />
                    Aramayı Durdur
                  </Button>
                </div>

                <div className="flex gap-2">
                  <Button
                    onClick={() => setShowAddNumberModal(true)}
                    variant="outline"
                    className="flex-1"
                  >
                    <Plus className="mr-2" size={16} />
                    Numara Ekle
                  </Button>
                  <Button
                    onClick={() => document.getElementById('excel-upload').click()}
                    variant="outline"
                    className="flex-1"
                  >
                    <FileText className="mr-2" size={16} />
                    Excel İle Toplu Numara Ekle
                  </Button>
                  <input
                    id="excel-upload"
                    type="file"
                    accept=".csv,.txt"
                    onChange={handleExcelUpload}
                    className="hidden"
                  />
                </div>

                {autoDialerStatus?.total_numbers === 0 && (
                  <div className="bg-yellow-50 border border-yellow-200 rounded-md p-3">
                    <p className="text-sm text-yellow-800 flex items-center">
                      <AlertTriangle className="mr-2" size={16} />
                      Otomatik arama başlatmak için önce numara eklemelisiniz.
                    </p>
                  </div>
                )}
              </div>

              {/* Right Side - Statistics */}
              <div className="space-y-3">
                <div className="bg-blue-50 p-4 rounded-lg">
                  <div className="text-sm text-gray-600">Toplam Numara</div>
                  <div className="text-3xl font-bold text-blue-600">
                    {autoDialerStatus?.total_numbers || 0}
                  </div>
                </div>
                <div className="bg-yellow-50 p-4 rounded-lg">
                  <div className="text-sm text-gray-600">Bekleyen</div>
                  <div className="text-3xl font-bold text-yellow-600">
                    {autoDialerStatus?.pending_calls || 0}
                  </div>
                </div>
                <div className="bg-green-50 p-4 rounded-lg">
                  <div className="text-sm text-gray-600">Tamamlanan</div>
                  <div className="text-3xl font-bold text-green-600">
                    {autoDialerStatus?.completed_calls || 0}
                  </div>
                </div>
                <div className="bg-red-50 p-4 rounded-lg">
                  <div className="text-sm text-gray-600">Başarısız</div>
                  <div className="text-3xl font-bold text-red-600">
                    {autoDialerStatus?.failed_calls || 0}
                  </div>
                </div>
                {isAutoDialerRunning && (
                  <div className="bg-purple-50 border border-purple-200 rounded-md p-3">
                    <p className="text-sm text-purple-800 flex items-center">
                      <div className="w-2 h-2 bg-purple-500 rounded-full animate-pulse mr-2"></div>
                      Otomatik arama devam ediyor...
                    </p>
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Real-time Live Calls Dashboard (Default View) */}
        <Card className="mb-6 border-green-500 border-2">
          <CardHeader className="bg-gradient-to-r from-green-50 to-blue-50">
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center text-green-700">
                <Zap className="mr-2 animate-pulse" size={20} />
                Gerçek Zamanlı Çağrı Görünümü (LIVE)
              </CardTitle>
              <div className="flex items-center gap-3">
                <Button
                  onClick={handleAICall}
                  disabled={aiCallLoading}
                  className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white"
                  size="sm"
                >
                  {aiCallLoading ? (
                    <Loader2 className="mr-2 animate-spin" size={16} />
                  ) : (
                    <Sparkles className="mr-2" size={16} />
                  )}
                  A.I. İle Arama Başlat
                </Button>
                <div className="flex items-center gap-2 text-xs text-gray-600">
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                  <span>Canlı Yayın</span>
                </div>
              </div>
            </div>
          </CardHeader>
          <CardContent className="pt-4">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
              <div className="bg-blue-50 p-4 rounded-lg">
                <div className="text-sm text-gray-600">Aktif Çağrı</div>
                <div className="text-3xl font-bold text-blue-600">{activeCalls.length}</div>
              </div>
              <div className="bg-green-50 p-4 rounded-lg">
                <div className="text-sm text-gray-600">Konuşuyor</div>
                <div className="text-3xl font-bold text-green-600">
                  {activeCalls.filter(c => c.status === 'active').length}
                </div>
              </div>
              <div className="bg-yellow-50 p-4 rounded-lg">
                <div className="text-sm text-gray-600">Çalıyor</div>
                <div className="text-3xl font-bold text-yellow-600">
                  {activeCalls.filter(c => c.status === 'ringing').length}
                </div>
              </div>
              <div className="bg-purple-50 p-4 rounded-lg">
                <div className="text-sm text-gray-600">Ses Kaydı</div>
                <div className="text-3xl font-bold text-purple-600">Aktif</div>
              </div>
            </div>
            
            {activeCalls.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="text-left py-2 px-3 font-semibold text-gray-700">Kim Arıyor</th>
                      <th className="text-left py-2 px-3 font-semibold text-gray-700">Kimi Arıyor</th>
                      <th className="text-left py-2 px-3 font-semibold text-gray-700">Durum</th>
                      <th className="text-right py-2 px-3 font-semibold text-gray-700">Süre</th>
                      <th className="text-left py-2 px-3 font-semibold text-gray-700">Tarih-Saat</th>
                      <th className="text-center py-2 px-3 font-semibold text-gray-700">Ses Kaydı</th>
                      <th className="text-center py-2 px-3 font-semibold text-gray-700">İşlem</th>
                    </tr>
                  </thead>
                  <tbody>
                    {activeCalls.map(call => (
                      <tr key={call.id} className="border-t hover:bg-gray-50">
                        <td className="py-2 px-3 font-medium">{call.caller}</td>
                        <td className="py-2 px-3">{call.callee}</td>
                        <td className="py-2 px-3">
                          <span className={`px-2 py-1 rounded text-xs font-semibold ${
                            call.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                          }`}>
                            {call.status === 'active' ? 'Konuşuyor' : 'Çalıyor'}
                          </span>
                        </td>
                        <td className="text-right py-2 px-3 font-mono text-green-600 font-bold">
                          {formatDuration(call.duration)}
                        </td>
                        <td className="py-2 px-3 text-xs">{new Date(call.timestamp).toLocaleTimeString('tr-TR')}</td>
                        <td className="text-center py-2 px-3">
                          <span className="text-xs bg-red-100 text-red-800 px-2 py-1 rounded flex items-center justify-center gap-1">
                            <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
                            Kaydediliyor
                          </span>
                        </td>
                        <td className="text-center py-2 px-3">
                          <FeatureGate permission="view_live_calls">
                            <Button
                              size="sm"
                              variant="destructive"
                              onClick={() => terminateCall(call.id)}
                            >
                              <PhoneOff size={14} />
                            </Button>
                          </FeatureGate>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                <Phone className="mx-auto mb-2" size={48} />
                <p>Şu anda aktif çağrı yok</p>
                <p className="text-xs mt-1">Yeni çağrılar otomatik olarak burada görünecek</p>
              </div>
            )}
          </CardContent>
        </Card>
        
        {/* Active Calls Panel (Old - keeping for compatibility) */}
        {false && activeCalls.length > 0 && (
          <Card className="mb-6 border-green-500 border-2">
            <CardHeader className="bg-green-50">
              <CardTitle className="flex items-center text-green-700">
                <Phone className="mr-2 animate-pulse" size={20} />
                Aktif Çağrılar ({activeCalls.length})
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-4">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="text-left py-2 px-3 font-semibold text-gray-700">Arayan</th>
                      <th className="text-left py-2 px-3 font-semibold text-gray-700">Aranan</th>
                      <th className="text-left py-2 px-3 font-semibold text-gray-700">Trunk</th>
                      <th className="text-left py-2 px-3 font-semibold text-gray-700">Codec</th>
                      <th className="text-left py-2 px-3 font-semibold text-gray-700">Ülke/Şehir</th>
                      <th className="text-right py-2 px-3 font-semibold text-gray-700">Süre</th>
                      <th className="text-center py-2 px-3 font-semibold text-gray-700">İşlem</th>
                    </tr>
                  </thead>
                  <tbody>
                    {activeCalls.map(call => (
                      <tr key={call.id} className="border-t hover:bg-gray-50">
                        <td className="py-2 px-3 font-medium">{call.caller}</td>
                        <td className="py-2 px-3">{call.callee}</td>
                        <td className="py-2 px-3">{call.trunk}</td>
                        <td className="py-2 px-3">
                          <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-xs">
                            {call.codec}
                          </span>
                        </td>
                        <td className="py-2 px-3">{call.country} / {call.city}</td>
                        <td className="text-right py-2 px-3 font-mono text-green-600">
                          {formatDuration(call.duration)}
                        </td>
                        <td className="text-center py-2 px-3">
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => terminateCall(call.id)}
                          >
                            <PhoneOff size={14} />
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Main Content - Hierarchical Table */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left: Dealers, Customers & Users Table */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>Bayi, Müşteri ve Kullanıcı Hiyerarşisi</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="text-left py-3 px-4 font-semibold text-gray-700">Ad / Kullanıcı</th>
                        <th className="text-left py-3 px-4 font-semibold text-gray-700">Tarife</th>
                        <th className="text-left py-3 px-4 font-semibold text-gray-700">Numara</th>
                        <th className="text-left py-3 px-4 font-semibold text-gray-700">Para Birimi</th>
                        <th className="text-right py-3 px-4 font-semibold text-gray-700">Dakika</th>
                        <th className="text-right py-3 px-4 font-semibold text-gray-700">Çağrı</th>
                        <th className="text-center py-3 px-4 font-semibold text-gray-700">İşlem</th>
                      </tr>
                    </thead>
                    <tbody>
                      {dealers.map(dealer => (
                        <React.Fragment key={dealer.id}>
                          {/* Dealer Row */}
                          <tr className="border-t bg-blue-50 hover:bg-blue-100 cursor-pointer" onClick={() => toggleDealer(dealer.id)}>
                            <td className="py-3 px-4 font-bold text-blue-700 flex items-center">
                              {expandedDealers.has(dealer.id) ? <ChevronDown size={18} /> : <ChevronRight size={18} />}
                              <Building2 className="ml-2 mr-2" size={16} />
                              <span>{dealer.name}</span>
                            </td>
                            <td className="py-3 px-4">-</td>
                            <td className="py-3 px-4">{dealer.phone}</td>
                            <td className="py-3 px-4">TRY</td>
                            <td className="text-right py-3 px-4">{Math.round(dealer.total_minutes)}</td>
                            <td className="text-right py-3 px-4">{dealer.total_calls}</td>
                            <td className="text-center py-3 px-4">
                              <Button 
                                size="sm" 
                                variant="outline"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setSelectedDealerForCustomer(dealer.id);
                                  setShowCreateCustomer(true);
                                }}
                              >
                                <Plus size={14} className="mr-1" />
                                Müşteri
                              </Button>
                            </td>
                          </tr>
                          
                          {/* Customers under Dealer */}
                          {expandedDealers.has(dealer.id) && getCustomersByDealer(dealer.id).map(customer => (
                            <React.Fragment key={customer.id}>
                              <tr 
                                className="border-t bg-green-50 hover:bg-green-100 cursor-pointer"
                                onClick={() => {
                                  toggleCustomer(customer.id);
                                  setSelectedCustomer(customer);
                                }}
                              >
                                <td className="py-3 px-4 pl-12 text-green-700 font-semibold flex items-center">
                                  {expandedCustomers.has(customer.id) ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
                                  <Users className="ml-2 mr-2" size={14} />
                                  <span>{customer.name}</span>
                                </td>
                                <td className="py-3 px-4">{customer.tariff}</td>
                                <td className="py-3 px-4">{customer.number || '-'}</td>
                                <td className="py-3 px-4">
                                  <span className="bg-gray-100 px-2 py-1 rounded text-xs font-medium">
                                    {customer.currency}
                                  </span>
                                </td>
                                <td className="text-right py-3 px-4">{Math.round(customer.total_minutes)}</td>
                                <td className="text-right py-3 px-4">{customer.total_calls}</td>
                                <td className="text-center py-3 px-4">
                                  <Button 
                                    size="sm" 
                                    variant="outline"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      setSelectedCustomerForUser(customer.id);
                                      setShowCreateUser(true);
                                    }}
                                  >
                                    <Plus size={14} className="mr-1" />
                                    Kullanıcı
                                  </Button>
                                </td>
                              </tr>
                              
                              {/* Users under Customer */}
                              {expandedCustomers.has(customer.id) && getUsersByCustomer(customer.id).map(user => (
                                <tr 
                                  key={user.id} 
                                  className="border-t hover:bg-purple-50"
                                >
                                  <td className="py-2 px-4 pl-24 text-gray-700 flex items-center">
                                    <User className="mr-2" size={12} />
                                    <span className="text-sm">{user.username}</span>
                                    <span className="ml-2 text-xs text-gray-500">(ext: {user.extension})</span>
                                  </td>
                                  <td className="py-2 px-4">-</td>
                                  <td className="py-2 px-4">-</td>
                                  <td className="py-2 px-4">-</td>
                                  <td className="text-right py-2 px-4 text-sm">{Math.round(user.total_minutes)}</td>
                                  <td className="text-right py-2 px-4 text-sm">{user.total_calls}</td>
                                  <td className="text-center py-2 px-4">
                                    <span className="text-xs text-gray-500">{user.status}</span>
                                  </td>
                                </tr>
                              ))}
                            </React.Fragment>
                          ))}
                        </React.Fragment>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right: Customer Details & Trunk Settings */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Settings className="mr-2" size={20} />
                  Müşteri Detayları & Trunk Ayarları
                </CardTitle>
              </CardHeader>
              <CardContent>
                {selectedCustomer ? (
                  <div className="space-y-4">
                    <div>
                      <Label>Müşteri Adı</Label>
                      <Input value={selectedCustomer.name} readOnly className="bg-gray-50" />
                    </div>
                    <div>
                      <Label>Tarife Seçimi</Label>
                      <select className="w-full border rounded-md p-2" defaultValue={selectedCustomer.tariff}>
                        {tariffs.map(t => (
                          <option key={t.id} value={t.name}>{t.name}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <Label>Numara Atama</Label>
                      <Input placeholder="+90 XXX XXX XX XX" defaultValue={selectedCustomer.number} />
                    </div>
                    <div>
                      <Label>Para Birimi</Label>
                      <select className="w-full border rounded-md p-2" defaultValue={selectedCustomer.currency}>
                        <option value="TRY">TRY - Türk Lirası</option>
                        <option value="USD">USD - Dolar</option>
                        <option value="EUR">EUR - Euro</option>
                      </select>
                    </div>
                    
                    <div className="border-t pt-4 mt-4">
                      <h4 className="font-semibold mb-3 text-sm text-gray-700 flex items-center">
                        <Settings className="mr-2" size={16} />
                        Sippy Soft Trunk Ayarları
                      </h4>
                      <div className="space-y-3">
                        <div className="grid grid-cols-2 gap-2">
                          <div>
                            <Label className="text-xs">IP Adresi</Label>
                            <Input placeholder="192.168.1.1" className="text-sm" defaultValue="192.168.1.10" />
                          </div>
                          <div>
                            <Label className="text-xs">Port</Label>
                            <Input placeholder="5060" className="text-sm" defaultValue="5060" />
                          </div>
                        </div>
                        <div className="grid grid-cols-2 gap-2">
                          <div>
                            <Label className="text-xs">Codec</Label>
                            <select className="w-full border rounded-md p-1.5 text-sm">
                              <option>G.711</option>
                              <option>G.729</option>
                              <option>Opus</option>
                            </select>
                          </div>
                          <div>
                            <Label className="text-xs">Max Calls</Label>
                            <Input placeholder="10" className="text-sm" defaultValue="10" />
                          </div>
                        </div>
                        <div>
                          <Label className="text-xs">Protokol</Label>
                          <select className="w-full border rounded-md p-1.5 text-sm">
                            <option>UDP</option>
                            <option>TCP</option>
                            <option>TLS</option>
                          </select>
                        </div>
                        <div className="grid grid-cols-2 gap-2">
                          <div>
                            <Label className="text-xs">Auth Username</Label>
                            <Input placeholder="username" className="text-sm" />
                          </div>
                          <div>
                            <Label className="text-xs">Auth Password</Label>
                            <Input type="password" placeholder="password" className="text-sm" />
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <input type="checkbox" id="nat" defaultChecked />
                          <Label htmlFor="nat" className="text-xs">NAT Traversal</Label>
                        </div>
                        <Button className="w-full" size="sm">
                          Trunk Ayarlarını Kaydet
                        </Button>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="text-center text-gray-500 py-8">
                    <Settings className="mx-auto mb-2" size={48} />
                    <p>Detayları görmek için bir müşteri seçin</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>

        {/* CDR & AI Analysis */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-6">
          {/* Call Records */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span className="flex items-center">
                    <FileText className="mr-2" size={20} />
                    Çağrı Detay Kayıtları (CDR)
                  </span>
                  <span className="text-sm text-gray-500">{callRecords.length} kayıt</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto max-h-96">
                  <table className="w-full text-sm">
                    <thead className="bg-gray-50 sticky top-0">
                      <tr>
                        <th className="text-left py-2 px-3 font-semibold text-gray-700">Arayan</th>
                        <th className="text-left py-2 px-3 font-semibold text-gray-700">Aranan</th>
                        <th className="text-left py-2 px-3 font-semibold text-gray-700">Ülke/Şehir</th>
                        <th className="text-left py-2 px-3 font-semibold text-gray-700">Codec</th>
                        <th className="text-right py-2 px-3 font-semibold text-gray-700">Süre</th>
                        <th className="text-left py-2 px-3 font-semibold text-gray-700">Tarih</th>
                        <th className="text-center py-2 px-3 font-semibold text-gray-700">AI</th>
                      </tr>
                    </thead>
                    <tbody>
                      {callRecords.slice(0, 20).map(record => (
                        <tr 
                          key={record.id} 
                          className="border-t hover:bg-gray-50 cursor-pointer"
                          onClick={() => setSelectedCallRecord(record)}
                        >
                          <td className="py-2 px-3">{record.caller_number}</td>
                          <td className="py-2 px-3">{record.called_number}</td>
                          <td className="py-2 px-3 text-xs">{record.country} / {record.city}</td>
                          <td className="py-2 px-3">
                            <span className="bg-gray-100 px-2 py-0.5 rounded text-xs">
                              {record.codec}
                            </span>
                          </td>
                          <td className="text-right py-2 px-3 font-mono">
                            {formatDuration(record.duration)}
                          </td>
                          <td className="py-2 px-3 text-xs">
                            {new Date(record.call_date).toLocaleString('tr-TR')}
                          </td>
                          <td className="text-center py-2 px-3">
                            <Brain className="mx-auto text-purple-600" size={16} />
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* AI Analysis for selected call */}
          <div>
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Brain className="mr-2" size={20} />
                  AI Ses & Çağrı Analizi
                </CardTitle>
              </CardHeader>
              <CardContent>
                {selectedCallRecord ? (
                  <div className="space-y-4">
                    {/* Waveform */}
                    <div className="bg-gradient-to-r from-purple-50 to-purple-100 rounded-lg p-4">
                      <div className="flex items-end justify-center gap-1 h-24">
                        {[...Array(30)].map((_, i) => (
                          <div
                            key={i}
                            className="w-1 bg-purple-500 rounded-t"
                            style={{ height: `${20 + Math.random() * 80}%` }}
                          />
                        ))}
                      </div>
                    </div>

                    {/* Controls */}
                    <div className="flex gap-2">
                      <Button 
                        variant="outline" 
                        className="flex-1"
                        onClick={() => setIsPlaying(!isPlaying)}
                      >
                        {isPlaying ? <Pause size={18} /> : <Play size={18} />}
                        <span className="ml-2">{isPlaying ? 'Durdur' : 'Oynat'}</span>
                      </Button>
                      <Button 
                        variant="outline"
                        onClick={() => setIsMuted(!isMuted)}
                      >
                        {isMuted ? <VolumeX size={18} /> : <Volume2 size={18} />}
                      </Button>
                    </div>

                    {/* AI Features */}
                    <div className="space-y-2">
                      <div className={`${selectedCallRecord.ai_noise_filtered ? 'bg-green-50 border-green-200' : 'bg-gray-50 border-gray-200'} border rounded-lg p-3`}>
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-medium text-gray-800">🎙️ Gürültü Filtreleme</span>
                          <span className={`text-xs px-2 py-1 rounded ${selectedCallRecord.ai_noise_filtered ? 'bg-green-200 text-green-800' : 'bg-gray-200 text-gray-800'}`}>
                            {selectedCallRecord.ai_noise_filtered ? 'Aktif' : 'Pasif'}
                          </span>
                        </div>
                      </div>
                      
                      <div className={`${selectedCallRecord.ai_spam_score > 0.7 ? 'bg-red-50 border-red-200' : 'bg-green-50 border-green-200'} border rounded-lg p-3`}>
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-medium text-gray-800">🚫 Spam Tespiti</span>
                          <span className={`text-xs px-2 py-1 rounded ${selectedCallRecord.ai_spam_score > 0.7 ? 'bg-red-200 text-red-800' : 'bg-green-200 text-green-800'}`}>
                            %{Math.round(selectedCallRecord.ai_spam_score * 100)}
                          </span>
                        </div>
                      </div>
                      
                      <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-medium text-blue-800">😊 Duygu Analizi</span>
                          <span className="text-xs bg-blue-200 text-blue-800 px-2 py-1 rounded">
                            {selectedCallRecord.ai_sentiment}
                          </span>
                        </div>
                      </div>

                      <div className="bg-purple-50 border border-purple-200 rounded-lg p-3">
                        <div className="mb-2">
                          <span className="text-sm font-medium text-purple-800">📝 AI Transkript</span>
                        </div>
                        <p className="text-xs text-gray-700 italic">
                          "{selectedCallRecord.ai_transcription}"
                        </p>
                      </div>

                      <div className="bg-gray-50 border border-gray-200 rounded-lg p-3">
                        <div className="text-xs space-y-1 text-gray-600">
                          <div className="flex justify-between">
                            <span>Konuşma Süresi:</span>
                            <span className="font-mono font-semibold">{formatDuration(selectedCallRecord.duration)}</span>
                          </div>
                          <div className="flex justify-between">
                            <span>Maliyet:</span>
                            <span className="font-semibold">₺{selectedCallRecord.cost.toFixed(2)}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="text-center text-gray-500 py-8">
                    <Brain className="mx-auto mb-2" size={48} />
                    <p>AI analizi için bir çağrı kaydı seçin</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Modals */}
      <CreateDealerModal
        isOpen={showCreateDealer}
        onClose={() => setShowCreateDealer(false)}
        tariffs={tariffs}
        onSuccess={loadData}
      />

      {/* AI Call Modal */}
      <Dialog open={showAIModal} onOpenChange={setShowAIModal}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Sparkles className="text-purple-600" size={24} />
              AI İle Arama Başlat
            </DialogTitle>
            <DialogDescription>
              ElevenLabs AI Agent ile otomatik arama başlatın
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            {/* Numara Ekle Bölümü */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-semibold text-gray-700">Numara Ekle</h3>
              </div>

              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <div className="bg-gray-100 px-3 py-2 rounded-md text-sm font-mono">
                    +90
                  </div>
                  <Input
                    type="text"
                    placeholder="5XX XXX XX XX"
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value)}
                    className="flex-1 font-mono"
                    maxLength={13}
                  />
                </div>
                <p className="text-xs text-gray-500">
                  Örnek: 533 886 46 56
                </p>
              </div>

              <Button
                onClick={handleStartCall}
                disabled={aiCallLoading || !phoneNumber.trim()}
                className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
              >
                {aiCallLoading ? (
                  <>
                    <Loader2 className="mr-2 animate-spin" size={16} />
                    Arama Başlatılıyor...
                  </>
                ) : (
                  <>
                    <Phone className="mr-2" size={16} />
                    Aramayı Başlat
                  </>
                )}
              </Button>
            </div>

            {/* Numara Bloğu Ekle (Pasif) */}
            <div className="space-y-3 opacity-50">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-semibold text-gray-700">Numara Bloğu Ekle</h3>
                <span className="text-xs bg-gray-200 px-2 py-1 rounded">Yakında</span>
              </div>

              <Button
                disabled
                variant="outline"
                className="w-full"
              >
                <Phone className="mr-2" size={16} />
                Toplu Numara Ekle
              </Button>
            </div>
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 text-xs text-blue-800">
            <p className="font-semibold mb-1">ℹ️ Bilgilendirme</p>
            <p>Sadece yetkili telefon numaralarını arayabilirsiniz.</p>
          </div>
        </DialogContent>
      </Dialog>

      {/* Add Number Modal */}
      <Dialog open={showAddNumberModal} onOpenChange={setShowAddNumberModal}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Plus className="text-purple-600" size={24} />
              Numara Ekle
            </DialogTitle>
            <DialogDescription>
              Otomatik arama için tek bir numara ekleyin
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Telefon Numarası</Label>
              <div className="flex items-center gap-2">
                <div className="bg-gray-100 px-3 py-2 rounded-md text-sm font-mono">
                  +90
                </div>
                <Input
                  type="text"
                  placeholder="5XX XXX XX XX"
                  value={newPhoneNumber}
                  onChange={(e) => setNewPhoneNumber(e.target.value)}
                  className="flex-1 font-mono"
                  maxLength={13}
                />
              </div>
              <p className="text-xs text-gray-500">
                Örnek: 533 886 46 56
              </p>
            </div>

            <Button
              onClick={handleAddNumber}
              disabled={!newPhoneNumber.trim()}
              className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
            >
              <Plus className="mr-2" size={16} />
              Numara Ekle
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default VoIPCRMAdvanced;
