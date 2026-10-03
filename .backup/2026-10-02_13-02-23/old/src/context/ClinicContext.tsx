import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useRef,
  useCallback,
  useMemo
} from 'react';
import type { Session, RealtimeChannel } from '@supabase/supabase-js';
import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { profileService, type ProfileRow } from '../lib/services/profiles';
import { patientService, type PatientRow } from '../lib/services/patients';
import {
  prescriptionService,
  type PrescriptionWithMedicines,
  type HomeoMedicineInput,
  type AlloMedicineInput
} from '../lib/services/prescriptions';
import { appointmentService, type AppointmentRow } from '../lib/services/appointments';
import { followUpService, type FollowUpRow } from '../lib/services/followUps';
import { invoiceService, type InvoiceWithItems } from '../lib/services/invoices';
import { systemFormService, type SystemFormRow } from '../lib/services/systemForms';
import { whatsappService, type ConversationWithMessages } from '../lib/services/whatsapp';
import { clinicSettingsService, type ClinicSettingsRow } from '../lib/services/clinicSettings';
import { shareTokenService } from '../lib/services/shareTokens';
import { clinicalSystemService } from '../lib/services/clinicalSystems';
import { CLINIC_CONFIG, applyClinicConfig } from '../config/clinicConfig';
import { ServiceError } from '../lib/services/base';
import type {
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
  DoctorUser,
  HomeoMedicine,
  AlloMedicine
} from '../types';

// ==========================================================================
// MAPPERS (Supabase row -> domain type)
// ==========================================================================

const mapPatient = (row: PatientRow): Patient => ({
  id: row.id,
  patientCode: row.patient_code ?? undefined,
  abhaId: row.abha_id ?? undefined,
  abhaAddress: row.abha_address ?? undefined,
  name: row.name,
  age: row.age ?? 0,
  gender: (row.gender ?? 'Other') as Patient['gender'],
  dob: row.dob ?? undefined,
  mobile: row.mobile ?? '',
  email: row.email ?? undefined,
  bloodGroup: row.blood_group ?? undefined,
  address: row.address ?? '',
  occupation: row.occupation ?? undefined,
  emergencyContact: row.emergency_contact ?? undefined,
  vitals: {
    bpSystolic: row.bp_systolic ?? 120,
    bpDiastolic: row.bp_diastolic ?? 80,
    pulse: row.pulse ?? 72,
    temperature: row.temperature ?? 98.6,
    spo2: row.spo2 ?? 99,
    weight: row.weight ?? 0,
    height: row.height_inches ?? 0,
    heightInch: row.height_inches ?? 0,
    heightInches: row.height_inches ?? 0,
    bmi: row.bmi ?? undefined,
    rbs: row.rbs ?? 0,
    respiratoryRate: row.respiratory_rate ?? undefined
  },
  allergies: row.allergies ?? [],
  chronicDiseases: row.chronic_diseases ?? [],
  createdAt: row.created_at,
  updatedAt: row.updated_at
});

const mapSystemForm = (row: SystemFormRow): SystemFormRecord => ({
  id: row.id,
  patientId: row.patient_id,
  system: row.system_key as ClinicalSystemKey,
  updatedAt: row.updated_at,
  submittedVia: row.submitted_via,
  data: (row.data as Record<string, unknown>) ?? {},
  chiefComplaints: row.chief_complaints ?? '',
  duration: row.duration ?? '',
  severity: (row.severity ?? 'Moderate') as SystemFormRecord['severity'],
  modalitiesAggravation: row.modalities_aggravation ?? '',
  modalitiesAmelioration: row.modalities_amelioration ?? '',
  concomitants: row.concomitants ?? '',
  clinicalNotes: row.clinical_notes ?? ''
});

const mapPrescription = (row: PrescriptionWithMedicines): Prescription => ({
  id: row.id,
  patientId: row.patient_id,
  consultationDate: row.consultation_date,
  diagnosis: row.diagnosis ?? '',
  clinicalNotes: row.clinical_notes ?? '',
  homeoMedicines: (row.prescription_homeo_medicines ?? [])
    .sort((a, b) => a.display_order - b.display_order)
    .map<HomeoMedicine>(m => ({
      id: m.id,
      remedy: m.remedy,
      potency: m.potency,
      form: m.form,
      dosage: m.dosage ?? '',
      frequency: m.frequency,
      duration: m.duration ?? '',
      instructions: m.instructions ?? ''
    })),
  alloMedicines: (row.prescription_allo_medicines ?? [])
    .sort((a, b) => a.display_order - b.display_order)
    .map<AlloMedicine>(m => ({
      id: m.id,
      name: m.name,
      type: m.type,
      strength: m.strength ?? '',
      frequency: m.frequency,
      timing: m.timing,
      duration: m.duration ?? '',
      instructions: m.instructions ?? undefined
    })),
  dietaryAdvise: row.dietary_advice ?? [],
  investigationsOrdered: row.investigations_ordered ?? [],
  followUpDate: row.follow_up_date ?? '',
  doctorName: CLINIC_CONFIG.doctorName,
  doctorDegree: CLINIC_CONFIG.qualifications,
  doctorRegNo: CLINIC_CONFIG.regNo,
  clinicName: CLINIC_CONFIG.appName,
  clinicAddress: CLINIC_CONFIG.address,
  clinicPhone: CLINIC_CONFIG.phone
});

const mapFollowUp = (row: FollowUpRow): FollowUpRecord => ({
  id: row.id,
  patientId: row.patient_id,
  date: row.date,
  response: row.response,
  subjectiveFeedback: row.subjective_feedback ?? '',
  vitalsCheck: (row.vitals_check as Partial<PatientVitals>) ?? {},
  remedyActionAssessment: row.remedy_action_assessment ?? '',
  prescriptionAdjustment: row.prescription_adjustment ?? '',
  nextFollowUpDate: row.next_follow_up_date ?? ''
});

const mapAppointment = (row: AppointmentRow, patient?: Patient): Appointment => ({
  id: row.id,
  patientId: row.patient_id,
  patientName: patient?.name ?? 'Patient',
  patientMobile: patient?.mobile ?? '',
  date: row.appointment_date,
  timeSlot: row.time_slot,
  type: row.type,
  status: row.status,
  notes: row.notes ?? undefined
});

const mapInvoice = (row: InvoiceWithItems): BillingInvoice => ({
  id: row.id,
  invoiceNumber: row.invoice_number,
  patientId: row.patient_id,
  patientName: '',
  date: row.invoice_date,
  items: (row.invoice_items ?? [])
    .sort((a, b) => a.display_order - b.display_order)
    .map(it => ({ description: it.description, amount: it.amount })),
  consultationFee: row.consultation_fee,
  medicineCharges: row.medicine_charges,
  discount: row.discount,
  totalAmount: row.total_amount,
  paymentMode: row.payment_mode,
  status: row.status
});

