/**
 * Firebase has been fully removed from this project.
 * Supabase is the sole persistent database.
 *
 * This file is retained as a compatibility shim so that any lingering
 * import path resolves safely. Do NOT add Firebase code here.
 */
export const FIREBASE_REMOVED = true;

export default {
  removed: true,
  message: 'Firebase was replaced by Supabase. See src/lib/supabase.ts.'
};