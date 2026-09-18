import React, { useState, useEffect } from 'react';
import { ClinicProvider, useClinic } from './context/ClinicContext';
import { Header } from './components/Header';
import { Sidebar } from './components/Sidebar';
import { PatientBanner } from './components/PatientBanner';
import { PatientRegistrationModal } from './components/PatientRegistrationModal';
import { WhatsAppShareModal } from './components/WhatsAppShareModal';
import { RemoteIntakeModal } from './components/RemoteIntakeModal';

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
import { ClinicalSystemKey } from './types';

const MainLayout: React.FC = () => {
  const {
    activeTab,
    openRemoteIntakeModal,
    selectPatient,
    setActiveSystemFormKey
  } = useClinic();

  const [isNewPatientModalOpen, setIsNewPatientModalOpen] = useState(false);

  // Check URL params for direct simulated WhatsApp intake link opening
  useEffect(() => {
    try {
      const params = new URLSearchParams(window.location.search);
      const pt = params.get('pt');
      const system = params.get('system') as ClinicalSystemKey | null;
      const mode = params.get('mode');

      if (pt && mode === 'intake') {
        selectPatient(pt);
        if (system) {
          setActiveSystemFormKey(system);
        }
        openRemoteIntakeModal(pt, system || 'headache');
      }
    } catch (e) {
      console.warn('URL parsing error:', e);
    }
  }, []);

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
