import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import Header from '../components/Header';
import Footer from '../components/Footer';
import Services from '../components/Services';
import { Button } from '../components/ui/button';

const Products = ({ onLoginClick, onContactClick }) => {
  const navigate = useNavigate();

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
          <h1 className="text-4xl md:text-5xl font-bold">Ürünlerimiz</h1>
          <p className="text-xl mt-4 text-blue-100">
            İletişim ihtiyaçlarınız için eksiksiz çözümler
          </p>
        </div>
      </div>

      <Services />
      <Footer />
    </div>
  );
};

export default Products;
