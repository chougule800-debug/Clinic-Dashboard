import React, { useState, useEffect } from 'react';
import { useClinic } from '../../context/ClinicContext';
import {
  HeartHandshake, Save, CheckCircle2, RotateCcw, FileText, AlertTriangle, Loader2
} from 'lucide-react';

interface GynaeFormData {
  patientName: string; age: string; sex: string; date: string; chiefComplaints: string;
  duration: string; severity: string; menarcheAge: string; lmp: string; cycle: string;
  cycleLength: string; flow: string; durationPeriod: string; mfeatures: string[];
  pain: string[]; gravida: string; para: string; abortions: string; living: string;
  gyn: string[]; dischargeCharacter: string; pcos: string; infertilityType: string;
  infertilityYears: string; assessment: string; treatment: string; followup: string;
  doctorNotes: string;
}

const INITIAL: GynaeFormData = {
  patientName: '', age: '', sex: 'Female', date: new Date().toISOString().split('T')[0],
  chiefComplaints: '', duration: '', severity: '', menarcheAge: '', lmp: '', cycle: 'Regular / नियमित',
  cycleLength: '28', flow: 'Normal', durationPeriod: '4', mfeatures: [], pain: [],
  gravida: '0', para: '0', abortions: '0', living: '0', gyn: [], dischargeCharacter: '',
  pcos: 'No / नाही', infertilityType: 'Not applicable / लागू नाही', infertilityYears: '',
  assessment: '', treatment: '', followup: '', doctorNotes: ''
};

const inputCls = 'w-full border border-slate-300 rounded-lg p-3 text-base focus:ring-2 focus:ring-pink-500 focus:outline-none';
const labelCls = 'block font-bold text-slate-700 mb-1.5 text-base';
const chipCls = (active: boolean) => `flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm cursor-pointer border ${active ? 'bg-pink-50 border-pink-500 font-semibold' : 'bg-slate-50 border-transparent hover:border-slate-300'}`;
const chipRoseCls = (active: boolean) => `flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm cursor-pointer border ${active ? 'bg-rose-50 border-rose-500 font-semibold' : 'bg-slate-50 border-transparent hover:border-slate-300'}`;

