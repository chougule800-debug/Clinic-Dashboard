import {
  collection,
  doc,
  setDoc,
  getDocs,
  onSnapshot,
  query,
  orderBy
} from 'firebase/firestore';
import { db, firebaseConfig } from './firebase';
import {
  Patient,
  SystemFormRecord,
  Prescription,
  FollowUpRecord,
  Appointment,
  BillingInvoice
} from '../types';

export interface FirestoreSyncStatus {
  isConfigured: boolean;
  isConnected: boolean;
  projectId: string;
  lastSyncedAt: string | null;
  error: string | null;
}

export interface FirestoreConnectionDetails {
  connected: boolean;
  status: 'connected' | 'permission_denied' | 'network_error' | 'unreachable';
  statusMessage: string;
  projectId: string;
  authDomain: string;
  latencyMs: number;
  collectionsTested: {
    name: string;
    accessible: boolean;
    count?: number;
    error?: string;
  }[];
  timestamp: string;
}

export const getFirestoreConfigSummary = () => ({
  projectId: firebaseConfig.projectId,
  authDomain: firebaseConfig.authDomain,
  storageBucket: firebaseConfig.storageBucket,
  appId: firebaseConfig.appId
});

// Helper to remove undefined fields which Firestore rejects
function sanitizeForFirestore<T>(data: T): any {
  return JSON.parse(JSON.stringify(data, (key, value) => {
    return value === undefined ? null : value;
  }));
}

// Test live Firestore connectivity with detailed diagnostics
export async function testFirestoreConnection(): Promise<FirestoreConnectionDetails> {
  const startTime = Date.now();
  const collectionsTested: FirestoreConnectionDetails['collectionsTested'] = [];
  let isConnected = false;
  let status: FirestoreConnectionDetails['status'] = 'unreachable';
  let statusMessage = 'Unable to reach Firebase Firestore.';

  try {
    // 1. Test 'patients' collection
    try {
      const snap = await getDocs(collection(db, 'patients'));
      collectionsTested.push({
        name: 'patients',
        accessible: true,
        count: snap.size
      });
      isConnected = true;
      status = 'connected';
      statusMessage = `Connected to Firebase (${firebaseConfig.projectId}). Cloud database online.`;
    } catch (err: any) {
      const msg = err?.message || String(err);
      const isPerm = msg.toLowerCase().includes('permission') || msg.toLowerCase().includes('insufficient');
      collectionsTested.push({
        name: 'patients',
        accessible: false,
        error: isPerm ? 'Missing or insufficient permissions (check Firestore Rules)' : msg
      });
      if (isPerm) {
        status = 'permission_denied';
        statusMessage = `Firebase Project "${firebaseConfig.projectId}" reachable, but Firestore Rules require read/write access.`;
      } else {
        status = 'network_error';
        statusMessage = msg;
      }
    }

    // 2. Test 'systemForms' collection
    try {
      const formsSnap = await getDocs(collection(db, 'systemForms'));
      collectionsTested.push({
        name: 'systemForms',
        accessible: true,
        count: formsSnap.size
      });
      if (!isConnected) {
        isConnected = true;
        status = 'connected';
        statusMessage = `Connected to Firebase (${firebaseConfig.projectId}). Cloud database online.`;
      }
    } catch (err: any) {
      const msg = err?.message || String(err);
      collectionsTested.push({
        name: 'systemForms',
        accessible: false,
        error: msg
      });
    }
  } catch (outerErr: any) {
    status = 'network_error';
    statusMessage = outerErr?.message || 'Network error reaching Firestore';
  }

  const latencyMs = Date.now() - startTime;
  return {
    connected: isConnected,
    status,
    statusMessage,
    projectId: firebaseConfig.projectId,
    authDomain: firebaseConfig.authDomain,
    latencyMs,
    collectionsTested,
    timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })
  };
}

// Save a patient to Firestore
export async function syncPatientToFirestore(patient: Patient): Promise<boolean> {
  try {
    const docRef = doc(db, 'patients', patient.id);
    await setDoc(docRef, sanitizeForFirestore(patient), { merge: true });
    return true;
  } catch (err: any) {
    console.warn('[Firestore] Failed to save patient:', err?.message || err);
    return false;
  }
}

// Save a system form record to Firestore
export async function syncSystemFormToFirestore(form: SystemFormRecord): Promise<boolean> {
  try {
    const docRef = doc(db, 'systemForms', form.id);
    await setDoc(docRef, sanitizeForFirestore(form), { merge: true });
    return true;
  } catch (err: any) {
    console.warn('[Firestore] Failed to save systemForm:', err?.message || err);
    return false;
  }
}

// Save prescription to Firestore
export async function syncPrescriptionToFirestore(rx: Prescription): Promise<boolean> {
  try {
    const docRef = doc(db, 'prescriptions', rx.id);
    await setDoc(docRef, sanitizeForFirestore(rx), { merge: true });
    return true;
  } catch (err: any) {
    console.warn('[Firestore] Failed to save prescription:', err?.message || err);
    return false;
  }
}

// Save appointment to Firestore
export async function syncAppointmentToFirestore(apt: Appointment): Promise<boolean> {
  try {
    const docRef = doc(db, 'appointments', apt.id);
    await setDoc(docRef, sanitizeForFirestore(apt), { merge: true });
    return true;
  } catch (err: any) {
    console.warn('[Firestore] Failed to save appointment:', err?.message || err);
    return false;
  }
}

