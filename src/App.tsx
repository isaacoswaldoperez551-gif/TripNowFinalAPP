/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import {
  Vehicle, Branch, Client, Reservation, CartItem, UserProfile, Language, ReservationStatus, ClientMovement
} from './types';
import {
  getVehicles, getBranches, getClients, getReservations, getCart, getProfile,
  getSavedLanguage, saveLanguage, addToCart, updateCartItemDays, removeFromCart,
  clearCart, processPurchase, setReservationStatus, addVehicle, deleteVehicle,
  adjustVehicleStock, togglePauseVehicle, addBranch, registerClient, saveProfile,
  isAdminAuthenticated, setAdminSession
} from './services/dataService';
import {
  subscribeToMovements,
  subscribeToReservations,
  subscribeToClients,
  cleanMockFirestoreData
} from './services/firebase';
import { Navbar } from './components/Navbar';
import { HomeHero } from './components/HomeHero';
import { CatalogView } from './components/CatalogView';
import { CartView } from './components/CartView';
import { BranchesView } from './components/BranchesView';
import { AdminPanel } from './components/AdminPanel';
import { AuthModal } from './components/AuthModal';
import { Footer } from './components/Footer';
import { ToastProvider, useToast } from './components/Toast';

function AppContent() {
  const toast = useToast();

  // Navigation tab: 'home' | 'catalog' | 'branches' | 'cart' | 'admin'
  const [currentTab, setCurrentTab] = useState<string>('home');
  const [lang, setLangState] = useState<Language>(getSavedLanguage());

  // Data state
  const [vehicles, setVehicles] = useState<Vehicle[]>(getVehicles());
  const [branches, setBranches] = useState<Branch[]>(getBranches());
  const [clients, setClients] = useState<Client[]>(getClients());
  const [reservations, setReservations] = useState<Reservation[]>(getReservations());
  const [movements, setMovements] = useState<ClientMovement[]>([]);
  const [isRealtimeConnected, setIsRealtimeConnected] = useState<boolean>(false);
  const [cart, setCart] = useState<CartItem[]>(getCart());
  const [profile, setProfileState] = useState<UserProfile | null>(getProfile());
  const [isAdmin, setIsAdmin] = useState<boolean>(isAdminAuthenticated());

  // Modals & Navigation helpers
  const [authModalOpen, setAuthModalOpen] = useState<boolean>(!getProfile());
  const [catalogInitialFilter, setCatalogInitialFilter] = useState<string>('all');
  const [selectedBranchId, setSelectedBranchId] = useState<string>('b1');

  // Initialize and subscribe to Firestore Real-Time Stream
  useEffect(() => {
    // Clean any legacy mock / seed data from Firestore so only real entries appear
    cleanMockFirestoreData();

    // Subscribe to live movements stream
    const unsubMovements = subscribeToMovements(
      (liveMovements) => {
        setMovements(liveMovements);
        setIsRealtimeConnected(true);
      },
      () => {
        setIsRealtimeConnected(false);
      }
    );

    // Subscribe to live reservations
    const unsubReservations = subscribeToReservations((liveReservations) => {
      setReservations(liveReservations || []);
    });

    // Subscribe to live clients
    const unsubClients = subscribeToClients((liveClients) => {
      setClients(liveClients || []);
    });

    return () => {
      unsubMovements();
      unsubReservations();
      unsubClients();
    };
  }, []);

  // Change language and persist
  const setLang = (newLang: Language) => {
    setLangState(newLang);
    saveLanguage(newLang);
  };

  // Reload all storage state
  const refreshData = () => {
    setVehicles(getVehicles());
    setBranches(getBranches());
    setClients(getClients());
    setReservations(getReservations());
    setCart(getCart());
    setProfileState(getProfile());
    setIsAdmin(isAdminAuthenticated());
  };

  // Cart operations
  const handleAddToCart = (vehicleId: string, days: number = 1) => {
    const updated = addToCart(vehicleId, days);
    setCart([...updated]);
    const vehicle = vehicles.find(v => v.id === vehicleId);
    toast.success(
      lang === 'es' ? 'Vehículo agregado al carrito' : 'Added to cart',
      `${vehicle?.name || 'Vehículo'} (${days} ${lang === 'es' ? 'días' : 'days'})`
    );
  };

  const handleDirectBook = (vehicleId: string, days: number = 1) => {
    handleAddToCart(vehicleId, days);
    setCurrentTab('cart');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleUpdateCartDays = (vehicleId: string, days: number) => {
    const updated = updateCartItemDays(vehicleId, days);
    setCart([...updated]);
  };

  const handleRemoveFromCart = (vehicleId: string) => {
    const updated = removeFromCart(vehicleId);
    setCart([...updated]);
    toast.info(lang === 'es' ? 'Vehículo removido del carrito' : 'Removed from cart');
  };

  const handleClearCart = () => {
    clearCart();
    setCart([]);
  };

  // Purchase / Checkout process
  const handleConfirmPurchase = async (
    branchId: string,
    pickupDate: string,
    clientProfile: UserProfile
  ): Promise<Reservation[] | null> => {
    const res = await processPurchase(clientProfile, cart, branchId, pickupDate);
    if (!res) return null;

    // Refresh state
    refreshData();
    return res.reservations;
  };

  // Admin Authentication
  const handleAdminLogin = (u: string, p: string): boolean => {
    const validUser = u.trim().toLowerCase() === 'isaac';
    const validPass = p === 'tocino2023';
    if (validUser && validPass) {
      setAdminSession(true);
      setIsAdmin(true);
      return true;
    }
    return false;
  };

  const handleAdminLogout = () => {
    setAdminSession(false);
    setIsAdmin(false);
    toast.info(lang === 'es' ? 'Sesión de administrador cerrada' : 'Admin logged out');
  };

  // Inventory modifications
  const handleAddVehicle = (v: Omit<Vehicle, 'id'>) => {
    addVehicle(v);
    refreshData();
  };

  const handleDeleteVehicle = (id: string) => {
    deleteVehicle(id);
    refreshData();
    toast.info(lang === 'es' ? 'Vehículo eliminado de la flota' : 'Vehicle removed from fleet');
  };

  const handleTogglePauseVehicle = (id: string) => {
    const paused = togglePauseVehicle(id);
    refreshData();
    toast.info(
      paused
        ? (lang === 'es' ? 'Vehículo pausado (oculto del catálogo)' : 'Vehicle paused')
        : (lang === 'es' ? 'Vehículo reactivado en el catálogo' : 'Vehicle activated')
    );
  };

  const handleAdjustStock = (id: string, delta: number) => {
    adjustVehicleStock(id, delta);
    refreshData();
  };

  // Reservation Status Update (releases stock if finished or canceled)
  const handleUpdateReservationStatus = async (id: string, status: ReservationStatus) => {
    await setReservationStatus(id, status);
    refreshData();
  };

  // Branch additions
  const handleAddBranch = (b: Omit<Branch, 'id'>) => {
    addBranch(b);
    refreshData();
  };

  // Customer Profile
  const handleSaveProfile = (newProfile: UserProfile) => {
    registerClient(newProfile);
    setProfileState(newProfile);
    refreshData();
  };

  const handleLogoutProfile = () => {
    saveProfile(null);
    setProfileState(null);
  };

  // Navigation handlers
  const handleExploreCatalog = (filterType?: string) => {
    if (filterType) {
      setCatalogInitialFilter(filterType);
    } else {
      setCatalogInitialFilter('all');
    }
    setCurrentTab('catalog');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSelectBranch = (branchId: string) => {
    setSelectedBranchId(branchId);
    setCurrentTab('branches');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSelectBranchForRental = (branchId: string) => {
    setSelectedBranchId(branchId);
    setCurrentTab('catalog');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const totalCartCount = cart.length;

  return (
    <div className="min-h-screen flex flex-col bg-[#FBFBFA]">
      {/* Primary Top Bar Contract */}
      <Navbar
        currentTab={currentTab}
        setCurrentTab={setCurrentTab}
        lang={lang}
        setLang={setLang}
        cartCount={totalCartCount}
        profile={profile}
        onOpenAuthModal={() => setAuthModalOpen(true)}
        onLogoutProfile={handleLogoutProfile}
        isAdmin={isAdmin}
      />

      {/* Main View Router */}
      <main className="flex-1">
        {currentTab === 'home' && (
          <HomeHero
            branches={branches}
            featuredVehicles={vehicles}
            lang={lang}
            onExploreCatalog={handleExploreCatalog}
            onSelectBranch={handleSelectBranch}
            onAddToCart={handleAddToCart}
          />
        )}

        {currentTab === 'catalog' && (
          <CatalogView
            vehicles={vehicles}
            lang={lang}
            onAddToCart={handleAddToCart}
            onDirectBook={handleDirectBook}
            initialTypeFilter={catalogInitialFilter}
          />
        )}

        {currentTab === 'cart' && (
          <CartView
            cart={cart}
            vehicles={vehicles}
            branches={branches}
            profile={profile}
            lang={lang}
            onUpdateDays={handleUpdateCartDays}
            onRemoveItem={handleRemoveFromCart}
            onClearCart={handleClearCart}
            onConfirmPurchase={handleConfirmPurchase}
            onNavigateToCatalog={() => {
              setCurrentTab('catalog');
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            onOpenAuthModal={() => setAuthModalOpen(true)}
          />
        )}

        {currentTab === 'branches' && (
          <BranchesView
            branches={branches}
            lang={lang}
            onSelectBranchForRental={handleSelectBranchForRental}
            selectedBranchId={selectedBranchId}
          />
        )}

        {currentTab === 'admin' && (
          <AdminPanel
            isAdmin={isAdmin}
            onLogin={handleAdminLogin}
            onLogout={handleAdminLogout}
            vehicles={vehicles}
            branches={branches}
            clients={clients}
            reservations={reservations}
            movements={movements}
            isRealtimeConnected={isRealtimeConnected}
            lang={lang}
            onAddVehicle={handleAddVehicle}
            onDeleteVehicle={handleDeleteVehicle}
            onTogglePauseVehicle={handleTogglePauseVehicle}
            onAdjustStock={handleAdjustStock}
            onUpdateReservationStatus={handleUpdateReservationStatus}
            onAddBranch={handleAddBranch}
            onRefreshData={refreshData}
          />
        )}
      </main>

      {/* Customer Identification Modal */}
      <AuthModal
        isOpen={authModalOpen}
        onClose={() => setAuthModalOpen(false)}
        profile={profile}
        onSaveProfile={handleSaveProfile}
        onLogout={handleLogoutProfile}
        lang={lang}
      />

      {/* Footer */}
      <Footer
        lang={lang}
        onNavigate={(tab) => {
          setCurrentTab(tab);
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
      />
    </div>
  );
}

export default function App() {
  return (
    <ToastProvider>
      <AppContent />
    </ToastProvider>
  );
}
