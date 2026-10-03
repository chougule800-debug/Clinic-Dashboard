-- =====================================================================
-- HOMEOPATHIC CLINIC - SUPABASE SCHEMA
-- =====================================================================
-- Complete schema for the multi-doctor homeopathy clinic application.
-- Includes: auth profiles, patients, system forms, prescriptions,
-- follow-ups, appointments, invoices, WhatsApp-style conversations,
-- custom doctor-authored forms (with full versioning), custom form
-- responses, file attachments, AI repertory analyses, clinic settings,
-- secure patient share tokens, Supabase Storage bucket, and Realtime.
-- =====================================================================

-- ---------------------------------------------------------------------
-- 1. EXTENSIONS
-- ---------------------------------------------------------------------
create extension if not exists "pgcrypto";
create extension if not exists "uuid-ossp";

-- ---------------------------------------------------------------------
-- 2. ENUMS (idempotent)
-- ---------------------------------------------------------------------
do $$ begin create type gender_enum as enum ('Male','Female','Other'); exception when duplicate_object then null; end $$;
do $$ begin create type severity_enum as enum ('Mild','Moderate','Severe'); exception when duplicate_object then null; end $$;
do $$ begin create type submission_source_enum as enum ('Doctor_Dashboard','WhatsApp_Remote_Intake','Patient_Portal'); exception when duplicate_object then null; end $$;
do $$ begin create type appt_type_enum as enum ('New Consultation','Follow-up','Report Review','Remote WhatsApp Consult'); exception when duplicate_object then null; end $$;
do $$ begin create type appt_status_enum as enum ('Scheduled','Waiting','In-Consultation','Completed','Cancelled'); exception when duplicate_object then null; end $$;
do $$ begin create type followup_response_enum as enum ('Marked Improvement','Moderate Improvement','Slight Improvement','Status Quo (Same)','Aggravation / Worse'); exception when duplicate_object then null; end $$;
do $$ begin create type payment_mode_enum as enum ('UPI','Cash','Card','Pending'); exception when duplicate_object then null; end $$;
do $$ begin create type payment_status_enum as enum ('Paid','Unpaid','Partial'); exception when duplicate_object then null; end $$;
do $$ begin create type potency_enum as enum ('6C','30C','200C','1M','10M','50M','CM','LM 1','LM 2','LM 3','Q (Mother Tincture)','3X','6X','12X'); exception when duplicate_object then null; end $$;
do $$ begin create type medicine_form_enum as enum ('Globules #30','Globules #40','Dilution Drops','Biochemic Tablets','Trituration Powder'); exception when duplicate_object then null; end $$;
do $$ begin create type medicine_frequency_enum as enum ('OD (Once Daily)','BD (Twice Daily)','TDS (Thrice Daily)','QID (Four Times Daily)','Weekly','Stat / SOS'); exception when duplicate_object then null; end $$;
do $$ begin create type allo_type_enum as enum ('Tablet','Capsule','Syrup','Ointment','Eye/Ear Drops','Inhaler'); exception when duplicate_object then null; end $$;
do $$ begin create type allo_frequency_enum as enum ('OD','BD','TDS','QID','SOS','HS'); exception when duplicate_object then null; end $$;
do $$ begin create type allo_timing_enum as enum ('Before Food','After Food','With Food','Empty Stomach'); exception when duplicate_object then null; end $$;
do $$ begin create type conversation_status_enum as enum ('Pending','In-Progress','Resolved'); exception when duplicate_object then null; end $$;
do $$ begin create type message_sender_enum as enum ('doctor','patient','system'); exception when duplicate_object then null; end $$;
do $$ begin create type question_type_enum as enum ('short_text','long_text','number','date','time','single_choice','multiple_choice','dropdown','yes_no','image_upload','multiple_image_upload','file_upload','section_text'); exception when duplicate_object then null; end $$;
do $$ begin create type response_status_enum as enum ('draft','submitted','reviewed'); exception when duplicate_object then null; end $$;
do $$ begin create type doctor_role_enum as enum ('owner','doctor'); exception when duplicate_object then null; end $$;
do $$ begin create type share_type_enum as enum ('intake','prescription','billing','custom_form'); exception when duplicate_object then null; end $$;
do $$ begin create type attachment_entity_enum as enum ('system_form','prescription','follow_up','custom_response','invoice'); exception when duplicate_object then null; end $$;

-- ---------------------------------------------------------------------
-- 3. HELPER FUNCTIONS
-- ---------------------------------------------------------------------
create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- ---------------------------------------------------------------------
-- 4. PROFILES (Doctors) — linked to auth.users
-- ---------------------------------------------------------------------
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text not null unique,
  name text not null default 'Doctor',
  qualifications text,
  reg_no text,
  speciality text,
  clinic_name text,
  address text,
  city text,
  pin_code text,
  phone text,
  role doctor_role_enum not null default 'doctor',
  consultation_fee integer default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_profiles_email on public.profiles(email);
create index if not exists idx_profiles_role on public.profiles(role);

drop trigger if exists trg_profiles_updated_at on public.profiles;
create trigger trg_profiles_updated_at
before update on public.profiles
for each row execute function public.set_updated_at();

-- ---------------------------------------------------------------------
-- 5. AUTO-CREATE PROFILE ON SIGNUP
-- ---------------------------------------------------------------------
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  v_name text;
  v_role doctor_role_enum;
begin
  v_name := coalesce(nullif(new.raw_user_meta_data->>'name',''),
                     split_part(new.email,'@',1));
  v_role := coalesce((new.raw_user_meta_data->>'role')::doctor_role_enum, 'doctor');

  insert into public.profiles (id, email, name, role)
  values (new.id, new.email, v_name, v_role)
  on conflict (id) do nothing;

  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
