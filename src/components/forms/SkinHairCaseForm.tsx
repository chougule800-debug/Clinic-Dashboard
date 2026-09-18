import React, { useState, useEffect } from 'react';
import { useClinic } from '../../context/ClinicContext';
import {
  Save,
  CheckCircle2,
  RotateCcw,
  Camera,
  Trash2,
  Sparkles,
  User,
  Calendar,
  Phone,
  FileText,
  Printer,
  ChevronRight,
  AlertCircle
} from 'lucide-react';

export interface SkinHairFormData {
  patientName: string;
  age: string;
  sex: string;
  mobile: string;
  date: string;
  occupation: string;
  marital: string;
  address: string;

  // 2. Skin & Acne
  skinProblem: string;
  skinSince: string;
  acneSeverity: string;
  acneLocation: string[];
  skinSymptom: string[];
  acneTrigger: string[];
  acneTreatment: string;
  cosmetics: string;
  skinHistory: string;

  // 3. Acne Photo
  acnePhoto: string;

  // 4. Hair Fall
  hairSince: string;
  dandruffSince: string;
  hairAmount: string;
  fallWhen: string[];
  symptom: string[];
  pattern: string[];

  // 5. Hair History
  shampoo: string;
  hairOil: string;
  hairColour: string;
  straightening: string;
  heat: string;
  helmet: string;
  wash: string;
  water: string;
  previousTreatment: string;

  // 6. Menstrual
  menarcheAge: string;
  lmp: string;
  cycle: string;
  cycleLength: string;
  bleeding: string;
  bleedingDays: string;
  periodPain: string;
  clots: string;
  pms: string;
  pcos: string;
  facialHair: string;
  periodAcne: string;

  // 7. Diet
  diet: string;
  protein: string;
  waterIntake: string;
  crashDiet: string;
  appetite: string;
  tea: string;
  dietDetails: string;

  // 8. Lifestyle
  sleep: string;
  stress: string;
  exercise: string;
  screenTime: string;
  recentIllness: string;
  majorStress: string;

  // 9. Investigations
  cbc: string;
  ferritin: string;
  iron: string;
  vitD: string;
  b12: string;
  tsh: string;
  otherReports: string;

  // 10. Hair Photos
  photo1: string;
  photo2: string;
  photo3: string;
  photo4: string;
  photo5: string;

  // 11. Other Problems
  otherProblems: string;

  // 12. Assessment
  dandruffSeverity: string;
  hairSeverity: string;
  density: string;
  clinicalFindings: string;
  assessment: string;

  // 13. Treatment
  treatment: string;
  advice: string;
  followup: string;
  followupNotes: string;
  savedAt?: string;
}

const INITIAL_FORM_DATA: SkinHairFormData = {
  patientName: '',
  age: '',
  sex: '',
  mobile: '',
  date: new Date().toISOString().split('T')[0],
  occupation: '',
  marital: 'Single / अविवाहित',
  address: '',

  skinProblem: 'Acne / मुरुम',
  skinSince: '',
  acneSeverity: 'Moderate / मध्यम',
  acneLocation: [],
  skinSymptom: [],
  acneTrigger: [],
  acneTreatment: '',
  cosmetics: '',
  skinHistory: '',

  acnePhoto: '',

  hairSince: '',
  dandruffSince: '',
  hairAmount: '20–50/day / दिवसाला २०–५०',
  fallWhen: [],
  symptom: [],
  pattern: [],

  shampoo: '',
  hairOil: '',
  hairColour: 'No / नाही',
  straightening: 'No / नाही',
  heat: 'No / नाही',
  helmet: 'No / नाही',
  wash: '2–3 times/week / आठवड्यात २–३ वेळा',
  water: 'No / नाही',
  previousTreatment: '',

  menarcheAge: '',
  lmp: '',
  cycle: 'Regular / नियमित',
  cycleLength: '28 days',
  bleeding: 'Moderate / मध्यम',
  bleedingDays: '4 days',
  periodPain: 'No / नाही',
  clots: 'No / नाही',
  pms: '',
  pcos: 'No / नाही',
  facialHair: 'No / नाही',
  periodAcne: 'No / नाही',

  diet: 'Vegetarian / शाकाहारी',
  protein: 'Moderate / मध्यम',
  waterIntake: '2-3 L',
  crashDiet: 'No / नाही',
  appetite: 'Normal / सामान्य',
  tea: '',
  dietDetails: '',

  sleep: '7-8 hours normal',
  stress: 'Moderate / मध्यम',
  exercise: '',
  screenTime: '',
  recentIllness: '',
  majorStress: '',

  cbc: '',
  ferritin: '',
  iron: '',
  vitD: '',
  b12: '',
  tsh: '',
  otherReports: '',

  photo1: '',
  photo2: '',
  photo3: '',
  photo4: '',
  photo5: '',

  otherProblems: '',

  dandruffSeverity: 'Moderate / मध्यम',
  hairSeverity: 'Moderate / मध्यम',
  density: 'Normal / सामान्य',
  clinicalFindings: '',
  assessment: '',

  treatment: '',
  advice: '',
  followup: '',
  followupNotes: ''
};

