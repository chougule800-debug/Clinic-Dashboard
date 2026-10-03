import React from 'react';
import { useClinic } from '../../context/ClinicContext';
import { CLINIC_CONFIG } from '../../config/clinicConfig';
import { SkinHairSummaryCard } from './SkinHairSummaryCard';
import { NeuroSummaryCard } from './NeuroSummaryCard';
import { GastroSummaryCard } from './GastroSummaryCard';
import { UrinarySummaryCard } from './UrinarySummaryCard';
import { MusculoskeletalSummaryCard } from './MusculoskeletalSummaryCard';
import { RespiratorySummaryCard } from './RespiratorySummaryCard';
import { FemaleGynaeSummaryCard } from './FemaleGynaeSummaryCard';
import { PediatricSummaryCard } from './PediatricSummaryCard';
import { MindGeneralsSummaryCard } from './MindGeneralsSummaryCard';
import { FileCheck2, GitBranch, Pill, Printer, Activity, User, MessageSquare, Sparkles, ChevronRight } from 'lucide-react';

interface SystemFormLike {
  id: string;
  patientId: string;
  system: string;
  updatedAt: string;
  submittedVia: 'Doctor_Dashboard' | 'WhatsApp_Remote_Intake' | 'Patient_Portal';
  chiefComplaints: string;
  duration: string;
  severity: 'Mild' | 'Moderate' | 'Severe';
  modalitiesAggravation: string;
  modalitiesAmelioration: string;
  concomitants: string;
  clinicalNotes: string;
  data: Record<string, unknown>;
}

