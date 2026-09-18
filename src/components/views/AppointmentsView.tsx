import React, { useState } from 'react';
import { useClinic } from '../../context/ClinicContext';
import { Appointment } from '../../types';
import {
  Calendar,
  Clock,
  User,
  Plus,
  Phone,
  CheckCircle2,
  XCircle,
  PlayCircle,
  ChevronRight,
  Search,
  Filter
} from 'lucide-react';

export const AppointmentsView: React.FC = () => {
  const {
    appointments,
    patients,
    addAppointment,
    updateAppointmentStatus,
    selectPatient,
    setActiveTab
  } = useClinic();

  const [filterDate, setFilterDate] = useState('2026-03-16');
  const [filterStatus, setFilterStatus] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);

  // New Appointment form state
  const [newPatientId, setNewPatientId] = useState(patients[0]?.id || '');
  const [newTimeSlot, setNewTimeSlot] = useState('11:00 AM');
  const [newType, setNewType] = useState<'New Consultation' | 'Follow-up' | 'Report Review' | 'Remote WhatsApp Consult'>('Follow-up');
  const [newNotes, setNewNotes] = useState('');

  const filteredAppointments = appointments.filter(a => {
    const matchesDate = !filterDate || a.date === filterDate;
    const matchesStatus = filterStatus === 'All' || a.status === filterStatus;
    const matchesSearch =
      a.patientName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      a.patientMobile.includes(searchQuery) ||
      a.id.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesDate && matchesStatus && matchesSearch;
  });

  const handleCreateAppointment = (e: React.FormEvent) => {
    e.preventDefault();
    const patient = patients.find(p => p.id === newPatientId);
    if (!patient) return;

    addAppointment({
      patientId: patient.id,
      patientName: patient.name,
      patientMobile: patient.mobile,
      date: filterDate,
      timeSlot: newTimeSlot,
      type: newType,
      status: 'Scheduled',
      notes: newNotes
    });

    setShowAddModal(false);
    setNewNotes('');
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 font-serif flex items-center gap-2">
            <Calendar className="w-5 h-5 text-indigo-600" />
            Appointments & Consultation Queue
          </h2>
          <p className="text-xs text-slate-500">
            Real-time OPD queue management with live status transitions (Waiting → In-Consultation → Completed).
          </p>
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs rounded-xl transition-colors flex items-center gap-2 shadow-xs shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>Book Appointment</span>
        </button>
      </div>

      {/* Filter Bar */}
      <div className="flex flex-col sm:flex-row items-center gap-3">
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search appointments by patient name or phone..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-white border border-slate-300 rounded-xl pl-9 pr-3 py-2 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <input
            type="date"
            value={filterDate}
            onChange={(e) => setFilterDate(e.target.value)}
            className="bg-white border border-slate-300 rounded-xl px-3 py-2 text-xs text-slate-900 focus:outline-none"
          />

          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="bg-white border border-slate-300 rounded-xl px-3 py-2 text-xs text-slate-900 focus:outline-none"
          >
            {['All', 'Scheduled', 'Waiting', 'In-Consultation', 'Completed', 'Cancelled'].map(s => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Appointments Grid */}
      <div className="space-y-3">
        {filteredAppointments.length === 0 ? (
          <div className="p-12 text-center bg-white rounded-2xl border border-slate-200 text-xs text-slate-400">
            No appointments found for the selected criteria.
          </div>
        ) : (
          filteredAppointments.map((apt) => (
            <div
              key={apt.id}
              className="bg-white p-4 rounded-2xl border border-slate-200 hover:border-slate-300 transition-all flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-xs"
            >
              <div className="flex items-start gap-4">
                <div className="w-14 h-14 rounded-2xl bg-indigo-50 text-indigo-700 font-bold flex flex-col items-center justify-center shrink-0 border border-indigo-100">
                  <Clock className="w-4 h-4 text-indigo-600 mb-0.5" />
                  <span className="text-[10px] leading-none font-mono text-indigo-900">{apt.timeSlot}</span>
                </div>

                <div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => {
                        selectPatient(apt.patientId);
                        setActiveTab('case_taking');
                      }}
                      className="font-bold text-slate-900 text-sm hover:text-teal-700 text-left transition-colors"
                    >
                      {apt.patientName}
                    </button>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 font-bold">
                      {apt.patientId}
                    </span>
                    <span className="px-2 py-0.5 rounded-md text-[10px] font-semibold bg-indigo-50 text-indigo-800 border border-indigo-200">
                      {apt.type}
                    </span>
                  </div>

                  <div className="flex items-center gap-3 text-xs text-slate-500 mt-1">
                    <span className="flex items-center gap-1">
                      <Phone className="w-3 h-3 text-slate-400" />
                      {apt.patientMobile}
                    </span>
                    {apt.notes && (
                      <span className="text-slate-600 italic">
                        Note: {apt.notes}
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Status & Actions */}
              <div className="flex items-center justify-between md:justify-end gap-3 pt-2 md:pt-0 border-t md:border-t-0 border-slate-100">
                <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${
                  apt.status === 'Waiting'
                    ? 'bg-amber-100 text-amber-800'
                    : apt.status === 'In-Consultation'
                    ? 'bg-indigo-100 text-indigo-800 animate-pulse'
                    : apt.status === 'Completed'
                    ? 'bg-emerald-100 text-emerald-800'
                    : apt.status === 'Cancelled'
                    ? 'bg-rose-100 text-rose-800'
                    : 'bg-slate-100 text-slate-700'
                }`}>
                  ● {apt.status}
                </span>

                <div className="flex items-center gap-1.5">
                  {apt.status === 'Scheduled' && (
                    <button
                      onClick={() => updateAppointmentStatus(apt.id, 'Waiting')}
                      className="px-2.5 py-1.5 rounded-lg bg-amber-50 hover:bg-amber-100 text-amber-800 text-xs font-semibold transition-colors"
                    >
                      Mark Waiting
                    </button>
                  )}

                  {apt.status === 'Waiting' && (
                    <button
                      onClick={() => {
                        selectPatient(apt.patientId);
                        updateAppointmentStatus(apt.id, 'In-Consultation');
                        setActiveTab('case_taking');
                      }}
                      className="px-3 py-1.5 rounded-lg bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold transition-colors flex items-center gap-1"
                    >
                      <PlayCircle className="w-3.5 h-3.5" />
                      <span>Start Consult</span>
                    </button>
                  )}

                  {apt.status === 'In-Consultation' && (
                    <button
                      onClick={() => updateAppointmentStatus(apt.id, 'Completed')}
                      className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition-colors flex items-center gap-1"
                    >
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>Mark Complete</span>
                    </button>
                  )}

                  {apt.status !== 'Completed' && apt.status !== 'Cancelled' && (
                    <button
                      onClick={() => updateAppointmentStatus(apt.id, 'Cancelled')}
                      title="Cancel Appointment"
                      className="p-1.5 rounded-lg hover:bg-rose-50 text-slate-400 hover:text-rose-600 transition-colors"
                    >
                      <XCircle className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Book Appointment Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 backdrop-blur-xs p-4">
          <div className="bg-white rounded-2xl shadow-xl border border-slate-200 w-full max-w-md p-6 space-y-4 text-xs">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="font-bold text-slate-900 text-sm">Schedule New Appointment</h3>
              <button
                onClick={() => setShowAddModal(false)}
                className="text-slate-400 hover:text-slate-600"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateAppointment} className="space-y-3">
              <div>
                <label className="block font-medium text-slate-700 mb-1">Select Patient *</label>
                <select
                  value={newPatientId}
                  onChange={(e) => setNewPatientId(e.target.value)}
                  className="w-full border border-slate-300 rounded-lg p-2 text-xs text-slate-900 focus:outline-none"
                >
                  {patients.map(p => (
                    <option key={p.id} value={p.id}>{p.name} ({p.mobile})</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-medium text-slate-700 mb-1">Time Slot</label>
                  <input
                    type="text"
                    value={newTimeSlot}
                    onChange={(e) => setNewTimeSlot(e.target.value)}
                    className="w-full border border-slate-300 rounded-lg p-2 text-xs text-slate-900 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block font-medium text-slate-700 mb-1">Appointment Type</label>
                  <select
                    value={newType}
                    onChange={(e) => setNewType(e.target.value as any)}
                    className="w-full border border-slate-300 rounded-lg p-2 text-xs text-slate-900 focus:outline-none"
                  >
                    <option value="New Consultation">New Consultation</option>
                    <option value="Follow-up">Follow-up</option>
                    <option value="Emergency">Emergency</option>
                    <option value="Remote WhatsApp Consult">Remote WhatsApp Consult</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-medium text-slate-700 mb-1">Clinical Notes / Reason</label>
                <textarea
                  rows={2}
                  value={newNotes}
                  onChange={(e) => setNewNotes(e.target.value)}
                  placeholder="e.g. Migraine follow-up review, skin rash check"
                  className="w-full border border-slate-300 rounded-lg p-2 text-xs text-slate-900 focus:outline-none"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-3.5 py-2 text-slate-600 hover:bg-slate-100 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl"
                >
                  Confirm Appointment
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
