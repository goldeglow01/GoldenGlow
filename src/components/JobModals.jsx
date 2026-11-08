import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import Modal from './Modal';
import Icon from './Icon';
import { useApp } from '../context/AppContext';
import { formatDate, formatSalary } from '../data/jobs';
import { industries, industryName } from '../data/industries';
import { db } from '../lib/db';

export function JobDetailModal({ job, onClose, onApply }) {
  const { t, lang, savedJobs, toggleSaved } = useApp();
  if (!job) return null;
  const industry = industries.find((i) => i.slug === job.industry);
  const salary = formatSalary(job.salary, lang);
  const saved = savedJobs.includes(job.id);

  return (
    <Modal open={!!job} onClose={onClose} title={job.title} subtitle={`${job.company} · ${job.city}`}>
      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 14 }}>
        <span className={`badge ${job.verified ? 'badge--verified' : ''}`}>
          {job.verified ? t('Verified') : t('Sample listing')}
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

      {!job.verified && (
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
          onClick={() => toggleSaved(job.id)}
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
  const { t, user, addApplication, showToast } = useApp();
  const [form, setForm] = useState(empty);
  const [errors, setErrors] = useState({});
  const [done, setDone] = useState(false);
  const [loading, setLoading] = useState(false);
  const [file, setFile] = useState(null);

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

  if (!job) return null;

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
    setTimeout(() => {
      const record = addApplication({
        jobId: job.id,
        jobTitle: job.title,
        company: job.company,
        city: job.city,
        industry: job.industry,
        name: form.name,
        email: form.email,
        phone: form.phone,
        note: form.note,
        cv: file ? { name: file.name, size: file.size } : null,
      });
      if (file && record) db.saveFile(record.id, file);
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
              'Your details are saved to the site records and appear in the GoldenGlow admin panel. Connect a hosted database to share them across devices.'
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
                onChange={(e) => setFile(e.target.files?.[0] || null)}
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
              'Your application is stored privately for this site. CV files are kept in this browser only until document storage is connected.'
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
