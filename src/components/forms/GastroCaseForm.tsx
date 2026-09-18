import React, { useState, useEffect } from 'react';
import { useClinic } from '../../context/ClinicContext';
import {
  Utensils,
  Save,
  CheckCircle2,
  RotateCcw,
  Printer,
  FileText,
  AlertTriangle,
  Flame
} from 'lucide-react';

export interface GastroFormData {
  patientName: string;
  age: string;
  sex: string;
  date: string;
  patientId: string;
  mobile: string;
  address: string;

  // 2. Main GI Complaint
  mainComplaint: string[];
  complaintDuration: string;
  complaintFrequency: string;
  complaintSeverity: string;

  // 3. Abdominal Pain
  painSite: string[];
  painCharacter: string[];
  painOnset: string;
  painDuration: string;
  painFrequency: string;
  worseFrom: string[];
  betterFrom: string[];

  // 4. Acidity & Reflux
  aciditySymptoms: string[];
  triggerFood: string;
  timeOfSymptoms: string;
  acidityRelief: string;

  // 5. Nausea & Vomiting
  nausea: string;
  vomiting: string;
  vomitFrequency: string;
  vomitus: string[];
  vomitSymptoms: string;

  // 6. Appetite & Food Relation
  appetite: string;
  hungerTime: string;
  mealPattern: string;
  foodTriggers: string[];
  foodDetails: string;

  // 7. Bowel Habits
  bowelFrequency: string;
  bowelRegularity: string;
  bowelUrgency: string;
  stoolConsistency: string[];
  constipationFeatures: string[];

  // 8. Gas, Bloating & Belching
  gasSymptoms: string[];
  reliefAfterGas: string;
  foodCausingGas: string;
  gasDuration: string;

  // 9. Swallowing & Reflux
  swallowingSymptoms: string[];

  // 10. Associated GI Symptoms
  associatedSymptoms: string[];

  // 11. Previous GI History
  previousHistory: string[];
  previousTreatment: string;

  // 12. GI Investigations
  investigations: string[];
  investigationFindings: string;

  // 13. Red Flags
  redFlags: string[];

  // 14. Clinical Assessment
  diagnosis: string;
  assessmentDuration: string;
  clinicalSeverity: string;
  clinicalNotes: string;
  treatment: string;
  advice: string;
  followup: string;
  savedAt?: string;
}

