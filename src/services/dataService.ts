/**
 * Local Data Layer for Trip Now (El Salvador)
 * Source of truth for active UI sessions with Google Sheets synchronization bridge.
 */

import { Vehicle, Branch, Client, Reservation, CartItem, UserProfile, ReservationStatus } from '../types';
import { sheetRegisterClient, sheetCreateTrip, sheetUpdateTripStatus } from './sheetsService';
import {
  saveReservationToFirestore,
  saveClientToFirestore,
  updateReservationStatusInFirestore,
  seedInitialFirestoreData
} from './firebase';

// Generated asset paths
import hiluxImg from '../assets/images/vehicle_toyota_hilux_1790123618836.jpg';
import rav4Img from '../assets/images/vehicle_toyota_rav4_1790123629362.jpg';
import corollaImg from '../assets/images/vehicle_corolla_sedan_1790123639645.jpg';

const STORAGE_KEYS = {
  VEHICLES: 'tripnow_vehicles_v2',
  BRANCHES: 'tripnow_branches_v2',
  CLIENTS: 'tripnow_clients_v2',
  RESERVATIONS: 'tripnow_reservations_v2',
  CART: 'tripnow_cart_v2',
  PROFILE: 'tripnow_profile_v2',
  LANG: 'tripnow_lang',
  ADMIN_SESSION: 'tripnow_admin_session_v2'
};

const DEFAULT_BRANCHES: Branch[] = [
  {
    id: 'b1',
    name: 'San Salvador - Paseo Escalón',
    address: 'Paseo General Escalón #3700, Col. Escalón, San Salvador',
    lat: 13.7042,
    lng: -89.2425,
    hours: 'Lun - Dom: 07:00 AM - 08:00 PM',
    phone: '+503 2264-9800'
  },
  {
    id: 'b2',
    name: 'Aeropuerto Internacional (SAL - San Óscar Romero)',
    address: 'Terminal de Llegadas Internacionales, Nivel 1, San Luis Talpa',
    lat: 13.4441,
    lng: -89.0558,
    hours: '24 Horas / 7 Días al año',
    phone: '+503 2344-7700'
  },
  {
    id: 'b3',
    name: 'Santa Ana - Metrocentro',
    address: 'Boulevard Los 44, Frente a Rotonda El Palmar, Santa Ana',
    lat: 13.9782,
    lng: -89.5621,
    hours: 'Lun - Sáb: 08:00 AM - 06:30 PM',
    phone: '+503 2440-3320'
  },
  {
    id: 'b4',
    name: 'San Miguel - El Encuentro',
    address: 'Carretera Panamericana Km 138, San Miguel',
    lat: 13.4735,
    lng: -88.1722,
    hours: 'Lun - Sáb: 08:00 AM - 06:00 PM',
    phone: '+503 2660-5511'
  },
  {
    id: 'b5',
    name: 'Surf City - La Libertad (El Tunco)',
    address: 'Carretera El Litoral Km 42, Acceso Principal Playa El Tunco',
    lat: 13.4939,
    lng: -89.3828,
    hours: 'Todos los días: 08:00 AM - 07:00 PM',
    phone: '+503 2389-6200'
  }
];

const DEFAULT_VEHICLES: Vehicle[] = [
  {
    id: 'v1',
    name: 'Hilux Double Cab 4x4',
    brand: 'Toyota',
    type: 'Camioneta',
    transmission: 'Manual',
    fuel: 'Gasolina',
    passengers: 5,
    pricePerDay: 68,
    stock: 4,
    paused: false,
    imageUrl: hiluxImg
  },
  {
    id: 'v2',
    name: 'RAV4 Hybrid AWD',
    brand: 'Toyota',
    type: 'SUV',
    transmission: 'Automático',
    fuel: 'Híbrido',
    passengers: 5,
    pricePerDay: 58,
    stock: 3,
    paused: false,
    imageUrl: rav4Img
  },
  {
    id: 'v3',
    name: 'Corolla Sedan XLE',
    brand: 'Toyota',
    type: 'Sedán',
    transmission: 'Automático',
    fuel: 'Gasolina',
    passengers: 5,
    pricePerDay: 42,
    stock: 5,
    paused: false,
    imageUrl: corollaImg
  },
  {
    id: 'v4',
    name: 'Tucson Limited',
    brand: 'Hyundai',
    type: 'SUV',
    transmission: 'Automático',
    fuel: 'Gasolina',
    passengers: 5,
    pricePerDay: 52,
    stock: 3,
    paused: false,
    imageUrl: rav4Img // fallback high-res SUV
  },
  {
    id: 'v5',
    name: 'Picanto Compact City',
    brand: 'Kia',
    type: 'Compacto',
    transmission: 'Automático',
    fuel: 'Gasolina',
    passengers: 4,
    pricePerDay: 32,
    stock: 4,
    paused: false,
    imageUrl: corollaImg // fallback clean car
  },
  {
    id: 'v6',
    name: 'Ranger Raptor 4x4',
    brand: 'Ford',
    type: 'Camioneta',
    transmission: 'Automático',
    fuel: 'Gasolina',
    passengers: 5,
    pricePerDay: 79,
    stock: 2,
    paused: false,
    imageUrl: hiluxImg // fallback 4x4
  }
];

