import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Shield, CheckCircle, XCircle, Clock, ArrowLeft, User, Phone, Building2, CreditCard, Plus, Loader2 } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { useToast } from '../hooks/use-toast';
import packageService, { PACKAGES } from '../services/packageService';
import authService from '../services/authService';

const AdminApprovalCenter = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showQuickDealer, setShowQuickDealer] = useState(false);
  const [dealerForm, setDealerForm] = useState({ name: '', email: '', phone: '' });

  useEffect(() => {
    // Check if user is admin
    if (!authService.isAdmin()) {
      toast({
        title: "Yetkisiz Erişim",
        description: "Bu sayfaya erişim yetkiniz yok.",
        variant: "destructive"
      });
      navigate('/voip-crm');
      return;
    }
    
    loadPendingRequests();
  }, []);

  const loadPendingRequests = () => {
    // DEMO: Mock loading from localStorage
    const allRequests = [];
    
    // Scan localStorage for all package requests
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key.startsWith('package_')) {
        const packageData = JSON.parse(localStorage.getItem(key));
        const userId = key.replace('package_', '');
        
        allRequests.push({
          userId,
          ...packageData
        });
      }
    }
    
    setRequests(allRequests);
    setLoading(false);
  };

  const handleApprove = async (userId) => {
    try {
      await packageService.approvePackage(userId, true);
      
      toast({
        title: "✅ Onaylandı",
        description: "Paket onaylandı ve aktif edildi."
      });
      
      loadPendingRequests();
    } catch (error) {
      toast({
        title: "Hata",
        description: error.message,
        variant: "destructive"
      });
    }
  };

  const handleReject = async (userId) => {
    try {
      await packageService.approvePackage(userId, false);
      
      toast({
        title: "❌ Reddedildi",
        description: "Paket talebi reddedildi."
      });
      
      loadPendingRequests();
    } catch (error) {
      toast({
        title: "Hata",
        description: error.message,
        variant: "destructive"
      });
    }
  };

  const handleMarkPaymentReceived = async (userId) => {
    try {
      await packageService.markPaymentReceived(userId);
      
      toast({
        title: "💰 Ödeme Alındı",
        description: "Ödeme durumu güncellendi."
      });
      
      loadPendingRequests();
    } catch (error) {
      toast({
        title: "Hata",
        description: error.message,
        variant: "destructive"
      });
    }
  };

  const getStatusBadge = (status) => {
    const badges = {
      'Beklemede': { bg: 'bg-yellow-100', text: 'text-yellow-800', icon: Clock },
      'Aktif': { bg: 'bg-green-100', text: 'text-green-800', icon: CheckCircle },
      'Pasif': { bg: 'bg-gray-100', text: 'text-gray-800', icon: XCircle },
      'Askıda': { bg: 'bg-red-100', text: 'text-red-800', icon: XCircle }
    };
    
    const badge = badges[status] || badges['Beklemede'];
    const Icon = badge.icon;
    
    return (
      <span className={`${badge.bg} ${badge.text} px-3 py-1 rounded-full text-xs font-semibold flex items-center gap-1`}>
        <Icon size={12} />
        {status}
      </span>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Yükleniyor...</p>
        </div>
      </div>
    );
  }

  const handleQuickDealerCreate = async () => {
    if (!dealerForm.name || !dealerForm.email) {
      toast({
        title: "Hata",
        description: "Lütfen tüm alanları doldurun.",
        variant: "destructive"
      });
      return;
    }

    setLoading(true);
    try {
      // Use dealerService
      const dealerService = await import('../services/dealerService');
      await dealerService.default.createDealer(dealerForm);
      
      toast({
        title: "✅ Başarılı",
        description: "Bayi oluşturuldu."
      });
      
      setShowQuickDealer(false);
      setDealerForm({ name: '', email: '', phone: '' });
    } catch (error) {
      toast({
        title: "Hata",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button variant="ghost" onClick={() => navigate('/voip-crm')}>
                <ArrowLeft className="mr-2" size={20} />
                CRM'e Dön
              </Button>
              <div>
                <h1 className="text-3xl font-bold text-purple-900 flex items-center gap-2">
                  <Shield className="text-purple-600" size={32} />
                  Paket & Onay Merkezi
                </h1>
                <p className="text-sm text-gray-600 mt-1">Müşteri paket talepleri ve onayları</p>
              </div>
            </div>
            <Button
              onClick={() => setShowQuickDealer(true)}
              className="bg-blue-600 hover:bg-blue-700"
            >
              <Plus className="mr-2" size={18} />
              Hızlı Bayi Oluştur
            </Button>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                <p className="text-sm text-gray-600">Toplam Talep</p>
                <p className="text-3xl font-bold text-gray-900">{requests.length}</p>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                <p className="text-sm text-gray-600">Beklemede</p>
                <p className="text-3xl font-bold text-yellow-600">
                  {requests.filter(r => r.status === 'Beklemede').length}
                </p>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                <p className="text-sm text-gray-600">Aktif</p>
                <p className="text-3xl font-bold text-green-600">
                  {requests.filter(r => r.status === 'Aktif').length}
                </p>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                <p className="text-sm text-gray-600">Ödeme Alındı</p>
                <p className="text-3xl font-bold text-blue-600">
                  {requests.filter(r => r.paymentReceived).length}
                </p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Requests Table */}
        <Card>
          <CardHeader>
            <CardTitle>Müşteri Paket Talepleri</CardTitle>
          </CardHeader>
          <CardContent>
            {requests.length === 0 ? (
              <div className="text-center py-12 text-gray-500">
                <Shield className="mx-auto mb-4" size={48} />
                <p>Henüz paket talebi yok</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="text-left py-3 px-4 font-semibold text-gray-700">Müşteri ID</th>
                      <th className="text-left py-3 px-4 font-semibold text-gray-700">Paket</th>
                      <th className="text-left py-3 px-4 font-semibold text-gray-700">Durum</th>
                      <th className="text-center py-3 px-4 font-semibold text-gray-700">Ödeme</th>
                      <th className="text-left py-3 px-4 font-semibold text-gray-700">Seçim Tarihi</th>
                      <th className="text-center py-3 px-4 font-semibold text-gray-700">İşlemler</th>
                    </tr>
                  </thead>
                  <tbody>
                    {requests.map((request) => {
                      const pkg = PACKAGES[request.packageId];
                      return (
                        <tr key={request.userId} className="border-t hover:bg-gray-50">
                          <td className="py-3 px-4">
                            <div className="flex items-center gap-2">
                              {request.userId.includes('+') ? (
                                <Phone size={14} className="text-blue-600" />
                              ) : (
                                <Building2 size={14} className="text-purple-600" />
                              )}
                              <span className="font-mono text-xs">{request.userId}</span>
                            </div>
                          </td>
                          <td className="py-3 px-4">
                            <span className={`px-3 py-1 rounded-full text-xs font-semibold bg-${pkg.color}-100 text-${pkg.color}-800`}>
                              {pkg.name}
                            </span>
                          </td>
                          <td className="py-3 px-4">
                            {getStatusBadge(request.status)}
                          </td>
                          <td className="text-center py-3 px-4">
                            {request.paymentReceived ? (
                              <CheckCircle className="text-green-600 mx-auto" size={20} />
                            ) : (
                              <XCircle className="text-gray-400 mx-auto" size={20} />
                            )}
                          </td>
                          <td className="py-3 px-4 text-xs text-gray-600">
                            {new Date(request.selectedAt).toLocaleString('tr-TR')}
                          </td>
                          <td className="text-center py-3 px-4">
                            <div className="flex gap-2 justify-center">
                              {!request.paymentReceived && (
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => handleMarkPaymentReceived(request.userId)}
                                  className="border-blue-500 text-blue-600 hover:bg-blue-50"
                                >
                                  <CreditCard size={14} className="mr-1" />
                                  Ödeme Alındı
                                </Button>
                              )}
                              
                              {request.status !== 'Aktif' && (
                                <Button
                                  size="sm"
                                  onClick={() => handleApprove(request.userId)}
                                  className="bg-green-600 hover:bg-green-700"
                                >
                                  <CheckCircle size={14} className="mr-1" />
                                  Aktif Et
                                </Button>
                              )}
                              
                              {request.status === 'Aktif' && (
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => handleReject(request.userId)}
                                  className="border-red-500 text-red-600 hover:bg-red-50"
                                >
                                  <XCircle size={14} className="mr-1" />
                                  Pasif Et
                                </Button>
                              )}
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Quick Dealer Modal */}
      {showQuickDealer && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <Card className="w-full max-w-md">
            <CardHeader>
              <CardTitle>Hızlı Bayi Oluştur</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <Label>Bayi Adı</Label>
                  <Input
                    value={dealerForm.name}
                    onChange={(e) => setDealerForm({...dealerForm, name: e.target.value})}
                    placeholder="Bayi A"
                  />
                </div>
                <div>
                  <Label>Email</Label>
                  <Input
                    type="email"
                    value={dealerForm.email}
                    onChange={(e) => setDealerForm({...dealerForm, email: e.target.value})}
                    placeholder="bayi@example.com"
                  />
                </div>
                <div>
                  <Label>Telefon</Label>
                  <Input
                    type="tel"
                    value={dealerForm.phone}
                    onChange={(e) => setDealerForm({...dealerForm, phone: e.target.value})}
                    placeholder="+90 5XX XXX XX XX"
                  />
                </div>
                <div className="flex gap-2 pt-2">
                  <Button
                    onClick={() => {
                      setShowQuickDealer(false);
                      setDealerForm({ name: '', email: '', phone: '' });
                    }}
                    variant="outline"
                    className="flex-1"
                  >
                    İptal
                  </Button>
                  <Button
                    onClick={handleQuickDealerCreate}
                    disabled={loading}
                    className="flex-1"
                  >
                    {loading ? <Loader2 className="mr-2 animate-spin" size={16} /> : null}
                    Oluştur
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
};

export default AdminApprovalCenter;
