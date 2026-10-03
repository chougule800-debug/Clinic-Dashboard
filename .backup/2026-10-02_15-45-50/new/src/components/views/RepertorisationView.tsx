import React, { useState, useEffect, useRef, useMemo } from 'react';
import Markdown from 'react-markdown';
import { useClinic } from '../../context/ClinicContext';
import { repertoryService, type RepertoryAnalysisRow } from '../../lib/services/repertory';
import { isMeaningful, displayValue } from '../../lib/utils';
import type { RepertorySymptom } from '../../types';
import {
  Brain, Sparkles, Mic, MicOff, RotateCcw, Save, Copy, Printer, FileText,
  Loader2, CheckCircle2, AlertCircle, Trash2, ChevronRight, ArrowLeft,
  Edit3, Pill, Clock, Check, X, User, Stethoscope
} from 'lucide-react';

const MENTAL_CHIPS = [
  'Anxiety / Panic','Fear of Death / Disease','Restlessness','Irritability / Anger',
  'Weeping Tendency','Fastidious / Perfectionist','Depression / Grief','Hurry / Impatient',
  'Anticipation Anxiety','Obstinate / Stubborn'
];

const PHYSICAL_CHIPS = [
  'Chilly Patient','Hot Patient','Thirstless','Thirsty Large Quantities','Craving Sweets',
  'Craving Salt','Craving Spicy / Sour','Aversion Milk / Meat','Open Air Ameliorates',
  'Warmth Ameliorates','Morning Aggravation','Evening / Night Aggravation',
  'Motion Aggravates','Motion Ameliorates'
];

const METHODS = [
  'Hahnemann Approach','Kent Repertory','Boger Repertory','BTPB (Boenninghausen)',
  'Boericke Repertory',"Murphy's Repertory","Phatak's Concise Repertory",
  'Synthesis Repertory','Complete Repertory','Nash & Allen Keynotes',
  'Dr. Rajan Sankaran','Dr. Vithal Das'
];

const IGNORE_KEYS = new Set([
  'date','patientName','name','age','sex','gender','mobile','phone','address',
  'occupation','marital','savedAt','acnePhoto','photo1','photo2','photo3','photo4','photo5',
  'reportFiles','system','patientId','updatedAt','submittedVia'
]);

const labelFor = (k: string) => {
  const spaced = k.replace(/([A-Z])/g, ' $1').replace(/_/g, ' ').trim();
  return spaced.charAt(0).toUpperCase() + spaced.slice(1);
};

