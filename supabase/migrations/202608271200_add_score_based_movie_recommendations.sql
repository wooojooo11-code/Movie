-- Score-based collaborative filtering for movie recommendations.
-- Only aggregate scores and counts leave the database; individual ratings remain private.

create or replace function public.get_score_based_collaborative_recommendation_signals()
returns table (
  movie_id text,
  collaborative_score numeric,
  similar_user_count bigint
)
language sql
stable
security definer
set search_path = public
as $$
  with rating_signals as (
    select
      history.user_id,
      history.movie_id,
      case
        when coalesce(history.raw_decision, history.status) = 'like'
          or history.rating >= 3 then 1
        when coalesce(history.raw_decision, history.status) in ('dislike', 'not_interested')
          or history.rating < 3 then -1
        else 0
      end as preference
    from public.rating_history as history
    where coalesce(history.raw_decision, history.status) <> 'not_seen'
  ),
  interest_signals as (
    select library.user_id, library.movie_id, 1 as preference
    from public.movie_library_items as library
  ),
  user_movie_signals as (
    select signals.user_id, signals.movie_id, max(signals.preference) as preference
    from (
      select * from rating_signals
      union all
      select * from interest_signals
    ) as signals
    where signals.preference <> 0
    group by signals.user_id, signals.movie_id
  ),
  current_user_signals as (
    select signal.movie_id, signal.preference
    from user_movie_signals as signal
    where signal.user_id = auth.uid()
  ),
  similar_users as (
    select
      neighbor.user_id,
      greatest(
        0,
        least(
          100,
          70 + sum(case when neighbor.preference = current.preference then 5 else -5 end)
        )
      )::numeric as similarity_score
    from user_movie_signals as neighbor
    join current_user_signals as current using (movie_id)
    where neighbor.user_id <> auth.uid()
    group by neighbor.user_id
  ),
  candidate_movies as (
    select
      neighbor.movie_id,
      least(
        100,
        avg(similar.similarity_score) + least((count(distinct neighbor.user_id) - 1) * 5, 20)
      )::numeric as collaborative_score,
      count(distinct neighbor.user_id) as similar_user_count
    from user_movie_signals as neighbor
    join similar_users as similar on similar.user_id = neighbor.user_id
    where neighbor.preference = 1
      and similar.similarity_score >= 70
      and not exists (
        select 1
        from user_movie_signals as current
        where current.user_id = auth.uid()
          and current.movie_id = neighbor.movie_id
      )
    group by neighbor.movie_id
  )
  select candidate.movie_id, candidate.collaborative_score, candidate.similar_user_count
  from candidate_movies as candidate
  where auth.uid() is not null
  order by candidate.collaborative_score desc, candidate.similar_user_count desc, candidate.movie_id
  limit 100;
$$;

revoke all on function public.get_score_based_collaborative_recommendation_signals() from public;
grant execute on function public.get_score_based_collaborative_recommendation_signals() to authenticated;

