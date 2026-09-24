import React, { useState } from 'react';
import { useClinic } from '../context/ClinicContext';
import { CLINIC_CONFIG } from '../config/clinicConfig';
import { FirebaseStatusModal } from './FirebaseStatusModal';
import {
  Stethoscope,
  Search,
  MessageSquare,
  ShieldCheck,
  UserPlus,
  RefreshCw,
  Bell,
  CheckCircle2,
  Calendar,
  Cloud,
  Loader2,
  UserCheck
} from 'lucide-react';

interface HeaderProps {
  onOpenNewPatient: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onOpenNewPatient }) => {
  const {
    patients,
    selectPatient,
    setActiveTab,
    conversations,
    resetDatabase,
    firestoreStatus,
    syncAllToCloud,
    isFirebaseModalOpen,
    openFirebaseModal,
    closeFirebaseModal,
    currentUser
  } = useClinic();

  const [searchQuery, setSearchQuery] = useState('');
  const [showSearchResults, setShowSearchResults] = useState(false);
  const [syncToast, setSyncToast] = useState<string | null>(null);

  const totalUnreadWhatsApp = conversations.reduce((acc, c) => acc + c.unreadCount, 0);

  const handleSyncCloud = async () => {
    const res = await syncAllToCloud();
    setSyncToast(`Synced ${res.successCount} items`);
    setTimeout(() => setSyncToast(null), 3000);
  };

  const filteredPatients = searchQuery.trim()
    ? patients.filter(
        p =>
          p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          p.mobile.includes(searchQuery) ||
          p.id.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : [];

  const activeDocName = currentUser?.name || CLINIC_CONFIG.doctorName;
  const activeQual = currentUser?.qualifications || CLINIC_CONFIG.qualifications;
  const activeReg = currentUser?.regNo || CLINIC_CONFIG.regNo;
  const activeClinic = currentUser?.clinicName || CLINIC_CONFIG.appName;

  return (
    <header id="main-app-header" className="bg-slate-900 text-white border-b border-slate-800 sticky top-0 z-30">
      <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between gap-4">
        {/* Brand & Doctor Credentials */}
        <div className="flex items-center gap-3 shrink-0">
          <button
            onClick={() => setActiveTab('doctor_info')}
            className="w-10 h-10 rounded-xl bg-teal-500/20 hover:bg-teal-500/30 border border-teal-500/30 flex items-center justify-center text-teal-400 shadow-inner transition-colors"
            title="View Doctor Profile & Multi-Doctor Management"
          >
            <Stethoscope className="w-5 h-5" />
          </button>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-lg sm:text-xl tracking-tight text-white">{activeClinic}</span>
              <span className="inline-flex items-center gap-1 text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-full bg-teal-950 text-teal-300 border border-teal-800">
                Clinic & Case Taking
              </span>
            </div>
            <p className="text-xs text-slate-300 hidden md:block">
              {activeDocName}, {activeQual} • Reg. No. {activeReg}
            </p>
          </div>
        </div>

        {/* Universal Patient Search */}
        <div className="relative flex-1 max-w-md hidden sm:block">
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              id="global-patient-search-input"
              type="text"
              placeholder="Search patient by name, mobile, ABHA ID or PT-#..."
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setShowSearchResults(true);
              }}
              onFocus={() => setShowSearchResults(true)}
              className="w-full bg-slate-800/90 border border-slate-700 rounded-lg pl-9 pr-4 py-1.5 text-xs text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all"
            />
          </div>

          {/* Search Dropdown */}
          {showSearchResults && searchQuery.trim().length > 0 && (
            <div
              id="search-results-dropdown"
              className="absolute left-0 right-0 top-full mt-1.5 bg-slate-800 border border-slate-700 rounded-xl shadow-2xl overflow-hidden z-50 max-h-72 overflow-y-auto"
            >
              {filteredPatients.length > 0 ? (
                <div className="py-1">
                  <div className="px-3 py-1.5 text-[11px] font-semibold uppercase tracking-wider text-slate-400 border-b border-slate-700">
                    Matching Patients ({filteredPatients.length})
                  </div>
                  {filteredPatients.map(p => (
                    <button
                      key={p.id}
                      onClick={() => {
                        selectPatient(p.id);
                        setShowSearchResults(false);
                        setSearchQuery('');
                      }}
                      className="w-full px-3 py-2 text-left hover:bg-slate-700/60 flex items-center justify-between transition-colors border-b border-slate-700/40 last:border-0"
                    >
                      <div>
                        <div className="text-xs font-semibold text-white">{p.name}</div>
                        <div className="text-[11px] text-slate-400">
                          {p.age}y/{p.gender} • {p.mobile}
                        </div>
                      </div>
                      <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-teal-950 text-teal-300 border border-teal-800">
                        {p.id}
                      </span>
                    </button>
                  ))}
                </div>
              ) : (
                <div className="p-3 text-center text-xs text-slate-400">
                  No patient found matching "{searchQuery}"
                </div>
              )}
            </div>
          )}
        </div>

        {/* Right Tools & Badges */}
        <div className="flex items-center gap-2 shrink-0">
          {/* Firestore Status Pill with Diagnostics & Sync Modal */}
          <button
            id="header-btn-firestore-sync"
            onClick={openFirebaseModal}
            title={`Firebase Project: ${firestoreStatus.projectId} (${firestoreStatus.lastSyncedAt ? 'Last synced ' + firestoreStatus.lastSyncedAt : 'Active Cloud Sync'}). Click for Diagnostics & Rules.`}
            className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-emerald-950/70 border border-emerald-800/80 text-emerald-300 hover:bg-emerald-900/60 text-xs font-medium transition-colors cursor-pointer"
          >
            {firestoreStatus.isSyncing ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin text-emerald-400" />
            ) : (
              <Cloud className="w-3.5 h-3.5 text-emerald-400" />
            )}
            <span className="text-[11px] font-mono">ananyainfotech</span>
            {syncToast ? (
              <span className="text-[10px] text-teal-200 font-semibold ml-1 bg-teal-800/60 px-1.5 py-0.2 rounded">
                {syncToast}
              </span>
            ) : (
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            )}
          </button>

          {/* WhatsApp Inbox Shortcut with Live Counter */}
          <button
            id="header-btn-whatsapp-inbox"
            onClick={() => setActiveTab('whatsapp')}
            title="Open WhatsApp Case Taking & Notifications"
            className="relative p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-emerald-400 transition-colors flex items-center gap-1.5 text-xs font-medium"
          >
            <MessageSquare className="w-4 h-4 text-emerald-400" />
            <span className="hidden lg:inline">WhatsApp</span>
            {totalUnreadWhatsApp > 0 && (
              <span className="w-5 h-5 rounded-full bg-emerald-500 text-slate-950 font-bold text-[11px] flex items-center justify-center">
                {totalUnreadWhatsApp}
              </span>
            )}
          </button>

          {/* Quick Add Patient */}
          <button
            id="header-btn-new-patient"
            onClick={onOpenNewPatient}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg bg-teal-600 hover:bg-teal-500 text-white transition-colors shadow-xs"
          >
            <UserPlus className="w-4 h-4" />
            <span className="hidden sm:inline">Register Patient</span>
          </button>

          {/* Doctor Info & Switch Account */}
          <button
            id="header-btn-doctor-info"
            onClick={() => setActiveTab('doctor_info')}
            title="Doctor Information, Credentials & Security"
            className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-teal-300 hover:text-white transition-colors text-xs flex items-center gap-1.5 font-medium border border-slate-700/60"
          >
            <UserCheck className="w-4 h-4 text-teal-400" />
            <span className="hidden xl:inline">{currentUser?.name?.split(' ')[1] || 'Doctor'}</span>
          </button>

          {/* Reset Demo Data Button */}
          <button
            id="header-btn-reset-demo"
            onClick={() => {
              if (window.confirm('Reset database to default clinical sample patients and cases?')) {
                resetDatabase();
              }
            }}
            title="Reset database to demo clinical data"
            className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors text-xs"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Firebase Cloud Connection Diagnostics & Sync Modal */}
      <FirebaseStatusModal
        isOpen={isFirebaseModalOpen}
        onClose={closeFirebaseModal}
      />
    </header>
  );
};
