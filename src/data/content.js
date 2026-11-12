/** GoldenGlow homepage content. Editable via this file. */

export const slides = [
  {
    id: 'construction',
    image: '/images/hero/construction.jpg',
    alt: 'Construction worker in a yellow safety helmet and orange reflective vest',
    industry: { en: 'Construction & Infrastructure', ar: 'البناء والبنية التحتية' },
    title: { en: 'Building Qatar, One Skilled Worker at a Time.', ar: 'نبني قطر بعامل ماهر في كل خطوة.' },
    text: {
      en: 'Site-ready crews for contractors and developers, from helpers to finishing teams.',
      ar: 'فرق جاهزة للمواقع تعمل مع المقاولين والمطورين، من العمال إلى فرق التشطيب.',
    },
    position: 'center',
  },
  {
    id: 'plumbing',
    image: '/images/hero/plumbing.jpg',
    alt: 'Plumber in a blue uniform repairing pipework with a wrench',
    industry: { en: 'Plumbing & Pipe Fitting', ar: 'السباكة وتمديد الأنابيب' },
    title: { en: 'Reliable Plumbers for Every Project.', ar: 'سباكون موثوقون لكل مشروع.' },
    text: {
      en: 'Water supply, drainage and pipe-fitting specialists who get it right the first time.',
      ar: 'متخصصون في التغذية والصرف وتمديد الأنابيب ينفذون العمل بشكل صحيح من المرة الأولى.',
    },
    position: 'center',
  },
  {
    id: 'electrical',
    image: '/images/hero/electrical.jpg',
    alt: 'Electrician in a blue helmet working on an electrical control panel',
    industry: { en: 'Electrical & Technical Work', ar: 'الأعمال الكهربائية والفنية' },
    title: { en: 'Professional Electricians. Dependable Results.', ar: 'كهربائيون محترفون ونتائج يعتمد عليها.' },
    text: {
      en: 'Wiring, panels and maintenance handled by qualified technical staff.',
      ar: 'التمديدات ولوحات الكهرباء والصيانة بأيدي فنيين مؤهلين.',
    },
    position: 'center',
  },
  {
    id: 'technician',
    image: '/images/hero/technician.jpg',
    alt: 'Industrial technician adjusting a machine in a factory workshop',
    industry: { en: 'Industrial & Mechanical', ar: 'الصناعة والميكانيكا' },
    title: { en: 'Skilled Technicians for Industrial Excellence.', ar: 'فنيون ماهرون لتميز الصناعة.' },
    text: {
      en: 'Mechanical and industrial technicians who keep production moving.',
      ar: 'فنيون ميكانيكيون وصناعيون يحافظون على استمرارية الإنتاج.',
    },
    position: 'center',
  },
  {
    id: 'facility',
    image: '/images/hero/facility.jpg',
    alt: 'Facility maintenance professional cleaning a glass facade in a modern building',
    industry: { en: 'Cleaning & Facility Management', ar: 'النظافة وإدارة المرافق' },
    title: { en: 'Trusted Maintenance Teams for Your Business.', ar: 'فرق صيانة موثوقة لأعمالك.' },
    text: {
      en: 'Cleaning, housekeeping and facility support that keeps every premises presentable.',
      ar: 'فرق نظافة وضيافة ودعم مرافق تحافظ على جاهزية كل مبنى.',
    },
    position: 'center',
  },
];

/** Client logos shown in the sliding band under the hero. */
export const clients = [
  { name: 'Avisha Spa & Beauty Salon', logo: '/images/clients/avisha.png' },
  { name: 'SPA 180 Institute', logo: '/images/clients/spa18.png' },
  { name: 'Micro Technology Co.', logo: '/images/clients/micro.png' },
  { name: 'Altayba Al-Motahida General Trading & Cont.', logo: '/images/clients/altayba.png' },
  { name: 'ALCAT Contracting', logo: '/images/clients/alcat.png' },
  { name: 'Linc Facility Services W.L.L.', logo: '/images/clients/linc.png' },
  { name: 'SuperChoice Services', logo: '/images/clients/superchoice.png' },
  { name: 'Al Fajr Hospitality', logo: '/images/clients/alfajr.png' },
  { name: 'Al Hitmi Trading & Cont. Est.', logo: '/images/clients/alhitmi.png' },
  { name: 'Advanced Recruitment Services', logo: '/images/clients/ads.png' },
  { name: "Al-Ma'mar Trading & Contracting", logo: '/images/clients/mace.png' },
];

