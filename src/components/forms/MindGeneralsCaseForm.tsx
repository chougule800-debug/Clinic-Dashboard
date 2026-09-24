import React, { useState, useEffect } from 'react';
import { useClinic } from '../../context/ClinicContext';
import {
  Brain,
  Save,
  CheckCircle2,
  RotateCcw,
  Printer,
  Upload,
  X,
  Share2,
  AlertCircle,
  FileText,
  Heart,
  Sparkles,
  Zap,
  Activity,
  Calendar,
  Compass
} from 'lucide-react';

export interface MindGeneralsFormData {
  // 1. Patient Information
  patientName: string;
  age: string;
  sex: string;
  mobile: string;
  date: string;
  occupation: string;
  patientId?: string;

  // 2. Chief Physical Complaints
  mainComplaint: string;
  complaintCharacter: string;
  onsetDuration: string;
  associated: string;

  // 3. Mental & Emotional State
  mind: string[];
  mentalDetail: string;

  // 4. Emotional Trigger
  trigger: string[];
  triggerDetail: string;
  interpretation: string;

  // 5. Emotion -> Body Sequence
  seqEvent: string;
  seqEmotion: string;
  seqThought: string;
  seqPhysical: string;
  seqOnset: string;
  seqDuration: string;
  seqModalities: string;
  seqConcomitant: string;

  // 6. Psycho-Somatic Symptom Mapping
  body: string[];
  bodyDetail: string;

  // 7. Kent Mind Rubric Selection
  rubrics: string[];
  selectedRubrics: string;

  // 8. General Modalities & Generals
  mod: string[];
  generals: string;

  // 9. Sleep, Dreams & Daily Function
  sleep: string;
  dreams: string;
  appetite: string;
  function: string;

  // 10. Past & Family History
  past: string;
  family: string;
  medicines: string;
  habits: string;

  // 11. Examination & Investigations
  pulse: string;
  bp: string;
  weight: string;
  exam: string;
  investigation: string;
  reportFiles: { name: string; type: string; data: string | null }[];

  // 12. Assessment & Follow-up
  assessment: string;
  plan: string;
  followDate: string;
  followNotes: string;

  savedAt?: string;
}

const INITIAL_MIND_GENERALS_DATA: MindGeneralsFormData = {
  patientName: '',
  age: '',
  sex: '',
  mobile: '',
  date: new Date().toISOString().slice(0, 10),
  occupation: '',
  patientId: '',

  mainComplaint: '',
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
  reportFiles: [],

  assessment: '',
  plan: '',
  followDate: '',
  followNotes: ''
};

const MENTAL_STATE_OPTIONS = [
  'Anxiety / चिंता',
  'Fear / भीती',
  'Anger / राग',
  'Irritability / चिडचिड',
  'Grief / दुःख',
  'Sadness / उदासी',
  'Jealousy / मत्सर',
  'Suspiciousness / संशय',
  'Restlessness / अस्वस्थता',
  'Indifference / उदासीनता',
  'Discouragement / निरुत्साह',
  'Confusion / संभ्रम',
  'Forgetfulness / विस्मरण',
  'Poor concentration / एकाग्रता कमी',
  'Mood change / मनःस्थिती बदल',
  'Desire for company / सोबत हवी',
  'Desire for solitude / एकांताची इच्छा',
  'Fear of being alone / एकटे राहण्याची भीती',
  'Sensitivity to criticism / टीकेची संवेदनशीलता',
  'Suppressed emotions / दडपलेल्या भावना',
  'Anticipation / अपेक्षेची चिंता',
  'Humiliation / अपमान',
  'Overthinking / अतिविचार',
  'Crying easily / सहज रडणे'
];

const EMOTIONAL_TRIGGERS = [
  'Anger / राग',
  'Fear / भीती',
  'Grief / दुःख',
  'Shock / धक्का',
  'Humiliation / अपमान',
  'Relationship conflict / संबंधातील संघर्ष',
  'Family conflict / कौटुंबिक संघर्ष',
  'Work stress / कामाचा ताण',
  'Financial stress / आर्थिक ताण',
  'Exam stress / परीक्षेचा ताण',
  'Anticipation / अपेक्षा',
  'Suppression / भावना दडपणे'
];

const PSYCHOSOMATIC_BODY_SYMPTOMS = [
  'Headache/Migraine / डोकेदुखी',
  'Palpitations / हृदयाची धडधड',
  'Breathlessness/Chest tightness / छातीत जडपणा',
  'Acidity/Gastric symptoms / आम्लपित्त',
  'Bowel disturbance / आतड्यांची तक्रार',
  'Skin symptoms / त्वचेची लक्षणे',
  'Sleep disturbance / झोपेचा त्रास',
  'Urinary symptoms / मूत्रविषयक लक्षणे',
  'Menstrual symptoms / मासिक पाळीची लक्षणे',
  'Musculoskeletal pain / स्नायू-सांध्यांचे दुखणे',
  'Fatigue / थकवा',
  'Other / इतर'
];

const KENT_MIND_RUBRICS = [
  'Anxiety / Anxiety / चिंता',
  'Anger / Anger / राग',
  'Concentration difficult / एकाग्रता कठीण',
  'Confusion of mind / मनाचा संभ्रम',
  'Despair / निराशा',
  'Discouragement / निरुत्साह',
  'Fear / भीती',
  'Forgetfulness / विस्मरण',
  'Grief / दुःख',
  'Irritability / चिडचिड',
  'Mood change / मनःस्थिती बदल',
  'Restlessness / अस्वस्थता',
  'Company desire / सोबत हवी',
  'Company aversion / सोबत नको',
  'Suspiciousness / संशय',
  'Weeping / रडणे'
];

const GENERAL_MODALITIES = [
  'Worse by heat / उष्णतेने वाढते',
  'Worse by cold / थंडीने वाढते',
  'Better by warmth / उष्णतेने आराम',
  'Better by cold / थंडीत आराम',
  'Worse by motion / हालचालीने वाढते',
  'Better by motion / हालचालीने आराम',
  'Worse at night / रात्री वाढते',
  'Worse morning / सकाळी वाढते',
  'Before sleep / झोपण्यापूर्वी',
  'After eating / जेवल्यानंतर',
  'When alone / एकटे असताना',
  'In company / सोबत असताना'
];