export const FemaleGynaeCaseForm: React.FC = () => {
  const { selectedPatient, patients, selectPatient, saveSystemForm, systemForms, setActiveTab } = useClinic();
  const [formData, setFormData] = useState<GynaeFormData>(INITIAL);
  const [statusMessage, setStatusMessage] = useState('');
  const [statusType, setStatusType] = useState<'success' | 'error' | 'info'>('info');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!selectedPatient) return;
    const existing = systemForms.find(f => f.patientId === selectedPatient.id && f.system === 'female_gynae');
    if (existing && existing.data && Object.keys(existing.data).length > 0) {
      setFormData({
        ...INITIAL, ...(existing.data as Partial<GynaeFormData>),
        patientName: selectedPatient.name, age: String(selectedPatient.age || ''),
        date: (existing.data as any).date || new Date().toISOString().split('T')[0]
      });
    } else {
      setFormData({ ...INITIAL, patientName: selectedPatient.name, age: String(selectedPatient.age || ''), date: new Date().toISOString().split('T')[0] });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedPatient?.id, systemForms]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setFormData(prev => ({ ...prev, [e.target.id]: e.target.value }));
  };

  const toggleArray = (key: keyof GynaeFormData, value: string) => {
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
        patientId: selectedPatient.id, system: 'female_gynae',
        chiefComplaints: formData.chiefComplaints || 'Gynecological complaint',
        duration: formData.duration || 'Not specified',
        severity: formData.severity === 'Severe' ? 'Severe' : formData.severity === 'Mild' ? 'Mild' : 'Moderate',
        modalitiesAggravation: formData.pain.join(', '),
        modalitiesAmelioration: 'Warmth, rest',
        concomitants: formData.dischargeCharacter,
        clinicalNotes: formData.doctorNotes || formData.assessment,
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
    setFormData({ ...INITIAL, patientName: selectedPatient.name, age: String(selectedPatient.age || ''), date: new Date().toISOString().split('T')[0] });
    setStatusMessage('Cleared'); setStatusType('info');
    setTimeout(() => setStatusMessage(''), 2000);
  };

  return (
    <div className="space-y-6 pb-28 max-w-6xl mx-auto text-base">
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-pink-50 border border-pink-200 flex items-center justify-center text-pink-700"><HeartHandshake className="w-6 h-6" /></div>
          <div>
            <span className="text-sm uppercase font-bold text-pink-800 tracking-wider">Female / Gynae Form</span>
            <h2 className="text-2xl font-bold text-slate-900 font-serif">Female &amp; Gynecological Case Taking</h2>
            <p className="text-base text-slate-500">Active: <strong>{selectedPatient?.name}</strong></p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <select value={selectedPatient?.id || ''} onChange={e => selectPatient(e.target.value)} className="px-4 py-2 bg-slate-50 border border-slate-300 rounded-xl text-base">
            {patients.map(p => <option key={p.id} value={p.id}>{p.name} ({p.patientCode ?? p.id})</option>)}
          </select>
          <button type="button" onClick={() => setActiveTab('case_summary')} className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-base rounded-xl flex items-center gap-2">
            <FileText className="w-5 h-5 text-pink-700" />Summary
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
        <h3 className="text-xl font-bold text-pink-800 border-b border-pink-100 pb-3 -mx-6 -mt-6 px-6 pt-5 bg-pink-50/40 rounded-t-2xl">1. Patient Information</h3>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div><label className={labelCls}>Name</label><input id="patientName" value={formData.patientName} onChange={handleChange} className={inputCls} /></div>
          <div><label className={labelCls}>Age</label><input id="age" value={formData.age} onChange={handleChange} className={inputCls} /></div>
          <div><label className={labelCls}>Date</label><input id="date" type="date" value={formData.date} onChange={handleChange} className={inputCls} /></div>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-5">
        <h3 className="text-xl font-bold text-pink-800 border-b border-pink-100 pb-3 -mx-6 -mt-6 px-6 pt-5 bg-pink-50/40 rounded-t-2xl">2. Chief Complaints</h3>
        <div><label className={labelCls}>Main complaint</label><textarea id="chiefComplaints" rows={2} value={formData.chiefComplaints} onChange={handleChange} className={inputCls} /></div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div><label className={labelCls}>Duration</label><input id="duration" value={formData.duration} onChange={handleChange} className={inputCls} /></div>
          <div><label className={labelCls}>Severity</label><select id="severity" value={formData.severity} onChange={handleChange} className={inputCls}><option value="">Select</option><option value="Mild">Mild</option><option value="Moderate">Moderate</option><option value="Severe">Severe</option></select></div>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-5">
        <h3 className="text-xl font-bold text-pink-800 border-b border-pink-100 pb-3 -mx-6 -mt-6 px-6 pt-5 bg-pink-50/40 rounded-t-2xl">3. Menstrual History</h3>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div><label className={labelCls}>Menarche Age</label><input id="menarcheAge" value={formData.menarcheAge} onChange={handleChange} className={inputCls} /></div>
          <div><label className={labelCls}>LMP</label><input id="lmp" type="date" value={formData.lmp} onChange={handleChange} className={inputCls} /></div>
          <div><label className={labelCls}>Cycle Pattern</label><select id="cycle" value={formData.cycle} onChange={handleChange} className={inputCls}><option value="Regular / नियमित">Regular</option><option value="Irregular / अनियमित">Irregular</option><option value="Absent / अनुपस्थित">Absent</option></select></div>
          <div><label className={labelCls}>Cycle Length (days)</label><input id="cycleLength" value={formData.cycleLength} onChange={handleChange} className={inputCls} /></div>
          <div><label className={labelCls}>Duration of Flow</label><input id="durationPeriod" value={formData.durationPeriod} onChange={handleChange} className={inputCls} /></div>
          <div><label className={labelCls}>Flow</label><select id="flow" value={formData.flow} onChange={handleChange} className={inputCls}><option value="Normal">Normal</option><option value="Scanty / कमी">Scanty</option><option value="Moderate / मध्यम">Moderate</option><option value="Heavy / जास्त">Heavy</option></select></div>
        </div>
        <div>
          <label className={labelCls}>Menstrual Features</label>
          <div className="flex flex-wrap gap-2">
            {['Clots','Dark blood','Spotting','PMS','Intermenstrual bleeding','Amenorrhea'].map(item => (
              <label key={item} className={chipCls(formData.mfeatures.includes(item))}>
                <input type="checkbox" checked={formData.mfeatures.includes(item)} onChange={() => toggleArray('mfeatures', item)} className="accent-pink-600 w-4 h-4" /><span>{item}</span>
              </label>
            ))}
          </div>
        </div>
        <div>
          <label className={labelCls}>Dysmenorrhea</label>
          <div className="flex flex-wrap gap-2">
            {['No pain','Before menses','During menses','After menses','Cramping','Backache'].map(item => (
              <label key={item} className={chipRoseCls(formData.pain.includes(item))}>
                <input type="checkbox" checked={formData.pain.includes(item)} onChange={() => toggleArray('pain', item)} className="accent-rose-600 w-4 h-4" /><span>{item}</span>
              </label>
            ))}
          </div>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-5">
        <h3 className="text-xl font-bold text-pink-800 border-b border-pink-100 pb-3 -mx-6 -mt-6 px-6 pt-5 bg-pink-50/40 rounded-t-2xl">4. Obstetric History</h3>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {[
            { id: 'gravida', label: 'Gravida (G)' },
            { id: 'para', label: 'Para (P)' },
            { id: 'abortions', label: 'Abortions (A)' },
            { id: 'living', label: 'Living (L)' }
          ].map(f => (
            <div key={f.id}><label className={labelCls}>{f.label}</label><input id={f.id} type="number" min="0" value={(formData as any)[f.id]} onChange={handleChange} className={inputCls} /></div>
          ))}
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-5">
        <h3 className="text-xl font-bold text-pink-800 border-b border-pink-100 pb-3 -mx-6 -mt-6 px-6 pt-5 bg-pink-50/40 rounded-t-2xl">5. Gynecological History</h3>
        <div>
          <label className={labelCls}>Symptoms</label>
          <div className="flex flex-wrap gap-2">
            {['Vaginal discharge','Itching','Burning','Pelvic pain','Dyspareunia','PCOS/PCOD','Fibroid','Endometriosis','Ovarian cyst','PID','Cervical problem'].map(item => (
              <label key={item} className={chipCls(formData.gyn.includes(item))}>
                <input type="checkbox" checked={formData.gyn.includes(item)} onChange={() => toggleArray('gyn', item)} className="accent-pink-600 w-4 h-4" /><span>{item}</span>
              </label>
            ))}
          </div>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div><label className={labelCls}>Discharge Character</label><input id="dischargeCharacter" value={formData.dischargeCharacter} onChange={handleChange} className={inputCls} /></div>
          <div><label className={labelCls}>PCOS / PCOD</label><select id="pcos" value={formData.pcos} onChange={handleChange} className={inputCls}><option value="No / नाही">No</option><option value="Yes / होय">Yes</option><option value="Under Evaluation">Under Evaluation</option></select></div>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-5">
        <h3 className="text-xl font-bold text-pink-800 border-b border-pink-100 pb-3 -mx-6 -mt-6 px-6 pt-5 bg-pink-50/40 rounded-t-2xl">6. Infertility &amp; Plan</h3>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div><label className={labelCls}>Infertility Type</label><select id="infertilityType" value={formData.infertilityType} onChange={handleChange} className={inputCls}><option value="Not applicable / लागू नाही">Not applicable</option><option value="Primary / प्राथमिक">Primary</option><option value="Secondary / दुय्यम">Secondary</option></select></div>
          <div><label className={labelCls}>Duration (years)</label><input id="infertilityYears" value={formData.infertilityYears} onChange={handleChange} className={inputCls} /></div>
          <div><label className={labelCls}>Follow-up</label><input id="followup" type="date" value={formData.followup} onChange={handleChange} className={inputCls} /></div>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div><label className={labelCls}>Assessment</label><textarea id="assessment" rows={2} value={formData.assessment} onChange={handleChange} className={inputCls} /></div>
          <div><label className={labelCls}>Homeopathic Treatment</label><textarea id="treatment" rows={2} value={formData.treatment} onChange={handleChange} className={inputCls} /></div>
          <div className="sm:col-span-2"><label className={labelCls}>Doctor Notes</label><textarea id="doctorNotes" rows={2} value={formData.doctorNotes} onChange={handleChange} className={inputCls} /></div>
        </div>
      </div>

      <div className="sticky bottom-0 bg-white/95 backdrop-blur-xs p-4 rounded-2xl border border-slate-200 shadow-lg flex items-center justify-center gap-3 z-30">
        <button type="button" onClick={handleSave} disabled={saving} className="px-6 py-3 bg-pink-700 hover:bg-pink-800 disabled:opacity-60 text-white font-bold text-base rounded-xl shadow-xs flex items-center gap-2">
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