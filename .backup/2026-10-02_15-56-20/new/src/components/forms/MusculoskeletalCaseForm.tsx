import React, { useState, useEffect } from 'react';
import { useClinic } from '../../context/ClinicContext';
import {
  Bone, Save, CheckCircle2, RotateCcw, FileText, AlertTriangle, Loader2
} from 'lucide-react';

interface MSKFormData {
  patientName: string; age: string; sex: string; date: string; chiefComplaints: string;
  duration: string; severity: string; jointsAffected: string[]; painCharacter: string[];
  motionAggravation: string; weatherAggravation: string; relievingFactors: string[];
  physicalExam: string; radiology: string; redFlags: string[]; assessment: string;
  plan: string; followup: string; notes: string;
}

const INITIAL: MSKFormData = {
  patientName: '', age: '', sex: '', date: new Date().toISOString().split('T')[0],
  chiefComplaints: '', duration: '', severity: '', jointsAffected: [], painCharacter: [],
  motionAggravation: '', weatherAggravation: '', relievingFactors: [], physicalExam: '',
  radiology: '', redFlags: [], assessment: '', plan: '', followup: '', notes: ''
};

const inputCls = 'w-full border border-slate-300 rounded-lg p-3 text-base focus:ring-2 focus:ring-emerald-500 focus:outline-none';
const labelCls = 'block font-bold text-slate-700 mb-1.5 text-base';
const chipCls = (active: boolean) => `flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm cursor-pointer border ${active ? 'bg-emerald-50 border-emerald-500 font-semibold' : 'bg-slate-50 border-transparent hover:border-slate-300'}`;
const chipRoseCls = (active: boolean) => `flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm cursor-pointer border ${active ? 'bg-rose-100 border-rose-500 font-semibold text-rose-900' : 'bg-slate-50 border-transparent hover:border-slate-300'}`;

