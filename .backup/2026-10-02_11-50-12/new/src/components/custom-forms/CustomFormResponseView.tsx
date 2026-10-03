import React, { useEffect, useState } from 'react';
import { customResponseService, type CustomQuestionResponseRow } from '../../lib/services/customResponses';
import { fileAttachmentService } from '../../lib/services/fileAttachments';
import { patientService, type PatientRow } from '../../lib/services/patients';
import {
  Loader2,
  AlertCircle,
  FileText,
  Image as ImageIcon,
  Download,
  Calendar,
  User,
  Clock,
  X
} from 'lucide-react';

interface CustomFormResponseViewProps {
  responseId: string;
  onClose?: () => void;
}

export const CustomFormResponseView: React.FC<CustomFormResponseViewProps> = ({
  responseId,
  onClose
}) => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [patient, setPatient] = useState<PatientRow | null>(null);
  const [answers, setAnswers] = useState<CustomQuestionResponseRow[]>([]);
  const [signedUrls, setSignedUrls] = useState<Record<string, string>>({});

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      try {
        const data = await customResponseService.getWithAnswers(responseId);
        if (cancelled) return;
        if (!data) {
          setError('Response not found.');
          setLoading(false);
          return;
        }
        setAnswers(data.answers);

        if (data.response.patient_id) {
          const p = await patientService.get(data.response.patient_id);
          if (!cancelled) setPatient(p);
        }

        // Get signed URLs for any images/files attached
        const attachments = await fileAttachmentService.listForEntity(
          'custom_response',
          data.response.id
        );
        const urlMap: Record<string, string> = {};
        for (const att of attachments) {
          const signed = await fileAttachmentService.signedUrl(att.storage_path, 3600);
          if (signed) {
            const key = att.question_response_id ?? att.id;
            urlMap[key] = signed;
          }
        }
        if (!cancelled) setSignedUrls(urlMap);
      } catch (err) {
        if (!cancelled) setError(err instanceof Error ? err.message : 'Failed to load response.');
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    void load();
    return () => {
      cancelled = true;
    };
  }, [responseId]);

  if (loading) {
    return (
      <div className="p-6 flex items-center justify-center gap-2 text-slate-500 text-xs">
        <Loader2 className="w-4 h-4 animate-spin" />
        Loading response...
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 bg-rose-50 border border-rose-200 rounded-xl text-rose-800 text-xs flex items-center gap-2">
        <AlertCircle className="w-4 h-4" />
        {error}
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm">
      <div className="p-4 border-b border-slate-200 flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2">
            <FileText className="w-5 h-5 text-indigo-600" />
            <h3 className="font-bold text-slate-900">Custom Form Response</h3>
          </div>
          {patient && (
            <div className="text-xs text-slate-500 mt-1 flex items-center gap-3 flex-wrap">
              <span className="flex items-center gap-1">
                <User className="w-3 h-3" />
                <strong className="text-slate-800">{patient.name}</strong>
              </span>
              <span className="flex items-center gap-1">
                <Calendar className="w-3 h-3" />
                {new Date().toLocaleDateString()}
              </span>
            </div>
          )}
        </div>
        {onClose && (
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      <div className="p-5 space-y-4">
        {answers.length === 0 && (
          <div className="p-6 text-center text-xs text-slate-400">No answers recorded.</div>
        )}
        {answers.map((a, idx) => {
          const attachmentUrl = signedUrls[a.id];
          return (
            <div
              key={a.id}
              className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-2"
            >
              <div className="text-[10px] text-slate-400 font-mono uppercase">
                Q{idx + 1} • {a.question_type}
              </div>
              <div className="font-semibold text-slate-800 text-sm">
                {a.question_label ?? 'Question'}
              </div>

              {a.text_value && (
                <div className="text-sm text-slate-700 whitespace-pre-wrap">{a.text_value}</div>
              )}
              {a.numeric_value !== null && a.numeric_value !== undefined && (
                <div className="text-sm text-slate-700 font-mono">{a.numeric_value}</div>
              )}
              {a.date_value && (
                <div className="text-sm text-slate-700">{a.date_value}</div>
              )}
              {a.time_value && (
                <div className="text-sm text-slate-700 flex items-center gap-1">
                  <Clock className="w-3 h-3 text-slate-400" />
                  {a.time_value}
                </div>
              )}
              {a.boolean_value !== null && a.boolean_value !== undefined && (
                <div className="text-sm text-slate-700">
                  {a.boolean_value ? 'Yes' : 'No'}
                </div>
              )}
              {Array.isArray(a.selected_options) && a.selected_options.length > 0 && (
                <div className="flex flex-wrap gap-1.5">
                  {(a.selected_options as string[]).map(opt => (
                    <span
                      key={opt}
                      className="px-2.5 py-1 bg-indigo-50 text-indigo-800 rounded-lg border border-indigo-200 text-xs"
                    >
                      {opt}
                    </span>
                  ))}
                </div>
              )}
              {attachmentUrl && (
                <div className="pt-1">
                  {a.question_type === 'image_upload' ||
                  a.question_type === 'multiple_image_upload' ? (
                    <img
                      src={attachmentUrl}
                      alt="Attachment"
                      className="max-w-full max-h-72 rounded-lg border border-slate-200"
                    />
                  ) : (
                    <a
                      href={attachmentUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-700 hover:text-emerald-900"
                    >
                      <Download className="w-3.5 h-3.5" />
                      Download attachment
                    </a>
                  )}
                </div>
              )}
              {attachmentUrl && (
                <div className="text-[10px] text-slate-400 flex items-center gap-1">
                  <ImageIcon className="w-3 h-3" />
                  Secure signed URL (expires in 1 hour)
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};