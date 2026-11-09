/**
 * SAMPLE VACANCIES — demonstration content only.
 *
 * These are fictional listings used to show how the job search, filters,
 * detail modal and application flow work. They are not verified vacancies and
 * every card is labelled as a sample. Replace this array with real postings
 * from your backend/CRM before launch.
 */
export const jobs = [
  {
    id: 'GG-1001',
    title: 'Plumber',
    company: 'Demo Facilities Co.',
    city: 'Riyadh',
    industry: 'plumbing-pipe-fitting',
    type: 'Full-time',
    experience: '3–5 years',
    salary: { min: 1800, max: 2600 },
    posted: '2026-10-24',
    description:
      'Maintain and repair water supply, drainage and sanitary systems across commercial buildings in Riyadh.',
    requirements: [
      'Experience with PVC, PPR and copper pipe systems',
      'Ability to read basic plumbing drawings',
      'Trade certificate preferred',
    ],
  },
  {
    id: 'GG-1002',
    title: 'Electrician',
    company: 'Demo Contracting Group',
    city: 'Jeddah',
    industry: 'electrical-technical',
    type: 'Full-time',
    experience: '3–5 years',
    salary: { min: 2000, max: 3000 },
    posted: '2026-10-23',
    description:
      'Install, test and maintain electrical wiring, lighting and distribution boards on active projects.',
    requirements: [
      'Knowledge of low-voltage installation and safety practice',
      'Experience with cable trays and conduit work',
      'Vocational training certificate',
    ],
  },
  {
    id: 'GG-1003',
    title: 'Construction Helper',
    company: 'Demo Build Contractors',
    city: 'NEOM',
    industry: 'construction-infrastructure',
    type: 'Contract',
    experience: 'Entry level',
    salary: null,
    posted: '2026-10-22',
    description:
      'Support site trades with material handling, mixing, cleaning and general construction assistance.',
    requirements: [
      'Physically fit and comfortable on active sites',
      'Basic understanding of site safety',
      'Willingness to work shifts',
    ],
  },
  {
    id: 'GG-1004',
    title: 'HVAC Technician',
    company: 'Demo Climate Services',
    city: 'Dammam',
    industry: 'hvac-air-conditioning',
    type: 'Full-time',
    experience: '3–5 years',
    salary: { min: 2200, max: 3200 },
    posted: '2026-10-21',
    description:
      'Service split units, package units and chillers; diagnose faults and complete preventive maintenance.',
    requirements: [
      'Experience with refrigerant handling and brazing',
      'Ability to troubleshoot electrical and mechanical faults',
      'Valid trade certification',
    ],
  },
  {
    id: 'GG-1005',
    title: 'Welder',
    company: 'Demo Industrial Works',
    city: 'Al Khobar',
    industry: 'welding-fabrication',
    type: 'Contract',
    experience: '5+ years',
    salary: { min: 2500, max: 3800 },
    posted: '2026-10-20',
    description:
      'Perform MIG/TIG and structural welding on fabrication projects to approved drawings and standards.',
    requirements: [
      'Certified in 6G or equivalent position welding',
      'Ability to read fabrication drawings',
      'Strong awareness of hot-work safety',
    ],
  },
  {
    id: 'GG-1006',
    title: 'Heavy Vehicle Driver',
    company: 'Demo Logistics Transport',
    city: 'Jeddah',
    industry: 'transportation-drivers',
    type: 'Full-time',
    experience: '1–2 years',
    salary: { min: 1800, max: 2400 },
    posted: '2026-10-19',
    description:
      'Operate heavy trucks for regional deliveries, complete inspections and maintain delivery records.',
    requirements: [
      'Valid heavy vehicle licence (Saudi licence preferred)',
      'Clean driving record',
      'Basic route documentation skills',
    ],
  },
  {
    id: 'GG-1007',
    title: 'Cleaner',
    company: 'Demo Facility Management',
    city: 'Makkah',
    industry: 'cleaning-facility-management',
    type: 'Full-time',
    experience: 'Entry level',
    salary: null,
    posted: '2026-10-18',
    description:
      'Provide daily cleaning and housekeeping support for hotel and commercial premises.',
    requirements: [
      'Attention to detail and reliability',
      'Basic knowledge of cleaning chemicals and equipment',
      'Good personal presentation',
    ],
  },
  {
    id: 'GG-1008',
    title: 'Warehouse Worker',
    company: 'Demo Distribution',
    city: 'Riyadh',
    industry: 'logistics-warehousing',
    type: 'Full-time',
    experience: '1–2 years',
    salary: { min: 1600, max: 2100 },
    posted: '2026-10-17',
    description:
      'Handle incoming stock, picking, packing and dispatch while maintaining accurate inventory records.',
    requirements: [
      'Experience in a warehouse or distribution environment',
      'Basic numeracy and record-keeping',
      'Forklift licence is a plus',
    ],
  },
  {
    id: 'GG-1009',
    title: 'Mechanical Technician',
    company: 'Demo Plant Services',
    city: 'Dammam',
    industry: 'mechanical-maintenance',
    type: 'Contract',
    experience: '3–5 years',
    salary: { min: 2400, max: 3400 },
    posted: '2026-10-16',
    description:
      'Carry out preventive maintenance, alignment and repair work on pumps, motors and production equipment.',
    requirements: [
      'Mechanical maintenance experience in an industrial plant',
      'Ability to use measuring and alignment tools',
      'Diploma or trade certificate preferred',
    ],
  },
  {
    id: 'GG-1010',
    title: 'Mason',
    company: 'Demo Build Contractors',
    city: 'Madinah',
    industry: 'carpentry-masonry',
    type: 'Contract',
    experience: '3–5 years',
    salary: { min: 2000, max: 2800 },
    posted: '2026-10-15',
    description:
      'Lay blocks, bricks and stonework for residential and commercial builds to site specifications.',
    requirements: [
      'Experience with block and brick masonry',
      'Ability to work to levels and drawings',
      'Own basic hand tools',
    ],
  },
];

export const industryLabel = (slug, list) => list.find((i) => i.slug === slug)?.name ?? slug;

export const formatSalary = (salary, lang = 'en') => {
  if (!salary) return null;
  const fmt = (n) =>
    new Intl.NumberFormat(lang === 'ar' ? 'ar-SA' : 'en-SA', { maximumFractionDigits: 0 }).format(n);
  return lang === 'ar'
    ? `${fmt(salary.min)} – ${fmt(salary.max)} ريال / شهر`
    : `SAR ${fmt(salary.min)} – ${fmt(salary.max)} / month`;
};

export const formatDate = (iso, lang = 'en') => {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return '';
  return new Intl.DateTimeFormat(lang === 'ar' ? 'ar-SA' : 'en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  }).format(date);
};
