import React from 'react';
import { SystemFormRecord, Patient } from '../../types';
import { useClinic } from '../../context/ClinicContext';
import {
  Baby,
  Edit3,
  Share2,
  Brain,
  Sparkles,
  Activity,
  Calendar,
  FileText
} from 'lucide-react';

interface PediatricSummaryCardProps {
  record: SystemFormRecord;
  patient?: Patient;
}

export const PediatricSummaryCard: React.FC<PediatricSummaryCardProps> = ({ record, patient }) => {
  const { setActiveTab, setActiveSystemFormKey, openWhatsAppShareDialog } = useClinic();
  const data = record.data || {};

  const handleEditCase = () => {
    setActiveSystemFormKey('pediatric');
    setActiveTab('case_taking');
  };

  const complaints = Array.isArray(data.complaints) ? data.complaints : [];
  const foodPrefs = Array.isArray(data.food) ? data.food : [];
  const concerns = Array.isArray(data.developmentConcerns) ? data.developmentConcerns : [];
  const neuroFlags = Array.isArray(data.neuro) ? data.neuro : [];
  const investigations = Array.isArray(data.investigation) ? data.investigation : [];
  const reportFiles = Array.isArray(data.reportFiles) ? data.reportFiles : [];

  return (
    <div className="rounded-2xl border-2 border-amber-500/30 bg-white p-6 shadow-sm space-y-6 text-xs text-slate-800">
      {/* Top Banner / Case Title */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 border-b border-amber-100 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-1 rounded-md bg-amber-100/80 text-amber-800 text-[10px] font-bold uppercase tracking-wider flex items-center gap-1">
              <Baby className="w-3 h-3 text-amber-700" />
              Pediatric & Developmental Record
            </span>
            <span className="text-slate-300">•</span>
            <span className="text-slate-600 font-medium text-xs">
              Child: <strong className="text-slate-900">{patient?.name || data.childName || 'Child'}</strong>
            </span>
          </div>
          <h3 className="text-base sm:text-lg font-bold text-amber-950 font-serif mt-1">
            Pediatric Developmental & Clinical Case Record / बालरोग केस टेकिंग
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
            className="px-3 py-1.5 bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-200 rounded-lg text-xs font-semibold flex items-center gap-1 transition-colors"
          >
            <Edit3 className="w-3.5 h-3.5" />
            <span>Edit Case</span>
          </button>
          {patient && (
            <button
              type="button"
              onClick={() => openWhatsAppShareDialog(patient.id, 'pediatric')}
              className="px-3 py-1.5 bg-amber-600 hover:bg-amber-700 text-white rounded-lg text-xs font-semibold flex items-center gap-1 transition-colors"
            >
              <Share2 className="w-3.5 h-3.5" />
              <span>Share Form</span>
            </button>
          )}
        </div>
      </div>

      {/* Quick Status Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-amber-50/50 p-3.5 rounded-xl border border-amber-100">
        <div>
          <span className="text-[10px] text-slate-500 block uppercase font-semibold">Age & Sex</span>
          <span className="font-bold text-slate-900 text-xs truncate block">
            {data.age ? `${data.age} yrs` : 'Child'} • {data.sex || 'Male'}
          </span>
        </div>
        <div>
          <span className="text-[10px] text-slate-500 block uppercase font-semibold">Birth & Delivery</span>
          <span className="font-bold text-amber-900 text-xs truncate block">
            {data.deliveryMode || 'Normal'} ({data.birthWeight || '2.9 kg'})
          </span>
        </div>
        <div>
          <span className="text-[10px] text-slate-500 block uppercase font-semibold">Immunization</span>
          <span className="font-bold text-slate-900 text-xs truncate block">
            {data.immunization || 'Complete'}
          </span>
        </div>
        <div>
          <span className="text-[10px] text-slate-500 block uppercase font-semibold">Developmental Status</span>
          <span className="font-bold text-slate-900 text-xs truncate block">
            {concerns[0] || 'Milestones on track'}
          </span>
        </div>
      </div>

      {/* Complaints & Antenatal */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 space-y-2">
          <h4 className="font-bold text-slate-900 flex items-center gap-1.5 text-xs">
            <Activity className="w-3.5 h-3.5 text-amber-600" />
            Chief Complaints
          </h4>
          {complaints.length > 0 ? (
            <div className="flex flex-wrap gap-1.5">
              {complaints.map((c: string, idx: number) => (
                <span key={idx} className="px-2 py-0.5 rounded bg-white border border-amber-200 text-amber-900 text-[11px] font-medium">
                  {c}
                </span>
              ))}
            </div>
          ) : (
            <p className="text-slate-500 text-[11px] italic">No active chief complaints marked.</p>
          )}

          {data.complaintDetails && (
            <div className="text-[11px] text-slate-700 bg-white p-2.5 rounded-lg border border-slate-200 mt-2">
              <strong>Complaint Details:</strong> {data.complaintDetails}
            </div>
          )}
        </div>

        {/* Nutrition & Habits */}
        <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 space-y-2">
          <h4 className="font-bold text-slate-900 flex items-center gap-1.5 text-xs">
            <Baby className="w-3.5 h-3.5 text-amber-600" />
            Feeding & Daily Habits
          </h4>
          <div className="grid grid-cols-2 gap-2 text-[11px]">
            <div>Breastfeeding: <strong>{data.breastfeeding || 'Exclusive'}</strong></div>
            <div>Weaning: <strong>{data.weaningAge || '6m'}</strong></div>
            <div>Urination: <strong>{data.urine || 'Normal'}</strong></div>
            <div>Sleep: <strong>{data.sleep || 'Normal'}</strong></div>
          </div>
          {foodPrefs.length > 0 && (
            <div className="pt-1">
              <span className="text-[10px] text-slate-500 block uppercase font-semibold mb-1">Food Cravings & Appetite:</span>
              <div className="flex flex-wrap gap-1.5">
                {foodPrefs.map((f: string, idx: number) => (
                  <span key={idx} className="px-2 py-0.5 rounded bg-white border border-slate-300 text-slate-700 text-[11px]">
                    {f}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Developmental Milestones Grid */}
      <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/30 space-y-3">
        <h4 className="font-bold text-slate-900 flex items-center gap-1.5 text-xs">
          <Sparkles className="w-3.5 h-3.5 text-amber-600" />
          Milestone Progression
        </h4>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-[11px]">
          <div className="bg-white p-2.5 rounded-lg border border-slate-200">
            <strong className="text-amber-900 block mb-1">Gross Motor</strong>
            <div>Head control: {data.headControl || '3m'}</div>
            <div>Sitting: {data.sitting || '6-7m'}</div>
            <div>Walking: {data.walking || '12m'}</div>
          </div>
          <div className="bg-white p-2.5 rounded-lg border border-slate-200">
            <strong className="text-amber-900 block mb-1">Fine Motor</strong>
            <div>Reaches: {data.reaches || '4m'}</div>
            <div>Pincer grasp: {data.pincer || '9-10m'}</div>
            <div>Drawing: {data.drawing || '2.5y'}</div>
          </div>
          <div className="bg-white p-2.5 rounded-lg border border-slate-200">
            <strong className="text-amber-900 block mb-1">Speech & Language</strong>
            <div>First word: {data.firstWord || '12m'}</div>
            <div>2-word phrase: {data.twoWords || '24m'}</div>
            <div>Sentences: {data.sentences || '3y'}</div>
          </div>
          <div className="bg-white p-2.5 rounded-lg border border-slate-200">
            <strong className="text-amber-900 block mb-1">Social & Adaptive</strong>
            <div>Social smile: {data.socialSmile || '2m'}</div>
            <div>Toilet dry: {data.toiletTraining || '2.5y'}</div>
            <div>Self-feeding: {data.selfFeeding || 'Independent'}</div>
          </div>
        </div>

        {concerns.length > 0 && !concerns.includes('No delay / विलंब नाही') && (
          <div className="p-2 bg-amber-50 border border-amber-200 rounded-lg text-amber-900 text-[11px] font-semibold">
            Development Concerns Identified: {concerns.join(', ')}
          </div>
        )}
      </div>

      {/* Neurodevelopment & Behaviour if present */}
      {(neuroFlags.length > 0 || data.behaviourNotes) && (
        <div className="p-4 rounded-xl border border-purple-200 bg-purple-50/40 space-y-2">
          <h4 className="font-bold text-purple-900 flex items-center gap-1.5 text-xs">
            <Brain className="w-3.5 h-3.5 text-purple-700" />
            Behaviour & Neurodevelopmental Observations
          </h4>
          {neuroFlags.length > 0 && (
            <div className="flex flex-wrap gap-1.5">
              {neuroFlags.map((n: string, idx: number) => (
                <span key={idx} className="px-2 py-0.5 rounded bg-white border border-purple-200 text-purple-900 text-[11px]">
                  {n}
                </span>
              ))}
            </div>
          )}
          {data.behaviourNotes && (
            <p className="text-[11px] text-slate-700 bg-white p-2 rounded-lg border border-purple-100">
              {data.behaviourNotes}
            </p>
          )}
        </div>
      )}

      {/* Doctor's Assessment */}
      {(data.assessment || data.doctorNotes) && (
        <div className="p-3.5 rounded-xl border border-amber-200 bg-amber-50/40 space-y-1">
          <span className="font-bold text-amber-900 block text-xs">Doctor's Clinical Assessment & Plan:</span>
          {data.assessment && <p className="text-[11px] font-semibold text-slate-900">{data.assessment}</p>}
          {data.doctorNotes && <p className="text-[11px] text-slate-800">{data.doctorNotes}</p>}
          {data.followupDate && (
            <p className="text-[11px] font-semibold text-amber-800 mt-1">
              Next Visit: {data.followupDate}
            </p>
          )}
        </div>
      )}
    </div>
  );
};
