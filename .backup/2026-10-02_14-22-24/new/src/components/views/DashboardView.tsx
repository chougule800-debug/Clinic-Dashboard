import React from 'react';
import { useClinic } from '../../context/ClinicContext';
import { CLINIC_CONFIG } from '../../config/clinicConfig';
import type { ClinicalSystemKey } from '../../types';
import { Users, Calendar, ClipboardList, GitBranch, Pill, MessageSquare, Share2, FileCheck2, Clock, ArrowRight, Activity, Plus, Gauge, Droplet, Scale, Heart } from 'lucide-react';

interface DashboardViewProps {
  onOpenNewPatient: () => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({ onOpenNewPatient }) => {
  const { patients, selectedPatient, systemForms, prescriptions, appointments, conversations, setActiveTab, setActiveSystemFormKey, selectPatient } = useClinic();

  const todayAppointments = appointments.filter(a => a.status !== 'Completed' && a.status !== 'Cancelled');
  const remoteIntakes = systemForms.filter(f => f.submittedVia === 'WhatsApp_Remote_Intake');
  const unreadMessages = conversations.reduce((acc, c) => acc + c.unreadCount, 0);
  const patientForms = selectedPatient ? systemForms.filter(f => f.patientId === selectedPatient.id) : [];

  return (
    <div className="space-y-6 pb-12">
      <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-teal-700 font-bold text-xs tracking-wider uppercase flex items-center gap-1.5">
              <Activity className="w-4 h-4 text-teal-600" />Clinical Dashboard
            </span>
            <span className="text-slate-300">•</span>
            <span className="text-slate-500 text-xs font-medium">
              {new Date().toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'short', year: 'numeric' })}
            </span>
          </div>
          <h1 className="text-2xl font-bold text-slate-900 font-serif">Welcome, {CLINIC_CONFIG.doctorName}</h1>
          <p className="text-slate-500 text-xs mt-1 max-w-2xl leading-relaxed">
            {CLINIC_CONFIG.appName}
            {CLINIC_CONFIG.qualifications && ` • ${CLINIC_CONFIG.qualifications}`}
            {CLINIC_CONFIG.regNo && ` • Reg. ${CLINIC_CONFIG.regNo}`}
          </p>
        </div>
        <div className="flex items-center gap-2 flex-wrap shrink-0">
          <button onClick={onOpenNewPatient} className="px-4 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-500 text-white font-semibold text-xs transition-colors flex items-center gap-2 shadow-xs">
            <Plus className="w-4 h-4" /><span>Register New Patient</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex items-center justify-between">
          <div>
            <div className="text-[11px] font-semibold uppercase text-slate-500 tracking-wider">Patients</div>
            <div className="text-2xl font-bold text-slate-900 mt-1">{patients.length}</div>
          </div>
          <div className="w-10 h-10 rounded-xl bg-teal-50 text-teal-700 flex items-center justify-center"><Users className="w-5 h-5" /></div>
        </div>
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex items-center justify-between">
          <div>
            <div className="text-[11px] font-semibold uppercase text-slate-500 tracking-wider">Today's Appointments</div>
            <div className="text-2xl font-bold text-slate-900 mt-1">{todayAppointments.length}</div>
          </div>
          <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-700 flex items-center justify-center"><Calendar className="w-5 h-5" /></div>
        </div>
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex items-center justify-between">
          <div>
            <div className="text-[11px] font-semibold uppercase text-slate-500 tracking-wider">WhatsApp Submissions</div>
            <div className="text-2xl font-bold text-emerald-700 mt-1">{remoteIntakes.length}</div>
          </div>
          <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center"><Share2 className="w-5 h-5" /></div>
        </div>
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex items-center justify-between">
          <div>
            <div className="text-[11px] font-semibold uppercase text-slate-500 tracking-wider">Unread Messages</div>
            <div className="text-2xl font-bold text-slate-900 mt-1">{unreadMessages}</div>
          </div>
          <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-700 flex items-center justify-center"><MessageSquare className="w-5 h-5" /></div>
        </div>
      </div>

