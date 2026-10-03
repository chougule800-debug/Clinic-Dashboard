import React from 'react';
import type { SystemFormRecord, Patient } from '../../types';
import { useClinic } from '../../context/ClinicContext';
import { Brain, Edit3, Activity, Zap } from 'lucide-react';

interface Props {
  record: SystemFormRecord;
  patient?: Patient;
}

export const NeuroSummaryCard: React.FC<Props> = ({ record, patient }) => {
  const { setActiveTab, setActiveSystemFormKey } = useClinic();
  const data = (record.data ?? {}) as Record<string, any>;

  const locations = Array.isArray(data.painLocation) ? data.painLocation : (data.location ? [data.location] : []);
  const sensations = Array.isArray(data.painSensation) ? data.painSensation : (data.sensation ? [data.sensation] : []);
  const triggers = Array.isArray(data.triggers) ? data.triggers : [];
  const reliefs = Array.isArray(data.relievingFactors) ? data.relievingFactors : [];
  const auras = Array.isArray(data.auraSymptoms) ? data.auraSymptoms : [];

  return (
    <div className="rounded-2xl border-2 border-teal-600/30 bg-white p-6 shadow-sm space-y-5 text-xs">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 border-b border-teal-100 pb-4">
        <div>
          <span className="px-2.5 py-1 rounded-md bg-teal-100/80 text-teal-800 text-[10px] font-bold uppercase">Neurological Record</span>
          <h3 className="text-base font-bold text-teal-900 font-serif mt-1">Headache / Neurological Case Summary</h3>
          <p className="text-[11px] text-slate-500">{patient?.name} • Updated {new Date(record.updatedAt).toLocaleString()}</p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => { setActiveSystemFormKey('headache'); setActiveTab('case_taking'); }}
            className="px-3 py-1.5 bg-teal-50 hover:bg-teal-100 text-teal-800 border border-teal-200 rounded-lg text-xs font-semibold flex items-center gap-1"
          >
            <Edit3 className="w-3.5 h-3.5" />Edit
          </button>
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-teal-50/50 p-3.5 rounded-xl border border-teal-100">
        <div>
          <span className="text-[10px] text-slate-500 block uppercase font-semibold">Chief</span>
          <span className="font-bold text-slate-900 text-xs line-clamp-2">{record.chiefComplaints}</span>
        </div>
        <div>
          <span className="text-[10px] text-slate-500 block uppercase font-semibold">Severity</span>
          <span className="font-bold text-xs">{record.severity}</span>
        </div>
        <div>
          <span className="text-[10px] text-slate-500 block uppercase font-semibold">Duration</span>
          <span className="font-bold text-xs">{record.duration}</span>
        </div>
        <div>
          <span className="text-[10px] text-slate-500 block uppercase font-semibold">Frequency</span>
          <span className="font-bold text-xs">{data.frequency || '—'}</span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
          <h4 className="font-bold text-slate-900 flex items-center gap-1.5"><Zap className="w-3.5 h-3.5 text-amber-600" />Location &amp; Sensation</h4>
          {locations.length > 0 && (
            <div className="flex flex-wrap gap-1.5">
              {locations.map((loc: string) => (
                <span key={loc} className="px-2 py-0.5 bg-amber-50 border border-amber-200 text-amber-800 rounded text-[10px]">{loc}</span>
              ))}
            </div>
          )}
          {sensations.length > 0 && (
            <div className="flex flex-wrap gap-1.5">
              {sensations.map((sen: string) => (
                <span key={sen} className="px-2 py-0.5 bg-indigo-50 border border-indigo-200 text-indigo-800 rounded text-[10px]">{sen}</span>
              ))}
            </div>
          )}
        </div>
        <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
          <h4 className="font-bold text-slate-900 flex items-center gap-1.5"><Activity className="w-3.5 h-3.5 text-teal-600" />Modalities</h4>
          {triggers.length > 0 && (
            <div>
              <span className="text-[10px] font-bold text-rose-700 block">Aggravation:</span>
              <div className="flex flex-wrap gap-1 mt-0.5">
                {triggers.map((t: string) => (
                  <span key={t} className="px-2 py-0.5 bg-rose-50 border border-rose-200 text-rose-800 rounded text-[10px]">{t}</span>
                ))}
              </div>
            </div>
          )}
          {reliefs.length > 0 && (
            <div>
              <span className="text-[10px] font-bold text-emerald-700 block">Amelioration:</span>
              <div className="flex flex-wrap gap-1 mt-0.5">
                {reliefs.map((r: string) => (
                  <span key={r} className="px-2 py-0.5 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded text-[10px]">{r}</span>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {auras.length > 0 && (
        <div className="p-3 bg-cyan-50/60 rounded-xl border border-cyan-200">
          <span className="font-bold text-cyan-900 block text-[10px] uppercase mb-1">Aura &amp; Associated Symptoms</span>
          <div className="flex flex-wrap gap-1.5">
            {auras.map((a: string) => (
              <span key={a} className="px-2 py-0.5 bg-white border border-cyan-200 text-cyan-800 rounded text-[10px]">{a}</span>
            ))}
          </div>
        </div>
      )}
      <span className="hidden"><Brain /></span>
    </div>
  );
};