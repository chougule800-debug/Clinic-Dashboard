import React, { useEffect, useState } from 'react';
import { CLINIC_CONFIG } from '../../config/clinicConfig';
import { supabase } from '../../lib/supabase';
import { shareTokenService } from '../../lib/services/shareTokens';
import { systemFormService } from '../../lib/services/systemForms';
import { prescriptionService, type PrescriptionWithMedicines } from '../../lib/services/prescriptions';
import { invoiceService, type InvoiceWithItems } from '../../lib/services/invoices';
import { clinicalSystemService, type ClinicalSystemRow } from '../../lib/services/clinicalSystems';
import { patientService, type PatientRow } from '../../lib/services/patients';
import { CustomFormFillView } from '../custom-forms/CustomFormFillView';
import {
  CheckCircle2,
  Printer,
  Send,
  MessageCircle,
  FileText,
  Receipt,
  ShieldCheck,
  Stethoscope,
  AlertCircle,
  Upload,
  X,
  Loader2,
  QrCode
} from 'lucide-react';

interface PublicShareViewProps {
  token: string;
  view: 'intake' | 'prescription' | 'billing' | 'custom_form';
  onExit: () => void;
}

interface ResolvedSession {
  id: string;
  doctor_id: string;
  patient_id: string | null;
  system_key: string | null;
  form_id: string | null;
  form_version_id: string | null;
  share_type: 'intake' | 'prescription' | 'billing' | 'custom_form';
  related_id: string | null;
}

