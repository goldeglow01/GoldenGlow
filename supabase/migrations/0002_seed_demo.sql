-- ============================================================================
-- Demo vacancies (clearly marked is_sample = true)
-- These mirror src/data/jobs.js and can be deleted from the admin panel once
-- real vacancies are published.
-- ============================================================================

insert into public.jobs
  (id, title, company, city, industry, type, experience,
   salary_min, salary_max, description, requirements,
   status, source, posted_at, is_sample)
values
  ('GG-1001', 'Plumber', 'Demo Facilities Co.', 'Doha', 'plumbing-pipe-fitting', 'Full-time', '3–5 years',
   1800, 2600,
   'Maintain and repair water supply, drainage and sanitary systems across commercial buildings in Doha.',
   array['Experience with PVC, PPR and copper pipe systems', 'Ability to read basic plumbing drawings', 'Trade certificate preferred'],
   'verified', 'admin', '2026-10-24T00:00:00Z', true),

  ('GG-1002', 'Electrician', 'Demo Contracting Group', 'Lusail', 'electrical-technical', 'Full-time', '3–5 years',
   2000, 3000,
   'Install, test and maintain electrical wiring, lighting and distribution boards on active projects.',
   array['Knowledge of low-voltage installation and safety practice', 'Experience with cable trays and conduit work', 'Vocational training certificate'],
   'verified', 'admin', '2026-10-23T00:00:00Z', true),

  ('GG-1003', 'Construction Helper', 'Demo Build Contractors', 'Mesaieed', 'construction-infrastructure', 'Contract', 'Entry level',
   null, null,
   'Support site trades with material handling, mixing, cleaning and general construction assistance.',
   array['Physically fit and comfortable on active sites', 'Basic understanding of site safety', 'Willingness to work shifts'],
   'verified', 'admin', '2026-10-22T00:00:00Z', true),

  ('GG-1004', 'HVAC Technician', 'Demo Climate Services', 'Al Rayyan', 'hvac-air-conditioning', 'Full-time', '3–5 years',
   2200, 3200,
   'Service split units, package units and chillers; diagnose faults and complete preventive maintenance.',
   array['Experience with refrigerant handling and brazing', 'Ability to troubleshoot electrical and mechanical faults', 'Valid trade certification'],
   'verified', 'admin', '2026-10-21T00:00:00Z', true),

  ('GG-1005', 'Welder', 'Demo Industrial Works', 'Mesaieed', 'welding-fabrication', 'Contract', '5+ years',
   2500, 3800,
   'Perform MIG/TIG and structural welding on fabrication projects to approved drawings and standards.',
   array['Certified in 6G or equivalent position welding', 'Ability to read fabrication drawings', 'Strong awareness of hot-work safety'],
   'verified', 'admin', '2026-10-20T00:00:00Z', true),

  ('GG-1006', 'Heavy Vehicle Driver', 'Demo Logistics Transport', 'Al Wakrah', 'transportation-drivers', 'Full-time', '1–2 years',
   1800, 2400,
   'Operate heavy trucks for regional deliveries, complete inspections and maintain delivery records.',
   array['Valid heavy vehicle licence (Qatar licence preferred)', 'Clean driving record', 'Basic route documentation skills'],
   'verified', 'admin', '2026-10-19T00:00:00Z', true),

  ('GG-1007', 'Cleaner', 'Demo Facility Management', 'Doha', 'cleaning-facility-management', 'Full-time', 'Entry level',
   null, null,
   'Provide daily cleaning and housekeeping support for hotel and commercial premises.',
   array['Attention to detail and reliability', 'Basic knowledge of cleaning chemicals and equipment', 'Good personal presentation'],
   'verified', 'admin', '2026-10-18T00:00:00Z', true),

  ('GG-1008', 'Warehouse Worker', 'Demo Distribution', 'Al Khor', 'logistics-warehousing', 'Full-time', '1–2 years',
   1600, 2100,
   'Handle incoming stock, picking, packing and dispatch while maintaining accurate inventory records.',
   array['Experience in a warehouse or distribution environment', 'Basic numeracy and record-keeping', 'Forklift licence is a plus'],
   'verified', 'admin', '2026-10-17T00:00:00Z', true),

  ('GG-1009', 'Mechanical Technician', 'Demo Plant Services', 'Dukhan', 'mechanical-maintenance', 'Contract', '3–5 years',
   2400, 3400,
   'Carry out preventive maintenance, alignment and repair work on pumps, motors and production equipment.',
   array['Mechanical maintenance experience in an industrial plant', 'Ability to use measuring and alignment tools', 'Diploma or trade certificate preferred'],
   'verified', 'admin', '2026-10-16T00:00:00Z', true),

  ('GG-1010', 'Mason', 'Demo Build Contractors', 'Umm Salal', 'carpentry-masonry', 'Contract', '3–5 years',
   2000, 2800,
   'Lay blocks, bricks and stonework for residential and commercial builds to site specifications.',
   array['Experience with block and brick masonry', 'Ability to work to levels and drawings', 'Own basic hand tools'],
   'verified', 'admin', '2026-10-15T00:00:00Z', true)
on conflict (id) do update set
  title = excluded.title,
  company = excluded.company,
  city = excluded.city,
  industry = excluded.industry,
  type = excluded.type,
  experience = excluded.experience,
  salary_min = excluded.salary_min,
  salary_max = excluded.salary_max,
  description = excluded.description,
  requirements = excluded.requirements,
  status = excluded.status,
  source = excluded.source,
  posted_at = excluded.posted_at,
  is_sample = excluded.is_sample;
