import Icon from '../Icon';
import { db } from '../../lib/db';
import { fmtDate, statusTone } from './helpers';

const filterText = (filters = {}) => {
  const bits = [
    filters.q && `“${filters.q}”`,
    filters.industry && filters.industry.replace(/-/g, ' '),
    filters.city,
    filters.experience,
    filters.type,
    filters.salary && filters.salary !== 'any' && filters.salary,
  ].filter(Boolean);
  return bits.length ? bits.join(' · ') : 'All jobs';
};

export function AlertsPanel({ data }) {
  const rows = data.alerts || [];

  return (
    <div className="admin-card">
      <h2>Saved searches</h2>
      <p className="admin-card__sub">
        Visitors who asked to be emailed jobs matching a search. Until an email service is connected,
        use these addresses to send matching vacancies manually.
      </p>

      {rows.length === 0 ? (
        <div className="admin-empty">No saved searches yet.</div>
      ) : (
        <div className="admin-table-wrap">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Email</th>
                <th>Search</th>
                <th>When</th>
                <th />
              </tr>
            </thead>
            <tbody>
              {rows.map((row) => (
                <tr key={row.id}>
                  <td>
                    <strong>{row.email}</strong>
                    {row.sample && <span className="pill pill--muted">Sample</span>}
                  </td>
                  <td>{filterText(row.filters)}</td>
                  <td>
                    <small>{fmtDate(row.createdAt)}</small>
                  </td>
                  <td>
                    <div className="admin-row-actions">
                      <a className="btn btn--ghost btn--sm" href={`mailto:${row.email}`}>
                        <Icon name="mail" size={13} /> Email
                      </a>
                      <button
                        type="button"
                        className="btn btn--ghost btn--sm"
                        aria-label="Delete saved search"
                        onClick={() => db.remove('alerts', row.id)}
                      >
                        <Icon name="trash" size={13} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

export function MessagesPanel({ data }) {
  const rows = data.messages || [];

  return (
    <div className="admin-card">
      <h2>Enquiries</h2>
      <p className="admin-card__sub">
        Messages sent through the contact form — workforce requests, job-seeker questions and partnership
        enquiries.
      </p>

      {rows.length === 0 ? (
        <div className="admin-empty">No enquiries yet.</div>
      ) : (
        <div className="admin-table-wrap">
          <table className="admin-table">
            <thead>
              <tr>
                <th>From</th>
                <th>Enquiry</th>
                <th>Requirements</th>
                <th>Status</th>
                <th />
              </tr>
            </thead>
            <tbody>
              {rows.map((row) => (
                <tr key={row.id}>
                  <td>
                    <strong>
                      {row.name} {row.sample && <span className="pill pill--muted">Sample</span>}
                    </strong>
                    <small>{row.email}</small>
                    <br />
                    <small>{row.phone}</small>
                  </td>
                  <td>
                    <span className="pill pill--info">{row.inquiry || 'General'}</span>
                    <br />
                    <small>{fmtDate(row.createdAt)}</small>
                  </td>
                  <td style={{ maxWidth: 320 }}>
                    <small>
                      {row.company || '—'} · {row.city || '—'}
                      {row.workers ? ` · ${row.workers} workers` : ''}
                    </small>
                    <p style={{ margin: '6px 0 0', fontSize: 12.5, color: 'var(--muted)' }}>{row.message}</p>
                  </td>
                  <td>
                    <select
                      className="select"
                      value={row.status || 'New'}
                      onChange={(e) => db.patch('messages', row.id, { status: e.target.value })}
                      aria-label={`Status for ${row.name}`}
                    >
                      {['New', 'In progress', 'Handled'].map((status) => (
                        <option key={status}>{status}</option>
                      ))}
                    </select>
                    <br />
                    <span className={`pill pill--${statusTone(row.status)}`}>{row.status || 'New'}</span>
                  </td>
                  <td>
                    <div className="admin-row-actions">
                      <a className="btn btn--ghost btn--sm" href={`mailto:${row.email}`}>
                        <Icon name="mail" size={13} /> Reply
                      </a>
                      <button
                        type="button"
                        className="btn btn--ghost btn--sm"
                        aria-label="Delete enquiry"
                        onClick={() => db.remove('messages', row.id)}
                      >
                        <Icon name="trash" size={13} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
