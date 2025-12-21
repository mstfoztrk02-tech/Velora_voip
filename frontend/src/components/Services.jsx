import React from 'react';
import { Phone, Hash, Cloud, Headphones, MessageSquare, Lock, Mail, ArrowRight } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardDescription } from './ui/card';
import { services } from '../mock';

const iconMap = {
  phone: Phone,
  hash: Hash,
  cloud: Cloud,
  headphones: Headphones,
  'message-square': MessageSquare,
  lock: Lock,
  mail: Mail
};

const Services = () => {
  return (
    <section id="urunler" className="py-20 bg-gradient-to-b from-gray-50 to-white">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            Ürünlerimiz
          </h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            İletişimi kolaylaştıran çözümlerin hepsi tek panelde!
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {services.map((service) => {
            const Icon = iconMap[service.icon];
            return (
              <Card
                key={service.id}
                className="group hover:shadow-xl transition-all duration-300 border-2 hover:border-blue-500 cursor-pointer transform hover:-translate-y-2"
              >
                <CardHeader>
                  <div className="mb-4 inline-flex p-4 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl group-hover:scale-110 transition-transform duration-300 shadow-lg">
                    <Icon className="text-white" size={32} />
                  </div>
                  <CardTitle className="text-xl mb-2 text-gray-900 group-hover:text-blue-600 transition-colors">
                    {service.title}
                  </CardTitle>
                  <CardDescription className="text-gray-600 mb-4">
                    {service.description}
                  </CardDescription>
                  <a
                    href={service.link}
                    className="inline-flex items-center text-blue-600 font-medium hover:text-blue-700 transition-colors group-hover:gap-2 gap-1"
                  >
                    Detayları Gör
                    <ArrowRight size={16} className="transition-transform group-hover:translate-x-1" />
                  </a>
                </CardHeader>
              </Card>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default Services;
