import React, { useState, useEffect } from 'react';
import { useClinic } from '../../context/ClinicContext';
import {
  Bone,
  Save,
  CheckCircle2,
  RotateCcw,
  Printer,
  FileText,
  AlertTriangle,
  Activity
} from 'lucide-react';

export interface MusculoskeletalFormData {
  patientName: string;
  age: string;
  sex: string;
  date: string;
  patientId: string;
  mobile: string;
  address: string;

  // 2. Main Complaint
  mainComplaint: string[];
  complaintDuration: string;
  complaintOnset: string;
  complaintSeverity: string;

  // 3. Pain Characteristics
  painCharacter: string[];
  worseFrom: string[];
  betterFrom: string[];

  // 4. Joint Complaints
  jointComplaints: string[];
  affectedJoint: string;
  jointType: string;
  symmetrical: string;

  // 5. Spine Complaints
  spineComplaints: string[];
  spineRadiation: string[];
  knownSpineCondition: string;
  spineDuration: string;
  previousSpineTreatment: string;

  // 6. Spinal Cord & Neurological
  spinalNeuro: string[];
  bladderBowel: string[];
  neuroDetails: string;

  // 7. Sciatica
  sciatica: string[];
  sciaticaSide: string;
  sciaticaDuration: string;
  sciaticaProgression: string;

  // 8. Injury / Trauma
  previousInjury: string;
  injuryType: string;
  injuryDate: string;
  injuryDetails: string;

  // 9. Movement Limitation
  movementLimitation: string[];

  // 10. Stiffness
  morningStiffness: string;
  stiffnessDuration: string;
  stiffnessImprovesWith: string;

  // 11. Muscle Complaints
  muscleComplaints: string[];
  muscleDetails: string;

  // 12. Bone & Foot Complaints
  boneFootComplaints: string[];
  boneFootDetails: string;

  // 13. Previous Diagnosis
  previousDiagnosis: string[];
  previousDiagnosisDetails: string;

  // 14. Investigations
  investigations: string[];
  investigationFindings: string;

  // 15. Red Flags
  redFlags: string[];
  urgentNotes: string;

  // 16. Clinical Assessment
  diagnosis: string;
  affectedRegion: string;
  clinicalSeverity: string;
  clinicalNotes: string;
  treatment: string;
  advice: string;
  followup: string;
  savedAt?: string;
}

const INITIAL_MSK_DATA: MusculoskeletalFormData = {
  patientName: '',
  age: '',
  sex: '',
  date: new Date().toISOString().split('T')[0],
  patientId: '',
  mobile: '',
  address: '',

  mainComplaint: ['Joint Pain', 'Joint Stiffness', 'Low Back Pain', 'Knee Pain'],
  complaintDuration: '8 months',
  complaintOnset: 'Gradual / हळूहळू',
  complaintSeverity: 'Moderate / मध्यम',

  painCharacter: ['Aching', 'Stiffness', 'Heaviness'],
  worseFrom: ['Movement', 'Cold', 'Stairs', 'Humidity'],
  betterFrom: ['Rest', 'Warmth', 'Massage'],

  jointComplaints: ['Swelling', 'Stiffness', 'Cracking Sound', 'Restricted Movement'],
  affectedJoint: 'Bilateral Knees & Lumbar Spine (L4-L5)',
  jointType: 'Multiple Joints',
  symmetrical: 'Yes',

  spineComplaints: ['Low Back Pain', 'Spinal Stiffness', 'Morning Stiffness', 'Pain on Bending'],
  spineRadiation: ['Hip', 'Thigh'],
  knownSpineCondition: 'Lumbar Spondylosis with mild disc bulge',
  spineDuration: '1 year',
  previousSpineTreatment: 'Physiotherapy & NSAIDs with temporary relief',

  spinalNeuro: ['Numbness', 'Tingling', 'Limb Heaviness'],
  bladderBowel: [],
  neuroDetails: 'Occasional tingling sensation down the right lateral thigh after prolonged sitting',

  sciatica: ['Pain from Back to Leg', 'Pain to Buttock', 'Pain to Thigh', 'Tingling'],
  sciaticaSide: 'Right / उजवी',
  sciaticaDuration: '4 months',
  sciaticaProgression: 'Intermittent',

  previousInjury: 'No',
  injuryType: '',
  injuryDate: '',
  injuryDetails: '',

  movementLimitation: [
    'Difficulty Walking',
    'Difficulty Climbing Stairs',
    'Difficulty Sitting',
    'Daily Activity Limitation'
  ],

  morningStiffness: 'Yes',
  stiffnessDuration: '25-30 minutes',
  stiffnessImprovesWith: 'Movement / हालचाल',

  muscleComplaints: ['Muscle Pain', 'Muscle Stiffness', 'Cramps'],
  muscleDetails: 'Calf muscle cramps at night in bed',

  boneFootComplaints: ['Heel Pain'],
  boneFootDetails: 'Mild morning heel soreness on taking the first few steps',

  previousDiagnosis: ['Osteoarthritis', 'Lumbar Spondylosis', 'Sciatica'],
  previousDiagnosisDetails: 'Knee X-ray shows medial joint space reduction Grade II OA',

  investigations: ['X-Ray', 'MRI', 'Calcium', 'Vitamin D'],
  investigationFindings: 'X-Ray Knee: Osteophytic lipping medial compartment. Serum Vit D: 18 ng/mL (Deficient).',

  redFlags: [],
  urgentNotes: '',

  diagnosis: 'Bilateral Knee Osteoarthritis (Grade II) & Lumbar Spondylosis with Rt Sciatalgia',
  affectedRegion: 'Knee Joints & L4-S1 Lumbar Vertebrae',
  clinicalSeverity: 'Moderate',
  clinicalNotes: 'Rhus Toxicodendron totality: &lt; First motion, rest, cold damp weather; &gt; Continuous gentle motion, warmth.',
  treatment: 'Rhus Toxicodendron 200C BD for 10 days, followed by Calcarea Fluorica 6X 4 tabs TDS',
  advice: 'Quadriceps isometric exercises, avoid cross-legged sitting, warm mustard oil massage, Vit D3 60k weekly',
  followup: ''
};

