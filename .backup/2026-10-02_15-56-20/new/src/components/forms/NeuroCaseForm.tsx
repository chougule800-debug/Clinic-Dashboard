import React, { useState, useEffect } from 'react';
import { useClinic } from '../../context/ClinicContext';
import {
  Brain, Save, CheckCircle2, RotateCcw, Printer, FileText, AlertTriangle, Loader2
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
  diagnosis: string;
  affectedArea: string;
  clinicalSeverity: string;
  clinicalStatus: string;
  clinicalNotes: string;
  treatment: string;
  advice: string;
  followup: string;
}

const INITIAL: NeuroFormData = {
  patientName: '', age: '', gender: '', date: new Date().toISOString().split('T')[0],
  mobile: '', occupation: '', address: '', mainComplaint: [], otherComplaint: '',
  headacheLocation: [], headacheType: [], headacheSeverity: '', headacheScore: '',
  headacheDuration: '', headacheFrequency: '', headacheTime: '', headacheOnset: '',
  headacheTrigger: [], headacheAssociated: [], headacheRelief: '', headacheDetails: '',
  diagnosis: '', affectedArea: '', clinicalSeverity: '', clinicalStatus: '',
  clinicalNotes: '', treatment: '', advice: '', followup: ''
};

const inputCls = 'w-full border border-slate-300 rounded-lg p-3 text-base focus:ring-2 focus:ring-teal-500 focus:outline-none';
const labelCls = 'block font-bold text-slate-700 mb-1.5 text-base';

