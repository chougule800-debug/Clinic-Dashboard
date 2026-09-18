import React from 'react';
import { useClinic } from '../context/ClinicContext';
import { ClinicalSystemKey } from '../types';
import {
  LayoutDashboard,
  Users,
  Calendar,
  ClipboardList,
  FileCheck2,
  GitBranch,
  Pill,
  Clock,
  MessageSquare,
  CreditCard,
  BarChart3,
  Brain,
  Sparkles,
  Utensils,
  Droplet,
  Activity,
  Wind,
  HeartHandshake,
  Baby,
  ChevronRight
} from 'lucide-react';

interface SidebarProps {
  onOpenNewPatient?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = () => {
  const {
    activeTab,
    setActiveTab,
    activeSystemFormKey,
    setActiveSystemFormKey,
    conversations
  } = useClinic();

  const totalUnreadWhatsApp = conversations.reduce((acc, c) => acc + c.unreadCount, 0);

  const mainNavItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'patients', label: 'Patients', icon: Users },
    { id: 'appointments', label: 'Appointments', icon: Calendar },
    { id: 'case_taking', label: 'Case Taking', icon: ClipboardList },
    { id: 'case_summary', label: 'Case Summary', icon: FileCheck2 },
    { id: 'repertorisation', label: 'Repertorisation', icon: GitBranch },
    { id: 'prescription', label: 'Prescription', icon: Pill },
    { id: 'follow_up', label: 'Follow-up', icon: Clock },
    {
      id: 'whatsapp',
      label: 'WhatsApp Inbox',
      icon: MessageSquare,
      badge: totalUnreadWhatsApp > 0 ? totalUnreadWhatsApp : undefined
    },
    { id: 'billing', label: 'Billing', icon: CreditCard },
    { id: 'reports', label: 'Reports', icon: BarChart3 }
  ];

  const clinicalSystems: { key: ClinicalSystemKey; label: string; icon: any }[] = [
    { key: 'headache', label: 'Headache / Neuro', icon: Brain },
    { key: 'skin_hair', label: 'Skin & Hair', icon: Sparkles },
    { key: 'gastrointestinal', label: 'Gastrointestinal', icon: Utensils },
    { key: 'urinary', label: 'Urinary System', icon: Droplet },
    { key: 'musculoskeletal', label: 'Musculoskeletal', icon: Activity },
    { key: 'respiratory', label: 'Respiratory', icon: Wind },
    { key: 'female_gynae', label: 'Female / Gynae', icon: HeartHandshake },
    { key: 'pediatric', label: 'Pediatric', icon: Baby },
    { key: 'other_mind_generals', label: 'Mind & Generals', icon: Sparkles }
  ];

  return (
    <aside id="app-sidebar" className="w-64 bg-slate-900 text-slate-300 border-r border-slate-800 flex flex-col shrink-0 min-h-[calc(100vh-4rem)]">
      <div className="p-3 space-y-1 flex-1 overflow-y-auto">
        <div className="px-3 py-1 text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
          Clinical Navigation
        </div>

        {mainNavItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <div key={item.id}>
              <button
                id={`sidebar-tab-${item.id}`}
                onClick={() => setActiveTab(item.id)}
                className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-medium transition-all ${
                  isActive
                    ? 'bg-teal-600 text-white shadow-sm font-semibold'
                    : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                  <span>{item.label}</span>
                </div>
                {item.badge !== undefined && (
                  <span className="px-1.5 py-0.5 text-[10px] font-bold rounded-full bg-emerald-500 text-slate-950">
                    {item.badge}
                  </span>
                )}
              </button>

              {/* Nested Sub-menu for Case Taking if selected */}
              {item.id === 'case_taking' && activeTab === 'case_taking' && (
                <div className="mt-1 ml-4 pl-2 border-l border-slate-700/80 space-y-0.5 py-1">
                  <div className="px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-slate-500">
                    9 Clinical Systems
                  </div>
                  {clinicalSystems.map((sys) => {
                    const SysIcon = sys.icon;
                    const isSysActive = activeSystemFormKey === sys.key;
                    return (
                      <button
                        key={sys.key}
                        id={`sidebar-sub-system-${sys.key}`}
                        onClick={() => {
                          setActiveTab('case_taking');
                          setActiveSystemFormKey(sys.key);
                        }}
                        className={`w-full flex items-center justify-between px-2 py-1.5 rounded-md text-[11px] transition-colors ${
                          isSysActive
                            ? 'bg-teal-900/60 text-teal-300 font-semibold border border-teal-700/60'
                            : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
                        }`}
                      >
                        <div className="flex items-center gap-2 truncate">
                          <SysIcon className="w-3 h-3 shrink-0" />
                          <span className="truncate">{sys.label}</span>
                        </div>
                        {isSysActive && <ChevronRight className="w-3 h-3 text-teal-400 shrink-0" />}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Clinic & Firestore Cloud Footer */}
      <div className="p-3 border-t border-slate-800 bg-slate-950/60 text-[11px]">
        <div className="flex items-center gap-1.5 text-emerald-400 font-medium mb-1">
          <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          <span>Firestore Connected: ananyainfotech</span>
        </div>
        <p className="text-slate-400 text-[10px] leading-relaxed">
          Dr. Bharat Chougule • Belgaum 591108
        </p>
      </div>
    </aside>
  );
};
