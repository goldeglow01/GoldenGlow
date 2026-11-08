import { Link } from 'react-router-dom';
import Icon from './Icon';
import Reveal from './Reveal';
import { useApp } from '../context/AppContext';

export default function About() {
  const { t } = useApp();

  const values = [
    {
      icon: 'users',
      title: 'Workforce Matching',
      text: 'Requirements are matched to workers by trade, experience level and site conditions — not by whoever is available first.',
    },
    {
      icon: 'layers',
      title: 'Industry-Focused Recruitment',
      text: 'Construction, technical services, hospitality, logistics and facility teams are sourced and screened separately, with trade-specific checks.',
    },
    {
      icon: 'shield-check',
      title: 'Employer and Worker Support',
      text: 'Clear documentation, one point of contact and follow-up after joining, for the company and for the worker.',
    },
  ];

  return (
    <section className="section" id="about">
      <div className="container split">
        <Reveal className="about-media">
          <img
            className="about-media__main"
            src="/images/about-team.jpg"
            alt="Construction team in safety gear collaborating on site with a tablet"
            width="900"
            height="950"
            loading="eager"
            decoding="async"
          />
          <div className="about-media__badge">
            <span className="value-row__icon" style={{ background: 'var(--gold-050)', color: 'var(--gold-600)' }}>
              <Icon name="pin" size={18} />
            </span>
            <span>
              <strong>9</strong>
              <small>{t('Saudi cities covered')}</small>
            </span>
          </div>
        </Reveal>

        <Reveal delay={120}>
          <span className="eyebrow">{t('About GoldenGlow')}</span>
          <h2 className="h2">{t('Your Workforce Partner in Saudi Arabia.')}</h2>
          <p className="sub">
            {t(
              'GoldenGlow is designed to connect employers with suitable talent across a broad range of industries. Our goal is to make workforce discovery simpler, improve access to opportunities, and help businesses find the right people for their operational needs.'
            )}
          </p>

          <div className="about-values">
            {values.map((value) => (
              <div className="value-row" key={value.title}>
                <span className="value-row__icon">
                  <Icon name={value.icon} size={19} />
                </span>
                <div>
                  <h4>{t(value.title)}</h4>
                  <p>{t(value.text)}</p>
                </div>
              </div>
            ))}
          </div>

          <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
            <Link className="btn btn--primary" to="/#contact">
              {t('Learn More About Us')}
              <Icon name="arrow-right" size={16} />
            </Link>
            <Link className="btn btn--ghost" to="/jobs">
              {t('Explore Jobs')}
            </Link>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
