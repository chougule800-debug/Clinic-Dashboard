import React, { useState } from 'react';
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
import {
  FileCheck2,
  GitBranch,
  Pill,
  Share2,
  Printer,
  ShieldCheck,
  Heart,
  Activity,
  Droplet,
  Weight,
  User,
  CheckCircle2,
  Copy,
  ChevronRight,
  Sparkles,
  Code,
  MessageSquare
} from 'lucide-react';

const WhatsAppRemoteSubmissionBadge: React.FC<{ record: any }> = ({ record }) => {
  const isRemote =
    record.submittedVia === 'WhatsApp_Remote_Intake' ||
    record.clinicalNotes?.toLowerCase().includes('whatsapp') ||
    record.clinicalNotes?.toLowerCase().includes('remotely');

  if (!isRemote) return null;

  return (
    <div className="bg-emerald-50/90 border-2 border-emerald-500 rounded-2xl p-4 sm:p-5 shadow-sm space-y-3.5 mb-3">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-emerald-200 pb-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center font-bold shadow-xs shrink-0">
            <MessageSquare className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <span className="font-bold text-emerald-950 text-sm sm:text-base">
                📱 Submitted Remotely via WhatsApp Patient Portal
              </span>
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-200 text-emerald-900 uppercase tracking-wider">
                Live WhatsApp Sync
              </span>
            </div>
            <p className="text-xs text-emerald-700 mt-0.5">
              Received: <strong>{new Date(record.updatedAt).toLocaleDateString()}</strong> at <strong>{new Date(record.updatedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</strong> • System: <strong className="capitalize">{String(record.system).replace('_', ' ')}</strong>
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          <span className={`px-3 py-1 rounded-full text-xs font-bold ${
            record.severity === 'Severe' ? 'bg-rose-100 text-rose-800 border border-rose-200' :
            record.severity === 'Moderate' ? 'bg-amber-100 text-amber-800 border border-amber-200' :
            'bg-emerald-100 text-emerald-800 border border-emerald-200'
          }`}>
            {record.severity} Severity
          </span>
          <span className="text-xs font-semibold text-emerald-900 bg-white px-3 py-1 rounded-xl border border-emerald-200 shadow-2xs">
            Duration: {record.duration || 'Not specified'}
          </span>
        </div>
      </div>

      {/* Patient's Reported Details */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
        <div className="bg-white p-3.5 rounded-xl border border-emerald-200 space-y-1.5 shadow-2xs">
          <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-800 block">
            Chief Complaints / मुख्य त्रास (Self-Reported by Patient)
          </span>
          <p className="text-slate-900 font-semibold text-sm leading-relaxed">
            {record.chiefComplaints || 'Self-reported symptoms'}
          </p>
        </div>

        <div className="bg-white p-3.5 rounded-xl border border-emerald-200 space-y-2 shadow-2xs">
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-rose-700 block">
              Aggravations / त्रास वाढवणारे घटक (&lt; Worse From)
            </span>
            <p className="text-slate-800 text-xs font-medium">
              {record.modalitiesAggravation || 'Not specified by patient'}
            </p>
          </div>
          <div className="pt-2 border-t border-slate-100">
            <span className="text-[10px] font-bold uppercase tracking-wider text-teal-700 block">
              Ameliorations / आराम देणारे घटक (&gt; Relief From)
            </span>
            <p className="text-slate-800 text-xs font-medium">
              {record.modalitiesAmelioration || 'Not specified by patient'}
            </p>
          </div>
        </div>
      </div>

      {record.concomitants && (
        <div className="bg-white p-3 rounded-xl border border-emerald-200 text-xs shadow-2xs">
          <strong className="text-emerald-900 text-[10px] uppercase block mb-0.5">Concomitant Symptoms / सोबतचे त्रास:</strong>
          <span className="text-slate-800 font-medium">{record.concomitants}</span>
        </div>
      )}

      {record.clinicalNotes && (
        <div className="bg-white p-3 rounded-xl border border-emerald-200 text-xs text-slate-700 shadow-2xs">
          <strong className="text-emerald-900 text-[10px] uppercase block mb-0.5">Patient / Clinical Notes:</strong>
          <span>{record.clinicalNotes}</span>
        </div>
      )}

      {record.data && Object.keys(record.data).length > 0 && (
        <div className="bg-white/80 p-3.5 rounded-xl border border-emerald-200 space-y-2">
          <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-800 block">
            Questionnaire Answers Submitted by Patient:
          </span>
          <div className="flex flex-wrap gap-2">
            {Object.entries(record.data).map(([key, val]) => {
              if (!val || (Array.isArray(val) && val.length === 0)) return null;
              if (key === 'systemLabel' || key === 'uploadedPhotosCount') return null;
              const displayVal = Array.isArray(val) ? val.join(', ') : String(val);
              return (
                <span
                  key={key}
                  className="px-3 py-1.5 bg-white border border-emerald-300 text-emerald-950 rounded-lg text-xs font-medium shadow-2xs"
                >
                  <strong className="capitalize text-emerald-800">{key.replace(/([A-Z])/g, ' $1')}:</strong> {displayVal}
                </span>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

export const CaseSummaryView: React.FC = () => {
  const {
    patients,
    selectedPatient,
    selectPatient,
    systemForms,
    setActiveTab,
    openWhatsAppShareDialog,
    activeSystemFormKey,
    setActiveSystemFormKey
  } = useClinic();

  const [showFhirJson, setShowFhirJson] = useState(false);
  const [copiedFhir, setCopiedFhir] = useState(false);

  // All remote submissions across all patients
  const allRemoteForms = systemForms.filter(
    f => f.submittedVia === 'WhatsApp_Remote_Intake' || f.clinicalNotes?.toLowerCase().includes('whatsapp')
  );
  const latestRemoteForm = allRemoteForms[0];
  const latestRemotePatient = latestRemoteForm ? patients.find(p => p.id === latestRemoteForm.patientId) : undefined;

  if (!selectedPatient) {
    return (
      <div className="p-8 text-center bg-white rounded-2xl border border-slate-200">
        <FileCheck2 className="w-12 h-12 text-slate-400 mx-auto mb-2" />
        <h3 className="font-bold text-slate-800 text-base">No Active Patient Selected</h3>
        <p className="text-xs text-slate-500 mt-1">Please select or register a patient to view their consolidated case summary.</p>
      </div>
    );
  }

  // All forms recorded for this patient
  const patientForms = systemForms.filter(f => f.patientId === selectedPatient.id);

  // ABDM FHIR Bundle Object representation
  const fhirBundle = {
    resourceType: 'Bundle',
    id: `ABDM-ENC-${selectedPatient.id}-${Date.now()}`,
    type: 'document',
    timestamp: new Date().toISOString(),
    entry: [
      {
        resource: {
          resourceType: 'Patient',
          id: selectedPatient.id,
          identifier: [
            { system: 'https://healthid.ndhm.gov.in', value: selectedPatient.abhaId },
            { system: 'https://abdm.gov.in/abha-address', value: selectedPatient.abhaAddress }
          ],
          name: [{ text: selectedPatient.name }],
          gender: selectedPatient.gender.toLowerCase(),
          birthDate: selectedPatient.dob,
          telecom: [{ system: 'phone', value: selectedPatient.mobile }]
        }
      },
      {
        resource: {
          resourceType: 'Observation',
          status: 'final',
          code: { text: 'Clinical Vitals' },
          component: [
            { code: { text: 'Systolic BP' }, valueQuantity: { value: selectedPatient.vitals.bpSystolic, unit: 'mmHg' } },
            { code: { text: 'Diastolic BP' }, valueQuantity: { value: selectedPatient.vitals.bpDiastolic, unit: 'mmHg' } },
            { code: { text: 'Pulse' }, valueQuantity: { value: selectedPatient.vitals.pulse, unit: 'bpm' } },
            { code: { text: 'Blood Sugar' }, valueQuantity: { value: selectedPatient.vitals.rbs, unit: 'mg/dL' } }
          ]
        }
      },
      ...patientForms.map(f => ({
        resource: {
          resourceType: 'ClinicalImpression',
          status: 'completed',
          description: f.chiefComplaints,
          finding: [
            { itemCodeableConcept: { text: f.system } },
            { itemCodeableConcept: { text: `Agg: ${f.modalitiesAggravation} | Amel: ${f.modalitiesAmelioration}` } }
          ],
          protocol: [f.submittedVia]
        }
      }))
    ]
  };

  const copyFhirJson = () => {
    navigator.clipboard.writeText(JSON.stringify(fhirBundle, null, 2));
    setCopiedFhir(true);
    setTimeout(() => setCopiedFhir(false), 2000);
  };

  return (
    <div className="space-y-4 pb-12">
      {/* 📱 Real-Time WhatsApp Notification Banner if another patient submitted a form */}
      {latestRemoteForm && latestRemoteForm.patientId !== selectedPatient.id && (
        <div className="bg-gradient-to-r from-emerald-700 via-teal-700 to-slate-900 text-white rounded-2xl p-4 shadow-md flex flex-col sm:flex-row sm:items-center justify-between gap-3 border border-emerald-500/50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white/20 backdrop-blur-xs flex items-center justify-center shrink-0 text-white">
              <MessageSquare className="w-5 h-5 text-emerald-300" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-sm text-white">
                  📱 New WhatsApp Case Form Received!
                </span>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-400 text-emerald-950 uppercase tracking-wider">
                  Ready to Review
                </span>
              </div>
              <p className="text-xs text-emerald-100 mt-0.5">
                <strong>{latestRemotePatient?.name || latestRemoteForm.patientId}</strong> submitted <strong>{latestRemoteForm.system.replace('_', ' ').toUpperCase()}</strong> questionnaire ({new Date(latestRemoteForm.updatedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}).
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => {
              selectPatient(latestRemoteForm.patientId);
              setActiveSystemFormKey(latestRemoteForm.system);
            }}
            className="px-4 py-2 bg-emerald-400 hover:bg-emerald-300 text-slate-950 font-bold text-xs rounded-xl shadow-xs transition-colors flex items-center gap-1.5 self-start sm:self-auto cursor-pointer"
          >
            <span>Switch to {latestRemotePatient?.name?.split(' ')[0] || 'Patient'}'s Summary ➔</span>
          </button>
        </div>
      )}

      {/* Top Bar with Patient Switcher */}
      <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1 flex-wrap">
            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-teal-50 text-teal-800 border border-teal-200 flex items-center gap-1">
              <FileCheck2 className="w-3 h-3 text-teal-600" />
              Consolidated Case Record
            </span>
            <span className="text-slate-400">•</span>
            <span className="text-xs text-slate-600">
              Active Patient: <strong>{selectedPatient.name}</strong> ({selectedPatient.id})
            </span>
          </div>
          <h2 className="text-xl font-bold text-slate-900 font-serif flex items-center gap-2">
            <FileCheck2 className="w-5 h-5 text-teal-700" />
            Consolidated Case Summary
          </h2>
          <p className="text-xs text-slate-500">
            Synthesized clinical profile from all recorded system forms, baseline vitals, and remote WhatsApp questionnaires.
          </p>
        </div>

        {/* Action Controls & Direct Patient Switcher */}
        <div className="flex items-center gap-2 flex-wrap">
          {/* Direct Patient Switcher Dropdown */}
          <div className="flex items-center gap-1.5 bg-slate-50 border border-teal-300 rounded-xl px-2.5 py-1.5 shadow-2xs">
            <User className="w-3.5 h-3.5 text-teal-700" />
            <span className="text-[11px] font-semibold text-slate-500">Patient:</span>
            <select
              value={selectedPatient.id}
              onChange={(e) => selectPatient(e.target.value)}
              className="bg-transparent text-xs font-bold text-slate-900 focus:outline-none cursor-pointer"
            >
              {patients.map(p => {
                const hasWa = systemForms.some(
                  f => f.patientId === p.id && (f.submittedVia === 'WhatsApp_Remote_Intake' || f.clinicalNotes?.toLowerCase().includes('whatsapp'))
                );
                return (
                  <option key={p.id} value={p.id}>
                    {p.name} ({p.id}) {hasWa ? '• 📱 WhatsApp Intake Active' : ''}
                  </option>
                );
              })}
            </select>
          </div>

          <button
            id="btn-summary-to-repertory"
            onClick={() => setActiveTab('repertorisation')}
            className="px-3.5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl transition-colors flex items-center gap-1.5 shadow-xs cursor-pointer"
          >
            <GitBranch className="w-4 h-4" />
            <span>Repertorise</span>
          </button>

          <button
            id="btn-summary-to-prescription"
            onClick={() => setActiveTab('prescription')}
            className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs rounded-xl transition-colors flex items-center gap-1.5 shadow-xs cursor-pointer"
          >
            <Pill className="w-4 h-4" />
            <span>Prescribe</span>
          </button>

          <button
            onClick={() => window.print()}
            className="p-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl transition-colors cursor-pointer"
            title="Print Case Summary"
          >
            <Printer className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Main Printable Summary Paper */}
      <div id="case-summary-paper" className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 sm:p-8 space-y-6 text-xs text-slate-800">
        {/* Clinic & Doctor Header */}
        <div className="border-b-2 border-teal-800/20 pb-4 flex flex-col sm:flex-row justify-between items-start gap-4">
          <div>
            <h1 className="text-xl font-bold text-slate-900 font-serif">
              Dr. Bharat's Aroga Homeopathy
            </h1>
            <p className="text-xs text-slate-700 mt-0.5 font-medium">
              {CLINIC_CONFIG.doctorName}, {CLINIC_CONFIG.qualifications} • Reg. No: {CLINIC_CONFIG.regNo}
            </p>
            <p className="text-[11px] text-slate-500">
              {CLINIC_CONFIG.address}
            </p>
          </div>

          <div className="sm:text-right text-[11px] text-slate-500">
            <div>Date: <strong>{new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</strong></div>
            <div>Belgaum OPD Clinic • Reg: <strong>{CLINIC_CONFIG.regNo}</strong></div>
          </div>
        </div>

        {/* Patient Profile Demographics & Comprehensive Vitals Box */}
        <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-3">
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 border-b border-slate-200 pb-3">
            <div>
              <div className="text-[10px] uppercase font-bold text-slate-400">Patient Name</div>
              <div className="font-bold text-slate-900 text-sm">{selectedPatient.name}</div>
              <div className="text-slate-500 text-[11px]">ID: {selectedPatient.id} • {selectedPatient.gender}</div>
            </div>

            <div>
              <div className="text-[10px] uppercase font-bold text-slate-400">Contact & Address</div>
              <div className="font-bold text-slate-800 text-xs">{selectedPatient.mobile}</div>
              <div className="text-slate-500 text-[11px] truncate max-w-[200px]">{selectedPatient.address || 'Belgaum'}</div>
            </div>

            <div>
              <div className="text-[10px] uppercase font-bold text-slate-400">ABHA & Health ID</div>
              <div className="font-mono text-slate-800 text-xs">{selectedPatient.abhaId || '12-3456-7890-1234'}</div>
              <div className="text-slate-500 text-[11px]">{selectedPatient.bloodGroup || 'O+'} Blood Group</div>
            </div>
          </div>

          {/* Vitals Summary Row (Age, BP, RBS, Height, Weight, BMI) */}
          <div>
            <div className="text-[10px] uppercase font-bold text-slate-500 mb-2 flex items-center gap-1.5">
              <Activity className="w-3 h-3 text-rose-500" />
              Recorded Clinical Vitals & Physical Measurements
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-2.5 text-xs">
              <div className="bg-white p-2.5 rounded-lg border border-slate-200">
                <span className="text-[10px] text-slate-400 block font-medium">Age / वय</span>
                <span className="font-bold text-slate-900 text-sm">{selectedPatient.age || '—'}</span>
                <span className="text-[10px] text-slate-500 ml-1">years</span>
              </div>
              <div className="bg-white p-2.5 rounded-lg border border-slate-200">
                <span className="text-[10px] text-slate-400 block font-medium">Blood Pressure</span>
                <span className="font-bold text-slate-900 text-sm">{selectedPatient.vitals.bpSystolic}/{selectedPatient.vitals.bpDiastolic}</span>
                <span className="text-[10px] text-slate-500 ml-1">mmHg</span>
              </div>
              <div className="bg-white p-2.5 rounded-lg border border-slate-200">
                <span className="text-[10px] text-slate-400 block font-medium">RBS (Sugar)</span>
                <span className="font-bold text-slate-900 text-sm">{selectedPatient.vitals.rbs || '—'}</span>
                <span className="text-[10px] text-slate-500 ml-1">mg/dL</span>
              </div>
              <div className="bg-white p-2.5 rounded-lg border border-slate-200">
                <span className="text-[10px] text-slate-400 block font-medium">Height</span>
                <span className="font-bold text-slate-900 text-sm">{selectedPatient.vitals.heightInches || '—'}</span>
                <span className="text-[10px] text-slate-500 ml-1">inches</span>
              </div>
              <div className="bg-white p-2.5 rounded-lg border border-slate-200">
                <span className="text-[10px] text-slate-400 block font-medium">Weight</span>
                <span className="font-bold text-slate-900 text-sm">{selectedPatient.vitals.weight || '—'}</span>
                <span className="text-[10px] text-slate-500 ml-1">kg</span>
              </div>
              <div className="bg-white p-2.5 rounded-lg border border-slate-200">
                <span className="text-[10px] text-slate-400 block font-medium">BMI</span>
                <span className="font-bold text-teal-700 text-sm">{selectedPatient.vitals.bmi || '—'}</span>
                <span className="text-[10px] text-slate-500 ml-1">kg/m²</span>
              </div>
            </div>
          </div>
        </div>

        {/* Totality of Symptoms: Aggregated System Forms */}
        <div className="space-y-4">
          <div className="flex items-center justify-between border-b border-slate-200 pb-2">
            <h3 className="font-bold text-sm text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
              <Sparkles className="w-4 h-4 text-teal-600" />
              Recorded System-Wise Symptoms & Modalities ({patientForms.length})
            </h3>
            <button
              onClick={() => setActiveTab('case_taking')}
              className="text-teal-700 hover:text-teal-800 text-xs font-semibold"
            >
              + Add / Edit Systems
            </button>
          </div>

          {patientForms.length === 0 ? (
            <div className="p-8 text-center bg-slate-50 rounded-2xl border-2 border-dashed border-slate-200 space-y-4">
              <div className="w-12 h-12 rounded-full bg-slate-200/80 text-slate-500 flex items-center justify-center mx-auto">
                <FileCheck2 className="w-6 h-6" />
              </div>
              <div>
                <p className="text-slate-700 font-semibold text-sm">
                  No system-wise forms recorded yet for {selectedPatient.name} ({selectedPatient.id}).
                </p>
                <p className="text-slate-400 text-xs mt-1">
                  Start an in-clinic case form below or switch to a patient with an active WhatsApp submission.
                </p>
              </div>

              {allRemoteForms.length > 0 && (
                <div className="p-4 bg-emerald-50/80 border border-emerald-200 rounded-xl text-left max-w-lg mx-auto space-y-2">
                  <div className="flex items-center gap-1.5 text-emerald-900 font-bold text-xs">
                    <MessageSquare className="w-4 h-4 text-emerald-600" />
                    <span>WhatsApp Form Submissions Available on Other Patients:</span>
                  </div>
                  <div className="space-y-1.5">
                    {allRemoteForms.slice(0, 3).map(rf => {
                      const pt = patients.find(p => p.id === rf.patientId);
                      return (
                        <div key={rf.id} className="flex items-center justify-between gap-2 bg-white p-2.5 rounded-lg border border-emerald-100 text-xs">
                          <div>
                            <strong className="text-slate-900">{pt?.name || rf.patientId}</strong>
                            <span className="text-slate-500 text-[11px] ml-1.5">({rf.system.replace('_', ' ')})</span>
                          </div>
                          <button
                            type="button"
                            onClick={() => {
                              selectPatient(rf.patientId);
                              setActiveSystemFormKey(rf.system);
                            }}
                            className="px-3 py-1 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs rounded-lg transition-colors cursor-pointer shadow-2xs"
                          >
                            View Case ➔
                          </button>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              <div className="flex items-center justify-center gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => setActiveTab('case_taking')}
                  className="px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-xl text-xs font-semibold shadow-xs transition-colors"
                >
                  Start In-Clinic Case Taking
                </button>
                <button
                  type="button"
                  onClick={() => openWhatsAppShareDialog(selectedPatient.id, activeSystemFormKey || 'headache')}
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-semibold shadow-xs transition-colors flex items-center gap-1.5"
                >
                  <Share2 className="w-3.5 h-3.5" />
                  <span>Send WhatsApp Form Link</span>
                </button>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              {patientForms.map((rec) => {
                let cardContent = null;

                if (rec.system === 'skin_hair') {
                  cardContent = <SkinHairSummaryCard record={rec} patient={selectedPatient} />;
                } else if (rec.system === 'headache') {
                  cardContent = <NeuroSummaryCard record={rec} patient={selectedPatient} />;
                } else if (rec.system === 'gastrointestinal') {
                  cardContent = <GastroSummaryCard record={rec} patient={selectedPatient} />;
                } else if (rec.system === 'urinary') {
                  cardContent = <UrinarySummaryCard record={rec} patient={selectedPatient} />;
                } else if (rec.system === 'musculoskeletal') {
                  cardContent = <MusculoskeletalSummaryCard record={rec} patient={selectedPatient} />;
                } else if (rec.system === 'respiratory') {
                  cardContent = <RespiratorySummaryCard record={rec} patient={selectedPatient} />;
                } else if (rec.system === 'female_gynae') {
                  cardContent = <FemaleGynaeSummaryCard record={rec} patient={selectedPatient} />;
                } else if (rec.system === 'pediatric') {
                  cardContent = <PediatricSummaryCard record={rec} patient={selectedPatient} />;
                } else if (rec.system === 'other_mind_generals') {
                  cardContent = <MindGeneralsSummaryCard record={rec} patient={selectedPatient} />;
                } else {
                  cardContent = (
                    <div className="p-4 rounded-xl border border-slate-200 bg-white hover:border-teal-300 transition-colors space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-slate-900 text-xs capitalize">
                            {String(rec.system).replace('_', ' ')} System
                          </span>
                          <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold ${
                            rec.severity === 'Severe'
                              ? 'bg-rose-100 text-rose-800'
                              : rec.severity === 'Moderate'
                              ? 'bg-amber-100 text-amber-800'
                              : 'bg-emerald-100 text-emerald-800'
                          }`}>
                            {rec.severity}
                          </span>
                          <span className="text-[10px] text-slate-400">
                            ({rec.duration})
                          </span>
                        </div>

                        <span className={`px-2 py-0.5 rounded-full text-[9px] font-semibold border ${
                          rec.submittedVia === 'WhatsApp_Remote_Intake'
                            ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                            : 'bg-slate-100 text-slate-700 border-slate-200'
                        }`}>
                          {rec.submittedVia === 'WhatsApp_Remote_Intake'
                            ? '📱 Remote WhatsApp Intake'
                            : '🩺 Doctor In-Clinic'}
                        </span>
                      </div>

                      <div className="text-slate-800 text-xs font-medium">
                        {rec.chiefComplaints}
                      </div>

                      {rec.data && Object.keys(rec.data).length > 0 && (
                        <div className="flex flex-wrap gap-1.5 pt-1">
                          {Object.entries(rec.data).map(([key, val]) => {
                            if (!val || (Array.isArray(val) && val.length === 0)) return null;
                            const displayVal = Array.isArray(val) ? val.join(', ') : String(val);
                            return (
                              <span
                                key={key}
                                className="px-2 py-0.5 bg-slate-100 text-slate-700 rounded-md text-[10px]"
                              >
                                <strong>{key}:</strong> {displayVal}
                              </span>
                            );
                          })}
                        </div>
                      )}

                      {/* Modalities */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1 text-[11px]">
                        {rec.modalitiesAggravation && (
                          <div className="p-2 bg-rose-50/70 border border-rose-100 rounded-lg text-rose-900">
                            <strong className="text-rose-700">Aggravation (&lt;):</strong> {rec.modalitiesAggravation}
                          </div>
                        )}
                        {rec.modalitiesAmelioration && (
                          <div className="p-2 bg-emerald-50/70 border border-emerald-100 rounded-lg text-emerald-900">
                            <strong className="text-emerald-700">Amelioration (&gt;):</strong> {rec.modalitiesAmelioration}
                          </div>
                        )}
                      </div>

                      {rec.clinicalNotes && (
                        <div className="text-[11px] text-slate-500 italic pt-1">
                          Note: {rec.clinicalNotes}
                        </div>
                      )}
                    </div>
                  );
                }

                return (
                  <div key={rec.id} className="space-y-2">
                    <WhatsAppRemoteSubmissionBadge record={rec} />
                    {cardContent}
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Synthesis & Next Step Actions */}
        <div className="p-4 bg-teal-50/50 rounded-xl border border-teal-200 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div>
            <h4 className="font-bold text-teal-950 text-xs">
              Next Step: Convert Case Symptoms into Classical Repertory Rubrics
            </h4>
            <p className="text-[11px] text-teal-800 mt-0.5">
              Launch the Kent/Boericke scoring matrix to rank indicated remedies based on this patient's totality.
            </p>
          </div>

          <button
            onClick={() => setActiveTab('repertorisation')}
            className="px-4 py-2 bg-teal-700 hover:bg-teal-800 text-white font-bold text-xs rounded-xl transition-colors flex items-center gap-1.5 shrink-0 shadow-xs"
          >
            <span>Open Repertorisation Matrix</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
