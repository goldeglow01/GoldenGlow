import { useState } from 'react';
import Icon from '../Icon';
import { db } from '../../lib/db';
import { fmtDate, matches, downloadCsv } from './helpers';

export default function AccountsPanel({ data }) {
  const [query, setQuery] = useState('');
  const rows = (data.accounts || []).filter((row) =>
    matches(row, query, ['name', 'email', 'role', 'company'])
  );

  return (
    <div className="admin-card">
      <h2>Accounts</h2>
      <p className="admin-card__sub">
        Everyone who signed up or signed in, with their account type and what they entered.
      </p>

      <div style={{ display: 'flex', gap: 8, marginBottom: 14, flexWrap: 'wrap' }}>
        <input
          className="input"
          style={{ maxWidth: 260 }}
          placeholder="Search name, email, company…"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          aria-label="Search accounts"
        />
        <button
          type="button"
          className="btn btn--ghost btn--sm"
          onClick={() =>
            downloadCsv('goldenglow-accounts.csv', rows, [
              { label: 'Name', key: 'name' },
              { label: 'Email', key: 'email' },
              { label: 'Role', key: 'role' },
              { label: 'Company / trade', key: 'company' },
              { label: 'Event', key: 'event' },
              { label: 'Created', value: (row) => fmtDate(row.createdAt) },
            ])
          }
          disabled={!rows.length}
        >
          <Icon name="download" size={14} /> Export CSV
        </button>
      </div>

      {rows.length === 0 ? (
        <div className="admin-empty">No accounts yet. Sign-ups and sign-ins from the site land here.</div>
      ) : (
        <div className="admin-table-wrap">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Person</th>
                <th>Type</th>
                <th>Company / trade</th>
                <th>Event</th>
                <th>When</th>
                <th />
              </tr>
            </thead>
            <tbody>
              {rows.map((row) => (
                <tr key={row.id}>
                  <td>
                    <strong>
                      {row.name || '—'} {row.sample && <span className="pill pill--muted">Sample</span>}
                    </strong>
                    <small>{row.email}</small>
                  </td>
                  <td>
                    <span className={`pill pill--${row.role === 'worker' ? 'info' : 'ok'}`}>{row.role}</span>
                  </td>
                  <td>{row.company || <small>—</small>}</td>
                  <td>
                    {row.event === 'signin' ? 'Sign in' : 'Sign up'}
                    <br />
                    <small>{row.mode === 'live' ? 'Supabase' : 'Local'}</small>
                  </td>
                  <td>
                    <small>{fmtDate(row.createdAt)}</small>
                  </td>
                  <td>
                    <div className="admin-row-actions">
                      <a className="btn btn--ghost btn--sm" href={`mailto:${row.email}`}>
                        <Icon name="mail" size={13} />
                      </a>
                      <button
                        type="button"
                        className="btn btn--ghost btn--sm"
                        aria-label={`Delete ${row.email}`}
                        onClick={() => db.remove('accounts', row.id)}
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
