import React from 'react';
import { MapPin, Phone, Shield, Globe } from 'lucide-react';
import { Language } from '../types';
import { t } from '../services/i18n';

interface FooterProps {
  lang: Language;
  onNavigate: (tab: string) => void;
}

export const Footer: React.FC<FooterProps> = ({ lang, onNavigate }) => {
  return (
    <footer className="bg-stone-900 text-stone-300 border-t border-stone-800 text-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          
          {/* Brand Info */}
          <div className="space-y-3">
            <span className="font-serif text-2xl font-bold tracking-tight text-white block">
              Trip Now
            </span>
            <p className="text-stone-400 leading-relaxed">
              {lang === 'es'
                ? 'Arrendamiento de vehículos en El Salvador. Flota moderna con entrega inmediata en Aeropuerto Internacional, San Salvador, Santa Ana, San Miguel y Surf City.'
                : 'Vehicle rental in El Salvador. Modern fleet with direct pickup at San Óscar Romero International Airport, San Salvador, Santa Ana, San Miguel, and Surf City.'}
            </p>
            <div className="text-[11px] font-mono text-stone-500">
              Operaciones registradas · El Salvador, C.A.
            </div>
          </div>

          {/* Quick Nav */}
          <div>
            <h4 className="font-serif text-sm font-bold text-white uppercase tracking-wider mb-3">
              {lang === 'es' ? 'Navegación' : 'Navigation'}
            </h4>
            <ul className="space-y-2 font-mono">
              <li>
                <button
                  onClick={() => onNavigate('home')}
                  className="hover:text-white transition-colors cursor-pointer"
                >
                  {t('nav.home', lang)}
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('catalog')}
                  className="hover:text-white transition-colors cursor-pointer"
                >
                  {t('nav.catalog', lang)}
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('branches')}
                  className="hover:text-white transition-colors cursor-pointer"
                >
                  {t('nav.branches', lang)}
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('admin')}
                  className="hover:text-amber-400 transition-colors cursor-pointer"
                >
                  {t('nav.admin', lang)}
                </button>
              </li>
            </ul>
          </div>

          {/* Hubs */}
          <div>
            <h4 className="font-serif text-sm font-bold text-white uppercase tracking-wider mb-3">
              {lang === 'es' ? 'Sucursales Clave' : 'Key Locations'}
            </h4>
            <ul className="space-y-2 text-stone-400">
              <li className="flex items-start gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-amber-500 shrink-0 mt-0.5" />
                <span>Aeropuerto SAL (24/7 Nivel 1)</span>
              </li>
              <li className="flex items-start gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-amber-500 shrink-0 mt-0.5" />
                <span>San Salvador (Paseo Escalón)</span>
              </li>
              <li className="flex items-start gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-amber-500 shrink-0 mt-0.5" />
                <span>Surf City (Playa El Tunco)</span>
              </li>
              <li className="flex items-start gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-amber-500 shrink-0 mt-0.5" />
                <span>Santa Ana & San Miguel</span>
              </li>
            </ul>
          </div>

          {/* Contact & Support */}
          <div>
            <h4 className="font-serif text-sm font-bold text-white uppercase tracking-wider mb-3">
              {lang === 'es' ? 'Atención al Cliente' : 'Customer Support'}
            </h4>
            <div className="space-y-2 font-mono text-stone-400">
              <div>📞 Central: +503 2264-9800</div>
              <div>✈️ Aeropuerto: +503 2344-7700</div>
              <div>📱 WhatsApp: +503 7845-1234</div>
              <div className="pt-2 text-stone-500 text-[11px]">
                Tarifas expresadas en Dólares de los Estados Unidos (USD).
              </div>
            </div>
          </div>

        </div>

        <div className="mt-12 pt-6 border-t border-stone-800 flex flex-col sm:flex-row items-center justify-between gap-4 text-[11px] text-stone-500">
          <div>
            © {new Date().getFullYear()} Trip Now El Salvador. {lang === 'es' ? 'Todos los derechos reservados.' : 'All rights reserved.'}
          </div>
          <div className="flex items-center gap-4">
            <span>Google Sheets Serverless Sync</span>
            <span>·</span>
            <span>Leaflet Map Integration</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
