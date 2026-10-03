import React from 'react';
import { SystemFormRecord, Patient } from '../../types';
import { useClinic } from '../../context/ClinicContext';
import {
  Brain,
  Edit3,
  Share2,
  Sparkles,
  Zap,
  Activity,
  Heart,
  Moon,
  FileText,
  Clock,
  ArrowRight,
  Compass
} from 'lucide-react';

interface MindGeneralsSummaryCardProps {
  record: SystemFormRecord;
  patient?: Patient;
}

export const MindGeneralsSummaryCard: React.FC<MindGeneralsSummaryCardProps> = ({ record, patient }) => {
  const { setActiveTab, setActiveSystemFormKey, openWhatsAppShareDialog } = useClinic();
  const data = record.data || {};

  const handleEditCase = () => {
    setActiveSystemFormKey('other_mind_generals');
    setActiveTab('case_taking');
  };

  const mindStates = Array.isArray(data.mind) ? data.mind : [];
  const triggers = Array.isArray(data.trigger) ? data.trigger : [];
  const bodySymptoms = Array.isArray(data.body) ? data.body : [];
  const rubrics = Array.isArray(data.rubrics) ? data.rubrics : [];
  const modalities = Array.isArray(data.mod) ? data.mod : [];
  const reportFiles = Array.isArray(data.reportFiles) ? data.reportFiles : [];

  return (
    <div className="rounded-2xl border-2 border-emerald-600/30 bg-white p-6 shadow-sm space-y-6 text-xs text-slate-800">
      {/* Top Banner / Case Title */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 border-b border-emerald-100 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-1 rounded-md bg-emerald-100/80 text-emerald-900 text-[10px] font-bold uppercase tracking-wider flex items-center gap-1">
              <Brain className="w-3 h-3 text-emerald-700" />
              Psycho-Somatic & Generals Record
            </span>
            <span className="text-slate-300">•</span>
            <span className="text-slate-600 font-medium text-xs">
              Patient: <strong className="text-slate-900">{patient?.name || data.patientName || 'Patient'}</strong>
            </span>
          </div>
          <h3 className="text-base sm:text-lg font-bold text-emerald-950 font-serif mt-1">
            Dr. Bharat's Arogya Homeopathy — Psycho-Somatic Case Taking / मानसिक-शारीरिक केस टेकिंग
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
              onClick={() => openWhatsAppShareDialog(patient.id, 'other_mind_generals')}
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
          <span className="font-bold text-slate-900 text-xs truncate block">
            {data.mainComplaint || record.chiefComplaints || 'Psycho-Somatic'}
          </span>
        </div>
        <div>
          <span className="text-[10px] text-slate-500 block uppercase font-semibold">Mental State Flags</span>
          <span className="font-bold text-emerald-900 text-xs truncate block">
            {mindStates.length > 0 ? `${mindStates.length} Symptoms Active` : 'Recorded'}
          </span>
        </div>
        <div>
          <span className="text-[10px] text-slate-500 block uppercase font-semibold">Emotional Triggers</span>
          <span className="font-bold text-slate-900 text-xs truncate block">
            {triggers.length > 0 ? triggers.join(', ') : 'None marked'}
          </span>
        </div>
        <div>
          <span className="text-[10px] text-slate-500 block uppercase font-semibold">Vitals (BP / Pulse)</span>
          <span className="font-bold text-slate-900 text-xs truncate block">
            {data.bp || '120/80'} • {data.pulse || '76'} bpm
          </span>
        </div>
      </div>

      {/* Physical Complaint & Mental Disposition */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Physical Complaints */}
        <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 space-y-2">
          <h4 className="font-bold text-slate-900 flex items-center gap-1.5 text-xs">
            <Activity className="w-3.5 h-3.5 text-[#176b45]" />
            Physical Complaints & Sensation
          </h4>
          {data.mainComplaint && (
            <div className="text-[11px] text-slate-800 bg-white p-2.5 rounded-lg border border-slate-200">
              <strong className="block text-slate-900 mb-0.5">Main Complaint:</strong>
              {data.mainComplaint}
            </div>
          )}
          {data.complaintCharacter && (
            <div className="text-[11px] text-slate-700">
              <strong>Site, Sensation & Character:</strong> {data.complaintCharacter}
            </div>
          )}
          <div className="grid grid-cols-2 gap-2 text-[11px] pt-1">
            <div>Onset: <strong>{data.onsetDuration || 'Gradual'}</strong></div>
            <div>Associated: <strong>{data.associated || 'None'}</strong></div>
          </div>
        </div>

        {/* Mental & Emotional State */}
        <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 space-y-2">
          <h4 className="font-bold text-slate-900 flex items-center gap-1.5 text-xs">
            <Brain className="w-3.5 h-3.5 text-emerald-600" />
            Mental & Emotional State ({mindStates.length})
          </h4>
          {mindStates.length > 0 ? (
            <div className="flex flex-wrap gap-1.5">
              {mindStates.map((m: string, idx: number) => (
                <span key={idx} className="px-2 py-0.5 rounded-md bg-white border border-emerald-200 text-emerald-900 text-[11px] font-medium">
                  {m}
                </span>
              ))}
            </div>
          ) : (
            <p className="text-slate-500 text-[11px] italic">No specific mental states checked.</p>
          )}
          {data.mentalDetail && (
            <div className="text-[11px] text-slate-700 bg-white p-2.5 rounded-lg border border-slate-200 mt-2">
              <strong className="block text-slate-900 mb-0.5">Detailed Mental State:</strong>
              {data.mentalDetail}
            </div>
          )}
        </div>
      </div>

      {/* Emotion -> Body Sequence Card */}
      {(data.seqEvent || data.seqEmotion || data.seqThought || data.seqPhysical) && (
        <div className="p-4 rounded-xl border border-amber-200 bg-amber-50/40 space-y-3">
          <div className="flex items-center justify-between">
            <h4 className="font-bold text-amber-950 flex items-center gap-1.5 text-xs">
              <Zap className="w-3.5 h-3.5 text-amber-600" />
              Emotion → Body Sequence Mapping / भावना → शरीर प्रतिक्रिया
            </h4>
            <span className="text-[10px] text-amber-700 font-semibold uppercase">Psychosomatic Axis</span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 text-[11px]">
            <div className="bg-white p-2 rounded-lg border border-amber-200">
              <strong className="text-amber-900 block text-[10px] uppercase font-semibold">1. Event</strong>
              <p className="text-slate-800">{data.seqEvent || '—'}</p>
            </div>
            <div className="bg-white p-2 rounded-lg border border-amber-200">
              <strong className="text-amber-900 block text-[10px] uppercase font-semibold">2. Emotion</strong>
              <p className="text-slate-800">{data.seqEmotion || '—'}</p>
            </div>
            <div className="bg-white p-2 rounded-lg border border-amber-200">
              <strong className="text-amber-900 block text-[10px] uppercase font-semibold">3. Thought</strong>
              <p className="text-slate-800">{data.seqThought || '—'}</p>
            </div>
            <div className="bg-white p-2 rounded-lg border border-amber-200">
              <strong className="text-amber-900 block text-[10px] uppercase font-semibold">4. Physical Symptom</strong>
              <p className="text-slate-800 font-semibold text-rose-700">{data.seqPhysical || '—'}</p>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-[11px] pt-1">
            <div>Onset Time: <strong>{data.seqOnset || '—'}</strong></div>
            <div>Duration: <strong>{data.seqDuration || '—'}</strong></div>
            <div>Modalities: <strong>{data.seqModalities || '—'}</strong></div>
            <div>Concomitants: <strong>{data.seqConcomitant || '—'}</strong></div>
          </div>
        </div>
      )}

      {/* Somatization & Kent Rubrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Somatization Symptoms */}
        <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 space-y-2">
          <h4 className="font-bold text-slate-900 flex items-center gap-1.5 text-xs">
            <Heart className="w-3.5 h-3.5 text-teal-600" />
            Somatization Organs & Symptoms
          </h4>
          {bodySymptoms.length > 0 ? (
            <div className="flex flex-wrap gap-1.5">
              {bodySymptoms.map((b: string, idx: number) => (
                <span key={idx} className="px-2 py-0.5 rounded bg-white border border-teal-200 text-teal-900 text-[11px] font-medium">
                  {b}
                </span>
              ))}
            </div>
          ) : (
            <p className="text-slate-500 text-[11px] italic">No organ mappings selected.</p>
          )}
          {data.bodyDetail && (
            <div className="text-[11px] text-slate-700 bg-white p-2.5 rounded-lg border border-slate-200 mt-2">
              <strong className="block text-slate-900 mb-0.5">Association Details:</strong>
              {data.bodyDetail}
            </div>
          )}
        </div>

        {/* Kent Mind Rubrics */}
        <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 space-y-2">
          <h4 className="font-bold text-slate-900 flex items-center gap-1.5 text-xs">
            <Sparkles className="w-3.5 h-3.5 text-purple-600" />
            Kent Mind Rubrics Selected
          </h4>
          {rubrics.length > 0 ? (
            <div className="flex flex-wrap gap-1.5">
              {rubrics.map((r: string, idx: number) => (
                <span key={idx} className="px-2 py-0.5 rounded bg-purple-50 border border-purple-200 text-purple-900 text-[11px] font-medium">
                  {r}
                </span>
              ))}
            </div>
          ) : (
            <p className="text-slate-500 text-[11px] italic">No Kent rubrics checked.</p>
          )}
          {data.selectedRubrics && (
            <div className="text-[11px] text-purple-900 bg-purple-50/60 p-2 rounded-lg border border-purple-200 font-mono whitespace-pre-line mt-2">
              {data.selectedRubrics}
            </div>
          )}
        </div>
      </div>

      {/* General Modalities & Sleep / Dreams */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Modalities & Generals */}
        <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/30 space-y-2">
          <h4 className="font-bold text-slate-900 flex items-center gap-1.5 text-xs">
            <Compass className="w-3.5 h-3.5 text-indigo-600" />
            General Modalities & Generals
          </h4>
          {modalities.length > 0 && (
            <div className="flex flex-wrap gap-1.5">
              {modalities.map((m: string, idx: number) => (
                <span key={idx} className="px-2 py-0.5 rounded bg-white border border-indigo-200 text-indigo-900 text-[11px]">
                  {m}
                </span>
              ))}
            </div>
          )}
          {data.generals && (
            <div className="text-[11px] text-slate-700 bg-white p-2 rounded-lg border border-slate-200 mt-2">
              <strong>Other Generals:</strong> {data.generals}
            </div>
          )}
        </div>

        {/* Sleep, Dreams, Function */}
        <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/30 space-y-2">
          <h4 className="font-bold text-slate-900 flex items-center gap-1.5 text-xs">
            <Moon className="w-3.5 h-3.5 text-slate-700" />
            Sleep, Dreams & Daily Function
          </h4>
          <div className="grid grid-cols-2 gap-2 text-[11px]">
            <div>Sleep: <strong>{data.sleep || 'Normal'}</strong></div>
            <div>Dreams: <strong>{data.dreams || 'None prominent'}</strong></div>
            <div>Appetite / Thirst: <strong>{data.appetite || 'Normal'}</strong></div>
            <div>Function: <strong>{data.function || 'Normal'}</strong></div>
          </div>
        </div>
      </div>

      {/* Reports & Files */}
      {reportFiles.length > 0 && (
        <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/30 space-y-2">
          <h4 className="font-bold text-slate-900 flex items-center gap-1.5 text-xs">
            <FileText className="w-3.5 h-3.5 text-[#176b45]" />
            Attached Investigation Photos & Reports ({reportFiles.length})
          </h4>
          <div className="flex flex-wrap gap-2 pt-1">
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

      {/* Doctor's Assessment & Clinical Plan */}
      {(data.assessment || data.plan || data.followNotes) && (
        <div className="p-3.5 rounded-xl border border-emerald-200 bg-emerald-50/40 space-y-1">
          <span className="font-bold text-emerald-950 block text-xs">
            Doctor's Clinical Assessment & Plan:
          </span>
          {data.assessment && <p className="text-[11px] font-semibold text-slate-900">{data.assessment}</p>}
          {data.plan && <p className="text-[11px] text-slate-800">{data.plan}</p>}
          {data.followDate && (
            <p className="text-[11px] font-semibold text-emerald-900 mt-1">
              Next Follow-up: {data.followDate} {data.followNotes && `(${data.followNotes})`}
            </p>
          )}
        </div>
      )}
    </div>
  );
};
