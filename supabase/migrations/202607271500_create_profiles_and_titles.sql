create extension if not exists pgcrypto;

create table if not exists public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  nickname text not null default '영화 친구' check (char_length(trim(nickname)) between 1 and 40),
  avatar_url text null,
  bio text not null default '' check (char_length(bio) <= 160),
  featured_title_id uuid null,
  timezone text not null default 'Asia/Seoul' check (char_length(trim(timezone)) between 1 and 80),
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

alter table public.profiles add column if not exists nickname text;
alter table public.profiles add column if not exists avatar_url text;
alter table public.profiles add column if not exists bio text not null default '';
alter table public.profiles add column if not exists featured_title_id uuid;
alter table public.profiles add column if not exists timezone text not null default 'Asia/Seoul';
alter table public.profiles add column if not exists created_at timestamptz not null default timezone('utc', now());
alter table public.profiles add column if not exists updated_at timestamptz not null default timezone('utc', now());

-- Some earlier profile implementations stored auth UUIDs as text. Normalize those legacy columns
-- before policies/functions compare them with auth.uid() (uuid). community_profiles must be
-- normalized too: its existing update trigger compares its id with community_posts.user_id.
do $$
begin
  if exists (
    select 1
    from information_schema.columns
    where table_schema = 'public'
      and table_name = 'profiles'
      and column_name = 'id'
      and data_type in ('text', 'character varying')
  ) then
    if exists (
      select 1
      from public.profiles
      where id is not null
        and id !~* '^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$'
    ) then
      raise exception 'profiles.id에 UUID 형식이 아닌 값이 있어 자동 변환할 수 없습니다.';
    end if;

    alter table public.profiles
      alter column id type uuid using id::uuid;
  end if;

  if exists (
    select 1
    from information_schema.columns
    where table_schema = 'public'
      and table_name = 'profiles'
      and column_name = 'featured_title_id'
      and data_type in ('text', 'character varying')
  ) then
    alter table public.profiles
      alter column featured_title_id type uuid using nullif(trim(featured_title_id::text), '')::uuid;
  end if;

  if exists (
    select 1
    from information_schema.columns
    where table_schema = 'public'
      and table_name = 'community_profiles'
      and column_name = 'id'
      and data_type in ('text', 'character varying')
  ) then
    if exists (
      select 1
      from public.community_profiles
      where id is not null
        and id !~* '^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$'
    ) then
      raise exception 'community_profiles.id contains a non-UUID value and cannot be migrated safely.';
    end if;

    alter table public.community_profiles
      alter column id type uuid using id::uuid;
  end if;
end;
$$;

create table if not exists public.titles (
  id uuid primary key default gen_random_uuid(),
  code text not null unique,
  name text not null,
  description text not null,
  condition_type text not null,
  condition_target text null,
  condition_value integer not null check (condition_value > 0),
  icon text not null default '🎬',
  is_hidden boolean not null default false,
  created_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.user_titles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  title_id uuid not null references public.titles (id) on delete cascade,
  earned_at timestamptz not null default timezone('utc', now()),
  is_displayed boolean not null default false,
  unique (user_id, title_id)
);

create table if not exists public.profile_display_titles (
  user_id uuid not null references auth.users (id) on delete cascade,
  title_id uuid not null references public.titles (id) on delete cascade,
  display_order smallint not null check (display_order between 1 and 3),
  primary key (user_id, title_id),
  unique (user_id, display_order)
);

-- Server-owned TMDB cache. Browser clients can read it but cannot write it.
create table if not exists public.profile_movie_metadata (
  movie_id text primary key,
  tmdb_movie_id integer not null unique,
  genres text[] not null default '{}',
  director_name text null,
  director_profile_url text null,
  cast_members jsonb not null default '[]'::jsonb,
  production_countries text[] not null default '{}',
  runtime_minutes integer null check (runtime_minutes is null or runtime_minutes >= 0),
  release_year integer null,
  vote_average numeric(4, 2) null,
  updated_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.profile_bingo_completions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  board_id text not null check (board_id in ('taste', 'genre', 'cinema')),
  completed_at timestamptz not null default timezone('utc', now()),
  unique (user_id, board_id)
);

