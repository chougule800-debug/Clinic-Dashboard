import { supabase } from '../supabase';
import { handle, requireUser, ServiceError } from './base';
import type { Tables } from '../database.types';

export type RepertoryAnalysisRow = Tables<'repertory_analyses'>;

export const repertoryService = {
  async list(doctorId: string | null | undefined): Promise<RepertoryAnalysisRow[]> {
    requireUser(doctorId, 'list repertory analyses');
    const { data, error } = await supabase
      .from('repertory_analyses')
      .select('*')
      .eq('doctor_id', doctorId!)
      .order('created_at', { ascending: false });
    return handle(data ?? [], error, 'Fetch repertory analyses') ?? [];
  },

  async listForPatient(
    doctorId: string | null | undefined,
    patientId: string
  ): Promise<RepertoryAnalysisRow[]> {
    requireUser(doctorId, 'list patient repertory analyses');
    const { data, error } = await supabase
      .from('repertory_analyses')
      .select('*')
      .eq('doctor_id', doctorId!)
      .eq('patient_id', patientId)
      .order('created_at', { ascending: false });
    return handle(data ?? [], error, 'Fetch patient repertory analyses') ?? [];
  },

  async create(
    doctorId: string | null | undefined,
    input: {
      patientId?: string | null;
      method: string;
      symptoms: string[];
      output: string;
      remedyGiven?: string | null;
    }
  ): Promise<RepertoryAnalysisRow> {
    requireUser(doctorId, 'create repertory analysis');
    const { data, error } = await supabase
      .from('repertory_analyses')
      .insert({
        doctor_id: doctorId!,
        patient_id: input.patientId ?? null,
        method: input.method,
        symptoms: input.symptoms,
        output: input.output,
        remedy_given: input.remedyGiven ?? null
      })
      .select('*')
      .single();
    if (error || !data) throw new ServiceError('Create repertory analysis failed', error);
    return data as RepertoryAnalysisRow;
  },

  async update(
    id: string,
    doctorId: string | null | undefined,
    updates: { output?: string; remedyGiven?: string | null }
  ): Promise<void> {
    requireUser(doctorId, 'update repertory analysis');
    const payload: Record<string, unknown> = {};
    if (updates.output !== undefined) payload.output = updates.output;
    if (updates.remedyGiven !== undefined) payload.remedy_given = updates.remedyGiven;

    const { error } = await supabase
      .from('repertory_analyses')
      .update(payload)
      .eq('id', id)
      .eq('doctor_id', doctorId!);
    if (error) handle(null, error, 'Update repertory analysis');
  },

  async remove(id: string, doctorId: string | null | undefined): Promise<void> {
    requireUser(doctorId, 'delete repertory analysis');
    const { error } = await supabase
      .from('repertory_analyses')
      .delete()
      .eq('id', id)
      .eq('doctor_id', doctorId!);
    if (error) handle(null, error, 'Delete repertory analysis');
  }
};