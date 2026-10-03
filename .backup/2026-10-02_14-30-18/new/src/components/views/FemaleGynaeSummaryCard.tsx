import React from 'react';
import type { SystemFormRecord, Patient } from '../../types';
import { useClinic } from '../../context/ClinicContext';
import { HeartHandshake, Edit3, Calendar, Activity, Baby, FileText } from 'lucide-react';

interface Props {
  record: SystemFormRecord;
  patient?: Patient;
}

export const FemaleGynaeSummaryCard: React.FC<Props> = ({ record, patient }) => {
  const { setActiveTab, setActiveSystemFormKey } = useClinic();
  const data = (record.data ?? {}) as Record<string, any>;

  const mfeatures = Array.isArray(data.mfeatures) ? data.mfeatures : [];
  const pains = Array.isArray(data.pain) ? data.pain : [];
  const gynSymptoms = Array.isArray(data.gyn) ? data.gyn : [];
  const pregnancies = Array.isArray(data.pregnancies) ? data.pregnancies : [];
  const investigations = Array.isArray(data.investigation) ? data.investigation : [];

  const infertilityActive = data.infertilityType && data.infertilityType !== 'Not applicable / लागू नाही';

  return (
    <div className="rounded-2xl border-2 border-pink-500/30 bg-white p-6 shadow-sm space-y-5 text-xs">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 border-b border-pink-100 pb-4">
        <div>
          <span className="px-2.5 py-1 rounded-md bg-pink-100/80 text-pink-800 text-[10px] font-bold uppercase flex items-center gap-1">
            <HeartHandshake className="w-3 h-3" />Female &amp; Gynecological Record
          </span>
          <h3 className="text-base font-bold text-pink-900 font-serif mt-1">Female / Gynae Case Summary</h3>
          <p className="text-[11px] text-slate-500">{patient?.name} • Updated {new Date(record.updatedAt).toLocaleString()}</p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => { setActiveSystemFormKey('female_gynae'); setActiveTab('case_taking'); }}
            className="px-3 py-1.5 bg-pink-50 hover:bg-pink-100 text-pink-800 border border-pink-200 rounded-lg text-xs font-semibold flex items-center gap-1"
          >
            <Edit3 className="w-3.5 h-3.5" />Edit
          </button>
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-pink-50/50 p-3.5 rounded-xl border border-pink-100">
        <div>
          <span className="text-[10px] text-slate-500 block uppercase font-semibold">Cycle</span>
          <span className="font-bold text-slate-900 text-xs block truncate">{data.cycleLength || '28'}d / {data.duration || '4'}d</span>
        </div>
        <div>
          <span className="text-[10px] text-slate-500 block uppercase font-semibold">LMP</span>
          <span className="font-bold text-pink-900 text-xs block truncate">{data.lmp || '—'}</span>
        </div>
        <div>
          <span className="text-[10px] text-slate-500 block uppercase font-semibold">Obstetric (G P A L)</span>
          <span className="font-bold text-slate-900 text-xs block truncate">
            G{data.gravida || 0} P{data.para || 0} A{data.abortions || 0} L{data.living || 0}
          </span>
        </div>
        <div>
          <span className="text-[10px] text-slate-500 block uppercase font-semibold">Infertility</span>
          <span className="font-bold text-slate-900 text-xs block truncate">
            {infertilityActive ? data.infertilityType : 'Not applicable'}
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
          <h4 className="font-bold text-slate-900 flex items-center gap-1.5"><Calendar className="w-3.5 h-3.5 text-pink-600" />Menstrual History</h4>
          <div className="grid grid-cols-2 gap-2 text-[11px]">
            <div>Menarche: <strong>{data.menarche || '—'}</strong></div>
            <div>Flow: <strong>{data.flow || '—'}</strong></div>
          </div>
          {mfeatures.length > 0 && (
            <div className="flex flex-wrap gap-1.5">
              {mfeatures.map((f: string) => (
                <span key={f} className="px-2 py-0.5 bg-pink-50 border border-pink-200 text-pink-800 rounded text-[10px]">{f}</span>
              ))}
            </div>
          )}
          {pains.length > 0 && (
            <div className="flex flex-wrap gap-1.5">
              {pains.map((p: string) => (
                <span key={p} className="px-2 py-0.5 bg-rose-50 border border-rose-200 text-rose-800 rounded text-[10px]">{p}</span>
              ))}
            </div>
          )}
        </div>
        <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
          <h4 className="font-bold text-slate-900 flex items-center gap-1.5"><Activity className="w-3.5 h-3.5 text-pink-600" />Gynae Symptoms</h4>
          {gynSymptoms.length > 0 ? (
            <div className="flex flex-wrap gap-1.5">
              {gynSymptoms.map((g: string) => (
                <span key={g} className="px-2 py-0.5 bg-white border border-slate-300 text-slate-800 rounded text-[10px]">{g}</span>
              ))}
            </div>
          ) : (
            <p className="text-slate-500 text-[11px] italic">None checked.</p>
          )}
          {data.dischargeCharacter && (
            <div className="text-[11px] bg-white p-2 rounded border border-slate-200 mt-1">
              <strong>Discharge:</strong> {data.dischargeCharacter}
            </div>
          )}
        </div>
      </div>

      {pregnancies.length > 0 && (
        <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
          <h4 className="font-bold text-slate-900 flex items-center gap-1.5">
            <Baby className="w-3.5 h-3.5 text-teal-600" />Pregnancy Records ({pregnancies.length})
          </h4>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-[11px] border-collapse">
              <thead>
                <tr className="border-b border-slate-300 text-slate-500 uppercase text-[10px]">
                  <th className="py-1.5 px-2">#</th>
                  <th className="py-1.5 px-2">Year</th>
                  <th className="py-1.5 px-2">Outcome</th>
                  <th className="py-1.5 px-2">Gestation</th>
                  <th className="py-1.5 px-2">Delivery</th>
                  <th className="py-1.5 px-2">Weight / Sex</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {pregnancies.map((p: any, idx: number) => (
                  <tr key={idx}>
                    <td className="py-1.5 px-2 font-bold">{idx + 1}</td>
                    <td className="py-1.5 px-2">{p.year || '—'}</td>
                    <td className="py-1.5 px-2 font-semibold text-teal-900">{p.outcome || 'Live birth'}</td>
                    <td className="py-1.5 px-2">{p.gestation || '—'}</td>
                    <td className="py-1.5 px-2">{p.delivery || '—'}</td>
                    <td className="py-1.5 px-2">{p.weight || '—'} / {p.sex || '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {(investigations.length > 0 || data.reportFinding) && (
        <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
          <h4 className="font-bold text-slate-900 flex items-center gap-1.5"><FileText className="w-3.5 h-3.5 text-pink-600" />Investigations</h4>
          {investigations.length > 0 && (
            <div className="flex flex-wrap gap-1.5">
              {investigations.map((inv: string) => (
                <span key={inv} className="px-2 py-0.5 bg-white border border-slate-300 text-slate-700 rounded text-[10px]">{inv}</span>
              ))}
            </div>
          )}
          {data.reportFinding && (
            <div className="text-[11px] text-slate-800 bg-white p-2 rounded-lg border border-slate-200">
              <strong>Findings:</strong> {data.reportFinding}
            </div>
          )}
        </div>
      )}

      {(data.assessment || data.doctorNotes) && (
        <div className="p-3.5 rounded-xl border border-pink-200 bg-pink-50/40 space-y-1">
          <span className="font-bold text-pink-900 block text-xs">Clinical Assessment:</span>
          {data.assessment && <p className="text-[11px] font-semibold text-slate-900">{data.assessment}</p>}
          {data.doctorNotes && <p className="text-[11px] text-slate-800">{data.doctorNotes}</p>}
        </div>
      )}
    </div>
  );
};