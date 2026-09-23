import React, { useState } from 'react';
import { Trash2, Plus, Minus, Calendar, MapPin, CheckCircle2, ShieldCheck, ArrowRight, UserCheck, AlertTriangle } from 'lucide-react';
import { CartItem, Vehicle, Branch, UserProfile, Language, Reservation } from '../types';
import { t } from '../services/i18n';
import { useToast } from './Toast';

interface CartViewProps {
  cart: CartItem[];
  vehicles: Vehicle[];
  branches: Branch[];
  profile: UserProfile | null;
  lang: Language;
  onUpdateDays: (vehicleId: string, days: number) => void;
  onRemoveItem: (vehicleId: string) => void;
  onClearCart: () => void;
  onConfirmPurchase: (branchId: string, pickupDate: string, profileData: UserProfile) => Promise<Reservation[] | null>;
  onNavigateToCatalog: () => void;
  onOpenAuthModal: () => void;
}

export const CartView: React.FC<CartViewProps> = ({
  cart,
  vehicles,
  branches,
  profile,
  lang,
  onUpdateDays,
  onRemoveItem,
  onClearCart,
  onConfirmPurchase,
  onNavigateToCatalog,
  onOpenAuthModal
}) => {
  const toast = useToast();
  const todayStr = new Date().toISOString().split('T')[0];

  const [selectedBranchId, setSelectedBranchId] = useState<string>(branches[0]?.id || 'b1');
  const [pickupDate, setPickupDate] = useState<string>(todayStr);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [completedReservations, setCompletedReservations] = useState<Reservation[] | null>(null);

  // Inlined customer details in case user is not logged in yet
  const [guestName, setGuestName] = useState(profile?.nombre || '');
  const [guestEmail, setGuestEmail] = useState(profile?.email || '');
  const [guestPhone, setGuestPhone] = useState(profile?.telefono || '');

  // Calculate items with vehicle info
  const cartDetails = cart.map(item => {
    const vehicle = vehicles.find(v => v.id === item.vehicleId);
    return {
      ...item,
      vehicle,
      subtotal: vehicle ? vehicle.pricePerDay * item.days : 0
    };
  }).filter(item => item.vehicle !== undefined);

  const grandTotal = cartDetails.reduce((sum, item) => sum + item.subtotal, 0);
  const maxDays = Math.max(...cart.map(c => c.days), 1);

  // Calculate estimated return date
  const calculateReturnDate = (start: string, days: number): string => {
    try {
      const d = new Date(start);
      d.setDate(d.getDate() + days);
      return d.toISOString().split('T')[0];
    } catch {
      return start;
    }
  };

  const returnDate = calculateReturnDate(pickupDate, maxDays);
  const selectedBranch = branches.find(b => b.id === selectedBranchId) || branches[0];

  const handleCheckout = async (e: React.FormEvent) => {
    e.preventDefault();

    const clientProfile: UserProfile = {
      nombre: (profile?.nombre || guestName).trim(),
      email: (profile?.email || guestEmail).toLowerCase().trim(),
      telefono: (profile?.telefono || guestPhone).trim()
    };

    if (!clientProfile.nombre || !clientProfile.email || !clientProfile.telefono) {
      toast.warning(
        lang === 'es' ? 'Datos incompletos' : 'Incomplete details',
        lang === 'es' ? 'Por favor completa tu nombre, correo y teléfono para emitir la reserva.' : 'Please provide your name, email, and phone to confirm booking.'
      );
      return;
    }

    if (!clientProfile.email.includes('@')) {
      toast.warning(
        lang === 'es' ? 'Correo inválido' : 'Invalid email',
        lang === 'es' ? 'Ingresa un correo electrónico válido.' : 'Please enter a valid email address.'
      );
      return;
    }

    // Check stock for all items
    for (const item of cartDetails) {
      if (!item.vehicle || item.vehicle.paused || item.vehicle.stock <= 0) {
        toast.error(
          lang === 'es' ? 'Vehículo no disponible' : 'Vehicle unavailable',
          lang === 'es'
            ? `El vehículo ${item.vehicle?.name || ''} no tiene stock suficiente en este momento.`
            : `Vehicle ${item.vehicle?.name || ''} is currently out of stock.`
        );
        return;
      }
    }

    setIsProcessing(true);
    try {
      const result = await onConfirmPurchase(selectedBranchId, pickupDate, clientProfile);
      if (result && result.length > 0) {
        setCompletedReservations(result);
        toast.success(
          lang === 'es' ? '¡Reserva confirmada!' : 'Booking confirmed!',
          lang === 'es' ? 'Sincronizada con Google Sheets y registrada localmente.' : 'Synced to Google Sheets and saved locally.'
        );
      } else {
        toast.error(
          lang === 'es' ? 'Error al procesar' : 'Checkout error',
          lang === 'es' ? 'No se pudo procesar la reserva. Verifica el stock disponible.' : 'Could not process reservation. Please check vehicle availability.'
        );
      }
    } catch (err: any) {
      toast.error('Error', err.message);
    } finally {
      setIsProcessing(false);
    }
  };

  // Receipt Modal after successful reservation
  if (completedReservations) {
    return (
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="bg-white rounded-3xl p-8 sm:p-12 border border-emerald-200 shadow-xl text-center">
          <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-5">
            <CheckCircle2 className="w-10 h-10" />
          </div>

          <span className="text-xs font-mono uppercase tracking-wider text-emerald-700 font-semibold">
            {t('cart.sync_badge', lang)}
          </span>
          <h1 className="font-serif text-3xl font-bold text-stone-900 mt-2">
            {t('cart.success_title', lang)}
          </h1>
          <p className="mt-2 text-sm text-stone-600 max-w-lg mx-auto">
            {t('cart.success_desc', lang)}
          </p>

          {/* Receipt Card */}
          <div className="mt-8 bg-stone-50 rounded-2xl p-6 border border-stone-200 text-left font-mono text-xs space-y-4">
            <div className="flex justify-between border-b border-stone-200 pb-3">
              <span className="text-stone-500">CLIENTE / TITULAR:</span>
              <span className="font-bold text-stone-900">{guestName || profile?.nombre}</span>
            </div>
            <div className="flex justify-between border-b border-stone-200 pb-3">
              <span className="text-stone-500">CORREO / CONTACTO:</span>
              <span className="text-stone-900">{guestEmail || profile?.email} · {guestPhone || profile?.telefono}</span>
            </div>
            <div className="flex justify-between border-b border-stone-200 pb-3">
              <span className="text-stone-500">SUCURSAL DE RETIRO:</span>
              <span className="font-bold text-stone-900">{selectedBranch.name}</span>
            </div>
            <div className="flex justify-between border-b border-stone-200 pb-3">
              <span className="text-stone-500">PERÍODO DE ALQUILER:</span>
              <span className="font-bold text-stone-900">{pickupDate} &rarr; {returnDate}</span>
            </div>

            <div className="pt-2">
              <span className="text-stone-500 block mb-2 font-semibold">VEHÍCULOS ASIGNADOS:</span>
              {completedReservations.map((r) => (
                <div key={r.id} className="flex justify-between py-1.5 border-b border-stone-200/60 text-stone-800">
                  <span>{r.vehicleName} ({r.days} d)</span>
                  <span className="font-bold">${r.total} USD</span>
                </div>
              ))}
            </div>

            <div className="flex justify-between pt-3 text-sm font-bold text-stone-900 border-t border-stone-300">
              <span>TOTAL CANCELADO/PAGADERO:</span>
              <span className="text-base">${completedReservations.reduce((sum, r) => sum + r.total, 0)} USD</span>
            </div>
          </div>

          <div className="mt-8 flex flex-col sm:flex-row gap-3 justify-center">
            <button
              onClick={() => {
                setCompletedReservations(null);
                onNavigateToCatalog();
              }}
              className="px-6 py-3 bg-stone-900 hover:bg-stone-800 text-white rounded-xl text-xs font-semibold transition-colors cursor-pointer"
            >
              {lang === 'es' ? 'Volver al Catálogo' : 'Back to Fleet'}
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Empty cart view
  if (cart.length === 0) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-16 text-center">
        <div className="bg-white rounded-3xl p-10 border border-stone-200 shadow-sm">
          <Calendar className="w-12 h-12 text-stone-400 mx-auto mb-4" />
          <h2 className="font-serif text-2xl font-bold text-stone-900">
            {t('cart.empty_title', lang)}
          </h2>
          <p className="mt-2 text-sm text-stone-600 max-w-md mx-auto">
            {t('cart.empty_desc', lang)}
          </p>
          <button
            onClick={onNavigateToCatalog}
            className="mt-6 px-6 py-3 bg-stone-900 hover:bg-stone-800 text-white rounded-xl text-xs font-semibold transition-colors inline-flex items-center gap-2 cursor-pointer"
          >
            <span>{t('cart.empty_btn', lang)}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      
      {/* Header */}
      <div className="max-w-3xl mb-8">
        <span className="text-xs font-mono uppercase tracking-wider text-amber-800 font-semibold">
          {lang === 'es' ? 'Paso final' : 'Final Step'}
        </span>
        <h1 className="font-serif text-3xl sm:text-4xl font-bold text-stone-900 mt-1">
          {t('cart.title', lang)}
        </h1>
        <p className="mt-2 text-sm text-stone-600">
          {t('cart.subtitle', lang)}
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Left Column: Cart Items List */}
        <div className="lg:col-span-7 space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-stone-200">
            <span className="text-xs font-mono text-stone-500 uppercase">
              {cart.length} {lang === 'es' ? 'vehículo(s) en reserva' : 'vehicle(s) selected'}
            </span>
            <button
              onClick={onClearCart}
              className="text-xs text-stone-500 hover:text-rose-600 transition-colors cursor-pointer"
            >
              {lang === 'es' ? 'Vaciar carrito' : 'Clear all'}
            </button>
          </div>

          {cartDetails.map(item => {
            const v = item.vehicle!;
            return (
              <div
                key={item.vehicleId}
                className="bg-white rounded-2xl p-5 border border-stone-200 shadow-sm flex flex-col sm:flex-row gap-5 items-center justify-between"
              >
                {/* Thumbnail */}
                <div className="w-full sm:w-32 aspect-[4/3] rounded-xl overflow-hidden bg-stone-100 shrink-0">
                  <img
                    src={v.imageUrl}
                    alt={v.name}
                    className="w-full h-full object-cover"
                    referrerPolicy="no-referrer"
                  />
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0 w-full sm:w-auto">
                  <div className="text-xs font-mono text-stone-500 uppercase">{v.brand}</div>
                  <h3 className="font-serif text-lg font-bold text-stone-900 truncate">{v.name}</h3>
                  <div className="mt-1 text-xs text-stone-600 font-mono">
                    <span>${v.pricePerDay} USD/día</span>
                    <span className="mx-2">·</span>
                    <span>{v.transmission}</span>
                  </div>

                  {/* Days Stepper */}
                  <div className="mt-3 flex items-center gap-3">
                    <span className="text-xs text-stone-600">{t('cart.item_days', lang)}:</span>
                    <div className="flex items-center gap-1.5 bg-stone-50 px-2 py-1 rounded-lg border border-stone-200">
                      <button
                        type="button"
                        onClick={() => onUpdateDays(v.id, item.days - 1)}
                        className="p-1 hover:bg-stone-200 rounded transition-colors cursor-pointer"
                        aria-label="Restar día"
                      >
                        <Minus className="w-3 h-3 text-stone-700" />
                      </button>
                      <span className="font-mono text-xs font-bold text-stone-900 min-w-[24px] text-center">
                        {item.days}
                      </span>
                      <button
                        type="button"
                        onClick={() => onUpdateDays(v.id, item.days + 1)}
                        className="p-1 hover:bg-stone-200 rounded transition-colors cursor-pointer"
                        aria-label="Sumar día"
                      >
                        <Plus className="w-3 h-3 text-stone-700" />
                      </button>
                    </div>
                  </div>
                </div>

                {/* Subtotal & Delete */}
                <div className="flex sm:flex-col items-center sm:items-end justify-between w-full sm:w-auto gap-4 pt-3 sm:pt-0 border-t sm:border-t-0 border-stone-100">
                  <div className="text-right">
                    <span className="text-[11px] text-stone-500 block font-mono">Subtotal</span>
                    <span className="font-serif text-lg font-bold text-stone-900 font-mono tabular-nums">
                      ${item.subtotal} <span className="text-xs font-normal text-stone-600">USD</span>
                    </span>
                  </div>

                  <button
                    onClick={() => onRemoveItem(v.id)}
                    className="p-2 text-stone-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                    title="Eliminar de carrito"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {/* Right Column: Checkout Configuration & Confirmation Form */}
        <div className="lg:col-span-5 bg-white rounded-3xl p-6 sm:p-8 border border-stone-200 shadow-sm space-y-6">
          <h2 className="font-serif text-xl font-bold text-stone-900 border-b border-stone-100 pb-3">
            {lang === 'es' ? 'Agendamiento y Entrega' : 'Scheduling & Delivery'}
          </h2>

          <form onSubmit={handleCheckout} className="space-y-5">
            {/* Branch Selection */}
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-stone-700 mb-1.5 flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-amber-600" />
                {t('cart.branch_label', lang)}
              </label>
              <select
                value={selectedBranchId}
                onChange={(e) => setSelectedBranchId(e.target.value)}
                className="w-full text-xs font-medium bg-stone-50 border border-stone-200 rounded-lg px-3 py-2.5 text-stone-900 focus:outline-none focus:ring-2 focus:ring-amber-500"
              >
                {branches.map(b => (
                  <option key={b.id} value={b.id}>{b.name}</option>
                ))}
              </select>
              <p className="mt-1.5 text-[11px] text-stone-500 font-mono">
                {selectedBranch.address} ({selectedBranch.hours})
              </p>
            </div>

            {/* Dates: Pickup & Calculated Return */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-stone-700 mb-1.5 flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5 text-amber-600" />
                  {t('cart.date_label', lang)}
                </label>
                <input
                  type="date"
                  min={todayStr}
                  value={pickupDate}
                  onChange={(e) => setPickupDate(e.target.value)}
                  className="w-full text-xs font-medium bg-stone-50 border border-stone-200 rounded-lg px-3 py-2 text-stone-900 focus:outline-none focus:ring-2 focus:ring-amber-500"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-stone-500 mb-1.5">
                  {lang === 'es' ? 'Devolución estimada' : 'Estimated Return'}
                </label>
                <div className="w-full text-xs font-mono bg-stone-100 border border-stone-200 rounded-lg px-3 py-2.5 text-stone-700">
                  {returnDate}
                </div>
              </div>
            </div>

            {/* Customer Identification */}
            <div className="pt-3 border-t border-stone-100">
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-semibold uppercase tracking-wider text-stone-800 flex items-center gap-1.5">
                  <UserCheck className="w-3.5 h-3.5 text-amber-600" />
                  {t('cart.client_details', lang)}
                </span>
                {profile && (
                  <span className="text-[11px] text-emerald-700 font-mono">
                    ✓ {lang === 'es' ? 'Sesión activa' : 'Identified'}
                  </span>
                )}
              </div>

              <div className="space-y-3">
                <div>
                  <input
                    type="text"
                    name="tn_cart_guest_name"
                    autoComplete="off"
                    data-lpignore="true"
                    spellCheck={false}
                    required
                    placeholder={t('cart.name_placeholder', lang)}
                    value={profile ? profile.nombre : guestName}
                    onChange={(e) => setGuestName(e.target.value)}
                    disabled={!!profile}
                    className="w-full text-xs bg-stone-50 border border-stone-200 rounded-lg px-3 py-2 text-stone-900 disabled:bg-stone-100 focus:outline-none focus:ring-2 focus:ring-amber-500"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <input
                    type="email"
                    name="tn_cart_guest_email"
                    autoComplete="off"
                    data-lpignore="true"
                    spellCheck={false}
                    required
                    placeholder={t('cart.email_placeholder', lang)}
                    value={profile ? profile.email : guestEmail}
                    onChange={(e) => setGuestEmail(e.target.value)}
                    disabled={!!profile}
                    className="w-full text-xs bg-stone-50 border border-stone-200 rounded-lg px-3 py-2 text-stone-900 disabled:bg-stone-100 focus:outline-none focus:ring-2 focus:ring-amber-500"
                  />
                  <input
                    type="tel"
                    name="tn_cart_guest_phone"
                    autoComplete="off"
                    data-lpignore="true"
                    spellCheck={false}
                    required
                    placeholder={t('cart.phone_placeholder', lang)}
                    value={profile ? profile.telefono : guestPhone}
                    onChange={(e) => setGuestPhone(e.target.value)}
                    disabled={!!profile}
                    className="w-full text-xs bg-stone-50 border border-stone-200 rounded-lg px-3 py-2 text-stone-900 disabled:bg-stone-100 focus:outline-none focus:ring-2 focus:ring-amber-500"
                  />
                </div>
              </div>
            </div>

            {/* Price Breakdown */}
            <div className="pt-4 border-t border-stone-100 space-y-2 text-xs font-mono">
              <div className="flex justify-between text-stone-600">
                <span>Subtotal alquiler</span>
                <span>${grandTotal} USD</span>
              </div>
              <div className="flex justify-between text-stone-600">
                <span>Seguro de cobertura básica</span>
                <span className="text-emerald-700">Incluido $0.00</span>
              </div>
              <div className="flex justify-between text-stone-600">
                <span>Impuestos locales (IVA 13%)</span>
                <span>Incluido</span>
              </div>
              <div className="flex justify-between text-base font-bold text-stone-900 pt-2 border-t border-stone-200">
                <span>TOTAL A PAGAR</span>
                <span>${grandTotal} USD</span>
              </div>
            </div>

            {/* Confirm Purchase Button */}
            <button
              type="submit"
              disabled={isProcessing}
              className="w-full py-3.5 bg-stone-900 hover:bg-stone-800 text-white font-semibold text-xs sm:text-sm rounded-xl transition-colors flex items-center justify-center gap-2 cursor-pointer shadow-md disabled:opacity-50"
            >
              {isProcessing ? (
                <span>{lang === 'es' ? 'Validando stock y sincronizando...' : 'Confirming booking...'}</span>
              ) : (
                <>
                  <ShieldCheck className="w-4 h-4 text-emerald-400" />
                  <span>{t('cart.btn.confirm', lang)}</span>
                </>
              )}
            </button>
          </form>
        </div>

      </div>
    </div>
  );
};
