import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Phone, PhoneOff, RefreshCw, Filter, Search, Loader2, Info, Sparkles, X } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { useToast } from '../hooks/use-toast';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '../components/ui/dialog';

const LiveCallsPage = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [calls, setCalls] = useState([]);
  const [filteredCalls, setFilteredCalls] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedCall, setSelectedCall] = useState(null);
  const [aiCallLoading, setAiCallLoading] = useState(false);
  const [showAIModal, setShowAIModal] = useState(false);
  const [phoneNumber, setPhoneNumber] = useState('');
  const intervalRef = useRef(null);

  const ALLOWED_NUMBER = '5338864656'; // İzin verilen numara (sadece rakamlar)

  // Generate mock calls
  const generateMockCalls = () => {
    const statuses = ['connected', 'ringing', 'ended'];
    const systems = ['SippySoft', 'Issabel'];
    const tenants = ['Tenant A', 'Tenant B', 'Tenant C', 'Bireysel 1', 'Bireysel 2'];
    const dealers = ['Bayi 1', 'Bayi 2', 'Bayi 3', null];
    const trunks = ['Trunk-001', 'Trunk-002', 'Trunk-003'];
    
    return Array.from({ length: 12 }, (_, i) => {
      const status = statuses[Math.floor(Math.random() * statuses.length)];
      const startTime = new Date(Date.now() - Math.random() * 600000); // Last 10 minutes
      
      return {
        id: `call-${i + 1}`,
        callId: `CID-${Math.random().toString(36).substr(2, 9).toUpperCase()}`,
        status,
        caller: `+90 ${Math.floor(Math.random() * 900 + 100)} ${Math.floor(Math.random() * 900 + 100)} ${Math.floor(Math.random() * 90 + 10)} ${Math.floor(Math.random() * 90 + 10)}`,
        callee: `+90 ${Math.floor(Math.random() * 900 + 100)} ${Math.floor(Math.random() * 900 + 100)} ${Math.floor(Math.random() * 90 + 10)} ${Math.floor(Math.random() * 90 + 10)}`,
        startTime,
        duration: status === 'ended' ? Math.floor(Math.random() * 300) : Math.floor((Date.now() - startTime) / 1000),
        tenant: tenants[Math.floor(Math.random() * tenants.length)],
        dealer: dealers[Math.floor(Math.random() * dealers.length)],
        system: systems[Math.floor(Math.random() * systems.length)],
        trunk: trunks[Math.floor(Math.random() * trunks.length)],
        agent: Math.random() > 0.5 ? `Agent ${Math.floor(Math.random() * 100)}` : null,
        extension: Math.random() > 0.5 ? `Ext ${Math.floor(Math.random() * 1000 + 1000)}` : null
      };
    });
  };

  useEffect(() => {
    loadCalls();
    
    // Auto-refresh every 5 seconds
    intervalRef.current = setInterval(() => {
      updateCallDurations();
    }, 1000);
    
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, []);

  useEffect(() => {
    filterCalls();
  }, [calls, searchTerm, statusFilter]);

  const loadCalls = () => {
    setLoading(true);
    setTimeout(() => {
      setCalls(generateMockCalls());
      setLoading(false);
    }, 500);
  };

  const updateCallDurations = () => {
    setCalls(prevCalls => 
      prevCalls.map(call => {
        if (call.status === 'connected' || call.status === 'ringing') {
          return {
            ...call,
            duration: Math.floor((Date.now() - call.startTime) / 1000)
          };
        }
        return call;
      })
    );
  };

  const filterCalls = () => {
    let filtered = calls;
    
    // Status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter(call => call.status === statusFilter);
    }
    
    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(call =>
        call.caller.includes(searchTerm) ||
        call.callee.includes(searchTerm) ||
        call.tenant.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (call.dealer && call.dealer.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }
    
    setFilteredCalls(filtered);
  };

  const handleTerminateCall = (call) => {
    if (call.status === 'ended') return;

    if (!window.confirm(`${call.caller} numaralı çağrıyı sonlandırmak istiyor musunuz?`)) return;

    setLoading(true);
    setTimeout(() => {
      // Update call status to ended
      setCalls(prevCalls =>
        prevCalls.map(c =>
          c.id === call.id ? { ...c, status: 'ended' } : c
        )
      );

      toast({
        title: "✅ Demo: Çağrı Sonlandırıldı",
        description: `CallID: ${call.callId}`
      });

      setLoading(false);
      setSelectedCall(null);
    }, 800);
  };

  const handleAICall = () => {
    setShowAIModal(true);
    setPhoneNumber('');
  };

  const handleStartCall = async () => {
    // Telefon numarasını temizle (sadece rakamlar)
    const cleanNumber = phoneNumber.replace(/\s+/g, '').replace(/\D/g, '');

    // Numara kontrolü
    if (cleanNumber !== ALLOWED_NUMBER) {
      toast({
        title: "❌ Yetki Hatası",
        description: "Bu numarayı arama yetkiniz bulunmamaktadır.",
        variant: "destructive",
        duration: 5000
      });
      return;
    }

    setAiCallLoading(true);

    // İzin verilen numara girildiğinde asıl aranacak numara
    const targetNumber = '5326819616';

    try {
      const response = await fetch('http://localhost:8000/api/elevenlabs/outbound-call', {
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

  const formatDuration = (seconds) => {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = seconds % 60;
    return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const getStatusBadge = (status) => {
    const badges = {
      connected: { bg: 'bg-green-100', text: 'text-green-800', label: 'Aktif' },
      ringing: { bg: 'bg-yellow-100', text: 'text-yellow-800', label: 'Bağlanıyor' },
      ended: { bg: 'bg-red-100', text: 'text-red-800', label: 'Bitti' }
    };
    
    const badge = badges[status] || badges.ended;
    return (
      <span className={`px-2 py-1 rounded-full text-xs font-semibold ${badge.bg} ${badge.text}`}>
        {badge.label}
      </span>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button variant="ghost" onClick={() => navigate('/admin/super-admin-panel')}>
                <ArrowLeft className="mr-2" size={20} />
                SUPER ADMIN
              </Button>
              <div>
                <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-2">
                  <Phone className="text-blue-600" size={32} />
                  Canlı Çağrılar (NOC)
                </h1>
                <p className="text-sm text-gray-600">Tüm bayi/bireysel/kurumsal çağrıları anlık izleme</p>
              </div>
            </div>
            <div className="flex gap-2">
              <Button
                onClick={handleAICall}
                disabled={aiCallLoading}
                className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white"
              >
                {aiCallLoading ? (
                  <Loader2 className="mr-2 animate-spin" size={18} />
                ) : (
                  <Sparkles className="mr-2" size={18} />
                )}
                A.I. İle Arama Başlat
              </Button>
              <Button onClick={loadCalls} disabled={loading} variant="outline">
                <RefreshCw className={`mr-2 ${loading ? 'animate-spin' : ''}`} size={18} />
                Yenile
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        {/* Demo Info */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
          <div className="flex items-start gap-2">
            <Info className="text-blue-600 flex-shrink-0 mt-0.5" size={20} />
            <div className="text-sm text-blue-800">
              <p className="font-semibold">Demo Modu Bilgisi</p>
              <p>Şu an demo verisi gösteriliyor. Canlı sistemde SippySoft/Issabel API ile eş zamanlı çalışır.</p>
            </div>
          </div>
        </div>

        {/* Filters */}
        <Card className="mb-6">
          <CardContent className="pt-6">
            <div className="flex flex-wrap gap-4">
              <div className="flex-1 min-w-64">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                  <Input
                    placeholder="Numara, tenant veya bayi ara..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Filter size={18} className="text-gray-400" />
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="border rounded-md px-3 py-2 text-sm"
                >
                  <option value="all">Tüm Durumlar</option>
                  <option value="connected">Aktif</option>
                  <option value="ringing">Bağlanıyor</option>
                  <option value="ended">Bitti</option>
                </select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Calls List */}
        <Card>
          <CardHeader>
            <CardTitle>Çağrı Listesi ({filteredCalls.length})</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="text-left py-3 px-4 font-semibold text-gray-700">Durum</th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-700">Arayan</th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-700">Aranan</th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-700">Süre</th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-700">Tenant</th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-700">Bayi</th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-700">Sistem</th>
                    <th className="text-center py-3 px-4 font-semibold text-gray-700">İşlem</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredCalls.map(call => (
                    <tr 
                      key={call.id} 
                      className="border-t hover:bg-gray-50 cursor-pointer"
                      onClick={() => setSelectedCall(call)}
                    >
                      <td className="py-3 px-4">{getStatusBadge(call.status)}</td>
                      <td className="py-3 px-4 font-mono text-xs">{call.caller}</td>
                      <td className="py-3 px-4 font-mono text-xs">{call.callee}</td>
                      <td className="py-3 px-4 font-mono">{formatDuration(call.duration)}</td>
                      <td className="py-3 px-4">{call.tenant}</td>
                      <td className="py-3 px-4">{call.dealer || '-'}</td>
                      <td className="py-3 px-4">
                        <span className="text-xs bg-gray-100 px-2 py-1 rounded">{call.system}</span>
                      </td>
                      <td className="text-center py-3 px-4">
                        {(call.status === 'connected' || call.status === 'ringing') && (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleTerminateCall(call);
                            }}
                            className="border-red-500 text-red-600 hover:bg-red-50"
                          >
                            <PhoneOff size={14} />
                          </Button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Call Detail Drawer */}
      {selectedCall && (
        <div 
          className="fixed inset-0 bg-black/50 z-50 flex items-center justify-end"
          onClick={() => setSelectedCall(null)}
        >
          <div 
            className="bg-white h-full w-full max-w-md shadow-xl overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold">Çağrı Detayları</h2>
                <Button variant="ghost" onClick={() => setSelectedCall(null)}>✕</Button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="text-sm text-gray-600">Durum</label>
                  <div className="mt-1">{getStatusBadge(selectedCall.status)}</div>
                </div>

                <div>
                  <label className="text-sm text-gray-600">Call ID</label>
                  <div className="mt-1 font-mono text-sm bg-gray-50 p-2 rounded">{selectedCall.callId}</div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm text-gray-600">Arayan</label>
                    <div className="mt-1 font-mono text-sm">{selectedCall.caller}</div>
                  </div>
                  <div>
                    <label className="text-sm text-gray-600">Aranan</label>
                    <div className="mt-1 font-mono text-sm">{selectedCall.callee}</div>
                  </div>
                </div>

                <div>
                  <label className="text-sm text-gray-600">Bağlantı Süresi</label>
                  <div className="mt-1 font-mono text-lg font-bold">{formatDuration(selectedCall.duration)}</div>
                </div>

                <div>
                  <label className="text-sm text-gray-600">Tenant/Müşteri</label>
                  <div className="mt-1">{selectedCall.tenant}</div>
                </div>

                <div>
                  <label className="text-sm text-gray-600">Bayi</label>
                  <div className="mt-1">{selectedCall.dealer || 'Direkt'}</div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm text-gray-600">Sistem</label>
                    <div className="mt-1">{selectedCall.system}</div>
                  </div>
                  <div>
                    <label className="text-sm text-gray-600">Trunk</label>
                    <div className="mt-1">{selectedCall.trunk}</div>
                  </div>
                </div>

                {selectedCall.agent && (
                  <div>
                    <label className="text-sm text-gray-600">Agent</label>
                    <div className="mt-1">{selectedCall.agent}</div>
                  </div>
                )}

                {selectedCall.extension && (
                  <div>
                    <label className="text-sm text-gray-600">Extension</label>
                    <div className="mt-1">{selectedCall.extension}</div>
                  </div>
                )}

                <div>
                  <label className="text-sm text-gray-600">Başlangıç Zamanı</label>
                  <div className="mt-1 text-sm">{selectedCall.startTime.toLocaleString('tr-TR')}</div>
                </div>

                <div className="bg-blue-50 border border-blue-200 rounded p-3 text-xs text-blue-800">
                  <p className="font-semibold">Demo Modu</p>
                  <p>Canlıda SippySoft/Issabel API ile eş zamanlı çalışır.</p>
                </div>

                {(selectedCall.status === 'connected' || selectedCall.status === 'ringing') && (
                  <Button
                    onClick={() => handleTerminateCall(selectedCall)}
                    disabled={loading}
                    className="w-full bg-red-600 hover:bg-red-700"
                  >
                    {loading ? <Loader2 className="mr-2 animate-spin" size={16} /> : <PhoneOff className="mr-2" size={16} />}
                    Çağrıyı Sonlandır
                  </Button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* AI Call Modal */}
      <Dialog open={showAIModal} onOpenChange={setShowAIModal}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Sparkles className="text-purple-600" size={24} />
              AI İle Arama Başlat
            </DialogTitle>
            <DialogDescription>
              AI ile otomatik arama başlatın
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
    </div>
  );
};

export default LiveCallsPage;
