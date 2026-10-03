import React from 'react';
import type { SystemFormRecord, Patient } from '../../types';
import { useClinic } from '../../context/ClinicContext';
import {
  Brain,
  Edit3,
  Share2,
  Sparkles,
  Zap,
  Activity,
  Heart,
  Moon,
  FileText
} from 'lucide-react';

interface Props {
  record: SystemFormRecord;
  patient?: Patient;
}

export const MindGeneralsSummaryCard: React.FC<Props> = ({ record, patient }) => {
  const { setActiveTab, setActiveSystemFormKey, openWhatsAppShareDialog } = useClinic();
  const data = (record.data ?? {}) as Record<string, any>;

  const mindStates = Array.isArray(data.mind) ? data.mind : [];
  const triggers = Array.isArray(data.trigger) ? data.trigger : [];
  const bodySymptoms = Array.isArray(data.body) ? data.body : [];
  const rubrics = Array.isArray(data.rubrics) ? data.rubrics : [];
  const modalities = Array.isArray(data.mod) ? data.mod : [];

  return (
    <div className="rounded-2xl border-2 border-emerald-600/30 bg-white p-6 shadow-sm space-y-5 text-xs">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 border-b border-emerald-100 pb-4">
        <div>
          <span className="px-2.5 py-1 rounded-md bg-emerald-100/80 text-emerald-900 text-[10px] font-bold uppercase flex items-center gap-1">
            <Brain className="w-3 h-3 text-emerald-700" />
            Mind &amp; Generals Record
          </span>
          <h3 className="text-base font-bold text-emerald-900 font-serif mt-1">
            Psycho-Somatic Case Summary
          </h3>
          <p className="text-[11px] text-slate-500">
            {patient?.name} • Updated {new Date(record.updatedAt).toLocaleString()}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              setActiveSystemFormKey('other_mind_generals');
              setActiveTab('case_taking');
            }}
            className="px-3 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 rounded-lg text-xs font-semibold flex items-center gap-1"
          >
            <Edit3 className="w-3.5 h-3.5" />
            Edit
          </button>
          {patient && (
            <button
              onClick={() => openWhatsAppShareDialog(patient.id, 'other_mind_generals')}
              className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-semibold flex items-center gap-1"
            >
              <Share2 className="w-3.5 h-3.5" />
              Share
            </button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-emerald-50/50 p-3.5 rounded-xl border border-emerald-100">
        <div>
          <span className="text-[10px] text-slate-500 block uppercase font-semibold">
            Chief
          </span>
          <span className="font-bold text-slate-900 text-xs block truncate">
            {record.chiefComplaints || data.mainComplaint || 'Psycho-Somatic'}
          </span>
        </div>
        <div>
          <span className="text-[10px] text-slate-500 block uppercase font-semibold">
            Mental States
          </span>
          <span className="font-bold text-emerald-900 text-xs block truncate">
            {mindStates.length} selected
          </span>
        </div>
        <div>
          <span className="text-[10px] text-slate-500 block uppercase font-semibold">
            Triggers
          </span>
          <span className="font-bold text-slate-900 text-xs block truncate">
            {triggers.length > 0 ? triggers.join(', ') : '—'}
          </span>
        </div>
        <div>
          <span className="text-[10px] text-slate-500 block uppercase font-semibold">
            Vitals
          </span>
          <span className="font-bold text-slate-900 text-xs block truncate">
            {data.bp || '—'} • {data.pulse || '—'}
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
          <h4 className="font-bold text-slate-900 flex items-center gap-1.5">
            <Activity className="w-3.5 h-3.5 text-emerald-600" />
            Physical Complaints
          </h4>
          {data.mainComplaint && (
            <div className="text-[11px] text-slate-800 bg-white p-2.5 rounded-lg border border-slate-200">
              <strong className="block text-slate-900 mb-0.5">Main:</strong>
              {data.mainComplaint}
            </div>
          )}
          {data.complaintCharacter && (
            <div className="text-[11px] text-slate-700">
              <strong>Character:</strong> {data.complaintCharacter}
            </div>
          )}
          <div className="grid grid-cols-2 gap-2 text-[11px] pt-1">
            <div>
              Onset: <strong>{data.onsetDuration || '—'}</strong>
            </div>
            <div>
              Associated: <strong>{data.associated || '—'}</strong>
            </div>
          </div>
        </div>

        <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
          <h4 className="font-bold text-slate-900 flex items-center gap-1.5">
            <Brain className="w-3.5 h-3.5 text-emerald-600" />
            Mental &amp; Emotional
          </h4>
          {mindStates.length > 0 ? (
            <div className="flex flex-wrap gap-1.5">
              {mindStates.map((m: string) => (
                <span
                  key={m}
                  className="px-2 py-0.5 rounded-md bg-white border border-emerald-200 text-emerald-900 text-[10px] font-medium"
                >
                  {m}
                </span>
              ))}
            </div>
          ) : (
            <p className="text-slate-500 text-[11px] italic">No states checked.</p>
          )}
          {data.mentalDetail && (
            <div className="text-[11px] text-slate-700 bg-white p-2.5 rounded-lg border border-slate-200 mt-2">
              <strong className="block text-slate-900 mb-0.5">Detail:</strong>
              {data.mentalDetail}
            </div>
          )}
        </div>
      </div>

      {(data.seqEvent || data.seqEmotion || data.seqThought || data.seqPhysical) && (
        <div className="p-3.5 rounded-xl border border-amber-200 bg-amber-50/40 space-y-2">
          <h4 className="font-bold text-amber-950 flex items-center gap-1.5">
            <Zap className="w-3.5 h-3.5 text-amber-600" />
            Emotion → Body Sequence
          </h4>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-[11px]">
            <div className="bg-white p-2 rounded border border-amber-200">
              <strong className="text-amber-900 block text-[10px]">Event</strong>
              {data.seqEvent || '—'}
            </div>
            <div className="bg-white p-2 rounded border border-amber-200">
              <strong className="text-amber-900 block text-[10px]">Emotion</strong>
              {data.seqEmotion || '—'}
            </div>
            <div className="bg-white p-2 rounded border border-amber-200">
              <strong className="text-amber-900 block text-[10px]">Thought</strong>
              {data.seqThought || '—'}
            </div>
            <div className="bg-white p-2 rounded border border-amber-200">
              <strong className="text-amber-900 block text-[10px]">Body</strong>
              <span className="font-semibold text-rose-700">{data.seqPhysical || '—'}</span>
            </div>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-[11px]">
            <div>
              Onset: <strong>{data.seqOnset || '—'}</strong>
            </div>
            <div>
              Duration: <strong>{data.seqDuration || '—'}</strong>
            </div>
            <div>
              Modalities: <strong>{data.seqModalities || '—'}</strong>
            </div>
            <div>
              Concomitants: <strong>{data.seqConcomitant || '—'}</strong>
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
          <h4 className="font-bold text-slate-900 flex items-center gap-1.5">
            <Heart className="w-3.5 h-3.5 text-teal-600" />
            Somatization
          </h4>
          {bodySymptoms.length > 0 ? (
            <div className="flex flex-wrap gap-1.5">
              {bodySymptoms.map((b: string) => (
                <span
                  key={b}
                  className="px-2 py-0.5 rounded bg-white border border-teal-200 text-teal-900 text-[10px] font-medium"
                >
                  {b}
                </span>
              ))}
            </div>
          ) : (
            <p className="text-slate-500 text-[11px] italic">No organ mappings.</p>
          )}
        </div>

        <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
          <h4 className="font-bold text-slate-900 flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-purple-600" />
            Kent Rubrics
          </h4>
          {rubrics.length > 0 ? (
            <div className="flex flex-wrap gap-1.5">
              {rubrics.map((r: string) => (
                <span
                  key={r}
                  className="px-2 py-0.5 rounded bg-purple-50 border border-purple-200 text-purple-900 text-[10px] font-medium"
                >
                  {r}
                </span>
              ))}
            </div>
          ) : (
            <p className="text-slate-500 text-[11px] italic">No rubrics selected.</p>
          )}
        </div>
      </div>

      {modalities.length > 0 && (
        <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
          <h4 className="font-bold text-slate-900 flex items-center gap-1.5">
            <Moon className="w-3.5 h-3.5 text-slate-700" />
            General Modalities
          </h4>
          <div className="flex flex-wrap gap-1.5">
            {modalities.map((m: string) => (
              <span
                key={m}
                className="px-2 py-0.5 rounded bg-white border border-indigo-200 text-indigo-900 text-[10px]"
              >
                {m}
              </span>
            ))}
          </div>
        </div>
      )}

      {(data.assessment || data.plan) && (
        <div className="p-3.5 rounded-xl border border-emerald-200 bg-emerald-50/40 space-y-1">
          <span className="font-bold text-emerald-950 block text-xs">Assessment &amp; Plan:</span>
          {data.assessment && (
            <p className="text-[11px] font-semibold text-slate-900">{data.assessment}</p>
          )}
          {data.plan && <p className="text-[11px] text-slate-800">{data.plan}</p>}
        </div>
      )}

      <span className="hidden">
        <FileText />
      </span>
    </div>
  );
};