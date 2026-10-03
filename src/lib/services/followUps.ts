import { supabase } from '../supabase';
import { handle, requireUser, ServiceError } from './base';
import type { Tables, Inserts, FollowUpResponse } from '../database.types';

export type FollowUpRow = Tables<'follow_ups'>;

export interface FollowUpCreateInput {
  patientId: string;
  date?: string;
  response: FollowUpResponse;
  subjectiveFeedback?: string;
  vitalsCheck?: {
    bpSystolic?: number;
    bpDiastolic?: number;
    pulse?: number;
    weight?: number;
    temperature?: number;
    spo2?: number;
  };
  remedyActionAssessment?: string;
  prescriptionAdjustment?: string;
  nextFollowUpDate?: string | null;
}

export const followUpService = {
  async list(doctorId: string | null | undefined): Promise<FollowUpRow[]> {
    requireUser(doctorId, 'list follow-ups');
    const { data, error } = await supabase
      .from('follow_ups')
      .select('*')
      .eq('doctor_id', doctorId!)
      .order('date', { ascending: false });
    return handle(data ?? [], error, 'Fetch follow-ups') ?? [];
  },

  async listForPatient(
    doctorId: string | null | undefined,
    patientId: string
  ): Promise<FollowUpRow[]> {
    requireUser(doctorId, 'list patient follow-ups');
    const { data, error } = await supabase
      .from('follow_ups')
      .select('*')
      .eq('doctor_id', doctorId!)
      .eq('patient_id', patientId)
      .order('date', { ascending: false });
    return handle(data ?? [], error, 'Fetch patient follow-ups') ?? [];
  },

  async create(
    doctorId: string | null | undefined,
    input: FollowUpCreateInput
  ): Promise<FollowUpRow> {
    requireUser(doctorId, 'create follow-up');
    const payload: Inserts<'follow_ups'> = {
      doctor_id: doctorId!,
      patient_id: input.patientId,
      date: input.date ?? new Date().toISOString().slice(0, 10),
      response: input.response,
      subjective_feedback: input.subjectiveFeedback ?? null,
      vitals_check: (input.vitalsCheck ?? {}) as never,
      remedy_action_assessment: input.remedyActionAssessment ?? null,
      prescription_adjustment: input.prescriptionAdjustment ?? null,
      next_follow_up_date: input.nextFollowUpDate ?? null
    };
    const { data, error } = await supabase
      .from('follow_ups')
      .insert(payload)
      .select('*')
      .single();
    if (error || !data) throw new ServiceError('Create follow-up failed', error);
    return data;
  },

  async remove(id: string, doctorId: string | null | undefined): Promise<void> {
    requireUser(doctorId, 'delete follow-up');
    const { error } = await supabase
      .from('follow_ups')
      .delete()
      .eq('id', id)
      .eq('doctor_id', doctorId!);
    if (error) handle(null, error, 'Delete follow-up');
  }
};