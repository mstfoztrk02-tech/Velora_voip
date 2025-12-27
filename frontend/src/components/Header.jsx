import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Phone, Menu, X, Crown, LogOut } from 'lucide-react';
import { Button } from './ui/button';
import authService from '../services/authService';

const Header = ({ onLoginClick, onContactClick }) => {
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isSuperAdmin, setIsSuperAdmin] = useState(false);

  useEffect(() => {
    setIsSuperAdmin(authService.isSuperAdmin());
  }, []);

  const navItems = [
    { label: 'Ürünler', href: '/urunler' },
    { label: 'CRM Panel', href: '/voip-crm' },
<<<<<<< HEAD
=======
    { label: 'Geliştiriciler', href: '/gelistiriciler' },
>>>>>>> 9a52c04298d2839f010d3227cf811f87ed2bcc0c
    { label: 'Partnerler', href: '/partnerler' },
    { label: 'Kaynaklar', href: '/kaynaklar' },
    { label: 'Fiyatlandırma', href: '/fiyatlandirma' }
  ];

  return (
    <>
      {/* Top bar */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white py-2 px-4">
        <div className="container mx-auto flex justify-between items-center text-sm">
          <div className="flex items-center gap-4">
            <span className="font-medium">Destek Merkezi</span>
            <a href="tel:08500000000" className="flex items-center gap-2 hover:text-blue-100 transition-colors">
              <Phone size={16} />
              <span className="font-semibold">0850 000 00 00</span>
            </a>
          </div>
          <div className="flex items-center gap-3">
            {isSuperAdmin ? (
              <>
                <button
                  onClick={() => navigate('/admin/super-admin-panel')}
                  className="flex items-center gap-1 bg-yellow-400 text-purple-900 px-3 py-1 rounded-full text-xs font-bold hover:bg-yellow-300 transition-colors"
                >
                  <Crown size={14} />
                  <span>SUPER ADMIN</span>
                </button>
                <button
                  onClick={() => {
                    localStorage.removeItem('auth_user');
                    setIsSuperAdmin(false);
                    navigate('/');
                    window.location.reload();
                  }}
                  className="flex items-center gap-1 hover:text-blue-100 transition-colors text-sm"
                >
                  <LogOut size={14} />
                  <span>Çıkış</span>
                </button>
              </>
            ) : (
              <>
                <button
                  onClick={() => navigate('/admin/super-admin-login')}
                  className="flex items-center gap-1 hover:text-blue-100 transition-colors text-sm"
                >
                  <Crown size={14} />
                  <span>Yönetici Girişi</span>
                </button>
                <button
                  onClick={onLoginClick}
                  className="hover:text-blue-100 transition-colors cursor-pointer"
                >
                  Giriş Yap
                </button>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Main header */}
      <header className="bg-white shadow-md sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex justify-between items-center">
            {/* Logo */}
            <div className="flex items-center">
              <Link to="/" className="bg-gradient-to-r from-blue-500 to-blue-600 text-white px-6 py-3 rounded-lg font-bold text-2xl hover:shadow-lg transition-all duration-300">
                Velora
              </Link>
            </div>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center gap-8">
              {navItems.map((item, index) => (
                item.href.startsWith('#') ? (
                  <a
                    key={index}
                    href={item.href}
                    className="text-gray-700 hover:text-blue-600 font-medium transition-colors duration-200"
                  >
                    {item.label}
                  </a>
                ) : (
                  <Link
                    key={index}
                    to={item.href}
                    className="text-gray-700 hover:text-blue-600 font-medium transition-colors duration-200"
                  >
                    {item.label}
                  </Link>
                )
              ))}
            </nav>

            {/* CTA Buttons */}
            <div className="hidden md:flex items-center gap-4">
              <Button
                variant="outline"
                onClick={onContactClick}
                className="border-blue-600 text-blue-600 hover:bg-blue-50 transition-all duration-200"
              >
                Ekibimizle Görüşün
              </Button>
              <Button
                onClick={onLoginClick}
                className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white transition-all duration-200 shadow-md hover:shadow-lg"
              >
                Ücretsiz Başlayın
              </Button>
            </div>

            {/* Mobile menu button */}
            <button
              className="md:hidden text-gray-700"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>

          {/* Mobile Navigation */}
          {mobileMenuOpen && (
            <div className="md:hidden mt-4 pb-4 border-t pt-4">
              <nav className="flex flex-col gap-4">
                {navItems.map((item, index) => (
                  item.href.startsWith('#') ? (
                    <a
                      key={index}
                      href={item.href}
                      className="text-gray-700 hover:text-blue-600 font-medium"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      {item.label}
                    </a>
                  ) : (
                    <Link
                      key={index}
                      to={item.href}
                      className="text-gray-700 hover:text-blue-600 font-medium"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      {item.label}
                    </Link>
                  )
                ))}
                <div className="flex flex-col gap-2 mt-2">
                  <Button
                    variant="outline"
                    onClick={onContactClick}
                    className="border-blue-600 text-blue-600"
                  >
                    Ekibimizle Görüşün
                  </Button>
                  <Button
                    onClick={onLoginClick}
                    className="bg-gradient-to-r from-blue-500 to-blue-600 text-white"
                  >
                    Ücretsiz Başlayın
                  </Button>
                </div>
              </nav>
            </div>
          )}
        </div>
      </header>
    </>
  );
};

export default Header;
