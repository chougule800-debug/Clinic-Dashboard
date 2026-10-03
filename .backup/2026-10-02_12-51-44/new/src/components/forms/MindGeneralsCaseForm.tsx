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

interface MindFormData {
  patientName: string;
  age: string;
  sex: string;
  date: string;
  mainComplaint: string;
  otherComplaint: string;
  complaintCharacter: string;
  onsetDuration: string;
  associated: string;
  mind: string[];
  mentalDetail: string;
  trigger: string[];
  triggerDetail: string;
  interpretation: string;
  seqEvent: string;
  seqEmotion: string;
  seqThought: string;
  seqPhysical: string;
  seqOnset: string;
  seqDuration: string;
  seqModalities: string;
  seqConcomitant: string;
  body: string[];
  bodyDetail: string;
  rubrics: string[];
  selectedRubrics: string;
  mod: string[];
  generals: string;
  sleep: string;
  dreams: string;
  appetite: string;
  function: string;
  past: string;
  family: string;
  medicines: string;
  habits: string;
  pulse: string;
  bp: string;
  weight: string;
  exam: string;
  investigation: string;
  assessment: string;
  plan: string;
  followDate: string;
  followNotes: string;
}

const INITIAL: MindFormData = {
  patientName: '',
  age: '',
  sex: '',
  date: new Date().toISOString().split('T')[0],
  mainComplaint: '',
  otherComplaint: '',
  complaintCharacter: '',
  onsetDuration: '',
  associated: '',
  mind: [],
  mentalDetail: '',
  trigger: [],
  triggerDetail: '',
  interpretation: '',
  seqEvent: '',
  seqEmotion: '',
  seqThought: '',
  seqPhysical: '',
  seqOnset: '',
  seqDuration: '',
  seqModalities: '',
  seqConcomitant: '',
  body: [],
  bodyDetail: '',
  rubrics: [],
  selectedRubrics: '',
  mod: [],
  generals: '',
  sleep: '',
  dreams: '',
  appetite: '',
  function: '',
  past: '',
  family: '',
  medicines: '',
  habits: '',
  pulse: '',
  bp: '',
  weight: '',
  exam: '',
  investigation: '',
  assessment: '',
  plan: '',
  followDate: '',
  followNotes: ''
};

const MENTAL_STATES = [
  'Anxiety',
  'Fear',
  'Anger',
  'Irritability',
  'Grief',
  'Sadness',
  'Restlessness',
  'Overthinking',
  'Desire for company',
  'Desire for solitude',
  'Crying easily',
  'Suppressed emotions'
];

const TRIGGERS = [
  'Work stress',
  'Family conflict',
  'Financial stress',
  'Relationship conflict',
  'Grief',
  'Humiliation',
  'Suppression of feelings'
];

const BODY = [
  'Headache/Migraine',
  'Palpitations',
  'Breathlessness',
  'Acidity',
  'Bowel disturbance',
  'Skin symptoms',
  'Sleep disturbance',
  'Fatigue'
];

const RUBRICS = [
  'Anxiety',
  'Anger',
  'Concentration difficult',
  'Fear',
  'Grief',
  'Irritability',
  'Restlessness',
  'Weeping'
];

const MODS = [
  'Worse by heat',
  'Worse by cold',
  'Better by warmth',
  'Better by cold',
  'Worse at night',
  'Worse morning'
];

