import React, { useState, useEffect } from 'react';
import { useClinic } from '../../context/ClinicContext';
import { CLINIC_CONFIG } from '../../config/clinicConfig';
import type { HomeoMedicine, AlloMedicine } from '../../types';
import {
  Pill,
  Printer,
  Share2,
  Plus,
  Trash2,
  Save,
  CheckCircle2,
  FileText,
  MessageCircle,
  QrCode,
  Loader2,
  AlertCircle
} from 'lucide-react';

export const PrescriptionView: React.FC = () => {
  const {
    selectedPatient,
    prescriptions,
    savePrescription,
    openWhatsAppPrescriptionShareDialog
  } = useClinic();

  const existingRx = selectedPatient
    ? prescriptions.find(p => p.patientId === selectedPatient.id)
    : undefined;

  const [diagnosis, setDiagnosis] = useState('');
  const [clinicalNotes, setClinicalNotes] = useState('');
  const [followUpDate, setFollowUpDate] = useState('');
  const [bpValue, setBpValue] = useState('');
  const [sugarValue, setSugarValue] = useState('');
  const [fontScale, setFontScale] = useState<'large' | 'xl' | 'standard'>('large');
  const [homeoMedicines, setHomeoMedicines] = useState<HomeoMedicine[]>([]);
  const [alloMedicines, setAlloMedicines] = useState<AlloMedicine[]>([]);
  const [dietaryAdviseText, setDietaryAdviseText] = useState('');
  const [investigationsText, setInvestigationsText] = useState('');
  const [activeSubTab, setActiveSubTab] = useState<'editor' | 'preview'>('editor');
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Sync with patient / existing Rx
  useEffect(() => {
    if (!selectedPatient) return;
    setBpValue(
      `${selectedPatient.vitals.bpSystolic || 120}/${selectedPatient.vitals.bpDiastolic || 80} mmHg`
    );
    setSugarValue(`${selectedPatient.vitals.rbs || 0} mg/dL`);

    const rx = prescriptions.find(p => p.patientId === selectedPatient.id);
    if (rx) {
      setDiagnosis(rx.diagnosis);
      setClinicalNotes(rx.clinicalNotes);
      setFollowUpDate(rx.followUpDate);
      setHomeoMedicines(rx.homeoMedicines);
      setAlloMedicines(rx.alloMedicines);
      setDietaryAdviseText(rx.dietaryAdvise.join('\n'));
      setInvestigationsText(rx.investigationsOrdered.join(', '));
    } else {
      setDiagnosis('');
      setClinicalNotes('');
      setFollowUpDate('');
      setHomeoMedicines([]);
      setAlloMedicines([]);
      setDietaryAdviseText('');
      setInvestigationsText('');
    }
  }, [selectedPatient?.id, prescriptions]);

  if (!selectedPatient) {
    return (
      <div className="p-8 text-center bg-white rounded-2xl border border-slate-200">
        <Pill className="w-12 h-12 text-slate-400 mx-auto mb-2" />
        <h3 className="font-bold text-slate-800 text-base">No Active Patient Selected</h3>
        <p className="text-xs text-slate-500 mt-1">
          Select or register a patient to write a prescription.
        </p>
      </div>
    );
  }

  const addHomeoRow = () => {
    setHomeoMedicines(prev => [
      ...prev,
      {
        id: `tmp-${Date.now()}`,
        remedy: '',
        potency: '30C',
        form: 'Globules #30',
        dosage: '4 pills',
        frequency: 'TDS (Thrice Daily)',
        duration: '7 days',
        instructions: 'Take 30 mins before food.'
      }
    ]);
  };

  const removeHomeoRow = (id: string) => {
    setHomeoMedicines(prev => prev.filter(m => m.id !== id));
  };

  const addAlloRow = () => {
    setAlloMedicines(prev => [
      ...prev,
      {
        id: `tmp-${Date.now()}`,
        name: '',
        type: 'Tablet',
        strength: '',
        frequency: 'OD',
        timing: 'After Food',
        duration: '5 days',
        instructions: ''
      }
    ]);
  };

  const removeAlloRow = (id: string) => {
    setAlloMedicines(prev => prev.filter(m => m.id !== id));
  };

  const handleSave = async () => {
    setError(null);
    setSaving(true);
    try {
      const dietaryAdvise = dietaryAdviseText
        .split('\n')
        .map(s => s.trim())
        .filter(Boolean);
      const investigationsOrdered = investigationsText
        .split(',')
        .map(s => s.trim())
        .filter(Boolean);

      await savePrescription({
        id: existingRx?.id,
        patientId: selectedPatient.id,
        consultationDate: new Date().toISOString().split('T')[0],
        diagnosis,
        clinicalNotes,
        homeoMedicines: homeoMedicines.filter(m => m.remedy.trim()),
        alloMedicines: alloMedicines.filter(m => m.name.trim()),
        dietaryAdvise,
        investigationsOrdered,
        followUpDate,
        doctorName: CLINIC_CONFIG.doctorName,
        doctorDegree: CLINIC_CONFIG.qualifications,
        doctorRegNo: CLINIC_CONFIG.regNo,
        clinicName: CLINIC_CONFIG.appName,
        clinicAddress: CLINIC_CONFIG.address,
        clinicPhone: CLINIC_CONFIG.phone
      });

      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 2500);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save prescription.');
    } finally {
      setSaving(false);
    }
  };

  const handlePrint = () => {
    if (activeSubTab !== 'preview') {
      setActiveSubTab('preview');
      setTimeout(() => window.print(), 150);
    } else {
      window.print();
    }
  };

  return (
    <div className="space-y-6 pb-12">
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4 no-print">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[11px] uppercase font-bold tracking-wider px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200">
              Prescription
            </span>
            <span className="text-slate-400">•</span>
            <span className="text-xs text-slate-600">
              <strong>{selectedPatient.name}</strong> ({selectedPatient.patientCode ?? selectedPatient.id})
            </span>
          </div>
          <h2 className="text-xl font-bold text-slate-900 font-serif flex items-center gap-2">
            <Pill className="w-5 h-5 text-emerald-600" />
            Medical Prescription
          </h2>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <div className="flex bg-slate-100 p-1 rounded-xl border border-slate-200">
            <button
              onClick={() => setActiveSubTab('editor')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                activeSubTab === 'editor' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600'
              }`}
            >
              Editor
            </button>
            <button
              onClick={() => setActiveSubTab('preview')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                activeSubTab === 'preview' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600'
              }`}
            >
              Letterhead
            </button>
          </div>

          <div className="hidden sm:flex items-center gap-1 bg-slate-100 p-1 rounded-xl border border-slate-200 text-xs">
            <span className="text-slate-500 px-1 font-medium">Font:</span>
            {(['standard', 'large', 'xl'] as const).map(s => (
              <button
                key={s}
                onClick={() => setFontScale(s)}
                className={`px-2 py-1 rounded-lg font-semibold transition-colors ${
                  fontScale === s ? 'bg-white text-teal-800 shadow-xs' : 'text-slate-600'
                }`}
              >
                {s === 'standard' ? 'Std' : s === 'large' ? 'Lg' : 'XL'}
              </button>
            ))}
          </div>

          <button
            onClick={handleSave}
            disabled={saving}
            className="px-4 py-2 bg-teal-600 hover:bg-teal-700 disabled:opacity-60 text-white font-bold text-xs rounded-xl transition-colors flex items-center gap-1.5 shadow-xs"
          >
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            <span>{saving ? 'Saving...' : 'Save Rx'}</span>
          </button>

          <button
            onClick={() => openWhatsAppPrescriptionShareDialog(selectedPatient.id, existingRx?.id)}
            disabled={!existingRx}
            className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white font-semibold text-xs rounded-xl transition-colors flex items-center gap-1.5 shadow-xs"
          >
            <MessageCircle className="w-4 h-4" />
            <span className="hidden sm:inline">WhatsApp</span>
          </button>

          <button
            onClick={handlePrint}
            className="px-3.5 py-2 bg-slate-900 hover:bg-slate-800 text-white font-semibold text-xs rounded-xl transition-colors flex items-center gap-1.5 shadow-xs"
          >
            <Printer className="w-4 h-4" />
            <span>Print</span>
          </button>
        </div>
      </div>

      {saveSuccess && (
        <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-200 text-emerald-800 font-semibold text-xs flex items-center gap-2 no-print">
          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          Prescription saved.
        </div>
      )}

      {error && (
        <div className="p-3 bg-rose-50 rounded-xl border border-rose-200 text-rose-800 font-semibold text-xs flex items-center gap-2 no-print">
          <AlertCircle className="w-4 h-4 text-rose-600" />
          {error}
        </div>
      )}

      {activeSubTab === 'editor' ? (
        <div className="space-y-6 text-xs">
          <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-4">
            <h3 className="font-bold text-slate-900 text-sm uppercase tracking-wider text-slate-500">
              Diagnosis &amp; Vitals
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="md:col-span-2">
                <label className="block font-bold text-slate-800 mb-1">Clinical Diagnosis</label>
                <input
                  type="text"
                  value={diagnosis}
                  onChange={e => setDiagnosis(e.target.value)}
                  placeholder="e.g. Migraine with Dyspepsia"
                  className="w-full border border-slate-300 rounded-lg p-2.5 text-xs focus:ring-2 focus:ring-teal-500 focus:outline-none"
                />
              </div>
              <div>
                <label className="block font-bold text-slate-800 mb-1">BP</label>
                <input
                  type="text"
                  value={bpValue}
                  onChange={e => setBpValue(e.target.value)}
                  className="w-full border border-slate-300 rounded-lg p-2.5 text-xs focus:ring-2 focus:ring-teal-500 focus:outline-none"
                />
              </div>
              <div>
                <label className="block font-bold text-slate-800 mb-1">Blood Sugar</label>
                <input
                  type="text"
                  value={sugarValue}
                  onChange={e => setSugarValue(e.target.value)}
                  className="w-full border border-slate-300 rounded-lg p-2.5 text-xs focus:ring-2 focus:ring-teal-500 focus:outline-none"
                />
              </div>
              <div>
                <label className="block font-medium text-slate-700 mb-1">Follow-up Date</label>
                <input
                  type="date"
                  value={followUpDate}
                  onChange={e => setFollowUpDate(e.target.value)}
                  className="w-full border border-slate-300 rounded-lg p-2 text-xs focus:outline-none"
                />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="font-bold text-slate-900 text-sm">Homeopathic Medicines</h3>
              <button
                type="button"
                onClick={addHomeoRow}
                className="px-3 py-1.5 bg-teal-50 hover:bg-teal-100 text-teal-700 rounded-lg font-semibold text-xs flex items-center gap-1 border border-teal-200"
              >
                <Plus className="w-3.5 h-3.5" />
                Add Remedy
              </button>
            </div>

            {homeoMedicines.length === 0 && (
              <div className="p-4 text-center text-xs text-slate-400 bg-slate-50 rounded-lg">
                No homeopathic remedies added.
              </div>
            )}

            <div className="space-y-3">
              {homeoMedicines.map((hm, idx) => (
                <div key={hm.id} className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-700 text-xs">#{idx + 1}</span>
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
                      <label className="block text-[11px] font-medium text-slate-600 mb-0.5">Remedy</label>
                      <input
                        type="text"
                        value={hm.remedy}
                        onChange={e =>
                          setHomeoMedicines(prev =>
                            prev.map(m => (m.id === hm.id ? { ...m, remedy: e.target.value } : m))
                          )
                        }
                        className="w-full bg-white border border-slate-300 rounded-lg p-1.5 text-xs"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-medium text-slate-600 mb-0.5">Potency</label>
                      <select
                        value={hm.potency}
                        onChange={e =>
                          setHomeoMedicines(prev =>
                            prev.map(m =>
                              m.id === hm.id ? { ...m, potency: e.target.value as HomeoMedicine['potency'] } : m
                            )
                          )
                        }
                        className="w-full bg-white border border-slate-300 rounded-lg p-1.5 text-xs"
                      >
                        {['6C','30C','200C','1M','10M','50M','CM','LM 1','LM 2','LM 3','Q (Mother Tincture)','3X','6X','12X'].map(p => (
                          <option key={p} value={p}>{p}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-[11px] font-medium text-slate-600 mb-0.5">Form</label>
                      <select
                        value={hm.form}
                        onChange={e =>
                          setHomeoMedicines(prev =>
                            prev.map(m =>
                              m.id === hm.id ? { ...m, form: e.target.value as HomeoMedicine['form'] } : m
                            )
                          )
                        }
                        className="w-full bg-white border border-slate-300 rounded-lg p-1.5 text-xs"
                      >
                        {['Globules #30','Globules #40','Dilution Drops','Biochemic Tablets','Trituration Powder'].map(f => (
                          <option key={f} value={f}>{f}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-[11px] font-medium text-slate-600 mb-0.5">Frequency</label>
                      <select
                        value={hm.frequency}
                        onChange={e =>
                          setHomeoMedicines(prev =>
                            prev.map(m =>
                              m.id === hm.id ? { ...m, frequency: e.target.value as HomeoMedicine['frequency'] } : m
                            )
                          )
                        }
                        className="w-full bg-white border border-slate-300 rounded-lg p-1.5 text-xs"
                      >
                        {['OD (Once Daily)','BD (Twice Daily)','TDS (Thrice Daily)','QID (Four Times Daily)','Weekly','Stat / SOS'].map(f => (
                          <option key={f} value={f}>{f}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    <div>
                      <label className="block text-[11px] font-medium text-slate-600 mb-0.5">Dosage</label>
                      <input
                        type="text"
                        value={hm.dosage}
                        onChange={e =>
                          setHomeoMedicines(prev =>
                            prev.map(m => (m.id === hm.id ? { ...m, dosage: e.target.value } : m))
                          )
                        }
                        className="w-full bg-white border border-slate-300 rounded-lg p-1.5 text-xs"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-medium text-slate-600 mb-0.5">Instructions</label>
                      <input
                        type="text"
                        value={hm.instructions}
                        onChange={e =>
                          setHomeoMedicines(prev =>
                            prev.map(m => (m.id === hm.id ? { ...m, instructions: e.target.value } : m))
                          )
                        }
                        className="w-full bg-white border border-slate-300 rounded-lg p-1.5 text-xs"
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="font-bold text-slate-900 text-sm">Supportive Medications</h3>
              <button
                type="button"
                onClick={addAlloRow}
                className="px-3 py-1.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 rounded-lg font-semibold text-xs flex items-center gap-1 border border-indigo-200"
              >
                <Plus className="w-3.5 h-3.5" />
                Add
              </button>
            </div>

            {alloMedicines.length === 0 && (
              <div className="p-4 text-center text-xs text-slate-400 bg-slate-50 rounded-lg">
                No supportive medications added.
              </div>
            )}

            <div className="space-y-3">
              {alloMedicines.map((am, idx) => (
                <div key={am.id} className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-700 text-xs">#{idx + 1}</span>
                    <button
                      type="button"
                      onClick={() => removeAlloRow(am.id)}
                      className="text-slate-400 hover:text-rose-600 p-1"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-4 gap-2">
                    <div className="sm:col-span-2">
                      <label className="block text-[11px] font-medium text-slate-600 mb-0.5">Name</label>
                      <input
                        type="text"
                        value={am.name}
                        onChange={e =>
                          setAlloMedicines(prev =>
                            prev.map(m => (m.id === am.id ? { ...m, name: e.target.value } : m))
                          )
                        }
                        className="w-full bg-white border border-slate-300 rounded-lg p-1.5 text-xs"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-medium text-slate-600 mb-0.5">Type</label>
                      <select
                        value={am.type}
                        onChange={e =>
                          setAlloMedicines(prev =>
                            prev.map(m =>
                              m.id === am.id ? { ...m, type: e.target.value as AlloMedicine['type'] } : m
                            )
                          )
                        }
                        className="w-full bg-white border border-slate-300 rounded-lg p-1.5 text-xs"
                      >
                        {['Tablet','Capsule','Syrup','Ointment','Eye/Ear Drops','Inhaler'].map(t => (
                          <option key={t} value={t}>{t}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-[11px] font-medium text-slate-600 mb-0.5">Frequency</label>
                      <select
                        value={am.frequency}
                        onChange={e =>
                          setAlloMedicines(prev =>
                            prev.map(m =>
                              m.id === am.id ? { ...m, frequency: e.target.value as AlloMedicine['frequency'] } : m
                            )
                          )
                        }
                        className="w-full bg-white border border-slate-300 rounded-lg p-1.5 text-xs"
                      >
                        {['OD','BD','TDS','QID','SOS','HS'].map(f => (
                          <option key={f} value={f}>{f}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                  <input
                    type="text"
                    value={am.instructions || ''}
                    onChange={e =>
                      setAlloMedicines(prev =>
                        prev.map(m => (m.id === am.id ? { ...m, instructions: e.target.value } : m))
                      )
                    }
                    placeholder="Instructions"
                    className="w-full bg-white border border-slate-300 rounded-lg p-1.5 text-xs"
                  />
                </div>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-2">
              <label className="block font-bold text-slate-800">Diet &amp; Advice (one per line)</label>
              <textarea
                rows={4}
                value={dietaryAdviseText}
                onChange={e => setDietaryAdviseText(e.target.value)}
                className="w-full border border-slate-300 rounded-xl p-2.5 text-xs focus:ring-2 focus:ring-teal-500 focus:outline-none"
              />
            </div>
            <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-2">
              <label className="block font-bold text-slate-800">Investigations Ordered</label>
              <textarea
                rows={4}
                value={investigationsText}
                onChange={e => setInvestigationsText(e.target.value)}
                placeholder="Comma-separated"
                className="w-full border border-slate-300 rounded-xl p-2.5 text-xs focus:ring-2 focus:ring-teal-500 focus:outline-none"
              />
            </div>
          </div>
        </div>
      ) : (
        <div
          id="prescription-paper"
          className={`bg-white rounded-2xl border border-slate-300 shadow-md p-8 sm:p-12 space-y-6 text-slate-900 max-w-4xl mx-auto ${
            fontScale === 'xl' ? 'text-base' : fontScale === 'large' ? 'text-sm' : 'text-xs'
          }`}
        >
          <div className="border-b-2 border-teal-800 pb-5 flex flex-col sm:flex-row items-start justify-between gap-4">
            <div>
              <h1 className="text-3xl font-extrabold text-teal-950 font-serif">
                {CLINIC_CONFIG.appName}
              </h1>
              <p className="text-base font-bold text-teal-800 mt-1">
                {CLINIC_CONFIG.doctorName}
                {CLINIC_CONFIG.qualifications && `, ${CLINIC_CONFIG.qualifications}`}
              </p>
              {CLINIC_CONFIG.address && (
                <p className="text-xs text-slate-600 mt-1">
                  {CLINIC_CONFIG.address}
                  {CLINIC_CONFIG.phone && ` • Tel: ${CLINIC_CONFIG.phone}`}
                </p>
              )}
            </div>
            <div className="sm:text-right text-xs text-slate-700 bg-teal-50/60 p-3 rounded-xl border border-teal-100">
              <div>
                Date:{' '}
                <strong>
                  {new Date().toLocaleDateString('en-IN', {
                    day: 'numeric',
                    month: 'short',
                    year: 'numeric'
                  })}
                </strong>
              </div>
              {CLINIC_CONFIG.regNo && (
                <div className="text-teal-800 font-semibold mt-0.5">
                  Reg: {CLINIC_CONFIG.regNo}
                </div>
              )}
            </div>
          </div>

          <div className="bg-slate-50/80 p-4 rounded-2xl border border-slate-200 flex flex-col sm:flex-row items-start justify-between gap-4">
            <div>
              <span className="text-slate-500 block text-[10px] uppercase font-bold tracking-wider mb-0.5">
                Patient
              </span>
              <div className="text-lg font-bold text-slate-900 leading-tight">
                {selectedPatient.name}
              </div>
              <span className="text-slate-700 text-sm font-semibold block mt-0.5">
                {selectedPatient.age} Yrs • {selectedPatient.gender}
              </span>
            </div>
            <div className="sm:border-l sm:border-slate-200 sm:pl-6 pt-3 sm:pt-0">
              <span className="text-slate-500 block text-[10px] uppercase font-bold tracking-wider mb-1">
                Vitals
              </span>
              <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs">
                <div>
                  <span className="text-slate-500">BP: </span>
                  <strong className="text-slate-900">{bpValue}</strong>
                </div>
                <span className="text-slate-300">|</span>
                <div>
                  <span className="text-slate-500">Sugar: </span>
                  <strong className="text-slate-900">{sugarValue}</strong>
                </div>
              </div>
            </div>
          </div>

          {diagnosis && (
            <div className="border-b border-slate-200 pb-4">
              <span className="font-bold text-slate-500 text-xs uppercase tracking-wider block mb-1">
                Diagnosis
              </span>
              <p className="text-slate-900 font-bold text-lg leading-snug">{diagnosis}</p>
            </div>
          )}

          <div className="space-y-4">
            <span className="text-4xl font-serif font-bold text-teal-900 italic select-none">℞</span>
            <div className="space-y-4 pl-2">
              {homeoMedicines.map((hm, idx) => (
                <div key={hm.id} className="pb-3 border-b border-slate-100 last:border-0">
                  <div className="flex flex-wrap items-baseline gap-2">
                    <span className="font-bold text-slate-900 text-base sm:text-lg">
                      {idx + 1}. {hm.remedy} {hm.potency}
                    </span>
                    <span className="text-slate-700 text-sm">
                      ({hm.form}) — <strong>{hm.dosage}</strong>, <span className="font-semibold text-teal-800">{hm.frequency}</span>
                    </span>
                    {hm.duration && <span className="text-slate-500 text-xs">[{hm.duration}]</span>}
                  </div>
                  {hm.instructions && (
                    <div className="text-xs text-slate-700 pl-5 mt-1">↳ {hm.instructions}</div>
                  )}
                </div>
              ))}
              {alloMedicines.map((am, idx) => (
                <div key={am.id} className="pb-3 border-b border-slate-100 last:border-0">
                  <div className="flex flex-wrap items-baseline gap-2">
                    <span className="font-bold text-slate-900 text-base">
                      {homeoMedicines.length + idx + 1}. {am.name}
                      {am.strength && ` (${am.strength})`}
                    </span>
                    <span className="text-slate-700 text-sm">
                      [{am.type}] — <strong>{am.frequency}</strong> ({am.timing})
                    </span>
                    {am.duration && <span className="text-slate-500 text-xs">for {am.duration}</span>}
                  </div>
                  {am.instructions && (
                    <div className="text-xs text-slate-700 pl-5 mt-1">↳ {am.instructions}</div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {(dietaryAdviseText || investigationsText || followUpDate) && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-4 border-t border-slate-200">
              {dietaryAdviseText && (
                <div>
                  <span className="font-bold text-slate-900 text-sm block mb-1.5">Advice:</span>
                  <ul className="list-disc pl-5 space-y-1 text-slate-700 text-xs">
                    {dietaryAdviseText.split('\n').filter(Boolean).map((d, i) => (
                      <li key={i}>{d}</li>
                    ))}
                  </ul>
                </div>
              )}
              <div className="space-y-4">
                {investigationsText && (
                  <div>
                    <span className="font-bold text-slate-900 text-sm block mb-1.5">
                      Investigations:
                    </span>
                    <p className="text-slate-700 text-xs bg-slate-50 p-2.5 rounded-lg border border-slate-200">
                      {investigationsText}
                    </p>
                  </div>
                )}
                {followUpDate && (
                  <div>
                    <span className="font-bold text-slate-900 text-sm block mb-1">
                      Follow-up:
                    </span>
                    <p className="text-emerald-800 font-bold text-sm">
                      {new Date(followUpDate).toLocaleDateString('en-IN', {
                        weekday: 'long',
                        day: 'numeric',
                        month: 'short',
                        year: 'numeric'
                      })}
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}

          <div className="pt-8 border-t-2 border-slate-200 flex items-end justify-between">
            <div className="flex items-center gap-3">
              <QrCode className="w-14 h-14 text-slate-800 shrink-0" />
              <div className="text-xs text-slate-500 max-w-[240px] leading-tight">
                Digitally verified prescription
              </div>
            </div>
            <div className="text-right">
              <div className="font-serif italic text-xl text-slate-900 font-bold">
                {CLINIC_CONFIG.doctorName}
              </div>
              {CLINIC_CONFIG.qualifications && (
                <div className="text-sm text-teal-800 font-bold">{CLINIC_CONFIG.qualifications}</div>
              )}
              {CLINIC_CONFIG.regNo && (
                <div className="text-xs text-slate-600">Reg: {CLINIC_CONFIG.regNo}</div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};