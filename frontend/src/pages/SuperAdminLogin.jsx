import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Crown, Lock, Loader2 } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { useToast } from '../hooks/use-toast';
import authService from '../services/authService';

const SuperAdminLogin = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [credentials, setCredentials] = useState({ username: '', password: '' });

  useEffect(() => {
    // If already super admin, redirect to panel
    if (authService.isSuperAdmin()) {
      navigate('/admin/super-admin-panel');
    }
  }, [navigate]);

  const handleLogin = async (e) => {
    e.preventDefault();
    
    if (!credentials.username || !credentials.password) {
      toast({
        title: "Hata",
        description: "Lütfen tüm alanları doldurun.",
        variant: "destructive"
      });
      return;
    }

    setLoading(true);
    
    // Simulate login - check for super admin credentials
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Demo credentials: admin / admin123
    if (credentials.username === 'admin' && credentials.password === 'admin123') {
      // Set super admin in localStorage
      const userData = {
        username: credentials.username,
        type: 'super_admin',
        verified: true,
        loginTime: Date.now(),
        demo: true,
        permissions: ['*']
      };
      
      localStorage.setItem('auth_user', JSON.stringify(userData));
      
      toast({
        title: "✅ Giriş Başarılı",
        description: "Super Admin paneline yönlendiriliyorsunuz..."
      });
      
      setTimeout(() => {
        navigate('/admin/super-admin-panel');
      }, 500);
    } else {
      toast({
        title: "❌ Hata",
        description: "Kullanıcı adı veya şifre hatalı.",
        variant: "destructive"
      });
    }
    
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-pink-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <div className="flex items-center justify-center mb-4">
            <div className="bg-gradient-to-r from-purple-600 to-pink-600 p-4 rounded-full">
              <Crown className="text-white" size={48} />
            </div>
          </div>
          <CardTitle className="text-center text-2xl">Super Admin Girişi</CardTitle>
          <p className="text-center text-sm text-gray-600 mt-2">
            Site yönetim paneline erişim
          </p>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <Label>Kullanıcı Adı</Label>
              <Input
                type="text"
                placeholder="admin"
                value={credentials.username}
                onChange={(e) => setCredentials({...credentials, username: e.target.value})}
                disabled={loading}
              />
            </div>
            
            <div>
              <Label>Şifre</Label>
              <Input
                type="password"
                placeholder="••••••••"
                value={credentials.password}
                onChange={(e) => setCredentials({...credentials, password: e.target.value})}
                disabled={loading}
              />
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 text-sm">
              <p className="text-blue-800 font-semibold mb-1">DEMO Bilgileri:</p>
              <p className="text-blue-700">Kullanıcı: <code className="bg-blue-100 px-2 py-0.5 rounded">admin</code></p>
              <p className="text-blue-700">Şifre: <code className="bg-blue-100 px-2 py-0.5 rounded">admin123</code></p>
            </div>

            <Button
              type="submit"
              className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
              disabled={loading}
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 animate-spin" size={18} />
                  Giriş Yapılıyor...
                </>
              ) : (
                <>
                  <Lock className="mr-2" size={18} />
                  Giriş Yap
                </>
              )}
            </Button>

            <div className="text-center">
              <Button
                type="button"
                variant="link"
                onClick={() => navigate('/')}
                className="text-sm"
              >
                Ana Sayfaya Dön
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default SuperAdminLogin;
