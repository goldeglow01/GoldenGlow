import { Link } from 'react-router-dom';
import Icon from '../components/Icon';
import Reveal from '../components/Reveal';
import { team } from '../data/content';
import { useApp } from '../context/AppContext';

/**
 * Standalone team page. Each member gets a full row that alternates sides
 * (photo left / photo right / photo left) so the page reads like a profile
 * story rather than a card grid.
 */
export default function TeamPage() {
  const { t } = useApp();

  return (
    <>
      <section className="team-hero">
        <div className="container team-hero__inner">
          <span className="eyebrow">{t('Our Team')}</span>
          <h1 className="h1">{t('Meet the People Behind GoldenGlow.')}</h1>
          <p className="sub">
            {t(
              'A small, hands-on team that reviews requirements, screens candidates and stays reachable after placement — the same people from your first enquiry to the first day on site.'
            )}
          </p>
        </div>
      </section>

      <section className="section team-page">
        <div className="container">
          {team.map((member, i) => {
            const role = t(member.role);
            const flip = i % 2 === 1;
            return (
              <Reveal
                key={member.name}
                className={`team-row${flip ? ' team-row--flip' : ''}`}
                delay={60}
              >
                <figure className="team-row__photo">
                  <img
                    src={member.photo}
                    alt={`${member.name}, ${role}`}
                    width="560"
                    height="700"
                    loading={i === 0 ? 'eager' : 'lazy'}
                    decoding="async"
                  />
                </figure>

                <div className="team-row__body">
                  <span className="team-row__index" aria-hidden="true">
                    {String(i + 1).padStart(2, '0')}
                  </span>
                  <h2 className="h2">{member.name}</h2>
                  <span className="team-row__role">{role}</span>
                  <p className="sub">{t(member.bio)}</p>
                  <span className="badge-pill">
                    <Icon name="users" size={14} />
                    {t(member.focus)}
                  </span>
                </div>
              </Reveal>
            );
          })}

          <Reveal className="team-cta">
            <div>
              <h2 className="h3">{t('Want to speak to the team directly?')}</h2>
              <p className="sub" style={{ marginBottom: 0 }}>
                {t('Send us your workforce requirement or your CV and the relevant person will reply.')}
              </p>
            </div>
            <div className="team-cta__actions">
              <Link className="btn btn--primary" to="/#contact">
                {t('Contact Us')}
                <Icon name="arrow-right" size={16} />
              </Link>
              <Link className="btn btn--ghost" to="/jobs">
                {t('Browse All Jobs')}
              </Link>
            </div>
          </Reveal>
        </div>
      </section>
    </>
  );
}
