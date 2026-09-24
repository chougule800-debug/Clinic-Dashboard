import React, { useState, useEffect } from 'react';
import { useClinic } from '../../context/ClinicContext';
import {
  HeartHandshake,
  Save,
  CheckCircle2,
  RotateCcw,
  Printer,
  FileText,
  AlertTriangle,
  Upload,
  X,
  Plus,
  Trash2
} from 'lucide-react';

export interface PregnancyRecord {
  id: string;
  year: string;
  outcome: string;
  gestation: string;
  delivery: string;
  weight: string;
  sex: string;
  notes: string;
}

export interface FemaleGynaeFormData {
  // Patient Information
  patientName: string;
  age: string;
  date: string;
  patientId: string;
  marital: string;
  contact: string;
  address?: string;

  // 1. Menstrual History
  menarche: string;
  lmp: string;
  cycleLength: string;
  duration: string;
  cyclePattern: string;
  flow: string;
  mfeatures: string[];
  pain: string[];
  ovulationSymptoms: string;
  menstrualOther: string;

  // 2. Obstetric History
  gravida: string;
  para: string;
  abortions: string;
  living: string;
  ectopic: string;
  stillbirth: string;
  pregnancies: PregnancyRecord[];

  // 3. Gynecological History
  gyn: string[];
  dischargeCharacter: string;
  contraceptive: string;
  gynTreatment: string;
  gynOther: string;

  // 4. Infertility
  infertilityType: string;
  infertilityYears: string;
  tryingSince: string;
  frequency: string;
  previousConception: string;
  ovulationHistory: string;
  fertility: string[];
  infertilityOther: string;

  // 5. Investigations & Reports
  investigation: string[];
  investigationDate: string;
  reportFinding: string;
  lab: string;
  investigationNotes: string;
  reportFiles: { name: string; type: string; data: string | null }[];

  // 6. Assessment & Plan
  assessment?: string;
  diagnosis?: string;
  followupDate?: string;
  doctorNotes?: string;

  savedAt?: string;
}

const INITIAL_FEMALE_DATA: FemaleGynaeFormData = {
  patientName: '',
  age: '',
  date: new Date().toISOString().split('T')[0],
  patientId: '',
  marital: 'Married / विवाहित',
  contact: '',
  address: '',

  menarche: '13',
  lmp: '',
  cycleLength: '28',
  duration: '4',
  cyclePattern: 'Regular / नियमित',
  flow: 'Normal / सामान्य',
  mfeatures: [],
  pain: [],
  ovulationSymptoms: '',
  menstrualOther: '',

  gravida: '0',
  para: '0',
  abortions: '0',
  living: '0',
  ectopic: 'No / नाही',
  stillbirth: 'No / नाही',
  pregnancies: [],

  gyn: [],
  dischargeCharacter: '',
  contraceptive: '',
  gynTreatment: '',
  gynOther: '',

  infertilityType: 'Not applicable / लागू नाही',
  infertilityYears: '',
  tryingSince: '',
  frequency: '1–2 times/week',
  previousConception: 'No / नाही',
  ovulationHistory: 'Not assessed',
  fertility: [],
  infertilityOther: '',

  investigation: [],
  investigationDate: '',
  reportFinding: '',
  lab: '',
  investigationNotes: '',
  reportFiles: [],

  assessment: '',
  diagnosis: '',
  followupDate: '',
  doctorNotes: ''
};

