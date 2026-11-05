create table public.voter_profiles (
  user_id uuid primary key references auth.users(id) on delete cascade,
  first_name text not null,
  email text,
  phone text,
  country text not null,
  verification_channel text not null check (verification_channel in ('email', 'phone')),
  consent_at timestamptz not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (email is not null or phone is not null),
  check (verification_channel <> 'email' or email is not null),
  check (verification_channel <> 'phone' or phone is not null)
);

create trigger voter_profiles_set_updated_at
  before update on public.voter_profiles
  for each row execute function public.set_updated_at();

alter table public.voter_profiles enable row level security;

create policy "Voters can read their own profile"
  on public.voter_profiles for select to authenticated
  using (user_id = auth.uid() or public.has_role(auth.uid(), 'admin'));
create policy "Voters can create their own profile"
  on public.voter_profiles for insert to authenticated
  with check (user_id = auth.uid());
create policy "Voters can update their own profile"
  on public.voter_profiles for update to authenticated
  using (user_id = auth.uid())
  with check (user_id = auth.uid());
create policy "Admins can manage voter profiles"
  on public.voter_profiles for all to authenticated
  using (public.has_role(auth.uid(), 'admin'))
  with check (public.has_role(auth.uid(), 'admin'));

update storage.buckets
set file_size_limit = 5242880,
    allowed_mime_types = array['image/jpeg', 'image/png', 'image/webp']
where id = 'candidate-media';

create policy "Users can delete their own candidate media"
  on storage.objects for delete to authenticated
  using (
    bucket_id = 'candidate-media'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

create function public.submit_candidate(
  p_name text,
  p_stage_name text,
  p_age smallint,
  p_city text,
  p_country text,
  p_bio text,
  p_photo_url text,
  p_audio_sample_url text,
  p_video_url text,
  p_social_links jsonb,
  p_category_id text,
  p_prize_name text,
  p_email text,
  p_phone text
)
returns uuid
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_user_id uuid := auth.uid();
  v_verified_email text;
  v_prize_id uuid;
  v_candidate_id uuid;
begin
  if v_user_id is null then
    raise exception 'Sign in before submitting a candidate';
  end if;

  if nullif(trim(p_name), '') is null
    or nullif(trim(p_stage_name), '') is null
    or nullif(trim(p_city), '') is null
    or nullif(trim(p_country), '') is null
    or nullif(trim(p_bio), '') is null
    or jsonb_typeof(coalesce(p_social_links, '{}'::jsonb)) <> 'object' then
    raise exception 'Candidate information is incomplete or invalid';
  end if;

  select lower(u.email)
    into v_verified_email
    from auth.users u
    where u.id = v_user_id and u.email_confirmed_at is not null;

  if v_verified_email is null or v_verified_email <> lower(trim(p_email)) then
    raise exception 'Verify and use the email address on your account';
  end if;

  select p.id into v_prize_id
    from public.prizes p
    where p.category_id = p_category_id and p.name = p_prize_name;

  if v_prize_id is null then
    raise exception 'The selected prize does not exist in this category';
  end if;

  insert into public.candidates (
    user_id, category_id, prize_id, name, stage_name, age, city, country,
    bio, photo_url, audio_sample_url, video_url, social_links
  )
  values (
    v_user_id, p_category_id, v_prize_id, trim(p_name), trim(p_stage_name),
    p_age, trim(p_city), trim(p_country), trim(p_bio), nullif(trim(p_photo_url), ''),
    nullif(trim(p_audio_sample_url), ''), nullif(trim(p_video_url), ''),
    coalesce(p_social_links, '{}'::jsonb)
  )
  returning id into v_candidate_id;

  insert into public.candidate_private_details (candidate_id, email, phone)
  values (v_candidate_id, lower(trim(p_email)), nullif(trim(p_phone), ''));

  return v_candidate_id;
end;
$$;

revoke all on function public.submit_candidate(
  text, text, smallint, text, text, text, text, text, text, jsonb, text, text, text, text
) from public, anon;
grant execute on function public.submit_candidate(
  text, text, smallint, text, text, text, text, text, text, jsonb, text, text, text, text
) to authenticated;

create function public.audit_vote_change()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.audit_logs (actor_user_id, action, entity_type, entity_id, metadata)
  values (
    coalesce(new.voter_id, auth.uid()),
    'vote.cast',
    'vote',
    new.id::text,
    jsonb_build_object(
      'candidate_id', new.candidate_id,
      'vote_type', new.vote_type,
      'vote_count', new.vote_count
    )
  );
  return new;
end;
$$;

create trigger votes_audit_insert
  after insert on public.votes
  for each row execute function public.audit_vote_change();

create function public.audit_candidate_moderation()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  if old.status is distinct from new.status then
    insert into public.audit_logs (actor_user_id, action, entity_type, entity_id, metadata)
    values (
      auth.uid(),
      'candidate.status_changed',
      'candidate',
      new.id::text,
      jsonb_build_object('from', old.status, 'to', new.status, 'reason', new.rejection_reason)
    );
  end if;
  return new;
end;
$$;

create trigger candidates_audit_moderation
  after update of status on public.candidates
  for each row execute function public.audit_candidate_moderation();

create or replace view public.candidate_public_profiles
with (security_invoker = false)
as
select
  c.id,
  c.category_id,
  c.prize_id,
  c.name,
  c.stage_name,
  c.age,
  c.city,
  c.country,
  c.bio,
  c.photo_url,
  c.audio_sample_url,
  c.video_url,
  c.social_links,
  c.status,
  c.views_count,
  c.submitted_at,
  c.created_at
from public.candidates c
where c.status = 'accepted' and not c.is_demo;

create or replace view public.candidate_account_profiles
with (security_invoker = false)
as
select
  c.id,
  c.category_id,
  c.prize_id,
  c.name,
  c.stage_name,
  c.age,
  c.city,
  c.country,
  c.bio,
  c.photo_url,
  c.audio_sample_url,
  c.video_url,
  c.social_links,
  c.status,
  c.rejection_reason,
  c.views_count,
  c.submitted_at,
  c.moderated_at,
  c.created_at,
  c.user_id = auth.uid() as is_owner
from public.candidates c
where c.user_id = auth.uid() or public.has_role(auth.uid(), 'admin');

revoke select on public.candidates from anon, authenticated;
grant select (id) on public.candidates to authenticated;
grant update (bio, video_url, social_links, status, rejection_reason, moderated_at)
  on public.candidates to authenticated;
grant select on public.candidate_public_profiles to anon, authenticated;
grant select on public.candidate_account_profiles to authenticated;

create function public.can_access_candidate_private_details(
  p_candidate_id uuid,
  p_require_pending boolean default false
)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1
    from public.candidates c
    where c.id = p_candidate_id
      and c.user_id = auth.uid()
      and (not p_require_pending or c.status = 'pending')
  );
$$;

revoke all on function public.can_access_candidate_private_details(uuid, boolean) from public, anon;
grant execute on function public.can_access_candidate_private_details(uuid, boolean) to authenticated;

drop policy "Owners and admins can read private candidate details"
  on public.candidate_private_details;
drop policy "Owners can submit private candidate details"
  on public.candidate_private_details;

create policy "Owners and admins can read private candidate details"
  on public.candidate_private_details for select to authenticated using (
    public.can_access_candidate_private_details(candidate_id)
    or public.has_role(auth.uid(), 'admin')
  );
create policy "Owners can submit private candidate details"
  on public.candidate_private_details for insert to authenticated with check (
    public.can_access_candidate_private_details(candidate_id, true)
  );