export const NeuroCaseForm: React.FC = () => {
  const { selectedPatient, patients, selectPatient, saveSystemForm, systemForms, setActiveTab } = useClinic();
  const [formData, setFormData] = useState<NeuroFormData>(INITIAL);
  const [statusMessage, setStatusMessage] = useState('');
  const [statusType, setStatusType] = useState<'success' | 'error' | 'info'>('info');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!selectedPatient) return;
    const existing = systemForms.find(f => f.patientId === selectedPatient.id && f.system === 'headache');
    if (existing && existing.data && Object.keys(existing.data).length > 0) {
      setFormData({
        ...INITIAL, ...(existing.data as Partial<NeuroFormData>),
        patientName: selectedPatient.name, age: String(selectedPatient.age || ''),
        gender: selectedPatient.gender, mobile: selectedPatient.mobile || '',
        address: selectedPatient.address || '',
        date: (existing.data as any).date || new Date().toISOString().split('T')[0]
      });
    } else {
      setFormData({
        ...INITIAL, patientName: selectedPatient.name, age: String(selectedPatient.age || ''),
        gender: selectedPatient.gender, mobile: selectedPatient.mobile || '',
        address: selectedPatient.address || '', date: new Date().toISOString().split('T')[0]
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedPatient?.id, systemForms]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { id, value } = e.target;
    setFormData(prev => ({ ...prev, [id]: value }));
  };

  const toggleChip = (category: keyof NeuroFormData, value: string) => {
    setFormData(prev => {
      const current = (prev[category] as string[]) || [];
      return { ...prev, [category]: current.includes(value) ? current.filter(v => v !== value) : [...current, value] };
    });
  };

  const handleSave = async () => {
    if (!selectedPatient) { setStatusMessage('No patient selected.'); setStatusType('error'); return; }
    if (!formData.patientName.trim()) { setStatusMessage('Please enter patient name.'); setStatusType('error'); return; }
    setSaving(true);
    try {
      const chiefComplaints = [
        formData.headacheType.length ? formData.headacheType.join(', ') : '',
        formData.headacheLocation.length ? `at ${formData.headacheLocation.join(', ')}` : '',
        formData.headacheDuration ? `duration ${formData.headacheDuration}` : ''
      ].filter(Boolean).join(' • ');
      await saveSystemForm({
        patientId: selectedPatient.id, system: 'headache',
        chiefComplaints: chiefComplaints || 'Headache / Neurological case',
        duration: formData.headacheDuration || 'Not specified',
        severity: formData.headacheSeverity === 'Severe' || formData.headacheSeverity === 'Very Severe' ? 'Severe' : formData.headacheSeverity === 'Mild' ? 'Mild' : 'Moderate',
        modalitiesAggravation: formData.headacheTrigger.join(', '),
        modalitiesAmelioration: formData.headacheRelief,
        concomitants: formData.headacheAssociated.join(', '),
        clinicalNotes: formData.clinicalNotes || formData.diagnosis,
        data: { ...formData }, submittedVia: 'Doctor_Dashboard'
      });
      setStatusMessage('Case saved to cloud.');
      setStatusType('success');
      setTimeout(() => setStatusMessage(''), 3500);
    } catch (err) {
      setStatusMessage(err instanceof Error ? err.message : 'Save failed.');
      setStatusType('error');
    } finally { setSaving(false); }
  };

  const handleClear = () => {
    if (!confirm('Clear all fields?') || !selectedPatient) return;
    setFormData({
      ...INITIAL, patientName: selectedPatient.name, age: String(selectedPatient.age || ''),
      gender: selectedPatient.gender, mobile: selectedPatient.mobile || '',
      address: selectedPatient.address || '', date: new Date().toISOString().split('T')[0]
    });
    setStatusMessage('Form cleared');
    setStatusType('info');
    setTimeout(() => setStatusMessage(''), 3000);
  };

  const chipCls = (checked: boolean) => `p-3 rounded-lg text-sm font-medium border text-left ${checked ? 'bg-teal-700 text-white border-teal-800' : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-teal-50'}`;

  return (
    <div className="space-y-6 pb-28 max-w-6xl mx-auto text-base">
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-teal-50 border border-teal-200 flex items-center justify-center text-teal-700"><Brain className="w-6 h-6" /></div>
          <div>
            <span className="text-sm uppercase font-bold text-teal-800 tracking-wider">Neurological Form</span>
            <h2 className="text-2xl font-bold text-slate-900 font-serif">Headache / Neuro Case Taking</h2>
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
          <div><label className={labelCls}>Patient Name</label><input id="patientName" value={formData.patientName} onChange={handleChange} className={inputCls} /></div>
          <div><label className={labelCls}>Age</label><input id="age" value={formData.age} onChange={handleChange} className={inputCls} /></div>
          <div><label className={labelCls}>Gender</label><select id="gender" value={formData.gender} onChange={handleChange} className={inputCls}><option value="">Select</option><option value="Male">Male</option><option value="Female">Female</option><option value="Other">Other</option></select></div>
          <div><label className={labelCls}>Mobile</label><input id="mobile" value={formData.mobile} onChange={handleChange} className={inputCls} /></div>
          <div><label className={labelCls}>Date</label><input id="date" type="date" value={formData.date} onChange={handleChange} className={inputCls} /></div>
          <div><label className={labelCls}>Occupation</label><input id="occupation" value={formData.occupation} onChange={handleChange} className={inputCls} /></div>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-5">
        <h3 className="text-xl font-bold text-teal-800 border-b border-teal-100 pb-3 -mx-6 -mt-6 px-6 pt-5 bg-teal-50/40 rounded-t-2xl">2. Main Neurological Complaint</h3>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          {['Headache','Dizziness','Vertigo','Fainting','Seizure','Numbness','Tingling','Weakness','Tremor','Memory','Speech','Balance'].map(item => (
            <button type="button" key={item} onClick={() => toggleChip('mainComplaint', item)} className={chipCls(formData.mainComplaint.includes(item))}>{item}</button>
          ))}
        </div>
        <textarea id="otherComplaint" rows={2} value={formData.otherComplaint} onChange={handleChange} placeholder="Other complaints" className={inputCls} />
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-5">
        <h3 className="text-xl font-bold text-teal-800 border-b border-teal-100 pb-3 -mx-6 -mt-6 px-6 pt-5 bg-teal-50/40 rounded-t-2xl">3. Headache Assessment</h3>

        <div className="p-4 bg-teal-50/40 rounded-xl border border-teal-100 space-y-3">
          <div className="font-bold text-base text-teal-900">Location</div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {['Forehead','Temples','One Side','Both Sides','Back of Head','Top of Head','Around Eye','Whole Head'].map(item => (
              <button type="button" key={item} onClick={() => toggleChip('headacheLocation', item)} className={chipCls(formData.headacheLocation.includes(item))}>{item}</button>
            ))}
          </div>
        </div>

        <div className="p-4 bg-teal-50/40 rounded-xl border border-teal-100 space-y-3">
          <div className="font-bold text-base text-teal-900">Character</div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {['Throbbing','Pressing','Tight Band','Sharp','Stabbing','Burning','Heaviness','Pulsating'].map(item => (
              <button type="button" key={item} onClick={() => toggleChip('headacheType', item)} className={chipCls(formData.headacheType.includes(item))}>{item}</button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div><label className={labelCls}>Severity</label><select id="headacheSeverity" value={formData.headacheSeverity} onChange={handleChange} className={inputCls}><option value="">Select</option><option value="Mild">Mild</option><option value="Moderate">Moderate</option><option value="Severe">Severe</option><option value="Very Severe">Very Severe</option></select></div>
          <div><label className={labelCls}>Pain Score 0-10</label><input id="headacheScore" type="number" min="0" max="10" value={formData.headacheScore} onChange={handleChange} className={inputCls} /></div>
          <div><label className={labelCls}>Duration</label><input id="headacheDuration" value={formData.headacheDuration} onChange={handleChange} className={inputCls} /></div>
          <div><label className={labelCls}>Frequency</label><input id="headacheFrequency" value={formData.headacheFrequency} onChange={handleChange} className={inputCls} /></div>
          <div><label className={labelCls}>Time of Occurrence</label><select id="headacheTime" value={formData.headacheTime} onChange={handleChange} className={inputCls}><option value="">Select</option><option value="Morning">Morning</option><option value="Afternoon">Afternoon</option><option value="Evening">Evening</option><option value="Night">Night</option><option value="Any Time">Any Time</option></select></div>
          <div><label className={labelCls}>Onset</label><select id="headacheOnset" value={formData.headacheOnset} onChange={handleChange} className={inputCls}><option value="">Select</option><option value="Sudden">Sudden</option><option value="Gradual">Gradual</option><option value="Intermittent">Intermittent</option><option value="Continuous">Continuous</option></select></div>
        </div>

        <div className="p-4 bg-amber-50/40 rounded-xl border border-amber-100 space-y-3">
          <div className="font-bold text-base text-amber-900">Triggers</div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {['Stress','Lack of Sleep','Screen','Bright Light','Noise','Fasting','Heat','Cold','Exercise','Cough','Bending','Other'].map(item => (
              <button type="button" key={item} onClick={() => toggleChip('headacheTrigger', item)} className={chipCls(formData.headacheTrigger.includes(item))}>{item}</button>
            ))}
          </div>
        </div>

        <div className="p-4 bg-indigo-50/40 rounded-xl border border-indigo-100 space-y-3">
          <div className="font-bold text-base text-indigo-900">Associated Symptoms</div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {['Nausea','Vomiting','Photophobia','Phonophobia','Aura','Blurred Vision','Eye Pain','Dizziness','Neck Pain','Weakness','Numbness','Fever'].map(item => (
              <button type="button" key={item} onClick={() => toggleChip('headacheAssociated', item)} className={chipCls(formData.headacheAssociated.includes(item))}>{item}</button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div><label className={labelCls}>Relieving Factors</label><textarea id="headacheRelief" rows={2} value={formData.headacheRelief} onChange={handleChange} className={inputCls} /></div>
          <div><label className={labelCls}>Additional Details</label><textarea id="headacheDetails" rows={2} value={formData.headacheDetails} onChange={handleChange} className={inputCls} /></div>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-5">
        <h3 className="text-xl font-bold text-teal-800 border-b border-teal-100 pb-3 -mx-6 -mt-6 px-6 pt-5 bg-teal-50/40 rounded-t-2xl">4. Clinical Assessment</h3>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div><label className={labelCls}>Provisional Diagnosis</label><input id="diagnosis" value={formData.diagnosis} onChange={handleChange} className={inputCls} /></div>
          <div><label className={labelCls}>Affected Area</label><input id="affectedArea" value={formData.affectedArea} onChange={handleChange} className={inputCls} /></div>
          <div><label className={labelCls}>Severity</label><select id="clinicalSeverity" value={formData.clinicalSeverity} onChange={handleChange} className={inputCls}><option value="">Select</option><option value="Mild">Mild</option><option value="Moderate">Moderate</option><option value="Severe">Severe</option></select></div>
          <div><label className={labelCls}>Clinical Status</label><select id="clinicalStatus" value={formData.clinicalStatus} onChange={handleChange} className={inputCls}><option value="">Select</option><option value="New Case">New Case</option><option value="Improving">Improving</option><option value="Stable">Stable</option><option value="Worsening">Worsening</option></select></div>
          <div className="sm:col-span-3"><label className={labelCls}>Clinical Notes</label><textarea id="clinicalNotes" rows={2} value={formData.clinicalNotes} onChange={handleChange} className={inputCls} /></div>
          <div className="sm:col-span-2"><label className={labelCls}>Homeopathic Treatment</label><input id="treatment" value={formData.treatment} onChange={handleChange} className={inputCls} /></div>
          <div><label className={labelCls}>Advice</label><input id="advice" value={formData.advice} onChange={handleChange} className={inputCls} /></div>
          <div><label className={labelCls}>Follow-up Date</label><input id="followup" type="date" value={formData.followup} onChange={handleChange} className={inputCls} /></div>
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

      <span className="hidden"><Printer /></span>
    </div>
  );
};