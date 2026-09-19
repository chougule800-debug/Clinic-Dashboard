import React from 'react';
import { SystemFormRecord, Patient } from '../../types';
import { useClinic } from '../../context/ClinicContext';
import {
  Bone,
  Edit3,
  Share2,
  Activity,
  Flame,
  ShieldCheck,
  AlertTriangle,
  FileText,
  Clock,
  Sun,
  CloudRain
} from 'lucide-react';

interface MusculoskeletalSummaryCardProps {
  record: SystemFormRecord;
  patient?: Patient;
}

export const MusculoskeletalSummaryCard: React.FC<MusculoskeletalSummaryCardProps> = ({ record, patient }) => {
  const { setActiveTab, setActiveSystemFormKey, openWhatsAppShareDialog } = useClinic();
  const data = record.data || {};

  const handleEditCase = () => {
    setActiveSystemFormKey('musculoskeletal');
    setActiveTab('case_taking');
  };

  const joints = Array.isArray(data.jointsAffected) ? data.jointsAffected : (data.joints ? [data.joints] : []);
  const painChar = Array.isArray(data.painCharacter) ? data.painCharacter : [];
  const reliefs = Array.isArray(data.relievingFactors) ? data.relievingFactors : (data.reliefFactors ? [data.reliefFactors] : []);
  const redFlags = Array.isArray(data.redFlags) ? data.redFlags : [];

  return (
    <div className="rounded-2xl border-2 border-emerald-600/30 bg-white p-6 shadow-sm space-y-6 text-xs text-slate-800">
      {/* Top Banner / Case Title */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 border-b border-emerald-100 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-1 rounded-md bg-emerald-100/80 text-emerald-800 text-[10px] font-bold uppercase tracking-wider flex items-center gap-1">
              <Bone className="w-3 h-3 text-emerald-700" />
              Musculoskeletal Record
            </span>
            <span className="text-slate-300">•</span>
            <span className="text-slate-600 font-medium text-xs">
              Patient: <strong className="text-slate-900">{patient?.name || data.patientName || 'Patient'}</strong>
            </span>
          </div>
          <h3 className="text-base sm:text-lg font-bold text-emerald-900 font-serif mt-1">
            Musculoskeletal & Spine Case Record / मस्क्युलोस्केलेटल व सांधेदुखी केस टेकिंग
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
              onClick={() => openWhatsAppShareDialog(patient.id, 'musculoskeletal')}
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
          <span className="text-[10px] text-slate-500 block uppercase font-semibold">Chief Complaint</span>
          <span className="font-bold text-slate-900 text-xs truncate block">{data.chiefComplaints || record.chiefComplaints || 'Joint Pain / Stiffness'}</span>
        </div>
        <div>
          <span className="text-[10px] text-slate-500 block uppercase font-semibold">Pain Severity</span>
          <span className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-bold ${
            record.severity === 'Severe' || data.severity?.includes('Severe') ? 'bg-rose-100 text-rose-800' : 'bg-amber-100 text-amber-800'
          }`}>
            {data.severity || record.severity}
          </span>
        </div>
        <div>
          <span className="text-[10px] text-slate-500 block uppercase font-semibold">Morning Stiffness</span>
          <span className="font-bold text-slate-900 text-xs truncate block">{data.stiffness || 'None'}</span>
        </div>
        <div>
          <span className="text-[10px] text-slate-500 block uppercase font-semibold">Next Follow-up</span>
          <span className="font-bold text-emerald-800 text-xs">{data.followup || 'Not scheduled'}</span>
        </div>
      </div>

      {/* Structured Details Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Joints & Pain Character */}
        <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
          <h4 className="font-bold text-slate-900 text-xs flex items-center gap-1.5 border-b border-slate-200 pb-1.5">
            <Bone className="w-3.5 h-3.5 text-emerald-700" />
            <span>Joints Affected & Pain Character</span>
          </h4>
          <div className="space-y-1.5">
            {joints.length > 0 && (
              <div>
                <span className="text-[10px] font-bold text-slate-500 block">Affected Regions:</span>
                <div className="flex flex-wrap gap-1 mt-0.5">
                  {joints.map((j: string, i: number) => (
                    <span key={i} className="px-2 py-0.5 bg-emerald-50 text-emerald-900 border border-emerald-200 rounded text-[10px] font-medium">
                      {j}
                    </span>
                  ))}
                </div>
              </div>
            )}
            {painChar.length > 0 && (
              <div>
                <span className="text-[10px] font-bold text-slate-500 block">Pain Nature:</span>
                <div className="flex flex-wrap gap-1 mt-0.5">
                  {painChar.map((p: string, i: number) => (
                    <span key={i} className="px-2 py-0.5 bg-indigo-50 text-indigo-900 border border-indigo-200 rounded text-[10px]">
                      {p}
                    </span>
                  ))}
                </div>
              </div>
            )}
            {data.stiffness && (
              <div className="text-[11px] text-slate-700">
                <strong>Stiffness:</strong> {data.stiffness}
              </div>
            )}
          </div>
        </div>

        {/* Modalities (Motion, Rest, Weather) */}
        <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
          <h4 className="font-bold text-slate-900 text-xs flex items-center gap-1.5 border-b border-slate-200 pb-1.5">
            <Activity className="w-3.5 h-3.5 text-teal-600" />
            <span>Modalities (Motion / Rest / Weather)</span>
          </h4>
          <div className="space-y-1.5 text-[11px] text-slate-700">
            {data.motionAggravation && <div><strong>Motion / Rest:</strong> {data.motionAggravation}</div>}
            {data.weatherAggravation && <div><strong>Weather:</strong> {data.weatherAggravation}</div>}
            {reliefs.length > 0 && (
              <div>
                <span className="text-[10px] font-bold text-emerald-700 block">Amelioration / Relief:</span>
                <div className="flex flex-wrap gap-1 mt-0.5">
                  {reliefs.map((r: string, i: number) => (
                    <span key={i} className="px-2 py-0.5 bg-emerald-50 text-emerald-800 border border-emerald-200 rounded text-[10px]">
                      {r}
                    </span>
                  ))}
                </div>
              </div>
            )}
            {redFlags.length > 0 && (
              <div className="p-1.5 bg-rose-50 border border-rose-200 rounded text-rose-800 text-[10px] flex items-center gap-1">
                <AlertTriangle className="w-3 h-3 text-rose-600 flex-shrink-0" />
                <span>Red Flags: {redFlags.join(', ')}</span>
              </div>
            )}
          </div>
        </div>

        {/* Examination & Physical Findings */}
        <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
          <h4 className="font-bold text-slate-900 text-xs flex items-center gap-1.5 border-b border-slate-200 pb-1.5">
            <FileText className="w-3.5 h-3.5 text-cyan-600" />
            <span>Physical Examination & Radiology</span>
          </h4>
          <div className="space-y-1 text-[11px] text-slate-700">
            {data.physicalExam && <div><strong>Physical Exam / ROM:</strong> {data.physicalExam}</div>}
            {data.radiology && <div><strong>X-Ray / MRI / Blood:</strong> {data.radiology}</div>}
          </div>
        </div>

        {/* Assessment & Plan */}
        <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
          <h4 className="font-bold text-slate-900 text-xs flex items-center gap-1.5 border-b border-slate-200 pb-1.5">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
            <span>Assessment & Prescription Plan</span>
          </h4>
          <div className="space-y-1 text-[11px] text-slate-700">
            <div>
              <strong>Assessment / Provisional Diagnosis:</strong>{' '}
              <span className="font-semibold text-slate-900">{data.assessment || record.clinicalNotes || 'Osteoarthritis / Cervical Spondylosis'}</span>
            </div>
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
