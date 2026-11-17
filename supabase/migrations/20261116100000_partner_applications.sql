create type public.partnership_request_status as enum ('pending', 'approved', 'rejected');

create table public.partnership_requests (
  id uuid primary key default gen_random_uuid(),
  organization_name text not null check (char_length(btrim(organization_name)) between 2 and 160),
  contact_name text not null check (char_length(btrim(contact_name)) between 2 and 120),
  email text not null check (email ~* '^[^[:space:]@]+@[^[:space:]@]+\.[^[:space:]@]+$'),
  phone text check (phone is null or char_length(btrim(phone)) between 5 and 30),
  category text not null check (category in (
    'Institutionnels',
    'Médias & TV',
    'Télécoms & Paiements',
    'Mécénat & Sponsors',
    'Autres'
  )),
  message text not null check (char_length(btrim(message)) between 20 and 2000),
  public_description text not null default '' check (char_length(public_description) <= 400),
  website text check (website is null or (char_length(website) <= 2048 and website ~* '^https?://')),
  status public.partnership_request_status not null default 'pending',
  consent_at timestamptz not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  reviewed_at timestamptz
);

create index partnership_requests_status_created_idx
  on public.partnership_requests (status, created_at desc);

create trigger partnership_requests_set_updated_at
  before update on public.partnership_requests
  for each row execute function public.set_updated_at();

create function public.set_partnership_reviewed_at()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  if old.status is distinct from new.status then
    new.reviewed_at := case
      when new.status = 'pending' then null
      else now()
    end;
  end if;
  return new;
end;
$$;

create trigger partnership_requests_set_reviewed_at
  before update of status on public.partnership_requests
  for each row execute function public.set_partnership_reviewed_at();

alter table public.partnership_requests enable row level security;

revoke all on public.partnership_requests from anon, authenticated;
grant select, update on public.partnership_requests to authenticated;

create policy "Admins can read partnership requests"
  on public.partnership_requests for select to authenticated
  using (public.has_role(auth.uid(), 'admin'));

create policy "Admins can review partnership requests"
  on public.partnership_requests for update to authenticated
  using (public.has_role(auth.uid(), 'admin'))
  with check (public.has_role(auth.uid(), 'admin'));

create function public.submit_partnership_request(
  p_organization_name text,
  p_contact_name text,
  p_email text,
  p_phone text,
  p_category text,
  p_message text,
  p_public_description text,
  p_website text,
  p_consent boolean
)
returns uuid
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_request_id uuid;
begin
  if p_consent is distinct from true then
    raise exception 'Consent is required to submit a partnership request';
  end if;

  insert into public.partnership_requests (
    organization_name,
    contact_name,
    email,
    phone,
    category,
    message,
    public_description,
    website,
    consent_at,
    status
  )
  values (
    btrim(p_organization_name),
    btrim(p_contact_name),
    lower(btrim(p_email)),
    nullif(btrim(p_phone), ''),
    p_category,
    btrim(p_message),
    coalesce(btrim(p_public_description), ''),
    nullif(btrim(p_website), ''),
    now(),
    'pending'
  )
  returning id into v_request_id;

  return v_request_id;
end;
$$;

revoke all on function public.submit_partnership_request(text, text, text, text, text, text, text, text, boolean)
  from public, anon, authenticated;
grant execute on function public.submit_partnership_request(text, text, text, text, text, text, text, text, boolean)
  to anon, authenticated;

create view public.public_partner_profiles
with (security_invoker = false)
as
select
  id,
  organization_name,
  category,
  public_description,
  website,
  created_at
from public.partnership_requests
where status = 'approved';

grant select on public.public_partner_profiles to anon, authenticated;
