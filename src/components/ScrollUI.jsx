import { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { useApp } from '../context/AppContext';

const SECTIONS = [
  ['home', 'Home'],
  ['about', 'About'],
  ['industries', 'Industries'],
  ['employers', 'For Employers'],
  ['jobs', 'Jobs'],
  ['how-it-works', 'How It Works'],
  ['countries', 'Countries'],
  ['why-us', 'Why GoldenGlow'],
  ['showcase', 'Workforce Showcase'],
  ['contact', 'Contact'],
];

/** Thin scroll-progress bar plus clickable section dots on the homepage. */
export default function ScrollUI() {
  const { t } = useApp();
  const { pathname } = useLocation();
  const [progress, setProgress] = useState(0);
  const [active, setActive] = useState('home');
  const isHome = pathname === '/';

  useEffect(() => {
    const onScroll = () => {
      const max = document.documentElement.scrollHeight - window.innerHeight;
      setProgress(max > 0 ? Math.min(1, window.scrollY / max) : 0);
    };
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll);
    return () => {
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onScroll);
    };
  }, [pathname]);

  useEffect(() => {
    if (!isHome || typeof IntersectionObserver === 'undefined') return undefined;
    const elements = SECTIONS.map(([id]) => document.getElementById(id)).filter(Boolean);
    if (!elements.length) return undefined;
    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
        if (visible) setActive(visible.target.id);
      },
      { rootMargin: '-25% 0px -55% 0px', threshold: [0, 0.2, 0.5] }
    );
    elements.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, [isHome]);

  const jump = (id) => {
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  return (
    <>
      <div className="scroll-progress" aria-hidden="true">
        <span style={{ width: `${progress * 100}%` }} />
      </div>

      {isHome && (
        <nav className="section-dots" aria-label="Page sections">
          {SECTIONS.map(([id, label]) => (
            <button
              key={id}
              type="button"
              className={active === id ? 'is-active' : ''}
              aria-label={t(label)}
              aria-current={active === id ? 'true' : undefined}
              title={t(label)}
              onClick={() => jump(id)}
            />
          ))}
        </nav>
      )}
    </>
  );
}
