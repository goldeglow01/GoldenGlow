import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import Icon from '../components/Icon';
import { db, isEmpty, COLLECTIONS } from '../lib/db';
import { adminSignIn, readAdminSession, endAdminSession } from '../lib/admin';
import OverviewPanel from '../components/admin/OverviewPanel';
import AccountsPanel from '../components/admin/AccountsPanel';
import ApplicationsPanel from '../components/admin/ApplicationsPanel';
import JobsPanel from '../components/admin/JobsPanel';
import { AlertsPanel, MessagesPanel } from '../components/admin/InboxPanels';
import { sampleRows } from '../components/admin/helpers';

const errorCopy = {
  empty: 'Enter both the admin email and password.',
  credentials: 'Those admin details are not correct.',
  insecure: 'Open this page over HTTPS (or localhost) to sign in.',
};

function AdminLogin({ onSuccess }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setLoading(true);
    const result = await adminSignIn(email, password);
    setLoading(false);
    if (result.error) {
      setError(errorCopy[result.error] || 'Sign in failed.');
      return;
    }
    setError('');
    onSuccess(result.session);
  };

  return (
    <div className="admin-login">
      <div className="admin-login__card">
        <span className="admin-login__icon">
          <Icon name="shield-check" size={24} />
        </span>
        <h1>Admin access</h1>
        <p>Restricted area for the GoldenGlow team. Use your admin email and password.</p>

        <form onSubmit={submit} style={{ display: 'grid', gap: 12 }} noValidate>
          <div className="field">
            <label htmlFor="admin-email">Admin email</label>
            <input
              id="admin-email"
              className="input"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              autoComplete="username"
              required
            />
          </div>
          <div className="field">
            <label htmlFor="admin-password">Password</label>
            <input
              id="admin-password"
              className="input"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="current-password"
              required
            />
          </div>

          {error && (
            <p className="field-error" role="alert">
              {error}
            </p>
          )}

          <button className="btn btn--primary btn--block" type="submit" disabled={loading}>
            {loading ? 'Checking…' : 'Sign in to admin'}
          </button>
        </form>

        <p style={{ fontSize: 11.5, color: 'var(--muted)', marginTop: 14, lineHeight: 1.6 }}>
          This page is not linked from the site menu. Sign-in expires after 8 hours.
        </p>
      </div>
    </div>
  );
}

export default function AdminPage() {
  const [session, setSession] = useState(() => readAdminSession());
  const [data, setData] = useState(() => db.snapshot());
  const [tab, setTab] = useState('overview');

  useEffect(() => db.subscribe(setData), []);

  const hasSample = useMemo(
    () => COLLECTIONS.some((name) => (data[name] || []).some((row) => row.sample)),
    [data]
  );

  const seed = () => {
    const rows = sampleRows();
    Object.entries(rows).forEach(([collection, list]) => list.forEach((row) => db.add(collection, row)));
  };

  const clearSample = () => {
    COLLECTIONS.forEach((name) => {
      (data[name] || [])
        .filter((row) => row.sample)
        .forEach((row) => db.remove(name, row.id));
    });
  };

  if (!session) return <AdminLogin onSuccess={setSession} />;

  const tabs = [
    { key: 'overview', label: 'Overview', icon: 'layers' },
    { key: 'accounts', label: 'Accounts', icon: 'users', count: data.accounts?.length },
    { key: 'applications', label: 'Applications', icon: 'briefcase', count: data.applications?.length },
    {
      key: 'jobs',
      label: 'Jobs',
      icon: 'building',
      count: data.jobs?.filter((job) => job.status === 'pending').length,
    },
    { key: 'alerts', label: 'Saved searches', icon: 'search', count: data.alerts?.length },
    { key: 'messages', label: 'Enquiries', icon: 'message', count: data.messages?.length },
  ];

  return (
    <div className="admin-shell">
      <div className="container">
        <div className="admin-head">
          <div>
            <h1>GoldenGlow admin</h1>
            <p>
              Signed in as {session.email} ·{' '}
              {isEmpty(data) ? 'no records yet' : 'live data from this browser'}
            </p>
          </div>
          <div className="admin-head__actions">
            <span className="live-pill">Live</span>
            <Link className="btn btn--ghost btn--sm" to="/">
              <Icon name="eye" size={14} /> View site
            </Link>
            <button
              type="button"
              className="btn btn--ghost btn--sm"
              onClick={() => {
                endAdminSession();
                setSession(null);
              }}
            >
              <Icon name="log-in" size={14} /> Sign out
            </button>
          </div>
        </div>

        <div className="admin-layout">
          <nav className="admin-nav" aria-label="Admin sections">
            {tabs.map((item) => (
              <button
                key={item.key}
                type="button"
                className={tab === item.key ? 'is-active' : ''}
                onClick={() => setTab(item.key)}
                aria-current={tab === item.key ? 'page' : undefined}
              >
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}>
                  <Icon name={item.icon} size={15} />
                  {item.label}
                </span>
                {typeof item.count === 'number' && item.count > 0 && (
                  <span className="count">{item.count}</span>
                )}
              </button>
            ))}
          </nav>

          <div className="admin-main">
            {tab === 'overview' && (
              <OverviewPanel
                data={data}
                onGo={setTab}
                onSeed={seed}
                onClearSample={clearSample}
                hasSample={hasSample}
              />
            )}
            {tab === 'accounts' && <AccountsPanel data={data} />}
            {tab === 'applications' && <ApplicationsPanel data={data} />}
            {tab === 'jobs' && <JobsPanel data={data} />}
            {tab === 'alerts' && <AlertsPanel data={data} />}
            {tab === 'messages' && <MessagesPanel data={data} />}

            {tab !== 'overview' && hasSample && (
              <button type="button" className="btn btn--ghost btn--sm" onClick={clearSample}>
                <Icon name="trash" size={14} /> Remove sample rows
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
