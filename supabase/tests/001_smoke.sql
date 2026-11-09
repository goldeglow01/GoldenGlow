-- Smoke tests for the migrations: seed count, profile trigger, application
-- snapshot trigger, and basic RLS visibility for a worker and an employer.

\set ON_ERROR_STOP on

do $$
declare
  worker uuid := '11111111-1111-4111-8111-111111111111';
  employer uuid := '22222222-2222-4222-8222-222222222222';
  jobs_count integer;
begin
  select count(*) into jobs_count from public.jobs;
  if jobs_count <> 10 then
    raise exception 'expected 10 seeded jobs, got %', jobs_count;
  end if;

  insert into auth.users (id, email, raw_user_meta_data)
  values
    (worker, 'worker@example.com', '{"role":"worker","name":"Test Worker"}'),
    (employer, 'employer@example.com', '{"role":"employer","name":"Test Employer"}');

  if not exists (select 1 from public.profiles where id = worker and role = 'worker') then
    raise exception 'profile trigger did not create the worker profile';
  end if;

  insert into public.jobs
    (id, owner_id, title, company, city, industry, type, experience, description, status, source)
  values
    ('GG-TEST-PENDING', employer, 'Pending Job', 'Acme', 'Riyadh',
     'construction-infrastructure', 'Full-time', '1-2 years',
     'A pending job description that is long enough.', 'pending', 'employer'),
    ('GG-TEST-VERIFIED', employer, 'Employer Verified Job', 'Acme', 'Riyadh',
     'construction-infrastructure', 'Full-time', '1-2 years',
     'A verified job description that is long enough.', 'verified', 'employer');

  insert into public.applications (job_id, applicant_id, name, email, phone, job_title)
  values ('GG-TEST-VERIFIED', worker, 'Test Worker', 'worker@example.com', '+966500000000', 'placeholder');

  if not exists (
    select 1 from public.applications
    where applicant_id = worker
      and status = 'submitted'
      and job_title = 'Employer Verified Job'
      and company = 'Acme'
  ) then
    raise exception 'application trigger did not copy the job snapshot';
  end if;
end $$;

begin;
set local role authenticated;
set local request.jwt.claim.sub = '11111111-1111-4111-8111-111111111111';

do $$
declare
  n integer;
begin
  select count(*) into n from public.jobs;
  if n <> 11 then
    raise exception 'worker should see 11 verified jobs, got %', n;
  end if;

  select count(*) into n from public.applications;
  if n <> 1 then
    raise exception 'worker should see only their own application, got %', n;
  end if;
end $$;

rollback;

begin;
set local role authenticated;
set local request.jwt.claim.sub = '22222222-2222-4222-8222-222222222222';

do $$
declare
  n integer;
begin
  select count(*) into n from public.jobs;
  if n <> 12 then
    raise exception 'employer should see 10 seeded, their verified and their pending job, got %', n;
  end if;

  select count(*) into n from public.applications;
  if n <> 1 then
    raise exception 'employer should see applications to their job, got %', n;
  end if;
end $$;

rollback;