export const PublicShareView: React.FC<PublicShareViewProps> = ({ token, view, onExit }) => {
  const [session, setSession] = useState<ResolvedSession | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [patient, setPatient] = useState<PatientRow | null>(null);
  const [systemMeta, setSystemMeta] = useState<ClinicalSystemRow | null>(null);

  // Intake form state
  const [chiefComplaints, setChiefComplaints] = useState('');
  const [duration, setDuration] = useState('');
  const [severity, setSeverity] = useState<'Mild' | 'Moderate' | 'Severe'>('Moderate');
  const [modalitiesAggravation, setModalitiesAggravation] = useState('');
  const [modalitiesAmelioration, setModalitiesAmelioration] = useState('');
  const [concomitants, setConcomitants] = useState('');
  const [formData, setFormData] = useState<Record<string, unknown>>({});
  const [uploadedPhotos, setUploadedPhotos] = useState<string[]>([]);
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Rx / billing state
  const [rx, setRx] = useState<PrescriptionWithMedicines | null>(null);
  const [invoice, setInvoice] = useState<InvoiceWithItems | null>(null);

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      setLoading(true);
      try {
        const resolved = await shareTokenService.resolveSession(token);
        if (cancelled) return;
        if (!resolved) {
          setError('This link is invalid or has expired. Please request a new link from your doctor.');
          setLoading(false);
          return;
        }
        setSession(resolved);

        if (resolved.patient_id) {
          const p = await patientService.get(resolved.patient_id);
          if (!cancelled) setPatient(p);
        }

        if (resolved.system_key) {
          const meta = await clinicalSystemService.getByKey(resolved.system_key);
          if (!cancelled) setSystemMeta(meta);
        }

        if (resolved.share_type === 'prescription' && resolved.related_id) {
          const data = await prescriptionService.getByShareTokenId(resolved.id);
          if (!cancelled) setRx(data);
        }

        if (resolved.share_type === 'billing' && resolved.related_id) {
          const data = await invoiceService.getByShareTokenId(resolved.id);
          if (!cancelled) setInvoice(data);
        }
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : 'Failed to load. Please try again.');
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    void load();
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  const toggleChip = (fieldName: string, option: string) => {
    setFormData(prev => {
      const existing = (prev[fieldName] as string[] | undefined) ?? [];
      const next = existing.includes(option)
        ? existing.filter(i => i !== option)
        : [...existing, option];
      return { ...prev, [fieldName]: next };
    });
  };

  const handleFilesSelected = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;
    const newFiles: string[] = [];
    for (const file of Array.from(files)) {
      if (file.type.startsWith('image/')) {
        const dataUrl = await new Promise<string>((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = () => resolve(reader.result as string);
          reader.onerror = reject;
          reader.readAsDataURL(file);
        });
        newFiles.push(dataUrl);
      }
    }
    setUploadedPhotos(prev => [...prev, ...newFiles]);
  };

  const handleIntakeSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!session || !patient) return;
    setSubmitting(true);
    try {
      await systemFormService.submitRemote(session.id, {
        patientId: patient.id,
        systemKey: session.system_key ?? 'headache',
        data: { ...formData, uploadedPhotoCount: uploadedPhotos.length },
        chiefComplaints: chiefComplaints || `Self-reported ${session.system_key ?? 'clinical'} symptoms`,
        duration: duration || 'Not specified',
        severity,
        modalitiesAggravation,
        modalitiesAmelioration,
        concomitants,
        clinicalNotes: `Submitted by patient remotely on ${new Date().toLocaleString()}.`
      });
      await shareTokenService.markUsed(session.id);
      setSubmitted(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Submission failed. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const clinicWaHelpUrl = `https://wa.me/?text=${encodeURIComponent(
    `Hello ${CLINIC_CONFIG.doctorName}, I am ${patient?.name ?? 'a patient'} contacting about my consultation.`
  )}`;

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-100">
        <div className="flex items-center gap-3 text-slate-600 text-sm">
          <Loader2 className="w-5 h-5 animate-spin text-teal-600" />
          Loading secure session...
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-slate-100 p-4">
        <div className="bg-white rounded-2xl p-8 max-w-md w-full shadow-md border border-slate-200 text-center space-y-3">
          <AlertCircle className="w-12 h-12 text-rose-500 mx-auto" />
          <h2 className="font-bold text-slate-900 text-lg">Unable to Open Link</h2>
          <p className="text-sm text-slate-600">{error}</p>
          <button
            onClick={onExit}
            className="mt-2 px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold transition-colors"
          >
            Return Home
          </button>
        </div>
      </div>
    );
  }

  // Custom form view
  if (session && session.share_type === 'custom_form' && session.form_id && session.form_version_id) {
    return (
      <CustomFormFillView
        session={session}
        token={token}
        onExit={onExit}
      />
    );
  }

  const renderIntake = () => (
    <div className="bg-white rounded-3xl shadow-xl border border-slate-200 overflow-hidden">
      <div className="bg-gradient-to-r from-emerald-800 to-teal-800 text-white p-6 sm:p-8">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-950/60 border border-emerald-600/50 text-[11px] text-emerald-200 font-semibold mb-3">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
          <span>Confidential Case Intake Form</span>
        </div>
        <h1 className="text-xl sm:text-2xl font-bold font-serif">
          {systemMeta?.label ?? 'Clinical Case Taking Form'}
        </h1>
        <p className="text-xs sm:text-sm text-emerald-100 mt-1 max-w-xl">
          Please fill in your symptoms as accurately as possible. This information reaches{' '}
          <strong>{CLINIC_CONFIG.doctorName}</strong>.
        </p>

        {patient && (
          <div className="mt-4 p-3 bg-white/10 backdrop-blur-xs rounded-xl border border-white/20 flex flex-wrap items-center justify-between gap-2 text-xs">
            <div>
              <span className="text-emerald-200">Patient: </span>
              <span className="font-bold text-white text-sm">{patient.name}</span>
            </div>
            <div className="flex items-center gap-4 text-emerald-100">
              {patient.age !== null && <span>Age: <strong>{patient.age}</strong></span>}
              {patient.gender && <span>Gender: <strong>{patient.gender}</strong></span>}
            </div>
          </div>
        )}
      </div>

      <div className="p-6 sm:p-8">
        {submitted ? (
          <div className="py-10 text-center space-y-5">
            <div className="w-20 h-20 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-12 h-12" />
            </div>
            <h3 className="text-xl font-bold text-slate-800">Form Submitted Successfully</h3>
            <p className="text-sm text-slate-600 max-w-md mx-auto">
              Thank you, <strong>{patient?.name}</strong>. Your symptoms have been securely transmitted to the clinic.
            </p>
            <a
              href={clinicWaHelpUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs transition-colors"
            >
              <MessageCircle className="w-4 h-4" />
              <span>WhatsApp Clinic</span>
            </a>
          </div>
        ) : (
          <form onSubmit={handleIntakeSubmit} className="space-y-6">
            <div className="p-3.5 bg-amber-50 rounded-2xl border border-amber-200 text-amber-900 text-xs flex items-start gap-2.5">
              <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
              <span>
                Describe your sensations, what triggers your trouble, and what gives you relief in your own words.
              </span>
            </div>

            <div>
              <label className="block font-bold text-slate-800 text-sm mb-1.5">
                Main Complaints &amp; Symptoms
              </label>
              <textarea
                required
                rows={3}
                value={chiefComplaints}
                onChange={e => setChiefComplaints(e.target.value)}
                placeholder="Describe your symptoms, where it hurts, how it feels, when it started..."
                className="w-full border border-slate-300 rounded-xl p-3 text-xs sm:text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-none"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block font-semibold text-slate-700 text-xs mb-1">Duration</label>
                <input
                  type="text"
                  value={duration}
                  onChange={e => setDuration(e.target.value)}
                  placeholder="e.g. 5 days, 3 weeks"
                  className="w-full border border-slate-300 rounded-xl p-2.5 text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                />
              </div>
              <div>
                <label className="block font-semibold text-slate-700 text-xs mb-1">Severity</label>
                <select
                  value={severity}
                  onChange={e => setSeverity(e.target.value as typeof severity)}
                  className="w-full border border-slate-300 rounded-xl p-2.5 text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                >
                  <option value="Mild">Mild</option>
                  <option value="Moderate">Moderate</option>
                  <option value="Severe">Severe</option>
                </select>
              </div>
            </div>

            {systemMeta && Array.isArray(systemMeta.fields) && (
              <div className="space-y-4 pt-2 border-t border-slate-200">
                {(systemMeta.fields as Array<{
                  name: string;
                  label: string;
                  type: string;
                  options?: string[];
                  placeholder?: string;
                }>).map(field => {
                  if (field.type === 'chips' && field.options) {
                    const selected = (formData[field.name] as string[] | undefined) ?? [];
                    return (
                      <div key={field.name} className="space-y-1.5">
                        <label className="block font-semibold text-slate-700 text-xs">
                          {field.label}
                        </label>
                        <div className="flex flex-wrap gap-1.5">
                          {field.options.map(opt => {
                            const isSelected = selected.includes(opt);
                            return (
                              <button
                                type="button"
                                key={opt}
                                onClick={() => toggleChip(field.name, opt)}
                                className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-all ${
                                  isSelected
                                    ? 'bg-emerald-600 text-white shadow-xs'
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
                        value={(formData[field.name] as string | undefined) ?? ''}
                        onChange={e =>
                          setFormData({ ...formData, [field.name]: e.target.value })
                        }
                        className="w-full border border-slate-300 rounded-xl p-2.5 text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                      />
                    </div>
                  );
                })}
              </div>
            )}

            <div className="space-y-4 pt-2 border-t border-slate-200">
              <div>
                <label className="block font-semibold text-slate-700 text-xs mb-1">
                  What makes your symptoms worse? (Aggravation)
                </label>
                <input
                  type="text"
                  value={modalitiesAggravation}
                  onChange={e => setModalitiesAggravation(e.target.value)}
                  placeholder="e.g. cold air, sun heat, after food, mental stress..."
                  className="w-full border border-slate-300 rounded-xl p-2.5 text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 text-xs mb-1">
                  What gives you relief? (Amelioration)
                </label>
                <input
                  type="text"
                  value={modalitiesAmelioration}
                  onChange={e => setModalitiesAmelioration(e.target.value)}
                  placeholder="e.g. rest, warm drink, sleep, fresh air..."
                  className="w-full border border-slate-300 rounded-xl p-2.5 text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 text-xs mb-1">
                  Associated symptoms
                </label>
                <input
                  type="text"
                  value={concomitants}
                  onChange={e => setConcomitants(e.target.value)}
                  placeholder="e.g. nausea, sweating, dizziness..."
                  className="w-full border border-slate-300 rounded-xl p-2.5 text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                />
              </div>
            </div>

            <div className="space-y-2 pt-2 border-t border-slate-200">
              <label className="block font-semibold text-slate-700 text-xs">
                Attach reports or photos (optional)
              </label>
              <div className="flex flex-wrap items-center gap-3">
                <label className="px-4 py-2.5 rounded-xl border border-dashed border-emerald-400 bg-emerald-50/60 hover:bg-emerald-100/60 text-emerald-800 text-xs font-semibold cursor-pointer flex items-center gap-2">
                  <Upload className="w-4 h-4" />
                  <span>Select Photo / Document</span>
                  <input
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={handleFilesSelected}
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
                    <div
                      key={idx}
                      className="relative w-16 h-16 rounded-lg overflow-hidden border border-slate-300"
                    >
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

            <button
              type="submit"
              disabled={submitting}
              className="w-full py-4 px-6 rounded-2xl bg-emerald-600 hover:bg-emerald-700 disabled:opacity-60 text-white font-bold text-sm transition-colors shadow-lg flex items-center justify-center gap-2"
            >
              {submitting ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <Send className="w-5 h-5" />
              )}
              <span>{submitting ? 'Submitting...' : 'Submit Case Details to Doctor'}</span>
            </button>
            <p className="text-[11px] text-center text-slate-400">
              Your medical data is private and directly received by the doctor.
            </p>
          </form>
        )}
      </div>
    </div>
  );

  const renderPrescription = () => {
    if (!rx) {
      return (
        <div className="bg-white rounded-3xl p-8 shadow-xl border border-slate-200 text-center">
          <FileText className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <p className="text-sm text-slate-600">Prescription not available.</p>
        </div>
      );
    }

    return (
      <div className="space-y-4">
        <div className="bg-white p-3.5 rounded-2xl border border-slate-200 shadow-xs flex items-center justify-between print:hidden">
          <div className="flex items-center gap-2">
            <FileText className="w-5 h-5 text-emerald-600" />
            <span className="font-bold text-xs sm:text-sm">Digital Prescription</span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => window.print()}
              className="px-3.5 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold flex items-center gap-1.5"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print / Save PDF</span>
            </button>
            <a
              href={clinicWaHelpUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="px-3.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold flex items-center gap-1.5"
            >
              <MessageCircle className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">WhatsApp Help</span>
            </a>
          </div>
        </div>

        <div
          id="prescription-paper"
          className="bg-white rounded-3xl shadow-xl border border-slate-200 p-6 sm:p-10 space-y-6 text-slate-900"
        >
          <div className="border-b-2 border-emerald-800 pb-5 flex flex-col sm:flex-row sm:items-start justify-between gap-4">
            <div>
              <h2 className="text-xl sm:text-2xl font-bold font-serif text-emerald-950">
                {CLINIC_CONFIG.doctorName}
              </h2>
              {CLINIC_CONFIG.qualifications && (
                <p className="text-xs sm:text-sm font-semibold text-emerald-800">
                  {CLINIC_CONFIG.qualifications}
                </p>
              )}
              {CLINIC_CONFIG.regNo && (
                <p className="text-[11px] text-slate-500 mt-0.5">
                  Reg. No: <strong>{CLINIC_CONFIG.regNo}</strong>
                </p>
              )}
            </div>
            <div className="text-left sm:text-right text-xs text-slate-600 space-y-0.5">
              <div className="font-bold text-slate-900 text-sm">{CLINIC_CONFIG.appName}</div>
              {CLINIC_CONFIG.address && <div>{CLINIC_CONFIG.address}</div>}
              {CLINIC_CONFIG.phone && <div>{CLINIC_CONFIG.phone}</div>}
            </div>
          </div>

          <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
            <div>
              <span className="text-slate-400 block text-[10px] uppercase font-bold">Patient</span>
              <strong className="text-slate-900 text-sm">{patient?.name ?? 'Patient'}</strong>
            </div>
            <div>
              <span className="text-slate-400 block text-[10px] uppercase font-bold">Age / Gender</span>
              <strong className="text-slate-800">
                {patient?.age ?? '-'} yrs / {patient?.gender ?? '-'}
              </strong>
            </div>
            <div>
              <span className="text-slate-400 block text-[10px] uppercase font-bold">Date</span>
              <strong className="text-slate-800">{rx.consultation_date}</strong>
            </div>
            <div>
              <span className="text-slate-400 block text-[10px] uppercase font-bold">Follow-up</span>
              <strong className="text-emerald-800">{rx.follow_up_date ?? 'As advised'}</strong>
            </div>
          </div>

          {rx.diagnosis && (
            <div className="p-3 bg-emerald-50/70 rounded-xl border border-emerald-200 text-xs">
              <span className="font-bold text-emerald-900 uppercase tracking-wide text-[10px] block mb-0.5">
                Diagnosis
              </span>
              <span className="text-slate-900 font-semibold text-sm">{rx.diagnosis}</span>
            </div>
          )}

          <div className="space-y-2">
            <div className="flex items-center gap-1.5">
              <span className="text-3xl font-serif font-black text-emerald-900">℞</span>
              <span className="text-xs uppercase font-bold tracking-widest text-slate-500">
                Prescribed Medicines
              </span>
            </div>

            <div className="border border-slate-200 rounded-2xl overflow-hidden">
              <table className="w-full text-left text-xs border-collapse">
                <thead className="bg-emerald-900 text-white text-[11px] uppercase">
                  <tr>
                    <th className="p-3">#</th>
                    <th className="p-3">Remedy &amp; Potency</th>
                    <th className="p-3">Dosage &amp; Frequency</th>
                    <th className="p-3">Instructions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {rx.prescription_homeo_medicines
                    .slice()
                    .sort((a, b) => a.display_order - b.display_order)
                    .map((m, idx) => (
                      <tr key={m.id}>
                        <td className="p-3 font-mono text-slate-400">{idx + 1}</td>
                        <td className="p-3">
                          <span className="font-bold text-emerald-950 text-sm block">
                            {m.remedy}
                          </span>
                          <span className="text-slate-500 text-[11px]">
                            {m.potency} • {m.form}
                          </span>
                        </td>
                        <td className="p-3">
                          <span className="font-semibold text-slate-800 block">
                            {m.dosage ?? '-'}
                          </span>
                          <span className="text-emerald-700 font-medium text-[11px]">
                            {m.frequency} • {m.duration ?? ''}
                          </span>
                        </td>
                        <td className="p-3 text-slate-700">{m.instructions ?? '-'}</td>
                      </tr>
                    ))}
                  {rx.prescription_homeo_medicines.length === 0 && (
                    <tr>
                      <td colSpan={4} className="p-6 text-center text-slate-400">
                        No homeopathic medicines prescribed.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {rx.prescription_allo_medicines.length > 0 && (
            <div className="space-y-2">
              <div className="text-xs uppercase font-bold tracking-widest text-slate-500">
                Supportive Medication
              </div>
              <div className="border border-slate-200 rounded-2xl overflow-hidden">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-100 text-slate-600 text-[10px] uppercase">
                    <tr>
                      <th className="p-2.5">Medicine</th>
                      <th className="p-2.5">Strength</th>
                      <th className="p-2.5">Timing</th>
                      <th className="p-2.5">Duration</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {rx.prescription_allo_medicines
                      .slice()
                      .sort((a, b) => a.display_order - b.display_order)
                      .map(m => (
                        <tr key={m.id}>
                          <td className="p-2.5 font-bold text-slate-800">{m.name}</td>
                          <td className="p-2.5 text-slate-700">
                            {m.type} {m.strength ?? ''}
                          </td>
                          <td className="p-2.5 text-slate-700">
                            {m.timing} • {m.frequency}
                          </td>
                          <td className="p-2.5 text-slate-700">{m.duration ?? '-'}</td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 text-xs space-y-1.5">
              <strong className="text-emerald-900 block text-xs uppercase font-bold">
                Dietary &amp; Lifestyle Advice
              </strong>
              <ul className="list-disc list-inside text-slate-700 space-y-1 text-[11px]">
                {rx.dietary_advice && rx.dietary_advice.length > 0 ? (
                  rx.dietary_advice.map((adv, i) => <li key={i}>{adv}</li>)
                ) : (
                  <>
                    <li>Take medicines 30 mins before or after food.</li>
                    <li>Avoid strong coffee, raw onion, and camphor around dose.</li>
                  </>
                )}
              </ul>
            </div>

            <div className="p-4 bg-emerald-50/60 rounded-2xl border border-emerald-200 flex flex-col justify-between text-xs">
              <div>
                <strong className="text-emerald-950 block text-xs uppercase font-bold mb-1">
                  Next Follow-up
                </strong>
                <div className="text-emerald-800 font-bold text-base">
                  {rx.follow_up_date ?? 'As advised by doctor'}
                </div>
              </div>
              <div className="pt-3 border-t border-emerald-200/60 text-right">
                <span className="font-serif font-bold text-emerald-950 text-sm block">
                  {CLINIC_CONFIG.doctorName}
                </span>
                <span className="text-[10px] text-slate-500">
                  Authorized Digital Prescription
                </span>
              </div>
            </div>
          </div>

          <div className="pt-4 border-t border-slate-200 flex items-center justify-between text-[10px] text-slate-400">
            <div className="flex items-center gap-2">
              <QrCode className="w-8 h-8 text-slate-400" />
              <span>Digitally verified prescription</span>
            </div>
            <span className="font-mono font-bold text-slate-600">{CLINIC_CONFIG.appName}</span>
          </div>
        </div>
      </div>
    );
  };

  const renderBilling = () => {
    if (!invoice) {
      return (
        <div className="bg-white rounded-3xl p-8 shadow-xl border border-slate-200 text-center">
          <Receipt className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <p className="text-sm text-slate-600">Receipt not available.</p>
        </div>
      );
    }

    const items = [...invoice.invoice_items].sort((a, b) => a.display_order - b.display_order);
    const subtotal = items.reduce((s, it) => s + it.amount, 0);

    return (
      <div className="space-y-4">
        <div className="bg-white p-3.5 rounded-2xl border border-slate-200 shadow-xs flex items-center justify-between print:hidden">
          <div className="flex items-center gap-2">
            <Receipt className="w-5 h-5 text-emerald-600" />
            <span className="font-bold text-xs sm:text-sm">Payment Receipt</span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => window.print()}
              className="px-3.5 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold flex items-center gap-1.5"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print</span>
            </button>
            <a
              href={clinicWaHelpUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="px-3.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold flex items-center gap-1.5"
            >
              <MessageCircle className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">WhatsApp Help</span>
            </a>
          </div>
        </div>

        <div
          id="patient-billing-receipt"
          className="bg-white rounded-3xl shadow-xl border border-slate-200 p-6 sm:p-10 space-y-6"
        >
          <div className="border-b-2 border-slate-200 pb-5 flex flex-col sm:flex-row sm:items-start justify-between gap-4">
            <div>
              <h2 className="text-xl sm:text-2xl font-bold font-serif text-slate-900">
                {CLINIC_CONFIG.appName}
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                {CLINIC_CONFIG.doctorName}
                {CLINIC_CONFIG.qualifications && ` (${CLINIC_CONFIG.qualifications})`}
                {CLINIC_CONFIG.regNo && ` • Reg. ${CLINIC_CONFIG.regNo}`}
              </p>
              {CLINIC_CONFIG.address && (
                <p className="text-[11px] text-slate-400 mt-0.5">{CLINIC_CONFIG.address}</p>
              )}
            </div>
            <div className="text-left sm:text-right">
              <span className="inline-block px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-300 font-bold text-xs mb-1">
                {invoice.status.toUpperCase()}
              </span>
              <div className="font-mono font-bold text-slate-900 text-sm">
                {invoice.invoice_number}
              </div>
              <div className="text-xs text-slate-500">Date: {invoice.invoice_date}</div>
            </div>
          </div>

          <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 flex flex-wrap justify-between gap-3 text-xs">
            <div>
              <span className="text-slate-400 text-[10px] uppercase font-bold block">
                Billed To
              </span>
              <strong className="text-slate-900 text-sm">
                {patient?.name ?? 'Patient'}
              </strong>
            </div>
            <div className="text-left sm:text-right">
              <span className="text-slate-400 text-[10px] uppercase font-bold block">
                Payment Mode
              </span>
              <strong className="text-emerald-700 text-sm">{invoice.payment_mode}</strong>
            </div>
          </div>

          <div className="border border-slate-200 rounded-2xl overflow-hidden">
            <table className="w-full text-left text-xs border-collapse">
              <thead className="bg-slate-100 text-slate-600 text-[11px] uppercase">
                <tr>
                  <th className="p-3">#</th>
                  <th className="p-3">Description</th>
                  <th className="p-3 text-right">Amount (₹)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {items.map((it, idx) => (
                  <tr key={it.id}>
                    <td className="p-3 font-mono text-slate-400">{idx + 1}</td>
                    <td className="p-3 font-medium text-slate-800">{it.description}</td>
                    <td className="p-3 text-right font-mono font-bold text-slate-900">
                      ₹{it.amount}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="border-t border-slate-200 pt-3 space-y-1.5 text-right text-xs">
            <div className="flex justify-between text-slate-600 max-w-xs ml-auto">
              <span>Subtotal:</span>
              <span className="font-mono">₹{subtotal}</span>
            </div>
            {invoice.discount > 0 && (
              <div className="flex justify-between text-rose-600 max-w-xs ml-auto">
                <span>Discount:</span>
                <span className="font-mono">- ₹{invoice.discount}</span>
              </div>
            )}
            <div className="flex justify-between text-base font-bold text-slate-900 pt-2 border-t border-slate-200 max-w-xs ml-auto">
              <span>Total Amount:</span>
              <span className="text-emerald-700 font-mono">₹{invoice.total_amount}</span>
            </div>
          </div>

          <div className="pt-4 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400">
            <span>Thank you for visiting {CLINIC_CONFIG.appName}.</span>
            <span className="font-mono font-bold text-slate-600">Official Receipt</span>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col font-sans antialiased text-slate-800">
      <header className="bg-emerald-900 text-white shadow-md sticky top-0 z-30 print:hidden">
        <div className="max-w-4xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center text-emerald-300 font-serif font-black text-lg border border-emerald-700/50">
              {CLINIC_CONFIG.doctorName.charAt(0) || 'C'}
            </div>
            <div>
              <h1 className="font-bold text-sm sm:text-base leading-tight tracking-wide">
                {CLINIC_CONFIG.appName}
              </h1>
              <p className="text-[11px] text-emerald-200">
                {CLINIC_CONFIG.doctorName}
                {CLINIC_CONFIG.qualifications && ` • ${CLINIC_CONFIG.qualifications}`}
              </p>
            </div>
          </div>
          <button
            onClick={onExit}
            className="px-2 py-1.5 rounded-lg text-emerald-200 hover:text-white hover:bg-emerald-800 text-[11px] transition-colors"
          >
            Exit
          </button>
        </div>
      </header>

      <main className="flex-1 max-w-4xl w-full mx-auto p-4 sm:p-6 md:p-8">
        {view === 'intake' && renderIntake()}
        {view === 'prescription' && renderPrescription()}
        {view === 'billing' && renderBilling()}
      </main>

      <footer className="border-t border-slate-200 bg-white py-4 text-center text-xs text-slate-400 print:hidden">
        <div className="max-w-4xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <span>
            {CLINIC_CONFIG.appName}
            {CLINIC_CONFIG.doctorName && ` • ${CLINIC_CONFIG.doctorName}`}
          </span>
          <span className="flex items-center gap-1">
            <Stethoscope className="w-3.5 h-3.5" />
            Secure share link
          </span>
        </div>
      </footer>
    </div>
  );
};