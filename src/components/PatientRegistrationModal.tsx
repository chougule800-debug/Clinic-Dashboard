import React, { useState, useRef, useEffect } from 'react';
import { useClinic } from '../context/ClinicContext';
import { Gender, PatientVitals } from '../types';
import { parsePatientWithAI, parsePatientTextLocally } from '../utils/patientVoiceParser';
import {
  X,
  User,
  Heart,
  Weight,
  Ruler,
  Activity,
  CheckCircle,
  Mic,
  MicOff,
  Sparkles,
  Loader2,
  Check,
  AlertCircle
} from 'lucide-react';

interface PatientRegistrationModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const PatientRegistrationModal: React.FC<PatientRegistrationModalProps> = ({
  isOpen,
  onClose
}) => {
  const { createPatient } = useClinic();

  const [name, setName] = useState('');
  const [age, setAge] = useState<number | ''>('');
  const [gender, setGender] = useState<Gender>('Female');
  const [mobile, setMobile] = useState('+91 ');
  const [address, setAddress] = useState('');
  const [allergiesText, setAllergiesText] = useState('');
  const [chronicDiseasesText, setChronicDiseasesText] = useState('');

  // Baseline Clinical Vitals (Only BP, RBS, Height in inch, Weight in Kg)
  const [bpSystolic, setBpSystolic] = useState<number>(120);
  const [bpDiastolic, setBpDiastolic] = useState<number>(80);
  const [rbs, setRbs] = useState<number>(110);
  const [heightInches, setHeightInches] = useState<number>(65);
  const [weight, setWeight] = useState<number>(60);

  // AI Voice & Text Intake States
  const [voiceText, setVoiceText] = useState('');
  const [isListening, setIsListening] = useState(false);
  const [isParsing, setIsParsing] = useState(false);
  const [aiMessage, setAiMessage] = useState<{ text: string; type: 'success' | 'error' | 'info' } | null>(null);
  const [highlightFields, setHighlightFields] = useState(false);
  const recognitionRef = useRef<any>(null);

  // Clean up speech recognition on modal close or unmount
  useEffect(() => {
    return () => {
      if (recognitionRef.current) {
        try {
          recognitionRef.current.stop();
        } catch (_) {}
      }
    };
  }, []);

  const toggleListening = () => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      setAiMessage({
        text: 'Microphone speech recognition is not supported in this browser. You can type or paste text in the box and click Fill!',
        type: 'info'
      });
      return;
    }

    if (isListening) {
      if (recognitionRef.current) {
        try {
          recognitionRef.current.stop();
        } catch (_) {}
      }
      setIsListening(false);
      return;
    }

    try {
      const recognition = new SpeechRecognition();
      recognitionRef.current = recognition;
      recognition.continuous = false;
      recognition.interimResults = true;
      recognition.lang = 'en-IN'; // Indian English, accommodates Belgaum/Marathi names & accents

      recognition.onstart = () => {
        setIsListening(true);
        setAiMessage({
          text: 'Listening... Speak patient details (e.g. "Sachin Chougule 25 years male satya at Belgaum, BP 130-80, RBS 110")',
          type: 'info'
        });
      };

      recognition.onresult = (event: any) => {
        let transcript = '';
        for (let i = 0; i < event.results.length; i++) {
          transcript += event.results[i][0].transcript + ' ';
        }
        const clean = transcript.trim();
        setVoiceText(clean);
      };

      recognition.onerror = (event: any) => {
        console.warn('Speech recognition error:', event.error);
        setIsListening(false);
        if (event.error === 'not-allowed') {
          setAiMessage({
            text: 'Microphone permission was denied. Please allow microphone access in your browser or type details in the box.',
            type: 'error'
          });
        }
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognition.start();
    } catch (err: any) {
      console.error('Failed to start speech recognition:', err);
      setIsListening(false);
    }
  };

  const handleAutoFill = async (textToParse: string) => {
    if (!textToParse || !textToParse.trim()) return;

    setIsParsing(true);
    setAiMessage({ text: 'AI is analyzing and auto-filling patient fields...', type: 'info' });

    try {
      const parsed = await parsePatientWithAI(textToParse);
      let fieldsFilledCount = 0;

      if (parsed.name) {
        setName(parsed.name);
        fieldsFilledCount++;
      }
      if (parsed.age !== undefined && parsed.age !== null) {
        setAge(parsed.age);
        fieldsFilledCount++;
      }
      if (parsed.gender) {
        setGender(parsed.gender);
        fieldsFilledCount++;
      }
      if (parsed.mobile) {
        setMobile(parsed.mobile);
        fieldsFilledCount++;
      }
      if (parsed.address) {
        setAddress(parsed.address);
        fieldsFilledCount++;
      }
      if (parsed.bpSystolic) {
        setBpSystolic(parsed.bpSystolic);
        fieldsFilledCount++;
      }
      if (parsed.bpDiastolic) {
        setBpDiastolic(parsed.bpDiastolic);
        fieldsFilledCount++;
      }
      if (parsed.rbs) {
        setRbs(parsed.rbs);
        fieldsFilledCount++;
      }
      if (parsed.weight) {
        setWeight(parsed.weight);
        fieldsFilledCount++;
      }
      if (parsed.heightInches) {
        setHeightInches(parsed.heightInches);
        fieldsFilledCount++;
      }
      if (parsed.allergies && parsed.allergies.length > 0) {
        setAllergiesText(parsed.allergies.join(', '));
        fieldsFilledCount++;
      }
      if (parsed.chronicDiseases && parsed.chronicDiseases.length > 0) {
        setChronicDiseasesText(parsed.chronicDiseases.join(', '));
        fieldsFilledCount++;
      }

      setHighlightFields(true);
      setTimeout(() => setHighlightFields(false), 3000);

      const summaryParts = [];
      if (parsed.name) summaryParts.push(parsed.name);
      if (parsed.age) summaryParts.push(`${parsed.age} Yrs`);
      if (parsed.gender) summaryParts.push(parsed.gender);
      if (parsed.address) summaryParts.push(parsed.address);
      if (parsed.bpSystolic && parsed.bpDiastolic) summaryParts.push(`BP ${parsed.bpSystolic}/${parsed.bpDiastolic}`);
      if (parsed.rbs) summaryParts.push(`RBS ${parsed.rbs}`);

      setAiMessage({
        text: `AI Auto-filled (${fieldsFilledCount} fields): ${summaryParts.join(' • ')}`,
        type: 'success'
      });
    } catch (err: any) {
      console.error('Auto-fill error:', err);
      // Fallback locally
      const local = parsePatientTextLocally(textToParse);
      if (local.name) setName(local.name);
      if (local.age) setAge(local.age);
      if (local.gender) setGender(local.gender);
      if (local.address) setAddress(local.address);
      if (local.bpSystolic) setBpSystolic(local.bpSystolic);
      if (local.bpDiastolic) setBpDiastolic(local.bpDiastolic);
      if (local.rbs) setRbs(local.rbs);

      setAiMessage({
        text: `Extracted: ${local.name || ''} ${local.age ? `${local.age} Yrs` : ''} BP ${local.bpSystolic || 120}/${local.bpDiastolic || 80} RBS ${local.rbs || 110}`,
        type: 'success'
      });
    } finally {
      setIsParsing(false);
    }
  };

  const handleApplyExample = () => {
    const example = 'sachin chougule 25 years male satya at belgaum , Bp-130-80, RBS- 110';
    setVoiceText(example);
    handleAutoFill(example);
  };

  if (!isOpen) return null;

  const calculateBmi = () => {
    if (heightInches > 0) {
      const heightInMeters = heightInches * 0.0254;
      return Number((weight / (heightInMeters * heightInMeters)).toFixed(1));
    }
    return 22.0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !mobile.trim()) {
      alert('Please provide patient name and contact mobile number.');
      return;
    }

    const calculatedBmi = calculateBmi();

    const vitals: PatientVitals = {
      bpSystolic: Number(bpSystolic) || 120,
      bpDiastolic: Number(bpDiastolic) || 80,
      pulse: 72,
      temperature: 98.6,
      spo2: 99,
      weight: Number(weight) || 60,
      height: Number(heightInches) || 65,
      heightInch: Number(heightInches) || 65,
      bmi: calculatedBmi,
      rbs: Number(rbs) || 110,
      respiratoryRate: 16
    };

    const allergies = allergiesText
      .split(',')
      .map(s => s.trim())
      .filter(Boolean);

    const chronicDiseases = chronicDiseasesText
      .split(',')
      .map(s => s.trim())
      .filter(Boolean);

    createPatient({
      name: name.trim(),
      age: age === '' ? 30 : Number(age),
      gender,
      mobile: mobile.trim(),
      address: address.trim() || 'Not specified',
      vitals,
      allergies,
      chronicDiseases
    });

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 backdrop-blur-xs p-4 overflow-y-auto">
      <div
        id="modal-patient-registration"
        className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-2xl my-8 overflow-hidden flex flex-col max-h-[90vh]"
      >
        {/* Modal Header */}
        <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-teal-500/20 text-teal-400">
              <User className="w-5 h-5" />
            </div>
            <div>
              <h2 className="font-bold text-base text-white">Patient Registration</h2>
              <p className="text-xs text-slate-300">
                Register new patient profile with baseline vitals
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body Form */}
        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-6 text-xs">
          {/* AI Voice & Text Smart Intake (Mic + Small text box + AI Auto-fill) */}
          <div className="bg-gradient-to-r from-teal-50/90 via-emerald-50/60 to-slate-50 border border-teal-200/90 rounded-xl p-3.5 shadow-2xs space-y-2">
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-1.5">
                <div className="w-6 h-6 rounded-md bg-teal-600 text-white flex items-center justify-center shadow-2xs">
                  <Sparkles className="w-3.5 h-3.5" />
                </div>
                <div>
                  <span className="font-bold text-slate-800 text-xs flex items-center gap-1.5">
                    AI Voice Smart Intake <span className="text-[10px] text-teal-700 font-normal hidden sm:inline">(बोलून किंवा टाईप करून माहिती भरा)</span>
                  </span>
                </div>
              </div>
              <button
                type="button"
                onClick={handleApplyExample}
                className="text-[11px] font-semibold text-teal-700 hover:text-teal-900 bg-white hover:bg-teal-50 px-2 py-0.5 rounded-md border border-teal-200/80 shadow-2xs transition-colors"
                title="Click to load: sachin chougule 25 years male satya at belgaum , Bp-130-80, RBS- 110"
              >
                Try Example
              </button>
            </div>

            {/* Small text box with Mic Button */}
            <div className="relative flex items-center">
              <input
                id="input-voice-intake"
                type="text"
                value={voiceText}
                onChange={(e) => setVoiceText(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleAutoFill(voiceText);
                  }
                }}
                placeholder={
                  isListening
                    ? '🔴 Listening... Speak now (बोला, नाव, वय, पत्ता, BP, शुगर...)'
                    : 'Speak or type: e.g. "sachin chougule 25 years male satya at belgaum , Bp-130-80, RBS- 110"'
                }
                className={`w-full pl-3 pr-24 py-2 text-xs rounded-lg border bg-white text-slate-900 placeholder:text-slate-400 focus:outline-none transition-all ${
                  isListening
                    ? 'border-rose-400 ring-2 ring-rose-200 bg-rose-50/30'
                    : 'border-teal-300 focus:ring-2 focus:ring-teal-500 shadow-2xs'
                }`}
              />

              {/* Action buttons inside the right side of the text box */}
              <div className="absolute right-1 flex items-center gap-1">
                {voiceText && (
                  <button
                    type="button"
                    onClick={() => {
                      setVoiceText('');
                      setAiMessage(null);
                    }}
                    className="p-1 text-slate-400 hover:text-slate-600 rounded-md transition-colors"
                    title="Clear"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}

                {/* Mic Button */}
                <button
                  id="btn-voice-mic"
                  type="button"
                  onClick={toggleListening}
                  className={`px-2 py-1 rounded-md flex items-center gap-1 text-xs font-semibold transition-all ${
                    isListening
                      ? 'bg-rose-600 text-white animate-pulse shadow-xs ring-2 ring-rose-300'
                      : 'bg-teal-600 hover:bg-teal-700 text-white shadow-2xs'
                  }`}
                  title={isListening ? 'Stop Listening (थांबवा)' : 'Click to Speak with Mic (माईकवर बोला)'}
                >
                  {isListening ? (
                    <>
                      <span className="w-2 h-2 rounded-full bg-white animate-ping" />
                      <MicOff className="w-3.5 h-3.5" />
                      <span className="text-[10px]">Listening</span>
                    </>
                  ) : (
                    <>
                      <Mic className="w-3.5 h-3.5" />
                      <span className="hidden sm:inline text-[11px]">Mic</span>
                    </>
                  )}
                </button>

                {/* AI Parse/Fill Button */}
                <button
                  id="btn-voice-autofill"
                  type="button"
                  onClick={() => handleAutoFill(voiceText)}
                  disabled={!voiceText.trim() || isParsing}
                  className="px-2 py-1 bg-slate-900 hover:bg-slate-800 disabled:bg-slate-200 disabled:text-slate-400 text-white rounded-md text-xs font-semibold transition-colors flex items-center gap-1 shadow-2xs"
                  title="Auto-fill form fields with AI"
                >
                  {isParsing ? (
                    <Loader2 className="w-3.5 h-3.5 animate-spin text-teal-400" />
                  ) : (
                    <Sparkles className="w-3.5 h-3.5 text-teal-300" />
                  )}
                  <span className="text-[11px]">{isParsing ? 'Filling...' : 'Fill'}</span>
                </button>
              </div>
            </div>

            {/* AI Status / Notification banner */}
            {aiMessage && (
              <div
                className={`text-[11px] px-2.5 py-1.5 rounded-lg flex items-center gap-1.5 transition-all ${
                  aiMessage.type === 'success'
                    ? 'bg-emerald-100/80 text-emerald-900 border border-emerald-300 font-medium'
                    : aiMessage.type === 'error'
                    ? 'bg-rose-50 text-rose-800 border border-rose-200'
                    : 'bg-teal-100/60 text-teal-900 border border-teal-200'
                }`}
              >
                {aiMessage.type === 'success' ? (
                  <Check className="w-3.5 h-3.5 text-emerald-700 shrink-0" />
                ) : aiMessage.type === 'error' ? (
                  <AlertCircle className="w-3.5 h-3.5 text-rose-600 shrink-0" />
                ) : (
                  <Loader2 className="w-3.5 h-3.5 text-teal-600 animate-spin shrink-0" />
                )}
                <span className="truncate">{aiMessage.text}</span>
              </div>
            )}
          </div>

          {/* Section 1: Demographics */}
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-3 flex items-center gap-1.5">
              <User className="w-3.5 h-3.5 text-teal-600" />
              Patient Demographics
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              <div className="sm:col-span-2">
                <label className="block font-medium text-slate-700 mb-1">
                  Full Name (with salutation) *
                </label>
                <input
                  id="input-patient-name"
                  type="text"
                  required
                  placeholder="e.g. Mrs. Sunita Verma / Mr. Rahul Patil"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className={`w-full border rounded-lg px-3 py-2 text-xs text-slate-900 focus:ring-2 focus:ring-teal-500 focus:outline-none transition-all ${
                    highlightFields ? 'border-teal-400 ring-2 ring-teal-200 bg-teal-50/20' : 'border-slate-300'
                  }`}
                />
              </div>

              <div>
                <label className="block font-medium text-slate-700 mb-1">Age (Years) *</label>
                <input
                  id="input-patient-age"
                  type="number"
                  min="0"
                  max="125"
                  required
                  placeholder="e.g. 35"
                  value={age}
                  onChange={(e) => setAge(e.target.value === '' ? '' : Number(e.target.value))}
                  className={`w-full border rounded-lg px-3 py-2 text-xs text-slate-900 focus:ring-2 focus:ring-teal-500 focus:outline-none transition-all ${
                    highlightFields ? 'border-teal-400 ring-2 ring-teal-200 bg-teal-50/20' : 'border-slate-300'
                  }`}
                />
              </div>

              <div>
                <label className="block font-medium text-slate-700 mb-1">Gender *</label>
                <select
                  id="select-patient-gender"
                  value={gender}
                  onChange={(e) => setGender(e.target.value as Gender)}
                  className={`w-full border rounded-lg px-3 py-2 text-xs text-slate-900 focus:ring-2 focus:ring-teal-500 focus:outline-none transition-all ${
                    highlightFields ? 'border-teal-400 ring-2 ring-teal-200 bg-teal-50/20' : 'border-slate-300'
                  }`}
                >
                  <option value="Female">Female</option>
                  <option value="Male">Male</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              <div>
                <label className="block font-medium text-slate-700 mb-1">Mobile (WhatsApp) *</label>
                <input
                  id="input-patient-mobile"
                  type="text"
                  required
                  placeholder="+91 98200 12345"
                  value={mobile}
                  onChange={(e) => setMobile(e.target.value)}
                  className={`w-full border rounded-lg px-3 py-2 text-xs text-slate-900 focus:ring-2 focus:ring-teal-500 focus:outline-none transition-all ${
                    highlightFields ? 'border-teal-400 ring-2 ring-teal-200 bg-teal-50/20' : 'border-slate-300'
                  }`}
                />
              </div>

              <div>
                <label className="block font-medium text-slate-700 mb-1">Residential Address</label>
                <input
                  id="input-patient-address"
                  type="text"
                  placeholder="Street, City, Area (e.g. Belgaum)"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  className={`w-full border rounded-lg px-3 py-2 text-xs text-slate-900 focus:ring-2 focus:ring-teal-500 focus:outline-none transition-all ${
                    highlightFields ? 'border-teal-400 ring-2 ring-teal-200 bg-teal-50/20' : 'border-slate-300'
                  }`}
                />
              </div>
            </div>
          </div>

          {/* Section 2: Baseline Clinical Vitals (BP, RBS, Height in inch, Weight in Kg) */}
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-3 flex items-center gap-1.5">
              <Heart className="w-3.5 h-3.5 text-rose-500" />
              Baseline Clinical Vitals
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
              {/* BP Systolic / Diastolic */}
              <div className="sm:col-span-2 lg:col-span-1">
                <label className="block font-medium text-slate-700 mb-1">BP (Systolic / Diastolic)</label>
                <div className="flex items-center gap-1.5">
                  <div className="relative flex-1">
                    <input
                      id="input-vitals-bp-systolic"
                      type="number"
                      placeholder="120"
                      value={bpSystolic}
                      onChange={(e) => setBpSystolic(Number(e.target.value))}
                      className={`w-full border rounded-lg px-2.5 py-2 text-xs text-slate-900 focus:ring-2 focus:ring-teal-500 focus:outline-none transition-all ${
                        highlightFields ? 'border-teal-400 ring-2 ring-teal-200 bg-teal-50/20' : 'border-slate-300'
                      }`}
                    />
                  </div>
                  <span className="text-slate-400 font-bold">/</span>
                  <div className="relative flex-1">
                    <input
                      id="input-vitals-bp-diastolic"
                      type="number"
                      placeholder="80"
                      value={bpDiastolic}
                      onChange={(e) => setBpDiastolic(Number(e.target.value))}
                      className={`w-full border rounded-lg px-2.5 py-2 text-xs text-slate-900 focus:ring-2 focus:ring-teal-500 focus:outline-none transition-all ${
                        highlightFields ? 'border-teal-400 ring-2 ring-teal-200 bg-teal-50/20' : 'border-slate-300'
                      }`}
                    />
                  </div>
                  <span className="text-[10px] text-slate-400 font-medium shrink-0">mmHg</span>
                </div>
              </div>

              {/* RBS (Blood Sugar) */}
              <div>
                <label className="block font-medium text-slate-700 mb-1">RBS (Blood Sugar)</label>
                <div className="relative">
                  <input
                    id="input-vitals-rbs"
                    type="number"
                    value={rbs}
                    onChange={(e) => setRbs(Number(e.target.value))}
                    className={`w-full border rounded-lg px-3 py-2 text-xs text-slate-900 focus:ring-2 focus:ring-teal-500 focus:outline-none transition-all ${
                      highlightFields ? 'border-teal-400 ring-2 ring-teal-200 bg-teal-50/20' : 'border-slate-300'
                    }`}
                  />
                  <span className="text-[10px] text-slate-400 absolute right-2.5 top-2.5">mg/dL</span>
                </div>
              </div>

              {/* Height in inches */}
              <div>
                <label className="block font-medium text-slate-700 mb-1">Height (inches)</label>
                <div className="relative">
                  <input
                    id="input-vitals-height"
                    type="number"
                    step="0.5"
                    placeholder="e.g. 65"
                    value={heightInches}
                    onChange={(e) => setHeightInches(Number(e.target.value))}
                    className={`w-full border rounded-lg px-3 py-2 text-xs text-slate-900 focus:ring-2 focus:ring-teal-500 focus:outline-none transition-all ${
                      highlightFields ? 'border-teal-400 ring-2 ring-teal-200 bg-teal-50/20' : 'border-slate-300'
                    }`}
                  />
                  <span className="text-[10px] text-slate-400 absolute right-2.5 top-2.5">in</span>
                </div>
              </div>

              {/* Weight in kg */}
              <div>
                <label className="block font-medium text-slate-700 mb-1">Weight (kg)</label>
                <div className="relative">
                  <input
                    id="input-vitals-weight"
                    type="number"
                    step="0.5"
                    placeholder="e.g. 60"
                    value={weight}
                    onChange={(e) => setWeight(Number(e.target.value))}
                    className={`w-full border rounded-lg px-3 py-2 text-xs text-slate-900 focus:ring-2 focus:ring-teal-500 focus:outline-none transition-all ${
                      highlightFields ? 'border-teal-400 ring-2 ring-teal-200 bg-teal-50/20' : 'border-slate-300'
                    }`}
                  />
                  <span className="text-[10px] text-slate-400 absolute right-2.5 top-2.5">kg</span>
                </div>
              </div>
            </div>
          </div>

          {/* Section 3: Allergies & Chronic Conditions */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <div>
              <label className="block font-medium text-slate-700 mb-1">
                Known Allergies (optional, comma separated)
              </label>
              <input
                type="text"
                placeholder="e.g. Dust, Penicillin, Peanuts"
                value={allergiesText}
                onChange={(e) => setAllergiesText(e.target.value)}
                className="w-full border border-slate-300 rounded-lg px-3 py-2 text-xs text-slate-900 focus:ring-2 focus:ring-teal-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block font-medium text-slate-700 mb-1">
                Chronic Health Conditions (optional, comma separated)
              </label>
              <input
                type="text"
                placeholder="e.g. Hypertension, Migraine, PCOD"
                value={chronicDiseasesText}
                onChange={(e) => setChronicDiseasesText(e.target.value)}
                className="w-full border border-slate-300 rounded-lg px-3 py-2 text-xs text-slate-900 focus:ring-2 focus:ring-teal-500 focus:outline-none"
              />
            </div>
          </div>

          {/* Footer Buttons */}
          <div className="pt-4 border-t border-slate-200 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold rounded-lg text-slate-600 hover:bg-slate-100 transition-colors"
            >
              Cancel
            </button>
            <button
              id="btn-submit-patient-registration"
              type="submit"
              className="px-5 py-2 text-xs font-semibold rounded-lg bg-teal-600 hover:bg-teal-500 text-white transition-colors shadow-sm flex items-center gap-1.5"
            >
              <CheckCircle className="w-4 h-4" />
              <span>Register Patient</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
