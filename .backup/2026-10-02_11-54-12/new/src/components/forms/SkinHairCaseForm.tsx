import React, { useState, useEffect } from 'react';
import { useClinic } from '../../context/ClinicContext';
import {
  Save,
  CheckCircle2,
  RotateCcw,
  Camera,
  Trash2,
  Sparkles,
  FileText,
  Printer,
  AlertTriangle,
  Upload,
  X,
  Loader2,
  Heart
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
  skinProblem: string;
  skinSince: string;
  acneSeverity: string;
  acneLocation: string[];
  skinSymptom: string[];
  acneTrigger: string[];
  acneTreatment: string;
  cosmetics: string;
  skinHistory: string;
  acnePhoto: string;
  hairSince: string;
  dandruffSince: string;
  hairAmount: string;
  fallWhen: string[];
  symptom: string[];
  pattern: string[];
  shampoo: string;
  hairOil: string;
  hairColour: string;
  straightening: string;
  heat: string;
  helmet: string;
  wash: string;
  water: string;
  previousTreatment: string;
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
  diet: string;
  protein: string;
  waterIntake: string;
  crashDiet: string;
  appetite: string;
  tea: string;
  dietDetails: string;
  sleep: string;
  stress: string;
  exercise: string;
  screenTime: string;
  recentIllness: string;
  majorStress: string;
  cbc: string;
  ferritin: string;
  iron: string;
  vitD: string;
  b12: string;
  tsh: string;
  otherReports: string;
  photo1: string;
  photo2: string;
  photo3: string;
  photo4: string;
  photo5: string;
  otherProblems: string;
  dandruffSeverity: string;
  hairSeverity: string;
  density: string;
  clinicalFindings: string;
  assessment: string;
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
  skinProblem: '',
  skinSince: '',
  acneSeverity: '',
  acneLocation: [],
  skinSymptom: [],
  acneTrigger: [],
  acneTreatment: '',
  cosmetics: '',
  skinHistory: '',
  acnePhoto: '',
  hairSince: '',
  dandruffSince: '',
  hairAmount: '',
  fallWhen: [],
  symptom: [],
  pattern: [],
  shampoo: '',
  hairOil: '',
  hairColour: '',
  straightening: '',
  heat: '',
  helmet: '',
  wash: '',
  water: '',
  previousTreatment: '',
  menarcheAge: '',
  lmp: '',
  cycle: '',
  cycleLength: '',
  bleeding: '',
  bleedingDays: '',
  periodPain: '',
  clots: '',
  pms: '',
  pcos: '',
  facialHair: '',
  periodAcne: '',
  diet: '',
  protein: '',
  waterIntake: '',
  crashDiet: '',
  appetite: '',
  tea: '',
  dietDetails: '',
  sleep: '',
  stress: '',
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
  dandruffSeverity: '',
  hairSeverity: '',
  density: '',
  clinicalFindings: '',
  assessment: '',
  treatment: '',
  advice: '',
  followup: '',
  followupNotes: ''
};