export const FemaleGynaeCaseForm: React.FC = () => {
  const {
    selectedPatient,
    patients,
    selectPatient,
    saveSystemForm,
    systemForms,
    setActiveTab
  } = useClinic();

  const [formData, setFormData] = useState<FemaleGynaeFormData>(INITIAL_FEMALE_DATA);
  const [statusMessage, setStatusMessage] = useState<string>('');
  const [statusType, setStatusType] = useState<'success' | 'error' | 'info'>('info');

  useEffect(() => {
    if (selectedPatient) {
      const existing = systemForms.find(
        f => f.patientId === selectedPatient.id && f.system === 'female_gynae'
      );

      if (existing && existing.data && Object.keys(existing.data).length > 0) {
        setFormData({
          ...INITIAL_FEMALE_DATA,
          ...existing.data,
          patientName: selectedPatient.name,
          age: String(selectedPatient.age || ''),
          patientId: selectedPatient.id,
          contact: selectedPatient.mobile || '',
          address: selectedPatient.address || existing.data.address || '',
          date: existing.data.date || new Date().toISOString().split('T')[0]
        });
        return;
      }

      try {
        const stored = localStorage.getItem(`arogyaFemaleCase_${selectedPatient.id}`);
        if (stored) {
          const parsed = JSON.parse(stored);
          setFormData(prev => ({
            ...prev,
            ...parsed,
            patientName: selectedPatient.name,
            age: String(selectedPatient.age || ''),
            patientId: selectedPatient.id,
            contact: selectedPatient.mobile || '',
            address: selectedPatient.address || ''
          }));
          return;
        }
      } catch (_) {}

      setFormData({
        ...INITIAL_FEMALE_DATA,
        patientName: selectedPatient.name,
        age: String(selectedPatient.age || ''),
        patientId: selectedPatient.id,
        contact: selectedPatient.mobile || '',
        address: selectedPatient.address || '',
        date: new Date().toISOString().split('T')[0]
      });
    }
  }, [selectedPatient?.id, systemForms]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleCheckboxToggle = (category: keyof FemaleGynaeFormData, value: string) => {
    setFormData(prev => {
      const currentList = (prev[category] as string[]) || [];
      const updated = currentList.includes(value)
        ? currentList.filter(item => item !== value)
        : [...currentList, value];
      return { ...prev, [category]: updated };
    });
  };

  // Pregnancy management
  const addPregnancy = () => {
    const newPreg: PregnancyRecord = {
      id: String(Date.now()),
      year: new Date().getFullYear().toString(),
      outcome: 'Live birth',
      gestation: '38 weeks',
      delivery: 'Normal vaginal delivery',
      weight: '3.0 kg',
      sex: 'Female',
      notes: ''
    };
    setFormData(prev => ({
      ...prev,
      pregnancies: [...prev.pregnancies, newPreg]
    }));
  };

  const updatePregnancy = (id: string, field: keyof PregnancyRecord, val: string) => {
    setFormData(prev => ({
      ...prev,
      pregnancies: prev.pregnancies.map(p => (p.id === id ? { ...p, [field]: val } : p))
    }));
  };

  const removePregnancy = (id: string) => {
    setFormData(prev => ({
      ...prev,
      pregnancies: prev.pregnancies.filter(p => p.id !== id)
    }));
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
      reportFiles: [...prev.reportFiles, ...newFiles]
    }));
  };

  const removeFile = (index: number) => {
    setFormData(prev => ({
      ...prev,
      reportFiles: prev.reportFiles.filter((_, i) => i !== index)
    }));
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
      localStorage.setItem(`arogyaFemaleCase_${selectedPatient.id}`, JSON.stringify(updatedData));
    }
    localStorage.setItem('arogyaFemaleCase_' + (formData.patientId || formData.patientName || Date.now()), JSON.stringify(updatedData));

    const chiefComplaintsText = [
      formData.gyn?.length ? `Gynae: ${formData.gyn.join(', ')}` : '',
      formData.mfeatures?.length ? `Menses: ${formData.mfeatures.join(', ')}` : '',
      formData.pain?.length ? `Pain: ${formData.pain.join(', ')}` : '',
      formData.cyclePattern ? `Cycle: ${formData.cyclePattern}` : '',
      formData.infertilityType && formData.infertilityType !== 'Not applicable / लागू नाही'
        ? `Infertility: ${formData.infertilityType} (${formData.infertilityYears || '1'} yrs)`
        : ''
    ].filter(Boolean).join(' • ');

    const modalitiesAgg = formData.pain?.join(', ') || 'Before menses, standing long';
    const modalitiesAmel = 'Warmth, rest, onset of flow';

    if (selectedPatient) {
      saveSystemForm({
        patientId: selectedPatient.id,
        system: 'female_gynae',
        chiefComplaints: chiefComplaintsText || 'Female Gynecological & Obstetric History',
        duration: formData.duration ? `${formData.duration} days flow / ${formData.cycleLength} days cycle` : 'Recorded Case',
        severity: formData.pain?.includes('Cramping') || formData.gyn?.includes('Endometriosis') ? 'Severe' : 'Moderate',
        modalitiesAggravation: modalitiesAgg,
        modalitiesAmelioration: modalitiesAmel,
        concomitants: formData.dischargeCharacter || formData.ovulationSymptoms || '',
        clinicalNotes: formData.doctorNotes || formData.diagnosis || formData.assessment || '',
        data: updatedData,
        submittedVia: 'Doctor_Dashboard'
      });
    }

    setStatusMessage('✓ Female / Gynaecological Case Saved Successfully / केस यशस्वीरित्या जतन केला. Synced to Case Summary.');
    setStatusType('success');
    setTimeout(() => setStatusMessage(''), 5000);
  };

  const handleSubmit = () => {
    handleSave();
    setStatusMessage('✓ Case submitted and stored locally / केस सबमिट करून स्थानिकरित्या जतन केला. Printing view...');
    setStatusType('success');
    setTimeout(() => {
      window.print();
    }, 600);
  };

  const handleClear = () => {
    if (window.confirm('Clear all entered information? / सर्व माहिती साफ करायची का?')) {
      setFormData(INITIAL_FEMALE_DATA);
      setStatusMessage('Form cleared / फॉर्म साफ केला.');
      setStatusType('info');
      setTimeout(() => setStatusMessage(''), 3000);
    }
  };

  return (
    <div className="space-y-6 pb-28 max-w-5xl mx-auto">
      {/* Patient Selector Ribbon */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-pink-600 text-white flex items-center justify-center font-bold shadow-xs">
            <HeartHandshake className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs uppercase font-bold tracking-wider px-2 py-0.5 rounded-md bg-pink-50 text-pink-800 border border-pink-200">
                Female, Gynaecological & Infertility Form
              </span>
              <span className="text-[11px] text-slate-400 font-medium">महिला • स्त्रीरोग • प्रसूती • वंध्यत्व</span>
            </div>
            <h2 className="text-sm font-bold text-slate-900 mt-0.5">
              Active Patient: <strong className="text-pink-950 font-serif">{formData.patientName || 'No Patient Selected'}</strong>
              {formData.patientId && <span className="text-slate-400 font-normal"> ({formData.patientId})</span>}
            </h2>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <select
            value={selectedPatient?.id || ''}
            onChange={(e) => selectPatient(e.target.value)}
            className="text-xs border border-slate-300 rounded-xl px-3 py-2 bg-slate-50 text-slate-800 focus:outline-none focus:ring-2 focus:ring-pink-500 font-medium"
          >
            {patients.map(p => (
              <option key={p.id} value={p.id}>
                {p.name} ({p.id})
              </option>
            ))}
          </select>

          <button
            type="button"
            onClick={() => setActiveTab('case_summary')}
            className="px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs rounded-xl transition-colors flex items-center gap-1.5"
          >
            <FileText className="w-3.5 h-3.5 text-pink-700" />
            <span>Case Summary</span>
          </button>
        </div>
      </div>

      {/* Header Banner matching template */}
      <div className="bg-gradient-to-r from-[#087f5b] to-[#16a085] text-white p-6 rounded-2xl shadow-sm text-center">
        <h1 className="text-xl sm:text-2xl font-bold font-serif">Dr. Bharat's Arogya Homeopathy</h1>
        <p className="text-xs sm:text-sm text-teal-100 mt-1">
          Female • Gynecological • Obstetric • Infertility Case Taking / महिला • स्त्रीरोग • प्रसूती • वंध्यत्व केस टेकिंग
        </p>
      </div>

      {/* Status Notification */}
      {statusMessage && (
        <div
          className={`p-3 rounded-xl border text-xs font-medium flex items-center justify-between transition-all ${
            statusType === 'success'
              ? 'bg-emerald-50 border-emerald-300 text-emerald-900'
              : statusType === 'error'
              ? 'bg-rose-50 border-rose-300 text-rose-900'
              : 'bg-teal-50 border-teal-300 text-teal-900'
          }`}
        >
          <div className="flex items-center gap-2">
            {statusType === 'success' ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            ) : (
              <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
            )}
            <span>{statusMessage}</span>
          </div>
          <button onClick={() => setStatusMessage('')} className="text-slate-400 hover:text-slate-600">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Patient Information */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4">
        <h2 className="text-sm font-bold text-[#086b4d] bg-[#e8f6f1] -mx-6 -mt-6 px-6 py-3 rounded-t-2xl flex items-center gap-2">
          <span>👩</span> Patient Information / रुग्णाची माहिती
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5 text-xs">
          <div className="space-y-1">
            <label className="font-bold text-slate-700">Patient Name / रुग्णाचे नाव</label>
            <input
              name="patientName"
              value={formData.patientName}
              onChange={handleChange}
              className="w-full border border-slate-300 rounded-lg p-2 text-slate-900 focus:outline-none focus:ring-2 focus:ring-pink-500"
              required
            />
          </div>
          <div className="space-y-1">
            <label className="font-bold text-slate-700">Age</label>
            <input
              name="age"
              type="number"
              value={formData.age}
              onChange={handleChange}
              className="w-full border border-slate-300 rounded-lg p-2 text-slate-900 focus:outline-none"
            />
          </div>
          <div className="space-y-1">
            <label className="font-bold text-slate-700">Date</label>
            <input
              name="date"
              type="date"
              value={formData.date}
              onChange={handleChange}
              className="w-full border border-slate-300 rounded-lg p-2 text-slate-900 focus:outline-none"
            />
          </div>
          <div className="space-y-1">
            <label className="font-bold text-slate-700">Patient ID / रुग्ण आयडी</label>
            <input
              name="patientId"
              value={formData.patientId}
              onChange={handleChange}
              className="w-full border border-slate-300 rounded-lg p-2 text-slate-900 focus:outline-none"
            />
          </div>
          <div className="space-y-1">
            <label className="font-bold text-slate-700">Marital Status / वैवाहिक स्थिती</label>
            <select
              name="marital"
              value={formData.marital}
              onChange={handleChange}
              className="w-full border border-slate-300 rounded-lg p-2 text-slate-900 focus:outline-none"
            >
              <option value="Married / विवाहित">Married / विवाहित</option>
              <option value="Unmarried / अविवाहित">Unmarried / अविवाहित</option>
              <option value="Widowed / विधवा">Widowed / विधवा</option>
              <option value="Divorced / घटस्फोटित">Divorced / घटस्फोटित</option>
            </select>
          </div>
          <div className="space-y-1">
            <label className="font-bold text-slate-700">Contact / संपर्क क्रमांक</label>
            <input
              name="contact"
              type="tel"
              value={formData.contact}
              onChange={handleChange}
              className="w-full border border-slate-300 rounded-lg p-2 text-slate-900 focus:outline-none"
            />
          </div>
        </div>
      </div>

      {/* Section 1: Menstrual History */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4">
        <h2 className="text-sm font-bold text-[#086b4d] bg-[#e8f6f1] -mx-6 -mt-6 px-6 py-3 rounded-t-2xl flex items-center gap-2">
          <span>🌸</span> 1. Menstrual History / मासिक पाळीचा इतिहास
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5 text-xs">
          <div className="space-y-1">
            <label className="font-bold text-slate-700">Age at Menarche / पहिली मासिक पाळीचे वय</label>
            <input
              name="menarche"
              type="number"
              value={formData.menarche}
              onChange={handleChange}
              placeholder="e.g. 13"
              className="w-full border border-slate-300 rounded-lg p-2 text-slate-900 focus:outline-none"
            />
          </div>
          <div className="space-y-1">
            <label className="font-bold text-slate-700">LMP (Last Menstrual Period)</label>
            <input
              name="lmp"
              type="date"
              value={formData.lmp}
              onChange={handleChange}
              className="w-full border border-slate-300 rounded-lg p-2 text-slate-900 focus:outline-none"
            />
          </div>
          <div className="space-y-1">
            <label className="font-bold text-slate-700">Cycle Length (days) / पाळीचे चक्र (दिवस)</label>
            <input
              name="cycleLength"
              type="number"
              value={formData.cycleLength}
              onChange={handleChange}
              placeholder="e.g. 28 or 30"
              className="w-full border border-slate-300 rounded-lg p-2 text-slate-900 focus:outline-none"
            />
          </div>
          <div className="space-y-1">
            <label className="font-bold text-slate-700">Duration (days) / कालावधी (दिवस)</label>
            <input
              name="duration"
              type="number"
              value={formData.duration}
              onChange={handleChange}
              placeholder="e.g. 4 or 5"
              className="w-full border border-slate-300 rounded-lg p-2 text-slate-900 focus:outline-none"
            />
          </div>
          <div className="space-y-1">
            <label className="font-bold text-slate-700">Cycle Pattern / पाळीचा प्रकार</label>
            <select
              name="cyclePattern"
              value={formData.cyclePattern}
              onChange={handleChange}
              className="w-full border border-slate-300 rounded-lg p-2 text-slate-900 focus:outline-none"
            >
              <option value="Regular / नियमित">Regular / नियमित</option>
              <option value="Irregular / अनियमित">Irregular / अनियमित</option>
              <option value="Absent / अनुपस्थित">Absent / अनुपस्थित</option>
            </select>
          </div>
          <div className="space-y-1">
            <label className="font-bold text-slate-700">Flow</label>
            <select
              name="flow"
              value={formData.flow}
              onChange={handleChange}
              className="w-full border border-slate-300 rounded-lg p-2 text-slate-900 focus:outline-none"
            >
              <option value="Normal / सामान्य">Normal / सामान्य</option>
              <option value="Scanty / कमी">Scanty / कमी</option>
              <option value="Moderate / मध्यम">Moderate / मध्यम</option>
              <option value="Heavy / जास्त">Heavy / जास्त</option>
            </select>
          </div>
        </div>

        <div className="pt-2">
          <label className="font-bold text-slate-800 text-xs block mb-2">
            Menstrual Features — Quick Check / मासिक पाळीची लक्षणे — जलद निवड
          </label>
          <div className="flex flex-wrap gap-2">
            {[
              'Clots',
              'Dark blood',
              'Spotting',
              'PMS',
              'Intermenstrual bleeding',
              'Postcoital bleeding',
              'Amenorrhea'
            ].map(item => {
              const active = formData.mfeatures.includes(item);
              return (
                <label
                  key={item}
                  className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs cursor-pointer border transition-all ${
                    active
                      ? 'bg-pink-50 border-pink-500 text-pink-900 font-semibold shadow-2xs'
                      : 'bg-[#f1f6f4] border-transparent text-slate-700 hover:border-slate-300'
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={active}
                    onChange={() => handleCheckboxToggle('mfeatures', item)}
                    className="rounded text-pink-600"
                  />
                  <span>{item}</span>
                </label>
              );
            })}
          </div>
        </div>

        <div className="pt-2">
          <label className="font-bold text-slate-800 text-xs block mb-2">
            Dysmenorrhea / Pain — Quick Check / पाळीतील वेदना — जलद निवड
          </label>
          <div className="flex flex-wrap gap-2">
            {[
              'No pain',
              'Before menses',
              'During menses',
              'After menses',
              'Cramping',
              'Backache'
            ].map(item => {
              const active = formData.pain.includes(item);
              return (
                <label
                  key={item}
                  className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs cursor-pointer border transition-all ${
                    active
                      ? 'bg-rose-50 border-rose-400 text-rose-900 font-semibold shadow-2xs'
                      : 'bg-[#f1f6f4] border-transparent text-slate-700 hover:border-slate-300'
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={active}
                    onChange={() => handleCheckboxToggle('pain', item)}
                    className="rounded text-rose-600"
                  />
                  <span>{item}</span>
                </label>
              );
            })}
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 text-xs pt-2">
          <div className="space-y-1">
            <label className="font-bold text-slate-700">Ovulation Symptoms / अंडोत्सर्जनाची लक्षणे</label>
            <input
              name="ovulationSymptoms"
              value={formData.ovulationSymptoms}
              onChange={handleChange}
              placeholder="e.g. mid-cycle pain (mittelschmerz), egg-white mucus"
              className="w-full border border-slate-300 rounded-lg p-2 text-slate-900 focus:outline-none"
            />
          </div>
          <div className="space-y-1">
            <label className="font-bold text-slate-700">Other Menstrual Details / इतर मासिक पाळीची माहिती</label>
            <textarea
              name="menstrualOther"
              rows={2}
              value={formData.menstrualOther}
              onChange={handleChange}
              placeholder="Premenstrual headache, mood changes, breast tenderness..."
              className="w-full border border-slate-300 rounded-lg p-2 text-slate-900 focus:outline-none"
            />
          </div>
        </div>
      </div>

      {/* Section 2: Obstetric History */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4">
        <h2 className="text-sm font-bold text-[#086b4d] bg-[#e8f6f1] -mx-6 -mt-6 px-6 py-3 rounded-t-2xl flex items-center gap-2">
          <span>🤰</span> 2. Obstetric History / प्रसूतीचा इतिहास
        </h2>

        <div className="grid grid-cols-2 sm:grid-cols-6 gap-3 text-xs">
          <div className="space-y-1">
            <label className="font-bold text-slate-700">Gravida (G)</label>
            <input
              name="gravida"
              type="number"
              value={formData.gravida}
              onChange={handleChange}
              className="w-full border border-slate-300 rounded-lg p-2 text-slate-900 focus:outline-none font-bold"
            />
          </div>
          <div className="space-y-1">
            <label className="font-bold text-slate-700">Para (P)</label>
            <input
              name="para"
              type="number"
              value={formData.para}
              onChange={handleChange}
              className="w-full border border-slate-300 rounded-lg p-2 text-slate-900 focus:outline-none font-bold"
            />
          </div>
          <div className="space-y-1">
            <label className="font-bold text-slate-700">Abortions (A)</label>
            <input
              name="abortions"
              type="number"
              value={formData.abortions}
              onChange={handleChange}
              className="w-full border border-slate-300 rounded-lg p-2 text-slate-900 focus:outline-none font-bold"
            />
          </div>
          <div className="space-y-1">
            <label className="font-bold text-slate-700">Living (L)</label>
            <input
              name="living"
              type="number"
              value={formData.living}
              onChange={handleChange}
              className="w-full border border-slate-300 rounded-lg p-2 text-slate-900 focus:outline-none font-bold"
            />
          </div>
          <div className="space-y-1">
            <label className="font-bold text-slate-700">Ectopic</label>
            <select
              name="ectopic"
              value={formData.ectopic}
              onChange={handleChange}
              className="w-full border border-slate-300 rounded-lg p-2 text-slate-900 focus:outline-none"
            >
              <option value="No / नाही">No / नाही</option>
              <option value="Yes / होय">Yes / होय</option>
            </select>
          </div>
          <div className="space-y-1">
            <label className="font-bold text-slate-700">Stillbirth</label>
            <select
              name="stillbirth"
              value={formData.stillbirth}
              onChange={handleChange}
              className="w-full border border-slate-300 rounded-lg p-2 text-slate-900 focus:outline-none"
            >
              <option value="No / नाही">No / नाही</option>
              <option value="Yes / होय">Yes / होय</option>
            </select>
          </div>
        </div>

        {/* Dynamic Pregnancy List */}
        <div className="space-y-3 pt-2">
          {formData.pregnancies.map((p, idx) => (
            <div key={p.id} className="border border-[#d8e3df] rounded-xl p-4 bg-slate-50/70 space-y-3 text-xs">
              <div className="flex justify-between items-center border-b border-slate-200 pb-2">
                <strong className="text-teal-900 font-bold">Pregnancy / गर्भधारणा #{idx + 1}</strong>
                <button
                  type="button"
                  onClick={() => removePregnancy(p.id)}
                  className="px-2 py-1 text-rose-700 bg-rose-50 hover:bg-rose-100 rounded-lg font-bold flex items-center gap-1"
                >
                  <Trash2 className="w-3.5 h-3.5" /> Remove / काढा
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 md:grid-cols-6 gap-3">
                <div className="space-y-1">
                  <label className="font-semibold text-slate-700">Year</label>
                  <input
                    value={p.year}
                    onChange={(e) => updatePregnancy(p.id, 'year', e.target.value)}
                    className="w-full border border-slate-300 rounded-lg p-1.5 bg-white text-slate-900"
                  />
                </div>
                <div className="space-y-1">
                  <label className="font-semibold text-slate-700">Outcome</label>
                  <select
                    value={p.outcome}
                    onChange={(e) => updatePregnancy(p.id, 'outcome', e.target.value)}
                    className="w-full border border-slate-300 rounded-lg p-1.5 bg-white text-slate-900"
                  >
                    <option value="Live birth">Live birth</option>
                    <option value="Miscarriage">Miscarriage</option>
                    <option value="Stillbirth / मृतजन्म">Stillbirth / मृतजन्म</option>
                    <option value="Ectopic">Ectopic</option>
                    <option value="Termination">Termination</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="font-semibold text-slate-700">Gestational Age</label>
                  <input
                    value={p.gestation}
                    onChange={(e) => updatePregnancy(p.id, 'gestation', e.target.value)}
                    placeholder="e.g. 38 weeks"
                    className="w-full border border-slate-300 rounded-lg p-1.5 bg-white text-slate-900"
                  />
                </div>
                <div className="space-y-1">
                  <label className="font-semibold text-slate-700">Mode of Delivery</label>
                  <select
                    value={p.delivery}
                    onChange={(e) => updatePregnancy(p.id, 'delivery', e.target.value)}
                    className="w-full border border-slate-300 rounded-lg p-1.5 bg-white text-slate-900"
                  >
                    <option value="Normal vaginal delivery">Normal vaginal delivery</option>
                    <option value="LSCS">LSCS</option>
                    <option value="Assisted">Assisted</option>
                    <option value="Not applicable / लागू नाही">Not applicable / लागू नाही</option>
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="font-semibold text-slate-700">Birth Weight</label>
                  <input
                    value={p.weight}
                    onChange={(e) => updatePregnancy(p.id, 'weight', e.target.value)}
                    placeholder="e.g. 3.1 kg"
                    className="w-full border border-slate-300 rounded-lg p-1.5 bg-white text-slate-900"
                  />
                </div>
                <div className="space-y-1">
                  <label className="font-semibold text-slate-700">Sex of Child</label>
                  <select
                    value={p.sex}
                    onChange={(e) => updatePregnancy(p.id, 'sex', e.target.value)}
                    className="w-full border border-slate-300 rounded-lg p-1.5 bg-white text-slate-900"
                  >
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Not applicable / लागू नाही">Not applicable / लागू नाही</option>
                  </select>
                </div>
                <div className="sm:col-span-6 space-y-1">
                  <label className="font-semibold text-slate-700">Complications / Notes</label>
                  <textarea
                    rows={1}
                    value={p.notes}
                    onChange={(e) => updatePregnancy(p.id, 'notes', e.target.value)}
                    placeholder="Pre-eclampsia, gestational diabetes, neonatal jaundice..."
                    className="w-full border border-slate-300 rounded-lg p-1.5 bg-white text-slate-900"
                  />
                </div>
              </div>
            </div>
          ))}

          <button
            type="button"
            onClick={addPregnancy}
            className="px-4 py-2 bg-[#f0ad4e] hover:bg-[#ec971f] text-slate-900 font-bold rounded-xl text-xs flex items-center gap-1.5 shadow-2xs"
          >
            <Plus className="w-4 h-4" />
            <span>+ Add Pregnancy / गर्भधारणा जोडा</span>
          </button>
        </div>
      </div>

      {/* Section 3: Gynecological History */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4">
        <h2 className="text-sm font-bold text-[#086b4d] bg-[#e8f6f1] -mx-6 -mt-6 px-6 py-3 rounded-t-2xl flex items-center gap-2">
          <span>💕</span> 3. Gynecological History / स्त्रीरोगाचा इतिहास
        </h2>

        <div>
          <label className="font-bold text-slate-800 text-xs block mb-2">
            Quick Symptoms / मुख्य लक्षणे — जलद निवड
          </label>
          <div className="flex flex-wrap gap-2">
            {[
              'Vaginal discharge',
              'Itching',
              'Burning',
              'Pelvic pain',
              'Dyspareunia',
              'PCOS/PCOD',
              'Fibroid',
              'Endometriosis',
              'Ovarian cyst',
              'PID',
              'Cervical problem',
              'Previous gynecological surgery'
            ].map(item => {
              const active = formData.gyn.includes(item);
              return (
                <label
                  key={item}
                  className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs cursor-pointer border transition-all ${
                    active
                      ? 'bg-pink-50 border-pink-500 text-pink-900 font-semibold shadow-2xs'
                      : 'bg-[#f1f6f4] border-transparent text-slate-700 hover:border-slate-300'
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={active}
                    onChange={() => handleCheckboxToggle('gyn', item)}
                    className="rounded text-pink-600"
                  />
                  <span>{item}</span>
                </label>
              );
            })}
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5 text-xs pt-2">
          <div className="space-y-1">
            <label className="font-bold text-slate-700">Discharge Character / योनीमार्गातील स्त्रावाचे स्वरूप</label>
            <input
              name="dischargeCharacter"
              value={formData.dischargeCharacter}
              onChange={handleChange}
              placeholder="Colour / consistency / odour (e.g. curd-like, yellow, acrid)"
              className="w-full border border-slate-300 rounded-lg p-2 text-slate-900 focus:outline-none"
            />
          </div>
          <div className="space-y-1">
            <label className="font-bold text-slate-700">Contraceptive History / गर्भनिरोधक इतिहास</label>
            <input
              name="contraceptive"
              value={formData.contraceptive}
              onChange={handleChange}
              placeholder="e.g. Copper-T, OCPs, Barrier, None"
              className="w-full border border-slate-300 rounded-lg p-2 text-slate-900 focus:outline-none"
            />
          </div>
          <div className="space-y-1">
            <label className="font-bold text-slate-700">Previous Gynecological Treatment / पूर्वीचे स्त्रीरोग उपचार</label>
            <input
              name="gynTreatment"
              value={formData.gynTreatment}
              onChange={handleChange}
              placeholder="Hormonal pills, D&C, laparoscopy, homeopathy"
              className="w-full border border-slate-300 rounded-lg p-2 text-slate-900 focus:outline-none"
            />
          </div>
          <div className="sm:col-span-3 space-y-1">
            <label className="font-bold text-slate-700">Other Gynecological Details / इतर स्त्रीरोग माहिती</label>
            <textarea
              name="gynOther"
              rows={2}
              value={formData.gynOther}
              onChange={handleChange}
              placeholder="USG findings of ovaries/uterus, recurrent candidiasis, urinary burning associated with periods..."
              className="w-full border border-slate-300 rounded-lg p-2 text-slate-900 focus:outline-none"
            />
          </div>
        </div>
      </div>

      {/* Section 4: Infertility — Primary / Secondary */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4">
        <h2 className="text-sm font-bold text-[#086b4d] bg-[#e8f6f1] -mx-6 -mt-6 px-6 py-3 rounded-t-2xl flex items-center gap-2">
          <span>🌱</span> 4. Infertility — Primary / Secondary / वंध्यत्व — प्राथमिक / दुय्यम
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5 text-xs">
          <div className="space-y-1">
            <label className="font-bold text-slate-700">Type</label>
            <select
              name="infertilityType"
              value={formData.infertilityType}
              onChange={handleChange}
              className="w-full border border-slate-300 rounded-lg p-2 text-slate-900 focus:outline-none"
            >
              <option value="Not applicable / लागू नाही">Not applicable / लागू नाही</option>
              <option value="Primary / प्राथमिक">Primary / प्राथमिक</option>
              <option value="Secondary / दुय्यम">Secondary / दुय्यम</option>
            </select>
          </div>
          <div className="space-y-1">
            <label className="font-bold text-slate-700">Duration of Infertility (years) / वंध्यत्वाचा कालावधी (वर्षे)</label>
            <input
              name="infertilityYears"
              type="number"
              step="0.1"
              value={formData.infertilityYears}
              onChange={handleChange}
              placeholder="e.g. 2.5"
              className="w-full border border-slate-300 rounded-lg p-2 text-slate-900 focus:outline-none"
            />
          </div>
          <div className="space-y-1">
            <label className="font-bold text-slate-700">Trying Since / गर्भधारणेचा प्रयत्न सुरू झाल्यापासून</label>
            <input
              name="tryingSince"
              type="date"
              value={formData.tryingSince}
              onChange={handleChange}
              className="w-full border border-slate-300 rounded-lg p-2 text-slate-900 focus:outline-none"
            />
          </div>
          <div className="space-y-1">
            <label className="font-bold text-slate-700">Intercourse Frequency / लैंगिक संबंधांची वारंवारता</label>
            <select
              name="frequency"
              value={formData.frequency}
              onChange={handleChange}
              className="w-full border border-slate-300 rounded-lg p-2 text-slate-900 focus:outline-none"
            >
              <option value="1–2 times/week">1–2 times/week</option>
              <option value="3+ times/week">3+ times/week</option>
              <option value="Less than weekly">Less than weekly</option>
              <option value="Variable">Variable</option>
            </select>
          </div>
          <div className="space-y-1">
            <label className="font-bold text-slate-700">Previous Conception / पूर्वी गर्भधारणा झाली का?</label>
            <select
              name="previousConception"
              value={formData.previousConception}
              onChange={handleChange}
              className="w-full border border-slate-300 rounded-lg p-2 text-slate-900 focus:outline-none"
            >
              <option value="No / नाही">No / नाही</option>
              <option value="Yes / होय">Yes / होय</option>
            </select>
          </div>
          <div className="space-y-1">
            <label className="font-bold text-slate-700">Ovulation History / अंडोत्सर्जनाचा इतिहास</label>
            <select
              name="ovulationHistory"
              value={formData.ovulationHistory}
              onChange={handleChange}
              className="w-full border border-slate-300 rounded-lg p-2 text-slate-900 focus:outline-none"
            >
              <option value="Not assessed">Not assessed</option>
              <option value="Regular ovulation">Regular ovulation</option>
              <option value="Irregular / अनियमित">Irregular / अनियमित</option>
              <option value="Anovulation documented">Anovulation documented</option>
            </select>
          </div>
        </div>

        <div className="pt-2">
          <label className="font-bold text-slate-800 text-xs block mb-2">
            Previous Fertility Treatment — Quick Check / पूर्वीचे वंध्यत्व उपचार — जलद निवड
          </label>
          <div className="flex flex-wrap gap-2">
            {[
              'None',
              'Ovulation induction',
              'IUI',
              'IVF',
              'ICSI',
              'Other'
            ].map(item => {
              const active = formData.fertility.includes(item);
              return (
                <label
                  key={item}
                  className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs cursor-pointer border transition-all ${
                    active
                      ? 'bg-teal-50 border-teal-500 text-teal-900 font-semibold shadow-2xs'
                      : 'bg-[#f1f6f4] border-transparent text-slate-700 hover:border-slate-300'
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={active}
                    onChange={() => handleCheckboxToggle('fertility', item)}
                    className="rounded text-teal-600"
                  />
                  <span>{item}</span>
                </label>
              );
            })}
          </div>
        </div>

        <div className="space-y-1 text-xs pt-1">
          <label className="font-bold text-slate-700">
            Infertility Details / Previous Treatment / Partner Evaluation / वंध्यत्वाची माहिती / पूर्वीचे उपचार / जोडीदाराचे मूल्यांकन
          </label>
          <textarea
            name="infertilityOther"
            rows={2}
            value={formData.infertilityOther}
            onChange={handleChange}
            placeholder="Semen analysis count/motility, HSG tubal patency status, clomiphene cycles..."
            className="w-full border border-slate-300 rounded-lg p-2 text-slate-900 focus:outline-none"
          />
        </div>
      </div>

      {/* Section 5: Investigations & Reports */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4">
        <h2 className="text-sm font-bold text-[#086b4d] bg-[#e8f6f1] -mx-6 -mt-6 px-6 py-3 rounded-t-2xl flex items-center gap-2">
          <span>🧪</span> 5. Investigations & Reports / तपासण्या व रिपोर्ट
        </h2>

        <div>
          <label className="font-bold text-slate-800 text-xs block mb-2">
            Investigation Quick Check / तपासण्यांची जलद निवड
          </label>
          <div className="flex flex-wrap gap-2">
            {[
              'CBC/Hb',
              'Blood sugar/HbA1c',
              'TSH',
              'FSH',
              'LH',
              'AMH',
              'Prolactin',
              'Estradiol',
              'Progesterone',
              'USG Pelvis',
              'Follicular Study',
              'HSG',
              'Semen Analysis',
              'Other'
            ].map(item => {
              const active = formData.investigation.includes(item);
              return (
                <label
                  key={item}
                  className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs cursor-pointer border transition-all ${
                    active
                      ? 'bg-teal-50 border-teal-500 text-teal-900 font-semibold shadow-2xs'
                      : 'bg-[#f1f6f4] border-transparent text-slate-700 hover:border-slate-300'
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={active}
                    onChange={() => handleCheckboxToggle('investigation', item)}
                    className="rounded text-teal-600"
                  />
                  <span>{item}</span>
                </label>
              );
            })}
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5 text-xs pt-2">
          <div className="space-y-1">
            <label className="font-bold text-slate-700">Investigation Date / तपासणी दिनांक</label>
            <input
              name="investigationDate"
              type="date"
              value={formData.investigationDate}
              onChange={handleChange}
              className="w-full border border-slate-300 rounded-lg p-2 text-slate-900 focus:outline-none"
            />
          </div>
          <div className="space-y-1">
            <label className="font-bold text-slate-700">Report / Key Finding / रिपोर्ट / मुख्य निष्कर्ष</label>
            <input
              name="reportFinding"
              value={formData.reportFinding}
              onChange={handleChange}
              placeholder="e.g. USG: Bulky ovaries with multiple subcentimetric peripheral follicles (PCOD)"
              className="w-full border border-slate-300 rounded-lg p-2 text-slate-900 focus:outline-none"
            />
          </div>
          <div className="space-y-1">
            <label className="font-bold text-slate-700">Reference / Lab / लॅब / संदर्भ</label>
            <input
              name="lab"
              value={formData.lab}
              onChange={handleChange}
              placeholder="e.g. Metropolis / Dr. Lal PathLabs"
              className="w-full border border-slate-300 rounded-lg p-2 text-slate-900 focus:outline-none"
            />
          </div>
          <div className="sm:col-span-3 space-y-1">
            <label className="font-bold text-slate-700">Investigation Notes / तपासणीच्या नोंदी</label>
            <textarea
              name="investigationNotes"
              rows={2}
              value={formData.investigationNotes}
              onChange={handleChange}
              placeholder="AMH levels, endometrial thickness on day 12, LH:FSH ratio..."
              className="w-full border border-slate-300 rounded-lg p-2 text-slate-900 focus:outline-none"
            />
          </div>

          {/* Photo upload */}
          <div className="sm:col-span-3 space-y-2 pt-2 border-t border-slate-100">
            <label className="font-bold text-slate-800 text-xs flex items-center gap-1.5">
              <span>📷</span> Upload Investigation Photos / Reports / तपासणीचे फोटो / रिपोर्ट अपलोड करा
            </label>
            <div className="flex items-center gap-3">
              <label className="cursor-pointer px-4 py-2 bg-slate-100 hover:bg-slate-200 border border-slate-300 rounded-xl text-xs font-semibold text-slate-700 flex items-center gap-2 transition-colors">
                <Upload className="w-4 h-4 text-pink-700" />
                <span>Choose Reports / Photos</span>
                <input
                  type="file"
                  accept="image/*,.pdf"
                  multiple
                  onChange={handleFileUpload}
                  className="hidden"
                />
              </label>
              <span className="text-[11px] text-slate-400">
                Images are kept in this browser's local storage when saved. PDFs are recorded by filename.
              </span>
            </div>

            {formData.reportFiles.length > 0 && (
              <div className="flex flex-wrap gap-3 pt-2">
                {formData.reportFiles.map((file, idx) => (
                  <div key={idx} className="relative group border border-slate-300 rounded-xl overflow-hidden bg-slate-50 p-1">
                    {file.data ? (
                      <img
                        src={file.data}
                        alt={file.name}
                        className="w-28 h-20 object-cover rounded-lg"
                      />
                    ) : (
                      <div className="w-28 h-20 flex flex-col items-center justify-center text-[10px] text-slate-600 p-2 text-center">
                        <FileText className="w-5 h-5 text-slate-400 mb-1" />
                        <span className="truncate w-full">{file.name}</span>
                      </div>
                    )}
                    <button
                      type="button"
                      onClick={() => removeFile(idx)}
                      className="absolute top-1 right-1 p-1 bg-rose-600 text-white rounded-full opacity-80 hover:opacity-100 transition-opacity"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Section 6: Assessment & Doctor's Plan */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4">
        <h2 className="text-sm font-bold text-[#086b4d] bg-[#e8f6f1] -mx-6 -mt-6 px-6 py-3 rounded-t-2xl flex items-center gap-2">
          <span>📋</span> 6. Assessment & Follow-up / मूल्यमापन व फॉलो-अप
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5 text-xs">
          <div className="space-y-1">
            <label className="font-bold text-slate-700">Clinical Assessment / क्लिनिकल मूल्यांकन</label>
            <input
              name="assessment"
              value={formData.assessment}
              onChange={handleChange}
              placeholder="e.g. Polycystic Ovarian Syndrome with Oligomenorrhea"
              className="w-full border border-slate-300 rounded-lg p-2 text-slate-900 focus:outline-none"
            />
          </div>
          <div className="space-y-1">
            <label className="font-bold text-slate-700">Working Diagnosis / संभाव्य निदान</label>
            <input
              name="diagnosis"
              value={formData.diagnosis}
              onChange={handleChange}
              placeholder="e.g. PCOD with secondary subfertility (Sepia / Pulsatilla constitution)"
              className="w-full border border-slate-300 rounded-lg p-2 text-slate-900 focus:outline-none"
            />
          </div>
          <div className="space-y-1">
            <label className="font-bold text-slate-700">Follow-up Date / पुढील भेट दिनांक</label>
            <input
              name="followupDate"
              type="date"
              value={formData.followupDate}
              onChange={handleChange}
              className="w-full border border-slate-300 rounded-lg p-2 text-slate-900 focus:outline-none"
            />
          </div>
          <div className="sm:col-span-3 space-y-1">
            <label className="font-bold text-slate-700">Doctor's Notes / डॉक्टरांच्या नोंदी</label>
            <textarea
              name="doctorNotes"
              rows={3}
              value={formData.doctorNotes}
              onChange={handleChange}
              placeholder="Dietary changes, low glycemic index advice, follicular tracking plan..."
              className="w-full border border-slate-300 rounded-lg p-2.5 text-slate-900 focus:outline-none"
            />
          </div>
        </div>
      </div>

      {/* Bottom Sticky Action Buttons */}
      <div className="sticky bottom-0 bg-white/95 backdrop-blur-xs p-4 rounded-2xl border border-slate-200 shadow-lg flex items-center justify-center gap-3 z-30">
        <button
          type="button"
          onClick={handleSave}
          className="px-5 py-2.5 bg-[#087f5b] hover:bg-[#076f4f] text-white font-bold text-xs rounded-xl transition-all shadow-xs flex items-center gap-2"
        >
          <Save className="w-4 h-4" />
          <span>💾 Save / जतन करा</span>
        </button>

        <button
          type="button"
          onClick={handleSubmit}
          className="px-5 py-2.5 bg-[#1769aa] hover:bg-[#13578d] text-white font-bold text-xs rounded-xl transition-all shadow-xs flex items-center gap-2"
        >
          <Printer className="w-4 h-4" />
          <span>📤 Submit / सबमिट करा</span>
        </button>

        <button
          type="button"
          onClick={handleClear}
          className="px-5 py-2.5 bg-[#d9534f] hover:bg-[#c9302c] text-white font-bold text-xs rounded-xl transition-all shadow-xs flex items-center gap-2"
        >
          <RotateCcw className="w-4 h-4" />
          <span>🗑️ Clear / साफ करा</span>
        </button>
      </div>
    </div>
  );
};
