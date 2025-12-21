import React from 'react';
import { Award, Users, Globe, Monitor, Network, Code, Shield } from 'lucide-react';
import { features } from '../mock';

const iconMap = {
  award: Award,
  users: Users,
  globe: Globe,
  monitor: Monitor,
  network: Network,
  code: Code,
  shield: Shield
};

const Features = () => {
  return (
    <section className="py-20 bg-white">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            Neden Mi Velora?
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            İletişimi yeniden tanımlıyoruz! Sabit ücretler olmadan, VoIP, toplu SMS ve bulut santral çözümleriyle işletmenize çeviklik ve tasarruf kazandırıyoruz.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature) => {
            const Icon = iconMap[feature.icon];
            return (
              <div
                key={feature.id}
                className="group p-8 rounded-2xl bg-gradient-to-br from-gray-50 to-white border border-gray-200 hover:border-blue-500 hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1"
              >
                <div className="mb-6 inline-flex p-4 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl group-hover:scale-110 transition-transform duration-300 shadow-lg">
                  <Icon className="text-white" size={32} />
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-4 group-hover:text-blue-600 transition-colors">
                  {feature.title}
                </h3>
                <p className="text-gray-600 leading-relaxed">
                  {feature.description}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default Features;
