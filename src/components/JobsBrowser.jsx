import { useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import Icon from './Icon';
import JobCard from './JobCard';
import { JobDetailModal, ApplyModal } from './JobModals';
import { useApp } from '../context/AppContext';
import { jobs } from '../data/jobs';
import { industries, industryName } from '../data/industries';
import { cities, employmentTypes, experienceLevels } from '../data/site';
import JobAlert from './JobAlert';
import { db } from '../lib/db';

const salaryBands = [
  { value: 'any', label: 'Any salary' },
  { value: 'under-2000', label: 'Under SAR 2,000' },
  { value: '2000-3500', label: 'SAR 2,000 – 3,500' },
  { value: 'above-3500', label: 'SAR 3,500+' },
];

export default function JobsBrowser({ syncUrl = false, limit = 6, compact = false }) {
  const { t } = useApp();
  const [params, setParams] = useSearchParams();
  const [local, setLocal] = useState({
    q: '',
    industry: '',
    city: '',
    experience: '',
    type: '',
    salary: 'any',
    sort: 'newest',
  });
  const [visible, setVisible] = useState(limit);
  const [detail, setDetail] = useState(null);
  const [applyJob, setApplyJob] = useState(null);
  const [posted, setPosted] = useState(() => db.list('jobs'));

  // Admin-verified postings join the sample catalogue, live.
  useEffect(() => db.subscribe((snapshot) => setPosted(snapshot.jobs || [])), []);

  const pool = useMemo(
    () => [
      ...posted
        .filter((job) => job.status === 'verified')
        .map((job) => ({ ...job, verified: true })),
      ...jobs,
    ],
    [posted]
  );

  const filters = syncUrl
    ? {
        q: params.get('q') || '',
        industry: params.get('industry') || '',
        city: params.get('city') || '',
        experience: params.get('experience') || '',
        type: params.get('type') || '',
        salary: params.get('salary') || 'any',
        sort: params.get('sort') || 'newest',
      }
    : local;

  const setFilter = (key, value) => {
    if (syncUrl) {
      const next = new URLSearchParams(params);
      if (!value || (key === 'salary' && value === 'any') || (key === 'sort' && value === 'newest')) {
        next.delete(key);
      } else {
        next.set(key, value);
      }
      setParams(next, { replace: true });
    } else {
      setLocal((prev) => ({ ...prev, [key]: value }));
    }
  };

  const activeFilters = JSON.stringify(filters);

  useEffect(() => {
    setVisible(limit);
  }, [activeFilters, limit]);

  const filtered = useMemo(() => {
    const query = filters.q.trim().toLowerCase();
    let list = pool.filter((job) => {
      if (filters.industry && job.industry !== filters.industry) return false;
      if (filters.city && job.city !== filters.city) return false;
      if (filters.experience && job.experience !== filters.experience) return false;
      if (filters.type && job.type !== filters.type) return false;
      if (filters.salary && filters.salary !== 'any') {
        if (!job.salary) return false;
        if (filters.salary === 'under-2000' && job.salary.min >= 2000) return false;
        if (filters.salary === '2000-3500' && (job.salary.max < 2000 || job.salary.min > 3500)) return false;
        if (filters.salary === 'above-3500' && job.salary.max < 3500) return false;
      }
      if (query) {
        const haystack = `${job.title} ${job.company} ${job.city} ${job.description} ${job.id}`.toLowerCase();
        if (!haystack.includes(query)) return false;
      }
      return true;
    });

    list = [...list].sort((a, b) => {
      if (filters.sort === 'salary') {
        return (b.salary?.max ?? 0) - (a.salary?.max ?? 0);
      }
      return new Date(b.posted) - new Date(a.posted);
    });

    return list;
  }, [filters, pool]);

  const shown = filtered.slice(0, visible);
  const hasActiveFilters =
    filters.q || filters.industry || filters.city || filters.experience || filters.type || (filters.salary && filters.salary !== 'any');

  const clearAll = () => {
    if (syncUrl) {
      const next = new URLSearchParams();
      if (filters.sort && filters.sort !== 'newest') next.set('sort', filters.sort);
      setParams(next, { replace: true });
    } else {
      setLocal((prev) => ({ ...prev, q: '', industry: '', city: '', experience: '', type: '', salary: 'any' }));
    }
  };

  return (
    <div>
      <div className="jobs-toolbar">
        <div className="jobs-toolbar__search">
          <label htmlFor="job-search" className="sr-only" style={{ position: 'absolute', left: -9999 }}>
            {t('Search by job title, company or keyword')}
          </label>
          <input
            id="job-search"
            className="input"
            type="search"
            placeholder={t('Search by job title, company or keyword')}
            value={filters.q}
            onChange={(e) => setFilter('q', e.target.value)}
          />
          <button className="btn btn--primary" type="button" onClick={() => setVisible(limit)}>
            <Icon name="search" size={16} />
            {t('Search')}
          </button>
        </div>

        <div className="jobs-toolbar__row">
          <div className="field">
            <span className="field__label">{t('Job Industry')}</span>
            <select className="select" value={filters.industry} onChange={(e) => setFilter('industry', e.target.value)}>
              <option value="">{t('All industries')}</option>
              {industries.map((industry) => (
                <option key={industry.slug} value={industry.slug}>
                  {t(industryName(industry))}
                </option>
              ))}
            </select>
          </div>

          <div className="field">
            <span className="field__label">{t('City')}</span>
            <select className="select" value={filters.city} onChange={(e) => setFilter('city', e.target.value)}>
              <option value="">{t('All cities')}</option>
              {cities.map((city) => (
                <option key={city} value={city}>
                  {city}
                </option>
              ))}
            </select>
          </div>

          <div className="field">
            <span className="field__label">{t('Experience level')}</span>
            <select
              className="select"
              value={filters.experience}
              onChange={(e) => setFilter('experience', e.target.value)}
            >
              <option value="">{t('All experience')}</option>
              {experienceLevels.map((level) => (
                <option key={level} value={level}>
                  {level}
                </option>
              ))}
            </select>
          </div>

          <div className="field">
            <span className="field__label">{t('Employment type')}</span>
            <select className="select" value={filters.type} onChange={(e) => setFilter('type', e.target.value)}>
              <option value="">{t('All types')}</option>
              {employmentTypes.map((type) => (
                <option key={type} value={type}>
                  {type}
                </option>
              ))}
            </select>
          </div>

          <div className="field">
            <span className="field__label">{t('Salary range')}</span>
            <select className="select" value={filters.salary} onChange={(e) => setFilter('salary', e.target.value)}>
              {salaryBands.map((band) => (
                <option key={band.value} value={band.value}>
                  {t(band.label)}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      <JobAlert filters={filters} />



      <div className="jobs-meta">
        <span>
          {t('Showing')} <strong>{shown.length}</strong> {t('of')} <strong>{filtered.length}</strong>{' '}
          {t('jobs found')}
        </span>
        <div style={{ display: 'flex', gap: 10, alignItems: 'center', flexWrap: 'wrap' }}>
          {hasActiveFilters && (
            <button type="button" className="btn btn--ghost btn--sm" onClick={clearAll}>
              <Icon name="filter" size={14} />
              {t('Clear filters')}
            </button>
          )}
          <label style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}>
            <span style={{ fontSize: 12, fontWeight: 700 }}>{t('Sort by')}</span>
            <select
              className="select"
              style={{ width: 'auto', paddingBlock: 8, fontSize: 13 }}
              value={filters.sort}
              onChange={(e) => setFilter('sort', e.target.value)}
            >
              <option value="newest">{t('Newest')}</option>
              <option value="salary">{t('Salary: high to low')}</option>
            </select>
          </label>
        </div>
      </div>

      {shown.length === 0 ? (
        <div className="empty-state">
          <Icon name="search" size={26} />
          <h3>{t('No jobs match your filters')}</h3>
          <p>{t('Try a different keyword, city or industry.')}</p>
          <button type="button" className="btn btn--primary btn--sm" style={{ marginTop: 14 }} onClick={clearAll}>
            {t('Clear filters')}
          </button>
        </div>
      ) : (
        <div className="jobs-grid">
          {shown.map((job) => (
            <JobCard key={job.id} job={job} onView={setDetail} onApply={setApplyJob} />
          ))}
        </div>
      )}

      {filtered.length > shown.length && (
        <div style={{ display: 'flex', justifyContent: 'center', marginTop: 26 }}>
          <button type="button" className="btn btn--ghost btn--lg" onClick={() => setVisible((v) => v + limit)}>
            {t('Load More')}
            <Icon name="chevron-down" size={16} />
          </button>
        </div>
      )}

      <JobDetailModal
        job={detail}
        onClose={() => setDetail(null)}
        onApply={(job) => {
          setDetail(null);
          setApplyJob(job);
        }}
      />
      <ApplyModal job={applyJob} onClose={() => setApplyJob(null)} />
    </div>
  );
}
