import React, { useState } from 'react';
import { useClinic } from '../../context/ClinicContext';
import { CLINIC_CONFIG } from '../../config/clinicConfig';
import { HomeoMedicine, AlloMedicine, Prescription } from '../../types';
import {
  Pill,
  Printer,
  Share2,
  Plus,
  Trash2,
  Save,
  CheckCircle2,
  FileText,
  ShieldCheck,
  Heart,
  Activity,
  Droplet,
  Weight,
  Sparkles,
  QrCode
} from 'lucide-react';

export const PrescriptionView: React.FC = () => {
  const {
    selectedPatient,
    prescriptions,
    savePrescription,
    openWhatsAppShareDialog,
    activeSystemFormKey
  } = useClinic();

  // Find existing prescription or create new
  const existingRx = selectedPatient
    ? prescriptions.find(p => p.patientId === selectedPatient.id)
    : undefined;

  const [diagnosis, setDiagnosis] = useState(
    existingRx?.diagnosis || 'Chronic Migraine & Dyspepsia (Constitutional Similimum)'
  );
  const [clinicalNotes, setClinicalNotes] = useState(
    existingRx?.clinicalNotes || 'Marked improvement observed in headache intensity and gastric symptoms.'
  );
  const [followUpDate, setFollowUpDate] = useState(
    existingRx?.followUpDate || '2026-03-30'
  );

  // Homeopathic Medicines State
  const [homeoMedicines, setHomeoMedicines] = useState<HomeoMedicine[]>(
    existingRx?.homeoMedicines || [
      {
        id: 'hm-1',
        remedy: 'Natrum Muriaticum',
        potency: '200C',
        form: 'Globules #30',
        dosage: '4 pills',
        frequency: 'OD (Once Daily)',
        duration: '3 days (Morning stat)',
        instructions: 'Take dry on tongue 30 mins before breakfast. Do not touch pills with bare fingers.'
      },
      {
        id: 'hm-2',
        remedy: 'Belladonna',
        potency: '30C',
        form: 'Globules #30',
        dosage: '4 pills',
        frequency: 'Stat / SOS',
        duration: '15 days (SOS)',
        instructions: 'Take 1 dose every 2 hours during acute throbbing attack.'
      }
    ]
  );

  // Allopathic Medicines State
  const [alloMedicines, setAlloMedicines] = useState<AlloMedicine[]>(
    existingRx?.alloMedicines || [
      {
        id: 'am-1',
        name: 'Tab. Naproxen + Domperidone (Naxdom)',
        type: 'Tablet',
        strength: '500 mg / 10 mg',
        frequency: 'SOS',
        timing: 'After Food',
        duration: 'As needed',
        instructions: 'Rescue medication for acute unbearable migraine episode only.'
      }
    ]
  );

  const [dietaryAdviseText, setDietaryAdviseText] = useState(
    existingRx?.dietaryAdvise.join('\n') ||
      'Maintain regular meal timings; avoid fasting or skipping meals.\nAvoid raw onion, garlic, or strong coffee 30 mins around homeopathic dose.\nDrink 2.5 - 3 Litres of clean water daily.\nWear protective sunglasses in bright sunlight.'
  );

  const [investigationsText, setInvestigationsText] = useState(
    existingRx?.investigationsOrdered.join(', ') || 'Serum Ferritin, Vitamin D3, Fundus Examination'
  );

  const [activeSubTab, setActiveSubTab] = useState<'editor' | 'preview'>('editor');
  const [saveSuccess, setSaveSuccess] = useState(false);

  // Add Homeo row
  const addHomeoRow = () => {
    const newHm: HomeoMedicine = {
      id: `hm-${Date.now()}`,
      remedy: 'Sulphur',
      potency: '30C',
      form: 'Globules #30',
      dosage: '4 pills',
      frequency: 'BD (Twice Daily)',
      duration: '14 days',
      instructions: 'Take in empty mouth, avoid strong flavors.'
    };
    setHomeoMedicines([...homeoMedicines, newHm]);
  };

  const removeHomeoRow = (id: string) => {
    setHomeoMedicines(homeoMedicines.filter(m => m.id !== id));
  };

  // Add Allo row
  const addAlloRow = () => {
    const newAm: AlloMedicine = {
      id: `am-${Date.now()}`,
      name: 'Tab. Pantoprazole',
      type: 'Tablet',
      strength: '40 mg',
      frequency: 'OD',
      timing: 'Before Food',
      duration: '7 days',
      instructions: 'Morning 30 mins before breakfast.'
    };
    setAlloMedicines([...alloMedicines, newAm]);
  };

  const removeAlloRow = (id: string) => {
    setAlloMedicines(alloMedicines.filter(m => m.id !== id));
  };

  const handleSave = () => {
    if (!selectedPatient) return;

    const dietaryAdvise = dietaryAdviseText
      .split('\n')
      .map(s => s.trim())
      .filter(Boolean);

    const investigationsOrdered = investigationsText
      .split(',')
      .map(s => s.trim())
      .filter(Boolean);

    savePrescription({
      id: existingRx?.id,
      patientId: selectedPatient.id,
      consultationDate: new Date().toISOString().split('T')[0],
      diagnosis,
      clinicalNotes,
      homeoMedicines,
      alloMedicines,
      dietaryAdvise,
      investigationsOrdered,
      followUpDate,
      doctorName: 'Dr. Anand Deshpande',
      doctorDegree: 'M.D. (Homoeopathy), C.C.M.P.',
      doctorRegNo: 'MCH-48921-A',
      clinicName: 'ClinicaPro Holistic Healthcare & Research Centre',
      clinicAddress: 'Suite 204, Mediplex Arcade, F.C. Road, Shivajinagar, Pune - 411005',
      clinicPhone: '+91 20 2553 9088 / +91 98220 12345'
    });

    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 2500);
  };

  if (!selectedPatient) {
    return (
      <div className="p-8 text-center bg-white rounded-2xl border border-slate-200">
        <Pill className="w-12 h-12 text-slate-400 mx-auto mb-2" />
        <h3 className="font-bold text-slate-800 text-base">No Active Patient Selected</h3>
        <p className="text-xs text-slate-500 mt-1">Please select or register a patient to write a prescription.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-12">
      {/* Top Header */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200">
              Integrated Homeopathy + Allopathy Prescriptions
            </span>
            <span className="text-slate-400">•</span>
            <span className="text-xs text-slate-600">
              Patient: <strong>{selectedPatient.name}</strong> ({selectedPatient.id})
            </span>
          </div>
          <h2 className="text-xl font-bold text-slate-900 font-serif flex items-center gap-2">
            <Pill className="w-5 h-5 text-emerald-600" />
            Clinical Prescription Slip
          </h2>
          <p className="text-xs text-slate-500">
            Generate dual Homeopathic constitutional and Allopathic supportive prescriptions with formal printable letterhead.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2 flex-wrap">
          <div className="flex bg-slate-100 p-1 rounded-xl border border-slate-200">
            <button
              onClick={() => setActiveSubTab('editor')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                activeSubTab === 'editor'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Rx Editor
            </button>
            <button
              onClick={() => setActiveSubTab('preview')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                activeSubTab === 'preview'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Letterhead View
            </button>
          </div>

          <button
            id="btn-save-prescription"
            onClick={handleSave}
            className="px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs rounded-xl transition-colors flex items-center gap-1.5 shadow-xs"
          >
            <Save className="w-4 h-4" />
            <span>Save Prescription</span>
          </button>

          <button
            onClick={() => window.print()}
            className="px-3.5 py-2 bg-slate-900 hover:bg-slate-800 text-white font-semibold text-xs rounded-xl transition-colors flex items-center gap-1.5 shadow-xs"
          >
            <Printer className="w-4 h-4" />
            <span>Print Rx</span>
          </button>
        </div>
      </div>

      {saveSuccess && (
        <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-200 text-emerald-800 font-semibold text-xs flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          Prescription saved and attached to {selectedPatient.name}'s medical record.
        </div>
      )}

      {activeSubTab === 'editor' ? (
        /* Rx Editor Form */
        <div className="space-y-6 text-xs">
          {/* Diagnosis & Clinical Vitals */}
          <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-4">
            <h3 className="font-bold text-slate-900 text-sm uppercase tracking-wider text-slate-400">
              Clinical Diagnosis & Encounter Vitals
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="md:col-span-2">
                <label className="block font-bold text-slate-800 mb-1">Clinical Diagnosis *</label>
                <input
                  type="text"
                  value={diagnosis}
                  onChange={(e) => setDiagnosis(e.target.value)}
                  placeholder="e.g. Chronic Migraine with Gastrointestinal Dyspepsia"
                  className="w-full border border-slate-300 rounded-lg p-2 text-xs text-slate-900 focus:ring-2 focus:ring-teal-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-medium text-slate-700 mb-1">Next Follow-up Date</label>
                <input
                  type="date"
                  value={followUpDate}
                  onChange={(e) => setFollowUpDate(e.target.value)}
                  className="w-full border border-slate-300 rounded-lg p-2 text-xs text-slate-900 focus:ring-2 focus:ring-teal-500 focus:outline-none"
                />
              </div>
            </div>
          </div>

          {/* Section 1: Homeopathic Prescriptions */}
          <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-teal-50 text-teal-700 flex items-center justify-center font-bold">
                  H
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 text-sm">
                    Homeopathic Medicines (Constitutional & Acute)
                  </h3>
                  <p className="text-[11px] text-slate-500">Remedy, Potency, Dosage, Frequency & Vehicle</p>
                </div>
              </div>
              <button
                type="button"
                onClick={addHomeoRow}
                className="px-3 py-1.5 bg-teal-50 hover:bg-teal-100 text-teal-700 rounded-lg font-semibold text-xs transition-colors flex items-center gap-1 border border-teal-200"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Remedy</span>
              </button>
            </div>

            <div className="space-y-3">
              {homeoMedicines.map((hm, index) => (
                <div
                  key={hm.id}
                  className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-2"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-700 text-xs">
                      #{index + 1} Homeopathic Medicine
                    </span>
                    <button
                      type="button"
                      onClick={() => removeHomeoRow(hm.id)}
                      className="text-slate-400 hover:text-rose-600 p-1"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-5 gap-2">
                    <div className="sm:col-span-2">
                      <label className="block text-[11px] font-medium text-slate-600 mb-0.5">Remedy Name</label>
                      <input
                        type="text"
                        value={hm.remedy}
                        onChange={(e) => {
                          const copy = [...homeoMedicines];
                          copy[index].remedy = e.target.value;
                          setHomeoMedicines(copy);
                        }}
                        placeholder="e.g. Natrum Muriaticum, Nux Vomica"
                        className="w-full bg-white border border-slate-300 rounded-lg p-1.5 text-xs text-slate-900 focus:outline-none"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-medium text-slate-600 mb-0.5">Potency</label>
                      <select
                        value={hm.potency}
                        onChange={(e) => {
                          const copy = [...homeoMedicines];
                          copy[index].potency = e.target.value as any;
                          setHomeoMedicines(copy);
                        }}
                        className="w-full bg-white border border-slate-300 rounded-lg p-1.5 text-xs text-slate-900 focus:outline-none"
                      >
                        {['6C', '30C', '200C', '1M', '10M', '50M', 'CM', 'LM 1', 'LM 2', 'LM 3', 'Q (Mother Tincture)', '3X', '6X', '12X'].map(p => (
                          <option key={p} value={p}>{p}</option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-[11px] font-medium text-slate-600 mb-0.5">Vehicle / Form</label>
                      <select
                        value={hm.form}
                        onChange={(e) => {
                          const copy = [...homeoMedicines];
                          copy[index].form = e.target.value as any;
                          setHomeoMedicines(copy);
                        }}
                        className="w-full bg-white border border-slate-300 rounded-lg p-1.5 text-xs text-slate-900 focus:outline-none"
                      >
                        {['Globules #30', 'Globules #40', 'Dilution Drops', 'Biochemic Tablets', 'Trituration Powder'].map(f => (
                          <option key={f} value={f}>{f}</option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-[11px] font-medium text-slate-600 mb-0.5">Frequency</label>
                      <select
                        value={hm.frequency}
                        onChange={(e) => {
                          const copy = [...homeoMedicines];
                          copy[index].frequency = e.target.value as any;
                          setHomeoMedicines(copy);
                        }}
                        className="w-full bg-white border border-slate-300 rounded-lg p-1.5 text-xs text-slate-900 focus:outline-none"
                      >
                        {['OD (Once Daily)', 'BD (Twice Daily)', 'TDS (Thrice Daily)', 'QID (Four Times Daily)', 'Weekly', 'Stat / SOS'].map(fr => (
                          <option key={fr} value={fr}>{fr}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    <div>
                      <label className="block text-[11px] font-medium text-slate-600 mb-0.5">Dosage & Duration</label>
                      <input
                        type="text"
                        value={`${hm.dosage} • ${hm.duration}`}
                        onChange={(e) => {
                          const copy = [...homeoMedicines];
                          copy[index].dosage = e.target.value;
                          setHomeoMedicines(copy);
                        }}
                        placeholder="e.g. 4 pills for 15 days"
                        className="w-full bg-white border border-slate-300 rounded-lg p-1.5 text-xs text-slate-900 focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-medium text-slate-600 mb-0.5">Specific Instructions</label>
                      <input
                        type="text"
                        value={hm.instructions}
                        onChange={(e) => {
                          const copy = [...homeoMedicines];
                          copy[index].instructions = e.target.value;
                          setHomeoMedicines(copy);
                        }}
                        placeholder="e.g. Take dry on tongue 30 mins before breakfast"
                        className="w-full bg-white border border-slate-300 rounded-lg p-1.5 text-xs text-slate-900 focus:outline-none"
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Section 2: Allopathic Prescriptions */}
          <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-indigo-50 text-indigo-700 flex items-center justify-center font-bold">
                  A
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 text-sm">
                    Allopathic Prescriptions (Supportive & Acute Care)
                  </h3>
                  <p className="text-[11px] text-slate-500">Generic / Brand name, strength, food timing, duration</p>
                </div>
              </div>
              <button
                type="button"
                onClick={addAlloRow}
                className="px-3 py-1.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 rounded-lg font-semibold text-xs transition-colors flex items-center gap-1 border border-indigo-200"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Medicine</span>
              </button>
            </div>

            <div className="space-y-3">
              {alloMedicines.map((am, index) => (
                <div
                  key={am.id}
                  className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-2"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-700 text-xs">
                      #{index + 1} Allopathic Medication
                    </span>
                    <button
                      type="button"
                      onClick={() => removeAlloRow(am.id)}
                      className="text-slate-400 hover:text-rose-600 p-1"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-5 gap-2">
                    <div className="sm:col-span-2">
                      <label className="block text-[11px] font-medium text-slate-600 mb-0.5">Medicine Name & Strength</label>
                      <input
                        type="text"
                        value={am.name}
                        onChange={(e) => {
                          const copy = [...alloMedicines];
                          copy[index].name = e.target.value;
                          setAlloMedicines(copy);
                        }}
                        placeholder="e.g. Tab. Naproxen 500mg"
                        className="w-full bg-white border border-slate-300 rounded-lg p-1.5 text-xs text-slate-900 focus:outline-none"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-medium text-slate-600 mb-0.5">Dosage Form</label>
                      <select
                        value={am.type}
                        onChange={(e) => {
                          const copy = [...alloMedicines];
                          copy[index].type = e.target.value as any;
                          setHomeoMedicines(copy as any);
                        }}
                        className="w-full bg-white border border-slate-300 rounded-lg p-1.5 text-xs text-slate-900 focus:outline-none"
                      >
                        {['Tablet', 'Capsule', 'Syrup', 'Ointment', 'Eye/Ear Drops', 'Inhaler'].map(t => (
                          <option key={t} value={t}>{t}</option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-[11px] font-medium text-slate-600 mb-0.5">Frequency</label>
                      <select
                        value={am.frequency}
                        onChange={(e) => {
                          const copy = [...alloMedicines];
                          copy[index].frequency = e.target.value as any;
                          setAlloMedicines(copy);
                        }}
                        className="w-full bg-white border border-slate-300 rounded-lg p-1.5 text-xs text-slate-900 focus:outline-none"
                      >
                        {['OD', 'BD', 'TDS', 'QID', 'SOS', 'HS'].map(f => (
                          <option key={f} value={f}>{f}</option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-[11px] font-medium text-slate-600 mb-0.5">Food Timing</label>
                      <select
                        value={am.timing}
                        onChange={(e) => {
                          const copy = [...alloMedicines];
                          copy[index].timing = e.target.value as any;
                          setAlloMedicines(copy);
                        }}
                        className="w-full bg-white border border-slate-300 rounded-lg p-1.5 text-xs text-slate-900 focus:outline-none"
                      >
                        {['After Food', 'Before Food', 'With Food', 'Empty Stomach'].map(tm => (
                          <option key={tm} value={tm}>{tm}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-[11px] font-medium text-slate-600 mb-0.5">Instructions & Duration</label>
                    <input
                      type="text"
                      value={am.instructions || ''}
                      onChange={(e) => {
                        const copy = [...alloMedicines];
                        copy[index].instructions = e.target.value;
                        setAlloMedicines(copy);
                      }}
                      placeholder="e.g. Take for 5 days after food. Avoid if stomach burns."
                      className="w-full bg-white border border-slate-300 rounded-lg p-1.5 text-xs text-slate-900 focus:outline-none"
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Section 3: Diet & Investigations */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-2">
              <label className="block font-bold text-slate-800">Diet & Regimen Advice (1 per line)</label>
              <textarea
                rows={4}
                value={dietaryAdviseText}
                onChange={(e) => setDietaryAdviseText(e.target.value)}
                className="w-full border border-slate-300 rounded-xl p-2.5 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-teal-500"
              />
            </div>

            <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-2">
              <label className="block font-bold text-slate-800">Laboratory Investigations Ordered</label>
              <textarea
                rows={4}
                value={investigationsText}
                onChange={(e) => setInvestigationsText(e.target.value)}
                placeholder="e.g. Complete Blood Count (CBC), USG Abdomen, Serum Uric Acid"
                className="w-full border border-slate-300 rounded-xl p-2.5 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-teal-500"
              />
            </div>
          </div>
        </div>
      ) : (
        /* Letterhead Printable Rx Paper */
        <div id="prescription-paper" className="bg-white rounded-2xl border border-slate-300 shadow-md p-8 sm:p-12 space-y-6 text-xs text-slate-800 max-w-4xl mx-auto">
          {/* Header */}
          <div className="border-b-2 border-teal-800 pb-4 flex flex-col sm:flex-row items-start justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold text-slate-900 font-serif">
                Dr. Bharat's Aroga Homeopathy
              </h1>
              <p className="text-xs font-semibold text-teal-800 mt-0.5">
                {CLINIC_CONFIG.doctorName}, {CLINIC_CONFIG.qualifications} • Reg No: {CLINIC_CONFIG.regNo}
              </p>
              <p className="text-[11px] text-slate-500">
                {CLINIC_CONFIG.address} • Tel: {CLINIC_CONFIG.phone}
              </p>
            </div>

            <div className="sm:text-right text-[11px] text-slate-600">
              <div>Date: <strong>{new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</strong></div>
              <div>Rx ID: <strong>{existingRx?.id || 'RX-8801'}</strong></div>
              <div className="text-teal-700 font-semibold">Clinic Reg: {CLINIC_CONFIG.regNo} (Belgaum)</div>
            </div>
          </div>

          {/* Patient Details & Vitals Strip */}
          <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 grid grid-cols-2 sm:grid-cols-4 gap-3 text-[11px]">
            <div>
              <span className="text-slate-400 block text-[10px] uppercase">Patient</span>
              <strong className="text-slate-900 text-xs">{selectedPatient.name}</strong>
              <span className="text-slate-500 block">{selectedPatient.age}y / {selectedPatient.gender}</span>
            </div>
            <div>
              <span className="text-slate-400 block text-[10px] uppercase">Blood Group & Sugar</span>
              <strong className="text-slate-900 font-semibold">{selectedPatient.bloodGroup}</strong>
              <span className="text-slate-500 block">RBS: {selectedPatient.vitals.rbs} mg/dL</span>
            </div>
            <div>
              <span className="text-slate-400 block text-[10px] uppercase">Mobile</span>
              <strong className="text-slate-800">{selectedPatient.mobile}</strong>
              <span className="text-slate-500 block">ID: {selectedPatient.id}</span>
            </div>
            <div>
              <span className="text-slate-400 block text-[10px] uppercase">Vitals at Consult</span>
              <strong className="text-slate-900">BP {selectedPatient.vitals.bpSystolic}/{selectedPatient.vitals.bpDiastolic} mmHg</strong>
              <span className="text-slate-500 block">Wt {selectedPatient.vitals.weight}kg • Pulse {selectedPatient.vitals.pulse}</span>
            </div>
          </div>

          {/* Diagnosis */}
          <div className="border-b border-slate-200 pb-3">
            <span className="font-bold text-slate-400 text-[10px] uppercase tracking-wider block">
              Provisional Clinical Diagnosis:
            </span>
            <p className="text-slate-900 font-bold text-sm">{diagnosis}</p>
          </div>

          {/* Rx Symbol & Homeo Section */}
          <div className="space-y-4">
            <div className="text-2xl font-serif font-bold text-teal-800 italic">℞</div>

            {homeoMedicines.length > 0 && (
              <div className="space-y-3">
                <div className="text-xs font-bold text-teal-900 uppercase tracking-wider border-b border-teal-100 pb-1">
                  1. Homeopathic Constitutional & Acute Remedies
                </div>
                <div className="space-y-2 pl-3">
                  {homeoMedicines.map((hm, idx) => (
                    <div key={hm.id} className="text-xs">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-slate-900 text-sm">
                          {idx + 1}. {hm.remedy} {hm.potency}
                        </span>
                        <span className="text-slate-500">
                          ({hm.form}) — <strong>{hm.dosage}</strong>, {hm.frequency}
                        </span>
                      </div>
                      <div className="text-[11px] text-slate-600 pl-4 mt-0.5">
                        ↳ Instructions: {hm.instructions} ({hm.duration})
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {alloMedicines.length > 0 && (
              <div className="space-y-3 pt-2">
                <div className="text-xs font-bold text-indigo-900 uppercase tracking-wider border-b border-indigo-100 pb-1">
                  2. Allopathic Supportive Medications
                </div>
                <div className="space-y-2 pl-3">
                  {alloMedicines.map((am, idx) => (
                    <div key={am.id} className="text-xs">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-slate-900 text-sm">
                          {idx + 1}. {am.name} ({am.type})
                        </span>
                        <span className="text-slate-500">
                          — <strong>{am.frequency}</strong> [{am.timing}] for {am.duration}
                        </span>
                      </div>
                      {am.instructions && (
                        <div className="text-[11px] text-slate-600 pl-4 mt-0.5">
                          ↳ Notes: {am.instructions}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Diet & Investigations */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4 border-t border-slate-200 text-xs">
            <div>
              <span className="font-bold text-slate-900 block mb-1">Dietary & Lifestyle Advice:</span>
              <ul className="list-disc pl-4 space-y-1 text-slate-600 text-[11px]">
                {dietaryAdviseText.split('\n').filter(Boolean).map((d, i) => (
                  <li key={i}>{d}</li>
                ))}
              </ul>
            </div>

            <div>
              {investigationsText && (
                <div className="mb-3">
                  <span className="font-bold text-slate-900 block mb-1">Investigations Advised:</span>
                  <p className="text-slate-600 text-[11px]">{investigationsText}</p>
                </div>
              )}
              <div>
                <span className="font-bold text-slate-900 block mb-1">Next Follow-up Appointment:</span>
                <p className="text-emerald-700 font-bold text-xs">
                  {new Date(followUpDate).toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'short', year: 'numeric' })}
                </p>
              </div>
            </div>
          </div>

          {/* Doctor Signature & Verification QR */}
          <div className="pt-8 border-t border-slate-200 flex items-end justify-between">
            <div className="flex items-center gap-3">
              <QrCode className="w-12 h-12 text-slate-800" />
              <div className="text-[10px] text-slate-400 max-w-[200px] leading-tight">
                Dr. Bharat's Aroga Homeopathy Digitally Signed Rx • Dr. Bharat Chougule • Belgaum 591108
              </div>
            </div>

            <div className="text-right">
              <div className="font-serif italic text-base text-slate-900 font-bold">
                {CLINIC_CONFIG.doctorName}
              </div>
              <div className="text-[11px] text-slate-600 font-medium">{CLINIC_CONFIG.qualifications}</div>
              <div className="text-[10px] text-slate-400">Reg. No: {CLINIC_CONFIG.regNo}</div>
              <div className="text-[9px] text-teal-800 font-medium">1st Floor Mahalaxmi plaza, Hindalga, Belgaum</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
