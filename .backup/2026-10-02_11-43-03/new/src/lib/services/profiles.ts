import { supabase } from '../supabase';
import { handle, requireUser, ServiceError } from './base';
import type { Tables, Inserts, DoctorRole } from '../database.types';

export type ProfileRow = Tables<'profiles'>;

export const profileService = {
  async getCurrent(): Promise<ProfileRow | null> {
    const { data: userData } = await supabase.auth.getUser();
    if (!userData.user) return null;

    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userData.user.id)
      .maybeSingle();
    if (error) {
      console.warn('[profileService.getCurrent]', error);
      return null;
    }
    return (data as ProfileRow) ?? null;
  },

  async update(
    id: string,
    updates: Partial<{
      name: string;
      qualifications: string | null;
      reg_no: string | null;
      speciality: string | null;
      clinic_name: string | null;
      address: string | null;
      city: string | null;
      pin_code: string | null;
      phone: string | null;
      consultation_fee: number | null;
    }>
  ): Promise<ProfileRow> {
    requireUser(id, 'update profile');
    const { data, error } = await supabase
      .from('profiles')
      .update(updates)
      .eq('id', id)
      .select('*')
      .single();
    if (error || !data) throw new ServiceError('Update profile failed', error);
    return data as ProfileRow;
  },

  async listDoctors(ownerId: string | null | undefined): Promise<ProfileRow[]> {
    requireUser(ownerId, 'list doctors');
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .order('created_at', { ascending: false });
    return handle(data ?? [], error, 'Fetch doctor profiles') ?? [];
  },

  async setRole(id: string, role: DoctorRole): Promise<void> {
    const { error } = await supabase
      .from('profiles')
      .update({ role })
      .eq('id', id);
    if (error) handle(null, error, 'Set doctor role');
  }
};