const INITIAL_GASTRO_DATA: GastroFormData = {
  patientName: '',
  age: '',
  sex: '',
  date: new Date().toISOString().split('T')[0],
  patientId: '',
  mobile: '',
  address: '',

  mainComplaint: ['Acidity', 'Heartburn', 'Bloating', 'Indigestion'],
  complaintDuration: '4 months',
  complaintFrequency: 'Daily after meals',
  complaintSeverity: 'Moderate / मध्यम',

  painSite: ['Epigastric / वरील मध्यभाग', 'Umbilical / नाभीजवळ'],
  painCharacter: ['Burning / जळजळ', 'Pressure / दाबल्यासारखे'],
  painOnset: 'Gradual / हळूहळू',
  painDuration: '1-2 hours post meals',
  painFrequency: 'Almost daily',
  worseFrom: ['After Food', 'Spicy Food', 'Oily Food', 'Tea/Coffee', 'Lying Down'],
  betterFrom: ['Passing Gas', 'Drinking warm water', 'Rest'],

  aciditySymptoms: ['Burning in Chest', 'Sour Belching', 'Acid Taste', 'After Meals', 'Night Symptoms'],
  triggerFood: 'Spicy snacks, fermented foods, tea on empty stomach',
  timeOfSymptoms: 'Late evening and 30 mins after dinner',
  acidityRelief: 'Cold milk or warm sip of water',

  nausea: 'Occasional / अधूनमधून',
  vomiting: 'No',
  vomitFrequency: '',
  vomitus: [],
  vomitSymptoms: '',

  appetite: 'Variable / बदलती',
  hungerTime: 'Irregular',
  mealPattern: 'Irregular (late lunches)',
  foodTriggers: ['Spicy / तिखट', 'Oily / तेलकट', 'Tea/Coffee / चहा-कॉफी', 'Sour / आंबट'],
  foodDetails: 'Cannot tolerate heavy oily foods; triggers distress within an hour',

  bowelFrequency: '1 time daily, occasionally constipated',
  bowelRegularity: 'Irregular',
  bowelUrgency: 'No',
  stoolConsistency: ['Hard / कडक'],
  constipationFeatures: ['Incomplete Stool / अपूर्ण शौच', 'Straining / जोर'],

  gasSymptoms: ['Gas', 'Bloating', 'Belching', 'Abdominal Fullness', 'Gas after Food'],
  reliefAfterGas: 'Yes',
  foodCausingGas: 'Pulses, potatoes, cabbage',
  gasDuration: '2-3 hours after heavy meals',

  swallowingSymptoms: ['Reflux', 'Sour Fluid'],
  associatedSymptoms: ['Fatigue / थकवा'],

  previousHistory: ['Gastritis', 'GERD'],
  previousTreatment: 'Proton-pump inhibitors (pantoprazole) taken intermittently',

  investigations: ['CBC', 'USG Abdomen', 'LFT'],
  investigationFindings: 'USG Abdomen: Mild fatty liver Grade I. Normal gall bladder and pancreas.',

  redFlags: [],

  diagnosis: 'Gastroesophageal Reflux Disease (GERD) & Functional Non-Ulcer Dyspepsia',
  assessmentDuration: '4 months',
  clinicalSeverity: 'Moderate',
  clinicalNotes: 'Nux Vomica totality: sedentary IT lifestyle, irregular late meals, rich food aggravation, ineffectual urging for stool.',
  treatment: 'Nux Vomica 200C at bedtime for 7 days, followed by Carbo Veg 30C for post-meal bloating',
  advice: 'Do not lie down for 2 hours post meals, reduce tea to 1 cup/day, brisk walking after dinner',
  followup: ''
};