export const MindGeneralsCaseForm: React.FC = () => {
  const { selectedPatient, patients, selectPatient, saveSystemForm, systemForms, setActiveTab } =
    useClinic();

  const [formData, setFormData] = useState<MindFormData>(INITIAL);
  const [statusMessage, setStatusMessage] = useState('');
  const [statusType, setStatusType] = useState<'success' | 'error' | 'info'>('info');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!selectedPatient) return;
    const existing = systemForms.find(
      f => f.patientId === selectedPatient.id && f.system === 'other_mind_generals'
    );
    if (existing && existing.data && Object.keys(existing.data).length > 0) {
      setFormData({
        ...INITIAL,
        ...(existing.data as Partial<MindFormData>),
        patientName: selectedPatient.name,
        age: String(selectedPatient.age || ''),
        sex: selectedPatient.gender,
        date: (existing.data as any).date || new Date().toISOString().split('T')[0],
        pulse: String(selectedPatient.vitals.pulse || ''),
        bp: `${selectedPatient.vitals.bpSystolic || ''}/${selectedPatient.vitals.bpDiastolic || ''}`,
        weight: String(selectedPatient.vitals.weight || '')
      });
    } else {
      setFormData({
        ...INITIAL,
        patientName: selectedPatient.name,
        age: String(selectedPatient.age || ''),
        sex: selectedPatient.gender,
        date: new Date().toISOString().split('T')[0],
        pulse: String(selectedPatient.vitals.pulse || ''),
        bp: `${selectedPatient.vitals.bpSystolic || ''}/${selectedPatient.vitals.bpDiastolic || ''}`,
        weight: String(selectedPatient.vitals.weight || '')
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedPatient?.id, systemForms]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    setFormData(prev => ({ ...prev, [e.target.id]: e.target.value }));
  };

  const toggleArray = (key: keyof MindFormData, value: string) => {
    setFormData(prev => {
      const current = (prev[key] as string[]) || [];
      const updated = current.includes(value)
        ? current.filter(v => v !== value)
        : [...current, value];
      const next = { ...prev, [key]: updated };
      if (key === 'rubrics') {
        next.selectedRubrics = updated.join('\n');
      }
      return next;
    });
  };

  const handleSave = async () => {
    if (!selectedPatient) return;
    setSaving(true);
    try {
      const chief = [
        formData.mainComplaint,
        formData.mind.length ? `Mind: ${formData.mind.join(', ')}` : '',
        formData.trigger.length ? `Triggers: ${formData.trigger.join(', ')}` : ''
      ]
        .filter(Boolean)
        .join(' • ');

      await saveSystemForm({
        patientId: selectedPatient.id,
        system: 'other_mind_generals',
        chiefComplaints: chief || 'Psycho-somatic case',
        duration: formData.onsetDuration || 'Not specified',
        severity:
          formData.mind.length > 5 ? 'Severe' : formData.mind.length > 2 ? 'Moderate' : 'Mild',
        modalitiesAggravation: formData.mod.filter(m => m.includes('Worse')).join(', '),
        modalitiesAmelioration: formData.mod.filter(m => m.includes('Better')).join(', '),
        concomitants: formData.seqPhysical,
        clinicalNotes: formData.assessment || formData.plan,
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
      sex: selectedPatient.gender,
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
            <Brain className="w-5 h-5" />
          </div>
          <div>
            <span className="text-xs uppercase font-bold text-emerald-800 tracking-wider">
              Mind &amp; Generals Form
            </span>
            <h2 className="text-lg font-bold text-slate-900 font-serif">
              Psycho-Somatic Case Taking
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

      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4 text-xs">
        <h3 className="text-base font-bold text-emerald-800 border-b border-emerald-100 pb-3 -mx-6 -mt-6 px-6 pt-4 bg-emerald-50/40 rounded-t-2xl">
          1. Patient Information
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
          <div className="space-y-1">
            <label className="font-bold text-slate-700">Name</label>
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

      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4 text-xs">
        <h3 className="text-base font-bold text-emerald-800 border-b border-emerald-100 pb-3 -mx-6 -mt-6 px-6 pt-4 bg-emerald-50/40 rounded-t-2xl">
          2. Chief Physical Complaints
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
          <div className="space-y-1">
            <label className="font-bold text-slate-700">Main Complaint</label>
            <textarea
              id="mainComplaint"
              rows={2}
              value={formData.mainComplaint}
              onChange={handleChange}
              className="w-full border border-slate-300 rounded-lg p-2"
            />
          </div>
          <div className="space-y-1">
            <label className="font-bold text-slate-700">Character / Sensation</label>
            <textarea
              id="complaintCharacter"
              rows={2}
              value={formData.complaintCharacter}
              onChange={handleChange}
              className="w-full border border-slate-300 rounded-lg p-2"
            />
          </div>
          <div className="space-y-1">
            <label className="font-bold text-slate-700">Onset / Duration</label>
            <input
              id="onsetDuration"
              value={formData.onsetDuration}
              onChange={handleChange}
              className="w-full border border-slate-300 rounded-lg p-2"
            />
          </div>
          <div className="space-y-1">
            <label className="font-bold text-slate-700">Associated</label>
            <input
              id="associated"
              value={formData.associated}
              onChange={handleChange}
              className="w-full border border-slate-300 rounded-lg p-2"
            />
          </div>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4 text-xs">
        <h3 className="text-base font-bold text-emerald-800 border-b border-emerald-100 pb-3 -mx-6 -mt-6 px-6 pt-4 bg-emerald-50/40 rounded-t-2xl">
          3. Mental &amp; Emotional State
        </h3>

        <div>
          <label className="font-bold text-slate-800 block mb-2">Mental States</label>
          <div className="flex flex-wrap gap-2">
            {MENTAL_STATES.map(item => {
              const active = formData.mind.includes(item);
              return (
                <label
                  key={item}
                  className={`flex items-center gap-2 px-3 py-1.5 rounded-lg cursor-pointer border ${
                    active
                      ? 'bg-emerald-50 border-emerald-500 font-semibold'
                      : 'bg-slate-50 border-transparent hover:border-slate-300'
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={active}
                    onChange={() => toggleArray('mind', item)}
                    className="accent-emerald-600"
                  />
                  <span>{item}</span>
                </label>
              );
            })}
          </div>
        </div>

        <div className="space-y-1">
          <label className="font-bold text-slate-700">Mental State Detail</label>
          <textarea
            id="mentalDetail"
            rows={2}
            value={formData.mentalDetail}
            onChange={handleChange}
            className="w-full border border-slate-300 rounded-lg p-2"
          />
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4 text-xs">
        <h3 className="text-base font-bold text-emerald-800 border-b border-emerald-100 pb-3 -mx-6 -mt-6 px-6 pt-4 bg-emerald-50/40 rounded-t-2xl">
          4. Emotional Triggers
        </h3>

        <div>
          <label className="font-bold text-slate-800 block mb-2">Triggers</label>
          <div className="flex flex-wrap gap-2">
            {TRIGGERS.map(item => {
              const active = formData.trigger.includes(item);
              return (
                <label
                  key={item}
                  className={`flex items-center gap-2 px-3 py-1.5 rounded-lg cursor-pointer border ${
                    active
                      ? 'bg-amber-50 border-amber-500 font-semibold'
                      : 'bg-slate-50 border-transparent hover:border-slate-300'
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={active}
                    onChange={() => toggleArray('trigger', item)}
                    className="accent-amber-600"
                  />
                  <span>{item}</span>
                </label>
              );
            })}
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
          <div className="space-y-1">
            <label className="font-bold text-slate-700">Trigger Detail</label>
            <textarea
              id="triggerDetail"
              rows={2}
              value={formData.triggerDetail}
              onChange={handleChange}
              className="w-full border border-slate-300 rounded-lg p-2"
            />
          </div>
          <div className="space-y-1">
            <label className="font-bold text-slate-700">Patient Interpretation</label>
            <textarea
              id="interpretation"
              rows={2}
              value={formData.interpretation}
              onChange={handleChange}
              className="w-full border border-slate-300 rounded-lg p-2"
            />
          </div>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4 text-xs">
        <h3 className="text-base font-bold text-emerald-800 border-b border-emerald-100 pb-3 -mx-6 -mt-6 px-6 pt-4 bg-emerald-50/40 rounded-t-2xl">
          5. Emotion → Body Sequence
        </h3>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            { id: 'seqEvent', label: '1. Event' },
            { id: 'seqEmotion', label: '2. Emotion' },
            { id: 'seqThought', label: '3. Thought' },
            { id: 'seqPhysical', label: '4. Physical Symptom' }
          ].map(f => (
            <div key={f.id} className="space-y-1">
              <label className="font-bold text-slate-700 text-[11px]">{f.label}</label>
              <textarea
                id={f.id}
                rows={2}
                value={(formData as any)[f.id]}
                onChange={handleChange}
                className="w-full border border-slate-300 rounded-lg p-1.5 text-[11px]"
              />
            </div>
          ))}
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            { id: 'seqOnset', label: '5. Onset Time' },
            { id: 'seqDuration', label: '6. Duration' },
            { id: 'seqModalities', label: '7. Modalities' },
            { id: 'seqConcomitant', label: '8. Concomitants' }
          ].map(f => (
            <div key={f.id} className="space-y-1">
              <label className="font-bold text-slate-700 text-[11px]">{f.label}</label>
              <input
                id={f.id}
                value={(formData as any)[f.id]}
                onChange={handleChange}
                className="w-full border border-slate-300 rounded-lg p-1.5 text-[11px]"
              />
            </div>
          ))}
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4 text-xs">
        <h3 className="text-base font-bold text-emerald-800 border-b border-emerald-100 pb-3 -mx-6 -mt-6 px-6 pt-4 bg-emerald-50/40 rounded-t-2xl">
          6. Somatization &amp; Kent Rubrics
        </h3>

        <div>
          <label className="font-bold text-slate-800 block mb-2">Body Systems Affected</label>
          <div className="flex flex-wrap gap-2">
            {BODY.map(item => {
              const active = formData.body.includes(item);
              return (
                <label
                  key={item}
                  className={`flex items-center gap-2 px-3 py-1.5 rounded-lg cursor-pointer border ${
                    active
                      ? 'bg-teal-50 border-teal-500 font-semibold'
                      : 'bg-slate-50 border-transparent hover:border-slate-300'
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={active}
                    onChange={() => toggleArray('body', item)}
                    className="accent-teal-600"
                  />
                  <span>{item}</span>
                </label>
              );
            })}
          </div>
        </div>

        <div className="space-y-1">
          <label className="font-bold text-slate-700">Body Detail</label>
          <textarea
            id="bodyDetail"
            rows={2}
            value={formData.bodyDetail}
            onChange={handleChange}
            className="w-full border border-slate-300 rounded-lg p-2"
          />
        </div>

        <div>
          <label className="font-bold text-slate-800 block mb-2">Kent Mind Rubrics</label>
          <div className="flex flex-wrap gap-2">
            {RUBRICS.map(item => {
              const active = formData.rubrics.includes(item);
              return (
                <label
                  key={item}
                  className={`flex items-center gap-2 px-3 py-1.5 rounded-lg cursor-pointer border ${
                    active
                      ? 'bg-purple-50 border-purple-500 font-semibold'
                      : 'bg-slate-50 border-transparent hover:border-slate-300'
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={active}
                    onChange={() => toggleArray('rubrics', item)}
                    className="accent-purple-600"
                  />
                  <span>{item}</span>
                </label>
              );
            })}
          </div>
        </div>

        <div className="space-y-1">
          <label className="font-bold text-slate-700">Selected Rubrics</label>
          <textarea
            id="selectedRubrics"
            rows={2}
            value={formData.selectedRubrics}
            onChange={handleChange}
            className="w-full border border-slate-300 rounded-lg p-2 font-mono text-[11px]"
          />
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4 text-xs">
        <h3 className="text-base font-bold text-emerald-800 border-b border-emerald-100 pb-3 -mx-6 -mt-6 px-6 pt-4 bg-emerald-50/40 rounded-t-2xl">
          7. General Modalities &amp; Generals
        </h3>

        <div>
          <label className="font-bold text-slate-800 block mb-2">Modalities</label>
          <div className="flex flex-wrap gap-2">
            {MODS.map(item => {
              const active = formData.mod.includes(item);
              return (
                <label
                  key={item}
                  className={`flex items-center gap-2 px-3 py-1.5 rounded-lg cursor-pointer border ${
                    active
                      ? 'bg-indigo-50 border-indigo-500 font-semibold'
                      : 'bg-slate-50 border-transparent hover:border-slate-300'
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={active}
                    onChange={() => toggleArray('mod', item)}
                    className="accent-indigo-600"
                  />
                  <span>{item}</span>
                </label>
              );
            })}
          </div>
        </div>

        <div className="space-y-1">
          <label className="font-bold text-slate-700">Other Generals</label>
          <textarea
            id="generals"
            rows={2}
            value={formData.generals}
            onChange={handleChange}
            className="w-full border border-slate-300 rounded-lg p-2"
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
          <div className="space-y-1">
            <label className="font-bold text-slate-700">Sleep</label>
            <input
              id="sleep"
              value={formData.sleep}
              onChange={handleChange}
              className="w-full border border-slate-300 rounded-lg p-2"
            />
          </div>
          <div className="space-y-1">
            <label className="font-bold text-slate-700">Dreams</label>
            <input
              id="dreams"
              value={formData.dreams}
              onChange={handleChange}
              className="w-full border border-slate-300 rounded-lg p-2"
            />
          </div>
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
            <label className="font-bold text-slate-700">Daily Function</label>
            <input
              id="function"
              value={formData.function}
              onChange={handleChange}
              className="w-full border border-slate-300 rounded-lg p-2"
            />
          </div>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4 text-xs">
        <h3 className="text-base font-bold text-emerald-800 border-b border-emerald-100 pb-3 -mx-6 -mt-6 px-6 pt-4 bg-emerald-50/40 rounded-t-2xl">
          8. Past &amp; Family History
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
          <div className="space-y-1">
            <label className="font-bold text-slate-700">Past History</label>
            <textarea
              id="past"
              rows={2}
              value={formData.past}
              onChange={handleChange}
              className="w-full border border-slate-300 rounded-lg p-2"
            />
          </div>
          <div className="space-y-1">
            <label className="font-bold text-slate-700">Family History</label>
            <textarea
              id="family"
              rows={2}
              value={formData.family}
              onChange={handleChange}
              className="w-full border border-slate-300 rounded-lg p-2"
            />
          </div>
          <div className="space-y-1">
            <label className="font-bold text-slate-700">Current Medicines</label>
            <textarea
              id="medicines"
              rows={2}
              value={formData.medicines}
              onChange={handleChange}
              className="w-full border border-slate-300 rounded-lg p-2"
            />
          </div>
          <div className="space-y-1">
            <label className="font-bold text-slate-700">Substance / Habits</label>
            <textarea
              id="habits"
              rows={2}
              value={formData.habits}
              onChange={handleChange}
              className="w-full border border-slate-300 rounded-lg p-2"
            />
          </div>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4 text-xs">
        <h3 className="text-base font-bold text-emerald-800 border-b border-emerald-100 pb-3 -mx-6 -mt-6 px-6 pt-4 bg-emerald-50/40 rounded-t-2xl">
          9. Assessment &amp; Plan
        </h3>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="space-y-1">
            <label className="font-bold text-slate-700">Pulse</label>
            <input
              id="pulse"
              value={formData.pulse}
              onChange={handleChange}
              className="w-full border border-slate-300 rounded-lg p-2"
            />
          </div>
          <div className="space-y-1">
            <label className="font-bold text-slate-700">BP</label>
            <input
              id="bp"
              value={formData.bp}
              onChange={handleChange}
              className="w-full border border-slate-300 rounded-lg p-2"
            />
          </div>
          <div className="space-y-1">
            <label className="font-bold text-slate-700">Weight</label>
            <input
              id="weight"
              value={formData.weight}
              onChange={handleChange}
              className="w-full border border-slate-300 rounded-lg p-2"
            />
          </div>
          <div className="space-y-1">
            <label className="font-bold text-slate-700">Follow-up Date</label>
            <input
              id="followDate"
              type="date"
              value={formData.followDate}
              onChange={handleChange}
              className="w-full border border-slate-300 rounded-lg p-2"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
          <div className="space-y-1">
            <label className="font-bold text-slate-700">Clinical Exam</label>
            <textarea
              id="exam"
              rows={2}
              value={formData.exam}
              onChange={handleChange}
              className="w-full border border-slate-300 rounded-lg p-2"
            />
          </div>
          <div className="space-y-1">
            <label className="font-bold text-slate-700">Investigation Summary</label>
            <textarea
              id="investigation"
              rows={2}
              value={formData.investigation}
              onChange={handleChange}
              className="w-full border border-slate-300 rounded-lg p-2"
            />
          </div>
          <div className="space-y-1">
            <label className="font-bold text-slate-700">Assessment</label>
            <textarea
              id="assessment"
              rows={2}
              value={formData.assessment}
              onChange={handleChange}
              className="w-full border border-slate-300 rounded-lg p-2"
            />
          </div>
          <div className="space-y-1">
            <label className="font-bold text-slate-700">Plan</label>
            <textarea
              id="plan"
              rows={2}
              value={formData.plan}
              onChange={handleChange}
              className="w-full border border-slate-300 rounded-lg p-2"
            />
          </div>
          <div className="sm:col-span-2 space-y-1">
            <label className="font-bold text-slate-700">Follow-up Notes</label>
            <textarea
              id="followNotes"
              rows={2}
              value={formData.followNotes}
              onChange={handleChange}
              className="w-full border border-slate-300 rounded-lg p-2"
            />
          </div>
        </div>
      </div>

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
        <Brain />
      </span>
    </div>
  );
};