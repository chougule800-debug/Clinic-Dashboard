import React, { useState, useEffect } from 'react';
import { useClinic } from '../../context/ClinicContext';
import {
  Utensils,
  Save,
  CheckCircle2,
  RotateCcw,
  Printer,
  FileText,
  AlertTriangle,
  Loader2
} from 'lucide-react';

interface GastroFormData {
  patientName: string;
  age: string;
  sex: string;
  date: string;
  chiefComplaints: string;
  duration: string;
  severity: string;
  appetite: string;
  thirst: string;
  cravings: string[];
  aversions: string[];
  bowelPattern: string;
  acidityReflux: string[];
  triggers: string[];
  relievingFactors: string[];
  painLocation: string;
  eructations: string;
  abdomenExam: string;
  assessment: string;
  plan: string;
  followup: string;
  notes: string;
}

const INITIAL: GastroFormData = {
  patientName: '',
  age: '',
  sex: '',
  date: new Date().toISOString().split('T')[0],
  chiefComplaints: '',
  duration: '',
  severity: '',
  appetite: '',
  thirst: '',
  cravings: [],
  aversions: [],
  bowelPattern: '',
  acidityReflux: [],
  triggers: [],
  relievingFactors: [],
  painLocation: '',
  eructations: '',
  abdomenExam: '',
  assessment: '',
  plan: '',
  followup: '',
  notes: ''
};