export const MusculoskeletalCaseForm: React.FC = () => {
  const {
    selectedPatient,
    patients,
    selectPatient,
    saveSystemForm,
    systemForms,
    setActiveTab
  } = useClinic();

  const [formData, setFormData] = useState<MusculoskeletalFormData>(INITIAL_MSK_DATA);
  const [statusMessage, setStatusMessage] = useState<string>('');
  const [statusType, setStatusType] = useState<'success' | 'error' | 'info'>('info');

  useEffect(() => {
    if (selectedPatient) {
      const existing = systemForms.find(
        f => f.patientId === selectedPatient.id && f.system === 'musculoskeletal'
      );

      if (existing && existing.data) {
        setFormData({
          ...INITIAL_MSK_DATA,
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
        const stored = localStorage.getItem(`MSK_CASE_${selectedPatient.id}`);
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

  const handleCheckboxToggle = (category: keyof MusculoskeletalFormData, value: string) => {
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
      localStorage.setItem(`MSK_CASE_${selectedPatient.id}`, JSON.stringify(updatedData));
    }
    localStorage.setItem('MSK_CASE_' + formData.patientName, JSON.stringify(updatedData));

    const chiefComplaintsText = [
      formData.mainComplaint?.length ? `Joints/Spine: ${formData.mainComplaint.join(', ')}` : '',
      formData.affectedJoint ? `Location: ${formData.affectedJoint}` : '',
      formData.complaintDuration ? `Duration: ${formData.complaintDuration}` : '',
      formData.morningStiffness === 'Yes' ? `Morning stiffness: ${formData.stiffnessDuration}` : ''
    ].filter(Boolean).join(' • ');

    const modalitiesAgg = formData.worseFrom?.join(', ') || 'Movement, cold damp weather, stairs';
    const modalitiesAmel = formData.betterFrom?.join(', ') || 'Warmth, gentle motion, rest';

    if (selectedPatient) {
      saveSystemForm({
        patientId: selectedPatient.id,
        system: 'musculoskeletal',
        chiefComplaints: chiefComplaintsText || 'Musculoskeletal & Spine Assessment',
        duration: formData.complaintDuration || 'Recorded Case',
        severity: formData.complaintSeverity?.includes('Severe') || formData.clinicalSeverity === 'Severe' ? 'Severe' : formData.complaintSeverity?.includes('Mild') ? 'Mild' : 'Moderate',
        modalitiesAggravation: modalitiesAgg,
        modalitiesAmelioration: modalitiesAmel,
        concomitants: formData.spineRadiation?.join(', ') || formData.muscleDetails || '',
        clinicalNotes: formData.clinicalNotes || formData.diagnosis || '',
        data: updatedData,
        submittedVia: 'Doctor_Dashboard'
      });
    }

    setStatusMessage('✓ Musculoskeletal Case Saved Successfully / केस यशस्वीरित्या सेव्ह झाली. Synced to Case Summary.');
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
      setFormData(INITIAL_MSK_DATA);
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
            <Bone className="w-5 h-5" />
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
              Musculoskeletal System Case Taking (मस्क्युलोस्केलेटल सिस्टम केस टेकिंग)
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
          Musculoskeletal System Case Taking
        </h2>
        <div className="text-sm sm:text-base font-medium opacity-90 mt-0.5">
          मस्क्युलोस्केलेटल सिस्टम केस टेकिंग
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

      {/* 2. Main Complaint */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-6 space-y-4">
        <h3 className="text-base font-bold text-emerald-800 border-b border-emerald-100 pb-3 -mx-6 -mt-6 px-6 pt-4 bg-emerald-50/40 rounded-t-2xl">
          2. Main Musculoskeletal Complaint / मुख्य स्नायू-सांधे तक्रार
        </h3>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-2">
          {[
            { key: 'Joint Pain', label: 'Joint Pain / सांधेदुखी' },
            { key: 'Muscle Pain', label: 'Muscle Pain / स्नायूदुखी' },
            { key: 'Bone Pain', label: 'Bone Pain / हाडदुखी' },
            { key: 'Joint Stiffness', label: 'Joint Stiffness / सांधे कडक' },
            { key: 'Joint Swelling', label: 'Joint Swelling / सांधे सुजणे' },
            { key: 'Neck Pain', label: 'Neck Pain / मानदुखी' },
            { key: 'Back Pain', label: 'Back Pain / पाठदुखी' },
            { key: 'Low Back Pain', label: 'Low Back Pain / कंबरदुखी' },
            { key: 'Shoulder Pain', label: 'Shoulder Pain / खांदेदुखी' },
            { key: 'Knee Pain', label: 'Knee Pain / गुडघेदुखी' },
            { key: 'Hip Pain', label: 'Hip Pain / नितंबदुखी' },
            { key: 'Ankle Pain', label: 'Ankle Pain / घोट्याचा त्रास' },
            { key: 'Heel Pain', label: 'Heel Pain / टाचदुखी' },
            { key: 'Foot Pain', label: 'Foot Pain / पायाचा त्रास' },
            { key: 'Radiating Pain', label: 'Radiating / पसरत जाणारे' },
            { key: 'Movement Limitation', label: 'Limitation / हालचाली मर्यादित' }
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
              placeholder="e.g. 6 months"
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
              <option value="Sudden / अचानक">Sudden / अचानक</option>
              <option value="Gradual / हळूहळू">Gradual / हळूहळू</option>
              <option value="After Injury / दुखापतीनंतर">After Injury / दुखापतीनंतर</option>
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
              <option value="Mild / सौम्य">Mild / सौम्य</option>
              <option value="Moderate / मध्यम">Moderate / मध्यम</option>
              <option value="Severe / तीव्र">Severe / तीव्र</option>
            </select>
          </div>
        </div>
      </div>

      {/* 3. Pain Characteristics */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-6 space-y-4">
        <h3 className="text-base font-bold text-emerald-800 border-b border-emerald-100 pb-3 -mx-6 -mt-6 px-6 pt-4 bg-emerald-50/40 rounded-t-2xl">
          3. Pain Characteristics / वेदनेचे स्वरूप व घटके
        </h3>

        {/* Character */}
        <div className="space-y-1.5">
          <div className="font-bold text-xs text-emerald-950">Character / दुखण्याचा प्रकार</div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {[
              'Aching / ठणकणे', 'Sharp / तीक्ष्ण', 'Stitching / टोचणे', 'Burning / जळजळ',
              'Cramping / मुरडा', 'Throbbing / ठणकणारे', 'Pulling / ओढल्यासारखे', 'Tearing / फाटल्यासारखे',
              'Numbness / बधिरपणा', 'Tingling / मुंग्या', 'Electric Shock-like', 'Heaviness / जडपणा'
            ].map(item => {
              const key = item.split(' / ')[0];
              const checked = formData.painCharacter.includes(key);
              return (
                <label key={item} className="flex items-center gap-2 p-1.5 border rounded-lg text-xs cursor-pointer bg-slate-50">
                  <input
                    type="checkbox"
                    checked={checked}
                    onChange={() => handleCheckboxToggle('painCharacter', key)}
                    className="accent-emerald-600"
                  />
                  <span>{item}</span>
                </label>
              );
            })}
          </div>
        </div>

        {/* Worse From */}
        <div className="space-y-1.5 pt-2">
          <div className="font-bold text-xs text-rose-900">Worse From (&lt;) / कशाने वाढते?</div>
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
            {[
              'Movement / हालचाल', 'Walking / चालणे', 'Standing / उभे राहणे', 'Sitting / बसणे',
              'Bending / वाकणे', 'Stairs / जिने', 'Lifting Weight / वजन', 'Cold / थंडी',
              'Humidity / दमट', 'Rest / विश्रांती'
            ].map(item => {
              const key = item.split(' / ')[0];
              const checked = formData.worseFrom.includes(key);
              return (
                <label key={item} className="flex items-center gap-1.5 p-1.5 border border-rose-100 rounded-lg text-xs cursor-pointer bg-rose-50/40 text-rose-950">
                  <input
                    type="checkbox"
                    checked={checked}
                    onChange={() => handleCheckboxToggle('worseFrom', key)}
                    className="accent-rose-600"
                  />
                  <span>{item}</span>
                </label>
              );
            })}
          </div>
        </div>

        {/* Better From */}
        <div className="space-y-1.5 pt-2">
          <div className="font-bold text-xs text-teal-900">Better From (&gt;) / कशाने आराम मिळतो?</div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {[
              'Rest / विश्रांती', 'Movement / हालचाल', 'Warmth / उष्णता', 'Massage / मालिश',
              'Pressure / दाब', 'Stretching / स्ट्रेचिंग', 'Changing Position', 'Other / इतर'
            ].map(item => {
              const key = item.split(' / ')[0];
              const checked = formData.betterFrom.includes(key);
              return (
                <label key={item} className="flex items-center gap-1.5 p-1.5 border border-teal-100 rounded-lg text-xs cursor-pointer bg-teal-50/40 text-teal-950">
                  <input
                    type="checkbox"
                    checked={checked}
                    onChange={() => handleCheckboxToggle('betterFrom', key)}
                    className="accent-teal-600"
                  />
                  <span>{item}</span>
                </label>
              );
            })}
          </div>
        </div>
      </div>

      {/* 4 & 5. Joint Complaints & Spine */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* 4. Joint Complaints */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-6 space-y-3">
          <h3 className="text-sm font-bold text-emerald-800 border-b border-emerald-100 pb-2">
            4. Joint Complaints / सांध्यांच्या तक्रारी
          </h3>
          <div className="grid grid-cols-2 gap-1.5">
            {[
              'Swelling / सूज', 'Redness / लालसरपणा', 'Warmth / उष्णता',
              'Stiffness / कडकपणा', 'Cracking Sound / कटकट आवाज', 'Restricted Movement',
              'Locking / लॉक होणे', 'Instability / अस्थिर वाटणे'
            ].map(item => {
              const key = item.split(' / ')[0];
              return (
                <label key={item} className="flex items-center gap-1.5 text-xs text-slate-700 cursor-pointer p-1">
                  <input
                    type="checkbox"
                    checked={formData.jointComplaints.includes(key)}
                    onChange={() => handleCheckboxToggle('jointComplaints', key)}
                    className="accent-emerald-600"
                  />
                  <span>{item}</span>
                </label>
              );
            })}
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 pt-2">
            <div>
              <label className="block text-[11px] font-bold text-slate-600 mb-0.5">Affected Joint</label>
              <input
                id="affectedJoint"
                type="text"
                value={formData.affectedJoint}
                onChange={handleChange}
                placeholder="e.g. Bilateral knees"
                className="w-full px-2 py-1 border border-slate-300 rounded text-xs"
              />
            </div>
            <div>
              <label className="block text-[11px] font-bold text-slate-600 mb-0.5">Single / Multiple</label>
              <select
                id="jointType"
                value={formData.jointType}
                onChange={handleChange}
                className="w-full px-2 py-1 border border-slate-300 rounded text-xs bg-white"
              >
                <option value="Single Joint">Single Joint</option>
                <option value="Multiple Joints">Multiple Joints</option>
              </select>
            </div>
            <div>
              <label className="block text-[11px] font-bold text-slate-600 mb-0.5">Symmetrical?</label>
              <select
                id="symmetrical"
                value={formData.symmetrical}
                onChange={handleChange}
                className="w-full px-2 py-1 border border-slate-300 rounded text-xs bg-white"
              >
                <option value="Yes">Yes</option>
                <option value="No">No</option>
              </select>
            </div>
          </div>
        </div>

        {/* 5. Spine Complaints */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-6 space-y-3">
          <h3 className="text-sm font-bold text-emerald-800 border-b border-emerald-100 pb-2">
            5. Spine Complaints & Radiation / मणक्यांच्या तक्रारी
          </h3>
          <div className="grid grid-cols-2 gap-1.5">
            {[
              'Neck Pain / मानदुखी', 'Cervical Stiffness', 'Upper Back Pain',
              'Mid Back Pain', 'Low Back Pain / कंबरदुखी', 'Spinal Stiffness',
              'Pain on Bending', 'Morning Stiffness'
            ].map(item => {
              const key = item.split(' / ')[0];
              return (
                <label key={item} className="flex items-center gap-1.5 text-xs text-slate-700 cursor-pointer p-1">
                  <input
                    type="checkbox"
                    checked={formData.spineComplaints.includes(key)}
                    onChange={() => handleCheckboxToggle('spineComplaints', key)}
                    className="accent-emerald-600"
                  />
                  <span>{item}</span>
                </label>
              );
            })}
          </div>
          <div className="pt-1">
            <div className="text-[11px] font-bold text-slate-600 mb-1">Radiation to: / वेदना कुठे पसरतात?</div>
            <div className="grid grid-cols-3 gap-1">
              {['Shoulder', 'Arm', 'Hand', 'Hip', 'Thigh', 'Leg', 'Foot'].map(r => (
                <label key={r} className="flex items-center gap-1 text-xs text-slate-600">
                  <input
                    type="checkbox"
                    checked={formData.spineRadiation.includes(r)}
                    onChange={() => handleCheckboxToggle('spineRadiation', r)}
                    className="accent-emerald-600"
                  />
                  <span>{r}</span>
                </label>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* 6 & 7. Neurological & Sciatica */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-6 space-y-3">
          <h3 className="text-sm font-bold text-emerald-800 border-b border-emerald-100 pb-2">
            6. Spinal Cord & Neurological / मज्जारज्जू संबंधित
          </h3>
          <div className="grid grid-cols-2 gap-1.5">
            {[
              'Numbness', 'Tingling', 'Pins & Needles', 'Weakness of Limb',
              'Difficulty Walking', 'Balance Problem', 'Electric Shock Sensation', 'Limb Heaviness'
            ].map(item => (
              <label key={item} className="flex items-center gap-1.5 text-xs text-slate-700 cursor-pointer p-1">
                <input
                  type="checkbox"
                  checked={formData.spinalNeuro.includes(item)}
                  onChange={() => handleCheckboxToggle('spinalNeuro', item)}
                  className="accent-emerald-600"
                />
                <span>{item}</span>
              </label>
            ))}
          </div>
          <textarea
            id="neuroDetails"
            rows={2}
            value={formData.neuroDetails}
            onChange={handleChange}
            placeholder="Neurological distribution, progression, sensory blunting..."
            className="w-full px-2.5 py-1.5 border border-slate-300 rounded text-xs"
          />
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-6 space-y-3">
          <h3 className="text-sm font-bold text-emerald-800 border-b border-emerald-100 pb-2">
            7. Sciatica / Radicular Pain / सायाटिका वेदना
          </h3>
          <div className="grid grid-cols-2 gap-1.5">
            {[
              'Pain from Back to Leg', 'Pain to Buttock', 'Pain to Thigh',
              'Pain to Calf', 'Pain to Foot', 'Numbness', 'Tingling', 'Weakness'
            ].map(item => (
              <label key={item} className="flex items-center gap-1.5 text-xs text-slate-700 cursor-pointer p-1">
                <input
                  type="checkbox"
                  checked={formData.sciatica.includes(item)}
                  onChange={() => handleCheckboxToggle('sciatica', item)}
                  className="accent-emerald-600"
                />
                <span>{item}</span>
              </label>
            ))}
          </div>
          <div className="grid grid-cols-3 gap-2 pt-1">
            <select
              id="sciaticaSide"
              value={formData.sciaticaSide}
              onChange={handleChange}
              className="px-2 py-1 border border-slate-300 rounded text-xs bg-white"
            >
              <option value="">Side</option>
              <option value="Right / उजवी">Right</option>
              <option value="Left / डावी">Left</option>
              <option value="Both / दोन्ही">Both</option>
            </select>
            <input
              id="sciaticaDuration"
              type="text"
              value={formData.sciaticaDuration}
              onChange={handleChange}
              placeholder="Duration"
              className="px-2 py-1 border border-slate-300 rounded text-xs"
            />
            <select
              id="sciaticaProgression"
              value={formData.sciaticaProgression}
              onChange={handleChange}
              className="px-2 py-1 border border-slate-300 rounded text-xs bg-white"
            >
              <option value="Stable">Stable</option>
              <option value="Increasing">Increasing</option>
              <option value="Intermittent">Intermittent</option>
            </select>
          </div>
        </div>
      </div>

      {/* 8, 9 & 10. Injury, Movement Limitation & Stiffness */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* 8. Injury */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-5 space-y-2.5">
          <h4 className="font-bold text-xs text-emerald-900 border-b border-slate-100 pb-1.5">
            8. Injury / Trauma / दुखापत इतिहास
          </h4>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block text-[11px] font-bold text-slate-600 mb-0.5">Previous Injury?</label>
              <select
                id="previousInjury"
                value={formData.previousInjury}
                onChange={handleChange}
                className="w-full px-2 py-1 border border-slate-300 rounded text-xs bg-white"
              >
                <option value="No">No</option>
                <option value="Yes">Yes</option>
              </select>
            </div>
            <div>
              <label className="block text-[11px] font-bold text-slate-600 mb-0.5">Type</label>
              <input
                id="injuryType"
                type="text"
                value={formData.injuryType}
                onChange={handleChange}
                placeholder="e.g. Fall / Sports"
                className="w-full px-2 py-1 border border-slate-300 rounded text-xs"
              />
            </div>
          </div>
          <input
            id="injuryDetails"
            type="text"
            value={formData.injuryDetails}
            onChange={handleChange}
            placeholder="Details of injury & dates..."
            className="w-full px-2 py-1 border border-slate-300 rounded text-xs"
          />
        </div>

        {/* 9. Movement Limitation */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-5 space-y-2.5">
          <h4 className="font-bold text-xs text-emerald-900 border-b border-slate-100 pb-1.5">
            9. Movement Limitations / मर्यादा
          </h4>
          <div className="grid grid-cols-1 gap-1">
            {[
              'Difficulty Walking', 'Difficulty Climbing Stairs',
              'Difficulty Sitting', 'Difficulty Bending',
              'Difficulty Lifting', 'Daily Activity Limitation'
            ].map(item => (
              <label key={item} className="flex items-center gap-1.5 text-xs text-slate-700 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.movementLimitation.includes(item)}
                  onChange={() => handleCheckboxToggle('movementLimitation', item)}
                  className="accent-emerald-600"
                />
                <span className="truncate">{item}</span>
              </label>
            ))}
          </div>
        </div>

        {/* 10. Stiffness */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-5 space-y-2.5">
          <h4 className="font-bold text-xs text-emerald-900 border-b border-slate-100 pb-1.5">
            10. Morning Stiffness / सकाळचा कडकपणा
          </h4>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block text-[11px] font-bold text-slate-600 mb-0.5">Present?</label>
              <select
                id="morningStiffness"
                value={formData.morningStiffness}
                onChange={handleChange}
                className="w-full px-2 py-1 border border-slate-300 rounded text-xs bg-white"
              >
                <option value="No">No</option>
                <option value="Yes">Yes</option>
              </select>
            </div>
            <div>
              <label className="block text-[11px] font-bold text-slate-600 mb-0.5">Duration</label>
              <input
                id="stiffnessDuration"
                type="text"
                value={formData.stiffnessDuration}
                onChange={handleChange}
                placeholder="e.g. 25 mins"
                className="w-full px-2 py-1 border border-slate-300 rounded text-xs"
              />
            </div>
          </div>
          <div>
            <label className="block text-[11px] font-bold text-slate-600 mb-0.5">Improves With / कशाने कमी?</label>
            <select
              id="stiffnessImprovesWith"
              value={formData.stiffnessImprovesWith}
              onChange={handleChange}
              className="w-full px-2 py-1 border border-slate-300 rounded text-xs bg-white"
            >
              <option value="Movement / हालचाल">Movement / हालचाल</option>
              <option value="Rest / विश्रांती">Rest / विश्रांती</option>
              <option value="Warmth / उष्णता">Warmth / उष्णता</option>
            </select>
          </div>
        </div>
      </div>

      {/* 11 & 12. Muscle & Bone Complaints */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-6 space-y-3">
          <h3 className="text-sm font-bold text-emerald-800 border-b border-emerald-100 pb-2">
            11. Muscle Complaints / स्नायूंच्या तक्रारी
          </h3>
          <div className="grid grid-cols-2 gap-1.5">
            {[
              'Muscle Pain', 'Muscle Stiffness', 'Muscle Spasm', 'Cramps',
              'Weakness', 'Fatigue', 'Muscle Wasting', 'Twitching'
            ].map(item => (
              <label key={item} className="flex items-center gap-1.5 text-xs text-slate-700 cursor-pointer p-1">
                <input
                  type="checkbox"
                  checked={formData.muscleComplaints.includes(item)}
                  onChange={() => handleCheckboxToggle('muscleComplaints', item)}
                  className="accent-emerald-600"
                />
                <span>{item}</span>
              </label>
            ))}
          </div>
          <input
            id="muscleDetails"
            type="text"
            value={formData.muscleDetails}
            onChange={handleChange}
            placeholder="Muscle details (e.g. nocturnal calf cramps)..."
            className="w-full px-2.5 py-1.5 border border-slate-300 rounded text-xs"
          />
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-6 space-y-3">
          <h3 className="text-sm font-bold text-emerald-800 border-b border-emerald-100 pb-2">
            12. Bone & Foot Complaints / हाडे व पायाच्या तक्रारी
          </h3>
          <div className="grid grid-cols-2 gap-1.5">
            {[
              'Bone Pain', 'Heel Pain', 'Calcaneal Spur', 'Foot Pain',
              'Plantar Pain', 'Pain on First Step', 'Fracture History', 'Bone Swelling'
            ].map(item => (
              <label key={item} className="flex items-center gap-1.5 text-xs text-slate-700 cursor-pointer p-1">
                <input
                  type="checkbox"
                  checked={formData.boneFootComplaints.includes(item)}
                  onChange={() => handleCheckboxToggle('boneFootComplaints', item)}
                  className="accent-emerald-600"
                />
                <span>{item}</span>
              </label>
            ))}
          </div>
          <input
            id="boneFootDetails"
            type="text"
            value={formData.boneFootDetails}
            onChange={handleChange}
            placeholder="Heel spur or bone pain details..."
            className="w-full px-2.5 py-1.5 border border-slate-300 rounded text-xs"
          />
        </div>
      </div>

      {/* 13 & 14. Previous Diagnosis & Investigations */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-6 space-y-3">
          <h3 className="text-sm font-bold text-emerald-800 border-b border-emerald-100 pb-2">
            13. Previous Musculoskeletal Diagnosis / पूर्वीचे निदान
          </h3>
          <div className="grid grid-cols-2 gap-1.5">
            {[
              'Osteoarthritis', 'Rheumatoid Arthritis', 'Cervical Spondylosis',
              'Lumbar Spondylosis', 'Disc Problem', 'Slip Disc',
              'Sciatica', 'Gout', 'Frozen Shoulder', 'Ligament Injury'
            ].map(item => (
              <label key={item} className="flex items-center gap-1.5 text-xs text-slate-700 cursor-pointer p-1">
                <input
                  type="checkbox"
                  checked={formData.previousDiagnosis.includes(item)}
                  onChange={() => handleCheckboxToggle('previousDiagnosis', item)}
                  className="accent-emerald-600"
                />
                <span>{item}</span>
              </label>
            ))}
          </div>
          <input
            id="previousDiagnosisDetails"
            type="text"
            value={formData.previousDiagnosisDetails}
            onChange={handleChange}
            placeholder="Previous diagnosis notes..."
            className="w-full px-2.5 py-1.5 border border-slate-300 rounded text-xs"
          />
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-6 space-y-3">
          <h3 className="text-sm font-bold text-emerald-800 border-b border-emerald-100 pb-2">
            14. Investigations / तपासण्या
          </h3>
          <div className="grid grid-cols-3 gap-1.5">
            {[
              'X-Ray', 'MRI', 'CT Scan', 'Bone Density/DEXA',
              'CBC', 'ESR', 'CRP', 'Uric Acid',
              'Calcium', 'Vitamin D', 'Vitamin B12', 'RA Factor'
            ].map(item => (
              <label key={item} className="flex items-center gap-1.5 text-xs text-slate-700 cursor-pointer p-1">
                <input
                  type="checkbox"
                  checked={formData.investigations.includes(item)}
                  onChange={() => handleCheckboxToggle('investigations', item)}
                  className="accent-emerald-600"
                />
                <span>{item}</span>
              </label>
            ))}
          </div>
          <textarea
            id="investigationFindings"
            rows={2}
            value={formData.investigationFindings}
            onChange={handleChange}
            placeholder="X-Ray findings, joint space narrowing, Dexa T-score, RA titer..."
            className="w-full px-2.5 py-1.5 border border-slate-300 rounded text-xs"
          />
        </div>
      </div>

      {/* 15. Warning / Red Flag Symptoms */}
      <div className="bg-rose-50 rounded-2xl border-2 border-rose-300/80 p-6 space-y-3">
        <h3 className="text-base font-bold text-rose-900 flex items-center gap-2">
          <AlertTriangle className="w-5 h-5 text-rose-600" />
          <span>15. Warning / Red Flag Symptoms / धोक्याची लक्षणे</span>
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2 pt-1">
          {[
            'Sudden Limb Weakness / अचानक कमजोरी',
            'Progressive Weakness / वाढत जाणारी कमजोरी',
            'Loss of Bladder Control / लघवी नियंत्रण कमी',
            'Loss of Bowel Control / शौच नियंत्रण कमी',
            'Perineal Numbness / गुप्तांगाभोवती बधिरपणा',
            'Severe Sudden Back Pain / अचानक तीव्र पाठदुखी',
            'Major Trauma / मोठी दुखापत',
            'Fever with Severe Back Pain / तापासह पाठदुखी',
            'Unexplained Weight Loss / वजन कमी होणे',
            'History of Cancer / कर्करोग इतिहास'
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
            placeholder="Cauda equina signs, urgent orthopedic or neurosurgical referral notes..."
            className="w-full px-3 py-2 border border-rose-300 rounded-lg text-xs bg-white"
          />
        </div>
      </div>

      {/* 16. Clinical Assessment & Prescribed Treatment */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-6 space-y-4">
        <h3 className="text-base font-bold text-emerald-800 border-b border-emerald-100 pb-3 -mx-6 -mt-6 px-6 pt-4 bg-emerald-50/40 rounded-t-2xl">
          16. Clinical Assessment & Treatment / क्लिनिकल मूल्यांकन व उपचार
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Provisional Diagnosis / प्राथमिक निदान</label>
            <input
              id="diagnosis"
              type="text"
              value={formData.diagnosis}
              onChange={handleChange}
              placeholder="e.g. Lumbar Spondylosis with Sciatica"
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
              placeholder="e.g. L4-S1 Lumbar Spine"
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
              placeholder="Homeopathic modalities totality, miasmatic indication, constitutional rubric..."
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
              placeholder="Simillimum remedy, potency & dosage (e.g. Rhus Tox 200C BD, Bryonia 30C)"
              className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-none font-medium"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Physiotherapy & Ergonomic Advice / सल्ला</label>
            <input
              id="advice"
              type="text"
              value={formData.advice}
              onChange={handleChange}
              placeholder="Ergonomics, posture, gentle motion"
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
            <span>Musculoskeletal Case Mode &nbsp;|&nbsp; Patient: <strong>{formData.patientName || 'None'}</strong></span>
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
