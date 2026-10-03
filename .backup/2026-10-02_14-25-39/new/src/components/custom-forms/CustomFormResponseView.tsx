import React, { useEffect, useState } from 'react';
import { customResponseService, type CustomQuestionResponseRow } from '../../lib/services/customResponses';
import { fileAttachmentService } from '../../lib/services/fileAttachments';
import { patientService, type PatientRow } from '../../lib/services/patients';
import { supabase } from '../../lib/supabase';
import { CLINICAL_SYSTEMS_METADATA } from '../../data/mockData';
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

export const CustomFormResponseView: React.FC<CustomFormResponseViewProps> = ({ responseId, onClose }) => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [patient, setPatient] = useState<PatientRow | null>(null);
  const [answers, setAnswers] = useState<CustomQuestionResponseRow[]>([]);
  const [signedUrls, setSignedUrls] = useState<Record<string, string>>({});
  const [systemForm, setSystemForm] = useState<LinkedSystemForm | null>(null);
  const [systemKey, setSystemKey] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      try {
        const data = await customResponseService.getWithAnswers(responseId);
        if (cancelled) return;
        if (!data) { setError('Response not found.'); setLoading(false); return; }
        setAnswers(data.answers);
        setSystemKey(data.response.system_key ?? null);

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
            if (!systemKey) setSystemKey(sysRows[0].system_key ?? null);
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
      <div className="p-6 flex items-center justify-center gap-2 text-slate-500 text-xs">
        <Loader2 className="w-4 h-4 animate-spin" />Loading submission...
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 bg-rose-50 border border-rose-200 rounded-xl text-rose-800 text-xs flex items-center gap-2">
        <AlertCircle className="w-4 h-4" />{error}
      </div>
    );
  }

  const sysLabel = systemKey
    ? (CLINICAL_SYSTEMS_METADATA.find(s => s.key === systemKey)?.label || systemKey.replace(/_/g, ' '))
    : 'Clinical System';

  const renderVal = (v: unknown): string => {
    if (v === null || v === undefined || v === '') return '—';
    if (Array.isArray(v)) return v.length ? v.join(', ') : '—';
    return String(v);
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm">
      <div className="p-4 border-b border-slate-200 flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2">
            <FileText className="w-5 h-5 text-indigo-600" />
            <h3 className="font-bold text-slate-900">Patient Submission</h3>
          </div>
          <div className="text-xs text-slate-500 mt-1 flex items-center gap-3 flex-wrap">
            {patient && (
              <span className="flex items-center gap-1">
                <User className="w-3 h-3" />
                <strong className="text-slate-800">{patient.name}</strong>
              </span>
            )}
            <span className="flex items-center gap-1">
              <Stethoscope className="w-3 h-3" />
              <strong className="text-slate-800">{sysLabel}</strong>
            </span>
            <span className="flex items-center gap-1">
              <Calendar className="w-3 h-3" />
              {new Date().toLocaleDateString()}
            </span>
          </div>
        </div>
        {onClose && (
          <button type="button" onClick={onClose} className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700">
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      <div className="p-5 space-y-5">
        {systemForm && (
          <div>
            <div className="flex items-center gap-2 mb-3">
              <ClipboardList className="w-4 h-4 text-emerald-600" />
              <h4 className="font-bold text-slate-900 text-sm">Built-in Clinical Responses</h4>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div className="p-3 bg-emerald-50/60 border border-emerald-200 rounded-xl">
                <span className="text-[10px] uppercase font-bold text-emerald-800 block mb-0.5">Chief Complaints</span>
                <p className="text-slate-900 font-semibold">{renderVal(systemForm.chief_complaints)}</p>
              </div>
              <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl">
                <span className="text-[10px] uppercase font-bold text-slate-500 block mb-0.5">Duration</span>
                <p className="text-slate-900">{renderVal(systemForm.duration)}</p>
              </div>
              <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl">
                <span className="text-[10px] uppercase font-bold text-slate-500 block mb-0.5">Severity</span>
                <p className="text-slate-900">{renderVal(systemForm.severity)}</p>
              </div>
              <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl">
                <span className="text-[10px] uppercase font-bold text-rose-700 block mb-0.5">Aggravation</span>
                <p className="text-slate-900">{renderVal(systemForm.modalities_aggravation)}</p>
              </div>
              <div className="p-3 bg-teal-50 border border-teal-200 rounded-xl">
                <span className="text-[10px] uppercase font-bold text-teal-700 block mb-0.5">Amelioration</span>
                <p className="text-slate-900">{renderVal(systemForm.modalities_amelioration)}</p>
              </div>
              <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl">
                <span className="text-[10px] uppercase font-bold text-slate-500 block mb-0.5">Concomitants</span>
                <p className="text-slate-900">{renderVal(systemForm.concomitants)}</p>
              </div>
            </div>
            {systemForm.data && Object.keys(systemForm.data).length > 0 && (
              <details className="mt-3 p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs">
                <summary className="font-bold text-slate-800 cursor-pointer">System-specific details</summary>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-2">
                  {Object.entries(systemForm.data).map(([k, v]) => {
                    if (k === 'acnePhoto' || k === 'photo1' || k === 'photo2' || k === 'photo3' || k === 'photo4' || k === 'photo5') {
                      if (typeof v === 'string' && v.startsWith('data:image')) {
                        return (
                          <div key={k} className="col-span-2">
                            <span className="text-[10px] uppercase font-bold text-slate-500 block mb-0.5">{k}</span>
                            <img src={v} alt={k} className="max-h-40 rounded border border-slate-200" />
                          </div>
                        );
                      }
                      return null;
                    }
                    return (
                      <div key={k}>
                        <span className="text-[10px] uppercase font-bold text-slate-500 block">{k}</span>
                        <span className="text-slate-900">{renderVal(v)}</span>
                      </div>
                    );
                  })}
                </div>
              </details>
            )}
          </div>
        )}

        <div className="border-t border-slate-200 pt-4">
          <h4 className="font-bold text-slate-900 text-sm mb-3 flex items-center gap-2">
            <FileText className="w-4 h-4 text-indigo-600" />Custom Question Responses
          </h4>
          {answers.length === 0 && (
            <div className="p-6 text-center text-xs text-slate-400">No custom answers recorded.</div>
          )}
          <div className="space-y-3">
            {answers.map((a, idx) => {
              const attachmentUrl = signedUrls[a.id];
              return (
                <div key={a.id} className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-2">
                  <div className="text-[10px] text-slate-400 font-mono uppercase">Q{idx + 1} • {a.question_type}</div>
                  <div className="font-semibold text-slate-800 text-sm">{a.question_label ?? 'Question'}</div>
                  {a.text_value && <div className="text-sm text-slate-700 whitespace-pre-wrap">{a.text_value}</div>}
                  {a.numeric_value !== null && a.numeric_value !== undefined && (
                    <div className="text-sm text-slate-700 font-mono">{a.numeric_value}</div>
                  )}
                  {a.date_value && <div className="text-sm text-slate-700">{a.date_value}</div>}
                  {a.time_value && (
                    <div className="text-sm text-slate-700 flex items-center gap-1">
                      <Clock className="w-3 h-3 text-slate-400" />{a.time_value}
                    </div>
                  )}
                  {a.boolean_value !== null && a.boolean_value !== undefined && (
                    <div className="text-sm text-slate-700">{a.boolean_value ? 'Yes' : 'No'}</div>
                  )}
                  {Array.isArray(a.selected_options) && a.selected_options.length > 0 && (
                    <div className="flex flex-wrap gap-1.5">
                      {(a.selected_options as string[]).map(opt => (
                        <span key={opt} className="px-2.5 py-1 bg-indigo-50 text-indigo-800 rounded-lg border border-indigo-200 text-xs">{opt}</span>
                      ))}
                    </div>
                  )}
                  {attachmentUrl && (
                    <div className="pt-1">
                      {a.question_type === 'image_upload' || a.question_type === 'multiple_image_upload' ? (
                        <img src={attachmentUrl} alt="Attachment" className="max-w-full max-h-72 rounded-lg border border-slate-200" />
                      ) : (
                        <a href={attachmentUrl} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-700 hover:text-emerald-900">
                          <Download className="w-3.5 h-3.5" />Download attachment
                        </a>
                      )}
                    </div>
                  )}
                  {attachmentUrl && (
                    <div className="text-[10px] text-slate-400 flex items-center gap-1">
                      <ImageIcon className="w-3 h-3" />Secure signed URL (expires in 1 hour)
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};