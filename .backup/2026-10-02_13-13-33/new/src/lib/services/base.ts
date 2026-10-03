import { supabase } from '../supabase';
import type { PostgrestError } from '@supabase/supabase-js';

export class ServiceError extends Error {
  readonly code?: string;
  readonly details?: string;
  readonly hint?: string;

  constructor(message: string, cause?: PostgrestError | null) {
    super(message);
    this.name = 'ServiceError';
    this.code = cause?.code;
    this.details = cause?.details ?? undefined;
    this.hint = cause?.hint ?? undefined;
  }
}

export function handle<T>(data: T | null, error: PostgrestError | null, context: string): T {
  if (error) {
    console.error(`[Supabase:${context}]`, error);
    throw new ServiceError(`${context} failed: ${error.message || 'Unknown database error'}`, error);
  }
  if (data === null && context.toLowerCase().includes('fetch')) {
    throw new ServiceError(`${context} returned no data`);
  }
  return data as T;
}

export function requireUser(userId: string | null | undefined, context: string): string {
  if (!userId) {
    throw new ServiceError(`Not authenticated: cannot ${context}`);
  }
  return userId;
}

export function generateShareToken(): string {
  const bytes = new Uint8Array(24);
  if (typeof crypto !== 'undefined' && 'getRandomValues' in crypto) {
    crypto.getRandomValues(bytes);
  } else {
    for (let i = 0; i < bytes.length; i++) {
      bytes[i] = Math.floor(Math.random() * 256);
    }
  }
  return Array.from(bytes)
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
}

export const nowIso = () => new Date().toISOString();