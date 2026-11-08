import { Link } from 'react-router-dom';
import Icon from './Icon';
import Reveal from './Reveal';
import { useApp } from '../context/AppContext';

const figures = [
  { value: 2, suffix: '+', label: 'Years Experience' },
  { value: 5, suffix: '+', label: 'Countries Served' },
  { value: 50, suffix: '+', label: 'Workers Per Month Target' },
];

/* Saudi Arabia is the origin hub; every link is drawn from Riyadh. */
const ORIGIN = { lat: 24.71, lon: 46.68 };
const NETWORK = [
  { lat: 28.61, lon: 77.2 }, // Delhi
  { lat: 24.86, lon: 67.0 }, // Karachi
  { lat: 23.81, lon: 90.41 }, // Dhaka
  { lat: 27.71, lon: 85.32 }, // Kathmandu
  { lat: 14.6, lon: 120.98 }, // Manila
  { lat: 6.93, lon: 79.86 }, // Colombo
  { lat: 30.04, lon: 31.24 }, // Cairo
  { lat: 51.5, lon: -0.13 }, // London
];

/* The globe backdrop is an equirectangular map showing 180° of longitude,
   centred on Riyadh, so lat/lon map linearly onto the circle. */
const project = ({ lat, lon }) => ({
  x: 50 + (lon - ORIGIN.lon) * (100 / 180),
  y: 50 - lat * (100 / 180),
});

const checks = [
  'Skilled, screened trade workers for the right job',
  'Clear, documented recruitment steps',
  'Support for workers after placement',
  'Direct communication with employers',
];

export default function WhyTop() {
  const { t } = useApp();

  return (
    <section className="section why-top" id="why-us">
      <div className="container why-top__grid">
        <Reveal>
          <span className="eyebrow">{t('Trusted Workforce Partner')}</span>
          <h2 className="h2">{t('Why GoldenGlow is #1 in Saudi Arabia')}</h2>

          <div className="bigstats">
            {figures.map((figure) => (
              <div key={figure.label}>
                <div className="bigstat__value">
                  {figure.value}
                  <span className="suffix">{figure.suffix}</span>
                </div>
                <div className="bigstat__label">{t(figure.label)}</div>
              </div>
            ))}
          </div>

          <span className="badge-pill">
            <Icon name="shield-check" size={14} />
            {t('Trusted Workforce Partner')}
          </span>

          <h3 className="h3" style={{ marginTop: 18 }}>
            {t('Looking for a Trusted Workforce Partner?')}
          </h3>
          <p className="sub">
            {t(
              'GoldenGlow helps employers describe their manpower needs and helps workers present their skills clearly. We keep the process transparent from first enquiry to shortlist, with documented steps and clear communication.'
            )}
          </p>

          <div className="check-grid">
            {checks.map((check) => (
              <div className="check-card" key={check}>
                <Icon name="check" size={16} />
                <span>{t(check)}</span>
              </div>
            ))}
          </div>

          <div style={{ marginTop: 24, display: 'flex', gap: 12, flexWrap: 'wrap' }}>
            <Link className="btn btn--primary" to="/#contact">
              {t('Get Workforce Support')}
              <Icon name="arrow-right" size={16} />
            </Link>
            <Link className="btn btn--ghost" to="/jobs">
              {t('Browse All Jobs')}
            </Link>
            <Link className="btn btn--ghost" to="/licences">
              <Icon name="shield-check" size={16} />
              {t('View Licences')}
            </Link>
          </div>
        </Reveal>

        <Reveal delay={140}>
          <div className="globe-static" aria-hidden="true">
            <span className="globe-static__ring" />
            <span className="globe-static__ring globe-static__ring--2" />
            <svg className="globe-static__links" viewBox="0 0 100 100" preserveAspectRatio="none">
              {NETWORK.map((hub, i) => {
                const from = project(ORIGIN);
                const to = project(hub);
                const control = {
                  x: (from.x + to.x) / 2 + (from.x + to.x - 100) * 0.12,
                  y: (from.y + to.y) / 2 + (from.y + to.y - 100) * 0.22,
                };
                return (
                  <g key={`${hub.lat}-${hub.lon}`}>
                    <path
                      d={`M ${from.x} ${from.y} Q ${control.x} ${control.y} ${to.x} ${to.y}`}
                      fill="none"
                      stroke={i % 3 === 0 ? '#f5b82e' : '#e9c9d8'}
                      strokeWidth="0.5"
                      strokeDasharray="1.6 1.6"
                      opacity="0.85"
                    />
                    <circle cx={to.x} cy={to.y} r="0.85" fill={i % 3 === 0 ? '#f5b82e' : '#ffffff'} />
                  </g>
                );
              })}
              <circle cx="50" cy={project(ORIGIN).y} r="1.5" fill="#f5b82e" />
              <circle
                cx="50"
                cy={project(ORIGIN).y}
                r="3.4"
                fill="none"
                stroke="#f5b82e"
                strokeWidth="0.5"
                opacity="0.7"
              />
            </svg>
          </div>
          <div className="globe-card" style={{ position: 'relative', margin: '-22px auto 0', width: 'fit-content' }}>
            <Icon name="pin" size={15} />
            {t('Riyadh, Saudi Arabia')}
            <span className="legend-dot" style={{ width: 6, height: 6 }} />
          </div>
        </Reveal>
      </div>
    </section>
  );
}
