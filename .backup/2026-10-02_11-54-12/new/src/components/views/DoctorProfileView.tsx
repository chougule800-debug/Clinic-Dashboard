import React, { useState, useEffect } from 'react';
import { useClinic } from '../../context/ClinicContext';
import { OWNER_CONTACT_MESSAGE } from '../../config/doctorsConfig';
import { supabase } from '../../lib/supabase';
import {
  UserCheck,
  Building2,
  Shield,
  Plus,
  Trash2,
  Save,
  CheckCircle2,
  AlertCircle,
  Award,
  Stethoscope,
  Users,
  LogOut,
  Info,
  Cloud,
  Lock,
  Loader2
} from 'lucide-react';

export const DoctorProfileView: React.FC = () => {
  const {
    currentUser,
    doctorUsers,
    updateDoctorProfile,
    deleteDoctorUser,
    logout,
    openSupabaseModal,
    refreshClinicSettings,
    patients,
    systemForms,
    prescriptions,
    appointments,
    invoices,
    conversations
  } = useClinic();

  const [name, setName] = useState('');
  const [qualifications, setQualifications] = useState('');
  const [regNo, setRegNo] = useState('');
  const [speciality, setSpeciality] = useState('');
  const [clinicName, setClinicName] = useState('');
  const [address, setAddress] = useState('');
  const [city, setCity] = useState('');
  const [pinCode, setPinCode] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [consultationFee, setConsultationFee] = useState<number>(0);

  const [savedSuccess, setSavedSuccess] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // New doctor provisioning form (owner only)
  const [newDocName, setNewDocName] = useState('');
  const [newDocEmail, setNewDocEmail] = useState('');
  const [newDocPassword, setNewDocPassword] = useState('');
  const [newDocQual, setNewDocQual] = useState('');
  const [newDocReg, setNewDocReg] = useState('');
  const [newDocPhone, setNewDocPhone] = useState('');
  const [provisioning, setProvisioning] = useState(false);
  const [docGenError, setDocGenError] = useState<string | null>(null);
  const [docGenSuccess, setDocGenSuccess] = useState<string | null>(null);

  useEffect(() => {
    if (!currentUser) return;
    setName(currentUser.name || '');
    setQualifications(currentUser.qualifications || '');
    setRegNo(currentUser.regNo || '');
    setSpeciality(currentUser.speciality || '');
    setClinicName(currentUser.clinicName || '');
    setAddress(currentUser.address || '');
    setCity(currentUser.city || '');
    setPinCode(currentUser.pinCode || '');
    setPhone(currentUser.phone || '');
    setEmail(currentUser.email || '');
    setConsultationFee(currentUser.consultationFee ?? 0);
  }, [currentUser?.id]);

  const isOwner = currentUser?.role === 'owner';

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSaving(true);
    try {
      await updateDoctorProfile({
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
        consultationFee: Number(consultationFee) || 0
      });
      await refreshClinicSettings();
      setSavedSuccess(true);
      setTimeout(() => setSavedSuccess(false), 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save profile.');
    } finally {
      setSaving(false);
    }
  };

  const handleProvisionDoctor = async (e: React.FormEvent) => {
    e.preventDefault();
    setDocGenError(null);
    setDocGenSuccess(null);

    if (!newDocName.trim() || !newDocEmail.trim() || !newDocPassword.trim()) {
      setDocGenError('Name, email, and password are required.');
      return;
    }
    if (newDocPassword.length < 8) {
      setDocGenError('Password must be at least 8 characters.');
      return;
    }

    setProvisioning(true);
    try {
      const res = await fetch('/api/doctors/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: newDocEmail.trim(),
          password: newDocPassword,
          name: newDocName.trim(),
          qualifications: newDocQual.trim(),
          regNo: newDocReg.trim(),
          speciality: 'Classical Homeopathy',
          clinicName: clinicName.trim(),
          address,
          city,
          pinCode,
          phone: newDocPhone.trim() || phone,
          role: 'doctor'
        })
      });

      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body?.error || 'Failed to create doctor account.');
      }

      setDocGenSuccess(
        `Doctor account for "${newDocName}" created. They can sign in with ${newDocEmail}.`
      );
      setNewDocName('');
      setNewDocEmail('');
      setNewDocPassword('');
      setNewDocQual('');
      setNewDocReg('');
      setNewDocPhone('');
    } catch (err) {
      setDocGenError(err instanceof Error ? err.message : 'Failed to create doctor.');
    } finally {
      setProvisioning(false);
    }
  };

  return (
    <div className="space-y-6 pb-12 font-sans text-slate-800">
      {/* Header */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-teal-50 text-teal-800 border border-teal-200 flex items-center gap-1">
              <Stethoscope className="w-3 h-3 text-teal-600" />
              {isOwner ? 'Clinic Owner' : 'Doctor Profile'}
            </span>
            <span className="text-slate-400">•</span>
            <span className="text-xs text-slate-500 font-mono">{currentUser?.email}</span>
          </div>
          <h2 className="text-xl font-bold text-slate-900 font-serif flex items-center gap-2">
            <UserCheck className="w-5 h-5 text-teal-700" />
            Doctor Information &amp; Clinic Profile
          </h2>
          <p className="text-xs text-slate-500 max-w-2xl">
            Manage your credentials and clinic letterhead. Each doctor has a fully isolated
            workspace.
          </p>
        </div>

        <button
          onClick={logout}
          className="px-3.5 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 shadow-xs"
        >
          <LogOut className="w-3.5 h-3.5 text-rose-400" />
          <span>Sign Out</span>
        </button>
      </div>

      {savedSuccess && (
        <div className="p-3.5 bg-emerald-50 border border-emerald-200 rounded-2xl text-emerald-900 text-xs font-semibold flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          Profile updated successfully.
        </div>
      )}

      {error && (
        <div className="p-3.5 bg-rose-50 border border-rose-200 rounded-2xl text-rose-800 text-xs font-semibold flex items-center gap-2">
          <AlertCircle className="w-4 h-4 text-rose-600" />
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Profile form */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-5">
          <div className="border-b border-slate-100 pb-3">
            <h3 className="font-bold text-sm text-slate-900 flex items-center gap-2">
              <Award className="w-4 h-4 text-teal-700" />
              Doctor &amp; Clinic Credentials
            </h3>
          </div>

          <form onSubmit={handleSaveProfile} className="space-y-4 text-xs">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Doctor Full Name</label>
                <input
                  type="text"
                  value={name}
                  onChange={e => setName(e.target.value)}
                  placeholder="Dr. Full Name"
                  className="w-full border border-slate-300 rounded-xl p-2.5 text-xs focus:ring-2 focus:ring-teal-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Qualifications</label>
                <input
                  type="text"
                  value={qualifications}
                  onChange={e => setQualifications(e.target.value)}
                  placeholder="B.H.M.S., PGDCP"
                  className="w-full border border-slate-300 rounded-xl p-2.5 text-xs focus:ring-2 focus:ring-teal-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Registration No.
                </label>
                <input
                  type="text"
                  value={regNo}
                  onChange={e => setRegNo(e.target.value)}
                  placeholder="Reg. No."
                  className="w-full border border-slate-300 rounded-xl p-2.5 text-xs focus:ring-2 focus:ring-teal-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Speciality</label>
                <input
                  type="text"
                  value={speciality}
                  onChange={e => setSpeciality(e.target.value)}
                  placeholder="Classical Homeopathy"
                  className="w-full border border-slate-300 rounded-xl p-2.5 text-xs focus:ring-2 focus:ring-teal-500 focus:outline-none"
                />
              </div>
            </div>

            <div className="pt-2 border-t border-slate-100">
              <h4 className="font-bold text-xs text-slate-800 mb-3 flex items-center gap-1.5">
                <Building2 className="w-3.5 h-3.5 text-teal-600" />
                Clinic Details
              </h4>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="sm:col-span-2">
                  <label className="block font-semibold text-slate-700 mb-1">Clinic Name</label>
                  <input
                    type="text"
                    value={clinicName}
                    onChange={e => setClinicName(e.target.value)}
                    placeholder="Clinic name"
                    className="w-full border border-slate-300 rounded-xl p-2.5 text-xs focus:ring-2 focus:ring-teal-500 focus:outline-none"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block font-semibold text-slate-700 mb-1">Address</label>
                  <input
                    type="text"
                    value={address}
                    onChange={e => setAddress(e.target.value)}
                    placeholder="Full address"
                    className="w-full border border-slate-300 rounded-xl p-2.5 text-xs focus:ring-2 focus:ring-teal-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">City</label>
                  <input
                    type="text"
                    value={city}
                    onChange={e => setCity(e.target.value)}
                    placeholder="City"
                    className="w-full border border-slate-300 rounded-xl p-2.5 text-xs focus:ring-2 focus:ring-teal-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Pin Code</label>
                  <input
                    type="text"
                    inputMode="numeric"
                    value={pinCode}
                    onChange={e => setPinCode(e.target.value.replace(/[^0-9]/g, ''))}
                    placeholder="Pin code"
                    className="w-full border border-slate-300 rounded-xl p-2.5 text-xs focus:ring-2 focus:ring-teal-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Phone / WhatsApp
                  </label>
                  <input
                    type="text"
                    value={phone}
                    onChange={e => setPhone(e.target.value)}
                    placeholder="Phone"
                    className="w-full border border-slate-300 rounded-xl p-2.5 text-xs focus:ring-2 focus:ring-teal-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Email</label>
                  <input
                    type="email"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    placeholder="Email"
                    className="w-full border border-slate-300 rounded-xl p-2.5 text-xs focus:ring-2 focus:ring-teal-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Default Consultation Fee (₹)
                  </label>
                  <input
                    type="text"
                    inputMode="numeric"
                    value={consultationFee}
                    onChange={e =>
                      setConsultationFee(Number(e.target.value.replace(/[^0-9]/g, '')) || 0)
                    }
                    placeholder="600"
                    className="w-full border border-slate-300 rounded-xl p-2.5 text-xs focus:ring-2 focus:ring-teal-500 focus:outline-none"
                  />
                </div>
              </div>
            </div>

            <div className="pt-3 flex items-center justify-end">
              <button
                type="submit"
                disabled={saving}
                className="px-5 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-500 disabled:opacity-60 text-white font-bold text-xs transition-colors shadow-xs flex items-center gap-1.5"
              >
                {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                <span>{saving ? 'Saving...' : 'Save Changes'}</span>
              </button>
            </div>
          </form>
        </div>

        {/* Right column: status info */}
        <div className="space-y-4">
          <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-slate-900 font-bold text-sm">
                <Cloud className="w-4 h-4 text-emerald-600" />
                <span>Cloud Database</span>
              </div>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
                Connected
              </span>
            </div>
            <p className="text-xs text-slate-500 leading-relaxed">
              All records are stored securely with row-level security and real-time sync.
            </p>

            <div className="grid grid-cols-2 gap-2 pt-2">
              {[
                { label: 'Patients', value: patients.length },
                { label: 'Forms', value: systemForms.length },
                { label: 'Rx', value: prescriptions.length },
                { label: 'Appts', value: appointments.length },
                { label: 'Invoices', value: invoices.length },
                { label: 'Chats', value: conversations.length }
              ].map(item => (
                <div
                  key={item.label}
                  className="p-2 bg-slate-50 rounded-lg border border-slate-200 text-center"
                >
                  <div className="text-[10px] text-slate-500 uppercase font-semibold">
                    {item.label}
                  </div>
                  <div className="text-sm font-bold text-slate-900">{item.value}</div>
                </div>
              ))}
            </div>

            <button
              type="button"
              onClick={openSupabaseModal}
              className="w-full py-2.5 px-3 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-300 rounded-xl font-bold text-xs flex items-center justify-center gap-2 transition-colors"
            >
              <Cloud className="w-4 h-4 text-emerald-600" />
              <span>View Cloud Status</span>
            </button>
          </div>

          <div className="bg-slate-900 text-white rounded-2xl p-5 border border-slate-800 shadow-xs space-y-3">
            <div className="flex items-center gap-2 text-teal-400 font-bold text-sm">
              <Shield className="w-4 h-4" />
              <span>Data Isolation</span>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed">
              Every doctor sees only their own patients, case records, prescriptions, and
              billing. Records never mix between accounts.
            </p>
            <div className="p-3 bg-slate-800/80 rounded-xl border border-slate-700 text-[11px] text-slate-300 space-y-1">
              <div>
                <strong>Signed in:</strong> {currentUser?.name}
              </div>
              <div>
                <strong>Role:</strong> {isOwner ? 'Owner / Admin' : 'Doctor'}
              </div>
              {currentUser?.phone && (
                <div>
                  <strong>Phone:</strong> {currentUser.phone}
                </div>
              )}
            </div>
          </div>

          {OWNER_CONTACT_MESSAGE && (
            <div className="bg-amber-50 rounded-2xl p-5 border border-amber-200 text-amber-950 text-xs space-y-2">
              <div className="font-bold flex items-center gap-1.5 text-amber-900">
                <Info className="w-4 h-4 text-amber-700" />
                <span>New Doctor Access</span>
              </div>
              <p className="text-[11px] leading-relaxed">{OWNER_CONTACT_MESSAGE}</p>
            </div>
          )}
        </div>
      </div>

      {/* Owner-only: provision doctors */}
      {isOwner && (
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-6">
          <div className="border-b border-slate-100 pb-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <div className="flex items-center gap-2">
                <Users className="w-5 h-5 text-teal-700" />
                <h3 className="font-bold text-base text-slate-900">
                  Doctor Accounts
                </h3>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                Provision credentials for other doctors. They get their own isolated workspace.
              </p>
            </div>
            <span className="px-3 py-1 rounded-full text-xs font-bold bg-teal-100 text-teal-800 border border-teal-300">
              Owner Admin
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

          <form
            onSubmit={handleProvisionDoctor}
            className="bg-slate-50 p-5 rounded-2xl border border-slate-200 space-y-4 text-xs"
          >
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
                  onChange={e => setNewDocName(e.target.value)}
                  placeholder="Dr. Full Name"
                  className="w-full bg-white border border-slate-300 rounded-xl p-2 text-xs focus:ring-2 focus:ring-teal-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Email</label>
                <input
                  type="email"
                  value={newDocEmail}
                  onChange={e => setNewDocEmail(e.target.value)}
                  placeholder="doctor@clinic.com"
                  className="w-full bg-white border border-slate-300 rounded-xl p-2 text-xs focus:ring-2 focus:ring-teal-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Password (min 8)
                </label>
                <input
                  type="password"
                  value={newDocPassword}
                  onChange={e => setNewDocPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full bg-white border border-slate-300 rounded-xl p-2 text-xs focus:ring-2 focus:ring-teal-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Qualifications</label>
                <input
                  type="text"
                  value={newDocQual}
                  onChange={e => setNewDocQual(e.target.value)}
                  placeholder="B.H.M.S."
                  className="w-full bg-white border border-slate-300 rounded-xl p-2 text-xs focus:ring-2 focus:ring-teal-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Registration No.
                </label>
                <input
                  type="text"
                  value={newDocReg}
                  onChange={e => setNewDocReg(e.target.value)}
                  placeholder="Reg. No."
                  className="w-full bg-white border border-slate-300 rounded-xl p-2 text-xs focus:ring-2 focus:ring-teal-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Phone / WhatsApp
                </label>
                <input
                  type="text"
                  value={newDocPhone}
                  onChange={e => setNewDocPhone(e.target.value)}
                  placeholder="Phone"
                  className="w-full bg-white border border-slate-300 rounded-xl p-2 text-xs focus:ring-2 focus:ring-teal-500 focus:outline-none"
                />
              </div>
            </div>

            <div className="flex justify-end pt-1">
              <button
                type="submit"
                disabled={provisioning}
                className="px-4 py-2 bg-slate-900 hover:bg-slate-800 disabled:opacity-60 text-white rounded-xl font-bold text-xs flex items-center gap-1.5 transition-colors shadow-xs"
              >
                {provisioning ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <Plus className="w-3.5 h-3.5 text-teal-400" />
                )}
                <span>{provisioning ? 'Creating...' : 'Create Doctor Login'}</span>
              </button>
            </div>
          </form>

          <div className="space-y-3">
            <h4 className="font-bold text-xs uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
              <Users className="w-3.5 h-3.5 text-teal-600" />
              Registered Doctors ({doctorUsers.length})
            </h4>

            <div className="border border-slate-200 rounded-2xl overflow-hidden">
              <table className="w-full text-left text-xs border-collapse">
                <thead className="bg-slate-100 text-slate-700 text-[11px] uppercase tracking-wide">
                  <tr>
                    <th className="p-3">Doctor</th>
                    <th className="p-3">Email</th>
                    <th className="p-3">Qualifications</th>
                    <th className="p-3">Phone</th>
                    <th className="p-3">Role</th>
                    <th className="p-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {doctorUsers.map(doc => (
                    <tr key={doc.id} className="hover:bg-slate-50">
                      <td className="p-3 font-bold text-slate-900">{doc.name}</td>
                      <td className="p-3 font-mono text-slate-600">{doc.email}</td>
                      <td className="p-3 text-slate-600">
                        {doc.qualifications}
                        {doc.regNo && ` • ${doc.regNo}`}
                      </td>
                      <td className="p-3 text-slate-600">{doc.phone || '-'}</td>
                      <td className="p-3">
                        <span
                          className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                            doc.role === 'owner'
                              ? 'bg-indigo-100 text-indigo-800'
                              : 'bg-teal-100 text-teal-800'
                          }`}
                        >
                          {doc.role}
                        </span>
                      </td>
                      <td className="p-3 text-right">
                        {doc.role !== 'owner' && doc.id !== currentUser?.id && (
                          <button
                            onClick={() => {
                              if (
                                window.confirm(
                                  `Delete doctor account for ${doc.name}? This will cascade and remove their data.`
                                )
                              ) {
                                void deleteDoctorUser(doc.id);
                              }
                            }}
                            className="px-2 py-1 bg-rose-50 hover:bg-rose-100 text-rose-700 rounded-lg text-[11px] font-semibold"
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

            <p className="text-[11px] text-slate-500 flex items-start gap-1.5">
              <Lock className="w-3 h-3 mt-0.5 text-slate-400" />
              Only the clinic owner can create or delete doctor accounts.
            </p>
          </div>
        </div>
      )}
    </div>
  );
};