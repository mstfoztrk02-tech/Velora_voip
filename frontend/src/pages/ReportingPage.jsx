import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, FileText, Download, Filter, Loader2 } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { useToast } from '../hooks/use-toast';
import reportingService from '../services/reportingService';

const ReportingPage = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [auditLogs, setAuditLogs] = useState([]);
  const [filter, setFilter] = useState('');

  useEffect(() => {
    loadAuditLogs();
  }, []);

  const loadAuditLogs = async () => {
    setLoading(true);
    try {
      const data = await reportingService.getAuditLogs();
      setAuditLogs(data);
    } catch (error) {
      toast({ title: "Hata", description: "Loglar yüklenemedi.", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const handleExport = async () => {
    setLoading(true);
    try {
      const result = await reportingService.exportAuditLogs({ filter });
      toast({ title: "✅ Dışa Aktarıldı", description: "Audit loglar CSV olarak indirildi." });
    } catch (error) {
      toast({ title: "Hata", description: error.message, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const filteredLogs = auditLogs.filter(log =>
    log.user.toLowerCase().includes(filter.toLowerCase()) ||
    log.action.toLowerCase().includes(filter.toLowerCase()) ||
    log.target.toLowerCase().includes(filter.toLowerCase())
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
                <h1 className="text-3xl font-bold text-gray-900">Raporlama & Audit Log</h1>
                <p className="text-sm text-gray-600">Sistem aktivitelerini görüntüleyin</p>
              </div>
            </div>
            <Button onClick={handleExport} disabled={loading} variant="outline">
              <Download className="mr-2" size={18} />
              CSV Dışa Aktar
            </Button>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Audit Loglar ({filteredLogs.length})</CardTitle>
              <div className="flex items-center gap-2">
                <Filter size={18} className="text-gray-400" />
                <Input
                  placeholder="Kullanıcı, aksiyon veya hedef ara..."
                  value={filter}
                  onChange={(e) => setFilter(e.target.value)}
                  className="w-64"
                />
              </div>
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
                      <th className="text-left py-3 px-4 font-semibold text-gray-700">Zaman</th>
                      <th className="text-left py-3 px-4 font-semibold text-gray-700">Kullanıcı</th>
                      <th className="text-left py-3 px-4 font-semibold text-gray-700">Aksiyon</th>
                      <th className="text-left py-3 px-4 font-semibold text-gray-700">Hedef</th>
                      <th className="text-left py-3 px-4 font-semibold text-gray-700">IP</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredLogs.map(log => (
                      <tr key={log.id} className="border-t hover:bg-gray-50">
                        <td className="py-3 px-4 text-xs text-gray-600">{log.timestamp}</td>
                        <td className="py-3 px-4 font-medium">{log.user}</td>
                        <td className="py-3 px-4 text-sm">{log.action}</td>
                        <td className="py-3 px-4 text-sm text-gray-600">{log.target}</td>
                        <td className="py-3 px-4 text-xs font-mono text-gray-500">{log.ip}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ReportingPage;