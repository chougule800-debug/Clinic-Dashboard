import React, { useState, useEffect } from 'react';
import { useClinic } from '../../context/ClinicContext';
import {
  Wind, Save, CheckCircle2, RotateCcw, FileText, AlertTriangle, Loader2
} from 'lucide-react';

interface RespFormData {
  patientName: string; age: string; sex: string; date: string; chiefComplaints: string;
  duration: string; severity: string; complaints: string[]; allergySymptoms: string[];
  triggers: string[]; asthmaDiagnosis: string; worse: string[]; better: string[];
  pulse: string; bp: string; spo2: string; respRate: string; temperature: string;
  exam: string[]; reportFinding: string; diagnosis: string; plan: string;
  followup: string; doctorNotes: string;
}

const INITIAL: RespFormData = {
  patientName: '', age: '', sex: '', date: new Date().toISOString().split('T')[0],
  chiefComplaints: '', duration: '', severity: '', complaints: [], allergySymptoms: [],
  triggers: [], asthmaDiagnosis: 'No / नाही', worse: [], better: '', pulse: '', bp: '',
  spo2: '', respRate: '', temperature: '', exam: [], reportFinding: '', diagnosis: '',
  plan: '', followup: '', doctorNotes: ''
};

const inputCls = 'w-full border border-slate-300 rounded-lg p-3 text-base focus:ring-2 focus:ring-teal-500 focus:outline-none';
const labelCls = 'block font-bold text-slate-700 mb-1.5 text-base';
const chipCls = (active: boolean) => `flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm cursor-pointer border ${active ? 'bg-teal-50 border-teal-500 font-semibold' : 'bg-slate-50 border-transparent hover:border-slate-300'}`;

