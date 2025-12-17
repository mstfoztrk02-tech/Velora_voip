import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Check } from 'lucide-react';
import Header from '../components/Header';
import Footer from '../components/Footer';
import { Button } from '../components/ui/button';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../components/ui/card';

const Pricing = ({ onLoginClick, onContactClick }) => {
  const navigate = useNavigate();

  const plans = [
    {
      name: 'Başlangıç',
      price: '₺499',
      period: '/ay',
      description: 'Küçük işletmeler için',
      features: [
        '1 Sabit Numara',
        '1000 Dakika Konuşma',
        '5000 SMS',
        'Temel Bulut Santral',
        'E-posta Desteği'
      ]
    },
    {
      name: 'Profesyonel',
      price: '₺1.499',
      period: '/ay',
      description: 'Büyüyen işletmeler için',
      featured: true,
      features: [
        '3 Sabit Numara',
        '5000 Dakika Konuşma',
        '20000 SMS',
        'Gelişmiş Bulut Santral',
        'Çağrı Kaydı',
        '7/24 Destek',
        'API Erişimi'
      ]
    },
    {
      name: 'Kurumsal',
      price: 'Özel',
      period: '',
      description: 'Büyük şirketler için',
      features: [
        'Sınırsız Numara',
        'Sınırsız Konuşma',
        'Sınırsız SMS',
        'Tam Özelleştirilmiş Santral',
        'Özel Hesap Yöneticisi',
        'SLA Garantisi',
        'Özel Entegrasyonlar'
      ]
    }
  ];

  return (
    <div className="min-h-screen">
      <Header onLoginClick={onLoginClick} onContactClick={onContactClick} />
      
      <div className="bg-gradient-to-r from-blue-500 to-blue-600 text-white py-16">
        <div className="container mx-auto px-4">
          <Button
            variant="ghost"
            onClick={() => navigate('/')}
            className="text-white hover:bg-white/10 mb-4"
          >
            <ArrowLeft className="mr-2" size={20} />
            Ana Sayfaya Dön
          </Button>
          <h1 className="text-4xl md:text-5xl font-bold">Fiyatlandırma</h1>
          <p className="text-xl mt-4 text-blue-100">
            İhtiyacınıza en uygun paketi seçin
          </p>
        </div>
      </div>

      <div className="container mx-auto px-4 py-16">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {plans.map((plan, index) => (
            <Card 
              key={index} 
              className={`hover:shadow-2xl transition-all duration-300 ${
                plan.featured ? 'ring-2 ring-blue-500 transform scale-105' : ''
              }`}
            >
              <CardHeader>
                {plan.featured && (
                  <div className="bg-blue-500 text-white px-4 py-1 rounded-full text-sm font-semibold inline-block mb-4">
                    En Popüler
                  </div>
                )}
                <CardTitle className="text-2xl">{plan.name}</CardTitle>
                <CardDescription>{plan.description}</CardDescription>
                <div className="mt-4">
                  <span className="text-4xl font-bold text-gray-900">{plan.price}</span>
                  <span className="text-gray-600">{plan.period}</span>
                </div>
              </CardHeader>
              <CardContent>
                <ul className="space-y-3 mb-6">
                  {plan.features.map((feature, idx) => (
                    <li key={idx} className="flex items-center">
                      <Check className="text-green-500 mr-2" size={20} />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
                <Button
                  onClick={plan.name === 'Kurumsal' ? onContactClick : onLoginClick}
                  className={`w-full ${
                    plan.featured
                      ? 'bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700'
                      : ''
                  }`}
                  variant={plan.featured ? 'default' : 'outline'}
                >
                  {plan.name === 'Kurumsal' ? 'İletişime Geçin' : 'Hemen Başlayın'}
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default Pricing;
