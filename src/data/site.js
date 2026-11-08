/** GoldenGlow — editable brand + contact configuration.
 *
 * Official details are intentionally left unconfigured. Any value wrapped in
 * square brackets renders as a visible placeholder and its link is disabled,
 * so the site never pretends to have contact details it does not have.
 */
export const site = {
  name: 'GoldenGlow',
  legalName: 'GoldenGlow Workforce Solutions',
  since: '2026',
  tagline: { en: 'Workforce & Manpower Solutions', ar: 'حلول القوى العاملة والتوظيف' },
  description: {
    en: 'GoldenGlow connects Saudi employers with dependable skilled and unskilled workers, and helps workers find real opportunities across the Kingdom.',
    ar: 'تربط جولدن جلو أصحاب العمل في السعودية بعمالة ماهرة وموثوقة، وتساعد الباحثين عن عمل على الوصول إلى فرص حقيقية في جميع أنحاء المملكة.',
  },
  contact: {
    email: 'info@goldenglowqr.com',
    phone: '+974 7772 7492',
    phoneHref: '+97477727492',
    whatsapp: '+974 7772 7492',
    whatsappHref: 'https://wa.me/97477727492',
    address: 'Ain Khaled, Doha, Qatar',
    hours: 'Open 24/7',
    // Key-less Google Maps embeds: the iframe shows the live map, the link opens
    // the same place in Google Maps for directions.
    mapEmbed:
      'https://www.google.com/maps/embed?pb=!1m3!2m1!1sAin+Khaled,+Doha,+Qatar!6i13!3m1!1sen!5m1!1sen',
    mapLink: 'https://www.google.com/maps/search/?api=1&query=Ain+Khaled%2C+Doha%2C+Qatar',
    country: 'Qatar',
  },
  // Toggle these on once the destination URLs exist. They render only when set.
  social: {
    tiktok: 'https://www.tiktok.com/@golden.glow.overs?_r=1&_t=ZS-9BAsrvBdRSy',
    telegram: '',
    github: '',
    linkedin: '',
    instagram: '',
    x: '',
    facebook: '',
    youtube: '',
  },
  newsletter: {
    enabled: false,
    endpoint: '',
  },
  // POST endpoint for contact enquiries. `/api/contact` is the Vercel function in
  // api/contact.js, which emails every enquiry to the inbox below over SMTP.
  // Point this at any other endpoint (Formspree, a CRM webhook…) if you move off
  // Vercel; leave it empty to only store enquiries in the admin panel.
  contactEndpoint: '/api/contact',
  // Documents are shown in full in the Licences section (see content.js).
  licence: {
    verified: true,
    label: 'Foreign employment licence 1265/081/082 — Swayambhu Overseas Pvt. Ltd., Nepal.',
  },
};

export const cities = [
  'Riyadh',
  'Jeddah',
  'Dammam',
  'Al Khobar',
  'Makkah',
  'Madinah',
  'NEOM',
  'Tabuk',
  'Abha',
];

export const employmentTypes = ['Full-time', 'Contract', 'Temporary', 'Part-time'];

export const experienceLevels = ['Entry level', '1–2 years', '3–5 years', '5+ years'];

/** True when a config value is still an unedited placeholder. */
export const isPlaceholder = (value) =>
  typeof value === 'string' && /\[.*\]/.test(value);

export const nav = [
  { label: 'Home', to: '/', hash: 'home' },
  { label: 'About', to: '/', hash: 'about' },
  {
    label: 'Jobs',
    to: '/jobs',
    children: [
      { label: 'Browse All Jobs', to: '/jobs' },
      { label: 'Construction Jobs', to: '/jobs?industry=construction-infrastructure' },
      { label: 'Technical & Maintenance', to: '/jobs?industry=electrical-technical' },
      { label: 'Hospitality Jobs', to: '/jobs?industry=hospitality-hotels' },
      { label: 'Logistics & Drivers', to: '/jobs?industry=logistics-warehousing' },
      { label: 'Post a Job', to: '/dashboard/employer?tab=post' },
    ],
  },
  {
    label: 'Industries',
    to: '/#industries',
    children: 'industries',
  },
  {
    label: 'Countries',
    to: '/#countries',
    children: [
      { label: 'Saudi Arabia', to: '/#countries' },
      { label: 'India', to: '/#countries' },
      { label: 'Pakistan', to: '/#countries' },
      { label: 'Bangladesh', to: '/#countries' },
      { label: 'Nepal', to: '/#countries' },
      { label: 'Philippines', to: '/#countries' },
      { label: 'Sri Lanka', to: '/#countries' },
      { label: 'Egypt', to: '/#countries' },
    ],
  },
  {
    label: 'Quick Links',
    to: '/#how-it-works',
    children: [
      { label: 'How It Works', to: '/#how-it-works' },
      { label: 'Employer Services', to: '/#employers' },
      { label: 'Why GoldenGlow', to: '/#why-us' },
      { label: 'Licences', to: '/licences' },
      { label: 'Workforce Gallery', to: '/#showcase' },
      { label: 'Contact Us', to: '/#contact' },
      { label: 'Privacy Policy', to: '/legal/privacy' },
    ],
  },
  { label: 'Team', to: '/team' },
  { label: 'Contact', to: '/#contact' },
];