after insert on auth.users
for each row execute function public.handle_new_user();

-- ---------------------------------------------------------------------
-- 6. CLINICAL SYSTEMS (reference / configuration data)
-- ---------------------------------------------------------------------
create table if not exists public.clinical_systems (
  key text primary key,
  label text not null,
  description text,
  icon_name text,
  fields jsonb not null default '[]'::jsonb,
  display_order integer not null default 0,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

drop trigger if exists trg_clinical_systems_updated_at on public.clinical_systems;
create trigger trg_clinical_systems_updated_at
before update on public.clinical_systems
for each row execute function public.set_updated_at();

-- ---------------------------------------------------------------------
-- 7. PATIENTS
-- ---------------------------------------------------------------------
create table if not exists public.patients (
  id uuid primary key default gen_random_uuid(),
  doctor_id uuid not null references public.profiles(id) on delete cascade,
  patient_code text,
  abha_id text,
  abha_address text,
  name text not null,
  age integer,
  gender gender_enum,
  dob date,
  mobile text,
  email text,
  blood_group text,
  address text,
  occupation text,
  emergency_contact text,
  bp_systolic integer,
  bp_diastolic integer,
  pulse integer,
  temperature numeric,
  spo2 integer,
  weight numeric,
  height_inches numeric,
  bmi numeric,
  rbs integer,
  respiratory_rate integer,
  allergies text[] not null default '{}',
  chronic_diseases text[] not null default '{}',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint patients_code_unique_per_doctor unique (doctor_id, patient_code)
);

create index if not exists idx_patients_doctor on public.patients(doctor_id);
create index if not exists idx_patients_mobile on public.patients(mobile);
create index if not exists idx_patients_name_lower on public.patients(lower(name));
create index if not exists idx_patients_created on public.patients(created_at desc);

drop trigger if exists trg_patients_updated_at on public.patients;
create trigger trg_patients_updated_at
before update on public.patients
for each row execute function public.set_updated_at();

-- Per-doctor patient code counters
create table if not exists public.doctor_patient_counters (
  doctor_id uuid primary key references public.profiles(id) on delete cascade,
  last_number integer not null default 1000
);

create or replace function public.assign_patient_code()
returns trigger
language plpgsql
as $$
declare
  v_next integer;
begin
  if new.patient_code is null or new.patient_code = '' then
    insert into public.doctor_patient_counters (doctor_id, last_number)
    values (new.doctor_id, 1001)
    on conflict (doctor_id) do update
      set last_number = public.doctor_patient_counters.last_number + 1
    returning last_number into v_next;

    new.patient_code := 'PT-' || v_next::text;
  end if;
  return new;
end;
$$;

drop trigger if exists trg_assign_patient_code on public.patients;
create trigger trg_assign_patient_code
before insert on public.patients
for each row execute function public.assign_patient_code();

-- ---------------------------------------------------------------------
-- 8. SHARE TOKENS (secure patient portal sharing)
-- ---------------------------------------------------------------------
create table if not exists public.share_tokens (
  id uuid primary key default gen_random_uuid(),
  token text not null unique,
  doctor_id uuid not null references public.profiles(id) on delete cascade,
  patient_id uuid references public.patients(id) on delete cascade,
  system_key text references public.clinical_systems(key) on delete set null,
  form_id uuid,
  form_version_id uuid,
  share_type share_type_enum not null default 'intake',
  related_id uuid,
  expires_at timestamptz,
  used_at timestamptz,
  created_at timestamptz not null default now()
);

create index if not exists idx_share_tokens_token on public.share_tokens(token);
create index if not exists idx_share_tokens_doctor on public.share_tokens(doctor_id);
create index if not exists idx_share_tokens_patient on public.share_tokens(patient_id);

-- SECURITY DEFINER function for anonymous token resolution
create or replace function public.get_share_session(p_token text)
returns table (
  id uuid,
  doctor_id uuid,
  patient_id uuid,
  system_key text,
  form_id uuid,
  form_version_id uuid,
  share_type share_type_enum,
  related_id uuid,
  expires_at timestamptz,
  used_at timestamptz
)
language plpgsql
security definer
stable
set search_path = public
as $$
begin
  return query
  select st.id, st.doctor_id, st.patient_id, st.system_key, st.form_id,
         st.form_version_id, st.share_type, st.related_id,
         st.expires_at, st.used_at
  from public.share_tokens st
  where st.token = p_token
    and (st.expires_at is null or st.expires_at > now());
end;
$$;

create or replace function public.validate_share_token_id(p_token_id uuid)
returns boolean
language sql
security definer
stable
set search_path = public
as $$
  select exists (
    select 1 from public.share_tokens
    where id = p_token_id
      and (expires_at is null or expires_at > now())
  );
$$;

-- ---------------------------------------------------------------------
-- 9. SYSTEM FORMS (structured clinical case-taking)
-- ---------------------------------------------------------------------
create table if not exists public.system_forms (
  id uuid primary key default gen_random_uuid(),
  doctor_id uuid not null references public.profiles(id) on delete cascade,
  patient_id uuid not null references public.patients(id) on delete cascade,
  system_key text not null references public.clinical_systems(key) on delete restrict,
  submitted_via submission_source_enum not null default 'Doctor_Dashboard',
  share_token_id uuid references public.share_tokens(id) on delete set null,
  chief_complaints text,
  duration text,
  severity severity_enum,
  modalities_aggravation text,
  modalities_amelioration text,
  concomitants text,
  clinical_notes text,
  data jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint system_forms_unique_per_patient unique (doctor_id, patient_id, system_key)
);

create index if not exists idx_system_forms_doctor on public.system_forms(doctor_id);
create index if not exists idx_system_forms_patient on public.system_forms(patient_id);
create index if not exists idx_system_forms_system on public.system_forms(system_key);
create index if not exists idx_system_forms_updated on public.system_forms(updated_at desc);

drop trigger if exists trg_system_forms_updated_at on public.system_forms;
create trigger trg_system_forms_updated_at
before update on public.system_forms
for each row execute function public.set_updated_at();

-- ---------------------------------------------------------------------
-- 10. PRESCRIPTIONS
-- ---------------------------------------------------------------------
create table if not exists public.prescriptions (
  id uuid primary key default gen_random_uuid(),
  doctor_id uuid not null references public.profiles(id) on delete cascade,
  patient_id uuid not null references public.patients(id) on delete cascade,
  consultation_date date not null default current_date,
  diagnosis text,
  clinical_notes text,
  dietary_advice text[] not null default '{}',
  investigations_ordered text[] not null default '{}',
  follow_up_date date,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_prescriptions_doctor on public.prescriptions(doctor_id);
create index if not exists idx_prescriptions_patient on public.prescriptions(patient_id);
create index if not exists idx_prescriptions_consultation on public.prescriptions(consultation_date desc);

drop trigger if exists trg_prescriptions_updated_at on public.prescriptions;
create trigger trg_prescriptions_updated_at
before update on public.prescriptions
for each row execute function public.set_updated_at();

create table if not exists public.prescription_homeo_medicines (
  id uuid primary key default gen_random_uuid(),
  prescription_id uuid not null references public.prescriptions(id) on delete cascade,
  remedy text not null,
  potency potency_enum not null default '200C',
  form medicine_form_enum not null default 'Globules #30',
  dosage text,
  frequency medicine_frequency_enum not null default 'OD (Once Daily)',
  duration text,
  instructions text,
  display_order integer not null default 0,
  created_at timestamptz not null default now()
);

create index if not exists idx_rx_homeo_prescription on public.prescription_homeo_medicines(prescription_id);

create table if not exists public.prescription_allo_medicines (
  id uuid primary key default gen_random_uuid(),
  prescription_id uuid not null references public.prescriptions(id) on delete cascade,
  name text not null,
  type allo_type_enum not null default 'Tablet',
  strength text,
  frequency allo_frequency_enum not null default 'OD',
  timing allo_timing_enum not null default 'After Food',
  duration text,
  instructions text,
  display_order integer not null default 0,
  created_at timestamptz not null default now()
);

create index if not exists idx_rx_allo_prescription on public.prescription_allo_medicines(prescription_id);

-- ---------------------------------------------------------------------
-- 11. FOLLOW-UPS
-- ---------------------------------------------------------------------
create table if not exists public.follow_ups (
  id uuid primary key default gen_random_uuid(),
  doctor_id uuid not null references public.profiles(id) on delete cascade,
  patient_id uuid not null references public.patients(id) on delete cascade,
  date date not null default current_date,
  response followup_response_enum not null default 'Moderate Improvement',
  subjective_feedback text,
  vitals_check jsonb not null default '{}'::jsonb,
  remedy_action_assessment text,
  prescription_adjustment text,
  next_follow_up_date date,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_followups_doctor on public.follow_ups(doctor_id);
create index if not exists idx_followups_patient on public.follow_ups(patient_id);
create index if not exists idx_followups_date on public.follow_ups(date desc);

drop trigger if exists trg_followups_updated_at on public.follow_ups;
create trigger trg_followups_updated_at
before update on public.follow_ups
for each row execute function public.set_updated_at();

-- ---------------------------------------------------------------------
-- 12. APPOINTMENTS
-- ---------------------------------------------------------------------
create table if not exists public.appointments (
  id uuid primary key default gen_random_uuid(),
  doctor_id uuid not null references public.profiles(id) on delete cascade,
  patient_id uuid not null references public.patients(id) on delete cascade,
  appointment_date date not null default current_date,
  time_slot text not null default '10:00 AM',
  type appt_type_enum not null default 'New Consultation',
  status appt_status_enum not null default 'Scheduled',
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_appointments_doctor on public.appointments(doctor_id);
create index if not exists idx_appointments_patient on public.appointments(patient_id);
create index if not exists idx_appointments_date on public.appointments(appointment_date);
create index if not exists idx_appointments_status on public.appointments(status);

drop trigger if exists trg_appointments_updated_at on public.appointments;
create trigger trg_appointments_updated_at
before update on public.appointments
for each row execute function public.set_updated_at();

-- ---------------------------------------------------------------------
-- 13. INVOICES + ITEMS
-- ---------------------------------------------------------------------
create table if not exists public.invoices (
  id uuid primary key default gen_random_uuid(),
  doctor_id uuid not null references public.profiles(id) on delete cascade,
  patient_id uuid not null references public.patients(id) on delete cascade,
  invoice_number text not null,
  invoice_date date not null default current_date,
  consultation_fee numeric not null default 0,
  medicine_charges numeric not null default 0,
  discount numeric not null default 0,
  total_amount numeric not null default 0,
  payment_mode payment_mode_enum not null default 'Cash',
  status payment_status_enum not null default 'Paid',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint invoices_number_unique_per_doctor unique (doctor_id, invoice_number)
);

create index if not exists idx_invoices_doctor on public.invoices(doctor_id);
create index if not exists idx_invoices_patient on public.invoices(patient_id);
create index if not exists idx_invoices_date on public.invoices(invoice_date desc);

drop trigger if exists trg_invoices_updated_at on public.invoices;
create trigger trg_invoices_updated_at
before update on public.invoices
for each row execute function public.set_updated_at();

create table if not exists public.invoice_items (
  id uuid primary key default gen_random_uuid(),
  invoice_id uuid not null references public.invoices(id) on delete cascade,
  description text not null,
  amount numeric not null default 0,
  display_order integer not null default 0,
  created_at timestamptz not null default now()
);

create index if not exists idx_invoice_items_invoice on public.invoice_items(invoice_id);

-- ---------------------------------------------------------------------
-- 14. WHATSAPP CONVERSATIONS & MESSAGES
-- ---------------------------------------------------------------------
create table if not exists public.whatsapp_conversations (
  id uuid primary key default gen_random_uuid(),
  doctor_id uuid not null references public.profiles(id) on delete cascade,
  patient_id uuid references public.patients(id) on delete set null,
  patient_name text,
  phone text,
  category text not null default 'All',
  unread_count integer not null default 0,
  last_message text,
  last_message_time timestamptz not null default now(),
  status conversation_status_enum not null default 'Pending',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_wa_conv_doctor on public.whatsapp_conversations(doctor_id);
create index if not exists idx_wa_conv_patient on public.whatsapp_conversations(patient_id);
create index if not exists idx_wa_conv_last on public.whatsapp_conversations(last_message_time desc);

drop trigger if exists trg_wa_conv_updated_at on public.whatsapp_conversations;
create trigger trg_wa_conv_updated_at
before update on public.whatsapp_conversations
for each row execute function public.set_updated_at();

create table if not exists public.whatsapp_messages (
  id uuid primary key default gen_random_uuid(),
  conversation_id uuid not null references public.whatsapp_conversations(id) on delete cascade,
  doctor_id uuid not null references public.profiles(id) on delete cascade,
  sender message_sender_enum not null default 'doctor',
  text text not null,
  status text,
  link_data jsonb,
  created_at timestamptz not null default now()
);

create index if not exists idx_wa_msg_conversation on public.whatsapp_messages(conversation_id, created_at);
create index if not exists idx_wa_msg_doctor on public.whatsapp_messages(doctor_id);

-- ---------------------------------------------------------------------
-- 15. CUSTOM FORMS (Doctor-authored, per clinical system)
-- ---------------------------------------------------------------------
create table if not exists public.custom_forms (
  id uuid primary key default gen_random_uuid(),
  doctor_id uuid not null references public.profiles(id) on delete cascade,
  system_key text not null references public.clinical_systems(key) on delete cascade,
  title text not null,
  description text,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_custom_forms_doctor on public.custom_forms(doctor_id);
create index if not exists idx_custom_forms_system on public.custom_forms(doctor_id, system_key);

drop trigger if exists trg_custom_forms_updated_at on public.custom_forms;
create trigger trg_custom_forms_updated_at
before update on public.custom_forms
for each row execute function public.set_updated_at();

create table if not exists public.custom_form_versions (
  id uuid primary key default gen_random_uuid(),
  form_id uuid not null references public.custom_forms(id) on delete cascade,
  version_number integer not null,
  is_published boolean not null default false,
  created_at timestamptz not null default now(),
  constraint custom_form_versions_unique unique (form_id, version_number)
);

create index if not exists idx_custom_form_versions_form on public.custom_form_versions(form_id, version_number desc);

create table if not exists public.custom_questions (
  id uuid primary key default gen_random_uuid(),
  version_id uuid not null references public.custom_form_versions(id) on delete cascade,
  question_type question_type_enum not null default 'short_text',
  label text not null,
  help_text text,
  is_required boolean not null default false,
  display_order integer not null default 0,
  config jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create index if not exists idx_custom_questions_version on public.custom_questions(version_id, display_order);

create table if not exists public.custom_question_options (
  id uuid primary key default gen_random_uuid(),
  question_id uuid not null references public.custom_questions(id) on delete cascade,
  label text not null,
  display_order integer not null default 0,
  created_at timestamptz not null default now()
);

create index if not exists idx_custom_question_options_q on public.custom_question_options(question_id, display_order);

-- ---------------------------------------------------------------------
-- 16. CUSTOM FORM RESPONSES
-- ---------------------------------------------------------------------
create table if not exists public.custom_form_responses (
  id uuid primary key default gen_random_uuid(),
  form_id uuid references public.custom_forms(id) on delete set null,
  form_version_id uuid references public.custom_form_versions(id) on delete set null,
  doctor_id uuid not null references public.profiles(id) on delete cascade,
  patient_id uuid references public.patients(id) on delete set null,
  share_token_id uuid references public.share_tokens(id) on delete set null,
  system_key text references public.clinical_systems(key) on delete set null,
  status response_status_enum not null default 'submitted',
  submitted_at timestamptz not null default now(),
  created_at timestamptz not null default now()
);

create index if not exists idx_custom_resp_doctor on public.custom_form_responses(doctor_id);
create index if not exists idx_custom_resp_patient on public.custom_form_responses(patient_id);
create index if not exists idx_custom_resp_form on public.custom_form_responses(form_id);
create index if not exists idx_custom_resp_submitted on public.custom_form_responses(submitted_at desc);

create table if not exists public.custom_question_responses (
  id uuid primary key default gen_random_uuid(),
  response_id uuid not null references public.custom_form_responses(id) on delete cascade,
  question_id uuid references public.custom_questions(id) on delete set null,
  question_label text,
  question_type question_type_enum,
  text_value text,
  numeric_value numeric,
  date_value date,
  time_value time,
  boolean_value boolean,
  selected_options jsonb,
  created_at timestamptz not null default now()
);

create index if not exists idx_custom_q_resp_response on public.custom_question_responses(response_id);
create index if not exists idx_custom_q_resp_question on public.custom_question_responses(question_id);

-- ---------------------------------------------------------------------
-- 17. FILE ATTACHMENTS (metadata for Supabase Storage objects)
-- ---------------------------------------------------------------------
create table if not exists public.file_attachments (
  id uuid primary key default gen_random_uuid(),
  doctor_id uuid not null references public.profiles(id) on delete cascade,
  patient_id uuid references public.patients(id) on delete set null,
  entity_type attachment_entity_enum not null,
  entity_id uuid,
  question_response_id uuid references public.custom_question_responses(id) on delete cascade,
  field_name text,
  storage_bucket text not null default 'clinical-attachments',
  storage_path text not null,
  original_filename text,
  mime_type text,
  size_bytes bigint,
  created_at timestamptz not null default now()
);

create index if not exists idx_file_attachments_doctor on public.file_attachments(doctor_id);
create index if not exists idx_file_attachments_patient on public.file_attachments(patient_id);
create index if not exists idx_file_attachments_entity on public.file_attachments(entity_type, entity_id);
create index if not exists idx_file_attachments_q_resp on public.file_attachments(question_response_id);

-- ---------------------------------------------------------------------
-- 18. REPERTORY ANALYSES (AI-generated repertorization sessions)
-- ---------------------------------------------------------------------
create table if not exists public.repertory_analyses (
  id uuid primary key default gen_random_uuid(),
  doctor_id uuid not null references public.profiles(id) on delete cascade,
  patient_id uuid references public.patients(id) on delete cascade,
  method text not null,
  symptoms text[] not null default '{}',
  output text not null,
  remedy_given text,
  created_at timestamptz not null default now()
);

create index if not exists idx_repertory_analyses_doctor on public.repertory_analyses(doctor_id);
create index if not exists idx_repertory_analyses_patient on public.repertory_analyses(patient_id);
create index if not exists idx_repertory_analyses_created on public.repertory_analyses(created_at desc);

-- ---------------------------------------------------------------------
-- 19. CLINIC SETTINGS (single-row, editable by owner)
-- ---------------------------------------------------------------------
create table if not exists public.clinic_settings (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid references public.profiles(id) on delete set null,
  clinic_name text not null default 'Clinic',
  doctor_name text,
  qualifications text,
  reg_no text,
  speciality text,
  address text,
  city text,
  pin_code text,
  phone text,
  email text,
  consultation_fee integer default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

drop trigger if exists trg_clinic_settings_updated_at on public.clinic_settings;
create trigger trg_clinic_settings_updated_at
before update on public.clinic_settings
for each row execute function public.set_updated_at();

-- =====================================================================
-- ROW LEVEL SECURITY
-- =====================================================================
alter table public.profiles                    enable row level security;
alter table public.clinical_systems            enable row level security;
alter table public.patients                    enable row level security;
alter table public.doctor_patient_counters     enable row level security;
alter table public.share_tokens                enable row level security;
alter table public.system_forms                enable row level security;
alter table public.prescriptions               enable row level security;
alter table public.prescription_homeo_medicines enable row level security;
alter table public.prescription_allo_medicines enable row level security;
alter table public.follow_ups                  enable row level security;
alter table public.appointments                enable row level security;
alter table public.invoices                    enable row level security;
alter table public.invoice_items               enable row level security;
alter table public.whatsapp_conversations      enable row level security;
alter table public.whatsapp_messages           enable row level security;
alter table public.custom_forms                enable row level security;
alter table public.custom_form_versions        enable row level security;
alter table public.custom_questions            enable row level security;
alter table public.custom_question_options     enable row level security;
alter table public.custom_form_responses       enable row level security;
alter table public.custom_question_responses   enable row level security;
alter table public.file_attachments            enable row level security;
alter table public.repertory_analyses          enable row level security;
alter table public.clinic_settings             enable row level security;

-- -------------------- PROFILES --------------------
drop policy if exists profiles_self_select on public.profiles;
create policy profiles_self_select on public.profiles
  for select using (id = auth.uid());

drop policy if exists profiles_self_update on public.profiles;
create policy profiles_self_update on public.profiles
  for update using (id = auth.uid()) with check (id = auth.uid());

drop policy if exists profiles_owner_select_all on public.profiles;
create policy profiles_owner_select_all on public.profiles
  for select using (
    exists (select 1 from public.profiles p
            where p.id = auth.uid() and p.role = 'owner')
  );

drop policy if exists profiles_owner_manage on public.profiles;
create policy profiles_owner_manage on public.profiles
  for all using (
    exists (select 1 from public.profiles p
            where p.id = auth.uid() and p.role = 'owner')
  ) with check (
    exists (select 1 from public.profiles p
            where p.id = auth.uid() and p.role = 'owner')
  );

-- -------------------- CLINICAL SYSTEMS --------------------
drop policy if exists clinical_systems_read on public.clinical_systems;
create policy clinical_systems_read on public.clinical_systems
  for select using (auth.role() = 'authenticated' or auth.role() = 'anon');

drop policy if exists clinical_systems_owner_write on public.clinical_systems;
create policy clinical_systems_owner_write on public.clinical_systems
  for all using (
    exists (select 1 from public.profiles p
            where p.id = auth.uid() and p.role = 'owner')
  ) with check (
    exists (select 1 from public.profiles p
            where p.id = auth.uid() and p.role = 'owner')
  );

-- -------------------- PATIENTS --------------------
drop policy if exists patients_own_all on public.patients;
create policy patients_own_all on public.patients
  for all using (doctor_id = auth.uid()) with check (doctor_id = auth.uid());

-- -------------------- DOCTOR PATIENT COUNTERS --------------------
drop policy if exists doctor_counters_own on public.doctor_patient_counters;
create policy doctor_counters_own on public.doctor_patient_counters
  for all using (doctor_id = auth.uid()) with check (doctor_id = auth.uid());

-- -------------------- SHARE TOKENS --------------------
drop policy if exists share_tokens_own on public.share_tokens;
create policy share_tokens_own on public.share_tokens
  for all using (doctor_id = auth.uid()) with check (doctor_id = auth.uid());

-- -------------------- SYSTEM FORMS --------------------
drop policy if exists system_forms_own on public.system_forms;
create policy system_forms_own on public.system_forms
  for select using (doctor_id = auth.uid());

drop policy if exists system_forms_own_write on public.system_forms;
create policy system_forms_own_write on public.system_forms
  for insert with check (doctor_id = auth.uid());

drop policy if exists system_forms_own_update on public.system_forms;
create policy system_forms_own_update on public.system_forms
  for update using (doctor_id = auth.uid()) with check (doctor_id = auth.uid());

drop policy if exists system_forms_own_delete on public.system_forms;
create policy system_forms_own_delete on public.system_forms
  for delete using (doctor_id = auth.uid());

-- Public insert for remote intake via valid share token
drop policy if exists system_forms_public_insert on public.system_forms;
create policy system_forms_public_insert on public.system_forms
  for insert with check (
    submitted_via = 'WhatsApp_Remote_Intake'
    and share_token_id is not null
    and public.validate_share_token_id(share_token_id)
  );

-- -------------------- PRESCRIPTIONS --------------------
drop policy if exists prescriptions_own on public.prescriptions;
create policy prescriptions_own on public.prescriptions
  for all using (doctor_id = auth.uid()) with check (doctor_id = auth.uid());

drop policy if exists prescriptions_public_read on public.prescriptions;
create policy prescriptions_public_read on public.prescriptions
  for select using (
    exists (
      select 1 from public.share_tokens st
      where st.share_type = 'prescription'
        and st.related_id = prescriptions.id
        and (st.expires_at is null or st.expires_at > now())
    )
  );

drop policy if exists prescription_homeo_via_rx on public.prescription_homeo_medicines;
create policy prescription_homeo_via_rx on public.prescription_homeo_medicines
  for all using (
    exists (select 1 from public.prescriptions r
            where r.id = prescription_id and r.doctor_id = auth.uid())
  ) with check (
    exists (select 1 from public.prescriptions r
            where r.id = prescription_id and r.doctor_id = auth.uid())
  );

drop policy if exists prescription_homeo_public_read on public.prescription_homeo_medicines;
create policy prescription_homeo_public_read on public.prescription_homeo_medicines
  for select using (
    exists (
      select 1 from public.share_tokens st
      where st.share_type = 'prescription'
        and st.related_id = prescription_id
        and (st.expires_at is null or st.expires_at > now())
    )
  );

drop policy if exists prescription_allo_via_rx on public.prescription_allo_medicines;
create policy prescription_allo_via_rx on public.prescription_allo_medicines
  for all using (
    exists (select 1 from public.prescriptions r
            where r.id = prescription_id and r.doctor_id = auth.uid())
  ) with check (
    exists (select 1 from public.prescriptions r
            where r.id = prescription_id and r.doctor_id = auth.uid())
  );

drop policy if exists prescription_allo_public_read on public.prescription_allo_medicines;
create policy prescription_allo_public_read on public.prescription_allo_medicines
  for select using (
    exists (
      select 1 from public.share_tokens st
      where st.share_type = 'prescription'
        and st.related_id = prescription_id
        and (st.expires_at is null or st.expires_at > now())
    )
  );

-- -------------------- FOLLOW-UPS --------------------
drop policy if exists follow_ups_own on public.follow_ups;
create policy follow_ups_own on public.follow_ups
  for all using (doctor_id = auth.uid()) with check (doctor_id = auth.uid());

-- -------------------- APPOINTMENTS --------------------
drop policy if exists appointments_own on public.appointments;
create policy appointments_own on public.appointments
  for all using (doctor_id = auth.uid()) with check (doctor_id = auth.uid());

-- -------------------- INVOICES --------------------
drop policy if exists invoices_own on public.invoices;
create policy invoices_own on public.invoices
  for all using (doctor_id = auth.uid()) with check (doctor_id = auth.uid());

drop policy if exists invoices_public_read on public.invoices;
create policy invoices_public_read on public.invoices
  for select using (
    exists (
      select 1 from public.share_tokens st
      where st.share_type = 'billing'
        and st.related_id = invoices.id
        and (st.expires_at is null or st.expires_at > now())
    )
  );

drop policy if exists invoice_items_via_invoice on public.invoice_items;
create policy invoice_items_via_invoice on public.invoice_items
  for all using (
    exists (select 1 from public.invoices i
            where i.id = invoice_id and i.doctor_id = auth.uid())
  ) with check (
    exists (select 1 from public.invoices i
            where i.id = invoice_id and i.doctor_id = auth.uid())
  );

drop policy if exists invoice_items_public_read on public.invoice_items;
create policy invoice_items_public_read on public.invoice_items
  for select using (
    exists (
      select 1 from public.share_tokens st
      where st.share_type = 'billing'
        and st.related_id = invoice_id
        and (st.expires_at is null or st.expires_at > now())
    )
  );

-- -------------------- WHATSAPP --------------------
drop policy if exists wa_conv_own on public.whatsapp_conversations;
create policy wa_conv_own on public.whatsapp_conversations
  for all using (doctor_id = auth.uid()) with check (doctor_id = auth.uid());

drop policy if exists wa_msg_own on public.whatsapp_messages;
create policy wa_msg_own on public.whatsapp_messages
  for all using (doctor_id = auth.uid()) with check (doctor_id = auth.uid());

-- -------------------- CUSTOM FORMS --------------------
drop policy if exists custom_forms_own on public.custom_forms;
create policy custom_forms_own on public.custom_forms
  for all using (doctor_id = auth.uid()) with check (doctor_id = auth.uid());

drop policy if exists custom_forms_public_read on public.custom_forms;
create policy custom_forms_public_read on public.custom_forms
  for select using (
    exists (
      select 1 from public.share_tokens st
      where st.form_id = custom_forms.id
        and (st.expires_at is null or st.expires_at > now())
    )
  );

drop policy if exists custom_form_versions_own on public.custom_form_versions;
create policy custom_form_versions_own on public.custom_form_versions
  for all using (
    exists (select 1 from public.custom_forms f
            where f.id = form_id and f.doctor_id = auth.uid())
  ) with check (
    exists (select 1 from public.custom_forms f
            where f.id = form_id and f.doctor_id = auth.uid())
  );

drop policy if exists custom_form_versions_public_read on public.custom_form_versions;
create policy custom_form_versions_public_read on public.custom_form_versions
  for select using (
    exists (
      select 1 from public.share_tokens st
      where st.form_version_id = custom_form_versions.id
        and (st.expires_at is null or st.expires_at > now())
    )
  );

drop policy if exists custom_questions_own on public.custom_questions;
create policy custom_questions_own on public.custom_questions
  for all using (
    exists (
      select 1 from public.custom_form_versions v
      join public.custom_forms f on f.id = v.form_id
      where v.id = version_id and f.doctor_id = auth.uid()
    )
  ) with check (
    exists (
      select 1 from public.custom_form_versions v
      join public.custom_forms f on f.id = v.form_id
      where v.id = version_id and f.doctor_id = auth.uid()
    )
  );

drop policy if exists custom_questions_public_read on public.custom_questions;
create policy custom_questions_public_read on public.custom_questions
  for select using (
    exists (
      select 1 from public.share_tokens st
      where st.form_version_id = version_id
        and (st.expires_at is null or st.expires_at > now())
    )
  );

drop policy if exists custom_question_options_own on public.custom_question_options;
create policy custom_question_options_own on public.custom_question_options
  for all using (
    exists (
      select 1 from public.custom_questions q
      join public.custom_form_versions v on v.id = q.version_id
      join public.custom_forms f on f.id = v.form_id
      where q.id = question_id and f.doctor_id = auth.uid()
    )
  ) with check (
    exists (
      select 1 from public.custom_questions q
      join public.custom_form_versions v on v.id = q.version_id
      join public.custom_forms f on f.id = v.form_id
      where q.id = question_id and f.doctor_id = auth.uid()
    )
  );

drop policy if exists custom_question_options_public_read on public.custom_question_options;
create policy custom_question_options_public_read on public.custom_question_options
  for select using (
    exists (
      select 1 from public.custom_questions q
      join public.share_tokens st on st.form_version_id = q.version_id
      where q.id = question_id
        and (st.expires_at is null or st.expires_at > now())
    )
  );

-- -------------------- CUSTOM RESPONSES --------------------
drop policy if exists custom_form_responses_own on public.custom_form_responses;
create policy custom_form_responses_own on public.custom_form_responses
  for select using (doctor_id = auth.uid());

drop policy if exists custom_form_responses_own_update on public.custom_form_responses;
create policy custom_form_responses_own_update on public.custom_form_responses
  for update using (doctor_id = auth.uid()) with check (doctor_id = auth.uid());

drop policy if exists custom_form_responses_own_delete on public.custom_form_responses;
create policy custom_form_responses_own_delete on public.custom_form_responses
  for delete using (doctor_id = auth.uid());

drop policy if exists custom_form_responses_public_insert on public.custom_form_responses;
create policy custom_form_responses_public_insert on public.custom_form_responses
  for insert with check (
    share_token_id is not null
    and public.validate_share_token_id(share_token_id)
  );

drop policy if exists custom_q_responses_own on public.custom_question_responses;
create policy custom_q_responses_own on public.custom_question_responses
  for select using (
    exists (
      select 1 from public.custom_form_responses r
      where r.id = response_id and r.doctor_id = auth.uid()
    )
  );

drop policy if exists custom_q_responses_own_delete on public.custom_question_responses;
create policy custom_q_responses_own_delete on public.custom_question_responses
  for delete using (
    exists (
      select 1 from public.custom_form_responses r
      where r.id = response_id and r.doctor_id = auth.uid()
    )
  );

drop policy if exists custom_q_responses_public_insert on public.custom_question_responses;
create policy custom_q_responses_public_insert on public.custom_question_responses
  for insert with check (
    exists (
      select 1 from public.custom_form_responses r
      where r.id = response_id
        and r.share_token_id is not null
        and public.validate_share_token_id(r.share_token_id)
    )
  );

-- -------------------- FILE ATTACHMENTS --------------------
drop policy if exists file_attachments_own on public.file_attachments;
create policy file_attachments_own on public.file_attachments
  for select using (doctor_id = auth.uid());

drop policy if exists file_attachments_own_write on public.file_attachments;
create policy file_attachments_own_write on public.file_attachments
  for insert with check (doctor_id = auth.uid());

drop policy if exists file_attachments_own_delete on public.file_attachments;
create policy file_attachments_own_delete on public.file_attachments
  for delete using (doctor_id = auth.uid());

drop policy if exists file_attachments_public_insert on public.file_attachments;
create policy file_attachments_public_insert on public.file_attachments
  for insert with check (
    exists (
      select 1 from public.custom_form_responses r
      where r.id = entity_id
        and r.share_token_id is not null
        and public.validate_share_token_id(r.share_token_id)
    )
  );

-- -------------------- REPERTORY ANALYSES --------------------
drop policy if exists repertory_analyses_own on public.repertory_analyses;
create policy repertory_analyses_own on public.repertory_analyses
  for all using (doctor_id = auth.uid()) with check (doctor_id = auth.uid());

-- -------------------- CLINIC SETTINGS --------------------
drop policy if exists clinic_settings_read on public.clinic_settings;
create policy clinic_settings_read on public.clinic_settings
  for select using (auth.role() = 'authenticated' or auth.role() = 'anon');

drop policy if exists clinic_settings_owner_write on public.clinic_settings;
create policy clinic_settings_owner_write on public.clinic_settings
  for all using (
    exists (select 1 from public.profiles p
            where p.id = auth.uid() and p.role = 'owner')
  ) with check (
    exists (select 1 from public.profiles p
            where p.id = auth.uid() and p.role = 'owner')
  );

-- =====================================================================
-- STORAGE (bucket + policies)
-- =====================================================================
insert into storage.buckets (id, name, public)
values ('clinical-attachments', 'clinical-attachments', false)
on conflict (id) do nothing;

drop policy if exists storage_clinical_read on storage.objects;
create policy storage_clinical_read on storage.objects
  for select using (
    bucket_id = 'clinical-attachments'
    and (
      (storage.foldername(name))[1] = auth.uid()::text
      or exists (
        select 1 from public.share_tokens st
        where st.doctor_id = auth.uid()
          and (storage.foldername(name))[1] = 'share'
          and (storage.foldername(name))[2] = st.id::text
      )
    )
  );

drop policy if exists storage_clinical_insert_own on storage.objects;
create policy storage_clinical_insert_own on storage.objects
  for insert with check (
    bucket_id = 'clinical-attachments'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

drop policy if exists storage_clinical_delete_own on storage.objects;
create policy storage_clinical_delete_own on storage.objects
  for delete using (
    bucket_id = 'clinical-attachments'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

drop policy if exists storage_clinical_insert_public on storage.objects;
create policy storage_clinical_insert_public on storage.objects
  for insert with check (
    bucket_id = 'clinical-attachments'
    and (storage.foldername(name))[1] = 'share'
    and public.validate_share_token_id(((storage.foldername(name))[2])::uuid)
  );

-- =====================================================================
-- REALTIME PUBLICATION
-- =====================================================================
do $$
declare
  t text;
  tables text[] := array[
    'patients','system_forms','prescriptions','prescription_homeo_medicines',
    'prescription_allo_medicines','follow_ups','appointments','invoices',
    'invoice_items','whatsapp_conversations','whatsapp_messages',
    'custom_forms','custom_form_versions','custom_questions',
    'custom_question_options','custom_form_responses',
    'custom_question_responses','file_attachments','share_tokens',
    'repertory_analyses','clinic_settings','profiles'
  ];
begin
  foreach t in array tables loop
    begin
      execute format('alter publication supabase_realtime add table public.%I', t);
    exception when duplicate_object then null;
              when undefined_object then null;
    end;
  end loop;
end $$;

-- =====================================================================
-- REFERENCE SEED: Clinical Systems (metadata only; no patient data)
-- =====================================================================
insert into public.clinical_systems (key, label, description, icon_name, display_order, fields) values
('headache','Headache / Neurological','Headache location, sensations, sun/noise modalities, aura, vertigo, cranial nerves.','Brain',1,'[]'::jsonb),
('skin_hair','Skin & Hair','Lesions, eczema, psoriasis, itching modalities, discharge, alopecia, scalp conditions.','Sparkles',2,'[]'::jsonb),
('gastrointestinal','Gastrointestinal (GIT)','Appetite, thirst, cravings, aversions, acid reflux, bowel patterns, abdomen pain.','Utensils',3,'[]'::jsonb),
('urinary','Urinary System','Frequency, burning micturition, renal colic, stones, incontinence, sediment.','Droplet',4,'[]'::jsonb),
('musculoskeletal','Musculoskeletal + Spine','Joint pains, cervical/lumbar spine, arthritis, modalities of motion/rest/weather.','Activity',5,'[]'::jsonb),
('respiratory','Respiratory System','Cough, expectoration, asthma, dyspnea, wheezing, allergies, sinus, nasal polyp.','Wind',6,'[]'::jsonb),
('female_gynae','Female / Gynaecology','Menstrual cycles, LMP, flow, dysmenorrhea, leucorrhea, PCOD, menopausal symptoms.','HeartHandshake',7,'[]'::jsonb),
('pediatric','Pediatric Case Taking','Developmental milestones, dentition, birth history, behavioral temperament, head sweats.','Baby',8,'[]'::jsonb),
('other_mind_generals','Mind & Generals / Psycho-Somatic','Psycho-somatic mapping, emotional triggers, mind states, emotion-body sequence, Kent rubrics, sleep & generals.','Brain',9,'[]'::jsonb)
on conflict (key) do update set
  label = excluded.label,
  description = excluded.description,
  icon_name = excluded.icon_name,
  display_order = excluded.display_order;