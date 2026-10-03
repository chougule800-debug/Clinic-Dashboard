import React from 'react';
import { SystemFormRecord, Patient } from '../../types';
import { useClinic } from '../../context/ClinicContext';
import {
  Wind,
  Edit3,
  Share2,
  Activity,
  AlertTriangle,
  FileText,
  CloudRain,
  Sun,
  ShieldCheck,
  HeartPulse
} from 'lucide-react';

interface RespiratorySummaryCardProps {
  record: SystemFormRecord;
  patient?: Patient;
}

export const RespiratorySummaryCard: React.FC<RespiratorySummaryCardProps> = ({ record, patient }) => {
  const { setActiveTab, setActiveSystemFormKey, openWhatsAppShareDialog } = useClinic();
  const data = record.data || {};

  const handleEditCase = () => {
    setActiveSystemFormKey('respiratory');
    setActiveTab('case_taking');
  };

  const complaints = Array.isArray(data.complaints) ? data.complaints : [];
  const allergySymptoms = Array.isArray(data.allergySymptoms) ? data.allergySymptoms : [];
  const triggers = Array.isArray(data.triggers) ? data.triggers : [];
  const asthmaFeatures = Array.isArray(data.asthmaFeatures) ? data.asthmaFeatures : [];
  const worseFactors = Array.isArray(data.worse) ? data.worse : [];
  const betterFactors = Array.isArray(data.better) ? data.better : [];
  const treatments = Array.isArray(data.treatment) ? data.treatment : [];
  const examFindings = Array.isArray(data.exam) ? data.exam : [];
  const investigations = Array.isArray(data.investigation) ? data.investigation : [];
  const reportFiles = Array.isArray(data.reportFiles) ? data.reportFiles : [];

  return (
    <div className="rounded-2xl border-2 border-teal-600/30 bg-white p-6 shadow-sm space-y-6 text-xs text-slate-800">
      {/* Top Banner / Case Title */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 border-b border-teal-100 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-1 rounded-md bg-teal-100/80 text-teal-800 text-[10px] font-bold uppercase tracking-wider flex items-center gap-1">
              <Wind className="w-3 h-3 text-teal-700" />
              Respiratory & Allergy Record
            </span>
            <span className="text-slate-300">•</span>
            <span className="text-slate-600 font-medium text-xs">
              Patient: <strong className="text-slate-900">{patient?.name || data.patientName || 'Patient'}</strong>
            </span>
          </div>
          <h3 className="text-base sm:text-lg font-bold text-teal-900 font-serif mt-1">
            Respiratory • Allergy • Asthma Case Record / श्वसन • अॅलर्जी • दमा केस टेकिंग
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
              onClick={() => openWhatsAppShareDialog(patient.id, 'respiratory')}
              className="px-3 py-1.5 bg-teal-600 hover:bg-teal-700 text-white rounded-lg text-xs font-semibold flex items-center gap-1 transition-colors"
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
          <span className="text-[10px] text-slate-500 block uppercase font-semibold">Diagnosis / Assessment</span>
          <span className="font-bold text-slate-900 text-xs truncate block">
            {data.diagnosis || data.assessment || 'Respiratory Disorder'}
          </span>
        </div>
        <div>
          <span className="text-[10px] text-slate-500 block uppercase font-semibold">Severity & Frequency</span>
          <span className="font-bold text-teal-900 text-xs truncate block">
            {data.severity || record.severity || 'Moderate'} • {data.frequency || 'Daily'}
          </span>
        </div>
        <div>
          <span className="text-[10px] text-slate-500 block uppercase font-semibold">Asthma Status</span>
          <span className="font-bold text-slate-900 text-xs truncate block">
            {data.asthmaDiagnosis || 'None'}
          </span>
        </div>
        <div>
          <span className="text-[10px] text-slate-500 block uppercase font-semibold">Vitals (SpO₂ / PR)</span>
          <span className="font-bold text-slate-900 text-xs truncate block">
            {data.spo2 || '98%'} • {data.pulse || '72'} bpm
          </span>
        </div>
      </div>

      {/* Chief Complaints & Symptoms */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 space-y-2">
          <h4 className="font-bold text-slate-900 flex items-center gap-1.5 text-xs">
            <Activity className="w-3.5 h-3.5 text-teal-600" />
            Respiratory Complaints & Features
          </h4>
          {complaints.length > 0 ? (
            <div className="flex flex-wrap gap-1.5">
              {complaints.map((c: string, idx: number) => (
                <span key={idx} className="px-2 py-0.5 rounded-md bg-white border border-teal-200 text-teal-800 text-[11px] font-medium">
                  {c}
                </span>
              ))}
            </div>
          ) : (
            <p className="text-slate-500 text-[11px] italic">No specific respiratory complaints checked.</p>
          )}

          {data.complaintDetails && (
            <div className="mt-2 text-[11px] text-slate-700 bg-white p-2.5 rounded-lg border border-slate-200">
              <strong className="text-slate-900 block mb-0.5">Details:</strong>
              {data.complaintDetails}
            </div>
          )}
        </div>

        {/* Allergy & Triggers */}
        <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 space-y-2">
          <h4 className="font-bold text-slate-900 flex items-center gap-1.5 text-xs">
            <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
            Allergies & Known Triggers
          </h4>
          {allergySymptoms.length > 0 && (
            <div className="flex flex-wrap gap-1.5">
              {allergySymptoms.map((a: string, idx: number) => (
                <span key={idx} className="px-2 py-0.5 rounded-md bg-amber-50 border border-amber-200 text-amber-800 text-[11px] font-medium">
                  {a}
                </span>
              ))}
            </div>
          )}
          {triggers.length > 0 && (
            <div className="pt-1">
              <span className="text-[10px] text-slate-500 block uppercase font-semibold mb-1">Triggers:</span>
              <div className="flex flex-wrap gap-1.5">
                {triggers.map((t: string, idx: number) => (
                  <span key={idx} className="px-2 py-0.5 rounded-md bg-white border border-slate-300 text-slate-700 text-[11px]">
                    {t}
                  </span>
                ))}
              </div>
            </div>
          )}
          {data.seasonal && data.seasonal !== 'No specific pattern / ठराविक नाही' && (
            <p className="text-[11px] text-slate-600 mt-1">
              <strong>Seasonal Pattern:</strong> {data.seasonal} {data.allergyTime && `(${data.allergyTime})`}
            </p>
          )}
        </div>
      </div>

      {/* Modalities: Worse & Better */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="p-3.5 rounded-xl border border-rose-100 bg-rose-50/30 space-y-2">
          <span className="font-bold text-rose-900 flex items-center gap-1.5 text-xs">
            <CloudRain className="w-3.5 h-3.5 text-rose-600" />
            Aggravation / कशामुळे त्रास वाढतो?
          </span>
          <div className="flex flex-wrap gap-1.5">
            {worseFactors.length > 0 ? (
              worseFactors.map((w: string, idx: number) => (
                <span key={idx} className="px-2 py-0.5 rounded bg-white text-rose-700 border border-rose-200 text-[11px]">
                  {w}
                </span>
              ))
            ) : (
              <span className="text-slate-500 text-[11px]">None specified</span>
            )}
          </div>
        </div>

        <div className="p-3.5 rounded-xl border border-emerald-100 bg-emerald-50/30 space-y-2">
          <span className="font-bold text-emerald-900 flex items-center gap-1.5 text-xs">
            <Sun className="w-3.5 h-3.5 text-emerald-600" />
            Amelioration / कशामुळे आराम मिळतो?
          </span>
          <div className="flex flex-wrap gap-1.5">
            {betterFactors.length > 0 ? (
              betterFactors.map((b: string, idx: number) => (
                <span key={idx} className="px-2 py-0.5 rounded bg-white text-emerald-700 border border-emerald-200 text-[11px]">
                  {b}
                </span>
              ))
            ) : (
              <span className="text-slate-500 text-[11px]">None specified</span>
            )}
          </div>
        </div>
      </div>

      {/* Clinical Exam & Investigations */}
      <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/30 space-y-3">
        <h4 className="font-bold text-slate-900 flex items-center gap-1.5 text-xs">
          <HeartPulse className="w-3.5 h-3.5 text-teal-600" />
          Examination & Investigations
        </h4>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-[11px]">
          <div>Pulse: <strong>{data.pulse || '72'} bpm</strong></div>
          <div>BP: <strong>{data.bp || '120/80'}</strong></div>
          <div>SpO₂: <strong>{data.spo2 || '98%'}</strong></div>
          <div>Resp Rate: <strong>{data.respRate || '18'} /min</strong></div>
        </div>

        {examFindings.length > 0 && (
          <div>
            <span className="text-[10px] text-slate-500 block uppercase font-semibold mb-1">Chest Exam:</span>
            <div className="flex flex-wrap gap-1.5">
              {examFindings.map((e: string, idx: number) => (
                <span key={idx} className="px-2 py-0.5 rounded bg-white border border-slate-300 text-slate-700 text-[11px]">
                  {e}
                </span>
              ))}
            </div>
          </div>
        )}

        {data.reportFinding && (
          <div className="text-[11px] text-slate-700 bg-white p-2 rounded-lg border border-slate-200">
            <strong>Key Report:</strong> {data.reportFinding} {data.investigationDate && `(${data.investigationDate})`}
          </div>
        )}

        {reportFiles.length > 0 && (
          <div className="pt-2 border-t border-slate-200">
            <span className="text-[10px] text-slate-500 block uppercase font-semibold mb-2">Attached Reports & Photos:</span>
            <div className="flex flex-wrap gap-2">
              {reportFiles.map((file: any, idx: number) => (
                <div key={idx} className="border border-slate-300 rounded-lg overflow-hidden bg-white p-1">
                  {file.data ? (
                    <img src={file.data} alt={file.name} className="w-20 h-16 object-cover rounded" />
                  ) : (
                    <div className="w-20 h-16 flex items-center justify-center text-[9px] text-slate-500 text-center px-1">
                      {file.name}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Doctor Notes & Follow up */}
      {(data.doctorNotes || data.followupDate) && (
        <div className="p-3.5 rounded-xl border border-teal-200 bg-teal-50/40 space-y-1">
          <span className="font-bold text-teal-900 block text-xs">Doctor's Clinical Notes & Follow-up:</span>
          {data.doctorNotes && <p className="text-[11px] text-slate-800">{data.doctorNotes}</p>}
          {data.followupDate && (
            <p className="text-[11px] font-semibold text-teal-800 mt-1">
              Next Follow-up: {data.followupDate}
            </p>
          )}
        </div>
      )}
    </div>
  );
};
