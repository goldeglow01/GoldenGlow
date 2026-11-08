import { useState } from 'react';
import { Link } from 'react-router-dom';
import Icon from './Icon';
import Reveal from './Reveal';
import { journeys } from '../data/content';
import { useApp } from '../context/AppContext';

export default function HowItWorks() {
  const { t } = useApp();
  const [tab, setTab] = useState('employers');
  const [active, setActive] = useState(0);
  const steps = journeys[tab];
  const step = steps[active];
  const last = active === steps.length - 1;
  const cta = tab === 'employers' ? '/#contact' : '/signup?role=worker';

  const switchTab = (next) => {
    setTab(next);
    setActive(0);
  };

  return (
    <section className="section section--soft" id="how-it-works">
      <div className="container">
        <Reveal
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            gap: 24,
            flexWrap: 'wrap',
            alignItems: 'flex-end',
          }}
        >
          <div className="section-head" style={{ marginBottom: 0 }}>
            <span className="eyebrow">{t('Simple Process')}</span>
            <h2 className="h2">{t('How It Works')}</h2>
            <p className="sub">
              {t('Three clear steps, whether you are hiring or looking for work. Tap a step to see what happens.')}
            </p>
          </div>

          <div className="tabs" role="tablist" aria-label={t('How It Works')}>
            <button
              type="button"
              role="tab"
              aria-selected={tab === 'employers'}
              className={`tab ${tab === 'employers' ? 'is-active' : ''}`}
              onClick={() => switchTab('employers')}
            >
              {t('For Employers')}
            </button>
            <button
              type="button"
              role="tab"
              aria-selected={tab === 'workers'}
              className={`tab ${tab === 'workers' ? 'is-active' : ''}`}
              onClick={() => switchTab('workers')}
            >
              {t('For Workers')}
            </button>
          </div>
        </Reveal>

        <div className="hiw">
          <ol className="hiw-rail">
            {steps.map((item, i) => (
              <li key={`${tab}-${i}`}>
                <button
                  type="button"
                  className={`hiw-step ${i === active ? 'is-active' : ''} ${i < active ? 'is-done' : ''}`}
                  aria-current={i === active ? 'step' : undefined}
                  onClick={() => setActive(i)}
                >
                  <span className="hiw-step__num">
                    {i < active ? <Icon name="check" size={15} /> : `0${i + 1}`}
                  </span>
                  <span className="hiw-step__body">
                    <strong>{t(item.title)}</strong>
                    <small>{t(item.text)}</small>
                  </span>
                  <Icon name="chevron-right" size={15} className="hiw-step__chev" />
                </button>
              </li>
            ))}
            <li aria-hidden="true">
              <div className="hiw-rail__track">
                <span style={{ width: `${(active / (steps.length - 1)) * 100}%` }} />
              </div>
            </li>
          </ol>

          <div className="hiw-panel" role="tabpanel" aria-live="polite">
            <span className="hiw-panel__kicker">
              {t('Step')} 0{active + 1} / 0{steps.length}
            </span>
            <h3>{t(step.title)}</h3>
            <p>{t(step.detail)}</p>

            <div className="hiw-outcome">
              <span className="hiw-outcome__icon">
                <Icon name="check" size={16} />
              </span>
              <div>
                <strong>{t('What you get')}</strong>
                <p>{t(step.outcome)}</p>
              </div>
            </div>

            <div className="hiw-progress" aria-hidden="true">
              {steps.map((_, i) => (
                <span key={i} className={i <= active ? 'is-on' : ''} />
              ))}
            </div>

            <div className="hiw-nav">
              <button
                type="button"
                className="btn btn--ghost btn--sm"
                onClick={() => setActive(Math.max(0, active - 1))}
                disabled={active === 0}
              >
                <Icon name="arrow-left" size={14} /> {t('Back')}
              </button>
              {last ? (
                <Link className="btn btn--primary btn--sm" to={cta}>
                  {t('Start now')} <Icon name="arrow-right" size={14} />
                </Link>
              ) : (
                <button
                  type="button"
                  className="btn btn--primary btn--sm"
                  onClick={() => setActive(active + 1)}
                >
                  {t('Next step')} <Icon name="arrow-right" size={14} />
                </button>
              )}
            </div>
          </div>
        </div>

        <p className="process-note">
          <Icon name="shield" size={13} style={{ verticalAlign: '-2px', marginInlineEnd: 5 }} />
          {t(
            'No guarantees of employment, visas or placement are implied. Outcomes depend on employer requirements and applicable regulations.'
          )}
        </p>
      </div>
    </section>
  );
}