const WhatsAppRemoteSubmissionBadge: React.FC<{ record: SystemFormLike }> = ({ record }) => {
  const isRemote =
    record.submittedVia === 'WhatsApp_Remote_Intake' ||
    record.clinicalNotes.toLowerCase().includes('whatsapp') ||
    record.clinicalNotes.toLowerCase().includes('remotely');
  if (!isRemote) return null;
  return (
    <div className="bg-emerald-50/90 border-2 border-emerald-500 rounded-2xl p-5 shadow-sm space-y-3 mb-3">
      <div className="flex items-center gap-3">
        <div className="w-11 h-11 rounded-xl bg-emerald-600 text-white flex items-center justify-center font-bold">
          <MessageSquare className="w-6 h-6" />
        </div>
        <div>
          <span className="font-bold text-emerald-950 text-base">Submitted Remotely by Patient</span>
          <p className="text-sm text-emerald-700">
            Received {new Date(record.updatedAt).toLocaleString()} • System:{' '}
            <strong className="capitalize">{record.system.replace('_', ' ')}</strong>
          </p>
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
        <div className="bg-white p-4 rounded-xl border border-emerald-200">
          <span className="text-xs font-bold uppercase tracking-wider text-emerald-800 block">Chief Complaints</span>
          <p className="text-slate-900 font-semibold text-base mt-1">{record.chiefComplaints || 'Self-reported symptoms'}</p>
        </div>
        <div className="bg-white p-4 rounded-xl border border-emerald-200 space-y-2">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-rose-700 block">Aggravations</span>
            <p className="text-slate-800 text-sm mt-1">{record.modalitiesAggravation || 'Not specified'}</p>
          </div>
          <div className="pt-2 border-t border-slate-100">
            <span className="text-xs font-bold uppercase tracking-wider text-teal-700 block">Ameliorations</span>
            <p className="text-slate-800 text-sm mt-1">{record.modalitiesAmelioration || 'Not specified'}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export const CaseSummaryView: React.FC = () => {
  const { patients, selectedPatient, selectPatient, systemForms, setActiveTab } = useClinic();

  if (!selectedPatient) {
    return (
      <div className="p-8 text-center bg-white rounded-2xl border border-slate-200">
        <FileCheck2 className="w-12 h-12 text-slate-400 mx-auto mb-2" />
        <h3 className="font-bold text-slate-800 text-base">No Active Patient Selected</h3>
        <p className="text-sm text-slate-500 mt-1">Please select or register a patient to view their consolidated case summary.</p>
      </div>
    );
  }

  const patientForms = systemForms.filter(f => f.patientId === selectedPatient.id) as SystemFormLike[];

  return (
    <div className="space-y-4 pb-12 text-base">
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1 flex-wrap">
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-teal-50 text-teal-800 border border-teal-200 flex items-center gap-1">
              <FileCheck2 className="w-3.5 h-3.5 text-teal-600" />
              Consolidated Case Record
            </span>
          </div>
          <h2 className="text-2xl font-bold text-slate-900 font-serif flex items-center gap-2">
            <FileCheck2 className="w-6 h-6 text-teal-700" />
            Consolidated Case Summary
          </h2>
          <p className="text-sm text-slate-500">Synthesized clinical profile from all recorded system forms.</p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <div className="flex items-center gap-1.5 bg-slate-50 border border-teal-300 rounded-xl px-3 py-2">
            <User className="w-4 h-4 text-teal-700" />
            <select
              value={selectedPatient.id}
              onChange={e => selectPatient(e.target.value)}
              className="bg-transparent text-sm font-bold text-slate-900 focus:outline-none cursor-pointer"
            >
              {patients.map(p => (
                <option key={p.id} value={p.id}>{p.name} ({p.patientCode ?? p.id})</option>
              ))}
            </select>
          </div>
          <button onClick={() => setActiveTab('repertorisation')} className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-sm rounded-xl transition-colors flex items-center gap-2 shadow-xs">
            <GitBranch className="w-5 h-5" /><span>Repertorise</span>
          </button>
          <button onClick={() => setActiveTab('prescription')} className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-sm rounded-xl transition-colors flex items-center gap-2 shadow-xs">
            <Pill className="w-5 h-5" /><span>Prescribe</span>
          </button>
          <button onClick={() => window.print()} className="p-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl transition-colors" title="Print Case Summary">
            <Printer className="w-5 h-5" />
          </button>
        </div>
      </div>

      <div id="case-summary-paper" className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 sm:p-8 space-y-6 text-slate-800">
        <div className="border-b-2 border-teal-800/20 pb-4 flex flex-col sm:flex-row justify-between items-start gap-4">
          <div>
            <h1 className="text-2xl font-bold text-slate-900 font-serif">{CLINIC_CONFIG.appName}</h1>
            <p className="text-sm text-slate-700 mt-1 font-medium">
              {CLINIC_CONFIG.doctorName}
              {CLINIC_CONFIG.qualifications && `, ${CLINIC_CONFIG.qualifications}`}
              {CLINIC_CONFIG.regNo && ` • Reg. ${CLINIC_CONFIG.regNo}`}
            </p>
            {CLINIC_CONFIG.address && <p className="text-sm text-slate-500">{CLINIC_CONFIG.address}</p>}
          </div>
          <div className="sm:text-right text-sm text-slate-500">
            <div>Date: <strong>{new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</strong></div>
          </div>
        </div>

        <div className="p-5 bg-slate-50 rounded-xl border border-slate-200 space-y-3">
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 border-b border-slate-200 pb-3">
            <div>
              <div className="text-xs uppercase font-bold text-slate-400">Patient Name</div>
              <div className="font-bold text-slate-900 text-base">{selectedPatient.name}</div>
              <div className="text-slate-500 text-sm">{selectedPatient.age} yrs • {selectedPatient.gender}</div>
            </div>
            <div>
              <div className="text-xs uppercase font-bold text-slate-400">Contact</div>
              <div className="font-bold text-slate-800 text-sm">{selectedPatient.mobile}</div>
              <div className="text-slate-500 text-sm truncate max-w-[200px]">{selectedPatient.address}</div>
            </div>
            <div>
              <div className="text-xs uppercase font-bold text-slate-400">Patient Code</div>
              <div className="font-mono text-slate-800 text-sm">{selectedPatient.patientCode || selectedPatient.id.slice(0, 8)}</div>
              {selectedPatient.bloodGroup && <div className="text-slate-500 text-sm">{selectedPatient.bloodGroup} Blood Group</div>}
            </div>
          </div>
          <div>
            <div className="text-xs uppercase font-bold text-slate-500 mb-2 flex items-center gap-1.5">
              <Activity className="w-3.5 h-3.5 text-rose-500" />Recorded Clinical Vitals
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3 text-sm">
              <div className="bg-white p-3 rounded-lg border border-slate-200"><span className="text-xs text-slate-400 block font-medium">Age</span><span className="font-bold text-slate-900 text-base">{selectedPatient.age || '—'}</span></div>
              <div className="bg-white p-3 rounded-lg border border-slate-200"><span className="text-xs text-slate-400 block font-medium">Blood Pressure</span><span className="font-bold text-slate-900 text-base">{selectedPatient.vitals.bpSystolic}/{selectedPatient.vitals.bpDiastolic}</span></div>
              <div className="bg-white p-3 rounded-lg border border-slate-200"><span className="text-xs text-slate-400 block font-medium">RBS</span><span className="font-bold text-slate-900 text-base">{selectedPatient.vitals.rbs || '—'}</span></div>
              <div className="bg-white p-3 rounded-lg border border-slate-200"><span className="text-xs text-slate-400 block font-medium">Height</span><span className="font-bold text-slate-900 text-base">{selectedPatient.vitals.heightInches || '—'}</span></div>
              <div className="bg-white p-3 rounded-lg border border-slate-200"><span className="text-xs text-slate-400 block font-medium">Weight</span><span className="font-bold text-slate-900 text-base">{selectedPatient.vitals.weight || '—'}</span></div>
              <div className="bg-white p-3 rounded-lg border border-slate-200"><span className="text-xs text-slate-400 block font-medium">BMI</span><span className="font-bold text-teal-700 text-base">{selectedPatient.vitals.bmi || '—'}</span></div>
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <div className="flex items-center justify-between border-b border-slate-200 pb-2">
            <h3 className="font-bold text-lg text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
              <Sparkles className="w-5 h-5 text-teal-600" />
              Recorded System-Wise Symptoms ({patientForms.length})
            </h3>
            <button onClick={() => setActiveTab('case_taking')} className="text-teal-700 hover:text-teal-800 text-sm font-semibold">
              + Add / Edit Systems
            </button>
          </div>
          {patientForms.length === 0 ? (
            <div className="p-8 text-center bg-slate-50 rounded-2xl border-2 border-dashed border-slate-200 space-y-4">
              <FileCheck2 className="w-10 h-10 text-slate-300 mx-auto" />
              <p className="text-slate-700 font-semibold text-base">No system forms recorded yet.</p>
              <button onClick={() => setActiveTab('case_taking')} className="px-5 py-2.5 bg-teal-600 hover:bg-teal-700 text-white rounded-xl text-sm font-semibold shadow-xs transition-colors">
                Start Case Taking
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              {patientForms.map(rec => {
                let card: React.ReactNode = null;
                if (rec.system === 'skin_hair') card = <SkinHairSummaryCard record={rec as never} patient={selectedPatient} />;
                else if (rec.system === 'headache') card = <NeuroSummaryCard record={rec as never} patient={selectedPatient} />;
                else if (rec.system === 'gastrointestinal') card = <GastroSummaryCard record={rec as never} patient={selectedPatient} />;
                else if (rec.system === 'urinary') card = <UrinarySummaryCard record={rec as never} patient={selectedPatient} />;
                else if (rec.system === 'musculoskeletal') card = <MusculoskeletalSummaryCard record={rec as never} patient={selectedPatient} />;
                else if (rec.system === 'respiratory') card = <RespiratorySummaryCard record={rec as never} patient={selectedPatient} />;
                else if (rec.system === 'female_gynae') card = <FemaleGynaeSummaryCard record={rec as never} patient={selectedPatient} />;
                else if (rec.system === 'pediatric') card = <PediatricSummaryCard record={rec as never} patient={selectedPatient} />;
                else if (rec.system === 'other_mind_generals') card = <MindGeneralsSummaryCard record={rec as never} patient={selectedPatient} />;
                else card = (
                  <div className="p-4 rounded-xl border border-slate-200 bg-white space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-slate-900 text-sm capitalize">{rec.system.replace('_', ' ')}</span>
                      <span className="text-xs text-slate-400">({rec.duration})</span>
                    </div>
                    <div className="text-slate-800 text-sm font-medium">{rec.chiefComplaints}</div>
                  </div>
                );
                return (
                  <div key={rec.id} className="space-y-2">
                    <WhatsAppRemoteSubmissionBadge record={rec} />
                    {card}
                  </div>
                );
              })}
            </div>
          )}
        </div>

        <div className="p-5 bg-teal-50/50 rounded-xl border border-teal-200 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div>
            <h4 className="font-bold text-teal-950 text-base">Next Step: Repertory Analysis</h4>
            <p className="text-sm text-teal-800 mt-1">Open the Repertory matrix to rank indicated remedies from this case.</p>
          </div>
          <button onClick={() => setActiveTab('repertorisation')} className="px-5 py-2.5 bg-teal-700 hover:bg-teal-800 text-white font-bold text-sm rounded-xl transition-colors flex items-center gap-2 shrink-0 shadow-xs">
            <span>Open Repertorisation</span><ChevronRight className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
};