import { useState } from 'react';
import Icon from '../Icon';
import { db } from '../../lib/db';
import { fmtDate, matches, downloadCsv, statusTone } from './helpers';

const STATUSES = ['Submitted', 'Shortlisted', 'Contacted', 'Hired', 'Declined'];

export default function ApplicationsPanel({ data }) {
  const [query, setQuery] = useState('');
  const [openId, setOpenId] = useState(null);
  const rows = (data.applications || []).filter((row) =>
    matches(row, query, ['name', 'email', 'jobTitle', 'company', 'city'])
  );

  const openCv = (row) => {
    const file = db.getFile(row.id);
    if (!file?.dataUrl) return;
    const link = document.createElement('a');
    link.href = file.dataUrl;
    link.download = file.name || 'cv';
    document.body.appendChild(link);
    link.click();
    link.remove();
  };

  return (
    <div className="admin-card">
      <h2>Applications</h2>
      <p className="admin-card__sub">
        Who applied to which job, with their contact details and attached CV. Change a status to keep
        your own records in step with the worker dashboard.
      </p>

      <div style={{ display: 'flex', gap: 8, marginBottom: 14, flexWrap: 'wrap' }}>
        <input
          className="input"
          style={{ maxWidth: 260 }}
          placeholder="Search applicant, job or city…"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          aria-label="Search applications"
        />
        <button
          type="button"
          className="btn btn--ghost btn--sm"
          disabled={!rows.length}
          onClick={() =>
            downloadCsv('goldenglow-applications.csv', rows, [
              { label: 'Applicant', key: 'name' },
              { label: 'Email', key: 'email' },
              { label: 'Phone', key: 'phone' },
              { label: 'Job', key: 'jobTitle' },
              { label: 'Company', key: 'company' },
              { label: 'City', key: 'city' },
              { label: 'CV', value: (row) => row.cv?.name || '' },
              { label: 'Status', key: 'status' },
              { label: 'Applied', value: (row) => fmtDate(row.createdAt) },
            ])
          }
        >
          <Icon name="download" size={14} /> Export CSV
        </button>
      </div>

      {rows.length === 0 ? (
        <div className="admin-empty">No applications yet. Every “Apply Now” submission lands here.</div>
      ) : (
        <div className="admin-table-wrap">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Applicant</th>
                <th>Job</th>
                <th>CV</th>
                <th>Status</th>
                <th>Applied</th>
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
                    <strong>{row.jobTitle}</strong>
                    <small>
                      {row.company} · {row.city}
                    </small>
                  </td>
                  <td>
                    {row.cv?.name ? (
                      <button
                        type="button"
                        className="btn btn--ghost btn--sm"
                        onClick={() => openCv(row)}
                        disabled={!db.getFile(row.id)}
                        title={db.getFile(row.id) ? 'Download CV' : 'CV was too large to keep in browser storage'}
                      >
                        <Icon name="download" size={13} /> {row.cv.name}
                      </button>
                    ) : (
                      <small>No CV</small>
                    )}
                  </td>
                  <td>
                    <select
                      className="select"
                      style={{ minWidth: 128 }}
                      value={row.status || 'Submitted'}
                      onChange={(e) => db.patch('applications', row.id, { status: e.target.value })}
                      aria-label={`Status for ${row.name}`}
                    >
                      {STATUSES.map((status) => (
                        <option key={status}>{status}</option>
                      ))}
                    </select>
                  </td>
                  <td>
                    <small>{fmtDate(row.createdAt)}</small>
                  </td>
                  <td>
                    <div className="admin-row-actions">
                      <button
                        type="button"
                        className="btn btn--ghost btn--sm"
                        onClick={() => setOpenId(openId === row.id ? null : row.id)}
                        aria-expanded={openId === row.id}
                      >
                        <Icon name="eye" size={13} /> Note
                      </button>
                      <button
                        type="button"
                        className="btn btn--ghost btn--sm"
                        aria-label="Delete application"
                        onClick={() => db.remove('applications', row.id)}
                      >
                        <Icon name="trash" size={13} />
                      </button>
                    </div>
                    {openId === row.id && (
                      <p style={{ fontSize: 12, color: 'var(--muted)', margin: '8px 0 0', maxWidth: 260 }}>
                        <span className={`pill pill--${statusTone(row.status)}`}>{row.status}</span>
                        <br />
                        {row.note || 'No cover note supplied.'}
                      </p>
                    )}
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
