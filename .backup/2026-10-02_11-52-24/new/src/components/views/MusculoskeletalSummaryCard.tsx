import React from 'react';
import type { SystemFormRecord, Patient } from '../../types';
import { useClinic } from '../../context/ClinicContext';
import { Bone, Edit3, Share2, Activity, AlertTriangle } from 'lucide-react';

interface Props {
  record: SystemFormRecord;
  patient?: Patient;
}

export const MusculoskeletalSummaryCard: React.FC<Props> = ({ record, patient }) => {
  const { setActiveTab, setActiveSystemFormKey, openWhatsAppShareDialog } = useClinic();
  const data = (record.data ?? {}) as Record<string, any>;

  const joints = Array.isArray(data.jointsAffected) ? data.jointsAffected : [];
  const painChar = Array.isArray(data.painCharacter) ? data.painCharacter : [];
  const redFlags = Array.isArray(data.redFlags) ? data.redFlags : [];

  return (
    <div className="rounded-2xl border-2 border-emerald-600/30 bg-white p-6 shadow-sm space-y-5 text-xs">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 border-b border-emerald-100 pb-4">
        <div>
          <span className="px-2.5 py-1 rounded-md bg-emerald-100/80 text-emerald-800 text-[10px] font-bold uppercase">
            Musculoskeletal Record
          </span>
          <h3 className="text-base font-bold text-emerald-900 font-serif mt-1">
            Musculoskeletal Case Summary
          </h3>
          <p className="text-[11px] text-slate-500">
            {patient?.name} • Updated {new Date(record.updatedAt).toLocaleString()}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              setActiveSystemFormKey('musculoskeletal');
              setActiveTab('case_taking');
            }}
            className="px-3 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 rounded-lg text-xs font-semibold flex items-center gap-1"
          >
            <Edit3 className="w-3.5 h-3.5" />
            Edit
          </button>
          {patient && (
            <button
              onClick={() => openWhatsAppShareDialog(patient.id, 'musculoskeletal')}
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
          <span className="text-[10px] text-slate-500 block uppercase font-semibold">Duration</span>
          <span className="font-bold text-xs">{record.duration}</span>
        </div>
        <div>
          <span className="text-[10px] text-slate-500 block uppercase font-semibold">Follow-up</span>
          <span className="font-bold text-emerald-800 text-xs">{data.followup || '—'}</span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
          <h4 className="font-bold text-slate-900 flex items-center gap-1.5">
            <Bone className="w-3.5 h-3.5 text-emerald-700" />
            Joints &amp; Pain
          </h4>
          {joints.length > 0 && (
            <div className="flex flex-wrap gap-1.5">
              {joints.map((j: string) => (
                <span key={j} className="px-2 py-0.5 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded text-[10px]">
                  {j}
                </span>
              ))}
            </div>
          )}
          {painChar.length > 0 && (
            <div className="flex flex-wrap gap-1.5">
              {painChar.map((p: string) => (
                <span key={p} className="px-2 py-0.5 bg-indigo-50 border border-indigo-200 text-indigo-800 rounded text-[10px]">
                  {p}
                </span>
              ))}
            </div>
          )}
        </div>

        <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
          <h4 className="font-bold text-slate-900 flex items-center gap-1.5">
            <Activity className="w-3.5 h-3.5 text-teal-600" />
            Modalities
          </h4>
          {data.motionAggravation && (
            <div className="text-[11px]">
              <strong>Motion / Rest:</strong> {data.motionAggravation}
            </div>
          )}
          {data.weatherAggravation && (
            <div className="text-[11px]">
              <strong>Weather:</strong> {data.weatherAggravation}
            </div>
          )}
          {record.modalitiesAggravation && (
            <div className="text-[11px] text-rose-800">
              <strong>&lt;:</strong> {record.modalitiesAggravation}
            </div>
          )}
          {record.modalitiesAmelioration && (
            <div className="text-[11px] text-emerald-800">
              <strong>&gt;:</strong> {record.modalitiesAmelioration}
            </div>
          )}
        </div>
      </div>

      {redFlags.length > 0 && (
        <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl">
          <span className="font-bold text-rose-900 flex items-center gap-1.5 text-[10px] uppercase mb-1">
            <AlertTriangle className="w-3 h-3" />
            Red Flags
          </span>
          <div className="flex flex-wrap gap-1.5">
            {redFlags.map((r: string) => (
              <span key={r} className="px-2 py-0.5 bg-white border border-rose-300 text-rose-800 rounded text-[10px] font-semibold">
                {r}
              </span>
            ))}
          </div>
        </div>
      )}

      {record.clinicalNotes && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-[11px] text-slate-800">
          {record.clinicalNotes}
        </div>
      )}
    </div>
  );
};