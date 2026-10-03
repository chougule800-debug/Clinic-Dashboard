import { supabase } from '../supabase';
import { handle, requireUser, ServiceError } from './base';
import type {
  Tables,
  Inserts,
  QuestionType
} from '../database.types';

export type CustomFormRow = Tables<'custom_forms'>;
export type CustomFormVersionRow = Tables<'custom_form_versions'>;
export type CustomQuestionRow = Tables<'custom_questions'>;
export type CustomQuestionOptionRow = Tables<'custom_question_options'>;

export interface QuestionDraft {
  id?: string;
  questionType: QuestionType;
  label: string;
  helpText?: string;
  isRequired?: boolean;
  config?: Record<string, unknown>;
  options?: { id?: string; label: string }[];
}

export interface CustomFormWithLatest extends CustomFormRow {
  latest_version: {
    id: string;
    version_number: number;
    is_published: boolean;
    questions: (CustomQuestionRow & { options: CustomQuestionOptionRow[] })[];
  } | null;
}

export const customFormService = {
  async listForDoctor(
    doctorId: string | null | undefined,
    systemKey?: string
  ): Promise<CustomFormRow[]> {
    requireUser(doctorId, 'list custom forms');
    let q = supabase
      .from('custom_forms')
      .select('*')
      .eq('doctor_id', doctorId!)
      .eq('is_active', true)
      .order('updated_at', { ascending: false });
    if (systemKey) q = q.eq('system_key', systemKey);
    const { data, error } = await q;
    return handle(data ?? [], error, 'Fetch custom forms') ?? [];
  },

  async getWithLatestVersion(formId: string): Promise<CustomFormWithLatest | null> {
    const { data: form, error: formErr } = await supabase
      .from('custom_forms')
      .select('*')
      .eq('id', formId)
      .maybeSingle();
    if (formErr || !form) return null;

    const { data: versions, error: verErr } = await supabase
      .from('custom_form_versions')
      .select('*')
      .eq('form_id', formId)
      .order('version_number', { ascending: false })
      .limit(1);
    if (verErr || !versions || versions.length === 0) {
      return { ...(form as CustomFormRow), latest_version: null };
    }
    const version = versions[0];

    const { data: questions, error: qErr } = await supabase
      .from('custom_questions')
      .select('*')
      .eq('version_id', version.id)
      .order('display_order', { ascending: true });

    if (qErr) handle(null, qErr, 'Fetch custom questions');

    const questionIds = (questions ?? []).map(q => q.id);
    let options: CustomQuestionOptionRow[] = [];
    if (questionIds.length > 0) {
      const { data: optData, error: optErr } = await supabase
        .from('custom_question_options')
        .select('*')
        .in('question_id', questionIds)
        .order('display_order', { ascending: true });
      if (optErr) handle(null, optErr, 'Fetch question options');
      options = optData ?? [];
    }

    const questionsWithOptions = (questions ?? []).map(q => ({
      ...q,
      options: options.filter(o => o.question_id === q.id)
    }));

    return {
      ...(form as CustomFormRow),
      latest_version: {
        id: version.id,
        version_number: version.version_number,
        is_published: version.is_published,
        questions: questionsWithOptions
      }
    };
  },

  async getVersionWithQuestions(versionId: string): Promise<{
    version: CustomFormVersionRow;
    form: CustomFormRow;
    questions: (CustomQuestionRow & { options: CustomQuestionOptionRow[] })[];
  } | null> {
    const { data: version, error: verErr } = await supabase
      .from('custom_form_versions')
      .select('*')
      .eq('id', versionId)
      .maybeSingle();
    if (verErr || !version) return null;

    const { data: form, error: formErr } = await supabase
      .from('custom_forms')
      .select('*')
      .eq('id', version.form_id)
      .maybeSingle();
    if (formErr || !form) return null;

    const { data: questions, error: qErr } = await supabase
      .from('custom_questions')
      .select('*')
      .eq('version_id', versionId)
      .order('display_order', { ascending: true });
    if (qErr) handle(null, qErr, 'Fetch version questions');

    const questionIds = (questions ?? []).map(q => q.id);
    let options: CustomQuestionOptionRow[] = [];
    if (questionIds.length > 0) {
      const { data: optData, error: optErr } = await supabase
        .from('custom_question_options')
        .select('*')
        .in('question_id', questionIds)
        .order('display_order', { ascending: true });
      if (optErr) handle(null, optErr, 'Fetch version question options');
      options = optData ?? [];
    }

    return {
      version: version as CustomFormVersionRow,
      form: form as CustomFormRow,
      questions: (questions ?? []).map(q => ({
        ...q,
        options: options.filter(o => o.question_id === q.id)
      }))
    };
  },

  async saveFormWithQuestions(
    doctorId: string | null | undefined,
    input: {
      formId?: string;
      systemKey: string;
      title: string;
      description?: string;
      questions: QuestionDraft[];
      publish?: boolean;
    }
  ): Promise<{ form: CustomFormRow; version: CustomFormVersionRow }> {
    requireUser(doctorId, 'save custom form');

    let formId = input.formId;
    const formPayload: Inserts<'custom_forms'> = {
      doctor_id: doctorId!,
      system_key: input.systemKey,
      title: input.title,
      description: input.description ?? null,
      is_active: true
    };

    if (formId) {
      const { error } = await supabase
        .from('custom_forms')
        .update({
          title: formPayload.title,
          description: formPayload.description,
          system_key: formPayload.system_key
        })
        .eq('id', formId)
        .eq('doctor_id', doctorId!);
      if (error) handle(null, error, 'Update custom form');
    } else {
      const { data, error } = await supabase
        .from('custom_forms')
        .insert(formPayload)
        .select('*')
        .single();
      if (error || !data) throw new ServiceError('Create custom form failed', error);
      formId = data.id;
    }

    // Find latest version number
    const { data: existingVersions } = await supabase
      .from('custom_form_versions')
      .select('version_number')
      .eq('form_id', formId)
      .order('version_number', { ascending: false })
      .limit(1);
    const nextVersion = (existingVersions?.[0]?.version_number ?? 0) + 1;

    const { data: version, error: verErr } = await supabase
      .from('custom_form_versions')
      .insert({
        form_id: formId,
        version_number: nextVersion,
        is_published: input.publish ?? true
      })
      .select('*')
      .single();
    if (verErr || !version) throw new ServiceError('Create form version failed', verErr);

    if (input.questions.length > 0) {
      const questionRows: Inserts<'custom_questions'>[] = input.questions.map((q, idx) => ({
        version_id: version.id,
        question_type: q.questionType,
        label: q.label,
        help_text: q.helpText ?? null,
        is_required: q.isRequired ?? false,
        display_order: idx,
        config: (q.config ?? {}) as never
      }));

      const { data: insertedQuestions, error: qErr } = await supabase
        .from('custom_questions')
        .insert(questionRows)
        .select('id');
      if (qErr || !insertedQuestions) throw new ServiceError('Create questions failed', qErr);

      const optionRows: Inserts<'custom_question_options'>[] = [];
      input.questions.forEach((q, idx) => {
        const insertedId = insertedQuestions[idx]?.id;
        if (!insertedId || !q.options || q.options.length === 0) return;
        q.options.forEach((opt, optIdx) => {
          optionRows.push({
            question_id: insertedId,
            label: opt.label,
            display_order: optIdx
          });
        });
      });

      if (optionRows.length > 0) {
        const { error: optErr } = await supabase
          .from('custom_question_options')
          .insert(optionRows);
        if (optErr) handle(null, optErr, 'Create question options');
      }
    }

    const { data: formData } = await supabase
      .from('custom_forms')
      .select('*')
      .eq('id', formId)
      .single();

    return {
      form: formData as CustomFormRow,
      version: version as CustomFormVersionRow
    };
  },

  async remove(formId: string, doctorId: string | null | undefined): Promise<void> {
    requireUser(doctorId, 'delete custom form');
    const { error } = await supabase
      .from('custom_forms')
      .delete()
      .eq('id', formId)
      .eq('doctor_id', doctorId!);
    if (error) handle(null, error, 'Delete custom form');
  }
};