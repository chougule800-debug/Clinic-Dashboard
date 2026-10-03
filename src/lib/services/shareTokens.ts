import { supabase } from '../supabase';
import { handle, requireUser, ServiceError, generateShareToken } from './base';
import type { Tables, Inserts, ShareType } from '../database.types';

export type ShareTokenRow = Tables<'share_tokens'>;

export interface ShareTokenCreateInput {
  patientId?: string | null;
  systemKey?: string | null;
  formId?: string | null;
  formVersionId?: string | null;
  shareType?: ShareType;
  relatedId?: string | null;
  expiresInDays?: number;
}

export const shareTokenService = {
  async create(
    doctorId: string | null | undefined,
    input: ShareTokenCreateInput
  ): Promise<ShareTokenRow> {
    requireUser(doctorId, 'create share token');
    const token = generateShareToken();
    const expiresAt = input.expiresInDays
      ? new Date(Date.now() + input.expiresInDays * 24 * 60 * 60 * 1000).toISOString()
      : null;

    const payload: Inserts<'share_tokens'> = {
      token,
      doctor_id: doctorId!,
      patient_id: input.patientId ?? null,
      system_key: input.systemKey ?? null,
      form_id: input.formId ?? null,
      form_version_id: input.formVersionId ?? null,
      share_type: input.shareType ?? 'intake',
      related_id: input.relatedId ?? null,
      expires_at: expiresAt
    };

    const { data, error } = await supabase
      .from('share_tokens')
      .insert(payload)
      .select('*')
      .single();
    if (error || !data) throw new ServiceError('Create share token failed', error);
    return data;
  },

  async resolveSession(token: string): Promise<{
    id: string;
    doctor_id: string;
    patient_id: string | null;
    system_key: string | null;
    form_id: string | null;
    form_version_id: string | null;
    share_type: ShareType;
    related_id: string | null;
  } | null> {
    const { data, error } = await supabase.rpc('get_share_session', { p_token: token });
    if (error) {
      console.warn('[shareTokens.resolveSession]', error);
      return null;
    }
    if (!data || data.length === 0) return null;
    return data[0];
  },

  async markUsed(id: string): Promise<void> {
    const { error } = await supabase
      .from('share_tokens')
      .update({ used_at: new Date().toISOString() })
      .eq('id', id);
    if (error) handle(null, error, 'Mark share token used');
  },

  async remove(id: string, doctorId: string | null | undefined): Promise<void> {
    requireUser(doctorId, 'delete share token');
    const { error } = await supabase
      .from('share_tokens')
      .delete()
      .eq('id', id)
      .eq('doctor_id', doctorId!);
    if (error) handle(null, error, 'Delete share token');
  }
};