export const MindGeneralsCaseForm: React.FC = () => {
  const {
    selectedPatient,
    saveSystemForm,
    systemForms,
    openWhatsAppShareDialog
  } = useClinic();

  const [formData, setFormData] = useState<MindGeneralsFormData>(INITIAL_MIND_GENERALS_DATA);
  const [rubricSearch, setRubricSearch] = useState<string>('');
  const [statusMessage, setStatusMessage] = useState<string>('');
  const [statusType, setStatusType] = useState<'success' | 'error' | 'info'>('info');

  // Load existing case data or prefill from selected patient
  useEffect(() => {
    if (selectedPatient) {
      const existing = systemForms.find(
        f => f.patientId === selectedPatient.id && f.system === 'other_mind_generals'
      );

      if (existing && existing.data && Object.keys(existing.data).length > 0) {
        setFormData({
          ...INITIAL_MIND_GENERALS_DATA,
          ...existing.data,
          patientName: selectedPatient.name,
          age: String(selectedPatient.age || ''),
          sex: selectedPatient.gender === 'Female' ? 'Female / स्त्री' : 'Male / पुरुष',
          mobile: selectedPatient.mobile || '',
          patientId: selectedPatient.id,
          occupation: selectedPatient.occupation || existing.data.occupation || '',
          date: existing.data.date || new Date().toISOString().slice(0, 10),
          pulse: existing.data.pulse || String(selectedPatient.vitals?.pulse || ''),
          bp: existing.data.bp || (selectedPatient.vitals?.bpSystolic ? `${selectedPatient.vitals.bpSystolic}/${selectedPatient.vitals.bpDiastolic}` : ''),
          weight: existing.data.weight || String(selectedPatient.vitals?.weight || '')
        });
        return;
      }

      try {
        const stored = localStorage.getItem(`arogya_psychosomatic_case_${selectedPatient.id}`) ||
                       localStorage.getItem('arogya_psychosomatic_case');
        if (stored) {
          const parsed = JSON.parse(stored);
          setFormData(prev => ({
            ...prev,
            ...parsed,
            patientName: selectedPatient.name,
            age: String(selectedPatient.age || ''),
            sex: selectedPatient.gender === 'Female' ? 'Female / स्त्री' : 'Male / पुरुष',
            mobile: selectedPatient.mobile || '',
            patientId: selectedPatient.id,
            occupation: selectedPatient.occupation || parsed.occupation || ''
          }));
          return;
        }
      } catch (_) {}

      setFormData({
        ...INITIAL_MIND_GENERALS_DATA,
        patientName: selectedPatient.name,
        age: String(selectedPatient.age || ''),
        sex: selectedPatient.gender === 'Female' ? 'Female / स्त्री' : 'Male / पुरुष',
        mobile: selectedPatient.mobile || '',
        patientId: selectedPatient.id,
        occupation: selectedPatient.occupation || '',
        pulse: selectedPatient.vitals?.pulse ? String(selectedPatient.vitals.pulse) : '',
        bp: selectedPatient.vitals?.bpSystolic ? `${selectedPatient.vitals.bpSystolic}/${selectedPatient.vitals.bpDiastolic}` : '',
        weight: selectedPatient.vitals?.weight ? String(selectedPatient.vitals.weight) : ''
      });
    }
  }, [selectedPatient, systemForms]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { id, name, value } = e.target;
    const key = (name || id) as keyof MindGeneralsFormData;
    setFormData(prev => ({ ...prev, [key]: value }));
  };

  const handleCheckboxToggle = (category: 'mind' | 'trigger' | 'body' | 'mod', value: string) => {
    setFormData(prev => {
      const currentList = prev[category] || [];
      const updated = currentList.includes(value)
        ? currentList.filter(item => item !== value)
        : [...currentList, value];
      return { ...prev, [category]: updated };
    });
  };

  const handleRubricToggle = (rubricValue: string) => {
    setFormData(prev => {
      const current = prev.rubrics || [];
      const updated = current.includes(rubricValue)
        ? current.filter(r => r !== rubricValue)
        : [...current, rubricValue];

      // Keep selectedRubrics textarea in sync
      return {
        ...prev,
        rubrics: updated,
        selectedRubrics: updated.join('\n')
      };
    });
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files) return;
    const files = Array.from(e.target.files);
    const newFiles: { name: string; type: string; data: string | null }[] = [];

    for (const file of files) {
      if (file.type.startsWith('image/')) {
        const dataUrl = await new Promise<string>((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = () => resolve(reader.result as string);
          reader.onerror = reject;
          reader.readAsDataURL(file);
        });
        newFiles.push({ name: file.name, type: file.type, data: dataUrl });
      } else {
        newFiles.push({ name: file.name, type: file.type, data: null });
      }
    }

    setFormData(prev => ({
      ...prev,
      reportFiles: [...(prev.reportFiles || []), ...newFiles]
    }));
  };

  const removeFile = (index: number) => {
    setFormData(prev => ({
      ...prev,
      reportFiles: (prev.reportFiles || []).filter((_, i) => i !== index)
    }));
  };

  const handleSave = () => {
    if (!formData.patientName.trim()) {
      setStatusMessage('Please enter Patient Name / कृपया रुग्णाचे नाव भरा.');
      setStatusType('error');
      return;
    }

    const savedAt = new Date().toISOString();
    const updatedData = { ...formData, savedAt };

    if (selectedPatient) {
      localStorage.setItem(`arogya_psychosomatic_case_${selectedPatient.id}`, JSON.stringify(updatedData));
    }
    localStorage.setItem('arogya_psychosomatic_case', JSON.stringify(updatedData));

    // Construct clean chief complaints summary
    const chiefComplaintsText = [
      formData.mainComplaint ? `Main: ${formData.mainComplaint}` : '',
      formData.mind?.length ? `Mind: ${formData.mind.slice(0, 3).join(', ')}` : '',
      formData.trigger?.length ? `Trigger: ${formData.trigger.slice(0, 2).join(', ')}` : '',
      formData.body?.length ? `Somatization: ${formData.body.slice(0, 3).join(', ')}` : ''
    ].filter(Boolean).join(' • ');

    const modalitiesAgg = formData.mod?.filter(m => m.includes('Worse')).join(', ') || 'Stress, suppression';
    const modalitiesAmel = formData.mod?.filter(m => m.includes('Better')).join(', ') || 'Warmth, relaxation, solitude';

    if (selectedPatient) {
      saveSystemForm({
        patientId: selectedPatient.id,
        system: 'other_mind_generals',
        chiefComplaints: chiefComplaintsText || 'Psycho-Somatic & Generals Case Taking',
        duration: formData.onsetDuration || 'Recorded Case',
        severity: formData.mind.length > 5 ? 'Severe' : formData.mind.length > 2 ? 'Moderate' : 'Mild',
        modalitiesAggravation: modalitiesAgg,
        modalitiesAmelioration: modalitiesAmel,
        concomitants: formData.seqPhysical || formData.associated || '',
        clinicalNotes: formData.assessment || formData.plan || formData.followNotes || '',
        data: updatedData,
        submittedVia: 'Doctor_Dashboard'
      });
    }

    setStatusMessage('✓ Case saved successfully / केस यशस्वीपणे जतन केला. Synced with patient record.');
    setStatusType('success');
    setTimeout(() => setStatusMessage(''), 5000);
  };

  const handleSubmit = () => {
    handleSave();
    setStatusMessage('✓ Case submitted locally / केस स्थानिकरित्या सबमिट केला. Opening print preview...');
    setStatusType('success');
    setTimeout(() => {
      window.print();
    }, 600);
  };

  const handleClear = () => {
    if (window.confirm('Clear this case? / हा केस साफ करायचा आहे का?')) {
      setFormData(INITIAL_MIND_GENERALS_DATA);
      if (selectedPatient) {
        localStorage.removeItem(`arogya_psychosomatic_case_${selectedPatient.id}`);
      }
      localStorage.removeItem('arogya_psychosomatic_case');
      setStatusMessage('Case cleared / केस साफ करण्यात आला.');
      setStatusType('info');
      setTimeout(() => setStatusMessage(''), 3000);
    }
  };

  const filteredRubrics = KENT_MIND_RUBRICS.filter(r =>
    r.toLowerCase().includes(rubricSearch.toLowerCase())
  );

  return (
    <div className="space-y-6 text-xs text-slate-800 pb-20">
      {/* Toast message */}
      {statusMessage && (
        <div
          className={`p-3.5 rounded-xl border flex items-center gap-2 text-xs font-medium shadow-sm transition-all ${
            statusType === 'success'
              ? 'bg-emerald-50 text-emerald-900 border-emerald-300'
              : statusType === 'error'
              ? 'bg-rose-50 text-rose-900 border-rose-300'
              : 'bg-teal-50 text-teal-900 border-teal-300'
          }`}
        >
          <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
          <span>{statusMessage}</span>
        </div>
      )}

      {/* Main Header Banner */}
      <div className="rounded-2xl overflow-hidden shadow-sm border border-teal-700/20">
        <div className="bg-gradient-to-r from-[#176b45] to-[#24905f] text-white p-6 sm:p-7 text-center space-y-1">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/15 text-white text-[11px] font-semibold mb-1">
            <Brain className="w-3.5 h-3.5" />
            <span>Classical Homeopathy Psycho-Somatic Protocol</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold font-serif tracking-tight text-white">
            Dr. Bharat's Arogya Homeopathy
          </h1>
          <p className="text-xs sm:text-sm text-emerald-100 font-medium">
            Psycho-Somatic Case Taking / मानसिक-शारीरिक केस टेकिंग
          </p>
        </div>
      </div>

      {/* Form Container */}
      <form onSubmit={(e) => { e.preventDefault(); handleSave(); }} className="space-y-5">

        {/* 1. Patient Information */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs space-y-4">
          <h2 className="text-sm sm:text-base font-bold text-[#176b45] pb-2 border-b border-emerald-100 flex items-center gap-2">
            <span className="w-6 h-6 rounded-full bg-emerald-100 text-[#176b45] flex items-center justify-center text-xs font-bold">1</span>
            Patient Information / रुग्णाची माहिती
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3.5">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Patient Name / रुग्णाचे नाव
              </label>
              <input
                type="text"
                id="patientName"
                name="patientName"
                value={formData.patientName}
                onChange={handleChange}
                placeholder="Full Name"
                className="w-full border border-slate-300 rounded-lg p-2.5 text-xs focus:ring-2 focus:ring-[#176b45] focus:outline-none bg-white"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Age / वय</label>
              <input
                type="text"
                inputMode="numeric"
                id="age"
                name="age"
                value={formData.age}
                onChange={(e) => {
                  const val = e.target.value.replace(/[^0-9.]/g, '');
                  handleChange({ target: { name: 'age', value: val } } as any);
                }}
                onWheel={(e) => (e.target as HTMLElement).blur()}
                placeholder="Years"
                className="w-full border border-slate-300 rounded-lg p-2.5 text-xs focus:ring-2 focus:ring-[#176b45] focus:outline-none bg-white [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Sex / लिंग</label>
              <select
                id="sex"
                name="sex"
                value={formData.sex}
                onChange={handleChange}
                className="w-full border border-slate-300 rounded-lg p-2.5 text-xs focus:ring-2 focus:ring-[#176b45] focus:outline-none bg-white"
              >
                <option value="">Select / निवडा</option>
                <option value="Male / पुरुष">Male / पुरुष</option>
                <option value="Female / स्त्री">Female / स्त्री</option>
                <option value="Other / इतर">Other / इतर</option>
              </select>
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Mobile / मोबाईल</label>
              <input
                type="text"
                id="mobile"
                name="mobile"
                value={formData.mobile}
                onChange={handleChange}
                placeholder="+91..."
                className="w-full border border-slate-300 rounded-lg p-2.5 text-xs focus:ring-2 focus:ring-[#176b45] focus:outline-none bg-white"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Date / दिनांक</label>
              <input
                type="date"
                id="date"
                name="date"
                value={formData.date}
                onChange={handleChange}
                className="w-full border border-slate-300 rounded-lg p-2.5 text-xs focus:ring-2 focus:ring-[#176b45] focus:outline-none bg-white"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Occupation / व्यवसाय</label>
              <input
                type="text"
                id="occupation"
                name="occupation"
                value={formData.occupation}
                onChange={handleChange}
                placeholder="e.g. Teacher, Engineer, Homemaker"
                className="w-full border border-slate-300 rounded-lg p-2.5 text-xs focus:ring-2 focus:ring-[#176b45] focus:outline-none bg-white"
              />
            </div>
          </div>
        </div>

        {/* 2. Chief Physical Complaints */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs space-y-4">
          <h2 className="text-sm sm:text-base font-bold text-[#176b45] pb-2 border-b border-emerald-100 flex items-center gap-2">
            <span className="w-6 h-6 rounded-full bg-emerald-100 text-[#176b45] flex items-center justify-center text-xs font-bold">2</span>
            Chief Physical Complaints / मुख्य शारीरिक तक्रारी
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Main Complaint / मुख्य तक्रार
              </label>
              <textarea
                id="mainComplaint"
                name="mainComplaint"
                value={formData.mainComplaint}
                onChange={handleChange}
                rows={3}
                placeholder="Describe principal presenting complaint..."
                className="w-full border border-slate-300 rounded-lg p-2.5 text-xs focus:ring-2 focus:ring-[#176b45] focus:outline-none"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Site, Sensation & Character / स्थान, संवेदना व स्वरूप
              </label>
              <textarea
                id="complaintCharacter"
                name="complaintCharacter"
                value={formData.complaintCharacter}
                onChange={handleChange}
                rows={3}
                placeholder="Exact location, burning, throbbing, stitching, cramping..."
                className="w-full border border-slate-300 rounded-lg p-2.5 text-xs focus:ring-2 focus:ring-[#176b45] focus:outline-none"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Onset & Duration / सुरुवात व कालावधी
              </label>
              <textarea
                id="onsetDuration"
                name="onsetDuration"
                value={formData.onsetDuration}
                onChange={handleChange}
                rows={2}
                placeholder="When did it begin? Sudden vs gradual..."
                className="w-full border border-slate-300 rounded-lg p-2.5 text-xs focus:ring-2 focus:ring-[#176b45] focus:outline-none"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Associated Symptoms / संबंधित लक्षणे
              </label>
              <textarea
                id="associated"
                name="associated"
                value={formData.associated}
                onChange={handleChange}
                rows={2}
                placeholder="Accompanying nausea, sweating, trembling, dizziness..."
                className="w-full border border-slate-300 rounded-lg p-2.5 text-xs focus:ring-2 focus:ring-[#176b45] focus:outline-none"
              />
            </div>
          </div>
        </div>

        {/* 3. Mental & Emotional State */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs space-y-4">
          <h2 className="text-sm sm:text-base font-bold text-[#176b45] pb-2 border-b border-emerald-100 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-emerald-100 text-[#176b45] flex items-center justify-center text-xs font-bold">3</span>
              <span>Mental & Emotional State / मानसिक व भावनिक अवस्था</span>
            </div>
            <span className="text-[11px] text-emerald-800 font-semibold bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
              {formData.mind.length} Selected
            </span>
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2">
            {MENTAL_STATE_OPTIONS.map((item) => {
              const isChecked = formData.mind.includes(item);
              return (
                <label
                  key={item}
                  onClick={() => handleCheckboxToggle('mind', item)}
                  className={`flex items-center gap-2.5 p-2.5 rounded-lg border text-xs cursor-pointer select-none transition-all ${
                    isChecked
                      ? 'bg-emerald-50/80 border-emerald-400 text-emerald-950 font-semibold shadow-2xs'
                      : 'bg-[#f7faf8] border-[#e0e9e3] text-slate-700 hover:border-slate-300'
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={isChecked}
                    onChange={() => {}}
                    className="rounded text-[#176b45] focus:ring-[#176b45] w-3.5 h-3.5"
                  />
                  <span className="truncate">{item}</span>
                </label>
              );
            })}
          </div>
          <div className="pt-2">
            <label className="block font-semibold text-slate-700 mb-1">
              Detailed Mental State / मानसिक स्थितीचे सविस्तर वर्णन
            </label>
            <textarea
              id="mentalDetail"
              name="mentalDetail"
              value={formData.mentalDetail}
              onChange={handleChange}
              rows={3}
              placeholder="Exact words of patient, thoughts, feelings, behaviour, fears, desires, aversions, crying triggers..."
              className="w-full border border-slate-300 rounded-lg p-2.5 text-xs focus:ring-2 focus:ring-[#176b45] focus:outline-none"
            />
          </div>
        </div>

        {/* 4. Emotional Trigger */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs space-y-4">
          <h2 className="text-sm sm:text-base font-bold text-[#176b45] pb-2 border-b border-emerald-100 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-emerald-100 text-[#176b45] flex items-center justify-center text-xs font-bold">4</span>
              <span>Emotional Trigger / मानसिक-भावनिक कारण</span>
            </div>
            <span className="text-[11px] text-amber-800 font-semibold bg-amber-50 px-2 py-0.5 rounded-md border border-amber-200">
              {formData.trigger.length} Selected
            </span>
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2">
            {EMOTIONAL_TRIGGERS.map((item) => {
              const isChecked = formData.trigger.includes(item);
              return (
                <label
                  key={item}
                  onClick={() => handleCheckboxToggle('trigger', item)}
                  className={`flex items-center gap-2.5 p-2.5 rounded-lg border text-xs cursor-pointer select-none transition-all ${
                    isChecked
                      ? 'bg-amber-50/80 border-amber-400 text-amber-950 font-semibold shadow-2xs'
                      : 'bg-[#f7faf8] border-[#e0e9e3] text-slate-700 hover:border-slate-300'
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={isChecked}
                    onChange={() => {}}
                    className="rounded text-amber-600 focus:ring-amber-500 w-3.5 h-3.5"
                  />
                  <span className="truncate">{item}</span>
                </label>
              );
            })}
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5 pt-2">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Trigger / Event Details / घटना किंवा कारण
              </label>
              <textarea
                id="triggerDetail"
                name="triggerDetail"
                value={formData.triggerDetail}
                onChange={handleChange}
                rows={3}
                placeholder="Describe the inciting event, conflict, loss, or stressor in detail..."
                className="w-full border border-slate-300 rounded-lg p-2.5 text-xs focus:ring-2 focus:ring-[#176b45] focus:outline-none"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Patient's Interpretation / रुग्णाचा त्या घटनेकडे पाहण्याचा दृष्टिकोन
              </label>
              <textarea
                id="interpretation"
                name="interpretation"
                value={formData.interpretation}
                onChange={handleChange}
                rows={3}
                placeholder="How did patient perceive or internalize it? (Felt betrayed, unloved, neglected, helpless...)"
                className="w-full border border-slate-300 rounded-lg p-2.5 text-xs focus:ring-2 focus:ring-[#176b45] focus:outline-none"
              />
            </div>
          </div>
        </div>

        {/* 5. Emotion -> Body Sequence */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs space-y-4">
          <h2 className="text-sm sm:text-base font-bold text-[#176b45] pb-2 border-b border-emerald-100 flex items-center gap-2">
            <span className="w-6 h-6 rounded-full bg-emerald-100 text-[#176b45] flex items-center justify-center text-xs font-bold">5</span>
            Emotion → Body Sequence / भावना → शरीर प्रतिक्रिया
          </h2>

          <div className="p-3 bg-[#fff8e8] border-l-4 border-[#f5a623] rounded-r-xl text-xs text-amber-900 leading-relaxed font-medium">
            ℹ️ Record the patient's reported sequence. This documents an association; it does not by itself establish that an emotion caused a physical disease.
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5 pt-1">
            <div className="border-l-4 border-[#176b45] bg-[#f8fbf9] p-3.5 rounded-r-xl space-y-1">
              <strong className="block text-[#176b45] font-bold text-xs">
                1. Event / घटना
              </strong>
              <textarea
                id="seqEvent"
                name="seqEvent"
                value={formData.seqEvent}
                onChange={handleChange}
                rows={2}
                placeholder="What happened?"
                className="w-full border border-slate-300 rounded-lg p-2 text-xs bg-white focus:outline-none focus:ring-1 focus:ring-[#176b45]"
              />
            </div>

            <div className="border-l-4 border-[#176b45] bg-[#f8fbf9] p-3.5 rounded-r-xl space-y-1">
              <strong className="block text-[#176b45] font-bold text-xs">
                2. Emotion / भावना
              </strong>
              <textarea
                id="seqEmotion"
                name="seqEmotion"
                value={formData.seqEmotion}
                onChange={handleChange}
                rows={2}
                placeholder="What did the patient feel?"
                className="w-full border border-slate-300 rounded-lg p-2 text-xs bg-white focus:outline-none focus:ring-1 focus:ring-[#176b45]"
              />
            </div>

            <div className="border-l-4 border-[#176b45] bg-[#f8fbf9] p-3.5 rounded-r-xl space-y-1">
              <strong className="block text-[#176b45] font-bold text-xs">
                3. Thought / विचार
              </strong>
              <textarea
                id="seqThought"
                name="seqThought"
                value={formData.seqThought}
                onChange={handleChange}
                rows={2}
                placeholder="What was going through the patient's mind?"
                className="w-full border border-slate-300 rounded-lg p-2 text-xs bg-white focus:outline-none focus:ring-1 focus:ring-[#176b45]"
              />
            </div>

            <div className="border-l-4 border-[#176b45] bg-[#f8fbf9] p-3.5 rounded-r-xl space-y-1">
              <strong className="block text-[#176b45] font-bold text-xs">
                4. Physical Symptom / शारीरिक लक्षण
              </strong>
              <textarea
                id="seqPhysical"
                name="seqPhysical"
                value={formData.seqPhysical}
                onChange={handleChange}
                rows={2}
                placeholder="What physical symptom appeared?"
                className="w-full border border-slate-300 rounded-lg p-2 text-xs bg-white focus:outline-none focus:ring-1 focus:ring-[#176b45]"
              />
            </div>

            <div className="border-l-4 border-[#176b45] bg-[#f8fbf9] p-3.5 rounded-r-xl space-y-1">
              <strong className="block text-[#176b45] font-bold text-xs">
                5. Time to Onset / सुरुवातीचा कालावधी
              </strong>
              <input
                type="text"
                id="seqOnset"
                name="seqOnset"
                value={formData.seqOnset}
                onChange={handleChange}
                placeholder="Immediately / 10 min / hours / next day"
                className="w-full border border-slate-300 rounded-lg p-2 text-xs bg-white focus:outline-none focus:ring-1 focus:ring-[#176b45]"
              />
            </div>

            <div className="border-l-4 border-[#176b45] bg-[#f8fbf9] p-3.5 rounded-r-xl space-y-1">
              <strong className="block text-[#176b45] font-bold text-xs">
                6. Duration & Frequency / कालावधी व वारंवारता
              </strong>
              <textarea
                id="seqDuration"
                name="seqDuration"
                value={formData.seqDuration}
                onChange={handleChange}
                rows={2}
                placeholder="How long does symptom persist? How often?"
                className="w-full border border-slate-300 rounded-lg p-2 text-xs bg-white focus:outline-none focus:ring-1 focus:ring-[#176b45]"
              />
            </div>

            <div className="border-l-4 border-[#176b45] bg-[#f8fbf9] p-3.5 rounded-r-xl space-y-1">
              <strong className="block text-[#176b45] font-bold text-xs">
                7. Better / Worse / कशाने वाढते-कमी होते
              </strong>
              <textarea
                id="seqModalities"
                name="seqModalities"
                value={formData.seqModalities}
                onChange={handleChange}
                rows={2}
                placeholder="Modalities during somatization..."
                className="w-full border border-slate-300 rounded-lg p-2 text-xs bg-white focus:outline-none focus:ring-1 focus:ring-[#176b45]"
              />
            </div>

            <div className="border-l-4 border-[#176b45] bg-[#f8fbf9] p-3.5 rounded-r-xl space-y-1">
              <strong className="block text-[#176b45] font-bold text-xs">
                8. Concomitants / सहलक्षणे
              </strong>
              <textarea
                id="seqConcomitant"
                name="seqConcomitant"
                value={formData.seqConcomitant}
                onChange={handleChange}
                rows={2}
                placeholder="Associated sweating, yawning, sighing, trembling..."
                className="w-full border border-slate-300 rounded-lg p-2 text-xs bg-white focus:outline-none focus:ring-1 focus:ring-[#176b45]"
              />
            </div>
          </div>
        </div>

        {/* 6. Psycho-Somatic Symptom Mapping */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs space-y-4">
          <h2 className="text-sm sm:text-base font-bold text-[#176b45] pb-2 border-b border-emerald-100 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-emerald-100 text-[#176b45] flex items-center justify-center text-xs font-bold">6</span>
              <span>Psycho-Somatic Symptom Mapping / मानसिक-शारीरिक लक्षण नोंद</span>
            </div>
            <span className="text-[11px] text-teal-800 font-semibold bg-teal-50 px-2 py-0.5 rounded-md border border-teal-200">
              {formData.body.length} Affected Areas
            </span>
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2">
            {PSYCHOSOMATIC_BODY_SYMPTOMS.map((item) => {
              const isChecked = formData.body.includes(item);
              return (
                <label
                  key={item}
                  onClick={() => handleCheckboxToggle('body', item)}
                  className={`flex items-center gap-2.5 p-2.5 rounded-lg border text-xs cursor-pointer select-none transition-all ${
                    isChecked
                      ? 'bg-teal-50/80 border-teal-400 text-teal-950 font-semibold shadow-2xs'
                      : 'bg-[#f7faf8] border-[#e0e9e3] text-slate-700 hover:border-slate-300'
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={isChecked}
                    onChange={() => {}}
                    className="rounded text-teal-600 focus:ring-teal-500 w-3.5 h-3.5"
                  />
                  <span className="truncate">{item}</span>
                </label>
              );
            })}
          </div>

          <div className="pt-2">
            <label className="block font-semibold text-slate-700 mb-1">
              Detailed Association / संबंधाचे सविस्तर वर्णन
            </label>
            <textarea
              id="bodyDetail"
              name="bodyDetail"
              value={formData.bodyDetail}
              onChange={handleChange}
              rows={3}
              placeholder="e.g. Headache starts specifically after suppressed anger; Acidity flares before interviews..."
              className="w-full border border-slate-300 rounded-lg p-2.5 text-xs focus:ring-2 focus:ring-[#176b45] focus:outline-none"
            />
          </div>
        </div>

        {/* 7. Kent Mind Rubric Selection */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs space-y-4">
          <h2 className="text-sm sm:text-base font-bold text-[#176b45] pb-2 border-b border-emerald-100 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-emerald-100 text-[#176b45] flex items-center justify-center text-xs font-bold">7</span>
              <span>Kent Mind Rubric Selection / Kent Mind Rubric निवड</span>
            </div>
            <span className="text-[11px] text-purple-800 font-semibold bg-purple-50 px-2 py-0.5 rounded-md border border-purple-200">
              Repertory Alignment
            </span>
          </h2>

          <div className="p-3 bg-[#fff8e8] border-l-4 border-[#f5a623] rounded-r-xl text-xs text-amber-900 leading-relaxed font-medium">
            ℹ️ Use the repertory wording carefully and verify the exact rubric in the source repertory before repertorisation.
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5 pt-1">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Rubric Search / Rubric शोध
              </label>
              <input
                type="text"
                id="rubricSearch"
                value={rubricSearch}
                onChange={(e) => setRubricSearch(e.target.value)}
                placeholder="Search rubrics e.g. anxiety, anger, grief, concentration..."
                className="w-full border border-slate-300 rounded-lg p-2.5 text-xs focus:ring-2 focus:ring-[#176b45] focus:outline-none bg-white"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Selected Rubrics / निवडलेले Rubrics
              </label>
              <textarea
                id="selectedRubrics"
                name="selectedRubrics"
                value={formData.selectedRubrics}
                onChange={handleChange}
                rows={3}
                placeholder="Enter verified Kent rubric(s)... (Auto-updates with checkbox clicks)"
                className="w-full border border-slate-300 rounded-lg p-2.5 text-xs focus:ring-2 focus:ring-[#176b45] focus:outline-none font-mono text-[11px]"
              />
            </div>
          </div>

          <div className="pt-2">
            <span className="text-[11px] text-slate-500 font-semibold uppercase block mb-2">
              Quick Kent Mind Rubrics ({filteredRubrics.length} matching):
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2 max-h-56 overflow-y-auto pr-1">
              {filteredRubrics.map((rubric) => {
                const isChecked = formData.rubrics.includes(rubric);
                return (
                  <label
                    key={rubric}
                    onClick={() => handleRubricToggle(rubric)}
                    className={`flex items-center gap-2.5 p-2 rounded-lg border text-xs cursor-pointer select-none transition-all ${
                      isChecked
                        ? 'bg-purple-50/90 border-purple-400 text-purple-950 font-semibold'
                        : 'bg-[#f7faf8] border-[#e0e9e3] text-slate-700 hover:border-slate-300'
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={isChecked}
                      onChange={() => {}}
                      className="rounded text-purple-600 focus:ring-purple-500 w-3.5 h-3.5"
                    />
                    <span className="truncate">{rubric}</span>
                  </label>
                );
              })}
            </div>
          </div>
        </div>

        {/* 8. General Modalities & Generals */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs space-y-4">
          <h2 className="text-sm sm:text-base font-bold text-[#176b45] pb-2 border-b border-emerald-100 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-emerald-100 text-[#176b45] flex items-center justify-center text-xs font-bold">8</span>
              <span>General Modalities & Generals / सामान्य लक्षणे व Modalities</span>
            </div>
            <span className="text-[11px] text-indigo-800 font-semibold bg-indigo-50 px-2 py-0.5 rounded-md border border-indigo-200">
              {formData.mod.length} Modalities
            </span>
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2">
            {GENERAL_MODALITIES.map((item) => {
              const isChecked = formData.mod.includes(item);
              return (
                <label
                  key={item}
                  onClick={() => handleCheckboxToggle('mod', item)}
                  className={`flex items-center gap-2.5 p-2.5 rounded-lg border text-xs cursor-pointer select-none transition-all ${
                    isChecked
                      ? 'bg-indigo-50/80 border-indigo-400 text-indigo-950 font-semibold shadow-2xs'
                      : 'bg-[#f7faf8] border-[#e0e9e3] text-slate-700 hover:border-slate-300'
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={isChecked}
                    onChange={() => {}}
                    className="rounded text-indigo-600 focus:ring-indigo-500 w-3.5 h-3.5"
                  />
                  <span className="truncate">{item}</span>
                </label>
              );
            })}
          </div>

          <div className="pt-2">
            <label className="block font-semibold text-slate-700 mb-1">
              Other Generals / इतर सामान्य लक्षणे
            </label>
            <textarea
              id="generals"
              name="generals"
              value={formData.generals}
              onChange={handleChange}
              rows={3}
              placeholder="Thermal reaction (Chilly vs Hot), weather sensitivities, bath preferences, sun intolerance..."
              className="w-full border border-slate-300 rounded-lg p-2.5 text-xs focus:ring-2 focus:ring-[#176b45] focus:outline-none"
            />
          </div>
        </div>

        {/* 9. Sleep, Dreams & Daily Function */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs space-y-4">
          <h2 className="text-sm sm:text-base font-bold text-[#176b45] pb-2 border-b border-emerald-100 flex items-center gap-2">
            <span className="w-6 h-6 rounded-full bg-emerald-100 text-[#176b45] flex items-center justify-center text-xs font-bold">9</span>
            Sleep, Dreams & Daily Function / झोप, स्वप्ने व दैनंदिन कार्य
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Sleep / झोप</label>
              <textarea
                id="sleep"
                name="sleep"
                value={formData.sleep}
                onChange={handleChange}
                rows={2}
                placeholder="Insomnia, waking times, unrefreshing, position during sleep..."
                className="w-full border border-slate-300 rounded-lg p-2.5 text-xs focus:ring-2 focus:ring-[#176b45] focus:outline-none"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Dreams / स्वप्ने</label>
              <textarea
                id="dreams"
                name="dreams"
                value={formData.dreams}
                onChange={handleChange}
                rows={2}
                placeholder="Recurring dreams, falling, flying, dead people, animals, anxiety..."
                className="w-full border border-slate-300 rounded-lg p-2.5 text-xs focus:ring-2 focus:ring-[#176b45] focus:outline-none"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Appetite & Thirst / भूक व तहान</label>
              <textarea
                id="appetite"
                name="appetite"
                value={formData.appetite}
                onChange={handleChange}
                rows={2}
                placeholder="Cravings (spicy, sweet, salty, sour), aversions, thirst quantity & frequency..."
                className="w-full border border-slate-300 rounded-lg p-2.5 text-xs focus:ring-2 focus:ring-[#176b45] focus:outline-none"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Work / Social Function / काम व सामाजिक कार्य</label>
              <textarea
                id="function"
                name="function"
                value={formData.function}
                onChange={handleChange}
                rows={2}
                placeholder="Impact on career, family life, concentration, interpersonal relationships..."
                className="w-full border border-slate-300 rounded-lg p-2.5 text-xs focus:ring-2 focus:ring-[#176b45] focus:outline-none"
              />
            </div>
          </div>
        </div>

        {/* 10. Past & Family History */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs space-y-4">
          <h2 className="text-sm sm:text-base font-bold text-[#176b45] pb-2 border-b border-emerald-100 flex items-center gap-2">
            <span className="w-6 h-6 rounded-full bg-emerald-100 text-[#176b45] flex items-center justify-center text-xs font-bold">10</span>
            Past & Family History / पूर्व व कौटुंबिक इतिहास
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Past History / पूर्व इतिहास</label>
              <textarea
                id="past"
                name="past"
                value={formData.past}
                onChange={handleChange}
                rows={2}
                placeholder="Past illnesses, childhood diseases, surgeries, trauma, suppressions..."
                className="w-full border border-slate-300 rounded-lg p-2.5 text-xs focus:ring-2 focus:ring-[#176b45] focus:outline-none"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Family History / कौटुंबिक इतिहास</label>
              <textarea
                id="family"
                name="family"
                value={formData.family}
                onChange={handleChange}
                rows={2}
                placeholder="Hypertension, Diabetes, Cancer, Depression, Anxiety in parents/siblings..."
                className="w-full border border-slate-300 rounded-lg p-2.5 text-xs focus:ring-2 focus:ring-[#176b45] focus:outline-none"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Current Medicines / सध्या सुरू असलेली औषधे</label>
              <textarea
                id="medicines"
                name="medicines"
                value={formData.medicines}
                onChange={handleChange}
                rows={2}
                placeholder="Allopathic, Ayurvedic, psychotropic, sleeping pills, steroids..."
                className="w-full border border-slate-300 rounded-lg p-2.5 text-xs focus:ring-2 focus:ring-[#176b45] focus:outline-none"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Substance / Caffeine / Tobacco etc. / इतर सवयी</label>
              <textarea
                id="habits"
                name="habits"
                value={formData.habits}
                onChange={handleChange}
                rows={2}
                placeholder="Tea, coffee, alcohol, smoking, gutka, screen addiction..."
                className="w-full border border-slate-300 rounded-lg p-2.5 text-xs focus:ring-2 focus:ring-[#176b45] focus:outline-none"
              />
            </div>
          </div>
        </div>

        {/* 11. Examination & Investigations */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs space-y-4">
          <h2 className="text-sm sm:text-base font-bold text-[#176b45] pb-2 border-b border-emerald-100 flex items-center gap-2">
            <span className="w-6 h-6 rounded-full bg-emerald-100 text-[#176b45] flex items-center justify-center text-xs font-bold">11</span>
            Examination & Investigations / तपासणी व तपासण्या
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Pulse / नाडी</label>
              <input
                type="text"
                id="pulse"
                name="pulse"
                value={formData.pulse}
                onChange={handleChange}
                placeholder="e.g. 76 bpm"
                className="w-full border border-slate-300 rounded-lg p-2.5 text-xs focus:ring-2 focus:ring-[#176b45] focus:outline-none bg-white"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">BP / रक्तदाब</label>
              <input
                type="text"
                id="bp"
                name="bp"
                value={formData.bp}
                onChange={handleChange}
                placeholder="e.g. 120/80 mmHg"
                className="w-full border border-slate-300 rounded-lg p-2.5 text-xs focus:ring-2 focus:ring-[#176b45] focus:outline-none bg-white"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Weight / वजन</label>
              <input
                type="text"
                id="weight"
                name="weight"
                value={formData.weight}
                onChange={handleChange}
                placeholder="e.g. 64 kg"
                className="w-full border border-slate-300 rounded-lg p-2.5 text-xs focus:ring-2 focus:ring-[#176b45] focus:outline-none bg-white"
              />
            </div>
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">
              Clinical Examination / शारीरिक तपासणी
            </label>
            <textarea
              id="exam"
              name="exam"
              value={formData.exam}
              onChange={handleChange}
              rows={2}
              placeholder="Tongue, pupil reaction, tremor, nail bed, gait, facial expression..."
              className="w-full border border-slate-300 rounded-lg p-2.5 text-xs focus:ring-2 focus:ring-[#176b45] focus:outline-none"
            />
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">
              Investigation Summary / तपासणी अहवालाचा सारांश
            </label>
            <textarea
              id="investigation"
              name="investigation"
              value={formData.investigation}
              onChange={handleChange}
              rows={2}
              placeholder="CBC, Thyroid panel (TSH), ECG, MRI Brain, USG, Vitamin D3/B12..."
              className="w-full border border-slate-300 rounded-lg p-2.5 text-xs focus:ring-2 focus:ring-[#176b45] focus:outline-none"
            />
          </div>

          {/* File Upload Box */}
          <div className="border-2 border-dashed border-[#b9cfc2] p-4 rounded-xl bg-[#fbfdfb] space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <strong className="block text-slate-800 text-xs font-semibold">
                  Upload Investigation Photo / PDF / तपासणीचा फोटो/PDF अपलोड करा
                </strong>
                <span className="text-[11px] text-slate-500">
                  Attach lab reports, MRI scans, or handwritten questionnaires
                </span>
              </div>
              <label className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-semibold cursor-pointer flex items-center gap-1.5 transition-colors shadow-2xs">
                <Upload className="w-3.5 h-3.5" />
                <span>Choose Files</span>
                <input
                  type="file"
                  id="files"
                  multiple
                  accept="image/*,.pdf"
                  onChange={handleFileUpload}
                  className="hidden"
                />
              </label>
            </div>

            {formData.reportFiles && formData.reportFiles.length > 0 && (
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 pt-2">
                {formData.reportFiles.map((file, idx) => (
                  <div key={idx} className="relative border border-slate-200 rounded-lg p-2 bg-white shadow-2xs">
                    <button
                      type="button"
                      onClick={() => removeFile(idx)}
                      className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-rose-500 text-white rounded-full flex items-center justify-center hover:bg-rose-600 shadow-sm"
                      title="Remove"
                    >
                      <X className="w-3 h-3" />
                    </button>
                    {file.data ? (
                      <img src={file.data} alt={file.name} className="w-full h-24 object-cover rounded-md mb-1.5" />
                    ) : (
                      <div className="w-full h-24 bg-slate-100 flex items-center justify-center text-slate-400 rounded-md mb-1.5">
                        <FileText className="w-8 h-8" />
                      </div>
                    )}
                    <span className="block text-[10px] text-slate-700 truncate font-medium">
                      {file.name}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* 12. Assessment & Follow-up */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs space-y-4">
          <h2 className="text-sm sm:text-base font-bold text-[#176b45] pb-2 border-b border-emerald-100 flex items-center gap-2">
            <span className="w-6 h-6 rounded-full bg-emerald-100 text-[#176b45] flex items-center justify-center text-xs font-bold">12</span>
            Assessment & Follow-up / मूल्यांकन व फॉलो-अप
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Clinical Assessment / क्लिनिकल मूल्यांकन
              </label>
              <textarea
                id="assessment"
                name="assessment"
                value={formData.assessment}
                onChange={handleChange}
                rows={2.5}
                placeholder="Miasmatic diagnosis, psycho-neuro-immunology assessment, constitutional totality..."
                className="w-full border border-slate-300 rounded-lg p-2.5 text-xs focus:ring-2 focus:ring-[#176b45] focus:outline-none"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Plan / पुढील योजना</label>
              <textarea
                id="plan"
                name="plan"
                value={formData.plan}
                onChange={handleChange}
                rows={2.5}
                placeholder="Constitutional remedy selection, potency, diet, counseling, lifestyle..."
                className="w-full border border-slate-300 rounded-lg p-2.5 text-xs focus:ring-2 focus:ring-[#176b45] focus:outline-none"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Follow-up Date / पुढील भेट
              </label>
              <input
                type="date"
                id="followDate"
                name="followDate"
                value={formData.followDate}
                onChange={handleChange}
                className="w-full border border-slate-300 rounded-lg p-2.5 text-xs focus:ring-2 focus:ring-[#176b45] focus:outline-none bg-white"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Follow-up Notes / फॉलो-अप नोंदी
              </label>
              <textarea
                id="followNotes"
                name="followNotes"
                value={formData.followNotes}
                onChange={handleChange}
                rows={2}
                placeholder="Patient response milestones to track at next visit..."
                className="w-full border border-slate-300 rounded-lg p-2.5 text-xs focus:ring-2 focus:ring-[#176b45] focus:outline-none"
              />
            </div>
          </div>
        </div>

        {/* Sticky Action Footer */}
        <div className="sticky bottom-0 bg-[#f4f7f5]/95 backdrop-blur-sm py-3 border-t border-slate-200 flex items-center justify-between gap-2 flex-wrap z-10">
          <div className="flex items-center gap-2 flex-wrap">
            <button
              type="button"
              onClick={handleSave}
              className="px-4 py-2.5 bg-[#176b45] hover:bg-[#135737] text-white rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors shadow-sm cursor-pointer"
            >
              <Save className="w-4 h-4" />
              <span>💾 Save / जतन करा</span>
            </button>
            <button
              type="button"
              onClick={handleSubmit}
              className="px-4 py-2.5 bg-[#2477c5] hover:bg-[#1c64a8] text-white rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors shadow-sm cursor-pointer"
            >
              <span>📤 Submit / सबमिट करा</span>
            </button>
            <button
              type="button"
              onClick={() => window.print()}
              className="px-4 py-2.5 bg-[#f5a623] hover:bg-[#e0961d] text-slate-900 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors shadow-sm cursor-pointer"
            >
              <Printer className="w-4 h-4" />
              <span>🖨️ Print / प्रिंट</span>
            </button>
            <button
              type="button"
              onClick={handleClear}
              className="px-4 py-2.5 bg-[#e6e9e7] hover:bg-slate-200 text-[#26352d] rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>🗑️ Clear / साफ करा</span>
            </button>
          </div>

          {selectedPatient && (
            <button
              type="button"
              onClick={() => openWhatsAppShareDialog(selectedPatient.id, 'other_mind_generals')}
              className="px-3.5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors ml-auto shadow-sm"
            >
              <Share2 className="w-3.5 h-3.5" />
              <span>Share Form to WhatsApp</span>
            </button>
          )}
        </div>

      </form>
    </div>
  );
};
