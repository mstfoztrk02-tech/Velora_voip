import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Plus, Building2, Edit2, Trash2, Power, Loader2, UserPlus, Package } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { useToast } from '../hooks/use-toast';
import tenantService from '../services/tenantService';

const TenantManagementPage = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [tenants, setTenants] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [formData, setFormData] = useState({ name: '', contact: '', email: '' });

  useEffect(() => {
    loadTenants();
  }, []);

  const loadTenants = async () => {
    setLoading(true);
    try {
      const data = await tenantService.getTenants();
      setTenants(data);
    } catch (error) {
      toast({ title: "Hata", description: "Müşteriler yüklenemedi.", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async () => {
    if (!formData.name || !formData.contact) {
      toast({ title: "Hata", description: "Lütfen tüm alanları doldurun.", variant: "destructive" });
      return;
    }

    setLoading(true);
    try {
      await tenantService.createTenant(formData);
      toast({ title: "✅ Başarılı", description: "Müşteri oluşturuldu." });
      setShowCreateModal(false);
      setFormData({ name: '', contact: '', email: '' });
      loadTenants();
    } catch (error) {
      toast({ title: "Hata", description: error.message, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (tenantId) => {
    if (!window.confirm('Bu müşteriyi silmek istediğinizden emin misiniz?')) return;
    
    setLoading(true);
    try {
      await tenantService.deleteTenant(tenantId);
      toast({ title: "✅ Başarılı", description: "Müşteri silindi." });
      loadTenants();
    } catch (error) {
      toast({ title: "Hata", description: error.message, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const filteredTenants = tenants.filter(t =>
    t.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

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
                <h1 className="text-3xl font-bold text-gray-900">Müşteri Yönetimi</h1>
                <p className="text-sm text-gray-600">Tenant'ları yönetin, paket ve bayi atayın</p>
              </div>
            </div>
            <Button onClick={() => setShowCreateModal(true)} className="bg-blue-600 hover:bg-blue-700">
              <Plus className="mr-2" size={18} />
              Yeni Müşteri
            </Button>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Müşteri Listesi ({filteredTenants.length})</CardTitle>
              <Input
                placeholder="Müşteri ara..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-64"
              />
            </div>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="text-center py-8">
                <Loader2 className="mx-auto animate-spin text-blue-600" size={40} />
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="text-left py-3 px-4 font-semibold text-gray-700">Müşteri</th>
                      <th className="text-left py-3 px-4 font-semibold text-gray-700">Paket</th>
                      <th className="text-left py-3 px-4 font-semibold text-gray-700">Durum</th>
                      <th className="text-right py-3 px-4 font-semibold text-gray-700">Kullanıcı</th>
                      <th className="text-center py-3 px-4 font-semibold text-gray-700">İşlemler</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredTenants.map(tenant => (
                      <tr key={tenant.id} className="border-t hover:bg-gray-50">
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-2">
                            <Building2 size={18} className="text-blue-600" />
                            <span className="font-medium">{tenant.name}</span>
                          </div>
                        </td>
                        <td className="py-3 px-4">
                          <span className="px-3 py-1 rounded-full text-xs font-semibold bg-purple-100 text-purple-800">
                            {tenant.package}
                          </span>
                        </td>
                        <td className="py-3 px-4">
                          <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                            tenant.status === 'Aktif' ? 'bg-green-100 text-green-800' :
                            tenant.status === 'Beklemede' ? 'bg-yellow-100 text-yellow-800' :
                            'bg-gray-100 text-gray-800'
                          }`}>
                            {tenant.status}
                          </span>
                        </td>
                        <td className="text-right py-3 px-4">{tenant.users}</td>
                        <td className="text-center py-3 px-4">
                          <div className="flex gap-2 justify-center">
                            <Button size="sm" variant="outline" title="Paket Ata">
                              <Package size={14} />
                            </Button>
                            <Button size="sm" variant="outline" title="Bayi Ata">
                              <UserPlus size={14} />
                            </Button>
                            <Button size="sm" variant="outline">
                              <Edit2 size={14} />
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleDelete(tenant.id)}
                              className="border-red-500 text-red-600 hover:bg-red-50"
                            >
                              <Trash2 size={14} />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Create Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <Card className="w-full max-w-md">
            <CardHeader>
              <CardTitle>Yeni Müşteri Oluştur</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <Label>Müşteri Adı</Label>
                  <Input
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                    placeholder="Şirket A"
                  />
                </div>
                <div>
                  <Label>İletişim Kişisi</Label>
                  <Input
                    value={formData.contact}
                    onChange={(e) => setFormData({...formData, contact: e.target.value})}
                    placeholder="Ahmet Yılmaz"
                  />
                </div>
                <div>
                  <Label>Email</Label>
                  <Input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({...formData, email: e.target.value})}
                    placeholder="ahmet@sirket.com"
                  />
                </div>
                <div className="flex gap-2 pt-2">
                  <Button
                    onClick={() => {
                      setShowCreateModal(false);
                      setFormData({ name: '', contact: '', email: '' });
                    }}
                    variant="outline"
                    className="flex-1"
                  >
                    İptal
                  </Button>
                  <Button
                    onClick={handleCreate}
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

export default TenantManagementPage;