import React, { useEffect, useState } from 'react';
import { customResponseService, type CustomQuestionResponseRow } from '../../lib/services/customResponses';
import { fileAttachmentService } from '../../lib/services/fileAttachments';
import { patientService, type PatientRow } from '../../lib/services/patients';
import { supabase } from '../../lib/supabase';
import { CLINICAL_SYSTEMS_METADATA } from '../../data/mockData';
import { isMeaningful, displayValue } from '../../lib/utils';
import {
  Loader2, AlertCircle, FileText, Image as ImageIcon, Download,
  Calendar, User, Clock, X, Stethoscope, ClipboardList
} from 'lucide-react';

interface CustomFormResponseViewProps {
  responseId: string;
  onClose?: () => void;
}

interface LinkedSystemForm {
  id: string;
  chief_complaints: string | null;
  duration: string | null;
  severity: string | null;
  modalities_aggravation: string | null;
  modalities_amelioration: string | null;
  concomitants: string | null;
  clinical_notes: string | null;
  data: Record<string, unknown> | null;
  system_key: string | null;
  updated_at: string;
}

const IGNORE_KEYS = new Set([
  'date','patientName','name','age','sex','gender','mobile','phone','address',
  'occupation','marital','savedAt','acnePhoto','photo1','photo2','photo3','photo4','photo5',
  'reportFiles'
]);

const labelFor = (k: string) => {
  const spaced = k.replace(/([A-Z])/g, ' $1').replace(/_/g, ' ').trim();
  return spaced.charAt(0).toUpperCase() + spaced.slice(1);
};