export const SkinHairCaseForm: React.FC = () => {
  const {
    selectedPatient,
    patients,
    selectPatient,
    saveSystemForm,
    systemForms,
    setActiveTab
  } = useClinic();

  const [formData, setFormData] = useState<SkinHairFormData>(INITIAL_FORM_DATA);
  const [statusMessage, setStatusMessage] = useState<string>('');
  const [statusType, setStatusType] = useState<'success' | 'error' | 'info'>('info');

  // Load patient details & saved skin_hair form
  useEffect(() => {
    // 1. Check if this patient has an existing skin_hair record in systemForms
    if (selectedPatient) {
      const existing = systemForms.find(
        f => f.patientId === selectedPatient.id && f.system === 'skin_hair'
      );

      if (existing && existing.data) {
        setFormData({
          ...INITIAL_FORM_DATA,
          ...existing.data,
          patientName: selectedPatient.name,
          age: String(selectedPatient.age || ''),
          sex: selectedPatient.gender === 'Female' ? 'Female / स्त्री' : selectedPatient.gender === 'Male' ? 'Male / पुरुष' : 'Other / इतर',
          mobile: selectedPatient.mobile || '',
          address: selectedPatient.address || existing.data.address || '',
          date: existing.data.date || new Date().toISOString().split('T')[0]
        });
        return;
      }

      // Check localStorage for draft
      try {
        const stored = localStorage.getItem(`arogyaSkinHairCase_${selectedPatient.id}`);
        if (stored) {
          const parsed = JSON.parse(stored);
          setFormData(prev => ({
            ...prev,
            ...parsed,
            patientName: selectedPatient.name,
            age: String(selectedPatient.age || ''),
            sex: selectedPatient.gender === 'Female' ? 'Female / स्त्री' : selectedPatient.gender === 'Male' ? 'Male / पुरुष' : 'Other / इतर',
            mobile: selectedPatient.mobile || '',
            address: selectedPatient.address || ''
          }));
          return;
        }
      } catch (_) {}

      // Fallback: Populate patient demography
      setFormData(prev => ({
        ...prev,
        patientName: selectedPatient.name,
        age: String(selectedPatient.age || ''),
        sex: selectedPatient.gender === 'Female' ? 'Female / स्त्री' : selectedPatient.gender === 'Male' ? 'Male / पुरुष' : 'Other / इतर',
        mobile: selectedPatient.mobile || '',
        address: selectedPatient.address || ''
      }));
    }
  }, [selectedPatient?.id, systemForms]);

  // Handle generic text/select change
  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { id, value } = e.target;
    setFormData(prev => ({ ...prev, [id]: value }));
  };

  // Handle Checkbox Toggles
  const handleCheckboxToggle = (category: keyof SkinHairFormData, value: string) => {
    setFormData(prev => {
      const currentList = (prev[category] as string[]) || [];
      const updated = currentList.includes(value)
        ? currentList.filter(item => item !== value)
        : [...currentList, value];
      return { ...prev, [category]: updated };
    });
  };

  // Photo Upload Handler (FileReader base64)
  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>, key: keyof SkinHairFormData) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        if (reader.result) {
          setFormData(prev => ({ ...prev, [key]: reader.result as string }));
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const removePhoto = (key: keyof SkinHairFormData) => {
    setFormData(prev => ({ ...prev, [key]: '' }));
  };

  // Save Case
  const handleSave = () => {
    if (!formData.patientName.trim()) {
      setStatusMessage('Please enter Patient Name / कृपया रुग्णाचे नाव भरा.');
      setStatusType('error');
      return;
    }

    const savedAt = new Date().toLocaleString();
    const updatedData = { ...formData, savedAt };

    // 1. Save locally in localStorage
    if (selectedPatient) {
      localStorage.setItem(`arogyaSkinHairCase_${selectedPatient.id}`, JSON.stringify(updatedData));
    }
    localStorage.setItem('arogyaSkinHairCase', JSON.stringify(updatedData));

    // 2. Build structured chief complaints for the clinic system
    const chiefComplaintsText = [
      formData.skinProblem ? `Skin: ${formData.skinProblem} (${formData.acneSeverity})` : '',
      formData.skinSince ? `Since: ${formData.skinSince}` : '',
      formData.acneLocation?.length ? `Acne at: ${formData.acneLocation.join(', ')}` : '',
      formData.hairSince ? `Hair fall since: ${formData.hairSince} (${formData.hairAmount})` : '',
      formData.symptom?.length ? `Scalp: ${formData.symptom.join(', ')}` : ''
    ].filter(Boolean).join(' • ');

    const modalitiesAgg = [
      formData.acneTrigger?.length ? `Triggers: ${formData.acneTrigger.join(', ')}` : '',
      formData.fallWhen?.length ? `Hair fall when: ${formData.fallWhen.join(', ')}` : ''
    ].filter(Boolean).join('; ');

    const modalitiesAmel = [
      formData.wash ? `Wash: ${formData.wash}` : '',
      formData.advice ? `Advice: ${formData.advice}` : ''
    ].filter(Boolean).join('; ');

    // 3. Save into global ClinicContext
    if (selectedPatient) {
      saveSystemForm({
        patientId: selectedPatient.id,
        system: 'skin_hair',
        chiefComplaints: chiefComplaintsText || 'Skin & Hairfall Presentation',
        duration: formData.skinSince || formData.hairSince || 'Recorded Case',
        severity: formData.acneSeverity?.includes('Severe') || formData.hairSeverity?.includes('Severe') ? 'Severe' : formData.acneSeverity?.includes('Mild') ? 'Mild' : 'Moderate',
        modalitiesAggravation: modalitiesAgg || 'Heat, stress, periods',
        modalitiesAmelioration: modalitiesAmel || 'Cool applications',
        concomitants: formData.otherProblems || '',
        clinicalNotes: formData.clinicalFindings || formData.assessment || '',
        data: updatedData,
        submittedVia: 'Doctor_Dashboard'
      });
    }

    setStatusMessage('✓ Case Saved Successfully / केस यशस्वीरित्या सेव्ह झाली. Synced to Case Summary.');
    setStatusType('success');
    setTimeout(() => setStatusMessage(''), 5000);
  };

  // Submit Case
  const handleSubmit = () => {
    handleSave();
    setStatusMessage('✓ Case Submitted Successfully / केस यशस्वीरित्या सबमिट झाली. Opening printable document...');
    setStatusType('success');
    setTimeout(() => {
      window.print();
    }, 600);
  };

  // Clear Form
  const handleClear = () => {
    if (window.confirm('Clear this case?\nही केस क्लिअर करायची आहे का?')) {
      setFormData(INITIAL_FORM_DATA);
      setStatusMessage('Form cleared.');
      setStatusType('info');
      setTimeout(() => setStatusMessage(''), 3000);
    }
  };

  return (
    <div className="space-y-6 pb-28 max-w-6xl mx-auto">
      {/* Patient Link & Selector Ribbon */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-teal-50 border border-teal-200 flex items-center justify-center text-teal-700">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs uppercase font-bold text-teal-800 tracking-wider">Clinical Module</span>
              <span className="text-slate-300">•</span>
              <span className="text-xs font-semibold text-slate-600">
                Active Patient: <strong className="text-slate-900">{selectedPatient?.name || 'No Patient Selected'}</strong>
              </span>
            </div>
            <h2 className="text-lg font-bold text-slate-900 font-serif">
              Skin & Hairfall Comprehensive Case Taking (त्वचा व मुरुम, केस गळणे)
            </h2>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Quick Select Patient */}
          <div className="relative">
            <select
              value={selectedPatient?.id || ''}
              onChange={(e) => {
                const pat = patients.find(p => p.id === e.target.value);
                if (pat) selectPatient(pat.id);
              }}
              className="px-3 py-1.5 bg-slate-50 border border-slate-300 rounded-xl text-xs font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-teal-500"
            >
              <option value="" disabled>Switch / Select Patient...</option>
              {patients.map(p => (
                <option key={p.id} value={p.id}>{p.name} ({p.id})</option>
              ))}
            </select>
          </div>

          <button
            type="button"
            onClick={() => setActiveTab('case_summary')}
            className="px-3.5 py-1.5 bg-teal-50 hover:bg-teal-100 text-teal-800 border border-teal-200 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors"
          >
            <FileText className="w-3.5 h-3.5" />
            <span>View Consolidated Summary</span>
          </button>
        </div>
      </div>

      {/* Main Form Banner */}
      <header className="bg-gradient-to-r from-emerald-800 to-teal-700 text-white rounded-2xl p-6 shadow-md text-center">
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">
          Dr. Bharat's Aroga Homeopathy
        </h1>
        <h2 className="text-sm sm:text-base font-medium opacity-90 mt-1">
          Opp. Central Jail, Hindalga, Belgaum &nbsp;|&nbsp; 9902686173
        </h2>
        <div className="mt-3 pt-3 border-t border-white/20 text-lg sm:text-xl font-bold">
          Skin & Hairfall Case Taking / त्वचा व केस गळणे केस टेकिंग
        </div>
      </header>

      {/* 1. Patient Details / रुग्णाची माहिती */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-6 space-y-4">
        <h3 className="text-base font-bold text-teal-800 border-b border-teal-100 pb-3 -mx-6 -mt-6 px-6 pt-4 bg-teal-50/40 rounded-t-2xl flex items-center justify-between">
          <span>1. Patient Details / रुग्णाची माहिती</span>
          <span className="text-xs font-normal text-slate-500">Auto-synchronized with Clinic Records</span>
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 pt-2">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Patient Name / रुग्णाचे नाव *
            </label>
            <input
              id="patientName"
              type="text"
              value={formData.patientName}
              onChange={handleChange}
              placeholder="Full name of patient"
              className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs focus:ring-2 focus:ring-teal-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Age / वय
            </label>
            <input
              id="age"
              type="number"
              value={formData.age}
              onChange={handleChange}
              placeholder="Age in years"
              className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs focus:ring-2 focus:ring-teal-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Sex / लिंग
            </label>
            <select
              id="sex"
              value={formData.sex}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs focus:ring-2 focus:ring-teal-500 focus:outline-none bg-white"
            >
              <option value="">Select / निवडा</option>
              <option value="Female / स्त्री">Female / स्त्री</option>
              <option value="Male / पुरुष">Male / पुरुष</option>
              <option value="Other / इतर">Other / इतर</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Mobile / मोबाईल
            </label>
            <input
              id="mobile"
              type="tel"
              value={formData.mobile}
              onChange={handleChange}
              placeholder="10 digit mobile"
              className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs focus:ring-2 focus:ring-teal-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Date / तारीख
            </label>
            <input
              id="date"
              type="date"
              value={formData.date}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs focus:ring-2 focus:ring-teal-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Occupation / व्यवसाय
            </label>
            <input
              id="occupation"
              type="text"
              value={formData.occupation}
              onChange={handleChange}
              placeholder="e.g. Student, Software Engineer, Teacher"
              className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs focus:ring-2 focus:ring-teal-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Marital Status / वैवाहिक स्थिती
            </label>
            <select
              id="marital"
              value={formData.marital}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs focus:ring-2 focus:ring-teal-500 focus:outline-none bg-white"
            >
              <option value="Single / अविवाहित">Single / अविवाहित</option>
              <option value="Married / विवाहित">Married / विवाहित</option>
              <option value="Other / इतर">Other / इतर</option>
            </select>
          </div>

          <div className="sm:col-span-2 md:col-span-3">
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Address / पत्ता
            </label>
            <textarea
              id="address"
              rows={2}
              value={formData.address}
              onChange={handleChange}
              placeholder="Residential address..."
              className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs focus:ring-2 focus:ring-teal-500 focus:outline-none"
            />
          </div>
        </div>
      </div>

      {/* 2. Skin & Acne Case Taking / त्वचा व मुरुम केस टेकिंग */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-6 space-y-4">
        <h3 className="text-base font-bold text-teal-800 border-b border-teal-100 pb-3 -mx-6 -mt-6 px-6 pt-4 bg-teal-50/40 rounded-t-2xl">
          2. Skin & Acne Case Taking / त्वचा व मुरुम केस टेकिंग
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 pt-2">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Main Skin Problem / त्वचेची मुख्य समस्या
            </label>
            <select
              id="skinProblem"
              value={formData.skinProblem}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs focus:ring-2 focus:ring-teal-500 focus:outline-none bg-white"
            >
              <option value="Acne / मुरुम">Acne / मुरुम</option>
              <option value="Pimples / पुरळ">Pimples / पुरळ</option>
              <option value="Blackheads / ब्लॅकहेड्स">Blackheads / ब्लॅकहेड्स</option>
              <option value="Whiteheads / व्हाईटहेड्स">Whiteheads / व्हाईटहेड्स</option>
              <option value="Acne Scars / मुरुमांचे डाग">Acne Scars / मुरुमांचे डाग</option>
              <option value="Pigmentation / काळे डाग">Pigmentation / काळे डाग</option>
              <option value="Dry Skin / कोरडी त्वचा">Dry Skin / कोरडी त्वचा</option>
              <option value="Oily Skin / तेलकट त्वचा">Oily Skin / तेलकट त्वचा</option>
              <option value="Other / इतर">Other / इतर</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Problem Since / समस्या कधीपासून?
            </label>
            <input
              id="skinSince"
              type="text"
              value={formData.skinSince}
              onChange={handleChange}
              placeholder="e.g. 6 months, 2 years"
              className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs focus:ring-2 focus:ring-teal-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Severity / तीव्रता
            </label>
            <select
              id="acneSeverity"
              value={formData.acneSeverity}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs focus:ring-2 focus:ring-teal-500 focus:outline-none bg-white"
            >
              <option value="Mild / सौम्य">Mild / सौम्य</option>
              <option value="Moderate / मध्यम">Moderate / मध्यम</option>
              <option value="Severe / तीव्र">Severe / तीव्र</option>
            </select>
          </div>

          {/* Acne Locations Checkboxes */}
          <div className="sm:col-span-2 md:col-span-3">
            <label className="block text-xs font-bold text-slate-700 mb-1.5">
              Acne Location / मुरुम कुठे आहेत?
            </label>
            <div className="flex flex-wrap gap-2">
              {[
                { key: 'Forehead', label: 'Forehead / कपाळ' },
                { key: 'Cheeks', label: 'Cheeks / गाल' },
                { key: 'Nose', label: 'Nose / नाक' },
                { key: 'Chin', label: 'Chin / हनुवटी' },
                { key: 'Jawline', label: 'Jawline / जबड्याची रेषा' },
                { key: 'Chest', label: 'Chest / छाती' },
                { key: 'Back', label: 'Back / पाठ' }
              ].map(item => {
                const checked = formData.acneLocation.includes(item.key);
                return (
                  <button
                    type="button"
                    key={item.key}
                    onClick={() => handleCheckboxToggle('acneLocation', item.key)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-all ${
                      checked
                        ? 'bg-teal-700 text-white border-teal-800 shadow-xs'
                        : 'bg-teal-50/50 text-slate-700 border-teal-200 hover:bg-teal-100/60'
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={checked}
                      onChange={() => {}}
                      className="mr-1.5 pointer-events-none accent-teal-600"
                    />
                    {item.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Skin Symptoms Checkboxes */}
          <div className="sm:col-span-2 md:col-span-3">
            <label className="block text-xs font-bold text-slate-700 mb-1.5">
              Skin Symptoms / त्वचेची लक्षणे
            </label>
            <div className="flex flex-wrap gap-2">
              {[
                { key: 'Itching', label: 'Itching / खाज' },
                { key: 'Burning', label: 'Burning / जळजळ' },
                { key: 'Redness', label: 'Redness / लालसरपणा' },
                { key: 'Pain', label: 'Pain / दुखणे' },
                { key: 'Pus', label: 'Pus / पू' },
                { key: 'Oily Skin', label: 'Oily Skin / तेलकट त्वचा' },
                { key: 'Dry Skin', label: 'Dry Skin / कोरडी त्वचा' },
                { key: 'Scars', label: 'Scars / डाग' }
              ].map(item => {
                const checked = formData.skinSymptom.includes(item.key);
                return (
                  <button
                    type="button"
                    key={item.key}
                    onClick={() => handleCheckboxToggle('skinSymptom', item.key)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-all ${
                      checked
                        ? 'bg-emerald-700 text-white border-emerald-800 shadow-xs'
                        : 'bg-emerald-50/50 text-slate-700 border-emerald-200 hover:bg-emerald-100/60'
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
          </div>

          {/* Acne Triggers Checkboxes */}
          <div className="sm:col-span-2 md:col-span-3">
            <label className="block text-xs font-bold text-slate-700 mb-1.5">
              Acne Triggers / मुरुम वाढण्याची कारणे
            </label>
            <div className="flex flex-wrap gap-2">
              {[
                { key: 'Periods', label: 'During Periods / पाळीच्या वेळी' },
                { key: 'Stress', label: 'Stress / ताण' },
                { key: 'Food', label: 'Food / आहार' },
                { key: 'Cosmetics', label: 'Cosmetics / सौंदर्य प्रसाधने' },
                { key: 'Sweating', label: 'Sweating / घाम' },
                { key: 'Sun', label: 'Sun Exposure / उन्हात' },
                { key: 'Other', label: 'Other / इतर' }
              ].map(item => {
                const checked = formData.acneTrigger.includes(item.key);
                return (
                  <button
                    type="button"
                    key={item.key}
                    onClick={() => handleCheckboxToggle('acneTrigger', item.key)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-all ${
                      checked
                        ? 'bg-indigo-700 text-white border-indigo-800 shadow-xs'
                        : 'bg-indigo-50/50 text-slate-700 border-indigo-200 hover:bg-indigo-100/60'
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={checked}
                      onChange={() => {}}
                      className="mr-1.5 pointer-events-none accent-indigo-600"
                    />
                    {item.label}
                  </button>
                );
              })}
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Previous Acne Treatment / पूर्वीचे उपचार
            </label>
            <textarea
              id="acneTreatment"
              rows={3}
              value={formData.acneTreatment}
              onChange={handleChange}
              placeholder="Ointments, allopathic medicines, facials..."
              className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs focus:ring-2 focus:ring-teal-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Cosmetics / सौंदर्य प्रसाधने
            </label>
            <textarea
              id="cosmetics"
              rows={3}
              value={formData.cosmetics}
              onChange={handleChange}
              placeholder="Face wash, foundation, creams..."
              className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs focus:ring-2 focus:ring-teal-500 focus:outline-none"
            />
          </div>

          <div className="sm:col-span-2 md:col-span-1">
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Skin History / त्वचेचा इतिहास
            </label>
            <textarea
              id="skinHistory"
              rows={3}
              value={formData.skinHistory}
              onChange={handleChange}
              placeholder="Eczema, fungal infections, allergies..."
              className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs focus:ring-2 focus:ring-teal-500 focus:outline-none"
            />
          </div>
        </div>
      </div>

      {/* 3. Acne Clinical Photograph / मुरुमांचा क्लिनिकल फोटो */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-6 space-y-4">
        <h3 className="text-base font-bold text-teal-800 border-b border-teal-100 pb-3 -mx-6 -mt-6 px-6 pt-4 bg-teal-50/40 rounded-t-2xl flex items-center justify-between">
          <span>3. Acne Clinical Photograph / मुरुमांचा क्लिनिकल फोटो</span>
          <Camera className="w-4 h-4 text-teal-700" />
        </h3>

        <div className="max-w-sm p-4 border-2 border-dashed border-teal-200 rounded-xl bg-teal-50/20 text-center space-y-3">
          <strong className="block text-xs text-slate-800">
            Acne Photograph / मुरुमांचा फोटो
          </strong>

          {formData.acnePhoto ? (
            <div className="space-y-2">
              <img
                src={formData.acnePhoto}
                alt="Acne Clinical Preview"
                className="w-full h-52 object-cover rounded-lg border border-slate-300"
              />
              <button
                type="button"
                onClick={() => removePhoto('acnePhoto')}
                className="px-3 py-1 bg-rose-600 hover:bg-rose-700 text-white rounded-md text-xs font-semibold flex items-center gap-1 mx-auto transition-colors"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Remove Photo</span>
              </button>
            </div>
          ) : (
            <label className="cursor-pointer block py-6 px-4 border border-teal-200 rounded-lg bg-white hover:bg-teal-50/50 transition-colors">
              <Camera className="w-8 h-8 text-teal-600 mx-auto mb-2" />
              <span className="text-xs font-semibold text-teal-800 block">Click to Upload / Capture Photo</span>
              <span className="text-[10px] text-slate-400 block mt-0.5">JPEG, PNG supported</span>
              <input
                type="file"
                accept="image/*"
                onChange={(e) => handlePhotoUpload(e, 'acnePhoto')}
                className="hidden"
              />
            </label>
          )}
        </div>
      </div>

      {/* 4. Hair Fall & Dandruff / केस गळणे व कोंडा */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-6 space-y-4">
        <h3 className="text-base font-bold text-teal-800 border-b border-teal-100 pb-3 -mx-6 -mt-6 px-6 pt-4 bg-teal-50/40 rounded-t-2xl">
          4. Hair Fall & Dandruff / केस गळणे व कोंडा
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 pt-2">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Hair Fall Since / केस गळणे कधीपासून?
            </label>
            <input
              id="hairSince"
              type="text"
              value={formData.hairSince}
              onChange={handleChange}
              placeholder="e.g. 3 months, 1 year"
              className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs focus:ring-2 focus:ring-teal-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Dandruff Since / कोंडा कधीपासून?
            </label>
            <input
              id="dandruffSince"
              type="text"
              value={formData.dandruffSince}
              onChange={handleChange}
              placeholder="e.g. Winters, continuous"
              className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs focus:ring-2 focus:ring-teal-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Approx. Hair Loss / अंदाजे केस गळणे
            </label>
            <select
              id="hairAmount"
              value={formData.hairAmount}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs focus:ring-2 focus:ring-teal-500 focus:outline-none bg-white"
            >
              <option value="Less than 20/day / दिवसाला २० पेक्षा कमी">Less than 20/day / दिवसाला २० पेक्षा कमी</option>
              <option value="20–50/day / दिवसाला २०–५०">20–50/day / दिवसाला २०–५०</option>
              <option value="50–100/day / दिवसाला ५०–१००">50–100/day / दिवसाला ५०–१००</option>
              <option value="More than 100/day / दिवसाला १०० पेक्षा जास्त">More than 100/day / दिवसाला १०० पेक्षा जास्त</option>
              <option value="Don't know / माहिती नाही">Don't know / माहिती नाही</option>
            </select>
          </div>

          {/* Hair Fall When */}
          <div className="sm:col-span-2 md:col-span-3">
            <label className="block text-xs font-bold text-slate-700 mb-1.5">
              Hair Fall When / केस कधी जास्त गळतात?
            </label>
            <div className="flex flex-wrap gap-2">
              {[
                { key: 'Combing', label: 'Combing / केस विंचरताना' },
                { key: 'Washing', label: 'Washing / केस धुताना' },
                { key: 'Sleeping', label: 'Sleeping / झोपताना' },
                { key: 'Throughout day', label: 'Throughout day / दिवसभर' }
              ].map(item => {
                const checked = formData.fallWhen.includes(item.key);
                return (
                  <button
                    type="button"
                    key={item.key}
                    onClick={() => handleCheckboxToggle('fallWhen', item.key)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-all ${
                      checked
                        ? 'bg-amber-700 text-white border-amber-800 shadow-xs'
                        : 'bg-amber-50/50 text-slate-700 border-amber-200 hover:bg-amber-100/60'
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={checked}
                      onChange={() => {}}
                      className="mr-1.5 pointer-events-none accent-amber-600"
                    />
                    {item.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Hair & Scalp Symptoms */}
          <div className="sm:col-span-2 md:col-span-3">
            <label className="block text-xs font-bold text-slate-700 mb-1.5">
              Hair & Scalp Symptoms / केस व टाळूची लक्षणे
            </label>
            <div className="flex flex-wrap gap-2">
              {[
                { key: 'Itching', label: 'Itching / खाज' },
                { key: 'Dry scalp', label: 'Dry Scalp / कोरडी टाळू' },
                { key: 'Oily scalp', label: 'Oily Scalp / तेलकट टाळू' },
                { key: 'Redness', label: 'Redness / लालसरपणा' },
                { key: 'Burning', label: 'Burning / जळजळ' },
                { key: 'Scaling', label: 'Scaling / खवले' },
                { key: 'Hair thinning', label: 'Hair Thinning / केस विरळ होणे' },
                { key: 'Premature greying', label: 'Premature Greying / अकाली केस पांढरे' }
              ].map(item => {
                const checked = formData.symptom.includes(item.key);
                return (
                  <button
                    type="button"
                    key={item.key}
                    onClick={() => handleCheckboxToggle('symptom', item.key)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-all ${
                      checked
                        ? 'bg-teal-700 text-white border-teal-800 shadow-xs'
                        : 'bg-teal-50/50 text-slate-700 border-teal-200 hover:bg-teal-100/60'
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={checked}
                      onChange={() => {}}
                      className="mr-1.5 pointer-events-none accent-teal-600"
                    />
                    {item.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Hair Fall Pattern */}
          <div className="sm:col-span-2 md:col-span-3">
            <label className="block text-xs font-bold text-slate-700 mb-1.5">
              Hair Fall Pattern / केस गळण्याचा प्रकार
            </label>
            <div className="flex flex-wrap gap-2">
              {[
                { key: 'Diffuse', label: 'Diffuse / सर्वत्र' },
                { key: 'Front', label: 'Front / पुढील भाग' },
                { key: 'Crown', label: 'Crown / डोक्याचा वरचा भाग' },
                { key: 'Temples', label: 'Temples / कपाळाच्या बाजू' },
                { key: 'Patchy', label: 'Patchy / ठिकठिकाणी' },
                { key: 'Post pregnancy', label: 'Post Pregnancy / प्रसूतीनंतर' }
              ].map(item => {
                const checked = formData.pattern.includes(item.key);
                return (
                  <button
                    type="button"
                    key={item.key}
                    onClick={() => handleCheckboxToggle('pattern', item.key)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-all ${
                      checked
                        ? 'bg-cyan-700 text-white border-cyan-800 shadow-xs'
                        : 'bg-cyan-50/50 text-slate-700 border-cyan-200 hover:bg-cyan-100/60'
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={checked}
                      onChange={() => {}}
                      className="mr-1.5 pointer-events-none accent-cyan-600"
                    />
                    {item.label}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* 5. Hair & Scalp History / केस व टाळूचा इतिहास */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-6 space-y-4">
        <h3 className="text-base font-bold text-teal-800 border-b border-teal-100 pb-3 -mx-6 -mt-6 px-6 pt-4 bg-teal-50/40 rounded-t-2xl">
          5. Hair & Scalp History / केस व टाळूचा इतिहास
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 pt-2">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Shampoo / शॅम्पू
            </label>
            <input
              id="shampoo"
              type="text"
              value={formData.shampoo}
              onChange={handleChange}
              placeholder="Brand / type"
              className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs focus:ring-2 focus:ring-teal-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Hair Oil / केसांचे तेल
            </label>
            <input
              id="hairOil"
              type="text"
              value={formData.hairOil}
              onChange={handleChange}
              placeholder="Coconut, almond, onion..."
              className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs focus:ring-2 focus:ring-teal-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Hair Colour / केसांचा रंग
            </label>
            <select
              id="hairColour"
              value={formData.hairColour}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs focus:ring-2 focus:ring-teal-500 focus:outline-none bg-white"
            >
              <option value="No / नाही">No / नाही</option>
              <option value="Yes / होय">Yes / होय</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Straightening / स्ट्रेटनिंग
            </label>
            <select
              id="straightening"
              value={formData.straightening}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs focus:ring-2 focus:ring-teal-500 focus:outline-none bg-white"
            >
              <option value="No / नाही">No / नाही</option>
              <option value="Yes / होय">Yes / होय</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Heat Styling / हीट स्टायलिंग
            </label>
            <select
              id="heat"
              value={formData.heat}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs focus:ring-2 focus:ring-teal-500 focus:outline-none bg-white"
            >
              <option value="No / नाही">No / नाही</option>
              <option value="Occasionally / कधीकधी">Occasionally / कधीकधी</option>
              <option value="Frequently / वारंवार">Frequently / वारंवार</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Helmet Usage / हेल्मेट
            </label>
            <select
              id="helmet"
              value={formData.helmet}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs focus:ring-2 focus:ring-teal-500 focus:outline-none bg-white"
            >
              <option value="No / नाही">No / नाही</option>
              <option value="Occasionally / कधीकधी">Occasionally / कधीकधी</option>
              <option value="Daily / दररोज">Daily / दररोज</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Hair Wash Frequency / केस धुणे
            </label>
            <select
              id="wash"
              value={formData.wash}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs focus:ring-2 focus:ring-teal-500 focus:outline-none bg-white"
            >
              <option value="Daily / दररोज">Daily / दररोज</option>
              <option value="2–3 times/week / आठवड्यात २–३ वेळा">2–3 times/week / आठवड्यात २–३ वेळा</option>
              <option value="Weekly / आठवड्यातून एकदा">Weekly / आठवड्यातून एकदा</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Hard Water / कडक पाणी
            </label>
            <select
              id="water"
              value={formData.water}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs focus:ring-2 focus:ring-teal-500 focus:outline-none bg-white"
            >
              <option value="No / नाही">No / नाही</option>
              <option value="Yes / होय">Yes / होय</option>
              <option value="Not sure / खात्री नाही">Not sure / खात्री नाही</option>
            </select>
          </div>

          <div className="sm:col-span-2 md:col-span-3">
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Previous Hair Treatment / पूर्वीचे केसांचे उपचार
            </label>
            <textarea
              id="previousTreatment"
              rows={2}
              value={formData.previousTreatment}
              onChange={handleChange}
              placeholder="Minoxidil, PRP, biotin, allopathy..."
              className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs focus:ring-2 focus:ring-teal-500 focus:outline-none"
            />
          </div>
        </div>
      </div>

      {/* 6. Menstrual History – Girls/Women / मासिक पाळीचा इतिहास */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-6 space-y-4">
        <h3 className="text-base font-bold text-teal-800 border-b border-teal-100 pb-3 -mx-6 -mt-6 px-6 pt-4 bg-teal-50/40 rounded-t-2xl">
          6. Menstrual History – Girls/Women / मासिक पाळीचा इतिहास
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 pt-2">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Age at Menarche / पहिली पाळी कोणत्या वयात?
            </label>
            <input
              id="menarcheAge"
              type="text"
              value={formData.menarcheAge}
              onChange={handleChange}
              placeholder="e.g. 13 years"
              className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs focus:ring-2 focus:ring-teal-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              LMP / शेवटची पाळी
            </label>
            <input
              id="lmp"
              type="date"
              value={formData.lmp}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs focus:ring-2 focus:ring-teal-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Cycle / पाळीचे चक्र
            </label>
            <select
              id="cycle"
              value={formData.cycle}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs focus:ring-2 focus:ring-teal-500 focus:outline-none bg-white"
            >
              <option value="Regular / नियमित">Regular / नियमित</option>
              <option value="Irregular / अनियमित">Irregular / अनियमित</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Cycle Length / चक्र किती दिवसांचे?
            </label>
            <input
              id="cycleLength"
              type="text"
              value={formData.cycleLength}
              onChange={handleChange}
              placeholder="e.g. 28 days, 35-40 days"
              className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs focus:ring-2 focus:ring-teal-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Bleeding / रक्तस्राव
            </label>
            <select
              id="bleeding"
              value={formData.bleeding}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs focus:ring-2 focus:ring-teal-500 focus:outline-none bg-white"
            >
              <option value="Moderate / मध्यम">Moderate / मध्यम</option>
              <option value="Scanty / कमी">Scanty / कमी</option>
              <option value="Heavy / जास्त">Heavy / जास्त</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Bleeding Duration / रक्तस्रावाचा कालावधी
            </label>
            <input
              id="bleedingDays"
              type="text"
              value={formData.bleedingDays}
              onChange={handleChange}
              placeholder="e.g. 4 days, 6-7 days"
              className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs focus:ring-2 focus:ring-teal-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Period Pain / पाळीच्या वेळी दुखणे
            </label>
            <select
              id="periodPain"
              value={formData.periodPain}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs focus:ring-2 focus:ring-teal-500 focus:outline-none bg-white"
            >
              <option value="No / नाही">No / नाही</option>
              <option value="Mild / सौम्य">Mild / सौम्य</option>
              <option value="Moderate / मध्यम">Moderate / मध्यम</option>
              <option value="Severe / तीव्र">Severe / तीव्र</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Clots / रक्ताच्या गुठळ्या
            </label>
            <select
              id="clots"
              value={formData.clots}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs focus:ring-2 focus:ring-teal-500 focus:outline-none bg-white"
            >
              <option value="No / नाही">No / नाही</option>
              <option value="Yes / होय">Yes / होय</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              PMS / पाळीपूर्व त्रास
            </label>
            <input
              id="pms"
              type="text"
              value={formData.pms}
              onChange={handleChange}
              placeholder="Mood swings, bloating, breast tenderness"
              className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs focus:ring-2 focus:ring-teal-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              PCOS / PCOD History
            </label>
            <select
              id="pcos"
              value={formData.pcos}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs focus:ring-2 focus:ring-teal-500 focus:outline-none bg-white"
            >
              <option value="No / नाही">No / नाही</option>
              <option value="Yes / होय">Yes / होय</option>
              <option value="Under Evaluation / तपासणी सुरू">Under Evaluation / तपासणी सुरू</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Facial Hair / चेहऱ्यावर जास्त केस
            </label>
            <select
              id="facialHair"
              value={formData.facialHair}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs focus:ring-2 focus:ring-teal-500 focus:outline-none bg-white"
            >
              <option value="No / नाही">No / नाही</option>
              <option value="Yes / होय">Yes / होय</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Acne During Periods / पाळीच्या वेळी मुरुम
            </label>
            <select
              id="periodAcne"
              value={formData.periodAcne}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs focus:ring-2 focus:ring-teal-500 focus:outline-none bg-white"
            >
              <option value="No / नाही">No / नाही</option>
              <option value="Yes / होय">Yes / होय</option>
            </select>
          </div>
        </div>
      </div>

      {/* 7. Diet & Nutrition / आहार व पोषण */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-6 space-y-4">
        <h3 className="text-base font-bold text-teal-800 border-b border-teal-100 pb-3 -mx-6 -mt-6 px-6 pt-4 bg-teal-50/40 rounded-t-2xl">
          7. Diet & Nutrition / आहार व पोषण
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 pt-2">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Diet Type / आहार प्रकार
            </label>
            <select
              id="diet"
              value={formData.diet}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs focus:ring-2 focus:ring-teal-500 focus:outline-none bg-white"
            >
              <option value="Vegetarian / शाकाहारी">Vegetarian / शाकाहारी</option>
              <option value="Non-Vegetarian / मांसाहारी">Non-Vegetarian / मांसाहारी</option>
              <option value="Vegan / व्हेगन">Vegan / व्हेगन</option>
              <option value="Mixed / मिश्र">Mixed / मिश्र</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Protein Intake / प्रथिने
            </label>
            <select
              id="protein"
              value={formData.protein}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs focus:ring-2 focus:ring-teal-500 focus:outline-none bg-white"
            >
              <option value="Low / कमी">Low / कमी</option>
              <option value="Moderate / मध्यम">Moderate / मध्यम</option>
              <option value="Good / चांगले">Good / चांगले</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Water Intake / पाणी
            </label>
            <input
              id="waterIntake"
              type="text"
              value={formData.waterIntake}
              onChange={handleChange}
              placeholder="e.g. 2-3 Litres/day"
              className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs focus:ring-2 focus:ring-teal-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Recent Dieting / अलीकडील डाएट
            </label>
            <select
              id="crashDiet"
              value={formData.crashDiet}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs focus:ring-2 focus:ring-teal-500 focus:outline-none bg-white"
            >
              <option value="No / नाही">No / नाही</option>
              <option value="Yes / होय">Yes / होय</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Appetite / भूक
            </label>
            <select
              id="appetite"
              value={formData.appetite}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs focus:ring-2 focus:ring-teal-500 focus:outline-none bg-white"
            >
              <option value="Normal / सामान्य">Normal / सामान्य</option>
              <option value="Low / कमी">Low / कमी</option>
              <option value="Increased / जास्त">Increased / जास्त</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Tea/Coffee / चहा-कॉफी
            </label>
            <input
              id="tea"
              type="text"
              value={formData.tea}
              onChange={handleChange}
              placeholder="Cups per day"
              className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs focus:ring-2 focus:ring-teal-500 focus:outline-none"
            />
          </div>

          <div className="sm:col-span-2 md:col-span-3">
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Diet Details / आहाराची माहिती
            </label>
            <textarea
              id="dietDetails"
              rows={2}
              value={formData.dietDetails}
              onChange={handleChange}
              placeholder="Fast food frequency, snacks, meal timings..."
              className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs focus:ring-2 focus:ring-teal-500 focus:outline-none"
            />
          </div>
        </div>
      </div>

      {/* 8. Lifestyle & General History / जीवनशैली व सामान्य इतिहास */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-6 space-y-4">
        <h3 className="text-base font-bold text-teal-800 border-b border-teal-100 pb-3 -mx-6 -mt-6 px-6 pt-4 bg-teal-50/40 rounded-t-2xl">
          8. Lifestyle & General History / जीवनशैली व सामान्य इतिहास
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 pt-2">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Sleep / झोप
            </label>
            <input
              id="sleep"
              type="text"
              value={formData.sleep}
              onChange={handleChange}
              placeholder="e.g. 6-7 hours, disturbed"
              className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs focus:ring-2 focus:ring-teal-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Stress / ताण
            </label>
            <select
              id="stress"
              value={formData.stress}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs focus:ring-2 focus:ring-teal-500 focus:outline-none bg-white"
            >
              <option value="Low / कमी">Low / कमी</option>
              <option value="Moderate / मध्यम">Moderate / मध्यम</option>
              <option value="High / जास्त">High / जास्त</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Exercise / व्यायाम
            </label>
            <input
              id="exercise"
              type="text"
              value={formData.exercise}
              onChange={handleChange}
              placeholder="Gym, walking, yoga..."
              className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs focus:ring-2 focus:ring-teal-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Screen Time / स्क्रीन टाइम
            </label>
            <input
              id="screenTime"
              type="text"
              value={formData.screenTime}
              onChange={handleChange}
              placeholder="Hours per day (mobile/laptop)"
              className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs focus:ring-2 focus:ring-teal-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Recent Illness / अलीकडील आजार
            </label>
            <input
              id="recentIllness"
              type="text"
              value={formData.recentIllness}
              onChange={handleChange}
              placeholder="Typhoid, Dengue, COVID, Surgery..."
              className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs focus:ring-2 focus:ring-teal-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Major Stress/Event / मोठा ताण
            </label>
            <input
              id="majorStress"
              type="text"
              value={formData.majorStress}
              onChange={handleChange}
              placeholder="Exams, grief, job change..."
              className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs focus:ring-2 focus:ring-teal-500 focus:outline-none"
            />
          </div>
        </div>
      </div>

      {/* 9. Investigations / तपासण्या */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-6 space-y-4">
        <h3 className="text-base font-bold text-teal-800 border-b border-teal-100 pb-3 -mx-6 -mt-6 px-6 pt-4 bg-teal-50/40 rounded-t-2xl">
          9. Investigations / तपासण्या
        </h3>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3 pt-2">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">CBC / Hb</label>
            <input
              id="cbc"
              type="text"
              value={formData.cbc}
              onChange={handleChange}
              placeholder="e.g. 11.2 g/dL"
              className="w-full px-2.5 py-1.5 border border-slate-300 rounded-lg text-xs focus:ring-2 focus:ring-teal-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Serum Ferritin</label>
            <input
              id="ferritin"
              type="text"
              value={formData.ferritin}
              onChange={handleChange}
              placeholder="ng/mL"
              className="w-full px-2.5 py-1.5 border border-slate-300 rounded-lg text-xs focus:ring-2 focus:ring-teal-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Iron Studies</label>
            <input
              id="iron"
              type="text"
              value={formData.iron}
              onChange={handleChange}
              placeholder="TIBC / Serum Iron"
              className="w-full px-2.5 py-1.5 border border-slate-300 rounded-lg text-xs focus:ring-2 focus:ring-teal-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Vitamin D3</label>
            <input
              id="vitD"
              type="text"
              value={formData.vitD}
              onChange={handleChange}
              placeholder="ng/mL"
              className="w-full px-2.5 py-1.5 border border-slate-300 rounded-lg text-xs focus:ring-2 focus:ring-teal-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Vitamin B12</label>
            <input
              id="b12"
              type="text"
              value={formData.b12}
              onChange={handleChange}
              placeholder="pg/mL"
              className="w-full px-2.5 py-1.5 border border-slate-300 rounded-lg text-xs focus:ring-2 focus:ring-teal-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">TSH / Thyroid</label>
            <input
              id="tsh"
              type="text"
              value={formData.tsh}
              onChange={handleChange}
              placeholder="uIU/mL"
              className="w-full px-2.5 py-1.5 border border-slate-300 rounded-lg text-xs focus:ring-2 focus:ring-teal-500 focus:outline-none"
            />
          </div>

          <div className="col-span-2 sm:col-span-3 md:col-span-6 mt-1">
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Other Reports / इतर तपासण्या
            </label>
            <textarea
              id="otherReports"
              rows={2}
              value={formData.otherReports}
              onChange={handleChange}
              placeholder="USG Pelvis, Liver profile, lipid profile..."
              className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs focus:ring-2 focus:ring-teal-500 focus:outline-none"
            />
          </div>
        </div>
      </div>

      {/* 10. Hair & Scalp Clinical Photographs / केस व टाळूचे फोटो */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-6 space-y-4">
        <h3 className="text-base font-bold text-teal-800 border-b border-teal-100 pb-3 -mx-6 -mt-6 px-6 pt-4 bg-teal-50/40 rounded-t-2xl flex items-center justify-between">
          <span>10. Hair & Scalp Clinical Photographs / केस व टाळूचे फोटो</span>
          <Camera className="w-4 h-4 text-teal-700" />
        </h3>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3 pt-2">
          {[
            { num: 1, key: 'photo1' as const, title: '1. Front Hairline', marathi: 'पुढील केसांची रेषा' },
            { num: 2, key: 'photo2' as const, title: '2. Crown / Top', marathi: 'डोक्याचा वरचा भाग' },
            { num: 3, key: 'photo3' as const, title: '3. Left Side', marathi: 'डावी बाजू' },
            { num: 4, key: 'photo4' as const, title: '4. Right Side', marathi: 'उजवी बाजू' },
            { num: 5, key: 'photo5' as const, title: '5. Scalp Close-up', marathi: 'टाळूचा जवळचा फोटो' }
          ].map(p => {
            const photoVal = formData[p.key];
            return (
              <div key={p.key} className="border-2 border-dashed border-teal-200 rounded-xl p-3 bg-teal-50/20 text-center space-y-2">
                <strong className="block text-[11px] text-slate-800 leading-tight">
                  {p.title}
                  <span className="block text-[9px] text-slate-500 font-normal mt-0.5">{p.marathi}</span>
                </strong>

                {photoVal ? (
                  <div className="space-y-1.5">
                    <img
                      src={photoVal}
                      alt={p.title}
                      className="w-full h-28 object-cover rounded-lg border border-slate-200"
                    />
                    <button
                      type="button"
                      onClick={() => removePhoto(p.key)}
                      className="text-[10px] text-rose-600 hover:text-rose-800 font-bold"
                    >
                      Remove
                    </button>
                  </div>
                ) : (
                  <label className="cursor-pointer block py-4 border border-teal-200 rounded-lg bg-white hover:bg-teal-50/50 transition-colors">
                    <Camera className="w-5 h-5 text-teal-600 mx-auto mb-1" />
                    <span className="text-[10px] font-semibold text-teal-800 block">Upload</span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => handlePhotoUpload(e, p.key)}
                      className="hidden"
                    />
                  </label>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* 11. Any Other Problems / इतर काही समस्या */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-6 space-y-4">
        <h3 className="text-base font-bold text-teal-800 border-b border-teal-100 pb-3 -mx-6 -mt-6 px-6 pt-4 bg-teal-50/40 rounded-t-2xl">
          11. Any Other Problems / इतर काही समस्या
        </h3>

        <div>
          <label className="block text-xs font-bold text-slate-700 mb-1">
            Other Complaints, Symptoms or Relevant History / इतर काही तक्रार, लक्षणे किंवा संबंधित माहिती
          </label>
          <textarea
            id="otherProblems"
            rows={4}
            value={formData.otherProblems}
            onChange={handleChange}
            placeholder="Write here / येथे लिहा..."
            className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs focus:ring-2 focus:ring-teal-500 focus:outline-none"
          />
        </div>
      </div>

      {/* 12. Clinical Assessment / क्लिनिकल मूल्यांकन */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-6 space-y-4">
        <h3 className="text-base font-bold text-teal-800 border-b border-teal-100 pb-3 -mx-6 -mt-6 px-6 pt-4 bg-teal-50/40 rounded-t-2xl">
          12. Clinical Assessment / क्लिनिकल मूल्यांकन
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Dandruff Severity / कोंड्याची तीव्रता
            </label>
            <select
              id="dandruffSeverity"
              value={formData.dandruffSeverity}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs focus:ring-2 focus:ring-teal-500 focus:outline-none bg-white"
            >
              <option value="Mild / सौम्य">Mild / सौम्य</option>
              <option value="Moderate / मध्यम">Moderate / मध्यम</option>
              <option value="Severe / तीव्र">Severe / तीव्र</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Hair Fall Severity / केस गळण्याची तीव्रता
            </label>
            <select
              id="hairSeverity"
              value={formData.hairSeverity}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs focus:ring-2 focus:ring-teal-500 focus:outline-none bg-white"
            >
              <option value="Mild / सौम्य">Mild / सौम्य</option>
              <option value="Moderate / मध्यम">Moderate / मध्यम</option>
              <option value="Severe / तीव्र">Severe / तीव्र</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Hair Density / केसांची घनता
            </label>
            <select
              id="density"
              value={formData.density}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs focus:ring-2 focus:ring-teal-500 focus:outline-none bg-white"
            >
              <option value="Normal / सामान्य">Normal / सामान्य</option>
              <option value="Reduced / कमी">Reduced / कमी</option>
              <option value="Markedly Reduced / खूप कमी">Markedly Reduced / खूप कमी</option>
            </select>
          </div>

          <div className="sm:col-span-3">
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Clinical Findings / क्लिनिकल निरीक्षण
            </label>
            <textarea
              id="clinicalFindings"
              rows={3}
              value={formData.clinicalFindings}
              onChange={handleChange}
              placeholder="Pull test, trichoscopy notes, scalp erythema, acne grading..."
              className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs focus:ring-2 focus:ring-teal-500 focus:outline-none"
            />
          </div>

          <div className="sm:col-span-3">
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Assessment / मूल्यांकन (Provisional Diagnosis)
            </label>
            <textarea
              id="assessment"
              rows={3}
              value={formData.assessment}
              onChange={handleChange}
              placeholder="e.g. Telogen Effluvium with Seborrheic Dermatitis & Grade II Acne Vulgaris..."
              className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs focus:ring-2 focus:ring-teal-500 focus:outline-none"
            />
          </div>
        </div>
      </div>

      {/* 13. Treatment & Follow-up / उपचार व फॉलोअप */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-6 space-y-4">
        <h3 className="text-base font-bold text-teal-800 border-b border-teal-100 pb-3 -mx-6 -mt-6 px-6 pt-4 bg-teal-50/40 rounded-t-2xl">
          13. Treatment & Follow-up / उपचार व फॉलोअप
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
          <div className="sm:col-span-2">
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Homeopathic Treatment / उपचार
            </label>
            <textarea
              id="treatment"
              rows={3}
              value={formData.treatment}
              onChange={handleChange}
              placeholder="Simillimum remedy, potency, dosage, dispensing instructions..."
              className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs focus:ring-2 focus:ring-teal-500 focus:outline-none"
            />
          </div>

          <div className="sm:col-span-2">
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Diet & Lifestyle Advice / आहार व जीवनशैली सल्ला
            </label>
            <textarea
              id="advice"
              rows={3}
              value={formData.advice}
              onChange={handleChange}
              placeholder="Hydration, high protein, hair care regimen, stress management..."
              className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs focus:ring-2 focus:ring-teal-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Follow-up Date / पुढील भेट
            </label>
            <input
              id="followup"
              type="date"
              value={formData.followup}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs focus:ring-2 focus:ring-teal-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Follow-up Notes / फॉलोअप नोंद
            </label>
            <textarea
              id="followupNotes"
              rows={2}
              value={formData.followupNotes}
              onChange={handleChange}
              placeholder="Instructions for next visit..."
              className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs focus:ring-2 focus:ring-teal-500 focus:outline-none"
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
              : 'bg-teal-50 text-teal-800 border-teal-300'
          }`}
        >
          {statusMessage}
        </div>
      )}

      {/* Footer Branding */}
      <footer className="text-center py-4 bg-emerald-900 text-white rounded-2xl text-xs space-y-1">
        <div>
          <strong>Dr. Bharat's Aroga Homeopathy</strong> &nbsp;|&nbsp; Opp. Central Jail, Hindalga, Belgaum &nbsp;|&nbsp; 9902686173
        </div>
        <div className="text-[10px] text-emerald-300 opacity-80">
          Design by <strong>Ananya Infotech</strong>
        </div>
      </footer>

      {/* Sticky Bottom Action Bar */}
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
