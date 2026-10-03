import React, { useEffect, useState } from 'react';
import { CLINIC_CONFIG } from '../../config/clinicConfig';
import { supabase } from '../../lib/supabase';
import { shareTokenService } from '../../lib/services/shareTokens';
import { systemFormService } from '../../lib/services/systemForms';
import { prescriptionService, type PrescriptionWithMedicines } from '../../lib/services/prescriptions';
import { invoiceService, type InvoiceWithItems } from '../../lib/services/invoices';
import { clinicalSystemService, type ClinicalSystemRow } from '../../lib/services/clinicalSystems';
import { patientService, type PatientRow } from '../../lib/services/patients';
import { customFormService } from '../../lib/services/customForms';
import { customResponseService } from '../../lib/services/customResponses';
import { fileAttachmentService } from '../../lib/services/fileAttachments';
import { CLINICAL_SYSTEMS_METADATA } from '../../data/mockData';
import type { ClinicalSystemKey, QuestionType } from '../../types';
import {
  CheckCircle2, Printer, Send, MessageCircle, FileText, Receipt, ShieldCheck,
  Stethoscope, AlertCircle, Upload, X, Loader2, QrCode
} from 'lucide-react';

interface PublicShareViewProps {
  token: string;
  view: 'intake' | 'prescription' | 'billing' | 'custom_form';
  onExit: () => void;
}

interface ResolvedSession {
  id: string;
  doctor_id: string;
  patient_id: string | null;
  system_key: string | null;
  form_id: string | null;
  form_version_id: string | null;
  share_type: 'intake' | 'prescription' | 'billing' | 'custom_form';
  related_id: string | null;
}

interface LoadedQuestion {
  id: string;
  questionType: QuestionType;
  label: string;
  helpText: string | null;
  isRequired: boolean;
  options: { id: string; label: string }[];
}

interface CustomAnswerState {
  textValue?: string;
  numericValue?: number | null;
  dateValue?: string;
  timeValue?: string;
  booleanValue?: boolean;
  selectedOptions?: string[];
  files?: File[];
}

