export type Gender = 'Male' | 'Female' | 'Other';

export interface PatientVitals {
  bpSystolic: number;
  bpDiastolic: number;
  pulse?: number;
  temperature?: number;
  spo2?: number;
  weight: number;
  height: number;
  heightInch?: number;
  heightInches?: number;
  bmi?: number;
  rbs: number;
  respiratoryRate?: number;
}

export interface Patient {
  id: string;
  patientCode?: string;
  abhaId?: string;
  abhaAddress?: string;
  name: string;
  age: number;
  gender: Gender;
  dob?: string;
  mobile: string;
  email?: string;
  bloodGroup?: string;
  address: string;
  occupation?: string;
  emergencyContact?: string;
  vitals: PatientVitals;
  allergies: string[];
  chronicDiseases: string[];
  createdAt: string;
  updatedAt: string;
}

export type ClinicalSystemKey =
  | 'headache'
  | 'skin_hair'
  | 'gastrointestinal'
  | 'urinary'
  | 'musculoskeletal'
  | 'respiratory'
  | 'female_gynae'
  | 'pediatric'
  | 'other_mind_generals';

export interface SystemFormRecord {
  id: string;
  patientId: string;
  system: ClinicalSystemKey;
  updatedAt: string;
  submittedVia: 'Doctor_Dashboard' | 'WhatsApp_Remote_Intake' | 'Patient_Portal';
  data: Record<string, unknown>;
  chiefComplaints: string;
  duration: string;
  severity: 'Mild' | 'Moderate' | 'Severe';
  modalitiesAggravation: string;
  modalitiesAmelioration: string;
  concomitants: string;
  clinicalNotes: string;
}

export interface RepertoryRubric {
  id: string;
  chapter: 'Mind' | 'Head' | 'Stomach' | 'Skin' | 'Extremities' | 'Respiratory' | 'Urinary' | 'Female' | 'Generalities';
  rubricName: string;
  grade: 1 | 2 | 3;
  systemOrigin?: ClinicalSystemKey;
}

export interface RemedyScore {
  remedyName: string;
  commonName: string;
  abbreviation: string;
  totalMarks: number;
  rubricsCovered: number;
  keynotes: string;
  matchedRubricIds: string[];
}

export interface HomeoMedicine {
  id: string;
  remedy: string;
  potency: '6C' | '30C' | '200C' | '1M' | '10M' | '50M' | 'CM' | 'LM 1' | 'LM 2' | 'LM 3' | 'Q (Mother Tincture)' | '3X' | '6X' | '12X';
  form: 'Globules #30' | 'Globules #40' | 'Dilution Drops' | 'Biochemic Tablets' | 'Trituration Powder';
  dosage: string;
  frequency: 'OD (Once Daily)' | 'BD (Twice Daily)' | 'TDS (Thrice Daily)' | 'QID (Four Times Daily)' | 'Weekly' | 'Stat / SOS';
  duration: string;
  instructions: string;
}

export interface AlloMedicine {
  id: string;
  name: string;
  type: 'Tablet' | 'Capsule' | 'Syrup' | 'Ointment' | 'Eye/Ear Drops' | 'Inhaler';
  strength: string;
  frequency: 'OD' | 'BD' | 'TDS' | 'QID' | 'SOS' | 'HS';
  timing: 'Before Food' | 'After Food' | 'With Food' | 'Empty Stomach';
  duration: string;
  instructions?: string;
}

export interface Prescription {
  id: string;
  patientId: string;
  consultationDate: string;
  diagnosis: string;
  clinicalNotes: string;
  homeoMedicines: HomeoMedicine[];
  alloMedicines: AlloMedicine[];
  dietaryAdvise: string[];
  investigationsOrdered: string[];
  followUpDate: string;
  doctorName: string;
  doctorDegree: string;
  doctorRegNo: string;
  clinicName: string;
  clinicAddress: string;
  clinicPhone: string;
}

export interface FollowUpRecord {
  id: string;
  patientId: string;
  date: string;
  response: 'Marked Improvement' | 'Moderate Improvement' | 'Slight Improvement' | 'Status Quo (Same)' | 'Aggravation / Worse';
  subjectiveFeedback: string;
  vitalsCheck: Partial<PatientVitals>;
  remedyActionAssessment: string;
  prescriptionAdjustment: string;
  nextFollowUpDate: string;
}

export interface Appointment {
  id: string;
  patientId: string;
  patientName: string;
  patientMobile: string;
  date: string;
  timeSlot: string;
  type: 'New Consultation' | 'Follow-up' | 'Report Review' | 'Remote WhatsApp Consult';
  status: 'Scheduled' | 'Waiting' | 'In-Consultation' | 'Completed' | 'Cancelled';
  notes?: string;
}

export type WhatsAppShareType = 'intake' | 'prescription' | 'billing' | 'custom_form';

export interface WhatsAppShareDialogData {
  isOpen: boolean;
  type: WhatsAppShareType;
  patientId: string;
  system?: ClinicalSystemKey;
  prescriptionId?: string;
  invoiceId?: string;
  phone: string;
  link: string;
  messageText: string;
  title?: string;
  subtitle?: string;
}

export type WhatsAppCategory =
  | 'All'
  | 'New enquiries'
  | 'Patients'
  | 'Unread'
  | 'Pending'
  | 'Follow-up'
  | 'Appointment'
  | 'Completed';

export interface WhatsAppMessage {
  id: string;
  sender: 'doctor' | 'patient' | 'system';
  text: string;
  timestamp: string;
  status?: 'sent' | 'delivered' | 'read';
  linkData?: {
    type: 'case_intake' | 'prescription' | 'appointment';
    system?: ClinicalSystemKey;
    patientId?: string;
    title?: string;
    url?: string;
  };
}

export interface WhatsAppConversation {
  id: string;
  patientId?: string;
  patientName: string;
  phone: string;
  category: WhatsAppCategory;
  unreadCount: number;
  lastMessage: string;
  lastMessageTime: string;
  status: 'Pending' | 'In-Progress' | 'Resolved';
  messages: WhatsAppMessage[];
}

export interface BillingInvoice {
  id: string;
  invoiceNumber: string;
  patientId: string;
  patientName: string;
  date: string;
  items: { description: string; amount: number }[];
  consultationFee: number;
  medicineCharges: number;
  discount: number;
  totalAmount: number;
  paymentMode: 'UPI' | 'Cash' | 'Card' | 'Pending';
  status: 'Paid' | 'Unpaid' | 'Partial';
}

export interface DoctorUser {
  id: string;
  email: string;
  name: string;
  qualifications: string;
  regNo: string;
  speciality: string;
  clinicName: string;
  address: string;
  city: string;
  pinCode: string;
  phone: string;
  role: 'owner' | 'doctor';
  createdAt: string;
  consultationFee?: number;
}

export type QuestionType =
  | 'short_text' | 'long_text' | 'number' | 'date' | 'time'
  | 'single_choice' | 'multiple_choice' | 'dropdown' | 'yes_no'
  | 'image_upload' | 'multiple_image_upload' | 'file_upload' | 'section_text';

export interface CustomQuestionOption {
  id?: string;
  label: string;
}

export interface CustomQuestionDraft {
  id?: string;
  questionType: QuestionType;
  label: string;
  helpText?: string;
  isRequired?: boolean;
  options?: CustomQuestionOption[];
  config?: Record<string, unknown>;
}

export interface CustomFormDraft {
  id?: string;
  systemKey: ClinicalSystemKey;
  title: string;
  description?: string;
  questions: CustomQuestionDraft[];
}