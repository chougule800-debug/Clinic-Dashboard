import React, { useState, useEffect } from 'react';
import { ClinicProvider, useClinic } from './context/ClinicContext';
import { Header } from './components/Header';
import { Sidebar } from './components/Sidebar';
import { PatientBanner } from './components/PatientBanner';
import { PatientRegistrationModal } from './components/PatientRegistrationModal';
import { WhatsAppShareModal } from './components/WhatsAppShareModal';
import { RemoteIntakeModal } from './components/RemoteIntakeModal';
import { PatientPortalView } from './components/patient-portal/PatientPortalView';

// Views
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
import { ClinicalSystemKey } from './types';

interface PatientPortalState {
  isPatientPortal: boolean;
  mode: 'intake' | 'prescription' | 'billing';
  patientId: string | null;
  system: ClinicalSystemKey | null;
  rxId: string | null;
  invId: string | null;
}

const checkPatientPortalFromUrl = (): PatientPortalState => {
  try {
    const params = new URLSearchParams(window.location.search);
    const view = params.get('view');
    const intake = params.get('intake');
    const rx = params.get('rx');
    const inv = params.get('inv');
    const mode = params.get('mode');
    const pt = params.get('pt') || intake;
    const system = (params.get('system') as ClinicalSystemKey) || null;

    if (view === 'intake' || intake || mode === 'intake') {
      return {
        isPatientPortal: true,
        mode: 'intake',
        patientId: pt,
        system: system || 'headache',
        rxId: null,
        invId: null
      };
    }

    if (view === 'prescription' || view === 'rx' || rx) {
      return {
        isPatientPortal: true,
        mode: 'prescription',
        patientId: pt,
        system: null,
        rxId: rx,
        invId: null
      };
    }

    if (view === 'billing' || view === 'inv' || inv) {
      return {
        isPatientPortal: true,
        mode: 'billing',
        patientId: pt,
        system: null,
        rxId: null,
        invId: inv
      };
    }
  } catch (e) {
    console.warn('URL parsing error:', e);
  }
  return {
    isPatientPortal: false,
    mode: 'intake',
    patientId: null,
    system: null,
    rxId: null,
    invId: null
  };
};

const MainLayout: React.FC = () => {
  const {
    activeTab,
    selectPatient,
    setActiveSystemFormKey,
    currentUser
  } = useClinic();

  const [isNewPatientModalOpen, setIsNewPatientModalOpen] = useState(false);
  const [portalState, setPortalState] = useState<PatientPortalState>(() => checkPatientPortalFromUrl());

  // Listen to popstate or direct URL changes
  useEffect(() => {
    const handleUrlChange = () => {
      setPortalState(checkPatientPortalFromUrl());
    };
    window.addEventListener('popstate', handleUrlChange);
    return () => window.removeEventListener('popstate', handleUrlChange);
  }, []);

  // Sync patient selection if present in portal URL
  useEffect(() => {
    if (portalState.patientId) {
      selectPatient(portalState.patientId);
    }
    if (portalState.system) {
      setActiveSystemFormKey(portalState.system);
    }
  }, [portalState.patientId, portalState.system]);

  // If patient portal mode is active, ONLY render the standalone form / rx / bill
  // STRICT ISOLATION: The doctor dashboard, sidebar, header, and patient lists are completely hidden!
  if (portalState.isPatientPortal) {
    return (
      <PatientPortalView
        mode={portalState.mode}
        patientId={portalState.patientId}
        system={portalState.system}
        rxId={portalState.rxId}
        invId={portalState.invId}
        onExitToDashboard={() => {
          window.history.replaceState({}, '', window.location.pathname);
          setPortalState({
            isPatientPortal: false,
            mode: 'intake',
            patientId: null,
            system: null,
            rxId: null,
            invId: null
          });
        }}
      />
    );
  }

  // If doctor is not logged in, render the secure Doctor Login screen
  if (!currentUser) {
    return <LoginView />;
  }

  const renderActiveView = () => {
    switch (activeTab) {
      case 'dashboard':
        return <DashboardView onOpenNewPatient={() => setIsNewPatientModalOpen(true)} />;
      case 'patients':
        return <PatientsView onOpenNewPatient={() => setIsNewPatientModalOpen(true)} />;
      case 'appointments':
        return <AppointmentsView />;
      case 'case_taking':
        return <CaseTakingView />;
      case 'case_summary':
        return <CaseSummaryView />;
      case 'repertorisation':
        return <RepertorisationView />;
      case 'prescription':
        return <PrescriptionView />;
      case 'follow_up':
        return <FollowUpView />;
      case 'billing':
        return <BillingView />;
      case 'reports':
        return <ReportsView />;
      case 'whatsapp':
        return <WhatsAppInboxView />;
      case 'doctor_info':
        return <DoctorProfileView />;
      default:
        return <DashboardView onOpenNewPatient={() => setIsNewPatientModalOpen(true)} />;
    }
  };

  return (
    <div className="flex h-screen w-full bg-slate-100 font-sans text-slate-900 overflow-hidden antialiased">
      {/* Left Navigation Sidebar */}
      <Sidebar onOpenNewPatient={() => setIsNewPatientModalOpen(true)} />

      {/* Main App Content Area */}
      <div className="flex-1 flex flex-col h-full overflow-hidden min-w-0">
        {/* Global Clinic Header */}
        <Header onOpenNewPatient={() => setIsNewPatientModalOpen(true)} />

        {/* Global Active Patient Banner & Quick Switcher */}
        <PatientBanner onOpenNewPatient={() => setIsNewPatientModalOpen(true)} />

        {/* Dynamic Viewport Container */}
        <main className="flex-1 overflow-y-auto px-4 sm:px-8 py-6">
          <div className="max-w-7xl mx-auto">
            {renderActiveView()}
          </div>
        </main>
      </div>

      {/* Global Modals */}
      <PatientRegistrationModal
        isOpen={isNewPatientModalOpen}
        onClose={() => setIsNewPatientModalOpen(false)}
      />

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
