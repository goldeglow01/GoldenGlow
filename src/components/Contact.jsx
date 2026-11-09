import { useState } from 'react';
import Icon from './Icon';
import Reveal from './Reveal';
import { useApp } from '../context/AppContext';
import { site, cities, isPlaceholder } from '../data/site';
import { industries, industryName } from '../data/industries';

const empty = {
  name: '',
  email: '',
  phone: '',
  company: '',
  city: '',
  inquiry: '',
  industry: '',
  workers: '',
  message: '',
  // Honeypot — hidden from people, filled by bots; the endpoint drops it.
  website: '',
};

const emailPattern = /^[^\s@]+@[^\s@]+\.[a-z]{2,}$/i;
const phonePattern = /^[+]?[\d\s()-]{7,20}$/;

export default function Contact() {
  const { t, showToast } = useApp();
  const [form, setForm] = useState(empty);
  const [errors, setErrors] = useState({});
  const [state, setState] = useState('idle'); // idle | loading | done
  const [status, setStatus] = useState(null);

  const set = (key) => (e) => {
    setForm((prev) => ({ ...prev, [key]: e.target.value }));
    setErrors((prev) => ({ ...prev, [key]: undefined }));
  };

  const validate = () => {
    const next = {};
    if (!form.name.trim()) next.name = t('This field is required');
    if (!form.email.trim()) next.email = t('This field is required');
    else if (!emailPattern.test(form.email)) next.email = t('Enter a valid email address');
    if (!form.phone.trim()) next.phone = t('This field is required');
    else if (!phonePattern.test(form.phone)) next.phone = t('Enter a valid phone number');
    if (!form.inquiry) next.inquiry = t('Select an option');
    if (!form.message.trim()) next.message = t('This field is required');
    else if (form.message.trim().length < 20) next.message = t('Please enter at least 20 characters.');
    if (form.workers && !/^\d+$/.test(form.workers)) next.workers = t('Enter a whole number of workers');
    return next;
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    const found = validate();
    setErrors(found);
    if (Object.keys(found).length) {
      setStatus({ tone: 'error', text: t('Please fix the highlighted fields.') });
      return;
    }

    setState('loading');
    setStatus(null);

    if (!site.contactEndpoint) {
      setState('idle');
      setStatus({
        tone: 'error',
        text: `${t('Message could not be sent')}. ${t('Please email us directly at')} ${site.contact.email}.`,
      });
      return;
    }

    try {
      const response = await fetch(site.contactEndpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify(form),
      });

      let result = {};
      try {
        result = await response.json();
      } catch {
        result = {};
      }

      if (!response.ok) {
        const rateLimited = response.status === 429 || result.code === 'RATE_LIMITED';
        setStatus({
          tone: 'error',
          text: rateLimited
            ? t('Too many attempts. Wait a minute and try again.')
            : `${t('Message could not be sent')}. ${t('Please try again, or email us at')} ${site.contact.email}.`,
        });
        setState('idle');
        return;
      }

      const emailSent = Boolean(result.emailSent ?? result.email_sent);
      if (emailSent) {
        setStatus({
          tone: 'success',
          text: t('Message sent — our team will reply to your email shortly'),
        });
        showToast(t('Message sent'));
      } else if (result.emailFailed) {
        setStatus({
          tone: 'error',
          text: `${t('Enquiry saved, but the email could not be delivered')}. ${t(
            'Please email us directly at'
          )} ${site.contact.email}.`,
        });
      } else {
        setStatus({
          tone: 'info',
          text: `${t('Enquiry saved in the site inbox, but email delivery is not switched on yet')}. ${t(
            'Please email us directly at'
          )} ${site.contact.email}.`,
        });
        showToast(t('Enquiry saved to the GoldenGlow inbox'));
      }
      setForm(empty);
    } catch {
      setStatus({
        tone: 'error',
        text: `${t('Message could not be sent')}. ${t('Please retry, or email us at')} ${site.contact.email}.`,
      });
    } finally {
      setState('idle');
    }
  };

  const emailConfigured = !isPlaceholder(site.contact.email);
  const phoneConfigured = !isPlaceholder(site.contact.phone);
  const whatsappConfigured = !isPlaceholder(site.contact.whatsapp);

  return (
    <section className="section section--soft" id="contact">
      <div className="container">
        <div className="contact-grid">
          <Reveal>
            <span className="eyebrow">{t('Get in Touch')}</span>
            <h2 className="h2">{t("Let's Discuss Your Workforce Requirements.")}</h2>
            <p className="sub">
              {t(
                'Tell us about your project, the roles you need, or the job you are looking for. Our team is available 24/7.'
              )}
            </p>

            <div className="info-list">
              <div className="info-row">
                <span className="info-row__icon">
                  <Icon name="mail" size={18} />
                </span>
                <div>
                  <small>{t('Official email')}</small>
                  {emailConfigured ? (
                    <strong>
                      <a href={`mailto:${site.contact.email}`}>{site.contact.email}</a>
                    </strong>
                  ) : (
                    <strong className="placeholder-value">{site.contact.email}</strong>
                  )}
                </div>
              </div>

              <div className="info-row">
                <span className="info-row__icon">
                  <Icon name="phone" size={18} />
                </span>
                <div>
                  <small>{t('Phone number')}</small>
                  {phoneConfigured ? (
                    <strong>
                      <a href={`tel:${site.contact.phoneHref}`}>{site.contact.phone}</a>
                    </strong>
                  ) : (
                    <strong className="placeholder-value">{site.contact.phone}</strong>
                  )}
                </div>
              </div>

              <div className="info-row">
                <span className="info-row__icon">
                  <Icon name="pin" size={18} />
                </span>
                <div>
                  <small>{t('Office address')}</small>
                  <strong className={isPlaceholder(site.contact.address) ? 'placeholder-value' : ''}>
                    {site.contact.address}
                  </strong>
                </div>
              </div>

              <div className="info-row">
                <span className="info-row__icon">
                  <Icon name="clock" size={18} />
                </span>
                <div>
                  <small>{t('Business hours')}</small>
                  <strong className={isPlaceholder(site.contact.hours) ? 'placeholder-value' : ''}>
                    {t(site.contact.hours)}
                  </strong>
                </div>
              </div>

              <div className="info-row">
                <span className="info-row__icon" style={{ background: '#eafaf0', color: '#15803d' }}>
                  <Icon name="whatsapp" size={18} />
                </span>
                <div>
                  <small>{t('WhatsApp us')}</small>
                  {whatsappConfigured ? (
                    <strong>
                      <a href={`https://wa.me/${site.contact.whatsapp.replace(/\D/g, '')}`} target="_blank" rel="noreferrer noopener">
                        {site.contact.whatsapp}
                      </a>
                    </strong>
                  ) : (
                    <>
                      <strong className="placeholder-value">{site.contact.whatsapp}</strong>
                      <span style={{ display: 'block', fontSize: 11.5, color: '#a0929c' }}>
                        {t('WhatsApp number not configured yet')}
                      </span>
                    </>
                  )}
                </div>
              </div>
            </div>

            <figure className="map-card" dir="ltr">
              <div className="map-card__frame">
                <iframe
                  title={t('Map showing our office in Ain Khaled, Doha, Qatar')}
                  src={site.contact.mapEmbed}
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                  allowFullScreen
                />
              </div>
              <figcaption className="map-card__foot">
                <span>
                  <Icon name="pin" size={15} /> {site.contact.address}
                </span>
                <a href={site.contact.mapLink} target="_blank" rel="noreferrer noopener">
                  {t('Get directions')} <Icon name="arrow-up-right" size={14} />
                </a>
              </figcaption>
            </figure>
          </Reveal>

          <Reveal delay={120}>
            <form className="contact-form" onSubmit={onSubmit} noValidate>
              <h3 className="h3" style={{ marginBottom: 18 }}>
                {t('Send Us a Message')}
              </h3>

              <input
                type="text"
                name="website"
                className="sr-only"
                tabIndex={-1}
                autoComplete="off"
                value={form.website}
                onChange={set('website')}
                aria-hidden="true"
              />

              <div className="form-grid">
                <div className="field">
                  <label htmlFor="c-name">{t('Full name')} *</label>
                  <input
                    id="c-name"
                    className={`input ${errors.name ? 'has-error' : ''}`}
                    value={form.name}
                    onChange={set('name')}
                    autoComplete="name"
                    aria-invalid={!!errors.name}
                    aria-describedby={errors.name ? 'c-name-error' : undefined}
                  />
                  {errors.name && (
                    <span className="field-error" id="c-name-error">
                      {errors.name}
                    </span>
                  )}
                </div>

                <div className="field">
                  <label htmlFor="c-email">{t('Business email')} *</label>
                  <input
                    id="c-email"
                    type="email"
                    className={`input ${errors.email ? 'has-error' : ''}`}
                    value={form.email}
                    onChange={set('email')}
                    autoComplete="email"
                    placeholder="name@company.com"
                    aria-invalid={!!errors.email}
                    aria-describedby={errors.email ? 'c-email-error' : undefined}
                  />
                  {errors.email && (
                    <span className="field-error" id="c-email-error">
                      {errors.email}
                    </span>
                  )}
                </div>

                <div className="field">
                  <label htmlFor="c-phone">{t('Phone with country code')} *</label>
                  <input
                    id="c-phone"
                    className={`input ${errors.phone ? 'has-error' : ''}`}
                    value={form.phone}
                    onChange={set('phone')}
                    placeholder="+966 5X XXX XXXX"
                    autoComplete="tel"
                    aria-invalid={!!errors.phone}
                    aria-describedby={errors.phone ? 'c-phone-error' : undefined}
                  />
                  {errors.phone && (
                    <span className="field-error" id="c-phone-error">
                      {errors.phone}
                    </span>
                  )}
                </div>

                <div className="field">
                  <label htmlFor="c-company">{t('Company name')}</label>
                  <input
                    id="c-company"
                    className="input"
                    value={form.company}
                    onChange={set('company')}
                    autoComplete="organization"
                  />
                </div>

                <div className="field">
                  <label htmlFor="c-city">{t('City')}</label>
                  <select id="c-city" className="select" value={form.city} onChange={set('city')}>
                    <option value="">{t('Select City')}</option>
                    {cities.map((city) => (
                      <option key={city} value={city}>
                        {city}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="field">
                  <label htmlFor="c-inquiry">{t('Inquiry type')} *</label>
                  <select
                    id="c-inquiry"
                    className={`select ${errors.inquiry ? 'has-error' : ''}`}
                    value={form.inquiry}
                    onChange={set('inquiry')}
                    aria-invalid={!!errors.inquiry}
                    aria-describedby={errors.inquiry ? 'c-inquiry-error' : undefined}
                  >
                    <option value="">{t('Select an option')}</option>
                    <option value="Hire Workers">{t('Hire Workers')}</option>
                    <option value="Find a Job">{t('Find a Job')}</option>
                    <option value="Partnership">{t('Partnership')}</option>
                    <option value="General Inquiry">{t('General Inquiry')}</option>
                  </select>
                  {errors.inquiry && (
                    <span className="field-error" id="c-inquiry-error">
                      {errors.inquiry}
                    </span>
                  )}
                </div>

                <div className="field">
                  <label htmlFor="c-industry">{t('Job Industry')}</label>
                  <select id="c-industry" className="select" value={form.industry} onChange={set('industry')}>
                    <option value="">{t('Select Industry')}</option>
                    {industries.map((industry) => (
                      <option key={industry.slug} value={industry.name}>
                        {t(industryName(industry))}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="field">
                  <label htmlFor="c-workers">{t('Number of workers required')}</label>
                  <input
                    id="c-workers"
                    className={`input ${errors.workers ? 'has-error' : ''}`}
                    value={form.workers}
                    onChange={set('workers')}
                    inputMode="numeric"
                    placeholder="e.g. 12"
                    aria-invalid={!!errors.workers}
                    aria-describedby={errors.workers ? 'c-workers-error' : undefined}
                  />
                  {errors.workers && (
                    <span className="field-error" id="c-workers-error">
                      {errors.workers}
                    </span>
                  )}
                </div>

                <div className="field full">
                  <label htmlFor="c-message">{t('Message')} *</label>
                  <textarea
                    id="c-message"
                    className={`textarea ${errors.message ? 'has-error' : ''}`}
                    value={form.message}
                    onChange={set('message')}
                    placeholder={t('Describe the roles, site location and timeline.')}
                    aria-invalid={!!errors.message}
                    aria-describedby={errors.message ? 'c-message-error' : undefined}
                  />
                  {errors.message && (
                    <span className="field-error" id="c-message-error">
                      {errors.message}
                    </span>
                  )}
                </div>
              </div>

              <div style={{ display: 'flex', gap: 12, alignItems: 'center', flexWrap: 'wrap', marginTop: 18 }}>
                <button className="btn btn--primary btn--lg" type="submit" disabled={state === 'loading'}>
                  {state === 'loading' ? (
                    <>
                      <span className="spinner" aria-hidden="true" /> {t('Sending…')}
                    </>
                  ) : (
                    <>
                      <Icon name="send" size={17} /> {t('Send Message')}
                    </>
                  )}
                </button>
                <span style={{ fontSize: 11.5, color: '#9a8b95', maxWidth: 260 }}>
                  {t('Required')}: {t('Full name')}, {t('Business email')}, {t('Phone number')}, {t('Message')}
                </span>
              </div>

              {status && <div className={`form-status form-status--${status.tone}`}>{status.text}</div>}

              <p className="form-note">
                {t(
                  'Enquiries are delivered to our team by email. We reply to the address you provide, and we never share your details with third parties.'
                )}
              </p>
            </form>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
