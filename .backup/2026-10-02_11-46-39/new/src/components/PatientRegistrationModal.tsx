import React, { useState, useRef, useEffect } from 'react';
import { useClinic } from '../context/ClinicContext';
import type { Gender, PatientVitals, HomeoMedicine } from '../types';
import { CLINIC_CONFIG } from '../config/clinicConfig';
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
  AlertCircle,
  Pill,
  IndianRupee
} from 'lucide-react';

interface PatientRegistrationModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const PatientRegistrationModal: React.FC<PatientRegistrationModalProps> = ({
  isOpen,
  onClose
}) => {
  const { createPatient, savePrescription, saveInvoice, selectPatient, currentUser } = useClinic();

  const [name, setName] = useState('');
  const [age, setAge] = useState<number | ''>('');
  const [gender, setGender] = useState<Gender>('Female');
  const [mobile, setMobile] = useState('+91 ');
  const [address, setAddress] = useState('');
  const [chronicDiseasesText, setChronicDiseasesText] = useState('');

  const [medicineGiven, setMedicineGiven] = useState('');
  const [totalBill, setTotalBill] = useState<number | ''>('');

  const [bpSystolic, setBpSystolic] = useState<number>(120);
  const [bpDiastolic, setBpDiastolic] = useState<number>(80);
  const [rbs, setRbs] = useState<number>(110);
  const [heightInches, setHeightInches] = useState<number>(65);
  const [weight, setWeight] = useState<number>(60);

  const [voiceText, setVoiceText] = useState('');
  const [isListening, setIsListening] = useState(false);
  const [isParsing, setIsParsing] = useState(false);
  const [aiMessage, setAiMessage] = useState<{ text: string; type: 'success' | 'error' | 'info' } | null>(null);
  const [highlightFields, setHighlightFields] = useState(false);
  const [saving, setSaving] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const recognitionRef = useRef<any>(null);

  useEffect(() => {
    return () => {
      if (recognitionRef.current) {
        try {
          recognitionRef.current.stop();
        } catch {
          /* noop */
        }
      }
    };
  }, []);

  const toggleListening = () => {
    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      setAiMessage({
        text: 'Speech recognition is not supported in this browser. You can type text and click Fill.',
        type: 'info'
      });
      return;
    }

    if (isListening) {
      try {
        recognitionRef.current?.stop();
      } catch {
        /* noop */
      }
      setIsListening(false);
      return;
    }

    try {
      const recognition = new SpeechRecognition();
      recognitionRef.current = recognition;
      recognition.continuous = false;
      recognition.interimResults = true;
      recognition.lang = 'en-IN';

      recognition.onstart = () => {
        setIsListening(true);
        setAiMessage({
          text: 'Listening... speak details (name, age, BP, sugar, medicine, bill)',
          type: 'info'
        });
      };

      recognition.onresult = (event: any) => {
        let transcript = '';
        for (let i = 0; i < event.results.length; i++) {
          transcript += event.results[i][0].transcript + ' ';
        }
        setVoiceText(transcript.trim());
      };

      recognition.onerror = (event: any) => {
        setIsListening(false);
        if (event.error === 'not-allowed') {
          setAiMessage({ text: 'Microphone permission denied.', type: 'error' });
        }
      };

      recognition.onend = () => setIsListening(false);
      recognition.start();
    } catch (err) {
      console.error('Failed to start speech recognition:', err);
      setIsListening(false);
    }
  };

  const handleAutoFill = async (textToParse: string) => {
    if (!textToParse.trim()) return;
    setIsParsing(true);
    setAiMessage({ text: 'AI is analyzing and auto-filling patient fields...', type: 'info' });

    try {
      const parsed = await parsePatientWithAI(textToParse);
      let count = 0;
      if (parsed.name) {
        setName(parsed.name);
        count++;
      }
      if (parsed.age !== undefined && parsed.age !== null) {
        setAge(parsed.age);
        count++;
      }
      if (parsed.gender) {
        setGender(parsed.gender);
        count++;
      }
      if (parsed.mobile) {
        setMobile(parsed.mobile);
        count++;
      }
      if (parsed.address) {
        setAddress(parsed.address);
        count++;
      }
      if (parsed.bpSystolic) {
        setBpSystolic(parsed.bpSystolic);
        count++;
      }
      if (parsed.bpDiastolic) {
        setBpDiastolic(parsed.bpDiastolic);
        count++;
      }
      if (parsed.rbs) {
        setRbs(parsed.rbs);
        count++;
      }
      if (parsed.weight) {
        setWeight(parsed.weight);
        count++;
      }
      if (parsed.heightInches) {
        setHeightInches(parsed.heightInches);
        count++;
      }
      if (parsed.chronicDiseases && parsed.chronicDiseases.length > 0) {
        setChronicDiseasesText(parsed.chronicDiseases.join(', '));
        count++;
      }
      if (parsed.medicineGiven) {
        setMedicineGiven(parsed.medicineGiven);
        count++;
      }
      if (parsed.totalBill !== undefined && parsed.totalBill !== null) {
        setTotalBill(parsed.totalBill);
        count++;
      }

      setHighlightFields(true);
      setTimeout(() => setHighlightFields(false), 3000);

      setAiMessage({
        text: `Auto-filled ${count} field(s). Review and click Register Patient.`,
        type: 'success'
      });
    } catch (err) {
      const local = parsePatientTextLocally(textToParse);
      if (local.name) setName(local.name);
      if (local.age) setAge(local.age);
      if (local.gender) setGender(local.gender);
      if (local.address) setAddress(local.address);
      if (local.bpSystolic) setBpSystolic(local.bpSystolic);
      if (local.bpDiastolic) setBpDiastolic(local.bpDiastolic);
      if (local.rbs) setRbs(local.rbs);
      if (local.medicineGiven) setMedicineGiven(local.medicineGiven);
      if (local.totalBill) setTotalBill(local.totalBill);
      setAiMessage({
        text: 'Basic auto-fill applied. Review and register.',
        type: 'success'
      });
    } finally {
      setIsParsing(false);
    }
  };

  const handleApplyExample = () => {
    const example =
      'sachin chougule 25 years male satya at belgaum , Bp-130-80, RBS- 110, Medicine Arnica 200 TDS, Bill 500';
    setVoiceText(example);
    void handleAutoFill(example);
  };

  if (!isOpen) return null;

  const calculateBmi = () => {
    if (heightInches > 0 && weight > 0) {
      const heightInMeters = heightInches * 0.0254;
      return Number((weight / (heightInMeters * heightInMeters)).toFixed(1));
    }
    return 22.0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitError(null);
    setSaving(true);

    const finalName = name.trim() || 'Patient (OPD Walk-in)';
    const finalMobile =
      mobile.trim() && mobile.trim() !== '+91' ? mobile.trim() : 'Not provided';
    const finalAge = typeof age === 'number' && age > 0 ? age : 30;
    const finalAddress = address.trim() || 'Belgaum';

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
      heightInches: Number(heightInches) || 65,
      bmi: calculatedBmi,
      rbs: Number(rbs) || 110,
      respiratoryRate: 16
    };

    const chronicDiseases = chronicDiseasesText
      .split(',')
      .map(s => s.trim())
      .filter(Boolean);

    try {
      const newPatient = await createPatient({
        name: finalName,
        age: finalAge,
        gender,
        mobile: finalMobile,
        address: finalAddress,
        vitals,
        allergies: [],
        chronicDiseases
      });

      selectPatient(newPatient.id);

      if (medicineGiven.trim()) {
        const medLines = medicineGiven
          .split(/[,\n;]/)
          .map(s => s.trim())
          .filter(Boolean);

        const homeoMedicines: HomeoMedicine[] = medLines.map((line, idx) => {
          const potencyMatch = line.match(
            /\b(30C|200C|1M|10M|50M|CM|LM\s*\d|Q|3X|6X|12X|30|200)\b/i
          );
          let potency: HomeoMedicine['potency'] = '200C';
          let remedyName = line;
          if (potencyMatch) {
            const pStr = potencyMatch[0].toUpperCase();
            if (pStr === '30' || pStr === '30C') potency = '30C';
            else if (pStr === '200' || pStr === '200C') potency = '200C';
            else if (pStr === '1M') potency = '1M';
            else if (pStr === '10M') potency = '10M';
            else if (pStr === 'Q') potency = 'Q (Mother Tincture)';
            else if (pStr.includes('LM')) potency = 'LM 1';
            remedyName = line
              .replace(potencyMatch[0], '')
              .replace(/[()]/g, '')
              .trim();
          }
          return {
            id: `tmp-${Date.now()}-${idx}`,
            remedy: remedyName || line,
            potency,
            form: 'Globules #30' as const,
            dosage: '4 pills',
            frequency: 'TDS (Thrice Daily)' as const,
            duration: '7 days',
            instructions: 'Take 30 mins before food. Avoid coffee / onion.'
          };
        });

        await savePrescription({
          patientId: newPatient.id,
          consultationDate: new Date().toISOString().split('T')[0],
          diagnosis:
            chronicDiseases.length > 0
              ? chronicDiseases.join(', ')
              : 'OPD Consultation Prescription',
          clinicalNotes: `Direct prescription at OPD registration: ${medicineGiven.trim()}`,
          homeoMedicines:
            homeoMedicines.length > 0
              ? homeoMedicines
              : [
                  {
                    id: `tmp-${Date.now()}`,
                    remedy: medicineGiven.trim(),
                    potency: '200C',
                    form: 'Globules #30',
                    dosage: '4 pills',
                    frequency: 'TDS (Thrice Daily)',
                    duration: '7 days',
                    instructions: 'Take 30 mins before food.'
                  }
                ],
          alloMedicines: [],
          dietaryAdvise: [
            'Maintain regular meal timings.',
            'Drink 2.5 - 3 L of clean water daily.',
            'Avoid strong camphor, raw onions around homeopathic doses.'
          ],
          investigationsOrdered: [],
          followUpDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000)
            .toISOString()
            .split('T')[0],
          doctorName: currentUser?.name || CLINIC_CONFIG.doctorName,
          doctorDegree: currentUser?.qualifications || CLINIC_CONFIG.qualifications,
          doctorRegNo: currentUser?.regNo || CLINIC_CONFIG.regNo,
          clinicName: currentUser?.clinicName || CLINIC_CONFIG.appName,
          clinicAddress: currentUser?.address || CLINIC_CONFIG.address,
          clinicPhone: currentUser?.phone || CLINIC_CONFIG.phone
        });
      }

      const billAmount = Number(totalBill);
      if (billAmount && billAmount > 0) {
        await saveInvoice({
          invoiceNumber: `INV-${Date.now().toString().slice(-6)}`,
          patientId: newPatient.id,
          patientName: newPatient.name,
          date: new Date().toISOString().split('T')[0],
          items: [
            {
              description: medicineGiven.trim()
                ? `OPD Consultation & Dispensed Medicines`
                : 'OPD Consultation & Dispensing Fee',
              amount: billAmount
            }
          ],
          consultationFee: Math.round(billAmount * 0.6),
          medicineCharges: Math.round(billAmount * 0.4),
          discount: 0,
          totalAmount: billAmount,
          paymentMode: 'Cash',
          status: 'Paid'
        });
      }

      onClose();
    } catch (err) {
      setSubmitError(err instanceof Error ? err.message : 'Failed to register patient');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 backdrop-blur-xs p-4 overflow-y-auto">
      <div
        id="modal-patient-registration"
        className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-2xl my-8 overflow-hidden flex flex-col max-h-[90vh]"
      >
        <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-teal-500/20 text-teal-400">
              <User className="w-5 h-5" />
            </div>
            <div>
              <h2 className="font-bold text-base text-white">Patient Registration</h2>
              <p className="text-xs text-slate-300">
                Fast OPD registration with prescription &amp; billing shortcuts
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

        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-5 text-xs">
          {submitError && (
            <div className="p-3 bg-rose-50 border border-rose-200 rounded-lg text-rose-800 flex items-center gap-2">
              <AlertCircle className="w-4 h-4" />
              <span>{submitError}</span>
            </div>
          )}

          <div className="bg-gradient-to-r from-teal-50 via-emerald-50 to-cyan-50 border border-teal-200 rounded-xl p-3.5 space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="p-1.5 rounded-lg bg-teal-600 text-white">
                  <Sparkles className="w-3.5 h-3.5" />
                </span>
                <span className="font-bold text-slate-900 text-xs">
                  AI Voice &amp; Paragraph Smart Intake
                </span>
              </div>
              <button
                type="button"
                onClick={handleApplyExample}
                className="text-[11px] font-semibold text-teal-700 hover:text-teal-900 underline"
              >
                Try Example
              </button>
            </div>

            <div className="relative flex items-center">
              <input
                id="input-voice-intake"
                type="text"
                value={voiceText}
                onChange={e => setVoiceText(e.target.value)}
                onKeyDown={e => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    void handleAutoFill(voiceText);
                  }
                }}
                placeholder={
                  isListening
                    ? 'Listening... speak patient details'
                    : 'Speak or type: "name age gender at address, Bp-130-80, RBS-110, Medicine Arnica 200, Bill 500"'
                }
                className={`w-full pl-3 pr-24 py-2 text-xs rounded-lg border bg-white text-slate-900 placeholder:text-slate-400 focus:outline-none transition-all ${
                  isListening
                    ? 'border-rose-400 ring-2 ring-rose-200 bg-rose-50/30'
                    : 'border-teal-300 focus:ring-2 focus:ring-teal-500'
                }`}
              />

              <div className="absolute right-1 flex items-center gap-1">
                {voiceText && (
                  <button
                    type="button"
                    onClick={() => {
                      setVoiceText('');
                      setAiMessage(null);
                    }}
                    className="p-1 text-slate-400 hover:text-slate-600 rounded-md"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}

                <button
                  id="btn-voice-mic"
                  type="button"
                  onClick={toggleListening}
                  className={`px-2 py-1 rounded-md flex items-center gap-1 text-xs font-semibold transition-all ${
                    isListening
                      ? 'bg-rose-600 text-white animate-pulse'
                      : 'bg-teal-600 hover:bg-teal-700 text-white'
                  }`}
                >
                  {isListening ? (
                    <>
                      <span className="w-2 h-2 rounded-full bg-white animate-ping" />
                      <MicOff className="w-3.5 h-3.5" />
                    </>
                  ) : (
                    <Mic className="w-3.5 h-3.5" />
                  )}
                </button>

                <button
                  id="btn-voice-autofill"
                  type="button"
                  onClick={() => handleAutoFill(voiceText)}
                  disabled={!voiceText.trim() || isParsing}
                  className="px-2 py-1 bg-slate-900 hover:bg-slate-800 disabled:bg-slate-200 disabled:text-slate-400 text-white rounded-md text-xs font-semibold flex items-center gap-1"
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

            {aiMessage && (
              <div
                className={`text-[11px] px-2.5 py-1.5 rounded-lg flex items-center gap-1.5 ${
                  aiMessage.type === 'success'
                    ? 'bg-emerald-100/80 text-emerald-900 border border-emerald-300'
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

          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-3 flex items-center gap-1.5">
              <User className="w-3.5 h-3.5 text-teal-600" />
              Patient Demographics
              <span className="text-[10px] text-slate-400 font-normal lowercase">(all optional)</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              <div className="sm:col-span-2">
                <label className="block font-medium text-slate-700 mb-1">Full Name</label>
                <input
                  id="input-patient-name"
                  type="text"
                  placeholder="e.g. Sachin Chougule"
                  value={name}
                  onChange={e => setName(e.target.value)}
                  className={`w-full border rounded-lg px-3 py-2 text-xs text-slate-900 focus:ring-2 focus:ring-teal-500 focus:outline-none ${
                    highlightFields ? 'border-teal-400 ring-2 ring-teal-200 bg-teal-50/20' : 'border-slate-300'
                  }`}
                />
              </div>

              <div>
                <label className="block font-medium text-slate-700 mb-1">Age</label>
                <input
                  id="input-patient-age"
                  type="text"
                  inputMode="numeric"
                  placeholder="25"
                  value={age === '' ? '' : String(age)}
                  onChange={e => {
                    const clean = e.target.value.replace(/[^0-9]/g, '');
                    setAge(clean === '' ? '' : Number(clean));
                  }}
                  className={`w-full border rounded-lg px-3 py-2 text-xs text-slate-900 focus:ring-2 focus:ring-teal-500 focus:outline-none ${
                    highlightFields ? 'border-teal-400 ring-2 ring-teal-200 bg-teal-50/20' : 'border-slate-300'
                  }`}
                />
              </div>

              <div>
                <label className="block font-medium text-slate-700 mb-1">Gender</label>
                <select
                  id="select-patient-gender"
                  value={gender}
                  onChange={e => setGender(e.target.value as Gender)}
                  className="w-full border border-slate-300 rounded-lg px-3 py-2 text-xs text-slate-900 focus:ring-2 focus:ring-teal-500 focus:outline-none"
                >
                  <option value="Female">Female</option>
                  <option value="Male">Male</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              <div>
                <label className="block font-medium text-slate-700 mb-1">Mobile (WhatsApp)</label>
                <input
                  id="input-patient-mobile"
                  type="text"
                  placeholder="+91 98200 12345"
                  value={mobile}
                  onChange={e => setMobile(e.target.value)}
                  className="w-full border border-slate-300 rounded-lg px-3 py-2 text-xs text-slate-900 focus:ring-2 focus:ring-teal-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-medium text-slate-700 mb-1">Address</label>
                <input
                  id="input-patient-address"
                  type="text"
                  placeholder="Area, City"
                  value={address}
                  onChange={e => setAddress(e.target.value)}
                  className="w-full border border-slate-300 rounded-lg px-3 py-2 text-xs text-slate-900 focus:ring-2 focus:ring-teal-500 focus:outline-none"
                />
              </div>
            </div>
          </div>

          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-3 flex items-center gap-1.5">
              <Activity className="w-3.5 h-3.5 text-teal-600" />
              Clinical Vitals
            </h3>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div>
                <label className="block font-medium text-slate-700 mb-1 flex items-center gap-1">
                  <Heart className="w-3 h-3 text-rose-500" />
                  BP Systolic
                </label>
                <input
                  type="text"
                  inputMode="numeric"
                  value={bpSystolic ? String(bpSystolic) : ''}
                  onChange={e => {
                    const c = e.target.value.replace(/[^0-9]/g, '');
                    setBpSystolic(c ? Number(c) : 0);
                  }}
                  className="w-full border border-slate-300 rounded-lg px-2.5 py-1.5 text-xs text-slate-900 focus:ring-2 focus:ring-teal-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-medium text-slate-700 mb-1 flex items-center gap-1">
                  <Heart className="w-3 h-3 text-rose-500" />
                  BP Diastolic
                </label>
                <input
                  type="text"
                  inputMode="numeric"
                  value={bpDiastolic ? String(bpDiastolic) : ''}
                  onChange={e => {
                    const c = e.target.value.replace(/[^0-9]/g, '');
                    setBpDiastolic(c ? Number(c) : 0);
                  }}
                  className="w-full border border-slate-300 rounded-lg px-2.5 py-1.5 text-xs text-slate-900 focus:ring-2 focus:ring-teal-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-medium text-slate-700 mb-1 flex items-center gap-1">
                  <Activity className="w-3 h-3 text-amber-500" />
                  RBS
                </label>
                <input
                  type="text"
                  inputMode="numeric"
                  value={rbs ? String(rbs) : ''}
                  onChange={e => {
                    const c = e.target.value.replace(/[^0-9]/g, '');
                    setRbs(c ? Number(c) : 0);
                  }}
                  className="w-full border border-slate-300 rounded-lg px-2.5 py-1.5 text-xs text-slate-900 focus:ring-2 focus:ring-teal-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-medium text-slate-700 mb-1 flex items-center gap-1">
                  <Ruler className="w-3 h-3 text-indigo-500" />
                  Height (in)
                </label>
                <input
                  type="text"
                  inputMode="numeric"
                  value={heightInches ? String(heightInches) : ''}
                  onChange={e => {
                    const c = e.target.value.replace(/[^0-9]/g, '');
                    setHeightInches(c ? Number(c) : 0);
                  }}
                  className="w-full border border-slate-300 rounded-lg px-2.5 py-1.5 text-xs text-slate-900 focus:ring-2 focus:ring-teal-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-medium text-slate-700 mb-1 flex items-center gap-1">
                  <Weight className="w-3 h-3 text-emerald-500" />
                  Weight (kg)
                </label>
                <input
                  type="text"
                  inputMode="numeric"
                  value={weight ? String(weight) : ''}
                  onChange={e => {
                    const c = e.target.value.replace(/[^0-9]/g, '');
                    setWeight(c ? Number(c) : 0);
                  }}
                  className="w-full border border-slate-300 rounded-lg px-2.5 py-1.5 text-xs text-slate-900 focus:ring-2 focus:ring-teal-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-medium text-slate-700 mb-1">Calculated BMI</label>
                <div className="w-full bg-slate-100 rounded-lg px-2.5 py-1.5 text-xs font-mono font-bold text-slate-800 border border-slate-200">
                  {calculateBmi()} kg/m²
                </div>
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-amber-50/70 via-emerald-50/40 to-teal-50/50 border border-amber-200 rounded-xl p-4 space-y-3.5">
            <div className="flex items-center gap-1.5">
              <span className="p-1 rounded bg-amber-500 text-white">
                <Sparkles className="w-3.5 h-3.5" />
              </span>
              <span className="text-xs font-bold text-slate-900">
                Quick Prescription &amp; Billing Shortcuts
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              <div>
                <label className="block font-semibold text-slate-800 mb-1 flex items-center gap-1.5">
                  <Pill className="w-3.5 h-3.5 text-teal-600" />
                  Medicine Given
                </label>
                <input
                  id="input-medicine-given"
                  type="text"
                  placeholder="e.g. Arnica 200 TDS"
                  value={medicineGiven}
                  onChange={e => setMedicineGiven(e.target.value)}
                  className="w-full border border-slate-300 rounded-lg px-3 py-2 text-xs text-slate-900 bg-white focus:ring-2 focus:ring-teal-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-800 mb-1 flex items-center gap-1.5">
                  <IndianRupee className="w-3.5 h-3.5 text-emerald-600" />
                  Total Bill (₹)
                </label>
                <input
                  id="input-total-bill"
                  type="number"
                  min="0"
                  placeholder="e.g. 500"
                  value={totalBill}
                  onChange={e => setTotalBill(e.target.value === '' ? '' : Number(e.target.value))}
                  className="w-full border border-slate-300 rounded-lg px-3 py-2 text-xs text-slate-900 bg-white focus:ring-2 focus:ring-teal-500 focus:outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block font-medium text-slate-700 mb-1">
                Chronic Health Conditions (comma separated)
              </label>
              <input
                id="input-chronic-diseases"
                type="text"
                placeholder="e.g. Hypertension, Migraine, PCOD"
                value={chronicDiseasesText}
                onChange={e => setChronicDiseasesText(e.target.value)}
                className="w-full border border-slate-300 bg-white rounded-lg px-3 py-2 text-xs text-slate-900 focus:ring-2 focus:ring-teal-500 focus:outline-none"
              />
            </div>
          </div>

          <div className="pt-3 border-t border-slate-200 flex items-center justify-end gap-2.5">
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
              disabled={saving}
              className="px-5 py-2 text-xs font-semibold rounded-lg bg-teal-600 hover:bg-teal-500 disabled:opacity-60 text-white transition-colors shadow-sm flex items-center gap-1.5"
            >
              {saving ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <CheckCircle className="w-4 h-4" />
              )}
              <span>{saving ? 'Saving...' : 'Register Patient'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};