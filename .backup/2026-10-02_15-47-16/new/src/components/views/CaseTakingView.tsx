import React, { useState, useEffect } from 'react';
import { useClinic } from '../../context/ClinicContext';
import type { ClinicalSystemKey } from '../../types';
import { CLINICAL_SYSTEMS_METADATA } from '../../data/mockData';
import { SkinHairCaseForm } from '../forms/SkinHairCaseForm';
import { NeuroCaseForm } from '../forms/NeuroCaseForm';
import { GastroCaseForm } from '../forms/GastroCaseForm';
import { UrinaryCaseForm } from '../forms/UrinaryCaseForm';
import { MusculoskeletalCaseForm } from '../forms/MusculoskeletalCaseForm';
import { RespiratoryCaseForm } from '../forms/RespiratoryCaseForm';
import { FemaleGynaeCaseForm } from '../forms/FemaleGynaeCaseForm';
import { PediatricCaseForm } from '../forms/PediatricCaseForm';
import { MindGeneralsCaseForm } from '../forms/MindGeneralsCaseForm';
import { CustomFormsBuilder } from '../custom-forms/CustomFormsBuilder';
import { CustomFormResponsesList } from '../custom-forms/CustomFormResponsesList';
import {
  ClipboardList, Share2, FileCheck2, Brain, Sparkles, Utensils, Droplet,
  Activity, Wind, HeartHandshake, Baby, ArrowRight, AlertCircle, Heart,
  Ruler, Scale, User, Inbox
} from 'lucide-react';

