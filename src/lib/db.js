/**
 * GoldenGlow data layer — Supabase-backed.
 *
 * The UI still reads synchronously (`db.list`, `db.snapshot`) from an in-memory
 * cache. `connect()` hydrates that cache from Supabase, Realtime keeps it fresh,
 * and mutations are optimistic: the cache updates immediately, then the row is
 * written to Postgres. Authorization is enforced by Row Level Security in the
 * database; the client cache is only a view of what RLS allowed.
 *
 * Collections:
 *   jobs          -> public.jobs          (verified jobs for everyone; own/admin rows add more)
 *   applications  -> public.applications  (RLS: own / employer's jobs / admin)
 *   alerts        -> public.job_alerts    (admin view only)
 *   messages      -> public.enquiries     (admin view only; API writes)
 *   accounts      -> public.profiles      (admin view only)
 *   savedJobs     -> public.saved_jobs    (array of job ids for the signed-in user)
 */

const COLLECTIONS = ['accounts', 'applications', 'alerts', 'messages', 'jobs', 'savedJobs'];

const emptyState = () => Object.fromEntries(COLLECTIONS.map((name) => [name, []]));

let state = emptyState();
const listeners = new Set();

let client = null;
let currentUser = null;
let channel = null;
let connectSeq = 0;
let ready = false;
let onError = () => {};
const refreshTimers = new Map();
const reported = new Set();

