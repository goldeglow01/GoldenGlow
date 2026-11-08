import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { translate } from '../i18n';
import { supabase, isAuthConfigured, mapUser, authErrorMessage } from '../lib/supabase';
import { db } from '../lib/db';

const AppContext = createContext(null);

const read = (key, fallback) => {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch {
    return fallback;
  }
};

const write = (key, value) => {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    /* storage may be unavailable (private mode) — demo keeps working in memory */
  }
};

export function AppProvider({ children }) {
  const [lang, setLang] = useState(() => read('gg_lang', 'en'));
  // Preview session is only used until Supabase credentials are configured.
  const [user, setUser] = useState(() => (isAuthConfigured ? null : read('gg_preview_user', null)));
  const [authReady, setAuthReady] = useState(!isAuthConfigured);
  const [savedJobs, setSavedJobs] = useState(() => read('gg_saved_jobs', []));
  const [applications, setApplications] = useState(() => read('gg_applications', []));
  const [toast, setToast] = useState(null);
  const toastTimer = useRef(null);

  useEffect(() => {
    const root = document.documentElement;
    root.lang = lang;
    root.dir = lang === 'ar' ? 'rtl' : 'ltr';
    write('gg_lang', lang);
  }, [lang]);

  useEffect(() => write('gg_saved_jobs', savedJobs), [savedJobs]);
  useEffect(() => write('gg_applications', applications), [applications]);

  // Keep the signed-in user in sync with Supabase (session restore + sign out
  // triggered in another tab). Without credentials we stay in preview mode.
  useEffect(() => {
    if (!isAuthConfigured) return undefined;
    let active = true;
    supabase.auth.getSession().then(({ data }) => {
      if (!active) return;
      setUser(mapUser(data.session?.user));
      setAuthReady(true);
    });
    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(mapUser(session?.user));
    });
    return () => {
      active = false;
      listener.subscription.unsubscribe();
    };
  }, []);

  const t = useCallback((value) => translate(value, lang), [lang]);

  const showToast = useCallback((message, tone = 'info') => {
    clearTimeout(toastTimer.current);
    setToast({ message, tone, id: Date.now() });
    toastTimer.current = setTimeout(() => setToast(null), 4200);
  }, []);

  const signIn = useCallback(async ({ email, password, role = 'employer' }) => {
    if (!isAuthConfigured) {
      const next = { role, name: email.split('@')[0], email, id: 'preview', preview: true };
      setUser(next);
      write('gg_preview_user', next);
      db.add('accounts', { event: 'signin', name: next.name, email, role, mode: 'local' });
      return { error: null, user: next };
    }
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) return { error: authErrorMessage(error) };
    const mapped = mapUser(data.user);
    db.add('accounts', {
      event: 'signin',
      name: mapped?.name,
      email: mapped?.email || email,
      role: mapped?.role || role,
      company: mapped?.company,
      mode: 'live',
    });
    return { error: null, user: mapped };
  }, []);

  const signUp = useCallback(async ({ email, password, name, role, company }) => {
    if (!isAuthConfigured) {
      const next = { role, name: name || email.split('@')[0], email, company, id: 'preview', preview: true };
      setUser(next);
      write('gg_preview_user', next);
      db.add('accounts', { event: 'signup', name: next.name, email, role, company, mode: 'local' });
      return { error: null, needsConfirmation: false, user: next };
    }
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { name, role, company },
        emailRedirectTo: `${window.location.origin}/login`,
      },
    });
    if (error) return { error: authErrorMessage(error) };
    db.add('accounts', {
      event: 'signup',
      name,
      email,
      role,
      company,
      mode: 'live',
      confirmed: Boolean(data.session),
    });
    if (!data.session) return { error: null, needsConfirmation: true, email };
    return { error: null, needsConfirmation: false, user: mapUser(data.user) };
  }, []);

  const signOut = useCallback(async () => {
    setUser(null);
    if (!isAuthConfigured) {
      try {
        localStorage.removeItem('gg_preview_user');
      } catch {
        /* storage blocked */
      }
      return;
    }
    await supabase.auth.signOut();
  }, []);

  const toggleSaved = useCallback((id) => {
    setSavedJobs((prev) => (prev.includes(id) ? prev.filter((j) => j !== id) : [...prev, id]));
  }, []);

  const addApplication = useCallback((app) => {
    const entry = { ...app, status: 'Submitted', appliedAt: new Date().toISOString() };
    setApplications((prev) => [entry, ...prev.filter((a) => a.jobId !== app.jobId)]);
    // Same record shape the admin panel reads, so the office sees it live.
    return db.add('applications', entry);
  }, []);

  const updateApplicationStatus = useCallback((jobId, status) => {
    setApplications((prev) => prev.map((a) => (a.jobId === jobId ? { ...a, status } : a)));
  }, []);

  const value = useMemo(
    () => ({
      lang,
      setLang,
      dir: lang === 'ar' ? 'rtl' : 'ltr',
      t,
      user,
      authReady,
      authConfigured: isAuthConfigured,
      signIn,
      signUp,
      signOut,
      savedJobs,
      toggleSaved,
      applications,
      addApplication,
      updateApplicationStatus,
      toast,
      showToast,
    }),
    [
      lang,
      t,
      user,
      authReady,
      signIn,
      signUp,
      signOut,
      savedJobs,
      toggleSaved,
      applications,
      addApplication,
      updateApplicationStatus,
      toast,
      showToast,
    ]
  );

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export const useApp = () => {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used inside AppProvider');
  return ctx;
};