const DEFAULT_CLIENTS: Client[] = [];

const DEFAULT_RESERVATIONS: Reservation[] = [];

// Automatic cleanup of legacy demo mock data
export function cleanMockStorage(): void {
  try {
    // Purge old v1 storage items from browser
    localStorage.removeItem('tripnow_profile');
    localStorage.removeItem('tripnow_clients');
    localStorage.removeItem('tripnow_reservations');
    localStorage.removeItem('tripnow_cart');
    sessionStorage.removeItem('tripnow_admin_session');
  } catch {}
}

// Run cleanup immediately
cleanMockStorage();

// --- Vehicles ---
export function getVehicles(): Vehicle[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.VEHICLES);
    if (!raw) {
      saveVehicles(DEFAULT_VEHICLES);
      return DEFAULT_VEHICLES;
    }
    return JSON.parse(raw);
  } catch (e) {
    return DEFAULT_VEHICLES;
  }
}

export function saveVehicles(list: Vehicle[]): void {
  localStorage.setItem(STORAGE_KEYS.VEHICLES, JSON.stringify(list));
}

export function addVehicle(v: Omit<Vehicle, 'id'>): Vehicle {
  const current = getVehicles();
  const newVehicle: Vehicle = {
    ...v,
    id: 'v_' + Date.now()
  };
  current.unshift(newVehicle);
  saveVehicles(current);
  return newVehicle;
}

export function updateVehicle(id: string, updates: Partial<Vehicle>): Vehicle | null {
  const current = getVehicles();
  const index = current.findIndex(v => v.id === id);
  if (index === -1) return null;
  current[index] = { ...current[index], ...updates };
  saveVehicles(current);
  return current[index];
}

export function deleteVehicle(id: string): boolean {
  const current = getVehicles();
  const filtered = current.filter(v => v.id !== id);
  saveVehicles(filtered);
  return true;
}

export function adjustVehicleStock(id: string, delta: number): number {
  const current = getVehicles();
  const target = current.find(v => v.id === id);
  if (!target) return 0;
  target.stock = Math.max(0, target.stock + delta);
  saveVehicles(current);
  return target.stock;
}

export function togglePauseVehicle(id: string): boolean {
  const current = getVehicles();
  const target = current.find(v => v.id === id);
  if (!target) return false;
  target.paused = !target.paused;
  saveVehicles(current);
  return target.paused;
}

// --- Branches ---
export function getBranches(): Branch[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.BRANCHES);
    if (!raw) {
      saveBranches(DEFAULT_BRANCHES);
      return DEFAULT_BRANCHES;
    }
    return JSON.parse(raw);
  } catch (e) {
    return DEFAULT_BRANCHES;
  }
}

export function saveBranches(list: Branch[]): void {
  localStorage.setItem(STORAGE_KEYS.BRANCHES, JSON.stringify(list));
}

export function addBranch(b: Omit<Branch, 'id'>): Branch {
  const current = getBranches();
  const newBranch: Branch = {
    ...b,
    id: 'b_' + Date.now()
  };
  current.push(newBranch);
  saveBranches(current);
  return newBranch;
}

export function updateBranch(id: string, updates: Partial<Branch>): Branch | null {
  const current = getBranches();
  const index = current.findIndex(b => b.id === id);
  if (index === -1) return null;
  current[index] = { ...current[index], ...updates };
  saveBranches(current);
  return current[index];
}

// --- Clients ---
export function getClients(): Client[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.CLIENTS);
    if (!raw) {
      saveClients(DEFAULT_CLIENTS);
      return DEFAULT_CLIENTS;
    }
    const list: Client[] = JSON.parse(raw);
    return list.filter(c => !c.id.startsWith('c_demo_') && c.nombre !== 'Carlos Menéndez' && c.nombre !== 'Elena Rodríguez');
  } catch (e) {
    return DEFAULT_CLIENTS;
  }
}

