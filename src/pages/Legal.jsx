import { Link, Navigate, useParams } from 'react-router-dom';
import Icon from '../components/Icon';
import { useApp } from '../context/AppContext';
import { site } from '../data/site';

const UPDATED = '1 November 2026';

const pages = {
  privacy: {
    title: 'Privacy Policy',
    intro:
      'This policy explains what information GoldenGlow collects through this website, why we collect it, how it is stored and the choices you have. It applies to employers, contractors, workers and anyone else who contacts us or uses this site.',
    sections: [
      {
        h: 'Who we are',
        p: `GoldenGlow provides workforce recruitment and manpower services. Our office is at ${site.contact.address}, and we can be reached at ${site.contact.email} or on ${site.contact.phone} (phone and WhatsApp), ${site.contact.hours}.`,
      },
      {
        h: 'Information you give us',
        p: 'When you send an enquiry or register interest we collect the details you enter: your name, business email, phone number, company name, city, the type of enquiry, industry, the number of workers required and your message. Workers may also share a trade, experience, availability and — where document upload is enabled — a CV or certificates.',
      },
      {
        h: 'Information collected automatically',
        p: 'Like most websites, our hosting provider records technical information such as your IP address, browser type, the page requested and the time of the request. This is used to keep the site available and secure. We do not use advertising trackers.',
      },
      {
        h: 'How we use your information',
        p: 'We use it to reply to your enquiry, to prepare shortlists of suitable candidates for employers, to help workers find suitable vacancies, to keep records of our communication, and to meet legal, accounting and regulatory obligations.',
      },
      {
        h: 'Sharing with employers and partners',
        p: 'We share a worker’s profile with an employer only when it is relevant to a vacancy the worker has applied for or asked us about. We use service providers for hosting (Vercel), the database and private document storage (Supabase), email and map display; they process data on our instructions. We may disclose information where we are legally required to do so.',
      },
      {
        h: 'Recruitment fees',
        p: `We do not ask candidates to pay for an interview, a placement or a visa. If anyone claiming to represent GoldenGlow asks you for payment, please report it to ${site.contact.email} before sending any money.`,
      },
      {
        h: 'Storage, retention and security',
        p: 'Enquiries and applications are kept only as long as they are needed for the purpose they were collected for, or as required by law. We limit access to authorised staff and use access controls, but no website or email system can be guaranteed to be completely secure.',
      },
      {
        h: 'Your rights',
        p: 'You may ask us for a copy of the information we hold about you, ask us to correct it, ask us to delete it, or ask us to stop using it. Send your request to the email address below and we will respond within a reasonable period. You may also complain to the data protection authority in your country.',
      },
      {
        h: 'Children',
        p: 'This website is intended for adults. We do not knowingly collect information from anyone under 18, and we do not recruit workers below the minimum working age in the destination country.',
      },
      {
        h: 'Changes to this policy',
        p: 'We may update this policy when our services or the law change. The date at the top of the page shows when it was last revised.',
      },
      {
        h: 'Contact',
        p: `Questions about this policy or your information: ${site.contact.email} · ${site.contact.phone} · ${site.contact.address}.`,
      },
    ],
  },
  terms: {
    title: 'Terms and Conditions',
    intro:
      'These terms govern your use of the GoldenGlow website. By using the site you accept them. If you do not agree, please do not use the site.',
    sections: [
      {
        h: 'About the website',
        p: 'The site presents our workforce services and lets employers submit manpower requirements and workers submit applications. Content is provided for general information and may be updated at any time.',
      },
      {
        h: 'Who may use it',
        p: 'You must be at least 18 years old and able to enter into a binding agreement. If you use the site on behalf of a company, you confirm that you are authorised to do so.',
      },
      {
        h: 'No offer of employment',
        p: 'Submitting an enquiry or an application does not create an employment relationship and is not an offer of a job, a visa or a placement. Any employment is subject to the employer’s selection, medical and skill checks, and the immigration and labour rules that apply.',
      },
      {
        h: 'Employer responsibilities',
        p: 'Employers are responsible for the accuracy of the vacancies they describe, for complying with the labour and immigration law of the country where work is performed, for obtaining the permits they need, and for treating workers fairly and without charging them recruitment fees.',
      },
      {
        h: 'Worker responsibilities',
        p: 'Workers are responsible for providing true and complete information about their skills, experience, qualifications and health where relevant, for holding valid documents, and for complying with the law of the country where they work.',
      },
      {
        h: 'Licensing',
        p: 'Recruitment and labour supply are regulated activities. The registrations and licences published on our Licences page are held by the group companies named on each document and are valid for the periods printed on them. Services offered through this website depend on the permissions that apply in each country.',
      },
      {
        h: 'Sample content',
        p: 'Some vacancies, dashboard screens and figures on this site are demonstration content, clearly labelled as such. They are illustrative and are not verified vacancies, achievements, clients or partnerships.',
      },
      {
        h: 'Acceptable use',
        p: 'You must not submit false information, impersonate another person, attempt to access accounts or data you are not authorised to access, copy the site in bulk, introduce malicious code, or use the site for any unlawful purpose.',
      },
      {
        h: 'Intellectual property',
        p: 'The GoldenGlow name, logo, layout and text on this site belong to us or are used with permission. You may not reproduce them commercially without our written consent. Third-party names and marks remain the property of their owners.',
      },
      {
        h: 'Third-party content',
        p: 'The site embeds a Google Map and links to other websites. We do not control those services and are not responsible for their content, availability or privacy practices.',
      },
      {
        h: 'Limitation of liability',
        p: 'The site is provided “as is”. To the extent permitted by law, we are not liable for indirect or consequential loss, loss of profit or loss of opportunity arising from use of the site or reliance on its content. Nothing in these terms limits liability that cannot lawfully be limited.',
      },
      {
        h: 'Changes and governing law',
        p: `We may change these terms; the version published here applies. These terms are governed by the laws of the State of Qatar and disputes are subject to the courts of Doha. Questions: ${site.contact.email}.`,
      },
    ],
  },
  cookies: {
    title: 'Cookie Policy',
    intro:
      'This policy explains the small amount of information this website stores in your browser, and what is stored by the third-party services we embed.',
    sections: [
      {
        h: 'Strictly necessary storage',
        p: 'We keep your language choice (English or Arabic) so the site stays in the language you picked. These values are stored in your browser’s local storage and are never shared with anyone.',
      },
      {
        h: 'Account and job data',
        p: 'Account details, job applications, saved jobs, job alerts and enquiries are stored in our database and private document storage, provided by Supabase, so they are available on every device you sign in from. Access is restricted to you and authorised GoldenGlow staff. You can ask us to delete your data at any time.',
      },
      {
        h: 'Small preferences',
        p: 'We remember that you closed the WhatsApp message bubble for the rest of your visit, so it does not open again on every page.',
      },
      {
        h: 'Analytics and advertising',
        p: 'This website does not currently use analytics or advertising cookies or trackers. If we add them, this policy will be updated first and, where the law requires it, we will ask for your consent before they load.',
      },
      {
        h: 'Third-party embeds',
        p: 'The contact section embeds a Google Map. When that map loads, Google may set its own cookies and receive your IP address and general location. Those cookies are controlled by Google, not by us, and are covered by Google’s own privacy policy.',
      },
      {
        h: 'How to control storage',
        p: 'You can delete or block cookies and local storage in your browser settings. Blocking them does not stop you browsing the site, but saved language, demo account and saved-job features will not persist.',
      },
      {
        h: 'Contact',
        p: `If you have a question about this policy, email ${site.contact.email} or call ${site.contact.phone}.`,
      },
    ],
  },
};

