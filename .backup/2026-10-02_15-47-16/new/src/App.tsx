import React, { useState, useEffect } from 'react';
import { ClinicProvider, useClinic } from './context/ClinicContext';
import { Header } from './components/Header';
import { Sidebar } from './components/Sidebar';
import { PatientBanner } from './components/PatientBanner';
import { PatientRegistrationModal } from './components/PatientRegistrationModal';
import { WhatsAppShareModal } from './components/WhatsAppShareModal';
import { RemoteIntakeModal } from './components/RemoteIntakeModal';

import { DashboardView } from './components/views/DashboardView';
import { PatientsView } from './components/views/PatientsView';
import { AppointmentsView } from './components/views/AppointmentsView';
import { CaseTakingView } from './components/views/CaseTakingView';
import { CaseSummaryView } from './components/views/CaseSummaryView';
import { RepertorisationView } from './components/views/RepertorisationView';
import { PrescriptionView } from './components/views/PrescriptionView';
import { FollowUpView } from './components/views/FollowUpView';
import { BillingView } from './components/views/BillingView';
import { ReportsView } from './components/views/ReportsView';
import { WhatsAppInboxView } from './components/views/WhatsAppInboxView';
import { DoctorProfileView } from './components/views/DoctorProfileView';
import { LoginView } from './components/auth/LoginView';
import { PublicShareView } from './components/patient-portal/PublicShareView';
import type { ClinicalSystemKey } from './types';

interface ShareState {
  isShareView: boolean;
  token: string | null;
  view: 'intake' | 'prescription' | 'billing' | 'custom_form' | null;
}

const parseShareFromUrl = (): ShareState => {
  try {
    const params = new URLSearchParams(window.location.search);
    const token = params.get('token');
    const view = params.get('view');
    if (token) {
      return { isShareView: true, token, view: (view as ShareState['view']) ?? 'intake' };
    }
  } catch { /* ignore */ }
  return { isShareView: false, token: null, view: null };
};

const MainLayout: React.FC = () => {
  const {
    activeTab, setActiveTab, selectPatient, setActiveSystemFormKey,
    currentUser, isAuthenticated, authLoading
  } = useClinic();

  const [isNewPatientModalOpen, setIsNewPatientModalOpen] = useState(false);
  const [shareState, setShareState] = useState<ShareState>(() => parseShareFromUrl());
  const [sidebarCollapsed, setSidebarCollapsed] = useState(() => {
    try { return localStorage.getItem('sidebar_collapsed') === 'true'; } catch { return false; }
  });

  useEffect(() => {
    try { localStorage.setItem('sidebar_collapsed', String(sidebarCollapsed)); } catch { /* ignore */ }
  }, [sidebarCollapsed]);

  useEffect(() => {
    const handleUrlChange = () => setShareState(parseShareFromUrl());
    window.addEventListener('popstate', handleUrlChange);
    return () => window.removeEventListener('popstate', handleUrlChange);
  }, []);

  useEffect(() => {
    if (shareState.isShareView) return;
    try {
      const params = new URLSearchParams(window.location.search);
      const view = params.get('tab');
      const sys = params.get('system') as ClinicalSystemKey | null;
      if (view) setActiveTab(view);
      if (sys) setActiveSystemFormKey(sys);
    } catch { /* ignore */ }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (shareState.isShareView && shareState.token && shareState.view) {
    return (
      <PublicShareView
        token={shareState.token}
        view={shareState.view}
        onExit={() => {
          window.history.replaceState({}, '', window.location.pathname);
          setShareState({ isShareView: false, token: null, view: null });
        }}
      />
    );
  }

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-100 text-slate-600 text-sm">
        Loading...
      </div>
    );
  }

  if (!isAuthenticated || !currentUser) {
    return <LoginView />;
  }

  const renderActiveView = () => {
    switch (activeTab) {
      case 'dashboard': return <DashboardView onOpenNewPatient={() => setIsNewPatientModalOpen(true)} />;
      case 'patients': return <PatientsView onOpenNewPatient={() => setIsNewPatientModalOpen(true)} />;
      case 'appointments': return <AppointmentsView />;
      case 'case_taking': return <CaseTakingView />;
      case 'case_summary': return <CaseSummaryView />;
      case 'repertorisation': return <RepertorisationView />;
      case 'prescription': return <PrescriptionView />;
      case 'follow_up': return <FollowUpView />;
      case 'billing': return <BillingView />;
      case 'reports': return <ReportsView />;
      case 'whatsapp': return <WhatsAppInboxView />;
      case 'doctor_info': return <DoctorProfileView />;
      default: return <DashboardView onOpenNewPatient={() => setIsNewPatientModalOpen(true)} />;
    }
  };

  return (
    <div className="flex h-screen w-full bg-slate-100 font-sans text-slate-900 overflow-hidden antialiased">
      <Sidebar
        collapsed={sidebarCollapsed}
        onToggle={() => setSidebarCollapsed(c => !c)}
        onOpenNewPatient={() => setIsNewPatientModalOpen(true)}
      />
      <div className="flex-1 flex flex-col h-full overflow-hidden min-w-0">
        <Header onOpenNewPatient={() => setIsNewPatientModalOpen(true)} />
        <PatientBanner onOpenNewPatient={() => setIsNewPatientModalOpen(true)} />
        <main className="flex-1 overflow-y-auto px-4 sm:px-8 py-6">
          <div className="max-w-7xl mx-auto">{renderActiveView()}</div>
        </main>
      </div>

      <PatientRegistrationModal isOpen={isNewPatientModalOpen} onClose={() => setIsNewPatientModalOpen(false)} />
      <WhatsAppShareModal />
      <RemoteIntakeModal />
    </div>
  );
};

export default function App() {
  return (
    <ClinicProvider>
      <MainLayout />
    </ClinicProvider>
  );
}