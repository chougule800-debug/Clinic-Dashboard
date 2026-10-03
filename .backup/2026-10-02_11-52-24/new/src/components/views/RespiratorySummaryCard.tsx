import React from 'react';
import type { SystemFormRecord, Patient } from '../../types';
import { useClinic } from '../../context/ClinicContext';
import { Wind, Edit3, Share2, Activity, AlertTriangle } from 'lucide-react';

interface Props {
  record: SystemFormRecord;
  patient?: Patient;
}

export const RespiratorySummaryCard: React.FC<Props> = ({ record, patient }) => {
  const { setActiveTab, setActiveSystemFormKey, openWhatsAppShareDialog } = useClinic();
  const data = (record.data ?? {}) as Record<string, any>;

  const complaints = Array.isArray(data.complaints) ? data.complaints : [];
  const allergySymptoms = Array.isArray(data.allergySymptoms) ? data.allergySymptoms : [];
  const triggers = Array.isArray(data.triggers) ? data.triggers : [];
  const worse = Array.isArray(data.worse) ? data.worse : [];
  const better = Array.isArray(data.better) ? data.better : [];

  return (
    <div className="rounded-2xl border-2 border-teal-600/30 bg-white p-6 shadow-sm space-y-5 text-xs">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 border-b border-teal-100 pb-4">
        <div>
          <span className="px-2.5 py-1 rounded-md bg-teal-100/80 text-teal-800 text-[10px] font-bold uppercase">
            Respiratory Record
          </span>
          <h3 className="text-base font-bold text-teal-900 font-serif mt-1">
            Respiratory Case Summary
          </h3>
          <p className="text-[11px] text-slate-500">
            {patient?.name} • Updated {new Date(record.updatedAt).toLocaleString()}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              setActiveSystemFormKey('respiratory');
              setActiveTab('case_taking');
            }}
            className="px-3 py-1.5 bg-teal-50 hover:bg-teal-100 text-teal-800 border border-teal-200 rounded-lg text-xs font-semibold flex items-center gap-1"
          >
            <Edit3 className="w-3.5 h-3.5" />
            Edit
          </button>
          {patient && (
            <button
              onClick={() => openWhatsAppShareDialog(patient.id, 'respiratory')}
              className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-semibold flex items-center gap-1"
            >
              <Share2 className="w-3.5 h-3.5" />
              Share
            </button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-teal-50/50 p-3.5 rounded-xl border border-teal-100">
        <div>
          <span className="text-[10px] text-slate-500 block uppercase font-semibold">Chief</span>
          <span className="font-bold text-slate-900 text-xs line-clamp-2">
            {record.chiefComplaints}
          </span>
        </div>
        <div>
          <span className="text-[10px] text-slate-500 block uppercase font-semibold">Severity</span>
          <span className="font-bold text-xs">{record.severity}</span>
        </div>
        <div>
          <span className="text-[10px] text-slate-500 block uppercase font-semibold">Asthma</span>
          <span className="font-bold text-xs">{data.asthmaDiagnosis || '—'}</span>
        </div>
        <div>
          <span className="text-[10px] text-slate-500 block uppercase font-semibold">SpO₂ / PR</span>
          <span className="font-bold text-teal-800 text-xs">
            {data.spo2 || '—'} / {data.pulse || '—'}
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
          <h4 className="font-bold text-slate-900 flex items-center gap-1.5">
            <Activity className="w-3.5 h-3.5 text-teal-600" />
            Complaints &amp; Allergy
          </h4>
          {complaints.length > 0 && (
            <div className="flex flex-wrap gap-1.5">
              {complaints.map((c: string) => (
                <span key={c} className="px-2 py-0.5 bg-teal-50 border border-teal-200 text-teal-800 rounded text-[10px]">
                  {c}
                </span>
              ))}
            </div>
          )}
          {allergySymptoms.length > 0 && (
            <div className="flex flex-wrap gap-1.5">
              {allergySymptoms.map((a: string) => (
                <span key={a} className="px-2 py-0.5 bg-amber-50 border border-amber-200 text-amber-800 rounded text-[10px]">
                  {a}
                </span>
              ))}
            </div>
          )}
        </div>

        <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
          <h4 className="font-bold text-slate-900 flex items-center gap-1.5">
            <Wind className="w-3.5 h-3.5 text-teal-600" />
            Triggers &amp; Modalities
          </h4>
          {triggers.length > 0 && (
            <div>
              <span className="text-[10px] font-bold text-amber-700 block">Triggers:</span>
              <div className="flex flex-wrap gap-1 mt-0.5">
                {triggers.map((t: string) => (
                  <span key={t} className="px-2 py-0.5 bg-amber-50 border border-amber-200 text-amber-800 rounded text-[10px]">
                    {t}
                  </span>
                ))}
              </div>
            </div>
          )}
          {worse.length > 0 && (
            <div>
              <span className="text-[10px] font-bold text-rose-700 block">Aggravation:</span>
              <div className="flex flex-wrap gap-1 mt-0.5">
                {worse.map((w: string) => (
                  <span key={w} className="px-2 py-0.5 bg-rose-50 border border-rose-200 text-rose-800 rounded text-[10px]">
                    {w}
                  </span>
                ))}
              </div>
            </div>
          )}
          {better.length > 0 && (
            <div>
              <span className="text-[10px] font-bold text-emerald-700 block">Amelioration:</span>
              <div className="flex flex-wrap gap-1 mt-0.5">
                {better.map((b: string) => (
                  <span key={b} className="px-2 py-0.5 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded text-[10px]">
                    {b}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {data.reportFinding && (
        <div className="p-3 bg-teal-50/60 border border-teal-200 rounded-xl text-[11px] text-slate-800">
          <strong>Report:</strong> {data.reportFinding}
        </div>
      )}

      <span className="hidden">
        <AlertTriangle />
      </span>
    </div>
  );
};