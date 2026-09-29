import React, { useState } from 'react';
import { useClinic } from '../context/ClinicContext';
import { CLINICAL_SYSTEMS_METADATA } from '../data/mockData';
import {
  X,
  Smartphone,
  CheckCircle2,
  Send,
  Sparkles,
  Heart,
  ShieldCheck,
  Stethoscope,
  ChevronRight
} from 'lucide-react';

export const RemoteIntakeModal: React.FC = () => {
  const {
    remoteIntakeModal,
    closeRemoteIntakeModal,
    patients,
    submitRemoteIntake,
    selectPatient,
    setActiveSystemFormKey,
    setActiveTab
  } = useClinic();

  const [chiefComplaints, setChiefComplaints] = useState('');
  const [duration, setDuration] = useState('');
  const [severity, setSeverity] = useState<'Mild' | 'Moderate' | 'Severe' | ''>('');
  const [modalitiesAggravation, setModalitiesAggravation] = useState('');
  const [modalitiesAmelioration, setModalitiesAmelioration] = useState('');
  const [concomitants, setConcomitants] = useState('');
  const [formData, setFormData] = useState<Record<string, any>>({});
  const [submittedSuccess, setSubmittedSuccess] = useState(false);

  if (!remoteIntakeModal || !remoteIntakeModal.isOpen) return null;

  const { patientId, system } = remoteIntakeModal;
  const patient = patients.find(p => p.id === patientId);
  const sysConfig = CLINICAL_SYSTEMS_METADATA.find(s => s.key === system) || CLINICAL_SYSTEMS_METADATA[0];

  const toggleChip = (fieldName: string, option: string) => {
    const currentList: string[] = formData[fieldName] || [];
    if (currentList.includes(option)) {
      setFormData({
        ...formData,
        [fieldName]: currentList.filter(item => item !== option)
      });
    } else {
      setFormData({
        ...formData,
        [fieldName]: [...currentList, option]
      });
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    submitRemoteIntake(patientId, system, {
      data: formData,
      chiefComplaints: chiefComplaints || `Self-reported ${sysConfig.label} symptoms`,
      duration,
      severity,
      modalitiesAggravation,
      modalitiesAmelioration,
      concomitants,
      clinicalNotes: `Submitted remotely by patient via WhatsApp intake link on ${new Date().toLocaleDateString()}. Attached to Patient Profile ${patientId}.`
    });

    setSubmittedSuccess(true);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-xs p-3 sm:p-4 overflow-y-auto">
      <div
        id="modal-remote-patient-intake"
        className="bg-slate-100 rounded-3xl shadow-2xl border-4 border-slate-700 w-full max-w-md overflow-hidden flex flex-col max-h-[95vh] relative"
      >
        {/* Smartphone Bezel Header */}
        <div className="bg-slate-900 text-white px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Smartphone className="w-4 h-4 text-emerald-400" />
            <span className="text-xs font-semibold tracking-wide">
              ClinicaPro Patient Portal (WhatsApp View)
            </span>
          </div>
          <button
            onClick={closeRemoteIntakeModal}
            className="text-slate-400 hover:text-white transition-colors p-1"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Doctor Header Banner inside mobile */}
        <div className="bg-emerald-800 text-white p-4">
          <div className="flex items-center gap-2 mb-1">
            <Stethoscope className="w-4 h-4 text-emerald-300" />
            <span className="font-bold text-sm">Dr. Anand Deshpande's Clinic</span>
          </div>
          <p className="text-xs text-emerald-100">
            Clinical Questionnaire: <span className="font-semibold text-white">{sysConfig.label}</span>
          </p>

          {/* One Patient Profile confirmation */}
          <div className="mt-2.5 p-2 bg-emerald-900/80 rounded-xl border border-emerald-700 text-[11px] flex items-center justify-between">
            <div>
              <span className="text-emerald-300 font-medium">Patient: </span>
              <span className="font-bold text-white">{patient?.name}</span>
            </div>
            <span className="text-[10px] text-emerald-300 font-mono">
              {patient?.age}y / {patient?.gender}
            </span>
          </div>
        </div>

        {/* Form Body or Success State */}
        <div className="flex-1 overflow-y-auto p-4 bg-white text-xs">
          {submittedSuccess ? (
            <div className="py-12 px-4 text-center space-y-4">
              <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto shadow-sm">
                <CheckCircle2 className="w-10 h-10" />
              </div>
              <h3 className="text-base font-bold text-slate-800">
                Form Successfully Submitted!
              </h3>
              <p className="text-xs text-slate-600 leading-relaxed max-w-xs mx-auto">
                Thank you, <strong>{patient?.name}</strong>. Your symptoms have been automatically transmitted and attached to your clinical profile.
              </p>
              <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-200 text-left text-[11px] text-emerald-900 space-y-1">
                <div className="font-bold flex items-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                  Synced with Doctor Dashboard:
                </div>
                <div>• Attached to Patient ID: <strong>{patientId}</strong></div>
                <div>• Added to Case Summary for Repertorisation</div>
                <div>• Auto-notified doctor in WhatsApp Inbox</div>
              </div>

              <div className="pt-4 flex flex-col gap-2">
                <button
                  onClick={() => {
                    if (patientId) {
                      selectPatient(patientId);
                    }
                    if (system) {
                      setActiveSystemFormKey(system);
                    }
                    closeRemoteIntakeModal();
                    setActiveTab('case_summary');
                  }}
                  className="w-full py-2.5 px-4 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-semibold text-xs transition-colors flex items-center justify-center gap-1.5"
                >
                  <span>View in Doctor Case Summary</span>
                  <ChevronRight className="w-4 h-4" />
                </button>
                <button
                  onClick={closeRemoteIntakeModal}
                  className="w-full py-2 px-4 rounded-xl text-slate-600 hover:bg-slate-100 font-medium text-xs transition-colors"
                >
                  Close Simulator
                </button>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="p-2.5 bg-amber-50 rounded-xl border border-amber-200 text-amber-900 text-[11px] leading-relaxed">
                ℹ️ Please select and describe all symptoms you are experiencing. This helps your doctor select the most precise constitutional homeopathic and medical treatment.
              </div>

              {/* Chief Complaints */}
              <div>
                <label className="block font-bold text-slate-800 mb-1">
                  What is your main problem / complaint? *
                </label>
                <textarea
                  required
                  rows={2}
                  value={chiefComplaints}
                  onChange={(e) => setChiefComplaints(e.target.value)}
                  placeholder={`Describe your ${sysConfig.label.toLowerCase()} issues in your own words...`}
                  className="w-full border border-slate-300 rounded-xl p-2.5 text-xs text-slate-800 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                />
              </div>

              {/* Duration & Severity */}
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-medium text-slate-700 mb-1">Duration</label>
                  <input
                    type="text"
                    value={duration}
                    onChange={(e) => setDuration(e.target.value)}
                    placeholder="e.g. 2 weeks, 6 months"
                    className="w-full border border-slate-300 rounded-lg p-2 text-xs text-slate-800 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block font-medium text-slate-700 mb-1">Severity</label>
                  <select
                    value={severity}
                    onChange={(e) => setSeverity(e.target.value as any)}
                    className="w-full border border-slate-300 rounded-lg p-2 text-xs text-slate-800 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  >
                    <option value="">Select Severity</option>
                    <option value="Mild">Mild</option>
                    <option value="Moderate">Moderate</option>
                    <option value="Severe">Severe</option>
                  </select>
                </div>
              </div>

              {/* System specific chips */}
              {sysConfig.fields.map((field) => {
                if (field.type === 'chips' && field.options) {
                  const selectedItems: string[] = formData[field.name] || [];
                  return (
                    <div key={field.name} className="space-y-1.5">
                      <label className="block font-semibold text-slate-700">
                        {field.label}
                      </label>
                      <div className="flex flex-wrap gap-1.5">
                        {field.options.map((opt) => {
                          const isSelected = selectedItems.includes(opt);
                          return (
                            <button
                              type="button"
                              key={opt}
                              onClick={() => toggleChip(field.name, opt)}
                              className={`px-2.5 py-1 rounded-lg text-[11px] font-medium transition-all text-left ${
                                isSelected
                                  ? 'bg-emerald-600 text-white shadow-xs font-semibold'
                                  : 'bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200'
                              }`}
                            >
                              {opt}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  );
                }

                return (
                  <div key={field.name}>
                    <label className="block font-medium text-slate-700 mb-1">
                      {field.label}
                    </label>
                    <input
                      type="text"
                      placeholder={field.placeholder || ''}
                      value={formData[field.name] || ''}
                      onChange={(e) =>
                        setFormData({ ...formData, [field.name]: e.target.value })
                      }
                      className="w-full border border-slate-300 rounded-lg p-2 text-xs text-slate-800 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                    />
                  </div>
                );
              })}

              {/* Modalities: Aggravation & Amelioration */}
              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  What makes your symptoms worse? (Aggravation)
                </label>
                <input
                  type="text"
                  placeholder="e.g. cold air, sun, after meals, night, movement..."
                  value={modalitiesAggravation}
                  onChange={(e) => setModalitiesAggravation(e.target.value)}
                  className="w-full border border-slate-300 rounded-lg p-2 text-xs text-slate-800 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  What gives you relief? (Amelioration)
                </label>
                <input
                  type="text"
                  placeholder="e.g. rest, warm drink, pressure, fresh air, lying down..."
                  value={modalitiesAmelioration}
                  onChange={(e) => setModalitiesAmelioration(e.target.value)}
                  className="w-full border border-slate-300 rounded-lg p-2 text-xs text-slate-800 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                />
              </div>

              {/* Submit Button */}
              <div className="pt-2">
                <button
                  type="submit"
                  className="w-full py-3 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs transition-colors shadow-sm flex items-center justify-center gap-2"
                >
                  <Send className="w-4 h-4" />
                  <span>Submit My Case Details to Doctor</span>
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
