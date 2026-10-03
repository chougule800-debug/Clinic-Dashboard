import React, { useState } from 'react';
import { useClinic } from '../context/ClinicContext';
import { CLINICAL_SYSTEMS_METADATA } from '../data/mockData';
import {
  X,
  Smartphone,
  CheckCircle2,
  Send,
  ShieldCheck,
  Stethoscope,
  ChevronRight,
  AlertCircle
} from 'lucide-react';

export const RemoteIntakeModal: React.FC = () => {
  const {
    remoteIntakeModal,
    closeRemoteIntakeModal,
    patients,
    selectPatient,
    setActiveSystemFormKey,
    setActiveTab
  } = useClinic();

  const [submittedSuccess, setSubmittedSuccess] = useState(false);

  if (!remoteIntakeModal || !remoteIntakeModal.isOpen) return null;

  const { patientId, system } = remoteIntakeModal;
  const patient = patients.find(p => p.id === patientId);
  const sysConfig =
    CLINICAL_SYSTEMS_METADATA.find(s => s.key === system) || CLINICAL_SYSTEMS_METADATA[0];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-xs p-3 sm:p-4 overflow-y-auto">
      <div className="bg-slate-100 rounded-3xl shadow-2xl border-4 border-slate-700 w-full max-w-md overflow-hidden flex flex-col max-h-[95vh]">
        <div className="bg-slate-900 text-white px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Smartphone className="w-4 h-4 text-emerald-400" />
            <span className="text-xs font-semibold tracking-wide">Patient Mobile View</span>
          </div>
          <button
            onClick={() => {
              setSubmittedSuccess(false);
              closeRemoteIntakeModal();
            }}
            className="text-slate-400 hover:text-white p-1"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="bg-emerald-800 text-white p-4">
          <div className="flex items-center gap-2 mb-1">
            <Stethoscope className="w-4 h-4 text-emerald-300" />
            <span className="font-bold text-sm">Clinic Case Intake</span>
          </div>
          <p className="text-xs text-emerald-100">
            Form: <span className="font-semibold text-white">{sysConfig.label}</span>
          </p>

          {patient && (
            <div className="mt-2.5 p-2 bg-emerald-900/80 rounded-xl border border-emerald-700 text-[11px] flex items-center justify-between">
              <div>
                <span className="text-emerald-300 font-medium">Patient: </span>
                <span className="font-bold text-white">{patient.name}</span>
              </div>
              <span className="text-[10px] text-emerald-300 font-mono">
                {patient.age}y / {patient.gender}
              </span>
            </div>
          )}
        </div>

        <div className="flex-1 overflow-y-auto p-4 bg-white text-xs">
          {submittedSuccess ? (
            <div className="py-12 px-4 text-center space-y-4">
              <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto">
                <CheckCircle2 className="w-10 h-10" />
              </div>
              <h3 className="text-base font-bold text-slate-800">Preview Confirmation</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                This preview is for demonstration only. Real patient submissions come via a
                WhatsApp secure link.
              </p>
              <button
                onClick={() => {
                  if (patientId) selectPatient(patientId);
                  if (system) setActiveSystemFormKey(system);
                  closeRemoteIntakeModal();
                  setActiveTab('case_summary');
                }}
                className="w-full py-2.5 px-4 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-semibold text-xs transition-colors flex items-center justify-center gap-1.5"
              >
                <span>View Case Summary</span>
                <ChevronRight className="w-4 h-4" />
              </button>
              <button
                onClick={() => {
                  setSubmittedSuccess(false);
                  closeRemoteIntakeModal();
                }}
                className="w-full py-2 px-4 rounded-xl text-slate-600 hover:bg-slate-100 font-medium text-xs transition-colors"
              >
                Close Preview
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="p-2.5 bg-amber-50 rounded-xl border border-amber-200 text-amber-900 text-[11px] leading-relaxed flex items-start gap-2">
                <AlertCircle className="w-3.5 h-3.5 text-amber-600 shrink-0 mt-0.5" />
                <span>
                  To collect real patient data, open WhatsApp Share from a patient's chart and
                  send the generated secure link.
                </span>
              </div>

              {sysConfig.fields.map(field => (
                <div key={field.name}>
                  <label className="block font-medium text-slate-700 mb-1">
                    {field.label}
                  </label>
                  <input
                    type="text"
                    placeholder={field.placeholder || ''}
                    disabled
                    className="w-full border border-slate-200 bg-slate-50 rounded-lg p-2 text-xs text-slate-400"
                  />
                </div>
              ))}

              <div className="pt-2">
                <button
                  type="button"
                  onClick={() => setSubmittedSuccess(true)}
                  className="w-full py-3 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs transition-colors shadow-sm flex items-center justify-center gap-2"
                >
                  <Send className="w-4 h-4" />
                  <span>Preview Submit Confirmation</span>
                </button>
              </div>

              <div className="text-[10px] text-slate-400 text-center flex items-center justify-center gap-1">
                <ShieldCheck className="w-3 h-3" />
                All submissions stored securely
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};