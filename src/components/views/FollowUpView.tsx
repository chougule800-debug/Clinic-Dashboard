import React, { useState } from 'react';
import { useClinic } from '../../context/ClinicContext';
import { FollowUpRecord } from '../../types';
import {
  Clock,
  Plus,
  Save,
  CheckCircle2,
  AlertTriangle,
  TrendingUp,
  Activity,
  Heart,
  Droplet,
  Weight,
  Calendar,
  ChevronRight
} from 'lucide-react';

export const FollowUpView: React.FC = () => {
  const {
    selectedPatient,
    followUps,
    saveFollowUp,
    setActiveTab
  } = useClinic();

  const patientFollowUps = selectedPatient
    ? followUps.filter(f => f.patientId === selectedPatient.id)
    : [];

  const [showAddForm, setShowAddForm] = useState(false);
  const [response, setResponse] = useState<FollowUpRecord['response']>('Moderate Improvement');
  const [subjectiveFeedback, setSubjectiveFeedback] = useState('Headache frequency reduced from 4 times a week to once a week. Intensity is much milder.');
  const [remedyActionAssessment, setRemedyActionAssessment] = useState('Natrum Muriaticum 200C acted beneficially, continuing gentle curative trajectory.');
  const [prescriptionAdjustment, setPrescriptionAdjustment] = useState('Sac Lac 30C (Placebo) 4 pills BD for 15 days. Do not interfere with remedy action.');
  const [nextFollowUpDate, setNextFollowUpDate] = useState('2026-04-10');
  const [vitalsBpSystolic, setVitalsBpSystolic] = useState(120);
  const [vitalsBpDiastolic, setVitalsBpDiastolic] = useState(80);
  const [vitalsWeight, setVitalsWeight] = useState(68);
  const [saveToast, setSaveToast] = useState(false);

  const handleSaveFollowUp = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPatient) return;

    saveFollowUp({
      patientId: selectedPatient.id,
      date: new Date().toISOString().split('T')[0],
      response,
      subjectiveFeedback,
      remedyActionAssessment,
      prescriptionAdjustment,
      nextFollowUpDate,
      vitalsCheck: {
        bpSystolic: vitalsBpSystolic,
        bpDiastolic: vitalsBpDiastolic,
        weight: vitalsWeight
      }
    });

    setSaveToast(true);
    setTimeout(() => setSaveToast(false), 2000);
    setShowAddForm(false);
  };

  if (!selectedPatient) {
    return (
      <div className="p-8 text-center bg-white rounded-2xl border border-slate-200">
        <Clock className="w-12 h-12 text-slate-400 mx-auto mb-2" />
        <h3 className="font-bold text-slate-800 text-base">No Active Patient Selected</h3>
        <p className="text-xs text-slate-500 mt-1">Please select or register a patient to track their follow-up history.</p>
      </div>
    );
  }

  const getResponseBadge = (res: FollowUpRecord['response']) => {
    switch (res) {
      case 'Marked Improvement':
        return 'bg-emerald-100 text-emerald-800 border-emerald-300';
      case 'Moderate Improvement':
        return 'bg-teal-100 text-teal-800 border-teal-300';
      case 'Slight Improvement':
        return 'bg-cyan-100 text-cyan-800 border-cyan-300';
      case 'Status Quo (Same)':
        return 'bg-amber-100 text-amber-800 border-amber-300';
      case 'Aggravation / Worse':
        return 'bg-rose-100 text-rose-800 border-rose-300';
      default:
        return 'bg-slate-100 text-slate-700 border-slate-300';
    }
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-amber-50 text-amber-800 border border-amber-200">
              Longitudinal Clinical Progress Tracker
            </span>
            <span className="text-slate-400">•</span>
            <span className="text-xs text-slate-600">
              Patient: <strong>{selectedPatient.name}</strong> ({selectedPatient.id})
            </span>
          </div>
          <h2 className="text-xl font-bold text-slate-900 font-serif flex items-center gap-2">
            <Clock className="w-5 h-5 text-amber-600" />
            Patient Follow-up & Progress History
          </h2>
          <p className="text-xs text-slate-500">
            Hering's Law of Cure evaluation, action taken (Continue, Potency Shift, Sac Lac), and response metrics.
          </p>
        </div>

        <button
          id="btn-log-follow-up"
          onClick={() => setShowAddForm(!showAddForm)}
          className="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white font-semibold text-xs rounded-xl transition-colors flex items-center gap-2 shadow-xs shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>{showAddForm ? 'Close Form' : 'Log New Follow-up'}</span>
        </button>
      </div>

      {saveToast && (
        <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-200 text-emerald-800 font-semibold text-xs flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          Follow-up record logged successfully.
        </div>
      )}

      {/* Log New Follow-up Form */}
      {showAddForm && (
        <form onSubmit={handleSaveFollowUp} className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4 text-xs">
          <h3 className="font-bold text-slate-900 text-sm border-b border-slate-100 pb-2">
            Record Clinical Follow-Up Visit
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block font-medium text-slate-700 mb-1">Clinical Evaluation Status (Response)</label>
              <select
                value={response}
                onChange={(e) => setResponse(e.target.value as FollowUpRecord['response'])}
                className="w-full border border-slate-300 rounded-lg p-2 text-xs text-slate-900 focus:outline-none"
              >
                <option value="Marked Improvement">Marked Improvement (&gt;75%)</option>
                <option value="Moderate Improvement">Moderate Improvement (25-75%)</option>
                <option value="Slight Improvement">Slight Improvement (10-25%)</option>
                <option value="Status Quo (Same)">Status Quo (No Change)</option>
                <option value="Aggravation / Worse">Homeopathic Aggravation (&lt;)</option>
              </select>
            </div>

            <div>
              <label className="block font-medium text-slate-700 mb-1">Remedy Action Assessment</label>
              <input
                type="text"
                value={remedyActionAssessment}
                onChange={(e) => setRemedyActionAssessment(e.target.value)}
                placeholder="e.g. Remedy acting favorably, wait and watch"
                className="w-full border border-slate-300 rounded-lg p-2 text-xs text-slate-900 focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block font-medium text-slate-700 mb-1">Patient Subjective & Objective Feedback</label>
            <textarea
              rows={3}
              value={subjectiveFeedback}
              onChange={(e) => setSubjectiveFeedback(e.target.value)}
              placeholder="e.g. Headache severity down, sleeping better, no vomiting..."
              className="w-full border border-slate-300 rounded-lg p-2.5 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-500"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block font-medium text-slate-700 mb-1">Prescription Adjustment / Given</label>
              <input
                type="text"
                value={prescriptionAdjustment}
                onChange={(e) => setPrescriptionAdjustment(e.target.value)}
                placeholder="e.g. Sac Lac 30C for 15 days"
                className="w-full border border-slate-300 rounded-lg p-2 text-xs text-slate-900 focus:outline-none"
              />
            </div>

            <div>
              <label className="block font-medium text-slate-700 mb-1">Recorded BP / Weight</label>
              <div className="grid grid-cols-2 gap-1">
                <input
                  type="text"
                  value={`${vitalsBpSystolic}/${vitalsBpDiastolic}`}
                  onChange={(e) => {
                    const parts = e.target.value.split('/');
                    if (parts[0]) setVitalsBpSystolic(Number(parts[0]) || 120);
                    if (parts[1]) setVitalsBpDiastolic(Number(parts[1]) || 80);
                  }}
                  placeholder="BP (120/80)"
                  className="w-full border border-slate-300 rounded-lg p-2 text-xs text-slate-900 focus:outline-none"
                />
                <input
                  type="number"
                  value={vitalsWeight}
                  onChange={(e) => setVitalsWeight(Number(e.target.value) || 60)}
                  placeholder="Weight (kg)"
                  className="w-full border border-slate-300 rounded-lg p-2 text-xs text-slate-900 focus:outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block font-medium text-slate-700 mb-1">Next Follow-up Due</label>
              <input
                type="date"
                value={nextFollowUpDate}
                onChange={(e) => setNextFollowUpDate(e.target.value)}
                className="w-full border border-slate-300 rounded-lg p-2 text-xs text-slate-900 focus:outline-none"
              />
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setShowAddForm(false)}
              className="px-3 py-1.5 rounded-lg text-slate-600 hover:bg-slate-100"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-bold"
            >
              Save Follow-up Encounter
            </button>
          </div>
        </form>
      )}

      {/* Follow-up Timeline */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-6">
        <h3 className="font-bold text-slate-900 text-sm border-b border-slate-100 pb-3">
          Consultation Timeline for {selectedPatient.name}
        </h3>

        {patientFollowUps.length === 0 ? (
          <div className="p-8 text-center text-xs text-slate-400">
            No follow-up encounters recorded yet. Click "Log New Follow-up" to record progress.
          </div>
        ) : (
          <div className="relative pl-6 space-y-6 before:absolute before:left-2.5 before:top-3 before:bottom-3 before:w-0.5 before:bg-slate-200">
            {patientFollowUps.map((fu) => (
              <div key={fu.id} className="relative space-y-2">
                {/* Dot */}
                <div className="absolute -left-6 top-1 w-3.5 h-3.5 rounded-full bg-amber-500 ring-4 ring-amber-100" />

                <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/70 hover:bg-white transition-colors space-y-2">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-slate-900 text-sm">
                        Visit on {new Date(fu.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                      </span>
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${getResponseBadge(fu.response)}`}>
                        {fu.response}
                      </span>
                    </div>

                    <span className="text-[11px] font-semibold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded-md border border-indigo-200">
                      Assessment: {fu.remedyActionAssessment}
                    </span>
                  </div>

                  <p className="text-slate-700 text-xs leading-relaxed">
                    "{fu.subjectiveFeedback}"
                  </p>

                  <div className="pt-2 border-t border-slate-200/60 flex flex-wrap items-center justify-between gap-2 text-[11px] text-slate-500">
                    <div>
                      <strong className="text-slate-700">Prescription:</strong> {fu.prescriptionAdjustment}
                    </div>

                    <div className="flex items-center gap-3">
                      {fu.vitalsCheck && (
                        <span>BP: {fu.vitalsCheck.bpSystolic}/{fu.vitalsCheck.bpDiastolic} | Wt: {fu.vitalsCheck.weight}kg</span>
                      )}
                      <span className="text-amber-700 font-semibold">
                        Next: {fu.nextFollowUpDate}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
