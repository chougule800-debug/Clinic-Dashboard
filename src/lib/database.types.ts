export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

export type Gender = 'Male' | 'Female' | 'Other';
export type Severity = 'Mild' | 'Moderate' | 'Severe';
export type SubmissionSource = 'Doctor_Dashboard' | 'WhatsApp_Remote_Intake' | 'Patient_Portal';
export type AppointmentType = 'New Consultation' | 'Follow-up' | 'Report Review' | 'Remote WhatsApp Consult';
export type AppointmentStatus = 'Scheduled' | 'Waiting' | 'In-Consultation' | 'Completed' | 'Cancelled';
export type FollowUpResponse =
  | 'Marked Improvement'
  | 'Moderate Improvement'
  | 'Slight Improvement'
  | 'Status Quo (Same)'
  | 'Aggravation / Worse';
export type PaymentMode = 'UPI' | 'Cash' | 'Card' | 'Pending';
export type PaymentStatus = 'Paid' | 'Unpaid' | 'Partial';
export type Potency =
  | '6C' | '30C' | '200C' | '1M' | '10M' | '50M' | 'CM'
  | 'LM 1' | 'LM 2' | 'LM 3' | 'Q (Mother Tincture)' | '3X' | '6X' | '12X';
export type MedicineForm =
  | 'Globules #30' | 'Globules #40' | 'Dilution Drops' | 'Biochemic Tablets' | 'Trituration Powder';
export type MedicineFrequency =
  | 'OD (Once Daily)' | 'BD (Twice Daily)' | 'TDS (Thrice Daily)'
  | 'QID (Four Times Daily)' | 'Weekly' | 'Stat / SOS';
export type AlloType = 'Tablet' | 'Capsule' | 'Syrup' | 'Ointment' | 'Eye/Ear Drops' | 'Inhaler';
export type AlloFrequency = 'OD' | 'BD' | 'TDS' | 'QID' | 'SOS' | 'HS';
export type AlloTiming = 'Before Food' | 'After Food' | 'With Food' | 'Empty Stomach';
export type ConversationStatus = 'Pending' | 'In-Progress' | 'Resolved';
export type MessageSender = 'doctor' | 'patient' | 'system';
export type QuestionType =
  | 'short_text' | 'long_text' | 'number' | 'date' | 'time'
  | 'single_choice' | 'multiple_choice' | 'dropdown' | 'yes_no'
  | 'image_upload' | 'multiple_image_upload' | 'file_upload' | 'section_text';
