create or replace view public.candidate_rankings
with (security_invoker = false)
as
with ranked as (
  select
    totals.candidate_id,
    candidates.category_id,
    totals.votes_total,
    totals.votes_free,
    totals.votes_paid,
    rank() over (
      partition by candidates.category_id
      order by totals.votes_total desc
    ) as category_rank,
    rank() over (
      order by totals.votes_total desc
    ) as global_rank,
    max(totals.votes_total) over (
      partition by candidates.category_id
    ) - totals.votes_total as votes_to_leader,
    sum(totals.votes_total) over (
      partition by candidates.category_id
    ) as category_votes_total,
    sum(totals.votes_total) over () as global_votes_total
  from public.candidate_vote_totals totals
  join public.candidates candidates on candidates.id = totals.candidate_id
  where candidates.status = 'accepted' and not candidates.is_demo
)
select
  ranked.*,
  coalesce(round(100.0 * ranked.votes_total / nullif(ranked.category_votes_total, 0), 2), 0) as category_vote_share,
  coalesce(round(100.0 * ranked.votes_total / nullif(ranked.global_votes_total, 0), 2), 0) as global_vote_share
from ranked;

grant select on public.candidate_rankings to anon, authenticated;

create or replace view public.event_vote_totals
with (security_invoker = false)
as
select
  coalesce(sum(votes_total), 0)::bigint as votes_total,
  coalesce(sum(votes_free), 0)::bigint as votes_free,
  coalesce(sum(votes_paid), 0)::bigint as votes_paid
from public.candidate_vote_totals;

grant select on public.event_vote_totals to anon, authenticated;
