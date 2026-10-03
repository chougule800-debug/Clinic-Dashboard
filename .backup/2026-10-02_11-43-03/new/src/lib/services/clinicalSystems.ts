import { supabase } from '../supabase';
import { handle } from './base';
import type { Tables } from '../database.types';

export type ClinicalSystemRow = Tables<'clinical_systems'>;

export const clinicalSystemService = {
  async list(): Promise<ClinicalSystemRow[]> {
    const { data, error } = await supabase
      .from('clinical_systems')
      .select('*')
      .eq('is_active', true)
      .order('display_order', { ascending: true });
    return handle(data ?? [], error, 'Fetch clinical systems') ?? [];
  },

  async getByKey(key: string): Promise<ClinicalSystemRow | null> {
    const { data, error } = await supabase
      .from('clinical_systems')
      .select('*')
      .eq('key', key)
      .maybeSingle();
    if (error) return null;
    return (data as ClinicalSystemRow) ?? null;
  }
};