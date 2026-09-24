import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  Patient,
  PatientVitals,
  SystemFormRecord,
  Prescription,
  FollowUpRecord,
  Appointment,
  WhatsAppConversation,
  BillingInvoice,
  ClinicalSystemKey,
  WhatsAppMessage,
  WhatsAppShareDialogData,
  WhatsAppShareType,
  DoctorUser
} from '../types';
import {
  INITIAL_PATIENTS,
  INITIAL_SYSTEM_FORMS,
  INITIAL_PRESCRIPTIONS,
  INITIAL_FOLLOW_UPS,
  INITIAL_APPOINTMENTS,
  INITIAL_CONVERSATIONS,
  INITIAL_INVOICES
} from '../data/mockData';
import { CLINIC_CONFIG } from '../config/clinicConfig';
import { INITIAL_DOCTORS } from '../config/doctorsConfig';
import {
  syncPatientToFirestore,
  syncSystemFormToFirestore,
  syncPrescriptionToFirestore,
  syncAppointmentToFirestore,
  syncFollowUpToFirestore,
  syncInvoiceToFirestore,
  fetchPatientsFromFirestore,
  pushAllToFirestore
} from '../lib/firestoreService';

interface ClinicContextType {
  patients: Patient[];
  selectedPatientId: string | null;
  selectedPatient: Patient | undefined;
  systemForms: SystemFormRecord[];
  prescriptions: Prescription[];
  followUps: FollowUpRecord[];
  appointments: Appointment[];
  conversations: WhatsAppConversation[];
  invoices: BillingInvoice[];
  
  // Cloud Firestore Status & Sync
  firestoreStatus: {
    projectId: string;
    isSyncing: boolean;
    lastSyncedAt: string | null;
    error: string | null;
  };
  syncAllToCloud: () => Promise<{ successCount: number; errors: number }>;

  // Navigation / Modal triggers
  activeTab: string;
  setActiveTab: (tab: string) => void;
  activeSystemFormKey: ClinicalSystemKey;
  setActiveSystemFormKey: (system: ClinicalSystemKey) => void;

  // Remote intake preview mode modal
  remoteIntakeModal: { isOpen: boolean; patientId: string; system: ClinicalSystemKey } | null;
  openRemoteIntakeModal: (patientId: string, system: ClinicalSystemKey) => void;
  closeRemoteIntakeModal: () => void;

  // WhatsApp Share Dialog
  whatsAppShareDialog: WhatsAppShareDialogData | null;
  openWhatsAppShareDialog: (patientId: string, system: ClinicalSystemKey) => void;
  openWhatsAppPrescriptionShareDialog: (patientId: string, prescriptionId?: string) => void;
  openWhatsAppBillingShareDialog: (patientId: string, invoiceId?: string) => void;
  closeWhatsAppShareDialog: () => void;
  generateWhatsAppLink: (patientId: string, system: ClinicalSystemKey) => { link: string; messageText: string; waUrl: string };
  generateWhatsAppPrescriptionLink: (patientId: string, prescriptionId?: string) => { link: string; messageText: string; waUrl: string };
  generateWhatsAppBillingLink: (patientId: string, invoiceId?: string) => { link: string; messageText: string; waUrl: string };

  // Actions
  selectPatient: (patientId: string) => void;
  createPatient: (patientData: Omit<Patient, 'id' | 'createdAt' | 'updatedAt'>) => Patient;
  updatePatient: (id: string, updates: Partial<Patient>) => void;
  
  saveSystemForm: (data: {
    patientId: string;
    system: ClinicalSystemKey;
    data: Record<string, any>;
    chiefComplaints: string;
    duration: string;
    severity: 'Mild' | 'Moderate' | 'Severe';
    modalitiesAggravation: string;
    modalitiesAmelioration: string;
    concomitants: string;
    clinicalNotes: string;
    submittedVia?: 'Doctor_Dashboard' | 'WhatsApp_Remote_Intake';
  }) => SystemFormRecord;

  savePrescription: (rxData: Omit<Prescription, 'id'> & { id?: string }) => Prescription;
  saveFollowUp: (fuData: Omit<FollowUpRecord, 'id'>) => FollowUpRecord;
  addAppointment: (apt: Omit<Appointment, 'id'>) => void;
  updateAppointmentStatus: (id: string, status: Appointment['status']) => void;
  
  // WhatsApp Inbox
  sendWhatsAppMessage: (convId: string, text: string, linkData?: WhatsAppMessage['linkData']) => void;
  updateConversationStatus: (convId: string, status: WhatsAppConversation['status']) => void;
  markConversationAsRead: (convId: string) => void;
  submitRemoteIntake: (patientId: string, system: ClinicalSystemKey, payload: any) => void;

  // Billing
  saveInvoice: (invoice: Omit<BillingInvoice, 'id'>) => BillingInvoice;

  // Auth & Multi-Doctor
  currentUser: DoctorUser | null;
  doctorUsers: DoctorUser[];
  login: (email: string, pass: string) => { success: boolean; error?: string };
  logout: () => void;
  updateDoctorProfile: (updates: Partial<DoctorUser>) => void;
  createDoctorUser: (doctorData: Omit<DoctorUser, 'id' | 'createdAt'>) => { success: boolean; error?: string };
  deleteDoctorUser: (id: string) => void;
  resetDoctorPassword: (id: string, newPass: string) => void;

