import { useEffect, useState } from 'react';
import { Link, Navigate } from 'react-router-dom';
import Icon from '../components/Icon';
import { db, isEmpty } from '../lib/db';
import { useApp } from '../context/AppContext';
import OverviewPanel from '../components/admin/OverviewPanel';
import AccountsPanel from '../components/admin/AccountsPanel';
import ApplicationsPanel from '../components/admin/ApplicationsPanel';
import JobsPanel from '../components/admin/JobsPanel';
import { AlertsPanel, MessagesPanel } from '../components/admin/InboxPanels';

function AdminNotice({ title, children }) {
  return (
    <div className="container" style={{ paddingBlock: 100 }}>
      <div className="auth-gate" style={{ margin: '0 auto', maxWidth: 480 }}>
        <span className="auth-gate__icon">
          <Icon name="shield-check" size={22} />
        </span>
        <h1>{title}</h1>
        {children}
      </div>
    </div>
  );
}

export default function AdminPage() {
  const { user, authReady, signOut } = useApp();
  const [data, setData] = useState(() => db.snapshot());
  const [tab, setTab] = useState('overview');

  useEffect(() => db.subscribe(setData), []);

  if (!authReady) {
    return (
      <div className="container" style={{ padding: '90px 0', textAlign: 'center', color: 'var(--muted)' }}>
        Checking your session…
      </div>
    );
  }

  if (!user) return <Navigate to="/login?next=/admin" replace />;

  if (user.role !== 'admin') {
    return (
      <AdminNotice title="Not authorized">
        <p>
          This area is restricted to GoldenGlow administrators. Signed in as{' '}
          <strong>{user.email}</strong>.
        </p>
        <Link className="btn btn--primary" to="/">
          Back to the site
        </Link>
      </AdminNotice>
    );
  }

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
              Signed in as {user.email} ·{' '}
              {isEmpty(data) ? 'no records yet' : 'live data from Supabase'}
            </p>
          </div>
          <div className="admin-head__actions">
            <span className="live-pill">Live</span>
            <Link className="btn btn--ghost btn--sm" to="/">
              <Icon name="eye" size={14} /> View site
            </Link>
            <button type="button" className="btn btn--ghost btn--sm" onClick={signOut}>
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
            {tab === 'overview' && <OverviewPanel data={data} onGo={setTab} />}
            {tab === 'accounts' && <AccountsPanel data={data} />}
            {tab === 'applications' && <ApplicationsPanel data={data} />}
            {tab === 'jobs' && <JobsPanel data={data} />}
            {tab === 'alerts' && <AlertsPanel data={data} />}
            {tab === 'messages' && <MessagesPanel data={data} />}
          </div>
        </div>
      </div>
    </div>
  );
}
