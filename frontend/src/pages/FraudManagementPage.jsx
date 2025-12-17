import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Ban, CheckCircle, Plus, Trash2, Sliders, Loader2 } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { useToast } from '../hooks/use-toast';

const FraudManagementPage = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [blocklist, setBlocklist] = useState([
    { id: '1', number: '+90 212 555 9999', reason: 'Spam', date: '2025-01-10' },
    { id: '2', number: '+90 312 444 8888', reason: 'Fraud', date: '2025-01-12' }
  ]);
  const [whitelist, setWhitelist] = useState([
    { id: '1', number: '+90 212 555 0001', reason: 'İstisna', date: '2025-01-05' }
  ]);
  const [thresholds, setThresholds] = useState({
    maxCallsPerMin: 10,
    maxFailedAttempts: 5,
    spamScoreLimit: 75
  });

  const handleAddToBlocklist = async () => {
    setLoading(true);
    await new Promise(resolve => setTimeout(resolve, 800));
    toast({ title: "✅ Eklendi", description: "Numara blok listesine eklendi." });
    setLoading(false);
  };

  const handleRemoveFromBlocklist = async (id) => {
    setLoading(true);
    await new Promise(resolve => setTimeout(resolve, 500));
    setBlocklist(blocklist.filter(item => item.id !== id));
    toast({ title: "✅ Kaldırıldı", description: "Numara blok listesinden kaldırıldı." });
    setLoading(false);
  };

  const handleSaveThresholds = async () => {
    setLoading(true);
    await new Promise(resolve => setTimeout(resolve, 1000));
    toast({ title: "✅ Kaydedildi", description: "Eşik değerleri güncellendi." });
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
              <h1 className="text-3xl font-bold text-gray-900">Spam / Fraud Yönetimi</h1>
              <p className="text-sm text-gray-600">Blok listesi, whitelist ve eşik ayarları</p>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8 space-y-6">
        {/* Blocklist */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <Ban className="text-red-600" size={24} />
                Blok Listesi ({blocklist.length})
              </CardTitle>
              <Button className="bg-red-600 hover:bg-red-700" onClick={handleAddToBlocklist} disabled={loading}>
                <Plus className="mr-2" size={18} />
                Numara Ekle
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="text-left py-3 px-4 font-semibold text-gray-700">Numara</th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-700">Sebep</th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-700">Tarih</th>
                    <th className="text-center py-3 px-4 font-semibold text-gray-700">İşlem</th>
                  </tr>
                </thead>
                <tbody>
                  {blocklist.map(item => (
                    <tr key={item.id} className="border-t hover:bg-gray-50">
                      <td className="py-3 px-4 font-mono text-sm">{item.number}</td>
                      <td className="py-3 px-4">
                        <span className="px-2 py-1 bg-red-100 text-red-800 rounded text-xs">{item.reason}</span>
                      </td>
                      <td className="py-3 px-4 text-sm text-gray-600">{item.date}</td>
                      <td className="text-center py-3 px-4">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleRemoveFromBlocklist(item.id)}
                          disabled={loading}
                        >
                          <Trash2 size={14} />
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>

        {/* Whitelist */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CheckCircle className="text-green-600" size={24} />
              Whitelist (İstisna Listesi) ({whitelist.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="text-left py-3 px-4 font-semibold text-gray-700">Numara</th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-700">Açıklama</th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-700">Tarih</th>
                  </tr>
                </thead>
                <tbody>
                  {whitelist.map(item => (
                    <tr key={item.id} className="border-t hover:bg-gray-50">
                      <td className="py-3 px-4 font-mono text-sm">{item.number}</td>
                      <td className="py-3 px-4 text-sm">{item.reason}</td>
                      <td className="py-3 px-4 text-sm text-gray-600">{item.date}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>

        {/* Thresholds */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Sliders className="text-blue-600" size={24} />
              Eşik Ayarları
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <Label>Dakika Başına Max Çağrı Sayısı</Label>
                <Input
                  type="number"
                  value={thresholds.maxCallsPerMin}
                  onChange={(e) => setThresholds({...thresholds, maxCallsPerMin: parseInt(e.target.value)})}
                  className="w-32"
                />
              </div>
              <div>
                <Label>Max Başarısız Deneme</Label>
                <Input
                  type="number"
                  value={thresholds.maxFailedAttempts}
                  onChange={(e) => setThresholds({...thresholds, maxFailedAttempts: parseInt(e.target.value)})}
                  className="w-32"
                />
              </div>
              <div>
                <Label>Spam Skor Limiti (%)</Label>
                <Input
                  type="number"
                  value={thresholds.spamScoreLimit}
                  onChange={(e) => setThresholds({...thresholds, spamScoreLimit: parseInt(e.target.value)})}
                  className="w-32"
                />
              </div>
              <Button onClick={handleSaveThresholds} disabled={loading}>
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

export default FraudManagementPage;