      {patients.length === 0 && (
        <div className="p-10 text-center bg-white rounded-2xl border-2 border-dashed border-slate-200 space-y-3">
          <Users className="w-12 h-12 text-slate-300 mx-auto" />
          <h2 className="font-bold text-slate-800 text-lg">Welcome to your clinic!</h2>
          <p className="text-xs text-slate-500 max-w-md mx-auto">Register your first patient to begin case taking, prescriptions, and billing.</p>
          <button onClick={onOpenNewPatient} className="mt-2 px-5 py-2.5 bg-teal-600 hover:bg-teal-500 text-white rounded-xl text-xs font-bold">+ Register First Patient</button>
        </div>
      )}

      {selectedPatient && (
        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-3">
            <div>
              <div className="text-[11px] font-bold uppercase tracking-wider text-teal-700">Active Patient</div>
              <h3 className="text-lg font-bold text-slate-900">
                {selectedPatient.name}{' '}
                <span className="text-xs font-normal text-slate-500">
                  ({selectedPatient.age} yrs, {selectedPatient.gender}{selectedPatient.patientCode && ` • ${selectedPatient.patientCode}`})
                </span>
              </h3>
            </div>
            {selectedPatient.mobile && (
              <div className="text-xs text-slate-500">Mobile: <strong className="text-slate-800">{selectedPatient.mobile}</strong></div>
            )}
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="p-3 bg-teal-50/60 rounded-xl border border-teal-100 flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-teal-600 text-white flex items-center justify-center shrink-0"><Gauge className="w-5 h-5" /></div>
              <div>
                <span className="text-[10px] font-bold uppercase text-teal-700 block">Blood Pressure</span>
                <span className="text-base font-bold text-slate-900">{selectedPatient.vitals.bpSystolic || '-'}/{selectedPatient.vitals.bpDiastolic || '-'}</span>
              </div>
            </div>
            <div className="p-3 bg-amber-50/60 rounded-xl border border-amber-100 flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-amber-500 text-white flex items-center justify-center shrink-0"><Droplet className="w-5 h-5" /></div>
              <div>
                <span className="text-[10px] font-bold uppercase text-amber-700 block">Blood Sugar</span>
                <span className="text-base font-bold text-slate-900">{selectedPatient.vitals.rbs || '-'}</span>
              </div>
            </div>
            <div className="p-3 bg-indigo-50/60 rounded-xl border border-indigo-100 flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-indigo-600 text-white flex items-center justify-center shrink-0"><Scale className="w-5 h-5" /></div>
              <div>
                <span className="text-[10px] font-bold uppercase text-indigo-700 block">Weight</span>
                <span className="text-base font-bold text-slate-900">{selectedPatient.vitals.weight || '-'} kg</span>
              </div>
            </div>
            <div className="p-3 bg-rose-50/60 rounded-xl border border-rose-100 flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-rose-500 text-white flex items-center justify-center shrink-0"><Heart className="w-5 h-5" /></div>
              <div>
                <span className="text-[10px] font-bold uppercase text-rose-700 block">Pulse / SpO₂</span>
                <span className="text-base font-bold text-slate-900">{selectedPatient.vitals.pulse || '-'} / {selectedPatient.vitals.spo2 || '-'}%</span>
              </div>
            </div>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 pt-2">
            <button onClick={() => setActiveTab('case_taking')} className="p-3 rounded-xl bg-teal-50 hover:bg-teal-100/80 border border-teal-200 text-left transition-colors">
              <div className="text-[11px] font-bold text-teal-900 flex items-center justify-between"><span>1. Case Taking</span><ClipboardList className="w-4 h-4 text-teal-600" /></div>
              <div className="text-xs text-slate-600 mt-1">{patientForms.length} forms</div>
            </button>
            <button onClick={() => setActiveTab('case_summary')} className="p-3 rounded-xl bg-slate-50 hover:bg-slate-100 border border-slate-200 text-left transition-colors">
              <div className="text-[11px] font-bold text-slate-800 flex items-center justify-between"><span>2. Summary</span><FileCheck2 className="w-4 h-4 text-slate-600" /></div>
              <div className="text-xs text-slate-600 mt-1">Totality</div>
            </button>
            <button onClick={() => setActiveTab('repertorisation')} className="p-3 rounded-xl bg-indigo-50 hover:bg-indigo-100/80 border border-indigo-200 text-left transition-colors">
              <div className="text-[11px] font-bold text-indigo-900 flex items-center justify-between"><span>3. Repertory</span><GitBranch className="w-4 h-4 text-indigo-600" /></div>
              <div className="text-xs text-slate-600 mt-1">Kent / Boericke</div>
            </button>
            <button onClick={() => setActiveTab('prescription')} className="p-3 rounded-xl bg-emerald-50 hover:bg-emerald-100/80 border border-emerald-200 text-left transition-colors">
              <div className="text-[11px] font-bold text-emerald-900 flex items-center justify-between"><span>4. Prescription</span><Pill className="w-4 h-4 text-emerald-600" /></div>
              <div className="text-xs text-slate-600 mt-1">Homeo + Allo</div>
            </button>
            <button onClick={() => setActiveTab('follow_up')} className="p-3 rounded-xl bg-amber-50 hover:bg-amber-100/80 border border-amber-200 text-left transition-colors">
              <div className="text-[11px] font-bold text-amber-900 flex items-center justify-between"><span>5. Follow-up</span><Clock className="w-4 h-4 text-amber-600" /></div>
              <div className="text-xs text-slate-600 mt-1">Progress</div>
            </button>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-bold text-slate-900 text-sm flex items-center gap-1.5">
                <Calendar className="w-4 h-4 text-teal-600" />Today's Appointments
              </h3>
            </div>
            <button onClick={() => setActiveTab('appointments')} className="text-xs font-semibold text-teal-700 hover:text-teal-800">View All ({appointments.length})</button>
          </div>
          {appointments.length === 0 ? (
            <div className="p-6 text-center text-xs text-slate-400">No appointments scheduled.</div>
          ) : (
            <div className="space-y-2">
              {appointments.slice(0, 4).map(apt => (
                <div key={apt.id} className="p-3 rounded-xl border border-slate-200 bg-slate-50/70 flex items-center justify-between gap-3">
                  <div>
                    <div className="font-bold text-slate-900 text-xs">{apt.patientName}</div>
                    <div className="text-[11px] text-slate-500">{apt.timeSlot} • {apt.type}</div>
                  </div>
                  <button onClick={() => { selectPatient(apt.patientId); setActiveTab('case_taking'); }} className="px-2 py-1 rounded bg-teal-600 hover:bg-teal-500 text-white text-[11px] font-medium">Open</button>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-bold text-slate-900 text-sm flex items-center gap-1.5">
                <ClipboardList className="w-4 h-4 text-teal-600" />Clinical Systems
              </h3>
            </div>
            <button onClick={() => setActiveTab('case_taking')} className="text-xs font-semibold text-teal-700 hover:text-teal-800">Open →</button>
          </div>
          <div className="grid grid-cols-3 gap-2 text-xs">
            {[
              { key: 'headache' as ClinicalSystemKey, label: 'Headache' },
              { key: 'skin_hair' as ClinicalSystemKey, label: 'Skin & Hair' },
              { key: 'gastrointestinal' as ClinicalSystemKey, label: 'Gastro' },
              { key: 'urinary' as ClinicalSystemKey, label: 'Urinary' },
              { key: 'musculoskeletal' as ClinicalSystemKey, label: 'MSK' },
              { key: 'respiratory' as ClinicalSystemKey, label: 'Respiratory' },
              { key: 'female_gynae' as ClinicalSystemKey, label: 'Gynae' },
              { key: 'pediatric' as ClinicalSystemKey, label: 'Pediatric' },
              { key: 'other_mind_generals' as ClinicalSystemKey, label: 'Mind' }
            ].map(sys => {
              const done = selectedPatient && systemForms.some(f => f.patientId === selectedPatient.id && f.system === sys.key);
              return (
                <button
                  key={sys.key}
                  onClick={() => { setActiveTab('case_taking'); setActiveSystemFormKey(sys.key); }}
                  className={`p-2.5 rounded-xl border text-left transition-colors ${
                    done ? 'bg-emerald-50/80 border-emerald-300 text-emerald-900' : 'bg-slate-50/60 hover:bg-teal-50/50 border-slate-200 text-slate-800'
                  }`}
                >
                  <span className="font-bold text-[11px] block truncate">{sys.label}</span>
                  <span className="text-[10px] text-slate-500 mt-0.5 block">{done ? 'Recorded' : 'Enter'}</span>
                </button>
              );
            })}
          </div>
        </div>
      </div>
      <span className="hidden"><ArrowRight /></span>
    </div>
  );
};