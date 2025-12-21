import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Handshake, TrendingUp, Award, Users } from 'lucide-react';
import Header from '../components/Header';
import Footer from '../components/Footer';
import { Button } from '../components/ui/button';
import { Card, CardHeader, CardTitle, CardDescription } from '../components/ui/card';

const Partners = ({ onLoginClick, onContactClick }) => {
  const navigate = useNavigate();

  const benefits = [
    {
      icon: Handshake,
      title: 'Stratejik İş Ortaklığı',
      description: 'Uzun vadeli iş birliği fırsatları'
    },
    {
      icon: TrendingUp,
      title: 'Yüksek Komisyon',
      description: 'Rekabetçi komisyon oranları'
    },
    {
      icon: Award,
      title: 'Eğitim ve Destek',
      description: 'Kapsamlı partner eğitim programı'
    },
    {
      icon: Users,
      title: 'Geniş Müşteri Ağı',
      description: 'Büyük müşteri portföyüne erişim'
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
          <h1 className="text-4xl md:text-5xl font-bold">Partnerler</h1>
          <p className="text-xl mt-4 text-blue-100">
            Birlikte büyüyelim, birlikte başaralım
          </p>
        </div>
      </div>

      <div className="container mx-auto px-4 py-16">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            Partner Olmanın Avantajları
          </h2>
          <p className="text-xl text-gray-600">
            Velora iş ortağı olarak kazanmaya başlayın
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-16">
          {benefits.map((benefit, index) => {
            const Icon = benefit.icon;
            return (
              <Card key={index} className="hover:shadow-xl transition-shadow">
                <CardHeader>
                  <div className="mb-4 inline-flex p-4 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl">
                    <Icon className="text-white" size={32} />
                  </div>
                  <CardTitle>{benefit.title}</CardTitle>
                  <CardDescription>{benefit.description}</CardDescription>
                </CardHeader>
              </Card>
            );
          })}
        </div>

        <div className="bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-2xl p-12 text-center">
          <h3 className="text-3xl font-bold mb-4">Partner Başvurusu</h3>
          <p className="text-xl mb-8 text-blue-100">
            Hemen başvurun ve avantajlı partner programımızdan yararlanın
          </p>
          <Button
            size="lg"
            onClick={onContactClick}
            className="bg-white text-blue-600 hover:bg-blue-50 font-semibold px-10 py-6 text-lg"
          >
            Başvuru Yap
          </Button>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default Partners;
