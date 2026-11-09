import { useEffect, useState } from 'react';
import Icon from './Icon';
import { useApp } from '../context/AppContext';
import { site, isPlaceholder } from '../data/site';

const DISMISS_KEY = 'gg_wa_dismissed';

/**
 * Floating WhatsApp launcher plus a small chat popup that appears a few seconds
 * after the page settles (once per session — dismissing it is remembered).
 * Renders nothing until a WhatsApp number is configured.
 */
export default function WhatsAppButton() {
  const { t } = useApp();
  const [popupOpen, setPopupOpen] = useState(false);

  useEffect(() => {
    if (isPlaceholder(site.contact.whatsapp)) return undefined;
    if (typeof window === 'undefined') return undefined;
    if (window.sessionStorage.getItem(DISMISS_KEY) === '1') return undefined;

    // Wait until the visitor has scrolled past the hero, so the popup never
    // lands on top of the hero card or the slider controls.
    let ready = false;
    let opened = false;
    const maybeOpen = () => {
      if (ready && !opened && window.scrollY > 420) {
        opened = true;
        setPopupOpen(true);
        window.removeEventListener('scroll', maybeOpen);
      }
    };
    const timer = setTimeout(() => {
      ready = true;
      maybeOpen();
    }, 3000);
    window.addEventListener('scroll', maybeOpen, { passive: true });
    return () => {
      clearTimeout(timer);
      window.removeEventListener('scroll', maybeOpen);
    };
  }, []);

  const href = site.contact.whatsappHref || `https://wa.me/${site.contact.whatsapp.replace(/\D/g, '')}`;

  const dismiss = () => {
    setPopupOpen(false);
    try {
      window.sessionStorage.setItem(DISMISS_KEY, '1');
    } catch {
      /* storage can be blocked — the popup just shows again next visit */
    }
  };

  // The nudge retires on its own so it never sits on top of the footer.
  useEffect(() => {
    if (!popupOpen) return undefined;
    const timer = setTimeout(() => setPopupOpen(false), 12000);
    return () => clearTimeout(timer);
  }, [popupOpen]);

  if (isPlaceholder(site.contact.whatsapp)) return null;

  return (
    <>
      {popupOpen && (
        <div className="wa-popup" role="dialog" aria-label={t('Chat with us on WhatsApp')}>
          <button type="button" className="wa-popup__close" aria-label={t('Close')} onClick={dismiss}>
            <Icon name="close" size={14} />
          </button>
          <span className="wa-popup__avatar">
            <Icon name="whatsapp" size={20} />
          </span>
          <div className="wa-popup__body">
            <strong>{site.name}</strong>
            <span className="wa-popup__status">{t('Open 24/7')}</span>
            <p>{t('Need workers or looking for a job? Message us on WhatsApp — we reply fast.')}</p>
            <a className="wa-popup__cta" href={href} target="_blank" rel="noreferrer noopener">
              {t('Start chat')} <Icon name="arrow-up-right" size={14} />
            </a>
          </div>
        </div>
      )}

      <a
        className="wa-fab"
        href={href}
        target="_blank"
        rel="noreferrer noopener"
        aria-label={`${t('Chat with us on WhatsApp')} — ${site.contact.whatsapp}`}
      >
        <span className="wa-fab__label" aria-hidden="true">
          <strong>{t('Chat with us on WhatsApp')}</strong>
          <small>{site.contact.whatsapp}</small>
        </span>
        <span className="wa-fab__icon">
          <Icon name="whatsapp" size={26} />
          <span className="wa-fab__pulse" aria-hidden="true" />
        </span>
      </a>
    </>
  );
}
