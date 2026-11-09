import { fmtDate } from './helpers';

const labels = {
  accounts: 'Account',
  applications: 'Application',
  alerts: 'Saved search',
  messages: 'Enquiry',
  jobs: 'Job posting',
};

function describe(collection, row) {
  if (collection === 'accounts') return `${row.name || row.email} (${row.role})`;
  if (collection === 'applications') return `${row.name} applied for ${row.jobTitle} · ${row.city}`;
  if (collection === 'alerts') return `Saved search — ${row.email}`;
  if (collection === 'messages') return `${row.name} sent a ${row.inquiry || 'general'} enquiry`;
  if (collection === 'jobs') return `${row.title} at ${row.company} (${row.status})`;
  return '';
}

export default function OverviewPanel({ data, onGo }) {
  const accounts = data.accounts || [];
  const applications = data.applications || [];
  const jobs = data.jobs || [];
  const alerts = data.alerts || [];
  const messages = data.messages || [];

  const tiles = [
    { label: 'Accounts', value: accounts.length, note: 'Registered accounts', tab: 'accounts' },
    {
      label: 'Workers',
      value: accounts.filter((a) => a.role === 'worker').length,
      note: 'Worker accounts',
      tab: 'accounts',
    },
    {
      label: 'Employers',
      value: accounts.filter((a) => a.role === 'employer').length,
      note: 'Employer accounts',
      tab: 'accounts',
    },
    { label: 'Applications', value: applications.length, note: 'Jobs applied to', tab: 'applications' },
    {
      label: 'Jobs live',
      value: jobs.filter((j) => j.status === 'verified').length,
      note: `${jobs.filter((j) => j.status === 'pending').length} awaiting review`,
      tab: 'jobs',
    },
    { label: 'Saved searches', value: alerts.length, note: 'Job-alert signups', tab: 'alerts' },
    { label: 'Enquiries', value: messages.length, note: 'Contact form messages', tab: 'messages' },
  ];

  const feed = Object.keys(labels)
    .flatMap((collection) =>
      (data[collection] || []).map((row) => ({ collection, row, at: row.createdAt || row.updatedAt }))
    )
    .sort((a, b) => new Date(b.at || 0) - new Date(a.at || 0))
    .slice(0, 12);

  return (
    <>
      <div className="admin-tiles">
        {tiles.map((tile) => (
          <button
            type="button"
            key={tile.label}
            className="admin-tile"
            style={{ textAlign: 'start', cursor: 'pointer' }}
            onClick={() => onGo(tile.tab)}
          >
            <span>{tile.label}</span>
            <strong>{tile.value}</strong>
            <small>{tile.note}</small>
          </button>
        ))}
      </div>

      <div className="admin-card">
        <h2>Latest activity</h2>
        <p className="admin-card__sub">
          Live from Supabase — new accounts, applications and enquiries appear here as they happen.
        </p>

        {feed.length === 0 ? (
          <div className="admin-empty">
            No records yet. Activity will appear here in real time.
          </div>
        ) : (
          <div className="admin-feed">
            {feed.map((item) => (
              <div className="admin-feed__row" key={`${item.collection}-${item.row.id}`}>
                <span className={`pill pill--${item.row.isSample ? 'muted' : 'info'}`}>
                  {labels[item.collection]}
                </span>
                <p>{describe(item.collection, item.row)}</p>
                <time>{fmtDate(item.at)}</time>
              </div>
            ))}
          </div>
        )}
      </div>
    </>
  );
}
