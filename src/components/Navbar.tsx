import React, { useState } from 'react';
import { ShoppingBag, User, ShieldCheck, Globe, Menu, X } from 'lucide-react';
import { Language, UserProfile } from '../types';
import { t } from '../services/i18n';

interface NavbarProps {
  currentTab: string;
  setCurrentTab: (tab: string) => void;
  lang: Language;
  setLang: (lang: Language) => void;
  cartCount: number;
  profile: UserProfile | null;
  onOpenAuthModal: () => void;
  onLogoutProfile: () => void;
  isAdmin: boolean;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentTab,
  setCurrentTab,
  lang,
  setLang,
  cartCount,
  profile,
  onOpenAuthModal,
  onLogoutProfile,
  isAdmin
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const toggleLang = () => {
    setLang(lang === 'es' ? 'en' : 'es');
  };

  const handleNav = (tab: string) => {
    setCurrentTab(tab);
    setMobileMenuOpen(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <header className="sticky top-0 z-40 bg-[#FBFBFA]/95 backdrop-blur-md border-b border-stone-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          
          {/* Zone 1: Brand Wordmark (Single text element in Fraunces serif) */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => handleNav('home')}
              className="text-left group cursor-pointer focus:outline-none"
            >
              <span className="font-serif text-2xl sm:text-3xl font-bold tracking-tight text-stone-900 group-hover:text-amber-800 transition-colors">
                Trip Now
              </span>
              <span className="sr-only">Trip Now El Salvador</span>
            </button>
            <span className="hidden sm:inline-block text-xs font-mono text-stone-500 border-l border-stone-300 pl-3">
              El Salvador
            </span>
          </div>

          {/* Zone 2: Navigation Links (Clean text links with hover transitions) */}
          <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-stone-600">
            <button
              onClick={() => handleNav('home')}
              className={`hover:text-stone-900 transition-colors py-1 cursor-pointer ${
                currentTab === 'home' ? 'text-stone-950 font-semibold border-b-2 border-stone-900' : ''
              }`}
            >
              {t('nav.home', lang)}
            </button>
            <button
              onClick={() => handleNav('catalog')}
              className={`hover:text-stone-900 transition-colors py-1 cursor-pointer ${
                currentTab === 'catalog' ? 'text-stone-950 font-semibold border-b-2 border-stone-900' : ''
              }`}
            >
              {t('nav.catalog', lang)}
            </button>
            <button
              onClick={() => handleNav('branches')}
              className={`hover:text-stone-900 transition-colors py-1 cursor-pointer ${
                currentTab === 'branches' ? 'text-stone-950 font-semibold border-b-2 border-stone-900' : ''
              }`}
            >
              {t('nav.branches', lang)}
            </button>
          </nav>

          {/* Zone 3: Primary Actions (Language, Profile, Cart, Admin) */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Language Toggle */}
            <button
              onClick={toggleLang}
              className="px-2.5 py-1.5 text-xs font-mono font-medium text-stone-700 bg-stone-100 hover:bg-stone-200 rounded-lg transition-colors flex items-center gap-1 cursor-pointer"
              title="Cambiar idioma / Switch language"
            >
              <Globe className="w-3.5 h-3.5 text-stone-500" />
              <span>{lang.toUpperCase()}</span>
            </button>

            {/* Client Profile / Identification */}
            {profile ? (
              <div className="relative group">
                <button
                  onClick={onOpenAuthModal}
                  className="px-3 py-1.5 text-xs font-medium text-stone-700 bg-stone-100 hover:bg-stone-200 rounded-lg transition-colors flex items-center gap-1.5 max-w-[140px] truncate cursor-pointer"
                  title={profile.email}
                >
                  <User className="w-3.5 h-3.5 text-stone-500" />
                  <span className="truncate">{profile.nombre.split(' ')[0]}</span>
                </button>
              </div>
            ) : (
              <button
                onClick={onOpenAuthModal}
                className="hidden sm:flex px-3 py-1.5 text-xs font-medium text-stone-700 hover:text-stone-900 transition-colors items-center gap-1 cursor-pointer"
              >
                <User className="w-3.5 h-3.5" />
                <span>{t('nav.login', lang)}</span>
              </button>
            )}

            {/* Cart Button with Count Badge */}
            <button
              onClick={() => handleNav('cart')}
              className={`relative px-3.5 py-2 text-xs font-medium rounded-lg transition-all flex items-center gap-2 cursor-pointer ${
                currentTab === 'cart'
                  ? 'bg-stone-900 text-white shadow-sm'
                  : 'bg-stone-900 text-white hover:bg-stone-800'
              }`}
              aria-label="Carrito de reservas"
            >
              <ShoppingBag className="w-4 h-4" />
              <span className="hidden sm:inline font-mono">{t('nav.cart', lang)}</span>
              {cartCount > 0 && (
                <span className="bg-amber-600 text-white font-mono text-[11px] px-1.5 py-0.5 rounded-full min-w-[20px] text-center font-bold">
                  {cartCount}
                </span>
              )}
            </button>

            {/* Admin Shortcut */}
            <button
              onClick={() => handleNav('admin')}
              className={`p-2 rounded-lg transition-colors cursor-pointer ${
                currentTab === 'admin'
                  ? 'bg-amber-100 text-amber-900'
                  : 'text-stone-500 hover:text-stone-900 hover:bg-stone-100'
              }`}
              title={t('nav.admin', lang)}
              aria-label="Panel administrativo"
            >
              <ShieldCheck className="w-4 h-4" />
            </button>

            {/* Mobile menu trigger */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 text-stone-600 hover:text-stone-900 rounded-lg hover:bg-stone-100 cursor-pointer"
              aria-label="Menu"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Mobile menu dropdown */}
        {mobileMenuOpen && (
          <div className="md:hidden py-4 border-t border-stone-200 flex flex-col gap-2">
            <button
              onClick={() => handleNav('home')}
              className={`px-3 py-2 text-left text-sm rounded-lg ${currentTab === 'home' ? 'bg-stone-200 font-semibold' : 'text-stone-700'}`}
            >
              {t('nav.home', lang)}
            </button>
            <button
              onClick={() => handleNav('catalog')}
              className={`px-3 py-2 text-left text-sm rounded-lg ${currentTab === 'catalog' ? 'bg-stone-200 font-semibold' : 'text-stone-700'}`}
            >
              {t('nav.catalog', lang)}
            </button>
            <button
              onClick={() => handleNav('branches')}
              className={`px-3 py-2 text-left text-sm rounded-lg ${currentTab === 'branches' ? 'bg-stone-200 font-semibold' : 'text-stone-700'}`}
            >
              {t('nav.branches', lang)}
            </button>
            <button
              onClick={() => handleNav('cart')}
              className={`px-3 py-2 text-left text-sm rounded-lg flex items-center justify-between ${currentTab === 'cart' ? 'bg-stone-200 font-semibold' : 'text-stone-700'}`}
            >
              <span>{t('nav.cart', lang)}</span>
              {cartCount > 0 && <span className="font-mono bg-stone-900 text-white px-2 py-0.5 rounded text-xs">{cartCount}</span>}
            </button>
            <button
              onClick={() => handleNav('admin')}
              className={`px-3 py-2 text-left text-sm rounded-lg ${currentTab === 'admin' ? 'bg-amber-100 font-semibold text-amber-900' : 'text-stone-700'}`}
            >
              {t('nav.admin', lang)}
            </button>
            {!profile && (
              <button
                onClick={() => { setMobileMenuOpen(false); onOpenAuthModal(); }}
                className="px-3 py-2 text-left text-sm text-stone-700 hover:bg-stone-100 rounded-lg flex items-center gap-2"
              >
                <User className="w-4 h-4" />
                <span>{t('nav.login', lang)}</span>
              </button>
            )}
          </div>
        )}
      </div>
    </header>
  );
};