create index if not exists user_titles_user_earned_idx on public.user_titles (user_id, earned_at desc);
create index if not exists profile_display_titles_user_order_idx on public.profile_display_titles (user_id, display_order);
create index if not exists profile_movie_metadata_tmdb_idx on public.profile_movie_metadata (tmdb_movie_id);
create index if not exists profile_bingo_completions_user_idx on public.profile_bingo_completions (user_id, completed_at desc);

do $$
begin
  if not exists (
    select 1 from pg_constraint where conname = 'profiles_featured_title_id_fkey'
  ) then
    alter table public.profiles
      add constraint profiles_featured_title_id_fkey
      foreign key (featured_title_id) references public.titles (id) on delete set null;
  end if;
end;
$$;

insert into public.titles (code, name, description, condition_type, condition_value, icon, is_hidden)
values
  ('daily_answers_3', '영화 대화 입문자', '오늘의 질문에 3번 답변했어요.', 'daily_answer_count', 3, '💬', false),
  ('daily_streak_10', '매일 영화 생각', '오늘의 질문에 10일 연속 답변했어요.', 'daily_answer_streak', 10, '🗓️', false),
  ('daily_streak_30', '영화 기록가', '오늘의 질문에 30일 연속 답변했어요.', 'daily_answer_streak', 30, '📚', false),
  ('bingo_1', '빙고 스타', '영화 빙고판을 1개 완성했어요.', 'bingo_completion_count', 1, '⭐', false),
  ('bingo_5', '영화 빙고 마스터', '영화 빙고판을 5개 완성했어요.', 'bingo_completion_count', 5, '🏆', false),
  ('ratings_10', '취향 발견자', '영화 10편의 상세 평가를 완료했어요.', 'detailed_rating_count', 10, '🔎', false),
  ('ratings_50', '취향 분석가', '영화 50편의 상세 평가를 완료했어요.', 'detailed_rating_count', 50, '🧠', false),
  ('public_lists_5', '영화 큐레이터', '공개 영화 리스트를 5개 만들었어요.', 'public_list_count', 5, '🗂️', false),
  ('distinct_genres_10', '장르 모험가', '서로 다른 장르의 영화를 10개 이상 감상했어요.', 'watched_distinct_genre_count', 10, '🧭', false),
  ('distinct_countries_10', '세계 영화 여행자', '서로 다른 제작 국가의 영화를 10개 이상 감상했어요.', 'watched_distinct_country_count', 10, '🌍', false),
  ('late_night_5', '새벽의 관객', '새벽 시간대에 영화 감상 기록을 5번 남겼어요.', 'late_night_watch_count', 5, '🌙', true),
  ('long_runtime_5', '긴 호흡의 관객', '180분 이상 영화 5편을 감상했어요.', 'long_runtime_watch_count', 5, '🎞️', true)
on conflict (code) do update
set name = excluded.name,
    description = excluded.description,
    condition_type = excluded.condition_type,
    condition_value = excluded.condition_value,
    icon = excluded.icon,
    is_hidden = excluded.is_hidden;

-- Existing community identities become profile identities without asking users to recreate them.
insert into public.profiles (id, nickname, avatar_url)
select
  users.id,
  coalesce(nullif(trim(community.nickname), ''), nullif(trim(users.raw_user_meta_data ->> 'nickname'), ''), nullif(trim(users.raw_user_meta_data ->> 'full_name'), ''), '영화 친구'),
  community.avatar_url
from auth.users as users
-- community_profiles.id was created as text in the existing community feature,
-- while auth.users.id is uuid. Compare their canonical text values so this
-- migration works with either a legacy text or a uuid community id column.
left join public.community_profiles as community on community.id::text = users.id::text
on conflict (id) do update
set nickname = coalesce(nullif(trim(public.profiles.nickname), ''), excluded.nickname),
    avatar_url = coalesce(public.profiles.avatar_url, excluded.avatar_url);

create or replace function public.profile_timezone(p_timezone text)
returns text
language sql
stable
set search_path = public
as $$
  select case
    when exists (select 1 from pg_timezone_names where name = nullif(trim(p_timezone), '')) then trim(p_timezone)
    else 'Asia/Seoul'
  end;
$$;

