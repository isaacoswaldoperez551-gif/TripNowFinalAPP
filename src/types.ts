export type VehicleType = 'Camioneta' | 'Sedán' | 'SUV' | 'Motocicleta' | 'Compacto';
export type TransmissionType = 'Automático' | 'Manual';
export type FuelType = 'Gasolina' | 'Eléctrico' | 'Híbrido';

export interface Vehicle {
  id: string;              // "v1", "v2"...
  name: string;            // "Hilux"
  brand: string;           // "Toyota"
  type: VehicleType;
  transmission: TransmissionType;
  fuel: FuelType;
  passengers: number;
  pricePerDay: number;
  stock: number;           // unidades disponibles ahora mismo
  paused: boolean;         // true = oculto del catálogo público (mantenimiento)
  imageUrl: string;        // ruta local o URL
}

export interface Branch {
  id: string;              // "b1"...
  name: string;
  address: string;
  lat: number;
  lng: number;
  hours: string;
  phone: string;
}

export interface Client {
  id: string;              // "c" + Date.now()
  nombre: string;
  email: string;           // clave natural de deduplicación (case-insensitive)
  telefono: string;
  documento?: string;      // DUI / Pasaporte / Licencia
  reservas: number;        // contador acumulado
  gastoTotal: number;      // acumulado en USD
  registradoEl?: string;
}

export type ReservationStatus = 'en_curso' | 'finalizado' | 'cancelado';

export interface Reservation {
  id: string;              // "r" + Date.now() + índice
  clientName: string;
  clientEmail: string;
  vehicleId: string;
  vehicleName: string;     // desnormalizado
  days: number;
  pickupDate: string;       // "YYYY-MM-DD"
  returnDate: string;       // calculado: pickupDate + days
  branchId: string;
  branchName: string;       // desnormalizado
  total: number;            // pricePerDay * days
  status: ReservationStatus;
  createdAt: string;         // ISO 8601
}

export interface CartItem {
  vehicleId: string;
  days: number;
}

export interface UserProfile {
  nombre: string;
  email: string;
  telefono: string;
  documento?: string;
}

export type MovementType = 
  | 'reserva_creada' 
  | 'cliente_registrado' 
  | 'viaje_en_curso' 
  | 'viaje_finalizado' 
  | 'viaje_cancelado' 
  | 'stock_ajustado';

export interface ClientMovement {
  id: string;
  timestamp: string; // ISO 8601
  type: MovementType;
  clientName: string;
  clientEmail: string;
  clientPhone?: string;
  vehicleName?: string;
  branchName?: string;
  amount?: number;
  details: string;
  status?: string;
}

export type Language = 'es' | 'en';
