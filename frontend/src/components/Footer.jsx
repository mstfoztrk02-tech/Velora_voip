import React from 'react';
import { Phone, Mail, MapPin, Facebook, Twitter, Linkedin, Instagram } from 'lucide-react';

const Footer = () => {
  const currentYear = new Date().getFullYear();

  const footerLinks = {
    'Ürünler': [
      { label: 'Sabit Numara', href: '#' },
      { label: '0850 Numara', href: '#' },
      { label: 'Bulut Santral', href: '#' },
      { label: 'Çağrı Merkezi', href: '#' },
      { label: 'Toplu SMS', href: '#' },
      { label: 'OTP SMS', href: '#' }
    ],
    'Kurumsal': [
      { label: 'Hakkımızda', href: '#' },
      { label: 'İletişim', href: '#' },
      { label: 'Kariyer', href: '#' },
      { label: 'Blog', href: '#' },
      { label: 'Basın', href: '#' }
    ],
    'Destek': [
      { label: 'Yardım Merkezi', href: '#' },
      { label: 'Dokümantasyon', href: '#' },
      { label: 'API', href: '#' },
      { label: 'Durum', href: '#' },
      { label: 'SSS', href: '#' }
    ],
    'Yasal': [
      { label: 'Gizlilik Politikası', href: '#' },
      { label: 'Kullanım Koşulları', href: '#' },
      { label: 'Çerez Politikası', href: '#' },
      { label: 'KVKK', href: '#' }
    ]
  };

  return (
    <footer className="bg-gray-900 text-gray-300">
      <div className="container mx-auto px-4 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-8 mb-12">
          {/* Logo and Description */}
          <div className="lg:col-span-2">
            <div className="bg-gradient-to-r from-blue-500 to-blue-600 text-white px-6 py-3 rounded-lg font-bold text-2xl inline-block mb-4">
              Velora
            </div>
            <p className="text-gray-400 mb-6 leading-relaxed">
              Türkiye'nin önde gelen telekom operatörü. Bulut santral, SMS ve sabit telefon çözümleriyle işletmenize güç katıyoruz.
            </p>
            <div className="space-y-3">
              <a href="tel:08505320000" className="flex items-center gap-3 hover:text-blue-400 transition-colors">
                <Phone size={18} />
                <span>0850 532 00 00</span>
              </a>
              <a href="mailto:info@velora.com.tr" className="flex items-center gap-3 hover:text-blue-400 transition-colors">
                <Mail size={18} />
                <span>info@velora.com.tr</span>
              </a>
              <div className="flex items-center gap-3">
                <MapPin size={18} />
                <span>İstanbul, Türkiye</span>
              </div>
            </div>
          </div>

          {/* Links */}
          {Object.entries(footerLinks).map(([category, links]) => (
            <div key={category}>
              <h3 className="text-white font-semibold text-lg mb-4">{category}</h3>
              <ul className="space-y-2">
                {links.map((link, index) => (
                  <li key={index}>
                    <a
                      href={link.href}
                      className="text-gray-400 hover:text-blue-400 transition-colors duration-200"
                    >
                      {link.label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Social Media */}
        <div className="border-t border-gray-800 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-gray-400 text-sm">
              © {currentYear} Velora Telekom. Tüm hakları saklıdır.
            </p>
            <div className="flex items-center gap-4">
              <a
                href="#"
                className="w-10 h-10 rounded-full bg-gray-800 flex items-center justify-center hover:bg-blue-600 transition-colors duration-200"
                aria-label="Facebook"
              >
                <Facebook size={20} />
              </a>
              <a
                href="#"
                className="w-10 h-10 rounded-full bg-gray-800 flex items-center justify-center hover:bg-blue-600 transition-colors duration-200"
                aria-label="Twitter"
              >
                <Twitter size={20} />
              </a>
              <a
                href="#"
                className="w-10 h-10 rounded-full bg-gray-800 flex items-center justify-center hover:bg-blue-600 transition-colors duration-200"
                aria-label="LinkedIn"
              >
                <Linkedin size={20} />
              </a>
              <a
                href="#"
                className="w-10 h-10 rounded-full bg-gray-800 flex items-center justify-center hover:bg-blue-600 transition-colors duration-200"
                aria-label="Instagram"
              >
                <Instagram size={20} />
              </a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
