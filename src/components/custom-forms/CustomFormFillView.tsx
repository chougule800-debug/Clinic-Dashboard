import React, { useEffect, useState } from 'react';
import { CLINIC_CONFIG } from '../../config/clinicConfig';
import { supabase } from '../../lib/supabase';
import { customFormService } from '../../lib/services/customForms';
import { customResponseService } from '../../lib/services/customResponses';
import { fileAttachmentService } from '../../lib/services/fileAttachments';
import { patientService, type PatientRow } from '../../lib/services/patients';
import type { QuestionType } from '../../types';
import {
  Loader2,
  AlertCircle,
  CheckCircle2,
  Upload,
  X,
  Send,
  ShieldCheck,
  MessageCircle,
  Stethoscope
} from 'lucide-react';

interface CustomFormFillViewProps {
  session: {
    id: string;
    doctor_id: string;
    patient_id: string | null;
    system_key: string | null;
    form_id: string | null;
    form_version_id: string | null;
    related_id: string | null;
  };
  token: string;
  onExit: () => void;
}

interface LoadedQuestion {
  id: string;
  questionType: QuestionType;
  label: string;
  helpText: string | null;
  isRequired: boolean;
  options: { id: string; label: string }[];
}

interface AnswerState {
  textValue?: string;
  numericValue?: number | null;
  dateValue?: string;
  timeValue?: string;
  booleanValue?: boolean;
  selectedOptions?: string[];
  files?: File[];
}

