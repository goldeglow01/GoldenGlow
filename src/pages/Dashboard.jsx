import { useEffect, useMemo, useState } from 'react';
import { Link, useParams, useSearchParams } from 'react-router-dom';
import Icon from '../components/Icon';
import { useApp } from '../context/AppContext';
import { jobs as sampleJobs, formatDate } from '../data/jobs';
import { industries, industryName } from '../data/industries';
import { cities, employmentTypes, experienceLevels } from '../data/site';
import { db } from '../lib/db';

const employerTabs = [
  { id: 'overview', label: 'Dashboard', icon: 'target' },
  { id: 'post', label: 'Post a job', icon: 'plus' },
  { id: 'jobs', label: 'My Jobs', icon: 'briefcase' },
  { id: 'applications', label: 'Applications', icon: 'file' },
  { id: 'candidates', label: 'Candidates', icon: 'users' },
];

const workerTabs = [
  { id: 'overview', label: 'Dashboard', icon: 'target' },
  { id: 'profile', label: 'My profile', icon: 'users' },
  { id: 'saved', label: 'Saved jobs', icon: 'bookmark' },
  { id: 'applications', label: 'Application status', icon: 'file' },
];

const blankJob = {
  title: '',
  industry: '',
  city: '',
  type: 'Full-time',
  experience: '1–2 years',
  description: '',
  salary: '',
};

export default function Dashboard() {
  const { t, lang, user, authReady, applications, savedJobs, toggleSaved, updateApplicationStatus, showToast } = useApp();
  const { role: roleParam } = useParams();
  const role = roleParam === 'worker' ? 'worker' : 'employer';
  const [params, setParams] = useSearchParams();
  const tabs = role === 'worker' ? workerTabs : employerTabs;
  const activeTab = params.get('tab') || 'overview';
  const setTab = (tab) => setParams(tab === 'overview' ? {} : { tab }, { replace: true });

  const displayName = user?.name || user?.email?.split('@')[0] || '';

  if (!authReady) {
    return (
      <div className="dash">
        <div className="container">
          <p style={{ padding: '90px 0', textAlign: 'center', color: 'var(--muted)' }}>
            {t('Checking your session…')}
          </p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="dash">
        <div className="container">
          <div className="auth-gate">
            <span className="auth-gate__icon">
              <Icon name="shield" size={22} />
            </span>
            <h1>{t('Sign in to continue')}</h1>
            <p>
              {t('The employer and worker dashboards are only available with a GoldenGlow account.')}
            </p>
            <div className="auth-gate__actions">
              <Link className="btn btn--primary" to={`/login?role=${role}`}>
                {t('Sign In')}
              </Link>
              <Link className="btn btn--ghost" to={`/signup?role=${role}`}>
                {t('Create an account')}
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="dash">
      <div className="container">
        <div className="dash__head">
          <div>
            <span className="eyebrow">{role === 'employer' ? t('Employer') : t('Worker')}</span>
            <h1>{role === 'employer' ? t('Employer Dashboard') : t('Worker Dashboard')}</h1>
            <p>
              {t('Welcome back')}, {displayName}
            </p>
          </div>
          <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
            <Link className="btn btn--ghost btn--sm" to="/jobs">
              <Icon name="search" size={15} /> {t('Browse vacancies')}
            </Link>
            {role === 'employer' ? (
              <button type="button" className="btn btn--primary btn--sm" onClick={() => setTab('post')}>
                <Icon name="plus" size={15} /> {t('Post a Job')}
              </button>
            ) : (
              <Link className="btn btn--primary btn--sm" to="/signup?role=worker">
                <Icon name="upload" size={15} /> {t('Upload CV / résumé')}
              </Link>
            )}
          </div>
        </div>

        <div className="dash-tabs" role="tablist">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              type="button"
              role="tab"
              aria-selected={activeTab === tab.id}
              className={`dash-tab ${activeTab === tab.id ? 'is-active' : ''}`}
              onClick={() => setTab(tab.id)}
            >
              <Icon name={tab.icon} size={15} />
              {t(tab.label)}
            </button>
          ))}
        </div>

        {role === 'employer' ? (
          <EmployerPanels
            tab={activeTab}
            setTab={setTab}
            applications={applications}
            updateApplicationStatus={updateApplicationStatus}
            showToast={showToast}
            t={t}
            lang={lang}
            displayName={displayName}
            user={user}
          />
        ) : (
          <WorkerPanels
            tab={activeTab}
            applications={applications}
            savedJobs={savedJobs}
            toggleSaved={toggleSaved}
            showToast={showToast}
            t={t}
            lang={lang}
            displayName={displayName}
            user={user}
          />
        )}
      </div>
    </div>
  );
}