const mapConversation = (row: ConversationWithMessages): WhatsAppConversation => ({
  id: row.id,
  patientId: row.patient_id ?? undefined,
  patientName: row.patient_name ?? 'Patient',
  phone: row.phone ?? '',
  category: row.category as WhatsAppConversation['category'],
  unreadCount: row.unread_count,
  lastMessage: row.last_message ?? '',
  lastMessageTime: formatRelativeTime(row.last_message_time),
  status: row.status,
  messages: (row.messages ?? []).map<WhatsAppMessage>(m => ({
    id: m.id,
    sender: m.sender,
    text: m.text,
    timestamp: formatTime(m.created_at),
    status: (m.status as WhatsAppMessage['status']) ?? undefined,
    linkData: (m.link_data as WhatsAppMessage['linkData']) ?? undefined
  }))
});

const mapProfileToDoctorUser = (p: ProfileRow): DoctorUser => ({
  id: p.id,
  email: p.email,
  name: p.name,
  qualifications: p.qualifications ?? '',
  regNo: p.reg_no ?? '',
  speciality: p.speciality ?? '',
  clinicName: p.clinic_name ?? '',
  address: p.address ?? '',
  city: p.city ?? '',
  pinCode: p.pin_code ?? '',
  phone: p.phone ?? '',
  role: p.role,
  createdAt: p.created_at,
  consultationFee: p.consultation_fee ?? undefined
});

function formatTime(iso: string): string {
  try {
    return new Date(iso).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  } catch {
    return '';
  }
}

function formatRelativeTime(iso: string): string {
  try {
    const d = new Date(iso);
    const today = new Date();
    if (d.toDateString() === today.toDateString()) return formatTime(iso);
    return d.toLocaleDateString('en-IN', { day: '2-digit', month: 'short' });
  } catch {
    return '';
  }
}

// ==========================================================================
// CONTEXT SHAPE
// ==========================================================================

export interface RemoteIntakeModalState {
  isOpen: boolean;
  patientId: string;
  system: ClinicalSystemKey;
}

export interface ClinicContextType {
  // Auth / Doctor
  currentUser: DoctorUser | null;
  doctorUsers: DoctorUser[];
  authLoading: boolean;
  isAuthenticated: boolean;
  isSupabaseReady: boolean;
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  signup: (email: string, password: string, name: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => Promise<void>;
  updateDoctorProfile: (updates: Partial<DoctorUser>) => Promise<void>;
  createDoctorUser: (
    data: Omit<DoctorUser, 'id' | 'createdAt'>,
    password: string
  ) => Promise<{ success: boolean; error?: string }>;
  deleteDoctorUser: (id: string) => Promise<void>;

  // Patient
  patients: Patient[];
  selectedPatientId: string | null;
  selectedPatient: Patient | undefined;
  selectPatient: (id: string) => void;
  createPatient: (
    data: Omit<Patient, 'id' | 'createdAt' | 'updatedAt' | 'patientCode'>
  ) => Promise<Patient>;
  updatePatient: (id: string, updates: Partial<Patient>) => Promise<void>;
  updatePatientVitals: (
    patientId: string,
    vitals: Partial<PatientVitals>,
    newAge?: number
  ) => Promise<void>;

  // System Forms
  systemForms: SystemFormRecord[];
  saveSystemForm: (data: {
    patientId: string;
    system: ClinicalSystemKey;
    data: Record<string, unknown>;
    chiefComplaints: string;
    duration: string;
    severity: 'Mild' | 'Moderate' | 'Severe';
    modalitiesAggravation: string;
    modalitiesAmelioration: string;
    concomitants: string;
    clinicalNotes: string;
    submittedVia?: 'Doctor_Dashboard' | 'WhatsApp_Remote_Intake' | 'Patient_Portal';
  }) => Promise<SystemFormRecord>;

  // Prescriptions
  prescriptions: Prescription[];
  savePrescription: (rx: Omit<Prescription, 'id'> & { id?: string }) => Promise<Prescription>;

  // Follow-ups
  followUps: FollowUpRecord[];
  saveFollowUp: (fu: Omit<FollowUpRecord, 'id'>) => Promise<FollowUpRecord>;

  // Appointments
  appointments: Appointment[];
  addAppointment: (apt: Omit<Appointment, 'id'>) => Promise<void>;
  updateAppointmentStatus: (id: string, status: Appointment['status']) => Promise<void>;

  // Billing
  invoices: BillingInvoice[];
  saveInvoice: (inv: Omit<BillingInvoice, 'id'>) => Promise<BillingInvoice>;

  // WhatsApp-style conversations
  conversations: WhatsAppConversation[];
  sendWhatsAppMessage: (
    convId: string,
    text: string,
    linkData?: WhatsAppMessage['linkData']
  ) => Promise<void>;
  updateConversationStatus: (
    convId: string,
    status: WhatsAppConversation['status']
  ) => Promise<void>;
  markConversationAsRead: (convId: string) => Promise<void>;

  // Remote intake
  remoteIntakeModal: RemoteIntakeModalState | null;
  openRemoteIntakeModal: (patientId: string, system: ClinicalSystemKey) => void;
  closeRemoteIntakeModal: () => void;
  submitRemoteIntake: (
    token: string,
    patientId: string,
    system: ClinicalSystemKey,
    payload: {
      data: Record<string, unknown>;
      chiefComplaints: string;
      duration: string;
      severity: 'Mild' | 'Moderate' | 'Severe';
      modalitiesAggravation: string;
      modalitiesAmelioration: string;
      concomitants: string;
      clinicalNotes: string;
    }
  ) => Promise<void>;

  // WhatsApp share
  whatsAppShareDialog: WhatsAppShareDialogData | null;
  openWhatsAppShareDialog: (patientId: string, system: ClinicalSystemKey) => Promise<void>;
  openWhatsAppPrescriptionShareDialog: (
    patientId: string,
    prescriptionId?: string
  ) => Promise<void>;
  openWhatsAppBillingShareDialog: (patientId: string, invoiceId?: string) => Promise<void>;
  closeWhatsAppShareDialog: () => void;
  generateWhatsAppLink: (
    patientId: string,
    system: ClinicalSystemKey
  ) => Promise<{ link: string; messageText: string; waUrl: string }>;
  generateWhatsAppPrescriptionLink: (
    patientId: string,
    prescriptionId?: string
  ) => Promise<{ link: string; messageText: string; waUrl: string }>;
  generateWhatsAppBillingLink: (
    patientId: string,
    invoiceId?: string
  ) => Promise<{ link: string; messageText: string; waUrl: string }>;

  // Navigation
  activeTab: string;
  setActiveTab: (tab: string) => void;
  activeSystemFormKey: ClinicalSystemKey;
  setActiveSystemFormKey: (k: ClinicalSystemKey) => void;

  // Supabase status modal
  isSupabaseModalOpen: boolean;
  openSupabaseModal: () => void;
  closeSupabaseModal: () => void;

  // Clinic settings (reload helper)
  refreshClinicSettings: () => Promise<void>;

  // Reset
  resetDatabase: () => Promise<void>;
}

const ClinicContext = createContext<ClinicContextType | undefined>(undefined);

// ==========================================================================
// PROVIDER
// ==========================================================================

export const ClinicProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Auth
  const [session, setSession] = useState<Session | null>(null);
  const [currentUser, setCurrentUser] = useState<DoctorUser | null>(null);
  const [doctorUsers, setDoctorUsers] = useState<DoctorUser[]>([]);
  const [authLoading, setAuthLoading] = useState(true);