export const CustomFormFillView: React.FC<CustomFormFillViewProps> = ({ session, token, onExit }) => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [patient, setPatient] = useState<PatientRow | null>(null);
  const [formTitle, setFormTitle] = useState<string>('Case Form');
  const [formDescription, setFormDescription] = useState<string>('');
  const [questions, setQuestions] = useState<LoadedQuestion[]>([]);
  const [answers, setAnswers] = useState<Record<string, AnswerState>>({});
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      try {
        if (!session.form_version_id || !session.form_id) {
          setError('This custom form link is invalid.');
          setLoading(false);
          return;
        }

        const versionData = await customFormService.getVersionWithQuestions(session.form_version_id);
        if (cancelled) return;
        if (!versionData) {
          setError('Form not found or no longer available.');
          setLoading(false);
          return;
        }
        setFormTitle(versionData.form.title);
        setFormDescription(versionData.form.description ?? '');
        setQuestions(
          versionData.questions.map(q => ({
            id: q.id,
            questionType: q.question_type,
            label: q.label,
            helpText: q.help_text,
            isRequired: q.is_required,
            options: q.options.map(o => ({ id: o.id, label: o.label }))
          }))
        );

        if (session.patient_id) {
          const p = await patientService.get(session.patient_id);
          if (!cancelled) setPatient(p);
        }
      } catch (err) {
        if (!cancelled) setError(err instanceof Error ? err.message : 'Failed to load form.');
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    void load();
    return () => {
      cancelled = true;
    };
  }, [session.form_id, session.form_version_id, session.patient_id]);

  const updateAnswer = (qid: string, patch: Partial<AnswerState>) => {
    setAnswers(prev => ({ ...prev, [qid]: { ...prev[qid], ...patch } }));
  };

  const handleFileChange = (qid: string, files: FileList | null, multiple: boolean) => {
    if (!files || files.length === 0) return;
    const arr = Array.from(files);
    updateAnswer(qid, { files: multiple ? [...(answers[qid]?.files ?? []), ...arr] : [arr[0]] });
  };

  const removeFile = (qid: string, idx: number) => {
    const current = answers[qid]?.files ?? [];
    updateAnswer(qid, { files: current.filter((_, i) => i !== idx) });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    for (const q of questions) {
      if (q.isRequired) {
        const a = answers[q.id];
        const isEmpty =
          !a ||
          (q.questionType === 'short_text' && !a.textValue?.trim()) ||
          (q.questionType === 'long_text' && !a.textValue?.trim()) ||
          (q.questionType === 'number' && (a.numericValue === null || a.numericValue === undefined)) ||
          (q.questionType === 'date' && !a.dateValue) ||
          (q.questionType === 'time' && !a.timeValue) ||
          (q.questionType === 'yes_no' && a.booleanValue === undefined) ||
          ((q.questionType === 'single_choice' ||
            q.questionType === 'multiple_choice' ||
            q.questionType === 'dropdown') &&
            (!a.selectedOptions || a.selectedOptions.length === 0)) ||
          ((q.questionType === 'image_upload' ||
            q.questionType === 'multiple_image_upload' ||
            q.questionType === 'file_upload') &&
            (!a.files || a.files.length === 0));
        if (isEmpty) {
          setError(`"${q.label}" is required.`);
          return;
        }
      }
    }

    setSubmitting(true);
    try {
      const responseRow = await customResponseService.submitPublic({
        shareTokenId: session.id,
        formId: session.form_id!,
        formVersionId: session.form_version_id!,
        patientId: session.patient_id,
        systemKey: session.system_key,
        answers: [],
        shareTokenString: token
      } as never);

      for (const q of questions) {
        const a = answers[q.id];
        if (!a) continue;

        const { data: qrRow, error: qrErr } = await supabase
          .from('custom_question_responses')
          .insert({
            response_id: responseRow.id,
            question_id: q.id,
            question_label: q.label,
            question_type: q.questionType,
            text_value: a.textValue ?? null,
            numeric_value:
              a.numericValue !== undefined && a.numericValue !== null ? a.numericValue : null,
            date_value: a.dateValue ?? null,
            time_value: a.timeValue ?? null,
            boolean_value:
              a.booleanValue !== undefined && a.booleanValue !== null ? a.booleanValue : null,
            selected_options: (a.selectedOptions as never) ?? null
          })
          .select('id')
          .single();

        if (qrErr) {
          console.warn('[CustomFormFillView] answer insert failed', qrErr);
          continue;
        }

        if (a.files && a.files.length > 0 && qrRow?.id) {
          for (const file of a.files) {
            try {
              await fileAttachmentService.uploadViaShareToken(file, {
                doctorId: session.doctor_id,
                shareTokenId: session.id,
                patientId: session.patient_id,
                entityType: 'custom_response',
                entityId: responseRow.id,
                questionResponseId: qrRow.id,
                fieldName: q.id
              });
            } catch (upErr) {
              console.warn('[CustomFormFillView] file upload failed', upErr);
            }
          }
        }
      }

      setSubmitted(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Submission failed.');
    } finally {
      setSubmitting(false);
    }
  };

  const clinicWa = `https://wa.me/?text=${encodeURIComponent(
    `Hello ${CLINIC_CONFIG.doctorName}, I just submitted my custom case form.`
  )}`;

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-100">
        <div className="flex items-center gap-2 text-slate-600 text-sm">
          <Loader2 className="w-5 h-5 animate-spin text-emerald-600" />
          Loading form...
        </div>
      </div>
    );
  }

  if (error && !submitted) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-slate-100 p-4">
        <div className="bg-white rounded-2xl p-8 max-w-md w-full shadow-md border border-slate-200 text-center space-y-3">
          <AlertCircle className="w-12 h-12 text-rose-500 mx-auto" />
          <h2 className="font-bold text-slate-900 text-lg">Unable to Load Form</h2>
          <p className="text-sm text-slate-600">{error}</p>
          <button
            onClick={onExit}
            className="mt-2 px-4 py-2 rounded-xl bg-slate-900 text-white text-xs font-semibold"
          >
            Return Home
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col">
      <header className="bg-emerald-900 text-white shadow-md sticky top-0 z-30">
        <div className="max-w-4xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center text-emerald-300 font-bold text-lg border border-emerald-700/50">
              {CLINIC_CONFIG.doctorName.charAt(0) || 'C'}
            </div>
            <div>
              <h1 className="font-bold text-sm sm:text-base">{CLINIC_CONFIG.appName}</h1>
              <p className="text-[11px] text-emerald-200">{CLINIC_CONFIG.doctorName}</p>
            </div>
          </div>
        </div>
      </header>

      <main className="flex-1 max-w-4xl w-full mx-auto p-4 sm:p-6">
        <div className="bg-white rounded-3xl shadow-xl border border-slate-200 overflow-hidden">
          <div className="bg-gradient-to-r from-emerald-800 to-teal-800 text-white p-6">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-950/60 border border-emerald-600/50 text-[11px] text-emerald-200 font-semibold mb-3">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
              Custom Doctor Form
            </div>
            <h1 className="text-xl sm:text-2xl font-bold font-serif">{formTitle}</h1>
            {formDescription && (
              <p className="text-xs sm:text-sm text-emerald-100 mt-1">{formDescription}</p>
            )}
            {patient && (
              <div className="mt-3 p-3 bg-white/10 rounded-xl border border-white/20 text-xs flex flex-wrap items-center justify-between gap-2">
                <span>
                  Patient: <strong>{patient.name}</strong>
                </span>
                <span>
                  {patient.age !== null && `${patient.age}y`}
                  {patient.gender && ` / ${patient.gender}`}
                </span>
              </div>
            )}
          </div>

          <div className="p-6">
            {submitted ? (
              <div className="py-10 text-center space-y-4">
                <div className="w-20 h-20 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto">
                  <CheckCircle2 className="w-12 h-12" />
                </div>
                <h3 className="text-xl font-bold text-slate-800">Submitted Successfully</h3>
                <p className="text-sm text-slate-600 max-w-md mx-auto">
                  Thank you, <strong>{patient?.name ?? 'Patient'}</strong>. Your answers reached the doctor.
                </p>
                <a
                  href={clinicWa}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-600 text-white font-semibold text-xs"
                >
                  <MessageCircle className="w-4 h-4" />
                  WhatsApp Clinic
                </a>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-5">
                {error && (
                  <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-rose-800 text-xs flex items-center gap-2">
                    <AlertCircle className="w-4 h-4" />
                    {error}
                  </div>
                )}

                {questions.map((q, idx) => {
                  const a = answers[q.id] ?? {};
                  return (
                    <div
                      key={q.id}
                      className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-2"
                    >
                      {q.questionType === 'section_text' ? (
                        <div className="text-slate-800">
                          <h4 className="font-bold text-sm">{q.label}</h4>
                          {q.helpText && (
                            <p className="text-xs text-slate-500 mt-1">{q.helpText}</p>
                          )}
                        </div>
                      ) : (
                        <>
                          <label className="block font-semibold text-slate-800 text-sm">
                            {idx + 1}. {q.label}
                            {q.isRequired && <span className="text-rose-500 ml-1">*</span>}
                          </label>
                          {q.helpText && (
                            <p className="text-[11px] text-slate-500">{q.helpText}</p>
                          )}

                          {(q.questionType === 'short_text' || q.questionType === 'long_text') &&
                            (q.questionType === 'long_text' ? (
                              <textarea
                                rows={3}
                                value={a.textValue ?? ''}
                                onChange={e => updateAnswer(q.id, { textValue: e.target.value })}
                                className="w-full border border-slate-300 rounded-xl px-3 py-2 text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                              />
                            ) : (
                              <input
                                type="text"
                                value={a.textValue ?? ''}
                                onChange={e => updateAnswer(q.id, { textValue: e.target.value })}
                                className="w-full border border-slate-300 rounded-xl px-3 py-2 text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                              />
                            ))}

                          {q.questionType === 'number' && (
                            <input
                              type="number"
                              value={a.numericValue ?? ''}
                              onChange={e =>
                                updateAnswer(q.id, {
                                  numericValue: e.target.value === '' ? null : Number(e.target.value)
                                })
                              }
                              className="w-full border border-slate-300 rounded-xl px-3 py-2 text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                            />
                          )}

                          {q.questionType === 'date' && (
                            <input
                              type="date"
                              value={a.dateValue ?? ''}
                              onChange={e => updateAnswer(q.id, { dateValue: e.target.value })}
                              className="w-full border border-slate-300 rounded-xl px-3 py-2 text-sm focus:outline-none"
                            />
                          )}

                          {q.questionType === 'time' && (
                            <input
                              type="time"
                              value={a.timeValue ?? ''}
                              onChange={e => updateAnswer(q.id, { timeValue: e.target.value })}
                              className="w-full border border-slate-300 rounded-xl px-3 py-2 text-sm focus:outline-none"
                            />
                          )}

                          {q.questionType === 'yes_no' && (
                            <div className="flex gap-2">
                              {[
                                { v: true, label: 'Yes' },
                                { v: false, label: 'No' }
                              ].map(opt => (
                                <button
                                  key={String(opt.v)}
                                  type="button"
                                  onClick={() => updateAnswer(q.id, { booleanValue: opt.v })}
                                  className={`px-4 py-2 rounded-xl text-sm font-medium border ${
                                    a.booleanValue === opt.v
                                      ? 'bg-emerald-600 text-white border-emerald-700'
                                      : 'bg-white text-slate-700 border-slate-300'
                                  }`}
                                >
                                  {opt.label}
                                </button>
                              ))}
                            </div>
                          )}

                          {q.questionType === 'dropdown' && (
                            <select
                              value={(a.selectedOptions ?? [])[0] ?? ''}
                              onChange={e =>
                                updateAnswer(q.id, { selectedOptions: [e.target.value] })
                              }
                              className="w-full border border-slate-300 rounded-xl px-3 py-2 text-sm focus:outline-none bg-white"
                            >
                              <option value="">Select...</option>
                              {q.options.map(o => (
                                <option key={o.id} value={o.label}>
                                  {o.label}
                                </option>
                              ))}
                            </select>
                          )}

                          {q.questionType === 'single_choice' && (
                            <div className="flex flex-wrap gap-2">
                              {q.options.map(o => {
                                const selected = (a.selectedOptions ?? [])[0] === o.label;
                                return (
                                  <button
                                    type="button"
                                    key={o.id}
                                    onClick={() =>
                                      updateAnswer(q.id, { selectedOptions: [o.label] })
                                    }
                                    className={`px-3 py-1.5 rounded-xl text-xs font-medium border ${
                                      selected
                                        ? 'bg-emerald-600 text-white border-emerald-700'
                                        : 'bg-white text-slate-700 border-slate-300'
                                    }`}
                                  >
                                    {o.label}
                                  </button>
                                );
                              })}
                            </div>
                          )}

                          {q.questionType === 'multiple_choice' && (
                            <div className="flex flex-wrap gap-2">
                              {q.options.map(o => {
                                const selected = (a.selectedOptions ?? []).includes(o.label);
                                return (
                                  <button
                                    type="button"
                                    key={o.id}
                                    onClick={() => {
                                      const list = new Set(a.selectedOptions ?? []);
                                      if (list.has(o.label)) list.delete(o.label);
                                      else list.add(o.label);
                                      updateAnswer(q.id, {
                                        selectedOptions: Array.from(list)
                                      });
                                    }}
                                    className={`px-3 py-1.5 rounded-xl text-xs font-medium border ${
                                      selected
                                        ? 'bg-emerald-600 text-white border-emerald-700'
                                        : 'bg-white text-slate-700 border-slate-300'
                                    }`}
                                  >
                                    {o.label}
                                  </button>
                                );
                              })}
                            </div>
                          )}

                          {(q.questionType === 'image_upload' ||
                            q.questionType === 'multiple_image_upload' ||
                            q.questionType === 'file_upload') && (
                            <div className="space-y-2">
                              <label className="inline-flex items-center gap-2 cursor-pointer px-3.5 py-2 bg-white border border-emerald-400 text-emerald-800 rounded-xl text-xs font-semibold">
                                <Upload className="w-4 h-4" />
                                <span>
                                  {q.questionType === 'file_upload'
                                    ? 'Choose file'
                                    : q.questionType === 'multiple_image_upload'
                                    ? 'Choose images'
                                    : 'Choose image'}
                                </span>
                                <input
                                  type="file"
                                  accept={q.questionType === 'file_upload' ? undefined : 'image/*'}
                                  multiple={q.questionType === 'multiple_image_upload'}
                                  onChange={e =>
                                    handleFileChange(
                                      q.id,
                                      e.target.files,
                                      q.questionType === 'multiple_image_upload'
                                    )
                                  }
                                  className="hidden"
                                />
                              </label>

                              {(a.files ?? []).length > 0 && (
                                <div className="flex flex-wrap gap-2">
                                  {(a.files ?? []).map((f, i) => (
                                    <div
                                      key={i}
                                      className="relative w-20 h-16 border border-slate-300 rounded-lg bg-white overflow-hidden flex items-center justify-center text-[10px] text-slate-600 px-1 text-center"
                                    >
                                      {f.type.startsWith('image/') ? (
                                        <img
                                          src={URL.createObjectURL(f)}
                                          alt="preview"
                                          className="w-full h-full object-cover"
                                        />
                                      ) : (
                                        <span>{f.name}</span>
                                      )}
                                      <button
                                        type="button"
                                        onClick={() => removeFile(q.id, i)}
                                        className="absolute top-0.5 right-0.5 bg-rose-600 text-white rounded-full p-0.5"
                                      >
                                        <X className="w-3 h-3" />
                                      </button>
                                    </div>
                                  ))}
                                </div>
                              )}
                            </div>
                          )}
                        </>
                      )}
                    </div>
                  );
                })}

                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full py-4 rounded-2xl bg-emerald-600 hover:bg-emerald-700 disabled:opacity-60 text-white font-bold text-sm transition-colors flex items-center justify-center gap-2"
                >
                  {submitting ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : (
                    <Send className="w-5 h-5" />
                  )}
                  {submitting ? 'Submitting...' : 'Submit Form to Doctor'}
                </button>
              </form>
            )}
          </div>
        </div>
      </main>

      <footer className="border-t border-slate-200 bg-white py-4 text-center text-xs text-slate-400">
        <span className="flex items-center justify-center gap-1.5">
          <Stethoscope className="w-3.5 h-3.5" />
          Secure clinical form
        </span>
      </footer>
    </div>
  );
};