const uid = (prefix = 'id') => {
  const random =
    globalThis.crypto?.randomUUID?.() ||
    `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;
  return `${prefix}-${random}`;
};

function emit() {
  listeners.forEach((listener) => {
    try {
      listener(state);
    } catch {
      /* a broken listener must not break the writer */
    }
  });
}

function report(message) {
  const text = String(message || 'Something went wrong');
  // Avoid repeating the same error on every realtime tick.
  if (reported.has(text)) return;
  reported.add(text);
  try {
    onError(text);
  } catch {
    /* ignore toast failures */
  }
}

function setCollection(name, rows) {
  state = { ...state, [name]: rows };
  emit();
}

/* ------------------------------------------------------------------ */
/* Row <-> UI mapping                                                  */
/* ------------------------------------------------------------------ */

const toDate = (value) => (value ? String(value).slice(0, 10) : '');

const mapJob = (row) => ({
  id: row.id,
  ownerId: row.owner_id,
  title: row.title,
  company: row.company,
  city: row.city,
  industry: row.industry,
  type: row.type,
  experience: row.experience,
  salary:
    row.salary_min != null || row.salary_max != null
      ? { min: row.salary_min ?? row.salary_max, max: row.salary_max ?? row.salary_min }
      : null,
  description: row.description,
  requirements: row.requirements || [],
  status: row.status,
  source: row.source,
  posted: toDate(row.posted_at || row.created_at),
  isSample: Boolean(row.is_sample),
  verified: row.status === 'verified',
  createdAt: row.created_at,
});

const jobPatchToRow = (changes) => {
  const row = {};
  if ('title' in changes) row.title = changes.title;
  if ('company' in changes) row.company = changes.company;
  if ('city' in changes) row.city = changes.city;
  if ('industry' in changes) row.industry = changes.industry;
  if ('type' in changes) row.type = changes.type;
  if ('experience' in changes) row.experience = changes.experience;
  if ('description' in changes) row.description = changes.description;
  if ('requirements' in changes) row.requirements = changes.requirements;
  if ('status' in changes) row.status = changes.status;
  if ('source' in changes) row.source = changes.source;
  if ('isSample' in changes) row.is_sample = changes.isSample;
  if ('ownerId' in changes) row.owner_id = changes.ownerId;
  if ('salary' in changes) {
    row.salary_min = changes.salary?.min ?? null;
    row.salary_max = changes.salary?.max ?? null;
  }
  if ('posted' in changes && changes.posted) {
    row.posted_at = `${changes.posted}T00:00:00Z`;
  }
  return row;
};

const jobToRow = (job, includeId = true) => ({
  ...(includeId ? { id: job.id } : {}),
  owner_id: job.ownerId ?? (currentUser?.role === 'employer' ? currentUser.id : null),
  title: job.title,
  company: job.company,
  city: job.city,
  industry: job.industry,
  type: job.type,
  experience: job.experience || '',
  salary_min: job.salary?.min ?? null,
  salary_max: job.salary?.max ?? null,
  description: job.description,
  requirements: job.requirements || [],
  status: job.status || 'pending',
  source: job.source || (currentUser?.role === 'employer' ? 'employer' : 'admin'),
  posted_at: job.posted ? `${job.posted}T00:00:00Z` : new Date().toISOString(),
  is_sample: Boolean(job.isSample),
});

const mapApplication = (row) => ({
  id: row.id,
  jobId: row.job_id,
  jobOwnerId: row.job_owner_id,
  applicantId: row.applicant_id,
  jobTitle: row.job_title,
  company: row.company,
  city: row.city,
  industry: row.industry,
  name: row.name,
  email: row.email,
  phone: row.phone,
  note: row.note || '',
  cv: row.cv_path ? { name: row.cv_name, size: row.cv_size, path: row.cv_path } : null,
  status: row.status,
  statusNote: row.status_note || '',
  appliedAt: row.created_at,
  createdAt: row.created_at,
  isSample: Boolean(row.is_sample),
});

const applicationToRow = (app) => ({
  id: app.id,
  job_id: app.jobId,
  applicant_id: currentUser?.id,
  name: app.name,
  email: app.email,
  phone: app.phone,
  job_title: app.jobTitle || '',
  company: app.company || '',
  city: app.city || '',
  industry: app.industry || '',
  note: app.note || null,
  status: 'submitted',
});

const APPLICATION_STATUS = {
  Submitted: 'submitted',
  'Under review': 'under_review',
  Shortlist: 'shortlisted',
  Shortlisted: 'shortlisted',
  Contacted: 'contacted',
  Hired: 'hired',
  Declined: 'declined',
  submitted: 'submitted',
  under_review: 'under_review',
  shortlisted: 'shortlisted',
  contacted: 'contacted',
  hired: 'hired',
  declined: 'declined',
};

const applicationStatus = (value) => APPLICATION_STATUS[value] || 'submitted';

const ENQUIRY_STATUS = {
  New: 'new',
  'In progress': 'in_progress',
  Handled: 'handled',
  Spam: 'spam',
  new: 'new',
  in_progress: 'in_progress',
  handled: 'handled',
  spam: 'spam',
};

const enquiryStatus = (value) => ENQUIRY_STATUS[value] || 'new';

const mapEnquiry = (row) => ({
  id: row.id,
  name: row.name,
  email: row.email,
  phone: row.phone,
  company: row.company,
  city: row.city,
  inquiry: row.inquiry,
  industry: row.industry,
  workers: row.workers != null ? String(row.workers) : '',
  message: row.message,
  status: row.status,
  delivered: Boolean(row.email_sent),
  reason: row.email_error || '',
  createdAt: row.created_at,
});

const mapAlert = (row) => ({
  id: row.id,
  email: row.email,
  filters: row.filters || {},
  source: row.source,
  createdAt: row.created_at,
});

const mapAccount = (row) => ({
  id: row.id,
  email: row.email,
  name: row.name,
  company: row.company,
  role: row.role,
  city: row.city || '',
  trade: row.trade || '',
  phone: row.phone || '',
  event: 'signup',
  mode: 'live',
  createdAt: row.created_at,
});

/* ------------------------------------------------------------------ */
/* Fetching                                                            */
/* ------------------------------------------------------------------ */

function isAdmin() {
  return currentUser?.role === 'admin';
}

async function query(fn) {
  if (!client) return [];
  const { data, error } = await fn();
  if (error) throw error;
  return data || [];
}

async function fetchCollection(name) {
  if (!client) return [];
  switch (name) {
    case 'jobs':
      return (await query(() =>
        client.from('jobs').select('*').order('posted_at', { ascending: false })
      )).map(mapJob);
    case 'applications':
      if (!currentUser) return [];
      return (await query(() =>
        client.from('applications').select('*').order('created_at', { ascending: false })
      )).map(mapApplication);
    case 'savedJobs':
      if (!currentUser) return [];
      return (await query(() => client.from('saved_jobs').select('job_id'))).map((row) => row.job_id);
    case 'alerts':
      if (!isAdmin()) return [];
      return (await query(() =>
        client.from('job_alerts').select('*').order('created_at', { ascending: false })
      )).map(mapAlert);
    case 'messages':
      if (!isAdmin()) return [];
      return (await query(() =>
        client.from('enquiries').select('*').order('created_at', { ascending: false })
      )).map(mapEnquiry);
    case 'accounts':
      if (!isAdmin()) return [];
      return (await query(() =>
        client.from('profiles').select('*').order('created_at', { ascending: false })
      )).map(mapAccount);
    default:
      return [];
  }
}

async function refresh(name) {
  if (!client) return;
  try {
    const rows = await fetchCollection(name);
    setCollection(name, rows);
    reported.clear();
  } catch (error) {
    report(error?.message || 'Could not load data');
  }
}

async function refreshAll() {
  const next = {};
  for (const name of COLLECTIONS) {
    try {
      next[name] = await fetchCollection(name);
    } catch (error) {
      next[name] = state[name] || [];
      report(error?.message || 'Could not load data');
    }
  }
  state = { ...state, ...next };
  emit();
}

function schedule(name) {
  clearTimeout(refreshTimers.get(name));
  refreshTimers.set(
    name,
    setTimeout(() => {
      refresh(name);
    }, 220)
  );
}

function teardownRealtime() {
  refreshTimers.forEach((timer) => clearTimeout(timer));
  refreshTimers.clear();
  if (channel && client) {
    try {
      client.removeChannel(channel);
    } catch {
      /* already gone */
    }
  }
  channel = null;
}

function setupRealtime() {
  if (!client) return;
  const tables = [
    ['jobs', 'jobs'],
    ['applications', 'applications'],
    ['saved_jobs', 'savedJobs'],
    ['profiles', 'accounts'],
    ['job_alerts', 'alerts'],
    ['enquiries', 'messages'],
  ];
  channel = client.channel('gg-db');
  tables.forEach(([table, collection]) => {
    channel.on(
      'postgres_changes',
      { event: '*', schema: 'public', table },
      () => schedule(collection)
    );
  });
  channel.subscribe();
}

/* ------------------------------------------------------------------ */
/* Connection lifecycle                                                */
/* ------------------------------------------------------------------ */

export async function connect(supabaseClient, user = null) {
  const seq = ++connectSeq;
  teardownRealtime();
  client = supabaseClient || null;
  currentUser = user || null;
  ready = false;
  state = emptyState();
  emit();

  if (!client) {
    ready = true;
    emit();
    return;
  }

  await refreshAll();
  if (seq !== connectSeq) return;
  setupRealtime();
  ready = true;
  emit();
}

export function disconnect() {
  connectSeq += 1;
  teardownRealtime();
  client = null;
  currentUser = null;
  ready = false;
  state = emptyState();
  emit();
}

/* ------------------------------------------------------------------ */
/* Persistence helpers                                                 */
/* ------------------------------------------------------------------ */

async function revert(collection) {
  await refresh(collection);
}

async function insertJob(entry) {
  if (!client) {
    report('Database is not configured.');
    return;
  }
  const { error } = await client.from('jobs').insert(jobToRow(entry));
  if (error) {
    report(error.message);
    await revert('jobs');
    return;
  }
  await refresh('jobs');
}

function applicationErrorMessage(error) {
  const message = String(error?.message || '');
  const lower = message.toLowerCase();
  if (message.includes('job_not_open')) return 'This vacancy is no longer open.';
  if (message.includes('job_not_found')) return 'This vacancy could not be found.';
  if (lower.includes('duplicate key')) return 'You have already applied to this job.';
  if (lower.includes('applications_applicant_id_fkey') || lower.includes('foreign key')) {
    return 'Your account profile is missing. Please sign out and sign in again.';
  }
  if (lower.includes('row-level security') || lower.includes('permission denied')) {
    return 'Your session has expired. Please sign in again.';
  }
  return message || 'The application could not be sent.';
}

async function insertAlert(entry) {
  if (!client) {
    report('Database is not configured.');
    return;
  }
  const { error } = await client
    .from('job_alerts')
    .insert({ id: entry.id, email: entry.email, filters: entry.filters || {}, source: entry.source || 'jobs-browser' });
  if (error) report(error.message);
}

/* ------------------------------------------------------------------ */
/* Public API                                                          */
/* ------------------------------------------------------------------ */

export const db = {
  connect,
  disconnect,

  subscribe(listener) {
    listeners.add(listener);
    listener(state);
    return () => listeners.delete(listener);
  },

  snapshot() {
    return state;
  },

  list(collection) {
    return state[collection] || [];
  },

  isReady() {
    return ready;
  },

  isConfigured() {
    return Boolean(client);
  },

  setErrorHandler(handler) {
    onError = typeof handler === 'function' ? handler : () => {};
  },

  /**
   * Submit an application and wait for the database to accept it. Unlike the
   * generic `add`, this only reports success once the row exists.
   */
  async applyToJob(application) {
    if (!client || !currentUser) return { error: 'Sign in to apply for a job.' };
    const entry = {
      ...application,
      id: uid('app'),
      applicantId: currentUser.id,
      status: 'submitted',
      appliedAt: new Date().toISOString(),
    };
    const { error } = await client.from('applications').insert(applicationToRow(entry));
    if (error) {
      const message = applicationErrorMessage(error);
      report(message);
      return { error: message };
    }
    setCollection('applications', [
      entry,
      ...state.applications.filter(
        (row) => !(row.jobId === entry.jobId && row.applicantId === currentUser.id)
      ),
    ]);
    await refresh('applications');
    return { application: entry };
  },

  add(collection, item) {
    if (!COLLECTIONS.includes(collection)) {
      throw new Error(`Unknown collection: ${collection}`);
    }
    const entry = { createdAt: new Date().toISOString(), ...item };

    if (collection === 'jobs') {
      entry.id = entry.id || `GG-${Date.now().toString(36).toUpperCase()}-${uid('').slice(-3).toUpperCase()}`;
      entry.verified = entry.status === 'verified';
      setCollection('jobs', [entry, ...state.jobs.filter((row) => row.id !== entry.id)]);
      void insertJob(entry);
      return entry;
    }

    if (collection === 'applications') {
      report('Applications must be submitted with applyToJob.');
      return null;
    }

    if (collection === 'alerts') {
      entry.id = entry.id || uid('alert');
      setCollection('alerts', [entry, ...state.alerts]);
      void insertAlert(entry);
      return entry;
    }

    report('This record cannot be created from the browser.');
    return null;
  },

  patch(collection, id, changes = {}) {
    if (collection === 'jobs') {
      setCollection(
        'jobs',
        state.jobs.map((row) => (row.id === id ? { ...row, ...changes } : row))
      );
      if (!client) return;
      const payload = jobPatchToRow(changes);
      if (!Object.keys(payload).length) return;
      void (async () => {
        const { error } = await client.from('jobs').update(payload).eq('id', id);
        if (error) {
          report(error.message);
          await revert('jobs');
        } else {
          await refresh('jobs');
        }
      })();
      return;
    }

    if (collection === 'applications') {
      const map = (row) => (row.id === id ? { ...row, ...changes } : row);
      setCollection('applications', state.applications.map(map));
      if (!client) return;
      const payload = {};
      if ('status' in changes) payload.status = applicationStatus(changes.status);
      if ('statusNote' in changes) payload.status_note = changes.statusNote || null;
      if (!Object.keys(payload).length) return;
      void (async () => {
        const { error } = await client.from('applications').update(payload).eq('id', id);
        if (error) {
          report(error.message);
          await revert('applications');
        } else {
          await refresh('applications');
        }
      })();
      return;
    }

    if (collection === 'messages') {
      const map = (row) => (row.id === id ? { ...row, ...changes } : row);
      setCollection('messages', state.messages.map(map));
      if (!client) return;
      const payload = {};
      if ('status' in changes) payload.status = enquiryStatus(changes.status);
      if ('emailSent' in changes) payload.email_sent = Boolean(changes.emailSent);
      if (!Object.keys(payload).length) return;
      void (async () => {
        const { error } = await client.from('enquiries').update(payload).eq('id', id);
        if (error) {
          report(error.message);
          await revert('messages');
        } else {
          await refresh('messages');
        }
      })();
      return;
    }

    report('This record cannot be updated from the browser.');
  },

  remove(collection, id) {
    if (collection === 'accounts') {
      report('Users are managed in Supabase Authentication.');
      return;
    }

    const rows = state[collection] || [];
    if (collection === 'savedJobs') {
      setCollection(
        'savedJobs',
        state.savedJobs.filter((jobId) => jobId !== id)
      );
    } else {
      setCollection(
        collection,
        rows.filter((row) => row.id !== id)
      );
    }

    if (!client) return;
    const table = { jobs: 'jobs', applications: 'applications', alerts: 'job_alerts', messages: 'enquiries' }[collection];
    if (!table) return;

    void (async () => {
      if (collection === 'applications') {
        const row = rows.find((item) => item.id === id);
        if (row?.cv?.path) {
          try {
            await client.storage.from('cvs').remove([row.cv.path]);
          } catch {
            /* storage policy may forbid it; the row still goes */
          }
        }
      }
      const { error } = await client.from(table).delete().eq('id', id);
      if (error) {
        report(error.message);
        await revert(collection);
      } else {
        await refresh(collection);
      }
    })();
  },

  /* ---- saved jobs ------------------------------------------------- */

  async toggleSaved(jobId) {
    if (!client || !currentUser) return { error: 'auth' };
    const saved = state.savedJobs.includes(jobId);
    setCollection(
      'savedJobs',
      saved ? state.savedJobs.filter((id) => id !== jobId) : [...state.savedJobs, jobId]
    );
    const { error } = saved
      ? await client.from('saved_jobs').delete().eq('user_id', currentUser.id).eq('job_id', jobId)
      : await client.from('saved_jobs').insert({ user_id: currentUser.id, job_id: jobId });
    if (error) {
      report(error.message);
      await refresh('savedJobs');
      return { error: error.message };
    }
    await refresh('savedJobs');
    return {};
  },

  async mergeSavedJobs(jobIds = []) {
    if (!client || !currentUser || !jobIds.length) return {};
    const rows = jobIds.map((jobId) => ({ user_id: currentUser.id, job_id: jobId }));
    const { error } = await client.from('saved_jobs').upsert(rows, { onConflict: 'user_id,job_id' });
    if (error) {
      report(error.message);
      return { error: error.message };
    }
    await refresh('savedJobs');
    return {};
  },

  /* ---- profile ---------------------------------------------------- */

  async updateProfile(changes = {}) {
    if (!client || !currentUser) return { error: 'auth' };
    const allowed = ['name', 'company', 'city', 'trade', 'phone', 'bio', 'experience', 'industry', 'about', 'website'];
    const payload = Object.fromEntries(
      Object.entries(changes).filter(([key]) => allowed.includes(key))
    );
    if (!Object.keys(payload).length) return {};
    const { error } = await client.from('profiles').update(payload).eq('id', currentUser.id);
    if (error) {
      report(error.message);
      return { error: error.message };
    }
    currentUser = { ...currentUser, ...payload };
    return {};
  },

  /* ---- CV storage ------------------------------------------------- */

  async uploadCv(applicationId, file) {
    if (!client || !currentUser) return { error: 'auth' };
    if (!file) return { error: 'empty' };
    const MAX = 5 * 1024 * 1024;
    if (file.size > MAX) return { error: 'too-large' };
    const allowed = [
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    ];
    const ext = file.name.split('.').pop()?.toLowerCase();
    const type =
      file.type ||
      {
        pdf: 'application/pdf',
        doc: 'application/msword',
        docx: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      }[ext] ||
      'application/octet-stream';
    if (!allowed.includes(type)) return { error: 'wrong-type' };

    const safeName = file.name.replace(/[^\w.\- ]+/g, '_').slice(-100) || 'cv';
    const path = `${currentUser.id}/${applicationId}/${safeName}`;
    const { error } = await client.storage.from('cvs').upload(path, file, {
      contentType: type,
      upsert: true,
    });
    if (error) {
      report(error.message);
      return { error: error.message };
    }

    const { error: rowError } = await client
      .from('applications')
      .update({ cv_path: path, cv_name: file.name, cv_size: file.size })
      .eq('id', applicationId);
    if (rowError) {
      report(rowError.message);
      return { error: rowError.message };
    }

    setCollection(
      'applications',
      state.applications.map((row) =>
        row.id === applicationId
          ? { ...row, cv: { name: file.name, size: file.size, path } }
          : row
      )
    );
    await refresh('applications');
    return { path };
  },

  async getFileUrl(path, expires = 60) {
    if (!client || !path) return { error: 'missing' };
    const { data, error } = await client.storage.from('cvs').createSignedUrl(path, expires);
    if (error) {
      report(error.message);
      return { error: error.message };
    }
    return { url: data?.signedUrl };
  },
};

/** True when the whole store is empty — used for the admin empty state. */
export const isEmpty = (snapshot) =>
  COLLECTIONS.every((name) => (snapshot[name] || []).length === 0);

export { COLLECTIONS };
