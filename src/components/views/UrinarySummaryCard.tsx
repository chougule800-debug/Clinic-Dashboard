import React from 'react';
import { SystemFormRecord, Patient } from '../../types';
import { useClinic } from '../../context/ClinicContext';
import {
  Droplets,
  Edit3,
  Share2,
  Activity,
  Flame,
  ShieldCheck,
  AlertCircle,
  FileText,
  Clock,
  Sparkles
} from 'lucide-react';

interface UrinarySummaryCardProps {
  record: SystemFormRecord;
  patient?: Patient;
}

export const UrinarySummaryCard: React.FC<UrinarySummaryCardProps> = ({ record, patient }) => {
  const { setActiveTab, setActiveSystemFormKey, openWhatsAppShareDialog } = useClinic();
  const data = record.data || {};

  const handleEditCase = () => {
    setActiveSystemFormKey('urinary');
    setActiveTab('case_taking');
  };

  const frequency = Array.isArray(data.frequency) ? data.frequency : [];
  const painBurning = Array.isArray(data.painBurning) ? data.painBurning : [];
  const renalPain = Array.isArray(data.renalPain) ? data.renalPain : [];
  const sedimentColor = Array.isArray(data.sedimentColor) ? data.sedimentColor : [];
  const streamIssues = Array.isArray(data.streamIssues) ? data.streamIssues : [];
  const prostate = Array.isArray(data.prostateSymptoms) ? data.prostateSymptoms : [];

  return (
    <div className="rounded-2xl border-2 border-emerald-600/30 bg-white p-6 shadow-sm space-y-6 text-xs text-slate-800">
      {/* Top Banner / Case Title */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 border-b border-emerald-100 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-1 rounded-md bg-emerald-100/80 text-emerald-800 text-[10px] font-bold uppercase tracking-wider flex items-center gap-1">
              <Droplets className="w-3 h-3 text-emerald-700" />
              Urological Record
            </span>
            <span className="text-slate-300">•</span>
            <span className="text-slate-600 font-medium text-xs">
              Patient: <strong className="text-slate-900">{patient?.name || data.patientName || 'Patient'}</strong>
            </span>
          </div>
          <h3 className="text-base sm:text-lg font-bold text-emerald-900 font-serif mt-1">
            Urinary System & Prostate Case Record / मूत्रसंस्था व प्रोस्टेट केस टेकिंग
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
              onClick={() => openWhatsAppShareDialog(patient.id, 'urinary')}
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
          <span className="text-[10px] text-slate-500 block uppercase font-semibold">Chief Presentation</span>
          <span className="font-bold text-slate-900 text-xs truncate block">{data.chiefComplaints || record.chiefComplaints || 'Dysuria / Frequency'}</span>
        </div>
        <div>
          <span className="text-[10px] text-slate-500 block uppercase font-semibold">Burning Severity</span>
          <span className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-bold ${
            record.severity === 'Severe' || data.severity?.includes('Severe') ? 'bg-rose-100 text-rose-800' : 'bg-emerald-100 text-emerald-800'
          }`}>
            {data.severity || record.severity}
          </span>
        </div>
        <div>
          <span className="text-[10px] text-slate-500 block uppercase font-semibold">Frequency & Urgency</span>
          <span className="font-bold text-slate-900 text-xs truncate block">{frequency[0] || 'Normal'}</span>
        </div>
        <div>
          <span className="text-[10px] text-slate-500 block uppercase font-semibold">Next Follow-up</span>
          <span className="font-bold text-emerald-800 text-xs">{data.followup || 'Not scheduled'}</span>
        </div>
      </div>

      {/* Structured Details Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Burning & Pain Characteristics */}
        <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
          <h4 className="font-bold text-slate-900 text-xs flex items-center gap-1.5 border-b border-slate-200 pb-1.5">
            <Flame className="w-3.5 h-3.5 text-rose-600" />
            <span>Burning & Micturition Sensations</span>
          </h4>
          <div className="space-y-1.5">
            {painBurning.length > 0 && (
              <div>
                <span className="text-[10px] font-bold text-rose-700 block">Burning Modality:</span>
                <div className="flex flex-wrap gap-1 mt-0.5">
                  {painBurning.map((p: string, i: number) => (
                    <span key={i} className="px-2 py-0.5 bg-rose-50 text-rose-900 border border-rose-200 rounded text-[10px]">
                      {p}
                    </span>
                  ))}
                </div>
              </div>
            )}
            {frequency.length > 0 && (
              <div>
                <span className="text-[10px] font-bold text-slate-500 block">Frequency / Nocturia:</span>
                <div className="flex flex-wrap gap-1 mt-0.5">
                  {frequency.map((f: string, i: number) => (
                    <span key={i} className="px-2 py-0.5 bg-amber-50 text-amber-900 border border-amber-200 rounded text-[10px]">
                      {f}
                    </span>
                  ))}
                </div>
              </div>
            )}
            {streamIssues.length > 0 && (
              <div>
                <span className="text-[10px] font-bold text-slate-500 block">Stream & Flow:</span>
                <div className="flex flex-wrap gap-1 mt-0.5">
                  {streamIssues.map((s: string, i: number) => (
                    <span key={i} className="px-2 py-0.5 bg-slate-100 text-slate-800 border border-slate-200 rounded text-[10px]">
                      {s}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Renal Pain & Sediment */}
        <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
          <h4 className="font-bold text-slate-900 text-xs flex items-center gap-1.5 border-b border-slate-200 pb-1.5">
            <Droplets className="w-3.5 h-3.5 text-cyan-600" />
            <span>Flank Pain, Stones & Urine Color</span>
          </h4>
          <div className="space-y-1.5 text-[11px] text-slate-700">
            {renalPain.length > 0 && (
              <div>
                <span className="text-[10px] font-bold text-indigo-700 block">Renal / Loin Pain:</span>
                <div className="flex flex-wrap gap-1 mt-0.5">
                  {renalPain.map((r: string, i: number) => (
                    <span key={i} className="px-2 py-0.5 bg-indigo-50 text-indigo-900 border border-indigo-200 rounded text-[10px]">
                      {r}
                    </span>
                  ))}
                </div>
              </div>
            )}
            {sedimentColor.length > 0 && (
              <div>
                <span className="text-[10px] font-bold text-amber-700 block">Color & Sediment:</span>
                <div className="flex flex-wrap gap-1 mt-0.5">
                  {sedimentColor.map((c: string, i: number) => (
                    <span key={i} className="px-2 py-0.5 bg-amber-50 text-amber-900 border border-amber-200 rounded text-[10px]">
                      {c}
                    </span>
                  ))}
                </div>
              </div>
            )}
            {prostate.length > 0 && (
              <div>
                <span className="text-[10px] font-bold text-purple-700 block">Prostate / Hesitancy:</span>
                <div className="flex flex-wrap gap-1 mt-0.5">
                  {prostate.map((pr: string, i: number) => (
                    <span key={i} className="px-2 py-0.5 bg-purple-50 text-purple-900 border border-purple-200 rounded text-[10px]">
                      {pr}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Modalities (Aggravation & Relief) */}
        <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
          <h4 className="font-bold text-slate-900 text-xs flex items-center gap-1.5 border-b border-slate-200 pb-1.5">
            <Activity className="w-3.5 h-3.5 text-teal-600" />
            <span>Clinical Modalities</span>
          </h4>
          <div className="space-y-1 text-[11px] text-slate-700">
            <div>
              <span className="text-[10px] font-bold text-rose-700 block">Aggravated By:</span>
              <div className="mt-0.5">{record.modalitiesAggravation || data.triggers || 'Holding urine, dehydration'}</div>
            </div>
            <div>
              <span className="text-[10px] font-bold text-emerald-700 block">Ameliorated By:</span>
              <div className="mt-0.5">{record.modalitiesAmelioration || data.reliefFactors || 'Drinking plentiful fluids'}</div>
            </div>
          </div>
        </div>

        {/* Assessment & Plan */}
        <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
          <h4 className="font-bold text-slate-900 text-xs flex items-center gap-1.5 border-b border-slate-200 pb-1.5">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
            <span>Assessment & Treatment Plan</span>
          </h4>
          <div className="space-y-1 text-[11px] text-slate-700">
            <div>
              <strong>Provisional Diagnosis / Assessment:</strong>{' '}
              <span className="font-semibold text-slate-900">{data.assessment || record.clinicalNotes || 'Dysuria / UTI suspected'}</span>
            </div>
            {data.urineAnalysis && <div><strong>Urine Routine Analysis:</strong> {data.urineAnalysis}</div>}
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
