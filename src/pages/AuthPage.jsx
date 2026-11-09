import { useState } from 'react';
import { Link, useLocation, useNavigate, useSearchParams } from 'react-router-dom';
import Logo from '../components/Logo';
import Icon from '../components/Icon';
import { useApp } from '../context/AppContext';

const emailPattern = /^[^\s@]+@[^\s@]+\.[a-z]{2,}$/i;

/**
 * Artwork for the left-hand panel. Employer and worker each get their own
 * photograph plus copy, so switching role changes the whole panel.
 */
const visuals = {
  employer: {
    image: '/images/about-team.jpg',
    alt: 'A workforce team reviewing a tablet together on site',
    kicker: 'For employers',
    title: 'Build your team with the right people.',
    text: 'Tell us the trades and headcount your project needs, and our team reviews your requirements against workers whose skills match the job.',
    points: [
      'Skilled trades across 20 industries',
      'Documented recruitment steps',
      'One contact from enquiry to shortlist',
    ],
  },
  worker: {
    image: '/images/hero-construction.jpg',
    alt: 'A construction worker in a safety helmet and reflective vest',
    kicker: 'For workers',
    title: 'Find work that fits your skills.',
    text: 'Create a profile with your trade and experience, apply to vacancies in Saudi Arabia, and follow the status of every application you send.',
    points: [
      'Apply to roles across Saudi Arabia',
      'Keep your CV and certificates together',
      'Track each application in one place',
    ],
  },
};

const errorCopy = {
  'not-configured': 'Accounts are not configured yet. Add the Supabase project URL and anon key.',
  'invalid-credentials': 'That email and password do not match an account.',
  'email-taken': 'An account with this email already exists. Sign in instead.',
  'email-unconfirmed': 'Confirm your email address first — check your inbox for the link.',
  'weak-password': 'Choose a stronger password (at least 8 characters).',
  'too-many': 'Too many attempts. Wait a minute and try again.',
  network: 'We could not reach the sign-in service. Check your connection and try again.',
  'auth-failed': 'Something went wrong. Please try again.',
};