export const GastroCaseForm: React.FC = () => {
  const { selectedPatient, patients, selectPatient, saveSystemForm, systemForms, setActiveTab } =
    useClinic();

  const [formData, setFormData] = useState<GastroFormData>(INITIAL);
  const [statusMessage, setStatusMessage] = useState('');
  const [statusType, setStatusType] = useState<'success' | 'error' | 'info'>('info');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!selectedPatient) return;
    const existing = systemForms.find(
      f => f.patientId === selectedPatient.id && f.system === 'gastrointestinal'
    );
    if (existing && existing.data && Object.keys(existing.data).length > 0) {
      setFormData({
        ...INITIAL,
        ...(existing.data as Partial<GastroFormData>),
        patientName: selectedPatient.name,
        age: String(selectedPatient.age || ''),
        sex:
          selectedPatient.gender === 'Female'
            ? 'Female'
            : selectedPatient.gender === 'Male'
            ? 'Male'
            : 'Other',
        date: (existing.data as any).date || new Date().toISOString().split('T')[0]
      });
    } else {
      setFormData({
        ...INITIAL,
        patientName: selectedPatient.name,
        age: String(selectedPatient.age || ''),
        sex:
          selectedPatient.gender === 'Female'
            ? 'Female'
            : selectedPatient.gender === 'Male'
            ? 'Male'
            : 'Other',
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

  const toggleArray = (key: keyof GastroFormData, value: string) => {
    setFormData(prev => {
      const current = (prev[key] as string[]) || [];
      return {
        ...prev,
        [key]: current.includes(value)
          ? current.filter(v => v !== value)
          : [...current, value]
      };
    });
  };

  const handleSave = async () => {
    if (!selectedPatient) return;
    setSaving(true);
    try {
      await saveSystemForm({
        patientId: selectedPatient.id,
        system: 'gastrointestinal',
        chiefComplaints: formData.chiefComplaints || 'Gastrointestinal complaint',
        duration: formData.duration || 'Not specified',
        severity:
          formData.severity === 'Severe'
            ? 'Severe'
            : formData.severity === 'Mild'
            ? 'Mild'
            : 'Moderate',
        modalitiesAggravation: formData.triggers.join(', '),
        modalitiesAmelioration: formData.relievingFactors.join(', '),
        concomitants: formData.eructations,
        clinicalNotes: formData.notes || formData.assessment,
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

  const handleClear = () => {
    if (!confirm('Clear form?') || !selectedPatient) return;
    setFormData({
      ...INITIAL,
      patientName: selectedPatient.name,
      age: String(selectedPatient.age || ''),
      sex:
        selectedPatient.gender === 'Female'
          ? 'Female'
          : selectedPatient.gender === 'Male'
          ? 'Male'
          : 'Other',
      date: new Date().toISOString().split('T')[0]
    });
    setStatusMessage('Cleared');
    setStatusType('info');
    setTimeout(() => setStatusMessage(''), 2000);
  };

  return (
    <div className="space-y-6 pb-28 max-w-6xl mx-auto">
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-700">
            <Utensils className="w-5 h-5" />
          </div>
          <div>
            <span className="text-xs uppercase font-bold text-emerald-800 tracking-wider">
              Gastrointestinal Form
            </span>
            <h2 className="text-lg font-bold text-slate-900 font-serif">
              GI Case Taking
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
            <FileText className="w-3.5 h-3.5 text-emerald-700" />
            Summary
          </button>
        </div>
      </div>

      {statusMessage && (
        <div
          className={`p-3 rounded-xl border text-xs font-medium flex items-center gap-2 ${
            statusType === 'success'
              ? 'bg-emerald-50 border-emerald-300 text-emerald-900'
              : 'bg-rose-50 border-rose-300 text-rose-900'
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

      {/* 1. Patient */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4">
        <h3 className="text-base font-bold text-emerald-800 border-b border-emerald-100 pb-3 -mx-6 -mt-6 px-6 pt-4 bg-emerald-50/40 rounded-t-2xl">
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
            <label className="font-bold text-slate-700">Sex</label>
            <select
              id="sex"
              value={formData.sex}
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
            <label className="font-bold text-slate-700">Date</label>
            <input
              id="date"
              type="date"
              value={formData.date}
              onChange={handleChange}
              className="w-full border border-slate-300 rounded-lg p-2"
            />
          </div>
        </div>
      </div>

      {/* 2. Chief complaints */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4">
        <h3 className="text-base font-bold text-emerald-800 border-b border-emerald-100 pb-3 -mx-6 -mt-6 px-6 pt-4 bg-emerald-50/40 rounded-t-2xl">
          2. Chief Complaints
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5 text-xs">
          <div className="sm:col-span-3 space-y-1">
            <label className="font-bold text-slate-700">Main complaint</label>
            <textarea
              id="chiefComplaints"
              rows={2}
              value={formData.chiefComplaints}
              onChange={handleChange}
              className="w-full border border-slate-300 rounded-lg p-2"
            />
          </div>
          <div className="space-y-1">
            <label className="font-bold text-slate-700">Duration</label>
            <input
              id="duration"
              value={formData.duration}
              onChange={handleChange}
              className="w-full border border-slate-300 rounded-lg p-2"
            />
          </div>
          <div className="space-y-1">
            <label className="font-bold text-slate-700">Severity</label>
            <select
              id="severity"
              value={formData.severity}
              onChange={handleChange}
              className="w-full border border-slate-300 rounded-lg p-2"
            >
              <option value="">Select</option>
              <option value="Mild">Mild</option>
              <option value="Moderate">Moderate</option>
              <option value="Severe">Severe</option>
            </select>
          </div>
        </div>
      </div>

      {/* 3. Generals */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4">
        <h3 className="text-base font-bold text-emerald-800 border-b border-emerald-100 pb-3 -mx-6 -mt-6 px-6 pt-4 bg-emerald-50/40 rounded-t-2xl">
          3. Generals
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 text-xs">
          <div className="space-y-1">
            <label className="font-bold text-slate-700">Appetite</label>
            <input
              id="appetite"
              value={formData.appetite}
              onChange={handleChange}
              className="w-full border border-slate-300 rounded-lg p-2"
            />
          </div>
          <div className="space-y-1">
            <label className="font-bold text-slate-700">Thirst</label>
            <input
              id="thirst"
              value={formData.thirst}
              onChange={handleChange}
              className="w-full border border-slate-300 rounded-lg p-2"
            />
          </div>
        </div>

        <div>
          <label className="font-bold text-slate-800 text-xs block mb-2">Cravings</label>
          <div className="flex flex-wrap gap-2">
            {['Sweets', 'Spicy', 'Salt', 'Sour', 'Warm Food', 'Fats & Meat', 'Cold Drinks'].map(item => {
              const active = formData.cravings.includes(item);
              return (
                <label
                  key={item}
                  className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs cursor-pointer border ${
                    active
                      ? 'bg-emerald-50 border-emerald-500 font-semibold'
                      : 'bg-slate-50 border-transparent hover:border-slate-300'
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={active}
                    onChange={() => toggleArray('cravings', item)}
                    className="accent-emerald-600"
                  />
                  <span>{item}</span>
                </label>
              );
            })}
          </div>
        </div>

        <div>
          <label className="font-bold text-slate-800 text-xs block mb-2">Aversions</label>
          <div className="flex flex-wrap gap-2">
            {['Milk', 'Meat', 'Bread', 'Oily Food', 'Sweets', 'Coffee / Tea'].map(item => {
              const active = formData.aversions.includes(item);
              return (
                <label
                  key={item}
                  className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs cursor-pointer border ${
                    active
                      ? 'bg-rose-50 border-rose-500 font-semibold'
                      : 'bg-slate-50 border-transparent hover:border-slate-300'
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={active}
                    onChange={() => toggleArray('aversions', item)}
                    className="accent-rose-600"
                  />
                  <span>{item}</span>
                </label>
              );
            })}
          </div>
        </div>
      </div>

      {/* 4. GI Symptoms */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4">
        <h3 className="text-base font-bold text-emerald-800 border-b border-emerald-100 pb-3 -mx-6 -mt-6 px-6 pt-4 bg-emerald-50/40 rounded-t-2xl">
          4. GI Symptoms &amp; Bowels
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 text-xs">
          <div className="space-y-1">
            <label className="font-bold text-slate-700">Bowel Pattern</label>
            <textarea
              id="bowelPattern"
              rows={2}
              value={formData.bowelPattern}
              onChange={handleChange}
              className="w-full border border-slate-300 rounded-lg p-2"
            />
          </div>
          <div className="space-y-1">
            <label className="font-bold text-slate-700">Pain Location</label>
            <input
              id="painLocation"
              value={formData.painLocation}
              onChange={handleChange}
              className="w-full border border-slate-300 rounded-lg p-2"
            />
          </div>
        </div>

        <div>
          <label className="font-bold text-slate-800 text-xs block mb-2">
            Acidity / Reflux / Gas
          </label>
          <div className="flex flex-wrap gap-2">
            {[
              'Sour waterbrash',
              'Heartburn',
              'Bloating',
              'Loud eructations',
              'Burning epigastrium',
              'Nausea after greasy food'
            ].map(item => {
              const active = formData.acidityReflux.includes(item);
              return (
                <label
                  key={item}
                  className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs cursor-pointer border ${
                    active
                      ? 'bg-rose-50 border-rose-500 font-semibold'
                      : 'bg-slate-50 border-transparent hover:border-slate-300'
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={active}
                    onChange={() => toggleArray('acidityReflux', item)}
                    className="accent-rose-600"
                  />
                  <span>{item}</span>
                </label>
              );
            })}
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 text-xs">
          <div>
            <label className="font-bold text-slate-800 block mb-2">Triggers</label>
            <div className="flex flex-wrap gap-2">
              {['Spicy', 'Oily', 'Milk', 'Stress', 'Lying Down', 'Late Dinner'].map(item => {
                const active = formData.triggers.includes(item);
                return (
                  <label
                    key={item}
                    className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs cursor-pointer border ${
                      active
                        ? 'bg-rose-50 border-rose-500 font-semibold'
                        : 'bg-slate-50 border-transparent hover:border-slate-300'
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={active}
                      onChange={() => toggleArray('triggers', item)}
                      className="accent-rose-600"
                    />
                    <span>{item}</span>
                  </label>
                );
              })}
            </div>
          </div>

          <div>
            <label className="font-bold text-slate-800 block mb-2">Relieving Factors</label>
            <div className="flex flex-wrap gap-2">
              {['Passing gas', 'Warm water', 'Rest', 'Eating', 'Vomiting'].map(item => {
                const active = formData.relievingFactors.includes(item);
                return (
                  <label
                    key={item}
                    className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs cursor-pointer border ${
                      active
                        ? 'bg-emerald-50 border-emerald-500 font-semibold'
                        : 'bg-slate-50 border-transparent hover:border-slate-300'
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={active}
                      onChange={() => toggleArray('relievingFactors', item)}
                      className="accent-emerald-600"
                    />
                    <span>{item}</span>
                  </label>
                );
              })}
            </div>
          </div>
        </div>

        <div className="space-y-1 text-xs">
          <label className="font-bold text-slate-700">Eructations / Belching</label>
          <input
            id="eructations"
            value={formData.eructations}
            onChange={handleChange}
            className="w-full border border-slate-300 rounded-lg p-2"
          />
        </div>
      </div>

      {/* 5. Assessment */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4 text-xs">
        <h3 className="text-base font-bold text-emerald-800 border-b border-emerald-100 pb-3 -mx-6 -mt-6 px-6 pt-4 bg-emerald-50/40 rounded-t-2xl">
          5. Assessment &amp; Plan
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
          <div className="space-y-1">
            <label className="font-bold text-slate-700">Abdominal Examination</label>
            <textarea
              id="abdomenExam"
              rows={2}
              value={formData.abdomenExam}
              onChange={handleChange}
              className="w-full border border-slate-300 rounded-lg p-2"
            />
          </div>
          <div className="space-y-1">
            <label className="font-bold text-slate-700">Assessment / Provisional Diagnosis</label>
            <textarea
              id="assessment"
              rows={2}
              value={formData.assessment}
              onChange={handleChange}
              className="w-full border border-slate-300 rounded-lg p-2"
            />
          </div>
          <div className="space-y-1">
            <label className="font-bold text-slate-700">Homeopathic Treatment</label>
            <textarea
              id="plan"
              rows={2}
              value={formData.plan}
              onChange={handleChange}
              className="w-full border border-slate-300 rounded-lg p-2"
            />
          </div>
          <div className="space-y-1">
            <label className="font-bold text-slate-700">Follow-up Date</label>
            <input
              id="followup"
              type="date"
              value={formData.followup}
              onChange={handleChange}
              className="w-full border border-slate-300 rounded-lg p-2"
            />
          </div>
          <div className="sm:col-span-2 space-y-1">
            <label className="font-bold text-slate-700">Notes</label>
            <textarea
              id="notes"
              rows={2}
              value={formData.notes}
              onChange={handleChange}
              className="w-full border border-slate-300 rounded-lg p-2"
            />
          </div>
        </div>
      </div>

      {/* Sticky Actions */}
      <div className="sticky bottom-0 bg-white/95 backdrop-blur-xs p-4 rounded-2xl border border-slate-200 shadow-lg flex items-center justify-center gap-3 z-30">
        <button
          type="button"
          onClick={handleSave}
          disabled={saving}
          className="px-5 py-2.5 bg-emerald-700 hover:bg-emerald-800 disabled:opacity-60 text-white font-bold text-xs rounded-xl shadow-xs flex items-center gap-2"
        >
          {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
          <span>{saving ? 'Saving...' : 'Save Case'}</span>
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

      <span className="hidden">
        <Printer />
      </span>
    </div>
  );
};