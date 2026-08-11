-- Recommend public lists created by people whose positive ratings overlap with the viewer's.
-- The RPC only returns public list IDs and aggregate similarity values; it never exposes
-- another user's individual rating history.

create index if not exists rating_history_user_like_idx
on public.rating_history (user_id, movie_id)
where coalesce(raw_decision, status) = 'like'
  and (rating is null or rating >= 3.5);

create index if not exists user_lists_public_original_owner_idx
on public.user_lists (user_id, updated_at desc)
where is_private = false
  and source_list_id is null;

create or replace function public.get_similar_taste_list_recommendations()
returns table (
  list_id text,
  taste_similarity numeric,
  shared_like_count bigint
)
language sql
stable
security definer
set search_path = public
as $$
  with current_user_likes as (
    select rating_history.movie_id
    from public.rating_history
    where rating_history.user_id = auth.uid()
      and coalesce(rating_history.raw_decision, rating_history.status) = 'like'
      and (rating_history.rating is null or rating_history.rating >= 3.5)
  ),
  neighbor_likes as (
    select rating_history.user_id, rating_history.movie_id
    from public.rating_history
    where rating_history.user_id <> auth.uid()
      and coalesce(rating_history.raw_decision, rating_history.status) = 'like'
      and (rating_history.rating is null or rating_history.rating >= 3.5)
  ),
  neighbor_like_totals as (
    select user_id, count(*)::numeric as like_count
    from neighbor_likes
    group by user_id
  ),
  similar_users as (
    select
      neighbor.user_id,
      count(*)::bigint as shared_like_count,
      count(*)::numeric /
        nullif(
          sqrt(
            (select count(*)::numeric from current_user_likes) * neighbor_like_totals.like_count
          ),
          0
        ) as taste_similarity
    from neighbor_likes as neighbor
    join current_user_likes using (movie_id)
    join neighbor_like_totals on neighbor_like_totals.user_id = neighbor.user_id
    group by neighbor.user_id, neighbor_like_totals.like_count
  )
  select
    lists.id as list_id,
    similar_users.taste_similarity,
    similar_users.shared_like_count
  from public.user_lists as lists
  join similar_users on similar_users.user_id = lists.user_id
  left join public.list_interactions as viewer_interactions
    on viewer_interactions.list_id = lists.id
    and viewer_interactions.user_id = auth.uid()
  where auth.uid() is not null
    and lists.user_id <> auth.uid()
    and lists.is_private = false
    and lists.source_list_id is null
    and coalesce(viewer_interactions.saved, false) = false
    and similar_users.taste_similarity >= 0.25
  order by similar_users.taste_similarity desc, similar_users.shared_like_count desc, lists.updated_at desc
  limit 12;
$$;

revoke all on function public.get_similar_taste_list_recommendations() from public;
grant execute on function public.get_similar_taste_list_recommendations() to authenticated;
