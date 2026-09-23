import React, { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import { MapPin, Phone, Clock, Navigation, ExternalLink, Check } from 'lucide-react';
import { Branch, Language } from '../types';
import { t } from '../services/i18n';

interface BranchesViewProps {
  branches: Branch[];
  lang: Language;
  onSelectBranchForRental: (branchId: string) => void;
  selectedBranchId?: string;
}

export const BranchesView: React.FC<BranchesViewProps> = ({
  branches,
  lang,
  onSelectBranchForRental,
  selectedBranchId
}) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const markersRef = useRef<Record<string, L.Marker>>({});
  const [activeBranchId, setActiveBranchId] = useState<string>(selectedBranchId || branches[0]?.id || 'b1');

  useEffect(() => {
    if (!mapContainerRef.current) return;

    if (!mapInstanceRef.current) {
      // El Salvador center coordinates: ~13.75, -88.9
      const map = L.map(mapContainerRef.current, {
        center: [13.72, -89.05],
        zoom: 9,
        scrollWheelZoom: false
      });

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
      }).addTo(map);

      mapInstanceRef.current = map;
    }

    const map = mapInstanceRef.current;

    // Custom marker icon HTML
    const createCustomIcon = (isSelected: boolean) => {
      return L.divIcon({
        className: 'custom-leaflet-marker',
        html: `
          <div style="
            background-color: ${isSelected ? '#D9822B' : '#1C2738'};
            color: #FFFFFF;
            width: 34px;
            height: 34px;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            box-shadow: 0 4px 12px rgba(0,0,0,0.3);
            border: 2px solid #FFFFFF;
            font-size: 14px;
          ">
            📍
          </div>
        `,
        iconSize: [34, 34],
        iconAnchor: [17, 17],
        popupAnchor: [0, -18]
      });
    };

    // Clear old markers
    Object.values(markersRef.current).forEach(m => m.remove());
    markersRef.current = {};

    branches.forEach(branch => {
      const isSelected = branch.id === activeBranchId;
      const marker = L.marker([branch.lat, branch.lng], {
        icon: createCustomIcon(isSelected)
      }).addTo(map);

      marker.bindPopup(`
        <div style="min-width: 180px; padding: 4px;">
          <h4 style="font-weight: 700; margin: 0 0 4px 0; color: #1C2738; font-size: 13px;">${branch.name}</h4>
          <p style="font-size: 11px; margin: 0 0 6px 0; color: #555;">${branch.address}</p>
          <div style="font-size: 10px; font-family: monospace; color: #D9822B; margin-bottom: 6px;">📞 ${branch.phone}</div>
          <div style="font-size: 10px; color: #777;">🕒 ${branch.hours}</div>
        </div>
      `);

      marker.on('click', () => {
        setActiveBranchId(branch.id);
      });

      markersRef.current[branch.id] = marker;
    });

    return () => {
      // Keep map alive unless unmounted
    };
  }, [branches]);

  // Focus map when active branch changes
  useEffect(() => {
    if (!mapInstanceRef.current) return;
    const target = branches.find(b => b.id === activeBranchId);
    if (target) {
      mapInstanceRef.current.flyTo([target.lat, target.lng], 13, { duration: 1.2 });
      const marker = markersRef.current[target.id];
      if (marker) {
        marker.openPopup();
      }
    }
  }, [activeBranchId, branches]);

  const handleBranchClick = (branch: Branch) => {
    setActiveBranchId(branch.id);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      
      {/* Header */}
      <div className="max-w-3xl mb-8">
        <span className="text-xs font-mono uppercase tracking-wider text-amber-800 font-semibold">
          {lang === 'es' ? 'Cobertura Nacional' : 'Nationwide Coverage'}
        </span>
        <h1 className="font-serif text-3xl sm:text-4xl font-bold text-stone-900 mt-1">
          {t('branches.title', lang)}
        </h1>
        <p className="mt-2 text-sm sm:text-base text-stone-600">
          {t('branches.subtitle', lang)}
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left Column: Interactive Map */}
        <div className="lg:col-span-7 bg-white rounded-3xl overflow-hidden border border-stone-200 shadow-sm flex flex-col">
          <div className="p-4 bg-stone-50 border-b border-stone-200 flex items-center justify-between text-xs">
            <span className="font-semibold text-stone-700 flex items-center gap-1.5">
              <Navigation className="w-3.5 h-3.5 text-amber-600" />
              {lang === 'es' ? 'Mapa interactivo de El Salvador (OSM / Leaflet)' : 'Interactive El Salvador Map'}
            </span>
            <span className="font-mono text-stone-500">
              {branches.length} {lang === 'es' ? 'sucursales operativas' : 'active hubs'}
            </span>
          </div>

          <div
            ref={mapContainerRef}
            className="w-full h-[420px] sm:h-[480px] z-10"
            style={{ minHeight: '400px' }}
          />

          <div className="p-4 bg-stone-50 border-t border-stone-200 flex items-center justify-between text-[11px] text-stone-500 font-mono">
            <span>© OpenStreetMap · Cobertura San Salvador, Santa Ana, San Miguel, Aeropuerto y Surf City</span>
          </div>
        </div>

        {/* Right Column: Branch Directory Cards */}
        <div className="lg:col-span-5 space-y-4">
          <div className="text-xs font-mono text-stone-500 uppercase pb-1">
            {t('branches.filter_label', lang)}
          </div>

          {branches.map(branch => {
            const isActive = branch.id === activeBranchId;
            return (
              <div
                key={branch.id}
                onClick={() => handleBranchClick(branch)}
                className={`p-5 rounded-2xl border transition-all duration-200 cursor-pointer ${
                  isActive
                    ? 'bg-white border-amber-600 shadow-md ring-1 ring-amber-600'
                    : 'bg-white border-stone-200 hover:border-stone-300 shadow-sm'
                }`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <h3 className="font-serif text-base font-bold text-stone-900">
                        {branch.name}
                      </h3>
                      {isActive && (
                        <span className="text-[10px] font-mono text-amber-700 bg-amber-50 border border-amber-200 px-1.5 py-0.5 rounded">
                          {lang === 'es' ? 'En mapa' : 'Active'}
                        </span>
                      )}
                    </div>

                    <p className="mt-1.5 text-xs text-stone-600 leading-relaxed flex items-start gap-1.5">
                      <MapPin className="w-3.5 h-3.5 text-stone-400 shrink-0 mt-0.5" />
                      <span>{branch.address}</span>
                    </p>

                    <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1 text-xs font-mono text-stone-600">
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3 text-stone-400" />
                        <span>{branch.hours}</span>
                      </span>
                      <a
                        href={`tel:${branch.phone.replace(/[^0-9+]/g, '')}`}
                        onClick={(e) => e.stopPropagation()}
                        className="flex items-center gap-1 text-amber-800 hover:underline"
                      >
                        <Phone className="w-3 h-3" />
                        <span>{branch.phone}</span>
                      </a>
                    </div>
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-stone-100 flex items-center justify-between">
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleBranchClick(branch);
                    }}
                    className="text-xs text-stone-600 hover:text-stone-900 flex items-center gap-1 font-mono cursor-pointer"
                  >
                    <span>{lang === 'es' ? 'Centrar mapa' : 'Center map'}</span>
                    <ExternalLink className="w-3 h-3" />
                  </button>

                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      onSelectBranchForRental(branch.id);
                    }}
                    className="px-3 py-1.5 bg-stone-900 hover:bg-stone-800 text-white rounded-lg text-xs font-medium transition-colors cursor-pointer"
                  >
                    {t('branches.btn.select', lang)}
                  </button>
                </div>
              </div>
            );
          })}
        </div>

      </div>
    </div>
  );
};