  // Quick Vitals update (Numbers only, direct sync)
  updatePatientVitals: (patientId: string, vitals: Partial<PatientVitals>, newAge?: number) => void;
  
  // Reset
  resetDatabase: () => void;
}

const ClinicContext = createContext<ClinicContextType | undefined>(undefined);

const LOCAL_STORAGE_KEY = 'clinicapro_master_data_v1';

export const ClinicProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Multi-Doctor Authentication & Users
  const [doctorUsers, setDoctorUsers] = useState<DoctorUser[]>(() => {
    try {
      const stored = localStorage.getItem('ayush_doctor_users');
      return stored ? JSON.parse(stored) : INITIAL_DOCTORS;
    } catch {
      return INITIAL_DOCTORS;
    }
  });

  const [currentUser, setCurrentUser] = useState<DoctorUser | null>(() => {
    try {
      const stored = localStorage.getItem('ayush_current_user');
      if (stored) {
        const parsed = JSON.parse(stored);
        return parsed;
      }
      return INITIAL_DOCTORS[0]; // Dr. Bharat Chougule as initial owner
    } catch {
      return INITIAL_DOCTORS[0];
    }
  });

  // Sync CLINIC_CONFIG with the active logged-in doctor
  useEffect(() => {
    if (currentUser) {
      CLINIC_CONFIG.appName = currentUser.clinicName || CLINIC_CONFIG.appName;
      CLINIC_CONFIG.doctorName = currentUser.name || CLINIC_CONFIG.doctorName;
      CLINIC_CONFIG.qualifications = currentUser.qualifications || CLINIC_CONFIG.qualifications;
      CLINIC_CONFIG.regNo = currentUser.regNo || CLINIC_CONFIG.regNo;
      CLINIC_CONFIG.address = currentUser.address || CLINIC_CONFIG.address;
      CLINIC_CONFIG.city = currentUser.city || CLINIC_CONFIG.city;
      CLINIC_CONFIG.pinCode = currentUser.pinCode || CLINIC_CONFIG.pinCode;
      CLINIC_CONFIG.phone = currentUser.phone || CLINIC_CONFIG.phone;
      CLINIC_CONFIG.email = currentUser.email || CLINIC_CONFIG.email;
    }
  }, [currentUser]);

  // Load doctor-isolated data or default
  const activeDocId = currentUser?.id || 'doc_bharat';

  const [patients, setPatients] = useState<Patient[]>(() => {
    try {
      const docKey = `ayush_${activeDocId}_patients`;
      const stored = localStorage.getItem(docKey) || (activeDocId === 'doc_bharat' ? localStorage.getItem(`${LOCAL_STORAGE_KEY}_patients`) : null);
      return stored ? JSON.parse(stored) : (activeDocId === 'doc_bharat' ? INITIAL_PATIENTS : []);
    } catch {
      return activeDocId === 'doc_bharat' ? INITIAL_PATIENTS : [];
    }
  });

  const [selectedPatientId, setSelectedPatientId] = useState<string | null>(() => {
    return patients.length > 0 ? patients[0].id : null;
  });

  const [systemForms, setSystemForms] = useState<SystemFormRecord[]>(() => {
    try {
      const docKey = `ayush_${activeDocId}_system_forms`;
      const stored = localStorage.getItem(docKey) || (activeDocId === 'doc_bharat' ? localStorage.getItem(`${LOCAL_STORAGE_KEY}_system_forms`) : null);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed)) {
          return parsed.filter(
            (f: any) =>
              !f.id?.startsWith('REC-HD-1001') &&
              !f.id?.startsWith('REC-GIT-1001') &&
              !f.id?.startsWith('REC-MSK-1002') &&
              !f.id?.startsWith('REC-RESP-1003') &&
              !f.id?.startsWith('REC-SKIN-1001')
          );
        }
      }
      return activeDocId === 'doc_bharat' ? INITIAL_SYSTEM_FORMS : [];
    } catch {
      return activeDocId === 'doc_bharat' ? INITIAL_SYSTEM_FORMS : [];
    }
  });

  const [prescriptions, setPrescriptions] = useState<Prescription[]>(() => {
    try {
      const docKey = `ayush_${activeDocId}_prescriptions`;
      const stored = localStorage.getItem(docKey) || (activeDocId === 'doc_bharat' ? localStorage.getItem(`${LOCAL_STORAGE_KEY}_prescriptions`) : null);
      return stored ? JSON.parse(stored) : (activeDocId === 'doc_bharat' ? INITIAL_PRESCRIPTIONS : []);
    } catch {
      return activeDocId === 'doc_bharat' ? INITIAL_PRESCRIPTIONS : [];
    }
  });

  const [followUps, setFollowUps] = useState<FollowUpRecord[]>(() => {
    try {
      const docKey = `ayush_${activeDocId}_follow_ups`;
      const stored = localStorage.getItem(docKey) || (activeDocId === 'doc_bharat' ? localStorage.getItem(`${LOCAL_STORAGE_KEY}_follow_ups`) : null);
      return stored ? JSON.parse(stored) : (activeDocId === 'doc_bharat' ? INITIAL_FOLLOW_UPS : []);
    } catch {
      return activeDocId === 'doc_bharat' ? INITIAL_FOLLOW_UPS : [];
    }
  });

  const [appointments, setAppointments] = useState<Appointment[]>(() => {
    try {
      const docKey = `ayush_${activeDocId}_appointments`;
      const stored = localStorage.getItem(docKey) || (activeDocId === 'doc_bharat' ? localStorage.getItem(`${LOCAL_STORAGE_KEY}_appointments`) : null);
      return stored ? JSON.parse(stored) : (activeDocId === 'doc_bharat' ? INITIAL_APPOINTMENTS : []);
    } catch {
      return activeDocId === 'doc_bharat' ? INITIAL_APPOINTMENTS : [];
    }
  });

  const [conversations, setConversations] = useState<WhatsAppConversation[]>(() => {
    try {
      const docKey = `ayush_${activeDocId}_conversations`;
      const stored = localStorage.getItem(docKey) || (activeDocId === 'doc_bharat' ? localStorage.getItem(`${LOCAL_STORAGE_KEY}_conversations`) : null);
      return stored ? JSON.parse(stored) : (activeDocId === 'doc_bharat' ? INITIAL_CONVERSATIONS : []);
    } catch {
      return activeDocId === 'doc_bharat' ? INITIAL_CONVERSATIONS : [];
    }
  });

  const [invoices, setInvoices] = useState<BillingInvoice[]>(() => {
    try {
      const docKey = `ayush_${activeDocId}_invoices`;
      const stored = localStorage.getItem(docKey) || (activeDocId === 'doc_bharat' ? localStorage.getItem(`${LOCAL_STORAGE_KEY}_invoices`) : null);
      return stored ? JSON.parse(stored) : (activeDocId === 'doc_bharat' ? INITIAL_INVOICES : []);
    } catch {
      return activeDocId === 'doc_bharat' ? INITIAL_INVOICES : [];
    }
  });

  const [activeTab, setActiveTab] = useState<string>('dashboard');
  const [activeSystemFormKey, setActiveSystemFormKey] = useState<ClinicalSystemKey>('headache');

  const [firestoreStatus, setFirestoreStatus] = useState<{
    projectId: string;
    isSyncing: boolean;
    lastSyncedAt: string | null;
    error: string | null;
  }>({
    projectId: 'ananyainfotech',
    isSyncing: false,
    lastSyncedAt: null,
    error: null
  });

  // Check initial Firestore connection on mount
  useEffect(() => {
    let isMounted = true;
    (async () => {
      try {
        const cloudPatients = await fetchPatientsFromFirestore();
        if (isMounted && cloudPatients && cloudPatients.length > 0) {
          setPatients(cloudPatients);
          setFirestoreStatus(prev => ({
            ...prev,
            lastSyncedAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
          }));
        }
      } catch (err) {
        console.warn('Initial Firestore fetch fallback to local:', err);
      }
    })();
    return () => {
      isMounted = false;
    };
  }, []);

  const syncAllToCloud = async (): Promise<{ successCount: number; errors: number }> => {
    setFirestoreStatus(prev => ({ ...prev, isSyncing: true, error: null }));
    try {
      const res = await pushAllToFirestore({
        patients,
        systemForms,
        prescriptions,
        appointments,
        followUps,
        invoices
      });
      setFirestoreStatus(prev => ({
        ...prev,
        isSyncing: false,
        lastSyncedAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        error: res.errors > 0 ? `${res.errors} items had sync notices` : null
      }));
      return res;
    } catch (err: any) {
      setFirestoreStatus(prev => ({
        ...prev,
        isSyncing: false,
        error: err?.message || 'Sync encountered an error'
      }));
      return { successCount: 0, errors: 1 };
    }
  };

  const [remoteIntakeModal, setRemoteIntakeModal] = useState<{
    isOpen: boolean;
    patientId: string;
    system: ClinicalSystemKey;
  } | null>(null);

  const [whatsAppShareDialog, setWhatsAppShareDialog] = useState<WhatsAppShareDialogData | null>(null);

  // Sync to doctor-scoped localStorage
  const currentDocId = currentUser?.id || 'doc_bharat';

  useEffect(() => {
    try {
      localStorage.setItem(`ayush_${currentDocId}_patients`, JSON.stringify(patients));
      if (currentDocId === 'doc_bharat') {
        localStorage.setItem(`${LOCAL_STORAGE_KEY}_patients`, JSON.stringify(patients));
      }
    } catch (e) {
      console.warn('LocalStorage error:', e);
    }
  }, [patients, currentDocId]);

  useEffect(() => {
    try {
      localStorage.setItem(`ayush_${currentDocId}_system_forms`, JSON.stringify(systemForms));
      if (currentDocId === 'doc_bharat') {
        localStorage.setItem(`${LOCAL_STORAGE_KEY}_system_forms`, JSON.stringify(systemForms));
      }
    } catch (e) {
      console.warn('LocalStorage error:', e);
    }
  }, [systemForms, currentDocId]);

  useEffect(() => {
    try {
      localStorage.setItem(`ayush_${currentDocId}_prescriptions`, JSON.stringify(prescriptions));
      if (currentDocId === 'doc_bharat') {
        localStorage.setItem(`${LOCAL_STORAGE_KEY}_prescriptions`, JSON.stringify(prescriptions));
      }
    } catch (e) {
      console.warn('LocalStorage error:', e);
    }
  }, [prescriptions, currentDocId]);

  useEffect(() => {
    try {
      localStorage.setItem(`ayush_${currentDocId}_follow_ups`, JSON.stringify(followUps));
      if (currentDocId === 'doc_bharat') {
        localStorage.setItem(`${LOCAL_STORAGE_KEY}_follow_ups`, JSON.stringify(followUps));
      }
    } catch (e) {
      console.warn('LocalStorage error:', e);
    }
  }, [followUps, currentDocId]);

  useEffect(() => {
    try {
      localStorage.setItem(`ayush_${currentDocId}_appointments`, JSON.stringify(appointments));
      if (currentDocId === 'doc_bharat') {
        localStorage.setItem(`${LOCAL_STORAGE_KEY}_appointments`, JSON.stringify(appointments));
      }
    } catch (e) {
      console.warn('LocalStorage error:', e);
    }
  }, [appointments, currentDocId]);

  useEffect(() => {
    try {
      localStorage.setItem(`ayush_${currentDocId}_conversations`, JSON.stringify(conversations));
      if (currentDocId === 'doc_bharat') {
        localStorage.setItem(`${LOCAL_STORAGE_KEY}_conversations`, JSON.stringify(conversations));
      }
    } catch (e) {
      console.warn('LocalStorage error:', e);
    }
  }, [conversations, currentDocId]);

  useEffect(() => {
    try {
      localStorage.setItem(`ayush_${currentDocId}_invoices`, JSON.stringify(invoices));
      if (currentDocId === 'doc_bharat') {
        localStorage.setItem(`${LOCAL_STORAGE_KEY}_invoices`, JSON.stringify(invoices));
      }
    } catch (e) {
      console.warn('LocalStorage error:', e);
    }
  }, [invoices, currentDocId]);

  // Method to load doctor-specific workspace
  const loadDoctorData = (doctor: DoctorUser) => {
    const docId = doctor.id;
    try {
      const storedPatients = localStorage.getItem(`ayush_${docId}_patients`) ||
        (docId === 'doc_bharat' ? localStorage.getItem(`${LOCAL_STORAGE_KEY}_patients`) : null);
      const docPatients = storedPatients ? JSON.parse(storedPatients) : (docId === 'doc_bharat' ? INITIAL_PATIENTS : []);
      setPatients(docPatients);
      setSelectedPatientId(docPatients.length > 0 ? docPatients[0].id : null);

      const storedForms = localStorage.getItem(`ayush_${docId}_system_forms`) ||
        (docId === 'doc_bharat' ? localStorage.getItem(`${LOCAL_STORAGE_KEY}_system_forms`) : null);
      setSystemForms(storedForms ? JSON.parse(storedForms) : (docId === 'doc_bharat' ? INITIAL_SYSTEM_FORMS : []));

      const storedRx = localStorage.getItem(`ayush_${docId}_prescriptions`) ||
        (docId === 'doc_bharat' ? localStorage.getItem(`${LOCAL_STORAGE_KEY}_prescriptions`) : null);
      setPrescriptions(storedRx ? JSON.parse(storedRx) : (docId === 'doc_bharat' ? INITIAL_PRESCRIPTIONS : []));

      const storedInv = localStorage.getItem(`ayush_${docId}_invoices`) ||
        (docId === 'doc_bharat' ? localStorage.getItem(`${LOCAL_STORAGE_KEY}_invoices`) : null);
      setInvoices(storedInv ? JSON.parse(storedInv) : (docId === 'doc_bharat' ? INITIAL_INVOICES : []));

      const storedApt = localStorage.getItem(`ayush_${docId}_appointments`) ||
        (docId === 'doc_bharat' ? localStorage.getItem(`${LOCAL_STORAGE_KEY}_appointments`) : null);
      setAppointments(storedApt ? JSON.parse(storedApt) : (docId === 'doc_bharat' ? INITIAL_APPOINTMENTS : []));

      const storedConv = localStorage.getItem(`ayush_${docId}_conversations`) ||
        (docId === 'doc_bharat' ? localStorage.getItem(`${LOCAL_STORAGE_KEY}_conversations`) : null);
      setConversations(storedConv ? JSON.parse(storedConv) : (docId === 'doc_bharat' ? INITIAL_CONVERSATIONS : []));

      const storedFU = localStorage.getItem(`ayush_${docId}_follow_ups`) ||
        (docId === 'doc_bharat' ? localStorage.getItem(`${LOCAL_STORAGE_KEY}_follow_ups`) : null);
      setFollowUps(storedFU ? JSON.parse(storedFU) : (docId === 'doc_bharat' ? INITIAL_FOLLOW_UPS : []));
    } catch (err) {
      console.warn('Error loading doctor isolated data:', err);
    }
  };

  const login = (email: string, pass: string): { success: boolean; error?: string } => {
    const trimmedEmail = email.trim().toLowerCase();
    const found = doctorUsers.find(
      d => d.email.toLowerCase() === trimmedEmail && d.password === pass
    );

    if (!found) {
      return {
        success: false,
        error: 'Invalid Login ID or Password. Please check credentials or contact Dr. Bharat Chougule (9902686173).'
      };
    }

    setCurrentUser(found);
    localStorage.setItem('ayush_current_user', JSON.stringify(found));
    loadDoctorData(found);
    return { success: true };
  };

  const logout = () => {
    setCurrentUser(null);
    localStorage.removeItem('ayush_current_user');
  };

  const updateDoctorProfile = (updates: Partial<DoctorUser>) => {
    if (!currentUser) return;
    const updated = { ...currentUser, ...updates };
    setCurrentUser(updated);
    localStorage.setItem('ayush_current_user', JSON.stringify(updated));

    setDoctorUsers(prev => {
      const list = prev.map(d => (d.id === updated.id ? updated : d));
      localStorage.setItem('ayush_doctor_users', JSON.stringify(list));
      return list;
    });
  };

  const createDoctorUser = (docData: Omit<DoctorUser, 'id' | 'createdAt'>) => {
    const existing = doctorUsers.find(
      d => d.email.toLowerCase() === docData.email.trim().toLowerCase()
    );
    if (existing) {
      return { success: false, error: 'A doctor with this Login ID/Email already exists.' };
    }
    const newDoc: DoctorUser = {
      ...docData,
      id: `doc_${Date.now()}`,
      createdAt: new Date().toISOString()
    };
    const updatedList = [...doctorUsers, newDoc];
    setDoctorUsers(updatedList);
    localStorage.setItem('ayush_doctor_users', JSON.stringify(updatedList));
    return { success: true };
  };

  const deleteDoctorUser = (id: string) => {
    if (id === 'doc_bharat') return; // Cannot delete owner
    const updatedList = doctorUsers.filter(d => d.id !== id);
    setDoctorUsers(updatedList);
    localStorage.setItem('ayush_doctor_users', JSON.stringify(updatedList));
  };

  const resetDoctorPassword = (id: string, newPass: string) => {
    const updatedList = doctorUsers.map(d => (d.id === id ? { ...d, password: newPass } : d));
    setDoctorUsers(updatedList);
    localStorage.setItem('ayush_doctor_users', JSON.stringify(updatedList));
    if (currentUser?.id === id) {
      const updatedCurr = { ...currentUser, password: newPass };
      setCurrentUser(updatedCurr);
      localStorage.setItem('ayush_current_user', JSON.stringify(updatedCurr));
    }
  };

  const updatePatientVitals = (patientId: string, vitalsUpdates: Partial<PatientVitals>, newAge?: number) => {
    setPatients(prev =>
      prev.map(p => {
        if (p.id !== patientId) return p;
        const updatedVitals: PatientVitals = {
          ...p.vitals,
          ...vitalsUpdates
        };
        return {
          ...p,
          age: typeof newAge === 'number' && !isNaN(newAge) ? newAge : p.age,
          vitals: updatedVitals,
          updatedAt: new Date().toISOString()
        };
      })
    );
  };

  const selectedPatient = patients.find(p => p.id === selectedPatientId) || patients[0];

  const selectPatient = (patientId: string) => {
    setSelectedPatientId(patientId);
  };

  const createPatient = (patientData: Omit<Patient, 'id' | 'createdAt' | 'updatedAt'>): Patient => {
    const newId = `PT-${1000 + patients.length + 1}`;
    const now = new Date().toISOString();
    const newPatient: Patient = {
      ...patientData,
      id: newId,
      createdAt: now,
      updatedAt: now
    };
    setPatients(prev => [newPatient, ...prev]);
    setSelectedPatientId(newId);

    // Also auto-create a conversation in WhatsApp inbox for this patient!
    const cleanPhone = newPatient.mobile.replace(/[^0-9]/g, '');
    const newConv: WhatsAppConversation = {
      id: `CONV-${Date.now()}`,
      patientId: newId,
      patientName: newPatient.name,
      phone: newPatient.mobile,
      category: 'Patients',
      unreadCount: 0,
      lastMessage: `Patient registered at ${CLINIC_CONFIG.appName}. Welcome message sent.`,
      lastMessageTime: 'Just now',
      status: 'In-Progress',
      messages: [
        {
          id: `msg-reg-${Date.now()}`,
          sender: 'doctor',
          text: `Welcome ${newPatient.name} to ${CLINIC_CONFIG.appName} (${CLINIC_CONFIG.doctorName}, ${CLINIC_CONFIG.qualifications})! Your patient ID is ${newPatient.id}. We are at your service for holistic care at ${CLINIC_CONFIG.address}.`,
          timestamp: 'Just now',
          status: 'sent'
        }
      ]
    };
    setConversations(prev => [newConv, ...prev]);

    // Automatically sync to Cloud Firestore
    syncPatientToFirestore(newPatient).catch(err => console.warn('Firestore sync notice:', err));

    return newPatient;
  };

  const updatePatient = (id: string, updates: Partial<Patient>) => {
    setPatients(prev =>
      prev.map(p => {
        if (p.id === id) {
          const updated = {
            ...p,
            ...updates,
            updatedAt: new Date().toISOString()
          };
          syncPatientToFirestore(updated).catch(err => console.warn('Firestore sync notice:', err));
          return updated;
        }
        return p;
      })
    );
  };

  const saveSystemForm = (record: {
    patientId: string;
    system: ClinicalSystemKey;
    data: Record<string, any>;
    chiefComplaints: string;
    duration: string;
    severity: 'Mild' | 'Moderate' | 'Severe';
    modalitiesAggravation: string;
    modalitiesAmelioration: string;
    concomitants: string;
    clinicalNotes: string;
    submittedVia?: 'Doctor_Dashboard' | 'WhatsApp_Remote_Intake';
  }): SystemFormRecord => {
    const now = new Date().toISOString();
    const existingIndex = systemForms.findIndex(
      f => f.patientId === record.patientId && f.system === record.system
    );

    let savedRecord: SystemFormRecord;

    if (existingIndex >= 0) {
      savedRecord = {
        ...systemForms[existingIndex],
        ...record,
        submittedVia: record.submittedVia || 'Doctor_Dashboard',
        updatedAt: now
      };
      setSystemForms(prev => {
        const copy = [...prev];
        copy[existingIndex] = savedRecord;
        return copy;
      });
    } else {
      savedRecord = {
        id: `REC-${Date.now().toString(36).toUpperCase()}`,
        patientId: record.patientId,
        system: record.system,
        updatedAt: now,
        submittedVia: record.submittedVia || 'Doctor_Dashboard',
        data: record.data,
        chiefComplaints: record.chiefComplaints,
        duration: record.duration,
        severity: record.severity,
        modalitiesAggravation: record.modalitiesAggravation,
        modalitiesAmelioration: record.modalitiesAmelioration,
        concomitants: record.concomitants,
        clinicalNotes: record.clinicalNotes
      };
      setSystemForms(prev => [savedRecord, ...prev]);
    }

    // Automatically sync to Cloud Firestore
    syncSystemFormToFirestore(savedRecord).catch(err => console.warn('Firestore sync notice:', err));

    return savedRecord;
  };

  const savePrescription = (rxData: Omit<Prescription, 'id'> & { id?: string }): Prescription => {
    let saved: Prescription;
    if (rxData.id) {
      saved = rxData as Prescription;
      setPrescriptions(prev => prev.map(p => (p.id === rxData.id ? saved : p)));
    } else {
      saved = {
        ...rxData,
        id: `RX-${8800 + prescriptions.length + 1}`
      };
      setPrescriptions(prev => [saved, ...prev]);
    }
    // Automatically sync to Cloud Firestore
    syncPrescriptionToFirestore(saved).catch(err => console.warn('Firestore sync notice:', err));
    return saved;
  };

  const saveFollowUp = (fuData: Omit<FollowUpRecord, 'id'>): FollowUpRecord => {
    const newFu: FollowUpRecord = {
      ...fuData,
      id: `FU-${500 + followUps.length + 1}`
    };
    setFollowUps(prev => [newFu, ...prev]);
    syncFollowUpToFirestore(newFu).catch(err => console.warn('Firestore sync notice:', err));
    return newFu;
  };

  const addAppointment = (apt: Omit<Appointment, 'id'>) => {
    const newApt: Appointment = {
      ...apt,
      id: `APT-${100 + appointments.length + 1}`
    };
    setAppointments(prev => [newApt, ...prev]);
    syncAppointmentToFirestore(newApt).catch(err => console.warn('Firestore sync notice:', err));
  };

  const updateAppointmentStatus = (id: string, status: Appointment['status']) => {
    setAppointments(prev => prev.map(a => {
      if (a.id === id) {
        const updated = { ...a, status };
        syncAppointmentToFirestore(updated).catch(err => console.warn('Firestore sync notice:', err));
        return updated;
      }
      return a;
    }));
  };

  const generateWhatsAppLink = (patientId: string, system: ClinicalSystemKey) => {
    const patient = patients.find(p => p.id === patientId) || selectedPatient;
    const origin = window.location.origin + window.location.pathname;
    const shareableUrl = `${origin}?view=intake&pt=${patientId}&system=${system}`;
    
    // System readable label
    const systemNames: Record<ClinicalSystemKey, string> = {
      headache: 'Headache & Neurological',
      skin_hair: 'Skin & Hair Complaints',
      gastrointestinal: 'Gastrointestinal & Digestion',
      urinary: 'Urinary Symptoms',
      musculoskeletal: 'Musculoskeletal & Spine',
      respiratory: 'Respiratory & Cough',
      female_gynae: 'Female & Gynaecological Health',
      pediatric: 'Pediatric Case Taking',
      other_mind_generals: 'Mind, Generals & Psycho-Somatic'
    };

    const sysName = systemNames[system] || system;
    const messageText = `Hello ${patient ? patient.name : 'Patient'}, ${CLINIC_CONFIG.doctorName} at ${CLINIC_CONFIG.appName} has sent you your specialized Clinical Case Taking Form for *${sysName}*.\n\n📝 Open and fill your secure personal case form here:\n👉 ${shareableUrl}\n\n(Only your personal case intake form will open). Once submitted, Dr. Bharat will immediately review your case details and prepare your prescription.`;

    const cleanNumber = patient ? patient.mobile.replace(/[^0-9]/g, '') : '';
    const waUrl = `https://wa.me/${cleanNumber}?text=${encodeURIComponent(messageText)}`;

    return {
      link: shareableUrl,
      messageText,
      waUrl
    };
  };

  const generateWhatsAppPrescriptionLink = (patientId: string, prescriptionId?: string) => {
    const patient = patients.find(p => p.id === patientId) || selectedPatient;
    const rx = prescriptionId
      ? prescriptions.find(p => p.id === prescriptionId)
      : prescriptions.find(p => p.patientId === patientId);

    const origin = window.location.origin + window.location.pathname;
    const shareableUrl = `${origin}?view=prescription&pt=${patientId}${rx?.id ? `&rx=${rx.id}` : ''}`;

    const messageText = `Hello ${patient ? patient.name : 'Patient'}, your official digital prescription from ${CLINIC_CONFIG.doctorName} (${CLINIC_CONFIG.appName}) is ready.\n\n📄 View and download your prescription letterhead here:\n👉 ${shareableUrl}\n\n(Only your prescription will open). Please take remedies strictly as advised. Follow-up: ${rx?.followUpDate || 'as scheduled'}.\n\nFor any queries, reply to this WhatsApp message.`;

    const cleanNumber = patient ? patient.mobile.replace(/[^0-9]/g, '') : '';
    const waUrl = `https://wa.me/${cleanNumber}?text=${encodeURIComponent(messageText)}`;

    return {
      link: shareableUrl,
      messageText,
      waUrl
    };
  };

  const generateWhatsAppBillingLink = (patientId: string, invoiceId?: string) => {
    const patient = patients.find(p => p.id === patientId) || selectedPatient;
    const inv = invoiceId
      ? invoices.find(i => i.id === invoiceId)
      : invoices.find(i => i.patientId === patientId);

    const origin = window.location.origin + window.location.pathname;
    const shareableUrl = `${origin}?view=billing&pt=${patientId}${inv?.id ? `&inv=${inv.id}` : ''}`;

    const total = inv ? (inv.totalAmount || inv.items.reduce((s, it) => s + it.amount, 0) - (inv.discount || 0)) : 0;
    const invNum = inv?.invoiceNumber || inv?.id || 'Receipt';

    const messageText = `Hello ${patient ? patient.name : 'Patient'}, thank you for visiting ${CLINIC_CONFIG.appName}.\n\n🧾 Here is your official payment receipt #${invNum} for ₹${total} (Status: Paid):\n👉 ${shareableUrl}\n\n(Only your billing receipt will open). You can view, print, or save your receipt.`;

    const cleanNumber = patient ? patient.mobile.replace(/[^0-9]/g, '') : '';
    const waUrl = `https://wa.me/${cleanNumber}?text=${encodeURIComponent(messageText)}`;

    return {
      link: shareableUrl,
      messageText,
      waUrl
    };
  };

  const openRemoteIntakeModal = (patientId: string, system: ClinicalSystemKey) => {
    setRemoteIntakeModal({ isOpen: true, patientId, system });
  };

  const closeRemoteIntakeModal = () => {
    setRemoteIntakeModal(null);
  };

  const openWhatsAppShareDialog = (patientId: string, system: ClinicalSystemKey) => {
    const patient = patients.find(p => p.id === patientId) || selectedPatient;
    const { link, messageText } = generateWhatsAppLink(patientId, system);
    setWhatsAppShareDialog({
      isOpen: true,
      type: 'intake',
      patientId,
      system,
      phone: patient ? patient.mobile : '',
      link,
      messageText,
      title: 'WhatsApp Remote Case Taking Link',
      subtitle: `Remote symptom intake form for ${patient?.name || 'Patient'} (${system.replace('_', ' ')})`
    });
  };

  const openWhatsAppPrescriptionShareDialog = (patientId: string, prescriptionId?: string) => {
    const patient = patients.find(p => p.id === patientId) || selectedPatient;
    const { link, messageText } = generateWhatsAppPrescriptionLink(patientId, prescriptionId);
    setWhatsAppShareDialog({
      isOpen: true,
      type: 'prescription',
      patientId,
      prescriptionId,
      phone: patient ? patient.mobile : '',
      link,
      messageText,
      title: 'WhatsApp Digital Prescription Link',
      subtitle: `Official prescription for ${patient?.name || 'Patient'}`
    });
  };

  const openWhatsAppBillingShareDialog = (patientId: string, invoiceId?: string) => {
    const patient = patients.find(p => p.id === patientId) || selectedPatient;
    const { link, messageText } = generateWhatsAppBillingLink(patientId, invoiceId);
    setWhatsAppShareDialog({
      isOpen: true,
      type: 'billing',
      patientId,
      invoiceId,
      phone: patient ? patient.mobile : '',
      link,
      messageText,
      title: 'WhatsApp Billing Receipt Link',
      subtitle: `Official invoice receipt for ${patient?.name || 'Patient'}`
    });
  };

  const closeWhatsAppShareDialog = () => {
    setWhatsAppShareDialog(null);
  };

  const submitRemoteIntake = (patientId: string, system: ClinicalSystemKey, payload: any) => {
    // Save as remote submitted form
    saveSystemForm({
      patientId,
      system,
      data: payload.data || {},
      chiefComplaints: payload.chiefComplaints || '',
      duration: payload.duration || 'Reported via remote intake',
      severity: payload.severity || 'Moderate',
      modalitiesAggravation: payload.modalitiesAggravation || '',
      modalitiesAmelioration: payload.modalitiesAmelioration || '',
      concomitants: payload.concomitants || '',
      clinicalNotes: payload.clinicalNotes || 'Self-reported by patient remotely via WhatsApp form link.',
      submittedVia: 'WhatsApp_Remote_Intake'
    });

    // Post update into WhatsApp inbox for this patient!
    const targetConv = conversations.find(c => c.patientId === patientId);
    if (targetConv) {
      const nowStr = 'Just now';
      const patientMsg: WhatsAppMessage = {
        id: `msg-resp-${Date.now()}`,
        sender: 'patient',
        text: `✅ Doctor, I have completed and submitted my ${system.replace('_', ' ').toUpperCase()} case form!`,
        timestamp: nowStr
      };

      setConversations(prev =>
        prev.map(c => {
          if (c.id === targetConv.id) {
            return {
              ...c,
              lastMessage: patientMsg.text,
              lastMessageTime: nowStr,
              unreadCount: c.unreadCount + 1,
              category: 'Pending',
              messages: [...c.messages, patientMsg]
            };
          }
          return c;
        })
      );
    }
  };

  const sendWhatsAppMessage = (
    convId: string,
    text: string,
    linkData?: WhatsAppMessage['linkData']
  ) => {
    const newMsg: WhatsAppMessage = {
      id: `msg-${Date.now()}`,
      sender: 'doctor',
      text,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      status: 'sent',
      linkData
    };

    setConversations(prev =>
      prev.map(conv => {
        if (conv.id === convId) {
          return {
            ...conv,
            lastMessage: text,
            lastMessageTime: 'Just now',
            messages: [...conv.messages, newMsg]
          };
        }
        return conv;
      })
    );
  };

  const updateConversationStatus = (convId: string, status: WhatsAppConversation['status']) => {
    setConversations(prev =>
      prev.map(c => (c.id === convId ? { ...c, status } : c))
    );
  };

  const markConversationAsRead = (convId: string) => {
    setConversations(prev =>
      prev.map(c => (c.id === convId ? { ...c, unreadCount: 0 } : c))
    );
  };

  const saveInvoice = (invoiceData: Omit<BillingInvoice, 'id'>): BillingInvoice => {
    const newInvoice: BillingInvoice = {
      ...invoiceData,
      id: `INV-${Date.now().toString(36).toUpperCase()}`
    };
    setInvoices(prev => [newInvoice, ...prev]);
    syncInvoiceToFirestore(newInvoice).catch(err => console.warn('Firestore sync notice:', err));
    return newInvoice;
  };

  const resetDatabase = () => {
    setPatients(INITIAL_PATIENTS);
    setSelectedPatientId(INITIAL_PATIENTS[0].id);
    setSystemForms(INITIAL_SYSTEM_FORMS);
    setPrescriptions(INITIAL_PRESCRIPTIONS);
    setFollowUps(INITIAL_FOLLOW_UPS);
    setAppointments(INITIAL_APPOINTMENTS);
    setConversations(INITIAL_CONVERSATIONS);
    setInvoices(INITIAL_INVOICES);
    localStorage.clear();
  };

  return (
    <ClinicContext.Provider
      value={{
        patients,
        selectedPatientId,
        selectedPatient,
        systemForms,
        prescriptions,
        followUps,
        appointments,
        conversations,
        invoices,
        firestoreStatus,
        syncAllToCloud,
        activeTab,
        setActiveTab,
        activeSystemFormKey,
        setActiveSystemFormKey,
        remoteIntakeModal,
        openRemoteIntakeModal,
        closeRemoteIntakeModal,
        whatsAppShareDialog,
        openWhatsAppShareDialog,
        openWhatsAppPrescriptionShareDialog,
        openWhatsAppBillingShareDialog,
        closeWhatsAppShareDialog,
        selectPatient,
        createPatient,
        updatePatient,
        saveSystemForm,
        savePrescription,
        saveFollowUp,
        addAppointment,
        updateAppointmentStatus,
        sendWhatsAppMessage,
        updateConversationStatus,
        markConversationAsRead,
        generateWhatsAppLink,
        generateWhatsAppPrescriptionLink,
        generateWhatsAppBillingLink,
        submitRemoteIntake,
        saveInvoice,
        currentUser,
        doctorUsers,
        login,
        logout,
        updateDoctorProfile,
        createDoctorUser,
        deleteDoctorUser,
        resetDoctorPassword,
        updatePatientVitals,
        resetDatabase
      }}
    >
      {children}
    </ClinicContext.Provider>
  );
};

export const useClinic = (): ClinicContextType => {
  const context = useContext(ClinicContext);
  if (!context) {
    throw new Error('useClinic must be used within a ClinicProvider');
  }
  return context;
};
