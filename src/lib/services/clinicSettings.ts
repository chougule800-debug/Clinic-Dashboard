import { supabase } from '../supabase';
import { handle, ServiceError } from './base';
import type { Tables, Inserts, Updates } from '../database.types';

export type ClinicSettingsRow = Tables<'clinic_settings'>;

export const clinicSettingsService = {
  async get(): Promise<ClinicSettingsRow | null> {
    const { data, error } = await supabase
      .from('clinic_settings')
      .select('*')
      .order('created_at', { ascending: true })
      .limit(1);
    if (error) {
      console.warn('[clinicSettingsService.get]', error);
      return null;
    }
    return (data?.[0] as ClinicSettingsRow) ?? null;
  },

  async save(
    ownerId: string | null | undefined,
    input: Partial<Omit<ClinicSettingsRow, 'id' | 'created_at' | 'updated_at'>> & {
      id?: string;
    }
  ): Promise<ClinicSettingsRow> {
    if (!ownerId) throw new ServiceError('Not authenticated: cannot save clinic settings');

    let existingId = input.id;
    if (!existingId) {
      const existing = await this.get();
      existingId = existing?.id;
    }

    const payload: Inserts<'clinic_settings'> = {
      owner_id: ownerId,
      clinic_name: input.clinic_name ?? 'Clinic',
      doctor_name: input.doctor_name ?? null,
      qualifications: input.qualifications ?? null,
      reg_no: input.reg_no ?? null,
      speciality: input.speciality ?? null,
      address: input.address ?? null,
      city: input.city ?? null,
      pin_code: input.pin_code ?? null,
      phone: input.phone ?? null,
      email: input.email ?? null,
      consultation_fee: input.consultation_fee ?? null
    };

    if (existingId) {
      const updatePayload: Updates<'clinic_settings'> = payload;
      const { data, error } = await supabase
        .from('clinic_settings')
        .update(updatePayload)
        .eq('id', existingId)
        .select('*')
        .single();
      if (error || !data) throw new ServiceError('Update clinic settings failed', error);
      return data as ClinicSettingsRow;
    }

    const { data, error } = await supabase
      .from('clinic_settings')
      .insert(payload)
      .select('*')
      .single();
    if (error || !data) throw new ServiceError('Create clinic settings failed', error);
    return data as ClinicSettingsRow;
  }
};