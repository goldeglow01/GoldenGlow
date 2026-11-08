/**
 * Admin access for the /admin panel.
 *
 * The password is never stored in plain text: only its SHA-256 digest is
 * compared. Email and digest can be overridden at build time with
 * VITE_ADMIN_EMAIL / VITE_ADMIN_PASSWORD_HASH (any sha256 hex string).
 *
 * IMPORTANT — this is a browser-side gate, not server-side security. It keeps
 * the panel out of normal navigation and keeps the password out of the bundle,
 * but anyone who reads the JavaScript can attempt guesses offline. Before the
 * panel holds data that matters, move the gate to a server route (Supabase
 * auth with an admin role, or a Vercel function) — the panel itself needs no
 * changes for that.
 */

const SESSION_KEY = 'gg_admin_session';
const SESSION_TTL = 8 * 60 * 60 * 1000; // 8 hours

// Vite replaces `import.meta.env.VITE_*` at build time from `.env.local` (or
// the Vercel project environment). There is no `process` object in the browser,
// so only `import.meta.env` may be read here.
const env = import.meta.env.VITE_ADMIN_EMAIL || '';
const ADMIN_EMAIL = env.toLowerCase() || 'info@goldenglowqr.com';

const adminPasswordHash = import.meta.env.VITE_ADMIN_PASSWORD_HASH || '';
const ADMIN_PASSWORD_HASH = adminPasswordHash.toLowerCase() ||
  '7fdb287e611a09b520ace998aac61fbfacc9c36ee655114f6a1eb3df91e3cbf9';

async function sha256(value) {
  if (!globalThis.crypto?.subtle) return null;
  const data = new TextEncoder().encode(value);
  const digest = await crypto.subtle.digest('SHA-256', data);
  return Array.from(new Uint8Array(digest))
    .map((byte) => byte.toString(16).padStart(2, 0))
    .join('');
}

export const adminEmail = ADMIN_EMAIL;

export function readAdminSession() {
  try {
    const raw = sessionStorage.getItem(SESSION_KEY);
    if (!raw) return null;
    const session = JSON.parse(raw);
    if (!session?.email || Date.now() > session.exp) {
      sessionStorage.removeItem(SESSION_KEY);
      return null;
    }
    return session;
  } catch {
    return null;
  }
}

export function endAdminSession() {
  try {
    sessionStorage.removeItem(SESSION_KEY);
  } catch {
    /* storage blocked */
  }
}

export async function adminSignIn(email, password) {
  const clean = String(email || '').trim().toLowerCase();
  if (!clean || !password) return { error: 'empty' };
  if (clean !== ADMIN_EMAIL) return { error: 'credentials' };

  const digest = await sha256(password);
  if (!digest) return { error: 'insecure' };
  if (digest !== ADMIN_PASSWORD_HASH) return { error: 'credentials' };

  const session = { email: clean, exp: Date.now() + SESSION_TTL };
  try {
    sessionStorage.setItem(SESSION_KEY, JSON.stringify(session));
  } catch {
    /* the caller keeps it in React state */
  }
  return { error: null, session };
}
