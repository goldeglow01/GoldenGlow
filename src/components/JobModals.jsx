import { useEffect, useRef, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import Modal from './Modal';
import Icon from './Icon';
import { useApp } from '../context/AppContext';
import { formatDate, formatSalary } from '../data/jobs';
import { industries, industryName } from '../data/industries';
import { db } from '../lib/db';

export function JobDetailModal({ job, onClose, onApply }) {
  const { t, lang, savedJobs, toggleSaved, showToast } = useApp();
  if (!job) return null;
  const industry = industries.find((i) => i.slug === job.industry);
  const salary = formatSalary(job.salary, lang);
  const saved = savedJobs.includes(job.id);
  const isSample = Boolean(job.isSample);

  return (
    <Modal open={!!job} onClose={onClose} title={job.title} subtitle={`${job.company} · ${job.city}`}>
      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 14 }}>
        <span className={`badge ${!isSample && job.verified ? 'badge--verified' : ''}`}>
          {isSample ? t('Sample listing') : job.verified ? t('Verified') : t('Pending review')}
        </span>
        <span className="chip">
          <Icon name="briefcase" size={12} /> {job.type}
        </span>
        <span className="chip">
          <Icon name="clock" size={12} /> {t('Posted')} {formatDate(job.posted, lang)}
        </span>
        <span className="chip">Ref {job.id}</span>
      </div>

      <div className="detail-grid">
        <div className="detail-item">
          <small>{t('Industry')}</small>
          <strong>{industry ? t(industryName(industry)) : job.industry}</strong>
        </div>
        <div className="detail-item">
          <small>{t('City')}</small>
          <strong>{job.city}</strong>
        </div>
        <div className="detail-item">
          <small>{t('Experience')}</small>
          <strong>{job.experience}</strong>
        </div>
        <div className="detail-item">
          <small>{t('Salary')}</small>
          <strong>{salary || t('Salary not disclosed')}</strong>
        </div>
      </div>

      <div className="detail-section">
        <h4>{t('About the role')}</h4>
        <p style={{ fontSize: 14, color: 'var(--muted)', lineHeight: 1.7 }}>{job.description}</p>
      </div>

      <div className="detail-section" style={{ marginTop: 18 }}>
        <h4>{t('Requirements')}</h4>
        <ul className="detail-list">
          {job.requirements.map((req) => (
            <li key={req}>{req}</li>
          ))}
        </ul>
      </div>

      {isSample && (
        <p className="form-note" style={{ marginTop: 16 }}>
          {t('Sample listings — demonstration content only, not verified vacancies.')}
        </p>
      )}

      <div style={{ display: 'flex', gap: 10, marginTop: 18, flexWrap: 'wrap' }}>
        <button className="btn btn--primary" type="button" onClick={() => onApply(job)}>
          <Icon name="send" size={16} /> {t('Apply Now')}
        </button>
        <button
          className={`btn btn--ghost ${saved ? 'is-saved' : ''}`}
          type="button"
          onClick={() => {
            toggleSaved(job.id);
            showToast(
              saved
                ? `${job.title} ${t('removed from saved jobs')}`
                : `${job.title} ${t('saved to saved jobs')}`
            );
          }}
        >
          <Icon name="bookmark" size={16} /> {saved ? t('Remove') : t('Save')}
        </button>
      </div>
    </Modal>
  );
}

const empty = { name: '', email: '', phone: '', note: '' };
const emailPattern = /^[^\s@]+@[^\s@]+\.[a-z]{2,}$/i;

