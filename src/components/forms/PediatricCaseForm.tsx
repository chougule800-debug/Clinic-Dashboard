import React, { useState, useEffect } from 'react';
import { useClinic } from '../../context/ClinicContext';
import {
  Baby,
  Save,
  CheckCircle2,
  RotateCcw,
  Printer,
  FileText,
  AlertTriangle,
  Upload,
  X,
  Brain,
  Sparkles
} from 'lucide-react';

export interface PediatricFormData {
  // 1. Child & Parent Information
  childName: string;
  age: string;
  date: string;
  sex: string;
  birthDate: string;
  birthPlace: string;
  father: string;
  mother: string;
  contact: string;
  address: string;

  // 2. Chief Complaints
  complaints: string[];
  sinceWhen: string;
  frequency: string;
  complaintDetails: string;

  // 3. Birth & Antenatal History
  gravida: string;
  maternalAge: string;
  gestationalAge: string;
  antenatal: string[];
  deliveryPlace: string;
  deliveryMode: string;
  birthWeight: string;
  apgar: string;
  birthComplications: string;

  // 4. Feeding & Nutrition History
  breastfeeding: string;
  breastfeedingDuration: string;
  weaningAge: string;
  food: string[];
  feedingDifficulties: string;

  // 5. Developmental Milestones
  // Gross Motor
  headControl: string;
  rolling: string;
  sitting: string;
  crawling: string;
  standing: string;
  walking: string;
  running: string;

  // Fine Motor
  reaches: string;
  transfers: string;
  pincer: string;
  drawing: string;
  writing: string;

  // Speech & Language
  cooing: string;
  babbling: string;
  firstWord: string;
  twoWords: string;
  sentences: string;
  currentSpeech: string;

  // Social & Adaptive
  socialSmile: string;
  eyeContact: string;
  responseName: string;
  interactivePlay: string;
  toiletTraining: string;
  selfFeeding: string;

  developmentConcerns: string[];

  // 6. Behaviour, Attention & Neurodevelopment
  neuro: string[];
  schoolPerformance: string;
  attentionDuration: string;
  screenTime: string;
  behaviourNotes: string;

  // 7. Toilet, Sleep & Daily Habits
  urine: string;
  bowel: string;
  sleep: string;
  dailyHabits: string;

  // 8. Past, Family & Immunization History
  past: string[];
  immunization: string;
  familyHistory: string;
  allergyHistory: string;
  pastFamilyDetails: string;

  // 9. Investigations & Reports
  investigation: string[];
  investigationDate: string;
  reportFinding: string;
  investigationNotes: string;
  reportFiles: { name: string; type: string; data: string | null }[];

  // 10. Assessment & Follow-up
  assessment: string;
  developmentAssessment: string;
  diagnosis?: string;
  followupDate: string;
  doctorNotes: string;

  savedAt?: string;
}

const INITIAL_PEDIATRIC_DATA: PediatricFormData = {
  childName: '',
  age: '',
  date: new Date().toISOString().split('T')[0],
  sex: 'Male / मुलगा',
  birthDate: '',
  birthPlace: '',
  father: '',
  mother: '',
  contact: '',
  address: '',

  complaints: [],
  sinceWhen: '',
  frequency: '',
  complaintDetails: '',

  gravida: '1',
  maternalAge: '26',
  gestationalAge: '39 weeks',
  antenatal: ['Normal / सामान्य'],
  deliveryPlace: 'Hospital',
  deliveryMode: 'Normal Vaginal / सामान्य प्रसूती',
  birthWeight: '2.9 kg',
  apgar: '9/10',
  birthComplications: '',

  breastfeeding: 'Exclusive / पूर्ण',
  breastfeedingDuration: '6 months',
  weaningAge: '6 months',
  food: ['Good appetite / चांगली भूक'],
  feedingDifficulties: '',

  headControl: '3 months',
  rolling: '5 months',
  sitting: '6-7 months',
  crawling: '8 months',
  standing: '10 months',
  walking: '12 months',
  running: '18 months',

  reaches: '4 months',
  transfers: '6 months',
  pincer: '9-10 months',
  drawing: '2.5 years',
  writing: '4 years',

  cooing: '3 months',
  babbling: '6 months',
  firstWord: '10-12 months',
  twoWords: '18-24 months',
  sentences: '3 years',
  currentSpeech: 'Fluent age-appropriate speech',

  socialSmile: '2 months',
  eyeContact: 'Normal',
  responseName: 'Normal',
  interactivePlay: 'Engages with peers',
  toiletTraining: 'Day dry at 2.5 years',
  selfFeeding: 'Feeds independently',

  developmentConcerns: ['No delay / विलंब नाही'],

  neuro: [],
  schoolPerformance: 'Good / Average',
  attentionDuration: 'Age appropriate',
  screenTime: '1 hour / day',
  behaviourNotes: '',

  urine: 'Normal / सामान्य',
  bowel: 'Normal / सामान्य',
  sleep: 'Normal / सामान्य',
  dailyHabits: '',

  past: [],
  immunization: 'Complete / पूर्ण',
  familyHistory: '',
  allergyHistory: '',
  pastFamilyDetails: '',

  investigation: [],
  investigationDate: '',
  reportFinding: '',
  investigationNotes: '',
  reportFiles: [],

  assessment: '',
  developmentAssessment: 'Milestones appropriate for chronological age',
  followupDate: '',
  doctorNotes: ''
};

