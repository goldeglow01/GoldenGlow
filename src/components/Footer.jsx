import { useState } from 'react';
import { Link } from 'react-router-dom';
import Logo from './Logo';
import Icon from './Icon';
import { useApp } from '../context/AppContext';
import { site, isPlaceholder } from '../data/site';
import { industries, industryName } from '../data/industries';

export default function Footer() {
  const { t, lang, setLang } = useApp();
  const year = new Date().getFullYear();

  const socials = [
    { key: 'facebook', label: 'Facebook', icon: 'facebook' },
    { key: 'x', label: 'X', icon: 'twitter' },
    { key: 'instagram', label: 'Instagram', icon: 'instagram' },
    { key: 'linkedin', label: 'LinkedIn', icon: 'linkedin' },
    { key: 'tiktok', label: 'TikTok', icon: 'tiktok' },
    { key: 'telegram', label: 'Telegram', icon: 'telegram' },
    { key: 'github', label: 'GitHub', icon: 'github' },
    { key: 'youtube', label: 'YouTube', icon: 'youtube' },
    { key: 'pinterest', label: 'Pinterest', icon: 'pinterest' },
    { key: 'viber', label: 'Viber', icon: 'viber' },
  ].filter((social) => site.social[social.key]);

  return (
    <footer className="footer">
      <div className="container">
        <div className="footer__grid">
          <div>
            <Logo variant="dark" size={44} />
            <p style={{ marginTop: 16 }}>
              {t(
                'GoldenGlow connects employers in Saudi Arabia with suitable talent across construction, technical services, hospitality, logistics and more.'
              )}
            </p>
            <div className="footer__contact">
              <span className="footer__contact-row">
                <Icon name="mail" size={15} />
                <span className={isPlaceholder(site.contact.email) ? 'placeholder-value' : ''}>
                  {site.contact.email}
                </span>
              </span>
              <span className="footer__contact-row">
                <Icon name="phone" size={15} />
                <span className={isPlaceholder(site.contact.phone) ? 'placeholder-value' : ''}>
                  {site.contact.phone}
                </span>
              </span>
              <span className="footer__contact-row">
                <Icon name="pin" size={15} />
                <span className={isPlaceholder(site.contact.address) ? 'placeholder-value' : ''}>
                  {site.contact.address}
                </span>
              </span>
              <span className="footer__contact-row">
                <Icon name="clock" size={15} />
                <span className={isPlaceholder(site.contact.hours) ? 'placeholder-value' : ''}>
                  {t(site.contact.hours)}
                </span>
              </span>
            </div>

            {socials.length > 0 ? (
              <div className="footer__social">
                {socials.map((social) => (
                  <a
                    key={social.key}
                    className="footer__social-item"
                    href={site.social[social.key]}
                    target="_blank"
                    rel="noreferrer noopener"
                    aria-label={social.label}
                  >
                    <Icon name={social.icon} size={16} />
                    <span className="footer__social-label">{social.label}</span>
                  </a>
                ))}
              </div>
            ) : (
              <p style={{ fontSize: 11, color: '#7a6e78', marginTop: 14 }}>
                {t('Social media links will appear here once official accounts are added.')}
              </p>
            )}
          </div>

          <div>
            <h4>{t('Quick Links')}</h4>
            <ul>
              <li>
                <Link to="/">{t('Home')}</Link>
              </li>
              <li>
                <Link to="/#about">{t('About')}</Link>
              </li>
              <li>
                <Link to="/jobs">{t('Jobs')}</Link>
              </li>
              <li>
                <Link to="/#industries">{t('Industries')}</Link>
              </li>
              <li>
                <Link to="/#countries">{t('Countries')}</Link>
              </li>
              <li>
                <Link to="/team">{t('Team')}</Link>
              </li>
              <li>
                <Link to="/licences">{t('Licences')}</Link>
              </li>
              <li>
                <Link to="/#contact">{t('Contact')}</Link>
              </li>
            </ul>
          </div>

          <div>
            <h4>{t('Industries')}</h4>
            <ul>
              {industries.slice(0, 7).map((industry) => (
                <li key={industry.slug}>
                  <Link to={`/jobs?industry=${industry.slug}`}>{t(industryName(industry))}</Link>
                </li>
              ))}
              <li>
                <Link to="/#industries">{t('View all')} →</Link>
              </li>
            </ul>
          </div>

          <div>
            <h4>{t('Employer Resources')}</h4>
            <ul>
              <li>
                <Link to="/dashboard/employer?tab=post">{t('Post a Job')}</Link>
              </li>
              <li>
                <Link to="/#employers">{t('Employer Services')}</Link>
              </li>
              <li>
                <Link to="/#how-it-works">{t('How It Works')}</Link>
              </li>
              <li>
                <Link to="/#contact">{t('Submit Your Manpower Requirement')}</Link>
              </li>
            </ul>
            <h4 style={{ marginTop: 22 }}>{t('Worker Resources')}</h4>
            <ul>
              <li>
                <Link to="/jobs">{t('Browse All Jobs')}</Link>
              </li>
              <li>
                <Link to="/signup?role=worker">{t('Register as a Worker')}</Link>
              </li>
              <li>
                <Link to="/dashboard/worker">{t('Worker Dashboard')}</Link>
              </li>
            </ul>
          </div>

          <div>
            <h4>{t('Job Categories')}</h4>
            <ul>
              {industries.slice(7, 12).map((industry) => (
                <li key={industry.slug}>
                  <Link to={`/jobs?industry=${industry.slug}`}>{t(industryName(industry))}</Link>
                </li>
              ))}
            </ul>

            {site.newsletter.enabled && site.newsletter.endpoint ? (
              <NewsletterForm />
            ) : (
              <div className="newsletter-note">{t('Newsletter signup is disabled until an email service is connected.')}</div>
            )}

            <button
              type="button"
              className="footer__lang"
              style={{ marginTop: 16 }}
              onClick={() => setLang(lang === 'en' ? 'ar' : 'en')}
            >
              <Icon name="globe" size={14} />
              {lang === 'en' ? 'العربية' : 'English'}
            </button>
          </div>
        </div>

        <div className="footer__bottom">
          <span>
            © {year} {site.name}. {t('All rights reserved.')}
          </span>
          <div className="footer__legal">
            <Link to="/licences">{t('Licences')}</Link>
            <Link to="/legal/privacy">{t('Privacy Policy')}</Link>
            <Link to="/legal/terms">{t('Terms and Conditions')}</Link>
            <Link to="/legal/cookies">{t('Cookie Policy')}</Link>
          </div>
        </div>

        <p className="footer__disclaimer">
          {t(
            'Workforce recruitment for Saudi Arabia. Recruitment services are subject to licensing and labour law in each country where we operate.'
          )}{' '}
          {site.licence.verified ? site.licence.label : ''}
        </p>
      </div>
    </footer>
  );
}

function NewsletterForm() {
  const { t } = useApp();
  const [email, setEmail] = useState('');
  return (
    <form
      style={{ display: 'flex', gap: 8, marginTop: 16 }}
      onSubmit={async (e) => {
        e.preventDefault();
        await fetch(site.newsletter.endpoint, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email }),
        }).catch(() => {});
        setEmail('');
      }}
    >
      <input
        className="input"
        type="email"
        required
        placeholder="name@company.com"
        aria-label={t('Newsletter')}
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        style={{ background: 'rgba(255,255,255,.06)', borderColor: 'rgba(255,255,255,.16)', color: '#fff' }}
      />
      <button className="btn btn--gold btn--sm" type="submit">
        {t('Subscribe')}
      </button>
    </form>
  );
}
