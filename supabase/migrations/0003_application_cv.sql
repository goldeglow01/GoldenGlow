-- ============================================================================
-- Let applicants attach a CV to their own application.
--
-- 0001 only allowed admins and the job owner to update an application, so the
-- post-insert CV link written by the browser was silently dropped (storage RLS
-- allowed the upload, but the row update matched no policy).
--
-- The guard trigger now keeps every identity and job-snapshot column immutable.
-- Within that:
--   * the employer who owns the vacancy may change status / status_note;
--   * the applicant may change cv_path / cv_name / cv_size;
--   * neither may touch anything else.
-- ============================================================================

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
  v_is_owner boolean;
  v_is_applicant boolean;
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

  -- The row's identity and its link to a vacancy never change.
  new.id := old.id;
  new.applicant_id := old.applicant_id;
  new.job_id := old.job_id;
  new.job_owner_id := old.job_owner_id;
  new.created_at := old.created_at;

  -- Service-role / SQL-editor maintenance and admins keep full control of the
  -- remaining content (useful for correcting corrupted snapshot rows).
  if auth.uid() is null or public.is_admin() then
    return new;
  end if;

  -- For everyone else the snapshot and applicant details are immutable.
  new.job_title := old.job_title;
  new.company := old.company;
  new.city := old.city;
  new.industry := old.industry;
  new.name := old.name;
  new.email := old.email;
  new.phone := old.phone;
  new.note := old.note;
  new.is_sample := old.is_sample;

  v_is_owner := old.job_owner_id = auth.uid();
  v_is_applicant := old.applicant_id = auth.uid();

  if not v_is_owner then
    new.status := old.status;
    new.status_note := old.status_note;
  end if;

  if not v_is_applicant then
    new.cv_path := old.cv_path;
    new.cv_name := old.cv_name;
    new.cv_size := old.cv_size;
  end if;

  return new;
end $$;

drop policy if exists applications_update_own on public.applications;
create policy applications_update_own on public.applications for update
  using (applicant_id = auth.uid())
  with check (applicant_id = auth.uid());