export default function Legal() {
  const { slug } = useParams();
  const { t } = useApp();

  // Unknown legal slugs should not silently render the privacy policy under a
  // wrong URL; send visitors (and crawlers) to the canonical privacy page.
  if (!pages[slug]) return <Navigate to="/legal/privacy" replace />;
  const page = pages[slug];

  return (
    <div className="container">
      <article className="legal">
        <div className="breadcrumbs" style={{ color: '#9a8b95' }}>
          <Link to="/" style={{ color: '#6e626a' }}>
            {t('Home')}
          </Link>
          <Icon name="chevron-right" size={12} style={{ color: '#c9bcc3' }} />
          <span>{t(page.title)}</span>
        </div>
        <h1>{t(page.title)}</h1>
        <p className="legal__updated">{t('Last updated')}: {UPDATED}</p>
        <p style={{ marginBottom: 22 }}>{page.intro}</p>

        {page.sections.map((section) => (
          <div key={section.h}>
            <h2>{t(section.h)}</h2>
            <p>{section.p}</p>
          </div>
        ))}

        <div className="legal__note">
          <strong>{t('Registered office')}:</strong> {site.contact.address} · {site.contact.email} ·{' '}
          {site.contact.phone} · {t(site.contact.hours)}
        </div>

        <p style={{ marginTop: 24, display: 'flex', gap: 10, flexWrap: 'wrap' }}>
          <Link className="btn btn--primary btn--sm" to="/licences">
            <Icon name="shield-check" size={15} />
            {t('View Licences')}
          </Link>
          <Link className="btn btn--ghost btn--sm" to="/#contact">
            {t('Contact Us')}
            <Icon name="arrow-right" size={14} />
          </Link>
          <Link className="btn btn--ghost btn--sm" to="/legal/privacy">
            {t('Privacy Policy')}
          </Link>
          <Link className="btn btn--ghost btn--sm" to="/legal/terms">
            {t('Terms and Conditions')}
          </Link>
          <Link className="btn btn--ghost btn--sm" to="/legal/cookies">
            {t('Cookie Policy')}
          </Link>
        </p>
      </article>
    </div>
  );
}
