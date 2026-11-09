import { useState } from 'react';
import Icon from '../Icon';
import { db } from '../../lib/db';
import { industries, industryName } from '../../data/industries';
import { cities, employmentTypes, experienceLevels } from '../../data/site';
import { fmtDate, statusTone } from './helpers';
import { useApp } from '../../context/AppContext';

const empty = {
  title: '',
  company: '',
  city: cities[0],
  industry: industries[0].slug,
  type: employmentTypes[0],
  experience: experienceLevels[1] || experienceLevels[0],
  salaryMin: '',
  salaryMax: '',
  description: '',
  requirements: '',
};

export default function JobsPanel({ data }) {
  const { t } = useApp();
  const [form, setForm] = useState(empty);
  const [error, setError] = useState('');
  const [saved, setSaved] = useState('');
  const [filter, setFilter] = useState('all');

  const rows = (data.jobs || []).filter((row) => filter === 'all' || (row.status || 'pending') === filter);

  const set = (key) => (e) => setForm((prev) => ({ ...prev, [key]: e.target.value }));

  const submit = (e) => {
    e.preventDefault();
    if (!form.title.trim() || !form.company.trim() || form.description.trim().length < 20) {
      setError('Add a job title, a company and a description of at least 20 characters.');
      return;
    }
    if (form.title.trim().length < 3 || /[<>]/.test(`${form.title}${form.company}`)) {
      setError('Use at least 3 characters in the title, without < or >.');
      return;
    }
    const min = Number(form.salaryMin);
    const max = Number(form.salaryMax);
    db.add('jobs', {
      id: `GG-${Date.now().toString(36).toUpperCase()}-${Math.random()
        .toString(36)
        .slice(2, 5)
        .toUpperCase()}`,
      title: form.title.trim(),
      company: form.company.trim(),
      city: form.city,
      industry: form.industry,
      type: form.type,
      experience: form.experience,
      salary: min || max ? { min: min || max, max: max || min } : null,
      description: form.description.trim(),
      requirements: form.requirements
        .split('\n')
        .map((line) => line.trim())
        .filter(Boolean),
      status: 'pending',
      source: 'admin',
      posted: new Date().toISOString().slice(0, 10),
    });
    setForm(empty);
    setError('');
    setSaved('Job saved as pending. Verify it to publish on the jobs page.');
    setTimeout(() => setSaved(''), 5000);
  };

  return (
    <>
      <div className="admin-card">
        <h2>Post a job</h2>
        <p className="admin-card__sub">
          New postings are saved as <strong>pending</strong>. Check the details, then verify — verified
          jobs appear on the public jobs page with a “Verified” badge.
        </p>

        <form onSubmit={submit} noValidate style={{ display: 'grid', gap: 12 }}>
          <div className="form-grid">
            <div className="field">
              <label htmlFor="job-title">Job title *</label>
              <input id="job-title" className="input" value={form.title} onChange={set('title')} placeholder="e.g. Site Electrician" />
            </div>
            <div className="field">
              <label htmlFor="job-company">Company *</label>
              <input id="job-company" className="input" value={form.company} onChange={set('company')} />
            </div>
            <div className="field">
              <label htmlFor="job-city">City</label>
              <select id="job-city" className="select" value={form.city} onChange={set('city')}>
                {cities.map((city) => (
                  <option key={city}>{city}</option>
                ))}
              </select>
            </div>
            <div className="field">
              <label htmlFor="job-industry">Industry</label>
              <select id="job-industry" className="select" value={form.industry} onChange={set('industry')}>
                {industries.map((industry) => (
                  <option key={industry.slug} value={industry.slug}>
                    {t(industryName(industry))}
                  </option>
                ))}
              </select>
            </div>
            <div className="field">
              <label htmlFor="job-type">Employment type</label>
              <select id="job-type" className="select" value={form.type} onChange={set('type')}>
                {employmentTypes.map((type) => (
                  <option key={type}>{type}</option>
                ))}
              </select>
            </div>
            <div className="field">
              <label htmlFor="job-exp">Experience</label>
              <select id="job-exp" className="select" value={form.experience} onChange={set('experience')}>
                {experienceLevels.map((level) => (
                  <option key={level}>{level}</option>
                ))}
              </select>
            </div>
            <div className="field">
              <label htmlFor="job-min">Salary from (SAR)</label>
              <input id="job-min" className="input" inputMode="numeric" value={form.salaryMin} onChange={set('salaryMin')} placeholder="Optional" />
            </div>
            <div className="field">
              <label htmlFor="job-max">Salary to (SAR)</label>
              <input id="job-max" className="input" inputMode="numeric" value={form.salaryMax} onChange={set('salaryMax')} placeholder="Optional" />
            </div>
            <div className="field full">
              <label htmlFor="job-desc">Description *</label>
              <textarea id="job-desc" className="textarea" value={form.description} onChange={set('description')} placeholder="What the role involves, the site and the shift pattern." />
            </div>
            <div className="field full">
              <label htmlFor="job-req">Requirements (one per line)</label>
              <textarea id="job-req" className="textarea" value={form.requirements} onChange={set('requirements')} placeholder={'Trade certificate\n3+ years experience\nValid Iqama'} />
            </div>
          </div>

          {error && <p className="field-error" role="alert">{error}</p>}
          {saved && <p className="form-note" style={{ color: '#136b3f' }}>{saved}</p>}

          <button className="btn btn--primary" type="submit" style={{ justifySelf: 'start' }}>
            <Icon name="plus" size={16} /> Save job posting
          </button>
        </form>
      </div>

      <div className="admin-card">
        <h2>Job postings</h2>
        <div style={{ display: 'flex', gap: 8, margin: '10px 0 14px', flexWrap: 'wrap' }}>
          {['all', 'pending', 'verified', 'rejected'].map((value) => (
            <button
              key={value}
              type="button"
              className={`tab ${filter === value ? 'is-active' : ''}`}
              onClick={() => setFilter(value)}
            >
              {value === 'all' ? 'All' : value.charAt(0).toUpperCase() + value.slice(1)}
            </button>
          ))}
        </div>

        {rows.length === 0 ? (
          <div className="admin-empty">No job postings in this view yet.</div>
        ) : (
          <div className="admin-table-wrap">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Job</th>
                  <th>Location</th>
                  <th>Status</th>
                  <th>Created</th>
                  <th />
                </tr>
              </thead>
              <tbody>
                {rows.map((row) => (
                  <tr key={row.id}>
                    <td>
                      <strong>
                        {row.title} {row.isSample && <span className="pill pill--muted">Sample</span>}
                      </strong>
                      <small>
                        {row.company} · {row.id}
                      </small>
                    </td>
                    <td>
                      {row.city}
                      <br />
                      <small>{row.type}</small>
                    </td>
                    <td>
                      <span className={`pill pill--${statusTone(row.status || 'pending')}`}>
                        {row.status || 'pending'}
                      </span>
                    </td>
                    <td>
                      <small>{fmtDate(row.createdAt)}</small>
                    </td>
                    <td>
                      <div className="admin-row-actions">
                        {row.status !== 'verified' && (
                          <button
                            type="button"
                            className="btn btn--ghost btn--sm"
                            onClick={() => db.patch('jobs', row.id, { status: 'verified' })}
                          >
                            <Icon name="shield-check" size={13} /> Verify
                          </button>
                        )}
                        {row.status !== 'rejected' && (
                          <button
                            type="button"
                            className="btn btn--ghost btn--sm"
                            onClick={() => db.patch('jobs', row.id, { status: 'rejected' })}
                          >
                            Reject
                          </button>
                        )}
                        <button
                          type="button"
                          className="btn btn--ghost btn--sm"
                          aria-label="Delete job"
                          onClick={() => db.remove('jobs', row.id)}
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
    </>
  );
}
