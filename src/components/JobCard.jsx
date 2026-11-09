import Icon from './Icon';
import { useApp } from '../context/AppContext';
import { formatDate, formatSalary } from '../data/jobs';
import { industries, industryName } from '../data/industries';

export default function JobCard({ job, onView, onApply }) {
  const { t, lang, savedJobs, toggleSaved, showToast } = useApp();
  const saved = savedJobs.includes(job.id);
  const industry = industries.find((i) => i.slug === job.industry);
  const salary = formatSalary(job.salary, lang);
  const isSample = Boolean(job.isSample);

  return (
    <article className="job-card">
      <div className="job-card__top">
        <div>
          <h3>{job.title}</h3>
          <p className="job-card__company">{job.company}</p>
        </div>
        <span className={`badge ${!isSample && job.verified ? 'badge--verified' : ''}`}>
          {isSample ? (
            t('Sample listing')
          ) : job.verified ? (
            <>
              <Icon name="shield-check" size={12} /> {t('Verified')}
            </>
          ) : (
            t('Pending review')
          )}
        </span>
      </div>

      <div className="chips">
        <span className="chip">
          <Icon name="pin" size={12} /> {job.city}
        </span>
        <span className="chip">
          <Icon name="briefcase" size={12} /> {industry ? t(industryName(industry)) : job.industry}
        </span>
        <span className="chip">
          <Icon name="clock" size={12} /> {job.type}
        </span>
        <span className="chip">
          <Icon name="award" size={12} /> {job.experience}
        </span>
      </div>

      <p className="job-card__desc">{job.description}</p>

      <div className="job-card__foot">
        <div>
          <span className="job-card__salary">
            {salary || t('Salary not disclosed')}
          </span>
          <span style={{ display: 'block', fontSize: 11, color: '#9a8b95', marginTop: 2 }}>
            {t('Posted')} {formatDate(job.posted, lang)}
          </span>
        </div>
        <div className="job-card__actions">
          <button
            type="button"
            className={`save-btn ${saved ? 'is-saved' : ''}`}
            aria-label={saved ? t('Remove') : t('Save')}
            aria-pressed={saved}
            onClick={() => {
              toggleSaved(job.id);
              showToast(
                saved
                  ? `${job.title} ${t('removed from saved jobs')}`
                  : `${job.title} ${t('saved to saved jobs')}`
              );
            }}
          >
            <Icon name="bookmark" size={16} />
          </button>
          <button type="button" className="btn btn--ghost btn--sm" onClick={() => onView(job)}>
            {t('View Details')}
          </button>
          <button type="button" className="btn btn--primary btn--sm" onClick={() => onApply(job)}>
            {t('Apply Now')}
          </button>
        </div>
      </div>
    </article>
  );
}
