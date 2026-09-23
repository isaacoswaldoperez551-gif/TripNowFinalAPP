import React, { useState, useMemo } from 'react';
import { Search, SlidersHorizontal, Plus, Minus, ShoppingBag, ArrowRight, Check, AlertCircle } from 'lucide-react';
import { Vehicle, VehicleType, TransmissionType, FuelType, Language } from '../types';
import { t, translateValue } from '../services/i18n';

interface CatalogViewProps {
  vehicles: Vehicle[];
  lang: Language;
  onAddToCart: (vehicleId: string, days: number) => void;
  onDirectBook: (vehicleId: string, days: number) => void;
  initialTypeFilter?: string;
}

export const CatalogView: React.FC<CatalogViewProps> = ({
  vehicles,
  lang,
  onAddToCart,
  onDirectBook,
  initialTypeFilter = 'all'
}) => {
  const [selectedType, setSelectedType] = useState<string>(initialTypeFilter);
  const [selectedTransmission, setSelectedTransmission] = useState<string>('all');
  const [selectedFuel, setSelectedFuel] = useState<string>('all');
  const [minPassengers, setMinPassengers] = useState<number>(1);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc' | 'default'>('default');

  // Days state map per vehicle so customer can preview total before adding
  const [vehicleDays, setVehicleDays] = useState<Record<string, number>>({});

  const getDays = (vehicleId: string): number => {
    return vehicleDays[vehicleId] || 3;
  };

  const updateDays = (vehicleId: string, delta: number) => {
    const current = getDays(vehicleId);
    const updated = Math.max(1, Math.min(30, current + delta));
    setVehicleDays(prev => ({ ...prev, [vehicleId]: updated }));
  };

  // Filter logic
  const filteredVehicles = useMemo(() => {
    return vehicles.filter(v => {
      // Type filter
      if (selectedType !== 'all' && v.type !== selectedType) return false;
      // Transmission filter
      if (selectedTransmission !== 'all' && v.transmission !== selectedTransmission) return false;
      // Fuel filter
      if (selectedFuel !== 'all' && v.fuel !== selectedFuel) return false;
      // Passengers filter
      if (v.passengers < minPassengers) return false;
      // Search term
      if (searchTerm.trim()) {
        const term = searchTerm.toLowerCase();
        const matchBrand = v.brand.toLowerCase().includes(term);
        const matchName = v.name.toLowerCase().includes(term);
        const matchType = v.type.toLowerCase().includes(term);
        if (!matchBrand && !matchName && !matchType) return false;
      }
      return true;
    }).sort((a, b) => {
      if (sortOrder === 'asc') return a.pricePerDay - b.pricePerDay;
      if (sortOrder === 'desc') return b.pricePerDay - a.pricePerDay;
      return 0;
    });
  }, [vehicles, selectedType, selectedTransmission, selectedFuel, minPassengers, searchTerm, sortOrder]);

  const categories = [
    { id: 'all', label: t('catalog.filter.all', lang) },
    { id: 'Camioneta', label: t('catalog.filter.Camioneta', lang) },
    { id: 'SUV', label: t('catalog.filter.SUV', lang) },
    { id: 'Sedán', label: t('catalog.filter.Sedán', lang) },
    { id: 'Compacto', label: t('catalog.filter.Compacto', lang) },
    { id: 'Motocicleta', label: t('catalog.filter.Motocicleta', lang) },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      
      {/* Header */}
      <div className="max-w-3xl mb-8">
        <span className="text-xs font-mono uppercase tracking-wider text-amber-800 font-semibold">
          {lang === 'es' ? 'Flota en El Salvador' : 'Fleet in El Salvador'}
        </span>
        <h1 className="font-serif text-3xl sm:text-4xl font-bold text-stone-900 mt-1">
          {t('catalog.title', lang)}
        </h1>
        <p className="mt-2 text-sm sm:text-base text-stone-600">
          {t('catalog.subtitle', lang)}
        </p>
      </div>

      {/* Filter Bar */}
      <div className="bg-white p-5 rounded-2xl border border-stone-200 shadow-sm mb-8 space-y-4">
        {/* Category Pills (Functional filter buttons per anti-slop rules) */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-2 scrollbar-none">
          {categories.map(cat => (
            <button
              key={cat.id}
              onClick={() => setSelectedType(cat.id)}
              className={`px-3.5 py-1.5 text-xs font-medium rounded-lg whitespace-nowrap transition-colors cursor-pointer ${
                selectedType === cat.id
                  ? 'bg-stone-900 text-white shadow-sm'
                  : 'bg-stone-100 text-stone-700 hover:bg-stone-200'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>

        {/* Secondary Filters Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 pt-2 border-t border-stone-100">
          {/* Search text */}
          <div className="relative lg:col-span-2">
            <Search className="w-4 h-4 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder={t('catalog.filter.search_placeholder', lang)}
              className="w-full text-xs bg-stone-50 border border-stone-200 rounded-lg pl-9 pr-3 py-2 text-stone-900 focus:outline-none focus:ring-2 focus:ring-amber-500"
            />
          </div>

          {/* Transmission */}
          <div>
            <select
              value={selectedTransmission}
              onChange={(e) => setSelectedTransmission(e.target.value)}
              className="w-full text-xs bg-stone-50 border border-stone-200 rounded-lg px-3 py-2 text-stone-900 focus:outline-none focus:ring-2 focus:ring-amber-500"
            >
              <option value="all">{lang === 'es' ? 'Cualquier transmisión' : 'Any transmission'}</option>
              <option value="Automático">{translateValue('Automático', lang)}</option>
              <option value="Manual">{translateValue('Manual', lang)}</option>
            </select>
          </div>

          {/* Fuel */}
          <div>
            <select
              value={selectedFuel}
              onChange={(e) => setSelectedFuel(e.target.value)}
              className="w-full text-xs bg-stone-50 border border-stone-200 rounded-lg px-3 py-2 text-stone-900 focus:outline-none focus:ring-2 focus:ring-amber-500"
            >
              <option value="all">{lang === 'es' ? 'Cualquier combustible' : 'Any fuel'}</option>
              <option value="Gasolina">{translateValue('Gasolina', lang)}</option>
              <option value="Híbrido">{translateValue('Híbrido', lang)}</option>
              <option value="Eléctrico">{translateValue('Eléctrico', lang)}</option>
            </select>
          </div>

          {/* Min Passengers */}
          <div>
            <select
              value={minPassengers}
              onChange={(e) => setMinPassengers(Number(e.target.value))}
              className="w-full text-xs bg-stone-50 border border-stone-200 rounded-lg px-3 py-2 text-stone-900 focus:outline-none focus:ring-2 focus:ring-amber-500"
            >
              <option value={1}>{lang === 'es' ? '1+ Pasajeros' : '1+ Passengers'}</option>
              <option value={2}>{lang === 'es' ? '2+ Pasajeros' : '2+ Passengers'}</option>
              <option value={4}>{lang === 'es' ? '4+ Pasajeros' : '4+ Passengers'}</option>
              <option value={5}>{lang === 'es' ? '5+ Pasajeros' : '5+ Passengers'}</option>
            </select>
          </div>
        </div>
      </div>

      {/* Results Count & Sort */}
      <div className="flex items-center justify-between text-xs text-stone-500 font-mono mb-6">
        <span>{filteredVehicles.length} {lang === 'es' ? 'vehículos encontrados' : 'vehicles found'}</span>
        <div className="flex items-center gap-2">
          <span>{lang === 'es' ? 'Ordenar por precio:' : 'Sort by price:'}</span>
          <select
            value={sortOrder}
            onChange={(e) => setSortOrder(e.target.value as any)}
            className="bg-transparent text-stone-900 font-semibold focus:outline-none cursor-pointer"
          >
            <option value="default">{lang === 'es' ? 'Destacados' : 'Featured'}</option>
            <option value="asc">{lang === 'es' ? 'Menor a mayor' : 'Low to high'}</option>
            <option value="desc">{lang === 'es' ? 'Mayor a menor' : 'High to low'}</option>
          </select>
        </div>
      </div>

      {/* Vehicle Grid */}
      {filteredVehicles.length === 0 ? (
        <div className="bg-white rounded-2xl p-12 text-center border border-stone-200">
          <AlertCircle className="w-10 h-10 text-stone-400 mx-auto mb-3" />
          <h3 className="font-serif text-lg font-bold text-stone-900">{t('catalog.empty', lang)}</h3>
          <p className="text-xs text-stone-500 mt-1 max-w-sm mx-auto">
            {lang === 'es' ? 'Intenta restablecer los filtros de transmisión o combustible para ver más modelos.' : 'Try resetting your filters to see more available options.'}
          </p>
          <button
            onClick={() => {
              setSelectedType('all');
              setSelectedTransmission('all');
              setSelectedFuel('all');
              setMinPassengers(1);
              setSearchTerm('');
            }}
            className="mt-4 px-4 py-2 bg-stone-900 text-white rounded-lg text-xs font-medium cursor-pointer"
          >
            {lang === 'es' ? 'Restablecer filtros' : 'Reset filters'}
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredVehicles.map(vehicle => {
            const days = getDays(vehicle.id);
            const estimatedTotal = vehicle.pricePerDay * days;
            const isAvailable = !vehicle.paused && vehicle.stock > 0;

            return (
              <div
                key={vehicle.id}
                className={`bg-white rounded-2xl border transition-all duration-200 flex flex-col justify-between overflow-hidden ${
                  !isAvailable
                    ? 'border-stone-200 opacity-75'
                    : 'border-stone-200 hover:border-stone-400 hover:shadow-lg'
                }`}
              >
                {/* Visual Image Slot with Zero Broken Image Policy */}
                <div className="relative aspect-[4/3] bg-stone-100 overflow-hidden">
                  <img
                    src={vehicle.imageUrl}
                    alt={`${vehicle.brand} ${vehicle.name}`}
                    className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-300"
                    referrerPolicy="no-referrer"
                    onError={(e) => {
                      // Fallback gracefully to styled placeholder if custom image fails
                      (e.target as HTMLElement).style.display = 'none';
                    }}
                  />
                  {/* Category tag */}
                  <div className="absolute top-3 left-3 bg-stone-900/80 backdrop-blur-md text-white text-[11px] font-mono px-2 py-0.5 rounded">
                    {translateValue(vehicle.type, lang)}
                  </div>

                  {/* Stock or status tag */}
                  {vehicle.paused ? (
                    <div className="absolute top-3 right-3 bg-amber-900/90 text-amber-100 text-[11px] font-mono px-2 py-0.5 rounded">
                      {t('catalog.paused', lang)}
                    </div>
                  ) : vehicle.stock <= 0 ? (
                    <div className="absolute top-3 right-3 bg-rose-900/90 text-rose-100 text-[11px] font-mono px-2 py-0.5 rounded">
                      {t('catalog.out_of_stock', lang)}
                    </div>
                  ) : (
                    <div className="absolute top-3 right-3 bg-stone-900/80 backdrop-blur-md text-white text-[11px] font-mono px-2 py-0.5 rounded">
                      {vehicle.stock} {t('catalog.stock_left', lang)}
                    </div>
                  )}
                </div>

                {/* Card Body */}
                <div className="p-6 flex-1 flex flex-col justify-between">
                  <div>
                    <div className="text-xs font-mono text-stone-500 uppercase tracking-wider">
                      {vehicle.brand}
                    </div>
                    <h3 className="font-serif text-xl font-bold text-stone-900 mt-0.5">
                      {vehicle.name}
                    </h3>

                    {/* Unboxed Metadata with separators */}
                    <div className="mt-3 flex items-center gap-2 text-xs text-stone-600 font-mono">
                      <span>{translateValue(vehicle.transmission, lang)}</span>
                      <span aria-hidden="true">·</span>
                      <span>{translateValue(vehicle.fuel, lang)}</span>
                      <span aria-hidden="true">·</span>
                      <span>{vehicle.passengers} {t('common.passengers', lang)}</span>
                    </div>

                    {/* Interactive Days Stepper & Live Price preview */}
                    <div className="mt-5 p-3 bg-stone-50 rounded-xl border border-stone-200">
                      <div className="flex items-center justify-between text-xs text-stone-600 mb-2">
                        <span className="font-medium">{t('catalog.days_selector', lang)}</span>
                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => updateDays(vehicle.id, -1)}
                            disabled={days <= 1}
                            className="p-1 rounded bg-white border border-stone-300 hover:bg-stone-100 disabled:opacity-40 cursor-pointer"
                            aria-label="Restar día"
                          >
                            <Minus className="w-3 h-3 text-stone-700" />
                          </button>
                          <span className="font-mono font-bold text-stone-900 min-w-[20px] text-center">
                            {days}
                          </span>
                          <button
                            type="button"
                            onClick={() => updateDays(vehicle.id, 1)}
                            disabled={days >= 30}
                            className="p-1 rounded bg-white border border-stone-300 hover:bg-stone-100 disabled:opacity-40 cursor-pointer"
                            aria-label="Sumar día"
                          >
                            <Plus className="w-3 h-3 text-stone-700" />
                          </button>
                        </div>
                      </div>

                      <div className="flex items-baseline justify-between pt-2 border-t border-stone-200/60">
                        <span className="text-xs text-stone-500 font-mono">
                          ${vehicle.pricePerDay} × {days} d =
                        </span>
                        <span className="font-serif text-lg font-bold text-stone-900 font-mono tabular-nums">
                          ${estimatedTotal} <span className="text-xs font-normal text-stone-500">USD</span>
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="mt-6 pt-4 border-t border-stone-100 flex items-center gap-2">
                    <button
                      type="button"
                      disabled={!isAvailable}
                      onClick={() => onAddToCart(vehicle.id, days)}
                      className="flex-1 py-2.5 px-3 bg-stone-100 hover:bg-stone-200 text-stone-900 font-medium text-xs rounded-lg transition-colors flex items-center justify-center gap-1.5 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
                    >
                      <ShoppingBag className="w-3.5 h-3.5" />
                      <span>{t('catalog.btn.add', lang)}</span>
                    </button>

                    <button
                      type="button"
                      disabled={!isAvailable}
                      onClick={() => onDirectBook(vehicle.id, days)}
                      className="flex-1 py-2.5 px-3 bg-stone-900 hover:bg-stone-800 text-white font-medium text-xs rounded-lg transition-colors flex items-center justify-center gap-1.5 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer shadow-sm"
                    >
                      <span>{t('catalog.btn.reserve_now', lang)}</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
