import { useEffect, useRef, useState } from 'react';
import Icon from './Icon';
import { useApp } from '../context/AppContext';
import { stats } from '../data/content';

function CountUp({ value, suffix, duration = 1400 }) {
  const [display, setDisplay] = useState(0);
  const ref = useRef(null);
  const started = useRef(false);

  useEffect(() => {
    const el = ref.current;
    if (!el || value == null) return undefined;

    const reduce =
      window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduce || typeof IntersectionObserver === 'undefined') {
      setDisplay(value);
      return undefined;
    }

    let frame;
    const run = () => {
      const start = performance.now();
      const tick = (now) => {
        const progress = Math.min((now - start) / duration, 1);
        // easeOutCubic
        const eased = 1 - Math.pow(1 - progress, 3);
        setDisplay(Math.round(value * eased));
        if (progress < 1) frame = requestAnimationFrame(tick);
      };
      frame = requestAnimationFrame(tick);
    };

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting && !started.current) {
            started.current = true;
            run();
            observer.disconnect();
          }
        });
      },
      { threshold: 0.4 }
    );
    observer.observe(el);

    return () => {
      observer.disconnect();
      cancelAnimationFrame(frame);
    };
  }, [value, duration]);

  return (
    <span ref={ref} className="stat__value-number">
      {display}
    </span>
  );
}

export default function Stats() {
  const { t, lang } = useApp();
  const fmt = (n) => new Intl.NumberFormat(lang === 'ar' ? 'ar-SA' : 'en-US').format(n);

  return (
    <section className="trust" aria-label={t('Connecting Businesses and Workers Through Reliable Workforce Solutions.')}>
      <div className="container">
        <div className="trust__panel">
          {stats.map((stat) => (
            <div className="stat" key={stat.label.en}>
              {stat.value == null ? (
                <div className="stat__value is-placeholder">{stat.placeholder}</div>
              ) : (
                <div className="stat__value">
                  <CountUp value={stat.value} />
                  <span className="suffix">{stat.suffix}</span>
                </div>
              )}
              <div className="stat__label">{t(stat.label)}</div>
            </div>
          ))}
        </div>
        <p className="trust__note">
          <Icon name="shield-check" size={13} style={{ verticalAlign: '-2px', marginInlineEnd: 4 }} />
          {t('Connecting Businesses and Workers Through Reliable Workforce Solutions.')}
        </p>
      </div>
    </section>
  );
}
