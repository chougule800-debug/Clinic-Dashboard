import { supabase } from '../supabase';
import { handle, ServiceError } from './base';
import type { Tables, Inserts, QuestionType } from '../database.types';

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
    shareTokenString: string;
    formId: string;
    formVersionId: string;
    patientId?: string | null;
    systemKey?: string | null;
    answers: CustomQuestionResponseInput[];
  }): Promise<CustomFormResponseRow> {
    if (!input.shareTokenString) throw new ServiceError('Missing share token string');

    const { data: sessionArr, error: sErr } = await supabase.rpc('get_share_session', {
      p_token: input.shareTokenString
    });
    if (sErr || !sessionArr || sessionArr.length === 0) {
      throw new ServiceError('Share token not resolvable');
    }
    const tokenRow = sessionArr[0];

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

    return response as CustomFormResponseRow;
  },

  async addAnswer(input: {
    responseId: string;
    questionId: string;
    questionLabel?: string;
    questionType?: QuestionType;
    textValue?: string | null;
    numericValue?: number | null;
    dateValue?: string | null;
    timeValue?: string | null;
    booleanValue?: boolean | null;
    selectedOptions?: unknown;
  }): Promise<CustomQuestionResponseRow | null> {
    const { data, error } = await supabase
      .from('custom_question_responses')
      .insert({
        response_id: input.responseId,
        question_id: input.questionId,
        question_label: input.questionLabel ?? null,
        question_type: input.questionType ?? null,
        text_value: input.textValue ?? null,
        numeric_value: input.numericValue ?? null,
        date_value: input.dateValue ?? null,
        time_value: input.timeValue ?? null,
        boolean_value: input.booleanValue ?? null,
        selected_options: (input.selectedOptions ?? null) as never
      })
      .select('*')
      .single();
    if (error) {
      console.warn('[customResponseService.addAnswer]', error);
      return null;
    }
    return data as CustomQuestionResponseRow;
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