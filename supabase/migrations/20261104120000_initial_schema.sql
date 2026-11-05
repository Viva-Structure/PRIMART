create extension if not exists pgcrypto with schema extensions;

create type public.app_role as enum ('admin');
create type public.candidate_status as enum (
  'pending',
  'under_review',
  'accepted',
  'rejected',
  'changes_requested',
  'suspended'
);
create type public.vote_type as enum ('free', 'paid');
create type public.payment_status as enum (
  'pending',
  'succeeded',
  'failed',
  'cancelled',
  'refunded'
);
create type public.suspect_vote_status as enum ('quarantined', 'validated', 'cancelled');

create table public.categories (
  id text primary key,
  name text not null unique,
  icon text not null,
  description text not null default '',
  sort_order smallint not null unique check (sort_order > 0),
  created_at timestamptz not null default now()
);

create table public.prizes (
  id uuid primary key default gen_random_uuid(),
  category_id text not null references public.categories(id) on delete restrict,
  name text not null,
  sort_order smallint not null check (sort_order > 0),
  created_at timestamptz not null default now(),
  unique (category_id, name),
  unique (id, category_id)
);

create table public.user_roles (
  user_id uuid not null references auth.users(id) on delete cascade,
  role public.app_role not null,
  created_at timestamptz not null default now(),
  primary key (user_id, role)
);

create function public.has_role(_user_id uuid, _role public.app_role)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1
    from public.user_roles
    where user_id = _user_id and role = _role
  );
$$;

revoke all on function public.has_role(uuid, public.app_role) from public, anon;
grant execute on function public.has_role(uuid, public.app_role) to authenticated;

create table public.candidates (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete set null,
  category_id text not null references public.categories(id) on delete restrict,
  prize_id uuid not null,
  name text not null,
  stage_name text not null,
  age smallint check (age between 14 and 120),
  city text not null,
  country text not null,
  bio text not null default '',
  photo_url text,
  audio_sample_url text,
  video_url text,
  social_links jsonb not null default '{}'::jsonb check (jsonb_typeof(social_links) = 'object'),
  status public.candidate_status not null default 'pending',
  rejection_reason text,
  is_demo boolean not null default false,
  views_count bigint not null default 0 check (views_count >= 0),
  submitted_at timestamptz not null default now(),
  moderated_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  foreign key (prize_id, category_id)
    references public.prizes(id, category_id) on delete restrict
);

create index candidates_public_category_idx
  on public.candidates (category_id, status, created_at desc);
create index candidates_owner_idx on public.candidates (user_id);

create function public.set_updated_at()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger candidates_set_updated_at
  before update on public.candidates
  for each row execute function public.set_updated_at();

create table public.candidate_private_details (
  candidate_id uuid primary key references public.candidates(id) on delete cascade,
  email text,
  phone text,
  identity_document_path text,
  updated_at timestamptz not null default now()
);

create trigger candidate_private_details_set_updated_at
  before update on public.candidate_private_details
  for each row execute function public.set_updated_at();

create table public.event_settings (
  id text primary key check (id = 'primart'),
  event_name text not null,
  votes_open boolean not null default false,
  ends_at timestamptz,
  show_exact_votes boolean not null default true,
  free_votes_daily_quota smallint not null default 1 check (free_votes_daily_quota > 0),
  jury_weight smallint not null default 30 check (jury_weight between 0 and 100),
  public_weight smallint not null default 70 check (public_weight between 0 and 100),
  hide_leaderboard_last_hours boolean not null default false,
  updated_at timestamptz not null default now(),
  check (jury_weight + public_weight = 100)
);

create trigger event_settings_set_updated_at
  before update on public.event_settings
  for each row execute function public.set_updated_at();

create table public.vote_packs (
  id text primary key,
  votes integer not null check (votes > 0),
  price bigint not null check (price > 0),
  currency text not null default 'XOF',
  badge text,
  popular boolean not null default false,
  discount text,
  active boolean not null default true,
  sort_order smallint not null unique check (sort_order > 0)
);