export const CaseTakingView: React.FC = () => {
  const {
    selectedPatient, systemForms, activeSystemFormKey, setActiveSystemFormKey,
    openWhatsAppShareDialog, setActiveTab, updatePatientVitals
  } = useClinic();

  const [tab, setTab] = useState<'form' | 'submissions'>('form');
  const [patientAge, setPatientAge] = useState<string>('');
  const [bpSys, setBpSys] = useState<string>('');
  const [bpDia, setBpDia] = useState<string>('');
  const [rbsVal, setRbsVal] = useState<string>('');
  const [heightVal, setHeightVal] = useState<string>('');
  const [weightVal, setWeightVal] = useState<string>('');

  useEffect(() => {
    if (selectedPatient) {
      setPatientAge(selectedPatient.age ? String(selectedPatient.age) : '');
      setBpSys(selectedPatient.vitals?.bpSystolic ? String(selectedPatient.vitals.bpSystolic) : '');
      setBpDia(selectedPatient.vitals?.bpDiastolic ? String(selectedPatient.vitals.bpDiastolic) : '');
      setRbsVal(selectedPatient.vitals?.rbs ? String(selectedPatient.vitals.rbs) : '');
      setHeightVal(selectedPatient.vitals?.heightInches ? String(selectedPatient.vitals.heightInches) : '');
      setWeightVal(selectedPatient.vitals?.weight ? String(selectedPatient.vitals.weight) : '');
    }
  }, [
    selectedPatient?.id, selectedPatient?.age, selectedPatient?.vitals?.bpSystolic,
    selectedPatient?.vitals?.bpDiastolic, selectedPatient?.vitals?.rbs,
    selectedPatient?.vitals?.heightInches, selectedPatient?.vitals?.weight
  ]);

  const handleVitalsChange = (
    field: 'age' | 'bpSystolic' | 'bpDiastolic' | 'rbs' | 'heightInches' | 'weight',
    rawVal: string
  ) => {
    const numOnly = rawVal.replace(/[^0-9]/g, '');
    if (!selectedPatient) return;
    if (field === 'age') {
      setPatientAge(numOnly);
      void updatePatientVitals(selectedPatient.id, {}, numOnly ? Number(numOnly) : undefined);
    } else if (field === 'bpSystolic') {
      setBpSys(numOnly);
      void updatePatientVitals(selectedPatient.id, { bpSystolic: numOnly ? Number(numOnly) : 120 });
    } else if (field === 'bpDiastolic') {
      setBpDia(numOnly);
      void updatePatientVitals(selectedPatient.id, { bpDiastolic: numOnly ? Number(numOnly) : 80 });
    } else if (field === 'rbs') {
      setRbsVal(numOnly);
      void updatePatientVitals(selectedPatient.id, { rbs: numOnly ? Number(numOnly) : undefined });
    } else if (field === 'heightInches') {
      setHeightVal(numOnly);
      const hIn = numOnly ? Number(numOnly) : 0;
      const wKg = weightVal ? Number(weightVal) : selectedPatient.vitals?.weight || 0;
      const bmi = hIn > 0 && wKg > 0 ? Number((wKg / Math.pow(hIn * 0.0254, 2)).toFixed(1)) : selectedPatient.vitals?.bmi;
      void updatePatientVitals(selectedPatient.id, { heightInches: hIn, bmi });
    } else if (field === 'weight') {
      setWeightVal(numOnly);
      const wKg = numOnly ? Number(numOnly) : 0;
      const hIn = heightVal ? Number(heightVal) : selectedPatient.vitals?.heightInches || 0;
      const bmi = hIn > 0 && wKg > 0 ? Number((wKg / Math.pow(hIn * 0.0254, 2)).toFixed(1)) : selectedPatient.vitals?.bmi;
      void updatePatientVitals(selectedPatient.id, { weight: wKg, bmi });
    }
  };

  const sysIconMap: Record<ClinicalSystemKey, React.ComponentType<{ className?: string }>> = {
    headache: Brain, skin_hair: Sparkles, gastrointestinal: Utensils, urinary: Droplet,
    musculoskeletal: Activity, respiratory: Wind, female_gynae: HeartHandshake,
    pediatric: Baby, other_mind_generals: Sparkles
  };

  const currentSys = CLINICAL_SYSTEMS_METADATA.find(s => s.key === activeSystemFormKey) || CLINICAL_SYSTEMS_METADATA[0];

  if (!selectedPatient) {
    return (
      <div className="p-8 text-center bg-white rounded-2xl border border-slate-200">
        <AlertCircle className="w-12 h-12 text-amber-500 mx-auto mb-2" />
        <h3 className="font-bold text-slate-800 text-base">No Active Patient Selected</h3>
        <p className="text-xs text-slate-500 mt-1">Please select or register a patient first.</p>
      </div>
    );
  }

  const renderForm = () => {
    switch (activeSystemFormKey) {
      case 'skin_hair': return <SkinHairCaseForm />;
      case 'headache': return <NeuroCaseForm />;
      case 'gastrointestinal': return <GastroCaseForm />;
      case 'urinary': return <UrinaryCaseForm />;
      case 'musculoskeletal': return <MusculoskeletalCaseForm />;
      case 'respiratory': return <RespiratoryCaseForm />;
      case 'female_gynae': return <FemaleGynaeCaseForm />;
      case 'pediatric': return <PediatricCaseForm />;
      case 'other_mind_generals': return <MindGeneralsCaseForm />;
      default: return null;
    }
  };

  return (
    <div className="space-y-6 pb-12 text-base">
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[11px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-teal-50 text-teal-800 border border-teal-200">
              Case Taking
            </span>
            <span className="text-slate-400">•</span>
            <span className="text-sm text-slate-600 font-medium">
              <strong>{selectedPatient.name}</strong> ({selectedPatient.patientCode ?? selectedPatient.id})
            </span>
          </div>
          <h2 className="text-2xl font-bold text-slate-900 font-serif flex items-center gap-2">
            <ClipboardList className="w-6 h-6 text-teal-700" />
            System-Wise Case Taking
          </h2>
          <p className="text-sm text-slate-500">Structured clinical forms across 9 systems, with doctor-authored custom questions.</p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <button onClick={() => setActiveTab('case_summary')} className="px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-sm transition-colors flex items-center gap-1.5">
            <FileCheck2 className="w-5 h-5 text-teal-700" /><span>Case Summary</span>
          </button>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 p-2 shadow-xs overflow-x-auto">
        <div className="flex items-center gap-1.5 min-w-max">
          {CLINICAL_SYSTEMS_METADATA.map(sys => {
            const Icon = sysIconMap[sys.key] || Brain;
            const isSelected = activeSystemFormKey === sys.key;
            const record = systemForms.find(f => f.patientId === selectedPatient.id && f.system === sys.key);
            return (
              <button
                key={sys.key}
                onClick={() => setActiveSystemFormKey(sys.key)}
                className={`px-4 py-2.5 rounded-xl text-sm font-medium transition-all flex items-center gap-2 ${
                  isSelected ? 'bg-teal-700 text-white shadow-sm font-semibold' : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                }`}
              >
                <Icon className={`w-4 h-4 ${isSelected ? 'text-white' : 'text-slate-400'}`} />
                <span>{sys.label}</span>
                {record && (
                  <span className={`w-2 h-2 rounded-full ${record.submittedVia === 'WhatsApp_Remote_Intake' ? 'bg-emerald-400' : 'bg-teal-300'}`} title={record.submittedVia} />
                )}
              </button>
            );
          })}
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-xs">
        <div className="flex items-center gap-2 pb-2.5 mb-3 border-b border-slate-100">
          <Activity className="w-4 h-4 text-rose-500" />
          <span className="font-bold text-sm text-slate-900">Patient Vitals</span>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 text-sm">
          {[
            { label: 'Age', icon: User, value: patientAge, field: 'age' as const, unit: 'yrs', color: 'text-indigo-500' },
            { label: 'BP Systolic', icon: Heart, value: bpSys, field: 'bpSystolic' as const, unit: 'mmHg', color: 'text-rose-500' },
            { label: 'BP Diastolic', icon: Heart, value: bpDia, field: 'bpDiastolic' as const, unit: 'mmHg', color: 'text-rose-400' },
            { label: 'RBS', icon: Activity, value: rbsVal, field: 'rbs' as const, unit: 'mg/dL', color: 'text-amber-500' },
            { label: 'Height', icon: Ruler, value: heightVal, field: 'heightInches' as const, unit: 'in', color: 'text-teal-600' },
            { label: 'Weight', icon: Scale, value: weightVal, field: 'weight' as const, unit: 'kg', color: 'text-emerald-600' }
          ].map(item => {
            const Icon = item.icon;
            return (
              <div key={item.field}>
                <label className="block font-semibold text-slate-700 mb-1 flex items-center gap-1 text-sm">
                  <Icon className={`w-3.5 h-3.5 ${item.color}`} />{item.label}
                </label>
                <div className="relative">
                  <input
                    type="text"
                    inputMode="numeric"
                    value={item.value}
                    onChange={e => handleVitalsChange(item.field, e.target.value)}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-base font-mono font-bold text-slate-900 focus:bg-white focus:ring-2 focus:ring-teal-500 focus:outline-none"
                  />
                  <span className="text-xs text-slate-400 absolute right-2.5 top-3">{item.unit}</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div className="flex items-center gap-2">
        <button
          onClick={() => setTab('form')}
          className={`px-5 py-2.5 rounded-xl text-sm font-semibold flex items-center gap-1.5 transition-colors ${
            tab === 'form' ? 'bg-slate-900 text-white' : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-50'
          }`}
        >
          <ClipboardList className="w-4 h-4" />Clinical Form
        </button>
        <button
          onClick={() => setTab('submissions')}
          className={`px-5 py-2.5 rounded-xl text-sm font-semibold flex items-center gap-1.5 transition-colors ${
            tab === 'submissions' ? 'bg-emerald-600 text-white' : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-50'
          }`}
        >
          <Inbox className="w-4 h-4" />Patient Submissions
        </button>
      </div>

      {tab === 'form' && (
        <>
          <div className="bg-gradient-to-r from-emerald-50 via-teal-50 to-cyan-50 border border-emerald-200 rounded-2xl p-4 flex flex-col md:flex-row md:items-center justify-between gap-3 shadow-xs">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-emerald-600 text-white flex items-center justify-center shrink-0">
                <Share2 className="w-6 h-6" />
              </div>
              <div>
                <div className="text-xs uppercase font-bold tracking-wider text-emerald-800">Share Clinical Form with Patient</div>
                <div className="text-base font-bold text-slate-900">{currentSys.label}</div>
                <p className="text-xs text-slate-500">Sends a secure link containing this system's built-in form plus any custom questions.</p>
              </div>
            </div>
            <div className="flex items-center gap-2 flex-wrap">
              <button
                onClick={() => openWhatsAppShareDialog(selectedPatient.id, activeSystemFormKey)}
                className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm transition-colors flex items-center gap-2 shadow-xs"
              >
                <Share2 className="w-5 h-5" />Send WhatsApp Link
              </button>
            </div>
          </div>

          {renderForm()}

          <CustomFormsBuilder systemKey={activeSystemFormKey} patientId={selectedPatient.id} />

          <div className="pt-4 border-t border-slate-200 flex items-center justify-end gap-3">
            <button
              onClick={() => setActiveTab('case_summary')}
              className="px-5 py-3 bg-slate-900 hover:bg-slate-800 text-white font-bold text-sm rounded-xl transition-colors flex items-center gap-2"
            >
              <span>View Case Summary</span><ArrowRight className="w-5 h-5" />
            </button>
          </div>
        </>
      )}

      {tab === 'submissions' && (
        <CustomFormResponsesList systemKey={activeSystemFormKey} patientId={selectedPatient.id} />
      )}

      <span className="hidden"><User /></span>
    </div>
  );
};