create or replace function public.set_profile_updated_at()
returns trigger
language plpgsql
set search_path = public
as $$
begin
  new.updated_at = timezone('utc', now());
  new.timezone = public.profile_timezone(new.timezone);
  return new;
end;
$$;

drop trigger if exists set_profiles_updated_at on public.profiles;
create trigger set_profiles_updated_at
before update on public.profiles
for each row execute function public.set_profile_updated_at();

-- Do not allow a profile to point to a title it has not earned.
create or replace function public.validate_profile_featured_title()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if new.featured_title_id is not null and not exists (
    select 1 from public.user_titles
    where user_id = new.id and title_id = new.featured_title_id
  ) then
    raise exception '대표 칭호는 획득한 칭호만 설정할 수 있습니다.';
  end if;

  return new;
end;
$$;

drop trigger if exists validate_profile_featured_title_trigger on public.profiles;
create trigger validate_profile_featured_title_trigger
before insert or update of featured_title_id on public.profiles
for each row execute function public.validate_profile_featured_title();

create or replace function public.validate_profile_display_title()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if not exists (
    select 1 from public.user_titles
    where user_id = new.user_id and title_id = new.title_id
  ) then
    raise exception '프로필에는 획득한 칭호만 전시할 수 있습니다.';
  end if;

  if tg_op = 'INSERT' and (
    select count(*) from public.profile_display_titles where user_id = new.user_id
  ) >= 3 then
    raise exception '프로필 전시 칭호는 최대 3개입니다.';
  end if;

  return new;
end;
$$;

drop trigger if exists validate_profile_display_title_trigger on public.profile_display_titles;
create trigger validate_profile_display_title_trigger
before insert or update on public.profile_display_titles
for each row execute function public.validate_profile_display_title();

-- Keep existing community names and avatars current after the new profile editor saves.
create or replace function public.sync_profile_to_community_profile()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if pg_trigger_depth() > 1 then
    return new;
  end if;

  insert into public.community_profiles (id, nickname, avatar_url)
  values (new.id, new.nickname, new.avatar_url)
  on conflict (id) do update
  set nickname = excluded.nickname,
      avatar_url = excluded.avatar_url;

  return new;
end;
$$;

create or replace function public.sync_community_profile_to_profile()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if pg_trigger_depth() > 1 then
    return new;
  end if;

  insert into public.profiles (id, nickname, avatar_url)
  values (new.id, new.nickname, new.avatar_url)
  on conflict (id) do update
  set nickname = excluded.nickname,
      avatar_url = excluded.avatar_url;

  return new;
end;
$$;

drop trigger if exists sync_profile_to_community_profile_trigger on public.profiles;
create trigger sync_profile_to_community_profile_trigger
after insert or update of nickname, avatar_url on public.profiles
for each row execute function public.sync_profile_to_community_profile();

drop trigger if exists sync_community_profile_to_profile_trigger on public.community_profiles;
create trigger sync_community_profile_to_profile_trigger
after insert or update of nickname, avatar_url on public.community_profiles
for each row execute function public.sync_community_profile_to_profile();