export function saveClients(list: Client[]): void {
  localStorage.setItem(STORAGE_KEYS.CLIENTS, JSON.stringify(list));
}

export function registerClient(profile: UserProfile): Client {
  const normalizedEmail = profile.email.toLowerCase().trim();
  const clients = getClients();
  const existing = clients.find(c => c.email.toLowerCase().trim() === normalizedEmail);

  let updatedClient: Client;
  if (existing) {
    existing.nombre = profile.nombre;
    existing.telefono = profile.telefono;
    if (profile.documento) existing.documento = profile.documento;
    updatedClient = existing;
  } else {
    updatedClient = {
      id: 'c_' + Date.now(),
      nombre: profile.nombre,
      email: normalizedEmail,
      telefono: profile.telefono,
      documento: profile.documento || '',
      reservas: 0,
      gastoTotal: 0,
      registradoEl: new Date().toISOString()
    };
    clients.push(updatedClient);
  }

  saveClients(clients);
  saveProfile(profile);

  // Sync with Firestore in real time
  saveClientToFirestore(updatedClient, !existing).catch(err => console.warn('[Firebase] Client sync warning:', err));

  // Sync with Google Sheets in background
  sheetRegisterClient(profile).catch(err => console.warn('[Trip Now] Sheet client sync warning:', err));

  return updatedClient;
}

// --- User Profile (Active Session) ---
export function getProfile(): UserProfile | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.PROFILE);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function saveProfile(profile: UserProfile | null): void {
  if (!profile) {
    localStorage.removeItem(STORAGE_KEYS.PROFILE);
  } else {
    localStorage.setItem(STORAGE_KEYS.PROFILE, JSON.stringify(profile));
  }
}

// --- Cart ---
export function getCart(): CartItem[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.CART);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function saveCart(cart: CartItem[]): void {
  localStorage.setItem(STORAGE_KEYS.CART, JSON.stringify(cart));
}

export function addToCart(vehicleId: string, days: number = 1): CartItem[] {
  const cart = getCart();
  const existing = cart.find(item => item.vehicleId === vehicleId);
  if (existing) {
    existing.days = Math.max(1, existing.days + days);
  } else {
    cart.push({ vehicleId, days: Math.max(1, days) });
  }
  saveCart(cart);
  return cart;
}

export function updateCartItemDays(vehicleId: string, days: number): CartItem[] {
  let cart = getCart();
  if (days <= 0) {
    cart = cart.filter(item => item.vehicleId !== vehicleId);
  } else {
    const item = cart.find(i => i.vehicleId === vehicleId);
    if (item) item.days = days;
  }
  saveCart(cart);
  return cart;
}

export function removeFromCart(vehicleId: string): CartItem[] {
  const cart = getCart().filter(item => item.vehicleId !== vehicleId);
  saveCart(cart);
  return cart;
}

export function clearCart(): void {
  saveCart([]);
}

// --- Reservations ---
export function getReservations(): Reservation[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.RESERVATIONS);
    if (!raw) {
      saveReservations(DEFAULT_RESERVATIONS);
      return DEFAULT_RESERVATIONS;
    }
    const list: Reservation[] = JSON.parse(raw);
    return list.filter(r => !r.id.startsWith('r_17100010') && r.clientName !== 'Carlos Menéndez' && r.clientName !== 'Elena Rodríguez');
  } catch {
    return DEFAULT_RESERVATIONS;
  }
}

export function saveReservations(list: Reservation[]): void {
  localStorage.setItem(STORAGE_KEYS.RESERVATIONS, JSON.stringify(list));
}

/**
 * Process purchase / checkout
 * 1. Checks current stock for each item
 * 2. Decrements stock locally
 * 3. Creates reservations
 * 4. Updates client metrics (reservas and gastoTotal)
 * 5. Syncs each reservation with Google Sheets
 * 6. Clears the cart
 */
