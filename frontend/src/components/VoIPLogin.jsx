import React, { useState } from 'react';
import { Shield, Phone, Building2, AlertCircle } from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import authService, { DEMO_CODES } from '../services/authService';
import { useToast } from '../hooks/use-toast';

const VoIPLogin = ({ onLoginSuccess }) => {
  const { toast } = useToast();
  const [loginType, setLoginType] = useState('bireysel'); // bireysel, kurumsal
  const [step, setStep] = useState(1); // 1: phone/company, 2: verification
  const [loading, setLoading] = useState(false);
  
  const [formData, setFormData] = useState({
    phone: '',
    companyName: '',
    username: '',
    verificationCode: ''
  });

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handlePhoneSubmit = (e) => {
    e.preventDefault();
    if (formData.phone.length >= 10) {
      setStep(2);
    } else {
      toast({
        title: "Hata",
        description: "Lütfen geçerli bir telefon numarası girin.",
        variant: "destructive"
      });
    }
  };

  const handleCorporateSubmit = (e) => {
    e.preventDefault();
    if (formData.companyName && formData.username) {
      setStep(2);
    } else {
      toast({
        title: "Hata",
        description: "Lütfen tüm alanları doldurun.",
        variant: "destructive"
      });
    }
  };

  const handleVerification = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      let result;
      if (loginType === 'bireysel') {
        result = await authService.verifyCode(formData.phone, formData.verificationCode, 'bireysel');
      } else {
        result = await authService.verifyCorporateCode(
          formData.companyName,
          formData.username,
          formData.verificationCode
        );
      }

      toast({
        title: "Başarılı",
        description: "Giriş yapıldı, yönlendiriliyorsunuz..."
      });

      setTimeout(() => {
        onLoginSuccess(result.user);
      }, 500);

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
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        {/* Demo Badge */}
        <div className="text-center mb-4">
          <span className="inline-flex items-center gap-2 bg-yellow-100 text-yellow-800 px-4 py-2 rounded-full text-sm font-semibold">
            <Shield size={16} />
            DEMO SİSTEM
          </span>
        </div>

        <div className="bg-white rounded-2xl shadow-2xl p-8">
          {/* Logo */}
          <div className="text-center mb-6">
            <div className="bg-gradient-to-r from-blue-500 to-blue-600 text-white px-6 py-3 rounded-lg font-bold text-2xl inline-block mb-3">
              Velora
            </div>
            <h2 className="text-2xl font-bold text-gray-900">VoIP CRM Giriş</h2>
            <p className="text-sm text-gray-600 mt-1">Güvenli doğrulama ile giriş yapın</p>
          </div>

          {/* Login Type Selection */}
          {step === 1 && (
            <div className="space-y-4 mb-6">
              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={() => setLoginType('bireysel')}
                  className={`p-4 rounded-xl border-2 transition-all ${
                    loginType === 'bireysel'
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-200 hover:border-blue-300'
                  }`}
                >
                  <Phone className={`mx-auto mb-2 ${loginType === 'bireysel' ? 'text-blue-600' : 'text-gray-400'}`} size={32} />
                  <div className="text-sm font-semibold">Bireysel</div>
                </button>
                
                <button
                  onClick={() => setLoginType('kurumsal')}
                  className={`p-4 rounded-xl border-2 transition-all ${
                    loginType === 'kurumsal'
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-200 hover:border-blue-300'
                  }`}
                >
                  <Building2 className={`mx-auto mb-2 ${loginType === 'kurumsal' ? 'text-blue-600' : 'text-gray-400'}`} size={32} />
                  <div className="text-sm font-semibold">Kurumsal</div>
                </button>
              </div>
            </div>
          )}

          {/* Forms */}
          {step === 1 && loginType === 'bireysel' && (
            <form onSubmit={handlePhoneSubmit} className="space-y-4">
              <div>
                <Label>Telefon Numarası</Label>
                <Input
                  type="tel"
                  placeholder="+90 5XX XXX XX XX"
                  value={formData.phone}
                  onChange={(e) => handleChange('phone', e.target.value)}
                  required
                />
              </div>
              <Button type="submit" className="w-full bg-gradient-to-r from-blue-500 to-blue-600">
                Doğrulama Kodu Gönder
              </Button>
            </form>
          )}

          {step === 1 && loginType === 'kurumsal' && (
            <form onSubmit={handleCorporateSubmit} className="space-y-4">
              <div>
                <Label>Firma Adı</Label>
                <Input
                  placeholder="Şirket Adı"
                  value={formData.companyName}
                  onChange={(e) => handleChange('companyName', e.target.value)}
                  required
                />
              </div>
              <div>
                <Label>Kullanıcı Adı</Label>
                <Input
                  placeholder="kullanici@sirket.com"
                  value={formData.username}
                  onChange={(e) => handleChange('username', e.target.value)}
                  required
                />
              </div>
              <Button type="submit" className="w-full bg-gradient-to-r from-blue-500 to-blue-600">
                Doğrulama Kodu Gönder
              </Button>
            </form>
          )}

          {step === 2 && (
            <form onSubmit={handleVerification} className="space-y-4">
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
                <div className="flex items-start gap-2">
                  <AlertCircle className="text-blue-600 flex-shrink-0 mt-0.5" size={20} />
                  <div className="text-sm text-blue-800">
                    <p className="font-semibold mb-1">DEMO Doğrulama Kodları:</p>
                    <p>Bireysel: <code className="bg-blue-100 px-2 py-0.5 rounded">{DEMO_CODES.bireysel}</code></p>
                    <p>Kurumsal: <code className="bg-blue-100 px-2 py-0.5 rounded">{DEMO_CODES.kurumsal}</code></p>
                  </div>
                </div>
              </div>

              <div>
                <Label>Doğrulama Kodu</Label>
                <Input
                  type="text"
                  placeholder="6 haneli kod"
                  maxLength={6}
                  value={formData.verificationCode}
                  onChange={(e) => handleChange('verificationCode', e.target.value)}
                  className="text-center text-2xl tracking-widest"
                  required
                />
              </div>

              <div className="flex gap-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setStep(1)}
                  className="flex-1"
                >
                  Geri
                </Button>
                <Button
                  type="submit"
                  disabled={loading || formData.verificationCode.length !== 6}
                  className="flex-1 bg-gradient-to-r from-blue-500 to-blue-600"
                >
                  {loading ? 'Doğrulanıyor...' : 'Giriş Yap'}
                </Button>
              </div>
            </form>
          )}

          {/* Rate Limit Info */}
          <div className="mt-6 text-center text-xs text-gray-500">
            <p>🔒 Güvenli giriş: 3 yanlış denemeden sonra 5 dakika kilitleme</p>
          </div>
        </div>

        {/* API Info */}
        <div className="mt-4 text-center text-xs text-gray-400">
          <p>İleride gerçek OTP sistemi entegre edilecek</p>
          <p className="mt-1">Settings'ten API endpoint yapılandırılabilir</p>
        </div>
      </div>
    </div>
  );
};

export default VoIPLogin;
