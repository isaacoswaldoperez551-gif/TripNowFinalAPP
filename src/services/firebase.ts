import { initializeApp, getApps, getApp } from 'firebase/app';
import {
  getFirestore, collection, doc, setDoc, updateDoc,
  onSnapshot, query, orderBy, limit, getDocs
} from 'firebase/firestore';
import firebaseConfig from '../../firebase-applet-config.json';
import { Vehicle, Branch, Client, Reservation, ClientMovement, ReservationStatus } from '../types';

// Initialize Firebase App
const app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);

// Initialize Firestore (with databaseId specified in config)
export const db = firebaseConfig.firestoreDatabaseId
  ? getFirestore(app, firebaseConfig.firestoreDatabaseId)
  : getFirestore(app);

// Collection References
const MOVEMENTS_COL = 'movements';
const RESERVATIONS_COL = 'reservations';
const CLIENTS_COL = 'clients';
const VEHICLES_COL = 'vehicles';
const BRANCHES_COL = 'branches';

/**
 * Real-time subscription to Movements feed
 */
export const subscribeToMovements = (
  callback: (movements: ClientMovement[]) => void,
  onError?: (error: Error) => void
) => {
  const q = query(
    collection(db, MOVEMENTS_COL),
    orderBy('timestamp', 'desc'),
    limit(50)
  );

  return onSnapshot(
    q,
    (snapshot) => {
      const items: ClientMovement[] = [];
      snapshot.forEach((doc) => {
        items.push({ id: doc.id, ...doc.data() } as ClientMovement);
      });
      callback(items);
    },
    (err) => {
      console.warn('Firestore movements subscription error:', err);
      onError?.(err);
    }
  );
};

/**
 * Real-time subscription to Reservations
 */
export const subscribeToReservations = (
  callback: (reservations: Reservation[]) => void,
  onError?: (error: Error) => void
) => {
  const q = query(
    collection(db, RESERVATIONS_COL),
    orderBy('createdAt', 'desc')
  );

  return onSnapshot(
    q,
    (snapshot) => {
      const items: Reservation[] = [];
      snapshot.forEach((doc) => {
        items.push({ id: doc.id, ...doc.data() } as Reservation);
      });
      callback(items);
    },
    (err) => {
      console.warn('Firestore reservations subscription error:', err);
      onError?.(err);
    }
  );
};

/**
 * Real-time subscription to Clients
 */
export const subscribeToClients = (
  callback: (clients: Client[]) => void,
  onError?: (error: Error) => void
) => {
  const q = collection(db, CLIENTS_COL);

  return onSnapshot(
    q,
    (snapshot) => {
      const items: Client[] = [];
      snapshot.forEach((doc) => {
        items.push({ id: doc.id, ...doc.data() } as Client);
      });
      callback(items);
    },
    (err) => {
      console.warn('Firestore clients subscription error:', err);
      onError?.(err);
    }
  );
};

/**
 * Record a Client Movement in real time to Firestore
 */
export const recordClientMovement = async (movement: Omit<ClientMovement, 'id'>): Promise<string> => {
  try {
    const id = 'mov_' + Date.now() + '_' + Math.random().toString(36).substring(2, 6);
    const movementDoc: ClientMovement = {
      ...movement,
      id
    };
    await setDoc(doc(db, MOVEMENTS_COL, id), movementDoc);
    return id;
  } catch (err) {
    console.error('Error recording movement to Firestore:', err);
    return '';
  }
};

/**
 * Save / Update a Reservation in Firestore and record the movement
 */
export const saveReservationToFirestore = async (reservation: Reservation): Promise<void> => {
  try {
    await setDoc(doc(db, RESERVATIONS_COL, reservation.id), reservation);

    // Record movement
    await recordClientMovement({
      timestamp: new Date().toISOString(),
      type: 'reserva_creada',
      clientName: reservation.clientName,
      clientEmail: reservation.clientEmail,
      vehicleName: reservation.vehicleName,
      branchName: reservation.branchName,
      amount: reservation.total,
      details: `Nueva reserva de ${reservation.vehicleName} por ${reservation.days} días en ${reservation.branchName} ($${reservation.total} USD)`,
      status: reservation.status
    });
  } catch (err) {
    console.error('Error saving reservation to Firestore:', err);
  }
};

