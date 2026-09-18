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

export const getFirestoreConfigSummary = () => ({
  projectId: firebaseConfig.projectId,
  authDomain: firebaseConfig.authDomain,
  storageBucket: firebaseConfig.storageBucket,
  appId: firebaseConfig.appId
});

// Save a patient to Firestore
export async function syncPatientToFirestore(patient: Patient): Promise<boolean> {
  try {
    const docRef = doc(db, 'patients', patient.id);
    await setDoc(docRef, patient, { merge: true });
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
    await setDoc(docRef, form, { merge: true });
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
    await setDoc(docRef, rx, { merge: true });
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
    await setDoc(docRef, apt, { merge: true });
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
    await setDoc(docRef, fu, { merge: true });
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
    await setDoc(docRef, inv, { merge: true });
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
