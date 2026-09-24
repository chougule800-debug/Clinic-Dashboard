import React, { useState } from 'react';
import { useClinic } from '../../context/ClinicContext';
import { CLINIC_CONFIG } from '../../config/clinicConfig';
import { CLINICAL_SYSTEMS_METADATA } from '../../data/mockData';
import { ClinicalSystemKey, HomeoMedicine, AlloMedicine, BillingInvoice, Prescription } from '../../types';
import {
  CheckCircle2,
  Printer,
  Send,
  MessageCircle,
  FileText,
  Receipt,
  Heart,
  ShieldCheck,
  Stethoscope,
  Sparkles,
  Pill,
  Calendar,
  User,
  Phone,
  Clock,
  AlertCircle,
  Upload,
  X,
  Lock,
  ArrowLeft,
  Share2,
  ClipboardList
} from 'lucide-react';

interface PatientPortalViewProps {
  mode: 'intake' | 'prescription' | 'billing';
  patientId?: string | null;
  system?: ClinicalSystemKey | null;
  rxId?: string | null;
  invId?: string | null;
  onExitToDashboard?: () => void;
}

export const PatientPortalView: React.FC<PatientPortalViewProps> = ({
  mode,
  patientId,
  system,
  rxId,
  invId,
  onExitToDashboard
}) => {
  const {
    patients,
    prescriptions,
    invoices,
    submitRemoteIntake,
    saveSystemForm,
    selectPatient,
    setActiveTab
  } = useClinic();

  // Resolve target patient
  const targetPatient = patients.find(p => p.id === patientId) || (patientId ? {
    id: patientId,
    name: 'Patient',
    age: 35,
    gender: 'Other' as const,
    mobile: '',
    address: '',
    bloodGroup: 'O+',
    vitals: { bpSystolic: 120, bpDiastolic: 80, pulse: 76, temperature: 98.4, spo2: 99, weight: 65, rbs: 100 }
  } : patients[0]);

  // Resolve system
  const effectiveSystem: ClinicalSystemKey = system || 'headache';
  const sysConfig = CLINICAL_SYSTEMS_METADATA.find(s => s.key === effectiveSystem) || CLINICAL_SYSTEMS_METADATA[0];

  // Resolve prescription
  const effectiveRx: Prescription | undefined = rxId
    ? prescriptions.find(p => p.id === rxId)
    : (targetPatient ? prescriptions.find(p => p.patientId === targetPatient.id) : undefined) || prescriptions[0];

  // Resolve invoice
  const effectiveInvoice: BillingInvoice | undefined = invId
    ? invoices.find(i => i.id === invId)
    : (targetPatient ? invoices.find(i => i.patientId === targetPatient.id) : undefined) || invoices[0];

  // Intake form state
  const [chiefComplaints, setChiefComplaints] = useState('');
  const [duration, setDuration] = useState('');
  const [severity, setSeverity] = useState<'Mild' | 'Moderate' | 'Severe'>('Moderate');
  const [modalitiesAggravation, setModalitiesAggravation] = useState('');
  const [modalitiesAmelioration, setModalitiesAmelioration] = useState('');
  const [concomitants, setConcomitants] = useState('');
  const [formData, setFormData] = useState<Record<string, any>>({});
  const [uploadedPhotos, setUploadedPhotos] = useState<string[]>([]);
  const [submittedSuccess, setSubmittedSuccess] = useState(false);

  // Specialized Mind & Generals options
  const mindRubricPills = [
    'Anxiety / काळजी',
    'Fear / भीती',
    'Anger / राग',
    'Irritability / चिडचिड',
    'Grief / दुःख व शोक',
    'Sadness / उदास',
    'Restlessness / अस्वस्थता',
    'Overthinking / अतिविचार',
    'Crying easily / लगेच रडणे',
    'Desire for company / लोकांची सोबत हवी',
    'Desire for solitude / एकटेपणा हवा',
    'Poor concentration / एकाग्रतेचा अभाव',
    'Mood swings / अचानक मूड बदलणे',
    'Suppressed feelings / भावना दाबून ठेवणे'
  ];

  const triggerPills = [
    'Work stress / कामाचा ताण',
    'Family conflict / कौटुंबिक वाद',
    'Financial worry / आर्थिक चिंता',
    'Exam / Study stress / अभ्यासाचा ताण',
    'Grief / Death of close one / जवळच्या व्यक्तीचे दुःख',
    'Anger / अपमान किंवा राग',
    'Relationship issue / नातेसंबंध ताण'
  ];

  const somaticPills = [
    'Headache / डोकेदुखी',
    'Acidity / Gas / गॅसेस व पित्त',
    'Chest palpitations / धडधड',
    'Breathlessness / धाप लागणे',
    'Skin rash / खाज किंवा पुरळ',
    'Sleep loss / निद्रानाश',
    'Tiredness / थकवा'
  ];

  const toggleChip = (fieldName: string, option: string) => {
    const currentList: string[] = formData[fieldName] || [];
    if (currentList.includes(option)) {
      setFormData({
        ...formData,
        [fieldName]: currentList.filter(item => item !== option)
      });
    } else {
      setFormData({
        ...formData,
        [fieldName]: [...currentList, option]
      });
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;
    Array.from(files).forEach(file => {
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          setUploadedPhotos(prev => [...prev, event.target!.result as string]);
        }
      };
      reader.readAsDataURL(file);
    });
  };

  const handleIntakeSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!targetPatient) return;

    submitRemoteIntake(targetPatient.id, effectiveSystem, {
      data: {
        ...formData,
        uploadedPhotosCount: uploadedPhotos.length
      },
      chiefComplaints: chiefComplaints || `Self-reported ${sysConfig.label} symptoms`,
      duration: duration || 'Not specified',
      severity,
      modalitiesAggravation,
      modalitiesAmelioration,
      concomitants,
      clinicalNotes: `Submitted by patient remotely via WhatsApp link on ${new Date().toLocaleDateString()}.`
    });

    setSubmittedSuccess(true);
  };

  const handleExit = () => {
    if (onExitToDashboard) {
      onExitToDashboard();
    } else {
      window.location.href = window.location.pathname;
    }
  };

  // WhatsApp clinic inquiry URL
  const clinicWaHelpUrl = `https://wa.me/919422615690?text=${encodeURIComponent(
    `Hello Dr. Bharat Chougule, I am ${targetPatient?.name || 'a patient'} contacting regarding my consultation at ${CLINIC_CONFIG.appName}.`
  )}`;

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col font-sans antialiased text-slate-800">
      {/* Top Patient Portal Header Bar */}
      <header className="bg-emerald-900 text-white shadow-md sticky top-0 z-30 print:hidden">
        <div className="max-w-4xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center text-emerald-300 font-serif font-black text-lg border border-emerald-700/50">
              BH
            </div>
            <div>
              <h1 className="font-bold text-sm sm:text-base leading-tight tracking-wide">
                {CLINIC_CONFIG.appName}
              </h1>
              <p className="text-[11px] text-emerald-200">
                {CLINIC_CONFIG.doctorName} • {CLINIC_CONFIG.qualifications}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <a
              href={clinicWaHelpUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="px-3 py-1.5 rounded-lg bg-emerald-700 hover:bg-emerald-600 text-white text-xs font-semibold flex items-center gap-1.5 transition-colors"
            >
              <MessageCircle className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Clinic WhatsApp</span>
            </a>
            {/* Discreet switch to doctor dashboard if doctor is viewing */}
            <button
              onClick={handleExit}
              title="Return to Doctor / Staff Dashboard"
              className="px-2 py-1.5 rounded-lg text-emerald-300 hover:text-white hover:bg-emerald-800 text-[11px] transition-colors flex items-center gap-1 opacity-70 hover:opacity-100"
            >
              <Lock className="w-3 h-3" />
              <span className="hidden md:inline">Doctor Login</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Patient Content Area */}
      <main className="flex-1 max-w-4xl w-full mx-auto p-4 sm:p-6 md:p-8">
        {/* =========================================================================
            MODE 1: PATIENT INTAKE FORM (ONLY THIS FORM IS DISPLAYED)
           ========================================================================= */}
        {mode === 'intake' && (
          <div className="bg-white rounded-3xl shadow-xl border border-slate-200 overflow-hidden">
            {/* Form Top Banner */}
            <div className="bg-gradient-to-r from-emerald-800 to-teal-800 text-white p-6 sm:p-8">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-950/60 border border-emerald-600/50 text-[11px] text-emerald-200 font-semibold mb-3">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                <span>Confidential Patient Case Intake Form / गोपनीय केस फॉर्म</span>
              </div>
              <h2 className="text-xl sm:text-2xl font-bold font-serif">
                {effectiveSystem === 'other_mind_generals'
                  ? 'Mind & Generals Case Taking / मानसिक-शारीरिक केस टेकिंग'
                  : `${sysConfig.label} Case Taking Form`}
              </h2>
              <p className="text-xs sm:text-sm text-emerald-100 mt-1 max-w-xl">
                Please fill in your symptoms as accurately as possible. This information directly reaches <strong>Dr. Bharat Chougule</strong> to prescribe your constitutional homeopathic similimum.
              </p>

              {/* Patient Badge */}
              <div className="mt-4 p-3 bg-white/10 backdrop-blur-xs rounded-xl border border-white/20 flex flex-wrap items-center justify-between gap-2 text-xs">
                <div>
                  <span className="text-emerald-200">Patient: </span>
                  <span className="font-bold text-white text-sm">{targetPatient?.name}</span>
                </div>
                <div className="flex items-center gap-4 text-emerald-100">
                  {targetPatient?.age && <span>Age: <strong>{targetPatient.age} yrs</strong></span>}
                  {targetPatient?.gender && <span>Gender: <strong>{targetPatient.gender}</strong></span>}
                  {targetPatient?.mobile && <span>Mobile: <strong>{targetPatient.mobile}</strong></span>}
                </div>
              </div>
            </div>

            {/* Form Content or Confirmation */}
            <div className="p-6 sm:p-8">
              {submittedSuccess ? (
                <div className="py-12 px-4 text-center space-y-5">
                  <div className="w-20 h-20 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto shadow-inner">
                    <CheckCircle2 className="w-12 h-12" />
                  </div>
                  <h3 className="text-xl sm:text-2xl font-bold text-slate-800">
                    Form Submitted Successfully! / फॉर्म यशस्वीपणे पाठवला गेला आहे!
                  </h3>
                  <p className="text-sm text-slate-600 max-w-md mx-auto leading-relaxed">
                    Thank you, <strong>{targetPatient?.name}</strong>. Your symptoms have been securely transmitted to <strong>Dr. Bharat Chougule</strong> at {CLINIC_CONFIG.appName}.
                  </p>

                  <div className="max-w-md mx-auto p-4 bg-emerald-50 rounded-2xl border border-emerald-200 text-left text-xs text-emerald-950 space-y-2">
                    <div className="font-bold flex items-center gap-1.5 text-emerald-900 text-sm">
                      <Sparkles className="w-4 h-4 text-emerald-600" />
                      Next Steps for Your Consultation:
                    </div>
                    <p>• Dr. Bharat is reviewing your symptom totality and modal repertorisation.</p>
                    <p>• Your prescription will be prepared and sent directly to your WhatsApp.</p>
                    <p>• Clinic OPD Helpline: <strong>+91 94226 15690</strong></p>
                  </div>

                  <div className="pt-4 flex flex-wrap items-center justify-center gap-3">
                    <button
                      type="button"
                      onClick={() => {
                        if (targetPatient) {
                          selectPatient(targetPatient.id);
                        }
                        setActiveTab('case_summary');
                        handleExit();
                      }}
                      className="px-5 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-semibold text-xs transition-colors flex items-center gap-2 cursor-pointer shadow-xs"
                    >
                      <ClipboardList className="w-4 h-4" />
                      <span>Review in Case Summary</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => window.print()}
                      className="px-5 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-semibold text-xs transition-colors flex items-center gap-2 cursor-pointer"
                    >
                      <Printer className="w-4 h-4" />
                      <span>Print My Submitted Details</span>
                    </button>
                    <a
                      href={clinicWaHelpUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs transition-colors flex items-center gap-2"
                    >
                      <MessageCircle className="w-4 h-4" />
                      <span>WhatsApp Dr. Bharat's Clinic</span>
                    </a>
                  </div>
                </div>
              ) : (
                <form onSubmit={handleIntakeSubmit} className="space-y-6">
                  {/* Notice */}
                  <div className="p-3.5 bg-amber-50 rounded-2xl border border-amber-200 text-amber-900 text-xs flex items-start gap-2.5">
                    <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                    <span>
                      <strong>Important:</strong> Describe your sensations, what triggers your trouble, and what gives you relief in your own words (English or Marathi / स्वतःच्या भाषेत सविस्तर लिहा).
                    </span>
                  </div>

                  {/* Section 1: Chief Complaints */}
                  <div className="space-y-2">
                    <label className="block font-bold text-slate-800 text-sm">
                      1. Main Complaints & Symptoms / मुख्य त्रास व लक्षणे
                    </label>
                    <textarea
                      rows={3}
                      value={chiefComplaints}
                      onChange={(e) => setChiefComplaints(e.target.value)}
                      placeholder="Describe what you are suffering from, where it hurts, how it feels, and when it started... (उदा. डोकेदुखी, पोटदुखी, खोकला, इत्यादी)"
                      className="w-full border border-slate-300 rounded-xl p-3 text-xs sm:text-sm text-slate-800 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                    />
                  </div>

                  {/* Section 2: Duration & Severity */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block font-semibold text-slate-700 text-xs mb-1">
                        Duration / किती दिवसांपासून त्रास आहे?
                      </label>
                      <input
                        type="text"
                        value={duration}
                        onChange={(e) => setDuration(e.target.value)}
                        placeholder="e.g. 5 days, 3 weeks, 6 months"
                        className="w-full border border-slate-300 rounded-xl p-2.5 text-xs sm:text-sm text-slate-800 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="block font-semibold text-slate-700 text-xs mb-1">
                        Severity / त्रासाची तीव्रता
                      </label>
                      <select
                        value={severity}
                        onChange={(e) => setSeverity(e.target.value as any)}
                        className="w-full border border-slate-300 rounded-xl p-2.5 text-xs sm:text-sm text-slate-800 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                      >
                        <option value="Mild">Mild / कमी</option>
                        <option value="Moderate">Moderate / मध्यम</option>
                        <option value="Severe">Severe / जास्त तीव्र</option>
                      </select>
                    </div>
                  </div>

                  {/* Specialized Mind & Generals System Form */}
                  {effectiveSystem === 'other_mind_generals' ? (
                    <div className="space-y-6 pt-2 border-t border-slate-200">
                      {/* Mental & Emotional States */}
                      <div className="space-y-2">
                        <label className="block font-bold text-slate-800 text-xs">
                          2. Mental & Emotional State / मानसिक व भावनिक अवस्था (Select all that apply)
                        </label>
                        <div className="flex flex-wrap gap-2">
                          {mindRubricPills.map((pill) => {
                            const selected = (formData['mentalStates'] || []).includes(pill);
                            return (
                              <button
                                type="button"
                                key={pill}
                                onClick={() => toggleChip('mentalStates', pill)}
                                className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-all ${
                                  selected
                                    ? 'bg-emerald-600 text-white shadow-xs font-semibold'
                                    : 'bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200'
                                }`}
                              >
                                {pill}
                              </button>
                            );
                          })}
                        </div>
                      </div>

                      {/* Emotional Triggers */}
                      <div className="space-y-2">
                        <label className="block font-bold text-slate-800 text-xs">
                          3. Emotional Causes & Stress Triggers / मानसिक ताणाचे कारण
                        </label>
                        <div className="flex flex-wrap gap-2">
                          {triggerPills.map((pill) => {
                            const selected = (formData['triggers'] || []).includes(pill);
                            return (
                              <button
                                type="button"
                                key={pill}
                                onClick={() => toggleChip('triggers', pill)}
                                className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-all ${
                                  selected
                                    ? 'bg-amber-600 text-white shadow-xs font-semibold'
                                    : 'bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200'
                                }`}
                              >
                                {pill}
                              </button>
                            );
                          })}
                        </div>
                      </div>

                      {/* Somatization (Stress reaction in body) */}
                      <div className="space-y-2">
                        <label className="block font-bold text-slate-800 text-xs">
                          4. Where do you feel stress in the body? / ताणाचा शरीरावर होणारा परिणाम
                        </label>
                        <div className="flex flex-wrap gap-2">
                          {somaticPills.map((pill) => {
                            const selected = (formData['somaticReaction'] || []).includes(pill);
                            return (
                              <button
                                type="button"
                                key={pill}
                                onClick={() => toggleChip('somaticReaction', pill)}
                                className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-all ${
                                  selected
                                    ? 'bg-teal-600 text-white shadow-xs font-semibold'
                                    : 'bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200'
                                }`}
                              >
                                {pill}
                              </button>
                            );
                          })}
                        </div>
                      </div>

                      {/* Sleep & Dreams */}
                      <div>
                        <label className="block font-semibold text-slate-700 text-xs mb-1">
                          Sleep, Dreams & Appetite / झोप, स्वप्ने व भूक-तहान
                        </label>
                        <input
                          type="text"
                          placeholder="उदा. झोप शांत लागते का? वाईट स्वप्ने पडतात का? तहान कशी आहे?"
                          value={formData['sleepDreams'] || ''}
                          onChange={(e) => setFormData({ ...formData, sleepDreams: e.target.value })}
                          className="w-full border border-slate-300 rounded-xl p-2.5 text-xs text-slate-800 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                        />
                      </div>
                    </div>
                  ) : (
                    /* Other Systems dynamic options */
                    <div className="space-y-4 pt-2 border-t border-slate-200">
                      {sysConfig.fields.map((field) => {
                        if (field.type === 'chips' && field.options) {
                          const selectedItems: string[] = formData[field.name] || [];
                          return (
                            <div key={field.name} className="space-y-1.5">
                              <label className="block font-semibold text-slate-700 text-xs">
                                {field.label}
                              </label>
                              <div className="flex flex-wrap gap-1.5">
                                {field.options.map((opt) => {
                                  const isSelected = selectedItems.includes(opt);
                                  return (
                                    <button
                                      type="button"
                                      key={opt}
                                      onClick={() => toggleChip(field.name, opt)}
                                      className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-all ${
                                        isSelected
                                          ? 'bg-emerald-600 text-white shadow-xs font-semibold'
                                          : 'bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200'
                                      }`}
                                    >
                                      {opt}
                                    </button>
                                  );
                                })}
                              </div>
                            </div>
                          );
                        }

                        return (
                          <div key={field.name}>
                            <label className="block font-semibold text-slate-700 text-xs mb-1">
                              {field.label}
                            </label>
                            <input
                              type="text"
                              placeholder={field.placeholder || ''}
                              value={formData[field.name] || ''}
                              onChange={(e) =>
                                setFormData({ ...formData, [field.name]: e.target.value })
                              }
                              className="w-full border border-slate-300 rounded-xl p-2.5 text-xs text-slate-800 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                            />
                          </div>
                        );
                      })}
                    </div>
                  )}

                  {/* Modalities: Aggravation & Relief */}
                  <div className="space-y-4 pt-2 border-t border-slate-200">
                    <div>
                      <label className="block font-semibold text-slate-700 text-xs mb-1">
                        What makes your symptoms worse? / त्रास कशामुळे वाढतो? (Aggravation)
                      </label>
                      <input
                        type="text"
                        placeholder="e.g. cold air, sun heat, morning, after food, walking, mental stress... (थंडीने, उन्हाने, चालल्याने)"
                        value={modalitiesAggravation}
                        onChange={(e) => setModalitiesAggravation(e.target.value)}
                        className="w-full border border-slate-300 rounded-xl p-2.5 text-xs sm:text-sm text-slate-800 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                      />
                    </div>

                    <div>
                      <label className="block font-semibold text-slate-700 text-xs mb-1">
                        What gives you relief? / त्रास कशाने कमी होतो किंवा आराम मिळतो? (Amelioration)
                      </label>
                      <input
                        type="text"
                        placeholder="e.g. rest, warm drink, sleeping, open air, pressure... (आराम केल्याने, गरम पाण्याने)"
                        value={modalitiesAmelioration}
                        onChange={(e) => setModalitiesAmelioration(e.target.value)}
                        className="w-full border border-slate-300 rounded-xl p-2.5 text-xs sm:text-sm text-slate-800 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                      />
                    </div>
                  </div>

                  {/* Upload Photos or Past Reports */}
                  <div className="space-y-2 pt-2 border-t border-slate-200">
                    <label className="block font-semibold text-slate-700 text-xs">
                      Attach Past Reports or Photos of Problem / तपासण्यांचे फोटो किंवा रिपोर्ट (Optional)
                    </label>
                    <div className="flex flex-wrap items-center gap-3">
                      <label className="px-4 py-2.5 rounded-xl border border-dashed border-emerald-400 bg-emerald-50/60 hover:bg-emerald-100/60 text-emerald-800 text-xs font-semibold cursor-pointer flex items-center gap-2 transition-colors">
                        <Upload className="w-4 h-4" />
                        <span>Select Photo / Document from Phone</span>
                        <input
                          type="file"
                          accept="image/*,.pdf"
                          multiple
                          onChange={handleFileUpload}
                          className="hidden"
                        />
                      </label>
                      <span className="text-[11px] text-slate-400">
                        {uploadedPhotos.length} file(s) attached
                      </span>
                    </div>

                    {uploadedPhotos.length > 0 && (
                      <div className="flex flex-wrap gap-2 pt-2">
                        {uploadedPhotos.map((src, idx) => (
                          <div key={idx} className="relative w-16 h-16 rounded-lg overflow-hidden border border-slate-300 shadow-xs">
                            <img src={src} alt="Uploaded" className="w-full h-full object-cover" />
                            <button
                              type="button"
                              onClick={() => setUploadedPhotos(prev => prev.filter((_, i) => i !== idx))}
                              className="absolute top-0.5 right-0.5 bg-rose-600 text-white rounded-full p-0.5"
                            >
                              <X className="w-3 h-3" />
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Submit Button */}
                  <div className="pt-4">
                    <button
                      type="submit"
                      className="w-full py-4 px-6 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm sm:text-base transition-colors shadow-lg flex items-center justify-center gap-2"
                    >
                      <Send className="w-5 h-5" />
                      <span>Submit Case Details to Dr. Bharat Chougule</span>
                    </button>
                    <p className="text-[11px] text-center text-slate-400 mt-2">
                      🔒 Your medical data is strictly private and directly received by Dr. Bharat Chougule.
                    </p>
                  </div>
                </form>
              )}
            </div>
          </div>
        )}

        {/* =========================================================================
            MODE 2: PATIENT DIGITAL PRESCRIPTION (ONLY THIS RX IS DISPLAYED)
           ========================================================================= */}
        {mode === 'prescription' && (
          <div className="space-y-4">
            {/* Top Patient Action Bar */}
            <div className="bg-white p-3.5 rounded-2xl border border-slate-200 shadow-xs flex items-center justify-between print:hidden">
              <div className="flex items-center gap-2">
                <FileText className="w-5 h-5 text-emerald-600" />
                <span className="font-bold text-xs sm:text-sm text-slate-800">
                  Official Digital Prescription Letterhead
                </span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => window.print()}
                  className="px-3.5 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold flex items-center gap-1.5 transition-colors shadow-xs"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span>Print / Save PDF</span>
                </button>
                <a
                  href={clinicWaHelpUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-3.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold flex items-center gap-1.5 transition-colors shadow-xs"
                >
                  <MessageCircle className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">WhatsApp Help</span>
                </a>
              </div>
            </div>

            {/* Printable Prescription Letterhead */}
            <div id="patient-prescription-letterhead" className="bg-white rounded-3xl shadow-xl border border-slate-200 p-6 sm:p-10 space-y-6">
              {/* Doctor Letterhead Header */}
              <div className="border-b-2 border-emerald-800 pb-5 flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                <div>
                  <h2 className="text-xl sm:text-2xl font-bold font-serif text-emerald-950 tracking-tight">
                    {CLINIC_CONFIG.doctorName}
                  </h2>
                  <p className="text-xs sm:text-sm font-semibold text-emerald-800">
                    {CLINIC_CONFIG.qualifications} — Classical Homeopathy
                  </p>
                  <p className="text-[11px] text-slate-500 mt-0.5">
                    Reg. No: <strong>{CLINIC_CONFIG.regNo}</strong> • Classical Homoeopathic Physician
                  </p>
                </div>
                <div className="text-left sm:text-right text-xs text-slate-600 space-y-0.5">
                  <div className="font-bold text-slate-900 text-sm">{CLINIC_CONFIG.appName}</div>
                  <div>{CLINIC_CONFIG.address}</div>
                  <div className="font-semibold text-emerald-800">OPD Mobile / WhatsApp: {CLINIC_CONFIG.phone}</div>
                </div>
              </div>

              {/* Patient Demographics & Date */}
              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                <div>
                  <span className="text-slate-400 block text-[10px] uppercase font-bold">Patient Name</span>
                  <strong className="text-slate-900 text-sm">{targetPatient?.name}</strong>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px] uppercase font-bold">Age / Gender</span>
                  <strong className="text-slate-800">{targetPatient?.age} yrs / {targetPatient?.gender}</strong>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px] uppercase font-bold">Consultation Date</span>
                  <strong className="text-slate-800">{effectiveRx?.consultationDate || new Date().toISOString().split('T')[0]}</strong>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px] uppercase font-bold">Vitals (BP / Sugar)</span>
                  <strong className="text-emerald-800">
                    {targetPatient?.vitals ? `${targetPatient.vitals.bpSystolic}/${targetPatient.vitals.bpDiastolic} mmHg` : 'Normal'}
                  </strong>
                </div>
              </div>

              {/* Diagnosis */}
              {effectiveRx?.diagnosis && (
                <div className="p-3 bg-emerald-50/70 rounded-xl border border-emerald-200 text-xs">
                  <span className="font-bold text-emerald-900 uppercase tracking-wide text-[10px] block mb-0.5">
                    Clinical Diagnosis / निदान:
                  </span>
                  <span className="text-slate-900 font-semibold text-sm">
                    {effectiveRx.diagnosis}
                  </span>
                </div>
              )}

              {/* Rx Medicines Table */}
              <div className="space-y-2">
                <div className="flex items-center gap-1.5 text-emerald-900 font-serif font-black text-lg">
                  <span>℞</span>
                  <span className="text-xs uppercase font-sans font-bold tracking-widest text-slate-500">
                    Prescribed Homeopathic Remedies / औषधे
                  </span>
                </div>

                <div className="border border-slate-200 rounded-2xl overflow-hidden shadow-xs">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead className="bg-emerald-900 text-white text-[11px] uppercase tracking-wide">
                      <tr>
                        <th className="p-3">#</th>
                        <th className="p-3">Remedy & Potency</th>
                        <th className="p-3">Dosage & Frequency</th>
                        <th className="p-3">Instructions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {effectiveRx?.homeoMedicines && effectiveRx.homeoMedicines.length > 0 ? (
                        effectiveRx.homeoMedicines.map((m, idx) => (
                          <tr key={m.id || idx} className="hover:bg-slate-50">
                            <td className="p-3 font-mono text-slate-400">{idx + 1}</td>
                            <td className="p-3">
                              <span className="font-bold text-emerald-950 text-sm block">{m.remedy}</span>
                              <span className="text-slate-500 text-[11px]">{m.potency} • {m.form}</span>
                            </td>
                            <td className="p-3">
                              <span className="font-semibold text-slate-800 block">{m.dosage}</span>
                              <span className="text-emerald-700 font-medium text-[11px]">{m.frequency} • {m.duration}</span>
                            </td>
                            <td className="p-3">
                              <span className="text-slate-700 block text-xs">{m.instructions || 'Take as advised'}</span>
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan={4} className="p-6 text-center text-slate-400">
                            Remedies will be dispensed as constitutional similimum.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Supportive Allopathic Medicines (if any) */}
              {effectiveRx?.alloMedicines && effectiveRx.alloMedicines.length > 0 && (
                <div className="space-y-2">
                  <div className="text-xs uppercase font-bold tracking-widest text-slate-500">
                    Supportive Medication / पूरक औषधे
                  </div>
                  <div className="border border-slate-200 rounded-2xl overflow-hidden">
                    <table className="w-full text-left text-xs">
                      <thead className="bg-slate-100 text-slate-600 text-[10px] uppercase">
                        <tr>
                          <th className="p-2.5">Medicine Name</th>
                          <th className="p-2.5">Type & Strength</th>
                          <th className="p-2.5">Timing & Frequency</th>
                          <th className="p-2.5">Duration</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {effectiveRx.alloMedicines.map((am, i) => (
                          <tr key={i}>
                            <td className="p-2.5 font-bold text-slate-800">{am.name}</td>
                            <td className="p-2.5 text-slate-700">{am.type} {am.strength}</td>
                            <td className="p-2.5 text-slate-700">{am.timing} • {am.frequency}</td>
                            <td className="p-2.5 text-slate-700">{am.duration}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* Diet Advice & Follow-up Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 text-xs space-y-1.5">
                  <strong className="text-emerald-900 block text-xs uppercase font-bold">
                    Dietary & Lifestyle Advice / पथ्य व सूचना:
                  </strong>
                  <ul className="list-disc list-inside text-slate-700 space-y-1 text-[11px] leading-relaxed">
                    {effectiveRx?.dietaryAdvise && effectiveRx.dietaryAdvise.length > 0 ? (
                      effectiveRx.dietaryAdvise.map((adv, i) => <li key={i}>{adv}</li>)
                    ) : (
                      <>
                        <li>Dissolve pills directly on tongue; avoid handling with bare hands.</li>
                        <li>Avoid raw onion, garlic, coffee, and camphor 15 mins before & after medicines.</li>
                        <li>Drink adequate warm water and maintain regular sleep schedule.</li>
                      </>
                    )}
                  </ul>
                </div>

                <div className="p-4 bg-emerald-50/60 rounded-2xl border border-emerald-200 text-xs flex flex-col justify-between">
                  <div>
                    <strong className="text-emerald-950 block text-xs uppercase font-bold mb-1">
                      Next Follow-up Date / पुढील तपासणी:
                    </strong>
                    <div className="flex items-center gap-2 text-emerald-800 font-bold text-base font-mono">
                      <Calendar className="w-5 h-5 text-emerald-600" />
                      <span>{effectiveRx?.followUpDate || 'After 15 Days'}</span>
                    </div>
                    <p className="text-[11px] text-slate-500 mt-1">
                      Please report your response on WhatsApp 2 days prior to your follow-up date.
                    </p>
                  </div>

                  <div className="pt-3 border-t border-emerald-200/60 text-right">
                    <span className="font-serif font-bold text-emerald-950 text-sm block">Dr. Bharat Chougule</span>
                    <span className="text-[10px] text-slate-400">Authorized Digital Prescription Seal</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* =========================================================================
            MODE 3: PATIENT BILLING RECEIPT (ONLY THIS INVOICE IS DISPLAYED)
           ========================================================================= */}
        {mode === 'billing' && (
          <div className="space-y-4">
            {/* Top Action Bar */}
            <div className="bg-white p-3.5 rounded-2xl border border-slate-200 shadow-xs flex items-center justify-between print:hidden">
              <div className="flex items-center gap-2">
                <Receipt className="w-5 h-5 text-emerald-600" />
                <span className="font-bold text-xs sm:text-sm text-slate-800">
                  Official OPD Fee Receipt
                </span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => window.print()}
                  className="px-3.5 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold flex items-center gap-1.5 transition-colors shadow-xs"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span>Print Receipt</span>
                </button>
                <a
                  href={clinicWaHelpUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-3.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold flex items-center gap-1.5 transition-colors shadow-xs"
                >
                  <MessageCircle className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">WhatsApp Help</span>
                </a>
              </div>
            </div>

            {/* Printable Receipt Card */}
            <div id="patient-billing-receipt" className="bg-white rounded-3xl shadow-xl border border-slate-200 p-6 sm:p-10 space-y-6">
              {/* Receipt Header */}
              <div className="border-b-2 border-slate-200 pb-5 flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                <div>
                  <h2 className="text-xl sm:text-2xl font-bold font-serif text-slate-900">
                    {CLINIC_CONFIG.appName}
                  </h2>
                  <p className="text-xs text-slate-500 mt-0.5">
                    {CLINIC_CONFIG.doctorName} ({CLINIC_CONFIG.qualifications}) • Reg. {CLINIC_CONFIG.regNo}
                  </p>
                  <p className="text-[11px] text-slate-400 mt-0.5">{CLINIC_CONFIG.address}</p>
                </div>
                <div className="text-left sm:text-right">
                  <span className="inline-block px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-300 font-bold text-xs mb-1">
                    ✓ PAID RECEIPT
                  </span>
                  <div className="font-mono font-bold text-slate-900 text-sm">
                    {effectiveInvoice?.invoiceNumber || effectiveInvoice?.id || 'RECEIPT'}
                  </div>
                  <div className="text-xs text-slate-500">Date: {effectiveInvoice?.date || new Date().toISOString().split('T')[0]}</div>
                </div>
              </div>

              {/* Billed To Particulars */}
              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 flex flex-wrap justify-between gap-3 text-xs">
                <div>
                  <span className="text-slate-400 text-[10px] uppercase font-bold block">Billed To (Patient):</span>
                  <strong className="text-slate-900 text-sm">{effectiveInvoice?.patientName || targetPatient?.name}</strong>
                  <div className="text-slate-500 text-[11px]">Patient ID: {effectiveInvoice?.patientId || targetPatient?.id}</div>
                </div>
                <div className="text-left sm:text-right">
                  <span className="text-slate-400 text-[10px] uppercase font-bold block">Payment Mode & Status:</span>
                  <strong className="text-emerald-700 text-sm">{effectiveInvoice?.paymentMode || 'Cash'}</strong>
                  <div className="text-slate-500 text-[11px]">Status: {effectiveInvoice?.status || 'Paid'}</div>
                </div>
              </div>

              {/* Items Table */}
              <div className="border border-slate-200 rounded-2xl overflow-hidden">
                <table className="w-full text-left text-xs border-collapse">
                  <thead className="bg-slate-100 text-slate-600 text-[11px] uppercase tracking-wide">
                    <tr>
                      <th className="p-3">#</th>
                      <th className="p-3">Service / Item Description</th>
                      <th className="p-3 text-right">Amount (₹)</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {effectiveInvoice?.items && effectiveInvoice.items.length > 0 ? (
                      effectiveInvoice.items.map((it, idx) => (
                        <tr key={idx}>
                          <td className="p-3 font-mono text-slate-400">{idx + 1}</td>
                          <td className="p-3 font-medium text-slate-800">{it.description}</td>
                          <td className="p-3 text-right font-mono font-bold text-slate-900">₹{it.amount}</td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td className="p-3 font-mono text-slate-400">1</td>
                        <td className="p-3 font-medium text-slate-800">Doctor Consultation & Homeopathic Medicine Dispensing</td>
                        <td className="p-3 text-right font-mono font-bold text-slate-900">₹{effectiveInvoice?.totalAmount || 600}</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>

              {/* Totals Calculation */}
              <div className="border-t border-slate-200 pt-3 space-y-1.5 text-right text-xs">
                <div className="flex justify-between text-slate-600 max-w-xs ml-auto">
                  <span>Subtotal:</span>
                  <span className="font-mono">
                    ₹{effectiveInvoice?.items ? effectiveInvoice.items.reduce((s, it) => s + (it.amount || 0), 0) : effectiveInvoice?.totalAmount || 600}
                  </span>
                </div>
                {effectiveInvoice && effectiveInvoice.discount > 0 && (
                  <div className="flex justify-between text-rose-600 max-w-xs ml-auto">
                    <span>Discount:</span>
                    <span className="font-mono">- ₹{effectiveInvoice.discount}</span>
                  </div>
                )}
                <div className="flex justify-between text-base sm:text-lg font-bold text-slate-900 pt-2 border-t border-slate-200 max-w-xs ml-auto">
                  <span>Total Amount Paid:</span>
                  <span className="text-emerald-700 font-mono">
                    ₹{effectiveInvoice?.totalAmount || 600}
                  </span>
                </div>
              </div>

              {/* Receipt Footer */}
              <div className="pt-4 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between text-[11px] text-slate-400 gap-2">
                <span>Computerized payment receipt. Thank you for choosing {CLINIC_CONFIG.appName}.</span>
                <span className="font-mono font-bold text-slate-600">Official Clinic Record</span>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-200 bg-white py-4 text-center text-xs text-slate-400 print:hidden">
        <div className="max-w-4xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <span>{CLINIC_CONFIG.appName} • {CLINIC_CONFIG.doctorName} ({CLINIC_CONFIG.qualifications})</span>
          <button
            onClick={handleExit}
            className="text-slate-400 hover:text-emerald-800 text-[11px] transition-colors"
          >
            Doctor / Staff Dashboard Login →
          </button>
        </div>
      </footer>
    </div>
  );
};
