import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Plus, Edit2, Trash2, UserPlus, Power, Loader2 } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { useToast } from '../hooks/use-toast';
import dealerService from '../services/dealerService';

const DealerManagementPage = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [dealers, setDealers] = useState([]);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingDealer, setEditingDealer] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    web_login: '',
    web_password: '',
    base_currency: 'TRY',
    i_time_zone: 228, // Europe/Istanbul
    i_lang: 'tr'
  });

  useEffect(() => {
    loadDealers();
  }, []);

  const loadDealers = async () => {
    setLoading(true);
    try {
      const data = await dealerService.getDealers();
      setDealers(data);
    } catch (error) {
      toast({
        title: "Hata",
        description: "Bayiler yüklenemedi.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async () => {
    // Validasyon
    if (!formData.name || !formData.web_login || !formData.web_password) {
      toast({
        title: "Hata",
        description: "Bayi Adı, Web Girişi ve Web Şifresi zorunludur.",
        variant: "destructive"
      });
      return;
    }

    if (formData.web_password.length < 6) {
      toast({
        title: "Hata",
        description: "Web Şifresi en az 6 karakter olmalıdır.",
        variant: "destructive"
      });
      return;
    }

    setLoading(true);
    try {
      const result = await dealerService.createVendor(formData);
      toast({
        title: "✅ Başarılı",
        description: result.message || "Bayi başarıyla oluşturuldu"
      });
      setShowCreateModal(false);
      setFormData({
        name: '',
        web_login: '',
        web_password: '',
        base_currency: 'TRY',
        i_time_zone: 228,
        i_lang: 'tr'
      });
      loadDealers();
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

  const handleUpdate = async () => {
    setLoading(true);
    try {
      await dealerService.updateDealer(editingDealer.id, formData);
      toast({ title: "✅ Başarılı", description: "Bayi güncellendi." });
      setEditingDealer(null);
      setFormData({
        name: '',
        web_login: '',
        web_password: '',
        base_currency: 'TRY',
        i_time_zone: 228,
        i_lang: 'tr'
      });
      loadDealers();
    } catch (error) {
      toast({ title: "Hata", description: error.message, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const handleToggleStatus = async (dealer) => {
    setLoading(true);
    try {
      const newStatus = dealer.status === 'Aktif' ? 'Pasif' : 'Aktif';
      await dealerService.setStatus(dealer.id, newStatus);
      toast({ title: "✅ Başarılı", description: `Bayi ${newStatus} yapıldı.` });
      loadDealers();
    } catch (error) {
      toast({ title: "Hata", description: error.message, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (dealerId) => {
    if (!window.confirm('Bu bayiyi silmek istediğinizden emin misiniz?')) return;
    
    setLoading(true);
    try {
      // Soft delete: mark as deleted, don't remove from list
      const updatedDealers = dealers.map(d => 
        d.id === dealerId ? { ...d, status: 'Silindi' } : d
      );
      setDealers(updatedDealers);
      
      toast({ title: "✅ Başarılı", description: "Bayi silindi." });
    } catch (error) {
      toast({ title: "Hata", description: error.message, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white shadow-sm border-b">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button variant="ghost" onClick={() => navigate('/admin/super-admin-panel')}>
                <ArrowLeft className="mr-2" size={20} />
                SUPER ADMIN
              </Button>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Bayi Yönetimi</h1>
                <p className="text-sm text-gray-600">Bayileri yönetin ve müşteri atayın</p>
              </div>
            </div>
            <Button onClick={() => setShowCreateModal(true)} className="bg-blue-600 hover:bg-blue-700">
              <Plus className="mr-2" size={18} />
              Yeni Bayi
            </Button>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <Card>
          <CardHeader>
            <CardTitle>Bayi Listesi ({dealers.length})</CardTitle>
          </CardHeader>
          <CardContent>
            {loading && !dealers.length ? (
              <div className="text-center py-8">
                <Loader2 className="mx-auto animate-spin text-blue-600" size={40} />
                <p className="text-gray-600 mt-2">Yükleniyor...</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="text-left py-3 px-4 font-semibold text-gray-700">Bayi Adı</th>
                      <th className="text-left py-3 px-4 font-semibold text-gray-700">Durum</th>
                      <th className="text-right py-3 px-4 font-semibold text-gray-700">Müşteri Sayısı</th>
                      <th className="text-center py-3 px-4 font-semibold text-gray-700">İşlemler</th>
                    </tr>
                  </thead>
                  <tbody>
                    {dealers.map(dealer => {
                      const isDeleted = dealer.status === 'Silindi';
                      const isActive = dealer.status === 'Aktif';
                      const isPasif = dealer.status === 'Pasif';
                      
                      return (
                        <tr key={dealer.id} className={`border-t ${isDeleted ? 'bg-red-50/50' : 'hover:bg-gray-50'}`}>
                          <td className={`py-3 px-4 font-medium ${isDeleted ? 'line-through text-red-400' : ''}`}>
                            {dealer.name}
                            {isDeleted && (
                              <span className="ml-2 px-2 py-0.5 bg-red-100 text-red-700 text-xs rounded">Silindi</span>
                            )}
                          </td>
                          <td className="py-3 px-4">
                            <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                              isActive ? 'bg-green-100 text-green-800' :
                              isPasif ? 'bg-red-100 text-red-800' :
                              isDeleted ? 'bg-gray-100 text-gray-500' :
                              'bg-gray-100 text-gray-800'
                            }`}>
                              {dealer.status}
                            </span>
                          </td>
                          <td className={`text-right py-3 px-4 ${isDeleted ? 'text-gray-400' : ''}`}>
                            {dealer.customerCount || 0}
                          </td>
                          <td className="text-center py-3 px-4">
                            <div className="flex gap-2 justify-center">
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => {
                                  if (isDeleted) {
                                    toast({ title: "Uyarı", description: "Silinmiş bayi düzenlenemez.", variant: "destructive" });
                                    return;
                                  }
                                  setEditingDealer(dealer);
                                  setFormData({
                                    name: dealer.name,
                                    web_login: '',
                                    web_password: '',
                                    base_currency: 'TRY',
                                    i_time_zone: 228,
                                    i_lang: 'tr'
                                  });
                                }}
                                disabled={isDeleted}
                                className={isDeleted ? 'opacity-50 cursor-not-allowed' : ''}
                              >
                                <Edit2 size={14} />
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => {
                                  if (isDeleted) {
                                    toast({ title: "Uyarı", description: "Silinmiş bayi durumu değiştirilemez.", variant: "destructive" });
                                    return;
                                  }
                                  handleToggleStatus(dealer);
                                }}
                                disabled={isDeleted}
                                className={
                                  isDeleted ? 'opacity-50 cursor-not-allowed' :
                                  isActive ? 'border-red-500 text-red-600' : 
                                  'border-green-500 text-green-600'
                                }
                              >
                                <Power size={14} />
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleDelete(dealer.id)}
                                disabled={isDeleted}
                                className={isDeleted ? 'opacity-50 cursor-not-allowed' : 'border-red-500 text-red-600 hover:bg-red-50'}
                              >
                                <Trash2 size={14} />
                              </Button>
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

      {/* Create/Edit Modal */}
      {(showCreateModal || editingDealer) && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <Card className="w-full max-w-md">
            <CardHeader>
              <CardTitle>{editingDealer ? 'Bayi Düzenle' : 'Yeni Bayi Oluştur'}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <Label>Bayi Adı *</Label>
                  <Input
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                    placeholder="Örnek Bayi A.Ş."
                    disabled={loading}
                  />
                </div>
                <div>
                  <Label>Web Girişi *</Label>
                  <Input
                    value={formData.web_login}
                    onChange={(e) => setFormData({...formData, web_login: e.target.value})}
                    placeholder="bayikullanici"
                    disabled={loading}
                  />
                  <p className="text-xs text-gray-500 mt-1">Bayi paneline giriş için kullanıcı adı</p>
                </div>
                <div>
                  <Label>Web Şifresi *</Label>
                  <Input
                    type="password"
                    value={formData.web_password}
                    onChange={(e) => setFormData({...formData, web_password: e.target.value})}
                    placeholder="En az 6 karakter"
                    disabled={loading}
                  />
                  <p className="text-xs text-gray-500 mt-1">Bayi paneline giriş için şifre (min. 6 karakter)</p>
                </div>
                <div>
                  <Label>Ana Para Birimi</Label>
                  <select
                    value={formData.base_currency}
                    onChange={(e) => setFormData({...formData, base_currency: e.target.value})}
                    disabled={loading}
                    className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="TRY">TRY - Türk Lirası</option>
                    <option value="USD">USD - Amerikan Doları</option>
                    <option value="EUR">EUR - Euro</option>
                    <option value="GBP">GBP - İngiliz Sterlini</option>
                  </select>
                </div>
                <div>
                  <Label>Zaman Dilimi</Label>
                  <select
                    value={formData.i_time_zone}
                    onChange={(e) => setFormData({...formData, i_time_zone: parseInt(e.target.value)})}
                    disabled={loading}
                    className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="228">Europe/Istanbul (UTC+3)</option>
                    <option value="207">Europe/London (UTC+0)</option>
                    <option value="336">America/New_York (UTC-5)</option>
                    <option value="346">America/Los_Angeles (UTC-8)</option>
                  </select>
                </div>
                <div>
                  <Label>Dil</Label>
                  <select
                    value={formData.i_lang}
                    onChange={(e) => setFormData({...formData, i_lang: e.target.value})}
                    disabled={loading}
                    className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="tr">Türkçe</option>
                    <option value="en">English</option>
                    <option value="de">Deutsch</option>
                    <option value="fr">Français</option>
                  </select>
                </div>
                <div className="flex gap-2 pt-4">
                  <Button
                    onClick={() => {
                      setShowCreateModal(false);
                      setEditingDealer(null);
                      setFormData({
                        name: '',
                        web_login: '',
                        web_password: '',
                        base_currency: 'TRY',
                        i_time_zone: 228,
                        i_lang: 'tr'
                      });
                    }}
                    variant="outline"
                    className="flex-1"
                    disabled={loading}
                  >
                    İptal
                  </Button>
                  <Button
                    onClick={editingDealer ? handleUpdate : handleCreate}
                    disabled={loading}
                    className="flex-1"
                  >
                    {loading ? <Loader2 className="mr-2 animate-spin" size={16} /> : null}
                    {editingDealer ? 'Güncelle' : 'Kaydet'}
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

export default DealerManagementPage;
