import React from 'react';
import { useClinic } from '../context/ClinicContext';
import {
  User,
  Heart,
  Activity,
  Droplet,
  Weight,
  Phone,
  ChevronDown,
  FileText,
  Share2
} from 'lucide-react';

interface PatientBannerProps {
  onOpenNewPatient?: () => void;
}

export const PatientBanner: React.FC<PatientBannerProps> = ({ onOpenNewPatient }) => {
  const {
    patients,
    selectedPatient,
    selectedPatientId,
    selectPatient,
    setActiveTab,
    openWhatsAppShareDialog,
    activeSystemFormKey
  } = useClinic();

  if (!selectedPatient) {
    return (
      <div className="bg-white border-b border-slate-200 px-4 py-3 shadow-xs">
        <div className="max-w-7xl mx-auto text-xs text-slate-500 flex items-center justify-between">
          <span>No patient selected.</span>
          {onOpenNewPatient && (
            <button
              onClick={onOpenNewPatient}
              className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-semibold rounded-lg bg-teal-700 hover:bg-teal-800 text-white transition-colors"
            >
              <User className="w-3.5 h-3.5" />
              Register Patient
            </button>
          )}
        </div>
      </div>
    );
  }

  const vitals = selectedPatient.vitals;

  return (
    <div id="patient-banner" className="bg-white border-b border-slate-200 px-4 py-3 shadow-xs">
      <div className="max-w-7xl mx-auto flex flex-col lg:flex-row lg:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="relative">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-tr from-teal-700 to-emerald-600 text-white flex items-center justify-center font-bold text-lg shadow-sm">
              {selectedPatient.name
                .replace(/(Mrs\.|Mr\.|Ms\.|Master|Dr\.)\s*/, '')
                .charAt(0) || 'P'}
            </div>
            <span className="absolute -bottom-1 -right-1 w-4 h-4 bg-emerald-500 border-2 border-white rounded-full" />
          </div>

          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <div className="relative inline-block">
                <select
                  id="patient-switcher-select"
                  aria-label="Switch active patient"
                  value={selectedPatientId || ''}
                  onChange={e => selectPatient(e.target.value)}
                  className="font-bold text-slate-900 text-base md:text-lg bg-transparent hover:bg-slate-100 rounded-md py-0.5 px-1 pr-6 cursor-pointer border-0 outline-none focus:ring-2 focus:ring-teal-600 appearance-none font-sans"
                >
                  {patients.map(p => (
                    <option key={p.id} value={p.id}>
                      {p.name} ({p.patientCode ?? p.id} • {p.age}y/{p.gender.charAt(0)})
                    </option>
                  ))}
                </select>
                <ChevronDown className="w-4 h-4 text-slate-400 absolute right-1 top-1/2 -translate-y-1/2 pointer-events-none" />
              </div>

              {selectedPatient.bloodGroup && (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold bg-rose-50 text-rose-700 border border-rose-200">
                  <Droplet className="w-3 h-3 text-rose-500" />
                  {selectedPatient.bloodGroup}
                </span>
              )}
            </div>

            <div className="flex items-center gap-3 text-xs text-slate-500 mt-0.5 flex-wrap">
              <span>
                {selectedPatient.age} yrs • {selectedPatient.gender}
              </span>
              {selectedPatient.mobile && (
                <>
                  <span>•</span>
                  <span className="inline-flex items-center gap-1">
                    <Phone className="w-3 h-3" />
                    {selectedPatient.mobile}
                  </span>
                </>
              )}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 overflow-x-auto py-1 text-xs">
          <div className="bg-slate-50 border border-slate-200/80 rounded-lg px-2.5 py-1 flex items-center gap-2">
            <Heart className="w-3.5 h-3.5 text-rose-500" />
            <div>
              <div className="text-[10px] text-slate-400 font-medium uppercase">BP</div>
              <div className="font-semibold text-slate-800">
                {vitals.bpSystolic || '-'}/{vitals.bpDiastolic || '-'}{' '}
                <span className="text-[10px] font-normal text-slate-400">mmHg</span>
              </div>
            </div>
          </div>

          <div className="bg-slate-50 border border-slate-200/80 rounded-lg px-2.5 py-1 flex items-center gap-2">
            <Activity className="w-3.5 h-3.5 text-indigo-500" />
            <div>
              <div className="text-[10px] text-slate-400 font-medium uppercase">Pulse</div>
              <div className="font-semibold text-slate-800">
                {vitals.pulse ?? '-'}{' '}
                <span className="text-[10px] font-normal text-slate-400">bpm</span>
              </div>
            </div>
          </div>

          <div className="bg-slate-50 border border-slate-200/80 rounded-lg px-2.5 py-1 flex items-center gap-2">
            <Droplet className="w-3.5 h-3.5 text-amber-500" />
            <div>
              <div className="text-[10px] text-slate-400 font-medium uppercase">RBS</div>
              <div className="font-semibold text-slate-800">
                {vitals.rbs || '-'}{' '}
                <span className="text-[10px] font-normal text-slate-400">mg/dL</span>
              </div>
            </div>
          </div>

          <div className="bg-slate-50 border border-slate-200/80 rounded-lg px-2.5 py-1 flex items-center gap-2">
            <Weight className="w-3.5 h-3.5 text-emerald-600" />
            <div>
              <div className="text-[10px] text-slate-400 font-medium uppercase">Weight / BMI</div>
              <div className="font-semibold text-slate-800">
                {vitals.weight || '-'}kg{' '}
                {vitals.bmi && (
                  <span className="text-[10px] font-normal text-slate-500">({vitals.bmi})</span>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            id="btn-whatsapp-remote-intake-link"
            onClick={() => openWhatsAppShareDialog(selectedPatient.id, activeSystemFormKey)}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white transition-colors"
          >
            <Share2 className="w-3.5 h-3.5" />
            <span>WhatsApp Link</span>
          </button>

          <button
            id="btn-view-case-summary"
            onClick={() => setActiveTab('case_summary')}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors"
          >
            <FileText className="w-3.5 h-3.5 text-teal-700" />
            <span>Case Summary</span>
          </button>
        </div>
      </div>
    </div>
  );
};