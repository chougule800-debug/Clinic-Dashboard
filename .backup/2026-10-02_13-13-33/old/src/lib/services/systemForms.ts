import { supabase } from '../supabase';
import { handle, requireUser, ServiceError } from './base';
import type { Tables, Inserts, SubmissionSource, Severity } from '../database.types';

export type SystemFormRow = Tables<'system_forms'>;

export interface SystemFormSaveInput {
  patientId: string;
  systemKey: string;
  data: Record<string, unknown>;
  chiefComplaints?: string;
  duration?: string;
  severity?: Severity;
  modalitiesAggravation?: string;
  modalitiesAmelioration?: string;
  concomitants?: string;
  clinicalNotes?: string;
  submittedVia?: SubmissionSource;
  shareTokenId?: string | null;
}

export const systemFormService = {
  async list(doctorId: string | null | undefined): Promise<SystemFormRow[]> {
    requireUser(doctorId, 'list system forms');
    const { data, error } = await supabase
      .from('system_forms')
      .select('*')
      .eq('doctor_id', doctorId!)
      .order('updated_at', { ascending: false });
    return handle(data ?? [], error, 'Fetch system forms') ?? [];
  },

  async listForPatient(
    doctorId: string | null | undefined,
    patientId: string
  ): Promise<SystemFormRow[]> {
    requireUser(doctorId, 'list patient system forms');
    const { data, error } = await supabase
      .from('system_forms')
      .select('*')
      .eq('doctor_id', doctorId!)
      .eq('patient_id', patientId)
      .order('updated_at', { ascending: false });
    return handle(data ?? [], error, 'Fetch patient system forms') ?? [];
  },

  async save(
    doctorId: string | null | undefined,
    input: SystemFormSaveInput
  ): Promise<SystemFormRow> {
    requireUser(doctorId, 'save system form');

    const payload: Inserts<'system_forms'> = {
      doctor_id: doctorId!,
      patient_id: input.patientId,
      system_key: input.systemKey,
      submitted_via: input.submittedVia ?? 'Doctor_Dashboard',
      share_token_id: input.shareTokenId ?? null,
      chief_complaints: input.chiefComplaints ?? null,
      duration: input.duration ?? null,
      severity: input.severity ?? null,
      modalities_aggravation: input.modalitiesAggravation ?? null,
      modalities_amelioration: input.modalitiesAmelioration ?? null,
      concomitants: input.concomitants ?? null,
      clinical_notes: input.clinicalNotes ?? null,
      data: input.data as never
    };

    // Upsert on (doctor_id, patient_id, system_key)
    const { data, error } = await supabase
      .from('system_forms')
      .upsert(payload, { onConflict: 'doctor_id,patient_id,system_key' })
      .select('*')
      .single();
    if (error || !data) throw new ServiceError('Save system form failed', error);
    return data;
  },

  async remove(id: string, doctorId: string | null | undefined): Promise<void> {
    requireUser(doctorId, 'delete system form');
    const { error } = await supabase
      .from('system_forms')
      .delete()
      .eq('id', id)
      .eq('doctor_id', doctorId!);
    if (error) handle(null, error, 'Delete system form');
  },

  async submitRemote(
    shareTokenId: string,
    input: {
      patientId: string;
      systemKey: string;
      data: Record<string, unknown>;
      chiefComplaints?: string;
      duration?: string;
      severity?: Severity;
      modalitiesAggravation?: string;
      modalitiesAmelioration?: string;
      concomitants?: string;
      clinicalNotes?: string;
    }
  ): Promise<SystemFormRow> {
    // Fetch doctor_id from the share token via the SECURITY DEFINER function
    const { data: session, error: sessionError } = await supabase
      .rpc('get_share_session', { p_token: shareTokenId });
    if (sessionError || !session || session.length === 0) {
      throw new ServiceError('Invalid or expired share token');
    }
    const token = session[0];

    const payload: Inserts<'system_forms'> = {
      doctor_id: token.doctor_id,
      patient_id: input.patientId,
      system_key: input.systemKey,
      submitted_via: 'WhatsApp_Remote_Intake',
      share_token_id: token.id,
      chief_complaints: input.chiefComplaints ?? null,
      duration: input.duration ?? null,
      severity: input.severity ?? null,
      modalities_aggravation: input.modalitiesAggravation ?? null,
      modalities_amelioration: input.modalitiesAmelioration ?? null,
      concomitants: input.concomitants ?? null,
      clinical_notes: input.clinicalNotes ?? null,
      data: input.data as never
    };

    const { data, error } = await supabase
      .from('system_forms')
      .upsert(payload, { onConflict: 'doctor_id,patient_id,system_key' })
      .select('*')
      .single();
    if (error || !data) throw new ServiceError('Submit remote form failed', error);
    return data;
  }
};