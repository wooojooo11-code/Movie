-- Recommend community posts using only aggregate preference signals.
-- Individual ratings from other users never leave this security-definer function.

create table if not exists public.community_post_views (
  user_id uuid not null references auth.users (id) on delete cascade,
  post_id uuid not null references public.community_posts (id) on delete cascade,
  first_viewed_at timestamptz not null default timezone('utc', now()),
  last_viewed_at timestamptz not null default timezone('utc', now()),
  primary key (user_id, post_id)
);

create index if not exists community_post_views_user_last_viewed_idx
on public.community_post_views (user_id, last_viewed_at desc);

alter table public.community_post_views enable row level security;

drop policy if exists "Users read own community post views" on public.community_post_views;
create policy "Users read own community post views"
on public.community_post_views for select to authenticated
using (auth.uid() = user_id);

drop policy if exists "Users create own community post views" on public.community_post_views;
create policy "Users create own community post views"
on public.community_post_views for insert to authenticated
with check (auth.uid() = user_id);

drop policy if exists "Users update own community post views" on public.community_post_views;
create policy "Users update own community post views"
on public.community_post_views for update to authenticated
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

create index if not exists community_post_movies_movie_id_post_idx
on public.community_post_movies (movie_id, post_id);

create or replace function public.get_personalized_community_post_recommendations(
  p_limit integer default 6
)
returns table (
  post_id uuid,
  recommendation_score numeric,
  unseen_movie_count bigint,
  taste_match_movie_count bigint,
  author_similarity_score numeric,
  author_overlap_count bigint
)
language sql
stable
security definer
set search_path = public
as $$
  with rating_preferences as (
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
  library_preferences as (
    select library.user_id, library.movie_id, 1 as preference
    from public.movie_library_items as library
    where not exists (
      select 1
      from rating_preferences as rated
      where rated.user_id = library.user_id
        and rated.movie_id = library.movie_id
    )
  ),
  user_movie_preferences as (
    select * from rating_preferences where preference <> 0
    union all
    select * from library_preferences
  ),
  current_user_preferences as (
    select preference.movie_id, preference.preference
    from user_movie_preferences as preference
    where preference.user_id = auth.uid()
  ),
  current_seen_movies as (
    select history.movie_id
    from public.rating_history as history
    where history.user_id = auth.uid()
      and coalesce(history.raw_decision, history.status) <> 'not_seen'
  ),
  similar_users as (
    select
      neighbor.user_id,
      greatest(
        0,
        least(
          100,
          50 + 50 * avg((neighbor.preference * current.preference)::numeric)
        )
      )::numeric as similarity_score,
      count(*)::bigint as overlap_count
    from user_movie_preferences as neighbor
    join current_user_preferences as current using (movie_id)
    where neighbor.user_id <> auth.uid()
    group by neighbor.user_id
  ),
  collaborative_movies as (
    select
      neighbor.movie_id,
      least(
        100,
        avg(similar.similarity_score) + least((count(distinct neighbor.user_id) - 1) * 4, 16)
      )::numeric as collaborative_score
    from user_movie_preferences as neighbor
    join similar_users as similar on similar.user_id = neighbor.user_id
    where neighbor.preference = 1
      and similar.similarity_score >= 65
      and similar.overlap_count >= 2
      and not exists (
        select 1
        from current_seen_movies as seen
        where seen.movie_id = neighbor.movie_id
      )
    group by neighbor.movie_id
  ),
  post_movie_references as (
    select post_movie.post_id, post_movie.movie_id
    from public.community_post_movies as post_movie

    union

    select post.id, post.movie_id
    from public.community_posts as post
    where post.movie_id is not null

    union

    select post.id, list_movie.movie_id
    from public.community_posts as post
    join public.user_lists as movie_list on movie_list.id = post.list_id
    cross join lateral unnest(movie_list.movie_ids) as list_movie(movie_id)

    union

    select poll.post_id, option.movie_id
    from public.community_polls as poll
    join public.community_poll_options as option on option.poll_id = poll.id
    where option.movie_id is not null
  )
  select
    post.id as post_id,
    round(
      (
        count(distinct reference.movie_id) filter (where seen.movie_id is null) * 8
        + coalesce(max(collaborative.collaborative_score), 0) * 0.55
        + greatest(coalesce(max(author_similarity.similarity_score), 0) - 50, 0) * 0.3
        + least(post.like_count * 1.2 + post.save_count * 1.8 + post.comment_count, 18)
        + greatest(
            0,
            14 - extract(epoch from (now() - post.created_at)) / 86400
          ) * 0.35
      )::numeric,
      2
    ) as recommendation_score,
    count(distinct reference.movie_id) filter (where seen.movie_id is null) as unseen_movie_count,
    count(distinct reference.movie_id) filter (
      where seen.movie_id is null and collaborative.movie_id is not null
    ) as taste_match_movie_count,
    coalesce(max(author_similarity.similarity_score), 0)::numeric as author_similarity_score,
    coalesce(max(author_similarity.overlap_count), 0)::bigint as author_overlap_count
  from public.community_posts as post
  join post_movie_references as reference on reference.post_id = post.id
  left join current_seen_movies as seen on seen.movie_id = reference.movie_id
  left join collaborative_movies as collaborative on collaborative.movie_id = reference.movie_id
  left join similar_users as author_similarity on author_similarity.user_id = post.user_id
  where auth.uid() is not null
    and post.user_id <> auth.uid()
    and post.category not in ('daily_question', 'mission_proof')
    and not exists (
      select 1
      from public.community_post_views as viewed
      where viewed.post_id = post.id
        and viewed.user_id = auth.uid()
    )
    and not exists (
      select 1
      from public.community_saves as saved
      where saved.post_id = post.id
        and saved.user_id = auth.uid()
    )
  group by post.id, post.like_count, post.save_count, post.comment_count, post.created_at
  order by recommendation_score desc, post.created_at desc
  limit least(greatest(coalesce(p_limit, 6), 1), 12);
$$;

revoke all on function public.get_personalized_community_post_recommendations(integer) from public;
grant execute on function public.get_personalized_community_post_recommendations(integer) to authenticated;
