import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Icon from './Icon';
import { useApp } from '../context/AppContext';
import { slides } from '../data/content';
import { industries, industryName } from '../data/industries';
import { cities } from '../data/site';
import { jobs } from '../data/jobs';

const AUTOPLAY_MS = 4600;

/**
 * Full-bleed workforce slideshow.
 *
 * The photo crossfades behind a used-by-everyone overlay of workforce copy, the
 * slide's own headline and supporting line animate in on every change, and the
 * job search bar straddles the bottom edge of the photo.
 */
export default function Hero() {
  const { t, lang } = useApp();
  const navigate = useNavigate();
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const [hovered, setHovered] = useState(false);
  const [title, setTitle] = useState('');
  const [industry, setIndustry] = useState('');
  const [city, setCity] = useState('');

  const reduceMotion = useMemo(
    () =>
      typeof window !== 'undefined' &&
      window.matchMedia &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches,
    []
  );

  const go = useCallback((next) => {
    setIndex((prev) => (next + slides.length) % slides.length);
  }, []);

  // Warm the cache so a slide change never flashes an empty frame.
  useEffect(() => {
    slides.forEach((slide) => {
      const img = new Image();
      img.src = slide.image;
    });
  }, []);

  useEffect(() => {
    if (reduceMotion || paused || hovered) return undefined;
    const timer = setInterval(() => setIndex((i) => (i + 1) % slides.length), AUTOPLAY_MS);
    return () => clearInterval(timer);
  }, [reduceMotion, paused, hovered]);

  const onSearch = (event) => {
    event.preventDefault();
    const params = new URLSearchParams();
    if (title) params.set('q', title);
    if (industry) params.set('industry', industry);
    if (city) params.set('city', city);
    navigate(`/jobs${params.toString() ? `?${params}` : ''}`);
  };

  const titles = [...new Set(jobs.map((job) => job.title))].sort();
  const active = slides[index];

  return (
    <>
      <section
        className="hero-main"
        id="home"
        aria-roledescription="carousel"
        aria-label={t('Workforce Showcase')}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        onFocus={() => setHovered(true)}
        onBlur={() => setHovered(false)}
      >
        <div className="hero-main__slides" aria-hidden="true">
          {slides.map((slide, i) => (
            <div key={slide.id} className={`hero-main__bg ${i === index ? 'is-active' : ''}`}>
              <img
                src={slide.image}
                alt={slide.alt}
                width="1800"
                height="820"
                loading={i === 0 ? 'eager' : 'lazy'}
                fetchpriority={i === 0 ? 'high' : 'auto'}
                decoding="async"
              />
            </div>
          ))}
        </div>

        <div className="hero-main__scrim" aria-hidden="true" />

        <div className="container hero-main__inner">
          <div className="hero-main__copy" aria-live="polite">
            <p className="hero-main__kicker">{t(active.industry)}</p>

            <h1 key={`title-${active.id}`} className="hero-main__title hero-fade">
              {t(active.title)}
            </h1>

            <p key={`lead-${active.id}`} className="hero-main__lead hero-fade">
              {t(active.text)}
            </p>

            <div className="hero-main__cta">
              <Link className="btn btn--white btn--lg" to="/jobs">
                <Icon name="search" size={17} />
                {t('Find Jobs')}
              </Link>
              <Link className="btn btn--outline-light btn--lg" to="/dashboard/employer?tab=post">
                <Icon name="briefcase" size={17} />
                {t('Post a Job')}
              </Link>
            </div>

            <div className="hero-main__controls">
              <button
                type="button"
                className="hero-main__nav"
                aria-label={t('Previous slide')}
                onClick={() => go(index - 1)}
              >
                <Icon name="chevron-left" size={18} />
              </button>

              <button
                type="button"
                className="hero-main__nav"
                aria-label={paused ? t('Play slideshow') : t('Pause slideshow')}
                aria-pressed={paused}
                onClick={() => setPaused((value) => !value)}
              >
                <Icon name={paused ? 'play' : 'pause'} size={15} />
              </button>

              <button
                type="button"
                className="hero-main__nav"
                aria-label={t('Next slide')}
                onClick={() => go(index + 1)}
              >
                <Icon name="chevron-right" size={18} />
              </button>

              <div className="hero-main__dots" role="tablist" aria-label={t('Workforce Showcase')}>
                {slides.map((slide, i) => (
                  <button
                    key={slide.id}
                    type="button"
                    role="tab"
                    aria-selected={i === index}
                    aria-label={`${t('Slide')} ${i + 1}: ${t(slide.industry)}`}
                    className={`hero-main__dot ${i === index ? 'is-active' : ''}`}
                    onClick={() => go(i)}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      <div className="container hero-search">
        <form
          className="hero-search__card"
          onSubmit={onSearch}
          aria-label={lang === 'ar' ? 'البحث عن وظائف' : 'Find jobs'}
        >
          <div className="field">
            <label className="field__label" htmlFor="hero-title">
              {t('Job Title')}
            </label>
            <select
              id="hero-title"
              className="select"
              value={title}
              onChange={(event) => setTitle(event.target.value)}
            >
              <option value="">{t('Select Title')}</option>
              {titles.map((item) => (
                <option key={item} value={item}>
                  {t(item)}
                </option>
              ))}
            </select>
          </div>

          <div className="field">
            <label className="field__label" htmlFor="hero-industry">
              {t('Job Industry')}
            </label>
            <select
              id="hero-industry"
              className="select"
              value={industry}
              onChange={(event) => setIndustry(event.target.value)}
            >
              <option value="">{t('Select Industry')}</option>
              {industries.map((item) => (
                <option key={item.slug} value={item.slug}>
                  {t(industryName(item))}
                </option>
              ))}
            </select>
          </div>

          <div className="field">
            <label className="field__label" htmlFor="hero-city">
              {t('City in Qatar')}
            </label>
            <select
              id="hero-city"
              className="select"
              value={city}
              onChange={(event) => setCity(event.target.value)}
            >
              <option value="">{t('Select City')}</option>
              {cities.map((item) => (
                <option key={item} value={item}>
                  {t(item)}
                </option>
              ))}
            </select>
          </div>

          <button className="btn btn--primary" type="submit">
            <Icon name="search" size={17} />
            {t('Find Jobs')}
          </button>
        </form>
      </div>
    </>
  );
}
