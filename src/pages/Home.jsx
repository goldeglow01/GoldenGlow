import { Suspense, lazy } from 'react';
import { Link } from 'react-router-dom';
import Hero from '../components/Hero';
import Clients from '../components/Clients';
import Stats from '../components/Stats';
import WhyTop from '../components/WhyTop';
import Industries from '../components/Industries';
import About from '../components/About';
import Services from '../components/Services';
import JobsBrowser from '../components/JobsBrowser';
import HowItWorks from '../components/HowItWorks';
import Countries from '../components/Countries';
import WhyChoose from '../components/WhyChoose';
import Showcase from '../components/Showcase';
import Contact from '../components/Contact';
import Reveal from '../components/Reveal';
import Icon from '../components/Icon';
import { useApp } from '../context/AppContext';

// Three.js is only needed for the globe, so it is loaded on demand.
const GlobeSection = lazy(() => import('../components/GlobeSection'));

export default function Home() {
  const { t } = useApp();

  return (
    <>
      <Hero />
      <Clients />
      <Stats />
      <WhyTop />
      <Industries />
      <About />
      <Services />

      <section className="section" id="jobs">
        <div className="container">
          <Reveal
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'flex-end',
              gap: 20,
              flexWrap: 'wrap',
              marginBottom: 26,
            }}
          >
            <div className="section-head" style={{ marginBottom: 0 }}>
              <span className="eyebrow">{t('Find Your Career')}</span>
              <h2 className="h2">{t('Explore Opportunities Across Saudi Arabia.')}</h2>
              <p className="sub">
                {t('Filter by role, city, experience and employment type in seconds.')}
              </p>
            </div>
            <Link className="btn btn--primary" to="/jobs">
              {t('Browse All Jobs')}
              <Icon name="arrow-right" size={16} />
            </Link>
          </Reveal>

          <JobsBrowser limit={4} />
        </div>
      </section>

      <HowItWorks />
      <Countries />
      <WhyChoose />
      <Showcase />
      <Suspense
        fallback={
          <div className="section globe-section" aria-hidden="true">
            <div className="container globe-grid">
              <div className="globe-canvas-wrap">
                <div className="globe-fallback" />
              </div>
              <div />
            </div>
          </div>
        }
      >
        <GlobeSection />
      </Suspense>
      <Contact />
    </>
  );
}
