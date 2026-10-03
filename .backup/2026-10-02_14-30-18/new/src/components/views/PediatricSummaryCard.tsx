import React from 'react';
import type { SystemFormRecord, Patient } from '../../types';
import { useClinic } from '../../context/ClinicContext';
import { Baby, Edit3, Brain, Sparkles, Activity, FileText } from 'lucide-react';

interface Props {
  record: SystemFormRecord;
  patient?: Patient;
}

export const PediatricSummaryCard: React.FC<Props> = ({ record, patient }) => {
  const { setActiveTab, setActiveSystemFormKey } = useClinic();
  const data = (record.data ?? {}) as Record<string, any>;

  const complaints = Array.isArray(data.complaints) ? data.complaints : [];
  const food = Array.isArray(data.food) ? data.food : [];
  const concerns = Array.isArray(data.developmentConcerns) ? data.developmentConcerns : [];
  const neuroFlags = Array.isArray(data.neuro) ? data.neuro : [];

  const noDelay = concerns.includes('No delay / विलंब नाही');

  return (
    <div className="rounded-2xl border-2 border-amber-500/30 bg-white p-6 shadow-sm space-y-5 text-xs">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 border-b border-amber-100 pb-4">
        <div>
          <span className="px-2.5 py-1 rounded-md bg-amber-100/80 text-amber-800 text-[10px] font-bold uppercase flex items-center gap-1">
            <Baby className="w-3 h-3" />Pediatric Record
          </span>
          <h3 className="text-base font-bold text-amber-900 font-serif mt-1">Pediatric Case Summary</h3>
          <p className="text-[11px] text-slate-500">{patient?.name} • Updated {new Date(record.updatedAt).toLocaleString()}</p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => { setActiveSystemFormKey('pediatric'); setActiveTab('case_taking'); }}
            className="px-3 py-1.5 bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-200 rounded-lg text-xs font-semibold flex items-center gap-1"
          >
            <Edit3 className="w-3.5 h-3.5" />Edit
          </button>
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-amber-50/50 p-3.5 rounded-xl border border-amber-100">
        <div>
          <span className="text-[10px] text-slate-500 block uppercase font-semibold">Age / Sex</span>
          <span className="font-bold text-slate-900 text-xs block truncate">
            {data.age ? `${data.age} yrs` : '—'} • {data.sex || '—'}
          </span>
        </div>
        <div>
          <span className="text-[10px] text-slate-500 block uppercase font-semibold">Delivery</span>
          <span className="font-bold text-amber-900 text-xs block truncate">{data.deliveryMode || '—'}</span>
        </div>
        <div>
          <span className="text-[10px] text-slate-500 block uppercase font-semibold">Birth Weight</span>
          <span className="font-bold text-slate-900 text-xs block truncate">{data.birthWeight || '—'}</span>
        </div>
        <div>
          <span className="text-[10px] text-slate-500 block uppercase font-semibold">Immunization</span>
          <span className="font-bold text-slate-900 text-xs block truncate">{data.immunization || '—'}</span>
        </div>
      </div>

      {complaints.length > 0 && (
        <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
          <h4 className="font-bold text-slate-900 flex items-center gap-1.5"><Activity className="w-3.5 h-3.5 text-amber-600" />Chief Complaints</h4>
          <div className="flex flex-wrap gap-1.5">
            {complaints.map((c: string) => (
              <span key={c} className="px-2 py-0.5 bg-white border border-amber-200 text-amber-800 rounded text-[10px] font-medium">{c}</span>
            ))}
          </div>
          {data.complaintDetails && <p className="text-[11px] text-slate-700 pt-1">{data.complaintDetails}</p>}
        </div>
      )}

      <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 space-y-3">
        <h4 className="font-bold text-slate-900 flex items-center gap-1.5"><Sparkles className="w-3.5 h-3.5 text-amber-600" />Developmental Milestones</h4>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-[11px]">
          <div className="bg-white p-2 rounded border border-slate-200">
            <strong className="text-amber-900 block text-[10px]">Gross Motor</strong>
            <div>Head: {data.headControl || '—'}</div>
            <div>Sit: {data.sitting || '—'}</div>
            <div>Walk: {data.walking || '—'}</div>
          </div>
          <div className="bg-white p-2 rounded border border-slate-200">
            <strong className="text-amber-900 block text-[10px]">Fine Motor</strong>
            <div>Reach: {data.reaches || '—'}</div>
            <div>Pincer: {data.pincer || '—'}</div>
            <div>Draw: {data.drawing || '—'}</div>
          </div>
          <div className="bg-white p-2 rounded border border-slate-200">
            <strong className="text-amber-900 block text-[10px]">Speech</strong>
            <div>First: {data.firstWord || '—'}</div>
            <div>2-word: {data.twoWords || '—'}</div>
            <div>Sents: {data.sentences || '—'}</div>
          </div>
          <div className="bg-white p-2 rounded border border-slate-200">
            <strong className="text-amber-900 block text-[10px]">Social</strong>
            <div>Smile: {data.socialSmile || '—'}</div>
            <div>Toilet: {data.toiletTraining || '—'}</div>
            <div>Self-feed: {data.selfFeeding || '—'}</div>
          </div>
        </div>
        {concerns.length > 0 && (
          <div className={`p-2 rounded text-[11px] ${noDelay ? 'bg-emerald-50 border border-emerald-200 text-emerald-900' : 'bg-amber-50 border border-amber-200 text-amber-900'}`}>
            <strong>Developmental Concerns:</strong> {concerns.join(', ')}
          </div>
        )}
      </div>

      {food.length > 0 && (
        <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
          <h4 className="font-bold text-slate-900 text-xs">Feeding &amp; Food</h4>
          <div className="grid grid-cols-2 gap-2 text-[11px]">
            <div>Breastfeeding: <strong>{data.breastfeeding || '—'}</strong></div>
            <div>Weaning: <strong>{data.weaningAge || '—'}</strong></div>
          </div>
          <div className="flex flex-wrap gap-1.5">
            {food.map((f: string) => (
              <span key={f} className="px-2 py-0.5 bg-white border border-slate-300 text-slate-700 rounded text-[10px]">{f}</span>
            ))}
          </div>
        </div>
      )}

      {(neuroFlags.length > 0 || data.behaviourNotes) && (
        <div className="p-3.5 bg-purple-50/40 rounded-xl border border-purple-200 space-y-2">
          <h4 className="font-bold text-purple-900 flex items-center gap-1.5"><Brain className="w-3.5 h-3.5" />Behaviour &amp; Neurodevelopment</h4>
          {neuroFlags.length > 0 && (
            <div className="flex flex-wrap gap-1.5">
              {neuroFlags.map((n: string) => (
                <span key={n} className="px-2 py-0.5 bg-white border border-purple-200 text-purple-900 rounded text-[10px]">{n}</span>
              ))}
            </div>
          )}
          {data.behaviourNotes && <p className="text-[11px] text-slate-700">{data.behaviourNotes}</p>}
        </div>
      )}

      {(data.assessment || data.doctorNotes || data.followupDate) && (
        <div className="p-3.5 rounded-xl border border-amber-200 bg-amber-50/40 space-y-1">
          <span className="font-bold text-amber-900 block text-xs">Assessment &amp; Plan:</span>
          {data.assessment && <p className="text-[11px] font-semibold text-slate-900">{data.assessment}</p>}
          {data.doctorNotes && <p className="text-[11px] text-slate-800">{data.doctorNotes}</p>}
          {data.followupDate && <p className="text-[11px] font-semibold text-amber-800">Follow-up: {data.followupDate}</p>}
        </div>
      )}

      <span className="hidden"><FileText /></span>
    </div>
  );
};