export const stats = [
  { value: 20, suffix: '+', label: { en: 'Industries covered', ar: 'قطاعًا مشمولًا' } },
  { value: 9, suffix: '', label: { en: 'Qatar cities covered', ar: 'مدينة قطرية مشمولة' } },
  { value: 50, suffix: '+', label: { en: 'Skilled workforce', ar: 'قوى عاملة ماهرة' } },
  { value: 2, suffix: '+', label: { en: 'Years of experience', ar: 'سنوات من الخبرة' } },
];

export const employerServices = [
  {
    icon: 'users',
    title: { en: 'Skilled Manpower Sourcing', ar: 'توفير العمالة الماهرة' },
    text: { en: 'Trade-specific candidate shortlists built around your project scope.', ar: 'قوائم مرشحين حسب التخصص مبنية على نطاق مشروعك.' },
  },
  {
    icon: 'hardhat',
    title: { en: 'Construction Workforce', ar: 'قوى عاملة للبناء' },
    text: { en: 'Helpers, trades and supervisors for sites of every size.', ar: 'عمال وحرفيون ومشرفون لمواقع من كل الأحجام.' },
  },
  {
    icon: 'wrench',
    title: { en: 'Technical & Maintenance Staffing', ar: 'كوادر فنية وصيانة' },
    text: { en: 'Electrical, mechanical and HVAC technicians for ongoing operations.', ar: 'فنيو كهرباء وميكانيكا وتكييف للعمليات المستمرة.' },
  },
  {
    icon: 'clock',
    title: { en: 'Temporary Staffing', ar: 'توظيف مؤقت' },
    text: { en: 'Short-term cover for peaks and shutdowns, where legally permitted.', ar: 'تغطية قصيرة الأجل لمواسم الذروة والتوقفات، حيث يسمح النظام.' },
  },
  {
    icon: 'factory',
    title: { en: 'Industrial Workforce Solutions', ar: 'حلول القوى العاملة الصناعية' },
    text: { en: 'Production, fabrication and plant support staff.', ar: 'كوادر إنتاج وتصنيع ودعم للمصانع.' },
  },
  {
    icon: 'hotel',
    title: { en: 'Hospitality Staffing', ar: 'توظيف قطاع الضيافة' },
    text: { en: 'Front office, housekeeping and food service teams.', ar: 'فرق الاستقبال والتدبير المنزلي وخدمة الطعام.' },
  },
  {
    icon: 'sparkles',
    title: { en: 'Facility Management Personnel', ar: 'كوادر إدارة المرافق' },
    text: { en: 'Cleaning, maintenance and support staff for managed buildings.', ar: 'فرق نظافة وصيانة ودعم للمباني المُدارة.' },
  },
  {
    icon: 'file',
    title: { en: 'Recruitment Support', ar: 'دعم التوظيف' },
    text: { en: 'Screening, documentation coordination and onboarding guidance.', ar: 'الفرز وتنسيق المستندات وإرشادات الالتحاق بالعمل.' },
  },
];

export const countries = [
  {
    code: 'qa',
    flag: '/flags/qa.png',
    name: 'Doha, Qatar',
    ar: 'الدوحة، قطر',
    note: { en: 'Head office & primary market', ar: 'المقر الرئيسي والسوق الرئيسي' },
  },
  {
    code: 'sa',
    name: 'Saudi Arabia',
    ar: 'السعودية',
    note: { en: 'Employer market', ar: 'سوق أصحاب العمل' },
  },
  { code: 'in', name: 'India', ar: 'الهند', note: { en: 'Talent sourcing', ar: 'استقطاب المواهب' } },
  { code: 'pk', name: 'Pakistan', ar: 'باكستان', note: { en: 'Talent sourcing', ar: 'استقطاب المواهب' } },
  { code: 'np', name: 'Nepal', ar: 'نيبال', note: { en: 'Talent sourcing', ar: 'استقطاب المواهب' } },
  { code: 'lk', name: 'Sri Lanka', ar: 'سريلانكا', note: { en: 'Talent sourcing', ar: 'استقطاب المواهب' } },
];