  // Data
  const [patients, setPatients] = useState<Patient[]>([]);
  const [selectedPatientId, setSelectedPatientId] = useState<string | null>(null);
  const [systemForms, setSystemForms] = useState<SystemFormRecord[]>([]);
  const [prescriptions, setPrescriptions] = useState<Prescription[]>([]);
  const [followUps, setFollowUps] = useState<FollowUpRecord[]>([]);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [conversations, setConversations] = useState<WhatsAppConversation[]>([]);
  const [invoices, setInvoices] = useState<BillingInvoice[]>([]);

  // UI
  const [activeTab, setActiveTab] = useState<string>('dashboard');
  const [activeSystemFormKey, setActiveSystemFormKey] = useState<ClinicalSystemKey>('headache');
  const [remoteIntakeModal, setRemoteIntakeModal] = useState<RemoteIntakeModalState | null>(null);
  const [whatsAppShareDialog, setWhatsAppShareDialog] = useState<WhatsAppShareDialogData | null>(null);
  const [isSupabaseModalOpen, setIsSupabaseModalOpen] = useState(false);

  const channelsRef = useRef<RealtimeChannel[]>([]);
  const lastSettingsRef = useRef<ClinicSettingsRow | null>(null);

  const isAuthenticated = Boolean(currentUser);
  const doctorId = currentUser?.id ?? null;

  // ------------------------------------------------------------------
  // Apply clinic config + profile values to CLINIC_CONFIG
  // ------------------------------------------------------------------
  const applyProfileAndClinicToConfig = useCallback(
    (profile: DoctorUser | null, settings: ClinicSettingsRow | null) => {
      if (profile) {
        applyClinicConfig({
          doctorName: profile.name || CLINIC_CONFIG.doctorName,
          qualifications: profile.qualifications || CLINIC_CONFIG.qualifications,
          regNo: profile.regNo || CLINIC_CONFIG.regNo,
          phone: profile.phone || CLINIC_CONFIG.phone,
          email: profile.email || CLINIC_CONFIG.email,
          address: profile.address || CLINIC_CONFIG.address,
          city: profile.city || CLINIC_CONFIG.city,
          pinCode: profile.pinCode || CLINIC_CONFIG.pinCode,
          appName: profile.clinicName || CLINIC_CONFIG.appName,
          consultationFee: profile.consultationFee ?? CLINIC_CONFIG.consultationFee
        });
      }
      if (settings) {
        applyClinicConfig({
          appName: settings.clinic_name || CLINIC_CONFIG.appName,
          doctorName: settings.doctor_name || CLINIC_CONFIG.doctorName,
          qualifications: settings.qualifications || CLINIC_CONFIG.qualifications,
          regNo: settings.reg_no || CLINIC_CONFIG.regNo,
          address: settings.address || CLINIC_CONFIG.address,
          city: settings.city || CLINIC_CONFIG.city,
          pinCode: settings.pin_code || CLINIC_CONFIG.pinCode,
          phone: settings.phone || CLINIC_CONFIG.phone,
          email: settings.email || CLINIC_CONFIG.email,
          consultationFee: settings.consultation_fee ?? CLINIC_CONFIG.consultationFee
        });
      }
    },
    []
  );

  const refreshClinicSettings = useCallback(async () => {
    try {
      const settings = await clinicSettingsService.get();
      lastSettingsRef.current = settings;
      applyProfileAndClinicToConfig(currentUser, settings);
    } catch (err) {
      console.warn('[ClinicContext] clinic settings load failed', err);
    }
  }, [currentUser, applyProfileAndClinicToConfig]);

  // ------------------------------------------------------------------
  // Load doctors list (owner sees all)
  // ------------------------------------------------------------------
  const loadDoctorUsers = useCallback(async (profile: DoctorUser | null) => {
    if (!profile) {
      setDoctorUsers([]);
      return;
    }
    try {
      const list = await profileService.listDoctors(profile.id);
      setDoctorUsers(list.map(mapProfileToDoctorUser));
    } catch (err) {
      console.warn('[ClinicContext] loadDoctorUsers failed', err);
      setDoctorUsers([profile]);
    }
  }, []);

  // ------------------------------------------------------------------
  // Data loaders
  // ------------------------------------------------------------------
  const reloadPatients = useCallback(async () => {
    if (!doctorId) return;
    try {
      const rows = await patientService.list(doctorId);
      const mapped = rows.map(mapPatient);
      setPatients(mapped);
      setSelectedPatientId(prev => {
        if (prev && mapped.some(p => p.id === prev)) return prev;
        return mapped[0]?.id ?? null;
      });
    } catch (err) {
      console.warn('[ClinicContext] reloadPatients', err);
    }
  }, [doctorId]);

  const reloadSystemForms = useCallback(async () => {
    if (!doctorId) return;
    try {
      const rows = await systemFormService.list(doctorId);
      setSystemForms(rows.map(mapSystemForm));
    } catch (err) {
      console.warn('[ClinicContext] reloadSystemForms', err);
    }
  }, [doctorId]);

  const reloadPrescriptions = useCallback(async () => {
    if (!doctorId) return;
    try {
      const rows = await prescriptionService.list(doctorId);
      setPrescriptions(rows.map(mapPrescription));
    } catch (err) {
      console.warn('[ClinicContext] reloadPrescriptions', err);
    }
  }, [doctorId]);

