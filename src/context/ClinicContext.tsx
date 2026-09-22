import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  Patient,
  SystemFormRecord,
  Prescription,
  FollowUpRecord,
  Appointment,
  WhatsAppConversation,
  BillingInvoice,
  ClinicalSystemKey,
  WhatsAppMessage
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
  whatsAppShareDialog: { isOpen: boolean; patientId: string; system: ClinicalSystemKey; phone: string; link: string; messageText: string } | null;
  openWhatsAppShareDialog: (patientId: string, system: ClinicalSystemKey) => void;
  closeWhatsAppShareDialog: () => void;

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
  generateWhatsAppLink: (patientId: string, system: ClinicalSystemKey) => { link: string; messageText: string; waUrl: string };
  submitRemoteIntake: (patientId: string, system: ClinicalSystemKey, payload: any) => void;

  // Billing
  saveInvoice: (invoice: Omit<BillingInvoice, 'id'>) => BillingInvoice;
  
  // Reset
  resetDatabase: () => void;
}

const ClinicContext = createContext<ClinicContextType | undefined>(undefined);

const LOCAL_STORAGE_KEY = 'clinicapro_master_data_v1';

export const ClinicProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Load from localStorage or seed
  const [patients, setPatients] = useState<Patient[]>(() => {
    try {
      const stored = localStorage.getItem(`${LOCAL_STORAGE_KEY}_patients`);
      return stored ? JSON.parse(stored) : INITIAL_PATIENTS;
    } catch {
      return INITIAL_PATIENTS;
    }
  });

  const [selectedPatientId, setSelectedPatientId] = useState<string | null>(() => {
    return patients.length > 0 ? patients[0].id : null;
  });

  const [systemForms, setSystemForms] = useState<SystemFormRecord[]>(() => {
    try {
      const stored = localStorage.getItem(`${LOCAL_STORAGE_KEY}_system_forms`);
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
      return INITIAL_SYSTEM_FORMS;
    } catch {
      return INITIAL_SYSTEM_FORMS;
    }
  });

  const [prescriptions, setPrescriptions] = useState<Prescription[]>(() => {
    try {
      const stored = localStorage.getItem(`${LOCAL_STORAGE_KEY}_prescriptions`);
      return stored ? JSON.parse(stored) : INITIAL_PRESCRIPTIONS;
    } catch {
      return INITIAL_PRESCRIPTIONS;
    }
  });

  const [followUps, setFollowUps] = useState<FollowUpRecord[]>(() => {
    try {
      const stored = localStorage.getItem(`${LOCAL_STORAGE_KEY}_follow_ups`);
      return stored ? JSON.parse(stored) : INITIAL_FOLLOW_UPS;
    } catch {
      return INITIAL_FOLLOW_UPS;
    }
  });

  const [appointments, setAppointments] = useState<Appointment[]>(() => {
    try {
      const stored = localStorage.getItem(`${LOCAL_STORAGE_KEY}_appointments`);
      return stored ? JSON.parse(stored) : INITIAL_APPOINTMENTS;
    } catch {
      return INITIAL_APPOINTMENTS;
    }
  });

  const [conversations, setConversations] = useState<WhatsAppConversation[]>(() => {
    try {
      const stored = localStorage.getItem(`${LOCAL_STORAGE_KEY}_conversations`);
      return stored ? JSON.parse(stored) : INITIAL_CONVERSATIONS;
    } catch {
      return INITIAL_CONVERSATIONS;
    }
  });

  const [invoices, setInvoices] = useState<BillingInvoice[]>(() => {
    try {
      const stored = localStorage.getItem(`${LOCAL_STORAGE_KEY}_invoices`);
      return stored ? JSON.parse(stored) : INITIAL_INVOICES;
    } catch {
      return INITIAL_INVOICES;
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

  const [whatsAppShareDialog, setWhatsAppShareDialog] = useState<{
    isOpen: boolean;
    patientId: string;
    system: ClinicalSystemKey;
    phone: string;
    link: string;
    messageText: string;
  } | null>(null);

  // Sync to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(`${LOCAL_STORAGE_KEY}_patients`, JSON.stringify(patients));
    } catch (e) {
      console.warn('LocalStorage error:', e);
    }
  }, [patients]);

  useEffect(() => {
    try {
      localStorage.setItem(`${LOCAL_STORAGE_KEY}_system_forms`, JSON.stringify(systemForms));
    } catch (e) {
      console.warn('LocalStorage error:', e);
    }
  }, [systemForms]);

  useEffect(() => {
    try {
      localStorage.setItem(`${LOCAL_STORAGE_KEY}_prescriptions`, JSON.stringify(prescriptions));
    } catch (e) {
      console.warn('LocalStorage error:', e);
    }
  }, [prescriptions]);

  useEffect(() => {
    try {
      localStorage.setItem(`${LOCAL_STORAGE_KEY}_follow_ups`, JSON.stringify(followUps));
    } catch (e) {
      console.warn('LocalStorage error:', e);
    }
  }, [followUps]);

  useEffect(() => {
    try {
      localStorage.setItem(`${LOCAL_STORAGE_KEY}_appointments`, JSON.stringify(appointments));
    } catch (e) {
      console.warn('LocalStorage error:', e);
    }
  }, [appointments]);

  useEffect(() => {
    try {
      localStorage.setItem(`${LOCAL_STORAGE_KEY}_conversations`, JSON.stringify(conversations));
    } catch (e) {
      console.warn('LocalStorage error:', e);
    }
  }, [conversations]);

  useEffect(() => {
    try {
      localStorage.setItem(`${LOCAL_STORAGE_KEY}_invoices`, JSON.stringify(invoices));
    } catch (e) {
      console.warn('LocalStorage error:', e);
    }
  }, [invoices]);

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
    const currentUrl = window.location.origin;
    const shareableUrl = `${currentUrl}/?intake=${patientId}&system=${system}`;
    
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
      other_mind_generals: 'Mind, Generals & Thermals'
    };

    const sysName = systemNames[system] || system;
    const messageText = `Hello ${patient ? patient.name : 'Patient'}, ${CLINIC_CONFIG.doctorName} at ${CLINIC_CONFIG.appName} has sent you your specialized Clinical Case Taking Form for *${sysName}*.\n\nPlease open this secure link on your phone to enter your symptoms before consultation:\n👉 ${shareableUrl}\n\nOnce submitted, Dr. Bharat Chougule will immediately review your case summary and prepare your repertorisation and prescription.`;

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
    const patient = patients.find(p => p.id === patientId);
    const { link, messageText } = generateWhatsAppLink(patientId, system);
    setWhatsAppShareDialog({
      isOpen: true,
      patientId,
      system,
      phone: patient ? patient.mobile : '',
      link,
      messageText
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
        submitRemoteIntake,
        saveInvoice,
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
