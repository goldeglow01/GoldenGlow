import { useRef } from 'react';
import { Link } from 'react-router-dom';
import Icon from './Icon';
import Reveal from './Reveal';
import { industries, industryName } from '../data/industries';
import { useApp } from '../context/AppContext';
import { moveGlow, resetTilt } from '../lib/tilt';

export default function Industries() {
  const { t } = useApp();
  const trackRef = useRef(null);

  const scrollByCards = (direction) => {
    const track = trackRef.current;
    if (!track) return;
    const card = track.querySelector('.ind-card');
    const step = card ? card.getBoundingClientRect().width + 18 : 240;
    // In RTL the scroll origin is mirrored, so "next" moves the other way.
    const rtl = document.documentElement.dir === 'rtl';
    track.scrollBy({ left: (rtl ? -direction : direction) * step * 2, behavior: 'smooth' });
  };

  return (
    <section className="section" id="industries">
      <div className="container">
        <Reveal className="industries-panel">
          <div className="industries-panel__bg" aria-hidden="true">
            <img src="/images/industries-bg.jpg" alt="" loading="lazy" decoding="async" />
          </div>

          <div className="section-head">
            <span className="eyebrow">{t('Explore by Industry')}</span>
            <h2 className="h2">{t('Find the Right Workforce for Every Industry.')}</h2>
            <p className="sub">
              {t(
                'From specialist trades to large-scale operations, GoldenGlow helps businesses connect with the people they need.'
              )}
            </p>
          </div>

          <div className="ind-carousel">
            <button
              type="button"
              className="ind-arrow ind-arrow--prev"
              aria-label={t('Previous industries')}
              onClick={() => scrollByCards(-1)}
            >
              <Icon name="chevron-left" size={20} />
            </button>
            <button
              type="button"
              className="ind-arrow ind-arrow--next"
              aria-label={t('Next industries')}
              onClick={() => scrollByCards(1)}
            >
              <Icon name="chevron-right" size={20} />
            </button>

            <div className="ind-track" ref={trackRef} tabIndex={0} aria-label={t('Industries')}>
              {industries.map((industry) => (
                <article
                  className="ind-card"
                  key={industry.slug}
                  onPointerMove={moveGlow}
                  onPointerLeave={resetTilt}
                >
                  <span className="tilt-glow" aria-hidden="true" />
                  <span className={`ind-card__icon tone-${industry.tone}`}>
                    <Icon name={industry.icon} size={26} strokeWidth={1.6} />
                  </span>
                  <h3>{t(industryName(industry))}</h3>
                  <p>{t(industry.desc)}</p>
                  <Link className="link-arrow" to={`/jobs?industry=${industry.slug}`}>
                    {t('Explore Jobs')} <Icon name="arrow-right" size={13} />
                  </Link>
                </article>
              ))}
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
