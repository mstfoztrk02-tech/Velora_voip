import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Plus, Server, CheckCircle, XCircle, Loader2 } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { useToast } from '../hooks/use-toast';
import trunkService from '../services/trunkService';

const TrunkManagementPage = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [trunks, setTrunks] = useState([]);
  const [numbers, setNumbers] = useState([]);
  const [testingTrunk, setTestingTrunk] = useState(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [trunksData, numbersData] = await Promise.all([
        trunkService.getTrunks(),
        trunkService.getNumbers()
      ]);
      setTrunks(trunksData);
      setNumbers(numbersData);
    } catch (error) {
      toast({ title: "Hata", description: "Veriler yüklenemedi.", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const handleTestTrunk = async (trunkId) => {
    setTestingTrunk(trunkId);
    try {
      const result = await trunkService.testTrunk(trunkId);
      if (result.status === 'online') {
        toast({ title: "✅ Online", description: "Trunk bağlantısı başarılı." });
      } else {
        toast({ title: "❌ Offline", description: "Trunk bağlantısı başarısız.", variant: "destructive" });
      }
    } catch (error) {
      toast({ title: "Hata", description: error.message, variant: "destructive" });
    } finally {
      setTestingTrunk(null);
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
                <h1 className="text-3xl font-bold text-gray-900">Trunk & Numara Yönetimi</h1>
                <p className="text-sm text-gray-600">Trunk yapılandırması ve numara atama</p>
              </div>
            </div>
            <Button className="bg-blue-600 hover:bg-blue-700">
              <Plus className="mr-2" size={18} />
              Yeni Trunk
            </Button>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        {/* Trunks */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Trunk Listesi ({trunks.length})</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="text-left py-3 px-4 font-semibold text-gray-700">Trunk Adı</th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-700">IP:Port</th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-700">Durum</th>
                    <th className="text-right py-3 px-4 font-semibold text-gray-700">Max Calls</th>
                    <th className="text-center py-3 px-4 font-semibold text-gray-700">İşlemler</th>
                  </tr>
                </thead>
                <tbody>
                  {trunks.map(trunk => (
                    <tr key={trunk.id} className="border-t hover:bg-gray-50">
                      <td className="py-3 px-4 font-medium">{trunk.name}</td>
                      <td className="py-3 px-4">{trunk.ip}:{trunk.port}</td>
                      <td className="py-3 px-4">
                        <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                          trunk.status === 'Online' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                        }`}>
                          {trunk.status}
                        </span>
                      </td>
                      <td className="text-right py-3 px-4">{trunk.maxCalls}</td>
                      <td className="text-center py-3 px-4">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleTestTrunk(trunk.id)}
                          disabled={testingTrunk === trunk.id}
                        >
                          {testingTrunk === trunk.id ? (
                            <Loader2 className="animate-spin" size={14} />
                          ) : (
                            <CheckCircle size={14} />
                          )}
                          <span className="ml-1">Test</span>
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>

        {/* Numbers */}
        <Card>
          <CardHeader>
            <CardTitle>Numara Bloğu ({numbers.length})</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="text-left py-3 px-4 font-semibold text-gray-700">Numara</th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-700">Durum</th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-700">Atandı</th>
                  </tr>
                </thead>
                <tbody>
                  {numbers.map(num => (
                    <tr key={num.id} className="border-t hover:bg-gray-50">
                      <td className="py-3 px-4 font-medium">{num.number}</td>
                      <td className="py-3 px-4">
                        <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                          num.status === 'Boş' ? 'bg-gray-100 text-gray-800' : 'bg-blue-100 text-blue-800'
                        }`}>
                          {num.status}
                        </span>
                      </td>
                      <td className="py-3 px-4">{num.assignedTo || '-'}</td>
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

export default TrunkManagementPage;