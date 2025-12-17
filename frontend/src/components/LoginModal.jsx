import React, { useState } from 'react';
import { X } from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { useToast } from '../hooks/use-toast';

const LoginModal = ({ isOpen, onClose }) => {
  const { toast } = useToast();
  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    companyName: '',
    taxNumber: ''
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (isLogin) {
      // Login logic
      if (formData.email && formData.password) {
        toast({
          title: "Giriş Başarılı",
          description: "Velora Online İşlem Merkezi'ne yönlendiriliyorsunuz...",
        });
        setTimeout(() => {
          onClose();
          setFormData({ email: '', password: '', companyName: '', taxNumber: '' });
        }, 1500);
      } else {
        toast({
          title: "Hata",
          description: "Lütfen tüm alanları doldurun.",
          variant: "destructive"
        });
      }
    } else {
      // Register logic
      if (formData.email && formData.password && formData.companyName && formData.taxNumber) {
        toast({
          title: "Kayıt Başarılı",
          description: "Hesabınız oluşturuldu. Giriş yapabilirsiniz.",
        });
        setIsLogin(true);
        setFormData({ email: '', password: '', companyName: '', taxNumber: '' });
      } else {
        toast({
          title: "Hata",
          description: "Lütfen tüm alanları doldurun.",
          variant: "destructive"
        });
      }
    }
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex justify-between items-center p-6 border-b">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">
              {isLogin ? 'Giriş Yap' : 'Ücretsiz Başlayın'}
            </h2>
            <p className="text-sm text-gray-600 mt-1">
              {isLogin ? 'Velora Online İşlem Merkezi' : 'Hemen hesabınızı oluşturun'}
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X size={24} />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {!isLogin && (
            <>
              <div className="space-y-2">
                <Label htmlFor="companyName">Şirket Adı *</Label>
                <Input
                  id="companyName"
                  name="companyName"
                  type="text"
                  value={formData.companyName}
                  onChange={handleChange}
                  placeholder="Şirket adınızı girin"
                  required={!isLogin}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="taxNumber">Vergi Numarası / Vergi Levhası *</Label>
                <Input
                  id="taxNumber"
                  name="taxNumber"
                  type="text"
                  value={formData.taxNumber}
                  onChange={handleChange}
                  placeholder="Vergi numaranızı girin"
                  required={!isLogin}
                />
              </div>
            </>
          )}
          
          <div className="space-y-2">
            <Label htmlFor="email">E-posta Adresi *</Label>
            <Input
              id="email"
              name="email"
              type="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="ornek@sirket.com"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="password">Şifre *</Label>
            <Input
              id="password"
              name="password"
              type="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="********"
              required
            />
          </div>

          {isLogin && (
            <div className="flex items-center justify-between text-sm">
              <label className="flex items-center gap-2">
                <input type="checkbox" className="rounded" />
                <span className="text-gray-600">Beni Hatırla</span>
              </label>
              <a href="#" className="text-blue-600 hover:text-blue-700 font-medium">
                Şifremi Unuttum
              </a>
            </div>
          )}

          {!isLogin && (
            <div className="text-xs text-gray-600">
              <label className="flex items-start gap-2">
                <input type="checkbox" required className="mt-1" />
                <span>
                  <a href="#" className="text-blue-600 hover:underline">Kullanım Koşulları</a>,{' '}
                  <a href="#" className="text-blue-600 hover:underline">Gizlilik Politikası</a> ve{' '}
                  <a href="#" className="text-blue-600 hover:underline">KVKK</a> metnini okudum, kabul ediyorum.
                </span>
              </label>
            </div>
          )}

          <Button
            type="submit"
            className="w-full bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white py-6 text-lg font-semibold"
          >
            {isLogin ? 'Giriş Yap' : 'Hesap Oluştur'}
          </Button>

          <div className="text-center text-sm text-gray-600">
            {isLogin ? (
              <>
                Hesabınız yok mu?{' '}
                <button
                  type="button"
                  onClick={() => setIsLogin(false)}
                  className="text-blue-600 hover:text-blue-700 font-semibold"
                >
                  Ücretsiz Kayıt Olun
                </button>
              </>
            ) : (
              <>
                Zaten hesabınız var mı?{' '}
                <button
                  type="button"
                  onClick={() => setIsLogin(true)}
                  className="text-blue-600 hover:text-blue-700 font-semibold"
                >
                  Giriş Yapın
                </button>
              </>
            )}
          </div>
        </form>

        {/* Footer Info */}
        <div className="bg-gray-50 p-6 border-t">
          <p className="text-xs text-gray-600 text-center">
            Bireysel abonelere hizmet verilmemektedir. Abonelik başvurusu için vergi levhasına sahip olmak zorunludur.
          </p>
        </div>
      </div>
    </div>
  );
};

export default LoginModal;
