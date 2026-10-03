import React, { useState } from 'react';
import { useClinic } from '../../context/ClinicContext';
import { Patient } from '../../types';
import {
  Users,
  UserPlus,
  Search,
  ShieldCheck,
  Phone,
  Heart,
  Activity,
  Droplet,
  Weight,
  Calendar,
  Share2,
  FileText,
  Pill,
  Clock,
  ExternalLink,
  QrCode,
  CheckCircle2,
  ChevronRight
} from 'lucide-react';

interface PatientsViewProps {
  onOpenNewPatient: () => void;
}

export const PatientsView: React.FC<PatientsViewProps> = ({ onOpenNewPatient }) => {
  const {
    patients,
    selectedPatientId,
    selectPatient,
    systemForms,
    prescriptions,
    followUps,
    setActiveTab,
    openWhatsAppShareDialog,
    activeSystemFormKey
  } = useClinic();

  const [searchQuery, setSearchQuery] = useState('');
  const [filterGender, setFilterGender] = useState<'All' | 'Male' | 'Female'>('All');

  const filteredPatients = patients.filter(p => {
    const matchesSearch =
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.mobile.includes(searchQuery) ||
      p.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.address.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesGender = filterGender === 'All' || p.gender === filterGender;

    return matchesSearch && matchesGender;
  });

  return (
    <div className="space-y-6 pb-12">
      {/* Header & Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
        <div>
          <h2 className="text-xl font-bold text-slate-900 font-serif flex items-center gap-2">
            <Users className="w-5 h-5 text-teal-700" />
            Patient Database & Vitals
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Single Master Patient Profile automatically linked to all 9 Case Taking Forms, Repertory, and Prescriptions.
          </p>
        </div>

        <button
          id="btn-patient-view-register"
          onClick={onOpenNewPatient}
          className="px-4 py-2 bg-teal-600 hover:bg-teal-500 text-white font-semibold text-xs rounded-xl transition-colors flex items-center gap-2 shadow-xs shrink-0"
        >
          <UserPlus className="w-4 h-4" />
          <span>+ Register New Patient</span>
        </button>
      </div>

      {/* Filter Toolbar */}
      <div className="flex flex-col sm:flex-row items-center gap-3">
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search patients by name, mobile, or city..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-white border border-slate-300 rounded-xl pl-9 pr-4 py-2 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-500"
          />
        </div>

        <div className="flex items-center gap-2 shrink-0 self-end sm:self-auto">
          <label className="text-xs text-slate-500 font-medium">Gender:</label>
          {(['All', 'Male', 'Female'] as const).map(g => (
            <button
              key={g}
              onClick={() => setFilterGender(g)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                filterGender === g
                  ? 'bg-slate-900 text-white font-bold'
                  : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
              }`}
            >
              {g}
            </button>
          ))}
        </div>
      </div>

      {/* Patients Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredPatients.map(patient => {
          const isSelected = patient.id === selectedPatientId;
          const patientSystemForms = systemForms.filter(f => f.patientId === patient.id);
          const patientPrescriptions = prescriptions.filter(p => p.patientId === patient.id);
          const patientFollowUps = followUps.filter(fu => fu.patientId === patient.id);

          return (
            <div
              key={patient.id}
              className={`bg-white rounded-2xl border transition-all p-5 flex flex-col justify-between shadow-xs ${
                isSelected
                  ? 'border-teal-500 ring-2 ring-teal-500/20 shadow-md'
                  : 'border-slate-200 hover:border-slate-300'
              }`}
            >
              <div>
                {/* Card Top: Avatar, Name, ABDM ABHA */}
                <div className="flex items-start justify-between gap-3 mb-3">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-tr from-teal-700 to-emerald-600 text-white flex items-center justify-center font-bold text-lg shadow-xs">
                      {patient.name.replace(/(Mrs\.|Mr\.|Ms\.|Master|Dr\.)\s*/, '').charAt(0) || 'P'}
                    </div>
                    <div>
                      <h3 className="font-bold text-slate-900 text-sm hover:text-teal-700 transition-colors">
                        {patient.name}
                      </h3>
                      <div className="text-xs text-slate-500">
                        {patient.age} yrs • {patient.gender}
                        {patient.bloodGroup && (
                          <span> • <span className="font-semibold text-rose-600">{patient.bloodGroup}</span></span>
                        )}
                      </div>
                    </div>
                  </div>

                  <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 font-bold border border-slate-200">
                    {patient.id}
                  </span>
                </div>

                {/* Contact & Address */}
                <div className="text-xs text-slate-600 space-y-1 mb-3">
                  <div className="flex items-center gap-1.5">
                    <Phone className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <span className="font-medium text-slate-800">{patient.mobile}</span>
                  </div>
                  <div className="text-[11px] text-slate-500 truncate">
                    📍 {patient.address}
                  </div>
                </div>

                {/* Patient Key Vitals: BP, RBS, Weight */}
                <div className="grid grid-cols-3 gap-2 text-center py-2.5 px-2 bg-slate-50 rounded-xl border border-slate-100 text-[11px] mb-3">
                  <div className="p-1 rounded bg-white border border-slate-200/60">
                    <div className="text-slate-400 text-[10px] font-semibold uppercase">BP</div>
                    <div className={`font-bold text-xs ${patient.vitals.bpSystolic >= 140 || patient.vitals.bpDiastolic >= 90 ? 'text-amber-600' : 'text-slate-800'}`}>
                      {patient.vitals.bpSystolic}/{patient.vitals.bpDiastolic}
                    </div>
                  </div>
                  <div className="p-1 rounded bg-white border border-slate-200/60">
                    <div className="text-slate-400 text-[10px] font-semibold uppercase">RBS</div>
                    <div className={`font-bold text-xs ${patient.vitals.rbs >= 140 ? 'text-amber-600' : 'text-slate-800'}`}>
                      {patient.vitals.rbs} mg/dL
                    </div>
                  </div>
                  <div className="p-1 rounded bg-white border border-slate-200/60">
                    <div className="text-slate-400 text-[10px] font-semibold uppercase">Weight</div>
                    <div className="font-bold text-slate-800 text-xs">
                      {patient.vitals.weight} kg
                    </div>
                  </div>
                </div>

                {/* Attached Clinical Records Counts */}
                <div className="flex items-center justify-between text-[11px] text-slate-500 border-t border-slate-100 pt-2 mb-3">
                  <span title="Attached Case Taking Forms">
                    📋 <strong>{patientSystemForms.length}</strong> Forms
                  </span>
                  <span title="Prescriptions Issued">
                    💊 <strong>{patientPrescriptions.length}</strong> Rx
                  </span>
                  <span title="Follow-up Encounters">
                    🕒 <strong>{patientFollowUps.length}</strong> Follow-ups
                  </span>
                </div>
              </div>

              {/* Card Action Buttons */}
              <div className="pt-2 border-t border-slate-100 flex items-center justify-between gap-1.5">
                <button
                  onClick={() => {
                    selectPatient(patient.id);
                    setActiveTab('case_taking');
                  }}
                  className={`flex-1 py-1.5 px-2 rounded-lg text-xs font-semibold transition-colors text-center ${
                    isSelected
                      ? 'bg-teal-600 hover:bg-teal-700 text-white'
                      : 'bg-slate-100 hover:bg-slate-200 text-slate-800'
                  }`}
                >
                  {isSelected ? 'Active Chart' : 'Select Patient'}
                </button>

                <button
                  onClick={() => openWhatsAppShareDialog(patient.id, activeSystemFormKey)}
                  title="Send WhatsApp Remote Case Taking Form Link"
                  className="p-1.5 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-700 transition-colors"
                >
                  <Share2 className="w-4 h-4" />
                </button>

                <button
                  onClick={() => {
                    selectPatient(patient.id);
                    setActiveTab('case_summary');
                  }}
                  title="View Case Summary"
                  className="p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors"
                >
                  <FileText className="w-4 h-4" />
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
