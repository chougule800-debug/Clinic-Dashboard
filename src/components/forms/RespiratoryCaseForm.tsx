import React, { useState, useEffect } from 'react';
import { useClinic } from '../../context/ClinicContext';
import {
  Wind,
  Save,
  CheckCircle2,
  RotateCcw,
  Printer,
  FileText,
  AlertTriangle,
  Upload,
  X,
  User,
  HeartPulse,
  Activity
} from 'lucide-react';

export interface RespiratoryFormData {
  // 1. Patient Information
  patientName: string;
  age: string;
  date: string;
  patientId: string;
  sex: string;
  occupation: string;
  contact: string;
  address: string;

  // 2. Respiratory Chief Complaints
  complaints: string[];
  sinceWhen: string;
  frequency: string;
  severity: string;
  complaintDetails: string;

  // 3. Allergy & Allergic Rhinitis
  allergySymptoms: string[];
  triggers: string[];
  seasonal: string;
  allergyTime: string;
  allergyDetails: string;

  // 4. Asthma History
  asthmaDiagnosis: string;
  asthmaOnset: string;
  asthmaDuration: string;
  attackFrequency: string;
  lastAttack: string;
  nightSymptoms: string;
  asthmaFeatures: string[];
  attackPattern: string;

  // 5. Triggers & Modalities
  worse: string[];
  better: string[];

  // 6. Previous Treatment & Emergency History
  treatment: string[];
  hospitalization: string;
  emergency: string;
  oxygen: string;
  treatmentDetails: string;

  // 7. Past & Family History
  past: string[];
  family: string[];
  smokingExposure: string;
  passiveSmoke: string;
  occupationalExposure: string;
  pastFamilyDetails: string;

  // 8. Examination
  pulse: string;
  bp: string;
  spo2: string;
  respRate: string;
  temperature: string;
  peakFlow: string;
  exam: string[];
  examNotes: string;

  // 9. Investigations & Reports
  investigation: string[];
  investigationDate: string;
  reportFinding: string;
  investigationNotes: string;
  reportFiles: { name: string; type: string; data: string | null }[];

  // 10. Assessment & Follow-up
  assessment: string;
  diagnosis: string;
  followupDate: string;
  doctorNotes: string;

  savedAt?: string;
}

const INITIAL_RESPIRATORY_DATA: RespiratoryFormData = {
  patientName: '',
  age: '',
  date: new Date().toISOString().split('T')[0],
  patientId: '',
  sex: 'Male / पुरुष',
  occupation: '',
  contact: '',
  address: '',

  complaints: [],
  sinceWhen: '',
  frequency: '',
  severity: 'Moderate / मध्यम',
  complaintDetails: '',

  allergySymptoms: [],
  triggers: [],
  seasonal: 'No specific pattern / ठराविक नाही',
  allergyTime: '',
  allergyDetails: '',

  asthmaDiagnosis: 'No / नाही',
  asthmaOnset: '',
  asthmaDuration: '',
  attackFrequency: '',
  lastAttack: '',
  nightSymptoms: 'No / नाही',
  asthmaFeatures: [],
  attackPattern: '',

  worse: [],
  better: [],

  treatment: [],
  hospitalization: 'No / नाही',
  emergency: 'No / नाही',
  oxygen: 'No / नाही',
  treatmentDetails: '',

  past: [],
  family: [],
  smokingExposure: '',
  passiveSmoke: '',
  occupationalExposure: '',
  pastFamilyDetails: '',

  pulse: '72',
  bp: '120/80',
  spo2: '98%',
  respRate: '18',
  temperature: '98.6°F',
  peakFlow: '',
  exam: [],
  examNotes: '',

  investigation: [],
  investigationDate: '',
  reportFinding: '',
  investigationNotes: '',
  reportFiles: [],

  assessment: '',
  diagnosis: '',
  followupDate: '',
  doctorNotes: ''
};

