import React from 'react';
import type { SystemFormRecord, Patient } from '../../types';
import { useClinic } from '../../context/ClinicContext';
import { Utensils, Edit3, Activity, Flame, Apple, ShieldCheck } from 'lucide-react';

interface Props {
  record: SystemFormRecord;
  patient?: Patient;
}

export const GastroSummaryCard: React.FC<Props> = ({ record, patient }) => {
  const { setActiveTab, setActiveSystemFormKey } = useClinic();
  const data = (record.data ?? {}) as Record<string, any>;

  const cravings = Array.isArray(data.cravings) ? data.cravings : [];
  const aversions = Array.isArray(data.aversions) ? data.aversions : [];
  const acidity = Array.isArray(data.acidityReflux) ? data.acidityReflux : [];
  const bowels = Array.isArray(data.bowels) ? data.bowels : [];
  const triggers = Array.isArray(data.triggers) ? data.triggers : [];

  return (
    <div className="rounded-2xl border-2 border-emerald-600/30 bg-white p-6 shadow-sm space-y-5 text-xs">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 border-b border-emerald-100 pb-4">
        <div>
          <span className="px-2.5 py-1 rounded-md bg-emerald-100/80 text-emerald-800 text-[10px] font-bold uppercase">Gastrointestinal Record</span>
          <h3 className="text-base font-bold text-emerald-900 font-serif mt-1">Gastrointestinal Case Summary</h3>
          <p className="text-[11px] text-slate-500">{patient?.name} • Updated {new Date(record.updatedAt).toLocaleString()}</p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => { setActiveSystemFormKey('gastrointestinal'); setActiveTab('case_taking'); }}
            className="px-3 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 rounded-lg text-xs font-semibold flex items-center gap-1"
          >
            <Edit3 className="w-3.5 h-3.5" />Edit
          </button>
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-emerald-50/50 p-3.5 rounded-xl border border-emerald-100">
        <div>
          <span className="text-[10px] text-slate-500 block uppercase font-semibold">Chief</span>
          <span className="font-bold text-slate-900 text-xs line-clamp-2">{record.chiefComplaints}</span>
        </div>
        <div>
          <span className="text-[10px] text-slate-500 block uppercase font-semibold">Appetite</span>
          <span className="font-bold text-xs">{data.appetite || '—'}</span>
        </div>
        <div>
          <span className="text-[10px] text-slate-500 block uppercase font-semibold">Thirst</span>
          <span className="font-bold text-xs">{data.thirst || '—'}</span>
        </div>
        <div>
          <span className="text-[10px] text-slate-500 block uppercase font-semibold">Bowels</span>
          <span className="font-bold text-xs line-clamp-1">{bowels[0] || '—'}</span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
          <h4 className="font-bold text-slate-900 flex items-center gap-1.5"><Flame className="w-3.5 h-3.5 text-rose-600" />Acidity &amp; Bowels</h4>
          {acidity.length > 0 && (
            <div className="flex flex-wrap gap-1.5">
              {acidity.map((a: string) => (
                <span key={a} className="px-2 py-0.5 bg-rose-50 border border-rose-200 text-rose-800 rounded text-[10px]">{a}</span>
              ))}
            </div>
          )}
          {bowels.length > 0 && (
            <div className="flex flex-wrap gap-1.5">
              {bowels.map((b: string) => (
                <span key={b} className="px-2 py-0.5 bg-amber-50 border border-amber-200 text-amber-800 rounded text-[10px]">{b}</span>
              ))}
            </div>
          )}
        </div>
        <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
          <h4 className="font-bold text-slate-900 flex items-center gap-1.5"><Apple className="w-3.5 h-3.5 text-emerald-600" />Cravings &amp; Aversions</h4>
          {cravings.length > 0 && (
            <div>
              <span className="text-[10px] font-bold text-emerald-700 block">Cravings:</span>
              <div className="flex flex-wrap gap-1 mt-0.5">
                {cravings.map((c: string) => (
                  <span key={c} className="px-2 py-0.5 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded text-[10px]">{c}</span>
                ))}
              </div>
            </div>
          )}
          {aversions.length > 0 && (
            <div>
              <span className="text-[10px] font-bold text-rose-700 block">Aversions:</span>
              <div className="flex flex-wrap gap-1 mt-0.5">
                {aversions.map((a: string) => (
                  <span key={a} className="px-2 py-0.5 bg-rose-50 border border-rose-200 text-rose-800 rounded text-[10px]">{a}</span>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {triggers.length > 0 && (
        <div className="p-3 bg-rose-50/60 rounded-xl border border-rose-200">
          <span className="font-bold text-rose-900 block text-[10px] uppercase mb-1">Triggers</span>
          <div className="flex flex-wrap gap-1.5">
            {triggers.map((t: string) => (
              <span key={t} className="px-2 py-0.5 bg-white border border-rose-200 text-rose-800 rounded text-[10px]">{t}</span>
            ))}
          </div>
        </div>
      )}

      {record.clinicalNotes && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl">
          <span className="text-[10px] font-bold uppercase text-emerald-900 block mb-0.5">Notes</span>
          <p className="text-[11px] text-slate-800">{record.clinicalNotes}</p>
        </div>
      )}

      <span className="hidden"><Utensils /><Activity /><ShieldCheck /></span>
    </div>
  );
};