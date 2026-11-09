import { useEffect } from 'react';
import { Link, Route, Routes, useLocation } from 'react-router-dom';
import Header from './components/Header';
import Footer from './components/Footer';
import Icon from './components/Icon';
import WhatsAppButton from './components/WhatsAppButton';
import ScrollUI from './components/ScrollUI';
import Home from './pages/Home';
import JobsPage from './pages/JobsPage';
import LicencesPage from './pages/LicencesPage';
import TeamPage from './pages/TeamPage';
import AdminPage from './pages/AdminPage';
import AuthPage from './pages/AuthPage';
import Dashboard from './pages/Dashboard';
import Legal from './pages/Legal';
import { useApp } from './context/AppContext';
import { site } from './data/site';

function ScrollManager() {
  const { pathname, hash } = useLocation();

  useEffect(() => {
    if (!hash) {
      window.scrollTo({ top: 0, behavior: 'auto' });
      return undefined;
    }

    const id = hash.replace('#', '');
    const timers = [];
    let cancelled = false;

    const attempt = (tries) => {
      if (cancelled) return;
      const el = document.getElementById(id);
      if (!el) {
        if (tries > 0) timers.push(setTimeout(() => attempt(tries - 1), 80));
        return;
      }

      // Keep the target clear of the sticky top bar + header stack.
      const top = () => el.getBoundingClientRect().top + window.scrollY - 132;
      window.scrollTo({ top: top(), behavior: 'smooth' });

      // Images and the deferred globe keep shifting the layout while the page
      // settles, so re-align once more after the first smooth scroll.
      [300, 800, 1500, 2500].forEach((delay) => {
        timers.push(
          setTimeout(() => {
            if (!cancelled) window.scrollTo({ top: top(), behavior: 'auto' });
          }, delay)
        );
      });
    };

    attempt(6);

    return () => {
      cancelled = true;
      timers.forEach(clearTimeout);
    };
  }, [pathname, hash]);

  return null;
}

const DEFAULT_DESCRIPTION =
  'GoldenGlow connects Saudi employers with reliable skilled and unskilled workers across construction, hospitality, logistics and more. Search jobs or request workforce.';

const routeMeta = {
  '/': {
    title: 'GoldenGlow | Workforce Recruitment & Manpower Services in Saudi Arabia',
    description: DEFAULT_DESCRIPTION,
  },
  '/jobs': {
    title: 'Jobs in Saudi Arabia | GoldenGlow Workforce',
    description:
      'Browse vacancies across Riyadh, Jeddah, Dammam, Makkah, Madinah and NEOM. Filter by industry, city, experience and employment type.',
  },
  '/team': {
    title: 'Our Team | GoldenGlow Workforce',
    description:
      'Meet the people behind GoldenGlow: leadership, operations and employer communication, with direct contact details.',
  },
  '/licences': {
    title: 'Licences & Registrations | GoldenGlow',
    description:
      'Foreign employment licence, company registration, PAN certificate and labour approvals held by GoldenGlow group companies.',
  },
  '/login': {
    title: 'Sign In | GoldenGlow Workforce',
    description: 'Sign in to your GoldenGlow employer or worker dashboard.',
    noindex: true,
  },
  '/signup': {
    title: 'Create an Account | GoldenGlow Workforce',
    description:
      'Join GoldenGlow as an employer hiring workers or as a worker looking for opportunities in Saudi Arabia.',
    noindex: true,
  },
  '/dashboard': {
    title: 'Dashboard | GoldenGlow Workforce',
    description: 'Manage job listings, applications and candidate profiles.',
    noindex: true,
  },
  '/admin': {
    title: 'Admin | GoldenGlow',
    description: 'Private GoldenGlow admin panel.',
    noindex: true,
  },
};

