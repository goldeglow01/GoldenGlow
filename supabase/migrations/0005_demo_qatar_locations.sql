-- ============================================================================
-- Move the sample vacancies to Qatar
--
-- The demo rows seeded in 0002 were written for Saudi cities. GoldenGlow is
-- based in Doha, so the sample listings (and only the samples) are relocated to
-- Qatar cities and their copy is updated. Real vacancies are untouched: every
-- statement is guarded by `is_sample = true`.
-- ============================================================================

update public.jobs
set city = v.city,
    description = coalesce(v.description, public.jobs.description)
from (values
  ('GG-1001', 'Doha',
   'Maintain and repair water supply, drainage and sanitary systems across commercial buildings in Doha.'),
  ('GG-1002', 'Lusail', null),
  ('GG-1003', 'Mesaieed', null),
  ('GG-1004', 'Al Rayyan', null),
  ('GG-1005', 'Mesaieed', null),
  ('GG-1006', 'Al Wakrah', null),
  ('GG-1007', 'Doha', null),
  ('GG-1008', 'Al Khor', null),
  ('GG-1009', 'Dukhan', null),
  ('GG-1010', 'Umm Salal', null)
) as v(id, city, description)
where public.jobs.id = v.id
  and public.jobs.is_sample = true;

-- The driver sample referred to a Saudi licence; make it Qatar.
update public.jobs
set requirements = array_replace(requirements, 'Valid heavy vehicle licence (Saudi licence preferred)', 'Valid heavy vehicle licence (Qatar licence preferred)')
where id = 'GG-1006'
  and is_sample = true;
