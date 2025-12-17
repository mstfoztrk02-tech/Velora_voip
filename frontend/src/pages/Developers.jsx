import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Code, Book, Terminal, Zap } from 'lucide-react';
import Header from '../components/Header';
import Footer from '../components/Footer';
import { Button } from '../components/ui/button';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../components/ui/card';

const Developers = ({ onLoginClick, onContactClick }) => {
  const navigate = useNavigate();

  const apiFeatures = [
    {
      icon: Code,
      title: 'REST API',
      description: 'Modern RESTful API ile kolay entegrasyon'
    },
    {
      icon: Book,
      title: 'Dokümantasyon',
      description: 'Detaylı API dokümantasyonu ve örnekler'
    },
    {
      icon: Terminal,
      title: 'SDK Desteği',
      description: 'Python, Node.js, PHP ve daha fazlası'
    },
    {
      icon: Zap,
      title: 'Webhook',
      description: 'Gerçek zamanlı bildirim sistemi'
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
          <h1 className="text-4xl md:text-5xl font-bold">Geliştiriciler</h1>
          <p className="text-xl mt-4 text-blue-100">
            Güçlü API'lerimizle uygulamalarınızı geliştirin
          </p>
        </div>
      </div>

      <div className="container mx-auto px-4 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-16">
          {apiFeatures.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <Card key={index} className="hover:shadow-xl transition-shadow">
                <CardHeader>
                  <div className="mb-4 inline-flex p-4 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl">
                    <Icon className="text-white" size={32} />
                  </div>
                  <CardTitle>{feature.title}</CardTitle>
                  <CardDescription>{feature.description}</CardDescription>
                </CardHeader>
              </Card>
            );
          })}
        </div>

        <Card>
          <CardHeader>
            <CardTitle>API Entegrasyonu</CardTitle>
            <CardDescription>Hızlı başlangıç örneği</CardDescription>
          </CardHeader>
          <CardContent>
            <pre className="bg-gray-900 text-green-400 p-6 rounded-lg overflow-x-auto">
              <code>{`// Velora API Örneği
const velora = require('velora-sdk');

velora.init({
  apiKey: 'your-api-key',
  apiSecret: 'your-api-secret'
});

// SMS gönderimi
velora.sms.send({
  to: '+905551234567',
  message: 'Merhaba Velora!'
}).then(response => {
  console.log('SMS gönderildi:', response);
});`}</code>
            </pre>
          </CardContent>
        </Card>
      </div>

      <Footer />
    </div>
  );
};

export default Developers;
