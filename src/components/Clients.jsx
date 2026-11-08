import { clients } from '../data/content';
import { useApp } from '../context/AppContext';

/**
 * Client logo band. The track holds two copies of the list so it can loop
 * seamlessly while sliding from left to right; the duplicate is hidden from
 * assistive tech. Motion pauses on hover/focus and is skipped entirely when
 * the visitor prefers reduced motion (the band then scrolls manually).
 */
export default function Clients() {
  const { t } = useApp();

  return (
    <section className="clients" aria-label={t('Companies we work with')}>
      <p className="clients__label">{t('Companies we work with')}</p>

      <div className="clients__viewport">
        <div className="clients__track">
          {[0, 1].map((copy) => (
            <ul className="clients__group" key={copy} aria-hidden={copy === 1 ? 'true' : undefined}>
              {clients.map((client) => (
                <li className="clients__item" key={`${copy}-${client.name}`}>
                  <img
                    src={client.logo}
                    alt={copy === 0 ? client.name : ''}
                    width="560"
                    height="360"
                    loading="lazy"
                    decoding="async"
                  />
                </li>
              ))}
            </ul>
          ))}
        </div>
      </div>
    </section>
  );
}
