-- ============================================================================
-- Store a worker's trade during sign-up.
--
-- The sign-up form asks workers for a "Trade or job title" but the trigger only
-- copied `company` from the auth metadata, so the value never reached
-- profiles.trade (and stayed invisible in the worker profile).
-- ============================================================================

create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public as
$$
declare v_role public.user_role;
begin
  v_role := case when new.raw_user_meta_data ->> 'role' = 'worker'
                 then 'worker'::public.user_role
                 else 'employer'::public.user_role end;
  insert into public.profiles (id, email, role, name, company, trade)
  values (
    new.id,
    coalesce(new.email, ''),
    v_role,
    left(regexp_replace(coalesce(new.raw_user_meta_data ->> 'name', ''), '[<>]', '', 'g'), 120),
    left(regexp_replace(coalesce(new.raw_user_meta_data ->> 'company', ''), '[<>]', '', 'g'), 160),
    left(regexp_replace(coalesce(new.raw_user_meta_data ->> 'trade', ''), '[<>]', '', 'g'), 120)
  )
  on conflict (id) do update set email = excluded.email;
  return new;
end $$;