export const journeys = {
  employers: [
    {
      icon: 'file',
      title: { en: 'Submit Workforce Requirements', ar: 'أرسل احتياجات القوى العاملة' },
      text: { en: 'Tell us the roles, quantities, site city and timeline for your project.', ar: 'أخبرنا بالوظائف والأعداد ومدينة الموقع والجدول الزمني لمشروعك.' },
      detail: {
        en: 'Share the trades you need, how many of each, the city or project, the start date and any certificates or experience the site requires. A short list is enough — our team will ask for anything missing.',
        ar: 'أخبرنا بالتخصصات المطلوبة وأعدادها والمدينة أو المشروع وتاريخ البدء وأي شهادات أو خبرات يشترطها الموقع. قائمة مختصرة تكفي، وسيطلب فريقنا أي تفاصيل ناقصة.',
      },
      outcome: { en: 'A written requirement summary you can keep on file.', ar: 'ملخص مكتوب للاحتياجات يمكنك حفظه في ملفاتك.' },
    },
    {
      icon: 'search',
      title: { en: 'Review Suitable Candidates', ar: 'راجع المرشحين المناسبين' },
      text: { en: 'Shortlist by trade, verified experience and availability.', ar: 'اختر حسب التخصص والخبرة الموثقة والتوافر.' },
      detail: {
        en: 'We compare your requirement against workers by trade, years of experience, documents and availability. You see the shortlist and decide who moves forward — no name is put forward without your approval.',
        ar: 'نقارن احتياجاتك بالعمال حسب التخصص وسنوات الخبرة والمستندات والتوافر. تراجع القائمة المختصرة وتقرر من ينتقل للمرحلة التالية، ولا يُرشح أي شخص دون موافقتك.',
      },
      outcome: { en: 'A shortlist you can review, shortlist further or reject.', ar: 'قائمة مختصرة يمكنك مراجعتها أو تصفيتها أو رفضها.' },
    },
    {
      icon: 'shield',
      title: { en: 'Complete Verified Hiring', ar: 'أكمل التوظيف الموثق' },
      text: { en: 'Proceed with documentation, permits and onboarding checks.', ar: 'أكمل المستندات والتصاريح وإجراءات الالتحاق وفق المتطلبات النظامية.' },
      detail: {
        en: 'Once you select a candidate, we coordinate the paperwork the law requires for your project and the worker’s country of origin, then agree a start date. Each step is confirmed in writing.',
        ar: 'بعد اختيار المرشح، ننسق المستندات التي يفرضها النظام لمشروعك وبلد منشأ العامل، ثم نتفق على تاريخ البدء. تُثبت كل خطوة كتابيًا.',
      },
      outcome: { en: 'A documented, agreed start — subject to permits and applicable rules.', ar: 'بدء موثق ومتفق عليه، وفق التصاريح والأنظمة المعمول بها.' },
    },
  ],
  workers: [
    {
      icon: 'users',
      title: { en: 'Register Your Profile', ar: 'سجّل ملفك' },
      text: { en: 'Create a worker profile with your trade and location preferences.', ar: 'أنشئ ملفًا يتضمن تخصصك والمدن التي تفضلها.' },
      detail: {
        en: 'Create an account as a worker, choose your trade and the Qatar cities you would accept, and keep your contact number current so employers can reach you.',
        ar: 'أنشئ حسابًا كعامل، وحدد تخصصك والمدن القطرية التي تقبل العمل فيها، وحدّث رقم تواصلك ليتمكن أصحاب العمل من الوصول إليك.',
      },
      outcome: { en: 'A profile that appears when you apply.', ar: 'ملف يظهر عند تقديمك على الوظائف.' },
    },
    {
      icon: 'upload',
      title: { en: 'Submit Skills & Experience', ar: 'أضف مهاراتك وخبراتك' },
      text: { en: 'Add certificates, tools you can use and past project experience.', ar: 'أضف شهاداتك والأدوات التي تجيدها وخبراتك السابقة.' },
      detail: {
        en: 'Attach your CV, trade certificates and training records, and describe the sites and tools you have worked with. Clear documents shorten the process considerably.',
        ar: 'أرفق سيرتك الذاتية وشهادات التخصص وسجلات التدريب، واذكر المواقع والأدوات التي عملت بها. المستندات الواضحة تقصر الإجراءات بشكل ملحوظ.',
      },
      outcome: { en: 'A complete application package ready for employers.', ar: 'ملف تقديم كامل جاهز لأصحاب العمل.' },
    },
    {
      icon: 'briefcase',
      title: { en: 'Apply for Opportunities', ar: 'تقدم للفرص' },
      text: { en: 'Browse matched vacancies and track the status of every application.', ar: 'تصفح الوظائف المطابقة وتابع حالة كل طلب.' },
      detail: {
        en: 'Filter vacancies by trade, city and experience, apply with one click and follow each application in your dashboard — submitted, shortlisted or closed.',
        ar: 'صفِّ الوظائف حسب التخصص والمدينة والخبرة، وتقدم بنقرة واحدة، وتابع كل طلب في لوحتك: مُرسل أو مرشح أو مغلق.',
      },
      outcome: { en: 'A visible status for every job you apply to.', ar: 'حالة واضحة لكل وظيفة تتقدم لها.' },
    },
  ],
};

