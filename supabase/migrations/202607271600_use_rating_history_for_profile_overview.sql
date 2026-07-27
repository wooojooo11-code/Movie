-- Profile taste must survive a taste-analysis reset. The reset clears public.ratings,
-- while public.rating_history retains each user's saved evaluations.
create or replace function public.get_profile_overview(p_user_id uuid)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_profile public.profiles%rowtype;
  v_featured jsonb := null;
  v_displayed jsonb := '[]'::jsonb;
  v_genres jsonb := '[]'::jsonb;
  v_director jsonb := null;
  v_actor jsonb := null;
  v_keywords jsonb := '[]'::jsonb;
  v_watched_count integer := 0;
begin
  select * into v_profile from public.profiles where id = p_user_id;
  if not found then
    return null;
  end if;

  select count(distinct movie_id) into v_watched_count
  from public.rating_history where user_id = p_user_id and status in ('like', 'dislike');

  select jsonb_build_object('id', title.id, 'name', title.name, 'icon', title.icon, 'description', title.description)
  into v_featured
  from public.user_titles as user_title
  join public.titles as title on title.id = user_title.title_id
  where user_title.user_id = p_user_id and user_title.title_id = v_profile.featured_title_id;

  select coalesce(jsonb_agg(jsonb_build_object('id', title.id, 'name', title.name, 'icon', title.icon, 'description', title.description) order by display.display_order), '[]'::jsonb)
  into v_displayed
  from public.profile_display_titles as display
  join public.titles as title on title.id = display.title_id
  where display.user_id = p_user_id;

  with ranked as (
    select genre, count(distinct rating.movie_id)::integer as count
    from public.rating_history as rating
    join public.profile_movie_metadata as metadata on metadata.movie_id = rating.movie_id
    cross join lateral unnest(metadata.genres) as genre
    where rating.user_id = p_user_id and rating.status in ('like', 'dislike')
    group by genre
    order by count desc, genre asc
    limit 3
  )
  select coalesce(jsonb_agg(jsonb_build_object(
    'name', genre,
    'count', count,
    'percentage', case when v_watched_count = 0 then 0 else round((count::numeric / v_watched_count) * 100) end
  )), '[]'::jsonb) into v_genres from ranked;

  with ranked as (
    select metadata.director_name as name, metadata.director_profile_url as profile_url,
      count(distinct rating.movie_id)::integer as count, max(rating.answered_at) as last_watched_at
    from public.rating_history as rating
    join public.profile_movie_metadata as metadata on metadata.movie_id = rating.movie_id
    where rating.user_id = p_user_id and rating.status in ('like', 'dislike') and metadata.director_name is not null
    group by metadata.director_name, metadata.director_profile_url
    order by count desc, last_watched_at desc
    limit 1
  )
  select jsonb_build_object('name', name, 'profileUrl', profile_url, 'count', count) into v_director from ranked;

  with ranked as (
    select member ->> 'name' as name, member ->> 'profile_url' as profile_url,
      count(distinct rating.movie_id)::integer as count, max(rating.answered_at) as last_watched_at
    from public.rating_history as rating
    join public.profile_movie_metadata as metadata on metadata.movie_id = rating.movie_id
    cross join lateral jsonb_array_elements(metadata.cast_members) as member
    where rating.user_id = p_user_id and rating.status in ('like', 'dislike')
    group by member ->> 'name', member ->> 'profile_url'
    order by count desc, last_watched_at desc
    limit 1
  )
  select jsonb_build_object('name', name, 'profileUrl', profile_url, 'count', count) into v_actor from ranked;

  with ranked as (
    select tag, count(*)::integer as count
    from public.rating_history as rating
    cross join lateral unnest(rating.review_tags) as tag
    where rating.user_id = p_user_id and cardinality(rating.review_tags) > 0
    group by tag
    order by count desc, tag asc
    limit 5
  )
  select coalesce(jsonb_agg(jsonb_build_object('name', tag, 'count', count)), '[]'::jsonb)
  into v_keywords from ranked;

  return jsonb_build_object(
    'profile', jsonb_build_object(
      'id', v_profile.id,
      'nickname', v_profile.nickname,
      'avatarUrl', v_profile.avatar_url,
      'bio', v_profile.bio,
      'createdAt', v_profile.created_at,
      'updatedAt', v_profile.updated_at
    ),
    'featuredTitle', v_featured,
    'displayTitles', v_displayed,
    'taste', jsonb_build_object(
      'watchedCount', v_watched_count,
      'topGenres', v_genres,
      'favoriteDirector', v_director,
      'favoriteActor', v_actor,
      'topKeywords', v_keywords
    )
  );
end;
$$;

grant execute on function public.get_profile_overview(uuid) to anon, authenticated;
