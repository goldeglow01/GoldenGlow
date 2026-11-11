import { Link } from 'react-router-dom';
import Icon from './Icon';
import Reveal from './Reveal';
import { employerServices } from '../data/content';
import { useApp } from '../context/AppContext';
import { moveTilt, resetTilt } from '../lib/tilt';

export default function Services() {
  const { t } = useApp();

  return (
    <section className="section section--soft" id="employers">
      <div className="container">
        <Reveal className="section-head">
          <span className="eyebrow">{t('For Employers')}</span>
          <h2 className="h2">{t('Build Your Team With the Right People.')}</h2>
          <p className="sub">
            {t(
              'From single roles to complete site teams, GoldenGlow helps employers describe requirements clearly and review suitable candidates.'
            )}
          </p>
        </Reveal>

        <div className="services-grid">
          {employerServices.map((service, i) => (
            <Reveal
              className="service-card tilt-card"
              key={service.title.en}
              delay={i * 55}
              onPointerMove={moveTilt}
              onPointerLeave={resetTilt}
            >
              <span className="tilt-glow" aria-hidden="true" />
              <span className="service-card__icon">
                <Icon name={service.icon} size={21} />
              </span>
              <h3>{t(service.title)}</h3>
              <p>{t(service.text)}</p>
              <Link className="btn btn--ghost btn--sm" to="/#contact">
                {t('Request Workforce')}
                <Icon name="arrow-right" size={14} />
              </Link>
            </Reveal>
          ))}
        </div>

        <Reveal className="cta-strip">
          <div>
            <h3>{t('Have a Project in Qatar?')}</h3>
            <p>{t('Tell us what workforce you need, and our team can review your requirements.')}</p>
          </div>
          <Link className="btn btn--gold btn--lg" to="/#contact">
            {t('Submit Your Manpower Requirement')}
            <Icon name="arrow-up-right" size={17} />
          </Link>
        </Reveal>
      </div>
    </section>
  );
}