export const MusculoskeletalCaseForm: React.FC = () => {
  const { selectedPatient, patients, selectPatient, saveSystemForm, systemForms, setActiveTab } = useClinic();
  const [formData, setFormData] = useState<MSKFormData>(INITIAL);
  const [statusMessage, setStatusMessage] = useState('');
  const [statusType, setStatusType] = useState<'success' | 'error' | 'info'>('info');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!selectedPatient) return;
    const existing = systemForms.find(f => f.patientId === selectedPatient.id && f.system === 'musculoskeletal');
    if (existing && existing.data && Object.keys(existing.data).length > 0) {
      setFormData({
        ...INITIAL, ...(existing.data as Partial<MSKFormData>),
        patientName: selectedPatient.name, age: String(selectedPatient.age || ''),
        sex: selectedPatient.gender,
        date: (existing.data as any).date || new Date().toISOString().split('T')[0]
      });
    } else {
      setFormData({ ...INITIAL, patientName: selectedPatient.name, age: String(selectedPatient.age || ''), sex: selectedPatient.gender, date: new Date().toISOString().split('T')[0] });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedPatient?.id, systemForms]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setFormData(prev => ({ ...prev, [e.target.id]: e.target.value }));
  };

  const toggleArray = (key: keyof MSKFormData, value: string) => {
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
        patientId: selectedPatient.id, system: 'musculoskeletal',
        chiefComplaints: formData.chiefComplaints || 'MSK complaint',
        duration: formData.duration || 'Not specified',
        severity: formData.severity === 'Severe' ? 'Severe' : formData.severity === 'Mild' ? 'Mild' : 'Moderate',
        modalitiesAggravation: formData.motionAggravation || formData.weatherAggravation,
        modalitiesAmelioration: formData.relievingFactors.join(', '),
        concomitants: '', clinicalNotes: formData.notes || formData.assessment,
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
          <div className="w-12 h-12 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-700"><Bone className="w-6 h-6" /></div>
          <div>
            <span className="text-sm uppercase font-bold text-emerald-800 tracking-wider">Musculoskeletal Form</span>
            <h2 className="text-2xl font-bold text-slate-900 font-serif">MSK &amp; Spine Case Taking</h2>
            <p className="text-base text-slate-500">Active: <strong>{selectedPatient?.name}</strong></p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <select value={selectedPatient?.id || ''} onChange={e => selectPatient(e.target.value)} className="px-4 py-2 bg-slate-50 border border-slate-300 rounded-xl text-base">
            {patients.map(p => <option key={p.id} value={p.id}>{p.name} ({p.patientCode ?? p.id})</option>)}
          </select>
          <button type="button" onClick={() => setActiveTab('case_summary')} className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-base rounded-xl flex items-center gap-2">
            <FileText className="w-5 h-5 text-emerald-700" />Summary
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
        <h3 className="text-xl font-bold text-emerald-800 border-b border-emerald-100 pb-3 -mx-6 -mt-6 px-6 pt-5 bg-emerald-50/40 rounded-t-2xl">1. Patient Information</h3>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div><label className={labelCls}>Name</label><input id="patientName" value={formData.patientName} onChange={handleChange} className={inputCls} /></div>
          <div><label className={labelCls}>Age</label><input id="age" value={formData.age} onChange={handleChange} className={inputCls} /></div>
          <div><label className={labelCls}>Sex</label><select id="sex" value={formData.sex} onChange={handleChange} className={inputCls}><option value="">Select</option><option value="Male">Male</option><option value="Female">Female</option><option value="Other">Other</option></select></div>
          <div><label className={labelCls}>Date</label><input id="date" type="date" value={formData.date} onChange={handleChange} className={inputCls} /></div>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-5">
        <h3 className="text-xl font-bold text-emerald-800 border-b border-emerald-100 pb-3 -mx-6 -mt-6 px-6 pt-5 bg-emerald-50/40 rounded-t-2xl">2. Chief Complaints</h3>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="sm:col-span-3"><label className={labelCls}>Main complaint</label><textarea id="chiefComplaints" rows={2} value={formData.chiefComplaints} onChange={handleChange} className={inputCls} /></div>
          <div><label className={labelCls}>Duration</label><input id="duration" value={formData.duration} onChange={handleChange} className={inputCls} /></div>
          <div><label className={labelCls}>Severity</label><select id="severity" value={formData.severity} onChange={handleChange} className={inputCls}><option value="">Select</option><option value="Mild">Mild</option><option value="Moderate">Moderate</option><option value="Severe">Severe</option></select></div>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-5">
        <h3 className="text-xl font-bold text-emerald-800 border-b border-emerald-100 pb-3 -mx-6 -mt-6 px-6 pt-5 bg-emerald-50/40 rounded-t-2xl">3. Joints &amp; Modalities</h3>

        <div>
          <label className={labelCls}>Joints / Regions Affected</label>
          <div className="flex flex-wrap gap-2">
            {['Cervical spine','Lumbar spine','Knee joints','Small joints of fingers','Shoulder joint','Heel / Plantar fascia','Hip','Ankle','Elbow'].map(item => (
              <label key={item} className={chipCls(formData.jointsAffected.includes(item))}>
                <input type="checkbox" checked={formData.jointsAffected.includes(item)} onChange={() => toggleArray('jointsAffected', item)} className="accent-emerald-600 w-4 h-4" /><span>{item}</span>
              </label>
            ))}
          </div>
        </div>

        <div>
          <label className={labelCls}>Pain Character</label>
          <div className="flex flex-wrap gap-2">
            {['Stiffness with soreness','Stitching aggravated by movement','Aching bruised pain','Burning','Numbness / tingling','Cramping spasms'].map(item => (
              <label key={item} className={chipCls(formData.painCharacter.includes(item))}>
                <input type="checkbox" checked={formData.painCharacter.includes(item)} onChange={() => toggleArray('painCharacter', item)} className="accent-emerald-600 w-4 h-4" /><span>{item}</span>
              </label>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div><label className={labelCls}>Motion Aggravation / Relief</label><textarea id="motionAggravation" rows={2} value={formData.motionAggravation} onChange={handleChange} placeholder="e.g. Worse first motion, better continued motion (Rhus Tox)" className={inputCls} /></div>
          <div><label className={labelCls}>Weather Modalities</label><textarea id="weatherAggravation" rows={2} value={formData.weatherAggravation} onChange={handleChange} placeholder="e.g. Worse cold damp weather" className={inputCls} /></div>
        </div>

        <div>
          <label className={labelCls}>Relieving Factors</label>
          <div className="flex flex-wrap gap-2">
            {['Rest','Movement','Warmth','Massage','Pressure','Stretching'].map(item => (
              <label key={item} className={chipCls(formData.relievingFactors.includes(item))}>
                <input type="checkbox" checked={formData.relievingFactors.includes(item)} onChange={() => toggleArray('relievingFactors', item)} className="accent-emerald-600 w-4 h-4" /><span>{item}</span>
              </label>
            ))}
          </div>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-5">
        <h3 className="text-xl font-bold text-emerald-800 border-b border-emerald-100 pb-3 -mx-6 -mt-6 px-6 pt-5 bg-emerald-50/40 rounded-t-2xl">4. Examination &amp; Assessment</h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div><label className={labelCls}>Physical Exam / ROM</label><textarea id="physicalExam" rows={2} value={formData.physicalExam} onChange={handleChange} className={inputCls} /></div>
          <div><label className={labelCls}>X-Ray / MRI / Labs</label><textarea id="radiology" rows={2} value={formData.radiology} onChange={handleChange} className={inputCls} /></div>
        </div>

        <div>
          <label className={labelCls}>Red Flags</label>
          <div className="flex flex-wrap gap-2">
            {['Sudden limb weakness','Progressive weakness','Bladder control loss','Bowel control loss','Perineal numbness','Major trauma','Fever with back pain','Weight loss'].map(item => (
              <label key={item} className={chipRoseCls(formData.redFlags.includes(item))}>
                <input type="checkbox" checked={formData.redFlags.includes(item)} onChange={() => toggleArray('redFlags', item)} className="accent-rose-600 w-4 h-4" /><span>{item}</span>
              </label>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div><label className={labelCls}>Assessment / Provisional Diagnosis</label><textarea id="assessment" rows={2} value={formData.assessment} onChange={handleChange} className={inputCls} /></div>
          <div><label className={labelCls}>Homeopathic Plan</label><textarea id="plan" rows={2} value={formData.plan} onChange={handleChange} className={inputCls} /></div>
          <div><label className={labelCls}>Follow-up Date</label><input id="followup" type="date" value={formData.followup} onChange={handleChange} className={inputCls} /></div>
          <div><label className={labelCls}>Notes</label><textarea id="notes" rows={2} value={formData.notes} onChange={handleChange} className={inputCls} /></div>
        </div>
      </div>

      <div className="sticky bottom-0 bg-white/95 backdrop-blur-xs p-4 rounded-2xl border border-slate-200 shadow-lg flex items-center justify-center gap-3 z-30">
        <button type="button" onClick={handleSave} disabled={saving} className="px-6 py-3 bg-emerald-700 hover:bg-emerald-800 disabled:opacity-60 text-white font-bold text-base rounded-xl shadow-xs flex items-center gap-2">
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