import React, { useState, useEffect } from 'react';
import { useClinic } from '../../context/ClinicContext';
import {
  Baby, Save, CheckCircle2, RotateCcw, FileText, AlertTriangle, Loader2
} from 'lucide-react';

interface PedsFormData {
  patientName: string; age: string; sex: string; date: string; chiefComplaints: string;
  duration: string; severity: string; complaints: string[]; complaintDetails: string;
  breastfeeding: string; weaningAge: string; food: string[]; headControl: string;
  rolling: string; sitting: string; crawling: string; standing: string; walking: string;
  running: string; reaches: string; transfers: string; pincer: string; drawing: string;
  writing: string; cooing: string; babbling: string; firstWord: string; twoWords: string;
  sentences: string; currentSpeech: string; socialSmile: string; eyeContact: string;
  responseName: string; toiletTraining: string; selfFeeding: string;
  developmentConcerns: string[]; neuro: string[]; urine: string; bowel: string;
  sleep: string; immunization: string; birthWeight: string; deliveryMode: string;
  behaviourNotes: string; assessment: string; doctorNotes: string; followupDate: string;
}

const INITIAL: PedsFormData = {
  patientName: '', age: '', sex: 'Male', date: new Date().toISOString().split('T')[0],
  chiefComplaints: '', duration: '', severity: '', complaints: [], complaintDetails: '',
  breastfeeding: 'Exclusive', weaningAge: '6 months', food: [], headControl: '3 months',
  rolling: '5 months', sitting: '6-7 months', crawling: '8 months', standing: '10 months',
  walking: '12 months', running: '18 months', reaches: '4 months', transfers: '6 months',
  pincer: '9-10 months', drawing: '2.5 years', writing: '4 years', cooing: '3 months',
  babbling: '6 months', firstWord: '10-12 months', twoWords: '18-24 months',
  sentences: '3 years', currentSpeech: '', socialSmile: '2 months', eyeContact: 'Normal',
  responseName: 'Normal', toiletTraining: '', selfFeeding: '', developmentConcerns: [],
  neuro: [], urine: 'Normal', bowel: 'Normal', sleep: 'Normal', immunization: 'Complete / पूर्ण',
  birthWeight: '', deliveryMode: 'Normal Vaginal', behaviourNotes: '', assessment: '',
  doctorNotes: '', followupDate: ''
};

const inputCls = 'w-full border border-slate-300 rounded-lg p-3 text-base focus:ring-2 focus:ring-amber-500 focus:outline-none';
const labelCls = 'block font-bold text-slate-700 mb-1.5 text-base';
const chipCls = (active: boolean) => `flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm cursor-pointer border ${active ? 'bg-amber-50 border-amber-500 font-semibold' : 'bg-slate-50 border-transparent hover:border-slate-300'}`;