create or replace function public.create_profile_for_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, nickname, avatar_url)
  values (
    new.id,
    coalesce(nullif(trim(new.raw_user_meta_data ->> 'nickname'), ''), nullif(trim(new.raw_user_meta_data ->> 'full_name'), ''), '영화 친구'),
    nullif(trim(new.raw_user_meta_data ->> 'avatar_url'), '')
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists create_profile_for_new_user_trigger on auth.users;
create trigger create_profile_for_new_user_trigger
after insert on auth.users
for each row execute function public.create_profile_for_new_user();

-- Streaks are calculated by each user's saved IANA timezone. Current and longest values stay distinct.
create or replace function public.profile_daily_question_streaks(p_user_id uuid, p_timezone text)
returns table (current_streak integer, longest_streak integer)
language sql
security definer
set search_path = public
as $$
  with answer_dates as (
    select distinct (created_at at time zone public.profile_timezone(p_timezone))::date as answer_date
    from public.daily_question_answers
    where user_id = p_user_id
  ), grouped as (
    select answer_date, answer_date - row_number() over (order by answer_date)::integer as streak_group
    from answer_dates
  ), streaks as (
    select count(*)::integer as streak_length, max(answer_date) as last_date
    from grouped
    group by streak_group
  )
  select
    coalesce(max(streak_length) filter (where last_date = (now() at time zone public.profile_timezone(p_timezone))::date), 0)::integer,
    coalesce(max(streak_length), 0)::integer
  from streaks;
$$;

-- Common progress primitive used by the safe public title-collection RPC.
create or replace function public.profile_title_progress_value(
  p_user_id uuid,
  p_condition_type text,
  p_condition_target text,
  p_timezone text
)
returns integer
language plpgsql
security definer
set search_path = public
as $$
declare
  v_value integer := 0;
  v_timezone text := public.profile_timezone(p_timezone);
begin
  if p_condition_type = 'daily_answer_count' then
    select count(*) into v_value from public.daily_question_answers where user_id = p_user_id;
  elsif p_condition_type = 'daily_answer_streak' then
    select current_streak into v_value
    from public.profile_daily_question_streaks(p_user_id, v_timezone);
  elsif p_condition_type = 'bingo_completion_count' then
    select count(*) into v_value from public.profile_bingo_completions where user_id = p_user_id;
  elsif p_condition_type = 'detailed_rating_count' then
    select count(*) into v_value from public.ratings where user_id = p_user_id and detail_completed = true;
  elsif p_condition_type = 'public_list_count' then
    select count(*) into v_value from public.user_lists where user_id = p_user_id and is_private = false;
  elsif p_condition_type = 'watched_distinct_genre_count' then
    select count(distinct genre) into v_value
    from public.ratings as rating
    join public.profile_movie_metadata as metadata on metadata.movie_id = rating.movie_id
    cross join lateral unnest(metadata.genres) as genre
    where rating.user_id = p_user_id and rating.status in ('like', 'dislike');
  elsif p_condition_type = 'watched_distinct_country_count' then
    select count(distinct country) into v_value
    from public.ratings as rating
    join public.profile_movie_metadata as metadata on metadata.movie_id = rating.movie_id
    cross join lateral unnest(metadata.production_countries) as country
    where rating.user_id = p_user_id and rating.status in ('like', 'dislike');
  elsif p_condition_type = 'director_watch_count' then
    select count(distinct rating.movie_id) into v_value
    from public.ratings as rating
    join public.profile_movie_metadata as metadata on metadata.movie_id = rating.movie_id
    where rating.user_id = p_user_id
      and rating.status in ('like', 'dislike')
      and metadata.director_name = p_condition_target;
  elsif p_condition_type = 'genre_watch_count' then
    select count(distinct rating.movie_id) into v_value
    from public.ratings as rating
    join public.profile_movie_metadata as metadata on metadata.movie_id = rating.movie_id
    where rating.user_id = p_user_id
      and rating.status in ('like', 'dislike')
      and p_condition_target = any(metadata.genres);
  elsif p_condition_type = 'late_night_watch_count' then
    select count(*) into v_value
    from public.ratings
    where user_id = p_user_id
      and status in ('like', 'dislike')
      and extract(hour from answered_at at time zone v_timezone) between 0 and 4;
  elsif p_condition_type = 'long_runtime_watch_count' then
    select count(distinct rating.movie_id) into v_value
    from public.ratings as rating
    join public.profile_movie_metadata as metadata on metadata.movie_id = rating.movie_id
    where rating.user_id = p_user_id
      and rating.status in ('like', 'dislike')
      and metadata.runtime_minutes >= 180;
  end if;

  return coalesce(v_value, 0);
end;
$$;

create or replace function public.profile_bingo_has_line(p_user_id uuid, p_board_id text)
returns boolean
language plpgsql
security definer
set search_path = public
as $$
declare
  v_action integer := 0; v_comedy integer := 0; v_thriller integer := 0; v_scifi integer := 0;
  v_fantasy integer := 0; v_romance integer := 0; v_horror integer := 0; v_mystery integer := 0;
  v_animation integer := 0; v_drama integer := 0; v_high integer := 0; v_short integer := 0;
  v_long integer := 0; v_classic integer := 0; v_millennium integer := 0; v_recent integer := 0;
  v_likes integer := 0; v_genres integer := 0; v_director integer := 0; v_actor integer := 0;
begin
  with watched as (
    select rating.movie_id, rating.raw_decision, rating.status, rating.favorite_character, metadata.*
    from public.ratings as rating
    join public.profile_movie_metadata as metadata on metadata.movie_id = rating.movie_id
    where rating.user_id = p_user_id and rating.status in ('like', 'dislike')
  )
  select
    count(distinct movie_id) filter (where '액션' = any(genres)),
    count(distinct movie_id) filter (where '코미디' = any(genres)),
    count(distinct movie_id) filter (where '스릴러' = any(genres)),
    count(distinct movie_id) filter (where 'SF' = any(genres)),
    count(distinct movie_id) filter (where '판타지' = any(genres)),
    count(distinct movie_id) filter (where '로맨스' = any(genres)),
    count(distinct movie_id) filter (where '공포' = any(genres)),
    count(distinct movie_id) filter (where '미스터리' = any(genres)),
    count(distinct movie_id) filter (where '애니메이션' = any(genres)),
    count(distinct movie_id) filter (where '드라마' = any(genres)),
    count(distinct movie_id) filter (where vote_average >= 8),
    count(distinct movie_id) filter (where runtime_minutes <= 100),
    count(distinct movie_id) filter (where runtime_minutes >= 135),
    count(distinct movie_id) filter (where release_year <= 1999),
    count(distinct movie_id) filter (where release_year between 2000 and 2009),
    count(distinct movie_id) filter (where release_year >= 2020),
    count(distinct movie_id) filter (where raw_decision = 'like' or status = 'like'),
    count(distinct genre)
  into v_action, v_comedy, v_thriller, v_scifi, v_fantasy, v_romance, v_horror, v_mystery,
       v_animation, v_drama, v_high, v_short, v_long, v_classic, v_millennium, v_recent,
       v_likes, v_genres
  from watched cross join lateral unnest(genres) as genre;

  select coalesce(max(count_value), 0) into v_director
  from (
    select count(distinct rating.movie_id)::integer as count_value
    from public.ratings as rating
    join public.profile_movie_metadata as metadata on metadata.movie_id = rating.movie_id
    where rating.user_id = p_user_id
      and rating.status in ('like', 'dislike')
      and metadata.director_name is not null
    group by metadata.director_name
  ) as director_counts;

  select coalesce(max(count_value), 0) into v_actor
  from (
    select count(distinct rating.movie_id)::integer as count_value
    from public.ratings as rating
    join public.profile_movie_metadata as metadata on metadata.movie_id = rating.movie_id
    cross join lateral jsonb_array_elements(metadata.cast_members) as member
    where rating.user_id = p_user_id
      and rating.status in ('like', 'dislike')
      and rating.favorite_character is not null
      and (rating.favorite_character = member ->> 'name' or rating.favorite_character = member ->> 'character')
    group by member ->> 'name'
  ) as actor_counts;

  if p_board_id = 'genre' then
    return (v_action >= 3 and v_comedy >= 2 and v_thriller >= 2)
      or (v_scifi >= 2 and v_fantasy >= 2 and v_romance >= 2)
      or (v_horror >= 2 and v_mystery >= 2 and v_animation >= 2)
      or (v_action >= 3 and v_scifi >= 2 and v_horror >= 2)
      or (v_comedy >= 2 and v_fantasy >= 2 and v_mystery >= 2)
      or (v_thriller >= 2 and v_romance >= 2 and v_animation >= 2)
      or (v_action >= 3 and v_fantasy >= 2 and v_animation >= 2)
      or (v_thriller >= 2 and v_fantasy >= 2 and v_horror >= 2);
  elsif p_board_id = 'cinema' then
    return (v_actor >= 3 and v_director >= 2 and v_long >= 2)
      or (v_classic >= 2 and v_millennium >= 2 and v_recent >= 3)
      or (v_high >= 3 and v_genres >= 5 and v_likes >= 5)
      or (v_actor >= 3 and v_classic >= 2 and v_high >= 3)
      or (v_director >= 2 and v_millennium >= 2 and v_genres >= 5)
      or (v_long >= 2 and v_recent >= 3 and v_likes >= 5)
      or (v_actor >= 3 and v_millennium >= 2 and v_likes >= 5)
      or (v_long >= 2 and v_millennium >= 2 and v_high >= 3);
  end if;

  return (v_actor >= 3 and v_action >= 3 and v_high >= 3)
    or (v_director >= 2 and v_short >= 2 and v_classic >= 2)
    or (v_animation >= 2 and v_drama >= 2 and v_likes >= 5)
    or (v_actor >= 3 and v_director >= 2 and v_animation >= 2)
    or (v_action >= 3 and v_short >= 2 and v_drama >= 2)
    or (v_high >= 3 and v_classic >= 2 and v_likes >= 5)
    or (v_actor >= 3 and v_short >= 2 and v_likes >= 5)
    or (v_high >= 3 and v_short >= 2 and v_animation >= 2);
end;
$$;

create or replace function public.record_profile_bingo_completion(p_board_id text)
returns boolean
language plpgsql
security definer
set search_path = public
as $$
declare
  v_user_id uuid := auth.uid();
begin
  if v_user_id is null then
    raise exception '로그인이 필요합니다.';
  end if;

  if p_board_id not in ('taste', 'genre', 'cinema') or not public.profile_bingo_has_line(v_user_id, p_board_id) then
    raise exception '서버에서 빙고 완성 조건을 확인하지 못했습니다.';
  end if;

  insert into public.profile_bingo_completions (user_id, board_id)
  values (v_user_id, p_board_id)
  on conflict (user_id, board_id) do nothing;

  return found;
end;
$$;

-- New title awards are only issued here. The client sends an event type, never a title ID.
create or replace function public.issue_titles_for_current_user(p_event_type text)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_user_id uuid := auth.uid();
  v_timezone text := 'Asia/Seoul';
  v_awarded jsonb := '[]'::jsonb;
begin
  if v_user_id is null then
    raise exception '로그인이 필요합니다.';
  end if;

  select public.profile_timezone(timezone) into v_timezone from public.profiles where id = v_user_id;
  v_timezone := coalesce(v_timezone, 'Asia/Seoul');

  if p_event_type = 'watch' then
    -- Dynamic definitions are created from cached, server-owned movie metadata only.
    insert into public.titles (code, name, description, condition_type, condition_target, condition_value, icon)
    select
      'director_explorer:' || md5(metadata.director_name),
      metadata.director_name || ' 탐험가',
      metadata.director_name || ' 감독의 영화 5편을 감상했어요.',
      'director_watch_count', metadata.director_name, 5, '🎬'
    from public.ratings as rating
    join public.profile_movie_metadata as metadata on metadata.movie_id = rating.movie_id
    where rating.user_id = v_user_id and rating.status in ('like', 'dislike') and metadata.director_name is not null
    group by metadata.director_name
    on conflict (code) do nothing;

    insert into public.titles (code, name, description, condition_type, condition_target, condition_value, icon)
    select
      'director_researcher:' || md5(metadata.director_name),
      metadata.director_name || ' 연구가',
      metadata.director_name || ' 감독의 영화 10편을 감상했어요.',
      'director_watch_count', metadata.director_name, 10, '📽️'
    from public.ratings as rating
    join public.profile_movie_metadata as metadata on metadata.movie_id = rating.movie_id
    where rating.user_id = v_user_id and rating.status in ('like', 'dislike') and metadata.director_name is not null
    group by metadata.director_name
    on conflict (code) do nothing;

    insert into public.titles (code, name, description, condition_type, condition_target, condition_value, icon)
    select
      'genre_traveler:' || md5(genre),
      genre || ' 여행자',
      genre || ' 장르 영화 20편을 감상했어요.',
      'genre_watch_count', genre, 20, '🧳'
    from public.ratings as rating
    join public.profile_movie_metadata as metadata on metadata.movie_id = rating.movie_id
    cross join lateral unnest(metadata.genres) as genre
    where rating.user_id = v_user_id and rating.status in ('like', 'dislike')
    group by genre
    on conflict (code) do nothing;
  end if;

  with candidates as (
    select title.*
    from public.titles as title
    where (
      p_event_type = 'daily_question' and title.condition_type in ('daily_answer_count', 'daily_answer_streak')
    ) or (
      p_event_type = 'rating' and title.condition_type = 'detailed_rating_count'
    ) or (
      p_event_type = 'watch' and title.condition_type in (
        'watched_distinct_genre_count', 'watched_distinct_country_count', 'director_watch_count',
        'genre_watch_count', 'late_night_watch_count', 'long_runtime_watch_count'
      )
    ) or (
      p_event_type = 'bingo' and title.condition_type = 'bingo_completion_count'
    ) or (
      p_event_type = 'list' and title.condition_type = 'public_list_count'
    )
  ), inserted as (
    insert into public.user_titles (user_id, title_id)
    select v_user_id, candidate.id
    from candidates as candidate
    where public.profile_title_progress_value(
      v_user_id, candidate.condition_type, candidate.condition_target, v_timezone
    ) >= candidate.condition_value
    on conflict (user_id, title_id) do nothing
    returning title_id, earned_at
  )
  select coalesce(jsonb_agg(jsonb_build_object(
    'id', title.id,
    'code', title.code,
    'name', title.name,
    'description', title.description,
    'icon', title.icon,
    'earnedAt', inserted.earned_at
  )), '[]'::jsonb)
  into v_awarded
  from inserted
  join public.titles as title on title.id = inserted.title_id;

  return v_awarded;
end;
$$;

create or replace function public.set_profile_title_presentation(
  p_featured_title_id uuid,
  p_display_title_ids uuid[] default '{}'
)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_user_id uuid := auth.uid();
  v_displayed uuid[] := coalesce(p_display_title_ids, '{}');
begin
  if v_user_id is null then
    raise exception '로그인이 필요합니다.';
  end if;

  if cardinality(v_displayed) > 3 or cardinality(v_displayed) <> (
    select count(distinct value) from unnest(v_displayed) as value
  ) then
    raise exception '프로필 전시 칭호는 중복 없이 최대 3개입니다.';
  end if;

  if p_featured_title_id is not null and not exists (
    select 1 from public.user_titles where user_id = v_user_id and title_id = p_featured_title_id
  ) then
    raise exception '대표 칭호는 획득한 칭호만 설정할 수 있습니다.';
  end if;

  if exists (
    select 1 from unnest(v_displayed) as requested(title_id)
    where not exists (
      select 1 from public.user_titles where user_id = v_user_id and title_id = requested.title_id
    )
  ) then
    raise exception '프로필에는 획득한 칭호만 전시할 수 있습니다.';
  end if;

  delete from public.profile_display_titles where user_id = v_user_id;

  insert into public.profile_display_titles (user_id, title_id, display_order)
  select v_user_id, requested.title_id, requested.display_order::smallint
  from unnest(v_displayed) with ordinality as requested(title_id, display_order);

  update public.user_titles set is_displayed = false where user_id = v_user_id;
  update public.user_titles set is_displayed = true
  where user_id = v_user_id and title_id = any(v_displayed);

  update public.profiles set featured_title_id = p_featured_title_id where id = v_user_id;
end;
$$;

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

create or replace function public.get_profile_titles(p_user_id uuid)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_timezone text := 'Asia/Seoul';
begin
  select public.profile_timezone(timezone) into v_timezone from public.profiles where id = p_user_id;
  v_timezone := coalesce(v_timezone, 'Asia/Seoul');

  return coalesce((
    select jsonb_agg(jsonb_build_object(
      'id', title.id,
      'code', title.code,
      'name', case when title.is_hidden and user_title.id is null then null else title.name end,
      'description', case when title.is_hidden and user_title.id is null then null else title.description end,
      'conditionType', title.condition_type,
      'conditionTarget', case when title.is_hidden and user_title.id is null then null else title.condition_target end,
      'conditionValue', case when title.is_hidden and user_title.id is null then null else title.condition_value end,
      'icon', case when title.is_hidden and user_title.id is null then '❔' else title.icon end,
      'isHidden', title.is_hidden,
      'isEarned', user_title.id is not null,
      'earnedAt', user_title.earned_at,
      'isDisplayed', display.title_id is not null,
      'isFeatured', profile.featured_title_id = title.id,
      'progress', case when title.is_hidden and user_title.id is null then 0 else least(
        public.profile_title_progress_value(p_user_id, title.condition_type, title.condition_target, v_timezone), title.condition_value
      ) end
    ) order by (user_title.id is not null) desc, title.is_hidden asc, title.created_at asc)
    from public.titles as title
    cross join public.profiles as profile
    left join public.user_titles as user_title on user_title.user_id = p_user_id and user_title.title_id = title.id
    left join public.profile_display_titles as display on display.user_id = p_user_id and display.title_id = title.id
    where profile.id = p_user_id
      and (
        title.condition_type not in ('director_watch_count', 'genre_watch_count')
        or user_title.id is not null
        or public.profile_title_progress_value(p_user_id, title.condition_type, title.condition_target, v_timezone) > 0
      )
  ), '[]'::jsonb);
end;
$$;

alter table public.profiles enable row level security;
alter table public.titles enable row level security;
alter table public.user_titles enable row level security;
alter table public.profile_display_titles enable row level security;
alter table public.profile_movie_metadata enable row level security;
alter table public.profile_bingo_completions enable row level security;

drop policy if exists "Profiles are public" on public.profiles;
drop policy if exists "Users create own profile" on public.profiles;
drop policy if exists "Users update own profile" on public.profiles;
drop policy if exists "Visible title definitions are public" on public.titles;
drop policy if exists "Earned titles are public" on public.user_titles;
drop policy if exists "Profile display titles are public" on public.profile_display_titles;
drop policy if exists "Users manage own display title rows" on public.profile_display_titles;
drop policy if exists "Profile movie metadata is public" on public.profile_movie_metadata;
drop policy if exists "Users read own bingo completions" on public.profile_bingo_completions;

create policy "Profiles are public" on public.profiles for select to public using (true);
create policy "Users create own profile" on public.profiles for insert to authenticated with check (auth.uid() = id);
create policy "Users update own profile" on public.profiles for update to authenticated using (auth.uid() = id) with check (auth.uid() = id);
create policy "Visible title definitions are public" on public.titles for select to public using (is_hidden = false);
create policy "Earned titles are public" on public.user_titles for select to public using (true);
create policy "Profile display titles are public" on public.profile_display_titles for select to public using (true);
create policy "Users manage own display title rows" on public.profile_display_titles for all to authenticated using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "Profile movie metadata is public" on public.profile_movie_metadata for select to public using (true);
create policy "Users read own bingo completions" on public.profile_bingo_completions for select to authenticated using (auth.uid() = user_id);

grant execute on function public.get_profile_overview(uuid) to anon, authenticated;
grant execute on function public.get_profile_titles(uuid) to anon, authenticated;
grant execute on function public.set_profile_title_presentation(uuid, uuid[]) to authenticated;
grant execute on function public.record_profile_bingo_completion(text) to authenticated;
grant execute on function public.issue_titles_for_current_user(text) to authenticated;

-- Public avatar bucket. Objects must live under <auth.uid()>/<timestamp>.<extension>.
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('avatars', 'avatars', true, 5242880, array['image/jpeg', 'image/png', 'image/webp', 'image/gif'])
on conflict (id) do update
set public = true,
    file_size_limit = excluded.file_size_limit,
    allowed_mime_types = excluded.allowed_mime_types;

drop policy if exists "Avatar images are public" on storage.objects;
drop policy if exists "Users upload own avatar images" on storage.objects;
drop policy if exists "Users update own avatar images" on storage.objects;
drop policy if exists "Users delete own avatar images" on storage.objects;

create policy "Avatar images are public" on storage.objects for select to public using (bucket_id = 'avatars');
create policy "Users upload own avatar images" on storage.objects for insert to authenticated
with check (bucket_id = 'avatars' and (storage.foldername(name))[1] = auth.uid()::text);
create policy "Users update own avatar images" on storage.objects for update to authenticated
using (bucket_id = 'avatars' and (storage.foldername(name))[1] = auth.uid()::text)
with check (bucket_id = 'avatars' and (storage.foldername(name))[1] = auth.uid()::text);
create policy "Users delete own avatar images" on storage.objects for delete to authenticated
using (bucket_id = 'avatars' and (storage.foldername(name))[1] = auth.uid()::text);
