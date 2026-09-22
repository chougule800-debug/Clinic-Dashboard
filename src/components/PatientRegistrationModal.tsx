import React, { useState } from 'react';
import { useClinic } from '../context/ClinicContext';
import { Gender, PatientVitals } from '../types';
import {
  X,
  User,
  Heart,
  Weight,
  Ruler,
  Activity,
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
                  className="w-full border border-slate-300 rounded-lg px-3 py-2 text-xs text-slate-900 focus:ring-2 focus:ring-teal-500 focus:outline-none"
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
                  className="w-full border border-slate-300 rounded-lg px-3 py-2 text-xs text-slate-900 focus:ring-2 focus:ring-teal-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-medium text-slate-700 mb-1">Gender *</label>
                <select
                  id="select-patient-gender"
                  value={gender}
                  onChange={(e) => setGender(e.target.value as Gender)}
                  className="w-full border border-slate-300 rounded-lg px-3 py-2 text-xs text-slate-900 focus:ring-2 focus:ring-teal-500 focus:outline-none"
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
                  className="w-full border border-slate-300 rounded-lg px-3 py-2 text-xs text-slate-900 focus:ring-2 focus:ring-teal-500 focus:outline-none"
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
                  className="w-full border border-slate-300 rounded-lg px-3 py-2 text-xs text-slate-900 focus:ring-2 focus:ring-teal-500 focus:outline-none"
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
                      className="w-full border border-slate-300 rounded-lg px-2.5 py-2 text-xs text-slate-900 focus:ring-2 focus:ring-teal-500 focus:outline-none"
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
                      className="w-full border border-slate-300 rounded-lg px-2.5 py-2 text-xs text-slate-900 focus:ring-2 focus:ring-teal-500 focus:outline-none"
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
                    className="w-full border border-slate-300 rounded-lg px-3 py-2 text-xs text-slate-900 focus:ring-2 focus:ring-teal-500 focus:outline-none"
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
                    className="w-full border border-slate-300 rounded-lg px-3 py-2 text-xs text-slate-900 focus:ring-2 focus:ring-teal-500 focus:outline-none"
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
                    className="w-full border border-slate-300 rounded-lg px-3 py-2 text-xs text-slate-900 focus:ring-2 focus:ring-teal-500 focus:outline-none"
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
