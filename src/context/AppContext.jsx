import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { translate } from '../i18n';
import {
  supabase,
  isAuthConfigured,
  fetchProfile,
  mapProfile,
  authErrorMessage,
} from '../lib/supabase';
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
    /* storage may be unavailable (private mode) — the site still works */
  }
};

export function AppProvider({ children }) {
  const [lang, setLang] = useState(() => read('gg_lang', 'en'));
  const [user, setUser] = useState(null);
  const [authReady, setAuthReady] = useState(!isAuthConfigured);
  const [savedJobs, setSavedJobs] = useState(() => read('gg_saved_jobs', []));
  const [applications, setApplications] = useState([]);
  const [toast, setToast] = useState(null);
  const toastTimer = useRef(null);

  useEffect(() => {
    const root = document.documentElement;
    root.lang = lang;
    root.dir = lang === 'ar' ? 'rtl' : 'ltr';
    write('gg_lang', lang);
  }, [lang]);

  useEffect(() => () => clearTimeout(toastTimer.current), []);

  const t = useCallback((value) => translate(value, lang), [lang]);

  const showToast = useCallback((message, tone = 'info') => {
    clearTimeout(toastTimer.current);
    setToast({ message, tone, id: Date.now() });
    toastTimer.current = setTimeout(() => setToast(null), 4200);
  }, []);

  // Surface data-layer failures (RLS denials, missing migrations, offline).
  useEffect(() => {
    db.setErrorHandler((message) => showToast(message, 'error'));
    return () => db.setErrorHandler(null);
  }, [showToast]);

  // Restore the Supabase session and load the authoritative profile row.
  useEffect(() => {
    if (!supabase) {
      setAuthReady(true);
      return undefined;
    }
    let active = true;

    const applySession = async (session) => {
      if (!active) return;
      if (!session?.user) {
        setUser(null);
        return;
      }
      let profile = await fetchProfile(session.user.id);
      if (!profile) {
        // The auth user can outlive a manually deleted profile row.
        await new Promise((resolve) => setTimeout(resolve, 600));
        if (!active) return;
        profile = await fetchProfile(session.user.id);
      }
      if (!profile) {
        await supabase.auth.signOut({ scope: 'local' }).catch(() => {});
        if (!active) return;
        setUser(null);
        showToast(t('Your account profile is missing. Please contact support.'), 'error');
        return;
      }
      if (!active) return;
      setUser(mapProfile(profile, session.user));
    };

    supabase.auth
      .getSession()
      .then(async ({ data }) => {
        await applySession(data.session);
        if (active) setAuthReady(true);
      })
      .catch(() => {
        if (active) setAuthReady(true);
      });

    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      // Defer Supabase calls out of the auth callback to avoid lock deadlocks.
      setTimeout(() => {
        void applySession(session).catch(() => {});
      }, 0);
    });

    return () => {
      active = false;
      listener.subscription.unsubscribe();
    };
  }, []);

  // Keep the profile (role changes, admin promotion) in sync.
  useEffect(() => {
    if (!supabase || !user?.id) return undefined;
    const profileChannel = supabase
      .channel(`profile:${user.id}`)
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'profiles', filter: `id=eq.${user.id}` },
        (payload) => {
          if (payload.new) setUser((prev) => (prev ? mapProfile(payload.new, null) : prev));
        }
      )
      .subscribe();
    return () => {
      supabase.removeChannel(profileChannel);
    };
  }, [user?.id]);

  // Open/close the Supabase data connection whenever the session changes.
  useEffect(() => {
    if (!authReady) return undefined;
    void db.connect(supabase, user);
    return () => db.disconnect();
  }, [authReady, user?.id, user?.role]);

  // Mirror the data cache into React state for the UI.
  useEffect(() => {
    const unsubscribe = db.subscribe((snapshot) => {
      setApplications(snapshot.applications || []);
      if (user) setSavedJobs(snapshot.savedJobs || []);
    });
    return unsubscribe;
  }, [user?.id, user?.role]);

  // Signed-out visitors keep saved jobs in localStorage.
  useEffect(() => {
    if (!user) write('gg_saved_jobs', savedJobs);
  }, [savedJobs, user?.id]);

  useEffect(() => {
    if (!user) setSavedJobs(read('gg_saved_jobs', []));
  }, [user?.id]);

  // Copy guest saved jobs into the account the first time they sign in.
  useEffect(() => {
    if (!user) return;
    const local = read('gg_saved_jobs', []);
    if (!local.length) return;
    void db.mergeSavedJobs(local).then((result) => {
      if (!result?.error) write('gg_saved_jobs', []);
    });
  }, [user?.id]);

  const signIn = useCallback(async ({ email, password }) => {
    if (!supabase) return { error: 'not-configured' };
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) return { error: authErrorMessage(error) };
    const profile = await fetchProfile(data.user.id);
    const mapped = mapProfile(profile, data.user);
    setUser(mapped);
    return { error: null, user: mapped };
  }, []);

  const signUp = useCallback(async ({ email, password, name, role, company }) => {
    if (!supabase) return { error: 'not-configured' };
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { name, role, company },
        emailRedirectTo: `${window.location.origin}/login`,
      },
    });
    if (error) return { error: authErrorMessage(error) };
    if (!data.session) return { error: null, needsConfirmation: true, email };
    const profile = await fetchProfile(data.user.id);
    const mapped = mapProfile(profile, data.user);
    setUser(mapped);
    return { error: null, needsConfirmation: false, user: mapped };
  }, []);

  const signOut = useCallback(async () => {
    setUser(null);
    if (!supabase) return;
    try {
      // Local scope avoids a 403 when the server session has already expired.
      await supabase.auth.signOut({ scope: 'local' });
    } catch {
      /* already signed out */
    }
  }, []);

  const toggleSaved = useCallback(
    async (id) => {
      if (user) {
        const result = await db.toggleSaved(id);
        if (result?.error) showToast(t('Could not update saved jobs'), 'error');
        return;
      }
      setSavedJobs((prev) => {
        const next = prev.includes(id) ? prev.filter((jobId) => jobId !== id) : [...prev, id];
        write('gg_saved_jobs', next);
        return next;
      });
    },
    [user, showToast, t]
  );

  const applyToJob = useCallback(
    async (app) => {
      if (!user) return { error: t('Sign in to apply') };
      return db.applyToJob({
        ...app,
        applicantId: user.id,
        name: app.name || user.name,
        email: app.email || user.email,
      });
    },
    [user, t]
  );

  const updateProfile = useCallback(async (changes) => {
    const result = await db.updateProfile(changes);
    if (!result.error) setUser((prev) => (prev ? { ...prev, ...changes } : prev));
    return result;
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
      applyToJob,
      updateProfile,
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
      applyToJob,
      updateProfile,
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
