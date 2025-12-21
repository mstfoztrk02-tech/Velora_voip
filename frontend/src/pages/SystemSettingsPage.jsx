import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Settings, Mail, Server, Globe, Shield, AlertTriangle, Loader2, Power, Ban, UserX } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { useToast } from '../hooks/use-toast';

const SystemSettingsPage = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [settings, setSettings] = useState({
    smtp: { host: 'smtp.example.com', port: '587', username: 'noreply@velora.com' },
    codec: 'G.711',
    timezone: 'Europe/Istanbul'
  });
  const [emergencyStates, setEmergencyStates] = useState({
    maintenanceMode: false,
    allCallsBlocked: false,
    newRegistrationsBlocked: false,
    ipProtection: true
  });

  const handleSaveSettings = async () => {
    setLoading(true);
    await new Promise(resolve => setTimeout(resolve, 1000));
    toast({ title: "✅ Kaydedildi", description: "Sistem ayarları güncellendi." });
    setLoading(false);
  };

  const handleEmergencyAction = async (action, value) => {
    setLoading(true);
    await new Promise(resolve => setTimeout(resolve, 800));
    setEmergencyStates({...emergencyStates, [action]: value});
    
    const messages = {
      maintenanceMode: value ? 'Bakım modu açıldı' : 'Bakım modu kapatıldı',
      allCallsBlocked: value ? 'Tüm çağrılar durduruldu' : 'Çağrılar devam ediyor',
      newRegistrationsBlocked: value ? 'Yeni kayıtlar durduruldu' : 'Yeni kayıtlar açık',
      ipProtection: value ? 'IP koruması aktif' : 'IP koruması devre dışı'
    };
    
    toast({
      title: value ? "❗ Aktif" : "✅ Pasif",
      description: messages[action]
    });
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white shadow-sm border-b">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center gap-4">
            <Button variant="ghost" onClick={() => navigate('/admin/super-admin-panel')}>
              <ArrowLeft className="mr-2" size={20} />
              SUPER ADMIN
            </Button>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Sistem Ayarları</h1>
              <p className="text-sm text-gray-600">Genel yapılandırma ve acil işlemler</p>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8 space-y-6">
        {/* Emergency Actions */}
        <Card className="border-2 border-red-200 bg-red-50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-red-800">
              <AlertTriangle size={24} />
              Acil İşlemler / Quick Actions
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-white rounded-lg p-4 border">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <Power className="text-orange-600" size={20} />
                    <span className="font-semibold">Bakım Modu</span>
                  </div>
                  <span className={`text-xs px-2 py-1 rounded ${
                    emergencyStates.maintenanceMode ? 'bg-orange-100 text-orange-800' : 'bg-gray-100 text-gray-600'
                  }`}>
                    {emergencyStates.maintenanceMode ? 'Aktif' : 'Pasif'}
                  </span>
                </div>
                <Button
                  onClick={() => handleEmergencyAction('maintenanceMode', !emergencyStates.maintenanceMode)}
                  disabled={loading}
                  variant={emergencyStates.maintenanceMode ? "outline" : "default"}
                  className={emergencyStates.maintenanceMode ? "" : "bg-orange-600 hover:bg-orange-700"}
                  size="sm"
                >
                  {emergencyStates.maintenanceMode ? 'Kapat' : 'Aç'}
                </Button>
              </div>

              <div className="bg-white rounded-lg p-4 border">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <Ban className="text-red-600" size={20} />
                    <span className="font-semibold">Tüm Çağrıları Durdur</span>
                  </div>
                  <span className={`text-xs px-2 py-1 rounded ${
                    emergencyStates.allCallsBlocked ? 'bg-red-100 text-red-800' : 'bg-gray-100 text-gray-600'
                  }`}>
                    {emergencyStates.allCallsBlocked ? 'Durduruldu' : 'Aktif'}
                  </span>
                </div>
                <Button
                  onClick={() => handleEmergencyAction('allCallsBlocked', !emergencyStates.allCallsBlocked)}
                  disabled={loading}
                  variant={emergencyStates.allCallsBlocked ? "outline" : "default"}
                  className={emergencyStates.allCallsBlocked ? "" : "bg-red-600 hover:bg-red-700"}
                  size="sm"
                >
                  {emergencyStates.allCallsBlocked ? 'Devam Et' : 'Durdur'}
                </Button>
              </div>

              <div className="bg-white rounded-lg p-4 border">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <UserX className="text-yellow-600" size={20} />
                    <span className="font-semibold">Yeni Kayıtları Durdur</span>
                  </div>
                  <span className={`text-xs px-2 py-1 rounded ${
                    emergencyStates.newRegistrationsBlocked ? 'bg-yellow-100 text-yellow-800' : 'bg-gray-100 text-gray-600'
                  }`}>
                    {emergencyStates.newRegistrationsBlocked ? 'Kapatıldı' : 'Açık'}
                  </span>
                </div>
                <Button
                  onClick={() => handleEmergencyAction('newRegistrationsBlocked', !emergencyStates.newRegistrationsBlocked)}
                  disabled={loading}
                  variant={emergencyStates.newRegistrationsBlocked ? "outline" : "default"}
                  className={emergencyStates.newRegistrationsBlocked ? "" : "bg-yellow-600 hover:bg-yellow-700"}
                  size="sm"
                >
                  {emergencyStates.newRegistrationsBlocked ? 'Aç' : 'Kapat'}
                </Button>
              </div>

              <div className="bg-white rounded-lg p-4 border">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <Shield className="text-green-600" size={20} />
                    <span className="font-semibold">IP Koruması</span>
                  </div>
                  <span className={`text-xs px-2 py-1 rounded ${
                    emergencyStates.ipProtection ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-600'
                  }`}>
                    {emergencyStates.ipProtection ? 'Aktif' : 'Pasif'}
                  </span>
                </div>
                <Button
                  onClick={() => handleEmergencyAction('ipProtection', !emergencyStates.ipProtection)}
                  disabled={loading}
                  variant={emergencyStates.ipProtection ? "outline" : "default"}
                  className={emergencyStates.ipProtection ? "" : "bg-green-600 hover:bg-green-700"}
                  size="sm"
                >
                  {emergencyStates.ipProtection ? 'Kapat' : 'Aç'}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* SMTP Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Mail className="text-blue-600" size={24} />
              SMTP Ayarları
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label>SMTP Host</Label>
                  <Input
                    value={settings.smtp.host}
                    onChange={(e) => setSettings({...settings, smtp: {...settings.smtp, host: e.target.value}})}
                  />
                </div>
                <div>
                  <Label>Port</Label>
                  <Input
                    value={settings.smtp.port}
                    onChange={(e) => setSettings({...settings, smtp: {...settings.smtp, port: e.target.value}})}
                  />
                </div>
              </div>
              <div>
                <Label>Username</Label>
                <Input
                  value={settings.smtp.username}
                  onChange={(e) => setSettings({...settings, smtp: {...settings.smtp, username: e.target.value}})}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Other Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Server className="text-purple-600" size={24} />
              Diğer Ayarlar
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <Label>Codec</Label>
                <select
                  value={settings.codec}
                  onChange={(e) => setSettings({...settings, codec: e.target.value})}
                  className="w-full border rounded-md px-3 py-2"
                >
                  <option>G.711</option>
                  <option>G.729</option>
                  <option>Opus</option>
                </select>
              </div>
              <div>
                <Label>Timezone</Label>
                <Input
                  value={settings.timezone}
                  onChange={(e) => setSettings({...settings, timezone: e.target.value})}
                />
              </div>
              <Button onClick={handleSaveSettings} disabled={loading}>
                {loading ? <Loader2 className="mr-2 animate-spin" size={16} /> : null}
                Ayarları Kaydet
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default SystemSettingsPage;