export const RespiratoryCaseForm: React.FC = () => {
  const {
    selectedPatient,
    patients,
    selectPatient,
    saveSystemForm,
    systemForms,
    setActiveTab
  } = useClinic();

  const [formData, setFormData] = useState<RespiratoryFormData>(INITIAL_RESPIRATORY_DATA);
  const [statusMessage, setStatusMessage] = useState<string>('');
  const [statusType, setStatusType] = useState<'success' | 'error' | 'info'>('info');

  useEffect(() => {
    if (selectedPatient) {
      const existing = systemForms.find(
        f => f.patientId === selectedPatient.id && f.system === 'respiratory'
      );

      if (existing && existing.data && Object.keys(existing.data).length > 0) {
        setFormData({
          ...INITIAL_RESPIRATORY_DATA,
          ...existing.data,
          patientName: selectedPatient.name,
          age: String(selectedPatient.age || ''),
          sex: selectedPatient.gender === 'Female' ? 'Female / महिला' : 'Male / पुरुष',
          patientId: selectedPatient.id,
          contact: selectedPatient.mobile || '',
          address: selectedPatient.address || existing.data.address || '',
          date: existing.data.date || new Date().toISOString().split('T')[0]
        });
        return;
      }

      try {
        const stored = localStorage.getItem(`arogyaRespiratoryCase_${selectedPatient.id}`);
        if (stored) {
          const parsed = JSON.parse(stored);
          setFormData(prev => ({
            ...prev,
            ...parsed,
            patientName: selectedPatient.name,
            age: String(selectedPatient.age || ''),
            sex: selectedPatient.gender === 'Female' ? 'Female / महिला' : 'Male / पुरुष',
            patientId: selectedPatient.id,
            contact: selectedPatient.mobile || '',
            address: selectedPatient.address || ''
          }));
          return;
        }
      } catch (_) {}

      setFormData({
        ...INITIAL_RESPIRATORY_DATA,
        patientName: selectedPatient.name,
        age: String(selectedPatient.age || ''),
        sex: selectedPatient.gender === 'Female' ? 'Female / महिला' : 'Male / पुरुष',
        patientId: selectedPatient.id,
        contact: selectedPatient.mobile || '',
        address: selectedPatient.address || '',
        date: new Date().toISOString().split('T')[0],
        pulse: selectedPatient.vitals.pulse ? String(selectedPatient.vitals.pulse) : '72',
        bp: `${selectedPatient.vitals.bpSystolic}/${selectedPatient.vitals.bpDiastolic}`,
        spo2: selectedPatient.vitals.spo2 ? `${selectedPatient.vitals.spo2}%` : '98%',
        respRate: selectedPatient.vitals.respiratoryRate ? String(selectedPatient.vitals.respiratoryRate) : '18',
        temperature: selectedPatient.vitals.temperature ? `${selectedPatient.vitals.temperature}°F` : '98.6°F'
      });
    }
  }, [selectedPatient?.id, systemForms]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleCheckboxToggle = (category: keyof RespiratoryFormData, value: string) => {
    setFormData(prev => {
      const currentList = (prev[category] as string[]) || [];
      const updated = currentList.includes(value)
        ? currentList.filter(item => item !== value)
        : [...currentList, value];
      return { ...prev, [category]: updated };
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
      localStorage.setItem(`arogyaRespiratoryCase_${selectedPatient.id}`, JSON.stringify(updatedData));
    }
    localStorage.setItem('arogyaRespiratoryCase_' + (formData.patientId || formData.patientName || Date.now()), JSON.stringify(updatedData));

    const chiefComplaintsText = [
      formData.complaints?.length ? `Complaints: ${formData.complaints.join(', ')}` : '',
      formData.allergySymptoms?.length ? `Allergies: ${formData.allergySymptoms.join(', ')}` : '',
      formData.asthmaFeatures?.length ? `Asthma: ${formData.asthmaFeatures.join(', ')}` : '',
      formData.sinceWhen ? `Since: ${formData.sinceWhen}` : '',
      formData.frequency ? `Frequency: ${formData.frequency}` : ''
    ].filter(Boolean).join(' • ');

    const modalitiesAgg = formData.worse?.join(', ') || 'Cold air, dust, night, weather change';
    const modalitiesAmel = formData.better?.join(', ') || 'Fresh air, warmth, sitting, steam';

    if (selectedPatient) {
      saveSystemForm({
        patientId: selectedPatient.id,
        system: 'respiratory',
        chiefComplaints: chiefComplaintsText || 'Respiratory & Allergy Case Taking',
        duration: formData.sinceWhen || formData.asthmaDuration || 'Recorded Case',
        severity: formData.severity?.includes('Severe') ? 'Severe' : formData.severity?.includes('Mild') ? 'Mild' : 'Moderate',
        modalitiesAggravation: modalitiesAgg,
        modalitiesAmelioration: modalitiesAmel,
        concomitants: formData.triggers?.join(', ') || formData.allergyTime || '',
        clinicalNotes: formData.doctorNotes || formData.diagnosis || formData.assessment || '',
        data: updatedData,
        submittedVia: 'Doctor_Dashboard'
      });
    }

    setStatusMessage('✓ Respiratory Case Saved Successfully / केस यशस्वीरित्या जतन केला. Synced to Case Summary.');
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
    if (window.confirm('Clear all information? / सर्व माहिती साफ करायची का?')) {
      setFormData(INITIAL_RESPIRATORY_DATA);
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
          <div className="w-10 h-10 rounded-xl bg-teal-600 text-white flex items-center justify-center font-bold shadow-xs">
            <Wind className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs uppercase font-bold tracking-wider px-2 py-0.5 rounded-md bg-teal-50 text-teal-800 border border-teal-200">
                Respiratory & Allergy Specialist Form
              </span>
              <span className="text-[11px] text-slate-400 font-medium">श्वसन • अॅलर्जी • दमा</span>
            </div>
            <h2 className="text-sm font-bold text-slate-900 mt-0.5">
              Active Patient: <strong className="text-teal-900 font-serif">{formData.patientName || 'No Patient Selected'}</strong>
              {formData.patientId && <span className="text-slate-400 font-normal"> ({formData.patientId})</span>}
            </h2>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <select
            value={selectedPatient?.id || ''}
            onChange={(e) => selectPatient(e.target.value)}
            className="text-xs border border-slate-300 rounded-xl px-3 py-2 bg-slate-50 text-slate-800 focus:outline-none focus:ring-2 focus:ring-teal-500 font-medium"
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
            <FileText className="w-3.5 h-3.5 text-teal-700" />
            <span>Case Summary</span>
          </button>
        </div>
      </div>

      {/* Header Banner matching template */}
      <div className="bg-gradient-to-r from-[#087f5b] to-[#16a085] text-white p-6 rounded-2xl shadow-sm text-center">
        <h1 className="text-xl sm:text-2xl font-bold font-serif">Dr. Bharat's Arogya Homeopathy</h1>
        <p className="text-xs sm:text-sm text-teal-100 mt-1">
          Respiratory • Allergy • Asthma Case Taking / श्वसन • अॅलर्जी • दमा केस टेकिंग
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

      {/* Section 1: Patient Information */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4">
        <h2 className="text-sm font-bold text-[#086b4d] bg-[#e8f6f1] -mx-6 -mt-6 px-6 py-3 rounded-t-2xl flex items-center gap-2">
          <span>👤</span> 1. Patient Information / रुग्णाची माहिती
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5 text-xs">
          <div className="space-y-1">
            <label className="font-bold text-slate-700">Patient Name / रुग्णाचे नाव</label>
            <input
              name="patientName"
              value={formData.patientName}
              onChange={handleChange}
              className="w-full border border-slate-300 rounded-lg p-2 text-slate-900 focus:outline-none focus:ring-2 focus:ring-teal-500"
              required
            />
          </div>
          <div className="space-y-1">
            <label className="font-bold text-slate-700">Age / वय</label>
            <input
              name="age"
              type="number"
              step="0.1"
              value={formData.age}
              onChange={handleChange}
              className="w-full border border-slate-300 rounded-lg p-2 text-slate-900 focus:outline-none focus:ring-2 focus:ring-teal-500"
            />
          </div>
          <div className="space-y-1">
            <label className="font-bold text-slate-700">Date / दिनांक</label>
            <input
              name="date"
              type="date"
              value={formData.date}
              onChange={handleChange}
              className="w-full border border-slate-300 rounded-lg p-2 text-slate-900 focus:outline-none focus:ring-2 focus:ring-teal-500"
            />
          </div>
          <div className="space-y-1">
            <label className="font-bold text-slate-700">Patient ID / रुग्ण आयडी</label>
            <input
              name="patientId"
              value={formData.patientId}
              onChange={handleChange}
              className="w-full border border-slate-300 rounded-lg p-2 text-slate-900 focus:outline-none focus:ring-2 focus:ring-teal-500"
            />
          </div>
          <div className="space-y-1">
            <label className="font-bold text-slate-700">Sex / लिंग</label>
            <select
              name="sex"
              value={formData.sex}
              onChange={handleChange}
              className="w-full border border-slate-300 rounded-lg p-2 text-slate-900 focus:outline-none focus:ring-2 focus:ring-teal-500"
            >
              <option value="Male / पुरुष">Male / पुरुष</option>
              <option value="Female / महिला">Female / महिला</option>
              <option value="Other / इतर">Other / इतर</option>
            </select>
          </div>
          <div className="space-y-1">
            <label className="font-bold text-slate-700">Occupation / व्यवसाय</label>
            <input
              name="occupation"
              value={formData.occupation}
              onChange={handleChange}
              className="w-full border border-slate-300 rounded-lg p-2 text-slate-900 focus:outline-none focus:ring-2 focus:ring-teal-500"
            />
          </div>
          <div className="space-y-1">
            <label className="font-bold text-slate-700">Contact / संपर्क क्रमांक</label>
            <input
              name="contact"
              type="tel"
              value={formData.contact}
              onChange={handleChange}
              className="w-full border border-slate-300 rounded-lg p-2 text-slate-900 focus:outline-none focus:ring-2 focus:ring-teal-500"
            />
          </div>
          <div className="sm:col-span-2 space-y-1">
            <label className="font-bold text-slate-700">Address / पत्ता</label>
            <textarea
              name="address"
              rows={1}
              value={formData.address}
              onChange={handleChange}
              className="w-full border border-slate-300 rounded-lg p-2 text-slate-900 focus:outline-none focus:ring-2 focus:ring-teal-500"
            />
          </div>
        </div>
      </div>

      {/* Section 2: Respiratory Chief Complaints */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4">
        <h2 className="text-sm font-bold text-[#086b4d] bg-[#e8f6f1] -mx-6 -mt-6 px-6 py-3 rounded-t-2xl flex items-center gap-2">
          <span>🫁</span> 2. Respiratory Chief Complaints / श्वसनाच्या मुख्य तक्रारी
        </h2>

        <div>
          <label className="font-bold text-slate-800 text-xs block mb-2">
            Quick Complaint Selection / तक्रारींची जलद निवड
          </label>
          <div className="flex flex-wrap gap-2">
            {[
              'Cough / खोकला',
              'Dry cough / कोरडा खोकला',
              'Productive cough / कफासह खोकला',
              'Breathlessness / श्वास लागणे',
              'Wheezing / घरघर',
              'Chest tightness / छातीत आवळल्यासारखे',
              'Chest pain / छातीत दुखणे',
              'Sore throat / घसा दुखणे',
              'Hoarseness / आवाज बसणे',
              'Recurrent cold / वारंवार सर्दी',
              'Recurrent bronchitis / वारंवार ब्रॉन्कायटिस',
              'Snoring / घोरणे'
            ].map(item => {
              const active = formData.complaints.includes(item);
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
                    onChange={() => handleCheckboxToggle('complaints', item)}
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
            <label className="font-bold text-slate-700">Since When / केव्हापासून</label>
            <input
              name="sinceWhen"
              value={formData.sinceWhen}
              onChange={handleChange}
              placeholder="e.g. 2 months / since last winter"
              className="w-full border border-slate-300 rounded-lg p-2 text-slate-900 focus:outline-none"
            />
          </div>
          <div className="space-y-1">
            <label className="font-bold text-slate-700">Frequency / वारंवारता</label>
            <input
              name="frequency"
              value={formData.frequency}
              onChange={handleChange}
              placeholder="e.g. Daily / Continuous bouts / 2-3 episodes per week"
              className="w-full border border-slate-300 rounded-lg p-2 text-slate-900 focus:outline-none"
            />
          </div>
          <div className="space-y-1">
            <label className="font-bold text-slate-700">Severity / तीव्रता</label>
            <select
              name="severity"
              value={formData.severity}
              onChange={handleChange}
              className="w-full border border-slate-300 rounded-lg p-2 text-slate-900 focus:outline-none"
            >
              <option value="Mild / सौम्य">Mild / सौम्य</option>
              <option value="Moderate / मध्यम">Moderate / मध्यम</option>
              <option value="Severe / तीव्र">Severe / तीव्र</option>
            </select>
          </div>

          <div className="sm:col-span-3 space-y-1">
            <label className="font-bold text-slate-700">
              Complaint Details — Location, Sensation, Modalities, Concomitants / तक्रारीचे सविस्तर वर्णन
            </label>
            <textarea
              name="complaintDetails"
              rows={3}
              value={formData.complaintDetails}
              onChange={handleChange}
              placeholder="Describe exact sensation (tickling in throat-pit, burning behind sternum, stitching pain on deep breath)..."
              className="w-full border border-slate-300 rounded-lg p-2.5 text-slate-900 focus:outline-none"
            />
          </div>
        </div>
      </div>

      {/* Section 3: Allergy & Allergic Rhinitis */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4">
        <h2 className="text-sm font-bold text-[#086b4d] bg-[#e8f6f1] -mx-6 -mt-6 px-6 py-3 rounded-t-2xl flex items-center gap-2">
          <span>🤧</span> 3. Allergy & Allergic Rhinitis / अॅलर्जी व अॅलर्जिक राइनायटिस
        </h2>

        <div>
          <label className="font-bold text-slate-800 text-xs block mb-2">
            Allergic Symptoms — Quick Check / अॅलर्जीची लक्षणे — जलद निवड
          </label>
          <div className="flex flex-wrap gap-2">
            {[
              'Sneezing / शिंका',
              'Nasal blockage / नाक बंद',
              'Watery discharge / पाण्यासारखा स्त्राव',
              'Thick discharge / घट्ट स्त्राव',
              'Nasal itching / नाक खाजणे',
              'Eye itching / डोळे खाजणे',
              'Watery eyes / डोळ्यातून पाणी',
              'Postnasal drip / नाकातील स्त्राव घशात जाणे',
              'Itchy throat / घसा खाजणे',
              'Skin allergy / त्वचेची अॅलर्जी',
              'Urticaria / पित्त'
            ].map(item => {
              const active = formData.allergySymptoms.includes(item);
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
                    onChange={() => handleCheckboxToggle('allergySymptoms', item)}
                    className="rounded text-teal-600"
                  />
                  <span>{item}</span>
                </label>
              );
            })}
          </div>
        </div>

        <div className="pt-2">
          <label className="font-bold text-slate-800 text-xs block mb-2">
            Possible Triggers — Quick Check / संभाव्य कारणे — जलद निवड
          </label>
          <div className="flex flex-wrap gap-2">
            {[
              'Dust / धूळ',
              'Pollen / परागकण',
              'House dust mites / घरातील धूळकण',
              'Pet dander / पाळीव प्राण्यांचे केस',
              'Smoke / धूर',
              'Perfume / परफ्यूम',
              'Cold air / थंड हवा',
              'Weather change / हवामान बदल',
              'Food / अन्न',
              'Chemical exposure / रसायनांचा संपर्क',
              'Occupational exposure / कामाच्या ठिकाणी संपर्क'
            ].map(item => {
              const active = formData.triggers.includes(item);
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
                    onChange={() => handleCheckboxToggle('triggers', item)}
                    className="rounded text-teal-600"
                  />
                  <span>{item}</span>
                </label>
              );
            })}
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 text-xs pt-2">
          <div className="space-y-1">
            <label className="font-bold text-slate-700">Seasonal Pattern / ऋतूनुसार बदल</label>
            <select
              name="seasonal"
              value={formData.seasonal}
              onChange={handleChange}
              className="w-full border border-slate-300 rounded-lg p-2 text-slate-900 focus:outline-none"
            >
              <option value="No specific pattern / ठराविक नाही">No specific pattern / ठराविक नाही</option>
              <option value="Winter / हिवाळा">Winter / हिवाळा</option>
              <option value="Summer / उन्हाळा">Summer / उन्हाळा</option>
              <option value="Monsoon / पावसाळा">Monsoon / पावसाळा</option>
              <option value="Spring / वसंत">Spring / वसंत</option>
            </select>
          </div>
          <div className="space-y-1">
            <label className="font-bold text-slate-700">Time of Day / दिवसातील वेळ</label>
            <input
              name="allergyTime"
              value={formData.allergyTime}
              onChange={handleChange}
              placeholder="e.g. Early morning on waking, midnight, evening"
              className="w-full border border-slate-300 rounded-lg p-2 text-slate-900 focus:outline-none"
            />
          </div>
          <div className="sm:col-span-2 space-y-1">
            <label className="font-bold text-slate-700">Allergy Details / अॅलर्जीची सविस्तर माहिती</label>
            <textarea
              name="allergyDetails"
              rows={2}
              value={formData.allergyDetails}
              onChange={handleChange}
              placeholder="Specific dust allergy, perfume sensitivity, skin flare details..."
              className="w-full border border-slate-300 rounded-lg p-2 text-slate-900 focus:outline-none"
            />
          </div>
        </div>
      </div>

      {/* Section 4: Asthma History */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4">
        <h2 className="text-sm font-bold text-[#086b4d] bg-[#e8f6f1] -mx-6 -mt-6 px-6 py-3 rounded-t-2xl flex items-center gap-2">
          <span>🫁</span> 4. Asthma History / दम्याचा इतिहास
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5 text-xs">
          <div className="space-y-1">
            <label className="font-bold text-slate-700">Asthma Diagnosis / दम्याचे निदान</label>
            <select
              name="asthmaDiagnosis"
              value={formData.asthmaDiagnosis}
              onChange={handleChange}
              className="w-full border border-slate-300 rounded-lg p-2 text-slate-900 focus:outline-none"
            >
              <option value="No / नाही">No / नाही</option>
              <option value="Yes / होय">Yes / होय</option>
              <option value="Suspected / संशयित">Suspected / संशयित</option>
            </select>
          </div>
          <div className="space-y-1">
            <label className="font-bold text-slate-700">Age at Onset / सुरुवातीचे वय</label>
            <input
              name="asthmaOnset"
              value={formData.asthmaOnset}
              onChange={handleChange}
              placeholder="e.g. 14 years"
              className="w-full border border-slate-300 rounded-lg p-2 text-slate-900 focus:outline-none"
            />
          </div>
          <div className="space-y-1">
            <label className="font-bold text-slate-700">Duration / कालावधी</label>
            <input
              name="asthmaDuration"
              value={formData.asthmaDuration}
              onChange={handleChange}
              placeholder="e.g. 5 years"
              className="w-full border border-slate-300 rounded-lg p-2 text-slate-900 focus:outline-none"
            />
          </div>
          <div className="space-y-1">
            <label className="font-bold text-slate-700">Attack Frequency / झटक्यांची वारंवारता</label>
            <input
              name="attackFrequency"
              value={formData.attackFrequency}
              onChange={handleChange}
              placeholder="e.g. 2 times a month, during season change"
              className="w-full border border-slate-300 rounded-lg p-2 text-slate-900 focus:outline-none"
            />
          </div>
          <div className="space-y-1">
            <label className="font-bold text-slate-700">Last Attack / शेवटचा झटका</label>
            <input
              name="lastAttack"
              type="date"
              value={formData.lastAttack}
              onChange={handleChange}
              className="w-full border border-slate-300 rounded-lg p-2 text-slate-900 focus:outline-none"
            />
          </div>
          <div className="space-y-1">
            <label className="font-bold text-slate-700">Night Symptoms / रात्रीची लक्षणे</label>
            <select
              name="nightSymptoms"
              value={formData.nightSymptoms}
              onChange={handleChange}
              className="w-full border border-slate-300 rounded-lg p-2 text-slate-900 focus:outline-none"
            >
              <option value="No / नाही">No / नाही</option>
              <option value="Yes / होय">Yes / होय</option>
              <option value="Occasional / कधीकधी">Occasional / कधीकधी</option>
            </select>
          </div>
        </div>

        <div className="pt-2">
          <label className="font-bold text-slate-800 text-xs block mb-2">
            Asthma Features — Quick Check / दम्याची लक्षणे — जलद निवड
          </label>
          <div className="flex flex-wrap gap-2">
            {[
              'Wheezing / घरघर',
              'Breathlessness / श्वास लागणे',
              'Chest tightness / छातीत आवळणे',
              'Cough at night / रात्री खोकला',
              'Early morning symptoms / पहाटेची लक्षणे',
              'Exercise induced / व्यायामामुळे',
              'Cold air induced / थंड हवेमुळे',
              'Seasonal attacks / ऋतुनुसार झटके'
            ].map(item => {
              const active = formData.asthmaFeatures.includes(item);
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
                    onChange={() => handleCheckboxToggle('asthmaFeatures', item)}
                    className="rounded text-teal-600"
                  />
                  <span>{item}</span>
                </label>
              );
            })}
          </div>
        </div>

        <div className="space-y-1 text-xs pt-1">
          <label className="font-bold text-slate-700">Attack Pattern & Modalities / झटक्यांचा नमुना व बदल</label>
          <textarea
            name="attackPattern"
            rows={2}
            value={formData.attackPattern}
            onChange={handleChange}
            placeholder="e.g. Awakens around 2 AM to 4 AM with suffocative feeling, must sit leaning forward..."
            className="w-full border border-slate-300 rounded-lg p-2 text-slate-900 focus:outline-none"
          />
        </div>
      </div>

      {/* Section 5: Triggers & Modalities */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4">
        <h2 className="text-sm font-bold text-[#086b4d] bg-[#e8f6f1] -mx-6 -mt-6 px-6 py-3 rounded-t-2xl flex items-center gap-2">
          <span>🌦️</span> 5. Triggers & Modalities / कारणे व बदल
        </h2>

        <div>
          <label className="font-bold text-rose-800 text-xs block mb-2">
            What Makes It Worse? / कशामुळे त्रास वाढतो? (Aggravation)
          </label>
          <div className="flex flex-wrap gap-2">
            {[
              'Cold air / थंड हवा',
              'Warm room / उबदार खोली',
              'Dust / धूळ',
              'Lying down / झोपल्यावर',
              'Night / रात्री',
              'Morning / सकाळी',
              'Exercise / व्यायाम',
              'Weather change / हवामान बदल',
              'Smoke / धूर'
            ].map(item => {
              const active = formData.worse.includes(item);
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
                    onChange={() => handleCheckboxToggle('worse', item)}
                    className="rounded text-rose-600"
                  />
                  <span>{item}</span>
                </label>
              );
            })}
          </div>
        </div>

        <div className="pt-2">
          <label className="font-bold text-emerald-800 text-xs block mb-2">
            What Makes It Better? / कशामुळे आराम मिळतो? (Amelioration)
          </label>
          <div className="flex flex-wrap gap-2">
            {[
              'Fresh air / मोकळी हवा',
              'Warmth / उब',
              'Sitting / बसल्यावर',
              'Open air / मोकळ्या हवेत',
              'Steam / वाफ',
              'Medication / औषधाने',
              'Rest / विश्रांती'
            ].map(item => {
              const active = formData.better.includes(item);
              return (
                <label
                  key={item}
                  className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs cursor-pointer border transition-all ${
                    active
                      ? 'bg-emerald-50 border-emerald-400 text-emerald-900 font-semibold shadow-2xs'
                      : 'bg-[#f1f6f4] border-transparent text-slate-700 hover:border-slate-300'
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={active}
                    onChange={() => handleCheckboxToggle('better', item)}
                    className="rounded text-emerald-600"
                  />
                  <span>{item}</span>
                </label>
              );
            })}
          </div>
        </div>
      </div>

      {/* Section 6: Previous Treatment & Emergency History */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4">
        <h2 className="text-sm font-bold text-[#086b4d] bg-[#e8f6f1] -mx-6 -mt-6 px-6 py-3 rounded-t-2xl flex items-center gap-2">
          <span>💊</span> 6. Previous Treatment & Emergency History / पूर्वीचे उपचार व आपत्कालीन इतिहास
        </h2>

        <div>
          <label className="font-bold text-slate-800 text-xs block mb-2">
            Treatment Used — Quick Check / वापरलेले उपचार — जलद निवड
          </label>
          <div className="flex flex-wrap gap-2">
            {[
              'Inhaler / इनहेलर',
              'Nebulization / नेब्युलायझेशन',
              'Antihistamine / अँटीहिस्टामिन',
              'Steroid / स्टेरॉइड',
              'Antibiotic / अँटिबायोटिक',
              'Homeopathy / होमिओपॅथी',
              'Other / इतर'
            ].map(item => {
              const active = formData.treatment.includes(item);
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
                    onChange={() => handleCheckboxToggle('treatment', item)}
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
            <label className="font-bold text-slate-700">Hospitalization / रुग्णालयात दाखल</label>
            <select
              name="hospitalization"
              value={formData.hospitalization}
              onChange={handleChange}
              className="w-full border border-slate-300 rounded-lg p-2 text-slate-900 focus:outline-none"
            >
              <option value="No / नाही">No / नाही</option>
              <option value="Yes / होय">Yes / होय</option>
            </select>
          </div>
          <div className="space-y-1">
            <label className="font-bold text-slate-700">Emergency Visit / आपत्कालीन भेट</label>
            <select
              name="emergency"
              value={formData.emergency}
              onChange={handleChange}
              className="w-full border border-slate-300 rounded-lg p-2 text-slate-900 focus:outline-none"
            >
              <option value="No / नाही">No / नाही</option>
              <option value="Yes / होय">Yes / होय</option>
            </select>
          </div>
          <div className="space-y-1">
            <label className="font-bold text-slate-700">Oxygen Required / ऑक्सिजन लागला का?</label>
            <select
              name="oxygen"
              value={formData.oxygen}
              onChange={handleChange}
              className="w-full border border-slate-300 rounded-lg p-2 text-slate-900 focus:outline-none"
            >
              <option value="No / नाही">No / नाही</option>
              <option value="Yes / होय">Yes / होय</option>
            </select>
          </div>

          <div className="sm:col-span-3 space-y-1">
            <label className="font-bold text-slate-700">
              Previous Treatment & Response / पूर्वीचे उपचार व प्रतिसाद
            </label>
            <textarea
              name="treatmentDetails"
              rows={2}
              value={formData.treatmentDetails}
              onChange={handleChange}
              placeholder="Name of inhalers (e.g. Budecort, Foracort, Asthalin), response duration..."
              className="w-full border border-slate-300 rounded-lg p-2 text-slate-900 focus:outline-none"
            />
          </div>
        </div>
      </div>

      {/* Section 7: Past & Family History */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4">
        <h2 className="text-sm font-bold text-[#086b4d] bg-[#e8f6f1] -mx-6 -mt-6 px-6 py-3 rounded-t-2xl flex items-center gap-2">
          <span>👨‍👩‍👧</span> 7. Past & Family History / पूर्व व कौटुंबिक इतिहास
        </h2>

        <div>
          <label className="font-bold text-slate-800 text-xs block mb-2">
            Past History — Quick Check / पूर्व इतिहास — जलद निवड
          </label>
          <div className="flex flex-wrap gap-2">
            {[
              'Recurrent infections / वारंवार संसर्ग',
              'Pneumonia / न्यूमोनिया',
              'Tuberculosis / क्षयरोग',
              'Sinusitis / सायनस',
              'Eczema / एक्झिमा',
              'Food allergy / अन्नाची अॅलर्जी'
            ].map(item => {
              const active = formData.past.includes(item);
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
                    onChange={() => handleCheckboxToggle('past', item)}
                    className="rounded text-teal-600"
                  />
                  <span>{item}</span>
                </label>
              );
            })}
          </div>
        </div>

        <div className="pt-2">
          <label className="font-bold text-slate-800 text-xs block mb-2">
            Family History — Quick Check / कौटुंबिक इतिहास — जलद निवड
          </label>
          <div className="flex flex-wrap gap-2">
            {[
              'Asthma / दमा',
              'Allergic rhinitis / अॅलर्जिक राइनायटिस',
              'Eczema / एक्झिमा',
              'Other allergy / इतर अॅलर्जी'
            ].map(item => {
              const active = formData.family.includes(item);
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
                    onChange={() => handleCheckboxToggle('family', item)}
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
            <label className="font-bold text-slate-700">Smoking / Tobacco Exposure / धूम्रपान / तंबाखू संपर्क</label>
            <input
              name="smokingExposure"
              value={formData.smokingExposure}
              onChange={handleChange}
              placeholder="e.g. Non-smoker / Ex-smoker / 5 beedis daily"
              className="w-full border border-slate-300 rounded-lg p-2 text-slate-900 focus:outline-none"
            />
          </div>
          <div className="space-y-1">
            <label className="font-bold text-slate-700">Passive Smoke / अप्रत्यक्ष धूर</label>
            <input
              name="passiveSmoke"
              value={formData.passiveSmoke}
              onChange={handleChange}
              placeholder="e.g. Family member smokes indoors"
              className="w-full border border-slate-300 rounded-lg p-2 text-slate-900 focus:outline-none"
            />
          </div>
          <div className="space-y-1">
            <label className="font-bold text-slate-700">Occupational Exposure / व्यावसायिक संपर्क</label>
            <input
              name="occupationalExposure"
              value={formData.occupationalExposure}
              onChange={handleChange}
              placeholder="e.g. Textile mill dust, paint fumes, bakery flour"
              className="w-full border border-slate-300 rounded-lg p-2 text-slate-900 focus:outline-none"
            />
          </div>
          <div className="sm:col-span-3 space-y-1">
            <label className="font-bold text-slate-700">Past & Family Details / पूर्व व कौटुंबिक सविस्तर माहिती</label>
            <textarea
              name="pastFamilyDetails"
              rows={2}
              value={formData.pastFamilyDetails}
              onChange={handleChange}
              placeholder="Details on parents, siblings, past respiratory hospitalizations..."
              className="w-full border border-slate-300 rounded-lg p-2 text-slate-900 focus:outline-none"
            />
          </div>
        </div>
      </div>

      {/* Section 8: Examination */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4">
        <h2 className="text-sm font-bold text-[#086b4d] bg-[#e8f6f1] -mx-6 -mt-6 px-6 py-3 rounded-t-2xl flex items-center gap-2">
          <span>🩺</span> 8. Examination / क्लिनिकल तपासणी
        </h2>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3 text-xs">
          <div className="space-y-1">
            <label className="font-bold text-slate-700">Pulse / नाडी</label>
            <input
              name="pulse"
              value={formData.pulse}
              onChange={handleChange}
              placeholder="72 bpm"
              className="w-full border border-slate-300 rounded-lg p-2 text-slate-900 focus:outline-none"
            />
          </div>
          <div className="space-y-1">
            <label className="font-bold text-slate-700">BP / रक्तदाब</label>
            <input
              name="bp"
              value={formData.bp}
              onChange={handleChange}
              placeholder="120/80"
              className="w-full border border-slate-300 rounded-lg p-2 text-slate-900 focus:outline-none"
            />
          </div>
          <div className="space-y-1">
            <label className="font-bold text-slate-700">SpO₂ / ऑक्सिजन</label>
            <input
              name="spo2"
              value={formData.spo2}
              onChange={handleChange}
              placeholder="98%"
              className="w-full border border-slate-300 rounded-lg p-2 text-slate-900 focus:outline-none"
            />
          </div>
          <div className="space-y-1">
            <label className="font-bold text-slate-700">Resp Rate / श्वसन दर</label>
            <input
              name="respRate"
              value={formData.respRate}
              onChange={handleChange}
              placeholder="18 /min"
              className="w-full border border-slate-300 rounded-lg p-2 text-slate-900 focus:outline-none"
            />
          </div>
          <div className="space-y-1">
            <label className="font-bold text-slate-700">Temperature / तापमान</label>
            <input
              name="temperature"
              value={formData.temperature}
              onChange={handleChange}
              placeholder="98.6°F"
              className="w-full border border-slate-300 rounded-lg p-2 text-slate-900 focus:outline-none"
            />
          </div>
          <div className="space-y-1">
            <label className="font-bold text-slate-700">Peak Flow / पीक फ्लो</label>
            <input
              name="peakFlow"
              value={formData.peakFlow}
              onChange={handleChange}
              placeholder="e.g. 420 L/min"
              className="w-full border border-slate-300 rounded-lg p-2 text-slate-900 focus:outline-none"
            />
          </div>
        </div>

        <div className="pt-2">
          <label className="font-bold text-slate-800 text-xs block mb-2">
            Chest Examination / छातीची तपासणी
          </label>
          <div className="flex flex-wrap gap-2">
            {[
              'Normal air entry / सामान्य हवा प्रवेश',
              'Wheeze / घरघर',
              'Crepitations / क्रेपिटेशन्स',
              'Rhonchi / रॉन्काय',
              'Reduced air entry / हवा प्रवेश कमी'
            ].map(item => {
              const active = formData.exam.includes(item);
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
                    onChange={() => handleCheckboxToggle('exam', item)}
                    className="rounded text-teal-600"
                  />
                  <span>{item}</span>
                </label>
              );
            })}
          </div>
        </div>

        <div className="space-y-1 text-xs pt-1">
          <label className="font-bold text-slate-700">Other Examination Findings / इतर तपासणी निष्कर्ष</label>
          <textarea
            name="examNotes"
            rows={2}
            value={formData.examNotes}
            onChange={handleChange}
            placeholder="Throat congestion, nasal turbinate hypertrophy, allergic shiners..."
            className="w-full border border-slate-300 rounded-lg p-2 text-slate-900 focus:outline-none"
          />
        </div>
      </div>

      {/* Section 9: Investigations & Reports */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4">
        <h2 className="text-sm font-bold text-[#086b4d] bg-[#e8f6f1] -mx-6 -mt-6 px-6 py-3 rounded-t-2xl flex items-center gap-2">
          <span>🧪</span> 9. Investigations & Reports / तपासण्या व रिपोर्ट
        </h2>

        <div>
          <label className="font-bold text-slate-800 text-xs block mb-2">
            Investigation Quick Check / तपासण्यांची जलद निवड
          </label>
          <div className="flex flex-wrap gap-2">
            {[
              'CBC / CBC',
              'CRP / CRP',
              'IgE / IgE',
              'Chest X-ray / छातीचा X-ray',
              'Spirometry / स्पायरोमेट्री',
              'Peak Flow / पीक फ्लो',
              'Allergy testing / अॅलर्जी तपासणी',
              'ECG / ECG',
              'CT Chest / CT छाती',
              'Other / इतर'
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

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 text-xs pt-2">
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
              placeholder="e.g. IgE 680 IU/mL, Eosinophils 8%, X-ray: Hyperinflated lung fields"
              className="w-full border border-slate-300 rounded-lg p-2 text-slate-900 focus:outline-none"
            />
          </div>
          <div className="sm:col-span-2 space-y-1">
            <label className="font-bold text-slate-700">Investigation Notes / तपासणी नोंदी</label>
            <textarea
              name="investigationNotes"
              rows={2}
              value={formData.investigationNotes}
              onChange={handleChange}
              placeholder="Spirometry FEV1/FVC ratio, culture report findings..."
              className="w-full border border-slate-300 rounded-lg p-2 text-slate-900 focus:outline-none"
            />
          </div>

          {/* Photo & PDF upload */}
          <div className="sm:col-span-2 space-y-2 pt-2 border-t border-slate-100">
            <label className="font-bold text-slate-800 text-xs flex items-center gap-1.5">
              <span>📷</span> Upload Investigation Photos / Reports / तपासणीचे फोटो / रिपोर्ट अपलोड करा
            </label>
            <div className="flex items-center gap-3">
              <label className="cursor-pointer px-4 py-2 bg-slate-100 hover:bg-slate-200 border border-slate-300 rounded-xl text-xs font-semibold text-slate-700 flex items-center gap-2 transition-colors">
                <Upload className="w-4 h-4 text-teal-700" />
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
                Images are stored locally when saved. / सेव्ह केल्यावर फोटो स्थानिकरित्या जतन केले जातात.
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

      {/* Section 10: Assessment & Follow-up */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4">
        <h2 className="text-sm font-bold text-[#086b4d] bg-[#e8f6f1] -mx-6 -mt-6 px-6 py-3 rounded-t-2xl flex items-center gap-2">
          <span>📋</span> 10. Assessment & Follow-up / मूल्यांकन व फॉलो-अप
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5 text-xs">
          <div className="space-y-1">
            <label className="font-bold text-slate-700">Clinical Assessment / क्लिनिकल मूल्यांकन</label>
            <input
              name="assessment"
              value={formData.assessment}
              onChange={handleChange}
              placeholder="e.g. Extrinsic Bronchial Asthma with Allergic Rhinitis"
              className="w-full border border-slate-300 rounded-lg p-2 text-slate-900 focus:outline-none"
            />
          </div>
          <div className="space-y-1">
            <label className="font-bold text-slate-700">Working Diagnosis / संभाव्य निदान</label>
            <input
              name="diagnosis"
              value={formData.diagnosis}
              onChange={handleChange}
              placeholder="e.g. Bronchial Asthma (Arsenic Album / Blatta Orientalis picture)"
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
              placeholder="Remedy selection rationale, acute management plan, steam instructions..."
              className="w-full border border-slate-300 rounded-lg p-2.5 text-slate-900 focus:outline-none"
            />
          </div>
        </div>
      </div>

      {/* Bottom Sticky Action Buttons matching template */}
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