const legalMeta = {
  privacy: {
    title: 'Privacy Policy | GoldenGlow',
    description:
      'How GoldenGlow collects, uses and protects the information you share through this website.',
  },
  terms: {
    title: 'Terms and Conditions | GoldenGlow',
    description: 'The terms that govern use of the GoldenGlow website and our workforce services.',
  },
  cookies: {
    title: 'Cookie Policy | GoldenGlow',
    description: 'What this website stores in your browser, and how to control it.',
  },
};

const NOT_FOUND_META = {
  title: 'Page not found | GoldenGlow',
  description: DEFAULT_DESCRIPTION,
  noindex: true,
  // A missing URL should not canonicalise to itself; point at the home page.
  canonicalPath: '/',
};

/** Resolve the metadata for a pathname, normalising slashes and known prefixes. */
function resolveMeta(pathname) {
  const path = pathname !== '/' && pathname.endsWith('/') ? pathname.slice(0, -1) : pathname;
  if (routeMeta[path]) return { path, ...routeMeta[path] };
  if (path.startsWith('/dashboard')) return { path, ...routeMeta['/dashboard'] };
  if (path.startsWith('/legal/')) {
    const slug = path.slice('/legal/'.length);
    if (legalMeta[slug]) return { path, ...legalMeta[slug] };
  }
  return { path, ...NOT_FOUND_META };
}

function metaTag(attribute, key) {
  let tag = document.head.querySelector(`meta[${attribute}="${key}"]`);
  if (!tag) {
    tag = document.createElement('meta');
    tag.setAttribute(attribute, key);
    document.head.appendChild(tag);
  }
  return tag;
}

function canonicalLink() {
  let link = document.head.querySelector('link[rel="canonical"]');
  if (!link) {
    link = document.createElement('link');
    link.setAttribute('rel', 'canonical');
    document.head.appendChild(link);
  }
  return link;
}

function MetaManager() {
  const { pathname } = useLocation();
  useEffect(() => {
    const { path, title, description, noindex, canonicalPath } = resolveMeta(pathname);
    const canonical = `${site.url}${canonicalPath ?? (path === '/' ? '/' : path)}`;

    document.title = title;
    metaTag('name', 'description').content = description;
    metaTag('name', 'robots').content = noindex
      ? 'noindex, nofollow'
      : 'index, follow, max-image-preview:large';
    metaTag('property', 'og:title').content = title;
    metaTag('property', 'og:description').content = description;
    metaTag('property', 'og:url').content = canonical;
    metaTag('name', 'twitter:title').content = title;
    metaTag('name', 'twitter:description').content = description;
    canonicalLink().setAttribute('href', canonical);
  }, [pathname]);
  return null;
}

function Toast() {
  const { toast } = useApp();
  if (!toast) return null;
  return (
    <div className="toast" role="status" aria-live="polite">
      <Icon name="check" size={16} />
      {toast.message}
    </div>
  );
}

function NotFound() {
  const { t } = useApp();
  return (
    <div className="container" style={{ paddingBlock: 100, textAlign: 'center' }}>
      <h1 style={{ fontSize: 56, color: 'var(--blue)' }}>404</h1>
      <p style={{ color: 'var(--muted)', marginBottom: 20 }}>{t('This page could not be found.')}</p>
      <Link className="btn btn--primary" to="/">
        {t('Home')}
      </Link>
    </div>
  );
}

export default function App() {
  return (
    <>
      <ScrollManager />
      <MetaManager />
      <ScrollUI />
      <Header />
      <main>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/jobs" element={<JobsPage />} />
          <Route path="/licences" element={<LicencesPage />} />
          <Route path="/team" element={<TeamPage />} />
          <Route path="/login" element={<AuthPage />} />
          <Route path="/signup" element={<AuthPage />} />
          <Route path="/dashboard/:role" element={<Dashboard />} />
          <Route path="/admin" element={<AdminPage />} />
          <Route path="/legal/:slug" element={<Legal />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </main>
      <Footer />
      <WhatsAppButton />
      <Toast />
    </>
  );
}
