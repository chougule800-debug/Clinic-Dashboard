import React, { useState } from 'react';
import { useClinic } from '../../context/ClinicContext';
import type { FollowUpRecord } from '../../types';
import {
  Clock,
  Plus,
  Save,
  CheckCircle2,
  AlertCircle,
  Loader2
} from 'lucide-react';

export const FollowUpView: React.FC = () => {
  const { selectedPatient, followUps, saveFollowUp } = useClinic();

  const patientFollowUps = selectedPatient
    ? followUps.filter(f => f.patientId === selectedPatient.id)
    : [];

  const [showAddForm, setShowAddForm] = useState(false);
  const [response, setResponse] = useState<FollowUpRecord['response']>('Moderate Improvement');
  const [subjectiveFeedback, setSubjectiveFeedback] = useState('');
  const [remedyActionAssessment, setRemedyActionAssessment] = useState('');
  const [prescriptionAdjustment, setPrescriptionAdjustment] = useState('');
  const [nextFollowUpDate, setNextFollowUpDate] = useState('');
  const [vitalsBpSystolic, setVitalsBpSystolic] = useState(120);
  const [vitalsBpDiastolic, setVitalsBpDiastolic] = useState(80);
  const [vitalsWeight, setVitalsWeight] = useState(68);
  const [saveToast, setSaveToast] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSaveFollowUp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPatient) return;
    setError(null);
    setSaving(true);
    try {
      await saveFollowUp({
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
      setSubjectiveFeedback('');
      setRemedyActionAssessment('');
      setPrescriptionAdjustment('');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save follow-up.');
    } finally {
      setSaving(false);
    }
  };

  if (!selectedPatient) {
    return (
      <div className="p-8 text-center bg-white rounded-2xl border border-slate-200">
        <Clock className="w-12 h-12 text-slate-400 mx-auto mb-2" />
        <h3 className="font-bold text-slate-800 text-base">No Active Patient Selected</h3>
        <p className="text-xs text-slate-500 mt-1">
          Select or register a patient to track follow-ups.
        </p>
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
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-amber-50 text-amber-800 border border-amber-200">
              Progress Tracker
            </span>
            <span className="text-slate-400">•</span>
            <span className="text-xs text-slate-600">
              <strong>{selectedPatient.name}</strong> ({selectedPatient.patientCode ?? selectedPatient.id})
            </span>
          </div>
          <h2 className="text-xl font-bold text-slate-900 font-serif flex items-center gap-2">
            <Clock className="w-5 h-5 text-amber-600" />
            Follow-up History
          </h2>
        </div>

        <button
          onClick={() => setShowAddForm(!showAddForm)}
          className="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white font-semibold text-xs rounded-xl transition-colors flex items-center gap-2 shadow-xs shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>{showAddForm ? 'Close' : 'Log Follow-up'}</span>
        </button>
      </div>

      {saveToast && (
        <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-200 text-emerald-800 font-semibold text-xs flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          Follow-up logged.
        </div>
      )}

      {error && (
        <div className="p-3 bg-rose-50 rounded-xl border border-rose-200 text-rose-800 font-semibold text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4 text-rose-600" />
          {error}
        </div>
      )}

      {showAddForm && (
        <form onSubmit={handleSaveFollowUp} className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4 text-xs">
          <h3 className="font-bold text-slate-900 text-sm border-b border-slate-100 pb-2">
            Record Follow-up Visit
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block font-medium text-slate-700 mb-1">Response</label>
              <select
                value={response}
                onChange={e => setResponse(e.target.value as FollowUpRecord['response'])}
                className="w-full border border-slate-300 rounded-lg p-2 text-xs focus:outline-none"
              >
                <option value="Marked Improvement">Marked Improvement (&gt;75%)</option>
                <option value="Moderate Improvement">Moderate Improvement (25-75%)</option>
                <option value="Slight Improvement">Slight Improvement (10-25%)</option>
                <option value="Status Quo (Same)">Status Quo (No Change)</option>
                <option value="Aggravation / Worse">Aggravation / Worse</option>
              </select>
            </div>

            <div>
              <label className="block font-medium text-slate-700 mb-1">Remedy Action Assessment</label>
              <input
                type="text"
                value={remedyActionAssessment}
                onChange={e => setRemedyActionAssessment(e.target.value)}
                placeholder="e.g. Remedy acting favorably"
                className="w-full border border-slate-300 rounded-lg p-2 text-xs focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block font-medium text-slate-700 mb-1">Subjective Feedback</label>
            <textarea
              rows={3}
              value={subjectiveFeedback}
              onChange={e => setSubjectiveFeedback(e.target.value)}
              className="w-full border border-slate-300 rounded-lg p-2.5 text-xs focus:ring-2 focus:ring-amber-500 focus:outline-none"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block font-medium text-slate-700 mb-1">Prescription Adjustment</label>
              <input
                type="text"
                value={prescriptionAdjustment}
                onChange={e => setPrescriptionAdjustment(e.target.value)}
                placeholder="e.g. Sac Lac 30C BD"
                className="w-full border border-slate-300 rounded-lg p-2 text-xs focus:outline-none"
              />
            </div>

            <div>
              <label className="block font-medium text-slate-700 mb-1">BP / Weight</label>
              <div className="grid grid-cols-3 gap-1">
                <input
                  type="number"
                  value={vitalsBpSystolic}
                  onChange={e => setVitalsBpSystolic(Number(e.target.value) || 120)}
                  className="w-full border border-slate-300 rounded-lg p-2 text-xs"
                />
                <input
                  type="number"
                  value={vitalsBpDiastolic}
                  onChange={e => setVitalsBpDiastolic(Number(e.target.value) || 80)}
                  className="w-full border border-slate-300 rounded-lg p-2 text-xs"
                />
                <input
                  type="number"
                  value={vitalsWeight}
                  onChange={e => setVitalsWeight(Number(e.target.value) || 60)}
                  className="w-full border border-slate-300 rounded-lg p-2 text-xs"
                />
              </div>
            </div>

            <div>
              <label className="block font-medium text-slate-700 mb-1">Next Follow-up</label>
              <input
                type="date"
                value={nextFollowUpDate}
                onChange={e => setNextFollowUpDate(e.target.value)}
                className="w-full border border-slate-300 rounded-lg p-2 text-xs focus:outline-none"
              />
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setShowAddForm(false)}
              className="px-3 py-1.5 rounded-lg text-slate-600 hover:bg-slate-100 text-xs font-semibold"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="px-4 py-2 rounded-xl bg-amber-600 hover:bg-amber-700 disabled:opacity-60 text-white font-bold text-xs flex items-center gap-1.5"
            >
              {saving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
              Save Follow-up
            </button>
          </div>
        </form>
      )}

      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-6">
        <h3 className="font-bold text-slate-900 text-sm border-b border-slate-100 pb-3">
          Timeline
        </h3>

        {patientFollowUps.length === 0 ? (
          <div className="p-8 text-center text-xs text-slate-400">
            No follow-up encounters recorded yet.
          </div>
        ) : (
          <div className="relative pl-6 space-y-6 before:absolute before:left-2.5 before:top-3 before:bottom-3 before:w-0.5 before:bg-slate-200">
            {patientFollowUps.map(fu => (
              <div key={fu.id} className="relative space-y-2">
                <div className="absolute -left-6 top-1 w-3.5 h-3.5 rounded-full bg-amber-500 ring-4 ring-amber-100" />
                <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/70 space-y-2">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-slate-900 text-sm">
                        {new Date(fu.date).toLocaleDateString('en-IN', {
                          day: 'numeric',
                          month: 'short',
                          year: 'numeric'
                        })}
                      </span>
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${getResponseBadge(fu.response)}`}>
                        {fu.response}
                      </span>
                    </div>
                    {fu.remedyActionAssessment && (
                      <span className="text-[11px] font-semibold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded-md border border-indigo-200">
                        {fu.remedyActionAssessment}
                      </span>
                    )}
                  </div>

                  {fu.subjectiveFeedback && (
                    <p className="text-slate-700 text-xs leading-relaxed">
                      {fu.subjectiveFeedback}
                    </p>
                  )}

                  <div className="pt-2 border-t border-slate-200/60 flex flex-wrap items-center justify-between gap-2 text-[11px] text-slate-500">
                    <div>
                      <strong className="text-slate-700">Rx:</strong>{' '}
                      {fu.prescriptionAdjustment || 'Continue as advised'}
                    </div>
                    <div className="flex items-center gap-3">
                      {fu.vitalsCheck && (fu.vitalsCheck.bpSystolic || fu.vitalsCheck.weight) && (
                        <span>
                          BP: {fu.vitalsCheck.bpSystolic}/{fu.vitalsCheck.bpDiastolic} | Wt:{' '}
                          {fu.vitalsCheck.weight}kg
                        </span>
                      )}
                      {fu.nextFollowUpDate && (
                        <span className="text-amber-700 font-semibold">
                          Next: {fu.nextFollowUpDate}
                        </span>
                      )}
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