export type ResponseStatus = 'draft' | 'submitted' | 'reviewed';
export type DoctorRole = 'owner' | 'doctor';
export type ShareType = 'intake' | 'prescription' | 'billing' | 'custom_form';
export type AttachmentEntity =
  | 'system_form' | 'prescription' | 'follow_up' | 'custom_response' | 'invoice';

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

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          email: string;
          name: string;
          qualifications: string | null;
          reg_no: string | null;
          speciality: string | null;
          clinic_name: string | null;
          address: string | null;
          city: string | null;
          pin_code: string | null;
          phone: string | null;
          role: DoctorRole;
          consultation_fee: number | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          email: string;
          name?: string;
          qualifications?: string | null;
          reg_no?: string | null;
          speciality?: string | null;
          clinic_name?: string | null;
          address?: string | null;
          city?: string | null;
          pin_code?: string | null;
          phone?: string | null;
          role?: DoctorRole;
          consultation_fee?: number | null;
        };
        Update: Partial<Database['public']['Tables']['profiles']['Insert']>;
      };
      clinical_systems: {
        Row: {
          key: string;
          label: string;
          description: string | null;
          icon_name: string | null;
          fields: Json;
          display_order: number;
          is_active: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          key: string;
          label: string;
          description?: string | null;
          icon_name?: string | null;
          fields?: Json;
          display_order?: number;
          is_active?: boolean;
        };
        Update: Partial<Database['public']['Tables']['clinical_systems']['Insert']>;
      };
      patients: {
        Row: {
          id: string;
          doctor_id: string;
          patient_code: string | null;
          abha_id: string | null;
          abha_address: string | null;
          name: string;
          age: number | null;
          gender: Gender | null;
          dob: string | null;
          mobile: string | null;
          email: string | null;
          blood_group: string | null;
          address: string | null;
          occupation: string | null;
          emergency_contact: string | null;
          bp_systolic: number | null;
          bp_diastolic: number | null;
          pulse: number | null;
          temperature: number | null;
          spo2: number | null;
          weight: number | null;
          height_inches: number | null;
          bmi: number | null;
          rbs: number | null;
          respiratory_rate: number | null;
          allergies: string[];
          chronic_diseases: string[];
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<
          Database['public']['Tables']['patients']['Row'],
          'id' | 'created_at' | 'updated_at' | 'patient_code'
        > & { id?: string; patient_code?: string | null };
        Update: Partial<Database['public']['Tables']['patients']['Insert']>;
      };
      share_tokens: {
        Row: {
          id: string;
          token: string;
          doctor_id: string;
          patient_id: string | null;
          system_key: string | null;
          form_id: string | null;
          form_version_id: string | null;
          share_type: ShareType;
          related_id: string | null;
          expires_at: string | null;
          used_at: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          token: string;
          doctor_id: string;
          patient_id?: string | null;
          system_key?: string | null;
          form_id?: string | null;
          form_version_id?: string | null;
          share_type?: ShareType;
          related_id?: string | null;
          expires_at?: string | null;
          used_at?: string | null;
        };
        Update: Partial<Database['public']['Tables']['share_tokens']['Insert']>;
      };
      system_forms: {
        Row: {
          id: string;
          doctor_id: string;
          patient_id: string;
          system_key: string;
          submitted_via: SubmissionSource;
          share_token_id: string | null;
          chief_complaints: string | null;
          duration: string | null;
          severity: Severity | null;
          modalities_aggravation: string | null;
          modalities_amelioration: string | null;
          concomitants: string | null;
          clinical_notes: string | null;
          data: Json;
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<
          Database['public']['Tables']['system_forms']['Row'],
          'id' | 'created_at' | 'updated_at'
        > & { id?: string };
        Update: Partial<Database['public']['Tables']['system_forms']['Insert']>;
      };
      prescriptions: {
        Row: {
          id: string;
          doctor_id: string;
          patient_id: string;
          consultation_date: string;
          diagnosis: string | null;
          clinical_notes: string | null;
          dietary_advice: string[];
          investigations_ordered: string[];
          follow_up_date: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<
          Database['public']['Tables']['prescriptions']['Row'],
          'id' | 'created_at' | 'updated_at'
        > & { id?: string };
        Update: Partial<Database['public']['Tables']['prescriptions']['Insert']>;
      };
      prescription_homeo_medicines: {
        Row: {
          id: string;
          prescription_id: string;
          remedy: string;
          potency: Potency;
          form: MedicineForm;
          dosage: string | null;
          frequency: MedicineFrequency;
          duration: string | null;
          instructions: string | null;
          display_order: number;
          created_at: string;
        };
        Insert: Omit<
          Database['public']['Tables']['prescription_homeo_medicines']['Row'],
          'id' | 'created_at'
        > & { id?: string };
        Update: Partial<Database['public']['Tables']['prescription_homeo_medicines']['Insert']>;
      };
      prescription_allo_medicines: {
        Row: {
          id: string;
          prescription_id: string;
          name: string;
          type: AlloType;
          strength: string | null;
          frequency: AlloFrequency;
          timing: AlloTiming;
          duration: string | null;
          instructions: string | null;
          display_order: number;
          created_at: string;
        };
        Insert: Omit<
          Database['public']['Tables']['prescription_allo_medicines']['Row'],
          'id' | 'created_at'
        > & { id?: string };
        Update: Partial<Database['public']['Tables']['prescription_allo_medicines']['Insert']>;
      };
      follow_ups: {
        Row: {
          id: string;
          doctor_id: string;
          patient_id: string;
          date: string;
          response: FollowUpResponse;
          subjective_feedback: string | null;
          vitals_check: Json;
          remedy_action_assessment: string | null;
          prescription_adjustment: string | null;
          next_follow_up_date: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<
          Database['public']['Tables']['follow_ups']['Row'],
          'id' | 'created_at' | 'updated_at'
        > & { id?: string };
        Update: Partial<Database['public']['Tables']['follow_ups']['Insert']>;
      };
      appointments: {
        Row: {
          id: string;
          doctor_id: string;
          patient_id: string;
          appointment_date: string;
          time_slot: string;
          type: AppointmentType;
          status: AppointmentStatus;
          notes: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<
          Database['public']['Tables']['appointments']['Row'],
          'id' | 'created_at' | 'updated_at'
        > & { id?: string };
        Update: Partial<Database['public']['Tables']['appointments']['Insert']>;
      };
      invoices: {
        Row: {
          id: string;
          doctor_id: string;
          patient_id: string;
          invoice_number: string;
          invoice_date: string;
          consultation_fee: number;
          medicine_charges: number;
          discount: number;
          total_amount: number;
          payment_mode: PaymentMode;
          status: PaymentStatus;
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<
          Database['public']['Tables']['invoices']['Row'],
          'id' | 'created_at' | 'updated_at'
        > & { id?: string };
        Update: Partial<Database['public']['Tables']['invoices']['Insert']>;
      };
      invoice_items: {
        Row: {
          id: string;
          invoice_id: string;
          description: string;
          amount: number;
          display_order: number;
          created_at: string;
        };
        Insert: Omit<Database['public']['Tables']['invoice_items']['Row'], 'id' | 'created_at'> & { id?: string };
        Update: Partial<Database['public']['Tables']['invoice_items']['Insert']>;
      };
      whatsapp_conversations: {
        Row: {
          id: string;
          doctor_id: string;
          patient_id: string | null;
          patient_name: string | null;
          phone: string | null;
          category: string;
          unread_count: number;
          last_message: string | null;
          last_message_time: string;
          status: ConversationStatus;
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<
          Database['public']['Tables']['whatsapp_conversations']['Row'],
          'id' | 'created_at' | 'updated_at'
        > & { id?: string };
        Update: Partial<Database['public']['Tables']['whatsapp_conversations']['Insert']>;
      };
      whatsapp_messages: {
        Row: {
          id: string;
          conversation_id: string;
          doctor_id: string;
          sender: MessageSender;
          text: string;
          status: string | null;
          link_data: Json | null;
          created_at: string;
        };
        Insert: Omit<Database['public']['Tables']['whatsapp_messages']['Row'], 'id' | 'created_at'> & { id?: string };
        Update: Partial<Database['public']['Tables']['whatsapp_messages']['Insert']>;
      };
      custom_forms: {
        Row: {
          id: string;
          doctor_id: string;
          system_key: string;
          title: string;
          description: string | null;
          is_active: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<
          Database['public']['Tables']['custom_forms']['Row'],
          'id' | 'created_at' | 'updated_at'
        > & { id?: string };
        Update: Partial<Database['public']['Tables']['custom_forms']['Insert']>;
      };
      custom_form_versions: {
        Row: {
          id: string;
          form_id: string;
          version_number: number;
          is_published: boolean;
          created_at: string;
        };
        Insert: Omit<Database['public']['Tables']['custom_form_versions']['Row'], 'id' | 'created_at'> & { id?: string };
        Update: Partial<Database['public']['Tables']['custom_form_versions']['Insert']>;
      };
      custom_questions: {
        Row: {
          id: string;
          version_id: string;
          question_type: QuestionType;
          label: string;
          help_text: string | null;
          is_required: boolean;
          display_order: number;
          config: Json;
          created_at: string;
        };
        Insert: Omit<Database['public']['Tables']['custom_questions']['Row'], 'id' | 'created_at'> & { id?: string };
        Update: Partial<Database['public']['Tables']['custom_questions']['Insert']>;
      };
      custom_question_options: {
        Row: {
          id: string;
          question_id: string;
          label: string;
          display_order: number;
          created_at: string;
        };
        Insert: Omit<Database['public']['Tables']['custom_question_options']['Row'], 'id' | 'created_at'> & { id?: string };
        Update: Partial<Database['public']['Tables']['custom_question_options']['Insert']>;
      };
      custom_form_responses: {
        Row: {
          id: string;
          form_id: string | null;
          form_version_id: string | null;
          doctor_id: string;
          patient_id: string | null;
          share_token_id: string | null;
          system_key: string | null;
          status: ResponseStatus;
          submitted_at: string;
          created_at: string;
        };
        Insert: Omit<
          Database['public']['Tables']['custom_form_responses']['Row'],
          'id' | 'created_at'
        > & { id?: string };
        Update: Partial<Database['public']['Tables']['custom_form_responses']['Insert']>;
      };
      custom_question_responses: {
        Row: {
          id: string;
          response_id: string;
          question_id: string | null;
          question_label: string | null;
          question_type: QuestionType | null;
          text_value: string | null;
          numeric_value: number | null;
          date_value: string | null;
          time_value: string | null;
          boolean_value: boolean | null;
          selected_options: Json | null;
          created_at: string;
        };
        Insert: Omit<
          Database['public']['Tables']['custom_question_responses']['Row'],
          'id' | 'created_at'
        > & { id?: string };
        Update: Partial<Database['public']['Tables']['custom_question_responses']['Insert']>;
      };
      file_attachments: {
        Row: {
          id: string;
          doctor_id: string;
          patient_id: string | null;
          entity_type: AttachmentEntity;
          entity_id: string | null;
          question_response_id: string | null;
          field_name: string | null;
          storage_bucket: string;
          storage_path: string;
          original_filename: string | null;
          mime_type: string | null;
          size_bytes: number | null;
          created_at: string;
        };
        Insert: Omit<
          Database['public']['Tables']['file_attachments']['Row'],
          'id' | 'created_at'
        > & { id?: string };
        Update: Partial<Database['public']['Tables']['file_attachments']['Insert']>;
      };
      repertory_analyses: {
        Row: {
          id: string;
          doctor_id: string;
          patient_id: string | null;
          method: string;
          symptoms: string[];
          output: string;
          remedy_given: string | null;
          created_at: string;
        };
        Insert: Omit<Database['public']['Tables']['repertory_analyses']['Row'], 'id' | 'created_at'> & { id?: string };
        Update: Partial<Database['public']['Tables']['repertory_analyses']['Insert']>;
      };
      clinic_settings: {
        Row: {
          id: string;
          owner_id: string | null;
          clinic_name: string;
          doctor_name: string | null;
          qualifications: string | null;
          reg_no: string | null;
          speciality: string | null;
          address: string | null;
          city: string | null;
          pin_code: string | null;
          phone: string | null;
          email: string | null;
          consultation_fee: number | null;
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<
          Database['public']['Tables']['clinic_settings']['Row'],
          'id' | 'created_at' | 'updated_at'
        > & { id?: string };
        Update: Partial<Database['public']['Tables']['clinic_settings']['Insert']>;
      };
    };
    Views: Record<string, never>;
    Functions: {
      get_share_session: {
        Args: { p_token: string };
        Returns: Array<{
          id: string;
          doctor_id: string;
          patient_id: string | null;
          system_key: string | null;
          form_id: string | null;
          form_version_id: string | null;
          share_type: ShareType;
          related_id: string | null;
          expires_at: string | null;
          used_at: string | null;
        }>;
      };
      validate_share_token_id: {
        Args: { p_token_id: string };
        Returns: boolean;
      };
    };
    Enums: {
      gender_enum: Gender;
      severity_enum: Severity;
      submission_source_enum: SubmissionSource;
      appt_type_enum: AppointmentType;
      appt_status_enum: AppointmentStatus;
      followup_response_enum: FollowUpResponse;
      payment_mode_enum: PaymentMode;
      payment_status_enum: PaymentStatus;
      potency_enum: Potency;
      medicine_form_enum: MedicineForm;
      medicine_frequency_enum: MedicineFrequency;
      allo_type_enum: AlloType;
      allo_frequency_enum: AlloFrequency;
      allo_timing_enum: AlloTiming;
      conversation_status_enum: ConversationStatus;
      message_sender_enum: MessageSender;
      question_type_enum: QuestionType;
      response_status_enum: ResponseStatus;
      doctor_role_enum: DoctorRole;
      share_type_enum: ShareType;
      attachment_entity_enum: AttachmentEntity;
    };
  };
}

export type Tables<T extends keyof Database['public']['Tables']> =
  Database['public']['Tables'][T]['Row'];
export type Inserts<T extends keyof Database['public']['Tables']> =
  Database['public']['Tables'][T]['Insert'];
export type Updates<T extends keyof Database['public']['Tables']> =
  Database['public']['Tables'][T]['Update'];