export const GastroCaseForm: React.FC = () => {
  const {
    selectedPatient,
    patients,
    selectPatient,
    saveSystemForm,
    systemForms,
    setActiveTab
  } = useClinic();

  const [formData, setFormData] = useState<GastroFormData>(INITIAL_GASTRO_DATA);
  const [statusMessage, setStatusMessage] = useState<string>('');
  const [statusType, setStatusType] = useState<'success' | 'error' | 'info'>('info');

  useEffect(() => {
    if (selectedPatient) {
      const existing = systemForms.find(
        f => f.patientId === selectedPatient.id && f.system === 'gastrointestinal'
      );

      if (existing && existing.data) {
        setFormData({
          ...INITIAL_GASTRO_DATA,
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
        const stored = localStorage.getItem(`GI_CASE_${selectedPatient.id}`);
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

  const handleCheckboxToggle = (category: keyof GastroFormData, value: string) => {
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
      localStorage.setItem(`GI_CASE_${selectedPatient.id}`, JSON.stringify(updatedData));
    }
    localStorage.setItem('GI_CASE_' + formData.patientName, JSON.stringify(updatedData));

    const chiefComplaintsText = [
      formData.mainComplaint?.length ? `Complaints: ${formData.mainComplaint.join(', ')}` : '',
      formData.aciditySymptoms?.length ? `Acidity: ${formData.aciditySymptoms.join(', ')}` : '',
      formData.complaintDuration ? `Duration: ${formData.complaintDuration}` : '',
      formData.bowelFrequency ? `Bowel: ${formData.bowelFrequency}` : ''
    ].filter(Boolean).join(' • ');

    const modalitiesAgg = formData.worseFrom?.join(', ') || 'After food, spicy food, lying down';
    const modalitiesAmel = formData.betterFrom?.join(', ') || 'Passing gas, warm water, rest';

    if (selectedPatient) {
      saveSystemForm({
        patientId: selectedPatient.id,
        system: 'gastrointestinal',
        chiefComplaints: chiefComplaintsText || 'Gastro-Intestinal System Assessment',
        duration: formData.complaintDuration || 'Recorded Case',
        severity: formData.complaintSeverity?.includes('Severe') || formData.clinicalSeverity === 'Severe' ? 'Severe' : formData.complaintSeverity?.includes('Mild') ? 'Mild' : 'Moderate',
        modalitiesAggravation: modalitiesAgg,
        modalitiesAmelioration: modalitiesAmel,
        concomitants: formData.foodTriggers?.join(', ') || formData.triggerFood || '',
        clinicalNotes: formData.clinicalNotes || formData.diagnosis || '',
        data: updatedData,
        submittedVia: 'Doctor_Dashboard'
      });
    }

    setStatusMessage('✓ Gastro-Intestinal Case Saved Successfully / केस यशस्वीरित्या सेव्ह झाली. Synced to Case Summary.');
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
      setFormData(INITIAL_GASTRO_DATA);
      setStatusMessage('Form cleared.');
      setStatusType('info');
      setTimeout(() => setStatusMessage(''), 3000);
    }
  };

  return (
    <div className="space-y-6 pb-28 max-w-6xl mx-auto">
      {/* Patient Selector Ribbon */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-700">
            <Utensils className="w-5 h-5" />
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
              Gastro-Intestinal System Case Taking (गॅस्ट्रो-इंटेस्टाइनल सिस्टम केस टेकिंग)
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

      {/* Main Form Banner */}
      <header className="bg-gradient-to-r from-emerald-800 to-teal-600 text-white rounded-2xl p-6 shadow-md text-center">
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">
          Dr. Bharat's Arogya Homeopathy
        </h1>
        <h2 className="text-lg sm:text-xl font-semibold mt-1">
          Gastro-Intestinal System Case Taking
        </h2>
        <div className="text-sm sm:text-base font-medium opacity-90 mt-0.5">
          गॅस्ट्रो-इंटेस्टाइनल सिस्टम केस टेकिंग
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
              placeholder="Mobile Number"
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

      {/* 2. Main GI Complaint */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-6 space-y-4">
        <h3 className="text-base font-bold text-emerald-800 border-b border-emerald-100 pb-3 -mx-6 -mt-6 px-6 pt-4 bg-emerald-50/40 rounded-t-2xl">
          2. Main Gastro-Intestinal Complaint / मुख्य पचनसंस्थेची तक्रार
        </h3>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-2">
          {[
            { key: 'Acidity', label: 'Acidity / आम्लपित्त' },
            { key: 'Heartburn', label: 'Heartburn / छातीत जळजळ' },
            { key: 'Gas', label: 'Gas / गॅस' },
            { key: 'Bloating', label: 'Bloating / पोट फुगणे' },
            { key: 'Abdominal Pain', label: 'Pain / पोटदुखी' },
            { key: 'Indigestion', label: 'Indigestion / अपचन' },
            { key: 'Nausea', label: 'Nausea / मळमळ' },
            { key: 'Vomiting', label: 'Vomiting / उलटी' },
            { key: 'Constipation', label: 'Constipation / बद्धकोष्ठता' },
            { key: 'Diarrhoea', label: 'Diarrhoea / जुलाब' },
            { key: 'Belching', label: 'Belching / ढेकर' },
            { key: 'Loss of Appetite', label: 'Appetite / भूक मंद' },
            { key: 'Reflux', label: 'Reflux / रिफ्लक्स' },
            { key: 'Dysphagia', label: 'Dysphagia / गिळताना त्रास' },
            { key: 'Blood in Stool', label: 'Blood in Stool / रक्त' },
            { key: 'Other GI Problem', label: 'Other / इतर' }
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
              placeholder="e.g. 4 months"
              className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Frequency / वारंवारिता</label>
            <input
              id="complaintFrequency"
              type="text"
              value={formData.complaintFrequency}
              onChange={handleChange}
              placeholder="e.g. Daily after meals"
              className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Severity / तीव्रता</label>
            <select
              id="complaintSeverity"
              value={formData.complaintSeverity}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-none bg-white"
            >
              <option value="Mild / सौम्य">Mild / सौम्य</option>
              <option value="Moderate / मध्यम">Moderate / मध्यम</option>
              <option value="Severe / तीव्र">Severe / तीव्र</option>
            </select>
          </div>
        </div>
      </div>

      {/* 3. Abdominal Pain */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-6 space-y-4">
        <h3 className="text-base font-bold text-emerald-800 border-b border-emerald-100 pb-3 -mx-6 -mt-6 px-6 pt-4 bg-emerald-50/40 rounded-t-2xl">
          3. Abdominal Pain / पोटदुखी
        </h3>

        {/* Site */}
        <div className="space-y-1.5">
          <div className="font-bold text-xs text-emerald-950">Site / दुखण्याचे ठिकाण</div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {[
              'Epigastric / वरील मध्यभाग', 'Right Upper / उजवा वरचा',
              'Left Upper / डावा वरचा', 'Umbilical / नाभीजवळ',
              'Right Lower / उजवा खालचा', 'Left Lower / डावा खालचा',
              'Lower Abdomen / खालचा भाग', 'Generalized / संपूर्ण पोट'
            ].map(item => {
              const key = item.split(' / ')[0];
              return (
                <label key={item} className="flex items-center gap-1.5 p-1.5 border rounded-lg text-xs cursor-pointer bg-slate-50">
                  <input
                    type="checkbox"
                    checked={formData.painSite.includes(key)}
                    onChange={() => handleCheckboxToggle('painSite', key)}
                    className="accent-emerald-600"
                  />
                  <span>{item}</span>
                </label>
              );
            })}
          </div>
        </div>

        {/* Character */}
        <div className="space-y-1.5 pt-2">
          <div className="font-bold text-xs text-emerald-950">Character / दुखण्याचे स्वरूप</div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {[
              'Burning / जळजळ', 'Cramping / मुरडा', 'Colicky / कळा', 'Sharp / तीक्ष्ण',
              'Stitching / टोचणे', 'Dull / बोथट', 'Cutting / कापल्यासारखे', 'Pressure / दाब'
            ].map(item => {
              const key = item.split(' / ')[0];
              return (
                <label key={item} className="flex items-center gap-1.5 p-1.5 border rounded-lg text-xs cursor-pointer bg-slate-50">
                  <input
                    type="checkbox"
                    checked={formData.painCharacter.includes(key)}
                    onChange={() => handleCheckboxToggle('painCharacter', key)}
                    className="accent-emerald-600"
                  />
                  <span>{item}</span>
                </label>
              );
            })}
          </div>
        </div>

        {/* Modalities */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
          <div className="p-3 bg-rose-50/50 rounded-xl border border-rose-100 space-y-1.5">
            <div className="font-bold text-xs text-rose-900">Worse From (&lt;) / कशाने वाढते?</div>
            <div className="grid grid-cols-2 gap-1">
              {[
                'Before Food', 'After Food', 'Empty Stomach', 'Spicy Food',
                'Oily Food', 'Milk', 'Stress', 'Lying Down'
              ].map(k => (
                <label key={k} className="flex items-center gap-1.5 text-xs text-rose-950 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.worseFrom.includes(k)}
                    onChange={() => handleCheckboxToggle('worseFrom', k)}
                    className="accent-rose-600"
                  />
                  <span>{k}</span>
                </label>
              ))}
            </div>
          </div>

          <div className="p-3 bg-teal-50/50 rounded-xl border border-teal-100 space-y-1.5">
            <div className="font-bold text-xs text-teal-900">Better From (&gt;) / कशाने आराम?</div>
            <div className="grid grid-cols-2 gap-1">
              {[
                'Eating', 'Passing Stool', 'Passing Gas', 'Vomiting',
                'Pressure', 'Rest', 'Warmth', 'Other'
              ].map(k => (
                <label key={k} className="flex items-center gap-1.5 text-xs text-teal-950 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.betterFrom.includes(k)}
                    onChange={() => handleCheckboxToggle('betterFrom', k)}
                    className="accent-teal-600"
                  />
                  <span>{k}</span>
                </label>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* 4 & 5. Acidity & Nausea */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* 4. Acidity & Reflux */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-6 space-y-3">
          <h3 className="text-sm font-bold text-emerald-800 border-b border-emerald-100 pb-2">
            4. Acidity & Reflux / आम्लपित्त व रिफ्लक्स
          </h3>
          <div className="grid grid-cols-2 gap-1.5">
            {[
              'Burning in Chest / छातीत जळजळ', 'Sour Belching / आंबट ढेकर',
              'Acid Taste / आंबट चव', 'Regurgitation / अन्न वर येणे',
              'Water Brash / पाणी सुटणे', 'Night Symptoms / रात्री त्रास',
              'After Meals / जेवणानंतर', 'Lying Down / झोपल्यावर'
            ].map(item => {
              const key = item.split(' / ')[0];
              return (
                <label key={item} className="flex items-center gap-1.5 text-xs text-slate-700 cursor-pointer p-1">
                  <input
                    type="checkbox"
                    checked={formData.aciditySymptoms.includes(key)}
                    onChange={() => handleCheckboxToggle('aciditySymptoms', key)}
                    className="accent-emerald-600"
                  />
                  <span>{item}</span>
                </label>
              );
            })}
          </div>
          <div className="grid grid-cols-2 gap-2 pt-1">
            <input
              id="triggerFood"
              type="text"
              value={formData.triggerFood}
              onChange={handleChange}
              placeholder="Trigger Food (e.g. spicy)"
              className="px-2 py-1.5 border border-slate-300 rounded text-xs"
            />
            <input
              id="timeOfSymptoms"
              type="text"
              value={formData.timeOfSymptoms}
              onChange={handleChange}
              placeholder="Time of day"
              className="px-2 py-1.5 border border-slate-300 rounded text-xs"
            />
          </div>
        </div>

        {/* 5. Nausea & Vomiting */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-6 space-y-3">
          <h3 className="text-sm font-bold text-emerald-800 border-b border-emerald-100 pb-2">
            5. Nausea & Vomiting / मळमळ व उलटी
          </h3>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[11px] font-bold text-slate-700 mb-1">Nausea / मळमळ</label>
              <select
                id="nausea"
                value={formData.nausea}
                onChange={handleChange}
                className="w-full px-2 py-1.5 border border-slate-300 rounded text-xs bg-white"
              >
                <option value="None">None</option>
                <option value="Occasional / अधूनमधून">Occasional / अधूनमधून</option>
                <option value="Frequent / वारंवार">Frequent / वारंवार</option>
                <option value="Persistent / सतत">Persistent / सतत</option>
              </select>
            </div>
            <div>
              <label className="block text-[11px] font-bold text-slate-700 mb-1">Vomiting / उलटी</label>
              <select
                id="vomiting"
                value={formData.vomiting}
                onChange={handleChange}
                className="w-full px-2 py-1.5 border border-slate-300 rounded text-xs bg-white"
              >
                <option value="No">No</option>
                <option value="Yes">Yes</option>
              </select>
            </div>
          </div>
          <div>
            <div className="text-[11px] font-bold text-slate-600 mb-1">Vomitus Character (if any):</div>
            <div className="grid grid-cols-3 gap-1">
              {['Food Particles', 'Sour', 'Bile', 'Mucus', 'Blood'].map(v => (
                <label key={v} className="flex items-center gap-1 text-xs text-slate-700">
                  <input
                    type="checkbox"
                    checked={formData.vomitus.includes(v)}
                    onChange={() => handleCheckboxToggle('vomitus', v)}
                    className="accent-emerald-600"
                  />
                  <span>{v}</span>
                </label>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* 6 & 7. Appetite & Bowel Habits */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-6 space-y-3">
          <h3 className="text-sm font-bold text-emerald-800 border-b border-emerald-100 pb-2">
            6. Appetite & Food Relation / भूक व अन्नाशी संबंध
          </h3>
          <div className="grid grid-cols-3 gap-2">
            <div>
              <label className="block text-[11px] font-bold text-slate-700 mb-0.5">Appetite</label>
              <select
                id="appetite"
                value={formData.appetite}
                onChange={handleChange}
                className="w-full px-2 py-1 border border-slate-300 rounded text-xs bg-white"
              >
                <option value="Normal / सामान्य">Normal</option>
                <option value="Increased / वाढलेली">Increased</option>
                <option value="Decreased / कमी">Decreased</option>
                <option value="Variable / बदलती">Variable</option>
              </select>
            </div>
            <div>
              <label className="block text-[11px] font-bold text-slate-700 mb-0.5">Meal Pattern</label>
              <select
                id="mealPattern"
                value={formData.mealPattern}
                onChange={handleChange}
                className="w-full px-2 py-1 border border-slate-300 rounded text-xs bg-white"
              >
                <option value="Regular">Regular</option>
                <option value="Irregular">Irregular</option>
                <option value="Frequent">Frequent</option>
                <option value="Long gaps">Long gaps</option>
              </select>
            </div>
            <div>
              <label className="block text-[11px] font-bold text-slate-700 mb-0.5">Hunger Time</label>
              <input
                id="hungerTime"
                type="text"
                value={formData.hungerTime}
                onChange={handleChange}
                placeholder="e.g. 1 PM"
                className="w-full px-2 py-1 border border-slate-300 rounded text-xs"
              />
            </div>
          </div>
          <div>
            <div className="text-[11px] font-bold text-slate-600 mb-1">Food Triggers / अपायकारक पदार्थ:</div>
            <div className="grid grid-cols-4 gap-1">
              {['Spicy / तिखट', 'Sour / आंबट', 'Oily / तेलकट', 'Milk / दूध', 'Tea/Coffee', 'Wheat', 'Rice'].map(t => {
                const key = t.split(' / ')[0];
                return (
                  <label key={t} className="flex items-center gap-1 text-xs text-slate-700">
                    <input
                      type="checkbox"
                      checked={formData.foodTriggers.includes(key)}
                      onChange={() => handleCheckboxToggle('foodTriggers', key)}
                      className="accent-emerald-600"
                    />
                    <span className="truncate">{key}</span>
                  </label>
                );
              })}
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-6 space-y-3">
          <h3 className="text-sm font-bold text-emerald-800 border-b border-emerald-100 pb-2">
            7. Bowel Habits / शौचाच्या सवयी
          </h3>
          <div className="grid grid-cols-2 gap-2">
            <input
              id="bowelFrequency"
              type="text"
              value={formData.bowelFrequency}
              onChange={handleChange}
              placeholder="Frequency (e.g. 1-2 times/day)"
              className="px-2 py-1.5 border border-slate-300 rounded text-xs"
            />
            <select
              id="bowelRegularity"
              value={formData.bowelRegularity}
              onChange={handleChange}
              className="px-2 py-1.5 border border-slate-300 rounded text-xs bg-white"
            >
              <option value="Regular">Regular / नियमित</option>
              <option value="Irregular">Irregular / अनियमित</option>
            </select>
          </div>
          <div>
            <div className="text-[11px] font-bold text-slate-600 mb-1">Stool Consistency:</div>
            <div className="grid grid-cols-4 gap-1">
              {['Hard', 'Soft', 'Loose', 'Watery', 'Sticky', 'Mucus', 'Blood', 'Undigested'].map(s => (
                <label key={s} className="flex items-center gap-1 text-xs text-slate-700">
                  <input
                    type="checkbox"
                    checked={formData.stoolConsistency.includes(s)}
                    onChange={() => handleCheckboxToggle('stoolConsistency', s)}
                    className="accent-emerald-600"
                  />
                  <span>{s}</span>
                </label>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* 8, 9 & 10. Gas, Swallowing & Associated Symptoms */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* 8. Gas & Bloating */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-5 space-y-2.5">
          <h4 className="font-bold text-xs text-emerald-900 border-b border-slate-100 pb-1.5">
            8. Gas, Bloating & Belching / गॅस
          </h4>
          <div className="grid grid-cols-2 gap-1">
            {[
              'Gas', 'Bloating', 'Belching', 'Flatulence',
              'Abdominal Fullness', 'Gas after Food', 'Gas in Morning', 'Gas at Night'
            ].map(g => (
              <label key={g} className="flex items-center gap-1 text-xs text-slate-700">
                <input
                  type="checkbox"
                  checked={formData.gasSymptoms.includes(g)}
                  onChange={() => handleCheckboxToggle('gasSymptoms', g)}
                  className="accent-emerald-600"
                />
                <span className="truncate">{g}</span>
              </label>
            ))}
          </div>
          <div className="pt-1">
            <select
              id="reliefAfterGas"
              value={formData.reliefAfterGas}
              onChange={handleChange}
              className="w-full px-2 py-1 border border-slate-300 rounded text-xs bg-white"
            >
              <option value="Yes">Relief after passing gas: Yes</option>
              <option value="No">Relief after passing gas: No</option>
            </select>
          </div>
        </div>

        {/* 9. Swallowing */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-5 space-y-2.5">
          <h4 className="font-bold text-xs text-emerald-900 border-b border-slate-100 pb-1.5">
            9. Swallowing & Reflux / गिळणे
          </h4>
          <div className="grid grid-cols-1 gap-1">
            {[
              'Difficulty Swallowing', 'Painful Swallowing',
              'Food Sticking', 'Reflux', 'Sour Fluid', 'Night Reflux'
            ].map(sw => (
              <label key={sw} className="flex items-center gap-1.5 text-xs text-slate-700">
                <input
                  type="checkbox"
                  checked={formData.swallowingSymptoms.includes(sw)}
                  onChange={() => handleCheckboxToggle('swallowingSymptoms', sw)}
                  className="accent-emerald-600"
                />
                <span>{sw}</span>
              </label>
            ))}
          </div>
        </div>

        {/* 10. Associated GI */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-5 space-y-2.5">
          <h4 className="font-bold text-xs text-emerald-900 border-b border-slate-100 pb-1.5">
            10. Associated GI Symptoms / संबंधित
          </h4>
          <div className="grid grid-cols-2 gap-1">
            {[
              'Fever', 'Weakness', 'Weight Loss', 'Weight Gain',
              'Jaundice', 'Distension', 'Fatigue'
            ].map(a => (
              <label key={a} className="flex items-center gap-1 text-xs text-slate-700">
                <input
                  type="checkbox"
                  checked={formData.associatedSymptoms.includes(a)}
                  onChange={() => handleCheckboxToggle('associatedSymptoms', a)}
                  className="accent-emerald-600"
                />
                <span>{a}</span>
              </label>
            ))}
          </div>
        </div>
      </div>

      {/* 11 & 12. Previous History & Investigations */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-6 space-y-3">
          <h3 className="text-sm font-bold text-emerald-800 border-b border-emerald-100 pb-2">
            11. Previous GI History / पूर्वीचा इतिहास
          </h3>
          <div className="grid grid-cols-2 gap-1.5">
            {[
              'Gastritis', 'GERD', 'Peptic Ulcer', 'IBS',
              'Gallstones', 'Liver Disease', 'Hepatitis', 'Pancreatic Disease'
            ].map(h => (
              <label key={h} className="flex items-center gap-1.5 text-xs text-slate-700 cursor-pointer p-1">
                <input
                  type="checkbox"
                  checked={formData.previousHistory.includes(h)}
                  onChange={() => handleCheckboxToggle('previousHistory', h)}
                  className="accent-emerald-600"
                />
                <span>{h}</span>
              </label>
            ))}
          </div>
          <textarea
            id="previousTreatment"
            rows={2}
            value={formData.previousTreatment}
            onChange={handleChange}
            placeholder="Previous GI treatments, antacids, PPIs..."
            className="w-full px-2.5 py-1.5 border border-slate-300 rounded text-xs"
          />
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-6 space-y-3">
          <h3 className="text-sm font-bold text-emerald-800 border-b border-emerald-100 pb-2">
            12. Investigations / पचनसंस्थेच्या तपासण्या
          </h3>
          <div className="grid grid-cols-3 gap-1.5">
            {[
              'CBC', 'LFT', 'RFT', 'Blood Sugar',
              'Amylase/Lipase', 'Stool Routine', 'USG Abdomen',
              'Endoscopy', 'Colonoscopy', 'CT Abdomen'
            ].map(inv => (
              <label key={inv} className="flex items-center gap-1.5 text-xs text-slate-700 cursor-pointer p-1">
                <input
                  type="checkbox"
                  checked={formData.investigations.includes(inv)}
                  onChange={() => handleCheckboxToggle('investigations', inv)}
                  className="accent-emerald-600"
                />
                <span>{inv}</span>
              </label>
            ))}
          </div>
          <textarea
            id="investigationFindings"
            rows={2}
            value={formData.investigationFindings}
            onChange={handleChange}
            placeholder="USG findings, endoscopy findings, liver enzymes..."
            className="w-full px-2.5 py-1.5 border border-slate-300 rounded text-xs"
          />
        </div>
      </div>

      {/* 13. Red Flags */}
      <div className="bg-rose-50 rounded-2xl border-2 border-rose-300/80 p-6 space-y-3">
        <h3 className="text-base font-bold text-rose-900 flex items-center gap-2">
          <AlertTriangle className="w-5 h-5 text-rose-600" />
          <span>13. Warning / Red Flag Symptoms / धोक्याची लक्षणे</span>
        </h3>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1">
          {[
            'Blood in Vomit / उलटीत रक्त',
            'Black Stool / काळे शौच',
            'Persistent Vomiting / सतत उलटी',
            'Unexplained Weight Loss',
            'Severe Abdominal Pain',
            'Difficulty Swallowing',
            'Jaundice / कावीळ',
            'Persistent Fever / सतत ताप'
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
      </div>

      {/* 14. Clinical Assessment & Prescribed Treatment */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-6 space-y-4">
        <h3 className="text-base font-bold text-emerald-800 border-b border-emerald-100 pb-3 -mx-6 -mt-6 px-6 pt-4 bg-emerald-50/40 rounded-t-2xl">
          14. Clinical Assessment & Treatment / क्लिनिकल मूल्यांकन व उपचार
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Provisional Diagnosis / प्राथमिक निदान</label>
            <input
              id="diagnosis"
              type="text"
              value={formData.diagnosis}
              onChange={handleChange}
              placeholder="e.g. Non-ulcer Dyspepsia / GERD"
              className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Duration / कालावधी</label>
            <input
              id="assessmentDuration"
              type="text"
              value={formData.assessmentDuration}
              onChange={handleChange}
              placeholder="e.g. 4 months"
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
              placeholder="Physical generals, food desires/aversions, thermal reaction, miasm..."
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
              placeholder="Remedy, potency & posology (e.g. Nux Vomica 200C at night, Carbo Veg 30)"
              className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-none font-medium"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Diet & Lifestyle Advice / सल्ला</label>
            <input
              id="advice"
              type="text"
              value={formData.advice}
              onChange={handleChange}
              placeholder="Avoid late dinners, avoid spicy food"
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

      {/* Sticky Bottom Actions Bar */}
      <div className="fixed bottom-0 left-0 right-0 z-30 bg-white/95 backdrop-blur-md border-t border-slate-200 py-3 px-4 shadow-lg">
        <div className="max-w-6xl mx-auto flex flex-wrap items-center justify-between gap-3">
          <div className="text-xs text-slate-600 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            <span>Gastro Case Mode &nbsp;|&nbsp; Patient: <strong>{formData.patientName || 'None'}</strong></span>
            {statusMessage && (
              <span className={`font-bold ml-2 ${statusType === 'error' ? 'text-rose-600' : 'text-emerald-700'}`}>
                {statusMessage}
              </span>
            )}
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleClear}
              className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Clear</span>
            </button>
            <button
              type="button"
              onClick={handleSave}
              className="px-5 py-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-xs transition-colors"
            >
              <Save className="w-3.5 h-3.5" />
              <span>Save</span>
            </button>
            <button
              type="button"
              onClick={handleSubmit}
              className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-sm transition-colors"
            >
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>Submit & Print</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
