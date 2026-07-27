-- User-based collaborative filtering without exposing another user's rating history.
-- The RPC finds users who liked at least one of the current user's liked movies,
-- then returns their other liked movies as aggregate recommendation signals.

create index if not exists rating_history_movie_user_like_idx
on public.rating_history (movie_id, user_id)
where coalesce(raw_decision, status) = 'like'
  and (rating is null or rating >= 3.5);

create or replace function public.get_collaborative_recommendation_signals()
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
  with current_user_likes as (
    select
      rating_history.movie_id,
      case
        when rating_history.rating >= 4.5 then 1.25::numeric
        when rating_history.rating >= 4.0 then 1.1::numeric
        else 1::numeric
      end as like_weight
    from public.rating_history
    where rating_history.user_id = auth.uid()
      and coalesce(rating_history.raw_decision, rating_history.status) = 'like'
      and (rating_history.rating is null or rating_history.rating >= 3.5)
  ),
  similar_users as (
    select
      neighbor.user_id,
      sum(
        least(
          current_user_likes.like_weight,
          case
            when neighbor.rating >= 4.5 then 1.25::numeric
            when neighbor.rating >= 4.0 then 1.1::numeric
            else 1::numeric
          end
        )
      ) as similarity_score
    from public.rating_history as neighbor
    join current_user_likes using (movie_id)
    where neighbor.user_id <> auth.uid()
      and coalesce(neighbor.raw_decision, neighbor.status) = 'like'
      and (neighbor.rating is null or neighbor.rating >= 3.5)
    group by neighbor.user_id
  ),
  candidate_movies as (
    select
      neighbor.movie_id,
      sum(
        similar_users.similarity_score *
        case
          when neighbor.rating >= 4.5 then 1.25::numeric
          when neighbor.rating >= 4.0 then 1.1::numeric
          else 1::numeric
        end
      ) as collaborative_score,
      count(distinct neighbor.user_id) as similar_user_count
    from public.rating_history as neighbor
    join similar_users on similar_users.user_id = neighbor.user_id
    where coalesce(neighbor.raw_decision, neighbor.status) = 'like'
      and (neighbor.rating is null or neighbor.rating >= 3.5)
      and not exists (
        select 1
        from public.rating_history as current_user_rating
        where current_user_rating.user_id = auth.uid()
          and current_user_rating.movie_id = neighbor.movie_id
      )
    group by neighbor.movie_id
  )
  select movie_id, collaborative_score, similar_user_count
  from candidate_movies
  order by collaborative_score desc, similar_user_count desc, movie_id
  limit 100;
$$;

revoke all on function public.get_collaborative_recommendation_signals() from public;
grant execute on function public.get_collaborative_recommendation_signals() to authenticated;
