import React, { useState } from 'react';
import { useClinic } from '../../context/ClinicContext';
import { OWNER_CONTACT_MESSAGE, OWNER_PHONE_RAW } from '../../config/doctorsConfig';
import { DoctorUser } from '../../types';
import {
  UserCheck,
  Building2,
  Shield,
  Key,
  Plus,
  Trash2,
  Lock,
  Save,
  CheckCircle2,
  AlertCircle,
  Phone,
  Mail,
  Award,
  Stethoscope,
  Users,
  LogOut,
  Sparkles,
  Info,
  Cloud
} from 'lucide-react';

export const DoctorProfileView: React.FC = () => {
  const {
    currentUser,
    doctorUsers,
    updateDoctorProfile,
    createDoctorUser,
    deleteDoctorUser,
    resetDoctorPassword,
    logout,
    openFirebaseModal,
    firestoreStatus
  } = useClinic();

  // Profile Form state
  const [name, setName] = useState(currentUser?.name || '');
  const [qualifications, setQualifications] = useState(currentUser?.qualifications || '');
  const [regNo, setRegNo] = useState(currentUser?.regNo || '');
  const [speciality, setSpeciality] = useState(currentUser?.speciality || '');
  const [clinicName, setClinicName] = useState(currentUser?.clinicName || '');
  const [address, setAddress] = useState(currentUser?.address || '');
  const [city, setCity] = useState(currentUser?.city || '');
  const [pinCode, setPinCode] = useState(currentUser?.pinCode || '');
  const [phone, setPhone] = useState(currentUser?.phone || '');
  const [email, setEmail] = useState(currentUser?.email || '');
  const [consultationFee, setConsultationFee] = useState<number>(currentUser?.consultationFee || 600);

  const [savedSuccess, setSavedSuccess] = useState(false);

  // New Doctor Generation State (Owner only)
  const [newDocName, setNewDocName] = useState('');
  const [newDocEmail, setNewDocEmail] = useState('');
  const [newDocPassword, setNewDocPassword] = useState('');
  const [newDocQual, setNewDocQual] = useState('');
  const [newDocReg, setNewDocReg] = useState('');
  const [newDocPhone, setNewDocPhone] = useState('');
  const [newDocClinic, setNewDocClinic] = useState('');
  const [docGenError, setDocGenError] = useState<string | null>(null);
  const [docGenSuccess, setDocGenSuccess] = useState<string | null>(null);

  // Password reset modal / prompt
  const [activeResetDocId, setActiveResetDocId] = useState<string | null>(null);
  const [resetNewPass, setResetNewPass] = useState('');

  const isOwner = currentUser?.role === 'owner' || currentUser?.email === 'chougule800@gmail.com';

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    updateDoctorProfile({
      name,
      qualifications,
      regNo,
      speciality,
      clinicName,
      address,
      city,
      pinCode,
      phone,
      email,
      consultationFee: Number(consultationFee) || 600
    });
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3000);
  };

  const handleGenerateDoctor = (e: React.FormEvent) => {
    e.preventDefault();
    setDocGenError(null);
    setDocGenSuccess(null);

    if (!newDocEmail || !newDocPassword || !newDocName) {
      setDocGenError('Please provide Doctor Name, Login ID/Email, and Password.');
      return;
    }

    const res = createDoctorUser({
      name: newDocName.trim(),
      email: newDocEmail.trim(),
      password: newDocPassword.trim(),
      qualifications: newDocQual.trim() || 'B.H.M.S.',
      regNo: newDocReg.trim() || 'Reg. Pending',
      speciality: 'Classical Homeopathy',
      clinicName: newDocClinic.trim() || "Dr. Bharat's Arogya Homeopathy Associate",
      address: address || 'Belgaum',
      city: city || 'Belgaum',
      pinCode: pinCode || '591108',
      phone: newDocPhone.trim() || phone,
      role: 'doctor',
      consultationFee: 500
    });

    if (res.success) {
      setDocGenSuccess(`Doctor account for "${newDocName}" (${newDocEmail}) successfully generated.`);
      setNewDocName('');
      setNewDocEmail('');
      setNewDocPassword('');
      setNewDocQual('');
      setNewDocReg('');
      setNewDocPhone('');
      setNewDocClinic('');
    } else {
      setDocGenError(res.error || 'Could not generate doctor account.');
    }
  };

  const handleExecutePasswordReset = (docId: string) => {
    if (!resetNewPass.trim()) return;
    resetDoctorPassword(docId, resetNewPass.trim());
    setActiveResetDocId(null);
    setResetNewPass('');
    alert('Password updated successfully for doctor account.');
  };

  return (
    <div className="space-y-6 pb-12 font-sans text-slate-800">
      {/* Top Banner */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-teal-50 text-teal-800 border border-teal-200 flex items-center gap-1">
              <Stethoscope className="w-3 h-3 text-teal-600" />
              {isOwner ? 'Clinic Owner & Multi-Doctor Admin' : 'Doctor Profile'}
            </span>
            <span className="text-slate-400">•</span>
            <span className="text-xs text-slate-500 font-mono">
              Login ID: {currentUser?.email}
            </span>
          </div>
          <h2 className="text-xl font-bold text-slate-900 font-serif flex items-center gap-2">
            <UserCheck className="w-5 h-5 text-teal-700" />
            Doctor Information & Clinic Profile / डॉक्टरांची माहिती
          </h2>
          <p className="text-xs text-slate-500 max-w-2xl">
            Manage your doctor credentials, clinic letterhead, consultation fees, and login access. Each doctor has their own isolated workspace where patient records and prescriptions are strictly private.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={logout}
            className="px-3.5 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors shadow-xs"
          >
            <LogOut className="w-3.5 h-3.5 text-rose-400" />
            <span>Sign Out / लॉग आउट</span>
          </button>
        </div>
      </div>

      {savedSuccess && (
        <div className="p-3.5 bg-emerald-50 border border-emerald-200 rounded-2xl text-emerald-900 text-xs font-semibold flex items-center gap-2 shadow-xs">
          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          <span>Doctor credentials & clinic profile updated successfully! Changes reflect on all prescriptions, invoices, and letterheads.</span>
        </div>
      )}

      {/* Grid: Doctor Info Form */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Doctor Profile Settings Form */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-5">
          <div className="border-b border-slate-100 pb-3 flex items-center justify-between">
            <h3 className="font-bold text-sm text-slate-900 flex items-center gap-2">
              <Award className="w-4 h-4 text-teal-700" />
              Doctor Credentials & Letterhead Information
            </h3>
            <span className="text-[11px] text-slate-400">All fields are optional</span>
          </div>

          <form onSubmit={handleSaveProfile} className="space-y-4 text-xs">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Doctor Full Name / नाव</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Dr. Bharat Chougule"
                  className="w-full border border-slate-300 rounded-xl p-2.5 text-xs text-slate-900 focus:ring-2 focus:ring-teal-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Qualifications / पदवी</label>
                <input
                  type="text"
                  value={qualifications}
                  onChange={(e) => setQualifications(e.target.value)}
                  placeholder="e.g. B.H.M.S., PGDCP, CCH"
                  className="w-full border border-slate-300 rounded-xl p-2.5 text-xs text-slate-900 focus:ring-2 focus:ring-teal-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Medical Registration No. / नोंदणी क्र.</label>
                <input
                  type="text"
                  value={regNo}
                  onChange={(e) => setRegNo(e.target.value)}
                  placeholder="e.g. A-11124"
                  className="w-full border border-slate-300 rounded-xl p-2.5 text-xs text-slate-900 focus:ring-2 focus:ring-teal-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Speciality / तज्ज्ञता</label>
                <input
                  type="text"
                  value={speciality}
                  onChange={(e) => setSpeciality(e.target.value)}
                  placeholder="e.g. Classical Homeopathy & Chronic Care"
                  className="w-full border border-slate-300 rounded-xl p-2.5 text-xs text-slate-900 focus:ring-2 focus:ring-teal-500 focus:outline-none"
                />
              </div>
            </div>

            <div className="pt-2 border-t border-slate-100">
              <h4 className="font-bold text-xs text-slate-800 mb-3 flex items-center gap-1.5">
                <Building2 className="w-3.5 h-3.5 text-teal-600" />
                Clinic Details & Patient Contact Information
              </h4>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="sm:col-span-2">
                  <label className="block font-semibold text-slate-700 mb-1">Clinic / Hospital Name</label>
                  <input
                    type="text"
                    value={clinicName}
                    onChange={(e) => setClinicName(e.target.value)}
                    placeholder="e.g. Dr. Bharat's Arogya Homeopathy"
                    className="w-full border border-slate-300 rounded-xl p-2.5 text-xs text-slate-900 focus:ring-2 focus:ring-teal-500 focus:outline-none"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block font-semibold text-slate-700 mb-1">Clinic Address</label>
                  <input
                    type="text"
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    placeholder="e.g. 1st Floor Mahalaxmi plaza, Vengurla Road, Opp Central Jail Hindalga"
                    className="w-full border border-slate-300 rounded-xl p-2.5 text-xs text-slate-900 focus:ring-2 focus:ring-teal-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">City</label>
                  <input
                    type="text"
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    placeholder="e.g. Belgaum"
                    className="w-full border border-slate-300 rounded-xl p-2.5 text-xs text-slate-900 focus:ring-2 focus:ring-teal-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Pin Code</label>
                  <input
                    type="text"
                    inputMode="numeric"
                    value={pinCode}
                    onChange={(e) => setPinCode(e.target.value.replace(/[^0-9]/g, ''))}
                    placeholder="e.g. 591108"
                    className="w-full border border-slate-300 rounded-xl p-2.5 text-xs text-slate-900 focus:ring-2 focus:ring-teal-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Phone / WhatsApp for Patients</label>
                  <input
                    type="text"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+91 9902686173"
                    className="w-full border border-slate-300 rounded-xl p-2.5 text-xs text-slate-900 focus:ring-2 focus:ring-teal-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Email Address</label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="chougule800@gmail.com"
                    className="w-full border border-slate-300 rounded-xl p-2.5 text-xs text-slate-900 focus:ring-2 focus:ring-teal-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Default OPD Consultation Fee (₹)</label>
                  <input
                    type="text"
                    inputMode="numeric"
                    value={consultationFee}
                    onChange={(e) => setConsultationFee(Number(e.target.value.replace(/[^0-9]/g, '')) || 0)}
                    placeholder="600"
                    className="w-full border border-slate-300 rounded-xl p-2.5 text-xs text-slate-900 focus:ring-2 focus:ring-teal-500 focus:outline-none"
                  />
                </div>
              </div>
            </div>

            <div className="pt-3 flex items-center justify-end gap-3">
              <button
                type="submit"
                className="px-5 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-500 text-white font-bold text-xs transition-colors shadow-xs flex items-center gap-1.5"
              >
                <Save className="w-4 h-4" />
                <span>Save Profile Changes / जतन करा</span>
              </button>
            </div>
          </form>
        </div>

        {/* Right Col: Multi-Doctor Security & Isolation Overview */}
        <div className="space-y-4">
          {/* Firebase Cloud Connection & Diagnostics */}
          <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-slate-900 font-bold text-sm">
                <Cloud className="w-4 h-4 text-emerald-600" />
                <span>Firebase Cloud Database</span>
              </div>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
                Connected
              </span>
            </div>
            <p className="text-xs text-slate-500 leading-relaxed">
              Google Firebase Firestore project: <code className="font-mono text-emerald-700 font-semibold">{firestoreStatus.projectId}</code>. Remote WhatsApp case taking forms and clinical records sync to cloud with offline-first persistence.
            </p>
            <button
              type="button"
              onClick={openFirebaseModal}
              className="w-full py-2.5 px-3 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-300 rounded-xl font-bold text-xs flex items-center justify-center gap-2 transition-colors cursor-pointer"
            >
              <Cloud className="w-4 h-4 text-emerald-600" />
              <span>Check Firebase Connection & Sync</span>
            </button>
          </div>

          <div className="bg-slate-900 text-white rounded-2xl p-5 border border-slate-800 shadow-xs space-y-3">
            <div className="flex items-center gap-2 text-teal-400 font-bold text-sm">
              <Shield className="w-4 h-4" />
              <span>Multi-Doctor Isolation</span>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed">
              This clinical portal is architected so different doctors can log in independently. <strong>One doctor's patient records, cases, prescriptions, and financial billing never mix with another doctor's.</strong>
            </p>
            <div className="p-3 bg-slate-800/80 rounded-xl border border-slate-700 text-[11px] text-slate-300 space-y-1">
              <div>• <strong>Current Logged In User:</strong> {currentUser?.name}</div>
              <div>• <strong>Account Type:</strong> {isOwner ? 'Clinic Owner (Super Admin)' : 'Registered Doctor'}</div>
              <div>• <strong>Contact:</strong> {currentUser?.phone}</div>
            </div>
          </div>

          <div className="bg-amber-50 rounded-2xl p-5 border border-amber-200 text-amber-950 text-xs space-y-2">
            <div className="font-bold flex items-center gap-1.5 text-amber-900">
              <Info className="w-4 h-4 text-amber-700" />
              <span>Public Login Notice</span>
            </div>
            <p className="text-[11px] leading-relaxed">
              When any unauthorized user or assistant tries to log in, the screen prominently displays:
            </p>
            <div className="p-2.5 bg-white rounded-xl border border-amber-300 font-bold text-slate-900 text-xs text-center shadow-inner">
              "{OWNER_CONTACT_MESSAGE}"
            </div>
          </div>
        </div>
      </div>

      {/* Section 2: Owner-Only Doctor Account Generation */}
      {isOwner && (
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-6">
          <div className="border-b border-slate-100 pb-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <div className="flex items-center gap-2">
                <Users className="w-5 h-5 text-teal-700" />
                <h3 className="font-bold text-base text-slate-900">
                  Generate Login ID & Password for New Doctors
                </h3>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                As owner, you can provision and manage credentials for doctors using this clinic software.
              </p>
            </div>
            <span className="px-3 py-1 rounded-full text-xs font-bold bg-teal-100 text-teal-800 border border-teal-300">
              Owner Administration
            </span>
          </div>

          {docGenError && (
            <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-rose-800 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-rose-600" />
              <span>{docGenError}</span>
            </div>
          )}

          {docGenSuccess && (
            <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-800 text-xs flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>{docGenSuccess}</span>
            </div>
          )}

          {/* New Doctor Creation Form */}
          <form onSubmit={handleGenerateDoctor} className="bg-slate-50 p-5 rounded-2xl border border-slate-200 space-y-4 text-xs">
            <h4 className="font-bold text-xs uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
              <Plus className="w-3.5 h-3.5 text-teal-600" />
              Create New Doctor Account
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Doctor Name</label>
                <input
                  type="text"
                  value={newDocName}
                  onChange={(e) => setNewDocName(e.target.value)}
                  placeholder="e.g. Dr. Ramesh Patil"
                  className="w-full bg-white border border-slate-300 rounded-xl p-2 text-xs focus:ring-2 focus:ring-teal-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Login ID / Email</label>
                <input
                  type="email"
                  value={newDocEmail}
                  onChange={(e) => setNewDocEmail(e.target.value)}
                  placeholder="e.g. drpatil@gmail.com"
                  className="w-full bg-white border border-slate-300 rounded-xl p-2 text-xs focus:ring-2 focus:ring-teal-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Password (Masked)</label>
                <input
                  type="password"
                  value={newDocPassword}
                  onChange={(e) => setNewDocPassword(e.target.value)}
                  placeholder="••••••"
                  className="w-full bg-white border border-slate-300 rounded-xl p-2 text-xs focus:ring-2 focus:ring-teal-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Qualifications</label>
                <input
                  type="text"
                  value={newDocQual}
                  onChange={(e) => setNewDocQual(e.target.value)}
                  placeholder="e.g. B.H.M.S., MD (Hom)"
                  className="w-full bg-white border border-slate-300 rounded-xl p-2 text-xs focus:ring-2 focus:ring-teal-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Registration No.</label>
                <input
                  type="text"
                  value={newDocReg}
                  onChange={(e) => setNewDocReg(e.target.value)}
                  placeholder="e.g. A-45210"
                  className="w-full bg-white border border-slate-300 rounded-xl p-2 text-xs focus:ring-2 focus:ring-teal-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Mobile / WhatsApp</label>
                <input
                  type="text"
                  value={newDocPhone}
                  onChange={(e) => setNewDocPhone(e.target.value)}
                  placeholder="+91 98800 12345"
                  className="w-full bg-white border border-slate-300 rounded-xl p-2 text-xs focus:ring-2 focus:ring-teal-500 focus:outline-none"
                />
              </div>
            </div>

            <div className="flex justify-end pt-1">
              <button
                type="submit"
                className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl font-bold text-xs flex items-center gap-1.5 transition-colors shadow-xs"
              >
                <Plus className="w-3.5 h-3.5 text-teal-400" />
                <span>Create Doctor Login</span>
              </button>
            </div>
          </form>

          {/* Active Doctor Accounts Table */}
          <div className="space-y-3">
            <h4 className="font-bold text-xs uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
              <Users className="w-3.5 h-3.5 text-teal-600" />
              Active Registered Doctor Accounts ({doctorUsers.length})
            </h4>

            <div className="border border-slate-200 rounded-2xl overflow-hidden">
              <table className="w-full text-left text-xs border-collapse">
                <thead className="bg-slate-100 text-slate-700 text-[11px] uppercase tracking-wide">
                  <tr>
                    <th className="p-3">Doctor Name</th>
                    <th className="p-3">Login ID / Email</th>
                    <th className="p-3">Qualifications & Reg</th>
                    <th className="p-3">Phone</th>
                    <th className="p-3">Role</th>
                    <th className="p-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {doctorUsers.map((doc) => (
                    <tr key={doc.id} className="hover:bg-slate-50">
                      <td className="p-3 font-bold text-slate-900">
                        {doc.name}
                        {doc.id === 'doc_bharat' && (
                          <span className="ml-1.5 text-[9px] px-1.5 py-0.5 rounded bg-amber-100 text-amber-800 font-bold">
                            Owner
                          </span>
                        )}
                      </td>
                      <td className="p-3 font-mono text-slate-600">{doc.email}</td>
                      <td className="p-3 text-slate-600">{doc.qualifications} • {doc.regNo}</td>
                      <td className="p-3 text-slate-600">{doc.phone}</td>
                      <td className="p-3">
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          doc.role === 'owner' ? 'bg-indigo-100 text-indigo-800' : 'bg-teal-100 text-teal-800'
                        }`}>
                          {doc.role}
                        </span>
                      </td>
                      <td className="p-3 text-right space-x-1">
                        <button
                          onClick={() => {
                            setActiveResetDocId(doc.id);
                            setResetNewPass('');
                          }}
                          className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-[11px] font-semibold"
                          title="Set / Reset password"
                        >
                          Reset Pass
                        </button>
                        {doc.role !== 'owner' && (
                          <button
                            onClick={() => {
                              if (window.confirm(`Delete doctor account for ${doc.name}?`)) {
                                deleteDoctorUser(doc.id);
                              }
                            }}
                            className="px-2 py-1 bg-rose-50 hover:bg-rose-100 text-rose-700 rounded-lg text-[11px] font-semibold"
                            title="Delete doctor"
                          >
                            <Trash2 className="w-3 h-3 inline" />
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Reset password inline dialog */}
            {activeResetDocId && (
              <div className="p-4 bg-teal-50 border border-teal-200 rounded-2xl text-xs space-y-2">
                <div className="font-bold text-teal-950 flex items-center justify-between">
                  <span>Reset Password for {doctorUsers.find(d => d.id === activeResetDocId)?.name}:</span>
                  <button
                    onClick={() => setActiveResetDocId(null)}
                    className="text-slate-400 hover:text-slate-600"
                  >
                    ✕ Cancel
                  </button>
                </div>
                <div className="flex items-center gap-2">
                  <input
                    type="password"
                    value={resetNewPass}
                    onChange={(e) => setResetNewPass(e.target.value)}
                    placeholder="Enter new password (masked)"
                    className="bg-white border border-teal-300 rounded-xl px-3 py-1.5 text-xs flex-1"
                  />
                  <button
                    onClick={() => handleExecutePasswordReset(activeResetDocId)}
                    className="px-3 py-1.5 bg-teal-700 hover:bg-teal-800 text-white rounded-xl text-xs font-semibold"
                  >
                    Confirm New Password
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
