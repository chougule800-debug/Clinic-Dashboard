import React, { useState } from 'react';
import { useClinic } from '../context/ClinicContext';
import { Gender, PatientVitals } from '../types';
import {
  X,
  User,
  ShieldCheck,
  Heart,
  Activity,
  Weight,
  Droplet,
  Phone,
  Mail,
  MapPin,
  Sparkles,
  CheckCircle
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
  const [age, setAge] = useState<number>(30);
  const [gender, setGender] = useState<Gender>('Female');
  const [dob, setDob] = useState('1996-01-01');
  const [mobile, setMobile] = useState('+91 ');
  const [email, setEmail] = useState('');
  const [bloodGroup, setBloodGroup] = useState('B+');
  const [address, setAddress] = useState('');
  const [occupation, setOccupation] = useState('');
  const [emergencyContact, setEmergencyContact] = useState('');
  const [allergiesText, setAllergiesText] = useState('');
  const [chronicDiseasesText, setChronicDiseasesText] = useState('');

  // Vitals
  const [bpSystolic, setBpSystolic] = useState<number>(120);
  const [bpDiastolic, setBpDiastolic] = useState<number>(80);
  const [pulse, setPulse] = useState<number>(75);
  const [temperature, setTemperature] = useState<number>(98.6);
  const [spo2, setSpo2] = useState<number>(99);
  const [weight, setWeight] = useState<number>(60);
  const [height, setHeight] = useState<number>(165);
  const [rbs, setRbs] = useState<number>(100);

  if (!isOpen) return null;

  const calculateBmi = () => {
    if (height > 0) {
      const heightInMeters = height / 100;
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
      bpSystolic: Number(bpSystolic),
      bpDiastolic: Number(bpDiastolic),
      pulse: Number(pulse),
      temperature: Number(temperature),
      spo2: Number(spo2),
      weight: Number(weight),
      height: Number(height),
      bmi: calculatedBmi,
      rbs: Number(rbs),
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
      age: Number(age),
      gender,
      dob,
      mobile: mobile.trim(),
      email: email.trim() || undefined,
      bloodGroup,
      address: address.trim() || 'Not specified',
      occupation: occupation.trim() || undefined,
      emergencyContact: emergencyContact.trim() || mobile.trim(),
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
        className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-3xl my-8 overflow-hidden flex flex-col max-h-[90vh]"
      >
        {/* Modal Header */}
        <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-teal-500/20 text-teal-400">
              <User className="w-5 h-5" />
            </div>
            <div>
              <h2 className="font-bold text-base text-white">One Patient Registration</h2>
              <p className="text-xs text-slate-300">
                Creates the single patient profile that automatically feeds Case Forms, Repertory, Prescription, and Follow-ups
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
          {/* Section 1: Demographics */}
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-3 flex items-center gap-1.5">
              <User className="w-3.5 h-3.5 text-teal-600" />
              Patient Demographics
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
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
                  className="w-full border border-slate-300 rounded-lg px-3 py-2 text-xs text-slate-900 focus:ring-2 focus:ring-teal-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-medium text-slate-700 mb-1">Gender *</label>
                <select
                  value={gender}
                  onChange={(e) => setGender(e.target.value as Gender)}
                  className="w-full border border-slate-300 rounded-lg px-3 py-2 text-xs text-slate-900 focus:ring-2 focus:ring-teal-500 focus:outline-none"
                >
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              <div>
                <label className="block font-medium text-slate-700 mb-1">Age (Years) *</label>
                <input
                  type="number"
                  min="0"
                  max="120"
                  required
                  value={age}
                  onChange={(e) => setAge(Number(e.target.value))}
                  className="w-full border border-slate-300 rounded-lg px-3 py-2 text-xs text-slate-900 focus:ring-2 focus:ring-teal-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-medium text-slate-700 mb-1">Date of Birth</label>
                <input
                  type="date"
                  value={dob}
                  onChange={(e) => setDob(e.target.value)}
                  className="w-full border border-slate-300 rounded-lg px-3 py-2 text-xs text-slate-900 focus:ring-2 focus:ring-teal-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-medium text-slate-700 mb-1">Blood Group</label>
                <select
                  value={bloodGroup}
                  onChange={(e) => setBloodGroup(e.target.value)}
                  className="w-full border border-slate-300 rounded-lg px-3 py-2 text-xs text-slate-900 focus:ring-2 focus:ring-teal-500 focus:outline-none"
                >
                  {['A+', 'A-', 'B+', 'B-', 'O+', 'O-', 'AB+', 'AB-'].map(bg => (
                    <option key={bg} value={bg}>{bg}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-medium text-slate-700 mb-1">Mobile (WhatsApp) *</label>
                <input
                  type="text"
                  required
                  placeholder="+91 98200 12345"
                  value={mobile}
                  onChange={(e) => setMobile(e.target.value)}
                  className="w-full border border-slate-300 rounded-lg px-3 py-2 text-xs text-slate-900 focus:ring-2 focus:ring-teal-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-medium text-slate-700 mb-1">Email Address</label>
                <input
                  type="email"
                  placeholder="patient@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full border border-slate-300 rounded-lg px-3 py-2 text-xs text-slate-900 focus:ring-2 focus:ring-teal-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-medium text-slate-700 mb-1">Occupation</label>
                <input
                  type="text"
                  placeholder="e.g. Teacher, Engineer, Student"
                  value={occupation}
                  onChange={(e) => setOccupation(e.target.value)}
                  className="w-full border border-slate-300 rounded-lg px-3 py-2 text-xs text-slate-900 focus:ring-2 focus:ring-teal-500 focus:outline-none"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block font-medium text-slate-700 mb-1">Residential Address</label>
                <input
                  type="text"
                  placeholder="Street, Area, City, State"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  className="w-full border border-slate-300 rounded-lg px-3 py-2 text-xs text-slate-900 focus:ring-2 focus:ring-teal-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-medium text-slate-700 mb-1">Emergency Contact</label>
                <input
                  type="text"
                  placeholder="+91 98XXX XXXXX (Relation)"
                  value={emergencyContact}
                  onChange={(e) => setEmergencyContact(e.target.value)}
                  className="w-full border border-slate-300 rounded-lg px-3 py-2 text-xs text-slate-900 focus:ring-2 focus:ring-teal-500 focus:outline-none"
                />
              </div>
            </div>
          </div>

          {/* Section 2: Baseline Clinical Vitals */}
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-3 flex items-center gap-1.5">
              <Heart className="w-3.5 h-3.5 text-rose-500" />
              Baseline Clinical Vitals (Auto-attached to all forms)
            </h3>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div>
                <label className="block font-medium text-slate-700 mb-1">BP (Systolic)</label>
                <div className="relative">
                  <input
                    type="number"
                    value={bpSystolic}
                    onChange={(e) => setBpSystolic(Number(e.target.value))}
                    className="w-full border border-slate-300 rounded-lg px-3 py-2 text-xs text-slate-900 focus:ring-2 focus:ring-teal-500 focus:outline-none"
                  />
                  <span className="text-[10px] text-slate-400 absolute right-2 top-2.5">mmHg</span>
                </div>
              </div>

              <div>
                <label className="block font-medium text-slate-700 mb-1">BP (Diastolic)</label>
                <div className="relative">
                  <input
                    type="number"
                    value={bpDiastolic}
                    onChange={(e) => setBpDiastolic(Number(e.target.value))}
                    className="w-full border border-slate-300 rounded-lg px-3 py-2 text-xs text-slate-900 focus:ring-2 focus:ring-teal-500 focus:outline-none"
                  />
                  <span className="text-[10px] text-slate-400 absolute right-2 top-2.5">mmHg</span>
                </div>
              </div>

              <div>
                <label className="block font-medium text-slate-700 mb-1">Pulse Rate</label>
                <div className="relative">
                  <input
                    type="number"
                    value={pulse}
                    onChange={(e) => setPulse(Number(e.target.value))}
                    className="w-full border border-slate-300 rounded-lg px-3 py-2 text-xs text-slate-900 focus:ring-2 focus:ring-teal-500 focus:outline-none"
                  />
                  <span className="text-[10px] text-slate-400 absolute right-2 top-2.5">bpm</span>
                </div>
              </div>

              <div>
                <label className="block font-medium text-slate-700 mb-1">RBS (Blood Sugar)</label>
                <div className="relative">
                  <input
                    type="number"
                    value={rbs}
                    onChange={(e) => setRbs(Number(e.target.value))}
                    className="w-full border border-slate-300 rounded-lg px-3 py-2 text-xs text-slate-900 focus:ring-2 focus:ring-teal-500 focus:outline-none"
                  />
                  <span className="text-[10px] text-slate-400 absolute right-2 top-2.5">mg/dL</span>
                </div>
              </div>

              <div>
                <label className="block font-medium text-slate-700 mb-1">Weight (kg)</label>
                <input
                  type="number"
                  step="0.5"
                  value={weight}
                  onChange={(e) => setWeight(Number(e.target.value))}
                  className="w-full border border-slate-300 rounded-lg px-3 py-2 text-xs text-slate-900 focus:ring-2 focus:ring-teal-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-medium text-slate-700 mb-1">Height (cm)</label>
                <input
                  type="number"
                  value={height}
                  onChange={(e) => setHeight(Number(e.target.value))}
                  className="w-full border border-slate-300 rounded-lg px-3 py-2 text-xs text-slate-900 focus:ring-2 focus:ring-teal-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-medium text-slate-700 mb-1">SpO2 Level</label>
                <div className="relative">
                  <input
                    type="number"
                    value={spo2}
                    onChange={(e) => setSpo2(Number(e.target.value))}
                    className="w-full border border-slate-300 rounded-lg px-3 py-2 text-xs text-slate-900 focus:ring-2 focus:ring-teal-500 focus:outline-none"
                  />
                  <span className="text-[10px] text-slate-400 absolute right-2 top-2.5">%</span>
                </div>
              </div>

              <div>
                <label className="block font-medium text-slate-700 mb-1">Calculated BMI</label>
                <div className="px-3 py-2 bg-slate-100 rounded-lg text-slate-800 font-bold border border-slate-200">
                  {calculateBmi()} kg/m²
                </div>
              </div>
            </div>
          </div>

          {/* Section 3: Allergies & Chronic Conditions */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block font-medium text-slate-700 mb-1">
                Known Drug / Food Allergies (comma separated)
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
                Chronic Health Conditions (comma separated)
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
              <span>Create Patient & Attach Architecture</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
