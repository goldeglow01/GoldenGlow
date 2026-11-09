import { createClient } from '@supabase/supabase-js';

/**
 * Supabase client.
 *
 * Only the project URL and the publishable (anon) key are used here — both are
 * public values that are safe to ship in a browser bundle. The service-role key
 * is used only by the serverless contact function and must never appear here.
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

/**
 * Load the authoritative profile row for a user. A database trigger creates
 * this row on sign-up; if it has not landed yet, callers fall back to auth
 * metadata for display until the profile arrives.
 */
export async function fetchProfile(userId) {
  if (!supabase || !userId) return null;
  const { data, error } = await supabase
    .from('profiles')
    .select('id, email, role, name, company, city, trade, phone, bio, experience, industry, about, website')
    .eq('id', userId)
    .maybeSingle();
  if (error) return null;
  return data;
}

/** Merge a profiles row + auth user into the shape the UI uses. */
export function mapProfile(profile, authUser) {
  if (!profile && !authUser) return null;
  const meta = authUser?.user_metadata || {};
  return {
    id: profile?.id || authUser?.id,
    email: profile?.email || authUser?.email || '',
    name:
      profile?.name ||
      meta.name ||
      (authUser?.email ? authUser.email.split('@')[0] : ''),
    role: profile?.role || (meta.role === 'worker' ? 'worker' : 'employer'),
    company: profile?.company || meta.company || '',
    city: profile?.city || '',
    trade: profile?.trade || '',
    phone: profile?.phone || '',
    bio: profile?.bio || '',
    experience: profile?.experience || '',
    industry: profile?.industry || '',
    about: profile?.about || '',
    website: profile?.website || '',
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
