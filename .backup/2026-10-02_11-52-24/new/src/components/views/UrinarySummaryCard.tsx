import React from 'react';
import type { SystemFormRecord, Patient } from '../../types';
import { useClinic } from '../../context/ClinicContext';
import { Droplets, Edit3, Share2, Flame, Activity } from 'lucide-react';

interface Props {
  record: SystemFormRecord;
  patient?: Patient;
}

export const UrinarySummaryCard: React.FC<Props> = ({ record, patient }) => {
  const { setActiveTab, setActiveSystemFormKey, openWhatsAppShareDialog } = useClinic();
  const data = (record.data ?? {}) as Record<string, any>;

  const frequency = Array.isArray(data.frequency) ? data.frequency : [];
  const dysuria = Array.isArray(data.painBurning) ? data.painBurning : [];
  const renalPain = Array.isArray(data.renalPain) ? data.renalPain : [];
  const sediment = Array.isArray(data.sedimentColor) ? data.sedimentColor : [];

  return (
    <div className="rounded-2xl border-2 border-emerald-600/30 bg-white p-6 shadow-sm space-y-5 text-xs">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 border-b border-emerald-100 pb-4">
        <div>
          <span className="px-2.5 py-1 rounded-md bg-emerald-100/80 text-emerald-800 text-[10px] font-bold uppercase">
            Urinary Record
          </span>
          <h3 className="text-base font-bold text-emerald-900 font-serif mt-1">
            Urinary System Case Summary
          </h3>
          <p className="text-[11px] text-slate-500">
            {patient?.name} • Updated {new Date(record.updatedAt).toLocaleString()}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              setActiveSystemFormKey('urinary');
              setActiveTab('case_taking');
            }}
            className="px-3 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 rounded-lg text-xs font-semibold flex items-center gap-1"
          >
            <Edit3 className="w-3.5 h-3.5" />
            Edit
          </button>
          {patient && (
            <button
              onClick={() => openWhatsAppShareDialog(patient.id, 'urinary')}
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
          <span className="text-[10px] text-slate-500 block uppercase font-semibold">Frequency</span>
          <span className="font-bold text-xs line-clamp-1">{frequency[0] || '—'}</span>
        </div>
        <div>
          <span className="text-[10px] text-slate-500 block uppercase font-semibold">Follow-up</span>
          <span className="font-bold text-emerald-800 text-xs">{data.followup || '—'}</span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
          <h4 className="font-bold text-slate-900 flex items-center gap-1.5">
            <Flame className="w-3.5 h-3.5 text-rose-600" />
            Burning &amp; Frequency
          </h4>
          {dysuria.length > 0 && (
            <div className="flex flex-wrap gap-1.5">
              {dysuria.map((d: string) => (
                <span key={d} className="px-2 py-0.5 bg-rose-50 border border-rose-200 text-rose-800 rounded text-[10px]">
                  {d}
                </span>
              ))}
            </div>
          )}
          {frequency.length > 0 && (
            <div className="flex flex-wrap gap-1.5">
              {frequency.map((f: string) => (
                <span key={f} className="px-2 py-0.5 bg-amber-50 border border-amber-200 text-amber-800 rounded text-[10px]">
                  {f}
                </span>
              ))}
            </div>
          )}
        </div>

        <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
          <h4 className="font-bold text-slate-900 flex items-center gap-1.5">
            <Droplets className="w-3.5 h-3.5 text-cyan-600" />
            Renal &amp; Sediment
          </h4>
          {renalPain.length > 0 && (
            <div className="flex flex-wrap gap-1.5">
              {renalPain.map((r: string) => (
                <span key={r} className="px-2 py-0.5 bg-indigo-50 border border-indigo-200 text-indigo-800 rounded text-[10px]">
                  {r}
                </span>
              ))}
            </div>
          )}
          {sediment.length > 0 && (
            <div className="flex flex-wrap gap-1.5">
              {sediment.map((s: string) => (
                <span key={s} className="px-2 py-0.5 bg-amber-50 border border-amber-200 text-amber-800 rounded text-[10px]">
                  {s}
                </span>
              ))}
            </div>
          )}
        </div>
      </div>

      <span className="hidden">
        <Activity />
      </span>
    </div>
  );
};