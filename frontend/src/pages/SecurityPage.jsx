import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Shield, Plus, Trash2, Power, Loader2 } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { useToast } from '../hooks/use-toast';
import securityService from '../services/securityService';

const SecurityPage = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [whitelist, setWhitelist] = useState([]);
  const [blacklist, setBlacklist] = useState([]);
  const [activeSessions, setActiveSessions] = useState([]);
  const [newIP, setNewIP] = useState({ ip: '', description: '' });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [whitelistData, blacklistData, sessionsData] = await Promise.all([
        securityService.getIPWhitelist(),
        securityService.getIPBlacklist(),
        securityService.getActiveSessions()
      ]);
      setWhitelist(whitelistData);
      setBlacklist(blacklistData);
      setActiveSessions(sessionsData);
    } catch (error) {
      toast({ title: "Hata", description: "Veriler yüklenemedi.", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const handleAddToWhitelist = async () => {
    if (!newIP.ip) {
      toast({ title: "Hata", description: "IP adresi gerekli.", variant: "destructive" });
      return;
    }
    setLoading(true);
    try {
      await securityService.addToWhitelist(newIP);
      toast({ title: "✅ Eklendi", description: "IP whitelist'e eklendi." });
      setNewIP({ ip: '', description: '' });
      loadData();
    } catch (error) {
      toast({ title: "Hata", description: error.message, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const handleLogoutAll = async () => {
    if (!window.confirm('Tüm oturumları kapatmak istediğinizden emin misiniz?')) return;
    setLoading(true);
    try {
      await securityService.logoutAllSessions();
      toast({ title: "✅ Başarılı", description: "Tüm oturumlar kapatıldı." });
      loadData();
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
                <h1 className="text-3xl font-bold text-gray-900">Güvenlik Ayarları</h1>
                <p className="text-sm text-gray-600">IP yönetimi ve oturum kontrolü</p>
              </div>
            </div>
            <Button
              onClick={handleLogoutAll}
              disabled={loading}
              className="bg-red-600 hover:bg-red-700"
            >
              <Power className="mr-2" size={18} />
              Tüm Oturumları Kapat
            </Button>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8 space-y-6">
        {/* Whitelist */}
        <Card>
          <CardHeader>
            <CardTitle>IP Whitelist ({whitelist.length})</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="mb-4 flex gap-2">
              <Input
                placeholder="192.168.1.100"
                value={newIP.ip}
                onChange={(e) => setNewIP({...newIP, ip: e.target.value})}
              />
              <Input
                placeholder="Açıklama"
                value={newIP.description}
                onChange={(e) => setNewIP({...newIP, description: e.target.value})}
              />
              <Button onClick={handleAddToWhitelist} disabled={loading}>
                <Plus size={18} />
              </Button>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="text-left py-2 px-3 text-sm font-semibold">IP Adresi</th>
                    <th className="text-left py-2 px-3 text-sm font-semibold">Açıklama</th>
                    <th className="text-left py-2 px-3 text-sm font-semibold">Eklenme</th>
                  </tr>
                </thead>
                <tbody>
                  {whitelist.map(item => (
                    <tr key={item.id} className="border-t hover:bg-gray-50">
                      <td className="py-2 px-3 font-mono text-sm">{item.ip}</td>
                      <td className="py-2 px-3 text-sm">{item.description}</td>
                      <td className="py-2 px-3 text-xs text-gray-600">{item.addedAt}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>

        {/* Active Sessions */}
        <Card>
          <CardHeader>
            <CardTitle>Aktif Oturumlar ({activeSessions.length})</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="text-left py-2 px-3 text-sm font-semibold">Kullanıcı</th>
                    <th className="text-left py-2 px-3 text-sm font-semibold">IP</th>
                    <th className="text-left py-2 px-3 text-sm font-semibold">Son Aktivite</th>
                  </tr>
                </thead>
                <tbody>
                  {activeSessions.map(session => (
                    <tr key={session.id} className="border-t hover:bg-gray-50">
                      <td className="py-2 px-3 text-sm font-medium">{session.username}</td>
                      <td className="py-2 px-3 text-sm font-mono">{session.ip}</td>
                      <td className="py-2 px-3 text-xs text-gray-600">{session.lastActivity}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default SecurityPage;