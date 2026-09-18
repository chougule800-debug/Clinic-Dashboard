import React, { useState, useEffect } from 'react';
import { useClinic } from '../../context/ClinicContext';
import {
  Brain,
  Save,
  CheckCircle2,
  RotateCcw,
  Printer,
  FileText,
  AlertTriangle,
  Activity,
  Zap,
  Sparkles
} from 'lucide-react';

export interface NeuroFormData {
  patientName: string;
  age: string;
  gender: string;
  date: string;
  mobile: string;
  occupation: string;
  address: string;

  // 2. Main Complaints
  mainComplaint: string[];
  otherComplaint: string;

  // 3. Headache Assessment
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

  // 4. Dizziness & Vertigo
  dizziness: string[];
  dizzinessDuration: string;
  dizzinessFrequency: string;

  // 5. Fainting
  fainting: string[];
  faintingDuration: string;
  faintingDetails: string;

  // 6. Seizures
  seizure: string[];
  seizureCount: string;
  lastSeizure: string;
  seizureDetails: string;

  // 7. Sensory
  sensory: string[];
  sensorySide: string;
  sensorySite: string;

  // 8. Weakness
  weakness: string[];
  weaknessDetails: string;

  // 9. Tremor
  movement: string[];
  movementSite: string;
  movementDuration: string;

  // 10. Speech
  speech: string[];

  // 11. Memory
  memory: string[];

  // 12. Vision
  vision: string[];

  // 13. Balance
  balance: string[];

  // 14. Sleep
  sleep: string[];

  // 15. Previous History
  previousHistory: string[];
  previousDetails: string;

  // 16. Investigations
  investigation: string[];
  investigationDate: string;
  investigationResult: string;
  investigationDetails: string;

  // 17. Red Flags
  redFlag: string[];

  // 18. Clinical Assessment
  diagnosis: string;
  affectedArea: string;
  clinicalSeverity: string;
  clinicalStatus: string;
  clinicalNotes: string;
  treatment: string;
  advice: string;
  followup: string;
  savedAt?: string;
}

const INITIAL_NEURO_DATA: NeuroFormData = {
  patientName: '',
  age: '',
  gender: '',
  date: new Date().toISOString().split('T')[0],
  mobile: '',
  occupation: '',
  address: '',

  mainComplaint: ['Headache'],
  otherComplaint: '',

  headacheLocation: ['Temples', 'Forehead'],
  headacheType: ['Throbbing'],
  headacheSeverity: 'Moderate',
  headacheScore: '6',
  headacheDuration: '4-6 hours',
  headacheFrequency: '2-3 times/week',
  headacheTime: 'Afternoon',
  headacheOnset: 'Gradual',
  headacheTrigger: ['Stress', 'Screen', 'Heat'],
  headacheAssociated: ['Photophobia', 'Nausea'],
  headacheRelief: 'Dark quiet room, cold compress, sleep',
  headacheDetails: '',

  dizziness: [],
  dizzinessDuration: '',
  dizzinessFrequency: '',

  fainting: [],
  faintingDuration: '',
  faintingDetails: '',

  seizure: [],
  seizureCount: '',
  lastSeizure: '',
  seizureDetails: '',

  sensory: [],
  sensorySide: '',
  sensorySite: '',

  weakness: [],
  weaknessDetails: '',

  movement: [],
  movementSite: '',
  movementDuration: '',

  speech: [],
  memory: [],
  vision: ['Light Sensitivity'],
  balance: [],
  sleep: ['Insomnia'],

  previousHistory: ['Migraine'],
  previousDetails: '',

  investigation: [],
  investigationDate: '',
  investigationResult: '',
  investigationDetails: '',

  redFlag: [],

  diagnosis: 'Classical Migraine / hemicrania with photophobia',
  affectedArea: 'Frontotemporal & Occipital nerve distribution',
  clinicalSeverity: 'Moderate',
  clinicalStatus: 'Recurrent',
  clinicalNotes: '',
  treatment: 'Belladonna 200C stat, followed by Natrum Muriaticum 200C weekly',
  advice: 'Blue-light filters on screens, hydrated diet, strict sleep schedule',
  followup: ''
};