// Save follow-up to Firestore
export async function syncFollowUpToFirestore(fu: FollowUpRecord): Promise<boolean> {
  try {
    const docRef = doc(db, 'followUps', fu.id);
    await setDoc(docRef, sanitizeForFirestore(fu), { merge: true });
    return true;
  } catch (err: any) {
    console.warn('[Firestore] Failed to save followUp:', err?.message || err);
    return false;
  }
}

// Save invoice to Firestore
export async function syncInvoiceToFirestore(inv: BillingInvoice): Promise<boolean> {
  try {
    const docRef = doc(db, 'invoices', inv.id);
    await setDoc(docRef, sanitizeForFirestore(inv), { merge: true });
    return true;
  } catch (err: any) {
    console.warn('[Firestore] Failed to save invoice:', err?.message || err);
    return false;
  }
}

// Pull all patients from Firestore if existing
export async function fetchPatientsFromFirestore(): Promise<Patient[] | null> {
  try {
    const snap = await getDocs(collection(db, 'patients'));
    if (!snap.empty) {
      const list: Patient[] = [];
      snap.forEach(docSnap => {
        list.push(docSnap.data() as Patient);
      });
      return list;
    }
    return null;
  } catch (err: any) {
    console.warn('[Firestore] Failed to fetch patients:', err?.message || err);
    return null;
  }
}

// Pull all system forms from Firestore
export async function fetchSystemFormsFromFirestore(): Promise<SystemFormRecord[] | null> {
  try {
    const snap = await getDocs(collection(db, 'systemForms'));
    if (!snap.empty) {
      const list: SystemFormRecord[] = [];
      snap.forEach(docSnap => {
        list.push(docSnap.data() as SystemFormRecord);
      });
      return list;
    }
    return null;
  } catch (err: any) {
    console.warn('[Firestore] Failed to fetch systemForms:', err?.message || err);
    return null;
  }
}

// Pull all prescriptions from Firestore
export async function fetchPrescriptionsFromFirestore(): Promise<Prescription[] | null> {
  try {
    const snap = await getDocs(collection(db, 'prescriptions'));
    if (!snap.empty) {
      const list: Prescription[] = [];
      snap.forEach(docSnap => {
        list.push(docSnap.data() as Prescription);
      });
      return list;
    }
    return null;
  } catch (err: any) {
    console.warn('[Firestore] Failed to fetch prescriptions:', err?.message || err);
    return null;
  }
}

// Real-time listener for System Forms
export function subscribeToSystemForms(
  onUpdate: (forms: SystemFormRecord[]) => void,
  onError?: (err: any) => void
): () => void {
  try {
    return onSnapshot(
      collection(db, 'systemForms'),
      (snap) => {
        const list: SystemFormRecord[] = [];
        snap.forEach(docSnap => {
          list.push(docSnap.data() as SystemFormRecord);
        });
        onUpdate(list);
      },
      (err) => {
        console.warn('[Firestore] SystemForms subscription notice:', err?.message || err);
        if (onError) onError(err);
      }
    );
  } catch (err) {
    console.warn('[Firestore] Failed to attach systemForms listener:', err);
    return () => {};
  }
}

// Real-time listener for Patients
export function subscribeToPatients(
  onUpdate: (patients: Patient[]) => void,
  onError?: (err: any) => void
): () => void {
  try {
    return onSnapshot(
      collection(db, 'patients'),
      (snap) => {
        const list: Patient[] = [];
        snap.forEach(docSnap => {
          list.push(docSnap.data() as Patient);
        });
        onUpdate(list);
      },
      (err) => {
        console.warn('[Firestore] Patients subscription notice:', err?.message || err);
        if (onError) onError(err);
      }
    );
  } catch (err) {
    console.warn('[Firestore] Failed to attach patients listener:', err);
    return () => {};
  }
}

// Batch push all local data to Firestore
export async function pushAllToFirestore(data: {
  patients: Patient[];
  systemForms: SystemFormRecord[];
  prescriptions: Prescription[];
  appointments: Appointment[];
  followUps: FollowUpRecord[];
  invoices: BillingInvoice[];
}): Promise<{ successCount: number; errors: number }> {
  let successCount = 0;
  let errors = 0;

  for (const p of data.patients) {
    const ok = await syncPatientToFirestore(p);
    if (ok) successCount++; else errors++;
  }

  for (const f of data.systemForms) {
    const ok = await syncSystemFormToFirestore(f);
    if (ok) successCount++; else errors++;
  }

  for (const rx of data.prescriptions) {
    const ok = await syncPrescriptionToFirestore(rx);
    if (ok) successCount++; else errors++;
  }

  for (const apt of data.appointments) {
    const ok = await syncAppointmentToFirestore(apt);
    if (ok) successCount++; else errors++;
  }

  for (const fu of data.followUps) {
    const ok = await syncFollowUpToFirestore(fu);
    if (ok) successCount++; else errors++;
  }

  for (const inv of data.invoices) {
    const ok = await syncInvoiceToFirestore(inv);
    if (ok) successCount++; else errors++;
  }

  return { successCount, errors };
}
