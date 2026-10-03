import React, { useEffect, useState } from 'react';
import { useClinic } from '../context/ClinicContext';
import { supabase, isSupabaseConfigured } from '../lib/supabase';
import {
  Cloud,
  CheckCircle2,
  AlertTriangle,
  RefreshCw,
  X,
  Server,
  WifiOff,
  Database,
  ShieldCheck
} from 'lucide-react';

interface SupabaseStatusModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface Status {
  connected: boolean;
  latencyMs: number;
  projectUrl: string;
  error: string | null;
  message: string;
  lastChecked: string;
  counts: {
    patients: number;
    systemForms: number;
    prescriptions: number;
    appointments: number;
    invoices: number;
    conversations: number;
  };
}

export const SupabaseStatusModal: React.FC<SupabaseStatusModalProps> = ({ isOpen, onClose }) => {
  const {
    patients,
    systemForms,
    prescriptions,
    appointments,
    invoices,
    conversations,
    resetDatabase,
    currentUser
  } = useClinic();

  const [testing, setTesting] = useState(false);
  const [status, setStatus] = useState<Status | null>(null);

  const runTest = async () => {
    setTesting(true);
    const start = Date.now();
    let connected = false;
    let error: string | null = null;
    let message = 'Connected to Supabase.';

    if (!isSupabaseConfigured) {
      error = 'Supabase credentials are missing. Update your .env file.';
      message = 'Not configured';
    } else {
      try {
        const { error: pingError } = await supabase
          .from('profiles')
          .select('id', { count: 'exact', head: true })
          .limit(1);
        if (pingError) {
          error = pingError.message;
          message = 'Reachable but permission blocked.';
        } else {
          connected = true;
        }
      } catch (err) {
        error = err instanceof Error ? err.message : 'Network error';
        message = 'Unable to reach Supabase.';
      }
    }

    const latency = Date.now() - start;

    setStatus({
      connected,
      latencyMs: latency,
      projectUrl: import.meta.env.VITE_SUPABASE_URL || '(not set)',
      error,
      message,
      lastChecked: new Date().toLocaleTimeString(),
      counts: {
        patients: patients.length,
        systemForms: systemForms.length,
        prescriptions: prescriptions.length,
        appointments: appointments.length,
        invoices: invoices.length,
        conversations: conversations.length
      }
    });
    setTesting(false);
  };

  useEffect(() => {
    if (isOpen) void runTest();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl max-w-lg w-full border border-slate-200 shadow-2xl overflow-hidden">
        <div className="bg-slate-900 text-white p-5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400">
              <Cloud className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-base text-white">Cloud Connection Status</h3>
              <p className="text-xs text-slate-300">
                Supabase {currentUser ? `• signed in as ${currentUser.email}` : ''}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-5 text-xs">
          {testing ? (
            <div className="p-4 bg-teal-50 border border-teal-200 rounded-xl flex items-center gap-3 text-teal-800">
              <RefreshCw className="w-5 h-5 text-teal-600 animate-spin shrink-0" />
              <div>
                <p className="font-bold text-sm">Testing cloud connection...</p>
                <p className="text-xs text-teal-700">
                  Pinging database and verifying session.
                </p>
              </div>
            </div>
          ) : status?.connected ? (
            <div className="p-4 bg-emerald-50 border border-emerald-300 rounded-xl flex items-start gap-3 text-emerald-900">
              <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
              <div>
                <p className="font-bold text-sm flex items-center gap-2">
                  <span>Cloud Database Online</span>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-200/80 text-emerald-900 font-bold">
                    {status.latencyMs} ms
                  </span>
                </p>
                <p className="text-xs text-emerald-700 mt-0.5">{status.message}</p>
              </div>
            </div>
          ) : (
            <div className="p-4 bg-rose-50 border border-rose-300 rounded-xl flex items-start gap-3 text-rose-900">
              <WifiOff className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
              <div>
                <p className="font-bold text-sm">
                  {isSupabaseConfigured ? 'Connection issue' : 'Supabase not configured'}
                </p>
                <p className="text-xs text-rose-800 mt-0.5">
                  {status?.error || 'Unable to reach Supabase.'}
                </p>
              </div>
            </div>
          )}

          {!isSupabaseConfigured && (
            <div className="p-3 bg-amber-50 border border-amber-300 rounded-xl text-amber-900 text-xs space-y-1">
              <strong className="block">Setup required</strong>
              <p>
                Add <code className="font-mono">VITE_SUPABASE_URL</code> and{' '}
                <code className="font-mono">VITE_SUPABASE_ANON_KEY</code> to your{' '}
                <code className="font-mono">.env</code> file.
              </p>
            </div>
          )}

          {status && (
            <div className="grid grid-cols-2 gap-3">
              <div className="col-span-2 bg-slate-50 p-3 rounded-xl border border-slate-200">
                <span className="text-[10px] text-slate-500 uppercase font-bold block">
                  Project URL
                </span>
                <span className="font-mono text-xs text-slate-800 break-all">
                  {status.projectUrl}
                </span>
              </div>
            </div>
          )}

          {status && (
            <div className="space-y-2">
              <h4 className="font-bold text-slate-800 text-xs flex items-center gap-1.5 uppercase tracking-wider">
                <Database className="w-3.5 h-3.5 text-teal-600" />
                <span>Records in Your Account</span>
              </h4>
              <div className="grid grid-cols-3 gap-2 text-center">
                {[
                  { label: 'Patients', value: status.counts.patients },
                  { label: 'System Forms', value: status.counts.systemForms },
                  { label: 'Prescriptions', value: status.counts.prescriptions },
                  { label: 'Appointments', value: status.counts.appointments },
                  { label: 'Invoices', value: status.counts.invoices },
                  { label: 'Conversations', value: status.counts.conversations }
                ].map(item => (
                  <div
                    key={item.label}
                    className="bg-slate-50 p-2 rounded-lg border border-slate-200"
                  >
                    <span className="block text-slate-500 text-[10px]">{item.label}</span>
                    <strong className="text-slate-900 text-sm">{item.value}</strong>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex items-start gap-2 text-slate-700">
            <ShieldCheck className="w-4 h-4 text-teal-600 shrink-0 mt-0.5" />
            <span className="text-[11px] leading-relaxed">
              All patient data is stored securely in Supabase with row-level security. Each
              doctor has an isolated workspace and their own records.
            </span>
          </div>
        </div>

        <div className="bg-slate-50 px-6 py-4 border-t border-slate-200 flex items-center justify-between gap-3">
          <button
            type="button"
            onClick={runTest}
            disabled={testing}
            className="px-4 py-2 rounded-xl bg-white border border-slate-300 hover:bg-slate-100 text-slate-700 font-semibold text-xs transition-colors flex items-center gap-1.5"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${testing ? 'animate-spin' : ''}`} />
            <span>Re-Test</span>
          </button>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={async () => {
                await resetDatabase();
                await runTest();
              }}
              className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs transition-colors flex items-center gap-1.5"
            >
              <Server className="w-3.5 h-3.5" />
              <span>Reload Data</span>
            </button>
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-slate-200 hover:bg-slate-300 text-slate-800 font-semibold text-xs transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// silence unused warning for AlertTriangle in some bundlers
void AlertTriangle;