export const SkinHairCaseForm: React.FC = () => {
  const { selectedPatient, patients, selectPatient, saveSystemForm, systemForms, setActiveTab } =
    useClinic();

  const [formData, setFormData] = useState<SkinHairFormData>(INITIAL_FORM_DATA);
  const [statusMessage, setStatusMessage] = useState('');
  const [statusType, setStatusType] = useState<'success' | 'error' | 'info'>('info');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!selectedPatient) return;
    const existing = systemForms.find(
      f => f.patientId === selectedPatient.id && f.system === 'skin_hair'
    );
    if (existing && existing.data && Object.keys(existing.data).length > 0) {
      setFormData({
        ...INITIAL_FORM_DATA,
        ...(existing.data as Partial<SkinHairFormData>),
        patientName: selectedPatient.name,
        age: String(selectedPatient.age || ''),
        sex:
          selectedPatient.gender === 'Female'
            ? 'Female / स्त्री'
            : selectedPatient.gender === 'Male'
            ? 'Male / पुरुष'
            : 'Other / इतर',
        mobile: selectedPatient.mobile || '',
        address: selectedPatient.address || '',
        date: (existing.data as any).date || new Date().toISOString().split('T')[0]
      });
    } else {
      setFormData({
        ...INITIAL_FORM_DATA,
        patientName: selectedPatient.name,
        age: String(selectedPatient.age || ''),
        sex:
          selectedPatient.gender === 'Female'
            ? 'Female / स्त्री'
            : selectedPatient.gender === 'Male'
            ? 'Male / पुरुष'
            : 'Other / इतर',
        mobile: selectedPatient.mobile || '',
        address: selectedPatient.address || '',
        date: new Date().toISOString().split('T')[0]
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedPatient?.id, systemForms]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { id, value } = e.target;
    setFormData(prev => ({ ...prev, [id]: value }));
  };

  const handleCheckboxToggle = (category: keyof SkinHairFormData, value: string) => {
    setFormData(prev => {
      const current = (prev[category] as string[]) || [];
      return {
        ...prev,
        [category]: current.includes(value)
          ? current.filter(i => i !== value)
          : [...current, value]
      };
    });
  };

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>, key: keyof SkinHairFormData) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      if (reader.result) setFormData(prev => ({ ...prev, [key]: reader.result as string }));
    };
    reader.readAsDataURL(file);
  };

  const removePhoto = (key: keyof SkinHairFormData) => {
    setFormData(prev => ({ ...prev, [key]: '' }));
  };

  const handleSave = async () => {
    if (!selectedPatient) {
      setStatusMessage('No patient selected.');
      setStatusType('error');
      return;
    }
    if (!formData.patientName.trim()) {
      setStatusMessage('Please enter patient name.');
      setStatusType('error');
      return;
    }

    setSaving(true);
    try {
      const chiefComplaintsText = [
        formData.skinProblem ? `Skin: ${formData.skinProblem}` : '',
        formData.skinSince ? `Since ${formData.skinSince}` : '',
        formData.hairSince ? `Hair fall since ${formData.hairSince}` : ''
      ]
        .filter(Boolean)
        .join(' • ');

      await saveSystemForm({
        patientId: selectedPatient.id,
        system: 'skin_hair',
        chiefComplaints: chiefComplaintsText || 'Skin & Hair Case',
        duration: formData.skinSince || formData.hairSince || 'Not specified',
        severity: formData.acneSeverity?.includes('Severe') ? 'Severe' : 'Moderate',
        modalitiesAggravation: formData.acneTrigger.join(', '),
        modalitiesAmelioration: formData.wash || '',
        concomitants: formData.otherProblems || '',
        clinicalNotes: formData.clinicalFindings || formData.assessment || '',
        data: { ...formData },
        submittedVia: 'Doctor_Dashboard'
      });

      setStatusMessage('Case saved to cloud.');
      setStatusType('success');
      setTimeout(() => setStatusMessage(''), 3500);
    } catch (err) {
      setStatusMessage(err instanceof Error ? err.message : 'Save failed.');
      setStatusType('error');
    } finally {
      setSaving(false);
    }
  };

  const handleSubmit = async () => {
    await handleSave();
    setTimeout(() => window.print(), 400);
  };

  const handleClear = () => {
    if (!confirm('Clear all fields?')) return;
    if (!selectedPatient) return;
    setFormData({
      ...INITIAL_FORM_DATA,
      patientName: selectedPatient.name,
      age: String(selectedPatient.age || ''),
      sex:
        selectedPatient.gender === 'Female'
          ? 'Female / स्त्री'
          : selectedPatient.gender === 'Male'
          ? 'Male / पुरुष'
          : 'Other / इतर',
      mobile: selectedPatient.mobile || '',
      address: selectedPatient.address || '',
      date: new Date().toISOString().split('T')[0]
    });
    setStatusMessage('Form cleared');
    setStatusType('info');
    setTimeout(() => setStatusMessage(''), 3000);
  };

  return (
    <div className="space-y-6 pb-28 max-w-6xl mx-auto">
      {/* Patient ribbon */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-teal-50 border border-teal-200 flex items-center justify-center text-teal-700">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs uppercase font-bold text-teal-800 tracking-wider">
                Skin &amp; Hair Form
              </span>
              <span className="text-slate-300">•</span>
              <span className="text-xs font-semibold text-slate-600">
                Active: <strong className="text-slate-900">{selectedPatient?.name}</strong>
              </span>
            </div>
            <h2 className="text-lg font-bold text-slate-900 font-serif">
              Skin &amp; Hairfall Case Taking
            </h2>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <select
            value={selectedPatient?.id || ''}
            onChange={e => selectPatient(e.target.value)}
            className="px-3 py-1.5 bg-slate-50 border border-slate-300 rounded-xl text-xs font-medium"
          >
            {patients.map(p => (
              <option key={p.id} value={p.id}>
                {p.name} ({p.patientCode ?? p.id})
              </option>
            ))}
          </select>
          <button
            type="button"
            onClick={() => setActiveTab('case_summary')}
            className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs rounded-xl flex items-center gap-1.5"
          >
            <FileText className="w-3.5 h-3.5 text-teal-700" />
            Summary
          </button>
        </div>
      </div>

      {statusMessage && (
        <div
          className={`p-3 rounded-xl border text-xs font-medium flex items-center gap-2 ${
            statusType === 'success'
              ? 'bg-emerald-50 border-emerald-300 text-emerald-900'
              : statusType === 'error'
              ? 'bg-rose-50 border-rose-300 text-rose-900'
              : 'bg-teal-50 border-teal-300 text-teal-900'
          }`}
        >
          {statusType === 'success' ? (
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          ) : (
            <AlertTriangle className="w-4 h-4 text-rose-600" />
          )}
          <span>{statusMessage}</span>
        </div>
      )}

      {/* Patient Information */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4">
        <h3 className="text-base font-bold text-teal-800 border-b border-teal-100 pb-3 -mx-6 -mt-6 px-6 pt-4 bg-teal-50/40 rounded-t-2xl">
          1. Patient Information
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5 text-xs">
          <div className="space-y-1">
            <label className="font-bold text-slate-700">Patient Name</label>
            <input
              id="patientName"
              value={formData.patientName}
              onChange={handleChange}
              className="w-full border border-slate-300 rounded-lg p-2"
            />
          </div>
          <div className="space-y-1">
            <label className="font-bold text-slate-700">Age</label>
            <input
              id="age"
              value={formData.age}
              onChange={handleChange}
              className="w-full border border-slate-300 rounded-lg p-2"
            />
          </div>
          <div className="space-y-1">
            <label className="font-bold text-slate-700">Sex</label>
            <select
              id="sex"
              value={formData.sex}
              onChange={handleChange}
              className="w-full border border-slate-300 rounded-lg p-2"
            >
              <option value="">Select</option>
              <option value="Male / पुरुष">Male / पुरुष</option>
              <option value="Female / स्त्री">Female / स्त्री</option>
              <option value="Other / इतर">Other / इतर</option>
            </select>
          </div>
          <div className="space-y-1">
            <label className="font-bold text-slate-700">Mobile</label>
            <input
              id="mobile"
              value={formData.mobile}
              onChange={handleChange}
              className="w-full border border-slate-300 rounded-lg p-2"
            />
          </div>
          <div className="space-y-1">
            <label className="font-bold text-slate-700">Date</label>
            <input
              id="date"
              type="date"
              value={formData.date}
              onChange={handleChange}
              className="w-full border border-slate-300 rounded-lg p-2"
            />
          </div>
          <div className="space-y-1">
            <label className="font-bold text-slate-700">Occupation</label>
            <input
              id="occupation"
              value={formData.occupation}
              onChange={handleChange}
              className="w-full border border-slate-300 rounded-lg p-2"
            />
          </div>
        </div>
      </div>

      {/* Skin & Acne */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4">
        <h3 className="text-base font-bold text-teal-800 border-b border-teal-100 pb-3 -mx-6 -mt-6 px-6 pt-4 bg-teal-50/40 rounded-t-2xl">
          2. Skin &amp; Acne
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5 text-xs">
          <div className="space-y-1">
            <label className="font-bold text-slate-700">Skin Problem</label>
            <input
              id="skinProblem"
              value={formData.skinProblem}
              onChange={handleChange}
              className="w-full border border-slate-300 rounded-lg p-2"
            />
          </div>
          <div className="space-y-1">
            <label className="font-bold text-slate-700">Since</label>
            <input
              id="skinSince"
              value={formData.skinSince}
              onChange={handleChange}
              className="w-full border border-slate-300 rounded-lg p-2"
            />
          </div>
          <div className="space-y-1">
            <label className="font-bold text-slate-700">Severity</label>
            <select
              id="acneSeverity"
              value={formData.acneSeverity}
              onChange={handleChange}
              className="w-full border border-slate-300 rounded-lg p-2"
            >
              <option value="">Select</option>
              <option value="Mild / सौम्य">Mild / सौम्य</option>
              <option value="Moderate / मध्यम">Moderate / मध्यम</option>
              <option value="Severe / तीव्र">Severe / तीव्र</option>
            </select>
          </div>
        </div>

        <div>
          <label className="font-bold text-slate-800 text-xs block mb-2">
            Acne Locations
          </label>
          <div className="flex flex-wrap gap-2">
            {['Forehead / कपाळ', 'Cheeks / गाल', 'Nose / नाक', 'Chin / हनुवटी', 'Jawline', 'Chest / छाती', 'Back / पाठ'].map(item => {
              const key = item.split(' / ')[0];
              const active = formData.acneLocation.includes(key);
              return (
                <label
                  key={item}
                  className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs cursor-pointer border ${
                    active
                      ? 'bg-teal-50 border-teal-500 font-semibold'
                      : 'bg-slate-50 border-transparent hover:border-slate-300'
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={active}
                    onChange={() => handleCheckboxToggle('acneLocation', key)}
                    className="rounded text-teal-600"
                  />
                  <span>{item}</span>
                </label>
              );
            })}
          </div>
        </div>

        <div>
          <label className="font-bold text-slate-800 text-xs block mb-2">
            Skin Symptoms
          </label>
          <div className="flex flex-wrap gap-2">
            {['Itching', 'Burning', 'Redness', 'Pain', 'Pus', 'Oily Skin', 'Dry Skin', 'Scars'].map(item => {
              const active = formData.skinSymptom.includes(item);
              return (
                <label
                  key={item}
                  className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs cursor-pointer border ${
                    active
                      ? 'bg-emerald-50 border-emerald-500 font-semibold'
                      : 'bg-slate-50 border-transparent hover:border-slate-300'
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={active}
                    onChange={() => handleCheckboxToggle('skinSymptom', item)}
                    className="rounded text-emerald-600"
                  />
                  <span>{item}</span>
                </label>
              );
            })}
          </div>
        </div>

        <div>
          <label className="font-bold text-slate-800 text-xs block mb-2">
            Acne Triggers
          </label>
          <div className="flex flex-wrap gap-2">
            {['Periods', 'Stress', 'Food', 'Cosmetics', 'Sweating', 'Sun', 'Other'].map(item => {
              const active = formData.acneTrigger.includes(item);
              return (
                <label
                  key={item}
                  className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs cursor-pointer border ${
                    active
                      ? 'bg-indigo-50 border-indigo-500 font-semibold'
                      : 'bg-slate-50 border-transparent hover:border-slate-300'
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={active}
                    onChange={() => handleCheckboxToggle('acneTrigger', item)}
                    className="rounded text-indigo-600"
                  />
                  <span>{item}</span>
                </label>
              );
            })}
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 text-xs">
          <div className="space-y-1">
            <label className="font-bold text-slate-700">Previous Acne Treatment</label>
            <textarea
              id="acneTreatment"
              rows={2}
              value={formData.acneTreatment}
              onChange={handleChange}
              className="w-full border border-slate-300 rounded-lg p-2"
            />
          </div>
          <div className="space-y-1">
            <label className="font-bold text-slate-700">Skin History</label>
            <textarea
              id="skinHistory"
              rows={2}
              value={formData.skinHistory}
              onChange={handleChange}
              className="w-full border border-slate-300 rounded-lg p-2"
            />
          </div>
        </div>
      </div>

      {/* Acne Photo */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4">
        <h3 className="text-base font-bold text-teal-800 border-b border-teal-100 pb-3 -mx-6 -mt-6 px-6 pt-4 bg-teal-50/40 rounded-t-2xl flex items-center justify-between">
          <span>3. Acne Photograph</span>
          <Camera className="w-4 h-4 text-teal-700" />
        </h3>
        <div className="max-w-sm p-4 border-2 border-dashed border-teal-200 rounded-xl bg-teal-50/20 text-center">
          {formData.acnePhoto ? (
            <div className="space-y-2">
              <img
                src={formData.acnePhoto}
                alt="Acne"
                className="w-full h-48 object-cover rounded-lg border border-slate-200"
              />
              <button
                type="button"
                onClick={() => removePhoto('acnePhoto')}
                className="px-3 py-1 bg-rose-600 text-white rounded-md text-xs font-semibold inline-flex items-center gap-1"
              >
                <Trash2 className="w-3.5 h-3.5" />
                Remove
              </button>
            </div>
          ) : (
            <label className="cursor-pointer block py-8">
              <Camera className="w-8 h-8 text-teal-600 mx-auto mb-2" />
              <span className="text-xs font-semibold text-teal-800 block">
                Upload Acne Photo
              </span>
              <input
                type="file"
                accept="image/*"
                onChange={e => handlePhotoUpload(e, 'acnePhoto')}
                className="hidden"
              />
            </label>
          )}
        </div>
      </div>

      {/* Hair */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4">
        <h3 className="text-base font-bold text-teal-800 border-b border-teal-100 pb-3 -mx-6 -mt-6 px-6 pt-4 bg-teal-50/40 rounded-t-2xl">
          4. Hair Fall &amp; Dandruff
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5 text-xs">
          <div className="space-y-1">
            <label className="font-bold text-slate-700">Hair Fall Since</label>
            <input
              id="hairSince"
              value={formData.hairSince}
              onChange={handleChange}
              className="w-full border border-slate-300 rounded-lg p-2"
            />
          </div>
          <div className="space-y-1">
            <label className="font-bold text-slate-700">Dandruff Since</label>
            <input
              id="dandruffSince"
              value={formData.dandruffSince}
              onChange={handleChange}
              className="w-full border border-slate-300 rounded-lg p-2"
            />
          </div>
          <div className="space-y-1">
            <label className="font-bold text-slate-700">Hair Loss Amount</label>
            <select
              id="hairAmount"
              value={formData.hairAmount}
              onChange={handleChange}
              className="w-full border border-slate-300 rounded-lg p-2"
            >
              <option value="">Select</option>
              <option value="Less than 20/day">Less than 20/day</option>
              <option value="20-50/day">20-50/day</option>
              <option value="50-100/day">50-100/day</option>
              <option value="More than 100/day">More than 100/day</option>
            </select>
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
          <div className="space-y-1">
            <label className="font-bold text-slate-700">Shampoo</label>
            <input
              id="shampoo"
              value={formData.shampoo}
              onChange={handleChange}
              className="w-full border border-slate-300 rounded-lg p-2"
            />
          </div>
          <div className="space-y-1">
            <label className="font-bold text-slate-700">Hair Oil</label>
            <input
              id="hairOil"
              value={formData.hairOil}
              onChange={handleChange}
              className="w-full border border-slate-300 rounded-lg p-2"
            />
          </div>
          <div className="space-y-1">
            <label className="font-bold text-slate-700">Helmet</label>
            <select
              id="helmet"
              value={formData.helmet}
              onChange={handleChange}
              className="w-full border border-slate-300 rounded-lg p-2"
            >
              <option value="">Select</option>
              <option value="No">No</option>
              <option value="Occasionally">Occasionally</option>
              <option value="Daily">Daily</option>
            </select>
          </div>
          <div className="space-y-1">
            <label className="font-bold text-slate-700">Wash Frequency</label>
            <select
              id="wash"
              value={formData.wash}
              onChange={handleChange}
              className="w-full border border-slate-300 rounded-lg p-2"
            >
              <option value="">Select</option>
              <option value="Daily">Daily</option>
              <option value="2-3 times/week">2-3 times/week</option>
              <option value="Weekly">Weekly</option>
            </select>
          </div>
        </div>

        {/* Hair Clinical Photos */}
        <div className="pt-2 border-t border-slate-100 space-y-2">
          <label className="font-bold text-slate-800 text-xs flex items-center gap-1.5">
            <Camera className="w-3.5 h-3.5 text-teal-600" />
            Hair &amp; Scalp Photographs (5 angles)
          </label>
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
            {[
              { key: 'photo1' as const, label: '1. Front Hairline' },
              { key: 'photo2' as const, label: '2. Crown / Top' },
              { key: 'photo3' as const, label: '3. Left Side' },
              { key: 'photo4' as const, label: '4. Right Side' },
              { key: 'photo5' as const, label: '5. Scalp Close-up' }
            ].map(p => {
              const val = formData[p.key];
              return (
                <div key={p.key} className="border-2 border-dashed border-teal-200 rounded-xl p-2 bg-teal-50/20 text-center">
                  <strong className="block text-[10px] text-slate-800 leading-tight mb-1.5">
                    {p.label}
                  </strong>
                  {val ? (
                    <div className="space-y-1">
                      <img
                        src={val}
                        alt={p.label}
                        className="w-full h-20 object-cover rounded border border-slate-200"
                      />
                      <button
                        type="button"
                        onClick={() => removePhoto(p.key)}
                        className="text-[10px] text-rose-600 font-bold"
                      >
                        Remove
                      </button>
                    </div>
                  ) : (
                    <label className="cursor-pointer block py-3 border border-teal-200 rounded-lg bg-white">
                      <Upload className="w-4 h-4 text-teal-600 mx-auto mb-0.5" />
                      <span className="text-[9px] font-semibold text-teal-800 block">Upload</span>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={e => handlePhotoUpload(e, p.key)}
                        className="hidden"
                      />
                    </label>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Lifestyle + Investigations */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-3 text-xs">
          <h3 className="font-bold text-teal-800 border-b border-teal-100 pb-2">
            5. Lifestyle &amp; Diet
          </h3>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="font-bold text-slate-700">Water Intake</label>
              <input
                id="waterIntake"
                value={formData.waterIntake}
                onChange={handleChange}
                className="w-full border border-slate-300 rounded-lg p-2"
              />
            </div>
            <div className="space-y-1">
              <label className="font-bold text-slate-700">Sleep</label>
              <input
                id="sleep"
                value={formData.sleep}
                onChange={handleChange}
                className="w-full border border-slate-300 rounded-lg p-2"
              />
            </div>
            <div className="space-y-1">
              <label className="font-bold text-slate-700">Stress</label>
              <select
                id="stress"
                value={formData.stress}
                onChange={handleChange}
                className="w-full border border-slate-300 rounded-lg p-2"
              >
                <option value="">Select</option>
                <option value="Low">Low</option>
                <option value="Moderate">Moderate</option>
                <option value="High">High</option>
              </select>
            </div>
            <div className="space-y-1">
              <label className="font-bold text-slate-700">Screen Time</label>
              <input
                id="screenTime"
                value={formData.screenTime}
                onChange={handleChange}
                className="w-full border border-slate-300 rounded-lg p-2"
              />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-3 text-xs">
          <h3 className="font-bold text-teal-800 border-b border-teal-100 pb-2">
            6. Investigations
          </h3>
          <div className="grid grid-cols-3 gap-3">
            <div className="space-y-1">
              <label className="font-bold text-slate-700">CBC / Hb</label>
              <input
                id="cbc"
                value={formData.cbc}
                onChange={handleChange}
                className="w-full border border-slate-300 rounded-lg p-2"
              />
            </div>
            <div className="space-y-1">
              <label className="font-bold text-slate-700">Ferritin</label>
              <input
                id="ferritin"
                value={formData.ferritin}
                onChange={handleChange}
                className="w-full border border-slate-300 rounded-lg p-2"
              />
            </div>
            <div className="space-y-1">
              <label className="font-bold text-slate-700">Vitamin D3</label>
              <input
                id="vitD"
                value={formData.vitD}
                onChange={handleChange}
                className="w-full border border-slate-300 rounded-lg p-2"
              />
            </div>
            <div className="space-y-1">
              <label className="font-bold text-slate-700">B12</label>
              <input
                id="b12"
                value={formData.b12}
                onChange={handleChange}
                className="w-full border border-slate-300 rounded-lg p-2"
              />
            </div>
            <div className="space-y-1">
              <label className="font-bold text-slate-700">TSH</label>
              <input
                id="tsh"
                value={formData.tsh}
                onChange={handleChange}
                className="w-full border border-slate-300 rounded-lg p-2"
              />
            </div>
            <div className="space-y-1">
              <label className="font-bold text-slate-700">Iron Studies</label>
              <input
                id="iron"
                value={formData.iron}
                onChange={handleChange}
                className="w-full border border-slate-300 rounded-lg p-2"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Assessment */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-3 text-xs">
        <h3 className="font-bold text-teal-800 border-b border-teal-100 pb-2">
          7. Assessment &amp; Plan
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div className="space-y-1">
            <label className="font-bold text-slate-700">Clinical Findings</label>
            <textarea
              id="clinicalFindings"
              rows={2}
              value={formData.clinicalFindings}
              onChange={handleChange}
              className="w-full border border-slate-300 rounded-lg p-2"
            />
          </div>
          <div className="space-y-1">
            <label className="font-bold text-slate-700">Assessment</label>
            <textarea
              id="assessment"
              rows={2}
              value={formData.assessment}
              onChange={handleChange}
              className="w-full border border-slate-300 rounded-lg p-2"
            />
          </div>
          <div className="space-y-1">
            <label className="font-bold text-slate-700">Homeopathic Treatment</label>
            <textarea
              id="treatment"
              rows={2}
              value={formData.treatment}
              onChange={handleChange}
              className="w-full border border-slate-300 rounded-lg p-2"
            />
          </div>
          <div className="space-y-1">
            <label className="font-bold text-slate-700">Advice</label>
            <textarea
              id="advice"
              rows={2}
              value={formData.advice}
              onChange={handleChange}
              className="w-full border border-slate-300 rounded-lg p-2"
            />
          </div>
          <div className="space-y-1">
            <label className="font-bold text-slate-700">Follow-up Date</label>
            <input
              id="followup"
              type="date"
              value={formData.followup}
              onChange={handleChange}
              className="w-full border border-slate-300 rounded-lg p-2"
            />
          </div>
          <div className="space-y-1">
            <label className="font-bold text-slate-700">Follow-up Notes</label>
            <input
              id="followupNotes"
              value={formData.followupNotes}
              onChange={handleChange}
              className="w-full border border-slate-300 rounded-lg p-2"
            />
          </div>
        </div>
      </div>

      {/* Sticky action footer */}
      <div className="sticky bottom-0 bg-white/95 backdrop-blur-xs p-4 rounded-2xl border border-slate-200 shadow-lg flex items-center justify-center gap-3 z-30">
        <button
          type="button"
          onClick={handleSave}
          disabled={saving}
          className="px-5 py-2.5 bg-teal-700 hover:bg-teal-800 disabled:opacity-60 text-white font-bold text-xs rounded-xl shadow-xs flex items-center gap-2"
        >
          {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
          <span>{saving ? 'Saving...' : 'Save Case'}</span>
        </button>

        <button
          type="button"
          onClick={handleSubmit}
          disabled={saving}
          className="px-5 py-2.5 bg-sky-700 hover:bg-sky-800 disabled:opacity-60 text-white font-bold text-xs rounded-xl shadow-xs flex items-center gap-2"
        >
          <Printer className="w-4 h-4" />
          <span>Submit &amp; Print</span>
        </button>

        <button
          type="button"
          onClick={handleClear}
          className="px-5 py-2.5 bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs rounded-xl shadow-xs flex items-center gap-2"
        >
          <RotateCcw className="w-4 h-4" />
          <span>Clear</span>
        </button>
      </div>

      <span className="hidden">
        <X />
        <Heart />
      </span>
    </div>
  );
};