export const PediatricCaseForm: React.FC = () => {
  const { selectedPatient, patients, selectPatient, saveSystemForm, systemForms, setActiveTab } = useClinic();
  const [formData, setFormData] = useState<PedsFormData>(INITIAL);
  const [statusMessage, setStatusMessage] = useState('');
  const [statusType, setStatusType] = useState<'success' | 'error' | 'info'>('info');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!selectedPatient) return;
    const existing = systemForms.find(f => f.patientId === selectedPatient.id && f.system === 'pediatric');
    if (existing && existing.data && Object.keys(existing.data).length > 0) {
      setFormData({
        ...INITIAL, ...(existing.data as Partial<PedsFormData>),
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

  const toggleArray = (key: keyof PedsFormData, value: string) => {
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
        patientId: selectedPatient.id, system: 'pediatric',
        chiefComplaints: formData.chiefComplaints || 'Pediatric case',
        duration: formData.duration || 'Not specified',
        severity: formData.severity === 'Severe' ? 'Severe' : formData.severity === 'Mild' ? 'Mild' : 'Moderate',
        modalitiesAggravation: '', modalitiesAmelioration: '',
        concomitants: formData.food.join(', '),
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
    setFormData({ ...INITIAL, patientName: selectedPatient.name, age: String(selectedPatient.age || ''), sex: selectedPatient.gender, date: new Date().toISOString().split('T')[0] });
    setStatusMessage('Cleared'); setStatusType('info');
    setTimeout(() => setStatusMessage(''), 2000);
  };

  return (
    <div className="space-y-6 pb-28 max-w-6xl mx-auto text-base">
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-amber-50 border border-amber-200 flex items-center justify-center text-amber-700"><Baby className="w-6 h-6" /></div>
          <div>
            <span className="text-sm uppercase font-bold text-amber-800 tracking-wider">Pediatric Form</span>
            <h2 className="text-2xl font-bold text-slate-900 font-serif">Pediatric Case Taking</h2>
            <p className="text-base text-slate-500">Active: <strong>{selectedPatient?.name}</strong></p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <select value={selectedPatient?.id || ''} onChange={e => selectPatient(e.target.value)} className="px-4 py-2 bg-slate-50 border border-slate-300 rounded-xl text-base">
            {patients.map(p => <option key={p.id} value={p.id}>{p.name} ({p.patientCode ?? p.id})</option>)}
          </select>
          <button type="button" onClick={() => setActiveTab('case_summary')} className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-base rounded-xl flex items-center gap-2">
            <FileText className="w-5 h-5 text-amber-700" />Summary
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
        <h3 className="text-xl font-bold text-amber-800 border-b border-amber-100 pb-3 -mx-6 -mt-6 px-6 pt-5 bg-amber-50/40 rounded-t-2xl">1. Child Information</h3>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div><label className={labelCls}>Name</label><input id="patientName" value={formData.patientName} onChange={handleChange} className={inputCls} /></div>
          <div><label className={labelCls}>Age</label><input id="age" value={formData.age} onChange={handleChange} className={inputCls} /></div>
          <div><label className={labelCls}>Sex</label><select id="sex" value={formData.sex} onChange={handleChange} className={inputCls}><option value="Male">Male</option><option value="Female">Female</option><option value="Other">Other</option></select></div>
          <div><label className={labelCls}>Date</label><input id="date" type="date" value={formData.date} onChange={handleChange} className={inputCls} /></div>
          <div><label className={labelCls}>Birth Weight</label><input id="birthWeight" value={formData.birthWeight} onChange={handleChange} className={inputCls} /></div>
          <div><label className={labelCls}>Delivery Mode</label><select id="deliveryMode" value={formData.deliveryMode} onChange={handleChange} className={inputCls}><option value="Normal Vaginal">Normal Vaginal</option><option value="LSCS">LSCS</option><option value="Assisted">Assisted</option></select></div>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-5">
        <h3 className="text-xl font-bold text-amber-800 border-b border-amber-100 pb-3 -mx-6 -mt-6 px-6 pt-5 bg-amber-50/40 rounded-t-2xl">2. Chief Complaints</h3>
        <div><label className={labelCls}>Main complaint</label><textarea id="chiefComplaints" rows={2} value={formData.chiefComplaints} onChange={handleChange} className={inputCls} /></div>
        <div>
          <label className={labelCls}>Quick Complaints</label>
          <div className="flex flex-wrap gap-2">
            {['Fever','Cough','Cold','Allergy','Asthma','Skin problem','Digestive','Constipation','Bedwetting','Headache','Delayed development','ADHD'].map(item => (
              <label key={item} className={chipCls(formData.complaints.includes(item))}>
                <input type="checkbox" checked={formData.complaints.includes(item)} onChange={() => toggleArray('complaints', item)} className="accent-amber-600 w-4 h-4" /><span>{item}</span>
              </label>
            ))}
          </div>
        </div>
        <div><label className={labelCls}>Complaint Details</label><textarea id="complaintDetails" rows={2} value={formData.complaintDetails} onChange={handleChange} className={inputCls} /></div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div><label className={labelCls}>Duration</label><input id="duration" value={formData.duration} onChange={handleChange} className={inputCls} /></div>
          <div><label className={labelCls}>Severity</label><select id="severity" value={formData.severity} onChange={handleChange} className={inputCls}><option value="">Select</option><option value="Mild">Mild</option><option value="Moderate">Moderate</option><option value="Severe">Severe</option></select></div>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-5">
        <h3 className="text-xl font-bold text-amber-800 border-b border-amber-100 pb-3 -mx-6 -mt-6 px-6 pt-5 bg-amber-50/40 rounded-t-2xl">3. Developmental Milestones</h3>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {[
            { id: 'headControl', label: 'Head Control' },{ id: 'rolling', label: 'Rolling' },
            { id: 'sitting', label: 'Sitting' },{ id: 'crawling', label: 'Crawling' },
            { id: 'standing', label: 'Standing' },{ id: 'walking', label: 'Walking' },
            { id: 'running', label: 'Running' },{ id: 'reaches', label: 'Reaches Object' },
            { id: 'pincer', label: 'Pincer Grasp' },{ id: 'firstWord', label: 'First Word' },
            { id: 'twoWords', label: 'Two-word Phrase' },{ id: 'sentences', label: 'Simple Sentences' }
          ].map(f => (
            <div key={f.id}><label className={labelCls}>{f.label}</label><input id={f.id} value={(formData as any)[f.id]} onChange={handleChange} className={inputCls} /></div>
          ))}
        </div>
        <div>
          <label className={labelCls}>Developmental Concerns</label>
          <div className="flex flex-wrap gap-2">
            {['No delay / विलंब नाही','Gross motor delay','Fine motor delay','Speech delay','Social delay','Global delay'].map(item => (
              <label key={item} className={chipCls(formData.developmentConcerns.includes(item))}>
                <input type="checkbox" checked={formData.developmentConcerns.includes(item)} onChange={() => toggleArray('developmentConcerns', item)} className="accent-amber-600 w-4 h-4" /><span>{item}</span>
              </label>
            ))}
          </div>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-5">
        <h3 className="text-xl font-bold text-amber-800 border-b border-amber-100 pb-3 -mx-6 -mt-6 px-6 pt-5 bg-amber-50/40 rounded-t-2xl">4. Behaviour &amp; Development</h3>
        <div>
          <label className={labelCls}>Neuro / Behaviour Flags</label>
          <div className="flex flex-wrap gap-2">
            {['Hyperactivity','Inattention','Impulsivity','Speech delay','Poor eye contact','Repetitive behaviour','Sleep problem','Learning difficulty'].map(item => (
              <label key={item} className={chipCls(formData.neuro.includes(item))}>
                <input type="checkbox" checked={formData.neuro.includes(item)} onChange={() => toggleArray('neuro', item)} className="accent-amber-600 w-4 h-4" /><span>{item}</span>
              </label>
            ))}
          </div>
        </div>
        <div><label className={labelCls}>Behaviour Notes</label><textarea id="behaviourNotes" rows={2} value={formData.behaviourNotes} onChange={handleChange} className={inputCls} /></div>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-5">
        <h3 className="text-xl font-bold text-amber-800 border-b border-amber-100 pb-3 -mx-6 -mt-6 px-6 pt-5 bg-amber-50/40 rounded-t-2xl">5. Daily Habits &amp; History</h3>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div><label className={labelCls}>Urine</label><select id="urine" value={formData.urine} onChange={handleChange} className={inputCls}><option value="Normal">Normal</option><option value="Bedwetting">Bedwetting</option><option value="Daytime wetting">Daytime wetting</option></select></div>
          <div><label className={labelCls}>Bowel</label><select id="bowel" value={formData.bowel} onChange={handleChange} className={inputCls}><option value="Normal">Normal</option><option value="Constipation">Constipation</option><option value="Loose stools">Loose stools</option></select></div>
          <div><label className={labelCls}>Sleep</label><select id="sleep" value={formData.sleep} onChange={handleChange} className={inputCls}><option value="Normal">Normal</option><option value="Restless">Restless</option><option value="Night waking">Night waking</option></select></div>
          <div><label className={labelCls}>Immunization</label><select id="immunization" value={formData.immunization} onChange={handleChange} className={inputCls}><option value="Complete / पूर्ण">Complete</option><option value="Incomplete / अपूर्ण">Incomplete</option><option value="Unknown">Unknown</option></select></div>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-5">
        <h3 className="text-xl font-bold text-amber-800 border-b border-amber-100 pb-3 -mx-6 -mt-6 px-6 pt-5 bg-amber-50/40 rounded-t-2xl">6. Assessment &amp; Plan</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div><label className={labelCls}>Clinical Assessment</label><textarea id="assessment" rows={2} value={formData.assessment} onChange={handleChange} className={inputCls} /></div>
          <div><label className={labelCls}>Follow-up Date</label><input id="followupDate" type="date" value={formData.followupDate} onChange={handleChange} className={inputCls} /></div>
          <div className="sm:col-span-2"><label className={labelCls}>Doctor Notes</label><textarea id="doctorNotes" rows={2} value={formData.doctorNotes} onChange={handleChange} className={inputCls} /></div>
        </div>
      </div>

      <div className="sticky bottom-0 bg-white/95 backdrop-blur-xs p-4 rounded-2xl border border-slate-200 shadow-lg flex items-center justify-center gap-3 z-30">
        <button type="button" onClick={handleSave} disabled={saving} className="px-6 py-3 bg-amber-700 hover:bg-amber-800 disabled:opacity-60 text-white font-bold text-base rounded-xl shadow-xs flex items-center gap-2">
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