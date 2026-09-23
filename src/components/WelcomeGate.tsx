import React, { useState } from 'react';
import { Car, ShieldCheck, User, Mail, Phone, FileText, ArrowRight, Lock, CheckCircle2 } from 'lucide-react';
import { UserProfile, Language } from '../types';
import { useToast } from './Toast';

interface WelcomeGateProps {
  isOpen: boolean;
  onRegister: (profile: UserProfile) => void;
  onAdminAccess: () => void;
  lang: Language;
}

export const WelcomeGate: React.FC<WelcomeGateProps> = ({
  isOpen,
  onRegister,
  onAdminAccess,
  lang
}) => {
  const toast = useToast();
  const [nombre, setNombre] = useState('');
  const [email, setEmail] = useState('');
  const [telefono, setTelefono] = useState('');
  const [documento, setDocumento] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanNombre = nombre.trim();
    const cleanEmail = email.trim().toLowerCase();
    const cleanTelefono = telefono.trim();

    if (!cleanNombre || !cleanEmail || !cleanTelefono) {
      toast.warning(
        lang === 'es' ? 'Datos requeridos' : 'Required fields',
        lang === 'es' ? 'Por favor completa tu nombre, correo y teléfono/WhatsApp.' : 'Please provide your name, email, and phone number.'
      );
      return;
    }

    if (!cleanEmail.includes('@') || !cleanEmail.includes('.')) {
      toast.warning(
        lang === 'es' ? 'Correo inválido' : 'Invalid email',
        lang === 'es' ? 'Ingresa un correo electrónico válido.' : 'Please enter a valid email address.'
      );
      return;
    }

    onRegister({
      nombre: cleanNombre,
      email: cleanEmail,
      telefono: cleanTelefono,
      documento: documento.trim()
    });

    toast.success(
      lang === 'es' ? `¡Bienvenido(a), ${cleanNombre}!` : `Welcome, ${cleanNombre}!`,
      lang === 'es' ? 'Tus datos se registraron en la plataforma.' : 'Your details have been saved.'
    );
  };

  return (
    <div className="fixed inset-0 z-50 bg-stone-950/80 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl border border-stone-200 relative my-auto animate-in fade-in zoom-in-95 duration-200">
        
        {/* Header Branding */}
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center w-14 h-14 bg-amber-500/10 border border-amber-500/20 text-amber-700 rounded-2xl mb-3 shadow-inner">
            <Car className="w-7 h-7 text-amber-600" />
          </div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-stone-100 rounded-full text-[11px] font-mono font-medium text-stone-600 mb-2">
            <span>🇸🇻</span>
            <span>Trip Now El Salvador</span>
          </div>
          <h1 className="font-serif text-2xl sm:text-3xl font-bold text-stone-900 tracking-tight">
            {lang === 'es' ? '¡Bienvenido a Trip Now!' : 'Welcome to Trip Now!'}
          </h1>
          <p className="mt-2 text-xs sm:text-sm text-stone-600 leading-relaxed font-sans max-w-md mx-auto">
            {lang === 'es'
              ? 'Para brindarte atención personalizada, cotizaciones en tiempo real y disponibilidad de la flota, por favor regístrate como conductor.'
              : 'Please enter your driver contact details to explore real-time availability and request reservations.'}
          </p>
        </div>

        {/* Form without automatic browser prefill */}
        <form
          onSubmit={handleSubmit}
          autoComplete="off"
          data-form-type="other"
          className="space-y-4"
        >
          {/* Nombre */}
          <div>
            <label className="block text-xs font-semibold text-stone-700 mb-1 uppercase tracking-wider font-mono">
              {lang === 'es' ? 'Nombre y Apellido' : 'Full Name'} <span className="text-rose-500">*</span>
            </label>
            <div className="relative">
              <User className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="text"
                name="tn_driver_fullname"
                autoComplete="off"
                data-lpignore="true"
                spellCheck={false}
                required
                value={nombre}
                onChange={(e) => setNombre(e.target.value)}
                placeholder={lang === 'es' ? 'Ej. Juan Pérez' : 'e.g. John Doe'}
                className="w-full bg-stone-50 border border-stone-200 rounded-xl pl-10 pr-3 py-2.5 text-xs text-stone-900 focus:outline-none focus:ring-2 focus:ring-amber-500 font-sans transition-all placeholder:text-stone-400"
              />
            </div>
          </div>

          {/* Email */}
          <div>
            <label className="block text-xs font-semibold text-stone-700 mb-1 uppercase tracking-wider font-mono">
              {lang === 'es' ? 'Correo Electrónico' : 'Email Address'} <span className="text-rose-500">*</span>
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="email"
                name="tn_driver_email"
                autoComplete="off"
                data-lpignore="true"
                spellCheck={false}
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder={lang === 'es' ? 'tu-correo@ejemplo.com' : 'your-email@example.com'}
                className="w-full bg-stone-50 border border-stone-200 rounded-xl pl-10 pr-3 py-2.5 text-xs text-stone-900 focus:outline-none focus:ring-2 focus:ring-amber-500 font-sans transition-all placeholder:text-stone-400"
              />
            </div>
          </div>

          {/* Telefono / WhatsApp */}
          <div>
            <label className="block text-xs font-semibold text-stone-700 mb-1 uppercase tracking-wider font-mono">
              {lang === 'es' ? 'Teléfono / WhatsApp' : 'Phone / WhatsApp'} <span className="text-rose-500">*</span>
            </label>
            <div className="relative">
              <Phone className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="tel"
                name="tn_driver_phone"
                autoComplete="off"
                data-lpignore="true"
                spellCheck={false}
                required
                value={telefono}
                onChange={(e) => setTelefono(e.target.value)}
                placeholder={lang === 'es' ? '+503 7000-0000' : '+1 555-0100'}
                className="w-full bg-stone-50 border border-stone-200 rounded-xl pl-10 pr-3 py-2.5 text-xs text-stone-900 focus:outline-none focus:ring-2 focus:ring-amber-500 font-sans transition-all placeholder:text-stone-400"
              />
            </div>
          </div>

          {/* DUI / Pasaporte / Licencia (Opcional) */}
          <div>
            <label className="block text-xs font-semibold text-stone-700 mb-1 uppercase tracking-wider font-mono flex items-center justify-between">
              <span>{lang === 'es' ? 'DUI / Licencia / Pasaporte' : 'ID / Driver License'}</span>
              <span className="text-[10px] text-stone-400 font-normal lowercase">{lang === 'es' ? '(opcional)' : '(optional)'}</span>
            </label>
            <div className="relative">
              <FileText className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="text"
                name="tn_driver_id_num"
                autoComplete="off"
                data-lpignore="true"
                spellCheck={false}
                value={documento}
                onChange={(e) => setDocumento(e.target.value)}
                placeholder={lang === 'es' ? 'Ej. 01234567-8' : 'e.g. DL-987654'}
                className="w-full bg-stone-50 border border-stone-200 rounded-xl pl-10 pr-3 py-2.5 text-xs text-stone-900 focus:outline-none focus:ring-2 focus:ring-amber-500 font-sans transition-all placeholder:text-stone-400"
              />
            </div>
          </div>

          {/* Trust badges */}
          <div className="bg-amber-50/70 border border-amber-200/60 rounded-xl p-3 flex items-start gap-2.5 text-amber-900 text-[11px] font-sans">
            <CheckCircle2 className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
            <span>
              {lang === 'es'
                ? 'Tus datos se sincronizan de forma segura con la base de datos de Trip Now para respaldar tu reserva.'
                : 'Your contact info syncs securely with Trip Now database to guarantee your booking.'}
            </span>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            className="w-full py-3 px-4 bg-stone-900 hover:bg-stone-800 text-white rounded-xl text-xs font-semibold uppercase tracking-wider flex items-center justify-center gap-2 transition-all shadow-md hover:shadow-lg cursor-pointer mt-2"
          >
            <span>{lang === 'es' ? 'Registrarme y Explorar Vehículos' : 'Register & Explore Vehicles'}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        {/* Administrator bypass link */}
        <div className="mt-5 pt-4 border-t border-stone-100 text-center">
          <button
            type="button"
            onClick={onAdminAccess}
            className="inline-flex items-center gap-1.5 text-xs text-stone-500 hover:text-stone-900 transition-colors font-mono cursor-pointer"
          >
            <Lock className="w-3.5 h-3.5 text-amber-700" />
            <span>{lang === 'es' ? '¿Eres Administrador? Acceder al Panel Admin' : 'Are you Admin? Go to Admin Panel'}</span>
          </button>
        </div>

      </div>
    </div>
  );
};
