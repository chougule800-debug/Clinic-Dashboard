import React from 'react';
import { useClinic } from '../context/ClinicContext';
import type { ClinicalSystemKey } from '../types';
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
  ChevronRight,
  UserCheck
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
    conversations,
    currentUser
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
    { id: 'reports', label: 'Reports', icon: BarChart3 },
    { id: 'doctor_info', label: 'Doctor Profile', icon: UserCheck }
  ];

  const clinicalSystems: {
    key: ClinicalSystemKey;
    label: string;
    icon: React.ComponentType<{ className?: string }>;
  }[] = [
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
    <aside
      id="app-sidebar"
      className="w-72 bg-slate-900 text-slate-200 border-r border-slate-800 flex flex-col shrink-0 min-h-[calc(100vh-4rem)]"
    >
      <div className="p-3.5 space-y-1.5 flex-1 overflow-y-auto">
        <div className="px-3.5 py-1.5 text-xs font-bold text-slate-400 uppercase tracking-wider">
          Clinical Navigation
        </div>

        {mainNavItems.map(item => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <div key={item.id}>
              <button
                id={`sidebar-tab-${item.id}`}
                onClick={() => setActiveTab(item.id)}
                className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-semibold transition-all ${
                  isActive
                    ? 'bg-teal-600 text-white shadow-md font-bold'
                    : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon
                    className={`w-5 h-5 shrink-0 ${isActive ? 'text-white' : 'text-slate-400'}`}
                  />
                  <span className="tracking-tight">{item.label}</span>
                </div>
                {item.badge !== undefined && (
                  <span className="px-2 py-0.5 text-xs font-bold rounded-full bg-emerald-500 text-slate-950">
                    {item.badge}
                  </span>
                )}
              </button>

              {item.id === 'case_taking' && activeTab === 'case_taking' && (
                <div className="mt-1.5 ml-5 pl-2.5 border-l-2 border-slate-700/80 space-y-1 py-1">
                  <div className="px-2.5 py-1 text-xs font-bold uppercase tracking-wider text-slate-400">
                    9 Clinical Systems
                  </div>
                  {clinicalSystems.map(sys => {
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
                        className={`w-full flex items-center justify-between px-2.5 py-2 rounded-lg text-xs font-medium transition-colors ${
                          isSysActive
                            ? 'bg-teal-900/70 text-teal-300 font-bold border border-teal-600/70'
                            : 'text-slate-300 hover:text-white hover:bg-slate-800/70'
                        }`}
                      >
                        <div className="flex items-center gap-2.5 truncate">
                          <SysIcon className="w-3.5 h-3.5 shrink-0" />
                          <span className="truncate">{sys.label}</span>
                        </div>
                        {isSysActive && (
                          <ChevronRight className="w-3.5 h-3.5 text-teal-400 shrink-0" />
                        )}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </div>

      <div className="p-3.5 border-t border-slate-800 bg-slate-950/70 text-xs space-y-2">
        <button
          onClick={() => setActiveTab('doctor_info')}
          className="w-full text-left p-2 rounded-xl bg-slate-800/80 hover:bg-slate-800 border border-slate-700/60 transition-colors flex items-center gap-2.5"
        >
          <div className="w-8 h-8 rounded-lg bg-teal-500/20 text-teal-300 flex items-center justify-center font-bold text-xs shrink-0">
            {currentUser?.name?.replace('Dr. ', '').charAt(0) || 'D'}
          </div>
          <div className="min-w-0 flex-1">
            <p className="font-bold text-white text-xs truncate">
              {currentUser?.name || 'Doctor'}
            </p>
            <p className="text-[10px] text-teal-300 truncate">
              {currentUser?.role === 'owner' ? 'Owner / Admin' : 'Doctor'}
            </p>
          </div>
          <UserCheck className="w-3.5 h-3.5 text-slate-400 shrink-0" />
        </button>

        <div className="flex items-center gap-2 text-emerald-400 font-semibold text-[11px]">
          <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          <span>Cloud sync active</span>
        </div>
      </div>
    </aside>
  );
};