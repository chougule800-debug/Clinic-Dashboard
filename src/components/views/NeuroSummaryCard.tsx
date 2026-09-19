import React from 'react';
import { SystemFormRecord, Patient } from '../../types';
import { useClinic } from '../../context/ClinicContext';
import {
  Brain,
  Edit3,
  Share2,
  Activity,
  Clock,
  Zap,
  ShieldCheck,
  AlertCircle,
  FileText,
  Eye,
  Sparkles,
  Sun,
  Moon
} from 'lucide-react';

interface NeuroSummaryCardProps {
  record: SystemFormRecord;
  patient?: Patient;
}

export const NeuroSummaryCard: React.FC<NeuroSummaryCardProps> = ({ record, patient }) => {
  const { setActiveTab, setActiveSystemFormKey, openWhatsAppShareDialog } = useClinic();
  const data = record.data || {};

  const handleEditCase = () => {
    setActiveSystemFormKey('headache');
    setActiveTab('case_taking');
  };

  const locations = Array.isArray(data.painLocation) ? data.painLocation : (data.location ? [data.location] : []);
  const sensations = Array.isArray(data.painSensation) ? data.painSensation : (data.sensation ? [data.sensation] : []);
  const triggers = Array.isArray(data.triggers) ? data.triggers : [];
  const reliefs = Array.isArray(data.relievingFactors) ? data.relievingFactors : (data.reliefFactors ? [data.reliefFactors] : []);
  const auras = Array.isArray(data.auraSymptoms) ? data.auraSymptoms : (data.auras ? [data.auras] : []);
  const mentals = Array.isArray(data.mentalEmotional) ? data.mentalEmotional : [];

  return (
    <div className="rounded-2xl border-2 border-teal-600/30 bg-white p-6 shadow-sm space-y-6 text-xs text-slate-800">
      {/* Top Banner / Case Title */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 border-b border-teal-100 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-1 rounded-md bg-teal-100/80 text-teal-800 text-[10px] font-bold uppercase tracking-wider flex items-center gap-1">
              <Brain className="w-3 h-3 text-teal-700" />
              Neurological Record
            </span>
            <span className="text-slate-300">•</span>
            <span className="text-slate-600 font-medium text-xs">
              Patient: <strong className="text-slate-900">{patient?.name || data.patientName || 'Patient'}</strong>
            </span>
          </div>
          <h3 className="text-base sm:text-lg font-bold text-teal-900 font-serif mt-1">
            Neurological System & Headache Case Record / न्यूरोलॉजिकल व डोकेदुखी केस टेकिंग
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
            className="px-3 py-1.5 bg-teal-50 hover:bg-teal-100 text-teal-800 border border-teal-200 rounded-lg text-xs font-semibold flex items-center gap-1 transition-colors"
          >
            <Edit3 className="w-3.5 h-3.5" />
            <span>Edit Case</span>
          </button>
          {patient && (
            <button
              type="button"
              onClick={() => openWhatsAppShareDialog(patient.id, 'headache')}
              className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-semibold flex items-center gap-1 transition-colors"
            >
              <Share2 className="w-3.5 h-3.5" />
              <span>Share Form</span>
            </button>
          )}
        </div>
      </div>

      {/* Quick Status Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-teal-50/50 p-3.5 rounded-xl border border-teal-100">
        <div>
          <span className="text-[10px] text-slate-500 block uppercase font-semibold">Chief Presentation</span>
          <span className="font-bold text-slate-900 text-xs truncate block">{data.headacheType || record.chiefComplaints || 'Headache / Migraine'}</span>
        </div>
        <div>
          <span className="text-[10px] text-slate-500 block uppercase font-semibold">Severity & Frequency</span>
          <span className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-bold ${
            record.severity === 'Severe' || data.headacheSeverity?.includes('Severe') ? 'bg-rose-100 text-rose-800' : 'bg-amber-100 text-amber-800'
          }`}>
            {data.headacheSeverity || record.severity} • {data.frequency || 'Recurrent'}
          </span>
        </div>
        <div>
          <span className="text-[10px] text-slate-500 block uppercase font-semibold">Chronicity & Timing</span>
          <span className="font-bold text-slate-900 text-xs">{data.duration || record.duration || 'Chronic'}</span>
        </div>
        <div>
          <span className="text-[10px] text-slate-500 block uppercase font-semibold">Next Follow-up</span>
          <span className="font-bold text-teal-800 text-xs">{data.followup || 'Not scheduled'}</span>
        </div>
      </div>

      {/* Structured Details Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Pain & Location */}
        <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
          <h4 className="font-bold text-slate-900 text-xs flex items-center gap-1.5 border-b border-slate-200 pb-1.5">
            <Zap className="w-3.5 h-3.5 text-amber-600" />
            <span>Pain Character, Locations & Sensations</span>
          </h4>
          <div className="space-y-1.5">
            {locations.length > 0 && (
              <div>
                <span className="text-[10px] font-bold text-slate-500 block">Locations:</span>
                <div className="flex flex-wrap gap-1 mt-0.5">
                  {locations.map((loc: string, i: number) => (
                    <span key={i} className="px-2 py-0.5 bg-amber-50 text-amber-900 border border-amber-200 rounded text-[10px] font-medium">
                      {loc}
                    </span>
                  ))}
                </div>
              </div>
            )}
            {sensations.length > 0 && (
              <div>
                <span className="text-[10px] font-bold text-slate-500 block">Sensation / Nature of Pain:</span>
                <div className="flex flex-wrap gap-1 mt-0.5">
                  {sensations.map((sen: string, i: number) => (
                    <span key={i} className="px-2 py-0.5 bg-indigo-50 text-indigo-900 border border-indigo-200 rounded text-[10px] font-medium">
                      {sen}
                    </span>
                  ))}
                </div>
              </div>
            )}
            {data.timeModality && (
              <div className="text-[11px] text-slate-700">
                <strong>Time Modality:</strong> {data.timeModality}
              </div>
            )}
          </div>
        </div>

        {/* Modalities (Aggravations & Ameliorations) */}
        <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
          <h4 className="font-bold text-slate-900 text-xs flex items-center gap-1.5 border-b border-slate-200 pb-1.5">
            <Activity className="w-3.5 h-3.5 text-teal-600" />
            <span>Modalities (Aggravation & Relief)</span>
          </h4>
          <div className="space-y-1.5">
            <div>
              <span className="text-[10px] font-bold text-rose-700 block">Aggravated By (Triggers / वाढ):</span>
              <div className="flex flex-wrap gap-1 mt-0.5">
                {triggers.length > 0 ? (
                  triggers.map((t: string, i: number) => (
                    <span key={i} className="px-2 py-0.5 bg-rose-50 text-rose-800 border border-rose-200 rounded text-[10px]">
                      {t}
                    </span>
                  ))
                ) : (
                  <span className="text-[11px] text-slate-500">{record.modalitiesAggravation || 'Sun, noise, stress'}</span>
                )}
              </div>
            </div>
            <div>
              <span className="text-[10px] font-bold text-emerald-700 block">Ameliorated By (Relief / कमी):</span>
              <div className="flex flex-wrap gap-1 mt-0.5">
                {reliefs.length > 0 ? (
                  reliefs.map((r: string, i: number) => (
                    <span key={i} className="px-2 py-0.5 bg-emerald-50 text-emerald-800 border border-emerald-200 rounded text-[10px]">
                      {r}
                    </span>
                  ))
                ) : (
                  <span className="text-[11px] text-slate-500">{record.modalitiesAmelioration || 'Dark quiet room, hard pressure'}</span>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Associated Auras & Mentals */}
        <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
          <h4 className="font-bold text-slate-900 text-xs flex items-center gap-1.5 border-b border-slate-200 pb-1.5">
            <Eye className="w-3.5 h-3.5 text-cyan-600" />
            <span>Aura, Vertigo & Mentals</span>
          </h4>
          <div className="space-y-1.5 text-[11px] text-slate-700">
            {auras.length > 0 && (
              <div>
                <span className="text-[10px] font-bold text-slate-500 block">Aura / Visual / Gastric:</span>
                <div className="flex flex-wrap gap-1 mt-0.5">
                  {auras.map((a: string, i: number) => (
                    <span key={i} className="px-2 py-0.5 bg-cyan-50 text-cyan-900 border border-cyan-200 rounded text-[10px]">
                      {a}
                    </span>
                  ))}
                </div>
              </div>
            )}
            {mentals.length > 0 && (
              <div>
                <span className="text-[10px] font-bold text-slate-500 block">Mental / Emotional:</span>
                <div className="flex flex-wrap gap-1 mt-0.5">
                  {mentals.map((m: string, i: number) => (
                    <span key={i} className="px-2 py-0.5 bg-purple-50 text-purple-900 border border-purple-200 rounded text-[10px]">
                      {m}
                    </span>
                  ))}
                </div>
              </div>
            )}
            {data.sleepPattern && <div><strong>Sleep:</strong> {data.sleepPattern}</div>}
          </div>
        </div>

        {/* Clinical Assessment & Prescription Plan */}
        <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
          <h4 className="font-bold text-slate-900 text-xs flex items-center gap-1.5 border-b border-slate-200 pb-1.5">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
            <span>Assessment, Examination & Prescription</span>
          </h4>
          <div className="space-y-1 text-[11px] text-slate-700">
            <div>
              <strong>Provisional Diagnosis / Assessment:</strong>{' '}
              <span className="font-semibold text-slate-900">{data.assessment || record.clinicalNotes || 'Migraine without aura'}</span>
            </div>
            {data.cranialExam && (
              <div><strong>Cranial & Neuro Exam:</strong> {data.cranialExam}</div>
            )}
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