export const whyCards = [
  { icon: 'layers', title: { en: 'Industry-Wide Opportunities', ar: 'فرص في جميع القطاعات' }, text: { en: 'Twenty industry categories, from construction to hospitality and IT.', ar: 'عشرون قطاعًا، من البناء إلى الضيافة وتقنية المعلومات.' } },
  { icon: 'search', title: { en: 'Simple Job Discovery', ar: 'بحث سهل عن الوظائف' }, text: { en: 'Filter by role, city, experience and employment type in seconds.', ar: 'صفِّ النتائج حسب الوظيفة والمدينة والخبرة ونوع التوظيف في ثوانٍ.' } },
  { icon: 'target', title: { en: 'Skills-Based Matching', ar: 'مطابقة حسب المهارات' }, text: { en: 'Requirements are matched to trade skills and verified experience.', ar: 'تُطابق المتطلبات مع المهارات والخبرة الموثقة.' } },
  { icon: 'building', title: { en: 'Employer-Focused Support', ar: 'دعم يركز على صاحب العمل' }, text: { en: 'Practical shortlists and clear coordination for busy operations teams.', ar: 'قوائم مرشحين عملية وتنسيق واضح لفرق العمل المشغولة.' } },
  { icon: 'message', title: { en: 'Clear Communication', ar: 'تواصل واضح' }, text: { en: 'Every requirement, interview and status update stays visible.', ar: 'كل متطلب ومقابلة وتحديث حالة يبقى واضحًا.' } },
  { icon: 'shield', title: { en: 'Responsible Hiring', ar: 'توظيف مسؤول' }, text: { en: 'Processes designed around fair treatment and applicable regulations.', ar: 'إجراءات مبنية على المعاملة العادلة والأنظمة المعمول بها.' } },
];

