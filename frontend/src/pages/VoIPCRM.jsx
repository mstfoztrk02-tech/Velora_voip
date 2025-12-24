import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Users, Phone, Clock, ArrowLeft, Plus, Play, Pause, Volume2, VolumeX,
  ChevronDown, ChevronRight, Settings, TrendingUp, AlertTriangle, Brain
} from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Select } from '../components/ui/select';
import axios from 'axios';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;

const VoIPCRM = () => {
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    total_dealers: 0,
    total_customers: 0,
    total_call_duration_minutes: 0,
    total_calls: 0
  });
  const [dealers, setDealers] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [callRecords, setCallRecords] = useState([]);
  const [sippyCDRs, setSippyCDRs] = useState([]);
  const [loadingSippyCDRs, setLoadingSippyCDRs] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [expandedDealers, setExpandedDealers] = useState(new Set());
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [showCreateDealer, setShowCreateDealer] = useState(false);
  const [showCreateCustomer, setShowCreateCustomer] = useState(false);

  useEffect(() => {
    loadData();
    loadSippyCDRs();

    const interval = setInterval(() => {
      loadSippyCDRs();
    }, 30000);

    return () => clearInterval(interval);
  }, []);

  const loadData = async () => {
    try {
      const [statsRes, dealersRes, customersRes, callsRes] = await Promise.all([
        axios.get(`${BACKEND_URL}/api/voip-crm/statistics`),
        axios.get(`${BACKEND_URL}/api/voip-crm/dealers`),
        axios.get(`${BACKEND_URL}/api/voip-crm/customers`),
        axios.get(`${BACKEND_URL}/api/voip-crm/call-records`)
      ]);

      setStats(statsRes.data);
      setDealers(dealersRes.data);
      setCustomers(customersRes.data);
      setCallRecords(callsRes.data);
    } catch (error) {
      console.error('Error loading data:', error);
    }
  };

  const loadSippyCDRs = async () => {
    setLoadingSippyCDRs(true);
    try {
      const response = await axios.get(`${BACKEND_URL}/api/sippy/cdrs?limit=100`);
      // Response format: { ok: bool, message: string, data: array, total: number }
      if (response.data && response.data.ok && response.data.data) {
        setSippyCDRs(response.data.data);
      } else {
        console.error('Sippy CDRs error:', response.data?.message || 'Unknown error');
        setSippyCDRs([]);
      }
    } catch (error) {
      console.error('Error loading Sippy CDRs:', error);
      setSippyCDRs([]);
    } finally {
      setLoadingSippyCDRs(false);
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

  const getCustomersByDealer = (dealerId) => {
    return customers.filter(c => c.dealer_id === dealerId);
  };

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
              <h1 className="text-3xl font-bold text-gray-900">Velora AI CRM</h1>
            </div>
            <div className="flex gap-2">
              <Button onClick={() => setShowCreateDealer(true)} className="bg-blue-600 hover:bg-blue-700">
                <Plus className="mr-2" size={18} />
                Bayi Oluştur
              </Button>
              <Button onClick={() => setShowCreateCustomer(true)} variant="outline">
                <Plus className="mr-2" size={18} />
                Müşteri Oluştur
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-6">
        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Toplam Bayi</p>
                  <p className="text-3xl font-bold text-gray-900">{stats.total_dealers}</p>
                </div>
                <div className="bg-blue-100 p-3 rounded-full">
                  <Users className="text-blue-600" size={24} />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
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

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Toplam Çağrı Süresi</p>
                  <p className="text-3xl font-bold text-gray-900">
                    {Math.round(stats.total_call_duration_minutes)}m
                  </p>
                </div>
                <div className="bg-purple-100 p-3 rounded-full">
                  <Clock className="text-purple-600" size={24} />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Toplam Çağrı</p>
                  <p className="text-3xl font-bold text-gray-900">{stats.total_calls}</p>
                </div>
                <div className="bg-orange-100 p-3 rounded-full">
                  <Phone className="text-orange-600" size={24} />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left: Dealers & Customers Table */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle>Bayi ve Müşteri Yönetimi</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="text-left py-3 px-4 font-semibold text-gray-700">Bayi/Kullanıcı Adı</th>
                        <th className="text-left py-3 px-4 font-semibold text-gray-700">Tarife</th>
                        <th className="text-left py-3 px-4 font-semibold text-gray-700">Numara</th>
                        <th className="text-left py-3 px-4 font-semibold text-gray-700">Para Birimi</th>
                        <th className="text-right py-3 px-4 font-semibold text-gray-700">Toplam Dakika</th>
                        <th className="text-right py-3 px-4 font-semibold text-gray-700">Toplam Çağrı</th>
                      </tr>
                    </thead>
                    <tbody>
                      {dealers.map(dealer => (
                        <React.Fragment key={dealer.id}>
                          <tr className="border-t hover:bg-gray-50 cursor-pointer" onClick={() => toggleDealer(dealer.id)}>
                            <td className="py-3 px-4 font-semibold text-blue-600 flex items-center">
                              {expandedDealers.has(dealer.id) ? <ChevronDown size={18} /> : <ChevronRight size={18} />}
                              <span className="ml-2">{dealer.name}</span>
                            </td>
                            <td className="py-3 px-4">-</td>
                            <td className="py-3 px-4">{dealer.phone}</td>
                            <td className="py-3 px-4">TRY</td>
                            <td className="text-right py-3 px-4">{Math.round(dealer.total_minutes)}</td>
                            <td className="text-right py-3 px-4">{dealer.total_calls}</td>
                          </tr>
                          {expandedDealers.has(dealer.id) && getCustomersByDealer(dealer.id).map(customer => (
                            <tr 
                              key={customer.id} 
                              className="border-t hover:bg-blue-50 cursor-pointer"
                              onClick={() => setSelectedCustomer(customer)}
                            >
                              <td className="py-3 px-4 pl-12 text-gray-700">{customer.username}</td>
                              <td className="py-3 px-4">{customer.tariff}</td>
                              <td className="py-3 px-4">{customer.number || '-'}</td>
                              <td className="py-3 px-4">{customer.currency}</td>
                              <td className="text-right py-3 px-4">{Math.round(customer.total_minutes)}</td>
                              <td className="text-right py-3 px-4">{customer.total_calls}</td>
                            </tr>
                          ))}
                        </React.Fragment>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right: Customer Details */}
          <div>
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Settings className="mr-2" size={20} />
                  Müşteri Detayları
                </CardTitle>
              </CardHeader>
              <CardContent>
                {selectedCustomer ? (
                  <div className="space-y-4">
                    <div>
                      <Label>Kullanıcı Adı</Label>
                      <Input value={selectedCustomer.username} readOnly className="bg-gray-50" />
                    </div>
                    <div>
                      <Label>Tarife Seçimi</Label>
                      <select className="w-full border rounded-md p-2" defaultValue={selectedCustomer.tariff}>
                        <option>Standard Tarife</option>
                        <option>Premium Tarife</option>
                        <option>Business Tarife</option>
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
                      <h4 className="font-semibold mb-3 text-sm text-gray-700">Trunk Ayarları</h4>
                      <div className="space-y-3">
                        <div>
                          <Label className="text-xs">IP Adresi</Label>
                          <Input placeholder="192.168.1.1" className="text-sm" />
                        </div>
                        <div className="grid grid-cols-2 gap-2">
                          <div>
                            <Label className="text-xs">Port</Label>
                            <Input placeholder="5060" className="text-sm" />
                          </div>
                          <div>
                            <Label className="text-xs">Codec</Label>
                            <select className="w-full border rounded-md p-1.5 text-sm">
                              <option>G.711</option>
                              <option>G.729</option>
                              <option>Opus</option>
                            </select>
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
                        <Button className="w-full" size="sm">
                          Ayarları Kaydet
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

        {/* Call Records & AI Analysis */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-6">
          {/* Live Call Records from SippySoft */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2">
                    <Phone className="text-blue-600" size={20} />
                    Gerçek Zamanlı Çağrı Görünümü (Live)
                  </CardTitle>
                  <div className="flex items-center gap-2">
                    {loadingSippyCDRs && (
                      <span className="text-xs text-gray-500 flex items-center gap-1">
                        <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-blue-600"></div>
                        Yükleniyor...
                      </span>
                    )}
                    <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full font-medium">
                      SippySoft CDR
                    </span>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={loadSippyCDRs}
                      disabled={loadingSippyCDRs}
                    >
                      Yenile
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="text-left py-2 px-3 font-semibold text-gray-700">Arayan</th>
                        <th className="text-left py-2 px-3 font-semibold text-gray-700">Aranan</th>
                        <th className="text-left py-2 px-3 font-semibold text-gray-700">Yön</th>
                        <th className="text-left py-2 px-3 font-semibold text-gray-700">Durum</th>
                        <th className="text-left py-2 px-3 font-semibold text-gray-700">Ülke/Şehir</th>
                        <th className="text-right py-2 px-3 font-semibold text-gray-700">Süre (sn)</th>
                        <th className="text-left py-2 px-3 font-semibold text-gray-700">Tarih-Saat</th>
                      </tr>
                    </thead>
                    <tbody>
                      {sippyCDRs.length > 0 ? (
                        sippyCDRs.slice(0, 20).map((record, index) => (
                          <tr key={record.call_id || index} className="border-t hover:bg-blue-50 transition-colors">
                            <td className="py-2 px-3 font-medium">{record.caller}</td>
                            <td className="py-2 px-3">{record.callee}</td>
                            <td className="py-2 px-3">
                              <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${
                                record.direction === 'inbound'
                                  ? 'bg-green-100 text-green-800'
                                  : 'bg-blue-100 text-blue-800'
                              }`}>
                                {record.direction === 'inbound' ? 'Gelen' : 'Giden'}
                              </span>
                            </td>
                            <td className="py-2 px-3">
                              <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${
                                record.status === 'completed' || record.status === 'ANSWERED'
                                  ? 'bg-green-100 text-green-800'
                                  : 'bg-red-100 text-red-800'
                              }`}>
                                {record.status}
                              </span>
                            </td>
                            <td className="py-2 px-3 text-gray-600">
                              {record.country || '-'} {record.city ? `/ ${record.city}` : ''}
                            </td>
                            <td className="text-right py-2 px-3 font-mono">{record.duration}s</td>
                            <td className="py-2 px-3 text-gray-600">
                              {new Date(record.start_time).toLocaleString('tr-TR')}
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan="7" className="py-8 text-center text-gray-500">
                            {loadingSippyCDRs ? 'Çağrı kayıtları yükleniyor...' : 'SippySoft\'tan çağrı kaydı bulunamadı'}
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
                {sippyCDRs.length > 0 && (
                  <div className="mt-4 pt-4 border-t text-sm text-gray-600">
                    <div className="flex items-center justify-between">
                      <span>Toplam {sippyCDRs.length} kayıt gösteriliyor</span>
                      <span className="text-xs text-gray-500">
                        Son güncelleme: {new Date().toLocaleTimeString('tr-TR')}
                      </span>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* AI Voice Analysis */}
          <div>
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Brain className="mr-2" size={20} />
                  AI Ses Analizi
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {/* Waveform */}
                  <div className="bg-gradient-to-r from-blue-50 to-blue-100 rounded-lg p-4">
                    <div className="flex items-end justify-center gap-1 h-24">
                      {[...Array(30)].map((_, i) => (
                        <div
                          key={i}
                          className="w-1 bg-blue-500 rounded-t"
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
                    <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium text-green-800">AI Noise Filter</span>
                        <span className="text-xs bg-green-200 text-green-800 px-2 py-1 rounded">Aktif</span>
                      </div>
                    </div>
                    
                    <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium text-red-800">Spam Tespiti</span>
                        <span className="text-xs bg-red-200 text-red-800 px-2 py-1 rounded">%85 Spam</span>
                      </div>
                    </div>
                    
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium text-blue-800">Duygu Analizi</span>
                        <span className="text-xs bg-blue-200 text-blue-800 px-2 py-1 rounded">Pozitif</span>
                      </div>
                    </div>

                    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                      <div className="flex items-center">
                        <AlertTriangle className="text-yellow-600 mr-2" size={18} />
                        <span className="text-sm font-medium text-yellow-800">Otomatik Transkript Hazır</span>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VoIPCRM;
