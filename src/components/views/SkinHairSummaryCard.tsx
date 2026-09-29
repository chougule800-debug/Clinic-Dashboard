import React from 'react';
import { SystemFormRecord, Patient } from '../../types';
import { useClinic } from '../../context/ClinicContext';
import {
  Sparkles,
  Calendar,
  Clock,
  AlertCircle,
  Camera,
  Activity,
  User,
  Heart,
  FileText,
  Edit3,
  Share2,
  CheckCircle2
} from 'lucide-react';

interface SkinHairSummaryCardProps {
  record: SystemFormRecord;
  patient?: Patient;
}

export const SkinHairSummaryCard: React.FC<SkinHairSummaryCardProps> = ({ record, patient }) => {
  const { setActiveTab, setActiveSystemFormKey, openWhatsAppShareDialog } = useClinic();
  const data = record.data || {};

  const handleEditCase = () => {
    setActiveSystemFormKey('skin_hair');
    setActiveTab('case_taking');
  };

  return (
    <div className="rounded-2xl border-2 border-teal-600/30 bg-white p-6 shadow-sm space-y-6 text-xs text-slate-800">
      {/* Top Banner / Case Title */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 border-b border-teal-100 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-1 rounded-md bg-teal-100/80 text-teal-800 text-[10px] font-bold uppercase tracking-wider">
              Specialized Clinical Record
            </span>
            <span className="text-slate-300">•</span>
            <span className="text-slate-600 font-medium text-xs">
              Patient: <strong className="text-slate-900">{patient?.name || data.patientName || 'Patient'}</strong>
            </span>
          </div>
          <h3 className="text-base sm:text-lg font-bold text-teal-900 font-serif mt-1">
            Skin & Hairfall Comprehensive Case Record / त्वचा व केस गळणे केस टेकिंग
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
            className="px-3 py-1.5 bg-teal-50 hover:bg-teal-100 text-teal-800 border border-teal-200 rounded-lg text-xs font-semibold flex items-center gap-1 transition-colors"
          >
            <Edit3 className="w-3.5 h-3.5" />
            <span>Edit Case</span>
          </button>
          {patient && (
            <button
              type="button"
              onClick={() => openWhatsAppShareDialog(patient.id, 'skin_hair')}
              className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-semibold flex items-center gap-1 transition-colors"
            >
              <Share2 className="w-3.5 h-3.5" />
              <span>Share Form</span>
            </button>
          )}
        </div>
      </div>

      {/* Quick Status Bar */}
      {(() => {
        const chiefConcern = data.skinProblem || record.chiefComplaints || (data.lesionType ? (Array.isArray(data.lesionType) ? data.lesionType.join(', ') : data.lesionType) : 'Skin & Hair Complaint');
        const durationDisplay = data.skinSince || record.duration || 'Reported via intake';
        const severityDisplay = data.acneSeverity || record.severity || 'Moderate';
        const hairVol = data.hairAmount || (data.hairComplaints ? (Array.isArray(data.hairComplaints) ? data.hairComplaints.join(', ') : data.hairComplaints) : 'Not specified');

        const lesionList = Array.isArray(data.lesionType) ? data.lesionType : (data.lesionType ? [data.lesionType] : []);
        const locations = (Array.isArray(data.acneLocation) && data.acneLocation.length > 0)
          ? data.acneLocation
          : (Array.isArray(data.location) ? data.location : (data.location ? [data.location] : []));
        const itchingList = (Array.isArray(data.skinSymptom) && data.skinSymptom.length > 0)
          ? data.skinSymptom
          : (Array.isArray(data.itchingModality) ? data.itchingModality : (data.itchingModality ? [data.itchingModality] : []));
        const triggersList = (Array.isArray(data.acneTrigger) && data.acneTrigger.length > 0)
          ? data.acneTrigger
          : (Array.isArray(data.triggers) ? data.triggers : (data.triggers ? [data.triggers] : []));
        const discharges = Array.isArray(data.discharge) ? data.discharge : (data.discharge ? [data.discharge] : []);

        return (
          <>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-teal-50/50 p-3.5 rounded-xl border border-teal-100">
              <div>
                <span className="text-[10px] text-slate-500 block uppercase font-semibold">Chief Concern</span>
                <span className="font-bold text-slate-900 text-xs line-clamp-1">{chiefConcern}</span>
              </div>
              <div>
                <span className="text-[10px] text-slate-500 block uppercase font-semibold">Severity</span>
                <span className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-bold ${
                  severityDisplay.includes('Severe') ? 'bg-rose-100 text-rose-800' : 'bg-amber-100 text-amber-800'
                }`}>
                  {severityDisplay}
                </span>
              </div>
              <div>
                <span className="text-[10px] text-slate-500 block uppercase font-semibold">Duration / Since</span>
                <span className="font-bold text-slate-900 text-xs">{durationDisplay}</span>
              </div>
              <div>
                <span className="text-[10px] text-slate-500 block uppercase font-semibold">Hair Complaints</span>
                <span className="font-bold text-teal-800 text-xs line-clamp-1">{hairVol}</span>
              </div>
            </div>

            {/* Grid: 2. Skin & Acne Totality & 3. Clinical Acne Photo */}
            <div className="space-y-4">
              <h4 className="font-bold text-slate-900 text-xs flex items-center gap-1.5 text-teal-900 border-b border-slate-100 pb-1.5">
                <Sparkles className="w-3.5 h-3.5 text-teal-600" />
                <span>2 & 3. Skin Totality & Lesion Details / त्वचेची मुख्य समस्या व लक्षणे</span>
              </h4>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                <div className="lg:col-span-2 space-y-3 bg-slate-50/60 p-4 rounded-xl border border-slate-200/80">
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div>
                      <span className="text-[10px] text-slate-500 block">Problem / Complaint</span>
                      <span className="font-semibold text-slate-900">{chiefConcern}</span>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-500 block">Severity & Duration</span>
                      <span className="font-semibold text-slate-900">{severityDisplay} ({durationDisplay})</span>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-500 block">Skin History</span>
                      <span className="font-semibold text-slate-900">{data.skinHistory || record.clinicalNotes || 'Recorded'}</span>
                    </div>
                  </div>

                  {/* Lesion Types */}
                  {lesionList.length > 0 && (
                    <div>
                      <span className="text-[10px] text-slate-500 block mb-1">Lesion Type(s):</span>
                      <div className="flex flex-wrap gap-1.5">
                        {lesionList.map((les: string) => (
                          <span key={les} className="px-2 py-0.5 bg-rose-100 text-rose-800 rounded-md text-[10px] font-medium">
                            {les}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Locations */}
                  {locations.length > 0 && (
                    <div>
                      <span className="text-[10px] text-slate-500 block mb-1">Distribution & Location(s):</span>
                      <div className="flex flex-wrap gap-1.5">
                        {locations.map((loc: string) => (
                          <span key={loc} className="px-2 py-0.5 bg-teal-100 text-teal-800 rounded-md text-[10px] font-medium">
                            {loc}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Skin Symptoms & Itching */}
                  {itchingList.length > 0 && (
                    <div>
                      <span className="text-[10px] text-slate-500 block mb-1">Itching & Sensations:</span>
                      <div className="flex flex-wrap gap-1.5">
                        {itchingList.map((sym: string) => (
                          <span key={sym} className="px-2 py-0.5 bg-emerald-100 text-emerald-800 rounded-md text-[10px] font-medium">
                            {sym}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Nature of Discharge */}
                  {discharges.length > 0 && (
                    <div>
                      <span className="text-[10px] text-slate-500 block mb-1">Nature of Discharge:</span>
                      <div className="flex flex-wrap gap-1.5">
                        {discharges.map((dis: string) => (
                          <span key={dis} className="px-2 py-0.5 bg-amber-100 text-amber-800 rounded-md text-[10px] font-medium">
                            {dis}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Triggers */}
                  {triggersList.length > 0 && (
                    <div>
                      <span className="text-[10px] text-slate-500 block mb-1">Triggers & Aggravations:</span>
                      <div className="flex flex-wrap gap-1.5">
                        {triggersList.map((trig: string) => (
                          <span key={trig} className="px-2 py-0.5 bg-indigo-100 text-indigo-800 rounded-md text-[10px] font-medium">
                            {trig}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Modalities from record */}
                  {(record.modalitiesAggravation || record.modalitiesAmelioration) && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-2 border-t border-slate-200">
                      {record.modalitiesAggravation && (
                        <div className="p-2 bg-rose-50 border border-rose-100 rounded-lg text-rose-900 text-[11px]">
                          <strong>Aggravation (&lt;):</strong> {record.modalitiesAggravation}
                        </div>
                      )}
                      {record.modalitiesAmelioration && (
                        <div className="p-2 bg-emerald-50 border border-emerald-100 rounded-lg text-emerald-900 text-[11px]">
                          <strong>Amelioration (&gt;):</strong> {record.modalitiesAmelioration}
                        </div>
                      )}
                    </div>
                  )}

                  {(data.acneTreatment || data.cosmetics) && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1 border-t border-slate-200">
                      {data.acneTreatment && (
                        <div>
                          <span className="text-[10px] text-slate-500 block font-medium">Previous Treatment:</span>
                          <span className="text-[11px] text-slate-700">{data.acneTreatment}</span>
                        </div>
                      )}
                      {data.cosmetics && (
                        <div>
                          <span className="text-[10px] text-slate-500 block font-medium">Cosmetics Used:</span>
                          <span className="text-[11px] text-slate-700">{data.cosmetics}</span>
                        </div>
                      )}
                    </div>
                  )}
                </div>

          {/* Clinical Acne Photo */}
          <div className="bg-slate-50/60 p-4 rounded-xl border border-slate-200/80 flex flex-col items-center justify-center text-center">
            {data.acnePhoto ? (
              <div className="space-y-1.5 w-full">
                <img
                  src={data.acnePhoto}
                  alt="Acne Clinical Photo"
                  className="w-full h-40 object-cover rounded-lg border border-slate-200"
                />
                <span className="text-[10px] text-slate-500 block font-medium">Acne Clinical Photo</span>
              </div>
            ) : (
              <div className="py-6 text-slate-400 space-y-1">
                <Camera className="w-8 h-8 mx-auto stroke-1" />
                <span className="text-[11px] block">No Acne Photo Attached</span>
              </div>
            )}
          </div>
        </div>
      </div>
          </>
        );
      })()}

      {/* 4 & 5. Hair Fall & Dandruff & Care History */}
      <div className="space-y-3">
        <h4 className="font-bold text-slate-900 text-xs flex items-center gap-1.5 text-teal-900 border-b border-slate-100 pb-1.5">
          <Activity className="w-3.5 h-3.5 text-teal-600" />
          <span>4 & 5. Hair Fall, Dandruff & Care History / केस गळणे, कोंडा व इतिहास</span>
        </h4>

        <div className="bg-slate-50/60 p-4 rounded-xl border border-slate-200/80 space-y-3">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div>
              <span className="text-[10px] text-slate-500 block">Hair Fall Duration</span>
              <span className="font-semibold text-slate-900">{data.hairSince || 'N/A'}</span>
            </div>
            <div>
              <span className="text-[10px] text-slate-500 block">Dandruff Duration</span>
              <span className="font-semibold text-slate-900">{data.dandruffSince || 'N/A'}</span>
            </div>
            <div>
              <span className="text-[10px] text-slate-500 block">Daily Loss Amount</span>
              <span className="font-semibold text-slate-900">{data.hairAmount || 'N/A'}</span>
            </div>
            <div>
              <span className="text-[10px] text-slate-500 block">Wash Frequency</span>
              <span className="font-semibold text-slate-900">{data.wash || 'N/A'}</span>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
            {data.fallWhen && data.fallWhen.length > 0 && (
              <div>
                <span className="text-[10px] text-slate-500 block mb-1">Fall Trigger:</span>
                <div className="flex flex-wrap gap-1">
                  {data.fallWhen.map((fw: string) => (
                    <span key={fw} className="px-2 py-0.5 bg-amber-100 text-amber-800 rounded text-[10px]">
                      {fw}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {data.symptom && data.symptom.length > 0 && (
              <div>
                <span className="text-[10px] text-slate-500 block mb-1">Scalp Symptoms:</span>
                <div className="flex flex-wrap gap-1">
                  {data.symptom.map((sym: string) => (
                    <span key={sym} className="px-2 py-0.5 bg-teal-100 text-teal-800 rounded text-[10px]">
                      {sym}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {data.pattern && data.pattern.length > 0 && (
              <div>
                <span className="text-[10px] text-slate-500 block mb-1">Fall Pattern:</span>
                <div className="flex flex-wrap gap-1">
                  {data.pattern.map((pat: string) => (
                    <span key={pat} className="px-2 py-0.5 bg-cyan-100 text-cyan-800 rounded text-[10px]">
                      {pat}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-2 border-t border-slate-200 text-[11px]">
            <div><strong>Shampoo:</strong> {data.shampoo || 'None'}</div>
            <div><strong>Hair Oil:</strong> {data.hairOil || 'None'}</div>
            <div><strong>Helmet:</strong> {data.helmet || 'No'}</div>
            <div><strong>Hard Water:</strong> {data.water || 'No'}</div>
          </div>
        </div>
      </div>

      {/* 6. Menstrual History (If documented) */}
      {(data.cycle || data.bleeding || data.periodPain || data.pcos) && (
        <div className="space-y-2">
          <h4 className="font-bold text-slate-900 text-xs flex items-center gap-1.5 text-teal-900 border-b border-slate-100 pb-1.5">
            <Heart className="w-3.5 h-3.5 text-rose-600" />
            <span>6. Menstrual & Hormonal History / मासिक पाळीचा इतिहास</span>
          </h4>

          <div className="bg-rose-50/30 p-3.5 rounded-xl border border-rose-100 grid grid-cols-2 sm:grid-cols-4 gap-3 text-[11px]">
            <div><strong>Menarche:</strong> {data.menarcheAge || 'N/A'}</div>
            <div><strong>LMP:</strong> {data.lmp || 'N/A'}</div>
            <div><strong>Cycle:</strong> {data.cycle} ({data.cycleLength || '28d'})</div>
            <div><strong>Flow:</strong> {data.bleeding} ({data.bleedingDays || '4d'})</div>
            <div><strong>Period Pain:</strong> {data.periodPain}</div>
            <div><strong>PCOS / PCOD:</strong> {data.pcos}</div>
            <div><strong>Facial Hair:</strong> {data.facialHair}</div>
            <div><strong>Period Acne:</strong> {data.periodAcne}</div>
          </div>
        </div>
      )}

      {/* 7 & 8. Diet, Lifestyle & Investigations */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Diet & Lifestyle */}
        <div className="space-y-2 bg-slate-50/60 p-3.5 rounded-xl border border-slate-200/80">
          <h5 className="font-bold text-slate-900 text-xs">7 & 8. Diet & Lifestyle / आहार व जीवनशैली</h5>
          <div className="grid grid-cols-2 gap-2 text-[11px]">
            <div><strong>Diet:</strong> {data.diet || 'Vegetarian'}</div>
            <div><strong>Protein:</strong> {data.protein || 'Moderate'}</div>
            <div><strong>Water:</strong> {data.waterIntake || '2-3 L'}</div>
            <div><strong>Sleep:</strong> {data.sleep || '7-8 hrs'}</div>
            <div><strong>Stress:</strong> {data.stress || 'Moderate'}</div>
            <div><strong>Exercise:</strong> {data.exercise || 'None'}</div>
          </div>
          {data.recentIllness && (
            <div className="text-[11px] text-slate-600 pt-1">
              <strong>Recent Illness:</strong> {data.recentIllness}
            </div>
          )}
        </div>

        {/* Investigations */}
        <div className="space-y-2 bg-slate-50/60 p-3.5 rounded-xl border border-slate-200/80">
          <h5 className="font-bold text-slate-900 text-xs">9. Lab Investigations / तपासण्या</h5>
          <div className="grid grid-cols-3 gap-2 text-[11px]">
            <div><strong>CBC:</strong> {data.cbc || '-'}</div>
            <div><strong>Ferritin:</strong> {data.ferritin || '-'}</div>
            <div><strong>Iron:</strong> {data.iron || '-'}</div>
            <div><strong>Vit D3:</strong> {data.vitD || '-'}</div>
            <div><strong>Vit B12:</strong> {data.b12 || '-'}</div>
            <div><strong>TSH:</strong> {data.tsh || '-'}</div>
          </div>
          {data.otherReports && (
            <div className="text-[11px] text-slate-600 pt-1">
              <strong>Other Reports:</strong> {data.otherReports}
            </div>
          )}
        </div>
      </div>

      {/* 10. Hair & Scalp Clinical Photographs (5 slots) */}
      {(data.photo1 || data.photo2 || data.photo3 || data.photo4 || data.photo5) && (
        <div className="space-y-2">
          <h4 className="font-bold text-slate-900 text-xs flex items-center gap-1.5 text-teal-900 border-b border-slate-100 pb-1.5">
            <Camera className="w-3.5 h-3.5 text-teal-600" />
            <span>10. Hair & Scalp Clinical Photographs / केस व टाळूचे फोटो</span>
          </h4>

          <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
            {[
              { key: 'photo1', label: '1. Front Hairline' },
              { key: 'photo2', label: '2. Crown / Top' },
              { key: 'photo3', label: '3. Left Side' },
              { key: 'photo4', label: '4. Right Side' },
              { key: 'photo5', label: '5. Scalp Close-up' }
            ].map(p => {
              const src = data[p.key];
              if (!src) return null;
              return (
                <div key={p.key} className="space-y-1 text-center">
                  <img
                    src={src}
                    alt={p.label}
                    className="w-full h-24 object-cover rounded-lg border border-slate-200"
                  />
                  <span className="text-[10px] text-slate-600 font-medium block truncate">{p.label}</span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* 12 & 13. Clinical Assessment & Prescribed Treatment */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-emerald-50/40 p-4 rounded-xl border border-emerald-200/80">
        <div className="space-y-2">
          <h5 className="font-bold text-emerald-950 text-xs">12. Clinical Assessment / क्लिनिकल मूल्यांकन</h5>
          <div className="text-[11px] space-y-1">
            <div><strong>Dandruff:</strong> {data.dandruffSeverity} &nbsp;|&nbsp; <strong>Hairfall:</strong> {data.hairSeverity}</div>
            <div><strong>Density:</strong> {data.density}</div>
            {data.assessment && <div><strong>Assessment:</strong> {data.assessment}</div>}
            {data.clinicalFindings && <div><strong>Findings:</strong> {data.clinicalFindings}</div>}
          </div>
        </div>

        <div className="space-y-2">
          <h5 className="font-bold text-teal-950 text-xs">13. Homeopathic Treatment / उपचार व सल्ला</h5>
          <div className="text-[11px] space-y-1">
            <div><strong>Treatment:</strong> {data.treatment || 'Simillimum remedy prescribed'}</div>
            {data.advice && <div><strong>Advice:</strong> {data.advice}</div>}
            {data.followup && <div><strong>Follow-up Date:</strong> <span className="font-bold text-teal-800">{data.followup}</span></div>}
          </div>
        </div>
      </div>
    </div>
  );
};
