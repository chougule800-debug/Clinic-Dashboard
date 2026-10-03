import React, { useState } from 'react';
import { useClinic } from '../../context/ClinicContext';
import { CLINIC_CONFIG } from '../../config/clinicConfig';
import { ClinicalSystemKey, Patient } from '../../types';
import {
  Users,
  Calendar,
  ClipboardList,
  GitBranch,
  Pill,
  MessageSquare,
  Share2,
  FileCheck2,
  Clock,
  ArrowRight,
  Activity,
  Plus,
  Heart,
  Search,
  CheckCircle2,
  Phone,
  Droplet,
  Scale,
  Gauge
} from 'lucide-react';

interface DashboardViewProps {
  onOpenNewPatient: () => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({ onOpenNewPatient }) => {
  const {
    patients,
    selectedPatient,
    systemForms,
    prescriptions,
    appointments,
    conversations,
    setActiveTab,
    setActiveSystemFormKey,
    openWhatsAppShareDialog,
    updateAppointmentStatus,
    activeSystemFormKey,
    selectPatient
  } = useClinic();

  const [patientSearch, setPatientSearch] = useState('');

  const totalPatients = patients.length;
  const todayAppointments = appointments.filter(a => a.status !== 'Completed' && a.status !== 'Cancelled');
  const remoteIntakes = systemForms.filter(f => f.submittedVia === 'WhatsApp_Remote_Intake');
  const unreadMessages = conversations.reduce((acc, c) => acc + c.unreadCount, 0);

  // Filter patients by name or mobile
  const filteredPatients = patients.filter(p =>
    p.name.toLowerCase().includes(patientSearch.toLowerCase()) ||
    p.mobile.includes(patientSearch) ||
    p.id.toLowerCase().includes(patientSearch.toLowerCase())
  );

  // Patient's attached records
  const patientForms = selectedPatient
    ? systemForms.filter(f => f.patientId === selectedPatient.id)
    : [];

  return (
    <div className="space-y-6 pb-12">
      {/* Welcome & Quick Action Bar */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-teal-700 font-bold text-xs tracking-wider uppercase flex items-center gap-1.5">
              <Activity className="w-4 h-4 text-teal-600" />
              Doctor Clinical Dashboard
            </span>
            <span className="text-slate-300">•</span>
            <span className="text-slate-500 text-xs font-medium">
              {new Date().toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'short', year: 'numeric' })}
            </span>
          </div>
          <h1 className="text-2xl font-bold text-slate-900 font-serif">
            Welcome, {CLINIC_CONFIG.doctorName}
          </h1>
          <p className="text-slate-500 text-xs mt-1 max-w-2xl leading-relaxed">
            {CLINIC_CONFIG.appName} • {CLINIC_CONFIG.qualifications} • Reg. No: {CLINIC_CONFIG.regNo} • Direct patient overview with vital signs (BP, RBS, Weight), 9-system case taking, repertorisation, and prescriptions.
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap shrink-0">
          <button
            id="btn-dash-new-patient"
            onClick={onOpenNewPatient}
            className="px-4 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-500 text-white font-semibold text-xs transition-colors flex items-center gap-2 shadow-xs"
          >
            <Plus className="w-4 h-4" />
            <span>+ Register New Patient</span>
          </button>
          <button
            id="btn-dash-send-whatsapp-link"
            onClick={() => {
              if (selectedPatient) {
                openWhatsAppShareDialog(selectedPatient.id, activeSystemFormKey);
              }
            }}
            className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs transition-colors flex items-center gap-2 shadow-xs"
          >
            <Share2 className="w-4 h-4" />
            <span>WhatsApp Case Link</span>
          </button>
        </div>
      </div>

      {/* KPI Stats Strip */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex items-center justify-between">
          <div>
            <div className="text-[11px] font-semibold uppercase text-slate-500 tracking-wider">Total Patients</div>
            <div className="text-2xl font-bold text-slate-900 mt-1">{totalPatients}</div>
            <div className="text-[11px] text-teal-600 font-medium mt-0.5">
              Active in Clinic
            </div>
          </div>
          <div className="w-10 h-10 rounded-xl bg-teal-50 text-teal-700 flex items-center justify-center">
            <Users className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex items-center justify-between">
          <div>
            <div className="text-[11px] font-semibold uppercase text-slate-500 tracking-wider">Today's Appointments</div>
            <div className="text-2xl font-bold text-slate-900 mt-1">{todayAppointments.length}</div>
            <div className="text-[11px] text-slate-500 mt-0.5">
              {appointments.filter(a => a.status === 'Completed').length} completed today
            </div>
          </div>
          <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-700 flex items-center justify-center">
            <Calendar className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex items-center justify-between">
          <div>
            <div className="text-[11px] font-semibold uppercase text-slate-500 tracking-wider">Remote Submissions</div>
            <div className="text-2xl font-bold text-emerald-700 mt-1">{remoteIntakes.length}</div>
            <div className="text-[11px] text-emerald-600 font-medium mt-0.5">
              WhatsApp Case Forms
            </div>
          </div>
          <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center">
            <Share2 className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex items-center justify-between">
          <div>
            <div className="text-[11px] font-semibold uppercase text-slate-500 tracking-wider">Prescriptions Issued</div>
            <div className="text-2xl font-bold text-slate-900 mt-1">{prescriptions.length}</div>
            <div className="text-[11px] text-amber-600 font-medium mt-0.5">
              Dual Homeo + Allo
            </div>
          </div>
          <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-700 flex items-center justify-center">
            <Pill className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Primary Patients Details Section: Name, Age, Sex, Mobile No., BP, RBS, Weight */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="p-5 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-50/60">
          <div>
            <h2 className="text-lg font-bold text-slate-900 font-serif flex items-center gap-2">
              <Users className="w-5 h-5 text-teal-700" />
              Patient Details & Vitals
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Core patient demographics and baseline vitals: Name, Age, Sex, Mobile, BP, RBS, and Weight.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <div className="relative w-full sm:w-64">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search by name or mobile..."
                value={patientSearch}
                onChange={(e) => setPatientSearch(e.target.value)}
                className="w-full bg-white border border-slate-300 rounded-xl pl-9 pr-3 py-1.5 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-500"
              />
            </div>
            <button
              onClick={onOpenNewPatient}
              className="px-3 py-1.5 bg-teal-600 hover:bg-teal-500 text-white rounded-xl text-xs font-semibold shrink-0 transition-colors"
            >
              + New
            </button>
          </div>
        </div>

        {/* Patients Table (Desktop & Tablet) */}
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-100/70 border-b border-slate-200 text-[11px] font-bold text-slate-600 uppercase tracking-wider">
                <th className="py-3 px-4">Patient Name</th>
                <th className="py-3 px-3">Age</th>
                <th className="py-3 px-3">Sex</th>
                <th className="py-3 px-4">Mobile No.</th>
                <th className="py-3 px-4">BP (mmHg)</th>
                <th className="py-3 px-4">RBS (mg/dL)</th>
                <th className="py-3 px-4">Weight</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 text-slate-800">
              {filteredPatients.map((p) => {
                const isSelected = selectedPatient?.id === p.id;
                const isBpHigh = p.vitals.bpSystolic >= 140 || p.vitals.bpDiastolic >= 90;
                const isRbsHigh = p.vitals.rbs >= 140;

                return (
                  <tr
                    key={p.id}
                    className={`transition-colors ${
                      isSelected
                        ? 'bg-teal-50/80 font-medium'
                        : 'hover:bg-slate-50'
                    }`}
                  >
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold shrink-0 ${
                          isSelected ? 'bg-teal-700 text-white' : 'bg-slate-200 text-slate-700'
                        }`}>
                          {p.name.charAt(0)}
                        </div>
                        <div>
                          <div className="font-bold text-slate-900 text-xs flex items-center gap-1.5">
                            {p.name}
                            {isSelected && (
                              <span className="px-1.5 py-0.2 rounded text-[9px] font-bold bg-teal-600 text-white">
                                Active
                              </span>
                            )}
                          </div>
                          <div className="text-[11px] text-slate-500">{p.id} • {p.bloodGroup}</div>
                        </div>
                      </div>
                    </td>

                    <td className="py-3 px-3">
                      <span className="font-semibold text-slate-800">{p.age} yrs</span>
                    </td>

                    <td className="py-3 px-3">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        p.gender === 'Female' ? 'bg-rose-50 text-rose-700' : 'bg-blue-50 text-blue-700'
                      }`}>
                        {p.gender}
                      </span>
                    </td>

                    <td className="py-3 px-4">
                      <div className="flex items-center gap-1 font-mono text-slate-700">
                        <Phone className="w-3 h-3 text-slate-400" />
                        <span>{p.mobile}</span>
                      </div>
                    </td>

                    <td className="py-3 px-4">
                      <span className={`px-2 py-1 rounded-md text-[11px] font-bold ${
                        isBpHigh
                          ? 'bg-amber-100 text-amber-900 border border-amber-300'
                          : 'bg-emerald-50 text-emerald-900 border border-emerald-200'
                      }`}>
                        {p.vitals.bpSystolic}/{p.vitals.bpDiastolic}
                      </span>
                    </td>

                    <td className="py-3 px-4">
                      <span className={`px-2 py-1 rounded-md text-[11px] font-bold ${
                        isRbsHigh
                          ? 'bg-amber-100 text-amber-900 border border-amber-300'
                          : 'bg-slate-100 text-slate-800 border border-slate-200'
                      }`}>
                        {p.vitals.rbs} mg/dL
                      </span>
                    </td>

                    <td className="py-3 px-4">
                      <span className="font-bold text-slate-800">
                        {p.vitals.weight} kg
                      </span>
                    </td>

                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => selectPatient(p.id)}
                          className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                            isSelected
                              ? 'bg-teal-700 text-white'
                              : 'bg-slate-100 hover:bg-teal-600 hover:text-white text-slate-700'
                          }`}
                        >
                          {isSelected ? 'Selected' : 'Select'}
                        </button>
                        <button
                          onClick={() => {
                            selectPatient(p.id);
                            setActiveTab('case_taking');
                          }}
                          className="px-2.5 py-1.5 rounded-lg bg-teal-50 hover:bg-teal-100 text-teal-800 font-semibold text-xs transition-colors"
                          title="Open Case Taking"
                        >
                          Case
                        </button>
                        <button
                          onClick={() => {
                            selectPatient(p.id);
                            setActiveTab('prescription');
                          }}
                          className="px-2.5 py-1.5 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-800 font-semibold text-xs transition-colors"
                          title="Generate Prescription"
                        >
                          Rx
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Patients Cards (Mobile view) */}
        <div className="block md:hidden divide-y divide-slate-200">
          {filteredPatients.map((p) => {
            const isSelected = selectedPatient?.id === p.id;
            return (
              <div
                key={p.id}
                className={`p-4 space-y-3 ${isSelected ? 'bg-teal-50/50' : 'bg-white'}`}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-bold text-slate-900 text-sm">{p.name}</h3>
                    <p className="text-xs text-slate-500">{p.age} yrs • {p.gender} • {p.id}</p>
                  </div>
                  <button
                    onClick={() => selectPatient(p.id)}
                    className={`px-3 py-1 rounded-lg text-xs font-bold ${
                      isSelected ? 'bg-teal-700 text-white' : 'bg-slate-100 text-slate-700'
                    }`}
                  >
                    {isSelected ? 'Selected' : 'Select'}
                  </button>
                </div>

                <div className="text-xs text-slate-600 flex items-center gap-1.5">
                  <Phone className="w-3.5 h-3.5 text-slate-400" />
                  <span>{p.mobile}</span>
                </div>

                {/* Vitals Grid: BP, RBS, Weight */}
                <div className="grid grid-cols-3 gap-2 text-center text-[11px] bg-slate-50 p-2.5 rounded-xl border border-slate-200/60">
                  <div>
                    <div className="text-slate-400 text-[10px] uppercase font-semibold">BP</div>
                    <div className="font-bold text-slate-900">{p.vitals.bpSystolic}/{p.vitals.bpDiastolic}</div>
                  </div>
                  <div>
                    <div className="text-slate-400 text-[10px] uppercase font-semibold">RBS</div>
                    <div className="font-bold text-slate-900">{p.vitals.rbs} mg/dL</div>
                  </div>
                  <div>
                    <div className="text-slate-400 text-[10px] uppercase font-semibold">Weight</div>
                    <div className="font-bold text-slate-900">{p.vitals.weight} kg</div>
                  </div>
                </div>

                <div className="flex items-center gap-2 pt-1">
                  <button
                    onClick={() => {
                      selectPatient(p.id);
                      setActiveTab('case_taking');
                    }}
                    className="flex-1 py-1.5 text-center bg-teal-600 text-white rounded-lg text-xs font-semibold"
                  >
                    Case Taking
                  </button>
                  <button
                    onClick={() => {
                      selectPatient(p.id);
                      setActiveTab('prescription');
                    }}
                    className="flex-1 py-1.5 text-center bg-emerald-600 text-white rounded-lg text-xs font-semibold"
                  >
                    Prescription
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Selected Patient Vitals & Workflow Pipeline */}
      {selectedPatient && (
        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-3">
            <div>
              <div className="text-[11px] font-bold uppercase tracking-wider text-teal-700">
                Active Patient Profile
              </div>
              <h3 className="text-lg font-bold text-slate-900">
                {selectedPatient.name}{' '}
                <span className="text-xs font-normal text-slate-500">
                  ({selectedPatient.age} yrs, {selectedPatient.gender} • ID: {selectedPatient.id})
                </span>
              </h3>
            </div>
            <div className="flex items-center gap-2 text-xs">
              <span className="text-slate-500 font-medium">Mobile:</span>
              <strong className="text-slate-800">{selectedPatient.mobile}</strong>
            </div>
          </div>

          {/* Vitals Ribbon: BP, RBS, Weight, Pulse */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="p-3 bg-teal-50/60 rounded-xl border border-teal-100 flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-teal-600 text-white flex items-center justify-center shrink-0">
                <Gauge className="w-5 h-5" />
              </div>
              <div>
                <span className="text-[10px] font-bold uppercase text-teal-700 block">Blood Pressure (BP)</span>
                <span className="text-base font-bold text-slate-900">
                  {selectedPatient.vitals.bpSystolic}/{selectedPatient.vitals.bpDiastolic} <span className="text-xs font-normal text-slate-500">mmHg</span>
                </span>
              </div>
            </div>

            <div className="p-3 bg-amber-50/60 rounded-xl border border-amber-100 flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-amber-500 text-white flex items-center justify-center shrink-0">
                <Droplet className="w-5 h-5" />
              </div>
              <div>
                <span className="text-[10px] font-bold uppercase text-amber-700 block">Blood Sugar (RBS)</span>
                <span className="text-base font-bold text-slate-900">
                  {selectedPatient.vitals.rbs} <span className="text-xs font-normal text-slate-500">mg/dL</span>
                </span>
              </div>
            </div>

            <div className="p-3 bg-indigo-50/60 rounded-xl border border-indigo-100 flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-indigo-600 text-white flex items-center justify-center shrink-0">
                <Scale className="w-5 h-5" />
              </div>
              <div>
                <span className="text-[10px] font-bold uppercase text-indigo-700 block">Weight</span>
                <span className="text-base font-bold text-slate-900">
                  {selectedPatient.vitals.weight} <span className="text-xs font-normal text-slate-500">kg</span>
                </span>
              </div>
            </div>

            <div className="p-3 bg-rose-50/60 rounded-xl border border-rose-100 flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-rose-500 text-white flex items-center justify-center shrink-0">
                <Heart className="w-5 h-5" />
              </div>
              <div>
                <span className="text-[10px] font-bold uppercase text-rose-700 block">Pulse / SpO2</span>
                <span className="text-base font-bold text-slate-900">
                  {selectedPatient.vitals.pulse} <span className="text-xs font-normal text-slate-500">bpm / {selectedPatient.vitals.spo2}%</span>
                </span>
              </div>
            </div>
          </div>

          {/* 1-Click Workflow Navigation */}
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 pt-2">
            <button
              onClick={() => setActiveTab('case_taking')}
              className="p-3 rounded-xl bg-teal-50 hover:bg-teal-100/80 border border-teal-200 text-left transition-colors"
            >
              <div className="text-[11px] font-bold text-teal-900 flex items-center justify-between">
                <span>1. Case Taking</span>
                <ClipboardList className="w-4 h-4 text-teal-600" />
              </div>
              <div className="text-xs text-slate-600 mt-1">{patientForms.length} Forms Saved</div>
            </button>

            <button
              onClick={() => setActiveTab('case_summary')}
              className="p-3 rounded-xl bg-slate-50 hover:bg-slate-100 border border-slate-200 text-left transition-colors"
            >
              <div className="text-[11px] font-bold text-slate-800 flex items-center justify-between">
                <span>2. Summary</span>
                <FileCheck2 className="w-4 h-4 text-slate-600" />
              </div>
              <div className="text-xs text-slate-600 mt-1">Totality of Symptoms</div>
            </button>

            <button
              onClick={() => setActiveTab('repertorisation')}
              className="p-3 rounded-xl bg-indigo-50 hover:bg-indigo-100/80 border border-indigo-200 text-left transition-colors"
            >
              <div className="text-[11px] font-bold text-indigo-900 flex items-center justify-between">
                <span>3. Repertory</span>
                <GitBranch className="w-4 h-4 text-indigo-600" />
              </div>
              <div className="text-xs text-slate-600 mt-1">Kent / Boericke</div>
            </button>

            <button
              onClick={() => setActiveTab('prescription')}
              className="p-3 rounded-xl bg-emerald-50 hover:bg-emerald-100/80 border border-emerald-200 text-left transition-colors"
            >
              <div className="text-[11px] font-bold text-emerald-900 flex items-center justify-between">
                <span>4. Prescription</span>
                <Pill className="w-4 h-4 text-emerald-600" />
              </div>
              <div className="text-xs text-slate-600 mt-1">Homeo + Allopathy</div>
            </button>

            <button
              onClick={() => setActiveTab('follow_up')}
              className="p-3 rounded-xl bg-amber-50 hover:bg-amber-100/80 border border-amber-200 text-left transition-colors"
            >
              <div className="text-[11px] font-bold text-amber-900 flex items-center justify-between">
                <span>5. Follow-up</span>
                <Clock className="w-4 h-4 text-amber-600" />
              </div>
              <div className="text-xs text-slate-600 mt-1">Track Progress</div>
            </button>
          </div>
        </div>
      )}

      {/* 2-Column: Quick Appointments Queue & System-Wise Forms Launchpad */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Today's Appointments */}
        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-bold text-slate-900 text-sm flex items-center gap-1.5">
                <Calendar className="w-4 h-4 text-teal-600" />
                Today's Appointments Queue
              </h3>
              <p className="text-[11px] text-slate-500">Live patient consultation schedule</p>
            </div>
            <button
              onClick={() => setActiveTab('appointments')}
              className="text-xs font-semibold text-teal-700 hover:text-teal-800"
            >
              View All ({appointments.length})
            </button>
          </div>

          <div className="space-y-2">
            {appointments.slice(0, 4).map((apt) => (
              <div
                key={apt.id}
                className="p-3 rounded-xl border border-slate-200 bg-slate-50/70 hover:bg-white transition-colors flex items-center justify-between gap-3"
              >
                <div>
                  <div className="font-bold text-slate-900 text-xs">{apt.patientName}</div>
                  <div className="text-[11px] text-slate-500">
                    {apt.timeSlot} • {apt.patientMobile} • {apt.type}
                  </div>
                </div>

                <div className="flex items-center gap-1.5">
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                    apt.status === 'Waiting'
                      ? 'bg-amber-100 text-amber-800'
                      : apt.status === 'In-Consultation'
                      ? 'bg-indigo-100 text-indigo-800'
                      : apt.status === 'Completed'
                      ? 'bg-emerald-100 text-emerald-800'
                      : 'bg-slate-100 text-slate-700'
                  }`}>
                    {apt.status}
                  </span>
                  <button
                    onClick={() => {
                      selectPatient(apt.patientId);
                      setActiveTab('case_taking');
                    }}
                    className="px-2 py-1 rounded bg-teal-600 hover:bg-teal-500 text-white text-[11px] font-medium transition-colors"
                  >
                    Open
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* 9 Clinical Systems Quick Case Taking */}
        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-bold text-slate-900 text-sm flex items-center gap-1.5">
                <ClipboardList className="w-4 h-4 text-teal-600" />
                9-System Case Taking Forms
              </h3>
              <p className="text-[11px] text-slate-500">Select system to record symptoms</p>
            </div>
            <button
              onClick={() => setActiveTab('case_taking')}
              className="text-xs font-semibold text-teal-700 hover:text-teal-800"
            >
              Open Full →
            </button>
          </div>

          <div className="grid grid-cols-3 gap-2 text-xs">
            {[
              { key: 'headache', label: 'Headache' },
              { key: 'skin_hair', label: 'Skin & Hair' },
              { key: 'gastrointestinal', label: 'Gastro' },
              { key: 'urinary', label: 'Urinary' },
              { key: 'musculoskeletal', label: 'Musculoskeletal' },
              { key: 'respiratory', label: 'Respiratory' },
              { key: 'female_gynae', label: 'Gynecology' },
              { key: 'pediatric', label: 'Pediatric' },
              { key: 'other_mind_generals', label: 'Mind & Generals' }
            ].map((sys) => {
              const isDone = selectedPatient && systemForms.some(
                f => f.patientId === selectedPatient.id && f.system === sys.key
              );

              return (
                <button
                  key={sys.key}
                  onClick={() => {
                    setActiveTab('case_taking');
                    setActiveSystemFormKey(sys.key as ClinicalSystemKey);
                  }}
                  className={`p-2.5 rounded-xl border text-left transition-colors flex flex-col justify-between ${
                    isDone
                      ? 'bg-emerald-50/80 border-emerald-300 text-emerald-900'
                      : 'bg-slate-50/60 hover:bg-teal-50/50 border-slate-200 text-slate-800'
                  }`}
                >
                  <span className="font-bold text-[11px] truncate block">{sys.label}</span>
                  <span className="text-[10px] text-slate-500 mt-1 block">
                    {isDone ? '✓ Recorded' : 'Enter data'}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
