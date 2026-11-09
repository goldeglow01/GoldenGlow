import { useEffect, useState } from 'react';
import Icon from './Icon';
import { db } from '../lib/db';
import { useApp } from '../context/AppContext';
import { industries, industryName } from '../data/industries';

const emailPattern = /^[^\s@]+@[^\s@]+\.[a-z]{2,}$/i;

export default function JobAlert({ filters }) {
  const { t } = useApp();
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [saved, setSaved] = useState(false);
  const [saving, setSaving] = useState(false);

  // Let the visitor save another alert after they change the filters.
  const filterKey = JSON.stringify(filters);
  useEffect(() => {
    setSaved(false);
  }, [filterKey]);

  const industry = industries.find((i) => i.slug === filters.industry);
  const summary = [
    filters.q && `“${filters.q}”`,
    industry && t(industryName(industry)),
    filters.city,
    filters.experience,
    filters.type,
  ].filter(Boolean);

  const submit = async (e) => {
    e.preventDefault();
    if (!emailPattern.test(email)) {
      setError(t('Enter a valid email address'));
      return;
    }
    setSaving(true);
    let result = null;
    try {
      result = await db.saveAlert({
        email: email.trim(),
        filters: {
          q: filters.q,
          industry: filters.industry,
          city: filters.city,
          experience: filters.experience,
          type: filters.type,
          salary: filters.salary,
        },
        source: 'jobs-browser',
      });
    } catch {
      result = { error: true };
    } finally {
      setSaving(false);
    }
    if (result?.error) {
      setError(t('Could not save this search. Please try again.'));
      return;
    }
    setError('');
    setSaved(true);
    setEmail('');
  };

  return (
    <div className="job-alert">
      <div className="job-alert__text">
        <span className="job-alert__icon">
          <Icon name="mail" size={17} />
        </span>
        <div>
          <strong>{t('Email me jobs like this')}</strong>
          <small>
            {summary.length
              ? `${t('Watching')}: ${summary.join(' · ')}`
              : t('Watching all vacancies across Saudi Arabia')}
          </small>
        </div>
      </div>

      {saved ? (
        <p className="job-alert__done" role="status">
          <Icon name="check" size={15} />
          {t('Search saved. Our team can send matching vacancies to that address.')}
        </p>
      ) : (
        <form className="job-alert__form" onSubmit={submit} noValidate>
          <label htmlFor="alert-email" className="sr-only">
            {t('Email address')}
          </label>
          <input
            id="alert-email"
            className={`input ${error ? 'has-error' : ''}`}
            type="email"
            placeholder="you@example.com"
            value={email}
            onChange={(e) => {
              setEmail(e.target.value);
              setError('');
            }}
            autoComplete="email"
          />
          <button className="btn btn--primary" type="submit" disabled={saving}>
            {saving ? t('Saving…') : t('Save this search')}
          </button>
          {error && <span className="field-error">{error}</span>}
        </form>
      )}
    </div>
  );
}
