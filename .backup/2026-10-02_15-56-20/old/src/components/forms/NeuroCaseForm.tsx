import React, { useState, useEffect } from 'react';
import { useClinic } from '../../context/ClinicContext';
import {
  Brain,
  Save,
  CheckCircle2,
  RotateCcw,
  Printer,
  FileText,
  AlertTriangle,
  Loader2
} from 'lucide-react';

export interface NeuroFormData {
  patientName: string;
  age: string;
  gender: string;
  date: string;
  mobile: string;
  occupation: string;
  address: string;
  mainComplaint: string[];
  otherComplaint: string;
  headacheLocation: string[];
  headacheType: string[];
  headacheSeverity: string;
  headacheScore: string;
  headacheDuration: string;
  headacheFrequency: string;
  headacheTime: string;
  headacheOnset: string;
  headacheTrigger: string[];
  headacheAssociated: string[];
  headacheRelief: string;
  headacheDetails: string;
  dizziness: string[];
  dizzinessDuration: string;
  dizzinessFrequency: string;
  fainting: string[];
  faintingDuration: string;
  faintingDetails: string;
  seizure: string[];
  seizureCount: string;
  lastSeizure: string;
  seizureDetails: string;
  sensory: string[];
  sensorySide: string;
  sensorySite: string;
  weakness: string[];
  weaknessDetails: string;
  movement: string[];
  movementSite: string;
  movementDuration: string;
  speech: string[];
  memory: string[];
  vision: string[];
  balance: string[];
  sleep: string[];
  previousHistory: string[];
  previousDetails: string;
  investigation: string[];
  investigationDate: string;
  investigationResult: string;
  investigationDetails: string;
  redFlag: string[];
  diagnosis: string;
  affectedArea: string;
  clinicalSeverity: string;
  clinicalStatus: string;
  clinicalNotes: string;
  treatment: string;
  advice: string;
  followup: string;
  savedAt?: string;
}

const INITIAL: NeuroFormData = {
  patientName: '',
  age: '',
  gender: '',
  date: new Date().toISOString().split('T')[0],
  mobile: '',
  occupation: '',
  address: '',
  mainComplaint: [],
  otherComplaint: '',
  headacheLocation: [],
  headacheType: [],
  headacheSeverity: '',
  headacheScore: '',
  headacheDuration: '',
  headacheFrequency: '',
  headacheTime: '',
  headacheOnset: '',
  headacheTrigger: [],
  headacheAssociated: [],
  headacheRelief: '',
  headacheDetails: '',
  dizziness: [],
  dizzinessDuration: '',
  dizzinessFrequency: '',
  fainting: [],
  faintingDuration: '',
  faintingDetails: '',
  seizure: [],
  seizureCount: '',
  lastSeizure: '',
  seizureDetails: '',
  sensory: [],
  sensorySide: '',
  sensorySite: '',
  weakness: [],
  weaknessDetails: '',
  movement: [],
  movementSite: '',
  movementDuration: '',
  speech: [],
  memory: [],
  vision: [],
  balance: [],
  sleep: [],
  previousHistory: [],
  previousDetails: '',
  investigation: [],
  investigationDate: '',
  investigationResult: '',
  investigationDetails: '',
  redFlag: [],
  diagnosis: '',
  affectedArea: '',
  clinicalSeverity: '',
  clinicalStatus: '',
  clinicalNotes: '',
  treatment: '',
  advice: '',
  followup: ''
};