  const reloadFollowUps = useCallback(async () => {
    if (!doctorId) return;
    try {
      const rows = await followUpService.list(doctorId);
      setFollowUps(rows.map(mapFollowUp));
    } catch (err) {
      console.warn('[ClinicContext] reloadFollowUps', err);
    }
  }, [doctorId]);

  const reloadAppointments = useCallback(
    async (patientLookup?: Patient[]) => {
      if (!doctorId) return;
      try {
        const rows = await appointmentService.list(doctorId);
        const lookup = patientLookup ?? patients;
        const lookupMap = new Map(lookup.map(p => [p.id, p]));
        setAppointments(rows.map(r => mapAppointment(r, lookupMap.get(r.patient_id))));
      } catch (err) {
        console.warn('[ClinicContext] reloadAppointments', err);
      }
    },
    [doctorId, patients]
  );

  const reloadInvoices = useCallback(
    async (patientLookup?: Patient[]) => {
      if (!doctorId) return;
      try {
        const rows = await invoiceService.list(doctorId);
        const lookup = patientLookup ?? patients;
        const lookupMap = new Map(lookup.map(p => [p.id, p]));
        setInvoices(
          rows.map(r => {
            const inv = mapInvoice(r);
            const p = lookupMap.get(r.patient_id);
            return { ...inv, patientName: p?.name ?? 'Patient' };
          })
        );
      } catch (err) {
        console.warn('[ClinicContext] reloadInvoices', err);
      }
    },
    [doctorId, patients]
  );

  const reloadConversations = useCallback(async () => {
    if (!doctorId) return;
    try {
      const rows = await whatsappService.listConversations(doctorId);
      setConversations(rows.map(mapConversation));
    } catch (err) {
      console.warn('[ClinicContext] reloadConversations', err);
    }
  }, [doctorId]);

  // ------------------------------------------------------------------
  // Initial auth + data load
  // ------------------------------------------------------------------
  useEffect(() => {
    if (!isSupabaseConfigured) {
      setAuthLoading(false);
      return;
    }

    let cancelled = false;

    const bootstrap = async () => {
      try {
        const { data } = await supabase.auth.getSession();
        if (cancelled) return;
        setSession(data.session);

        if (data.session?.user) {
          const profile = await profileService.getCurrent();
          if (cancelled) return;
          if (profile) {
            const mapped = mapProfileToDoctorUser(profile);
            setCurrentUser(mapped);
            await loadDoctorUsers(mapped);
            await refreshClinicSettings();
          }
        }
      } catch (err) {
        console.warn('[ClinicContext] bootstrap error', err);
      } finally {
        if (!cancelled) setAuthLoading(false);
      }
    };

    void bootstrap();

    const { data: sub } = supabase.auth.onAuthStateChange(async (event, newSession) => {
      setSession(newSession);
      if (event === 'SIGNED_OUT' || !newSession) {
        setCurrentUser(null);
        setDoctorUsers([]);
        setPatients([]);
        setSystemForms([]);
        setPrescriptions([]);
        setFollowUps([]);
        setAppointments([]);
        setInvoices([]);
        setConversations([]);
        setSelectedPatientId(null);
        return;
      }
      if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED' || event === 'USER_UPDATED') {
        try {
          const profile = await profileService.getCurrent();
          if (profile) {
            const mapped = mapProfileToDoctorUser(profile);
            setCurrentUser(mapped);
            await loadDoctorUsers(mapped);
            await refreshClinicSettings();
          }
        } catch (err) {
          console.warn('[ClinicContext] auth state profile load failed', err);
        }
      }
    });

    return () => {
      cancelled = true;
      sub.subscription.unsubscribe();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isSupabaseConfigured]);

