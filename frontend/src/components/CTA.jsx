import React from 'react';
import { Button } from './ui/button';
import { ArrowRight, Phone } from 'lucide-react';

const CTA = ({ onLoginClick, onContactClick }) => {
  return (
    <section className="py-20 bg-gradient-to-br from-blue-600 via-blue-700 to-blue-800 text-white relative overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-10 left-10 w-72 h-72 bg-white rounded-full filter blur-3xl"></div>
        <div className="absolute bottom-10 right-10 w-96 h-96 bg-white rounded-full filter blur-3xl"></div>
      </div>

      <div className="container mx-auto px-4 relative z-10">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl md:text-5xl font-bold mb-6">
            Hemen Başlayın!
          </h2>
          <p className="text-xl md:text-2xl mb-10 text-blue-100">
            Velora Online İşlem Merkezi (OİM) ile hesabınızı webden ve cepten kolayca yönetin!
          </p>

          <div className="flex flex-col sm:flex-row gap-6 justify-center items-center mb-12">
            <Button
              size="lg"
              onClick={onLoginClick}
              className="bg-white text-blue-600 hover:bg-blue-50 font-semibold px-10 py-7 text-lg shadow-2xl hover:shadow-3xl transition-all duration-300 transform hover:scale-105"
            >
              Velora OİM Giriş
              <ArrowRight className="ml-2" size={20} />
            </Button>
            <Button
              size="lg"
              variant="outline"
              onClick={onContactClick}
              className="border-2 border-white text-white hover:bg-white hover:text-blue-600 font-semibold px-10 py-7 text-lg transition-all duration-300 transform hover:scale-105"
            >
              <Phone className="mr-2" size={20} />
              İletişime Geçin
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-16">
            <div className="p-6 bg-white/10 backdrop-blur-sm rounded-xl hover:bg-white/20 transition-all duration-300">
              <h3 className="text-2xl font-bold mb-2">Sabit Numara Tahsisi</h3>
              <p className="text-blue-100">Hızlı ve kolay numara tahsisi</p>
            </div>
            <div className="p-6 bg-white/10 backdrop-blur-sm rounded-xl hover:bg-white/20 transition-all duration-300">
              <h3 className="text-2xl font-bold mb-2">Sabit Numara Taşıma</h3>
              <p className="text-blue-100">Numaranızı kolayca taşıyın</p>
            </div>
            <div className="p-6 bg-white/10 backdrop-blur-sm rounded-xl hover:bg-white/20 transition-all duration-300">
              <h3 className="text-2xl font-bold mb-2">Sabit Numara Sorgula</h3>
              <p className="text-blue-100">Müsait numaraları inceleyin</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default CTA;
