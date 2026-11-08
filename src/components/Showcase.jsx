import Icon from './Icon';
import Reveal from './Reveal';
import { showcase } from '../data/content';
import { useApp } from '../context/AppContext';

export default function Showcase() {
  const { t } = useApp();

  return (
    <section className="section" id="showcase">
      <div className="container">
        <Reveal className="section-head section-head--center">
          <span className="eyebrow">{t('At Work')}</span>
          <h2 className="h2">{t('Workforce Showcase')}</h2>
          <p className="sub">{t('Real trades, real workplaces, from site crews to front desks.')}</p>
        </Reveal>

        <div className="masonry">
          {showcase.map((item, i) => (
            <Reveal
              as="figure"
              key={item.image}
              delay={(i % 3) * 80}
              className={i % 5 === 1 ? 'is-tall' : i % 7 === 4 ? 'is-wide' : ''}
            >
              <img
                src={item.image}
                alt={`${t(item.role)} — ${t(item.caption)}`}
                loading="lazy"
                decoding="async"
              />
              <figcaption>
                <strong>{t(item.role)}</strong>
                <span>{t(item.caption)}</span>
              </figcaption>
            </Reveal>
          ))}
        </div>


      </div>
    </section>
  );
}
