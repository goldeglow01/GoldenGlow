-- ============================================================================
-- GoldenGlow — Supabase schema, RLS, storage and realtime
-- Run in the Supabase SQL editor (or `supabase db push`).
-- ============================================================================

create extension if not exists pgcrypto;

-- ----------------------------------------------------------------------------
-- Enums
-- ----------------------------------------------------------------------------
create type public.user_role          as enum ('worker', 'employer', 'admin');
create type public.job_status         as enum ('pending', 'verified', 'rejected', 'archived');
create type public.application_status as enum ('submitted', 'under_review', 'shortlisted', 'contacted', 'hired', 'declined');
create type public.enquiry_status     as enum ('new', 'in_progress', 'handled', 'spam');

-- Reject angle brackets in text that admins render or email.
create or replace function public.no_markup(t text)
returns boolean
language sql immutable
as $$ select t is null or t !~ '[<>]' $$;

-- ----------------------------------------------------------------------------
-- profiles (authoritative role; role is not writable by clients)
-- ----------------------------------------------------------------------------
create table public.profiles (
  id          uuid primary key references auth.users(id) on delete cascade,
  email       text not null default '' check (char_length(email) <= 160),
  role        public.user_role not null default 'employer',
  name        text not null default '' check (char_length(name) <= 120 and public.no_markup(name)),
  company     text not null default '' check (char_length(company) <= 160 and public.no_markup(company)),
  city        text check (city is null or (char_length(city) <= 80 and public.no_markup(city))),
  trade       text check (trade is null or (char_length(trade) <= 120 and public.no_markup(trade))),
  phone       text check (phone is null or (char_length(phone) <= 40 and public.no_markup(phone))),
  bio         text check (bio is null or char_length(bio) <= 4000),
  experience  text check (experience is null or char_length(experience) <= 80),
  industry    text check (industry is null or char_length(industry) <= 60),
  about       text check (about is null or char_length(about) <= 4000),
  website     text check (website is null or char_length(website) <= 200 and public.no_markup(website)),
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

-- SECURITY DEFINER helpers avoid recursive RLS lookups on profiles.
create or replace function public.current_role()
returns public.user_role
language sql stable security definer set search_path = public
as $$ select coalesce((select role from public.profiles where id = auth.uid()), 'employer'::public.user_role) $$;
revoke all on function public.current_role() from public;
grant execute on function public.current_role() to anon, authenticated, service_role;

create or replace function public.is_admin()
returns boolean
language sql stable security definer set search_path = public
as $$ select exists (select 1 from public.profiles where id = auth.uid() and role = 'admin') $$;
revoke all on function public.is_admin() from public;
grant execute on function public.is_admin() to anon, authenticated, service_role;

-- ----------------------------------------------------------------------------
-- jobs
-- ----------------------------------------------------------------------------
create table public.jobs (
  id            text primary key default ('GG-' || upper(substr(replace(gen_random_uuid()::text, '-', ''), 1, 10))),
  owner_id      uuid references public.profiles(id) on delete set null,
  title         text not null check (char_length(title) between 3 and 140 and public.no_markup(title)),
  company       text not null check (char_length(company) between 1 and 160 and public.no_markup(company)),
  city          text not null check (char_length(city) between 1 and 80 and public.no_markup(city)),
  industry      text not null check (char_length(industry) between 1 and 60),
  type          text not null check (char_length(type) between 1 and 40 and public.no_markup(type)),
  experience    text not null default '' check (char_length(experience) <= 80 and public.no_markup(experience)),
  salary_min    integer check (salary_min is null or salary_min >= 0),
  salary_max    integer check (salary_max is null or salary_max >= 0),
  description   text not null check (char_length(description) between 20 and 20000),
  requirements  text[] not null default '{}',
  status        public.job_status not null default 'pending',
  source        text not null default 'admin' check (source in ('admin', 'employer')),
  posted_at     timestamptz not null default now(),
  is_sample     boolean not null default false,
  search        tsvector generated always as (
                  setweight(to_tsvector('simple', coalesce(title, '')), 'A') ||
                  setweight(to_tsvector('simple', coalesce(company, '')), 'B') ||
                  setweight(to_tsvector('simple', coalesce(description, '')), 'C')
                ) stored,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now(),
  constraint jobs_salary_order check (salary_min is null or salary_max is null or salary_min <= salary_max)
);

create index jobs_public_idx on public.jobs (status, posted_at desc) where status = 'verified';
create index jobs_owner_idx  on public.jobs (owner_id, created_at desc);
create index jobs_status_idx on public.jobs (status);
create index jobs_search_idx on public.jobs using gin (search);

-- ----------------------------------------------------------------------------
-- applications (denormalised snapshot; one per job per applicant)
-- ----------------------------------------------------------------------------
create table public.applications (
  id            uuid primary key default gen_random_uuid(),
  job_id        text not null check (char_length(job_id) between 1 and 64),
  job_owner_id  uuid references public.profiles(id) on delete set null,
  applicant_id  uuid not null references public.profiles(id) on delete cascade,
  name          text not null check (char_length(name) between 1 and 120 and public.no_markup(name)),
  email         text not null check (char_length(email) <= 160 and email ~* '^[^@\s]+@[^@\s]+\.[a-z]{2,}$'),
  phone         text not null check (char_length(phone) between 7 and 40 and public.no_markup(phone)),
  job_title     text not null check (char_length(job_title) <= 140),
  company       text not null default '' check (char_length(company) <= 160),
  city          text not null default '' check (char_length(city) <= 80),
  industry      text not null default '' check (char_length(industry) <= 60),
  note          text check (note is null or char_length(note) <= 4000),
  cv_path       text check (cv_path is null or char_length(cv_path) <= 200),
  cv_name       text check (cv_name is null or char_length(cv_name) <= 160),
  cv_size       integer check (cv_size is null or cv_size <= 5242880),
  status        public.application_status not null default 'submitted',
  status_note   text check (status_note is null or char_length(status_note) <= 2000),
  is_sample     boolean not null default false,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now(),
  unique (job_id, applicant_id)
);

create index applications_applicant_idx on public.applications (applicant_id, created_at desc);
create index applications_owner_idx     on public.applications (job_owner_id, created_at desc);
create index applications_job_idx       on public.applications (job_id);

-- ----------------------------------------------------------------------------
-- saved_jobs
-- ----------------------------------------------------------------------------
create table public.saved_jobs (
  user_id    uuid not null references public.profiles(id) on delete cascade,
  job_id     text not null,
  created_at timestamptz not null default now(),
  primary key (user_id, job_id)
);
create index saved_jobs_job_idx on public.saved_jobs (job_id);

-- ----------------------------------------------------------------------------
-- job_alerts (public insert, admin read)
-- ----------------------------------------------------------------------------
create table public.job_alerts (
  id         uuid primary key default gen_random_uuid(),
  email      text not null check (char_length(email) <= 160 and email ~* '^[^@\s]+@[^@\s]+\.[a-z]{2,}$'),
  filters    jsonb not null default '{}'::jsonb check (jsonb_typeof(filters) = 'object'),
  source     text not null default 'jobs-browser' check (char_length(source) <= 60),
  created_at timestamptz not null default now()
);
create index job_alerts_email_idx on public.job_alerts (lower(email));
create index job_alerts_created_idx on public.job_alerts (created_at desc);

-- ----------------------------------------------------------------------------
-- enquiries (server-side insert only; admin read/update)
-- ----------------------------------------------------------------------------
create table public.enquiries (
  id          uuid primary key default gen_random_uuid(),
  name        text not null check (char_length(name) between 1 and 120 and public.no_markup(name)),
  email       text not null check (char_length(email) <= 160 and email ~* '^[^@\s]+@[^@\s]+\.[a-z]{2,}$'),
  phone       text not null default '' check (char_length(phone) <= 40 and public.no_markup(phone)),
  company     text not null default '' check (char_length(company) <= 160 and public.no_markup(company)),
  city        text not null default '' check (char_length(city) <= 80 and public.no_markup(city)),
  inquiry     text not null default 'General Inquiry' check (char_length(inquiry) <= 120 and public.no_markup(inquiry)),
  industry    text not null default '' check (char_length(industry) <= 120 and public.no_markup(industry)),
  workers     integer check (workers is null or (workers >= 0 and workers <= 100000)),
  message     text not null check (char_length(message) between 20 and 5000),
  status      public.enquiry_status not null default 'new',
  email_sent  boolean not null default false,
  email_error text check (email_error is null or char_length(email_error) <= 500),
  ip_hash     text check (ip_hash is null or char_length(ip_hash) = 64),
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);
create index enquiries_status_idx on public.enquiries (status, created_at desc);
create index enquiries_iphash_idx on public.enquiries (ip_hash, created_at desc);

-- ----------------------------------------------------------------------------
-- Triggers
-- ----------------------------------------------------------------------------
create or replace function public.touch_updated_at()
returns trigger language plpgsql as
$$ begin new.updated_at := now(); return new; end $$;

create trigger profiles_updated     before update on public.profiles     for each row execute function public.touch_updated_at();
create trigger jobs_updated         before update on public.jobs         for each row execute function public.touch_updated_at();
create trigger applications_updated before update on public.applications for each row execute function public.touch_updated_at();
create trigger enquiries_updated    before update on public.enquiries    for each row execute function public.touch_updated_at();

-- Non-admin employers may only create pending jobs and cannot change
-- privileged fields afterwards. auth.uid() is null for SQL/service-role
-- operations (seeds), which bypass RLS anyway.
create or replace function public.jobs_guard()
returns trigger language plpgsql as
$$
begin
  if auth.uid() is null or public.is_admin() then
    return new;
  end if;
  if tg_op = 'INSERT' then
    new.status := 'pending';
    new.source := 'employer';
    new.owner_id := auth.uid();
    new.is_sample := false;
  elsif tg_op = 'UPDATE' then
    new.owner_id := old.owner_id;
    new.source := old.source;
    new.is_sample := old.is_sample;
    -- Content edits by an employer go back for review; status-only changes
    -- (an admin verifying/rejecting) are handled by the admin branch above.
    if new.title is distinct from old.title
       or new.company is distinct from old.company
       or new.city is distinct from old.city
       or new.industry is distinct from old.industry
       or new.type is distinct from old.type
       or new.experience is distinct from old.experience
       or new.salary_min is distinct from old.salary_min
       or new.salary_max is distinct from old.salary_max
       or new.description is distinct from old.description
       or new.requirements is distinct from old.requirements
    then
      new.status := 'pending';
    else
      new.status := old.status;
    end if;
  end if;
  return new;
end $$;

create trigger jobs_guard before insert or update on public.jobs
  for each row execute function public.jobs_guard();

-- Applications inherit the job snapshot from the database (never the client)
-- and always start as submitted.
create or replace function public.applications_guard()
returns trigger language plpgsql as
$$
declare
  v_owner uuid;
  v_title text;
  v_company text;
  v_city text;
  v_industry text;
  v_status public.job_status;
begin
  if tg_op = 'INSERT' then
    select owner_id, title, company, city, industry, status
      into v_owner, v_title, v_company, v_city, v_industry, v_status
      from public.jobs where id = new.job_id;
    if not found then
      raise exception 'job_not_found' using errcode = 'P0001';
    end if;
    if v_status <> 'verified' then
      raise exception 'job_not_open' using errcode = 'P0001';
    end if;
    new.job_owner_id := v_owner;
    new.job_title := v_title;
    new.company := v_company;
    new.city := v_city;
    new.industry := v_industry;
    new.status := 'submitted';
    new.status_note := null;
    return new;
  end if;

  new.applicant_id := old.applicant_id;
  new.job_id := old.job_id;
  new.job_owner_id := old.job_owner_id;

  if not (auth.uid() is null or public.is_admin() or old.job_owner_id = auth.uid()) then
    new.status := old.status;
    new.status_note := old.status_note;
  end if;
  return new;
end $$;

create trigger applications_guard before insert or update on public.applications
  for each row execute function public.applications_guard();

-- Create a profile whenever a user signs up.
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public as
$$
declare v_role public.user_role;
begin
  v_role := case when new.raw_user_meta_data ->> 'role' = 'worker'
                 then 'worker'::public.user_role
                 else 'employer'::public.user_role end;
  insert into public.profiles (id, email, role, name, company)
  values (
    new.id,
    coalesce(new.email, ''),
    v_role,
    left(regexp_replace(coalesce(new.raw_user_meta_data ->> 'name', ''), '[<>]', '', 'g'), 120),
    left(regexp_replace(coalesce(new.raw_user_meta_data ->> 'company', ''), '[<>]', '', 'g'), 160)
  )
  on conflict (id) do update set email = excluded.email;
  return new;
end $$;

create trigger on_auth_user_created after insert on auth.users
  for each row execute function public.handle_new_user();

-- Server-side enquiry throttle (the API also has a per-instance limiter).
create or replace function public.enquiries_rate_guard()
returns trigger language plpgsql as
$$
declare v_count integer;
begin
  if new.ip_hash is not null then
    select count(*) into v_count
      from public.enquiries
      where ip_hash = new.ip_hash and created_at > now() - interval '1 hour';
    if v_count >= 5 then
      raise exception 'rate_limited' using errcode = 'P0001';
    end if;
  end if;
  return new;
end $$;

create trigger enquiries_rate_guard before insert on public.enquiries
  for each row execute function public.enquiries_rate_guard();

-- ----------------------------------------------------------------------------
-- Grants + RLS
-- ----------------------------------------------------------------------------
grant usage on schema public to anon, authenticated;

grant select, insert, update, delete on public.jobs         to anon, authenticated;
grant select, insert, update, delete on public.applications to authenticated;
grant select, insert, update, delete on public.saved_jobs   to authenticated;
grant select, insert                 on public.job_alerts   to anon, authenticated;
grant select, update                 on public.enquiries    to authenticated;
grant select, update                 on public.profiles     to authenticated;
grant select                         on public.profiles     to anon;

-- Clients may edit their own profile fields, never role/email/id.
revoke update on public.profiles from anon, authenticated;
grant update (name, company, city, trade, phone, bio, experience, industry, about, website)
  on public.profiles to authenticated;

alter table public.profiles     enable row level security;
alter table public.jobs         enable row level security;
alter table public.applications enable row level security;
alter table public.saved_jobs   enable row level security;
alter table public.job_alerts   enable row level security;
alter table public.enquiries    enable row level security;

-- profiles
create policy profiles_select on public.profiles for select
  using (id = auth.uid() or public.is_admin());
create policy profiles_update on public.profiles for update
  using (id = auth.uid() or public.is_admin())
  with check (id = auth.uid() or public.is_admin());

-- jobs
create policy jobs_select on public.jobs for select
  using (status = 'verified' or owner_id = auth.uid() or public.is_admin());
create policy jobs_insert on public.jobs for insert
  with check (public.is_admin() or (auth.uid() is not null and public.current_role() = 'employer' and owner_id = auth.uid()));
create policy jobs_update on public.jobs for update
  using (owner_id = auth.uid() or public.is_admin())
  with check (owner_id = auth.uid() or public.is_admin());
create policy jobs_delete on public.jobs for delete
  using (owner_id = auth.uid() or public.is_admin());

-- applications
create policy applications_insert on public.applications for insert
  with check (applicant_id = auth.uid());
create policy applications_select on public.applications for select
  using (
    applicant_id = auth.uid()
    or public.is_admin()
    or exists (select 1 from public.jobs j where j.id = job_id and j.owner_id = auth.uid())
  );
create policy applications_update on public.applications for update
  using (public.is_admin() or exists (select 1 from public.jobs j where j.id = job_id and j.owner_id = auth.uid()));
create policy applications_delete on public.applications for delete
  using (
    applicant_id = auth.uid()
    or public.is_admin()
    or exists (select 1 from public.jobs j where j.id = job_id and j.owner_id = auth.uid())
  );

-- saved jobs
create policy saved_jobs_all on public.saved_jobs for all
  using (user_id = auth.uid())
  with check (user_id = auth.uid());

-- job alerts: public insert, admin read
create policy job_alerts_insert on public.job_alerts for insert
  with check (true);
create policy job_alerts_select on public.job_alerts for select
  using (public.is_admin());

-- enquiries: admin read/update only; the API uses the service role.
create policy enquiries_select on public.enquiries for select
  using (public.is_admin());
create policy enquiries_update on public.enquiries for update
  using (public.is_admin());

-- ----------------------------------------------------------------------------
-- Realtime
-- ----------------------------------------------------------------------------
alter publication supabase_realtime add table public.jobs;
alter publication supabase_realtime add table public.applications;
alter publication supabase_realtime add table public.saved_jobs;
alter publication supabase_realtime add table public.job_alerts;
alter publication supabase_realtime add table public.enquiries;
alter publication supabase_realtime add table public.profiles;

-- ----------------------------------------------------------------------------
-- Storage: private CV bucket
-- ----------------------------------------------------------------------------
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'cvs', 'cvs', false, 5242880,
  array[
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
  ]
)
on conflict (id) do nothing;

create policy cvs_insert_own on storage.objects for insert to authenticated
  with check (bucket_id = 'cvs' and split_part(name, '/', 1) = auth.uid()::text);

create policy cvs_select_own on storage.objects for select to authenticated
  using (bucket_id = 'cvs' and split_part(name, '/', 1) = auth.uid()::text);

create policy cvs_admin_select on storage.objects for select to authenticated
  using (bucket_id = 'cvs' and public.is_admin());

create policy cvs_delete_own on storage.objects for delete to authenticated
  using (bucket_id = 'cvs' and split_part(name, '/', 1) = auth.uid()::text);

create policy cvs_admin_delete on storage.objects for delete to authenticated
  using (bucket_id = 'cvs' and public.is_admin());
