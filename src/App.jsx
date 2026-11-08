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

function ScrollManager() {
  const { pathname, hash } = useLocation();

  useEffect(() => {
    if (hash) {
      const id = hash.replace('#', '');
      const attempt = (tries) => {
        const el = document.getElementById(id);
        if (el) {
          const top = el.getBoundingClientRect().top + window.scrollY - 96;
          window.scrollTo({ top, behavior: 'smooth' });
        } else if (tries > 0) {
          setTimeout(() => attempt(tries - 1), 80);
        }
      };
      attempt(6);
    } else {
      window.scrollTo({ top: 0, behavior: 'auto' });
    }
  }, [pathname, hash]);

  return null;
}

const routeMeta = {
  '/': [
    'GoldenGlow | Workforce Recruitment & Manpower Services in Saudi Arabia',
    'GoldenGlow connects Saudi employers with reliable skilled workers across construction, technical services, hospitality, logistics and more. Search jobs or request workforce.',
  ],
  '/jobs': [
    'Jobs in Saudi Arabia | GoldenGlow Workforce',
    'Browse vacancies across Riyadh, Jeddah, Dammam, Makkah, Madinah and NEOM. Filter by industry, city, experience and employment type.',
  ],
  '/team': [
    'Our Team | GoldenGlow Workforce',
    'Meet the people behind GoldenGlow: leadership, operations and employer communication, with direct contact details.',
  ],
  '/licences': [
    'Licences & Registrations | GoldenGlow',
    'Foreign employment licence, company registration, PAN certificate and labour approvals held by GoldenGlow group companies.',
  ],
  '/login': ['Sign In | GoldenGlow Workforce', 'Sign in to your GoldenGlow employer or worker dashboard.'],
  '/signup': ['Create an Account | GoldenGlow Workforce', 'Join GoldenGlow as an employer hiring workers or as a worker looking for opportunities in Saudi Arabia.'],
  '/dashboard': ['Dashboard | GoldenGlow Workforce', 'Manage job listings, applications and candidate profiles.'],
  '/admin': ['Admin | GoldenGlow', 'Private GoldenGlow admin panel.'],
  '/legal/privacy': [
    'Privacy Policy | GoldenGlow',
    'How GoldenGlow collects, uses and protects the information you share through this website.',
  ],
  '/legal/terms': [
    'Terms and Conditions | GoldenGlow',
    'The terms that govern use of the GoldenGlow website and our workforce services.',
  ],
  '/legal/cookies': [
    'Cookie Policy | GoldenGlow',
    'What this website stores in your browser, and how to control it.',
  ],
};

function MetaManager() {
  const { pathname } = useLocation();
  useEffect(() => {
    const key = routeMeta[pathname]
      ? pathname
      : pathname.startsWith('/dashboard')
        ? '/dashboard'
        : pathname.startsWith('/legal')
          ? null
          : '/';
    const entry = key ? routeMeta[key] : null;
    if (entry) {
      document.title = entry[0];
      document.querySelector('meta[name="description"]')?.setAttribute('content', entry[1]);
    }
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
