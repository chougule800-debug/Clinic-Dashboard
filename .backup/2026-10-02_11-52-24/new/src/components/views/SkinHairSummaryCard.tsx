import React from 'react';
import type { SystemFormRecord, Patient } from '../../types';
import { useClinic } from '../../context/ClinicContext';
import { Sparkles, Edit3, Share2, Camera, Activity, Heart } from 'lucide-react';

interface Props {
  record: SystemFormRecord;
  patient?: Patient;
}

export const SkinHairSummaryCard: React.FC<Props> = ({ record, patient }) => {
  const { setActiveTab, setActiveSystemFormKey, openWhatsAppShareDialog } = useClinic();
  const data = (record.data ?? {}) as Record<string, any>;

  const lesionList = Array.isArray(data.lesionType) ? data.lesionType : [];
  const locations = Array.isArray(data.acneLocation) ? data.acneLocation : [];
  const triggers = Array.isArray(data.acneTrigger) ? data.acneTrigger : [];
  const symptoms = Array.isArray(data.symptom) ? data.symptom : [];
  const reportFiles = Array.isArray(data.reportFiles) ? data.reportFiles : [];
  const additionalPhotos = [data.photo1, data.photo2, data.photo3, data.photo4, data.photo5].filter(Boolean);

  return (
    <div className="rounded-2xl border-2 border-teal-600/30 bg-white p-6 shadow-sm space-y-5 text-xs">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 border-b border-teal-100 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-1 rounded-md bg-teal-100/80 text-teal-800 text-[10px] font-bold uppercase">
              Skin &amp; Hair Record
            </span>
            <span className="text-xs text-slate-500">
              Patient: <strong className="text-slate-900">{patient?.name}</strong>
            </span>
          </div>
          <h3 className="text-base font-bold text-teal-900 font-serif mt-1">
            Skin &amp; Hairfall Case Summary
          </h3>
          <p className="text-[11px] text-slate-500">
            Updated {new Date(record.updatedAt).toLocaleString()}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              setActiveSystemFormKey('skin_hair');
              setActiveTab('case_taking');
            }}
            className="px-3 py-1.5 bg-teal-50 hover:bg-teal-100 text-teal-800 border border-teal-200 rounded-lg text-xs font-semibold flex items-center gap-1"
          >
            <Edit3 className="w-3.5 h-3.5" />
            Edit
          </button>
          {patient && (
            <button
              onClick={() => openWhatsAppShareDialog(patient.id, 'skin_hair')}
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
            {data.skinProblem || record.chiefComplaints}
          </span>
        </div>
        <div>
          <span className="text-[10px] text-slate-500 block uppercase font-semibold">Severity</span>
          <span className="font-bold text-xs">{data.acneSeverity || record.severity}</span>
        </div>
        <div>
          <span className="text-[10px] text-slate-500 block uppercase font-semibold">Since</span>
          <span className="font-bold text-xs">{data.skinSince || record.duration}</span>
        </div>
        <div>
          <span className="text-[10px] text-slate-500 block uppercase font-semibold">Hair</span>
          <span className="font-bold text-teal-800 text-xs line-clamp-1">
            {data.hairAmount || data.hairSince || '—'}
          </span>
        </div>
      </div>

      {(lesionList.length > 0 || locations.length > 0 || symptoms.length > 0) && (
        <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-2">
          <h4 className="font-bold text-teal-900 flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5" />
            Skin Findings
          </h4>
          {lesionList.length > 0 && (
            <div className="flex flex-wrap gap-1.5">
              {lesionList.map((l: string) => (
                <span key={l} className="px-2 py-0.5 bg-rose-50 border border-rose-200 text-rose-800 rounded text-[10px]">
                  {l}
                </span>
              ))}
            </div>
          )}
          {locations.length > 0 && (
            <div className="flex flex-wrap gap-1.5">
              {locations.map((l: string) => (
                <span key={l} className="px-2 py-0.5 bg-teal-50 border border-teal-200 text-teal-800 rounded text-[10px]">
                  {l}
                </span>
              ))}
            </div>
          )}
          {symptoms.length > 0 && (
            <div className="flex flex-wrap gap-1.5">
              {symptoms.map((s: string) => (
                <span key={s} className="px-2 py-0.5 bg-amber-50 border border-amber-200 text-amber-800 rounded text-[10px]">
                  {s}
                </span>
              ))}
            </div>
          )}
        </div>
      )}

      {(record.modalitiesAggravation || record.modalitiesAmelioration) && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {record.modalitiesAggravation && (
            <div className="p-2.5 bg-rose-50 border border-rose-100 rounded-lg text-rose-900 text-[11px]">
              <strong>Aggravation (&lt;):</strong> {record.modalitiesAggravation}
            </div>
          )}
          {record.modalitiesAmelioration && (
            <div className="p-2.5 bg-emerald-50 border border-emerald-100 rounded-lg text-emerald-900 text-[11px]">
              <strong>Amelioration (&gt;):</strong> {record.modalitiesAmelioration}
            </div>
          )}
        </div>
      )}

      {(data.acnePhoto || additionalPhotos.length > 0 || reportFiles.length > 0) && (
        <div className="pt-2 border-t border-slate-100">
          <h4 className="font-bold text-slate-800 flex items-center gap-1.5 mb-2">
            <Camera className="w-3.5 h-3.5 text-teal-600" />
            Clinical Photographs
          </h4>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {data.acnePhoto && (
              <img
                src={data.acnePhoto}
                alt="Acne"
                className="w-full h-24 object-cover rounded-lg border border-slate-200"
              />
            )}
            {additionalPhotos.map((p: string, i: number) => (
              <img
                key={i}
                src={p}
                alt={`Photo ${i + 1}`}
                className="w-full h-24 object-cover rounded-lg border border-slate-200"
              />
            ))}
            {reportFiles
              .filter((f: any) => f.data)
              .map((f: any, i: number) => (
                <img
                  key={`r-${i}`}
                  src={f.data}
                  alt={f.name}
                  className="w-full h-24 object-cover rounded-lg border border-slate-200"
                />
              ))}
          </div>
        </div>
      )}

      <span className="hidden">
        <Activity />
        <Heart />
      </span>
    </div>
  );
};