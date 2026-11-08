import { useEffect, useRef, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import Logo from './Logo';
import Icon from './Icon';
import { useApp } from '../context/AppContext';
import { site, nav, isPlaceholder } from '../data/site';
import { industries, industryName } from '../data/industries';

/** Social platforms shown in the top information bar. */
const socials = [
  { key: 'facebook', label: 'Facebook', icon: 'facebook' },
  { key: 'x', label: 'X (Twitter)', icon: 'twitter' },
  { key: 'instagram', label: 'Instagram', icon: 'instagram' },
  { key: 'tiktok', label: 'TikTok', icon: 'tiktok' },
  { key: 'linkedin', label: 'LinkedIn', icon: 'linkedin' },
  { key: 'youtube', label: 'YouTube', icon: 'youtube' },
];

export default function Header() {
  const { t, lang, setLang, user, signOut } = useApp();
  const { pathname } = useLocation();
  const navigate = useNavigate();

  const [stuck, setStuck] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [mobileOpen, setMobileOpen] = useState(false);
  const [openGroup, setOpenGroup] = useState('');
  const searchRef = useRef(null);
  const mobileNavRef = useRef(null);

  useEffect(() => {
    const onScroll = () => setStuck(window.scrollY > 10);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  // Close transient UI on navigation.
  useEffect(() => {
    setMobileOpen(false);
    setSearchOpen(false);
    setOpenGroup('');
  }, [pathname]);

  useEffect(() => {
    if (!mobileOpen) return undefined;
    const previous = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = previous;
    };
  }, [mobileOpen]);

  // Keyboard support for the mobile drawer: Escape closes it, Tab stays inside,
  // and focus returns to the menu button when it closes.
  useEffect(() => {
    if (!mobileOpen) return undefined;
    const previouslyFocused = document.activeElement;
    const focusables = () =>
      mobileNavRef.current?.querySelectorAll(
        'a[href], button:not([disabled]), input, select, textarea, [tabindex]:not([tabindex="-1"])'
      ) || [];
    const timer = setTimeout(() => focusables()[0]?.focus(), 30);
    const onKey = (event) => {
      if (event.key === 'Escape') {
        setMobileOpen(false);
        return;
      }
      if (event.key !== 'Tab') return;
      const items = focusables();
      if (!items.length) return;
      const first = items[0];
      const last = items[items.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('keydown', onKey);
      clearTimeout(timer);
      previouslyFocused?.focus?.();
    };
  }, [mobileOpen]);

  useEffect(() => {
    if (searchOpen) searchRef.current?.focus();
  }, [searchOpen]);

  const onSearch = (event) => {
    event.preventDefault();
    const value = query.trim();
    navigate(value ? `/jobs?q=${encodeURIComponent(value)}` : '/jobs');
    setSearchOpen(false);
    setQuery('');
  };

  const isActive = (item) => {
    if (item.to === pathname) return true;
    if (pathname === '/' && item.to === '/') return true;
    return false;
  };

  const childrenOf = (item) =>
    item.children === 'industries'
      ? industries.map((industry) => ({
          label: industryName(industry),
          to: `/jobs?industry=${industry.slug}`,
        }))
      : item.children || [];

  const toggleLang = () => setLang(lang === 'ar' ? 'en' : 'ar');

  return (
    <>
      <header className={`header ${stuck ? 'is-stuck' : ''}`}>
        {/* ---------- Top information bar ---------- */}
        <div className="topbar">
          <div className="container topbar__inner">
            <div className="topbar__contacts">
              <a
                className="topbar__item"
                href={isPlaceholder(site.contact.email) ? undefined : `mailto:${site.contact.email}`}
              >
                <Icon name="mail" size={14} />
                <span className={isPlaceholder(site.contact.email) ? 'placeholder-value' : ''}>
                  {site.contact.email}
                </span>
              </a>

              <a className="topbar__item" href={`tel:${site.contact.phoneHref}`}>
                <Icon name="phone" size={14} />
                <span>{site.contact.phone}</span>
              </a>

              <span className="topbar__item">
                <Icon name="pin" size={14} />
                <span>{site.contact.address}</span>
              </span>

              <span className="topbar__item">
                <Icon name="clock" size={14} />
                <span>{t(site.contact.hours)}</span>
              </span>
            </div>

            <div className="topbar__actions">
              <div className="topbar__socials" aria-label={t('Follow us')}>
                {socials.map((social) => {
                  const href = site.social[social.key];
                  return href ? (
                    <a
                      key={social.key}
                      className="topbar__social"
                      href={href}
                      target="_blank"
                      rel="noreferrer noopener"
                      aria-label={social.label}
                      title={social.label}
                    >
                      <Icon name={social.icon} size={13} />
                    </a>
                  ) : (
                    <span
                      key={social.key}
                      className="topbar__social is-pending"
                      aria-label={`${social.label} — ${t('link coming soon')}`}
                      title={`${social.label} — ${t('link coming soon')}`}
                    >
                      <Icon name={social.icon} size={13} />
                    </span>
                  );
                })}
              </div>

              <span className="topbar__divider" aria-hidden="true" />

              <button
                type="button"
                className="lang-switch"
                onClick={toggleLang}
                aria-label={lang === 'ar' ? 'Switch to English' : 'التبديل إلى العربية'}
              >
                <Icon name="globe" size={14} />
                {lang === 'ar' ? 'English' : 'العربية'}
              </button>

              <span className="topbar__divider" aria-hidden="true" />

              {user ? (
                <>
                  <Link className="topbar__link" to={`/dashboard/${user.role || 'worker'}`}>
                    <Icon name="briefcase" size={14} />
                    {t('Dashboard')}
                  </Link>
                  <span className="topbar__divider" aria-hidden="true" />
                  <button type="button" className="topbar__link" onClick={signOut}>
                    <Icon name="log-in" size={14} />
                    {t('Sign Out')}
                  </button>
                </>
              ) : (
                <>
                  <Link className="topbar__link" to="/login">
                    <Icon name="log-in" size={14} />
                    {t('Sign In')}
                  </Link>
                  <span className="topbar__divider" aria-hidden="true" />
                  <Link className="topbar__link" to="/signup">
                    <Icon name="user-plus" size={14} />
                    {t('Sign Up')}
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>

        {/* ---------- Main navigation ---------- */}
        <div className="container header__inner">
          <Link to="/" className="nav__brand" aria-label={`${site.name} home`}>
            <Logo size={46} />
          </Link>

          <nav className="nav" aria-label={t('Main navigation')}>
            <ul className="nav__list">
              {nav.map((item) => {
                const children = childrenOf(item);
                return (
                  <li
                    key={item.label}
                    className={`nav__item ${openGroup === item.label ? 'is-open' : ''}`}
                  >
                    {children.length ? (
                      <>
                        <Link
                          className={`nav__link ${isActive(item) ? 'is-active' : ''}`}
                          to={item.to}
                          aria-expanded={openGroup === item.label}
                          onFocus={() => setOpenGroup(item.label)}
                        >
                          {t(item.label)}
                          <Icon name="chevron-down" size={14} className="nav__chev" />
                        </Link>
                        <ul
                          className={`dropdown ${
                            item.children === 'industries' ? 'dropdown--wide' : ''
                          }`}
                        >
                          {children.map((child) => (
                            <li key={`${child.label}-${child.to}`}>
                              <Link to={child.to}>{t(child.label)}</Link>
                            </li>
                          ))}
                        </ul>
                      </>
                    ) : (
                      <Link className={`nav__link ${isActive(item) ? 'is-active' : ''}`} to={item.to}>
                        {t(item.label)}
                      </Link>
                    )}
                  </li>
                );
              })}
            </ul>
          </nav>

          <div className="header__actions">
            <button
              type="button"
              className={`icon-btn ${searchOpen ? 'is-active' : ''}`}
              aria-label={t('Search')}
              aria-expanded={searchOpen}
              onClick={() => setSearchOpen((open) => !open)}
            >
              <Icon name="search" size={19} />
            </button>

            <Link className="btn btn--primary btn--sm" to="/dashboard/employer?tab=post">
              <Icon name="plus" size={15} />
              {t('Post a Job')}
            </Link>

            <button
              type="button"
              className="icon-btn burger"
              aria-label={t('Open menu')}
              aria-expanded={mobileOpen}
              onClick={() => setMobileOpen(true)}
            >
              <Icon name="menu" size={21} />
            </button>
          </div>
        </div>

        {searchOpen && (
          <div className="header-search">
            <div className="container header-search__inner">
              <form onSubmit={onSearch} style={{ display: 'flex', gap: 10, width: '100%' }}>
                <input
                  ref={searchRef}
                  className="input"
                  type="search"
                  value={query}
                  onChange={(event) => setQuery(event.target.value)}
                  placeholder={t('Search jobs, trades or companies')}
                  aria-label={t('Search jobs')}
                />
                <button className="btn btn--primary" type="submit">
                  <Icon name="search" size={16} />
                  {t('Search')}
                </button>
                <button
                  type="button"
                  className="btn btn--ghost"
                  onClick={() => setSearchOpen(false)}
                  aria-label={t('Close search')}
                >
                  <Icon name="close" size={16} />
                </button>
              </form>
            </div>
          </div>
        )}
      </header>

      {/* ---------- Mobile drawer ---------- */}
      {mobileOpen && (
        <div
          className="mobile-nav"
          role="dialog"
          aria-modal="true"
          aria-label={t('Main navigation')}
        >
          <div className="mobile-nav__scrim" aria-hidden="true" onClick={() => setMobileOpen(false)} />
          <div className="mobile-nav__panel" ref={mobileNavRef}>
            <div className="mobile-nav__head">
              <Logo size={40} />
              <button
                type="button"
                className="icon-btn"
                aria-label={t('Close menu')}
                onClick={() => setMobileOpen(false)}
              >
                <Icon name="close" size={20} />
              </button>
            </div>

            <ul className="mobile-nav__list">
              {nav.map((item) => {
                const children = childrenOf(item);
                return (
                  <li key={item.label}>
                    {children.length ? (
                      <>
                        <button
                          type="button"
                          className="mobile-nav__link"
                          aria-expanded={openGroup === item.label}
                          onClick={() =>
                            setOpenGroup((group) => (group === item.label ? '' : item.label))
                          }
                        >
                          {t(item.label)}
                          <Icon
                            name="chevron-down"
                            size={16}
                            style={{
                              transform: openGroup === item.label ? 'rotate(180deg)' : 'none',
                              transition: 'transform .2s',
                            }}
                          />
                        </button>
                        {openGroup === item.label && (
                          <ul className="mobile-nav__sub">
                            {children.map((child) => (
                              <li key={`${child.label}-${child.to}`}>
                                <Link to={child.to}>{t(child.label)}</Link>
                              </li>
                            ))}
                          </ul>
                        )}
                      </>
                    ) : (
                      <Link className="mobile-nav__link" to={item.to}>
                        {t(item.label)}
                      </Link>
                    )}
                  </li>
                );
              })}
            </ul>

            <div className="mobile-nav__actions">
              <Link className="btn btn--primary btn--block" to="/dashboard/employer?tab=post">
                <Icon name="plus" size={15} />
                {t('Post a Job')}
              </Link>
              {user ? (
                <Link className="btn btn--ghost btn--block" to={`/dashboard/${user.role || 'worker'}`}>
                  {t('Dashboard')}
                </Link>
              ) : (
                <>
                  <Link className="btn btn--ghost btn--block" to="/login">
                    {t('Sign In')}
                  </Link>
                  <Link className="btn btn--ghost btn--block" to="/signup">
                    {t('Sign Up')}
                  </Link>
                </>
              )}
            </div>

            <div className="mobile-nav__meta">
              <a className="mobile-nav__contact" href={`tel:${site.contact.phoneHref}`}>
                <Icon name="phone" size={14} />
                <span>{site.contact.phone}</span>
              </a>
              <a className="mobile-nav__contact" href={`mailto:${site.contact.email}`}>
                <Icon name="mail" size={14} />
                <span>{site.contact.email}</span>
              </a>
              <span className="mobile-nav__contact">
                <Icon name="pin" size={14} />
                <span>{site.contact.address}</span>
              </span>
              <span className="mobile-nav__contact">
                <Icon name="clock" size={14} />
                <span>{t(site.contact.hours)}</span>
              </span>
            </div>

            <div className="topbar__socials" style={{ marginTop: 16 }}>
              {socials.map((social) =>
                site.social[social.key] ? (
                  <a
                    key={social.key}
                    className="topbar__social"
                    href={site.social[social.key]}
                    target="_blank"
                    rel="noreferrer noopener"
                    aria-label={social.label}
                  >
                    <Icon name={social.icon} size={13} />
                  </a>
                ) : null
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
