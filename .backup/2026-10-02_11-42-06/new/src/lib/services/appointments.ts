import { supabase } from '../supabase';
import { handle, requireUser, ServiceError } from './base';
import type { Tables, Inserts, AppointmentStatus, AppointmentType } from '../database.types';

export type AppointmentRow = Tables<'appointments'>;

export interface AppointmentCreateInput {
  patientId: string;
  appointmentDate?: string;
  timeSlot: string;
  type: AppointmentType;
  status?: AppointmentStatus;
  notes?: string;
}

export const appointmentService = {
  async list(doctorId: string | null | undefined): Promise<AppointmentRow[]> {
    requireUser(doctorId, 'list appointments');
    const { data, error } = await supabase
      .from('appointments')
      .select('*')
      .eq('doctor_id', doctorId!)
      .order('appointment_date', { ascending: false });
    return handle(data ?? [], error, 'Fetch appointments') ?? [];
  },

  async listForDate(
    doctorId: string | null | undefined,
    date: string
  ): Promise<AppointmentRow[]> {
    requireUser(doctorId, 'list appointments for date');
    const { data, error } = await supabase
      .from('appointments')
      .select('*')
      .eq('doctor_id', doctorId!)
      .eq('appointment_date', date)
      .order('time_slot', { ascending: true });
    return handle(data ?? [], error, 'Fetch appointments by date') ?? [];
  },

  async create(
    doctorId: string | null | undefined,
    input: AppointmentCreateInput
  ): Promise<AppointmentRow> {
    requireUser(doctorId, 'create appointment');
    const payload: Inserts<'appointments'> = {
      doctor_id: doctorId!,
      patient_id: input.patientId,
      appointment_date: input.appointmentDate ?? new Date().toISOString().slice(0, 10),
      time_slot: input.timeSlot,
      type: input.type,
      status: input.status ?? 'Scheduled',
      notes: input.notes ?? null
    };
    const { data, error } = await supabase
      .from('appointments')
      .insert(payload)
      .select('*')
      .single();
    if (error || !data) throw new ServiceError('Create appointment failed', error);
    return data;
  },

  async updateStatus(
    id: string,
    doctorId: string | null | undefined,
    status: AppointmentStatus
  ): Promise<AppointmentRow> {
    requireUser(doctorId, 'update appointment status');
    const { data, error } = await supabase
      .from('appointments')
      .update({ status })
      .eq('id', id)
      .eq('doctor_id', doctorId!)
      .select('*')
      .single();
    if (error || !data) throw new ServiceError('Update appointment failed', error);
    return data;
  },

  async remove(id: string, doctorId: string | null | undefined): Promise<void> {
    requireUser(doctorId, 'delete appointment');
    const { error } = await supabase
      .from('appointments')
      .delete()
      .eq('id', id)
      .eq('doctor_id', doctorId!);
    if (error) handle(null, error, 'Delete appointment');
  }
};