export const RespiratoryCaseForm: React.FC = () => {
  const { selectedPatient, patients, selectPatient, saveSystemForm, systemForms, setActiveTab } = useClinic();
  const [formData, setFormData] = useState<RespFormData>(INITIAL);
  const [statusMessage, setStatusMessage] = useState('');
  const [statusType, setStatusType] = useState<'success' | 'error' | 'info'>('info');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!selectedPatient) return;
    const existing = systemForms.find(f => f.patientId === selectedPatient.id && f.system === 'respiratory');
    if (existing && existing.data && Object.keys(existing.data).length > 0) {
      setFormData({
        ...INITIAL, ...(existing.data as Partial<RespFormData>),
        patientName: selectedPatient.name, age: String(selectedPatient.age || ''),
        sex: selectedPatient.gender,
        date: (existing.data as any).date || new Date().toISOString().split('T')[0],
        pulse: String(selectedPatient.vitals.pulse || ''),
        bp: `${selectedPatient.vitals.bpSystolic || ''}/${selectedPatient.vitals.bpDiastolic || ''}`,
        spo2: `${selectedPatient.vitals.spo2 || ''}%`
      });
    } else {
      setFormData({
        ...INITIAL, patientName: selectedPatient.name, age: String(selectedPatient.age || ''),
        sex: selectedPatient.gender, date: new Date().toISOString().split('T')[0],
        pulse: String(selectedPatient.vitals.pulse || ''),
        bp: `${selectedPatient.vitals.bpSystolic || ''}/${selectedPatient.vitals.bpDiastolic || ''}`,
        spo2: `${selectedPatient.vitals.spo2 || ''}%`
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedPatient?.id, systemForms]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setFormData(prev => ({ ...prev, [e.target.id]: e.target.value }));
  };

  const toggleArray = (key: keyof RespFormData, value: string) => {
    setFormData(prev => {
      const current = (prev[key] as string[]) || [];
      return { ...prev, [key]: current.includes(value) ? current.filter(v => v !== value) : [...current, value] };
    });
  };

  const handleSave = async () => {
    if (!selectedPatient) return;
    setSaving(true);
    try {
      await saveSystemForm({
        patientId: selectedPatient.id, system: 'respiratory',
        chiefComplaints: formData.chiefComplaints || 'Respiratory complaint',
        duration: formData.duration || 'Not specified',
        severity: formData.severity === 'Severe' ? 'Severe' : formData.severity === 'Mild' ? 'Mild' : 'Moderate',
        modalitiesAggravation: formData.worse.join(', '),
        modalitiesAmelioration: formData.better.join(', '),
        concomitants: formData.complaints.join(', '),
        clinicalNotes: formData.doctorNotes || formData.diagnosis,
        data: { ...formData }, submittedVia: 'Doctor_Dashboard'
      });
      setStatusMessage('Case saved to cloud.'); setStatusType('success');
      setTimeout(() => setStatusMessage(''), 3500);
    } catch (err) {
      setStatusMessage(err instanceof Error ? err.message : 'Save failed.'); setStatusType('error');
    } finally { setSaving(false); }
  };

  const handleClear = () => {
    if (!confirm('Clear form?') || !selectedPatient) return;
    setFormData({ ...INITIAL, patientName: selectedPatient.name, age: String(selectedPatient.age || ''), sex: selectedPatient.gender, date: new Date().toISOString().split('T')[0] });
    setStatusMessage('Cleared'); setStatusType('info');
    setTimeout(() => setStatusMessage(''), 2000);
  };

  return (
    <div className="space-y-6 pb-28 max-w-6xl mx-auto text-base">
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-teal-50 border border-teal-200 flex items-center justify-center text-teal-700"><Wind className="w-6 h-6" /></div>
          <div>
            <span className="text-sm uppercase font-bold text-teal-800 tracking-wider">Respiratory Form</span>
            <h2 className="text-2xl font-bold text-slate-900 font-serif">Respiratory Case Taking</h2>
            <p className="text-base text-slate-500">Active: <strong>{selectedPatient?.name}</strong></p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <select value={selectedPatient?.id || ''} onChange={e => selectPatient(e.target.value)} className="px-4 py-2 bg-slate-50 border border-slate-300 rounded-xl text-base">
            {patients.map(p => <option key={p.id} value={p.id}>{p.name} ({p.patientCode ?? p.id})</option>)}
          </select>
          <button type="button" onClick={() => setActiveTab('case_summary')} className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-base rounded-xl flex items-center gap-2">
            <FileText className="w-5 h-5 text-teal-700" />Summary
          </button>
        </div>
      </div>

      {statusMessage && (
        <div className={`p-3.5 rounded-xl border text-base font-medium flex items-center gap-2 ${statusType === 'success' ? 'bg-emerald-50 border-emerald-300 text-emerald-900' : 'bg-rose-50 border-rose-300 text-rose-900'}`}>
          {statusType === 'success' ? <CheckCircle2 className="w-5 h-5 text-emerald-600" /> : <AlertTriangle className="w-5 h-5 text-rose-600" />}
          <span>{statusMessage}</span>
        </div>
      )}

      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-5">
        <h3 className="text-xl font-bold text-teal-800 border-b border-teal-100 pb-3 -mx-6 -mt-6 px-6 pt-5 bg-teal-50/40 rounded-t-2xl">1. Patient Information</h3>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div><label className={labelCls}>Name</label><input id="patientName" value={formData.patientName} onChange={handleChange} className={inputCls} /></div>
          <div><label className={labelCls}>Age</label><input id="age" value={formData.age} onChange={handleChange} className={inputCls} /></div>
          <div><label className={labelCls}>Sex</label><select id="sex" value={formData.sex} onChange={handleChange} className={inputCls}><option value="">Select</option><option value="Male">Male</option><option value="Female">Female</option><option value="Other">Other</option></select></div>
          <div><label className={labelCls}>Date</label><input id="date" type="date" value={formData.date} onChange={handleChange} className={inputCls} /></div>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-5">
        <h3 className="text-xl font-bold text-teal-800 border-b border-teal-100 pb-3 -mx-6 -mt-6 px-6 pt-5 bg-teal-50/40 rounded-t-2xl">2. Chief Complaints</h3>
        <div><label className={labelCls}>Main complaint</label><textarea id="chiefComplaints" rows={2} value={formData.chiefComplaints} onChange={handleChange} className={inputCls} /></div>
        <div>
          <label className={labelCls}>Respiratory Symptoms</label>
          <div className="flex flex-wrap gap-2">
            {['Cough','Dry cough','Productive cough','Breathlessness','Wheezing','Chest tightness','Sore throat','Hoarseness','Recurrent cold','Snoring'].map(item => (
              <label key={item} className={chipCls(formData.complaints.includes(item))}>
                <input type="checkbox" checked={formData.complaints.includes(item)} onChange={() => toggleArray('complaints', item)} className="accent-teal-600 w-4 h-4" /><span>{item}</span>
              </label>
            ))}
          </div>
        </div>
        <div>
          <label className={labelCls}>Allergy Symptoms</label>
          <div className="flex flex-wrap gap-2">
            {['Sneezing','Nasal blockage','Watery nasal discharge','Nasal itching','Eye itching','Postnasal drip','Skin allergy'].map(item => (
              <label key={item} className={chipCls(formData.allergySymptoms.includes(item))}>
                <input type="checkbox" checked={formData.allergySymptoms.includes(item)} onChange={() => toggleArray('allergySymptoms', item)} className="accent-teal-600 w-4 h-4" /><span>{item}</span>
              </label>
            ))}
          </div>
        </div>
        <div>
          <label className={labelCls}>Triggers</label>
          <div className="flex flex-wrap gap-2">
            {['Dust','Pollen','Pet dander','Smoke','Perfume','Cold air','Weather change','Food'].map(item => (
              <label key={item} className={chipCls(formData.triggers.includes(item))}>
                <input type="checkbox" checked={formData.triggers.includes(item)} onChange={() => toggleArray('triggers', item)} className="accent-teal-600 w-4 h-4" /><span>{item}</span>
              </label>
            ))}
          </div>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div><label className={labelCls}>Duration</label><input id="duration" value={formData.duration} onChange={handleChange} className={inputCls} /></div>
          <div><label className={labelCls}>Severity</label><select id="severity" value={formData.severity} onChange={handleChange} className={inputCls}><option value="">Select</option><option value="Mild">Mild</option><option value="Moderate">Moderate</option><option value="Severe">Severe</option></select></div>
          <div><label className={labelCls}>Asthma Diagnosis</label><select id="asthmaDiagnosis" value={formData.asthmaDiagnosis} onChange={handleChange} className={inputCls}><option value="No / नाही">No</option><option value="Yes / होय">Yes</option><option value="Suspected / संशयित">Suspected</option></select></div>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-5">
        <h3 className="text-xl font-bold text-teal-800 border-b border-teal-100 pb-3 -mx-6 -mt-6 px-6 pt-5 bg-teal-50/40 rounded-t-2xl">3. Modalities</h3>
        <div>
          <label className={labelCls}>Aggravation</label>
          <div className="flex flex-wrap gap-2">
            {['Cold air','Warm room','Dust','Lying down','Night','Morning','Exercise'].map(item => (
              <label key={item} className={chipCls(formData.worse.includes(item))}>
                <input type="checkbox" checked={formData.worse.includes(item)} onChange={() => toggleArray('worse', item)} className="accent-teal-600 w-4 h-4" /><span>{item}</span>
              </label>
            ))}
          </div>
        </div>
        <div>
          <label className={labelCls}>Amelioration</label>
          <div className="flex flex-wrap gap-2">
            {['Fresh air','Warmth','Sitting up','Steam','Rest'].map(item => (
              <label key={item} className={chipCls(formData.better.includes(item))}>
                <input type="checkbox" checked={formData.better.includes(item)} onChange={() => toggleArray('better', item)} className="accent-teal-600 w-4 h-4" /><span>{item}</span>
              </label>
            ))}
          </div>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-5">
        <h3 className="text-xl font-bold text-teal-800 border-b border-teal-100 pb-3 -mx-6 -mt-6 px-6 pt-5 bg-teal-50/40 rounded-t-2xl">4. Examination &amp; Plan</h3>
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-4">
          <div><label className={labelCls}>Pulse</label><input id="pulse" value={formData.pulse} onChange={handleChange} className={inputCls} /></div>
          <div><label className={labelCls}>BP</label><input id="bp" value={formData.bp} onChange={handleChange} className={inputCls} /></div>
          <div><label className={labelCls}>SpO₂</label><input id="spo2" value={formData.spo2} onChange={handleChange} className={inputCls} /></div>
          <div><label className={labelCls}>Resp Rate</label><input id="respRate" value={formData.respRate} onChange={handleChange} className={inputCls} /></div>
          <div><label className={labelCls}>Temperature</label><input id="temperature" value={formData.temperature} onChange={handleChange} className={inputCls} /></div>
        </div>
        <div>
          <label className={labelCls}>Chest Exam</label>
          <div className="flex flex-wrap gap-2">
            {['Normal','Wheeze','Crepitations','Rhonchi','Reduced air entry'].map(item => (
              <label key={item} className={chipCls(formData.exam.includes(item))}>
                <input type="checkbox" checked={formData.exam.includes(item)} onChange={() => toggleArray('exam', item)} className="accent-teal-600 w-4 h-4" /><span>{item}</span>
              </label>
            ))}
          </div>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div><label className={labelCls}>Report Findings</label><textarea id="reportFinding" rows={2} value={formData.reportFinding} onChange={handleChange} className={inputCls} /></div>
          <div><label className={labelCls}>Assessment / Diagnosis</label><textarea id="diagnosis" rows={2} value={formData.diagnosis} onChange={handleChange} className={inputCls} /></div>
          <div><label className={labelCls}>Homeopathic Plan</label><textarea id="plan" rows={2} value={formData.plan} onChange={handleChange} className={inputCls} /></div>
          <div><label className={labelCls}>Follow-up Date</label><input id="followup" type="date" value={formData.followup} onChange={handleChange} className={inputCls} /></div>
          <div className="sm:col-span-2"><label className={labelCls}>Doctor Notes</label><textarea id="doctorNotes" rows={2} value={formData.doctorNotes} onChange={handleChange} className={inputCls} /></div>
        </div>
      </div>

      <div className="sticky bottom-0 bg-white/95 backdrop-blur-xs p-4 rounded-2xl border border-slate-200 shadow-lg flex items-center justify-center gap-3 z-30">
        <button type="button" onClick={handleSave} disabled={saving} className="px-6 py-3 bg-teal-700 hover:bg-teal-800 disabled:opacity-60 text-white font-bold text-base rounded-xl shadow-xs flex items-center gap-2">
          {saving ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
          <span>{saving ? 'Saving...' : 'Save Case'}</span>
        </button>
        <button type="button" onClick={handleClear} className="px-6 py-3 bg-rose-600 hover:bg-rose-700 text-white font-bold text-base rounded-xl shadow-xs flex items-center gap-2">
          <RotateCcw className="w-5 h-5" /><span>Clear</span>
        </button>
      </div>
    </div>
  );
};