/**
 * Save / Upsert a Client in Firestore and record registration movement
 */
export const saveClientToFirestore = async (client: Client, isNew: boolean = false): Promise<void> => {
  try {
    const clientDocRef = doc(db, CLIENTS_COL, client.id);
    await setDoc(clientDocRef, client, { merge: true });

    if (isNew) {
      await recordClientMovement({
        timestamp: new Date().toISOString(),
        type: 'cliente_registrado',
        clientName: client.nombre,
        clientEmail: client.email,
        clientPhone: client.telefono,
        details: `Nuevo cliente registrado en la plataforma: ${client.nombre} (${client.email})`
      });
    }
  } catch (err) {
    console.error('Error saving client to Firestore:', err);
  }
};

/**
 * Update reservation status in Firestore (finalizado / cancelado)
 */
export const updateReservationStatusInFirestore = async (
  reservationId: string,
  newStatus: ReservationStatus,
  reservationData?: Reservation
): Promise<void> => {
  try {
    const resRef = doc(db, RESERVATIONS_COL, reservationId);
    await updateDoc(resRef, { status: newStatus });

    const type = newStatus === 'finalizado' ? 'viaje_finalizado' : 'viaje_cancelado';
    const actionLabel = newStatus === 'finalizado' ? 'finalizado (vehículo retornado a inventario)' : 'cancelado';

    await recordClientMovement({
      timestamp: new Date().toISOString(),
      type,
      clientName: reservationData?.clientName || 'Cliente',
      clientEmail: reservationData?.clientEmail || '',
      vehicleName: reservationData?.vehicleName || '',
      branchName: reservationData?.branchName || '',
      amount: reservationData?.total,
      details: `Viaje #${reservationId} ${actionLabel}.`,
      status: newStatus
    });
  } catch (err) {
    console.error('Error updating reservation in Firestore:', err);
  }
};

/**
 * Seed initial data to Firestore if collections are empty so real-time works out-of-the-box
 */
export const seedInitialFirestoreData = async (
  initialVehicles: Vehicle[],
  initialBranches: Branch[],
  initialClients: Client[],
  initialReservations: Reservation[]
) => {
  try {
    // Check if movements already exist
    const snap = await getDocs(query(collection(db, MOVEMENTS_COL), limit(1)));
    if (!snap.empty) {
      return; // Already initialized
    }

    // Seed initial clients
    for (const client of initialClients) {
      await setDoc(doc(db, CLIENTS_COL, client.id), client);
    }

    // Seed initial reservations
    for (const res of initialReservations) {
      await setDoc(doc(db, RESERVATIONS_COL, res.id), res);
      // Record initial movements for these
      await setDoc(doc(db, MOVEMENTS_COL, 'seed_' + res.id), {
        id: 'seed_' + res.id,
        timestamp: res.createdAt,
        type: 'reserva_creada',
        clientName: res.clientName,
        clientEmail: res.clientEmail,
        vehicleName: res.vehicleName,
        branchName: res.branchName,
        amount: res.total,
        details: `Reserva activa: ${res.vehicleName} (${res.days} días) en ${res.branchName}`,
        status: res.status
      } as ClientMovement);
    }

    // Seed initial welcome movement
    await setDoc(doc(db, MOVEMENTS_COL, 'seed_welcome'), {
      id: 'seed_welcome',
      timestamp: new Date().toISOString(),
      type: 'cliente_registrado',
      clientName: 'Sistema Trip Now',
      clientEmail: 'info@tripnow.sv',
      details: 'Base de datos en tiempo real conectada exitosamente a Firebase Firestore.',
      status: 'activo'
    } as ClientMovement);
  } catch (err) {
    console.warn('Initial seed to Firestore note:', err);
  }
};