export const NeuroCaseForm: React.FC = () => {
  const {
    selectedPatient,
    patients,
    selectPatient,
    saveSystemForm,
    systemForms,
    setActiveTab
  } = useClinic();

  const [formData, setFormData] = useState<NeuroFormData>(INITIAL_NEURO_DATA);
  const [statusMessage, setStatusMessage] = useState<string>('');
  const [statusType, setStatusType] = useState<'success' | 'error' | 'info'>('info');

  useEffect(() => {
    if (selectedPatient) {
      const existing = systemForms.find(
        f => f.patientId === selectedPatient.id && f.system === 'headache'
      );

      if (existing && existing.data) {
        setFormData({
          ...INITIAL_NEURO_DATA,
          ...existing.data,
          patientName: selectedPatient.name,
          age: String(selectedPatient.age || ''),
          gender: selectedPatient.gender === 'Female' ? 'Female' : selectedPatient.gender === 'Male' ? 'Male' : 'Other',
          mobile: selectedPatient.mobile || '',
          address: selectedPatient.address || existing.data.address || '',
          date: existing.data.date || new Date().toISOString().split('T')[0]
        });
        return;
      }

      try {
        const stored = localStorage.getItem(`NEURO_CASE_${selectedPatient.id}`);
        if (stored) {
          const parsed = JSON.parse(stored);
          setFormData(prev => ({
            ...prev,
            ...parsed,
            patientName: selectedPatient.name,
            age: String(selectedPatient.age || ''),
            gender: selectedPatient.gender === 'Female' ? 'Female' : selectedPatient.gender === 'Male' ? 'Male' : 'Other',
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
        gender: selectedPatient.gender === 'Female' ? 'Female' : selectedPatient.gender === 'Male' ? 'Male' : 'Other',
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

  const handleCheckboxToggle = (category: keyof NeuroFormData, value: string) => {
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
      localStorage.setItem(`NEURO_CASE_${selectedPatient.id}`, JSON.stringify(updatedData));
    }
    localStorage.setItem('NEURO_CASE_' + formData.patientName, JSON.stringify(updatedData));

    const chiefComplaintsText = [
      formData.mainComplaint?.length ? `Chief complaints: ${formData.mainComplaint.join(', ')}` : '',
      formData.headacheLocation?.length ? `Location: ${formData.headacheLocation.join(', ')}` : '',
      formData.headacheType?.length ? `Type: ${formData.headacheType.join(', ')}` : '',
      formData.headacheScore ? `Pain score: ${formData.headacheScore}/10` : '',
      formData.headacheDuration ? `Duration: ${formData.headacheDuration}` : ''
    ].filter(Boolean).join(' • ');

    const modalitiesAgg = formData.headacheTrigger?.join(', ') || 'Stress, heat, screen';
    const modalitiesAmel = formData.headacheRelief || 'Dark quiet room, rest';

    if (selectedPatient) {
      saveSystemForm({
        patientId: selectedPatient.id,
        system: 'headache',
        chiefComplaints: chiefComplaintsText || 'Neurological / Headache Assessment',
        duration: formData.headacheDuration || 'Recorded Case',
        severity: formData.headacheSeverity === 'Very Severe' || formData.headacheSeverity === 'Severe' || formData.clinicalSeverity === 'Severe' ? 'Severe' : formData.headacheSeverity === 'Mild' ? 'Mild' : 'Moderate',
        modalitiesAggravation: modalitiesAgg,
        modalitiesAmelioration: modalitiesAmel,
        concomitants: formData.headacheAssociated?.join(', ') || formData.otherComplaint || '',
        clinicalNotes: formData.clinicalNotes || formData.diagnosis || '',
        data: updatedData,
        submittedVia: 'Doctor_Dashboard'
      });
    }

    setStatusMessage('✓ Neurological Case Saved Successfully / केस यशस्वीरित्या सेव्ह झाली. Synced to Case Summary.');
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
      setFormData(INITIAL_NEURO_DATA);
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
          <div className="w-10 h-10 rounded-xl bg-teal-50 border border-teal-200 flex items-center justify-center text-teal-700">
            <Brain className="w-5 h-5" />
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
              Neurological System Case Taking (न्यूरोलॉजिकल सिस्टम केस टेकिंग)
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
            className="px-3 py-1.5 bg-slate-50 border border-slate-300 rounded-xl text-xs font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-teal-500"
          >
            <option value="" disabled>Switch Patient...</option>
            {patients.map(p => (
              <option key={p.id} value={p.id}>{p.name} ({p.id})</option>
            ))}
          </select>

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
      <header className="bg-gradient-to-r from-cyan-900 to-teal-700 text-white rounded-2xl p-6 shadow-md text-center">
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">
          Dr. Bharat's Arogya Homeopathy
        </h1>
        <h2 className="text-lg sm:text-xl font-semibold mt-1">
          Neurological System Case Taking
        </h2>
        <div className="text-sm sm:text-base font-medium opacity-90 mt-0.5">
          न्यूरोलॉजिकल सिस्टम केस टेकिंग
        </div>
        <p className="text-xs sm:text-sm font-medium opacity-80 mt-2">
          Opp. Central Jail, Hindalga, Belgaum &nbsp;|&nbsp; 9902686173
        </p>
      </header>

      {/* 1. Patient Information */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-6 space-y-4">
        <h3 className="text-base font-bold text-teal-800 border-b border-teal-100 pb-3 -mx-6 -mt-6 px-6 pt-4 bg-teal-50/40 rounded-t-2xl flex items-center justify-between">
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
              className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs focus:ring-2 focus:ring-teal-500 focus:outline-none"
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
              className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs focus:ring-2 focus:ring-teal-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Gender / लिंग</label>
            <select
              id="gender"
              value={formData.gender}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs focus:ring-2 focus:ring-teal-500 focus:outline-none bg-white"
            >
              <option value="">Select</option>
              <option value="Male">Male / पुरुष</option>
              <option value="Female">Female / स्त्री</option>
              <option value="Other">Other / इतर</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Date / तारीख</label>
            <input
              id="date"
              type="date"
              value={formData.date}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs focus:ring-2 focus:ring-teal-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Mobile / मोबाईल नंबर</label>
            <input
              id="mobile"
              type="tel"
              value={formData.mobile}
              onChange={handleChange}
              placeholder="Mobile Number"
              className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs focus:ring-2 focus:ring-teal-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Occupation / व्यवसाय</label>
            <input
              id="occupation"
              type="text"
              value={formData.occupation}
              onChange={handleChange}
              placeholder="e.g. Teacher, Engineer, Student"
              className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs focus:ring-2 focus:ring-teal-500 focus:outline-none"
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
              className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs focus:ring-2 focus:ring-teal-500 focus:outline-none"
            />
          </div>
        </div>
      </div>

      {/* 2. Main Neurological Complaint */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-6 space-y-4">
        <h3 className="text-base font-bold text-teal-800 border-b border-teal-100 pb-3 -mx-6 -mt-6 px-6 pt-4 bg-teal-50/40 rounded-t-2xl">
          2. Main Neurological Complaint / मुख्य न्यूरोलॉजिकल तक्रार
        </h3>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2 pt-2">
          {[
            { key: 'Headache', label: 'Headache / डोकेदुखी' },
            { key: 'Dizziness', label: 'Dizziness / चक्कर' },
            { key: 'Vertigo', label: 'Vertigo / गरगरणे' },
            { key: 'Fainting', label: 'Fainting / मूर्च्छा' },
            { key: 'Seizure', label: 'Seizure / फिट' },
            { key: 'Numbness', label: 'Numbness / बधिरपणा' },
            { key: 'Tingling', label: 'Tingling / मुंग्या' },
            { key: 'Weakness', label: 'Weakness / अशक्तपणा' },
            { key: 'Tremor', label: 'Tremor / थरथर' },
            { key: 'Memory', label: 'Memory / स्मरणशक्ती' },
            { key: 'Speech', label: 'Speech / बोलणे समस्या' },
            { key: 'Balance', label: 'Balance / संतुलन समस्या' }
          ].map(item => {
            const checked = formData.mainComplaint.includes(item.key);
            return (
              <button
                type="button"
                key={item.key}
                onClick={() => handleCheckboxToggle('mainComplaint', item.key)}
                className={`p-2 rounded-lg text-xs font-medium border text-left transition-all ${
                  checked
                    ? 'bg-teal-700 text-white border-teal-800 shadow-xs'
                    : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-teal-50/60'
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

        <div className="pt-2">
          <label className="block text-xs font-bold text-slate-700 mb-1">
            Other Neurological Complaint / इतर न्यूरोलॉजिकल तक्रार
          </label>
          <textarea
            id="otherComplaint"
            rows={2}
            value={formData.otherComplaint}
            onChange={handleChange}
            placeholder="Details of other presenting complaints..."
            className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs focus:ring-2 focus:ring-teal-500 focus:outline-none"
          />
        </div>
      </div>

      {/* 3. Headache Assessment */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-6 space-y-4">
        <h3 className="text-base font-bold text-teal-800 border-b border-teal-100 pb-3 -mx-6 -mt-6 px-6 pt-4 bg-teal-50/40 rounded-t-2xl">
          3. Headache Assessment / डोकेदुखीचे मूल्यांकन
        </h3>

        {/* Location */}
        <div className="p-3.5 bg-teal-50/40 rounded-xl border border-teal-100 space-y-2">
          <div className="font-bold text-xs text-teal-900">Headache Location / डोकेदुखीचे ठिकाण</div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {[
              { key: 'Forehead', label: 'Forehead / कपाळ' },
              { key: 'Temples', label: 'Temples / कानशिले' },
              { key: 'One Side', label: 'One Side / एका बाजूला' },
              { key: 'Both Sides', label: 'Both Sides / दोन्ही बाजू' },
              { key: 'Back of Head', label: 'Back of Head / डोक्याच्या मागे' },
              { key: 'Top of Head', label: 'Top of Head / वरचा भाग' },
              { key: 'Around Eye', label: 'Around Eye / डोळ्याभोवती' },
              { key: 'Whole Head', label: 'Whole Head / संपूर्ण डोके' }
            ].map(item => {
              const checked = formData.headacheLocation.includes(item.key);
              return (
                <button
                  type="button"
                  key={item.key}
                  onClick={() => handleCheckboxToggle('headacheLocation', item.key)}
                  className={`p-2 rounded-lg text-xs font-medium border text-left transition-all ${
                    checked
                      ? 'bg-teal-700 text-white border-teal-800'
                      : 'bg-white text-slate-700 border-teal-200 hover:bg-teal-50'
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

        {/* Type / Nature */}
        <div className="p-3.5 bg-teal-50/40 rounded-xl border border-teal-100 space-y-2">
          <div className="font-bold text-xs text-teal-900">Type / Nature of Headache / डोकेदुखीचा प्रकार</div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {[
              { key: 'Throbbing', label: 'Throbbing / ठणकणारी' },
              { key: 'Pressing', label: 'Pressing / दाबल्यासारखी' },
              { key: 'Tight Band', label: 'Tight Band / घट्ट पट्टा' },
              { key: 'Sharp', label: 'Sharp / तीक्ष्ण' },
              { key: 'Stabbing', label: 'Stabbing / टोचणारी' },
              { key: 'Burning', label: 'Burning / जळजळ' },
              { key: 'Heaviness', label: 'Heaviness / जडपणा' },
              { key: 'Pulsating', label: 'Pulsating / स्पंदनशील' }
            ].map(item => {
              const checked = formData.headacheType.includes(item.key);
              return (
                <button
                  type="button"
                  key={item.key}
                  onClick={() => handleCheckboxToggle('headacheType', item.key)}
                  className={`p-2 rounded-lg text-xs font-medium border text-left transition-all ${
                    checked
                      ? 'bg-cyan-800 text-white border-cyan-900'
                      : 'bg-white text-slate-700 border-teal-200 hover:bg-teal-50'
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

        {/* Specifics */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Severity / तीव्रता</label>
            <select
              id="headacheSeverity"
              value={formData.headacheSeverity}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs focus:ring-2 focus:ring-teal-500 focus:outline-none bg-white"
            >
              <option value="Mild">Mild / सौम्य</option>
              <option value="Moderate">Moderate / मध्यम</option>
              <option value="Severe">Severe / तीव्र</option>
              <option value="Very Severe">Very Severe / अत्यंत तीव्र</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Pain Score (0–10) / वेदना गुण</label>
            <input
              id="headacheScore"
              type="number"
              min="0"
              max="10"
              value={formData.headacheScore}
              onChange={handleChange}
              placeholder="0 to 10"
              className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs focus:ring-2 focus:ring-teal-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Duration of Headache / कालावधी</label>
            <input
              id="headacheDuration"
              type="text"
              value={formData.headacheDuration}
              onChange={handleChange}
              placeholder="e.g. 2 hours / 3 days"
              className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs focus:ring-2 focus:ring-teal-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Frequency / वारंवारिता</label>
            <input
              id="headacheFrequency"
              type="text"
              value={formData.headacheFrequency}
              onChange={handleChange}
              placeholder="e.g. Daily / Weekly"
              className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs focus:ring-2 focus:ring-teal-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Time of Occurrence / डोकेदुखीची वेळ</label>
            <select
              id="headacheTime"
              value={formData.headacheTime}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs focus:ring-2 focus:ring-teal-500 focus:outline-none bg-white"
            >
              <option value="Morning">Morning / सकाळी</option>
              <option value="Afternoon">Afternoon / दुपारी</option>
              <option value="Evening">Evening / संध्याकाळी</option>
              <option value="Night">Night / रात्री</option>
              <option value="Any Time">Any Time / कधीही</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Onset / सुरुवात</label>
            <select
              id="headacheOnset"
              value={formData.headacheOnset}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs focus:ring-2 focus:ring-teal-500 focus:outline-none bg-white"
            >
              <option value="Sudden">Sudden / अचानक</option>
              <option value="Gradual">Gradual / हळूहळू</option>
              <option value="Intermittent">Intermittent / थांबून थांबून</option>
              <option value="Continuous">Continuous / सतत</option>
            </select>
          </div>
        </div>

        {/* Triggers */}
        <div className="p-3.5 bg-amber-50/40 rounded-xl border border-amber-100 space-y-2">
          <div className="font-bold text-xs text-amber-900">Triggers / Aggravating Factors / डोकेदुखी वाढवणारे घटक</div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {[
              { key: 'Stress', label: 'Stress / ताण' },
              { key: 'Lack of Sleep', label: 'Lack of Sleep / झोप कमी' },
              { key: 'Screen', label: 'Screen / स्क्रीन' },
              { key: 'Bright Light', label: 'Bright Light / तेज प्रकाश' },
              { key: 'Noise', label: 'Noise / आवाज' },
              { key: 'Fasting', label: 'Fasting / उपवास' },
              { key: 'Heat', label: 'Heat / उष्णता' },
              { key: 'Cold', label: 'Cold / थंडी' },
              { key: 'Exercise', label: 'Exercise / व्यायाम' },
              { key: 'Cough', label: 'Coughing / खोकला' },
              { key: 'Bending', label: 'Bending / वाकणे' },
              { key: 'Other', label: 'Other / इतर' }
            ].map(item => {
              const checked = formData.headacheTrigger.includes(item.key);
              return (
                <button
                  type="button"
                  key={item.key}
                  onClick={() => handleCheckboxToggle('headacheTrigger', item.key)}
                  className={`p-2 rounded-lg text-xs font-medium border text-left transition-all ${
                    checked
                      ? 'bg-amber-700 text-white border-amber-800'
                      : 'bg-white text-slate-700 border-amber-200 hover:bg-amber-50'
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

        {/* Associated Symptoms */}
        <div className="p-3.5 bg-indigo-50/40 rounded-xl border border-indigo-100 space-y-2">
          <div className="font-bold text-xs text-indigo-900">Associated Headache Symptoms / संबंधित लक्षणे</div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {[
              { key: 'Nausea', label: 'Nausea / मळमळ' },
              { key: 'Vomiting', label: 'Vomiting / उलटी' },
              { key: 'Photophobia', label: 'Light Sensitivity / प्रकाश' },
              { key: 'Phonophobia', label: 'Sound Sensitivity / आवाज' },
              { key: 'Aura', label: 'Aura / ऑरा' },
              { key: 'Blurred Vision', label: 'Blurred Vision / अंधुक' },
              { key: 'Eye Pain', label: 'Eye Pain / डोळेदुखी' },
              { key: 'Dizziness', label: 'Dizziness / चक्कर' },
              { key: 'Neck Pain', label: 'Neck Pain / मानदुखी' },
              { key: 'Weakness', label: 'Weakness / अशक्तपणा' },
              { key: 'Numbness', label: 'Numbness / बधिरपणा' },
              { key: 'Fever', label: 'Fever / ताप' }
            ].map(item => {
              const checked = formData.headacheAssociated.includes(item.key);
              return (
                <button
                  type="button"
                  key={item.key}
                  onClick={() => handleCheckboxToggle('headacheAssociated', item.key)}
                  className={`p-2 rounded-lg text-xs font-medium border text-left transition-all ${
                    checked
                      ? 'bg-indigo-700 text-white border-indigo-800'
                      : 'bg-white text-slate-700 border-indigo-200 hover:bg-indigo-50'
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

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Relieving Factors / आराम मिळण्याचे घटक
            </label>
            <textarea
              id="headacheRelief"
              rows={2}
              value={formData.headacheRelief}
              onChange={handleChange}
              placeholder="e.g. Tight bandage, sleep, dark room, hot drink"
              className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs focus:ring-2 focus:ring-teal-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Headache Details / डोकेदुखीची इतर माहिती
            </label>
            <textarea
              id="headacheDetails"
              rows={2}
              value={formData.headacheDetails}
              onChange={handleChange}
              placeholder="Additional notes, periodicity, prodromal signs..."
              className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs focus:ring-2 focus:ring-teal-500 focus:outline-none"
            />
          </div>
        </div>
      </div>

      {/* 4 & 5. Dizziness & Fainting */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* 4. Dizziness & Vertigo */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-6 space-y-4">
          <h3 className="text-sm font-bold text-teal-800 border-b border-teal-100 pb-2">
            4. Dizziness & Vertigo / चक्कर व गरगरणे
          </h3>

          <div className="grid grid-cols-2 gap-2">
            {[
              { key: 'Lightheadedness', label: 'Lightheadedness / हलके वाटणे' },
              { key: 'Room Spinning', label: 'Room Spinning / खोली फिरणे' },
              { key: 'On Standing', label: 'On Standing / उभे राहिल्यावर' },
              { key: 'On Turning Head', label: 'On Turning Head / मान वळवल्यावर' },
              { key: 'Balance Problem', label: 'Balance Problem / संतुलन समस्या' },
              { key: 'Nausea', label: 'Nausea / मळमळ' }
            ].map(item => {
              const checked = formData.dizziness.includes(item.key);
              return (
                <button
                  type="button"
                  key={item.key}
                  onClick={() => handleCheckboxToggle('dizziness', item.key)}
                  className={`p-2 rounded-lg text-xs font-medium border text-left transition-all ${
                    checked
                      ? 'bg-emerald-700 text-white border-emerald-800'
                      : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-emerald-50'
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

          <div className="grid grid-cols-2 gap-3 pt-1">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Duration / कालावधी</label>
              <input
                id="dizzinessDuration"
                type="text"
                value={formData.dizzinessDuration}
                onChange={handleChange}
                placeholder="Seconds / Minutes"
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs focus:ring-2 focus:ring-teal-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Frequency / वारंवारिता</label>
              <input
                id="dizzinessFrequency"
                type="text"
                value={formData.dizzinessFrequency}
                onChange={handleChange}
                placeholder="e.g. Daily / Occasional"
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs focus:ring-2 focus:ring-teal-500 focus:outline-none"
              />
            </div>
          </div>
        </div>

        {/* 5. Fainting */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-6 space-y-4">
          <h3 className="text-sm font-bold text-teal-800 border-b border-teal-100 pb-2">
            5. Fainting / Loss of Consciousness / मूर्च्छा / शुद्ध हरपणे
          </h3>

          <div className="grid grid-cols-2 gap-2">
            {[
              { key: 'Fainting', label: 'Fainting / मूर्च्छा' },
              { key: 'Loss of Consciousness', label: 'Loss of Consciousness / शुद्ध हरपणे' },
              { key: 'Warning Symptoms', label: 'Warning Symptoms / पूर्वलक्षणे' },
              { key: 'Injury', label: 'Injury / दुखापत' },
              { key: 'Recurrent', label: 'Recurrent / वारंवार' },
              { key: 'Unknown Cause', label: 'Cause Unknown / कारण अस्पष्ट' }
            ].map(item => {
              const checked = formData.fainting.includes(item.key);
              return (
                <button
                  type="button"
                  key={item.key}
                  onClick={() => handleCheckboxToggle('fainting', item.key)}
                  className={`p-2 rounded-lg text-xs font-medium border text-left transition-all ${
                    checked
                      ? 'bg-rose-700 text-white border-rose-800'
                      : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-rose-50'
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={checked}
                    onChange={() => {}}
                    className="mr-1.5 pointer-events-none accent-rose-600"
                  />
                  {item.label}
                </button>
              );
            })}
          </div>

          <div className="pt-1">
            <label className="block text-xs font-bold text-slate-700 mb-1">Duration & Details / कालावधी व माहिती</label>
            <textarea
              id="faintingDetails"
              rows={2}
              value={formData.faintingDetails}
              onChange={handleChange}
              placeholder="Duration, post-syncopal recovery, triggers..."
              className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs focus:ring-2 focus:ring-teal-500 focus:outline-none"
            />
          </div>
        </div>
      </div>

      {/* 6, 7 & 8. Seizures, Sensory & Weakness */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* 6. Seizures / Fits */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-5 space-y-3">
          <h4 className="font-bold text-xs text-teal-900 border-b border-slate-100 pb-2">
            6. Seizures / Fits / फिट्स / आकडी
          </h4>
          <div className="grid grid-cols-1 gap-1.5">
            {[
              { key: 'Generalized', label: 'Generalized / संपूर्ण शरीर' },
              { key: 'Focal', label: 'Focal / स्थानिक' },
              { key: 'Jerking', label: 'Jerking / झटके' },
              { key: 'Stiffening', label: 'Stiffening / ताठ होणे' },
              { key: 'Tongue Bite', label: 'Tongue Bite / जीभ चावणे' },
              { key: 'Urine Incontinence', label: 'Urine Incontinence / लघवी सुटणे' },
              { key: 'Post Episode Confusion', label: 'Post Confusion / गोंधळ' }
            ].map(item => (
              <label key={item.key} className="flex items-center gap-2 p-1 text-xs text-slate-700 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.seizure.includes(item.key)}
                  onChange={() => handleCheckboxToggle('seizure', item.key)}
                  className="accent-teal-600"
                />
                <span>{item.label}</span>
              </label>
            ))}
          </div>
          <div>
            <label className="block text-[11px] font-bold text-slate-600 mb-0.5">Seizure details / माहिती</label>
            <input
              id="seizureDetails"
              type="text"
              value={formData.seizureDetails}
              onChange={handleChange}
              placeholder="Count, last episode date..."
              className="w-full px-2.5 py-1.5 border border-slate-300 rounded text-xs focus:outline-none"
            />
          </div>
        </div>

        {/* 7. Sensory Symptoms */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-5 space-y-3">
          <h4 className="font-bold text-xs text-teal-900 border-b border-slate-100 pb-2">
            7. Sensory Symptoms / मुंग्या व संवेदनेत बदल
          </h4>
          <div className="grid grid-cols-1 gap-1.5">
            {[
              { key: 'Numbness', label: 'Numbness / बधिरपणा' },
              { key: 'Tingling', label: 'Tingling / मुंग्या' },
              { key: 'Burning', label: 'Burning Sensation / जळजळ' },
              { key: 'Reduced Sensation', label: 'Reduced Sensation / संवेदना कमी' },
              { key: 'Pins and Needles', label: 'Pins & Needles / टोचल्यासारखे' },
              { key: 'Electric Shock', label: 'Electric Shock / विद्युत झटका' },
              { key: 'Loss of Sensation', label: 'Loss of Sensation / संवेदना नष्ट' }
            ].map(item => (
              <label key={item.key} className="flex items-center gap-2 p-1 text-xs text-slate-700 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.sensory.includes(item.key)}
                  onChange={() => handleCheckboxToggle('sensory', item.key)}
                  className="accent-teal-600"
                />
                <span>{item.label}</span>
              </label>
            ))}
          </div>
          <div className="grid grid-cols-2 gap-2">
            <select
              id="sensorySide"
              value={formData.sensorySide}
              onChange={handleChange}
              className="px-2 py-1.5 border border-slate-300 rounded text-xs bg-white"
            >
              <option value="">Side</option>
              <option value="Right">Right</option>
              <option value="Left">Left</option>
              <option value="Both">Both</option>
              <option value="Whole Body">Whole Body</option>
            </select>
            <input
              id="sensorySite"
              type="text"
              value={formData.sensorySite}
              onChange={handleChange}
              placeholder="Site / ठिकाण"
              className="px-2 py-1.5 border border-slate-300 rounded text-xs"
            />
          </div>
        </div>

        {/* 8. Weakness / Paralysis */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-5 space-y-3">
          <h4 className="font-bold text-xs text-teal-900 border-b border-slate-100 pb-2">
            8. Weakness / पक्षाघात / अशक्तपणा
          </h4>
          <div className="grid grid-cols-1 gap-1.5">
            {[
              { key: 'Arm Weakness', label: 'Arm Weakness / हात अशक्त' },
              { key: 'Leg Weakness', label: 'Leg Weakness / पाय अशक्त' },
              { key: 'One Side', label: 'One Side / एका बाजूला' },
              { key: 'Both Sides', label: 'Both Sides / दोन्ही बाजू' },
              { key: 'Facial Weakness', label: 'Facial Weakness / चेहरा अशक्त' },
              { key: 'Sudden Onset', label: 'Sudden Onset / अचानक' },
              { key: 'Difficulty Walking', label: 'Difficulty Walking / चालताना त्रास' }
            ].map(item => (
              <label key={item.key} className="flex items-center gap-2 p-1 text-xs text-slate-700 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.weakness.includes(item.key)}
                  onChange={() => handleCheckboxToggle('weakness', item.key)}
                  className="accent-teal-600"
                />
                <span>{item.label}</span>
              </label>
            ))}
          </div>
          <textarea
            id="weaknessDetails"
            rows={2}
            value={formData.weaknessDetails}
            onChange={handleChange}
            placeholder="Weakness details, progression..."
            className="w-full px-2.5 py-1.5 border border-slate-300 rounded text-xs focus:outline-none"
          />
        </div>
      </div>

      {/* 9–14. Tremor, Speech, Memory, Vision, Balance & Sleep */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-6 space-y-4">
        <h3 className="text-base font-bold text-teal-800 border-b border-teal-100 pb-3 -mx-6 -mt-6 px-6 pt-4 bg-teal-50/40 rounded-t-2xl">
          9–14. Cognitive, Motor, Cranial & Sleep Assessment
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          {/* Tremor */}
          <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-1.5">
            <div className="font-bold text-xs text-slate-900">9. Tremor / थरथर</div>
            {[
              { key: 'Hand Tremor', label: 'Hand Tremor / हात थरथरणे' },
              { key: 'Head Tremor', label: 'Head Tremor / डोके थरथरणे' },
              { key: 'Rest Tremor', label: 'Rest Tremor / विश्रांतीत' },
              { key: 'Action Tremor', label: 'Action Tremor / हालचालीत' },
              { key: 'Muscle Spasm', label: 'Muscle Spasm / स्नायू आकुंचन' }
            ].map(item => (
              <label key={item.key} className="flex items-center gap-2 text-xs text-slate-700 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.movement.includes(item.key)}
                  onChange={() => handleCheckboxToggle('movement', item.key)}
                  className="accent-teal-600"
                />
                <span>{item.label}</span>
              </label>
            ))}
          </div>

          {/* Speech */}
          <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-1.5">
            <div className="font-bold text-xs text-slate-900">10. Speech & Communication / बोलणे</div>
            {[
              { key: 'Slurred Speech', label: 'Slurred / अस्पष्ट बोलणे' },
              { key: 'Difficulty Speaking', label: 'Difficulty Speaking / त्रास' },
              { key: 'Word Finding', label: 'Word Finding / शब्द आठवणे' },
              { key: 'Voice Change', label: 'Voice Change / आवाज बदल' },
              { key: 'Difficulty Understanding', label: 'Understanding / समजणे' }
            ].map(item => (
              <label key={item.key} className="flex items-center gap-2 text-xs text-slate-700 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.speech.includes(item.key)}
                  onChange={() => handleCheckboxToggle('speech', item.key)}
                  className="accent-teal-600"
                />
                <span>{item.label}</span>
              </label>
            ))}
          </div>

          {/* Memory */}
          <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-1.5">
            <div className="font-bold text-xs text-slate-900">11. Memory & Cognitive / स्मरणशक्ती</div>
            {[
              { key: 'Forgetfulness', label: 'Forgetfulness / विसरभोळेपणा' },
              { key: 'Recent Memory', label: 'Recent Memory / अलीकडील' },
              { key: 'Old Memory', label: 'Old Memory / जुनी' },
              { key: 'Poor Concentration', label: 'Poor Concentration / एकाग्रता' },
              { key: 'Confusion', label: 'Confusion / गोंधळ' }
            ].map(item => (
              <label key={item.key} className="flex items-center gap-2 text-xs text-slate-700 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.memory.includes(item.key)}
                  onChange={() => handleCheckboxToggle('memory', item.key)}
                  className="accent-teal-600"
                />
                <span>{item.label}</span>
              </label>
            ))}
          </div>

          {/* Vision */}
          <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-1.5">
            <div className="font-bold text-xs text-slate-900">12. Vision & Eye / दृष्टी व डोळे</div>
            {[
              { key: 'Blurred Vision', label: 'Blurred Vision / अंधुक' },
              { key: 'Double Vision', label: 'Double Vision / दुहेरी' },
              { key: 'Visual Aura', label: 'Visual Aura / ऑरा' },
              { key: 'Eye Pain', label: 'Eye Pain / डोळेदुखी' },
              { key: 'Light Sensitivity', label: 'Light Sensitivity / प्रकाश' }
            ].map(item => (
              <label key={item.key} className="flex items-center gap-2 text-xs text-slate-700 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.vision.includes(item.key)}
                  onChange={() => handleCheckboxToggle('vision', item.key)}
                  className="accent-teal-600"
                />
                <span>{item.label}</span>
              </label>
            ))}
          </div>

          {/* Balance */}
          <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-1.5">
            <div className="font-bold text-xs text-slate-900">13. Balance & Walking / संतुलन व चालणे</div>
            {[
              { key: 'Unsteady Walking', label: 'Unsteady Walking / अस्थिर चाल' },
              { key: 'Falls', label: 'Falls / पडणे' },
              { key: 'Difficulty Turning', label: 'Turning / वळताना त्रास' },
              { key: 'Gait Change', label: 'Gait Change / चालण्यात बदल' },
              { key: 'Coordination Problem', label: 'Coordination / समन्वय' }
            ].map(item => (
              <label key={item.key} className="flex items-center gap-2 text-xs text-slate-700 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.balance.includes(item.key)}
                  onChange={() => handleCheckboxToggle('balance', item.key)}
                  className="accent-teal-600"
                />
                <span>{item.label}</span>
              </label>
            ))}
          </div>

          {/* Sleep */}
          <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-1.5">
            <div className="font-bold text-xs text-slate-900">14. Sleep / झोप</div>
            {[
              { key: 'Insomnia', label: 'Insomnia / निद्रानाश' },
              { key: 'Excessive Sleepiness', label: 'Excessive / जास्त झोप' },
              { key: 'Sleep Talking', label: 'Sleep Talking / बोलणे' },
              { key: 'Nightmares', label: 'Nightmares / स्वप्ने' },
              { key: 'Daytime Sleepiness', label: 'Daytime Sleepiness' }
            ].map(item => (
              <label key={item.key} className="flex items-center gap-2 text-xs text-slate-700 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.sleep.includes(item.key)}
                  onChange={() => handleCheckboxToggle('sleep', item.key)}
                  className="accent-teal-600"
                />
                <span>{item.label}</span>
              </label>
            ))}
          </div>
        </div>
      </div>

      {/* 15 & 16. Previous History & Investigations */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-6 space-y-4">
          <h3 className="text-sm font-bold text-teal-800 border-b border-teal-100 pb-2">
            15. Previous Neurological History / पूर्वीचा इतिहास
          </h3>
          <div className="grid grid-cols-2 gap-2">
            {[
              { key: 'Migraine', label: 'Migraine / मायग्रेन' },
              { key: 'Stroke', label: 'Stroke / स्ट्रोक' },
              { key: 'Epilepsy', label: 'Epilepsy / एपिलेप्सी' },
              { key: 'Parkinsonism', label: 'Parkinsonism' },
              { key: 'Neuropathy', label: 'Neuropathy' },
              { key: 'Head Injury', label: 'Head Injury / दुखापत' },
              { key: 'Meningitis', label: 'Meningitis / मेंदूज्वर' },
              { key: 'Other', label: 'Other / इतर' }
            ].map(item => (
              <label key={item.key} className="flex items-center gap-2 p-1 text-xs text-slate-700 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.previousHistory.includes(item.key)}
                  onChange={() => handleCheckboxToggle('previousHistory', item.key)}
                  className="accent-teal-600"
                />
                <span>{item.label}</span>
              </label>
            ))}
          </div>
          <textarea
            id="previousDetails"
            rows={2}
            value={formData.previousDetails}
            onChange={handleChange}
            placeholder="Previous treatment, medications taken..."
            className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs focus:outline-none"
          />
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-6 space-y-4">
          <h3 className="text-sm font-bold text-teal-800 border-b border-teal-100 pb-2">
            16. Investigations / न्यूरोलॉजिकल तपासण्या
          </h3>
          <div className="grid grid-cols-2 gap-2">
            {[
              { key: 'CT Brain', label: 'CT Brain / CT ब्रेन' },
              { key: 'MRI Brain', label: 'MRI Brain / MRI ब्रेन' },
              { key: 'EEG', label: 'EEG' },
              { key: 'EMG', label: 'EMG' },
              { key: 'NCV', label: 'NCV' },
              { key: 'Blood Tests', label: 'Blood Tests / रक्त तपासणी' },
              { key: 'Eye Examination', label: 'Eye Exam / डोळे तपासणी' }
            ].map(item => (
              <label key={item.key} className="flex items-center gap-2 p-1 text-xs text-slate-700 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.investigation.includes(item.key)}
                  onChange={() => handleCheckboxToggle('investigation', item.key)}
                  className="accent-teal-600"
                />
                <span>{item.label}</span>
              </label>
            ))}
          </div>
          <div className="grid grid-cols-2 gap-2">
            <input
              id="investigationDate"
              type="date"
              value={formData.investigationDate}
              onChange={handleChange}
              className="px-2.5 py-1.5 border border-slate-300 rounded text-xs"
            />
            <input
              id="investigationResult"
              type="text"
              value={formData.investigationResult}
              onChange={handleChange}
              placeholder="Important result"
              className="px-2.5 py-1.5 border border-slate-300 rounded text-xs"
            />
          </div>
          <textarea
            id="investigationDetails"
            rows={2}
            value={formData.investigationDetails}
            onChange={handleChange}
            placeholder="Findings, impressions, radiologist summary..."
            className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs focus:outline-none"
          />
        </div>
      </div>

      {/* 17. Warning / Red Flag Symptoms */}
      <div className="bg-amber-50 rounded-2xl border-2 border-amber-300/80 p-6 space-y-3">
        <h3 className="text-base font-bold text-amber-900 flex items-center gap-2">
          <AlertTriangle className="w-5 h-5 text-amber-600" />
          <span>17. Warning / Red Flag Symptoms / धोक्याची लक्षणे</span>
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2 pt-1">
          {[
            { key: 'Sudden Severe Headache', label: 'Sudden Severe Headache / अचानक तीव्र डोकेदुखी' },
            { key: 'New Neurological Deficit', label: 'New Deficit / नवीन कमतरता' },
            { key: 'Sudden Weakness', label: 'Sudden Weakness / अचानक अशक्तपणा' },
            { key: 'Facial Drooping', label: 'Facial Drooping / चेहरा वाकडा' },
            { key: 'Speech Difficulty', label: 'Speech Difficulty / बोलण्यात अडचण' },
            { key: 'Loss of Consciousness', label: 'Loss of Consciousness / शुद्ध हरपणे' },
            { key: 'New Seizure', label: 'New Seizure / नवीन फिट' },
            { key: 'Sudden Vision Loss', label: 'Sudden Vision Loss / अचानक दृष्टी कमी' },
            { key: 'Severe Headache with Fever', label: 'Headache with Fever / तापासह डोकेदुखी' },
            { key: 'Headache after Trauma', label: 'Headache after Injury / दुखापतीनंतर' },
            { key: 'Progressive Weakness', label: 'Progressive Weakness / वाढती कमजोरी' },
            { key: 'New Balance Problem', label: 'New Balance Problem / संतुलन समस्या' }
          ].map(item => {
            const checked = formData.redFlag.includes(item.key);
            return (
              <label
                key={item.key}
                className={`flex items-center gap-2 p-2 rounded-lg border text-xs font-semibold cursor-pointer transition-colors ${
                  checked ? 'bg-rose-100 border-rose-400 text-rose-950' : 'bg-white/80 border-amber-200 text-slate-800 hover:bg-white'
                }`}
              >
                <input
                  type="checkbox"
                  checked={checked}
                  onChange={() => handleCheckboxToggle('redFlag', item.key)}
                  className="accent-rose-600"
                />
                <span>{item.label}</span>
              </label>
            );
          })}
        </div>
      </div>

      {/* 18. Clinical Assessment & Prescribed Treatment */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-6 space-y-4">
        <h3 className="text-base font-bold text-teal-800 border-b border-teal-100 pb-3 -mx-6 -mt-6 px-6 pt-4 bg-teal-50/40 rounded-t-2xl">
          18. Clinical Assessment & Treatment / क्लिनिकल मूल्यांकन व उपचार
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 pt-2">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Provisional Diagnosis / प्राथमिक निदान</label>
            <input
              id="diagnosis"
              type="text"
              value={formData.diagnosis}
              onChange={handleChange}
              placeholder="e.g. Migraine without aura"
              className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs focus:ring-2 focus:ring-teal-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Affected Area / प्रभावित भाग</label>
            <input
              id="affectedArea"
              type="text"
              value={formData.affectedArea}
              onChange={handleChange}
              placeholder="e.g. Right temporal / V1 cranial"
              className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs focus:ring-2 focus:ring-teal-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Severity / तीव्रता</label>
            <select
              id="clinicalSeverity"
              value={formData.clinicalSeverity}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs focus:ring-2 focus:ring-teal-500 focus:outline-none bg-white"
            >
              <option value="Mild">Mild / सौम्य</option>
              <option value="Moderate">Moderate / मध्यम</option>
              <option value="Severe">Severe / तीव्र</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Clinical Status / स्थिती</label>
            <select
              id="clinicalStatus"
              value={formData.clinicalStatus}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs focus:ring-2 focus:ring-teal-500 focus:outline-none bg-white"
            >
              <option value="Stable">Stable / स्थिर</option>
              <option value="Improving">Improving / सुधारणा</option>
              <option value="Worsening">Worsening / वाढते आहे</option>
              <option value="New Case">New Case / नवीन केस</option>
              <option value="Recurrent">Recurrent / वारंवार</option>
            </select>
          </div>

          <div className="sm:col-span-2 md:col-span-4">
            <label className="block text-xs font-bold text-slate-700 mb-1">Clinical Notes / क्लिनिकल नोंदी</label>
            <textarea
              id="clinicalNotes"
              rows={2}
              value={formData.clinicalNotes}
              onChange={handleChange}
              placeholder="Totality synthesis, miasmatic evaluation, physical generals..."
              className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs focus:ring-2 focus:ring-teal-500 focus:outline-none"
            />
          </div>

          <div className="sm:col-span-2">
            <label className="block text-xs font-bold text-slate-700 mb-1">Homeopathic Treatment / होमिओपॅथिक औषध</label>
            <input
              id="treatment"
              type="text"
              value={formData.treatment}
              onChange={handleChange}
              placeholder="Simillimum remedy, potency & dosage"
              className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs focus:ring-2 focus:ring-teal-500 focus:outline-none font-medium"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Diet & Lifestyle Advice / सल्ला</label>
            <input
              id="advice"
              type="text"
              value={formData.advice}
              onChange={handleChange}
              placeholder="Sleep, stress reduction, diet"
              className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs focus:ring-2 focus:ring-teal-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Follow-up Date / पुढील तारीख</label>
            <input
              id="followup"
              type="date"
              value={formData.followup}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs focus:ring-2 focus:ring-teal-500 focus:outline-none"
            />
          </div>
        </div>
      </div>

      {/* Sticky Bottom Actions Bar */}
      <div className="fixed bottom-0 left-0 right-0 z-30 bg-white/95 backdrop-blur-md border-t border-slate-200 py-3 px-4 shadow-lg">
        <div className="max-w-6xl mx-auto flex flex-wrap items-center justify-between gap-3">
          <div className="text-xs text-slate-600 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            <span>Neuro Case Mode &nbsp;|&nbsp; Patient: <strong>{formData.patientName || 'None'}</strong></span>
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
              className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-xs transition-colors"
            >
              <Save className="w-3.5 h-3.5" />
              <span>Save</span>
            </button>
            <button
              type="button"
              onClick={handleSubmit}
              className="px-6 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-sm transition-colors"
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
