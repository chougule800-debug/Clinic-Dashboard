import React from 'react';
import { useClinic } from '../../context/ClinicContext';
import {
  BarChart3,
  Activity,
  Users,
  Award
} from 'lucide-react';

export const ReportsView: React.FC = () => {
  const { patients, systemForms, prescriptions, appointments, conversations } = useClinic();

  const systemCounts: Record<string, number> = {
    headache: 0,
    skin_hair: 0,
    gastrointestinal: 0,
    urinary: 0,
    musculoskeletal: 0,
    respiratory: 0,
    female_gynae: 0,
    pediatric: 0,
    other_mind_generals: 0
  };

  systemForms.forEach(f => {
    if (systemCounts[f.system] !== undefined) systemCounts[f.system] += 1;
  });

  const vitalsCount = patients.filter(
    p => p.vitals && (p.vitals.bpSystolic || 0) > 0
  ).length;
  const vitalsPct = patients.length > 0 ? Math.round((vitalsCount / patients.length) * 100) : 0;
  const remoteCount = systemForms.filter(f => f.submittedVia === 'WhatsApp_Remote_Intake').length;

  return (
    <div className="space-y-6 pb-12">
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 font-serif flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-teal-700" />
            Practice Analytics
          </h2>
          <p className="text-xs text-slate-500">
            Live counts based on your clinic's records.
          </p>
        </div>
      </div>

      {patients.length === 0 ? (
        <div className="p-10 text-center bg-white rounded-2xl border-2 border-dashed border-slate-200">
          <BarChart3 className="w-10 h-10 text-slate-300 mx-auto mb-2" />
          <h3 className="font-bold text-slate-700 text-sm">No data yet</h3>
          <p className="text-xs text-slate-500">Analytics will appear once records exist.</p>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
              <div className="text-[10px] uppercase font-bold text-slate-400">
                Total Encounters
              </div>
              <div className="text-2xl font-bold text-slate-900 mt-1">
                {appointments.length + systemForms.length}
              </div>
            </div>

            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
              <div className="text-[10px] uppercase font-bold text-slate-400">
                Vitals Monitored
              </div>
              <div className="text-2xl font-bold text-teal-700 mt-1">
                {vitalsCount}/{patients.length}
              </div>
              <div className="text-[11px] text-teal-600 mt-0.5">{vitalsPct}% complete</div>
            </div>

            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
              <div className="text-[10px] uppercase font-bold text-slate-400">
                WhatsApp Intake
              </div>
              <div className="text-2xl font-bold text-indigo-700 mt-1">{remoteCount}</div>
            </div>

            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
              <div className="text-[10px] uppercase font-bold text-slate-400">
                Prescriptions
              </div>
              <div className="text-2xl font-bold text-slate-900 mt-1">
                {prescriptions.length}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-4">
              <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                <Activity className="w-4 h-4 text-teal-600" />
                System-Wise Case Distribution
              </h3>

              <div className="space-y-2.5 text-xs">
                {Object.entries(systemCounts).map(([sys, count]) => {
                  const maxVal = Math.max(...Object.values(systemCounts), 1);
                  const pct = (count / maxVal) * 100;
                  return (
                    <div key={sys} className="space-y-1">
                      <div className="flex justify-between text-slate-700 font-medium">
                        <span className="capitalize">{sys.replace(/_/g, ' ')}</span>
                        <span className="font-bold">{count}</span>
                      </div>
                      <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                        <div
                          className="bg-teal-600 h-full rounded-full transition-all"
                          style={{ width: `${Math.max(pct, count > 0 ? 15 : 2)}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-4">
              <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                <Award className="w-4 h-4 text-amber-500" />
                Clinic Activity
              </h3>

              <div className="space-y-3 text-xs">
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between">
                  <span className="flex items-center gap-2 text-slate-700">
                    <Users className="w-4 h-4 text-teal-600" />
                    Patients Registered
                  </span>
                  <strong className="text-slate-900">{patients.length}</strong>
                </div>

                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between">
                  <span className="flex items-center gap-2 text-slate-700">
                    <Activity className="w-4 h-4 text-indigo-600" />
                    System Forms Recorded
                  </span>
                  <strong className="text-slate-900">{systemForms.length}</strong>
                </div>

                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between">
                  <span className="flex items-center gap-2 text-slate-700">
                    <Award className="w-4 h-4 text-amber-600" />
                    WhatsApp Conversations
                  </span>
                  <strong className="text-slate-900">{conversations.length}</strong>
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};