export const PublicShareView: React.FC<PublicShareViewProps> = ({ token, view, onExit }) => {
  const [session, setSession] = useState<ResolvedSession | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [patient, setPatient] = useState<PatientRow | null>(null);
  const [systemMeta, setSystemMeta] = useState<ClinicalSystemRow | null>(null);
  const [customQuestions, setCustomQuestions] = useState<LoadedQuestion[]>([]);
  const [customAnswers, setCustomAnswers] = useState<Record<string, CustomAnswerState>>({});
  const [formTitle, setFormTitle] = useState<string>('');

  const [chiefComplaints, setChiefComplaints] = useState('');
  const [duration, setDuration] = useState('');
  const [severity, setSeverity] = useState<'Mild' | 'Moderate' | 'Severe'>('Moderate');
  const [modalitiesAggravation, setModalitiesAggravation] = useState('');
  const [modalitiesAmelioration, setModalitiesAmelioration] = useState('');
  const [concomitants, setConcomitants] = useState('');
  const [formData, setFormData] = useState<Record<string, unknown>>({});
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const [rx, setRx] = useState<PrescriptionWithMedicines | null>(null);
  const [invoice, setInvoice] = useState<InvoiceWithItems | null>(null);

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      setLoading(true);
      try {
        const resolved = await shareTokenService.resolveSession(token);
        if (cancelled) return;
        if (!resolved) {
          setError('This link is invalid or has expired. Please request a new link from your doctor.');
          setLoading(false);
          return;
        }
        setSession(resolved);

        if (resolved.patient_id) {
          const p = await patientService.get(resolved.patient_id);
          if (!cancelled) setPatient(p);
        }

        if (resolved.system_key) {
          const meta = await clinicalSystemService.getByKey(resolved.system_key);
          if (!cancelled) {
            setSystemMeta(meta);
            const local = CLINICAL_SYSTEMS_METADATA.find(s => s.key === resolved.system_key);
            setFormTitle(meta?.label || local?.label || 'Clinical Case Form');
          }
        }

        if (resolved.form_version_id) {
          try {
            const vd = await customFormService.getVersionWithQuestions(resolved.form_version_id);
            if (!cancelled && vd) {
              setCustomQuestions(
                vd.questions.map(q => ({
                  id: q.id,
                  questionType: q.question_type,
                  label: q.label,
                  helpText: q.help_text,
                  isRequired: q.is_required,
                  options: q.options.map(o => ({ id: o.id, label: o.label }))
                }))
              );
            }
          } catch (e) { console.warn('[PublicShareView] custom form load failed', e); }
        }

        if (resolved.share_type === 'prescription' && resolved.related_id) {
          const data = await prescriptionService.getByShareTokenId(resolved.id);
          if (!cancelled) setRx(data);
        }

        if (resolved.share_type === 'billing' && resolved.related_id) {
          const data = await invoiceService.getByShareTokenId(resolved.id);
          if (!cancelled) setInvoice(data);
        }
      } catch (err) {
        if (!cancelled) setError(err instanceof Error ? err.message : 'Failed to load. Please try again.');
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    void load();
    return () => { cancelled = true; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  const toggleChip = (fieldName: string, option: string) => {
    setFormData(prev => {
      const existing = (prev[fieldName] as string[] | undefined) ?? [];
      const next = existing.includes(option) ? existing.filter(i => i !== option) : [...existing, option];
      return { ...prev, [fieldName]: next };
    });
  };

  const updateCustomAnswer = (qid: string, patch: Partial<CustomAnswerState>) => {
    setCustomAnswers(prev => ({ ...prev, [qid]: { ...prev[qid], ...patch } }));
  };

  const handleCustomFiles = (qid: string, files: FileList | null, multiple: boolean) => {
    if (!files || files.length === 0) return;
    const arr = Array.from(files);
    const existing = customAnswers[qid]?.files ?? [];
    updateCustomAnswer(qid, { files: multiple ? [...existing, ...arr] : [arr[0]] });
  };

  const removeCustomFile = (qid: string, idx: number) => {
    const current = customAnswers[qid]?.files ?? [];
    updateCustomAnswer(qid, { files: current.filter((_, i) => i !== idx) });
  };

  const handleIntakeSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!session || !patient) return;
    setSubmitting(true);
    setError(null);
    try {
      await systemFormService.submitRemote(token, {
        patientId: patient.id,
        systemKey: session.system_key ?? 'headache',
        data: { ...formData },
        chiefComplaints: chiefComplaints || `Self-reported ${session.system_key ?? 'clinical'} symptoms`,
        duration: duration || 'Not specified',
        severity,
        modalitiesAggravation,
        modalitiesAmelioration,
        concomitants,
        clinicalNotes: `Submitted remotely via WhatsApp on ${new Date().toLocaleString()}.`
      });

      if (customQuestions.length > 0 && session.form_id && session.form_version_id) {
        try {
          const responseRow = await customResponseService.submitPublic({
            shareTokenId: session.id,
            shareTokenString: token,
            formId: session.form_id,
            formVersionId: session.form_version_id,
            patientId: patient.id,
            systemKey: session.system_key,
            answers: []
          });
          for (const q of customQuestions) {
            const a = customAnswers[q.id];
            if (!a) continue;
            const { data: qrRow, error: qrErr } = await supabase
              .from('custom_question_responses')
              .insert({
                response_id: responseRow.id,
                question_id: q.id,
                question_label: q.label,
                question_type: q.questionType,
                text_value: a.textValue ?? null,
                numeric_value: a.numericValue ?? null,
                date_value: a.dateValue ?? null,
                time_value: a.timeValue ?? null,
                boolean_value: a.booleanValue ?? null,
                selected_options: (a.selectedOptions as never) ?? null
              })
              .select('id')
              .single();
            if (qrErr || !qrRow) continue;
            if (a.files && a.files.length > 0) {
              for (const file of a.files) {
                try {
                  await fileAttachmentService.uploadViaShareToken(file, {
                    doctorId: session.doctor_id,
                    shareTokenId: session.id,
                    patientId: patient.id,
                    entityType: 'custom_response',
                    entityId: responseRow.id,
                    questionResponseId: qrRow.id,
                    fieldName: q.id
                  });
                } catch (upErr) { console.warn('[PublicShareView] file upload failed', upErr); }
              }
            }
          }
        } catch (cErr) { console.warn('[PublicShareView] custom response save failed', cErr); }
      }

      await shareTokenService.markUsed(session.id);
      setSubmitted(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Submission failed. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const clinicWaHelpUrl = `https://wa.me/?text=${encodeURIComponent(
    `Hello ${CLINIC_CONFIG.doctorName}, I am ${patient?.name ?? 'a patient'} contacting about my consultation.`
  )}`;

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-100">
        <div className="flex items-center gap-3 text-slate-600 text-base">
          <Loader2 className="w-6 h-6 animate-spin text-teal-600" />
          Loading secure session...
        </div>
      </div>
    );
  }

  if (error && !submitted) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-slate-100 p-4">
        <div className="bg-white rounded-2xl p-8 max-w-md w-full shadow-md border border-slate-200 text-center space-y-3">
          <AlertCircle className="w-12 h-12 text-rose-500 mx-auto" />
          <h2 className="font-bold text-slate-900 text-xl">Unable to Open Link</h2>
          <p className="text-base text-slate-600">{error}</p>
          <button onClick={onExit} className="mt-2 px-5 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-base font-semibold transition-colors">
            Return Home
          </button>
        </div>
      </div>
    );
  }

  const isIntakeView = view === 'intake' || view === 'custom_form' || session?.share_type === 'custom_form' || session?.share_type === 'intake';
  const sysKey = (session?.system_key ?? 'headache') as ClinicalSystemKey;
  const sysMetaLocal = CLINICAL_SYSTEMS_METADATA.find(s => s.key === sysKey) || CLINICAL_SYSTEMS_METADATA[0];

  const renderIntake = () => (
    <div className="bg-white rounded-3xl shadow-xl border border-slate-200 overflow-hidden">
      <div className="bg-gradient-to-r from-emerald-800 to-teal-800 text-white p-6 sm:p-8">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-950/60 border border-emerald-600/50 text-xs text-emerald-200 font-semibold mb-3">
          <ShieldCheck className="w-4 h-4 text-emerald-400" />
          <span>Confidential Clinical Case Intake</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-bold font-serif">
          {formTitle || sysMetaLocal.label}
        </h1>
        <p className="text-base text-emerald-100 mt-2 max-w-xl">
          Please fill in your symptoms as accurately as possible. This information reaches{' '}
          <strong>{CLINIC_CONFIG.doctorName}</strong>.
        </p>
        {patient && (
          <div className="mt-4 p-4 bg-white/10 backdrop-blur-xs rounded-xl border border-white/20 flex flex-wrap items-center justify-between gap-2 text-base">
            <div>
              <span className="text-emerald-200">Patient: </span>
              <span className="font-bold text-white">{patient.name}</span>
            </div>
            <div className="flex items-center gap-4 text-emerald-100">
              {patient.age !== null && <span>Age: <strong>{patient.age}</strong></span>}
              {patient.gender && <span>Gender: <strong>{patient.gender}</strong></span>}
            </div>
          </div>
        )}
      </div>

      <div className="p-6 sm:p-8">
        {submitted ? (
          <div className="py-10 text-center space-y-5">
            <div className="w-20 h-20 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-12 h-12" />
            </div>
            <h3 className="text-2xl font-bold text-slate-800">Form Submitted Successfully</h3>
            <p className="text-base text-slate-600 max-w-md mx-auto">
              Thank you, <strong>{patient?.name}</strong>. Your responses have been securely transmitted to the clinic.
            </p>
            <a
              href={clinicWaHelpUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-base transition-colors"
            >
              <MessageCircle className="w-5 h-5" />
              <span>WhatsApp Clinic</span>
            </a>
          </div>
        ) : (
          <form onSubmit={handleIntakeSubmit} className="space-y-6">
            <div className="p-4 bg-amber-50 rounded-2xl border border-amber-200 text-amber-900 text-base flex items-start gap-2.5">
              <AlertCircle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
              <span>Describe your sensations, what triggers your trouble, and what gives you relief in your own words.</span>
            </div>

            <div className="space-y-5">
              <div>
                <label className="block font-bold text-slate-800 text-lg mb-2">Main Complaints &amp; Symptoms</label>
                <textarea
                  required
                  rows={4}
                  value={chiefComplaints}
                  onChange={e => setChiefComplaints(e.target.value)}
                  placeholder="Describe your symptoms..."
                  className="w-full border border-slate-300 rounded-xl p-4 text-base focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-semibold text-slate-700 text-base mb-1.5">Duration</label>
                  <input
                    type="text"
                    value={duration}
                    onChange={e => setDuration(e.target.value)}
                    placeholder="e.g. 5 days"
                    className="w-full border border-slate-300 rounded-xl p-3 text-base focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 text-base mb-1.5">Severity</label>
                  <select
                    value={severity}
                    onChange={e => setSeverity(e.target.value as typeof severity)}
                    className="w-full border border-slate-300 rounded-xl p-3 text-base focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  >
                    <option value="Mild">Mild</option>
                    <option value="Moderate">Moderate</option>
                    <option value="Severe">Severe</option>
                  </select>
                </div>
              </div>
            </div>

            {sysMetaLocal.fields.length > 0 && (
              <div className="space-y-5 pt-4 border-t border-slate-200">
                <div className="text-sm uppercase font-bold tracking-widest text-slate-500">
                  System-Specific Questions — {sysMetaLocal.label}
                </div>
                {sysMetaLocal.fields.map(field => {
                  if (field.type === 'chips' && field.options) {
                    const selected = (formData[field.name] as string[] | undefined) ?? [];
                    return (
                      <div key={field.name} className="space-y-2">
                        <label className="block font-semibold text-slate-700 text-base">{field.label}</label>
                        <div className="flex flex-wrap gap-2">
                          {field.options.map(opt => {
                            const isSel = selected.includes(opt);
                            return (
                              <button
                                type="button"
                                key={opt}
                                onClick={() => toggleChip(field.name, opt)}
                                className={`px-4 py-2 rounded-xl text-base font-medium transition-all ${
                                  isSel
                                    ? 'bg-emerald-600 text-white shadow-xs'
                                    : 'bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200'
                                }`}
                              >
                                {opt}
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    );
                  }
                  return (
                    <div key={field.name}>
                      <label className="block font-semibold text-slate-700 text-base mb-1.5">{field.label}</label>
                      <input
                        type="text"
                        placeholder={field.placeholder || ''}
                        value={(formData[field.name] as string | undefined) ?? ''}
                        onChange={e => setFormData({ ...formData, [field.name]: e.target.value })}
                        className="w-full border border-slate-300 rounded-xl p-3 text-base focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                      />
                    </div>
                  );
                })}
              </div>
            )}

            <div className="space-y-5 pt-4 border-t border-slate-200">
              <div>
                <label className="block font-semibold text-slate-700 text-base mb-1.5">What makes your symptoms worse? (Aggravation)</label>
                <input
                  type="text"
                  value={modalitiesAggravation}
                  onChange={e => setModalitiesAggravation(e.target.value)}
                  className="w-full border border-slate-300 rounded-xl p-3 text-base focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                />
              </div>
              <div>
                <label className="block font-semibold text-slate-700 text-base mb-1.5">What gives you relief? (Amelioration)</label>
                <input
                  type="text"
                  value={modalitiesAmelioration}
                  onChange={e => setModalitiesAmelioration(e.target.value)}
                  className="w-full border border-slate-300 rounded-xl p-3 text-base focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                />
              </div>
              <div>
                <label className="block font-semibold text-slate-700 text-base mb-1.5">Associated symptoms</label>
                <input
                  type="text"
                  value={concomitants}
                  onChange={e => setConcomitants(e.target.value)}
                  className="w-full border border-slate-300 rounded-xl p-3 text-base focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                />
              </div>
            </div>

            {customQuestions.length > 0 && (
              <div className="space-y-5 pt-4 border-t-2 border-indigo-100">
                <div className="text-sm uppercase font-bold tracking-widest text-indigo-700">
                  Custom Questions — {sysMetaLocal.label}
                </div>
                {customQuestions.map((q, idx) => {
                  const a = customAnswers[q.id] ?? {};
                  if (q.questionType === 'section_text') {
                    return (
                      <div key={q.id} className="p-4 bg-indigo-50/40 rounded-xl border border-indigo-100">
                        <h4 className="font-bold text-base text-indigo-900">{q.label}</h4>
                        {q.helpText && <p className="text-sm text-slate-500 mt-1">{q.helpText}</p>}
                      </div>
                    );
                  }
                  return (
                    <div key={q.id} className="p-5 bg-indigo-50/40 rounded-2xl border border-indigo-100 space-y-3">
                      <label className="block font-semibold text-slate-800 text-base">
                        {idx + 1}. {q.label}
                        {q.isRequired && <span className="text-rose-500 ml-1">*</span>}
                      </label>
                      {q.helpText && <p className="text-sm text-slate-500">{q.helpText}</p>}

                      {(q.questionType === 'short_text' || q.questionType === 'long_text') && (
                        q.questionType === 'long_text' ? (
                          <textarea
                            rows={3}
                            value={a.textValue ?? ''}
                            onChange={e => updateCustomAnswer(q.id, { textValue: e.target.value })}
                            className="w-full border border-slate-300 rounded-xl px-4 py-3 text-base bg-white focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                          />
                        ) : (
                          <input
                            type="text"
                            value={a.textValue ?? ''}
                            onChange={e => updateCustomAnswer(q.id, { textValue: e.target.value })}
                            className="w-full border border-slate-300 rounded-xl px-4 py-3 text-base bg-white focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                          />
                        )
                      )}

                      {q.questionType === 'number' && (
                        <input
                          type="number"
                          value={a.numericValue ?? ''}
                          onChange={e => updateCustomAnswer(q.id, { numericValue: e.target.value === '' ? null : Number(e.target.value) })}
                          className="w-full border border-slate-300 rounded-xl px-4 py-3 text-base bg-white focus:outline-none"
                        />
                      )}
                      {q.questionType === 'date' && (
                        <input
                          type="date"
                          value={a.dateValue ?? ''}
                          onChange={e => updateCustomAnswer(q.id, { dateValue: e.target.value })}
                          className="w-full border border-slate-300 rounded-xl px-4 py-3 text-base bg-white focus:outline-none"
                        />
                      )}
                      {q.questionType === 'time' && (
                        <input
                          type="time"
                          value={a.timeValue ?? ''}
                          onChange={e => updateCustomAnswer(q.id, { timeValue: e.target.value })}
                          className="w-full border border-slate-300 rounded-xl px-4 py-3 text-base bg-white focus:outline-none"
                        />
                      )}
                      {q.questionType === 'yes_no' && (
                        <div className="flex gap-3">
                          {[{ v: true, l: 'Yes' }, { v: false, l: 'No' }].map(o => (
                            <button
                              type="button"
                              key={String(o.v)}
                              onClick={() => updateCustomAnswer(q.id, { booleanValue: o.v })}
                              className={`px-5 py-2.5 rounded-xl text-base font-medium border ${
                                a.booleanValue === o.v
                                  ? 'bg-indigo-600 text-white border-indigo-700'
                                  : 'bg-white text-slate-700 border-slate-300'
                              }`}
                            >
                              {o.l}
                            </button>
                          ))}
                        </div>
                      )}
                      {q.questionType === 'dropdown' && (
                        <select
                          value={(a.selectedOptions ?? [])[0] ?? ''}
                          onChange={e => updateCustomAnswer(q.id, { selectedOptions: [e.target.value] })}
                          className="w-full border border-slate-300 rounded-xl px-4 py-3 text-base bg-white focus:outline-none"
                        >
                          <option value="">Select...</option>
                          {q.options.map(o => <option key={o.id} value={o.label}>{o.label}</option>)}
                        </select>
                      )}
                      {q.questionType === 'single_choice' && (
                        <div className="flex flex-wrap gap-2">
                          {q.options.map(o => {
                            const sel = (a.selectedOptions ?? [])[0] === o.label;
                            return (
                              <button
                                type="button"
                                key={o.id}
                                onClick={() => updateCustomAnswer(q.id, { selectedOptions: [o.label] })}
                                className={`px-4 py-2 rounded-xl text-base font-medium border ${
                                  sel ? 'bg-indigo-600 text-white border-indigo-700' : 'bg-white text-slate-700 border-slate-300'
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
                            const sel = (a.selectedOptions ?? []).includes(o.label);
                            return (
                              <button
                                type="button"
                                key={o.id}
                                onClick={() => {
                                  const list = new Set(a.selectedOptions ?? []);
                                  if (list.has(o.label)) list.delete(o.label); else list.add(o.label);
                                  updateCustomAnswer(q.id, { selectedOptions: Array.from(list) });
                                }}
                                className={`px-4 py-2 rounded-xl text-base font-medium border ${
                                  sel ? 'bg-indigo-600 text-white border-indigo-700' : 'bg-white text-slate-700 border-slate-300'
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
                          <label className="inline-flex items-center gap-2 cursor-pointer px-4 py-2.5 bg-white border border-indigo-400 text-indigo-800 rounded-xl text-base font-semibold">
                            <Upload className="w-5 h-5" />
                            <span>
                              {q.questionType === 'file_upload' ? 'Choose file' :
                                q.questionType === 'multiple_image_upload' ? 'Choose images' : 'Choose image'}
                            </span>
                            <input
                              type="file"
                              accept={q.questionType === 'file_upload' ? undefined : 'image/*'}
                              multiple={q.questionType === 'multiple_image_upload'}
                              onChange={e => handleCustomFiles(q.id, e.target.files, q.questionType === 'multiple_image_upload')}
                              className="hidden"
                            />
                          </label>
                          {(a.files ?? []).length > 0 && (
                            <div className="flex flex-wrap gap-2">
                              {(a.files ?? []).map((f, i) => (
                                <div key={i} className="relative w-24 h-20 border border-slate-300 rounded-lg bg-white overflow-hidden flex items-center justify-center text-sm text-slate-600 px-1 text-center">
                                  {f.type.startsWith('image/') ? (
                                    <img src={URL.createObjectURL(f)} alt="preview" className="w-full h-full object-cover" />
                                  ) : (
                                    <span>{f.name}</span>
                                  )}
                                  <button
                                    type="button"
                                    onClick={() => removeCustomFile(q.id, i)}
                                    className="absolute top-1 right-1 bg-rose-600 text-white rounded-full p-1"
                                  >
                                    <X className="w-3.5 h-3.5" />
                                  </button>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}

            <button
              type="submit"
              disabled={submitting}
              className="w-full py-4 px-6 rounded-2xl bg-emerald-600 hover:bg-emerald-700 disabled:opacity-60 text-white font-bold text-lg transition-colors shadow-lg flex items-center justify-center gap-2"
            >
              {submitting ? <Loader2 className="w-6 h-6 animate-spin" /> : <Send className="w-6 h-6" />}
              <span>{submitting ? 'Submitting...' : 'Submit Case Details to Doctor'}</span>
            </button>
            <p className="text-sm text-center text-slate-400">
              Your medical data is private and directly received by the doctor.
            </p>
          </form>
        )}
      </div>
    </div>
  );

  const renderPrescription = () => {
    if (!rx) return (
      <div className="bg-white rounded-3xl p-8 shadow-xl border border-slate-200 text-center">
        <FileText className="w-12 h-12 text-slate-300 mx-auto mb-3" />
        <p className="text-base text-slate-600">Prescription not available.</p>
      </div>
    );
    return (
      <div className="space-y-4">
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex items-center justify-between print:hidden">
          <div className="flex items-center gap-2">
            <FileText className="w-6 h-6 text-emerald-600" />
            <span className="font-bold text-base">Digital Prescription</span>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={() => window.print()} className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-base font-semibold flex items-center gap-2">
              <Printer className="w-4 h-4" /><span>Print / Save PDF</span>
            </button>
            <a href={clinicWaHelpUrl} target="_blank" rel="noopener noreferrer" className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-base font-semibold flex items-center gap-2">
              <MessageCircle className="w-4 h-4" /><span className="hidden sm:inline">WhatsApp Help</span>
            </a>
          </div>
        </div>
        <div id="prescription-paper" className="bg-white rounded-3xl shadow-xl border border-slate-200 p-6 sm:p-10 space-y-6 text-slate-900">
          <div className="border-b-2 border-emerald-800 pb-5 flex flex-col sm:flex-row sm:items-start justify-between gap-4">
            <div>
              <h2 className="text-2xl sm:text-3xl font-bold font-serif text-emerald-950">{CLINIC_CONFIG.doctorName}</h2>
              {CLINIC_CONFIG.qualifications && <p className="text-base font-semibold text-emerald-800">{CLINIC_CONFIG.qualifications}</p>}
              {CLINIC_CONFIG.regNo && <p className="text-sm text-slate-500 mt-1">Reg. No: <strong>{CLINIC_CONFIG.regNo}</strong></p>}
            </div>
            <div className="text-left sm:text-right text-base text-slate-600 space-y-0.5">
              <div className="font-bold text-slate-900 text-lg">{CLINIC_CONFIG.appName}</div>
              {CLINIC_CONFIG.address && <div>{CLINIC_CONFIG.address}</div>}
              {CLINIC_CONFIG.phone && <div>{CLINIC_CONFIG.phone}</div>}
            </div>
          </div>
          <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 grid grid-cols-2 sm:grid-cols-4 gap-3 text-base">
            <div><span className="text-slate-400 block text-xs uppercase font-bold">Patient</span><strong className="text-slate-900 text-lg">{patient?.name ?? 'Patient'}</strong></div>
            <div><span className="text-slate-400 block text-xs uppercase font-bold">Age / Gender</span><strong className="text-slate-800">{patient?.age ?? '-'} yrs / {patient?.gender ?? '-'}</strong></div>
            <div><span className="text-slate-400 block text-xs uppercase font-bold">Date</span><strong className="text-slate-800">{rx.consultation_date}</strong></div>
            <div><span className="text-slate-400 block text-xs uppercase font-bold">Follow-up</span><strong className="text-emerald-800">{rx.follow_up_date ?? 'As advised'}</strong></div>
          </div>
          {rx.diagnosis && (
            <div className="p-4 bg-emerald-50/70 rounded-xl border border-emerald-200 text-base">
              <span className="font-bold text-emerald-900 uppercase tracking-wide text-xs block mb-1">Diagnosis</span>
              <span className="text-slate-900 font-semibold text-lg">{rx.diagnosis}</span>
            </div>
          )}
          <div className="space-y-2">
            <div className="flex items-center gap-1.5">
              <span className="text-4xl font-serif font-black text-emerald-900">℞</span>
              <span className="text-sm uppercase font-bold tracking-widest text-slate-500">Prescribed Medicines</span>
            </div>
            <div className="border border-slate-200 rounded-2xl overflow-hidden">
              <table className="w-full text-left text-base border-collapse">
                <thead className="bg-emerald-900 text-white text-sm uppercase">
                  <tr><th className="p-3">#</th><th className="p-3">Remedy &amp; Potency</th><th className="p-3">Dosage</th><th className="p-3">Instructions</th></tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {rx.prescription_homeo_medicines.slice().sort((a, b) => a.display_order - b.display_order).map((m, idx) => (
                    <tr key={m.id}>
                      <td className="p-3 font-mono text-slate-400">{idx + 1}</td>
                      <td className="p-3"><span className="font-bold text-emerald-950 text-lg block">{m.remedy}</span><span className="text-slate-500 text-sm">{m.potency} • {m.form}</span></td>
                      <td className="p-3"><span className="font-semibold text-slate-800 block">{m.dosage ?? '-'}</span><span className="text-emerald-700 font-medium text-sm">{m.frequency} • {m.duration ?? ''}</span></td>
                      <td className="p-3 text-slate-700">{m.instructions ?? '-'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
          <div className="pt-4 border-t border-slate-200 flex items-center justify-between text-sm text-slate-400">
            <div className="flex items-center gap-2"><QrCode className="w-10 h-10 text-slate-400" /><span>Digitally verified prescription</span></div>
            <span className="font-mono font-bold text-slate-600">{CLINIC_CONFIG.appName}</span>
          </div>
        </div>
      </div>
    );
  };

  const renderBilling = () => {
    if (!invoice) return (
      <div className="bg-white rounded-3xl p-8 shadow-xl border border-slate-200 text-center">
        <Receipt className="w-12 h-12 text-slate-300 mx-auto mb-3" />
        <p className="text-base text-slate-600">Receipt not available.</p>
      </div>
    );
    const items = [...invoice.invoice_items].sort((a, b) => a.display_order - b.display_order);
    const subtotal = items.reduce((s, it) => s + it.amount, 0);
    return (
      <div className="space-y-4">
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex items-center justify-between print:hidden">
          <div className="flex items-center gap-2">
            <Receipt className="w-6 h-6 text-emerald-600" />
            <span className="font-bold text-base">Payment Receipt</span>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={() => window.print()} className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-base font-semibold flex items-center gap-2">
              <Printer className="w-4 h-4" /><span>Print</span>
            </button>
            <a href={clinicWaHelpUrl} target="_blank" rel="noopener noreferrer" className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-base font-semibold flex items-center gap-2">
              <MessageCircle className="w-4 h-4" /><span className="hidden sm:inline">WhatsApp Help</span>
            </a>
          </div>
        </div>
        <div id="patient-billing-receipt" className="bg-white rounded-3xl shadow-xl border border-slate-200 p-6 sm:p-10 space-y-6">
          <div className="border-b-2 border-slate-200 pb-5 flex flex-col sm:flex-row sm:items-start justify-between gap-4">
            <div>
              <h2 className="text-2xl sm:text-3xl font-bold font-serif text-slate-900">{CLINIC_CONFIG.appName}</h2>
              <p className="text-base text-slate-500 mt-1">{CLINIC_CONFIG.doctorName}</p>
            </div>
            <div className="text-left sm:text-right">
              <span className="inline-block px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-300 font-bold text-sm mb-1">{invoice.status.toUpperCase()}</span>
              <div className="font-mono font-bold text-slate-900 text-base">{invoice.invoice_number}</div>
              <div className="text-base text-slate-500">Date: {invoice.invoice_date}</div>
            </div>
          </div>
          <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 flex flex-wrap justify-between gap-3 text-base">
            <div><span className="text-slate-400 text-xs uppercase font-bold block">Billed To</span><strong className="text-slate-900 text-lg">{patient?.name ?? 'Patient'}</strong></div>
            <div className="text-left sm:text-right"><span className="text-slate-400 text-xs uppercase font-bold block">Payment Mode</span><strong className="text-emerald-700 text-lg">{invoice.payment_mode}</strong></div>
          </div>
          <div className="border border-slate-200 rounded-2xl overflow-hidden">
            <table className="w-full text-left text-base border-collapse">
              <thead className="bg-slate-100 text-slate-600 text-sm uppercase">
                <tr><th className="p-3">#</th><th className="p-3">Description</th><th className="p-3 text-right">Amount (₹)</th></tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {items.map((it, idx) => (
                  <tr key={it.id}>
                    <td className="p-3 font-mono text-slate-400">{idx + 1}</td>
                    <td className="p-3 font-medium text-slate-800">{it.description}</td>
                    <td className="p-3 text-right font-mono font-bold text-slate-900">₹{it.amount}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="border-t border-slate-200 pt-3 space-y-2 text-right text-base">
            <div className="flex justify-between text-slate-600 max-w-xs ml-auto"><span>Subtotal:</span><span className="font-mono">₹{subtotal}</span></div>
            {invoice.discount > 0 && (
              <div className="flex justify-between text-rose-600 max-w-xs ml-auto"><span>Discount:</span><span className="font-mono">- ₹{invoice.discount}</span></div>
            )}
            <div className="flex justify-between text-lg font-bold text-slate-900 pt-2 border-t border-slate-200 max-w-xs ml-auto">
              <span>Total Amount:</span><span className="text-emerald-700 font-mono">₹{invoice.total_amount}</span>
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col font-sans antialiased text-slate-800">
      <header className="bg-emerald-900 text-white shadow-md sticky top-0 z-30 print:hidden">
        <div className="max-w-4xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-xl bg-white/10 flex items-center justify-center text-emerald-300 font-serif font-black text-xl border border-emerald-700/50">
              {CLINIC_CONFIG.doctorName.charAt(0) || 'C'}
            </div>
            <div>
              <h1 className="font-bold text-base sm:text-lg leading-tight tracking-wide">{CLINIC_CONFIG.appName}</h1>
              <p className="text-sm text-emerald-200">{CLINIC_CONFIG.doctorName}{CLINIC_CONFIG.qualifications && ` • ${CLINIC_CONFIG.qualifications}`}</p>
            </div>
          </div>
          <button onClick={onExit} className="px-3 py-2 rounded-lg text-emerald-200 hover:text-white hover:bg-emerald-800 text-sm transition-colors">Exit</button>
        </div>
      </header>
      <main className="flex-1 max-w-4xl w-full mx-auto p-4 sm:p-6 md:p-8">
        {isIntakeView && renderIntake()}
        {view === 'prescription' && renderPrescription()}
        {view === 'billing' && renderBilling()}
      </main>
      <footer className="border-t border-slate-200 bg-white py-4 text-center text-sm text-slate-400 print:hidden">
        <div className="max-w-4xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <span>{CLINIC_CONFIG.appName}{CLINIC_CONFIG.doctorName && ` • ${CLINIC_CONFIG.doctorName}`}</span>
          <span className="flex items-center gap-1"><Stethoscope className="w-4 h-4" />Secure share link</span>
        </div>
      </footer>
    </div>
  );
};