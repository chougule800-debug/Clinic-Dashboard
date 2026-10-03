import React, { useEffect, useState } from 'react';
import { useClinic } from '../../context/ClinicContext';
import { customResponseService, type CustomFormResponseRow } from '../../lib/services/customResponses';
import { CustomFormResponseView } from './CustomFormResponseView';
import type { ClinicalSystemKey } from '../../types';
import { Loader2, FileText, ChevronRight, MessageSquare } from 'lucide-react';

interface CustomFormResponsesListProps {
  systemKey?: ClinicalSystemKey;
  patientId?: string;
}

export const CustomFormResponsesList: React.FC<CustomFormResponsesListProps> = ({ systemKey, patientId }) => {
  const { currentUser } = useClinic();
  const [loading, setLoading] = useState(true);
  const [responses, setResponses] = useState<CustomFormResponseRow[]>([]);
  const [activeId, setActiveId] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      if (!currentUser) return;
      setLoading(true);
      try {
        const list = await customResponseService.listForDoctor(currentUser.id, { patientId, systemKey });
        if (!cancelled) setResponses(list);
      } catch (err) {
        console.warn('[CustomFormResponsesList]', err);
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    void load();
    return () => { cancelled = true; };
  }, [currentUser?.id, patientId, systemKey]);

  if (loading) {
    return (
      <div className="p-6 flex items-center justify-center text-sm text-slate-500 gap-2">
        <Loader2 className="w-5 h-5 animate-spin" />Loading submissions...
      </div>
    );
  }

  if (activeId) {
    return <CustomFormResponseView responseId={activeId} onClose={() => setActiveId(null)} />;
  }

  if (responses.length === 0) {
    return (
      <div className="p-8 text-center text-sm text-slate-500 border border-dashed border-slate-200 rounded-xl bg-white">
        <MessageSquare className="w-8 h-8 text-slate-300 mx-auto mb-2" />
        No patient submissions yet for this clinical system.
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {responses.map(r => (
        <button
          key={r.id}
          onClick={() => setActiveId(r.id)}
          className="w-full text-left p-4 bg-white border border-slate-200 hover:border-indigo-300 rounded-xl transition-colors flex items-center justify-between"
        >
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-xl bg-indigo-50 text-indigo-700 flex items-center justify-center">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <div className="text-base font-semibold text-slate-900">
                {r.system_key ? `${r.system_key.replace(/_/g, ' ')} submission` : 'Clinical Submission'}
              </div>
              <div className="text-sm text-slate-500">
                Submitted {new Date(r.submitted_at).toLocaleString()}
              </div>
            </div>
          </div>
          <ChevronRight className="w-5 h-5 text-slate-400" />
        </button>
      ))}
    </div>
  );
};