create table public.payment_orders (
  id uuid primary key default gen_random_uuid(),
  candidate_id uuid not null references public.candidates(id) on delete restrict,
  voter_id uuid references auth.users(id) on delete set null,
  vote_pack_id text references public.vote_packs(id) on delete restrict,
  votes_count integer not null check (votes_count > 0),
  amount bigint not null check (amount > 0),
  currency text not null default 'XOF',
  provider text not null,
  provider_reference text unique,
  payment_method text not null,
  phone_last_digits text,
  status public.payment_status not null default 'pending',
  paid_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index payment_orders_status_date_idx
  on public.payment_orders (status, created_at desc);
create index payment_orders_candidate_idx on public.payment_orders (candidate_id);

create trigger payment_orders_set_updated_at
  before update on public.payment_orders
  for each row execute function public.set_updated_at();

create table public.votes (
  id uuid primary key default gen_random_uuid(),
  candidate_id uuid not null references public.candidates(id) on delete restrict,
  voter_id uuid references auth.users(id) on delete set null,
  vote_type public.vote_type not null,
  vote_count integer not null check (vote_count > 0),
  payment_order_id uuid unique references public.payment_orders(id) on delete restrict,
  created_at timestamptz not null default now(),
  check (
    (vote_type = 'free' and vote_count = 1 and payment_order_id is null and voter_id is not null)
    or (vote_type = 'paid' and payment_order_id is not null)
  )
);

create index votes_candidate_date_idx on public.votes (candidate_id, created_at desc);
create index votes_voter_date_idx on public.votes (voter_id, created_at desc);

create table public.suspect_votes (
  id uuid primary key default gen_random_uuid(),
  vote_id uuid references public.votes(id) on delete set null,
  candidate_id uuid references public.candidates(id) on delete set null,
  voter_id uuid references auth.users(id) on delete set null,
  ip_address inet,
  device_fingerprint text,
  vote_type public.vote_type,
  reason text not null,
  status public.suspect_vote_status not null default 'quarantined',
  resolved_by uuid references auth.users(id) on delete set null,
  resolved_at timestamptz,
  created_at timestamptz not null default now()
);

create table public.payment_events (
  id uuid primary key default gen_random_uuid(),
  payment_order_id uuid references public.payment_orders(id) on delete set null,
  provider text not null,
  external_event_id text not null,
  event_type text not null,
  payload jsonb not null default '{}'::jsonb,
  received_at timestamptz not null default now(),
  processed_at timestamptz,
  unique (provider, external_event_id)
);

create table public.audit_logs (
  id bigint generated always as identity primary key,
  actor_user_id uuid references auth.users(id) on delete set null,
  action text not null,
  entity_type text not null,
  entity_id text,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create or replace function public.cast_free_vote(p_candidate_id uuid)
returns uuid
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_user_id uuid := auth.uid();
  v_category_id text;
  v_votes_open boolean;
  v_ends_at timestamptz;
  v_daily_quota smallint;
  v_votes_in_window bigint;
  v_vote_id uuid;
begin
  if v_user_id is null then
    raise exception 'Authentication is required to vote';
  end if;

  select votes_open, ends_at, free_votes_daily_quota
    into v_votes_open, v_ends_at, v_daily_quota
    from public.event_settings
    where id = 'primart';

  if not found or not v_votes_open or (v_ends_at is not null and v_ends_at <= now()) then
    raise exception 'Voting is closed';
  end if;

  select category_id
    into v_category_id
    from public.candidates
    where id = p_candidate_id and status = 'accepted' and not is_demo;

  if not found then
    raise exception 'Candidate is not eligible for voting';
  end if;

  perform pg_advisory_xact_lock(
    hashtextextended(v_user_id::text || ':' || v_category_id, 0)
  );

  select count(*)
    into v_votes_in_window
    from public.votes v
    join public.candidates c on c.id = v.candidate_id
    where v.voter_id = v_user_id
      and v.vote_type = 'free'
      and c.category_id = v_category_id
      and v.created_at > now() - interval '24 hours';

  if v_votes_in_window >= v_daily_quota then
    raise exception 'Free vote already used for this category in the last 24 hours';
  end if;

  insert into public.votes (candidate_id, voter_id, vote_type, vote_count)
    values (p_candidate_id, v_user_id, 'free', 1)
    returning id into v_vote_id;

  return v_vote_id;
end;
$$;

revoke all on function public.cast_free_vote(uuid) from public, anon;
grant execute on function public.cast_free_vote(uuid) to authenticated;

create function public.ensure_paid_vote_is_settled()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_candidate_id uuid;
  v_votes_count integer;
  v_status public.payment_status;
begin
  if new.vote_type = 'paid' then
    select candidate_id, votes_count, status
      into v_candidate_id, v_votes_count, v_status
      from public.payment_orders
      where id = new.payment_order_id;

    if not found
      or v_status <> 'succeeded'
      or v_candidate_id <> new.candidate_id
      or v_votes_count <> new.vote_count then
      raise exception 'Paid votes require a matching settled payment order';
    end if;
  end if;

  return new;
end;
$$;

create trigger votes_require_settled_payment
  before insert or update on public.votes
  for each row execute function public.ensure_paid_vote_is_settled();

create view public.candidate_vote_totals
with (security_invoker = false)
as
select
  c.id as candidate_id,
  coalesce(sum(v.vote_count), 0)::bigint as votes_total,
  coalesce(sum(v.vote_count) filter (where v.vote_type = 'free'), 0)::bigint as votes_free,
  coalesce(sum(v.vote_count) filter (where v.vote_type = 'paid'), 0)::bigint as votes_paid
from public.candidates c
left join public.votes v
  on v.candidate_id = c.id
  and (
    v.vote_type = 'free'
    or exists (
      select 1 from public.payment_orders po
      where po.id = v.payment_order_id and po.status = 'succeeded'
    )
  )
where c.status = 'accepted' and not c.is_demo
group by c.id;

grant select on public.candidate_vote_totals to anon, authenticated;

alter table public.categories enable row level security;
alter table public.prizes enable row level security;
alter table public.user_roles enable row level security;
alter table public.candidates enable row level security;
alter table public.candidate_private_details enable row level security;
alter table public.event_settings enable row level security;
alter table public.vote_packs enable row level security;
alter table public.payment_orders enable row level security;
alter table public.votes enable row level security;
alter table public.suspect_votes enable row level security;
alter table public.payment_events enable row level security;
alter table public.audit_logs enable row level security;

create policy "Categories are publicly readable"
  on public.categories for select to anon, authenticated using (true);
create policy "Prizes are publicly readable"
  on public.prizes for select to anon, authenticated using (true);
create policy "Users can read their own roles"
  on public.user_roles for select to authenticated using (user_id = auth.uid() or public.has_role(auth.uid(), 'admin'));
create policy "Public can read approved non-demo candidates"
  on public.candidates for select to anon
  using (status = 'accepted' and not is_demo);
create policy "Authenticated users can read approved, owned, or admin candidates"
  on public.candidates for select to authenticated using (
    (status = 'accepted' and not is_demo)
    or user_id = auth.uid()
    or public.has_role(auth.uid(), 'admin')
  );
create policy "Authenticated users can submit their own candidate profile"
  on public.candidates for insert to authenticated with check (
    user_id = auth.uid() and status = 'pending' and not is_demo
  );
create policy "Owners can edit pending candidate profiles"
  on public.candidates for update to authenticated
  using (user_id = auth.uid() and status in ('pending', 'changes_requested'))
  with check (user_id = auth.uid() and status in ('pending', 'changes_requested') and not is_demo);
create policy "Admins can manage candidates"
  on public.candidates for all to authenticated
  using (public.has_role(auth.uid(), 'admin'))
  with check (public.has_role(auth.uid(), 'admin'));
create policy "Owners and admins can read private candidate details"
  on public.candidate_private_details for select to authenticated using (
    exists (
      select 1 from public.candidates c
      where c.id = candidate_id
        and (c.user_id = auth.uid() or public.has_role(auth.uid(), 'admin'))
    )
  );
create policy "Owners can submit private candidate details"
  on public.candidate_private_details for insert to authenticated with check (
    exists (
      select 1 from public.candidates c
      where c.id = candidate_id and c.user_id = auth.uid() and c.status = 'pending'
    )
  );
create policy "Admins can manage private candidate details"
  on public.candidate_private_details for all to authenticated
  using (public.has_role(auth.uid(), 'admin'))
  with check (public.has_role(auth.uid(), 'admin'));
create policy "Event settings are publicly readable"
  on public.event_settings for select to anon, authenticated using (true);
create policy "Admins can manage event settings"
  on public.event_settings for all to authenticated
  using (public.has_role(auth.uid(), 'admin'))
  with check (public.has_role(auth.uid(), 'admin'));
create policy "Active vote packs are publicly readable"
  on public.vote_packs for select to anon using (active);
create policy "Authenticated users can read active or admin vote packs"
  on public.vote_packs for select to authenticated
  using (active or public.has_role(auth.uid(), 'admin'));
create policy "Admins can manage vote packs"
  on public.vote_packs for all to authenticated
  using (public.has_role(auth.uid(), 'admin'))
  with check (public.has_role(auth.uid(), 'admin'));
create policy "Voters can read their own payment orders"
  on public.payment_orders for select to authenticated using (
    voter_id = auth.uid() or public.has_role(auth.uid(), 'admin')
  );
create policy "Voters can read their own votes"
  on public.votes for select to authenticated using (
    voter_id = auth.uid() or public.has_role(auth.uid(), 'admin')
  );
create policy "Admins can manage suspect votes"
  on public.suspect_votes for all to authenticated
  using (public.has_role(auth.uid(), 'admin'))
  with check (public.has_role(auth.uid(), 'admin'));
create policy "Admins can read payment events"
  on public.payment_events for select to authenticated using (public.has_role(auth.uid(), 'admin'));
create policy "Admins can read audit logs"
  on public.audit_logs for select to authenticated using (public.has_role(auth.uid(), 'admin'));

insert into storage.buckets (id, name, public)
values
  ('candidate-media', 'candidate-media', true),
  ('candidate-documents', 'candidate-documents', false)
on conflict (id) do nothing;

create policy "Candidate media is publicly readable"
  on storage.objects for select to anon, authenticated
  using (bucket_id = 'candidate-media');
create policy "Users can upload their own candidate media"
  on storage.objects for insert to authenticated
  with check (
    bucket_id = 'candidate-media'
    and (storage.foldername(name))[1] = auth.uid()::text
  );
create policy "Users can update their own candidate media"
  on storage.objects for update to authenticated
  using (
    bucket_id = 'candidate-media'
    and (storage.foldername(name))[1] = auth.uid()::text
  )
  with check (
    bucket_id = 'candidate-media'
    and (storage.foldername(name))[1] = auth.uid()::text
  );
create policy "Owners and admins can read candidate documents"
  on storage.objects for select to authenticated
  using (
    bucket_id = 'candidate-documents'
    and (
      (storage.foldername(name))[1] = auth.uid()::text
      or public.has_role(auth.uid(), 'admin')
    )
  );
create policy "Users can upload their own candidate documents"
  on storage.objects for insert to authenticated
  with check (
    bucket_id = 'candidate-documents'
    and (storage.foldername(name))[1] = auth.uid()::text
  );
create policy "Users and admins can update candidate documents"
  on storage.objects for update to authenticated
  using (
    bucket_id = 'candidate-documents'
    and (
      (storage.foldername(name))[1] = auth.uid()::text
      or public.has_role(auth.uid(), 'admin')
    )
  )
  with check (
    bucket_id = 'candidate-documents'
    and (
      (storage.foldername(name))[1] = auth.uid()::text
      or public.has_role(auth.uid(), 'admin')
    )
  );
