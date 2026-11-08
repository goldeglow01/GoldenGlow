import { useState } from 'react';
import { Link } from 'react-router-dom';
import Icon from '../components/Icon';
import Modal from '../components/Modal';
import Reveal from '../components/Reveal';
import { useApp } from '../context/AppContext';
import { licences } from '../data/content';
import { site } from '../data/site';

/**
 * Standalone Licences page (/licences). Every licence button across the site
 * opens this page in the same tab; each document can then be opened full-size.
 */
export default function LicencesPage() {
  const { t } = useApp();
  const [active, setActive] = useState(null);

  return (
    <>
      <div className="page-head">
        <div className="container">
          <div className="breadcrumbs">
            <Link to="/">{t('Home')}</Link>
            <Icon name="chevron-right" size={12} />
            <span>{t('Licences')}</span>
          </div>
          <h1>{t('Our Licences and Registrations.')}</h1>
          <p>
            {t(
              'Official recruitment, tax and company registrations held by our group companies. Select any document to read it in full.'
            )}
          </p>
        </div>
      </div>

      <section className="section" style={{ paddingTop: 'clamp(32px, 4vw, 52px)' }}>
        <div className="container">
          <div className="licence-grid licence-grid--page">
            {licences.map((licence, i) => (
              <Reveal className="licence-card licence-card--page" key={licence.id} delay={i * 60}>
                <button
                  type="button"
                  className="licence-card__thumb"
                  onClick={() => setActive(licence)}
                  aria-label={`${t('View')} ${t(licence.title)}`}
                >
                  <img
                    src={licence.image}
                    alt={`${t(licence.title)} — ${t(licence.issuer)}`}
                    loading={i < 2 ? 'eager' : 'lazy'}
                    decoding="async"
                    width="1000"
                    height="1024"
                  />
                  <span className="licence-card__zoom">
                    <Icon name="search" size={16} />
                    {t('View')}
                  </span>
                </button>
                <div className="licence-card__body">
                  <h3>{t(licence.title)}</h3>
                  <span className="licence-card__issuer">{t(licence.issuer)}</span>
                  <p>{t(licence.meta)}</p>
                  <div className="licence-card__actions">
                    <button type="button" className="link-arrow" onClick={() => setActive(licence)}>
                      {t('View document')} <Icon name="arrow-right" size={14} />
                    </button>
                    <a href={licence.image} target="_blank" rel="noreferrer noopener">
                      {t('Open full size')} <Icon name="arrow-up-right" size={13} />
                    </a>
                  </div>
                </div>
              </Reveal>
            ))}
          </div>

          <p className="licences__note">
            <Icon name="shield-check" size={14} />
            {t(
              'Documents are published with personal identity numbers redacted. Ask us for the original copies when verifying a contract.'
            )}
          </p>

          <div className="licences__cta">
            <div>
              <h2>{t('Need to verify our registrations?')}</h2>
              <p>
                {t(
                  'Send us the document you need and the contract it relates to, and our team will confirm the registration details directly.'
                )}
              </p>
            </div>
            <div className="licences__cta-actions">
              <a className="btn btn--primary" href={`mailto:${site.contact.email}`}>
                <Icon name="mail" size={16} />
                {site.contact.email}
              </a>
              <a
                className="btn btn--ghost"
                href={site.contact.whatsappHref}
                target="_blank"
                rel="noreferrer noopener"
              >
                <Icon name="whatsapp" size={16} />
                {t('WhatsApp us')}
              </a>
            </div>
          </div>
        </div>
      </section>

      <Modal
        open={!!active}
        onClose={() => setActive(null)}
        title={active ? t(active.title) : ''}
        subtitle={active ? `${t(active.issuer)} — ${t(active.meta)}` : ''}
      >
        {active && (
          <>
            <img className="licence-modal__image" src={active.image} alt={t(active.title)} />
            <a
              className="btn btn--ghost btn--sm"
              href={active.image}
              target="_blank"
              rel="noreferrer noopener"
              style={{ marginTop: 14 }}
            >
              {t('Open full size')} <Icon name="arrow-up-right" size={14} />
            </a>
          </>
        )}
      </Modal>
    </>
  );
}
