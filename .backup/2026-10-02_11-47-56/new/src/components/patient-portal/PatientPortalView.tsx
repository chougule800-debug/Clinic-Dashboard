/**
 * This component was replaced by `PublicShareView`, which uses secure
 * share tokens and Supabase-backed data. It is kept as a safe stub so that
 * any lingering reference resolves without breaking the build.
 */
import React from 'react';

interface PatientPortalViewProps {
  mode?: 'intake' | 'prescription' | 'billing' | 'custom_form';
  patientId?: string | null;
  system?: unknown;
  rxId?: string | null;
  invId?: string | null;
  onExitToDashboard?: (targetTab?: string, ptId?: string, sys?: unknown) => void;
}

export const PatientPortalView: React.FC<PatientPortalViewProps> = () => {
  return null;
};

export default PatientPortalView;