export const CustomFormResponseView: React.FC<CustomFormResponseViewProps> = ({ responseId, onClose }) => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [patient, setPatient] = useState<PatientRow | null>(null);
  const [answers, setAnswers] = useState<CustomQuestionResponseRow[]>([]);
  const [signedUrls, setSignedUrls] = useState<Record<string, string>>({});
  const [systemForm, setSystemForm] = useState<LinkedSystemForm | null>(null);
  const [systemKey, setSystemKey] = useState<string | null>(null);
  const [submittedAt, setSubmittedAt] = useState<string>('');

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      try {
        const data = await customResponseService.getWithAnswers(responseId);
        if (cancelled) return;
        if (!data) { setError('Response not found.'); setLoading(false); return; }
        setAnswers(data.answers);
        setSystemKey(data.response.system_key ?? null);
        setSubmittedAt(data.response.submitted_at ?? data.response.created_at ?? '');

        if (data.response.patient_id) {
          const p = await patientService.get(data.response.patient_id);
          if (!cancelled) setPatient(p);
        }

        if (data.response.share_token_id) {
          const { data: sysRows } = await supabase
            .from('system_forms')
            .select('id,chief_complaints,duration,severity,modalities_aggravation,modalities_amelioration,concomitants,clinical_notes,data,system_key,updated_at')
            .eq('share_token_id', data.response.share_token_id)
            .limit(1);
          if (!cancelled && sysRows && sysRows.length > 0) {
            setSystemForm(sysRows[0] as LinkedSystemForm);
            if (!data.response.system_key) setSystemKey(sysRows[0].system_key ?? null);
          }
        }

        const attachments = await fileAttachmentService.listForEntity('custom_response', data.response.id);
        const urlMap: Record<string, string> = {};
        for (const att of attachments) {
          const signed = await fileAttachmentService.signedUrl(att.storage_path, 3600);
          if (signed) urlMap[att.question_response_id ?? att.id] = signed;
        }
        if (!cancelled) setSignedUrls(urlMap);
      } catch (err) {
        if (!cancelled) setError(err instanceof Error ? err.message : 'Failed to load response.');
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    void load();
    return () => { cancelled = true; };
  }, [responseId]);

  if (loading) {
    return (
      <div className="p-6 flex items-center justify-center gap-2 text-slate-500 text-sm">
        <Loader2 className="w-4 h-4 animate-spin" />Loading submission...
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 bg-rose-50 border border-rose-200 rounded-xl text-rose-800 text-sm flex items-center gap-2">
        <AlertCircle className="w-4 h-4" />{error}
      </div>
    );
  }

  const sysLabel = systemKey
    ? (CLINICAL_SYSTEMS_METADATA.find(s => s.key === systemKey)?.label || systemKey.replace(/_/g, ' '))
    : 'Clinical System';

  const builtInRows: { label: string; value: string }[] = [];
  if (systemForm) {
    const push = (label: string, val: unknown) => {
      if (isMeaningful(val)) builtInRows.push({ label, value: displayValue(val) });
    };
    push('Chief Complaint', systemForm.chief_complaints);
    push('Duration', systemForm.duration);
    push('Severity', systemForm.severity);
    push('Aggravation (Worse)', systemForm.modalities_aggravation);
    push('Amelioration (Better)', systemForm.modalities_amelioration);
    push('Concomitants', systemForm.concomitants);
    push('Clinical Notes', systemForm.clinical_notes);
    if (systemForm.data && typeof systemForm.data === 'object') {
      Object.entries(systemForm.data).forEach(([k, v]) => {
        if (IGNORE_KEYS.has(k)) return;
        if (!isMeaningful(v)) return;
        if (typeof v === 'string' && v.startsWith('data:image')) return;
        push(labelFor(k), v);
      });
    }
  }

  const visibleAnswers = answers.filter(a => {
    if (isMeaningful(a.text_value)) return true;
    if (a.numeric_value !== null && a.numeric_value !== undefined) return true;
    if (isMeaningful(a.date_value)) return true;
    if (isMeaningful(a.time_value)) return true;
    if (a.boolean_value !== null && a.boolean_value !== undefined) return true;
    if (Array.isArray(a.selected_options) && a.selected_options.some(isMeaningful)) return true;
    if (signedUrls[a.id]) return true;
    return false;
  });

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm">
      <div className="p-5 border-b border-slate-200 flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2">
            <FileText className="w-6 h-6 text-indigo-600" />
            <h3 className="font-bold text-slate-900 text-xl">Patient Submission</h3>
          </div>
          <div className="text-sm text-slate-600 mt-1.5 flex items-center gap-4 flex-wrap">
            {patient && (
              <span className="flex items-center gap-1.5">
                <User className="w-4 h-4" />
                <strong className="text-slate-900">{patient.name}</strong>
              </span>
            )}
            <span className="flex items-center gap-1.5">
              <Stethoscope className="w-4 h-4" />
              <strong className="text-slate-900">{sysLabel}</strong>
            </span>
            <span className="flex items-center gap-1.5">
              <Calendar className="w-4 h-4" />
              {submittedAt ? new Date(submittedAt).toLocaleString() : new Date().toLocaleDateString()}
            </span>
          </div>
        </div>
        {onClose && (
          <button type="button" onClick={onClose} className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700">
            <X className="w-5 h-5" />
          </button>
        )}
      </div>

      <div className="p-6 space-y-8 text-base">
        <section>
          <div className="flex items-center gap-2 mb-4">
            <ClipboardList className="w-5 h-5 text-emerald-600" />
            <h4 className="font-bold text-slate-900 text-lg">Built-in Clinical Responses</h4>
          </div>
          {builtInRows.length === 0 ? (
            <div className="p-5 text-center text-slate-400 text-sm bg-slate-50 rounded-xl border border-dashed border-slate-200">
              No built-in responses submitted.
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {builtInRows.map((row, i) => (
                <div key={i} className="p-4 bg-emerald-50/60 border border-emerald-200 rounded-xl">
                  <span className="text-xs uppercase font-bold text-emerald-800 block mb-1">{row.label}</span>
                  <p className="text-slate-900 font-semibold text-base whitespace-pre-wrap">{row.value}</p>
                </div>
              ))}
            </div>
          )}
        </section>

        <section className="border-t border-slate-200 pt-6">
          <div className="flex items-center gap-2 mb-4">
            <FileText className="w-5 h-5 text-indigo-600" />
            <h4 className="font-bold text-slate-900 text-lg">Custom Question Responses</h4>
          </div>
          {visibleAnswers.length === 0 ? (
            <div className="p-5 text-center text-slate-400 text-sm bg-slate-50 rounded-xl border border-dashed border-slate-200">
              No custom answers submitted.
            </div>
          ) : (
            <div className="space-y-3">
              {visibleAnswers.map((a, idx) => {
                const attachmentUrl = signedUrls[a.id];
                return (
                  <div key={a.id} className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-2">
                    <div className="text-xs text-slate-500 font-mono uppercase">Q{idx + 1} • {a.question_type}</div>
                    <div className="font-bold text-slate-900 text-base">{a.question_label ?? 'Question'}</div>
                    {isMeaningful(a.text_value) && (
                      <div className="text-slate-800 text-base whitespace-pre-wrap">{displayValue(a.text_value)}</div>
                    )}
                    {a.numeric_value !== null && a.numeric_value !== undefined && (
                      <div className="text-slate-800 text-base font-mono">{a.numeric_value}</div>
                    )}
                    {isMeaningful(a.date_value) && <div className="text-slate-800 text-base">{a.date_value}</div>}
                    {isMeaningful(a.time_value) && (
                      <div className="text-slate-800 text-base flex items-center gap-1">
                        <Clock className="w-4 h-4 text-slate-400" />{a.time_value}
                      </div>
                    )}
                    {a.boolean_value !== null && a.boolean_value !== undefined && (
                      <div className="text-slate-800 text-base font-semibold">{a.boolean_value ? 'Yes' : 'No'}</div>
                    )}
                    {Array.isArray(a.selected_options) && a.selected_options.some(isMeaningful) && (
                      <div className="flex flex-wrap gap-2">
                        {(a.selected_options as string[]).filter(isMeaningful).map(opt => (
                          <span key={opt} className="px-3 py-1.5 bg-indigo-50 text-indigo-900 rounded-lg border border-indigo-200 text-sm font-medium">
                            {opt}
                          </span>
                        ))}
                      </div>
                    )}
                    {attachmentUrl && (
                      <div className="pt-1">
                        {a.question_type === 'image_upload' || a.question_type === 'multiple_image_upload' ? (
                          <img src={attachmentUrl} alt="Attachment" className="max-w-full max-h-80 rounded-lg border border-slate-200" />
                        ) : (
                          <a href={attachmentUrl} target="_blank" rel="noopener noreferrer"
                            className="inline-flex items-center gap-2 text-sm font-semibold text-emerald-700 hover:text-emerald-900">
                            <Download className="w-4 h-4" />Download attachment
                          </a>
                        )}
                      </div>
                    )}
                    {attachmentUrl && (
                      <div className="text-xs text-slate-400 flex items-center gap-1">
                        <ImageIcon className="w-3.5 h-3.5" />Secure signed URL (expires in 1 hour)
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </section>
      </div>
    </div>
  );
};