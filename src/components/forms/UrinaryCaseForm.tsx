import React, { useState, useEffect } from 'react';
import { useClinic } from '../../context/ClinicContext';
import {
  Droplets,
  Save,
  CheckCircle2,
  RotateCcw,
  Printer,
  FileText,
  AlertTriangle
} from 'lucide-react';

export interface UrinaryFormData {
  patientName: string;
  age: string;
  sex: string;
  date: string;
  patientId: string;
  mobile: string;
  address: string;

  // 2. Main Complaints
  mainComplaint: string[];
  complaintDuration: string;
  complaintOnset: string;
  complaintSeverity: string;

  // 3. Urination Pattern
  dayFrequency: string;
  nightFrequency: string;
  approxQuantity: string;
  timeToStart: string;
  needToStrain: string;
  streamDuration: string;

  // 4. Burning & Painful Urination
  dysuria: string[];
  dysuriaDetails: string;

  // 5. Urine Characteristics
  urineChars: string[];
  urineColour: string;
  urineOdour: string;
  urineChangeSince: string;

  // 6. Kidney / Flank Pain
  flankPain: string[];
  flankSeverity: string;
  flankDuration: string;
  flankNausea: string;

  // 7. Kidney Stone
  stoneHistory: string[];
  stoneSize: string;
  stoneLocation: string;
  stoneSide: string;
  stoneDetails: string;

  // 8. UTI
  utiHistory: string[];
  utiEpisodes: string;
  utiLastEpisode: string;
  utiCulture: string;

  // 9. Prostate / Male Urinary Symptoms
  prostateSymptoms: string[];

  // 10. Prostate History
  prostateHistory: string[];
  psaValue: string;
  psaDate: string;
  prostateSize: string;
  prostateDetails: string;

  // 11. Male Genital Symptoms
  maleGenital: string[];
  maleGenitalDetails: string;

  // 12. Female Urinary Symptoms
  femaleUrinary: string[];
  femaleUrinaryDetails: string;

  // 13. Fluid Intake & Thirst
  waterIntake: string;
  thirst: string;
  nightWaterIntake: string;

  // 14. Previous Renal History
  previousRenalHistory: string[];
  previousRenalDetails: string;

  // 15. Investigations
  investigations: string[];
  investigationFindings: string;

  // 16. Red Flags
  redFlags: string[];
  urgentNotes: string;

  // 17. Clinical Assessment
  diagnosis: string;
  affectedRegion: string;
  clinicalSeverity: string;
  clinicalNotes: string;
  treatment: string;
  advice: string;
  followup: string;
  savedAt?: string;
}

const INITIAL_URINARY_DATA: UrinaryFormData = {
  patientName: '',
  age: '',
  sex: '',
  date: new Date().toISOString().split('T')[0],
  patientId: '',
  mobile: '',
  address: '',

  mainComplaint: ['Burning Urination', 'Frequent Urination'],
  complaintDuration: '2 weeks',
  complaintOnset: 'Sudden',
  complaintSeverity: 'Moderate',

  dayFrequency: '7-8 times',
  nightFrequency: '2 times',
  approxQuantity: 'Normal',
  timeToStart: 'Immediate',
  needToStrain: 'No',
  streamDuration: 'Normal',

  dysuria: ['Burning During Urination'],
  dysuriaDetails: 'Scalding sensation towards the end of urination with mild lower abdominal discomfort',

  urineChars: ['Dark', 'Cloudy'],
  urineColour: 'Dark Yellow',
  urineOdour: 'Strong',
  urineChangeSince: '1 week',

  flankPain: [],
  flankSeverity: 'Mild',
  flankDuration: '',
  flankNausea: 'No',

  stoneHistory: [],
  stoneSize: '',
  stoneLocation: '',
  stoneSide: '',
  stoneDetails: '',

  utiHistory: ['Burning', 'Frequency', 'Urgency'],
  utiEpisodes: '2 episodes this year',
  utiLastEpisode: '',
  utiCulture: 'No',

  prostateSymptoms: [],
  prostateHistory: [],
  psaValue: '',
  psaDate: '',
  prostateSize: '',
  prostateDetails: '',

  maleGenital: [],
  maleGenitalDetails: '',

  femaleUrinary: ['Recurrent UTI', 'Burning Urination', 'Urinary Frequency'],
  femaleUrinaryDetails: 'Recurrent burning after spicy food and long travels with inadequate water intake',

  waterIntake: '1.5 Litres/day (Low)',
  thirst: 'Decreased / कमी',
  nightWaterIntake: 'No',

  previousRenalHistory: ['UTI'],
  previousRenalDetails: '',

  investigations: ['Urine Routine'],
  investigationFindings: 'Urine R/M: Pus cells 15-20/hpf, RBCs 1-2, Epithelial cells plenty, Albumin trace',

  redFlags: [],
  urgentNotes: '',

  diagnosis: 'Acute Cystitis / Lower Urinary Tract Infection with dysuria',
  affectedRegion: 'Bladder & Urethra',
  clinicalSeverity: 'Moderate',
  clinicalNotes: 'Cantharis totality with burning scalding dysuria and drop-by-drop urgency.',
  treatment: 'Cantharis 200C QDS for 3 days, followed by Berberis Vulgaris Q 10 drops TDS',
  advice: 'Hydration 3.0–3.5 Litres daily, coconut water, barley water, avoid holding urine',
  followup: ''
};

