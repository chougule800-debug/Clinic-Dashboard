import { supabase } from '../supabase';
import { handle, ServiceError } from './base';
import type {
  Tables,
  Inserts,
  QuestionType
} from '../database.types';

export type CustomFormResponseRow = Tables<'custom_form_responses'>;
export type CustomQuestionResponseRow = Tables<'custom_question_responses'>;

export interface CustomQuestionResponseInput {
  questionId: string;
  questionLabel?: string;
  questionType?: QuestionType;
  textValue?: string | null;
  numericValue?: number | null;
  dateValue?: string | null;
  timeValue?: string | null;
  booleanValue?: boolean | null;
  selectedOptions?: unknown;
}

export const customResponseService = {
  async listForDoctor(
    doctorId: string | null | undefined,
    filter?: { patientId?: string; systemKey?: string }
  ): Promise<CustomFormResponseRow[]> {
    let q = supabase
      .from('custom_form_responses')
      .select('*')
      .eq('doctor_id', doctorId!)
      .order('submitted_at', { ascending: false });
    if (filter?.patientId) q = q.eq('patient_id', filter.patientId);
    if (filter?.systemKey) q = q.eq('system_key', filter.systemKey);
    const { data, error } = await q;
    return handle(data ?? [], error, 'Fetch custom responses') ?? [];
  },

  async getWithAnswers(responseId: string): Promise<{
    response: CustomFormResponseRow;
    answers: CustomQuestionResponseRow[];
  } | null> {
    const { data: response, error: rErr } = await supabase
      .from('custom_form_responses')
      .select('*')
      .eq('id', responseId)
      .maybeSingle();
    if (rErr || !response) return null;

    const { data: answers, error: aErr } = await supabase
      .from('custom_question_responses')
      .select('*')
      .eq('response_id', responseId);
    if (aErr) handle(null, aErr, 'Fetch answers');

    return {
      response: response as CustomFormResponseRow,
      answers: answers ?? []
    };
  },

  async submitPublic(input: {
    shareTokenId: string;
    formId: string;
    formVersionId: string;
    patientId?: string | null;
    systemKey?: string | null;
    answers: CustomQuestionResponseInput[];
  }): Promise<CustomFormResponseRow> {
    // Resolve doctor_id via the SECURITY DEFINER function
    const { data: sessionArr, error: sErr } = await supabase
      .rpc('validate_share_token_id', { p_token_id: input.shareTokenId });
    if (sErr || sessionArr === false) {
      throw new ServiceError('Invalid or expired share token');
    }

    // Fetch doctor_id from the token row via get_share_session (by token id won't work directly),
    // so insert with a small RPC-free approach: use related share_tokens.doctor_id.
    // For security, we can call get_share_session with the token string, but here we only have id.
    // We'll query the token table limited by validate function using a SECURITY DEFINER select.

    // Fallback: use service-side select (RLS on share_tokens lets anon only select via function).
    // But we can use the get_share_session RPC with the token string. Caller must supply token string.
    // We expect caller to also pass shareTokenString.
    const shareTokenString = (input as unknown as { shareTokenString?: string }).shareTokenString;
    if (!shareTokenString) throw new ServiceError('Missing share token string');

    const { data: session2, error: s2Err } = await supabase
      .rpc('get_share_session', { p_token: shareTokenString });
    if (s2Err || !session2 || session2.length === 0) {
      throw new ServiceError('Share token not resolvable');
    }
    const tokenRow = session2[0];

    const responsePayload: Inserts<'custom_form_responses'> = {
      form_id: input.formId,
      form_version_id: input.formVersionId,
      doctor_id: tokenRow.doctor_id,
      patient_id: input.patientId ?? tokenRow.patient_id,
      share_token_id: tokenRow.id,
      system_key: input.systemKey ?? tokenRow.system_key,
      status: 'submitted',
      submitted_at: new Date().toISOString()
    };

    const { data: response, error: rErr } = await supabase
      .from('custom_form_responses')
      .insert(responsePayload)
      .select('*')
      .single();
    if (rErr || !response) throw new ServiceError('Submit response failed', rErr);

    if (input.answers.length > 0) {
      const rows: Inserts<'custom_question_responses'>[] = input.answers.map(a => ({
        response_id: response.id,
        question_id: a.questionId,
        question_label: a.questionLabel ?? null,
        question_type: a.questionType ?? null,
        text_value: a.textValue ?? null,
        numeric_value: a.numericValue ?? null,
        date_value: a.dateValue ?? null,
        time_value: a.timeValue ?? null,
        boolean_value: a.booleanValue ?? null,
        selected_options: (a.selectedOptions ?? null) as never
      }));
      const { error: aErr } = await supabase
        .from('custom_question_responses')
        .insert(rows);
      if (aErr) handle(null, aErr, 'Submit answers');
    }

    return response as CustomFormResponseRow;
  },

  async remove(responseId: string, doctorId: string | null | undefined): Promise<void> {
    const { error } = await supabase
      .from('custom_form_responses')
      .delete()
      .eq('id', responseId)
      .eq('doctor_id', doctorId!);
    if (error) handle(null, error, 'Delete response');
  }
};