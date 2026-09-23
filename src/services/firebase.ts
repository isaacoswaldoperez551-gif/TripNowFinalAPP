import { initializeApp, getApps, getApp } from 'firebase/app';
import {
  getFirestore, collection, doc, setDoc, updateDoc, deleteDoc,
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
 * Clean legacy demo mock data from Firestore so only real registered clients,
 * real reservations, and authentic real-time movements exist.
 */
export const cleanMockFirestoreData = async () => {
  try {
    // Delete any demo clients in Firestore
    const clientsSnap = await getDocs(collection(db, CLIENTS_COL));
    for (const d of clientsSnap.docs) {
      const data = d.data();
      if (d.id.startsWith('c_demo_') || data.nombre === 'Carlos Menéndez' || data.nombre === 'Elena Rodríguez') {
        await deleteDoc(doc(db, CLIENTS_COL, d.id));
      }
    }

    // Delete any demo reservations in Firestore
    const resSnap = await getDocs(collection(db, RESERVATIONS_COL));
    for (const d of resSnap.docs) {
      const data = d.data();
      if (d.id.startsWith('r_17100010') || data.clientName === 'Carlos Menéndez' || data.clientName === 'Elena Rodríguez') {
        await deleteDoc(doc(db, RESERVATIONS_COL, d.id));
      }
    }

    // Delete any demo movements in Firestore
    const movSnap = await getDocs(collection(db, MOVEMENTS_COL));
    for (const d of movSnap.docs) {
      const data = d.data();
      if (
        d.id.startsWith('seed_') ||
        data.clientName === 'Carlos Menéndez' ||
        data.clientName === 'Elena Rodríguez' ||
        data.clientName === 'Sistema Trip Now'
      ) {
        await deleteDoc(doc(db, MOVEMENTS_COL, d.id));
      }
    }
  } catch (err) {
    console.warn('Firestore mock cleanup note:', err);
  }
};

/**
 * Delete a specific client from Firestore and record the movement
 */
export const deleteClientFromFirestore = async (
  clientId: string,
  clientName?: string,
  clientEmail?: string
): Promise<boolean> => {
  try {
    // 1. Delete by document ID
    const clientRef = doc(db, CLIENTS_COL, clientId);
    await deleteDoc(clientRef);

    // 2. Also ensure any document matching this email is removed
    if (clientEmail) {
      try {
        const snap = await getDocs(collection(db, CLIENTS_COL));
        for (const d of snap.docs) {
          const data = d.data();
          if (data.email?.toLowerCase().trim() === clientEmail.toLowerCase().trim()) {
            await deleteDoc(doc(db, CLIENTS_COL, d.id));
          }
        }
      } catch (subErr) {
        console.warn('Secondary email check notice:', subErr);
      }
    }

    // 3. Record audit movement in real time
    await recordClientMovement({
      timestamp: new Date().toISOString(),
      type: 'cliente_eliminado',
      clientName: clientName || 'Cliente',
      clientEmail: clientEmail || '',
      details: `Cliente (${clientName || clientId}) fue eliminado de la base de datos por el Administrador.`
    });

    return true;
  } catch (err) {
    console.error('Error deleting client from Firestore:', err);
    return false;
  }
};

/**
 * Delete all clients from Firestore (clean slate)
 */
export const deleteAllClientsFromFirestore = async (): Promise<boolean> => {
  try {
    const clientsSnap = await getDocs(collection(db, CLIENTS_COL));
    for (const d of clientsSnap.docs) {
      await deleteDoc(doc(db, CLIENTS_COL, d.id));
    }

    await recordClientMovement({
      timestamp: new Date().toISOString(),
      type: 'cliente_eliminado',
      clientName: 'Administrador',
      clientEmail: 'admin@tripnow.sv',
      details: `El Administrador purgó la lista completa de clientes en Firebase.`
    });

    return true;
  } catch (err) {
    console.error('Error purging all clients from Firestore:', err);
    return false;
  }
};