export function ApplyModal({ job, onClose }) {
  const { t, user, applyToJob, showToast } = useApp();
  const navigate = useNavigate();
  const location = useLocation();
  const [form, setForm] = useState(empty);
  const [errors, setErrors] = useState({});
  const [done, setDone] = useState(false);
  const [loading, setLoading] = useState(false);
  const [file, setFile] = useState(null);
  const timerRef = useRef(null);
  const mounted = useRef(true);

  useEffect(() => {
    mounted.current = true;
    return () => {
      mounted.current = false;
      clearTimeout(timerRef.current);
    };
  }, []);

  useEffect(() => {
    if (job) {
      setFile(null);
      setForm({
        name: user?.name ?? '',
        email: user?.email ?? '',
        phone: '',
        note: '',
      });
      setErrors({});
      setDone(false);
    }
  }, [job, user]);

  // Closing the dialog before the short submit delay cancels the submission
  // instead of adding an application the visitor never confirmed.
  useEffect(() => {
    if (!job) {
      clearTimeout(timerRef.current);
      setLoading(false);
    }
  }, [job]);

  if (!job) return null;

  const nextUrl = `${location.pathname}${location.search}`;
  const goSignIn = () => {
    onClose();
    navigate(`/login?next=${encodeURIComponent(nextUrl)}`);
  };

  if (!user) {
    return (
      <Modal
        open
        onClose={onClose}
        title={t('Sign in to apply')}
        subtitle={`${job.title} · ${job.company}`}
        narrow
      >
        <p style={{ marginBottom: 16, color: 'var(--muted)', lineHeight: 1.7 }}>
          {t(
            'Create a free worker account to apply, upload your CV and track every application in your dashboard.'
          )}
        </p>
        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
          <button type="button" className="btn btn--primary" onClick={goSignIn}>
            {t('Sign In')}
          </button>
          <Link
            className="btn btn--ghost"
            to={`/signup?role=worker&next=${encodeURIComponent(nextUrl)}`}
            onClick={onClose}
          >
            {t('Create an account')}
          </Link>
        </div>
      </Modal>
    );
  }

  // The refresh after a successful submit adds the row to the cache; only
  // treat that as "already applied" when this dialog was opened fresh.
  if (!done && db.list('applications').some((row) => row.jobId === job.id && row.applicantId === user.id)) {
    return (
      <Modal
        open
        onClose={onClose}
        title={t('Already applied')}
        subtitle={`${job.title} · ${job.company}`}
        narrow
      >
        <p style={{ marginBottom: 16, color: 'var(--muted)', lineHeight: 1.7 }}>
          {t('You have already applied to this job. You can track its status in your dashboard.')}
        </p>
        <Link
          className="btn btn--primary"
          to="/dashboard/worker?tab=applications"
          onClick={onClose}
        >
          {t('Application status')}
        </Link>
      </Modal>
    );
  }

  const set = (key) => (e) => {
    setForm((prev) => ({ ...prev, [key]: e.target.value }));
    setErrors((prev) => ({ ...prev, [key]: undefined }));
  };

  const submit = (e) => {
    e.preventDefault();
    const next = {};
    if (!form.name.trim()) next.name = t('This field is required');
    if (!form.email.trim()) next.email = t('This field is required');
    else if (!emailPattern.test(form.email)) next.email = t('Enter a valid email address');
    if (!form.phone.trim()) next.phone = t('This field is required');
    setErrors(next);
    if (Object.keys(next).length) return;

    setLoading(true);
    timerRef.current = setTimeout(async () => {
      const result = await applyToJob(
        {
          jobId: job.id,
          jobTitle: job.title,
          company: job.company,
          city: job.city,
          industry: job.industry,
          name: form.name,
          email: form.email,
          phone: form.phone,
          note: form.note,
        },
        file
      );
      if (result?.error) {
        if (mounted.current) {
          setLoading(false);
          showToast(result.error, 'error');
        }
        return;
      }
      if (result?.cvError) {
        showToast(t('Application saved, but the CV could not be uploaded.'), 'error');
      }
      if (!mounted.current) return;
      setLoading(false);
      setDone(true);
      showToast(`${t('Application submitted')}: ${job.title}`);
    }, 700);
  };

  return (
    <Modal
      open={!!job}
      onClose={onClose}
      title={done ? t('Application submitted') : t('Apply for this job')}
      subtitle={job.title + ' · ' + job.company}
      narrow
    >
      {done ? (
        <div>
          <div className="form-status form-status--success" style={{ marginTop: 0 }}>
            <strong>{t('Application received')}</strong>
            <br />
            {t(
              'Your application has been saved and appears in the GoldenGlow admin panel. Track its status from your worker dashboard.'
            )}
          </div>
          <div style={{ display: 'flex', gap: 10, marginTop: 18, flexWrap: 'wrap' }}>
            <Link className="btn btn--primary" to="/dashboard/worker?tab=applications" onClick={onClose}>
              {t('Application status')}
            </Link>
            <button className="btn btn--ghost" type="button" onClick={onClose}>
              {t('Browse vacancies')}
            </button>
          </div>
        </div>
      ) : (
        <form onSubmit={submit} noValidate>
          <div className="form-grid" style={{ marginBottom: 16 }}>
            <div className="field">
              <label htmlFor="a-name">{t('Full name')} *</label>
              <input
                id="a-name"
                className={`input ${errors.name ? 'has-error' : ''}`}
                value={form.name}
                onChange={set('name')}
                autoComplete="name"
              />
              {errors.name && <span className="field-error">{errors.name}</span>}
            </div>
            <div className="field">
              <label htmlFor="a-email">{t('Email address')} *</label>
              <input
                id="a-email"
                type="email"
                className={`input ${errors.email ? 'has-error' : ''}`}
                value={form.email}
                onChange={set('email')}
                autoComplete="email"
              />
              {errors.email && <span className="field-error">{errors.email}</span>}
            </div>
            <div className="field">
              <label htmlFor="a-phone">{t('Phone number')} *</label>
              <input
                id="a-phone"
                className={`input ${errors.phone ? 'has-error' : ''}`}
                value={form.phone}
                onChange={set('phone')}
                placeholder="+966 5X XXX XXXX"
                autoComplete="tel"
              />
              {errors.phone && <span className="field-error">{errors.phone}</span>}
            </div>
            <div className="field">
              <label htmlFor="a-cv">{t('Upload CV / résumé')}</label>
              <input
                id="a-cv"
                className="input"
                type="file"
                accept=".pdf,.doc,.docx"
                onChange={(e) => {
                  const next = e.target.files?.[0] || null;
                  if (next && next.size > 5 * 1024 * 1024) {
                    showToast(t('CV must be under 5 MB'), 'error');
                    e.target.value = '';
                    return;
                  }
                  setFile(next);
                }}
              />
              {file && (
                <span className="form-note" style={{ marginTop: 4 }}>
                  {file.name} · {Math.round(file.size / 1024)} KB
                </span>
              )}
            </div>
            <div className="field full">
              <label htmlFor="a-note">{t('Cover note')}</label>
              <textarea
                id="a-note"
                className="textarea"
                value={form.note}
                onChange={set('note')}
                placeholder={t('Tell the employer briefly about your experience and availability.')}
              />
            </div>
          </div>

          <p className="form-note" style={{ marginTop: 0, marginBottom: 14 }}>
            {t(
              'Your application is stored securely for this site. CV files go to private storage and are only accessible to you and GoldenGlow staff.'
            )}
          </p>

          <button className="btn btn--primary btn--block" type="submit" disabled={loading}>
            {loading ? (
              <>
                <span className="spinner" aria-hidden="true" /> {t('Sending…')}
              </>
            ) : (
              <>
                <Icon name="send" size={16} /> {t('Send application')}
              </>
            )}
          </button>
        </form>
      )}
    </Modal>
  );
}
