import React, { useState } from 'react';
import { ArrowRight, Calendar, MapPin, Shield, Check, Compass, Car, Sparkles } from 'lucide-react';
import { Branch, Language, Vehicle } from '../types';
import { t } from '../services/i18n';
import heroImg from '../assets/images/hero_tripnow_suv_1790123598626.jpg';

interface HomeHeroProps {
  branches: Branch[];
  featuredVehicles: Vehicle[];
  lang: Language;
  onExploreCatalog: (filterType?: string) => void;
  onSelectBranch: (branchId: string) => void;
  onAddToCart: (vehicleId: string, days?: number) => void;
}

export const HomeHero: React.FC<HomeHeroProps> = ({
  branches,
  featuredVehicles,
  lang,
  onExploreCatalog,
  onSelectBranch,
  onAddToCart
}) => {
  const [selectedBranch, setSelectedBranch] = useState(branches[0]?.id || 'b1');
  const todayStr = new Date().toISOString().split('T')[0];
  const [pickupDate, setPickupDate] = useState(todayStr);
  const [rentalDays, setRentalDays] = useState(3);

  const handleQuickSearch = (e: React.FormEvent) => {
    e.preventDefault();
    onExploreCatalog();
  };

  return (
    <div className="space-y-16 pb-16">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-stone-900 text-white rounded-3xl mx-4 sm:mx-6 lg:mx-8 mt-4 shadow-2xl">
        {/* Background Image with Scrim */}
        <div className="absolute inset-0 z-0">
          <img
            src={heroImg}
            alt="Trip Now - Renta de vehículos en El Salvador"
            className="w-full h-full object-cover object-center opacity-45 scale-105 transition-transform duration-1000 ease-out"
            referrerPolicy="no-referrer"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-stone-950 via-stone-900/60 to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-r from-stone-950/80 via-transparent to-transparent" />
        </div>

        {/* Hero Content */}
        <div className="relative z-10 max-w-5xl px-6 sm:px-12 py-16 sm:py-24 lg:py-28 flex flex-col justify-end">
          {/* Metadata line without pill enclosure */}
          <div className="flex items-center gap-2 text-xs font-mono tracking-wider uppercase text-amber-400 mb-4">
            <span>{t('hero.badge', lang)}</span>
            <span aria-hidden="true">·</span>
            <span>Tarifas transparentes USD</span>
          </div>

          <h1 className="font-serif text-3xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-white max-w-3xl leading-[1.15] text-balance">
            {t('hero.title', lang)}
          </h1>

          <p className="mt-5 text-base sm:text-lg text-stone-300 max-w-2xl leading-relaxed">
            {t('hero.subtitle', lang)}
          </p>

          {/* Quick Search Widget */}
          <div className="mt-10 bg-white/95 backdrop-blur-md text-stone-900 p-4 sm:p-6 rounded-2xl shadow-xl max-w-4xl border border-white/20">
            <form onSubmit={handleQuickSearch} className="grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-4 gap-4 items-end">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-stone-600 mb-1.5 flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-amber-600" />
                  {t('search.pickup_branch', lang)}
                </label>
                <select
                  value={selectedBranch}
                  onChange={(e) => setSelectedBranch(e.target.value)}
                  className="w-full text-xs sm:text-sm font-medium bg-stone-50 border border-stone-200 rounded-lg px-3 py-2.5 text-stone-900 focus:outline-none focus:ring-2 focus:ring-amber-500"
                >
                  {branches.map(b => (
                    <option key={b.id} value={b.id}>{b.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-stone-600 mb-1.5 flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5 text-amber-600" />
                  {t('search.pickup_date', lang)}
                </label>
                <input
                  type="date"
                  min={todayStr}
                  value={pickupDate}
                  onChange={(e) => setPickupDate(e.target.value)}
                  className="w-full text-xs sm:text-sm font-medium bg-stone-50 border border-stone-200 rounded-lg px-3 py-2 text-stone-900 focus:outline-none focus:ring-2 focus:ring-amber-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-stone-600 mb-1.5 flex items-center gap-1.5">
                  <Compass className="w-3.5 h-3.5 text-amber-600" />
                  {t('search.days', lang)}
                </label>
                <select
                  value={rentalDays}
                  onChange={(e) => setRentalDays(Number(e.target.value))}
                  className="w-full text-xs sm:text-sm font-medium bg-stone-50 border border-stone-200 rounded-lg px-3 py-2.5 text-stone-900 focus:outline-none focus:ring-2 focus:ring-amber-500"
                >
                  {[1, 2, 3, 5, 7, 10, 14, 21, 30].map(d => (
                    <option key={d} value={d}>{d} {lang === 'es' ? 'días' : 'days'}</option>
                  ))}
                </select>
              </div>

              <div>
                <button
                  type="submit"
                  className="w-full bg-stone-900 hover:bg-stone-800 text-white font-medium text-xs sm:text-sm px-4 py-3 rounded-lg transition-colors flex items-center justify-center gap-2 cursor-pointer shadow-md"
                >
                  <span>{t('search.btn', lang)}</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </form>
          </div>

          {/* Clean Proof Anchors adjacent to Hero */}
          <div className="mt-8 flex flex-wrap items-center gap-x-6 gap-y-2 text-xs text-stone-400">
            <span className="flex items-center gap-1.5">
              <Check className="w-4 h-4 text-emerald-400" />
              {t('hero.trust.airpot', lang)}
            </span>
            <span aria-hidden="true" className="text-stone-600">·</span>
            <span className="flex items-center gap-1.5">
              <Check className="w-4 h-4 text-emerald-400" />
              {t('hero.trust.insurance', lang)}
            </span>
            <span aria-hidden="true" className="text-stone-600">·</span>
            <span className="flex items-center gap-1.5">
              <Check className="w-4 h-4 text-emerald-400" />
              {t('hero.trust.unlimited', lang)}
            </span>
          </div>
        </div>
      </section>

      {/* Category Shortcuts */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-8 gap-4">
          <div>
            <span className="text-xs font-mono uppercase tracking-wider text-amber-800 font-semibold">
              {lang === 'es' ? 'Segmentos recomendados' : 'Featured vehicle classes'}
            </span>
            <h2 className="font-serif text-2xl sm:text-3xl font-bold text-stone-900 mt-1">
              {lang === 'es' ? 'Adaptado a la geografía de El Salvador' : 'Tailored for El Salvador Terrains'}
            </h2>
          </div>
          <button
            onClick={() => onExploreCatalog()}
            className="text-sm font-semibold text-stone-900 hover:text-amber-800 flex items-center gap-1 group cursor-pointer"
          >
            <span>{t('hero.btn.explore', lang)}</span>
            <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Card 1: Camionetas 4x4 */}
          <div
            onClick={() => onExploreCatalog('Camioneta')}
            className="group cursor-pointer bg-white rounded-2xl p-6 border border-stone-200 hover:border-stone-400 transition-all duration-200 hover:shadow-lg flex flex-col justify-between"
          >
            <div>
              <div className="text-xs font-mono text-stone-500 uppercase tracking-wider mb-2">
                Ruta de las Flores · Volcanes · Surf City
              </div>
              <h3 className="font-serif text-xl font-bold text-stone-900 group-hover:text-amber-800 transition-colors">
                Camionetas 4x4 y Pickups
              </h3>
              <p className="text-xs text-stone-600 mt-2 leading-relaxed">
                Tracción en las 4 ruedas, batea de carga y suspensión alta para caminos costeros, fincas de café y terrenos mixtos.
              </p>
            </div>
            <div className="mt-6 flex items-center justify-between pt-4 border-t border-stone-100 text-xs font-medium text-stone-900">
              <span className="font-mono">Desde $68 USD / día</span>
              <span className="text-amber-700 flex items-center gap-1 group-hover:translate-x-0.5 transition-transform">
                Ver disponibles &rarr;
              </span>
            </div>
          </div>

          {/* Card 2: SUVs */}
          <div
            onClick={() => onExploreCatalog('SUV')}
            className="group cursor-pointer bg-white rounded-2xl p-6 border border-stone-200 hover:border-stone-400 transition-all duration-200 hover:shadow-lg flex flex-col justify-between"
          >
            <div>
              <div className="text-xs font-mono text-stone-500 uppercase tracking-wider mb-2">
                Familias · Confort · Tecnología
              </div>
              <h3 className="font-serif text-xl font-bold text-stone-900 group-hover:text-amber-800 transition-colors">
                SUVs y Crossovers
              </h3>
              <p className="text-xs text-stone-600 mt-2 leading-relaxed">
                Espacio amplio para 5 pasajeros y equipaje, climatización automática de alto rendimiento y bajo consumo híbrido.
              </p>
            </div>
            <div className="mt-6 flex items-center justify-between pt-4 border-t border-stone-100 text-xs font-medium text-stone-900">
              <span className="font-mono">Desde $48 USD / día</span>
              <span className="text-amber-700 flex items-center gap-1 group-hover:translate-x-0.5 transition-transform">
                Ver disponibles &rarr;
              </span>
            </div>
          </div>

          {/* Card 3: Sedanes & Compactos */}
          <div
            onClick={() => onExploreCatalog('Sedán')}
            className="group cursor-pointer bg-white rounded-2xl p-6 border border-stone-200 hover:border-stone-400 transition-all duration-200 hover:shadow-lg flex flex-col justify-between"
          >
            <div>
              <div className="text-xs font-mono text-stone-500 uppercase tracking-wider mb-2">
                San Salvador · Negocios · Rendimiento
              </div>
              <h3 className="font-serif text-xl font-bold text-stone-900 group-hover:text-amber-800 transition-colors">
                Sedanes Ejecutivos y Ciudad
              </h3>
              <p className="text-xs text-stone-600 mt-2 leading-relaxed">
                Facilidad de parqueo, suavidad de marcha en autopistas interurbanas y la mejor eficiencia de combustible.
              </p>
            </div>
            <div className="mt-6 flex items-center justify-between pt-4 border-t border-stone-100 text-xs font-medium text-stone-900">
              <span className="font-mono">Desde $32 USD / día</span>
              <span className="text-amber-700 flex items-center gap-1 group-hover:translate-x-0.5 transition-transform">
                Ver disponibles &rarr;
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Fleet Preview */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-10">
          <span className="text-xs font-mono uppercase tracking-wider text-amber-800 font-semibold">
            {lang === 'es' ? 'Flota en vitrina' : 'Spotlight vehicles'}
          </span>
          <h2 className="font-serif text-2xl sm:text-3xl font-bold text-stone-900 mt-1">
            {lang === 'es' ? 'Los modelos más solicitados por nuestros viajeros' : 'Most Popular Models'}
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {featuredVehicles.slice(0, 3).map((vehicle) => (
            <div
              key={vehicle.id}
              className="bg-white rounded-2xl overflow-hidden border border-stone-200 hover:border-stone-400 transition-all duration-200 flex flex-col"
            >
              <div className="relative aspect-[4/3] bg-stone-100 overflow-hidden">
                <img
                  src={vehicle.imageUrl}
                  alt={`${vehicle.brand} ${vehicle.name}`}
                  className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-300"
                  referrerPolicy="no-referrer"
                />
                <div className="absolute top-3 left-3 bg-stone-900/80 backdrop-blur-md text-white text-[11px] font-mono px-2 py-0.5 rounded">
                  {vehicle.type}
                </div>
              </div>

              <div className="p-6 flex-1 flex flex-col justify-between">
                <div>
                  <div className="text-xs text-stone-500 font-mono">
                    {vehicle.brand}
                  </div>
                  <h3 className="font-serif text-lg font-bold text-stone-900 mt-0.5">
                    {vehicle.name}
                  </h3>
                  
                  {/* Clean unboxed metadata */}
                  <div className="mt-3 flex items-center gap-2 text-xs text-stone-600 font-mono">
                    <span>{vehicle.transmission}</span>
                    <span aria-hidden="true">·</span>
                    <span>{vehicle.fuel}</span>
                    <span aria-hidden="true">·</span>
                    <span>{vehicle.passengers} {t('common.passengers', lang)}</span>
                  </div>
                </div>

                <div className="mt-6 pt-4 border-t border-stone-100 flex items-center justify-between">
                  <div>
                    <span className="text-xs text-stone-500">Tarifa diaria</span>
                    <div className="font-serif text-xl font-bold text-stone-900 font-mono">
                      ${vehicle.pricePerDay} <span className="text-xs font-normal text-stone-600">USD</span>
                    </div>
                  </div>

                  <button
                    onClick={() => onAddToCart(vehicle.id, 1)}
                    className="bg-stone-900 hover:bg-stone-800 text-white text-xs font-medium px-4 py-2 rounded-lg transition-colors cursor-pointer"
                  >
                    {t('catalog.btn.reserve_now', lang)}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Strategic Hubs Section with Airport Highlight */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-stone-100 rounded-3xl p-8 sm:p-12 border border-stone-200 flex flex-col lg:flex-row items-center justify-between gap-8">
          <div className="max-w-xl">
            <span className="text-xs font-mono uppercase tracking-wider text-amber-800 font-semibold">
              Aeropuerto Internacional San Óscar Arnulfo Romero (SAL)
            </span>
            <h2 className="font-serif text-2xl sm:text-3xl font-bold text-stone-900 mt-2">
              {lang === 'es' ? 'Aterriza en El Salvador y conduce de inmediato' : 'Land in El Salvador & Drive Away'}
            </h2>
            <p className="mt-3 text-sm text-stone-600 leading-relaxed">
              {lang === 'es'
                ? 'Nuestra sucursal en el aeropuerto opera las 24 horas del día. Ya sea que llegues en vuelo nocturno o de madrugada, tu vehículo estará listo con contrato digital y sin filas largas.'
                : 'Our airport hub operates 24/7. Whether arriving late at night or early morning, your car will be inspected, sanitized, and ready for departure.'}
            </p>

            <div className="mt-6 flex flex-wrap gap-4 text-xs font-mono text-stone-700">
              <span className="bg-white px-3 py-1.5 rounded-lg border border-stone-200">
                Llegadas Internacionales · Nivel 1
              </span>
              <span className="bg-white px-3 py-1.5 rounded-lg border border-stone-200">
                Tel: +503 2344-7700
              </span>
            </div>
          </div>

          <div className="shrink-0 flex flex-col sm:flex-row gap-3">
            <button
              onClick={() => onSelectBranch('b2')}
              className="bg-stone-900 hover:bg-stone-800 text-white text-xs sm:text-sm font-medium px-5 py-3 rounded-lg transition-colors cursor-pointer"
            >
              {lang === 'es' ? 'Ver sucursal Aeropuerto' : 'View Airport Hub'}
            </button>
            <button
              onClick={() => onExploreCatalog()}
              className="bg-white hover:bg-stone-50 text-stone-900 text-xs sm:text-sm font-medium px-5 py-3 rounded-lg border border-stone-300 transition-colors cursor-pointer"
            >
              {lang === 'es' ? 'Seleccionar vehículo' : 'Choose Vehicle'}
            </button>
          </div>
        </div>
      </section>
    </div>
  );
};
