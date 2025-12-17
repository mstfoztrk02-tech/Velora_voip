import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, FileText, Video, HelpCircle, Download } from 'lucide-react';
import Header from '../components/Header';
import Footer from '../components/Footer';
import { Button } from '../components/ui/button';
import { Card, CardHeader, CardTitle, CardDescription } from '../components/ui/card';

const Resources = ({ onLoginClick, onContactClick }) => {
  const navigate = useNavigate();

  const resources = [
    {
      icon: FileText,
      title: 'Dokümantasyon',
      description: 'Teknik dokümanlar ve kullanım kılavuzları',
      items: ['API Referansı', 'Entegrasyon Rehberi', 'En İyi Uygulamalar']
    },
    {
      icon: Video,
      title: 'Video Eğitimleri',
      description: 'Adım adım video eğitim içerikleri',
      items: ['Başlangıç Eğitimleri', 'Gelişmiş Kullanım', 'Webinar Kayıtları']
    },
    {
      icon: HelpCircle,
      title: 'SSS',
      description: 'Sıkça sorulan sorular ve cevapları',
      items: ['Genel Sorular', 'Teknik Destek', 'Faturalandırma']
    },
    {
      icon: Download,
      title: 'İndirilebilir İçerikler',
      description: 'PDF rehberler ve şablonlar',
      items: ['Kullanım Kılavuzları', 'Örnek Kodlar', 'Kontrol Listeleri']
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
          <h1 className="text-4xl md:text-5xl font-bold">Kaynaklar</h1>
          <p className="text-xl mt-4 text-blue-100">
            İhtiyacınız olan tüm bilgiler burada
          </p>
        </div>
      </div>

      <div className="container mx-auto px-4 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {resources.map((resource, index) => {
            const Icon = resource.icon;
            return (
              <Card key={index} className="hover:shadow-xl transition-shadow">
                <CardHeader>
                  <div className="mb-4 inline-flex p-4 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl">
                    <Icon className="text-white" size={32} />
                  </div>
                  <CardTitle>{resource.title}</CardTitle>
                  <CardDescription className="mb-4">{resource.description}</CardDescription>
                  <ul className="space-y-2">
                    {resource.items.map((item, idx) => (
                      <li key={idx} className="flex items-center text-gray-700">
                        <span className="w-2 h-2 bg-blue-500 rounded-full mr-3"></span>
                        {item}
                      </li>
                    ))}
                  </ul>
                </CardHeader>
              </Card>
            );
          })}
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default Resources;
