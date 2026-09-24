import React from 'react';
import { SystemFormRecord, Patient } from '../../types';
import { useClinic } from '../../context/ClinicContext';
import {
  HeartHandshake,
  Edit3,
  Share2,
  Calendar,
  Activity,
  Baby,
  FileText
} from 'lucide-react';

interface FemaleGynaeSummaryCardProps {
  record: SystemFormRecord;
  patient?: Patient;
}

export const FemaleGynaeSummaryCard: React.FC<FemaleGynaeSummaryCardProps> = ({ record, patient }) => {
  const { setActiveTab, setActiveSystemFormKey, openWhatsAppShareDialog } = useClinic();
  const data = record.data || {};

  const handleEditCase = () => {
    setActiveSystemFormKey('female_gynae');
    setActiveTab('case_taking');
  };

  const mfeatures = Array.isArray(data.mfeatures) ? data.mfeatures : [];
  const pains = Array.isArray(data.pain) ? data.pain : [];
  const gynSymptoms = Array.isArray(data.gyn) ? data.gyn : [];
  const pregnancies = Array.isArray(data.pregnancies) ? data.pregnancies : [];
  const fertilityTreatments = Array.isArray(data.fertility) ? data.fertility : [];
  const investigations = Array.isArray(data.investigation) ? data.investigation : [];
  const reportFiles = Array.isArray(data.reportFiles) ? data.reportFiles : [];

  return (
    <div className="rounded-2xl border-2 border-pink-500/30 bg-white p-6 shadow-sm space-y-6 text-xs text-slate-800">
      {/* Top Banner / Case Title */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 border-b border-pink-100 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-1 rounded-md bg-pink-100/80 text-pink-800 text-[10px] font-bold uppercase tracking-wider flex items-center gap-1">
              <HeartHandshake className="w-3 h-3 text-pink-700" />
              Female & Gynecological Record
            </span>
            <span className="text-slate-300">•</span>
            <span className="text-slate-600 font-medium text-xs">
              Patient: <strong className="text-slate-900">{patient?.name || data.patientName || 'Patient'}</strong>
            </span>
          </div>
          <h3 className="text-base sm:text-lg font-bold text-pink-950 font-serif mt-1">
            Female • Gynecological • Obstetric • Infertility Record / महिला • स्त्रीरोग • प्रसूती केस टेकिंग
          </h3>
          <p className="text-[11px] text-slate-500">
            Recorded Date: <strong>{data.date || new Date(record.updatedAt).toLocaleDateString()}</strong> &nbsp;|&nbsp;
            Last Updated: {new Date(record.updatedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleEditCase}
            className="px-3 py-1.5 bg-pink-50 hover:bg-pink-100 text-pink-800 border border-pink-200 rounded-lg text-xs font-semibold flex items-center gap-1 transition-colors"
          >
            <Edit3 className="w-3.5 h-3.5" />
            <span>Edit Case</span>
          </button>
          {patient && (
            <button
              type="button"
              onClick={() => openWhatsAppShareDialog(patient.id, 'female_gynae')}
              className="px-3 py-1.5 bg-pink-600 hover:bg-pink-700 text-white rounded-lg text-xs font-semibold flex items-center gap-1 transition-colors"
            >
              <Share2 className="w-3.5 h-3.5" />
              <span>Share Form</span>
            </button>
          )}
        </div>
      </div>

      {/* Quick Status Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-pink-50/50 p-3.5 rounded-xl border border-pink-100">
        <div>
          <span className="text-[10px] text-slate-500 block uppercase font-semibold">Menstrual Cycle</span>
          <span className="font-bold text-slate-900 text-xs truncate block">
            {data.cycleLength || '28'}d / {data.duration || '4'}d ({data.cyclePattern || 'Regular'})
          </span>
        </div>
        <div>
          <span className="text-[10px] text-slate-500 block uppercase font-semibold">LMP</span>
          <span className="font-bold text-pink-900 text-xs truncate block">
            {data.lmp || 'Not recorded'}
          </span>
        </div>
        <div>
          <span className="text-[10px] text-slate-500 block uppercase font-semibold">Obstetric (G P A L)</span>
          <span className="font-bold text-slate-900 text-xs truncate block">
            G{data.gravida || 0} P{data.para || 0} A{data.abortions || 0} L{data.living || 0}
          </span>
        </div>
        <div>
          <span className="text-[10px] text-slate-500 block uppercase font-semibold">Infertility / Marital</span>
          <span className="font-bold text-slate-900 text-xs truncate block">
            {data.infertilityType && data.infertilityType !== 'Not applicable / लागू नाही'
              ? data.infertilityType
              : data.marital || 'Married'}
          </span>
        </div>
      </div>

      {/* Menstrual & Gynecological Details */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Menstrual Details */}
        <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 space-y-2">
          <h4 className="font-bold text-slate-900 flex items-center gap-1.5 text-xs">
            <Calendar className="w-3.5 h-3.5 text-pink-600" />
            Menstrual History & Pain
          </h4>
          <div className="grid grid-cols-2 gap-2 text-[11px]">
            <div>Menarche: <strong>{data.menarche || '13'} yrs</strong></div>
            <div>Flow: <strong>{data.flow || 'Normal'}</strong></div>
          </div>

          {mfeatures.length > 0 && (
            <div className="pt-1">
              <span className="text-[10px] text-slate-500 block uppercase font-semibold mb-1">Features:</span>
              <div className="flex flex-wrap gap-1.5">
                {mfeatures.map((f: string, idx: number) => (
                  <span key={idx} className="px-2 py-0.5 rounded bg-white border border-pink-200 text-pink-800 text-[11px]">
                    {f}
                  </span>
                ))}
              </div>
            </div>
          )}

          {pains.length > 0 && (
            <div className="pt-1">
              <span className="text-[10px] text-slate-500 block uppercase font-semibold mb-1">Dysmenorrhea / Pain:</span>
              <div className="flex flex-wrap gap-1.5">
                {pains.map((p: string, idx: number) => (
                  <span key={idx} className="px-2 py-0.5 rounded bg-rose-50 border border-rose-200 text-rose-800 text-[11px]">
                    {p}
                  </span>
                ))}
              </div>
            </div>
          )}

          {data.ovulationSymptoms && (
            <div className="text-[11px] text-slate-700 mt-1">
              <strong>Ovulation Signs:</strong> {data.ovulationSymptoms}
            </div>
          )}
        </div>

        {/* Gynecological Symptoms */}
        <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 space-y-2">
          <h4 className="font-bold text-slate-900 flex items-center gap-1.5 text-xs">
            <Activity className="w-3.5 h-3.5 text-pink-600" />
            Gynecological Conditions & Discharge
          </h4>
          {gynSymptoms.length > 0 ? (
            <div className="flex flex-wrap gap-1.5">
              {gynSymptoms.map((g: string, idx: number) => (
                <span key={idx} className="px-2 py-0.5 rounded bg-white border border-slate-300 text-slate-800 text-[11px] font-medium">
                  {g}
                </span>
              ))}
            </div>
          ) : (
            <p className="text-slate-500 text-[11px] italic">No active gynecological symptoms checked.</p>
          )}

          {data.dischargeCharacter && (
            <div className="text-[11px] text-slate-700 bg-white p-2 rounded-lg border border-slate-200 mt-2">
              <strong>Discharge:</strong> {data.dischargeCharacter}
            </div>
          )}

          {data.contraceptive && (
            <div className="text-[11px] text-slate-600">
              <strong>Contraception:</strong> {data.contraceptive}
            </div>
          )}
        </div>
      </div>

      {/* Obstetric History / Pregnancies Table */}
      {pregnancies.length > 0 && (
        <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/30 space-y-2">
          <h4 className="font-bold text-slate-900 flex items-center gap-1.5 text-xs">
            <Baby className="w-3.5 h-3.5 text-teal-600" />
            Obstetric Pregnancies Record ({pregnancies.length})
          </h4>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-[11px] border-collapse">
              <thead>
                <tr className="border-b border-slate-300 text-slate-500 uppercase text-[10px]">
                  <th className="py-1.5 px-2">#</th>
                  <th className="py-1.5 px-2">Year</th>
                  <th className="py-1.5 px-2">Outcome</th>
                  <th className="py-1.5 px-2">Gestation</th>
                  <th className="py-1.5 px-2">Delivery Mode</th>
                  <th className="py-1.5 px-2">Weight & Sex</th>
                  <th className="py-1.5 px-2">Notes</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {pregnancies.map((p: any, idx: number) => (
                  <tr key={idx} className="hover:bg-slate-100/50">
                    <td className="py-1.5 px-2 font-bold">{idx + 1}</td>
                    <td className="py-1.5 px-2">{p.year || '—'}</td>
                    <td className="py-1.5 px-2 font-semibold text-teal-900">{p.outcome || 'Live birth'}</td>
                    <td className="py-1.5 px-2">{p.gestation || 'Full term'}</td>
                    <td className="py-1.5 px-2">{p.delivery || 'Normal'}</td>
                    <td className="py-1.5 px-2">{p.weight || '—'} / {p.sex || '—'}</td>
                    <td className="py-1.5 px-2 text-slate-600">{p.notes || 'None'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Infertility Section if active */}
      {data.infertilityType && data.infertilityType !== 'Not applicable / लागू नाही' && (
        <div className="p-4 rounded-xl border border-purple-200 bg-purple-50/40 space-y-2">
          <h4 className="font-bold text-purple-900 text-xs">
            Infertility Profile ({data.infertilityType})
          </h4>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-[11px]">
            <div>Duration: <strong>{data.infertilityYears || '—'} years</strong></div>
            <div>Trying Since: <strong>{data.tryingSince || '—'}</strong></div>
            <div>Intercourse: <strong>{data.frequency || '—'}</strong></div>
            <div>Ovulation: <strong>{data.ovulationHistory || '—'}</strong></div>
          </div>
          {data.infertilityOther && (
            <p className="text-[11px] text-slate-700 pt-1">
              <strong>Evaluation Notes:</strong> {data.infertilityOther}
            </p>
          )}
        </div>
      )}

      {/* Investigations & Reports */}
      {(investigations.length > 0 || data.reportFinding || reportFiles.length > 0) && (
        <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/30 space-y-2">
          <h4 className="font-bold text-slate-900 flex items-center gap-1.5 text-xs">
            <FileText className="w-3.5 h-3.5 text-pink-600" />
            Investigations & Reports
          </h4>
          {investigations.length > 0 && (
            <div className="flex flex-wrap gap-1.5">
              {investigations.map((inv: string, idx: number) => (
                <span key={idx} className="px-2 py-0.5 rounded bg-white border border-slate-300 text-slate-700 text-[11px]">
                  {inv}
                </span>
              ))}
            </div>
          )}
          {data.reportFinding && (
            <div className="text-[11px] text-slate-800 bg-white p-2 rounded-lg border border-slate-200">
              <strong>Key Finding:</strong> {data.reportFinding} {data.lab && `[${data.lab}]`}
            </div>
          )}
          {reportFiles.length > 0 && (
            <div className="flex flex-wrap gap-2 pt-1">
              {reportFiles.map((file: any, idx: number) => (
                <div key={idx} className="border border-slate-300 rounded-lg overflow-hidden bg-white p-1">
                  {file.data ? (
                    <img src={file.data} alt={file.name} className="w-20 h-16 object-cover rounded" />
                  ) : (
                    <div className="w-20 h-16 flex items-center justify-center text-[9px] text-slate-500 text-center px-1">
                      {file.name}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Doctor's Notes */}
      {(data.doctorNotes || data.assessment) && (
        <div className="p-3.5 rounded-xl border border-pink-200 bg-pink-50/40 space-y-1">
          <span className="font-bold text-pink-900 block text-xs">Doctor's Assessment & Clinical Plan:</span>
          {data.assessment && <p className="text-[11px] font-semibold text-slate-900">{data.assessment}</p>}
          {data.doctorNotes && <p className="text-[11px] text-slate-800">{data.doctorNotes}</p>}
        </div>
      )}
    </div>
  );
};
