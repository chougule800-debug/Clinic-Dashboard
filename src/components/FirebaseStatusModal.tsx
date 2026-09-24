import React, { useState, useEffect } from 'react';
import { useClinic } from '../context/ClinicContext';
import {
  testFirestoreConnection,
  FirestoreConnectionDetails,
  getFirestoreConfigSummary
} from '../lib/firestoreService';
import {
  Cloud,
  CheckCircle2,
  AlertTriangle,
  RefreshCw,
  X,
  Server,
  Database,
  ShieldAlert,
  ShieldCheck,
  Copy,
  ExternalLink,
  Wifi,
  WifiOff
} from 'lucide-react';

interface FirebaseStatusModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const FirebaseStatusModal: React.FC<FirebaseStatusModalProps> = ({
  isOpen,
  onClose
}) => {
  const {
    firestoreStatus,
    syncAllToCloud,
    patients,
    systemForms,
    prescriptions,
    appointments,
    invoices
  } = useClinic();

  const [testing, setTesting] = useState(false);
  const [details, setDetails] = useState<FirestoreConnectionDetails | null>(null);
  const [copiedRule, setCopiedRule] = useState(false);
  const [syncResult, setSyncResult] = useState<{ successCount: number; errors: number } | null>(null);

  const configSummary = getFirestoreConfigSummary();

  const runTest = async () => {
    setTesting(true);
    setSyncResult(null);
    try {
      const res = await testFirestoreConnection();
      setDetails(res);
    } catch (e: any) {
      setDetails({
        connected: false,
        status: 'network_error',
        statusMessage: e?.message || 'Error executing connection check',
        projectId: configSummary.projectId,
        authDomain: configSummary.authDomain,
        latencyMs: 0,
        collectionsTested: [],
        timestamp: new Date().toLocaleTimeString()
      });
    } finally {
      setTesting(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      runTest();
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const sampleRules = `rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /{document=**} {
      allow read, write: if true; // Or restrict by auth
    }
  }
}`;

  const copyRulesToClipboard = () => {
    navigator.clipboard.writeText(sampleRules);
    setCopiedRule(true);
    setTimeout(() => setCopiedRule(false), 2500);
  };

  const handleManualSync = async () => {
    const res = await syncAllToCloud();
    setSyncResult(res);
    await runTest();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl max-w-xl w-full border border-slate-200 shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
        {/* Header */}
        <div className="bg-slate-900 text-white p-5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400">
              <Cloud className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-base text-white flex items-center gap-2">
                Firebase Cloud & Firestore Connection
              </h3>
              <p className="text-xs text-slate-300">
                Project: <code className="font-mono text-emerald-400 font-semibold">{configSummary.projectId}</code>
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

        {/* Content */}
        <div className="p-6 space-y-5 text-slate-800 text-xs">
          {/* Status Alert Banner */}
          {testing ? (
            <div className="p-4 bg-teal-50 border border-teal-200 rounded-xl flex items-center gap-3 text-teal-800">
              <RefreshCw className="w-5 h-5 text-teal-600 animate-spin shrink-0" />
              <div>
                <p className="font-bold text-sm">Testing Google Firebase Connection...</p>
                <p className="text-xs text-teal-700">Pinging Firestore endpoints and verifying read/write collections.</p>
              </div>
            </div>
          ) : details?.connected ? (
            <div className="p-4 bg-emerald-50 border border-emerald-300 rounded-xl flex items-start gap-3 text-emerald-900">
              <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
              <div>
                <p className="font-bold text-sm flex items-center gap-2">
                  <span>Firebase Firestore Connected & Online</span>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-200/80 text-emerald-900 font-bold">
                    {details.latencyMs} ms latency
                  </span>
                </p>
                <p className="text-xs text-emerald-700 mt-0.5">
                  {details.statusMessage}
                </p>
              </div>
            </div>
          ) : details?.status === 'permission_denied' ? (
            <div className="p-4 bg-amber-50 border border-amber-300 rounded-xl flex items-start gap-3 text-amber-900">
              <ShieldAlert className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
              <div>
                <p className="font-bold text-sm">Firebase Reachable • Firestore Security Rules Active</p>
                <p className="text-xs text-amber-800 mt-1 leading-relaxed">
                  The Google Firebase project <code className="font-mono font-bold">{configSummary.projectId}</code> is active and online. However, Firestore Security Rules in the Firebase console currently require read/write access.
                </p>
              </div>
            </div>
          ) : (
            <div className="p-4 bg-rose-50 border border-rose-300 rounded-xl flex items-start gap-3 text-rose-900">
              <WifiOff className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
              <div>
                <p className="font-bold text-sm">Firebase Connection Offline / Check Network</p>
                <p className="text-xs text-rose-800 mt-0.5">
                  {details?.statusMessage || 'Unable to connect to Firebase.'}
                </p>
              </div>
            </div>
          )}

          {/* Connection Diagnostics Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-slate-50 p-3.5 rounded-xl border border-slate-200">
            <div>
              <span className="text-[10px] text-slate-500 uppercase font-bold block">Firebase Project</span>
              <span className="font-mono font-bold text-slate-900 truncate block">{configSummary.projectId}</span>
            </div>
            <div>
              <span className="text-[10px] text-slate-500 uppercase font-bold block">Auth Domain</span>
              <span className="font-mono text-slate-700 truncate block text-[11px]">{configSummary.authDomain}</span>
            </div>
            <div>
              <span className="text-[10px] text-slate-500 uppercase font-bold block">App ID</span>
              <span className="font-mono text-slate-700 truncate block text-[11px]">{configSummary.appId?.slice(-12) || 'Configured'}</span>
            </div>
            <div>
              <span className="text-[10px] text-slate-500 uppercase font-bold block">Offline-First Safe</span>
              <span className="text-emerald-700 font-bold flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> Active Local
              </span>
            </div>
          </div>

          {/* Collections Tested */}
          {details?.collectionsTested && details.collectionsTested.length > 0 && (
            <div className="space-y-2">
              <h4 className="font-bold text-slate-800 text-xs flex items-center gap-1.5 uppercase tracking-wider">
                <Database className="w-3.5 h-3.5 text-teal-600" />
                <span>Firestore Collections Status</span>
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {details.collectionsTested.map(col => (
                  <div
                    key={col.name}
                    className="p-2.5 rounded-lg border border-slate-200 bg-white flex items-center justify-between"
                  >
                    <div>
                      <span className="font-mono font-bold text-slate-900 capitalize text-xs">
                        {col.name}
                      </span>
                      {col.count !== undefined && (
                        <span className="text-[11px] text-slate-500 ml-1.5">
                          ({col.count} documents)
                        </span>
                      )}
                    </div>
                    {col.accessible ? (
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3" /> Accessible
                      </span>
                    ) : (
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800 flex items-center gap-1">
                        <AlertTriangle className="w-3 h-3" /> Rules Restricted
                      </span>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Local Clinical Records Ready for Cloud Sync */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <h4 className="font-bold text-slate-800 text-xs flex items-center gap-1.5 uppercase tracking-wider">
                <Server className="w-3.5 h-3.5 text-teal-600" />
                <span>Local Clinical Records State</span>
              </h4>
              <span className="text-[11px] text-slate-500">
                Auto-saved in doctor storage
              </span>
            </div>

            <div className="grid grid-cols-3 sm:grid-cols-5 gap-2 text-center">
              <div className="bg-slate-50 p-2 rounded-lg border border-slate-200">
                <span className="block text-slate-500 text-[10px]">Patients</span>
                <strong className="text-slate-900 text-sm">{patients.length}</strong>
              </div>
              <div className="bg-slate-50 p-2 rounded-lg border border-slate-200">
                <span className="block text-slate-500 text-[10px]">System Forms</span>
                <strong className="text-teal-700 text-sm">{systemForms.length}</strong>
              </div>
              <div className="bg-slate-50 p-2 rounded-lg border border-slate-200">
                <span className="block text-slate-500 text-[10px]">Prescriptions</span>
                <strong className="text-slate-900 text-sm">{prescriptions.length}</strong>
              </div>
              <div className="bg-slate-50 p-2 rounded-lg border border-slate-200">
                <span className="block text-slate-500 text-[10px]">Appointments</span>
                <strong className="text-slate-900 text-sm">{appointments.length}</strong>
              </div>
              <div className="bg-slate-50 p-2 rounded-lg border border-slate-200">
                <span className="block text-slate-500 text-[10px]">Invoices</span>
                <strong className="text-slate-900 text-sm">{invoices.length}</strong>
              </div>
            </div>
          </div>

          {/* Firestore Rules Helper if Permission Notice */}
          {details?.status === 'permission_denied' && (
            <div className="bg-slate-900 text-slate-200 rounded-xl p-3.5 space-y-2 border border-slate-800">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-semibold text-emerald-400 flex items-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  Firebase Console Rules Setup (Quick Reference)
                </span>
                <button
                  type="button"
                  onClick={copyRulesToClipboard}
                  className="px-2 py-0.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 text-[10px] flex items-center gap-1 transition-colors"
                >
                  <Copy className="w-3 h-3" />
                  <span>{copiedRule ? 'Copied!' : 'Copy Rule'}</span>
                </button>
              </div>
              <pre className="font-mono text-[10px] bg-slate-950 p-2 rounded border border-slate-800 overflow-x-auto text-slate-300 leading-tight">
                {sampleRules}
              </pre>
              <p className="text-[10px] text-slate-400 leading-normal">
                To allow read/write in Firebase Console: Open <strong>Firestore Database</strong> → <strong>Rules</strong> tab → Paste the rule above → Click <strong>Publish</strong>.
              </p>
            </div>
          )}

          {/* Sync Result Feedback */}
          {syncResult && (
            <div className="p-3 bg-teal-50 border border-teal-200 rounded-xl flex items-center justify-between text-teal-900 text-xs">
              <span className="font-medium">
                Sync Completed: <strong>{syncResult.successCount}</strong> documents saved to cloud.
                {syncResult.errors > 0 && ` (${syncResult.errors} notices)`}
              </span>
              <CheckCircle2 className="w-4 h-4 text-teal-600" />
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="bg-slate-50 px-6 py-4 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3">
          <button
            type="button"
            onClick={runTest}
            disabled={testing}
            className="w-full sm:w-auto px-4 py-2 rounded-xl bg-white border border-slate-300 hover:bg-slate-100 text-slate-700 font-semibold text-xs transition-colors flex items-center justify-center gap-1.5"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${testing ? 'animate-spin' : ''}`} />
            <span>Re-Test Connection</span>
          </button>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <button
              type="button"
              onClick={handleManualSync}
              disabled={firestoreStatus.isSyncing}
              className="w-full sm:w-auto px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs transition-colors flex items-center justify-center gap-1.5 shadow-xs"
            >
              <Cloud className="w-3.5 h-3.5" />
              <span>{firestoreStatus.isSyncing ? 'Syncing...' : 'Sync All Data to Cloud'}</span>
            </button>

            <button
              type="button"
              onClick={onClose}
              className="w-full sm:w-auto px-4 py-2 rounded-xl bg-slate-200 hover:bg-slate-300 text-slate-800 font-semibold text-xs transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
