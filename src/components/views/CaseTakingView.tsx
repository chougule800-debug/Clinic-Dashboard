import React, { useState, useEffect } from 'react';
import { useClinic } from '../../context/ClinicContext';
import { ClinicalSystemKey } from '../../types';
import { CLINICAL_SYSTEMS_METADATA } from '../../data/mockData';
import { SkinHairCaseForm } from '../forms/SkinHairCaseForm';
import {
  ClipboardList,
  Save,
  Share2,
  Smartphone,
  CheckCircle2,
  FileCheck2,
  Brain,
  Sparkles,
  Utensils,
  Droplet,
  Activity,
  Wind,
  HeartHandshake,
  Baby,
  ArrowRight,
  ShieldCheck,
  AlertCircle
} from 'lucide-react';

export const CaseTakingView: React.FC = () => {
  const {
    selectedPatient,
    systemForms,
    saveSystemForm,
    activeSystemFormKey,
    setActiveSystemFormKey,
    openWhatsAppShareDialog,
    openRemoteIntakeModal,
    setActiveTab
  } = useClinic();

  const currentSystemConfig =
    CLINICAL_SYSTEMS_METADATA.find(s => s.key === activeSystemFormKey) ||
    CLINICAL_SYSTEMS_METADATA[0];

  // Find existing record for this patient & this system
  const existingRecord = selectedPatient
    ? systemForms.find(
        f => f.patientId === selectedPatient.id && f.system === activeSystemFormKey
      )
    : undefined;

  const [chiefComplaints, setChiefComplaints] = useState('');
  const [duration, setDuration] = useState('Since 3 months');
  const [severity, setSeverity] = useState<'Mild' | 'Moderate' | 'Severe'>('Moderate');
  const [modalitiesAggravation, setModalitiesAggravation] = useState('');
  const [modalitiesAmelioration, setModalitiesAmelioration] = useState('');
  const [concomitants, setConcomitants] = useState('');
  const [clinicalNotes, setClinicalNotes] = useState('');
  const [formData, setFormData] = useState<Record<string, any>>({});
  const [saveToast, setSaveToast] = useState(false);

  // Sync state when active system or patient changes
  useEffect(() => {
    if (existingRecord) {
      setChiefComplaints(existingRecord.chiefComplaints || '');
      setDuration(existingRecord.duration || '');
      setSeverity(existingRecord.severity || 'Moderate');
      setModalitiesAggravation(existingRecord.modalitiesAggravation || '');
      setModalitiesAmelioration(existingRecord.modalitiesAmelioration || '');
      setConcomitants(existingRecord.concomitants || '');
      setClinicalNotes(existingRecord.clinicalNotes || '');
      setFormData(existingRecord.data || {});
    } else {
      setChiefComplaints('');
      setDuration('');
      setSeverity('Moderate');
      setModalitiesAggravation('');
      setModalitiesAmelioration('');
      setConcomitants('');
      setClinicalNotes('');
      setFormData({});
    }
  }, [existingRecord, activeSystemFormKey, selectedPatient?.id]);

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

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPatient) return;

    saveSystemForm({
      patientId: selectedPatient.id,
      system: activeSystemFormKey,
      data: formData,
      chiefComplaints: chiefComplaints || `${currentSystemConfig.label} complaints recorded`,
      duration,
      severity,
      modalitiesAggravation,
      modalitiesAmelioration,
      concomitants,
      clinicalNotes,
      submittedVia: 'Doctor_Dashboard'
    });

    setSaveToast(true);
    setTimeout(() => setSaveToast(false), 2500);
  };

  if (!selectedPatient) {
    return (
      <div className="p-8 text-center bg-white rounded-2xl border border-slate-200">
        <AlertCircle className="w-12 h-12 text-amber-500 mx-auto mb-2" />
        <h3 className="font-bold text-slate-800 text-base">No Active Patient Selected</h3>
        <p className="text-xs text-slate-500 mt-1">Please select or register a patient first.</p>
      </div>
    );
  }

  const systemIconMap: Record<ClinicalSystemKey, any> = {
    headache: Brain,
    skin_hair: Sparkles,
    gastrointestinal: Utensils,
    urinary: Droplet,
    musculoskeletal: Activity,
    respiratory: Wind,
    female_gynae: HeartHandshake,
    pediatric: Baby,
    other_mind_generals: Sparkles
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Top Header */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-teal-50 text-teal-800 border border-teal-200">
              One Patient Profile Architecture
            </span>
            <span className="text-slate-400">•</span>
            <span className="text-xs text-slate-600 font-medium">
              Active Patient: <strong>{selectedPatient.name}</strong> ({selectedPatient.id})
            </span>
          </div>
          <h2 className="text-xl font-bold text-slate-900 font-serif flex items-center gap-2">
            <ClipboardList className="w-5 h-5 text-teal-700" />
            System-Wise Case Taking Form
          </h2>
          <p className="text-xs text-slate-500">
            Comprehensive structural symptom recording across 9 clinical systems. Feeds directly into Case Summary & Repertorisation.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2 flex-wrap">
          <button
            id="btn-case-generate-whatsapp-link"
            onClick={() => openWhatsAppShareDialog(selectedPatient.id, activeSystemFormKey)}
            className="px-3 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs transition-colors flex items-center gap-1.5 shadow-xs"
          >
            <Share2 className="w-4 h-4" />
            <span>Generate WhatsApp Link</span>
          </button>

          <button
            id="btn-case-preview-remote"
            onClick={() => openRemoteIntakeModal(selectedPatient.id, activeSystemFormKey)}
            className="px-3 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-semibold text-xs transition-colors flex items-center gap-1.5 shadow-xs"
          >
            <Smartphone className="w-4 h-4 text-emerald-400" />
            <span>Patient Mobile View</span>
          </button>

          <button
            onClick={() => setActiveTab('case_summary')}
            className="px-3 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs transition-colors flex items-center gap-1.5"
          >
            <FileCheck2 className="w-4 h-4 text-teal-700" />
            <span>Case Summary</span>
          </button>
        </div>
      </div>

      {/* 9 Clinical Systems Tabs Bar */}
      <div className="bg-white rounded-2xl border border-slate-200 p-2 shadow-xs overflow-x-auto">
        <div className="flex items-center gap-1.5 min-w-max">
          {CLINICAL_SYSTEMS_METADATA.map((sys) => {
            const Icon = systemIconMap[sys.key] || Brain;
            const isSelected = activeSystemFormKey === sys.key;
            const record = systemForms.find(
              f => f.patientId === selectedPatient.id && f.system === sys.key
            );

            return (
              <button
                key={sys.key}
                id={`tab-system-${sys.key}`}
                onClick={() => setActiveSystemFormKey(sys.key)}
                className={`px-3 py-2 rounded-xl text-xs font-medium transition-all flex items-center gap-2 ${
                  isSelected
                    ? 'bg-teal-700 text-white shadow-sm font-semibold'
                    : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                }`}
              >
                <Icon className={`w-3.5 h-3.5 ${isSelected ? 'text-white' : 'text-slate-400'}`} />
                <span>{sys.label}</span>
                {record && (
                  <span
                    className={`w-2 h-2 rounded-full ${
                      record.submittedVia === 'WhatsApp_Remote_Intake'
                        ? 'bg-emerald-400 ring-2 ring-emerald-300'
                        : 'bg-teal-300'
                    }`}
                    title={
                      record.submittedVia === 'WhatsApp_Remote_Intake'
                        ? 'Submitted remotely via WhatsApp'
                        : 'Recorded in Doctor Dashboard'
                    }
                  />
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Main Form Content */}
      {activeSystemFormKey === 'skin_hair' ? (
        <SkinHairCaseForm />
      ) : (
        <form onSubmit={handleSave} className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-6 text-xs">
        {/* Active System Header & Status */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-4">
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-base font-bold text-slate-900">
                {currentSystemConfig.label}
              </h3>
              {existingRecord && (
                <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${
                  existingRecord.submittedVia === 'WhatsApp_Remote_Intake'
                    ? 'bg-emerald-50 text-emerald-800 border-emerald-300'
                    : 'bg-teal-50 text-teal-800 border-teal-300'
                }`}>
                  {existingRecord.submittedVia === 'WhatsApp_Remote_Intake'
                    ? '📱 WhatsApp Remote Intake'
                    : '🩺 Doctor Entered'}
                </span>
              )}
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              {currentSystemConfig.description}
            </p>
          </div>

          <div className="text-right text-[11px] text-slate-400">
            {existingRecord ? `Last Updated: ${new Date(existingRecord.updatedAt).toLocaleDateString()} ${new Date(existingRecord.updatedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}` : 'New entry for this patient'}
          </div>
        </div>

        {/* Chief Complaints & Duration/Severity */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="md:col-span-2">
            <label className="block font-bold text-slate-800 mb-1">
              Chief Complaints & Location *
            </label>
            <textarea
              required
              rows={2}
              value={chiefComplaints}
              onChange={(e) => setChiefComplaints(e.target.value)}
              placeholder="e.g. Throbbing right-sided headache with severe nausea on exposure to sun..."
              className="w-full border border-slate-300 rounded-xl p-2.5 text-xs text-slate-900 focus:ring-2 focus:ring-teal-500 focus:outline-none"
            />
          </div>

          <div className="space-y-3">
            <div>
              <label className="block font-medium text-slate-700 mb-1">Duration & Frequency</label>
              <input
                type="text"
                value={duration}
                onChange={(e) => setDuration(e.target.value)}
                placeholder="e.g. 6 months, 2-3 times/week"
                className="w-full border border-slate-300 rounded-lg p-2 text-xs text-slate-900 focus:ring-2 focus:ring-teal-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block font-medium text-slate-700 mb-1">Severity</label>
              <div className="grid grid-cols-3 gap-1">
                {(['Mild', 'Moderate', 'Severe'] as const).map(s => (
                  <button
                    key={s}
                    type="button"
                    onClick={() => setSeverity(s)}
                    className={`py-1.5 px-2 rounded-lg text-xs font-semibold transition-colors ${
                      severity === s
                        ? s === 'Severe'
                          ? 'bg-rose-600 text-white'
                          : s === 'Moderate'
                          ? 'bg-amber-500 text-white'
                          : 'bg-emerald-600 text-white'
                        : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                    }`}
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Dynamic System Fields (Symptoms, Sensations, Locations, Chips) */}
        <div className="space-y-4 pt-2">
          <h4 className="font-bold text-slate-800 text-xs uppercase tracking-wider text-slate-400 border-b border-slate-100 pb-1">
            System Specific Sensations & Clinical Characteristics
          </h4>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {currentSystemConfig.fields.map((field) => {
              if (field.type === 'chips' && field.options) {
                const selectedItems: string[] = formData[field.name] || [];
                return (
                  <div key={field.name} className="p-3.5 bg-slate-50/70 rounded-xl border border-slate-200 space-y-2">
                    <label className="block font-bold text-slate-800">
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
                                ? 'bg-teal-700 text-white shadow-xs font-semibold'
                                : 'bg-white hover:bg-slate-200 text-slate-700 border border-slate-200'
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
                <div key={field.name} className="p-3.5 bg-slate-50/70 rounded-xl border border-slate-200">
                  <label className="block font-bold text-slate-800 mb-1">
                    {field.label}
                  </label>
                  <input
                    type="text"
                    placeholder={field.placeholder || ''}
                    value={formData[field.name] || ''}
                    onChange={(e) =>
                      setFormData({ ...formData, [field.name]: e.target.value })
                    }
                    className="w-full border border-slate-300 rounded-lg p-2 text-xs text-slate-900 focus:ring-2 focus:ring-teal-500 focus:outline-none bg-white"
                  />
                </div>
              );
            })}
          </div>
        </div>

        {/* Modalities: Aggravation & Amelioration */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
          <div>
            <label className="block font-bold text-slate-800 mb-1">
              Aggravation Modalities (What makes worse? &lt;)
            </label>
            <input
              type="text"
              value={modalitiesAggravation}
              onChange={(e) => setModalitiesAggravation(e.target.value)}
              placeholder="e.g. Exposure to sun, mental exertion, 10 AM, cold water..."
              className="w-full border border-slate-300 rounded-lg p-2 text-xs text-slate-900 focus:ring-2 focus:ring-teal-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="block font-bold text-slate-800 mb-1">
              Amelioration Modalities (What gives relief? &gt;)
            </label>
            <input
              type="text"
              value={modalitiesAmelioration}
              onChange={(e) => setModalitiesAmelioration(e.target.value)}
              placeholder="e.g. Tight pressure, absolute dark room, cold compress, sleep..."
              className="w-full border border-slate-300 rounded-lg p-2 text-xs text-slate-900 focus:ring-2 focus:ring-teal-500 focus:outline-none"
            />
          </div>
        </div>

        {/* Concomitants & Clinical Notes */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block font-bold text-slate-800 mb-1">
              Concomitants (Associated Symptoms occurring together)
            </label>
            <input
              type="text"
              value={concomitants}
              onChange={(e) => setConcomitants(e.target.value)}
              placeholder="e.g. Acid vomiting at peak, vertigo, extreme thirst..."
              className="w-full border border-slate-300 rounded-lg p-2 text-xs text-slate-900 focus:ring-2 focus:ring-teal-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="block font-bold text-slate-800 mb-1">
              Doctor's Clinical Notes & Miasmatic Impression
            </label>
            <input
              type="text"
              value={clinicalNotes}
              onChange={(e) => setClinicalNotes(e.target.value)}
              placeholder="e.g. Classical Psoric-Sycotic picture; Nat-m / Bryonia rubric matches"
              className="w-full border border-slate-300 rounded-lg p-2 text-xs text-slate-900 focus:ring-2 focus:ring-teal-500 focus:outline-none"
            />
          </div>
        </div>

        {/* Save Bar */}
        <div className="pt-4 border-t border-slate-200 flex items-center justify-between gap-3 flex-wrap">
          <div className="flex items-center gap-2">
            {saveToast && (
              <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-700 bg-emerald-50 px-3 py-1.5 rounded-lg border border-emerald-200 animate-fade-in">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                Saved to {selectedPatient.name}'s Chart!
              </span>
            )}
          </div>

          <div className="flex items-center gap-2">
            <button
              id="btn-save-case-form"
              type="submit"
              className="px-5 py-2.5 bg-teal-600 hover:bg-teal-500 text-white font-bold text-xs rounded-xl transition-colors shadow-xs flex items-center gap-2"
            >
              <Save className="w-4 h-4" />
              <span>Save System Case Form</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('case_summary')}
              className="px-4 py-2.5 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-xl transition-colors flex items-center gap-1.5"
            >
              <span>View Case Summary</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </form>
      )}
    </div>
  );
};