function StatusPill({ status }) {
  const tone = status === 'Shortlist' ? 'status-pill--green' : status === 'Under review' ? 'status-pill--gold' : '';
  return <span className={`status-pill ${tone}`}>{status}</span>;
}

/* ------------------------------------------------------------------ */
/* Employer                                                            */
/* ------------------------------------------------------------------ */
function EmployerPanels({ tab, setTab, applications, updateApplicationStatus, showToast, t, lang, displayName, user }) {
  const [listings, setListings] = useState(() => sampleJobs.slice(0, 2).map((job) => ({ ...job, owner: 'demo' })));
  const [form, setForm] = useState(blankJob);
  const [editing, setEditing] = useState(null);
  const [errors, setErrors] = useState({});
  const [companies, setCompanies] = useState({
    company: user?.name ? `${user.name} Co.` : 'Demo Company',
    city: 'Riyadh',
    industry: industries[0].slug,
    about: '',
    website: '',
  });
  const [candidates, setCandidates] = useState([
    { id: 'C-01', name: 'Sample Candidate A', trade: 'Electrician', city: 'Jeddah', experience: '5+ years', shortlisted: false },
    { id: 'C-02', name: 'Sample Candidate B', trade: 'HVAC Technician', city: 'Dammam', experience: '3–5 years', shortlisted: false },
    { id: 'C-03', name: 'Sample Candidate C', trade: 'Mason', city: 'Madinah', experience: '1–2 years', shortlisted: false },
  ]);

  const set = (key) => (e) => {
    setForm((prev) => ({ ...prev, [key]: e.target.value }));
    setErrors((prev) => ({ ...prev, [key]: undefined }));
  };

  const publish = (e) => {
    e.preventDefault();
    const next = {};
    if (!form.title.trim()) next.title = t('This field is required');
    if (!form.industry) next.industry = t('Select an option');
    if (!form.city) next.city = t('Select an option');
    if (form.description.trim().length < 20) next.description = t('Please enter at least 20 characters.');
    setErrors(next);
    if (Object.keys(next).length) return;

    const salaryValue = Number(form.salary);
    const record = {
      id: editing || `DEMO-${Date.now().toString().slice(-5)}`,
      title: form.title,
      company: (user?.name ? `${user.name} Co.` : 'Demo Company') + ' (sample)',
      city: form.city,
      industry: form.industry,
      type: form.type,
      experience: form.experience,
      salary: salaryValue ? { min: salaryValue, max: Math.round(salaryValue * 1.3) } : null,
      posted: new Date().toISOString().slice(0, 10),
      description: form.description,
      requirements: ['Add specific requirements before publishing a real vacancy.'],
    };

    setListings((prev) =>
      editing ? prev.map((item) => (item.id === editing ? record : item)) : [record, ...prev]
    );
    showToast(editing ? t('Listing updated (demo)') : t('Demo listing published'));
    setForm(blankJob);
    setEditing(null);
    setTab('jobs');
  };

  const editListing = (job) => {
    setEditing(job.id);
    setForm({
      title: job.title,
      industry: job.industry,
      city: job.city,
      type: job.type,
      experience: job.experience,
      description: job.description,
      salary: job.salary ? String(job.salary.min) : '',
    });
    setTab('post');
  };

  const removeListing = (id) => {
    setListings((prev) => prev.filter((item) => item.id !== id));
    showToast(t('Listing removed (demo)'));
  };

  if (tab === 'post') {
    return (
      <div className="dash-panel">
        <div className="card-panel">
          <h2>{editing ? t('Edit listing') : t('Post a job')}</h2>
          <p className="hint">{t('Demo data — connect the backend before publishing real vacancies.')}</p>

          <form onSubmit={publish} className="form-grid" noValidate>
            <div className="field">
              <label htmlFor="p-title">{t('Job title')} *</label>
              <input id="p-title" className={`input ${errors.title ? 'has-error' : ''}`} value={form.title} onChange={set('title')} placeholder="e.g. Electrician" />
              {errors.title && <span className="field-error">{errors.title}</span>}
            </div>
            <div className="field">
              <label htmlFor="p-industry">{t('Job Industry')} *</label>
              <select id="p-industry" className={`select ${errors.industry ? 'has-error' : ''}`} value={form.industry} onChange={set('industry')}>
                <option value="">{t('Select Industry')}</option>
                {industries.map((industry) => (
                  <option key={industry.slug} value={industry.slug}>
                    {t(industryName(industry))}
                  </option>
                ))}
              </select>
              {errors.industry && <span className="field-error">{errors.industry}</span>}
            </div>
            <div className="field">
              <label htmlFor="p-city">{t('City')} *</label>
              <select id="p-city" className={`select ${errors.city ? 'has-error' : ''}`} value={form.city} onChange={set('city')}>
                <option value="">{t('Select City')}</option>
                {cities.map((city) => (
                  <option key={city} value={city}>
                    {city}
                  </option>
                ))}
              </select>
              {errors.city && <span className="field-error">{errors.city}</span>}
            </div>
            <div className="field">
              <label htmlFor="p-type">{t('Employment type')}</label>
              <select id="p-type" className="select" value={form.type} onChange={set('type')}>
                {employmentTypes.map((type) => (
                  <option key={type} value={type}>
                    {type}
                  </option>
                ))}
              </select>
            </div>
            <div className="field">
              <label htmlFor="p-exp">{t('Experience level')}</label>
              <select id="p-exp" className="select" value={form.experience} onChange={set('experience')}>
                {experienceLevels.map((level) => (
                  <option key={level} value={level}>
                    {level}
                  </option>
                ))}
              </select>
            </div>
            <div className="field">
              <label htmlFor="p-salary">{t('Salary')} (SAR / month)</label>
              <input id="p-salary" className="input" value={form.salary} onChange={set('salary')} inputMode="numeric" placeholder={t('Salary not disclosed')} />
            </div>
            <div className="field full">
              <label htmlFor="p-desc">{t('Short description')} *</label>
              <textarea id="p-desc" className={`textarea ${errors.description ? 'has-error' : ''}`} value={form.description} onChange={set('description')} />
              {errors.description && <span className="field-error">{errors.description}</span>}
            </div>
            <div className="full" style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
              <button className="btn btn--primary" type="submit">
                <Icon name="check" size={16} /> {editing ? t('Update listing') : t('Publish demo listing')}
              </button>
              {editing && (
                <button
                  className="btn btn--ghost"
                  type="button"
                  onClick={() => {
                    setEditing(null);
                    setForm(blankJob);
                  }}
                >
                  {t('Cancel')}
                </button>
              )}
            </div>
          </form>
        </div>
      </div>
    );
  }

  if (tab === 'jobs') {
    return (
      <div className="dash-panel">
        <div className="card-panel">
          <h2>{t('My Jobs')}</h2>
          <p className="hint">{t('Demo data — connect the backend before publishing real vacancies.')}</p>
          {listings.length === 0 ? (
            <div className="empty-state">
              <Icon name="briefcase" size={26} />
              <h3>{t('No jobs posted yet')}</h3>
              <p>{t('Post your first role to see it here.')}</p>
              <button className="btn btn--primary btn--sm" style={{ marginTop: 14 }} onClick={() => setTab('post')} type="button">
                {t('Post a job')}
              </button>
            </div>
          ) : (
            <div style={{ overflowX: 'auto' }}>
              <table className="dash-table">
                <thead>
                  <tr>
                    <th>{t('Job title')}</th>
                    <th>{t('City')}</th>
                    <th>{t('Employment')}</th>
                    <th>{t('Posted')}</th>
                    <th>{t('Status')}</th>
                    <th />
                  </tr>
                </thead>
                <tbody>
                  {listings.map((job) => (
                    <tr key={job.id}>
                      <td>
                        <strong>{job.title}</strong>
                        <div style={{ fontSize: 11.5, color: '#938490' }}>{job.id}</div>
                      </td>
                      <td>{job.city}</td>
                      <td>{job.type}</td>
                      <td>{formatDate(job.posted, lang)}</td>
                      <td>
                        <span className="status-pill status-pill--gold">{t('Demo listing')}</span>
                      </td>
                      <td>
                        <div className="actions">
                          <button className="mini-btn" type="button" aria-label={t('Edit listing')} onClick={() => editListing(job)}>
                            <Icon name="edit" size={14} />
                          </button>
                          <button className="mini-btn" type="button" aria-label={t('Remove')} onClick={() => removeListing(job.id)}>
                            <Icon name="trash" size={14} />
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
      </div>
    );
  }

  if (tab === 'applications') {
    return (
      <div className="dash-panel">
        <div className="card-panel">
          <h2>{t('Applications')}</h2>
          <p className="hint">{t('Applications submitted through this demo appear here.')}</p>
          {applications.length === 0 ? (
            <div className="empty-state">
              <Icon name="file" size={26} />
              <h3>{t('No applications yet')}</h3>
              <p>{t('Apply to a job and your status will appear here.')}</p>
            </div>
          ) : (
            <div style={{ overflowX: 'auto' }}>
              <table className="dash-table">
                <thead>
                  <tr>
                    <th>{t('Candidates')}</th>
                    <th>{t('Job title')}</th>
                    <th>{t('City')}</th>
                    <th>{t('Status')}</th>
                    <th />
                  </tr>
                </thead>
                <tbody>
                  {applications.map((application) => (
                    <tr key={application.jobId}>
                      <td>
                        <strong>{application.name}</strong>
                        <div style={{ fontSize: 11.5, color: '#938490' }}>{application.email}</div>
                      </td>
                      <td>{application.jobTitle}</td>
                      <td>{application.city}</td>
                      <td>
                        <StatusPill status={application.status} />
                      </td>
                      <td>
                        <button
                          className="btn btn--ghost btn--sm"
                          type="button"
                          onClick={() => {
                            updateApplicationStatus(application.jobId, 'Shortlist');
                            showToast(`${application.name} ${t('Shortlisted').toLowerCase()}`);
                          }}
                        >
                          {t('Shortlist')}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    );
  }

  if (tab === 'candidates') {
    return (
      <div className="dash-panel">
        <div className="card-panel">
          <h2>{t('Candidates')}</h2>
          <p className="hint">{t('Sample candidate records for interface demonstration only.')}</p>
          <div style={{ overflowX: 'auto' }}>
            <table className="dash-table">
              <thead>
                <tr>
                  <th>{t('Candidates')}</th>
                  <th>{t('Job title')}</th>
                  <th>{t('City')}</th>
                  <th>{t('Experience')}</th>
                  <th />
                </tr>
              </thead>
              <tbody>
                {candidates.map((candidate) => (
                  <tr key={candidate.id}>
                    <td>
                      <strong>{candidate.name}</strong>
                      <div style={{ fontSize: 11.5, color: '#938490' }}>{candidate.id}</div>
                    </td>
                    <td>{candidate.trade}</td>
                    <td>{candidate.city}</td>
                    <td>{candidate.experience}</td>
                    <td>
                      <button
                        className={`btn btn--sm ${candidate.shortlisted ? 'btn--gold' : 'btn--ghost'}`}
                        type="button"
                        onClick={() => {
                          setCandidates((prev) =>
                            prev.map((c) =>
                              c.id === candidate.id ? { ...c, shortlisted: !c.shortlisted } : c
                            )
                          );
                          showToast(
                            candidate.shortlisted
                              ? `${candidate.name} ${t('Remove').toLowerCase()}`
                              : `${candidate.name} ${t('Shortlisted').toLowerCase()}`
                          );
                        }}
                      >
                        {candidate.shortlisted ? t('Shortlisted') : t('Shortlist')}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="form-note">
            {t(
              'Contacting candidates requires a configured messaging or email service and the candidate’s consent.'
            )}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="dash-panel">
      <div className="dash-cards">
        <div className="dash-stat">
          <small>{t('My Jobs')}</small>
          <strong>{listings.length}</strong>
        </div>
        <div className="dash-stat">
          <small>{t('Applications')}</small>
          <strong>{applications.length}</strong>
        </div>
        <div className="dash-stat">
          <small>{t('Shortlisted')}</small>
          <strong>{applications.filter((a) => a.status === 'Shortlist').length}</strong>
        </div>
        <div className="dash-stat">
          <small>{t('Candidates')}</small>
          <strong>{candidates.length}</strong>
        </div>
      </div>

      <div className="card-panel">
        <h2>{t('Company profile')}</h2>
        <p className="hint">{t('Keep your company details current so candidates know who is hiring.')}</p>
        <div className="profile-form">
          <div className="field">
            <label htmlFor="e-company">{t('Company name')}</label>
            <input
              id="e-company"
              className="input"
              value={companies.company}
              onChange={(e) => setCompanies({ ...companies, company: e.target.value })}
            />
          </div>
          <div className="field">
            <label htmlFor="e-city">{t('City')}</label>
            <select
              id="e-city"
              className="select"
              value={companies.city}
              onChange={(e) => setCompanies({ ...companies, city: e.target.value })}
            >
              {cities.map((city) => (
                <option key={city} value={city}>
                  {city}
                </option>
              ))}
            </select>
          </div>
          <div className="field">
            <label htmlFor="e-industry">{t('Job Industry')}</label>
            <select
              id="e-industry"
              className="select"
              value={companies.industry}
              onChange={(e) => setCompanies({ ...companies, industry: e.target.value })}
            >
              {industries.map((industry) => (
                <option key={industry.slug} value={industry.slug}>
                  {t(industryName(industry))}
                </option>
              ))}
            </select>
          </div>
          <div className="field">
            <label htmlFor="e-site">Website</label>
            <input
              id="e-site"
              className="input"
              value={companies.website}
              onChange={(e) => setCompanies({ ...companies, website: e.target.value })}
              placeholder="https://"
            />
          </div>
          <div className="field full">
            <label htmlFor="e-about">{t('About the role')}</label>
            <textarea
              id="e-about"
              className="textarea"
              value={companies.about}
              onChange={(e) => setCompanies({ ...companies, about: e.target.value })}
              placeholder={t('Describe your company, projects and working environment.')}
            />
          </div>
        </div>
        <button className="btn btn--primary btn--sm" style={{ marginTop: 14 }} type="button" onClick={() => showToast(t('Saved (demo)'))}>
          <Icon name="check" size={15} /> {t('Save changes')}
        </button>
      </div>

      <div className="card-panel">
        <h2>{t('Applications')}</h2>
        <p className="hint">{t('Applications submitted through this demo appear here.')}</p>
        {applications.length === 0 ? (
          <div className="empty-state">
            <Icon name="file" size={26} />
            <h3>{t('No applications yet')}</h3>
            <p>{t('Apply to a job and your status will appear here.')}</p>
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table className="dash-table">
              <thead>
                <tr>
                  <th>{t('Candidates')}</th>
                  <th>{t('Job title')}</th>
                  <th>{t('Status')}</th>
                </tr>
              </thead>
              <tbody>
                {applications.slice(0, 4).map((application) => (
                  <tr key={application.jobId}>
                    <td>{application.name}</td>
                    <td>{application.jobTitle}</td>
                    <td>
                      <StatusPill status={application.status} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Worker                                                              */
/* ------------------------------------------------------------------ */
function WorkerPanels({ tab, applications, savedJobs, toggleSaved, showToast, t, lang, displayName, user }) {
  const [profile, setProfile] = useState({
    name: displayName,
    trade: 'Electrician',
    city: 'Riyadh',
    experience: '3–5 years',
    phone: '',
    bio: '',
  });
  // Saved jobs can be sample vacancies or admin-verified postings, so resolve
  // them against the same pool the jobs browser shows.
  const [postedJobs, setPostedJobs] = useState(() => db.list('jobs'));
  useEffect(() => db.subscribe((snapshot) => setPostedJobs(snapshot.jobs || [])), []);
  const jobPool = useMemo(
    () => [
      ...postedJobs
        .filter((job) => job.status === 'verified')
        .map((job) => ({ ...job, verified: true })),
      ...sampleJobs,
    ],
    [postedJobs]
  );
  const saved = useMemo(
    () => jobPool.filter((job) => savedJobs.includes(job.id)),
    [jobPool, savedJobs]
  );
  const completion = useMemo(() => {
    const fields = Object.values(profile).filter((v) => String(v).trim().length > 1);
    return Math.round((fields.length / Object.keys(profile).length) * 100);
  }, [profile]);

  if (tab === 'profile') {
    return (
      <div className="dash-panel">
        <div className="card-panel">
          <h2>{t('My profile')}</h2>
          <p className="hint">{t('This profile stays in your browser in demo mode.')}</p>
          <div className="profile-form">
            <div className="field">
              <label htmlFor="w-name">{t('Full name')}</label>
              <input id="w-name" className="input" value={profile.name} onChange={(e) => setProfile({ ...profile, name: e.target.value })} />
            </div>
            <div className="field">
              <label htmlFor="w-trade">{t('Trade or job title')}</label>
              <input id="w-trade" className="input" value={profile.trade} onChange={(e) => setProfile({ ...profile, trade: e.target.value })} />
            </div>
            <div className="field">
              <label htmlFor="w-city">{t('City')}</label>
              <select id="w-city" className="select" value={profile.city} onChange={(e) => setProfile({ ...profile, city: e.target.value })}>
                {cities.map((city) => (
                  <option key={city} value={city}>
                    {city}
                  </option>
                ))}
              </select>
            </div>
            <div className="field">
              <label htmlFor="w-exp">{t('Experience level')}</label>
              <select id="w-exp" className="select" value={profile.experience} onChange={(e) => setProfile({ ...profile, experience: e.target.value })}>
                {experienceLevels.map((level) => (
                  <option key={level} value={level}>
                    {level}
                  </option>
                ))}
              </select>
            </div>
            <div className="field">
              <label htmlFor="w-phone">{t('Phone with country code')}</label>
              <input id="w-phone" className="input" value={profile.phone} onChange={(e) => setProfile({ ...profile, phone: e.target.value })} placeholder="+966 5X XXX XXXX" />
            </div>
            <div className="field full">
              <label htmlFor="w-bio">{t('Skills & experience')}</label>
              <textarea id="w-bio" className="textarea" value={profile.bio} onChange={(e) => setProfile({ ...profile, bio: e.target.value })} />
            </div>
          </div>

          <div className="progress" aria-hidden="true">
            <span style={{ width: `${completion}%` }} />
          </div>
          <p style={{ fontSize: 12, color: '#938490', marginTop: 6 }}>
            {t('Profile completion')}: {completion}%
          </p>

          <button className="btn btn--primary btn--sm" type="button" style={{ marginTop: 14 }} onClick={() => showToast(t('Saved (demo)'))}>
            <Icon name="check" size={15} /> {t('Save changes')}
          </button>
        </div>

        <div className="card-panel">
          <h2>{t('Upload CV / résumé')}</h2>
          <p className="hint">
            {t('Uploads are disabled in this front-end demo. Connect document storage (with private access controls) before enabling real CV uploads.')}
          </p>
          <div style={{ display: 'grid', gap: 12 }}>
            <div className="upload-box">
              <Icon name="file" size={22} />
              <div>
                <strong>{t('Choose file')} — PDF, DOC</strong>
                <small>{t('Stored privately and never shown publicly when enabled.')}</small>
              </div>
            </div>
            <div className="upload-box">
              <Icon name="award" size={22} />
              <div>
                <strong>{t('Upload certificates')}</strong>
                <small>{t('Trade certificates, training records and licences.')}</small>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (tab === 'saved') {
    return (
      <div className="dash-panel">
        <div className="card-panel">
          <h2>{t('Saved jobs')}</h2>
          <p className="hint">{t('Save jobs while browsing to find them here.')}</p>
          {saved.length === 0 ? (
            <div className="empty-state">
              <Icon name="bookmark" size={26} />
              <h3>{t('No saved jobs yet')}</h3>
              <p>{t('Save jobs while browsing to find them here.')}</p>
              <Link className="btn btn--primary btn--sm" to="/jobs" style={{ marginTop: 14 }}>
                {t('Browse vacancies')}
              </Link>
            </div>
          ) : (
            <div style={{ display: 'grid', gap: 12 }}>
              {saved.map((job) => (
                <div key={job.id} className="info-row" style={{ alignItems: 'center' }}>
                  <span className="info-row__icon">
                    <Icon name="briefcase" size={17} />
                  </span>
                  <div style={{ flex: 1 }}>
                    <strong>{job.title}</strong>
                    <div style={{ fontSize: 12, color: '#938490' }}>
                      {job.company} · {job.city} · {formatDate(job.posted, lang)}
                    </div>
                  </div>
                  <Link className="btn btn--ghost btn--sm" to={`/jobs?q=${encodeURIComponent(job.title)}`}>
                    {t('View job')}
                  </Link>
                  <button className="btn btn--ghost btn--sm" type="button" onClick={() => toggleSaved(job.id)}>
                    {t('Remove')}
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    );
  }

  if (tab === 'applications') {
    return (
      <div className="dash-panel">
        <div className="card-panel">
          <h2>{t('Application status')}</h2>
          <p className="hint">{t('Applications submitted in this demo appear here.')}</p>
          {applications.length === 0 ? (
            <div className="empty-state">
              <Icon name="file" size={26} />
              <h3>{t('No applications yet')}</h3>
              <p>{t('Apply to a job and your status will appear here.')}</p>
              <Link className="btn btn--primary btn--sm" to="/jobs" style={{ marginTop: 14 }}>
                {t('Browse vacancies')}
              </Link>
            </div>
          ) : (
            <div style={{ overflowX: 'auto' }}>
              <table className="dash-table">
                <thead>
                  <tr>
                    <th>{t('Job title')}</th>
                    <th>{t('Company')}</th>
                    <th>{t('City')}</th>
                    <th>{t('Status')}</th>
                  </tr>
                </thead>
                <tbody>
                  {applications.map((application) => (
                    <tr key={application.jobId}>
                      <td>
                        <strong>{application.jobTitle}</strong>
                      </td>
                      <td>{application.company}</td>
                      <td>{application.city}</td>
                      <td>
                        <StatusPill status={application.status} />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="dash-panel">
      <div className="dash-cards">
        <div className="dash-stat">
          <small>{t('Saved jobs')}</small>
          <strong>{saved.length}</strong>
        </div>
        <div className="dash-stat">
          <small>{t('Applications')}</small>
          <strong>{applications.length}</strong>
        </div>
        <div className="dash-stat">
          <small>{t('Profile completion')}</small>
          <strong>{completion}%</strong>
        </div>
        <div className="dash-stat">
          <small>{t('Browse vacancies')}</small>
          <strong>
            <Link to="/jobs" style={{ fontSize: 16, color: 'var(--blue)' }}>
              {jobPool.length} {t('Jobs')}
            </Link>
          </strong>
        </div>
      </div>

      <div className="card-panel">
        <h2>{t('Skills & experience')}</h2>
        <p className="hint">{t('Add your trade, tools and project experience so employers can assess fit.')}</p>
        <div className="chips" style={{ marginBottom: 14 }}>
          {(profile.bio
            ? profile.bio.split(',').map((s) => s.trim()).filter(Boolean)
            : [profile.trade, profile.city, profile.experience]
          ).map((skill) => (
            <span className="chip" key={skill}>
              <Icon name="check" size={12} /> {skill}
            </span>
          ))}
        </div>
        <Link className="btn btn--ghost btn--sm" to="/dashboard/worker?tab=profile">
          <Icon name="edit" size={14} /> {t('Save changes')}
        </Link>
      </div>

      <div className="card-panel">
        <h2>{t('My profile')}</h2>
        <p className="hint">{user?.email || 'demo.worker@example.com'}</p>
        <div className="progress">
          <span style={{ width: `${completion}%` }} />
        </div>
        <p style={{ fontSize: 12, color: '#938490', marginTop: 6 }}>
          {t('Profile completion')}: {completion}%
        </p>
      </div>
    </div>
  );
}