export const RepertorisationView: React.FC = () => {
  const { selectedPatient, currentUser, systemForms } = useClinic();

  const [activePage, setActivePage] = useState<'main' | 'history'>('main');
  const [patientName, setPatientName] = useState('');
  const [patientAge, setPatientAge] = useState('');
  const [patientGender, setPatientGender] = useState('');
  const [remedyGiven, setRemedyGiven] = useState('');

  const [selectedMentalChips, setSelectedMentalChips] = useState<string[]>([]);
  const [mentalText, setMentalText] = useState('');
  const [selectedPhysicalChips, setSelectedPhysicalChips] = useState<string[]>([]);
  const [physicalText, setPhysicalText] = useState('');

  const [sym1, setSym1] = useState('');
  const [sym2, setSym2] = useState('');
  const [sym3, setSym3] = useState('');
  const [sym4, setSym4] = useState('');
  const [sym5, setSym5] = useState('');
  const [sym5Chilly, setSym5Chilly] = useState(false);
  const [sym5Hot, setSym5Hot] = useState(false);
  const [sym5Right, setSym5Right] = useState(false);
  const [sym5Left, setSym5Left] = useState(false);

  const [isRecording, setIsRecording] = useState(false);
  const speechRef = useRef<any>(null);

  const [activeMethod, setActiveMethod] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [output, setOutput] = useState('');
  const [methodBadge, setMethodBadge] = useState('Ready');
  const [saveStatus, setSaveStatus] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [toast, setToast] = useState<string | null>(null);

  const [analyses, setAnalyses] = useState<RepertoryAnalysisRow[]>([]);
  const [selectedAnalysis, setSelectedAnalysis] = useState<RepertoryAnalysisRow | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingOutput, setEditingOutput] = useState('');
  const [editingRemedy, setEditingRemedy] = useState('');

  const [patientSymptoms, setPatientSymptoms] = useState<RepertorySymptom[]>([]);
  const [doctorSymptoms, setDoctorSymptoms] = useState<RepertorySymptom[]>([]);
  const [editingSymptomId, setEditingSymptomId] = useState<string | null>(null);
  const [editingSymptomText, setEditingSymptomText] = useState('');

  useEffect(() => {
    if (selectedPatient) {
      setPatientName(selectedPatient.name);
      setPatientAge(selectedPatient.age ? String(selectedPatient.age) : '');
      setPatientGender(selectedPatient.gender);
    }
  }, [selectedPatient?.id]);

  useEffect(() => {
    if (!selectedPatient) {
      setPatientSymptoms([]);
      setDoctorSymptoms([]);
      return;
    }
    const p: RepertorySymptom[] = [];
    const d: RepertorySymptom[] = [];
    systemForms.filter(f => f.patientId === selectedPatient.id).forEach(f => {
      const collected: string[] = [];
      const push = (label: string, val: unknown) => {
        if (isMeaningful(val)) collected.push(`${label}: ${displayValue(val)}`);
      };
      push('Chief Complaint', f.chiefComplaints);
      push('Duration', f.duration);
      push('Severity', f.severity);
      push('Worse', f.modalitiesAggravation);
      push('Better', f.modalitiesAmelioration);
      push('Concomitants', f.concomitants);
      push('Clinical Notes', f.clinicalNotes);
      if (f.data && typeof f.data === 'object') {
        Object.entries(f.data).forEach(([k, v]) => {
          if (IGNORE_KEYS.has(k)) return;
          if (!isMeaningful(v)) return;
          if (typeof v === 'string' && v.startsWith('data:image')) return;
          const t = displayValue(v);
          if (t) collected.push(`${labelFor(k)}: ${t}`);
        });
      }
      const isPatient = f.submittedVia === 'WhatsApp_Remote_Intake' || f.submittedVia === 'Patient_Portal';
      collected.forEach((t, i) => {
        const item: RepertorySymptom = { id: `${f.id}-${i}`, text: t, selected: true, source: isPatient ? 'patient' : 'doctor' };
        (isPatient ? p : d).push(item);
      });
    });
    setPatientSymptoms(p);
    setDoctorSymptoms(d);
  }, [selectedPatient?.id, systemForms]);

  const togglePatientSym = (id: string) =>
    setPatientSymptoms(prev => prev.map(s => s.id === id ? { ...s, selected: !s.selected } : s));
  const toggleDoctorSym = (id: string) =>
    setDoctorSymptoms(prev => prev.map(s => s.id === id ? { ...s, selected: !s.selected } : s));
  const deletePatientSym = (id: string) => setPatientSymptoms(prev => prev.filter(s => s.id !== id));
  const deleteDoctorSym = (id: string) => setDoctorSymptoms(prev => prev.filter(s => s.id !== id));

  const startEdit = (s: RepertorySymptom) => { setEditingSymptomId(s.id); setEditingSymptomText(s.text); };
  const saveEdit = (source: 'patient' | 'doctor') => {
    if (!editingSymptomId) return;
    const upd = (arr: RepertorySymptom[]) => arr.map(s => s.id === editingSymptomId ? { ...s, text: editingSymptomText } : s);
    if (source === 'patient') setPatientSymptoms(upd);
    else setDoctorSymptoms(upd);
    setEditingSymptomId(null); setEditingSymptomText('');
  };

  const selectAll = (source: 'patient' | 'doctor', sel: boolean) => {
    if (source === 'patient') setPatientSymptoms(prev => prev.map(s => ({ ...s, selected: sel })));
    else setDoctorSymptoms(prev => prev.map(s => ({ ...s, selected: sel })));
  };

  const loadAnalyses = async () => {
    if (!currentUser) return;
    try {
      const list = await repertoryService.list(currentUser.id);
      setAnalyses(list);
    } catch (err) { console.warn('[RepertorisationView] list failed', err); }
  };

  useEffect(() => { void loadAnalyses(); /* eslint-disable-next-line react-hooks/exhaustive-deps */ }, [currentUser?.id]);

  const showToast = (msg: string) => { setToast(msg); setTimeout(() => setToast(null), 3000); };

  const toggleMentalChip = (chip: string) =>
    setSelectedMentalChips(prev => prev.includes(chip) ? prev.filter(c => c !== chip) : [...prev, chip]);
  const togglePhysicalChip = (chip: string) =>
    setSelectedPhysicalChips(prev => prev.includes(chip) ? prev.filter(c => c !== chip) : [...prev, chip]);

  const clearAll = () => {
    setSelectedMentalChips([]); setMentalText('');
    setSelectedPhysicalChips([]); setPhysicalText('');
    setSym1(''); setSym2(''); setSym3(''); setSym4(''); setSym5('');
    setSym5Chilly(false); setSym5Hot(false); setSym5Right(false); setSym5Left(false);
    showToast('Cleared');
  };

  const toggleVoice = () => {
    const SR = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SR) { showToast('Speech not supported'); return; }
    if (isRecording && speechRef.current) { try { speechRef.current.stop(); } catch { /* */ } setIsRecording(false); return; }
    try {
      const rec = new SR();
      rec.continuous = false; rec.interimResults = false; rec.lang = 'en-IN';
      rec.onstart = () => setIsRecording(true);
      rec.onresult = (ev: any) => {
        const spoken = ev.results?.[0]?.[0]?.transcript;
        if (spoken) { setSym1(prev => prev ? `${prev} ${spoken}` : spoken); showToast('Added to Symptom 1'); }
      };
      rec.onerror = () => setIsRecording(false);
      rec.onend = () => setIsRecording(false);
      speechRef.current = rec; rec.start();
    } catch { setIsRecording(false); }
  };

  const selectedPatientSyms = useMemo(() => patientSymptoms.filter(s => s.selected && isMeaningful(s.text)), [patientSymptoms]);
  const selectedDoctorSyms = useMemo(() => doctorSymptoms.filter(s => s.selected && isMeaningful(s.text)), [doctorSymptoms]);

  const buildPayload = () => {
    const doctorManual: string[] = [];
    if (sym1.trim()) doctorManual.push(sym1.trim());
    if (sym2.trim()) doctorManual.push(sym2.trim());
    if (sym3.trim()) doctorManual.push(sym3.trim());
    if (sym4.trim()) doctorManual.push(sym4.trim());
    if (sym5.trim()) {
      const mods = [sym5Chilly && 'Chilly', sym5Hot && 'Hot', sym5Right && 'Right', sym5Left && 'Left'].filter(Boolean) as string[];
      doctorManual.push(mods.length ? `${sym5.trim()} [${mods.join(', ')}]` : sym5.trim());
    }
    const mental: string[] = [];
    if (selectedMentalChips.length) mental.push(selectedMentalChips.join(', '));
    if (mentalText.trim()) mental.push(mentalText.trim());
    const physical: string[] = [];
    if (selectedPhysicalChips.length) physical.push(selectedPhysicalChips.join(', '));
    if (physicalText.trim()) physical.push(physicalText.trim());

    return {
      patient: { name: patientName.trim(), age: patientAge.trim(), gender: patientGender.trim() },
      patientEnteredSymptoms: selectedPatientSyms.map(s => s.text),
      doctorEnteredSymptoms: [...selectedDoctorSyms.map(s => s.text), ...doctorManual],
      mentalGenerals: mental,
      physicalGenerals: physical
    };
  };

  const buildSymptomsArray = (): string[] => {
    const arr: string[] = [];
    selectedPatientSyms.forEach(s => arr.push(`[Patient] ${s.text}`));
    selectedDoctorSyms.forEach(s => arr.push(`[Doctor] ${s.text}`));
    return arr;
  };

  const buildPrompt = (method: string) => {
    const p = buildPayload();
    const lines: string[] = [];
    lines.push(`You are an expert homeopathic repertory consultant using ${method}.`);
    lines.push('');
    lines.push(`Patient: ${p.patient.name || 'N/A'}, Age: ${p.patient.age || 'N/A'}, Gender: ${p.patient.gender || 'N/A'}`);
    lines.push('');
    if (p.patientEnteredSymptoms.length) {
      lines.push('PATIENT-ENTERED SYMPTOMS (from clinical form):');
      p.patientEnteredSymptoms.forEach(s => lines.push(`- ${s}`));
      lines.push('');
    }
    if (p.doctorEnteredSymptoms.length) {
      lines.push('DOCTOR-ENTERED SYMPTOMS (from case taking):');
      p.doctorEnteredSymptoms.forEach(s => lines.push(`- ${s}`));
      lines.push('');
    }
    if (p.mentalGenerals.length) {
      lines.push('MENTAL GENERALS:');
      p.mentalGenerals.forEach(s => lines.push(`- ${s}`));
      lines.push('');
    }
    if (p.physicalGenerals.length) {
      lines.push('PHYSICAL GENERALS:');
      p.physicalGenerals.forEach(s => lines.push(`- ${s}`));
      lines.push('');
    }
    lines.push('Provide a clinical-grade Markdown repertory analysis:');
    lines.push('1. Top 3-5 indicated remedies with justifications, keynote matches, and rubric gradings.');
    lines.push('2. Key rubrics considered.');
    lines.push('3. Differentiation and posology guidance.');
    lines.push('');
    lines.push('Use ONLY the supplied symptoms. Do not invent symptoms.');
    return lines.join('\n');
  };

  const handleRepertorize = async (method: string) => {
    const p = buildPayload();
    const hasAny = p.patientEnteredSymptoms.length || p.doctorEnteredSymptoms.length || p.mentalGenerals.length || p.physicalGenerals.length;
    if (!hasAny) { setError('Please select at least one symptom or enter generals.'); return; }
    if (!patientName.trim()) { setError('Please enter patient name.'); return; }
    setError(null); setActiveMethod(method); setMethodBadge(method); setIsLoading(true); setOutput(`Repertorizing with ${method}...`); setSaveStatus('');

    try {
      const res = await fetch('/api/repertorize', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt: buildPrompt(method), method })
      });
      if (!res.ok) {
        const eb = await res.json().catch(() => ({}));
        throw new Error(eb?.error || 'Repertorization service returned an error.');
      }
      const data = await res.json();
      const result = data?.result || '';
      if (!result) throw new Error('Empty response from service.');
      setOutput(result);

      if (currentUser) {
        await repertoryService.create(currentUser.id, {
          patientId: selectedPatient?.id ?? null,
          method,
          symptoms: buildSymptomsArray(),
          output: result,
          remedyGiven: remedyGiven.trim() || null
        });
        setSaveStatus('Saved to cloud');
        await loadAnalyses();
      }
      showToast('Analysis complete');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Analysis failed.');
    } finally { setIsLoading(false); }
  };

  const handleSaveRemedyDirectly = async () => {
    if (!currentUser || !remedyGiven.trim()) { showToast('Enter a remedy first'); return; }
    try {
      await repertoryService.create(currentUser.id, {
        patientId: selectedPatient?.id ?? null,
        method: 'Prescription',
        symptoms: buildSymptomsArray(),
        output: `### Prescribed Remedy\n\n**${remedyGiven.trim()}**`,
        remedyGiven: remedyGiven.trim()
      });
      showToast('Remedy saved');
      await loadAnalyses();
    } catch (err) { showToast(err instanceof Error ? err.message : 'Failed'); }
  };

  const handleCopy = () => { if (!output) return; void navigator.clipboard.writeText(output); showToast('Copied'); };
  const handlePrint = () => { if (!output) return; window.print(); };

  const handleDeleteAnalysis = async (id: string) => {
    if (!currentUser) return;
    if (!confirm('Delete this analysis?')) return;
    try {
      await repertoryService.remove(id, currentUser.id);
      await loadAnalyses();
      if (selectedAnalysis?.id === id) setSelectedAnalysis(null);
    } catch { showToast('Delete failed'); }
  };

  const handleEditAnalysis = (a: RepertoryAnalysisRow) => {
    setEditingId(a.id); setEditingOutput(a.output); setEditingRemedy(a.remedy_given ?? '');
  };

  const handleSaveEdited = async () => {
    if (!currentUser || !editingId) return;
    try {
      await repertoryService.update(editingId, currentUser.id, {
        output: editingOutput, remedyGiven: editingRemedy.trim() || null
      });
      await loadAnalyses(); setEditingId(null); showToast('Updated');
    } catch { showToast('Update failed'); }
  };

  const renderSymptomRow = (s: RepertorySymptom, source: 'patient' | 'doctor') => {
    const isEditing = editingSymptomId === s.id;
    return (
      <div key={s.id} className="flex items-start gap-3 p-3.5 rounded-xl border border-slate-200 bg-white hover:border-slate-300 transition-colors">
        <input
          type="checkbox"
          checked={s.selected}
          onChange={() => source === 'patient' ? togglePatientSym(s.id) : toggleDoctorSym(s.id)}
          className="mt-1 w-5 h-5 accent-emerald-600 shrink-0"
        />
        {isEditing ? (
          <div className="flex-1 flex items-center gap-2">
            <input
              type="text"
              value={editingSymptomText}
              onChange={e => setEditingSymptomText(e.target.value)}
              className="flex-1 border border-emerald-300 rounded-lg px-3 py-2 text-base focus:ring-2 focus:ring-emerald-500 focus:outline-none"
              autoFocus
            />
            <button type="button" onClick={() => saveEdit(source)} className="p-2 text-emerald-700 hover:bg-emerald-50 rounded-lg" title="Save">
              <Check className="w-5 h-5" />
            </button>
            <button type="button" onClick={() => { setEditingSymptomId(null); setEditingSymptomText(''); }} className="p-2 text-slate-400 hover:bg-slate-100 rounded-lg" title="Cancel">
              <X className="w-5 h-5" />
            </button>
          </div>
        ) : (
          <div className="flex-1 min-w-0">
            <p className={`text-base leading-snug ${s.selected ? 'text-slate-900 font-medium' : 'text-slate-500 line-through'}`}>
              {s.text}
            </p>
          </div>
        )}
        {!isEditing && (
          <div className="flex items-center gap-1 shrink-0">
            <button type="button" onClick={() => startEdit(s)} className="p-2 text-slate-400 hover:text-emerald-700 hover:bg-emerald-50 rounded-lg" title="Edit">
              <Edit3 className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={() => source === 'patient' ? deletePatientSym(s.id) : deleteDoctorSym(s.id)}
              className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg"
              title="Delete"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="w-full max-w-[1200px] mx-auto pb-12 font-sans text-slate-800 text-base">
      {toast && (
        <div className="fixed bottom-8 left-1/2 -translate-x-1/2 px-6 py-3 rounded-full bg-slate-900 text-white text-base font-semibold shadow-xl z-50 flex items-center gap-2">
          <CheckCircle2 className="w-5 h-5" />
          {toast}
        </div>
      )}

      {activePage === 'main' ? (
        <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-sm border border-emerald-100">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 mb-6 border-b-2 border-emerald-100">
            <div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-emerald-900 tracking-tight">
                Homeopathic Repertorization
              </h1>
              <p className="text-sm text-emerald-700 mt-1">
                AI-powered classical repertory analysis (Grok / GPT-OSS 120B)
              </p>
            </div>
            <button
              type="button"
              onClick={() => setActivePage('history')}
              className="px-4 py-2 bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-200 rounded-full text-sm font-bold flex items-center gap-2"
            >
              <FileText className="w-5 h-5" />
              Patient History
              <span className="bg-amber-500 text-white px-2 py-0.5 rounded-full text-xs">{analyses.length}</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-12 gap-4 p-5 rounded-2xl bg-emerald-50/40 border border-emerald-100 mb-6">
            <div className="md:col-span-6">
              <label className="block text-sm font-bold text-emerald-900 uppercase tracking-wider mb-2">Patient Name</label>
              <input
                type="text"
                value={patientName}
                onChange={e => setPatientName(e.target.value)}
                placeholder="Enter patient name"
                className="w-full px-4 py-3 bg-white border border-emerald-200 rounded-xl text-base font-medium focus:outline-none focus:border-emerald-600 focus:ring-2 focus:ring-emerald-500/15"
              />
            </div>
            <div className="md:col-span-3">
              <label className="block text-sm font-bold text-emerald-900 uppercase tracking-wider mb-2">Age</label>
              <input
                type="text"
                inputMode="numeric"
                maxLength={3}
                value={patientAge}
                onChange={e => setPatientAge(e.target.value.replace(/[^0-9]/g, ''))}
                className="w-full px-4 py-3 bg-white border border-emerald-200 rounded-xl text-base focus:outline-none"
              />
            </div>
            <div className="md:col-span-3">
              <label className="block text-sm font-bold text-emerald-900 uppercase tracking-wider mb-2">Gender</label>
              <select
                value={patientGender}
                onChange={e => setPatientGender(e.target.value)}
                className="w-full px-4 py-3 bg-white border border-emerald-200 rounded-xl text-base focus:outline-none"
              >
                <option value="">Select</option>
                <option value="Male">Male</option>
                <option value="Female">Female</option>
                <option value="Other">Other</option>
              </select>
            </div>
          </div>

          <div className="bg-white border border-emerald-100 rounded-2xl p-5 mb-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 mb-5 border-b border-emerald-100">
              <div className="flex items-center gap-2">
                <Stethoscope className="w-6 h-6 text-emerald-700" />
                <h3 className="font-extrabold text-emerald-900 text-xl">Symptoms for Repertorization</h3>
              </div>
              <span className="text-sm text-slate-500">
                Checked symptoms only will be sent to the analysis engine.
              </span>
            </div>

            <div className="space-y-6">
              <div>
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3">
                  <div className="flex items-center gap-2">
                    <User className="w-5 h-5 text-indigo-600" />
                    <h4 className="font-bold text-indigo-900 text-lg">Patient-entered via clinical form</h4>
                    <span className="px-2 py-0.5 bg-indigo-50 text-indigo-800 rounded-full text-xs font-bold border border-indigo-200">
                      {patientSymptoms.length}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <button onClick={() => selectAll('patient', true)} className="text-xs font-bold text-emerald-700 hover:text-emerald-900">Select All</button>
                    <span className="text-slate-300">|</span>
                    <button onClick={() => selectAll('patient', false)} className="text-xs font-bold text-slate-500 hover:text-slate-700">Clear All</button>
                  </div>
                </div>
                {patientSymptoms.length === 0 ? (
                  <div className="p-4 text-center text-sm text-slate-400 bg-slate-50 rounded-xl border border-dashed border-slate-200">
                    No patient-entered symptoms found for this patient.
                  </div>
                ) : (
                  <div className="space-y-2">
                    {patientSymptoms.map(s => renderSymptomRow(s, 'patient'))}
                  </div>
                )}
              </div>

              <div>
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3">
                  <div className="flex items-center gap-2">
                    <Stethoscope className="w-5 h-5 text-emerald-600" />
                    <h4 className="font-bold text-emerald-900 text-lg">Doctor-entered during case taking</h4>
                    <span className="px-2 py-0.5 bg-emerald-50 text-emerald-800 rounded-full text-xs font-bold border border-emerald-200">
                      {doctorSymptoms.length}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <button onClick={() => selectAll('doctor', true)} className="text-xs font-bold text-emerald-700 hover:text-emerald-900">Select All</button>
                    <span className="text-slate-300">|</span>
                    <button onClick={() => selectAll('doctor', false)} className="text-xs font-bold text-slate-500 hover:text-slate-700">Clear All</button>
                  </div>
                </div>
                {doctorSymptoms.length === 0 ? (
                  <div className="p-4 text-center text-sm text-slate-400 bg-slate-50 rounded-xl border border-dashed border-slate-200">
                    No doctor-entered symptoms found yet.
                  </div>
                ) : (
                  <div className="space-y-2">
                    {doctorSymptoms.map(s => renderSymptomRow(s, 'doctor'))}
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="bg-white border border-emerald-100 rounded-2xl p-5 mb-6">
            <div className="flex items-center justify-between pb-3 mb-4 border-b border-emerald-100">
              <h3 className="font-extrabold text-emerald-900 text-lg flex items-center gap-2">
                <Brain className="w-5 h-5 text-emerald-600" />
                Generals Case Taking
              </h3>
              <button type="button" onClick={clearAll} className="text-sm px-3 py-1.5 font-bold text-emerald-900 bg-emerald-50 hover:bg-emerald-100 rounded-full">
                Clear All
              </button>
            </div>

            <div className="bg-emerald-50/40 border border-emerald-100 rounded-xl p-4 mb-4">
              <span className="font-bold text-sm text-emerald-900 block mb-3">Mental Generals</span>
              <div className="flex flex-wrap gap-2 mb-3">
                {MENTAL_CHIPS.map(chip => {
                  const s = selectedMentalChips.includes(chip);
                  return (
                    <button
                      type="button"
                      key={chip}
                      onClick={() => toggleMentalChip(chip)}
                      className={`px-3.5 py-1.5 rounded-full text-sm font-bold border transition-all ${
                        s ? 'bg-emerald-700 text-white border-emerald-800' : 'bg-white text-slate-800 border-emerald-200 hover:bg-emerald-50'
                      }`}
                    >
                      {chip}
                    </button>
                  );
                })}
              </div>
              <input
                type="text"
                value={mentalText}
                onChange={e => setMentalText(e.target.value)}
                placeholder="Additional mental symptoms..."
                className="w-full px-4 py-2.5 bg-white border border-emerald-200 rounded-xl text-sm focus:outline-none"
              />
            </div>

            <div className="bg-emerald-50/40 border border-emerald-100 rounded-xl p-4">
              <span className="font-bold text-sm text-emerald-900 block mb-3">Physical Generals &amp; Modalities</span>
              <div className="flex flex-wrap gap-2 mb-3">
                {PHYSICAL_CHIPS.map(chip => {
                  const s = selectedPhysicalChips.includes(chip);
                  return (
                    <button
                      type="button"
                      key={chip}
                      onClick={() => togglePhysicalChip(chip)}
                      className={`px-3.5 py-1.5 rounded-full text-sm font-bold border transition-all ${
                        s ? 'bg-emerald-700 text-white border-emerald-800' : 'bg-white text-slate-800 border-emerald-200 hover:bg-emerald-50'
                      }`}
                    >
                      {chip}
                    </button>
                  );
                })}
              </div>
              <input
                type="text"
                value={physicalText}
                onChange={e => setPhysicalText(e.target.value)}
                placeholder="Physical modalities, thermal, thirst, sleep..."
                className="w-full px-4 py-2.5 bg-white border border-emerald-200 rounded-xl text-sm focus:outline-none"
              />
            </div>
          </div>

          <div className="bg-emerald-50/40 border border-emerald-100 rounded-2xl p-5 mb-6">
            <h3 className="font-extrabold text-emerald-900 text-lg mb-4">Chief Complaints &amp; Particular Symptoms</h3>
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <label className="w-28 text-sm font-bold text-emerald-900 shrink-0">Symptom 1</label>
                <input
                  type="text"
                  value={sym1}
                  onChange={e => setSym1(e.target.value)}
                  placeholder="Chief complaint (Location, Sensation, Modality)"
                  className="flex-1 px-4 py-3 bg-white border border-emerald-200 rounded-xl text-base focus:outline-none"
                />
                <button
                  type="button"
                  onClick={toggleVoice}
                  className={`w-11 h-11 rounded-full border flex items-center justify-center shrink-0 ${
                    isRecording ? 'bg-rose-100 text-rose-700 border-rose-400 animate-pulse' : 'bg-white text-emerald-800 border-emerald-200 hover:bg-emerald-50'
                  }`}
                >
                  {isRecording ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
                </button>
              </div>
              {[sym2, sym3, sym4].map((v, i) => (
                <div key={i} className="flex items-center gap-2">
                  <label className="w-28 text-sm font-bold text-emerald-900 shrink-0">Symptom {i + 2}</label>
                  <input
                    type="text"
                    value={v}
                    onChange={e => { const setter = [setSym2, setSym3, setSym4][i]; setter(e.target.value); }}
                    placeholder="Symptom"
                    className="flex-1 px-4 py-3 bg-white border border-emerald-200 rounded-xl text-base focus:outline-none"
                  />
                </div>
              ))}
              <div className="flex flex-col gap-2">
                <div className="flex items-center gap-2">
                  <label className="w-28 text-sm font-bold text-emerald-900 shrink-0">Symptom 5</label>
                  <input
                    type="text"
                    value={sym5}
                    onChange={e => setSym5(e.target.value)}
                    className="flex-1 px-4 py-3 bg-white border border-emerald-200 rounded-xl text-base focus:outline-none"
                  />
                </div>
                <div className="ml-[120px] flex items-center gap-4 flex-wrap">
                  {[
                    { v: sym5Chilly, s: setSym5Chilly, l: 'Chilly' },
                    { v: sym5Hot, s: setSym5Hot, l: 'Hot' },
                    { v: sym5Right, s: setSym5Right, l: 'Right' },
                    { v: sym5Left, s: setSym5Left, l: 'Left' }
                  ].map(o => (
                    <label key={o.l} className="inline-flex items-center gap-2 text-sm font-bold cursor-pointer">
                      <input type="checkbox" checked={o.v} onChange={e => o.s(e.target.checked)} className="w-5 h-5 accent-emerald-700" />
                      {o.l}
                    </label>
                  ))}
                </div>
              </div>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 bg-emerald-100/40 border border-emerald-200 rounded-2xl p-4 mb-6">
            <label className="font-extrabold text-base text-emerald-900 flex items-center gap-2 shrink-0">
              <Pill className="w-5 h-5" />Medicine Given:
            </label>
            <input
              type="text"
              value={remedyGiven}
              onChange={e => setRemedyGiven(e.target.value)}
              placeholder="e.g. Lycopodium 200C"
              className="flex-1 px-4 py-2.5 bg-white border border-emerald-200 rounded-full text-base focus:outline-none"
            />
            <button
              type="button"
              onClick={handleSaveRemedyDirectly}
              className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-full text-sm font-bold flex items-center justify-center gap-2"
            >
              <Save className="w-4 h-4" />Save Remedy
            </button>
          </div>

          <div className="mb-6">
            <div className="text-sm font-extrabold text-emerald-900 uppercase tracking-wider mb-3">Select Repertory Method</div>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
              {METHODS.map(m => {
                const active = activeMethod === m;
                return (
                  <button
                    key={m}
                    type="button"
                    onClick={() => handleRepertorize(m)}
                    disabled={isLoading}
                    className={`px-3 py-3 rounded-xl text-sm font-bold border transition-all ${
                      active ? 'bg-emerald-800 text-white border-emerald-900 shadow-md' : 'bg-white text-emerald-900 border-emerald-200 hover:bg-emerald-50 hover:-translate-y-0.5'
                    }`}
                  >
                    {m}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="bg-white border border-emerald-100 rounded-2xl p-5 shadow-sm min-h-[260px]">
            <div className="flex items-center justify-between gap-3 pb-3 mb-4 border-b-2 border-emerald-100">
              <div className="flex items-center gap-2.5 flex-wrap">
                <h3 className="font-extrabold text-emerald-900 text-lg">Repertory Analysis</h3>
                <span className="px-3 py-1 rounded-full text-xs font-extrabold bg-emerald-50 text-emerald-900 border border-emerald-200">{methodBadge}</span>
                {saveStatus && <span className="text-sm font-bold text-emerald-700">{saveStatus}</span>}
              </div>
              <div className="flex items-center gap-2">
                <button type="button" onClick={handleCopy} className="px-3 py-2 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-full text-sm font-bold flex items-center gap-1.5">
                  <Copy className="w-4 h-4" />Copy
                </button>
                <button type="button" onClick={handlePrint} className="px-3 py-2 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-full text-sm font-bold flex items-center gap-1.5">
                  <Printer className="w-4 h-4" />Print
                </button>
              </div>
            </div>

            {error && (
              <div className="mb-3 p-3.5 bg-rose-50 border border-rose-200 rounded-xl text-rose-800 text-sm flex items-center gap-2">
                <AlertCircle className="w-5 h-5" />{error}
              </div>
            )}

            {isLoading && (
              <div className="flex items-center justify-center gap-3 py-10 text-emerald-800 text-base font-semibold">
                <Loader2 className="w-6 h-6 animate-spin" />Analyzing with Grok GPT-OSS 120B...
              </div>
            )}

            {!isLoading && output && (
              <div className="prose prose-base max-w-none text-slate-800 leading-relaxed">
                <Markdown>{output}</Markdown>
              </div>
            )}

            {!isLoading && !output && (
              <div className="text-center py-12 text-emerald-700 italic text-base">
                Select symptoms above and choose a method to generate an analysis.
              </div>
            )}
          </div>
        </div>
      ) : (
        <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-sm border border-emerald-100">
          <div className="flex items-center justify-between pb-4 mb-6 border-b-2 border-emerald-100">
            <div>
              <h1 className="text-2xl font-extrabold text-emerald-900">Patient History</h1>
              <p className="text-sm text-emerald-700 mt-1">
                {analyses.length} saved analysis record{analyses.length === 1 ? '' : 's'}
              </p>
            </div>
            <button
              onClick={() => { setActivePage('main'); setSelectedAnalysis(null); }}
              className="px-4 py-2 bg-emerald-800 hover:bg-emerald-900 text-white rounded-full text-sm font-bold flex items-center gap-2"
            >
              <ArrowLeft className="w-4 h-4" />Back to Repertorize
            </button>
          </div>

          {selectedAnalysis ? (
            <div className="space-y-4">
              <div className="flex items-center justify-between flex-wrap gap-3">
                <button onClick={() => setSelectedAnalysis(null)} className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 rounded-full text-sm font-bold flex items-center gap-2">
                  <ArrowLeft className="w-4 h-4" />All Records
                </button>
                <button onClick={() => handleDeleteAnalysis(selectedAnalysis.id)} className="px-3.5 py-2 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 rounded-full text-sm font-bold flex items-center gap-2">
                  <Trash2 className="w-4 h-4" />Delete
                </button>
              </div>
              <div className="bg-white rounded-2xl border border-emerald-100 p-5 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="font-extrabold text-emerald-900 text-base">{selectedAnalysis.method}</span>
                  <span className="text-sm text-emerald-700 flex items-center gap-1">
                    <Clock className="w-4 h-4" />{new Date(selectedAnalysis.created_at).toLocaleString()}
                  </span>
                </div>
                {selectedAnalysis.symptoms && selectedAnalysis.symptoms.length > 0 && (
                  <div className="bg-emerald-50 p-3.5 rounded-xl text-sm">
                    <strong>Symptoms:</strong> {selectedAnalysis.symptoms.join(', ')}
                  </div>
                )}
                {selectedAnalysis.remedy_given && (
                  <div className="text-sm font-bold text-emerald-700 flex items-center gap-1.5">
                    <Pill className="w-4 h-4" />Remedy: {selectedAnalysis.remedy_given}
                  </div>
                )}
                {editingId === selectedAnalysis.id ? (
                  <div className="space-y-3">
                    <textarea rows={10} value={editingOutput} onChange={e => setEditingOutput(e.target.value)}
                      className="w-full p-3 border border-emerald-200 rounded-xl text-sm font-mono" />
                    <input type="text" value={editingRemedy} onChange={e => setEditingRemedy(e.target.value)}
                      placeholder="Remedy" className="w-full px-3 py-2 border border-emerald-200 rounded-full text-sm" />
                    <div className="flex gap-2">
                      <button onClick={handleSaveEdited} className="px-4 py-2 bg-emerald-700 text-white rounded-full text-sm font-bold">Save</button>
                      <button onClick={() => setEditingId(null)} className="px-4 py-2 bg-slate-100 rounded-full text-sm font-bold">Cancel</button>
                    </div>
                  </div>
                ) : (
                  <>
                    <div className="prose prose-base max-w-none text-slate-800">
                      <Markdown>{selectedAnalysis.output}</Markdown>
                    </div>
                    <button onClick={() => handleEditAnalysis(selectedAnalysis)} className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 rounded-full text-sm font-bold flex items-center gap-2">
                      <Edit3 className="w-4 h-4" />Edit
                    </button>
                  </>
                )}
              </div>
            </div>
          ) : analyses.length === 0 ? (
            <div className="text-center py-16 bg-emerald-50/40 rounded-2xl border border-emerald-100">
              <FileText className="w-12 h-12 text-emerald-300 mx-auto mb-3" />
              <h4 className="font-extrabold text-emerald-900 text-lg mb-1">No analyses yet</h4>
              <p className="text-sm text-emerald-700">Run a repertorization to see it here.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {analyses.map(a => (
                <button key={a.id} onClick={() => setSelectedAnalysis(a)}
                  className="w-full text-left bg-white hover:bg-emerald-50 border border-emerald-100 rounded-2xl p-4 flex items-center justify-between">
                  <div>
                    <div className="font-bold text-emerald-900 text-base">
                      {a.method}
                      {a.remedy_given && <span className="ml-2 text-sm text-emerald-700">• {a.remedy_given}</span>}
                    </div>
                    <div className="text-sm text-slate-500 mt-1">{new Date(a.created_at).toLocaleString()}</div>
                  </div>
                  <ChevronRight className="w-5 h-5 text-emerald-400" />
                </button>
              ))}
            </div>
          )}
        </div>
      )}

      <span className="hidden"><Sparkles /><RotateCcw /></span>
    </div>
  );
};