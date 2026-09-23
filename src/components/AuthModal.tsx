import React, { useState } from 'react';
import { X, User, Mail, Phone, ShieldCheck, LogOut } from 'lucide-react';
import { UserProfile, Language } from '../types';
import { t } from '../services/i18n';
import { useToast } from './Toast';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  profile: UserProfile | null;
  onSaveProfile: (profile: UserProfile) => void;
  onLogout: () => void;
  lang: Language;
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  profile,
  onSaveProfile,
  onLogout,
  lang
}) => {
  const toast = useToast();
  const [nombre, setNombre] = useState(profile?.nombre || '');
  const [email, setEmail] = useState(profile?.email || '');
  const [telefono, setTelefono] = useState(profile?.telefono || '');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!nombre.trim() || !email.trim() || !telefono.trim()) {
      toast.warning('Completa todos los campos');
      return;
    }

    if (!email.includes('@')) {
      toast.warning('Ingresa un correo electrónico válido');
      return;
    }

    onSaveProfile({
      nombre: nombre.trim(),
      email: email.toLowerCase().trim(),
      telefono: telefono.trim()
    });

    toast.success(
      lang === 'es' ? 'Identificación guardada' : 'Profile saved',
      lang === 'es' ? 'Tus datos se sincronizarán con Google Sheets al confirmar reservas.' : 'Your data will sync to Google Sheets on reservations.'
    );
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl max-w-md w-full p-6 sm:p-8 shadow-2xl border border-stone-200 relative">
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-1 text-stone-400 hover:text-stone-700 transition-colors"
          aria-label="Cerrar modal"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="text-center mb-6">
          <div className="w-12 h-12 bg-stone-100 text-stone-900 rounded-2xl flex items-center justify-center mx-auto mb-3">
            <User className="w-6 h-6 text-amber-700" />
          </div>
          <h2 className="font-serif text-2xl font-bold text-stone-900">
            {profile ? (lang === 'es' ? 'Perfil del Conductor' : 'Driver Profile') : t('auth.title', lang)}
          </h2>
          <p className="mt-1 text-xs text-stone-500 leading-relaxed">
            {t('auth.desc', lang)}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 text-xs font-mono">
          <div>
            <label className="block text-stone-600 mb-1 font-sans font-semibold">
              {t('auth.name', lang)}
            </label>
            <div className="relative">
              <User className="w-4 h-4 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                required
                value={nombre}
                onChange={(e) => setNombre(e.target.value)}
                placeholder={lang === 'es' ? 'Ej. Juan Pérez' : 'e.g. John Doe'}
                className="w-full bg-stone-50 border border-stone-200 rounded-lg pl-9 pr-3 py-2.5 text-stone-900 focus:outline-none focus:ring-2 focus:ring-amber-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-stone-600 mb-1 font-sans font-semibold">
              {t('auth.email', lang)}
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder={lang === 'es' ? 'juan@ejemplo.com' : 'john@example.com'}
                className="w-full bg-stone-50 border border-stone-200 rounded-lg pl-9 pr-3 py-2.5 text-stone-900 focus:outline-none focus:ring-2 focus:ring-amber-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-stone-600 mb-1 font-sans font-semibold">
              {t('auth.phone', lang)}
            </label>
            <div className="relative">
              <Phone className="w-4 h-4 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="tel"
                required
                value={telefono}
                onChange={(e) => setTelefono(e.target.value)}
                placeholder="+503 7000-0000"
                className="w-full bg-stone-50 border border-stone-200 rounded-lg pl-9 pr-3 py-2.5 text-stone-900 focus:outline-none focus:ring-2 focus:ring-amber-500"
              />
            </div>
          </div>

          <div className="pt-2">
            <button
              type="submit"
              className="w-full py-3 bg-stone-900 hover:bg-stone-800 text-white font-medium text-xs rounded-xl transition-colors cursor-pointer shadow-md"
            >
              {t('auth.btn.save', lang)}
            </button>
          </div>

          {profile && (
            <div className="pt-2">
              <button
                type="button"
                onClick={() => {
                  onLogout();
                  onClose();
                  toast.info(lang === 'es' ? 'Sesión de cliente cerrada' : 'Signed out');
                }}
                className="w-full py-2 bg-stone-100 hover:bg-stone-200 text-stone-700 font-medium text-xs rounded-xl transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>{t('nav.logout', lang)}</span>
              </button>
            </div>
          )}
        </form>
      </div>
    </div>
  );
};