  // ------------------------------------------------------------------
  // Load data whenever doctorId changes
  // ------------------------------------------------------------------
  useEffect(() => {
    if (!doctorId) return;
    void (async () => {
      await Promise.all([
        reloadPatients(),
        reloadSystemForms(),
        reloadPrescriptions(),
        reloadFollowUps(),
        reloadAppointments(),
        reloadInvoices(),
        reloadConversations()
      ]);
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [doctorId]);

  // ------------------------------------------------------------------
  // Realtime subscriptions
  // ------------------------------------------------------------------
  useEffect(() => {
    if (!doctorId || !isSupabaseConfigured) return;

    const filterStr = `doctor_id=eq.${doctorId}`;

    const setupChannel = (name: string, table: string, handler: () => void) => {
      const ch = supabase
        .channel(`${name}_${doctorId}`)
        .on(
          'postgres_changes',
          { event: '*', schema: 'public', table, filter: filterStr },
          () => {
            handler();
          }
        )
        .subscribe();
      channelsRef.current.push(ch);
    };

    setupChannel('rt_patients', 'patients', () => void reloadPatients());
    setupChannel('rt_system_forms', 'system_forms', () => void reloadSystemForms());
    setupChannel('rt_prescriptions', 'prescriptions', () => void reloadPrescriptions());
    setupChannel('rt_rx_homeo', 'prescription_homeo_medicines', () => void reloadPrescriptions());
    setupChannel('rt_rx_allo', 'prescription_allo_medicines', () => void reloadPrescriptions());
    setupChannel('rt_followups', 'follow_ups', () => void reloadFollowUps());
    setupChannel('rt_appointments', 'appointments', () => void reloadAppointments());
    setupChannel('rt_invoices', 'invoices', () => void reloadInvoices());
    setupChannel('rt_invoice_items', 'invoice_items', () => void reloadInvoices());
    setupChannel('rt_conv', 'whatsapp_conversations', () => void reloadConversations());
    setupChannel('rt_msgs', 'whatsapp_messages', () => void reloadConversations());

    return () => {
      channelsRef.current.forEach(ch => {
        void supabase.removeChannel(ch);
      });
      channelsRef.current = [];
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [doctorId, isSupabaseConfigured]);

  // ------------------------------------------------------------------
  // Auth actions
  // ------------------------------------------------------------------
  const login = useCallback(
    async (email: string, password: string): Promise<{ success: boolean; error?: string }> => {
      if (!isSupabaseConfigured) {
        return { success: false, error: 'Supabase is not configured. Add credentials to .env.' };
      }
      try {
        const { error } = await supabase.auth.signInWithPassword({
          email: email.trim(),
          password
        });
        if (error) {
          return { success: false, error: error.message };
        }
        return { success: true };
      } catch (err) {
        return {
          success: false,
          error: err instanceof ServiceError ? err.message : 'Login failed'
        };
      }
    },
    []
  );

  const signup = useCallback(
    async (
      email: string,
      password: string,
      name: string
    ): Promise<{ success: boolean; error?: string }> => {
      if (!isSupabaseConfigured) {
        return { success: false, error: 'Supabase is not configured. Add credentials to .env.' };
      }
      try {
        const { error } = await supabase.auth.signUp({
          email: email.trim(),
          password,
          options: {
            data: { name: name.trim(), role: 'owner' }
          }
        });
        if (error) return { success: false, error: error.message };
        return { success: true };
      } catch (err) {
        return {
          success: false,
          error: err instanceof ServiceError ? err.message : 'Sign up failed'
        };
      }
    },
    []
  );

  const logout = useCallback(async () => {
    try {
      await supabase.auth.signOut();
    } catch (err) {
      console.warn('[ClinicContext] logout error', err);
    }
  }, []);

  const updateDoctorProfile = useCallback(
    async (updates: Partial<DoctorUser>) => {
      if (!currentUser) return;
      try {
        const updated = await profileService.update(currentUser.id, {
          name: updates.name,
          qualifications: updates.qualifications,
          reg_no: updates.regNo,
          speciality: updates.speciality,
          clinic_name: updates.clinicName,
          address: updates.address,
          city: updates.city,
          pin_code: updates.pinCode,
          phone: updates.phone,
          consultation_fee: updates.consultationFee
        });
        const mapped = mapProfileToDoctorUser(updated);
        setCurrentUser(mapped);
        await loadDoctorUsers(mapped);
        applyProfileAndClinicToConfig(mapped, lastSettingsRef.current);
      } catch (err) {
        console.warn('[ClinicContext] updateDoctorProfile failed', err);
      }
    },
    [currentUser, loadDoctorUsers, applyProfileAndClinicToConfig]
  );

  const createDoctorUser = useCallback(
    async (
      data: Omit<DoctorUser, 'id' | 'createdAt'>,
      password: string
    ): Promise<{ success: boolean; error?: string }> => {
      try {
        const res = await fetch('/api/doctors/create', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ ...data, password })
        });
        if (!res.ok) {
          const body = await res.json().catch(() => ({}));
          return { success: false, error: body?.error || 'Failed to create doctor account' };
        }
        if (currentUser) await loadDoctorUsers(currentUser);
        return { success: true };
      } catch (err) {
        return {
          success: false,
          error: err instanceof Error ? err.message : 'Failed to create doctor account'
        };
      }
    },
    [currentUser, loadDoctorUsers]
  );

  const deleteDoctorUser = useCallback(
    async (id: string) => {
      try {
        const res = await fetch(`/api/doctors/${id}`, { method: 'DELETE' });
        if (!res.ok) {
          console.warn('[ClinicContext] deleteDoctorUser server error');
        }
        if (currentUser) await loadDoctorUsers(currentUser);
      } catch (err) {
        console.warn('[ClinicContext] deleteDoctorUser', err);
      }
    },
    [currentUser, loadDoctorUsers]
  );

  // ------------------------------------------------------------------
  // Patient actions
  // ------------------------------------------------------------------
  const selectPatient = useCallback((id: string) => setSelectedPatientId(id), []);

  const createPatient = useCallback(
    async (
      data: Omit<Patient, 'id' | 'createdAt' | 'updatedAt' | 'patientCode'>
    ): Promise<Patient> => {
      if (!doctorId) throw new ServiceError('Not authenticated');
      const row = await patientService.create(doctorId, {
        name: data.name,
        age: data.age,
        gender: data.gender,
        mobile: data.mobile,
        address: data.address,
        abhaId: data.abhaId,
        abhaAddress: data.abhaAddress,
        dob: data.dob,
        email: data.email,
        bloodGroup: data.bloodGroup,
        occupation: data.occupation,
        emergencyContact: data.emergencyContact,
        bpSystolic: data.vitals?.bpSystolic,
        bpDiastolic: data.vitals?.bpDiastolic,
        pulse: data.vitals?.pulse,
        temperature: data.vitals?.temperature,
        spo2: data.vitals?.spo2,
        weight: data.vitals?.weight,
        heightInches: data.vitals?.heightInches ?? data.vitals?.height,
        bmi: data.vitals?.bmi,
        rbs: data.vitals?.rbs,
        respiratoryRate: data.vitals?.respiratoryRate,
        allergies: data.allergies,
        chronicDiseases: data.chronicDiseases
      });
      const mapped = mapPatient(row);
      setPatients(prev => [mapped, ...prev]);
      setSelectedPatientId(mapped.id);

      // Auto-create conversation
      try {
        const conv = await whatsappService.createConversation(doctorId, {
          patientId: mapped.id,
          patientName: mapped.name,
          phone: mapped.mobile,
          category: 'Patients',
          lastMessage: `Patient registered at ${CLINIC_CONFIG.appName}.`
        });
        // Auto-welcome message
        await whatsappService.sendMessage(
          doctorId,
          conv.id,
          `Welcome ${mapped.name} to ${CLINIC_CONFIG.appName}.`
        );
        void reloadConversations();
      } catch (err) {
        console.warn('[ClinicContext] auto-conversation failed', err);
      }

      return mapped;
    },
    [doctorId, reloadConversations]
  );

  const updatePatient = useCallback(
    async (id: string, updates: Partial<Patient>) => {
      if (!doctorId) return;
      const row = await patientService.update(id, doctorId, {
        name: updates.name,
        age: updates.age ?? undefined,
        gender: updates.gender,
        mobile: updates.mobile,
        address: updates.address,
        abha_id: updates.abhaId,
        abha_address: updates.abhaAddress,
        dob: updates.dob,
        email: updates.email,
        blood_group: updates.bloodGroup,
        occupation: updates.occupation,
        emergency_contact: updates.emergencyContact,
        bp_systolic: updates.vitals?.bpSystolic,
        bp_diastolic: updates.vitals?.bpDiastolic,
        pulse: updates.vitals?.pulse,
        temperature: updates.vitals?.temperature,
        spo2: updates.vitals?.spo2,
        weight: updates.vitals?.weight,
        height_inches: updates.vitals?.heightInches ?? updates.vitals?.height,
        bmi: updates.vitals?.bmi,
        rbs: updates.vitals?.rbs,
        respiratory_rate: updates.vitals?.respiratoryRate,
        allergies: updates.allergies,
        chronic_diseases: updates.chronicDiseases
      });
      const mapped = mapPatient(row);
      setPatients(prev => prev.map(p => (p.id === id ? mapped : p)));
    },
    [doctorId]
  );

  const updatePatientVitals = useCallback(
    async (patientId: string, vitals: Partial<PatientVitals>, newAge?: number) => {
      if (!doctorId) return;
      try {
        await patientService.updateVitals(patientId, doctorId, vitals, newAge);
        // Optimistically update local state
        setPatients(prev =>
          prev.map(p => {
            if (p.id !== patientId) return p;
            const nextVitals: PatientVitals = {
              ...p.vitals,
              ...Object.fromEntries(
                Object.entries(vitals).filter(([, v]) => v !== undefined)
              )
            } as PatientVitals;
            return {
              ...p,
              age: typeof newAge === 'number' && !Number.isNaN(newAge) ? newAge : p.age,
              vitals: nextVitals
            };
          })
        );
      } catch (err) {
        console.warn('[ClinicContext] updatePatientVitals', err);
      }
    },
    [doctorId]
  );

  // ------------------------------------------------------------------
  // System forms
  // ------------------------------------------------------------------
  const saveSystemForm = useCallback(
    async (data: {
      patientId: string;
      system: ClinicalSystemKey;
      data: Record<string, unknown>;
      chiefComplaints: string;
      duration: string;
      severity: 'Mild' | 'Moderate' | 'Severe';
      modalitiesAggravation: string;
      modalitiesAmelioration: string;
      concomitants: string;
      clinicalNotes: string;
      submittedVia?: 'Doctor_Dashboard' | 'WhatsApp_Remote_Intake' | 'Patient_Portal';
    }): Promise<SystemFormRecord> => {
      if (!doctorId) throw new ServiceError('Not authenticated');
      const row = await systemFormService.save(doctorId, {
        patientId: data.patientId,
        systemKey: data.system,
        data: data.data,
        chiefComplaints: data.chiefComplaints,
        duration: data.duration,
        severity: data.severity,
        modalitiesAggravation: data.modalitiesAggravation,
        modalitiesAmelioration: data.modalitiesAmelioration,
        concomitants: data.concomitants,
        clinicalNotes: data.clinicalNotes,
        submittedVia: data.submittedVia ?? 'Doctor_Dashboard'
      });
      const mapped = mapSystemForm(row);
      setSystemForms(prev => {
        const idx = prev.findIndex(
          f => f.patientId === mapped.patientId && f.system === mapped.system
        );
        if (idx >= 0) {
          const copy = [...prev];
          copy[idx] = mapped;
          return copy;
        }
        return [mapped, ...prev];
      });
      return mapped;
    },
    [doctorId]
  );

  // ------------------------------------------------------------------
  // Prescriptions
  // ------------------------------------------------------------------
  const savePrescription = useCallback(
    async (rx: Omit<Prescription, 'id'> & { id?: string }): Promise<Prescription> => {
      if (!doctorId) throw new ServiceError('Not authenticated');

      const homeoMedicines: HomeoMedicineInput[] = rx.homeoMedicines.map(m => ({
        remedy: m.remedy,
        potency: m.potency,
        form: m.form,
        dosage: m.dosage,
        frequency: m.frequency,
        duration: m.duration,
        instructions: m.instructions
      }));
      const alloMedicines: AlloMedicineInput[] = rx.alloMedicines.map(m => ({
        name: m.name,
        type: m.type,
        strength: m.strength,
        frequency: m.frequency,
        timing: m.timing,
        duration: m.duration,
        instructions: m.instructions
      }));

      const row = await prescriptionService.save(doctorId, {
        id: rx.id,
        patientId: rx.patientId,
        consultationDate: rx.consultationDate,
        diagnosis: rx.diagnosis,
        clinicalNotes: rx.clinicalNotes,
        dietaryAdvice: rx.dietaryAdvise,
        investigationsOrdered: rx.investigationsOrdered,
        followUpDate: rx.followUpDate || null,
        homeoMedicines,
        alloMedicines
      });
      const mapped = mapPrescription(row);
      setPrescriptions(prev => {
        const idx = prev.findIndex(p => p.id === mapped.id);
        if (idx >= 0) {
          const copy = [...prev];
          copy[idx] = mapped;
          return copy;
        }
        return [mapped, ...prev];
      });
      return mapped;
    },
    [doctorId]
  );

  // ------------------------------------------------------------------
  // Follow-ups
  // ------------------------------------------------------------------
  const saveFollowUp = useCallback(
    async (fu: Omit<FollowUpRecord, 'id'>): Promise<FollowUpRecord> => {
      if (!doctorId) throw new ServiceError('Not authenticated');
      const row = await followUpService.create(doctorId, {
        patientId: fu.patientId,
        date: fu.date,
        response: fu.response,
        subjectiveFeedback: fu.subjectiveFeedback,
        vitalsCheck: fu.vitalsCheck,
        remedyActionAssessment: fu.remedyActionAssessment,
        prescriptionAdjustment: fu.prescriptionAdjustment,
        nextFollowUpDate: fu.nextFollowUpDate || null
      });
      const mapped = mapFollowUp(row);
      setFollowUps(prev => [mapped, ...prev]);
      return mapped;
    },
    [doctorId]
  );

  // ------------------------------------------------------------------
  // Appointments
  // ------------------------------------------------------------------
  const addAppointment = useCallback(
    async (apt: Omit<Appointment, 'id'>) => {
      if (!doctorId) throw new ServiceError('Not authenticated');
      const row = await appointmentService.create(doctorId, {
        patientId: apt.patientId,
        appointmentDate: apt.date,
        timeSlot: apt.timeSlot,
        type: apt.type,
        status: apt.status,
        notes: apt.notes
      });
      const patient = patients.find(p => p.id === apt.patientId);
      setAppointments(prev => [mapAppointment(row, patient), ...prev]);
    },
    [doctorId, patients]
  );

  const updateAppointmentStatus = useCallback(
    async (id: string, status: Appointment['status']) => {
      if (!doctorId) return;
      const row = await appointmentService.updateStatus(id, doctorId, status);
      const patient = patients.find(p => p.id === row.patient_id);
      setAppointments(prev =>
        prev.map(a => (a.id === id ? mapAppointment(row, patient) : a))
      );
    },
    [doctorId, patients]
  );

  // ------------------------------------------------------------------
  // Billing
  // ------------------------------------------------------------------
  const saveInvoice = useCallback(
    async (inv: Omit<BillingInvoice, 'id'>): Promise<BillingInvoice> => {
      if (!doctorId) throw new ServiceError('Not authenticated');
      const row = await invoiceService.create(doctorId, {
        patientId: inv.patientId,
        invoiceNumber: inv.invoiceNumber,
        invoiceDate: inv.date,
        items: inv.items,
        consultationFee: inv.consultationFee,
        medicineCharges: inv.medicineCharges,
        discount: inv.discount,
        totalAmount: inv.totalAmount,
        paymentMode: inv.paymentMode,
        status: inv.status
      });
      const mapped = mapInvoice(row);
      const patient = patients.find(p => p.id === inv.patientId);
      const withName: BillingInvoice = {
        ...mapped,
        patientName: patient?.name ?? inv.patientName
      };
      setInvoices(prev => [withName, ...prev]);
      return withName;
    },
    [doctorId, patients]
  );

  // ------------------------------------------------------------------
  // WhatsApp conversations
  // ------------------------------------------------------------------
  const sendWhatsAppMessage = useCallback(
    async (
      convId: string,
      text: string,
      linkData?: WhatsAppMessage['linkData']
    ) => {
      if (!doctorId) return;
      await whatsappService.sendMessage(doctorId, convId, text, linkData as never);
      void reloadConversations();
    },
    [doctorId, reloadConversations]
  );

  const updateConversationStatus = useCallback(
    async (convId: string, status: WhatsAppConversation['status']) => {
      if (!doctorId) return;
      await whatsappService.updateStatus(doctorId, convId, status);
      setConversations(prev =>
        prev.map(c => (c.id === convId ? { ...c, status } : c))
      );
    },
    [doctorId]
  );

  const markConversationAsRead = useCallback(
    async (convId: string) => {
      if (!doctorId) return;
      await whatsappService.markRead(doctorId, convId);
      setConversations(prev =>
        prev.map(c => (c.id === convId ? { ...c, unreadCount: 0 } : c))
      );
    },
    [doctorId]
  );

  // ------------------------------------------------------------------
  // Remote intake (patient portal -> Supabase)
  // ------------------------------------------------------------------
  const openRemoteIntakeModal = useCallback(
    (patientId: string, system: ClinicalSystemKey) => {
      setRemoteIntakeModal({ isOpen: true, patientId, system });
    },
    []
  );
  const closeRemoteIntakeModal = useCallback(() => setRemoteIntakeModal(null), []);

  const submitRemoteIntake = useCallback(
    async (
      token: string,
      patientId: string,
      system: ClinicalSystemKey,
      payload: {
        data: Record<string, unknown>;
        chiefComplaints: string;
        duration: string;
        severity: 'Mild' | 'Moderate' | 'Severe';
        modalitiesAggravation: string;
        modalitiesAmelioration: string;
        concomitants: string;
        clinicalNotes: string;
      }
    ) => {
      const session = await shareTokenService.resolveSession(token);
      if (!session) throw new ServiceError('Invalid or expired share link');

      const row = await systemFormService.submitRemote(session.id, {
        patientId,
        systemKey: system,
        data: payload.data,
        chiefComplaints: payload.chiefComplaints,
        duration: payload.duration,
        severity: payload.severity,
        modalitiesAggravation: payload.modalitiesAggravation,
        modalitiesAmelioration: payload.modalitiesAmelioration,
        concomitants: payload.concomitants,
        clinicalNotes: payload.clinicalNotes
      });
      await shareTokenService.markUsed(session.id);

      // Realtime will update the doctor's view. Also refresh locally:
      const mapped = mapSystemForm(row);
      setSystemForms(prev => {
        const idx = prev.findIndex(
          f => f.patientId === mapped.patientId && f.system === mapped.system
        );
        if (idx >= 0) {
          const copy = [...prev];
          copy[idx] = mapped;
          return copy;
        }
        return [mapped, ...prev];
      });
    },
    []
  );

  // ------------------------------------------------------------------
  // Share link generation
  // ------------------------------------------------------------------
  const generateWhatsAppLink = useCallback(
    async (patientId: string, system: ClinicalSystemKey) => {
      if (!doctorId) throw new ServiceError('Not authenticated');
      const patient = patients.find(p => p.id === patientId);
      if (!patient) throw new ServiceError('Patient not found');

      const tokenRow = await shareTokenService.create(doctorId, {
        patientId,
        systemKey: system,
        shareType: 'intake',
        expiresInDays: 30
      });

      const origin = window.location.origin + window.location.pathname;
      const shareableUrl = `${origin}?token=${encodeURIComponent(tokenRow.token)}&view=intake`;

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
      const messageText = `Hello ${patient.name}, ${CLINIC_CONFIG.doctorName} at ${CLINIC_CONFIG.appName} has sent you your clinical case taking form for *${sysName}*.\n\nOpen and fill your secure case form here:\n${shareableUrl}\n\nOnce submitted, Dr. will immediately review your case details.`;

      const cleanNumber = patient.mobile.replace(/[^0-9]/g, '');
      const waUrl = `https://wa.me/${cleanNumber}?text=${encodeURIComponent(messageText)}`;

      return { link: shareableUrl, messageText, waUrl };
    },
    [doctorId, patients]
  );

  const generateWhatsAppPrescriptionLink = useCallback(
    async (patientId: string, prescriptionId?: string) => {
      if (!doctorId) throw new ServiceError('Not authenticated');
      const patient = patients.find(p => p.id === patientId);
      if (!patient) throw new ServiceError('Patient not found');
      const rx =
        (prescriptionId
          ? prescriptions.find(p => p.id === prescriptionId)
          : prescriptions.find(p => p.patientId === patientId)) ?? null;
      if (!rx) throw new ServiceError('Prescription not found');

      const tokenRow = await shareTokenService.create(doctorId, {
        patientId,
        shareType: 'prescription',
        relatedId: rx.id,
        expiresInDays: 90
      });

      const origin = window.location.origin + window.location.pathname;
      const shareableUrl = `${origin}?token=${encodeURIComponent(tokenRow.token)}&view=prescription`;
      const messageText = `Hello ${patient.name}, your prescription from ${CLINIC_CONFIG.doctorName} (${CLINIC_CONFIG.appName}) is ready.\n\nView your prescription here:\n${shareableUrl}`;
      const cleanNumber = patient.mobile.replace(/[^0-9]/g, '');
      const waUrl = `https://wa.me/${cleanNumber}?text=${encodeURIComponent(messageText)}`;
      return { link: shareableUrl, messageText, waUrl };
    },
    [doctorId, patients, prescriptions]
  );

  const generateWhatsAppBillingLink = useCallback(
    async (patientId: string, invoiceId?: string) => {
      if (!doctorId) throw new ServiceError('Not authenticated');
      const patient = patients.find(p => p.id === patientId);
      if (!patient) throw new ServiceError('Patient not found');
      const inv =
        (invoiceId
          ? invoices.find(i => i.id === invoiceId)
          : invoices.find(i => i.patientId === patientId)) ?? null;
      if (!inv) throw new ServiceError('Invoice not found');

      const tokenRow = await shareTokenService.create(doctorId, {
        patientId,
        shareType: 'billing',
        relatedId: inv.id,
        expiresInDays: 90
      });

      const origin = window.location.origin + window.location.pathname;
      const shareableUrl = `${origin}?token=${encodeURIComponent(tokenRow.token)}&view=billing`;
      const messageText = `Hello ${patient.name}, thank you for visiting ${CLINIC_CONFIG.appName}.\n\nYour payment receipt #${inv.invoiceNumber} for Rs. ${inv.totalAmount} is ready:\n${shareableUrl}`;
      const cleanNumber = patient.mobile.replace(/[^0-9]/g, '');
      const waUrl = `https://wa.me/${cleanNumber}?text=${encodeURIComponent(messageText)}`;
      return { link: shareableUrl, messageText, waUrl };
    },
    [doctorId, patients, invoices]
  );

  const openWhatsAppShareDialog = useCallback(
    async (patientId: string, system: ClinicalSystemKey) => {
      try {
        const { link, messageText } = await generateWhatsAppLink(patientId, system);
        const patient = patients.find(p => p.id === patientId);
        setWhatsAppShareDialog({
          isOpen: true,
          type: 'intake',
          patientId,
          system,
          phone: patient?.mobile ?? '',
          link,
          messageText,
          title: 'WhatsApp Case Taking Link',
          subtitle: `Remote symptom intake for ${patient?.name ?? 'Patient'}`
        });
      } catch (err) {
        console.error('[ClinicContext] openWhatsAppShareDialog', err);
      }
    },
    [generateWhatsAppLink, patients]
  );

  const openWhatsAppPrescriptionShareDialog = useCallback(
    async (patientId: string, prescriptionId?: string) => {
      try {
        const { link, messageText } = await generateWhatsAppPrescriptionLink(
          patientId,
          prescriptionId
        );
        const patient = patients.find(p => p.id === patientId);
        setWhatsAppShareDialog({
          isOpen: true,
          type: 'prescription',
          patientId,
          prescriptionId,
          phone: patient?.mobile ?? '',
          link,
          messageText,
          title: 'WhatsApp Prescription Link',
          subtitle: `Prescription for ${patient?.name ?? 'Patient'}`
        });
      } catch (err) {
        console.error('[ClinicContext] openWhatsAppPrescriptionShareDialog', err);
      }
    },
    [generateWhatsAppPrescriptionLink, patients]
  );

  const openWhatsAppBillingShareDialog = useCallback(
    async (patientId: string, invoiceId?: string) => {
      try {
        const { link, messageText } = await generateWhatsAppBillingLink(patientId, invoiceId);
        const patient = patients.find(p => p.id === patientId);
        setWhatsAppShareDialog({
          isOpen: true,
          type: 'billing',
          patientId,
          invoiceId,
          phone: patient?.mobile ?? '',
          link,
          messageText,
          title: 'WhatsApp Billing Receipt Link',
          subtitle: `Receipt for ${patient?.name ?? 'Patient'}`
        });
      } catch (err) {
        console.error('[ClinicContext] openWhatsAppBillingShareDialog', err);
      }
    },
    [generateWhatsAppBillingLink, patients]
  );

  const closeWhatsAppShareDialog = useCallback(() => setWhatsAppShareDialog(null), []);

  // ------------------------------------------------------------------
  // Supabase status modal
  // ------------------------------------------------------------------
  const openSupabaseModal = useCallback(() => setIsSupabaseModalOpen(true), []);
  const closeSupabaseModal = useCallback(() => setIsSupabaseModalOpen(false), []);

  // ------------------------------------------------------------------
  // Reset
  // ------------------------------------------------------------------
  const resetDatabase = useCallback(async () => {
    // No-op: application no longer uses local mock data. All data lives in Supabase.
    // Refresh all data from the server.
    await Promise.all([
      reloadPatients(),
      reloadSystemForms(),
      reloadPrescriptions(),
      reloadFollowUps(),
      reloadAppointments(),
      reloadInvoices(),
      reloadConversations()
    ]);
  }, [
    reloadPatients,
    reloadSystemForms,
    reloadPrescriptions,
    reloadFollowUps,
    reloadAppointments,
    reloadInvoices,
    reloadConversations
  ]);

  // ------------------------------------------------------------------
  // Derived
  // ------------------------------------------------------------------
  const selectedPatient = useMemo(
    () => patients.find(p => p.id === selectedPatientId) ?? patients[0],
    [patients, selectedPatientId]
  );

  // ------------------------------------------------------------------
  // Value
  // ------------------------------------------------------------------
  const value: ClinicContextType = {
    currentUser,
    doctorUsers,
    authLoading,
    isAuthenticated,
    isSupabaseReady: isSupabaseConfigured,

    login,
    signup,
    logout,
    updateDoctorProfile,
    createDoctorUser,
    deleteDoctorUser,

    patients,
    selectedPatientId,
    selectedPatient,
    selectPatient,
    createPatient,
    updatePatient,
    updatePatientVitals,

    systemForms,
    saveSystemForm,

    prescriptions,
    savePrescription,

    followUps,
    saveFollowUp,

    appointments,
    addAppointment,
    updateAppointmentStatus,

    invoices,
    saveInvoice,

    conversations,
    sendWhatsAppMessage,
    updateConversationStatus,
    markConversationAsRead,

    remoteIntakeModal,
    openRemoteIntakeModal,
    closeRemoteIntakeModal,
    submitRemoteIntake,

    whatsAppShareDialog,
    openWhatsAppShareDialog,
    openWhatsAppPrescriptionShareDialog,
    openWhatsAppBillingShareDialog,
    closeWhatsAppShareDialog,
    generateWhatsAppLink,
    generateWhatsAppPrescriptionLink,
    generateWhatsAppBillingLink,

    activeTab,
    setActiveTab,
    activeSystemFormKey,
    setActiveSystemFormKey,

    isSupabaseModalOpen,
    openSupabaseModal,
    closeSupabaseModal,

    refreshClinicSettings,
    resetDatabase
  };

  return <ClinicContext.Provider value={value}>{children}</ClinicContext.Provider>;
};

export const useClinic = (): ClinicContextType => {
  const context = useContext(ClinicContext);
  if (!context) throw new Error('useClinic must be used within a ClinicProvider');
  return context;
};

// Re-export for convenience
export type { Session };