export default function AuthPage() {
  const { t, signIn, signUp, showToast, authConfigured } = useApp();
  const location = useLocation();
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const isSignup = location.pathname === '/signup';

  const [role, setRole] = useState(params.get('role') === 'worker' ? 'worker' : 'employer');
  const [form, setForm] = useState({
    name: '',
    email: '',
    company: '',
    password: '',
    confirm: '',
  });
  const [errors, setErrors] = useState({});
  const [formError, setFormError] = useState('');
  const [loading, setLoading] = useState(false);
  const [pendingEmail, setPendingEmail] = useState('');
  const visual = visuals[role];
  const requestedNext = params.get('next');
  const nextUrl =
    requestedNext && requestedNext.startsWith('/') && !requestedNext.startsWith('//')
      ? requestedNext
      : null;

  const set = (key) => (e) => {
    setForm((prev) => ({ ...prev, [key]: e.target.value }));
    setErrors((prev) => ({ ...prev, [key]: undefined }));
  };

  const submit = async (e) => {
    e.preventDefault();
    setFormError('');
    const next = {};
    if (isSignup && !form.name.trim()) next.name = t('Enter your name.');
    if (!form.email.trim()) next.email = t('This field is required');
    else if (!emailPattern.test(form.email)) next.email = t('Enter a valid email address');
    if (!form.password) next.password = t('This field is required');
    else if (form.password.length < 8) next.password = t('Password must be at least 8 characters.');
    if (isSignup && form.password !== form.confirm) next.confirm = t('Passwords do not match.');

    setErrors(next);
    if (Object.keys(next).length) return;

    setLoading(true);
    try {
      if (isSignup) {
        const result = await signUp({
          email: form.email.trim(),
          password: form.password,
          name: form.name.trim(),
          role,
          company: form.company.trim(),
        });
        if (result.error) {
          setFormError(t(errorCopy[result.error] || result.error));
          return;
        }
        if (result.needsConfirmation) {
          setPendingEmail(result.email || form.email.trim());
          return;
        }
        showToast(t('Account created. Welcome to GoldenGlow.'));
        navigate(nextUrl || `/dashboard/${result.user?.role || role}`);
      } else {
        const result = await signIn({ email: form.email.trim(), password: form.password, role });
        if (result.error) {
          setFormError(t(errorCopy[result.error] || result.error));
          return;
        }
        showToast(t('Welcome back'));
        navigate(nextUrl || `/dashboard/${result.user?.role || role}`);
      }
    } catch {
      setFormError(t(errorCopy.network));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <aside className="auth-visual">
        {Object.entries(visuals).map(([key, value]) => (
          <img
            key={key}
            className={`auth-visual__img ${key === role ? 'is-active' : ''}`}
            src={value.image}
            alt={key === role ? value.alt : ''}
            aria-hidden={key === role ? undefined : 'true'}
            loading="eager"
            decoding="async"
            width="1080"
            height="1620"
          />
        ))}
        <div className="auth-visual__scrim" aria-hidden="true" />
        <div className="auth-visual__content">
          <span className="auth-visual__kicker">{t(visual.kicker)}</span>
          <h2>{t(visual.title)}</h2>
          <p>{t(visual.text)}</p>
          <ul className="auth-visual__points">
            {visual.points.map((point) => (
              <li key={point}>
                <Icon name="check" size={15} />
                <span>{t(point)}</span>
              </li>
            ))}
          </ul>
        </div>
      </aside>

      <div className="auth-panel">
        <div className="auth-card">
          <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 18 }}>
            <Logo size={46} />
          </div>
          <h1>{isSignup ? t('Create your account') : t('Welcome back')}</h1>
          <p>{isSignup ? t('Join GoldenGlow as an employer or worker') : t('Sign in to your GoldenGlow account')}</p>

          {!authConfigured && (
            <div className="demo-note">
              <Icon name="shield" size={15} style={{ flex: 'none', marginTop: 1 }} />
              <span>
                {t('Accounts are not configured yet. Add the Supabase project URL and anon key to enable sign-in.')}
              </span>
            </div>
          )}

          {pendingEmail ? (
            <div className="auth-pending" role="status">
              <span className="auth-pending__icon">
                <Icon name="mail" size={22} />
              </span>
              <h2>{t('Check your inbox')}</h2>
              <p>
                {t('We sent a confirmation link to')} <strong>{pendingEmail}</strong>.{' '}
                {t('Open it to activate your account, then sign in.')}
              </p>
              <button
                type="button"
                className="btn btn--primary btn--block"
                onClick={() => {
                  setPendingEmail('');
                  navigate(`/login?role=${role}`);
                }}
              >
                {t('Go to sign in')}
              </button>
            </div>
          ) : (
            <>
          <div className="role-toggle" role="group" aria-label={t('Account type')}>
            <button
              type="button"
              className={`role-option ${role === 'employer' ? 'is-active' : ''}`}
              aria-pressed={role === 'employer'}
              onClick={() => setRole('employer')}
            >
              <Icon name="briefcase" size={18} />
              <span>
                <strong>{t('Employer')}</strong>
                <small>{t('Hire Workers')}</small>
              </span>
            </button>
            <button
              type="button"
              className={`role-option ${role === 'worker' ? 'is-active' : ''}`}
              aria-pressed={role === 'worker'}
              onClick={() => setRole('worker')}
            >
              <Icon name="users" size={18} />
              <span>
                <strong>{t('Worker')}</strong>
                <small>{t('Find a Job')}</small>
              </span>
            </button>
          </div>

          <form onSubmit={submit} noValidate style={{ display: 'grid', gap: 14 }}>
            {isSignup && (
              <div className="field">
                <label htmlFor="auth-name">{t('Full name')} *</label>
                <input id="auth-name" className={`input ${errors.name ? 'has-error' : ''}`} value={form.name} onChange={set('name')} autoComplete="name" />
                {errors.name && <span className="field-error">{errors.name}</span>}
              </div>
            )}

            <div className="field">
              <label htmlFor="auth-email">{t('Email')} *</label>
              <input
                id="auth-email"
                type="email"
                className={`input ${errors.email ? 'has-error' : ''}`}
                value={form.email}
                onChange={set('email')}
                autoComplete="email"
                placeholder="name@company.com"
              />
              {errors.email && <span className="field-error">{errors.email}</span>}
            </div>

            {isSignup && role === 'employer' && (
              <div className="field">
                <label htmlFor="auth-company">{t('Company name')}</label>
                <input id="auth-company" className="input" value={form.company} onChange={set('company')} autoComplete="organization" />
              </div>
            )}

            {isSignup && role === 'worker' && (
              <div className="field">
                <label htmlFor="auth-trade">{t('Trade or job title')}</label>
                <input id="auth-trade" className="input" value={form.company} onChange={set('company')} placeholder="e.g. Electrician" />
              </div>
            )}

            <div className="field">
              <label htmlFor="auth-password">{t('Password')} *</label>
              <input
                id="auth-password"
                type="password"
                className={`input ${errors.password ? 'has-error' : ''}`}
                value={form.password}
                onChange={set('password')}
                autoComplete={isSignup ? 'new-password' : 'current-password'}
                placeholder="••••••••"
              />
              {errors.password && <span className="field-error">{errors.password}</span>}
            </div>

            {isSignup && (
              <div className="field">
                <label htmlFor="auth-confirm">{t('Confirm password')} *</label>
                <input
                  id="auth-confirm"
                  type="password"
                  className={`input ${errors.confirm ? 'has-error' : ''}`}
                  value={form.confirm}
                  onChange={set('confirm')}
                  autoComplete="new-password"
                />
                {errors.confirm && <span className="field-error">{errors.confirm}</span>}
              </div>
            )}

            {formError && (
              <div className="auth-error" role="alert">
                <Icon name="shield" size={15} style={{ flex: 'none', marginTop: 1 }} />
                <span>{formError}</span>
              </div>
            )}

            <button className="btn btn--primary btn--block btn--lg" type="submit" disabled={loading}>
              {loading ? t('Please wait…') : isSignup ? t('Sign Up') : t('Sign In')}
            </button>
          </form>

          <div className="auth-footer">
            {isSignup ? (
              <>
                {t('Already have an account?')}{' '}
                <Link to={`/login?role=${role}`}>{t('Sign In')}</Link>
              </>
            ) : (
              <>
                {t("Don't have an account?")}{' '}
                <Link to={`/signup?role=${role}`}>{t('Sign Up')}</Link>
              </>
            )}
          </div>

          <p style={{ fontSize: 11, color: '#a0929c', textAlign: 'center', marginTop: 14, lineHeight: 1.6 }}>
            {t('By continuing you agree to our')}{' '}
            <Link to="/legal/terms" style={{ color: 'var(--blue)' }}>{t('Terms and Conditions')}</Link>{' '}
            {t('and')}{' '}
            <Link to="/legal/privacy" style={{ color: 'var(--blue)' }}>{t('Privacy Policy')}</Link>.
          </p>

          <div className="auth-footer" style={{ marginTop: 6 }}>
            <Link to="/#contact">{t('Need help signing in? Contact us')}</Link>
          </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
