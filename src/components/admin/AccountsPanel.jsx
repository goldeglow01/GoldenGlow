import { useState } from 'react';
import Icon from '../Icon';
import { fmtDate, matches, downloadCsv } from './helpers';

const roleLabel = { worker: 'Worker', employer: 'Employer', admin: 'Admin' };
const roleTone = { worker: 'info', employer: 'ok', admin: 'bad' };

export default function AccountsPanel({ data }) {
  const [query, setQuery] = useState('');
  const rows = (data.accounts || []).filter((row) =>
    matches(row, query, ['name', 'email', 'role', 'company', 'city'])
  );

  return (
    <div className="admin-card">
      <h2>Accounts</h2>
      <p className="admin-card__sub">
        Everyone with a GoldenGlow account, with their account type and company or trade.
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
              { label: 'Role', value: (row) => roleLabel[row.role] || row.role },
              { label: 'Company / trade', key: 'company' },
              { label: 'City', key: 'city' },
              { label: 'Created', value: (row) => fmtDate(row.createdAt) },
            ])
          }
          disabled={!rows.length}
        >
          <Icon name="download" size={14} /> Export CSV
        </button>
      </div>

      {rows.length === 0 ? (
        <div className="admin-empty">No accounts yet. Sign-ups from the site land here.</div>
      ) : (
        <div className="admin-table-wrap">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Person</th>
                <th>Type</th>
                <th>Company / trade</th>
                <th>City</th>
                <th>Joined</th>
                <th />
              </tr>
            </thead>
            <tbody>
              {rows.map((row) => (
                <tr key={row.id}>
                  <td>
                    <strong>{row.name || '—'}</strong>
                    <small>{row.email}</small>
                  </td>
                  <td>
                    <span className={`pill pill--${roleTone[row.role] || 'muted'}`}>
                      {roleLabel[row.role] || row.role}
                    </span>
                  </td>
                  <td>{row.company || <small>—</small>}</td>
                  <td>{row.city || <small>—</small>}</td>
                  <td>
                    <small>{fmtDate(row.createdAt)}</small>
                  </td>
                  <td>
                    <div className="admin-row-actions">
                      <a className="btn btn--ghost btn--sm" href={`mailto:${row.email}`}>
                        <Icon name="mail" size={13} />
                      </a>
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
