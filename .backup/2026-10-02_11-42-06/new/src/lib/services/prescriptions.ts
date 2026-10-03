import { supabase } from '../supabase';
import { handle, requireUser, ServiceError } from './base';
import type {
  Tables,
  Inserts,
  Updates,
  Potency,
  MedicineForm,
  MedicineFrequency,
  AlloType,
  AlloFrequency,
  AlloTiming
} from '../database.types';

export type PrescriptionRow = Tables<'prescriptions'>;
export type HomeoMedicineRow = Tables<'prescription_homeo_medicines'>;
export type AlloMedicineRow = Tables<'prescription_allo_medicines'>;

export interface HomeoMedicineInput {
  remedy: string;
  potency: Potency;
  form: MedicineForm;
  dosage?: string;
  frequency: MedicineFrequency;
  duration?: string;
  instructions?: string;
}

export interface AlloMedicineInput {
  name: string;
  type: AlloType;
  strength?: string;
  frequency: AlloFrequency;
  timing: AlloTiming;
  duration?: string;
  instructions?: string;
}

export interface PrescriptionCreateInput {
  patientId: string;
  consultationDate?: string;
  diagnosis?: string;
  clinicalNotes?: string;
  dietaryAdvice?: string[];
  investigationsOrdered?: string[];
  followUpDate?: string | null;
  homeoMedicines?: HomeoMedicineInput[];
  alloMedicines?: AlloMedicineInput[];
}

export interface PrescriptionWithMedicines extends PrescriptionRow {
  prescription_homeo_medicines: HomeoMedicineRow[];
  prescription_allo_medicines: AlloMedicineRow[];
}

const rxSelect =
  '*, prescription_homeo_medicines(*), prescription_allo_medicines(*)';

export const prescriptionService = {
  async list(doctorId: string | null | undefined): Promise<PrescriptionWithMedicines[]> {
    requireUser(doctorId, 'list prescriptions');
    const { data, error } = await supabase
      .from('prescriptions')
      .select(rxSelect)
      .eq('doctor_id', doctorId!)
      .order('consultation_date', { ascending: false });
    return (handle(data ?? [], error, 'Fetch prescriptions') as PrescriptionWithMedicines[]) ?? [];
  },

  async listForPatient(
    doctorId: string | null | undefined,
    patientId: string
  ): Promise<PrescriptionWithMedicines[]> {
    requireUser(doctorId, 'list patient prescriptions');
    const { data, error } = await supabase
      .from('prescriptions')
      .select(rxSelect)
      .eq('doctor_id', doctorId!)
      .eq('patient_id', patientId)
      .order('consultation_date', { ascending: false });
    return (handle(data ?? [], error, 'Fetch patient prescriptions') as PrescriptionWithMedicines[]) ?? [];
  },

  async getByShareTokenId(tokenId: string): Promise<PrescriptionWithMedicines | null> {
    const { data: tokenRow, error: tokenError } = await supabase
      .from('share_tokens')
      .select('related_id')
      .eq('id', tokenId)
      .maybeSingle();
    if (tokenError || !tokenRow?.related_id) return null;

    const { data, error } = await supabase
      .from('prescriptions')
      .select(rxSelect)
      .eq('id', tokenRow.related_id)
      .maybeSingle();
    if (error) return null;
    return (data as PrescriptionWithMedicines) ?? null;
  },

  async save(
    doctorId: string | null | undefined,
    input: PrescriptionCreateInput & { id?: string }
  ): Promise<PrescriptionWithMedicines> {
    requireUser(doctorId, 'save prescription');

    const rxPayload: Inserts<'prescriptions'> = {
      doctor_id: doctorId!,
      patient_id: input.patientId,
      consultation_date: input.consultationDate ?? new Date().toISOString().slice(0, 10),
      diagnosis: input.diagnosis ?? null,
      clinical_notes: input.clinicalNotes ?? null,
      dietary_advice: input.dietaryAdvice ?? [],
      investigations_ordered: input.investigationsOrdered ?? [],
      follow_up_date: input.followUpDate ?? null
    };

    let rxId = input.id;
    if (rxId) {
      const { error } = await supabase
        .from('prescriptions')
        .update(rxPayload)
        .eq('id', rxId)
        .eq('doctor_id', doctorId!);
      if (error) handle(null, error, 'Update prescription');
      // Clear existing medicines to replace them
      await supabase.from('prescription_homeo_medicines').delete().eq('prescription_id', rxId);
      await supabase.from('prescription_allo_medicines').delete().eq('prescription_id', rxId);
    } else {
      const { data, error } = await supabase
        .from('prescriptions')
        .insert(rxPayload)
        .select('id')
        .single();
      if (error || !data) throw new ServiceError('Create prescription failed', error);
      rxId = data.id;
    }

    if (input.homeoMedicines && input.homeoMedicines.length > 0) {
      const rows: Inserts<'prescription_homeo_medicines'>[] = input.homeoMedicines.map((m, idx) => ({
        prescription_id: rxId!,
        remedy: m.remedy,
        potency: m.potency,
        form: m.form,
        dosage: m.dosage ?? null,
        frequency: m.frequency,
        duration: m.duration ?? null,
        instructions: m.instructions ?? null,
        display_order: idx
      }));
      const { error } = await supabase.from('prescription_homeo_medicines').insert(rows);
      if (error) handle(null, error, 'Insert homeo medicines');
    }

    if (input.alloMedicines && input.alloMedicines.length > 0) {
      const rows: Inserts<'prescription_allo_medicines'>[] = input.alloMedicines.map((m, idx) => ({
        prescription_id: rxId!,
        name: m.name,
        type: m.type,
        strength: m.strength ?? null,
        frequency: m.frequency,
        timing: m.timing,
        duration: m.duration ?? null,
        instructions: m.instructions ?? null,
        display_order: idx
      }));
      const { error } = await supabase.from('prescription_allo_medicines').insert(rows);
      if (error) handle(null, error, 'Insert allopathic medicines');
    }

    const { data, error } = await supabase
      .from('prescriptions')
      .select(rxSelect)
      .eq('id', rxId!)
      .single();
    if (error || !data) throw new ServiceError('Reload prescription failed', error);
    return data as PrescriptionWithMedicines;
  },

  async remove(id: string, doctorId: string | null | undefined): Promise<void> {
    requireUser(doctorId, 'delete prescription');
    const { error } = await supabase
      .from('prescriptions')
      .delete()
      .eq('id', id)
      .eq('doctor_id', doctorId!);
    if (error) handle(null, error, 'Delete prescription');
  }
};