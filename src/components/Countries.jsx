import Icon from './Icon';
import Reveal from './Reveal';
import { countries } from '../data/content';
import { useApp } from '../context/AppContext';

export default function Countries() {
  const { t } = useApp();

  return (
    <section className="section" id="countries">
      <div className="container">
        <div className="split" style={{ alignItems: 'end' }}>
          <Reveal className="section-head" style={{ marginBottom: 0 }}>
            <span className="eyebrow">{t('Global Reach')}</span>
            <h2 className="h2">{t('Connecting Talent Across Borders.')}</h2>
            <p className="sub">
              {t(
                'GoldenGlow is a Doha-based workforce partner supporting connections between Qatar and talent markets abroad, subject to applicable laws, employer requirements, and recruitment permissions.'
              )}
            </p>
          </Reveal>

        </div>

        <div className="country-grid" style={{ marginTop: 30 }}>
          {countries.map((country, i) => (
            <Reveal className="country-card" key={country.code} delay={i * 45}>
              <img
                src={country.flag || `/flags/${country.code}.png`}
                alt={`${country.name} flag`}
                width="42"
                height="30"
                loading="lazy"
              />
              <div>
                <strong>{t(country.name)}</strong>
                <small>{t(country.note)}</small>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