export const showcase = [
  { image: '/images/show-construction.jpg', role: { en: 'Construction', ar: 'البناء' }, caption: { en: 'Site crews reviewing works on a live project.', ar: 'فرق الموقع تراجع الأعمال في مشروع قائم.' } },
  { image: '/images/show-welding.jpg', role: { en: 'Welding', ar: 'اللحام' }, caption: { en: 'Structural welding to approved drawings.', ar: 'لحام إنشائي وفق المخططات المعتمدة.' } },
  { image: '/images/show-electrical.jpg', role: { en: 'Electrical', ar: 'الكهرباء' }, caption: { en: 'Control panel inspection and maintenance.', ar: 'فحص وصيانة لوحة التحكم.' } },
  { image: '/images/show-industrial.jpg', role: { en: 'Industrial', ar: 'الصناعة' }, caption: { en: 'Machinery checks on a production floor.', ar: 'فحص الآلات في خط الإنتاج.' } },
  { image: '/images/show-plumbing.jpg', role: { en: 'Plumbing', ar: 'السباكة' }, caption: { en: 'Pressure fittings installed to standard.', ar: 'تركيب وصلات الضغط وفق المعايير.' } },
  { image: '/images/show-warehouse.jpg', role: { en: 'Warehousing', ar: 'المستودعات' }, caption: { en: 'Inventory handling and dispatch readiness.', ar: 'مناولة المخزون والجاهزية للشحن.' } },
  { image: '/images/show-logistics.jpg', role: { en: 'Logistics', ar: 'الخدمات اللوجستية' }, caption: { en: 'Forklift operators moving palletised stock.', ar: 'مشغلو رافعات شوكية ينقلون البضائع.' } },
  { image: '/images/show-cleaning.jpg', role: { en: 'Facility Services', ar: 'خدمات المرافق' }, caption: { en: 'Glass and facade cleaning for commercial towers.', ar: 'تنظيف الزجاج والواجهات للأبراج التجارية.' } },
  { image: '/images/show-hospitality.jpg', role: { en: 'Hospitality', ar: 'الضيافة' }, caption: { en: 'Front desk service in a hotel environment.', ar: 'خدمة الاستقبال في بيئة فندقية.' } },
  { image: '/images/show-engineering.jpg', role: { en: 'Engineering', ar: 'الهندسة' }, caption: { en: 'Technical diagnostics on plant equipment.', ar: 'تشخيص فني لمعدات المنشأة.' } },
  { image: '/images/show-carpentry.jpg', role: { en: 'Carpentry', ar: 'النجارة' }, caption: { en: 'Joinery and finishing work on site.', ar: 'أعمال النجارة والتشطيب في الموقع.' } },
  { image: '/images/show-transport.jpg', role: { en: 'Transport', ar: 'النقل' }, caption: { en: 'Heavy vehicle drivers on regional routes.', ar: 'سائقو مركبات ثقيلة على الطرق الإقليمية.' } },
];

/**
 * Leadership team. Names and designations as provided; the short introductions
 * describe each person's role in the business and contain no unverified claims.
 */
export const team = [
  {
    name: 'Nikum Singh',
    role: { en: 'Chief Executive Officer', ar: 'الرئيس التنفيذي' },
    photo: '/images/team-nikum.jpg',
    focus: { en: 'Strategy & employer partnerships', ar: 'الاستراتيجية وشراكات أصحاب العمل' },
    bio: {
      en: 'Nikum leads GoldenGlow and sets the direction of the business: which industries we serve, how requirements are reviewed and how quickly an employer hears back. He works directly with contractors and facility companies to understand the workforce they actually need, then makes sure the recruitment team has the brief, the budget and the timeline in writing before sourcing begins.',
      ar: 'يقود نيكوم شركة جولدن جلو ويحدد اتجاه العمل: القطاعات التي نخدمها، وكيفية مراجعة المتطلبات، وسرعة الرد على صاحب العمل. يعمل مباشرة مع شركات المقاولات وإدارة المرافق لفهم القوى العاملة التي يحتاجونها فعلاً، ثم يضمن أن يكون لدى فريق التوظيف المتطلبات والميزانية والجدول الزمني مكتوبة قبل بدء البحث.',
    },
  },
  {
    name: 'Md. Atiqur Rahman',
    role: { en: 'Managing Director', ar: 'المدير العام' },
    photo: '/images/team-atiqur.jpg',
    focus: { en: 'Operations & candidate screening', ar: 'العمليات وفرز المرشحين' },
    bio: {
      en: 'Atiqur runs the day-to-day operation — the part of the work that decides whether a placement holds up. He keeps screening consistent across trades, checks that experience and certificates match the role, and follows each shortlist through interview, offer and arrival so nothing stalls silently. When a worker or an employer has a question after joining, his team is the first point of contact.',
      ar: 'يدير عتيق العمليات اليومية، وهي الجزء الذي يحدد نجاح التوظيف. يحافظ على ثبات معايير الفرز بين المهن، ويتحقق من مطابقة الخبرة والشهادات للوظيفة، ويتابع كل قائمة مرشحين حتى المقابلة والعرض والوصول دون توقف. وعندما يكون لدى العامل أو صاحب العمل سؤال بعد المباشرة، يكون فريقه أول نقطة تواصل.',
    },
  },
];