export async function processPurchase(
  clientProfile: UserProfile,
  cart: CartItem[],
  branchId: string,
  pickupDate: string
): Promise<{ total: number; reservations: Reservation[] } | null> {
  if (cart.length === 0) return null;

  const vehicles = getVehicles();
  const branches = getBranches();
  const targetBranch = branches.find(b => b.id === branchId) || branches[0];

  // Atomic stock check
  for (const item of cart) {
    const v = vehicles.find(x => x.id === item.vehicleId);
    if (!v || v.paused || v.stock <= 0) {
      return null; // insufficient stock
    }
  }

  // Decrement stock
  for (const item of cart) {
    const v = vehicles.find(x => x.id === item.vehicleId);
    if (v) {
      v.stock -= 1;
    }
  }
  saveVehicles(vehicles);

  // Calculate return date helper
  const addDaysToDate = (startDate: string, daysCount: number): string => {
    const d = new Date(startDate);
    d.setDate(d.getDate() + daysCount);
    return d.toISOString().split('T')[0];
  };

  const newReservations: Reservation[] = [];
  let grandTotal = 0;

  cart.forEach((item, index) => {
    const v = vehicles.find(x => x.id === item.vehicleId)!;
    const itemTotal = v.pricePerDay * item.days;
    grandTotal += itemTotal;

    const res: Reservation = {
      id: `r_${Date.now()}_${index}`,
      clientName: clientProfile.nombre,
      clientEmail: clientProfile.email.toLowerCase().trim(),
      vehicleId: v.id,
      vehicleName: `${v.brand} ${v.name}`,
      days: item.days,
      pickupDate,
      returnDate: addDaysToDate(pickupDate, item.days),
      branchId: targetBranch.id,
      branchName: targetBranch.name,
      total: itemTotal,
      status: 'en_curso',
      createdAt: new Date().toISOString()
    };
    newReservations.push(res);
  });

  // Save reservations
  const allReservations = getReservations();
  allReservations.unshift(...newReservations);
  saveReservations(allReservations);

  // Update client registration & accumulated spend
  const client = registerClient(clientProfile);
  const clients = getClients();
  const cTarget = clients.find(c => c.id === client.id);
  if (cTarget) {
    cTarget.reservas += newReservations.length;
    cTarget.gastoTotal += grandTotal;
    saveClients(clients);
    saveClientToFirestore(cTarget, false).catch(e => console.warn('[Firebase] Client update warning:', e));
  }

  // Save to Firebase Firestore and record real-time movements
  newReservations.forEach(res => {
    saveReservationToFirestore(res).catch(e => console.warn('[Firebase] Reservation sync warning:', e));
    sheetCreateTrip(res).catch(e => console.warn('[Trip Now] Sheet trip sync warning:', e));
  });

  // Clear local cart
  clearCart();

  return { total: grandTotal, reservations: newReservations };
}

/**
 * Set reservation status:
 * - When finishing or canceling, frees the stock back to the inventory
 * - Syncs updated status to Firestore and Google Sheets
 */
export async function setReservationStatus(id: string, newStatus: ReservationStatus): Promise<boolean> {
  const reservations = getReservations();
  const res = reservations.find(r => r.id === id);
  if (!res) return false;

  const previousStatus = res.status;
  if (previousStatus === newStatus) return true;

  res.status = newStatus;
  saveReservations(reservations);

  // If changing from "en_curso" to "finalizado" or "cancelado", restore 1 unit of stock
  if (previousStatus === 'en_curso' && (newStatus === 'finalizado' || newStatus === 'cancelado')) {
    adjustVehicleStock(res.vehicleId, 1);
  } else if ((previousStatus === 'finalizado' || previousStatus === 'cancelado') && newStatus === 'en_curso') {
    adjustVehicleStock(res.vehicleId, -1);
  }

  // Sync to Firestore in real time
  updateReservationStatusInFirestore(id, newStatus, res).catch(e => console.warn('[Firebase] Status update warning:', e));

  // Sync to Google Sheets
  sheetUpdateTripStatus(id, newStatus).catch(e => console.warn('[Trip Now] Sheet status update warning:', e));

  return true;
}

// --- Admin Session (sessionStorage) ---
export function isAdminAuthenticated(): boolean {
  return sessionStorage.getItem(STORAGE_KEYS.ADMIN_SESSION) === '1';
}

export function setAdminSession(auth: boolean): void {
  if (auth) {
    sessionStorage.setItem(STORAGE_KEYS.ADMIN_SESSION, '1');
  } else {
    sessionStorage.removeItem(STORAGE_KEYS.ADMIN_SESSION);
  }
}

// --- Language ---
export function getSavedLanguage(): 'es' | 'en' {
  const lang = localStorage.getItem(STORAGE_KEYS.LANG);
  return lang === 'en' ? 'en' : 'es';
}

export function saveLanguage(lang: 'es' | 'en'): void {
  localStorage.setItem(STORAGE_KEYS.LANG, lang);
}
