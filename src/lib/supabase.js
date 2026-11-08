import { createClient } from '@supabase/supabase-js';

/**
 * Supabase client for real email + password accounts.
 *
 * Only the project URL and the *publishable* (anon) key are used here — both are
 * public values that are safe to ship in a browser bundle. The service-role key
 * must never appear in this project.
 *
 * Set them in `.env.local` for local development and in Vercel → Project →
 * Settings → Environment Variables for the deployed site:
 *
 *   VITE_SUPABASE_URL=https://<project-ref>.supabase.co
 *   VITE_SUPABASE_ANON_KEY=<publishable / anon key>
 */
const url = import.meta.env.VITE_SUPABASE_URL;
const key = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const isAuthConfigured = Boolean(url && key);

export const supabase = isAuthConfigured
  ? createClient(url, key, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true,
        storageKey: 'gg_auth_session',
      },
    })
  : null;

/** Normalise a Supabase user into the shape the UI uses. */
export function mapUser(authUser) {
  if (!authUser) return null;
  const meta = authUser.user_metadata || {};
  return {
    id: authUser.id,
    email: authUser.email,
    name: meta.name || (authUser.email ? authUser.email.split('@')[0] : ''),
    role: meta.role === 'worker' ? 'worker' : 'employer',
    company: meta.company || '',
  };
}

/** Turn Supabase error objects into short, human-readable copy. */
export function authErrorMessage(error) {
  const message = error?.message || '';
  const lower = message.toLowerCase();
  if (lower.includes('invalid login credentials')) return 'invalid-credentials';
  if (lower.includes('already registered') || lower.includes('already been registered')) return 'email-taken';
  if (lower.includes('email not confirmed')) return 'email-unconfirmed';
  if (lower.includes('password should be at least') || lower.includes('weak password')) return 'weak-password';
  if (lower.includes('rate limit') || lower.includes('too many')) return 'too-many';
  if (lower.includes('failed to fetch') || lower.includes('network')) return 'network';
  return message || 'auth-failed';
}
