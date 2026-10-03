/**
 * Firestore has been fully removed from this project.
 * Supabase is the sole persistent database.
 *
 * This file is retained as a compatibility shim so that any lingering
 * import path resolves safely. Do NOT add Firestore code here.
 */

export interface FirestoreSyncStatus {
  isConfigured: boolean;
  isConnected: boolean;
  projectId: string;
  lastSyncedAt: string | null;
  error: string | null;
}

export interface FirestoreConnectionDetails {
  connected: boolean;
  status: 'connected' | 'permission_denied' | 'network_error' | 'unreachable';
  statusMessage: string;
  projectId: string;
  authDomain: string;
  latencyMs: number;
  collectionsTested: { name: string; accessible: boolean; count?: number; error?: string }[];
  timestamp: string;
}

export const getFirestoreConfigSummary = () => ({
  projectId: 'supabase',
  authDomain: 'supabase.co',
  storageBucket: 'clinical-attachments',
  appId: 'supabase'
});

export async function testFirestoreConnection(): Promise<FirestoreConnectionDetails> {
  return {
    connected: false,
    status: 'unreachable',
    statusMessage: 'Firestore has been removed. Supabase is the sole database.',
    projectId: 'supabase',
    authDomain: 'supabase.co',
    latencyMs: 0,
    collectionsTested: [],
    timestamp: new Date().toLocaleTimeString()
  };
}