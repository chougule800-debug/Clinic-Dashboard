import React from 'react';
import { useClinic } from '../../context/ClinicContext';
import {
  BarChart3,
  TrendingUp,
  PieChart,
  ShieldCheck,
  Users,
  Activity,
  Award,
  CheckCircle2,
  FileCheck2,
  Share2
} from 'lucide-react';

export const ReportsView: React.FC = () => {
  const { patients, systemForms, prescriptions, appointments } = useClinic();

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
    if (systemCounts[f.system] !== undefined) {
      systemCounts[f.system] += 1;
    }
  });

  const vitalsRecordedCount = patients.filter(p => !!p.vitals && p.vitals.bpSystolic > 0).length;
  const vitalsRecordedPct = patients.length > 0 ? Math.round((vitalsRecordedCount / patients.length) * 100) : 100;
  const remoteIntakeCount = systemForms.filter(f => f.submittedVia === 'WhatsApp_Remote_Intake').length;

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 font-serif flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-teal-700" />
            Clinical Practice Analytics & Reports
          </h2>
          <p className="text-xs text-slate-500">
            Systemic epidemiology, remedy prescription frequencies, baseline vitals tracking, and OPD trends.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="px-3 py-1.5 rounded-xl bg-teal-50 text-teal-800 text-xs font-bold border border-teal-200 flex items-center gap-1.5">
            <Activity className="w-4 h-4 text-teal-600" />
            Vitals Recorded: {vitalsRecordedPct}%
          </span>
        </div>
      </div>

      {/* KPI Cards Strip */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <div className="text-[10px] uppercase font-bold text-slate-400">Total Encounters</div>
          <div className="text-2xl font-bold text-slate-900 mt-1">{appointments.length + systemForms.length}</div>
          <div className="text-[11px] text-teal-600 mt-0.5">Across All OPDs</div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <div className="text-[10px] uppercase font-bold text-slate-400">Vitals Monitored</div>
          <div className="text-2xl font-bold text-teal-700 mt-1">{vitalsRecordedCount} / {patients.length}</div>
          <div className="text-[11px] text-teal-600 mt-0.5">{vitalsRecordedPct}% complete vitals</div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <div className="text-[10px] uppercase font-bold text-slate-400">WhatsApp Intake Submissions</div>
          <div className="text-2xl font-bold text-indigo-700 mt-1">{remoteIntakeCount}</div>
          <div className="text-[11px] text-indigo-600 mt-0.5">Patient self-service</div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <div className="text-[10px] uppercase font-bold text-slate-400">Prescriptions Issued</div>
          <div className="text-2xl font-bold text-slate-900 mt-1">{prescriptions.length}</div>
          <div className="text-[11px] text-slate-500 mt-0.5">Homeo + Allopathic</div>
        </div>
      </div>

      {/* Analytics Charts Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* System Distribution */}
        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-4">
          <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
            <Activity className="w-4 h-4 text-teal-600" />
            System-Wise Morbidity Distribution (9 Systems)
          </h3>

          <div className="space-y-2.5 text-xs">
            {Object.entries(systemCounts).map(([sys, count]) => {
              const maxVal = Math.max(...Object.values(systemCounts), 1);
              const pct = (count / maxVal) * 100;

              return (
                <div key={sys} className="space-y-1">
                  <div className="flex justify-between text-slate-700 font-medium">
                    <span className="capitalize">{sys.replace('_', ' ')}</span>
                    <span className="font-bold">{count} cases</span>
                  </div>
                  <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                    <div
                      className="bg-teal-600 h-full rounded-full transition-all duration-500"
                      style={{ width: `${Math.max(pct, count > 0 ? 15 : 2)}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Top Similimum & Remedies Prescribed */}
        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-4">
          <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
            <Award className="w-4 h-4 text-amber-500" />
            Top Classical Homeopathic Similimum Ranking
          </h3>

          <div className="space-y-3 text-xs">
            {[
              { name: 'Natrum Muriaticum', count: 18, pct: 85, keynote: 'Sun headaches, silent grief, salt craving' },
              { name: 'Sulphur', count: 15, pct: 72, keynote: 'Skin itching heat of bed, standing worse' },
              { name: 'Lycopodium Clavatum', count: 14, pct: 68, keynote: '4-8 PM aggravation, bloating, warm drinks' },
              { name: 'Bryonia Alba', count: 11, pct: 54, keynote: 'Worse motion, ameliorated by hard pressure' },
              { name: 'Nux Vomica', count: 9, pct: 45, keynote: 'Sedentary, spicy cravings, ineffectual urging' },
              { name: 'Rhus Toxicodendron', count: 8, pct: 40, keynote: 'Restlessness, worse first movement' }
            ].map((remedy, idx) => (
              <div key={remedy.name} className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                <div className="flex justify-between items-center mb-1">
                  <span className="font-bold text-slate-900">
                    #{idx + 1} {remedy.name}
                  </span>
                  <span className="font-mono font-bold text-indigo-700">{remedy.count} rx</span>
                </div>
                <div className="w-full bg-slate-200 rounded-full h-1.5 mb-1.5 overflow-hidden">
                  <div
                    className="bg-indigo-600 h-full rounded-full"
                    style={{ width: `${remedy.pct}%` }}
                  />
                </div>
                <p className="text-[11px] text-slate-500 italic">
                  Keynote: {remedy.keynote}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
