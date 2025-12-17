import React from 'react';
import { Button } from './ui/button';
import { ArrowRight } from 'lucide-react';

const Hero = ({ onGetStarted, onLearnMore }) => {
  return (
    <section className="relative bg-gradient-to-br from-blue-500 via-blue-600 to-blue-700 text-white py-20 md:py-32 overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-0 left-0 w-96 h-96 bg-white rounded-full filter blur-3xl"></div>
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-white rounded-full filter blur-3xl"></div>
      </div>

      <div className="container mx-auto px-4 relative z-10">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-4xl md:text-6xl font-bold mb-6 leading-tight animate-fade-in">
            Dünya'nın İlk Tam Odaklı Yapay Zeka Tabanlı Operatörü
          </h1>
          <p className="text-xl md:text-2xl mb-8 text-blue-100 leading-relaxed">
            Bulut Santral, SMS Hizmetleri ve Sabit Telefon Çözümleriyle İşletmenize Güç Katın
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Button
              size="lg"
              onClick={onGetStarted}
              className="bg-white text-blue-600 hover:bg-blue-50 font-semibold px-8 py-6 text-lg shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:scale-105"
            >
              Hemen Başlayın
              <ArrowRight className="ml-2" size={20} />
            </Button>
            <Button
              size="lg"
              variant="outline"
              onClick={onLearnMore}
              className="border-2 border-white text-white hover:bg-white hover:text-blue-600 font-semibold px-8 py-6 text-lg transition-all duration-300 transform hover:scale-105"
            >
              Daha Fazla Bilgi
            </Button>
          </div>
          
          {/* Stats */}
          <div className="grid grid-cols-2 gap-8 mt-16 max-w-2xl mx-auto">
            <div className="text-center p-6 bg-white/10 backdrop-blur-sm rounded-xl hover:bg-white/20 transition-all duration-300">
              <div className="text-4xl md:text-5xl font-bold mb-2">15+</div>
              <div className="text-blue-100 text-sm md:text-base">Yıllık Tecrübe</div>
            </div>
            <div className="text-center p-6 bg-white/10 backdrop-blur-sm rounded-xl hover:bg-white/20 transition-all duration-300">
              <div className="text-4xl md:text-5xl font-bold mb-2">10,000+</div>
              <div className="text-blue-100 text-sm md:text-base">Abone Sayısı</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
