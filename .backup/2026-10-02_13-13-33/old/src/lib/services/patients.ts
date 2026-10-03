import { supabase } from '../supabase';
import { handle, requireUser, ServiceError } from './base';
import type { Tables, Inserts, Updates, Gender } from '../database.types';

export type PatientRow = Tables<'patients'>;
export type PatientInsert = Inserts<'patients'>;
export type PatientUpdate = Updates<'patients'>;

export interface PatientCreateInput {
  name?: string;
  age?: number | null;
  gender?: Gender | null;
  mobile?: string | null;
  address?: string | null;
  abhaId?: string | null;
  abhaAddress?: string | null;
  dob?: string | null;
  email?: string | null;
  bloodGroup?: string | null;
  occupation?: string | null;
  emergencyContact?: string | null;
  bpSystolic?: number | null;
  bpDiastolic?: number | null;
  pulse?: number | null;
  temperature?: number | null;
  spo2?: number | null;
  weight?: number | null;
  heightInches?: number | null;
  bmi?: number | null;
  rbs?: number | null;
  respiratoryRate?: number | null;
  allergies?: string[];
  chronicDiseases?: string[];
}

const toRow = (doctorId: string, input: PatientCreateInput): PatientInsert => ({
  doctor_id: doctorId,
  name: input.name?.trim() || 'Unnamed Patient',
  age: input.age ?? null,
  gender: input.gender ?? null,
  mobile: input.mobile ?? null,
  address: input.address ?? null,
  abha_id: input.abhaId ?? null,
  abha_address: input.abhaAddress ?? null,
  dob: input.dob ?? null,
  email: input.email ?? null,
  blood_group: input.bloodGroup ?? null,
  occupation: input.occupation ?? null,
  emergency_contact: input.emergencyContact ?? null,
  bp_systolic: input.bpSystolic ?? null,
  bp_diastolic: input.bpDiastolic ?? null,
  pulse: input.pulse ?? null,
  temperature: input.temperature ?? null,
  spo2: input.spo2 ?? null,
  weight: input.weight ?? null,
  height_inches: input.heightInches ?? null,
  bmi: input.bmi ?? null,
  rbs: input.rbs ?? null,
  respiratory_rate: input.respiratoryRate ?? null,
  allergies: input.allergies ?? [],
  chronic_diseases: input.chronicDiseases ?? []
});

export const patientService = {
  async list(doctorId: string | null | undefined): Promise<PatientRow[]> {
    requireUser(doctorId, 'list patients');
    const { data, error } = await supabase
      .from('patients')
      .select('*')
      .eq('doctor_id', doctorId!)
      .order('created_at', { ascending: false });
    return handle(data ?? [], error, 'Fetch patients') ?? [];
  },

  async get(id: string): Promise<PatientRow | null> {
    const { data, error } = await supabase
      .from('patients')
      .select('*')
      .eq('id', id)
      .maybeSingle();
    if (error) handle(null, error, 'Fetch patient');
    return data ?? null;
  },

  async create(doctorId: string | null | undefined, input: PatientCreateInput): Promise<PatientRow> {
    requireUser(doctorId, 'create patient');
    const payload = toRow(doctorId!, input);
    const { data, error } = await supabase
      .from('patients')
      .insert(payload)
      .select('*')
      .single();
    if (error || !data) throw new ServiceError('Create patient failed', error);
    return data;
  },

  async update(
    id: string,
    doctorId: string | null | undefined,
    updates: PatientUpdate
  ): Promise<PatientRow> {
    requireUser(doctorId, 'update patient');
    const { data, error } = await supabase
      .from('patients')
      .update(updates)
      .eq('id', id)
      .eq('doctor_id', doctorId!)
      .select('*')
      .single();
    if (error || !data) throw new ServiceError('Update patient failed', error);
    return data;
  },

  async updateVitals(
    id: string,
    doctorId: string | null | undefined,
    vitals: Partial<{
      bpSystolic: number;
      bpDiastolic: number;
      pulse: number;
      temperature: number;
      spo2: number;
      weight: number;
      heightInches: number;
      bmi: number;
      rbs: number;
      respiratoryRate: number;
    }>,
    age?: number
  ): Promise<void> {
    requireUser(doctorId, 'update vitals');
    const updates: PatientUpdate = {};
    if (vitals.bpSystolic !== undefined) updates.bp_systolic = vitals.bpSystolic;
    if (vitals.bpDiastolic !== undefined) updates.bp_diastolic = vitals.bpDiastolic;
    if (vitals.pulse !== undefined) updates.pulse = vitals.pulse;
    if (vitals.temperature !== undefined) updates.temperature = vitals.temperature;
    if (vitals.spo2 !== undefined) updates.spo2 = vitals.spo2;
    if (vitals.weight !== undefined) updates.weight = vitals.weight;
    if (vitals.heightInches !== undefined) updates.height_inches = vitals.heightInches;
    if (vitals.bmi !== undefined) updates.bmi = vitals.bmi;
    if (vitals.rbs !== undefined) updates.rbs = vitals.rbs;
    if (vitals.respiratoryRate !== undefined) updates.respiratory_rate = vitals.respiratoryRate;
    if (typeof age === 'number' && !Number.isNaN(age)) updates.age = age;

    if (Object.keys(updates).length === 0) return;

    const { error } = await supabase
      .from('patients')
      .update(updates)
      .eq('id', id)
      .eq('doctor_id', doctorId!);
    if (error) handle(null, error, 'Update vitals');
  },

  async remove(id: string, doctorId: string | null | undefined): Promise<void> {
    requireUser(doctorId, 'delete patient');
    const { error } = await supabase
      .from('patients')
      .delete()
      .eq('id', id)
      .eq('doctor_id', doctorId!);
    if (error) handle(null, error, 'Delete patient');
  },

  async search(doctorId: string | null | undefined, query: string): Promise<PatientRow[]> {
    requireUser(doctorId, 'search patients');
    const trimmed = query.trim();
    if (!trimmed) return this.list(doctorId);
    const pattern = `%${trimmed}%`;
    const { data, error } = await supabase
      .from('patients')
      .select('*')
      .eq('doctor_id', doctorId!)
      .or(`name.ilike.${pattern},mobile.ilike.${pattern},patient_code.ilike.${pattern}`)
      .order('created_at', { ascending: false })
      .limit(25);
    return handle(data ?? [], error, 'Search patients') ?? [];
  }
};