import React, { useState } from 'react';
import { X, Phone, Mail, MapPin } from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import { useToast } from '../hooks/use-toast';

const ContactModal = ({ isOpen, onClose }) => {
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    company: '',
    message: ''
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (formData.name && formData.email && formData.phone && formData.message) {
      toast({
        title: "Mesaj Gönderildi",
        description: "En kısa sürede size dönüş yapacağız.",
      });
      setFormData({ name: '', email: '', phone: '', company: '', message: '' });
      setTimeout(() => onClose(), 1500);
    } else {
      toast({
        title: "Hata",
        description: "Lütfen zorunlu alanları doldurun.",
        variant: "destructive"
      });
    }
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex justify-between items-center p-6 border-b">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Ekibimizle Görüşün</h2>
            <p className="text-sm text-gray-600 mt-1">
              Size en uygun çözümü sunmak için burdayız
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X size={24} />
          </button>
        </div>

        <div className="grid md:grid-cols-2 gap-6 p-6">
          {/* Contact Info */}
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">İletişim Bilgileri</h3>
              <div className="space-y-4">
                <a href="tel:08505320000" className="flex items-center gap-3 text-gray-700 hover:text-blue-600 transition-colors">
                  <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                    <Phone size={20} className="text-blue-600" />
                  </div>
                  <div>
                    <div className="text-sm text-gray-600">Telefon</div>
                    <div className="font-semibold">0850 532 00 00</div>
                  </div>
                </a>
                
                <a href="mailto:info@velora.com.tr" className="flex items-center gap-3 text-gray-700 hover:text-blue-600 transition-colors">
                  <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                    <Mail size={20} className="text-blue-600" />
                  </div>
                  <div>
                    <div className="text-sm text-gray-600">E-posta</div>
                    <div className="font-semibold">info@velora.com.tr</div>
                  </div>
                </a>
                
                <div className="flex items-center gap-3 text-gray-700">
                  <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                    <MapPin size={20} className="text-blue-600" />
                  </div>
                  <div>
                    <div className="text-sm text-gray-600">Adres</div>
                    <div className="font-semibold">İstanbul, Türkiye</div>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-blue-50 p-4 rounded-xl">
              <h4 className="font-semibold text-gray-900 mb-2">Çalışma Saatleri</h4>
              <p className="text-sm text-gray-600">
                Pazartesi - Cuma: 09:00 - 18:00<br />
                Cumartesi: 09:00 - 13:00<br />
                Pazar: Kapalı
              </p>
            </div>
          </div>

          {/* Contact Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Ad Soyad *</Label>
              <Input
                id="name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="Adınız ve soyadınız"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">E-posta *</Label>
              <Input
                id="email"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="ornek@sirket.com"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="phone">Telefon *</Label>
              <Input
                id="phone"
                name="phone"
                type="tel"
                value={formData.phone}
                onChange={handleChange}
                placeholder="0555 123 45 67"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="company">Şirket</Label>
              <Input
                id="company"
                name="company"
                value={formData.company}
                onChange={handleChange}
                placeholder="Şirket adınız"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="message">Mesajınız *</Label>
              <Textarea
                id="message"
                name="message"
                value={formData.message}
                onChange={handleChange}
                placeholder="Size nasıl yardımcı olabiliriz?"
                rows={4}
                required
              />
            </div>

            <Button
              type="submit"
              className="w-full bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white py-6 font-semibold"
            >
              Mesaj Gönder
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ContactModal;
