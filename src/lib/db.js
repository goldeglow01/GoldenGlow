/**
 * GoldenGlow — shared record store used by the site and the admin panel.
 *
 * One place where the site writes what people do (sign up, sign in, apply,
 * save a search, send an enquiry) and where the admin panel reads it back.
 *
 * Storage modes
 * -------------
 * 1. Local mode (default): records live in this browser's localStorage. Every
 *    tab and window of the site stays in sync live through the `storage` event
 *    and a BroadcastChannel, so the admin panel updates the moment a visitor
 *    action happens in another tab.
 * 2. Hosted mode: the same API is the seam for a real database. Set
 *    VITE_SUPABASE_URL / VITE_SUPABASE_ANON_KEY (see src/lib/supabase.js) and
 *    replace the bodies below with `supabase.from('records')` calls to share
 *    records between devices and people. Nothing in the UI changes.
 *
 * What local mode can and cannot do: it is genuinely real data — not mock
 * rows — but it is per-browser. Two phones in two cities will each have their
 * own store until a hosted database is connected.
 */

const KEY = 'gg_db_v1';
const CV_KEY = 'gg_cvs_v1';
const CHANNEL_NAME = 'gg_db_sync';
// Keep the browser store bounded — localStorage quotas are small and this is
// demo storage, not an archive.
const MAX_ROWS = 500;

export const COLLECTIONS = ['accounts', 'applications', 'alerts', 'messages', 'jobs'];

const blank = () => Object.fromEntries(COLLECTIONS.map((name) => [name, []]));

const uid = (prefix) => {
  const random =
    globalThis.crypto?.randomUUID?.() ||
    `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;
  return `${prefix}-${random}`;
};

function readStore() {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return blank();
    const parsed = JSON.parse(raw);
    const next = blank();
    COLLECTIONS.forEach((name) => {
      if (Array.isArray(parsed?.[name])) next[name] = parsed[name];
    });
    return next;
  } catch {
    return blank();
  }
}

let state = readStore();
const listeners = new Set();

let channel = null;
try {
  channel = typeof BroadcastChannel !== 'undefined' ? new BroadcastChannel(CHANNEL_NAME) : null;
} catch {
  channel = null; // older Safari — the storage event still keeps other tabs in sync
}

function emit() {
  listeners.forEach((listener) => {
    try {
      listener(state);
    } catch {
      /* a broken listener must not break the writer */
    }
  });
}

function persist(next) {
  state = next;
  try {
    localStorage.setItem(KEY, JSON.stringify(next));
  } catch {
    /* quota or private mode — keep the in-memory copy so the session still works */
  }
  try {
    channel?.postMessage({ at: Date.now() });
  } catch {
    /* channel closed */
  }
  emit();
}

function reloadFromDisk() {
  state = readStore();
  emit();
}

if (typeof window !== 'undefined') {
  window.addEventListener('storage', (event) => {
    if (event.key === KEY || event.key === null) reloadFromDisk();
  });
  channel?.addEventListener('message', reloadFromDisk);
}

/* ---------------------------------------------------------------- */
/* Uploaded files (kept separately so the main store stays small)    */
/* ---------------------------------------------------------------- */

let fileQueue = Promise.resolve();

function readFiles() {
  try {
    const raw = localStorage.getItem(CV_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

function writeFile(id, value) {
  const map = readFiles();
  map[id] = value;
  localStorage.setItem(CV_KEY, JSON.stringify(map));
  return true;
}

function removeFile(id) {
  try {
    const map = readFiles();
    if (!(id in map)) return;
    delete map[id];
    localStorage.setItem(CV_KEY, JSON.stringify(map));
  } catch {
    /* storage blocked */
  }
}

function clearFiles() {
  try {
    localStorage.removeItem(CV_KEY);
  } catch {
    /* storage blocked */
  }
}

export const db = {
  /** Subscribe to the whole store. Returns an unsubscribe function. */
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

  add(collection, item) {
    if (!COLLECTIONS.includes(collection)) throw new Error(`Unknown collection: ${collection}`);
    const entry = {
      createdAt: new Date().toISOString(),
      ...item,
      id: item.id || uid(collection),
    };
    persist({ ...state, [collection]: [entry, ...state[collection]].slice(0, MAX_ROWS) });
    return entry;
  },

  patch(collection, id, changes) {
    persist({
      ...state,
      [collection]: state[collection].map((row) =>
        row.id === id ? { ...row, ...changes, updatedAt: new Date().toISOString() } : row
      ),
    });
  },

  remove(collection, id) {
    persist({ ...state, [collection]: state[collection].filter((row) => row.id !== id) });
    // Do not leave an uploaded CV behind when its application row is deleted.
    removeFile(id);
  },

  clear(collection) {
    persist({ ...state, [collection]: [] });
    if (collection === 'applications') clearFiles();
  },

  /**
   * Attach a CV / certificate to a record. Files are kept in this browser only
   * (base64, capped so one upload cannot fill the quota) and are never served
   * publicly. A production build should use private object storage instead.
   */
  saveFile(id, file) {
    if (!file) return Promise.resolve({ stored: false, reason: 'empty' });
    const meta = { name: file.name, size: file.size, type: file.type || 'application/octet-stream' };
    const MAX = 260 * 1024;
    if (file.size > MAX) return Promise.resolve({ stored: false, meta, reason: 'too-large' });

    // Serialise read-modify-write cycles so two uploads started at the same
    // time cannot overwrite each other's map.
    const task = fileQueue.then(
      () =>
        new Promise((resolve) => {
          const reader = new FileReader();
          reader.onload = () => {
            try {
              resolve(writeFile(id, { ...meta, dataUrl: reader.result }) ? { stored: true, meta } : { stored: false, meta, reason: 'quota' });
            } catch {
              resolve({ stored: false, meta, reason: 'quota' });
            }
          };
          reader.onerror = () => resolve({ stored: false, meta, reason: 'read' });
          reader.readAsDataURL(file);
        })
    );
    fileQueue = task.then(
      () => undefined,
      () => undefined
    );
    return task;
  },

  getFile(id) {
    try {
      const raw = localStorage.getItem(CV_KEY);
      const map = raw ? JSON.parse(raw) : {};
      return map[id] || null;
    } catch {
      return null;
    }
  },
};

/** True when the whole store is empty — used for the admin empty state. */
export const isEmpty = (snapshot) =>
  COLLECTIONS.every((name) => (snapshot[name] || []).length === 0);