export const PediatricCaseForm: React.FC = () => {
  const {
    selectedPatient,
    patients,
    selectPatient,
    saveSystemForm,
    systemForms,
    setActiveTab
  } = useClinic();

  const [formData, setFormData] = useState<PediatricFormData>(INITIAL_PEDIATRIC_DATA);
  const [statusMessage, setStatusMessage] = useState<string>('');
  const [statusType, setStatusType] = useState<'success' | 'error' | 'info'>('info');

  useEffect(() => {
    if (selectedPatient) {
      const existing = systemForms.find(
        f => f.patientId === selectedPatient.id && f.system === 'pediatric'
      );

      if (existing && existing.data && Object.keys(existing.data).length > 0) {
        setFormData({
          ...INITIAL_PEDIATRIC_DATA,
          ...existing.data,
          childName: selectedPatient.name,
          age: String(selectedPatient.age || ''),
          sex: selectedPatient.gender === 'Female' ? 'Female / मुलगी' : 'Male / मुलगा',
          contact: selectedPatient.mobile || '',
          address: selectedPatient.address || existing.data.address || '',
          date: existing.data.date || new Date().toISOString().split('T')[0]
        });
        return;
      }

      try {
        const stored = localStorage.getItem(`arogyaPediatricCase_${selectedPatient.id}`);
        if (stored) {
          const parsed = JSON.parse(stored);
          setFormData(prev => ({
            ...prev,
            ...parsed,
            childName: selectedPatient.name,
            age: String(selectedPatient.age || ''),
            sex: selectedPatient.gender === 'Female' ? 'Female / मुलगी' : 'Male / मुलगा',
            contact: selectedPatient.mobile || '',
            address: selectedPatient.address || ''
          }));
          return;
        }
      } catch (_) {}

      setFormData({
        ...INITIAL_PEDIATRIC_DATA,
        childName: selectedPatient.name,
        age: String(selectedPatient.age || ''),
        sex: selectedPatient.gender === 'Female' ? 'Female / मुलगी' : 'Male / मुलगा',
        contact: selectedPatient.mobile || '',
        address: selectedPatient.address || '',
        birthDate: selectedPatient.dob || '',
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

  const handleCheckboxToggle = (category: keyof PediatricFormData, value: string) => {
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
    if (!formData.childName.trim()) {
      setStatusMessage('Please enter Child Name / कृपया बालकाचे नाव भरा.');
      setStatusType('error');
      return;
    }

    const savedAt = new Date().toLocaleString();
    const updatedData = { ...formData, savedAt };

    if (selectedPatient) {
      localStorage.setItem(`arogyaPediatricCase_${selectedPatient.id}`, JSON.stringify(updatedData));
    }
    localStorage.setItem('arogyaPediatricCase_' + (formData.childName || Date.now()), JSON.stringify(updatedData));

    const chiefComplaintsText = [
      formData.complaints?.length ? `Complaints: ${formData.complaints.join(', ')}` : '',
      formData.neuro?.length ? `Neuro/Behaviour: ${formData.neuro.join(', ')}` : '',
      formData.developmentConcerns?.length && !formData.developmentConcerns.includes('No delay / विलंब नाही')
        ? `Development: ${formData.developmentConcerns.join(', ')}`
        : '',
      formData.sinceWhen ? `Since: ${formData.sinceWhen}` : ''
    ].filter(Boolean).join(' • ');

    const modalitiesAgg = 'Cold draft, teething, milk, night';
    const modalitiesAmel = 'Carrying, rocking, warm drink, maternal presence';

    if (selectedPatient) {
      saveSystemForm({
        patientId: selectedPatient.id,
        system: 'pediatric',
        chiefComplaints: chiefComplaintsText || 'Pediatric Comprehensive Case Record',
        duration: formData.sinceWhen || 'Childhood history',
        severity: formData.neuro?.length > 2 || formData.developmentConcerns?.some(d => d.includes('delay')) ? 'Moderate' : 'Mild',
        modalitiesAggravation: modalitiesAgg,
        modalitiesAmelioration: modalitiesAmel,
        concomitants: formData.food?.join(', ') || formData.urine || '',
        clinicalNotes: formData.doctorNotes || formData.diagnosis || formData.assessment || '',
        data: updatedData,
        submittedVia: 'Doctor_Dashboard'
      });
    }

    setStatusMessage('✓ Pediatric Case Saved Successfully / केस यशस्वीरित्या जतन केला. Synced to Case Summary.');
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
      setFormData(INITIAL_PEDIATRIC_DATA);
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
          <div className="w-10 h-10 rounded-xl bg-amber-600 text-white flex items-center justify-center font-bold shadow-xs">
            <Baby className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs uppercase font-bold tracking-wider px-2 py-0.5 rounded-md bg-amber-50 text-amber-800 border border-amber-200">
                Pediatric Developmental & Clinical Form
              </span>
              <span className="text-[11px] text-slate-400 font-medium">बालरोग केस टेकिंग</span>
            </div>
            <h2 className="text-sm font-bold text-slate-900 mt-0.5">
              Active Child: <strong className="text-amber-950 font-serif">{formData.childName || 'No Child Selected'}</strong>
              {formData.age && <span className="text-slate-400 font-normal"> ({formData.age} yrs)</span>}
            </h2>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <select
            value={selectedPatient?.id || ''}
            onChange={(e) => selectPatient(e.target.value)}
            className="text-xs border border-slate-300 rounded-xl px-3 py-2 bg-slate-50 text-slate-800 focus:outline-none focus:ring-2 focus:ring-amber-500 font-medium"
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
            <FileText className="w-3.5 h-3.5 text-amber-700" />
            <span>Case Summary</span>
          </button>
        </div>
      </div>

      {/* Header Banner matching template */}
      <div className="bg-gradient-to-r from-[#087f5b] to-[#16a085] text-white p-6 rounded-2xl shadow-sm text-center">
        <h1 className="text-xl sm:text-2xl font-bold font-serif">Dr. Bharat's Arogya Homeopathy</h1>
        <p className="text-xs sm:text-sm text-teal-100 mt-1">
          Pediatric Case Taking / बालरोग केस टेकिंग
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

      {/* Section 1: Child & Parent Information */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4">
        <h2 className="text-sm font-bold text-[#086b4d] bg-[#e8f6f1] -mx-6 -mt-6 px-6 py-3 rounded-t-2xl flex items-center gap-2">
          <span>👶</span> 1. Child & Parent Information / बालक व पालकांची माहिती
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5 text-xs">
          <div className="space-y-1">
            <label className="font-bold text-slate-700">Child Name / बालकाचे नाव</label>
            <input
              name="childName"
              value={formData.childName}
              onChange={handleChange}
              className="w-full border border-slate-300 rounded-lg p-2 text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-500"
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
              placeholder="e.g. 4.5"
              className="w-full border border-slate-300 rounded-lg p-2 text-slate-900 focus:outline-none"
            />
          </div>
          <div className="space-y-1">
            <label className="font-bold text-slate-700">Date / दिनांक</label>
            <input
              name="date"
              type="date"
              value={formData.date}
              onChange={handleChange}
              className="w-full border border-slate-300 rounded-lg p-2 text-slate-900 focus:outline-none"
            />
          </div>
          <div className="space-y-1">
            <label className="font-bold text-slate-700">Sex / लिंग</label>
            <select
              name="sex"
              value={formData.sex}
              onChange={handleChange}
              className="w-full border border-slate-300 rounded-lg p-2 text-slate-900 focus:outline-none"
            >
              <option value="Male / मुलगा">Male / मुलगा</option>
              <option value="Female / मुलगी">Female / मुलगी</option>
            </select>
          </div>
          <div className="space-y-1">
            <label className="font-bold text-slate-700">Birth Date / जन्मतारीख</label>
            <input
              name="birthDate"
              type="date"
              value={formData.birthDate}
              onChange={handleChange}
              className="w-full border border-slate-300 rounded-lg p-2 text-slate-900 focus:outline-none"
            />
          </div>
          <div className="space-y-1">
            <label className="font-bold text-slate-700">Birth Place / जन्मस्थळ</label>
            <input
              name="birthPlace"
              value={formData.birthPlace}
              onChange={handleChange}
              placeholder="e.g. Pune"
              className="w-full border border-slate-300 rounded-lg p-2 text-slate-900 focus:outline-none"
            />
          </div>
          <div className="space-y-1">
            <label className="font-bold text-slate-700">Father Name / वडिलांचे नाव</label>
            <input
              name="father"
              value={formData.father}
              onChange={handleChange}
              className="w-full border border-slate-300 rounded-lg p-2 text-slate-900 focus:outline-none"
            />
          </div>
          <div className="space-y-1">
            <label className="font-bold text-slate-700">Mother Name / आईचे नाव</label>
            <input
              name="mother"
              value={formData.mother}
              onChange={handleChange}
              className="w-full border border-slate-300 rounded-lg p-2 text-slate-900 focus:outline-none"
            />
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
          <div className="sm:col-span-3 space-y-1">
            <label className="font-bold text-slate-700">Address / पत्ता</label>
            <textarea
              name="address"
              rows={1}
              value={formData.address}
              onChange={handleChange}
              className="w-full border border-slate-300 rounded-lg p-2 text-slate-900 focus:outline-none"
            />
          </div>
        </div>
      </div>

      {/* Section 2: Chief Complaints */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4">
        <h2 className="text-sm font-bold text-[#086b4d] bg-[#e8f6f1] -mx-6 -mt-6 px-6 py-3 rounded-t-2xl flex items-center gap-2">
          <span>🩺</span> 2. Chief Complaints / मुख्य तक्रारी
        </h2>

        <div>
          <label className="font-bold text-slate-800 text-xs block mb-2">
            Quick Complaint Selection / तक्रारींची जलद निवड
          </label>
          <div className="flex flex-wrap gap-2">
            {[
              'Fever / ताप',
              'Cough / खोकला',
              'Cold / सर्दी',
              'Allergy / अॅलर्जी',
              'Asthma / दमा',
              'Skin problem / त्वचेची समस्या',
              'Digestive problem / पचन समस्या',
              'Constipation / बद्धकोष्ठता',
              'Bedwetting / अंथरुणात लघवी',
              'Headache / डोकेदुखी',
              'Delayed development / विकासात विलंब',
              'ADHD features / ADHD लक्षणे',
              'Autism features / ऑटिझम लक्षणे'
            ].map(item => {
              const active = formData.complaints.includes(item);
              return (
                <label
                  key={item}
                  className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs cursor-pointer border transition-all ${
                    active
                      ? 'bg-amber-50 border-amber-500 text-amber-900 font-semibold shadow-2xs'
                      : 'bg-[#f1f6f4] border-transparent text-slate-700 hover:border-slate-300'
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={active}
                    onChange={() => handleCheckboxToggle('complaints', item)}
                    className="rounded text-amber-600"
                  />
                  <span>{item}</span>
                </label>
              );
            })}
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 text-xs pt-2">
          <div className="space-y-1">
            <label className="font-bold text-slate-700">Since When / केव्हापासून</label>
            <input
              name="sinceWhen"
              value={formData.sinceWhen}
              onChange={handleChange}
              placeholder="e.g. 3 weeks, since school started"
              className="w-full border border-slate-300 rounded-lg p-2 text-slate-900 focus:outline-none"
            />
          </div>
          <div className="space-y-1">
            <label className="font-bold text-slate-700">Frequency / वारंवारता</label>
            <input
              name="frequency"
              value={formData.frequency}
              onChange={handleChange}
              placeholder="e.g. Recurrent every month, nocturnal, continuous"
              className="w-full border border-slate-300 rounded-lg p-2 text-slate-900 focus:outline-none"
            />
          </div>
          <div className="sm:col-span-2 space-y-1">
            <label className="font-bold text-slate-700">
              Complaint Details: Location, Sensation, Modalities, Concomitants / तक्रारीचे सविस्तर वर्णन
            </label>
            <textarea
              name="complaintDetails"
              rows={2}
              value={formData.complaintDetails}
              onChange={handleChange}
              placeholder="Specific cough rattling, temperature peak time, emotional triggers..."
              className="w-full border border-slate-300 rounded-lg p-2 text-slate-900 focus:outline-none"
            />
          </div>
        </div>
      </div>

      {/* Section 3: Birth & Antenatal History */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4">
        <h2 className="text-sm font-bold text-[#086b4d] bg-[#e8f6f1] -mx-6 -mt-6 px-6 py-3 rounded-t-2xl flex items-center gap-2">
          <span>🤰</span> 3. Birth & Antenatal History / गर्भावस्था व जन्माचा इतिहास
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5 text-xs">
          <div className="space-y-1">
            <label className="font-bold text-slate-700">Gravida / गर्भधारणा क्रमांक</label>
            <input
              name="gravida"
              value={formData.gravida}
              onChange={handleChange}
              placeholder="e.g. 1st or 2nd"
              className="w-full border border-slate-300 rounded-lg p-2 text-slate-900 focus:outline-none"
            />
          </div>
          <div className="space-y-1">
            <label className="font-bold text-slate-700">Maternal Age at Pregnancy / आईचे वय</label>
            <input
              name="maternalAge"
              value={formData.maternalAge}
              onChange={handleChange}
              placeholder="e.g. 26"
              className="w-full border border-slate-300 rounded-lg p-2 text-slate-900 focus:outline-none"
            />
          </div>
          <div className="space-y-1">
            <label className="font-bold text-slate-700">Gestational Age / गर्भावधी</label>
            <input
              name="gestationalAge"
              value={formData.gestationalAge}
              onChange={handleChange}
              placeholder="e.g. 39 weeks (Full term)"
              className="w-full border border-slate-300 rounded-lg p-2 text-slate-900 focus:outline-none"
            />
          </div>
        </div>

        <div className="pt-2">
          <label className="font-bold text-slate-800 text-xs block mb-2">
            Antenatal Factors / गर्भावस्थेतील घटक
          </label>
          <div className="flex flex-wrap gap-2">
            {[
              'Normal / सामान्य',
              'Anemia / रक्तक्षय',
              'Diabetes / मधुमेह',
              'Hypertension / उच्च रक्तदाब',
              'Infection / संसर्ग',
              'Medication exposure / औषधांचा वापर',
              'Stress / ताण',
              'Other / इतर'
            ].map(item => {
              const active = formData.antenatal.includes(item);
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
                    onChange={() => handleCheckboxToggle('antenatal', item)}
                    className="rounded text-teal-600"
                  />
                  <span>{item}</span>
                </label>
              );
            })}
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-4 gap-3.5 text-xs pt-2">
          <div className="space-y-1">
            <label className="font-bold text-slate-700">Place of Delivery / प्रसूतीचे ठिकाण</label>
            <input
              name="deliveryPlace"
              value={formData.deliveryPlace}
              onChange={handleChange}
              className="w-full border border-slate-300 rounded-lg p-2 text-slate-900 focus:outline-none"
            />
          </div>
          <div className="space-y-1">
            <label className="font-bold text-slate-700">Mode of Delivery / प्रसूतीचा प्रकार</label>
            <select
              name="deliveryMode"
              value={formData.deliveryMode}
              onChange={handleChange}
              className="w-full border border-slate-300 rounded-lg p-2 text-slate-900 focus:outline-none"
            >
              <option value="Normal Vaginal / सामान्य प्रसूती">Normal Vaginal / सामान्य प्रसूती</option>
              <option value="LSCS / सिझेरियन">LSCS / सिझेरियन</option>
              <option value="Assisted / सहाय्यक">Assisted / सहाय्यक</option>
            </select>
          </div>
          <div className="space-y-1">
            <label className="font-bold text-slate-700">Birth Weight / जन्मावेळचे वजन</label>
            <input
              name="birthWeight"
              value={formData.birthWeight}
              onChange={handleChange}
              placeholder="e.g. 2.9 kg"
              className="w-full border border-slate-300 rounded-lg p-2 text-slate-900 focus:outline-none"
            />
          </div>
          <div className="space-y-1">
            <label className="font-bold text-slate-700">APGAR / अपगार</label>
            <input
              name="apgar"
              value={formData.apgar}
              onChange={handleChange}
              placeholder="e.g. 9/10, cried immediately"
              className="w-full border border-slate-300 rounded-lg p-2 text-slate-900 focus:outline-none"
            />
          </div>
          <div className="sm:col-span-4 space-y-1">
            <label className="font-bold text-slate-700">Birth Complications / जन्मावेळच्या गुंतागुंती</label>
            <textarea
              name="birthComplications"
              rows={1}
              value={formData.birthComplications}
              onChange={handleChange}
              placeholder="Delayed cry, NICU stay, phototherapy for jaundice, cord around neck..."
              className="w-full border border-slate-300 rounded-lg p-2 text-slate-900 focus:outline-none"
            />
          </div>
        </div>
      </div>

      {/* Section 4: Feeding & Nutrition History */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4">
        <h2 className="text-sm font-bold text-[#086b4d] bg-[#e8f6f1] -mx-6 -mt-6 px-6 py-3 rounded-t-2xl flex items-center gap-2">
          <span>🍼</span> 4. Feeding & Nutrition History / आहार व स्तनपान इतिहास
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5 text-xs">
          <div className="space-y-1">
            <label className="font-bold text-slate-700">Breastfeeding / स्तनपान</label>
            <select
              name="breastfeeding"
              value={formData.breastfeeding}
              onChange={handleChange}
              className="w-full border border-slate-300 rounded-lg p-2 text-slate-900 focus:outline-none"
            >
              <option value="Exclusive / पूर्ण">Exclusive / पूर्ण</option>
              <option value="Mixed / मिश्र">Mixed / मिश्र</option>
              <option value="Formula / फॉर्म्युला">Formula / फॉर्म्युला</option>
              <option value="Not applicable / लागू नाही">Not applicable / लागू नाही</option>
            </select>
          </div>
          <div className="space-y-1">
            <label className="font-bold text-slate-700">Duration / कालावधी</label>
            <input
              name="breastfeedingDuration"
              value={formData.breastfeedingDuration}
              onChange={handleChange}
              placeholder="e.g. 6 months / 1 year"
              className="w-full border border-slate-300 rounded-lg p-2 text-slate-900 focus:outline-none"
            />
          </div>
          <div className="space-y-1">
            <label className="font-bold text-slate-700">Weaning Age / वरचा आहार सुरू करण्याचे वय</label>
            <input
              name="weaningAge"
              value={formData.weaningAge}
              onChange={handleChange}
              placeholder="e.g. 6 months (kichdi, dal pani)"
              className="w-full border border-slate-300 rounded-lg p-2 text-slate-900 focus:outline-none"
            />
          </div>
        </div>

        <div className="pt-2">
          <label className="font-bold text-slate-800 text-xs block mb-2">
            Food Preferences / अन्नाची आवड
          </label>
          <div className="flex flex-wrap gap-2">
            {[
              'Good appetite / चांगली भूक',
              'Poor appetite / कमी भूक',
              'Milk / दूध',
              'Sweets / गोड',
              'Spicy / तिखट',
              'Eggs / अंडी',
              'Junk food / जंक फूड',
              'Food aversion / अन्नाचा तिटकारा'
            ].map(item => {
              const active = formData.food.includes(item);
              return (
                <label
                  key={item}
                  className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs cursor-pointer border transition-all ${
                    active
                      ? 'bg-amber-50 border-amber-500 text-amber-900 font-semibold shadow-2xs'
                      : 'bg-[#f1f6f4] border-transparent text-slate-700 hover:border-slate-300'
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={active}
                    onChange={() => handleCheckboxToggle('food', item)}
                    className="rounded text-amber-600"
                  />
                  <span>{item}</span>
                </label>
              );
            })}
          </div>
        </div>

        <div className="space-y-1 text-xs pt-1">
          <label className="font-bold text-slate-700">Feeding Difficulties / आहारातील अडचणी</label>
          <textarea
            name="feedingDifficulties"
            rows={2}
            value={formData.feedingDifficulties}
            onChange={handleChange}
            placeholder="Slow eater, vomits solid food, refusing vegetables, milk intolerance..."
            className="w-full border border-slate-300 rounded-lg p-2 text-slate-900 focus:outline-none"
          />
        </div>
      </div>

      {/* Section 5: Developmental Milestones */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-5">
        <h2 className="text-sm font-bold text-[#086b4d] bg-[#e8f6f1] -mx-6 -mt-6 px-6 py-3 rounded-t-2xl flex items-center gap-2">
          <span>📈</span> 5. Developmental Milestones / विकासात्मक टप्पे
        </h2>
        <p className="text-xs text-slate-500 -mt-2">
          Record achieved age and compare with developmental expectations. / प्राप्त वय नोंदवा व विकासात्मक अपेक्षांशी तुलना करा.
        </p>

        {/* Gross Motor */}
        <div className="border border-[#d8e3df] rounded-xl p-4 bg-slate-50/70 space-y-3">
          <h3 className="font-bold text-[#087f5b] text-xs uppercase tracking-wider">
            Gross Motor / स्थूल हालचाल
          </h3>
          <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-7 gap-2.5 text-xs">
            <div className="space-y-1">
              <label className="font-medium text-slate-700">Head Control / डोके</label>
              <input
                name="headControl"
                value={formData.headControl}
                onChange={handleChange}
                placeholder="Age"
                className="w-full border border-slate-300 rounded-lg p-1.5 bg-white text-slate-900"
              />
            </div>
            <div className="space-y-1">
              <label className="font-medium text-slate-700">Rolling / पलटी</label>
              <input
                name="rolling"
                value={formData.rolling}
                onChange={handleChange}
                placeholder="Age"
                className="w-full border border-slate-300 rounded-lg p-1.5 bg-white text-slate-900"
              />
            </div>
            <div className="space-y-1">
              <label className="font-medium text-slate-700">Sitting / बसणे</label>
              <input
                name="sitting"
                value={formData.sitting}
                onChange={handleChange}
                placeholder="Age"
                className="w-full border border-slate-300 rounded-lg p-1.5 bg-white text-slate-900"
              />
            </div>
            <div className="space-y-1">
              <label className="font-medium text-slate-700">Crawling / रांगणे</label>
              <input
                name="crawling"
                value={formData.crawling}
                onChange={handleChange}
                placeholder="Age"
                className="w-full border border-slate-300 rounded-lg p-1.5 bg-white text-slate-900"
              />
            </div>
            <div className="space-y-1">
              <label className="font-medium text-slate-700">Standing / उभे</label>
              <input
                name="standing"
                value={formData.standing}
                onChange={handleChange}
                placeholder="Age"
                className="w-full border border-slate-300 rounded-lg p-1.5 bg-white text-slate-900"
              />
            </div>
            <div className="space-y-1">
              <label className="font-medium text-slate-700">Walking / चालणे</label>
              <input
                name="walking"
                value={formData.walking}
                onChange={handleChange}
                placeholder="Age"
                className="w-full border border-slate-300 rounded-lg p-1.5 bg-white text-slate-900"
              />
            </div>
            <div className="space-y-1">
              <label className="font-medium text-slate-700">Running / धावणे</label>
              <input
                name="running"
                value={formData.running}
                onChange={handleChange}
                placeholder="Age"
                className="w-full border border-slate-300 rounded-lg p-1.5 bg-white text-slate-900"
              />
            </div>
          </div>
        </div>

        {/* Fine Motor */}
        <div className="border border-[#d8e3df] rounded-xl p-4 bg-slate-50/70 space-y-3">
          <h3 className="font-bold text-[#087f5b] text-xs uppercase tracking-wider">
            Fine Motor / सूक्ष्म हालचाल
          </h3>
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5 text-xs">
            <div className="space-y-1">
              <label className="font-medium text-slate-700">Reaches for Object / हात नेणे</label>
              <input
                name="reaches"
                value={formData.reaches}
                onChange={handleChange}
                placeholder="Age"
                className="w-full border border-slate-300 rounded-lg p-1.5 bg-white text-slate-900"
              />
            </div>
            <div className="space-y-1">
              <label className="font-medium text-slate-700">Transfers Object / हात बदलणे</label>
              <input
                name="transfers"
                value={formData.transfers}
                onChange={handleChange}
                placeholder="Age"
                className="w-full border border-slate-300 rounded-lg p-1.5 bg-white text-slate-900"
              />
            </div>
            <div className="space-y-1">
              <label className="font-medium text-slate-700">Pincer Grasp / पकड</label>
              <input
                name="pincer"
                value={formData.pincer}
                onChange={handleChange}
                placeholder="Age"
                className="w-full border border-slate-300 rounded-lg p-1.5 bg-white text-slate-900"
              />
            </div>
            <div className="space-y-1">
              <label className="font-medium text-slate-700">Drawing / चित्र</label>
              <input
                name="drawing"
                value={formData.drawing}
                onChange={handleChange}
                placeholder="Age"
                className="w-full border border-slate-300 rounded-lg p-1.5 bg-white text-slate-900"
              />
            </div>
            <div className="space-y-1">
              <label className="font-medium text-slate-700">Writing / लिहिणे</label>
              <input
                name="writing"
                value={formData.writing}
                onChange={handleChange}
                placeholder="Age"
                className="w-full border border-slate-300 rounded-lg p-1.5 bg-white text-slate-900"
              />
            </div>
          </div>
        </div>

        {/* Speech & Language */}
        <div className="border border-[#d8e3df] rounded-xl p-4 bg-slate-50/70 space-y-3">
          <h3 className="font-bold text-[#087f5b] text-xs uppercase tracking-wider">
            Speech & Language / भाषा व बोलण्याचा विकास
          </h3>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-2.5 text-xs">
            <div className="space-y-1">
              <label className="font-medium text-slate-700">Cooing / आवाज</label>
              <input
                name="cooing"
                value={formData.cooing}
                onChange={handleChange}
                placeholder="Age"
                className="w-full border border-slate-300 rounded-lg p-1.5 bg-white text-slate-900"
              />
            </div>
            <div className="space-y-1">
              <label className="font-medium text-slate-700">Babbling / बडबड</label>
              <input
                name="babbling"
                value={formData.babbling}
                onChange={handleChange}
                placeholder="Age"
                className="w-full border border-slate-300 rounded-lg p-1.5 bg-white text-slate-900"
              />
            </div>
            <div className="space-y-1">
              <label className="font-medium text-slate-700">First Word / शब्द</label>
              <input
                name="firstWord"
                value={formData.firstWord}
                onChange={handleChange}
                placeholder="Age"
                className="w-full border border-slate-300 rounded-lg p-1.5 bg-white text-slate-900"
              />
            </div>
            <div className="space-y-1">
              <label className="font-medium text-slate-700">Two-word Phrase</label>
              <input
                name="twoWords"
                value={formData.twoWords}
                onChange={handleChange}
                placeholder="Age"
                className="w-full border border-slate-300 rounded-lg p-1.5 bg-white text-slate-900"
              />
            </div>
            <div className="space-y-1">
              <label className="font-medium text-slate-700">Simple Sentences</label>
              <input
                name="sentences"
                value={formData.sentences}
                onChange={handleChange}
                placeholder="Age"
                className="w-full border border-slate-300 rounded-lg p-1.5 bg-white text-slate-900"
              />
            </div>
            <div className="space-y-1">
              <label className="font-medium text-slate-700">Current Speech</label>
              <input
                name="currentSpeech"
                value={formData.currentSpeech}
                onChange={handleChange}
                placeholder="Speech status"
                className="w-full border border-slate-300 rounded-lg p-1.5 bg-white text-slate-900"
              />
            </div>
          </div>
        </div>

        {/* Social & Adaptive */}
        <div className="border border-[#d8e3df] rounded-xl p-4 bg-slate-50/70 space-y-3">
          <h3 className="font-bold text-[#087f5b] text-xs uppercase tracking-wider">
            Social & Adaptive / सामाजिक व अनुकूलन विकास
          </h3>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-2.5 text-xs">
            <div className="space-y-1">
              <label className="font-medium text-slate-700">Social Smile / हसू</label>
              <input
                name="socialSmile"
                value={formData.socialSmile}
                onChange={handleChange}
                placeholder="Age"
                className="w-full border border-slate-300 rounded-lg p-1.5 bg-white text-slate-900"
              />
            </div>
            <div className="space-y-1">
              <label className="font-medium text-slate-700">Eye Contact / डोळे</label>
              <input
                name="eyeContact"
                value={formData.eyeContact}
                onChange={handleChange}
                placeholder="Status"
                className="w-full border border-slate-300 rounded-lg p-1.5 bg-white text-slate-900"
              />
            </div>
            <div className="space-y-1">
              <label className="font-medium text-slate-700">Response to Name</label>
              <input
                name="responseName"
                value={formData.responseName}
                onChange={handleChange}
                placeholder="Status"
                className="w-full border border-slate-300 rounded-lg p-1.5 bg-white text-slate-900"
              />
            </div>
            <div className="space-y-1">
              <label className="font-medium text-slate-700">Interactive Play</label>
              <input
                name="interactivePlay"
                value={formData.interactivePlay}
                onChange={handleChange}
                placeholder="Status"
                className="w-full border border-slate-300 rounded-lg p-1.5 bg-white text-slate-900"
              />
            </div>
            <div className="space-y-1">
              <label className="font-medium text-slate-700">Toilet Training</label>
              <input
                name="toiletTraining"
                value={formData.toiletTraining}
                onChange={handleChange}
                placeholder="Age"
                className="w-full border border-slate-300 rounded-lg p-1.5 bg-white text-slate-900"
              />
            </div>
            <div className="space-y-1">
              <label className="font-medium text-slate-700">Self Feeding</label>
              <input
                name="selfFeeding"
                value={formData.selfFeeding}
                onChange={handleChange}
                placeholder="Status"
                className="w-full border border-slate-300 rounded-lg p-1.5 bg-white text-slate-900"
              />
            </div>
          </div>
        </div>

        <div>
          <label className="font-bold text-slate-800 text-xs block mb-2">
            Developmental Concerns / विकासाबाबत चिंता
          </label>
          <div className="flex flex-wrap gap-2">
            {[
              'No delay / विलंब नाही',
              'Gross motor delay / स्थूल हालचालींमध्ये विलंब',
              'Fine motor delay / सूक्ष्म हालचालींमध्ये विलंब',
              'Speech delay / भाषिक विकासात विलंब',
              'Social delay / सामाजिक विकासात विलंब',
              'Global developmental delay / सर्वांगीण विकासात विलंब'
            ].map(item => {
              const active = formData.developmentConcerns.includes(item);
              return (
                <label
                  key={item}
                  className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs cursor-pointer border transition-all ${
                    active
                      ? 'bg-amber-50 border-amber-500 text-amber-900 font-semibold shadow-2xs'
                      : 'bg-[#f1f6f4] border-transparent text-slate-700 hover:border-slate-300'
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={active}
                    onChange={() => handleCheckboxToggle('developmentConcerns', item)}
                    className="rounded text-amber-600"
                  />
                  <span>{item}</span>
                </label>
              );
            })}
          </div>
        </div>
      </div>

      {/* Section 6: Behaviour, Attention & Neurodevelopment */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4">
        <h2 className="text-sm font-bold text-[#086b4d] bg-[#e8f6f1] -mx-6 -mt-6 px-6 py-3 rounded-t-2xl flex items-center gap-2">
          <span>🧠</span> 6. Behaviour, Attention & Neurodevelopment / वर्तन, लक्ष व न्यूरोविकास
        </h2>

        <div>
          <label className="font-bold text-slate-800 text-xs block mb-2">
            Quick Check / जलद निवड
          </label>
          <div className="flex flex-wrap gap-2">
            {[
              'Hyperactivity / अतिचंचलता',
              'Inattention / लक्ष कमी',
              'Impulsivity / उतावळेपणा',
              'Speech delay / बोलण्यास विलंब',
              'Poor eye contact / डोळ्यांचा संपर्क कमी',
              'Repetitive behaviour / पुनरावृत्तीची वर्तणूक',
              'Sensory sensitivity / संवेदनशीलता',
              'Sleep problem / झोपेची समस्या',
              'Learning difficulty / शिकण्यास अडचण',
              'Behavioural difficulty / वर्तन समस्या'
            ].map(item => {
              const active = formData.neuro.includes(item);
              return (
                <label
                  key={item}
                  className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs cursor-pointer border transition-all ${
                    active
                      ? 'bg-amber-50 border-amber-500 text-amber-900 font-semibold shadow-2xs'
                      : 'bg-[#f1f6f4] border-transparent text-slate-700 hover:border-slate-300'
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={active}
                    onChange={() => handleCheckboxToggle('neuro', item)}
                    className="rounded text-amber-600"
                  />
                  <span>{item}</span>
                </label>
              );
            })}
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5 text-xs pt-2">
          <div className="space-y-1">
            <label className="font-bold text-slate-700">School Performance / शाळेतील कामगिरी</label>
            <input
              name="schoolPerformance"
              value={formData.schoolPerformance}
              onChange={handleChange}
              placeholder="e.g. Good grasp, complaints from teacher of restlessness"
              className="w-full border border-slate-300 rounded-lg p-2 text-slate-900 focus:outline-none"
            />
          </div>
          <div className="space-y-1">
            <label className="font-bold text-slate-700">Attention Duration / लक्ष देण्याचा कालावधी</label>
            <input
              name="attentionDuration"
              value={formData.attentionDuration}
              onChange={handleChange}
              placeholder="e.g. Can sit for 10-15 mins / jumps between toys"
              className="w-full border border-slate-300 rounded-lg p-2 text-slate-900 focus:outline-none"
            />
          </div>
          <div className="space-y-1">
            <label className="font-bold text-slate-700">Screen Time / स्क्रीन टाइम</label>
            <input
              name="screenTime"
              value={formData.screenTime}
              onChange={handleChange}
              placeholder="e.g. 2 hours daily / mobile while eating"
              className="w-full border border-slate-300 rounded-lg p-2 text-slate-900 focus:outline-none"
            />
          </div>
          <div className="sm:col-span-3 space-y-1">
            <label className="font-bold text-slate-700">Behaviour / Mental & Social Notes / वर्तन, मानसिक व सामाजिक नोंदी</label>
            <textarea
              name="behaviourNotes"
              rows={2}
              value={formData.behaviourNotes}
              onChange={handleChange}
              placeholder="Temper tantrums (screaming, throwing things - Chamomilla/Tarentula), fear of strangers (Baryta Carb), obstinacy..."
              className="w-full border border-slate-300 rounded-lg p-2 text-slate-900 focus:outline-none"
            />
          </div>
        </div>
      </div>

      {/* Section 7: Toilet, Sleep & Daily Habits */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4">
        <h2 className="text-sm font-bold text-[#086b4d] bg-[#e8f6f1] -mx-6 -mt-6 px-6 py-3 rounded-t-2xl flex items-center gap-2">
          <span>🚽</span> 7. Toilet, Sleep & Daily Habits / शौचालय, झोप व दैनंदिन सवयी
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5 text-xs">
          <div className="space-y-1">
            <label className="font-bold text-slate-700">Urination / लघवी</label>
            <select
              name="urine"
              value={formData.urine}
              onChange={handleChange}
              className="w-full border border-slate-300 rounded-lg p-2 text-slate-900 focus:outline-none"
            >
              <option value="Normal / सामान्य">Normal / सामान्य</option>
              <option value="Bedwetting / अंथरुणात लघवी">Bedwetting / अंथरुणात लघवी</option>
              <option value="Daytime wetting / दिवसा लघवी">Daytime wetting / दिवसा लघवी</option>
              <option value="Urgency / घाई">Urgency / घाई</option>
            </select>
          </div>
          <div className="space-y-1">
            <label className="font-bold text-slate-700">Bowel / शौच</label>
            <select
              name="bowel"
              value={formData.bowel}
              onChange={handleChange}
              className="w-full border border-slate-300 rounded-lg p-2 text-slate-900 focus:outline-none"
            >
              <option value="Normal / सामान्य">Normal / सामान्य</option>
              <option value="Constipation / बद्धकोष्ठता">Constipation / बद्धकोष्ठता</option>
              <option value="Loose stools / जुलाब">Loose stools / जुलाब</option>
            </select>
          </div>
          <div className="space-y-1">
            <label className="font-bold text-slate-700">Sleep / झोप</label>
            <select
              name="sleep"
              value={formData.sleep}
              onChange={handleChange}
              className="w-full border border-slate-300 rounded-lg p-2 text-slate-900 focus:outline-none"
            >
              <option value="Normal / सामान्य">Normal / सामान्य</option>
              <option value="Restless / अस्वस्थ">Restless / अस्वस्थ</option>
              <option value="Difficulty sleeping / झोपण्यास अडचण">Difficulty sleeping / झोपण्यास अडचण</option>
              <option value="Night waking / रात्री जाग येणे">Night waking / रात्री जाग येणे</option>
            </select>
          </div>
          <div className="sm:col-span-3 space-y-1">
            <label className="font-bold text-slate-700">Sleep / Toilet / Habit Details / झोप, शौचालय व सवयींची माहिती</label>
            <textarea
              name="dailyHabits"
              rows={2}
              value={formData.dailyHabits}
              onChange={handleChange}
              placeholder="Teeth grinding at night, head sweat wetting pillow (Calc-c), thumbsucking, nailbiting..."
              className="w-full border border-slate-300 rounded-lg p-2 text-slate-900 focus:outline-none"
            />
          </div>
        </div>
      </div>

      {/* Section 8: Past, Family & Immunization History */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4">
        <h2 className="text-sm font-bold text-[#086b4d] bg-[#e8f6f1] -mx-6 -mt-6 px-6 py-3 rounded-t-2xl flex items-center gap-2">
          <span>🏥</span> 8. Past, Family & Immunization History / पूर्व इतिहास, कौटुंबिक व लसीकरण इतिहास
        </h2>

        <div>
          <label className="font-bold text-slate-800 text-xs block mb-2">
            Past Illness / पूर्वीचे आजार — Quick Check
          </label>
          <div className="flex flex-wrap gap-2">
            {[
              'Recurrent infections / वारंवार संसर्ग',
              'Pneumonia / न्यूमोनिया',
              'Seizures / आकडी',
              'Hospitalization / रुग्णालयात दाखल',
              'Surgery / शस्त्रक्रिया',
              'Allergy / अॅलर्जी'
            ].map(item => {
              const active = formData.past.includes(item);
              return (
                <label
                  key={item}
                  className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs cursor-pointer border transition-all ${
                    active
                      ? 'bg-amber-50 border-amber-500 text-amber-900 font-semibold shadow-2xs'
                      : 'bg-[#f1f6f4] border-transparent text-slate-700 hover:border-slate-300'
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={active}
                    onChange={() => handleCheckboxToggle('past', item)}
                    className="rounded text-amber-600"
                  />
                  <span>{item}</span>
                </label>
              );
            })}
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5 text-xs pt-2">
          <div className="space-y-1">
            <label className="font-bold text-slate-700">Immunization / लसीकरण</label>
            <select
              name="immunization"
              value={formData.immunization}
              onChange={handleChange}
              className="w-full border border-slate-300 rounded-lg p-2 text-slate-900 focus:outline-none"
            >
              <option value="Complete / पूर्ण">Complete / पूर्ण</option>
              <option value="Incomplete / अपूर्ण">Incomplete / अपूर्ण</option>
              <option value="Unknown / माहित नाही">Unknown / माहित नाही</option>
            </select>
          </div>
          <div className="space-y-1">
            <label className="font-bold text-slate-700">Family History / कौटुंबिक इतिहास</label>
            <input
              name="familyHistory"
              value={formData.familyHistory}
              onChange={handleChange}
              placeholder="Asthma, eczema, diabetes, thyroid in parents/grandparents"
              className="w-full border border-slate-300 rounded-lg p-2 text-slate-900 focus:outline-none"
            />
          </div>
          <div className="space-y-1">
            <label className="font-bold text-slate-700">Allergy History / अॅलर्जी इतिहास</label>
            <input
              name="allergyHistory"
              value={formData.allergyHistory}
              onChange={handleChange}
              placeholder="Dust, cow milk protein allergy, skin rashes"
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
              placeholder="Febrile convulsions, adenoid hypertrophy, frequent nebulizations..."
              className="w-full border border-slate-300 rounded-lg p-2 text-slate-900 focus:outline-none"
            />
          </div>
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
              'CBC/Hb / CBC',
              'Blood sugar / रक्तातील साखर',
              'Thyroid / थायरॉईड',
              'Urine / लघवी',
              'Stool / शौच',
              'USG / सोनोग्राफी',
              'Developmental assessment / विकास मूल्यांकन',
              'Hearing test / श्रवण तपासणी',
              'Vision test / दृष्टी तपासणी',
              'Other / इतर'
            ].map(item => {
              const active = formData.investigation.includes(item);
              return (
                <label
                  key={item}
                  className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs cursor-pointer border transition-all ${
                    active
                      ? 'bg-amber-50 border-amber-500 text-amber-900 font-semibold shadow-2xs'
                      : 'bg-[#f1f6f4] border-transparent text-slate-700 hover:border-slate-300'
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={active}
                    onChange={() => handleCheckboxToggle('investigation', item)}
                    className="rounded text-amber-600"
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
              placeholder="e.g. Hb 10.2 gm/dL, BERA hearing test normal, Mantoux negative"
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
              placeholder="Detailed test observations, stool ova/parasite findings..."
              className="w-full border border-slate-300 rounded-lg p-2 text-slate-900 focus:outline-none"
            />
          </div>

          {/* Photo upload */}
          <div className="sm:col-span-2 space-y-2 pt-2 border-t border-slate-100">
            <label className="font-bold text-slate-800 text-xs flex items-center gap-1.5">
              <span>📷</span> Upload Investigation Photos / Reports / तपासणीचे फोटो / रिपोर्ट अपलोड करा
            </label>
            <div className="flex items-center gap-3">
              <label className="cursor-pointer px-4 py-2 bg-slate-100 hover:bg-slate-200 border border-slate-300 rounded-xl text-xs font-semibold text-slate-700 flex items-center gap-2 transition-colors">
                <Upload className="w-4 h-4 text-amber-700" />
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
              placeholder="e.g. Recurrent Upper Respiratory Tract Infections with Mild Speech Delay"
              className="w-full border border-slate-300 rounded-lg p-2 text-slate-900 focus:outline-none"
            />
          </div>
          <div className="space-y-1">
            <label className="font-bold text-slate-700">Developmental Assessment / विकासात्मक मूल्यांकन</label>
            <input
              name="developmentAssessment"
              value={formData.developmentAssessment}
              onChange={handleChange}
              placeholder="e.g. Speech mild delay, gross/fine motor normal"
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
              placeholder="Constitutional remedy selection (Calcarea Carb / Silicea / Chamomilla / Tuberculinum), diet instructions, parent guidance..."
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