/**
 * Official registrations and licences, shown in full in the Licences section.
 * Documents belong to the group companies that hold them, which is why each
 * card names the registered entity exactly as printed on the document.
 */
export const licences = [
  {
    id: 'foreign-employment-licence',
    title: { en: 'Foreign Employment Licence', ar: 'رخصة التوظيف الخارجي' },
    issuer: { en: 'Department of Foreign Employment, Government of Nepal', ar: 'إدارة التوظيف الخارجي، حكومة نيبال' },
    meta: { en: 'Swayambhu Overseas Pvt. Ltd. · Licence 1265/081/082 · valid 2023-04-13 to 2028-04-12', ar: 'سوامبهو أوفرسيز · رخصة 1265/081/082 · سارية من 2023-04-13 إلى 2028-04-12' },
    image: '/images/licences/foreign-employment-licence.jpg',
  },
  {
    id: 'company-registration',
    title: { en: 'Certificate of Incorporation', ar: 'شهادة تأسيس الشركة' },
    issuer: { en: 'Office of the Company Registrar, Nepal', ar: 'مكتب مسجل الشركات، نيبال' },
    meta: { en: 'Swayambhu Overseas Pvt. Ltd. · registration no. 320890/077/078', ar: 'سوامبهو أوفرسيز · رقم التسجيل 320890/077/078' },
    image: '/images/licences/company-registration.jpg',
  },
  {
    id: 'pan-certificate',
    title: { en: 'PAN Registration Certificate', ar: 'شهادة تسجيل الرقم الضريبي' },
    issuer: { en: 'Inland Revenue Department, Nepal', ar: 'إدارة الإيرادات الداخلية، نيبال' },
    meta: { en: 'Golden Glow Overseas Pvt. Ltd. · PAN 609906287', ar: 'جولدن جلو أوفرسيز · الرقم الضريبي 609906287' },
    image: '/images/licences/pan-certificate.jpg',
  },
  {
    id: 'labour-approval',
    title: { en: 'Labour Approval', ar: 'موافقة العمل' },
    issuer: { en: 'Ministry of Labour, Employment and Social Security, Nepal', ar: 'وزارة العمل والتوظيف والضمان الاجتماعي، نيبال' },
    meta: { en: 'Approved labour supply record for the licensed company', ar: 'سجل موافقات توريد العمالة للشركة المرخصة' },
    image: '/images/licences/labour-approval.jpg',
  },
  {
    id: 'ward-recommendation',
    title: { en: 'Ward Recommendation Letter', ar: 'خطاب توصية من البلدية' },
    issuer: { en: 'Ward Office, Kathmandu Metropolitan City', ar: 'مكتب الحي، بلدية كاتماندو الكبرى' },
    meta: { en: 'Golden Glow Overseas Pvt. Ltd. · local registration recommendation', ar: 'جولدن جلو أوفرسيز · توصية تسجيل محلية' },
    image: '/images/licences/ward-recommendation.jpg',
  },
];

export const globePhrases = [
  { en: 'Connecting Workers Across the World.', ar: 'نربط العمال حول العالم.' },
  { en: 'Bringing Global Talent to Doha.', ar: 'نجلب المواهب العالمية إلى الدوحة.' },
  { en: 'Supporting Every Industry With Skilled People.', ar: 'ندعم كل قطاع بأيدٍ ماهرة.' },
  { en: 'Creating Connections Between Employers and Workers.', ar: 'نصنع روابط بين أصحاب العمل والعمال.' },
  { en: 'Workforce Solutions for a Connected World.', ar: 'حلول قوى عاملة لعالم متصل.' },
  { en: 'From Local Projects to Global Opportunities.', ar: 'من المشاريع المحلية إلى الفرص العالمية.' },
];
