import React from 'react';
import { SystemFormRecord, Patient } from '../../types';
import { useClinic } from '../../context/ClinicContext';
import {
  Utensils,
  Edit3,
  Share2,
  Activity,
  Flame,
  ShieldCheck,
  AlertCircle,
  FileText,
  Apple,
  Coffee
} from 'lucide-react';

interface GastroSummaryCardProps {
  record: SystemFormRecord;
  patient?: Patient;
}

export const GastroSummaryCard: React.FC<GastroSummaryCardProps> = ({ record, patient }) => {
  const { setActiveTab, setActiveSystemFormKey, openWhatsAppShareDialog } = useClinic();
  const data = record.data || {};

  const handleEditCase = () => {
    setActiveSystemFormKey('gastrointestinal');
    setActiveTab('case_taking');
  };

  const cravings = Array.isArray(data.cravings) ? data.cravings : [];
  const aversions = Array.isArray(data.aversions) ? data.aversions : [];
  const acidity = Array.isArray(data.acidityReflux) ? data.acidityReflux : (data.reflux ? [data.reflux] : []);
  const bowels = Array.isArray(data.bowels) ? data.bowels : (data.stoolType ? [data.stoolType] : []);
  const triggers = Array.isArray(data.triggers) ? data.triggers : [];
  const reliefs = Array.isArray(data.reliefFactors) ? data.reliefFactors : (data.relievingFactors ? [data.relievingFactors] : []);

  return (
    <div className="rounded-2xl border-2 border-emerald-600/30 bg-white p-6 shadow-sm space-y-6 text-xs text-slate-800">
      {/* Top Banner / Case Title */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 border-b border-emerald-100 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-1 rounded-md bg-emerald-100/80 text-emerald-800 text-[10px] font-bold uppercase tracking-wider flex items-center gap-1">
              <Utensils className="w-3 h-3 text-emerald-700" />
              Gastro-Intestinal Record
            </span>
            <span className="text-slate-300">•</span>
            <span className="text-slate-600 font-medium text-xs">
              Patient: <strong className="text-slate-900">{patient?.name || data.patientName || 'Patient'}</strong>
            </span>
          </div>
          <h3 className="text-base sm:text-lg font-bold text-emerald-900 font-serif mt-1">
            Gastro-Intestinal System Case Record / गॅस्ट्रो-इंटेस्टाइनल व पचनसंस्था केस टेकिंग
          </h3>
          <p className="text-[11px] text-slate-500">
            Recorded Date: <strong>{data.date || new Date(record.updatedAt).toLocaleDateString()}</strong> &nbsp;|&nbsp;
            Last Updated: {new Date(record.updatedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleEditCase}
            className="px-3 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 rounded-lg text-xs font-semibold flex items-center gap-1 transition-colors"
          >
            <Edit3 className="w-3.5 h-3.5" />
            <span>Edit Case</span>
          </button>
          {patient && (
            <button
              type="button"
              onClick={() => openWhatsAppShareDialog(patient.id, 'gastrointestinal')}
              className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-semibold flex items-center gap-1 transition-colors"
            >
              <Share2 className="w-3.5 h-3.5" />
              <span>Share Form</span>
            </button>
          )}
        </div>
      </div>

      {/* Quick Status Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-emerald-50/50 p-3.5 rounded-xl border border-emerald-100">
        <div>
          <span className="text-[10px] text-slate-500 block uppercase font-semibold">Chief Concern</span>
          <span className="font-bold text-slate-900 text-xs truncate block">{data.chiefComplaints || record.chiefComplaints || 'Gastric Distress / Acidity'}</span>
        </div>
        <div>
          <span className="text-[10px] text-slate-500 block uppercase font-semibold">Appetite & Thirst</span>
          <span className="font-bold text-emerald-900 text-xs truncate block">
            {data.appetite || 'Normal'} • {data.thirst || 'Normal'}
          </span>
        </div>
        <div>
          <span className="text-[10px] text-slate-500 block uppercase font-semibold">Bowel Habit</span>
          <span className="font-bold text-slate-900 text-xs truncate block">{bowels[0] || 'Regular'}</span>
        </div>
        <div>
          <span className="text-[10px] text-slate-500 block uppercase font-semibold">Next Follow-up</span>
          <span className="font-bold text-emerald-800 text-xs">{data.followup || 'Not scheduled'}</span>
        </div>
      </div>

      {/* Structured Details Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Acidity & Bowels */}
        <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
          <h4 className="font-bold text-slate-900 text-xs flex items-center gap-1.5 border-b border-slate-200 pb-1.5">
            <Flame className="w-3.5 h-3.5 text-rose-600" />
            <span>Acidity, Reflux & Bowel Pattern</span>
          </h4>
          <div className="space-y-1.5">
            {acidity.length > 0 && (
              <div>
                <span className="text-[10px] font-bold text-slate-500 block">Gastric & Reflux Symptoms:</span>
                <div className="flex flex-wrap gap-1 mt-0.5">
                  {acidity.map((a: string, i: number) => (
                    <span key={i} className="px-2 py-0.5 bg-rose-50 text-rose-900 border border-rose-200 rounded text-[10px]">
                      {a}
                    </span>
                  ))}
                </div>
              </div>
            )}
            {bowels.length > 0 && (
              <div>
                <span className="text-[10px] font-bold text-slate-500 block">Bowel & Stool Pattern:</span>
                <div className="flex flex-wrap gap-1 mt-0.5">
                  {bowels.map((b: string, i: number) => (
                    <span key={i} className="px-2 py-0.5 bg-amber-50 text-amber-900 border border-amber-200 rounded text-[10px]">
                      {b}
                    </span>
                  ))}
                </div>
              </div>
            )}
            {data.eructations && (
              <div className="text-[11px] text-slate-700">
                <strong>Belching / Eructations:</strong> {data.eructations}
              </div>
            )}
          </div>
        </div>

        {/* Food Cravings & Aversions */}
        <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
          <h4 className="font-bold text-slate-900 text-xs flex items-center gap-1.5 border-b border-slate-200 pb-1.5">
            <Apple className="w-3.5 h-3.5 text-emerald-600" />
            <span>Food Cravings & Intolerances (Generals)</span>
          </h4>
          <div className="space-y-1.5">
            <div>
              <span className="text-[10px] font-bold text-emerald-700 block">Food Cravings (इच्छा / आवड):</span>
              <div className="flex flex-wrap gap-1 mt-0.5">
                {cravings.length > 0 ? (
                  cravings.map((c: string, i: number) => (
                    <span key={i} className="px-2 py-0.5 bg-emerald-50 text-emerald-900 border border-emerald-200 rounded text-[10px]">
                      {c}
                    </span>
                  ))
                ) : (
                  <span className="text-[11px] text-slate-500">Sweets, spicy</span>
                )}
              </div>
            </div>
            <div>
              <span className="text-[10px] font-bold text-rose-700 block">Aversions & Intolerances (नावड / त्रास):</span>
              <div className="flex flex-wrap gap-1 mt-0.5">
                {aversions.length > 0 ? (
                  aversions.map((av: string, i: number) => (
                    <span key={i} className="px-2 py-0.5 bg-rose-50 text-rose-900 border border-rose-200 rounded text-[10px]">
                      {av}
                    </span>
                  ))
                ) : (
                  <span className="text-[11px] text-slate-500">Milk, greasy food</span>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Modalities (Triggers & Relief) */}
        <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
          <h4 className="font-bold text-slate-900 text-xs flex items-center gap-1.5 border-b border-slate-200 pb-1.5">
            <Activity className="w-3.5 h-3.5 text-teal-600" />
            <span>Modalities & Abdominal Pain</span>
          </h4>
          <div className="space-y-1.5 text-[11px] text-slate-700">
            {triggers.length > 0 && (
              <div>
                <span className="text-[10px] font-bold text-rose-700 block">Aggravated By:</span>
                <div className="flex flex-wrap gap-1 mt-0.5">
                  {triggers.map((t: string, i: number) => (
                    <span key={i} className="px-2 py-0.5 bg-rose-50 text-rose-800 border border-rose-200 rounded text-[10px]">{t}</span>
                  ))}
                </div>
              </div>
            )}
            {reliefs.length > 0 && (
              <div>
                <span className="text-[10px] font-bold text-emerald-700 block">Ameliorated By:</span>
                <div className="flex flex-wrap gap-1 mt-0.5">
                  {reliefs.map((r: string, i: number) => (
                    <span key={i} className="px-2 py-0.5 bg-emerald-50 text-emerald-800 border border-emerald-200 rounded text-[10px]">{r}</span>
                  ))}
                </div>
              </div>
            )}
            {data.painLocation && <div><strong>Pain Site:</strong> {data.painLocation}</div>}
          </div>
        </div>

        {/* Clinical Assessment & Plan */}
        <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
          <h4 className="font-bold text-slate-900 text-xs flex items-center gap-1.5 border-b border-slate-200 pb-1.5">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
            <span>Assessment & Treatment Plan</span>
          </h4>
          <div className="space-y-1 text-[11px] text-slate-700">
            <div>
              <strong>Assessment / Provisional Diagnosis:</strong>{' '}
              <span className="font-semibold text-slate-900">{data.assessment || record.clinicalNotes || 'Dyspepsia / Acid Reflux'}</span>
            </div>
            {data.abdomenExam && <div><strong>Abdomen Examination:</strong> {data.abdomenExam}</div>}
            {data.plan && (
              <div className="p-2 bg-emerald-50 rounded-lg border border-emerald-200 text-emerald-900 mt-1">
                <strong>Rx Plan:</strong> {data.plan}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