export const UrinaryCaseForm: React.FC = () => {
  const {
    selectedPatient,
    patients,
    selectPatient,
    saveSystemForm,
    systemForms,
    setActiveTab
  } = useClinic();

  const [formData, setFormData] = useState<UrinaryFormData>(INITIAL_URINARY_DATA);
  const [statusMessage, setStatusMessage] = useState<string>('');
  const [statusType, setStatusType] = useState<'success' | 'error' | 'info'>('info');

  useEffect(() => {
    if (selectedPatient) {
      const existing = systemForms.find(
        f => f.patientId === selectedPatient.id && f.system === 'urinary'
      );

      if (existing && existing.data) {
        setFormData({
          ...INITIAL_URINARY_DATA,
          ...existing.data,
          patientName: selectedPatient.name,
          age: String(selectedPatient.age || ''),
          sex: selectedPatient.gender === 'Female' ? 'Female / स्त्री' : selectedPatient.gender === 'Male' ? 'Male / पुरुष' : 'Other',
          patientId: selectedPatient.id,
          mobile: selectedPatient.mobile || '',
          address: selectedPatient.address || existing.data.address || '',
          date: existing.data.date || new Date().toISOString().split('T')[0]
        });
        return;
      }

      try {
        const stored = localStorage.getItem(`URINARY_CASE_${selectedPatient.id}`);
        if (stored) {
          const parsed = JSON.parse(stored);
          setFormData(prev => ({
            ...prev,
            ...parsed,
            patientName: selectedPatient.name,
            age: String(selectedPatient.age || ''),
            sex: selectedPatient.gender === 'Female' ? 'Female / स्त्री' : selectedPatient.gender === 'Male' ? 'Male / पुरुष' : 'Other',
            patientId: selectedPatient.id,
            mobile: selectedPatient.mobile || '',
            address: selectedPatient.address || ''
          }));
          return;
        }
      } catch (_) {}

      setFormData(prev => ({
        ...prev,
        patientName: selectedPatient.name,
        age: String(selectedPatient.age || ''),
        sex: selectedPatient.gender === 'Female' ? 'Female / स्त्री' : selectedPatient.gender === 'Male' ? 'Male / पुरुष' : 'Other',
        patientId: selectedPatient.id,
        mobile: selectedPatient.mobile || '',
        address: selectedPatient.address || ''
      }));
    }
  }, [selectedPatient?.id, systemForms]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { id, value } = e.target;
    setFormData(prev => ({ ...prev, [id]: value }));
  };

  const handleCheckboxToggle = (category: keyof UrinaryFormData, value: string) => {
    setFormData(prev => {
      const currentList = (prev[category] as string[]) || [];
      const updated = currentList.includes(value)
        ? currentList.filter(item => item !== value)
        : [...currentList, value];
      return { ...prev, [category]: updated };
    });
  };

  const handleSave = () => {
    if (!formData.patientName.trim()) {
      setStatusMessage('Please enter Patient Name / कृपया रुग्णाचे नाव भरा.');
      setStatusType('error');
      return;
    }

    const savedAt = new Date().toLocaleString();
    const updatedData = { ...formData, savedAt };

    if (selectedPatient) {
      localStorage.setItem(`URINARY_CASE_${selectedPatient.id}`, JSON.stringify(updatedData));
    }
    localStorage.setItem('URINARY_CASE_' + formData.patientName, JSON.stringify(updatedData));

    const chiefComplaintsText = [
      formData.mainComplaint?.length ? `Chief complaints: ${formData.mainComplaint.join(', ')}` : '',
      formData.dysuria?.length ? `Dysuria: ${formData.dysuria.join(', ')}` : '',
      formData.complaintDuration ? `Duration: ${formData.complaintDuration}` : '',
      formData.urineColour ? `Urine: ${formData.urineColour}` : '',
      formData.stoneHistory?.length ? `Stone: ${formData.stoneHistory.join(', ')}` : ''
    ].filter(Boolean).join(' • ');

    const modalitiesAgg = 'Holding urine, dehydration, spicy food, movement';
    const modalitiesAmel = 'Profuse warm drinks, resting, urination completed';

    if (selectedPatient) {
      saveSystemForm({
        patientId: selectedPatient.id,
        system: 'urinary',
        chiefComplaints: chiefComplaintsText || 'Urinary & Renal Case Assessment',
        duration: formData.complaintDuration || 'Recorded Case',
        severity: formData.complaintSeverity === 'Severe' || formData.clinicalSeverity === 'Severe' ? 'Severe' : formData.complaintSeverity === 'Mild' ? 'Mild' : 'Moderate',
        modalitiesAggravation: modalitiesAgg,
        modalitiesAmelioration: modalitiesAmel,
        concomitants: formData.flankPain?.join(', ') || formData.dysuriaDetails || '',
        clinicalNotes: formData.clinicalNotes || formData.diagnosis || '',
        data: updatedData,
        submittedVia: 'Doctor_Dashboard'
      });
    }

    setStatusMessage('✓ Urinary Case Saved Successfully / केस यशस्वीरित्या सेव्ह झाली. Synced to Case Summary.');
    setStatusType('success');
    setTimeout(() => setStatusMessage(''), 5000);
  };

  const handleSubmit = () => {
    handleSave();
    setStatusMessage('✓ Case Submitted Successfully / केस यशस्वीरित्या सबमिट झाली. Opening printable view...');
    setStatusType('success');
    setTimeout(() => {
      window.print();
    }, 600);
  };

  const handleClear = () => {
    if (window.confirm('Clear all entered information?\nसर्व माहिती क्लिअर करायची आहे का?')) {
      setFormData(INITIAL_URINARY_DATA);
      setStatusMessage('Form cleared.');
      setStatusType('info');
      setTimeout(() => setStatusMessage(''), 3000);
    }
  };

  return (
    <div className="space-y-6 pb-28 max-w-6xl mx-auto">
      {/* Patient Ribbon */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-700">
            <Droplets className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs uppercase font-bold text-emerald-800 tracking-wider">Clinical Module</span>
              <span className="text-slate-300">•</span>
              <span className="text-xs font-semibold text-slate-600">
                Active Patient: <strong className="text-slate-900">{selectedPatient?.name || 'No Patient Selected'}</strong>
              </span>
            </div>
            <h2 className="text-lg font-bold text-slate-900 font-serif">
              Urinary System & Prostate Case Taking (मूत्रसंस्था व प्रोस्टेट केस टेकिंग)
            </h2>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <select
            value={selectedPatient?.id || ''}
            onChange={(e) => {
              const pat = patients.find(p => p.id === e.target.value);
              if (pat) selectPatient(pat.id);
            }}
            className="px-3 py-1.5 bg-slate-50 border border-slate-300 rounded-xl text-xs font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500"
          >
            <option value="" disabled>Switch Patient...</option>
            {patients.map(p => (
              <option key={p.id} value={p.id}>{p.name} ({p.id})</option>
            ))}
          </select>

          <button
            type="button"
            onClick={() => setActiveTab('case_summary')}
            className="px-3.5 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors"
          >
            <FileText className="w-3.5 h-3.5" />
            <span>View Consolidated Summary</span>
          </button>
        </div>
      </div>

      {/* Header Banner */}
      <header className="bg-gradient-to-r from-emerald-800 to-teal-600 text-white rounded-2xl p-6 shadow-md text-center">
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">
          Dr. Bharat's Arogya Homeopathy
        </h1>
        <h2 className="text-lg sm:text-xl font-semibold mt-1">
          Urinary System & Prostate Case Taking
        </h2>
        <div className="text-sm sm:text-base font-medium opacity-90 mt-0.5">
          मूत्रसंस्था व प्रोस्टेट केस टेकिंग
        </div>
        <p className="text-xs sm:text-sm font-medium opacity-80 mt-2">
          Opp. Central Jail, Hindalga, Belgaum &nbsp;|&nbsp; 9902686173
        </p>
      </header>

      {/* 1. Patient Information */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-6 space-y-4">
        <h3 className="text-base font-bold text-emerald-800 border-b border-emerald-100 pb-3 -mx-6 -mt-6 px-6 pt-4 bg-emerald-50/40 rounded-t-2xl flex items-center justify-between">
          <span>1. Patient Information / रुग्णाची माहिती</span>
          <span className="text-xs font-normal text-slate-500">Auto-synchronized with Clinic Records</span>
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 pt-2">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Patient Name / रुग्णाचे नाव *</label>
            <input
              id="patientName"
              type="text"
              value={formData.patientName}
              onChange={handleChange}
              placeholder="Patient Name"
              className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Age / वय</label>
            <input
              id="age"
              type="number"
              value={formData.age}
              onChange={handleChange}
              placeholder="Age"
              className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Sex / लिंग</label>
            <select
              id="sex"
              value={formData.sex}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-none bg-white"
            >
              <option value="">Select / निवडा</option>
              <option value="Male / पुरुष">Male / पुरुष</option>
              <option value="Female / स्त्री">Female / स्त्री</option>
              <option value="Other">Other</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Date / दिनांक</label>
            <input
              id="date"
              type="date"
              value={formData.date}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Patient ID</label>
            <input
              id="patientId"
              type="text"
              value={formData.patientId}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-none bg-slate-50"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Mobile / मोबाईल</label>
            <input
              id="mobile"
              type="tel"
              value={formData.mobile}
              onChange={handleChange}
              placeholder="Mobile"
              className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-none"
            />
          </div>

          <div className="sm:col-span-2 md:col-span-3">
            <label className="block text-xs font-bold text-slate-700 mb-1">Address / पत्ता</label>
            <textarea
              id="address"
              rows={2}
              value={formData.address}
              onChange={handleChange}
              placeholder="Residential address"
              className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-none"
            />
          </div>
        </div>
      </div>

      {/* 2. Main Urinary Complaint */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-6 space-y-4">
        <h3 className="text-base font-bold text-emerald-800 border-b border-emerald-100 pb-3 -mx-6 -mt-6 px-6 pt-4 bg-emerald-50/40 rounded-t-2xl">
          2. Main Urinary Complaint / मुख्य मूत्रसंस्थेची तक्रार
        </h3>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2 pt-2">
          {[
            { key: 'Burning Urination', label: 'Burning / जळजळ' },
            { key: 'Frequent Urination', label: 'Frequent / वारंवार लघवी' },
            { key: 'Urgency', label: 'Urgency / तातडीची लघवी' },
            { key: 'Difficulty Urinating', label: 'Difficulty / लघवीस त्रास' },
            { key: 'Weak Stream', label: 'Weak Stream / धार कमी' },
            { key: 'Intermittent Stream', label: 'Intermittent / थांबून थांबून' },
            { key: 'Hesitancy', label: 'Hesitancy / सुरू होण्यास विलंब' },
            { key: 'Incomplete Emptying', label: 'Incomplete / अपूर्ण लघवी' },
            { key: 'Dribbling', label: 'Dribbling / थेंबथेंब' },
            { key: 'Urinary Retention', label: 'Retention / लघवी अडणे' },
            { key: 'Urinary Incontinence', label: 'Incontinence / नियंत्रण कमी' },
            { key: 'Blood in Urine', label: 'Blood in Urine / लघवीत रक्त' },
            { key: 'Cloudy Urine', label: 'Cloudy / गढूळ लघवी' },
            { key: 'Bad Odour', label: 'Bad Odour / दुर्गंधी' },
            { key: 'Reduced Urine', label: 'Reduced / लघवी कमी' },
            { key: 'Excessive Urine', label: 'Excessive / लघवी जास्त' }
          ].map(item => {
            const checked = formData.mainComplaint.includes(item.key);
            return (
              <button
                type="button"
                key={item.key}
                onClick={() => handleCheckboxToggle('mainComplaint', item.key)}
                className={`p-2 rounded-lg text-xs font-medium border text-left transition-all ${
                  checked
                    ? 'bg-emerald-700 text-white border-emerald-800 shadow-xs'
                    : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-emerald-50/60'
                }`}
              >
                <input
                  type="checkbox"
                  checked={checked}
                  onChange={() => {}}
                  className="mr-1.5 pointer-events-none accent-emerald-600"
                />
                {item.label}
              </button>
            );
          })}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Duration / कालावधी</label>
            <input
              id="complaintDuration"
              type="text"
              value={formData.complaintDuration}
              onChange={handleChange}
              placeholder="e.g. 2 weeks"
              className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Onset / सुरुवात</label>
            <select
              id="complaintOnset"
              value={formData.complaintOnset}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-none bg-white"
            >
              <option value="Sudden">Sudden / अचानक</option>
              <option value="Gradual">Gradual / हळूहळू</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Severity / तीव्रता</label>
            <select
              id="complaintSeverity"
              value={formData.complaintSeverity}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-none bg-white"
            >
              <option value="Mild">Mild / सौम्य</option>
              <option value="Moderate">Moderate / मध्यम</option>
              <option value="Severe">Severe / तीव्र</option>
            </select>
          </div>
        </div>
      </div>

      {/* 3 & 4. Urination Pattern & Dysuria */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* 3. Urination Pattern */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-6 space-y-3">
          <h3 className="text-sm font-bold text-emerald-800 border-b border-emerald-100 pb-2">
            3. Urination Pattern / लघवीची पद्धत
          </h3>

          <div className="grid grid-cols-2 gap-3 pt-1">
            <div>
              <label className="block text-[11px] font-bold text-slate-700 mb-1">Daytime Frequency / दिवसा</label>
              <input
                id="dayFrequency"
                type="text"
                value={formData.dayFrequency}
                onChange={handleChange}
                placeholder="Times/day"
                className="w-full px-2.5 py-1.5 border border-slate-300 rounded text-xs"
              />
            </div>
            <div>
              <label className="block text-[11px] font-bold text-slate-700 mb-1">Night Frequency / रात्री</label>
              <input
                id="nightFrequency"
                type="text"
                value={formData.nightFrequency}
                onChange={handleChange}
                placeholder="Times/night"
                className="w-full px-2.5 py-1.5 border border-slate-300 rounded text-xs"
              />
            </div>
            <div>
              <label className="block text-[11px] font-bold text-slate-700 mb-1">Approx. Quantity / प्रमाण</label>
              <input
                id="approxQuantity"
                type="text"
                value={formData.approxQuantity}
                onChange={handleChange}
                placeholder="e.g. Scanty / Profuse"
                className="w-full px-2.5 py-1.5 border border-slate-300 rounded text-xs"
              />
            </div>
            <div>
              <label className="block text-[11px] font-bold text-slate-700 mb-1">Time to Start / सुरू होण्यास वेळ</label>
              <input
                id="timeToStart"
                type="text"
                value={formData.timeToStart}
                onChange={handleChange}
                placeholder="e.g. Immediate / 1-2 mins"
                className="w-full px-2.5 py-1.5 border border-slate-300 rounded text-xs"
              />
            </div>
            <div>
              <label className="block text-[11px] font-bold text-slate-700 mb-1">Need to Strain? / जोर लावावा लागतो?</label>
              <select
                id="needToStrain"
                value={formData.needToStrain}
                onChange={handleChange}
                className="w-full px-2.5 py-1.5 border border-slate-300 rounded text-xs bg-white"
              >
                <option value="No">No / नाही</option>
                <option value="Yes">Yes / होय</option>
              </select>
            </div>
            <div>
              <label className="block text-[11px] font-bold text-slate-700 mb-1">Stream Duration / धार वेळ</label>
              <input
                id="streamDuration"
                type="text"
                value={formData.streamDuration}
                onChange={handleChange}
                placeholder="Seconds"
                className="w-full px-2.5 py-1.5 border border-slate-300 rounded text-xs"
              />
            </div>
          </div>
        </div>

        {/* 4. Burning & Painful Urination */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-6 space-y-3">
          <h3 className="text-sm font-bold text-emerald-800 border-b border-emerald-100 pb-2">
            4. Burning & Painful Urination / लघवीतील जळजळ व वेदना
          </h3>

          <div className="grid grid-cols-2 gap-1.5 pt-1">
            {[
              { key: 'Burning Before Urination', label: 'Before / लघवीपूर्वी' },
              { key: 'Burning During Urination', label: 'During / लघवी करताना' },
              { key: 'Burning After Urination', label: 'After / लघवी झाल्यावर' },
              { key: 'Pain During Urination', label: 'Pain / वेदना' },
              { key: 'Lower Abdominal Pain', label: 'Lower Abdomen / पोटात' },
              { key: 'Pelvic Pain', label: 'Pelvic / श्रोणी भागात' },
              { key: 'Urethral Pain', label: 'Urethral / मूत्रमार्गात' },
              { key: 'Urgency with Pain', label: 'Urgency / वेदनेसह तातडी' }
            ].map(item => (
              <label key={item.key} className="flex items-center gap-1.5 text-xs text-slate-700 cursor-pointer p-1">
                <input
                  type="checkbox"
                  checked={formData.dysuria.includes(item.key)}
                  onChange={() => handleCheckboxToggle('dysuria', item.key)}
                  className="accent-emerald-600"
                />
                <span>{item.label}</span>
              </label>
            ))}
          </div>

          <div>
            <label className="block text-[11px] font-bold text-slate-700 mb-1">Pain / Burning Details / तपशील</label>
            <textarea
              id="dysuriaDetails"
              rows={2}
              value={formData.dysuriaDetails}
              onChange={handleChange}
              placeholder="Exact sensations, radiating pain, scalding, drops..."
              className="w-full px-2.5 py-1.5 border border-slate-300 rounded text-xs"
            />
          </div>
        </div>
      </div>

      {/* 5, 6 & 7. Urine Chars, Flank Pain & Stones */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* 5. Urine Characteristics */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-5 space-y-3">
          <h4 className="font-bold text-xs text-emerald-900 border-b border-slate-100 pb-2">
            5. Urine Characteristics / लघवीचे स्वरूप
          </h4>
          <div className="grid grid-cols-2 gap-1">
            {[
              'Clear', 'Cloudy', 'Dark', 'Strong Odour',
              'Blood', 'Sediment', 'Foamy', 'Reduced Quantity'
            ].map(key => (
              <label key={key} className="flex items-center gap-1.5 text-xs text-slate-700 cursor-pointer p-0.5">
                <input
                  type="checkbox"
                  checked={formData.urineChars.includes(key)}
                  onChange={() => handleCheckboxToggle('urineChars', key)}
                  className="accent-emerald-600"
                />
                <span>{key}</span>
              </label>
            ))}
          </div>
          <div>
            <label className="block text-[11px] font-bold text-slate-600 mb-0.5">Colour / रंग</label>
            <select
              id="urineColour"
              value={formData.urineColour}
              onChange={handleChange}
              className="w-full px-2 py-1 border border-slate-300 rounded text-xs bg-white"
            >
              <option value="Pale Yellow">Pale Yellow</option>
              <option value="Dark Yellow">Dark Yellow</option>
              <option value="Brown">Brown</option>
              <option value="Red/Pink">Red / Pink (Blood)</option>
              <option value="Other">Other</option>
            </select>
          </div>
          <div>
            <label className="block text-[11px] font-bold text-slate-600 mb-0.5">Odour & Changes</label>
            <input
              id="urineOdour"
              type="text"
              value={formData.urineOdour}
              onChange={handleChange}
              placeholder="e.g. Ammoniacal, pungent"
              className="w-full px-2 py-1 border border-slate-300 rounded text-xs"
            />
          </div>
        </div>

        {/* 6. Kidney / Flank Pain */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-5 space-y-3">
          <h4 className="font-bold text-xs text-emerald-900 border-b border-slate-100 pb-2">
            6. Kidney / Flank Pain / कंबरेच्या बाजूचा त्रास
          </h4>
          <div className="grid grid-cols-2 gap-1">
            {[
              { key: 'Right Flank Pain', label: 'Right / उजवी' },
              { key: 'Left Flank Pain', label: 'Left / डावी' },
              { key: 'Both Sides', label: 'Both / दोन्ही' },
              { key: 'Loin Pain', label: 'Loin / कंबर' },
              { key: 'Radiation to Groin', label: 'To Groin / जांघेत' },
              { key: 'Radiation to Testis', label: 'To Testis' },
              { key: 'Colicky Pain', label: 'Colicky / कळा' },
              { key: 'Constant Pain', label: 'Constant / सतत' }
            ].map(item => (
              <label key={item.key} className="flex items-center gap-1.5 text-xs text-slate-700 cursor-pointer p-0.5">
                <input
                  type="checkbox"
                  checked={formData.flankPain.includes(item.key)}
                  onChange={() => handleCheckboxToggle('flankPain', item.key)}
                  className="accent-emerald-600"
                />
                <span>{item.label}</span>
              </label>
            ))}
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block text-[11px] font-bold text-slate-600 mb-0.5">Severity</label>
              <select
                id="flankSeverity"
                value={formData.flankSeverity}
                onChange={handleChange}
                className="w-full px-2 py-1 border border-slate-300 rounded text-xs bg-white"
              >
                <option value="Mild">Mild</option>
                <option value="Moderate">Moderate</option>
                <option value="Severe">Severe</option>
              </select>
            </div>
            <div>
              <label className="block text-[11px] font-bold text-slate-600 mb-0.5">Nausea?</label>
              <select
                id="flankNausea"
                value={formData.flankNausea}
                onChange={handleChange}
                className="w-full px-2 py-1 border border-slate-300 rounded text-xs bg-white"
              >
                <option value="No">No</option>
                <option value="Yes">Yes</option>
              </select>
            </div>
          </div>
        </div>

        {/* 7. Kidney Stones */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-5 space-y-3">
          <h4 className="font-bold text-xs text-emerald-900 border-b border-slate-100 pb-2">
            7. Kidney Stone / खड्यांचा इतिहास
          </h4>
          <div className="grid grid-cols-2 gap-1">
            {[
              { key: 'Previous Stone', label: 'Previous / पूर्वी' },
              { key: 'Current Stone', label: 'Current / सध्या' },
              { key: 'Recurrent Stones', label: 'Recurrent / वारंवार' },
              { key: 'Stone Passed', label: 'Passed / पडला' },
              { key: 'Procedure Done', label: 'Procedure / शस्त्रक्रिया' },
              { key: 'Stent History', label: 'Stent / स्टेंट' }
            ].map(item => (
              <label key={item.key} className="flex items-center gap-1.5 text-xs text-slate-700 cursor-pointer p-0.5">
                <input
                  type="checkbox"
                  checked={formData.stoneHistory.includes(item.key)}
                  onChange={() => handleCheckboxToggle('stoneHistory', item.key)}
                  className="accent-emerald-600"
                />
                <span>{item.label}</span>
              </label>
            ))}
          </div>
          <div className="grid grid-cols-2 gap-2">
            <input
              id="stoneSize"
              type="text"
              value={formData.stoneSize}
              onChange={handleChange}
              placeholder="Size (e.g. 5mm)"
              className="px-2 py-1 border border-slate-300 rounded text-xs"
            />
            <select
              id="stoneSide"
              value={formData.stoneSide}
              onChange={handleChange}
              className="px-2 py-1 border border-slate-300 rounded text-xs bg-white"
            >
              <option value="">Side</option>
              <option value="Right">Right / उजवी</option>
              <option value="Left">Left / डावी</option>
              <option value="Both">Both / दोन्ही</option>
            </select>
          </div>
        </div>
      </div>

      {/* 8, 9 & 10. UTI & Prostate */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* 8. UTI History */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-6 space-y-3">
          <h3 className="text-sm font-bold text-emerald-800 border-b border-emerald-100 pb-2">
            8. Urinary Infection History / संसर्गाचा इतिहास (UTI)
          </h3>
          <div className="grid grid-cols-2 gap-1.5">
            {[
              { key: 'Recurrent UTI', label: 'Recurrent UTI / वारंवार' },
              { key: 'Fever', label: 'Fever / ताप' },
              { key: 'Chills', label: 'Chills / थंडी वाजणे' },
              { key: 'Burning', label: 'Burning / जळजळ' },
              { key: 'Urgency', label: 'Urgency / तातडी' },
              { key: 'Frequency', label: 'Frequency / वारंवार' }
            ].map(item => (
              <label key={item.key} className="flex items-center gap-2 text-xs text-slate-700 cursor-pointer p-1">
                <input
                  type="checkbox"
                  checked={formData.utiHistory.includes(item.key)}
                  onChange={() => handleCheckboxToggle('utiHistory', item.key)}
                  className="accent-emerald-600"
                />
                <span>{item.label}</span>
              </label>
            ))}
          </div>
          <div className="grid grid-cols-2 gap-2">
            <input
              id="utiEpisodes"
              type="text"
              value={formData.utiEpisodes}
              onChange={handleChange}
              placeholder="Number of episodes"
              className="px-2.5 py-1.5 border border-slate-300 rounded text-xs"
            />
            <select
              id="utiCulture"
              value={formData.utiCulture}
              onChange={handleChange}
              className="px-2.5 py-1.5 border border-slate-300 rounded text-xs bg-white"
            >
              <option value="No">Culture Done: No</option>
              <option value="Yes">Culture Done: Yes</option>
            </select>
          </div>
        </div>

        {/* 9 & 10. Prostate & Male Symptoms */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-6 space-y-3">
          <h3 className="text-sm font-bold text-emerald-800 border-b border-emerald-100 pb-2">
            9 & 10. Prostate / Male Urinary & History / प्रोस्टेट इतिहास
          </h3>
          <div className="grid grid-cols-2 gap-1.5">
            {[
              { key: 'Hesitancy', label: 'Hesitancy / विलंब' },
              { key: 'Weak Stream', label: 'Weak Stream / कमजोर धार' },
              { key: 'Intermittency', label: 'Intermittency / तुटक धार' },
              { key: 'Post-void Dribbling', label: 'Dribbling / थेंब' },
              { key: 'Nocturia', label: 'Nocturia / रात्री वारंवार' },
              { key: 'Enlarged Prostate', label: 'BPH / प्रोस्टेट वाढलेले' }
            ].map(item => (
              <label key={item.key} className="flex items-center gap-2 text-xs text-slate-700 cursor-pointer p-1">
                <input
                  type="checkbox"
                  checked={formData.prostateSymptoms.includes(item.key)}
                  onChange={() => handleCheckboxToggle('prostateSymptoms', item.key)}
                  className="accent-emerald-600"
                />
                <span>{item.label}</span>
              </label>
            ))}
          </div>
          <div className="grid grid-cols-2 gap-2">
            <input
              id="psaValue"
              type="text"
              value={formData.psaValue}
              onChange={handleChange}
              placeholder="PSA Value (ng/mL)"
              className="px-2.5 py-1.5 border border-slate-300 rounded text-xs"
            />
            <input
              id="prostateSize"
              type="text"
              value={formData.prostateSize}
              onChange={handleChange}
              placeholder="Prostate Size (cc/grams)"
              className="px-2.5 py-1.5 border border-slate-300 rounded text-xs"
            />
          </div>
        </div>
      </div>

      {/* 11 & 12. Male Genital & Female Urinary */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-6 space-y-3">
          <h3 className="text-sm font-bold text-emerald-800 border-b border-emerald-100 pb-2">
            11. Associated Male Genital Symptoms / पुरुष जनन-मूत्र लक्षणे
          </h3>
          <div className="grid grid-cols-2 gap-1.5">
            {[
              'Testicular Pain', 'Testicular Swelling', 'Groin Pain',
              'Scrotal Pain', 'Penile Pain', 'Urethral Discharge',
              'Erectile Difficulty', 'Painful Ejaculation'
            ].map(item => (
              <label key={item} className="flex items-center gap-2 text-xs text-slate-700 cursor-pointer p-1">
                <input
                  type="checkbox"
                  checked={formData.maleGenital.includes(item)}
                  onChange={() => handleCheckboxToggle('maleGenital', item)}
                  className="accent-emerald-600"
                />
                <span>{item}</span>
              </label>
            ))}
          </div>
          <textarea
            id="maleGenitalDetails"
            rows={1}
            value={formData.maleGenitalDetails}
            onChange={handleChange}
            placeholder="Male symptoms details..."
            className="w-full px-2.5 py-1.5 border border-slate-300 rounded text-xs"
          />
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-6 space-y-3">
          <h3 className="text-sm font-bold text-emerald-800 border-b border-emerald-100 pb-2">
            12. Female Urinary Symptoms / स्त्रियांच्या मूत्र तक्रारी
          </h3>
          <div className="grid grid-cols-2 gap-1.5">
            {[
              'Recurrent UTI', 'Burning Urination', 'Urinary Leakage',
              'Stress Incontinence', 'Urgency Incontinence', 'Urinary Frequency',
              'Pelvic Pressure', 'Postpartum Problem'
            ].map(item => (
              <label key={item} className="flex items-center gap-2 text-xs text-slate-700 cursor-pointer p-1">
                <input
                  type="checkbox"
                  checked={formData.femaleUrinary.includes(item)}
                  onChange={() => handleCheckboxToggle('femaleUrinary', item)}
                  className="accent-emerald-600"
                />
                <span>{item}</span>
              </label>
            ))}
          </div>
          <textarea
            id="femaleUrinaryDetails"
            rows={1}
            value={formData.femaleUrinaryDetails}
            onChange={handleChange}
            placeholder="Female urinary details..."
            className="w-full px-2.5 py-1.5 border border-slate-300 rounded text-xs"
          />
        </div>
      </div>

      {/* 13 & 14. Fluid Intake & Previous History */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-6 space-y-3">
          <h3 className="text-sm font-bold text-emerald-800 border-b border-emerald-100 pb-2">
            13. Fluid Intake & Thirst / द्रवपदार्थ व तहान
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Water Intake / पाणी</label>
              <input
                id="waterIntake"
                type="text"
                value={formData.waterIntake}
                onChange={handleChange}
                placeholder="Litres/day"
                className="w-full px-2.5 py-1.5 border border-slate-300 rounded text-xs"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Thirst / तहान</label>
              <select
                id="thirst"
                value={formData.thirst}
                onChange={handleChange}
                className="w-full px-2.5 py-1.5 border border-slate-300 rounded text-xs bg-white"
              >
                <option value="Normal / सामान्य">Normal / सामान्य</option>
                <option value="Increased / वाढलेली">Increased / वाढलेली</option>
                <option value="Decreased / कमी">Decreased / कमी</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Night Water? / रात्री पाणी</label>
              <select
                id="nightWaterIntake"
                value={formData.nightWaterIntake}
                onChange={handleChange}
                className="w-full px-2.5 py-1.5 border border-slate-300 rounded text-xs bg-white"
              >
                <option value="No">No</option>
                <option value="Yes">Yes</option>
              </select>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-6 space-y-3">
          <h3 className="text-sm font-bold text-emerald-800 border-b border-emerald-100 pb-2">
            14. Previous Renal / Urinary History / पूर्वीचा इतिहास
          </h3>
          <div className="grid grid-cols-2 gap-1.5">
            {[
              'Kidney Stone', 'UTI', 'Kidney Infection',
              'Renal Failure', 'Hematuria', 'Previous Surgery'
            ].map(item => (
              <label key={item} className="flex items-center gap-2 text-xs text-slate-700 cursor-pointer p-1">
                <input
                  type="checkbox"
                  checked={formData.previousRenalHistory.includes(item)}
                  onChange={() => handleCheckboxToggle('previousRenalHistory', item)}
                  className="accent-emerald-600"
                />
                <span>{item}</span>
              </label>
            ))}
          </div>
          <input
            id="previousRenalDetails"
            type="text"
            value={formData.previousRenalDetails}
            onChange={handleChange}
            placeholder="Previous history notes..."
            className="w-full px-2.5 py-1.5 border border-slate-300 rounded text-xs"
          />
        </div>
      </div>

      {/* 15. Investigations */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-6 space-y-3">
        <h3 className="text-base font-bold text-emerald-800 border-b border-emerald-100 pb-3 -mx-6 -mt-6 px-6 pt-4 bg-emerald-50/40 rounded-t-2xl">
          15. Urinary / Renal Investigations / तपासण्या
        </h3>
        <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-7 gap-2 pt-1">
          {[
            'Urine Routine', 'Urine Culture', 'Urine Protein', 'Urine ACR',
            'Serum Creatinine', 'Blood Urea', 'eGFR', 'Electrolytes',
            'USG KUB', 'USG Prostate', 'PSA', 'CT KUB', 'MRI', 'Other'
          ].map(item => (
            <label key={item} className="flex items-center gap-1.5 text-xs text-slate-700 cursor-pointer p-1 bg-slate-50 border rounded">
              <input
                type="checkbox"
                checked={formData.investigations.includes(item)}
                onChange={() => handleCheckboxToggle('investigations', item)}
                className="accent-emerald-600"
              />
              <span className="truncate">{item}</span>
            </label>
          ))}
        </div>
        <div className="pt-2">
          <label className="block text-xs font-bold text-slate-700 mb-1">Investigation Findings / तपासणी अहवाल</label>
          <textarea
            id="investigationFindings"
            rows={2}
            value={formData.investigationFindings}
            onChange={handleChange}
            placeholder="Urine analysis, creatinine, USG KUB impressions, stone diameter..."
            className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs"
          />
        </div>
      </div>

      {/* 16. Warning / Red Flag Symptoms */}
      <div className="bg-rose-50 rounded-2xl border-2 border-rose-300/80 p-6 space-y-3">
        <h3 className="text-base font-bold text-rose-900 flex items-center gap-2">
          <AlertTriangle className="w-5 h-5 text-rose-600" />
          <span>16. Warning / Red Flag Symptoms / धोक्याची लक्षणे</span>
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2 pt-1">
          {[
            'Complete Urinary Retention / पूर्ण लघवी अडणे',
            'Gross Blood in Urine / लघवीत जास्त रक्त',
            'Blood Clots in Urine / रक्ताच्या गुठळ्या',
            'Severe Flank Pain / तीव्र कंबरदुखी',
            'Fever with Flank Pain / तापासह कंबरदुखी',
            'Sudden Reduced Urine / लघवी अचानक कमी',
            'Severe Testicular Pain / तीव्र अंडकोष दुखणे',
            'New Incontinence / नवीन लघवी गळणे',
            'Persistent Hematuria / सतत लघवीत रक्त',
            'Known Prostate Cancer / कर्करोग इतिहास'
          ].map(item => {
            const key = item.split(' / ')[0];
            const checked = formData.redFlags.includes(key);
            return (
              <label
                key={item}
                className={`flex items-center gap-2 p-2 rounded-lg border text-xs font-semibold cursor-pointer transition-colors ${
                  checked ? 'bg-rose-200 border-rose-500 text-rose-950' : 'bg-white/80 border-rose-200 text-slate-800 hover:bg-white'
                }`}
              >
                <input
                  type="checkbox"
                  checked={checked}
                  onChange={() => handleCheckboxToggle('redFlags', key)}
                  className="accent-rose-600"
                />
                <span>{item}</span>
              </label>
            );
          })}
        </div>

        <div>
          <label className="block text-xs font-bold text-rose-900 mb-1">Urgent / Referral Notes / तातडीची / रेफरल नोंद</label>
          <textarea
            id="urgentNotes"
            rows={2}
            value={formData.urgentNotes}
            onChange={handleChange}
            placeholder="Emergency catheterization notes, surgical referral, IV antibiotic warnings..."
            className="w-full px-3 py-2 border border-rose-300 rounded-lg text-xs bg-white"
          />
        </div>
      </div>

      {/* 17. Clinical Assessment & Prescribed Treatment */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-6 space-y-4">
        <h3 className="text-base font-bold text-emerald-800 border-b border-emerald-100 pb-3 -mx-6 -mt-6 px-6 pt-4 bg-emerald-50/40 rounded-t-2xl">
          17. Clinical Assessment & Treatment / क्लिनिकल मूल्यांकन व उपचार
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Provisional Diagnosis / प्राथमिक निदान</label>
            <input
              id="diagnosis"
              type="text"
              value={formData.diagnosis}
              onChange={handleChange}
              placeholder="e.g. Renal Calculus 6mm / Acute UTI"
              className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Affected Region / प्रभावित भाग</label>
            <input
              id="affectedRegion"
              type="text"
              value={formData.affectedRegion}
              onChange={handleChange}
              placeholder="e.g. Right Ureter / Bladder Neck"
              className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Severity / तीव्रता</label>
            <select
              id="clinicalSeverity"
              value={formData.clinicalSeverity}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-none bg-white"
            >
              <option value="Mild">Mild / सौम्य</option>
              <option value="Moderate">Moderate / मध्यम</option>
              <option value="Severe">Severe / तीव्र</option>
            </select>
          </div>

          <div className="sm:col-span-3">
            <label className="block text-xs font-bold text-slate-700 mb-1">Clinical Notes / क्लिनिकल नोंदी</label>
            <textarea
              id="clinicalNotes"
              rows={2}
              value={formData.clinicalNotes}
              onChange={handleChange}
              placeholder="Homeopathic totality, miasmatic indication, urinary sediment characteristics..."
              className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-none"
            />
          </div>

          <div className="sm:col-span-2">
            <label className="block text-xs font-bold text-slate-700 mb-1">Homeopathic Treatment / होमिओपॅथिक औषध</label>
            <input
              id="treatment"
              type="text"
              value={formData.treatment}
              onChange={handleChange}
              placeholder="Remedy, potency and frequency (e.g. Berberis V. Q, Sarsaparilla 200)"
              className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-none font-medium"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Dietary & Water Advice / सल्ला</label>
            <input
              id="advice"
              type="text"
              value={formData.advice}
              onChange={handleChange}
              placeholder="Hydration target, avoid tomatoes/spinach"
              className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Follow-up Date / पुढील तारीख</label>
            <input
              id="followup"
              type="date"
              value={formData.followup}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-none"
            />
          </div>
        </div>
      </div>

      {/* Live Status Toast / Feedback */}
      {statusMessage && (
        <div
          id="status"
          className={`p-3 rounded-xl text-center text-xs font-bold border transition-all ${
            statusType === 'success'
              ? 'bg-emerald-50 text-emerald-800 border-emerald-300'
              : statusType === 'error'
              ? 'bg-rose-50 text-rose-800 border-rose-300'
              : 'bg-emerald-50 text-emerald-800 border-emerald-300'
          }`}
        >
          {statusMessage}
        </div>
      )}

      {/* Footer Branding */}
      <footer className="text-center py-4 bg-emerald-950 text-white rounded-2xl text-xs space-y-1">
        <div>
          <strong>Dr. Bharat's Arogya Homeopathy</strong> &nbsp;|&nbsp; Opp. Central Jail, Hindalga, Belgaum &nbsp;|&nbsp; 9902686173
        </div>
        <div className="text-[10px] text-emerald-300 opacity-80">
          Design by <strong>Ananya Infotech</strong>
        </div>
      </footer>

      {/* Sticky Bottom Actions */}
      <div className="fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-slate-200 py-3 px-4 shadow-lg flex items-center justify-center gap-3">
        <button
          type="button"
          onClick={handleSave}
          className="px-6 py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs rounded-xl shadow-xs transition-transform active:scale-95 flex items-center gap-2"
        >
          <Save className="w-4 h-4" />
          <span>💾 Save Case / सेव्ह करा</span>
        </button>

        <button
          type="button"
          onClick={handleSubmit}
          className="px-6 py-2.5 bg-sky-700 hover:bg-sky-800 text-white font-bold text-xs rounded-xl shadow-xs transition-transform active:scale-95 flex items-center gap-2"
        >
          <CheckCircle2 className="w-4 h-4" />
          <span>✓ Submit & Print / सबमिट करा</span>
        </button>

        <button
          type="button"
          onClick={handleClear}
          className="px-5 py-2.5 bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs rounded-xl shadow-xs transition-transform active:scale-95 flex items-center gap-2"
        >
          <RotateCcw className="w-4 h-4" />
          <span>✕ Clear / क्लिअर</span>
        </button>
      </div>
    </div>
  );
};