export const NeuroCaseForm: React.FC = () => {
  const { selectedPatient, patients, selectPatient, saveSystemForm, systemForms, setActiveTab } =
    useClinic();

  const [formData, setFormData] = useState<NeuroFormData>(INITIAL);
  const [statusMessage, setStatusMessage] = useState('');
  const [statusType, setStatusType] = useState<'success' | 'error' | 'info'>('info');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!selectedPatient) return;
    const existing = systemForms.find(
      f => f.patientId === selectedPatient.id && f.system === 'headache'
    );
    if (existing && existing.data && Object.keys(existing.data).length > 0) {
      setFormData({
        ...INITIAL,
        ...(existing.data as Partial<NeuroFormData>),
        patientName: selectedPatient.name,
        age: String(selectedPatient.age || ''),
        gender: selectedPatient.gender,
        mobile: selectedPatient.mobile || '',
        address: selectedPatient.address || '',
        date: (existing.data as any).date || new Date().toISOString().split('T')[0]
      });
    } else {
      setFormData({
        ...INITIAL,
        patientName: selectedPatient.name,
        age: String(selectedPatient.age || ''),
        gender: selectedPatient.gender,
        mobile: selectedPatient.mobile || '',
        address: selectedPatient.address || '',
        date: new Date().toISOString().split('T')[0]
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedPatient?.id, systemForms]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { id, value } = e.target;
    setFormData(prev => ({ ...prev, [id]: value }));
  };

  const toggleChip = (category: keyof NeuroFormData, value: string) => {
    setFormData(prev => {
      const current = (prev[category] as string[]) || [];
      return {
        ...prev,
        [category]: current.includes(value)
          ? current.filter(v => v !== value)
          : [...current, value]
      };
    });
  };

  const handleSave = async () => {
    if (!selectedPatient) {
      setStatusMessage('No patient selected.');
      setStatusType('error');
      return;
    }
    if (!formData.patientName.trim()) {
      setStatusMessage('Please enter patient name.');
      setStatusType('error');
      return;
    }
    setSaving(true);
    try {
      const chiefComplaints = [
        formData.headacheType.length ? formData.headacheType.join(', ') : '',
        formData.headacheLocation.length ? `at ${formData.headacheLocation.join(', ')}` : '',
        formData.headacheDuration ? `duration ${formData.headacheDuration}` : ''
      ]
        .filter(Boolean)
        .join(' • ');

      await saveSystemForm({
        patientId: selectedPatient.id,
        system: 'headache',
        chiefComplaints: chiefComplaints || 'Headache / Neurological case',
        duration: formData.headacheDuration || 'Not specified',
        severity:
          formData.headacheSeverity === 'Severe' ||
          formData.headacheSeverity === 'Very Severe'
            ? 'Severe'
            : formData.headacheSeverity === 'Mild'
            ? 'Mild'
            : 'Moderate',
        modalitiesAggravation: formData.headacheTrigger.join(', '),
        modalitiesAmelioration: formData.headacheRelief,
        concomitants: formData.headacheAssociated.join(', '),
        clinicalNotes: formData.clinicalNotes || formData.diagnosis,
        data: { ...formData },
        submittedVia: 'Doctor_Dashboard'
      });

      setStatusMessage('Case saved to cloud.');
      setStatusType('success');
      setTimeout(() => setStatusMessage(''), 3500);
    } catch (err) {
      setStatusMessage(err instanceof Error ? err.message : 'Save failed.');
      setStatusType('error');
    } finally {
      setSaving(false);
    }
  };

  const handleSubmit = async () => {
    await handleSave();
    setTimeout(() => window.print(), 400);
  };

  const handleClear = () => {
    if (!confirm('Clear all fields?') || !selectedPatient) return;
    setFormData({
      ...INITIAL,
      patientName: selectedPatient.name,
      age: String(selectedPatient.age || ''),
      gender: selectedPatient.gender,
      mobile: selectedPatient.mobile || '',
      address: selectedPatient.address || '',
      date: new Date().toISOString().split('T')[0]
    });
    setStatusMessage('Form cleared');
    setStatusType('info');
    setTimeout(() => setStatusMessage(''), 3000);
  };

  return (
    <div className="space-y-6 pb-28 max-w-6xl mx-auto">
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-teal-50 border border-teal-200 flex items-center justify-center text-teal-700">
            <Brain className="w-5 h-5" />
          </div>
          <div>
            <span className="text-xs uppercase font-bold text-teal-800 tracking-wider">
              Neurological Form
            </span>
            <h2 className="text-lg font-bold text-slate-900 font-serif">
              Headache / Neuro Case Taking
            </h2>
            <p className="text-xs text-slate-500">
              Active: <strong>{selectedPatient?.name}</strong>
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <select
            value={selectedPatient?.id || ''}
            onChange={e => selectPatient(e.target.value)}
            className="px-3 py-1.5 bg-slate-50 border border-slate-300 rounded-xl text-xs"
          >
            {patients.map(p => (
              <option key={p.id} value={p.id}>
                {p.name} ({p.patientCode ?? p.id})
              </option>
            ))}
          </select>
          <button
            type="button"
            onClick={() => setActiveTab('case_summary')}
            className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs rounded-xl flex items-center gap-1.5"
          >
            <FileText className="w-3.5 h-3.5 text-teal-700" />
            Summary
          </button>
        </div>
      </div>

      {statusMessage && (
        <div
          className={`p-3 rounded-xl border text-xs font-medium flex items-center gap-2 ${
            statusType === 'success'
              ? 'bg-emerald-50 border-emerald-300 text-emerald-900'
              : statusType === 'error'
              ? 'bg-rose-50 border-rose-300 text-rose-900'
              : 'bg-teal-50 border-teal-300 text-teal-900'
          }`}
        >
          {statusType === 'success' ? (
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          ) : (
            <AlertTriangle className="w-4 h-4 text-rose-600" />
          )}
          <span>{statusMessage}</span>
        </div>
      )}

      {/* 1. Patient Information */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4">
        <h3 className="text-base font-bold text-teal-800 border-b border-teal-100 pb-3 -mx-6 -mt-6 px-6 pt-4 bg-teal-50/40 rounded-t-2xl">
          1. Patient Information
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5 text-xs">
          <div className="space-y-1">
            <label className="font-bold text-slate-700">Patient Name</label>
            <input
              id="patientName"
              value={formData.patientName}
              onChange={handleChange}
              className="w-full border border-slate-300 rounded-lg p-2"
            />
          </div>
          <div className="space-y-1">
            <label className="font-bold text-slate-700">Age</label>
            <input
              id="age"
              value={formData.age}
              onChange={handleChange}
              className="w-full border border-slate-300 rounded-lg p-2"
            />
          </div>
          <div className="space-y-1">
            <label className="font-bold text-slate-700">Gender</label>
            <select
              id="gender"
              value={formData.gender}
              onChange={handleChange}
              className="w-full border border-slate-300 rounded-lg p-2"
            >
              <option value="">Select</option>
              <option value="Male">Male</option>
              <option value="Female">Female</option>
              <option value="Other">Other</option>
            </select>
          </div>
          <div className="space-y-1">
            <label className="font-bold text-slate-700">Mobile</label>
            <input
              id="mobile"
              value={formData.mobile}
              onChange={handleChange}
              className="w-full border border-slate-300 rounded-lg p-2"
            />
          </div>
          <div className="space-y-1">
            <label className="font-bold text-slate-700">Date</label>
            <input
              id="date"
              type="date"
              value={formData.date}
              onChange={handleChange}
              className="w-full border border-slate-300 rounded-lg p-2"
            />
          </div>
          <div className="space-y-1">
            <label className="font-bold text-slate-700">Occupation</label>
            <input
              id="occupation"
              value={formData.occupation}
              onChange={handleChange}
              className="w-full border border-slate-300 rounded-lg p-2"
            />
          </div>
        </div>
      </div>

      {/* 2. Main Complaint */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4">
        <h3 className="text-base font-bold text-teal-800 border-b border-teal-100 pb-3 -mx-6 -mt-6 px-6 pt-4 bg-teal-50/40 rounded-t-2xl">
          2. Main Neurological Complaint
        </h3>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          {[
            'Headache',
            'Dizziness',
            'Vertigo',
            'Fainting',
            'Seizure',
            'Numbness',
            'Tingling',
            'Weakness',
            'Tremor',
            'Memory',
            'Speech',
            'Balance'
          ].map(item => {
            const checked = formData.mainComplaint.includes(item);
            return (
              <button
                type="button"
                key={item}
                onClick={() => toggleChip('mainComplaint', item)}
                className={`p-2 rounded-lg text-xs font-medium border text-left ${
                  checked
                    ? 'bg-teal-700 text-white border-teal-800'
                    : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-teal-50'
                }`}
              >
                {item}
              </button>
            );
          })}
        </div>
        <textarea
          id="otherComplaint"
          rows={2}
          value={formData.otherComplaint}
          onChange={handleChange}
          placeholder="Other complaints"
          className="w-full border border-slate-300 rounded-lg p-2 text-xs"
        />
      </div>

      {/* 3. Headache Assessment */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4">
        <h3 className="text-base font-bold text-teal-800 border-b border-teal-100 pb-3 -mx-6 -mt-6 px-6 pt-4 bg-teal-50/40 rounded-t-2xl">
          3. Headache Assessment
        </h3>

        <div className="p-3.5 bg-teal-50/40 rounded-xl border border-teal-100 space-y-2">
          <div className="font-bold text-xs text-teal-900">Location</div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {[
              'Forehead',
              'Temples',
              'One Side',
              'Both Sides',
              'Back of Head',
              'Top of Head',
              'Around Eye',
              'Whole Head'
            ].map(item => {
              const checked = formData.headacheLocation.includes(item);
              return (
                <button
                  type="button"
                  key={item}
                  onClick={() => toggleChip('headacheLocation', item)}
                  className={`p-2 rounded-lg text-xs border text-left ${
                    checked
                      ? 'bg-teal-700 text-white'
                      : 'bg-white text-slate-700 border-teal-200'
                  }`}
                >
                  {item}
                </button>
              );
            })}
          </div>
        </div>

        <div className="p-3.5 bg-teal-50/40 rounded-xl border border-teal-100 space-y-2">
          <div className="font-bold text-xs text-teal-900">Character</div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {[
              'Throbbing',
              'Pressing',
              'Tight Band',
              'Sharp',
              'Stabbing',
              'Burning',
              'Heaviness',
              'Pulsating'
            ].map(item => {
              const checked = formData.headacheType.includes(item);
              return (
                <button
                  type="button"
                  key={item}
                  onClick={() => toggleChip('headacheType', item)}
                  className={`p-2 rounded-lg text-xs border text-left ${
                    checked
                      ? 'bg-cyan-800 text-white'
                      : 'bg-white text-slate-700 border-teal-200'
                  }`}
                >
                  {item}
                </button>
              );
            })}
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
          <div>
            <label className="block font-bold text-slate-700 mb-1">Severity</label>
            <select
              id="headacheSeverity"
              value={formData.headacheSeverity}
              onChange={handleChange}
              className="w-full border border-slate-300 rounded-lg p-2"
            >
              <option value="">Select</option>
              <option value="Mild">Mild</option>
              <option value="Moderate">Moderate</option>
              <option value="Severe">Severe</option>
              <option value="Very Severe">Very Severe</option>
            </select>
          </div>
          <div>
            <label className="block font-bold text-slate-700 mb-1">Pain Score 0-10</label>
            <input
              id="headacheScore"
              type="number"
              min="0"
              max="10"
              value={formData.headacheScore}
              onChange={handleChange}
              className="w-full border border-slate-300 rounded-lg p-2"
            />
          </div>
          <div>
            <label className="block font-bold text-slate-700 mb-1">Duration</label>
            <input
              id="headacheDuration"
              value={formData.headacheDuration}
              onChange={handleChange}
              className="w-full border border-slate-300 rounded-lg p-2"
            />
          </div>
          <div>
            <label className="block font-bold text-slate-700 mb-1">Frequency</label>
            <input
              id="headacheFrequency"
              value={formData.headacheFrequency}
              onChange={handleChange}
              className="w-full border border-slate-300 rounded-lg p-2"
            />
          </div>
          <div>
            <label className="block font-bold text-slate-700 mb-1">Time of Occurrence</label>
            <select
              id="headacheTime"
              value={formData.headacheTime}
              onChange={handleChange}
              className="w-full border border-slate-300 rounded-lg p-2"
            >
              <option value="">Select</option>
              <option value="Morning">Morning</option>
              <option value="Afternoon">Afternoon</option>
              <option value="Evening">Evening</option>
              <option value="Night">Night</option>
              <option value="Any Time">Any Time</option>
            </select>
          </div>
          <div>
            <label className="block font-bold text-slate-700 mb-1">Onset</label>
            <select
              id="headacheOnset"
              value={formData.headacheOnset}
              onChange={handleChange}
              className="w-full border border-slate-300 rounded-lg p-2"
            >
              <option value="">Select</option>
              <option value="Sudden">Sudden</option>
              <option value="Gradual">Gradual</option>
              <option value="Intermittent">Intermittent</option>
              <option value="Continuous">Continuous</option>
            </select>
          </div>
        </div>

        <div className="p-3.5 bg-amber-50/40 rounded-xl border border-amber-100 space-y-2">
          <div className="font-bold text-xs text-amber-900">Triggers</div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {['Stress', 'Lack of Sleep', 'Screen', 'Bright Light', 'Noise', 'Fasting', 'Heat', 'Cold', 'Exercise', 'Cough', 'Bending', 'Other'].map(
              item => {
                const checked = formData.headacheTrigger.includes(item);
                return (
                  <button
                    type="button"
                    key={item}
                    onClick={() => toggleChip('headacheTrigger', item)}
                    className={`p-2 rounded-lg text-xs border text-left ${
                      checked
                        ? 'bg-amber-700 text-white'
                        : 'bg-white text-slate-700 border-amber-200'
                    }`}
                  >
                    {item}
                  </button>
                );
              }
            )}
          </div>
        </div>

        <div className="p-3.5 bg-indigo-50/40 rounded-xl border border-indigo-100 space-y-2">
          <div className="font-bold text-xs text-indigo-900">Associated Symptoms</div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {[
              'Nausea',
              'Vomiting',
              'Photophobia',
              'Phonophobia',
              'Aura',
              'Blurred Vision',
              'Eye Pain',
              'Dizziness',
              'Neck Pain',
              'Weakness',
              'Numbness',
              'Fever'
            ].map(item => {
              const checked = formData.headacheAssociated.includes(item);
              return (
                <button
                  type="button"
                  key={item}
                  onClick={() => toggleChip('headacheAssociated', item)}
                  className={`p-2 rounded-lg text-xs border text-left ${
                    checked
                      ? 'bg-indigo-700 text-white'
                      : 'bg-white text-slate-700 border-indigo-200'
                  }`}
                >
                  {item}
                </button>
              );
            })}
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
          <div>
            <label className="block font-bold text-slate-700 mb-1">Relieving Factors</label>
            <textarea
              id="headacheRelief"
              rows={2}
              value={formData.headacheRelief}
              onChange={handleChange}
              className="w-full border border-slate-300 rounded-lg p-2"
            />
          </div>
          <div>
            <label className="block font-bold text-slate-700 mb-1">Additional Details</label>
            <textarea
              id="headacheDetails"
              rows={2}
              value={formData.headacheDetails}
              onChange={handleChange}
              className="w-full border border-slate-300 rounded-lg p-2"
            />
          </div>
        </div>
      </div>

      {/* 4. Assessment */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4 text-xs">
        <h3 className="text-base font-bold text-teal-800 border-b border-teal-100 pb-3 -mx-6 -mt-6 px-6 pt-4 bg-teal-50/40 rounded-t-2xl">
          4. Clinical Assessment
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label className="block font-bold text-slate-700 mb-1">Provisional Diagnosis</label>
            <input
              id="diagnosis"
              value={formData.diagnosis}
              onChange={handleChange}
              className="w-full border border-slate-300 rounded-lg p-2"
            />
          </div>
          <div>
            <label className="block font-bold text-slate-700 mb-1">Affected Area</label>
            <input
              id="affectedArea"
              value={formData.affectedArea}
              onChange={handleChange}
              className="w-full border border-slate-300 rounded-lg p-2"
            />
          </div>
          <div>
            <label className="block font-bold text-slate-700 mb-1">Severity</label>
            <select
              id="clinicalSeverity"
              value={formData.clinicalSeverity}
              onChange={handleChange}
              className="w-full border border-slate-300 rounded-lg p-2"
            >
              <option value="">Select</option>
              <option value="Mild">Mild</option>
              <option value="Moderate">Moderate</option>
              <option value="Severe">Severe</option>
            </select>
          </div>
          <div>
            <label className="block font-bold text-slate-700 mb-1">Clinical Status</label>
            <select
              id="clinicalStatus"
              value={formData.clinicalStatus}
              onChange={handleChange}
              className="w-full border border-slate-300 rounded-lg p-2"
            >
              <option value="">Select</option>
              <option value="New Case">New Case</option>
              <option value="Improving">Improving</option>
              <option value="Stable">Stable</option>
              <option value="Worsening">Worsening</option>
            </select>
          </div>
          <div className="sm:col-span-3">
            <label className="block font-bold text-slate-700 mb-1">Clinical Notes</label>
            <textarea
              id="clinicalNotes"
              rows={2}
              value={formData.clinicalNotes}
              onChange={handleChange}
              className="w-full border border-slate-300 rounded-lg p-2"
            />
          </div>
          <div className="sm:col-span-2">
            <label className="block font-bold text-slate-700 mb-1">
              Homeopathic Treatment
            </label>
            <input
              id="treatment"
              value={formData.treatment}
              onChange={handleChange}
              className="w-full border border-slate-300 rounded-lg p-2"
            />
          </div>
          <div>
            <label className="block font-bold text-slate-700 mb-1">Advice</label>
            <input
              id="advice"
              value={formData.advice}
              onChange={handleChange}
              className="w-full border border-slate-300 rounded-lg p-2"
            />
          </div>
          <div>
            <label className="block font-bold text-slate-700 mb-1">Follow-up Date</label>
            <input
              id="followup"
              type="date"
              value={formData.followup}
              onChange={handleChange}
              className="w-full border border-slate-300 rounded-lg p-2"
            />
          </div>
        </div>
      </div>

      {/* Sticky action bar */}
      <div className="sticky bottom-0 bg-white/95 backdrop-blur-xs p-4 rounded-2xl border border-slate-200 shadow-lg flex items-center justify-center gap-3 z-30">
        <button
          type="button"
          onClick={handleSave}
          disabled={saving}
          className="px-5 py-2.5 bg-teal-700 hover:bg-teal-800 disabled:opacity-60 text-white font-bold text-xs rounded-xl shadow-xs flex items-center gap-2"
        >
          {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
          <span>{saving ? 'Saving...' : 'Save Case'}</span>
        </button>
        <button
          type="button"
          onClick={handleSubmit}
          disabled={saving}
          className="px-5 py-2.5 bg-sky-700 hover:bg-sky-800 disabled:opacity-60 text-white font-bold text-xs rounded-xl shadow-xs flex items-center gap-2"
        >
          <Printer className="w-4 h-4" />
          <span>Submit &amp; Print</span>
        </button>
        <button
          type="button"
          onClick={handleClear}
          className="px-5 py-2.5 bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs rounded-xl shadow-xs flex items-center gap-2"
        >
          <RotateCcw className="w-4 h-4" />
          <span>Clear</span>
        </button>
      </div>
    </div>
  );
};