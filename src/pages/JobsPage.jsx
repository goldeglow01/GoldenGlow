import { Link } from 'react-router-dom';
import JobsBrowser from '../components/JobsBrowser';
import Icon from '../components/Icon';
import { useApp } from '../context/AppContext';

export default function JobsPage() {
  const { t } = useApp();

  return (
    <>
      <div className="page-head">
        <div className="container">
          <div className="breadcrumbs">
            <Link to="/">{t('Home')}</Link>
            <Icon name="chevron-right" size={12} />
            <span>{t('Jobs')}</span>
          </div>
          <h1>{t('Explore Opportunities Across Qatar.')}</h1>
          <p>
            {t(
              'Search current openings by trade, city, experience and employment type. Sample listings are shown until real vacancies are published.'
            )}
          </p>
        </div>
      </div>

      <section className="section" style={{ paddingTop: 'clamp(28px, 3vw, 44px)' }}>
        <div className="container">
          <h2 className="sr-only">{t('Job listings')}</h2>
          <JobsBrowser syncUrl limit={6} />
        </div>
      </section>
    </>
  );
}
